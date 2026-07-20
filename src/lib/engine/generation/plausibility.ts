/**
 * Plausibility checking (doc 05 §6.2, roadmap 2GN.12) — the runner for the rule set 2GN.11 shipped
 * in `data/plausibility.ts`. The grammar (§5) and normalisation (§6.1) can produce a structurally
 * flattened `NormalisedArtefact` that is nonetheless physically absurd — an edged blade with
 * nothing to grip, a heavy head lashed rather than rigidly shafted. `checkPlausibility` folds every
 * rule's verdict into one result so the re-expansion loop (roadmap 2GN.16) can decide whether to
 * accept the artefact or re-roll from grammar expansion.
 *
 * **Predicate contract** (fixed by 2GN.11, `types/plausibility.ts`): a `predicate` returns `true`
 * when the artefact VIOLATES the rule. `checkPlausibility` collects the `reason` of every violated
 * predicate rule into `failures`.
 *
 * The result shape mirrors `AccumulationCheckResult` (`engine/generation/grammar.ts`) — a check
 * verdict is engine behaviour, not world data, so it's declared here rather than in `types/`,
 * following that precedent — so the re-expansion loop can treat both checks uniformly.
 *
 * This module adds no new rules; it only runs the rule set given to it (defaulting to
 * `PLAUSIBILITY_RULES`). Physical/ergonomic/material rule content is owned by roadmap 2GN.13–15.
 *
 * Pure and PRNG-free: same artefact and rules, same verdict, no input mutation. A failed check is
 * not an error — the pipeline simply re-expands (roadmap 2GN.16); expansion is cheap.
 */

import type { NormalisedArtefact } from '../../types/artefact.ts';
import type { PlausibilityRule } from '../../types/plausibility.ts';
import { PLAUSIBILITY_RULES } from '../../data/plausibility.ts';

/**
 * The result of checking an artefact against a plausibility rule set. Mirrors
 * `AccumulationCheckResult` (`engine/generation/grammar.ts`) so the re-expansion loop (roadmap
 * 2GN.16) can treat both checks uniformly.
 */
export interface PlausibilityCheckResult {
	/** True when the artefact satisfies every rule in the set. */
	valid: boolean;

	/** Human-readable reasons for rejection, one per violated rule. Empty when valid. */
	failures: string[];
}

/** Components of a given primitive type, in flattened order. */
function componentsOfType(artefact: NormalisedArtefact, primitiveType: string) {
	return artefact.components.filter((component) => component.primitiveType === primitiveType);
}

/**
 * Evaluates one rule against `artefact`, returning a failure message when violated, or `undefined`
 * when satisfied.
 *
 * `material-physics` and `ergonomic` are the live MVP variants (predicate-plus-`reason`, per the
 * 2GN.11 contract). `requires`/`excludes`/`ordering` are declarative and have no MVP instances in
 * `PLAUSIBILITY_RULES` yet — a component-role/classification vocabulary this project doesn't have
 * is what would make them meaningful (see `types/plausibility.ts`) — but are evaluated structurally
 * here regardless, so the runner is complete for whichever variant 2GN.13–15 reach for, and the
 * `switch` stays exhaustive.
 */
function evaluateRule(rule: PlausibilityRule, artefact: NormalisedArtefact): string | undefined {
	switch (rule.type) {
		case 'material-physics':
		case 'ergonomic':
			return rule.predicate(artefact) ? rule.reason : undefined;

		case 'requires': {
			const hasComponent = componentsOfType(artefact, rule.component).length > 0;
			const hasDependency = componentsOfType(artefact, rule.dependsOn).length > 0;
			return hasComponent && !hasDependency
				? `a ${rule.component} requires a ${rule.dependsOn}, which is absent`
				: undefined;
		}

		case 'excludes': {
			const hasComponent = componentsOfType(artefact, rule.component).length > 0;
			const hasExcluded = componentsOfType(artefact, rule.excludes).length > 0;
			return hasComponent && hasExcluded
				? `a ${rule.component} excludes a ${rule.excludes}, but both are present`
				: undefined;
		}

		case 'ordering': {
			const [first] = componentsOfType(artefact, rule.component);
			if (!first) return undefined;

			if (rule.before) {
				const [before] = componentsOfType(artefact, rule.before);
				if (before && first.position >= before.position) {
					return `a ${rule.component} must come before a ${rule.before}`;
				}
			}

			if (rule.after) {
				const [after] = componentsOfType(artefact, rule.after);
				if (after && first.position <= after.position) {
					return `a ${rule.component} must come after a ${rule.after}`;
				}
			}

			return undefined;
		}

		default: {
			const exhaustive: never = rule;
			throw new Error(`unhandled plausibility rule type: ${JSON.stringify(exhaustive)}`);
		}
	}
}

/**
 * Checks a normalised artefact against a plausibility rule set (doc 05 §6.2, roadmap 2GN.12).
 * Iterates `rules` in order, collecting every violated rule's failure message; the artefact is
 * valid when no rule is violated.
 *
 * @param artefact - The normalised artefact to check.
 * @param rules - The rule set to check against. Defaults to the shipped `PLAUSIBILITY_RULES`.
 * @returns The verdict, with a failure message per violated rule.
 */
export function checkPlausibility(
	artefact: NormalisedArtefact,
	rules: readonly PlausibilityRule[] = PLAUSIBILITY_RULES,
): PlausibilityCheckResult {
	const failures: string[] = [];

	for (const rule of rules) {
		const failure = evaluateRule(rule, artefact);
		if (failure) failures.push(failure);
	}

	return { valid: failures.length === 0, failures };
}
