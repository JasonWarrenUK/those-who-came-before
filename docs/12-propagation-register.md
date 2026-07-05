# TWCB: Propagation Register
*Tracking cross-document updates needed after architectural changes*

---

## How This Works

When a design session produces changes that affect other documents, they're logged here rather than immediately propagated. This prevents losing context mid-session and provides a checklist for the next propagation pass.

**Two-tier tracking:**
- **This document** tracks backward propagation — changes needed in docs with a *lower* number than the one where the change originated.
- **Forward propagation** (changes needed in higher-numbered docs) is noted in a section at the top of the originating doc, since we'll encounter those docs naturally in sequence.

**Lifecycle:** Items are added during design sessions, addressed during propagation passes, and marked complete with the date they were resolved.

---

## 1. Pending Propagation

*No pending items. All propagation from the current design round has been completed.*

---

## 2. Completed Propagation

### 2.1 Doc 05 Generation Architecture (2026-02-07)

Bottom-up component grammar, decorative layers, register system, excavation composition, initial corpus, dating framework, corpus-aware contradiction detection.

Propagated to docs 04, 06, 08, 09 on 2026-02-07. Doc 07 updated 2026-02-07 (corpus integration).

### 2.2 Objective/Subjective Reconceptualisation (2026-02-09)
**Origin:** Doc 08 interrogation session (2026-02-08)
**Locked in as:** Doc 11, Section 2.5

The fundamental split between objective and subjective world states was redefined. Objective = everything that concretely exists (with property visibility levels). Subjective = epistemic interpretive models, one per agent. Documents, career events, and the lineage graph moved from subjective to objective. NPCs gained conceptual subjective states.

| Doc | What changed | Completed |
|---|---|---|
| 01 | References to "two world states" given refined definitions | 2026-02-09 |
| 02 | Design pillars updated from old split | 2026-02-09 |
| 03 | Systems map rebuilt. Canonical definitions for new model established. Core loop updated. | 2026-02-09 |
| 04 | Lens inputs reference player's interpretive model, not "subjective world state" | 2026-02-09 |
| 05 | Professional corpus language updated. Agent-generic NPC framing applied. | 2026-02-09 |
| 06 | Subtitle, Section 6 interface, contradiction detection framing all reworked | 2026-02-09 |
| 07 | Career events and NPC framework reframed. NPC calibrated errors recognised as interpretive model instances. | 2026-02-09 |
| 08 | Store architecture, orchestration, project structure rebuilt with new model | 2026-02-08 |

### 2.3 Property Visibility Model (2026-02-09)
**Origin:** Doc 08 interrogation session (2026-02-08)
**Locked in as:** Doc 11, Section 2.7

World state properties have four visibility levels (observable, inferable, occluded, engine-internal) rather than binary hidden/visible.

| Doc | What changed | Completed |
|---|---|---|
| 05 | Generation pipeline annotated with visibility levels per stage | 2026-02-09 |
| 06 | Contradiction detection references occluded properties specifically | 2026-02-09 |
| 04 | Lens specification references visibility levels | 2026-02-09 |

### 2.4 Agent-Generic Interpretation Principle (2026-02-09)
**Origin:** Doc 08 interrogation session (2026-02-08)
**Locked in as:** Doc 11, Section 2.6

Engine functions accept interpretive models as parameters; only UI/store layers treat the player as special. NPC calibrated errors reframed as NPC interpretive model instances.

| Doc | What changed | Completed |
|---|---|---|
| 05 | Corpus generation structures NPC errors as interpretive model instances | 2026-02-09 |
| 06 | Knowledge model interfaces made agent-generic | 2026-02-09 |
| 07 | NPC review tendencies and methodological commitments modelled as interpretive model properties | 2026-02-09 |

### 2.5 Doc 03 Systems Map Rebuild (2026-02-09)
**Origin:** Doc 08 interrogation session (2026-02-08)

Full rebuild of sections 2 and 4. Canonical definitions for new data model. Updated systems list including document tradition and career systems. Stale status notes corrected.

| Doc | What changed | Completed |
|---|---|---|
| 03 | Sections 2 and 4 rebuilt | 2026-02-09 |

### 2.6 Doc 10 Architecture (2026-02-09)
**Origin:** Doc 10 creation session (2026-02-07/08)

Doc 10 introduced the document tradition system. Remaining backward propagation completed.

