# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Those Who Came Before** is an archaeological artifact discovery game where player mistakes compound into an unreliable narrative. The core mechanic: your interpretations create a lens that filters future observations, leading to confirmation bias and systematic error.

**Current Status**: Extensive design specification (docs 00-13) with minimal implementation. A basic SvelteKit tech demo exists (item+material generation), but the full system remains unbuilt.

## Critical Context

### Documentation Primacy

This project has **13 comprehensive design documents** (docs/00-13) that specify every system in detail. When working on this codebase:

1. **Always check the design docs first** before implementing anything
2. The docs are the source of truth, not the current code
3. Current implementation is ~2% complete; most systems exist only in specification

### Reading Guide by Task

- **Understanding the vision**: Read docs 02 (Design Pillars) → 03 (Core Loop) → 04 (Interpretive Lens)
- **Implementing a feature**: Read doc 09 (Roadmap) → relevant spec doc → doc 08 (Architecture)
- **Working on generation**: Doc 05 (Generation Architecture) — most technically dense
- **Working on documents/career**: Doc 06 (Knowledge Model) → doc 07 (Career) → doc 10 (Documents)
- **Understanding decisions**: Doc 11 (Deferred Decisions) → doc 13 (Post-MVP)

## Development Commands

**Note**: Project targets Deno runtime but hasn't migrated yet. Current commands assume Node/npm until Phase 1 migration.

### Current (Pre-Migration)
```bash
npm install              # Setup (when package.json exists)
npm run dev              # Dev server with HMR
npm run build            # Production build
npm run preview          # Preview production build
npm run check            # Type checking
npm run check:watch      # Continuous type checking
npm run lint             # Check formatting + ESLint
npm run format           # Auto-format with Prettier
```

### Target (Post-Deno Migration — Phase 1)
```bash
deno task dev            # Dev server
deno task build          # Production build
deno task preview        # Preview build
deno task check          # Type checking
deno fmt                 # Format (replaces Prettier)
deno lint                # Lint (replaces ESLint)
deno test                # Run tests
```

## Architecture

### Tech Stack

**Current**:
- Framework: Svelte 5.0 (Runes) + SvelteKit 2.22
- Build: Vite 7.0
- Styling: Tailwind CSS 4.0 + DaisyUI 5.1
- Language: TypeScript 5.0
- Runtime: Node (to be replaced)

**Target** (from doc 08):
- Runtime: Deno (native TypeScript, built-in tooling)
- Adapter: `adapter-deno` (replaces `adapter-node`)
- Everything else unchanged

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

From doc 09. Work proceeds in **demonstrable phases**:

### Phase 1: Foundation
- Deno migration
- Type system (all interfaces from design docs)
- Seeded PRNG
- Test infrastructure

### Phase 2: Component Grammar
- Geometric primitives
- Bottom-up composition
- Typed joins

### Phase 3: Plausibility Checker
- Physical viability rules
- Ergonomic constraints

### Phase 4–7: See doc 09 for full sequence

**Each phase produces something runnable and testable.** The Project Explorer (`/dev/explorer`) is the developer workbench that grows with each phase.

## File Naming Conventions

- Svelte components: `PascalCase.svelte`
- TypeScript files: `camelCase.ts`
- SvelteKit routes: `+page.svelte`, `+layout.svelte`
- Type files: `camelCase.ts` in `src/lib/types/`

## Styling

Uses **DaisyUI** on **Tailwind CSS**:
- Themes: caramellatte (light) + coffee (dark)
- Pre-built components: cards, buttons, timelines, badges
- Tailwind class ordering via Prettier plugin (until Deno migration)

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
- ✅ SvelteKit structure with Svelte 5 Runes
- ✅ Basic reactive state management
- ✅ Simple item+material generation (coin-flip random, not simulation)
- ✅ Timeline component
- ✅ DaisyUI styling

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
2. If yes: implement per spec in the appropriate phase (doc 09)
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

Features grow per phase:
- Phase 1: Seed input, PRNG output display, type index
- Phase 2: Structure viewer, culture profile selector, re-roll button
- Phase 3: Plausibility panel with rejection reasons
- Later phases: Add tabs for lens testing, contradiction inspection, document lineage, etc.

## Migration Notes

### From Current Codebase to Target

What gets preserved:
- SvelteKit structure (`src/routes/`, `src/lib/`)
- Svelte 5 Runes patterns
- Tailwind + DaisyUI
- Component architecture philosophy
- Immutable update patterns

What gets replaced:
- `package.json` → `deno.json`
- `eslint.config.js` → `deno lint`
- `.prettierrc` → `deno fmt`
- `src/lib/services/itemGenerator.ts` → `src/lib/engine/generation/pipeline.ts` (9 modules)
- `src/lib/stores/gameState.svelte.ts` → Split into 4 stores + orchestrator
- `src/lib/data/items.ts` → `src/lib/data/grammars/primitives.ts`

See doc 08, section 8 for full migration sequence.

## Glossary

- **InterpretiveModel**: Agent-generic shape of an epistemic agent's beliefs (player or NPC)
- **Lens**: The filter that player's interpretations apply to future observations
- **Commitment**: A claim that's been published (hardest to retract)
- **Occluded property**: True property of world state that's hidden from all agents
- **Dissemination state**: Where a document is in publication pipeline
- **Absolute week**: Canonical timestamp spanning entire career (never resets)
- **Strain**: Accumulated pressure from unresolved contradictions

## References

- Doc 00: Project overview (navigation guide)
- Doc 02: Design pillars
- Doc 03: Core loop & systems map
- Doc 04: Interpretive lens (core mechanic)
- Doc 05: Generation architecture (9-stage pipeline)
- Doc 06: Knowledge & contradiction model
- Doc 07: Career & social systems
- Doc 08: Technical architecture (THIS IS YOUR BUILD GUIDE)
- Doc 09: Implementation roadmap (PHASE SEQUENCE)
- Doc 10: Document tradition system
- Doc 11: Deferred design questions (locked decisions)
- Doc 13: Post-MVP deferrals
