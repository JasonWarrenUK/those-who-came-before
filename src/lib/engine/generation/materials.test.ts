/// <reference lib="deno.ns" />
import { assert, assertEquals, assertNotEquals } from '@std/assert';
import {
	assignMaterial,
	assignMaterials,
	assignMaterialWithProvenance,
	computeMaterialWeight,
	deriveMaterialProvenance,
	explainMaterialWeight,
	isAvailable,
} from './materials.ts';
import { MATERIALS } from '../../data/materials.ts';
import { createPrng } from '../prng.ts';
import { mockNormalisedArtefact } from '../../../../tests/fixtures/artefact.ts';
import {
	mockCulturalProfile,
	mockPhaseCharacteristics,
} from '../../../../tests/fixtures/culture.ts';
import {
	MOCK_WORLD_REGIONS,
	mockGeologicalContext,
	mockMaterialFlow,
	mockRegionalWorld,
} from '../../../../tests/fixtures/world.ts';
import type { NormalisedComponent } from '../../types/artefact.ts';
import type { MaterialName, MaterialTag } from '../../types/tags.ts';

/** Looks up a shipped material by id; throws if the fixture data ever drops it. */
function material(id: string) {
	const found = MATERIALS.find((m) => m.id === id);
	if (!found) throw new Error(`test fixture expects a shipped material '${id}'`);
	return found;
}

/** Builds a bare component restricted to the given material tags. */
function component(allowedMaterialTags: MaterialTag[]): NormalisedComponent {
	const [base] = mockNormalisedArtefact().components;
	return { ...base!, allowedMaterialTags };
}

/** Builds a bare component with a distinct id/position, for multi-component artefact tests. */
function componentAt(id: string, position: number, allowedMaterialTags: MaterialTag[] = []) {
	return { ...component(allowedMaterialTags), id, position };
}

// --- isAvailable ---------------------------------------------------------------------------------

Deno.test('isAvailable: abundant/available/scarce are locally obtainable', () => {
	const geology = mockGeologicalContext();
	assertEquals(isAvailable(material('bronze'), geology, []), true); // abundant
	assertEquals(isAvailable(material('iron'), geology, []), true); // scarce
});

Deno.test('isAvailable: absent everywhere and no trade is unobtainable', () => {
	assertEquals(isAvailable(material('flint'), mockGeologicalContext(), []), false);
});

Deno.test('isAvailable: trade-only requires a matching trade flow', () => {
	const geology = mockGeologicalContext(); // gold is 'trade-only'
	assertEquals(isAvailable(material('gold'), geology, []), false);
	assertEquals(
		isAvailable(material('gold'), geology, [mockMaterialFlow({ includes: [{ tag: 'metal' }] })]),
		true,
	);
	assertEquals(
		isAvailable(material('gold'), geology, [mockMaterialFlow({ includes: [{ tag: 'wood' }] })]),
		false,
	);
});

Deno.test('isAvailable: trade-only reachable via an id selector whose class the flow does not carry', () => {
	const geology = mockGeologicalContext();
	const flow = mockMaterialFlow({ includes: [{ tag: 'wood' }, { id: 'gold' }] });
	assertEquals(isAvailable(material('gold'), geology, [flow]), true);
});

// --- MaterialSelector semantics (roadmap 2GN.112) ------------------------------------------------
//
// `gold` and `silver` are `trade-only` in `mockGeologicalContext` and `bronze`/`iron` are locally
// obtainable, so `isAvailable` reads trade for the first pair only. These cases drive the selector
// through `isAvailable` rather than testing `flowSuppliesMaterial` directly, since that predicate is
// module-private and its whole purpose is what reaches the availability verdict.

Deno.test('MaterialSelector: an id selector supplies only that material, not its whole class', () => {
	// The case the retired `materialTag` + `specificMaterials` pair could not express: that shape
	// ORed the two arms, so naming gold beside a `metal` tag reached bronze and iron as well.
	//
	// Silver is modelled `trade-only` explicitly rather than left to `mockGeologicalContext`'s
	// four-material default: unmodelled materials take `isAvailable`'s lenience branch and read
	// obtainable whatever the flows say, which would pass this assertion without consulting the
	// selector at all.
	const geology = mockGeologicalContext({
		materialAvailability: new Map([
			['gold', { materialId: 'gold' as const, regions: new Map([['r', 'trade-only' as const]]) }],
			[
				'silver',
				{ materialId: 'silver' as const, regions: new Map([['r', 'trade-only' as const]]) },
			],
		]),
	});
	const flow = mockMaterialFlow({ includes: [{ id: 'gold' }] });

	assertEquals(isAvailable(material('gold'), geology, [flow]), true);
	assertEquals(isAvailable(material('silver'), geology, [flow]), false);
});

