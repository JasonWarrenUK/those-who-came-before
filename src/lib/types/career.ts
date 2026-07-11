/**
 * Career and reputation type definitions (doc 07 §2, §2.2, §3.2–§3.3, §4.0–§4.2).
 *
 * Reputation is multidimensional, not a single score: a player can be respected for rigour while
 * dismissed for originality. Reputation gates certain activities and its dimensions shift from
 * career events (doc 07 §2.1) — publishing, retracting, resolving or ignoring contradictions, and
 * so on. `CareerState` and `CareerActivity` describe the concurrent-undertakings model (doc 07
 * §4.1): a term's activities compete for a shared time and energy budget rather than a single
 * "pick one action" slot. The career-event shapes (roadmap 1FD.27) tie the document tradition
 * back to reputation: dissemination transitions and named peer review each carry itemised,
 * diegetically-explained reputation effects (doc 07 §3.2–§3.3), and `RoleRequirement` gates rank
 * advancement (doc 07 §4.2).
 *
 * Time and energy accounting itself (terms, weeks, background drains) is owned by
 * `src/lib/types/term.ts` (roadmap 1FD.28); this file references those concepts only via plain
 * numbers, taking no dependency on it. Likewise documents, venues and scholars are referenced by
 * plain `string` ids, keeping this file import-free. This module is data shapes only, no
 * behaviour.
 */

/**
 * A player or NPC scholar's standing across five independent dimensions (doc 07 §2) plus an
 * overall composite. Not a single number — a player can be respected in one dimension and
 * dismissed in another, and reputation gates (`ReputationGate`) check individual dimensions rather
 * than the composite alone.
 */
export interface Reputation {
	/** Weighted composite across all dimensions, 0–1 (doc 07 §2). */
	overall: number;

	/** The five independent reputation dimensions (doc 07 §2). */
	dimensions: {
		/** Quality of evidence chains. */
		rigour: number;

		/** Range of cultures/periods studied. */
		breadth: number;

		/** Novel claims vs echoing peers. */
		originality: number;

		/** Track record of claims surviving scrutiny. */
		reliability: number;

		/** Citations, students, public reach. */
		influence: number;
	};

	/** Active temporary effects layered on top of the base dimensions (doc 07 §2). */
	modifiers: ReputationModifier[];
}

/**
 * One active effect nudging a single reputation dimension (doc 07 §2), applied by career events
 * such as publication, retraction, or contradiction resolution (doc 07 §2.1). Modifiers either
 * persist indefinitely or decay by a fixed amount each term.
 */
export interface ReputationModifier {
	/** What caused this modifier (e.g. a document id, an event name). */
	source: string;

	/** Which dimension of `Reputation['dimensions']` this modifier affects. */
	dimension: keyof Reputation['dimensions'];

	/** The signed adjustment applied to the dimension. */
	delta: number;

	/** Permanent, or decaying by a fixed fraction of its effect each term. */
	duration:
		| 'permanent'
		| { decayPerTerm: number };

	/** Term index (absolute week or term counter) when this modifier was applied. */
	appliedAt: number;
}

/**
 * A reputation threshold gating access to a career activity or professional opportunity (doc 07
 * §2.2) — e.g. a journal editor declining a submission until rigour improves. `failureMessage` is
 * always diegetic: the player never sees a raw "requirement not met", only the in-world reason.
 */
export interface ReputationGate {
	/** Identifier of the activity or opportunity this gate protects (doc 07 §2.2). */
	activity: string;

	/** Which dimension of `Reputation['dimensions']` must clear `threshold`. */
	requiredDimension: keyof Reputation['dimensions'];

	/** Minimum value required in `requiredDimension` (doc 07 §2.2). */
	threshold: number;

	/** Diegetic explanation shown to the player when the gate blocks them. */
	failureMessage: string;
}

/**
 * The player's (or an NPC scholar's) current professional standing and concurrent undertakings
 * (doc 07 §4.0). Activities run concurrently within a term, competing for a shared time and energy
 * budget rather than a single "pick one action" slot (doc 07 §4.1). Term and week accounting are
 * owned by `src/lib/types/term.ts` (roadmap 1FD.28); this shape references only plain counts.
 */
export interface CareerState {
	/** The current academic rank (doc 07 §4.0). */
	currentRole: AcademicRole;

	/** Activities currently available and running this term (doc 07 §4.0). */
	activities: CareerActivity[];

	/** Activities finished in prior terms, retained for history and career checks. */
	completedActivities: CareerActivity[];

	/** Whether the player holds tenure. */
	tenure: boolean;

	/** Number of field seasons the player has led excavations for (doc 07 §4.0). */
	fieldSeasons: number;

	/** Total number of students mentored to date. */
	studentsSupervised: number;

