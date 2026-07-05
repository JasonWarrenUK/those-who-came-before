# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Those Who Came Before** is an archaeological artefact discovery game where player mistakes compound into an unreliable narrative. The core mechanic: your interpretations create a lens that filters future observations, leading to confirmation bias and systematic error.

**Current Status**: Extensive design specification (docs 00-13). The repo was reset for launch: `src/` holds a bare SvelteKit + Deno skeleton (one route, three static components, DaisyUI theming); the old tech demo is archived in `backlog/` as dead reference code. Implementation restarts from Milestone 1 of `docs/roadmaps/mvp.md` (Deno migration tasks 1FD.1–1FD.5 complete).

## Critical Context

### Documentation Primacy

This project has **14 comprehensive design documents** (docs/00-13) that specify every system in detail, plus an executable roadmap at `docs/roadmaps/mvp.md`. When working on this codebase:

1. **Always check the design docs first** before implementing anything
2. The docs are the source of truth for design; `docs/roadmaps/mvp.md` is the source of truth for task sequencing and completion state
3. Current implementation is ~2% complete; most systems exist only in specification

### Reading Guide by Task

- **Understanding the vision**: Read docs 02 (Design Pillars) → 03 (Core Loop) → 04 (Interpretive Lens)
- **Implementing a feature**: Read `docs/roadmaps/mvp.md` (authoritative task list + status) → relevant spec doc → doc 08 (Architecture)
- **Working on generation**: Doc 05 (Generation Architecture) — most technically dense
- **Working on documents/career**: Doc 06 (Knowledge Model) → doc 07 (Career) → doc 10 (Documents)
- **Understanding decisions**: Doc 11 (Deferred Decisions) → doc 13 (Post-MVP)

## Development Commands

The Deno migration is complete (roadmap tasks 1FD.1–1FD.5). There is no `package.json`; npm commands do not work here.

```bash
deno task dev            # Dev server with HMR
deno task build          # Production build
deno task preview        # Preview production build
deno task check          # Type checking (svelte-check via deno)
deno fmt                 # Format (replaced Prettier)
deno lint                # Lint (replaced ESLint)
deno test                # Run tests (runner config lands with task 1FD.34)
```

## Architecture

### Tech Stack

- Framework: Svelte 5 (Runes) + SvelteKit 2
- Build: Vite 7
- Styling: Tailwind CSS 4 + DaisyUI 5
- Language: TypeScript 5
- Runtime: Deno (native TypeScript, built-in tooling)
- Adapter: `@deno/svelte-adapter` (replaced `adapter-node`)

### State Architecture (Target)

From doc 08, section 3:

```
gameState (orchestrator — no domain data)
  ├── worldState                 # Objective reality (artefacts, scholars, documents)
  ├── playerInterpretation       # Player's InterpretiveModel (subjective)
  ├── termState                  # Academic calendar + energy budget
  ├── lensState                  # Derived from playerInterpretation
  └── ui                         # UI-only state
```

**Critical principle**: Engine code is agent-agnostic. Functions accept `InterpretiveModel` as a parameter — they never know whether they're processing the player's or an NPC's interpretation.

### Directory Structure (Target)

From doc 08, section 2:

```
src/
├── lib/
│   ├── engine/                 # Pure TypeScript, ZERO framework dependency
│   │   ├── generation/         # 9-stage pipeline (doc 05)
│   │   ├── world/              # Chronology, cultures, seed
│   │   ├── lens/               # 5 lens channels (doc 04)
│   │   ├── interpretation/     # Agent-generic claim operations
│   │   ├── documents/          # Document tradition (doc 10)
│   │   ├── contradiction/      # Detection, strain, resolution (doc 06)
│   │   ├── career/             # Reputation, progression (doc 07)
│   │   └── prng.ts             # Seeded PRNG
│   ├── types/                  # All TypeScript interfaces
│   ├── stores/                 # Svelte 5 reactive state
│   ├── components/             # Svelte components
│   ├── data/                   # Static data (grammars, materials, templates)
│   └── persistence/            # IndexedDB save/load
└── routes/                     # SvelteKit file-based routing
```

### Key Architectural Principles

**The Engine Boundary** (doc 08, section 2.1):
- Everything in `src/lib/engine/` is pure TypeScript
- No Svelte imports, no SvelteKit imports, no browser APIs
- Testable with `deno test` directly
- Takes inputs (seed, interpretive models, actions) → produces outputs (artefacts, lens states, contradictions)

**Agent-Generic Interpretation** (doc 11, section 2.6):
- Player and NPC scholars share the same `InterpretiveModel` interface
- Engine functions never know which agent they're processing
- Only UI/store layers treat player as special

**Immutable Updates**:
- All stores use Svelte 5 Runes with immutable patterns
- State mutations create new array/Map references

**Service Layer**:
- Business logic in `src/lib/engine/`, not in components
- Components call engine functions; engine mutates stores

## Important Patterns

### State Management

Uses **Svelte 5 Runes** throughout:
- `$state` for reactive values
- `$derived` for computed values (NOT reactive declarations)
- Immutable updates despite Svelte supporting mutability

