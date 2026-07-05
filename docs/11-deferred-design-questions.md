# TWCB: Deferred Design Questions
*Cross-cutting concerns, unexplored design spaces, and locked-in decisions that emerged during specification*

---

## 1. Open Questions

These are unresolved design problems that affect multiple systems. Each needs dedicated discussion before the relevant systems can commit to implementation details.

Questions deferred to post-MVP development are tracked in doc 13 (Deferred Post-MVP Design Questions).

### ~~1.1 Game Time Units~~ → Resolved (see 2.8)

### ~~1.2 Alternative Dissemination Pathways~~ → Deferred to post-MVP (see doc 13, Section 1)

### ~~1.3 Emergent Schools of Thought~~ → Deferred to post-MVP (see doc 13, Section 2)

### ~~1.4 Publication Counts as Role Qualification~~ → Deferred to post-MVP (see doc 13, Section 3)

*No open questions remain for the current development round. All architectural blockers have been resolved.*

---

## 2. Locked-In Decisions

These emerged during specification discussions and have been resolved. Recorded here for reference and traceability.

### 2.1 Named Peer Review

**Decision:** Peer review in TWCB is **not anonymous**. Reviewers are named, and their assessment is a public professional act.

**Rationale:** This diverges from modern real-world convention but is consistent with the game's fictional setting (smaller professional community, no mass internet, more personal scholarly culture) and its core thesis (the observer always shapes the observation).

Named review makes reviewer bias visible and actionable, creates genuine NPC relationship consequences for critique, feeds the oracle problem (temptation to write for known reviewers), and is thematically consistent with the lens system. The player knows *who* reviewed them but must still infer *why* — shifting the interpretive challenge from identity to motivation.

Affects doc 07 (peer review as career mechanic, NPC relationships) and doc 10 (dissemination pipeline at the submitted → published transition).

### 2.2 Private Document Mutability

**Decision:** Documents in `private` dissemination state are mutable. The immutability principle activates when a document is first disseminated beyond `private`.

**Rationale:** Immutability serves social commitment — it captures the fact that once someone has seen your work, you can't unsee it for them. A private draft has no audience, no perception, no reliance. Forcing lineage nodes for every tweak to a private draft would generate graph noise for zero gameplay value.

Affects doc 10 (core principle, dissemination rules, DocumentNode interface).

### 2.3 No Mass Internet

**Decision:** The game's fictional "present day" setting is modern but without mass internet. Digital distribution, online journals, social media, and web-based communication do not exist in the game world.

**Rationale:** Keeps the venue landscape grounded in print, exhibition, and live event. Removes the need to model digital distribution, viral spread, or online discourse. Supports the smaller professional community that makes named peer review and personal scholarly correspondence plausible.

Affects all venue and dissemination design, world-building tone, NPC communication channels.

### 2.4 Deno Runtime

**Decision:** The project runtime is Deno, not Node. Node-specific tooling should be stripped.

Affects all technical architecture decisions.

### 2.5 Objective/Subjective Reconceptualisation

**Decision:** The objective/subjective split refers to *epistemic status*, not to origin or location.

- **Objective World State** — everything that concretely exists: artefacts, documents (player and NPC), venues, scholars, sites, career events, the lineage graph. Properties have varying visibility levels (observable, inferable, occluded, engine-internal). Modern-world objects are objective regardless of who created them. A player's published monograph is as objective as an excavated blade.
- **Subjective State** — an epistemic agent's interpretive model: claims about the world built from incomplete information. One per agent. At MVP only the player's is actively maintained; NPC subjective states are generated statically at corpus creation. The subjective layer contains *only* interpretation, never concrete objects.

**Key consequences:**
- Documents, career events, and the lineage graph are objective (they exist), even though they may *contain* subjective claims (commitments within documents are interpretive).
- NPCs have subjective states (their calibrated errors, methodological commitments, review tendencies). These are interpretive models, not objective facts about the world.
- Institutions may eventually have emergent subjective states composed from constituent agents (deferred, see 1.3).
- Contradiction detection compares any agent's interpretation against world state properties, not "subjective vs objective" as monolithic stores.