Deno.test('MaterialSelector: excludes subtracts one material from an included class', () => {
	// "All metals except gold" — unexpressible under either reading of the retired pair: the OR had
	// no subtraction at all, and a narrowing reading could only enumerate the complement, freezing it
	// against a catalogue that may later gain a metal.
	//
	// Both metals modelled `trade-only` so each verdict genuinely reads the flow (see the id-selector
	// case above on why an unmodelled material would pass vacuously).
	const geology = mockGeologicalContext({
		materialAvailability: new Map([
			['gold', { materialId: 'gold' as const, regions: new Map([['r', 'trade-only' as const]]) }],
			[
				'silver',
				{ materialId: 'silver' as const, regions: new Map([['r', 'trade-only' as const]]) },
			],
		]),
	});
	const flow = mockMaterialFlow({
		includes: [{ tag: 'metal' }],
		excludes: [{ id: 'gold' }],
	});

	assertEquals(isAvailable(material('gold'), geology, [flow]), false);
	assertEquals(isAvailable(material('silver'), geology, [flow]), true);
});

Deno.test('MaterialSelector: excludes wins over includes when both name the same material', () => {
	const geology = mockGeologicalContext();
	const flow = mockMaterialFlow({
		includes: [{ tag: 'metal' }, { id: 'gold' }],
		excludes: [{ id: 'gold' }],
	});

	assertEquals(isAvailable(material('gold'), geology, [flow]), false);
});

Deno.test('MaterialSelector: an excludes entry naming nothing included is redundant, not an error', () => {
	const geology = mockGeologicalContext();
	const flow = mockMaterialFlow({
		includes: [{ id: 'gold' }],
		excludes: [{ id: 'jade' }], // never selected by `includes` in the first place
	});

	assertEquals(isAvailable(material('gold'), geology, [flow]), true);
});

Deno.test('MaterialSelector: a tag arm and an id arm of the same string select differently', () => {
	// `bone`, `glass` and `leather` each name both a MaterialTag and a MaterialName. This is why the
	// selector arms are tagged rather than a bare string union: `{ tag: 'bone' }` must reach antler
	// and `{ id: 'bone' }` must not.
	const geology = mockGeologicalContext({
		materialAvailability: new Map([
			['bone', { materialId: 'bone' as const, regions: new Map([['r', 'trade-only' as const]]) }],
			[
				'antler',
				{ materialId: 'antler' as const, regions: new Map([['r', 'trade-only' as const]]) },
			],
		]),
	});

	const byClass = mockMaterialFlow({ includes: [{ tag: 'bone' }] });
	const byMaterial = mockMaterialFlow({ includes: [{ id: 'bone' }] });

	assertEquals(isAvailable(material('antler'), geology, [byClass]), true);
	assertEquals(isAvailable(material('antler'), geology, [byMaterial]), false);
	assertEquals(isAvailable(material('bone'), geology, [byMaterial]), true);
});

Deno.test('MaterialSelector: an empty includes supplies nothing rather than everything', () => {
	// A flow carrying no material is not a trade route. Defaulting the empty case to "everything"
	// would let an authoring slip silently open the widest possible flow.
	const geology = mockGeologicalContext();
	const flow = mockMaterialFlow({ includes: [] });

	assertEquals(isAvailable(material('gold'), geology, [flow]), false);
});

Deno.test('isAvailable: a material with no geology entry is obtainable (M2 lenience)', () => {
	const geology = mockGeologicalContext({ materialAvailability: new Map() });
	assertEquals(isAvailable(material('jade'), geology, []), true);
});

// --- computeMaterialWeight -------------------------------------------------------------------------

Deno.test('computeMaterialWeight: higher cultural affinity increases weight', () => {
	const geology = mockGeologicalContext({ materialAvailability: new Map() }); // scarcity-neutral
	const phase = mockPhaseCharacteristics({ technology: { metallurgy: 1 } });
	const indifferent = mockCulturalProfile({ materialAffinities: new Map() });
	const metalLeaning = mockCulturalProfile({ materialAffinities: new Map([['metal', 2]]) });

	const baseline = computeMaterialWeight(material('bronze'), indifferent, phase, geology);
	const boosted = computeMaterialWeight(material('bronze'), metalLeaning, phase, geology);

	assert(boosted > baseline, `expected boosted (${boosted}) > baseline (${baseline})`);
});

Deno.test('materials: every shipped material carries exactly one MaterialTag (roadmap 2GN.78)', () => {
	// This replaced a test pinning `culturalAffinityWeight`'s max-across-tags reduction on gold
	// (`metal` + `precious-metal`). With the precious tags retired there is no multi-tag material
	// left to exercise it, so the reduction is unreachable rather than merely untested — and the
	// honest thing to pin is the invariant that makes it so. If this ever fails, a genuine multi-tag
	// material has been authored and the reduction (max / most-specific-wins / product) needs the
	// ruling it has never had: see `culturalAffinityWeight`'s JSDoc.
	for (const definition of MATERIALS) {
		assertEquals(
			definition.tags.length,
			1,
			`${definition.id} carries ${definition.tags.length} tags (${definition.tags.join(', ')})`,
		);
	}
});

Deno.test('computeMaterialWeight: a favoured material outweighs an unfavoured peer at equal scarcity', () => {
	const geology = mockGeologicalContext({ materialAvailability: new Map() });
	const phase = mockPhaseCharacteristics({ technology: { metallurgy: 1, stoneWorking: 1 } });
	const metalLeaning = mockCulturalProfile({
		materialAffinities: new Map([['metal', 3], ['stone', 1]]),
	});

	const favoured = computeMaterialWeight(material('bronze'), metalLeaning, phase, geology);
	const unfavoured = computeMaterialWeight(material('granite'), metalLeaning, phase, geology);

	assert(
		favoured > unfavoured,
		`expected the favoured metal (${favoured}) > the unfavoured stone (${unfavoured})`,
	);
});

