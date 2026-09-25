/// <reference lib="deno.ns" />
import { assert, assertEquals, assertNotEquals } from '@std/assert';
import {
	lengthPreference,
	sampleNames,
	summariseSoundSystem,
	templateProse,
} from './namesPanel.ts';
import { createPrng } from '../../../../lib/engine/prng.ts';
import { generateLanguageForest } from '../../../../lib/engine/world/phonology.ts';
import { generateScholarName, renderName } from '../../../../lib/engine/world/naming.ts';
import { MODERN_LANGUAGE_ID, MODERN_PHONOLOGY } from '../../../../lib/data/names/modern.ts';
import type { Phonology } from '../../../../lib/types/language.ts';

Deno.test('sampleNames — is deterministic for the same seed and sizes', () => {
	assertEquals(sampleNames('names-determinism', 4, 3), sampleNames('names-determinism', 4, 3));
});

Deno.test('sampleNames — one language per culture, in forest order', () => {
	const model = sampleNames('names-order', 4, 2);
	const forest = generateLanguageForest(4, createPrng('names-order'));
	assertEquals(model.languages.length, 4);
	assertEquals(
		model.languages.map((language) => language.id),
		forest.families.flatMap((family) => [...family.languageIds]),
	);
	assertEquals(model.familyCount, forest.families.length);
});

Deno.test('sampleNames — samples exactly namesPerLanguage sites and scholars per language', () => {
	const model = sampleNames('names-count', 3, 5);
	for (const language of model.languages) {
		assertEquals(language.sites.length, 5);
		assertEquals(language.scholars.length, 5);
	}
	assertEquals(model.modern.colleagues.length, 5);
	assertEquals(model.modern.institutions.length, 5);
});

Deno.test('sampleNames — every name is coined in the language it is listed under', () => {
	const model = sampleNames('names-language', 4, 3);
	for (const language of model.languages) {
		for (const name of [language.cultureName, ...language.sites, ...language.scholars]) {
			assertEquals(name.form.languageId, language.id);
			assertEquals(name.text, renderName(name.form));
			assert(name.text.length > 0);
		}
	}
	for (const name of [...model.modern.colleagues, ...model.modern.institutions]) {
		assertEquals(name.form.languageId, MODERN_LANGUAGE_ID);
	}
});

Deno.test('sampleNames — the modern block uses the pinned phonology and its own stream', () => {
	// Same names for the same seed under the CLI sampler's `${seed}:modern` stream convention.
	const model = sampleNames('names-modern', 2, 3);
	const prng = createPrng(`names-modern:${MODERN_LANGUAGE_ID}`);
	const expected = Array.from(
		{ length: 3 },
		() => renderName(generateScholarName(MODERN_PHONOLOGY, MODERN_LANGUAGE_ID, prng)),
	);
	assertEquals(model.modern.colleagues.map((name) => name.text), expected);
	assertEquals(model.modern.soundSystem, summariseSoundSystem(MODERN_PHONOLOGY));
});

Deno.test('sampleNames — the modern phonology is fixed across seeds while its samples vary', () => {
	const first = sampleNames('names-fixed-a', 2, 4);
	const second = sampleNames('names-fixed-b', 2, 4);
	assertEquals(first.modern.soundSystem, second.modern.soundSystem);
	assertNotEquals(
		first.modern.colleagues.map((name) => name.text),
		second.modern.colleagues.map((name) => name.text),
	);
});

Deno.test('sampleNames — sisters in one family report the same family size and index within it', () => {
	const model = sampleNames('names-family', 6, 1);
	for (const language of model.languages) {
		const siblings = model.languages.filter((other) => other.familyId === language.familyId);
		assertEquals(language.familySize, siblings.length);
		assertEquals(siblings[language.memberIndex].id, language.id);
	}
});

const phonology: Phonology = {
	consonants: ['t', 'k'],
	vowels: ['a'],
	template: { onset: 'required', coda: 'optional', clusters: true, label: 'CCV(C)' },
	syllableWeights: [1, 6, 3],
};

Deno.test('lengthPreference — ranks the two heaviest syllable counts', () => {
	assertEquals(lengthPreference(phonology), 'mostly two, sometimes three');
});

Deno.test('templateProse — spells out onset, coda and cluster rules', () => {
	assertEquals(
		templateProse(phonology),
		'must open on a consonant, may close on one, admits two-consonant onsets',
	);
	assertEquals(
		templateProse({
			...phonology,
			template: { onset: 'optional', coda: 'none', clusters: false, label: '(C)V' },
		}),
		'may open on a vowel, never closes on one',
	);
});
