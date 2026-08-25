# TWCB: Deferred Design Questions

_Cross-cutting concerns, unexplored design spaces, and locked-in decisions that emerged during
specification_

---

## 1. Open Questions

These are unresolved design problems that affect multiple systems. Each needs dedicated discussion
before the relevant systems can commit to implementation details.

Questions deferred to post-MVP development are tracked in doc 13 (Deferred Post-MVP Design
Questions).

### ~~1.1 Game Time Units~~ → Resolved (see 2.8)

### ~~1.2 Alternative Dissemination Pathways~~ → Deferred to post-MVP (see doc 13, Section 1)

### ~~1.3 Emergent Schools of Thought~~ → Deferred to post-MVP (see doc 13, Section 2)

### ~~1.4 Publication Counts as Role Qualification~~ → Deferred to post-MVP (see doc 13, Section 3)

### ~~1.5 Decorative Volume: What Does It Key On?~~ → Resolved (see 2.10)

_No open questions remain in this numbered list for the current development round — every
architectural blocker above has been resolved or explicitly deferred. This does not cover 2GN.97
(§2.31), the still-open M2 design spike into the twenty-five categorical relative-award rules 2GN.82
could not migrate; that spike was raised as a locked-in decision's follow-up rather than as one of
the numbered questions above, but it remains genuinely unresolved._

---

## 2. Locked-In Decisions

These emerged during specification discussions and have been resolved. Recorded here for reference
and traceability.

### 2.1 Named Peer Review

**Decision:** Peer review in TWCB is **not anonymous**. Reviewers are named, and their assessment is
a public professional act.

**Rationale:** This diverges from modern real-world convention but is consistent with the game's
fictional setting (smaller professional community, no mass internet, more personal scholarly
culture) and its core thesis (the observer always shapes the observation).

Named review makes reviewer bias visible and actionable, creates genuine NPC relationship
consequences for critique, feeds the oracle problem (temptation to write for known reviewers), and
is thematically consistent with the lens system. The player knows _who_ reviewed them but must still
infer _why_ — shifting the interpretive challenge from identity to motivation.

Affects doc 07 (peer review as career mechanic, NPC relationships) and doc 10 (dissemination
pipeline at the submitted → published transition).

### 2.2 Private Document Mutability

**Decision:** Documents in `private` dissemination state are mutable. The immutability principle
activates when a document is first disseminated beyond `private`.

**Rationale:** Immutability serves social commitment — it captures the fact that once someone has
seen your work, you can't unsee it for them. A private draft has no audience, no perception, no
reliance. Forcing lineage nodes for every tweak to a private draft would generate graph noise for
zero gameplay value.

Affects doc 10 (core principle, dissemination rules, DocumentNode interface).

### 2.3 No Mass Internet

**Decision:** The game's fictional "present day" setting is modern but without mass internet.
Digital distribution, online journals, social media, and web-based communication do not exist in the
game world.

**Rationale:** Keeps the venue landscape grounded in print, exhibition, and live event. Removes the
need to model digital distribution, viral spread, or online discourse. Supports the smaller
professional community that makes named peer review and personal scholarly correspondence plausible.

Affects all venue and dissemination design, world-building tone, NPC communication channels.

### 2.4 Deno Runtime

**Decision:** The project runtime is Deno, not Node. Node-specific tooling should be stripped.

Affects all technical architecture decisions.

### 2.5 Objective/Subjective Reconceptualisation

**Decision:** The objective/subjective split refers to _epistemic status_, not to origin or
location.

- **Objective World State** — everything that concretely exists: artefacts, documents (player and
  NPC), venues, scholars, sites, career events, the lineage graph. Properties have varying
  visibility levels (observable, inferable, occluded, engine-internal). Modern-world objects are
  objective regardless of who created them. A player's published monograph is as objective as an
  excavated blade.
- **Subjective State** — an epistemic agent's interpretive model: claims about the world built from
  incomplete information. One per agent. At MVP only the player's is actively maintained; NPC
  subjective states are generated statically at corpus creation. The subjective layer contains
  _only_ interpretation, never concrete objects.

**Key consequences:**

- Documents, career events, and the lineage graph are objective (they exist), even though they may
  _contain_ subjective claims (commitments within documents are interpretive).
- NPCs have subjective states (their calibrated errors, methodological commitments, review
  tendencies). These are interpretive models, not objective facts about the world.
- Institutions may eventually have emergent subjective states composed from constituent agents
  (deferred, see 1.3).
- Contradiction detection compares any agent's interpretation against world state properties, not
  "subjective vs objective" as monolithic stores.

Affects all design documents. See doc 12 for propagation status.

### 2.6 Agent-Generic Interpretation Principle

**Decision:** Engine-level functions are agent-agnostic. Only the UI and store layers treat the
player as special.

- Engine functions (lens calculation, contradiction detection, commitment evaluation) accept an
  interpretive model as a parameter, never reaching for a singleton player store.
- Data shapes are agent-generic: an `InterpretiveModel` has an `agentId` and a collection of claims.
  The player's model and an NPC's model share the same interface.
- At MVP, the player's model is mutable and persistent while NPC models are generated and static.
  Post-MVP, all agents' models evolve — the distinction becomes one of control (player-driven vs
  engine-driven), not mutability.
- NPC subjective states already exist in disguise: calibrated errors (doc 05), review tendencies
  (doc 07), and methodological commitments are NPC interpretation and should be structured as
  interpretive model properties.

Affects doc 08 (store architecture, engine function signatures), doc 05 (corpus generation), doc 06
(knowledge model), doc 07 (NPC framework).

### 2.7 Property Visibility Model

**Decision:** World state properties have four visibility levels rather than a binary hidden/visible
split.

- **Observable** — directly available upon encountering the object. Material composition, NPC
  published work, venue submission requirements.
- **Inferable** — derivable from observable properties through reasoning. Shared material
  preferences suggesting cultural links, NPC methodological tendencies deduced from publication
  patterns.
- **Occluded** — definite property, hidden from all agents. True culture assignments, true artefact
  functions, NPC internal weights. Drives generation and contradiction detection. Agents can
  approach these through accumulated inference but never directly verify.
- **Engine-internal** — exists purely for generation mechanics with no in-world meaning. PRNG seeds,
  constraint satisfaction flags, pipeline metadata.

The lens operates on the gap between observable/inferable properties and the player's
interpretation. Contradictions fire when interpretation diverges from occluded properties.

Affects doc 05 (which properties are generated at which visibility), doc 06 (contradiction detection
sources), doc 04 (lens input specification), doc 08 (type system).

### 2.8 Time/Action Economy (#39: Wb Xb Yac Za)

**Decision:** Game time uses discrete **academic terms** (4 per year, ~120 over a 30-year career)
with a dual-resource economy of **time** and **energy**, supporting **concurrent** player activities
within a single time continuum. An **absolute week counter** serves as the canonical timestamp
across the entire career.

**Model classification:** Wb Xb Yac Za — concurrent actions (Wb), discrete time blocks (Xb), dual
cost of time plus a depletable/replenishable internal resource (Yac), single time continuum (Za).
Derived from a systematic four-axis analysis of 40 possible time/action economy combinations.

**Structural definition:**

- **Terms** are the macro time unit. 4 per year: autumn, spring, summer-teaching, summer-research.
  Each term has a fixed time capacity of 12 weeks (48 modelled weeks per year; the remaining 4 weeks
  are implicit transition/holiday, never modelled). Term boundaries are the tick point for macro
  events: peer review outcomes, NPC activity, perception decay, career advancement checks, energy
  replenishment.
- **The summer-research term** has no teaching background drain. This creates a strategically
  distinct season — effectively a quarter of the year where the player has a higher effective energy
  budget. Fieldwork, concentrated writing, and conference attendance naturally cluster here, not
  because the game forces it but because the economics favour it. The annual rhythm of constrained
  teaching terms followed by an expansive research term is a core part of the academic experience
  the game simulates.
- **Absolute weeks** are the canonical timestamp. The counter starts at 0 and never resets across
  the entire career. All background processes (peer review lead times, dissemination transitions,
  reputational lag) use absolute weeks, so a process starting in week 8 of one term resolves
  naturally in week 3 of the next without special boundary logic. Within-term position is derived on
  demand.
- **Time within a term** is spent by activities. Activities have durations in weeks. Multiple
  activities can occupy overlapping time windows (concurrency). When the term's 12 weeks are
  allocated, the term ends.
- **Energy** is a depletable internal resource (capacity TBD — see deferred sub-questions).
  Activities drain energy at varying rates. Energy partially replenishes between terms; the degree
  of replenishment depends on the preceding term's demands. Work done at low energy is lower
  quality. Energy carry-over across terms creates long-arc consequences: sustained overwork
  accumulates into burnout; light terms allow recovery.
