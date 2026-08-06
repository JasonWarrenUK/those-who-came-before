/// <reference lib="deno.ns" />
import { assert, assertEquals, assertNotEquals } from '@std/assert';
import {
	assignDecorativeDetails,
	computeLayerGrade,
	computeTechniqueWeight,
	expandDecoration,
	type SharedMotifSource,
} from './decoration.ts';
import { DECORATIVE_TECHNIQUES } from '../../data/decorations.ts';
import { MATERIALS } from '../../data/materials.ts';
import { createPrng } from '../prng.ts';
import { mockNormalisedArtefact } from '../../../../tests/fixtures/artefact.ts';
import {
	mockCulturalProfile,
	mockPhaseCharacteristics,
} from '../../../../tests/fixtures/culture.ts';
import { mockGeologicalContext, mockMaterialFlow } from '../../../../tests/fixtures/world.ts';
import type { DecorativeLayer, DecorativeTechnique } from '../../types/decoration.ts';
import type { NormalisedComponent } from '../../types/artefact.ts';
import type { GeologicalContext } from '../../types/world.ts';
import type { MaterialTag } from '../../types/tags.ts';

/** Looks up a shipped technique definition by name; throws if the catalogue ever drops it. */
function technique(name: DecorativeTechnique) {
	const found = DECORATIVE_TECHNIQUES.find((t) => t.technique === name);
	if (!found) throw new Error(`test fixture expects a shipped technique '${name}'`);
	return found;
}

/** Builds a bare component, distinguishable by id for multi-component artefacts. */
function component(id: string): NormalisedComponent {
	const [base] = mockNormalisedArtefact().components;
	return { ...base!, id };
}

/** A three-component artefact — the shipped fixture has only one. */
function multiComponentArtefact() {
	return mockNormalisedArtefact({
		components: [component('c0'), component('c1'), component('c2')],
	});
}

/** A culture whose techniqueAffinities is empty (neutral for every technique). */
function neutralCulture(overrides: Parameters<typeof mockCulturalProfile>[0] = {}) {
	return mockCulturalProfile({ techniqueAffinities: new Map(), ...overrides });
}

// --- computeTechniqueWeight -----------------------------------------------------------------------

Deno.test('computeTechniqueWeight: high technology.textiles raises a textile technique above low textiles', () => {
	const culture = neutralCulture();
	const geology = mockGeologicalContext();

	const low = computeTechniqueWeight(
		technique('wrapping'),
		culture,
		mockPhaseCharacteristics({ technology: { textiles: 0 } }),
		geology,
		[],
	);
	const high = computeTechniqueWeight(
		technique('wrapping'),
		culture,
		mockPhaseCharacteristics({ technology: { textiles: 1 } }),
		geology,
		[],
	);

	assert(high > low, `expected high textiles (${high}) > low textiles (${low})`);
});

Deno.test("computeTechniqueWeight: high technology.ceramics raises glaze's weight above low ceramics", () => {
	const culture = neutralCulture();
	const geology = mockGeologicalContext();

	const low = computeTechniqueWeight(
		technique('glaze'),
		culture,
		mockPhaseCharacteristics({ technology: { ceramics: 0 } }),
		geology,
		[],
	);
	const high = computeTechniqueWeight(
		technique('glaze'),
		culture,
		mockPhaseCharacteristics({ technology: { ceramics: 1 } }),
		geology,
		[],
	);

	assert(high > low, `expected high ceramics (${high}) > low ceramics (${low})`);
});

Deno.test('computeTechniqueWeight: low gating technology suppresses but does not zero the weight', () => {
	const culture = neutralCulture();
	const geology = mockGeologicalContext();

	const weight = computeTechniqueWeight(
		technique('engraving'),
		culture,
		mockPhaseCharacteristics({ technology: { metallurgy: 0 } }),
		geology,
		[],
	);

	assert(weight > 0, `expected a technology floor above zero, got ${weight}`);
});

Deno.test('computeTechniqueWeight: a technology-neutral technique (polish) is unaffected by technology', () => {
	const culture = neutralCulture();
	const geology = mockGeologicalContext();

	const low = computeTechniqueWeight(
		technique('polish'),
		culture,
		mockPhaseCharacteristics({ technology: { metallurgy: 0, ceramics: 0, textiles: 0 } }),
		geology,
		[],
	);
	const high = computeTechniqueWeight(
		technique('polish'),
		culture,
		mockPhaseCharacteristics({ technology: { metallurgy: 1, ceramics: 1, textiles: 1 } }),
		geology,
		[],
	);

	assertEquals(low, high);
});

Deno.test("computeTechniqueWeight: culture's techniqueAffinities biases selection independent of motifs/material", () => {
	// Same geology/phase/materialAffinities throughout — only techniqueAffinities differs, isolating
	// the cultural technique-preference signal the four-quadrant requirement needs.
	const geology = mockGeologicalContext();
	const phase = mockPhaseCharacteristics();

	const indifferent = neutralCulture();
	const engravingLeaning = neutralCulture({
		techniqueAffinities: new Map([['engraving', 4]]),
	});

	const baseline = computeTechniqueWeight(technique('engraving'), indifferent, phase, geology, []);
	const boosted = computeTechniqueWeight(
		technique('engraving'),
		engravingLeaning,
		phase,
		geology,
		[],
	);

	assert(boosted > baseline, `expected boosted (${boosted}) > baseline (${baseline})`);
});

