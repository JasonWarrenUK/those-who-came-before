/**
 * Test fixture for the world seed (doc 08 §5, roadmap task 1FD.35).
 *
 * Consumed as a named import with an explicit `.ts` extension, matching the convention set by
 * `src/lib/engine/prng.test.ts` (e.g. `import { mockWorldSeed } from '../../../tests/fixtures/world.ts'`).
 * Culture and artefact fixtures live alongside this one in `tests/fixtures/culture.ts` and
 * `tests/fixtures/artefact.ts` — split per-domain to mirror the `src/lib/types/` layout.
 */

import { createPrng } from '../../src/lib/engine/prng.ts';
import type {
	AvailabilityLevel,
	GeologicalContext,
	MaterialFlow,
	RegionalAvailability,
	WorldSeed,
} from '../../src/lib/types/world.ts';

/**
 * Builds a mock `WorldSeed`: a raw seed string plus its deterministic PRNG (doc 05 §2).
 *
 * @param raw - Seed string. Defaults to a fixed value so callers get determinism for free.
 */
export function mockWorldSeed(raw = 'test-seed'): WorldSeed {
	return { raw, prng: createPrng(raw) };
}

/**
 * Builds a mock `GeologicalContext` (doc 05 §3.6, roadmap 2GN.23) spanning every `AvailabilityLevel`
 * across a couple of named regions, for `isAvailable`/`computeMaterialWeight` tests
 * (`engine/generation/materials.ts`): `bronze` abundant, `iron` scarce, `gold` trade-only, `flint`
 * absent everywhere. Materials not listed here are absent from the map entirely — deliberately, to
 * exercise `isAvailable`'s "not modelled → obtainable" MVP lenience.
 *
 * Overrides replace the whole `materialAvailability` map (a `Map`, per the `mockCulturalProfile`
 * convention) rather than deep-merging.
 *
 * @param overrides - Partial `GeologicalContext` merged shallowly over the defaults.
 */
export function mockGeologicalContext(
	overrides: Partial<GeologicalContext> = {},
): GeologicalContext {
	function regional(materialId: string, level: AvailabilityLevel): RegionalAvailability {
		return { materialId, regions: new Map([['test-region', level]]) };
	}

	const defaults: GeologicalContext = {
		materialAvailability: new Map([
			['bronze', regional('bronze', 'abundant')],
			['iron', regional('iron', 'scarce')],
			['gold', regional('gold', 'trade-only')],
			['flint', regional('flint', 'absent')],
		]),
	};

	return { ...defaults, ...overrides };
}

/**
 * Builds a mock `MaterialFlow` (doc 05 §3.4, roadmap 2GN.23): a bidirectional metal flow, for
 * `isAvailable`'s trade-reachability check (`engine/generation/materials.ts`).
 *
 * @param overrides - Partial `MaterialFlow` merged shallowly over the defaults.
 */
export function mockMaterialFlow(overrides: Partial<MaterialFlow> = {}): MaterialFlow {
	const defaults: MaterialFlow = {
		materialTag: 'metal',
		direction: 'bidirectional',
		volume: 0.5,
	};

	return { ...defaults, ...overrides };
}

// --- Named regional worlds (roadmap 2GN.79) ------------------------------------------------------
//
// `mockGeologicalContext` above models only 4 of the catalogue's 16 materials, so the other twelve
// fall through `isAvailable`'s "unmodelled → obtainable" lenience at full weight. That lenience is
// deliberate and still worth covering, so that fixture is left untouched; these six model every
// material explicitly, and are what the samplers and the measured classification thresholds run
// against (doc 12 §2.25).
//
// Each is an internally coherent place rather than a constructed axis position: coverage of
// `isAvailable`'s branches emerges from the regions rather than being designed into them. Between
// them they exercise every `AvailabilityLevel`, both exclusion paths (`absent` in `desertMargin`;
// trade-only-with-no-matching-flow in `forestInterior`, `desertMargin` and `steppeMargin`) and the
// full span of trade reach (five flows in `coastalPort`, none at all in `forestInterior`).

/** The six named regional worlds these fixtures model. */
export type MockWorldRegion =
	| 'riverValley'
	| 'highlandMine'
	| 'coastalPort'
	| 'forestInterior'
	| 'desertMargin'
	| 'steppeMargin';

/** A geology paired with the trade flows that make its `trade-only` entries reachable (or not). */
export interface MockRegionalWorld {
	/** Which region this models. */
	region: MockWorldRegion;
	/** One-line description of the place, for sampler output and test failure messages. */
	summary: string;
	/** Every catalogue material's availability, explicitly modelled. */
	geology: GeologicalContext;
	/** Flows reaching this region — deliberately empty for `forestInterior`. */
	trade: readonly MaterialFlow[];
}

