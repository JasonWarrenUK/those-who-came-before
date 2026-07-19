/**
 * Structural plausibility rule definitions (doc 05 §6.2).
 *
 * The grammar (doc 05 §5, `engine/generation/grammar.ts`) and normalisation (doc 05 §6.1, roadmap
 * 2GN.8) can produce a structurally-flattened `NormalisedArtefact` that is nonetheless physically
 * absurd — an edged blade with nothing to grip, a heavy head lashed rather than rigidly shafted, a
 * heavy component perched on a thin-walled vessel. `PlausibilityRule` is the shape a rule takes;
 * the shipped rule set lives in `data/plausibility.ts`. The consumer, `checkPlausibility` (roadmap
 * 2GN.12), folds every rule's verdict into an `{ valid, failures }` result mirroring
 * `AccumulationCheckResult` (`engine/generation/grammar.ts`) so the re-expansion loop (2GN.16) can
 * treat both checks uniformly; on failure the pipeline simply re-expands from Stage 4 (doc 05
 * §6.2 — grammar expansion is fast, re-rolling is cheap).
 *
 * This module is types only, no behaviour — it defines the rule shape, not the checking logic.
 *
 * Five variants, discriminated on `type`:
 * - `requires` / `excludes` / `ordering` are purely declarative, naming components by a plain
 *   `string` (matching `NormalisedComponent.primitiveType`'s convention of staying an untyped
 *   string at this boundary). They can express relationships between whole primitives, but cannot
 *   express a property-level concept like "a grippable component" or "an edged form" — that needs
 *   a component-role/classification vocabulary this project doesn't have yet. Expect few or no MVP
 *   instances of these variants until that vocabulary exists.
 * - `material-physics` / `ergonomic` carry a `predicate` over the whole `NormalisedArtefact` plus a
 *   human-readable `reason`. Predicates can read component `properties`, `dimensions`, and
 *   `attachments`, so they're the variants capable of expressing doc 05 §6.2's own worked examples
 *   (edged-blade grip, long-blade grip length, rigid-shaft attachment, thin-wall load-bearing).
 *   Mirrors the predicate-plus-payload shape of `ClassificationRule` (`types/tags.ts`), the
 *   project's existing precedent for storing a function in rule data.
 *
 * **Predicate contract:** a `predicate` returns `true` when the artefact VIOLATES the rule (i.e.
 * is implausible), pairing naturally with `reason` — "here is why it failed". `checkPlausibility`
 * is expected to collect the `reason` of every predicate that returns `true` into `failures`. Doc
 * 05 §6.2 doesn't state this polarity explicitly; this is the fixed convention for this codebase.
 */

import type { NormalisedArtefact } from './artefact.ts';

export type PlausibilityRule =
	| { type: 'requires'; component: string; dependsOn: string }
	| { type: 'excludes'; component: string; excludes: string }
	| { type: 'ordering'; component: string; before?: string; after?: string }
	| {
		type: 'material-physics';
		/** Returns `true` when `artefact` violates this rule. */
		predicate: (artefact: NormalisedArtefact) => boolean;
		/** Human-readable reason surfaced in `checkPlausibility`'s `failures` on violation. */
		reason: string;
	}
	| {
		type: 'ergonomic';
		/** Returns `true` when `artefact` violates this rule. */
		predicate: (artefact: NormalisedArtefact) => boolean;
		/** Human-readable reason surfaced in `checkPlausibility`'s `failures` on violation. */
		reason: string;
	};
