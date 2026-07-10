/// <reference lib="deno.ns" />
import { assertEquals } from '@std/assert';
import {
	termIndexFromWeek,
	termStartWeek,
	weekInTerm,
	WEEKS_PER_YEAR,
	yearFromTerm,
} from './term.ts';

Deno.test('constants: a year models 48 weeks', () => {
	assertEquals(WEEKS_PER_YEAR, 48);
});

Deno.test('termStartWeek: term N starts at week N * 12', () => {
	assertEquals(termStartWeek(0), 0);
	assertEquals(termStartWeek(1), 12);
	assertEquals(termStartWeek(4), 48); // First term of year 1
});

Deno.test('weekInTerm: wraps to 0-based within-term position at term boundaries', () => {
	assertEquals(weekInTerm(0), 0);
	assertEquals(weekInTerm(11), 11); // Last week of term 0
	assertEquals(weekInTerm(12), 0); // First week of term 1
	assertEquals(weekInTerm(25), 1);
});

Deno.test('termIndexFromWeek: advances at 12-week boundaries', () => {
	assertEquals(termIndexFromWeek(0), 0);
	assertEquals(termIndexFromWeek(11), 0);
	assertEquals(termIndexFromWeek(12), 1);
	assertEquals(termIndexFromWeek(47), 3); // Last week of year 0
	assertEquals(termIndexFromWeek(48), 4); // First week of year 1
});

Deno.test('yearFromTerm: advances every 4 terms', () => {
	assertEquals(yearFromTerm(0), 0);
	assertEquals(yearFromTerm(3), 0);
	assertEquals(yearFromTerm(4), 1);
	assertEquals(yearFromTerm(8), 2);
});

Deno.test('helpers: term index round-trips through its start week', () => {
	for (const termIndex of [0, 1, 3, 4, 17]) {
		assertEquals(termIndexFromWeek(termStartWeek(termIndex)), termIndex);
	}
});

Deno.test('helpers: absolute week decomposes into term start plus within-term offset', () => {
	for (const absoluteWeek of [0, 5, 11, 12, 47, 48, 100]) {
		assertEquals(
			termStartWeek(termIndexFromWeek(absoluteWeek)) + weekInTerm(absoluteWeek),
			absoluteWeek,
		);
	}
});
