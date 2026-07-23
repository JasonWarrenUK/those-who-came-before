/// <reference lib="deno.ns" />
/**
 * Shared plumbing for the Milestone 2 sampling scripts (`scripts/dev/sample-*.ts`).
 *
 * These are developer-facing CLI samplers for eyeballing what the generation pipeline actually
 * produces — the throwaway precursor to the Project Explorer (`/dev/explorer`, roadmap 2GN.57+),
 * which is the real workbench once UI milestones land. Each script drives the engine exactly the
 * way the tests do: against the mock world fixtures (`tests/fixtures/`), because Milestone 2 runs
 * the pipeline against fixture worlds by design (real world state is Milestone 3, roadmap 3WS.x).
 *
 * Output philosophy: legibility over completeness. Components get short ids (`c0`) and prose
 * parameter fragments; the attachment graph renders as an anatomy tree so the object's shape is
 * visible at a glance; loose (unattached) parts are flagged explicitly. `--json` is the escape
 * hatch for the full raw data.
 *
 * Everything here is pure engine plumbing: no framework imports, no permissions needed —
 * `deno run scripts/dev/sample-*.ts` works bare.
 */

import { createPrng } from '../../src/lib/engine/prng.ts';
import { expandGrammar, normaliseArtefact } from '../../src/lib/engine/generation/grammar.ts';
import { CORE_GRAMMAR_RULES } from '../../src/lib/data/grammars/core.ts';
import { mockCulturalProfile, mockPhaseCharacteristics } from '../../tests/fixtures/culture.ts';
import { mockGeologicalContext, mockMaterialFlow } from '../../tests/fixtures/world.ts';
import type { NormalisedArtefact, NormalisedComponent } from '../../src/lib/types/artefact.ts';
import type {
	CulturalProfile,
	GeologicalContext,
	MaterialFlow,
	PhaseCharacteristics,
} from '../../src/lib/types/world.ts';

// --- Argument parsing --------------------------------------------------------------------------

/** Flag spec: `value` flags consume the next argument, `boolean` flags stand alone. */
export type FlagSpec = Record<string, 'value' | 'boolean'>;

/** Flags every sampler shares: `--seed <string>`, `--count <n>`, `--json`. */
export const COMMON_FLAGS: FlagSpec = {
	'--seed': 'value',
	'--count': 'value',
	'--json': 'boolean',
};

export interface SampleOptions {
	/** Base PRNG seed; sample N uses `${seed}-${n}` when count > 1. */
	seed: string;
	/** How many artefacts to sample. */
	count: number;
	/** Emit JSON instead of the human-readable report. */
	json: boolean;
	/** Values of any script-specific flags beyond the common trio. */
	values: Map<string, string>;
}

/**
 * Parses `Deno.args` against the common flags plus any script-specific `extraFlags`. Prints
 * `usage` and exits on `--help` or an unrecognised argument — loudly, so a typo never silently
 * samples the defaults.
 */
export function parseSampleOptions(usage: string, extraFlags: FlagSpec = {}): SampleOptions {
	const spec: FlagSpec = { ...COMMON_FLAGS, ...extraFlags, '--help': 'boolean' };
	const values = new Map<string, string>();
	const args = [...Deno.args];

	while (args.length > 0) {
		const flag = args.shift() as string;
		if (flag === '--help' || flag === '-h') {
			console.log(usage);
			Deno.exit(0);
		}
		const kind = spec[flag];
		if (kind === undefined) {
			console.error(`Unrecognised argument: ${flag}\n\n${usage}`);
			Deno.exit(1);
		}
		if (kind === 'boolean') {
			values.set(flag, 'true');
			continue;
		}
		const value = args.shift();
		if (value === undefined) {
			console.error(`${flag} needs a value\n\n${usage}`);
			Deno.exit(1);
		}
		values.set(flag, value);
	}

	const count = Number(values.get('--count') ?? '1');
	if (!Number.isInteger(count) || count < 1) {
		console.error(`--count must be a positive integer\n\n${usage}`);
		Deno.exit(1);
	}

	return {
		seed: values.get('--seed') ?? 'dev-sample',
		count,
		json: values.has('--json'),
		values,
	};
}

/** The seed for sample `index` of `count`: the base seed alone when only one is asked for. */
export function sampleSeed(options: SampleOptions, index: number): string {
	return options.count === 1 ? options.seed : `${options.seed}-${index}`;
}

// --- Fixture world -----------------------------------------------------------------------------