Deno.test('computeMaterialWeight: low phase technology suppresses but does not zero the weight', () => {
	const geology = mockGeologicalContext({ materialAvailability: new Map() });
	const culture = mockCulturalProfile({ materialAffinities: new Map() });

	const noTech = computeMaterialWeight(
		material('bronze'),
		culture,
		mockPhaseCharacteristics({ technology: { metallurgy: 0 } }),
		geology,
	);
	const fullTech = computeMaterialWeight(
		material('bronze'),
		culture,
		mockPhaseCharacteristics({ technology: { metallurgy: 1 } }),
		geology,
	);

	assert(noTech > 0, `expected a technology floor above zero, got ${noTech}`);
	assert(fullTech > noTech, `expected full technology (${fullTech}) > none (${noTech})`);
});

Deno.test('computeMaterialWeight: scarcer materials weight lower than abundant ones', () => {
	const culture = mockCulturalProfile({ materialAffinities: new Map() });
	const phase = mockPhaseCharacteristics({ technology: { metallurgy: 1, stoneWorking: 1 } });
	const geology = mockGeologicalContext(); // bronze abundant, iron scarce

	const abundant = computeMaterialWeight(material('bronze'), culture, phase, geology);
	const scarce = computeMaterialWeight(material('iron'), culture, phase, geology);

	assert(abundant > scarce, `expected abundant (${abundant}) > scarce (${scarce})`);
});

Deno.test('computeMaterialWeight: a material absent from geology ranks at the `available` rung, never above it', () => {
	// Roadmap 2GN.84: corrected from an earlier version of this test that asserted
	// `neutral === abundant` — the defect written down as an expectation. An unmodelled material is
	// one nobody made a claim about, not the most plentiful thing in the region; scoring it above
	// every honestly-modelled peer let a fixture gap silently promote a material (doc 12 §2.25's
	// silver/jade defect, from before the six exhaustive `MOCK_WORLD_REGIONS` existed).
	const culture = mockCulturalProfile({ materialAffinities: new Map() });
	const phase = mockPhaseCharacteristics({ technology: { stoneWorking: 1 } });
	const noEntry = mockGeologicalContext({ materialAvailability: new Map() });
	const availableEntry = mockGeologicalContext({
		materialAvailability: new Map([
			['jade', { materialId: 'jade', regions: new Map([['test-region', 'available' as const]]) }],
		]),
	});
	const abundantEntry = mockGeologicalContext({
		materialAvailability: new Map([
			['jade', { materialId: 'jade', regions: new Map([['test-region', 'abundant' as const]]) }],
		]),
	});
	const scarceEntry = mockGeologicalContext({
		materialAvailability: new Map([
			['jade', { materialId: 'jade', regions: new Map([['test-region', 'scarce' as const]]) }],
		]),
	});

	const unmodelled = computeMaterialWeight(material('jade'), culture, phase, noEntry);
	const available = computeMaterialWeight(material('jade'), culture, phase, availableEntry);
	const abundant = computeMaterialWeight(material('jade'), culture, phase, abundantEntry);
	const scarce = computeMaterialWeight(material('jade'), culture, phase, scarceEntry);

	assertEquals(unmodelled, available, 'unmodelled should read exactly as `available`');
	assert(abundant > unmodelled, `expected abundant (${abundant}) > unmodelled (${unmodelled})`);
	assert(unmodelled > scarce, `expected unmodelled (${unmodelled}) > scarce (${scarce})`);
});

Deno.test('computeMaterialWeight: scarcity rungs form a strict descending order', () => {
	// Only one adjacent pair (abundant/scarce) was previously spot-checked, so a rung reordering
	// that didn't cross that pair would pass silently. This checks the whole ladder.
	const culture = mockCulturalProfile({ materialAffinities: new Map() });
	const phase = mockPhaseCharacteristics({ technology: { stoneWorking: 1 } });
	const geologyAt = (level: 'abundant' | 'available' | 'scarce' | 'trade-only') =>
		mockGeologicalContext({
			materialAvailability: new Map([
				['jade', { materialId: 'jade', regions: new Map([['test-region', level]]) }],
			]),
		});

	const abundant = computeMaterialWeight(material('jade'), culture, phase, geologyAt('abundant'));
	const available = computeMaterialWeight(material('jade'), culture, phase, geologyAt('available'));
	const scarce = computeMaterialWeight(material('jade'), culture, phase, geologyAt('scarce'));
	const tradeOnly = computeMaterialWeight(
		material('jade'),
		culture,
		phase,
		geologyAt('trade-only'),
	);

	assert(abundant > available, `expected abundant (${abundant}) > available (${available})`);
	assert(available > scarce, `expected available (${available}) > scarce (${scarce})`);
	assert(scarce > tradeOnly, `expected scarce (${scarce}) > trade-only (${tradeOnly})`);
});

