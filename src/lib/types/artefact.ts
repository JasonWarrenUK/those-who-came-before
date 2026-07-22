/**
 * Artefact type definitions for the generation pipeline's structural, material and classification
 * stages (doc 05 §5.2, §6.1, §7, §9). This module is data shapes only — no behaviour.
 *
 * The pipeline flows: the bottom-up grammar (doc 05 §5) produces a tree; normalisation (§6.1)
 * flattens it into a `NormalisedArtefact`; material assignment (§7) and the decorative grammar
 * (§8) enrich it; unified feature extraction and tag classification (§9) fold everything into a
 * `ClassifiedArtefact`. Runtime behaviour for those stages lives under `engine/` (roadmap 2GN.*);
 * e.g. `deriveInspectionDepth(dimensions)` (doc 05 §5.2) maps physical size to `InspectionDepth`
 * (maxExtent <= 30 → 'full', <= 150 → 'detailed', else 'observational') and belongs to the
 * normalisation engine, not this file.
 *
 * Visibility (doc 05 §1.1) is expressed in prose JSDoc per field for now; roadmap 1FD.32 will add
 * a `PropertyVisibility` enum (`observable` | `inferable` | `occluded` | `engine-internal`) that
 * these annotations will migrate onto.
 */

import type { ContextTag, FunctionTag, MaterialTag } from './tags.ts';
import type { ArrangementPattern, AttachmentType } from './grammar.ts';
import type { DecorativeLayer } from './decoration.ts';
import type { PhaseCharacteristics, Provenance } from './world.ts';

/**
 * Where an object sits on the single portability axis (doc 05 §5.2) — the one unambiguous
 * criterion dividing portable artefacts (MVP scope) from non-portable features (deferred). A
 * `team-lift` object is analytically different from a `pocketable` one — harder to move, less
 * likely to have travelled far — but runs through the same grammar, inspection and classification
 * pipeline. Visibility: observable (physical structure is directly perceptible).
 */
export type Portability =
	| 'pocketable' // One hand, negligible effort (ring, coin, small blade)
	| 'one-hand' // Carried in one hand (dagger, cup, brooch)
	| 'two-hand' // Requires both hands (sword, large pot)
	| 'team-lift' // Requires 2–4 people (bronze cauldron, stone slab)
	| 'major-effort'; // Significant labour but IS portable (sarcophagus lid, monumental vessel)

/**
 * How closely a player can examine an artefact, derived from its physical dimensions by
 * `deriveInspectionDepth` (doc 05 §5.2, engine code — roadmap 2GN.*): 'full' = hold and examine
 * closely, 'detailed' = examine but not manipulate freely, 'observational' = observe in situ only.
 * Visibility: observable.
 */
export type InspectionDepth =
	| 'full'
	| 'detailed'
	| 'observational';

/**
 * The overall physical size and heft of an artefact (doc 05 §6.1), feeding both `Portability` and
 * the `deriveInspectionDepth` calculation. Visibility: observable.
 */
export interface ObjectDimensions {
	/** Longest axis, in centimetres. */
	primaryExtent: number;

	/** Perpendicular extent, in centimetres. */
	secondaryExtent: number;

	/** Coarse mass band; artefacts are not weighed to the gram. */
	mass:
		| 'negligible'
		| 'light'
		| 'moderate'
		| 'heavy'
		| 'very-heavy';
}

/**
 * One physical join between two components (doc 05 §6.1) — the flattened form of the grammar's
 * `<attachment>` production (doc 05 §5.3). Purely structural; carries no functional meaning.
 * Visibility: observable.
 */
export interface Attachment {
	/** Id of the component the join originates from. */
	fromComponentId: string;

	/** Id of the component the join connects to. */
	toComponentId: string;

	/** The physical join type (doc 05 §5.3). */
	type: AttachmentType;
}

/**
 * One flattened component of a normalised artefact (doc 05 §6.1) — a geometric primitive with its
 * properties, the material tags it can physically be made from, and its place along the object's
 * primary axis. Visibility: observable.
 */
export interface NormalisedComponent {
	/** Stable id, referenced by `Attachment`, `MaterialAssignment` and `DecorativeLayer`. */
	id: string;

	/** The grammar primitive this came from (e.g. 'elongated', 'cylindrical'; doc 05 §5.3). */
	primitiveType: string;

	/** Primitive parameters (e.g. length, crossSection), keyed by name (doc 05 §5.3). */
	properties: Map<string, string | number>;

