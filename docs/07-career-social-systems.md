# TWCB: Career & Social Systems
*Publication tracks, reputation, minimal NPCs, and the social cost of being wrong*

---

## 1. Why Career Systems Exist

The career layer isn't "progression for progression's sake." It exists to create **consequences for intellectual commitment**. Without it, the player can hypothesise freely, publish freely, and retract freely — which makes the lens toothless and contradictions painless.

Career systems create a ratchet: the further you commit to a line of reasoning, the more the lens warps your perception *and* the more painful it is to admit you were wrong. This isn't punitive design — it's honest simulation. Academic careers really do work this way. Reputations are built on published claims, and retracting those claims costs social capital.

The career layer also provides the self-correcting oracle defence: a player who follows NPC scholars' ideas instead of developing their own publishes nothing original, cites constantly, and ends up with a reputation as a competent summariser rather than a serious researcher. The career penalties for intellectual passivity emerge naturally from the system rather than requiring a special rule.

---

## 2. Reputation Model

Reputation is multidimensional, not a single number. A player can be respected in one area and dismissed in another.

```typescript
interface Reputation {
  overall: number;                        // 0–1, weighted composite
  dimensions: {
    rigour: number;                       // Quality of evidence chains
    breadth: number;                      // Range of cultures/periods studied
    originality: number;                  // Novel claims vs echoing peers
    reliability: number;                  // Track record of claims surviving scrutiny
    influence: number;                    // Citations, students, public reach
  };
  modifiers: ReputationModifier[];        // Active temporary effects
}

interface ReputationModifier {
  source: string;                         // What caused this modifier
  dimension: keyof Reputation['dimensions'];
  delta: number;
  duration: 'permanent' | { decayPerTerm: number };  // Decaying modifiers lose strength each term
  appliedAt: number;                      // Term index when applied
}
```

### 2.1 How Reputation Changes

| Event | Rigour | Breadth | Originality | Reliability | Influence |
|---|---|---|---|---|---|
| Document published (high-prestige venue) | +0.1 | — | +0.1 | — | +0.05 |
| Document published (broad-reach venue) | — | — | — | — | +0.15 |
| Published with strong evidence chain | +0.15 | — | — | +0.1 | — |
| Published with weak evidence chain | -0.05 | — | — | -0.1 | — |
| Study a new culture | — | +0.1 | — | — | — |
| Study a new period | — | +0.05 | — | — | — |
| Retract a document | -0.05 | — | — | -0.15 | -0.1 |
| Retract gracefully (with evidence) | +0.05 | — | — | +0.05 | — |
| Cite peer excessively | — | — | -0.1 | — | — |
| Get cited by peer | — | — | — | +0.05 | +0.1 |
| Resolve contradiction well | +0.1 | — | — | +0.1 | — |
| Ignore contradiction (accumulating) | — | — | — | -0.05/term | — |
| Downward form reclassification | -0.05 | — | — | — | — |
| Upward form reclassification | +0.05 | — | +0.05 | — | — |
| Published document contains error | — | — | — | -0.05 | +0.05 |
| Submission rejected (high-prestige venue) | — | — | — | -0.05 | — |
| Multiple revision rounds at same venue | -0.05 | — | — | — | — |

The asymmetry is deliberate. Publishing a popular article with errors still *increases* influence (more people read it) while decreasing reliability. This creates a real tension: you can become famous for work that's wrong, and unwinding that fame is harder than building it.

### 2.2 Reputation Effects

Reputation gates certain activities and modifies outcomes:

```typescript
interface ReputationGate {
  activity: string;
  requiredDimension: keyof Reputation['dimensions'];
  threshold: number;
  failureMessage: string;               // Diegetic explanation
}

const reputationGates: ReputationGate[] = [
  {
    activity: 'publish-academic',
    requiredDimension: 'rigour',
    threshold: 0.3,
    failureMessage: 'The journal editor suggests you strengthen your methodology before resubmitting.'
  },
  {
    activity: 'supervise-student',
    requiredDimension: 'reliability',
    threshold: 0.5,
    failureMessage: 'No students have requested your supervision this term.'
  },
  {
    activity: 'keynote-invitation',
    requiredDimension: 'influence',
    threshold: 0.7,
    failureMessage: 'The conference organisers selected another speaker.'
  },
  {
    activity: 'field-expedition',
    requiredDimension: 'overall',
    threshold: 0.4,
    failureMessage: 'The funding committee declined your excavation proposal.'
  },
];
```

---

## 3. How Documents Interact With Career

