# Milestone 2 — Objective World State (Cultures + Chronology)

## Purpose
Introduce the hidden world simulation: a chronology of periods and evolving cultural profiles that govern artefact generation. This builds directly on the blueprint-driven artefact generator defined in Milestone 1.

## Scope
- Define an Objective World State schema.
- Generate a minimal chronology with 1–2 cultures and 2–3 periods.
- Apply culture biases to artefact generation (materials, part usage).
- Attach culture/period metadata to generated artefacts.

## Non-Goals (for this milestone)
- Player hypotheses, contradictions, or retcons (Milestone 3+).
- Visual rendering pipeline.

## Data Model
### TypeScript Interfaces
```ts
import type { MaterialPoolId, SlotId } from '$lib/types/artefact';

export interface ObjectiveWorldState {
  seed: string;
  periods: Period[];
  cultures: Culture[];
  activePeriodId: string;
}

export interface Period {
  id: string;
  label: string;
  order: number;
  startYear: number;
  endYear: number;
  cultureIds: string[];
}

export interface Culture {
  id: string;
  label: string;
  materialBiases: MaterialBias[];
  slotBiases: SlotBias[];
  motifTraits: string[];
  timeline: CulturePeriodProfile[];
}

export interface MaterialBias {
  poolId: MaterialPoolId;
  weight: number; // Higher means more likely
  slotId?: SlotId; // Optional: bias only for specific slots
}

export interface SlotBias {
  slotId: SlotId;
  likelihoodDelta: number; // Alters optional slot likelihood
}

export interface CulturePeriodProfile {
  periodId: string;
  shifts: Array<
    | { type: 'material-preference'; poolId: MaterialPoolId; weightDelta: number }
    | { type: 'slot-usage'; slotId: SlotId; likelihoodDelta: number }
  >;
}

export interface ArtefactProvenance {
  periodId: string;
  cultureId: string;
  context: {
    region: string;
    site: string;
    layer: string;
  };
}
```

## World Generation Flow
1. **Create base periods** (e.g., Early/Classic/Late).
2. **Create cultures** with baseline material biases (e.g., metal-heavy vs stone-heavy).
3. **Assign culture profiles per period** (shifts in material or slot usage).
4. **Set an active period** (for early MVP use the first period).

### World Generation Example
```ts
export function createObjectiveWorld(seed: string): ObjectiveWorldState {
  const periods: Period[] = [
    { id: 'early', label: 'Early', order: 1, startYear: -1200, endYear: -800, cultureIds: ['c1'] },
    { id: 'classic', label: 'Classic', order: 2, startYear: -800, endYear: -300, cultureIds: ['c1'] }
  ];

  const cultures: Culture[] = [
    {
      id: 'c1',
      label: 'River Basin Culture',
      materialBiases: [
        { poolId: 'metal', weight: 1.3 },
        { poolId: 'stone', weight: 0.8 }
      ],
      slotBiases: [{ slotId: 'crossguard', likelihoodDelta: -0.1 }],
      motifTraits: ['spiral', 'river-knot'],
      timeline: [
        { periodId: 'early', shifts: [{ type: 'material-preference', poolId: 'metal', weightDelta: -0.1 }] },
        { periodId: 'classic', shifts: [{ type: 'material-preference', poolId: 'metal', weightDelta: 0.2 }] }
      ]
    }
  ];

  return {
    seed,
    periods,
    cultures,
    activePeriodId: periods[0].id
  };
}
```

## Applying Culture Biases to Generation
Milestone 1 defines `generateArtefact(blueprint)` with uniform material selection. Extend it by:
1. Selecting culture + period from Objective World State.
2. Adjusting slot likelihoods with `SlotBias`.
3. Weighting material pools with `MaterialBias` + `CulturePeriodProfile` shifts.

### Weighted Material Selection Sketch
```ts
function pickMaterialWithBias(
  poolIds: MaterialPoolId[],
  biases: MaterialBias[],
  slotId: SlotId
): string {
  const weightedPools = poolIds.map((poolId) => {
    const bias = biases.find((entry) => entry.poolId === poolId && (!entry.slotId || entry.slotId === slotId));
    return { poolId, weight: bias?.weight ?? 1 };
  });

  const total = weightedPools.reduce((sum, entry) => sum + entry.weight, 0);
  let roll = Math.random() * total;
  for (const entry of weightedPools) {
    roll -= entry.weight;
    if (roll <= 0) {
      return pickFromPool(entry.poolId);
    }
  }
  return pickFromPool(weightedPools[0].poolId);
}
```

### Slot Likelihood Adjustment
```ts
function adjustSlotLikelihood(slot: ArtefactSlot, slotBiases: SlotBias[]): ArtefactSlot {
  const bias = slotBiases.find((entry) => entry.slotId === slot.id);
  if (!bias || slot.required) return slot;

  const likelihood = Math.min(1, Math.max(0, (slot.likelihood ?? 0) + bias.likelihoodDelta));
  return { ...slot, likelihood };
}
```

## Metadata Attachment
Each generated artefact should include provenance metadata (period, culture, context). This aligns with later subjective interpretation and contradiction detection.

```ts
export interface GeneratedArtefactWithProvenance extends GeneratedArtefact {
  provenance: ArtefactProvenance;
}
```

## Data Files
- `src/lib/data/worldSeed.ts` — deterministic seed value for reproducibility.
- `src/lib/services/worldGenerator.ts` — `createObjectiveWorld()`.
- `src/lib/services/artefactGenerator.ts` — consumes `ObjectiveWorldState` and `ArtefactBlueprint`.

## UI Updates
- Display period and culture labels in the discovery timeline.
- Add context tags (region/site/layer) under each artefact entry.

## Acceptance Criteria
- Artefacts are generated with culture/period provenance.
- Materials and slot probabilities reflect culture biases.
- The Objective World State is deterministic with a seed.

## Dependencies from Milestone 1
- Blueprint schema, slot generation, and per-part materials must already exist.
- Generated artefacts must expose slot-level metadata to allow culture biases per slot.
