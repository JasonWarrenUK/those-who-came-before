# TWCB Core Loop & Systems Map
*How the game's systems interlock*

---

## 1. The Core Loop (One Sentence)

**Inspect artefact → form interpretation → record findings → encounter new artefact whose reading is coloured by your prior interpretations → notice (or fail to notice) inconsistencies → revise (or double down).**

That's it. Everything else in the game exists to make that loop richer, deeper, and more consequential.

---

## 2. The Seven Systems

TWCB has seven interconnected systems. They're listed here in dependency order — each one requires the ones above it to function.

### 2.1 Generation Layer
**What it does:** Produces artefacts from a seeded simulation, with properties at varying visibility levels.
**Depends on:** Nothing. This is the foundation.
**Feeds into:** World State, Player Experience.

The generation pipeline runs: World Seed → Chronology + Cultures → Grammar Expansion (CFG) → Structural Normalisation → Constraint Validation → Tag-Based Classification → Material Assignment → Generated Artefact. Each stage produces properties at specific visibility levels (doc 05, Section 1.1): observable properties are available to any agent through inspection, occluded properties are hidden ground truth, engine-internal properties are never exposed.

Every artefact is deterministically produced from the world seed, culture profile, and period. The same seed always produces the same world. The player never sees the generation parameters directly — only the artefact's observable properties, filtered through the Interpretive Lens.

**Current state:** Basic item+material generation implemented. CFG pipeline specified in doc 05 (primary generation path). Cultural biases specified. Neither implemented.

### 2.2 World State
**What it does:** The single source of truth — all generated reality, with properties at varying visibility levels (doc 11, Section 2.5).
**Depends on:** Generation Layer.
**Feeds into:** Contradiction System, Player Experience (via observable properties).

The world state contains the true chronology, true cultural profiles, true provenance of every artefact. But not all of it is hidden. Observable properties (physical shape, visible materials, surface treatments) are available to any agent through inspection. Inferable properties (manufacturing techniques, use-wear patterns) can be derived from observation plus reasoning. Occluded properties (true cultural attribution, intended function, trade network origins) are hidden ground truth that drives contradiction detection. Engine-internal properties (generation seeds, constraint validation logs) are never exposed to any agent.

The player experiences observable properties directly (filtered through the Interpretive Lens), can derive inferable properties through deliberate investigation, and never accesses occluded properties except through the consequences they produce — contradictions, impossible artefacts, peer challenges.

**Current state:** Specified in doc 05. Not implemented.

### 2.3 Player Experience
**What it does:** The interface through which the player encounters and interprets artefacts.
**Depends on:** Generation Layer (produces artefacts), Interpretive Lens (filters perception).
**Feeds into:** Interpretive Model.

The player inspects artefacts, records observations, forms hypotheses, updates documents, and (optionally) publishes findings. Each action writes to their interpretive model. Actions consume energy and time within discrete terms (doc 11, Section 2.8).

Crucially, the player's *perception* of each artefact is mediated by the Interpretive Lens. They don't see raw artefact data — they see observable properties filtered through the lens of everything they already believe.

**Current state:** Basic UI exists. Artefact inspection, note-taking, and hypothesis formation specified in doc 06 but not implemented.

### 2.4 Interpretive Model
**What it does:** Stores everything the player thinks they know — and provides the same structure for NPC scholars.
**Depends on:** Player Experience (writes to it).
**Feeds into:** Interpretive Lens, Contradiction System, Document Tradition.

The `InterpretiveModel` is agent-generic (doc 11, Section 2.6): the same interface represents both the player's accumulated knowledge and each NPC scholar's positions. It contains observations, inferences, hypotheses, and publications. Engine functions accept any `InterpretiveModel` without knowing whose it is.

For the player, additional state wraps the model: working documents (artefact studies, cultural profiles, material generalisations), a contradiction queue, strain scores, and lens state. This extended state is player-specific — NPCs don't need contradiction queues at MVP.

The interpretive model is the player's primary tool *and* their primary liability. Every entry is evidence they can reference — and every entry might be wrong.

**Current state:** Data model specified in doc 06. Agent-generic architecture defined. Not implemented.

### 2.5 Interpretive Lens ⚠️ THE CORE MECHANIC
**What it does:** Filters the player's perception of new artefacts through their existing beliefs.
**Depends on:** Interpretive Model (provides the lens inputs).
**Feeds into:** Player Experience (alters what the player sees).

**This is the system that makes TWCB different from every other game.**

When the player inspects a new artefact, the system consults their existing hypotheses, inferred traits, and published work. It then adjusts what information is foregrounded, suggested, or obscured — through five independently tunable channels (doc 04): observation salience, classification suggestions, cross-reference priming, descriptive framing, and omission blindness.

The lens operates exclusively on observable and inferable properties (doc 11, Section 2.5). It cannot reveal occluded properties and cannot hide observable ones — it can only reorder, reframe, and de-emphasise them. The manipulation is in selection, ordering, emphasis, and framing — never fabrication.

Lens strength scales with commitment: dissemination state × venue prestige (doc 10), evidence count, citation count, teaching activity. It decays per-term when hypotheses go unengaged, and compounds when contradictions accumulate against them.

