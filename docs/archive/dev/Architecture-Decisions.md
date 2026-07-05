# Architecture Decisions

This document records key architectural decisions made during the development of **Those Who Came Before**, along with the rationale behind each choice and considered alternatives.

---

## ADR 001: Svelte 5 with Runes API

**Status**: Accepted

**Context**: Need a reactive framework for building the game UI with minimal boilerplate and excellent performance.

**Decision**: Use Svelte 5.0 with the new Runes API (`$state`, `$derived`, etc.) instead of Svelte 4 or other frameworks.

**Rationale**:
- **Modern Reactivity**: Runes provide explicit, predictable reactivity
- **Less Magic**: Clearer than Svelte 4's implicit reactivity
- **Performance**: Compiled output, smaller bundle size than React/Vue
- **TypeScript Support**: Excellent TypeScript integration
- **Learning Opportunity**: Gain experience with Svelte 5's cutting-edge features

**Alternatives Considered**:
- **React**: More ecosystem, but heavier and more verbose
- **Vue 3**: Good reactivity model, but larger community footprint
- **Svelte 4**: More stable, but missing modern Runes API

**Consequences**:
- ✅ Clean, readable code with minimal boilerplate
- ✅ Fast runtime performance
- ✅ Excellent developer experience
- ⚠️ Smaller ecosystem than React
- ⚠️ Runes API is newer, less Stack Overflow answers

---

## ADR 002: SvelteKit for Application Framework

**Status**: Accepted

**Context**: Need routing, build tooling, and project structure.

**Decision**: Use SvelteKit 2.22 as the application framework.

**Rationale**:
- **Official Framework**: First-party support from Svelte team
- **File-based Routing**: Intuitive routing via filesystem
- **Vite Integration**: Fast dev server and HMR
- **Adapter System**: Flexible deployment options
- **Future-proof**: SSR capabilities for future expansion

**Alternatives Considered**:
- **Vanilla Svelte + Custom Build**: Too much manual configuration
- **Vite + Svelte Plugin**: Missing routing and conventions
- **Sapper**: Deprecated predecessor to SvelteKit

**Consequences**:
- ✅ Conventional project structure
- ✅ Built-in routing system
- ✅ Optimized production builds
- ✅ Easy to add SSR later if needed
- ⚠️ Framework lock-in (but minimal)

---

## ADR 003: Client-Side Only Architecture

**Status**: Accepted (for MVP)

**Context**: Need to determine if the game requires server-side logic.

**Decision**: Build as a **pure client-side application** with no backend API or database.

**Rationale**:
- **Simplicity**: Faster development without backend complexity
- **Cost**: No server hosting costs
- **Portability**: Can deploy to any static host
- **Scope**: Current features don't require server logic
- **MVP First**: Can add backend later if needed

**Alternatives Considered**:
- **Full-Stack SvelteKit**: SSR + API routes + database
- **Headless CMS**: Overkill for simple data
- **Firebase/Supabase**: Unnecessary for MVP

**Consequences**:
- ✅ Simple deployment (static hosting)
- ✅ Fast development iteration
- ✅ No infrastructure costs
- ⚠️ No persistence between sessions
- ⚠️ No multiplayer capability
- ⚠️ No server-side validation

**Future Migration Path**: Can add API routes and database when needed without major refactor.

---

## ADR 004: Centralized State with Svelte 5 Runes

**Status**: Accepted

**Context**: Need to share game state between multiple components.

**Decision**: Use a **single global state object** (`gameState.svelte.ts`) with Svelte 5 Runes instead of multiple stores or component-local state.

**Rationale**:
- **Single Source of Truth**: All game data in one place
- **Simplicity**: One store to import, not many
- **Runes Benefits**: Clearer than traditional Svelte stores
- **Testability**: Easy to test isolated from components

**Alternatives Considered**:
- **Multiple Svelte Stores**: More granular, but overhead for this scale
- **Component State**: Doesn't work for shared data
- **Context API**: Over-engineered for flat component tree
- **External Store (Zustand/Pinia)**: Unnecessary dependency

**Consequences**:
- ✅ Clear data flow (components → services → store)
- ✅ Easy to reason about state changes
- ✅ Simple to add features (one state object to extend)
- ⚠️ Could grow large if many features added
- ⚠️ All consumers re-render on any change (acceptable for this scale)