/** Every material id in the shipped catalogue (`src/lib/data/materials.ts`). */
const CATALOGUE_MATERIAL_IDS = [
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
 * Builds a `GeologicalContext` from a level→material-ids mapping, in one named region. Throws if
 * the mapping doesn't cover the catalogue exactly — a mistyped or forgotten material would
 * otherwise silently fall back through `isAvailable`'s unmodelled lenience, which is precisely the
 * defect these fixtures exist to remove.
 */
function regionalGeology(
	regionName: string,
	byLevel: Partial<Record<AvailabilityLevel, readonly string[]>>,
): GeologicalContext {
	const materialAvailability = new Map<string, RegionalAvailability>();

	for (const [level, materialIds] of Object.entries(byLevel)) {
		for (const materialId of materialIds ?? []) {
			if (materialAvailability.has(materialId)) {
				throw new Error(`${regionName}: ${materialId} listed at more than one level`);
			}
			materialAvailability.set(materialId, {
				materialId,
				regions: new Map([[regionName, level as AvailabilityLevel]]),
			});
		}
	}

	const missing = CATALOGUE_MATERIAL_IDS.filter((id) => !materialAvailability.has(id));
	if (missing.length > 0) {
		throw new Error(`${regionName}: unmodelled material(s) ${missing.join(', ')}`);
	}
	const extra = [...materialAvailability.keys()].filter(
		(id) => !(CATALOGUE_MATERIAL_IDS as readonly string[]).includes(id),
	);
	if (extra.length > 0) {
		throw new Error(`${regionName}: unknown material(s) ${extra.join(', ')}`);
	}

	return { materialAvailability };
}

/**
 * The six worlds, keyed by region. Built eagerly at module load so the `regionalGeology` catalogue
 * completeness check fails loudly on import rather than at first use.
 */
const REGIONAL_WORLDS: Record<MockWorldRegion, MockRegionalWorld> = {
	/**
	 * Alluvial floodplain: clay and reed everywhere, no local stone quarry and no ore at all. Every
	 * metal object is an import. The pottery-led inverse of `highlandMine`.
	 */
	riverValley: {
		region: 'riverValley',
		summary: 'alluvial floodplain — clay and reed abundant, every metal imported',
		geology: regionalGeology('river-valley', {
			abundant: ['fired-clay', 'linen'],
			available: ['oak', 'ash', 'bone', 'antler', 'leather'],
			scarce: ['flint', 'granite', 'obsidian'],
			'trade-only': ['bronze', 'iron', 'silver', 'gold', 'jade', 'glass'],
		}),
		trade: [
			mockMaterialFlow({ materialTag: 'metal' }),
			mockMaterialFlow({
				materialTag: 'precious-metal',
				specificMaterials: ['gold'],
				volume: 0.3,
			}),
			mockMaterialFlow({
				materialTag: 'precious-stone',
				specificMaterials: ['jade'],
				volume: 0.3,
			}),
			mockMaterialFlow({ materialTag: 'glass', volume: 0.3 }),
		],
	},

	/**
	 * Ore-rich uplands: copper, tin and iron worked locally alongside abundant building stone, but
	 * poor in clay and fibre. A metalworking culture that imports its pottery. Gold stays trade-only
	 * — an ore region is not automatically a gold region.
	 */
	highlandMine: {
		region: 'highlandMine',
		summary: 'ore-rich uplands — metal and stone abundant, organics and pottery scarce',
		geology: regionalGeology('highland-mine', {
			abundant: ['bronze', 'iron', 'granite', 'flint'],
			available: ['silver', 'obsidian', 'oak', 'ash'],
			scarce: ['bone', 'antler', 'leather', 'linen', 'fired-clay'],
			'trade-only': ['gold', 'jade', 'glass'],
		}),
		trade: [
			mockMaterialFlow({ materialTag: 'precious-metal', volume: 0.4 }),
			mockMaterialFlow({
				materialTag: 'precious-stone',
				specificMaterials: ['jade'],
				volume: 0.3,
			}),
			mockMaterialFlow({ materialTag: 'glass', volume: 0.3 }),
		],
	},

	/**
	 * A port with little worth digging up and exceptional reach: seven of sixteen materials exist
	 * here only because trade brings them. The most materially varied of the six, and so the usual
	 * choice when a sampler run wants to show the widest spread.
	 */
	coastalPort: {
		region: 'coastalPort',
		summary: 'trading port — poor locally, rich by trade; 7 materials arrive only by flow',
		geology: regionalGeology('coastal-port', {
			abundant: ['linen', 'leather'],
			available: ['fired-clay', 'oak'],
			scarce: ['granite', 'flint', 'bone', 'antler', 'ash'],
			'trade-only': ['bronze', 'iron', 'silver', 'gold', 'obsidian', 'jade', 'glass'],
		}),
		trade: [
			mockMaterialFlow({ materialTag: 'metal', volume: 0.8 }),
			mockMaterialFlow({ materialTag: 'precious-metal', volume: 0.6 }),
			mockMaterialFlow({ materialTag: 'stone', volume: 0.6 }),
			mockMaterialFlow({ materialTag: 'precious-stone', volume: 0.5 }),
			mockMaterialFlow({ materialTag: 'glass', volume: 0.5 }),
		],
	},

	/**
	 * Deep forest, unconnected: wood, bone, antler and hide are everything. Metals and luxuries sit
	 * at `trade-only` against an empty flow array, so they're excluded through
	 * `isAvailable`'s trade-only-without-matching-flow branch rather than through `absent` — the
	 * same seven exclusions as marking them absent, reached by the path no other world covers.
	 */
	forestInterior: {
		region: 'forestInterior',
		summary: 'isolated forest — organics abundant, no trade at all; 7 materials unreachable',
		geology: regionalGeology('forest-interior', {
			abundant: ['oak', 'ash', 'bone', 'antler', 'leather'],
			available: ['linen', 'fired-clay'],
			scarce: ['flint', 'granite'],
			'trade-only': ['bronze', 'iron', 'silver', 'gold', 'obsidian', 'jade', 'glass'],
		}),
		trade: [], // Deliberately empty: nothing trade-only is reachable here.
	},

	/**
	 * Volcanic desert margin: obsidian and stone abundant, herds supply bone and hide, but no
	 * forest and no flax — `oak`, `ash` and `linen` are `absent`, putting the `wood` and `fiber`
	 * tags out of reach entirely. `glass` is trade-only with no flow supplying it, so it is
	 * excluded too.
	 */
	desertMargin: {
		region: 'desertMargin',
		summary: 'volcanic desert margin — stone abundant, wood and fibre absent',
		geology: regionalGeology('desert-margin', {
			abundant: ['obsidian', 'flint', 'granite'],
			available: ['leather', 'bone', 'antler'],
			scarce: ['fired-clay', 'bronze', 'iron'],
			'trade-only': ['silver', 'gold', 'jade', 'glass'],
			absent: ['oak', 'ash', 'linen'],
		}),
		trade: [
			mockMaterialFlow({ materialTag: 'precious-metal', volume: 0.4 }),
			mockMaterialFlow({
				materialTag: 'precious-stone',
				specificMaterials: ['jade'],
				volume: 0.3,
			}),
		],
	},

	/**
	 * Mobile pastoralists: herds supply hide, bone and antler in quantity, little else is worth
	 * carrying. Metals arrive across long distance at low volume, so they're reachable but weighted
	 * at `trade-only`'s 0.15. `jade` and `glass` have no supplying flow and are excluded.
	 */
	steppeMargin: {
		region: 'steppeMargin',
		summary: 'steppe pastoralists — hide and bone abundant, metals by long-distance trade',
		geology: regionalGeology('steppe-margin', {
			abundant: ['leather', 'bone', 'antler'],
			available: ['linen', 'oak'],
			scarce: ['ash', 'fired-clay', 'flint', 'granite', 'obsidian'],
			'trade-only': ['bronze', 'iron', 'silver', 'gold', 'jade', 'glass'],
		}),
		trade: [
			mockMaterialFlow({ materialTag: 'metal', volume: 0.3 }),
			mockMaterialFlow({ materialTag: 'precious-metal', volume: 0.2 }),
		],
	},
};

/** Every region id, in declaration order — for sweeps that must cover all six. */
export const MOCK_WORLD_REGIONS = Object.keys(REGIONAL_WORLDS) as readonly MockWorldRegion[];

/**
 * The named regional world for `region`: a geology modelling every catalogue material explicitly,
 * paired with the trade flows that reach it (roadmap 2GN.79).
 *
 * Unlike `mockGeologicalContext`, nothing here falls through `isAvailable`'s unmodelled lenience —
 * every material's availability is a stated fact about the place. Use these when what's being
 * tested or sampled depends on realistic material distribution; use `mockGeologicalContext` when
 * the lenience path itself is what's under test.
 *
 * **No default region, deliberately.** Which world you generate against changes the material
 * distribution substantially, so it is always a decision worth making explicitly rather than
 * inheriting — a caller that hasn't thought about geology should be made to.
 *
 * @param region - Which of the six worlds to build.
 */
export function mockRegionalWorld(region: MockWorldRegion): MockRegionalWorld {
	return REGIONAL_WORLDS[region];
}

/**
 * Builds a `GeologicalContext` modelling all 16 catalogue materials, for `region` (roadmap 2GN.79).
 * Shorthand for `mockRegionalWorld(region).geology` — the trade flows that make its `trade-only`
 * entries reachable live on the same record, so prefer `mockRegionalWorld` when both are needed.
 *
 * @param region - Which of the six worlds. No default, per `mockRegionalWorld`.
 */
export function mockFullGeologicalContext(region: MockWorldRegion): GeologicalContext {
	return REGIONAL_WORLDS[region].geology;
}