/** The mock world context every sampler generates against (the Milestone 2 convention). */
export interface SampleWorld {
	culture: CulturalProfile;
	phase: PhaseCharacteristics;
	geology: GeologicalContext;
	trade: readonly MaterialFlow[];
}

/** Builds the fixture-backed world: metal-leaning culture, flat 0.5 phase, mixed geology. */
export function sampleWorld(): SampleWorld {
	return {
		culture: mockCulturalProfile(),
		phase: mockPhaseCharacteristics(),
		geology: mockGeologicalContext(),
		trade: [mockMaterialFlow()],
	};
}

/** Expands and normalises one artefact from `seed` against `world`. */
export function generateArtefact(seed: string, world: SampleWorld): NormalisedArtefact {
	const prng = createPrng(seed);
	const expanded = expandGrammar(CORE_GRAMMAR_RULES, world.culture, world.phase, prng);
	return normaliseArtefact(expanded, `sample-${seed}`);
}

// --- Component prose ---------------------------------------------------------------------------

/** Short display id for a component: its position along the primary axis (`c0`, `c1`…). */
export function shortId(component: NormalisedComponent): string {
	return `c${component.position}`;
}

/** Reads a component property as a display string; `undefined` when absent. */
function propOf(component: NormalisedComponent, name: string): string | undefined {
	const value = component.properties.get(name);
	return value === undefined ? undefined : String(value);
}

/**
 * Phrase builders per primitive, in display order. Each maps a raw parameter value to a prose
 * fragment, or `undefined` to omit it (e.g. `point=none` says nothing). Unknown values pass
 * through raw so new grammar vocabulary is still visible rather than hidden.
 */
const PROSE: Record<string, ((c: NormalisedComponent) => string | undefined)[]> = {
	'elongated': [
		(c) => propOf(c, 'length'),
		(c) => fragment(c, 'crossSection', (v) => `${v} section`),
		(c) => fragment(c, 'taper', (v) => v === 'none' ? undefined : `${v} taper`),
		(c) => fragment(c, 'edge', (v) => v === 'none' ? undefined : `${v} edge`),
		(c) => fragment(c, 'point', (v) => v === 'none' ? undefined : `${v} point`),
	],
	'cylindrical': [
		(c) => propOf(c, 'length'),
		(c) => fragment(c, 'diameter', (v) => `${v} bore`),
		(c) => fragment(c, 'wall', (v) => `${v} wall`),
		(c) => fragment(c, 'opening', (v) => v === 'open' ? 'open' : `${v} opening`),
		(c) => fragment(c, 'base', (v) => `${v} base`),
	],
	'hollow-enclosed': [
		(c) => propOf(c, 'shape'),
		(c) => propOf(c, 'size'),
		(c) => fragment(c, 'wall', (v) => `${v} wall`),
		(c) => fragment(c, 'opening', (v) => v === 'none' ? 'no opening' : `${v} opening`),
		(c) => fragment(c, 'base', (v) => `${v} base`),
	],
	'flat-broad': [
		(c) => propOf(c, 'shape'),
		(c) => propOf(c, 'size'),
		(c) => propOf(c, 'thickness'),
		(c) =>
			fragment(c, 'curvature', (v) => {
				if (v === 'flat') return 'flat';
				return v === 'deep' ? 'deeply curved' : `${v} curve`;
			}),
		(c) =>
			fragment(c, 'perforation', (v) => {
				if (v === 'none') return undefined;
				return v === 'multiple' ? 'multiple perforations' : `${v} perforation`;
			}),
	],
	'ring-form': [
		(c) => propOf(c, 'diameter'),
		(c) => fragment(c, 'crossSection', (v) => `${v} section`),
		(c) => fragment(c, 'gap', (v) => `${v} gap`),
	],
	'disc-form': [
		(c) => propOf(c, 'diameter'),
		(c) => propOf(c, 'thickness'),
		(c) => fragment(c, 'perforation', (v) => v === 'none' ? undefined : `${v} perforation`),
	],
	'bar-form': [
		(c) => propOf(c, 'length'),
		(c) => fragment(c, 'crossSection', (v) => `${v} section`),
		(c) =>
			fragment(c, 'taper', (v) => {
				if (v === 'none') return 'untapered';
				if (v === 'single-end') return 'tapered one end';
				return v === 'both-ends' ? 'tapered both ends' : `${v} taper`;
			}),
	],
	'sheet-form': [
		(c) => propOf(c, 'size'),
		(c) => propOf(c, 'shape'),
		(c) => propOf(c, 'flexibility'),
	],
};

