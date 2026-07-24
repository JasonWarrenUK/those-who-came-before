/**
 * Explorer-only preset cultures (roadmap 2GN.57).
 *
 * No culture generator exists yet — chronology/culture generation is scoped to `engine/world/`
 * (roadmap 2GN.*, 3WS.*) and hasn't landed. The structure viewer's culture selector needs
 * *something* concrete to offer, so these four presets are hand-authored `CulturalProfile` +
 * `PhaseCharacteristics` pairs, not a substitute for that future generator. They are fictional
 * (invented names, not references to real-world cultures) but each leans on a distinct,
 * recognisable production-culture archetype — pastoral/steppe, maritime-trade palace,
 * jungle-religious/monumental, imperial-metalworking — chosen so the four sit at different points
 * on `society.craftSpecialisation` (drives `deriveComplexityBudget`'s tier: simple `<0.3`,
 * moderate `<0.6`, sophisticated `>=0.6`) and visibly diverge in the generated component tree.
 *
 * Each preset also carries a hand-authored single-region `geology` and its `trade` flows, added for
 * the material viewer (roadmap 2GN.60): `assignMaterial` needs both, and without per-preset
 * variation every culture would show an identical scarcity picture, leaving only the affinity axis
 * observable. Real geology generation is roadmap 3WS.7, which sits behind the whole-M2 gate —
 * Milestone 2 runs against preset worlds by design, so these stand in until then.
 *
 * Superseded once 2GN.66 (naming grammars) and the `engine/world/` culture generator land (3WS.7
 * for the geology half); this module is a developer-tooling stopgap, not shipped game content.
 */

import type {
	AvailabilityLevel,
	CulturalProfile,
	GeologicalContext,
	MaterialFlow,
	PhaseCharacteristics,
} from '../types/world.ts';
import type { MaterialTag } from '../types/tags.ts';

/** One Explorer preset: a named, described culture paired with a single phase to generate against. */
export interface ExplorerCulture {
	/** Stable id, used as the culture selector's option value. */
	id: string;

	/** Human-readable name shown in the selector. */
	label: string;

	/** One-line flavour text shown beneath the selector. */
	description: string;

	/** Stable material/technique/motif tendencies (doc 05 §3.3). */
	profile: CulturalProfile;

	/** The single phase this preset generates against (doc 05 §3.2). */
	phase: PhaseCharacteristics;

	/**
	 * Local material scarcity for this culture's single region (doc 05 §3.6). Every one of the 16
	 * shipped materials carries an explicit level, so `isAvailable`'s missing-entry lenience never
	 * applies here and the material viewer (2GN.60) never has to show an "unmodelled" state.
	 */
	geology: GeologicalContext;

	/** Trade flows reaching this culture, rescuing `trade-only` materials (doc 05 §3.4). */
	trade: MaterialFlow[];
}

function materialAffinities(entries: [MaterialTag, number][]): Map<MaterialTag, number> {
	return new Map(entries);
}

/** The 16 shipped material ids, in `src/lib/data/materials.ts` order. */
const MATERIAL_IDS = [
	'bronze',
	'iron',
	'gold',
	'silver',
	'obsidian',
	'flint',
	'granite',
	'jade',
	'oak',
	'ash',
	'bone',
	'antler',
	'fired-clay',
	'glass',
	'linen',
	'leather',
] as const;

/**
 * Builds a single-region `GeologicalContext` from a complete material→level map.
 *
 * Every id in `MATERIAL_IDS` must be present: the whole point of these presets is that the
 * material viewer sees a fully-modelled geology, so a missing entry is an authoring error rather
 * than an implicit "unmodelled, treat leniently".
 */
function geology(
	region: string,
	levels: Record<(typeof MATERIAL_IDS)[number], AvailabilityLevel>,
): GeologicalContext {
	return {
		materialAvailability: new Map(
			MATERIAL_IDS.map((materialId) => [
				materialId,
				{ materialId, regions: new Map([[region, levels[materialId]]]) },
			]),
		),
	};
}

