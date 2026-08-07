/// <reference lib="deno.ns" />
/**
 * Fire-rate regression guard for `CLASSIFICATION_RULES` (roadmap 2GN.79, doc 12 §2.25).
 *
 * Every rule's threshold is pinned to a measured percentile of real pipeline output, but until this
 * file nothing checked that a rule still fires at the rate its author measured. That gap is how the
 * applied-element rule sat at 84.6% between 2GN.34 and 2GN.79 while its JSDoc claimed it marked
 * deliberate embellishment: the rule set and the generator drifted apart silently, because only the
 * rules were under test and only in isolation.
 *
 * This drives the full Milestone 2 chain — `expandGrammar` → `normaliseArtefact` →
 * `expandDecoration` → `extractFeatures` — across all six named regional worlds
 * (`tests/fixtures/world.ts`) at three `decorativeEmphasis` settings, and asserts each rule's fire
 * rate stays within `TOLERANCE_POINTS` of the rate recorded when it was last calibrated.
 *
 * **When this fails, it is usually right and you should not just widen the band.** A generator
 * change that moves fire rates has changed what the tag scores mean, because `classifyArtefact`
 * folds by plain unbounded sum (doc 12 §2.21): a rule that starts firing twice as often doubles its
 * contribution to every artefact carrying it. The correct response is to re-measure, decide whether
 * each moved rule still matches its stated intent, and update `EXPECTED_FIRE_RATES` deliberately —
 * the same decision-by-decision process 2GN.17/2GN.20/2GN.34/2GN.79 each ran.
 *
 * Sample size is deliberately modest (100 per world per emphasis, n=1800) so the suite stays fast,
 * and `TOLERANCE_POINTS` is set from the measured sampling noise at that size rather than by feel —
 * see both constants' comments. The full 7200-sample numbers that set the thresholds live in doc 12
 * §2.24/§2.25.
 */

import { assert } from '@std/assert';
import { createPrng } from '../engine/prng.ts';
import { expandGrammar, normaliseArtefact } from '../engine/generation/grammar.ts';
import { expandDecoration } from '../engine/generation/decoration.ts';
import { extractFeatures } from '../engine/generation/classification.ts';
import { sampleBaselines } from '../engine/generation/baselines.ts';
import { CORE_GRAMMAR_RULES } from './grammars/core.ts';
import { CLASSIFICATION_RULES, SATURATION_CEILING } from './classification.ts';
import { MATERIALS } from './materials.ts';
import { DECORATIVE_TECHNIQUES } from './decorations.ts';
import { mockCulturalProfile, mockPhaseCharacteristics } from '../../../tests/fixtures/culture.ts';
import { MOCK_WORLD_REGIONS, mockRegionalWorld } from '../../../tests/fixtures/world.ts';
import type { ClassificationContext } from '../types/tags.ts';

/**
 * Artefacts sampled per world per emphasis setting. Six worlds × three settings × this.
 *
 * Sits at the knee of the noise curve: the worst-case sampling wobble falls steeply to 100 per cell
 * (5.4pp → 3.8pp) then flattens, with 200 buying only 0.5pp for double the runtime and 400 buying
 * nothing further. Keeps the whole suite inside a couple of seconds.
 */
const SAMPLES_PER_CELL = 100;

/** Emphasis settings sampled, spanning the range a real culture can sit at. */
const EMPHASES = [0.1, 0.5, 1.0];

/**
 * How far a rule may drift from its recorded rate before this fails, in percentage points.
 *
 * Measured, not guessed: re-running the whole sweep under five different seed salts moves the
 * worst-case rule by 3.8pp at this sample size, so 6 leaves roughly 1.6× headroom over pure
 * sampling noise while still catching a real shift well before it doubles a rule's selectivity.
 * (Sampling noise by cell size: 25 → 5.4pp, 50 → 5.1pp, 100 → 3.8pp, 200 → 3.3pp, 400 → 3.5pp.)
 */
const TOLERANCE_POINTS = 6;

