/// <reference lib="deno.ns" />
import { assert, assertEquals, assertNotEquals, assertStrictEquals } from '@std/assert';
import {
	MOCK_WORLD_REGIONS,
	mockFullGeologicalContext,
	mockGeologicalContext,
	mockMaterialFlow,
	mockRegionalWorld,
	mockWorldSeed,
} from './world.ts';
import { isAvailable } from '../../src/lib/engine/generation/materials.ts';
import { MATERIALS } from '../../src/lib/data/materials.ts';

Deno.test('mockWorldSeed: same raw seed yields an identical draw sequence', () => {
	const a = mockWorldSeed('fixture-seed');
	const b = mockWorldSeed('fixture-seed');

	assertEquals(a.raw, b.raw);
	assertEquals([a.prng(), a.prng(), a.prng()], [b.prng(), b.prng(), b.prng()]);
});

// --- The six named regional worlds (roadmap 2GN.79) ----------------------------------------------

Deno.test('mockRegionalWorld: every region models every catalogue material explicitly', () => {
	for (const region of MOCK_WORLD_REGIONS) {
		const { geology } = mockRegionalWorld(region);

		for (const material of MATERIALS) {
			assert(
				geology.materialAvailability.has(material.id),
				`${region} leaves ${material.id} unmodelled — it would fall through isAvailable's lenience`,
			);
		}
		assertEquals(
			geology.materialAvailability.size,
			MATERIALS.length,
			`${region} models a material the catalogue does not contain`,
		);
	}
});

/**
 * `mockRegionalWorld` takes no default region (roadmap 2GN.79 audit): which world you generate
 * against changes the material distribution substantially, so callers must name one. This pins
 * the shorthand's agreement with the full record rather than a default that no longer exists.
 */
Deno.test('mockFullGeologicalContext: is mockRegionalWorld(region).geology', () => {
	for (const region of MOCK_WORLD_REGIONS) {
		assertEquals(mockFullGeologicalContext(region), mockRegionalWorld(region).geology);
	}
});

Deno.test('mockRegionalWorld: each region reports its own id and a non-empty summary', () => {
	for (const region of MOCK_WORLD_REGIONS) {
		const world = mockRegionalWorld(region);

		assertEquals(world.region, region);
		assert(world.summary.length > 0, `${region} has no summary`);
	}
});

/**
 * The point of the six-world family: a rule or weight tuned against one geology should be visibly
 * exposed by another. If every region resolved to the same available set, the family would be
 * decorative rather than a test instrument.
 */
Deno.test('mockRegionalWorld: regions differ in which materials are obtainable', () => {
	const availableSets = MOCK_WORLD_REGIONS.map((region) => {
		const { geology, trade } = mockRegionalWorld(region);
		return MATERIALS.filter((m) => isAvailable(m, geology, trade)).map((m) => m.id).join(',');
	});

	const distinct = new Set(availableSets);
	assert(
		distinct.size >= 4,
		`expected the six regions to resolve to several distinct available sets, got ${distinct.size}`,
	);
});

Deno.test('forestInterior: no trade flows, so every trade-only material is unreachable', () => {
	const { geology, trade } = mockRegionalWorld('forestInterior');

	assertEquals(trade.length, 0);

	const excluded = MATERIALS.filter((m) => !isAvailable(m, geology, trade)).map((m) => m.id);
	// Exercises isAvailable's trade-only-with-no-matching-flow branch, which no other region covers
	// through this path (desertMargin and steppeMargin reach it for single materials only).
	assert(excluded.includes('bronze'));
	assert(excluded.includes('gold'));
	assert(excluded.includes('glass'));
	assert(!excluded.includes('oak'), 'local organics must stay obtainable');
});

Deno.test('desertMargin: absent materials are excluded outright, putting wood and fibre out of reach', () => {
	const { geology, trade } = mockRegionalWorld('desertMargin');

	for (const id of ['oak', 'ash', 'linen']) {
		const material = MATERIALS.find((m) => m.id === id);
		assert(material !== undefined);
		assert(
			!isAvailable(material, geology, trade),
			`${id} is absent here and must not be available`,
		);
	}

	const obtainable = MATERIALS.filter((m) => isAvailable(m, geology, trade));
	assert(!obtainable.some((m) => m.tags.includes('wood')));
	assert(!obtainable.some((m) => m.tags.includes('fiber')));
	assert(obtainable.some((m) => m.tags.includes('stone')), 'stone is abundant here');
});

Deno.test('coastalPort: trade is what makes most of its catalogue reachable', () => {
	const { geology, trade } = mockRegionalWorld('coastalPort');

	const withTrade = MATERIALS.filter((m) => isAvailable(m, geology, trade)).length;
	const withoutTrade = MATERIALS.filter((m) => isAvailable(m, geology, [])).length;

	assertEquals(withTrade, MATERIALS.length, 'its flows should reach everything trade-only');
	assert(
		withTrade - withoutTrade >= 5,
		`expected trade to unlock several materials, unlocked ${withTrade - withoutTrade}`,
	);
});

Deno.test('mockGeologicalContext: kept deliberately partial for the unmodelled-lenience path', () => {
	const geology = mockGeologicalContext();

	// Unchanged by 2GN.79 on purpose — it is the fixture that exercises isAvailable's
	// "not modelled → obtainable" MVP lenience, which the six full worlds no longer reach.
	assert(geology.materialAvailability.size < MATERIALS.length);

	const silver = MATERIALS.find((m) => m.id === 'silver');
	assert(silver !== undefined);
	assert(isAvailable(silver, geology, []), 'unmodelled materials read as obtainable');
});

Deno.test('mockRegionalWorld: returns equal geology across calls (stable identity for callers)', () => {
	assertStrictEquals(
		mockRegionalWorld('riverValley').geology,
		mockRegionalWorld('riverValley').geology,
	);
	assertNotEquals(
		mockRegionalWorld('riverValley').geology,
		mockRegionalWorld('highlandMine').geology,
	);
});

Deno.test('mockMaterialFlow: overrides merge over the bidirectional metal default', () => {
	assertEquals(mockMaterialFlow().materialTag, 'metal');
	assertEquals(mockMaterialFlow({ materialTag: 'glass' }).materialTag, 'glass');
	assertEquals(mockMaterialFlow({ volume: 0.1 }).direction, 'bidirectional');
});