The document tradition system (doc 10) defines what documents are: immutable nodes in a lineage graph with content properties, dissemination states, and perception. This section specifies what the career system *does* with them — how venues shape the player's professional landscape, how dissemination state transitions create career events, how peer review functions as a named social act, and how form reclassification signals professional standing.

### 3.1 Venues

Venues are where documents meet the world. They are generated during world creation alongside the professional corpus, each with properties that determine what kind of work they accept, how they evaluate it, and what career weight publication there carries.

A venue is not a category. It's a bundle of properties from which descriptive labels can be derived, consistent with artefact classification (doc 05) and document form classification (doc 10). A venue described by its properties might *read* as "a prestigious specialist journal" or "a regional museum exhibition programme," but those labels emerge — they're never assigned.

```typescript
interface VenueDefinition {
  id: string;
  name: string;

  // Structural properties — how publication works here
  containerModel: ContainerModel;
  temporalMode: TemporalMode;
  artefactSituated: boolean;             // Does the audience encounter actual artefacts alongside the work?
  editorialProcess: EditorialProcess;
  audienceEncounter: AudienceEncounter;

  // Prestige inputs — computed, not assigned
  editorialRigour: number;               // 0–1, how demanding the review process is
  scope: VenueScope;
  reach: number;                         // 0–1, size of audience
  establishment: number;                 // 0–1, longevity and institutional entrenchment

  // Subject alignment — what this venue cares about
  subjectFocus: {
    cultureAffinities?: string[];        // Which cultures this venue gravitates toward
    periodAffinities?: string[];         // Which periods
    methodologicalLeaning?: string;      // Structuralist, materialist, etc.
  };
}

// How publication is structured at this venue
type ContainerModel =
  | 'periodical'                         // One-of-many in a curated issue
  | 'standalone'                         // Self-contained work (book, monograph)
  | 'curated-space'                      // Exhibition, gallery, spatial installation
  | 'event';                             // Conference, lecture series

// When and how often the venue accepts work
interface TemporalMode {
  submissionWindow: SubmissionWindow;
  leadTime: number;                      // Terms between acceptance and publication (1–3 typical)
  visibilityWindow: number | 'indefinite'; // Terms the work remains "current" before fading into the backlist
}

interface SubmissionWindow {
  frequency: number;                     // Windows per year (1 = annual, 3 = termly, etc.)
  alignment?: 'term-start' | 'term-end' | 'annual' | 'event-tied';
  open: boolean;                         // Is a window currently open?
}
```

> **Superseded (doc 12, section 2.17):** `TemporalMode` and `SubmissionWindow` above are superseded by doc 10 section 6.4's week-denominated `VenueTemporalProfile` — weeks are the canonical timestamp (doc 12, section 2.9), and `VenueDefinition.temporalMode` is now `temporalProfile: VenueTemporalProfile`. `visibilityWindow` has no week-denominated equivalent and no consumer; it is deferred post-MVP.

```typescript

type EditorialProcess =
  | 'peer-review'                        // Named reviewers evaluate submission
  | 'editorial-commission'               // Editor invites or commissions work
  | 'curatorial-selection'               // Curator selects work for exhibition/collection
  | 'open-submission';                   // Minimal gatekeeping

// How the audience encounters work published here
type AudienceEncounter =
  | 'sought'                             // Readers go looking for it (journals, books)
  | 'situated'                           // Encountered in situ (museum, public space)
  | 'captive';                           // Audience is present and committed (lecture, conference)

// Venue subject range — emergent, not categorical
interface VenueScope {
  cultureRange: number;                  // 0–1, how many cultures the venue covers
  periodRange: number;                   // 0–1, how many periods
  methodologicalRange: number;           // 0–1, how ecumenical the editorial stance
}
```

Venue prestige is computed from these properties, not assigned as a tier. A venue with high editorial rigour, narrow scope, long establishment, and moderate reach computes differently from one with low rigour, broad scope, and massive reach. Both are "prestigious" in different senses, and the career system treats them differently: the first signals rigour and specialist credibility, the second signals influence and public profile.

Subject focus creates venue-player fit. Submitting a River Basin culture study to a venue that specialises in highland civilisations gets a different reception than submitting it to one that covers your region. Mismatched submissions aren't automatically rejected — a strong enough paper transcends venue focus — but they face higher scrutiny and a reviewer pool less sympathetic to the work.

Venues are static once generated for MVP. Shifting venue attributes (reputation damage from retracted publications, editorial turnover, scope drift) are deferred to post-MVP (see doc 11).

### 3.2 Dissemination as Career Event

