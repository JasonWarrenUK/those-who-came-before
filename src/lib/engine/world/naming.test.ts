/// <reference lib="deno.ns" />
import { assert, assertEquals } from '@std/assert';
import { createPrng } from '../prng.ts';
import { PHONES_BY_ID } from '../../data/names/phones.ts';
import {
	ALLOW_IDENTICAL_JUNCTURE,
	ALLOW_IDENTICAL_VOWEL_HIATUS,
	MAX_CONSONANT_RUN,
} from '../../data/names/coherence.ts';
import { generatePhonology, MAXIMUM_NAME_SYLLABLES, MINIMUM_NAME_SYLLABLES } from './phonology.ts';
import {
	generateCultureName,
	generateNameForm,
	generateScholarName,
	generateSiteName,
	isAdmissibleCluster,
	renderName,
	renderNameSyllabified,
} from './naming.ts';
import { syllabify } from './syllable.ts';

/** Generates a population of names across many languages, for distribution assertions. */
function sampleNames(count: number, perLanguage = 20): ReturnType<typeof generateSiteName>[] {
	const names: ReturnType<typeof generateSiteName>[] = [];

	for (let index = 0; index < count; index++) {
		const phonology = generatePhonology(createPrng(`lang-${index}`));
		const prng = createPrng(`names-${index}`);

		for (let draw = 0; draw < perLanguage; draw++) {
			names.push(generateSiteName(phonology, `language-${index}`, prng));
		}
	}

	return names;
}

const isConsonant = (id: string) => PHONES_BY_ID.get(id)?.type === 'consonant';
const isVowel = (id: string) => PHONES_BY_ID.get(id)?.type === 'vowel';

Deno.test('determinism: the same seed produces the same name', () => {
	const phonology = generatePhonology(createPrng('fixed'));

	assertEquals(
		generateSiteName(phonology, 'language-1', createPrng('name-seed')),
		generateSiteName(phonology, 'language-1', createPrng('name-seed')),
	);
});

Deno.test('determinism: successive draws from one generator differ', () => {
	const phonology = generatePhonology(createPrng('fixed'));
	const prng = createPrng('sequence');

	const first = generateSiteName(phonology, 'language-1', prng);
	const second = generateSiteName(phonology, 'language-1', prng);

	assert(
		first.segments.join() !== second.segments.join(),
		'two successive names came out identical',
	);
});

Deno.test('composition: every segment is a phoneme the language actually has', () => {
	for (let index = 0; index < 50; index++) {
		const phonology = generatePhonology(createPrng(`inv-${index}`));
		const inventory = new Set([...phonology.consonants, ...phonology.vowels]);
		const prng = createPrng(`draw-${index}`);

		for (let draw = 0; draw < 20; draw++) {
			for (const segment of generateSiteName(phonology, 'l', prng).segments) {
				assert(inventory.has(segment), `${segment} is not in the language's inventory`);
			}
		}
	}
});

Deno.test('composition: every name contains at least one vowel', () => {
	for (const name of sampleNames(60)) {
		assert(name.segments.some(isVowel), `no vowel in ${renderName(name)}`);
	}
});

Deno.test('composition: a name is never empty', () => {
	for (const name of sampleNames(60)) {
		assert(name.segments.length > 0);
		assert(renderName(name).length > 0);
	}
});

/**
 * ⚠️ Pins a phonotactic rule that was measured, not assumed. Before `smoothJuncture`, 0.4% of names
 * carried a run of three or more consonants — `Nafdoththti`, `Ñangshngångru`, `Satutkhpu` — because
 * the onset cluster rules govern consonants *within* an onset and nothing inspected the seam between
 * syllables.
 */
Deno.test('phonotactics: no name exceeds the consonant-run limit', () => {
	const offenders: string[] = [];

	for (const name of sampleNames(300)) {
		let run = 0;

		for (const segment of name.segments) {
			run = isConsonant(segment) ? run + 1 : 0;
			if (run > MAX_CONSONANT_RUN) {
				offenders.push(renderName(name));
				break;
			}
		}
	}

	assertEquals(offenders, []);
});

/**
 * ⚠️ Also measured: 5.3% of names carried a doubled consonant (`Kakklo`, `Tänna`) before the
 * juncture repair. The repair must run *after* run-trimming, since trimming changes which segment
 * leads — checking first let `Kanoppā` through.
 */
