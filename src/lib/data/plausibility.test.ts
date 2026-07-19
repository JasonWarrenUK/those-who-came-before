/// <reference lib="deno.ns" />
import { assert, assertEquals } from '@std/assert';
import { PLAUSIBILITY_RULES } from './plausibility.ts';
import { isPrimitiveType, PRIMITIVE_TYPES } from './grammars/primitives.ts';
import { ATTACHMENT_TYPE_VALUES } from '../types/grammar.ts';
import { mockNormalisedArtefact } from '../../../tests/fixtures/artefact.ts';
import type { NormalisedComponent } from '../types/artefact.ts';

/** Builds a bare component with the given primitive type and properties, for rule tests. */
function component(
	id: string,
	primitiveType: string,
	properties: Record<string, string> = {},
): NormalisedComponent {
	return {
		id,
		primitiveType,
		properties: new Map(Object.entries(properties)),
		allowedMaterialTags: [],
		position: 0,
	};
}

Deno.test('rules: every rule has a valid discriminant type', () => {
	const validTypes = new Set(['requires', 'excludes', 'ordering', 'material-physics', 'ergonomic']);
	for (const rule of PLAUSIBILITY_RULES) {
		assert(validTypes.has(rule.type), rule.type);
	}
});

Deno.test('rules: every predicate variant carries a non-empty reason', () => {
	for (const rule of PLAUSIBILITY_RULES) {
		if (rule.type !== 'material-physics' && rule.type !== 'ergonomic') continue;
		assert(rule.reason.length > 0, rule.type);
	}
});

Deno.test('rules: no two predicate rules share the same reason', () => {
	const reasons = PLAUSIBILITY_RULES
		.filter((rule) => rule.type === 'material-physics' || rule.type === 'ergonomic')
		.map((rule) => (rule as { reason: string }).reason);
	assertEquals(reasons.length, new Set(reasons).size);
});

Deno.test('rules: every shipped predicate runs against the default fixture without throwing', () => {
	const artefact = mockNormalisedArtefact();
	for (const rule of PLAUSIBILITY_RULES) {
		if (rule.type !== 'material-physics' && rule.type !== 'ergonomic') continue;
		const result = rule.predicate(artefact);
		assertEquals(typeof result, 'boolean', rule.reason);
	}
});

// --- R1: edged blade needs a grip (doc 05 §6.2 example 1) --------------------------------------

const R1 = PLAUSIBILITY_RULES[0];
if (R1.type !== 'ergonomic') throw new Error('PLAUSIBILITY_RULES[0] must be the grip-needed rule');

Deno.test('R1: a lone edged elongated component violates the rule', () => {
	const artefact = mockNormalisedArtefact({
		components: [component('c0', 'elongated', { edge: 'single' })],
	});
	assert(R1.predicate(artefact));
});

Deno.test('R1: an edged elongated component plus a second component satisfies the rule', () => {
	const artefact = mockNormalisedArtefact({
		components: [
			component('c0', 'elongated', { edge: 'single' }),
			component('c1', 'cylindrical'),
		],
	});
	assert(!R1.predicate(artefact));
});

Deno.test('R1: an elongated component with no edge never violates the rule', () => {
	const artefact = mockNormalisedArtefact({
		components: [component('c0', 'elongated', { edge: 'none' })],
	});
	assert(!R1.predicate(artefact));
});

// --- R2: long edged form needs adequate grip length (doc 05 §6.2 example 2) --------------------

const R2 = PLAUSIBILITY_RULES[1];
if (R2.type !== 'ergonomic') throw new Error('PLAUSIBILITY_RULES[1] must be the grip-length rule');

Deno.test('R2: a lone long edged blade violates the rule', () => {
	const artefact = mockNormalisedArtefact({
		components: [component('c0', 'elongated', { edge: 'double', length: 'long' })],
	});
	assert(R2.predicate(artefact));
});

Deno.test('R2: a long edged blade plus a medium-length component satisfies the rule', () => {
	const artefact = mockNormalisedArtefact({
		components: [
			component('c0', 'elongated', { edge: 'double', length: 'long' }),
			component('c1', 'elongated', { length: 'medium' }),
		],
	});
	assert(!R2.predicate(artefact));
});