Deno.test('computeTechniqueWeight: material gate — a culture with no plausible engravable material is suppressed even with high engraving affinity', () => {
	// No material affinity above neutral (1), so bestMaterialAffinity(...) > 1 never holds — the
	// culture "never uses" any material at better than indifferent, regardless of geology.
	const noMaterialLeaning = mockCulturalProfile({
		materialAffinities: new Map(),
		techniqueAffinities: new Map([['engraving', 10]]),
	});
	const geology = mockGeologicalContext();
	const phase = mockPhaseCharacteristics();

	const gated = computeTechniqueWeight(
		technique('engraving'),
		noMaterialLeaning,
		phase,
		geology,
		[],
	);

	// A culture that DOES favour an engravable material, same high affinity, for comparison.
	const withMaterialLeaning = mockCulturalProfile({
		materialAffinities: new Map([['metal', 2]]),
		techniqueAffinities: new Map([['engraving', 10]]),
	});
	const ungated = computeTechniqueWeight(
		technique('engraving'),
		withMaterialLeaning,
		phase,
		geology,
		[],
	);

	assert(
		gated < ungated,
		`expected the material-absent gate (${gated}) to suppress below the material-present case (${ungated})`,
	);
});

Deno.test('computeTechniqueWeight: material gate is one-directional — favouring engravable material does not force engraving affinity', () => {
	// Favours metal (engravable, e.g. bronze) but has zero techniqueAffinities — material use alone
	// must not manufacture a technique preference the culture never declared.
	const culture = mockCulturalProfile({
		materialAffinities: new Map([['metal', 3]]),
		techniqueAffinities: new Map(),
	});
	const geology = mockGeologicalContext();
	const phase = mockPhaseCharacteristics();

	const engravingWeight = computeTechniqueWeight(
		technique('engraving'),
		culture,
		phase,
		geology,
		[],
	);
	const polishWeight = computeTechniqueWeight(technique('polish'), culture, phase, geology, []);

	// Both technology-gated identically at neutral phase (metallurgy 0.5 for engraving, no gate for
	// polish) — the point is that engraving's weight sits at the ungated baseline, not boosted purely
	// because the culture happens to work an engravable material.
	assert(
		engravingWeight <= polishWeight * 1.01,
		`expected material use alone not to inflate engraving (${engravingWeight}) over an ungated technique (${polishWeight})`,
	);
});

Deno.test('computeTechniqueWeight: form-substrate and none-substrate techniques are never material-gated', () => {
	// No material affinity above neutral at all — would gate every 'material' substrate technique,
	// but 'form' (wire-wrapping) and 'none' (polish) substrates must be unaffected.
	const culture = mockCulturalProfile({ materialAffinities: new Map() });
	const geology = mockGeologicalContext({ materialAvailability: new Map() });
	const phase = mockPhaseCharacteristics();

	const wireWrapping = computeTechniqueWeight(
		technique('wire-wrapping'),
		culture,
		phase,
		geology,
		[],
	);
	const polish = computeTechniqueWeight(technique('polish'), culture, phase, geology, []);

	assert(wireWrapping > 0.01, `expected wire-wrapping ungated, got ${wireWrapping}`);
	assert(polish > 0.01, `expected polish ungated, got ${polish}`);
});

// --- expandDecoration ------------------------------------------------------------------------------

Deno.test('expandDecoration: determinism — same seed produces identical layers', () => {
	const artefact = multiComponentArtefact();
	const culture = mockCulturalProfile();
	const phase = mockPhaseCharacteristics({
		society: { craftSpecialisation: 0.9 },
		aesthetics: { decorativeEmphasis: 0.9 },
	});
	const geology = mockGeologicalContext();

	const run = () =>
		expandDecoration(
			artefact,
			culture,
			phase,
			geology,
			[],
			createPrng('determinism-seed'),
			MATERIALS,
			DECORATIVE_TECHNIQUES,
		);

	assertEquals(run(), run());
});

Deno.test('expandDecoration: determinism — different seeds can produce different layer sets', () => {
	const artefact = multiComponentArtefact();
	const culture = mockCulturalProfile();
	const phase = mockPhaseCharacteristics({
		society: { craftSpecialisation: 0.9 },
		aesthetics: { decorativeEmphasis: 0.9 },
	});
	const geology = mockGeologicalContext();

	const draw = (seed: string) =>
		expandDecoration(
			artefact,
			culture,
			phase,
			geology,
			[],
			createPrng(seed),
			MATERIALS,
			DECORATIVE_TECHNIQUES,
		);

	const results = new Map<string, DecorativeLayer[]>();
	for (let i = 0; i < 25; i++) results.set(`seed-${i}`, draw(`seed-${i}`));

	const serialised = [...results.values()].map((layers) => JSON.stringify(layers));
	const distinct = new Set(serialised);

	assert(distinct.size > 1, 'expected varied layer sets across seeds');
});

