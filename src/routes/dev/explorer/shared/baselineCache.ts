/**
 * Per-culture memo of `sampleBaselines` for the Explorer's interactive panels (roadmap 2GN.82).
 *
 * `sampleBaselines` is deliberately uncached (`engine/generation/baselines.ts`): it is a pure
 * function whose eventual owner is `WorldState` (roadmap 3WS.9/2GN.96), and a module-level cache in
 * `lib/` would be an untestable global with no owner. The Explorer *is* an owner — a dev tool with a
 * fixed, finite preset list and panels that re-derive on every keystroke — so the memo lives here,
 * at the layer that has the lifetime to justify it, and disappears when 2GN.96 gives baselines a
 * real home on `WorldState`.
 *
 * Keyed by culture id alone: `EXPLORER_CULTURES` presets carry exactly one phase each
 * (`explorerCulturePhase` doubles the id as the phase id), so id uniquely identifies a
 * culture-phase here. Seeded with a fixed `BASELINE_SEED` rather than any inspected artefact's
 * seed, so the baseline is a property of the culture and every artefact from that culture is judged
 * against one yardstick — seeding from the artefact's own seed would make each artefact judged
 * against a baseline drawn just for it, which is not culture-relativity at all.
 *
 * `ruleCalibration.ts` does **not** use this memo: `calibrateRules` already amortises its cost over
 * 100–1000 artefacts per call, and a shared mutable cache would make its report depend on call
 * order, breaking its documented "same seed and count always give the same report" contract.
 */

import { sampleBaselines } from '../../../../lib/engine/generation/baselines.ts';
import { CORE_GRAMMAR_RULES } from '../../../../lib/data/grammars/core.ts';
import { MATERIALS } from '../../../../lib/data/materials.ts';
import { DECORATIVE_TECHNIQUES } from '../../../../lib/data/decorations.ts';
import { explorerCulturePhase } from '../../../../lib/data/explorer-cultures.ts';
import type { ExplorerCulture } from '../../../../lib/data/explorer-cultures.ts';
import type { ClassificationContext } from '../../../../lib/types/tags.ts';

/** Fixed seed for every Explorer baseline — deliberately not the inspected artefact's own seed. */
const BASELINE_SEED = 'explorer-baseline';

/** One memo entry per culture id, populated lazily on first request. */
const cache = new Map<string, ClassificationContext>();

/**
 * Returns `culture`'s sampled `ClassificationContext`, computing and caching it on first request.
 *
 * @param culture - The Explorer culture preset to sample a baseline for.
 */
export function baselineFor(culture: ExplorerCulture): ClassificationContext {
	const cached = cache.get(culture.id);
	if (cached) return cached;

	const context = sampleBaselines(
		BASELINE_SEED,
		explorerCulturePhase(culture),
		CORE_GRAMMAR_RULES,
		MATERIALS,
		DECORATIVE_TECHNIQUES,
	);
	cache.set(culture.id, context);
	return context;
}
