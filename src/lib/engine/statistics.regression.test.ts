/// <reference lib="deno.ns" />
/**
 * Regression anchor for `percentileOf`/`percentileLadder` against a real, directly-sampled figure
 * (roadmap 2GN.94, prerequisite to 2GN.95).
 *
 * Originally validated the helper against a hand-transcribed historical figure (2GN.34's p75 of
 * 10, from a 1200-artefact sample predating any percentile helper). **Re-pinned 2026-08-06 for
 * roadmap 2GN.98** (doc 12 §2.33): `expandDecoration`'s `decorationVolume` now reads
 * `aesthetics.decorativeEmphasis` alone rather than the old craft/emphasis blend, which moved the
 * generator's `decorativeLayerCount` distribution — this anchor's own measurement (p75 = 12 at
 * this file's fixed seed set) is now the pin, not 2GN.34's pre-relativisation figure, which no
 * longer describes what the generator produces. What this test still checks: that `percentileOf`
 * agrees with a value measured directly against the real pipeline, catching a percentile-helper
 * regression independent of `calibration.test.ts`'s own guards on the *rule* thresholds.
 *
 * A single fixed seed, not a statistical band: this checks agreement with one specific measured
 * value, not general correctness (that's `statistics.test.ts`'s job).
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

Deno.test('percentileOf: agrees with the measured decorativeLayerCount p75 (2GN.98, ~12)', () => {
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

	// Exact match expected: this anchor's own 1800-artefact sample against the current generator
	// measured p75 = 12 (roadmap 2GN.98); a small band still guards against PRNG/environment drift
	// rather than requiring bit-identical floating-point reproduction.
	assert(
		Math.abs(p75 - 12) <= 1,
		`percentileOf disagrees with this anchor's own measured decorativeLayerCount p75: got ${p75}, ` +
			`expected ~12. Determine whether the helper or the generator moved before ` +
			`calibration.test.ts's guards are trusted.`,
	);
});
