/// <reference lib="deno.ns" />
import { assertEquals, assertThrows } from '@std/assert';
import { PERCENTILE_LADDER, percentileLadder, percentileOf } from './statistics.ts';

Deno.test('percentileOf: [1..10] p50 is 5.5 (proves interpolation, not nearest-rank)', () => {
	const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
	assertEquals(percentileOf(values, 0.5), 5.5);
});

Deno.test('percentileOf: known R-7 answers over [1..10]', () => {
	const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
	// R-7 rank = p * (n - 1); n = 10, so rank = p * 9.
	assertEquals(percentileOf(values, 0), 1);
	assertEquals(percentileOf(values, 1), 10);
	assertEquals(percentileOf(values, 0.25), 3.25); // rank 2.25 -> 3 + 0.25*(4-3)
	assertEquals(percentileOf(values, 0.75), 7.75); // rank 6.75 -> 7 + 0.75*(8-7)
});

Deno.test('percentileOf: single-element sample returns that element at every percentile', () => {
	assertEquals(percentileOf([42], 0), 42);
	assertEquals(percentileOf([42], 0.5), 42);
	assertEquals(percentileOf([42], 1), 42);
});

Deno.test('percentileOf: permuted input gives identical output', () => {
	const ascending = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
	const shuffled = [7, 2, 9, 1, 5, 10, 3, 8, 4, 6];
	assertEquals(percentileOf(shuffled, 0.75), percentileOf(ascending, 0.75));
});

Deno.test('percentileOf: does not mutate its input', () => {
	const values = [5, 3, 1, 4, 2];
	const copy = [...values];
	percentileOf(values, 0.5);
	assertEquals(values, copy);
});

Deno.test('percentileOf: explicit numeric sort, not lexicographic (10 stays after 9)', () => {
	// A lexicographic sort would order these as [1, 10, 2, 9], breaking every percentile above.
	const values = [1, 2, 9, 10];
	assertEquals(percentileOf(values, 1), 10);
});

Deno.test('percentileOf: throws on empty input', () => {
	assertThrows(() => percentileOf([], 0.5), Error, 'must not be empty');
});

Deno.test('percentileOf: throws on non-finite values', () => {
	assertThrows(() => percentileOf([1, NaN, 3], 0.5), Error, 'must all be finite');
	assertThrows(() => percentileOf([1, Infinity, 3], 0.5), Error, 'must all be finite');
});

Deno.test('percentileOf: throws on out-of-range percentile', () => {
	assertThrows(() => percentileOf([1, 2, 3], -0.1), Error, 'must be in [0, 1]');
	assertThrows(() => percentileOf([1, 2, 3], 1.1), Error, 'must be in [0, 1]');
});

Deno.test('percentileLadder: returns all five PERCENTILE_LADDER rungs', () => {
	const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
	const ladder = percentileLadder(values);

	assertEquals(ladder.size, PERCENTILE_LADDER.length);
	for (const rung of PERCENTILE_LADDER) {
		assertEquals(ladder.get(rung), percentileOf(values, rung));
	}
});

Deno.test('percentileLadder: single-element sample returns that element at every rung', () => {
	const ladder = percentileLadder([7]);
	for (const rung of PERCENTILE_LADDER) {
		assertEquals(ladder.get(rung), 7);
	}
});

Deno.test('percentileLadder: throws on empty input', () => {
	assertThrows(() => percentileLadder([]), Error, 'must not be empty');
});

Deno.test('percentileLadder: does not mutate its input', () => {
	const values = [9, 1, 5, 3, 7];
	const copy = [...values];
	percentileLadder(values);
	assertEquals(values, copy);
});
