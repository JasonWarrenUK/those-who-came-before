/// <reference lib="deno.ns" />
import { assert, assertEquals } from '@std/assert';
import { createPrng } from '../prng.ts';
import { CONSONANT_RANK, PHONES_BY_ID, VOWEL_RANK } from '../../data/names/phones.ts';
import {
	MINIMAL_VOWEL_SYSTEM,
	PHONEME_PREREQUISITES,
	UNIVERSAL_CORE,
} from '../../data/names/coherence.ts';
import {
	areRelated,
	enforceCoherence,
	forestLanguageIds,
	generateLanguageForest,
	generatePhonology,
	generateSyllableTemplate,
	partitionIntoFamilies,
} from './phonology.ts';

Deno.test('determinism: the same seed produces the same phonology', () => {
	const first = generatePhonology(createPrng('shared-seed'));
	const second = generatePhonology(createPrng('shared-seed'));

	assertEquals(first, second);
});

Deno.test('determinism: different seeds diverge', () => {
	const first = generatePhonology(createPrng('seed-a'));
	const second = generatePhonology(createPrng('seed-b'));

	assert(
		JSON.stringify(first) !== JSON.stringify(second),
		'two seeds produced an identical phonology',
	);
});

Deno.test('determinism: the same seed produces the same forest', () => {
	assertEquals(
		generateLanguageForest(4, createPrng('world')),
		generateLanguageForest(4, createPrng('world')),
	);
});

Deno.test('coherence: closure pulls in transitive prerequisites', () => {
	// `zh -> sh` is one hop; the closure must reach it without the rule being listed transitively.
	assert(enforceCoherence(['zh']).has('sh'));

	// `qh -> kh -> k` is two hops.
	const closed = enforceCoherence(['qh']);
	assert(closed.has('kh'), 'closure missed kh');
	assert(closed.has('k'), 'closure missed k, two hops out');
});

Deno.test('coherence: closure only ever adds', () => {
	const input = ['zh', 'sh', 's', 'a'];
	const closed = enforceCoherence(input);

	for (const id of input) {
		assert(closed.has(id), `closure dropped ${id}`);
	}
});

/**
 * The load-bearing invariant of the whole generator. A wide phone table is only safe because these
 * rules make incoherent subsets unreachable — that is the trade the design rests on, so it is
 * checked across a population rather than on one example.
 */
Deno.test('coherence: no generated inventory violates a prerequisite', () => {
	const violations: string[] = [];

	for (let index = 0; index < 200; index++) {
		const phonology = generatePhonology(createPrng(`coherence-${index}`));
		const inventory = new Set([...phonology.consonants, ...phonology.vowels]);

		for (const id of inventory) {
			for (const prerequisite of PHONEME_PREREQUISITES.get(id) ?? []) {
				if (!inventory.has(prerequisite)) {
					violations.push(`seed ${index}: ${id} without ${prerequisite}`);
				}
			}
		}
	}

	assertEquals(violations, []);
});

Deno.test('inventory: every generated language contains the universal core', () => {
	for (let index = 0; index < 100; index++) {
		const phonology = generatePhonology(createPrng(`core-${index}`));
		const inventory = new Set([...phonology.consonants, ...phonology.vowels]);

		for (const id of UNIVERSAL_CORE) {
			assert(inventory.has(id), `seed ${index} lacks core phoneme ${id}`);
		}
	}
});

/**
 * Pins the vowel-system floor that `MINIMAL_VOWEL_SYSTEM` exists to guarantee. Before it, 5.3% of
 * languages had no high vowel and the minimum vowel count was 1.
 */
Deno.test('inventory: no language falls below the three-vowel triangle', () => {
	for (let index = 0; index < 200; index++) {
		const phonology = generatePhonology(createPrng(`vowels-${index}`));

		assert(
			phonology.vowels.length >= MINIMAL_VOWEL_SYSTEM.length,
			`seed ${index} has only ${phonology.vowels.length} vowels`,
		);

		for (const vowel of MINIMAL_VOWEL_SYSTEM) {
			assert(phonology.vowels.includes(vowel), `seed ${index} lacks ${vowel}`);
		}
	}
});

