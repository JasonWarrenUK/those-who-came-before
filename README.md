# Those Who Came Before

**An archaeological artefact discovery game where player mistakes compound into an unreliable narrative**

> [!NOTE]
> Early development. The design is extensively specified; the implementation restarted from Milestone 1, which is now complete. There is no playable game yet.

---

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/JasonWarrenUK/those-who-came-before)

---

## About

You play an archaeologist interpreting excavated artefacts. Every interpretation you record feeds a lens that filters what you observe next: expected properties are foregrounded, familiar classifications are suggested, details that contradict your published claims go unnoticed. Errors are generative; they shape the story you tell and the career you build on it. The player is the unreliable narrator.

## Project Status

The design is roughly 95% specified across fourteen documents (docs 00 to 13). The implementation was reset for launch and is being rebuilt milestone by milestone against the [MVP roadmap](docs/roadmaps/mvp.md). Milestone 1 (Foundation) is complete: Deno runtime, the full type system, the seeded PRNG and the Project Explorer shell. Milestone 2 (Generation Pipeline) is next.

What the repository currently contains:

- A bare SvelteKit skeleton: one route, three static components (Header, Footer and Timeline) and DaisyUI theming
- The complete MVP type system in `src/lib/types/`: seventeen modules, roughly 150 interfaces and aliases covering artefacts, world generation, interpretation, lens, documents, career, contradictions and saves
- A seeded PRNG (xoshiro128**) in `src/lib/engine/` with determinism and distribution tests
- The Project Explorer at `/dev/explorer` (dev builds only): a developer workbench with a PRNG determinism panel and a type index that parses the type modules live, renders module dependency and per-type reference graphs, and cross-links every type
- The full design specification in `docs/`
- The old tech demo, archived in `backlog/` as dead reference code

## Quick Start

Requires [Deno](https://deno.com). There is no `package.json`; dependencies resolve through `deno.json` on first run.

```bash
deno task dev        # Dev server with HMR
deno task build      # Production build
deno task preview    # Preview the production build
deno task check      # Type checking
deno task test       # Run tests
deno fmt             # Format
deno lint            # Lint
```

## Tech Stack

- **Runtime**: Deno
- **Framework**: Svelte 5 (Runes) + SvelteKit 2
- **Build**: Vite 7
- **Styling**: Tailwind CSS 4 + DaisyUI 5
- **Language**: TypeScript
- **Adapter**: `@deno/svelte-adapter` (deploys to Deno Deploy)

## Documentation

- [Project Knowledge Overview](docs/00-project-overview.md): index of the thirteen design documents
- [MVP Roadmap](docs/roadmaps/mvp.md): milestone-by-milestone execution plan
- [Agent Guide](.claude/CLAUDE.md): development guidance for AI coding assistants

## Contributing

A personal project by [Jason Warren](https://github.com/JasonWarrenUK). Feedback and suggestions are welcome via issues.

## Licence

`© Goblin Uprising` - All rights reserved.
