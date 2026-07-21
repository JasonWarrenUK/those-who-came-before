/**
 * Test fixture for the world seed (doc 08 §5, roadmap task 1FD.35).
 *
 * Consumed as a named import with an explicit `.ts` extension, matching the convention set by
 * `src/lib/engine/prng.test.ts` (e.g. `import { mockWorldSeed } from '../../../tests/fixtures/world.ts'`).
 * Culture and artefact fixtures live alongside this one in `tests/fixtures/culture.ts` and
 * `tests/fixtures/artefact.ts` — split per-domain to mirror the `src/lib/types/` layout.
 */

import { createPrng } from '../../src/lib/engine/prng.ts';
import type {
	AvailabilityLevel,
	GeologicalContext,
	MaterialFlow,
	RegionalAvailability,
	WorldSeed,
} from '../../src/lib/types/world.ts';

/**
 * Builds a mock `WorldSeed`: a raw seed string plus its deterministic PRNG (doc 05 §2).
 *
 * @param raw - Seed string. Defaults to a fixed value so callers get determinism for free.
 */
export function mockWorldSeed(raw = 'test-seed'): WorldSeed {
	return { raw, prng: createPrng(raw) };
}

/**
 * Builds a mock `GeologicalContext` (doc 05 §3.6, roadmap 2GN.23) spanning every `AvailabilityLevel`
 * across a couple of named regions, for `isAvailable`/`computeMaterialWeight` tests
 * (`engine/generation/materials.ts`): `bronze` abundant, `iron` scarce, `gold` trade-only, `flint`
 * absent everywhere. Materials not listed here are absent from the map entirely — deliberately, to
 * exercise `isAvailable`'s "not modelled → obtainable" MVP lenience.
 *
 * Overrides replace the whole `materialAvailability` map (a `Map`, per the `mockCulturalProfile`
 * convention) rather than deep-merging.
 *
 * @param overrides - Partial `GeologicalContext` merged shallowly over the defaults.
 */
export function mockGeologicalContext(
	overrides: Partial<GeologicalContext> = {},
): GeologicalContext {
	function regional(materialId: string, level: AvailabilityLevel): RegionalAvailability {
		return { materialId, regions: new Map([['test-region', level]]) };
	}

	const defaults: GeologicalContext = {
		materialAvailability: new Map([
			['bronze', regional('bronze', 'abundant')],
			['iron', regional('iron', 'scarce')],
			['gold', regional('gold', 'trade-only')],
			['flint', regional('flint', 'absent')],
		]),
	};

	return { ...defaults, ...overrides };
}

/**
 * Builds a mock `MaterialFlow` (doc 05 §3.4, roadmap 2GN.23): a bidirectional metal flow, for
 * `isAvailable`'s trade-reachability check (`engine/generation/materials.ts`).
 *
 * @param overrides - Partial `MaterialFlow` merged shallowly over the defaults.
 */
export function mockMaterialFlow(overrides: Partial<MaterialFlow> = {}): MaterialFlow {
	const defaults: MaterialFlow = {
		materialTag: 'metal',
		direction: 'bidirectional',
		volume: 0.5,
	};

	return { ...defaults, ...overrides };
}
