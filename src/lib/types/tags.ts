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
 * Which `ExtractedFeatures` fields carry a sampled baseline (roadmap 2GN.95, doc 11 §2.9).
 *
 * Deliberately a closed union, not `keyof ExtractedFeatures`: a percentile over `hasEdge` or
 * `openingType` is meaningless, and a key type that admitted them would let a rule ask a question
 * the sampler cannot answer. `decorativePerPart` is derived (`decorativeComplexity / partCount`,
 * guarded at `partCount` 0) — the sampler computes it once per artefact, matching how a migrated
 * rule computes it once when reading `ExtractedFeatures`. `meanDecorativeGrade` (roadmap 2GN.98)
 * carries genuine within-culture-phase spread — unlike a `craftSpecialisation`-only reading, which
 * would be identical for every artefact from one phase — because it is driven by which mix of
 * techniques an artefact happened to roll, each with its own execution difficulty.
 */
export type BaselineFeature =
	| 'decorativeLayerCount'
	| 'decorativeComplexity'
	| 'techniqueComplexity'
	| 'appliedElementCount'
	| 'decorativePerPart'
	| 'partCount'
	| 'attachmentDiversity'
	| 'edgeCount'
	| 'meanDecorativeGrade';

/**
 * One feature's empirical distribution across a culture-phase's own output (doc 11 §2.9).
 *
 * Stored as already-evaluated fractional thresholds at the fixed `PERCENTILE_LADDER` rungs
 * (`engine/statistics.ts`), not as the raw sample: the sample is `sampleSize` numbers per feature
 * per culture-phase, while the ladder is five. Thresholds are fractional and a migrated rule
 * compares `value >= threshold`, so the cut point moves continuously with the culture rather than
 * snapping between the integer values a raw count could only interpolate between.
 */
export interface FeatureBaseline {
	/** Percentile → fractional threshold. Keys are `PERCENTILE_LADDER` rungs. */
	thresholds: ReadonlyMap<number, number>;

	/** How many artefacts the distribution was sampled from (doc 11 §2.9: n=400). */
	sampleSize: number;
}

/**
 * Culture-phase baselines a `ClassificationRule.condition` scores `RelativeTag` awards against
 * (doc 11 §2.9, doc 12 §2.28, roadmap 2GN.95).
 *
 * Carries only what a rule reads. It deliberately does **not** carry the producing
 * `CulturalProfile`, `PhaseCharacteristics` or geology: a rule that could reach those could branch
 * on `decorativeEmphasis` directly and reintroduce exactly the phase-sensitivity the ruling exists
 * to remove (`data/classification.ts`'s module JSDoc). The baselines *are* the culture, as far as a
 * rule is concerned.
 *
 * `PhaseCharacteristics.society.stratification` is ruled a live input in its own right (doc 11
 * §2.9), gating how much `elite` can exist at all independent of any one distribution — but it has
 * no field here. Nothing reads it until roadmap 2GN.96 (blocked on 3WS.9's real `WorldState`);
 * declaring it here unread would be a lie the type tells.
 */
export interface ClassificationContext {
	/** Which culture-phase these baselines were sampled from, for provenance and debugging. */
	readonly cultureId: string;
	readonly phaseId: string;

	/** Per-feature sampled distributions. A missing entry means the feature was not sampled. */
	readonly baselines: ReadonlyMap<BaselineFeature, FeatureBaseline>;

	/**
	 * Whether `value` sits at or above this culture-phase's `percentile` for `feature`.
	 *
	 * The single call a migrated rule makes. `percentile` must be a `PERCENTILE_LADDER` rung — an
	 * off-ladder value throws, loudly, rather than interpolating between rungs and silently
	 * inventing a threshold nobody measured.
	 *
	 * **Returns `false` when `feature` has no baseline**, rather than falling back to an absolute
	 * constant. A silent absolute fallback is the precise defect the culture-relativity ruling
	 * exists to remove, and it would be invisible under `classifyArtefact`'s plain-sum fold — no
	 * baseline reads as no evidence, not as a guess.
	 */
	exceeds(feature: BaselineFeature, percentile: number, value: number): boolean;

	/** Whether `feature` carries a sampled baseline at all. */
	hasBaseline(feature: BaselineFeature): boolean;
}

