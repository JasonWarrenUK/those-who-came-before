# Milestone 1 — Artefact Generation (Alternate Grammar-First Approach)

## Purpose
Describe an alternate artefact generation flow that **starts from a context-free grammar (CFG)** instead of picking a known item type up front. The generator builds a structural blueprint first, validates it, and **then assigns a name/type** based on the resulting anatomy and measured properties.

## Core Idea
Instead of choosing “sword” and then filling in its schema, we:
1. **Sample a grammar** to produce a structured artefact blueprint (parts, attachments, counts).
2. **Compute structural features** (blade count, length, curvature, attachment angles, handle count, etc.).
3. **Validate** against constraints and plausibility rules (avoid nonsensical items).
4. **Classify and name** the item using logic based on the resulting features.

This enables discovery: the generator does not yet know if a “blade + handle” configuration is a sword, axe, sickle, knife, or spear until the geometry is resolved.

---

## High-Level Pipeline
1. **Grammar expansion** to create a candidate artefact tree.
2. **Structural normalization** (convert grammar nodes into blueprint slots and parts).
3. **Feature extraction** (length ratios, blade count, mounting types).
4. **Constraint validation** (structural, material, ergonomic rules).
5. **Type classification + naming** (derive a label and display name).
6. **Material assignment** (per-part material tags and pools).

---

## Context-Free Grammar (CFG)
The grammar produces a **blueprint tree** rather than a named artefact. It’s tuned for variety but constrained to avoid nonsense.

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

### Grammar Notes
- **Blade heads** can be single or double, with explicit length and edge characteristics.
- **Haft systems** imply long reach and shift classification toward polearms.
- **Body systems** describe non-weapon artefacts (brooches, clasps, small tools).
- **Hook heads** bias toward sickles, billhooks, or harvesting tools depending on curvature/length.

---

## Blueprint Normalization
Once a grammar tree is generated, normalize into a neutral blueprint:

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

---

## Feature Extraction
Compute features that drive classification:
- **Total length** (from grip/haft + head length).
- **Blade length ratio** (blade length / total length).
- **Blade count** and **edge count**.
- **Head attachment angle** (inline vs perpendicular).
- **Curvature** (high, medium, low).
- **Grip count** (single vs double grip).

These features become the basis for assigning a name.

---

## Validation & Plausibility Rules
The grammar is permissive, but validation rejects nonsense.

### Example Structural Constraints
- **Blade requires a grip or haft** (no free-floating heads).
- **Long blades** require at least a medium grip or haft (ergonomics).
- **Perpendicular head** requires a haft (axe/hammer style).
- **Double blades** must be parallel if attached inline (avoid physically impossible crossings).
- **Hook heads** must have single edge (avoid double-edged sickles).

### Material/Ergonomic Constraints
- Heavy heads require rigid haft materials (wood, bone, metal).
- Thin long blades must be metal or high-grade stone.

---

## Type Classification (Naming Logic)
The final item type is chosen after validation.

### Example Logic Table
| Features | Type |
|---|---|
| blade count=1, length=long, grip=single, attachment=inline | sword |
| blade count=1, length=short, grip=single | knife |
| blade count=1, length=medium, curvature=high | sickle |
| head=hammer, haft=long | hammer/polehammer |
| blade count=1, attachment=perpendicular, haft=long | axe |
| blade count=1, length=long, haft=long | spear |
| body+appendages, no blade | brooch/fastener |

### Naming Example
If grammar yields:
- `grip(short) + blade(length=medium, curvature=high)` → **sickle**
- `haft(long) + blade(length=long, attachment=inline)` → **spear**

The name is derived once structural certainty exists.

---

## Tuning for Variety (Avoiding Nonsense)
- **Weighted productions**: encourage common combinations; make rare forms possible.
- **Constraint-first retries**: if invalid, resample only the conflicting subtree.
- **Feature-aware sampling**: if a long blade is chosen, bias toward longer grips/hafts.
- **Soft caps** on extreme combinations (e.g., triple blades, ultra-long grips).

---

## Example Artefact Generation Walkthrough
1. Grammar expansion:
   - `<grip-system> → grip(short)`
   - `<head-system> → blade(count=1, length=medium, shape=curved)`
2. Normalize:
   - parts: grip, blade
   - attachment: inline, angle=0
3. Features:
   - blade length ratio: 0.55
   - curvature: high
4. Validate: passes (short grip acceptable for medium blade).
5. Classify: **sickle**.
6. Assign materials: blade=metal, grip=wood.

---

## Output Format (Example)
```json
{
  "id": "generated-uuid",
  "label": "sickle",
  "structure": {
    "parts": [
      { "id": "grip", "material": "ash", "props": { "length": "short" } },
      { "id": "blade", "material": "iron", "props": { "length": "medium", "curvature": "high" } }
    ],
    "attachments": [
      { "from": "grip", "to": "blade", "type": "inline", "angle": 0 }
    ]
  }
}
```

---

## Comparison with Blueprint-First Approach
- **Blueprint-first**: select known type → fill slots → validate.
- **Grammar-first (this)**: generate structure → validate → classify name.

This alternate approach is more exploratory and supports emergent artefact types without predefining every item schema.