| Doc | What changed | Completed |
|---|---|---|
| 03 | Systems map includes document tradition as named system | 2026-02-09 |
| 04 | Lens strength references dissemination state × venue prestige | 2026-02-09 |
| 05 | Corpus generation references doc 10 architecture for document nodes | 2026-02-09 |
| 06 | Updated 2026-02-07 | 2026-02-07 |
| 07 | Rebuilt 2026-02-08 | 2026-02-08 |

### 2.7 Time/Action Economy — #39: Wb Xb Yac Za (2026-02-09)
**Origin:** Doc 11 game time discussion (2026-02-09)
**Locked in as:** Doc 11, Section 2.8

Game time uses discrete academic terms (4/year incl. summer-research, ~120 per career) with concurrent actions, dual time + energy cost, and energy carry-over. Explicit week tracking within 12-week terms locked for verisimilitude. Absolute week counter as canonical timestamp. Peer review and dissemination lead times specified in weeks, with resolution checks at term boundaries.

| Doc | What changed | Completed |
|---|---|---|
| 04 | Lens decay rates specified per-term with concrete temporal anchoring | 2026-02-09 |
| 06 | Contradiction accumulation rates and revision timestamps given term-based specification | 2026-02-09 |
| 07 | Career activity durations, teaching load as background drain, sabbatical as zero-drain term, venue temporal properties all specified | 2026-02-09 |
| 08 | TermState with week tracking, term-boundary orchestration, store hierarchy updated | 2026-02-09 |
| 10 | Dissemination lead times in weeks, peer review in weeks, venue seasonal cycles updated | 2026-02-09 |

### 2.8 Explicit Week Tracking + Deferral Cleanup (2026-02-09)
**Origin:** Doc 11 2.8 sub-question review
**Locked in as:** Doc 11, Section 2.8 (sub-question 4 resolved; 1, 2, 3, 5 deferred)

Week tracking within 12-week terms locked as the time granularity model. Peer review lead times converted from terms to weeks for verisimilitude. Four implementation sub-questions (energy scale, replenishment curve, quality degradation, passive drains) annotated as safe deferrals with no architectural consequence. Doc 13 created for post-MVP deferred questions; doc 11 Sections 1.2–1.4 moved there.

| Doc | What changed | Completed |
|---|---|---|
| 08 | `TermState` gains `currentWeek`, `weekCapacity`, `weeksAllocated`; `CompletedAction` gains `durationWeeks`, `startWeek`; store hierarchy updated | 2026-02-09 |
| 09 | Terminology pass: `SubjectiveWorldState` → `InterpretiveModel`, `objectiveWorld` → `worldState`, `createObjectiveWorld` → `createWorld`, Phase 7 "objective truth" → "ground truth" | 2026-02-09 |
| 10 | Section 6.4 fully converted from term-denominated to week-denominated lead times; `PeerReviewState` and `VenueTemporalProfile` fields renamed; `Retraction.retractedAt` → `retractedAtWeek` | 2026-02-09 |
| 11 | Sub-question 4 locked; sub-questions 1, 2, 3, 5 annotated as safe deferrals; Sections 1.2–1.4 moved to doc 13 | 2026-02-09 |
| 13 | Created: deferred post-MVP design questions (alternative dissemination, emergent schools, publication quality metrics) with architectural provisions and MVP risk assessments | 2026-02-09 |

### 2.9 Summer-Research Term + Absolute Week Counter (2026-02-09)
**Origin:** Design discussion (2026-02-09)
**Locked in as:** Doc 11, Section 2.8 (updated)

Two refinements to the time/action economy: (1) 4 terms per year instead of 3, adding a summer-research term with no teaching background drain, creating annual rhythm variation. (2) Absolute week counter as canonical timestamp, never resetting, enabling background processes to span term boundaries without special logic.

| Doc | What changed | Completed |
|---|---|---|
| 07 | Term count updated to 4/year, summer-research term documented, cross-reference table updated | 2026-02-09 |
| 08 | `TermState` rebuilt with `TermType`, `AcademicYear`, `currentAbsoluteWeek`, term-conditional `BackgroundDrain.activeTermTypes`, `completeTerm()` updated with `getTermType()` and drain filtering, store hierarchy updated | 2026-02-09 |
| 10 | `VenueTemporalProfile.openWeeks` range updated to 0–47, cycle length to 48 | 2026-02-09 |
| 11 | Section 2.8 rewritten: 4 terms/year, summer-research term, absolute week counter, sub-question 4 updated | 2026-02-09 |