Deno.test('phonotactics: no name doubles a consonant across a juncture', () => {
	if (ALLOW_IDENTICAL_JUNCTURE) {
		return;
	}

	const offenders: string[] = [];

	for (const name of sampleNames(300)) {
		for (let index = 1; index < name.segments.length; index++) {
			if (name.segments[index] === name.segments[index - 1] && isConsonant(name.segments[index])) {
				offenders.push(renderName(name));
				break;
			}
		}
	}

	assertEquals(offenders, []);
});

/**
 * ⚠️ Measured, like the two above: 1.4% of names doubled a vowel (`Naa`, `Fii`, `Tiiknə`) before the
 * repair, reachable once a juncture trim removed a syllable's onset and exposed its vowel to the
 * previous nucleus.
 *
 * Scoped to *identical* vowels. Ordinary hiatus (6.5% of names — `Nia`, `Teo`) is legitimate in a
 * language whose syllables may open with a vowel, and is deliberately left alone.
 */
Deno.test('phonotactics: no name doubles a vowel', () => {
	if (ALLOW_IDENTICAL_VOWEL_HIATUS) {
		return;
	}

	const offenders: string[] = [];

	for (const name of sampleNames(300)) {
		for (let index = 1; index < name.segments.length; index++) {
			if (name.segments[index] === name.segments[index - 1] && isVowel(name.segments[index])) {
				offenders.push(renderName(name));
				break;
			}
		}
	}

	assertEquals(offenders, []);
});

Deno.test('phonotactics: a CV-template language never produces a coda', () => {
	// Find a language whose template forbids codas, then assert no name ends on a consonant.
	for (let index = 0; index < 200; index++) {
		const phonology = generatePhonology(createPrng(`cv-${index}`));
		if (phonology.template.coda !== 'none') {
			continue;
		}

		const prng = createPrng(`cv-names-${index}`);
		for (let draw = 0; draw < 30; draw++) {
			const name = generateSiteName(phonology, 'l', prng);
			const last = name.segments[name.segments.length - 1];
			assertEquals(isVowel(last), true, `${renderName(name)} ends on a consonant under CV`);
		}
		return;
	}

	throw new Error('no coda-less language found in 200 seeds');
});

Deno.test('phonotactics: a required-onset language never begins on a vowel', () => {
	for (let index = 0; index < 200; index++) {
		const phonology = generatePhonology(createPrng(`onset-${index}`));
		if (phonology.template.onset !== 'required') {
			continue;
		}

		const prng = createPrng(`onset-names-${index}`);
		for (let draw = 0; draw < 30; draw++) {
			const name = generateSiteName(phonology, 'l', prng);
			assert(isConsonant(name.segments[0]), `${renderName(name)} begins on a vowel`);
		}
		return;
	}

	throw new Error('no required-onset language found in 200 seeds');
});

Deno.test('clusters: admissibility follows the sonority rules', () => {
	// stop + lateral rises in sonority; the reverse does not.
	assert(isAdmissibleCluster('t', 'l'), 'stop + lateral should be admissible');
	assert(!isAdmissibleCluster('l', 't'), 'lateral + stop should not be admissible');

	// The attested /s/-initial exception.
	assert(isAdmissibleCluster('s', 't'), 's + stop should be admissible');

	// Unknown ids are never admissible.
	assert(!isAdmissibleCluster('not-a-phoneme', 't'));
	assert(!isAdmissibleCluster('t', 'not-a-phoneme'));
});

/**
 * Names end softly by design (`Boran`, not `Borant`): a name-final coda is drawn only from sonorants.
 * Names are read aloud in the player's head far more than common words are.
 */
Deno.test('shape: a name never ends on an obstruent', () => {
	const sonorants = new Set(['nasal', 'lateral', 'trill', 'tap', 'approximant']);
	const offenders: string[] = [];

	for (const name of sampleNames(200)) {
		const last = name.segments[name.segments.length - 1];
		if (!isConsonant(last)) {
			continue;
		}

		const manner = PHONES_BY_ID.get(last)?.manner ?? '';
		if (!sonorants.has(manner)) {
			offenders.push(`${renderName(name)} ends on ${manner}`);
		}
	}

	assertEquals(offenders, []);
});

