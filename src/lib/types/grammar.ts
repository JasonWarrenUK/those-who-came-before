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

/** The attachment terminals as a runtime array, in union declaration order. */
export const ATTACHMENT_TYPE_VALUES: readonly AttachmentType[] = [
	'inline',
	'perpendicular',
	'socketed',
	'riveted',
	'wrapped',
	'lashed',
	'hinged',
	'threaded',
	'friction-fit',
];

/**
 * Narrows an arbitrary string to `AttachmentType`. The runtime counterpart to the union per the
 * `visibility.ts` trio precedent — `expandGrammar` (roadmap 2GN.3) uses it to validate that the
 * `attachment` rule's selected option really is a join terminal before recording it as an edge.
 */
export function isAttachmentType(value: string): value is AttachmentType {
	return (ATTACHMENT_TYPE_VALUES as readonly string[]).includes(value);
}

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
	 * another rule's `symbol`, or a terminal. `expandGrammar` (roadmap 2GN.3) resolves it in that
	 * order: a symbol matching another rule's `symbol` recurses; a primitive id becomes a leaf
	 * `ComponentNode` with parameters drawn from `data/grammars/primitives.ts` (roadmap 2GN.1);
	 * attachment terminals are consumed positionally as edge labels when filling the
	 * `[<attachment> <component-group>]*` slot; anything else throws as a grammar authoring error.
	 * (Doc 05 §5.4 never specifies how an option names its expansion target; this resolution
	 * order, firmed at 2GN.3, is the contract.)
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
	 * Optional phase-characteristic weight multipliers, read by `phaseInfluence`
	 * (`engine/generation/grammar.ts`, roadmap 2GN.5) to scale the option against a
	 * `PhaseCharacteristics` profile (doc 05 §3.2) — e.g. a metal-bearing primitive keyed on
	 * `'technology.metallurgy'`.
	 *
	 * Contract (firmed at 2GN.5): each `[dottedPath, multiplier]` entry resolves its attribute
	 * `a` (0–1) and contributes the factor `1 + (multiplier − 1) × a` — neutral at `a = 0`, the
	 * full multiplier at `a = 1`, with `multiplier < 1` suppressing in proportion to the
	 * attribute. Entries combine by product; an unresolvable path throws (authoring typo, caught
	 * loudly). Optional so an option can opt out of phase bias (`phaseInfluence` returns a
	 * neutral `1` when absent).
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

/**
 * A leaf of the grammar tree: one geometric primitive with its physical parameters rolled (doc
 * 05 §5.3 — "each terminal node produces a component with physical properties"). Produced by
 * `expandGrammar` (roadmap 2GN.3), which draws each parameter value uniformly from the
 * primitive's value lists in `data/grammars/primitives.ts` at expansion time, so normalisation
 * (2GN.8) never rolls dice.
 */
export interface ComponentNode {
	/**
	 * The primitive's id (e.g. `'elongated'`). Typed as plain `string` rather than the data
	 * layer's `PrimitiveType` because `types/` must not import from `data/` — the same precedent
	 * as `NormalisedComponent.primitiveType` in `artefact.ts`.
	 */
	primitiveType: string;

	/**
	 * Selected parameter values, keyed by parameter name (e.g. `crossSection` → `'diamond'`).
	 * Narrower than `NormalisedComponent.properties` (`Map<string, string | number>`) — numeric
	 * properties like dimensions are derived at the 2GN.8 flatten, not rolled by the grammar.
	 */
	properties: Map<string, string>;
}

/**
 * One expanded `[<attachment> <component-group>]` slot (doc 05 §5.3): the join terminal as an
 * edge label plus the child group it fastens on. The attachment is purely physical — it carries
 * no functional meaning (doc 05 §5.1).
 */
export interface AttachmentBranch {
	/** How the child group fastens to the parent's primary component. */
	type: AttachmentType;

	/** The attached component group, itself possibly carrying further attachments. */
	child: ComponentGroupNode;
}

/**
 * One expanded `<component-group>`: a primary component and the attachment chain hanging off it
 * (doc 05 §5.3). Recursion depth and breadth are bounded by `expandGrammar`'s provisional
 * repetition policy until accumulation constraints land (roadmap 2GN.6/2GN.7).
 */
export interface ComponentGroupNode {
	/** The group's primary component. */
	primary: ComponentNode;

	/** Zero or more attached child groups, in expansion order. */
	attachments: AttachmentBranch[];
}

/**
 * The grammar tree for one `<object>` (doc 05 §5.3, §6.1): the raw output of `expandGrammar`
 * (roadmap 2GN.3), before accumulation checking (2GN.6) and normalisation (2GN.8).
 *
 * Deliberately carries no ids, dimensions or portability — those are the 2GN.8 flatten's
 * concerns. Keeping the tree this thin makes it a cheap, re-rollable intermediate: when
 * plausibility checking fails, the pipeline just expands again (doc 05 §6.2, roadmap 2GN.16).
 */
export interface ExpandedObject {
	/** The object's component groups, in expansion order. Non-empty (`<component-group>+`). */
	groups: ComponentGroupNode[];
}