Deno.test('expandDecoration: purity — repeated calls do not mutate any input', () => {
	const artefact = multiComponentArtefact();
	const culture = mockCulturalProfile();
	const phase = mockPhaseCharacteristics({
		society: { craftSpecialisation: 0.9 },
		aesthetics: { decorativeEmphasis: 0.9 },
	});
	const geology = mockGeologicalContext();
	const trade = [mockMaterialFlow()];

	const artefactSnapshot = structuredClone(artefact);
	const cultureSnapshot = structuredClone(culture);
	const phaseSnapshot = structuredClone(phase);
	const geologySnapshot = structuredClone(geology);
	const tradeSnapshot = structuredClone(trade);
	const materialsSnapshot = structuredClone(MATERIALS);
	// DECORATIVE_TECHNIQUES entries carry a `substrate.test` function (unclonable by
	// structuredClone), so purity is verified by reference identity of each entry instead — since
	// expandDecoration only ever reads the catalogue, an untouched entry stays the exact same object.
	const techniquesSnapshot = [...DECORATIVE_TECHNIQUES];

	expandDecoration(
		artefact,
		culture,
		phase,
		geology,
		trade,
		createPrng('purity-seed'),
		MATERIALS,
		DECORATIVE_TECHNIQUES,
	);
	expandDecoration(
		artefact,
		culture,
		phase,
		geology,
		trade,
		createPrng('purity-seed'),
		MATERIALS,
		DECORATIVE_TECHNIQUES,
	);

	assertEquals(artefact, artefactSnapshot);
	assertEquals(culture, cultureSnapshot);
	assertEquals(phase, phaseSnapshot);
	assertEquals(geology, geologySnapshot);
	assertEquals(trade, tradeSnapshot);
	assertEquals(MATERIALS, materialsSnapshot);
	assertEquals([...DECORATIVE_TECHNIQUES], techniquesSnapshot);
	for (const [index, entry] of DECORATIVE_TECHNIQUES.entries()) {
		assert(entry === techniquesSnapshot[index], `technique entry at index ${index} was replaced`);
	}
});

Deno.test('expandDecoration: every layer targets a real component id', () => {
	const artefact = multiComponentArtefact();
	const componentIds = new Set(artefact.components.map((c) => c.id));
	const culture = mockCulturalProfile();
	const phase = mockPhaseCharacteristics({
		society: { craftSpecialisation: 1 },
		aesthetics: { decorativeEmphasis: 1 },
	});
	const geology = mockGeologicalContext();

	const layers = expandDecoration(
		artefact,
		culture,
		phase,
		geology,
		[],
		createPrng('targets-seed'),
		MATERIALS,
		DECORATIVE_TECHNIQUES,
	);

	assert(layers.length > 0, 'expected at least one layer at maximum intensity');
	for (const layer of layers) {
		assert(
			componentIds.has(layer.targetComponentId),
			`layer targets unknown component '${layer.targetComponentId}'`,
		);
	}
});

Deno.test('expandDecoration: emitted layers are flat with motif/material omitted (2GN.31/33 boundary)', () => {
	const artefact = multiComponentArtefact();
	const culture = mockCulturalProfile();
	const phase = mockPhaseCharacteristics({
		society: { craftSpecialisation: 1 },
		aesthetics: { decorativeEmphasis: 1 },
	});
	const geology = mockGeologicalContext();

	const layers = expandDecoration(
		artefact,
		culture,
		phase,
		geology,
		[],
		createPrng('flat-seed'),
		MATERIALS,
		DECORATIVE_TECHNIQUES,
	);

	assert(layers.length > 0, 'expected at least one layer at maximum intensity');
	for (const layer of layers) {
		assertEquals(layer.sublayers, []);
		assertEquals(layer.motifRef, undefined);
		assertEquals(layer.material, undefined);
	}
});

Deno.test('expandDecoration: a high-intensity phase produces layers from all three BNF categories', () => {
	const culture = mockCulturalProfile();
	const phase = mockPhaseCharacteristics({
		society: { craftSpecialisation: 1 },
		aesthetics: { decorativeEmphasis: 1 },
		technology: { metallurgy: 1, ceramics: 1, textiles: 1 },
	});
	const geology = mockGeologicalContext();

	const categoryOf = (t: DecorativeTechnique) => technique(t).category;
	const seenCategories = new Set<string>();

	for (let i = 0; i < 30; i++) {
		const layers = expandDecoration(
			multiComponentArtefact(),
			culture,
			phase,
			geology,
			[],
			createPrng(`category-seed-${i}`),
			MATERIALS,
			DECORATIVE_TECHNIQUES,
		);
		for (const layer of layers) seenCategories.add(categoryOf(layer.technique));
	}

	assertEquals(
		seenCategories,
		new Set(['surface-treatment', 'applied-element', 'textile-element']),
	);
});

Deno.test('expandDecoration: distribution — high decorativeEmphasis/craftSpecialisation yields more layers than low', () => {
	const culture = mockCulturalProfile();
	const geology = mockGeologicalContext();

	const totalLayers = (phase: ReturnType<typeof mockPhaseCharacteristics>) => {
		let total = 0;
		for (let i = 0; i < 30; i++) {
			total += expandDecoration(
				multiComponentArtefact(),
				culture,
				phase,
				geology,
				[],
				createPrng(`intensity-seed-${i}`),
				MATERIALS,
				DECORATIVE_TECHNIQUES,
			).length;
		}
		return total;
	};

	const low = totalLayers(
		mockPhaseCharacteristics({
			society: { craftSpecialisation: 0.05 },
			aesthetics: { decorativeEmphasis: 0.05 },
		}),
	);
	const high = totalLayers(
		mockPhaseCharacteristics({
			society: { craftSpecialisation: 0.95 },
			aesthetics: { decorativeEmphasis: 0.95 },
		}),
	);

	assert(high > low, `expected high-intensity total (${high}) > low-intensity total (${low})`);
});

