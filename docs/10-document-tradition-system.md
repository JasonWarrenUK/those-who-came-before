# TWCB: Document Tradition System
*Immutable nodes, lineage graphs, form-from-properties, and the lifecycle of academic thought*

---

## 1. Core Principle

A document is immutable once it has been disseminated beyond `private`. It is a snapshot of the player's thinking at the moment it entered the world. When the player revises a disseminated document, they are not editing — they are creating a new document that inherits from the old one. The old document persists at whatever dissemination state it reached, with its own audience, perception, and reputational weight.

Documents in `private` dissemination state are mutable. They are working drafts — the player can edit content, add or remove commitments, revise evidence chains, and change register or audience without creating a new node. Nobody has seen the document, nobody is relying on it, and no perception exists to diverge from. The immutability principle is about social commitment, not about saving. Once the document is circulated, presented, submitted, or published, the snapshot locks and all further changes require derivation.

The player's intellectual history is a directed acyclic graph (DAG) of document nodes connected by derivation edges. A document can have multiple parents (synthesis) and multiple children (a set of lecture notes spawning both refined notes and a journal article). The graph grows monotonically — nodes are never deleted, only superseded.

This mirrors how scholarship actually works. Your 2019 paper doesn't stop existing when you publish a 2024 revision. People who only read the 2019 version are working from the 2019 claims. Retraction is a social act, not an erasure.

---

## 2. Document Nodes

### 2.1 The Node

```typescript
interface DocumentNode {
  id: string;
  authorAgentId: string;                   // Scholar who created this node (player or NPC)

  // Lineage
  lineage: DocumentLineage[];              // How this relates to its ancestors

  // Content properties (inputs to form classification)
  scope: DocumentScope;
  evidenceDepth: number;                   // Computed: total inference chain links cited
  commitments: string[];                   // Claim IDs this document advances
  commitmentStrength: Map<string, Confidence>;  // How strongly each claim is asserted
  synthesisRefs: string[];                 // Other DocumentNode IDs this references
  intendedAudience: Audience;
  register: PublicationRegister;

  // Working vs communicative
  category: 'working' | 'communicative';

  // Derived form (computed from properties, see Section 4)
  formLabel: string;
  formConfidence: 'clear' | 'borderline';  // How cleanly it fits the classification

  // Dissemination
  dissemination: DisseminationState;
  mutable: boolean;                        // Computed: true iff dissemination === 'private'
  venue?: VenueRef;                        // Only at 'submitted' and beyond
  venueFormLabel?: string;                 // What the venue classified it as (may differ)
  disseminationHistory: DisseminationEvent[];

  // Perception (populated once disseminated beyond 'private')
  perception?: DocumentPerception;

  // Metadata
  createdAt: string;
  wordCount?: number;                      // Emergent from content
}
```

### 2.2 Agent-Generic Design

`DocumentNode` is the same structure whether the author is the player or an NPC. All documents live in `worldState` (see doc 08, section 3.1), distinguished only by `authorAgentId`. NPC corpus publications generated during world creation (doc 05) are document nodes with their own lineage, commitments, and dissemination history — they passed through the same lifecycle, just before the game began.

At MVP, the player creates documents interactively; NPC documents are generated at corpus creation and static thereafter. Post-MVP, NPCs could produce new documents in response to the player's publications — same `DocumentNode`, same lineage operations, different authorship.

### 2.3 Property Visibility

Document node properties have varying visibility levels (see doc 11, section 2.7):

- **Observable:** Content, scope, register, audience, form label, dissemination state, venue (if submitted/published), the player's own authorship edges, NPC documents' content.
- **Inferable:** NPC methodological commitments (from patterns across their publications), editorial tendencies of venues (from patterns of acceptance/rejection), citation networks.
- **Occluded:** Full lineage graph (edges the player hasn't discovered yet — see section 9), NPC perception details (what an NPC *actually* thinks of the player's work vs what they say in review), true comprehension rates, takeaway fidelity for audiences the player hasn't directly observed.
- **Engine-internal:** Form classification rule weights, perception decay constants, comprehension curve parameters.

