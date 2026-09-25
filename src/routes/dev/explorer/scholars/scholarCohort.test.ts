/// <reference lib="deno.ns" />
import { assert, assertEquals } from '@std/assert';
import { generateCohort, presetAsCulture, presetChronology } from './scholarCohort.ts';
import { createPrng } from '../../../../lib/engine/prng.ts';
import { generateNPCScholars } from '../../../../lib/engine/world/scholars.ts';
import { renderName } from '../../../../lib/engine/world/naming.ts';
import { MODERN_LANGUAGE_ID } from '../../../../lib/data/names/modern.ts';
import { EXPLORER_CULTURES } from '../../../../lib/data/explorer-cultures.ts';

Deno.test('generateCohort — is deterministic for the same seed', () => {
	assertEquals(generateCohort('cohort-determinism'), generateCohort('cohort-determinism'));
});

Deno.test('generateCohort — matches generateNPCScholars on the `${seed}-scholars` stream', () => {
	const model = generateCohort('cohort-stream');
	const cultures = EXPLORER_CULTURES.map(presetAsCulture);
	const expected = generateNPCScholars(
		cultures,
		presetChronology(cultures),
		createPrng('cohort-stream-scholars'),
	);
	assertEquals(model.scholars.map((card) => card.seed), expected);
});

Deno.test('generateCohort — renders each name from its NameForm in the modern language', () => {
	const model = generateCohort('cohort-names');
	for (const card of model.scholars) {
		assertEquals(card.name, renderName(card.seed.name));
		assertEquals(card.seed.name.languageId, MODERN_LANGUAGE_ID);
		assert(card.name.length > 0);
	}
});

Deno.test('generateCohort — culture focus resolves to preset labels, never to a bare id', () => {
	const labels = new Set(EXPLORER_CULTURES.map((preset) => preset.label));
	for (const seed of ['cohort-focus-0', 'cohort-focus-1', 'cohort-focus-2']) {
		const model = generateCohort(seed);
		for (const card of model.scholars) {
			assertEquals(card.cultureFocusLabels.length, card.seed.cultureFocus.length);
			for (const label of card.cultureFocusLabels) assert(labels.has(label), label);
		}
	}
});

Deno.test('generateCohort — bias is read from the identity model', () => {
	const model = generateCohort('cohort-bias');
	for (const card of model.scholars) {
		assertEquals(card.bias, card.seed.interpretiveModel.methodologicalWeights.bias);
	}
});

Deno.test('presetAsCulture — lifts a preset into a one-phase Culture the generator can read', () => {
	const preset = EXPLORER_CULTURES[0];
	const culture = presetAsCulture(preset);
	assertEquals(culture.id, preset.id);
	assertEquals(culture.baseProfile, preset.profile);
	assertEquals(culture.timeline.phases.length, 1);
	assertEquals(culture.timeline.phases[0].characteristics, preset.phase);
});

Deno.test('presetChronology — carries every culture timeline and no relationships', () => {
	const cultures = EXPLORER_CULTURES.map(presetAsCulture);
	const chronology = presetChronology(cultures);
	assertEquals(chronology.cultureTimelines.map((t) => t.cultureId), cultures.map((c) => c.id));
	assertEquals(chronology.relationships, []);
});