Deno.test('computeLayerGrade: low craft yields a materially lower grade on a hard technique than the same craft on an easy one', () => {
	// `inlay` is the highest-difficulty technique (0.80); `roughening` the lowest (0.10) — the
	// widest gap `TECHNIQUE_DIFFICULTY` offers, so this isolates the per-technique term's effect at
	// a single fixed craft level rather than conflating it with craft varying too.
	const lowCraft = 0.2;
	const easy = computeLayerGrade(lowCraft, 'roughening');
	const hard = computeLayerGrade(lowCraft, 'inlay');

	assert(
		hard < easy,
		`expected low craft (${lowCraft}) to realise a lower grade on inlay (${hard}) than on roughening (${easy})`,
	);
});

Deno.test('computeLayerGrade: high craft narrows the gap between an easy and a hard technique', () => {
	// The formula's own claim (module JSDoc): a hard technique's realised grade degrades FASTER
	// than an easy one's as craft falls, so the gap should be wider at low craft than at high craft.
	const lowGap = computeLayerGrade(0.2, 'roughening') - computeLayerGrade(0.2, 'inlay');
	const highGap = computeLayerGrade(0.9, 'roughening') - computeLayerGrade(0.9, 'inlay');

	assert(
		highGap < lowGap,
		`expected the easy/hard gap to narrow at high craft (${highGap}) versus low craft (${lowGap})`,
	);
});

Deno.test('computeLayerGrade: stays within [0, 1] at the craft extremes for every technique', () => {
	for (const technique of DECORATIVE_TECHNIQUES.map((t) => t.technique)) {
		for (const craft of [0, 0.5, 1]) {
			const grade = computeLayerGrade(craft, technique);
			assert(
				grade >= 0 && grade <= 1,
				`expected computeLayerGrade(${craft}, '${technique}') in [0, 1], got ${grade}`,
			);
		}
	}
});

Deno.test('expandDecoration: mean layer grade rises with craft at fixed emphasis and component count', () => {
	// Isolates the refinement axis from the volume axis: `multiComponentArtefact()` fixes component
	// count, and emphasis is held constant, so only `society.craftSpecialisation` varies between the
	// two measurements — the same isolation the intensity-distribution test above applies to volume.
	const culture = mockCulturalProfile();
	const geology = mockGeologicalContext();

	const meanGrade = (craftSpecialisation: number) => {
		let sum = 0;
		let count = 0;
		for (let i = 0; i < 30; i++) {
			const layers = expandDecoration(
				multiComponentArtefact(),
				culture,
				mockPhaseCharacteristics({
					society: { craftSpecialisation },
					aesthetics: { decorativeEmphasis: 0.9 },
				}),
				geology,
				[],
				createPrng(`grade-seed-${i}`),
				MATERIALS,
				DECORATIVE_TECHNIQUES,
			);
			for (const layer of layers) {
				sum += layer.grade;
				count++;
			}
		}
		return count > 0 ? sum / count : 0;
	};

	const low = meanGrade(0.1);
	const high = meanGrade(0.9);

	assert(high > low, `expected high-craft mean grade (${high}) > low-craft mean grade (${low})`);
});

Deno.test('expandDecoration: distribution — technology.textiles is isolated to the textile-element category', () => {
	// Per-category slot filling is independent of other categories (the module JSDoc's
	// component-then-category-then-slot contract): each category's *count* is driven by
	// craftSpecialisation/decorativeEmphasis alone, never by another category's gating technology.
	// technology.textiles biases which technique wins *within* textile-element (already covered at
	// the computeTechniqueWeight level); here we confirm it does not also shift surface-treatment's
	// or applied-element's share of total layers, since it gates none of their techniques.
	const culture = mockCulturalProfile();
	const geology = mockGeologicalContext();
	const highIntensity = {
		society: { craftSpecialisation: 1 },
		aesthetics: { decorativeEmphasis: 1 },
	};

	const nonTextileShare = (phase: ReturnType<typeof mockPhaseCharacteristics>) => {
		let nonTextile = 0;
		let total = 0;
		for (let i = 0; i < 40; i++) {
			const layers = expandDecoration(
				multiComponentArtefact(),
				culture,
				phase,
				geology,
				[],
				createPrng(`textile-isolation-seed-${i}`),
				MATERIALS,
				DECORATIVE_TECHNIQUES,
			);
			total += layers.length;
			nonTextile += layers.filter((l) =>
				technique(l.technique).category !== 'textile-element'
			).length;
		}
		return total === 0 ? 0 : nonTextile / total;
	};

	const low = nonTextileShare(
		mockPhaseCharacteristics({ ...highIntensity, technology: { textiles: 0 } }),
	);
	const high = nonTextileShare(
		mockPhaseCharacteristics({ ...highIntensity, technology: { textiles: 1 } }),
	);

	// Same seeds drive both runs, so an unaffected share should match exactly, not merely be close.
	assertEquals(low, high);
});

