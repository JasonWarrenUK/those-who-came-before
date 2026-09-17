/// <reference lib="deno.ns" />
/**
 * Regression guard for `TAG_FREQUENCY` and `TAG_COOCCURRENCE_LIFT` (roadmap 2GN.48 spike,
 * `docs/spikes/2GN.48-scholar-cohort.md`).
 *
 * Both tables are measured, not authored — pipeline stages 4-8 over the four Explorer presets at
 * n=400 each — and frozen because `generateNPCScholars(cultures, chronology, prng)` has no
 * grammar rules, material/classification catalogues or baseline context to sample from live. A
 * frozen table drifts silently from the generator it was measured against whenever
 * `data/decorations.ts`, `data/materials.ts` or `data/classification.ts` change; this file is
 * what turns that drift into a failing test instead of a stale constant nobody notices.
 *
 * Re-runs the same sweep and asserts the shipped tables still hold within tolerance — a real
 * re-measurement re-derives every value from a different seed-label sequence than the one
 * originally recorded, so exact equality is the wrong check (the spike's own two runs differed in
 * the 4th decimal place purely from that). If a rule change moves a value past tolerance, the fix
 * is to re-measure and re-record deliberately (the `materials.calibration.test.ts` precedent),
 * never to loosen the tolerance to make a real drift pass quietly.
 */
import { assert, assertEquals } from '@std/assert';
import { createPrng } from '../engine/prng.ts';
import { expandDecoration, gradeDecorativeLayers } from '../engine/generation/decoration.ts';
import { assignMaterials } from '../engine/generation/materials.ts';
import { classifyArtefact, extractFeatures } from '../engine/generation/classification.ts';
import { expandGrammar, normaliseArtefact } from '../engine/generation/grammar.ts';
import { sampleBaselines } from '../engine/generation/baselines.ts';
import { CORE_GRAMMAR_RULES } from './grammars/core.ts';
import { CLASSIFICATION_RULES } from './classification.ts';
import { MATERIALS } from './materials.ts';
import { DECORATIVE_TECHNIQUES } from './decorations.ts';
import { EXPLORER_CULTURES, explorerCulturePhase } from './explorer-cultures.ts';
import { TAG_COOCCURRENCE_LIFT, TAG_FREQUENCY } from './scholars.ts';
import type { ArtefactTag } from '../types/tags.ts';

const N_PER_PRESET = 400;
const AWARD_THRESHOLD = 0.1;
const MIN_PAIR_SUPPORT = 20;

/** Points of tolerance on a 0-100 percentage-point scale, matching the
 * `materials.calibration.test.ts` convention. A re-measure differs in the low decimals purely
 * from seed-label ordering; this catches a real shift in the generator, not sampling noise. */
const FREQUENCY_TOLERANCE_POINTS = 3;
const LIFT_TOLERANCE = 0.15; // absolute difference in the lift ratio itself

interface SweepResult {
	tagFrequency: Record<string, number>;
	tagCooccurrenceLift: Record<string, number>;
	totalArtefacts: number;
}

/** Re-runs the measurement sweep the spike used: pipeline stages 4-8 over all four Explorer
 * presets, counting tag frequency and pairwise co-occurrence lift at the shipped threshold. */
function sweep(): SweepResult {
	const pairCounts = new Map<string, number>();
	const tagCounts = new Map<string, number>();
	let totalArtefacts = 0;

	for (const culture of EXPLORER_CULTURES) {
		const context = sampleBaselines(
			`calibration-${culture.id}`,
			explorerCulturePhase(culture),
			CORE_GRAMMAR_RULES,
			MATERIALS,
			DECORATIVE_TECHNIQUES,
		);

		for (let i = 0; i < N_PER_PRESET; i++) {
			const seed = `${culture.id}-${i}`;
			const prng = createPrng(seed);
			const expanded = expandGrammar(CORE_GRAMMAR_RULES, culture.profile, culture.phase, prng);
			const artefact = normaliseArtefact(expanded, `calibration-${seed}`);
			const layers = expandDecoration(
				artefact,
				culture.profile,
				culture.phase,
				culture.geology,
				culture.trade,
				createPrng(`${seed}-decoration`),
				MATERIALS,
				DECORATIVE_TECHNIQUES,
			);
			const assignments = assignMaterials(
				artefact,
				culture.profile,
				culture.phase,
				culture.geology,
				culture.trade,
				createPrng(`${seed}-materials`),
				MATERIALS,
			);
			const gradedLayers = gradeDecorativeLayers(layers, assignments, culture.phase, MATERIALS);
			const features = extractFeatures(artefact, gradedLayers, assignments);
			const tags = classifyArtefact(features, CLASSIFICATION_RULES, context);

			totalArtefacts++;
			const present = [...tags.entries()]
				.filter(([, score]) => score >= AWARD_THRESHOLD)
				.map(([tag]) => tag);
			for (const tag of present) tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
			for (let a = 0; a < present.length; a++) {
				for (let b = a + 1; b < present.length; b++) {
					const key = [present[a], present[b]].sort().join('+');
					pairCounts.set(key, (pairCounts.get(key) ?? 0) + 1);
				}
			}
		}
	}

	const tagFrequency: Record<string, number> = {};
	for (const [tag, count] of tagCounts.entries()) tagFrequency[tag] = count / totalArtefacts;

	const tagCooccurrenceLift: Record<string, number> = {};
	for (const [pair, count] of pairCounts.entries()) {
		if (count < MIN_PAIR_SUPPORT) continue;
		const [a, b] = pair.split('+');
		tagCooccurrenceLift[pair] = (count / totalArtefacts) / (tagFrequency[a] * tagFrequency[b]);
	}

	return { tagFrequency, tagCooccurrenceLift, totalArtefacts };
}

