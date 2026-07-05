# Getting Started

Welcome to **Those Who Came Before** - an interactive archaeological artifact discovery game!

## Prerequisites

- **Node.js**: Version 18 or higher
- **npm**: Version 9 or higher (comes with Node.js)
- A modern web browser (Chrome, Firefox, Safari, or Edge)

## Installation

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone https://github.com/JasonWarrenUK/those-who-came-before.git
   cd those-who-came-before
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

## Running the Game

### Development Mode

Start the development server with hot module replacement:

```bash
npm run dev
```

The game will be available at `http://localhost:5173`

### Production Build

To create an optimized production build:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

## How to Play

### Generating Artifacts

1. Click the **"Generate Artifacts"** button to discover new archaeological treasures
2. Each artifact is a unique combination of an item type (axe, brooch, dagger, etc.) and a material
3. Discovered artifacts are added to your timeline and count toward mission completion

### Tracking Progress

- **Timeline**: View all your discovered artifacts in chronological order
- **Tasks Panel**: Track your progress on various missions
- **Available Items**: See how many artifact types remain to be discovered

### Game State

The game automatically tracks:
- Which artifacts you've discovered
- Which item types are still available
- Your progress on missions and tasks

Currently, the game state is **not persisted** between sessions. Refreshing the page will reset your progress.

## Development Tools

### Type Checking

Run TypeScript type checking:

```bash
npm run check
```

For continuous type checking during development:

```bash
npm run check:watch
```

### Code Formatting

Check code formatting:

```bash
npm run lint
```

Auto-format all code:

```bash
npm run format
```

## Project Structure

```
src/
├── routes/                    # SvelteKit pages
│   ├── +page.svelte          # Main game page
│   └── +layout.svelte        # Root layout
├── lib/
│   ├── components/           # UI components
│   │   ├── ItemGenerator.svelte
│   │   ├── Timeline.svelte
│   │   ├── Tasks.svelte
│   │   ├── Header.svelte
│   │   └── Footer.svelte
│   ├── services/             # Business logic
│   │   └── itemGenerator.ts
│   ├── stores/               # State management
│   │   └── gameState.svelte.ts
│   ├── types/                # TypeScript types
│   ├── data/                 # Static data
│   └── utils/                # Helper functions
```

## Troubleshooting

### Port Already in Use

If port 5173 is already in use, you can specify a different port:

```bash
npm run dev -- --port 3000
```

### TypeScript Errors

If you encounter TypeScript errors after pulling updates:

```bash
npm run prepare
npm run check
```

### Build Failures

Clear your build cache and reinstall dependencies:

```bash
rm -rf .svelte-kit node_modules
npm install
npm run build
```

## Next Steps

- Read the [Technical Overview](dev/Technical-Overview.md) to understand the architecture
- Check out [Architecture Decisions](dev/Architecture-Decisions.md) for design rationale
- Review [CLAUDE.md](../CLAUDE.md) if you're using AI assistance for development

## Getting Help

- Check the [GitHub Issues](https://github.com/JasonWarrenUK/those-who-came-before/issues) for known problems
- Review the [SvelteKit documentation](https://kit.svelte.dev/docs)
- Consult the [Svelte 5 Runes documentation](https://svelte.dev/docs/runes)