Deno.test('expandDecoration: an injected catalogue truncated to one category only emits that category', () => {
	const artefact = multiComponentArtefact();
	const culture = mockCulturalProfile();
	const phase = mockPhaseCharacteristics({
		society: { craftSpecialisation: 1 },
		aesthetics: { decorativeEmphasis: 1 },
	});
	const geology = mockGeologicalContext();
	const surfaceOnly = DECORATIVE_TECHNIQUES.filter((t) => t.category === 'surface-treatment');

	const layers = expandDecoration(
		artefact,
		culture,
		phase,
		geology,
		[],
		createPrng('truncated-seed'),
		MATERIALS,
		surfaceOnly,
	);

	assert(layers.length > 0, 'expected at least one layer at maximum intensity');
	for (const layer of layers) {
		assertEquals(technique(layer.technique).category, 'surface-treatment');
	}
});

Deno.test('expandDecoration: an artefact with no components returns no layers without throwing', () => {
	const artefact = mockNormalisedArtefact({ components: [] });
	const culture = mockCulturalProfile();
	const phase = mockPhaseCharacteristics({
		society: { craftSpecialisation: 1 },
		aesthetics: { decorativeEmphasis: 1 },
	});
	const geology = mockGeologicalContext();

	const layers = expandDecoration(
		artefact,
		culture,
		phase,
		geology,
		[],
		createPrng('empty-seed'),
		MATERIALS,
		DECORATIVE_TECHNIQUES,
	);

	assertEquals(layers, []);
});

Deno.test('expandDecoration: defaults to the shipped MATERIALS and DECORATIVE_TECHNIQUES catalogues', () => {
	const artefact = multiComponentArtefact();
	const culture = mockCulturalProfile();
	const phase = mockPhaseCharacteristics({
		society: { craftSpecialisation: 0.9 },
		aesthetics: { decorativeEmphasis: 0.9 },
	});
	const geology = mockGeologicalContext();

	const withDefaults = expandDecoration(
		artefact,
		culture,
		phase,
		geology,
		[],
		createPrng('default-seed'),
	);
	const withExplicit = expandDecoration(
		artefact,
		culture,
		phase,
		geology,
		[],
		createPrng('default-seed'),
		MATERIALS,
		DECORATIVE_TECHNIQUES,
	);

	assertEquals(withDefaults, withExplicit);
});

Deno.test('expandDecoration: two diverging seeds actually produce different serialised output', () => {
	const artefact = multiComponentArtefact();
	const culture = mockCulturalProfile();
	const phase = mockPhaseCharacteristics({
		society: { craftSpecialisation: 0.9 },
		aesthetics: { decorativeEmphasis: 0.9 },
	});
	const geology = mockGeologicalContext();

	const draw = (seed: string) =>
		JSON.stringify(
			expandDecoration(
				artefact,
				culture,
				phase,
				geology,
				[],
				createPrng(seed),
				MATERIALS,
				DECORATIVE_TECHNIQUES,
			),
		);

	const a = draw('diverge-a');
	const results = [];
	for (let i = 0; i < 25; i++) results.push(draw(`diverge-${i}`));
	const divergent = results.find((r) => r !== a);

	assert(divergent !== undefined, 'expected at least one seed to diverge');
	assertNotEquals(a, divergent);
});

// --- assignDecorativeDetails ----------------------------------------------------------------------

/** Builds a bare flat layer of the given technique, as `expandDecoration` emits them. */
function detailLayer(
	name: DecorativeTechnique,
	sublayers: DecorativeLayer[] = [],
): DecorativeLayer {
	return { targetComponentId: 'c0', technique: name, grade: 0.5, sublayers };
}

/** A single-motif exchange source whose motif id is distinguishable from the fixture's native one. */
function borrowedSource(intensity: number, id = 'borrowed-motif'): SharedMotifSource {
	return {
		motifs: [{ id, label: 'Borrowed Motif', culturalOrigin: 'partner-culture' }],
		intensity,
	};
}

/**
 * The authored per-technique introduced-material tag sets (interviewed 2026-07-25, roadmap
 * 2GN.33), pinned here so a silent edit to `INTRODUCED_MATERIAL_TAGS` fails a test.
 */
const EXPECTED_INTRODUCED_TAGS: Partial<Record<DecorativeTechnique, MaterialTag[]>> = {
	'inlay': ['metal', 'precious-metal', 'stone', 'precious-stone', 'glass', 'bone', 'wood'],
	'overlay': ['metal', 'precious-metal', 'leather'],
	'studs': ['metal', 'precious-metal', 'bone'],
	'wire-wrapping': ['metal', 'precious-metal'],
	'gilding': ['precious-metal'],
	'wrapping': ['fiber', 'leather'],
	'beading': ['glass', 'stone', 'precious-stone', 'bone', 'metal', 'precious-metal'],
};

/** Every technique the shipped catalogue flags as motif-carrying, one layer each. */
function allTechniqueLayers(): DecorativeLayer[] {
	return DECORATIVE_TECHNIQUES.map((t) => detailLayer(t.technique));
}

Deno.test('assignDecorativeDetails: determinism — same seed produces identical resolved layers', () => {
	const layers = allTechniqueLayers();
	const culture = mockCulturalProfile();
	const phase = mockPhaseCharacteristics();
	const geology = mockGeologicalContext();

	const run = () =>
		assignDecorativeDetails(
			layers,
			culture,
			phase,
			geology,
			[],
			[borrowedSource(0.5)],
			createPrng('detail-determinism-seed'),
			MATERIALS,
			DECORATIVE_TECHNIQUES,
		);

	assertEquals(run(), run());
});

