/**
 * MVP material definitions (doc 05 §7, §15, roadmap 2GN.22).
 *
 * `assignMaterial` (roadmap 2GN.23, `engine/generation/materials.ts`) filters this list by
 * component compatibility (`tags`), then by geological availability (`GeologicalContext`, keyed
 * against `id`) and cultural affinity (`CulturalProfile.materialAffinities`, keyed against
 * `tags`) before weighting survivors by `craftDomain` against `PhaseCharacteristics.technology`.
 * None of that filtering/weighting/availability logic lives here — this module is static data
 * only, no behaviour. Decoration prerequisite-checking against `decorability`
 * (`src/lib/data/decorations.ts`, roadmap 2GN.28) is likewise out of scope.
 *
 * Superseded reference: `backlog/materials.ts` held only a flat `string[][]` of names grouped by
 * category (doc 05 §15 calls this a full replacement, not a porting source). `mercury`, `pewter`,
 * `steel` and the extra wood duplicates (`elm`, `mahogany`, `willow`) are dropped here as
 * anachronistic or redundant against doc 05's implied bronze/iron-age scope; `oak`/`ash` already
 * cover the wood category.
 *
 * Every `MaterialTag` (`tags.ts`) has at least one entry below.
 */

import type { MaterialDefinition } from '../types/artefact.ts';

export const MATERIALS: readonly MaterialDefinition[] = [
	{
		id: 'bronze',
		displayName: 'Bronze',
		tags: ['metal'],
		craftDomain: 'metallurgy',
		physicalProperties: { hardness: 'medium' },
		decorability: { engravable: true, paintable: false, glazeable: false },
	},
	{
		id: 'iron',
		displayName: 'Iron',
		tags: ['metal'],
		craftDomain: 'metallurgy',
		physicalProperties: { hardness: 'hard' },
		decorability: { engravable: true, paintable: false, glazeable: false },
	},
	{
		id: 'gold',
		displayName: 'Gold',
		tags: ['metal', 'precious-metal'],
		craftDomain: 'metallurgy',
		physicalProperties: { hardness: 'soft' },
		// Soft per doc 05 §8.2's literal `[requires: hard material]` engraving prerequisite —
		// real-world gold chasing/repoussé notwithstanding, this keeps the data internally
		// consistent with the hardness-gated invariant tested in materials.test.ts.
		decorability: { engravable: false, paintable: false, glazeable: false },
	},
	{
		id: 'silver',
		displayName: 'Silver',
		tags: ['metal', 'precious-metal'],
		craftDomain: 'metallurgy',
		physicalProperties: { hardness: 'soft' },
		decorability: { engravable: false, paintable: false, glazeable: false },
	},
	{
		id: 'obsidian',
		displayName: 'Obsidian',
		tags: ['stone'],
		craftDomain: 'stoneWorking',
		physicalProperties: { hardness: 'hard' },
		decorability: { engravable: true, paintable: false, glazeable: false },
	},
	{
		id: 'flint',
		displayName: 'Flint',
		tags: ['stone'],
		craftDomain: 'stoneWorking',
		physicalProperties: { hardness: 'hard' },
		decorability: { engravable: false, paintable: false, glazeable: false },
	},
	{
		id: 'granite',
		displayName: 'Granite',
		tags: ['stone'],
		craftDomain: 'stoneWorking',
		physicalProperties: { hardness: 'hard' },
		decorability: { engravable: false, paintable: false, glazeable: false },
	},
	{
		id: 'jade',
		displayName: 'Jade',
		tags: ['precious-stone'],
		craftDomain: 'stoneWorking',
		physicalProperties: { hardness: 'hard' },
		decorability: { engravable: true, paintable: false, glazeable: false },
	},
	{
		id: 'oak',
		displayName: 'Oak',
		tags: ['wood'],
		craftDomain: 'woodWorking',
		physicalProperties: { hardness: 'medium' },
		decorability: { engravable: true, paintable: true, glazeable: false },
	},
	{
		id: 'ash',
		displayName: 'Ash',
		tags: ['wood'],
		craftDomain: 'woodWorking',
		physicalProperties: { hardness: 'medium' },
		decorability: { engravable: true, paintable: true, glazeable: false },
	},
	{
		id: 'bone',
		displayName: 'Bone',
		// No dedicated bone-working axis exists on `PhaseCharacteristics.technology` (doc 05 §3.2);
		// `woodWorking` is the nearest doc-defined proxy for hand-tool-worked organic material.
		tags: ['bone'],
		craftDomain: 'woodWorking',
		physicalProperties: { hardness: 'medium' },
		decorability: { engravable: true, paintable: false, glazeable: false },
	},
	{
		id: 'antler',
		displayName: 'Antler',
		tags: ['bone'],
		craftDomain: 'woodWorking',
		physicalProperties: { hardness: 'hard' },
		decorability: { engravable: true, paintable: false, glazeable: false },
	},
	{
		id: 'fired-clay',
		displayName: 'Fired clay',
		tags: ['clay'],
		craftDomain: 'ceramics',
		physicalProperties: { hardness: 'medium' },
		decorability: { engravable: false, paintable: true, glazeable: true },
	},
	{
		id: 'glass',
		displayName: 'Glass',
		tags: ['glass'],
		craftDomain: 'glassWorking',
		physicalProperties: { hardness: 'medium' },
		decorability: { engravable: false, paintable: false, glazeable: false },
	},
	{
		id: 'linen',
		displayName: 'Linen',
		tags: ['fiber'],
		craftDomain: 'textiles',
		physicalProperties: { hardness: 'soft' },
		decorability: { engravable: false, paintable: true, glazeable: false },
	},
	{
		id: 'leather',
		displayName: 'Leather',
		tags: ['leather'],
		craftDomain: 'textiles',
		physicalProperties: { hardness: 'soft' },
		decorability: { engravable: false, paintable: true, glazeable: false },
	},
];