export const EXPLORER_CULTURES: readonly ExplorerCulture[] = [
	{
		id: 'tarpan',
		label: 'Tarpan',
		description: 'Mobile steppe pastoralists — low specialisation, bone and metal, burial-heavy.',
		profile: {
			materialAffinities: materialAffinities([
				['bone', 1.6],
				['metal', 1.3],
				['leather', 1.2],
			]),
			techniqueAffinities: new Map([
				['engraving', 1.2],
				['wire-wrapping', 1.3],
			]),
			motifVocabulary: {
				motifs: [
					{ id: 'horse-frieze', label: 'Horse Frieze', culturalOrigin: 'tarpan' },
					{ id: 'sun-wheel', label: 'Sun Wheel', culturalOrigin: 'tarpan' },
					// Diffusion case: exercises borrowed-motif tracking (doc 05 §8.5) — Tarpan's
					// vocabulary includes a motif it didn't originate.
					{ id: 'winged-disc', label: 'Winged Disc', culturalOrigin: 'khaltiris' },
				],
			},
			craftInvestment: {
				contextWeights: new Map([
					['burial-goods', 1.4],
					['hoard', 1.1],
				]),
				siteTypeWeights: new Map([
					['burial', 1.3],
					['market', 0.9],
				]),
			},
		},
		phase: {
			technology: {
				metallurgy: 0.6,
				ceramics: 0.4,
				textiles: 0.5,
				stoneWorking: 0.4,
				glassWorking: 0.2,
				woodWorking: 0.4,
				boneWorking: 0.6,
			},
			economy: { tradeOpenness: 0.5, surplus: 0.35, urbanisation: 0.2 },
			society: {
				stratification: 0.4,
				militarisation: 0.7,
				religiousEmphasis: 0.4,
				craftSpecialisation: 0.2,
			},
			aesthetics: { decorativeEmphasis: 0.4, motifComplexity: 0.35, formConservatism: 0.5 },
		},
		// Animal materials abundant, minerals poor: the herd supplies bone, antler and hide, while
		// anything smelted or precious has to come up the trade route — and the precious end never
		// does, so a Tarpan artefact is bone-and-leather with the occasional bronze fitting.
		geology: geology('steppe', {
			bronze: 'scarce',
			iron: 'trade-only',
			gold: 'absent',
			silver: 'absent',
			obsidian: 'absent',
			flint: 'available',
			granite: 'scarce',
			jade: 'absent',
			oak: 'available',
			ash: 'available',
			bone: 'abundant',
			antler: 'abundant',
			'fired-clay': 'scarce',
			glass: 'absent',
			linen: 'scarce',
			leather: 'abundant',
		}),
		trade: [{ materialTag: 'metal', direction: 'bidirectional', volume: 0.4 }],
	},
	{
		id: 'thalassar',
		label: 'Thalassar',
		description: 'Maritime-trade palace culture — moderate specialisation, clay and gilded glass.',
		profile: {
			materialAffinities: materialAffinities([
				['clay', 1.7],
				['precious-metal', 1.2],
				['glass', 1.1],
			]),
			techniqueAffinities: new Map([
				['painting', 1.6],
				['relief', 1.3],
				['gilding', 1.1],
			]),
			motifVocabulary: {
				motifs: [
					{ id: 'twin-axe', label: 'Twin Axe', culturalOrigin: 'thalassar' },
					{ id: 'spiral-tide', label: 'Spiral Tide', culturalOrigin: 'thalassar' },
					{ id: 'leaping-herd', label: 'Leaping Herd', culturalOrigin: 'thalassar' },
				],
			},
			craftInvestment: {
				contextWeights: new Map([
					['deliberate-placement', 1.2],
					['casual-discard', 0.6],
				]),
				siteTypeWeights: new Map([
					['shrine', 1.3],
					['settlement', 1.2],
				]),
			},
		},
		phase: {
			technology: {
				metallurgy: 0.55,
				ceramics: 0.85,
				textiles: 0.5,
				stoneWorking: 0.45,
				glassWorking: 0.6,
				woodWorking: 0.4,
				boneWorking: 0.3,
			},
			economy: { tradeOpenness: 0.8, surplus: 0.65, urbanisation: 0.6 },
			society: {
				stratification: 0.6,
				militarisation: 0.2,
				religiousEmphasis: 0.55,
				craftSpecialisation: 0.5,
			},
			aesthetics: { decorativeEmphasis: 0.75, motifComplexity: 0.6, formConservatism: 0.3 },
		},
		// The trade culture: locally it has clay, flax and hides and very little else, but its
		// `tradeOpenness` of 0.8 buys metal, gold and obsidian from three separate flows. The one
		// preset where the trade axis does real work — nothing here is `absent`.
		geology: geology('coast', {
			bronze: 'trade-only',
			iron: 'trade-only',
			gold: 'trade-only',
			silver: 'scarce',
			obsidian: 'trade-only',
			flint: 'scarce',
			granite: 'available',
			jade: 'trade-only',
			oak: 'available',
			ash: 'scarce',
			bone: 'available',
			antler: 'scarce',
			'fired-clay': 'abundant',
			glass: 'scarce',
			linen: 'abundant',
			leather: 'available',
		}),
		trade: [
			{ materialTag: 'precious-metal', direction: 'bidirectional', volume: 0.8 },
			{ materialTag: 'metal', direction: 'bidirectional', volume: 0.6 },
			{
				materialTag: 'stone',
				specificMaterials: ['obsidian'],
				direction: 'a-to-b',
				volume: 0.5,
			},
		],
	},
	{
		id: 'xoconahtl',
		label: 'Xoconahtl',
		description: 'Jungle religious/monumental culture — stone and relief-heavy, votive deposition.',
		profile: {
			materialAffinities: materialAffinities([
				['stone', 1.8],
				['precious-stone', 1.4],
				['clay', 1.0],
			]),
			techniqueAffinities: new Map([
				['relief', 1.7],
				['engraving', 1.4],
				['polish', 1.3],
			]),
			motifVocabulary: {
				motifs: [
					{ id: 'watching-cat', label: 'Watching Cat', culturalOrigin: 'xoconahtl' },
					{ id: 'grain-bearer', label: 'Grain Bearer', culturalOrigin: 'xoconahtl' },
				],
			},
			craftInvestment: {
				contextWeights: new Map([
					['deliberate-placement', 1.5],
					['foundation-deposit', 1.1],
				]),
				siteTypeWeights: new Map([
					['shrine', 1.5],
					['cache', 1.0],
				]),
			},
		},
		phase: {
			technology: {
				metallurgy: 0.3,
				ceramics: 0.6,
				textiles: 0.4,
				stoneWorking: 0.75,
				glassWorking: 0.1,
				woodWorking: 0.5,
				boneWorking: 0.4,
			},
			economy: { tradeOpenness: 0.4, surplus: 0.5, urbanisation: 0.45 },
			society: {
				stratification: 0.6,
				militarisation: 0.3,
				religiousEmphasis: 0.85,
				craftSpecialisation: 0.6,
			},
			aesthetics: { decorativeEmphasis: 0.7, motifComplexity: 0.8, formConservatism: 0.6 },
		},
		// Stone-rich and metal-absent — the mirror of Khaltiris. Obsidian and granite underfoot,
		// jade within reach, but bronze and iron simply do not arrive: the single low-volume flow
		// carries precious metal only, so a monumental culture still works stone by choice and by
		// necessity.
		geology: geology('highland', {
			bronze: 'absent',
			iron: 'absent',
			gold: 'trade-only',
			silver: 'absent',
			obsidian: 'abundant',
			flint: 'scarce',
			granite: 'abundant',
			jade: 'available',
			oak: 'available',
			ash: 'scarce',
			bone: 'available',
			antler: 'scarce',
			'fired-clay': 'abundant',
			glass: 'absent',
			linen: 'available',
			leather: 'scarce',
		}),
		trade: [{ materialTag: 'precious-metal', direction: 'a-to-b', volume: 0.3 }],
	},
	{
		id: 'khaltiris',
		label: 'Khaltiris',
		description: 'Imperial metalworking culture — high specialisation, precious-metal inlay.',
		profile: {
			materialAffinities: materialAffinities([
				['metal', 1.7],
				['precious-metal', 1.4],
				['stone', 1.1],
			]),
			techniqueAffinities: new Map([
				['inlay', 1.6],
				['gilding', 1.5],
				['engraving', 1.3],
			]),
			motifVocabulary: {
				motifs: [
					{ id: 'storm-crown', label: 'Storm Crown', culturalOrigin: 'khaltiris' },
					{ id: 'winged-disc', label: 'Winged Disc', culturalOrigin: 'khaltiris' },
				],
			},
			craftInvestment: {
				contextWeights: new Map([
					['foundation-deposit', 1.4],
					['hoard', 1.0],
				]),
				siteTypeWeights: new Map([
					['fortification', 1.3],
					['settlement', 1.0],
				]),
			},
		},
		phase: {
			technology: {
				metallurgy: 0.9,
				ceramics: 0.5,
				textiles: 0.45,
				stoneWorking: 0.6,
				glassWorking: 0.3,
				woodWorking: 0.4,
				boneWorking: 0.3,
			},
			economy: { tradeOpenness: 0.6, surplus: 0.7, urbanisation: 0.65 },
			society: {
				stratification: 0.85,
				militarisation: 0.6,
				religiousEmphasis: 0.5,
				craftSpecialisation: 0.85,
			},
			aesthetics: { decorativeEmphasis: 0.65, motifComplexity: 0.7, formConservatism: 0.4 },
		},
		// Metal-rich and the mirror of Xoconahtl: bronze and iron abundant, gold scarce rather than
		// absent, and the two things it cannot dig for — jade and glass — arrive by trade. An
		// imperial metalworking culture that has to import its ornament.
		geology: geology('citadel', {
			bronze: 'abundant',
			iron: 'abundant',
			gold: 'scarce',
			silver: 'available',
			obsidian: 'scarce',
			flint: 'scarce',
			granite: 'abundant',
			jade: 'trade-only',
			oak: 'available',
			ash: 'available',
			bone: 'available',
			antler: 'scarce',
			'fired-clay': 'available',
			glass: 'trade-only',
			linen: 'scarce',
			leather: 'available',
		}),
		trade: [
			{ materialTag: 'precious-stone', direction: 'bidirectional', volume: 0.5 },
			{ materialTag: 'glass', direction: 'a-to-b', volume: 0.4 },
		],
	},
];
