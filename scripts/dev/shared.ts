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

// --- Output helpers ----------------------------------------------------------------------------

/** Prints a section heading for one sample. */
export function heading(text: string): void {
	console.log(`\n━━━ ${text} ${'━'.repeat(Math.max(3, 76 - text.length))}`);
}

/** One-line component summary: position, primitive, rolled parameters, id. */
export function describeComponent(component: NormalisedComponent): string {
	const properties = [...component.properties.entries()]
		.map(([key, value]) => `${key}=${value}`)
		.join(' ');
	return `[${component.position}] ${component.primitiveType}${
		properties ? ` { ${properties} }` : ''
	} (${component.id})`;
}

/** Prints the structural summary shared by every sampler: components, attachments, dimensions. */
export function printStructure(artefact: NormalisedArtefact): void {
	console.log(`components (${artefact.components.length}):`);
	for (const component of artefact.components) {
		console.log(`  ${describeComponent(component)}`);
	}
	if (artefact.attachments.length > 0) {
		console.log(`attachments (${artefact.attachments.length}):`);
		for (const attachment of artefact.attachments) {
			console.log(
				`  ${attachment.fromComponentId} ─${attachment.type}→ ${attachment.toComponentId}`,
			);
		}
	}
	const { primaryExtent, secondaryExtent, mass } = artefact.dimensions;
	console.log(
		`dimensions: ${primaryExtent}cm × ${secondaryExtent}cm, ${mass} | ` +
			`portability: ${artefact.portability} | inspection: ${artefact.inspectionDepth}`,
	);
}

/** `JSON.stringify` replacer that turns `Map`s (component properties) into plain objects. */
export function jsonReplacer(_key: string, value: unknown): unknown {
	return value instanceof Map ? Object.fromEntries(value) : value;
}