	/**
	 * Material tags this component can physically be made from, derived from primitive +
	 * properties by a compatibility table (doc 05 §6.1) — a physical constraint, not a grammar
	 * choice.
	 */
	allowedMaterialTags: MaterialTag[];

	/** Ordering along the object's primary axis. */
	position: number;

	/**
	 * Present when this component is one of a repeated set laid out as an arrangement group (doc
	 * 05 §5.5). Kept inline (see `ArrangementPattern` in grammar.ts). Absent for one-off
	 * components.
	 */
	arrangementGroup?: {
		/** The layout pattern of the group (e.g. symmetric, radial; doc 05 §5.5). */
		pattern: ArrangementPattern;

		/** This component's index within the arrangement. */
		index: number;

		/** Total number of components in the arrangement group. */
		totalInGroup: number;
	};
}

/**
 * A named material the pipeline can assign to a component (doc 05 §7). `assignMaterial` (roadmap
 * 2GN.23) filters candidates by `tags` against a component's `allowedMaterialTags`, then weights
 * the survivors by geological availability, cultural affinity and phase technology.
 * `MaterialAssignment.materialId` references `id`; `displayName` is the observable material
 * identity (doc 05 §1.1). Visibility: observable (material identity).
 *
 * Doc 05 §15 envisions a richer definition carrying geological availability and cultural
 * affinities. Resolved by roadmap 2GN.22: `GeologicalContext.materialAvailability` (world.ts) is
 * already keyed by `id`, and `CulturalProfile.materialAffinities` (world.ts) is already keyed by
 * `MaterialTag` — both are world-generated per-region/per-culture state, so `id` and `tags` are
 * already the join keys those structures need, and duplicating scarcity or affinity values here
 * would create a second source of truth doc 05 never asks for. The one genuinely static
 * per-material fact doc 05 §7/§3.2 implies but doesn't yet type is which
 * `PhaseCharacteristics.technology` axis governs working this material (`craftDomain`) and its
 * baseline workability for decoration prerequisites (`physicalProperties`, `decorability`), both
 * added below. `assignMaterial`/`computeMaterialWeight`/`isAvailable` (2GN.23–25) and decoration
 * prerequisite-checking (2GN.28) remain engine logic and are not implemented here.
 */
export interface MaterialDefinition {
	/** Stable id, referenced by `MaterialAssignment.materialId` and as the key into `GeologicalContext.materialAvailability`. */
	id: string;

	/** Human-readable material name shown to the player (e.g. 'bronze', 'obsidian'). */
	displayName: string;

	/** What this material is, for compatibility filtering against components (doc 05 §7) and as the join key into `CulturalProfile.materialAffinities`. */
	tags: MaterialTag[];

	/**
	 * Which `PhaseCharacteristics.technology` axis (world.ts) governs a culture's capability to
	 * work this material (doc 05 §3.2, §7 point 3 "phase technology"). `computeMaterialWeight`
	 * (2GN.25) reads `phase.technology[craftDomain]` to gate/weight assignment.
	 */
	craftDomain: keyof PhaseCharacteristics['technology'];

	/**
	 * Baseline physical properties consulted by the (future, 2GN.28) decorative grammar when
	 * checking doc 05 §8.2 material prerequisites not already expressible via `tags` alone.
	 *
	 * `hardness` and `workable` are deliberately independent axes: `hardness` is structural
	 * resistance to denting/scratching, `workable` is whether the material can take an incised
	 * line at all. They diverge for soft precious metals, which is why they aren't collapsed
	 * into one property — see `workable`.
	 */
	physicalProperties: {
		/** Structural resistance to denting/scratching. Not itself an engraving prerequisite — see `workable`. */
		hardness: 'soft' | 'medium' | 'hard';

		/**
		 * Whether the material can hold an incised line, satisfying engraving's
		 * `[requires: hard material]` prerequisite (doc 05 §8.2) despite the prerequisite's name.
		 * Independent of `hardness`: gold is `hardness: 'soft'` but `workable: true` (chasing,
		 * repoussé and engraving all work gold fine), while brittle stone like flint stays
		 * `workable: false` regardless of hardness.
		 */
		workable: boolean;
	};

