/// <reference lib="deno.ns" />
import { assert, assertEquals } from '@std/assert';
import { CONSONANT_RANK, PHONE_TABLE, PHONES_BY_ID, VOWEL_RANK } from './phones.ts';

Deno.test('table: every phoneme id is unique', () => {
	const ids = PHONE_TABLE.map((phone) => phone.id);
	assertEquals(new Set(ids).size, ids.length);
});

Deno.test('table: the id index covers every phoneme', () => {
	assertEquals(PHONES_BY_ID.size, PHONE_TABLE.length);
	for (const phone of PHONE_TABLE) {
		assertEquals(PHONES_BY_ID.get(phone.id), phone);
	}
});

/**
 * The individuation invariant. `the-tongue` shipped `/l/` and `/r/` with identical feature bundles,
 * so resolving an unchanged `/r/` by its own features returned `/l/` — a silent substitution that
 * needed a special case to work around. Sound-change rules will resolve phones by feature, so a
 * collision here would reopen exactly that trap.
 *
 * This test has already earned its place twice: it caught `lh` sharing `{alveolar, fricative,
 * voiceless}` with `s` during authoring, which is why `lh` is a `lateral-fricative`.
 */
Deno.test('table: no two phonemes share a feature bundle', () => {
	const bundles = new Map<string, string[]>();

	for (const phone of PHONE_TABLE) {
		const key = phone.type === 'consonant'
			? `C|${phone.place}|${phone.manner}|${phone.voiced}`
			: phone.diphthong
			? `V|diphthong|${phone.nucleus}|${phone.offglide}`
			: `V|${phone.height}|${phone.backness}|${phone.rounded}|${phone.long === true}`;

		bundles.set(key, [...(bundles.get(key) ?? []), phone.id]);
	}

	const collisions = [...bundles.entries()].filter(([, ids]) => ids.length > 1);
	assertEquals(collisions, [], `phonemes share a feature bundle: ${JSON.stringify(collisions)}`);
});

/**
 * ⚠️ Two phonemes may not share a grapheme, or a rendered name becomes ambiguous to read.
 *
 * Caught in review by the `sample:names` script, not by any invariant test: the vowel `y` and the
 * palatal approximant `yy` both wrote as `y`, so `Nuya` gave a reader no way to tell which phoneme
 * it held — and its syllabification (`nu • ÿ • a` against `nu • ya`) looked like a syllabifier bug
 * while being a data one. The vowel now writes `ÿ`.
 */
Deno.test('table: no two phonemes share a grapheme', () => {
	const byGrapheme = new Map<string, string[]>();

	for (const phone of PHONE_TABLE) {
		byGrapheme.set(phone.grapheme, [...(byGrapheme.get(phone.grapheme) ?? []), phone.id]);
	}

	const collisions = [...byGrapheme.entries()].filter(([, ids]) => ids.length > 1);
	assertEquals(collisions, [], `phonemes share a grapheme: ${JSON.stringify(collisions)}`);
});

/**
 * ⚠️ Every grapheme must be NFC-normalised, so a decomposed base-plus-combining-mark pair can never
 * enter the table. The composed and decomposed forms render identically and compare unequal, and the
 * decomposed one is wider in code units — which broke column alignment in `sample:names` for every
 * long vowel before `longVowel` started normalising.
 *
 * `x̂` (the uvular fricative) has no precomposed form in Unicode, so it stays two code units. That is
 * a property of the character rather than an authoring slip, and NFC leaves it untouched — which is
 * exactly why this asserts normalisation rather than a width of one.
 */
Deno.test('table: every grapheme is NFC-normalised', () => {
	const denormalised = PHONE_TABLE
		.filter((phone) => phone.grapheme !== phone.grapheme.normalize('NFC'))
		.map((phone) => phone.id);

	assertEquals(denormalised, []);
});

Deno.test('table: consonants carry consonant features and no vowel features', () => {
	for (const phone of PHONE_TABLE.filter((candidate) => candidate.type === 'consonant')) {
		assert(phone.place !== undefined, `${phone.id} has no place`);
		assert(phone.manner !== undefined, `${phone.id} has no manner`);
		assert(phone.voiced !== undefined, `${phone.id} has no voicing`);
		assertEquals(phone.height, undefined, `${phone.id} carries a vowel height`);
		assertEquals(phone.backness, undefined, `${phone.id} carries a vowel backness`);
	}
});

Deno.test('table: monophthongs carry vowel features, diphthongs carry nucleus and offglide', () => {
	for (const phone of PHONE_TABLE.filter((candidate) => candidate.type === 'vowel')) {
		if (phone.diphthong === true) {
			// A glide between two positions has no single height/backness, so those stay undefined.
			assert(phone.nucleus !== undefined, `${phone.id} has no nucleus`);
			assert(phone.offglide !== undefined, `${phone.id} has no offglide`);
			assertEquals(phone.height, undefined, `diphthong ${phone.id} carries a height`);
			assertEquals(phone.backness, undefined, `diphthong ${phone.id} carries a backness`);
			continue;
		}

		assert(phone.height !== undefined, `${phone.id} has no height`);
		assert(phone.backness !== undefined, `${phone.id} has no backness`);
		assert(phone.rounded !== undefined, `${phone.id} has no rounding`);
	}
});

Deno.test('table: a diphthong references real phonemes as its nucleus and offglide', () => {
	for (const phone of PHONE_TABLE.filter((candidate) => candidate.diphthong === true)) {
		assert(PHONES_BY_ID.has(phone.nucleus ?? ''), `${phone.id} nucleus is not a phoneme`);
		assert(PHONES_BY_ID.has(phone.offglide ?? ''), `${phone.id} offglide is not a phoneme`);
	}
});

/**
 * The rank lists drive both inventory membership and draw frequency, so a phoneme missing from a
 * rank is unreachable and a rank entry missing from the table is a silent no-op. Neither fails
 * loudly at runtime, which is why they are pinned here.
 */
Deno.test('ranks: cover the table exactly, with no duplicates', () => {
	const consonants = PHONE_TABLE.filter((phone) => phone.type === 'consonant').map((p) => p.id);
	const vowels = PHONE_TABLE.filter((phone) => phone.type === 'vowel').map((p) => p.id);

	assertEquals(new Set(CONSONANT_RANK).size, CONSONANT_RANK.length, 'duplicate in CONSONANT_RANK');
	assertEquals(new Set(VOWEL_RANK).size, VOWEL_RANK.length, 'duplicate in VOWEL_RANK');

	assertEquals([...CONSONANT_RANK].sort(), [...consonants].sort());
	assertEquals([...VOWEL_RANK].sort(), [...vowels].sort());
});

Deno.test('ranks: the near-universal consonants lead the ordering', () => {
	// Not an arbitrary pin: `pickRanked`'s dropoff means the head of this list is what every language
	// is most likely to have and to use, so the head must be the cross-linguistically common sounds.
	assertEquals(CONSONANT_RANK.slice(0, 8).sort(), ['k', 'l', 'm', 'n', 'p', 'r', 's', 't']);
});

Deno.test('ranks: the minimal three-vowel triangle leads the vowel ordering', () => {
	assertEquals(VOWEL_RANK.slice(0, 3).sort(), ['a', 'i', 'u']);
});
