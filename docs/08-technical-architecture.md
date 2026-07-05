# TWCB: Technical Architecture
*Deno, SvelteKit, and the shape of the actual code*

---

## 1. Runtime & Toolchain

### 1.1 Deno as Runtime

Deno replaces Node entirely. This means:

- **Native TypeScript.** No `tsconfig.json` compilation step for server-side code. `.ts` files run directly.
- **Built-in tooling.** `deno fmt` replaces Prettier. `deno lint` replaces ESLint. `deno test` replaces whatever test runner you'd have chosen. Strip all three config files and their dependencies.
- **Permissions model.** Irrelevant for gameplay but means the dev server needs explicit `--allow-net --allow-read` flags. SvelteKit's adapter handles this.
- **npm compatibility.** Deno 2 supports `npm:` specifiers. DaisyUI, Tailwind, and Svelte dependencies work through this layer. Some may need `node_modules` — Deno supports this via `"nodeModulesDir": "auto"` in `deno.json`.

### 1.2 What Gets Stripped

| Current (Node) | Replacement (Deno) | Action |
|---|---|---|
| `package.json` scripts | `deno.json` tasks | Replace |
| `eslint.config.js` + deps | `deno lint` | Remove |
| `.prettierrc` + `.prettierignore` + deps | `deno fmt` | Remove |
| `tsconfig.json` | `deno.json` compilerOptions | Merge & simplify |
| `.npmrc` | Not needed | Remove |
| `@sveltejs/adapter-node` | `@deno/svelte-adapter` | Swap |

### 1.3 `deno.json` (Projected)

```json
{
  "tasks": {
    "dev": "deno run -A npm:vite dev",
    "build": "deno run -A npm:vite build",
    "preview": "deno run -A npm:vite preview",
    "check": "deno run -A npm:svelte-kit sync && deno run -A npm:svelte-check --tsconfig ./tsconfig.json"
  },
  "compilerOptions": {
    "strict": true,
    "allowJs": true,
    "checkJs": true,
    "lib": ["esnext", "dom", "dom.iterable"]
  },
  "nodeModulesDir": "auto",
  "fmt": {
    "useTabs": true,
    "lineWidth": 100,
    "singleQuote": true
  },
  "lint": {
    "rules": {
      "exclude": ["no-explicit-any"]
    }
  }
}
```

Note: The SvelteKit + Deno story has a wrinkle — Vite still runs through npm specifiers. This is stable as of early 2026 but worth verifying with the specific adapter version. The core game logic (generation, world state, lens calculations) runs as pure Deno TypeScript with zero framework dependency.

### 1.4 What Survives Unchanged

- `svelte.config.js` (adapter swap only)
- `vite.config.ts` (Tailwind + SvelteKit plugins unchanged)
- `src/app.css` (Tailwind + DaisyUI unchanged)
- `src/app.html` (unchanged)
- All `.svelte` component files (framework stays)
- SvelteKit routing structure

---

## 2. Project Structure (Target)

