# TWCB: Deferred Post-MVP Design Questions
*Features, systems, and design questions parked for future development rounds*

---

## How This Document Works

Doc 11 tracks questions and decisions relevant to the *current* development round. This document stores design questions and feature ideas that have been explicitly deferred to post-MVP. Each entry records the original question, why it was deferred, what architectural provisions (if any) exist to support future implementation, and any risks of the current MVP design boxing us in.

---

## 1. Alternative Dissemination Pathways

**Origin:** Doc 11, former Section 1.2 (2026-02-08)
**Deferred because:** The standard text-submission pipeline (private → circulated → submitted → published → collected) handles all core MVP mechanics. Alternative venue types are enrichment, not architecture.

### The Question

Not all venue types follow the standard submission model:

- **Exhibitions** are curated spatial events. The process is closer to proposal → commission → installation → opening. The audience encounter is situated, not sought.
- **Lectures** are live, temporal events. The document exists as notes beforehand but becomes "published" through delivery to a captive audience. Audience perception is shaped by delivery, not just content.
- **Conference proceedings** sit between: the presentation is a live event, but the written version enters a published collection. Two dissemination events from one intellectual act.
- **Museum catalogues** are tied to exhibitions but outlive them. The exhibition closes; the catalogue remains on shelves.

The core question is whether these are genuinely different pipelines or whether the standard pipeline can be generalised with venue-specific state labels.

### Architectural Provisions

The term-based temporal model (doc 11, Section 2.8) with explicit week tracking is now locked, so temporal parameters for alternative pathways can be specified whenever this work begins. `VenueTemporalProfile` (doc 10, Section 6.4) already supports venue-specific timing properties.

### MVP Risk Assessment

**Low-moderate risk.** The `DisseminationState` type (doc 10, Section 6.1) is a fixed union: `'private' | 'circulated' | 'presented' | 'submitted' | 'published' | 'collected'`. Alternative venues could be accommodated by either:

1. **Mapping** alternative stages onto existing states (exhibition "installation" → `'published'`). Semantic stretch, but no code change.
2. **Extending** the union with venue-specific states. Requires updating all code that switches on `DisseminationState` — manageable if kept in mind during MVP implementation.
3. **Generalising** to venue-type-specific state machines that share a common interface for career/reputation consequences. Most flexible, but largest refactor.

**Recommendation for MVP:** Treat `DisseminationState` as the standard academic pipeline. Avoid building switch statements or business logic that assumes these are the *only* possible states. If venue types are modelled during MVP, use a `venueCategory` field that can later govern which state machine applies.

**Affects:** doc 07 (career activities tied to venue types), doc 10 (dissemination state definitions and state machine logic).

---

## 2. Emergent Schools of Thought

**Origin:** Doc 11, former Section 1.3 (2026-02-08)
**Deferred because:** The agent-generic interpretive model already supports this as future emergence. Schools are an enrichment layer over individual NPC properties, not a structural requirement for the core loop.

### The Question

NPC scholars have individual methodological biases (structuralist, materialist, culturalist, etc.). There's an unexplored design space around **schools of thought as emergent groupings** — clusters of scholars who share methodological commitments, cite each other preferentially, review each other's work more favourably, and collectively resist challenges to their shared positions.

If schools emerge from NPC properties rather than being authored:

- The player would discover schools by observing citation patterns, review tendencies, and conference alignments — not by being told "this is the structuralist school."
- Aligning with a school provides career advantages (favourable reviewers, citation networks, venue access) at the cost of originality and intellectual independence.
- Challenging a school's consensus means facing coordinated resistance, not just individual disagreement.
- Schools could shift over time as NPC positions evolve, with generational turnover and paradigm shifts.
- The player's own work might inadvertently *found* a school if NPCs begin citing and extending their positions.

This connects to the oracle problem (doc 07, Section 6): following a school is a more sophisticated form of intellectual passivity than copying a single NPC, and harder to detect because the player feels like they're participating in a community rather than deferring to an authority.

### Architectural Provisions

The agent-generic `InterpretiveModel` (doc 11, Section 2.6) means every NPC scholar already has the same interpretive interface as the player. Clustering is an analysis layer over existing data — citation graphs, shared hypotheses, review tendencies — not a new data structure. The document lineage system (doc 10, Section 2) already tracks citation and derivation relationships that would form the raw data for school detection.

### MVP Risk Assessment

**No risk.** The agent-generic architecture deliberately leaves room for emergent groupings. Nothing in the MVP needs to change to support this later. The only consideration is ensuring NPC scholar generation (doc 05, Section 4.1) produces enough diversity in methodological biases that clustering is non-trivial — but this is a calibration concern, not an architectural one.

**Affects:** doc 05 (corpus generation — school membership as emergent property), doc 07 (career mechanics — school alignment effects), NPC framework (interaction patterns within and between schools).

---

## 3. Publication Quality Metrics for Role Qualification

**Origin:** Doc 11, former Section 1.4 (2026-02-08)
**Deferred because:** The current model (flat publication count + optional venue prestige threshold) is functional for MVP. The questions raised are playtesting concerns about career pacing and incentive structures, not architectural blockers.

### The Question

Doc 07 Section 4.2 uses `publishedDocuments` (a flat count of documents at `published` state or beyond) as a role advancement requirement. This is potentially reductive — a scholar with three transformative publications can outrank one with fifteen routine ones. The current model partially addresses this through reputation dimensions (rigour, originality, etc.), but the publication count itself is a blunt instrument.

Questions to resolve post-MVP:

- Should publication count remain as a hard gate, or should it be replaced by a weighted quality metric (factoring in venue prestige, form classification, citation count, contradiction survival)?
- If counts remain, should they distinguish between form labels? (A monograph might count for more than a research note.)
- Should the system track "significant publications" — a computed subset based on impact — rather than raw totals?
- Is there a risk that arbitrary thresholds (2 for junior lecturer, 15 for professor) create perverse incentives to publish thin work for the count rather than substantial work for the impact?

### Architectural Provisions

The `RoleRequirements` interface (doc 07, Section 4.2) already has fields for both `publishedDocuments` (count) and `minVenuePrestige` (quality floor). Replacing the count with a weighted metric is a straightforward interface change — swap `publishedDocuments: number` for a computed score that considers venue prestige, form classification, citation count, and contradiction survival. All the input data for such a score already exists in the document tradition system (doc 10).

### MVP Risk Assessment

**No risk.** The `publishedDocuments` field is a single number consumed in one place (role advancement checks). Replacing it with a richer metric is a localised change that doesn't ripple through other systems. The perverse-incentive question is real but is a playtesting concern — the thresholds are tuning constants, not architectural commitments.

**Affects:** doc 07 (role advancement requirements, career pacing).

---

*This document is a living registry. Items are added when design questions are explicitly deferred from the current development round.*