- **Concurrency** is the norm. Teaching runs as a background drain for teaching terms. Research,
  writing, and inspection run alongside it. Papers under review are passive (zero player cost,
  resolve at term boundaries via absolute week comparison). The player can have multiple active
  tasks competing for energy within shared time windows.
- **Term-conditional drains.** Each background drain specifies which term types it applies to.
  Teaching load applies to autumn, spring, and summer-teaching but not summer-research. Admin and
  editorial duties apply year-round. This is evaluated at each term start when calculating the
  effective energy budget.
- **Career stage affects the energy landscape.** Junior researchers have low background drain
  (minimal teaching, no admin), leaving most energy for research. Senior roles have higher
  background drains (teaching load, supervision, administration), creating tighter energy budgets
  for discretionary research. Sabbaticals remove background drains entirely, producing rare
  high-capacity terms.

**Key mechanical properties:**

- Energy is the binding constraint more often than time. A player can _fit_ five activities into a
  term's time but not afford the energy cost of doing all five well.
- Low-energy work has consequences that feed back into existing systems: weaker commitment strength
  in documents, higher chance of errors that become future contradictions, lower form
  classification, lower venue acceptance probability.
- Fieldwork and other location-exclusive activities impose concurrency constraints (can't teach
  while in the field) as a natural consequence of physical absence, not as an arbitrary rule.
- Crises and externally-imposed events (peer challenges, student issues, review deadlines) arrive
  regardless of the player's planned activity schedule, competing for the same energy pool.
- Multi-term commitments (extended fieldwork, major writing projects) are possible and create
  genuine career trade-offs: prolonged absence from the professional world while the macro clock
  continues ticking.

**Rationale:** The model was stress-tested against seven scenarios (inspection cascade, publication
grind, crisis term, long fieldwork, career transition, sabbatical, slow burnout) and handled all of
them. The dual-resource system creates meaningfully different constraints — time limits what can
overlap, energy limits how much can happen. Concurrency makes academic life feel like academic life.
Discrete terms give clean world-advancement points. Energy carry-over creates emergent long-arc
narratives about burnout and recovery.

**Resolved implementation sub-questions:**

4. **Time granularity within terms.** → **Locked: explicit week tracking with absolute week
   counter.** Terms have 12 weeks of capacity (4 terms × 12 weeks = 48 modelled weeks per year).
   Activities consume weeks. Concurrent activities overlap in time but compete for energy. An
   absolute week counter (starting at 0, never resetting) is the canonical timestamp for all
   background processes — peer review, dissemination lead times, reputational lag — so cross-term
   processes resolve without special boundary logic. Within-term position is derived.
   Week-denominated durations already appear in docs 07 and 10.

**Deferred implementation sub-questions** (no architectural consequence; to be resolved during
implementation and playtesting):

1. **Energy scale.** What numeric range? 100 is legible; 1000 gives granularity. Every downstream
   system consumes energy as relative costs and threshold checks, not absolute values — the scale is
   a constant set once and tuned.
2. **Replenishment curve.** Linear recovery between terms? Diminishing returns? Dependent on the
   preceding term's activity profile? The `completeTerm()` orchestrator already has access to the
   preceding term's activity record; the shape of the function inside is encapsulated.
3. **Quality degradation curve.** Linear, threshold-based (fine above 60%, bad below 30%), or
   exponential decay? Downstream systems (doc 10 commitment strength, doc 04 lens accuracy, doc 06
   error probability) all accept a normalised quality factor (0–1); the energy→quality mapping is
   internal to the energy system.
4. **Passive energy drains from psychological pressure.** Do unresolved contradictions, pending
   crises, or institutional anxiety drain energy passively? The drain mechanism (doc 08
   `BackgroundDrain`) already exists; doc 06 already exposes `HypothesisStrain.strainScore` per
   hypothesis and `ContradictionQueue.reputationalPressure` per term. The interface points exist;
   wiring either is a one-liner when desired.

**Affects:** doc 04 (lens decay rates can now be specified per-term), doc 06 (contradiction
accumulation rates, revision timestamps), doc 07 (career activity durations, role advancement
pacing, teaching load as energy drain, sabbatical mechanics), doc 08 (store architecture — term
state, energy tracking), doc 10 (venue temporal properties, dissemination lead times, peer review
resolution timing).

---

### 2.9 Status-Tag Relativity (roadmap 2GN.80 + 2GN.77)

**Decision:** Tags asserting an artefact's standing among its culture's own output are scored
**relative to the producing culture-phase**; tags reading physical affordance stay **absolute**. The
boundary is drawn by the tag a rule awards, not by the feature its condition reads.

**The tag vocabulary is reorganised to carry this split directly.** `FunctionTag` (what an object
was FOR) and `ContextTag` (how it was USED) are replaced by `AbsoluteTag` and `RelativeTag`
(`src/lib/types/tags.ts`), with `ArtefactTag` as the union. The FOR/USED axis was not the axis that
governs anything: nothing branched on it, while the axis that decides whether a rule needs a
culture-phase baseline was left implicit and had to be recovered by inspection. One vocabulary now
answers the question the engine actually asks.

Ruled on jointly with 2GN.77, which asks the same question of materials. One question, two surfaces:
decoration and material value are both cultural judgements, and answering them separately risked two
incompatible answers.

**The problem.** Every threshold in `data/classification.ts` is an absolute constant, and 2GN.79's
durability testing measured them as strongly phase-sensitive: the applied-element rule fires on 4.3%
of output at `decorativeEmphasis` 0.1 and 48.1% at 1.0; 2.3% at `craftSpecialisation` 0.1 and 74.5%
at 1.0. So `elite` currently means "unusually decorated **in absolute terms**", which makes a
decorative culture read as composed almost entirely of elites and an austere one as having none. The
material side fails the same way from the other direction: a static `precious-metal` tag stamps
Earth's judgement onto a generated culture with abundant gold, while genuinely-scarce obsidian in a
culture with no volcanic geology reads ordinary.

Both are violations of **Simulation Honesty** (doc 02): the tag reports a property of the culture's
aesthetics rather than a real social distinction within it.

**The boundary: cut by tag, not by condition.** An artefact's physical affordances are objective —
an edge cuts, a heavy object is heavy, a pedestal base is a pedestal base — and these read the same
in any culture. Standing is a social judgement and only means anything against local norms.

The membership test for each vocabulary:

- **`AbsoluteTag`** (10 members) — could a scholar from any culture, shown only the object, reach
  this tag from its physical affordances alone? `weapon`, `tool`, `container`, `fastener`,
  `ornament`, `domestic`, `agricultural`, `maritime`, `trade-good`, `currency`.
- **`RelativeTag`** (11 members) — does the tag assert something about the artefact's standing among
  its culture's other output? `personal`, `communal`, `elite`, `utilitarian`, `ceremonial`,
  `everyday`, `military`, `artisanal`, `ritual`, `votive`, `funerary`.

Three placements are worth stating rather than leaving to inference:

- **`ritual`, `votive` and `funerary` are relative**, despite reading as purposes rather than
  registers. Each is an _inference from morphology or decorative excess_ about intent, not a
  recorded fact: what counts as elaborated beyond ordinary use, or as a burial deposit rather than a
  storage vessel, is a per-culture question. `DepositionType` (doc 05 §3.5) is the objective
  deposition axis and stays separate and absolute; these tags are the interpretive layer above it.
- **`ornament` is absolute.** It is awarded on morphology (`isWearable`, `perforation`, `ringGap`),
  never on decorative volume. "Is a wearable thing" is objective; "is a _lavish_ wearable thing" is
  `elite`, which is relative. ⚠️ `ExtractedFeatures.isWearable` is broader than the tag — it covers
  clothing and textile fittings as much as adornment. Nothing is misclassified today because the
  grammar rolls no clothing forms, but the rule keying it straight to `ornament` will over-fire once
  it does; splitting worn-for-display from worn-for-covering is the fix, not moving the tag.
- **`military` is relative while `weapon` is absolute.** An edge on a long body is objectively a
  weapon; whether it signals a warrior class depends on whether the culture has one. Rigid sheet
  reads armour in a stratified culture and roofing in a flat one.

**The relative basis selects 34 of the 43 shipped rules; only 9 award purely absolute tags.** This
is far wider than the decoration family, and the count is what recalibration (2GN.82) is sized
against. Read the vocabulary arrays in `types/tags.ts` for membership rather than any list of rule
indices — indices shift whenever the rule array is edited. `classification.test.ts` pins both
counts, so a rule edit that moves a rule across the boundary fails loudly.