Deno.test('shape: names stay within the generator’s syllable range', () => {
	for (const name of sampleNames(200)) {
		const syllables = name.segments.filter(isVowel).length;

		assert(
			syllables >= MINIMUM_NAME_SYLLABLES && syllables <= MAXIMUM_NAME_SYLLABLES,
			`${renderName(name)} has ${syllables} syllables, outside ` +
				`${MINIMUM_NAME_SYLLABLES}–${MAXIMUM_NAME_SYLLABLES}`,
		);
	}
});

/**
 * Word length is a property of the language, not a constant. Before `syllableWeights`, all three
 * name helpers rolled `2 or 3` on the same coin flip, so length was the one axis on which no two
 * languages could differ — a language of clipped monosyllables was unreachable.
 */
Deno.test('shape: languages differ in how long their names run', () => {
	const modalLengths = new Set<number>();

	for (let index = 0; index < 200; index++) {
		const phonology = generatePhonology(createPrng(`length-${index}`));
		const prng = createPrng(`length-names-${index}`);
		const counts = new Map<number, number>();

		for (let draw = 0; draw < 20; draw++) {
			const syllables = generateSiteName(phonology, 'l', prng).segments.filter(isVowel).length;
			counts.set(syllables, (counts.get(syllables) ?? 0) + 1);
		}

		modalLengths.add([...counts.entries()].sort((first, second) => second[1] - first[1])[0][0]);
	}

	assert(
		modalLengths.size >= 3,
		`only ${modalLengths.size} distinct modal name lengths across 200 languages; ` +
			`word length has stopped varying between languages`,
	);
});

Deno.test('shape: a language’s syllable weights cover the full range', () => {
	const phonology = generatePhonology(createPrng('weights'));

	assertEquals(
		phonology.syllableWeights.length,
		MAXIMUM_NAME_SYLLABLES - MINIMUM_NAME_SYLLABLES + 1,
	);

	// No length is ever unreachable: a language that could *never* produce a given length would be a
	// stronger claim than the generator supports.
	for (const weight of phonology.syllableWeights) {
		assert(weight > 0, 'a syllable count is unreachable in this language');
	}
});

/**
 * The invariant that makes a stale `syllables` field fail loudly instead of merely rendering wrongly.
 * Whichever task builds sound change must recompute or drop this field as it rewrites `segments`;
 * this is what catches it carrying the old boundaries forward.
 */
Deno.test('syllables: the recorded counts sum to the segment list', () => {
	for (const name of sampleNames(200)) {
		const total = name.syllables.reduce((sum, count) => sum + count, 0);

		assertEquals(
			total,
			name.segments.length,
			`${renderName(name)} records ${JSON.stringify(name.syllables)} against ` +
				`${name.segments.length} segments`,
		);
	}
});

Deno.test('syllables: one entry per syllable, none of them empty', () => {
	for (const name of sampleNames(200)) {
		assertEquals(name.syllables.length, name.segments.filter(isVowel).length);

		for (const count of name.syllables) {
			assert(count > 0, `${renderName(name)} records an empty syllable`);
		}
	}
});

/**
 * ⚠️ The cross-check that answers "is the stored structure the *right* structure?".
 *
 * The generator records boundaries as it builds; `syllabify` reconstructs them from segments alone
 * by sonority. Neither is checked by the other's tests, and until this existed the claim that they
 * agree rested on reasoning rather than measurement — which is precisely the assurance this suite
 * exists to replace.
 *
 * Agreement is asserted as a **high proportion, not an identity**: the two answer subtly different
 * questions. The generator knows which syllable it *intended* a segment for; `syllabify` reads what
 * the finished string *sounds like*, and after a juncture repair trims a syllable's onset those can
 * legitimately differ. A collapse in this figure means one of them has broken.
 */
Deno.test('syllables: the recorded structure agrees with independent syllabification', () => {
	const names = sampleNames(300);
	let agreements = 0;

	for (const name of names) {
		const derived = syllabify(name.segments).map((syllable) =>
			syllable.onset.length + (syllable.nucleus === null ? 0 : 1) + syllable.coda.length
		);

		if (JSON.stringify(derived) === JSON.stringify([...name.syllables])) {
			agreements++;
		}
	}

	const share = agreements / names.length;

	// Measured at 95.7%. The residual is a genuine ambiguity rather than a defect: where a medial
	// consonant forms an admissible cluster with the next onset (`Nahmu` — `nah • mu` against
	// `na • hmu`), both readings are defensible and the two mechanisms simply choose differently.
	assert(
		share >= 0.9,
		`stored and derived syllabification agree on only ${(100 * share).toFixed(1)}% of names ` +
			`(floor 90%); one of the two has broken`,
	);
});

