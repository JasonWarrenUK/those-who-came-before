/// <reference lib="deno.ns" />
/**
 * Distribution regression guard for phonology and name generation (roadmap 2GN.66, spike
 * `docs/spikes/2GN.66-naming-grammars.md`).
 *
 * `phonology.test.ts` and `naming.test.ts` check **invariants** — no coherence violation, no
 * illegal cluster, determinism holds. Those pass for a very wide range of tunings: the admission
 * constants could halve and every one of them would stay green while every language in the world
 * quietly became a four-phoneme stub. This file installs the missing target, the same move
 * `materials.calibration.test.ts` made for material shares and doc 12 §2.31 made for classification
 * thresholds.
 *
 * Nothing here is recalibrated. Every figure is the measured behaviour of the generator as shipped,
 * recorded 2026-08-15, pinned so a later retune has to state what it changed.
 *
 * **Why these particular numbers.** The generator's constants (`ADMISSION_BASE`, `ADMISSION_DECAY`,
 * `RANK_JITTER`, `compressRank`, the template roll, the family-size roll) are authored priors, not
 * derived values — the spike says so. There is no external source that fixes them, so the only
 * defensible target is what they currently do. Four properties are pinned:
 *
 * 1. **Inventory size** — that languages stay in the attested 20–37 band rather than degenerating.
 * 2. **Phonological diversity** — that languages differ from *each other*, the defect that survived
 *    two rounds of fixing during 2GN.66 (a universal rank made `/n/` the commonest initial in 36% of
 *    all languages; see the spike's Finding 4).
 * 3. **Name shape** — that names stay a readable length, and that languages differ in it.
 * 4. **Family structure** — that a world usually contains a sibling pair and sometimes does not.
 *
 * **Tolerances are measured, not guessed.** Every band below comes from re-running each sweep under
 * five independent seed salts and taking the worst-case spread, then adding headroom:
 *
 * | Metric                     | 5-salt spread | Tolerance |
 * | -------------------------- | ------------: | --------: |
 * | Median inventory size      |          0.00 |        ±3 |
 * | Mean consonants            |          0.44 |        ±2 |
 * | Mean vowels                |          0.12 |        ±1 |
 * | Distinct leading phonemes  |          2.00 |   ≥20 (*) |
 * | Mean syllables per name    |          0.07 |     ±0.25 |
 * | Mean segments per name     |          0.16 |      ±0.8 |
 * | Template share (worst)     |          8.0pp |      ±12pp |
 *
 * (*) The leader count is pinned as a floor rather than a band: more diversity is never a
 * regression, and the failure it guards against is one-directional.
 *
 * ⚠️ **When this fails, it is usually right, and widening the band is usually wrong** — the same
 * warning `materials.calibration.test.ts` and `calibration.test.ts` both carry. A moved figure means
 * an admission constant, the jitter, the rank order or the phone table itself moved. Identify which,
 * and re-record deliberately.
 */

import { assert } from '@std/assert';
import { createPrng } from '../../engine/prng.ts';
import { generatePhonology, partitionIntoFamilies } from '../../engine/world/phonology.ts';
import { generateSiteName } from '../../engine/world/naming.ts';
import { PHONES_BY_ID } from './phones.ts';

/**
 * Languages sampled per sweep. At this size the five-salt re-run moved the noisiest metric
 * (template share) by 8.0pp and every continuous metric by under 0.5; raising it tightens the
 * categorical splits only, at a runtime cost this guard does not need to pay.
 */
const LANGUAGE_SAMPLES = 400;

/** Names drawn per sampled language, for the name-shape sweep. */
const NAMES_PER_LANGUAGE = 20;

/** Worlds sampled per family-structure sweep. Family size is a three-way roll, so this runs larger. */
const WORLD_SAMPLES = 2000;

const isVowel = (id: string) => PHONES_BY_ID.get(id)?.type === 'vowel';

/** Generates `LANGUAGE_SAMPLES` phonologies under a stable salt. */
function sampleLanguages(salt: string) {
	return Array.from(
		{ length: LANGUAGE_SAMPLES },
		(_unused, index) => generatePhonology(createPrng(`${salt}:L${index}`)),
	);
}