Example store pattern (from doc 08, section 3.4):
```typescript
function createPlayerInterpretationStore() {
  let model = $state<InterpretiveModel>({ /* ... */ });

  return {
    get model() { return model; },  // Passed to engine functions
    get culturalClaims() { return model.culturalClaims; },  // Reactive getters

    addClaim(claim: Claim) {
      model.claims = new Map([...model.claims, [claim.id, claim]]);
    }
  };
}
```

### Data Flow

```
Route (+page.svelte)
  → Reads stores (reactive)
  → Passes data to components as props
  → Components emit events
  → Route handlers call gameState methods
  → gameState calls engine functions
  → Engine functions update stores
  → Components re-render
```

Components never import stores (except route-level pages).

### The Interpretive Lens (Core Mechanic)

From doc 04, the lens has 5 channels:
1. **Observation salience** — which properties are foregrounded
2. **Classification suggestions** — which tags are proposed
3. **Cross-reference priming** — which past artefacts are surfaced
4. **Descriptive framing** — how descriptions are worded
5. **Omission blindness** — what the player fails to notice

Lens strength formula (doc 04, section 3):
```
strength = f(dissemination_state, evidence_count, citation_count, teaching_activity)
```

Stronger lens = stronger filtering = more confirmation bias.

### Generation Pipeline (9 Stages)

From doc 05:
1. World seed
2. Chronology + culture generation
3. Initial corpus (NPC scholars, documents)
4. Bottom-up structural grammar (geometric primitives → components)
5. Structural normalisation + plausibility checking
6. Material assignment (culture bias + geological scarcity)
7. Decorative grammar (post-material, layered)
8. Feature extraction + tag classification
9. Description generation (register-filtered)

Each stage is independently testable. Determinism via seeded PRNG.

### Document Tradition

From doc 10:
- Documents are **immutable once disseminated** (mutable while private)
- Form a directed acyclic graph of intellectual lineage
- Dissemination states: private → circulated → presented → submitted → published → collected
- Documents contain **commitments** extracted from player's claims
- Peer review is **named** with specific reviewers
- Venues have structural properties determining prestige

### Time & Action Economy

From doc 11, section 2.8:
- **4 terms per year**: autumn, spring, summer-teaching, summer-research
- Each term is **12 modelled weeks** (48 weeks/year; 4 weeks implicit transition)
- **Absolute week counter** never resets — canonical timestamp
- Actions consume **time AND energy** from single budget
- Teaching drains apply to 3 terms; summer-research is drain-free
- Term boundaries trigger: dissemination resolution, strain accumulation, lens decay, career checks

## Implementation Roadmap

The execution roadmap is **`docs/roadmaps/mvp.md`**: 10 milestones (1FD Foundation → 10NP NPC Systems) with task IDs, checkbox completion state, dependency edges and a status table. Always take task selection and completion state from it. Doc 09 is the narrative source it was derived from (24 phases with design rationale); when they diverge on sequencing, `mvp.md` governs.

Milestone sequence: 1 Foundation (types, PRNG, tests, Explorer shell) → 2 Generation Pipeline → 3 World State & Integration → 4 Player Interface → 5 Knowledge Model → 6 Lens System → 7 Contradictions → 8 Persistence → 9 Career & Publication → 10 NPC Systems.

**Each milestone produces something runnable and testable.** The Project Explorer (`/dev/explorer`) is the developer workbench that grows with each milestone.

## File Naming Conventions

- Svelte components: `PascalCase.svelte`
- TypeScript files: `camelCase.ts`
- SvelteKit routes: `+page.svelte`, `+layout.svelte`
- Type files: `camelCase.ts` in `src/lib/types/`

## Styling

Uses **DaisyUI** on **Tailwind CSS**:
- Themes: caramellatte (light) + coffee (dark)
- Pre-built components: cards, buttons, timelines, badges
- Formatting via `deno fmt` (the `fmt-component` unstable flag covers Svelte files)

When building custom components:
- Follow DaisyUI class patterns
- Use DaisyUI colour tokens for consistency
- Build custom visualisations (evidence chains, lineage graphs) with Tailwind utilities

## Testing Strategy

From doc 08, section 5:

### Unit Tests (Engine)
- All engine modules get Deno tests
- Fast, no browser needed
- Deterministic via seeded PRNG

### Test Patterns
```typescript
// Determinism test
Deno.test("same seed produces same output", () => {
  const prng1 = createPrng("test-seed");
  const result1 = generate(prng1);

  const prng2 = createPrng("test-seed");
  const result2 = generate(prng2);

  assertEquals(result1, result2);
});

// Distribution test
Deno.test("culture bias affects material selection", () => {
  const metalCulture = createCulture({
    materialAffinities: { metal: 2.0, stone: 0.5 }
  });
  const results = Array.from({ length: 1000 }, () =>
    selectMaterial(metalCulture, prng)
  );

  const metalCount = results.filter(m => m.type === 'metal').length;
  assert(metalCount > 500); // Statistical expectation
});
```

