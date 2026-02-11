// Term and time economy types (doc 07, section 4.0; doc 08, section 3.6)

export type TermType = 'autumn' | 'spring' | 'summer-teaching' | 'summer-research';

export const WEEKS_PER_TERM = 12;
export const TERMS_PER_YEAR = 4;
export const WEEKS_PER_YEAR = WEEKS_PER_TERM * TERMS_PER_YEAR;

export interface AcademicYear {
	yearIndex: number;
	terms: [TermType, TermType, TermType, TermType];
}

export interface TermState {
	currentTermIndex: number;
	currentAbsoluteWeek: number;
	termType: TermType;
	weekCapacity: number;
	weeksAllocated: number;
	energyBudget: number;
	energyRemaining: number;
	backgroundDrains: BackgroundDrain[];
	completedActions: CompletedAction[];
}

export interface ActiveActivity {
	activityId: string;
	type: string;
	weeksRemaining: number;
	energyPerWeek: number;
	qualitySnapshot?: number;
}

export interface BackgroundDrain {
	source: string;
	energyCostPerTerm: number;
	activeTermTypes: TermType[];
	description: string;
}

export interface CompletedAction {
	actionType: string;
	energyCost: number;
	durationWeeks: number;
	startWeek: number;
	termIndex: number;
}

// --- Derived helpers ---

export function termStartWeek(termIndex: number): number {
	return termIndex * WEEKS_PER_TERM;
}

export function weekInTerm(absoluteWeek: number): number {
	return absoluteWeek % WEEKS_PER_TERM;
}

export function termIndexFromWeek(absoluteWeek: number): number {
	return Math.floor(absoluteWeek / WEEKS_PER_TERM);
}

export function yearFromTerm(termIndex: number): number {
	return Math.floor(termIndex / TERMS_PER_YEAR);
}
