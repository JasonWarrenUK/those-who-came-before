// Career system types (doc 07)

import type { InterpretiveModel } from './interpretation.js';

// --- Academic roles ---

export type AcademicRole =
	| 'postdoctoral-researcher'
	| 'junior-lecturer'
	| 'senior-lecturer'
	| 'reader'
	| 'professor';

// --- Reputation ---

export interface Reputation {
	overall: number;
	dimensions: {
		rigour: number;
		breadth: number;
		originality: number;
		reliability: number;
		influence: number;
	};
	modifiers: ReputationModifier[];
}

export interface ReputationModifier {
	source: string;
	dimension: keyof Reputation['dimensions'];
	delta: number;
	duration: 'permanent' | { decayPerTerm: number };
	appliedAt: number;
}

// --- Reputation gates ---

export interface ReputationGate {
	activity: string;
	requiredDimension: keyof Reputation['dimensions'];
	threshold: number;
	failureMessage: string;
}

// --- Career state ---

export interface CareerState {
	currentRole: AcademicRole;
	activities: CareerActivity[];
	completedActivities: CareerActivity[];
	tenure: boolean;
	fieldSeasons: number;
	studentsSupervised: number;
	publicProfile: number;
	sabbaticalCooldown: number;
	onSabbatical: boolean;
}

// --- Activities ---

export type ActivityType =
	| 'field-season'
	| 'conference-presentation'
	| 'grant-application'
	| 'student-supervision'
	| 'peer-review'
	| 'public-engagement'
	| 'sabbatical';

export interface CareerActivity {
	id: string;
	type: ActivityType;
	available: boolean;
	requirements: ReputationGate[];
	timeCost: number;
	energyCost: {
		upfront: number;
		perWeek: number;
	};
	exclusive?: string[];
	outcomes: ActivityOutcome[];
}

export interface ActivityOutcome {
	description: string;
	probability: number;
	effects: ReputationModifier[];
}

// --- Role requirements ---

export interface RoleRequirement {
	reputation: Partial<Record<keyof Reputation['dimensions'], number>>;
	publishedDocuments: number;
	minVenuePrestige?: number;
	activities: ActivityType[];
	minTermsInRole?: number;
}

// --- Dissemination career effects ---

export type DisseminationTransition =
	| 'private-to-circulated'
	| 'circulated-to-submitted'
	| 'submitted-to-published'
	| 'published-to-collected';

export interface DisseminationCareerEffect {
	transition: DisseminationTransition;
	venueId: string;
	reputationEffects: {
		dimension: keyof Reputation['dimensions'];
		delta: number;
		basis: string;
	}[];
	lensEffect: number;
}

// --- Peer review ---

export interface PeerReviewCareerEvent {
	documentNodeId: string;
	venueId: string;
	reviewerId: string;
	outcome: 'accepted' | 'revisions-requested' | 'rejected';
	feedback: ReviewerFeedback;
	reputationEffects: {
		dimension: keyof Reputation['dimensions'];
		delta: number;
		basis: string;
	}[];
	relationshipEffect: {
		scholarId: string;
		respectDelta: number;
		agreementDelta: number;
	};
}

export interface ReviewerFeedback {
	scholarName: string;
	assessment: string;
	methodologicalConcerns: string[];
	commitmentsDisputed: string[];
	commitmentsEndorsed: string[];
}

// --- Form reclassification ---

export interface FormReclassificationEvent {
	documentNodeId: string;
	venueId: string;
	originalForm: string;
	venueForm: string;
	direction: 'downward' | 'upward' | 'lateral';
	editorCorrespondence: string;
	reputationEffects: {
		dimension: keyof Reputation['dimensions'];
		delta: number;
		basis: string;
	}[];
}
