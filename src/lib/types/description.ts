/**
 * Description generation and presentation type definitions (doc 05 §13, doc 04 §3.4) — Stage 9 of
 * the pipeline, where the artefact meets the player. Templates generate register-parameterised
 * prose from artefact properties; assembly orders the result by lens salience into the
 * presentation the agent actually reads. Register scope is the three-value `DescriptionRegister`
 * (lens.ts) throughout: doc 05 §13's code blocks predate the MVP narrowing and type these fields
 * as the five-value `ObservationRegister`, which is post-MVP along with the `RegisterAccess`
 * acquisition model (doc 12 §2.10, doc 13 §4). This module is data shapes only, no behaviour;
 * generation lives under `engine/generation/` (roadmap 2GN.33–2GN.38).
 */

import type { CrossReference, DescriptionRegister } from './lens.ts';
import type { ArtefactTag, MaterialTag } from './tags.ts';
import type {
	CraftDomain,
	DatingConfidence,
	DatingMethod,
	DepositionType,
	PreservationState,
	SiteType,
} from './world.ts';

/**
 * All prose variants for one describable property (doc 05 §13.1). This is where the Tracery-like
 * grammar operates — at the prose level, not the structural level. Template data itself lives in
 * `src/lib/data/descriptions/` per register (roadmap 2GN.35–2GN.37).
 */
export interface DescriptionTemplate {
	/** The property these variants describe. */
	property: string;

	/** Candidate renderings across registers. */
	variants: DescriptionVariant[];
}

/**
 * Gates whether a variant is a candidate at all (doc 05 §13.1). Fields are optional and any-of
 * within, AND across: `{ values: ['round'], craftDomain: ['stoneWorking'] }` requires both. An
 * absent field constrains nothing; an absent `condition` fires unconditionally.
 *
 * Deliberately data, not predicates (unlike `DECORATIVE_TECHNIQUES.substrate.test` in
 * `data/decorations.ts`) — description data crosses the save boundary, so the condition must stay
 * serialisable.
 *
 * Two axes are deliberately absent. Component *shape* needs no field: the owning template's
 * `property` id already carries it (`elongated.edge` only fires on an elongated component). Sibling
 * parameters (gating `elongated.crossSection` on the same component's `edge`) are out of MVP scope
 * — cheap to add later as a `parameters?: Record<string, string[]>` field alongside `values`, and
 * premature inclusion risks the 2GN.87 failure mode: a plausible conjunction that silently matches
 * zero generated artefacts. Guarded meanwhile by the firing-frequency tests in 2GN.36/2GN.37.
 */
export interface VariantCondition {
	/**
	 * Any-of over the values of the owning template's own parameter — the one named by the suffix
	 * of its `property` id, so `{ values: ['round', 'oval'] }` on `elongated.crossSection` gates on
	 * that parameter and no other. Values come from `PRIMITIVE_PARAMETERS` in
	 * `data/grammars/primitives.ts`, untyped here because `types/` must not import from `data/`
	 * (same constraint that leaves `NormalisedComponent.primitiveType` a bare `string`).
	 *
	 * `NormalisedComponent.properties` is `Map<string, string | number>`, so matching compares
	 * `String(propertyValue)` against this list — the same coercion `expand` in
	 * `engine/generation/prose.ts` applies when rendering a slot.
	 */
	values?: string[];

	/** Any-of over the craft domain of the component's assigned material (`MaterialDefinition.craftDomain`). */
	craftDomain?: CraftDomain[];

	/** Any-of over `MaterialDefinition.id` — the narrowest material gate (e.g. `['obsidian']`). */
	materialId?: string[];

	/** Any-of over `MaterialDefinition.tags` — matches when the material carries any listed tag. */
	materialTag?: MaterialTag[];
}

/**
 * One template rendering of a property (doc 05 §13.1). The lens selects among a property's
 * variants by hypothesis alignment (doc 04 §3.4); `condition` gates which variants are candidates
 * at all, and the register system gates which registers are available at all.
 */
export interface DescriptionVariant {
	/** Tracery-style template with slots. */
	template: string;

	/**
	 * Tags this variant's framing foregrounds. Spans both scoring bases: a variant may frame an
	 * artefact by what it is (`weapon`) or by the register it reads as (`ceremonial`), and the
	 * latter is precisely the framing the lens selects on. Empty across the shipped observational
	 * set, which by definition foregrounds nothing (doc 12 §2.10).
	 */
	emphasis: ArtefactTag[];

