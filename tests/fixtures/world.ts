/**
 * Test fixture for the world seed (doc 08 §5, roadmap task 1FD.35).
 *
 * Consumed as a named import with an explicit `.ts` extension, matching the convention set by
 * `src/lib/engine/prng.test.ts` (e.g. `import { mockWorldSeed } from '../../../tests/fixtures/world.ts'`).
 * Culture and artefact fixtures live alongside this one in `tests/fixtures/culture.ts` and
 * `tests/fixtures/artefact.ts` — split per-domain to mirror the `src/lib/types/` layout.
 */

import { createPrng } from '../../src/lib/engine/prng.ts';
import type { WorldSeed } from '../../src/lib/types/world.ts';

/**
 * Builds a mock `WorldSeed`: a raw seed string plus its deterministic PRNG (doc 05 §2).
 *
 * @param raw - Seed string. Defaults to a fixed value so callers get determinism for free.
 */
export function mockWorldSeed(raw = 'test-seed'): WorldSeed {
	return { raw, prng: createPrng(raw) };
}
