# Milestone 2 — Objective World State (Cultures + Chronology)

## Purpose
Introduce the hidden, authoritative simulation model that drives artefact generation. This objective world state supplies periods, cultures, and evolving material/motif tendencies that inform the blueprint generator defined in M1.

## Objectives
- Define **chronology** and **culture** schemas that drive artefact generation.
- Implement a minimal world generator (1–2 cultures, 2–3 periods) as a baseline.
- Feed **culture- and period-specific biases** into the M1 generator (material tags, part likelihoods).
- Store world state in a stable data structure that can be referenced by the subjective model (M3).

## World State Data Model (TypeScript)
```ts
import type { MaterialTag } from '$lib/types/artefact';

export type Period = {
	id: string;
	displayName: string;
	startYear: number;
	endYear: number;
};

export type CultureProfile = {
	materialTagBias: Record<MaterialTag, number>; // e.g., metal: 1.4, bone: 0.7
	partLikelihoodBias: Record<string, number>; // per partId (e.g., crossguard: 0.5)
	motifTags: string[];
};

export type Culture = {
	id: string;
	displayName: string;
	periodProfiles: Record<string, CultureProfile>; // key: periodId
};

export type ObjectiveWorldState = {
	periods: Period[];
	cultures: Culture[];
	activeCultureId: string;
	activePeriodId: string;
};
```

## World State Seed (JSON example)
```json
{
	"periods": [
		{ "id": "early", "displayName": "Early Period", "startYear": -800, "endYear": -400 },
		{ "id": "late", "displayName": "Late Period", "startYear": -399, "endYear": -100 }
	],
	"cultures": [
		{
			"id": "ashvale",
			"displayName": "Ashvale",
			"periodProfiles": {
				"early": {
					"materialTagBias": { "metal": 0.9, "stone": 1.3, "wood": 1.1, "bone": 0.8, "clay": 1.0, "glass": 0.2, "fiber": 0.5 },
					"partLikelihoodBias": { "crossguard": 0.5 },
					"motifTags": ["spiral", "sunburst"]
				},
				"late": {
					"materialTagBias": { "metal": 1.4, "stone": 0.7, "wood": 1.0, "bone": 0.6, "clay": 1.0, "glass": 0.4, "fiber": 0.6 },
					"partLikelihoodBias": { "crossguard": 0.8 },
					"motifTags": ["chevron", "knotwork"]
				}
			}
		}
	],
	"activeCultureId": "ashvale",
	"activePeriodId": "early"
}
```

## Integration with M1 Generator
### Apply Culture Bias to Materials
```ts
import type { CultureProfile } from '$lib/types/world';
import type { MaterialDefinition, MaterialTag } from '$lib/types/artefact';

export function pickMaterialWithBias(
	materials: MaterialDefinition[],
	allowedTags: MaterialTag[],
	profile: CultureProfile,
	rng: () => number
): MaterialDefinition {
	const weighted = materials
		.filter((mat) => allowedTags.some((tag) => mat.tags.includes(tag)))
		.map((mat) => ({
			material: mat,
			weight: Math.max(
				0.1,
				mat.tags.reduce((sum, tag) => sum + (profile.materialTagBias[tag] ?? 1), 0)
			)
		}));

	const total = weighted.reduce((sum, entry) => sum + entry.weight, 0);
	let roll = rng() * total;
	for (const entry of weighted) {
		roll -= entry.weight;
		if (roll <= 0) {
			return entry.material;
		}
	}

	return weighted[weighted.length - 1].material;
}
```

### Apply Culture Bias to Optional Parts
```ts
import type { SlotDefinition } from '$lib/types/artefact';
import type { CultureProfile } from '$lib/types/world';

export function rollSlot(
	slot: SlotDefinition,
	profile: CultureProfile,
	rng: () => number
): boolean {
	const bias = profile.partLikelihoodBias[slot.id] ?? 1;
	const probability = Math.min(1, Math.max(0, slot.likelihood * bias));
	return rng() <= probability;
}
```

## Objective World State Store
```ts
import type { ObjectiveWorldState } from '$lib/types/world';
import seed from '$lib/data/world-seed.json';

export const objectiveWorldState: ObjectiveWorldState = {
	...seed
};
```

## UI Integration Plan
- Extend artefact output to show **culture** and **period** metadata.
- Add a lightweight debug switch to cycle active culture/period to verify bias effects.

## Testing Plan
- Deterministic tests to ensure material bias impacts output (e.g., late period produces more metal).
- Snapshot tests comparing distributions across cultures/periods.

## Dependencies / Follow-on Work
- M1 artefact generator must accept a culture profile to apply bias.
- M3 subjective state will interpret these outputs and capture hypotheses against culture/period signals.

## Definition of Done
- Objective world state exists as a structured dataset.
- Artefact generation uses culture/period bias for materials and parts.
- UI surfaces culture/period metadata in artefact output.
- Tests verify bias influence and deterministic behavior.