/**
 * The material vocabulary components and materials are tagged with (doc 05 §9.2). Used both for
 * `MaterialDefinition.tags` (what a material is) and `NormalisedComponent.allowedMaterialTags`
 * (what a component can physically be made from) — see doc 05 §6.1.
 *
 * **Every member names a material class — what a material *is*, observably and independently of any
 * culture's opinion of it.** `precious-metal` and `precious-stone` were members until roadmap
 * 2GN.78 retired them (doc 11 §2.9, doc 12 §2.40): they asserted social valuation, not physical
 * character, which is the Earth-judgement stamp 2GN.77 ruled against — a culture with abundant gold
 * does not read gold as precious. Preciousness is derived from the material's *situation*
 * (availability × cultural affinity × provenance × stratification), never carried as a catalogue
 * fact. Anything a precious tag was doing is now done by data that was already modelled: physical
 * character by `MaterialDefinition.physicalProperties`/`reactivity`, scarcity by
 * `GeologicalContext.materialAvailability`, and a specific material's reachability by a
 * `MaterialFlow`'s `{ id }` selector (`world.ts`).
 *
 * **Adding a member that names a judgement rather than a class re-opens that defect.** The test is
 * whether two cultures looking at the same material would agree on the tag. `metal` passes;
 * `precious-metal` did not.
 *
 * ⚠️ `MaterialTag` and `ArtefactTag` are unrelated vocabularies that happen to share the word "tag".
 * Doc 12 §2.28 once booked a re-key of doc 12 §2.22's `MaterialTag` sets against this ruling on that
 * basis — there was nothing to re-key, since those sets were never in the retired
 * `FunctionTag`/`ContextTag` vocabulary `ArtefactTag` replaced. Don't repeat the conflation.
 */
export type MaterialTag =
	| 'bone'
	| 'wood'
	| 'stone'
	| 'metal'
	| 'clay'
	| 'glass'
	| 'fiber'
	| 'leather';

/**
 * Every shipped material id (`data/materials.ts`, doc 05 §7 §15). The join key wherever one
 * material is named: `MaterialDefinition.id`, `GeologicalContext.materialAvailability`'s key,
 * `RegionalAvailability.materialId`, and `MaterialSelector`'s `id` arm (`world.ts`).
 *
 * Declared here rather than derived from `MATERIALS` because the dependency runs one way:
 * `data/materials.ts` imports its `MaterialDefinition` from `types/`, so `types/` importing the
 * catalogue back would cycle. **The two are therefore kept in step by test, not by construction** —
 * `materials.test.ts` pins both directions (every name has a definition, every definition has a
 * name), so adding a material means editing this list too and the suite fails loudly until you do.
 *
 * ⚠️ `bone`, `glass` and `leather` are each *both* a `MaterialTag` and a `MaterialName`, naming a
 * class and a specific material with the same string. That collision is why `MaterialSelector`
 * tags its arms (`{ tag: 'bone' }` reaches bone and antler; `{ id: 'bone' }` reaches bone alone)
 * instead of accepting a bare string, which could not tell the two apart.
 */
export const MATERIAL_NAMES = [
	'bronze',
	'iron',
	'gold',
	'silver',
	'obsidian',
	'flint',
	'granite',
	'jade',
	'oak',
	'ash',
	'bone',
	'antler',
	'fired-clay',
	'glass',
	'linen',
	'leather',
] as const;

/** One shipped material's id — see `MATERIAL_NAMES`. */
export type MaterialName = (typeof MATERIAL_NAMES)[number];

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
 *
 * `condition` takes a `ClassificationContext` alongside `features` (roadmap 2GN.95, widening §2.20's
 * pure-function contract per doc 12 §2.28 — the predicate stays pure, only its arity grows). A rule
 * that has not yet been migrated to a relative threshold (roadmap 2GN.82) simply ignores the second
 * parameter; TypeScript accepts a narrower-arity function wherever this wider signature is expected.
 */
export interface ClassificationRule {
	/** Predicate over the artefact's unified extracted features and its culture-phase baselines. */
	condition: (features: ExtractedFeatures, context: ClassificationContext) => boolean;

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
