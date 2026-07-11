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

import type { GrammarOption } from '../../types/grammar.ts';
import type { PhaseCharacteristics } from '../../types/world.ts';

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
