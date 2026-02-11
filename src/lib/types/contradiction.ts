// Contradiction system types (doc 06, sections 4–5)

// --- Severity ---

export type ContradictionSeverity = 'minor' | 'moderate' | 'major' | 'critical';

// --- Contradiction types ---

export interface MaterialContradiction {
	type: 'material';
	description: string;
	agentClaim: { claimId: string; claim: string };
	contradictingEvidence: { artefactId: string; property: string };
	severity: ContradictionSeverity;
}

export interface TemporalContradiction {
	type: 'temporal';
	description: string;
	agentClaim: { claimId: string; claim: string };
	contradictingEvidence: { artefactId: string; provenance: string };
	severity: ContradictionSeverity;
}

export interface CulturalContradiction {
	type: 'cultural';
	description: string;
	agentClaim: { profileId: string; claim: string };
	contradictingEvidence: { artefactId: string; property: string };
	severity: ContradictionSeverity;
}

export interface StructuralContradiction {
	type: 'structural';
	description: string;
	affectedProof: { proofId: string; brokenStep: number };
	reason: string;
	severity: ContradictionSeverity;
}

export interface ProvenanceContradiction {
	type: 'provenance';
	description: string;
	agentClaim: { studyId: string; claim: string };
	contradictingEvidence: { artefactId: string; actualProvenance: string };
	severity: ContradictionSeverity;
}

export interface CorpusContradiction {
	type: 'corpus';
	description: string;
	agentClaim: { claimId: string; claim: string };
	corpusPosition: { publicationIds: string[]; consensus: string };
	severity: ContradictionSeverity;
}

export interface RarityContradiction {
	type: 'rarity';
	description: string;
	agentPerception: { claim: string; inferenceId?: string };
	occludedDistribution: {
		level: 'geological' | 'cultural' | 'site' | 'perceived';
		actualFrequency: string;
	};
	sampleBias?: string;
	severity: ContradictionSeverity;
}

export interface MaterialProvenanceContradiction {
	type: 'material-provenance';
	description: string;
	agentClaim: { inferenceId: string; claim: string };
	contradictingEvidence: {
		artefactId: string;
		materialId: string;
		geologicalOrigin: string;
	};
	severity: ContradictionSeverity;
}

export type Contradiction =
	| MaterialContradiction
	| TemporalContradiction
	| CulturalContradiction
	| StructuralContradiction
	| ProvenanceContradiction
	| CorpusContradiction
	| RarityContradiction
	| MaterialProvenanceContradiction;

// --- Contradiction queue ---

export interface ContradictionQueue {
	items: QueuedContradiction[];
	totalSeverity: number;
	reputationalPressure: number;
}

export interface QueuedContradiction {
	contradiction: Contradiction;
	detectedAtTerm: number;
	termsUnresolved: number;
	surfacedVia?: DiegeticSurface;
	acknowledged: boolean;
	resolved: boolean;
	resolution?: Resolution;
}

// --- Diegetic surfacing ---

export type DiegeticSurface =
	| { channel: 'impossible-artefact'; artefactId: string; anomaly: string }
	| { channel: 'peer-letter'; scholarName: string; argument: string }
	| { channel: 'student-question'; studentName: string; question: string }
	| { channel: 'review-rejection'; journalName: string; reason: string }
	| { channel: 'field-report'; siteName: string; finding: string }
	| { channel: 'public-criticism'; sourceName: string; claim: string };

// --- Resolution ---

export interface Resolution {
	type: 'revise' | 'reinterpret' | 'reject';
	contradictionId: string;
	affectedDocuments: string[];
	playerExplanation: string;
	resolvedAtTerm: number;
}
