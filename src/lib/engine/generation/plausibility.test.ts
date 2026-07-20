/// <reference lib="deno.ns" />
import { assert, assertEquals } from '@std/assert';
import { checkPlausibility } from './plausibility.ts';
import { PLAUSIBILITY_RULES } from '../../data/plausibility.ts';
import { mockNormalisedArtefact } from '../../../../tests/fixtures/artefact.ts';
import type { NormalisedComponent } from '../../types/artefact.ts';
import type { PlausibilityRule } from '../../types/plausibility.ts';

/** Builds a bare component with the given primitive type and properties, for rule tests. */
function component(
	id: string,
	primitiveType: string,
	properties: Record<string, string> = {},
	position = 0,
): NormalisedComponent {
	return {
		id,
		primitiveType,
		properties: new Map(Object.entries(properties)),
		allowedMaterialTags: [],
		position,
	};
}

// --- Default wiring against the real shipped rule set -------------------------------------------

Deno.test('checkPlausibility: a single-component default fixture is valid against the shipped rules', () => {
	const result = checkPlausibility(mockNormalisedArtefact());
	assertEquals(result, { valid: true, failures: [] });
});

Deno.test('checkPlausibility: defaults to PLAUSIBILITY_RULES when no rule set is given', () => {
	const artefact = mockNormalisedArtefact({
		components: [component('c0', 'elongated', { edge: 'single' })],
	});
	const withDefault = checkPlausibility(artefact);
	const withExplicit = checkPlausibility(artefact, PLAUSIBILITY_RULES);
	assertEquals(withDefault, withExplicit);
});

// --- Each of the four live predicate rules, triggered and satisfied -----------------------------

Deno.test('checkPlausibility: R1 violation surfaces its reason', () => {
	const artefact = mockNormalisedArtefact({
		components: [component('c0', 'elongated', { edge: 'single' })],
	});
	const result = checkPlausibility(artefact);
	assert(!result.valid);
	assert(result.failures.includes('an edged blade needs something to grip'));
});

Deno.test('checkPlausibility: R2 violation surfaces its reason', () => {
	const artefact = mockNormalisedArtefact({
		components: [component('c0', 'elongated', { edge: 'double', length: 'long' })],
	});
	const result = checkPlausibility(artefact);
	assert(!result.valid);
	assert(result.failures.includes('a long blade needs at least a medium-length grip'));
});

Deno.test('checkPlausibility: R3 violation surfaces its reason', () => {
	const artefact = mockNormalisedArtefact({
		components: [component('c0', 'elongated'), component('c1', 'disc-form')],
		attachments: [{ fromComponentId: 'c0', toComponentId: 'c1', type: 'perpendicular' }],
		dimensions: { primaryExtent: 40, secondaryExtent: 10, mass: 'heavy' },
	});
	const result = checkPlausibility(artefact);
	assert(!result.valid);
	assert(result.failures.includes('a heavy perpendicular or lashed head needs a rigid shaft'));
});

Deno.test('checkPlausibility: R4 violation surfaces its reason', () => {
	const artefact = mockNormalisedArtefact({
		components: [component('c0', 'hollow-enclosed', { wall: 'thin' })],
		dimensions: { primaryExtent: 30, secondaryExtent: 30, mass: 'heavy' },
	});
	const result = checkPlausibility(artefact);
	assert(!result.valid);
	assert(
		result.failures.includes(
			'a heavy component on a thin-walled hollow form is structurally implausible',
		),
	);
});

Deno.test('checkPlausibility: a satisfied rule set contributes no failure', () => {
	const artefact = mockNormalisedArtefact({
		components: [
			component('c0', 'elongated', { edge: 'single' }),
			component('c1', 'cylindrical'),
		],
	});
	const result = checkPlausibility(artefact);
	assertEquals(result, { valid: true, failures: [] });
});

// --- Multiple simultaneous violations ------------------------------------------------------------

