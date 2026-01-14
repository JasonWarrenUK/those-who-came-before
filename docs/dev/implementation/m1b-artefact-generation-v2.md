# Milestone 1 — Artefact Generation v2 (Blueprints & Anatomy)

## Purpose
Move from flat item/material pairs to blueprint-driven artefacts with parts, slots, constraints, and per-part materials. This sets the foundation for culture-aware generation in later milestones.

## Scope
- Introduce an artefact blueprint schema.
- Generate parts via slots with likelihoods.
- Enforce structural constraints (required parts and placement rules).
- Assign materials per part.
- Update UI to display artefact anatomy.
- Provide debug output to validate generation decisions.

## Non-Goals (for this milestone)
- Culture/period simulation (Milestone 2).
- Player hypotheses and contradictions (Milestones 3+).
- Visual rendering of artefacts beyond text output.

## Data Model
### TypeScript Interfaces
```ts
export type SlotId = 'grip' | 'blade' | 'crossguard' | 'pommel' | 'mouth' | 'body' | 'pin' | 'frontpiece';

export interface ArtefactBlueprint {
  id: string;
  label: string;
  orientation: 'near-to-far' | 'bottom-to-top' | 'back-to-front';
  position: 'held' | 'worn' | 'free';
  slots: ArtefactSlot[];
  constraints: ArtefactConstraint[];
}

export interface ArtefactSlot {
  id: SlotId;
  label: string;
  required: boolean;
  likelihood?: number; // 0..1 for optional slots
  partOptions: PartOption[];
}

export interface PartOption {
  id: string;
  label: string;
  materials: MaterialPoolId[];
}

export type MaterialPoolId = 'bone' | 'metal' | 'stone' | 'wood' | 'ceramic' | 'fiber';

export interface ArtefactConstraint {
  type: 'requires' | 'excludes' | 'ordering';
  slotId: SlotId;
  targetSlotId?: SlotId;
  ordering?: Array<{ slotId: SlotId; position: 'before' | 'after' }>;
}

export interface GeneratedArtefact {
  id: string;
  blueprintId: string;
  label: string;
  slots: GeneratedSlot[];
}

export interface GeneratedSlot {
  slotId: SlotId;
  partId: string;
  partLabel: string;
  material: string;
}
```

### JSON Blueprint Example
```json
{
  "id": "sword",
  "label": "sword",
  "orientation": "near-to-far",
  "position": "held",
  "slots": [
    {
      "id": "grip",
      "label": "grip",
      "required": true,
      "partOptions": [
        { "id": "handle", "label": "handle", "materials": ["wood", "bone", "metal"] }
      ]
    },
    {
      "id": "blade",
      "label": "blade",
      "required": true,
      "partOptions": [
        { "id": "blade", "label": "blade", "materials": ["metal", "stone"] }
      ]
    },
    {
      "id": "crossguard",
      "label": "crossguard",
      "required": false,
      "likelihood": 0.4,
      "partOptions": [
        { "id": "crossguard", "label": "crossguard", "materials": ["metal", "wood", "bone"] }
      ]
    },
    {
      "id": "pommel",
      "label": "pommel",
      "required": false,
      "likelihood": 0.3,
      "partOptions": [
        { "id": "pommel", "label": "pommel", "materials": ["metal", "bone", "stone"] }
      ]
    }
  ],
  "constraints": [
    { "type": "requires", "slotId": "pommel", "targetSlotId": "grip" },
    { "type": "requires", "slotId": "crossguard", "targetSlotId": "grip" },
    {
      "type": "ordering",
      "slotId": "crossguard",
      "ordering": [
        { "slotId": "grip", "position": "before" },
        { "slotId": "blade", "position": "after" }
      ]
    }
  ]
}
```

## Generation Flow
1. **Select blueprint** (random from available list).
2. **Resolve slots**: required slots always included; optional slots included by likelihood.
3. **Apply constraints**: validate required relationships (e.g., pommel requires grip).
4. **Pick part option**: for each slot, choose one option.
5. **Assign materials**: choose a material from part option’s pool.
6. **Build GeneratedArtefact**: combine slot outputs into a structured result.

### Generator Implementation Sketch
```ts
import { indexRandom } from '$lib/utils/indexRandom';
import { materialPools } from '$lib/data/materialPools';
import type {
  ArtefactBlueprint,
  GeneratedArtefact,
  GeneratedSlot,
  PartOption
} from '$lib/types/artefact';

function shouldIncludeSlot(slot: ArtefactSlot): boolean {
  if (slot.required) return true;
  const chance = slot.likelihood ?? 0;
  return Math.random() < chance;
}

function pickPart(partOptions: PartOption[]): PartOption {
  return partOptions[indexRandom(partOptions)];
}

function pickMaterial(poolIds: MaterialPoolId[]): string {
  const poolId = poolIds[indexRandom(poolIds)];
  const pool = materialPools[poolId];
  return pool[indexRandom(pool)];
}

function validateConstraints(
  slots: GeneratedSlot[],
  constraints: ArtefactConstraint[]
): void {
  for (const constraint of constraints) {
    if (constraint.type === 'requires') {
      const hasSlot = slots.some((slot) => slot.slotId === constraint.slotId);
      const hasTarget = slots.some((slot) => slot.slotId === constraint.targetSlotId);
      if (hasSlot && !hasTarget) {
        throw new Error(`Constraint violation: ${constraint.slotId} requires ${constraint.targetSlotId}`);
      }
    }
  }
}

export function generateArtefact(
  blueprint: ArtefactBlueprint,
  id: string
): GeneratedArtefact {
  const generatedSlots: GeneratedSlot[] = [];

  for (const slot of blueprint.slots) {
    if (!shouldIncludeSlot(slot)) continue;
    const part = pickPart(slot.partOptions);
    generatedSlots.push({
      slotId: slot.id,
      partId: part.id,
      partLabel: part.label,
      material: pickMaterial(part.materials)
    });
  }

  validateConstraints(generatedSlots, blueprint.constraints);

  return {
    id,
    blueprintId: blueprint.id,
    label: blueprint.label,
    slots: generatedSlots
  };
}
```

## Data Files
- `src/lib/data/artefactBlueprints.ts` — list of `ArtefactBlueprint` objects.
- `src/lib/data/materialPools.ts` — named material pools for parts.

Example material pools:
```ts
export const materialPools = {
  bone: ['bone', 'horn', 'ivory'],
  metal: ['bronze', 'copper', 'gold', 'iron', 'silver', 'steel'],
  stone: ['flint', 'granite', 'obsidian'],
  wood: ['ash', 'elm', 'oak', 'willow'],
  ceramic: ['clay', 'terracotta'],
  fiber: ['linen', 'hemp']
};
```

## UI Updates
- Replace `GeneratedItem` output with `GeneratedArtefact` output.
- Update lists to render slot breakdowns (e.g., `blade: obsidian`, `grip: ash`).
- Add a “debug details” toggle to show slot inclusion and constraints applied.

## Acceptance Criteria
- Artefacts include required parts and optional parts obey likelihood.
- Constraint violations are impossible in normal generation (tests enforce).
- UI shows part-level anatomy for each artefact.
- Generator can be reused by Milestone 2 with culture-based material biasing.

## Dependencies for Milestone 2
- Blueprint schema must support material pools and slot-level generation so cultures can bias materials.
- Generated artefacts must expose enough metadata (part and material) to feed cultural inference later.
