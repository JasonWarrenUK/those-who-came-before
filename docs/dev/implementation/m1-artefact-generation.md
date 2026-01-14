# Milestone 1 — Artefact Generation (CFG-First Anatomy with Blueprint Output)

## Purpose
Move from flat item/material pairs to **CFG-first artefact generation** that builds anatomy, validates constraints, and then **emits a normalized blueprint output** with parts, slots, constraints, and per-part materials. The primary path is grammar-first; blueprint-first remains a compatibility mode for authored artefact types.

## Objectives
- Define a **CFG-driven pipeline** for emergent artefact generation and classification.
- Emit artefacts as **normalized blueprints** with slots, parts, constraints, and materials.
- Output artefacts with **parts and materials** instead of a single item+material tuple.
- Preserve a small, deterministic test corpus to ensure constraints never fail.
- Keep a **compatibility blueprint-first path** for fixed, authored artefact types.

## Scope
- CFG expansion, structural normalization, constraint validation, and per-part material selection.
- UI output that renders artefact anatomy in text form.
- Debug output for QA of slot inclusion and constraint enforcement.

## Non-Goals (for this milestone)
- Culture/period simulation (Milestone 2).
- Player hypotheses and contradictions (Milestones 3+).
- Visual rendering of artefacts beyond text output.

---

## Normalized Blueprint Output (CFG Primary)
### TypeScript Interfaces
```ts
export type MaterialTag =
  | 'bone'
  | 'wood'
  | 'stone'
  | 'metal'
  | 'clay'
  | 'glass'
  | 'fiber';

export type MaterialDefinition = {
  id: string;
  displayName: string;
  tags: MaterialTag[];
};

export type PartDefinition = {
  id: string;
  displayName: string;
  allowedMaterialTags: MaterialTag[];
};

export type SlotDefinition = {
  id: string;
  displayName: string;
  required: boolean;
  likelihood?: number; // 0..1 optional slot probability
  partOptions: string[]; // PartDefinition ids
};

export type ConstraintRule =
  | {
      type: 'requires' | 'excludes';
      slotId: string;
      targetSlotId: string;
    }
  | {
      type: 'ordering';
      slotId: string;
      ordering: Array<{ slotId: string; position: 'before' | 'after' }>;
    };

export type ArtefactBlueprint = {
  id: string;
  displayName: string;
  orientation: 'near-far' | 'bottom-top' | 'back-front';
  position: 'held' | 'free' | 'worn' | 'mounted';
  slots: SlotDefinition[];
  parts: PartDefinition[];
  constraints: ConstraintRule[];
};

export type GeneratedPart = {
  partId: string;
  materialId: string;
};

export type GeneratedArtefact = {
  id: string;
  blueprintId: string;
  label: string;
  parts: GeneratedPart[];
  metadata: {
    seed?: string;
    createdAt: string;
  };
};
```

### JSON Blueprint Example
```json
{
  "id": "sword",
  "displayName": "sword",
  "orientation": "near-far",
  "position": "held",
  "slots": [
    {
      "id": "grip",
      "displayName": "grip",
      "required": true,
      "partOptions": ["handle"]
    },
    {
      "id": "blade",
      "displayName": "blade",
      "required": true,
      "partOptions": ["blade"]
    },
    {
      "id": "crossguard",
      "displayName": "crossguard",
      "required": false,
      "likelihood": 0.4,
      "partOptions": ["crossguard"]
    },
    {
      "id": "pommel",
      "displayName": "pommel",
      "required": false,
      "likelihood": 0.3,
      "partOptions": ["pommel"]
    }
  ],
  "parts": [
    {
      "id": "handle",
      "displayName": "handle",
      "allowedMaterialTags": ["wood", "bone", "metal"]
    },
    {
      "id": "blade",
      "displayName": "blade",
      "allowedMaterialTags": ["metal", "stone"]
    },
    {
      "id": "crossguard",
      "displayName": "crossguard",
      "allowedMaterialTags": ["metal", "wood", "bone"]
    },
    {
      "id": "pommel",
      "displayName": "pommel",
      "allowedMaterialTags": ["metal", "bone", "stone"]
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

---

## Generation Pipeline (CFG-First Primary)
1. **Expand grammar** to create a candidate artefact tree.
2. **Normalize structure** into slots + parts (blueprint output).
3. **Extract features** (length ratios, blade count, mounting types).
4. **Validate constraints** (structural, material, ergonomic).
5. **Classify and name** the artefact based on features.
6. **Assign materials** per part, using allowed tags/pools.
7. **Emit generated artefact** with metadata (timestamp, seed).

### Generator Implementation Sketch
```ts
const MAX_ATTEMPTS = 5;

function shouldIncludeSlot(slot: SlotDefinition, rng: () => number): boolean {
  if (slot.required) return true;
  const chance = slot.likelihood ?? 0;
  return rng() <= chance;
}

