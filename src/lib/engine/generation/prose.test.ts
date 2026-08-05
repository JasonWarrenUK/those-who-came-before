/// <reference lib="deno.ns" />
import { assert, assertEquals } from '@std/assert';
import { describeProse, shortId } from './prose.ts';
import type { NormalisedComponent } from '../../types/artefact.ts';

function component(
	overrides: Partial<NormalisedComponent> = {},
): NormalisedComponent {
	return {
		id: 'test-component',
		primitiveType: 'elongated',
		properties: new Map<string, string | number>([
			['length', 'long'],
			['crossSection', 'rectangular'],
			['taper', 'gradual'],
			['edge', 'double'],
			['point', 'sharp'],
		]),
		allowedMaterialTags: ['metal'],
		position: 0,
		...overrides,
	};
}

Deno.test('prose: shortId prefixes the component position', () => {
	assertEquals(shortId(component({ position: 3 })), 'c3');
});

Deno.test('prose: renders one sentence per known parameter, joined with a space', () => {
	const result = describeProse(component());
	assert(result.includes('A long form along its primary axis.'), result);
	assert(result.includes('A rectangular cross-section.'), result);
	assert(result.includes('The form narrows with a gradual taper.'), result);
	assert(result.includes('A double edge runs along the form.'), result);
	assert(result.includes('The terminus comes to a sharp point.'), result);
});

Deno.test("prose: 'none'-valued parameters drop their clause entirely", () => {
	const result = describeProse(
		component({
			properties: new Map<string, string | number>([
				['length', 'short'],
				['crossSection', 'round'],
				['taper', 'none'],
				['edge', 'none'],
				['point', 'none'],
			]),
		}),
	);
	assert(!result.includes('taper'), result);
	assert(!result.includes('edge'), result);
	assert(!result.includes('point'), result);
	assert(result.includes('A short form along its primary axis.'), result);
});

Deno.test('prose: absent parameters drop their clause entirely', () => {
	const result = describeProse(
		component({
			properties: new Map<string, string | number>([['length', 'medium']]),
		}),
	);
	assertEquals(result, 'A medium form along its primary axis.');
});

Deno.test('prose: unknown primitive falls back to raw key=value pairs', () => {
	const result = describeProse(
		component({
			primitiveType: 'mystery-primitive',
			properties: new Map<string, string | number>([['weight', 5], ['colour', 'red']]),
		}),
	);
	assertEquals(result, 'weight=5, colour=red');
});

Deno.test('prose: deterministic — same component, same string', () => {
	const c = component();
	assertEquals(describeProse(c), describeProse(c));
});

Deno.test("prose: hollow-enclosed opening 'none' renders as a sealed vessel, not a dropped clause", () => {
	const result = describeProse(
		component({
			primitiveType: 'hollow-enclosed',
			properties: new Map<string, string | number>([
				['shape', 'ovoid'],
				['size', 'medium'],
				['wall', 'thin'],
				['opening', 'none'],
				['base', 'flat'],
			]),
		}),
	);
	assert(result.includes('The form has no opening.'), result);
	assert(!result.includes('The mouth is'), result);
});

Deno.test("prose: bar-form taper 'none' renders as untapered, not a dropped clause", () => {
	const result = describeProse(
		component({
			primitiveType: 'bar-form',
			properties: new Map<string, string | number>([
				['length', 'long'],
				['crossSection', 'round'],
				['taper', 'none'],
			]),
		}),
	);
	assert(result.includes('The form is untapered.'), result);
	assert(!result.includes('narrows'), result);
});

Deno.test('prose: bar-form taper falls through to the unconditioned variant for a non-none value', () => {
	const result = describeProse(
		component({
			primitiveType: 'bar-form',
			properties: new Map<string, string | number>([
				['length', 'long'],
				['crossSection', 'round'],
				['taper', 'single-end'],
			]),
		}),
	);
	assert(result.includes('The form narrows with a single-end taper.'), result);
	assert(!result.includes('untapered'), result);
});

Deno.test('prose: "a"/"an" article agreement on .a slots', () => {
	const vowelLed = describeProse(
		component({
			primitiveType: 'ring-form',
			properties: new Map<string, string | number>([
				['diameter', 'large'],
				['crossSection', 'round'],
				['gap', 'closed'],
			]),
		}),
	);
	assert(vowelLed.includes('An large annular form.') === false, vowelLed);
	assert(vowelLed.includes('A large annular form.'), vowelLed);

	const withOverlap = describeProse(
		component({
			primitiveType: 'ring-form',
			properties: new Map<string, string | number>([
				['diameter', 'overlapping' as string],
				['crossSection', 'round'],
				['gap', 'closed'],
			]),
		}),
	);
	assert(withOverlap.includes('An overlapping annular form.'), withOverlap);
});
