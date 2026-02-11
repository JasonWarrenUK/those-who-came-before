// Interpretive model types (doc 06; doc 08, section 3.2)
// Agent-generic: same interface for player and NPC scholars

import type { FunctionTag, ContextTag, MaterialTag } from './tags.js';
import type { ObservationRegister } from './lens.js';
import type { ContradictionQueue } from './contradiction.js';

// --- Confidence ---

export type Confidence = 'speculative' | 'tentative' | 'confident' | 'certain';

// --- Observations ---

export interface Observation {
	id: string;
	artefactId: string;
	componentRef?: {
		groupId?: string;
		componentId?: string;
	};
	decorativeRef?: {
		layerId?: string;
		elementType?: 'motif' | 'surface-treatment' | 'applied-element' | 'inscription';
		elementId?: string;
	};
	content: string;
	propertyRefs: string[];
	tags: (FunctionTag | ContextTag)[];
	confidence: Confidence;
	epistemicMode: 'observational' | 'interpretive';
	observationRegister?: ObservationRegister;
	createdAtTerm: number;
	revisedAtTerm?: number;
	supersededBy?: string;
}

// --- Inferences ---

export interface Inference {
	id: string;
	conclusion: string;
	evidenceChain: EvidenceLink[];
	tags: (FunctionTag | ContextTag)[];
	scope: InferenceScope;
	confidence: Confidence;
	createdAtTerm: number;
	revisedAtTerm?: number;
	status: 'active' | 'challenged' | 'retracted';
}

export interface EvidenceLink {
	sourceType: 'observation' | 'inference' | 'document';
	sourceId: string;
	role: string;
	note?: string;
}

export type InferenceScope =
	| { type: 'artefact'; artefactId: string }
	| { type: 'culture'; cultureLabel: string }
	| { type: 'period'; periodLabel: string }
	| { type: 'material'; materialTag: MaterialTag }
	| { type: 'cross-cultural' };

// --- Hypotheses ---

export interface Hypothesis {
	id: string;
	title: string;
	statement: string;
	supportingInferences: string[];
	contradictingInferences: string[];
	tags: (FunctionTag | ContextTag)[];
	scope: InferenceScope;
	confidence: Confidence;
	lensStrength: number;
	published: boolean;
	publicationId?: string;
	createdAtTerm: number;
	revisedAtTerm?: number;
	status: 'active' | 'challenged' | 'retracted';
}

// --- Publications ---

export interface Publication {
	id: string;
	title: string;
	documentNodeId: string;
	claimIds: string[];
	evidenceSummary: string;
	receptionScore: number;
	citations: number;
	challenges: string[];
	status: 'published' | 'challenged' | 'retracted';
	publishedAtTerm: number;
	retractedAtTerm?: number;
}

// --- Agent-generic interpretive model (doc 08, section 3.2) ---

export interface InterpretiveModel {
	agentId: string;
	culturalClaims: Map<string, CulturalClaim>;
	artefactClaims: Map<string, ArtefactClaim>;
	chronologicalClaims: Map<string, ChronologicalClaim>;
	agentAssessments: Map<string, AgentAssessment>;
	methodologicalWeights: MethodologicalProfile;
	strainScores: Map<string, StrainScore>;
	contradictionQueue: ContradictionQueue;
}

export interface CulturalClaim {
	id: string;
	claim: string;
	cultureLabel: string;
	confidence: Confidence;
	status: 'active' | 'challenged' | 'retracted';
}

export interface ArtefactClaim {
	id: string;
	artefactId: string;
	claim: string;
	confidence: Confidence;
	status: 'active' | 'challenged' | 'retracted';
}

export interface ChronologicalClaim {
	id: string;
	claim: string;
	confidence: Confidence;
	status: 'active' | 'challenged' | 'retracted';
}

export interface AgentAssessment {
	id: string;
	targetAgentId: string;
	assessment: string;
}

export interface MethodologicalProfile {
	weights: Map<string, number>;
}

export interface StrainScore {
	hypothesisId: string;
	score: number;
}

// --- Working document types (doc 06, section 3) ---

export interface ArtefactStudy {
	type: 'artefact-study';
	artefactId: string;
	observations: string[];
	interpretiveSummary: string;
	assignedTags: (FunctionTag | ContextTag)[];
	assignedCulture?: string;
	assignedPeriod?: string;
	relatedStudies: string[];
	status: 'draft' | 'complete';
}

export interface MaterialGeneralisation {
	type: 'material-generalisation';
	materialTag: MaterialTag;
	specificMaterial?: string;
	claim: string;
	scope: InferenceScope;
	supportingObservations: string[];
	inferenceId: string;
	confidence: Confidence;
}

export interface PlayerCulturalProfile {
	type: 'cultural-profile';
	cultureLabel: string;
	summary: string;
	materialPreferences: Array<{
		materialTag: MaterialTag;
		usage: string;
		confidence: Confidence;
		sourceInferences: string[];
	}>;
	functionalEmphasis: Array<{
		tag: FunctionTag;
		description: string;
		confidence: Confidence;
		sourceInferences: string[];
	}>;
	temporalRange: {
		earliest: string;
		latest: string;
		confidence: Confidence;
	};
	relationships: Array<{
		otherCulture: string;
		type: string;
		evidence: string[];
	}>;
	hypothesisIds: string[];
	artefactIds: string[];
}

export interface InferenceProof {
	type: 'inference-proof';
	title: string;
	conclusion: string;
	chain: Array<{
		step: number;
		claim: string;
		evidence: EvidenceLink[];
		assumption: string;
	}>;
	confidence: Confidence;
	dependentHypotheses: string[];
}

export interface RevisionRecord {
	type: 'revision-record';
	targetType: 'observation' | 'inference' | 'hypothesis' | 'cultural-profile';
	targetId: string;
	previousState: string;
	newState: string;
	reason: string;
	triggerType: 'self-initiated' | 'contradiction' | 'new-evidence' | 'peer-challenge';
	triggerId?: string;
	termIndex: number;
}

// --- Player-specific extended state (doc 06, section 6) ---

export interface PlayerInterpretiveState {
	model: InterpretiveModel;
	artefactStudies: Map<string, ArtefactStudy>;
	materialGeneralisations: Map<string, MaterialGeneralisation>;
	culturalProfiles: Map<string, PlayerCulturalProfile>;
	inferenceProofs: Map<string, InferenceProof>;
	revisionRecords: RevisionRecord[];
	contradictionQueue: ContradictionQueue;
	strainScores: Map<string, HypothesisStrain>;
	lensState: import('./lens.js').LensState;
}

export interface HypothesisStrain {
	hypothesisId: string;
	strainScore: number;
	factors: Array<{
		type:
			| 'reinterpretation'
			| 'partial-mismatch'
			| 'missing-evidence'
			| 'peer-doubt'
			| 'decorative-mismatch';
		description: string;
		contribution: number;
	}>;
}
