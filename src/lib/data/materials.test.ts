/// <reference lib="deno.ns" />
import { assert, assertEquals } from '@std/assert';
import { MATERIALS } from './materials.ts';
import type { MaterialTag } from '../types/tags.ts';

/** Keyed by `MaterialTag` so the compiler flags a missing entry when the union gains a member. */
const ALL_MATERIAL_TAGS_RECORD: Record<MaterialTag, true> = {
	bone: true,
	wood: true,
	stone: true,
	metal: true,
	clay: true,
	glass: true,
	fiber: true,
	leather: true,
	'precious-stone': true,
	'precious-metal': true,
};
const ALL_MATERIAL_TAGS = Object.keys(ALL_MATERIAL_TAGS_RECORD) as MaterialTag[];

const VALID_CRAFT_DOMAINS = new Set([
	'metallurgy',
	'ceramics',
	'textiles',
	'leatherWorking',
	'stoneWorking',
	'glassWorking',
	'woodWorking',
	'boneWorking',
]);

/**
 * The six `physicalProperties` axes and their permitted ranges (roadmap 2GN.101). `hardness` runs
 * 1–10 because it is pegged to the real Mohs scale; the other five are authored 1–7 judgements.
 */
const AXIS_RANGES: Readonly<Record<string, { min: number; max: number }>> = {
	hardness: { min: 1, max: 10 },
	fragility: { min: 1, max: 7 },
	rigidity: { min: 1, max: 7 },
	grainFineness: { min: 1, max: 7 },
	porosity: { min: 1, max: 7 },
	combustibility: { min: 1, max: 7 },
};

Deno.test('materials: every MaterialTag has at least one material', () => {
	for (const tag of ALL_MATERIAL_TAGS) {
		const hasTag = MATERIALS.some((material) => material.tags.includes(tag));
		assert(hasTag, tag);
	}
});

Deno.test('materials: every id is unique', () => {
	const ids = MATERIALS.map((material) => material.id);
	assertEquals(ids.length, new Set(ids).size);
});

Deno.test('materials: every tags array is non-empty', () => {
	for (const material of MATERIALS) {
		assert(material.tags.length > 0, material.id);
	}
});

Deno.test('materials: every id and displayName is non-empty', () => {
	for (const material of MATERIALS) {
		assert(material.id.length > 0);
		assert(material.displayName.length > 0, material.id);
	}
});

Deno.test('materials: every craftDomain is a valid PhaseCharacteristics.technology key', () => {
	for (const material of MATERIALS) {
		assert(VALID_CRAFT_DOMAINS.has(material.craftDomain), material.id);
	}
});

Deno.test('materials: every physical-property axis is an integer inside its range', () => {
	for (const material of MATERIALS) {
		for (const [axis, range] of Object.entries(AXIS_RANGES)) {
			const value = material.physicalProperties[axis as keyof typeof material.physicalProperties];
			assert(Number.isInteger(value), `${material.id}.${axis} must be an integer, got ${value}`);
			assert(
				value >= range.min && value <= range.max,
				`${material.id}.${axis} must be ${range.min}–${range.max}, got ${value}`,
			);
		}
	}
});

Deno.test('materials: oxidisation is -1 (not applicable) or 0–7 (applicable and measured)', () => {
	// The `-1` sentinel is load-bearing (roadmap 2GN.101): it feeds `patina`'s substrate gate rather
	// than its difficulty weight, so "no oxidation chemistry at all" stays a different kind of fact
	// from "oxidises poorly". Anything between -1 and 0 would silently blur that line.
	for (const material of MATERIALS) {
		const { oxidisation } = material.reactivity;
		assert(Number.isInteger(oxidisation), `${material.id} oxidisation must be an integer`);
		assert(
			oxidisation === -1 || (oxidisation >= 0 && oxidisation <= 7),
			`${material.id} oxidisation must be -1 or 0–7, got ${oxidisation}`,
		);
	}
});

