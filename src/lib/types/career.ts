/**
 * Career and reputation type definitions (doc 07 §2, §2.2, §4.0–§4.1).
 *
 * Reputation is multidimensional, not a single score: a player can be respected for rigour while
 * dismissed for originality. Reputation gates certain activities and its dimensions shift from
 * career events (doc 07 §2.1) — publishing, retracting, resolving or ignoring contradictions, and
 * so on. `CareerState` and `CareerActivity` describe the concurrent-undertakings model (doc 07
 * §4.1): a term's activities compete for a shared time and energy budget rather than a single
 * "pick one action" slot. Time and energy accounting itself (terms, weeks, background drains) is
 * owned by `src/lib/types/term.ts` (roadmap 1FD.28); this file references those concepts only via
 * plain numbers, taking no dependency on it. This module is data shapes only, no behaviour.
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
	exclusive?: string[];

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
 * optional reputation delta and an optional follow-on unlock. Expect this to firm up once roadmap
 * 1FD.27 (which owns the closely related `PeerReviewCareerEvent`, `ReviewerFeedback` and
 * `DisseminationCareerEffect`) lands.
 */
export interface ActivityOutcome {
	/** Human-readable description of this outcome, shown to the player. */
	description: string;

	/** Optional per-dimension reputation adjustment this outcome applies. */
	reputationEffect?: Partial<Record<keyof Reputation['dimensions'], number>>;

	/** Id of an activity this outcome unlocks, if any. */
	unlocksActivity?: string;
}