Affects all design documents. See doc 12 for propagation status.

### 2.6 Agent-Generic Interpretation Principle

**Decision:** Engine-level functions are agent-agnostic. Only the UI and store layers treat the player as special.

- Engine functions (lens calculation, contradiction detection, commitment evaluation) accept an interpretive model as a parameter, never reaching for a singleton player store.
- Data shapes are agent-generic: an `InterpretiveModel` has an `agentId` and a collection of claims. The player's model and an NPC's model share the same interface.
- At MVP, the player's model is mutable and persistent while NPC models are generated and static. Post-MVP, all agents' models evolve — the distinction becomes one of control (player-driven vs engine-driven), not mutability.
- NPC subjective states already exist in disguise: calibrated errors (doc 05), review tendencies (doc 07), and methodological commitments are NPC interpretation and should be structured as interpretive model properties.

Affects doc 08 (store architecture, engine function signatures), doc 05 (corpus generation), doc 06 (knowledge model), doc 07 (NPC framework).

### 2.7 Property Visibility Model

**Decision:** World state properties have four visibility levels rather than a binary hidden/visible split.

- **Observable** — directly available upon encountering the object. Material composition, NPC published work, venue submission requirements.
- **Inferable** — derivable from observable properties through reasoning. Shared material preferences suggesting cultural links, NPC methodological tendencies deduced from publication patterns.
- **Occluded** — definite property, hidden from all agents. True culture assignments, true artefact functions, NPC internal weights. Drives generation and contradiction detection. Agents can approach these through accumulated inference but never directly verify.
- **Engine-internal** — exists purely for generation mechanics with no in-world meaning. PRNG seeds, constraint satisfaction flags, pipeline metadata.

The lens operates on the gap between observable/inferable properties and the player's interpretation. Contradictions fire when interpretation diverges from occluded properties.

Affects doc 05 (which properties are generated at which visibility), doc 06 (contradiction detection sources), doc 04 (lens input specification), doc 08 (type system).

### 2.8 Time/Action Economy (#39: Wb Xb Yac Za)

**Decision:** Game time uses discrete **academic terms** (4 per year, ~120 over a 30-year career) with a dual-resource economy of **time** and **energy**, supporting **concurrent** player activities within a single time continuum. An **absolute week counter** serves as the canonical timestamp across the entire career.

**Model classification:** Wb Xb Yac Za — concurrent actions (Wb), discrete time blocks (Xb), dual cost of time plus a depletable/replenishable internal resource (Yac), single time continuum (Za). Derived from a systematic four-axis analysis of 40 possible time/action economy combinations.

**Structural definition:**

- **Terms** are the macro time unit. 4 per year: autumn, spring, summer-teaching, summer-research. Each term has a fixed time capacity of 12 weeks (48 modelled weeks per year; the remaining 4 weeks are implicit transition/holiday, never modelled). Term boundaries are the tick point for macro events: peer review outcomes, NPC activity, perception decay, career advancement checks, energy replenishment.
- **The summer-research term** has no teaching background drain. This creates a strategically distinct season — effectively a quarter of the year where the player has a higher effective energy budget. Fieldwork, concentrated writing, and conference attendance naturally cluster here, not because the game forces it but because the economics favour it. The annual rhythm of constrained teaching terms followed by an expansive research term is a core part of the academic experience the game simulates.
- **Absolute weeks** are the canonical timestamp. The counter starts at 0 and never resets across the entire career. All background processes (peer review lead times, dissemination transitions, reputational lag) use absolute weeks, so a process starting in week 8 of one term resolves naturally in week 3 of the next without special boundary logic. Within-term position is derived on demand.
- **Time within a term** is spent by activities. Activities have durations in weeks. Multiple activities can occupy overlapping time windows (concurrency). When the term's 12 weeks are allocated, the term ends.
- **Energy** is a depletable internal resource (capacity TBD — see deferred sub-questions). Activities drain energy at varying rates. Energy partially replenishes between terms; the degree of replenishment depends on the preceding term's demands. Work done at low energy is lower quality. Energy carry-over across terms creates long-arc consequences: sustained overwork accumulates into burnout; light terms allow recovery.
- **Concurrency** is the norm. Teaching runs as a background drain for teaching terms. Research, writing, and inspection run alongside it. Papers under review are passive (zero player cost, resolve at term boundaries via absolute week comparison). The player can have multiple active tasks competing for energy within shared time windows.
- **Term-conditional drains.** Each background drain specifies which term types it applies to. Teaching load applies to autumn, spring, and summer-teaching but not summer-research. Admin and editorial duties apply year-round. This is evaluated at each term start when calculating the effective energy budget.
- **Career stage affects the energy landscape.** Junior researchers have low background drain (minimal teaching, no admin), leaving most energy for research. Senior roles have higher background drains (teaching load, supervision, administration), creating tighter energy budgets for discretionary research. Sabbaticals remove background drains entirely, producing rare high-capacity terms.