Each dissemination state transition (doc 10, Section 6) is a career event with reputation consequences. The old model treated publication as a single moment; the new model recognises a pipeline of commitments with escalating stakes.

**Private → Circulated.** Low stakes. The player has shown a draft to colleagues. Reputation effect is minimal — a faint signal that work is in progress, which matters for priority claims later. But if the draft is weak, the recipients remember. This is where NPC relationship dynamics first touch documents: who the player circulates to, and what those scholars think of it, shapes future interactions. A circulated draft that contradicts a colleague's published position can strain a relationship before the work is even submitted.

**Circulated → Submitted.** A declaration of readiness. The player has committed to a venue and implicitly claimed "this work meets your standards." Submission to a venue with high editorial rigour is itself a reputational act — the venue's editorial board now has an opinion of the player's judgement. Submission to a venue whose subject focus doesn't match the work signals poor professional awareness.

**Submitted → Published.** The major career event. This is where peer review occurs (for venues that use it), form reclassification can happen (Section 3.4), and the document enters the permanent record. Reputation effects scale with venue prestige properties. Lens strength locks at a level determined by dissemination state and venue prestige (see doc 04 for the graduated calculation). A published document in a high-rigour, well-established venue contributes substantially more lens strength and reputational weight than one in a low-rigour, broad-reach outlet — but the latter generates more influence.

**Published → Collected.** Deferred for MVP. The career implication: someone else thought the work worth anthologising. A prestige signal the player didn't initiate, making it particularly valuable for the influence and establishment dimensions.

Reputation effects from dissemination events are not flat bonuses. They scale with venue properties:

```typescript
interface DisseminationCareerEffect {
  transition: DisseminationTransition;
  venueId: string;
  reputationEffects: {
    dimension: keyof Reputation['dimensions'];
    delta: number;                       // Computed from venue properties + document properties
    basis: string;                       // Diegetic explanation of why this effect occurred
  }[];
  lensEffect: number;                    // Contribution to commitment lens strength
}

type DisseminationTransition =
  | 'private-to-circulated'
  | 'circulated-to-submitted'
  | 'submitted-to-published'
  | 'published-to-collected';
```

The `basis` field is important: every reputation change has a diegetic explanation the player can read. Not "+0.1 rigour" but "The editorial board of the Lowland Studies Quarterly noted the thoroughness of your stratigraphic analysis." This keeps career mechanics inside the fiction.

### 3.3 Peer Review as Career Mechanic

Peer review in TWCB is named, not anonymous (see doc 11, Section 2.1). The reviewer is identified, their published positions are known, and their assessment is a public professional act. This makes peer review a social event with career consequences beyond the binary of acceptance or rejection.

Three outcomes, each with distinct career implications:

**Accepted.** The document transitions to `published` at the venue. Reputation boost scales with venue prestige properties — acceptance at a high-rigour, well-established venue is the strongest single career event outside retraction. The reviewer's identity matters: acceptance from a reviewer whose corpus contradicts your claims carries implicit validation. Acceptance from an ally is expected and worth less.

**Revisions requested.** The submitted document is immutable (doc 10, Section 1). "Revisions requested" means the player must derive a new document node from the submission, incorporate the reviewer's feedback, and resubmit. The original submission persists — the reviewer saw it, formed an impression, and that impression doesn't vanish even if the revision is accepted. Career-wise, a single round of revisions is normal and carries negligible reputation cost. Multiple revision rounds at the same venue begins to erode rigour reputation. Each revision cycle costs time and energy within the term (2–3 weeks writing, 10–15 energy) plus at least one additional term for the re-review — the player may miss the venue's submission window if the revision takes too long.

**Rejected.** The submission node persists, flagged as rejected at that venue. The player can derive a new version and submit elsewhere. Career consequences depend on venue properties and rejection reasoning. The reviewer delivers their assessment as named correspondence: "Dr. Okafor found your material analysis insufficiently grounded in the stratigraphic record" hits reliability. "The scope of this work falls outside the Quarterly's remit" is barely a scratch. Repeated rejections from venues whose subject focus matches the player's work is a clear signal that something is wrong with the work itself, not just the venue targeting.

The reviewer relationship is bidirectional. Review is a career activity (Section 4) — when the player reviews *others'* work, they see alternative interpretations and form opinions about their peers. And reviewers remember. A reviewer who rejected the player's last submission and then sees a new one arrives with context. A reviewer whose own work the player has publicly challenged brings that friction to the review. Named review makes all of this visible and consequential.