	/** Which register the variant belongs to (three-value MVP scope, doc 12 §2.10). */
	register: DescriptionRegister;

	/**
	 * Gates whether this variant is a candidate. Absent means it always fires. Selection order is
	 * condition-then-emphasis: `condition` filters the candidate set, `emphasis` selects within it
	 * (roadmap 2GN.92, 2GN.93).
	 */
	condition?: VariantCondition;
}

/**
 * The assembled description an agent reads when inspecting an artefact (doc 05 §13.2): ordered
 * observations sorted by the lens's salience weighting, tag suggestions and primed
 * cross-references. This is the lens-filtered subjective view — the same underlying artefact
 * produces different presentations for agents with different interpretive models.
 */
export interface ArtefactPresentation {
	/** The artefact being presented. */
	artefactId: string;

	/** Neutral physical description. */
	label: string;

	/** Player-visible find context. */
	provenance: ProvenancePresentation;

	/** High-salience observations, shown up front. */
	primaryObservations: PresentedObservation[];

	/** Low-salience observations — the "on closer inspection" section, requires investigation. */
	secondaryObservations: PresentedObservation[];

	/** Lens-weighted classification prompts (doc 04 §3.2). */
	suggestedTags: TagSuggestion[];

	/** Lens-primed comparisons with previously studied artefacts (doc 04 §3.3). */
	crossReferences: CrossReference[];
}

/**
 * One rendered observation within a presentation (doc 05 §13.2). The description text is the
 * register- and lens-selected variant; the raw data behind it stays accessible on drill-down, so
 * the lens shapes emphasis without ever hiding measurable fact (doc 04 §3.5).
 */
export interface PresentedObservation {
	/** The property this observation renders. */
	propertyId: string;

	/** Register + lens selected variant text. */
	description: string;

	/** Lens-weighted prominence (doc 04 §3.1) — determines primary/secondary placement. */
	salience: number;

	/** Register the text was rendered in (three-value MVP scope, doc 12 §2.10). */
	register: DescriptionRegister;

	/** Underlying measurements, always accessible on drill-down. */
	rawData: Map<string, string | number>;
}

/**
 * One tag suggestion within a presentation (doc 05 §13.2), pairing the engine's ground truth with
 * the lens-boosted score the agent actually sees. The gap between the two is where confirmation
 * bias lives.
 */
export interface TagSuggestion {
	/** The tag being suggested. */
	tag: ArtefactTag;

	/** Visibility: occluded — engine use only. Plausibility from properties alone. */
	groundTruthScore: number;

	/** Boost from the agent's interpretive model (doc 04 §3.2). */
	lensBoost: number;

	/** What the agent sees. */
	presentedScore: number;

	/** Which beliefs are boosting this suggestion. */
	sourceHypotheses: string[];
}

/**
 * Provisional, not doc-specified: named by `ArtefactPresentation.provenance` (doc 05 §13.2) but
 * never shaped. The player-visible projection of world.ts `Provenance` (doc 05 §3.5): the site
 * and context groups are observable, while `cultureId`, `phaseId` and `year` are occluded and
 * deliberately absent — absolute dating is not free information (doc 05 §4.7); relative dating
 * via stratigraphy is. Expect this to firm up when `generateDescription` lands (roadmap 2GN.38).
 */
export interface ProvenancePresentation {
	/** Site name, as recorded at excavation. */
	siteName: string;

	/** Kind of site (doc 05 §3.5). */
	siteType: SiteType;

	/** Broad geographic region the site sits within. */
	region: string;

	/** Stratigraphic layer identifier — relative dating comes free from stratigraphy (doc 05 §4.7). */
	layer: string;

	/** Ids of other artefacts recovered in direct association. */
	associatedFinds: string[];

	/** How well the artefact survived to excavation. */
	condition: PreservationState;

	/** How the artefact came to be deposited (doc 05 §3.5). */
	deposition: DepositionType;

	/**
	 * Corpus-derived dated range for the layer, present only when an NPC `DatingFramework`
	 * (world.ts, doc 05 §4.7) covers the site. Presented as established fact in the reference
	 * literature — and possibly wrong. Absent when no framework covers the layer.
	 */
	dating?: {
		/** Estimated absolute year range, mirroring `LayerDating.estimatedRange`. */
		estimatedRange: [number, number];

		/** How the range was derived (doc 05 §4.7). */
		method: DatingMethod;

		/** How settled the source framework is in the literature (doc 05 §4.7). */
		confidence: DatingConfidence;
	};
}