```
those-who-came-before/
├── deno.json                           # Tasks, compiler options, fmt/lint config
├── svelte.config.js                    # SvelteKit config (@deno/svelte-adapter)
├── vite.config.ts                      # Vite plugins
│
├── src/
│   ├── app.css                         # Tailwind + DaisyUI
│   ├── app.html                        # Shell
│   ├── app.d.ts                        # Global type declarations
│   │
│   ├── routes/                         # SvelteKit file-based routing
│   │   ├── +layout.svelte              # Root layout (Header/Footer/Navigation)
│   │   ├── +page.svelte                # Landing / game entry point
│   │   ├── study/
│   │   │   ├── +page.svelte            # Artefact study workspace
│   │   │   └── [artefactId]/
│   │   │       └── +page.svelte        # Individual artefact inspection
│   │   ├── library/
│   │   │   ├── +page.svelte            # Document library / lineage browser
│   │   │   └── [documentId]/
│   │   │       └── +page.svelte        # Individual document view/edit
│   │   ├── career/
│   │   │   └── +page.svelte            # Career dashboard (reputation, events, role)
│   │   └── world/
│   │       └── +page.svelte            # Timeline / world overview
│   │
│   └── lib/
│       ├── index.ts                    # Barrel exports
│       │
│       ├── engine/                     # Pure game logic (zero framework dependency)
│       │   ├── generation/
│       │   │   ├── grammar.ts          # Bottom-up component grammar (geometric primitives)
│       │   │   ├── plausibility.ts     # Plausibility checking (physical viability)
│       │   │   ├── materials.ts        # Material assignment with geological scarcity + culture bias
│       │   │   ├── decoration.ts       # Decorative grammar (post-material, layered)
│       │   │   ├── classification.ts   # Unified tag classification (structural + decorative)
│       │   │   ├── description.ts      # Register-based description generation (obs/interp/tech)
│       │   │   ├── excavation.ts       # Excavation composition + ambiguity management
│       │   │   ├── corpus.ts           # Initial corpus generation (NPC scholars, documents, dating)
│       │   │   └── pipeline.ts         # Orchestrates the generation stages
│       │   ├── world/
│       │   │   ├── chronology.ts       # Period generation
│       │   │   ├── culture.ts          # Culture generation
│       │   │   ├── provenance.ts       # Site/context generation (folded into engine/generation/excavation.ts; the roadmap implements provenance generation there)
│       │   │   ├── scholars.ts         # Scholar entity generation (player + NPC)
│       │   │   └── seed.ts             # PRNG + world seed
│       │   ├── lens/
│       │   │   ├── salience.ts         # Observation ordering
│       │   │   ├── classification.ts   # Tag suggestion weighting
│       │   │   ├── crossReference.ts   # Related artefact priming
│       │   │   ├── framing.ts          # Description variant selection
│       │   │   ├── omission.ts         # Contradicting property de-emphasis
│       │   │   └── strength.ts         # Lens strength from InterpretiveModel + dissemination
│       │   ├── interpretation/         # Agent-generic epistemic operations
│       │   │   ├── claims.ts           # Claim creation, status transitions
│       │   │   ├── inference.ts        # Inference chain management
│       │   │   └── methodology.ts      # Methodological weight profiles
│       │   ├── documents/              # Document tradition system (doc 10)
│       │   │   ├── lineage.ts          # Lineage graph operations (derive, revise, respond)
│       │   │   ├── dissemination.ts    # State machine (private → circulated → submitted → published)
│       │   │   ├── commitments.ts      # Commitment extraction and tracking
│       │   │   ├── form.ts             # Form classification (emergent from properties)
│       │   │   └── venues.ts           # Venue generation, prestige computation, editorial process
│       │   ├── contradiction/
│       │   │   ├── detection.ts        # Compares InterpretiveModel against occluded world properties
│       │   │   ├── strain.ts           # Slow-burn accumulation
│       │   │   ├── surfacing.ts        # Diegetic delivery channel selection
│       │   │   └── resolution.ts       # Retcon flow
│       │   ├── career/
│       │   │   ├── reputation.ts       # Multidimensional reputation model (per-scholar property)
│       │   │   ├── progression.ts      # Role advancement
│       │   │   ├── events.ts           # Career event creation and recording
│       │   │   ├── peerReview.ts       # Peer review generation (named, doc 07)
│       │   │   └── npc.ts              # NPC behaviour (review selection, contradiction delivery)
│       │   └── prng.ts                 # Seeded PRNG implementation
│       │
│       ├── types/                      # All TypeScript interfaces
│       │   ├── artefact.ts             # Component, ComponentGroup, ClassifiedArtefact
│       │   ├── world.ts                # WorldChronology, Culture, Provenance, presentYear
│       │   ├── interpretation.ts       # InterpretiveModel, claims, methodology (agent-generic)
│       │   ├── documents.ts            # DocumentNode, LineageGraph, DisseminationState, Commitment
│       │   ├── venues.ts              # VenueDefinition, structural properties, prestige inputs
│       │   ├── scholars.ts            # Scholar entity (player + NPC), reputation, relationships
│       │   ├── lens.ts                 # Lens state, salience, framing, registers
│       │   ├── contradiction.ts        # Contradiction types, queue, strain, resolution
│       │   ├── career.ts               # CareerEvent, PeerReviewEvent, role definitions
│       │   ├── grammar.ts              # Geometric primitives, grammar rules, mobility model
│       │   ├── tags.ts                 # FunctionTag, ContextTag, MaterialTag
│       │   ├── decoration.ts           # Surface treatments, applied elements, layering
│       │   ├── visibility.ts           # PropertyVisibility enum, visibility annotations
│       │   └── excavation.ts           # Site composition, ambiguity distribution
│       │
│       ├── stores/                     # Svelte 5 reactive state
│       │   ├── gameState.svelte.ts     # Orchestrator (no domain data)
│       │   ├── worldState.svelte.ts    # Everything that exists (objective)
│       │   ├── playerInterpretation.svelte.ts  # Player's InterpretiveModel (subjective)
│       │   ├── lensState.svelte.ts     # Derived from playerInterpretation
│       │   └── ui.svelte.ts            # UI-only state (selected artefact, active panel, etc.)
│       │
│       ├── components/                 # Svelte components
│       │   ├── layout/
│       │   │   ├── Header.svelte
│       │   │   ├── Footer.svelte
│       │   │   ├── Navigation.svelte
│       │   │   └── Panel.svelte        # Reusable panel container
│       │   ├── study/
│       │   │   ├── ArtefactInspector.svelte
│       │   │   ├── ObservationEditor.svelte
│       │   │   ├── TagSelector.svelte
│       │   │   └── PropertyList.svelte
│       │   ├── library/
│       │   │   ├── DocumentList.svelte
│       │   │   ├── DocumentEditor.svelte   # Draft creation, commitment editing
│       │   │   ├── LineageBrowser.svelte    # Visualise derivation/revision chains
│       │   │   └── VenueSelector.svelte    # Submission target selection
│       │   ├── career/
│       │   │   ├── ReputationDashboard.svelte
│       │   │   ├── EventLog.svelte         # Career event history
│       │   │   └── NpcInteraction.svelte
│       │   ├── world/
│       │   │   ├── Timeline.svelte
│       │   │   └── SiteMap.svelte
│       │   ├── contradiction/
│       │   │   ├── ContradictionQueue.svelte
│       │   │   ├── ContradictionDetail.svelte
│       │   │   └── RetconFlow.svelte
│       │   └── shared/
│       │       ├── ConfidenceBadge.svelte
│       │       ├── TagBadge.svelte
│       │       └── EvidenceChainView.svelte
│       │
│       ├── data/                       # Static data (grammar rules, material definitions, templates)
│       │   ├── grammars/               # Component grammar definitions
│       │   │   ├── primitives.ts       # Geometric primitive library
│       │   │   └── core.ts             # MVP component grammar rules
│       │   ├── materials.ts            # Material definitions with tags + geological scarcity
│       │   ├── plausibility.ts         # Plausibility rules (physical viability)
│       │   ├── classification.ts       # Classification rules (feature → tag mappings)
│       │   ├── decorations.ts          # Decorative technique definitions + material prerequisites
│       │   ├── descriptions/           # Register-based description templates
│       │   │   ├── observational/      # Material-science register
│       │   │   ├── interpretive/       # Functional-contextual register
│       │   │   └── technical/          # Craft-process register
│       │   └── names/                  # Naming grammars for cultures, sites, scholars
│       │       ├── cultures.ts
│       │       ├── sites.ts
│       │       └── scholars.ts
│       │
│       └── persistence/                # Save/load layer
│           ├── schema.ts               # Save file schema + versioning
│           ├── indexeddb.ts            # IndexedDB adapter
│           └── serialisation.ts        # State → saveable format
│
├── tests/                              # Deno test files
│   ├── engine/
│   │   ├── grammar.test.ts
│   │   ├── plausibility.test.ts
│   │   ├── materials.test.ts
│   │   ├── decoration.test.ts
│   │   ├── classification.test.ts
│   │   ├── corpus.test.ts
│   │   ├── interpretation.test.ts      # InterpretiveModel operations
│   │   ├── documents.test.ts           # Lineage graph, dissemination, commitments
│   │   ├── lens.test.ts
│   │   └── contradiction.test.ts
│   └── integration/
│       ├── pipeline.test.ts
│       ├── excavation.test.ts
│       └── dissemination.test.ts       # Full submission → review → publication flow
│
├── backlog/                            # Historical code (preserved, not imported)
│   └── ...
│
└── docs/
    └── dev/
        ├── design/                     # Design documents (this series)
        │   ├── 01-project-audit.md
        │   ├── 02-design-pillars.md
        │   ├── 03-core-loop-systems-map.md
        │   ├── 04-interpretive-lens.md
        │   ├── 05-generation-architecture.md
        │   ├── 06-knowledge-contradiction-model.md
        │   ├── 07-career-social-systems.md
        │   ├── 08-technical-architecture.md
        │   ├── 09-implementation-roadmap.md
        │   ├── 10-document-tradition-system.md
        │   ├── 11-deferred-design-questions.md
        │   └── 12-propagation-register.md
        ├── implementation/             # Milestone implementation specs
        │   ├── m1-artefact-generation.md
        │   ├── m2-world-state-objective.md
        │   └── m3-world-state-subjective.md
        └── roadmap/                    # Roadmap tracking
            └── ...
```

