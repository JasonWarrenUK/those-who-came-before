/// <reference lib="deno.ns" />
/**
 * Calibration guard for the plausibility re-expansion cap (roadmap 2GN.137, doc 11 §2.19).
 *
 * `MAX_PLAUSIBILITY_ATTEMPTS = 20` was ruled against a measured worst-cell per-attempt failure rate
 * of 43.3% (xoconahtl, 5000 seeds, 2026-08-25). Exhaustion probability is `p^N` because attempts
 * are independent draws from one PRNG stream, so the cap only holds its bound while every cell
 * stays under `PLAUSIBILITY_FAILURE_CEILING`. This test pins that for the seven cells the ruling
 * measured. Rates at ruling time, for drift comparison: tarpan 15.4%, thalassar 31.6%, xoconahtl
 * 43.3%, khaltiris 32.3%, fixture craft 0.1 / 0.5 / 0.9 at 13.2% / 18.0% / 27.3%.
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
import { mockCulturalProfile, mockPhaseCharacteristics } from '../../../tests/fixtures/culture.ts';
import type { CulturalProfile, PhaseCharacteristics } from '../types/world.ts';

const SEEDS_PER_CELL = 1000;

/** Per-artefact exhaustion tolerance the cap was ruled against (doc 11 §2.19). */
const EXHAUSTION_TOLERANCE = 1e-6;

interface CalibrationCell {
	id: string;
	profile: CulturalProfile;
	phase: PhaseCharacteristics;
}

/**
 * The seven cells the ruling measured: the four Explorer presets plus the default fixture profile
 * at three `craftSpecialisation` corners (measured 13.2% / 18.0% / 27.3% at ruling time).
 */
const CELLS: readonly CalibrationCell[] = [
	...EXPLORER_CULTURES.map((preset) => ({
		id: preset.id,
		profile: preset.profile,
		phase: preset.phase,
	})),
	...[0.1, 0.5, 0.9].map((craft) => ({
		id: `fixture-craft-${craft}`,
		profile: mockCulturalProfile(),
		phase: mockPhaseCharacteristics({ society: { craftSpecialisation: craft } }),
	})),
];

Deno.test('plausibility calibration: every measured cell fails under the ceiling, so the cap bounds exhaustion', () => {
	const failures: string[] = [];

	for (const cell of CELLS) {
		let failed = 0;
		for (let i = 0; i < SEEDS_PER_CELL; i++) {
			const seed = `2GN.137-${cell.id}-${i}`;
			const artefact = normaliseArtefact(
				expandGrammar(CORE_GRAMMAR_RULES, cell.profile, cell.phase, createPrng(seed)),
				seed,
			);
			if (!checkPlausibility(artefact).valid) failed++;
		}
		const rate = failed / SEEDS_PER_CELL;
		if (rate >= PLAUSIBILITY_FAILURE_CEILING) {
			failures.push(`${cell.id}: ${(rate * 100).toFixed(1)}% per-attempt failure`);
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