Deno.test('assignDecorativeDetails: determinism — different seeds can produce different resolutions', () => {
	const layers = allTechniqueLayers();
	const culture = mockCulturalProfile();
	const phase = mockPhaseCharacteristics();
	const geology = mockGeologicalContext();

	const draw = (seed: string) =>
		JSON.stringify(
			assignDecorativeDetails(
				layers,
				culture,
				phase,
				geology,
				[],
				[borrowedSource(1)],
				createPrng(seed),
				MATERIALS,
				DECORATIVE_TECHNIQUES,
			),
		);

	const serialised = new Set<string>();
	for (let i = 0; i < 25; i++) serialised.add(draw(`detail-seed-${i}`));

	assert(serialised.size > 1, 'expected varied resolutions across seeds');
});

Deno.test('assignDecorativeDetails: purity — inputs unmutated, output layers are new objects', () => {
	const layers = allTechniqueLayers();
	const culture = mockCulturalProfile();
	const phase = mockPhaseCharacteristics();
	const geology = mockGeologicalContext();
	const trade = [mockMaterialFlow()];
	const sources = [borrowedSource(0.5)];

	const layersSnapshot = structuredClone(layers);
	const cultureSnapshot = structuredClone(culture);
	const phaseSnapshot = structuredClone(phase);
	const geologySnapshot = structuredClone(geology);
	const tradeSnapshot = structuredClone(trade);
	const sourcesSnapshot = structuredClone(sources);
	const materialsSnapshot = structuredClone(MATERIALS);
	// Same reference-identity check as expandDecoration's purity test: `substrate.test` closures
	// make the technique catalogue unclonable.
	const techniquesSnapshot = [...DECORATIVE_TECHNIQUES];

	const resolved = assignDecorativeDetails(
		layers,
		culture,
		phase,
		geology,
		trade,
		sources,
		createPrng('detail-purity-seed'),
		MATERIALS,
		DECORATIVE_TECHNIQUES,
	);

	assertEquals(layers, layersSnapshot);
	assertEquals(culture, cultureSnapshot);
	assertEquals(phase, phaseSnapshot);
	assertEquals(geology, geologySnapshot);
	assertEquals(trade, tradeSnapshot);
	assertEquals(sources, sourcesSnapshot);
	assertEquals(MATERIALS, materialsSnapshot);
	for (const [index, entry] of DECORATIVE_TECHNIQUES.entries()) {
		assert(entry === techniquesSnapshot[index], `technique entry at index ${index} was replaced`);
	}
	for (const [index, layer] of resolved.entries()) {
		assert(layer !== layers[index], `resolved layer ${index} is the same object as its input`);
	}
});

Deno.test('assignDecorativeDetails: field boundary — motifRef only on motif-carrying, material only on material-introducing techniques', () => {
	const resolved = assignDecorativeDetails(
		allTechniqueLayers(),
		mockCulturalProfile(),
		mockPhaseCharacteristics(),
		mockGeologicalContext(),
		[],
		[],
		createPrng('boundary-seed'),
		MATERIALS,
		DECORATIVE_TECHNIQUES,
	);

	for (const layer of resolved) {
		const definition = DECORATIVE_TECHNIQUES.find((t) => t.technique === layer.technique)!;
		assertEquals(
			'motifRef' in layer,
			definition.carriesMotif,
			`'${layer.technique}' motifRef presence should match carriesMotif=${definition.carriesMotif}`,
		);
		assertEquals(
			'material' in layer,
			definition.introducesMaterial,
			`'${layer.technique}' material presence should match introducesMaterial=${definition.introducesMaterial}`,
		);
	}
});

Deno.test('assignDecorativeDetails: with no shared sources, every motif comes from the native vocabulary', () => {
	const nativeIds = new Set(mockCulturalProfile().motifVocabulary.motifs.map((m) => m.id));

	for (let i = 0; i < 25; i++) {
		const resolved = assignDecorativeDetails(
			[detailLayer('engraving'), detailLayer('painting')],
			mockCulturalProfile(),
			mockPhaseCharacteristics(),
			mockGeologicalContext(),
			[],
			[],
			createPrng(`native-seed-${i}`),
			MATERIALS,
			DECORATIVE_TECHNIQUES,
		);

		for (const layer of resolved) {
			assert(
				layer.motifRef !== undefined && nativeIds.has(layer.motifRef),
				`expected a native motif, got '${layer.motifRef}'`,
			);
		}
	}
});

Deno.test('assignDecorativeDetails: full-intensity exchange makes borrowed motifs appear alongside native ones', () => {
	const seen = new Set<string>();

	for (let i = 0; i < 50; i++) {
		const [resolved] = assignDecorativeDetails(
			[detailLayer('engraving')],
			mockCulturalProfile(),
			mockPhaseCharacteristics(),
			mockGeologicalContext(),
			[],
			[borrowedSource(1)],
			createPrng(`borrowed-seed-${i}`),
			MATERIALS,
			DECORATIVE_TECHNIQUES,
		);
		seen.add(resolved!.motifRef!);
	}

	assert(seen.has('borrowed-motif'), 'expected the borrowed motif to be selected at least once');
	assert(seen.has('test-motif'), 'expected the native motif to be selected at least once');
});

