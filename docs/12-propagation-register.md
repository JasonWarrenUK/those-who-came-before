# TWCB: Propagation Register

_Tracking cross-document updates needed after architectural changes_

---

## How This Works

When a design session produces changes that affect other documents, they're logged here rather than
immediately propagated. This prevents losing context mid-session and provides a checklist for the
next propagation pass.

**Two-tier tracking:**

- **This document** tracks backward propagation — changes needed in docs with a _lower_ number than
  the one where the change originated.
- **Forward propagation** (changes needed in higher-numbered docs) is noted in a section at the top
  of the originating doc, since we'll encounter those docs naturally in sequence.

**Lifecycle:** Items are added during design sessions, addressed during propagation passes, and
marked complete with the date they were resolved.

---

## 1. Pending Propagation

Two items remain open from §2.28's tag-relativity ruling (2026-08-04), both blocked on unbuilt
Milestone 3 world-state work rather than awaiting a propagation pass:

- **Doc 05 §3.2:** `PhaseCharacteristics.society.stratification` becomes a live classification
  input. Blocked on **2GN.96** (itself blocked on 2GN.95 — done — plus 3WS.4, 3WS.9, 3WS.21). See
  §2.28's table and §2.31's confirmation that no rule reads it yet.
- **Doc 08:** world state carries cached per-culture-phase baselines. Blocked on **3WS.9** (itself
  blocked on 3WS.4, 3WS.5, 3WS.7). `ClassificationContext` itself shipped at §2.30 — this row is
  narrowly about caching sampled baselines on a real `WorldState`, which doesn't exist yet.

Neither is actionable until its blocking task clears; listed here rather than in §2 because closing
them isn't a documentation task, it's downstream of code that hasn't landed.

---

## 2. Completed Propagation

### 2.1 Doc 05 Generation Architecture (2026-02-07)

Bottom-up component grammar, decorative layers, register system, excavation composition, initial
corpus, dating framework, corpus-aware contradiction detection.

Propagated to docs 04, 06, 08, 09 on 2026-02-07. Doc 07 updated 2026-02-07 (corpus integration).

### 2.2 Objective/Subjective Reconceptualisation (2026-02-09)

**Origin:** Doc 08 interrogation session (2026-02-08) **Locked in as:** Doc 11, Section 2.5

The fundamental split between objective and subjective world states was redefined. Objective =
everything that concretely exists (with property visibility levels). Subjective = epistemic
interpretive models, one per agent. Documents, career events, and the lineage graph moved from
subjective to objective. NPCs gained conceptual subjective states.

| Doc | What changed                                                                                                | Completed  |
| --- | ----------------------------------------------------------------------------------------------------------- | ---------- |
| 01  | References to "two world states" given refined definitions                                                  | 2026-02-09 |
| 02  | Design pillars updated from old split                                                                       | 2026-02-09 |
| 03  | Systems map rebuilt. Canonical definitions for new model established. Core loop updated.                    | 2026-02-09 |
| 04  | Lens inputs reference player's interpretive model, not "subjective world state"                             | 2026-02-09 |
| 05  | Professional corpus language updated. Agent-generic NPC framing applied.                                    | 2026-02-09 |
| 06  | Subtitle, Section 6 interface, contradiction detection framing all reworked                                 | 2026-02-09 |
| 07  | Career events and NPC framework reframed. NPC calibrated errors recognised as interpretive model instances. | 2026-02-09 |
| 08  | Store architecture, orchestration, project structure rebuilt with new model                                 | 2026-02-08 |

### 2.3 Property Visibility Model (2026-02-09)

**Origin:** Doc 08 interrogation session (2026-02-08) **Locked in as:** Doc 11, Section 2.7

World state properties have four visibility levels (observable, inferable, occluded,
engine-internal) rather than binary hidden/visible.

| Doc | What changed                                                        | Completed  |
| --- | ------------------------------------------------------------------- | ---------- |
| 05  | Generation pipeline annotated with visibility levels per stage      | 2026-02-09 |
| 06  | Contradiction detection references occluded properties specifically | 2026-02-09 |
| 04  | Lens specification references visibility levels                     | 2026-02-09 |

### 2.4 Agent-Generic Interpretation Principle (2026-02-09)

**Origin:** Doc 08 interrogation session (2026-02-08) **Locked in as:** Doc 11, Section 2.6

Engine functions accept interpretive models as parameters; only UI/store layers treat the player as
special. NPC calibrated errors reframed as NPC interpretive model instances.

| Doc | What changed                                                                                   | Completed  |
| --- | ---------------------------------------------------------------------------------------------- | ---------- |
| 05  | Corpus generation structures NPC errors as interpretive model instances                        | 2026-02-09 |
| 06  | Knowledge model interfaces made agent-generic                                                  | 2026-02-09 |
| 07  | NPC review tendencies and methodological commitments modelled as interpretive model properties | 2026-02-09 |

### 2.5 Doc 03 Systems Map Rebuild (2026-02-09)

**Origin:** Doc 08 interrogation session (2026-02-08)

Full rebuild of sections 2 and 4. Canonical definitions for new data model. Updated systems list
including document tradition and career systems. Stale status notes corrected.

| Doc | What changed             | Completed  |
| --- | ------------------------ | ---------- |
| 03  | Sections 2 and 4 rebuilt | 2026-02-09 |

### 2.6 Doc 10 Architecture (2026-02-09)

**Origin:** Doc 10 creation session (2026-02-07/08)

Doc 10 introduced the document tradition system. Remaining backward propagation completed.

| Doc | What changed                                                        | Completed  |
| --- | ------------------------------------------------------------------- | ---------- |
| 03  | Systems map includes document tradition as named system             | 2026-02-09 |
| 04  | Lens strength references dissemination state × venue prestige       | 2026-02-09 |
| 05  | Corpus generation references doc 10 architecture for document nodes | 2026-02-09 |
| 06  | Updated 2026-02-07                                                  | 2026-02-07 |
| 07  | Rebuilt 2026-02-08                                                  | 2026-02-08 |

### 2.7 Time/Action Economy — #39: Wb Xb Yac Za (2026-02-09)

**Origin:** Doc 11 game time discussion (2026-02-09) **Locked in as:** Doc 11, Section 2.8

Game time uses discrete academic terms (4/year incl. summer-research, ~120 per career) with
concurrent actions, dual time + energy cost, and energy carry-over. Explicit week tracking within
12-week terms locked for verisimilitude. Absolute week counter as canonical timestamp. Peer review
and dissemination lead times specified in weeks, with resolution checks at term boundaries.

| Doc | What changed                                                                                                                         | Completed  |
| --- | ------------------------------------------------------------------------------------------------------------------------------------ | ---------- |
| 04  | Lens decay rates specified per-term with concrete temporal anchoring                                                                 | 2026-02-09 |
| 06  | Contradiction accumulation rates and revision timestamps given term-based specification                                              | 2026-02-09 |
| 07  | Career activity durations, teaching load as background drain, sabbatical as zero-drain term, venue temporal properties all specified | 2026-02-09 |
| 08  | TermState with week tracking, term-boundary orchestration, store hierarchy updated                                                   | 2026-02-09 |
| 10  | Dissemination lead times in weeks, peer review in weeks, venue seasonal cycles updated                                               | 2026-02-09 |

### 2.8 Explicit Week Tracking + Deferral Cleanup (2026-02-09)

**Origin:** Doc 11 2.8 sub-question review **Locked in as:** Doc 11, Section 2.8 (sub-question 4
resolved; 1, 2, 3, 5 deferred)

Week tracking within 12-week terms locked as the time granularity model. Peer review lead times
converted from terms to weeks for verisimilitude. Four implementation sub-questions (energy scale,
replenishment curve, quality degradation, passive drains) annotated as safe deferrals with no
architectural consequence. Doc 13 created for post-MVP deferred questions; doc 11 Sections 1.2–1.4
moved there.

| Doc | What changed                                                                                                                                                                                | Completed  |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| 08  | `TermState` gains `currentWeek`, `weekCapacity`, `weeksAllocated`; `CompletedAction` gains `durationWeeks`, `startWeek`; store hierarchy updated                                            | 2026-02-09 |
| 09  | Terminology pass: `SubjectiveWorldState` → `InterpretiveModel`, `objectiveWorld` → `worldState`, `createObjectiveWorld` → `createWorld`, Phase 7 "objective truth" → "ground truth"         | 2026-02-09 |
| 10  | Section 6.4 fully converted from term-denominated to week-denominated lead times; `PeerReviewState` and `VenueTemporalProfile` fields renamed; `Retraction.retractedAt` → `retractedAtWeek` | 2026-02-09 |
| 11  | Sub-question 4 locked; sub-questions 1, 2, 3, 5 annotated as safe deferrals; Sections 1.2–1.4 moved to doc 13                                                                               | 2026-02-09 |
| 13  | Created: deferred post-MVP design questions (alternative dissemination, emergent schools, publication quality metrics) with architectural provisions and MVP risk assessments               | 2026-02-09 |

### 2.9 Summer-Research Term + Absolute Week Counter (2026-02-09)

**Origin:** Design discussion (2026-02-09) **Locked in as:** Doc 11, Section 2.8 (updated)

Two refinements to the time/action economy: (1) 4 terms per year instead of 3, adding a
summer-research term with no teaching background drain, creating annual rhythm variation. (2)
Absolute week counter as canonical timestamp, never resetting, enabling background processes to span
term boundaries without special logic.

| Doc | What changed                                                                                                                                                                                                               | Completed  |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| 07  | Term count updated to 4/year, summer-research term documented, cross-reference table updated                                                                                                                               | 2026-02-09 |
| 08  | `TermState` rebuilt with `TermType`, `AcademicYear`, `currentAbsoluteWeek`, term-conditional `BackgroundDrain.activeTermTypes`, `completeTerm()` updated with `getTermType()` and drain filtering, store hierarchy updated | 2026-02-09 |
| 10  | `VenueTemporalProfile.openWeeks` range updated to 0–47, cycle length to 48                                                                                                                                                 | 2026-02-09 |
| 11  | Section 2.8 rewritten: 4 terms/year, summer-research term, absolute week counter, sub-question 4 updated                                                                                                                   | 2026-02-09 |

### 2.10 Description Register Scope: Three-Value MVP (2026-07-04)

**Origin:** Alignment audit (2026-07-04) **Source of truth:** Doc 04, Section 3.4

The three-register `DescriptionRegister` ('observational' | 'interpretive' | 'technical') is
MVP-canonical. Doc 05 Section 12's five-value `ObservationRegister` and its `RegisterAccess` unlock
model are deferred post-MVP.

| Doc | What changed                                                               | Completed  |
| --- | -------------------------------------------------------------------------- | ---------- |
| 05  | MVP note added under Section 12.1 marking the five-register model post-MVP | 2026-07-04 |
| 06  | Section 2.1 `observationRegister` field annotated as three-value at MVP    | 2026-07-04 |
| 13  | Entry 4 added: five-register observation system deferral                   | 2026-07-04 |

### 2.11 Unified Feature Extraction Supersedes Accumulation-During-Expansion (2026-07-04)

**Origin:** Alignment audit (2026-07-04) **Source of truth:** Doc 05, Section 9

Single-pass unified feature extraction is canonical. Doc 09 Phase 4's
accumulation-during-grammar-expansion model is superseded; the roadmap implements unified extraction
and the former task for accumulation-during-expansion (2GN.18) was removed.

| Doc | What changed                                                                                                                                                                                                        | Completed  |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| 09  | Supersession note added under Phase 4                                                                                                                                                                               | 2026-07-04 |
| 09  | Phase 4 body (title, What Gets Built, Definition of Done) and Phase 9's pipeline stage list reconciled with the banner — both still described accumulation-during-expansion after the note was added (doc 12 §2.23) | 2026-07-27 |

### 2.12 MVP Career Gating Without Activity Execution (2026-07-04)

**Origin:** Alignment audit (2026-07-04) **Source of truth:** Doc 07, Sections 4.2 and 7

MVP career progression (postdoc to junior lecturer) gates on reputation, publications and
terms-in-role only. Career activity execution (field seasons, conference presentations) is deferred
post-MVP; the junior-lecturer `RoleRequirement` uses `activities: []`.

| Doc | What changed                                                                                                                      | Completed  |
| --- | --------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| 07  | Section 4.2 junior-lecturer requirement changed to `activities: []`; Section 7 activities moved from MVP scope to First Expansion | 2026-07-04 |
| 13  | Entry 5 added: career activity execution deferral                                                                                 | 2026-07-04 |

### 2.13 Sabbatical as Engine Hooks Only (2026-07-04)

**Origin:** Alignment audit (2026-07-04) **Source of truth:** Doc 07, Section 4.1; doc 04, Section 4

Sabbatical ships in MVP as engine hooks only: background drain zeroing plus the -0.15 lens strength
modifier. Player-facing availability (Reader/Professor gating, cooldown) is post-MVP.

| Doc | What changed                                          | Completed  |
| --- | ----------------------------------------------------- | ---------- |
| 13  | Entry 5 records the player-facing sabbatical deferral | 2026-07-04 |

### 2.14 SaveFile Persistence Scope (2026-07-04)

**Origin:** Alignment audit (2026-07-04) **Source of truth:** Doc 08, Section 4.1

`SaveFile` persists `worldState`, `playerInterpretation` and `termState`. `lensState` is not
persisted; it is recomputed from `playerInterpretation` on load. The contradiction queue is
serialised within `playerInterpretation`.

| Doc | What changed                                                                                                                                                                                                      | Completed  |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| 08  | Section 4.1 `SaveFile` gains `termState`; non-persistence of `lensState` and contradiction queue placement documented                                                                                             | 2026-07-04 |
| 09  | Phase 19 removed `LensState` from the serialised-state list; round-trip requirement now checks recomputation equivalence instead of raw persistence (doc 12 §2.23) — this pass never reached doc 09 in 2026-07-04 | 2026-07-27 |

### 2.15 HypothesisStrain as Canonical Strain Type (2026-07-04)

**Origin:** Alignment audit (2026-07-04) **Source of truth:** Doc 06, Section 5

`HypothesisStrain` is the canonical strain type. The name `StrainScore` is dropped.

| Doc | What changed                                                                            | Completed  |
| --- | --------------------------------------------------------------------------------------- | ---------- |
| 08  | Section 3.2 `InterpretiveModel.strainScores` retyped to `Map<string, HypothesisStrain>` | 2026-07-04 |

### 2.16 Graduated Dissemination Lens Factor Gains 'presented' (2026-07-04)

**Origin:** Alignment audit (2026-07-04) **Source of truth:** Doc 10, Section 6 (state definitions);
doc 04, Section 4 (weights)

The graduated dissemination lens factor gains a 'presented' value of 0.15, so all six
`DisseminationState` values carry weights.

| Doc | What changed                                                                 | Completed  |
| --- | ---------------------------------------------------------------------------- | ---------- |
| 04  | Section 4 `LensStrength` dissemination comment updated with 0.15 (presented) | 2026-07-04 |

### 2.17 Venue Temporal Model: Weeks Canonical (2026-07-11)

**Origin:** Roadmap task 1FD.40 implementation (2026-07-11) **Source of truth:** Doc 10, Section 6.4

Doc 10's week-denominated `VenueTemporalProfile` supersedes doc 07 Section 3.1's term-denominated
`TemporalMode`/`SubmissionWindow`. The Section 2.9 week-conversion sweep updated doc 10's profile
(openWeeks 0–47, cycle 48) but never doc 07, and `PeerReviewState` (doc 10, Section 6.4) already
resolves reviews against absolute weeks. `VenueDefinition.temporalMode` becomes
`temporalProfile: VenueTemporalProfile`. `TemporalMode.visibilityWindow` (terms a work remains
"current" before fading into the backlist) has no week-denominated equivalent and no consumer in any
doc or task; it is deferred post-MVP rather than converted.

| Doc | What changed                                                                                                                                                    | Completed  |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| 07  | Section 3.1 supersession note added under `TemporalMode`/`SubmissionWindow`; `visibilityWindow` marked deferred post-MVP                                        | 2026-07-11 |
| —   | `src/lib/types/venues.ts` (1FD.23/1FD.40): `TemporalMode`/`SubmissionWindow` removed, `VenueTemporalProfile` added, `VenueDefinition.temporalProfile` repointed | 2026-07-11 |

### 2.18 CulturalProfile Gains techniqueAffinities (2026-07-21)

**Origin:** Roadmap task 2GN.29 implementation (2026-07-21) **Source of truth:** Doc 05, Section 3.3
(pending update)