### 2.1 The `engine/` Boundary

The most important architectural decision: **everything in `src/lib/engine/` is pure TypeScript with zero framework dependency.** No Svelte imports, no SvelteKit imports, no browser APIs, no DOM.

This means:
- Engine code is testable with `deno test` directly — no browser environment needed
- Engine code is portable — if you ever move to a different UI framework, the engine survives
- Engine code is reasoned about independently of rendering

The engine takes inputs (seed, interpretive models, player actions) and produces outputs (artefacts, lens-filtered presentations, contradiction detections, dissemination state transitions). The stores and components wire these together but never contain domain logic.

Critically, **engine functions are agent-agnostic** (doc 11, section 2.6). Functions like `computeLens()` and `detectContradictions()` accept an `InterpretiveModel` as a parameter. They never reach for a store, never import Svelte, and never know whether they're processing the player's model or an NPC's. Only the store and UI layers know that the player is the active agent.

### 2.2 New Engine Modules

Two engine domains were added since the original architecture:

**`engine/interpretation/`** — agent-generic epistemic operations. Claim creation, inference chains, methodological profiles. These operate on `InterpretiveModel` instances without knowing whose model they're processing. At MVP, only called with the player's model. Post-MVP, used for NPC model evolution.

**`engine/documents/`** — the document tradition system (doc 10). Lineage graph operations, dissemination state machine, commitment extraction, form classification, venue generation. This is a substantial domain that doesn't belong inside `knowledge/` or `career/` — documents are world objects with their own lifecycle, not a subsystem of either interpretation or career progression.

---

## 3. State Architecture

### 3.1 Data Model

TWCB's state divides along an epistemic boundary, not an origin boundary (see doc 11, sections 2.5–2.7 for the full rationale).

**Objective World State** — everything that concretely exists: artefacts, sites, chronology, cultures, documents (player and NPC), the lineage graph, venues, scholars, career events, reputation. Modern-world objects are objective regardless of who created them. A player's published monograph is as objective as an excavated blade.

Properties within the world state have varying **visibility levels**:

- **Observable** — directly available upon encounter. Material composition, NPC published work, venue requirements.
- **Inferable** — derivable from observable properties through reasoning. Shared material preferences suggesting cultural links, NPC tendencies deduced from publication patterns.
- **Occluded** — definite but hidden from all agents. True culture assignments, true artefact functions, NPC internal methodological weights. Used by the engine for generation and contradiction detection.
- **Engine-internal** — no in-world meaning. PRNG seeds, constraint satisfaction flags, pipeline metadata.

**Subjective State** — an epistemic agent's interpretive model: claims about the world built from incomplete information. One per agent. The player's is actively maintained and mutable. NPC models are generated at corpus creation and static at MVP; post-MVP, all agents' models evolve and the player/NPC distinction becomes one of control (player-driven vs engine-driven), not mutability.

The critical architectural rule: **the engine never knows who the player is.** Engine functions accept an `InterpretiveModel` as a parameter. The lens calculation, contradiction detection, and commitment evaluation functions are agent-agnostic. Only the UI and store layers treat the player as special (see doc 11, section 2.6).

### 3.2 The InterpretiveModel Interface

This is the agent-generic shape that every epistemic agent's subjective state conforms to. The player's and an NPC's share the same interface.