/**
 * Measured 2026-08-15. Attested phoneme inventories mostly sit between 20 and 37; the generator's
 * median of 21 puts it at the low end of that band, which is deliberate — a generated language is
 * read, not spoken, and a 35-phoneme inventory produces names with more distinct letters than a
 * reader tracks.
 */
const EXPECTED_MEDIAN_INVENTORY = 21;

/** Tolerance on the median, in phonemes. Five-salt spread was 0.00; ±3 is pure headroom. */
const MEDIAN_INVENTORY_TOLERANCE = 3;

Deno.test('calibration: median inventory size sits in the attested band', () => {
	const sizes = sampleLanguages('size')
		.map((phonology) => phonology.consonants.length + phonology.vowels.length)
		.sort((first, second) => first - second);

	const median = sizes[Math.floor(sizes.length / 2)];

	assert(
		Math.abs(median - EXPECTED_MEDIAN_INVENTORY) <= MEDIAN_INVENTORY_TOLERANCE,
		`median inventory ${median}, expected ${EXPECTED_MEDIAN_INVENTORY} ` +
			`±${MEDIAN_INVENTORY_TOLERANCE}`,
	);

	// The band is meaningless without a floor: a generator producing 3-phoneme languages would sit
	// inside any median tolerance if enough large ones balanced it.
	assert(sizes[0] >= 8, `smallest inventory ${sizes[0]} is unusably sparse`);
});

/** Measured 2026-08-15: mean 14.9 consonants, 6.2 vowels per language. */
const EXPECTED_MEAN_CONSONANTS = 14.9;

/** Measured 2026-08-15. See `EXPECTED_MEAN_CONSONANTS`. */
const EXPECTED_MEAN_VOWELS = 6.2;

Deno.test('calibration: consonant and vowel counts hold their recorded means', () => {
	const languages = sampleLanguages('means');

	const meanConsonants = languages.reduce((sum, p) => sum + p.consonants.length, 0) /
		languages.length;
	const meanVowels = languages.reduce((sum, p) => sum + p.vowels.length, 0) / languages.length;

	// Five-salt spread: 0.44 consonants, 0.12 vowels.
	assert(
		Math.abs(meanConsonants - EXPECTED_MEAN_CONSONANTS) <= 2,
		`mean consonants ${meanConsonants.toFixed(2)}, expected ${EXPECTED_MEAN_CONSONANTS} ±2`,
	);
	assert(
		Math.abs(meanVowels - EXPECTED_MEAN_VOWELS) <= 1,
		`mean vowels ${meanVowels.toFixed(2)}, expected ${EXPECTED_MEAN_VOWELS} ±1`,
	);
});

/**
 * ⚠️ **The headline guard of this file.** Measured 2026-08-15 at 31–33 distinct phonemes ever
 * leading an inventory, out of 42 consonants.
 *
 * This is the metric that caught the defect the spike's Finding 4 records, and it is the one most
 * likely to regress silently. `pickRanked` draws against a markedness-ordered list; if that list is
 * ever made universal again — or if `RANK_JITTER` is lowered, or `compressRank` reverted to linear —
 * every language in the world starts obeying one frequency law and they stop being distinguishable
 * from each other. Measured at the time: 12 distinct leaders, with `/n/` leading 36% of languages.
 *
 * Every other test in the repo passed in that state. Only this measurement fails.
 */
const MINIMUM_DISTINCT_LEADERS = 20;

Deno.test('calibration: languages differ from each other in what they favour', () => {
	const leaders = new Set(sampleLanguages('leaders').map((phonology) => phonology.consonants[0]));

	assert(
		leaders.size >= MINIMUM_DISTINCT_LEADERS,
		`only ${leaders.size} distinct phonemes ever lead an inventory ` +
			`(floor ${MINIMUM_DISTINCT_LEADERS}); languages have stopped sounding different ` +
			`from one another — see the spike's Finding 4`,
	);
});

/**
 * No single phoneme may dominate as the commonest-initial across the world. The complement of the
 * leader-count guard above: 42 distinct leaders would still read badly if one of them led 90% of
 * languages. Measured 2026-08-15 at `/n/` leading roughly a fifth.
 */
const MAXIMUM_LEADER_SHARE = 0.4;

