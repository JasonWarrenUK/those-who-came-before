# Those Who Came Before: Roadmaps

The MVP runs as ten phases, one per former milestone of the single MVP roadmap (split 2026-11-18).
`.claude/roadmaps.json` is the source of truth; each phase file below is its projection, and each
phase has its own dashboard under `docs/artefacts/`.

Only one phase is active at a time. Future phases are stored as `archived` until the roadmap plugin
gains a planned phase state; each carries a gate standing in for the phase before it.

| Phase                     | State              | Tasks | Done | File                                                     |
| ------------------------- | ------------------ | ----- | ---- | -------------------------------------------------------- |
| Foundation                | Archived: complete | 40    | 40   | [foundation.md](foundation.md)                           |
| Generation Pipeline       | Active             | 172   | 85   | [generation-pipeline.md](generation-pipeline.md)         |
| World State & Integration | Archived: planned  | 23    | 0    | [world-state-integration.md](world-state-integration.md) |
| Player Interface          | Archived: planned  | 9     | 0    | [player-interface.md](player-interface.md)               |
| Knowledge Model           | Archived: planned  | 26    | 0    | [knowledge-model.md](knowledge-model.md)                 |
| Lens System               | Archived: planned  | 17    | 0    | [lens-system.md](lens-system.md)                         |
| Contradictions            | Archived: planned  | 32    | 0    | [contradictions.md](contradictions.md)                   |
| Persistence               | Archived: planned  | 10    | 0    | [persistence.md](persistence.md)                         |
| Career & Publication      | Archived: planned  | 39    | 0    | [career-publication.md](career-publication.md)           |
| NPC Systems               | Archived: planned  | 23    | 0    | [npc-systems.md](npc-systems.md)                         |

**Critical path:** Foundation, Generation Pipeline, World State & Integration, Player Interface,
Knowledge Model, Lens System, Contradictions, Persistence, Career & Publication, NPC Systems. Each
phase gates the next; Explorer tasks inside a phase are leaves.

---

## Links

- [Doc 02: Design Pillars](../02-design-pillars.md) — Non-negotiable principles
- [Doc 03: Core Loop](../03-core-loops-system-map.md) — Systems map
- [Doc 04: Interpretive Lens](../04-interpretive-lens.md) — Core mechanic
- [Doc 05: Generation Architecture](../05-generation-architecture.md) — 9-stage pipeline
- [Doc 06: Knowledge Model](../06-knowledge-contradiction-model.md) — Claims, contradictions, strain
- [Doc 07: Career Systems](../07-career-social-systems.md) — Reputation, progression, NPCs
- [Doc 08: Technical Architecture](../08-technical-architecture.md) — Implementation guide
- [Doc 09: Implementation Roadmap](../09-implementation-roadmap.md) — Phase-by-phase breakdown
  (source)
- [Doc 10: Document Tradition](../10-document-tradition-system.md) — Lineage, dissemination, venues
- [Doc 11: Deferred Questions](../11-deferred-design-questions.md) — Locked decisions
- [Doc 12: Propagation Register](../12-propagation-register.md) — Cross-doc consistency log
- [Doc 13: Post-MVP](../13-deferred-post-mvp.md) — Beyond Milestone 10

---

## Beyond MVP

**Phase 24: Expansion Tracks** (deferred to post-MVP)

- Curatorial publication track (exhibition narratives, thematic grouping)
- Popular publication track (simplified claims, public misconceptions)
- Full career role progression (through professor)
- Career activity execution (field seasons, conference presentations, grants, sabbatical
  availability)
- Richer NPC personalities and relationships
- Desk-based UI evolution (Strange Horticulture aesthetic)
- Cultural profile document type (player-authored culture models)
- Five-register `ObservationRegister` acquisition system (doc 05 §12); MVP ships doc 04's
  three-register `DescriptionRegister`

Source: [Doc 09: Implementation Roadmap](../09-implementation-roadmap.md), Phase 24. Separately
deferred design questions (alternative dissemination pathways, emergent schools of thought,
publication quality metrics for role qualification): see
[Doc 13: Post-MVP Deferrals](../13-deferred-post-mvp.md).
