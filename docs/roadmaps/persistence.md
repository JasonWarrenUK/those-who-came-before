# Those Who Came Before: Persistence

**State:** planned. Stored as `archived` until the roadmap plugin gains a planned phase state
(goblin-scout 3.x); promote it once the phase before it is done. Index: [roadmaps](README.md).

**Gate G1:** Contradictions phase complete. Stands in for the cross-phase edge to Contradictions.
Lift it when this phase is promoted to active: remove G1 from each blocked task's dependsOn and mark
the gate done.

---

## Milestone 1: Serialisation & Schema

**Goal:** Game state round-trips through a versioned, migratable save format

- [ ] **8PS.1** — `persistence/serialisation.ts` — `serialiseMap` / `deserialiseMap` utilities for
      `Map<K,V>` → `[K,V][]` round-tripping _(blocked: depends on G1)_
- [ ] **8PS.2** — `persistence/serialisation.ts` — `serialiseGameState(state): SaveFile` — full
      state serialisation (worldState, playerInterpretation, termState; contradiction queue
      serialised within playerInterpretation; lensState recomputed on load, not persisted) _(blocked
      — depends on 8PS.1)_
- [ ] **8PS.3** — `persistence/serialisation.ts` — `deserialiseGameState(save): GameState` — full
      state deserialisation _(blocked — depends on 8PS.2)_
- [ ] **8PS.4** — `persistence/schema.ts` — re-export `SaveFile` and `CURRENT_SAVE_VERSION` from
      `src/lib/types/save.ts` (canonical home per 1FD.33); add save metadata shape _(blocked —
      depends on 8PS.1)_
- [ ] **8PS.5** — `persistence/schema.ts` — schema migration:
      `migrations: Record<number, Migration>`, `migrateSave(save): SaveFile` — sequential migration
      runner _(blocked — depends on 8PS.4)_
- [ ] **8PS.10** — Explorer: persistence inspector — serialised state size, schema version,
      round-trip diff, export raw JSON _(blocked — depends on 8PS.5, 8PS.3)_

---

## Milestone 2: Storage & Saves

**Goal:** IndexedDB storage, auto-save and save slots

- [ ] **8PS.6** — `persistence/indexeddb.ts` — `saveToIndexedDB(save)`,
      `loadFromIndexedDB(): SaveFile`, `listSaves()`, `deleteSave(id)` _(blocked — depends on
      8PS.2)_
- [ ] **8PS.7** — `persistence/indexeddb.ts` — auto-save: debounced 5-second write on significant
      player actions _(blocked — depends on 8PS.6)_
- [ ] **8PS.8** — Save/load UI — save button, load button, save slot list _(blocked — depends on
      8PS.6)_
- [ ] **8PS.9** — Auto-save indicator _(blocked — depends on 8PS.7)_

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
	G1["G1: Contradictions phase complete"]:::external
	8PS.1["8PS.1: `persistence/serialisation.ts` — `serial…"]
	8PS.2["8PS.2: `persistence/serialisation.ts` — `serial…"]
	8PS.3["8PS.3: `persistence/serialisation.ts` — `deseri…"]
	8PS.4["8PS.4: `persistence/schema.ts` — re-export `Sav…"]
	8PS.5["8PS.5: `persistence/schema.ts` — schema migrati…"]
	8PS.10["8PS.10: Explorer: persistence inspector — seria…"]
	M1["M1: Serialisation & Schema"]:::mile
	8PS.6["8PS.6: `persistence/indexeddb.ts` — `saveToInde…"]
	8PS.7["8PS.7: `persistence/indexeddb.ts` — auto-save:…"]
	8PS.8["8PS.8: Save/load UI — save button, load button,…"]
	8PS.9["8PS.9: Auto-save indicator"]
	M2["M2: Storage & Saves"]:::mile
	G1 --> 8PS.1
	8PS.1 --> 8PS.2
	8PS.1 --> 8PS.4
	8PS.2 --> 8PS.3
	8PS.2 --> 8PS.6
	8PS.3 --> 8PS.10
	8PS.4 --> 8PS.5
	8PS.5 --> 8PS.10
	8PS.10 --> M1
	8PS.6 --> 8PS.7
	8PS.6 --> 8PS.8
	8PS.7 --> 8PS.9
	8PS.8 --> M2
	8PS.9 --> M2
	class 8PS.1,8PS.10,8PS.2,8PS.3,8PS.4,8PS.5,8PS.6,8PS.7,8PS.8,8PS.9 blocked
```
