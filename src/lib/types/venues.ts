/**
 * Venue type definitions (doc 07 §3.1, doc 10 §4.4).
 *
 * Venues are where documents meet the world: generated during world creation alongside the
 * professional corpus, each with properties that determine what work they accept, how they
 * evaluate it and what career weight publication there carries. A venue is not a category — it is
 * a bundle of properties from which descriptive labels can be derived, consistent with artefact
 * classification (doc 05) and document form classification (doc 10). A venue might *read* as "a
 * prestigious specialist journal" or "a regional museum exhibition programme", but those labels
 * emerge; they are never assigned. Prestige is likewise computed from properties, never stored as
 * a tier. Venues are static once generated for MVP — shifting attributes (reputation damage,
 * editorial turnover, scope drift) are deferred post-MVP (doc 11).
 *
 * Temporal model: doc 10 §6.4's week-denominated `VenueTemporalProfile` is canonical (doc 12
 * §2.17). Doc 07 §3.1's term-denominated `TemporalMode`/`SubmissionWindow` are superseded — the
 * doc 12 §2.9 week-conversion sweep updated doc 10's profile but never doc 07, and the landed
 * `PeerReviewState` (documents.ts, 1FD.22) already works in absolute weeks. `visibilityWindow`,
 * the one doc 07 temporal field with no doc 10 equivalent, is deferred post-MVP per the
 * `presented`/`collected` `DisseminationState` precedent — no task or doc consumes it. Doc 07's
 * remaining shapes are transcribed as written, save the `methodologicalLeaning` narrowing noted
 * on the field. This module is data shapes only, no behaviour.
 */

import type { MethodologicalBias } from './interpretation.ts';

/**
 * How publication is structured at a venue (doc 07 §3.1).
 */
export type ContainerModel =
	/** One-of-many in a curated issue. */
	| 'periodical'
	/** Self-contained work (book, monograph). */
	| 'standalone'
	/** Exhibition, gallery, spatial installation. */
	| 'curated-space'
	/** Conference, lecture series. */
	| 'event';

/**
 * When a venue accepts and publishes work (doc 10 §6.4). Seasonal windows create calendar
 * pressure: the player must decide whether to rush a document to meet a window or wait for the
 * next cycle; rolling venues are always open but may have longer review times. Lead times are
 * stored in weeks for verisimilitude — the player sees "expected review: 16–24 weeks" — but
 * resolution occurs at term boundaries, because that's when the world ticks (doc 08 §3.6). Set
 * per-venue at world generation (9CR.5) and observable: the player can check submission
 * deadlines. Weeks-within-year values tie to `WEEKS_PER_YEAR` (term.ts, 1FD.28).
 */
export interface VenueTemporalProfile {
	/** Self-referential when the profile is embedded in `VenueDefinition`. */
	venueId: string;

	submissionMode: 'rolling' | 'seasonal';

	/** Seasonal venues only: ranges of weeks-within-year (0–47) when submissions are accepted. */
	openWeeks?: [number, number][];

	/** Seasonal venues only: period of the cycle (e.g. 48 = annual). */
	cycleLengthWeeks?: number;

	/** Min–max weeks from submission to decision. */
	reviewLeadTimeWeeks: [number, number];

	/** Weeks from acceptance to formal publication. */
	publicationLeadTimeWeeks: number;
}

/**
 * How a venue evaluates submitted work (doc 07 §3.1). Determines whether dissemination triggers
 * named peer review (doc 07 §3.3) and feeds the venue's computed prestige.
 */
export type EditorialProcess =
	/** Named reviewers evaluate the submission. */
	| 'peer-review'
	/** Editor invites or commissions work. */
	| 'editorial-commission'
	/** Curator selects work for exhibition/collection. */
	| 'curatorial-selection'
	/** Minimal gatekeeping. */
	| 'open-submission';

/**
 * How the audience encounters work published at a venue (doc 07 §3.1).
 */
export type AudienceEncounter =
	/** Readers go looking for it (journals, books). */
	| 'sought'
	/** Encountered in situ (museum, public space). */
	| 'situated'
	/** Audience is present and committed (lecture, conference). */
	| 'captive';

/**
 * A venue's subject range (doc 07 §3.1) — emergent, not categorical. All dimensions are 0–1.
 */
export interface VenueScope {
	/** How many cultures the venue covers. */
	cultureRange: number;

	/** How many periods. */
	periodRange: number;

	/** How ecumenical the editorial stance. */
	methodologicalRange: number;
}

/**
 * A venue where documents are disseminated (doc 07 §3.1). Prestige is computed from the prestige
 * inputs, never assigned: high rigour + narrow scope + long establishment computes differently
 * from low rigour + broad scope + massive reach, and the career system treats them differently
 * (specialist credibility versus influence and public profile). Subject focus creates venue–player
 * fit — mismatched submissions aren't automatically rejected, but face higher scrutiny and a less
 * sympathetic reviewer pool.
 */
export interface VenueDefinition {
	id: string;
	name: string;

	// Structural properties — how publication works here
	containerModel: ContainerModel;
	temporalProfile: VenueTemporalProfile;

	/** Whether the audience encounters actual artefacts alongside the work. */
	artefactSituated: boolean;

	editorialProcess: EditorialProcess;
	audienceEncounter: AudienceEncounter;

	// Prestige inputs — computed, not assigned
	/** 0–1: how demanding the review process is. */
	editorialRigour: number;

	scope: VenueScope;

	/** 0–1: size of audience. */
	reach: number;

	/** 0–1: longevity and institutional entrenchment. */
	establishment: number;

	/** What this venue cares about. */
	subjectFocus: {
		/** Which cultures this venue gravitates toward. */
		cultureAffinities?: string[];

		/** Which periods. */
		periodAffinities?: string[];

		/**
		 * Structuralist, materialist, etc. Narrowed from doc 07's `string` to the existing
		 * `MethodologicalBias` union per the 1FD.31 register-narrowing precedent, matching
		 * `MinimalScholar.specialism.methodologicalBias`.
		 */
		methodologicalLeaning?: MethodologicalBias;
	};
}

/**
 * A venue's reclassification of a submitted document (doc 10 §4.4). The venue applies its own
 * classification standards, so its form label may differ from the system's. Reclassification is a
 * diegetic event ("the editors suggest it be published as a research note rather than a full
 * article") which the player can accept, withdraw from or appeal, with career consequences for
 * each.
 */
export interface VenueClassification {
	venueId: string;

	/** What the system called the document. */
	submittedFormLabel: string;

	/** What the venue calls it. */
	venueFormLabel: string;

	/** True if the two labels differ. */
	reclassified: boolean;

	/** Why the venue reclassified, e.g. "Insufficient evidence for full article". */
	reclassificationReason?: string;
}
