/**
 * Test fixture for `InterpretiveModel` (doc 08 §3.2, roadmap 2GN.48 — "needs an `InterpretiveModel`
 * fixture factory added to `tests/fixtures/` since none exists").
 *
 * Consumed as a named import with an explicit `.ts` extension, matching the convention set by
 * `src/lib/engine/prng.test.ts`. Sibling to `tests/fixtures/scholars.ts`, `culture.ts` and
 * `world.ts` — split per-domain to mirror the `src/lib/types/` layout.
 *
 * `InterpretiveModel` is almost entirely `Map`s, so — per the `mockCulture` convention — overrides
 * replace whole top-level branches rather than deep-merging: a shallow spread on a `Map` loses
 * every entry the default didn't set, not just the one an override changes.
 */

import type {
	AgentAssessment,
	ArtefactClaim,
	CulturalClaim,
	InterpretiveModel,
	MethodologicalProfile,
} from '../../src/lib/types/interpretation.ts';
import type { ContradictionQueue } from '../../src/lib/types/contradiction.ts';

/**
 * Builds a mock `MethodologicalProfile`: `'generalist'` bias with every weight at neutral `1.0`,
 * matching the documented fresh-player default (`MethodologicalProfile`'s own JSDoc).
 *
 * @param overrides - Partial `MethodologicalProfile` merged shallowly over the defaults.
 */
export function mockMethodologicalProfile(
	overrides: Partial<MethodologicalProfile> = {},
): MethodologicalProfile {
	const defaults: MethodologicalProfile = {
		bias: 'generalist',
		weights: { materialEvidence: 1.0, structuralEvidence: 1.0, culturalEvidence: 1.0 },
	};

	return { ...defaults, ...overrides };
}

/**
 * Builds a mock `CulturalClaim`, internally coherent by default (`id` matches the key a caller
 * would use in `InterpretiveModel.culturalClaims`).
 *
 * @param overrides - Partial `CulturalClaim` merged shallowly over the defaults.
 */
export function mockCulturalClaim(overrides: Partial<CulturalClaim> = {}): CulturalClaim {
	const defaults: CulturalClaim = {
		id: 'test-cultural-claim',
		cultureLabel: 'Test Culture',
		claim: 'Test Culture favours stone over metal.',
		confidence: 'tentative',
		status: 'active',
		createdAtTerm: 0,
	};

	return { ...defaults, ...overrides };
}

/**
 * Builds a mock `ArtefactClaim`.
 *
 * @param overrides - Partial `ArtefactClaim` merged shallowly over the defaults.
 */
export function mockArtefactClaim(overrides: Partial<ArtefactClaim> = {}): ArtefactClaim {
	const defaults: ArtefactClaim = {
		id: 'test-artefact-claim',
		artefactId: 'test-artefact',
		claim: 'This artefact is ceremonial.',
		assignedTags: [],
		confidence: 'tentative',
		status: 'active',
		createdAtTerm: 0,
	};

	return { ...defaults, ...overrides };
}

/**
 * Builds a mock `AgentAssessment`.
 *
 * @param overrides - Partial `AgentAssessment` merged shallowly over the defaults.
 */
export function mockAgentAssessment(overrides: Partial<AgentAssessment> = {}): AgentAssessment {
	const defaults: AgentAssessment = {
		agentId: 'test-other-agent',
		reliability: 0.5,
		agreement: 0.5,
		methodologicalBias: 'generalist',
	};

	return { ...defaults, ...overrides };
}

/**
 * Builds a mock `ContradictionQueue`, empty by default.
 *
 * @param overrides - Partial `ContradictionQueue` merged shallowly over the defaults.
 */
export function mockContradictionQueue(
	overrides: Partial<ContradictionQueue> = {},
): ContradictionQueue {
	const defaults: ContradictionQueue = { items: [], totalSeverity: 0, reputationalPressure: 0 };

	return { ...defaults, ...overrides };
}

/**
 * Builds a mock `InterpretiveModel`: empty claim maps, a neutral `MethodologicalProfile` and an
 * empty `ContradictionQueue` — the same agent-generic shape the player and every NPC scholar share
 * (doc 11 §2.6).
 *
 * Overrides replace whole top-level branches (every field but `agentId` is a `Map` or a nested
 * object) rather than deep-merging, per this fixture module's own JSDoc.
 *
 * @param overrides - Partial `InterpretiveModel` merged shallowly over the defaults.
 */
export function mockInterpretiveModel(
	overrides: Partial<InterpretiveModel> = {},
): InterpretiveModel {
	const defaults: InterpretiveModel = {
		agentId: 'test-agent',
		culturalClaims: new Map(),
		artefactClaims: new Map(),
		chronologicalClaims: new Map(),
		agentAssessments: new Map(),
		methodologicalWeights: mockMethodologicalProfile(),
		strainScores: new Map(),
		contradictionQueue: mockContradictionQueue(),
	};

	return { ...defaults, ...overrides };
}