Deno.test('assignDecorativeDetails: a zero-intensity source never contributes while native motifs exist', () => {
	for (let i = 0; i < 100; i++) {
		const [resolved] = assignDecorativeDetails(
			[detailLayer('engraving')],
			mockCulturalProfile(),
			mockPhaseCharacteristics(),
			mockGeologicalContext(),
			[],
			[borrowedSource(0)],
			createPrng(`zero-intensity-seed-${i}`),
			MATERIALS,
			DECORATIVE_TECHNIQUES,
		);

		assertEquals(resolved!.motifRef, 'test-motif');
	}
});

Deno.test('assignDecorativeDetails: a zero-intensity source never contributes even with no native motifs', () => {
	// A weight-0 candidate must not survive into `weightedSelect`'s zero-total-weight uniform
	// fallback: with the native vocabulary empty too, the pool is genuinely empty and motifRef is
	// omitted, per the honest-degradation contract.
	const [resolved] = assignDecorativeDetails(
		[detailLayer('engraving')],
		mockCulturalProfile({ motifVocabulary: { motifs: [] } }),
		mockPhaseCharacteristics(),
		mockGeologicalContext(),
		[],
		[borrowedSource(0)],
		createPrng('zero-intensity-empty-native-seed'),
		MATERIALS,
		DECORATIVE_TECHNIQUES,
	);

	assert(
		!('motifRef' in resolved!),
		`expected motifRef omitted, got '${resolved!.motifRef}' from a zero-intensity source`,
	);
});

Deno.test('assignDecorativeDetails: distribution — higher exchange intensity yields more borrowed selections', () => {
	const borrowedCount = (intensity: number) => {
		let count = 0;
		for (let i = 0; i < 300; i++) {
			const [resolved] = assignDecorativeDetails(
				[detailLayer('engraving')],
				mockCulturalProfile(),
				mockPhaseCharacteristics(),
				mockGeologicalContext(),
				[],
				[borrowedSource(intensity)],
				createPrng(`intensity-seed-${i}`),
				MATERIALS,
				DECORATIVE_TECHNIQUES,
			);
			if (resolved!.motifRef === 'borrowed-motif') count++;
		}
		return count;
	};

	const high = borrowedCount(1);
	const low = borrowedCount(0.25);

	assert(high > low, `expected intensity 1 (${high}) to borrow more than 0.25 (${low})`);
});

Deno.test('assignDecorativeDetails: an empty motif pool omits motifRef rather than throwing', () => {
	const [resolved] = assignDecorativeDetails(
		[detailLayer('engraving')],
		mockCulturalProfile({ motifVocabulary: { motifs: [] } }),
		mockPhaseCharacteristics(),
		mockGeologicalContext(),
		[],
		[],
		createPrng('empty-pool-seed'),
		MATERIALS,
		DECORATIVE_TECHNIQUES,
	);

	assert(!('motifRef' in resolved!), 'expected motifRef to be omitted for an empty pool');
});

Deno.test('assignDecorativeDetails: re-resolving a pre-filled layer against an empty pool clears the stale value', () => {
	const preFilled: DecorativeLayer = {
		...detailLayer('engraving'),
		motifRef: 'stale-motif-from-a-prior-pass',
	};

	const [resolved] = assignDecorativeDetails(
		[preFilled],
		mockCulturalProfile({ motifVocabulary: { motifs: [] } }),
		mockPhaseCharacteristics(),
		mockGeologicalContext(),
		[],
		[],
		createPrng('empty-pool-reresolve-seed'),
		MATERIALS,
		DECORATIVE_TECHNIQUES,
	);

	assert(
		!('motifRef' in resolved!),
		'expected the pre-filled motifRef to be cleared, not retained, when the pool is now empty',
	);
});

Deno.test("assignDecorativeDetails: every introduced material conforms to its technique's authored tag set", () => {
	for (const [name, tags] of Object.entries(EXPECTED_INTRODUCED_TAGS)) {
		for (let i = 0; i < 40; i++) {
			const [resolved] = assignDecorativeDetails(
				[detailLayer(name as DecorativeTechnique)],
				mockCulturalProfile(),
				mockPhaseCharacteristics(),
				mockGeologicalContext(),
				[mockMaterialFlow()],
				[],
				createPrng(`tag-conformance-${name}-${i}`),
				MATERIALS,
				DECORATIVE_TECHNIQUES,
			);

			const material = MATERIALS.find((m) => m.id === resolved!.material);
			assert(material !== undefined, `'${name}' assigned unknown material '${resolved!.material}'`);
			assert(
				material.tags.some((tag) => (tags as MaterialTag[]).includes(tag)),
				`'${name}' assigned '${material.id}' (${material.tags}), outside its authored tag set (${tags})`,
			);
		}
	}
});