**Pattern**:
```typescript
// One centralized state object
export const gameState = createGameState();

// Components import and use
import { gameState } from '$lib/stores/gameState.svelte';
let items = gameState.itemsUsed; // Reactive
```

---

## ADR 005: Service Layer Pattern

**Status**: Accepted

**Context**: Need to separate business logic from UI components.

**Decision**: Extract game logic into **service functions** (`src/lib/services/`) that components call.

**Rationale**:
- **Separation of Concerns**: UI and logic decoupled
- **Testability**: Services can be tested without components
- **Reusability**: Logic can be called from multiple places
- **Readability**: Components stay focused on presentation

**Alternatives Considered**:
- **Logic in Components**: Harder to test and reuse
- **Custom Hooks Pattern**: Not idiomatic in Svelte
- **Class-Based Services**: Over-engineered for functional logic

**Consequences**:
- ✅ Clean component code (mostly presentation)
- ✅ Business logic easy to unit test
- ✅ Clear boundaries between layers
- ⚠️ Slight indirection (component → service → store)

**Example**:
```typescript
// Service function
export function itemCreateSet(amount: number): GeneratedItem[] {
  // Business logic here
}

// Component calls service
import { itemCreateSet } from '$lib/services/itemGenerator';
function handleClick() {
  itemCreateSet(3);
}
```

---

## ADR 006: Immutable State Updates

**Status**: Accepted

**Context**: Svelte 5 Runes support mutable state, but need to decide on update pattern.

**Decision**: Use **immutable update patterns** (spread operators, array slicing) instead of direct mutation.

**Rationale**:
- **Predictability**: Clear when state changes occur
- **Debugging**: Easier to trace state transitions
- **Testing**: Can compare old vs new state
- **Best Practice**: Aligns with React/Redux patterns
- **Future-Proof**: Easier to add undo/redo or time-travel

**Alternatives Considered**:
- **Direct Mutation**: Simpler syntax, but less traceable
- **Immer**: Overkill for simple state shape

**Consequences**:
- ✅ Explicit state changes
- ✅ Compatible with debugging tools
- ✅ Easy to add state history tracking
- ⚠️ Slightly more verbose syntax
- ⚠️ Performance cost (acceptable for small arrays)

**Example**:
```typescript
// Immutable removal
state.itemsAvailable = [
  ...state.itemsAvailable.slice(0, index),
  ...state.itemsAvailable.slice(index + 1)
];

// Not:
state.itemsAvailable.splice(index, 1); // Mutation
```

---

## ADR 007: Tailwind CSS + DaisyUI

**Status**: Accepted

**Context**: Need styling solution that's fast to develop with and looks professional.

**Decision**: Use **Tailwind CSS 4.0** for utilities + **DaisyUI 5.1** for component theming.

**Rationale**:
- **Rapid Prototyping**: Utility classes enable fast iteration
- **Consistency**: DaisyUI provides cohesive design system
- **Themes**: Built-in light/dark themes
- **Component Library**: Pre-built timeline, cards, buttons
- **No CSS Files**: Styles co-located with markup

**Alternatives Considered**:
- **Plain CSS**: Too much manual work
- **CSS Modules**: More boilerplate than Tailwind
- **UI Library (MUI/Chakra)**: Heavier, more opinionated
- **CSS-in-JS**: Runtime cost, not idiomatic in Svelte

**Consequences**:
- ✅ Fast UI development
- ✅ Professional appearance out of the box
- ✅ Small bundle size (Tailwind purges unused)
- ⚠️ Verbose class strings in templates
- ⚠️ Learning curve for Tailwind syntax

---

## ADR 008: TypeScript Strict Mode

**Status**: Accepted

**Context**: Need to decide on TypeScript configuration strictness.

**Decision**: Use **strict TypeScript** with no implicit any, strict null checks, etc.

**Rationale**:
- **Safety**: Catch errors at compile time
- **Documentation**: Types serve as inline docs
- **Refactoring**: Safe to rename/move code
- **Best Practice**: Industry standard for new projects

**Alternatives Considered**:
- **Loose TypeScript**: Faster initial development, but more runtime errors
- **JavaScript**: No type safety at all

**Consequences**:
- ✅ High confidence in code correctness
- ✅ Excellent IDE support (autocomplete, refactoring)
- ✅ Easier onboarding (types document intent)
- ⚠️ Slightly slower initial development
- ⚠️ Must maintain type definitions

---