/**
 * Measured fire rate per rule, in `CLASSIFICATION_RULES` order, as a percentage of all sampled
 * artefacts. Recorded 2026-07-31 at n=1800 (roadmap 2GN.79); five entries re-recorded 2026-08-01
 * after the mass-band rebalance (roadmap 2GN.86) and annotated with their previous values.
 *
 * Rules at `0` have no producer in the current pipeline and are expected to stay there: the two
 * dormant decorative rules await roadmap 2GN.68's lookups. R4 is the remaining structural zero —
 * every edged short-axis artefact measured carries a short blade band, so R2/R3 claim them all and
 * its safety net has never caught anything (roadmap 2GN.87 investigates). A dormant rule starting
 * to fire is itself a signal worth failing on — it means its producer landed and its threshold has
 * never been calibrated against real output.
 *
 * R27 was a third such zero until 2GN.86: `very-heavy` sat above the old proxy's reachable maximum,
 * so the rule was unreachable by arithmetic rather than merely rare. It now fires on 4.3%.
 *
 * **Nine entries re-recorded 2026-08-05 for the culture-relative migration (roadmap 2GN.82, doc 12
 * §2.31)**, annotated `(2GN.82 relative basis: was N)`: R29, R30, R31, R35, R36, R40, R41, R42, R43
 * now read `ClassificationContext.exceeds` against a real per-cell baseline (below) instead of an
 * empty one — this is the one change licensed to move these nine, and every other entry must come
 * back bit-identical to prove it. **What this array means changed for those nine.** A migrated
 * rate is not simply `(1 - percentile) * 100`: coarse features carry tie-mass at the interpolated
 * threshold (`classification.ts`'s module JSDoc), so the number below is close to but not exactly
 * that. It is still a real measurement — the per-cell threshold VALUES pinned separately below
 * (`EXPECTED_THRESHOLDS`) are what keeps this guard sensitive to a whole-distribution generator
 * shift once the fire rate itself sits close to its rung by construction.
 *
 * **R30–R43 re-recorded and R44 added 2026-08-06 for the decorative-volume/refinement split
 * (roadmap 2GN.98, doc 12 §2.33).** `decorationVolume` (`expandDecoration`) now reads
 * `aesthetics.decorativeEmphasis` alone rather than the equal-weight craft/emphasis blend, moving
 * the entire decoration-family distribution — every entry from R29 onward that reads a decoration
 * feature moved, and R1–R28/R37–R39 (structural, upstream of decoration) came back bit-identical,
 * the same inertness checkpoint 2GN.82 used. **R32 (any-decoration nudge) dropped from 98.0% to
 * 89.2%** — still comfortably exempt from `SATURATION_CEILING` by design (doc 12 §2.24), but the
 * largest single move in this array, since emphasis-only volume produces materially fewer
 * near-zero-decoration artefacts at low emphasis than the old blend did. R44 is new:
 * `meanDecorativeGrade >= p90` (its own JSDoc in `classification.ts` has the p75-vs-p90 argument).
 */