### 2.4 Lineage

Each edge in the lineage graph carries its own derivation type and records which commitments were inherited through that specific edge.

```typescript
interface DocumentLineage {
  parentId: string;
  derivationType: DerivationType;
  inheritedCommitments?: string[];         // Claim IDs carried over via this edge
  inheritedContent?: string;               // Summary of what was pulled from parent
}

type DerivationType =
  | 'revision'        // Supersedes parent — refined, corrected, updated
  | 'extraction'      // Pulls specific content from parent into new context
  | 'synthesis'       // Combines multiple parents into new work
  | 'response'        // Reacts to parent — agreement, critique, extension
  | 'translation'     // Same content reframed for different audience/register
  | 'collection';     // Parent content republished in new container (anthology, proceedings)
```

A document with no lineage entries is a root node — created from scratch, typically from direct observation or claim formation.

A document can have multiple lineage entries with different derivation types. An article might be a `revision` of the player's earlier working paper, an `extraction` from their field notes, and a `response` to an NPC's published claim — all simultaneously.

### 2.5 Derivation and Commitment Inheritance

When the player creates a new document derived from an existing one, the system presents the parent's commitments for review. The player explicitly decides which to carry forward, which to modify, and which to drop.

```typescript
interface DerivationEvent {
  childId: string;
  parentLineage: DocumentLineage[];
  inheritedCommitments: string[];          // Carried forward unchanged
  modifiedCommitments: Array<{
    originalClaimId: string;
    newClaimId: string;                     // Points to revised claim
    reason: string;
  }>;
  droppedCommitments: Array<{
    claimId: string;
    reason?: string;                       // Player may or may not explain
  }>;
  timestamp: number;              // Term index when derivation occurred
}
```

Dropping a commitment from a derived document doesn't retract it from the parent. The parent still asserts it. If the parent is circulated or published, that assertion persists in the world even though the player has moved on. This divergence is detectable — a reviewer might note that the player's newer work no longer supports a claim made in their earlier publication.