**Key mechanical properties:**

- Energy is the binding constraint more often than time. A player can *fit* five activities into a term's time but not afford the energy cost of doing all five well.
- Low-energy work has consequences that feed back into existing systems: weaker commitment strength in documents, higher chance of errors that become future contradictions, lower form classification, lower venue acceptance probability.
- Fieldwork and other location-exclusive activities impose concurrency constraints (can't teach while in the field) as a natural consequence of physical absence, not as an arbitrary rule.
- Crises and externally-imposed events (peer challenges, student issues, review deadlines) arrive regardless of the player's planned activity schedule, competing for the same energy pool.
- Multi-term commitments (extended fieldwork, major writing projects) are possible and create genuine career trade-offs: prolonged absence from the professional world while the macro clock continues ticking.

**Rationale:** The model was stress-tested against seven scenarios (inspection cascade, publication grind, crisis term, long fieldwork, career transition, sabbatical, slow burnout) and handled all of them. The dual-resource system creates meaningfully different constraints — time limits what can overlap, energy limits how much can happen. Concurrency makes academic life feel like academic life. Discrete terms give clean world-advancement points. Energy carry-over creates emergent long-arc narratives about burnout and recovery.

**Resolved implementation sub-questions:**

4. **Time granularity within terms.** → **Locked: explicit week tracking with absolute week counter.** Terms have 12 weeks of capacity (4 terms × 12 weeks = 48 modelled weeks per year). Activities consume weeks. Concurrent activities overlap in time but compete for energy. An absolute week counter (starting at 0, never resetting) is the canonical timestamp for all background processes — peer review, dissemination lead times, reputational lag — so cross-term processes resolve without special boundary logic. Within-term position is derived. Week-denominated durations already appear in docs 07 and 10.

**Deferred implementation sub-questions** (no architectural consequence; to be resolved during implementation and playtesting):

1. **Energy scale.** What numeric range? 100 is legible; 1000 gives granularity. Every downstream system consumes energy as relative costs and threshold checks, not absolute values — the scale is a constant set once and tuned.
2. **Replenishment curve.** Linear recovery between terms? Diminishing returns? Dependent on the preceding term's activity profile? The `completeTerm()` orchestrator already has access to the preceding term's activity record; the shape of the function inside is encapsulated.
3. **Quality degradation curve.** Linear, threshold-based (fine above 60%, bad below 30%), or exponential decay? Downstream systems (doc 10 commitment strength, doc 04 lens accuracy, doc 06 error probability) all accept a normalised quality factor (0–1); the energy→quality mapping is internal to the energy system.
5. **Passive energy drains from psychological pressure.** Do unresolved contradictions, pending crises, or institutional anxiety drain energy passively? The drain mechanism (doc 08 `BackgroundDrain`) already exists; doc 06 already exposes `strainPressure` per-term. The interface point exists; wiring it is a one-liner when desired.

**Affects:** doc 04 (lens decay rates can now be specified per-term), doc 06 (contradiction accumulation rates, revision timestamps), doc 07 (career activity durations, role advancement pacing, teaching load as energy drain, sabbatical mechanics), doc 08 (store architecture — term state, energy tracking), doc 10 (venue temporal properties, dissemination lead times, peer review resolution timing).

---

*This document is a living registry. New questions and decisions should be added as they emerge during specification work.*
