/**
 * Test fixtures for world-level types (doc 08 §5, roadmap task 1FD.35).
 *
 * Consumed as `import * as fixtures from '../fixtures/world'` per the project's fixtures
 * convention. Only `mockWorldSeed` is implemented today — it's the one fixture that needs no
 * unbuilt domain types (see the TODOs below for what blocks the other two).
 */

import { createPrng } from '../../src/lib/engine/prng.ts';

/**
 * Structural stand-in for `WorldSeed` (doc 05 §2). Declared locally rather than imported because
 * `src/lib/types/world.ts` (roadmap task 1FD.14) doesn't exist yet — swap this for the real type
 * import once that task lands.
 */
export interface MockWorldSeed {
	raw: string;
	prng: () => number;
}

/**
 * Builds a mock `WorldSeed`: a raw seed string plus its deterministic PRNG. This is the only
 * fixture in 1FD.35 buildable before the type system exists, since `WorldSeed` needs nothing
 * beyond `createPrng` (1FD.6).
 *
 * @param raw - Seed string. Defaults to a fixed value so callers get determinism for free.
 */
export function mockWorldSeed(raw = 'test-seed'): MockWorldSeed {
	return { raw, prng: createPrng(raw) };
}

// TODO(1FD.35): mockCulture — blocked on Culture/CulturalProfile (1FD.14), MaterialTag (1FD.12),
// SiteType/DepositionType (1FD.16). None of these types exist in src/lib/types/ yet.

// TODO(1FD.35): mockArtefact — blocked on NormalisedArtefact/ClassifiedArtefact (1FD.11),
// ArrangementPattern/AttachmentType (1FD.10), MaterialTag (1FD.12). None of these types exist yet.