// --- explainMaterialWeight ---------------------------------------------------------------------------

Deno.test('explainMaterialWeight: factors multiply back to computeMaterialWeight exactly', () => {
	const culture = mockCulturalProfile({ materialAffinities: new Map([['metal', 1.5]]) });
	const phase = mockPhaseCharacteristics({ technology: { metallurgy: 0.7 } });

	// Covers all four mockGeologicalContext cases: bronze abundant, iron scarce, gold trade-only
	// (with a reaching flow), flint absent.
	for (const id of ['bronze', 'iron', 'gold', 'flint']) {
		const geology = mockGeologicalContext();
		const trade = [mockMaterialFlow({ includes: [{ tag: 'metal' }] })];
		const expected = computeMaterialWeight(material(id), culture, phase, geology);
		const explanation = explainMaterialWeight(material(id), culture, phase, geology, trade);

		assertEquals(explanation.weight, expected, `${id}: weight should equal computeMaterialWeight`);
		assertEquals(
			explanation.culturalAffinity * explanation.phaseTechnology * explanation.scarcity,
			explanation.weight,
			`${id}: factors should multiply back to weight exactly`,
		);
	}
});

/**
 * Pins `explainMaterialWeight`'s inlined availability ladder against `isAvailable`, the function the
 * Explorer's obtainability column claims to mirror.
 *
 * `explainMaterialWeight` deliberately inlines `isAvailable`'s rung test rather than calling it, so
 * `bestRegionalLevel` is computed once instead of the two independent calls `isAvailable` and
 * `scarcityWeight` each make. That leaves two copies of the ladder that have to move together. The
 * weight side already has its guard (the multiply-back test above would catch a scarcity drift);
 * this is the missing equivalent for `available`, so a future edit to `isAvailable`'s branch order,
 * a new `AvailabilityLevel`, or a change to `LOCALLY_OBTAINABLE_LEVELS` cannot leave the two
 * silently disagreeing.
 *
 * Swept over the whole catalogue crossed with the six exhaustive regional worlds, which between them
 * exercise every rung including `trade-only` both rescued and unrescued.
 */
Deno.test('explainMaterialWeight: available agrees with isAvailable everywhere', () => {
	const culture = mockCulturalProfile({ materialAffinities: new Map() });
	const phase = mockPhaseCharacteristics({ technology: {} });

	for (const region of MOCK_WORLD_REGIONS) {
		const world = mockRegionalWorld(region);
		for (const definition of MATERIALS) {
			assertEquals(
				explainMaterialWeight(definition, culture, phase, world.geology, world.trade).available,
				isAvailable(definition, world.geology, world.trade),
				`${region}/${definition.id}`,
			);
		}
	}
});

Deno.test('explainMaterialWeight: reports region-agnostic availability and level', () => {
	const culture = mockCulturalProfile({ materialAffinities: new Map() });
	const phase = mockPhaseCharacteristics({ technology: { metallurgy: 1 } });
	const geology = mockGeologicalContext();

	const bronze = explainMaterialWeight(material('bronze'), culture, phase, geology, []);
	assertEquals(bronze.level, 'abundant');
	assertEquals(bronze.available, true);
	assertEquals(bronze.tradeRescued, false);

	const flint = explainMaterialWeight(material('flint'), culture, phase, geology, []);
	assertEquals(flint.level, 'absent');
	assertEquals(flint.available, false);
	assertEquals(flint.tradeRescued, false);
});

Deno.test('explainMaterialWeight: tradeRescued is true only when a flow reaches a trade-only material', () => {
	const culture = mockCulturalProfile({ materialAffinities: new Map() });
	const phase = mockPhaseCharacteristics({ technology: { metallurgy: 1 } });
	const geology = mockGeologicalContext(); // gold is trade-only

	const unreached = explainMaterialWeight(material('gold'), culture, phase, geology, []);
	assertEquals(unreached.level, 'trade-only');
	assertEquals(unreached.available, false);
	assertEquals(unreached.tradeRescued, false);

	const reached = explainMaterialWeight(
		material('gold'),
		culture,
		phase,
		geology,
		[mockMaterialFlow({ includes: [{ tag: 'metal' }] })],
	);
	assertEquals(reached.level, 'trade-only');
	assertEquals(reached.available, true);
	assertEquals(reached.tradeRescued, true);
});

Deno.test('explainMaterialWeight: an unmodelled material reads level undefined but scarcity at the available rung', () => {
	const culture = mockCulturalProfile({ materialAffinities: new Map() });
	const phase = mockPhaseCharacteristics({ technology: { stoneWorking: 1 } });
	const geology = mockGeologicalContext({ materialAvailability: new Map() });

	const explanation = explainMaterialWeight(material('jade'), culture, phase, geology, []);

	assertEquals(explanation.level, undefined);
	assertEquals(explanation.region, undefined);
	assertEquals(explanation.available, true); // isAvailable's MVP lenience
	// scarcity reads the 'available' rung's weight — matching scarcityWeight's own deliberate
	// asymmetry with isAvailable (materials.ts: "this function answers 'how much', isAvailable
	// answers 'at all'") — not the neutral 1 that would out-rank every modelled peer.
	const modelledAvailable = explainMaterialWeight(
		material('bronze'),
		culture,
		mockPhaseCharacteristics({ technology: { metallurgy: 1 } }),
		mockGeologicalContext({
			materialAvailability: new Map([
				['bronze', { materialId: 'bronze', regions: new Map([['test-region', 'available']]) }],
			]),
		}),
		[],
	);
	assertEquals(explanation.scarcity, modelledAvailable.scarcity);
});

