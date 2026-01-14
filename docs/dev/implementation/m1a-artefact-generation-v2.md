# Milestone 1 — Artefact Generation v2 (Blueprints & Anatomy)

## Purpose
Build a blueprint-driven artefact generator that replaces the current item+material pairing with structured artefacts composed of parts, slots, constraints, and per-part materials. This must align with the devlog’s intended anatomy logic while setting a stable foundation for the objective world state (M2) and subjective world state (M3).

## Objectives
- Introduce a **blueprint schema** for artefact types, slots, part likelihoods, and constraints.
- Generate artefacts through a **multi-stage pipeline** (blueprint → slots → parts → materials → validation).
- Output artefacts with **parts and materials** instead of a single item+material tuple.
- Preserve a small, deterministic test corpus to ensure constraints never fail.

## Data Model (TypeScript)
Define types that will persist and evolve in later milestones.

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
	required: boolean;
};

export type SlotDefinition = {
	id: string;
	displayName: string;
	likelihood: number; // 0..1 optional slot probability
	partOptions: string[]; // PartDefinition ids
};

export type ConstraintRule = {
	id: string;
	description: string;
	when: { partId: string; present: boolean }[];
	requires: { partId: string; present: boolean }[];
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
	parts: GeneratedPart[];
	metadata: {
		seed?: number;
		createdAt: string;
	};
};
```

## Data Model (JSON example)
Start with a small seed set for 2–3 artefact types to validate constraints.

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
			"likelihood": 1,
			"partOptions": ["handle"]
		},
		{
			"id": "blade",
			"displayName": "blade",
			"likelihood": 1,
			"partOptions": ["blade"]
		},
		{
			"id": "crossguard",
			"displayName": "crossguard",
			"likelihood": 0.6,
			"partOptions": ["crossguard"]
		},
		{
			"id": "pommel",
			"displayName": "pommel",
			"likelihood": 0.4,
			"partOptions": ["pommel"]
		}
	],
	"parts": [
		{
			"id": "handle",
			"displayName": "handle",
			"allowedMaterialTags": ["wood", "bone", "metal"],
			"required": true
		},
		{
			"id": "blade",
			"displayName": "blade",
			"allowedMaterialTags": ["metal", "stone"],
			"required": true
		},
		{
			"id": "crossguard",
			"displayName": "crossguard",
			"allowedMaterialTags": ["metal", "wood"],
			"required": false
		},
		{
			"id": "pommel",
			"displayName": "pommel",
			"allowedMaterialTags": ["metal", "stone"],
			"required": false
		}
	],
	"constraints": [
		{
			"id": "pommel-requires-handle",
			"description": "Pommel can only exist if handle exists",
			"when": [{ "partId": "pommel", "present": true }],
			"requires": [{ "partId": "handle", "present": true }]
		}
	]
}
```

## Generation Pipeline
1. **Select blueprint** (seeded random or from UI choice).
2. **Resolve slots**
   - Include required slots and roll for optional slot likelihoods.
3. **Resolve parts**
   - For each chosen slot, pick a part option.
4. **Assign materials**
   - Pick a material matching `allowedMaterialTags`.
5. **Validate constraints**
   - If violated, re-roll optional parts/materials up to N attempts.
6. **Emit generated artefact**
   - Add metadata (timestamp, seed, blueprint id).

## Service Implementation Outline (TypeScript)
```ts
import type {
	ArtefactBlueprint,
	GeneratedArtefact,
	GeneratedPart,
	MaterialDefinition
} from '$lib/types/artefact';

const MAX_ATTEMPTS = 5;

export function generateArtefact(
	blueprint: ArtefactBlueprint,
	materials: MaterialDefinition[],
	rng: () => number
): GeneratedArtefact {
	for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
		const parts = resolveParts(blueprint, materials, rng);
		if (validateConstraints(blueprint, parts)) {
			return {
				id: crypto.randomUUID(),
				blueprintId: blueprint.id,
				parts,
				metadata: { createdAt: new Date().toISOString() }
			};
		}
	}

	throw new Error(`Failed to generate artefact for blueprint ${blueprint.id}`);
}

function resolveParts(
	blueprint: ArtefactBlueprint,
	materials: MaterialDefinition[],
	rng: () => number
): GeneratedPart[] {
	const selectedSlots = blueprint.slots.filter((slot) => rng() <= slot.likelihood);
	return selectedSlots.map((slot) => {
		const partId = slot.partOptions[Math.floor(rng() * slot.partOptions.length)];
		const part = blueprint.parts.find((p) => p.id === partId);
		if (!part) {
			throw new Error(`Missing part definition: ${partId}`);
		}
		const candidates = materials.filter((mat) =>
			part.allowedMaterialTags.some((tag) => mat.tags.includes(tag))
		);
		const material = candidates[Math.floor(rng() * candidates.length)];
		return { partId: part.id, materialId: material.id };
	});
}

function validateConstraints(
	blueprint: ArtefactBlueprint,
	parts: GeneratedPart[]
): boolean {
	const present = new Set(parts.map((part) => part.partId));
	return blueprint.constraints.every((rule) => {
		const whenMatches = rule.when.every((condition) =>
			condition.present ? present.has(condition.partId) : !present.has(condition.partId)
		);
		if (!whenMatches) {
			return true;
		}
		return rule.requires.every((condition) =>
			condition.present ? present.has(condition.partId) : !present.has(condition.partId)
		);
	});
}
```

## UI Integration Plan
- Update the generator UI to list parts with materials per artefact (e.g., `Blade: obsidian`).
- Provide a compact summary list for the timeline (e.g., `obsidian-bladed sword`).
- Add a debug toggle to display blueprint + resolved parts for QA.

## Testing Plan
- Unit tests for constraints (required parts always present; invalid combinations never pass).
- Snapshot tests for deterministic generation using a seeded RNG.

## Dependencies / Follow-on Work
- M2 will replace static materials with culture- and period-driven material pools.
- M3 will attach hypotheses and notes to the generated artefact structure.

## Definition of Done
- Artefacts are generated from blueprints with slots, parts, and constraints.
- Each part has its own material with tag compatibility.
- UI shows the structured output.
- Tests cover constraint validation and deterministic generation.
