# Those Who Came Before

**An archaeological artefact discovery game where player mistakes compound into an unreliable narrative**

> [!NOTE]
> Early development. The design is extensively specified; the implementation has been reset and is restarting from Milestone 1. There is no playable game yet.

---

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/JasonWarrenUK/those-who-came-before)

---

## About

You play an archaeologist interpreting excavated artefacts. Every interpretation you record feeds a lens that filters what you observe next: expected properties are foregrounded, familiar classifications are suggested, details that contradict your published claims go unnoticed. Errors are generative; they shape the story you tell and the career you build on it. The player is the unreliable narrator.

## Project Status

The design is roughly 95% specified across fourteen documents (docs 00 to 13). The implementation was reset for launch and is being rebuilt from [Milestone 1: Foundation](docs/roadmaps/mvp.md) of the MVP roadmap. The Deno migration (tasks 1FD.1 to 1FD.5) is complete; everything else is unbuilt.

What the repository currently contains:

- A bare SvelteKit skeleton: one route, three static components (Header, Footer and Timeline) and DaisyUI theming
- The full design specification in `docs/`
- The old tech demo, archived in `backlog/` as dead reference code

## Quick Start

Requires [Deno](https://deno.com). There is no `package.json`; dependencies resolve through `deno.json` on first run.

```bash
deno task dev        # Dev server with HMR
deno task build      # Production build
deno task preview    # Preview the production build
deno task check      # Type checking
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
