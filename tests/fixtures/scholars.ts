/**
 * Test fixture for `NPCScholarSeed` (doc 05 §4.1, roadmap 2GN.48).
 *
 * Consumed as a named import with an explicit `.ts` extension, matching the convention set by
 * `src/lib/engine/prng.test.ts`. Sibling to `tests/fixtures/interpretation.ts` — split per-domain
 * to mirror the `src/lib/types/` layout.
 */

import type { NPCScholarSeed } from '../../src/lib/types/scholars.ts';
import type { NameForm } from '../../src/lib/types/language.ts';
import { mockInterpretiveModel } from './interpretation.ts';

/**
 * Builds a mock `NPCScholarSeed`: one specialisation tag, one culture focus, an identity-only
 * `InterpretiveModel` (no claims — populating those is 2GN.49's job), one preferred site type, a
 * mid-career active scholar.
 *
 * `name` is a hand-built `NameForm` literal rather than a generated one, matching
 * `tests/fixtures/artefact.ts`'s convention for the same type.
 *
 * @param overrides - Partial `NPCScholarSeed` merged shallowly over the defaults.
 */
export function mockNPCScholarSeed(overrides: Partial<NPCScholarSeed> = {}): NPCScholarSeed {
	const name: NameForm = {
		segments: ['t', 'e', 's', 'u'],
		syllables: [2, 2],
		languageId: 'modern',
		coinedPhaseId: null,
	};

	const defaults: NPCScholarSeed = {
		id: 'test-scholar',
		name,
		specialisation: ['container'],
		cultureFocus: ['test-culture'],
		interpretiveModel: mockInterpretiveModel({ agentId: 'test-scholar' }),
		sitePreference: ['settlement'],
		careerStage: 'mid',
		status: 'active',
		publicationCount: 12,
	};

	return { ...defaults, ...overrides };
}