The non-obvious inclusions, all of which a condition-side cut would have missed:

- The **thin-walled container** and **pedestal base** rules, whose conditions are purely physical
  but whose awards (`elite`, `ceremonial`) are standing claims. These are what forced the cut onto
  the award side in the first place.
- Their **siblings on the same physical axes**: the thick-walled and heavy-container rules award
  `utilitarian` off `wallThickness`/`massBand` exactly as the thin-walled rule awards `elite`.
  Leaving them absolute would reintroduce the incoherence the tag-side cut exists to avoid, on the
  same feature.
- The **slit and sealed container** rules, which award `votive`/`funerary` off opening morphology.
- The **perforation, ring-gap, sheet-flexibility, size-band and wearability** families, which award
  `personal`, `everyday`, `artisanal`, `communal` or `military` alongside their function tags.

Most rules award from both vocabularies at once, and that is expected: the sealed-container rule
awards `container` (absolute) alongside `votive` and `funerary` (relative) from one condition. The
basis is a property of each awarded tag, not of the rule. The any-decoration nudge awards only
`ornament` and so stays absolute and universal by design (doc 12 §2.24).

Cutting by tag rather than condition means the thin-walled and pedestal rules need per-culture
baselines for wall thickness and base type — data nothing currently models. Empirical calibration
(below) produces these for free, which is why the two decisions were taken together.

**Baselines are empirical, sampled per culture-phase at world generation.** A calibration pass runs
pipeline stages 1–7 for each culture-phase, collects the raw `ExtractedFeatures` distribution, and
derives percentile baselines which are cached in world state. There is no bootstrap circularity:
classification is the last pipeline stage and nothing upstream reads tags, so the dependency was
never mutual.

Chosen over a closed-form analytic estimate because the analytic form drifts silently whenever
`expandDecoration` changes — exactly the failure mode 2GN.79 spent a session correcting. Sampling is
always accurate to the generator that actually exists. Determinism holds: baselines derive from the
world seed, so the same seed reproduces the same baselines.

**Sample size: n=400 per culture-phase.** Measured, not assumed. Doc 12 §2.27's noise floor measured
a _fire rate_, which is a proportion; a baseline is a _percentile_, a different statistic with
noisier tails, so the n=100 knee could not be inherited. Re-measuring percentile stability across
five seed salts gives a worst-case relative spread of 20–28% at n=100, 8–17% at n=400, and 0–6% at
n=800 for p50/p75 with no further improvement above. n=400 is the knee.

**Percentiles interpolate; they do not snap to a value.** `appliedElementCount` takes only 9–16
distinct integer values (at `decorativeEmphasis` 0.1 the entire tail above 4 is 5.1% of output), so
a nearest-rank p90 flips between adjacent integers at any sample size — the granularity is in the
generator, not the sample. Baselines are therefore stored as fractional thresholds and rules compare
`value >= baseline`, so the cut point moves smoothly with the culture.

**`PhaseCharacteristics.society.stratification` becomes a live input.** Read by nothing today
despite doc 05 §3.2 commenting "Affects elite/utilitarian distribution". It gates how much `elite`
can exist at all: a low-stratification culture should produce few elite-tagged artefacts regardless
of how much it decorates, and a highly stratified one should show a real spread. Without it,
culture-relative normalisation would flatten every culture to an identical elite proportion, which
is its own falsehood — every society having exactly the same proportion of elites is no more true
than every society being entirely elite.

**Drift is measured against the preceding phase only.** Each phase carries its own baselines plus a
per-metric delta (magnitude and direction) against the phase immediately before it. There is no
culture-wide baseline spanning the whole timeline: time moves forward, so scoring an early-phase
artefact against an average that includes phases which had not yet happened is incoherent for a game
about inferring the past from partial evidence. A culture-wide average also erases the signal — a
culture growing steadily more lavish would have every phase read "normal" against it. The first
phase has no predecessor and its drift is null, not zero.

This makes "this culture grew steadily more lavish" and "this phase was an austere break"
distinguishable, which the lens and contradiction systems can later use directly: a scholar
misreading a phase boundary is precisely the class of error the game is about.

**Consequence: the rule condition contract widens.** `ClassificationRule.condition` is today
`(features: ExtractedFeatures) => boolean` (doc 12 §2.20's pure-function contract). It becomes
`(features: ExtractedFeatures, context: ClassificationContext) => boolean`, where the context
carries the culture-phase baselines. Rules remain pure functions of their inputs — purity survives,
only the signature widens. Chosen over pre-normalising into `ExtractedFeatures`, which would have
made `extractFeatures` depend on world context and broken its purity instead.

**Consequence: `MaterialTag`'s `precious-*` members are retired entirely.** _(Revised 2026-08-11 by
roadmap 2GN.78 — see below for what this replaced.)_ `precious-metal` and `precious-stone` are no
longer members of `MaterialTag`. Material-derived status comes from the material's situation in the
world, never from a catalogue tag. _(Formula restated 2026-08-25 by roadmap 2GN.143, doc 12 §2.55;
the original read "availability × cultural affinity × provenance × stratification".)_

> **Standing = f(availability⁻¹, cultural affinity, stratification).** Provenance is not a separate
> term: `MaterialAssignment.provenance.source` is a deterministic coarsening of the availability
> `level` (locally obtainable levels → `local`, reachable `trade-only` → `trade`), so availability
> already encodes it. Availability enters **inverted**: rare here means precious here, so
> `trade-only` and `scarce` push standing up and `abundant` pushes it down. Cultural affinity enters
> directly. `explainMaterialWeight().weight` is a _selection_ weight (how often the culture makes
> things from the material) and must not be used as the standing score, since its availability axis
> points the other way; compose standing from the components it returns (`level`,
> `culturalAffinity`) plus `PhaseCharacteristics.society.stratification`. The threshold is
> 2GN.27/2GN.68's to set. Provenance earns its own term only if trade flows ever carry distance or
> intensity. Full detail: `docs/spikes/2GN.143-provenance-in-material-standing.md`.

This ruling originally kept the two members "as material descriptors, not as classification inputs",
barring rules from reading them while leaving them to feed generation. 2GN.78 found that boundary
untenable: `precious-metal` does not describe physical character, it asserts social valuation, in a
vocabulary whose every other member names an observable material class. Keeping it out of
classification while it still gated `gilding` and skewed `culturalAffinityWeight` left the same
Earth-judgement stamp in the generator, one step removed.

Everything the tags were doing was already modelled elsewhere. Gilding's real requirement is
physical — a metal workable to leaf that will not tarnish — and
`metallurgy && formability >= 5 && oxidisation <= 3` reproduces the retired tag's pool exactly (gold
and silver; bronze and iron fail on oxidisation). The other five techniques naming a precious tag
listed it redundantly beside its class tag, so their candidate pools were unchanged by removal.
Scarcity lives in `GeologicalContext.materialAvailability`; a specific material's reachability lives
in a `MaterialFlow`'s `{ id }` selector (roadmap 2GN.112, doc 12 §2.41).

**The test for a new `MaterialTag` member is whether two cultures looking at the same material would
agree on it.** `metal` passes. `precious-metal` did not.

One expressive loss is accepted and recorded: `CulturalProfile.materialAffinities` is keyed by tag,
so a culture can no longer say "we prize gold specifically" — only "we prize metal". Whether the map
should support per-material entries alongside per-tag ones is an open design question, filed rather
than answered.

> **Superseded by §2.13 (2026-08-13).** That question is now answered: affinities are keyed by
> `MaterialSelector` and resolved most-specific-wins, so "we prize gold specifically" is expressible
> again. The loss recorded above was real when written and is kept as the record of why the selector
> was adopted; read §2.13 for what the field does now.

**Consequence: material baselines are keyed by culture-phase × region.** Geology is regional and
culture is not — nothing binds a culture to a single region — so a culture spanning two regions
faces different material availability in each. Decoration baselines need no region key; material
ones do.

> **Shaped by §2.9's own spike, roadmap 2GN.142 (2026-08-24).** This paragraph named the requirement
> but no type implemented it: `ClassificationContext` carried no region field, `bestRegionalLevel`
> (`engine/generation/materials.ts`) resolved availability across every region in the world rather
> than the ones a culture-phase actually occupies, and no `CulturePhase` had anywhere to state which
> regions it occupied. 2GN.142 ruled region a world/geology-level fact, referenced by a new
> `CulturePhase.geography.regions: string[]` (plural, for a phase spanning more than one region);
> `bestRegionalLevel` resolves against that occupied set rather than the whole world; and
> `ClassificationContext`/`CulturePhaseSample` carry a matching `geography.regions` occupied-region
> set. No rule reads the region directly — the only surface a rule touches is
> `ClassificationContext.exceeds`, so `ClassificationRule.condition`'s signature does not widen
> again. Production region is treated as a complete copy of deposition region
> (`Provenance.site.region`) for MVP, since every currently-authored world is single-region and the
> two are identical in practice; the types stay distinct for when trade/deposition modelling makes
> them diverge. Full reasoning and consequences: `docs/spikes/2GN.142-region-keyed-baselines.md`.

