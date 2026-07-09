/**
 * Interpretive model type definitions (doc 06 §2.1–§2.3, doc 08 §3.2) — core types only
 * (roadmap 1FD.18). Observations, inferences and hypotheses form the directed graph of an agent's
 * knowledge (doc 06 §1): raw notes on artefacts, logical connections between them, and the broader
 * claims built from those connections. `InterpretiveModel` is the agent-generic container for all
 * of it — the same shape the player and every NPC scholar's subjective state conforms to (doc 11
 * §2.6, doc 08 §3.1–§3.2). This module is data shapes only, no behaviour.
 *
 * `CulturalClaim`, `ArtefactClaim`, `ChronoClaim`, `AgentAssessment` and `MethodologicalProfile`
 * are specified here in doc 08 §3.2 but owned by roadmap 1FD.19 (a later task against this same
 * file); they are opaque placeholders below until that task lands.
 */

import type { ContextTag, FunctionTag, MaterialTag } from './tags.ts';

/**
 * How strongly an agent commits to a claim (doc 06 §2.1), shared across observations, inferences
 * and hypotheses. Runs from a hunch to a settled certainty.
 */
export type Confidence =
	| 'speculative'
	| 'tentative'
	| 'confident'
	| 'certain';

/**
 * A raw note attached to a specific artefact (doc 06 §2.1) — the ground floor of the knowledge
 * graph. The player (or NPC) records what they perceive, filtered through the lens without their
 * knowledge. Cheap to create and revise; revision history is tracked via `revisedAtTerm` and
 * `supersededBy` so the player and the contradiction detector can see how interpretations shifted.
 */
export interface Observation {
	/** Stable id, referenced by `EvidenceLink.sourceId` and `supersededBy`. */
	id: string;

	/** The artefact this observation is about. */
	artefactId: string;

	/**
	 * Targets a specific component or component-group rather than the whole artefact, aligning
	 * with the bottom-up component grammar (doc 05) — e.g. `'grip-system'`, `'head-system'`.
	 * Absent when the observation is about the artefact as a whole.
	 */
	componentRef?: {
		/** Which arrangement group, e.g. `'grip-system'`, `'head-system'` (doc 05). */
		groupId?: string;

		/** Which specific component within a group, e.g. a particular blade or handle component. */
		componentId?: string;
	};

	/**
	 * Targets a specific decorative element (doc 05 §8) rather than a structural component. Absent
	 * when the observation is not about decoration.
	 */
	decorativeRef?: {
		/** Which decorative layer the element belongs to. */
		layerId?: string;

		/** The kind of decorative element referenced (doc 05 §8). */
		elementType?:
			| 'motif'
			| 'surface-treatment'
			| 'applied-element'
			| 'inscription';

		/** Id of the specific motif, treatment or other element within the layer. */
		elementId?: string;
	};

	/** The player's (or NPC's) note, in their own words. */
	content: string;

	/** Which artefact properties this observation references. */
	propertyRefs: string[];

	/** Player-assigned tags (doc 05 §9.2). Not mutually exclusive. */
	tags: (FunctionTag | ContextTag)[];

	/** How strongly the agent holds this observation. */
	confidence: Confidence;

	/**
	 * Whether the agent was describing what they saw (`'observational'`) or what they think it
	 * means (`'interpretive'`) — distinct from `observationRegister`, which tracks the framing
	 * rather than the epistemic commitment (doc 06 §2.1). Matters for contradiction detection and
	 * lens calibration: interpretive-mode notes carry more inferential weight.
	 */
	epistemicMode: 'observational' | 'interpretive';

	/**
	 * Which framing register was active when the observation was made (doc 06 §2.1). Independent
	 * of `epistemicMode` — a note can be technical-register and observational-mode, or
	 * technical-register and interpretive-mode.
	 *
	 * MVP note: this is the three-value `DescriptionRegister` from doc 04 §3.4, not the post-MVP
	 * five-register `ObservationRegister` model from doc 05 §12 (doc 06 §2.1, doc 13). Typed
	 * inline for now because `DescriptionRegister` doesn't exist yet.
	 *
	 * TODO: replace this inline union with an import of `DescriptionRegister` from `./lens.ts`
	 * (roadmap 1FD.20) or `./description.ts` (roadmap 1FD.31), whichever lands first, once either
	 * exists.
	 */
	observationRegister?:
		| 'observational'
		| 'interpretive'
		| 'technical';

	/** Term index when the observation was first recorded. */
	createdAtTerm: number;

	/** Term index of the most recent revision, if any. */
	revisedAtTerm?: number;

	/** Id of the observation that superseded this one, if it has been revised away. */
	supersededBy?: string;
}

/**
 * One link in an inference's evidence chain (doc 06 §2.2), pointing back at the observation,
 * inference or document that supports (or undermines) the conclusion.
 */
export interface EvidenceLink {
	/** What kind of node this link points to. */
	sourceType: 'observation' | 'inference' | 'document';

	/** Id of the referenced observation, inference or document. */
	sourceId: string;

