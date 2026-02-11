# Those Who Came Before

**An archaeological interpretation game where your mistakes build the world**

> [!NOTE]
> Phase 1 complete. Engine foundation in place — type system, seeded PRNG, module skeleton. See [Implementation Status](#implementation-status) for details.

---

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/JasonWarrenUK/those-who-came-before)

---

## About

You play an early-career academic archaeologist. You excavate artefacts, observe their properties, form hypotheses about the cultures that made them, and publish your findings. The catch: your existing beliefs filter how you perceive new evidence. A wrong interpretation doesn't fail — it compounds, shaping what you notice, what you miss, and what you confidently publish to the academic world.

The game's systems are designed around six pillars:

- **Error Is the Engine** — Mistakes are generative, not punitive. You can build an elaborate, internally consistent, and completely false academic edifice — and that's a valid way to play.
- **Diegesis First** — No out-of-character tooltips or system messages. Contradictions surface as peer letters, student questions, or impossible artefacts.
- **Simulation Honesty** — Every artefact derives from the same underlying world state. What you see is filtered by your beliefs, but the data is real.
- **Accumulation Over Revelation** — Knowledge builds incrementally through observations, inferences, and hypotheses. There are no eureka moments handed to you.
- **The Player Is an Unreliable Narrator** — Your publications have consequences. Commit to a wrong interpretation and the academic community will hold you to it.
- **Clarity of State Over Spectacle** — Legibility over polish. You should always understand what your character knows and believes.

## Tech Stack

- **Runtime**: Deno
- **Framework**: Svelte 5 (Runes) + SvelteKit 2
- **Build**: Vite 6
- **Styling**: Tailwind CSS 4 + DaisyUI 5
- **Language**: TypeScript 5

## Quick Start

```bash
deno install              # Install dependencies
deno task dev             # Dev server at localhost:5173
deno task build           # Production build
deno task preview         # Preview production build
```

```bash
deno task check           # Type checking
deno task check:watch     # Continuous type checking
deno task test            # Run tests
deno task test:watch      # Continuous testing
deno task lint            # Check formatting + ESLint
deno task format          # Auto-format with Prettier
```

## Implementation Status

### Phase 1: Foundation — Complete

- Type system: 15 files covering all domain interfaces from the design docs
- Seeded PRNG: xoshiro128** with determinism guarantee and utility functions
- Engine skeleton: 38 stub modules across 7 domains with correct type signatures
- Test infrastructure: Vitest with passing tests for PRNG and world seed
- Project Explorer at `/dev/explorer` for developer inspection

### What's Next

The [implementation roadmap](docs/09-implementation-roadmap.md) defines 24 sequential phases. Key milestones:

| Phase | Milestone | What It Adds |
|-------|-----------|-------------|
| 2–7 | Generation pipeline | Component grammar, plausibility, materials, decoration, excavation |
| 8–9 | World & pipeline integration | Seed-driven world state, full artefact generation |
| 10–11 | Corpus & descriptions | NPC scholarship baseline, three-register prose |
| 12 | **First playable** | Artefact inspection UI with register switching |
| 13–14 | Knowledge system | Observations, inferences, hypotheses, evidence chains |
| 15–16 | **The lens** | Beliefs filter perception — the core mechanic |
| 17–18 | Contradictions | Detection, strain, diegetic surfacing, retcon flow |
| 19 | Persistence | IndexedDB save/load |
| 20–23 | Career & social | Publication, reputation, NPC peer review, academic progression |
| 24 | Expansion | Full career track, rich NPCs, desk-based UI |

Phase 16 is the inflection point — before it, an artefact browser with note-taking; after it, the game.

## Documentation

The project has a complete design specification across 13 documents:

| Doc | Topic |
|-----|-------|
| [00](docs/00-project-overview.md) | Project overview and reading order |
| [01](docs/01-project-audit.md) | Project audit |
| [02](docs/02-design-pillars.md) | Design pillars |
| [03](docs/03-core-loops-system-map.md) | Core loop and systems map |
| [04](docs/04.interpretative-lens.md) | Interpretive lens (core mechanic) |
| [05](docs/05-generation-architecture.md) | Generation architecture (9-stage pipeline) |
| [06](docs/06-knowledge-contradiction-model.md) | Knowledge and contradiction model |
| [07](docs/07-career-social-systems.md) | Career and social systems |
| [08](docs/08-technical-architecture.md) | Technical architecture |
| [09](docs/09-implementation-roadmap.md) | Implementation roadmap (24 phases) |
| [10](docs/10-document-tradition-system.md) | Document tradition system |
| [11](docs/11-deferred-design-questions.md) | Deferred design questions |
| [12](docs/12-propagation-register.md) | Cross-document propagation register |
| [13](docs/13-deferred-post-mvp.md) | Deferred post-MVP design |

**Reading order:** Doc 02 (pillars) → Doc 03 (systems) → Doc 04 (core mechanic) for the big picture. Doc 09 (roadmap) → phase-relevant spec → Doc 08 (architecture) for implementation.

## Contributing

This is a personal project by [Jason Warren](https://github.com/JasonWarrenUK), but feedback and suggestions are welcome via issues.

## License

`© Goblin Uprising` — All rights reserved.