Deno.test('inventory: contains only real phonemes, correctly sorted by type', () => {
	const phonology = generatePhonology(createPrng('types'));

	for (const id of phonology.consonants) {
		assertEquals(PHONES_BY_ID.get(id)?.type, 'consonant', `${id} is not a consonant`);
	}
	for (const id of phonology.vowels) {
		assertEquals(PHONES_BY_ID.get(id)?.type, 'vowel', `${id} is not a vowel`);
	}
});

Deno.test('inventory: holds no duplicates', () => {
	for (let index = 0; index < 50; index++) {
		const phonology = generatePhonology(createPrng(`dupes-${index}`));

		assertEquals(new Set(phonology.consonants).size, phonology.consonants.length);
		assertEquals(new Set(phonology.vowels).size, phonology.vowels.length);
	}
});

/**
 * Inventory size is the headline distribution claim: attested languages mostly sit between 20 and 37
 * phonemes. Pinned as a band rather than a point so retuning the admission constants has to confront
 * what it changes, per the 1FD.35 calibration-test precedent.
 */
Deno.test('distribution: inventory sizes sit in a plausible band', () => {
	const sizes: number[] = [];

	for (let index = 0; index < 400; index++) {
		const phonology = generatePhonology(createPrng(`size-${index}`));
		sizes.push(phonology.consonants.length + phonology.vowels.length);
	}

	sizes.sort((first, second) => first - second);
	const median = sizes[Math.floor(sizes.length / 2)];

	assert(median >= 15 && median <= 30, `median inventory size ${median} is implausible`);
	assert(sizes[0] >= 8, `smallest inventory ${sizes[0]} is unusably sparse`);
});

/**
 * The per-language ordering is what stops every language sounding alike: with a shared rank,
 * `pickRanked` applies one frequency law to the whole world. Measured before `jitterRank`, only 12
 * distinct phonemes were ever a language's commonest, and `/n/` led 36% of all languages.
 */
Deno.test('distribution: languages differ in which phonemes they favour', () => {
	const leaders = new Set<string>();

	for (let index = 0; index < 200; index++) {
		const phonology = generatePhonology(createPrng(`order-${index}`));
		leaders.add(phonology.consonants[0]);
	}

	assert(leaders.size >= 12, `only ${leaders.size} distinct phonemes ever lead an inventory`);
});

Deno.test('ordering: inventories are a permutation of the rank-filtered set', () => {
	const phonology = generatePhonology(createPrng('permutation'));

	// Jittered, so the order differs from the global rank — but the *membership* must match exactly.
	assertEquals(
		[...phonology.consonants].sort(),
		CONSONANT_RANK.filter((id) => phonology.consonants.includes(id)).sort(),
	);
	assertEquals(
		[...phonology.vowels].sort(),
		VOWEL_RANK.filter((id) => phonology.vowels.includes(id)).sort(),
	);
});

Deno.test('template: every generated template is one of the four shapes', () => {
	const labels = new Set<string>();

	for (let index = 0; index < 200; index++) {
		labels.add(generateSyllableTemplate(createPrng(`template-${index}`)).label);
	}

	assertEquals([...labels].sort(), ['(C)(C)V(C)', '(C)V(C)', 'CV', 'CV(C)']);
});

Deno.test('families: a partition sums to the culture count', () => {
	for (let count = 1; count <= 8; count++) {
		const sizes = partitionIntoFamilies(count, createPrng(`partition-${count}`));
		const total = sizes.reduce((sum, size) => sum + size, 0);

		assertEquals(total, count, `partition of ${count} summed to ${total}`);
		assert(sizes.every((size) => size >= 1), 'a family has no members');
	}
});

