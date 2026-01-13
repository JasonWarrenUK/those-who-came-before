# Those Who Came Before: IdeatioN
*Date: 13 January 2026*

## 0) Executive Summary
- **Premise.** A desktop-first, long-form narrative game where the player is an archaeological researcher analysing **procedurally generated artefacts** to infer vanished civilizations.
- **Two world states.**  
  - **Objective World State:** hidden, procedurally generated chronology and evolving cultural profiles.  
  - **Subjective World State:** player’s evolving model of the world, mixing true inferences with mistaken assumptions; this model actively shapes future interpretations.
- **Contradictions & retcons.** All contradictions are **diagetically** surfaced (peer challenges or incompatible artefacts). Contradictions may **accumulate in parallel** and be **resolved at the player’s discretion**, enabling “retcon” updates to prior conclusions.
- **Interface & scope.** Start **text-first**, later grow into a **desk-based GUI** in the vein of *Strange Horticulture*. Playthrough length roughly akin to *Book of Hours*.  
- **Artefact depiction.** Initially **textual only**; later **visuals** derived directly from the same underlying generated properties (no purely decorative art).
- **Tech stance.** Built in **TypeScript**, runtime **Deno**. Traditional engines (Unity/Unreal) are not a fit for this simulation-narrative focus.

---

## 1) Player Experience & Core Loop (Agreed)
1. Inspect a newly surfaced artefact: note **shape**, **materials**, **adornment**, **motifs**, **find context/position**, and any other archaeological considerations.
2. Form/update hypotheses that alter the **Subjective World State**.
3. Encounter new artefacts whose generation is consistent with the **Objective World State** but whose **interpretation** is mediated by the **Subjective** one.
4. Accrue **contradictions** when the subjective model cannot reconcile new evidence; keep playing while they accumulate, or detour to resolve them.
5. **Resolve contradictions** to retcon earlier conclusions, revising the Subjective model and unlocking clearer readings of future artefacts.

---

## 2) Simulation Model (Agreed)

### 2.1 Objective World State
- **Chronology:** a generated sequence of periods, internal developments, and inter-civilization interactions.
- **Cultures:** each civilization has a **cultural profile** that **changes over time** (materials, motifs, beliefs, technologies, trade, etc.).
- **Causality:** artefacts reflect their period and culture with internally consistent properties and contextual placement.

### 2.2 Subjective World State
- **Player-owned model** capturing all inferences, including **errors**.
- **Feedback effect:** subsequent interpretations are filtered through the subjective model, amplifying both good lines of reasoning and mistaken paths until corrected.

---

## 3) Contradiction & Retcon System (Agreed)

- **Diagesis first.**  
  - **Peer challenges:** rival curators, colleagues, or publications cast doubt on specific claims.  
  - **Impossible artefacts:** items that cannot be reconciled with current assumptions (e.g., material science, stratigraphy, motif lineage, trade timelines).
- **Parallel accumulation.** Contradictions **queue** without forced, immediate resolution. The player can maintain several open inconsistencies.
- **Resolution window.** When sufficient new evidence or scrutiny accumulates, the player may **retcon**: update or overturn earlier conclusions in the Subjective model.
- **Ongoing consequences.** Unresolved contradictions continue to bias interpretations; resolving them clarifies downstream readings.

---

## 4) Platform, Interface, and Scope (Agreed)

- **Platform priority:** **Desktop-first**; mobile is **secondary** but not excluded.
- **Interface evolution:**  
  1) **Phase 1:** primarily **text-based** interface.  
  2) **Phase 2+:** **desk-based GUI** inspired by *Strange Horticulture* (inventory, documents, workspace, index).
- **Playthrough length:** **Long-form**, roughly in the *Book of Hours* range; not as sprawling as *Caves of Qud* or *Dwarf Fortress*.
- **Artefact depiction:** initially **text-only**; later **visuals** generated from the same structured properties that drive text (fidelity to simulation over aesthetics).

---

## 5) Reference Works & Why They Matter (Agreed)

- **Strange Horticulture / Book of Hours:** desk-centric research loops; restrained, systemic interfaces; “learning through handling things.”
- **80 Days:** polished, text-forward storytelling and stateful branching.
- **Caves of Qud / Dwarf Fortress / Ultima Ratio Regum / Beyond the Chiron Gate / Voyageur:** deep **procedural culture/history/world** generation that yields emergent narrative.
- **Microscope (TTRPG):** structured historical generation and timeline thinking.
- **Heaven’s Vault:** player knowledge as a first-class system; interpretation that improves and can be revised.

---

## 6) Tech Stance (Agreed)

- **Language/runtime:** **TypeScript** on either **Bun** or **Deno**.
- **Engine choice:** not Unity/Unreal; the project favours custom simulation, data models, and a lightweight UI over general-purpose 3D/2D engines.
- **Inspirations:** **context-free grammars** (e.g., Compton’s Tracery) are considered useful influences for procedural text/structure.  
  *(Note: inspirations, not mandates.)*

---

## 7) What Makes This Different From Typical JS/TS Games (Shared Understanding)

- **Data-first design:** complex simulation schemas for chronologies, culture evolution, and artefact provenance instead of physics/rendering pipelines.
- **Interpretation as gameplay:** feedback loop between knowledge, error, and future readings; not a linear quest tree.
- **Diegetic error handling:** contradictions surfaced **in-world**, not as out-of-character UI warnings.
- **UI roadmap:** text-first to desk-based tool; clarity and state legibility over spectacle.

---

## 8) Known Open Items (Not Yet Decided)

- **Exact contradiction surfacing UX:** artefact notes, peer letters, journal flags, marginalia, or a combination; when and how prominence is granted.
- **Quantification:** thresholds or heuristics for when contradictions crystallise into resolvable “claims.”
- **Data shapes:** concrete schemas for chronology, culture, motif lineage, material tech trees, and excavation context.
- **Visual pipeline:** specification for later artefact rendering that remains 1:1 with the underlying properties.
- **Distribution details:** packaging targets (Tauri/Electron/desktop web), save format, and modding hooks.

---

## 9) Guardrails (Agreed Principles)

- **Simulation honesty.** Visuals and text must reflect the same ground truth; no decorative cheats.
- **Clarity over flourish.** Interfaces privilege legibility of state and reasoning chains.
- **Reversibility.** The system supports informed retcons without hand-waving; every revision is traceable to evidence.
- **Diegesis.** All feedback is communicated in-world whenever possible.

---

## 10) Revision Log
- **v0.1 (13 Jan 2026).** Initial agreement report compiled from our discussion and your clarifications on platform, interface roadmap, play length, artefact depiction, and the contradiction/retcon system.

---

### Appendix A — Short “At-a-Glance” Checklist (Agreed)
- [x] Desktop-first; mobile secondary  
- [x] Text-first now; desk-based GUI later  
- [x] Long-form play; *Book of Hours* scale  
- [x] Two world states: Objective (hidden), Subjective (player)  
- [x] Player errors propagate forward until corrected  
- [x] Contradictions are diagetically indicated  
- [x] Contradictions can accumulate and be resolved later  
- [x] Artefacts: text now, later visuals derived from properties  
- [x] TypeScript + Deno; no Unity/Unreal  
- [x] Reference touchstones as listed above