```typescript
interface PeerReviewCareerEvent {
  documentNodeId: string;
  venueId: string;
  reviewerId: string;                    // NPC scholar ID
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

interface ReviewerFeedback {
  scholarName: string;
  assessment: string;                    // Diegetic text — the reviewer's letter
  methodologicalConcerns: string[];      // Specific issues raised
  commitmentsDisputed: string[];         // Which of the document's commitments the reviewer challenges
  commitmentsEndorsed: string[];         // Which the reviewer finds well-supported
}
```

The `commitmentsDisputed` and `commitmentsEndorsed` fields connect peer review to the knowledge model (doc 06). A reviewer doesn't just accept or reject a document — they engage with specific claims. Disputed commitments are potential contradiction seeds. Endorsed commitments from a hostile reviewer are particularly strong validation.

### 3.4 Form Reclassification as Career Signal

Document form classification is emergent from content properties (doc 10, Section 4). When a document is submitted to a venue, the venue may assign a different form label than the one the system derived from the document's properties. The player never explicitly chooses a form — they write, and the system and venue independently assess what they've written.

The gap between "what the system classified your document as" and "what the venue classified it as" is a career signal, delivered diegetically as editor correspondence.

**Downward reclassification.** The player's document was classified as a study; the venue accepts it as a research note. The editor's letter explains: "We were impressed by the theoretical scope of your submission, though the committee felt the evidence base better suited a shorter form. We're pleased to accept it as a research note for our spring issue." The player reads between the lines. Career effect: a dent to rigour reputation — the venue found the work insufficient for the form the player implicitly claimed. The document is still published, still enters the record, still warps the lens. But the form label follows it, and other scholars see a research note, not a study.

**Upward reclassification.** The player submitted what the system classified as a working paper or research note; the venue publishes it as a study or article. Rarer, and a strong positive signal. The editor saw more substance than the player recognised. Career effect: a boost to rigour and possibly originality — the player undersold their own work. In academic culture this reads as either productive modesty or genuine insight that the player hadn't fully appreciated the significance of.

**Lateral reclassification.** The player submitted a study; the venue publishes it as an essay. Not clearly up or down — it suggests the venue sees the work as theoretically provocative but evidentially thin, or methodologically interesting but narrower in scope than a full study. Career effect is ambiguous: the player gains on originality (essays are read as thinking-pieces) but the form label signals less empirical weight. This is the subtlest reclassification and the one most likely to generate productive uncertainty about how the field perceives the player's work.

Reclassification is discovered by the player through editor correspondence, not through UI notification. The player submits a document, time passes, and a letter arrives. The letter's tone, phrasing, and the form label it assigns are the signal. No explicit "your document was reclassified" message — just the evidence, and the player's interpretation of it.

```typescript
interface FormReclassificationEvent {
  documentNodeId: string;
  venueId: string;
  originalForm: string;                  // System-derived form label at submission
  venueForm: string;                     // Venue-assigned form label at publication
  direction: 'downward' | 'upward' | 'lateral';
  editorCorrespondence: string;          // Diegetic letter text
  reputationEffects: {
    dimension: keyof Reputation['dimensions'];
    delta: number;
    basis: string;
  }[];
}
```

---

## 4. Career Progression

The player's career is not a levelling system. It's a set of roles and activities that become available (or unavailable) based on reputation and published work, played out within the term-based time/action economy (doc 11, Section 2.8).

### 4.0 Term Economy

Each term (4 per year — autumn, spring, summer-teaching, summer-research — ~120 per career), the player has two resources: **time** (a fixed window of 12 weeks) and **energy** (a depletable pool that partially replenishes between terms). Activities consume both, but in different proportions — fieldwork is time-heavy, deep interpretation is energy-heavy, administrative tasks are both. The summer-research term has no teaching background drain, creating a strategically distinct season with a higher effective energy budget.

Energy carry-over between terms creates long-arc consequences. A player who pushes hard for several terms accumulates energy debt; work produced at low energy is lower quality (weaker commitment strength, higher error likelihood, lower form classification at venues). Recovery requires lighter terms — which means professional opportunities passing unused.

