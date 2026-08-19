/// <reference lib="deno.ns" />
import { assert, assertEquals } from '@std/assert';
import { createPrng } from '../../engine/prng.ts';
import {
	areRelated,
	forestLanguageIds,
	generateLanguageForest,
	generatePhonology,
} from '../../engine/world/phonology.ts';
import { MODERN_LANGUAGE_ID, MODERN_LANGUAGE_SEED, MODERN_PHONOLOGY } from './modern.ts';

Deno.test('determinism: the pinned seed regenerates the exported phonology', () => {
	assertEquals(generatePhonology(createPrng(MODERN_LANGUAGE_SEED)), MODERN_PHONOLOGY);
});

/**
 * Recorded 2026-08-19, mirroring `phonology.calibration.test.ts`'s "recorded, not recalibrated"
 * convention: `MODERN_PHONOLOGY` is fixed only relative to `generatePhonology`'s current tuning, so
 * pin the exact generated shape rather than only its determinism. A later retune of the admission
 * constants, rank tables or phone table should fail this loudly rather than silently moving the
 * player's own language out from under them.
 */
Deno.test('snapshot: the pinned modern phonology matches its recorded shape', () => {
	assertEquals(MODERN_PHONOLOGY, {
		consonants: ['m', 'n', 'l', 'p', 'zh', 'j', 'ch', 'ny', 'ng', 's', 'sh', 't', 'k'],
		vowels: ['e', 'o', 'a', 'uh', 'i', 'y', 'u', 'oe', 'au'],
		template: { onset: 'required', coda: 'optional', clusters: false, label: 'CV(C)' },
		syllableWeights: [0.15, 1, 0.5, 0.2],
	});
});

Deno.test('id: MODERN_LANGUAGE_ID never collides with a forest-minted id', () => {
	// Forest ids are always `family-N`/`language-N` template literals (generateLanguageForest);
	// 'modern' matches neither shape by construction, checked here against a real generated forest
	// rather than asserted only from the naming convention.
	const forest = generateLanguageForest(6, createPrng('modern-id-collision-check'));

	assert(!forestLanguageIds(forest).includes(MODERN_LANGUAGE_ID));
	assert(!forest.languages.has(MODERN_LANGUAGE_ID));
});

Deno.test('forest: MODERN_LANGUAGE_ID is unrelated to every forest language, since it belongs to none', () => {
	const forest = generateLanguageForest(4, createPrng('modern-unrelated-check'));
	const [first] = forestLanguageIds(forest);

	assert(!areRelated(forest, MODERN_LANGUAGE_ID, first));
	assert(!areRelated(forest, first, MODERN_LANGUAGE_ID));
});