	/**
	 * Which doc 05 §8.2 surface-treatment prerequisite categories this material satisfies,
	 * pre-resolved so a future `decorations.ts` (2GN.28) can check `requires:` clauses without
	 * re-deriving them from `tags`/`physicalProperties` itself.
	 */
	decorability: {
		/** Satisfies engraving's `[requires: hard material]` (doc 05 §8.2). */
		engravable: boolean;

		/** Satisfies painting's `[requires: solid surface]` (doc 05 §8.2). */
		paintable: boolean;

		/** Satisfies glaze's `[requires: ceramic]` (doc 05 §8.2). */
		glazeable: boolean;
	};
}

/**
 * Where a material assignment's raw material likely originated (doc 05 §7.1). Hidden from the
 * player — they see the material and must infer its provenance. A copper artefact from a culture
 * with no local copper is a puzzle: trade, migration, or misattribution? Visibility: inferable
 * (geological provenance), per doc 05 §1.1.
 */
export interface MaterialProvenance {
	/** How the material reached this artefact. */
	source:
		| 'local'
		| 'regional'
		| 'trade'
		| 'unknown';

	/** Best guess at the origin region, when one can be attributed. */
	likelyOriginRegion?: string;

	/** If a trade material, which trade relationship enabled it (doc 05 §7.1). */
	tradePathId?: string;
}

/**
 * A per-component material assignment with its provenance (doc 05 §7.1). One entry per component
 * that has been assigned a material.
 */
export interface MaterialAssignment {
	/** Id of the `NormalisedComponent` this assignment applies to. */
	componentId: string;

	/** Id of the assigned `MaterialDefinition`. */
	materialId: string;

	/** Where the raw material likely came from (doc 05 §7.1). Occluded from the player. */
	provenance: MaterialProvenance;
}

/**
 * The flattened, standardised artefact structure produced by normalisation (doc 05 §6.1) — the
 * grammar's node tree collapsed into ordered components, their attachments, and the whole object's
 * dimensions and portability. The base shape that material, decorative and classification stages
 * extend. Visibility: observable.
 */
export interface NormalisedArtefact {
	/** Stable artefact id. */
	id: string;

	/** The flattened components, ordered by `position` (doc 05 §6.1). */
	components: NormalisedComponent[];

	/** The physical joins between components (doc 05 §6.1). */
	attachments: Attachment[];

	/** Overall size and heft (doc 05 §6.1). */
	dimensions: ObjectDimensions;

	/** Portability band, derived from dimensions and structure (doc 05 §5.2). */
	portability: Portability;

	/** How closely the artefact can be examined, derived from dimensions (doc 05 §5.2). */
	inspectionDepth: InspectionDepth;
}

/**
 * The single unified feature set extracted once across a complete artefact — structure, materials
 * and decorative layers together (doc 05 §9.1). Consumed by classification rules (doc 05 §9.2,
 * `ClassificationRule` in tags.ts) to score function and context tags. Every feature is traceable
 * to its source component or decorative layer for the lens and contradiction systems, but the
 * extraction itself is unified. Physical features are observable; their classificatory weight is
 * occluded (doc 05 §1.1, §9.1).
 *
 * The geometry-derived fields below (`pointSharpness` through `appliedElementPresent`) were added
 * alongside `data/classification.ts` (roadmap 2GN.17) once its rules were derived from first
 * principles against the signals the grammar (`data/grammars/primitives.ts`) actually rolls, rather
 * than from doc 05 §9.2's illustrative examples — the original boolean/complexity fields alone were
 * too coarse to carry that rule set (e.g. distinguishing a paring knife from a dagger needs the
 * edged component's own sharpness and length, not just `hasEdge`). Every new field's exact union
 * matches a real primitive parameter vocabulary; see `classification.ts`'s module JSDoc for the
 * signal-to-field mapping. **Boundary**: `portability`/`inspectionDepth` are mechanical (doc 05
 * §5.2 handling/inspection) and must never be read by a classification rule — `massBand`/`sizeBand`
 * are the physical-fact equivalents rules should use instead (doc 12 propagation register).
 */
export interface ExtractedFeatures {
	// Structural features
	/** Whether any component has a cutting edge. */
	hasEdge: boolean;

	/** How many distinct edges are present. */
	edgeCount: number;

	/** Whether any component comes to a point. */
	hasPoint: boolean;

	/**
	 * The sharpness of that point, finer than `hasPoint` (doc 05 §5.3 `elongated.point`). `'none'`
	 * when `hasPoint` is `false`. Distinguishes a piercing point (awl, spearhead) from a blunt one
	 * (punch, stylus) and, combined with `hasEdge`, a dagger from a cheese knife.
	 */
	pointSharpness: 'none' | 'sharp' | 'blunt';

