# TWCB: Knowledge & Contradiction Model
*Interpretive models, documents, inference chains, and how it all falls apart*

---

## 1. The Shape of Knowledge

The player's knowledge is not a flat database of facts. It's a directed graph of observations, inferences, hypotheses, and publications — where every node has a confidence level, every edge has a justification, and the whole structure can be partially wrong in ways that cascade.

```
Observation → Inference → Hypothesis → Publication
     ↑              ↑           ↑
  (artefact)    (pattern)   (commitment)
```

The further right you go, the harder it is to retract. An observation can be revised trivially. An inference takes some re-examination. A hypothesis requires confronting your own reasoning. A publication requires public retraction with career consequences.

---

## 2. The Four Knowledge Layers

Throughout this document, `FunctionTag` and `ContextTag` refer to the tag classification system defined in doc 05, section 9.2. Function tags describe what an object is *for* (weapon, tool, container, ritual, etc.). Context tags describe how it was *used* (personal, communal, elite, ceremonial, etc.). Tags are not mutually exclusive — an artefact can carry multiple function and context tags simultaneously, and resolving which tags apply is a core part of the player's analytical work. `MaterialTag` is similarly defined in doc 05, section 9.2.

### 2.1 Observations

Raw notes attached to specific artefacts. These are the ground floor — the player records what they see (filtered through the lens, but they don't know that).

```typescript
interface Observation {
  id: string;
  artefactId: string;
  componentRef?: {                      // Specific component or component-group
    groupId?: string;                   // e.g., 'grip-system', 'head-system'
    componentId?: string;               // e.g., specific blade or handle component
  };
  decorativeRef?: {                     // Specific decorative element (doc 05, section 8)
    layerId?: string;                   // Which decorative layer
    elementType?: 'motif' | 'surface-treatment' | 'applied-element' | 'inscription';
    elementId?: string;                 // Specific motif or treatment
  };
  content: string;                      // Player's note
  propertyRefs: string[];               // Which artefact properties this references
  tags: (FunctionTag | ContextTag)[];   // Player-assigned tags (see doc 05, section 9.2)
  confidence: Confidence;
  epistemicMode: 'observational' | 'interpretive';  // Recording what they see, or what they think it means?
  observationRegister?: ObservationRegister;         // Framing lens used (doc 05, section 12.1)
  createdAtTerm: number;                 // Term index when recorded
  revisedAtTerm?: number;
  supersededBy?: string;                // Points to revised observation
}

type Confidence = 'speculative' | 'tentative' | 'confident' | 'certain';
```

Observations are cheap to create and revise. The system tracks revision history so the player (and the contradiction detector) can see how interpretations have shifted.

The `componentRef` field aligns with the bottom-up component grammar (doc 05): artefacts are built from geometric primitives grouped into functional component-groups (grip-system, head-system, body-system). A player can attach an observation to the whole artefact, a component-group, or a specific component within a group. The `decorativeRef` field targets elements from the decorative grammar (doc 05, section 8) — motifs, surface treatments, applied elements, inscription bands — which are generated as a separate layer from structural components.

Two distinct axes track how an observation was framed. `epistemicMode` records whether the player was describing what they saw ('observational') or what they think it means ('interpretive') — a player can write "marks along the edge" or "evidence of repeated use," and the distinction matters for contradiction detection and lens calibration, since interpretive-mode notes carry more inferential weight. `observationRegister` records which doc 05 register (neutral, functional, aesthetic, ritual, technical) was active when the observation was made — this tracks the *framing* through which the evidence was presented, not the player's epistemic commitment to it. A player could make a technical-register, observational-mode note ("edge deformation consistent with contact against harder material") or a technical-register, interpretive-mode note ("this was used as a chisel"). Both axes feed into contradiction detection and lens calibration, but they're independent.

### 2.2 Inferences

Logical connections between observations. "I noticed X in artefact A, and Y in artefact B, therefore Z."

```typescript
interface Inference {
  id: string;
  conclusion: string;                 // What the player concludes
  evidenceChain: EvidenceLink[];      // Ordered chain of reasoning
  tags: (FunctionTag | ContextTag)[];
  scope: InferenceScope;
  confidence: Confidence;
  createdAtTerm: number;
  revisedAtTerm?: number;
  status: 'active' | 'challenged' | 'retracted';
}

interface EvidenceLink {
  sourceType: 'observation' | 'inference' | 'document';
  sourceId: string;
  role: string;                       // "supports" | "suggests" | "contradicts" | "contextualises"
  note?: string;                      // Player's explanation of why this evidence matters
}

type InferenceScope = 
  | { type: 'artefact'; artefactId: string }
  | { type: 'culture'; cultureLabel: string }
  | { type: 'period'; periodLabel: string }
  | { type: 'material'; materialTag: MaterialTag }
  | { type: 'cross-cultural' };
```

Inferences are where the player does actual intellectual work. The evidence chain is the load-bearing structure — when contradictions arrive, they attack specific links in specific chains.

### 2.3 Hypotheses

Broader claims built from multiple inferences. "Culture A is a maritime trading civilisation" is a hypothesis supported by inferences about coastal finds, imported materials, and boat-related artefacts.

```typescript
interface Hypothesis {
  id: string;
  title: string;
  statement: string;
  supportingInferences: string[];     // Inference IDs
  contradictingInferences: string[];  // Inferences that weaken this
  tags: (FunctionTag | ContextTag)[];
  scope: InferenceScope;
  confidence: Confidence;
  lensStrength: number;               // Computed: how much this warps perception
  published: boolean;                 // Locked in if true
  publicationId?: string;
  createdAtTerm: number;
  revisedAtTerm?: number;
  status: 'active' | 'challenged' | 'retracted';
}
```

Hypotheses are what feed the Interpretive Lens. Their `lensStrength` is computed from confidence, evidence depth, publication status, and whether the player has taught or cited them (see Interpretive Lens doc, Section 4).

### 2.4 Publications

Formalised, committed versions of hypotheses. Once published, they enter the academic record and become significantly harder to retract. Publications are document nodes in the Document Tradition system (doc 10) — immutable snapshots with lineage, dissemination state, and perception properties.

```typescript
interface Publication {
  id: string;
  title: string;
  documentNodeId: string;                 // Reference to the document tradition graph (doc 10)
  claimIds: string[];                     // What claims this publication makes
  evidenceSummary: string;                // Player-authored abstract
  receptionScore: number;                 // How the academic world received it
  citations: number;                      // How often other scholars reference it
  challenges: string[];                   // Contradiction IDs targeting this
  status: 'published' | 'challenged' | 'retracted';
  publishedAtTerm: number;
  retractedAtTerm?: number;
}
```

The document tradition system (doc 10) handles the full lifecycle: form classification from document properties, track (venue) and register (voice) as independent axes, dissemination state progression, retraction cascades through lineage, and perception modelling. Publication track, register, audience, and the working-to-communicative transition are specified there.

Lens strength computation (see Interpretive Lens doc, Section 4) uses the publication's dissemination state and venue prestige from the document node, not a flat "published: boolean" flag. A circulated working paper contributes less lens strength than a published journal article, which contributes less than a collected anthology piece.

---

## 3. The Document System (MVP Scope)

The full document tradition system — immutable nodes, lineage graphs, form classification, dissemination, and perception — is specified in doc 10. This section covers the five *working* document types that carry the knowledge model's core loop. These are the player's desk tools, not communicative outputs. When the player wants to publish, they derive a communicative document from their working documents (doc 10, Section 5), which then enters the dissemination and form classification pipeline.

### 3.1 Artefact Studies

One per artefact. Contains the player's observations, notes, and interpretive summary. This is the primary workspace for individual artefact analysis.

```typescript
interface ArtefactStudy {
  type: 'artefact-study';
  artefactId: string;
  observations: string[];             // Observation IDs
  interpretiveSummary: string;        // Player-authored
  assignedTags: (FunctionTag | ContextTag)[];
  assignedCulture?: string;           // Player's cultural attribution
  assignedPeriod?: string;            // Player's temporal attribution
  relatedStudies: string[];           // Cross-references to other artefact studies
  status: 'draft' | 'complete';
}
```

### 3.2 Material Generalisations

Claims about material use patterns across multiple artefacts. "Culture A uses obsidian for decorative purposes" is a material generalisation.

```typescript
interface MaterialGeneralisation {
  type: 'material-generalisation';
  materialTag: MaterialTag;
  specificMaterial?: string;          // e.g., 'obsidian' specifically, not just 'stone'
  claim: string;                      // Player-authored generalisation
  scope: InferenceScope;
  supportingObservations: string[];   // From specific artefacts
  inferenceId: string;                // The inference this formalises
  confidence: Confidence;
}
```

### 3.3 Cultural Profiles

The player's evolving model of a culture. This is the most complex document type — it aggregates information from many artefact studies and generalisations.

```typescript
interface CulturalProfile {
  type: 'cultural-profile';
  cultureLabel: string;               // Player-assigned name
  summary: string;                    // Player-authored description
  materialPreferences: Array<{
    materialTag: MaterialTag;
    usage: string;                    // "primarily decorative", "tools and weapons", etc.
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
    earliest: string;                 // Player's estimate
    latest: string;
    confidence: Confidence;
  };
  relationships: Array<{
    otherCulture: string;
    type: string;                     // Player's characterisation
    evidence: string[];
  }>;
  hypothesisIds: string[];            // Formal hypotheses about this culture
  artefactIds: string[];              // All artefacts attributed to this culture
}
```

### 3.4 Inference Proofs

Formal evidence chains. These are the backbone of the contradiction system — when a contradiction is detected, it targets specific links in specific proof chains.

```typescript
interface InferenceProof {
  type: 'inference-proof';
  title: string;
  conclusion: string;
  chain: Array<{
    step: number;
    claim: string;                    // What this step asserts
    evidence: EvidenceLink[];         // What supports it
    assumption: string;               // What must be true for this step to hold
  }>;
  confidence: Confidence;
  dependentHypotheses: string[];      // Hypotheses that rely on this proof
}
```

The `assumption` field is key. Every inference step rests on an assumption, and assumptions are attackable. "Step 3 assumes obsidian isn't locally available in Region X" — if a later discovery shows obsidian deposits in Region X, that assumption falls, and everything downstream wobbles.

### 3.5 Revision Records

A log of what the player has changed and why. This serves two purposes: it's a reference tool for the player, and it's data for the contradiction system (which tracks how often the player revises and what triggers revisions).

```typescript
interface RevisionRecord {
  type: 'revision-record';
  targetType: 'observation' | 'inference' | 'hypothesis' | 'cultural-profile';
  targetId: string;
  previousState: string;              // Snapshot of what was believed before
  newState: string;                   // What it was revised to
  reason: string;                     // Player's explanation
  triggerType: 'self-initiated' | 'contradiction' | 'new-evidence' | 'peer-challenge';
  triggerId?: string;                 // What prompted this revision
  termIndex: number;                  // Term when revision occurred
}
```

---

## 4. The Contradiction System

### 4.1 What Is a Contradiction?

A contradiction is a detectable divergence between an agent's interpretive model and the world state's occluded properties. Not all errors are contradictions — only those that produce observable consequences.

If the player wrongly attributes an artefact to Culture A when it's from Culture B, but both cultures are similar, no contradiction surfaces. If the attribution leads the player to predict Culture A uses a material that Culture A never uses, and a future artefact makes that prediction visibly wrong, *that's* a contradiction.

**Contradictions are revealed by consequences, not by checking answers.**

Detection compares claims in an `InterpretiveModel` against occluded properties in `worldState` (doc 11, Sections 2.5 and 2.7). Observable and inferable properties can't produce contradictions — those are already visible. Occluded properties are the ground truth that drives the gap between what an agent believes and what's actually the case. Engine-internal properties are never compared.

### 4.2 Contradiction Types

```typescript
type Contradiction = 
  | MaterialContradiction
  | TemporalContradiction
  | CulturalContradiction
  | StructuralContradiction
  | ProvenanceContradiction
  | CorpusContradiction
  | RarityContradiction
  | MaterialProvenanceContradiction;

interface MaterialContradiction {
  type: 'material';
  description: string;
  // Agent claims Culture X doesn't use Material Y,
  // but a new artefact attributed to Culture X contains Material Y
  agentClaim: { claimId: string; claim: string };
  contradictingEvidence: { artefactId: string; property: string };
  severity: ContradictionSeverity;
}

interface TemporalContradiction {
  type: 'temporal';
  description: string;
  // Agent's chronology places Culture X before Period Y,
  // but a new artefact has provenance that contradicts this
  agentClaim: { claimId: string; claim: string };
  contradictingEvidence: { artefactId: string; provenance: string };
  severity: ContradictionSeverity;
}

interface CulturalContradiction {
  type: 'cultural';
  description: string;
  // Agent's cultural profile predicts something
  // that a new artefact contradicts
  agentClaim: { profileId: string; claim: string };
  contradictingEvidence: { artefactId: string; property: string };
  severity: ContradictionSeverity;
}

interface StructuralContradiction {
  type: 'structural';
  description: string;
  // Agent's inference chain contains a logical impossibility
  affectedProof: { proofId: string; brokenStep: number };
  reason: string;
  severity: ContradictionSeverity;
}

interface ProvenanceContradiction {
  type: 'provenance';
  description: string;
  // Agent attributes an artefact to a context that conflicts with its actual origin
  agentClaim: { studyId: string; claim: string };
  contradictingEvidence: { artefactId: string; actualProvenance: string };
  severity: ContradictionSeverity;
}

interface CorpusContradiction {
  type: 'corpus';
  description: string;
  // Agent's claim conflicts with established professional consensus
  // NB: the corpus may itself be wrong — this is a disagreement, not proof of error
  agentClaim: { claimId: string; claim: string };
  corpusPosition: { publicationIds: string[]; consensus: string };
  severity: ContradictionSeverity;
  // Corpus contradictions are unique: resolution may involve the agent
  // *challenging* the consensus rather than deferring to it.
  // This feeds directly into the claim magnitude system (doc 05, section 4.6).
}

interface RarityContradiction {
  type: 'rarity';
  description: string;
  // Agent's perception of rarity diverges from occluded reality.
  // This can occur at any of the four rarity levels (doc 05, section 10):
  //   geological — material is commoner/rarer than the agent thinks
  //   cultural — production frequency doesn't match the agent's model
  //   site — survival/recovery bias has skewed the agent's sample
  //   perceived — the profession's consensus on rarity is itself wrong
  // Detection compares the agent's sample against the occluded distribution,
  // accounting for which sites have been excavated and how thoroughly.
  agentPerception: { claim: string; inferenceId?: string };
  occludedDistribution: {
    level: 'geological' | 'cultural' | 'site' | 'perceived';
    actualFrequency: string;             // Description of actual rarity
  };
  sampleBias?: string;                   // What's skewing the agent's perception
  severity: ContradictionSeverity;
}

interface MaterialProvenanceContradiction {
  type: 'material-provenance';
  description: string;
  // Agent's claim about WHY a material is present is wrong,
  // even though the material identification itself may be correct.
  // e.g., "obsidian is a trade import" when there's a local deposit,
  // or "local clay" when geological provenance shows distant origin.
  // Distinct from MaterialContradiction (which targets presence/absence)
  // and ProvenanceContradiction (which targets artefact-level context).
  agentClaim: { inferenceId: string; claim: string };
  contradictingEvidence: {
    artefactId: string;
    materialId: string;
    geologicalOrigin: string;            // From MaterialProvenance (doc 05, section 7.1)
  };
  severity: ContradictionSeverity;
}

type ContradictionSeverity = 'minor' | 'moderate' | 'major' | 'critical';
```

### 4.3 Contradiction Detection

Detection runs every time a new artefact is generated or an agent commits a new claim. It compares claims in an agent's `InterpretiveModel` against two sources: the world state's occluded properties (hidden ground truth) and the professional corpus (published consensus from NPC researchers, doc 05 section 4).

The detector is agent-generic — it accepts any `InterpretiveModel` without knowing whether it belongs to the player or an NPC. This means the same detection logic can identify contradictions in NPC scholarship, which is how calibrated NPC errors produce consequences when the player inherits them.

```typescript
interface ContradictionDetector {
  check(
    newArtefact: ClassifiedArtefact,
    interpretiveModel: InterpretiveModel,   // Any agent's model — player or NPC
    worldState: WorldState,                 // Occluded properties are the comparison target
    professionalCorpus: ProfessionalCorpus
  ): Contradiction[];
}
```

Contradictions against occluded world state properties surface as impossible artefacts and field reports. Contradictions against the professional corpus surface through peer channels — an NPC points out that the agent's claim conflicts with established consensus, or a reviewer cites existing literature that contradicts the submission. The corpus can itself be wrong (doc 05, section 4.5 — calibrated wrongness), so contradictions between the player and the corpus don't always mean the player is wrong. They mean there's a disagreement, and the player must decide whether to defer to authority or trust their own evidence.

The dating framework (doc 05, section 4.6) adds a temporal dimension to detection. If the player assigns an artefact to a period that conflicts with the established dating framework, that's a corpus contradiction. If the dating framework itself is wrong and the player has commissioned independent dating, the player may be right — and publishing that challenge follows the claim magnitude system.

Detection also considers the epistemic mode of observations. Observations recorded in interpretive mode (conclusions, not raw descriptions) are more likely to participate in contradictions than observational-mode notes, because interpretations carry more inferential weight.

Detection rules (examples):

| Agent Believes | New Evidence | Contradiction Type | Severity |
|---|---|---|---|
| "Culture A doesn't work iron" | Culture A artefact with iron blade | Material | Major |
| "Culture A pre-dates Culture B" | Culture A artefact found in Culture B stratigraphy above Culture A layers | Temporal | Critical |
| "Obsidian = decorative in Culture A" | Culture A obsidian tool with heavy use-wear | Cultural | Moderate |
| "These two cultures never interacted" | Artefact with materials from both cultures | Cultural | Major |
| "This site is a settlement" | Exclusively funerary artefacts from the site | Provenance | Moderate |
| "This layer dates to ~800 BCE" | Independent dating returns 1200±50 BCE | Temporal | Major |
| "Culture A didn't use gold" | Professional corpus says gold common in Culture A burial contexts | Corpus | Minor |
| "Obsidian is rare in this region" | Agent has only excavated one site; occluded state shows obsidian deposits nearby | Rarity | Moderate |
| "These beads are rare prestige goods" | Agent's sample is from a high-status cemetery; settlement sites produce them abundantly | Rarity | Moderate |
| "Obsidian was imported via trade" | Geological provenance shows local obsidian deposit within 20km | Material Provenance | Major |
| "Local clay used for all ceramics" | Geological analysis shows clay from distant source | Material Provenance | Moderate |

### 4.4 Contradiction Accumulation

Contradictions enter a queue. They are not forced on the player. The queue is visible as a diegetic element — mounting unease, peer whispers, unanswered letters.

```typescript
interface ContradictionQueue {
  items: QueuedContradiction[];
  totalSeverity: number;              // Sum of all unresolved severities
  reputationalPressure: number;       // Increases each term with unresolved contradictions
}

interface QueuedContradiction {
  contradiction: Contradiction;
  detectedAtTerm: number;             // Term index when detected
  termsUnresolved: number;            // How many terms since detection (drives escalation)
  surfacedVia?: DiegeticSurface;      // How it reached the player
  acknowledged: boolean;               // Player has seen it
  resolved: boolean;
  resolution?: Resolution;
}
```

### 4.5 Diegetic Surfacing

Contradictions never appear as system alerts. They arrive through in-world channels:

```typescript
type DiegeticSurface =
  | { channel: 'impossible-artefact'; artefactId: string; anomaly: string }
  | { channel: 'peer-letter'; scholarName: string; argument: string }
  | { channel: 'student-question'; studentName: string; question: string }
  | { channel: 'review-rejection'; journalName: string; reason: string }
  | { channel: 'field-report'; siteName: string; finding: string }
  | { channel: 'public-criticism'; sourceName: string; claim: string };
```

For MVP (minimal NPC implementation), the primary channels are `impossible-artefact` and `field-report`. Peer letters and student questions require at least skeletal NPCs. Review rejections require the publication system. Public criticism requires the popular writing track.

The system selects the most appropriate channel based on what's been implemented and the contradiction type. New channels can be added without changing the detection logic — surfacing is decoupled from detection.

### 4.6 Resolution (Retcon)

When the player addresses a contradiction, they enter a retcon flow:

1. **Acknowledge** the contradiction (view the evidence)
2. **Trace** the affected inference chain (which proof steps are challenged?)
3. **Decide**: revise the hypothesis, reinterpret the evidence, or reject the new evidence with justification
4. **Cascade**: if the hypothesis is revised, all dependent documents update (cultural profiles, other inferences, etc.)
5. **Record**: a revision record is created, tracking the change and its cause

```typescript
interface Resolution {
  type: 'revise' | 'reinterpret' | 'reject';
  contradictionId: string;
  affectedDocuments: string[];        // IDs of all documents that changed
  playerExplanation: string;
  resolvedAtTerm: number;
}
```

**Revise:** The player changes their hypothesis. The lens recalibrates. Dependent documents are flagged for update.

**Reinterpret:** The player keeps their hypothesis but reinterprets the contradicting evidence. ("Yes, there's iron in this Culture A artefact, but it must be a trade import, not local production.") This is valid but accumulates a hidden "strain" score — too many reinterpretations of the same hypothesis signal denial rather than scholarship.

**Reject:** The player argues the new evidence is unreliable. ("The provenance data for this artefact is questionable; it may have been disturbed.") This is also valid but costs credibility and increases the reputational pressure of future contradictions.

---

## 5. The Strain Model

Not every wrong belief produces an immediate contradiction. Some errors accumulate strain — a mounting tension between what the player believes and what the evidence supports — without a clean breaking point.

```typescript
interface HypothesisStrain {
  hypothesisId: string;
  strainScore: number;                // 0–1, accumulates over time
  factors: Array<{
    type: 'reinterpretation' | 'partial-mismatch' | 'missing-evidence'
        | 'peer-doubt' | 'decorative-mismatch';
    description: string;
    contribution: number;
  }>;
}
```

When strain exceeds a threshold, the hypothesis becomes "stressed" — the system increases the frequency and severity of diegetic surfacing. The player starts receiving more pointed questions from students, more sceptical peer reviews, more artefacts that don't quite fit.

The `decorative-mismatch` factor captures the slow-burn tension of motif-based cultural attributions. A motif the player considers Culture A's signature appearing on a Culture B artefact doesn't produce a clean contradiction — motifs travel through trade, imitation, and cultural exchange. But each appearance outside the expected context adds a small amount of strain. Over time, the evidence either vindicates the attribution (Culture A really did originate the motif) or gradually erodes it (the motif was regional, not cultural). This mirrors real archaeological debates about decorative traditions, where "is this a diagnostic marker or just a popular pattern?" can take decades to resolve.

This is the slow-burn version of contradiction. Rather than a single dramatic revelation ("you were wrong!"), the evidence gradually becomes harder to ignore. Some players will recognise the pattern early. Others will double down for much longer. Both are valid and interesting.

---

## 6. The Player's Interpretive Model (Complete)

Bringing it all together. The `InterpretiveModel` interface is agent-generic (doc 11, Section 2.6) — the same structure represents both the player's accumulated knowledge and each NPC scholar's positions. Engine functions accept any `InterpretiveModel` without knowing whose it is.

For the player, additional state tracks working documents, contradiction queues, and lens computation. This extended state is player-specific — NPCs don't need contradiction queues or working documents at MVP.

```typescript
// Agent-generic: any scholar's knowledge
interface InterpretiveModel {
  observations: Map<string, Observation>;
  inferences: Map<string, Inference>;
  hypotheses: Map<string, Hypothesis>;
  publications: Map<string, Publication>;
}

// Player-specific: full desk state
interface PlayerInterpretiveState {
  model: InterpretiveModel;

  // Working documents
  artefactStudies: Map<string, ArtefactStudy>;
  materialGeneralisations: Map<string, MaterialGeneralisation>;
  culturalProfiles: Map<string, CulturalProfile>;
  inferenceProofs: Map<string, InferenceProof>;
  revisionRecords: RevisionRecord[];

  // Document tradition (doc 10)
  knownLineageEdges: KnownLineageEdge[];   // Partial graph — grows via diegetic discovery

  // Contradiction tracking
  contradictionQueue: ContradictionQueue;
  strainScores: Map<string, HypothesisStrain>;

  // Lens state (computed from model + publications + dissemination)
  lensState: LensState;
}
```

The separation matters architecturally. When the contradiction detector runs, it accepts an `InterpretiveModel`. When the lens calculator runs, it accepts an `InterpretiveModel` plus publication/dissemination data. When the peer review generator compares the player's work against a reviewer's positions, it compares two `InterpretiveModel` instances. No function needs to know it's dealing with the player.

---

*Next document: Career & Social Systems — publication tracks, reputation, minimal NPC framework, and how academic politics creates gameplay pressure. See also Document Tradition System (doc 10) for the full document lifecycle, lineage, and perception model. See doc 11, Section 2.6 for the agent-generic principle and Section 2.8 for the time/action economy that governs term-based timestamps throughout.*
