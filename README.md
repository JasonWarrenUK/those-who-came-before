# Those Who Came Before

**An archaeological artefact discovery game where player mistakes compound into an unreliable
narrative**

> [!NOTE]
> Early development. The design is extensively specified; the implementation restarted from
> Milestone 1, which is now complete, and Milestone 2 (Generation Pipeline) is underway. There is no
> playable game yet.

---

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/JasonWarrenUK/those-who-came-before)

---

## About

You play an archaeologist interpreting excavated artefacts. Every interpretation you record feeds a
lens that filters what you observe next: expected properties are foregrounded, familiar
classifications are suggested, details that contradict your published claims go unnoticed. Errors
are generative; they shape the story you tell and the career you build on it. The player is the
unreliable narrator.

## Project Status

The design is specified across fourteen documents (docs 00 to 13); doc 11 and doc 12 both record
their open questions resolved as of the current design round. The implementation was reset for
launch and is being rebuilt milestone by milestone against the [MVP roadmap](docs/roadmaps/mvp.md).
**89 of 318 roadmap tasks are done (28%).** Milestone 1 (Foundation) is complete: Deno runtime, the
full type system, the seeded PRNG and the Project Explorer shell. Milestone 2 (Generation Pipeline)
is 49/101 done: the component grammar system, plausibility checking, material assignment, decorative
motif and introduced-material resolution, feature extraction, tag classification, and description
generation are all in place; materials-classification integration and a handful of calibration
follow-ons remain. Exact task-by-task status lives in
[`.claude/roadmaps.json`](.claude/roadmaps.json) (canonical) and its projection,
[`docs/roadmaps/mvp.md`](docs/roadmaps/mvp.md) — not this summary.

<details>
  <summary><strong>What the Repository Currently Contains</strong></summary>
  <ul>
    <li>A SvelteKit skeleton: one player-facing route, three static components (Header, Footer and Timeline), DaisyUI theming, and the nine-panel Project Explorer described below</li>
    <li>The complete MVP type system in `src/lib/types/`: eighteen modules, roughly 160 interfaces and aliases covering artefacts, world generation, interpretation, lens, documents, career, contradictions, corpus, descriptions, plausibility and saves</li>
    <li>A seeded PRNG (xoshiro128**) and percentile statistics (`engine/statistics.ts`) in `src/lib/engine/`, with determinism, distribution and regression tests</li>
    <li>A component grammar system in `src/lib/data/grammars/` and `src/lib/engine/generation/grammar.ts`: eight geometric primitives, MVP grammar rules, culture/phase-biased weighted selection, complexity-tier budgets, accumulation constraint checking and tree-to-`NormalisedArtefact` flattening</li>
    <li>Plausibility checking in `src/lib/engine/generation/plausibility.ts` (`checkPlausibility`, material-physics and ergonomic rule predicates)</li>
    <li>Material assignment in `src/lib/engine/generation/materials.ts` (culture affinity × phase technology × geological scarcity weighting, trade-aware availability) and a material property model (formability, hardness, working-state axes) it grades decoration against</li>
    <li>Decorative motif and introduced-material resolution in `src/lib/engine/generation/decoration.ts` (cultural motif vocabularies plus cross-cultural exchange, per-technique introduced-material tag sets, material-aware execution grading)</li>
    <li>Unified feature extraction and rule-based tag classification in `src/lib/engine/generation/classification.ts` and `src/lib/data/classification.ts` (43 rules; culture-phase baseline sampling via `engine/generation/baselines.ts` for tags scored relative to a culture's own norms, doc 11 §2.9)</li>
    <li>Description generation in `src/lib/engine/generation/prose.ts`, drawing on the observational register templates in `src/lib/data/descriptions/observational/`</li>
    <li>The Project Explorer at `/dev/explorer` (dev builds only): a developer workbench with nine panels — an overview, PRNG output, a live type index with dependency and reference graphs, structure viewer, plausibility panel, material viewer, decoration inspector, tag inspector and rule calibration</li>
    <li>A CLI sampler suite (`deno task sample*`, see [`scripts/dev/README.md`](scripts/dev/README.md)) for eyeballing pipeline output stage by stage ahead of its Explorer panel landing</li>
    <li>The full design specification in `docs/`</li>
  </ul>
</details>

## Quick Start

Requires [Deno](https://deno.com). There is no `package.json`; dependencies resolve through
`deno.json` on first run.

```bash
deno task dev        # Dev server with HMR
deno task build      # Production build
deno task preview    # Preview the production build
deno task check      # Type checking
deno task test       # Run tests
deno fmt             # Format
deno lint            # Lint

# Milestone 2 pipeline samplers (gum menu, or run one directly; --json for raw output)
deno task sample                  # menu over the samplers below
deno task sample:artefact         # anatomy tree + plausibility verdict
deno task sample:materials        # anatomy tree with each part's material pick
deno task sample:decoration       # anatomy tree with decorative layers nested per part
deno task sample:features         # annotated classifier reading, per-value provenance
deno task sample:classification   # scored tag map with per-rule contributions
```

## Tech Stack

- **Runtime**: Deno
- **Framework**: Svelte 5 (Runes) + SvelteKit 2
- **Build**: Vite 7
- **Styling**: Tailwind CSS 4 + DaisyUI 5
- **Language**: TypeScript
- **Adapter**: `@deno/svelte-adapter` (deploys to Deno Deploy)

## Documentation

- [Project Knowledge Overview](docs/00-project-overview.md): index of design documents 01 to 13
- [MVP Roadmap](docs/roadmaps/mvp.md): milestone-by-milestone execution plan
- [Agent Guide](.claude/CLAUDE.md): development guidance for AI coding assistants

## Contributing

A personal project by [Jason Warren](https://github.com/JasonWarrenUK). Feedback and suggestions are
welcome via issues.

## Licence

`© Goblin Uprising` - All rights reserved.
