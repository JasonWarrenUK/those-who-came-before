/// <reference lib="deno.ns" />
import { assert, assertEquals } from '@std/assert';
import { mockCulturalProfile, mockCulture, mockPhaseCharacteristics } from './culture.ts';
import { culturalAffinityWeight } from '../../src/lib/engine/generation/materials.ts';
import { MATERIALS } from '../../src/lib/data/materials.ts';
import type { CulturalProfile } from '../../src/lib/types/world.ts';
import type { MaterialName } from '../../src/lib/types/tags.ts';

/** The weight `id` draws from `culture`, resolved exactly as the engine resolves it. */
function affinityFor(id: MaterialName, culture: CulturalProfile): number {
	const definition = MATERIALS.find((m) => m.id === id);
	if (!definition) throw new Error(`unknown material: ${id}`);

	return culturalAffinityWeight(definition, culture);
}

Deno.test('mockCulture: id and timeline.cultureId are consistent by default', () => {
	const culture = mockCulture();

	assertEquals(culture.timeline.cultureId, culture.id);
});

Deno.test('mockCulture: materialAffinities is a populated entry array', () => {
	const culture = mockCulture();

	assert(Array.isArray(culture.baseProfile.materialAffinities));
	assert(culture.baseProfile.materialAffinities.length > 0);
});

Deno.test('mockCulture: craftInvestment weights are populated Maps', () => {
	const culture = mockCulture();

	assert(culture.baseProfile.craftInvestment.contextWeights instanceof Map);
	assert(culture.baseProfile.craftInvestment.contextWeights.size > 0);
	assert(culture.baseProfile.craftInvestment.siteTypeWeights instanceof Map);
	assert(culture.baseProfile.craftInvestment.siteTypeWeights.size > 0);
});

Deno.test('mockCulture: timeline has at least one fully-populated phase', () => {
	const culture = mockCulture();

	assert(culture.timeline.phases.length > 0);

	const [phase] = culture.timeline.phases;
	const { technology, economy, society, aesthetics } = phase.characteristics;

	assertEquals(typeof technology.metallurgy, 'number');
	assertEquals(typeof economy.tradeOpenness, 'number');
	assertEquals(typeof society.craftSpecialisation, 'number');
	assertEquals(typeof aesthetics.decorativeEmphasis, 'number');
});

Deno.test('mockCulture: overrides apply', () => {
	const culture = mockCulture({ id: 'custom-culture', label: 'Custom Culture' });

	assertEquals(culture.id, 'custom-culture');
	assertEquals(culture.label, 'Custom Culture');
});

Deno.test('mockPhaseCharacteristics: every attribute defaults to a neutral 0.5', () => {
	const phase = mockPhaseCharacteristics();

	for (const branch of Object.values(phase)) {
		for (const value of Object.values(branch)) {
			assertEquals(value, 0.5);
		}
	}
});

Deno.test('mockPhaseCharacteristics: a nested override changes only the targeted attribute', () => {
	const phase = mockPhaseCharacteristics({ technology: { metallurgy: 1 } });

	assertEquals(phase.technology.metallurgy, 1);
	assertEquals(phase.technology.ceramics, 0.5);
	assertEquals(phase.economy.tradeOpenness, 0.5);
	assertEquals(phase.society.craftSpecialisation, 0.5);
	assertEquals(phase.aesthetics.formConservatism, 0.5);
});

Deno.test('mockCulturalProfile: defaults carry metal-leaning affinities and populated branches', () => {
	const profile = mockCulturalProfile();

	// Asserted through the resolver rather than by indexing the entries, so these pin the weight a
	// material actually draws at — the fixture's internal ordering is free to change beneath them.
	assertEquals(affinityFor('bronze', profile), 1.5);
	assertEquals(affinityFor('granite', profile), 1.0);
	assert(profile.techniqueAffinities.size > 0);
	assertEquals(profile.techniqueAffinities.get('engraving'), 1.5);
	assert(profile.motifVocabulary.motifs.length > 0);
	assert(profile.craftInvestment.contextWeights.size > 0);
});

Deno.test('mockCulturalProfile: overrides replace whole branches', () => {
	const profile = mockCulturalProfile({ materialAffinities: [] });

	assertEquals(profile.materialAffinities.length, 0);
	assertEquals(affinityFor('bronze', profile), 1); // Neutral, not 1.5.
	assert(profile.techniqueAffinities.size > 0); // Independent branch, untouched by the override.
	assert(profile.motifVocabulary.motifs.length > 0);
});

Deno.test('mockCulturalProfile: techniqueAffinities overrides independently of materialAffinities', () => {
	// The four-quadrant requirement (roadmap 2GN.29): technique preference and material affinity
	// are separate signals, so overriding one must never implicitly change the other.
	const profile = mockCulturalProfile({ techniqueAffinities: new Map() });

	assertEquals(profile.techniqueAffinities.size, 0);
	assertEquals(affinityFor('bronze', profile), 1.5); // Untouched.
});

Deno.test('mockCulturalProfile: mockCulture keeps delegating with a consistent motif origin', () => {
	const culture = mockCulture({ id: 'origin-check' });

	assertEquals(culture.baseProfile.motifVocabulary.motifs[0].culturalOrigin, 'origin-check');
});