**Consequence: `FunctionTag`/`ContextTag` retire in favour of `AbsoluteTag`/`RelativeTag`.** ⚠️
Breaking type change, landed with this decision. `ArtefactTag` is the union and replaces every
`FunctionTag | ContextTag` site. Two fields widen from `FunctionTag[]` to `ArtefactTag[]`:
`NPCScholarSeed.specialisation` (a funerary-vessel specialist is as ordinary an academic identity as
a weapons specialist, and a scholar anchored to a relative tag is the more interesting case, since
their expertise rests on a culture-relative judgement they may be reading wrong) and
`DescriptionVariant.emphasis` (a variant framing an artefact as ceremonial is precisely the framing
the lens selects on). Neither had any populated data at the time of the change — every shipped
`emphasis` is empty and no scholars are seeded yet — so there was no migration; doing this after
Milestone 3 seeds scholars would have cost real work. `TAG_ORDER` becomes
`[...ABSOLUTE_TAGS, ...RELATIVE_TAGS]`; the ordering is arbitrary but must stay fixed, since
reordering churns every serialised map.

**Every threshold in `data/classification.ts` is provisional pending recalibration** (roadmap
2GN.82–85), since the numbers were all measured under the absolute reading this decision replaces.
Recalibration (2026-08-05, doc 12 §2.31) found this is nine thresholds, not all thirty-four
relative-award rules — the other twenty-five read categorical bands with no numeric threshold to
relativise, and are split to roadmap 2GN.97.

**Amendment (2026-08-05, doc 12 §2.31): a closed percentile ladder means some historically-measured
percentiles have no rung, and the nearest number is not automatically the right one.** This section
above states `ClassificationContext.exceeds(feature, percentile, value)` takes a `percentile`, but
does not say it must be a `PERCENTILE_LADDER` rung (`engine/statistics.ts`) —
`[0.25, 0.5, 0.75, 0.9,
0.95]`, closed so two rules asking "p75" ask the same question.
Recalibration found the exceptional- lavishness rule's absolute constant sat at ~p93, which is not a
rung: ~p93 was never a chosen percentile, only a description of where the constant happened to land.
Migrating it required choosing p90 or p95 by argument (the rule's own intent — an
unmistakably-exceptional tier, not merely an above-average one) rather than by nearest-number
arithmetic; doc 12 §2.31 has the full reasoning. The same closed-ladder problem, and the same
resolution, recurred for one other rule.

**Dependency:** the drift measure requires that phase attributes evolve continuously between
adjacent phases. Nothing currently enforces this — `CulturePhase.characteristics` is a free
`PhaseCharacteristics` per phase, and doc 05's coherence rules are all within-artefact (structural,
geological, decorative), none temporal. Culture generation is unbuilt (Milestone 3), so this is
recorded as a requirement on it rather than a defect: per-phase change must be bounded, with sharp
breaks as deliberate rare events rather than the default. Drift measured across incoherent phases
measures noise. Raised as roadmap task 3WS.21.

**Affects:** doc 05 (§3.2 stratification becomes live; §9.2's `FunctionTag`/`ContextTag` code block
is superseded by `AbsoluteTag`/`RelativeTag`), doc 08 (world state carries cached baselines;
`ClassificationContext` type), doc 12 (§2.20's pure-function contract amended; §2.22's tag sets
re-keyed to the new vocabulary; §2.31 recalibration findings). Roadmap: 2GN.80 and 2GN.77 resolved;
2GN.82 done (nine thresholds recalibrated); 2GN.83 done (raised §1.5, since resolved as §2.10);
2GN.85 inherits the vocabulary split rather than having to rule on it; 2GN.97 raised for the
twenty-five categorical relative-award rules 2GN.82 could not migrate; 3WS.21 raised for phase
continuity.

### 2.10 Decorative Volume Split from Execution Quality (roadmap 2GN.98)

**Decision:** Doc 05 §8.3's craft/emphasis-driven decorative-layering table is realised as two
independent mechanisms rather than one shared volume scalar: `decorationVolume` (how much decoration
appears) reads `aesthetics.decorativeEmphasis` alone; `DecorativeLayer.grade` (how well each layer
is executed) reads `society.craftSpecialisation` scaled by the selected technique's own execution
difficulty.

