/**
 * Type-module parser behind the Type Index panel (roadmap 1FD.39).
 *
 * Parses a `src/lib/types/` module's raw source with the TypeScript compiler API (parse-only, no
 * type checking — `ts.createSourceFile`, never a `Program`) and reduces it to the summary shapes
 * the panel renders: exported interfaces with their fields, exported type aliases with their union
 * members or aliased text, and the names of any other exports. Regex parsing was rejected because
 * the type modules contain shapes it cannot survive — `save.ts`'s recursive conditional
 * `Serialised<T>`, fields wrapped across lines by deno fmt.
 *
 * Route-private dev tooling, not engine code: nothing outside `/dev/explorer/types` should import
 * this. Runs server-side only (see `+page.server.ts`), so the multi-megabyte `typescript` module
 * never reaches the client bundle.
 */

import ts from 'typescript';

/** One property of an exported interface, as the panel's field table renders it. */
export interface TypeFieldSummary {
	name: string;

	/** Whether the property carries a `?` token. */
	optional: boolean;

	/** Whether the property carries a `readonly` modifier. */
	readonly: boolean;

	/** The type annotation exactly as written in source (multi-line annotations preserved). */
	typeText: string;

	/** First sentence of the field's JSDoc, empty when the field has none. */
	summary: string;
}

/** An exported `interface` declaration. */
export interface InterfaceSummary {
	kind: 'interface';
	name: string;

	/** First sentence of the declaration's JSDoc, empty when it has none. */
	summary: string;

	/** Names in the `extends` clause, empty for the common no-heritage case. */
	extends: string[];

	fields: TypeFieldSummary[];
}

/** An exported `type` alias declaration. */
export interface AliasSummary {
	kind: 'alias';
	name: string;

	/** First sentence of the declaration's JSDoc, empty when it has none. */
	summary: string;

	/**
	 * The literal texts of a string-literal union's members (the dominant alias shape in
	 * `src/lib/types/` — `FunctionTag`, `DisseminationState`, …), or `null` when the alias is
	 * anything else and `typeText` should be rendered instead.
	 */
	unionMembers: string[] | null;

	/** The aliased type exactly as written in source. */
	typeText: string;
}

export type TypeDeclarationSummary = InterfaceSummary | AliasSummary;

/** Everything the panel shows for one `src/lib/types/` module. */
export interface TypeModuleIndex {
	/** Base file name, e.g. `world.ts`. */
	fileName: string;

	/** First paragraph of the module-level JSDoc, empty when the module has none. */
	summary: string;

	/** Exported interfaces and type aliases, in source order. */
	declarations: TypeDeclarationSummary[];

	/** Names of exported consts and functions (e.g. `PROPERTY_VISIBILITY_VALUES`, `termStartWeek`). */
	otherExports: string[];
}