// --- assignMaterial ---------------------------------------------------------------------------------

Deno.test('assignMaterial: only returns materials compatible with allowedMaterialTags', () => {
	const geology = mockGeologicalContext({ materialAvailability: new Map() });
	const culture = mockCulturalProfile({ materialAffinities: new Map() });
	const phase = mockPhaseCharacteristics();
	const woodOnly = component(['wood']);
	const prng = createPrng('compat-seed');

	for (let i = 0; i < 50; i++) {
		const chosen = assignMaterial(woodOnly, culture, phase, geology, [], prng, MATERIALS);
		assert(chosen.tags.includes('wood'), `expected a wood material, got '${chosen.id}'`);
	}
});

Deno.test('assignMaterial: empty allowedMaterialTags treats every material as a candidate (2GN.10 stub)', () => {
	const geology = mockGeologicalContext({ materialAvailability: new Map() });
	const culture = mockCulturalProfile({ materialAffinities: new Map() });
	const phase = mockPhaseCharacteristics();
	const unconstrained = component([]);
	const prng = createPrng('unconstrained-seed');

	const chosen = assignMaterial(unconstrained, culture, phase, geology, [], prng, MATERIALS);
	assert(MATERIALS.some((m) => m.id === chosen.id));
});

Deno.test('assignMaterial: availability excluding every compatible material falls back rather than throwing', () => {
	// Every material 'absent' everywhere and no trade — availability alone would empty the set.
	const allAbsent = mockGeologicalContext({
		materialAvailability: new Map(
			MATERIALS.map((
				m,
			) => [m.id, { materialId: m.id, regions: new Map([['r', 'absent' as const]]) }]),
		),
	});
	const culture = mockCulturalProfile({ materialAffinities: new Map() });
	const phase = mockPhaseCharacteristics();
	const woodOnly = component(['wood']);
	const prng = createPrng('fallback-seed');

	const chosen = assignMaterial(woodOnly, culture, phase, allAbsent, [], prng, MATERIALS);
	assert(
		chosen.tags.includes('wood'),
		`expected fallback to the compatible set, got '${chosen.id}'`,
	);
});

Deno.test('assignMaterial: defaults to the shipped MATERIALS catalogue', () => {
	const geology = mockGeologicalContext({ materialAvailability: new Map() });
	const culture = mockCulturalProfile({ materialAffinities: new Map() });
	const phase = mockPhaseCharacteristics();
	const allTags = [...new Set(MATERIALS.flatMap((m) => m.tags))] as MaterialTag[];
	const anyTag = component(allTags);

	const withDefault = assignMaterial(
		anyTag,
		culture,
		phase,
		geology,
		[],
		createPrng('default-seed'),
	);
	const withExplicit = assignMaterial(
		anyTag,
		culture,
		phase,
		geology,
		[],
		createPrng('default-seed'),
		MATERIALS,
	);

	assertEquals(withDefault, withExplicit);
});

Deno.test('assignMaterial: determinism — same seed selects the same material', () => {
	const geology = mockGeologicalContext();
	const culture = mockCulturalProfile();
	const phase = mockPhaseCharacteristics();
	const subject = component(['metal', 'stone', 'wood']);

	const draw = (seed: string) =>
		assignMaterial(subject, culture, phase, geology, [], createPrng(seed), MATERIALS).id;

	assertEquals(draw('determinism-seed'), draw('determinism-seed'));
});

Deno.test('assignMaterial: determinism — different seeds can select different materials', () => {
	const geology = mockGeologicalContext();
	const culture = mockCulturalProfile();
	const phase = mockPhaseCharacteristics();
	const subject = component(['metal', 'stone', 'wood']);
	const draw = (seed: string) =>
		assignMaterial(subject, culture, phase, geology, [], createPrng(seed), MATERIALS).id;

	const draws = new Map<string, string>();
	for (let i = 0; i < 25; i++) draws.set(`seed-${i}`, draw(`seed-${i}`));

	const distinctIds = new Set(draws.values());
	assert(
		distinctIds.size > 1,
		`expected varied selections across seeds, got only ${[...distinctIds]}`,
	);

	// Two seeds that actually produced different ids prove selection tracks the seed rather than
	// being a coincidental match — more robust than asserting against two hardcoded seeds.
	const [firstId] = draws.values();
	const divergentId = [...draws.values()].find((id) => id !== firstId);
	assert(divergentId !== undefined, 'expected at least one seed to diverge from the first');
	assertNotEquals(firstId, divergentId);
});

