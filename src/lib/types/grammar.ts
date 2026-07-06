/**
 * Structural grammar type definitions (doc 05 §5.3–§5.5).
 *
 * The bottom-up component grammar produces physical structures, never functional categories
 * (doc 05 §5.1): geometric primitives and their spatial relationships, with classification left
 * entirely downstream. These types describe the grammar's rules and options — the weighted,
 * culture-biased production system — plus the arrangement and accumulation constraints that keep
 * repeated components sane. The grammar's runtime expansion lives in `engine/generation/grammar.ts`
 * (roadmap 2GN.3–2GN.10); this module is data shapes only, no behaviour.
 */

import type { MaterialTag } from './tags.ts';

/**
 * The nine ways one component fastens to another — the terminals of the grammar's `<attachment>`
 * production (doc 05 §5.3). Purely physical join descriptions; they carry no functional meaning.
 */
export type AttachmentType =
	| 'inline'
	| 'perpendicular'
	| 'socketed'
	| 'riveted'
	| 'wrapped'
	| 'lashed'
	| 'hinged'
	| 'threaded'
	| 'friction-fit';

/**
 * How a repeated component type is laid out within a single object (doc 05 §5.5). A discriminated
 * union on `type`: `symmetric` enumerates the exact counts that read as deliberate (e.g. `[2, 4,
 * 6]`); every other pattern gives an inclusive `[min, max]` range instead. Keep this asymmetry —
 * accumulation checking (roadmap 2GN.6) depends on `symmetric` being an allow-list and the rest
 * being ranges, not a uniform shape.
 */
export type ArrangementPattern =
	| { type: 'symmetric'; validCounts: number[] } // e.g. [2, 4, 6]
	| { type: 'radial'; countRange: [number, number] } // e.g. 3–12
	| { type: 'linear-array'; countRange: [number, number] } // e.g. 2–8
	| { type: 'stacked'; countRange: [number, number] } // e.g. 2–5
	| { type: 'nested'; countRange: [number, number] } // e.g. 2–4
	| { type: 'branching'; countRange: [number, number] }; // e.g. 2–6

/**
 * Limits on how many, and how varied, the arrangement groups within one object may be (doc 05
 * §5.5). The culture's `craftSpecialisation` determines the complexity budget that populates
 * these fields: simple cultures get 1–2 groups and basic patterns only; sophisticated cultures
 * unlock nesting and branching. Enforced by accumulation checking (roadmap 2GN.6).
 */
export interface AccumulationConstraints {
	/** Maximum number of distinct arrangement groups in the object. From `craftSpecialisation`. */
	maxDistinctGroups: number;

	/** Maximum repeated components permitted within any single arrangement group. */
	maxComponentsPerGroup: number;

	/** When true, no two arrangement groups may repeat the same component type. */
	noTwoGroupsSameType: boolean;

	/** The arrangement patterns available under this culture's complexity budget. */
	patterns: ArrangementPattern[];
}

/**
 * A single production alternative for a grammar rule (doc 05 §5.4) — one thing the rule's
 * non-terminal can expand into, with the weights that bias how often it is chosen.
 *
 * `selectGrammarOption` (roadmap 2GN.4) computes an effective weight per option at expansion time
 * — starting from `baseWeight`, shifting it by `culturalModifiers` against the culture's material
 * affinities, then scaling by `phaseInfluence` — so no precomputed effective weight is stored
 * here; it's derived transiently and fed to `weightedSelect` (`src/lib/engine/prng.ts`) via that
 * function's `getWeight` callback. Doc 05 §5.4's own pseudocode shows a simplified two-arg
 * `weightedSelect(weighted, prng)` over precomputed `{option, effectiveWeight}` pairs; the real
 * utility takes a `getWeight` callback instead, so don't expect to find that param in the doc.
 */
export interface GrammarOption {
	/**
	 * The grammar symbol this option expands to — a primitive non-terminal (e.g. `'elongated'`),
	 * another rule's `symbol`, or a terminal. `expandGrammar` (roadmap 2GN.3) resolves it: a
	 * symbol matching another rule's `symbol` recurses; anything else is a leaf primitive whose
	 * parameter set is defined in `data/grammars/primitives.ts` (roadmap 2GN.1).
	 *
	 * Provisional: doc 05 §5.4 never specifies how an option names its expansion target — this is
	 * the minimal shape that lets `expandGrammar` do its job. Expect this to firm up at 2GN.3.
	 */
	expandsTo: string;

	/** Baseline selection weight before cultural and phase modifiers (doc 05 §5.4). */
	baseWeight: number;

	/**
	 * Per-material-tag weight adjustments (doc 05 §5.4). Iterated as `[MaterialTag, number]` pairs
	 * and added to the running weight as `affinity * modifier`, so the key type matches
	 * `CulturalProfile.materialAffinities`. A positive modifier makes the option likelier for
	 * cultures that favour that material; negative suppresses it.
	 */
	culturalModifiers: Map<MaterialTag, number>;

	/**
	 * Optional phase-characteristic weight multipliers, read by `phaseInfluence` (roadmap 2GN.5)
	 * to scale the option against a `PhaseCharacteristics` profile (doc 05 §3.2) — e.g. a
	 * metal-bearing primitive keyed on `'technology.metallurgy'`.
	 *
	 * Provisional: doc 05 §5.4 shows only the call `phaseInfluence(option, phase)` and never
	 * specifies the field it reads. Keyed by dotted `PhaseCharacteristics` path as the minimal
	 * shape that lets 2GN.5 look up an attribute and multiply; expect this to firm up there.
	 * Optional so an option can opt out of phase bias (`phaseInfluence` returns a neutral `1` when
	 * absent).
	 */
	phaseModifiers?: Map<string, number>;
}

/**
 * One production rule of the component grammar (doc 05 §5.3–§5.4): a non-terminal `symbol` and
 * the weighted `options` it can expand into.
 *
 * `expandGrammar` (roadmap 2GN.3) receives a collection of rules and looks them up by `symbol`
 * while walking the tree, so the symbol is the rule's identity, not decoration.
 * `selectGrammarOption` (roadmap 2GN.4) then draws one option from `options` using the seeded
 * PRNG.
 */
export interface GrammarRule {
	/**
	 * The non-terminal this rule defines, matching the BNF left-hand side without brackets (e.g.
	 * `'object'`, `'component-group'`, `'primary-component'` from doc 05 §5.3). Referenced by
	 * `GrammarOption.expandsTo` to wire the grammar together.
	 */
	symbol: string;

	/** The production alternatives, drawn from by weighted selection (doc 05 §5.4). Non-empty. */
	options: GrammarOption[];
}