```typescript
interface TermState {
  termIndex: number;                     // 0-based, within the career
  year: number;                          // Derived: Math.floor(termIndex / 4)
  termType: TermType;                    // 'autumn' | 'spring' | 'summer-teaching' | 'summer-research'
  timeRemaining: number;                 // Weeks remaining in this term
  energy: number;                        // Current energy level
  energyCap: number;                     // Maximum energy (may vary by circumstance)
  activeActivities: ActiveActivity[];    // Currently running concurrent activities
  backgroundDrains: BackgroundDrain[];   // Ongoing energy costs (teaching, admin, etc.)
}

interface ActiveActivity {
  activityId: string;
  type: ActivityType;
  weeksRemaining: number;
  energyPerWeek: number;                 // Ongoing drain while active
  qualitySnapshot?: number;              // Energy level when work phase began (affects output quality)
}

interface BackgroundDrain {
  source: string;                        // 'teaching' | 'administration' | 'supervision' | etc.
  energyPerWeek: number;
  roleImposed: boolean;                  // true = mandatory for current role
}
```

**Note:** canonical term and time types live in doc 08 §3.6 (TERMS_PER_YEAR = 4, `currentAbsoluteWeek`); this block shows only the career-specific fields.

**Background drains by role:**

| Role | Teaching | Administration | Supervision | Total Background Drain/Week |
|---|---|---|---|---|
| Postdoctoral Researcher | 0 | 0 | 0 | 0 |
| Junior Lecturer | 1.5 | 0.5 | 0 | 2.0 |
| Senior Lecturer | 2.0 | 1.0 | 0.5 | 3.5 |
| Reader | 1.5 | 1.5 | 1.0 | 4.0 |
| Professor | 1.0 | 2.5 | 1.5 | 5.0 |

*(Values are illustrative — final tuning requires playtesting. The pattern matters more than the numbers: postdocs are free; mid-career roles are teaching-heavy; senior roles shift from teaching to administration.)*

Sabbatical terms zero out all background drains for the term. The player starts with full energy and no mandatory obligations — the most productive term they'll experience. Sabbaticals are rare (available only at Reader/Professor rank, once per ~7–10 terms) and represent a genuine strategic resource: when to spend that window of clarity.

```typescript
interface CareerState {
  currentRole: AcademicRole;
  activities: CareerActivity[];           // Currently available
  completedActivities: CareerActivity[];
  tenure: boolean;
  fieldSeasons: number;                   // Times the player has led excavations
  studentsSupervised: number;
  publicProfile: number;                  // 0–1, media visibility
  sabbaticalCooldown: number;             // Terms until sabbatical is available again
  onSabbatical: boolean;
}

type AcademicRole = 
  | 'postdoctoral-researcher'
  | 'junior-lecturer'
  | 'senior-lecturer'
  | 'reader'
  | 'professor';
```

### 4.1 Activities

Activities are concurrent undertakings within a term that consume time, energy, or both. Multiple activities can run simultaneously — the player juggles teaching, research, and administrative obligations just as a real academic does. The constraint isn't "pick one action" but "can you afford the energy cost of everything you're trying to do at once?"

```typescript
interface CareerActivity {
  id: string;
  type: ActivityType;
  available: boolean;
  requirements: ReputationGate[];
  timeCost: number;                       // Weeks within the term
  energyCost: {
    upfront: number;                     // Energy spent at the start
    perWeek: number;                     // Ongoing drain while running
  };
  exclusive?: string[];                  // Activity types that can't run concurrently
  outcomes: ActivityOutcome[];           // Possible results
}

type ActivityType = 
  | 'field-season'           // Lead excavation → new artefacts
  | 'conference-presentation'// Present findings → reputation + peer feedback
  | 'grant-application'     // Secure funding → unlock field season or equipment
  | 'student-supervision'   // Mentor student → student questions (contradiction channel)
  | 'peer-review'           // Review others' work → see alternative interpretations
  | 'public-engagement'     // Public events → influence + popular writing
  | 'sabbatical'            // Reduced lens + full energy + no background drains
  ;
```

**Activity profiles:**

| Activity | Time (weeks) | Energy (upfront + /week) | Exclusive With | Notes |
|---|---|---|---|---|
| Field season | 8–12 | 10 + 3/wk | teaching, conferences | Full-term commitment. Can't teach while in the field. Produces artefacts tied to site/culture. |
| Conference presentation | 2–3 | 15 + 2/wk | — | Preparation + travel + delivery. Can run alongside teaching. Triggers peer feedback. |
| Grant application | 2–4 | 12 + 1/wk | — | Writing + committee interaction. Low time, moderate energy. Outcome resolved at term boundary. |
| Student supervision | 8–12 | 5 + 1/wk | — | Runs most of the term as a low drain. Generates student questions targeting weak proofs. |
| Peer review | 2–3 | 8 + 2/wk | — | Reviewing another scholar's submitted work. Exposes alternative interpretations (the mirror). |
| Public engagement | 1–2 | 5 + 1/wk | — | Exhibition opening, public lecture, popular writing. Low cost, influence-weighted. |
| Sabbatical | 12 (full term) | 0 | all role obligations | Zeroes background drains. Cannot be combined with teaching. Available only at Reader/Professor. |