const EXPECTED_FIRE_RATES: readonly number[] = [
	39.3, // R1  hasEdge && !short → weapon/tool
	4.3, // R2  short sharp blade → dagger family
	6.6, // R3  short blunt blade → utility knife
	0.0, // R4  short body, non-short blade band — never observed (roadmap 2GN.87)
	24.8, // R5  edgeCount >= 2 → composite implement
	4.4, // R6  sharp point, no edge → piercing
	4.7, // R7  blunt point, no edge → craft tool
	19.2, // R8  wide/open container
	17.1, // R9  narrow/restricted container
	12.1, // R10 slit container
	17.6, // R11 sealed container
	23.1, // R12 thin-walled container → fine ware
	20.7, // R13 thick-walled container → utilitarian
	20.6, // R14 deep curvature → holds contents
	14.3, // R15 pedestal base → display/ritual
	6.5, // R16 pointed base → amphora storage
	13.2, // R17 central perforation → rotation
	12.4, // R18 off-centre perforation → suspension
	15.3, // R19 single perforation → pendant
	11.3, // R20 multiple perforations → fitting
	9.4, // R21 closed ring → worn
	25.3, // R22 open/overlapping ring → fastener
	9.4, // R23 rigid sheet → structural
	7.7, // R24 flexible sheet → covering
	7.5, // R25 heavy edge → labour tool (2GN.86 mass rebalance: was 21.6)
	15.4, // R26 heavy container → storage (2GN.86 mass rebalance: was 40.5)
	4.3, // R27 very-heavy → communal (2GN.86 made the band reachable: was 0.0)
	2.8, // R28 small size → personal
	21.3, // R29 attachmentDiversity >= p90 (2GN.98: was 21.5)
	31.3, // R30 decorativeLayerCount >= p75 (2GN.98 volume/refinement split: was 30.9)
	34.3, // R31 appliedElementCount >= p75 (2GN.98 volume/refinement split: was 37.3)
	89.2, // R32 any decoration → ornament nudge (2GN.98 volume/refinement split: was 98.0, still deliberately universal, doc 12 §2.24)
	0.0, // R33 DORMANT: preciousMaterialsInDecoration awaits roadmap 2GN.68
	0.0, // R34 DORMANT: motifCulturalOrigins awaits roadmap 2GN.68
	16.8, // R35 edged && layers >= p75 (2GN.98 volume/refinement split: was 16.6)
	24.4, // R36 container && layers >= p75 (2GN.98 volume/refinement split: was 25.0)
	2.2, // R37 fastening mechanism → fastener (2GN.86: more artefacts light enough)
	31.2, // R38 impact surface → percussion
	10.8, // R39 wearable → adornment (2GN.86: more artefacts light enough)
	29.4, // R40 decorativeComplexity >= p75 (2GN.98 volume/refinement split: was 29.8)
	7.0, // R41 decorativeComplexity >= p95 (2GN.98 volume/refinement split: was 5.8)
	27.9, // R42 decorativePerPart >= p75 (2GN.98 volume/refinement split: was 30.8)
	19.3, // R43 techniqueComplexity >= p90 (2GN.98 volume/refinement split: was 14.8)
	12.3, // R44 meanDecorativeGrade >= p90 → artisanal/elite (new, roadmap 2GN.98, doc 11 §1.5)
];

/**
 * Sub-population fire rates for R35/R36 (roadmap 2GN.82, doc 12 §2.31): each rule's rate *within
 * its own gate population* (edged artefacts, containers), not the whole sample. Recorded because
 * relativisation moved both rules to a whole-population baseline (`ClassificationContext` has no
 * sub-population baseline), and the whole-sweep rate above mixes the gate's own rate with the
 * threshold's — a change in, say, the share of edged artefacts a generator change produces could
 * move R35's whole-sweep rate without any change to how selectively it reads decoration, and this
 * guard would miss it. Pinning the gated rate directly closes that gap.
 */
const EXPECTED_GATED_RATES: Readonly<Record<'R35' | 'R36', number>> = {
	R35: 42.1, // of edged artefacts only (2GN.98 volume/refinement split: was 41.4)
	R36: 37.1, // of containers only (2GN.98 volume/refinement split: was 38.0)
};