/** Collapses JSDoc comment text to its first sentence. */
function firstSentence(text: string): string {
	const trimmed = text.trim();
	// A sentence boundary is punctuation followed by whitespace and an opening capital/backtick/
	// bracket — plain `. ` alone would cut inside "e.g. material" and similar abbreviations.
	const boundary = trimmed.match(/[.!?](?=\s+[A-Z`("'[])/);
	if (boundary?.index === undefined) return trimmed;
	return trimmed.slice(0, boundary.index + 1);
}

/** Strips the open/close fencing and per-line `*` gutters from a raw JSDoc block comment. */
function stripBlockComment(raw: string): string {
	return raw
		.replace(/^\/\*\*?/, '')
		.replace(/\*\/$/, '')
		.split('\n')
		.map((line) => line.replace(/^\s*\*\s?/, ''))
		.join('\n')
		.trim();
}

/**
 * First sentence of the JSDoc block immediately preceding a declaration. Deliberately takes the
 * LAST attached block: when a module JSDoc opens the file, TypeScript attaches it to the first
 * statement alongside that statement's own doc, and only the nearest block belongs to the
 * declaration itself.
 */
function declarationSummary(node: ts.Node): string {
	const docs = (node as { jsDoc?: ts.JSDoc[] }).jsDoc;
	const nearest = docs?.[docs.length - 1];
	if (!nearest) return '';
	const text = ts.getTextOfJSDocComment(nearest.comment) ?? '';
	return firstSentence(text);
}

/**
 * First paragraph of the module-level JSDoc: the block comment that opens the file, provided the
 * file doesn't start with a declaration that owns it as its only doc block (in which case there is
 * no module doc to report).
 */
function moduleSummary(sourceFile: ts.SourceFile, source: string): string {
	const first = sourceFile.statements[0];
	if (!first) return '';

	const ranges = ts.getLeadingCommentRanges(source, first.getFullStart()) ?? [];
	const blocks = ranges.filter((range) =>
		range.kind === ts.SyntaxKind.MultiLineCommentTrivia &&
		source.startsWith('/**', range.pos)
	);
	if (blocks.length === 0) return '';

	// A single block directly above a documented declaration is that declaration's doc, not the
	// module's. Imports can't carry JSDoc, so a lone block above one is genuinely module-level.
	const attachedDocs = (first as { jsDoc?: ts.JSDoc[] }).jsDoc ?? [];
	if (blocks.length === 1 && attachedDocs.length === 1 && !ts.isImportDeclaration(first)) {
		return '';
	}

	const text = stripBlockComment(source.slice(blocks[0].pos, blocks[0].end));
	return text.split(/\n\s*\n/)[0].trim();
}

function isExported(node: ts.Statement): boolean {
	return ts.canHaveModifiers(node) &&
		(ts.getModifiers(node) ?? []).some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword);
}

function parseInterface(
	node: ts.InterfaceDeclaration,
	sourceFile: ts.SourceFile,
): InterfaceSummary {
	const heritage = (node.heritageClauses ?? [])
		.filter((clause) => clause.token === ts.SyntaxKind.ExtendsKeyword)
		.flatMap((clause) => clause.types.map((type) => type.getText(sourceFile)));

	const fields = node.members.filter(ts.isPropertySignature).map((member): TypeFieldSummary => ({
		name: member.name.getText(sourceFile),
		optional: member.questionToken !== undefined,
		readonly: (member.modifiers ?? []).some(
			(modifier) => modifier.kind === ts.SyntaxKind.ReadonlyKeyword,
		),
		typeText: member.type?.getText(sourceFile) ?? 'unknown',
		summary: declarationSummary(member),
	}));

	return {
		kind: 'interface',
		name: node.name.text,
		summary: declarationSummary(node),
		extends: heritage,
		fields,
	};
}

function parseAlias(node: ts.TypeAliasDeclaration, sourceFile: ts.SourceFile): AliasSummary {
	let unionMembers: string[] | null = null;

	if (ts.isUnionTypeNode(node.type)) {
		const literals = node.type.types.map((member) =>
			ts.isLiteralTypeNode(member) && ts.isStringLiteral(member.literal)
				? member.literal.text
				: null
		);
		if (literals.every((literal) => literal !== null)) {
			unionMembers = literals;
		}
	}

	return {
		kind: 'alias',
		name: node.name.text,
		summary: declarationSummary(node),
		unionMembers,
		typeText: node.type.getText(sourceFile),
	};
}

/**
 * Parses one type module's raw source into the panel's summary shape. Only exported declarations
 * are reported; source order is preserved.
 */
export function parseTypeModule(fileName: string, source: string): TypeModuleIndex {
	const sourceFile = ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, true);

	const declarations: TypeDeclarationSummary[] = [];
	const otherExports: string[] = [];

	for (const statement of sourceFile.statements) {
		if (ts.isInterfaceDeclaration(statement) && isExported(statement)) {
			declarations.push(parseInterface(statement, sourceFile));
		} else if (ts.isTypeAliasDeclaration(statement) && isExported(statement)) {
			declarations.push(parseAlias(statement, sourceFile));
		} else if (ts.isVariableStatement(statement) && isExported(statement)) {
			for (const declaration of statement.declarationList.declarations) {
				otherExports.push(declaration.name.getText(sourceFile));
			}
		} else if (ts.isFunctionDeclaration(statement) && isExported(statement) && statement.name) {
			otherExports.push(statement.name.text);
		}
	}

	return {
		fileName,
		summary: moduleSummary(sourceFile, source),
		declarations,
		otherExports,
	};
}