Deno.test('R2: a short edged blade never violates the rule', () => {
	const artefact = mockNormalisedArtefact({
		components: [component('c0', 'elongated', { edge: 'double', length: 'short' })],
	});
	assert(!R2.predicate(artefact));
});

// --- R3: heavy perpendicular/lashed attachment needs a rigid shaft (doc 05 §6.2 example 3) ------

const R3 = PLAUSIBILITY_RULES[2];
if (R3.type !== 'material-physics') {
	throw new Error('PLAUSIBILITY_RULES[2] must be the rigid-shaft rule');
}

Deno.test('R3: a heavy artefact with a perpendicular attachment and no rigid shaft violates the rule', () => {
	const artefact = mockNormalisedArtefact({
		components: [component('c0', 'elongated'), component('c1', 'disc-form')],
		attachments: [{ fromComponentId: 'c0', toComponentId: 'c1', type: 'perpendicular' }],
		dimensions: { primaryExtent: 40, secondaryExtent: 10, mass: 'heavy' },
	});
	assert(R3.predicate(artefact));
});

Deno.test('R3: the same shape with a rigid sheet-form shaft satisfies the rule', () => {
	const artefact = mockNormalisedArtefact({
		components: [
			component('c0', 'sheet-form', { flexibility: 'rigid' }),
			component('c1', 'disc-form'),
		],
		attachments: [{ fromComponentId: 'c0', toComponentId: 'c1', type: 'perpendicular' }],
		dimensions: { primaryExtent: 40, secondaryExtent: 10, mass: 'heavy' },
	});
	assert(!R3.predicate(artefact));
});

Deno.test('R3: a light artefact with the same perpendicular join never violates the rule', () => {
	const artefact = mockNormalisedArtefact({
		components: [component('c0', 'elongated'), component('c1', 'disc-form')],
		attachments: [{ fromComponentId: 'c0', toComponentId: 'c1', type: 'perpendicular' }],
		dimensions: { primaryExtent: 10, secondaryExtent: 2, mass: 'light' },
	});
	assert(!R3.predicate(artefact));
});

// --- R4: heavy component on a thin-walled hollow form (doc 05 §6.2 example 4) -------------------

const R4 = PLAUSIBILITY_RULES[3];
if (R4.type !== 'material-physics') {
	throw new Error('PLAUSIBILITY_RULES[3] must be the thin-wall rule');
}

Deno.test('R4: a heavy artefact with a thin-walled hollow-enclosed component violates the rule', () => {
	const artefact = mockNormalisedArtefact({
		components: [component('c0', 'hollow-enclosed', { wall: 'thin' })],
		dimensions: { primaryExtent: 30, secondaryExtent: 30, mass: 'heavy' },
	});
	assert(R4.predicate(artefact));
});

Deno.test('R4: a light artefact with the same thin-walled shape never violates the rule', () => {
	const artefact = mockNormalisedArtefact({
		components: [component('c0', 'hollow-enclosed', { wall: 'thin' })],
		dimensions: { primaryExtent: 30, secondaryExtent: 30, mass: 'light' },
	});
	assert(!R4.predicate(artefact));
});

Deno.test('R4: a heavy artefact with a thick-walled hollow form never violates the rule', () => {
	const artefact = mockNormalisedArtefact({
		components: [component('c0', 'hollow-enclosed', { wall: 'thick' })],
		dimensions: { primaryExtent: 30, secondaryExtent: 30, mass: 'heavy' },
	});
	assert(!R4.predicate(artefact));
});

// --- Cross-reference: string literals the rules key off resolve against real vocabularies -------

Deno.test('cross-reference: every primitiveType literal the helpers key off is a real primitive', () => {
	const referenced = ['elongated', 'sheet-form', 'bar-form', 'hollow-enclosed'];
	for (const primitiveType of referenced) {
		assert(isPrimitiveType(primitiveType), primitiveType);
	}
	assertEquals(new Set(PRIMITIVE_TYPES).size, PRIMITIVE_TYPES.length);
});

Deno.test('cross-reference: every attachment type literal the helpers key off is a real attachment type', () => {
	const referenced = ['perpendicular', 'lashed'];
	for (const attachmentType of referenced) {
		assert((ATTACHMENT_TYPE_VALUES as readonly string[]).includes(attachmentType), attachmentType);
	}
});
