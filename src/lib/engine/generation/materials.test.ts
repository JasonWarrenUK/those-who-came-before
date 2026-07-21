/// <reference lib="deno.ns" />
import { assert, assertEquals, assertNotEquals } from '@std/assert';
import { assignMaterial, computeMaterialWeight, isAvailable } from './materials.ts';
import { MATERIALS } from '../../data/materials.ts';
import { createPrng } from '../prng.ts';
import { mockNormalisedArtefact } from '../../../../tests/fixtures/artefact.ts';
import {
	mockCulturalProfile,
	mockPhaseCharacteristics,
} from '../../../../tests/fixtures/culture.ts';
import { mockGeologicalContext, mockMaterialFlow } from '../../../../tests/fixtures/world.ts';
import type { NormalisedComponent } from '../../types/artefact.ts';
import type { MaterialTag } from '../../types/tags.ts';

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
		isAvailable(material('gold'), geology, [mockMaterialFlow({ materialTag: 'metal' })]),
		true,
	);
	assertEquals(
		isAvailable(material('gold'), geology, [mockMaterialFlow({ materialTag: 'wood' })]),
		false,
	);
});

Deno.test('isAvailable: trade-only reachable via a specificMaterials id even off-tag', () => {
	const geology = mockGeologicalContext();
	const flow = mockMaterialFlow({ materialTag: 'wood', specificMaterials: ['gold'] });
	assertEquals(isAvailable(material('gold'), geology, [flow]), true);
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

Deno.test('computeMaterialWeight: multi-tag material takes the max applicable affinity', () => {
	const geology = mockGeologicalContext({ materialAvailability: new Map() });
	const phase = mockPhaseCharacteristics({ technology: { metallurgy: 1 } });
	const culture = mockCulturalProfile({
		materialAffinities: new Map([['metal', 1], ['precious-metal', 3]]),
	});

	const weight = computeMaterialWeight(material('gold'), culture, phase, geology); // metal + precious-metal
	const metalOnly = computeMaterialWeight(
		material('bronze'),
		culture,
		phase,
		geology,
	);

	assert(
		weight > metalOnly,
		`expected the precious-metal max (${weight}) > metal-only (${metalOnly})`,
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

Deno.test('computeMaterialWeight: a material absent from geology is scarcity-neutral', () => {
	const culture = mockCulturalProfile({ materialAffinities: new Map() });
	const phase = mockPhaseCharacteristics({ technology: { stoneWorking: 1 } });
	const noEntry = mockGeologicalContext({ materialAvailability: new Map() });
	const abundantEntry = mockGeologicalContext({
		materialAvailability: new Map([
			['jade', { materialId: 'jade', regions: new Map([['test-region', 'abundant' as const]]) }],
		]),
	});

	const neutral = computeMaterialWeight(material('jade'), culture, phase, noEntry);
	const abundant = computeMaterialWeight(material('jade'), culture, phase, abundantEntry);

	assertEquals(neutral, abundant);
});

// --- assignMaterial ---------------------------------------------------------------------------------

Deno.test('assignMaterial: only returns materials compatible with allowedMaterialTags', () => {
	const geology = mockGeologicalContext({ materialAvailability: new Map() });
	const culture = mockCulturalProfile({ materialAffinities: new Map() });
	const phase = mockPhaseCharacteristics();
	const woodOnly = component(['wood']);
	const prng = createPrng('compat-seed');

	for (let i = 0; i < 50; i++) {
		const chosen = assignMaterial(woodOnly, culture, phase, geology, [], MATERIALS, prng);
		assert(chosen.tags.includes('wood'), `expected a wood material, got '${chosen.id}'`);
	}
});

Deno.test('assignMaterial: empty allowedMaterialTags treats every material as a candidate (2GN.10 stub)', () => {
	const geology = mockGeologicalContext({ materialAvailability: new Map() });
	const culture = mockCulturalProfile({ materialAffinities: new Map() });
	const phase = mockPhaseCharacteristics();
	const unconstrained = component([]);
	const prng = createPrng('unconstrained-seed');

	const chosen = assignMaterial(unconstrained, culture, phase, geology, [], MATERIALS, prng);
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

	const chosen = assignMaterial(woodOnly, culture, phase, allAbsent, [], MATERIALS, prng);
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
		undefined,
		createPrng('default-seed'),
	);
	const withExplicit = assignMaterial(
		anyTag,
		culture,
		phase,
		geology,
		[],
		MATERIALS,
		createPrng('default-seed'),
	);

	assertEquals(withDefault, withExplicit);
});

Deno.test('assignMaterial: determinism — same seed selects the same material', () => {
	const geology = mockGeologicalContext();
	const culture = mockCulturalProfile();
	const phase = mockPhaseCharacteristics();
	const subject = component(['metal', 'stone', 'wood']);

	const draw = (seed: string) =>
		assignMaterial(subject, culture, phase, geology, [], MATERIALS, createPrng(seed)).id;

	assertEquals(draw('determinism-seed'), draw('determinism-seed'));
});

Deno.test('assignMaterial: determinism — different seeds can select different materials', () => {
	const geology = mockGeologicalContext();
	const culture = mockCulturalProfile();
	const phase = mockPhaseCharacteristics();
	const subject = component(['metal', 'stone', 'wood']);
	const draw = (seed: string) =>
		assignMaterial(subject, culture, phase, geology, [], MATERIALS, createPrng(seed)).id;

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

	assignMaterial(subject, culture, phase, geology, [], MATERIALS, createPrng('purity-seed'));
	assignMaterial(subject, culture, phase, geology, [], MATERIALS, createPrng('purity-seed'));

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
): Map<string, number> {
	const prng = createPrng(seed);
	const tally = new Map<string, number>();

	for (let i = 0; i < draws; i++) {
		const chosen = assignMaterial(component, culture, phase, geology, [], MATERIALS, prng);
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
	const metalShare = (tally: Map<string, number>) =>
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
	const metalShare = (tally: Map<string, number>) =>
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
