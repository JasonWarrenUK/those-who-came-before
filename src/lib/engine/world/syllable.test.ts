/// <reference lib="deno.ns" />
import { assert, assertEquals } from '@std/assert';
import { createPrng } from '../prng.ts';
import { PHONES_BY_ID } from '../../data/names/phones.ts';
import { generatePhonology } from './phonology.ts';
import { generateSiteName } from './naming.ts';
import { renderSyllabified, sonorityOf, syllabify, syllableCount } from './syllable.ts';

/** Compact `onset-nucleus-coda` rendering, for readable assertions. */
function shape(segments: readonly string[]): string {
	return syllabify(segments)
		.map((syllable) =>
			`${syllable.onset.join('')}|${syllable.nucleus ?? ''}|${syllable.coda.join('')}`
		)
		.join(' ');
}

/**
 * Golden cases carried over from `the-tongue`'s own syllabifier tests, which encode the onset
 * maximisation contract: a cluster joins the following onset only where sonority rises towards the
 * vowel.
 */
Deno.test('syllabify: onset maximisation splits on rising sonority', () => {
	// Stop → trill rises, so `pr` joins the second onset.
	assertEquals(shape(['t', 'a', 'p', 'r', 'a']), 't|a| pr|a|');

	// Lateral → stop falls, so `l` stays a coda on the first syllable.
	assertEquals(shape(['a', 'l', 'k', 'a']), '|a|l k|a|');
});

/**
 * ⚠️ Regression: a glide must be able to begin a syllable. `sonorityOf` once ranked an approximant
 * equal to a vowel, and since onset maximisation walks left only while sonority *rises*, the tie
 * stopped the walk — `nuya` split `nuy • a` and `yayunu` split `yay • u • nu`. Found by the
 * `sample:names` script, not by any invariant test.
 */
Deno.test('syllabify: a glide begins a syllable rather than closing one', () => {
	// `shape` renders ids, so the palatal approximant reads `yy` here and `y` once rendered.
	assertEquals(shape(['n', 'u', 'yy', 'a']), 'n|u| yy|a|');
	assertEquals(renderSyllabified(['n', 'u', 'yy', 'a']), 'nu • ya');
	assertEquals(shape(['h', 'a', 'w', 'a']), 'h|a| w|a|');
	assert(sonorityOf('a') > sonorityOf('yy'), 'a vowel must outrank an approximant strictly');
});

Deno.test('syllabify: splits CV·CV and closes a final syllable with a coda', () => {
	assertEquals(shape(['p', 'o', 'p', 'o']), 'p|o| p|o|');
	assertEquals(shape(['k', 'a', 'r']), 'k|a|r');
});

Deno.test('syllabify: a vowel-free input is one nucleus-less syllable', () => {
	assertEquals(syllabify(['k', 't']), [{ onset: ['k', 't'], nucleus: null, coda: [] }]);
});

Deno.test('syllabify: an empty input yields one empty syllable', () => {
	assertEquals(syllabify([]), [{ onset: [], nucleus: null, coda: [] }]);
});

Deno.test('syllabify: the first syllable keeps every leading consonant', () => {
	// There is no earlier syllable for a leftover to fall back to, so `st` cannot be split.
	assertEquals(shape(['s', 't', 'a']), 'st|a|');
});

Deno.test('syllabify: trailing consonants become the final coda', () => {
	assertEquals(shape(['t', 'a', 'p', 't']), 't|a|pt');
});

/**
 * The round-trip invariant: syllabification only *groups* segments, never adds, drops or reorders
 * them. A failure here means a rendered name would differ from the name itself.
 */
Deno.test('syllabify: preserves every segment in order', () => {
	for (let index = 0; index < 100; index++) {
		const phonology = generatePhonology(createPrng(`round-${index}`));
		const prng = createPrng(`round-names-${index}`);

		for (let draw = 0; draw < 10; draw++) {
			const { segments } = generateSiteName(phonology, 'l', prng);

			const rebuilt = syllabify(segments).flatMap((syllable) =>
				[...syllable.onset, syllable.nucleus, ...syllable.coda].filter(
					(id): id is string => id !== null,
				)
			);

			assertEquals(rebuilt, [...segments], 'syllabification altered the segment list');
		}
	}
});

Deno.test('syllabify: yields exactly one syllable per vowel', () => {
	for (let index = 0; index < 100; index++) {
		const phonology = generatePhonology(createPrng(`count-${index}`));
		const prng = createPrng(`count-names-${index}`);

		for (let draw = 0; draw < 10; draw++) {
			const { segments } = generateSiteName(phonology, 'l', prng);
			const vowels = segments.filter((id) => PHONES_BY_ID.get(id)?.type === 'vowel').length;

			assertEquals(syllabify(segments).length, vowels);
			assertEquals(syllableCount(segments), vowels);
		}
	}
});

Deno.test('syllableCount: a vowel-free input still counts as one', () => {
	assertEquals(syllableCount(['k', 't']), 1);
	assertEquals(syllableCount([]), 1);
});

Deno.test('sonority: vowels outrank every consonant, and manners rank in order', () => {
	assert(sonorityOf('a') > sonorityOf('r'), 'a vowel should outrank a trill');
	assert(sonorityOf('r') > sonorityOf('n'), 'a trill should outrank a nasal');
	assert(sonorityOf('n') > sonorityOf('s'), 'a nasal should outrank a fricative');
	assert(sonorityOf('s') > sonorityOf('t'), 'a fricative should outrank a stop');
});

Deno.test('sonority: an unknown id ranks lowest so it joins an onset', () => {
	assertEquals(sonorityOf('not-a-phoneme'), 0);
});

Deno.test('renderSyllabified: marks boundaries with graphemes, not ids', () => {
	assertEquals(renderSyllabified(['p', 'o', 'p', 'o']), 'po • po');

	// `sh` is one segment rendering as two letters; the boundary must not fall inside it.
	assertEquals(renderSyllabified(['sh', 'a', 'sh', 'a']), 'sha • sha');
});

Deno.test('renderSyllabified: honours a custom separator', () => {
	assertEquals(renderSyllabified(['p', 'o', 'p', 'o'], '-'), 'po-po');
});
