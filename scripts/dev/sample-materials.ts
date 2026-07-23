/// <reference lib="deno.ns" />
/**
 * Samples material assignment (roadmap 2GN.22–2GN.25): each part's `assignMaterial` pick rendered
 * on the anatomy tree, plus an optional many-draw distribution table for eyeballing how culture
 * affinity, phase technology and geological scarcity tilt the weights.
 *
 * Run via `deno task sample:materials` — see `scripts/dev/shared.ts` for the fixture-world caveat.
 */

import { createPrng } from '../../src/lib/engine/prng.ts';
import { assignMaterial } from '../../src/lib/engine/generation/materials.ts';
import { MATERIALS } from '../../src/lib/data/materials.ts';
import type { NormalisedComponent } from '../../src/lib/types/artefact.ts';
import {
	generateArtefact,
	jsonReplacer,
	parseSampleOptions,
	printAnatomy,
	sampleSeed,
	sampleWorld,
	shortId,
} from './shared.ts';

const USAGE = `sample-materials — assign materials to sampled artefact components

Usage: deno task sample:materials [--seed <string>] [--count <n>] [--draws <n>] [--json]

  --seed   Base PRNG seed (default: dev-sample). Sample n of a batch uses "<seed>-<n>".
  --count  Number of artefacts to sample (default: 1).
  --draws  Redraw the FIRST sample's assignments n times and print the pick distribution
           per component (default: off) — the affinity/scarcity tilt becomes visible around 100+.
  --json   Emit JSON instead of the report.`;

const options = parseSampleOptions(USAGE, { '--draws': 'value' });
const draws = Number(options.values.get('--draws') ?? '0');
if (!Number.isInteger(draws) || draws < 0) {
	console.error(`--draws must be a non-negative integer\n\n${USAGE}`);
	Deno.exit(1);
}

const world = sampleWorld();

const samples = Array.from({ length: options.count }, (_, index) => {
	const seed = sampleSeed(options, index);
	const artefact = generateArtefact(seed, world);
	const prng = createPrng(`${seed}-materials`);
	const assignments = new Map(artefact.components.map((component) => [
		component.id,
		assignMaterial(
			component,
			world.culture,
			world.phase,
			world.geology,
			world.trade,
			MATERIALS,
			prng,
		),
	]));
	return { seed, artefact, assignments };
});

/** Distribution over `draws` redraws of the first sample, keyed short id → materialId → count. */
function drawDistribution(): Map<string, Map<string, number>> {
	const { seed, artefact } = samples[0];
	const prng = createPrng(`${seed}-material-draws`);
	const tallies = new Map<string, Map<string, number>>();
	for (let n = 0; n < draws; n++) {
		for (const component of artefact.components) {
			const material = assignMaterial(
				component,
				world.culture,
				world.phase,
				world.geology,
				world.trade,
				MATERIALS,
				prng,
			);
			const tally = tallies.get(shortId(component)) ?? new Map<string, number>();
			tally.set(material.id, (tally.get(material.id) ?? 0) + 1);
			tallies.set(shortId(component), tally);
		}
	}
	return tallies;
}

const distribution = draws > 0 ? drawDistribution() : undefined;

if (options.json) {
	const flat = samples.map(({ seed, artefact, assignments }) => ({
		seed,
		artefact,
		assignments: Object.fromEntries(
			[...assignments].map(([id, material]) => [id, material.id]),
		),
	}));
	console.log(JSON.stringify({ samples: flat, draws, distribution }, jsonReplacer, '\t'));
} else {
	const materialOf =
		(assignments: Map<string, { displayName: string }>) => (component: NormalisedComponent) => {
			const material = assignments.get(component.id);
			return material === undefined ? '' : `   ⟶ ${material.displayName.toLowerCase()}`;
		};

	for (const { seed, artefact, assignments } of samples) {
		console.log();
		printAnatomy(artefact, seed, { suffix: materialOf(assignments) });
	}
	if (distribution) {
		console.log(`\ndistribution over ${draws} redraws (first sample):`);
		for (const [id, tally] of distribution) {
			const ranked = [...tally.entries()].sort((a, b) => b[1] - a[1]);
			const summary = ranked
				.map(([material, n]) => `${material} ${(100 * n / draws).toFixed(1)}%`)
				.join(', ');
			console.log(`  ${id}: ${summary}`);
		}
	}
	console.log();
}
