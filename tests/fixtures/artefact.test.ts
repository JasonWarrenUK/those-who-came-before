/// <reference lib="deno.ns" />
import { assert, assertEquals } from '@std/assert';
import { mockArtefact, mockNormalisedArtefact } from './artefact.ts';

Deno.test('mockNormalisedArtefact: has one component and no attachments by default', () => {
	const artefact = mockNormalisedArtefact();

	assertEquals(artefact.components.length, 1);
	assertEquals(artefact.attachments.length, 0);
	assertEquals(artefact.dimensions.mass, 'light');
});

Deno.test('mockNormalisedArtefact: overrides apply', () => {
	const artefact = mockNormalisedArtefact({ id: 'custom-artefact' });

	assertEquals(artefact.id, 'custom-artefact');
});

Deno.test('mockArtefact: extends the normalised base with classification fields', () => {
	const artefact = mockArtefact();

	// Inherited NormalisedArtefact fields.
	assertEquals(artefact.components.length, 1);
	assertEquals(artefact.attachments.length, 0);

	// Classification fields.
	assert(artefact.groundTruthTags instanceof Map);
	assert(artefact.groundTruthTags.size > 0);
	assertEquals(artefact.decorativeLayers.length, 0);
	assertEquals(artefact.materialProvenance.length, 0);
	assert(typeof artefact.physicalLabel === 'string' && artefact.physicalLabel.length > 0);
});

Deno.test('mockArtefact: materials reference the base component by id', () => {
	const artefact = mockArtefact();

	assertEquals(artefact.materials[0].componentId, artefact.components[0].id);
});

Deno.test('mockArtefact: features carries all required fields', () => {
	const { features } = mockArtefact();

	assertEquals(typeof features.hasEdge, 'boolean');
	assertEquals(typeof features.partCount, 'number');
	assertEquals(features.primaryAxisLength, 'medium');
	assertEquals(features.portability, 'one-hand');
});

Deno.test('mockArtefact: provenance site and context are populated', () => {
	const { provenance } = mockArtefact();

	assertEquals(provenance.site.type, 'settlement');
	assertEquals(provenance.context.deposition, 'casual-discard');
});

Deno.test('mockArtefact: overrides apply', () => {
	const artefact = mockArtefact({ physicalLabel: 'custom label' });

	assertEquals(artefact.physicalLabel, 'custom label');
});
