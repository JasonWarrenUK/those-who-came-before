# Technical Overview

This document provides a comprehensive technical overview of the **Those Who Came Before** codebase, covering architecture, implementation patterns, and key technical decisions.

## Architecture

The application follows a **client-side SPA architecture** built with SvelteKit. There is no backend API - all game logic runs in the browser.

### Tech Stack

- **Framework**: Svelte 5.0 (Runes API) + SvelteKit 2.22
- **Build Tool**: Vite 7.0 with SvelteKit adapter-node
- **Styling**: Tailwind CSS 4.0 + DaisyUI 5.1
- **Language**: TypeScript 5.0 (strict mode)
- **Deployment**: Node adapter (SSR-capable, though currently static)

### Design Patterns

- **Service Layer Pattern**: Business logic separated from UI components
- **Centralized State Management**: Single source of truth via Svelte 5 Runes
- **Component Composition**: Feature components compose the main page
- **Immutable State Updates**: New references created on state changes

---

## Project Structure

```
those-who-came-before/
├── src/
│   ├── routes/                    # SvelteKit file-based routing
│   │   ├── +page.svelte          # Main game page (composes UI)
│   │   └── +layout.svelte        # Root layout (Header/Footer wrapper)
│   ├── lib/
│   │   ├── components/           # Svelte UI components
│   │   │   ├── ItemGenerator.svelte  # Artifact generation UI
│   │   │   ├── Timeline.svelte       # Discovery history
│   │   │   ├── Tasks.svelte          # Mission tracking
│   │   │   ├── Header.svelte         # App header
│   │   │   └── Footer.svelte         # App footer
│   │   ├── services/             # Business logic layer
│   │   │   └── itemGenerator.ts      # Item generation algorithms
│   │   ├── stores/               # State management
│   │   │   └── gameState.svelte.ts   # Global game state (Runes)
│   │   ├── types/                # TypeScript interfaces
│   │   │   └── item.ts               # Item type definitions
│   │   ├── data/                 # Static data
│   │   │   ├── items.ts              # Item types catalog
│   │   │   └── materials.ts          # Material categories
│   │   ├── utils/                # Helper functions
│   │   │   └── indexRandom.ts        # Random index generator
│   │   └── index.ts              # Library exports
│   ├── app.html                  # HTML template
│   ├── app.css                   # Global styles
│   └── app.d.ts                  # TypeScript declarations
├── static/                       # Static assets
│   └── favicon.svg
├── backlog/                      # Archived code/docs
├── docs/                         # Documentation
├── CLAUDE.md                     # AI assistant guide
├── package.json                  # Dependencies & scripts
├── svelte.config.js              # SvelteKit configuration
├── vite.config.ts                # Vite configuration
├── tsconfig.json                 # TypeScript configuration
└── eslint.config.js              # ESLint configuration
```

---

## Key Components

### ItemGenerator.svelte

**Purpose**: UI for generating new artifacts

**Responsibilities**:
- Renders "Generate Artifacts" button
- Displays count of available item types
- Calls `itemCreateSet()` service function
- Subscribes to `gameState.itemsAvailable`

**Key Code** (`src/lib/components/ItemGenerator.svelte`):
```typescript
import { itemCreateSet } from '$lib/services/itemGenerator';
import { gameState } from '$lib/stores/gameState.svelte';

function handleGenerate() {
  itemCreateSet(3); // Generate 3 artifacts
}
```

### Timeline.svelte

**Purpose**: Display chronological list of discovered artifacts

**Responsibilities**:
- Renders DaisyUI timeline component
- Subscribes to `gameState.itemsUsed`
- Auto-updates when new artifacts are discovered

**State Binding**:
```typescript
import { gameState } from '$lib/stores/gameState.svelte';
// Component automatically re-renders when gameState.itemsUsed changes
```

### Tasks.svelte

**Purpose**: Track mission progress

**Responsibilities**:
- Displays task completion status
- Calculates progress based on discovered items
- Uses `$derived` runes for computed values

**Computed State**:
```typescript
let taskProgress = $derived(
  gameState.itemsUsed.length >= TARGET_COUNT
);
```

---

## State Management

### Svelte 5 Runes

The application uses **Svelte 5's Runes API** for reactivity instead of traditional Svelte stores.

**Key File**: `src/lib/stores/gameState.svelte.ts`

### State Shape

```typescript
interface GameState {
  itemsAvailable: Item[];      // Items not yet discovered
  itemsUsed: GeneratedItem[];  // Discovered artifacts
}
```

### API

```typescript
// Read-only getters
gameState.itemsAvailable  // Array of available items
gameState.itemsUsed       // Array of discovered items

// Mutators
gameState.markItemUsed(item: GeneratedItem)  // Add discovery
gameState.reset()                             // Reset game
```

### Implementation Pattern

Uses `$state` rune for reactive state and immutable update patterns:

```typescript
function createGameState() {
  let state = $state<GameState>({
    itemsAvailable: [...items],
    itemsUsed: []
  });

  return {
    get itemsAvailable() {
      return state.itemsAvailable;
    },
    markItemUsed(item: GeneratedItem) {
      // Immutable removal from available
      const index = state.itemsAvailable.findIndex(i => i.type === item.type);
      if (index !== -1) {
        state.itemsAvailable = [
          ...state.itemsAvailable.slice(0, index),
          ...state.itemsAvailable.slice(index + 1)
        ];
      }
      // Immutable addition to used
      state.itemsUsed = [...state.itemsUsed, item];
    }
  };
}
```