	/** Media visibility, 0–1 (doc 07 §4.0). */
	publicProfile: number;

	/** Terms remaining until sabbatical becomes available again (doc 07 §4.0). */
	sabbaticalCooldown: number;

	/** Whether the player is currently on sabbatical (doc 07 §4.0). */
	onSabbatical: boolean;
}

/**
 * The academic ranks a player or NPC scholar can hold (doc 07 §4.0), ordered junior to senior.
 * Rank determines background drain profile (doc 07 §4.0 table) and gates sabbatical eligibility
 * (Reader/Professor only).
 */
export type AcademicRole =
	| 'postdoctoral-researcher'
	| 'junior-lecturer'
	| 'senior-lecturer'
	| 'reader'
	| 'professor';

/**
 * One concurrent undertaking within a term (doc 07 §4.1) — teaching, research, and administrative
 * obligations all compete for the same time and energy budget. Multiple activities can run
 * simultaneously; the constraint is affording the combined energy cost, not picking a single
 * action.
 */
export interface CareerActivity {
	/** Stable id for this activity instance. */
	id: string;

	/** Which kind of undertaking this is (doc 07 §4.1). */
	type: ActivityType;

	/** Whether the activity can currently be started (requirements met, not exclusive-blocked). */
	available: boolean;

	/** Reputation gates that must pass for this activity to be available (doc 07 §2.2). */
	requirements: ReputationGate[];

	/** Weeks within the term this activity consumes (doc 07 §4.1). */
	timeCost: number;

	/** Energy spent starting and sustaining the activity (doc 07 §4.1). */
	energyCost: {
		/** Energy spent at the start. */
		upfront: number;

		/** Ongoing drain while the activity runs. */
		perWeek: number;
	};

	/** Activity types that cannot run concurrently with this one (doc 07 §4.1). */
	exclusive?: ActivityType[];

	/** Possible results of completing this activity (doc 07 §4.1). */
	outcomes: ActivityOutcome[];
}

/**
 * The seven kinds of concurrent undertaking an academic career offers (doc 07 §4.1), each with a
 * distinct time/energy profile and a distinct effect on the wider game systems.
 */
export type ActivityType =
	| 'field-season' // Lead excavation -> new artefacts
	| 'conference-presentation' // Present findings -> reputation + peer feedback
	| 'grant-application' // Secure funding -> unlock field season or equipment
	| 'student-supervision' // Mentor student -> student questions (contradiction channel)
	| 'peer-review' // Review others' work -> see alternative interpretations
	| 'public-engagement' // Public events -> influence + popular writing
	| 'sabbatical'; // Reduced lens + full energy + no background drains

/**
 * Provisional: doc 07 §4.1 references `ActivityOutcome` only as `CareerActivity.outcomes` with the
 * inline comment "Possible results" and never defines its shape, nor is it owned by any roadmap
 * task. This is an invented minimal shape, not doc-specified: a human-readable description plus an
 * optional reputation delta and an optional follow-on unlock. Roadmap 1FD.27 has since landed the
 * doc-specified career-event shapes below, whose itemised `ReputationEffect[]` (delta + diegetic
 * basis per effect) is the sibling idiom; this shape stays provisional until activity execution
 * gets an owning task (post-MVP, doc 13 §5), at which point it may adopt that idiom.
 */
export interface ActivityOutcome {
	/** Human-readable description of this outcome, shown to the player. */
	description: string;

	/** Optional per-dimension reputation adjustment this outcome applies. */
	reputationEffect?: Partial<Record<keyof Reputation['dimensions'], number>>;

	/** Id of an activity this outcome unlocks, if any. */
	unlocksActivity?: string;
}

/**
 * One itemised reputation consequence of a career event (doc 07 §3.2–§3.3, where this shape is
 * inlined identically on both `DisseminationCareerEffect` and `PeerReviewCareerEvent`; hoisted
 * here per the `ContradictionSeverity`/`DatingConfidence` precedent). `basis` keeps career
 * mechanics inside the fiction: every reputation change has a diegetic explanation the player can
 * read — never "+0.1 rigour", always "The editorial board of the Lowland Studies Quarterly noted
 * the thoroughness of your stratigraphic analysis" (doc 07 §3.2).
 */
export interface ReputationEffect {
	/** Which dimension of `Reputation['dimensions']` this effect adjusts. */
	dimension: keyof Reputation['dimensions'];

	/** Signed adjustment, computed from venue properties + document properties. */
	delta: number;

	/** Diegetic explanation of why this effect occurred. */
	basis: string;
}

