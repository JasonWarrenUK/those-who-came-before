/// <reference lib="deno.ns" />
import { assert, assertEquals } from '@std/assert';
import { mockCulture } from './culture.ts';

Deno.test('mockCulture: id and timeline.cultureId are consistent by default', () => {
	const culture = mockCulture();

	assertEquals(culture.timeline.cultureId, culture.id);
});

Deno.test('mockCulture: materialAffinities is a populated Map', () => {
	const culture = mockCulture();

	assert(culture.baseProfile.materialAffinities instanceof Map);
	assert(culture.baseProfile.materialAffinities.size > 0);
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
