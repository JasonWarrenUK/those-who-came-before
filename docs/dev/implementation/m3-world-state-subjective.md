# Milestone 3 — Subjective World State (Player Knowledge Model)

## Purpose
Introduce the player-owned interpretation layer that captures hypotheses, uncertainty, and conclusions. This model references artefacts from M1 and provenance from M2, setting up later contradiction and retcon mechanics.

## Objectives
- Define subjective knowledge structures for **notes**, **hypotheses**, and **inferred traits**.
- Attach subjective data to generated artefacts (part-level observations).
- Surface a UI for artefact inspection and note-taking.
- Prepare data structures for contradiction tracking (M4).

## Scope
- Subjective state schema and storage.
- Artefact inspection UI panel.
- Hypotheses list with confidence and evidence.

## Non-Goals (for this milestone)
- Contradiction detection and retcon resolution (later milestone).
- Full desk-based UI conversion.

---

## Data Model (TypeScript)
```ts
import type { MaterialTag } from '$lib/types/artefact';

export interface SubjectiveWorldState {
  artefactNotes: Record<string, ArtefactNote>;
  hypotheses: Hypothesis[];
  inferredCultureTraits: Record<string, InferredTrait[]>;
}

export interface ArtefactNote {
  artefactId: string;
  summary: string;
  partNotes: Array<{ slotId: string; note: string }>;
  confidence: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
}

export interface Hypothesis {
  id: string;
  title: string;
  statement: string;
  confidence: 'low' | 'medium' | 'high';
  evidence: HypothesisEvidence[];
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'retired';
}

export interface HypothesisEvidence {
  artefactId: string;
  slotId?: string;
  observation: string;
}

export interface InferredTrait {
  traitId: string;
  label: string;
  context?: { slotId?: string; materialTag?: MaterialTag };
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
      "confidence": "medium",
      "createdAt": "2026-01-13T12:05:00Z",
      "updatedAt": "2026-01-13T12:05:00Z"
    }
  },
  "hypotheses": [
    {
      "id": "h1",
      "title": "Obsidian blades favored",
      "statement": "The River Basin culture prefers obsidian for blades",
      "confidence": "low",
      "evidence": [{ "artefactId": "a1", "slotId": "blade", "observation": "obsidian blade" }],
      "createdAt": "2026-01-13T12:00:00Z",
      "updatedAt": "2026-01-13T12:00:00Z",
      "status": "active"
    }
  ],
  "inferredCultureTraits": {
    "c1": [
      {
        "traitId": "t1",
        "label": "Obsidian is a decorative material",
        "context": { "materialTag": "stone" },
        "confidence": "low"
      }
    ]
  }
}
```

---

## Subjective State Flow
1. **Inspect artefact** (from Milestone 2, includes provenance + anatomy).
2. **Record notes** (summary + part-specific notes).
3. **Create or update hypotheses** using evidence from notes.
4. **Accumulate inferred culture traits** (initially manual, later automated).

## Subjective Store Sketch
```ts
import type { SubjectiveWorldState, ArtefactNote, Hypothesis } from '$lib/types/subjective';

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
      const now = new Date().toISOString();
      state.artefactNotes = {
        ...state.artefactNotes,
        [note.artefactId]: { ...note, updatedAt: now }
      };
    },
    addHypothesis(input: Omit<Hypothesis, 'id' | 'createdAt' | 'updatedAt' | 'status'>) {
      const now = new Date().toISOString();
      state.hypotheses = [
        ...state.hypotheses,
        { ...input, id: crypto.randomUUID(), createdAt: now, updatedAt: now, status: 'active' }
      ];
    },
    updateHypothesis(id: string, patch: Partial<Hypothesis>) {
      const now = new Date().toISOString();
      state.hypotheses = state.hypotheses.map((hypothesis) =>
        hypothesis.id === id ? { ...hypothesis, ...patch, updatedAt: now } : hypothesis
      );
    }
  };
}
```

---

## UI Plan
- **Artefact Inspection panel** shows:
  - Artefact metadata (period, culture, context).
  - Part list with materials (from Milestone 1).
  - Note-taking fields for summary and part notes.
- **Hypotheses panel**:
  - List of hypotheses with confidence badges.
  - Ability to link evidence to artefacts.

### Artefact Inspection Panel (Svelte outline)
```svelte
<section class="card bg-base-200">
  <div class="card-body">
    <h3 class="card-title">Artefact Inspection</h3>
    <p class="text-sm">{selectedArtefact.label} ({selectedArtefact.provenance.cultureId})</p>
    <ul>
      {#each selectedArtefact.parts as part}
        <li>{part.partId}: {part.materialId}</li>
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

## Integration with Objective World State (M2)
- When creating hypotheses, show **culture** and **period** metadata from the objective world state to encourage grounding.
- Prepare a structure to compare hypotheses to objective facts later (M4).

## Testing Plan
- Unit tests for add/update hypothesis and note behaviors.
- UI test to ensure artefact inspection writes correct data into subjective state.

## Definition of Done
- Subjective world state exists with hypotheses and notes per artefact.
- Artefact inspection UI writes to subjective state.
- Data model is ready for contradiction evaluation and retcon logic.