`CulturalProfile` (doc 05 §3.3) is specified with exactly three fields: `materialAffinities`,
`motifVocabulary`, `craftInvestment`. None of these can express a culture's stable preference for
_which decorative techniques_ it uses, independent of what motifs it carries (`motifVocabulary`, doc
05 §8.5) or what materials it favours (`materialAffinities`). The product requirement is four
independent quadrants — a culture can engrave beasts, engrave without beasts, depict beasts without
engraving, or neither — which needs a technique-level signal orthogonal to both existing fields.
`techniqueAffinities: Map<DecorativeTechnique, number>` was added to `CulturalProfile`, mirroring
`materialAffinities`' shape, plus a one-directional material-access gate
(`engine/generation/decoration.ts`'s `materialAccessGate`): a culture with no plausibly-available
material satisfying a technique's substrate has that technique suppressed regardless of stated
affinity, but favouring a suitable material never forces the technique.

| Doc | What changed                                                                                                                                                                                                                       | Completed  |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| 05  | Section 3.3 `CulturalProfile` interface listing gains `techniqueAffinities`, plus a paragraph on the independence-from-motifs/materials rationale and the one-directional material-access gate                                     | 2026-07-21 |
| —   | `src/lib/types/world.ts` (2GN.29): `CulturalProfile.techniqueAffinities: Map<DecorativeTechnique, number>` added (⚠️ breaking — new required field); `tests/fixtures/culture.ts`'s `mockCulturalProfile` gained a matching default | 2026-07-21 |

### 2.19 ExtractedFeatures Expansion + Mechanical-vs-Classificatory Boundary (2026-07-22)

**Origin:** Roadmap task 2GN.17 implementation (2026-07-22) **Source of truth:** Doc 05, Section
9.1–9.2 (pending update)

2GN.17's classification rules were derived from first principles against the signals the grammar
(`data/grammars/primitives.ts`) actually produces, rather than transcribed from doc 05 §9.2's
illustrative examples — the primitive/parameter vocabulary has grown past what that section shows,
and the original `ExtractedFeatures` (doc 05 §9.1) was too coarse to carry the resulting rule set
(it cannot, for instance, distinguish a paring knife from a dagger, both merely `hasEdge`).
`ExtractedFeatures` gained thirteen fields — `pointSharpness`, `bladeLengthBand`, `bladeProfile`,
`perforation`, `wallThickness`, `ringGap`, `sheetFlexibility`, `massBand`, `sizeBand`, `curvature`,
`openingType`, `baseType`, `appliedElementPresent` — each traceable to a real primitive parameter or
decorative-layer fact.

This surfaced a design boundary worth recording explicitly: **`portability` and `inspectionDepth`
are mechanical derivations** (doc 05 §5.2's two-tier mobility model — they gate player
handling/inspection) **and must never be read by a classification rule.** The two axes are collinear
with the same underlying dimensions in ways that would double-count physical facts if classification
piggy-backed on them, and coupling classification to a mechanic risks that mechanic's future changes
silently reshaping tag scores. `massBand` and `sizeBand` are the physical-fact equivalents
classification rules use instead; both derive independently from the same dimensions `portability`
does. An audit at implementation time found zero existing violations of this boundary anywhere in
`src/` or `docs/` — it is recorded here pre-emptively, before `classifyArtefact` (2GN.20) exists to
make the mistake possible. `src/lib/data/classification.ts`'s test suite (`classification.test.ts`)
enforces the boundary mechanically: it sweeps every `portability`/`inspectionDepth` band and asserts
no rule's firing changes.

One of the thirteen new fields (`bladeProfile`, capturing the historical
edged-only-vs-edged-and-pointed weapon distinction) and two existing fields already in doc 05
(`preciousMaterialsInDecoration`, `motifPresent`/`motifCulturalOrigins`) have rules authored against
them that are currently dormant or tag-effect-deferred: the former awaits typology/description work
(roadmap 2GN.40), the latter await decorative motif/material assignment (roadmap 2GN.33), neither of
which is built yet.

**PR #37 review follow-up (2026-07-22):** two coverage gaps found in review closed the set at 36
rules. An edged artefact with a short primary axis but a non-short (or absent) blade band matched
none of the edge rules, leaving it with no function signal; a short-edge scraper/chisel rule
(`tool 0.4, everyday 0.2`) now catches it, backed by an exhaustive edge-family sweep asserting every
edged feature set fires at least one edge rule. Separately, `perforation === 'off-centre'` had no
rule despite being a reachable `disc-form` band; it now reads as suspension
(`ornament 0.4, personal 0.3`), distinct from `central`'s rotational reading. The multi-component
perforation collapse (one field, two primitives' vocabularies) is documented on the `perforation`
field in `types/artefact.ts` and in `classification.ts`'s perforation banner: `extractFeatures`
(2GN.19) must report the most classificatorily-loaded band present, priority `central` >
`off-centre` > `single` > `multiple` > `none`. A follow-up review round then wired up three
`ExtractedFeatures` presence flags that no rule had consumed, bringing the set to 39:
`hasFasteningMechanism` → fastener, `hasImpactSurface` → tool/weapon, `isWearable` →
ornament/personal, grouped in a new structural-presence-flags banner appended after the cross-layer
family to keep the primitive-derived rules index-stable for the pinned tests.

| Doc | What changed                                                                                                                                                                                                                                                                                                                    | Completed  |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| 05  | Section 9.1 `ExtractedFeatures` gains the thirteen new fields with rationale; Section 9.2 gains a note that the shipped rule set is signal-derived and broader than the section's illustrative examples, pointing at `classification.ts` as source of truth; a new subsection records the mechanical-vs-classificatory boundary | 2026-07-22 |
| —   | `src/lib/types/artefact.ts` (2GN.17): `ExtractedFeatures` gains 13 fields (⚠️ breaking — new required fields); `src/lib/data/classification.ts` (2GN.17, new): `CLASSIFICATION_RULES`; `tests/fixtures/artefact.ts`'s `mockExtractedFeatures` gained matching defaults                                                          | 2026-07-22 |

### 2.20 Feature-Extraction Collapse Policies + Interviewed Presence Flags (2026-07-23)

**Origin:** Roadmap task 2GN.19 implementation (2026-07-23) **Source of truth:**
`src/lib/engine/generation/classification.ts` module JSDoc (doc 05 §9.1 specifies the field set, not
the derivations)

Doc 05 §9.1 names the `ExtractedFeatures` fields but says nothing about how a multi-component
artefact resolves to single values, nor how the three presence flags with no 1:1 grammar signal
derive. Both sets of contracts were settled at 2GN.19 and live in the extractor; recorded here
because `ExtractedFeatures` carries collapsed scalars only, with no per-field component references —
a downstream system (lens salience, description generation, contradiction detection) that needs to
know which component a feature "came from" must re-derive it by re-running these same deterministic
selection policies against the artefact, or grow explicit provenance fields when a concrete consumer
demands them. Doc 05 §9.1's "every feature is traceable to its source" is a promise about these
recorded policies, not about fields the contract carries today.

**Collapse policies.** Each colliding family reads ONE component, chosen deterministically, so
related fields never describe different parts: `bladeLengthBand` and `bladeProfile` both read the
dominant edged component (longest blade band, earliest position on ties); `openingType`,
`containerOpenness`, `wallThickness` and `baseType` all read the dominant container (largest
`hollow-enclosed` by `size`, else longest `cylindrical`: the dedicated vessel primitive outranks the
tube, which is as often a socket or ferrule as a beaker). Perforation keeps the priority §2.19
pinned (`central` > `off-centre` > `single` > `multiple`); ring gap, sheet flexibility and curvature
report the most classificatorily-loaded value present (`open` > `overlapping` > `closed`; `rigid` >
`flexible` > `semi-flexible`; `deep` > `shallow` > `flat`). Unrecognised parameter values in
band-valued fields degrade to the primitive's first-listed BNF value rather than throwing, mirroring
normalisation's band-table fallbacks. The presence flags sit deliberately outside that degradation
contract: their anatomy checks read strict equality and stay `false` on an unreadable signal, since
bar-form's first-listed `taper` value ("none") is itself the impact anatomy — degradation there
would fabricate striking faces from missing data.

**Interviewed presence flags** (approved item-by-item, 2026-07-23, mirroring the 2GN.17 rule
interview). `hasImpactSurface`: an untapered `bar-form` (a plain bar end is a striking face: hammer,
pestle) or a thick `disc-form` (mace/hammer head). `hasFasteningMechanism`: pin-on-hoop anatomy (an
attachment joining a `ring-form` to a sharp, edgeless `elongated`: fibula, penannular brooch,
buckle) or any hinged join. `isWearable`: a `ring-form` present, or a suspension perforation
(`single`/`off-centre`). The latter two are gated to body scale (`sizeBand` not `large` and
`massBand` at most `light`): a hinged chest lid is not a clasp and nobody wears a barrel hoop.
Simpler single-signal definitions were considered and rejected during the interview precisely
because they ignored anatomy and scale. One known consequence of the perforation collapse: an object
carrying both a `central` and a `single` perforation reads `central`, so its suspension hole never
reaches `isWearable`; accepted as the cost of the one-value contract.

**Band thresholds** for `sizeBand`/`primaryAxisLength` sit at the midpoints of normalisation's
provisional band-to-centimetre tables (2GN.8), and the `containerOpenness` float grades from the
chosen `openingType` (wide 1.0 down to closed/none 0). All MVP-provisional, tuned once observable in
the Explorer (2GN.57/2GN.59). `overallComplexity` composes functional + decorative — the
implementation's reading of doc 05 §9.1's "structural + decorative", which names no separate
structural score. Dormant fields keep honest no-producer defaults: `motifPresent` genuinely reads
`motifRef` presence and starts firing the moment motif assignment lands (2GN.33);
`motifCulturalOrigins` and `preciousMaterialsInDecoration` stay empty/false until the
motif-to-culture and layer-material lookups exist (2GN.34).

| Doc | What changed                                                                                                                                                      | Completed  |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| 05  | Section 9.1's implementation note gains a sentence pointing at the extractor's collapse policies and interviewed presence-flag derivations (this entry)           | 2026-07-23 |
| —   | `src/lib/engine/generation/classification.ts` (2GN.19, new): `extractFeatures(artefact, decorativeLayers)`; 34 Deno tests in the sibling `classification.test.ts` | 2026-07-23 |

### 2.21 Tag-Score Accumulation Contract (2026-07-23)

**Origin:** Roadmap task 2GN.20 implementation (2026-07-23) **Source of truth:** `classifyArtefact`
JSDoc (`src/lib/engine/generation/classification.ts`) — doc 05 §9.2 specifies the rule shape, not
the fold semantics

Doc 05 §9.2 shows rules contributing weights and calls the result "accumulated" without pinning how
same-tag collisions combine, what the returned map contains, or how it iterates. All three were
settled at 2GN.20, each option weighed against the map's four downstream consumers (future rule
contributions at 2GN.27/34, the Explorer breakdown at 2GN.59, claim evaluation at M7, ambiguity
measurement per doc 05 §11).

**Plain sum, unbounded.** Rules contributing to the same tag add their weights with no ceiling.
Clamping was rejected because saturated tags would silently swallow exactly the boosts 2GN.27 and
2GN.34 exist to add, and because it flattens the clearly-classifiable end of the ambiguity
distribution. Probabilistic OR was rejected because contributions stop decomposing additively (the
Explorer's per-contribution breakdown could no longer be honest) and because it can flip
dominant-tag ranks against the additive intuition the 2GN.17 weights were authored under — one
strong 0.9 rule beats two 0.5 rules under OR but loses under sum. The consequence consumers must
carry: scores are evidence tallies, not confidences; compare by rank and margin, normalise at point
of use, and expect absolute values to inflate as the rule set grows.

**Sparse map, canonical iteration order.** Only scored tags appear. Absence provably means zero
evidence, because rule weights are pinned > 0 by the 2GN.17 suite — a tag either received
contributions or received none, so no information is lost; consumers read `tags.get(tag) ?? 0`.
Entries iterate function-tags-then-context-tags in vocabulary declaration order, so the same
features always serialise identically however `data/classification.ts` orders its rules. Sparsity is
also the forward-compatible choice: a dense map would demand save migration whenever the tag
vocabulary grows, where absence-means-zero already covers a new tag. The ordering requirement forced
a runtime vocabulary — `FUNCTION_TAGS`/`CONTEXT_TAGS` (`types/tags.ts`) are now `as const` arrays
the union types derive from, making declaration order and type membership a single edit that cannot
drift.

| Doc | What changed                                                                                                                                                                                                               | Completed  |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| 05  | Section 9.2 gains an implementation note pinning the fold semantics (this entry)                                                                                                                                           | 2026-07-23 |
| —   | `src/lib/engine/generation/classification.ts` (2GN.20): `classifyArtefact(features, rules)`; `types/tags.ts` gains the `FUNCTION_TAGS`/`CONTEXT_TAGS` runtime arrays; 9 Deno tests in the sibling `classification.test.ts` | 2026-07-23 |

### 2.22 Motif Assignment + Introduced-Material Resolution (2026-07-25)

**Origin:** Roadmap task 2GN.33 implementation (2026-07-25) **Source of truth:**
`assignDecorativeDetails` JSDoc and `INTRODUCED_MATERIAL_TAGS`
(`src/lib/engine/generation/decoration.ts`) — doc 05 §8.5 specifies the mechanism in prose, not the
selection semantics

Doc 05 §8.5 says motif-carrying elements draw from the source culture's `motifVocabulary` and that
cultures sharing motifs through `culturalExchange` create attribution ambiguity, but pins neither
how borrowed motifs weigh against native ones, how exchange data reaches a per-artefact function,
nor which materials satisfy the BNF's `<material>` arguments. All were settled at 2GN.33
(interviewed decision-by-decision, mirroring the 2GN.17/2GN.19 sessions).

**Separate pass, not part of expansion.**
`assignDecorativeDetails(layers, culture, phase, geology, trade, sharedMotifSources, materials, techniques, prng)`
post-processes `expandDecoration`'s output rather than filling fields at emission time, so the
eventual pipeline can order it after 2GN.30's substrate stripping (no draws wasted on stripped
layers) and `expandDecoration`'s draw-sequence contract stays untouched. It recurses depth-first
into `sublayers`, so it is already correct for 2GN.31/2GN.32's layering. Scope note: the task's
roadmap title says only motif assignment, but introduced-material resolution
(`DecorativeLayer.material`) was confirmed as 2GN.33's during the interview — 2GN.29's scope note,
2GN.61's dormant-fields note and 2GN.68's dependency all attribute it here and nothing else owned
it.

**Exchange input is pre-resolved.** Following the `trade: MaterialFlow[]` precedent, the function
takes `sharedMotifSources: { motifs, intensity }[]` — the caller (Milestone 3's context assembly)
filters `CultureRelationship.phases` to windows covering the production year whose
`culturalExchange.domains` includes `'motifs'`. The engine pass stays free of temporal logic.

**Per-motif × intensity weighting.** Every native motif weighs `1`; every borrowed motif weighs its
source's exchange intensity (0–1). At full intensity a borrowed motif is indistinguishable from a
native one — the maximum-ambiguity reading of §8.5's closing question. Deliberate consequence,
accepted at interview: a partner with a larger vocabulary contributes proportionally more total
borrowing probability (per-motif, not per-source normalisation). A follow-on task (2GN.76) was
created for the salience dimension this flat weighting lacks: native and borrowed motifs should not
be equally prominent at every point in a culture's lifespan.

**Empty pools degrade, generation enforces.** A motif-carrying layer with an empty pool (no native
motifs, no sources) omits `motifRef` rather than throwing — the docs imply a real world never
contains a motif-less culture (§8.5's "primary cultural fingerprint"; doc 06's `decorative-mismatch`
strain assumes motif attribution works), but that invariant belongs to the culture generator, so
3WS.8 now carries the non-empty-vocabulary requirement as a note. Same policy for an
introduced-material pool emptied by an injected catalogue.

**Interviewed introduced-material tag sets** (approved item-by-item, 2026-07-25), grounded in
documented craft practice: `gilding` → precious-metal only (every documented gilding practice —
leaf, fire/amalgam, foil/diffusion, depletion; silvering as the silver analogue — uses gold or
silver, coinciding with the BNF's `<precious-metal>`); `wire-wrapping` → metal, precious-metal;
`wrapping` → fiber, leather; `inlay` → everything except fiber/leather/clay (solid inserts only);
`overlay` → metal, precious-metal, leather; `studs` → metal, precious-metal, bone; `beading` →
glass, stone, precious-stone, bone, metal, precious-metal (metal beads included at interview — well
attested in elite contexts, kept naturally rare by scarcity weighting). Candidates are then filtered
by `isAvailable` and weighted by the existing `computeMaterialWeight` product (cultural affinity ×
phase technology × scarcity), with `assignMaterial`'s exact availability-yields fallback.

| Doc | What changed                                                                                                                                                                      | Completed  |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| 05  | Section 8.5 gains an implementation note pointing at the selection semantics (this entry)                                                                                         | 2026-07-25 |
| —   | `src/lib/engine/generation/decoration.ts` (2GN.33): `assignDecorativeDetails`, `SharedMotifSource`, `INTRODUCED_MATERIAL_TAGS`; 17 Deno tests in the sibling `decoration.test.ts` | 2026-07-25 |
| —   | Roadmap: 2GN.76 added (motif salience across a culture's lifespan, blocked on 2GN.33); 3WS.8 gains the non-empty-vocabulary note                                                  | 2026-07-25 |

### 2.23 Doc Alignment Pass — PR 41 Review (2026-07-27)

**Origin:** CodeRabbit review of PR 41 (`feat/2gn-33-motif-assignment`) **Source of truth:** varies
per item, listed below

A repo-wide `deno fmt` sweep (commits `297422b`, `0b59e8b`) reflowed docs 03–09 into PR 41's diff,
surfacing pre-existing cross-document drift the review otherwise wouldn't have touched. None of it
concerns 2GN.33's actual engine changes. Thirteen findings, resolved as follows:

- **Plausibility retry exhaustion (doc 05 §5 near the re-expansion note; §14).** Undefined
  previously: N attempts capped with no stated outcome on exhaustion, while §14 guaranteed every
  emitted artefact passes all plausibility rules. Resolved: on exhaustion the pipeline throws a
  typed `PlausibilityExhaustedError` rather than emitting anything (relaxed rules or a fallback
  artefact would violate §14 and design pillar 3, Simulation Honesty) — the §14 guarantee now holds
  vacuously. Roadmap 2GN.16 carries the contract; the error type itself is still unbuilt.
- **Stage 6 material-assignment example (doc 05 §7) diverged from the shipped
  `assignMaterial`/`computeMaterialWeight`**
  (`src/lib/engine/generation/materials.ts:212-238,
  173-182`): missing the `geology` argument to
  `computeMaterialWeight`, missing the available→compatible→catalogue fallback ladder, wrong
  parameter order, and missing the empty-`allowedMaterialTags` short-circuit (2GN.10 not yet
  landed). Synced verbatim to the implementation. The doc's `available` filter itself was already
  correct — one of CodeRabbit's three sub-claims on this finding was wrong.
- **`InterpretiveModel` had two definitions with zero field overlap** — doc 06 §6
  (observations/inferences/hypotheses/publications) vs doc 08 §3.2
  (`agentId`/claim-maps/`methodologicalWeights`/`strainScores`/`contradictionQueue`, shipped at
  `src/lib/types/interpretation.ts:438-467`). Doc 08 is canonical; doc 06 §6 now points at it. The
  four names survive as prose describing claim _status_ (doc 06 §2's Four Knowledge Layers), since
  that's a different axis from doc 08's claim-_subject_ partitioning, not a competing shape.
- **`ReputationGate.requiredDimension: 'overall'` didn't type-check** against
  `keyof Reputation['dimensions']` (doc 07 §2.2; `src/lib/types/career.ts:87`). `overall` is a
  weighted composite (doc 07 §2), a sibling of `dimensions` rather than a member — the gate's intent
  was correct, the type couldn't express it. Resolved by widening, not narrowing: type is now
  `keyof Reputation['dimensions'] | 'overall'` in both `career.ts` and doc 07; `RoleRequirement`
  inherits the widened union with no consumer to update yet. ⚠️ Breaking change to an exported
  interface (no runtime consumer exists; evaluator 9CR.10 is unbuilt).
- **`temporalMode` vs `temporalProfile`** (doc 07 §2.3) — banner-flagged in-doc since doc 12 §2.17
  and already correct in `src/lib/types/venues.ts`, but `VenueDefinition` at doc 07 §2.3 still
  declared the stale `temporalMode: TemporalMode` field itself, with `TemporalMode`/
  `SubmissionWindow` defined below it. On reflection, a live interface declaration is a stronger
  claim than a supersession banner defuses — unlike `BackgroundDrain` below, this isn't a shape a
  reader might reasonably still consult, it's a field name that would silently mismatch `venues.ts`
  if anyone typed against it. `VenueDefinition.temporalMode` now reads
  `temporalProfile: VenueTemporalProfile`, and `TemporalMode`/`SubmissionWindow` are no longer
  defined here — the banner's prose narrows to record the supersession as history rather than point
  at a still-live block. Roadmap task 9CR.5's stray `temporalMode` mention is also fixed.
- **`BackgroundDrain` diverged between doc 07 §4.1 and doc 08 §3.6** — `energyPerWeek`/`roleImposed`
  vs the canonical `energyCostPerTerm`/`activeTermTypes`/`description`. Doc 07 already named doc 08
  canonical but described the diff as subsetting, which was wrong (units and semantics both
  changed). Doc 07's block marked superseded; the "by role" table converted from per-week to
  per-term illustrative figures (×`WEEKS_PER_TERM`) to match doc 08's shape.
- **`addContradiction` (doc 08 §3.4) pushed a bare `Contradiction`** into a `QueuedContradiction[]`
  queue and summed string-valued `severity` into a numeric `totalSeverity` —
  `src/lib/types/contradiction.ts:247-249` already flagged this block as illustrative pseudo-code
  doc 06 governs. Rewritten to construct a `QueuedContradiction` and score severity through a
  `severityScore` helper; doc 06 §4.4 still owes the actual string→number mapping, to land with
  contradiction detection at milestone 7CD.
- **`detectContradictions` (doc 08 §3.5) omitted the documented fourth `professionalCorpus`
  argument** (doc 06 §7's `ContradictionDetector.check` signature), making corpus contradictions
  unreachable. Argument added, sourced from `worldState.professionalCorpus`.
- **`resolvePeerReview` (doc 08 §3.5) read `reviewEvent.reputationEffect` and
  `reviewEvent.reviewerAgentId`**, neither of which exist on `PeerReviewCareerEvent` (doc 07 §3.3:
  `reputationEffects` — an array — and `reviewerId`). Both fixed; the reputation update now iterates
  the array.
- **Doc 03 §2 called the seven-systems list "dependency order"** when 2.3 Player Experience → 2.5
  Interpretive Lens → 2.4 Interpretive Model → 2.3 is a real three-node cycle (the core mechanic).
  Reframed as bootstrap order with the cycle named explicitly.
- **Doc 03 §2.1's pipeline summary omitted three of doc 05's nine stages** (initial corpus,
  decorative grammar, description generation), dropped "unified extraction" from stage 8's name, and
  ordered tag classification before material assignment. Replaced with doc 05 §1's canonical chain.
  The doc 05 §1.1 visibility table had the identical wrong ordering and omission — doc 03 appears to
  have been derived from that table rather than doc 05's own stage diagram — so the table was
  reordered too, or doc 03 would drift back on the next edit.
- **Doc 09 Phase 4's supersession banner (added 2026-07-04, doc 12 §2.11) didn't match its own
  body** — title, "What Gets Built" and "Definition of Done" still described
  accumulation-during-grammar-expansion after the banner declared it superseded. Body rewritten to
  describe single-pass unified extraction (doc 05 §9), keeping the requirements that survive
  (deterministic tag scoring, multiple qualifying tags, explorer visualisation). Phase 9's pipeline
  list (`docs/09-implementation-roadmap.md`, "Full pipeline orchestrator") carried the same
  `accumulation` stage with no banner at all; also fixed. See the appended row on §2.11 below.
- **Doc 09 Phase 19 required serialising `LensState`** (doc 12 §2.14, 2026-07-04, already states
  `lensState` is derived and recomputed on load, not persisted) — Phase 19 was never in scope for
  that propagation pass. `LensState` removed from the serialised-state list; the round-trip
  requirement now checks recomputation equivalence instead. See the appended row on §2.14 below.

| Doc | What changed                                                                                                                                                              | Completed  |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| 03  | §2 reframed as bootstrap order + cycle callout; §2.1 pipeline summary matches doc 05's nine stages                                                                        | 2026-07-27 |
| 05  | §5/§14 retry-exhaustion contract; §7 Stage 6 example synced to `materials.ts`; §1.1 table reordered                                                                       | 2026-07-27 |
| 06  | §6 `InterpretiveModel` superseded, points at doc 08 §3.2; four names kept as claim-status prose                                                                           | 2026-07-27 |
| 07  | §2.2 gate type widened; §2.3 unflagged straggler noted (fixed in roadmap); §4.1 `BackgroundDrain` superseded                                                              | 2026-07-27 |
| 08  | §3.4 `addContradiction` constructs `QueuedContradiction` + `severityScore`; §3.5 `detectContradictions` gains `professionalCorpus`; `resolvePeerReview` field names fixed | 2026-07-27 |
| —   | `src/lib/types/career.ts:82-94`: `ReputationGate.requiredDimension` widened to allow `'overall'`                                                                          | 2026-07-27 |
| —   | Roadmap: 2GN.16 gains the exhaustion contract; 9CR.10 states the two-branch lookup; 9CR.5 fixes `temporalMode`→`temporalProfile`                                          | 2026-07-27 |

### 2.24 Decorative-Complexity Classification Rules + Measured Thresholds (2026-07-28)

**Origin:** Roadmap task 2GN.34 implementation (2026-07-28) **Source of truth:**
`src/lib/data/classification.ts`'s module JSDoc and per-rule JSDoc — doc 05 §9.2 gives illustrative
constants only, never a measured basis for them

`extractFeatures` (roadmap 2GN.19) has computed `decorativeComplexity` and `techniqueComplexity`
from real signal since it landed, but no classification rule read either field until this task.
Before authoring new rules, the existing decoration-family rules were checked against real pipeline
output for the first time — 2GN.29 (decorative grammar expansion) and 2GN.33
(motif/introduced-material assignment) had both landed since those rules were authored at 2GN.17,
when no decoration pipeline existed to measure against.

**Thresholds are measured, not transcribed.** Sampling 1200 artefacts through the full pipeline
(`expandGrammar` → `normaliseArtefact` → `expandDecoration` → `assignDecorativeDetails` →
`extractFeatures`) across three `decorativeEmphasis` settings, against the mock culture/geology
fixtures, found the original decoration-family thresholds fired far above their stated intent:
`decorativeLayerCount >= 3` ("heavily worked decoration") on 86.8%, the two cross-layer archetype
rules (`>= 2` on an edged/contained object) on 94.7–96.9% of their conditional population, and doc
05 §9.2's own illustrative `decorativeComplexity > 2`/`> 1` on 95.8%/98.9%. Under
`classifyArtefact`'s plain-sum, unbounded fold (doc 12 §2.21), a rule firing that often adds a
near-constant to every artefact's score rather than discriminating elite objects from ordinary ones
— it shifts `elite`/ `ornament` globally. Measured distribution (n=1200): `decorativeLayerCount` p50
6/p75 10/p90 13/max 32; `decorativeComplexity` p50 11.2/p75 16.3/p90 22.3/max 41.2;
`techniqueComplexity` p50 5/p75 7/p90 9/max 13; `decorativeComplexity / partCount` p50 3.0/p75
4.05/p90 5.1/max 8.1; zero-decoration share 1.1%. Every threshold below is pinned to a percentile of
this table, recorded here as the baseline for future retunes as the rule set or the pipeline's
decoration volume changes.

**Existing rules retuned; one left as-is.** `decorativeLayerCount >= 3` (elite/ornament/ceremonial)
raised to `>= 10` (measured p75, now firing on 25.3%) — its JSDoc explicitly claimed "heavily worked
decoration ... signals high status" while firing on 87%, so stated intent and actual behaviour had
diverged; this is a correction, not a new decision. Both cross-layer archetype rules
(`hasEdge && decorativeLayerCount >= 2` → ritual/ceremonial/elite; `hasContainer && ... >= 2` →
ceremonial/votive/elite) raised to `>= 6` (the measured p50 of edged/container-artefact layer counts
respectively), now firing on 64.5%/60.7% of their conditional population. The any-decoration nudge
(`decorativeLayerCount >= 1` → `ornament` 0.2) was left unchanged: its JSDoc states an explicitly
cheap, deliberately universal signal, and near-universal firing at a 0.2 weight is what it is
documented to do, not a divergence — its 98.9% firing rate is recorded here rather than treated as a
defect.

**The engraved-sword archetype survives at a higher bar.** Doc 05 §9.2's closing worked example — "a
bronze blade with engravings scores on `weapon`, `ritual`, `ceremonial`, and `elite` simultaneously"
— is carried by the retuned `hasEdge`-cross-layer rule and both pinning integration tests
(`src/lib/data/classification.test.ts`, `src/lib/engine/generation/classification.test.ts`). Both
were updated from a 3-layer example blade to a 6-layer one; the claim in doc 05 §9.2 still holds
verbatim, it now requires an ordinarily (not minimally) decorated blade to earn it, which is the
more defensible reading once the rule's threshold matches its stated intent.

**New rules pair a raw threshold with a per-part proportion, needing no new field.** Decoration
volume tracks a culture's phase decorativeness far more than any single artefact's status — mean
`decorativeLayerCount` ranges from 0.54 at `decorativeEmphasis` 0.1 to 23.7 at 1.0 in the same
sample — and `expandDecoration` draws per component, so volume also scales with `partCount`. A raw
threshold on `decorativeComplexity` therefore partly encodes "made in a decorative phase / has many
parts" rather than "this object is special". Two raw-threshold rules (`>= 16`, the measured p75,
tagging elite/ceremonial; `>= 25`, ~p93, tagging elite/ritual, deliberately cumulative with the
first) capture the real archaeological signal that absolute investment is itself status-bearing. A
third rule reads `decorativeComplexity / partCount >= 4` (measured p75 of the ratio) to catch the
complementary case — a small object carrying disproportionate decoration — and is the one genuinely
new discriminative axis this task adds; measured overlap between the raw `>= 16` rule and this ratio
rule is only 13.8% of a 28.6% base, confirming they select substantively different objects.
**`partCount` is already on `ExtractedFeatures`** (populated since 2GN.19), so the proportion is an
inline rule expression, not a new field — keeping this a `data/classification.ts`-only change with
no breaking `ExtractedFeatures` contract change, and no bleed into 2GN.19's extraction scope. A
future consumer wanting the ratio as a first-class displayable value (the Explorer tag inspector,
roadmap 2GN.59; description generation) would spawn its own task rather than this one pre-emptively
adding the field.

**`techniqueComplexity` measures breadth, `decorativeComplexity` measures volume — read both, tag
differently.** `techniqueComplexity = maxDepth × distinctTechniques`, and `maxDepth` is pinned at 1
until roadmap 2GN.31 lands sublayer expansion, so today the field is literally a strict summand of
`decorativeComplexity`, not merely correlated with it. A fourth new rule reads it (`>= 8`, measured
p90, firing on 20.6%) but tags `artisanal` primarily (0.4) and `elite` only secondarily (0.2),
rather than compounding the `elite` weight the `decorativeComplexity` rules already carry — many
distinct techniques on one object implies multiple specialists and tool sets, a genuinely different
classificatory claim from "heavily decorated". **Forward hazard recorded for 2GN.31**: once nesting
depth varies, the same `techniqueComplexity` value becomes reachable at a fraction of the technique
breadth and this rule will saturate with no change to `classification.ts` — a Deno test
(`extractFeatures: techniqueComplexity is currently a bare distinct-technique count — 2GN.31
regression guard`,
`src/lib/engine/generation/classification.test.ts`) pins today's flat-layer contract so that change
breaks a test loudly rather than the rule saturating silently; the roadmap entry for 2GN.31 carries
the same note.

**Test fixture raised to match.** `maximalFeatures()` in `classification.test.ts` previously set
`decorativeComplexity: 4` and `techniqueComplexity: 5` — below every new rule's threshold and even
below the original `decorativeLayerCount: 6` — so the no-throw, purity and mechanical-boundary-guard
sweeps that run against it would have silently never exercised any decoration rule at all, retuned
or new. Raised to `decorativeLayerCount: 20`, `techniqueComplexity: 12`, `decorativeComplexity: 30`
(with `overallComplexity` recomputed to match), restoring those sweeps' coverage.

| Doc | What changed                                                                                                                                                                                                                                                                                                   | Completed  |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| 05  | §9.2 gains an implementation note: the illustrative `decorativeComplexity` constants measure at 95–99% of real output; `classification.ts` is the source of truth for thresholds; the engraved-blade archetype now needs 6 layers                                                                              | 2026-07-28 |
| —   | `src/lib/data/classification.ts` (2GN.34): three existing decoration rules retuned to measured percentiles; four new rules (`decorativeComplexity >= 16`/`>= 25`, `decorativeComplexity / partCount >= 4`, `techniqueComplexity >= 8`)                                                                         | 2026-07-28 |
| —   | `src/lib/data/classification.test.ts`, `src/lib/engine/generation/classification.test.ts`: retuned-rule tests updated; new R38–R41 test section; `maximalFeatures()` raised; worked-example integration tests updated to 6 layers and strengthened to pin the contributing rule; 2GN.31 regression guard added | 2026-07-28 |
| —   | Roadmap: 2GN.31 gains a re-measure note for `techniqueComplexity`/R41; 2GN.59 gains a note that these are the provisional weights it retunes                                                                                                                                                                   | 2026-07-28 |

---

### 2.25 Modelled Geology + Structural Saturation in Classification (2026-07-31)

**Origin:** Roadmap task 2GN.79 implementation (2026-07-31) **Source of truth:**
`tests/fixtures/world.ts`, `src/lib/data/classification.ts` and `src/lib/data/calibration.test.ts` —
this entry records why, not what

**The fixture modelled a quarter of the catalogue.** `mockGeologicalContext` carries four of the
sixteen shipped materials (bronze/iron/gold/flint), so the other twelve reached `isAvailable`'s
"unmodelled → obtainable" lenience at full weight. Every measured number in §2.24 was taken against
that fixture. Measured effect: silver was the second most common material at 11.1% of components,
jade 6.6% against genuinely-scarce gold's 1.4%, and 55.3% of artefacts carried at least one
"precious" component — a world where precious materials are ordinary, produced by a gap in a test
fixture rather than by any design decision.

**Six named regional worlds, not one corrected fixture.** The task originally scoped a single
`mockFullGeologicalContext`; the interview widened it to six internally coherent places
(`riverValley`, `highlandMine`, `coastalPort`, `forestInterior`, `desertMargin`, `steppeMargin`),
each modelling all sixteen materials explicitly and paired with its own `MaterialFlow[]`. The reason
is calibration integrity: a threshold measured against one geology is indistinguishable from a
threshold overfitted to it, and six divergent worlds make that difference visible. Coverage of
`isAvailable`'s branches emerges from the places rather than being designed in — `desertMargin` has
no forest or flax so `oak`/`ash`/`linen` are `absent`, and `forestInterior` carries an empty flow
array so its `trade-only` metals are excluded through the no-matching-flow branch instead.
`mockGeologicalContext` is deliberately unchanged: it is now the fixture that covers the
unmodelled-lenience path the six full worlds no longer reach. `sampleWorld()` gained a region
parameter (default `coastalPort`) and every sampler a `--world` flag — a scope expansion beyond the
task's two stated files, agreed at interview.

**Correcting the geology fixed materials and left `elite` untouched, which was the finding.**
Re-measuring 7200 artefacts across the six worlds: precious-bearing artefacts 55.3% → 27.1%, silver
11.1% → 3.9%, jade 6.6% → 1.4%, gold now commoner than jade. But `elite` barely moved (89.8%
presence, 35.4% leader) and sat within 1.6 points across all six worlds (89.2–90.8%) despite
radically different material availability. A tag that flat across that much variation is not
responding to materials at all, which redirected the task from the material hypothesis its roadmap
entry assumed to the decoration rules underneath.

**Saturation can be structural, and then no weight fixes it.** `appliedElementPresent` fired on
84.6% not because its threshold was wrong but because `expandDecoration` gives each BNF category its
own per-component slot rolls: at the fixture phase every component has a 0.45 chance of carrying an
applied element, so a ~4.15-component artefact reaches ~87% by arithmetic (measured 87.2% at
emphasis 0.5, against 91.6% predicted by the closed form — the gap is slot-0 misses stopping the
category). The distribution underneath still discriminates (p50 2, p75 4, p90 5, max 15); the
boolean discarded it. **General lesson for future rules: a boolean over a quantity the generator
produces repeatedly will saturate, and reweighting it only shrinks a constant.** Hence
`ExtractedFeatures.appliedElementCount`, an extraction-side addition agreed at interview — this task
was therefore not the data-only change its roadmap entry scoped.

**Retunes followed one criterion: does stated intent match measured behaviour.** A rule firing often
because the structure it reads is genuinely common is reporting the truth and was left alone (the
edge rule at 39%, the heavy-container rule at 40%). Two rules diverged. The applied-element rule now
reads `appliedElementCount >= 4` (measured p75, 25.2%, within a point of §2.24's retuned
`decorativeLayerCount >= 10` at 25.3%). The structural-complexity rule rose to
`attachmentDiversity >= 3` (44.4% → 22.3%), and its `partCount >= 3` clause was **dropped as inert**
— measurement showed identical firing with the clause, without it, and with it raised to `>= 4`,
because three joint types cannot occur without the parts to carry them. A clause that never changes
the outcome misrepresents what a rule tests.

**§2.24's ruling on the any-decoration nudge is upheld, and 2GN.79's entry corrected.** The roadmap
entry for this task named `decorativeLayerCount >= 1` (98% firing) as a co-driver of the `elite`
problem. It is not: it does not diverge from its stated intent, §2.24 had already reasoned this
through, and `ornament`'s leadership fell 27.0% → 18.8% on the applied-element fix alone without
touching it. Recorded here so the register does not carry a diagnosis the measurement disproved. Net
result: `elite` leadership 35.4% → 27.4%, and the top four tags now sit within 12 points of each
other rather than 25.

**Thresholds survive catalogue growth; they do not survive phase variation.** Measured identical at
2×, 4× and 10× the applied-element technique pool, because slot count sets the quantity and pool
size only decides which technique fills a slot — so new decorative content does not silently
invalidate these numbers. Geology likewise barely moves them (22–26% across the six worlds). Phase
attributes do: the applied-element rule fires on 4.3% at `decorativeEmphasis` 0.1 and 48.1% at 1.0,
2.3% at `craftSpecialisation` 0.1 and 74.5% at 1.0. **Every threshold in the file is absolute and
carries this sensitivity, including §2.24's seven.** That means `elite` currently reads "unusually
decorated in absolute terms", so a decorative culture reads as composed of elites and an austere one
as having none — the same failure 2GN.77 identifies for materials, reached from the decoration side.
Spike 2GN.80 owns the ruling; recalibration tasks 2GN.82–85 sit between it and any work whose
correctness depends on what the tag scores mean.

**Fire rates are now under test.** Nothing checked that a rule still fires at the rate its author
measured, which is how the applied-element rule sat at 84.6% from 2GN.34 to here while its comment
claimed it marked deliberate embellishment: the rules were tested only in isolation, so the rule set
and the generator drifted apart silently. `src/lib/data/calibration.test.ts` drives the full chain
across all six worlds and pins every rule's rate within 10 points, plus asserts that no rule
claiming selectivity exceeds 60% (the any-decoration nudge exempted by name). It fails loudly and
legibly — verified by reverting the retune, which named the drift and its size.

| Doc | What changed                                                                                                                                                                                                                                                   | Completed  |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| —   | `tests/fixtures/world.ts`: six named regional worlds modelling all 16 materials, each with its own trade flows; `mockGeologicalContext` deliberately unchanged; new `tests/fixtures/world.test.ts`                                                             | 2026-07-31 |
| —   | `src/lib/types/artefact.ts` + `engine/generation/classification.ts`: new `ExtractedFeatures.appliedElementCount`; `appliedElementPresent` retained, now derived from it                                                                                        | 2026-07-31 |
| —   | `src/lib/data/classification.ts`: applied-element rule reads the count at `>= 4`; structural-complexity rule at `attachmentDiversity >= 3` with its inert `partCount` clause dropped; module JSDoc records the re-measurement and the phase-sensitivity caveat | 2026-07-31 |
| —   | `src/lib/data/calibration.test.ts`: new fire-rate regression guard over all 43 rules, plus a saturation-ceiling invariant                                                                                                                                      | 2026-07-31 |
| —   | `scripts/dev/`: `sampleWorld(region)` and `--world` across five samplers; five pre-existing broken `assignMaterial`/`expandDecoration` call sites fixed (argument order — `deno check` was failing and two samplers threw at runtime)                          | 2026-07-31 |
| —   | Explorer: new Rule Calibration panel (`/dev/explorer/calibration`, roadmap 2GN.81) reporting per-rule fire rates and per-tag presence/leadership over a sampled population                                                                                     | 2026-07-31 |
| —   | Roadmap: 2GN.79 done; new 2GN.80 (absolute-vs-culture-relative status spike), 2GN.81 (calibration panel), 2GN.82–85 (recalibration of thresholds, fill constants, scarcity weights, tag semantics); 2GN.27/2GN.38/2GN.68 gated behind the recalibration set    | 2026-07-31 |

---

### 2.26 Mass Proxy Saturation + Band Rebalance (2026-08-01)

<!-- rule-count: historical -->

**Origin:** Per-rule audit of all 43 classification rules, requested after 2GN.79 cleared 41 of them
in prose rather than individually **Source of truth:** `deriveDimensions` and `MASS_BAND_CM2` in
`src/lib/engine/generation/grammar.ts`

**Auditing every rule found three that read `massBand`, and all three were wrong.** R27
(`very-heavy` → communal/ceremonial) fired on 0 of 7200 artefacts. R25 and R26 fired on 55.8% of
edged and 61.1% of container artefacts while their JSDocs claimed contrasts — "labour, _not_ a blade
weapon", "storage jar _rather than_ tableware" — that only hold for a minority. The 2GN.79 session
had cleared all three as "structural, therefore honest" without measuring their conditional
populations.

**The defect was the proxy, not the boundaries, and no boundary could have fixed it.**
`deriveDimensions` scored mass as `primaryExtent * secondaryExtent * (1 + 0.1 * (parts - 1))`, and
both extents are _maxima_ across components. Each component draws its size from a three-value
ordinal table (4/14/40, 5/15/45, 3/8/18), so with 2–13 components at least one almost always rolled
`large`: both axes pinned to 45cm and **57.4% of a 7200-artefact sample landed on exactly
45×45=2025**. When one value holds the majority of output, every possible cut point either includes
it (that band ≥57%) or excludes it (everything below sums to ≤43%). `heavy` swallowing 57% was that
spike, not a mis-set threshold. Separately the proxy's reachable maximum was 4658 against a
`very-heavy` cut of 5000, so that band was unreachable by arithmetic rather than merely rare — R27
was dead code carrying an authored intent.

**This is the same failure as `appliedElementPresent` (§2.25), one layer down.** Both collapse a
multi-part quantity to a maximum-or-presence over components, and both saturate because the
generator produces enough components that the extreme is almost always reached. **Recorded as a
general hazard: any statistic defined as a max or an any-of across a generated collection will
saturate as that collection grows.** Sums, counts and proportions do not.

**Summed footprints.** Mass now sums each component's own major×minor. A many-part object is
genuinely more massive than a one-part object sharing its largest axis, which a maximum can never
express. The distribution went from 21 distinct products (top value 57.4%) to 1810 (top value 1.8%),
range 9–4658 to 16–12183. Bands are pinned to measured p15/p45/p80/p95 (233/2033/2892/5007),
deliberately tapering rather than equal-sized: most excavated finds are portable, with heavy objects
uncommon and immovable ones rare, so band populations should thin towards the top. Equal quintiles
were measured and rejected — they would have claimed a quarter of all finds are too heavy for one
person to lift. Resulting spread: negligible 15.3% · light 29.2% · moderate 35.2% · heavy 15.6% ·
very-heavy 4.8%.

**Downstream, all measured rather than assumed.** R27 0% → 5.0%, alive for the first time. R25 55.8%
→ 19.5% of edged, R26 61.1% → 24.8% of containers, so both contrast claims now hold. R37 1.1% → 1.9%
and R39 8.5% → 10.6%, because their gated presence flags require `massBand` at most `light` and more
artefacts now qualify as wearable. `portability` reads mass too, so `major-effort` and `team-lift`
became reachable. Every other rule unchanged to the decimal. **The §2.25 calibration guard caught
the drift**, naming both moved rules with their sizes — the first time it did the job it was built
for. Five recorded rates were re-recorded and annotated with their previous values.

**R4 remains unreachable and is not fixed here** (roadmap 2GN.87). Only 50 of 7200 artefacts are
edged with a short primary axis, and all 50 carry a short blade band, so R2/R3 always claim them
first. Unlike R27 it has no identified upstream cause; the task decides between fixing the grammar,
correcting the condition, and deleting the rule.

| Doc | What changed                                                                                                                                                                       | Completed  |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| —   | `engine/generation/grammar.ts`: mass proxy sums per-component footprints; new `MASS_BAND_CM2` pinned to measured percentiles, replacing the unreachable 60/300/1500/5000 constants | 2026-08-01 |
| —   | `engine/generation/grammar.test.ts`: two new invariants — mass grows with part count, and no single band holds a majority of output                                                | 2026-08-01 |
| —   | `src/lib/data/classification.ts`: R25/R26/R27 JSDocs record their measured rates and why they previously diverged; conditions unchanged, since the defect was upstream             | 2026-08-01 |
| —   | `src/lib/data/calibration.test.ts`: five rates re-recorded with their previous values annotated; the expected-zero note corrected now that R27 fires                               | 2026-08-01 |
| —   | Roadmap: 2GN.86 (this change) done; 2GN.87 added for R4's unreachable condition                                                                                                    | 2026-08-01 |

---

### 2.27 Calibration Constants Audited (2026-08-01)

**Origin:** Completing the 2GN.79 oversight audit — the retunes and fixtures had per-decision
sign-off, but nine supporting constants did not **Source of truth:**
`src/lib/data/calibration.test.ts`, `src/lib/data/classification.ts` and
`src/routes/dev/explorer/calibration/ruleCalibration.ts`

**A guard's tolerance is only meaningful against its noise floor, and nobody had measured one.**
`TOLERANCE_POINTS` was set to 10 by feel. Re-running the whole calibration sweep under five
different seed salts moves the worst-case rule by 3.8pp at n=1800 — so a 10pp band left only 6.2pp
of genuine headroom, and a rule could shift 9pp of real behaviour and pass silently. Tightened to 6
(~1.6× headroom), and verified by inducing a regression subtler than the mass rebalance that
prompted this: reverting the applied-element rule from `>= 4` to `>= 3` drifts it 14.4pp, which the
tightened band catches and names. `SAMPLES_PER_CELL` stays at 100 but is now justified rather than
assumed — measured noise by cell size is 25→5.4pp, 50→5.1pp, 100→3.8pp, 200→3.3pp, 400→3.5pp, so 100
sits at the knee and further sampling stops paying.

**A shared constant was silently duplicated.** `SATURATION_CEILING` was exported from the Explorer
panel _and_ re-declared as a local const in the guard, with nothing keeping the two in step — a
defect introduced by §2.25/§2.26's own work. It now lives once in `src/lib/data/classification.ts`,
beside the rules it describes: it is a fact about the rule set rather than about either consumer,
and `routes/` may depend on `lib/` but not the reverse. Value unchanged at 60.

**A verdict that maps to no action is noise.** The panel's `rare` band (below `DORMANCY_FLOOR` = 1%)
was measured across all four Explorer culture presets: it flagged four rules on Tarpan
(`very-heavy`, heavy-decoration, applied-element, lavish-complexity), one each on Thalassar and
Khaltiris, none on Xoconahtl. On Tarpan those are the decoration rules, rare precisely because it is
a low-decoration culture — they are behaving correctly. The badge reported a property of the
selected culture, not a defect, and the fire-rate column beside it already said "uncommon here" more
precisely. Removed. Three verdicts remain, each mapping to an action: `dormant` (investigate — a
rule can be unreachable rather than merely rare, as R4 is and R27 was), `saturated` (check stated
intent against behaviour), `discriminating` (working).

**Defaults hide decisions.** `mockRegionalWorld`, `mockFullGeologicalContext` and `sampleWorld` all
defaulted to `coastalPort`, chosen for being the most materially varied — which is true, and also
makes it the least typical (almost nothing is locally abundant, so its mix is dominated by trade).
Which world you generate against changes material distribution substantially, so the engine-side
fixtures now take no default and callers must name one. The CLI keeps a `DEFAULT_SAMPLE_REGION` so
samplers run bare, and every sampler now prints its world in a header — an omitted `--world` was
previously invisible in output, which is the failure mode the removal guards against.

**R31's weights were reviewed and kept.** `elite 0.4, ornament 0.3` carried over unchanged from the
saturating boolean version, so the condition was ruled on at §2.25 but the weights never were. They
were authored for a rule meaning "deliberate embellishment", and the retuned condition finally
delivers that meaning at a selectivity matching the heavy-decoration rule's (25.2% vs 25.3%). Any
further change belongs to 2GN.82's systematic pass rather than to one rule in isolation.

| Doc | What changed                                                                                                                                      | Completed  |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| —   | `src/lib/data/calibration.test.ts`: `TOLERANCE_POINTS` 10 → 6 with its noise measurement recorded; `SAMPLES_PER_CELL` justified; ceiling imported | 2026-08-01 |
| —   | `src/lib/data/classification.ts`: `SATURATION_CEILING` defined here as the single source for both consumers                                       | 2026-08-01 |
| —   | `routes/dev/explorer/calibration/`: `DORMANCY_FLOOR` and the `rare` verdict removed; ceiling re-exported from the data layer                      | 2026-08-01 |
| —   | `tests/fixtures/world.ts`, `scripts/dev/shared.ts`: region defaults removed; `DEFAULT_SAMPLE_REGION` and a per-run world header added             | 2026-08-01 |
| —   | Roadmap: 2GN.88 records the audit                                                                                                                 | 2026-08-01 |

---

### 2.28 Tag Relativity Ruled: Relative by Tag, Empirical by Culture-Phase, Vocabulary Re-Split (2026-08-04)

**Origin:** Roadmap spikes 2GN.80 and 2GN.77, ruled jointly **Source of truth:** doc 11 §2.9 holds
the decision; this entry records why it went the way it did and what the measurement found

**Two spikes, one question.** 2GN.80 asked whether status thresholds are absolute or
culture-relative from the decoration side; 2GN.77 asked the same of materials. They were ruled
together because separate rulings could have contradicted each other, and because the material
answer turned out to depend on machinery the decoration answer needed anyway.

**The boundary is drawn by what a rule awards, not what it reads.** The intuitive cut — physical
conditions absolute, decorative conditions relative — was rejected on inspection of the shipped rule
set. Parsing all 43 rules found the decoration-conditioned family (eleven rules) awards `elite` in
every case but the any-decoration nudge, which is the clean part. But two rules with purely physical
conditions, the thin-walled container and the pedestal base, also award `ceremonial`+`elite`. A
condition-side cut would leave those two making absolute standing claims while their eleven siblings
made relative ones, and no explanation of the boundary would survive contact with them. Cutting by
awarded tag costs per-culture baselines for wall thickness and base type, which nothing models — and
which empirical calibration produces for free, for any feature. That cost is what decided the
sampling question below rather than the other way round.

**The award-side cut selects far more of the rule set than the decoration family, and the first
draft of this ruling undercounted it.** Applying the stated selector mechanically gives **34 of 43
rules**; only 9 award purely absolute tags. The original enumeration named thirteen and reached for
"this includes" to stay technically true, which would have led 2GN.82 to size its work at a third of
the real figure. The rules it missed are not exotic: the thick-walled and heavy-container rules
award `utilitarian` off the same `wallThickness`/`massBand` axis the thin-walled rule awards `elite`
off, so the justification for pulling one in was the justification for pulling in all three; the
slit and sealed container rules award `votive`/`funerary`; and the perforation, ring-gap,
sheet-flexibility, size-band and wearability families all award `personal`, `everyday`, `artisanal`,
`communal` or `military`. **General lesson: when a ruling states a selector, run it over the data
rather than enumerating by hand — a hand-written list of examples reads as a specification to
whoever implements it.** The count is now pinned by a test (`classification.test.ts`) rather than
restated in prose, because rule indices shift whenever the array is edited and prose enumerations go
stale silently.

**The tag vocabulary was reorganised to carry the split, and `ritual`/`votive`/`funerary` moved.**
Recording the boundary exposed that `ritual` and `votive` were `FunctionTag` members and so filed
absolute by the ruling, while 2GN.85's brief named them alongside `elite`/`ceremonial` as tags whose
standing semantics it had to settle. The decoration-conditioned edged-artefact rule made the
friction concrete: one condition awarding `ritual`+`ceremonial`+`elite` would have split two
relative and one absolute from a single firing. The wrong thing was the vocabulary, not the ruling.
`FunctionTag` (FOR) / `ContextTag` (USED) was replaced by `AbsoluteTag` / `RelativeTag`, with
`ritual`, `votive` and `funerary` relative: each is an inference about intent from morphology or
decorative excess, and `DepositionType` (doc 05 §3.5) already carries the objective deposition axis
separately. The FOR/USED axis had no branch point anywhere in the codebase, while the axis that
decides whether a rule needs a baseline was implicit and recoverable only by inspection — replacing
one with the other costs nothing and makes the governing question answerable from the type. Done now
because both `FunctionTag[]` consumers (`NPCScholarSeed.specialisation`,
`DescriptionVariant.emphasis`) were still unpopulated; after Milestone 3 seeds scholars the same
change would have meant migrating real data. **This is the same shape as §2.25's saturating boolean:
a representation inherited from an earlier framing quietly stopped matching the question being asked
of it.**

**Percentile stability is not fire-rate stability, and the difference is large.** §2.27 measured
sampling noise for _fire rates_ and found n=100 at the knee (3.8pp worst case). Inheriting that
number for baselines would have been wrong: a fire rate is a proportion, a baseline is a percentile,
and percentiles are markedly noisier in the tails where status thresholds actually sit. Measured
directly over the five continuous decoration metrics under five seed salts, worst-case relative
spread runs 20–28% at n=100, 8–17% at n=400, and 0–6% at n=800 for p50/p75 with nothing gained
above. **n=400 per culture-phase** is the knee. **General lesson: a noise floor measured for one
statistic does not transfer to another statistic over the same data.**

**One metric never converges, and the cause is the generator.** `appliedElementCount` sat at 20%
spread at p90/p95 and did not improve from n=100 to n=1600. Histogramming it found only 9–16
distinct integer values, with the entire tail above 4 amounting to 5.1% of output at
`decorativeEmphasis` 0.1 — so a nearest-rank percentile lands between adjacent integers and flips
between them regardless of sample size. No sampling budget fixes granularity that lives in the
generator. Baselines are therefore stored as **fractional thresholds** with rules comparing
`value >= baseline`, so the cut point moves continuously. **This is the third appearance of the same
family of defect** (§2.25's saturating boolean, §2.26's max-over-components mass proxy): a statistic
inherits the coarseness of the generated quantity beneath it, and collapsing or rounding at the
wrong moment discards the discrimination the distribution still holds.

**No bootstrap circularity exists.** Empirical calibration appears to require classification to
produce the artefacts it calibrates against. It does not: classification is the final pipeline stage
and nothing upstream reads tags, so a calibration pass runs stages 1–7 only. The apparent dependency
was never mutual. Sampling was chosen over a closed-form analytic estimate because the closed form
drifts silently whenever `expandDecoration` changes — precisely the failure §2.25 spent a session
correcting, where a threshold and its generator diverged unnoticed for four tasks.

**The culture-wide baseline was proposed and dropped.** The original framing offered per-culture and
per-culture-phase baselines together. Interrogated, the culture-wide one has no defensible meaning:
time moves forward, so scoring an early-phase artefact against an average spanning the culture's
whole lifespan judges it against phases that had not yet happened — incoherent in a game about
inferring the past from partial evidence. It also destroys the signal it was meant to provide, since
a culture growing steadily more lavish reads "normal" at every phase against its own average. Drift
is therefore measured against the **immediately preceding phase only**, carrying magnitude and
direction, with the first phase's drift null rather than zero.

**The ruling exposed a gap in unbuilt work.** Drift across phases is only meaningful if phases
evolve continuously, and nothing enforces that: `CulturePhase.characteristics` is a free
`PhaseCharacteristics` per phase, and doc 05's five coherence rules are all within-artefact
(structural, geological, decorative), none temporal. As written, a culture could oscillate
`decorativeEmphasis` 0.1 → 1.0 → 0.1 across three phases unchallenged. Culture generation is
Milestone 3 and unbuilt, so this is recorded as a requirement on it (roadmap 3WS.21) rather than a
defect — but recorded now, by the decision that depends on it, rather than discovered when drift
starts reporting noise.

**Regions are shared between cultures, which keys material baselines differently from decoration
ones.** `Provenance.site.region` is a plain string and `RegionalAvailability.regions` maps
availability by region name with no binding to any culture; doc 05's own player-facing example ("all
the literature on this region comes from the same institution") only works if regions are shared. So
a culture may span regions with different geology, and material baselines are keyed **culture-phase
× region** while decoration baselines need only culture-phase.

**§2.20's pure-function contract is amended, not broken.** `ClassificationRule.condition` widens
from `(features) => boolean` to `(features, context) => boolean`. Rules stay pure functions of their
inputs. The rejected alternative — pre-normalising relative fields into `ExtractedFeatures` — would
have kept the signature but made `extractFeatures` itself depend on world context, breaking the
purity §2.20 actually records. Widening the signature was the smaller violation of the two, and the
explicit one.

**Every threshold in `data/classification.ts` is now provisional.** All were measured under the
absolute reading this decision replaces, so 2GN.82–85's recalibration is gated on this ruling rather
than merely sequenced after it.

| Doc | What changed                                                                                                                                                           | Completed  |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| 11  | New §2.9 Status-Tag Relativity — the locked decision, the vocabulary reorganisation, and the rejected alternatives                                                     | 2026-08-04 |
| 12  | This entry — measurement findings, the boundary rationale, the undercount correction, and the two constraints raised                                                   | 2026-08-04 |
| —   | `types/tags.ts`: `FunctionTag`/`ContextTag` replaced by `AbsoluteTag`/`RelativeTag`/`ArtefactTag` ⚠️ breaking                                                          | 2026-08-04 |
| —   | `data/classification.ts`: ruling recorded at the rule set; 34/43 and 9/43 counts pinned by test                                                                        | 2026-08-04 |
| 05  | §9.2's tag code block supersedes to the new split — closed by §2.29                                                                                                    | 2026-08-04 |
| 05  | Pending: §3.2 `stratification` becomes a live classification input — see §1, blocked on 2GN.96                                                                         | —          |
| 08  | `ClassificationContext` type — closed by §2.30 (types-only; see that entry's own pending row for world-state caching)                                                  | 2026-08-05 |
| 12  | §2.22's tag sets re-keyed to the new vocabulary — **no action needed** (§2.37): those are `MaterialTag` values, never in the retired vocabulary `ArtefactTag` replaced | 2026-08-10 |
| —   | Roadmap: 2GN.80 and 2GN.77 resolved; 2GN.82–85 gated on this ruling; new 3WS.21 for phase-attribute continuity                                                         | 2026-08-04 |

---

### 2.29 2GN.85 Landed Doc-Only: Vocabulary Propagated to Consumers, §9.2 Rewritten (2026-08-04)

**Origin:** Roadmap 2GN.85, gated on 2GN.80.

**Source of truth:** doc 11 §2.9 holds the decision; this entry records what 2GN.85 itself delivered

**No code changed.** `deno task check` reported 0 errors across 549 files before this task started —
the ruling PR (#48) shipped `AbsoluteTag`/`RelativeTag`/`ArtefactTag` completely, and no
`FunctionTag`/`ContextTag` identifier survived anywhere in `src/`, `scripts/` or `tests/`. 2GN.85's
own notes anticipated this ("substantially delivered by the ruling PR itself") and left a re-scope
instruction on pickup, which this entry resolves: the task reduced to a documentation pass.

**§2.28's own "pending" line is now closed.** That entry's change table named doc 05 §9.2's code
block as pending supersession. It carried the retired `FunctionTag`/`ContextTag` declarations with
the supersession note appended fifty lines below — a reader met dead types before the ruling that
retired them. The block now declares `AbsoluteTag`/`RelativeTag`/`ArtefactTag` directly, matching
`src/lib/types/tags.ts` member-for-member; the 2026-08-04 note demotes to a short historical marker
rather than carrying the explanation. Four stale type references elsewhere in doc 05 (§4.1
`specialisation`, §9.3 `groundTruthTags`, §13.1 `emphasis`, §13.2 `TagSuggestion.tag`) were
corrected to match.

**The relative-tag constraint is now recorded ahead of the three consumers that inherit it.** None
of description generation (2GN.38+), the lens (M6) or NPC interpretation (M10) exist yet, so each
spec now carries a short note stating what it must respect once built: descriptions must not render
a `RelativeTag` as an intrinsic property (doc 05 §13.1); the lens scores a `RelativeTag` against the
culture-phase it currently _attributes_ the artefact to, not the true one (doc 04 §3.2); and
`InterpretiveModel` being agent-generic means the same indexing applies to NPC scholars without
further work (doc 06 §6).

**Two small corrections surfaced in doc 06 while reading it for the NPC note.** Its existing §2.28
supersession banner cited "§7's tag-belief entry" for the sole `FunctionTag` field; the document
ends at §6, and the field is in §3.3's `functionalEmphasis`. Separately, §2's introductory paragraph
still glossed the retired FOR/USED split in the present tense ("Function tags describe...");
reworded to past tense with a pointer to the shipped types.

| Doc | What changed                                                                                                                            | Completed  |
| --- | --------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| 05  | §9.2 code block rewritten to `AbsoluteTag`/`RelativeTag`/`ArtefactTag`; four stale references corrected; constraint note added at §13.1 | 2026-08-04 |
| 04  | Constraint note added at §3.2, after `ClassificationSuggestion`                                                                         | 2026-08-04 |
| 06  | Constraint note added at §6; §2's FOR/USED gloss and §2.28 banner's §7 reference corrected                                              | 2026-08-04 |
| 12  | This entry — closes §2.28's doc 05 pending line                                                                                         | 2026-08-04 |
| —   | Roadmap: 2GN.85 resolved, doc-only; 2GN.82–84 recalibration remain gated on 2GN.80                                                      | 2026-08-04 |

---

### 2.30 ClassificationContext Shipped Ahead of World State; 2GN.82 Re-Gated on the Machinery, Not Just the Ruling (2026-08-05)

**Origin:** Roadmap 2GN.94/2GN.95, split out while scoping 2GN.82.

**Source of truth:** doc 11 §2.9 holds the ruling; this entry records the machinery gap the ruling's
own text flagged (§2.9's "consequently, `ClassificationRule.condition` widens...") but that no task
built, and how it was closed.

**2GN.82 could not be started as scoped.** The ruling (§2.28, 2026-08-04) is fully decided, but
`ClassificationContext` was referenced in five places across `types/tags.ts` and
`data/
classification.ts` and defined nowhere; `ClassificationRule.condition` was still the
pre-ruling single-argument predicate; no baseline-sampling code existed; and no percentile helper
existed anywhere in `src/lib` — every p50/p75/p90 figure in `classification.ts`'s JSDoc was computed
out-of-band and hand-transcribed during 2GN.34/2GN.79, so the recalibration this task asks for was
not reproducible from the tree as it stood. Recalibrating thresholds against a culture-relative
basis with no implementation would have measured the wrong thing.

**Split into three tasks rather than folding the machinery into 2GN.82 itself.** 2GN.94 ships
`engine/statistics.ts` (`percentileOf`/`percentileLadder`, R-7 interpolation — required, not a taste
call, since §2.28 measured `appliedElementCount` taking only 9–16 distinct integer values, so a
nearest-rank percentile flips between adjacent integers at any sample size). 2GN.95 ships
`ClassificationContext`, the widened `condition` signature, and `engine/generation/baselines.ts`'s
`sampleBaselines` — **migrating zero rules**. 2GN.96 is split off and blocked (3WS.4, 3WS.9,
3WS.21): it owns baselines cached on real `WorldState`, drift-vs-preceding-phase, and
`stratification` as a live input, none of which have a real dependency to build against yet.

**The zero-migration slice is the load-bearing design choice.** TypeScript accepts a narrower-arity
function wherever a wider signature is expected, so all 43 shipped rules — still `(f) => boolean` —
compile unchanged against the widened `(features, context) => boolean` contract and fire
identically. `EXPECTED_FIRE_RATES` in `calibration.test.ts` stayed bit-identical through the whole
change, which is the empirical proof the slice altered no observable behaviour: 2GN.82's actual
recalibration is the only work licensed to move those numbers, and it now has clean ground to do so
on.

**Baselines sample against `EXPLORER_CULTURES`, not real culture generation, because no generator
exists.** `explorerCulturePhase` (`data/explorer-cultures.ts`) adapts an `ExplorerCulture` — which
already carries `profile` + `phase` + `geology` + `trade` in one record, all 16 shipped materials
modelled — into `sampleBaselines`' `CulturePhaseSample` parameter. `CulturePhaseSample` is
deliberately a structural bag rather than `CulturePhase` (`types/world.ts`), which carries none of
the three `expandDecoration` needs, so nothing in the sampler's signature has to change when 3WS.9
lands a real `WorldState` culture source.

**No shipped rule reads a context yet, so every current call site passes an empty one — true only as
of this entry; §2.31 migrates nine rules to `ClassificationContext.exceeds` the same day.**
`emptyClassificationContext` (`baselines.ts`, re-exported from `tests/fixtures/artefact.ts` for test
convenience) is used at both Explorer call sites (`tagInspector.ts`, `ruleCalibration.ts`) rather
than a freshly-sampled real context: `inspectTags` runs interactively per artefact, and
`sampleBaselines` draws `BASELINE_SAMPLE_SIZE` (400) extra artefacts through the full stage-1–7
pipeline — real latency for zero observable effect until 2GN.82 migrates a rule that actually calls
`exceeds`. The empty context still honours the type's off-ladder-throws contract for `exceeds`
rather than silently no-op'ing every call, so a caller bug (an out-of-ladder percentile) surfaces
the same way against an empty context as a sampled one.

**The culture-discrimination test is the ruling's first empirical checkpoint.** `baselines.test.ts`
samples Tarpan (`decorativeEmphasis` 0.4) and Thalassar (0.75) and asserts Thalassar's
`decorativeComplexity` p75 is strictly greater — if a more decorative culture doesn't measurably
out-decorate a less decorative one under this sampler, the ruling's premise fails before any rule
migration begins.

**Scope correction carried into 2GN.82/83/84's roadmap notes.** Their notes still described the
pre-ruling scope ("R12/R15 + eleven decoration-conditioned rules"), which §2.28 corrected to **34 of
the 43 shipped rules** via the award-side cut. Corrected in the same pass as the dependency repoint,
so the roadmap and doc 12 read consistently rather than one lagging the other.

**§2.28's doc-08 pending line is closed as partial, not complete.** The `ClassificationContext` type
now exists (`types/tags.ts`), but "world state carries cached per-culture-phase baselines" remains
genuinely pending — `WorldState` is not a type yet (`types/save.ts`), so there is nothing to cache
baselines on. `sampleBaselines` stays a pure function of its inputs until 3WS.9 gives it an owner to
memoise under; a module-level cache now would be an untestable global with no owner.

| Doc | What changed                                                                                                                                    | Completed  |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| 12  | This entry — machinery gap, the split, the zero-migration proof, and the `EXPLORER_CULTURES` stand-in                                           | 2026-08-05 |
| —   | `types/tags.ts`: `BaselineFeature`, `FeatureBaseline`, `ClassificationContext`; `ClassificationRule.condition` widened                          | 2026-08-05 |
| —   | `engine/statistics.ts`, `engine/generation/baselines.ts`: new, ship 2GN.94/95                                                                   | 2026-08-05 |
| —   | Roadmap: 2GN.94/95 done, 2GN.96 new and blocked (3WS.4/3WS.9/3WS.21); 2GN.82–84 repointed to depend on 2GN.95; stale 34/43 scope note corrected | 2026-08-05 |
| 08  | Still pending: `ClassificationContext` now exists in `types/`, but world-state caching remains genuinely blocked on 3WS.9 — see §1              | —          |

---

### 2.31 Nine Thresholds Recalibrated; Percentile Rung ≠ Historical Percentile; Categorical Rules Split to 2GN.97 (2026-08-05)

**Origin:** Roadmap 2GN.82.

**Source of truth:** doc 11 §2.9 holds the ruling and its ladder-closure amendment; this entry
records what recalibration actually found, which is not what a mechanical `1 - percentile` reading
would have predicted.

**"34 of the 43 rules need a baseline" is not "34 measured thresholds to recalibrate", and the scope
drifted between those two readings.** §2.28 and §2.30 both state the ruling's selector correctly — a
rule needs a baseline if it awards any `RelativeTag`, and applying that selector to the shipped rule
set gives 34. But 2GN.82's roadmap line names a narrower population: **eleven** thresholds pinned to
a measured percentile of an absolute distribution (§2.24's seven plus 2GN.79's R29/R31). Of the 34
relative-award rules, only **nine** have a numeric condition `ClassificationContext.exceeds` can
answer — the structural-complexity rule, the four decoration rules, the two cross-layer rules and
the two complexity-graded rules. The other 25 read categorical bands (`wallThickness`, `baseType`,
`openingType`, `massBand`, `perforation`, `ringGap`, `sheetFlexibility`, `sizeBand`) or plain
booleans (`isWearable`, `hasFasteningMechanism`), for which `BaselineFeature` has no member — its
own JSDoc rules this out by name: "a percentile over `hasEdge` or `openingType` is meaningless, and
a key type that admitted them would let a rule ask a question the sampler cannot answer." **General
lesson, the same one §2.28 already drew from the 13-vs-34 undercount**: a ruling's selector and a
task's actual measurement surface are two different counts, and conflating them sizes the next task
wrong. 2GN.82 migrates the nine; the categorical 25 are split to **2GN.97**, a design spike rather
than an implementation task, since what "relative" even means for a categorical band — a prevalence
baseline, a `stratification` gate (blocked on 2GN.96), or weight scaling on an unchanged absolute
condition — is not decided anywhere in doc 11.

**Migrating a rule to a percentile rung does not give it a fire rate of `(1 - percentile) * 100`,
and the gap is large enough to change which rung a rule should take.** Measured directly against the
real pipeline (18 culture-phase cells, n=400 baselines, n=1800 artefacts): `attachmentDiversity` has
roughly eight distinct values, and its sampled p75 lands exactly on the value `2` in the
overwhelming majority of measured culture-phases, with a large share of all output tied there.
Because `ClassificationContext.exceeds` uses `>=` (doc 11 §2.9's own convention, chosen so a value
at the threshold counts as exceeding it), `>= p75` admits the whole tie and fires on **43.4%** of
the sweep — almost exactly the 44.4% rate roadmap 2GN.79 retuned the rule away from in the first
place. The p90 rung reproduces the rule's authored intent, at 21.5% against the
historically-measured 24.0%. **This is a third face of §2.28's granularity defect.** §2.28 found
that `appliedElementCount`'s coarse integer values make a nearest-rank percentile _flicker_ between
adjacent values at any sample size, and fixed it with fractional interpolated thresholds. Fractional
thresholds cure that flicker, but not this: a threshold can still land exactly on a heavily
populated integer, and `>=` then admits every artefact tied there. **The two defects require
different fixes and neither implies the other is unnecessary** — fractional interpolation is still
required for the reason §2.28 gave, and checking the realised fire rate against a hand-reasoned
expectation is still required for this one. `appliedElementCount` itself shows the same pattern: p75
fires 37.3% against a historically-measured 25.7%, an 11.6pp move taken deliberately rather than
moving to p90 (15.3%), because 2GN.79 explicitly sized that rule to sit within a point of the
`decorativeLayerCount` rule's rate so the two elite-bearing decoration rules stay comparably
selective — under the ladder the `decorativeLayerCount` rule measures 30.9%, so p75 (37.3%, 6.4pp
apart) preserves that stated relationship far better than p90 (15.3%, 15.6pp apart) would.

**Two rules' historically-measured percentile had no ladder rung, and both were re-derived from
intent rather than from the nearest number.** `PERCENTILE_LADDER` (`engine/statistics.ts`) is
`[0.25, 0.5, 0.75, 0.9, 0.95]` by design — closed, so that two rules asking "p75" ask the same
question, with an off-ladder value throwing rather than silently interpolating a threshold nobody
measured. The exceptional-lavishness rule's absolute constant sat at ~p93 of a 1200-artefact
whole-world sample; that figure was never a chosen percentile, only a description of where the
constant `>= 25` happened to land. Moving it to p90 would fire 11.2% against the historically
recorded 7.7%, inflating the top elite tier by roughly 45% — diluting exactly the tier the rule
exists to mark, since it combines with its sibling rule to reach `elite` 0.9. p95 fires 5.8%, closer
to 7.7% and preserving the tier's exclusivity, and was taken instead. Symmetrically, the
technique-breadth rule's absolute constant (`>= 8`) was authored to "sit just inside" the measured
p90 (9) — a shim with no equivalent on a closed ladder. p90 itself was taken (14.8% against a
historically-measured 20.9%, pre-2GN.98; re-measured post-split at 19.3%, §2.33 below) rather than
p75 (34.7% pre-2GN.98, 31.3% re-measured) because the rule's own JSDoc frames it as a tail claim
("many distinct crafts", not "an above-average number"), and p90 keeps it reading as a tail while
p75 would read as "roughly average". p90 also directly closes a hazard the rule's JSDoc already
named: `techniqueComplexity` is `maxDepth * distinctTechniques` with `maxDepth` currently pinned at
1, so once roadmap 2GN.31 lands variable nesting depth, an absolute constant would saturate with no
change to this file — a percentile basis moves with the generator instead.

**Two rules' historically-measured percentile was of a sub-population the sampler does not provide,
and both were re-derived against the whole population instead of building one.** The edged-decorated
and decorated-container rules were originally measured at the p50 of, respectively, edged artefacts'
and containers' own `decorativeLayerCount` distributions — not the whole culture- phase output
`ClassificationContext.baselines` carries. Measured directly: the whole-population p50 fires on
70.0% of edged artefacts and 66.6% of containers — both saturated within their own gate population,
the exact defect `SATURATION_CEILING` exists to flag, even though the _whole-sweep_ rate (27.9%,
43.8%) looks unremarkable. Both rules were moved to the whole-population **p75** instead
(16.6%/41.4% of edged; 25.0%/38.0% of containers), which does not saturate either gate population.
Building a sub-population sampler was considered and rejected: it is real machinery —
`sampleBaselines` would need per-predicate filtered ladders — for a correction that, at p50, would
only have closed a gap of a few percentage points on the whole-sweep number, and the sub-population
reading has a weaker claim to being correct in the first place. "More decorated than three-quarters
of everything this culture makes" is answerable from evidence any in-world scholar could gather;
"more decorated than three-quarters of everything edged" presupposes a comparison class — the set of
everything edged this culture ever produced — that no character in the fiction has access to. The
sub-population measurement was an artefact of how roadmap 2GN.34 happened to measure (a filtered
sample was already in hand for another purpose), not a considered design requirement.

**The fire-rate regression guard needed three additions to keep catching what it caught before.**
Once a migrated rule's rate sits near its percentile rung by construction, `EXPECTED_FIRE_RATES`
alone stops being an independent measurement: a whole-distribution generator shift — the same shape
of defect roadmap 2GN.86 found in the mass proxy — would move the sampled baseline and the measured
artefacts together and could pass with no recorded drift at all. Three additions restore that
sensitivity in `calibration.test.ts`. First, the per-cell sampled _threshold values_ themselves are
now pinned (`decorativeLayerCount` p75, `decorativeComplexity` p95, across the three emphasis
settings) — a threshold value has no such self-stabilising property and moves whenever the
generator's output distribution actually does. Second, a per-cell spread guard on the migrated nine
catches the opposite failure, a baseline sampler bug that makes every cell read alike: the ruling's
premise is that relativisation _narrows_ spread relative to the retired absolute rules (the
exceptional-lavishness rule measures a 2%–10% per-cell spread against its absolute predecessor's
4.3%–48.1%), so a guard here has to permit narrowing while still catching total collapse. Third,
R33/R34's own sub-population rates (41.4% of edged, 38.0% of containers) are pinned alongside the
whole-sweep numbers, since a change in the _share_ of edged artefacts a generator produces could
move the whole-sweep rate without any change to how selectively either rule reads decoration.

**Consequence for `classification.test.ts`.** The file's 122 assertions all ran against one shared
`emptyClassificationContext()`; once a rule reads a real percentile, its positive assertions fail
and — the sharper problem — its negative assertions start passing against the wrong claim (an empty
context makes every migrated rule return `false` unconditionally, so "does not fire" becomes true of
everything). Fifteen test bodies plus the worked-example integration test needed a hand-built
`relativeContext` fixture carrying known thresholds, alongside the unmigrated 34 rules' existing
shared empty context. Two additions beyond repairing the broken assertions: a migration-coverage
guard, detecting by construction (comparing a rule's behaviour between an empty context and a
maximally permissive one) that any context-sensitive rule awards a `RelativeTag`, catching a future
rule migrated in the wrong direction; and a phase-discrimination test at the rule level — the same
artefact reading as exceptionally lavish against one hand-built culture-phase and ordinary against
another — complementing `baselines.test.ts`'s existing discrimination check at the
sampler/distribution level.

**A pre-existing, unrelated type error was found and fixed in passing.**
`scripts/dev/sample-classification.ts` had not compiled since roadmap 2GN.95 widened
`ClassificationRule.condition`'s arity: `deno task check` runs `svelte-check` over the SvelteKit
project, which never reaches `scripts/`, so the break went unnoticed for two roadmap tasks. Fixed by
passing a real sampled context, matching the Explorer panels' own resolution. Worth a standing note:
this project's primary type-check task has a blind spot outside `src/`.

| Doc | What changed                                                                                                         | Completed  |
| --- | -------------------------------------------------------------------------------------------------------------------- | ---------- |
| 12  | This entry — the nine rungs, the tie-mass finding, the scope correction, the categorical deferral                    | 2026-08-05 |
| 11  | §2.9 amended: the closed `PERCENTILE_LADDER`'s consequence for the ~p93 rule, recorded against the ruling's own text | 2026-08-05 |
| —   | `data/classification.ts`: nine rules migrated to `ClassificationContext.exceeds`; module JSDoc rewritten             | 2026-08-05 |
| —   | `data/calibration.test.ts`: real per-cell contexts; threshold and spread guards added                                | 2026-08-05 |
| —   | `routes/dev/explorer/shared/baselineCache.ts`: new, memoised per-culture baseline for the Tag Inspector              | 2026-08-05 |
| —   | `scripts/dev/sample-classification.ts`: pre-existing arity break fixed                                               | 2026-08-05 |
| —   | Roadmap: 2GN.82 done; new 2GN.97 (categorical baselines, M2, sequenced after 2GN.96)                                 | 2026-08-05 |

---

### 2.32 2GN.83 Lands Doc-Only: Its Calibration Target Was Unsound (2026-08-06)

**Origin:** roadmap 2GN.83. **Source of truth:** doc 11 §1.5 holds the raised question; this entry
records what measurement found and why the task could not proceed as an implementation.

**Recalibration needs a target, and relativisation removed the old one without supplying a new
one.** 2GN.83's line named four constants to move — `BASE_FILL_PROBABILITY`, `SLOT_DECAY`,
`MAX_SLOTS_PER_CATEGORY`, `decorationIntensity`'s blend — "per the 2GN.80 ruling", but named nothing
to move them _toward_. Before §2.9's ruling, these constants were pinned indirectly by
`EXPECTED_FIRE_RATES`: an absolute fire rate is a real, external measurement of generator behaviour.
Under a culture-relative reading, `elite` means "above the p75 of what this culture makes", so a
uniform change to decoration volume moves the sampled baseline and the measured artefacts together
and largely self-cancels — the fire-rate guard stops being an independent check on volume, the exact
property §2.31's threshold-value pins were added to compensate for on the classification side. The
only other stated design intent for decorative volume anywhere in the docs is doc 05 §8.3's
craft/emphasis four-corner table, so that became the de facto target.

**§8.3's table cannot serve as that target, measured directly.** Full working in doc 11 §1.5; the
two findings summarised here.

First, **the table's numbers have no producer.** §8.3 caps recursion depth (decoration-on-decoration
via `DecorativeLayer.sublayers`), but `expandDecoration` (`src/lib/engine/generation/decoration.ts`)
emits flat layers — every `sublayers` is `[]` — because nesting is roadmap 2GN.31, unbuilt. Read as
the nearest measurable analogue, layers per component, sampling n=400–420 per cell across all six
`MOCK_WORLD_REGIONS` (via `mockCulturalProfile` / `mockPhaseCharacteristics`) gives
`0.41 / 1.64 / 1.72 / 3.14` at the table's four named corners (craft/emphasis at `0.15`/`0.85` each)
against the stated `0–1 / 0–1 / ~1 / up to 3`: the extreme corners land, the two middle corners both
sit around 1.7 where the table wants ≤1 and ~1 respectively.

Second, **the two middle corners are not jointly reachable by any function of
`(craftSpecialisation, decorativeEmphasis)`.** A joint sweep over `CRAFT_WEIGHT` (the blend weight),
`BASE_FILL_PROBABILITY`, `SLOT_DECAY` and `MAX_SLOTS_PER_CATEGORY` — 180 combinations, scored
against the table's four targets — floors residual error at ~0.83 and never approaches zero.
Narrowing to the blend weight alone confirms why: lowering `CRAFT_WEIGHT` from 0.5 toward 0.25 pulls
the high-craft/low-emphasis corner from 1.65 down to 0.97 (near the table's ≤1), but pushes the
low-craft/high-emphasis corner from 1.65 up to 2.33 (away from the table's ~1) — the two corners
trade against each other because both read the same scalar `decorationIntensity`. Broadening past
linear blends did not help: every _symmetric_ form tested (product, geometric mean) gives the two
middle corners equal values by construction, since they sit at the same distance from the diagonal;
every _asymmetric_ emphasis-dominant form that separated them overshot the low-craft/high-emphasis
corner past 2.5 before the high-craft/low-emphasis corner reached the table's target. Best measured
single-scalar form, `sqrt(craftSpecialisation × decorativeEmphasis)` at base weight 1.0, reaches
error 1.30 against the current blend's 1.69 — a real but modest improvement, and it still collapses
the two middle corners toward each other rather than separating them.

**The binding constraint is upstream of `decoration.ts` entirely.** The high-craft/low-emphasis
corner is dominated by `partCount`: measured mean component count is ~1.97 at craft 0.15 against
~6.06 at craft 0.85 (roughly 3× at fixed low emphasis), because `craftSpecialisation` also sets the
complexity budget via `deriveComplexityBudget` (`engine/generation/grammar.ts:265`), and
`expandDecoration` (`decoration.ts:309`) loops over `artefact.components` — multiplying its
per-component fill chance against a part count the module has no way to read back and cancel. No
constant inside `decoration.ts` can compensate for a term the module never sees. §8.3's own text
confirms this is the right diagnosis rather than a measurement artefact: it distinguishes the middle
corners by **kind** — "0–1 layers but technically refined" against "1 layer, simple techniques" —
not by magnitude, and no single volume scalar can express a difference in kind.

**A concrete implementation defect fell out of the same measurement, independent of which way the
open question is ruled.** `craftSpecialisation` enters decorative volume twice: once through
`decorationIntensity`'s blend, once through `partCount`. At identical `decorationIntensity` 0.550
(`craftSpecialisation` 0.1/`decorativeEmphasis` 1.0 vs `craftSpecialisation`
1.0/`decorativeEmphasis` 0.1), mean layers per artefact measured 3.61 against 11.50 — a 3.2× gap the
blend's equal weighting asserts should not exist, with mean `partCount` 1.97 against 6.14 tracking
the same ratio. Recorded rather than fixed: the correct correction is a function of which of doc 11
§1.5's four candidates is chosen, and picking a weight now would be answering that question by
default rather than by argument.

**`appliedElementPresent` saturation, recorded and set aside rather than pursued.** Measured across
the sampled cells: 89.1% at the calibration-sweep fixture phase (craft 0.5, emphasis 0.5), rising to
95.5% at emphasis 1.0, 99.3% at the Khaltiris preset, 100% at craft = emphasis = 1.0.
`src/lib/data/classification.ts:403` already documents this as structural rather than a mistuned
threshold — with 3 BNF categories × `MAX_SLOTS_PER_CATEGORY` 2 × N components, presence saturates
for any fill probability above roughly 0.3 regardless of `decorationIntensity`'s exact value. The
fix, if one is wanted, is the per-category-per-component slot structure itself or reliance on the
count rather than the boolean (`appliedElementCount`, which R31 already reads and which does
discriminate at every measured cell) — neither is a constants recalibration, so this is recorded
here and left for whichever task owns slot structure, rather than folded into 2GN.83's scope by
default.

**Supporting evidence the split was once intended.** `decoration.ts:121` and `:190`'s JSDoc both
refer to a function named `decorationSlotBudget`, governing "how many techniques are picked" as
distinct from `AESTHETIC_EMPHASIS_GAIN` governing "which ones are favoured" — but no such function
exists; the code has `decorationIntensity`, doing both jobs as one scalar. The volume/refinement
distinction doc 11 §1.5's option 3 names appears to have been understood when the module was written
and drifted out of the implementation. Not renamed here — it would be the one code change in an
otherwise doc-only task, and which name is correct depends on the ruling.

**General lesson, recurring from §2.31.** §2.31 found that a ruling's selector and a task's
measurement surface are two different counts, and conflating them sizes a task wrong. The failure
here is adjacent: a task phrased as "recalibrate X per the ruling" presupposes a calibration target,
and the ruling itself does not automatically supply one — relativisation _removes_ the old one
(absolute fire rate) without installing a replacement. **Roadmap 2GN.84 is phrased identically**
("recalibrate `SCARCITY_WEIGHT` and material weighting per the 2GN.80 / 2GN.77 rulings") and should
be checked for the same gap before pickup, not discovered mid-implementation the way this one was.

**Consequence: no `src/` file changed.** `EXPECTED_THRESHOLDS`, `EXPECTED_FIRE_RATES`,
`EXPECTED_GATED_RATES` (`data/calibration.test.ts`), the `decorativeLayerCount` p75 pin
(`engine/statistics.regression.test.ts`) and the saturation prose (`types/artefact.ts:436-447`) are
all unchanged, because nothing they measure moved. `deno task
check` and `deno test` are unaffected
by this task by construction.

| Doc | What changed                                                                                                                 | Completed  |
| --- | ---------------------------------------------------------------------------------------------------------------------------- | ---------- |
| 12  | This entry — why 2GN.83 could not proceed, the four measured findings, the craft double-count                                | 2026-08-06 |
| 11  | New §1.5: decorative-volume open question, four candidate rulings, no recommendation between them                            | 2026-08-06 |
| —   | Roadmap: 2GN.83 done (doc-only); new 2GN.98 (rule §1.5, then recalibrate); 2GN.84 annotated with this entry's general lesson | 2026-08-06 |

---

### 2.33 Decorative Volume Ruled: Emphasis-Only Volume, Craft-and-Difficulty Grade (2026-08-06)

**Origin:** roadmap 2GN.98. **Source of truth:** doc 11 §2.10 holds the ruling; this entry records
the measurement that produced it, including the paths tried and rejected.

**The ruling, in one line:** `decorationVolume` (`expandDecoration`) reads
`aesthetics.decorativeEmphasis` alone; a new `DecorativeLayer.grade` field reads
`society.craftSpecialisation` scaled by a new authored per-technique difficulty rating. §2.32's
negative result — no single volume scalar over `(craftSpecialisation, decorativeEmphasis)` can
satisfy doc 05 §8.3's four-corner table, because its two middle corners differ by kind, not
magnitude — is resolved by no longer using a single scalar at all.

**Path 1, rejected: bias technique selection instead of adding a field.** The cheapest conceivable
fix keeps `expandDecoration`'s output shape untouched and biases `computeTechniqueWeight`'s
selection toward `TECHNIQUE_CRAFT_AXIS === null` ("simple": `polish`, `patina`, `roughening`,
`scoring`, `painting` — §8.3's own named example) at low craft. Measured directly: real and
directional, ~30% low-difficulty-technique share at low craft against ~15–19% at high craft, but
capped. The other three factors already in `computeTechniqueWeight`'s weight product (cultural
technique affinity, material access, gating technology maturity) dominate `weightedSelect`'s outcome
and cannot be out-weighted by a craft-selection bias without defeating each of their own stated
purposes. Rejected as too weak a realisation of "technically refined".

**Path 2, rejected: `grade = craftSpecialisation` alone, no per-technique term.** Cleanly orthogonal
to volume — reads craft only, where volume reads emphasis only, sharing nothing between the two
terms. Measured directly: **degenerate as a sampled feature.** Every layer on every artefact from
one culture-phase received the identical value (the phase's craft level, a constant), so within a
culture-phase cell `p50 = p75 = p90 = mean`, always. `ClassificationContext`'s baseline sampler
(`sampleBaselines`) exists to answer "how does this value distribute across a culture's own output"
— a percentile ladder over a constant answers no such question, and a rule reading it via `exceeds`
would be comparing every artefact against a threshold with no real distribution behind it. Adding
artificial per-layer jitter was considered and rejected too: it would fix the numbers but is
fabricated noise with no design basis, the kind of thing that reads as a measurement when it is
actually an authored decision dressed as one.

**What was built.** `TECHNIQUE_DIFFICULTY` (`src/lib/data/decorations.ts`) rates each of the sixteen
decorative techniques' real execution difficulty, `0`–`1`, authored and reviewed per-item against
how each craft actually works in practice — training time, error tolerance, hand-skill demand —
rather than derived from the catalogue's `substrate`/`carriesMotif`/`introducesMaterial` flags,
which correlate with difficulty but are not difficulty itself (`polish` has no motif or introduced
material yet a true mirror finish by hand takes real practice; `gilding` introduces a precious
material but is procedural once mastered, not the hardest technique in the set). Values, ascending:
`roughening` 0.10, `patina` 0.15, `polish`/`scoring`/`tassels` 0.20, `wrapping` 0.30,
`beading`/`studs` 0.35, `overlay` 0.40, `glaze` 0.45, `painting`/`wire-wrapping` 0.50, `gilding`
0.55, `relief` 0.60, `engraving` 0.65, `inlay` 0.80.
`computeLayerGrade(craftSpecialisation,
technique)` combines craft and difficulty as
`craft × (1 − 0.5×difficulty) +
0.5×difficulty×craft²` — a hard technique's realised grade degrades
faster than an easy one's as craft falls, so a low-craft culture attempting `inlay` produces
markedly worse inlay than its craft level alone would suggest, where the same culture's `roughening`
reads close to its craft level regardless. Measured within-cell spread (p90 − p50 of
`meanDecorativeGrade`) across sampled cells: `0.006`–`0.025`, small but genuine and driven by which
mix of techniques an artefact happened to roll — enough for a percentile ladder to mean something,
unlike Path 2.

**Doc 05 §8.3's table, measured against the shipped implementation.** Layers per component at the
table's four named corners: `0.41–0.46 / 0.46–0.54 / 2.7–3.3 / 2.8–3.3` against the stated
`0–1 / 0–1 / ~1 / up to 3`. All four corners now land within a defensible margin — a substantial
improvement on the pre-2GN.98 blend's `0.42 / 1.65 / 1.65 / 3.16`, where the two middle corners were
indistinguishable. `meanDecorativeGrade` separately confirms the craft axis moves in the stated
direction: mean grade rises monotonically with `craftSpecialisation` at fixed emphasis and component
count (pinned by `decoration.test.ts`'s new grade-direction test, the same isolation pattern the
pre-existing intensity-distribution test applies to volume).

**Consequence: `craftSpecialisation`'s "double-counting" (§2.32's own finding) is resolved by
re-scoping, not by patching.** Under the old blend, craft drove decorative volume twice: directly
through the blend, and indirectly through `partCount` (`deriveComplexityBudget`,
`engine/generation/grammar.ts`, unchanged by this task). Once `decorationVolume` no longer reads
craft at all, craft has exactly two decorative-adjacent effects — `partCount` (structural) and
`grade` (execution quality) — and two non-overlapping effects of one attribute is not
double-counting. The original "3.2× gap at identical intensity" measurement described a shared
scalar that no longer exists once volume and craft are decoupled; re-measuring that specific framing
under the new code is not meaningful, since there is no longer a shared `intensity` value for the
two cells to differ at.

**Consequence: `appliedElementPresent` saturation is confirmed structural, unaffected by this
task.** Measured at the fixture phase (craft 0.5, emphasis 0.5) before and after: 89.1% (§2.32) vs
86.7% (n=7200, this task) — well within measurement noise, not a directional move. Confirms §2.32's
diagnosis stands: saturation comes from `MAX_SLOTS_PER_CATEGORY`'s per-category-per-component slot
structure (doc 05 §8.2), not from how volume or refinement are weighted. `appliedElementCount`'s
discriminating ladder moved slightly (p50 2, p75 3, p90 5, max 11 — was p50 2, p75 4, p90 5, max 15)
but the count still discriminates, which is the property that matters. Left out of scope here, as it
was when first diagnosed (roadmap 2GN.79, doc 12 §2.25) and again when re-flagged (§2.32).

**A new classification rule.** `meanDecorativeGrade` is the sampled feature giving doc 05 §8.3's
"technically refined" its own signal, independent of `decorativeComplexity`'s volume — every
existing decoration-family rule reads volume; none read execution quality. The new rule
(`data/classification.ts`, appended after the technique-breadth rule to keep existing indices
stable, matching §2.31's own precedent) reads `meanDecorativeGrade` at **p90, not p75**: measured
directly, p75 fires at 26.6% — close enough to the naive "top quarter" expectation that this feature
doesn't carry the coarse tie-mass §2.31 found on integer-valued features like `attachmentDiversity`,
but still reading as "above average" rather than the "exceptional" the rule's own name and weight
split (`artisanal` 0.4, `elite` 0.2, mirroring the technique-breadth rule's split) claim. p90 fires
at 12.3%, comparable selectivity to the technique-breadth rule's own 19.3% and consistent with how
that rule and the exceptional-lavishness rule were both moved off p75 for the same tail-claim
reasoning (§2.31). Tags `artisanal` primarily rather than compounding the volume-driven `elite`
weight the `decorativeComplexity` rules already carry — the same design choice §2.31's
technique-breadth rule made, for the same reason.

**Guard re-measurement.** `decorationVolume`'s emphasis-only reading moved the entire
decoration-family distribution — every rule from the structural-complexity rule onward that reads a
decoration feature moved, while every rule reading only structural features (R1–R28, R37–R39) came
back bit-identical, the same inertness checkpoint §2.31 used to prove its own migration's scope.
`EXPECTED_THRESHOLDS`' six values moved substantially at the emphasis extremes — `layerP75`/
`complexityP95` from `5/15` to `2/6.3` at emphasis 0.1, from `14/32` to `20.2/41.7` at emphasis 1.0
— because removing craft's dilution of the emphasis signal steepened the emphasis-only curve
materially; the emphasis-0.5 cell stayed near its old figure, unsurprising since that was the old
blend's midpoint. The largest single `EXPECTED_FIRE_RATES` move: R32 (the universal any-decoration
nudge) dropped from 98.0% to 89.2% — still comfortably clear of `SATURATION_CEILING` and still
exempt from it by design (doc 12 §2.24), but the sharpest single consequence of emphasis-only volume
producing materially more near-zero-decoration artefacts at low emphasis than the old blend did.
`SPREAD_FLOOR` was checked directly against a concern raised while scoping this task — that
emphasis-only volume might be a cleaner signal and narrow per-cell spread toward the guard's floor —
and found unwarranted: measured minimum spread across the migrated nine is 12.0pp, six times the 2pp
floor, no narrowing-collapse risk.

**Test additions.** `decoration.test.ts` gains four tests: `computeLayerGrade` direction (a hard
technique at fixed low craft yields a materially lower grade than an easy one), the gap narrowing at
high craft (the formula's own claim, checked directly), bounds (`[0, 1]` at the craft extremes for
every technique), and the artefact-level monotonicity check described above. The pre-existing
textile-isolation test (asserting exact equality of non-textile category fill across two emphasis
settings) and category-coverage test (all three BNF categories reachable at intensity 1.0) both
survive unchanged — grade alters what quality value a layer records once a technique is selected,
never which technique wins a slot or how many slots fill, so neither invariant is touched.

**Consequence for `classification.test.ts`'s rule-count guards.** `CLASSIFICATION_RULES.length`
moved from 43 to 44; the relative/absolute split moved from 34/43 to 35/44 (`artisanal`/`elite` are
both `RelativeTag` members). Same guard-update pattern §2.31 established for a rule-count change:
update the pinned numbers and the array together, deliberately, not by widening a tolerance.

| Doc | What changed                                                                                                                                 | Completed  |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| 12  | This entry — the ruling, the two rejected paths, the guard-by-guard re-measurement                                                           | 2026-08-06 |
| 11  | §1.5 closed, resolved as new §2.10 (the ruling)                                                                                              | 2026-08-06 |
| 05  | §8.3 gains an implementation note; §9.1's `ExtractedFeatures` block notes `meanDecorativeGrade`                                              | 2026-08-06 |
| —   | `types/decoration.ts`: new `DecorativeLayer.grade` field                                                                                     | 2026-08-06 |
| —   | `data/decorations.ts`: new `TECHNIQUE_DIFFICULTY` table (authored, reviewed per-item)                                                        | 2026-08-06 |
| —   | `engine/generation/decoration.ts`: `decorationIntensity` → `decorationVolume` (emphasis-only); new `computeLayerGrade`                       | 2026-08-06 |
| —   | `engine/generation/classification.ts`: new `meanDecorativeGrade` feature; `types/tags.ts`/`baselines.ts` gain the `BaselineFeature`          | 2026-08-06 |
| —   | `data/classification.ts`: new execution-quality rule (R44, p90)                                                                              | 2026-08-06 |
| —   | `data/calibration.test.ts`: `EXPECTED_THRESHOLDS`/`EXPECTED_FIRE_RATES`/`EXPECTED_GATED_RATES` re-recorded; new R44 entry                    | 2026-08-06 |
| —   | `engine/statistics.regression.test.ts`: p75 pin re-measured (10 → 12) and re-framed against this task rather than 2GN.34's historical figure | 2026-08-06 |
| —   | Roadmap: 2GN.98 done                                                                                                                         | 2026-08-06 |

---

### 2.34 2GN.84 Inverts: No Calibration Target Existed, So One Was Built (2026-08-06)

**Origin:** roadmap 2GN.84. **Source of truth:** this entry; no doc 11 question was raised or
closed, since nothing here reopens a design decision — the 2GN.80/2GN.77 ruling itself (doc 11 §2.9)
was already settled and is unchanged by this task.

**The premise check §2.32 asked for came back positive, and worse than 2GN.83's.** 2GN.84's line —
"recalibrate `SCARCITY_WEIGHT` and material weighting per the 2GN.80 / 2GN.77 rulings" — presupposes
a calibration target the same way 2GN.83's did. Checked directly: doc 05 §7
(`docs/05-generation-
architecture.md:820-894`) is entirely qualitative, its strongest statement
"trade materials appear at low weight — present but uncommon" satisfied by any positive weight below
the local weight; doc 05 §10.2 explicitly disclaims a quota reading ("it's a weight, not a quota").
Unlike 2GN.83, which at least had `EXPECTED_FIRE_RATES` to re-record, nothing in the test suite
could tell a real recalibration from a typo — `materials.test.ts`'s three "distribution" tests are
bare directional inequalities (`assert(bronzeShare > ironShare)`) that pass for any
strictly-descending set of four numbers. And the ruling itself forecloses the obvious replacement
target: doc 11 §2.9 bars any classification rule from reading `precious-*` to award status, so
"recalibrate so precious materials read `elite`" was never available.

**Unlike decoration, material availability already has a live downstream observer — which is what
makes this task deliverable rather than doc-only.** `isAvailable` feeds `materialAccessGate`
(`engine/generation/decoration.ts`), which sits inside the measured pipeline via `expandDecoration`.
Measured across the six `MOCK_WORLD_REGIONS` (n=500 artefacts/region, before any fix in this task):
material-substrate technique share ran 36.0–37.6% in five regions against 7.7% in `forestInterior`
(no trade flows, so every metal unreachable), with gilding correctly suppressed 7.1% → 2.1%. Geology
demonstrably reaches decoration output.

**A real bug fell out of that same measurement.** `forestInterior`'s `wire-wrapping` share rose to
26.3% (against 5.8–6.1% everywhere else) — a metal-free region producing the _most_ metal wirework
of any region. `wire-wrapping` genuinely introduces metal (`INTRODUCED_MATERIAL_TAGS` in
`decoration.ts` gives it `['metal', 'precious-metal']`), but its _substrate_ is
`{ kind: 'form', requires: 'grippable' }` — describing the grippable thing being wrapped, not the
wire — so `materialAccessGate`'s pre-existing check (`substrate.kind === 'material'`) never
consulted the introduced-material requirement at all. The probability mass freed by correctly
suppressing the eight genuinely material-gated techniques redistributed onto the five
introduced-material techniques with non-material substrates (`wire-wrapping`, `inlay`, `overlay`,
`studs`, `beading`), and wire-wrapping absorbed the largest share. Fixed by extending
`materialAccessGate` to also check `INTRODUCED_MATERIAL_TAGS` via `isAvailable` (availability only,
not affinity — a culture that can obtain metal can use metal wire whether or not it particularly
favours metal; affinity still shapes which specific metal wins, downstream, in
`assignDecorativeDetails`). Re-measured post-fix: `forestInterior` wire-wrapping fell to 6.8%, in
line with every other region (5.1–6.0%); gilding's correct suppression (6.7% → 1.3% at the fixed
constants) is unaffected. `assignDecorativeDetails` itself — the stage that would pick which metal —
was considered as the fix site and rejected: it has no production caller (verified: only its own
tests reach it), and wiring it in would wake `preciousMaterialsInDecoration`, whose rule doc 11 §2.9
forbids from reading `precious-*` to award status. That wiring is 2GN.68's, and is blocked for
exactly this reason.

**A full 16-entry catalogue audit surfaced one tag miss and one inert-material defect, both
corrected here.** `jade` carried only `['precious-stone']`, unlike gold/silver's
`['metal', 'precious-metal']` — invisible to any plain `stone` affinity or
`allowedMaterialTags: ['stone']` constraint, and inconsistent with the taxonomy the new calibration
guard's tree structure rests on. Corrected to `['stone', 'precious-stone']`. Separately, `glass` was
the only material with all three `decorability` flags false — selectable but never decorable.
Corrected to `engravable: true, paintable: true` (grounded in attested practice: wheel-cut and
diamond-point glass engraving from Roman cage cups onward; cold-painting and enamelling from Islamic
enamelled glass through later Bohemian work), `glazeable` staying `false` since glaze is a ceramic
process per its own JSDoc. Both fixes changed a pre-existing test's premise: `materials.test.ts`
asserted `engravable` implies `workable`, true for every material until glass, and now corrected to
a counter-example test matching the pattern already established for gold's independent
hardness/workability axes.

**A second, adjacent defect found and deliberately left unfixed here.** `scarcityWeight`
(`engine/generation/materials.ts`) returned `1` (neutral) for a material with no geology entry —
strictly above an explicitly `available` material (`0.6`) and 4× an explicitly `scarce` one, so a
fixture gap silently promoted an unmodelled material above every honestly-modelled peer. The same
class of defect §2.25 caught with silver/jade before the six exhaustive `MOCK_WORLD_REGIONS` existed
to close it. Corrected to return the `available` rung instead: an unmodelled material is one nobody
made a claim about, and the honest default is "unremarkable", not "the most plentiful thing here".
`isAvailable`'s own unmodelled-lenience (`return true`) is untouched and correct — only the _weight_
an unmodelled material received was wrong, not whether it should be excluded.

**`SCARCITY_WEIGHT`'s four values are unchanged.** This is the inversion the roadmap line's title
promised and this task does not deliver: there is still no numeric target to recalibrate the four
multipliers against, only a now-installed guard that pins their _ratio_
(`data/
materials.calibration.test.ts`, new) so a future change is measurable. The values are pinned
as the measured baseline, the same move §2.31 made for classification thresholds and §2.33 made for
decoration's fill constants — create the target, don't recalibrate against an absent one.

**The new guard's pin structure is a two-level tree, not a flat table**, derived from
`MaterialDefinition.tags` at test time rather than hand-written: a per-region tag-level share (e.g.
`metal`: 22%) plus, only for tags with two or more leaf materials (`metal`, `stone`, `wood`,
`bone`), a conditional intra-tag split (of that metal: bronze/iron/gold/silver). This is what lets
the guard distinguish "this culture makes less metal overall" from "this culture makes the same
metal but none of it is tin" — both look identical to a flat per-material pin until the intra-tag
level separates them. Six single-leaf tags (clay, glass, fiber, leather) emit no split, since it
would always read 100%. A third pin — provenance mix (`local`/`trade` share via
`deriveMaterialProvenance`) — is the one most directly sensitive to `SCARCITY_WEIGHT`'s `trade-only`
rung specifically, since a tag can be satisfied by either a local or a traded member without the
tag-level share moving at all. A fourth guard checks cross-region spread stays above a floor,
catching the failure a flat directional test cannot: weighting collapsing toward uniform selection
while every existing `a > b` assertion in `materials.test.ts` still passes. Deriving the tree from
the catalogue rather than hand-writing it means a 17th material automatically gets a row, with a
coverage test failing loudly if it doesn't.

**Sequencing note, for honesty about what "inertness-checked" means here.** §2.31 and §2.33 both
proved their guard's sweep sound by recording pins against unchanged code first, then re-recording
after the fix. This task's pins were instead measured directly against the already-corrected
pipeline (jade/glass fixed, gate hole closed) — the `forestInterior` wire-wrapping numbers above
serve the equivalent role, recorded both before (26.3%) and after (6.8%) the gate fix specifically,
but the calibration guard itself was authored once, post-fix, rather than twice. The full test suite
(527 tests) passes at every stage checked; `calibration.test.ts`'s own fire-rate pins did not need
re-recording — the changes here are small enough (five techniques' selection weight; which specific
material wins, not layer counts or complexity) that they land within its existing `TOLERANCE_POINTS`
(6pp).

**Split to successor tasks**, all recorded rather than pursued here:

- **`culturalAffinityWeight`'s max-across-tags semantics, folded into 2GN.78.** Measured: the
  Khaltiris preset (`data/explorer-cultures.ts`) authors `metal: 1.7, precious-metal: 1.4` for
  gold/silver, which carry both tags; `culturalAffinityWeight` takes the max across a material's
  tags, so the authored `1.4` is silently dead code for that culture. The rule is one-directional by
  construction — a culture can never express "we value gold less than plain bronze" via this map.
  Fixing it means choosing between max / most-specific-wins / product-of-deviations, a semantics
  ruling that overlaps 2GN.78's existing scope (`precious-*` semantics under the 2GN.77 ruling)
  directly; deciding it here would be answering by default, the exact failure this entry's own
  opening paragraph is checking for.
- **New: material-dependent technique difficulty.** 2GN.98's `computeLayerGrade` reads technique
  alone, so engraving granite scores identically to engraving gold. A real gap, surfaced while
  reviewing the glass decorability fix, but out of this task's scope — it extends `decoration.ts`'s
  grade formula, not material weighting, and needs its own authored data (a 16×16 matrix, a
  per-material hardness modifier, or a per-tag one) with the same per-item review
  `TECHNIQUE_DIFFICULTY` got at 2GN.98.
- **New: leatherworking and other craft domains.** `leather` shares `craftDomain: 'textiles'` with
  `linen`, conflating hide-working with weaving; there is no `leatherWorking` domain. Out of scope —
  it is a `craftDomain` union change plus a new `PhaseCharacteristics.technology` field, touching
  world generation beyond material weighting.
- **Note against 2GN.68** — `assignDecorativeDetails` needs a production caller before 2GN.68 can do
  anything; it currently has none.

| Doc | What changed                                                                                                                                           | Completed  |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------- |
| 12  | This entry — the premise check, the wire-wrapping bug, the catalogue audit, the guard design                                                           | 2026-08-06 |
| —   | `data/materials.ts`: jade tags corrected to `['stone', 'precious-stone']`; glass decorability corrected to engravable/paintable                        | 2026-08-06 |
| —   | `engine/generation/decoration.ts`: `materialAccessGate` extended to also check `INTRODUCED_MATERIAL_TAGS`                                              | 2026-08-06 |
| —   | `engine/generation/materials.ts`: `scarcityWeight`'s unmodelled-material lenience corrected to the `available` rung; `SCARCITY_WEIGHT` JSDoc rewritten | 2026-08-06 |
| —   | `data/materials.calibration.test.ts`: new — hierarchical tag-share, intra-tag-split, provenance-mix and cross-region-spread guards                     | 2026-08-06 |
| —   | `data/materials.test.ts`, `engine/generation/materials.test.ts`: tests corrected for the defects fixed above                                           | 2026-08-06 |
| —   | Roadmap: 2GN.84 done; successor tasks recorded against 2GN.78/2GN.68 and a new material-dependent-difficulty task                                      | 2026-08-06 |

---

### 2.35 The Material Property Model Rebuilt; Grade Reads Material (2026-08-07)

**Origin:** roadmap 2GN.99 and 2GN.100, which together forced a new prerequisite task, **2GN.101**.
**Source of truth:** this entry.

**2GN.99 could not be done against the property model it inherited.** Its brief — make
`computeLayerGrade` read technique difficulty per-material rather than per-technique — assumed
`MaterialDefinition.physicalProperties` could say something useful about how hard a material is to
work. Reviewing it for that purpose found it could not, on two independent counts.

`workable: boolean` was conflating three distinct facts: **brittleness** (obsidian, flint and glass
shatter under a slip), **pliability** (linen and leather deform rather than cut), and **grain
coarseness** (granite cannot hold a fine line however carefully it is worked). Those three have
different consequences and different remedies, and a single boolean could express none of them
separately. And `hardness: 'soft' | 'medium' | 'hard'` was not merely coarse — it was being actively
_misused_: `relief`'s and `overlay`'s substrate tests both carried comments conceding that hardness
was "standing in as the nearest proxy" for a fracture-resistance property the type did not have. The
workaround was documented in place and had been for two tasks.

**Six axes replace the pair, plus a keyed chemistry object.** `hardness` (1–10, pegged to the real
Mohs scale so values stay independently checkable), `fragility`, `rigidity`, `grainFineness`,
`porosity`, `combustibility` (all authored 1–7), and `reactivity: { oxidisation }`. All sixteen
materials were scored against every axis, item-by-item, each value argued from real materials
practice rather than derived from the others.

**Axis independence was tested, not assumed.** Two pairs settle it. Obsidian and granite share
hardness and rigidity, and granite is the _less_ fragile of the two — yet obsidian takes an edge
finer than steel while granite's coarse crystalline grain caps precision regardless of care; only
`grainFineness` explains that. Gold and oak sit close on hardness, fragility and rigidity, yet gold
engraves far more precisely. Both pairs are pinned as tests.

**Two axes were discovered mid-review rather than designed up front, each by a technique that had
nothing to key on.** `patina` is an oxidation process and every axis to that point was mechanical or
structural, which is why its substrate was `{kind: 'none'}` and the live generator was applying
patina to stone and glass artefacts. `reactivity` was keyed by reaction type rather than made a bare
scalar so future chemistry (acidity, photoreactivity) is additive. Separately, `painting` and
`glaze` both turned out to want **absorbency**, which became `porosity`. A third, `combustibility`,
followed from `glaze` being a _firing_ process: a material that would burn cannot be glazed at all.

**`oxidisation` carries a `-1` not-applicable sentinel, and the distinction is load-bearing.** Glass
and stone have no oxidation chemistry whatsoever; gold has it and is simply famously resistant. The
first is `-1` and feeds a **substrate gate**; the second is `0` and feeds a difficulty weight.
Gating rather than penalising keeps "impossible" and "merely hard" as different kinds of fact,
matching the separation `materialAccessGate` and `computeLayerGrade` already maintain. Pinned by two
tests.

**Four substrate corrections fell out of the model, each a real behaviour change.** `patina` gains
the oxidation gate described above. `glaze` gains a combustibility ceiling (not live-broken today,
since only `fired-clay` passes `glazeable`, but the hole was real). `relief` and `overlay` retire
the self-admitted hardness proxy for the properties they were reaching for — and `relief` needed
_both_ `rigidity` and `fragility`, since checking fragility alone admitted linen and leather, which
plainly cannot hold a raised form. **`gilding`'s gate was factually wrong**: it required
`tags.includes('metal')`, but real gilding is overwhelmingly applied to non-metal grounds — gilded
wood and gesso dominate the record, with gilded leather bindings and gilded ceramic well attested.
It now gates on rigidity, excluding only linen. Doc 05 §8.2 carried the same error in prose ("you
don't gild wood") and has been corrected.

**`studs` changed verdict on gold, deliberately.** The old `hardness !== 'soft'` proxy rejected it;
gold is structurally soft but perfectly rigid, and real goldwork takes rivets and applied studs. The
corrected reading accepts it. Its named leather exception stays: leather is the one genuinely
pliable material that does take studs, so it is a real exception rather than a gap.

**2GN.99 ships as an unwired post-pass, and that is the honest scope.** `computeLayerGrade` is
called inside `expandDecoration`'s slot loop, where no component has an assigned material —
assignments live in a parallel `MaterialAssignment[]` from `assignMaterials`, which no production
caller runs first. Threading them in would force all six call sites to reorder, and
`assignMaterials` consumes PRNG draws, so it would perturb the decoration draw sequence and move
every recorded fire rate for reasons unrelated to grade. `gradeDecorativeLayers` instead re-grades
layers as a separate PRNG-free pass, mirroring `assignDecorativeDetails`' existing position.
`expandDecoration` is untouched; the grade it emits is now documented as _provisional_. **Nothing in
the sampled path changed at ship time, so no calibration pin moved then** — the full suite passing
unchanged was this task's inertness checkpoint, and a stronger one than 2GN.82/2GN.98's partial
checks.

That held only until a later PR #53 review round found two samplers still measuring
`expandDecoration`'s provisional grade against `sampleBaselines`' material-aware baseline:
`calibration.test.ts`'s `measureFireRates` and the Explorer's `ruleCalibration.ts`. Wiring both
through `assignMaterials` → `gradeDecorativeLayers` moved R44's pooled fire rate 4.0% → 10.4%
(roadmap 2GN.103). A further round found the Tag Inspector and `sample-classification.ts` had the
identical gap and fixed them the same way, and found and fixed a follow-on defect in the grading
formula itself: the `oxidisation: -1` not-applicable sentinel reached `effectiveDifficulty`'s
weighting unguarded, inverting the gate/difficulty distinction it exists to express (see 2GN.99's
own roadmap notes, and 2GN.30's for the general class of defect that investigation surfaced but
deliberately left unfixed here).

**The sensitivity weights were scaled ×2.5 after measurement, and the measurement is why.** At the
originally-authored `±0.15` band, engraving spanned only ~0.044 of realised grade across all sixteen
materials, against ~0.3 between the easiest and hardest technique — material choice was a rounding
error beside technique choice, with partially-cancelling weights (granite drawing `+0.10` for coarse
grain but `−0.05` for low fragility) collapsing most of the signal. A modifier that weak would also
have left `meanDecorativeGrade` too little within-cell spread to sample a percentile ladder from,
which is precisely the degeneracy 2GN.98 rejected the craft-only grade for. Scaling preserved every
relative judgement; only magnitude moved. Post-scaling spread runs 0.10 for `overlay`/`inlay` down
to 0.02 for `scoring`, and `tassels` at exactly zero by design.

**Scaling exposed a clamping artefact, fixed with a difficulty floor.** 22 of the 256 technique ×
material pairs pushed difficulty below zero, and clamping those to `0` claimed the work was
_perfectly_ easy — that a novice and a master produce identical results — which no real craft
supports. It also tied seven techniques artificially at the same ceiling.
`MINIMUM_DIFFICULTY = 0.05` keeps craft load-bearing everywhere; no technique now pins at the
ceiling. Pinned by a test.

**2GN.100 (`leatherWorking`) is confirmed live and free of calibration consequence.** `leather`
moves off `textiles`, which it had been sharing with `linen`, conflating tanning with weaving. The
four explorer presets get independently argued values (Tarpan 0.75, Khaltiris 0.60, Thalassar 0.45,
Xoconahtl 0.30), each anchored to that culture's own geology and prose rather than cloned from its
`textiles` — cloning would have made the axis a no-op alias and shipped nothing. Measured effect:
Tarpan's pastoralist hide economy now weights leather at 6.4× its linen, while Xoconahtl's humid
jungle inverts that in linen's favour; under the shared axis the two moved in lockstep. The test
fixture takes `0.5`, which its own "every attribute neutral" contract demands and which is why **all
six `materials.calibration.test.ts` leather pins hold unchanged** — the guard runs on
`mockPhaseCharacteristics()` with no overrides, so `phaseTechnologyWeight('leather')` is identical.

**`TECHNIQUE_CRAFT_AXIS` is deliberately unchanged, so no technique gates on `leatherWorking` on day
one.** `studs` stays on `metallurgy` (the substrate is what you attach _to_; the stud is metal and
the skill is fastening). `wrapping` is the genuinely mixed case — it introduces
`['fiber', 'leather']` — but pointing it at either pure axis is wrong half the time, and re-pointing
it would silently gut two existing tests that drive `technology.textiles` to 0 and 1. The correct
fix is material-aware axis resolution, which shares 2GN.99's blocker. The new axis earns its keep
through `phaseTechnologyWeight` instead, which is where the conflation actually bit.

**Deferred, each recorded rather than quietly dropped:**

1. **Booleans versus axes.** `decorability.engravable`/`paintable`/`glazeable` now duplicate what
   the new axes could derive (engravable ≈ a `grainFineness`/`fragility` threshold; paintable ≈
   `porosity`). Two sources of truth for related facts. Rewriting the eleven `substrate.test`
   functions is its own redesign, and folding it in here would have expanded an already-large task a
   third time.
2. **Relational two-material difficulty.** Several techniques' real difficulty is a _relationship_
   between the introduced material and the substrate — a heavy stone stud in soft wood is a genuine
   structural risk — which a single-material model cannot express. This is why `wire-wrapping`,
   `wrapping` and `beading` score near-inert: their difficulty is driven by the wire, cord or beads,
   and the model reads the substrate.
3. **`tassels` has no introduced material.** `introducesMaterial: false`, though a real tassel is
   unambiguously cord. A catalogue gap distinct from (2): it needs a cord-class material added and
   the flag flipped.
4. **Real-unit scales.** `hardness` is pegged to Mohs; the other five are authored 1–7. Whether each
   should become a real measured unit is worth revisiting — `combustibility` is the clearest case,
   since raw ignition temperature exists and is checkable, and it is currently a documented
   coarsened proxy (bone and antler pyrolyse rather than ignite, so their placement approximates a
   different phenomenon).
5. **Pipeline wiring.** `gradeDecorativeLayers` joins `assignDecorativeDetails` as a second unwired
   pass. ⚠️ **Forward hazard:** the moment grading enters the sampled path, `meanDecorativeGrade`
   becomes geology-sensitive, and `EXPECTED_THRESHOLDS`' pooling across the six regional worlds —
   justified today because decoration reads emphasis rather than geology — becomes a claim nobody
   has measured. It needs a per-region pin or an explicit ruling. **Discharged 2026-08-07, §2.36:**
   grading entered the sampled path (a separate fix, `sampleBaselines`), and the per-region pin this
   item asked for is now in place (`EXPECTED_MEAN_GRADE_BY_REGION`, `data/calibration.test.ts`).
6. **2GN.10 remains a blocker for the fuller version.** With `allowedMaterialTags` stubbed `[]`,
   `assignMaterial` treats every material as a candidate for every component, so a wooden haft can
   be assigned gold. Material-aware grade will be technically correct and archaeologically nonsense
   until candidates are constrained.

| Doc | What changed                                                                                                                       | Completed  |
| --- | ---------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| 12  | This entry — the model, the axis-independence tests, the four substrate corrections, the scaling measurement, six deferred items   | 2026-08-07 |
| 05  | §3.2's duplicated interface gains `leatherWorking`; §8.2's "you don't gild wood" corrected and an implementation note added        | 2026-08-07 |
| —   | `types/artefact.ts`: `physicalProperties` rebuilt as six axes; new `reactivity` keyed object                                       | 2026-08-07 |
| —   | `data/materials.ts`: all 16 materials scored across every axis; `leather` → `craftDomain: 'leatherWorking'`                        | 2026-08-07 |
| —   | `data/decorations.ts`: new `TECHNIQUE_MATERIAL_SENSITIVITY`; `patina`/`glaze`/`gilding`/`relief`/`overlay`/`studs` substrate fixes | 2026-08-07 |
| —   | `engine/generation/decoration.ts`: material-aware `computeLayerGrade`; new `gradeDecorativeLayers`; `MINIMUM_DIFFICULTY` floor     | 2026-08-07 |
| —   | `types/world.ts`: `technology.leatherWorking`; four explorer presets and the test fixture scored                                   | 2026-08-07 |
| —   | Tests: axis-range and independence guards, grade/floor/post-pass coverage, corrected substrate expectations                        | 2026-08-07 |
| —   | Roadmap: 2GN.101 added and done; 2GN.99 and 2GN.100 done; six successors recorded                                                  | 2026-08-07 |

---

### 2.36 Calibration Samplers Reconciled with Material-Aware Grading; §2.35's Forward Hazard Discharged (2026-08-07)

**Origin:** Roadmap 2GN.103, surfaced during PR #53 review.

**Source of truth:** this entry.

**A fix to `sampleBaselines` moved half of a comparison and left the other half stale.** A prior fix
(`engine/generation/baselines.ts`) found that `sampleBaselines` fed `expandDecoration`'s output
straight to `extractFeatures`, skipping `assignMaterials` and `gradeDecorativeLayers` — so R44's
`meanDecorativeGrade` baseline was sampled from `expandDecoration`'s _provisional_ technique-only
grade rather than the material-aware one real artefacts are classified against. The fix threaded
both stages in and re-pinned R44's `EXPECTED_FIRE_RATES` entry from 12.3% to 4.0%.

That left the comparison worse than before, not fixed. Two other places call `extractFeatures` on
generated layers — `calibration.test.ts`'s `measureFireRates` (the function that sets
`EXPECTED_FIRE_RATES`, including the R44 entry the baseline fix itself just moved) and the
Explorer's `ruleCalibration.ts`'s `calibrateRules` — and both still fed `expandDecoration`'s
ungraded output straight to `extractFeatures`. So the 4.0% pin was measuring a material-aware
baseline against ungraded artefacts: the exact mismatch the baseline fix was meant to close, now on
the other side of the comparison, with the new number carrying no more meaning than the one it
replaced.

**Both sites now mirror `sampleBaselines`' ordering.** `assignMaterials` runs with its own
`${seed}-materials` PRNG stream (a fresh `createPrng` call, never the decoration one), then
`gradeDecorativeLayers` re-grades the layers, before `extractFeatures` runs. Because
`gradeDecorativeLayers` is PRNG-free and `assignMaterials` draws from an independent stream, this
cannot perturb the decoration draw sequence or any non-grade feature — the same guarantee that let
the baseline fix land without moving anything but R44. This also resolves 2GN.99's original
objection to wiring grading into the sampled path, which was against threading material assignment
_into_ `expandDecoration` (perturbing its own draws); running it as a separately-seeded sibling pass
sidesteps that.

**Verified, not assumed: measured every rule before and after.** R1–R39 and R42 came back
bit-identical. R44 moved from 4.0% to 10.4%, landing at its p90 rung as expected once both sides of
the comparison read the same scale. R40, R41 and R43 (`decorativeComplexity`/`techniqueComplexity`,
both structural features that never read `grade`) showed a small 0.2pp drift each — traced to two
substrate-gate fixes (relief/gilding, PR #53's own review fixes) that landed between R44's last full
recording and this task and were never re-measured against the full array. Within
`TOLERANCE_POINTS`, so the suite passes; left unpinned at its current figure and flagged here rather
than silently re-recorded, since re-pinning a value this task didn't cause would misattribute the
move.

**§2.35's forward hazard is discharged, measured rather than assumed away.** That entry warned that
the moment grading entered the sampled path, `meanDecorativeGrade` would become geology-sensitive,
and `EXPECTED_THRESHOLDS`' pooling across the six regional worlds — justified because
`decorativeLayerCount`/`decorativeComplexity` read `decorativeEmphasis`, not geology — would become
an unmeasured claim for this feature too. Measuring directly confirmed the hazard was real: R44's
fire rate spans 8.0% (`riverValley`) to 13.7% (`forestInterior`), a genuine 5.7pp range around the
pooled 10.4% figure, not sampling noise. `EXPECTED_MEAN_GRADE_BY_REGION` pins each region's rate
individually rather than folding `meanDecorativeGrade` into `EXPECTED_THRESHOLDS`' pooled structure,
with a dedicated test (`calibration.test.ts`) asserting each region against its own recorded figure.
What specifically drives any one region's rate (its material catalogue,
`assignMaterialWithProvenance`'s scarcity weighting, `TECHNIQUE_MATERIAL_SENSITIVITY`'s per-axis
pulls) is not traced here — the pin asserts the spread is real and repeatable, which is what the
hazard asked for.

`deno task check` 552 files, 0 errors. `deno task test` 548/548 passing.

| Doc | What changed                                                                                                                                              | Completed  |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| 12  | This entry; §2.35's forward-hazard item marked discharged                                                                                                 | 2026-08-07 |
| —   | `data/calibration.test.ts`: `measureFireRates` grades through the material pass; R44 re-pinned 4.0→10.4; new `EXPECTED_MEAN_GRADE_BY_REGION` pin and test | 2026-08-07 |
| —   | `routes/dev/explorer/calibration/ruleCalibration.ts`: `calibrateRules` grades through the material pass, matching the test harness                        | 2026-08-07 |
| —   | Roadmap: 2GN.103 added and done                                                                                                                           | 2026-08-07 |

---

### 2.37 2GN.78 Lands Doc-Only: Code Already Complied, One Instruction Was a Phantom (2026-08-10)

> ⚠️ **Superseded by §2.40 (2026-08-11).** This entry's finding — that no consumer read the
> `precious-*` tags to award an `ArtefactTag`, so the code already complied — was correct but drew
> too small a boundary. §2.40 retired both members outright: the defect was not who read the tags
> but that a vocabulary of material _classes_ carried two members asserting social _valuation_. Read
> this entry as the first pass, not the resolution.

**Origin:** Roadmap 2GN.78, gated on 2GN.77.

**Source of truth:** doc 11 §2.9 lines 402-406 hold the ruling this task propagates; this entry
records what checking the code against it found.

**No code changed the classification boundary.** 2GN.78's brief asked whether `MaterialTag`'s
`precious-metal`/`precious-stone` members still fed classification after the 2GN.77/2GN.80 ruling.
Checking every consumer found none do: `INTRODUCED_MATERIAL_TAGS`
(`engine/generation/decoration.ts`) and `materialAffinities` (via `computeMaterialWeight`,
`engine/generation/materials.ts`, and `grammar.ts`'s weighting) both read the tags for
generation-time material selection — gating and cultural-affinity weighting — never to award an
`ArtefactTag`. The one classification rule touching precious materials (`data/classification.ts`'s
dormant `preciousMaterialsInDecoration` rule) already reads a derived boolean, not `MaterialTag`
directly. All compliant before this task started. The actual deliverable was propagating doc 11
§2.9's constraint to the type it governs: `MaterialTag`'s JSDoc now states it in place, with a note
on the naming hazard below so it isn't rediscovered as a bug.

**§2.28's line 1038 was a phantom instruction, not a missed one.** It asked to re-key "doc 12
§2.22's tag sets" to the `AbsoluteTag`/`RelativeTag` vocabulary. §2.22's tag sets (lines 484-493:
`gilding` → precious-metal, `inlay` → everything except fiber/leather/clay, etc.) are `MaterialTag`
values feeding `INTRODUCED_MATERIAL_TAGS` — which materials a decorative technique may introduce —
never the retired `FunctionTag`/`ContextTag` pair `ArtefactTag` replaced. Whoever wrote line 1038
was sweeping post-ruling for anything still expressed in the old vocabulary, saw "tag sets" inside a
section titled partly "Introduced-Material Resolution", and booked it against the wrong noun.
`MaterialTag` and `ArtefactTag` are unrelated vocabularies that both happen to be called "tags" —
worth naming plainly since it is exactly the kind of mistake this register exists to catch, not
commit. No re-key was performed because there was nothing to re-key; §2.28's row is closed on that
basis rather than by producing the work it asked for.

**Branch used to reconcile drift the investigation surfaced along the way.** With 2GN.78 itself
docs-only, the same branch closed out §2.28/§2.30's other stale rows (§1 above, and the
split/annotated rows in §2.28's own table), corrected README and doc 08/05/06 drift that carried no
owning task, and left everything with an owning task (2GN.92, `/roadmap-maintain`'s vocabulary
sweep, 2GN.96, 3WS.9) alone.

| Doc | What changed                                                                                                                                                                                               | Completed  |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| 12  | This entry; §1 rewritten from a false "no pending items" claim to the two genuinely-open items; §2.28's line 1036 split, 1037 and 1038 closed/annotated; missing `---` separators added before §2.34/§2.35 | 2026-08-10 |
| —   | `types/tags.ts`: `MaterialTag` JSDoc records the descriptor-not-classification-input constraint and the naming hazard                                                                                      | 2026-08-10 |
| —   | `README.md`: refreshed against current `src/`, `deno.json` and `.claude/roadmaps.json` state (see that file's own history for detail)                                                                      | 2026-08-10 |
| 08  | `types/` tree: phantom `excavation.ts` entry removed, five shipped modules added; §1.3's `npm:svelte-kit sync` corrected                                                                                   | 2026-08-10 |
| 05  | §9.2: `ClassificationRule` interface declared (was used, never defined); `ClassificationContext` noted                                                                                                     | 2026-08-10 |
| 06  | §2.28's disclosed `FunctionTag`/`ContextTag` substitution executed; banner demoted to a historical marker                                                                                                  | 2026-08-10 |
| —   | Roadmap: 2GN.78 done, doc-only                                                                                                                                                                             | 2026-08-10 |

---

### 2.38 Formability Axis Added; Working-State Inconsistency Named, Not Fixed (2026-08-11)

**Origin:** Roadmap 2GN.102, filed during 2026-08-07 PR #53 review as a 2GN.101 follow-on:
`relief`'s substrate gate could not distinguish obsidian/flint (worked only by conchoidal fracture,
never formable) from fired-clay/glass (fragile once finished, but modelled or blown before that
point), so it gated on `rigidity` alone and let obsidian and flint pass incorrectly — a known
limitation documented in `data/decorations.ts` and `data/decorations.test.ts` pointing straight at
this task.

**Source of truth:** this entry, for the axis and its scale; `types/artefact.ts`'s
`physicalProperties.formability` JSDoc for the authored rung table and full reasoning.

**Correction to §2.35's record.** That entry states `relief` was corrected to check "_both_
`rigidity` and `fragility`". The shipped gate is rigidity-only — a later PR #53 review round removed
the fragility clause as getting fired-clay and glass wrong to get obsidian and flint right, which is
exactly what filed 2GN.102. §2.35 was never amended for the removal; this entry is that correction
on the record.

**A seventh axis, `formability` (`1`–`6`), gates `relief`.** It measures how controllably a material
can be given a raised form, read at the point in its working sequence where a craftsperson would
shape it: `6` true plastic/viscous state (fired clay wet, glass hot) · `5` genuine plastic working
regime by melt or hot forging (bronze, gold, silver, iron) · `4` no plastic regime but controlled
incremental removal — carving, abrasion, pecking (granite, jade, oak, ash, antler) · `3` controlled
removal or moulding, capped by splintering or limited plasticity (bone, leather) · `2` unoccupied in
the MVP catalogue · `1` removal cannot be steered, or no shaping regime exists at all (obsidian,
flint, linen). `relief.substrate.test` is now `formability >= 3`, a single clause with no `rigidity`
fallback. Independence tested against two pairs: obsidian and granite share `rigidity` and obsidian
is more fragile yet finer-grained, so neither predicts the formability split; fired clay and
obsidian share `fragility` and `rigidity` exactly, yet sit at opposite ends of this axis — the pair
that motivated the task.

**Leather's exclusion had no material-science basis and is corrected, not preserved.** The prior
`rigidity >= 3` gate excluded leather as collateral aimed at linen. Tooled/stamped cured leather and
wet-moulded _cuir bouilli_ both hold a raised form; `studs`, `gilding` and `overlay` already carry a
named leather exception for the identical underlying fact. `relief` was the one outlier asserting
`'pliable ground cannot hold a raised form'` of the same material `gilding`'s test asserts the
opposite about. `formability` admits leather (rung `3`) without a named-exception clause — it
excludes `linen` (rung `1`, no shaping regime) on its own terms, so the gate is one honest fact
rather than a rule plus a carve-out.

**The axis only means anything relative to a working state, and that forced a finding beyond its own
scope: the six axes 2GN.101 authored are silently finished-state measurements, and nothing said so
before this entry.** Cold glass (`fragility: 7`) is the most fracture-prone material in the
catalogue; hot glass, which `formability` reads, is viscous and freely formable — same material,
opposite regime. Iron's `hardness`/`rigidity` describe cold-worked iron, not the material as forged
hot, which is the state that actually matters for `formability`. Fired clay's `fragility: 6` reads
the fired result; the working state is wet clay. Only `fired-clay`'s data-file comment ever named
this choice, as a one-off aside on a single material rather than a stated convention. **2GN.102 does
not reconcile the six — that is a states-of-matter model for sixteen materials and its own piece of
work — it adopts the working-state reading explicitly for the new axis, states the inconsistency
where it was previously silent (`types/artefact.ts`'s `physicalProperties` preamble and
`data/materials.ts`'s header), and files the reconciliation downstream** rather than leaving it
buried one layer deeper.

**Two scale decisions, both measured rather than authored by feel:**

- **`formability` runs `1`–`6`, not its siblings' `1`–`7`.** An earlier draft split rung 5 into cast
  metals (`6`) and hot-forged iron (`5`), reasoning that period furnaces could not liquefy iron.
  That measured the wrong fact: casting and forging are different _routes_ to a formed object, not
  different amounts of formability, and ranking iron below the cast metals encoded _difficulty_,
  which this axis is explicitly not for. The rungs were collapsed to one plastic-working-regime rung
  covering both, dropping the scale to six honest rungs rather than padding to seven to match its
  siblings. Measured against the 16-material catalogue: 5 of 6 rungs used, rung 2 empty, largest
  cluster 5 materials at rung 4 — inside the band the existing axes already occupy (`rigidity` uses
  5 of 7 with three empty rungs). The rung-4 cluster (granite, jade, oak, ash, antler) is not a
  range shortage: those materials genuinely share one working regime, and splitting them would mean
  re-expressing `hardness` or `grainFineness` as formability rungs instead, breaking the axis
  independence 2GN.101 exists to protect.
- **No `-1` not-applicable sentinel, unlike `oxidisation`.** That sentinel is warranted only where
  the fact is categorically absent — glass has no oxidation chemistry to measure, which is why gold
  (chemistry present, merely resistant) is `0` rather than `-1`. Every material has a real
  formability answer, including linen's genuine `1`; a sentinel here would misuse the mechanism to
  encode a taxonomy (linen's "no regime" versus obsidian's "unsteerable regime") inside a magnitude
  field — the same category error the casting/forging split was making. `decoration.ts`'s standing
  ruling against new sentinels on continuous axes (`combustibility`, `rigidity`) and `porosity`'s
  own rejection both apply here for the same reason.

**Deferred, each recorded rather than quietly dropped:**

1. **The casting/forging conflation at rung 5 is accepted for now, not resolved.** It is inert today
   — `relief`'s gate is a `>= 3` threshold, so rungs 3–6 pass identically — but stops being inert
   the moment a consumer reads the rungs as a difficulty gradient. **Reopens with the
   difficulty-weighting follow-on below**, which must revisit rung 5 before authoring any
   per-technique weight against it.
2. **The six pre-existing axes' finished-state authoring is unreconciled.** Filed as a follow-on
   task below: per-state property values (at minimum worked vs finished), re-auditing `hardness`,
   `fragility`, `rigidity`, `grainFineness`, `porosity`, `combustibility` against the convention
   this entry states for the first time. `glass`, `iron`, `fired-clay` and `leather` are the
   known-affected entries.
3. **Formability as a difficulty input is a separate task, not this one.** `formability` stays out
   of `MaterialDifficultyAxis` — a pure substrate gate, matching `combustibility`'s precedent —
   pending its own task with re-measured grade distributions and the rung-5 conflation resolved
   first.
4. **Whether other `rigidity`-gated substrates carry the same proxy-artefact exclusion leather did
   is unaudited.** `overlay` uses the identical `rigidity >= 3` test `relief` used to; if
   `formability` is the honest gate for one, the other may want the same scrutiny. Filed as a
   follow-on below.

| Doc | What changed                                                                                                                                                                    | Completed  |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| 12  | This entry — the axis, its independence tests, the leather correction, the working-state finding, the two scale rulings, four deferred items; §2.35's `relief` record corrected | 2026-08-11 |
| 05  | §8.2's 2026-08-07 implementation note extended: seventh axis, `relief`'s "thick material" prerequisite resolves to formability, working-state convention noted                  | 2026-08-11 |
| —   | `types/artefact.ts`: `physicalProperties` gains `formability`; preamble records the working-state inconsistency across all seven axes                                           | 2026-08-11 |
| —   | `data/materials.ts`: all 16 materials scored on `formability`; header notes the working-state convention                                                                        | 2026-08-11 |
| —   | `data/decorations.ts`: `relief` substrate gate rewritten to `formability >= 3`, single clause; label corrected from the stale "thick material"                                  | 2026-08-11 |
| —   | Tests: `AXIS_RANGES` gains `formability`; two new independence tests; `relief`'s substrate test rewritten with an explicit full-verdict-delta assertion                         | 2026-08-11 |
| —   | Roadmap: 2GN.102 done; three successors recorded (working-state model, formability-as-difficulty, substrate-gate audit)                                                         | 2026-08-11 |

---

### 2.39 R4 Deleted as Unsatisfiable; an Ignored Zero Made to Fail (2026-08-11)

**Origin:** Roadmap spike 2GN.87 **Source of truth:**
`docs/spikes/2GN.87-r4-unsatisfiable-condition.md` holds the ruling and the measurements; this entry
records what propagated

**R4's condition could not be satisfied, and the proof is arithmetic rather than statistical.**
`primaryAxisLength` bands `dimensions.primaryExtent`, which `deriveDimensions` computes as a
`Math.max` over every component's major axis — drawn from the _same_ `SHORT_MEDIUM_LONG_CM` table
(short 4cm, medium 14cm, long 40cm) that `bladeLengthBand` reads, against a 9cm `short` cut. A
non-short blade therefore always lifts the whole artefact's axis above `short`, so R4's
`primaryAxisLength === 'short' && bladeLengthBand !== 'short'` required a blade longer than the
object containing it. Measured over 8000 artefacts across four Explorer cultures: only 6 of 12
`(axis, blade)` pairs occur, in a strict triangle where blade never exceeds axis; `axis === 'short'`
carried `blade === 'short'` in all 84 cases. The 2GN.86 audit's "50 of 7200, all short-banded" was
the shadow of this identity, not a sampling artefact.

**The rule was a truth-table patch that acquired an archaeological justification afterwards.** Doc
12's PR #37 review record (2026-07-22) shows the order: someone enumerated
`hasEdge × primaryAxisLength × bladeLengthBand`, found cells no rule matched, authored a rule to
cover them, and added a sweep asserting full coverage. The sweep builds `ExtractedFeatures` by hand
and never runs the generator, so it cannot tell a reachable cell from an impossible one. R4's
scraper/chisel JSDoc reads as intent but was written to explain a cell. **General lesson: a typed
feature vocabulary is not a reachability claim — when two fields derive from the same underlying
quantity, their types still present them as independent, and a rule can be authored against a
combination the derivation forbids.** This is the second defect from `deriveDimensions`' `Math.max`
after §2.26's mass proxy, and the third in the family with §2.25's saturating boolean.

**Whether the game should generate the form is left open, deliberately.** A short-bodied edged tool
that is not a formed blade (scraper, chisel, adze) is a real and common archaeological form, and its
absence is a real content gap. But R4 never encoded a decision to model it, and its condition is
phrased in truth-table rather than morphological terms, so keeping it would inherit a decision
nobody made. Filed as a generation task with a replacement rule contingent on it, rather than
resolved by reflex here.

**The test gap was smaller than first claimed, and the claim was withdrawn.** This spike initially
framed the hand-built-features blind spot as more valuable than R4 itself. Measurement did not
support it: `EXPECTED_FIRE_RATES` already pins every rule's real-pipeline rate, only R4/R33/R34 read
0.0%, and R33/R34 are deliberately dormant pending 2GN.68. R27 moved 0.0 → 4.3 when 2GN.86 made it
reachable, so the harness catches both directions. R4 was the only dead rule in 44. (All rule
numbers in this paragraph are **pre-deletion** coordinates, since the audit ran against the 44-rule
set. After the deletion the two dormant rules are R32/R33 — `DORMANT_RULE_INDICES` holds indices
31/32 — and the former mass rule is R26.)

**What actually failed was that a recorded zero passed.** R4 sat at `0.0` with a comment explaining
the zero, and the suite compared `0.0` against `0.0` and said fine — the measurement was taken,
written down and never acted on. A `0.0` rate now fails unless the rule is declared in
`DORMANT_RULE_INDICES` with the roadmap task that will feed it, and a second guard fails when a
declared-dormant rule starts firing so its real rate gets recorded. This reuses the existing n=1800
sweep rather than adding a reachability harness: a `0.0` entry and "never fires" are the same fact,
and deriving it twice would give two sources of truth to drift apart.

| Doc | What changed                                                                                                                                            | Completed  |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| 12  | This entry                                                                                                                                              | 2026-08-11 |
| —   | `docs/spikes/2GN.87-r4-unsatisfiable-condition.md`: new — the ruling, the arithmetic proof, the measured joint distribution, the rejected alternatives  | 2026-08-11 |
| —   | `data/classification.ts`: R4 deleted; edge-family banner records why the combination is unreachable                                                     | 2026-08-11 |
| —   | `data/classification.test.ts`: R4's block removed, R5–R44 renumbered R4–R43, cartesian sweep narrowed to `REACHABLE_AXIS_BLADE_PAIRS`, counts 44→43     | 2026-08-11 |
| —   | `data/calibration.test.ts`: `DORMANT_RULE_INDICES` + two guards added; `EXPECTED_FIRE_RATES`, `MIGRATED_RULE_INDICES`, `UNIVERSAL_BY_DESIGN` renumbered | 2026-08-11 |
| —   | `routes/dev/explorer/calibration/ruleCalibration.test.ts`: two label-based lookups renumbered                                                           | 2026-08-11 |
| —   | Roadmap: 2GN.87 done; two successors filed (generation gap, contingent replacement rule)                                                                | 2026-08-11 |

---

### 2.40 The Precious Material Tags Retired; Gilding Gates on Physics (2026-08-11)

**Origin:** Roadmap spike 2GN.78 **Source of truth:** doc 11 §2.9 holds the revised decision;
`docs/spikes/2GN.78-precious-material-tags.md` holds the reasoning and measurements

**§2.37 closed this task on a boundary that did not hold.** That entry found no classification rule
read `MaterialTag`'s `precious-*` members and booked 2GN.78 done doc-only. The check was correct and
the conclusion too narrow: `precious-metal` is not a description of physical character at all. Every
other `MaterialTag` member names an observable material class two cultures would agree on; these two
name what a material is _worth_, which is the Earth-judgement stamp doc 11 §2.9 identified. Barring
them from classification while they still gated `gilding` and skewed `culturalAffinityWeight` left
the same judgement in the generator, one step removed. **General lesson: a constraint on what may
_read_ a field does not fix a field that shouldn't exist.**

**Retirement was possible because everything the tags did was already modelled.** Gilding's real
requirement is physical — a metal workable to leaf that will not tarnish — and
`craftDomain === 'metallurgy' && formability >= 5 && oxidisation <= 3` admits gold and silver and
nothing else across the shipped catalogue, reproducing the retired tag's pool exactly (gold reads
oxidisation 0, silver 3, against bronze 6 and iron 7). Four candidate predicates were measured; the
shipped one is the only exact match, and exact for a physically meaningful reason rather than by
tuning. The other five techniques naming a precious tag listed it _redundantly_ beside its class tag
— measured pool sizes are identical with and without — so gilding was the only real obstacle.
Scarcity already lives in `GeologicalContext.materialAvailability`, and a specific material's
reachability in `MaterialFlow.specificMaterials`.

**The dead affinity data was worse than 2GN.84 recorded.** That entry named Khaltiris. Measured
across all four Explorer presets, three of five authored precious affinities were inert: Khaltiris'
`precious-metal: 1.4` (lost to `metal: 1.7`), Xoconahtl's `precious-stone: 1.4` (lost to
`stone: 1.8`), with only Thalassar's `precious-metal: 1.2` live, and only because it authored no
competing `metal` value. Retirement moved exactly two affinity weights in the entire preset set.

**The affinity-reduction question dissolved rather than being answered.** With one tag per material
there is nothing to reduce, so max/most-specific/product is moot. `culturalAffinityWeight` and
`decoration.ts`'s inlined `bestMaterialAffinity` both keep the max but now record that the choice
was never ruled and needs one before it carries weight again; a test pins the one-tag-per-material
invariant that makes it unreachable.

**A behaviour change was caught by the calibration harness mid-implementation.** The first attempt
folded `ring-form`'s `metal: 0.4` and `precious-metal: 0.5` modifiers into `metal: 0.9`, on the
reasoning that `effectiveOptionWeight` sums modifiers. R21 drifted 8.6pp (25.3% → 33.9%). The fold
was wrong: a missing affinity reads as `0` in that sum, so the precious term only ever contributed
for a culture whose `materialAffinities` authored the tag — only Thalassar of the four presets, and
it authors no competing `metal` value, so no preset receiving the folded `metal: 0.9` had been
getting the precious term at all. The "equivalent" fold handed every `metal`-authoring culture more
than double their real modifier. Corrected to leave `metal` at its authored `0.4`. **General lesson:
when removing a term from a summed weight, the arithmetically equivalent fold is only equivalent if
the removed term was actually contributing.** With that fixed the whole retirement is
behaviour-neutral — all nine calibration tests pass with no pin re-recorded.

**`preciousMaterialsInDecoration` survives with a new producer contract.** The inference (decoration
incorporating prized materials reads elite/ceremonial) is what doc 11 §2.9's formula was written to
support; only its input was wrong. 2GN.68's earlier spec said "layer-material → precious-material
lookup", which is the read the ruling forbids and now has nothing to look up. It must populate the
field from the material's _situation_ instead. Doc 11 §2.9's formula has four terms, sourced from
three places: `explainMaterialWeight` (2GN.74, landed this branch) returns `level`,
`culturalAffinity` and `tradeRescued`, covering availability and cultural affinity; provenance comes
separately from `MaterialAssignment.provenance` via `deriveMaterialProvenance` (`tradeRescued` is a
reachability boolean, not a provenance substitute); and stratification from
`PhaseCharacteristics.society.stratification`, which §2.9 makes a live input and nothing reads yet.
The threshold over them is 2GN.68's to rule. The rule stays dormant and allowlisted meanwhile.

**One expressive loss, recorded rather than patched.** `materialAffinities` is keyed by tag, so a
culture can no longer say "we prize gold specifically" — only "we prize metal". Thalassar's live
`precious-metal: 1.2` is dropped rather than re-expressed as `metal: 1.2`, which would newly favour
bronze and iron it was never authored to prefer. Whether the map should support per-material entries
is filed as a design question.

| Doc | What changed                                                                                                                                                                                                                                                                                                            | Completed  |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| 12  | This entry; §2.37's "already compliant" reading superseded                                                                                                                                                                                                                                                              | 2026-08-11 |
| 11  | §2.9's `precious-*` consequence rewritten: retired outright, not kept as descriptors; the two-culture test for new members; the accepted expressive loss                                                                                                                                                                | 2026-08-11 |
| —   | `docs/spikes/2GN.78-precious-material-tags.md`: new — the argument, the four measured predicates, the pool table, the rejected alternatives                                                                                                                                                                             | 2026-08-11 |
| —   | `types/tags.ts`: `MaterialTag` loses both members; JSDoc carries the class-not-judgement test                                                                                                                                                                                                                           | 2026-08-11 |
| —   | `data/materials.ts`: gold, silver, jade drop their precious tag; header records why no entry carries one                                                                                                                                                                                                                | 2026-08-11 |
| —   | `engine/generation/decoration.ts`: `isGildingMaterial` added; five pools de-duplicated; access gate reads a resolved pool so `gilding` stays gated                                                                                                                                                                      | 2026-08-11 |
| —   | `engine/generation/materials.ts`: `culturalAffinityWeight`'s max recorded as vestigial and unruled                                                                                                                                                                                                                      | 2026-08-11 |
| —   | `data/grammars/core.ts`: `ring-form`/`sheet-form` drop the precious modifier, `metal` unchanged at its authored value                                                                                                                                                                                                   | 2026-08-11 |
| —   | `data/explorer-cultures.ts`, `tests/fixtures/world.ts`: precious affinities removed, trade flows re-keyed onto class tag + `specificMaterials` — which ORed rather than narrowing, so the flows reached the whole class; superseded by §2.41's `includes`/`excludes` shape, which makes them mean what this row claimed | 2026-08-11 |
| —   | `types/artefact.ts`, `data/classification.ts`: `preciousMaterialsInDecoration`'s producer contract rewritten for 2GN.68                                                                                                                                                                                                 | 2026-08-11 |
| —   | Tests: gilding-pool test added, one-tag-per-material invariant pinned, two exhaustiveness guards and the pinned tag table updated; no calibration pin re-recorded                                                                                                                                                       | 2026-08-11 |
| —   | Roadmap: 2GN.78 done; per-material affinity question filed                                                                                                                                                                                                                                                              | 2026-08-11 |

---

### 2.41 `MaterialFlow` Selects by Include/Exclude; `MaterialName` Types Every Material Id (2026-08-12)

**Origin:** PR #57 review **Source of truth:** doc 05 §3.4 holds the shape; `.claude/roadmaps.json`
2GN.112 holds the ruling

**The old shape had two fields feeding one selector with the operator left unstated.**
`MaterialFlow` carried `materialTag: MaterialTag` plus an optional `specificMaterials: string[]`,
and `MaterialFlow.specificMaterials`' own JSDoc said it applied "when the flow is narrower than the
whole tag". `flowSuppliesMaterial` ORed the two arms, so the list could only ever _widen_ a flow and
never restrict it: `materialTag: 'metal'` supplied bronze and iron whatever the list said. The type
documented a contract the implementation did not provide, and no test pinned either reading.

**§2.40's re-key was the first code to depend on the narrowing reading, and it silently didn't
work.** Retiring `precious-metal` left three shipped flows needing a new key; they were re-authored
as class tag + `specificMaterials` specifically to hold the retired tag's exact reach, and commented
as doing so. Under the OR they reached the whole class instead. Availability happened not to move,
because every material the OR newly reached was already reachable another way — which is why the
error survived review and a full suite run. **General lesson: a mechanism that is inert today
because other data happens to mask it is not thereby correct, and "the tests still pass" does not
distinguish the two.**

**Both candidate fixes were insufficient, which is what forced the shape change.** Making the
implementation narrow would have expressed "no metals except gold" but not "all metals except gold"
— the latter only by enumerating the complement, which freezes against a catalogue that later gains
a metal. Replacing the pair with one explicit material list had the same gap and additionally lost
the open-over-the-catalogue property a class tag gives. `includes`/`excludes` is the smallest shape
expressing both: union the includes, subtract the excludes, no precedence and no ordering. A
rejected third option resolved a tag/id collision by discarding the tag and warning; it bought
exactly what narrowing bought, told authors writing a legitimate "class plus this one especially"
that they had erred, and made a flow's reach depend on which other entries sat beside it.

**Selector arms are tagged because three strings live in both vocabularies.** `bone`, `glass` and
`leather` each name a `MaterialTag` _and_ a material id, so a `MaterialTag | MaterialName` union
could not tell "the bone class, including antler" from "the bone material alone". Resolving that by
precedence would have made three of sixteen materials unselectable by one of their two readings.

**`MaterialName` types every material id, not just the selector's.** The union is declared in
`types/tags.ts` rather than derived from `MATERIALS`, because `data/materials.ts` imports its
`MaterialDefinition` from `types/` and the reverse import would cycle — so the two are kept in step
by a two-directional test rather than by construction. It now types `MaterialDefinition.id`,
`RegionalAvailability.materialId`, `GeologicalContext.materialAvailability`'s key and
`MaterialAssignment.materialId`, so a mistyped id fails at compile time wherever a material is
named. `tests/fixtures/world.ts` had been hand-rolling a runtime equivalent of exactly this check.

**One availability outcome changed, deliberately.** Measured across all four Explorer presets × 16
materials against `origin/main`: Thalassar loses jade. Its jade is `trade-only` and was arriving
through the obsidian flow's `stone` tag arm — the OR reach nobody authored — so the flow now
carrying obsidian alone is the authored intent restored. Every other pair is byte-identical, all 30
calibration pins hold with nothing re-recorded, and 578 tests pass.

| Doc | What changed                                                                                                                                 | Completed  |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| 12  | This entry                                                                                                                                   | 2026-08-12 |
| 05  | §3.4's `MaterialFlow` code block replaced; the include/exclude rule and the tagged-arm rationale stated                                      | 2026-08-12 |
| —   | `types/world.ts`: `MaterialSelector` added; `MaterialFlow` re-shaped; `RegionalAvailability`/`GeologicalContext` keyed by `MaterialName`     | 2026-08-12 |
| —   | `types/tags.ts`: `MATERIAL_NAMES` + `MaterialName` added, with the collision warning and the declared-not-derived rationale                  | 2026-08-12 |
| —   | `types/artefact.ts`: `MaterialDefinition.id` and `MaterialAssignment.materialId` typed `MaterialName`                                        | 2026-08-12 |
| —   | `engine/generation/materials.ts`: `selectorMatches` added, `flowSuppliesMaterial` rewritten; `synthesiseTradePathId` drops its tag component | 2026-08-12 |
| —   | `data/explorer-cultures.ts`, `tests/fixtures/world.ts`: every flow re-authored; §2.40's three re-keyed flows now mean what they claimed      | 2026-08-12 |
| —   | Tests: six selector-semantics cases, the `MATERIAL_NAMES` two-way invariant; the "even off-tag" case renamed for what it now pins            | 2026-08-12 |
| —   | Roadmap: 2GN.112 rewritten from "should `specificMaterials` narrow?" to the ruling it became                                                 | 2026-08-12 |

---

### 2.42 Classification Rules Carry a Stable Id; `R{n}` Demoted to a Display Label (2026-08-12)

**Origin:** PR #57 review **Source of truth:** `ClassificationRule.id` in `src/lib/types/tags.ts`;
`.claude/roadmaps.json` 2GN.113 holds the ruling

**A rule's only identity was its position in the array, and §2.39's deletion proved what that
costs.** Removing R4 shifted every later rule up one, so every `R{n}` reference in comments, docs
and tests silently came to name a different rule. Nothing failed. The staleness was found by eye
across four separate follow-up commits (`49319ec`, `f12f535`, `15f8c8f`, `f7dd239`), each scoped
somewhere the last one had not reached, and the PR review pass still found more afterwards: an
`R32`/`R29` pair in `classification.ts` and an `R11` in `types/tags.ts` describing rules two indices
away. **General lesson: an identifier that is derived from position cannot be cited safely, because
nothing connects the citation to the thing it names.** A wrong `R{n}` is indistinguishable from a
right one at the point of reading.

**Every rule now carries a kebab-case slug naming what it reads and what it concludes.**
`edge-short-sharp-dagger`, `container-slit-votive`, `applied-elements-above-p75`. The slugs were
authored against each rule's own condition rather than derived from it or assigned by position, so
the id states the intent a reader would otherwise reconstruct from a predicate. `RULES_BY_ID` is
built once at module load and throws on a duplicate rather than letting the later rule win, so an
ambiguous id cannot reach a lookup. `ruleById` returns `undefined`; `requireRuleById` throws naming
the missing id and where ids are listed.

**`R{n}` survives, as a rendering of current position and nothing else.**
`ruleDisplayLabelAt(index)` is the form to call where the index is already in hand;
`ruleDisplayLabel(rule)` is for where it is not, and returns `undefined` for an unshipped rule. The
Explorer panels and `scripts/dev/sample-classification.ts` show the label, because a reader
comparing a panel against the array wants the position. `tagInspector.ts` and `ruleCalibration.ts`
carry `ruleId` alongside it, so the identity survives what the display cannot.

**Dated measurements keep their original numbering, deliberately.** `calibration.test.ts`'s
fire-rate tables, this register's own entries and the spikes all describe the 44-rule set as
measured, so rewriting their numbers to today's positions would falsify a record. Only live
cross-references were migrated. Where a dated passage sits next to live prose, the disambiguation is
stated in place: `classification.ts`'s applied-element rule carries a note that the `R30` in the
passages below it is `decorative-layers-above-p75`, which displays as R29 today.

**The guard is that a deletion now fails loudly.** `classification.test.ts`'s 43 index constants
call `requireRuleById`, and its 37 weight-signature identity guards were deleted as redundant, since
the lookup is a strictly stronger check than the signature it replaced. Verified by deleting a rule:
the suite fails with `no rule with id 'edge-multiple-composite'` rather than silently repointing a
test at its neighbour. Three id-contract tests pin the mechanism itself (uniqueness and kebab-case
shape, round-trip over every shipped rule plus rejection of a retired id, and display-label
positionality).

**Prose that quotes the rule count is checked too, since it was the other half of the same
problem.** `docs/docs-rule-counts.test.ts` walks every `.md`/`.html` under `docs/` and fails when a
count claim no longer matches `CLASSIFICATION_RULES.length`. Dated claims carry a
`<!-- rule-count: historical -->` marker instead of an edit; §2.26 is the worked example. Two
exemptions are structural rather than editorial: the marker is skipped past blank lines because
`deno fmt` inserts one, and `<script type="application/json">` data islands are skipped entirely,
because the roadmap artefacts embed `.claude/roadmaps.json` as a single 236KB line where no comment
can sit.

| Doc | What changed                                                                                                                   | Completed  |
| --- | ------------------------------------------------------------------------------------------------------------------------------ | ---------- |
| 12  | This entry                                                                                                                     | 2026-08-12 |
| 05  | §9.2's `ClassificationRule` block documents `id`, per that doc's dated-note convention                                         | 2026-08-12 |
| —   | `types/tags.ts`: `id` added to `ClassificationRule`, with the positional-identity rationale inline                             | 2026-08-12 |
| —   | `data/classification.ts`: 43 authored slugs; `RULES_BY_ID`, `ruleById`, `requireRuleById`, `ruleDisplayLabel{,At}`             | 2026-08-12 |
| —   | `data/classification.test.ts`: index constants fetch by id; 37 weight-signature guards deleted; three id-contract tests added  | 2026-08-12 |
| —   | Explorer: `tagInspector.ts` and `ruleCalibration.ts` carry `ruleId`; calibration assertions pin rules by id, not display label | 2026-08-12 |
| —   | `scripts/dev/sample-classification.ts`: reads `ruleDisplayLabel` rather than hand-numbering                                    | 2026-08-12 |
| —   | `docs/docs-rule-counts.test.ts`: new prose guard, with the historical marker and the data-island exemption                     | 2026-08-12 |
| —   | Roadmap: 2GN.113 filed and closed                                                                                              | 2026-08-12 |

---

### 2.43 Short-Bodied Edged Tools Ruled In; `position` Is Not the Oriented Axis It Documents (2026-08-13)

**Origin:** 2GN.108 design spike **Source of truth:**
`docs/spikes/2GN.108-short-bodied-edged-tools.md`; decision locked in doc 11 §2.11

**2GN.87 left the generation question open and this spike closes it: the form is ruled in.** Whether
the generator should produce a short-bodied edged tool that is not a formed blade (scraper, chisel,
small adze) was deliberately not inherited from the deleted R4, which was a truth-table patch with
an archaeological reading attached afterwards. Ruled in on grounds that are **not** archaeological
completeness.

**The missing shapes are not uniformly distributed across the tag space.** They occupy the working/
craft/domestic region, so their absence removes one region rather than thinning the corpus evenly,
leaving edged artefacts skewed towards blade-family readings because a long-axis edged form is the
only edged form reachable. That skew propagates into culture tag profiles, and the lens feeds on tag
co-occurrence (doc 04), so it surfaces as **repetition in the core mechanic**. ⚠️ §2.9's
culture-relative baselines cannot compensate: they sample the same narrowed distribution, so
relativity cannot restore variety that was never generated. **General lesson: a content gap upstream
of a variety mechanism is not fixed by that mechanism.**

**All three mechanisms carried over from 2GN.87 treat symptoms.** A shorter `elongated.length` rung,
decoupling `bladeLengthBand` from the shared cm table, and de-`Math.max`-ing `primaryExtent` each
address one arm of the coupling. The actual defect is that **`bladeLengthBand` bands the wrong
quantity**: absolute length cannot separate a scraper (edge-dominant, short) from a dagger
(edge-dominant, long) from a hafted adze (long body, short edge). The distinction is proportional —
the span from the edged component to where a hand would hold it. The strict `(axis, blade)` triangle
2GN.87 measured is a symptom of measuring the wrong thing.

**Grip-to-edge is derivable today; no role vocabulary is needed.** `data/plausibility.ts` states the
model "needs a component-role vocabulary this project doesn't have yet", and all three of its rules
are proxies accordingly. But `NormalisedArtefact.attachments` is a populated typed from/to graph and
`NormalisedComponent` carries `position` plus derivable extents, so the span is a traversal over
structure that already exists — **the proxies never used the graph they had.** Two scoping claims
made during the spike were wrong and are corrected here: doc 05's `arrangementGroup` is repetition
structure (`symmetric`/`radial`/`linear-array`), unrelated to role; and the
`'grip-system'`/`'head-system'` strings in `types/interpretation.ts` are JSDoc illustration, not a
defined type. A role vocabulary would be genuinely new, which is why it is ruled separately
(2GN.116) rather than assumed.

**The root cause: `position` is documented as an oriented axis and is not one.** Doc 05 §6.1 calls
it "Ordering along the primary axis", intended to carry a shared direction across artefacts —
working end at one pole. `grammar.ts` mints it as a depth-first traversal index reflecting grammar
expansion order, so a blade can land at position 0 with its haft after it and nothing corrects it.
Normalisation must **orient**, not merely flatten. **General lesson, extending §2.39's corollary: a
field's documented intent is not a claim about what its derivation enforces.** Three plausibility
proxies were authored to work around an absence no measurement had named.

**Orientation is by reversal, not rejection.** A mirrored artefact carries no information — it is
the same artefact described backwards — so rejecting it spends re-expansion budget (2GN.16)
enforcing probabilistically what construction can guarantee, and would discard roughly half of
otherwise-valid two-part edged forms. The general working-end definition is deferred to 2GN.115,
which ⚠️ blocks **implementation** rather than this ruling: reversal cannot be implemented for edged
forms and retrofitted to a different general convention without repeating the recalibration sweep.

| §  | Propagation                                                                                                   | Date       |
| -- | ------------------------------------------------------------------------------------------------------------- | ---------- |
| —  | `docs/spikes/2GN.108-short-bodied-edged-tools.md`: new spike write-up, findings and rejected alternatives     | 2026-08-13 |
| —  | Doc 11 §2.11: locked decision (form ruled in, proportional banding, orientation by reversal)                  | 2026-08-13 |
| ⏳ | Doc 05 §6.1: `position` gains an orientation contract; `bladeLengthBand`'s derivation restated — with 2GN.117 | 2026-08-13 |
| —  | Roadmap: 2GN.108 closed; 2GN.115 and 2GN.116 filed; 2GN.117 filed as the implementation placeholder           | 2026-08-13 |
| —  | Roadmap: 2GN.13 and 2GN.14 gain a `dependsOn` edge to 2GN.116, moving both `todo` → `blocked`                 | 2026-08-13 |
| ⏳ | 2GN.109 confirmed live (it was void only if the form had been ruled out) — authored with the sweep            | 2026-08-13 |
| ⏳ | Set-wide recalibration shared with 2GN.67, 2GN.69, 2GN.109 and 2GN.117: sequence once, re-record fire rates   | 2026-08-13 |

---

### 2.44 The Categorical Rules Wanted Conditions, Not Baselines; 10 of 24 Read One Property (2026-08-13)

**Origin:** 2GN.97 design spike **Source of truth:**
`docs/spikes/2GN.97-categorical-relative-award-rules.md`; decision locked in doc 11 §2.12

**The brief was rejected, not answered.** §2.31 split this task out of 2GN.82 as "what does relative
mean for a categorical band", offering a prevalence baseline, a `stratification` gate or
weight-scaling. Measuring the rules first found that four of the five groups they fall into do not
want a baseline at all, and the largest finding was invisible from inside the question as posed.
**General lesson: a brief encodes the understanding available when it was filed.** §2.39 recorded
the converse for rules — a condition can outlive the intent that authored it — and this records it
for tasks. Where a brief names a solution shape, the first measurement should test whether that
shape fits, not how to build it.

**Count corrected: 24, not 25.** The roadmap figure predated §2.39's deletion of R4. Measured
against the current array: 34 rules award at least one `RelativeTag`, 10 carry a migrated `exceeds`
call.

**Group A2 is not fixable by weighting, because accumulation is additive.** `classifyArtefact` sums
`tag → weight` with no suppression, competition or normalisation, so awarding two readings at half
weight is indistinguishable downstream from two confident unrelated rules contributing the same
scores — an ambiguous artefact reads as weakly-everything rather than strongly-uncertain. Splitting
weights was rejected on that basis before the ambiguity was reframed (below).

**The wall rules are unrelativisable.** `wallThickness` is `wall: ['thin','medium','thick']` rolled
by the grammar with no continuous value anywhere beneath it. Prevalence counts band frequency, which
says nothing about actual thickness: a culture whose walls are all 3mm and one whose walls are all
30mm both read "100% thin" depending only on where the global cut falls, so **one culture's thick
may be physically thinner than another's thin and no baseline recovers it.** Fourth instance of the
band-computed-from-an-absolute-table family after §2.26 (mass), §2.39 (blade) and §2.43 (axis).
Filed 2GN.120; the two rules stay absolute and blocked-with-reason meanwhile.

**The base rules are under-conditioned, and `baseType` is innocent.** Stress-tested against the wall
case it passes both tests — no crushed quantity (a pedestal is not "very flat"), and prevalence
would be a real comparable number. It is still the wrong answer: **a base is a relation between the
base and what it supports.** A pedestal under a statue and one under a hat-stand read oppositely
from an identical `baseType`, and the difference is not cultural, so no relativisation separates
them.

**The finding that outgrew the brief.** Across all 43 rules: **10 of the 24 condition on exactly one
property** (`f.x === 'value'` and nothing else); 7 more read two properties of the same component
(the container rules pair `hasContainer`, a presence flag, with a feature extracted off the dominant
container); **exactly one is genuinely relational** (`motif-multiple-origins`). `attachments` and
`position` are populated and read by no rule — the same unused-graph finding as §2.43, reached from
the classification side. ⚠️ The defect crosses doc 11 §2.9's boundary:
`perforation-central-rotation` awards `tool`, an `AbsoluteTag`, and is under-conditioned
identically, so it is **a property of how conditions are written, not of which vocabulary they award
from**. Filed 2GN.119, scoped to all 43.

| §  | Propagation                                                                                                | Date       |
| -- | ---------------------------------------------------------------------------------------------------------- | ---------- |
| —  | `docs/spikes/2GN.97-categorical-relative-award-rules.md`: new spike write-up                               | 2026-08-13 |
| —  | Doc 11 §2.12: locked decision (baselines are not the answer; five groups)                                  | 2026-08-13 |
| —  | Roadmap: 2GN.97 closed, unblocking 2GN.72 (per-component feature provenance)                               | 2026-08-13 |
| —  | Roadmap: 2GN.119 (relational conditioning, all 43 rules) and 2GN.120 (derived wall thickness) filed        | 2026-08-13 |
| —  | Roadmap: 2GN.118 (primitive value-set audit) filed, blocking 2GN.10, 2GN.21, 2GN.109, 2GN.117              | 2026-08-13 |
| ⏳ | `data/classification.ts`: the two wall rules annotated absolute-with-reason — with 2GN.120                 | 2026-08-13 |
| ⏳ | `precious-materials-in-decoration` recorded dormant, not unmigrated — feature stubbed `false` since 2GN.78 | 2026-08-13 |

---

### 2.45 Affinities Take the Flow Selector; Most-Specific-Wins Retires the `max` Reduction (2026-08-13)

**Origin:** 2GN.110 design spike **Source of truth:**
`docs/spikes/2GN.110-per-material-affinities.md`; decision locked in doc 11 §2.13

**The expressive loss §2.40 accepted is recovered, by reusing §2.41's selector.** Retiring the
`precious-*` tags left `materialAffinities` keyed by `MaterialTag` alone, so a culture could say "we
prize metal" but not "we prize gold". Thalassar's authored `precious-metal: 1.2` — the only _live_
precious affinity across the four Explorer presets — was dropped rather than re-expressed as
`metal: 1.2`, which would newly favour bronze and iron it was never authored to prefer. The map is
now keyed by `MaterialSelector`, the tagged union 2GN.112 built for `MaterialFlow`, and for the
identical reason: `bone`, `glass` and `leather` each name both a tag and a material, so a bare union
cannot distinguish them and precedence would make three of sixteen materials unselectable by one of
their readings.

**Only half the flow pattern transfers.** `MaterialFlow` pairs `includes` with `excludes` because
membership needs subtraction ("all metals except gold"). Affinities are weights, so there is nothing
to subtract; the exception case is carried by the resolution rule instead.

**Adopting the selector forced a ruling that had been deferred indefinitely.**
`culturalAffinityWeight`'s `max` across a material's tags is inert today — every shipped material
carries exactly one tag — and its own JSDoc flagged the reduction as unruled "if a genuine multi-tag
material is ever authored". Per-material entries make the multi-value case arrive immediately, via
the selector rather than via a multi-tag material: gold carries both `{ tag: 'metal' }` and
`{ id: 'gold' }`. **General lesson: a dormant code path accumulates no evidence about itself.** The
reduction survived §2.40 and 2GN.84 because it never fired, so nothing tested it and no measurement
contradicted it. When a shape change makes a dormant path live, the ruling it was always waiting for
comes due in the same change, not afterwards.

**Resolution is most-specific-wins, and `max` is already known wrong.** 2GN.84 measured the max
_discarding_ authored `precious-*` values whenever the class tag scored higher (3 of 5 dead that
way), so ⚠️ a specific entry could only ever raise a material, never lower it — the one-directional
behaviour that was itself evidence the precious tags encoded a judgement rather than a class.
Most-specific-wins is bidirectional and keeps authored value and computed weight identical, where
product-of-deviations does not: `metal: 1.5` × `gold: 0.8` yields 1.2, so a below-neutral authored
value produces an above-neutral result, reading as mild favour when disfavour was meant.

**Two consumers move together, one cannot participate.** `culturalAffinityWeight` (`materials.ts`)
and `bestMaterialAffinity` (`decoration.ts`) inline the same reduction, as that JSDoc already
required. ⚠️ `effectiveOptionWeight` (`grammar.ts`) reads affinities by tag with a deliberate `?? 0`
default and **cannot consult a per-material entry even in principle**: it weights grammar options by
`culturalModifiers` at stage 4, and materials are not assigned until stage 6, so it never sees a
material. A stage-ordering fact, recorded so it is not later "fixed" into consistency.

**The boundary, stated as the brief asked.** A per-material affinity is a culture's judgement about
a material, legitimate under §2.28's ruling precisely because it is _that culture's_ opinion. The
retired tags lived in `data/materials.ts` as a property of the material itself, stamping one
judgement onto every culture in every world. **The test is where the statement lives, not how
specific it is.** Specificity was never the problem; universality was.

| §  | Propagation                                                                                         | Date       |
| -- | --------------------------------------------------------------------------------------------------- | ---------- |
| —  | `docs/spikes/2GN.110-per-material-affinities.md`: new spike write-up                                | 2026-08-13 |
| —  | Doc 11 §2.13: locked decision (selector keying, most-specific-wins, the where-it-lives boundary)    | 2026-08-13 |
| —  | Doc 05 §3.3: `materialAffinities`' shape and the resolution rule                                    | 2026-08-13 |
| —  | `types/world.ts`: `materialAffinities` re-keyed to `readonly MaterialAffinity[]` (see §2.47)        | 2026-08-13 |
| —  | `materials.ts` + `decoration.ts`: `max` replaced by most-specific-wins in both, together            | 2026-08-13 |
| ⏳ | `data/explorer-cultures.ts`: Thalassar's dropped gold/silver intent re-authored as specific entries | 2026-08-13 |
| —  | Roadmap: 2GN.110 closed; the tag-versus-tag tie recorded as explicitly unruled                      | 2026-08-13 |

---

### 2.46 Per-State Values on `rigidity` Alone; Two Axes Were Authored Against the Wrong State (2026-08-13)

**Origin:** 2GN.111 design spike **Source of truth:**
`docs/spikes/2GN.111-per-state-physical-properties.md`; decision locked in doc 11 §2.14

**§2.38 recorded the inconsistency and deferred the fix; this rules the shape, and it is narrower
than the deferral assumed.** 2GN.105 was filed presupposing per-state values on every axis ("at
minimum worked vs finished"). Measuring first found that **exactly one axis needs them**.

**Three axes vary strongly by state, but that is not what decides the shape — the consumers are.**
`fragility` (glass 7 cold, ~1 hot; fired clay 6 fired, ~1 wet), `rigidity` and `formability` all
move with state; `hardness` moves marginally; `grainFineness`, `porosity` and `combustibility` do
not move at all. What matters is which state each _reader_ needs: `relief` (`formability >= 3`) and
wire-drawing (`formability >= 5`) ask working-state questions, the three `rigidity >= 3` gates on
`overlay`/`studs`/`gilding` ask a finished-state one, and `computeLayerGrade` reads its six
difficulty axes in the working state because difficulty is incurred while working.

**Bronze decides it.** Whether bronze can be forged into a raised form, and whether the finished
object still holds applied leaf, are both true and are different numbers. No single convention
serves both: pinning to working breaks the rigidity gates, pinning to finished breaks `relief`. ⚠️
`relief`'s own predicate family already mixes conventions — it gates on working-state `formability`
while its siblings gate on finished-state `rigidity`, which is §2.38's inconsistency with the
tripping consumer now identified. **Only `rigidity` is asked in both states by different consumers,
so only `rigidity` becomes `{ worked, finished }`.**

**A blanket per-state model was rejected on authoring cost and on precision.** 16 materials × 7 axes
× 3 states = 336 values to capture variation in four axes, 48 of them three identical numbers.
**General lesson: a uniform shape invites false precision** — an author given three boxes fills all
three, inventing distinctions that do not exist, the same failure as authoring a rule against a
combination nobody established was reachable (§2.39). `raw` was rejected for the matching reason: no
consumer asks about an unworked material, so the rung would author 16 values nothing reads.

**⚠️ Two axes turn out to be authored against the wrong state, which is a live defect.** `fragility`
and `hardness` feed `computeLayerGrade` and nothing else, so working state is the only correct
reading — yet both are authored finished-state. Glass carries `fragility: 7` (cold) while being
decorated hot; fired clay carries `6` (fired) while being decorated wet. **Both inflate execution
difficulty for materials worked in a far more forgiving state.** The correction is independent of
the shape change and moves `meanDecorativeGrade` for those materials, so the 2GN.79 guard will flag
it.

**General lesson: a new axis is a probe.** The six axes were authored against the finished object
_by default rather than by decision_ — the question was never posed, so each author answered it
implicitly, consistently enough that nothing looked wrong, and only `fired-clay`'s data-file comment
ever named the choice. 2GN.102 exposed it by adding an axis that could not be authored without
asking. **The question a new axis forces is often one its siblings silently answered differently** —
and here, two of the six answered it wrongly for the only consumer that reads them.

| §  | Propagation                                                                                           | Date       |
| -- | ----------------------------------------------------------------------------------------------------- | ---------- |
| —  | `docs/spikes/2GN.111-per-state-physical-properties.md`: new spike write-up                            | 2026-08-13 |
| —  | Doc 11 §2.14: locked decision (per-state on `rigidity` alone; the pinning table)                      | 2026-08-13 |
| ⏳ | Doc 05 §7: the property model's state conventions — with 2GN.105                                      | 2026-08-13 |
| ⏳ | `types/artefact.ts`: `rigidity` becomes `{ worked, finished }`; the preamble's deferral discharged    | 2026-08-13 |
| ⏳ | `data/materials.ts`: `fragility`/`hardness` re-authored to working state across 16 materials          | 2026-08-13 |
| ⏳ | Calibration: `meanDecorativeGrade` moves for glass and fired clay; re-record with the drift annotated | 2026-08-13 |
| —  | Roadmap: 2GN.111 closed; 2GN.105 rescoped from "per-state on every axis" to the specific audit list   | 2026-08-13 |

---

### 2.47 A Ruling Named a Container It Could Not Have: `MaterialSelector` Keys Need an Array (2026-08-13)

2GN.110 ruled that `CulturalProfile.materialAffinities` is "keyed by `MaterialSelector`", and 2GN.123
was filed to carry it. The implementation could not take that shape literally. **A JavaScript `Map`
matches object keys by reference**, so `new Map([[{ tag: 'metal' }, 1.5]])` cannot be read back by
`.get({ tag: 'metal' })` — the lookup builds a different object and misses. Every read site in the
ruling's own consumer list did exactly that lookup.

The field is therefore `readonly MaterialAffinity[]`, an array of `{ selector, weight }` entries.
Nothing in the ruling's semantics changes: most-specific-wins resolution, the neutral `1` default,
bidirectionality and the unruled tag-versus-tag tie all hold as written. What changed is the
container, and only because the named one cannot express the named keys.

The ruling's rejected alternatives were not revisited — in particular the "second parallel map"
(`specificMaterialAffinities` alongside `materialAffinities`), which would have sidestepped the
identity problem while reintroducing exactly the two-fields-one-selector shape 2GN.112 removed from
`MaterialFlow`. The array satisfies the ruling; the parallel map would have satisfied the compiler.

⚠️ `effectiveOptionWeight` (`grammar.ts`) could not be left untouched despite Finding 3 ruling it a
non-participant: it performed a `Map.get` on this field. It now scans for a class (`{ tag }`) entry
and still ignores `{ id }` entries entirely, preserving both its stage-4 blindness to per-material
judgements and its deliberate `?? 0` default. The behaviour is unchanged; only the lookup mechanism
moved.

**A ruling can name an implementation that does not exist.** 2GN.110 reasoned carefully about
semantics and reached the right answer, then reached for the nearest familiar container without
checking that it could hold those keys — and the spike's consumer table listed three `Map.get` call
sites without anything flagging that two of them were about to become impossible. The generalisation:
**when a ruling changes what a key *is*, the container is part of the ruling, not an implementation
detail left to the task that carries it.**

| §  | Propagation                                                                                       | Date       |
| -- | --------------------------------------------------------------------------------------------------- | ---------- |
| —  | `types/world.ts`: `MaterialAffinity` added; field typed `readonly MaterialAffinity[]`             | 2026-08-13 |
| —  | Doc 05 §3.3: the interface and resolution rule published in the array shape                       | 2026-08-13 |
| —  | `grammar.ts` + doc 05 §5.4: class-entry scan replaces `Map.get`; stage-4 blindness documented     | 2026-08-13 |
| —  | `types/grammar.ts`: `culturalModifiers`' "key type matches `materialAffinities`" claim corrected  | 2026-08-13 |
| —  | `materials.test.ts`: seven resolver tests — the reduction's first coverage in any form            | 2026-08-13 |
| ⏳ | Thalassar's gold/silver restoration + `EXPECTED_FIRE_RATES` re-record — 2GN.123 second branch     | 2026-08-13 |

---

_This document is a living register. Items are added during design sessions and resolved during
propagation passes._
