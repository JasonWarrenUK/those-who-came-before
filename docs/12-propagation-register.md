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

### 2.17 Venue Temporal Model: Weeks Canonical (2026-07-11)
**Origin:** Roadmap task 1FD.40 implementation (2026-07-11)
**Source of truth:** Doc 10, Section 6.4

Doc 10's week-denominated `VenueTemporalProfile` supersedes doc 07 Section 3.1's term-denominated `TemporalMode`/`SubmissionWindow`. The Section 2.9 week-conversion sweep updated doc 10's profile (openWeeks 0–47, cycle 48) but never doc 07, and `PeerReviewState` (doc 10, Section 6.4) already resolves reviews against absolute weeks. `VenueDefinition.temporalMode` becomes `temporalProfile: VenueTemporalProfile`. `TemporalMode.visibilityWindow` (terms a work remains "current" before fading into the backlist) has no week-denominated equivalent and no consumer in any doc or task; it is deferred post-MVP rather than converted.

| Doc | What changed | Completed |
|---|---|---|
| 07 | Section 3.1 supersession note added under `TemporalMode`/`SubmissionWindow`; `visibilityWindow` marked deferred post-MVP | 2026-07-11 |
| — | `src/lib/types/venues.ts` (1FD.23/1FD.40): `TemporalMode`/`SubmissionWindow` removed, `VenueTemporalProfile` added, `VenueDefinition.temporalProfile` repointed | 2026-07-11 |

### 2.18 CulturalProfile Gains techniqueAffinities (2026-07-21)
**Origin:** Roadmap task 2GN.29 implementation (2026-07-21)
**Source of truth:** Doc 05, Section 3.3 (pending update)