Deno.test('assignMaterial: purity — repeated calls do not mutate component or materials', () => {
	const geology = mockGeologicalContext();
	const culture = mockCulturalProfile();
	const phase = mockPhaseCharacteristics();
	const subject = component(['metal', 'stone', 'wood']);
	const materialsSnapshot = structuredClone(MATERIALS);
	const componentSnapshot = structuredClone(subject);

	assignMaterial(subject, culture, phase, geology, [], createPrng('purity-seed'), MATERIALS);
	assignMaterial(subject, culture, phase, geology, [], createPrng('purity-seed'), MATERIALS);

	assertEquals(subject, componentSnapshot);
	assertEquals(MATERIALS, materialsSnapshot);
});

/** Tallies how often each material id is drawn over `draws` selections. */
function tallySelections(
	component: NormalisedComponent,
	culture: ReturnType<typeof mockCulturalProfile>,
	phase: ReturnType<typeof mockPhaseCharacteristics>,
	geology: ReturnType<typeof mockGeologicalContext>,
	seed: string,
	draws: number,
): Map<MaterialName, number> {
	const prng = createPrng(seed);
	const tally = new Map<MaterialName, number>();

	for (let i = 0; i < draws; i++) {
		const chosen = assignMaterial(component, culture, phase, geology, [], prng, MATERIALS);
		tally.set(chosen.id, (tally.get(chosen.id) ?? 0) + 1);
	}

	return tally;
}

Deno.test('assignMaterial: distribution — a metal-affine culture selects metal more often than an indifferent one', () => {
	const geology = mockGeologicalContext({ materialAvailability: new Map() }); // scarcity-neutral
	const phase = mockPhaseCharacteristics({ technology: { metallurgy: 1, stoneWorking: 1 } });
	const subject = component(['metal', 'stone']);

	const indifferent = mockCulturalProfile({ materialAffinities: new Map() });
	const metalLeaning = mockCulturalProfile({
		materialAffinities: new Map([['metal', 4], ['stone', 1]]),
	});

	const draws = 1000;
	const metalTagIds = new Set(MATERIALS.filter((m) => m.tags.includes('metal')).map((m) => m.id));
	const metalShare = (tally: Map<MaterialName, number>) =>
		[...tally.entries()].filter(([id]) => metalTagIds.has(id)).reduce((sum, [, n]) => sum + n, 0) /
		draws;

	const baselineShare = metalShare(
		tallySelections(subject, indifferent, phase, geology, 'dist-baseline', draws),
	);
	const boostedShare = metalShare(
		tallySelections(subject, metalLeaning, phase, geology, 'dist-boosted', draws),
	);

	assert(
		boostedShare > baselineShare,
		`expected metal-leaning share (${boostedShare}) > indifferent share (${baselineShare})`,
	);
});

Deno.test('assignMaterial: distribution — low metallurgy technology suppresses metal selection', () => {
	const geology = mockGeologicalContext({ materialAvailability: new Map() });
	const culture = mockCulturalProfile({
		materialAffinities: new Map([['metal', 1], ['stone', 1]]),
	});
	const subject = component(['metal', 'stone']);
	const draws = 1000;
	const metalTagIds = new Set(MATERIALS.filter((m) => m.tags.includes('metal')).map((m) => m.id));
	const metalShare = (tally: Map<MaterialName, number>) =>
		[...tally.entries()].filter(([id]) => metalTagIds.has(id)).reduce((sum, [, n]) => sum + n, 0) /
		draws;

	const lowTech = metalShare(
		tallySelections(
			subject,
			culture,
			mockPhaseCharacteristics({ technology: { metallurgy: 0, stoneWorking: 1 } }),
			geology,
			'dist-low-tech',
			draws,
		),
	);
	const highTech = metalShare(
		tallySelections(
			subject,
			culture,
			mockPhaseCharacteristics({ technology: { metallurgy: 1, stoneWorking: 1 } }),
			geology,
			'dist-high-tech',
			draws,
		),
	);

	assert(
		highTech > lowTech,
		`expected high-tech share (${highTech}) > low-tech share (${lowTech})`,
	);
});

Deno.test('assignMaterial: distribution — a scarce material is drawn less than an abundant compatible peer', () => {
	const culture = mockCulturalProfile({ materialAffinities: new Map() });
	const phase = mockPhaseCharacteristics({ technology: { metallurgy: 1 } });
	const geology = mockGeologicalContext(); // bronze abundant, iron scarce, both metal
	const subject = component(['metal']);
	const draws = 1000;

	const tally = tallySelections(subject, culture, phase, geology, 'dist-scarcity', draws);
	const bronzeShare = (tally.get('bronze') ?? 0) / draws;
	const ironShare = (tally.get('iron') ?? 0) / draws;

	assert(
		bronzeShare > ironShare,
		`expected abundant bronze share (${bronzeShare}) > scarce iron share (${ironShare})`,
	);
});

// --- deriveMaterialProvenance ------------------------------------------------------------------

Deno.test('deriveMaterialProvenance: a locally obtainable material is "local" with its region attributed', () => {
	const geology = mockGeologicalContext(); // bronze abundant in 'test-region'
	const provenance = deriveMaterialProvenance(material('bronze'), geology, []);

	assertEquals(provenance.source, 'local');
	assertEquals(provenance.likelyOriginRegion, 'test-region');
	assertEquals(provenance.tradePathId, undefined);
});

