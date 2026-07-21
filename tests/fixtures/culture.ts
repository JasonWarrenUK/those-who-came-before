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
import type { DecorativeTechnique } from '../../src/lib/types/decoration.ts';

/**
 * Per-branch partial overrides for `mockPhaseCharacteristics`. Explicit rather than a generic
 * DeepPartial so the fixture's surface stays readable and misspelt attribute names fail to
 * compile.
 */
export interface PhaseCharacteristicsOverrides {
	technology?: Partial<PhaseCharacteristics['technology']>;
	economy?: Partial<PhaseCharacteristics['economy']>;
	society?: Partial<PhaseCharacteristics['society']>;
	aesthetics?: Partial<PhaseCharacteristics['aesthetics']>;
}

/**
 * Builds a mock `PhaseCharacteristics` with every attribute at a neutral 0.5, so tests can push
 * single attributes to the extremes (e.g. `{ technology: { metallurgy: 1 } }`) and observe the
 * shift against an otherwise-flat profile.
 *
 * Overrides merge two levels deep, diverging deliberately from `mockCulture`'s whole-branch
 * replacement: that convention exists because `Map`s and deep nesting drop siblings under a
 * shallow spread, but every `PhaseCharacteristics` branch is a flat numeric record, so a
 * per-branch spread is lossless and spares callers restating twelve unchanged attributes.
 *
 * @param overrides - Per-branch partial attribute replacements, merged over the 0.5 defaults.
 */
export function mockPhaseCharacteristics(
	overrides: PhaseCharacteristicsOverrides = {},
): PhaseCharacteristics {
	return {
		technology: {
			metallurgy: 0.5,
			ceramics: 0.5,
			textiles: 0.5,
			stoneWorking: 0.5,
			glassWorking: 0.5,
			woodWorking: 0.5,
			boneWorking: 0.5,
			...overrides.technology,
		},
		economy: {
			tradeOpenness: 0.5,
			surplus: 0.5,
			urbanisation: 0.5,
			...overrides.economy,
		},
		society: {
			stratification: 0.5,
			militarisation: 0.5,
			religiousEmphasis: 0.5,
			craftSpecialisation: 0.5,
			...overrides.society,
		},
		aesthetics: {
			decorativeEmphasis: 0.5,
			motifComplexity: 0.5,
			formConservatism: 0.5,
			...overrides.aesthetics,
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

/**
 * A metal-leaning technique preference (engraving, inlay, gilding — all metal-substrate
 * applied/surface techniques), matching `mockCulturalProfile`'s metal-leaning `materialAffinities`
 * so the two signals agree by default rather than accidentally contradicting each other. Callers
 * exercising the four-quadrant technique/motif independence (roadmap 2GN.29) should pass an explicit
 * replacement `Map`.
 */
function mockTechniqueAffinities(): Map<DecorativeTechnique, number> {
	return new Map<DecorativeTechnique, number>([
		['engraving', 1.5],
		['inlay', 1.5],
		['gilding', 1.2],
	]);
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

/**
 * Builds a mock `CulturalProfile`: metal-leaning `materialAffinities`, a matching metal-leaning
 * `techniqueAffinities` (engraving/inlay/gilding), a single-motif vocabulary and a populated
 * craft-investment profile.
 *
 * Overrides merge shallowly per the `mockCulture` convention — `materialAffinities` and
 * `techniqueAffinities` are `Map`s, so callers wanting different affinities pass a whole
 * replacement `Map` (e.g. `{ materialAffinities: new Map() }` for a culture with no leanings at
 * all, or `{ techniqueAffinities: new Map() }` to isolate technique selection from motif/material
 * signals when exercising the four-quadrant independence roadmap 2GN.29 requires).
 *
 * @param overrides - Partial `CulturalProfile` merged shallowly over the defaults.
 */
export function mockCulturalProfile(overrides: Partial<CulturalProfile> = {}): CulturalProfile {
	const defaults: CulturalProfile = {
		materialAffinities: new Map<MaterialTag, number>([
			['metal', 1.5],
			['stone', 1.0],
		]),
		techniqueAffinities: mockTechniqueAffinities(),
		motifVocabulary: mockMotifVocabulary('test-culture'),
		craftInvestment: mockCraftInvestment(),
	};

	return { ...defaults, ...overrides };
}

function mockBaseProfile(cultureId: string): CulturalProfile {
	return mockCulturalProfile({ motifVocabulary: mockMotifVocabulary(cultureId) });
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
