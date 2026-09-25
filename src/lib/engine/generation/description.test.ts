/// <reference lib="deno.ns" />
import { assert, assertEquals, assertThrows } from '@std/assert';
import {
	generateDescription,
	REGISTER_PREFERENCE,
	selectVariant,
	TEMPLATES_BY_REGISTER,
} from './description.ts';
import type {
	ClassifiedArtefact,
	MaterialDefinition,
	NormalisedComponent,
} from '../../types/artefact.ts';
import type { DescriptionTemplate } from '../../types/description.ts';
import { mockArtefact, mockProvenance } from '../../../../tests/fixtures/artefact.ts';

function component(overrides: Partial<NormalisedComponent> = {}): NormalisedComponent {
	return {
		id: 'c0',
		primitiveType: 'elongated',
		properties: new Map<string, string | number>([
			['length', 'long'],
			['crossSection', 'diamond'],
			['taper', 'abrupt'],
			['edge', 'double'],
			['point', 'sharp'],
		]),
		allowedMaterialTags: ['metal'],
		position: 0,
		...overrides,
	};
}

function bronze(): MaterialDefinition {
	return {
		id: 'bronze',
		displayName: 'Bronze',
		tags: ['metal'],
		craftDomain: 'metallurgy',
		physicalProperties: {
			hardness: 4,
			fragility: 2,
			rigidity: 5,
			grainFineness: 5,
			porosity: 1,
			combustibility: 1,
			formability: 5,
		},
		reactivity: { oxidisation: 6 },
		decorability: { engravable: true, paintable: false, glazeable: false },
	};
}

function obsidian(): MaterialDefinition {
	return {
		id: 'obsidian',
		displayName: 'Obsidian',
		tags: ['stone'],
		craftDomain: 'stoneWorking',
		physicalProperties: {
			hardness: 5,
			fragility: 5,
			rigidity: 5,
			grainFineness: 5,
			porosity: 1,
			combustibility: 1,
			formability: 1,
		},
		reactivity: { oxidisation: 1 },
		decorability: { engravable: false, paintable: false, glazeable: false },
	};
}

function artefact(overrides: Partial<ClassifiedArtefact> = {}): ClassifiedArtefact {
	return mockArtefact({
		components: [component()],
		materials: [{
			componentId: 'c0',
			materialId: 'bronze',
			provenance: { source: 'local' },
			standing: 1,
		}],
		provenance: mockProvenance(),
		...overrides,
	});
}

Deno.test('generateDescription is deterministic', () => {
	const a = artefact();
	assertEquals(
		generateDescription(a, ['observational']),
		generateDescription(a, ['observational']),
	);
});

Deno.test('diegesis guard: different groundTruthTags produce an identical presentation', () => {
	const neutral = artefact({ groundTruthTags: new Map([['tool', 0.1]]) });
	const weaponHeavy = artefact({ groundTruthTags: new Map([['weapon', 50]]) });
	assertEquals(
		generateDescription(neutral, ['observational', 'interpretive', 'technical']),
		generateDescription(weaponHeavy, ['observational', 'interpretive', 'technical']),
	);
});

Deno.test('foregrounds observational when available, regardless of list order', () => {
	const a = artefact();
	const result = generateDescription(a, ['technical', 'interpretive', 'observational']);
	assert(result.primaryObservations.every((o) => o.register === 'observational'));
});

Deno.test('falls back to interpretive when observational is unavailable', () => {
	const a = artefact();
	const result = generateDescription(a, ['technical', 'interpretive']);
	assert(result.primaryObservations.some((o) => o.register === 'interpretive'));
	assert(result.primaryObservations.every((o) => o.register === 'interpretive'));
});

Deno.test('REGISTER_PREFERENCE is exhaustive over the three shipped registers', () => {
	// foregroundedRegister throws when `registers` holds no REGISTER_PREFERENCE member, a case
	// unreachable via the real three-value DescriptionRegister type; this pins the invariant that
	// makes the throw unreachable rather than exercising dead code.
	assertEquals(REGISTER_PREFERENCE, ['observational', 'interpretive', 'technical']);
});

Deno.test('throws on empty registers', () => {
	assertThrows(() => generateDescription(artefact(), []));
});

Deno.test('selectVariant: values condition gates on the component parameter', () => {
	const template: DescriptionTemplate = {
		property: 'elongated.crossSection',
		variants: [
			{
				template: 'Diamond.',
				emphasis: [],
				register: 'observational',
				condition: { values: ['diamond'] },
			},
			{ template: 'Fallback.', emphasis: [], register: 'observational' },
		],
	};
	const properties = new Map<string, string | number>([['crossSection', 'diamond']]);
	assertEquals(
		selectVariant(template, 'observational', properties, undefined)?.template,
		'Diamond.',
	);

	const otherProperties = new Map<string, string | number>([['crossSection', 'round']]);
	assertEquals(
		selectVariant(template, 'observational', otherProperties, undefined)?.template,
		'Fallback.',
	);
});

