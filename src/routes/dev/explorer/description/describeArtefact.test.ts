/// <reference lib="deno.ns" />
import { assert, assertEquals } from '@std/assert';
import { ALL_REGISTERS, describeArtefact, stubProvenance } from './describeArtefact.ts';
import { inspectTags } from '../tags/tagInspector.ts';
import { renderName } from '../../../../lib/engine/world/naming.ts';
import { EXPLORER_CULTURES } from '../../../../lib/data/explorer-cultures.ts';

const tarpan = EXPLORER_CULTURES.find((culture) => culture.id === 'tarpan')!;
const khaltiris = EXPLORER_CULTURES.find((culture) => culture.id === 'khaltiris')!;

Deno.test('describeArtefact — is deterministic for the same seed, culture and registers', () => {
	assertEquals(
		describeArtefact('desc-determinism', khaltiris, ALL_REGISTERS),
		describeArtefact('desc-determinism', khaltiris, ALL_REGISTERS),
	);
});

Deno.test('describeArtefact — one entry per component, in position order', () => {
	const model = describeArtefact('desc-components', khaltiris, ALL_REGISTERS);
	assertEquals(model.components.length, model.artefact.components.length);
	assertEquals(
		model.components.map((c) => c.shortId),
		model.artefact.components.map((c) => `c${c.position}`).sort(),
	);
});

Deno.test('describeArtefact — every observation is attributed to exactly one component', () => {
	// Guards the `${component.id}:` prefix grouping against the engine's propertyId contract.
	for (const seed of ['desc-attr-0', 'desc-attr-1', 'desc-attr-2']) {
		const model = describeArtefact(seed, tarpan, ALL_REGISTERS);
		const grouped = model.components.reduce((n, c) => n + c.observations.length, 0);
		assertEquals(grouped, model.observationCount);
		assertEquals(model.orphaned, []);
	}
});

Deno.test('describeArtefact — foregrounds observational when every register is available', () => {
	const model = describeArtefact('desc-register', khaltiris, ALL_REGISTERS);
	assertEquals(model.foregroundedRegister, 'observational');
	for (const observation of model.presentation.primaryObservations) {
		assertEquals(observation.register, 'observational');
	}
});

Deno.test('describeArtefact — a narrowed register list changes the foregrounded register', () => {
	const model = describeArtefact('desc-register', khaltiris, ['technical']);
	assertEquals(model.foregroundedRegister, 'technical');
	for (const observation of model.presentation.primaryObservations) {
		assertEquals(observation.register, 'technical');
	}
});

Deno.test('describeArtefact — the classified artefact agrees with the tag inspector for the same seed', () => {
	// Cross-panel seed convention: the artefact this panel describes must be the one the tag
	// inspector scores. Component ids carry each panel's own prefix, so compare by position and by
	// the tag map, which is prefix-free.
	const description = describeArtefact('desc-agreement', tarpan, ALL_REGISTERS);
	const tags = inspectTags('desc-agreement', tarpan);
	assertEquals(
		description.artefact.components.map((c) => c.primitiveType),
		tags.artefact.components.map((c) => c.primitiveType),
	);
	assertEquals(description.artefact.features, tags.features);
});

Deno.test('describeArtefact — stubbed inputs are the documented placeholders, not fabricated data', () => {
	const model = describeArtefact('desc-stubs', khaltiris, ALL_REGISTERS);
	assertEquals(model.artefact.physicalLabel, '');
	assertEquals(model.presentation.label, '');
	assertEquals(
		model.presentation.provenance.siteName,
		renderName(stubProvenance(khaltiris).site.name),
	);
	assertEquals(model.presentation.secondaryObservations, []);
	assertEquals(model.presentation.suggestedTags, []);
	assertEquals(model.presentation.crossReferences, []);
});

Deno.test('describeArtefact — both cultures produce a well-formed model for the same seed', () => {
	for (const culture of [tarpan, khaltiris]) {
		const model = describeArtefact('desc-culture-variation', culture, ALL_REGISTERS);
		assert(model.components.length > 0);
		assertEquals(model.artefact.provenance.cultureId, culture.id);
	}
});
