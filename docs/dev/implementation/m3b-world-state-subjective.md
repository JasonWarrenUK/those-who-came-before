# Milestone 3 — Subjective World State (Player Knowledge Model)

## Purpose
Introduce the player-owned interpretation layer that captures hypotheses, uncertainty, and conclusions. This model feeds back into the game loop and sets up later contradiction and retcon mechanics.

## Scope
- Define Subjective World State schema.
- Capture player hypotheses per artefact.
- Track inferred culture traits and material assumptions.
- Provide UI for inspection and note-taking.

## Non-Goals (for this milestone)
- Contradiction detection and retcon resolution (later milestone).
- Full desk-based UI conversion.

## Data Model
### TypeScript Interfaces
```ts
import type { MaterialPoolId, SlotId } from '$lib/types/artefact';
import type { GeneratedArtefactWithProvenance } from '$lib/types/artefact';

export interface SubjectiveWorldState {
  artefactNotes: Record<string, ArtefactNote>;
  hypotheses: Hypothesis[];
  inferredCultureTraits: Record<string, InferredTrait[]>;
}

export interface ArtefactNote {
  artefactId: string;
  summary: string;
  partNotes: Array<{ slotId: SlotId; note: string }>;
  confidence: 'low' | 'medium' | 'high';
}

export interface Hypothesis {
  id: string;
  title: string;
  statement: string;
  confidence: 'low' | 'medium' | 'high';
  evidence: HypothesisEvidence[];
}

export interface HypothesisEvidence {
  artefactId: string;
  slotId?: SlotId;
  observation: string;
}

export interface InferredTrait {
  traitId: string;
  label: string;
  context?: { slotId?: SlotId; materialPool?: MaterialPoolId };
  confidence: 'low' | 'medium' | 'high';
}
```

## Storage Shape (JSON)
```json
{
  "artefactNotes": {
    "a1": {
      "artefactId": "a1",
      "summary": "Blade shows obsidian use; crossguard missing",
      "partNotes": [
        { "slotId": "blade", "note": "obsidian, unusually thin" },
        { "slotId": "crossguard", "note": "no crossguard present" }
      ],
      "confidence": "medium"
    }
  },
  "hypotheses": [
    {
      "id": "h1",
      "title": "Obsidian blades favored",
      "statement": "The River Basin culture prefers obsidian for blades",
      "confidence": "low",
      "evidence": [{ "artefactId": "a1", "slotId": "blade", "observation": "obsidian blade" }]
    }
  ],
  "inferredCultureTraits": {
    "c1": [
      {
        "traitId": "t1",
        "label": "Obsidian is a decorative material",
        "context": { "materialPool": "stone" },
        "confidence": "low"
      }
    ]
  }
}
```

## Subjective State Flow
1. **Inspect artefact** (from Milestone 2, includes provenance + anatomy).
2. **Record notes** (summary + part-specific notes).
3. **Create or update hypotheses** using evidence from notes.
4. **Accumulate inferred culture traits** (initially manual, later automated).

## UI Plan
- Add an **Artefact Inspection** panel that shows:
  - Artefact metadata (period, culture, context).
  - Part list with materials (from Milestone 1).
  - Note-taking fields for summary and part notes.
- Add a **Hypotheses** panel:
  - List of hypotheses with confidence badges.
  - Ability to link evidence to artefacts.

## Implementation Sketch
### Subjective Store
```ts
function createSubjectiveState() {
  let state = $state<SubjectiveWorldState>({
    artefactNotes: {},
    hypotheses: [],
    inferredCultureTraits: {}
  });

  return {
    get artefactNotes() {
      return state.artefactNotes;
    },
    get hypotheses() {
      return state.hypotheses;
    },
    get inferredCultureTraits() {
      return state.inferredCultureTraits;
    },
    saveNote(note: ArtefactNote) {
      state.artefactNotes = {
        ...state.artefactNotes,
        [note.artefactId]: note
      };
    },
    addHypothesis(hypothesis: Hypothesis) {
      state.hypotheses = [...state.hypotheses, hypothesis];
    },
    updateHypothesis(hypothesis: Hypothesis) {
      state.hypotheses = state.hypotheses.map((entry) =>
        entry.id === hypothesis.id ? hypothesis : entry
      );
    }
  };
}
```

### Artefact Inspection Panel (Svelte)
```svelte
<section class="card bg-base-200">
  <div class="card-body">
    <h3 class="card-title">Artefact Inspection</h3>
    <p class="text-sm">{selectedArtefact.label} ({selectedArtefact.provenance.cultureId})</p>
    <ul>
      {#each selectedArtefact.slots as slot}
        <li>{slot.partLabel}: {slot.material}</li>
      {/each}
    </ul>

    <label class="form-control">
      <span class="label-text">Summary</span>
      <textarea bind:value={summary} class="textarea"></textarea>
    </label>

    <button class="btn btn-primary" on:click={saveNote}>Save Note</button>
  </div>
</section>
```

## Data Files
- `src/lib/stores/subjectiveState.svelte.ts` — manages subjective state.
- `src/lib/types/subjective.ts` — subjective state interfaces.

## Acceptance Criteria
- Player can write notes per artefact and save them.
- Hypotheses can be created and linked to evidence.
- Subjective state is kept separate from objective world state (Milestone 2).

## Dependencies from Milestone 2
- Artefacts must include provenance and part-level materials.
- Artefact IDs must be stable for note linkage.
