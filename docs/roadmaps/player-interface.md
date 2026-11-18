# Those Who Came Before: Player Interface

**State:** planned. Stored as `archived` until the roadmap plugin gains a planned phase state
(goblin-scout 3.x); promote it once the phase before it is done. Index: [roadmaps](README.md).

**Gate G1:** World State & Integration phase complete. Stands in for the cross-phase edge to World
State & Integration. Lift it when this phase is promoted to active: remove G1 from each blocked
task's dependsOn and mark the gate done.

---

## Milestone 1: Inspector Components

**Goal:** The artefact inspector and its building blocks: properties, tags, confidence, components

- [ ] **4UI.1** — `components/study/ArtefactInspector.svelte` — main artefact display shell
      (replaces `ItemGenerator.svelte`) _(blocked: depends on G1)_
- [ ] **4UI.2** — `components/study/PropertyList.svelte` — ordered list of artefact properties with
      register-specific descriptions _(blocked — depends on 4UI.1)_
- [ ] **4UI.3** — `components/shared/TagBadge.svelte` — tag display badge component _(blocked —
      depends on 4UI.1)_
- [ ] **4UI.4** — `components/shared/ConfidenceBadge.svelte` — confidence level badge _(blocked —
      depends on 4UI.1)_
- [ ] **4UI.5** — Component list UI — materials, features, decorative layers per component _(blocked
      — depends on 4UI.1)_

---

## Milestone 2: Study Workspace

**Goal:** A study route that generates an artefact and shows its provenance and registers

- [ ] **4UI.6** — Provenance display — site, culture label, period, context, dating framework from
      corpus _(blocked — depends on 4UI.5)_
- [ ] **4UI.7** — `routes/study/+page.svelte` — artefact study workspace: generates artefact,
      displays inspector _(blocked — depends on 4UI.6)_
- [ ] **4UI.8** — Register switching UI — toggle between observational, interpretive, technical
      descriptions _(blocked — depends on 4UI.6)_
- [ ] **4UI.9** — "Generate New Artefact" action wired through `gameState.surfaceArtefact()`
      _(blocked — depends on 4UI.6)_

---

## Dependency Diagram

```mermaid
graph LR
	classDef todo fill:#f6f6f6,stroke:#6f6f6f,color:#6f6f6f
	classDef inProgress fill:#e8f2ff,stroke:#0071af,color:#0071af
	classDef blocked fill:#fff8f6,stroke:#e0002b,color:#e0002b,stroke-width:2px
	classDef paused fill:#fdf4ff,stroke:#b01fe3,color:#b01fe3,stroke-dasharray:4 3
	classDef deferred fill:#fff8f3,stroke:#ac5c00,color:#ac5c00,stroke-dasharray:2 4,font-style:italic
	classDef done fill:#e0ffd9,stroke:#008217,color:#008217
	classDef outOfScope fill:#f6f6f6,stroke:#717171,color:#717171,stroke-dasharray:2 2
	classDef mile fill:#e3f7ff,stroke:#007590,color:#007590,font-weight:bold
	classDef external fill:#fff9e5,stroke:#7d6f00,color:#7d6f00,stroke-dasharray:4 3,font-style:italic
	G1["G1: World State & Integration phase complete"]:::external
	4UI.1["4UI.1: `components/study/ArtefactInspector.svel…"]
	4UI.2["4UI.2: `components/study/PropertyList.svelte` —…"]
	4UI.3["4UI.3: `components/shared/TagBadge.svelte` — ta…"]
	4UI.4["4UI.4: `components/shared/ConfidenceBadge.svelt…"]
	4UI.5["4UI.5: Component list UI — materials, features,…"]
	M1["M1: Inspector Components"]:::mile
	4UI.6["4UI.6: Provenance display — site, culture label…"]
	4UI.7["4UI.7: `routes/study/+page.svelte` — artefact s…"]
	4UI.8["4UI.8: Register switching UI — toggle between o…"]
	4UI.9["4UI.9: #quot;Generate New Artefact#quot; action wired thr…"]
	M2["M2: Study Workspace"]:::mile
	G1 --> 4UI.1
	4UI.1 --> 4UI.2
	4UI.1 --> 4UI.3
	4UI.1 --> 4UI.4
	4UI.1 --> 4UI.5
	4UI.2 --> M1
	4UI.3 --> M1
	4UI.4 --> M1
	4UI.5 --> M1
	4UI.5 --> 4UI.6
	4UI.6 --> 4UI.7
	4UI.6 --> 4UI.8
	4UI.6 --> 4UI.9
	4UI.7 --> M2
	4UI.8 --> M2
	4UI.9 --> M2
	class 4UI.1,4UI.2,4UI.3,4UI.4,4UI.5,4UI.6,4UI.7,4UI.8,4UI.9 blocked
```