	/**
	 * The evidential relationship this link expresses. A loose string rather than a union (doc 06
	 * §2.2); conventional values are `'supports'`, `'suggests'`, `'contradicts'` and
	 * `'contextualises'`.
	 */
	role: string;

	/** The agent's own explanation of why this evidence matters. */
	note?: string;
}

/**
 * What an inference or hypothesis is claimed to be about (doc 06 §2.2) — a discriminated union so
 * the scope's identifying data varies with its kind.
 */
export type InferenceScope =
	| { type: 'artefact'; artefactId: string }
	| { type: 'culture'; cultureLabel: string }
	| { type: 'period'; periodLabel: string }
	| { type: 'material'; materialTag: MaterialTag }
	| { type: 'cross-cultural' };

/**
 * A logical connection between observations (doc 06 §2.2) — "I noticed X in artefact A, and Y in
 * artefact B, therefore Z." Where the agent does actual intellectual work; the `evidenceChain` is
 * the load-bearing structure that contradictions attack link by link.
 */
export interface Inference {
	/** Stable id, referenced by `Hypothesis.supportingInferences`/`contradictingInferences`. */
	id: string;

	/** What the agent concludes. */
	conclusion: string;

	/** Ordered chain of supporting (or undermining) evidence. */
	evidenceChain: EvidenceLink[];

	/** Tags this inference bears on (doc 05 §9.2). Not mutually exclusive. */
	tags: (FunctionTag | ContextTag)[];

	/** What the inference is claimed to be about. */
	scope: InferenceScope;

	/** How strongly the agent holds this inference. */
	confidence: Confidence;

	/** Term index when the inference was first drawn. */
	createdAtTerm: number;

	/** Term index of the most recent revision, if any. */
	revisedAtTerm?: number;

	/** Whether the inference still stands, is under challenge, or has been withdrawn. */
	status: 'active' | 'challenged' | 'retracted';
}

/**
 * A broader claim built from multiple inferences (doc 06 §2.3) — e.g. "Culture A is a maritime
 * trading civilisation," supported by inferences about coastal finds, imported materials and
 * boat-related artefacts. Hypotheses feed the Interpretive Lens: `lensStrength` is computed from
 * confidence, evidence depth, publication status, and whether the agent has taught or cited them
 * (doc 04 §4).
 */
export interface Hypothesis {
	/** Stable id, referenced by `Publication.claimIds` and lens/contradiction bookkeeping. */
	id: string;

	/** Short label for the hypothesis. */
	title: string;

	/** The full claim in the agent's own words. */
	statement: string;

	/** Ids of inferences that support this hypothesis. */
	supportingInferences: string[];

	/** Ids of inferences that weaken this hypothesis. */
	contradictingInferences: string[];

	/** Tags this hypothesis bears on (doc 05 §9.2). Not mutually exclusive. */
	tags: (FunctionTag | ContextTag)[];

	/** What the hypothesis is claimed to be about. */
	scope: InferenceScope;

	/** How strongly the agent holds this hypothesis. */
	confidence: Confidence;

	/** Computed: how much this hypothesis warps perception (doc 04 §4). */
	lensStrength: number;

	/** Whether this hypothesis has been published — locked in, and much harder to retract, if so. */
	published: boolean;

	/** Id of the publication that committed this hypothesis, once published. */
	publicationId?: string;

	/** Term index when the hypothesis was first formed. */
	createdAtTerm: number;

	/** Term index of the most recent revision, if any. */
	revisedAtTerm?: number;

	/** Whether the hypothesis still stands, is under challenge, or has been withdrawn. */
	status: 'active' | 'challenged' | 'retracted';
}

/**
 * TODO(1FD.19): opaque placeholder for `CulturalClaim`, owned by this same file
 * (`src/lib/types/interpretation.ts`, doc 08 §3.2) — a later task in this file's own scope, e.g.
 * "Culture X preferred obsidian for blades." Nothing in this file dereferences its fields, so an
 * opaque `unknown` typechecks everywhere it is used (`InterpretiveModel.culturalClaims`) while
 * avoiding a duplicate definition that would conflict when 1FD.19 lands. Define `CulturalClaim`
 * directly in this file and delete this placeholder then; no import will be needed.
 */
type CulturalClaim = unknown;

/**
 * TODO(1FD.19): opaque placeholder for `ArtefactClaim`, owned by this same file
 * (`src/lib/types/interpretation.ts`, doc 08 §3.2) — a later task in this file's own scope, e.g.
 * "This blade was ceremonial." Nothing in this file dereferences its fields, so an opaque
 * `unknown` typechecks everywhere it is used (`InterpretiveModel.artefactClaims`) while avoiding a
 * duplicate definition that would conflict when 1FD.19 lands. Define `ArtefactClaim` directly in
 * this file and delete this placeholder then; no import will be needed.
 */
type ArtefactClaim = unknown;

