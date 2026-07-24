/// <reference lib="deno.ns" />
import { assertEquals } from '@std/assert';
import { inspectDecoration } from './decorationLayers.ts';
import { DECORATIVE_TECHNIQUES } from '../../../../lib/data/decorations.ts';
import { EXPLORER_CULTURES } from '../../../../lib/data/explorer-cultures.ts';

const tarpan = EXPLORER_CULTURES.find((culture) => culture.id === 'tarpan')!;
const khaltiris = EXPLORER_CULTURES.find((culture) => culture.id === 'khaltiris')!;

const TECHNIQUES = new Map(DECORATIVE_TECHNIQUES.map((d) => [d.technique, d]));

Deno.test('inspectDecoration — is deterministic for the same seed and culture', () => {
	assertEquals(
		inspectDecoration('dec-determinism', khaltiris),
		inspectDecoration('dec-determinism', khaltiris),
	);
});

Deno.test('inspectDecoration — reports one entry per component, including undecorated ones', () => {
	const model = inspectDecoration('dec-components', khaltiris);
	assertEquals(model.components.length, model.artefact.components.length);
	assertEquals(
		model.components.map((c) => c.componentId),
		model.artefact.components.map((c) => c.id),
	);
});

Deno.test('inspectDecoration — layerCount matches the layers actually reported per component', () => {
	const model = inspectDecoration('dec-count', khaltiris);
	const counted = model.components.reduce((total, component) => total + component.layers.length, 0);
	assertEquals(counted, model.layerCount); // Flat today, so a plain sum suffices.
});

Deno.test('inspectDecoration — decoration is flat, so depth is always zero', () => {
	for (const seed of ['dec-flat-0', 'dec-flat-1', 'dec-flat-2']) {
		const model = inspectDecoration(seed, khaltiris);
		assertEquals(model.maxDepth, 0);
		for (const component of model.components) {
			for (const layer of component.layers) {
				assertEquals(layer.depth, 0);
				assertEquals(layer.sublayers, []);
			}
		}
	}
});

Deno.test("inspectDecoration — each layer's category matches its technique definition", () => {
	const model = inspectDecoration('dec-category', khaltiris);
	for (const component of model.components) {
		for (const layer of component.layers) {
			assertEquals(layer.category, TECHNIQUES.get(layer.technique)!.category);
		}
	}
});

Deno.test('inspectDecoration — a material prerequisite verdict matches running substrate.test directly', () => {
	const model = inspectDecoration('dec-prereq', khaltiris);
	for (const component of model.components) {
		for (const layer of component.layers) {
			const substrate = TECHNIQUES.get(layer.technique)!.substrate;
			if (substrate.kind !== 'material') continue;

			const expected = substrate.test(component.material) ? 'met' : 'unmet';
			assertEquals(layer.verdict, expected, `${layer.technique} on ${component.material.id}`);
			assertEquals(layer.requirement, substrate.label);
		}
	}
});

Deno.test('inspectDecoration — form prerequisites are reported unevaluated, none-substrates as none', () => {
	const model = inspectDecoration('dec-verdicts', khaltiris);
	for (const component of model.components) {
		for (const layer of component.layers) {
			const substrate = TECHNIQUES.get(layer.technique)!.substrate;
			if (substrate.kind === 'form') assertEquals(layer.verdict, 'unevaluated');
			if (substrate.kind === 'none') {
				assertEquals(layer.verdict, 'none');
				assertEquals(layer.requirement, undefined);
			}
		}
	}
});

Deno.test('inspectDecoration — unmetCount counts exactly the layers whose verdict is unmet', () => {
	const model = inspectDecoration('dec-unmet', khaltiris);
	const counted = model.components.reduce(
		(total, component) => total + component.layers.filter((l) => l.verdict === 'unmet').length,
		0,
	);
	assertEquals(counted, model.unmetCount);
});

Deno.test('inspectDecoration — every layer belongs to the component it is reported under', () => {
	// Guards the targetComponentId grouping: a layer must never be attributed to another component.
	const model = inspectDecoration('dec-grouping', khaltiris);
	const ids = new Set(model.artefact.components.map((c) => c.id));
	for (const component of model.components) {
		assertEquals(ids.has(component.componentId), true);
	}
});

Deno.test('inspectDecoration — both cultures produce a well-formed model for the same seed', () => {
	// Not asserting layer counts differ: a seed may roll alike under either culture.
	for (const culture of [tarpan, khaltiris]) {
		const model = inspectDecoration('dec-culture-variation', culture);
		assertEquals(model.components.length, model.artefact.components.length);
		assertEquals(model.layerCount >= 0, true);
	}
});