### Snapshot Tests
For complex outputs (generated artefacts, lens-filtered descriptions).

## Current Implementation Status

**What exists**:
- ✅ SvelteKit + Svelte 5 scaffold on Deno (`deno.json`, `@deno/svelte-adapter` configured — tasks 1FD.1–1FD.5)
- ✅ Single route (`src/routes/+page.svelte`) and three static components (Header, Footer, Timeline empty state)
- ✅ Tailwind + DaisyUI theming (caramellatte/coffee) in `app.css`
- ✅ Old item+material demo archived in `backlog/` (dead reference code, not wired into the app)

**What's specified but unbuilt**:
- ⏳ Everything in docs 00-13
- ⏳ Component grammar system
- ⏳ World state (chronology, cultures, seed)
- ⏳ Interpretive lens mechanics
- ⏳ Document tradition
- ⏳ Career/reputation system
- ⏳ Contradiction detection
- ⏳ Persistence layer
- ⏳ NPC scholars

**Gap**: Design is ~95% complete, implementation is ~2% complete.

## Design Pillars (Non-Negotiable)

From doc 02:
1. **Error Is the Engine** — player mistakes are generative, not punitive
2. **Diegesis First** — no out-of-character information
3. **Simulation Honesty** — all content derives from same underlying data
4. **Accumulation Over Revelation** — knowledge builds incrementally
5. **Player Is Unreliable Narrator** — publications have consequences
6. **Clarity of State Over Spectacle** — legibility over polish

When making any design decision, these take precedence.

## Common Patterns to Follow

### When Adding a Feature

1. Check if it's already specified in docs 00-13
2. If yes: implement per spec in the appropriate milestone task (`docs/roadmaps/mvp.md`)
3. If no: check against design pillars (doc 02)
4. Ensure it fits the data flow (engine → stores → components)

### When Working with Generation

- All generation uses seeded PRNG (determinism is critical)
- Generation happens in engine layer (no framework dependencies)
- Cultural bias affects all random selection
- Everything derives from world state (no magic constants)

### When Working with Interpretation

- Player and NPC use same `InterpretiveModel` interface
- Claims have status: observation → inference → hypothesis → commitment
- Lens strength formula drives filtering
- Contradictions compare claims against occluded world properties

### When Working with Documents

- Documents are immutable once disseminated
- Extract commitments from claims when creating documents
- Dissemination is a state machine with career event transitions
- Venues determine prestige and review criteria

## Project Explorer

From doc 09: A developer-facing UI at `/dev/explorer` for testing each system as it's built. Not the player UI.

Features grow per milestone (see the Explorer-extension tasks in each milestone of `docs/roadmaps/mvp.md`):
- Milestone 1: Seed input, PRNG output display, type index
- Milestone 2: Structure viewer, plausibility panel, tag inspector, material/decoration/description viewers, corpus browser
- Milestone 3: Chronology timeline, culture profiles, store inspector
- Later milestones: Lens testing, contradiction inspection, document lineage, career state, NPC panels

## Migration Notes

The Deno migration (roadmap tasks 1FD.1–1FD.5) is complete: `deno.json` replaced `package.json`, and `deno fmt`/`deno lint` replaced Prettier/ESLint. The pre-migration tech demo (`itemGenerator.ts`, `materials.ts`, `item-grammars/`) lives in `backlog/` and is reference-only, not a porting source; new engine code is written fresh in `src/lib/engine/` per docs 05 and 08 and the roadmap tasks (pipeline at 2GN.x, stores at 3WS.x).

## Glossary

- **InterpretiveModel**: Agent-generic shape of an epistemic agent's beliefs (player or NPC)
- **Lens**: The filter that player's interpretations apply to future observations
- **Commitment**: A claim that's been published (hardest to retract)
- **Occluded property**: True property of world state that's hidden from all agents
- **Dissemination state**: Where a document is in publication pipeline
- **Absolute week**: Canonical timestamp spanning entire career (never resets)
- **Strain**: Accumulated pressure from unresolved contradictions
- **Spelling**: always "artefact", never "artifact", in identifiers, filenames and prose (British spelling throughout)

## References

- `docs/roadmaps/mvp.md`: Execution roadmap (TASK SEQUENCE — authoritative for what to build next)
- Doc 00: Project overview (navigation guide)
- Doc 01: Project audit (historical snapshot of the pre-reset codebase)
- Doc 02: Design pillars
- Doc 03: Core loop & systems map
- Doc 04: Interpretive lens (core mechanic)
- Doc 05: Generation architecture (9-stage pipeline)
- Doc 06: Knowledge & contradiction model
- Doc 07: Career & social systems
- Doc 08: Technical architecture (THIS IS YOUR BUILD GUIDE)
- Doc 09: Implementation roadmap narrative (source doc for mvp.md; design rationale)
- Doc 10: Document tradition system
- Doc 11: Deferred design questions (locked decisions)
- Doc 12: Propagation register (cross-doc consistency log)
- Doc 13: Post-MVP deferrals
