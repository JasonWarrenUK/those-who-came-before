/// <reference lib="deno.ns" />
/**
 * Samples decorative expansion (roadmap 2GN.28–2GN.29): the layers `expandDecoration` emits,
 * nested on the anatomy tree beneath the component each one targets.
 *
 * Run via `deno task sample:decoration` — see `scripts/dev/shared.ts` for the fixture-world caveat.
 */

import { paint } from './gum.ts';
import { createPrng } from '../../src/lib/engine/prng.ts';
import { expandDecoration } from '../../src/lib/engine/generation/decoration.ts';
import { MATERIALS } from '../../src/lib/data/materials.ts';
import { DECORATIVE_TECHNIQUES } from '../../src/lib/data/decorations.ts';
import type { DecorativeLayer } from '../../src/lib/types/decoration.ts';
import type { NormalisedComponent } from '../../src/lib/types/artefact.ts';
import {
	generateArtefact,
	jsonReplacer,
	parseSampleOptions,
	printAnatomy,
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

/** Flattens one layer and its sublayers into indented `✦ technique` lines. */
function layerLines(layer: DecorativeLayer, depth: number, into: string[]): void {
	const motif = layer.motifRef === undefined ? '' : ` ${paint(`(${layer.motifRef})`, 'dim')}`;
	into.push(`${'  '.repeat(depth)}${paint(`✦ ${layer.technique}`, 'layer')}${motif}`);
	for (const sublayer of layer.sublayers) {
		layerLines(sublayer, depth + 1, into);
	}
}

if (options.json) {
	console.log(JSON.stringify(samples, jsonReplacer, '\t'));
} else {
	for (const { seed, artefact, layers } of samples) {
		const decorationOf = (component: NormalisedComponent): string[] => {
			const lines: string[] = [];
			for (const layer of layers) {
				if (layer.targetComponentId === component.id) layerLines(layer, 0, lines);
			}
			return lines;
		};

		console.log();
		printAnatomy(artefact, seed, { childLines: decorationOf });
		console.log();
		console.log(
			layers.length === 0
				? paint('no decoration (this seed rolled an undecorated artefact)', 'warn')
				: `${paint(String(layers.length), 'layer')} layer${
					layers.length === 1 ? '' : 's'
				} in total`,
		);
	}
	console.log();
}