Deno.test('calibration: no single phoneme dominates as the commonest initial', () => {
	const languages = sampleLanguages('dominance');
	const counts = new Map<string, number>();

	for (const phonology of languages) {
		const leader = phonology.consonants[0];
		counts.set(leader, (counts.get(leader) ?? 0) + 1);
	}

	const [topLeader, topCount] = [...counts.entries()]
		.sort((first, second) => second[1] - first[1])[0];
	const share = topCount / languages.length;

	assert(
		share <= MAXIMUM_LEADER_SHARE,
		`/${topLeader}/ leads ${(100 * share).toFixed(1)}% of languages ` +
			`(ceiling ${100 * MAXIMUM_LEADER_SHARE}%)`,
	);
});

/**
 * Measured 2026-08-15: 2.71 syllables and 5.74 segments per name.
 *
 * Re-recorded after `MONOSYLLABLE_SUPPRESSION` landed. The `sample:names` script showed one-syllable
 * names (`Ni`, `Yu`, `Ə`) at 19.8% of output, which read as stubs rather than proper nouns and
 * contradicted `naming.ts`'s stated design that a name runs longer than an ordinary word. Suppressing
 * them moved these means up; the previous figures (2.50 / 5.40) still sat inside the tolerance, which
 * is exactly why they are re-recorded rather than left to ride.
 */
const EXPECTED_MEAN_SYLLABLES = 2.71;

/** Measured 2026-08-15. See `EXPECTED_MEAN_SYLLABLES`. */
const EXPECTED_MEAN_SEGMENTS = 5.74;

Deno.test('calibration: name length holds its recorded shape', () => {
	let syllables = 0;
	let segments = 0;
	let names = 0;

	for (const [index, phonology] of sampleLanguages('shape').entries()) {
		const prng = createPrng(`shape:N${index}`);

		for (let draw = 0; draw < NAMES_PER_LANGUAGE; draw++) {
			const name = generateSiteName(phonology, 'calibration', prng);
			syllables += name.segments.filter(isVowel).length;
			segments += name.segments.length;
			names++;
		}
	}

	const meanSyllables = syllables / names;
	const meanSegments = segments / names;

	// Five-salt spread: 0.07 syllables, 0.16 segments. Both bands are generous by comparison, since
	// the interesting failure is a structural one (juncture trimming eating whole syllables), which
	// would move these far further than sampling noise ever does.
	assert(
		Math.abs(meanSyllables - EXPECTED_MEAN_SYLLABLES) <= 0.25,
		`mean syllables ${meanSyllables.toFixed(2)}, expected ${EXPECTED_MEAN_SYLLABLES} ±0.25`,
	);
	assert(
		Math.abs(meanSegments - EXPECTED_MEAN_SEGMENTS) <= 0.8,
		`mean segments ${meanSegments.toFixed(2)}, expected ${EXPECTED_MEAN_SEGMENTS} ±0.8`,
	);
});

/**
 * Measured 2026-08-15: of 400 languages, 16% favour one-syllable names, 40% two, 32% three and 12%
 * four.
 *
 * ⚠️ Guards the second axis on which languages must differ from one another. Before
 * `Phonology.syllableWeights`, every name helper rolled `2 or 3` on the same coin flip, so word
 * length was identical across every language in every world — a language of clipped monosyllables
 * was unreachable. A world-wide mean can hide that completely (it barely moved when the axis was
 * added: 2.50 → 2.45), so the mean is checked above and the *spread across languages* here.
 */
const MINIMUM_DISTINCT_MODAL_LENGTHS = 3;

Deno.test('calibration: languages differ from each other in name length', () => {
	const modalLengths = new Set<number>();

	for (const [index, phonology] of sampleLanguages('lengths').entries()) {
		const prng = createPrng(`lengths:N${index}`);
		const counts = new Map<number, number>();

		for (let draw = 0; draw < NAMES_PER_LANGUAGE; draw++) {
			const syllables = generateSiteName(phonology, 'calibration', prng)
				.segments.filter(isVowel).length;
			counts.set(syllables, (counts.get(syllables) ?? 0) + 1);
		}

		modalLengths.add([...counts.entries()].sort((first, second) => second[1] - first[1])[0][0]);
	}

	assert(
		modalLengths.size >= MINIMUM_DISTINCT_MODAL_LENGTHS,
		`only ${modalLengths.size} distinct modal name lengths across ${LANGUAGE_SAMPLES} languages ` +
			`(floor ${MINIMUM_DISTINCT_MODAL_LENGTHS}); word length has stopped varying between them`,
	);
});

