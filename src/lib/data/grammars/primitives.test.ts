/// <reference lib="deno.ns" />
import { assert, assertEquals } from '@std/assert';
import { isPrimitiveType, PRIMITIVE_PARAMETERS, PRIMITIVE_TYPES } from './primitives.ts';

Deno.test('registry: contains exactly the eight primitives from doc 05 §5.3', () => {
	assertEquals(Object.keys(PRIMITIVE_PARAMETERS), [
		'elongated',
		'cylindrical',
		'flat-broad',
		'hollow-enclosed',
		'ring-form',
		'disc-form',
		'bar-form',
		'sheet-form',
	]);
});

Deno.test('registry: each primitive exposes the expected parameter names', () => {
	const expected: Record<string, string[]> = {
		'elongated': ['length', 'crossSection', 'taper', 'edge', 'point'],
		'cylindrical': ['length', 'diameter', 'wall', 'opening', 'base'],
		'flat-broad': ['shape', 'size', 'thickness', 'curvature', 'perforation'],
		'hollow-enclosed': ['shape', 'size', 'wall', 'opening', 'base'],
		'ring-form': ['diameter', 'crossSection', 'gap'],
		'disc-form': ['diameter', 'thickness', 'perforation'],
		'bar-form': ['length', 'crossSection', 'taper'],
		'sheet-form': ['size', 'shape', 'flexibility'],
	};

	for (const [primitive, parameters] of Object.entries(PRIMITIVE_PARAMETERS)) {
		assertEquals(Object.keys(parameters), expected[primitive], primitive);
	}
});

Deno.test('registry: every parameter has a non-empty value list with no duplicates', () => {
	for (const [primitive, parameters] of Object.entries(PRIMITIVE_PARAMETERS)) {
		for (const [parameter, values] of Object.entries(parameters)) {
			const label = `${primitive}.${parameter}`;
			assert(values.length > 0, `${label} is empty`);
			assertEquals(values.length, new Set(values).size, `${label} has duplicates`);
		}
	}
});

Deno.test('registry: value lists match the doc 05 §5.3 spec verbatim (spot checks)', () => {
	assertEquals(PRIMITIVE_PARAMETERS['elongated'].crossSection, [
		'round',
		'oval',
		'rectangular',
		'triangular',
		'diamond',
	]);
	assertEquals(PRIMITIVE_PARAMETERS['disc-form'].perforation, ['none', 'central', 'off-centre']);
	assertEquals(PRIMITIVE_PARAMETERS['hollow-enclosed'].opening, ['wide', 'narrow', 'slit', 'none']);
	assertEquals(PRIMITIVE_PARAMETERS['bar-form'].taper, ['none', 'single-end', 'both-ends']);
	assertEquals(PRIMITIVE_PARAMETERS['ring-form'].gap, ['closed', 'open', 'overlapping']);
	assertEquals(PRIMITIVE_PARAMETERS['sheet-form'].flexibility, [
		'rigid',
		'semi-flexible',
		'flexible',
	]);
});

Deno.test('PRIMITIVE_TYPES: matches the registry keys exactly', () => {
	assertEquals([...PRIMITIVE_TYPES], Object.keys(PRIMITIVE_PARAMETERS));
});

Deno.test('isPrimitiveType: accepts all eight primitive ids', () => {
	for (const primitive of PRIMITIVE_TYPES) {
		assert(isPrimitiveType(primitive), primitive);
	}
});

Deno.test('isPrimitiveType: rejects non-primitive strings', () => {
	assert(!isPrimitiveType('artefact'));
	assert(!isPrimitiveType(''));
	assert(!isPrimitiveType('Elongated'));
});
