/// <reference lib="deno.ns" />
/**
 * Samples material assignment (roadmap 2GN.22–2GN.25): per-component `assignMaterial` picks for
 * each sampled artefact, plus an optional many-draw distribution table for eyeballing how culture
 * affinity, phase technology and geological scarcity tilt the weights.
 *
 * Run via `deno task sample:materials` — see `scripts/dev/shared.ts` for the fixture-world caveat.
 */

import { createPrng } from '../../src/lib/engine/prng.ts';
import { assignMaterial } from '../../src/lib/engine/generation/materials.ts';
import { MATERIALS } from '../../src/lib/data/materials.ts';
import {
	describeComponent,
	generateArtefact,
	heading,
	jsonReplacer,
	parseSampleOptions,
	sampleSeed,
	sampleWorld,
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
	const assignments = artefact.components.map((component) => ({
		componentId: component.id,
		primitiveType: component.primitiveType,
		material: assignMaterial(
			component,
			world.culture,
			world.phase,
			world.geology,
			world.trade,
			MATERIALS,
			prng,
		),
	}));
	return { seed, artefact, assignments };
});

/** Distribution over `draws` redraws of the first sample, keyed componentId → materialId → n. */
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
			const tally = tallies.get(component.id) ?? new Map<string, number>();
			tally.set(material.id, (tally.get(material.id) ?? 0) + 1);
			tallies.set(component.id, tally);
		}
	}
	return tallies;
}

const distribution = draws > 0 ? drawDistribution() : undefined;

if (options.json) {
	console.log(JSON.stringify({ samples, draws, distribution }, jsonReplacer, '\t'));
} else {
	for (const { seed, artefact, assignments } of samples) {
		heading(`materials for ${artefact.id} (seed: ${seed})`);
		for (const [index, assignment] of assignments.entries()) {
			const { material } = assignment;
			console.log(`  ${describeComponent(artefact.components[index])}`);
			console.log(`    → ${material.displayName} [${material.tags.join(', ')}]`);
		}
	}
	if (distribution) {
		heading(`distribution over ${draws} redraws (first sample)`);
		for (const [componentId, tally] of distribution) {
			const ranked = [...tally.entries()].sort((a, b) => b[1] - a[1]);
			const summary = ranked
				.map(([id, n]) => `${id} ${(100 * n / draws).toFixed(1)}%`)
				.join(', ');
			console.log(`  ${componentId}: ${summary}`);
		}
	}
	console.log();
}