export function generateArtefact(
  blueprint: ArtefactBlueprint,
  materials: MaterialDefinition[],
  rng: () => number
): GeneratedArtefact {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const selectedSlots = blueprint.slots.filter((slot) => shouldIncludeSlot(slot, rng));
    const parts = selectedSlots.map((slot) => {
      const partId = slot.partOptions[Math.floor(rng() * slot.partOptions.length)];
      const part = blueprint.parts.find((entry) => entry.id === partId);
      if (!part) {
        throw new Error(`Missing part definition: ${partId}`);
      }
      const candidates = materials.filter((mat) =>
        part.allowedMaterialTags.some((tag) => mat.tags.includes(tag))
      );
      const material = candidates[Math.floor(rng() * candidates.length)];
      return { partId: part.id, materialId: material.id };
    });

    if (validateConstraints(blueprint, parts)) {
      return {
        id: crypto.randomUUID(),
        blueprintId: blueprint.id,
        label: blueprint.displayName,
        parts,
        metadata: { createdAt: new Date().toISOString() }
      };
    }
  }

  throw new Error(`Failed to generate artefact for blueprint ${blueprint.id}`);
}
```

### Example Material Pools
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

---

## Grammar-First Core (Emergent Artefacts)
The grammar-first path **is the primary generation method**. It starts from a context-free grammar (CFG) and classifies the artefact after structural validation.

### High-Level Pipeline
1. **Grammar expansion** to create a candidate artefact tree.
2. **Structural normalization** (convert grammar nodes into blueprint slots and parts).
3. **Feature extraction** (length ratios, blade count, mounting types).
4. **Constraint validation** (structural, material, ergonomic rules).
5. **Type classification + naming** (derive a label and display name).
6. **Material assignment** (per-part material tags and pools).

### Example Grammar (pseudo-BNF)
```
<artefact> ::= <grip-system> <head-system>
            | <haft-system> <head-system>
            | <handle-system> <body-system>

<grip-system> ::= <single-grip> | <double-grip>
<single-grip> ::= grip(length=short|medium)
<double-grip> ::= grip(length=long) grip(length=short)

<haft-system> ::= haft(length=long) | haft(length=medium)

<handle-system> ::= handle(length=short|medium)

<head-system> ::= <blade-head> | <hammer-head> | <hook-head>

<blade-head> ::= blade(count=1, shape=straight|curved, length=short|medium|long, edge=single|double)
               | blade(count=2, shape=straight, length=short|medium, arrangement=parallel|forked)

<hammer-head> ::= hammer(face=flat|rounded, mass=light|heavy)

<hook-head> ::= hook(curvature=high, length=short|medium)

<body-system> ::= body(core=rigid, size=small|medium) <appendages>
<appendages> ::= appendage(type=pin|loop|strap, count=1|2|3)
               | appendage(type=none)
```

### Normalized Blueprint Shape
```ts
export type GrammarNode = {
  kind: string;
  props?: Record<string, string | number>;
  children?: GrammarNode[];
};

export type NormalizedBlueprint = {
  parts: Array<{
    id: string;
    role: 'grip' | 'haft' | 'blade' | 'head' | 'body' | 'appendage';
    props: Record<string, string | number>;
  }>;
  attachments: Array<{
    from: string;
    to: string;
    type: 'inline' | 'perpendicular' | 'socketed' | 'riveted';
    angle?: number;
  }>;
};
```

### Validation & Plausibility Rules
- **Blade requires a grip or haft** (no free-floating heads).
- **Long blades** require at least a medium grip or haft (ergonomics).
- **Perpendicular head** requires a haft (axe/hammer style).
- **Double blades** must be parallel if attached inline.
- **Hook heads** must have single edge (avoid double-edged sickles).
- **Heavy heads** require rigid haft materials (wood, bone, metal).

### Type Classification (Naming Logic)
| Features | Type |
|---|---|
| blade count=1, length=long, grip=single, attachment=inline | sword |
| blade count=1, length=short, grip=single | knife |
| blade count=1, length=medium, curvature=high | sickle |
| head=hammer, haft=long | hammer/polehammer |
| blade count=1, attachment=perpendicular, haft=long | axe |
| blade count=1, length=long, haft=long | spear |
| body+appendages, no blade | brooch/fastener |

---

## Blueprint-First Compatibility Path (Secondary)
Some artefacts may still be authored as fixed blueprints (legacy or curated types). In that case:
1. **Select blueprint** (seeded random or from UI choice).
2. **Resolve slots** (required + likelihood for optional).
3. **Resolve parts** and **assign materials**.
4. **Validate constraints** (re-roll optional slots/materials up to N attempts).
5. **Emit generated artefact** with metadata.

## UI Updates
- Replace `GeneratedItem` output with `GeneratedArtefact` output.
- Render slot breakdowns (e.g., `blade: obsidian`, `grip: ash`).
- Add a debug toggle to show blueprint + resolved parts and constraint checks.

## Testing Plan
- Unit tests for constraint validation (required parts always present; invalid combos never pass).
- Snapshot tests for deterministic generation using a seeded RNG.
- Small regression corpus (2–3 blueprints) to ensure slot/material pools remain stable.

## Dependencies / Follow-on Work
- Milestone 2 will replace static materials with culture- and period-driven material pools.
- Milestone 3 will attach hypotheses and notes to generated artefact structures.

## Definition of Done
- Artefacts are generated from blueprints with slots, parts, and constraints.
- Each part has its own material with tag compatibility.
- UI shows structured output and debug details.
- Tests cover constraint validation and deterministic generation.
