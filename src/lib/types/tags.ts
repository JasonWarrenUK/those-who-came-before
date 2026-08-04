/**
 * Classification tag vocabulary and claim-magnitude type definitions (doc 05 §4.6, §9.1–§9.2).
 *
 * Tags describe what an artefact is and how it was used, scored from extracted features by
 * rule-based classification (Stage 8, doc 05 §9). Tags are deliberately not mutually exclusive —
 * an object can score on `weapon`, `ritual` and `elite` simultaneously; the engine never resolves
 * the overlap, the player does. `ClaimMagnitude` is a separate axis entirely: how a published
 * claim sits against the professional corpus (doc 05 §4.6), not a property of the artefact itself.
 *
 * **The vocabulary is partitioned by scoring basis, not by what a tag describes** (roadmap
 * 2GN.80/2GN.77, doc 11 §2.9, doc 12 §2.28). `AbsoluteTag` members are scored against fixed
 * thresholds that mean the same thing in every culture; `RelativeTag` members are scored against
 * baselines sampled from the producing culture-phase. This replaced an earlier `FunctionTag`
 * (what an object was FOR) / `ContextTag` (how it was USED) split, which cut the vocabulary on an
 * axis nothing branched on while leaving the axis that governs scoring implicit. Anything wanting
 * the old FOR/USED distinction should read the per-tag JSDoc rather than the array a tag sits in.
 */

import type { ExtractedFeatures } from './artefact.ts';

/**
 * Tags scored against fixed thresholds, identical in every culture (doc 11 §2.9).
 *
 * Membership test: could a scholar from any culture, shown only the object, reach this tag from
 * its physical affordances alone? An edge cuts, a vessel holds, a wearable thing is worn — these
 * are facts about the artefact. Nothing here needs to know what the producing culture considered
 * normal, so `ClassificationRule.condition` scores them without consulting `ClassificationContext`
 * baselines.
 *
 * The runtime array is the single source of truth: `AbsoluteTag` derives from it, and
 * `classifyArtefact` (roadmap 2GN.20) uses declaration order (absolute tags before relative ones)
 * to sort scored tag maps deterministically, so serialised maps never churn when rules reorder.
 */
export const ABSOLUTE_TAGS = [
	'weapon',
	'tool',
	'container',
	'fastener',

	/**
	 * Worn or carried for display. Scored from morphology (`isWearable`, `perforation`, `ringGap`),
	 * never from decorative volume — "is a wearable thing" is objective, while "is a *lavish*
	 * wearable thing" is `elite`, which is relative.
	 *
	 * ⚠️ `ExtractedFeatures.isWearable` is broader than this tag: it means "reads as worn on the
	 * body", which covers clothing and textile fittings as much as adornment. Nothing is
	 * misclassified today because the grammar rolls no clothing forms, but a rule keying
	 * `isWearable` straight to `ornament` will start over-firing the moment it does. Splitting
	 * worn-for-display from worn-for-covering is the fix, not moving this tag.
	 */
	'ornament',

	/** Household/food-preparation use, scored from container morphology and mass, not social register. */
	'domestic',

	'agricultural',
	'maritime',

	/**
	 * Moved between cultures before deposition. Scored from `motifCulturalOrigins.length > 1`: the
	 * object carries motifs from more than one culture, which is a fact about the artefact rather
	 * than a judgement about its worth.
	 */
	'trade-good',

	/** No grammar signal keys this at MVP (see `data/classification.ts`); reserved for later work. */
	'currency',
] as const;

/**
 * A tag whose meaning is fixed across the world — scored the same way regardless of which culture
 * produced the artefact (doc 11 §2.9).
 */
export type AbsoluteTag = (typeof ABSOLUTE_TAGS)[number];

/**
 * Tags scored against baselines sampled from the producing culture-phase (doc 11 §2.9).
 *
 * Membership test: does this tag assert something about the artefact's standing among its
 * culture's other output? "Lavish", "everyday" and "ceremonial" are comparative claims and mean
 * nothing without knowing what that culture's ordinary looks like. Scoring these against a fixed
 * threshold is the defect the ruling corrects: it makes a decorative culture read as composed
 * almost entirely of elites and an austere one as having none, which reports the culture's
 * aesthetics rather than any real distinction within it (a Simulation Honesty violation, doc 02).
 *
 * `ClassificationRule.condition` receives `ClassificationContext` carrying the culture-phase
 * baselines these are scored against. See `ABSOLUTE_TAGS` for the ordering contract.
 */
export const RELATIVE_TAGS = [
	'personal',
	'communal',
	'elite',
	'utilitarian',
	'ceremonial',
	'everyday',

	/**
	 * Martial register, distinct from `weapon`. An edge on a long body is objectively a weapon;
	 * whether the object signals a warrior class depends on whether the culture has one. Rigid
	 * sheet reads armour in a stratified culture and roofing in a flat one, so the rule keying
	 * `sheetFlexibility` needs the baseline.
	 */
	'military',

	'artisanal',

	/**
	 * Religious use. Scored from decorative excess, so it inherits the same phase-sensitivity as
	 * `elite`: what counts as "elaborated beyond ordinary use" is a per-culture question.
	 */
	'ritual',

	/** Deposited as an offering. Inferred from sealed-container morphology read against local norms. */
	'votive',

	/**
	 * Grave goods. Relative despite deposition being an objective event, because this tag is an
	 * *inference about intent* from morphology, not the deposition record itself — `DepositionType`
	 * (doc 05 §3.5) is the objective axis and stays separate. What reads as a burial deposit is as
	 * norm-dependent as what reads as votive, and both are awarded by the same rule.
	 */
	'funerary',
] as const;

/**
 * A tag asserting the artefact's standing relative to its culture's own norms — scored against
 * baselines sampled per culture-phase (doc 11 §2.9).
 */
export type RelativeTag = (typeof RELATIVE_TAGS)[number];

/** Any classification tag, from either scoring basis. */
export type ArtefactTag = AbsoluteTag | RelativeTag;

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
 * every rule whose `condition` matches into a single `Map<ArtefactTag, number>` of accumulated
 * scores — structural, decorative and cross-layer rules all contribute to the same map, which is
 * how a single artefact can score on multiple, overlapping tags at once.
 *
 * A rule may award tags from both scoring bases at once, and many do: R11 awards `container`
 * (absolute) alongside `votive` and `funerary` (relative) from one sealed-container condition.
 * The basis is a property of each awarded tag, not of the rule, so a rule awarding any
 * `RelativeTag` needs culture-phase baselines even when its condition reads purely physical
 * features (doc 11 §2.9 — this is what catches the thin-walled-container and pedestal-base rules).
 */
export interface ClassificationRule {
	/** Predicate over the artefact's unified extracted features (doc 05 §9.1). */
	condition: (features: ExtractedFeatures) => boolean;

	/** Tag contributions this rule adds when `condition` matches, keyed by tag with a weight. */
	tags: Map<ArtefactTag, number>;
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