```typescript
// types/interpretation.ts

interface InterpretiveModel {
  agentId: string;

  // Claims about the ancient world
  culturalClaims: Map<string, CulturalClaim>;      // "Culture X preferred obsidian for blades"
  artefactClaims: Map<string, ArtefactClaim>;       // "This blade was ceremonial"
  chronologicalClaims: Map<string, ChronoClaim>;    // "Period Y preceded Period Z"

  // Claims about the professional world
  agentAssessments: Map<string, AgentAssessment>;   // "Dr. Okonkwo is a reliable structuralist"

  // Methodological commitments (shape how new evidence is weighted)
  methodologicalWeights: MethodologicalProfile;

  // Contradiction state (claims under tension)
  strainScores: Map<string, HypothesisStrain>;      // Canonical strain type (doc 06 §5)
  contradictionQueue: ContradictionQueue;
}
```

At MVP, only the player's `InterpretiveModel` is fully populated through gameplay. NPC models are generated with `culturalClaims`, `methodologicalWeights`, and a subset of `artefactClaims` — enough to drive their published commitments and review behaviour. NPC `agentAssessments` (what NPCs think of other NPCs) and NPC `contradictionQueue` are deferred.

### 3.3 Store Relationships

```
gameState (orchestrator)
  ├── worldState              # Everything that concretely exists
  │   ├── chronology          #   Periods, cultures (with occluded ground truth)
  │   ├── artefacts           #   Generated artefacts (with occluded properties)
  │   ├── sites               #   Excavation sites and provenance
  │   ├── scholars            #   Player + NPC scholar entities
  │   │   └── [each].model    #     NPC InterpretiveModel instances (static at MVP)
  │   ├── documents           #   All document nodes — player and NPC (doc 10)
  │   ├── lineageGraph        #   Derivation/revision/response links between documents
  │   ├── venues              #   Publication venues with structural properties (doc 07)
  │   └── careerEvents        #   Record of things that happened (reviews, publications, etc.)
  │
  ├── playerInterpretation    # Reactive wrapper around player's InterpretiveModel
  │
  ├── termState               # Current term tracking (doc 11, Section 2.8)
  │   ├── currentTermIndex    #   Which term we're in
  │   ├── currentAbsoluteWeek #   Canonical timestamp — never resets
  │   ├── termType            #   'autumn' | 'spring' | 'summer-teaching' | 'summer-research'
  │   ├── weekCapacity        #   Usually 12 weeks per term
  │   ├── weeksAllocated      #   Sum of scheduled activity durations
  │   ├── energyBudget        #   Total energy for this term
  │   ├── energyRemaining     #   Energy left (decremented by actions)
  │   ├── activeActions       #   Currently running concurrent actions
  │   └── backgroundDrains    #   Ongoing commitments — subset active by termType
  │
  ├── lensState               # Derived from playerInterpretation
  │
  └── ui                      # Selected artefact, active panel, etc.
```

Three domain stores plus term state plus UI. The old five-store model (objectiveWorld, subjectiveWorld, lensState, career, ui) collapsed because:

