/**
 * Contradiction type definitions (doc 06 §4.2).
 *
 * A contradiction is a detectable divergence between an agent's interpretive model and the world
 * state's occluded properties (doc 06 §4.1). Not all errors are contradictions — only those that
 * produce observable consequences: contradictions are revealed by consequences, not by checking
 * answers. Detection compares claims in an `InterpretiveModel` against occluded properties in
 * world state (doc 11 §2.5, §2.7); observable and inferable properties can't produce
 * contradictions, and engine-internal properties are never compared. Detection is agent-generic —
 * the same logic runs against player and NPC models alike.
 *
 * `ContradictionSeverity` belongs to 1FD.25's bullet but landed here early because all eight
 * union members reference it directly (the 1FD.21/22 precedent). The queue, resolution and strain
 * shapes remain with 1FD.25. This module is data shapes only, no behaviour.
 */

/**
 * How serious a contradiction is (doc 06 §4.2). Drives queue ordering, strain accumulation and
 * the prominence of diegetic surfacing (1FD.25 shapes).
 */
export type ContradictionSeverity = 'minor' | 'moderate' | 'major' | 'critical';

/**
 * An agent claims a culture doesn't use a material, but a new artefact attributed to that culture
 * contains it (doc 06 §4.2). Targets material presence/absence — contrast
 * `MaterialProvenanceContradiction`, which targets the explanation for a material's presence.
 */
export interface MaterialContradiction {
	type: 'material';
	description: string;

	agentClaim: { claimId: string; claim: string };
	contradictingEvidence: { artefactId: string; property: string };
	severity: ContradictionSeverity;
}

/**
 * An agent's chronology places a culture before a period, but a new artefact has provenance that
 * contradicts this (doc 06 §4.2).
 */
export interface TemporalContradiction {
	type: 'temporal';
	description: string;

	agentClaim: { claimId: string; claim: string };
	contradictingEvidence: { artefactId: string; provenance: string };
	severity: ContradictionSeverity;
}

/**
 * An agent's cultural profile predicts something that a new artefact contradicts (doc 06 §4.2).
 *
 * MVP deviation: `agentClaim` references a `claimId` rather than doc 06's `profileId` — cultural
 * profiles as documents land post-MVP, so at MVP the contradicted position is a claim in the
 * agent's interpretive model (roadmap 1FD.24 note).
 */
export interface CulturalContradiction {
	type: 'cultural';
	description: string;

	agentClaim: { claimId: string; claim: string };
	contradictingEvidence: { artefactId: string; property: string };
	severity: ContradictionSeverity;
}

/**
 * An agent's inference chain contains a logical impossibility (doc 06 §4.2). Unlike the
 * evidence-driven members, this is internal to the model — no new artefact is required to
 * surface it.
 */
export interface StructuralContradiction {
	type: 'structural';
	description: string;

	affectedProof: { proofId: string; brokenStep: number };
	reason: string;
	severity: ContradictionSeverity;
}

/**
 * An agent attributes an artefact to a context that conflicts with its actual origin
 * (doc 06 §4.2). Targets artefact-level context — contrast `MaterialProvenanceContradiction`,
 * which targets material-level geological origin.
 */
export interface ProvenanceContradiction {
	type: 'provenance';
	description: string;

	agentClaim: { studyId: string; claim: string };
	contradictingEvidence: { artefactId: string; actualProvenance: string };
	severity: ContradictionSeverity;
}

/**
 * An agent's claim conflicts with established professional consensus (doc 06 §4.2). The corpus
 * may itself be wrong — this is a disagreement, not proof of error. Corpus contradictions are
 * unique in that resolution may involve the agent *challenging* the consensus rather than
 * deferring to it, feeding the claim magnitude system (doc 05 §4.6).
 */
export interface CorpusContradiction {
	type: 'corpus';
	description: string;

	agentClaim: { claimId: string; claim: string };
	corpusPosition: { publicationIds: string[]; consensus: string };
	severity: ContradictionSeverity;
}

/**
 * An agent's perception of rarity diverges from occluded reality (doc 06 §4.2). Can occur at any
 * of the four rarity levels (doc 05 §10): geological (material commoner/rarer than the agent
 * thinks), cultural (production frequency doesn't match the agent's model), site
 * (survival/recovery bias has skewed the sample) or perceived (the profession's consensus on
 * rarity is itself wrong). Detection compares the agent's sample against the occluded
 * distribution, accounting for which sites have been excavated and how thoroughly.
 */
export interface RarityContradiction {
	type: 'rarity';
	description: string;

	agentPerception: { claim: string; inferenceId?: string };
	occludedDistribution: {
		level: 'geological' | 'cultural' | 'site' | 'perceived';

		/** Description of actual rarity. */
		actualFrequency: string;
	};

	/** What's skewing the agent's perception. */
	sampleBias?: string;

	severity: ContradictionSeverity;
}

/**
 * An agent's claim about *why* a material is present is wrong, even though the material
 * identification itself may be correct (doc 06 §4.2) — e.g. "obsidian is a trade import" when
 * there's a local deposit, or "local clay" when geological provenance shows distant origin.
 * Distinct from `MaterialContradiction` (presence/absence) and `ProvenanceContradiction`
 * (artefact-level context).
 */
export interface MaterialProvenanceContradiction {
	type: 'material-provenance';
	description: string;

	agentClaim: { inferenceId: string; claim: string };
	contradictingEvidence: {
		artefactId: string;
		materialId: string;

		/** From `MaterialProvenance` (doc 05 §7.1). */
		geologicalOrigin: string;
	};
	severity: ContradictionSeverity;
}

/**
 * Every way an agent's interpretive model can detectably diverge from occluded world state
 * (doc 06 §4.2), discriminated on `type`.
 */
export type Contradiction =
	| MaterialContradiction
	| TemporalContradiction
	| CulturalContradiction
	| StructuralContradiction
	| ProvenanceContradiction
	| CorpusContradiction
	| RarityContradiction
	| MaterialProvenanceContradiction;
