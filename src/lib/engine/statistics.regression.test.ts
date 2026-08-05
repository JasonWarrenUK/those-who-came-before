/// <reference lib="deno.ns" />
/**
 * Regression anchor for `percentileOf`/`percentileLadder` against a real, previously hand-measured
 * figure (roadmap 2GN.94, prerequisite to 2GN.95).
 *
 * `classification.ts`'s JSDoc records `decorativeLayerCount`'s p75 as 10, computed out-of-band
 * during roadmap 2GN.34 over a 1200-artefact sample and hand-transcribed — no percentile helper
 * existed in `src/` at the time. This test re-samples the same feature through the same pipeline
 * shape `calibration.test.ts` already uses and checks the new helper agrees, before anything in
 * 2GN.95 depends on it. If it disagrees, find out here whether the helper is wrong or the original
 * transcription was — not after a threshold has been built on it.
 *
 * A single fixed seed, not a statistical band: this checks agreement with one specific recorded
 * measurement, not general correctness (that's `statistics.test.ts`'s job).
 */

import { assert } from '@std/assert';
import { createPrng } from './prng.ts';
import { expandGrammar, normaliseArtefact } from './generation/grammar.ts';
import { expandDecoration } from './generation/decoration.ts';
import { extractFeatures } from './generation/classification.ts';
import { CORE_GRAMMAR_RULES } from '../data/grammars/core.ts';
import { MATERIALS } from '../data/materials.ts';
import { DECORATIVE_TECHNIQUES } from '../data/decorations.ts';
import { mockCulturalProfile, mockPhaseCharacteristics } from '../../../tests/fixtures/culture.ts';
import { MOCK_WORLD_REGIONS, mockRegionalWorld } from '../../../tests/fixtures/world.ts';
import { percentileOf } from './statistics.ts';

Deno.test('percentileOf: agrees with the recorded decorativeLayerCount p75 (2GN.34, ~10)', () => {
	const culture = mockCulturalProfile();
	const layerCounts: number[] = [];

	// Same shape as calibration.test.ts's measureFireRates: six regions, three emphases, 100 per
	// cell — n=1800, comparable order of magnitude to 2GN.34's original 1200-artefact sample.
	for (const region of MOCK_WORLD_REGIONS) {
		const world = mockRegionalWorld(region);

		for (const emphasis of [0.1, 0.5, 1.0]) {
			const phase = mockPhaseCharacteristics({ aesthetics: { decorativeEmphasis: emphasis } });

			for (let index = 0; index < 100; index++) {
				const seed = `anchor-${region}-${emphasis}-${index}`;
				const artefact = normaliseArtefact(
					expandGrammar(CORE_GRAMMAR_RULES, culture, phase, createPrng(seed)),
					`anchor-${seed}`,
				);
				const layers = expandDecoration(
					artefact,
					culture,
					phase,
					world.geology,
					world.trade,
					createPrng(`${seed}-decoration`),
					MATERIALS,
					DECORATIVE_TECHNIQUES,
				);
				const extracted = extractFeatures(artefact, layers);
				layerCounts.push(extracted.decorativeLayerCount);
			}
		}
	}

	const p75 = percentileOf(layerCounts, 0.75);

	// Not an exact match: 2GN.34 sampled 1200 artefacts under a different (pre-2GN.79/2GN.86) grammar
	// and mass-band state than this anchor's 1800. The check is that the helper lands in the
	// documented figure's neighbourhood, not that history reproduces bit-for-bit.
	assert(
		Math.abs(p75 - 10) <= 2,
		`percentileOf disagrees with the recorded decorativeLayerCount p75: got ${p75}, ` +
			`classification.ts records 10. Determine whether the helper or the original ` +
			`transcription is wrong before 2GN.95 builds baseline sampling on it.`,
	);
});