**The problem.** §2.9's relativisation removed `expandDecoration`'s fill constants' old anchor — an
absolute fire rate — without supplying a new one, so recalibrating them (roadmap 2GN.83) needed a
calibration target. Doc 05 §8.3's four-corner table was the only stated one, and it proved
unsatisfiable by a single volume scalar over `(craftSpecialisation, decorativeEmphasis)`: measured
directly, the table's two middle corners ("high craft, low emphasis: 0–1 layers but technically
refined" vs "low craft, high emphasis: 1 layer, simple techniques") differ by **kind**, not
magnitude, which no shared fill-probability term can express — pulling one corner toward its target
necessarily pushes the other away, and every symmetric or asymmetric formula tried collapsed the two
together or overshot. Full measurement trail: doc 12 §2.32 (the original negative result) and §2.33
(this decision's own measurement).

**Two cheaper shapes were tried and rejected before this one.** First, biasing
`computeTechniqueWeight`'s technique selection toward low-difficulty techniques at low craft:
measured real and directional (~30% low-difficulty share at low craft vs ~15–19% at high craft) but
capped, since the other three factors already in that function's weight product dominate selection
and can't be out-weighted without defeating their own purpose. Second, a `grade` field set to
`craftSpecialisation` alone: cleanly orthogonal to volume, but degenerate as a sampled feature —
every layer on every artefact from one culture-phase received the identical value, so a percentile
ladder over it never varies within a cell.

**What was built instead.** `grade` is driven by which technique was selected and how hard it is to
execute well, via a new authored per-technique difficulty rating (`TECHNIQUE_DIFFICULTY`,
`src/lib/data/decorations.ts`, sixteen values reviewed per-item against how each craft actually
works — training time, error tolerance, hand-skill demand — not derived from the catalogue's other
flags) combined with `craftSpecialisation`:
`grade = craft × (1 − 0.5×difficulty) +
0.5×difficulty×craft²`, so a hard technique's realised grade
degrades faster than an easy one's as craft falls. This produces genuine within-culture-phase
variance (driven by which mix of techniques an artefact happened to roll), making
`meanDecorativeGrade` (`ExtractedFeatures`) a legitimate sampled `BaselineFeature` a classification
rule can read.

**Consequence: `craftSpecialisation`'s "double-counting" of decorative volume, which 2GN.83 flagged
as a concrete defect, is resolved by re-scoping rather than patching.** Under the old blend, craft
drove volume twice — once directly, once via `partCount`. Once volume reads emphasis only, craft has
exactly two decorative-adjacent effects: `partCount` (structural, via `deriveComplexityBudget`,
unaffected by this decision) and `grade` (execution quality, new). Two non-overlapping effects of
one attribute is not double-counting; the original framing measured a shared scalar that no longer
exists once volume stops reading craft at all.

**Consequence: `appliedElementPresent`'s saturation is confirmed structural, not a side effect of
this split.** Measured before and after: 89–100% under the old blend, 86–100% under the
emphasis-only reading — materially unchanged, confirming the saturation comes from
`MAX_SLOTS_PER_CATEGORY`'s per-category-per-component slot structure (§8.2), not from how volume or
refinement are weighted. Left out of scope here, as it was when first diagnosed (roadmap 2GN.79, doc
12 §2.25).

**Affects:** doc 05 (§8.3 gains an implementation note; §9.1's `ExtractedFeatures` block gains
`meanDecorativeGrade`), doc 12 (§2.32 records why 2GN.83 could not proceed as an implementation;
§2.33 records this decision's full measurement). Roadmap: 2GN.98 done (recalibrated
`BASE_FILL_PROBABILITY`/`SLOT_DECAY`/`MAX_SLOTS_PER_CATEGORY` unchanged against the new volume term;
added the `meanDecorativeGrade` classification rule; re-recorded every calibration guard the split
moved).

---

### 2.11 Artefact Orientation and Proportional Blade Banding (roadmap 2GN.108)

**Decision:** The generator **does** express short-bodied edged tools (scraper, chisel, small adze).
`bladeLengthBand` is re-based on **grip-to-edge proportion** rather than absolute centimetres, and
normalisation **orients** each artefact by reversal so the working end sits at a canonical pole.

**The grounds are tag-space variety, not archaeological completeness.** The missing shapes are not
uniformly distributed across the tag space: short-bodied edged tools occupy the working/craft/
domestic region, so their absence does not thin the corpus evenly. It removes one region, leaving
edged artefacts skewed towards blade-family readings (dagger, utility knife, weapon) because a
long-axis edged form is the only edged form the generator can produce. That skew propagates into
culture tag profiles, and since the lens feeds on tag co-occurrence (doc 04), it surfaces as
repetition in the **core mechanic** rather than as a missing artefact type.

⚠️ §2.9's culture-relative baselines cannot compensate. They sample the same narrowed distribution,
so relativity cannot restore variety that was never generated — the narrowing happens upstream of
the machinery designed to produce variety.

**The quantity was miscast.** Absolute blade length cannot distinguish the forms in question: a
scraper is edge-dominant and short, a dagger edge-dominant and long, a hafted adze a long body with
a short edge. What separates them is the span between the edged component and where a hand would
hold it. `bladeLengthBand` and `primaryAxisLength` both read `SHORT_MEDIUM_LONG_CM`, which is why
2GN.87 measured their joint distribution as a strict triangle where blade never exceeds axis — a
symptom of measuring the wrong thing, not the defect itself.

**No role vocabulary is required.** `NormalisedArtefact.attachments` is a populated from/to
component graph and `NormalisedComponent` carries `position` plus derivable extents, so grip-to-edge
span is a traversal over structure that already exists. The three grip/rigidity proxies in
`data/plausibility.ts` never used the graph they had. Note that doc 05's `arrangementGroup` is
repetition structure (`symmetric`, `radial`, `linear-array`), unrelated to role, and the
`'grip-system'`/`'head-system'` strings in `types/interpretation.ts` are JSDoc illustration rather
than a defined type — a role vocabulary would be genuinely new. Whether to build one is ruled
separately at 2GN.116.

**Orientation is by reversal, not rejection.** `position` is documented as ordering along the
primary axis and intended to carry a shared direction across artefacts, but `grammar.ts` mints it as
a depth-first traversal index reflecting grammar expansion, so a blade can land at position 0 with
its haft after it and nothing corrects it. Canonicalising by reversal makes the invariant true by
construction; rejecting mis-oriented artefacts would spend re-expansion budget (2GN.16) enforcing
probabilistically what construction can guarantee, and would discard roughly half of otherwise-valid
two-part edged forms — a mirrored artefact carries no information, being the same artefact described
backwards.

**Deferred:** the general working-end definition (2GN.115). For edged forms the working end is the
edge; for a vessel, disc, ring or pin there may be no functional pole at all, so whether orientation
is total or partial by design is ruled there. ⚠️ 2GN.115 blocks **implementation**, not this
decision: reversal cannot be implemented for edged forms and retrofitted to a different general
convention without repeating the recalibration sweep.

**Affects:** doc 05 (§6.1's `position` gains an orientation contract; `bladeLengthBand`'s derivation
changes), doc 12 (§2.43 records the full reasoning). Roadmap: 2GN.108 ruled; implementation at
2GN.117 (blocked on 2GN.115); 2GN.116 filed for component roles, now blocking 2GN.13/2GN.14. The
ruling makes **2GN.109 live** — it was contingent, void only if the form had been ruled out of
scope. ⚠️ Recalibration is set-wide and shared with 2GN.67, 2GN.69 and 2GN.109; sequence the sweep
once across the group. Full detail: `docs/spikes/2GN.108-short-bodied-edged-tools.md`.

---

### 2.12 Categorical Rules Need Conditions, Not Baselines (roadmap 2GN.97)

**Decision:** A classification rule awarding a `RelativeTag` does **not** automatically require a
culture-phase baseline. Of the 24 rules 2GN.82 could not migrate, a baseline is the right answer for
none of them. The rules divide into five groups with different defects.

**§2.9's boundary is confirmed and clarified.** The absolute/relative cut is drawn by the tag a rule
awards, and that determines whether the rule's _claim_ is culture-relative. It does not follow that
every such rule needs a sampled baseline: where the condition reads a morphological fact that
determines the tag (a closed ring was worn; a flexible sheet covered something), the rule stands
unchanged. Roughly 10 of the 24 are of this kind.

**Two rules are unrelativisable, because there is no quantity to relativise.**
`vessel-thin-walled-fine-ware` and `vessel-thick-walled-utilitarian` read `wallThickness`, which the
grammar rolls as a three-value ordinal with no continuous value beneath it. A prevalence baseline
counts band frequencies, which say nothing about actual thickness — a culture whose walls are all
3mm and one whose walls are all 30mm both read "100% thin" depending only on where the global cut
falls. ⚠️ **One culture's thick may be physically thinner than another's thin, and no baseline of
any kind recovers that.** The two rules stay absolute, blocked with reason, until thickness is a
modelled quantity (2GN.120). Fourth instance of the band-computed-from-an-absolute-table family
after §2.9's siblings 2GN.86, 2GN.87 and 2GN.108.

**Two rules are under-conditioned rather than unrelativised.** `baseType` _is_ a genuine categorical
— unlike `wallThickness`, nothing continuous is crushed beneath it, and prevalence would be a
meaningful number. It is still the wrong answer, because **a base is a relation between the base and
what it supports**: a pedestal under a statue and a pedestal under a hat-stand carry opposite
readings from an identical `baseType`, and the difference is not cultural, so no relativisation
separates them. A rule reading one term of a two-term relation discards the term carrying the
meaning (doc 02, Simulation Honesty).

**The general finding, which crosses this section's own boundary.** Measured across all 43 shipped
rules: 10 of the 24 condition on exactly one property, 7 more on two properties of the same
component, and exactly one is genuinely relational. `NormalisedArtefact.attachments` and
`NormalisedComponent.position` are populated and read by no rule at all. ⚠️ This is orthogonal to
the absolute/relative cut — `perforation-central-rotation` awards `tool`, an `AbsoluteTag`, and is
under-conditioned identically — so it is a property of how conditions are written, not of which
vocabulary they award from. Ruled at 2GN.119, scoped to all 43 rules.

**Also recorded:** `precious-materials-in-decoration` is dormant, not unmigrated — the feature is
hardcoded `false` pending motif→culture and layer-material wiring (2GN.78 fallout), so the rule
cannot fire. Once derived it is culture-relative against regional scarcity per §2.9's material half
(2GN.77), reading the keyspace 2GN.110 rules.

**Affects:** doc 12 (§2.44 records the measurements). Roadmap: 2GN.97 ruled, unblocking 2GN.72;
2GN.119 (relational conditioning, all 43 rules), 2GN.120 (derived wall thickness) and 2GN.118
(primitive value-set audit) filed. Full detail:
`docs/spikes/2GN.97-categorical-relative-award-rules.md`.

---

### 2.13 Per-Material Cultural Affinities (roadmap 2GN.110)

**Decision:** `CulturalProfile.materialAffinities` is keyed by **`MaterialSelector`**, the same
tagged union `MaterialFlow` uses (2GN.112), so a culture may state an affinity for a whole material
class or for one named material. Where both apply, **most-specific-wins**: a class entry sets a
default and a specific entry is an exception to it.

`{ tag: 'metal' }: 1.5` with `{ id: 'gold' }: 0.8` reads as **"all metals are 1.5, except gold,
which is 0.8"**. A specific entry with no class entry is well-formed: `{ id: 'gold' }: 1.2` alone
reads gold at 1.2 and every other metal at the neutral `1` — the shape that recovers the intent
2GN.78 dropped from Thalassar, which meant "we favour gold and silver" and had no way to say it.

**Why the tagged union rather than a bare string.** `bone`, `glass` and `leather` each name both a
`MaterialTag` and a `MaterialName`, so a `MaterialTag | MaterialName` union cannot distinguish the
class from the material, and resolving by precedence would make three of sixteen materials
unselectable by one of their two readings. Same reason as §2.9's material half, same solution as the
flows.

**This closes an open reduction question.** `culturalAffinityWeight` reduces across a material's
tags with `max`, and its JSDoc flagged the reduction as unruled pending a genuine multi-tag
material. Per-material entries make the multi-value case arrive immediately (gold carries both
`{ tag: 'metal'
}` and `{ id: 'gold' }`), and `max` is already known wrong for it: 2GN.84 measured
the max _discarding_ authored values whenever the class tag scored higher, so ⚠️ **a specific entry
could only ever raise a material, never lower it** — the one-directional behaviour that helped
retire the `precious-*` tags in the first place. `decoration.ts`'s `bestMaterialAffinity` inlines
the same reduction and moves with it.

⚠️ **The tag-versus-tag tie stays unruled.** If a material ever carries two _class_ tags,
most-specific-wins has no tiebreak. No shipped material does, and authoring a rule for a shape that
does not exist is the defect 2GN.87 punished.

⚠️ **`effectiveOptionWeight` (`grammar.ts`) does not participate**, and this is not an inconsistency
to reconcile later. It weights grammar options by `culturalModifiers`, which are keyed by tag, and
it runs at stage 4 — materials are not assigned until stage 6, so it never sees a material. Its
`?? 0` default also differs deliberately from the other consumers' `?? 1`.

**The boundary the loss raised.** A per-material affinity is a culture's judgement about a material,
which is legitimate under §2.9's material half precisely because it is _that culture's_ opinion. The
retired `precious-*` tags were different in kind: they lived in `data/materials.ts` as a property of
the material itself, stamping one judgement onto every culture in every world. **The test is where
the statement lives, not how specific it is** — `CulturalProfile` may name a single material freely;
`MaterialDefinition` may not encode standing at all. Specificity was never the problem; universality
was.

**Affects:** doc 05 §3.3 (`materialAffinities`' shape and the resolution rule), doc 12 (§2.45
records the reasoning). Roadmap: 2GN.110 ruled; implementation re-keys the map, replaces the `max`
reduction in `materials.ts` and `decoration.ts` together, and re-authors the four Explorer presets.
Full detail: `docs/spikes/2GN.110-per-material-affinities.md`.

---

### 2.14 Per-State Physical Properties (roadmap 2GN.111)

**Decision:** `physicalProperties` carries per-state values on **`rigidity` alone**
(`{ worked, finished }`). Every other axis stays scalar, each pinned to a documented state. Two
states, not three.

| Axis                                          | Convention                                          |
| --------------------------------------------- | --------------------------------------------------- |
| `rigidity`                                    | **per-state** — `{ worked, finished }`              |
| `formability`                                 | working (already correct, 2GN.102)                  |
| `fragility`                                   | working — ⚠️ currently authored finished, corrected |
| `hardness`                                    | working — ⚠️ currently authored finished, corrected |
| `grainFineness`, `porosity`, `combustibility` | state-independent, documented as such               |

**The consumers are the fault line, not the physics.** Three axes vary strongly by state and one
marginally, but what decides the shape is which state each _reader_ needs. `relief`
(`formability >= 3`) and wire-drawing (`formability >= 5`) ask working-state questions; the three
`rigidity >= 3` gates on `overlay`, `studs` and `gilding` ask a finished-state question (will the
object hold the decoration); `computeLayerGrade` reads its six difficulty axes in the working state,
because difficulty is incurred while working.

**Bronze is the case that decides it.** Whether bronze can be forged into a raised form and whether
the finished object still holds applied leaf are both true statements, they are different numbers,
and no single convention serves both — pinning to working state breaks the rigidity gates, pinning
to finished breaks `relief`. Only `rigidity` is asked in both states by different consumers, so only
`rigidity` gets the extra shape.

**A blanket per-state model was rejected** as authoring 16 × 7 × 3 = 336 values to capture variation
in four axes, with the three state-independent axes carrying three identical numbers each. ⚠️ It
also invites false precision: an author given three boxes fills all three, inventing distinctions
that do not exist — the failure mode 2GN.87 punished on the classification side. `raw` was rejected
for the same reason: no consumer asks a question about an unworked material.

⚠️ **`fragility` and `hardness` are a live defect, not a modelling preference.** Both feed
`computeLayerGrade` and nothing else, so working state is the only correct reading, yet both are
authored finished-state today: glass carries `fragility: 7` (cold) while being decorated hot, and
fired clay `6` (fired) while being decorated wet. Both inflate execution difficulty for materials
worked in a far more forgiving state. The correction lands regardless of the shape change, and ⚠️
**shifts `meanDecorativeGrade`** for those materials, so the 2GN.79 calibration guard will flag it —
sequence the sweep with the other recalibration-bearing work.

**Affects:** doc 05 §7 (the property model's state conventions), doc 12 (§2.46 records the
measurements). Roadmap: 2GN.111 ruled; 2GN.105 **rescoped** — it was filed presupposing per-state
values on every axis and now audits a specific list (add the second `rigidity` value, re-author
`fragility` and `hardness` to working state, document the pinning on the remaining four). Full
detail: `docs/spikes/2GN.111-per-state-physical-properties.md`.

---

### 2.15 Silence in an Affinity Map Means Inaccessible (roadmap 2GN.127)

**Decision:** an absent entry in `CulturalProfile.materialAffinities` is legitimate **iff the
material is inaccessible to that culture** — `absent` locally with no `MaterialFlow` reaching it, or
unmodelled in that geology. A material the culture can obtain, locally or through trade, **must**
carry a matching entry. A **validator** enforces this at profile-construction time; it does not
throw during generation.

The general principle, binding on the affinity-map family as each member becomes live: **silence is
legitimate iff the thing is inaccessible, and accessibility must be derivable from the world
model.** A map with no derivable accessibility does not get a strictness rule invented for it.

**The problem it solves.** `culturalAffinityWeight` returns `1` for any unmatched material, so an
unauthored material was indistinguishable from one deliberately authored at exactly `1.0` —
"considered and indifferent" and "never considered" collapsed into the same reading. Xoconahtl's
`['clay', 1.0]` existed only to carry that distinction in a comment, which is precisely what the
type could not carry.

**Why not a sentinel or a `completeness` flag.** Both were offered by the brief and both are
unnecessary: absence is already derivable. `isAvailable(material, geology, trade)` answers "could
this culture ever have encountered this?", which is exactly the condition under which having no
attitude is credible. The distinction becomes a **validation** question rather than a syntax
question, and every authored profile keeps its shape. ⚠️ Throwing on all omission was rejected for a
stronger reason: it does not distinguish the two cases, it abolishes one — under it, no culture may
ever not have encountered a material.

**Class entries discharge the obligation.** `{ tag: 'stone' }: 1.4` states a position on flint,
granite and obsidian; most-specific-wins (§2.13) already treats it as each material's real weight.
Requiring per-material entries would destroy the terse authoring 2GN.110 built (khaltiris authors
two entries covering eight materials), make 2GN.124's widened catalogue a breaking change for every
culture, and produce fake exhaustiveness — an author given sixteen boxes fills twelve with `1.0`
unthinkingly, which is silence laundered as authorship, the failure mode §2.14 names on the
per-state side.

⚠️ **The obligation is one-directional.** Accessible ⟹ must be covered. Covered ⟹ nothing implied
about access. A culture may legitimately hold opinions about materials it cannot obtain, so a
`{ tag: 'metal' }: 1.5` entry covering a gold that no flow reaches is well-formed and silent. The
validator only ever reports the missing direction.

⚠️ **Unmodelled geology reads as inaccessible, not accessible.** `isAvailable`'s MVP lenience
returns `true` for a material with no geology entry, which read naively would make silence about it
throw — backwards, since an unmodelled material is the strongest case for "never encountered".
`scarcityWeight`'s JSDoc already treats `undefined` as a third state distinct from available/absent;
the validator does likewise.

**Scope.** Binds `materialAffinities` now, and within it the neutral-`1` default that
`culturalAffinityWeight` (`materials.ts`) applies. `contextWeights` and `siteTypeWeights` have **no
engine readers at all** and inherit when they get one — ruling strictness for a dormant map is the
defect 2GN.87 punished. `techniqueAffinities` inherits the principle but is deferred behind a prior
question: `materialAccessGate`'s substrate check requires `culturalAffinityWeight(...) > 1`, so a
material authored at exactly `1.0` fails it identically to one the culture cannot obtain — ⚠️ the
same ambivalent-versus-absent collapse this ruling eliminates, reappearing one layer down. Whether
affinity should gate substrate access at all is a separate ruling.

⚠️ **`effectiveOptionWeight` (`grammar.ts`) reads `materialAffinities` too, and is deliberately not
bound by this.** §2.13 records why it cannot consult a per-material entry even in principle (stage 4
weights grammar options; materials are not assigned until stage 6). The point here is narrower and
about the default rather than the keyspace: its lookup runs **tag→weight**, the reverse of the
resolver's material→weight, and its default is **`?? 0`**, not the resolver's neutral `1`. An
unmentioned tag contributes no adjustment to an additive weight, where `1` would silently shift
every option. Silence there is a different statement from silence in the resolver, so the validator
does not police it.

**Implemented (2GN.128, 2026-08-14).** The validator is `findAffinitySilenceViolations` /
`assertAffinitiesCoverAccessibleMaterials` in `engine/generation/cultureValidation.ts`, and the
enforcement point is **module load** in `data/explorer-cultures.ts` — for a hand-authored const
array, that is profile-construction time. All 31 violations are closed; the presets now author 7–12
entries each.

⚠️ **The rule is structurally inapplicable to world-less profiles, which is why engine fixtures need
no exemption.** Accessibility is derived from a geology and trade set, and `mockCulturalProfile`
carries neither, so the validator cannot be applied to it at all. The rule is not "a profile must be
exhaustive"; it is "a profile _paired with a world_ must cover what that world makes accessible".
Tests passing `{ materialAffinities: [] }` exercise the resolver's neutral default, which this
decision leaves untouched. Do not "complete" the rule by hooking it into the fixture.

⚠️ The three-state read needed no new export: `explainMaterialWeight` already returns `level` and
`available` separately, so accessibility is `level !== undefined && available`. The private region
helpers stayed private deliberately — doc 12 §2.50 records the divergence that argument rests on.

**Affects:** doc 05 §3.3 (`materialAffinities`' authoring contract), doc 12 (§2.49 records the
measurements, §2.50 the implementation). Roadmap: 2GN.127 ruled, 2GN.128 implemented — measured 31
violations against 8 legitimate silences, with khaltiris required to state a position on all sixteen
materials. The presets were re-authored to fit the rule, not the reverse: they exist to showcase the
engine. Full detail: `docs/spikes/2GN.127-affinity-silence.md`.

### 2.16 Primitive→Material Compatibility Table (roadmap 2GN.10)

**Decision:** `NormalisedComponent.allowedMaterialTags` is derived per component from
`PRIMITIVE_MATERIAL_TAGS` (`engine/generation/grammar.ts`), an 8-primitive base table plus one
property-narrowing rule, ruled with Jason one primitive at a time (per-item sign-off, not authored
in bulk) on 2026-08-20:

| Primitive                            | Allowed `MaterialTag`s            | Source                                                                                                            |
| ------------------------------------ | --------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `elongated` (unedged)                | `metal, stone, bone, wood, fiber` | Ruled — fibre kept for cord/plaited or fibre-wrapped composite shafts, not just rigid stock                       |
| `elongated` + `edge: single\|double` | `metal, stone`                    | Doc 05 §6.1, verbatim                                                                                             |
| `cylindrical`                        | `metal, wood, bone, clay, glass`  | Ruled — glass added for a blown-glass beaker, the same hollow-tubular affordance as `hollow-enclosed`             |
| `flat-broad`                         | `stone, metal, wood, bone, clay`  | Ruled — bone for a carved plaque, clay for a fired tablet/plaque form                                             |
| `hollow-enclosed`                    | `clay, metal, wood, stone, glass` | Doc 05 §6.1's four plus ruled `glass` for a blown/cast hollow vessel                                              |
| `ring-form`                          | `metal, fiber, bone, wood`        | Ruled — metal and bent/carved bone or wood hold a closed loop; fibre for cord/plaited loops                       |
| `disc-form`                          | `stone, metal, clay, bone`        | Ruled — no `glass`: mirrors were historically polished metal/stone, not glass, and whorls/weights are never glass |
| `bar-form`                           | `metal, wood, stone, bone, clay`  | Ruled — this table describes finished _artefacts_, not raw stock, so a fired-clay rod/awl body counts             |
| `sheet-form`                         | `metal, leather, fiber, wood`     | Ruled — all work thin and flex/wrap around a substrate                                                            |

The narrowing rule intersects rather than replaces: a component's final set is its primitive's base
set filtered down by any matching property rule, so a rule can only remove tags the base already
offered. `deriveAllowedMaterialTags` returns `[]` only for a primitive type it doesn't recognise —
the empty-means-no-constraint contract `assignMaterial` (doc 05 §7) already documented, now reserved
for the genuinely unmapped case rather than every component.

**Follow-up flagged, not ruled here:** `sheet-form`'s `metal`/`clay` membership should be revisited
once structure generation (buildings, not portable artefacts) is a real pipeline target — a
sheet-form facing on a _structure_ has different material logic than one on a portable object
(Jason, 2026-08-20).

**Calibration consequence.** Before this task, `allowedMaterialTags` was `[]` for every component
(the 2GN.8 stub), which made `assignMaterial`'s compatibility filter a no-op — every calibration pin
in `materials.calibration.test.ts` was measured against an unconstrained candidate pool. Landing
real per-component constraints redistributes weight even though geology continues to discriminate
normally: `metal` gained a path on all eight primitives and rose everywhere; `leather` is now
reachable only via `sheet-form` and collapsed everywhere it wasn't already low. Verified this was
genuine redistribution and not a fallback-tier defect (`assignMaterial`'s
`available → compatible → materials` empty-pool fallback) by instrumenting `available.length` across
the full 6-region × 600-artefact calibration sample: `0.00%` before and after the table landed, so
the fallback tier never fires and geology's per-material filtering stays intact throughout. All
region/tag shares, intra-tag splits and the provenance mix were re-measured and re-recorded, with
the mechanism annotated inline at each pin.

`SPREAD_FLOOR_MIN_TAGS` (the same file's cross-region geology-discrimination guard) dropped from 7/8
to 5/8: `fiber` and `leather` joined `glass` as tags whose cross-region spread is now
shape-bottlenecked rather than geology-driven — `leather` sits on exactly one of eight primitives
and `fiber` on three, so their reachability is gated by which component shape the grammar happens to
roll at least as much as by regional geology. Ruled with Jason as the correct response (rather than
widening the primitives to force a wider spread, which would have reopened the table ruling above).

**Affects:** doc 05 §6.1 (`allowedMaterialTags` derivation, now real rather than stubbed), doc 12
(propagation entry to be filed alongside this one). Roadmap: 2GN.10 implemented and ruled in one
session, no separate spike — the table's per-primitive reasoning is recorded here rather than in
`docs/spikes/`, since the ruling happened interactively against measured calibration output rather
than as a standalone spike investigation.

### 2.17 Primitive Parameter Value-Sets (roadmap 2GN.118)

**Decision (2026-08-13):** `PRIMITIVE_PARAMETERS` (`data/grammars/primitives.ts`, reproducing doc 05
§5.3) has seven shared-name parameters with disjoint per-primitive vocabularies. Ruled one by one:

| Parameter                        | Ruling                                                                                                                                                                                       |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `base`                           | Unions to `['flat', 'rounded', 'pointed', 'pedestal']` on both `cylindrical` and `hollow-enclosed`. The split made `base-pointed-amphora` unfireable on anything amphora-shaped              |
| `diameter`                       | Unifies to `small/medium/large`; the underlying derivation (ratio to length, not an absolute table) is 2GN.135's to rule and 2GN.120's to implement                                          |
| `opening`, `perforation`         | Deferred whole to 2GN.122. Neither is a vocabulary split: each is two axes (presence/count and aperture size; count and position) crushed into one field, and they may be one aperture model |
| `crossSection`, `shape`, `taper` | Stay as authored: genuinely different geometry under one name                                                                                                                                |

The extractor's primitive-type branch (`classification.ts`) stays as a marked seam: it can express
only impossible-versus-equally-likely, and per-primitive frequency has to return as weights
(2GN.121, M3). The two base rules keep their authored weights; `EXPECTED_FIRE_RATES` re-records once
at implementation. `bar-form`'s `taper: single-end` is not reversal-invariant, so it constrains
2GN.115's orientation ruling.

**Affects:** doc 05 §5.3 (vocabularies), `data/grammars/primitives.ts`, rules
`base-pedestal-display` and `base-pointed-amphora`. Roadmap: 2GN.118 done (no `src/` change; each
ruling lands in its own task). Full detail, including the seven-pair cross-tabulation and rejected
alternatives: `docs/spikes/2GN.118-primitive-parameter-value-sets.md`.

### 2.18 Naming Is the Surface of a Language Layer (roadmap 2GN.66)

**Decision (2026-08-15):** names for sites, cultures and scholars are synthesised from a generated
phonology, not drawn from authored fragment lists. Five rulings:

1. **Phonotactic synthesis, not word-lists.** Doc 01 already lists language documents and language
   evolution among mapped features; a name-only generator would be thrown away when tablets land.
2. **Phonology is generated per language** from the seeded PRNG: a universal core (`p t k m n s l`)
   plus probability-gated extras, with frequency-ranked selection (`pickRanked`, geometric dropoff)
   rather than uniform draws.
3. **A name is a segment list rendered at read time.** `Provenance.site.name` is a `NameForm`
   (phoneme ids + coining phase), not a string, so a site named early and met later under a drifted
   form is a genuine interpretive puzzle (pillar 1).
4. **Languages form a forest of families**, not one proto-language per world. Family count derives
   from culture count so N=2 stays sensible. Sound change is not built: sisters are identical today,
   stated rather than faked.
5. **Constrain combinations, never the vocabulary.** A 65-phoneme table with one-directional
   coherence prerequisites and phonotactic rules, so no inventory can be made unsatisfiable.

**Not modelled:** sound change, phase-evolved name forms, scholar naming conventions (one name per
scholar), orthography beyond one grapheme per phone.

**Affects:** doc 08 `data/names/`, `types/language.ts`,
`engine/world/{phonology,naming,syllable}.ts`. Roadmap: 2GN.66 done; follow-ons (sound change,
culture `languageId` binding, toponymy, Explorer phonology inspector) are listed in the spike, not
yet filed as tasks. Full detail, including the eight defects found by measurement and by reading
output, and the `the-tongue` prior-art table: `docs/spikes/2GN.66-naming-grammars.md`.

### 2.19 Plausibility Re-Expansion Cap: N = 20 (roadmap 2GN.137)

**Decision (2026-08-25):** the Stage 5 re-expansion loop (doc 05 §6.2, built by 2GN.16) retries up
to **20** times before throwing `PlausibilityExhaustedError`. Shipped as `MAX_PLAUSIBILITY_ATTEMPTS`
in `data/plausibility.ts`.

Measured, not guessed. Attempts are independent draws from one PRNG stream (empirically confirmed),
so per-artefact exhaustion is `p^N` for a cell's per-attempt failure rate `p`. The worst shipped
cell (xoconahtl) fails 43.3% of rolls; at N = 20 that is 5.4e-8 per artefact, about 3e-5 per
500-artefact career. The per-artefact tolerance adopted is 1e-6, which N = 20 keeps while `p` stays
under 0.5: `PLAUSIBILITY_FAILURE_CEILING = 0.5` is guarded per Explorer preset by
`plausibility.calibration.test.ts`, so a new rule that breaches it fails a test rather than eroding
the bound.

The high rate is itself a finding: the wrapped-join and rigid-shaft rules reject joins and head
placements `expandGrammar` rolls without reading `allowedMaterialTags`. Filed as 2GN.145 (grammar
consults the material constraint at roll time), separate because it moves every calibration pin.

**Affects:** doc 05 §6.2 and §14 ("N attempts" now has a value; "re-rolling is cheap" is true per
roll and the aggregate rate is recorded), `data/plausibility.ts`, 2GN.16. Full detail:
`docs/spikes/2GN.137-re-expansion-attempt-cap.md`.

### 2.20 Cultural Affinity Does Not Gate Substrate Access (roadmap 2GN.134)

**Decision (2026-08-25):** `materialAccessGate`'s substrate check
(`engine/generation/decoration.ts`) becomes
`isAvailable(material) && culturalAffinityWeight(material,
culture) > 0` for at least one material
passing the technique's substrate test. The `> 1` "favoured" requirement is removed; the `> 0` term
is not a preference threshold but the guard that an authored zero (never used) stays a hard gate.
This matches `hasIntroducedMaterialAccess`, the sibling check, which already gated on availability
alone with the reasoning written beside it.

Why: `materialAffinities` is a preference table, and §2.15 obliges cultures to state a preference
for every material they can reach. The gate read preference as access, so an authored `1.0`
(indifference) or `0.7` (mild dislike) suppressed a technique to 0.05× exactly as if the material
were unobtainable. Measured over 252 (culture, world, technique) pairs: 28 gated, every one over a
material the culture has. Affinity's proper effect is already realised upstream at
`assignMaterials`, where it weights which material a component gets; the gate applied it a second
time as a cliff. An authored 0 stays a hard gate, since `weightedSelect` treats 0 as never-assigned.

**Cost measured before ruling:** with the gate switched, no calibration pin leaves tolerance; one
unit test whose fixture tests the affinity gate rather than availability is rewritten, and R43's
regional-spread guard narrows from 4.0pp to 2.7pp against a 3pp floor (forestInterior stops being
the outlier), to be re-justified at implementation.

**Affects:** `engine/generation/decoration.ts`, `decoration.test.ts`, `calibration.test.ts` (R43
spread floor). Roadmap: 2GN.134 ruled; implementation folded into 2GN.129 alongside the
`techniqueAffinities` silence rule, so both share one recalibration pass. Full detail:
`docs/spikes/2GN.134-affinity-substrate-gate.md`.

### 2.21 Sublayer Generation Is a Separate Pass After Material Assignment (roadmap 2GN.132)

**Decision (2026-08-25):** decoration-on-decoration (`DecorativeLayer.sublayers`, doc 05 §8.3) is
produced by a separate pure pass over `expandDecoration`'s flat output, seeded from its own PRNG
stream (`${seed}-sublayers`), running after `assignMaterials` and `assignDecorativeDetails` and
before `gradeDecorativeLayers` and `enforceSubstrates`. The pass resolves each sublayer's parent
material for its own draw; those two consumers still resolve by `targetComponentId` until 2GN.133
(blocked on 2GN.31) makes them parent-aware, so that task is the sequenced follow-on rather than
optional polish. It is wired into the calibration harness and both Explorer sample paths in the same
PR that builds it (2GN.31), never shipped unwired. `expandDecoration`'s slot loop and draw sequence
are untouched.

Why: a sublayer's substrate is its parent layer (paint over gilding sits on gold; engraving on an
inlaid bone element cuts bone), so its material is known only once `assignMaterials` and
`assignDecorativeDetails` have run, both of which follow `expandDecoration` by design. A draw inside
the slot loop cannot gate substrate and would rely on `enforceSubstrates` to strip its mistakes. The
determinism cost the task feared for the in-loop shape was measured and found to be per-artefact
only: one extra draw per layer changed 1114 of 1200 seeds' output and moved no calibration pin, so
that axis never separated the options. Pins move when sublayers land under either placement, for the
real reason that `maxDepth` and `techniqueComplexity` change; they re-record once.

**Affects:** `engine/generation/decoration.ts` (new pass), `calibration.test.ts` and the Explorer
sample paths (wiring), `classification.test.ts`'s 2GN.31 regression guard (retired by that PR).
Roadmap: 2GN.132 ruled; 2GN.31 carries the implementation; depth cap remains 2GN.131's. Full detail:
`docs/spikes/2GN.132-sublayer-placement.md`.

### 2.22 Decorative Recursion Depth: Emphasis Drives the Chance, Craft Drives the Ceiling (roadmap 2GN.131)

**Decision (2026-08-25):** decoration-on-decoration depth (doc 05 §8.3, produced by 2GN.31's
sublayer pass, calibrated by 2GN.32) is governed by two levers, one per phase attribute, extending
§2.10's axis split to depth:

- **Chance.** A layer at depth `d` gains a sublayer with probability
  `BASE_SUBLAYER_PROBABILITY × decorationVolume(phase) × SUBLAYER_DECAY^(d−1)`, reading
  `aesthetics.decorativeEmphasis` through the same `decorationVolume` the slot loop uses.
- **Ceiling.** Depth never exceeds
  `1 + round(society.craftSpecialisation × (MAX_SUBLAYER_DEPTH − 1))` with `MAX_SUBLAYER_DEPTH = 3`
  (§8.3's "up to 3 layers deep"), so a low-craft culture cannot nest at all.

Why: §8.3's middle corners ("0–1 layers but technically refined" versus "1 layer, simple
techniques") force the assignment: craft caps depth, emphasis caps count. Simulated over real
`expandDecoration` output at the four corners (500 seeds each), the split reproduces all four in
kind and separates the middle two (skilled-austere: 7% reach depth 2; lavish-unskilled: never
nests). A product of the two attributes gives both middle corners 0.09 and collapses them, the same
failure §2.10 measured for volume. Constants (0.5, 0.5, `round`) are provisional: 85% of high/high
artefacts reach depth 3 at BASE 0.5, which 2GN.32 lowers against measured output.

**Affects:** `engine/generation/decoration.ts` (inside 2GN.31's pass), `types/world.ts`
`PhaseCharacteristics` JSDoc (corrected: craft no longer "raises the recursion cap" alone). Roadmap:
2GN.131 ruled; 2GN.32 scope narrows to calibrating the constants. Full detail:
`docs/spikes/2GN.131-recursion-depth-cap.md`.

---

_This document is a living registry. New questions and decisions should be added as they emerge
during specification work._
