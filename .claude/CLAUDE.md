# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Those Who Came Before** is an interactive archaeological artifact discovery game built with SvelteKit. The application randomly generates artifact combinations (item types + materials) and tracks discovered items in a timeline view with task-based progression.

## Runtime

This project uses **Deno** exclusively. Do not use `npm`, `npx`, `node`, or any Node-specific tooling. All tasks are defined in `deno.json` and run via `deno task`.

## Development Commands

### Setup
```bash
deno install
```

### Development Server
```bash
deno task dev
```
Starts Vite dev server with hot module replacement.

### Build
```bash
deno task build
```
Creates production-optimized build using Vite + SvelteKit adapter-node.

### Preview Production Build
```bash
deno task preview
```
Preview the production build locally before deployment.

### Type Checking
```bash
deno task check          # One-time type check
deno task check:watch    # Continuous type checking
```
Runs `svelte-check` to validate TypeScript types across Svelte components.

### Testing
```bash
deno task test           # One-time test run
deno task test:watch     # Continuous testing
```
Runs Vitest against `tests/**/*.test.ts`.

### Code Quality
```bash
deno task lint           # Check formatting + ESLint
deno task format         # Auto-format with Prettier
```

## Architecture

### Tech Stack
- **Runtime**: Deno
- **Framework**: Svelte 5.0 (using Runes) + SvelteKit 2.22
- **Build Tool**: Vite 6.0
- **Styling**: Tailwind CSS 4.0 + DaisyUI 5.1
- **Language**: TypeScript 5.0
- **Deployment**: Node adapter (SSR-capable via Deno's Node compat)

### State Management
This project uses **Svelte 5 Runes** for reactivity:
- `src/lib/stores/gameState.svelte.ts` - Central game state using `$state` rune
- Components subscribe automatically by accessing state properties
- Uses `$derived` for computed values (not traditional reactive declarations)
- State updates use **immutable patterns** (new array references) despite Svelte's mutability support

### Key Directories
```
src/
├── routes/                    # SvelteKit file-based routing
│   ├── +page.svelte          # Main entry point (composes game UI)
│   └── +layout.svelte        # Root layout (Header/Footer wrapper)
├── lib/
│   ├── components/           # UI components (Header, Footer, ItemGenerator, Timeline, Tasks)
│   ├── services/             # Business logic layer
│   │   └── itemGenerator.ts  # Item generation algorithms
│   ├── stores/               # Global state (Svelte 5 Runes)
│   │   └── gameState.svelte.ts
│   ├── types/                # TypeScript interfaces
│   ├── data/                 # Static data (item types, materials)
│   └── utils/                # Helper functions
```

### Data Flow
1. User clicks "Generate Artifacts" in `ItemGenerator.svelte`
2. Component calls `itemCreateSet()` from `itemGenerator.ts`
3. Service generates random items and calls `gameState.markItemUsed()`
4. All subscribed components auto-update:
   - `Tasks.svelte` - Updates mission progress
   - `Timeline.svelte` - Appends to discovery history
   - `ItemGenerator.svelte` - Updates available count

### Important Patterns

**Centralized State**: All game state lives in `gameState.svelte.ts`. No component-level state for game data.

**Service Layer**: Business logic is in `src/lib/services/`, not in components. Components call services; services mutate the store.

**Immutable Updates**: State mutations create new array references:
```typescript
state.itemsAvailable = [
  ...state.itemsAvailable.slice(0, index),
  ...state.itemsAvailable.slice(index + 1)
];
```

**Type Safety**: Strict TypeScript with clear domain types (`Item` → `GeneratedItem`). Type definitions in `src/lib/types/`.

**No Backend**: Pure client-side application. No API routes, no persistence layer (yet).

## Component Architecture

- **Layout Components**: `+layout.svelte` provides structural wrapper
- **Page Components**: `+page.svelte` composes feature components
- **Feature Components**: Self-contained (ItemGenerator, Timeline, Tasks)
- **Utility Components**: Reusable layout blocks (Header, Footer)

## Styling

Uses **DaisyUI** component classes on top of **Tailwind CSS**:
- Themes: Caramellatte + Coffee
- Pre-built components: cards, buttons, timelines, badges
- Tailwind class ordering enforced via Prettier plugin

## File Naming Conventions

- Svelte components: PascalCase (e.g., `ItemGenerator.svelte`)
- TypeScript files: camelCase (e.g., `itemGenerator.ts`)
- SvelteKit routes: `+page.svelte`, `+layout.svelte` (framework convention)

## Development Status

Project is **under construction**. Core game loop is complete, but lacks:
- Persistence layer
- Advanced features from backlog
- Comprehensive documentation
