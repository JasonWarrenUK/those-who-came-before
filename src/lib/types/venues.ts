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
 * Known spec tension: `TemporalMode` here is term-denominated per doc 07 §3.1, while doc 10 §6.4
 * defines a separate week-denominated `VenueTemporalProfile` covering overlapping ground
 * (submission windows, lead times). Doc 12 records doc 10's week conversion but no reconciliation
 * with doc 07; no roadmap task owns `VenueTemporalProfile`. Doc 07's shapes are transcribed as
 * written. This module is data shapes only, no behaviour.
 */

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
 * When a venue accepts submissions (doc 07 §3.1). Seasonal windows create calendar pressure: the
 * player must decide whether to rush a document to meet a window or wait for the next cycle.
 */
export interface SubmissionWindow {
	/** Windows per year (1 = annual, 3 = termly, etc.). */
	frequency: number;

	/** How windows align with the academic calendar, if they do. */
	alignment?: 'term-start' | 'term-end' | 'annual' | 'event-tied';

	/** Whether a window is currently open. */
	open: boolean;
}

/**
 * When and how often a venue accepts and publishes work (doc 07 §3.1).
 */
export interface TemporalMode {
	submissionWindow: SubmissionWindow;

	/** Terms between acceptance and publication (1–3 typical). */
	leadTime: number;

	/** Terms the work remains "current" before fading into the backlist. */
	visibilityWindow: number | 'indefinite';
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
	temporalMode: TemporalMode;

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

		/** Structuralist, materialist, etc. */
		methodologicalLeaning?: string;
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