Deno.test('deriveMaterialProvenance: a scarce material is still "local"', () => {
	const geology = mockGeologicalContext(); // iron scarce in 'test-region'
	const provenance = deriveMaterialProvenance(material('iron'), geology, []);

	assertEquals(provenance.source, 'local');
	assertEquals(provenance.likelyOriginRegion, 'test-region');
});

Deno.test('deriveMaterialProvenance: a trade-only material reached via trade is "trade" with a tradePathId', () => {
	const geology = mockGeologicalContext(); // gold trade-only
	const flow = mockMaterialFlow({ includes: [{ tag: 'metal' }] });
	const provenance = deriveMaterialProvenance(material('gold'), geology, [flow]);

	assertEquals(provenance.source, 'trade');
	assertEquals(provenance.likelyOriginRegion, undefined);
	assert(
		provenance.tradePathId !== undefined,
		'expected a tradePathId for a trade-reached material',
	);
});

Deno.test('deriveMaterialProvenance: a trade-only material with no matching flow is "unknown"', () => {
	const geology = mockGeologicalContext(); // gold trade-only
	const provenance = deriveMaterialProvenance(material('gold'), geology, []);

	assertEquals(provenance, { source: 'unknown' });
});

Deno.test('deriveMaterialProvenance: a trade-only material with only an off-tag, off-id flow is "unknown"', () => {
	const geology = mockGeologicalContext(); // gold trade-only
	const flow = mockMaterialFlow({ includes: [{ tag: 'wood' }] });
	const provenance = deriveMaterialProvenance(material('gold'), geology, [flow]);

	assertEquals(provenance, { source: 'unknown' });
});

Deno.test('deriveMaterialProvenance: a material absent everywhere is "unknown"', () => {
	const geology = mockGeologicalContext(); // flint absent
	const provenance = deriveMaterialProvenance(material('flint'), geology, []);

	assertEquals(provenance, { source: 'unknown' });
});

Deno.test('deriveMaterialProvenance: a material with no geology entry at all is "unknown"', () => {
	const geology = mockGeologicalContext({ materialAvailability: new Map() });
	const provenance = deriveMaterialProvenance(material('jade'), geology, []);

	assertEquals(provenance, { source: 'unknown' });
});

Deno.test('deriveMaterialProvenance: tradePathId is reproducible from the same flow position, not random', () => {
	const geology = mockGeologicalContext();
	const flow = mockMaterialFlow({ includes: [{ tag: 'metal' }] });

	const first = deriveMaterialProvenance(material('gold'), geology, [flow]);
	const second = deriveMaterialProvenance(material('gold'), geology, [flow]);

	assertEquals(first, second);
});

Deno.test('deriveMaterialProvenance: two distinct trade-reachable materials sharing a flow get distinct tradePathIds only when flow position differs', () => {
	const geology = mockGeologicalContext();
	const preciousFlow = mockMaterialFlow({ includes: [{ tag: 'metal' }] });
	const woodFlow = mockMaterialFlow({ includes: [{ tag: 'wood' }] });

	// gold reached by the flow at index 0.
	const goldViaFirst = deriveMaterialProvenance(material('gold'), geology, [
		preciousFlow,
		woodFlow,
	]);
	// gold reached by the flow at index 1 instead.
	const goldViaSecond = deriveMaterialProvenance(material('gold'), geology, [
		woodFlow,
		preciousFlow,
	]);

	assertNotEquals(goldViaFirst.tradePathId, goldViaSecond.tradePathId);
});

// --- assignMaterialWithProvenance ---------------------------------------------------------------

Deno.test('assignMaterialWithProvenance: returns a MaterialAssignment consistent with assignMaterial + deriveMaterialProvenance', () => {
	const geology = mockGeologicalContext();
	const culture = mockCulturalProfile();
	const phase = mockPhaseCharacteristics();
	const trade = [mockMaterialFlow({ includes: [{ tag: 'metal' }] })];
	const subject = component(['metal', 'stone', 'wood']);

	const assignment = assignMaterialWithProvenance(
		subject,
		culture,
		phase,
		geology,
		trade,
		createPrng('assignment-seed'),
		MATERIALS,
	);
	const expectedMaterial = assignMaterial(
		subject,
		culture,
		phase,
		geology,
		trade,
		createPrng('assignment-seed'),
		MATERIALS,
	);

	assertEquals(assignment.componentId, subject.id);
	assertEquals(assignment.materialId, expectedMaterial.id);
	assertEquals(
		assignment.provenance,
		deriveMaterialProvenance(expectedMaterial, geology, trade),
	);
});

// --- assignMaterials -------------------------------------------------------------------------

Deno.test('assignMaterials: one MaterialAssignment per component, in artefact.components order', () => {
	const geology = mockGeologicalContext();
	const culture = mockCulturalProfile();
	const phase = mockPhaseCharacteristics();
	const artefact = mockNormalisedArtefact({
		components: [
			componentAt('handle', 0, ['wood']),
			componentAt('blade', 1, ['metal']),
			componentAt('pommel', 2, ['metal', 'stone']),
		],
	});

	const assignments = assignMaterials(
		artefact,
		culture,
		phase,
		geology,
		[],
		createPrng('multi-seed'),
		MATERIALS,
	);

	assertEquals(assignments.length, artefact.components.length);
	assertEquals(assignments.map((a) => a.componentId), ['handle', 'blade', 'pommel']);
});