Deno.test('checkPlausibility: simultaneous violations collect every reason in rule order', () => {
	// Violates R1 (no grip) and R4 (heavy + thin-walled hollow) at once.
	const artefact = mockNormalisedArtefact({
		components: [component('c0', 'hollow-enclosed', { wall: 'thin', edge: 'single' })],
		dimensions: { primaryExtent: 30, secondaryExtent: 30, mass: 'heavy' },
	});
	const result = checkPlausibility(artefact);
	assert(!result.valid);
	assertEquals(result.failures, [
		'a heavy component on a thin-walled hollow form is structurally implausible',
	]);
});

// --- Declarative rule variants: no live instances, but the runner must still handle them --------

Deno.test('checkPlausibility: an injected "requires" rule fires when the dependency is absent', () => {
	const rules: PlausibilityRule[] = [
		{ type: 'requires', component: 'elongated', dependsOn: 'cylindrical' },
	];
	const artefact = mockNormalisedArtefact({
		components: [component('c0', 'elongated')],
	});
	const result = checkPlausibility(artefact, rules);
	assert(!result.valid);
	assertEquals(result.failures.length, 1);
});

Deno.test('checkPlausibility: an injected "requires" rule is satisfied when the dependency is present', () => {
	const rules: PlausibilityRule[] = [
		{ type: 'requires', component: 'elongated', dependsOn: 'cylindrical' },
	];
	const artefact = mockNormalisedArtefact({
		components: [component('c0', 'elongated'), component('c1', 'cylindrical')],
	});
	assertEquals(checkPlausibility(artefact, rules), { valid: true, failures: [] });
});

Deno.test('checkPlausibility: an injected "excludes" rule fires when both components are present', () => {
	const rules: PlausibilityRule[] = [
		{ type: 'excludes', component: 'elongated', excludes: 'disc-form' },
	];
	const artefact = mockNormalisedArtefact({
		components: [component('c0', 'elongated'), component('c1', 'disc-form')],
	});
	const result = checkPlausibility(artefact, rules);
	assert(!result.valid);
	assertEquals(result.failures.length, 1);
});

Deno.test('checkPlausibility: an injected "excludes" rule is satisfied when only one component is present', () => {
	const rules: PlausibilityRule[] = [
		{ type: 'excludes', component: 'elongated', excludes: 'disc-form' },
	];
	const artefact = mockNormalisedArtefact({
		components: [component('c0', 'elongated')],
	});
	assertEquals(checkPlausibility(artefact, rules), { valid: true, failures: [] });
});

Deno.test('checkPlausibility: an injected "ordering" rule fires when the component comes after its bound', () => {
	const rules: PlausibilityRule[] = [
		{ type: 'ordering', component: 'disc-form', before: 'elongated' },
	];
	const artefact = mockNormalisedArtefact({
		components: [
			component('c0', 'elongated', {}, 0),
			component('c1', 'disc-form', {}, 1),
		],
	});
	const result = checkPlausibility(artefact, rules);
	assert(!result.valid);
	assertEquals(result.failures.length, 1);
});

Deno.test('checkPlausibility: an injected "ordering" rule is satisfied when the component precedes its bound', () => {
	const rules: PlausibilityRule[] = [
		{ type: 'ordering', component: 'disc-form', before: 'elongated' },
	];
	const artefact = mockNormalisedArtefact({
		components: [
			component('c0', 'disc-form', {}, 0),
			component('c1', 'elongated', {}, 1),
		],
	});
	assertEquals(checkPlausibility(artefact, rules), { valid: true, failures: [] });
});

// --- Empty rule set --------------------------------------------------------------------------------

Deno.test('checkPlausibility: an empty rule set is always valid', () => {
	const artefact = mockNormalisedArtefact({
		components: [component('c0', 'elongated', { edge: 'single' })],
	});
	assertEquals(checkPlausibility(artefact, []), { valid: true, failures: [] });
});

// --- Purity and determinism -----------------------------------------------------------------------

Deno.test('checkPlausibility: is pure — repeat calls on the same input agree and input is untouched', () => {
	const artefact = mockNormalisedArtefact({
		components: [component('c0', 'elongated', { edge: 'single' })],
	});
	const snapshot = structuredClone(artefact);

	const first = checkPlausibility(artefact);
	const second = checkPlausibility(artefact);

	assertEquals(first, second);
	assertEquals(artefact, snapshot);
});
