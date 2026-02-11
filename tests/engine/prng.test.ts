import { describe, it, expect } from 'vitest';
import { createPrng, weightedSelect, randomInt, shuffle } from '$lib/engine/prng.js';

describe('createPrng', () => {
	it('produces deterministic output for the same seed', () => {
		const prng1 = createPrng('test-seed-42');
		const prng2 = createPrng('test-seed-42');

		const values1 = Array.from({ length: 100 }, () => prng1());
		const values2 = Array.from({ length: 100 }, () => prng2());

		expect(values1).toEqual(values2);
	});

	it('produces different output for different seeds', () => {
		const prng1 = createPrng('seed-alpha');
		const prng2 = createPrng('seed-beta');

		const values1 = Array.from({ length: 20 }, () => prng1());
		const values2 = Array.from({ length: 20 }, () => prng2());

		expect(values1).not.toEqual(values2);
	});

	it('produces values in [0, 1)', () => {
		const prng = createPrng('range-test');

		for (let i = 0; i < 10000; i++) {
			const value = prng();
			expect(value).toBeGreaterThanOrEqual(0);
			expect(value).toBeLessThan(1);
		}
	});

	it('produces reasonably distributed values', () => {
		const prng = createPrng('distribution-test');
		const buckets = new Array(10).fill(0);

		const N = 10000;
		for (let i = 0; i < N; i++) {
			const bucket = Math.floor(prng() * 10);
			buckets[bucket]++;
		}

		// Each bucket should have roughly N/10 values (10% ± 3%)
		for (const count of buckets) {
			expect(count).toBeGreaterThan(N * 0.07);
			expect(count).toBeLessThan(N * 0.13);
		}
	});

	it('handles empty string seed', () => {
		const prng = createPrng('');
		const value = prng();
		expect(value).toBeGreaterThanOrEqual(0);
		expect(value).toBeLessThan(1);
	});

	it('handles very long seed strings', () => {
		const longSeed = 'a'.repeat(10000);
		const prng = createPrng(longSeed);
		const value = prng();
		expect(value).toBeGreaterThanOrEqual(0);
		expect(value).toBeLessThan(1);
	});

	it('maintains determinism after many draws', () => {
		const prng1 = createPrng('endurance');
		const prng2 = createPrng('endurance');

		// Draw 10000 values from each
		for (let i = 0; i < 10000; i++) {
			prng1();
			prng2();
		}

		// The 10001st value should still match
		expect(prng1()).toBe(prng2());
	});
});

describe('weightedSelect', () => {
	it('selects from weighted options', () => {
		const prng = createPrng('weighted-test');
		const items = [
			{ item: 'rare', weight: 0.01 },
			{ item: 'common', weight: 0.99 }
		];

		const results = Array.from({ length: 1000 }, () => weightedSelect(items, prng));
		const commonCount = results.filter((r) => r === 'common').length;

		// Common item should dominate
		expect(commonCount).toBeGreaterThan(900);
	});

	it('is deterministic for the same seed', () => {
		const items = [
			{ item: 'a', weight: 1 },
			{ item: 'b', weight: 1 },
			{ item: 'c', weight: 1 }
		];

		const prng1 = createPrng('ws-determinism');
		const prng2 = createPrng('ws-determinism');

		const results1 = Array.from({ length: 50 }, () => weightedSelect(items, prng1));
		const results2 = Array.from({ length: 50 }, () => weightedSelect(items, prng2));

		expect(results1).toEqual(results2);
	});

	it('respects zero-weight prohibition floor', () => {
		const prng = createPrng('zero-weight');
		const items = [
			{ item: 'heavy', weight: 100 },
			{ item: 'light', weight: 0.01 }
		];

		// Even with extreme weighting, light should occasionally appear over many trials
		const results = Array.from({ length: 10000 }, () => weightedSelect(items, prng));
		const lightCount = results.filter((r) => r === 'light').length;
		expect(lightCount).toBeGreaterThan(0);
	});
});

describe('randomInt', () => {
	it('produces values within bounds', () => {
		const prng = createPrng('int-range');

		for (let i = 0; i < 1000; i++) {
			const value = randomInt(5, 10, prng);
			expect(value).toBeGreaterThanOrEqual(5);
			expect(value).toBeLessThanOrEqual(10);
		}
	});

	it('is deterministic', () => {
		const prng1 = createPrng('int-det');
		const prng2 = createPrng('int-det');

		const values1 = Array.from({ length: 50 }, () => randomInt(1, 100, prng1));
		const values2 = Array.from({ length: 50 }, () => randomInt(1, 100, prng2));

		expect(values1).toEqual(values2);
	});
});

describe('shuffle', () => {
	it('is deterministic', () => {
		const prng1 = createPrng('shuffle-det');
		const prng2 = createPrng('shuffle-det');

		const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

		expect(shuffle(arr, prng1)).toEqual(shuffle(arr, prng2));
	});

	it('does not modify the original array', () => {
		const prng = createPrng('shuffle-immutable');
		const original = [1, 2, 3, 4, 5];
		const copy = [...original];

		shuffle(original, prng);
		expect(original).toEqual(copy);
	});

	it('contains all original elements', () => {
		const prng = createPrng('shuffle-complete');
		const arr = [1, 2, 3, 4, 5];
		const result = shuffle(arr, prng);

		expect(result.sort()).toEqual(arr.sort());
	});
});
