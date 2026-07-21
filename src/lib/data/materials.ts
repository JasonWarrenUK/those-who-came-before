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
		physicalProperties: { hardness: 'medium', workable: true },
		decorability: { engravable: true, paintable: false, glazeable: false },
	},
	{
		id: 'iron',
		displayName: 'Iron',
		tags: ['metal'],
		craftDomain: 'metallurgy',
		physicalProperties: { hardness: 'hard', workable: true },
		decorability: { engravable: true, paintable: false, glazeable: false },
	},
	{
		id: 'gold',
		displayName: 'Gold',
		tags: ['metal', 'precious-metal'],
		craftDomain: 'metallurgy',
		// Soft (malleable, not structurally hard) but genuinely engravable via chasing and
		// repoussé — hardness and workability are independent axes for this reason.
		physicalProperties: { hardness: 'soft', workable: true },
		decorability: { engravable: true, paintable: false, glazeable: false },
	},
	{
		id: 'silver',
		displayName: 'Silver',
		tags: ['metal', 'precious-metal'],
		craftDomain: 'metallurgy',
		physicalProperties: { hardness: 'soft', workable: true },
		decorability: { engravable: true, paintable: false, glazeable: false },
	},
	{
		id: 'obsidian',
		displayName: 'Obsidian',
		tags: ['stone'],
		craftDomain: 'stoneWorking',
		physicalProperties: { hardness: 'hard', workable: true },
		decorability: { engravable: true, paintable: false, glazeable: false },
	},
	{
		id: 'flint',
		displayName: 'Flint',
		tags: ['stone'],
		craftDomain: 'stoneWorking',
		// Hard but brittle/coarse-fracturing: it flakes rather than holding an incised line.
		physicalProperties: { hardness: 'hard', workable: false },
		decorability: { engravable: false, paintable: false, glazeable: false },
	},
	{
		id: 'granite',
		displayName: 'Granite',
		tags: ['stone'],
		craftDomain: 'stoneWorking',
		// Hard but coarse-grained: it doesn't take a fine incised line.
		physicalProperties: { hardness: 'hard', workable: false },
		decorability: { engravable: false, paintable: false, glazeable: false },
	},
	{
		id: 'jade',
		displayName: 'Jade',
		tags: ['precious-stone'],
		craftDomain: 'stoneWorking',
		physicalProperties: { hardness: 'hard', workable: true },
		decorability: { engravable: true, paintable: false, glazeable: false },
	},
	{
		id: 'oak',
		displayName: 'Oak',
		tags: ['wood'],
		craftDomain: 'woodWorking',
		physicalProperties: { hardness: 'medium', workable: true },
		decorability: { engravable: true, paintable: true, glazeable: false },
	},
	{
		id: 'ash',
		displayName: 'Ash',
		tags: ['wood'],
		craftDomain: 'woodWorking',
		physicalProperties: { hardness: 'medium', workable: true },
		decorability: { engravable: true, paintable: true, glazeable: false },
	},
	{
		id: 'bone',
		displayName: 'Bone',
		tags: ['bone'],
		craftDomain: 'boneWorking',
		physicalProperties: { hardness: 'medium', workable: true },
		decorability: { engravable: true, paintable: false, glazeable: false },
	},
	{
		id: 'antler',
		displayName: 'Antler',
		tags: ['bone'],
		craftDomain: 'boneWorking',
		physicalProperties: { hardness: 'hard', workable: true },
		decorability: { engravable: true, paintable: false, glazeable: false },
	},
	{
		id: 'fired-clay',
		displayName: 'Fired clay',
		tags: ['clay'],
		craftDomain: 'ceramics',
		// Workable pre-firing (incising is how clay decoration usually happens), but modelled here
		// as post-firing, at which point it's brittle rather than incisable — hence not engravable.
		physicalProperties: { hardness: 'medium', workable: false },
		decorability: { engravable: false, paintable: true, glazeable: true },
	},
	{
		id: 'glass',
		displayName: 'Glass',
		tags: ['glass'],
		craftDomain: 'glassWorking',
		physicalProperties: { hardness: 'medium', workable: false },
		decorability: { engravable: false, paintable: false, glazeable: false },
	},
	{
		id: 'linen',
		displayName: 'Linen',
		tags: ['fiber'],
		craftDomain: 'textiles',
		physicalProperties: { hardness: 'soft', workable: false },
		decorability: { engravable: false, paintable: true, glazeable: false },
	},
	{
		id: 'leather',
		displayName: 'Leather',
		tags: ['leather'],
		craftDomain: 'textiles',
		// Soft and pliable/fibrous, unlike gold's soft-but-workable metal structure — leather isn't
		// incisable in the same sense, hence not workable.
		physicalProperties: { hardness: 'soft', workable: false },
		decorability: { engravable: false, paintable: true, glazeable: false },
	},
];