### Why Immutable Updates?

While Svelte 5 supports mutable state, this project uses **immutable patterns** for:
1. **Predictability**: Clear state transitions
2. **Debugging**: Easy to trace state changes
3. **Testing**: Simpler to verify state mutations
4. **Migration Path**: Easier to add undo/redo or time-travel debugging

---

## Validation

### Type Safety

Strict TypeScript enforces type safety across the application:

```typescript
// src/lib/types/item.ts
export interface Item {
  type: string;
}

export interface GeneratedItem extends Item {
  material: string;
}
```

**Type Flow**:
1. `Item` → Base item type from catalog
2. `GeneratedItem` → Item with material applied
3. Services enforce transformation: `Item` → `GeneratedItem`

### Runtime Validation

Currently **no runtime validation** is performed. All data is statically defined and type-checked at compile time.

**Future**: Could add Zod or similar for:
- User input validation
- External data parsing
- API response validation (when backend added)

---

## Configuration

### Vite Configuration

**File**: `vite.config.ts`

Standard SvelteKit + Vite setup. No custom plugins or complex configuration.

### SvelteKit Configuration

**File**: `svelte.config.js`

```javascript
import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

export default {
  preprocess: vitePreprocess(),
  kit: { adapter: adapter() }
};
```

Uses **adapter-node** for Node.js deployment (SSR-capable).

### Tailwind + DaisyUI

**Styling Stack**:
- Tailwind CSS 4.0 (utility-first CSS)
- DaisyUI 5.1 (component library)
- Tailwind plugins: `@tailwindcss/forms`, `@tailwindcss/typography`

**Integration**: Via `@tailwindcss/vite` plugin in Vite config.

---

## Error Handling

### Current State

**Minimal error handling** - appropriate for the current scale:

- Service functions return `null` when items run out
- Components check for `null` returns
- No global error boundary
- No user-facing error messages

### Error Scenarios

1. **No Items Available**: `itemCreateRandom()` returns `null`
2. **Invalid Data**: Prevented by TypeScript
3. **Runtime Errors**: Uncaught (will crash component)

### Future Improvements

- Add error boundaries for component failures
- User-facing error notifications
- Logging service for debugging
- Graceful degradation

---

## Development Workflow

### Commands

```bash
# Development
npm run dev              # Start dev server (localhost:5173)

# Type Checking
npm run check            # One-time type check
npm run check:watch      # Continuous type checking

# Code Quality
npm run lint             # Prettier + ESLint
npm run format           # Auto-format code

# Build
npm run build            # Production build
npm run preview          # Preview production build
```

### Hot Module Replacement (HMR)

Vite provides fast HMR for:
- Svelte components
- TypeScript modules
- CSS/Tailwind styles

State is **not preserved** during HMR by default.

### Type Checking

Uses `svelte-check` for TypeScript validation across `.svelte` files.

**Important**: Run `npm run prepare` after pulling updates to sync SvelteKit types.

---

## Environment Variables

### Current State

**No environment variables** are currently used.

The application is fully client-side with no:
- API endpoints
- External services
- Secret keys
- Environment-specific configuration

### Future Considerations

When adding persistence or backend services, will need:
- `PUBLIC_API_URL` - API endpoint
- `DATABASE_URL` - Database connection (if using server-side storage)
- `SESSION_SECRET` - Session encryption key

**SvelteKit Convention**: Prefix public env vars with `PUBLIC_`

---

## Testing Approach

### Current State

**No automated tests** are currently implemented.

### Testing Strategy (Future)

Recommended testing layers:

1. **Unit Tests** (Vitest):
   - Test service functions (`itemGenerator.ts`)
   - Test utility functions (`indexRandom.ts`)
   - Test state management logic

2. **Component Tests** (Vitest + Testing Library):
   - Test component rendering
   - Test user interactions
   - Test state integration

3. **E2E Tests** (Playwright):
   - Test full game flow
   - Test cross-browser compatibility
   - Test responsive behavior

---

## Deployment

### Build Output

```bash
npm run build
```

Creates:
- `build/` - Node.js server + static assets
- Optimized and minified code
- Pre-rendered pages (if configured)

### Deployment Options

**Current Adapter**: `@sveltejs/adapter-node`

Compatible with:
- Node.js hosting (Render, Railway, Fly.io)
- Docker containers
- Serverless Node environments

**Alternative Adapters**:
- `@sveltejs/adapter-static` - Pure static hosting (Netlify, Vercel, GitHub Pages)
- `@sveltejs/adapter-vercel` - Vercel optimized
- `@sveltejs/adapter-cloudflare` - Cloudflare Workers

### Environment Requirements

- Node.js 18+
- npm 9+
- Modern browser support (ES2020+)

---

## Further Reading

### Internal Documentation

- [Getting Started](../Getting-Started.md) - Setup and usage
- [Architecture Decisions](Architecture-Decisions.md) - Design rationale
- [CLAUDE.md](../../CLAUDE.md) - AI assistant guide

### External Resources

- [SvelteKit Documentation](https://kit.svelte.dev/docs)
- [Svelte 5 Runes](https://svelte.dev/docs/runes)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [DaisyUI Components](https://daisyui.com/components/)
- [Vite](https://vite.dev/)
- [TypeScript](https://www.typescriptlang.org/docs/)
