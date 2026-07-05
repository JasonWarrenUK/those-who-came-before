/// <reference lib="deno.ns" />
import { assert, assertEquals, assertNotEquals } from '@std/assert';
import { createPrng, weightedSelect } from './prng.ts';
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