/**
 * TODO(1FD.19): opaque placeholder for `ChronoClaim`, owned by this same file
 * (`src/lib/types/interpretation.ts`, doc 08 §3.2) — a later task in this file's own scope, e.g.
 * "Period Y preceded Period Z." Nothing in this file dereferences its fields, so an opaque
 * `unknown` typechecks everywhere it is used (`InterpretiveModel.chronologicalClaims`) while
 * avoiding a duplicate definition that would conflict when 1FD.19 lands. Define `ChronoClaim`
 * directly in this file and delete this placeholder then; no import will be needed.
 */
type ChronoClaim = unknown;

/**
 * TODO(1FD.19): opaque placeholder for `AgentAssessment`, owned by this same file
 * (`src/lib/types/interpretation.ts`, doc 08 §3.2) — a later task in this file's own scope, e.g.
 * "Dr. Okonkwo is a reliable structuralist." Nothing in this file dereferences its fields, so an
 * opaque `unknown` typechecks everywhere it is used (`InterpretiveModel.agentAssessments`) while
 * avoiding a duplicate definition that would conflict when 1FD.19 lands. Define `AgentAssessment`
 * directly in this file and delete this placeholder then; no import will be needed.
 */
type AgentAssessment = unknown;

/**
 * TODO(1FD.19): opaque placeholder for `MethodologicalProfile`, owned by this same file
 * (`src/lib/types/interpretation.ts`, doc 08 §3.2) — a later task in this file's own scope,
 * shaping how an agent weighs new evidence. Nothing in this file dereferences its fields, so an
 * opaque `unknown` typechecks everywhere it is used (`InterpretiveModel.methodologicalWeights`)
 * while avoiding a duplicate definition that would conflict when 1FD.19 lands. Define
 * `MethodologicalProfile` directly in this file and delete this placeholder then; no import will
 * be needed.
 */
type MethodologicalProfile = unknown;

/**
 * TODO(1FD.25): opaque placeholder for `HypothesisStrain`, owned by
 * `src/lib/types/contradiction.ts` (doc 06 §5) — the canonical strain type; the older name
 * `StrainScore` is retired in favour of it (roadmap 1FD.19 note). Nothing in this file
 * dereferences its fields, so an opaque `unknown` typechecks everywhere it is used
 * (`InterpretiveModel.strainScores`) while avoiding a duplicate definition that would conflict
 * when 1FD.25 lands. Swap for `import type { HypothesisStrain } from './contradiction.ts'` and
 * delete this line then.
 */
type HypothesisStrain = unknown;

/**
 * TODO(1FD.25): opaque placeholder for `ContradictionQueue`, owned by
 * `src/lib/types/contradiction.ts` (doc 06 §5). Nothing in this file dereferences its fields, so
 * an opaque `unknown` typechecks everywhere it is used (`InterpretiveModel.contradictionQueue`)
 * while avoiding a duplicate definition that would conflict when 1FD.25 lands. Swap for
 * `import type { ContradictionQueue } from './contradiction.ts'` and delete this line then.
 */
type ContradictionQueue = unknown;

/**
 * The agent-generic shape of an epistemic agent's subjective state (doc 08 §3.2) — claims about
 * the ancient world, claims about the professional world, methodological commitments, and
 * contradiction state, all in one container.
 *
 * Agent-generic per doc 11 §2.6 and doc 08 §3.1: the player and every NPC scholar share this exact
 * interface. Engine functions (lens calculation, contradiction detection, commitment evaluation)
 * accept an `InterpretiveModel` as a parameter and never know whose model they are processing —
 * only the UI and store layers treat the player as special. At MVP, only the player's model is
 * fully populated through gameplay; NPC models are generated with `culturalClaims`,
 * `methodologicalWeights` and a subset of `artefactClaims`, while NPC `agentAssessments` and
 * `contradictionQueue` are deferred.
 */
export interface InterpretiveModel {
	/** Id of the agent (player or NPC scholar) this model belongs to. */
	agentId: string;

	/** Claims about cultures, e.g. "Culture X preferred obsidian for blades." */
	culturalClaims: Map<string, CulturalClaim>;

	/** Claims about specific artefacts, e.g. "This blade was ceremonial." */
	artefactClaims: Map<string, ArtefactClaim>;

	/** Claims about chronological ordering, e.g. "Period Y preceded Period Z." */
	chronologicalClaims: Map<string, ChronoClaim>;

	/** What this agent thinks of other agents, e.g. "Dr. Okonkwo is a reliable structuralist." */
	agentAssessments: Map<string, AgentAssessment>;

	/** This agent's methodological commitments, shaping how new evidence is weighted. */
	methodologicalWeights: MethodologicalProfile;

	/**
	 * Strain accumulated per hypothesis under contradiction pressure (doc 06 §5). Keeps the
	 * doc-08-sourced field name `strainScores` even though its value type is `HypothesisStrain`,
	 * not `StrainScore` — the latter name is retired (roadmap 1FD.19 note); only the value type
	 * changed, the field itself is unrenamed.
	 */
	strainScores: Map<string, HypothesisStrain>;

	/** This agent's queue of unresolved contradictions awaiting attention. */
	contradictionQueue: ContradictionQueue;
}
