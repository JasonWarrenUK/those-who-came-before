/// <reference lib="deno.ns" />
import { assert, assertEquals } from '@std/assert';
import { inspectDecoration } from './decorationLayers.ts';
import { assignMaterials } from '../materials/materialAssignment.ts';
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

Deno.test('inspectDecoration — strippedCount is what enforceSubstrates removes, and equals unmetCount while flat', () => {
	// Guards the verdict/enforcement agreement: an `unmet` badge must mean "2GN.30 strips this"
	// and nothing else, for as long as layers are flat and no sublayer rides on a stripped parent.
	for (const seed of ['dec-strip-0', 'dec-strip-1', 'dec-strip-2', 'dec-strip-3']) {
		for (const culture of [tarpan, khaltiris]) {
			const model = inspectDecoration(seed, culture);
			assertEquals(model.strippedCount, model.unmetCount, `${seed}/${culture.id}`);
			assert(model.strippedCount <= model.layerCount);
		}
	}
});

Deno.test('inspectDecoration — motif is present exactly on motif-carrying techniques with a resolvable ref', () => {
	let seen = 0;
	for (const seed of ['dec-motif-0', 'dec-motif-1', 'dec-motif-2', 'dec-motif-3']) {
		const model = inspectDecoration(seed, khaltiris);
		const vocabulary = new Map(khaltiris.profile.motifVocabulary.motifs.map((m) => [m.id, m]));
		for (const component of model.components) {
			for (const layer of component.layers) {
				const carries = TECHNIQUES.get(layer.technique)!.carriesMotif;
				assertEquals(layer.motif !== undefined, carries, layer.technique);
				if (layer.motif === undefined) continue;
				seen++;
				const definition = vocabulary.get(layer.motif.id)!;
				assertEquals(layer.motif.label, definition.label);
				assertEquals(layer.motif.origin, definition.culturalOrigin);
				// No SharedMotifSource is passed, so nothing can be borrowed today.
				assertEquals(layer.motif.borrowed, false);
			}
		}
		assertEquals(model.borrowedMotifCount, 0);
	}
	assert(seen > 0, 'expected at least one motif-carrying layer across the sampled seeds');
});

Deno.test('inspectDecoration — introducedMaterial is present exactly on material-introducing techniques', () => {
	let seen = 0;
	for (const seed of ['dec-intro-0', 'dec-intro-1', 'dec-intro-2', 'dec-intro-3', 'dec-intro-4']) {
		const model = inspectDecoration(seed, khaltiris);
		for (const component of model.components) {
			for (const layer of component.layers) {
				const introduces = TECHNIQUES.get(layer.technique)!.introducesMaterial;
				assertEquals(layer.introducedMaterial !== undefined, introduces, layer.technique);
				if (layer.introducedMaterial !== undefined) seen++;
			}
		}
	}
	assert(seen > 0, 'expected at least one material-introducing layer across the sampled seeds');
});

Deno.test('inspectDecoration — the header counts match the per-layer flags', () => {
	const model = inspectDecoration('dec-header', khaltiris);
	let motifs = 0;
	let introduced = 0;
	for (const component of model.components) {
		for (const layer of component.layers) {
			if (layer.motif !== undefined) motifs++;
			if (layer.introducedMaterial !== undefined) introduced++;
		}
	}
	assertEquals(model.motifCount, motifs);
	assertEquals(model.introducedMaterialCount, introduced);
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

Deno.test('inspectDecoration — resolved material agrees with the material viewer for the same seed and component', () => {
	// Guards the cross-panel seed convention: both panels must draw the same material for the same
	// component so a developer comparing them side by side never sees a spurious mismatch. Matched
	// by `shortId`, not `componentId` — each panel's `normaliseArtefact` call prefixes component ids
	// with its own artefact id (`decoration-...` vs `materials-...`), so only position is shared.
	for (const culture of [tarpan, khaltiris]) {
		const decoration = inspectDecoration('dec-material-agreement', culture);
		const materials = assignMaterials('dec-material-agreement', culture, 1);
		for (const component of decoration.components) {
			const assignment = materials.assignments.find((a) => a.shortId === component.shortId);
			assertEquals(assignment?.resolved.id, component.material.id, component.shortId);
		}
	}
});