	/** Whether any component presents a striking/impact surface. */
	hasImpactSurface: boolean;

	/** Whether the artefact encloses a volume (a container). */
	hasContainer: boolean;

	/** How open that container is, 0 (sealed) to 1 (fully open). */
	containerOpenness: number;

	/**
	 * The raw opening band behind `containerOpenness`, from `hollow-enclosed.opening`
	 * (wide/narrow/slit/none) or `cylindrical.opening` (open/restricted/closed) — doc 05 §5.3.
	 * `'none'` when `hasContainer` is `false`. Kept alongside the collapsed float because `'slit'`
	 * (money-box/rattle) and sealed `'closed'`/`'none'` (votive/funerary) are distinct use-signals a
	 * single openness number can't separate.
	 */
	openingType: 'none' | 'wide' | 'open' | 'narrow' | 'restricted' | 'slit' | 'closed';

	/** Whether the artefact has a fastening mechanism (clasp, pin, hinge). */
	hasFasteningMechanism: boolean;

	/** Coarse length band of the primary axis. */
	primaryAxisLength:
		| 'short'
		| 'medium'
		| 'long';

	/**
	 * The length band of the EDGED component specifically (doc 05 §5.3 `elongated.length`),
	 * distinct from `primaryAxisLength` (the whole artefact's main axis) — a short dagger blade
	 * mounted on a long haft has a short `bladeLengthBand` but a long `primaryAxisLength`. `'none'`
	 * when `hasEdge` is `false`.
	 */
	bladeLengthBand: 'none' | 'short' | 'medium' | 'long';

	/**
	 * The edged component's cut-vs-thrust geometry, from its `crossSection` + `taper` (doc 05 §5.3):
	 * flat/rectangular cross-sections read `'cutting'`; diamond/triangular sections with an abrupt
	 * taper read `'thrusting'`; everything else is `'general'`. `'none'` when `hasEdge` is `false`.
	 * Captures the historical edged-only-vs-edged-and-pointed sword axis for typology/description
	 * (roadmap 2GN.40) — no MVP classification rule differentiates tag scores on this field yet.
	 */
	bladeProfile: 'none' | 'cutting' | 'thrusting' | 'general';

	/** Whether the artefact reads as something worn on the body. */
	isWearable: boolean;

	/** Number of components. */
	partCount: number;

	/** How varied the attachment types are — a diversity measure over `AttachmentType`. */
	attachmentDiversity: number;

	/**
	 * The perforation vocabulary across `flat-broad` (none/single/multiple) and `disc-form`
	 * (none/central/off-centre) components (doc 05 §5.3), unioned into one field. A hole signals
	 * suspension (pendant), hafting/sewing (fitting) or rotation (spindle-whorl) depending on which
	 * value fires. `'none'` when no perforated component is present.
	 */
	perforation: 'none' | 'single' | 'multiple' | 'central' | 'off-centre';

	/**
	 * Wall thickness across `cylindrical`/`hollow-enclosed` components (doc 05 §5.3). Thin walls
	 * read fine/display tableware; thick walls read cooking/storage. `'none'` when no walled
	 * component is present.
	 */
	wallThickness: 'none' | 'thin' | 'medium' | 'thick';

	/**
	 * The `ring-form` primitive's `gap` parameter (doc 05 §5.3): `'closed'` is a finger-ring/torc,
	 * `'open'`/`'overlapping'` a penannular brooch or split-ring (a fastener as much as an
	 * ornament). `'none'` when no ring-form component is present.
	 */
	ringGap: 'none' | 'closed' | 'open' | 'overlapping';

	/**
	 * The `sheet-form` primitive's `flexibility` parameter (doc 05 §5.3): rigid reads as a
	 * fitting/plate/mount, flexible as wrapping/binding/foil. `'none'` when no sheet-form component
	 * is present.
	 */
	sheetFlexibility: 'none' | 'rigid' | 'semi-flexible' | 'flexible';

	/**
	 * The artefact's mass band, surfaced from `ObjectDimensions.mass` as a classification signal
	 * (a heavy edge reads axe/adze, not dagger). PHYSICAL fact, unlike `portability` below — see
	 * this interface's boundary note.
	 */
	massBand: 'negligible' | 'light' | 'moderate' | 'heavy' | 'very-heavy';