`CulturalProfile` (doc 05 §3.3) is specified with exactly three fields: `materialAffinities`, `motifVocabulary`, `craftInvestment`. None of these can express a culture's stable preference for *which decorative techniques* it uses, independent of what motifs it carries (`motifVocabulary`, doc 05 §8.5) or what materials it favours (`materialAffinities`). The product requirement is four independent quadrants — a culture can engrave beasts, engrave without beasts, depict beasts without engraving, or neither — which needs a technique-level signal orthogonal to both existing fields. `techniqueAffinities: Map<DecorativeTechnique, number>` was added to `CulturalProfile`, mirroring `materialAffinities`' shape, plus a one-directional material-access gate (`engine/generation/decoration.ts`'s `materialAccessGate`): a culture with no plausibly-available material satisfying a technique's substrate has that technique suppressed regardless of stated affinity, but favouring a suitable material never forces the technique.

| Doc | What changed | Completed |
|---|---|---|
| 05 | Section 3.3 `CulturalProfile` interface listing gains `techniqueAffinities`, plus a paragraph on the independence-from-motifs/materials rationale and the one-directional material-access gate | 2026-07-21 |
| — | `src/lib/types/world.ts` (2GN.29): `CulturalProfile.techniqueAffinities: Map<DecorativeTechnique, number>` added (⚠️ breaking — new required field); `tests/fixtures/culture.ts`'s `mockCulturalProfile` gained a matching default | 2026-07-21 |

### 2.19 ExtractedFeatures Expansion + Mechanical-vs-Classificatory Boundary (2026-07-22)
**Origin:** Roadmap task 2GN.17 implementation (2026-07-22)
**Source of truth:** Doc 05, Section 9.1–9.2 (pending update)

2GN.17's classification rules were derived from first principles against the signals the grammar (`data/grammars/primitives.ts`) actually produces, rather than transcribed from doc 05 §9.2's illustrative examples — the primitive/parameter vocabulary has grown past what that section shows, and the original `ExtractedFeatures` (doc 05 §9.1) was too coarse to carry the resulting rule set (it cannot, for instance, distinguish a paring knife from a dagger, both merely `hasEdge`). `ExtractedFeatures` gained thirteen fields — `pointSharpness`, `bladeLengthBand`, `bladeProfile`, `perforation`, `wallThickness`, `ringGap`, `sheetFlexibility`, `massBand`, `sizeBand`, `curvature`, `openingType`, `baseType`, `appliedElementPresent` — each traceable to a real primitive parameter or decorative-layer fact.

This surfaced a design boundary worth recording explicitly: **`portability` and `inspectionDepth` are mechanical derivations** (doc 05 §5.2's two-tier mobility model — they gate player handling/inspection) **and must never be read by a classification rule.** The two axes are collinear with the same underlying dimensions in ways that would double-count physical facts if classification piggy-backed on them, and coupling classification to a mechanic risks that mechanic's future changes silently reshaping tag scores. `massBand` and `sizeBand` are the physical-fact equivalents classification rules use instead; both derive independently from the same dimensions `portability` does. An audit at implementation time found zero existing violations of this boundary anywhere in `src/` or `docs/` — it is recorded here pre-emptively, before `classifyArtefact` (2GN.20) exists to make the mistake possible. `src/lib/data/classification.ts`'s test suite (`classification.test.ts`) enforces the boundary mechanically: it sweeps every `portability`/`inspectionDepth` band and asserts no rule's firing changes.

One of the thirteen new fields (`bladeProfile`, capturing the historical edged-only-vs-edged-and-pointed weapon distinction) and two existing fields already in doc 05 (`preciousMaterialsInDecoration`, `motifPresent`/`motifCulturalOrigins`) have rules authored against them that are currently dormant or tag-effect-deferred: the former awaits typology/description work (roadmap 2GN.40), the latter await decorative motif/material assignment (roadmap 2GN.33), neither of which is built yet.

**PR #37 review follow-up (2026-07-22):** two coverage gaps found in review closed the set at 36 rules. An edged artefact with a short primary axis but a non-short (or absent) blade band matched none of the edge rules, leaving it with no function signal; a short-edge scraper/chisel rule (`tool 0.4, everyday 0.2`) now catches it, backed by an exhaustive edge-family sweep asserting every edged feature set fires at least one edge rule. Separately, `perforation === 'off-centre'` had no rule despite being a reachable `disc-form` band; it now reads as suspension (`ornament 0.4, personal 0.3`), distinct from `central`'s rotational reading. The multi-component perforation collapse (one field, two primitives' vocabularies) is documented on the `perforation` field in `types/artefact.ts` and in `classification.ts`'s perforation banner: `extractFeatures` (2GN.19) must report the most classificatorily-loaded band present, priority `central` > `off-centre` > `single` > `multiple` > `none`. A follow-up review round then wired up three `ExtractedFeatures` presence flags that no rule had consumed, bringing the set to 39: `hasFasteningMechanism` → fastener, `hasImpactSurface` → tool/weapon, `isWearable` → ornament/personal, grouped in a new structural-presence-flags banner appended after the cross-layer family to keep the primitive-derived rules index-stable for the pinned tests.

| Doc | What changed | Completed |
|---|---|---|
| 05 | Section 9.1 `ExtractedFeatures` gains the thirteen new fields with rationale; Section 9.2 gains a note that the shipped rule set is signal-derived and broader than the section's illustrative examples, pointing at `classification.ts` as source of truth; a new subsection records the mechanical-vs-classificatory boundary | 2026-07-22 |
| — | `src/lib/types/artefact.ts` (2GN.17): `ExtractedFeatures` gains 13 fields (⚠️ breaking — new required fields); `src/lib/data/classification.ts` (2GN.17, new): `CLASSIFICATION_RULES`; `tests/fixtures/artefact.ts`'s `mockExtractedFeatures` gained matching defaults | 2026-07-22 |

### 2.20 Feature-Extraction Collapse Policies + Interviewed Presence Flags (2026-07-23)
**Origin:** Roadmap task 2GN.19 implementation (2026-07-23)
**Source of truth:** `src/lib/engine/generation/classification.ts` module JSDoc (doc 05 §9.1 specifies the field set, not the derivations)

Doc 05 §9.1 names the `ExtractedFeatures` fields but says nothing about how a multi-component artefact resolves to single values, nor how the three presence flags with no 1:1 grammar signal derive. Both sets of contracts were settled at 2GN.19 and live in the extractor; recorded here because downstream systems (lens salience, description generation, contradiction detection) will reason about which component a feature "came from".

**Collapse policies.** Each colliding family reads ONE component, chosen deterministically, so related fields never describe different parts: `bladeLengthBand` and `bladeProfile` both read the dominant edged component (longest blade band, earliest position on ties); `openingType`, `containerOpenness`, `wallThickness` and `baseType` all read the dominant container (largest `hollow-enclosed` by `size`, else longest `cylindrical`: the dedicated vessel primitive outranks the tube, which is as often a socket or ferrule as a beaker). Perforation keeps the priority §2.19 pinned (`central` > `off-centre` > `single` > `multiple`); ring gap, sheet flexibility and curvature report the most classificatorily-loaded value present (`open` > `overlapping` > `closed`; `rigid` > `flexible` > `semi-flexible`; `deep` > `shallow` > `flat`). Unrecognised parameter values degrade to the primitive's first-listed BNF value rather than throwing, mirroring normalisation's band-table fallbacks.

**Interviewed presence flags** (approved item-by-item, 2026-07-23, mirroring the 2GN.17 rule interview). `hasImpactSurface`: an untapered `bar-form` (a plain bar end is a striking face: hammer, pestle) or a thick `disc-form` (mace/hammer head). `hasFasteningMechanism`: pin-on-hoop anatomy (an attachment joining a `ring-form` to a sharp, edgeless `elongated`: fibula, penannular brooch, buckle) or any hinged join. `isWearable`: a `ring-form` present, or a suspension perforation (`single`/`off-centre`). The latter two are gated to body scale (`sizeBand` not `large` and `massBand` at most `light`): a hinged chest lid is not a clasp and nobody wears a barrel hoop. Simpler single-signal definitions were considered and rejected during the interview precisely because they ignored anatomy and scale. One known consequence of the perforation collapse: an object carrying both a `central` and a `single` perforation reads `central`, so its suspension hole never reaches `isWearable`; accepted as the cost of the one-value contract.

**Band thresholds** for `sizeBand`/`primaryAxisLength` sit at the midpoints of normalisation's provisional band-to-centimetre tables (2GN.8), and the `containerOpenness` float grades from the chosen `openingType` (wide 1.0 down to closed/none 0). All MVP-provisional, tuned once observable in the Explorer (2GN.57/2GN.59). Dormant fields keep honest no-producer defaults: `motifPresent` genuinely reads `motifRef` presence and starts firing the moment motif assignment lands (2GN.33); `motifCulturalOrigins` and `preciousMaterialsInDecoration` stay empty/false until the motif-to-culture and layer-material lookups exist (2GN.34).

| Doc | What changed | Completed |
|---|---|---|
| 05 | Section 9.1's implementation note gains a sentence pointing at the extractor's collapse policies and interviewed presence-flag derivations (this entry) | 2026-07-23 |
| — | `src/lib/engine/generation/classification.ts` (2GN.19, new): `extractFeatures(artefact, decorativeLayers)`; 34 Deno tests in the sibling `classification.test.ts` | 2026-07-23 |

---

*This document is a living register. Items are added during design sessions and resolved during propagation passes.*