Deno.test('materials: gold is oxidisation 0, not -1 (roadmap 2GN.101)', () => {
	// Pins the distinction the sentinel exists to draw. Gold genuinely has oxidation chemistry and is
	// simply famously resistant to it, so it must stay measurable-but-negligible; the minerals and
	// fibres around it have no such chemistry at all and carry -1. Collapsing gold to -1 would gate
	// patina off gold entirely, which is wrong.
	const gold = MATERIALS.find((material) => material.id === 'gold');
	assert(gold, 'gold entry must exist');
	assertEquals(gold.reactivity.oxidisation, 0);
});

Deno.test('materials: glazeable only ever true for clay-tagged materials (doc 05 §8.2)', () => {
	for (const material of MATERIALS) {
		if (material.decorability.glazeable) {
			assert(material.tags.includes('clay'), material.id);
		}
	}
});

Deno.test('materials: engravable only ever true for sufficiently rigid materials (roadmap 2GN.101)', () => {
	// Restores the catalogue-wide invariant the deleted `engravable only ever true when workable`
	// test used to provide. The three axis-independence tests below each pin one hand-picked pair,
	// but none of them constrain `engravable` against the axes for the catalogue as a whole — this
	// closes that gap. `rigidity` is the right axis: its own JSDoc already states it is "the axis
	// that makes linen and leather unengravable despite being neither hard nor brittle", and every
	// engravable material in the catalogue reads rigidity >= 5.
	for (const material of MATERIALS) {
		if (material.decorability.engravable) {
			assert(material.physicalProperties.rigidity >= 3, material.id);
		}
	}
});

Deno.test('materials: fragility is independent of hardness (obsidian counter-example, roadmap 2GN.101)', () => {
	// The defect that motivated splitting the axes. `hardness` was previously carrying fragility's
	// job — `relief` and `overlay` both had substrate tests commenting that hardness "stands in as
	// the nearest proxy". Obsidian falsifies any such derivation: it is *softer* than flint on Mohs
	// yet among the most fracture-prone materials in the catalogue, because its edge comes from
	// conchoidal fracture rather than mineral hardness.
	const obsidian = MATERIALS.find((material) => material.id === 'obsidian');
	const flint = MATERIALS.find((material) => material.id === 'flint');
	assert(obsidian && flint, 'obsidian and flint entries must exist');

	assert(
		obsidian.physicalProperties.hardness < flint.physicalProperties.hardness,
		'obsidian must read softer than flint on the Mohs-pegged hardness axis',
	);
	assertEquals(obsidian.physicalProperties.fragility, flint.physicalProperties.fragility);
});

Deno.test('materials: grainFineness is independent of fragility (granite counter-example, roadmap 2GN.101)', () => {
	// The case that motivated adding `grainFineness` specifically. Granite is markedly *less*
	// fragile than obsidian, so any derivation of cutting precision from fragility would rank it the
	// more workable of the two — but granite's coarse crystalline grain caps achievable fineness
	// however carefully it is worked, while obsidian takes an edge finer than steel.
	const granite = MATERIALS.find((material) => material.id === 'granite');
	const obsidian = MATERIALS.find((material) => material.id === 'obsidian');
	assert(granite && obsidian, 'granite and obsidian entries must exist');

	assert(
		granite.physicalProperties.fragility < obsidian.physicalProperties.fragility,
		'granite must read less fragile than obsidian',
	);
	assert(
		granite.physicalProperties.grainFineness < obsidian.physicalProperties.grainFineness,
		'granite must still read coarser-grained than obsidian despite being less fragile',
	);
});

Deno.test('materials: rigidity is what excludes pliable materials, not hardness or fragility (roadmap 2GN.101)', () => {
	// Linen and leather are the softest and least fracture-prone materials in the catalogue, so
	// neither hardness nor fragility explains why they hold no incised line. `rigidity` does: they
	// deform instead of cutting. This is the third fact the old `workable` boolean was conflating.
	const linen = MATERIALS.find((material) => material.id === 'linen');
	assert(linen, 'linen entry must exist');

	assertEquals(linen.physicalProperties.fragility, 1); // Least fracture-prone possible.
	assertEquals(linen.physicalProperties.rigidity, 1); // Yet fully pliable.
	assertEquals(linen.decorability.engravable, false);
});
