/// <reference lib="deno.ns" />
import { assert, assertEquals, assertNotEquals, assertThrows } from '@std/assert';
import { BASELINE_SAMPLE_SIZE, emptyClassificationContext, sampleBaselines } from './baselines.ts';
import { PERCENTILE_LADDER } from '../statistics.ts';
import { CORE_GRAMMAR_RULES } from '../../data/grammars/core.ts';
import { MATERIALS } from '../../data/materials.ts';
import { DECORATIVE_TECHNIQUES } from '../../data/decorations.ts';
import { EXPLORER_CULTURES, explorerCulturePhase } from '../../data/explorer-cultures.ts';
import type { BaselineFeature } from '../../types/tags.ts';

const tarpan = explorerCulturePhase(EXPLORER_CULTURES.find((c) => c.id === 'tarpan')!);
const thalassar = explorerCulturePhase(EXPLORER_CULTURES.find((c) => c.id === 'thalassar')!);

/** A small sample size for fast structural tests that don't need statistical stability. */
const SMALL_SAMPLE = 20;

function sample(seed: string, target = tarpan, sampleSize = SMALL_SAMPLE) {
	return sampleBaselines(
		seed,
		target,
		CORE_GRAMMAR_RULES,
		MATERIALS,
		DECORATIVE_TECHNIQUES,
		sampleSize,
	);
}

Deno.test('sampleBaselines: same seed and target produce a deeply equal context', () => {
	const first = sample('determinism-check');
	const second = sample('determinism-check');

	assertEquals(first.cultureId, second.cultureId);
	assertEquals(first.phaseId, second.phaseId);
	assertEquals([...first.baselines.entries()], [...second.baselines.entries()]);
});

Deno.test('sampleBaselines: different seeds produce different thresholds', () => {
	const first = sample('seed-a');
	const second = sample('seed-b');

	assertNotEquals(
		[...first.baselines.entries()],
		[...second.baselines.entries()],
		'two different seeds should not sample identical distributions',
	);
});

Deno.test('sampleBaselines: every sampled feature carries all five PERCENTILE_LADDER rungs and the recorded sample size', () => {
	const context = sample('ladder-completeness');

	for (const [feature, baseline] of context.baselines) {
		assertEquals(baseline.sampleSize, SMALL_SAMPLE, `${feature} sampleSize`);
		for (const rung of PERCENTILE_LADDER) {
			assert(baseline.thresholds.has(rung), `${feature} is missing rung ${rung}`);
		}
	}
});

Deno.test('sampleBaselines: thresholds are monotonic across the percentile ladder', () => {
	const context = sample('monotonicity', thalassar, 50);

	for (const [feature, baseline] of context.baselines) {
		const values = PERCENTILE_LADDER.map((rung) => baseline.thresholds.get(rung)!);
		for (let i = 1; i < values.length; i++) {
			assert(
				values[i] >= values[i - 1],
				`${feature}: p${PERCENTILE_LADDER[i] * 100} (${values[i]}) < ` +
					`p${PERCENTILE_LADDER[i - 1] * 100} (${values[i - 1]})`,
			);
		}
	}
});

Deno.test('sampleBaselines: a more decorative culture has a strictly higher decorativeComplexity p75', () => {
	// Tarpan (decorativeEmphasis 0.4) vs Thalassar (0.75) — the ruling's premise, checked empirically.
	// A larger sample than the structural tests above: this assertion is about the *shape* of two
	// distributions, not just their presence, so it needs enough draws to be stable.
	const sampleSize = 200;
	const low = sampleBaselines(
		'discrimination',
		tarpan,
		CORE_GRAMMAR_RULES,
		MATERIALS,
		DECORATIVE_TECHNIQUES,
		sampleSize,
	);
	const high = sampleBaselines(
		'discrimination',
		thalassar,
		CORE_GRAMMAR_RULES,
		MATERIALS,
		DECORATIVE_TECHNIQUES,
		sampleSize,
	);

	const lowP75 = low.baselines.get('decorativeComplexity')!.thresholds.get(0.75)!;
	const highP75 = high.baselines.get('decorativeComplexity')!.thresholds.get(0.75)!;

	assert(
		highP75 > lowP75,
		`expected Thalassar's decorativeComplexity p75 (${highP75}) to exceed Tarpan's (${lowP75}) — ` +
			`if this fails, the culture-relativity ruling's premise fails its first empirical test`,
	);
});

Deno.test('sampleBaselines: defaults to BASELINE_SAMPLE_SIZE (400) when sampleSize is omitted', () => {
	const context = sampleBaselines(
		'default-size',
		tarpan,
		CORE_GRAMMAR_RULES,
		MATERIALS,
		DECORATIVE_TECHNIQUES,
	);
	const anyBaseline = context.baselines.values().next().value!;

	assertEquals(anyBaseline.sampleSize, BASELINE_SAMPLE_SIZE);
	assertEquals(BASELINE_SAMPLE_SIZE, 400);
});

Deno.test('ClassificationContext.exceeds: throws on an off-ladder percentile', () => {
	const context = sample('exceeds-contract');
	assertThrows(
		() => context.exceeds('decorativeComplexity', 0.6, 10),
		Error,
		'PERCENTILE_LADDER',
	);
});

Deno.test('sampleBaselines: sampleSize 0 throws rather than silently producing an empty context', () => {
	// A caller error, not a legitimate "no baseline" state — percentileLadder rejects an empty
	// sample outright (statistics.ts), so this never produces a context with missing entries.
	assertThrows(
		() =>
			sampleBaselines('zero-size', tarpan, CORE_GRAMMAR_RULES, MATERIALS, DECORATIVE_TECHNIQUES, 0),
		Error,
		'must not be empty',
	);
});

Deno.test('ClassificationContext.exceeds: returns false for a feature with no baseline entry', () => {
	// sampleBaselines always populates every SAMPLED_FEATURES key, so the "no baseline" path is
	// exercised against emptyClassificationContext — the honest contract test for `exceeds`,
	// independent of how any particular caller builds its context.
	const empty = emptyClassificationContext();

	assertEquals(empty.hasBaseline('decorativeComplexity' as BaselineFeature), false);
	assertEquals(empty.exceeds('decorativeComplexity' as BaselineFeature, 0.75, 999_999), false);
});

Deno.test('ClassificationContext.exceeds: a value exactly at the threshold returns true (>= convention)', () => {
	const context = sample('exceeds-boundary');
	const baseline = context.baselines.get('decorativeComplexity')!;
	const p75 = baseline.thresholds.get(0.75)!;

	assertEquals(context.exceeds('decorativeComplexity', 0.75, p75), true);
});

Deno.test('ClassificationContext.hasBaseline: true for every sampled feature', () => {
	const context = sample('has-baseline');
	for (const feature of context.baselines.keys()) {
		assertEquals(context.hasBaseline(feature), true);
	}
});
