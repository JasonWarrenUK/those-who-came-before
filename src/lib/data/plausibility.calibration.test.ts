/// <reference lib="deno.ns" />
/**
 * Calibration guard for the plausibility re-expansion cap (roadmap 2GN.137, doc 11 §2.19).
 *
 * `MAX_PLAUSIBILITY_ATTEMPTS = 20` was ruled against a measured worst-cell per-attempt failure rate
 * of 43.3% (xoconahtl, 5000 seeds, 2026-08-25). Exhaustion probability is `p^N` because attempts
 * are independent draws from one PRNG stream, so the cap only holds its bound while every cell
 * stays under `PLAUSIBILITY_FAILURE_CEILING`. This test pins that, per Explorer preset. Measured
 * rates at ruling time, for drift comparison: tarpan 15.4%, thalassar 31.6%, xoconahtl 43.3%,
 * khaltiris 32.3%.
 *
 * Runs Stages 4–5 only (`expandGrammar` → `normaliseArtefact` → `checkPlausibility`); materials and
 * decoration never enter the plausibility verdict.
 */

import { assert } from '@std/assert';
import { createPrng } from '../engine/prng.ts';
import { expandGrammar, normaliseArtefact } from '../engine/generation/grammar.ts';
import { checkPlausibility } from '../engine/generation/plausibility.ts';
import { CORE_GRAMMAR_RULES } from './grammars/core.ts';
import { EXPLORER_CULTURES } from './explorer-cultures.ts';
import { MAX_PLAUSIBILITY_ATTEMPTS, PLAUSIBILITY_FAILURE_CEILING } from './plausibility.ts';

const SEEDS_PER_PRESET = 1000;

/** Per-artefact exhaustion tolerance the cap was ruled against (doc 11 §2.19). */
const EXHAUSTION_TOLERANCE = 1e-6;

Deno.test('plausibility calibration: every preset fails under the ceiling, so the cap bounds exhaustion', () => {
	const failures: string[] = [];

	for (const preset of EXPLORER_CULTURES) {
		let failed = 0;
		for (let i = 0; i < SEEDS_PER_PRESET; i++) {
			const seed = `2GN.137-${preset.id}-${i}`;
			const artefact = normaliseArtefact(
				expandGrammar(CORE_GRAMMAR_RULES, preset.profile, preset.phase, createPrng(seed)),
				seed,
			);
			if (!checkPlausibility(artefact).valid) failed++;
		}
		const rate = failed / SEEDS_PER_PRESET;
		if (rate >= PLAUSIBILITY_FAILURE_CEILING) {
			failures.push(`${preset.id}: ${(rate * 100).toFixed(1)}% per-attempt failure`);
		}
	}

	assert(
		failures.length === 0,
		`per-attempt failure rate at or above ${PLAUSIBILITY_FAILURE_CEILING}:\n${failures.join('\n')}`,
	);
});

Deno.test('plausibility calibration: the cap holds the ruled exhaustion tolerance at the ceiling', () => {
	const exhaustion = Math.pow(PLAUSIBILITY_FAILURE_CEILING, MAX_PLAUSIBILITY_ATTEMPTS);
	assert(
		exhaustion < EXHAUSTION_TOLERANCE,
		`0.5^${MAX_PLAUSIBILITY_ATTEMPTS} = ${
			exhaustion.toExponential(2)
		} exceeds ${EXHAUSTION_TOLERANCE}`,
	);
});
