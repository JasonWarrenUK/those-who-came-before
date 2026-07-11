/**
 * Contradiction type definitions (doc 06 §4.2, §4.4–§4.6, §5).
 *
 * A contradiction is a detectable divergence between an agent's interpretive model and the world
 * state's occluded properties (doc 06 §4.1). Not all errors are contradictions — only those that
 * produce observable consequences: contradictions are revealed by consequences, not by checking
 * answers. Detection compares claims in an `InterpretiveModel` against occluded properties in
 * world state (doc 11 §2.5, §2.7); observable and inferable properties can't produce
 * contradictions, and engine-internal properties are never compared. Detection is agent-generic —
 * the same logic runs against player and NPC models alike.
 *
 * Beyond the `Contradiction` union itself (roadmap 1FD.24), this file owns the accumulation,
 * surfacing, resolution and strain shapes (doc 06 §4.4–§4.6, §5; roadmap 1FD.25): detected
 * contradictions queue rather than interrupt, reach the agent through in-world channels, and are
 * addressed through a retcon flow whose evasive resolutions accumulate strain. This module is data
 * shapes only, no behaviour.
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

/**
 * The in-world channel through which a contradiction reaches an agent (doc 06 §4.5), discriminated
 * on `channel`. Contradictions never appear as system alerts — they arrive as impossible finds,
 * pointed letters, awkward student questions. Surfacing is decoupled from detection: the system
 * selects the most appropriate channel for the contradiction type from whatever channels are
 * implemented.
 *
 * MVP note: only `impossible-artefact` and `field-report` are driven at MVP (doc 06 §4.5) —
 * `peer-letter` and `student-question` need skeletal NPCs, `review-rejection` needs the
 * publication system, `public-criticism` needs the popular writing track. All six are typed now
 * because doc 07 §5.2's NPC challenge generators already return the `peer-letter` and
 * `student-question` shapes.
 */
export type DiegeticSurface =
	| { channel: 'impossible-artefact'; artefactId: string; anomaly: string }
	| { channel: 'peer-letter'; scholarName: string; argument: string }
	| { channel: 'student-question'; studentName: string; question: string }
	| { channel: 'review-rejection'; journalName: string; reason: string }
	| { channel: 'field-report'; siteName: string; finding: string }
	| { channel: 'public-criticism'; sourceName: string; claim: string };

/**
 * The record of an agent addressing a contradiction via the retcon flow (doc 06 §4.6):
 * acknowledge, trace the affected inference chain, decide, cascade to dependent documents, record.
 * `revise` changes the hypothesis and recalibrates the lens; `reinterpret` keeps the hypothesis
 * but explains the evidence away, accumulating `HypothesisStrain`; `reject` disputes the evidence
 * itself, costing credibility and raising the reputational pressure of future contradictions.
 *
 * `contradictionId` is a doc 06 forward reference: `Contradiction` members carry no `id` field at
 * MVP, so the identity scheme it points at is owned by the detection engine (7CD.x tasks), not
 * typed here.
 */
export interface Resolution {
	type: 'revise' | 'reinterpret' | 'reject';
	contradictionId: string;

	/** Ids of all documents that changed in the cascade. */
	affectedDocuments: string[];

	/** The player's in-fiction justification for the decision. */
	playerExplanation: string;

	/** Term index when the resolution was recorded. */
	resolvedAtTerm: number;
}

/**
 * One detected contradiction awaiting (or having received) the agent's attention (doc 06 §4.4).
 * Queued, not forced: the agent decides when to engage, while `termsUnresolved` drives escalating
 * diegetic pressure the longer it sits.
 */
export interface QueuedContradiction {
	contradiction: Contradiction;

	/** Term index when detected. */
	detectedAtTerm: number;

	/** How many terms since detection (drives escalation). */
	termsUnresolved: number;

	/** How it reached the player; absent while detected but not yet surfaced (doc 06 §4.5). */
	surfacedVia?: DiegeticSurface;

	/** Player has seen it. */
	acknowledged: boolean;

	resolved: boolean;
	resolution?: Resolution;
}

/**
 * An agent's accumulated unresolved contradictions (doc 06 §4.4). Visible only as a diegetic
 * element — mounting unease, peer whispers, unanswered letters — never as a system alert.
 *
 * Shape per doc 06 §4.4: the store sketch in doc 08 §3.4 pushes a bare `Contradiction` into
 * `items` and sums the string-valued `severity` — illustrative pseudo-code that the eventual store
 * action (3WS.x) reconciles against this shape; doc 06 governs (roadmap 1FD.25 note).
 */
export interface ContradictionQueue {
	items: QueuedContradiction[];

	/** Sum of all unresolved severities, as scored by the engine. */
	totalSeverity: number;

	/** Increases each term with unresolved contradictions. */
	reputationalPressure: number;
}

/**
 * Mounting tension between what an agent believes and what the evidence supports (doc 06 §5) —
 * the slow-burn alternative to a clean contradiction, and the canonical strain type (doc 12
 * §2.15; the older name `StrainScore` is retired). Reinterpretations, partial mismatches and
 * out-of-context motif appearances each add a little; past a threshold the hypothesis becomes
 * "stressed" and diegetic surfacing grows more frequent and pointed. The threshold itself is
 * engine behaviour, not typed here.
 */
export interface HypothesisStrain {
	hypothesisId: string;

	/** 0–1, accumulates over time. */
	strainScore: number;

	/** What is contributing strain, itemised so the pressure is legible in retrospect. */
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
