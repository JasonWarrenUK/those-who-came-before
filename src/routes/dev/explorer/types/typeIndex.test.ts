/// <reference lib="deno.ns" />
import { assertEquals } from '@std/assert';
import { parseTypeModule } from './typeIndex.ts';

/**
 * Fixture sources are inline template literals rather than `tests/fixtures/` modules: the parser's
 * input IS source text, so a fixture file would have to export strings anyway, and keeping them
 * beside the assertions makes each case self-describing.
 */

const INTERFACE_MODULE = `/**
 * Widget type definitions (doc 99 §1).
 *
 * Second paragraph that the module summary must not include.
 */

import type { MaterialTag } from './tags.ts';

/**
 * A widget. Second sentence that the declaration summary must not include.
 */
export interface Widget {
	/** Stable identifier, e.g. material composition keys. */
	readonly id: string;

	/** Weights per material. */
	weights: Map<MaterialTag, number>;

	notes?: string;
}

/** Internal helper shape. */
interface Hidden {
	secret: string;
}

export interface NamedWidget extends Widget {
	displayName: string;
}
`;

Deno.test('parseTypeModule: module summary is the first paragraph of the module JSDoc', () => {
	const parsed = parseTypeModule('widget.ts', INTERFACE_MODULE);
	assertEquals(parsed.fileName, 'widget.ts');
	assertEquals(parsed.summary, 'Widget type definitions (doc 99 §1).');
});

Deno.test('parseTypeModule: exported interface carries name, summary and fields', () => {
	const parsed = parseTypeModule('widget.ts', INTERFACE_MODULE);
	const widget = parsed.declarations[0];
	assertEquals(widget.kind, 'interface');
	assertEquals(widget.name, 'Widget');
	assertEquals(widget.summary, 'A widget.');

	if (widget.kind !== 'interface') throw new Error('expected interface');
	assertEquals(widget.fields, [
		{
			name: 'id',
			optional: false,
			readonly: true,
			typeText: 'string',
			// The "e.g." abbreviation must not truncate the sentence.
			summary: 'Stable identifier, e.g. material composition keys.',
		},
		{
			name: 'weights',
			optional: false,
			readonly: false,
			typeText: 'Map<MaterialTag, number>',
			summary: 'Weights per material.',
		},
		{ name: 'notes', optional: true, readonly: false, typeText: 'string', summary: '' },
	]);
});

Deno.test('parseTypeModule: non-exported declarations are skipped', () => {
	const parsed = parseTypeModule('widget.ts', INTERFACE_MODULE);
	assertEquals(parsed.declarations.map((declaration) => declaration.name), [
		'Widget',
		'NamedWidget',
	]);
});

Deno.test('parseTypeModule: extends clause names are captured', () => {
	const parsed = parseTypeModule('widget.ts', INTERFACE_MODULE);
	const named = parsed.declarations[1];
	if (named.kind !== 'interface') throw new Error('expected interface');
	assertEquals(named.extends, ['Widget']);
});

const ALIAS_MODULE = `/**
 * Alias fixtures.
 */

/** Kinds of widget. */
export type WidgetKind =
	| 'plain' // trailing comments must not leak into members
	| 'fancy'
	| 'baroque';

/** Recursive serialisation rule. */
export type Wrapped<T> = T extends Map<infer K, infer V> ? [K, V][]
	: T extends object ? { [P in keyof T]: Wrapped<T[P]> }
	: T;

/** Mixed union: not string-literal-only, so no members list. */
export type Loose = 'named' | number;
`;

Deno.test('parseTypeModule: string-literal union aliases list their members', () => {
	const parsed = parseTypeModule('alias.ts', ALIAS_MODULE);
	const kind = parsed.declarations[0];
	if (kind.kind !== 'alias') throw new Error('expected alias');
	assertEquals(kind.unionMembers, ['plain', 'fancy', 'baroque']);
});

Deno.test('parseTypeModule: non-union aliases fall back to their raw type text', () => {
	const parsed = parseTypeModule('alias.ts', ALIAS_MODULE);
	const wrapped = parsed.declarations[1];
	if (wrapped.kind !== 'alias') throw new Error('expected alias');
	assertEquals(wrapped.unionMembers, null);
	assertEquals(wrapped.typeText.startsWith('T extends Map<infer K, infer V>'), true);

	const loose = parsed.declarations[2];
	if (loose.kind !== 'alias') throw new Error('expected alias');
	assertEquals(loose.unionMembers, null);
	assertEquals(loose.typeText, `'named' | number`);
});

const OTHER_EXPORTS_MODULE = `/**
 * Vocabulary module in the visibility.ts style: one alias plus runtime helpers.
 */

/** The vocabulary. */
export type Level = 'low' | 'high';

/** All values, in doc order. */
export const LEVEL_VALUES: readonly Level[] = ['low', 'high'];

/** Narrows an arbitrary string. */
export function isLevel(value: string): value is Level {
	return (LEVEL_VALUES as readonly string[]).includes(value);
}

const internal = 'not exported';
`;

Deno.test('parseTypeModule: exported consts and functions land in otherExports only', () => {
	const parsed = parseTypeModule('level.ts', OTHER_EXPORTS_MODULE);
	assertEquals(parsed.declarations.map((declaration) => declaration.name), ['Level']);
	assertEquals(parsed.otherExports, ['LEVEL_VALUES', 'isLevel']);
});

Deno.test('parseTypeModule: references are raw type identifiers, deduplicated, self excluded', () => {
	const parsed = parseTypeModule('widget.ts', INTERFACE_MODULE);
	const widget = parsed.declarations[0];
	// Raw means built-ins like Map are included — filtering against the registry is the caller's job.
	assertEquals(widget.references, ['Map', 'MaterialTag']);

	const named = parsed.declarations[1];
	// The extends clause contributes a reference; the declaration's own name never appears.
	assertEquals(named.references, ['Widget']);
});

Deno.test('parseTypeModule: alias references come from the aliased type, recursion excluded', () => {
	const parsed = parseTypeModule('alias.ts', ALIAS_MODULE);
	const wrapped = parsed.declarations[1];
	// Wrapped<T> references itself recursively; the self-reference is excluded. Its type
	// parameter and the infer/mapped-type locals (T, K, V, P) all surface as raw references —
	// first-appearance order — and are later dropped by registry filtering alongside Map.
	assertEquals(wrapped.references, ['T', 'Map', 'K', 'V', 'P']);
});

Deno.test('parseTypeModule: relative imports are captured as sibling module names', () => {
	const parsed = parseTypeModule('widget.ts', INTERFACE_MODULE);
	assertEquals(parsed.imports, ['tags.ts']);

	const noImports = parseTypeModule('alias.ts', ALIAS_MODULE);
	assertEquals(noImports.imports, []);
});

Deno.test('parseTypeModule: a lone JSDoc above the first declaration is not a module summary', () => {
	const source = `/** Doc belonging to the declaration, not the module. */
export interface Solo {
	id: string;
}
`;
	const parsed = parseTypeModule('solo.ts', source);
	assertEquals(parsed.summary, '');
	assertEquals(parsed.declarations[0].summary, 'Doc belonging to the declaration, not the module.');
});
