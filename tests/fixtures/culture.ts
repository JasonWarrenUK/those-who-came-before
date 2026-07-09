/**
 * Test fixture for `Culture` (doc 05 §3.3, roadmap task 1FD.35).
 *
 * Consumed as a named import with an explicit `.ts` extension, matching the convention set by
 * `src/lib/engine/prng.test.ts`. Sibling to `tests/fixtures/world.ts` (seed) and
 * `tests/fixtures/artefact.ts` (artefacts) — fixtures are split per-domain to mirror the
 * `src/lib/types/` layout.
 */

import type {
	CraftInvestmentProfile,
	CulturalProfile,
	Culture,
	CulturePhase,
	CultureTimeline,
	MotifSet,
	PhaseCharacteristics,
} from '../../src/lib/types/world.ts';
import type { MaterialTag } from '../../src/lib/types/tags.ts';

function mockPhaseCharacteristics(): PhaseCharacteristics {
	return {
		technology: {
			metallurgy: 0.5,
			ceramics: 0.5,
			textiles: 0.5,
			stoneWorking: 0.5,
			glassWorking: 0.5,
			woodWorking: 0.5,
		},
		economy: {
			tradeOpenness: 0.5,
			surplus: 0.5,
			urbanisation: 0.5,
		},
		society: {
			stratification: 0.5,
			militarisation: 0.5,
			religiousEmphasis: 0.5,
			craftSpecialisation: 0.5,
		},
		aesthetics: {
			decorativeEmphasis: 0.5,
			motifComplexity: 0.5,
			formConservatism: 0.5,
		},
	};
}

function mockMotifVocabulary(cultureId: string): MotifSet {
	return {
		motifs: [
			{ id: 'test-motif', label: 'Test Motif', culturalOrigin: cultureId },
		],
	};
}

function mockCraftInvestment(): CraftInvestmentProfile {
	return {
		contextWeights: new Map([
			['burial-goods', 1.0],
			['deliberate-placement', 0.5],
		]),
		siteTypeWeights: new Map([
			['settlement', 1.0],
			['burial', 0.75],
		]),
	};
}

function mockBaseProfile(cultureId: string): CulturalProfile {
	return {
		materialAffinities: new Map<MaterialTag, number>([
			['metal', 1.5],
			['stone', 1.0],
		]),
		motifVocabulary: mockMotifVocabulary(cultureId),
		craftInvestment: mockCraftInvestment(),
	};
}

function mockTimeline(cultureId: string): CultureTimeline {
	const phase: CulturePhase = {
		id: 'test-phase',
		label: 'Test Phase',
		startYear: -500,
		endYear: 0,
		characteristics: mockPhaseCharacteristics(),
	};

	return { cultureId, phases: [phase] };
}

/**
 * Builds a mock `Culture`: a stable id/label, a fully-populated `baseProfile` (material
 * affinities, motif vocabulary, craft investment) and a single-phase `timeline`. `timeline.
 * cultureId` and `motifVocabulary.motifs[0].culturalOrigin` are kept consistent with `id` by
 * default so a fixture read alone still makes sense.
 *
 * Overrides replace whole top-level branches (`baseProfile`, `timeline`) rather than deep-merging
 * — `materialAffinities`/`contextWeights`/`siteTypeWeights` are `Map`s and `PhaseCharacteristics`
 * nests two levels deep, so a shallow spread on either would silently drop sibling entries.
 * Callers wanting a tweaked phase or affinity map should pass the full replacement branch.
 *
 * @param overrides - Partial `Culture` merged shallowly over the defaults.
 */
export function mockCulture(overrides: Partial<Culture> = {}): Culture {
	const id = overrides.id ?? 'test-culture';

	const defaults: Culture = {
		id,
		label: 'Test Culture',
		baseProfile: mockBaseProfile(id),
		timeline: mockTimeline(id),
	};

	return { ...defaults, ...overrides };
}
