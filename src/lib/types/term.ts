/**
 * Time and action economy type definitions (doc 08 §3.6, doc 11 §2.8). Discrete academic terms
 * with concurrent actions consuming both time and energy from a single continuum: the `termState`
 * store (roadmap 3WS.*) tracks within-term resources, the orchestrator handles term boundaries.
 * Doc 08 §3.6 is authoritative here — it supersedes the older `TermState`/`BackgroundDrain`
 * sketches in doc 07 (doc 12 §2.9).
 *
 * Unlike its siblings this module is not shapes-only: doc 08 §3.6 defines the week/term constants
 * and four derived-position helpers alongside the types, and they live here with them. Anything
 * beyond that stays out — in particular `getTermType(termIndex)` belongs to career progression
 * (roadmap 9CR.20, `engine/career/progression.ts`), not this file.
 */

/**
 * The four term types of an academic year (doc 08 §3.6). `summer-research` is the strategically
 * distinct season: it carries no teaching background drain, so the player plans their year around
 * it for fieldwork, uninterrupted writing and conference attendance.
 */
export type TermType =
	| 'autumn'
	| 'spring'
	| 'summer-teaching'
	| 'summer-research';

/**
 * One year of the academic calendar (doc 08 §3.6): four terms of `WEEKS_PER_TERM` weeks each,
 * giving `WEEKS_PER_YEAR` modelled weeks — the remaining 4 weeks of a calendar year are implicit
 * transition/holiday, never modelled.
 */
export interface AcademicYear {
	/** 0-based year index within the career. */
	yearIndex: number;

	/** The year's term cycle. Default: `['autumn', 'spring', 'summer-teaching', 'summer-research']`. */
	terms: [TermType, TermType, TermType, TermType];
}

/** Modelled weeks per term (doc 08 §3.6, doc 11 §2.8). */
export const WEEKS_PER_TERM = 12;

/** Terms per academic year (doc 08 §3.6, doc 11 §2.8). */
export const TERMS_PER_YEAR = 4;

/** Modelled weeks per year — 48; the other 4 are implicit transition, never modelled (doc 08 §3.6). */
export const WEEKS_PER_YEAR = WEEKS_PER_TERM * TERMS_PER_YEAR;

/**
 * Within-term resource state (doc 08 §3.6). Actions consume weeks and energy from this single
 * budget; when either is exhausted, the term ends and the orchestrator runs the term-boundary
 * sequence (dissemination resolution, strain accumulation, lens decay, career checks).
 */
export interface TermState {
	/** 0-based term index across the whole career (`yearFromTerm` derives the year). */
	currentTermIndex: number;

	/**
	 * Canonical timestamp — 0-based, never resets, spans the entire career (doc 11 §2.8).
	 * Background processes (peer review, dissemination lead times, reputational lag) run on
	 * absolute weeks, so work naturally spans term boundaries; within-term position is derived on
	 * demand via `weekInTerm`.
	 */
	currentAbsoluteWeek: number;

	/** Which term type this is — determines which background drains apply. */
	termType: TermType;

	/** Weeks available this term. Usually `WEEKS_PER_TERM`; special circumstances may modify it. */
	weekCapacity: number;

	/** Sum of activity durations scheduled this term. */
	weeksAllocated: number;

	/** Total energy for this term (may include carry-over). */
	energyBudget: number;

	/** Remaining energy, decremented by actions. */
	energyRemaining: number;

	/** Ongoing commitments — the subset whose `activeTermTypes` includes `termType` applies. */
	backgroundDrains: BackgroundDrain[];

	/** Record of what was done this term. */
	completedActions: CompletedAction[];
}

/**
 * An ongoing commitment that drains energy at term start (doc 08 §3.6). Term-conditional:
 * teaching load applies to autumn, spring and summer-teaching but not summer-research, while
 * admin or editorial duties might apply year-round. Evaluated when calculating the term's
 * effective energy budget.
 */
export interface BackgroundDrain {
	/** What the drain is, e.g. `"teaching-load"`, `"supervision"`, `"admin"`, `"editorial"`. */
	source: string;

	/** Energy cost applied each term the drain is active. */
	energyCostPerTerm: number;

	/** Which term types this drain applies to. */
	activeTermTypes: TermType[];

	/** Player-facing description of the commitment. */
	description: string;
}

/**
 * Record of one completed action (doc 08 §3.6). Durations are in weeks; an action's span is
 * anchored to the absolute week counter, so it may cross term boundaries even though it is
 * recorded against the term it was initiated in.
 */
export interface CompletedAction {
	/** What kind of action was taken. */
	actionType: string;

	/** Energy the action consumed. */
	energyCost: number;

	/** How many weeks the action spanned. */
	durationWeeks: number;

	/** Absolute week the action started — may span term boundaries. */
	startWeek: number;

	/** Term in which the action was initiated. */
	termIndex: number;
}

/**
 * Absolute week a term starts on (doc 08 §3.6). Derived, not stored: term N starts at week
 * N × `WEEKS_PER_TERM`, matching how the orchestrator seeds the next term's counter.
 */
export function termStartWeek(termIndex: number): number {
	return termIndex * WEEKS_PER_TERM;
}

/** 0-based position of an absolute week within its term (doc 08 §3.6). Derived, not stored. */
export function weekInTerm(absoluteWeek: number): number {
	return absoluteWeek % WEEKS_PER_TERM;
}

/** 0-based term index an absolute week falls in (doc 08 §3.6). Derived, not stored. */
export function termIndexFromWeek(absoluteWeek: number): number {
	return Math.floor(absoluteWeek / WEEKS_PER_TERM);
}

/** 0-based academic year a term index falls in (doc 08 §3.6). Derived, not stored. */
export function yearFromTerm(termIndex: number): number {
	return Math.floor(termIndex / TERMS_PER_YEAR);
}
