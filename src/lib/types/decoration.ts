/**
 * Decorative grammar type definitions (doc 05 §8.2–§8.3).
 *
 * After the physical structure exists and materials are assigned, a separate decorative grammar
 * runs over the artefact: each structural surface becomes a potential canvas for surface
 * treatments, applied elements and textile elements (doc 05 §8.1–§8.2). Decorative layers can
 * themselves receive further decoration, so `DecorativeLayer` nests recursively (doc 05 §8.3) —
 * layering depth is capped by the culture's `craftSpecialisation` and `aesthetics.decorativeEmphasis`
 * (doc 05 §8.3), enforced by the decorative grammar's runtime expansion in
 * `engine/generation/decoration.ts` (roadmap 2GN.33), not by this module. Decoration feeds into
 * the same unified tag classification as structural features (doc 05 §8.1, §9) via
 * `ExtractedFeatures` in artefact.ts. This module is data shapes only, no behaviour.
 *
 * Material prerequisites (the `[requires: ...]` annotations on the BNF grammar, doc 05 §8.2) are
 * out of scope here — they are enforced by `data/decorations.ts` (roadmap 2GN.28) and the
 * decorative grammar's expansion logic (roadmap 2GN.30), not represented as a type in this file.
 */

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

	/** Further decoration applied on top of this layer (doc 05 §8.3). Empty when undecorated. */
	sublayers: DecorativeLayer[];
}
