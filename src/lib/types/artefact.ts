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

import type { ArtefactTag, MaterialTag } from './tags.ts';
import type { ArrangementPattern, AttachmentType } from './grammar.ts';
import type { DecorativeLayer } from './decoration.ts';
import type { CraftDomain, Provenance } from './world.ts';

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
 * physical behaviour under decoration (`physicalProperties`, `reactivity`, `decorability`), all
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
	craftDomain: CraftDomain;

	/**
	 * Baseline physical properties, read by decorative substrate tests (`data/decorations.ts`) and
	 * by per-material execution difficulty (`computeLayerGrade`, roadmap 2GN.99).
	 *
	 * **Six orthogonal authored axes (roadmap 2GN.101), replacing the original
	 * `hardness: 'soft' | 'medium' | 'hard'` plus `workable: boolean` pair.** That pair proved unfit
	 * on two counts. `hardness` was too coarse and was being actively *misused* as a fragility
	 * proxy — `relief`'s and `overlay`'s substrate tests both carried comments admitting "hardness
	 * stands in as the nearest proxy" for a property that did not exist. And `workable` conflated
	 * three distinct facts: brittleness (obsidian, flint and glass shatter), pliability (linen and
	 * leather deform rather than cut), and grain coarseness (granite cannot hold a fine line however
	 * carefully it is worked). Each is now its own axis, so a substrate test or difficulty weight can
	 * name the fact it actually depends on.
	 *
	 * Every axis is an authored judgement anchored to real materials practice, reviewed per-item —
	 * the same standard `TECHNIQUE_DIFFICULTY` (`data/decorations.ts`) was held to. `hardness` is
	 * additionally pegged to the real Mohs scale so its values stay independently checkable;
	 * `combustibility` is a deliberately coarsened proxy (see its own note).
	 */
	physicalProperties: {
		/**
		 * Resistance to denting and scratching, `1`–`10`, **on the real Mohs scale** so values are
		 * independently checkable rather than free-floating: 1 talc, 2 gypsum, 3 calcite (and
		 * gold/silver), 4 fluorite (bronze), 5 apatite (iron), 6 feldspar, 7 quartz (flint), 8 topaz,
		 * 9 corundum, 10 diamond.
		 *
		 * Says nothing about fracture risk — that is `fragility`. Obsidian is the standing
		 * counter-example: Mohs 5, softer than flint, yet far more prone to shattering.
		 */
		hardness: number;

		/**
		 * Likelihood of catastrophic, unrecoverable fracture under a single mis-strike, `1`–`7`.
		 * The axis `hardness` was previously standing in for.
		 *
		 * `1` deforms and never fractures · `2` hairline crack under severe misuse · `3` cracks under
		 * a clearly bad strike · `4` cracks under a moderate slip · `5` chips readily but is forgiving
		 * of controlled work · `6` fractures on most mis-strikes · `7` shatters on nearly any slip.
		 */
		fragility: number;

		/**
		 * Whether the material holds a fixed worked shape or drapes and deforms under handling,
		 * `1`–`7`. This is the axis that makes linen and leather unengravable despite being neither
		 * hard nor brittle — they are simply pliable.
		 *
		 * `1` fully pliable, drapes freely · `2` flexible, holds a loose shape briefly · `3`
		 * semi-flexible, needs support · `4` firm but bends under working pressure · `5` holds shape
		 * under normal handling · `6` rigid, deliberate force to flex · `7` fully rigid.
		 */
		rigidity: number;

		/**
		 * Grain and microstructural continuity — how finely the internal structure permits a
		 * controlled line, `1`–`7`. **This is what replaces `workable`'s real job**, named for what it
		 * measures rather than the vague legacy term.
		 *
		 * Genuinely independent of the other axes, tested against two pairs during authoring:
		 * obsidian and granite share hardness and rigidity and granite is the *less* fragile of the
		 * two, yet obsidian takes a far finer edge; gold and oak sit close on hardness, fragility and
		 * rigidity, yet gold engraves far more precisely. In both cases grain structure is the only
		 * thing that explains the difference.
		 *
		 * `1` no coherent grain, tears unpredictably · `2` coarse fibrous, the line wanders · `3`
		 * coarse crystalline, caps achievable fineness · `4` moderate grain, needs care to stay true ·
		 * `5` fine consistent grain · `6` very fine, near-effortless precision · `7` amorphous or
		 * glassy, a trained hand achieves razor precision.
		 */
		grainFineness: number;

		/**
		 * Absorbency — how much a surface takes a coating in versus resisting it, `1`–`7`. Governs
		 * `painting` (a porous surface holds pigment more forgivingly) and `glaze` (a porous ceramic
		 * body is *why* glaze bonds at all). Universal scale with no not-applicable sentinel: every
		 * solid has a meaningful porosity.
		 *
		 * `1` sealed and non-absorbent · `7` highly absorbent.
		 */
		porosity: number;

		/**
		 * Readiness to sustain combustion at firing temperatures, `1`–`7`, with `1` the *least* and
		 * `7` the *most* combustible. Gates `glaze` (`combustibility <= 2`), which cannot fire a
		 * material that would burn.
		 *
		 * **A deliberately coarsened proxy for real ignition-temperature data**, not the data itself:
		 * linen ignites near 210 °C, leather chars near 200 °C but sustains ignition nearer 270 °C,
		 * seasoned hardwood near 300 °C. Kept on the shared `1`–`7` scale rather than raw °C for
		 * authoring consistency with the other physical axes. Not one of `MaterialDifficultyAxis`
		 * (`data/decorations.ts`) and so never enters `computeLayerGrade`'s weighted sum — it is a
		 * pure substrate gate, not a difficulty input. Bone and antler's `2` is an approximation of a
		 * different phenomenon: they pyrolyse progressively from around 300–400 °C without a clean
		 * ignition point, so they are placed low but non-zero rather than given a fabricated ignition
		 * temperature.
		 */
		combustibility: number;
	};

	/**
	 * Chemical behaviour, keyed by reaction type so future reactions (acidity, photoreactivity) are
	 * additive rather than a reshape of this field (roadmap 2GN.101).
	 *
	 * Introduced because `patina` had no material signal to key on at all: it is an oxidation
	 * process, and every other axis here is mechanical or structural. Before this, `patina`'s
	 * substrate was `{kind: 'none'}` and the live generator applied patina to stone and glass.
	 */
	reactivity: {
		/**
		 * Readiness to oxidise, `-1` or `0`–`7`.
		 *
		 * **`-1` means not applicable** — the material class has no oxidation chemistry at all (glass,
		 * stone, fired ceramic, fibre). `0`–`7` means applicable and measured, `0` being negligible.
		 * The distinction is load-bearing and deliberate: `-1` feeds a **substrate gate**, not a
		 * difficulty penalty, keeping "impossible" and "merely hard" as different kinds of fact — the
		 * same separation `materialAccessGate` and `computeLayerGrade` already maintain. Gold is `0`
		 * rather than `-1` because gold genuinely has oxidation chemistry; it is simply famously
		 * resistant.
		 */
		oxidisation: number;
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

	/**
	 * If a trade material, which trade relationship enabled it (doc 05 §7.1).
	 *
	 * ⚠️ **Provisional at MVP.** `engine/generation/materials.ts`'s `deriveMaterialProvenance`
	 * (roadmap 2GN.26) synthesises this from a `MaterialFlow`'s tag and position, because neither
	 * `MaterialFlow` nor `CultureRelationship` (`world.ts`) carries a stable id yet — it is *not* a
	 * resolvable reference to a real relationship. Replace once 3WS.5/3WS.6 give trade relationships
	 * real identity.
	 */
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
	 *
	 * A multi-component artefact can carry perforations on more than one component, but this field
	 * holds a single value, so `extractFeatures` (roadmap 2GN.19) reports the most
	 * classificatorily-loaded one present, priority `central` > `off-centre` > `single` >
	 * `multiple` > `none` (rotation and suspension are stronger use-signals than a plain fixing
	 * hole). `data/classification.ts`'s perforation rules assume that single value; the collapse
	 * lives with the extractor, not the rules.
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

	/**
	 * How many decorative layers fall in the `applied-element` category (roadmap 2GN.79).
	 *
	 * `appliedElementPresent` above saturates by construction: `expandDecoration` gives each BNF
	 * category its own per-component slot rolls, so at the fixture phase a ~4-component artefact
	 * carries at least one applied element ~87% of the time (re-measured 2026-08-06, roadmap 2GN.98,
	 * after `decorationVolume` moved to an emphasis-only reading — materially unchanged from the
	 * pre-2GN.98 ~85%, confirming the saturation is structural rather than a volume-weighting effect,
	 * doc 12 §2.33). Measured across all six named regional worlds (n=7200) the *count* still
	 * discriminates — p50 2, p75 3, p90 5, max 11 — so classification rules wanting "deliberately
	 * embellished" read this, and the boolean stays for consumers that genuinely only need presence.
	 * See doc 12 §2.25.
	 */
	appliedElementCount: number;

	/**
	 * Mean `DecorativeLayer.grade` across every layer, `0`–`1` (roadmap 2GN.98, doc 11 §1.5); `0`
	 * when `decorativeLayerCount` is `0`. Grade is craft-executed quality, not volume — a phase's
	 * `society.craftSpecialisation` scaled by each selected technique's own execution difficulty
	 * (`TECHNIQUE_DIFFICULTY`, `data/decorations.ts`), so a heavily-decorated but low-craft artefact
	 * and a sparsely-decorated but high-craft one can score oppositely on this field despite
	 * `decorativeLayerCount` saying nothing about either. This is the sampled `BaselineFeature`
	 * realising doc 05 §8.3's "technically refined vs simple techniques" distinction — separate from
	 * `decorativeLayerCount`/`decorativeComplexity`, which read `aesthetics.decorativeEmphasis`
	 * (volume) rather than craft (execution quality).
	 */
	meanDecorativeGrade: number;

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
	 * ready to fire once 2GN.68 wires the layer-material→precious-material lookup this field
	 * needs (see `classification.ts`); 2GN.33 only produces the underlying `DecorativeLayer.material`
	 * data, it does not itself populate this field.
	 */
	preciousMaterialsInDecoration: boolean;

	// Combined
	/** Edge + point + impact + container (doc 05 §9.1). */
	functionalComplexity: number;

	/** Layer count + technique variety + motif density (doc 05 §9.1). */
	decorativeComplexity: number;

	/**
	 * Functional + decorative complexity combined — the implementation's reading of doc 05 §9.1's
	 * "structural + decorative", which names no separate structural score (doc 12 §2.20).
	 */
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
	groundTruthTags: Map<ArtefactTag, number>;

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
