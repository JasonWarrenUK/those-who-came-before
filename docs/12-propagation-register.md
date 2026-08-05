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

_No pending items. All propagation from the current design round has been completed._

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

| Doc | What changed                                                                                                          | Completed  |
| --- | --------------------------------------------------------------------------------------------------------------------- | ---------- |
| 11  | New §2.9 Status-Tag Relativity — the locked decision, the vocabulary reorganisation, and the rejected alternatives    | 2026-08-04 |
| 12  | This entry — measurement findings, the boundary rationale, the undercount correction, and the two constraints raised  | 2026-08-04 |
| —   | `types/tags.ts`: `FunctionTag`/`ContextTag` replaced by `AbsoluteTag`/`RelativeTag`/`ArtefactTag` ⚠️ breaking         | 2026-08-04 |
| —   | `data/classification.ts`: ruling recorded at the rule set; 34/43 and 9/43 counts pinned by test                       | 2026-08-04 |
| 05  | Pending: §3.2 `stratification` becomes a live classification input; §9.2's tag code block supersedes to the new split | —          |
| 08  | Pending: `ClassificationContext` type; world state carries cached per-culture-phase baselines                         | —          |
| 12  | Pending: §2.22's tag sets re-keyed to the new vocabulary (lands with 2GN.78)                                          | —          |
| —   | Roadmap: 2GN.80 and 2GN.77 resolved; 2GN.82–85 gated on this ruling; new 3WS.21 for phase-attribute continuity        | 2026-08-04 |

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
`specialisation`, §9.3 `groundTruthTags`, §13.1 `emphasis`, §13.2 `TagSuggestion.tag`) were corrected
to match.

**The relative-tag constraint is now recorded ahead of the three consumers that inherit it.** None of
description generation (2GN.38+), the lens (M6) or NPC interpretation (M10) exist yet, so each spec
now carries a short note stating what it must respect once built: descriptions must not render a
`RelativeTag` as an intrinsic property (doc 05 §13.1); the lens scores a `RelativeTag` against the
culture-phase it currently *attributes* the artefact to, not the true one (doc 04 §3.2); and
`InterpretiveModel` being agent-generic means the same indexing applies to NPC scholars without
further work (doc 06 §6).

**Two small corrections surfaced in doc 06 while reading it for the NPC note.** Its existing §2.28
supersession banner cited "§7's tag-belief entry" for the sole `FunctionTag` field; the document ends
at §6, and the field is in §3.3's `functionalEmphasis`. Separately, §2's introductory paragraph still
glossed the retired FOR/USED split in the present tense ("Function tags describe..."); reworded to
past tense with a pointer to the shipped types.

| Doc | What changed                                                                                                                             | Completed  |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| 05  | §9.2 code block rewritten to `AbsoluteTag`/`RelativeTag`/`ArtefactTag`; four stale references corrected; constraint note added at §13.1     | 2026-08-04 |
| 04  | Constraint note added at §3.2, after `ClassificationSuggestion`                                                                             | 2026-08-04 |
| 06  | Constraint note added at §6; §2's FOR/USED gloss and §2.28 banner's §7 reference corrected                                                  | 2026-08-04 |
| 12  | This entry — closes §2.28's doc 05 pending line                                                                                             | 2026-08-04 |
| —   | Roadmap: 2GN.85 resolved, doc-only; 2GN.82–84 recalibration remain gated on 2GN.80                                                          | 2026-08-04 |

---

### 2.30 ClassificationContext Shipped Ahead of World State; 2GN.82 Re-Gated on the Machinery, Not Just the Ruling (2026-08-05)

**Origin:** Roadmap 2GN.94/2GN.95, split out while scoping 2GN.82.

