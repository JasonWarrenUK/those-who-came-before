/// <reference lib="deno.ns" />
import { assert, assertEquals, assertNotEquals } from '@std/assert';
import { createPrng, pickRanked, RANKED_DROPOFF, weightedSelect } from './prng.ts';
import { mockWorldSeed } from '../../../tests/fixtures/world.ts';

function drawSequence(prng: () => number, count: number): number[] {
	return Array.from({ length: count }, () => prng());
}

Deno.test('createPrng: same seed produces identical sequence', () => {
	const first = createPrng('test-seed-42');
	const second = createPrng('test-seed-42');

	assertEquals(drawSequence(first, 50), drawSequence(second, 50));
});

Deno.test('createPrng: different seeds produce different sequences', () => {
	const a = createPrng('test-seed-42');
	const b = createPrng('test-seed-43');

	assertNotEquals(drawSequence(a, 10), drawSequence(b, 10));
});

Deno.test('createPrng: output stays within [0, 1)', () => {
	const prng = createPrng('range-check');

	for (const value of drawSequence(prng, 10_000)) {
		assert(value >= 0 && value < 1, `value out of range: ${value}`);
	}
});

Deno.test('createPrng: output is approximately uniform over a large sample', () => {
	const prng = createPrng('distribution-test');
	const sampleSize = 100_000;
	const values = drawSequence(prng, sampleSize);

	const mean = values.reduce((sum, value) => sum + value, 0) / sampleSize;
	assert(
		Math.abs(mean - 0.5) < 0.01,
		`expected mean close to 0.5, got ${mean}`,
	);

	const bucketCount = 10;
	const buckets = new Array(bucketCount).fill(0);
	for (const value of values) {
		buckets[Math.min(bucketCount - 1, Math.floor(value * bucketCount))]++;
	}

	const expectedPerBucket = sampleSize / bucketCount;
	for (const [index, count] of buckets.entries()) {
		const deviation = Math.abs(count - expectedPerBucket) / expectedPerBucket;
		assert(
			deviation < 0.05,
			`bucket ${index} deviates from uniform by ${(deviation * 100).toFixed(1)}% (count=${count})`,
		);
	}
});

Deno.test('weightedSelect: same seed reproduces the same selection sequence', () => {
	const items = [
		{ label: 'common', weight: 8 },
		{ label: 'rare', weight: 2 },
	];

	const first = createPrng('weighted-repeat');
	const second = createPrng('weighted-repeat');

	const firstRun = Array.from(
		{ length: 20 },
		() => weightedSelect(items, first, (item) => item.weight).label,
	);
	const secondRun = Array.from(
		{ length: 20 },
		() => weightedSelect(items, second, (item) => item.weight).label,
	);

	assertEquals(firstRun, secondRun);
});

Deno.test('weightedSelect: observed frequencies track configured weights', () => {
	const items = [
		{ label: 'common', weight: 8 },
		{ label: 'rare', weight: 2 },
	];
	const prng = createPrng('weighted-distribution');
	const draws = 10_000;

	const counts = { common: 0, rare: 0 };
	for (let i = 0; i < draws; i++) {
		counts[weightedSelect(items, prng, (item) => item.weight).label as 'common' | 'rare']++;
	}

	const commonRatio = counts.common / draws;
	assert(
		Math.abs(commonRatio - 0.8) < 0.03,
		`expected ~80% common, got ${(commonRatio * 100).toFixed(1)}% (counts=${
			JSON.stringify(counts)
		})`,
	);
});

Deno.test('weightedSelect: falls back to uniform selection when total weight is zero', () => {
	const items = [{ id: 'a', weight: 0 }, { id: 'b', weight: 0 }];
	const prng = createPrng('zero-weight');

	const seen = new Set<string>();
	for (let i = 0; i < 50; i++) {
		seen.add(weightedSelect(items, prng, (item) => item.weight).id);
	}

	assert(seen.size > 1, 'expected both items to be selectable under zero total weight');
});

Deno.test('weightedSelect: throws on empty items', () => {
	const prng = createPrng('empty-check');

	let threw = false;
	try {
		weightedSelect([], prng, () => 1);
	} catch {
		threw = true;
	}

	assert(threw, 'expected weightedSelect to throw on an empty items array');
});

Deno.test('mockWorldSeed: same raw seed produces a deterministic prng', () => {
	const a = mockWorldSeed('fixture-seed');
	const b = mockWorldSeed('fixture-seed');

	assertEquals(drawSequence(a.prng, 20), drawSequence(b.prng, 20));
});

Deno.test('mockWorldSeed: defaults to a stable raw seed', () => {
	const seed = mockWorldSeed();
	assertEquals(seed.raw, 'test-seed');
});

Deno.test('pickRanked: same seed produces the same selection', () => {
	const items = ['a', 'b', 'c', 'd', 'e'];

	assertEquals(
		pickRanked(items, createPrng('ranked')),
		pickRanked(items, createPrng('ranked')),
	);
});

Deno.test('pickRanked: a single-item list always returns that item', () => {
	assertEquals(pickRanked(['only'], createPrng('single')), 'only');
});

Deno.test('pickRanked: throws on an empty list', () => {
	let threw = false;

	try {
		pickRanked([], createPrng('empty'));
	} catch {
		threw = true;
	}

	assert(threw, 'expected pickRanked to throw on an empty items array');
});

Deno.test('pickRanked: only ever returns a member of the list', () => {
	const items = ['a', 'b', 'c'];
	const prng = createPrng('membership');

	for (let draw = 0; draw < 500; draw++) {
		assert(items.includes(pickRanked(items, prng)), 'returned a non-member');
	}
});

/**
 * The distribution is the whole point of the function, not an implementation detail: it is what
 * stops a generated vocabulary reading as noise. Pinned as a band around the geometric expectation
 * so retuning `RANKED_DROPOFF` has to confront what it changes.
 */
Deno.test('pickRanked: follows the geometric dropoff', () => {
	const items = Array.from({ length: 10 }, (_unused, index) => index);
	const prng = createPrng('distribution');
	const counts = new Array(items.length).fill(0);
	const draws = 20_000;

	for (let draw = 0; draw < draws; draw++) {
		counts[pickRanked(items, prng)]++;
	}

	// First position gets `RANKED_DROPOFF`; each subsequent falls by the same factor.
	assert(
		Math.abs(counts[0] / draws - RANKED_DROPOFF) < 0.03,
		`first-position share ${(counts[0] / draws).toFixed(3)} is off ${RANKED_DROPOFF}`,
	);

	// Monotonically decreasing, bar the final position, which absorbs the whole clamped tail.
	for (let index = 1; index < items.length - 1; index++) {
		assert(
			counts[index] <= counts[index - 1],
			`position ${index} drew more often than ${index - 1}`,
		);
	}
});

/**
 * Load-bearing for determinism: a rejection-sampling implementation would consume a variable number
 * of draws, so changing an inventory's size would shift every subsequent value in the stream.
 */
Deno.test('pickRanked: consumes exactly one draw regardless of list length', () => {
	for (const length of [1, 2, 5, 40]) {
		const items = Array.from({ length }, (_unused, index) => index);
		let draws = 0;
		const counting = () => {
			draws++;
			return 0.5;
		};

		pickRanked(items, counting);
		assertEquals(draws, 1, `a ${length}-item list consumed ${draws} draws`);
	}
});