Deno.test('assignDecorativeDetails: distribution — cultural material affinity shifts introduced-material selection', () => {
	const metalShare = (affinities: Map<MaterialTag, number>) => {
		let metal = 0;
		for (let i = 0; i < 200; i++) {
			const [resolved] = assignDecorativeDetails(
				[detailLayer('inlay')],
				mockCulturalProfile({ materialAffinities: affinities }),
				mockPhaseCharacteristics(),
				mockGeologicalContext(),
				[],
				[],
				createPrng(`affinity-seed-${i}`),
				MATERIALS,
				DECORATIVE_TECHNIQUES,
			);
			const material = MATERIALS.find((m) => m.id === resolved!.material)!;
			if (material.tags.includes('metal')) metal++;
		}
		return metal;
	};

	const metalLeaning = metalShare(new Map([['metal', 3]]));
	const stoneLeaning = metalShare(new Map([['stone', 3]]));

	assert(
		metalLeaning > stoneLeaning,
		`expected a metal-leaning culture (${metalLeaning}) to inlay metal more than a stone-leaning one (${stoneLeaning})`,
	);
});

Deno.test('assignDecorativeDetails: availability yields when it would exclude every tagged candidate', () => {
	// Both precious metals marked absent: gilding's tagged pool survives the availability filter
	// being emptied (assignMaterial's exact fallback) rather than dropping the material.
	const geology: GeologicalContext = {
		materialAvailability: new Map([
			['gold', { materialId: 'gold', regions: new Map([['r', 'absent' as const]]) }],
			['silver', { materialId: 'silver', regions: new Map([['r', 'absent' as const]]) }],
		]),
	};

	const [resolved] = assignDecorativeDetails(
		[detailLayer('gilding')],
		mockCulturalProfile(),
		mockPhaseCharacteristics(),
		geology,
		[],
		[],
		createPrng('fallback-seed'),
		MATERIALS,
		DECORATIVE_TECHNIQUES,
	);

	assert(
		resolved!.material === 'gold' || resolved!.material === 'silver',
		`expected a precious metal despite absent availability, got '${resolved!.material}'`,
	);
});

Deno.test('assignDecorativeDetails: recurses into sublayers (2GN.31/32 readiness)', () => {
	const nested = detailLayer('engraving', [detailLayer('inlay', [detailLayer('engraving')])]);

	const [resolved] = assignDecorativeDetails(
		[nested],
		mockCulturalProfile(),
		mockPhaseCharacteristics(),
		mockGeologicalContext(),
		[],
		[],
		createPrng('sublayer-seed'),
		MATERIALS,
		DECORATIVE_TECHNIQUES,
	);

	const inlay = resolved!.sublayers[0]!;
	const deepEngraving = inlay.sublayers[0]!;

	assert(resolved!.motifRef !== undefined, 'expected the base engraving to carry a motif');
	assert(inlay.motifRef !== undefined, 'expected the inlay sublayer to carry a motif');
	assert(inlay.material !== undefined, 'expected the inlay sublayer to introduce a material');
	assert(deepEngraving.motifRef !== undefined, 'expected the deepest sublayer to carry a motif');
});

Deno.test('assignDecorativeDetails: a technique missing from the injected catalogue passes through untouched', () => {
	const layers = [detailLayer('engraving')];

	const resolved = assignDecorativeDetails(
		layers,
		mockCulturalProfile(),
		mockPhaseCharacteristics(),
		mockGeologicalContext(),
		[],
		[],
		createPrng('unknown-technique-seed'),
		MATERIALS,
		[], // Empty injected catalogue: no flags known for any technique.
	);

	assertEquals(resolved, layers);
	assert(resolved[0] !== layers[0], 'expected a new object even when passing through');
});

Deno.test('assignDecorativeDetails: defaults to the shipped MATERIALS and DECORATIVE_TECHNIQUES catalogues', () => {
	const layers = allTechniqueLayers();
	const culture = mockCulturalProfile();
	const phase = mockPhaseCharacteristics();
	const geology = mockGeologicalContext();

	const withDefaults = assignDecorativeDetails(
		layers,
		culture,
		phase,
		geology,
		[],
		[],
		createPrng('detail-default-seed'),
	);
	const withExplicit = assignDecorativeDetails(
		layers,
		culture,
		phase,
		geology,
		[],
		[],
		createPrng('detail-default-seed'),
		MATERIALS,
		DECORATIVE_TECHNIQUES,
	);

	assertEquals(withDefaults, withExplicit);
});

Deno.test('assignDecorativeDetails: resolves expandDecoration output end-to-end', () => {
	const artefact = multiComponentArtefact();
	const culture = mockCulturalProfile();
	const phase = mockPhaseCharacteristics({
		society: { craftSpecialisation: 1 },
		aesthetics: { decorativeEmphasis: 1 },
	});
	const geology = mockGeologicalContext();

	const candidates = expandDecoration(
		artefact,
		culture,
		phase,
		geology,
		[],
		createPrng('pipeline-seed'),
		MATERIALS,
		DECORATIVE_TECHNIQUES,
	);
	const resolved = assignDecorativeDetails(
		candidates,
		culture,
		phase,
		geology,
		[],
		[borrowedSource(0.5)],
		createPrng('pipeline-detail-seed'),
		MATERIALS,
		DECORATIVE_TECHNIQUES,
	);

	assert(resolved.length > 0, 'expected layers at maximum intensity');
	assertEquals(resolved.length, candidates.length);
	for (const layer of resolved) {
		const definition = DECORATIVE_TECHNIQUES.find((t) => t.technique === layer.technique)!;
		assertEquals('motifRef' in layer, definition.carriesMotif);
		assertEquals('material' in layer, definition.introducesMaterial);
	}
});