**Inspection, writing, and desk work** are not "activities" in the career sense — they're the player's core research actions, always available within the term, consuming time and energy at varying rates. Writing a communicative document might take 3 weeks and 20 energy. Inspecting a simple artefact might take 2 days and 3 energy. These are the player's primary time/energy expenditure; career activities create *additional* concurrent demands on the same pools.

### 4.2 Role Advancement

Roles unlock through accumulated reputation and activity completion, not through explicit "level up" events. The transition is diegetic — a letter of appointment, a change in office location, a new nameplate on the door. Advancement is checked at term boundaries.

```typescript
interface RoleRequirement {
  reputation: Partial<Record<keyof Reputation['dimensions'], number>>;
  publishedDocuments: number;            // Documents at 'published' dissemination state or beyond
  minVenuePrestige?: number;             // At least N documents published at venues above this prestige threshold
  activities: ActivityType[];
  minTermsInRole?: number;               // Minimum terms spent in current role before eligible
}

const roleRequirements: Record<AcademicRole, RoleRequirement> = {
  'postdoctoral-researcher': { reputation: {}, publishedDocuments: 0, activities: [] },
  'junior-lecturer': {
    reputation: { rigour: 0.3, originality: 0.2 },
    publishedDocuments: 2,
    activities: [],                      // Field-season gating is post-MVP; activity execution is not in MVP scope
    minTermsInRole: 3                    // ~1 year as postdoc
  },
  'senior-lecturer': {
    reputation: { rigour: 0.5, breadth: 0.3, originality: 0.4 },
    publishedDocuments: 5,
    minVenuePrestige: 0.4,
    activities: ['student-supervision', 'conference-presentation'],
    minTermsInRole: 6                    // ~2 years as junior lecturer
  },
  'reader': {
    reputation: { rigour: 0.6, originality: 0.6, influence: 0.4 },
    publishedDocuments: 10,
    minVenuePrestige: 0.6,
    activities: ['grant-application'],
    minTermsInRole: 9                    // ~3 years as senior lecturer
  },
  'professor': {
    reputation: { rigour: 0.7, breadth: 0.5, originality: 0.7, reliability: 0.6, influence: 0.6 },
    publishedDocuments: 15,
    minVenuePrestige: 0.7,
    activities: ['sabbatical'],
    minTermsInRole: 12                   // ~4 years as reader
  }
};
```

Promotion changes the player's background drain profile immediately. The term after promotion begins with the new role's teaching and administrative obligations. This is why promotion is bittersweet — more prestige and institutional access, but less free energy for discretionary research. A player might strategically delay promotion (remain a postdoc with zero background drain, maximising research output) at the cost of venue access and career activities that require seniority.

---

## 5. Minimal NPC Framework

For early development, NPCs are **reactive functions, not simulated agents.** They don't have their own research agendas, publication schedules, or political manoeuvres. They exist as surfaces off which the player's actions bounce.

### 5.1 NPC Scholar (Minimal)

Minimal NPCs are not invented from scratch at runtime. They originate from the **professional corpus** generated during world creation (doc 05, stage 4.5). Each corpus NPC arrives with a name, specialism, methodological bias, and a body of published work — some of which is correct, some of which carries calibrated wrongness. The interactive layer described here sits on top of that data.

NPC scholars have interpretive models — the same `InterpretiveModel` interface the player uses (doc 11, Section 2.6). At MVP these models are generated statically during corpus creation rather than evolving dynamically. The NPC's "calibrated errors" are claims within their interpretive model that diverge from occluded world state properties: they are subjective positions, not metadata flags. This means engine functions (lens calculation, contradiction detection, peer review evaluation) accept any `InterpretiveModel` without knowing whether it belongs to the player or an NPC.

```typescript
interface MinimalScholar {
  id: string;
  name: string;
  specialism: {
    cultureAffinity: string[];          // Which cultures they care about
    methodologicalBias: string;         // "materialist" | "structuralist" | "culturalist"
  };
  interpretiveModel: InterpretiveModel; // Agent-generic — same interface as player's model
  corpusPublications: string[];         // Document node IDs (doc 10) from world generation
  relationship: {
    respect: number;                    // 0–1, how seriously they take the player
    agreement: number;                  // 0–1, how much they agree with player's published work
  };
}
```