## ADR 009: No Runtime Validation (Yet)

**Status**: Accepted (for MVP)

**Context**: Static data from TypeScript definitions, no external data sources yet.

**Decision**: **No runtime validation** library (Zod, Yup, etc.) for the MVP.

**Rationale**:
- **YAGNI**: No external data to validate currently
- **Type Safety Sufficient**: TypeScript catches errors at compile time
- **Simplicity**: One less dependency to manage

**Alternatives Considered**:
- **Zod**: Great for API validation, but no APIs yet
- **Yup**: Similar to Zod
- **Custom Validation**: Over-engineered for static data

**Consequences**:
- ✅ Simpler codebase
- ✅ Faster builds (one less transform)
- ⚠️ Will need validation when adding user input/backend
- ⚠️ No runtime type safety from external sources

**Future Path**: Add Zod when integrating external data or user-generated content.

---

## ADR 010: Node Adapter for Deployment

**Status**: Accepted

**Context**: Need to choose a SvelteKit adapter for production deployment.

**Decision**: Use `@sveltejs/adapter-node` for Node.js deployment.

**Rationale**:
- **Flexibility**: Can deploy to any Node.js host
- **SSR Ready**: Supports server-side rendering if needed later
- **No Vendor Lock-in**: Not tied to specific platform
- **Future-Proof**: Easy migration to other platforms

**Alternatives Considered**:
- **adapter-static**: Simpler, but can't add SSR later
- **adapter-vercel**: Vendor lock-in
- **adapter-cloudflare**: Different runtime constraints

**Consequences**:
- ✅ Deploy to Render, Railway, Fly.io, Docker, etc.
- ✅ Can add SSR/API routes without adapter change
- ✅ Standard Node.js environment
- ⚠️ Requires Node.js runtime (can't use pure CDN)
- ⚠️ Slightly more complex than static adapter

**Note**: Can switch to `adapter-static` if server features aren't needed.

---

## ADR 011: No Testing Framework (MVP)

**Status**: Accepted (temporary)

**Context**: Limited development time for MVP, need to prioritize features.

**Decision**: **No automated tests** in the initial MVP. Add tests later.

**Rationale**:
- **Speed**: Faster to build features without tests initially
- **Exploration**: Still discovering the right patterns
- **Small Scope**: Easy to manually test at this stage

**Alternatives Considered**:
- **Vitest + Testing Library**: Best long-term choice
- **Jest**: Slower than Vitest for Vite projects

**Consequences**:
- ✅ Faster feature development
- ✅ More time for experimentation
- ⚠️ **Technical Debt**: Must add tests before scaling
- ⚠️ Higher risk of regression bugs
- ⚠️ Harder to refactor confidently

**Future Path**: Add Vitest + Testing Library when:
- Core features stabilize
- Multiple contributors join
- Codebase grows beyond ~1000 LOC

**Priority**: High priority to add after MVP validation.

---

## Summary of Key Decisions

| Decision | Status | Impact |
|----------|--------|--------|
| Svelte 5 + Runes | Accepted | High - Core framework |
| SvelteKit | Accepted | High - Project structure |
| Client-Side Only | Accepted (MVP) | Medium - Can add backend later |
| Centralized State | Accepted | Medium - Single source of truth |
| Service Layer | Accepted | Medium - Clean architecture |
| Immutable Updates | Accepted | Low - Code style |
| Tailwind + DaisyUI | Accepted | Medium - Styling approach |
| TypeScript Strict | Accepted | High - Type safety |
| No Runtime Validation | Accepted (MVP) | Low - Add when needed |
| Node Adapter | Accepted | Low - Deployment flexibility |
| No Tests | Accepted (temporary) | High - Technical debt |

---

## Decision Making Principles

When making architectural decisions for this project, we prioritize:

1. **Simplicity First**: Choose the simplest solution that works
2. **YAGNI**: Don't add complexity for hypothetical futures
3. **Escape Hatches**: Prefer decisions that are easy to reverse
4. **Learning Value**: Embrace modern tools for education
5. **Developer Experience**: Optimize for iteration speed

---

## References

- [Architectural Decision Records (ADR) Pattern](https://adr.github.io/)
- [YAGNI Principle](https://martinfowler.com/bliki/Yagni.html)
- [Svelte 5 Documentation](https://svelte.dev/docs/runes)
- [SvelteKit Documentation](https://kit.svelte.dev/docs)