Deno.test("assignMaterials: each assignment respects its own component's allowedMaterialTags", () => {
	const geology = mockGeologicalContext({ materialAvailability: new Map() });
	const culture = mockCulturalProfile({ materialAffinities: new Map() });
	const phase = mockPhaseCharacteristics();
	const artefact = mockNormalisedArtefact({
		components: [
			componentAt('wood-only', 0, ['wood']),
			componentAt('stone-only', 1, ['stone']),
		],
	});

	const assignments = assignMaterials(
		artefact,
		culture,
		phase,
		geology,
		[],
		createPrng('per-component-seed'),
		MATERIALS,
	);

	const [woodAssignment, stoneAssignment] = assignments;
	assert(material(woodAssignment!.materialId).tags.includes('wood'));
	assert(material(stoneAssignment!.materialId).tags.includes('stone'));
});

Deno.test('assignMaterials: threads a single prng instance across components rather than re-seeding per component', () => {
	const geology = mockGeologicalContext();
	const culture = mockCulturalProfile();
	const phase = mockPhaseCharacteristics();
	const artefact = mockNormalisedArtefact({
		components: [
			componentAt('a', 0, ['metal', 'stone', 'wood']),
			componentAt('b', 1, ['metal', 'stone', 'wood']),
			componentAt('c', 2, ['metal', 'stone', 'wood']),
		],
	});

	// One shared generator, consumed sequentially, should match calling assignMaterialWithProvenance
	// once per component against that same advancing instance.
	const sharedPrng = createPrng('threaded-seed');
	const viaAssignMaterials = assignMaterials(
		artefact,
		culture,
		phase,
		geology,
		[],
		sharedPrng,
		MATERIALS,
	);

	const referencePrng = createPrng('threaded-seed');
	const viaSequentialCalls = artefact.components.map((component) =>
		assignMaterialWithProvenance(component, culture, phase, geology, [], referencePrng, MATERIALS)
	);

	assertEquals(viaAssignMaterials, viaSequentialCalls);
});

Deno.test('assignMaterials: determinism — same seed produces the same assignments', () => {
	const geology = mockGeologicalContext();
	const culture = mockCulturalProfile();
	const phase = mockPhaseCharacteristics();
	const artefact = mockNormalisedArtefact({
		components: [
			componentAt('a', 0, ['metal', 'wood']),
			componentAt('b', 1, ['metal', 'wood']),
		],
	});

	const run = () =>
		assignMaterials(
			artefact,
			culture,
			phase,
			geology,
			[],
			createPrng('determinism-seed'),
			MATERIALS,
		);

	assertEquals(run(), run());
});

Deno.test('assignMaterials: every assignment carries a complete provenance, never stubbed', () => {
	const geology = mockGeologicalContext();
	const culture = mockCulturalProfile();
	const phase = mockPhaseCharacteristics();
	const trade = [mockMaterialFlow({ includes: [{ tag: 'metal' }] })];
	const artefact = mockNormalisedArtefact({
		components: [
			componentAt('a', 0, ['metal', 'stone', 'wood']),
			componentAt('b', 1, ['metal', 'stone', 'wood']),
		],
	});

	const assignments = assignMaterials(
		artefact,
		culture,
		phase,
		geology,
		trade,
		createPrng('provenance-seed'),
		MATERIALS,
	);

	for (const assignment of assignments) {
		assertEquals(
			assignment.provenance,
			deriveMaterialProvenance(material(assignment.materialId), geology, trade),
		);
	}
});

Deno.test('assignMaterials: an artefact with no components returns an empty array', () => {
	const geology = mockGeologicalContext();
	const culture = mockCulturalProfile();
	const phase = mockPhaseCharacteristics();
	const artefact = mockNormalisedArtefact({ components: [] });

	const assignments = assignMaterials(
		artefact,
		culture,
		phase,
		geology,
		[],
		createPrng('empty-seed'),
		MATERIALS,
	);

	assertEquals(assignments, []);
});

Deno.test('assignMaterials: defaults to the shipped MATERIALS catalogue', () => {
	const geology = mockGeologicalContext({ materialAvailability: new Map() });
	const culture = mockCulturalProfile({ materialAffinities: new Map() });
	const phase = mockPhaseCharacteristics();
	const allTags = [...new Set(MATERIALS.flatMap((m) => m.tags))] as MaterialTag[];
	const artefact = mockNormalisedArtefact({
		components: [componentAt('a', 0, allTags), componentAt('b', 1, allTags)],
	});

	const withDefault = assignMaterials(
		artefact,
		culture,
		phase,
		geology,
		[],
		createPrng('default-seed'),
	);
	const withExplicit = assignMaterials(
		artefact,
		culture,
		phase,
		geology,
		[],
		createPrng('default-seed'),
		MATERIALS,
	);

	assertEquals(withDefault, withExplicit);
});