The `interpretiveModel` replaces the previous `corpusErrors` field. NPC errors aren't a separate list of "wrong commitment IDs" — they're simply claims in the NPC's interpretive model that happen to diverge from occluded ground truth. This is architecturally consistent: the engine evaluates NPC interpretations exactly as it evaluates the player's, and the same contradiction detection logic applies to both.

### 5.2 NPC Functions (What They Do)

Minimal NPCs serve four functions:

**1. Peer Review**
When the player submits a document to a venue with a `peer-review` editorial process, a named reviewer NPC compares the document's commitments against:
- The world state (with noise — reviewers aren't omniscient)
- Their own methodological bias (a materialist reviewer scrutinises material claims more carefully)
- Their own interpretive model (a reviewer who has published on the same culture will evaluate claims relative to their existing position — which may itself be wrong)

```typescript
function generatePeerReview(
  document: DocumentNode,                // The submitted document (doc 10)
  reviewer: MinimalScholar,
  worldState: WorldState,
  noise: number                         // 0–1, how much the reviewer can be wrong
): PeerReviewCareerEvent {
  // Compare document commitments against world state (occluded properties, with noise)
  // Compare against reviewer's interpretive model (reviewer defends their own positions)
  // Apply reviewer's methodological bias as a filter
  // Generate named feedback that is diegetically voiced (Section 3.3)
}
```

**2. Contradiction Delivery**
When the system detects a contradiction (doc 06), an NPC can deliver it as a named peer letter. The NPC chosen to deliver the challenge is one whose corpus document nodes contain commitments relevant to the contradiction — they're not an arbitrary messenger but someone with standing to object.

```typescript
function generatePeerChallenge(
  contradiction: Contradiction,
  scholar: MinimalScholar
): DiegeticSurface {
  return {
    channel: 'peer-letter',
    scholarName: scholar.name,
    argument: composeChallengeText(contradiction, scholar.specialism)
    // Challenge text references scholar's own published commitments as basis for disagreement
  };
}
```

**3. The Mirror**
When the player peer-reviews another scholar's work (career activity), they see an alternative interpretation of artefacts they've already studied. The NPC's interpretation is structured as an artefact study (doc 06, Section 3) — the same working document type the player uses. It's grounded in the NPC's interpretive model and corpus document nodes — it's not generated ad hoc but reflects commitments they've already made in their published lineage. Where the NPC's interpretive model diverges from ground truth, their interpretation will be confidently, plausibly wrong.

```typescript
function generateNpcInterpretation(
  artefact: ClassifiedArtefact,
  scholar: MinimalScholar,
  worldState: WorldState
): ArtefactStudy {                       // Doc 06 working document type
  // Ground interpretation in scholar's interpretive model and corpus document nodes (doc 10)
  // Apply their methodological bias to observation ordering and tag emphasis
  // Where interpretive model contains errors, interpretation reflects those errors consistently
  // Different cultural attribution may follow from different published commitments
}
```

This is where the player might first notice that the same artefact can look very different depending on who's examining it. The seed of lens awareness.

**4. Student Questions**
When the player supervises a student (career activity), the student asks questions about commitments in the player's published document nodes. These questions target the weakest links in the player's inference chains.

```typescript
function generateStudentQuestion(
  hypothesis: Hypothesis,
  proof: InferenceProof,
  worldState: WorldState
): DiegeticSurface {
  // Find the proof step with the weakest evidence or strongest assumption
  // Frame a naive but pointed question about that step
  return {
    channel: 'student-question',
    studentName: generateStudentName(),
    question: composeQuestionText(proof, weakestStep)
  };
}
```

Student questions are powerful because they're diegetically innocent. "Professor, I'm confused about step 3 in your proof — you say obsidian isn't local, but how do we know that for certain?" is devastating precisely because a student would genuinely ask it.

### 5.3 NPC Expansion Points

The minimal framework is designed to expand without architectural changes:

| Minimal (Early Dev) | Expanded (Later) |
|---|---|
| Static specialism | Evolving research interests |
| Binary relationship (respect/agreement) | Multi-dimensional social model |
| Reactive only | Proactive (publish new document nodes independently, challenge unprompted) |
| Generated names + bias | Distinct personalities, writing styles, career arcs |
| No NPC-NPC interaction | Academic politics, factions, rivalries |
| Single methodological bias | Shifting theoretical frameworks |
| Individual scholars only | Emergent schools of thought (see doc 11, Section 1.3) |
| Static interpretive models | NPC interpretive models evolve over time, extending their own lineage graphs |

The key design constraint: **every expanded NPC feature must use the same interfaces that the minimal version uses.** If a minimal NPC delivers contradictions via `DiegeticSurface`, an expanded NPC does too. No parallel systems.

---

## 6. The Oracle Problem (Self-Resolving)

A player who simply follows NPC scholars' interpretations hits three escalating penalties:

1. **Originality drain.** Every hypothesis that echoes an NPC's published work reduces the `originality` reputation dimension. Low originality gates career advancement.

2. **Citation dependency.** Over-citing creates a public record of intellectual dependency. Other NPCs notice. Peer reviews become condescending. ("While the author's summary of Dr. Okafor's framework is thorough, the committee struggles to identify the author's own contribution.")

3. **Inherited errors.** NPC scholars can be wrong. Their interpretive models carry calibrated wrongness — plausible, internally consistent errors baked in at world generation (doc 05, section 4.5). A player who copies NPC interpretations imports those errors into their own interpretive model. When these errors produce contradictions, the player has no understanding of *why* they believed what they believed, making resolution harder. Worse, the errors are designed to be subtle — the kind of mistake a real scholar might make given the same evidence and biases.

The oracle problem doesn't need a special rule. The existing systems make intellectual passivity mechanically unviable.

---

## 7. MVP vs Expansion Scope

### MVP (Early Dev)

- 3–5 minimal NPCs (from corpus generation: name, specialism, interpretive model with calibrated errors, corpus publications)
- 3–5 generated venues (with minor generative properties: at least one high-rigour periodical, one broad-reach outlet, one artefact-situated venue)
- Term economy: 4 terms/year (incl. summer-research with no teaching drain), energy pool, background drains by role and term type, concurrent activities
- Peer review for submitted documents (named reviewers; claim comparison against world state + reviewer's interpretive model)
- Contradiction delivery via peer letter channel
- Reputation model (all five dimensions)
- Standard dissemination pipeline only (private → circulated → submitted → published)
- Career roles: postdoc → junior lecturer (two roles, one transition), gated on reputation, publications and terms-in-role only

### First Expansion

- Activity execution: field season, conference presentation (two types); post-MVP, since MVP progression gates on reputation, publications and terms-in-role only
- Curatorial and popular publication tracks
- Student supervision activity + student question channel
- Peer review activity (the mirror)
- Career roles through senior lecturer
- NPC relationship evolution (respect/agreement change based on events)
- Sabbatical activity (Reader/Professor rank)

### Full Implementation

- All five career roles with full background drain profiles
- All activity types with tuned energy costs
- NPC-NPC interactions (academic politics)
- Distinct NPC personalities, writing styles, career arcs
- NPC interpretive models that evolve over time (post-static)
- Conference dynamics (competing presentations, networking)
- Grant committee politics
- Full venue generation with all structural property variants
- Form reclassification dynamics at scale

---

## 8. Integration Points

| System | Career/Social Touches |
|---|---|
| Time/Action Economy (doc 11, 2.8) | Terms provide the macro clock (4/year incl. summer-research). Energy pool + term-conditional background drains create career-stage-specific constraints. Activities consume time and energy concurrently. Absolute weeks are the canonical timestamp for cross-term processes. Term boundaries are the tick point for peer review outcomes, reputation changes, and career advancement checks. |
| Professional Corpus | NPC scholars originate from corpus generation; their interpretive models provide review baselines and calibrated errors. Venues are generated alongside the corpus. |
| Generation Pipeline | Field seasons determine which artefacts appear next (site/culture selection) |
| Interpretive Lens | Lens strength computed from commitment strength × dissemination state × venue prestige (see doc 04). Published commitments at high-prestige venues warp perception most. |
| Contradiction System | NPCs deliver contradictions; student questions target weak proofs; peer review disputes specific commitments. Unresolved contradictions may impose passive energy drain (implementation TBD). |
| Document Tradition (doc 10) | Documents are immutable nodes with lineage. Dissemination state transitions are career events. Venues assign form classification. Retraction cascades through lineage. |
| Reputation | Gating mechanism for activities and career advancement; effects scale with venue properties |
| Interpretation / Claims | NPC scholars have interpretive models (agent-generic, same interface as player's). Engine functions accept any InterpretiveModel for evaluation. |

---

*Cross-references: Document Tradition System (doc 10), Knowledge & Contradiction Model (doc 06), Interpretive Lens (doc 04), Generation Architecture (doc 05), Deferred Design Questions (doc 11, esp. 2.6 Agent-Generic Principle, 2.8 Time/Action Economy)*