**Source of truth:** doc 11 §2.9 holds the ruling; this entry records the machinery gap the ruling's
own text flagged (§2.9's "consequently, `ClassificationRule.condition` widens...") but that no task
built, and how it was closed.

**2GN.82 could not be started as scoped.** The ruling (§2.28, 2026-08-04) is fully decided, but
`ClassificationContext` was referenced in five places across `types/tags.ts` and `data/
classification.ts` and defined nowhere; `ClassificationRule.condition` was still the pre-ruling
single-argument predicate; no baseline-sampling code existed; and no percentile helper existed
anywhere in `src/lib` — every p50/p75/p90 figure in `classification.ts`'s JSDoc was computed
out-of-band and hand-transcribed during 2GN.34/2GN.79, so the recalibration this task asks for was
not reproducible from the tree as it stood. Recalibrating thresholds against a culture-relative basis
with no implementation would have measured the wrong thing.

**Split into three tasks rather than folding the machinery into 2GN.82 itself.** 2GN.94 ships
`engine/statistics.ts` (`percentileOf`/`percentileLadder`, R-7 interpolation — required, not a taste
call, since §2.28 measured `appliedElementCount` taking only 9–16 distinct integer values, so a
nearest-rank percentile flips between adjacent integers at any sample size). 2GN.95 ships
`ClassificationContext`, the widened `condition` signature, and `engine/generation/baselines.ts`'s
`sampleBaselines` — **migrating zero rules**. 2GN.96 is split off and blocked (3WS.4, 3WS.9, 3WS.21):
it owns baselines cached on real `WorldState`, drift-vs-preceding-phase, and `stratification` as a
live input, none of which have a real dependency to build against yet.

**The zero-migration slice is the load-bearing design choice.** TypeScript accepts a
narrower-arity function wherever a wider signature is expected, so all 43 shipped rules — still
`(f) => boolean` — compile unchanged against the widened `(features, context) => boolean` contract
and fire identically. `EXPECTED_FIRE_RATES` in `calibration.test.ts` stayed bit-identical through the
whole change, which is the empirical proof the slice altered no observable behaviour: 2GN.82's actual
recalibration is the only work licensed to move those numbers, and it now has clean ground to do so
on.

**Baselines sample against `EXPLORER_CULTURES`, not real culture generation, because no generator
exists.** `explorerCulturePhase` (`data/explorer-cultures.ts`) adapts an `ExplorerCulture` — which
already carries `profile` + `phase` + `geology` + `trade` in one record, all 16 shipped materials
modelled — into `sampleBaselines`' `CulturePhaseSample` parameter. `CulturePhaseSample` is
deliberately a structural bag rather than `CulturePhase` (`types/world.ts`), which carries none of
the three `expandDecoration` needs, so nothing in the sampler's signature has to change when 3WS.9
lands a real `WorldState` culture source.

**No shipped rule reads a context yet, so every current call site passes an empty one.**
`emptyClassificationContext` (`baselines.ts`, re-exported from `tests/fixtures/artefact.ts` for test
convenience) is used at both Explorer call sites (`tagInspector.ts`, `ruleCalibration.ts`) rather than
a freshly-sampled real context: `inspectTags` runs interactively per artefact, and `sampleBaselines`
draws `BASELINE_SAMPLE_SIZE` (400) extra artefacts through the full stage-1–7 pipeline — real latency
for zero observable effect until 2GN.82 migrates a rule that actually calls `exceeds`. The empty
context still honours the type's off-ladder-throws contract for `exceeds` rather than silently
no-op'ing every call, so a caller bug (an out-of-ladder percentile) surfaces the same way against an
empty context as a sampled one.

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

| Doc | What changed                                                                                                                    | Completed  |
| --- | -------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| 12  | This entry — machinery gap, the split, the zero-migration proof, and the `EXPLORER_CULTURES` stand-in | 2026-08-05 |
| —   | `types/tags.ts`: `BaselineFeature`, `FeatureBaseline`, `ClassificationContext`; `ClassificationRule.condition` widened | 2026-08-05 |
| —   | `engine/statistics.ts`, `engine/generation/baselines.ts`: new, ship 2GN.94/95 | 2026-08-05 |
| —   | Roadmap: 2GN.94/95 done, 2GN.96 new and blocked (3WS.4/3WS.9/3WS.21); 2GN.82–84 repointed to depend on 2GN.95; stale 34/43 scope note corrected | 2026-08-05 |
| 08  | Still pending: `ClassificationContext` now exists in `types/`, but world-state caching remains genuinely blocked on 3WS.9 | — |

---

_This document is a living register. Items are added during design sessions and resolved during
propagation passes._