Deno.test('families: an empty world partitions to nothing', () => {
	assertEquals(partitionIntoFamilies(0, createPrng('empty')), []);
});

/**
 * Doc 05 §362 specifies 2 cultures for MVP, where a forest is degenerate — one family of two, or two
 * isolates. Both must be reachable and neither may crash, since this is the scale the game ships at.
 */
Deno.test('families: both outcomes are reachable at MVP scale', () => {
	const outcomes = new Set<string>();

	for (let index = 0; index < 100; index++) {
		outcomes.add(JSON.stringify(partitionIntoFamilies(2, createPrng(`mvp-${index}`))));
	}

	assert(outcomes.has('[1,1]'), 'two isolates never occurred at N=2');
	assert(outcomes.has('[2]'), 'a shared family never occurred at N=2');
});

Deno.test('forest: produces exactly one language per culture', () => {
	for (const count of [1, 2, 4, 7]) {
		const forest = generateLanguageForest(count, createPrng(`forest-${count}`));

		assertEquals(forest.languages.size, count);
		assertEquals(forestLanguageIds(forest).length, count);
	}
});

Deno.test('forest: every language belongs to exactly one family that lists it', () => {
	const forest = generateLanguageForest(6, createPrng('membership'));

	for (const [id, language] of forest.languages) {
		const family = forest.families.find((candidate) => candidate.id === language.familyId);

		if (family === undefined) {
			throw new Error(`${id} names a family that does not exist`);
		}

		assert(family.languageIds.includes(id), `${family.id} does not list its member ${id}`);
	}
});

/**
 * Finds a world containing a family with more than one member. Family sizes are rolled, so a given
 * seed may produce all isolates; retrying across seeds keeps the sibling tests deterministic without
 * pinning them to one lucky seed.
 */
function findWorldWithSiblings(label: string): {
	forest: ReturnType<typeof generateLanguageForest>;
	family: ReturnType<typeof generateLanguageForest>['families'][number];
} {
	for (let index = 0; index < 50; index++) {
		const forest = generateLanguageForest(6, createPrng(`${label}-${index}`));
		const family = forest.families.find((candidate) => candidate.languageIds.length > 1);

		if (family !== undefined) {
			return { forest, family };
		}
	}

	throw new Error(`no multi-member family occurred in 50 attempts for ${label}`);
}

Deno.test('forest: relatedness holds within a family and fails across families', () => {
	const { forest, family } = findWorldWithSiblings('related');
	const [first, second] = family.languageIds;

	assert(areRelated(forest, first, second), 'siblings are not related');

	const outsider = forestLanguageIds(forest).find((id) => !family.languageIds.includes(id));
	if (outsider !== undefined) {
		assert(!areRelated(forest, first, outsider), 'unrelated languages report as related');
	}
});

Deno.test('forest: a language is related to itself', () => {
	const forest = generateLanguageForest(3, createPrng('self'));
	const [first] = forestLanguageIds(forest);

	assert(areRelated(forest, first, first));
});

Deno.test('forest: an unknown language id is related to nothing', () => {
	const forest = generateLanguageForest(3, createPrng('unknown'));
	const [first] = forestLanguageIds(forest);

	assert(!areRelated(forest, first, 'language-does-not-exist'));
	assert(!areRelated(forest, 'language-does-not-exist', 'language-also-missing'));
});

/**
 * ⚠️ Pins the honesty-ledger entry rather than a behaviour: sisters are currently **identical**, not
 * merely related, because no sound change exists to diverge them. When the sound-change task lands
 * this test should start failing, and its replacement should assert that sisters are *similar*.
 */
Deno.test('forest: sisters currently share a phonology exactly (divergence not modelled)', () => {
	const { forest, family } = findWorldWithSiblings('sisters');

	for (const id of family.languageIds) {
		assertEquals(forest.languages.get(id)?.phonology, family.protoPhonology);
	}
});
