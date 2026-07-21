/// <reference lib="deno.ns" />
import { assert, assertEquals } from '@std/assert';
import { DECORATIVE_TECHNIQUES } from './decorations.ts';
import { MATERIALS } from './materials.ts';
import type { DecorativeTechnique } from '../types/decoration.ts';
import type { MaterialDefinition } from '../types/artefact.ts';

/** Keyed by `DecorativeTechnique` so the compiler flags a missing entry when the union gains a member. */
const ALL_TECHNIQUES_RECORD: Record<DecorativeTechnique, true> = {
	polish: true,
	patina: true,
	roughening: true,
	scoring: true,
	engraving: true,
	relief: true,
	painting: true,
	glaze: true,
	inlay: true,
	overlay: true,
	studs: true,
	'wire-wrapping': true,
	gilding: true,
	wrapping: true,
	tassels: true,
	beading: true,
};
const ALL_TECHNIQUES = Object.keys(ALL_TECHNIQUES_RECORD) as DecorativeTechnique[];

const VALID_CATEGORIES = new Set(['surface-treatment', 'applied-element', 'textile-element']);
const VALID_FORM_REQUIREMENTS = new Set(['grippable', 'attachment-point']);

function findMaterial(id: string): MaterialDefinition {
	const material = MATERIALS.find((m) => m.id === id);
	assert(material, `fixture material '${id}' must exist in MATERIALS`);
	return material;
}

/** Looks up a technique's `material`-kind substrate test, narrowing past the `DecorativeSubstrate` union. */
function getMaterialTest(
	technique: DecorativeTechnique,
): (material: MaterialDefinition) => boolean {
	const definition = DECORATIVE_TECHNIQUES.find((d) => d.technique === technique);
	assert(definition, technique);
	assert(definition.substrate.kind === 'material', technique);
	return definition.substrate.test;
}

Deno.test('decorations: every DecorativeTechnique has exactly one definition', () => {
	for (const technique of ALL_TECHNIQUES) {
		const matches = DECORATIVE_TECHNIQUES.filter((d) => d.technique === technique);
		assertEquals(matches.length, 1, technique);
	}
	assertEquals(DECORATIVE_TECHNIQUES.length, ALL_TECHNIQUES.length);
});

Deno.test('decorations: every category is one of the three BNF productions', () => {
	for (const definition of DECORATIVE_TECHNIQUES) {
		assert(VALID_CATEGORIES.has(definition.category), definition.technique);
	}
});

Deno.test('decorations: every substrate has a valid discriminant', () => {
	for (const definition of DECORATIVE_TECHNIQUES) {
		const { substrate } = definition;
		if (substrate.kind === 'material') {
			assert(substrate.label.length > 0, definition.technique);
			assertEquals(typeof substrate.test, 'function', definition.technique);
		} else if (substrate.kind === 'form') {
			assert(VALID_FORM_REQUIREMENTS.has(substrate.requires), definition.technique);
		} else {
			assertEquals(substrate.kind, 'none', definition.technique);
		}
	}
});

Deno.test('decorations: engraving accepts workable-engravable materials, rejects the rest', () => {
	const test = getMaterialTest('engraving');
	assert(test(findMaterial('bronze')));
	assert(test(findMaterial('gold'))); // soft but engravable (chasing/repoussé)
	assert(!test(findMaterial('flint')));
	assert(!test(findMaterial('fired-clay')));
});

Deno.test('decorations: glaze accepts only ceramic', () => {
	const test = getMaterialTest('glaze');
	assert(test(findMaterial('fired-clay')));
	assert(!test(findMaterial('bronze')));
	assert(!test(findMaterial('oak')));
});

Deno.test('decorations: gilding accepts only metal-tagged materials', () => {
	const test = getMaterialTest('gilding');
	assert(test(findMaterial('bronze')));
	assert(test(findMaterial('gold')));
	assert(test(findMaterial('silver')));
	assert(!test(findMaterial('oak')));
	assert(!test(findMaterial('fired-clay')));
});

Deno.test('decorations: painting accepts paintable materials, rejects the rest', () => {
	const test = getMaterialTest('painting');
	assert(test(findMaterial('oak')));
	assert(test(findMaterial('linen')));
	assert(!test(findMaterial('bronze')));
});

Deno.test('decorations: studs accepts rigid or leather, rejects soft non-leather', () => {
	const test = getMaterialTest('studs');
	assert(test(findMaterial('bronze'))); // rigid (not soft)
	assert(test(findMaterial('leather'))); // soft, but leather-tagged
	assert(!test(findMaterial('gold'))); // soft metal, not leather-tagged
});

Deno.test('decorations: wire-wrapping and wrapping are form-substrate, requiring grippable', () => {
	for (const technique of ['wire-wrapping', 'wrapping'] as const) {
		const definition = DECORATIVE_TECHNIQUES.find((d) => d.technique === technique);
		assert(definition, technique);
		assertEquals(definition.substrate, { kind: 'form', requires: 'grippable' });
	}
});

Deno.test('decorations: beading is form-substrate, requiring an attachment point', () => {
	const beading = DECORATIVE_TECHNIQUES.find((d) => d.technique === 'beading');
	assert(beading);
	assertEquals(beading.substrate, { kind: 'form', requires: 'attachment-point' });
});

Deno.test('decorations: only techniques with a literal <motif> BNF argument carry a motif', () => {
	const motifTechniques = new Set(['engraving', 'relief', 'painting', 'inlay']);
	for (const definition of DECORATIVE_TECHNIQUES) {
		assertEquals(
			definition.carriesMotif,
			motifTechniques.has(definition.technique),
			definition.technique,
		);
	}
});

Deno.test('decorations: introducesMaterial matches which techniques take a <material> BNF argument', () => {
	const materialIntroducingTechniques = new Set([
		'inlay',
		'overlay',
		'studs',
		'wire-wrapping',
		'gilding',
		'wrapping',
		'beading',
	]);
	for (const definition of DECORATIVE_TECHNIQUES) {
		assertEquals(
			definition.introducesMaterial,
			materialIntroducingTechniques.has(definition.technique),
			definition.technique,
		);
	}
});
