/**
 * Decorative grammar type definitions (doc 05 §8.2–§8.3).
 *
 * After the physical structure exists and materials are assigned, a separate decorative grammar
 * runs over the artefact: each structural surface becomes a potential canvas for surface
 * treatments, applied elements and textile elements (doc 05 §8.1–§8.2). Decorative layers can
 * themselves receive further decoration, so `DecorativeLayer` nests recursively (doc 05 §8.3) —
 * nesting depth is roadmap 2GN.31, unbuilt (every shipped layer's `sublayers` is `[]`). Doc 05
 * §8.3's "how decorated is this" and "how refined is this" axes are instead realised flat, split
 * across two independent mechanisms (roadmap 2GN.98, doc 11 §1.5): `decorationVolume` (how many
 * layers appear, driven by `aesthetics.decorativeEmphasis` alone) and each layer's own `grade`
 * (how well-executed it is, driven by `society.craftSpecialisation` and the technique's own
 * difficulty) — both in `engine/generation/decoration.ts`. Decoration feeds into the same unified
 * tag classification as structural features (doc 05 §8.1, §9) via `ExtractedFeatures` in
 * artefact.ts. This module is data shapes only, no behaviour.
 *
 * Material prerequisites (the `[requires: ...]` annotations on the BNF grammar, doc 05 §8.2) are
 * typed below as `DecorativeSubstrate`/`DecorativeTechniqueDefinition` (roadmap 2GN.28), populated
 * as data in `data/decorations.ts`. Enforcing them against a target component's assigned material —
 * `enforceSubstrates` (`engine/generation/decoration.ts`, roadmap 2GN.30) — is not this module's
 * job. `enforceSubstrates` enforces `kind: 'material'` substrates only; resolving a `kind: 'form'`
 * substrate against a component's geometry is a separate follow-on (roadmap 2GN.104).
 */

import type { MaterialDefinition } from './artefact.ts';

/**
 * The sixteen terminals of the decorative grammar's three productions (doc 05 §8.2) — a flat
 * union rather than a discriminated one, since `DecorativeLayer` carries only generic
 * `motifRef?`/`material?` slots and has no field for a technique's other BNF arguments (e.g.
 * `painting`'s pigment, `overlay`'s coverage, `studs`'/`wrapping`'s pattern). Inventing fields for
 * those would go beyond what doc 05 §8.3 specifies. Grouped below by BNF category; the grouping
 * is expressed only as comments, since the doc does not name the three categories as separate
 * types.
 */
export type DecorativeTechnique =
	// surface-treatment (doc 05 §8.2)
	| 'polish'
	| 'patina'
	| 'roughening'
	| 'scoring'
	| 'engraving' // [requires: hard material]
	| 'relief' // [requires: thick material]
	| 'painting' // [requires: solid surface]
	| 'glaze' // [requires: ceramic]
	// applied-element (doc 05 §8.2)
	| 'inlay' // [requires: engravable surface]
	| 'overlay' // [requires: rigid surface]
	| 'studs' // [requires: rigid or leather]
	| 'wire-wrapping' // [requires: grippable form]
	| 'gilding' // [requires: metal surface]
	// textile-element (doc 05 §8.2)
	| 'wrapping' // [requires: grippable form]
	| 'tassels'
	| 'beading'; // [requires: attachment point]

/**
 * One act of decorative craft applied to a component (doc 05 §8.3) — a bronze panel gets
 * engraved; the engraved channels get silver inlay; the silver inlay gets its own chased pattern,
 * each an entry in `sublayers`. The nesting sequence itself is meaningful: if a base layer uses
 * one culture's motifs and a sublayer uses another's, that tells a story of contact, reworking or
 * appropriation that the player must notice unaided (doc 05 §8.4) — nothing in this shape flags
 * it. Visibility: observable (the decoration is physically present on the artefact), but the
 * temporal ordering between layers and the cultural story it implies is inferable, not stated.
 */
export interface DecorativeLayer {
	/** Id of the `NormalisedComponent` (artefact.ts) this layer is applied to. */
	targetComponentId: string;

	/** Which of the sixteen decorative grammar terminals this layer applies (doc 05 §8.2). */
	technique: DecorativeTechnique;

