/// <reference lib="deno.ns" />
import { assertEquals } from '@std/assert';
import { applySort, compareValues, nextSort, sortRows } from './tableSort.ts';
import type { SortColumn } from './tableSort.ts';

interface Row {
	name: string;
	score: number;
	note?: string;
}

const rows: Row[] = [
	{ name: 'beta', score: 2, note: 'x' },
	{ name: 'alpha', score: 3 },
	{ name: 'gamma', score: 1, note: 'a' },
	{ name: 'delta', score: 2 },
];

Deno.test('compareValues — numbers numerically, strings by locale, undefined greatest', () => {
	assertEquals(compareValues(2, 10) < 0, true);
	assertEquals(compareValues('b', 'a') > 0, true);
	assertEquals(compareValues(undefined, 0) > 0, true);
	assertEquals(compareValues(0, undefined) < 0, true);
	assertEquals(compareValues(undefined, undefined), 0);
});

Deno.test('sortRows — numeric column both ways, ties keep report order', () => {
	assertEquals(sortRows(rows, (r) => r.score, 'asc').map((r) => r.name), [
		'gamma',
		'beta',
		'delta',
		'alpha',
	]);
	assertEquals(sortRows(rows, (r) => r.score, 'desc').map((r) => r.name), [
		'alpha',
		'beta',
		'delta',
		'gamma',
	]);
});

Deno.test('sortRows — string column sorts A to Z and Z to A', () => {
	assertEquals(sortRows(rows, (r) => r.name, 'asc').map((r) => r.name), [
		'alpha',
		'beta',
		'delta',
		'gamma',
	]);
	assertEquals(sortRows(rows, (r) => r.name, 'desc')[0].name, 'gamma');
});

Deno.test('sortRows — missing values sink to the bottom in either direction', () => {
	assertEquals(sortRows(rows, (r) => r.note, 'asc').map((r) => r.note), [
		'a',
		'x',
		undefined,
		undefined,
	]);
	assertEquals(sortRows(rows, (r) => r.note, 'desc').map((r) => r.note), [
		'x',
		'a',
		undefined,
		undefined,
	]);
});

Deno.test('sortRows — never mutates its input', () => {
	const before = rows.map((r) => r.name);
	sortRows(rows, (r) => r.score, 'desc');
	assertEquals(rows.map((r) => r.name), before);
});

Deno.test('nextSort — a new column takes its default, the same column flips', () => {
	const start = { key: null, direction: 'asc' } as const;
	const first = nextSort<'score' | 'name'>(start, 'score', 'desc');
	assertEquals(first, { key: 'score', direction: 'desc' });
	assertEquals(nextSort(first, 'score', 'desc'), { key: 'score', direction: 'asc' });
	assertEquals(nextSort(first, 'name', 'asc'), { key: 'name', direction: 'asc' });
});

Deno.test('applySort — null key returns report order; a key sorts by its column', () => {
	const columns: Record<'name' | 'score', SortColumn<Row>> = {
		name: { value: (r) => r.name, defaultDirection: 'asc' },
		score: { value: (r) => r.score, defaultDirection: 'desc' },
	};
	assertEquals(applySort(rows, columns, { key: null, direction: 'asc' }), rows);
	assertEquals(
		applySort(rows, columns, { key: 'score', direction: 'desc' }).map((r) => r.name),
		['alpha', 'beta', 'delta', 'gamma'],
	);
});
