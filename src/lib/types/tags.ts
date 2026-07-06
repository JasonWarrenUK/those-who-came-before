/**
 * Classification tag vocabulary and claim-magnitude type definitions (doc 05 §4.6, §9.1–§9.2).
 *
 * Tags describe an artefact's function and use, scored from extracted features by rule-based
 * classification (Stage 8, doc 05 §9). Tags are deliberately not mutually exclusive — an object
 * can score on `weapon`, `ritual` and `elite` simultaneously; the engine never resolves the
 * overlap, the player does. `ClaimMagnitude` is a separate axis entirely: how a published claim
 * sits against the professional corpus (doc 05 §4.6), not a property of the artefact itself.
 */

import type { ExtractedFeatures } from './artefact.ts';

/**
 * What an object was FOR — its physical/social purpose (doc 05 §9.2). Not mutually exclusive with
 * other function tags or with `ContextTag`.
 */
export type FunctionTag =
	| 'weapon'
	| 'tool'
	| 'container'
	| 'fastener'
	| 'ornament'
	| 'ritual'
	| 'domestic'
	| 'agricultural'
	| 'maritime'
	| 'funerary'
	| 'votive'
	| 'trade-good'
	| 'currency';

/**
 * How an object was USED — its social register of use, distinct from `FunctionTag` (doc 05 §9.2).
 * Not the same axis as deposition context (`DepositionType`, doc 05 §3.3) — this describes use,
 * not how the artefact ended up in the ground.
 */
export type ContextTag =
	| 'personal'
	| 'communal'
	| 'elite'
	| 'utilitarian'
	| 'ceremonial'
	| 'everyday'
	| 'military'
	| 'artisanal';

/**
 * The material vocabulary components and materials are tagged with (doc 05 §9.2). Used both for
 * `MaterialDefinition.tags` (what a material is) and `NormalisedComponent.allowedMaterialTags`
 * (what a component can physically be made from) — see doc 05 §6.1.
 */
export type MaterialTag =
	| 'bone'
	| 'wood'
	| 'stone'
	| 'metal'
	| 'clay'
	| 'glass'
	| 'fiber'
	| 'leather'
	| 'precious-stone'
	| 'precious-metal';

/**
 * One feature→tag scoring contribution (doc 05 §9.2). `classifyArtefact` (roadmap 2GN.20) folds
 * every rule whose `condition` matches into a single `Map<FunctionTag | ContextTag, number>` of
 * accumulated scores — structural, decorative and cross-layer rules all contribute to the same
 * map, which is how a single artefact can score on multiple, overlapping tags at once.
 */
export interface ClassificationRule {
	/** Predicate over the artefact's unified extracted features (doc 05 §9.1). */
	condition: (features: ExtractedFeatures) => boolean;

	/** Tag contributions this rule adds when `condition` matches, keyed by tag with a weight. */
	tags: Map<FunctionTag | ContextTag, number>;
}

/**
 * How a published claim sits against the professional corpus's established consensus (doc 05
 * §4.6) — impact and scrutiny scale together as magnitude increases, from safe agreement to a
 * first-documented, maximally-scrutinised finding.
 */
export type ClaimMagnitude =
	| 'confirmation'
	| 'extension'
	| 'challenge'
	| 'novel';