Deno.test('selectVariant: material gate fails closed when material is unknown', () => {
	const template: DescriptionTemplate = {
		property: 'elongated.taper',
		variants: [
			{
				template: 'Brittle taper.',
				emphasis: [],
				register: 'observational',
				condition: { materialTag: ['stone'] },
			},
		],
	};
	const properties = new Map<string, string | number>([['taper', 'abrupt']]);
	assertEquals(selectVariant(template, 'observational', properties, undefined), undefined);
	assertEquals(selectVariant(template, 'observational', properties, bronze())?.template, undefined);
	assertEquals(
		selectVariant(template, 'observational', properties, obsidian())?.template,
		'Brittle taper.',
	);
});

Deno.test('selectVariant: craftDomain and materialId gates', () => {
	const template: DescriptionTemplate = {
		property: 'elongated.edge',
		variants: [
			{
				template: 'Worked stone edge.',
				emphasis: [],
				register: 'observational',
				condition: { craftDomain: ['stoneWorking'], materialId: ['obsidian'] },
			},
		],
	};
	const properties = new Map<string, string | number>([['edge', 'double']]);
	assertEquals(
		selectVariant(template, 'observational', properties, obsidian())?.template,
		'Worked stone edge.',
	);
	assertEquals(selectVariant(template, 'observational', properties, bronze()), undefined);
});

Deno.test('selectVariant: fields AND together, values plus material both required', () => {
	const template: DescriptionTemplate = {
		property: 'elongated.crossSection',
		variants: [
			{
				template: 'Matches both.',
				emphasis: [],
				register: 'observational',
				condition: { values: ['diamond'], materialTag: ['metal'] },
			},
		],
	};
	const wrongValue = new Map<string, string | number>([['crossSection', 'round']]);
	assertEquals(selectVariant(template, 'observational', wrongValue, bronze()), undefined);

	const rightValue = new Map<string, string | number>([['crossSection', 'diamond']]);
	assertEquals(selectVariant(template, 'observational', rightValue, obsidian()), undefined);
	assertEquals(
		selectVariant(template, 'observational', rightValue, bronze())?.template,
		'Matches both.',
	);
});

Deno.test('propertyId is component-scoped: two elongated components never collide', () => {
	const a = artefact({
		components: [component({ id: 'c0', position: 0 }), component({ id: 'c1', position: 1 })],
		materials: [
			{ componentId: 'c0', materialId: 'bronze', provenance: { source: 'local' }, standing: 1 },
			{ componentId: 'c1', materialId: 'bronze', provenance: { source: 'local' }, standing: 1 },
		],
	});
	const result = generateDescription(a, ['observational']);
	const ids = result.primaryObservations.map((o) => o.propertyId);
	assertEquals(new Set(ids).size, ids.length);
	assert(ids.every((id) => id.startsWith('c0:') || id.startsWith('c1:')));
});

Deno.test('observations order by component position, not array order', () => {
	const a = artefact({
		components: [component({ id: 'c1', position: 1 }), component({ id: 'c0', position: 0 })],
		materials: [
			{ componentId: 'c0', materialId: 'bronze', provenance: { source: 'local' }, standing: 1 },
			{ componentId: 'c1', materialId: 'bronze', provenance: { source: 'local' }, standing: 1 },
		],
	});
	const result = generateDescription(a, ['observational']);
	const firstC0Index = result.primaryObservations.findIndex((o) => o.propertyId.startsWith('c0:'));
	const firstC1Index = result.primaryObservations.findIndex((o) => o.propertyId.startsWith('c1:'));
	assert(firstC0Index < firstC1Index);
});

Deno.test('rawData carries the parameter value and material id, never standing or provenance', () => {
	const a = artefact();
	const result = generateDescription(a, ['observational']);
	for (const obs of result.primaryObservations) {
		assert(!obs.rawData.has('standing'));
		assert(!obs.rawData.has('provenance'));
		assertEquals(obs.rawData.get('material'), 'bronze');
	}
});

Deno.test('label passes physicalLabel through unchanged', () => {
	const a = artefact({ physicalLabel: 'a curious thing' });
	assertEquals(generateDescription(a, ['observational']).label, 'a curious thing');
});

Deno.test('suggestedTags, crossReferences and secondaryObservations are empty (no lens yet)', () => {
	const result = generateDescription(artefact(), ['observational']);
	assertEquals(result.suggestedTags, []);
	assertEquals(result.crossReferences, []);
	assertEquals(result.secondaryObservations, []);
});

Deno.test('every primary observation has neutral salience 1.0', () => {
	const result = generateDescription(artefact(), ['observational']);
	assert(result.primaryObservations.length > 0);
	assert(result.primaryObservations.every((o) => o.salience === 1.0));
});

Deno.test('provenance projection: siteName rendered, cultureId/phaseId/year absent', () => {
	const result = generateDescription(artefact(), ['observational']);
	assertEquals(result.provenance.siteName, 'Tesu');
	assertEquals(result.provenance.siteType, 'settlement');
	assertEquals(result.provenance.region, 'Test Region');
	assertEquals(result.provenance.layer, 'layer-1');
	assert(!('cultureId' in result.provenance));
	assert(!('phaseId' in result.provenance));
	assert(!('year' in result.provenance));
	assertEquals(result.provenance.dating, undefined);
});

Deno.test('TEMPLATES_BY_REGISTER covers all three shipped registers', () => {
	assert(TEMPLATES_BY_REGISTER.observational.length > 0);
	assert(TEMPLATES_BY_REGISTER.interpretive.length > 0);
	assert(TEMPLATES_BY_REGISTER.technical.length > 0);
});
