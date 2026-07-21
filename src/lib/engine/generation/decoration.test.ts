/// <reference lib="deno.ns" />
import { assert, assertEquals, assertNotEquals } from '@std/assert';
import { computeTechniqueWeight, expandDecoration } from './decoration.ts';
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
			MATERIALS,
			DECORATIVE_TECHNIQUES,
			createPrng('determinism-seed'),
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
			MATERIALS,
			DECORATIVE_TECHNIQUES,
			createPrng(seed),
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
		MATERIALS,
		DECORATIVE_TECHNIQUES,
		createPrng('purity-seed'),
	);
	expandDecoration(
		artefact,
		culture,
		phase,
		geology,
		trade,
		MATERIALS,
		DECORATIVE_TECHNIQUES,
		createPrng('purity-seed'),
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
		MATERIALS,
		DECORATIVE_TECHNIQUES,
		createPrng('targets-seed'),
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
		MATERIALS,
		DECORATIVE_TECHNIQUES,
		createPrng('flat-seed'),
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
			MATERIALS,
			DECORATIVE_TECHNIQUES,
			createPrng(`category-seed-${i}`),
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
				MATERIALS,
				DECORATIVE_TECHNIQUES,
				createPrng(`intensity-seed-${i}`),
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
				MATERIALS,
				DECORATIVE_TECHNIQUES,
				createPrng(`textile-isolation-seed-${i}`),
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
		MATERIALS,
		surfaceOnly,
		createPrng('truncated-seed'),
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
		MATERIALS,
		DECORATIVE_TECHNIQUES,
		createPrng('empty-seed'),
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
		undefined,
		undefined,
		createPrng('default-seed'),
	);
	const withExplicit = expandDecoration(
		artefact,
		culture,
		phase,
		geology,
		[],
		MATERIALS,
		DECORATIVE_TECHNIQUES,
		createPrng('default-seed'),
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
				MATERIALS,
				DECORATIVE_TECHNIQUES,
				createPrng(seed),
			),
		);

	const a = draw('diverge-a');
	const results = [];
	for (let i = 0; i < 25; i++) results.push(draw(`diverge-${i}`));
	const divergent = results.find((r) => r !== a);

	assert(divergent !== undefined, 'expected at least one seed to diverge');
	assertNotEquals(a, divergent);
});