	/**
	 * Motif drawn from the source culture's motif vocabulary, when this technique carries one (doc
	 * 05 §8.5) — references an entry in that culture's `MotifSet.motifs` (`world.ts`, roadmap
	 * 1FD.14). Two cultures sharing motifs via cultural exchange create genuine interpretive
	 * ambiguity over which culture an artefact belongs to (doc 05 §8.5). Absent for techniques that
	 * carry no motif (e.g. `polish`, `patina`).
	 */
	motifRef?: string;

	/** The material this layer introduces, when the technique adds one (e.g. `inlay`, `gilding`). */
	material?: string;

	/**
	 * How well this specific layer was executed, `0`–`1` (roadmap 2GN.98, doc 11 §1.5). Not a
	 * free-standing "how skilled is this culture" figure — it is the producing phase's
	 * `craftSpecialisation` scaled by `technique`'s own execution difficulty
	 * (`TECHNIQUE_DIFFICULTY`, `data/decorations.ts`), so the same craft level yields a materially
	 * lower grade on a hard technique (gilding, inlay) than on an easy one (roughening, patina).
	 * This is `expandDecoration`'s realisation of doc 05 §8.3's "technically refined vs simple
	 * techniques" distinction — a per-layer quality dimension separate from `decorationVolume`
	 * (how much decoration appears), which reads `aesthetics.decorativeEmphasis` alone. See
	 * `computeLayerGrade` (`engine/generation/decoration.ts`).
	 *
	 * **The value `expandDecoration` sets is provisional** (roadmap 2GN.99): components carry no
	 * assigned material at expansion time, so it reflects the technique alone. `gradeDecorativeLayers`
	 * refines it against the material each component was actually assigned — engraving iron and
	 * engraving gold are not equally difficult, and the refined value says so.
	 */
	grade: number;

	/** Further decoration applied on top of this layer (doc 05 §8.3). Empty when undecorated. */
	sublayers: DecorativeLayer[];
}

/**
 * A technique's doc 05 §8.2 `[requires: ...]` prerequisite, split by what it's checkable against.
 * Most prerequisites resolve against the target component's assigned material alone (`'material'`
 * — e.g. engraving's "hard material"), reusing the pre-resolved `decorability`/`physicalProperties`
 * facts on `MaterialDefinition` rather than re-deriving them; `enforceSubstrates`
 * (`engine/generation/decoration.ts`, roadmap 2GN.30) enforces these. A few prerequisites are about
 * the component's geometry, not its material (`'form'` — e.g. wire-wrapping's "grippable form"): no
 * amount of material data answers whether a shape is grippable, so these are only labelled here;
 * resolving them against a `NormalisedComponent` is unbuilt (roadmap 2GN.104) — `enforceSubstrates`
 * passes `'form'`-gated layers through unevaluated until that lands.
 */
export type DecorativeSubstrate =
	| { kind: 'none' }
	| {
		kind: 'material';
		/** Human-readable form of the doc 05 §8.2 `requires:` clause (e.g. `'hard material'`). */
		label: string;
		/** Whether a candidate material satisfies this technique's prerequisite. */
		test: (material: MaterialDefinition) => boolean;
	}
	| {
		kind: 'form';
		/** The geometric property required; resolving it against the component is roadmap 2GN.104. */
		requires: 'grippable' | 'attachment-point';
	};

/**
 * Static facts about one of the sixteen decorative grammar terminals (doc 05 §8.2): which BNF
 * production it belongs to, its material/form prerequisite, and whether its grammar form carries a
 * `<motif>` argument or introduces new material — both of which `DecorativeLayer`'s `motifRef`/
 * `material` fields need populated when the grammar expands a layer (roadmap 2GN.29/2GN.33).
 */
export interface DecorativeTechniqueDefinition {
	/** Which grammar terminal this defines; joins to `DecorativeLayer.technique`. */
	technique: DecorativeTechnique;

	/** Which of the three BNF productions (doc 05 §8.2) this terminal belongs to. */
	category: 'surface-treatment' | 'applied-element' | 'textile-element';

	/** The technique's `[requires: ...]` prerequisite, if any (doc 05 §8.2). */
	substrate: DecorativeSubstrate;

	/** Whether this technique's grammar form takes a `<motif>` argument (doc 05 §8.2, §8.5). */
	carriesMotif: boolean;

	/** Whether this technique's grammar form introduces a new material onto the artefact. */
	introducesMaterial: boolean;
}