Commitments inherited without review (because the player didn't engage with the review step, or because the derivation happened quickly) are flagged as `unreviewed`. The system can later surface these through diegetic channels — "your article appears to still rely on claim X, which you've since revised in other work."

---

## 3. Scope, Audience, and Register

### 3.1 Scope

```typescript
type DocumentScope =
  | { type: 'artefact'; artefactIds: string[] }
  | { type: 'culture'; cultureLabels: string[] }
  | { type: 'period'; periodLabels: string[] }
  | { type: 'material'; materialTags: MaterialTag[] }
  | { type: 'site'; siteIds: string[] }
  | { type: 'cross-cultural' }
  | { type: 'methodological' };            // About method, not about a specific subject
```

Scope is computed from the content — which artefacts, cultures, periods, and materials the document references. A document that references artefacts from three cultures has cross-cultural scope even if the player didn't intend it. Scope can shift if the player adds or removes content during derivation.

### 3.2 Audience

```typescript
type Audience = 'self' | 'peers' | 'students' | 'institution' | 'public';
```

Audience is explicitly chosen by the player. It affects form classification (same properties read differently for different audiences), dissemination expectations, and perception modelling.

- **Self:** Working documents, private notes. No external perception. Cannot establish priority.
- **Peers:** Other researchers in the field. Professional perception. Can establish priority once circulated.
- **Students:** Teaching contexts. Simplified perception model — comprehension rate matters.
- **Institution:** Museum boards, funding bodies. Institutional perception — evaluated on impact and clarity, not on scholarly depth.
- **Public:** General readership. Public perception — vulnerable to simplification and takeaway divergence.

### 3.3 Register

```typescript
type PublicationRegister = 'academic' | 'curatorial' | 'popular' | 'field-notes';
```

Register is the voice in which the document is written. It is independent of audience — a popular-register document can be aimed at peers (an accessible survey), and an academic-register document can be aimed at the public (a dry popular history). The combination of register and audience affects how the document is received:

| Register | For Peers | For Students | For Public |
|---|---|---|---|
| Academic | Normal — expected voice | Dense — lower comprehension | Inaccessible — low reach, high credibility |
| Curatorial | Professional but narrative | Engaging — good comprehension | Readable — good reach, moderate credibility |
| Popular | Unusual — may be seen as insufficiently rigorous | Natural fit | Natural fit |
| Field-notes | Understood as provisional | Confusing without context | Incomprehensible |

Register mismatch between document and venue is detectable. A field-notes register submission to an academic journal will be flagged by reviewers. A popular-register treatment of a complex topic submitted to a specialist publication will be viewed sceptically.

---

## 4. Form Classification

### 4.1 Principle

The player never selects a document form. They write. The system inspects the document's properties and derives a form label. This mirrors artefact classification (doc 05, section 9): the grammar produces a physical structure, and the tag system classifies it from features. Documents work the same way.

The form label is descriptive, not prescriptive. It can change if the player substantially alters the document's content through derivation. It can also be overridden by a venue — a journal might classify a submission differently from how the system would.

### 4.2 Classification Inputs

```typescript
interface FormClassificationInputs {
  scope: DocumentScope;
  evidenceDepth: number;
  commitmentCount: number;
  commitmentMaxStrength: Confidence;
  synthesisRefCount: number;
  intendedAudience: Audience;
  register: PublicationRegister;
  category: 'working' | 'communicative';
  artefactCount: number;                   // How many artefacts are directly referenced
  cultureCount: number;                    // How many cultures are addressed
  responseTarget?: string;                 // If this is a response to another document
}
```

### 4.3 Classification Rules

Form labels are derived from weighted rule matching. Each rule contributes a score toward one or more form labels. The highest-scoring label wins, with ties producing a `borderline` confidence marker.

```typescript
const formRules: FormClassificationRule[] = [
  // Working documents
  {
    condition: (i) => i.category === 'working' && i.evidenceDepth < 3,
    labels: new Map([['field-note', 0.8], ['memo', 0.3]])
  },
  {
    condition: (i) => i.category === 'working' && i.evidenceDepth >= 3,
    labels: new Map([['working-paper', 0.7], ['draft-study', 0.4]])
  },

  // Communicative — narrow scope
  {
    condition: (i) => i.category === 'communicative'
      && i.artefactCount <= 2 && i.commitmentCount <= 1
      && i.evidenceDepth < 5,
    labels: new Map([['research-note', 0.7], ['short-communication', 0.4]])
  },
  {
    condition: (i) => i.category === 'communicative'
      && i.artefactCount <= 2 && i.evidenceDepth >= 5,
    labels: new Map([['case-study', 0.8]])
  },

  // Communicative — moderate scope
  {
    condition: (i) => i.category === 'communicative'
      && i.cultureCount === 1 && i.commitmentCount >= 2
      && i.evidenceDepth >= 5 && i.synthesisRefCount >= 2,
    labels: new Map([['research-article', 0.7], ['study', 0.5]])
  },

  // Communicative — broad scope
  {
    condition: (i) => i.category === 'communicative'
      && i.cultureCount >= 2 && i.synthesisRefCount >= 3
      && i.evidenceDepth >= 8,
    labels: new Map([['comparative-study', 0.7], ['monograph-chapter', 0.3]])
  },

  // Communicative — low evidence, high scope = essay/polemic
  {
    condition: (i) => i.category === 'communicative'
      && i.cultureCount >= 2 && i.evidenceDepth < 4
      && i.commitmentCount >= 2,
    labels: new Map([['essay', 0.6], ['review-article', 0.3], ['polemic', 0.2]])
  },

  // Response documents
  {
    condition: (i) => i.responseTarget !== undefined
      && i.evidenceDepth < 5,
    labels: new Map([['letter', 0.7], ['comment', 0.4]])
  },
  {
    condition: (i) => i.responseTarget !== undefined
      && i.evidenceDepth >= 5,
    labels: new Map([['response-article', 0.6], ['rebuttal', 0.4]])
  },

  // Teaching-oriented
  {
    condition: (i) => i.intendedAudience === 'students'
      && i.scope.type !== 'artefact',
    labels: new Map([['lecture-notes', 0.7], ['teaching-material', 0.5]])
  },

  // Institutional
  {
    condition: (i) => i.intendedAudience === 'institution',
    labels: new Map([['report', 0.6], ['proposal', 0.3]])
  },

  // Survey/review — broad scope, high synthesis, moderate commitment
  {
    condition: (i) => i.category === 'communicative'
      && i.synthesisRefCount >= 5 && i.commitmentMaxStrength !== 'certain',
    labels: new Map([['survey', 0.6], ['review-article', 0.5]])
  },
];
```

These rules are intentionally overlapping. A well-evidenced, narrow-scope document aimed at peers that responds to an NPC's publication might score on both `case-study` and `response-article`. The system picks the highest score, but the `borderline` flag signals that the form is genuinely ambiguous — which is itself useful information for venue matching.

### 4.4 Venue Reclassification

When a document is submitted to a venue, the venue applies its own classification standards. The venue's form label may differ from the system's:

```typescript
interface VenueClassification {
  venueId: string;
  submittedFormLabel: string;              // What the system called it
  venueFormLabel: string;                  // What the venue calls it
  reclassified: boolean;                   // True if these differ
  reclassificationReason?: string;         // "Insufficient evidence for full article"
}
```

Reclassification is a diegetic event. "The editors of [journal] have accepted your submission, but suggest it be published as a research note rather than a full article." The player can accept, withdraw, or appeal (with career consequences for each).

---

## 5. Working vs Communicative Documents

### 5.1 Working Documents

Working documents are the player's desk tools — artefact studies, cultural profiles, inference proofs, private notes. They exist in the `self` audience by default and are not eligible for form classification beyond basic labels (`field-note`, `working-paper`, `memo`).

Working documents feed the knowledge model (doc 06). They are where observations are recorded, inferences are drawn, and hypotheses are formed. They are the raw material from which communicative documents are derived.

A working document can be promoted to communicative by the player explicitly deciding to write for an audience. This is a derivation event — the working document becomes a parent, and the new communicative document is a child with `derivationType: 'extraction'` or `'translation'`. The working document is unaffected.

### 5.2 Communicative Documents

Communicative documents are intended for an audience beyond the player. They undergo form classification, can be disseminated, and accumulate perception properties. Creating a communicative document is the act of taking working knowledge and committing to it publicly — with all the reputational consequences that entails.

The player's working documents (artefact studies, cultural profiles, inference proofs) from doc 06 are explicitly working documents. They cannot be directly submitted to a venue. They must first be derived into a communicative document that advances specific commitments in a specific register for a specific audience.

This separation is load-bearing. A well-developed cultural profile might have the evidence depth and scope of a monograph chapter, but it's a tool — it contains provisional thinking, open questions, and internal notes. The act of writing a paper *from* the cultural profile forces the player to decide what they're actually claiming, how strongly, and what evidence chain they're presenting. That decision is the scholarly work.

---

## 6. Dissemination

### 6.1 States

```typescript
type DisseminationState =
  | 'private'         // On the player's desk
  | 'circulated'      // Shared with specific people (named NPCs)
  | 'presented'       // Delivered to an audience (lecture, conference)
  | 'submitted'       // Under review at a venue
  | 'published'       // Formally published through a venue
  | 'collected';      // Republished in anthology, proceedings, or collection

interface DisseminationEvent {
  state: DisseminationState;
  termIndex: number;              // Term when this transition occurred
  details: DisseminationDetails;
}

type DisseminationDetails =
  | { type: 'circulated'; recipients: string[] }           // NPC scholar IDs
  | { type: 'presented'; event: string; audienceSize: number }
  | { type: 'submitted'; venueId: string }
  | { type: 'published'; venueId: string; finalFormLabel: string }
  | { type: 'collected'; collectionId: string; editorId: string };
```

### 6.2 Dissemination Rules

The transition from `private` to any other state is the critical threshold. It is the moment the document becomes immutable — the snapshot locks, and the node's content, commitments, and properties are fixed. All subsequent changes require creating a new node via derivation (Section 2).

Dissemination is generally forward-only beyond this threshold. A published document cannot be un-published (though it can be retracted — see Section 7). A circulated document cannot be un-circulated — the recipients have already seen it.

Working documents can only reach `circulated` (sharing field notes with a colleague). They cannot be `presented`, `submitted`, or `published` without first being derived into a communicative document.

Each dissemination state increases the document's reputational weight and makes retraction more costly:

| State | Priority | Lens Strength | Retraction Cost |
|---|---|---|---|
| Private | None | Minimal | Trivial (just stop using it) |
| Circulated | Informal | Low | Embarrassing |
| Presented | Semi-formal | Moderate | Professionally awkward |
| Submitted | Pending | Moderate | Withdrawal (minor reputation hit) |
| Published | Formal | High | Retraction (major career damage) |
| Collected | Permanent | Maximum | Near-impossible — can publish correction but original persists |

### 6.3 Uncontrolled Dissemination

Not all dissemination is the player's choice. A document can advance beyond its intended dissemination through external forces:

- **Circulated → Presented:** A colleague references the player's circulated working paper in a conference talk, effectively presenting its claims to a wider audience.
- **Presented → Collected:** Lecture notes taken by students are compiled and circulated, or a conference organiser publishes proceedings without the player's editorial input.
- **Published → Collected:** An editor anthologises the player's earlier work, which may include claims the player has since revised.

Uncontrolled dissemination is surfaced diegetically. The player learns that their notes are circulating, or that their lecture has been summarised in a newsletter. The document node's dissemination state advances, but the player may not have had a chance to review the inherited commitments — meaning outdated or provisional claims enter wider circulation.

```typescript
interface UncontrolledDisseminationEvent extends DisseminationEvent {
  controlled: false;
  agentId: string;                         // Who caused the dissemination
  playerAware: boolean;                    // Does the player know yet?
  contentFidelity: number;                 // 0–1: how accurately the content was reproduced
}
```

### 6.4 Temporal Pacing

Dissemination transitions don't resolve instantaneously. Each transition has a lead time measured in weeks (doc 11, Section 2.8 — explicit week tracking within 12-week terms). These lead times create the strategic texture of publication: submitting too early means the document is locked while contradictions accumulate; submitting too late means competitors publish first.

| Transition | Lead Time (Weeks) | Notes |
|---|---|---|
| Private → Circulated | 0 | Instant — just hand it to someone |
| Private → Presented | 0–12 | Depends on whether a suitable event is upcoming this term |
| Circulated → Submitted | 0 | Player action, instant |
| Submitted → Published (accepted) | 16–48 | Peer review period. Higher-prestige venues take longer. |
| Submitted → Rejected | 8–36 | Rejection can come at any point during review |
| Published → Collected | 36+ | Editor-initiated, not player-controlled |
| Any → Uncontrolled advancement | Variable | Engine-driven events, probabilistic checks at term boundaries |

**Peer review resolution** is checked at term boundaries (doc 08, Section 3.6). When the orchestrator calls `advanceAllDissemination`, each submitted document is checked against its elapsed weeks. Lead times are stored in weeks for verisimilitude — the player sees "expected review: 16–24 weeks" — but resolution occurs at term boundaries because that's when the world ticks.

```typescript
interface PeerReviewState {
  documentId: string;
  venueId: string;
  submittedAtWeek: number;            // Absolute week (termIndex * 12 + weekInTerm)
  reviewerAgentIds: string[];          // Assigned at submission
  estimatedResolutionWeek: number;     // submittedAtWeek + venue review lead time
  status: 'in-review' | 'revise-and-resubmit' | 'decided';
}
```

The estimated resolution week is determined by venue properties. High-prestige journals take 36–48 weeks (3–4 terms); regional journals take 16–24 weeks; conference proceedings take 8–16 weeks. A `revise-and-resubmit` outcome resets the clock (typically 12–24 additional weeks).

**Venue seasonal cycles** are modelled as submission windows. Not all venues are always open:

```typescript
interface VenueTemporalProfile {
  venueId: string;
  submissionMode: 'rolling' | 'seasonal';
  // For seasonal venues:
  openWeeks?: [number, number][];      // Ranges of weeks-within-year (0–47) when submissions are accepted
  cycleLengthWeeks?: number;           // Period of the cycle (e.g., 48 = annual)
  // For all venues:
  reviewLeadTimeWeeks: [number, number]; // Min–max weeks from submission to decision
  publicationLeadTimeWeeks: number;      // Weeks from acceptance to formal publication
}
```

Seasonal venues create calendar pressure: the player must decide whether to rush a document to meet a submission window or wait for the next cycle. Rolling venues are always open but may have longer review times. Conference proceedings have the shortest cycle but lowest prestige. These temporal properties are set per-venue at world generation and are observable (the player can check submission deadlines).

---

## 7. Retraction

Retraction is a social act performed on a specific document node, not an edit. The document continues to exist. It is flagged as retracted, but its content remains accessible and its children are unaffected unless explicitly revised.

```typescript
interface Retraction {
  documentId: string;
  retractedAtWeek: number;                   // Absolute week when retraction was issued
  reason: string;                          // Player-authored
  scope: 'full' | 'partial';
  partialDetails?: string[];               // Claim IDs being retracted, if partial
  venue?: string;                          // Where the retraction is published
  publicAwareness: number;                 // 0–1: how widely the retraction is known
}
```

### 7.1 Retraction Cascade

When a document is retracted, the system identifies all descendant nodes that inherited commitments from the retracted document. These descendants are flagged as `tainted` — their inherited commitments include claims the player has since retracted.

```typescript
interface TaintedLineage {
  documentId: string;                      // The descendant
  retractedAncestorId: string;            // The retracted document
  taintedCommitments: string[];           // Claim IDs that trace back to the retraction
  playerAware: boolean;                   // Has the player been notified?
  resolved: boolean;                      // Has the player addressed this?
}
```

Not all descendants are equally affected. A descendant that independently dropped the retracted claim during its derivation is clean. A descendant that carried the claim forward but added independent supporting evidence may be defensible. A descendant that inherited the claim without review and has no independent support is fully tainted.

The system surfaces tainted lineage diegetically — a reviewer notes that the player's recent work relies on a retracted finding, a colleague asks whether the player still holds a position they've since abandoned. The player can then audit their lineage and decide which descendants need revision.

### 7.2 Retraction Cost

Retraction cost scales with dissemination state, venue prestige, citation count, and how many terms the claim has been in circulation:

```typescript
function computeRetractionCost(doc: DocumentNode, currentTermIndex: number): RetractionCost {
  const baseCost = disseminationCostMap[doc.dissemination];
  const publishedEvent = doc.disseminationHistory.find(
    e => e.state === 'published'
  );
  const termsSincePublication = publishedEvent
    ? currentTermIndex - publishedEvent.termIndex
    : 0;
  const citationFactor = doc.perception?.citationCount ?? 0;
  const venueFactor = doc.venue?.prestige ?? 0;

  return {
    reputationHit: baseCost * (1 + termsSincePublication * 0.05) * (1 + citationFactor * 0.02),
    careerImpact: venueFactor > 0.7 ? 'severe' : venueFactor > 0.4 ? 'moderate' : 'minor',
    publicConfusion: doc.perception?.audienceReach ?? 0
  };
}
```

---

## 8. Perception

### 8.1 Principle

The document the player created is not the document the audience received. Perception tracks the gap between authorial intent and audience understanding.

Perception properties are computed once a document advances beyond `private` dissemination. They vary by audience type and are influenced by register match, document length, complexity, and the audience's prior knowledge.

### 8.2 Perception Model

```typescript
interface DocumentPerception {
  // Reach
  audienceReach: number;                   // How many people encountered this
  audienceType: Audience;                  // Who encountered it

  // Comprehension
  comprehensionRate: number;               // 0–1: how much of the content was absorbed
  comprehensionFactors: ComprehensionFactor[];

  // Takeaway
  takeawayClaims: TakeawayClaim[];         // What the audience thinks the document says
  takeawayDivergence: number;              // 0–1: gap between intended and received message

  // Citation
  citationCount: number;
  citationFidelity: number;               // 0–1: how accurately others represent the claims

  // Persistence
  lastReferencedAt: string;                // When someone last cited or mentioned this
  decayRate: number;                       // How quickly this fades from active discourse
}
```

### 8.3 Comprehension

Comprehension is not uniform. A long document written in academic register for a student audience will have lower comprehension than a short document in popular register for the same audience. Comprehension rate affects which commitments enter the audience's awareness — and therefore which claims contribute to the document's reputational impact.

```typescript
interface ComprehensionFactor {
  factor: 'length' | 'register-mismatch' | 'complexity' | 'audience-expertise' | 'presentation-quality';
  impact: number;                          // Positive = helps comprehension, negative = hurts
  description: string;
}
```

For teaching contexts specifically, comprehension follows a position curve — early content is absorbed better than later content, especially in lectures and long documents. A lecture covering five hypotheses in order will have the first two or three absorbed well and the remainder fading. If the player front-loads their strongest claims, the audience receives the strongest version of the argument. If they bury key claims late, those claims may not register with the audience at all — but they're still in the document and can be cited by careful readers.

```typescript
interface PositionalComprehension {
  commitmentId: string;
  positionInDocument: number;              // 0–1 normalised position
  comprehensionAtPosition: number;         // Decays based on audience and format
  audienceAware: boolean;                  // Did the audience register this claim?
}
```

### 8.4 Takeaway Divergence

The audience doesn't just absorb or miss claims — they simplify them. A nuanced argument gets compressed into a headline. A tentative hypothesis gets hardened into received wisdom. A careful distinction gets collapsed.

```typescript
interface TakeawayClaim {
  originalCommitmentId: string;
  originalConfidence: Confidence;
  perceivedConfidence: Confidence;         // Audience may overstate or understate certainty
  simplifiedClaim: string;                 // What the audience thinks was said
  fidelity: number;                        // 0–1: how close the simplification is to the original
}
```

Takeaway divergence is highest when:
- Register doesn't match audience (academic register for public audience)
- The document contains many claims at varying confidence levels (audiences tend to flatten everything to the same confidence)
- The document is long (later claims get compressed more aggressively)
- The claim is counterintuitive (audiences reshape surprising claims to fit expectations)

Low-fidelity takeaways circulate as `publicMisconceptions` in the professional corpus (see doc 05, section 12.3). These are simplified versions of the player's findings that may later cause complications — a peer challenges a position the player never actually held, based on a garbled version of their work that entered circulation.

### 8.5 Reputational Lag

Perception does not update instantly when the player revises their position. A retracted document's perception properties persist. The `publicAwareness` of a retraction takes terms to propagate — checked at each term boundary (doc 08, Section 3.6). During the lag period, the player's earlier position continues to circulate and influence the profession's view of their work.

```typescript
interface ReputationalLag {
  originalDocumentId: string;
  revisionDocumentId: string;             // The newer position
  lagDurationTerms: number;               // Terms until old perception fully decays
  termsElapsed: number;                   // Incremented at term boundaries
  audienceUpdated: number;                // 0–1: fraction aware of the revision (increases per-term)
  persistentMisconceptions: string[];     // Takeaway claims that survive the revision
}
```

This creates a genuine career management problem. The player must weigh the cost of leaving a flawed publication in circulation against the cost of retraction. Sometimes the answer is neither — you publish a new document that supersedes the old one without explicitly retracting it, and hope the profession follows you to the new position. This is exactly what real scholars do.

---

## 9. Lineage Awareness (Interpretive Model)

### 9.1 Principle

The full document graph exists in `worldState`. The player's awareness of their own lineage is partial and lives in their `InterpretiveModel`. The player knows the connections they created (authorship edges) but may not know downstream consequences — citations, collections, student notes, NPC responses — until they're surfaced diegetically.

### 9.2 Known Edges

```typescript
interface KnownLineageEdge {
  fromId: string;
  toId: string;
  derivationType: DerivationType;
  discoveredVia: LineageDiscovery;
  discoveredAt: string;
}

type LineageDiscovery =
  | 'authorship'              // Player created the child — always known
  | 'citation-alert'          // Notified that someone cited this document
  | 'peer-reference'          // A colleague mentioned the connection
  | 'review-feedback'         // A reviewer pointed out the relationship
  | 'self-review'             // Player searched their own lineage
  | 'student-work'            // Student's work revealed the connection
  | 'controversy';            // Public dispute made the lineage newsworthy
```

Authorship edges are always known immediately. All other edges are discovered through diegetic channels. The lineage UI shows only known edges — a partial, growing graph.

### 9.3 Lineage Surprises

The gap between the full graph and the known graph is where surprises live. A document the player forgot about. A connection they didn't realise existed. A student's thesis that built on their lecture notes and reached conclusions the player disagrees with.

These surprises are gameplay events, surfaced through the same diegetic channels as contradictions (doc 06, section 4.5):

- **Peer letter:** "I noticed your recent article conflicts with a position you took in your 2019 field notes..."
- **Review rejection:** "The reviewer notes that your earlier publication on the same topic reached the opposite conclusion..."
- **Student question:** "In your lectures you said X, but your published paper says Y. Which is correct?"
- **Citation alert:** "Your field notes have been cited by [NPC] in support of a claim you don't endorse..."

Each surprise reveals a new edge in the known lineage graph and may trigger a contradiction if the connected documents make incompatible commitments.

---

## 10. Integration Points

| System | Document Tradition Touches |
|---|---|
| Interpretation / Claims (doc 06) | Working documents are where observations are recorded, inferences are drawn, and claims are formed. Communicative documents derive from working documents, inheriting and committing to specific claims from the author's `InterpretiveModel` |
| Interpretive Lens (doc 04) | Lens strength computed from commitment strength × dissemination state. Published commitments warp perception more than circulated ones. Retracted commitments reduce lens strength but don't eliminate it instantly due to reputational lag |
| Contradiction System (doc 06) | Contradictions can target specific document nodes. Retraction cascades trace tainted lineage. Divergent descendants within the player's own graph create self-contradictions |
| Career & Social (doc 07) | Dissemination events are career events in `worldState`. Venue acceptance/rejection affects reputation (a scholar entity property). Retraction cost scales with career stage. Uncontrolled dissemination creates career pressure |
| Generation Architecture (doc 05) | NPC corpus publications exist as document nodes with their own lineage (same `DocumentNode`, different `authorAgentId`). Player citations create edges into NPC subgraphs. NPC retraction taints player's dependent work |
| Register System (doc 05) | Publication register is a property of the document node. Register-audience mismatch affects comprehension and venue acceptance |

---

## 11. MVP Scope

For MVP, the document tradition system operates with reduced complexity:

- **Lineage:** Full DAG structure, but limit graph depth. Most documents will have 0–2 parents.
- **Form classification:** 5–6 form labels sufficient: `field-note`, `working-paper`, `research-note`, `study`, `essay`, `lecture-notes`. Full rule set deferred.
- **Dissemination:** `private`, `circulated`, `submitted`, `published`. Defer `presented` and `collected` until NPC social systems are richer.
- **Perception:** Simplified model — `audienceReach`, `takeawayDivergence`, `citationCount`. Positional comprehension and full takeaway modelling deferred.
- **Uncontrolled dissemination:** Defer entirely. All dissemination is player-initiated for MVP.
- **Retraction:** Full retraction mechanics including cascade, but simplified cost calculation.
- **Lineage awareness:** Authorship edges only for MVP. Diegetic lineage discovery requires NPC channels that may not exist yet.

The critical MVP path is: working document → derive communicative document → submit → receive form classification from venue → publish → accumulate perception → retract if contradicted. This path exercises the core loop without requiring the full social simulation.

---

*Cross-references: Knowledge & Contradiction Model (doc 06), Interpretive Lens (doc 04), Career & Social Systems (doc 07), Generation Architecture (doc 05), Deferred Design Questions (doc 11)*
