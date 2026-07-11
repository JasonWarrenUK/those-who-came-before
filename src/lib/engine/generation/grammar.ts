/**
 * Component grammar expansion engine (doc 05 §5.3–§5.4, roadmap 2GN.3–2GN.5).
 *
 * Runs the bottom-up structural grammar: weighted, culture- and phase-biased selection over the
 * production rules authored in `data/grammars/core.ts`, expanding them into a tree of geometric
 * components. The grammar produces physical structures, never functional categories (doc 05
 * §5.1) — nothing here branches by intent, only by weight.
 *
 * Pure TypeScript with no framework or browser dependencies (doc 08 §2.1, the engine boundary),
 * matching `engine/prng.ts`. Determinism flows entirely from the injected PRNG.
 */

import type { GrammarOption, GrammarRule } from '../../types/grammar.ts';
import type { CulturalProfile, PhaseCharacteristics } from '../../types/world.ts';
import { weightedSelect } from '../prng.ts';

/**
 * Resolves a dotted `PhaseCharacteristics` path (e.g. `'technology.metallurgy'`) to its numeric
 * attribute. Generic over the profile's shape so new attributes need no code change here.
 *
 * Throws on a path that doesn't resolve to a number: grammar data is authored in-repo (and
 * `data/grammars/core.test.ts` guards the shipped keys), so a miss is always an authoring typo —
 * better a loud failure than a silently skewed distribution.
 */
function resolvePhaseAttribute(phase: PhaseCharacteristics, path: string): number {
	let current: unknown = phase;

	for (const segment of path.split('.')) {
		if (current === null || typeof current !== 'object' || !(segment in current)) {
			throw new Error(`phaseInfluence: unknown phase characteristic path '${path}'`);
		}
		current = (current as Record<string, unknown>)[segment];
	}

	if (typeof current !== 'number') {
		throw new Error(
			`phaseInfluence: phase characteristic path '${path}' does not resolve to a number`,
		);
	}

	return current;
}

/**
 * Computes the phase-characteristic weight multiplier for a grammar option (doc 05 §5.4, roadmap
 * 2GN.5) — the `weight *= phaseInfluence(option, phase)` step of `selectGrammarOption`.
 *
 * This is where `GrammarOption.phaseModifiers`' provisional contract firms up. Each
 * `[dottedPath, multiplier]` entry resolves its attribute `a` (0–1) from the phase profile and
 * contributes the factor `1 + (multiplier − 1) × a`: neutral at `a = 0`, the full multiplier at
 * `a = 1`. A multiplier below 1 therefore suppresses in proportion to the attribute (e.g.
 * `formConservatism` damping exotic branches), while "low technology" never suppresses below the
 * base weight — matching doc 05 §3.2's framing that high attributes *increase* probabilities.
 * Entries combine by product.
 *
 * @param option - The grammar option whose `phaseModifiers` (if any) are evaluated.
 * @param phase - The phase profile the option is being drawn under.
 * @returns The combined multiplier; a neutral `1` when the option has no phase modifiers.
 */
export function phaseInfluence(option: GrammarOption, phase: PhaseCharacteristics): number {
	if (option.phaseModifiers === undefined || option.phaseModifiers.size === 0) {
		return 1;
	}

	let factor = 1;
	for (const [path, multiplier] of option.phaseModifiers) {
		const attribute = resolvePhaseAttribute(phase, path);
		factor *= 1 + (multiplier - 1) * attribute;
	}

	return factor;
}

/**
 * The doc 05 §5.4 weight formula: `baseWeight`, shifted additively by each cultural modifier
 * against the culture's material affinities (a missing affinity reads as 0), scaled by
 * `phaseInfluence`, floored at 0.01. The floor ensures nothing is completely impossible — even a
 * deeply pacifist culture occasionally produces a blade. Because archaeology.
 */
function effectiveOptionWeight(
	option: GrammarOption,
	culture: CulturalProfile,
	phase: PhaseCharacteristics,
): number {
	let weight = option.baseWeight;

	for (const [tag, modifier] of option.culturalModifiers) {
		weight += (culture.materialAffinities.get(tag) ?? 0) * modifier;
	}

	weight *= phaseInfluence(option, phase);

	return Math.max(0.01, weight);
}

/**
 * Draws one production alternative from a rule, biased by culture and phase (doc 05 §5.4,
 * roadmap 2GN.4). Culture doesn't dictate what the grammar produces — it biases the
 * probabilities; the 0.01 floor keeps every option reachable, however unlikely.
 *
 * Adapts the doc's pseudocode (a two-arg `weightedSelect` over precomputed pairs) to the real
 * callback-shaped utility in `engine/prng.ts`: effective weights are computed transiently in the
 * `getWeight` callback, never stored. Because the floor keeps every weight positive,
 * `weightedSelect`'s zero-total uniform fallback is unreachable from here.
 *
 * Consumes exactly one `prng()` draw per call regardless of option count — draw ordering is part
 * of the engine's determinism contract, so callers can rely on a fixed number of draws per
 * selection.
 *
 * @param rule - The rule whose options are drawn from. Options must be non-empty.
 * @param culture - The producing culture's profile (`Culture.baseProfile`, not the whole
 *   `Culture`), supplying `materialAffinities`.
 * @param phase - The phase profile in force when the artefact is made.
 * @param prng - A generator from `createPrng`; determinism flows from it alone.
 * @returns The selected option.
 */
export function selectGrammarOption(
	rule: GrammarRule,
	culture: CulturalProfile,
	phase: PhaseCharacteristics,
	prng: () => number,
): GrammarOption {
	return weightedSelect(
		rule.options,
		prng,
		(option) => effectiveOptionWeight(option, culture, phase),
	);
}
