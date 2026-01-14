# Milestone 2 — Objective World State (Cultures + Chronology)

## Purpose
Introduce the hidden world simulation: a chronology of periods and evolving cultural profiles that govern artefact generation. This builds directly on the blueprint-driven artefact generator defined in Milestone 1 and provides provenance for later subjective interpretation.

## Objectives
- Define an **Objective World State** schema (periods, cultures, provenance).
- Implement a minimal world generator (1–2 cultures, 2–3 periods) as a baseline.
- Apply **culture and period biases** to artefact generation (materials, slot usage).
- Attach **period/culture context** to generated artefacts.

## Scope
- Deterministic world seed and data structures.
- Culture material/slot biases plus per-period shifts.
- Basic provenance context (region/site/layer).

## Non-Goals (for this milestone)
- Player hypotheses, contradictions, or retcons (Milestone 3+).
- Visual rendering pipeline.

---

## Data Model (TypeScript)
```ts
import type { MaterialTag, SlotDefinition } from '$lib/types/artefact';

export interface ObjectiveWorldState {
  seed: string;
  periods: Period[];
  cultures: Culture[];
  activePeriodId: string;
  activeCultureId: string;
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
  materialTagBiases: Record<MaterialTag, number>;
  slotBiases: SlotBias[];
  motifTraits: string[];
  timeline: CulturePeriodProfile[];
}

export interface SlotBias {
  slotId: string;
  likelihoodDelta: number; // Alters optional slot likelihood
}

export interface CulturePeriodProfile {
  periodId: string;
  shifts: Array<
    | { type: 'material-preference'; tag: MaterialTag; weightDelta: number }
    | { type: 'slot-usage'; slotId: string; likelihoodDelta: number }
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
2. **Create cultures** with baseline material tag biases (metal-heavy vs stone-heavy).
3. **Assign culture profiles per period** (shifts in material or slot usage).
4. **Set an active period + culture** for the MVP.

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
      materialTagBiases: {
        metal: 1.2,
        stone: 0.9,
        wood: 1.1,
        bone: 0.8,
        clay: 1.0,
        glass: 0.2,
        fiber: 0.6
      },
      slotBiases: [{ slotId: 'crossguard', likelihoodDelta: -0.1 }],
      motifTraits: ['spiral', 'river-knot'],
      timeline: [
        { periodId: 'early', shifts: [{ type: 'material-preference', tag: 'metal', weightDelta: -0.1 }] },
        { periodId: 'classic', shifts: [{ type: 'material-preference', tag: 'metal', weightDelta: 0.2 }] }
      ]
    }
  ];

  return {
    seed,
    periods,
    cultures,
    activePeriodId: periods[0].id,
    activeCultureId: cultures[0].id
  };
}
```

---

## Applying Culture Biases to Generation
Milestone 1 defines `generateArtefact(blueprint)` with uniform material selection. Extend it by:
1. Selecting culture + period from Objective World State.
2. Adjusting optional slot likelihoods with `SlotBias` and period shifts.
3. Weighting material tags with culture biases and period shifts.

### Weighted Material Selection Sketch
```ts
import type { MaterialDefinition, MaterialTag } from '$lib/types/artefact';
import type { Culture, CulturePeriodProfile } from '$lib/types/world';

function resolveMaterialWeights(
  tag: MaterialTag,
  culture: Culture,
  profile?: CulturePeriodProfile
): number {
  const base = culture.materialTagBiases[tag] ?? 1;
  const shift = profile?.shifts.find((entry) => entry.type === 'material-preference' && entry.tag === tag);
  return Math.max(0.1, base + (shift?.weightDelta ?? 0));
}

export function pickMaterialWithBias(
  materials: MaterialDefinition[],
  allowedTags: MaterialTag[],
  culture: Culture,
  profile?: CulturePeriodProfile,
  rng: () => number
): MaterialDefinition {
  const weighted = materials
    .filter((mat) => allowedTags.some((tag) => mat.tags.includes(tag)))
    .map((mat) => ({
      material: mat,
      weight: mat.tags.reduce((sum, tag) => sum + resolveMaterialWeights(tag, culture, profile), 0)
    }));

  const total = weighted.reduce((sum, entry) => sum + entry.weight, 0);
  let roll = rng() * total;
  for (const entry of weighted) {
    roll -= entry.weight;
    if (roll <= 0) return entry.material;
  }
  return weighted[weighted.length - 1].material;
}
```

### Slot Likelihood Adjustment
```ts
export function rollSlot(
  slot: SlotDefinition,
  culture: Culture,
  profile?: CulturePeriodProfile,
  rng: () => number
): boolean {
  if (slot.required) return true;

  const base = slot.likelihood ?? 0;
  const cultureBias = culture.slotBiases.find((entry) => entry.slotId === slot.id)?.likelihoodDelta ?? 0;
  const shift = profile?.shifts.find((entry) => entry.type === 'slot-usage' && entry.slotId === slot.id);
  const probability = Math.min(1, Math.max(0, base + cultureBias + (shift?.likelihoodDelta ?? 0)));
  return rng() <= probability;
}
```

---

## Metadata Attachment
Each generated artefact should include provenance metadata (period, culture, context). This aligns with later subjective interpretation and contradiction detection.

```ts
export interface GeneratedArtefactWithProvenance extends GeneratedArtefact {
  provenance: ArtefactProvenance;
}
```

## UI Integration Plan
- Display period and culture labels in the discovery timeline.
- Add context tags (region/site/layer) under each artefact entry.
- Add a lightweight debug switch to cycle active culture/period to verify bias effects.

## Testing Plan
- Deterministic tests to ensure material bias impacts output (e.g., late period produces more metal).
- Snapshot tests comparing distributions across cultures/periods.

## Dependencies / Follow-on Work
- M1 artefact generator must accept a culture profile to apply bias.
- M3 subjective state will interpret these outputs and capture hypotheses against culture/period signals.

## Definition of Done
- Objective world state exists as a structured dataset.
- Artefact generation uses culture/period bias for materials and slots.
- UI surfaces culture/period metadata in artefact output.
- Tests verify bias influence and deterministic behavior.