// One sweep, shared by every assertion below — the sweep itself is deterministic per run, and
// re-running it per test would multiply an already-1600-artefact pass for no benefit.
const measured = sweep();

Deno.test('scholars calibration: every shipped TAG_FREQUENCY entry stays within tolerance', () => {
	for (const [tag, shipped] of Object.entries(TAG_FREQUENCY)) {
		const actual = measured.tagFrequency[tag] ?? 0;
		const diffPoints = Math.abs(actual - shipped) * 100;
		if (diffPoints > FREQUENCY_TOLERANCE_POINTS) {
			throw new Error(
				`TAG_FREQUENCY['${tag}'] shipped ${(shipped * 100).toFixed(1)}%, measured ` +
					`${(actual * 100).toFixed(1)}% (diff ${diffPoints.toFixed(1)}pp, tolerance ` +
					`${FREQUENCY_TOLERANCE_POINTS}pp) — re-measure and re-record deliberately if a rule ` +
					`change moved this, don't loosen the tolerance`,
			);
		}
	}
});

Deno.test('scholars calibration: trade-good and currency still never fire', () => {
	assertEquals(measured.tagFrequency['trade-good'], undefined);
	assertEquals(measured.tagFrequency['currency'], undefined);
});

Deno.test('scholars calibration: every shipped TAG_COOCCURRENCE_LIFT entry stays within tolerance', () => {
	for (const [pair, shipped] of Object.entries(TAG_COOCCURRENCE_LIFT)) {
		const actual = measured.tagCooccurrenceLift[pair];
		assert(
			actual !== undefined,
			`TAG_COOCCURRENCE_LIFT['${pair}'] shipped but the pair no longer clears the ` +
				`n=${MIN_PAIR_SUPPORT} support threshold on re-measure`,
		);
		const diff = Math.abs(actual - shipped);
		if (diff > LIFT_TOLERANCE) {
			throw new Error(
				`TAG_COOCCURRENCE_LIFT['${pair}'] shipped ${shipped.toFixed(3)}, measured ` +
					`${actual.toFixed(3)} (diff ${diff.toFixed(3)}, tolerance ${LIFT_TOLERANCE}) — ` +
					`re-measure and re-record deliberately if a rule change moved this`,
			);
		}
	}
});

Deno.test("scholars calibration: the top-15-by-lift ranking is stable (matches the spike's stability check)", () => {
	const shippedRanked = Object.entries(TAG_COOCCURRENCE_LIFT)
		.sort((a, b) => b[1] - a[1])
		.slice(0, 15)
		.map(([pair]) => pair);
	const measuredRanked = Object.entries(measured.tagCooccurrenceLift)
		.sort((a, b) => b[1] - a[1])
		.slice(0, 15)
		.map(([pair]) => pair);

	const overlap = shippedRanked.filter((pair) => measuredRanked.includes(pair));
	// The spike measured 10/15 overlap between two different thresholds (0.1 vs 0.25) as evidence
	// the ranking is real; a same-threshold re-measure should agree at least as well.
	assert(
		overlap.length >= 10,
		`top-15-by-lift overlap dropped to ${overlap.length}/15 (spike's cross-threshold baseline ` +
			`was 10/15) — the coherence signal itself may have shifted, not just its exact values`,
	);
});

Deno.test('scholars calibration: TAG_FREQUENCY has no stale entries the sweep no longer measures', () => {
	const measuredTags = new Set(Object.keys(measured.tagFrequency));
	for (const tag of Object.keys(TAG_FREQUENCY) as ArtefactTag[]) {
		assert(measuredTags.has(tag), `TAG_FREQUENCY ships '${tag}' but it no longer fires at all`);
	}
});