Deno.test('renderNameSyllabified: reads the recorded boundaries', () => {
	assertEquals(
		renderNameSyllabified({
			segments: ['p', 'o', 'p', 'o'],
			syllables: [2, 2],
			languageId: 'l',
			coinedPhaseId: null,
		}),
		'po • po',
	);
});

/**
 * The fallback a drift pass would hit if it rewrote `segments` and left `syllables` behind: rather
 * than rendering a mangled split, the renderer derives instead.
 */
Deno.test('renderNameSyllabified: falls back to derivation when the counts are stale', () => {
	assertEquals(
		renderNameSyllabified({
			// Counts sum to 4 against 5 segments — what a segment-rewriting drift pass would leave.
			segments: ['t', 'a', 'p', 'r', 'a'],
			syllables: [2, 2],
			languageId: 'l',
			coinedPhaseId: null,
		}),
		'ta • pra',
	);
});

Deno.test('provenance: a name records the language that coined it', () => {
	const phonology = generatePhonology(createPrng('provenance'));
	const name = generateSiteName(phonology, 'language-7', createPrng('n'));

	assertEquals(name.languageId, 'language-7');
});

Deno.test('provenance: a site name records its coining phase, a culture name does not', () => {
	const phonology = generatePhonology(createPrng('phase'));

	const site = generateSiteName(phonology, 'l', createPrng('s'), 'phase-3');
	assertEquals(site.coinedPhaseId, 'phase-3');

	const scholar = generateScholarName(phonology, 'l', createPrng('sc'), 'phase-4');
	assertEquals(scholar.coinedPhaseId, 'phase-4');

	// A culture's own name is not coined within one of its own phases, so there is none to record.
	const culture = generateCultureName(phonology, 'l', createPrng('c'));
	assertEquals(culture.coinedPhaseId, null);
});

Deno.test('render: capitalises the first letter and concatenates graphemes', () => {
	const name = { segments: ['k', 'a', 'r'], syllables: [3], languageId: 'l', coinedPhaseId: null };

	assertEquals(renderName(name), 'Kar');
});

Deno.test('render: a digraph costs one segment and renders as two letters', () => {
	const name = { segments: ['sh', 'a'], syllables: [2], languageId: 'l', coinedPhaseId: null };

	assertEquals(renderName(name), 'Sha');
	assertEquals(name.segments.length, 2);
});

Deno.test('render: an empty name renders empty rather than throwing', () => {
	assertEquals(
		renderName({ segments: [], syllables: [], languageId: 'l', coinedPhaseId: null }),
		'',
	);
});

Deno.test('render: an unknown segment falls back to its id', () => {
	const name = {
		segments: ['not-a-phoneme'],
		syllables: [1],
		languageId: 'l',
		coinedPhaseId: null,
	};

	assertEquals(renderName(name), 'Not-a-phoneme');
});

/**
 * ⚠️ Pins the honesty-ledger entry: the renderer is currently identity with respect to time, so a
 * name renders alike at every phase. When sound change lands this should fail, and its replacement
 * should assert that the two forms *differ*.
 */
Deno.test('render: phase-evolved forms are not modelled yet', () => {
	const phonology = generatePhonology(createPrng('drift'));
	const early = generateSiteName(phonology, 'l', createPrng('same'), 'phase-1');
	const late = generateSiteName(phonology, 'l', createPrng('same'), 'phase-9');

	// Same segments, different coining phases, identical rendering — because nothing drifts yet.
	assertEquals(early.segments, late.segments);
	assertEquals(renderName(early), renderName(late));
});

Deno.test('generateNameForm: honours an explicit syllable count', () => {
	const phonology = generatePhonology(createPrng('explicit'));

	for (const count of [1, 2, 4]) {
		const name = generateNameForm(phonology, 'l', createPrng(`c-${count}`), count);
		assertEquals(name.segments.filter(isVowel).length, count);
	}
});
