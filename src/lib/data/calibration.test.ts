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
 * Sample size is deliberately modest (100 per world per emphasis, n=1800) so the suite stays fast;
 * `TOLERANCE_POINTS` is set wide enough to absorb the resulting sampling noise. The full 7200-sample
 * numbers that set the thresholds live in doc 12 §2.24/§2.25.
 */

import { assert } from '@std/assert';
import { createPrng } from '../engine/prng.ts';
import { expandGrammar, normaliseArtefact } from '../engine/generation/grammar.ts';
import { expandDecoration } from '../engine/generation/decoration.ts';
import { extractFeatures } from '../engine/generation/classification.ts';
import { CORE_GRAMMAR_RULES } from './grammars/core.ts';
import { CLASSIFICATION_RULES } from './classification.ts';
import { MATERIALS } from './materials.ts';
import { DECORATIVE_TECHNIQUES } from './decorations.ts';
import { mockCulturalProfile, mockPhaseCharacteristics } from '../../../tests/fixtures/culture.ts';
import { MOCK_WORLD_REGIONS, mockRegionalWorld } from '../../../tests/fixtures/world.ts';

/** Artefacts sampled per world per emphasis setting. Six worlds × three settings × this. */
const SAMPLES_PER_CELL = 100;

/** Emphasis settings sampled, spanning the range a real culture can sit at. */
const EMPHASES = [0.1, 0.5, 1.0];

/**
 * How far a rule may drift from its recorded rate before this fails, in percentage points. Wide
 * enough that sampling noise at n=1800 never trips it, narrow enough that a rule doubling or
 * halving its selectivity does.
 */
const TOLERANCE_POINTS = 10;

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
 */
const EXPECTED_FIRE_RATES: readonly number[] = [
	39.3, // R1  hasEdge && !short → weapon/tool
	4.3, // R2  short sharp blade → dagger family
	6.6, // R3  short blunt blade → utility knife
	0.0, // R4  short body, non-short blade band (grammar cannot currently produce this)
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
	24.0, // R29 attachmentDiversity >= 3 → engineered assembly (retuned, 2GN.79)
	26.8, // R30 decorativeLayerCount >= 10 → heavily worked (measured p75, 2GN.34)
	25.7, // R31 appliedElementCount >= 4 → deliberate embellishment (retuned, 2GN.79)
	98.0, // R32 any decoration → ornament nudge (deliberately universal, doc 12 §2.24)
	0.0, // R33 DORMANT: preciousMaterialsInDecoration awaits roadmap 2GN.68
	0.0, // R34 DORMANT: motifCulturalOrigins awaits roadmap 2GN.68
	24.7, // R35 edged && layers >= 6 → the engraved-blade archetype (measured p50, 2GN.34)
	40.8, // R36 container && layers >= 6 → ritual vessel (measured p50, 2GN.34)
	2.2, // R37 fastening mechanism → fastener (2GN.86: more artefacts light enough)
	31.2, // R38 impact surface → percussion
	10.8, // R39 wearable → adornment (2GN.86: more artefacts light enough)
	29.6, // R40 decorativeComplexity >= 16 → lavish (measured p75, 2GN.34)
	7.7, // R41 decorativeComplexity >= 25 → exceptionally lavish (~p93, 2GN.34)
	33.2, // R42 complexity/partCount >= 4 → lavish for its size (measured p75, 2GN.34)
	20.9, // R43 techniqueComplexity >= 8 → technique breadth (measured p90, 2GN.34)
];

/** Runs the pipeline across every world and emphasis, returning each rule's fire rate as a percentage. */
function measureFireRates(): { rates: number[]; sampleSize: number } {
	const culture = mockCulturalProfile();
	const fires = new Array(CLASSIFICATION_RULES.length).fill(0);
	let sampleSize = 0;

	for (const region of MOCK_WORLD_REGIONS) {
		const world = mockRegionalWorld(region);

		for (const emphasis of EMPHASES) {
			const phase = mockPhaseCharacteristics({ aesthetics: { decorativeEmphasis: emphasis } });

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

				CLASSIFICATION_RULES.forEach((rule, ruleIndex) => {
					if (rule.condition(extracted)) fires[ruleIndex]++;
				});
				sampleSize++;
			}
		}
	}

	return { rates: fires.map((count) => (count / sampleSize) * 100), sampleSize };
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
	const { rates, sampleSize } = measureFireRates();
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

/**
 * The defect 2GN.79 corrected, stated as an invariant: a rule whose JSDoc claims selectivity must
 * not fire on nearly everything. The any-decoration nudge is exempt by name — doc 12 §2.24 records
 * its near-universal firing as intended behaviour, not divergence.
 */
Deno.test('calibration: no rule claiming selectivity fires near-universally', () => {
	const { rates } = measureFireRates();
	const UNIVERSAL_BY_DESIGN = new Set([31]); // 0-based index of the any-decoration nudge (R32).
	const SATURATION_CEILING = 60;

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