/** Applies a phrase mapper to a property when present. */
function fragment(
	component: NormalisedComponent,
	name: string,
	phrase: (value: string) => string | undefined,
): string | undefined {
	const value = propOf(component, name);
	return value === undefined ? undefined : phrase(value);
}

/** Prose rendering of a component's parameters; raw `key=value` for unknown primitives. */
export function describeProse(component: NormalisedComponent): string {
	const builders = PROSE[component.primitiveType];
	if (builders === undefined) {
		return [...component.properties.entries()].map(([k, v]) => `${k}=${v}`).join(', ');
	}
	return builders
		.map((build) => build(component))
		.filter((piece): piece is string => piece !== undefined)
		.join(', ');
}

// --- Anatomy tree ------------------------------------------------------------------------------

/** Per-component annotations for `printAnatomy`. */
export interface AnatomyAnnotations {
	/** Appended to a component's line (e.g. its assigned material). */
	suffix?: (component: NormalisedComponent) => string;
	/** Extra lines rendered beneath a component, already unindented (e.g. decorative layers). */
	childLines?: (component: NormalisedComponent) => string[];
}

/** One `c0 bar-form  prose` node line. */
function nodeText(component: NormalisedComponent, annotations: AnatomyAnnotations): string {
	const suffix = annotations.suffix?.(component) ?? '';
	return `${shortId(component)} ${component.primitiveType}  ${describeProse(component)}${suffix}`;
}

/**
 * Prints one artefact as a headline plus an anatomy tree: attached components render as a
 * box-drawn tree following the attachment graph, loose parts list beneath, flagged `(loose)`.
 */
export function printAnatomy(
	artefact: NormalisedArtefact,
	seed: string,
	annotations: AnatomyAnnotations = {},
): void {
	const { components, attachments, dimensions } = artefact;

	console.log(
		`${seed} · ${components.length} part${components.length === 1 ? '' : 's'} · ` +
			`${dimensions.primaryExtent}×${dimensions.secondaryExtent}cm · ${dimensions.mass} · ` +
			`${artefact.portability} · inspect: ${artefact.inspectionDepth}`,
	);
	console.log();

	const byId = new Map(components.map((component) => [component.id, component]));
	const childEdges = new Map<string, { type: string; to: NormalisedComponent }[]>();
	const attached = new Set<string>();
	for (const attachment of attachments) {
		attached.add(attachment.fromComponentId).add(attachment.toComponentId);
		const child = byId.get(attachment.toComponentId);
		if (child === undefined) continue;
		const edges = childEdges.get(attachment.fromComponentId) ?? [];
		edges.push({ type: attachment.type, to: child });
		childEdges.set(attachment.fromComponentId, edges);
	}

	const seen = new Set<string>();

	function renderExtras(component: NormalisedComponent, prefix: string): void {
		for (const line of annotations.childLines?.(component) ?? []) {
			console.log(`${prefix}  ${line}`);
		}
	}

	function renderSubtree(component: NormalisedComponent, prefix: string): void {
		if (seen.has(component.id)) return; // Cycle guard; the grammar produces trees.
		seen.add(component.id);
		renderExtras(component, prefix);
		const edges = childEdges.get(component.id) ?? [];
		edges.forEach((edge, index) => {
			const last = index === edges.length - 1;
			console.log(
				`${prefix}${last ? '└──' : '├──'} ${edge.type} ── ${nodeText(edge.to, annotations)}`,
			);
			renderSubtree(edge.to, prefix + (last ? '    ' : '│   '));
		});
	}

	// Roots: attached components that are never on the receiving end of a join.
	const receiving = new Set(attachments.map((attachment) => attachment.toComponentId));
	for (const component of components) {
		if (!attached.has(component.id) || receiving.has(component.id)) continue;
		console.log(nodeText(component, annotations));
		renderSubtree(component, '');
	}

	const loose = components.filter((component) => !attached.has(component.id));
	if (loose.length > 0 && attached.size > 0) console.log();
	for (const component of loose) {
		console.log(`${nodeText(component, annotations)}   (loose)`);
		renderExtras(component, '');
	}
}

/** `JSON.stringify` replacer that turns `Map`s (component properties) into plain objects. */
export function jsonReplacer(_key: string, value: unknown): unknown {
	return value instanceof Map ? Object.fromEntries(value) : value;
}