/**
 * Per-cell sampled threshold values for a representative migrated feature at each rung actually
 * used (roadmap 2GN.82, doc 12 §2.31): `decorativeLayerCount` p75 (R30/R35/R36) and
 * `decorativeComplexity` p95 (R41), across the three `EMPHASES` settings. Pooled across the six
 * regional worlds, since these features are region-invariant (`expandGrammar`/`expandDecoration`'s
 * decorative stages read `decorativeEmphasis`, not geology, for these two).
 *
 * **This is what keeps the guard sensitive once fire rates sit close to their rung by
 * construction.** A migrated rule's fire rate is pinned near `(1 - percentile) * 100` almost by
 * definition, so a whole-distribution generator shift (the class of defect roadmap 2GN.86 found)
 * would move the baseline and the measured artefacts together and could pass `EXPECTED_FIRE_RATES`
 * with no drift at all. The threshold VALUE has no such stabiliser — it is a direct measurement of
 * where the generator's output distribution sits, and moves whenever that distribution does.
 *
 * **Re-recorded 2026-08-06 for `decorationVolume`'s emphasis-only reading (roadmap 2GN.98, doc 12
 * §2.33).** `decorationVolume` no longer reads `craftSpecialisation`, so the emphasis axis is now
 * the sole volume driver and its curve steepened materially: `layerP75` moved from 5/9/14 to
 * 2/8.7/20.2 at emphasis 0.1/0.5/1.0 — a much wider spread across the emphasis range than the old
 * blend produced, which is the intended effect of removing craft's dilution of the emphasis signal.
 */
const EXPECTED_THRESHOLDS: Readonly<Record<number, { layerP75: number; complexityP95: number }>> = {
	0.1: { layerP75: 2, complexityP95: 6.3 },
	0.5: { layerP75: 8.7, complexityP95: 22.8 },
	1.0: { layerP75: 20.2, complexityP95: 41.7 },
};

/** How far a sampled threshold value may drift from its recorded figure before this fails. */
const THRESHOLD_TOLERANCE = 3;

/**
 * How far a migrated rule's per-cell fire rate may spread (max − min across the 18 cells) before
 * this fails to catch a collapse toward uniformity (roadmap 2GN.82, doc 12 §2.31).
 *
 * Not a floor on discrimination — the ruling's whole premise is that relativisation *narrows*
 * per-cell spread relative to the absolute rules it replaced (R41 measured 2%–10%, an 8pp spread,
 * against the retired absolute rule's 4.3%–48.1%, a 44pp spread). This guard instead catches the
 * opposite failure: a baseline sampler bug that makes every cell read identically (spread ≈ 0),
 * which would mean the sampler stopped reflecting the culture it was pointed at.
 */
const SPREAD_FLOOR = 2;

/**
 * 0-based `CLASSIFICATION_RULES` indices of the nine rules migrated in roadmap 2GN.82, plus R44
 * (roadmap 2GN.98), which was authored directly against `ClassificationContext.exceeds` rather than
 * migrated but is equally exposed to the failure this guard catches: a baseline sampler bug that
 * makes a context-sensitive rule read identically across culture-phases.
 */
const MIGRATED_RULE_INDICES: Readonly<
	Record<'R29' | 'R30' | 'R31' | 'R35' | 'R36' | 'R40' | 'R41' | 'R42' | 'R43' | 'R44', number>
> = {
	R29: 28,
	R30: 29,
	R31: 30,
	R35: 34,
	R36: 35,
	R40: 39,
	R41: 40,
	R42: 41,
	R43: 42,
	R44: 43,
};

/**
 * Builds a real per-cell `ClassificationContext`, one per `region`/`emphasis` combination
 * (roadmap 2GN.82, doc 12 §2.31).
 *
 * `mockRegionalWorld` cells are not `ExplorerCulture`s, so `CulturePhaseSample` is assembled by
 * hand here — the type is a structural bag precisely so a caller with the four parts can build one
 * (`engine/generation/baselines.ts`). Sampled at the ruled n=400, not a reduced test-only size:
 * eighteen real contexts cost well under a second (measured during planning), so there is nothing
 * to buy by sampling thinner, and a reduced size would measure rates the shipped game never sees —
 * the exact failure mode this guard exists to catch.
 *
 * **Seeded from a base distinct from the artefacts being measured** (`'calibration-baseline'`, not
 * `${region}-${emphasis}`): `sampleBaselines` composes `${seed}-${cultureId}-${phaseId}-${index}`,
 * so the two seed families never collide regardless, but a distinct base removes the need for
 * anyone to re-derive that. Measured during planning: baselines seeded from the same prefix as the
 * measured artefacts differ from independently-seeded ones by under 1pp — well inside
 * `TOLERANCE_POINTS` — so this is a belt-and-braces choice, not a correction to a real problem.
 */