	/**
	 * Overall bulk band from `ObjectDimensions.primaryExtent`, distinct from `primaryAxisLength`
	 * (which measures elongation, not bulk). The PHYSICAL size signal classification rules use for
	 * "individual, carried-scale item" instead of reading the mechanical `portability` band.
	 */
	sizeBand: 'small' | 'medium' | 'large';

	/**
	 * The `flat-broad` primitive's `curvature` parameter (doc 05 §5.3). A deeply curved broad form
	 * reads as a scoop/shallow bowl — a container signal outside the hollow primitives. `'none'`
	 * when no flat-broad component is present.
	 */
	curvature: 'none' | 'flat' | 'shallow' | 'deep';

	/**
	 * The `cylindrical`/`hollow-enclosed` primitives' `base` parameter (doc 05 §5.3): `'pedestal'`
	 * reads display/ceremonial, `'pointed'` reads amphora-style storage (set in a stand or the
	 * ground). `'none'` when no such component is present.
	 */
	baseType: 'none' | 'flat' | 'rounded' | 'pointed' | 'pedestal';

	// Decorative features
	/** Total number of decorative layers across the artefact. */
	decorativeLayerCount: number;

	/**
	 * Whether any decorative layer's technique falls in the `applied-element` category (inlay,
	 * overlay, studs, wire-wrapping, gilding — doc 05 §8.2) — an added-embellishment signal
	 * derivable from layer technique identity alone, unlike `preciousMaterialsInDecoration` below.
	 */
	appliedElementPresent: boolean;

	/** Whether any decorative layer carries a motif. */
	motifPresent: boolean;

	/** Which cultures' motif vocabularies are represented (doc 05 §8.5). */
	motifCulturalOrigins: string[];

	/** Layering depth × technique variety (doc 05 §9.1). */
	techniqueComplexity: number;

	/**
	 * Whether precious materials appear in the decoration. Currently always `false`: decorative
	 * layer material assignment (roadmap 2GN.33) is unbuilt, so no `DecorativeLayer` carries a
	 * `material` yet. The classification rules that read this field are authored and dormant,
	 * ready to fire once 2GN.33 lands (see `classification.ts`).
	 */
	preciousMaterialsInDecoration: boolean;

	// Combined
	/** Edge + point + impact + container (doc 05 §9.1). */
	functionalComplexity: number;

	/** Layer count + technique variety + motif density (doc 05 §9.1). */
	decorativeComplexity: number;

	/** Structural + decorative complexity combined (doc 05 §9.1). */
	overallComplexity: number;

	// Dimensional
	/**
	 * Portability band carried through from the normalised artefact (doc 05 §5.2). MECHANICAL —
	 * governs player handling, not classification. No `ClassificationRule` may read this field;
	 * use `sizeBand`/`massBand` instead (doc 12 propagation register).
	 */
	portability: Portability;

	/**
	 * Inspection depth carried through from the normalised artefact (doc 05 §5.2). MECHANICAL —
	 * governs player inspection, not classification. No `ClassificationRule` may read this field
	 * (doc 12 propagation register).
	 */
	inspectionDepth: InspectionDepth;
}

/**
 * The fully classified artefact (doc 05 §9.3) — a `NormalisedArtefact` enriched with its assigned
 * materials, decorative layers, extracted features, ground-truth tags, a neutral physical label,
 * and provenance. The terminal product of the generation pipeline.
 */
export interface ClassifiedArtefact extends NormalisedArtefact {
	/** Per-component material assignments (doc 05 §7). */
	materials: MaterialAssignment[];

	/** The decorative layers applied to the artefact (doc 05 §8.3). */
	decorativeLayers: DecorativeLayer[];

	/** The unified extracted feature set (doc 05 §9.1). */
	features: ExtractedFeatures;

	/**
	 * The true function/context tag scores (doc 05 §9.2–§9.3). Visibility: occluded — never
	 * exposed to the player or any agent's interpretive model; they exist solely for the engine to
	 * evaluate claims against reality.
	 */
	groundTruthTags: Map<FunctionTag | ContextTag, number>;

	/**
	 * A neutral, observable physical description (doc 05 §9.3) — e.g. 'short bronze elongated
	 * form with engraved disc-form attachment', never an interpretive name like 'ceremonial
	 * dagger'. Interpretive naming is the player's job. Visibility: observable.
	 */
	physicalLabel: string;

	/** Chronological, cultural and depositional provenance (doc 05 §3.5). */
	provenance: Provenance;

	/** Per-component material provenance (doc 05 §7.1). Occluded from the player. */
	materialProvenance: MaterialProvenance[];
}
