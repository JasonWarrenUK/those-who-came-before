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
	'stoneWorking',
	'glassWorking',
	'woodWorking',
	'boneWorking',
]);

const VALID_HARDNESS = new Set(['soft', 'medium', 'hard']);

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

Deno.test('materials: every hardness is a valid value', () => {
	for (const material of MATERIALS) {
		assert(VALID_HARDNESS.has(material.physicalProperties.hardness), material.id);
	}
});

Deno.test('materials: every entry has a workable boolean', () => {
	for (const material of MATERIALS) {
		assertEquals(typeof material.physicalProperties.workable, 'boolean', material.id);
	}
});

Deno.test('materials: glazeable only ever true for clay-tagged materials (doc 05 §8.2)', () => {
	for (const material of MATERIALS) {
		if (material.decorability.glazeable) {
			assert(material.tags.includes('clay'), material.id);
		}
	}
});

Deno.test('materials: engravable only ever true when workable (doc 05 §8.2)', () => {
	for (const material of MATERIALS) {
		if (material.decorability.engravable) {
			assert(material.physicalProperties.workable, material.id);
		}
	}
});

Deno.test('materials: hardness and workability are independent axes (gold counter-example)', () => {
	const gold = MATERIALS.find((material) => material.id === 'gold');
	assert(gold, 'gold entry must exist');
	// Locks in the fix for the hardness/workability conflation: gold is structurally soft yet
	// genuinely engravable (chasing, repoussé), so this pins both facts so they can't silently
	// collapse back into a single "soft implies not engravable" invariant.
	assertEquals(gold.physicalProperties.hardness, 'soft');
	assertEquals(gold.physicalProperties.workable, true);
	assertEquals(gold.decorability.engravable, true);
});
