/**
 * Batch generation logic for the plausibility panel (roadmap 2GN.58).
 *
 * Runs N independent, one-shot generate-and-check attempts and aggregates their verdicts. No
 * retry/re-expansion happens here — that's roadmap 2GN.16's job once it lands. This module simply
 * shows what the grammar currently produces and how often the (still-partial, 2GN.13–15) rule set
 * rejects it.
 *
 * Pure, no DOM/Svelte, so it's unit-testable directly per the `structureTree.ts` precedent.
 */

import { createPrng } from '../../../../lib/engine/prng.ts';
import { expandGrammar, normaliseArtefact } from '../../../../lib/engine/generation/grammar.ts';
import { checkPlausibility } from '../../../../lib/engine/generation/plausibility.ts';
import { CORE_GRAMMAR_RULES } from '../../../../lib/data/grammars/core.ts';
import type { NormalisedArtefact } from '../../../../lib/types/artefact.ts';
import type { PlausibilityCheckResult } from '../../../../lib/engine/generation/plausibility.ts';
import type { ExplorerCulture } from '../../../../lib/data/explorer-cultures.ts';

/** One generated structure's verdict within a batch. */
export interface BatchEntry {
	/** Position within the batch, `0`-indexed. */
	index: number;

	/** The seed this entry was generated from (`${baseSeed}-${index}`). */
	seed: string;

	/** The generated, flattened artefact. */
	artefact: NormalisedArtefact;

	/** The plausibility verdict for `artefact`. */
	result: PlausibilityCheckResult;
}

/** Aggregate result of running a batch. */
export interface BatchSummary {
	/** One entry per generated structure, in generation order. */
	entries: BatchEntry[];

	/** Fraction of entries that failed plausibility, in `[0, 1]`. `0` when the batch is empty. */
	rejectionRate: number;
}

/**
 * Generates `count` structures from `baseSeed` against `culture`, one seed per index
 * (`${baseSeed}-${index}`, matching `scripts/dev/sample-artefact.ts`'s batch-seed convention), and
 * checks each against the default plausibility rule set.
 *
 * @param baseSeed - The shared Explorer seed to derive per-entry seeds from.
 * @param count - How many structures to generate. Non-positive values yield an empty batch.
 * @param culture - The culture/phase pair to generate against.
 */
export function runBatch(baseSeed: string, count: number, culture: ExplorerCulture): BatchSummary {
	const entries: BatchEntry[] = [];

	for (let index = 0; index < count; index++) {
		const seed = `${baseSeed}-${index}`;
		const prng = createPrng(seed);
		const expanded = expandGrammar(CORE_GRAMMAR_RULES, culture.profile, culture.phase, prng);
		const artefact = normaliseArtefact(expanded, `plausibility-${seed}`);
		const result = checkPlausibility(artefact);
		entries.push({ index, seed, artefact, result });
	}

	const failed = entries.filter((entry) => !entry.result.valid).length;
	const rejectionRate = entries.length === 0 ? 0 : failed / entries.length;

	return { entries, rejectionRate };
}