**Current state:** Fully specified in doc 04. Five channels defined with TypeScript interfaces, worked examples, and calibration model. Not implemented.

### 2.6 Contradiction System
**What it does:** Detects when an agent's interpretive model diverges from occluded ground truth or professional consensus, and surfaces these contradictions diegetically.
**Depends on:** World State (occluded properties), Interpretive Model (agent's claims).
**Feeds into:** Player Experience (via diegetic surfacing), Interpretive Lens (contradiction pressure reduces lens strength).

The contradiction detector is agent-generic (doc 06, Section 4.3) — it accepts any `InterpretiveModel` and compares claims against the world state's occluded properties and the professional corpus. This means the same detection logic identifies contradictions in NPC scholarship, which is how calibrated NPC errors produce consequences when the player inherits them.

Contradictions accumulate without forced resolution. The player can maintain multiple inconsistencies simultaneously. When they choose to address a contradiction, they enter a retcon flow that revises hypotheses and cascades updates through dependent documents. Each unresolved contradiction applies per-term strain pressure (doc 06, Section 5).

Contradictions are surfaced in-world: peer letters, student questions, impossible artefacts, journalistic investigations. Never as out-of-character UI warnings.

**Current state:** Eight contradiction types specified in doc 06 with TypeScript interfaces. Detection, accumulation, and resolution mechanics defined. Not implemented.

### 2.7 Document Tradition
**What it does:** Manages the lifecycle of scholarly documents — from working notes through publication, dissemination, citation, and revision.
**Depends on:** Interpretive Model (provides claims to document), Contradiction System (triggers revisions).
**Feeds into:** Interpretive Lens (dissemination state × venue prestige drives lens strength), Career progression.

Documents are the player's primary workspace and their connection to the academic world. The document tradition system (doc 10) tracks lineage (who cited whom, what built on what), dissemination state (private → circulated → submitted → published → collected), venue assignment, and perception by other scholars.

NPC publications in the initial corpus are the first nodes in the lineage graph. The player extends this graph by writing, publishing, citing, and challenging existing work. The document tradition creates the institutional pressure that makes Pillar 5 (The Player Is an Unreliable Narrator) mechanically real.

**Current state:** Fully specified in doc 10. Form classification, dissemination model, lineage graph, and perception system defined. Not implemented.

---

## 3. System Interaction Patterns

### 3.1 The Virtuous Cycle (When the Player Is Right)
Correct interpretation → accurate hypothesis → well-calibrated lens → even more accurate future interpretations → builds a coherent and truthful model of history.

### 3.2 The Vicious Cycle (When the Player Is Wrong)
Incorrect interpretation → flawed hypothesis → miscalibrated lens → sees confirmation of the wrong theory in ambiguous evidence → doubles down → builds an elaborate and internally consistent but fundamentally incorrect model of history.

### 3.3 The Correction Cycle (When Contradictions Force Revision)
Accumulating contradictions → per-term strain pressure → diegetic surfacing (peer letter, impossible artefact) → player investigates → retcon: revises hypothesis → cascading document updates → recalibrated lens → clearer future readings.

### 3.4 The Publication Lock-In
Hypothesis → published via document tradition (doc 10) → gains dissemination + citations → lens strength increases → harder to retract → shapes NPC perception → creates institutional pressure to maintain position even as contradictions mount → eventual crisis or vindication.

---

## 4. Current Design State

The systems map above reflects the project's design architecture as of February 2026. All seven systems have been specified:

| System | Primary Doc | Status |
|---|---|---|
| Generation Layer | Doc 05 | Specified. CFG pipeline, 7-stage architecture, visibility annotations. Basic MVP implemented. |
| World State | Doc 05, Doc 11 §2.5 | Specified. Visibility model defined. Not implemented. |
| Player Experience | Doc 08 | Architecture specified. Basic UI implemented. Term-based action economy defined (doc 11 §2.8). |
| Interpretive Model | Doc 06 | Specified. Agent-generic `InterpretiveModel` + player-specific `PlayerInterpretiveState`. Not implemented. |
| Interpretive Lens | Doc 04 | Fully specified. Five channels, calibration model, decay mechanics, worked examples. Not implemented. |
| Contradiction System | Doc 06 §4–5 | Specified. Eight contradiction types, detection, accumulation, strain, resolution. Not implemented. |
| Document Tradition | Doc 10 | Fully specified. Form classification, dissemination, lineage, perception. Not implemented. |

### 4.1 Remaining Design Gaps

- **Energy scaling curves** — exact numbers for term energy budgets, action costs, and replenishment rates (doc 11, Section 2.8)
- **NPC scholar depth** — minimal framework defined (doc 07), but full NPC behaviour model deferred
- **Visual pipeline** — rendering from artefact data entirely unspecified
- **Persistence layer** — save format, storage approach undecided
- **Distribution** — packaging targets undecided

---

*Cross-references: Interpretive Lens (doc 04), Generation Architecture (doc 05), Knowledge & Contradiction Model (doc 06), Career & Social Systems (doc 07), Technical Architecture (doc 08), Document Tradition (doc 10), Deferred Design Questions (doc 11)*