/**
 * A document's move along the dissemination pipeline, as a career event (doc 07 §3.2). Each
 * transition escalates the stakes: circulation is a faint work-in-progress signal, submission a
 * declaration of readiness judged by the venue's editorial board, publication the major career
 * event where peer review occurs and lens strength locks.
 *
 * MVP scope: three live transitions. Doc 07 §3.2's fourth member, `published-to-collected`, is
 * dropped per the `DisseminationState` precedent (documents.ts, roadmap 1FD.22) — the `collected`
 * state is itself deferred for MVP, and doc 07 §3.2 defers the transition explicitly.
 */
export type DisseminationTransition =
	| 'private-to-circulated'
	| 'circulated-to-submitted'
	| 'submitted-to-published';

/**
 * The career consequences of one dissemination state transition (doc 07 §3.2). Reputation effects
 * are not flat bonuses — they scale with venue properties, so publication in a high-rigour,
 * well-established venue carries more reputational weight (and lens strength) than a low-rigour,
 * broad-reach outlet, while the latter generates more influence.
 */
export interface DisseminationCareerEffect {
	transition: DisseminationTransition;

	/** The venue involved in the transition (`VenueDefinition` id, venues.ts). */
	venueId: string;

	/** Itemised, diegetically-explained reputation consequences. */
	reputationEffects: ReputationEffect[];

	/** Contribution to commitment lens strength (doc 04's graduated calculation). */
	lensEffect: number;
}

/**
 * A named reviewer's assessment of a submitted document (doc 07 §3.3). Peer review is named, not
 * anonymous (doc 11 §2.1): the reviewer is identified, their published positions are known, and
 * their assessment is a public professional act. The commitment fields connect review to the
 * knowledge model (doc 06) — a reviewer engages with specific claims, so disputed commitments are
 * potential contradiction seeds, and endorsed commitments from a hostile reviewer are particularly
 * strong validation.
 */
export interface ReviewerFeedback {
	scholarName: string;

	/** Diegetic text — the reviewer's letter. */
	assessment: string;

	/** Specific issues raised. */
	methodologicalConcerns: string[];

	/** Which of the document's commitments the reviewer challenges. */
	commitmentsDisputed: string[];

	/** Which the reviewer finds well-supported. */
	commitmentsEndorsed: string[];
}

/**
 * The career consequences of one peer review (doc 07 §3.3) — a social event, not a binary verdict.
 * `revisions-requested` never mutates the submission (documents are immutable once disseminated,
 * doc 10 §1): the player derives a new document node and resubmits, while the original persists
 * with the impression it made. Review is bidirectional — the relationship effect records what the
 * exchange did to standing between the two scholars.
 *
 * Doc 08 §5's `resolvePeerReview` sketch reads a singular `reputationEffect` field; doc 07 §3.3's
 * plural array governs the shape (roadmap 1FD.27 note) and the sketch reconciles when the store
 * method lands.
 */
export interface PeerReviewCareerEvent {
	/** The submitted document (`DocumentNode` id, documents.ts). */
	documentNodeId: string;

	/** The venue reviewed for (`VenueDefinition` id, venues.ts). */
	venueId: string;

	/** NPC scholar id of the named reviewer (`MinimalScholar` id, scholars.ts). */
	reviewerId: string;

	outcome: 'accepted' | 'revisions-requested' | 'rejected';
	feedback: ReviewerFeedback;

	/** Itemised, diegetically-explained reputation consequences. */
	reputationEffects: ReputationEffect[];

	/**
	 * What the review did to the player–reviewer relationship; deltas apply to
	 * `MinimalScholar.relationship`'s `respect`/`agreement` (scholars.ts).
	 */
	relationshipEffect: {
		scholarId: string;
		respectDelta: number;
		agreementDelta: number;
	};
}

/**
 * What a scholar must have accumulated before advancing to a given `AcademicRole` (doc 07 §4.2).
 * Advancement is checked at term boundaries and delivered diegetically — a letter of appointment,
 * a new nameplate — never an explicit "level up". The per-role requirement table is data evaluated
 * by the career engine (roadmap 9CR.16), not typed here.
 *
 * MVP note: progression gates on reputation, publications and terms-in-role only — `activities`
 * stays in the interface with `[]` for the MVP transition so activity gating can return per role
 * without an interface change (doc 12 §2.12, doc 13 §5).
 */
export interface RoleRequirement {
	/** Minimum values per reputation dimension; absent dimensions are ungated. */
	reputation: Partial<Record<keyof Reputation['dimensions'], number>>;

	/** Documents at 'published' dissemination state or beyond. */
	publishedDocuments: number;

	/** At least N documents published at venues above this prestige threshold. */
	minVenuePrestige?: number;

	/** Career activities that must have been completed (doc 07 §4.1). */
	activities: ActivityType[];

	/** Minimum terms spent in current role before eligible. */
	minTermsInRole?: number;
}
