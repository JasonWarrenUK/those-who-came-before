/// <reference lib="deno.ns" />
import { assert, assertEquals, assertNotEquals } from '@std/assert';
import { createPrng } from '../prng.ts';
import { generateNPCScholars } from './scholars.ts';
import { mockCulture } from '../../../../tests/fixtures/culture.ts';
import { mockWorldChronology } from '../../../../tests/fixtures/world.ts';
import { renderName } from './naming.ts';

const cultures = [mockCulture({ id: 'culture-a' }), mockCulture({ id: 'culture-b' })];
const chronology = mockWorldChronology({
	cultureTimelines: [
		{ cultureId: 'culture-a', phases: mockWorldChronology().cultureTimelines[0].phases },
		{ cultureId: 'culture-b', phases: mockWorldChronology().cultureTimelines[0].phases },
	],
});

function generate(seed: string) {
	return generateNPCScholars(cultures, chronology, createPrng(seed));
}

Deno.test('determinism: the same seed produces the same cohort', () => {
	const first = generate('scholars-seed-a');
	const second = generate('scholars-seed-a');

	assertEquals(first.map((s) => renderName(s.name)), second.map((s) => renderName(s.name)));
	assertEquals(first.map((s) => s.specialisation), second.map((s) => s.specialisation));
	assertEquals(first.map((s) => s.careerStage), second.map((s) => s.careerStage));
});

Deno.test('determinism: different seeds produce different names', () => {
	const first = generate('scholars-seed-a');
	const second = generate('scholars-seed-b');

	assertNotEquals(
		first.map((s) => renderName(s.name)),
		second.map((s) => renderName(s.name)),
	);
});

Deno.test('cohort: size is 4, every scholar has a non-empty name, specialisation and culture focus', () => {
	const scholars = generate('scholars-cohort-shape');

	assertEquals(scholars.length, 4);
	for (const scholar of scholars) {
		assert(scholar.name.segments.length > 0, `${scholar.id} has an empty name`);
		assert(scholar.specialisation.length > 0, `${scholar.id} has no specialisation`);
		assert(scholar.sitePreference.length > 0, `${scholar.id} has no site preference`);
	}
});

Deno.test('cohort: dealt spread guarantees a senior-or-emeritus anchor and an early-or-mid active scholar', () => {
	for (let i = 0; i < 50; i++) {
		const scholars = generate(`spread-check-${i}`);
		const hasAnchor = scholars.some((s) =>
			s.careerStage === 'senior' || s.careerStage === 'emeritus'
		);
		const hasActive = scholars.some((s) => s.careerStage === 'early' || s.careerStage === 'mid');
		assert(hasAnchor, `seed spread-check-${i} produced no senior/emeritus anchor`);
		assert(hasActive, `seed spread-check-${i} produced no early/mid active scholar`);
	}
});

Deno.test('correlation: no early-career scholar is deceased', () => {
	for (let i = 0; i < 50; i++) {
		const scholars = generate(`career-correlation-${i}`);
		for (const scholar of scholars) {
			if (scholar.careerStage === 'early') {
				assertEquals(
					scholar.status,
					'active',
					`seed career-correlation-${i}: early scholar not active`,
				);
			}
		}
	}
});

Deno.test('correlation: publication counts respect career-stage ordering bands', () => {
	const bandOf = (careerStage: string): [number, number] => {
		switch (careerStage) {
			case 'emeritus':
				return [40, 60];
			case 'senior':
				return [20, 40];
			case 'mid':
				return [8, 20];
			default:
				return [2, 8];
		}
	};

	for (let i = 0; i < 50; i++) {
		const scholars = generate(`publication-bands-${i}`);
		for (const scholar of scholars) {
			const [min, max] = bandOf(scholar.careerStage);
			assert(
				scholar.publicationCount >= min && scholar.publicationCount <= max,
				`seed publication-bands-${i}: ${scholar.id} (${scholar.careerStage}) has ` +
					`${scholar.publicationCount} publications, expected [${min}, ${max}]`,
			);
		}
	}
});

Deno.test('coverage: cultureFocus only ever names cultures present in chronology.cultureTimelines', () => {
	const validIds = new Set(chronology.cultureTimelines.map((t) => t.cultureId));
	const scholars = generate('culture-focus-coverage');
	for (const scholar of scholars) {
		for (const cultureId of scholar.cultureFocus) {
			assert(validIds.has(cultureId), `${scholar.id} focuses on unknown culture ${cultureId}`);
		}
	}
});

Deno.test('coverage: cultureFocus is empty when chronology has no culture timelines', () => {
	const emptyChronology = mockWorldChronology({ cultureTimelines: [] });
	const scholars = generateNPCScholars(cultures, emptyChronology, createPrng('no-timelines'));
	for (const scholar of scholars) {
		assertEquals(scholar.cultureFocus, []);
	}
});

Deno.test('model: interpretiveModel carries identity, not claims', () => {
	const scholars = generate('model-identity');
	for (const scholar of scholars) {
		assertEquals(scholar.interpretiveModel.agentId, scholar.id);
		assertEquals(scholar.interpretiveModel.culturalClaims.size, 0);
		assertEquals(scholar.interpretiveModel.artefactClaims.size, 0);
		assertEquals(scholar.interpretiveModel.chronologicalClaims.size, 0);
		assertEquals(scholar.interpretiveModel.agentAssessments.size, 0);
		assertEquals(scholar.interpretiveModel.strainScores.size, 0);
		assertEquals(scholar.interpretiveModel.contradictionQueue.items.length, 0);
	}
});

Deno.test('model: methodological bias is never the neutral player default', () => {
	for (let i = 0; i < 50; i++) {
		const scholars = generate(`bias-check-${i}`);
		for (const scholar of scholars) {
			assertNotEquals(
				scholar.interpretiveModel.methodologicalWeights.bias,
				'generalist',
				`${scholar.id} (seed bias-check-${i}) drew the neutral player default`,
			);
		}
	}
});

Deno.test('specialisation: trade-good and currency never appear (classifier gap, doc scholars.ts)', () => {
	for (let i = 0; i < 50; i++) {
		const scholars = generate(`vocab-check-${i}`);
		for (const scholar of scholars) {
			assert(!scholar.specialisation.includes('trade-good'));
			assert(!scholar.specialisation.includes('currency'));
		}
	}
});
