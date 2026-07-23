/**
 * Samples unified feature extraction (roadmap 2GN.17/2GN.19): runs the full Milestone 2 chain —
 * expand → normalise → decorate → `extractFeatures` — and prints the complete `ExtractedFeatures`
 * contract grouped by family, next to the structure it was extracted from. The fastest way to
 * eyeball the collapse policies and interviewed presence flags against real grammar rolls.
 *
 * Run via `deno task sample:features` — see `scripts/dev/shared.ts` for the fixture-world caveat.
 */

import { createPrng } from '../../src/lib/engine/prng.ts';
import { expandDecoration } from '../../src/lib/engine/generation/decoration.ts';
import { extractFeatures } from '../../src/lib/engine/generation/classification.ts';
import { MATERIALS } from '../../src/lib/data/materials.ts';
import { DECORATIVE_TECHNIQUES } from '../../src/lib/data/decorations.ts';
import type { ExtractedFeatures } from '../../src/lib/types/artefact.ts';
import {
	generateArtefact,
	heading,
	jsonReplacer,
	parseSampleOptions,
	printStructure,
	sampleSeed,
	sampleWorld,
} from './shared.ts';

const USAGE = `sample-features — extract classification features from sampled artefacts

Usage: deno task sample:features [--seed <string>] [--count <n>] [--bare] [--json]

  --seed   Base PRNG seed (default: dev-sample). Sample n of a batch uses "<seed>-<n>".
  --count  Number of artefacts to sample (default: 1).
  --bare   Skip decorative expansion (extract from the bare structure).
  --json   Emit JSON instead of the report.`;

const options = parseSampleOptions(USAGE, { '--bare': 'boolean' });
const bare = options.values.has('--bare');
const world = sampleWorld();

const samples = Array.from({ length: options.count }, (_, index) => {
	const seed = sampleSeed(options, index);
	const artefact = generateArtefact(seed, world);
	const layers = bare ? [] : expandDecoration(
		artefact,
		world.culture,
		world.phase,
		world.geology,
		world.trade,
		MATERIALS,
		DECORATIVE_TECHNIQUES,
		createPrng(`${seed}-decoration`),
	);
	return { seed, artefact, layers, features: extractFeatures(artefact, layers) };
});

/** The feature families, in the module JSDoc's order, for grouped printing. */
const FAMILIES: readonly [string, readonly (keyof ExtractedFeatures)[]][] = [
	['edge / blade', ['hasEdge', 'edgeCount', 'bladeLengthBand', 'bladeProfile']],
	['point', ['hasPoint', 'pointSharpness']],
	['container', ['hasContainer', 'openingType', 'containerOpenness', 'wallThickness', 'baseType']],
	['perforation / ring / sheet / curvature', [
		'perforation',
		'ringGap',
		'sheetFlexibility',
		'curvature',
	]],
	['bands', ['massBand', 'sizeBand', 'primaryAxisLength']],
	['structure', ['partCount', 'attachmentDiversity']],
	['presence flags (interviewed)', ['hasImpactSurface', 'hasFasteningMechanism', 'isWearable']],
	[
		'decorative',
		[
			'decorativeLayerCount',
			'appliedElementPresent',
			'motifPresent',
			'motifCulturalOrigins',
			'preciousMaterialsInDecoration',
		],
	],
	[
		'complexity',
		['functionalComplexity', 'techniqueComplexity', 'decorativeComplexity', 'overallComplexity'],
	],
	['mechanical passthrough (never classified on)', ['portability', 'inspectionDepth']],
];

/** Renders one feature value compactly (arrays joined, everything else stringified). */
function renderValue(value: ExtractedFeatures[keyof ExtractedFeatures]): string {
	if (Array.isArray(value)) return value.length === 0 ? '[]' : value.join(', ');
	return String(value);
}

if (options.json) {
	console.log(JSON.stringify(samples, jsonReplacer, '\t'));
} else {
	for (const { seed, artefact, layers, features } of samples) {
		heading(`features for ${artefact.id} (seed: ${seed})`);
		printStructure(artefact);
		console.log(
			`decorative layers: ${layers.length}${bare ? ' (--bare: decoration skipped)' : ''}`,
		);
		for (const [family, keys] of FAMILIES) {
			console.log(`${family}:`);
			for (const key of keys) {
				console.log(`  ${key} = ${renderValue(features[key])}`);
			}
		}
	}
	console.log();
}