### 2.10 Description Register Scope: Three-Value MVP (2026-07-04)
**Origin:** Alignment audit (2026-07-04)
**Source of truth:** Doc 04, Section 3.4

The three-register `DescriptionRegister` ('observational' | 'interpretive' | 'technical') is MVP-canonical. Doc 05 Section 12's five-value `ObservationRegister` and its `RegisterAccess` unlock model are deferred post-MVP.

| Doc | What changed | Completed |
|---|---|---|
| 05 | MVP note added under Section 12.1 marking the five-register model post-MVP | 2026-07-04 |
| 06 | Section 2.1 `observationRegister` field annotated as three-value at MVP | 2026-07-04 |
| 13 | Entry 4 added: five-register observation system deferral | 2026-07-04 |

### 2.11 Unified Feature Extraction Supersedes Accumulation-During-Expansion (2026-07-04)
**Origin:** Alignment audit (2026-07-04)
**Source of truth:** Doc 05, Section 9

Single-pass unified feature extraction is canonical. Doc 09 Phase 4's accumulation-during-grammar-expansion model is superseded; the roadmap implements unified extraction and the former task for accumulation-during-expansion (2GN.18) was removed.

| Doc | What changed | Completed |
|---|---|---|
| 09 | Supersession note added under Phase 4 | 2026-07-04 |

### 2.12 MVP Career Gating Without Activity Execution (2026-07-04)
**Origin:** Alignment audit (2026-07-04)
**Source of truth:** Doc 07, Sections 4.2 and 7

MVP career progression (postdoc to junior lecturer) gates on reputation, publications and terms-in-role only. Career activity execution (field seasons, conference presentations) is deferred post-MVP; the junior-lecturer `RoleRequirement` uses `activities: []`.

| Doc | What changed | Completed |
|---|---|---|
| 07 | Section 4.2 junior-lecturer requirement changed to `activities: []`; Section 7 activities moved from MVP scope to First Expansion | 2026-07-04 |
| 13 | Entry 5 added: career activity execution deferral | 2026-07-04 |

### 2.13 Sabbatical as Engine Hooks Only (2026-07-04)
**Origin:** Alignment audit (2026-07-04)
**Source of truth:** Doc 07, Section 4.1; doc 04, Section 4

Sabbatical ships in MVP as engine hooks only: background drain zeroing plus the -0.15 lens strength modifier. Player-facing availability (Reader/Professor gating, cooldown) is post-MVP.

| Doc | What changed | Completed |
|---|---|---|
| 13 | Entry 5 records the player-facing sabbatical deferral | 2026-07-04 |

### 2.14 SaveFile Persistence Scope (2026-07-04)
**Origin:** Alignment audit (2026-07-04)
**Source of truth:** Doc 08, Section 4.1

`SaveFile` persists `worldState`, `playerInterpretation` and `termState`. `lensState` is not persisted; it is recomputed from `playerInterpretation` on load. The contradiction queue is serialised within `playerInterpretation`.

| Doc | What changed | Completed |
|---|---|---|
| 08 | Section 4.1 `SaveFile` gains `termState`; non-persistence of `lensState` and contradiction queue placement documented | 2026-07-04 |

### 2.15 HypothesisStrain as Canonical Strain Type (2026-07-04)
**Origin:** Alignment audit (2026-07-04)
**Source of truth:** Doc 06, Section 5

`HypothesisStrain` is the canonical strain type. The name `StrainScore` is dropped.

| Doc | What changed | Completed |
|---|---|---|
| 08 | Section 3.2 `InterpretiveModel.strainScores` retyped to `Map<string, HypothesisStrain>` | 2026-07-04 |

### 2.16 Graduated Dissemination Lens Factor Gains 'presented' (2026-07-04)
**Origin:** Alignment audit (2026-07-04)
**Source of truth:** Doc 10, Section 6 (state definitions); doc 04, Section 4 (weights)

The graduated dissemination lens factor gains a 'presented' value of 0.15, so all six `DisseminationState` values carry weights.

| Doc | What changed | Completed |
|---|---|---|
| 04 | Section 4 `LensStrength` dissemination comment updated with 0.15 (presented) | 2026-07-04 |

---

*This document is a living register. Items are added during design sessions and resolved during propagation passes.*
