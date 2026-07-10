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
import type { ContextTag, FunctionTag } from './tags.ts';
import type {
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
 * One template rendering of a property (doc 05 §13.1). The lens selects among a property's
 * variants by hypothesis alignment (doc 04 §3.4); the register system gates which variants are
 * available at all.
 */
export interface DescriptionVariant {
	/** Tracery-style template with slots. */
	template: string;

	/** Function tags this variant's framing foregrounds. */
	emphasis: FunctionTag[];

	/** Which register the variant belongs to (three-value MVP scope, doc 12 §2.10). */
	register: DescriptionRegister;
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
	tag: FunctionTag | ContextTag;

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
