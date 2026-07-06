/**
 * Property visibility model (doc 11 §2.7, doc 05 §1.1, doc 08 §3.1).
 *
 * Every property the generation pipeline produces sits at one of four visibility levels, which
 * govern what the player can perceive, what any agent can reason about, and what exists purely for
 * the engine's own bookkeeping. The lens (doc 04) operates exclusively on observable and inferable
 * properties: it cannot reveal an occluded property and cannot hide an observable one, only
 * reorder, reframe and de-emphasise. Contradictions (doc 06) fire when an agent's interpretation
 * diverges from an occluded property.
 *
 * This module formalises the four levels into a type. Elsewhere in `src/lib/types/` (e.g.
 * `artefact.ts`) the same levels are still expressed as prose JSDoc, `Visibility: observable` and
 * similar, pending a mechanical migration onto `PropertyVisibility`. That migration is explicitly
 * out of scope here; this file only introduces the type and its minimal helpers.
 */

/**
 * The four levels a world-state property can sit at (doc 11 §2.7, doc 05 §1.1, doc 08 §3.1).
 * Ground truth for what an agent's `InterpretiveModel` (roadmap 1FD.19) may ever contain and what
 * the lens (roadmap 1FD.20) may act on.
 */
export type PropertyVisibility =
	| 'observable' // Directly available on encounter, e.g. material composition, NPC published work
	| 'inferable' // Derivable from observable properties through reasoning, e.g. cultural links
	| 'occluded' // Definite, hidden from all agents, e.g. true culture assignments, true functions
	| 'engine-internal'; // No in-world meaning, e.g. PRNG seeds, constraint satisfaction flags

/**
 * All `PropertyVisibility` values, in the order doc 11 §2.7 lists them. Supports iteration and
 * runtime validation (e.g. checking a deserialised string against the vocabulary) without
 * hand-maintaining a second copy of the four literals.
 */
export const PROPERTY_VISIBILITY_VALUES: readonly PropertyVisibility[] = [
	'observable',
	'inferable',
	'occluded',
	'engine-internal',
];

/**
 * Narrows an arbitrary string to `PropertyVisibility`. The minimal runtime counterpart to the
 * type, useful once a boundary (save data, a future authoring tool) needs to validate a value that
 * did not arrive as `PropertyVisibility` already.
 */
export function isPropertyVisibility(value: string): value is PropertyVisibility {
	return (PROPERTY_VISIBILITY_VALUES as readonly string[]).includes(value);
}

/*
 * Deliberately minimal beyond this. Nothing in `src/` yet consumes `PropertyVisibility` at
 * runtime: the existing `Visibility: observable` / `Visibility: occluded` JSDoc annotations
 * scattered through `artefact.ts` are prose, not references to this type, and migrating them onto
 * it is a separate, later task. A branded wrapper, a per-level metadata table, or an
 * ordering/comparison helper would all be speculative until `lens.ts` (roadmap 1FD.20), the first
 * real consumer, gives visibility a concrete shape to design against.
 */
