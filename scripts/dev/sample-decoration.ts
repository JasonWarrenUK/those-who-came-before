/// <reference lib="deno.ns" />
/**
 * Samples decorative expansion (roadmap 2GN.28–2GN.29): the layer list `expandDecoration` emits
 * for each sampled artefact, printed as an indented tree (technique, target component, motif).
 *
 * Run via `deno task sample:decoration` — see `scripts/dev/shared.ts` for the fixture-world caveat.
 */

import { createPrng } from '../../src/lib/engine/prng.ts';
import { expandDecoration } from '../../src/lib/engine/generation/decoration.ts';
import { MATERIALS } from '../../src/lib/data/materials.ts';
import { DECORATIVE_TECHNIQUES } from '../../src/lib/data/decorations.ts';
import type { DecorativeLayer } from '../../src/lib/types/decoration.ts';
import {
	generateArtefact,
	heading,
	jsonReplacer,
	parseSampleOptions,
	printStructure,
	sampleSeed,
	sampleWorld,
} from './shared.ts';

const USAGE = `sample-decoration — expand decorative layers over sampled artefacts

Usage: deno task sample:decoration [--seed <string>] [--count <n>] [--json]

  --seed   Base PRNG seed (default: dev-sample). Sample n of a batch uses "<seed>-<n>".
  --count  Number of artefacts to sample (default: 1).
  --json   Emit JSON instead of the report.`;

const options = parseSampleOptions(USAGE);
const world = sampleWorld();

const samples = Array.from({ length: options.count }, (_, index) => {
	const seed = sampleSeed(options, index);
	const artefact = generateArtefact(seed, world);
	const layers = expandDecoration(
		artefact,
		world.culture,
		world.phase,
		world.geology,
		world.trade,
		MATERIALS,
		DECORATIVE_TECHNIQUES,
		createPrng(`${seed}-decoration`),
	);
	return { seed, artefact, layers };
});

/** Prints one layer and its sublayers, indented per nesting depth. */
function printLayer(layer: DecorativeLayer, depth: number): void {
	const indent = '  '.repeat(depth + 1);
	const motif = layer.motifRef !== undefined ? ` motif=${layer.motifRef}` : '';
	console.log(`${indent}${layer.technique} on ${layer.targetComponentId}${motif}`);
	for (const sublayer of layer.sublayers) {
		printLayer(sublayer, depth + 1);
	}
}

if (options.json) {
	console.log(JSON.stringify(samples, jsonReplacer, '\t'));
} else {
	for (const { seed, artefact, layers } of samples) {
		heading(`decoration for ${artefact.id} (seed: ${seed})`);
		printStructure(artefact);
		if (layers.length === 0) {
			console.log('layers: none (this seed rolled an undecorated artefact)');
		} else {
			console.log(`layers (${layers.length} top-level):`);
			for (const layer of layers) {
				printLayer(layer, 0);
			}
		}
	}
	console.log();
}