function baselineFor(
	culture: ReturnType<typeof mockCulturalProfile>,
	region: (typeof MOCK_WORLD_REGIONS)[number],
	emphasis: number,
	phase: ReturnType<typeof mockPhaseCharacteristics>,
): ClassificationContext {
	const world = mockRegionalWorld(region);
	return sampleBaselines(
		'calibration-baseline',
		{
			cultureId: region,
			phaseId: String(emphasis),
			profile: culture,
			phase,
			geology: world.geology,
			trade: world.trade,
		},
		CORE_GRAMMAR_RULES,
		MATERIALS,
		DECORATIVE_TECHNIQUES,
	);
}

/**
 * Runs the pipeline across every world and emphasis, returning each rule's fire rate as a
 * percentage, plus the extra measurements the migrated-rule guards below need.
 *
 * `expandGrammar` (structural rules R1–R29) takes no region-specific input, so those rules'
 * measured rates reflect region-wide availability rather than any one world; only
 * `expandDecoration` (decorative rules R30 onward) reads `world.geology` and `world.trade`
 * per region. Sampled at `SAMPLES_PER_CELL` per world per emphasis, n=1800 total, against one real
 * `ClassificationContext` per cell (18 total) built by `baselineFor`.
 */
function measureFireRates(): {
	rates: number[];
	sampleSize: number;
	gatedRates: { R35: number; R36: number };
	cellRates: Map<number, number[]>;
	thresholdsByEmphasis: Map<number, { layerP75: number[]; complexityP95: number[] }>;
} {
	const culture = mockCulturalProfile();
	const fires = new Array(CLASSIFICATION_RULES.length).fill(0);
	let sampleSize = 0;

	let edgedCount = 0;
	let edgedFireR35 = 0;
	let containerCount = 0;
	let containerFireR36 = 0;

	// Per-cell fire counts for the migrated nine, keyed by rule index — feeds the spread guard.
	const cellFires = new Map<number, number[]>(
		Object.values(MIGRATED_RULE_INDICES).map((index) => [index, []]),
	);
	// Sampled threshold values grouped by emphasis (region-invariant for these two features).
	const thresholdsByEmphasis = new Map<number, { layerP75: number[]; complexityP95: number[] }>(
		EMPHASES.map((emphasis) => [emphasis, { layerP75: [], complexityP95: [] }]),
	);

	for (const region of MOCK_WORLD_REGIONS) {
		const world = mockRegionalWorld(region);

		for (const emphasis of EMPHASES) {
			const phase = mockPhaseCharacteristics({ aesthetics: { decorativeEmphasis: emphasis } });
			const context = baselineFor(culture, region, emphasis, phase);

			const layerP75 = context.baselines.get('decorativeLayerCount')?.thresholds.get(0.75);
			const complexityP95 = context.baselines.get('decorativeComplexity')?.thresholds.get(0.95);
			if (layerP75 !== undefined) thresholdsByEmphasis.get(emphasis)!.layerP75.push(layerP75);
			if (complexityP95 !== undefined) {
				thresholdsByEmphasis.get(emphasis)!.complexityP95.push(complexityP95);
			}

			const cellFireCounts = new Map<number, number>(
				Object.values(MIGRATED_RULE_INDICES).map((index) => [index, 0]),
			);

			for (let index = 0; index < SAMPLES_PER_CELL; index++) {
				const seed = `${region}-${emphasis}-${index}`;
				const artefact = normaliseArtefact(
					expandGrammar(CORE_GRAMMAR_RULES, culture, phase, createPrng(seed)),
					`calibration-${seed}`,
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

				if (extracted.hasEdge) {
					edgedCount++;
					if (CLASSIFICATION_RULES[MIGRATED_RULE_INDICES.R35].condition(extracted, context)) {
						edgedFireR35++;
					}
				}
				if (extracted.hasContainer) {
					containerCount++;
					if (CLASSIFICATION_RULES[MIGRATED_RULE_INDICES.R36].condition(extracted, context)) {
						containerFireR36++;
					}
				}

				CLASSIFICATION_RULES.forEach((rule, ruleIndex) => {
					if (rule.condition(extracted, context)) {
						fires[ruleIndex]++;
						const cellCount = cellFireCounts.get(ruleIndex);
						if (cellCount !== undefined) cellFireCounts.set(ruleIndex, cellCount + 1);
					}
				});
				sampleSize++;
			}

			for (const [ruleIndex, count] of cellFireCounts) {
				cellFires.get(ruleIndex)!.push((count / SAMPLES_PER_CELL) * 100);
			}
		}
	}

	return {
		rates: fires.map((count) => (count / sampleSize) * 100),
		sampleSize,
		gatedRates: {
			R35: edgedCount === 0 ? 0 : (edgedFireR35 / edgedCount) * 100,
			R36: containerCount === 0 ? 0 : (containerFireR36 / containerCount) * 100,
		},
		cellRates: cellFires,
		thresholdsByEmphasis,
	};
}

/** Measured once: the sweep is deterministic, and every test below reads the same measurement. */
let measured: ReturnType<typeof measureFireRates> | undefined;
function fireRates(): ReturnType<typeof measureFireRates> {
	measured ??= measureFireRates();
	return measured;
}

Deno.test('calibration: EXPECTED_FIRE_RATES covers every shipped rule', () => {
	assert(
		EXPECTED_FIRE_RATES.length === CLASSIFICATION_RULES.length,
		`EXPECTED_FIRE_RATES has ${EXPECTED_FIRE_RATES.length} entries for ` +
			`${CLASSIFICATION_RULES.length} rules — a rule was added or removed without recalibrating. ` +
			`Measure the new rate against the six regional worlds and record it.`,
	);
});

Deno.test('calibration: every rule fires within tolerance of its recorded rate', () => {
	const { rates, sampleSize } = fireRates();
	const drifted: string[] = [];

	rates.forEach((actual, index) => {
		const expected = EXPECTED_FIRE_RATES[index];
		if (expected === undefined) return; // Covered by the length test above.
		if (Math.abs(actual - expected) > TOLERANCE_POINTS) {
			drifted.push(
				`  R${index + 1}: ${actual.toFixed(1)}% now, ${expected.toFixed(1)}% recorded ` +
					`(drift ${(actual - expected).toFixed(1)}pp)`,
			);
		}
	});

	assert(
		drifted.length === 0,
		`${drifted.length} rule(s) drifted more than ${TOLERANCE_POINTS}pp at n=${sampleSize}:\n` +
			`${drifted.join('\n')}\n\n` +
			`Under classifyArtefact's plain-sum fold a changed fire rate changes what the tag scores ` +
			`mean, so re-measure and decide each rule deliberately rather than widening the band.`,
	);
});

Deno.test('calibration: R35/R36 sub-population rates stay within tolerance (roadmap 2GN.82)', () => {
	const { gatedRates } = fireRates();
	const drifted: string[] = [];

	(['R35', 'R36'] as const).forEach((label) => {
		const actual = gatedRates[label];
		const expected = EXPECTED_GATED_RATES[label];
		if (Math.abs(actual - expected) > TOLERANCE_POINTS) {
			drifted.push(
				`  ${label}: ${actual.toFixed(1)}% of its gate population now, ${
					expected.toFixed(1)
				}% recorded`,
			);
		}
	});

	assert(
		drifted.length === 0,
		`sub-population rate(s) drifted more than ${TOLERANCE_POINTS}pp:\n${drifted.join('\n')}\n\n` +
			`The whole-sweep rate in EXPECTED_FIRE_RATES can stay steady while a rule's rate within its ` +
			`own gate population (edged artefacts, containers) moves — this guard catches that case.`,
	);
});

Deno.test('calibration: sampled thresholds track the recorded distribution (roadmap 2GN.82)', () => {
	const { thresholdsByEmphasis } = fireRates();
	const drifted: string[] = [];

	for (const [emphasis, expected] of Object.entries(EXPECTED_THRESHOLDS)) {
		const sampled = thresholdsByEmphasis.get(Number(emphasis));
		if (sampled === undefined) continue;

		const meanLayerP75 = sampled.layerP75.reduce((a, b) => a + b, 0) / sampled.layerP75.length;
		const meanComplexityP95 = sampled.complexityP95.reduce((a, b) => a + b, 0) /
			sampled.complexityP95.length;

		if (Math.abs(meanLayerP75 - expected.layerP75) > THRESHOLD_TOLERANCE) {
			drifted.push(
				`  emphasis ${emphasis}: decorativeLayerCount p75 = ${
					meanLayerP75.toFixed(1)
				}, ${expected.layerP75} recorded`,
			);
		}
		if (Math.abs(meanComplexityP95 - expected.complexityP95) > THRESHOLD_TOLERANCE) {
			drifted.push(
				`  emphasis ${emphasis}: decorativeComplexity p95 = ${
					meanComplexityP95.toFixed(1)
				}, ${expected.complexityP95} recorded`,
			);
		}
	}

	assert(
		drifted.length === 0,
		`sampled threshold(s) drifted more than ${THRESHOLD_TOLERANCE}:\n${drifted.join('\n')}\n\n` +
			`Once a migrated rule's fire rate sits close to its percentile rung by construction, the ` +
			`threshold VALUE is what still reflects a real shift in the generator's output distribution ` +
			`— re-measure and decide deliberately, per the fire-rate guard's own convention.`,
	);
});

Deno.test('calibration: migrated rules discriminate across culture-phases, not just fire near their rung', () => {
	const { cellRates } = fireRates();
	const collapsed: string[] = [];

	for (const [label, ruleIndex] of Object.entries(MIGRATED_RULE_INDICES)) {
		const cells = cellRates.get(ruleIndex);
		if (cells === undefined || cells.length === 0) continue;
		const spread = Math.max(...cells) - Math.min(...cells);
		if (spread < SPREAD_FLOOR) {
			collapsed.push(
				`  ${label}: per-cell spread ${spread.toFixed(1)}pp (min ${
					Math.min(...cells).toFixed(1)
				}%, ` +
					`max ${Math.max(...cells).toFixed(1)}%)`,
			);
		}
	}

	assert(
		collapsed.length === 0,
		`migrated rule(s) show no meaningful per-cell spread (< ${SPREAD_FLOOR}pp):\n${
			collapsed.join('\n')
		}\n\n` +
			`A real culture-relative baseline should still vary across eighteen distinct culture-phases ` +
			`— a spread this flat suggests the sampler stopped reflecting the culture it was pointed at.`,
	);
});

/**
 * The defect 2GN.79 corrected, stated as an invariant: a rule whose JSDoc claims selectivity must
 * not fire on nearly everything. The any-decoration nudge is exempt by name — doc 12 §2.24 records
 * its near-universal firing as intended behaviour, not divergence.
 */
Deno.test('calibration: no rule claiming selectivity fires near-universally', () => {
	const { rates } = fireRates();
	const UNIVERSAL_BY_DESIGN = new Set([31]); // 0-based index of the any-decoration nudge (R32).

	const saturated = rates
		.map((rate, index) => ({ rate, index }))
		.filter(({ rate, index }) => !UNIVERSAL_BY_DESIGN.has(index) && rate > SATURATION_CEILING)
		.map(({ rate, index }) => `R${index + 1} at ${rate.toFixed(1)}%`);

	assert(
		saturated.length === 0,
		`rule(s) firing above ${SATURATION_CEILING}% without being documented as universal: ` +
			`${saturated.join(', ')}. A rule this common adds a near-constant to every score rather ` +
			`than discriminating (doc 12 §2.21) — either retune it or document it as a deliberate ` +
			`universal nudge and exempt it here.`,
	);
});
