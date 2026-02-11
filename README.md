# Those Who Came Before

**An interactive archaeological artifact discovery game built with SvelteKit**

> [!NOTE]
> Under Construction - Core game loop is complete, but advanced features are in development.

---

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/JasonWarrenUK/those-who-came-before)

---

## About

**Those Who Came Before** is a browser-based game where players discover archaeological artifacts by randomly generating combinations of item types and materials. Track your discoveries in a timeline view and complete task-based missions as you uncover the treasures of ancient civilizations.

### Features

- **Random Artifact Generation**: Discover unique combinations of item types (axes, brooches, daggers, etc.) with various materials
- **Discovery Timeline**: Visual timeline tracking all artifacts you've uncovered
- **Task System**: Mission-based progression with achievement tracking
- **Persistent State**: Game state management using Svelte 5 Runes
- **Modern UI**: Built with DaisyUI components and Tailwind CSS

## Tech Stack

- **Framework**: Svelte 5.0 (Runes API) + SvelteKit 2.22
- **Build Tool**: Vite 7.0
- **Styling**: Tailwind CSS 4.0 + DaisyUI 5.1
- **Language**: TypeScript 5.0
- **Deployment**: Node adapter (SSR-capable)

## Quick Start

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Starts the Vite dev server with hot module replacement at `http://localhost:5173`

### Build

```bash
npm run build
```

Creates production-optimized build using Vite and SvelteKit adapter-node.

### Preview Production Build

```bash
npm run preview
```

### Code Quality

```bash
npm run check          # Type checking
npm run check:watch    # Continuous type checking
npm run lint           # Check formatting + ESLint
npm run format         # Auto-format with Prettier
```

## Documentation

- [Getting Started](docs/Getting-Started.md) - Setup and basic usage
- [Technical Overview](docs/dev/Technical-Overview.md) - Architecture and implementation details
- [Architecture Decisions](docs/dev/Architecture-Decisions.md) - Design rationale and trade-offs
- [CLAUDE.md](CLAUDE.md) - AI assistant development guide

## Project Status

This project is **under active development**. The core game loop is functional:

✅ Random artifact generation
✅ State management with Svelte 5 Runes
✅ Timeline visualization
✅ Task/mission tracking
✅ TypeScript type safety

Planned features:
- Persistence layer (localStorage/database)
- More artifact types and materials
- Enhanced mission system
- Save/load game state
- Additional game mechanics

## Contributing

This is a personal project by [Jason Warren](https://github.com/JasonWarrenUK), but feedback and suggestions are welcome via issues.

## License

`© Goblin Uprising` - All rights reserved.
