/// <reference lib="deno.ns" />
import { assertAlmostEquals, assertEquals } from '@std/assert';
import { assignMaterials } from './materialAssignment.ts';
import { isAvailable } from '../../../../lib/engine/generation/materials.ts';
import { MATERIALS } from '../../../../lib/data/materials.ts';
import { EXPLORER_CULTURES } from '../../../../lib/data/explorer-cultures.ts';

const tarpan = EXPLORER_CULTURES.find((culture) => culture.id === 'tarpan')!;
const khaltiris = EXPLORER_CULTURES.find((culture) => culture.id === 'khaltiris')!;
const xoconahtl = EXPLORER_CULTURES.find((culture) => culture.id === 'xoconahtl')!;

Deno.test('assignMaterials — is deterministic for the same seed, culture and draw count', () => {
	assertEquals(
		assignMaterials('mat-determinism', khaltiris, 20),
		assignMaterials('mat-determinism', khaltiris, 20),
	);
});

Deno.test('assignMaterials — assigns exactly one material per component', () => {
	const model = assignMaterials('mat-per-component', khaltiris, 10);
	assertEquals(model.assignments.length, model.artefact.components.length);
	for (const assignment of model.assignments) {
		assertEquals(typeof assignment.resolved.id, 'string');
	}
});

Deno.test('assignMaterials — every shipped material appears exactly once as a candidate', () => {
	const model = assignMaterials('mat-candidates', tarpan, 5);
	assertEquals(model.candidates.length, MATERIALS.length);
	assertEquals(
		new Set(model.candidates.map((c) => c.material.id)),
		new Set(MATERIALS.map((m) => m.id)),
	);
});

Deno.test('assignMaterials — candidate availability matches calling isAvailable directly', () => {
	for (const culture of EXPLORER_CULTURES) {
		const model = assignMaterials('mat-availability', culture, 1);
		for (const candidate of model.candidates) {
			assertEquals(
				candidate.available,
				isAvailable(candidate.material, culture.geology, culture.trade),
				`${culture.id}/${candidate.material.id}`,
			);
		}
	}
});

Deno.test('assignMaterials — blocked candidates carry zero weight, obtainable ones carry positive', () => {
	const model = assignMaterials('mat-weights', xoconahtl, 1);
	for (const candidate of model.candidates) {
		if (candidate.obtainability === 'blocked') {
			assertEquals(candidate.weight, 0, candidate.material.id);
			assertEquals(candidate.available, false, candidate.material.id);
		} else {
			assertEquals(candidate.weight > 0, true, candidate.material.id);
		}
	}
});

Deno.test('assignMaterials — candidates are ordered heaviest first and share normalises to the leader', () => {
	const model = assignMaterials('mat-ordering', khaltiris, 1);
	for (let i = 1; i < model.candidates.length; i++) {
		assertEquals(model.candidates[i - 1].weight >= model.candidates[i].weight, true);
	}
	assertAlmostEquals(model.candidates[0].share, 1, 1e-9);
});

Deno.test('assignMaterials — Explorer presets model every material, so none is unmodelled', () => {
	for (const culture of EXPLORER_CULTURES) {
		const model = assignMaterials('mat-modelled', culture, 1);
		for (const candidate of model.candidates) {
			assertEquals(
				candidate.obtainability === 'unmodelled',
				false,
				`${culture.id}/${candidate.material.id}`,
			);
			assertEquals(candidate.level !== undefined, true, `${culture.id}/${candidate.material.id}`);
		}
	}
});

Deno.test('assignMaterials — a trade-rescued candidate is reported as trade, not local', () => {
	// Tarpan's iron is `trade-only` and its metal flow reaches it; gold is `absent` outright.
	const model = assignMaterials('mat-trade', tarpan, 1);
	const iron = model.candidates.find((c) => c.material.id === 'iron')!;
	const gold = model.candidates.find((c) => c.material.id === 'gold')!;

	assertEquals(iron.level, 'trade-only');
	assertEquals(iron.obtainability, 'trade');
	assertEquals(gold.obtainability, 'blocked');
});

Deno.test('assignMaterials — no component is ever assigned a blocked material', () => {
	for (const culture of [tarpan, xoconahtl]) {
		const model = assignMaterials('mat-no-blocked', culture, 40);
		const blocked = new Set(
			model.candidates.filter((c) => c.obtainability === 'blocked').map((c) => c.material.id),
		);
		for (const assignment of model.assignments) {
			for (const entry of assignment.distribution) {
				assertEquals(blocked.has(entry.materialId), false, `${culture.id}/${entry.materialId}`);
			}
		}
	}
});

Deno.test('assignMaterials — each distribution sums to 1 and leads with the most-drawn material', () => {
	const model = assignMaterials('mat-distribution', khaltiris, 50);
	for (const assignment of model.assignments) {
		const total = assignment.distribution.reduce((sum, entry) => sum + entry.share, 0);
		assertAlmostEquals(total, 1, 1e-9, assignment.shortId);
		for (let i = 1; i < assignment.distribution.length; i++) {
			assertEquals(
				assignment.distribution[i - 1].share >= assignment.distribution[i].share,
				true,
			);
		}
	}
});

Deno.test('assignMaterials — a non-positive draw count still yields the canonical assignment', () => {
	const model = assignMaterials('mat-zero-draws', tarpan, 0);
	assertEquals(model.draws, 1);
	assertEquals(model.assignments.length, model.artefact.components.length);
});