/**
 * Measured template shares, 2026-08-15. Weighted towards the simpler shapes because CV and CV(C)
 * between them cover a majority of the world's languages, and cluster-admitting phonotactics are the
 * minority case.
 *
 * The tolerance is the widest in this file (±12pp against an 8.0pp five-salt spread) because a
 * four-way categorical split at n=400 is the noisiest thing measured here.
 */
const EXPECTED_TEMPLATE_SHARES: Readonly<Record<string, number>> = {
	'CV': 30,
	'CV(C)': 25,
	'(C)V(C)': 25,
	'(C)(C)V(C)': 20,
};

/** Tolerance on a template's share, in percentage points. See `EXPECTED_TEMPLATE_SHARES`. */
const TEMPLATE_SHARE_TOLERANCE_POINTS = 12;

Deno.test('calibration: syllable templates hold their recorded shares', () => {
	const languages = sampleLanguages('templates');
	const counts = new Map<string, number>();

	for (const phonology of languages) {
		counts.set(phonology.template.label, (counts.get(phonology.template.label) ?? 0) + 1);
	}

	for (const [label, expected] of Object.entries(EXPECTED_TEMPLATE_SHARES)) {
		const share = (100 * (counts.get(label) ?? 0)) / languages.length;

		assert(
			Math.abs(share - expected) <= TEMPLATE_SHARE_TOLERANCE_POINTS,
			`template ${label} at ${share.toFixed(1)}%, expected ${expected}% ` +
				`±${TEMPLATE_SHARE_TOLERANCE_POINTS}pp`,
		);
	}
});

/**
 * Measured 2026-08-15: 91% of four-culture worlds contain at least one sibling pair, and 9.8% are
 * all-isolates.
 *
 * ⚠️ Pins a **design** fact, not a statistical one, and it is the reason this sweep exists. The
 * spike ruled a forest rather than a tree so that some cultures are related and others are not. If
 * the family-size roll drifts, one of those two outcomes silently stops happening — a world where
 * every culture is always an isolate has no relatedness to discover, and one where they are always
 * related has no contrast. Both extremes pass every other test in the repo.
 */
const EXPECTED_SIBLING_WORLD_SHARE = 91;

/** Tolerance on the sibling-world share, in percentage points. */
const SIBLING_SHARE_TOLERANCE_POINTS = 10;

Deno.test('calibration: most worlds hold a sibling pair, but not all of them', () => {
	let withSiblings = 0;

	for (let index = 0; index < WORLD_SAMPLES; index++) {
		const sizes = partitionIntoFamilies(4, createPrng(`siblings:${index}`));
		if (sizes.some((size) => size > 1)) {
			withSiblings++;
		}
	}

	const share = (100 * withSiblings) / WORLD_SAMPLES;

	assert(
		Math.abs(share - EXPECTED_SIBLING_WORLD_SHARE) <= SIBLING_SHARE_TOLERANCE_POINTS,
		`${share.toFixed(1)}% of four-culture worlds hold a sibling pair, expected ` +
			`${EXPECTED_SIBLING_WORLD_SHARE}% ±${SIBLING_SHARE_TOLERANCE_POINTS}pp`,
	);

	// Both outcomes must stay reachable; a 100% share is as much a regression as a 0% one.
	assert(share < 100, 'every world holds a sibling pair — isolates have stopped occurring');
	assert(share > 50, 'sibling pairs have become the minority case');
});

/**
 * Measured 2026-08-15: at MVP's two cultures the split is 55% one shared family, 45% two isolates.
 *
 * Doc 05 §362 specifies 2 cultures for MVP, so this is the scale the game actually ships at — a
 * degenerate case where the forest is either one family or two isolates, and both must stay
 * reachable near evenly.
 */
Deno.test('calibration: the MVP two-culture world splits near evenly', () => {
	let shared = 0;

	for (let index = 0; index < WORLD_SAMPLES; index++) {
		if (partitionIntoFamilies(2, createPrng(`mvp:${index}`)).length === 1) {
			shared++;
		}
	}

	const share = (100 * shared) / WORLD_SAMPLES;

	assert(
		share > 30 && share < 70,
		`${share.toFixed(1)}% of two-culture worlds share one family — the MVP world has become ` +
			`lopsided towards ${share >= 70 ? 'relatedness' : 'isolation'}`,
	);
});
