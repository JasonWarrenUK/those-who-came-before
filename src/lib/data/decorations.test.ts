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

Deno.test('decorations: relief accepts rigid materials regardless of fragility (roadmap 2GN.101)', () => {
	// Rigidity alone gates relief; fragility does not. Fired clay and glass are both fragile (they
	// shatter outright once brittle) yet both pass through a formable state before that point —
	// clay modelled wet then fired, glass cast or blown hot — so the relief exists before either
	// becomes brittle. A prior version of this gate also checked `fragility <= 5`, which excluded
	// both despite their real relief traditions (moulded pottery, cameo glass) being well attested.
	//
	// Obsidian and flint pass here too, which is a known limitation: they are worked only by
	// subtraction (conchoidal fracture) and never pass through a formable state, so they should not
	// really take modelled relief. No current material axis expresses formability (roadmap 2GN.102
	// tracks adding one), so rigidity-only is the honest gate for now rather than a fragility proxy
	// that gets fired-clay and glass wrong to get obsidian and flint right.
	const test = getMaterialTest('relief');
	assert(test(findMaterial('fired-clay')), 'fragile but formable before firing: moulded pottery');
	assert(test(findMaterial('glass')), 'fragile but formable while molten: cameo glass');
	assert(test(findMaterial('granite')), 'rigid stone, carved rather than modelled relief');
	assert(test(findMaterial('bronze')), 'rigid metal, repoussé/relief casting');
	assert(!test(findMaterial('linen')), 'pliable ground cannot hold a raised form');
	assert(!test(findMaterial('leather')), 'pliable ground cannot hold a raised form');
});

Deno.test('decorations: glaze accepts only ceramic', () => {
	const test = getMaterialTest('glaze');
	assert(test(findMaterial('fired-clay')));
	assert(!test(findMaterial('bronze')));
	assert(!test(findMaterial('oak')));
});

Deno.test('decorations: gilding accepts any sufficiently rigid ground, not metal only (roadmap 2GN.101)', () => {
	// Corrected from `gilding accepts only metal-tagged materials`, which was factually wrong: real
	// gilding is applied overwhelmingly to non-metal grounds — gilded wood and gesso are the
	// commonest historical case, with gilded leather bindings and gilded ceramic well attested.
	// Metal-on-metal fire-gilding is one tradition, not the prerequisite.
	//
	// The rigidity threshold is `>= 3`, matching `overlay`/`studs`, with the same named leather
	// exception `studs` carries (gilded leather bindings are attested). A prior version of this gate
	// used `>= 2`, which left the gate effectively a no-op (15 of 16 catalogue materials passed); the
	// granite case below pins that the threshold is doing real work now.
	const test = getMaterialTest('gilding');
	assert(test(findMaterial('gold')), 'metal grounds stay eligible');
	assert(test(findMaterial('oak')), 'gilded wood is the commonest real case');
	assert(test(findMaterial('fired-clay')), 'gilded ceramic is attested');
	assert(test(findMaterial('granite')), 'rigid stone stays eligible');
	assert(
		test(findMaterial('leather')),
		'gilded leather bindings are attested: the named exception',
	);
	assert(!test(findMaterial('linen')), 'genuinely pliable ground is excluded');
});

Deno.test('decorations: painting accepts paintable materials, rejects the rest', () => {
	const test = getMaterialTest('painting');
	assert(test(findMaterial('oak')));
	assert(test(findMaterial('linen')));
	assert(!test(findMaterial('bronze')));
});

Deno.test('decorations: studs accepts rigid or leather, rejects pliable non-leather (roadmap 2GN.101)', () => {
	const test = getMaterialTest('studs');
	assert(test(findMaterial('bronze')), 'rigid metal takes studs');
	assert(test(findMaterial('leather')), 'pliable, but the named leather exception applies');
	assert(!test(findMaterial('linen')), 'pliable and not leather-tagged');

	// Gold changed verdict here, deliberately. The old test rejected it via the `hardness !== 'soft'`
	// proxy — the same proxy misuse this task removed. Gold is structurally soft but perfectly rigid
	// (it holds worked shape), and real goldwork does take rivets and applied studs, so accepting it
	// is the corrected reading rather than a regression.
	assert(test(findMaterial('gold')), 'soft but rigid: real goldwork takes rivets and studs');
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
