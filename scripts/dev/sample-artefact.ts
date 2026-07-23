/**
 * Samples structural generation (roadmap 2GN.3–2GN.12): grammar expansion → normalisation →
 * plausibility, printing each artefact's components, attachments, dimensions and verdict.
 *
 * Run via `deno task sample:artefact` — see `scripts/dev/shared.ts` for the fixture-world caveat.
 */

import { checkPlausibility } from '../../src/lib/engine/generation/plausibility.ts';
import {
	generateArtefact,
	heading,
	jsonReplacer,
	parseSampleOptions,
	printStructure,
	sampleSeed,
	sampleWorld,
} from './shared.ts';

const USAGE = `sample-artefact — expand, normalise and plausibility-check artefact structures

Usage: deno task sample:artefact [--seed <string>] [--count <n>] [--json]

  --seed   Base PRNG seed (default: dev-sample). Sample n of a batch uses "<seed>-<n>".
  --count  Number of artefacts to sample (default: 1).
  --json   Emit JSON instead of the report.`;

const options = parseSampleOptions(USAGE);
const world = sampleWorld();

const samples = Array.from({ length: options.count }, (_, index) => {
	const seed = sampleSeed(options, index);
	const artefact = generateArtefact(seed, world);
	return { seed, artefact, plausibility: checkPlausibility(artefact) };
});

if (options.json) {
	console.log(JSON.stringify(samples, jsonReplacer, '\t'));
} else {
	for (const { seed, artefact, plausibility } of samples) {
		heading(`artefact ${artefact.id} (seed: ${seed})`);
		printStructure(artefact);
		if (plausibility.valid) {
			console.log('plausibility: ✓ valid');
		} else {
			console.log(`plausibility: ✗ ${plausibility.failures.length} failure(s)`);
			for (const failure of plausibility.failures) {
				console.log(`  ✗ ${failure}`);
			}
		}
	}
	console.log();
}