- `career` was split between objective events (happened, now in `worldState.careerEvents`) and reputation (computed property of the player's scholar entity in `worldState.scholars`).
- `subjectiveWorld` contained both concrete objects (documents, publications) and interpretation. The concrete objects moved to `worldState`. Only interpretation remains, now as `playerInterpretation`.
- NPC interpretive models live in `worldState` as properties of their scholar entities, not in a separate store. They're just data — no reactivity needed at MVP.

### 3.4 Store Pattern

All stores use Svelte 5 Runes with immutable update patterns, consistent with the existing codebase.

```typescript
// stores/playerInterpretation.svelte.ts
import type { InterpretiveModel, CulturalClaim, ArtefactClaim } from '$lib/types/interpretation';

function createPlayerInterpretationStore() {
  let model = $state<InterpretiveModel>({
    agentId: 'player',
    culturalClaims: new Map(),
    artefactClaims: new Map(),
    chronologicalClaims: new Map(),
    agentAssessments: new Map(),
    methodologicalWeights: defaultMethodology(),
    strainScores: new Map(),
    contradictionQueue: { items: [], totalSeverity: 0, reputationalPressure: 0 }
  });

  return {
    // The raw model — passed to engine functions as InterpretiveModel
    get model() { return model; },

    // Reactive getters for UI binding
    get culturalClaims() { return model.culturalClaims; },
    get artefactClaims() { return model.artefactClaims; },
    get contradictionQueue() { return model.contradictionQueue; },

    // Actions (immutable updates)
    addCulturalClaim(claim: CulturalClaim) {
      model.culturalClaims = new Map([...model.culturalClaims, [claim.id, claim]]);
    },

    addArtefactClaim(claim: ArtefactClaim) {
      model.artefactClaims = new Map([...model.artefactClaims, [claim.id, claim]]);
    },

    addContradiction(contradiction: Contradiction) {
      model.contradictionQueue = {
        ...model.contradictionQueue,
        items: [...model.contradictionQueue.items, contradiction],
        totalSeverity: model.contradictionQueue.totalSeverity + contradiction.severity
      };
    },

    // Derived
    get activeClaims() {
      return $derived([
        ...model.culturalClaims.values(),
        ...model.artefactClaims.values()
      ].filter(c => c.status === 'active'));
    },

    reset() {
      model = {
        agentId: 'player',
        culturalClaims: new Map(),
        artefactClaims: new Map(),
        chronologicalClaims: new Map(),
        agentAssessments: new Map(),
        methodologicalWeights: defaultMethodology(),
        strainScores: new Map(),
        contradictionQueue: { items: [], totalSeverity: 0, reputationalPressure: 0 }
      };
    }
  };
}

export const playerInterpretation = createPlayerInterpretationStore();
```

The key pattern: the store exposes its underlying `InterpretiveModel` via the `model` getter. Engine functions receive this directly — they never import the store, never touch Svelte reactivity, never know they're working with the player's model rather than any other agent's.

### 3.5 Orchestration

The `gameState` orchestrator coordinates cross-store operations. It holds no domain data.

```typescript
// stores/gameState.svelte.ts
import { worldState } from './worldState.svelte';
import { playerInterpretation } from './playerInterpretation.svelte';
import { lensState } from './lensState.svelte';
import { runGenerationPipeline } from '$lib/engine/generation/pipeline';
import { detectContradictions } from '$lib/engine/contradiction/detection';
import { computeLens } from '$lib/engine/lens/strength';
import { advanceDissemination } from '$lib/engine/documents/dissemination';

function createGameState() {
  return {
    initialise(seed: string) {
      worldState.generate(seed);
      playerInterpretation.reset();
      lensState.reset();
    },

    // Generate next artefact for inspection
    surfaceArtefact() {
      const artefact = runGenerationPipeline(
        worldState.activeCulture,
        worldState.activePeriod,
        worldState.prng
      );
      worldState.addArtefact(artefact);

      // Contradiction detection: player's interpretation vs world state
      // Engine function takes InterpretiveModel — agent-agnostic
      const contradictions = detectContradictions(
        artefact,
        playerInterpretation.model,
        worldState.state
      );
      contradictions.forEach(c => playerInterpretation.addContradiction(c));

      return artefact;
    },

    // Recalculate lens after interpretation changes
    refreshLens() {
      // Engine function takes InterpretiveModel — agent-agnostic
      const newLens = computeLens(
        playerInterpretation.model,
        worldState.getScholarDocuments('player'),
        worldState.venues
      );
      lensState.update(newLens);
    },

    // Submit document to venue — enters dissemination pipeline (doc 10)
    submitDocument(documentId: string, venueId: string) {
      const result = advanceDissemination(
        documentId,
        'submitted',
        venueId,
        worldState.state
      );

      worldState.updateDocument(result.updatedNode);
      worldState.addCareerEvent(result.careerEvent);
      worldState.updateScholarReputation('player', result.reputationDelta);
      this.refreshLens();

      return result;
    },

    // Handle peer review outcome (doc 07, section 3.3)
    resolvePeerReview(documentId: string, reviewEvent: PeerReviewCareerEvent) {
      worldState.addCareerEvent(reviewEvent);
      worldState.updateScholarReputation('player', reviewEvent.reputationEffect);

      if (reviewEvent.outcome === 'accepted') {
        const published = advanceDissemination(
          documentId,
          'published',
          reviewEvent.venueId,
          worldState.state
        );
        worldState.updateDocument(published.updatedNode);
        worldState.addCareerEvent(published.careerEvent);
      }

      // Reviewer relationship effects
      worldState.updateScholarRelationship('player', reviewEvent.reviewerAgentId, reviewEvent);

      this.refreshLens();
      return reviewEvent;
    }
  };
}

export const gameState = createGameState();
```

Notable changes from the old orchestration:

- **No `PublicationTrack` parameter.** Publication is a dissemination state transition on a document node, mediated by a venue. The old `publish(hypothesisId, track)` assumed hypotheses were published directly via a track selector. The new model: the player creates a document (which contains commitments derived from hypotheses), then submits it to a venue, then receives peer review, then it's published. Multiple discrete steps, each a career event.
- **`detectContradictions` takes `InterpretiveModel`, not a store.** Agent-agnostic. Post-MVP, the same function could evaluate NPC-vs-world contradictions.
- **`computeLens` takes `InterpretiveModel` plus document and venue data.** Lens strength derives from commitments in disseminated documents weighted by venue prestige (doc 04), not from a flat publications list.
- **Career state isn't a separate concern.** Career events are added to `worldState`. Reputation is updated on the player's scholar entity in `worldState`. No dedicated career store.
- **Term state is explicitly tracked.** Energy budget and time slots govern action availability within each term.

### 3.6 Term State & Boundary Logic

The time/action economy (doc 11, Section 2.8) uses discrete terms with concurrent actions consuming both time and energy from a single continuum. The `termState` store tracks within-term resources; the orchestrator handles term boundaries.

```typescript
// types/term.ts

type TermType = 'autumn' | 'spring' | 'summer-teaching' | 'summer-research';

interface AcademicYear {
  yearIndex: number;
  terms: [TermType, TermType, TermType, TermType]; // 4 terms per year
  // Default: ['autumn', 'spring', 'summer-teaching', 'summer-research']
  // Summer-research has no teaching drain — strategically distinct season
}

const WEEKS_PER_TERM = 12;
const TERMS_PER_YEAR = 4;
const WEEKS_PER_YEAR = WEEKS_PER_TERM * TERMS_PER_YEAR; // 48 modelled weeks

interface TermState {
  currentTermIndex: number;
  currentAbsoluteWeek: number;         // Canonical timestamp — never resets, spans entire career
  termType: TermType;                  // Determines which background drains apply
  weekCapacity: number;                // Usually 12; could be modified by special circumstances
  weeksAllocated: number;              // Sum of activity durations scheduled this term
  energyBudget: number;                // Total energy for this term (may include carry-over)
  energyRemaining: number;             // Decremented by actions
  backgroundDrains: BackgroundDrain[]; // Ongoing commitments — subset active depending on termType
  completedActions: CompletedAction[]; // Record of what was done this term
}

// Derived helpers (not stored, computed on demand)
function termStartWeek(termIndex: number): number {
  return termIndex * WEEKS_PER_TERM;
}
function weekInTerm(absoluteWeek: number): number {
  return absoluteWeek % WEEKS_PER_TERM;
}
function termIndexFromWeek(absoluteWeek: number): number {
  return Math.floor(absoluteWeek / WEEKS_PER_TERM);
}
function yearFromTerm(termIndex: number): number {
  return Math.floor(termIndex / TERMS_PER_YEAR);
}

interface BackgroundDrain {
  source: string;                 // "teaching-load" | "supervision" | "admin" | "editorial"
  energyCostPerTerm: number;
  activeTermTypes: TermType[];    // Which term types this drain applies to
  description: string;
}

interface CompletedAction {
  actionType: string;
  energyCost: number;
  durationWeeks: number;
  startWeek: number;              // Absolute week — may span term boundaries
  termIndex: number;              // Term in which the action was initiated
}
```

**Four terms per year:** autumn, spring, summer-teaching, summer-research. Each is 12 weeks, giving 48 modelled weeks per year (the remaining 4 weeks are implicit transition/holiday, never modelled). The summer-research term has no teaching background drain, creating a strategically distinct season — the player plans their year around this window for fieldwork, uninterrupted writing, and conference attendance.

**Absolute week as canonical timestamp.** The `currentAbsoluteWeek` counter never resets and spans the entire career. Background processes (peer review, dissemination lead times, reputational lag) use absolute weeks, so a review that starts in week 8 of one term resolves naturally in week 3 of the next without special boundary logic. Within-term week position is derived on demand via `weekInTerm()`.

**Term-conditional drains.** Each `BackgroundDrain` specifies which term types it applies to. Teaching load applies to autumn, spring, and summer-teaching but not summer-research. Admin and editorial duties might apply year-round. This is evaluated at term start when calculating the effective energy budget.

Activities have durations in weeks. The player schedules activities into the term's 12-week window; concurrent activities can overlap in the same weeks but compete for energy. When either time or energy is exhausted, the term ends.

Term boundaries are the game's primary tick. When the player ends a term (or runs out of energy), the orchestrator runs a sequence of updates:

```typescript
// In gameState orchestrator

completeTerm() {
  const termIndex = termState.currentTermIndex;
  const absoluteWeek = termState.currentAbsoluteWeek;

  // 1. Advance dissemination pipelines (doc 10)
  //    Documents in review may resolve; uses absolute weeks for lead time comparison.
  const disseminationResults = advanceAllDissemination(
    worldState.state,
    absoluteWeek
  );
  disseminationResults.forEach(r => {
    worldState.updateDocument(r.updatedNode);
    if (r.careerEvent) worldState.addCareerEvent(r.careerEvent);
  });

  // 2. Accumulate contradiction strain (doc 06, Section 5)
  //    Each unresolved contradiction applies per-term pressure.
  const strainUpdates = accumulateStrain(
    playerInterpretation.model,
    termIndex
  );
  playerInterpretation.updateStrain(strainUpdates);

  // 3. Recalculate lens with decay (doc 04, Section 4.1)
  //    Unengaged hypotheses lose strength. Contradictions apply pressure.
  const decayedLens = computeLensWithDecay(
    playerInterpretation.model,
    worldState.getScholarDocuments('player'),
    worldState.venues,
    termIndex
  );
  lensState.update(decayedLens);

  // 4. Career advancement checks (doc 07)
  //    Tenure clock, promotion criteria, etc.
  const careerChecks = evaluateCareerProgress(
    worldState.getScholar('player'),
    worldState.state,
    termIndex
  );
  careerChecks.forEach(e => worldState.addCareerEvent(e));

  // 5. Venue seasonal cycles (doc 10)
  //    Update venue states (submission windows, conference timing).
  worldState.advanceVenueCycles(absoluteWeek);

  // 6. Energy replenishment for next term
  //    Determine next term type, then apply only drains active for that type.
  const nextTermIndex = termIndex + 1;
  const nextTermType = getTermType(nextTermIndex); // Derived from year position
  const baseEnergy = calculateBaseEnergy(worldState.getScholar('player'));
  const activeDrains = termState.backgroundDrains.filter(
    d => d.activeTermTypes.includes(nextTermType)
  );
  const drainTotal = activeDrains.reduce(
    (sum, d) => sum + d.energyCostPerTerm, 0
  );
  const carryOver = calculateEnergyCarryOver(termState.energyRemaining);

  termState.advance({
    nextTermIndex,
    nextAbsoluteWeek: (nextTermIndex) * WEEKS_PER_TERM,
    termType: nextTermType,
    energyBudget: baseEnergy - drainTotal + carryOver,
    backgroundDrains: termState.backgroundDrains  // Full set persists; filtering is per-term
  });
}
```

The term boundary is the heartbeat of the simulation. Everything that happens "over time" — dissemination lead times, strain accumulation, lens decay, career progression, venue cycles — ticks at term boundaries. Background processes use absolute weeks for seamless cross-term spanning (a peer review submitted in week 30 resolves when `currentAbsoluteWeek >= estimatedResolutionWeek`, regardless of which term that falls in). The player controls pace by deciding when to end each term.

**Summer-research rhythm.** The 4th term each year (summer-research) has no teaching drain, giving the player a higher effective energy budget. This creates a natural annual rhythm: teaching terms are constrained, the summer-research term is expansive. Fieldwork, concentrated writing, and conference attendance cluster naturally in this window — not because the game forces it, but because the economics favour it.

---

## 4. Persistence Strategy

### 4.1 IndexedDB

Client-side persistence via IndexedDB. No server, no accounts, no cloud sync (for MVP).

```typescript
// persistence/schema.ts
export interface SaveFile {
  version: number;                      // Schema version for migration
  savedAt: string;
  seed: string;
  worldState: SerialisedWorldState;     // Everything that exists
  playerInterpretation: SerialisedInterpretiveModel;  // Player's epistemic model (includes serialised contradiction queue)
  termState: SerialisedTermState;       // Calendar position + energy budget
  // lensState is NOT persisted: it is recomputed from playerInterpretation on load
  metadata: {
    playTime: number;                   // Seconds
    artefactsExamined: number;
    claimsFormed: number;
    documentsPublished: number;         // Document nodes at published state or beyond
    contradictionsResolved: number;
  };
}

export const CURRENT_SAVE_VERSION = 1;
```

### 4.2 Serialisation Concerns

Maps don't serialise to JSON. Every `Map<K, V>` in the state types needs a serialisation/deserialisation pair.

```typescript
// persistence/serialisation.ts
function serialiseMap<K, V>(map: Map<K, V>): [K, V][] {
  return [...map.entries()];
}

function deserialiseMap<K, V>(entries: [K, V][]): Map<K, V> {
  return new Map(entries);
}
```

### 4.3 Auto-Save

Auto-save on significant player actions (not every keystroke). Debounced write to IndexedDB.

```typescript
const AUTOSAVE_DEBOUNCE_MS = 5000;

function setupAutosave(gameState: GameState) {
  let timeout: number | undefined;
  
  function triggerAutosave() {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      saveToIndexedDB(serialiseGameState(gameState));
    }, AUTOSAVE_DEBOUNCE_MS);
  }

  // Called after each significant game action
  return { triggerAutosave };
}
```

### 4.4 Schema Migration

Save file version is checked on load. If the loaded version is behind `CURRENT_SAVE_VERSION`, migration functions run sequentially.

```typescript
type Migration = (save: SaveFile) => SaveFile;

const migrations: Record<number, Migration> = {
  // Version 1 → 2: Added strain model to interpretation
  2: (save) => ({
    ...save,
    version: 2,
    playerInterpretation: {
      ...save.playerInterpretation,
      strainScores: []
    }
  }),
};

function migrateSave(save: SaveFile): SaveFile {
  let current = save;
  while (current.version < CURRENT_SAVE_VERSION) {
    const migrate = migrations[current.version + 1];
    if (!migrate) throw new Error(`Missing migration for version ${current.version + 1}`);
    current = migrate(current);
  }
  return current;
}
```

---

## 5. Testing Strategy

### 5.1 Unit Tests (Engine)

All engine modules get unit tests. These run with `deno test` — fast, no browser needed.

```
tests/engine/
├── grammar.test.ts          # Component grammar produces valid structures
├── plausibility.test.ts     # Invalid structures rejected, valid ones pass
├── materials.test.ts        # Cultural bias + scarcity affects distribution
├── decoration.test.ts       # Decorative layers respect material prerequisites
├── classification.test.ts   # Structural + decorative features → expected tags
├── corpus.test.ts           # Initial corpus generation + dating frameworks
├── lens/
│   ├── salience.test.ts     # Hypothesis affects observation ordering
│   ├── framing.test.ts      # Lens selects expected register + description variants
│   └── strength.test.ts     # Lens strength computed correctly
├── contradiction/
│   ├── detection.test.ts    # Known mismatches detected (objective + corpus)
│   └── strain.test.ts       # Strain accumulates correctly
└── career/
    ├── reputation.test.ts   # Events modify correct dimensions
    └── npc.test.ts          # Peer review generates plausible feedback
```

### 5.2 Deterministic Testing

The seeded PRNG is the testing superpower. Same seed = same output, every time.

```typescript
// Example test
Deno.test("grammar expansion produces consistent output for seed", () => {
  const prng = createPrng("test-seed-42");
  const result1 = expandGrammar(coreGrammar, mockCulture, prng);
  
  const prng2 = createPrng("test-seed-42");
  const result2 = expandGrammar(coreGrammar, mockCulture, prng2);
  
  assertEquals(result1, result2);
});
```

### 5.3 Snapshot Tests

For complex outputs (generated artefacts, lens-filtered presentations), snapshot tests capture expected output and diff against it on change.

```typescript
Deno.test("full pipeline snapshot", async () => {
  const artefact = runPipeline("snapshot-seed", mockWorld);
  await assertSnapshot(Deno.test, artefact);
});
```

### 5.4 Distribution Tests

For stochastic systems (material selection, grammar branch selection), distribution tests verify that biases work correctly over many runs.

```typescript
Deno.test("metal-heavy culture produces more metal artefacts", () => {
  const metalCulture = createCulture({ materialAffinities: { metal: 2.0, stone: 0.5 } });
  const prng = createPrng("distribution-test");
  
  const results = Array.from({ length: 1000 }, () => 
    assignMaterial(bladePart, metalCulture, defaultPeriod, allMaterials, prng)
  );
  
  const metalCount = results.filter(m => m.tags.includes('metal')).length;
  const stoneCount = results.filter(m => m.tags.includes('stone')).length;
  
  assert(metalCount > stoneCount * 2, 
    `Expected metal >> stone, got metal=${metalCount} stone=${stoneCount}`);
});
```

---

## 6. Component Architecture Patterns

### 6.1 Data Flow

```
Route (+page.svelte)
  → Reads from stores (reactive)
  → Passes data to components as props
  → Components emit events for actions
  → Route handlers call gameState methods
  → Stores update
  → Components re-render (Svelte reactivity)
```

Components never import stores directly (except the route-level page components). This keeps components testable and reusable.

### 6.2 Component Sizing

Components are split at the "single responsibility" level:

- `ArtefactInspector` shows one artefact's lens-filtered presentation
- `ObservationEditor` handles note creation/editing for one observation
- `TagSelector` presents tag options and captures selection
- `PropertyList` renders an ordered list of artefact properties

Not:
- `ArtefactWorkspace` that handles inspection, note-taking, tagging, cross-referencing, and publication all in one component

### 6.3 DaisyUI Usage

DaisyUI continues as the component library. The existing Caramellatte + Coffee theme pairing works for the academic research aesthetic — warm, paper-like light theme with a comfortable dark alternative.

Custom components should follow DaisyUI's class patterns for consistency. Where DaisyUI doesn't provide a suitable component (e.g., evidence chain visualisation), build custom components using Tailwind utilities with DaisyUI colour tokens.

---

## 7. Performance Considerations

### 7.1 Grammar Expansion

CFG expansion is CPU-bound. For the MVP grammar (5 top-level branches, ~20 productions), expansion is trivially fast. If the grammar grows significantly, expansion can be moved to a Web Worker to avoid blocking the UI.

### 7.2 Lens Computation

Lens recalculation touches every active claim in the player's `InterpretiveModel` and every property of the inspected artefact. With MVP scope (< 50 active claims, < 20 properties per artefact), this is microseconds. The `refreshLens()` call is debounced to avoid redundant computation during rapid state changes.

### 7.3 Contradiction Detection

Detection runs per-artefact-generation and per-claim-commit. It compares the player's `InterpretiveModel` against occluded world state properties, which are in-memory. No network calls, no database queries. Fast.

### 7.4 IndexedDB Writes

Debounced auto-save (5s) prevents write storms. Save file size for MVP scope: < 1MB. IndexedDB handles this without issues.

---

## 8. Migration Path from Current Codebase

### 8.1 What's Preserved

- SvelteKit project structure (`src/routes/`, `src/lib/`)
- Svelte 5 Runes reactive patterns
- Tailwind + DaisyUI styling
- Component architecture philosophy (components don't hold domain state)
- Immutable update patterns in stores

### 8.2 What's Replaced

| File | Fate |
|---|---|
| `package.json` | → `deno.json` |
| `eslint.config.js` | Deleted (→ `deno lint`) |
| `.prettierrc` + `.prettierignore` | Deleted (→ `deno fmt`) |
| `tsconfig.json` | Simplified, merged into `deno.json` |
| `.npmrc` | Deleted |
| `src/lib/data/items.ts` | → `src/lib/data/grammars/primitives.ts` + `core.ts` (component grammar) |
| `src/lib/data/materials.ts` | → `src/lib/data/materials.ts` (restructured with tags + geological scarcity) |
| `src/lib/services/itemGenerator.ts` | → `src/lib/engine/generation/pipeline.ts` + 9 stage sub-modules |
| `src/lib/stores/gameState.svelte.ts` | → Split into `worldState`, `playerInterpretation`, `lensState`, `ui` + `gameState` orchestrator |
| `src/lib/types/item.ts` | → `src/lib/types/artefact.ts` + related type files |
| `src/lib/utils/indexRandom.ts` | → `src/lib/engine/prng.ts` (seeded) |
| `src/lib/components/ItemGenerator.svelte` | → `src/lib/components/study/ArtefactInspector.svelte` |
| `src/lib/components/Tasks.svelte` | Retired (career dashboard replaces) |
| `src/lib/components/Timeline.svelte` | → `src/lib/components/world/Timeline.svelte` (expanded) |
| `backlog/` | Preserved as historical reference |

**Update:** the tooling half of this table was completed in the Deno migration, and the listed `src/` source files were removed in the repository reset; they now live in `backlog/`, not `src/lib/`.

### 8.3 Migration Order

1. **Deno migration** (runtime swap, strip Node tooling, verify deps)
2. **Type system** (define all interfaces in `src/lib/types/` — including `InterpretiveModel`, `DocumentNode`, `VenueDefinition`, visibility annotations)
3. **PRNG** (seeded random, replacing `Math.random()`)
4. **Engine skeleton** (directory structure, empty modules with type signatures — including `interpretation/`, `documents/`)
5. **Component grammar + plausibility** (bottom-up geometric primitives, plausibility checking)
6. **Feature extraction + classification** (single-pass unified extraction with rule-based tag scoring per doc 05 §9; the accumulation-during-expansion model was superseded 2026-07-04)
7. **Material assignment** (geological scarcity + culture-biased selection)
8. **Decorative grammar** (post-material decorative layer with layering support)
9. **Store refactor** (split gameState into `worldState`, `playerInterpretation`, `lensState`, `ui` + `gameState` orchestrator)
10. **UI: artefact inspection** (replace ItemGenerator with ArtefactInspector)
11. **Description generation** (register-based system — observational/interpretive/technical, no lens yet)
12. **Excavation composition** (site-level ambiguity management, batch diversity)
13. **Initial corpus generation** (NPC scholars with `InterpretiveModel` instances, initial document nodes, dating frameworks)
14. **Lens integration** (wire lens state into register selection and observation ordering — takes `InterpretiveModel` as input)
15. **Interpretation layer** (claim creation, inference chains, methodological profiles — agent-generic `InterpretiveModel` operations, player store + UI)
16. **Document tradition** (lineage graph, dissemination state machine, commitments, form classification, venue generation — doc 10)
17. **Contradiction detection** (compares `InterpretiveModel` against occluded properties, strain accumulation, diegetic surfacing)
18. **Persistence** (IndexedDB save/load — serialises `worldState` + `playerInterpretation` + `termState`; lensState is recomputed on load)
19. **Career integration** (reputation as scholar property, dissemination as career events, role advancement, peer review — doc 07)
20. **Minimal NPCs** (named peer review, contradiction delivery, review selection based on NPC `InterpretiveModel`)

This is the implementation roadmap in disguise. Each step produces a testable, demonstrable increment. Note that document tradition (step 16) comes after the interpretation layer (step 15) because documents contain commitments derived from claims, and before contradiction detection (step 17) because contradictions reference commitments in document nodes.

---

*Next document: Implementation Roadmap — realistic milestones with the new scope, dependency chains, and what "done" looks like at each stage.*
