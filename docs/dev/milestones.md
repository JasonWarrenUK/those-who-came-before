# Milestone Board / Roadmap

## Milestone 1: Artefact Generation v2 (Blueprints & Anatomy)
> [!TIP]
> **Goal:** Replace simple item+material pairs with blueprint-driven artefacts (parts, slots, constraints, per-part materials).

### Tasks
- [ ] Define artefact blueprint schema (type → slots → parts → materials, with likelihood + orientation/position).
- [ ] Create initial blueprint dataset for a few artefact types (sword, vase, brooch).
- [ ] Implement part selection + likelihood logic.
- [ ] Add constraint validation (e.g., blade/handle required, crossguard placement rules).
- [ ] Assign materials per part.
- [ ] Update UI to display artefact anatomy.
- [ ] Add optional debug view/logging for generation details.

### Outcome
Generated artefacts are structurally coherent and reflect the devlog’s intended “anatomy” logic.

---

## Milestone 2: Objective World State (Cultures + Chronology)
> [!TIP]
> **Goal:** Introduce the hidden simulation backbone (chronology, cultures, evolving profiles).

### Tasks
- [ ] Define Objective World State types (periods, cultures, evolving material/motif/tech profiles).
- [ ] Build a basic world generator (single culture, multiple periods).
- [ ] Add cultural material biases and part usage patterns.
- [ ] Tie artefact generation to culture + period selection.

### Outcome
Artefacts are generated consistently with a hidden world simulation rather than pure randomness.

---

## Milestone 3: Subjective World State (Player Knowledge Model)
> [!TIP]
> **Goal:** Implement the player’s evolving interpretations and hypotheses system.

### Tasks
- [ ] Define Subjective World State schema (hypotheses, confidence, notes).
- [ ] Add artifact inspection UI that captures player hypotheses/notes.
- [ ] Store and surface subjective interpretations linked to artefacts.

### Outcome
Player assumptions become first-class data that can be incorrect and evolve over time.

---

## Milestone 4: Contradiction & Retcon Mechanics
> [!TIP]
> **Goal:** Implement contradiction detection, accumulation, and retcon resolution loops.

### Tasks
- [ ] Define contradiction schema (cause, evidence, affected hypotheses).
- [ ] Implement contradiction detection (objective vs subjective mismatch rules).
- [ ] Add contradiction queue UI.
- [ ] Add retcon flow to revise hypotheses and resolve conflicts.
- [ ] Surface contradictions diegetically (e.g., peer challenges).

### Outcome
Contradictions accumulate and can be resolved at the player’s discretion, as intended.

---

## Milestone 5: Persistence & Long-Form Play
> [!TIP]
> **Goal:** Enable long-form sessions with save/load support.

### Tasks
- [ ] Add persistence (localStorage/IndexedDB for web).
- [ ] Add save/load UI.
- [ ] Version save schema.

### Outcome
Long-form play is supported; state persists across sessions.

---

## Milestone 6: Desk-Based UI Evolution
> [!TIP]
> **Goal:** Transition from text-first UI to desk-based research interface (Strange Horticulture style).

### Tasks
- [ ] Build desk layout shell (workspace panels).
- [ ] Move generator into a desk “tool” panel.
- [ ] Add artifact dossiers (per-artefact workspace view).

### Outcome
Interface aligns with the long-term desk-based roadmap while preserving simulation clarity.

---

## Milestone 7: Depth & Expansion (Cultural Systems + Visual Fidelity)
> [!TIP]
> **Goal:** Expand simulation depth and prepare for later visual rendering grounded in data.

### Tasks
- [ ] Add motif lineage and symbolic traits.
- [ ] Add trade/influence mechanics between cultures.
- [ ] Add hooks for future visual renderers derived from artefact properties.

### Outcome
Deeper emergent cultural patterns and readiness for data-consistent visuals.
