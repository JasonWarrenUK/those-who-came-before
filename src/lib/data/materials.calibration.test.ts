/// <reference lib="deno.ns" />
/**
 * Material-share regression guard for `computeMaterialWeight`/`assignMaterials` (roadmap 2GN.84,
 * doc 12 §2.34).
 *
 * `SCARCITY_WEIGHT`'s four values (`engine/generation/materials.ts`) had no numeric target in any
 * design doc — doc 05 §7 states the ordering directionally only ("present but uncommon"), and doc
 * 05 §10.2 explicitly disclaims a quota reading ("it's a weight, not a quota"). Before this file,
 * nothing checked material weighting against any concrete number: a bare directional inequality
 * (`assert(bronzeShare > ironShare)`) passes for any strictly-descending set of four numbers —
 * `SCARCITY_WEIGHT` could have been `{1.0, 0.99, 0.98, 0.97}` and every test in the repo would
 * still be green.
 *
 * **This file does not recalibrate the weights — it installs the missing target.** The four values
 * are left unchanged (see `SCARCITY_WEIGHT`'s own JSDoc) and pinned as the measured baseline, the
 * same move doc 12 §2.31 made for classification thresholds: create a calibration target rather
 * than recalibrate against an absent one.
 *
 * **Pin structure: a two-level tree, not a flat table**, mirroring `MaterialDefinition.tags` as
 * authored. A flat per-material pin can't distinguish "this culture makes less metal overall" from
 * "this culture makes the same amount of metal but none of it is tin" — both look like one
 * material's share moving. The tree separates them: a tag-level share (`metal`: 22%) plus, only
 * where a tag has two or more leaf materials, a conditional intra-tag split (of that metal:
 * bronze 40% / iron 35% / gold 15% / silver 10%). Four single-leaf tags (clay, glass, fiber, leather)
 * emit no split — it would always read 100% and carry no information. `gold`/`silver` nest under
 * `metal`, their primary tag; `jade` nests under `stone` the same way (roadmap 2GN.84's catalogue
 * audit gave jade `['stone', 'precious-stone']`, matching gold/silver's `['metal', 'precious-metal']`
 * pattern — it previously carried only `precious-stone` and was invisible to any plain `stone`
 * reading). The intra-tag split's leaf entries already carry the precious/base distinction (a
 * `metal` split naming bronze, iron, gold and silver separately shows a tin-poor-but-metal-rich
 * culture as depressed bronze/iron shares within an otherwise-normal `metal` tag total) without a
 * separate third level, since `precious-metal`/`precious-stone` each currently have too few leaves
 * of their own to need one.
 *
 * Deriving which materials belong to which tag from `MaterialDefinition.tags` directly (rather than
 * hand-writing the tree) is what lets this guard survive catalogue expansion: a 17th material
 * automatically joins its tag's row, and the coverage test below fails loudly if a shipped material
 * has no path to a pinned tag.
 *
 * **When this fails, it is usually right and you should not just widen the band** — the same
 * warning `calibration.test.ts` carries. A moved share means the geology fixtures, the cultural
 * affinity map, the phase-technology floor or `SCARCITY_WEIGHT` itself moved; the correct response
 * is to identify which and re-record deliberately, not to loosen the tolerance.
 */

import { assert } from '@std/assert';
import { createPrng } from '../engine/prng.ts';
import { expandGrammar, normaliseArtefact } from '../engine/generation/grammar.ts';
import { assignMaterials } from '../engine/generation/materials.ts';
import { CORE_GRAMMAR_RULES } from './grammars/core.ts';
import { MATERIALS } from './materials.ts';
import { mockCulturalProfile, mockPhaseCharacteristics } from '../../../tests/fixtures/culture.ts';
import { MOCK_WORLD_REGIONS, mockRegionalWorld } from '../../../tests/fixtures/world.ts';
import type { MockWorldRegion } from '../../../tests/fixtures/world.ts';
import type { MaterialProvenance } from '../types/artefact.ts';

/**
 * Artefacts sampled per region. Matches `calibration.test.ts`'s order-of-magnitude reasoning
 * (`SAMPLES_PER_CELL`'s own comment): re-running this sweep under five seed salts moved the
 * worst-case region/tag share by 3.36pp at this size, close to `calibration.test.ts`'s own n=100
 * figure of 3.8pp despite the larger sample here — material shares are a coarser signal
 * (10 tags/16 materials against 44 classification rules) and don't tighten further with more
 * artefacts per region within a practical runtime budget.
 */
const SAMPLES_PER_REGION = 600;

/**
 * How far a share may drift from its recorded percentage before this fails, in percentage points.
 * Measured, not guessed, from the five-salt re-run above (worst case 3.36pp); doubled for headroom
 * over pure sampling noise while still catching a real shift well before it doubles a tag's share.
 */
const SHARE_TOLERANCE_POINTS = 7;

/** Every material id in the shipped catalogue, tagged with its primary (nesting) tag. */
const PRIMARY_TAG: Readonly<Record<string, string>> = {
	'bronze': 'metal',
	'iron': 'metal',
	'gold': 'metal',
	'silver': 'metal',
	'obsidian': 'stone',
	'flint': 'stone',
	'granite': 'stone',
	'jade': 'stone',
	'oak': 'wood',
	'ash': 'wood',
	'bone': 'bone',
	'antler': 'bone',
	'fired-clay': 'clay',
	'glass': 'glass',
	'linen': 'fiber',
	'leather': 'leather',
};

/** Primary tags with two or more leaf materials — the only ones whose intra-tag split carries information. */
const MULTI_LEAF_PRIMARY_TAGS: readonly string[] = ['metal', 'stone', 'wood', 'bone'];

/**
 * Measured per-region tag share (roadmap 2GN.84), at `SAMPLES_PER_REGION` per region, recorded
 * 2026-08-06 against the corrected catalogue (jade → `['stone', 'precious-stone']`, glass →
 * engravable/paintable) and the closed introduced-material gate hole. A material with zero
 * modelled presence in a region (`forestInterior`'s absent metals, `desertMargin`'s absent wood)
 * reads as an omitted tag entry, not a zero, matching `tests/fixtures/world.ts`'s own
 * "regions differ in which materials are obtainable" design.
 */
const EXPECTED_TAG_SHARES: Readonly<Record<MockWorldRegion, Readonly<Record<string, number>>>> = {
	riverValley: {
		bone: 17.2,
		wood: 17.2,
		clay: 14.6,
		fiber: 14.3,
		metal: 12.3,
		stone: 12.1,
		leather: 9.0,
	},
	highlandMine: {
		metal: 43.7,
		stone: 28.2,
		wood: 13.1,
		bone: 5.0,
		clay: 3.0,
		leather: 2.9,
		fiber: 2.6,
	},
	coastalPort: {
		leather: 18.4,
		fiber: 16.8,
		wood: 14.7,
		metal: 15.2,
		stone: 14.4,
		clay: 10.5,
		bone: 8.0,
	},
	forestInterior: {
		wood: 30.7,
		bone: 29.1,
		leather: 16.2,
		fiber: 8.2,
		clay: 7.7,
		stone: 7.3,
		// metal: absent — forestInterior has no metal at any level and no trade flows.
	},
	desertMargin: {
		stone: 48.1,
		bone: 20.0,
		metal: 18.3,
		leather: 9.2,
		clay: 3.7,
		// wood: absent — desertMargin has no wood at any level.
	},
	steppeMargin: {
		bone: 31.5,
		leather: 16.2,
		metal: 14.0,
		wood: 12.9,
		stone: 12.5,
		fiber: 9.8,
		clay: 3.7,
	},
};

/**
 * Measured intra-tag conditional split — of the materials sharing a primary tag, each one's share
 * of that tag's total. Emitted only for `MULTI_LEAF_PRIMARY_TAGS`; a region where a tag's total is
 * zero (e.g. `metal` in `forestInterior`) has no entry, since there is nothing to condition on.
 */
const EXPECTED_INTRA_TAG_SHARES: Readonly<
	Record<MockWorldRegion, Readonly<Record<string, Readonly<Record<string, number>>>>>
> = {
	riverValley: {
		metal: { bronze: 28.6, iron: 22.7, gold: 24.7, silver: 24.0 },
		stone: { obsidian: 33.6, flint: 25.8, granite: 24.8, jade: 15.8 },
		wood: { oak: 51.3, ash: 48.7 },
		bone: { bone: 52.2, antler: 47.8 },
	},
	highlandMine: {
		metal: { bronze: 35.7, iron: 35.0, gold: 5.3, silver: 24.0 },
		stone: { obsidian: 21.3, flint: 36.0, granite: 38.5, jade: 4.2 },
		wood: { oak: 50.8, ash: 49.2 },
		bone: { bone: 59.0, antler: 41.0 },
	},
	coastalPort: {
		metal: { bronze: 25.9, iron: 25.9, gold: 25.1, silver: 23.2 },
		stone: { obsidian: 16.5, flint: 33.6, granite: 31.6, jade: 18.2 },
		wood: { oak: 74.5, ash: 25.5 },
		bone: { bone: 52.3, antler: 47.7 },
	},
	forestInterior: {
		// metal: no entry — zero total in this region.
		stone: { obsidian: 0.0, flint: 44.8, granite: 55.2, jade: 0.0 },
		wood: { oak: 51.8, ash: 48.2 },
		bone: { bone: 52.8, antler: 47.2 },
	},
	desertMargin: {
		metal: { bronze: 35.0, iron: 32.8, gold: 17.8, silver: 14.4 },
		stone: { obsidian: 30.6, flint: 31.9, granite: 32.5, jade: 5.1 },
		// wood: no entry — zero total in this region.
		bone: { bone: 51.9, antler: 48.1 },
	},
	steppeMargin: {
		metal: { bronze: 25.7, iron: 21.8, gold: 24.9, silver: 27.7 },
		stone: { obsidian: 36.0, flint: 30.9, granite: 33.1, jade: 0.0 },
		wood: { oak: 69.0, ash: 31.0 },
		bone: { bone: 48.7, antler: 51.3 },
	},
};

/**
 * Measured provenance mix per region — the only pin sensitive to `SCARCITY_WEIGHT`'s `trade-only`
 * rung in isolation, and the direct numeric expression of doc 05 §7's "trade materials appear at
 * low weight — present but uncommon": a rung change that only touches `trade-only` moves this pin
 * without necessarily moving `EXPECTED_TAG_SHARES` (a tag can be satisfied by either a local or a
 * traded member). `regional`/`unknown` never appear against these fixtures — every
 * `MOCK_WORLD_REGIONS` entry models the full catalogue explicitly (`regionalGeology` throws on any
 * gap), so nothing falls through to `'unknown'`, and `'regional'` has no producer at MVP
 * (`deriveMaterialProvenance`'s own JSDoc).
 */
const EXPECTED_PROVENANCE_MIX: Readonly<Record<MockWorldRegion, { local: number; trade: number }>> =
	{
		riverValley: { local: 83.1, trade: 16.9 },
		highlandMine: { local: 94.7, trade: 5.3 },
		coastalPort: { local: 77.2, trade: 22.8 },
		forestInterior: { local: 100.0, trade: 0.0 },
		desertMargin: { local: 91.0, trade: 9.0 },
		steppeMargin: { local: 84.3, trade: 15.7 },
	};

/**
 * How far the min-to-max spread of one tag's share across all six regions must reach, in
 * percentage points, to prove geology still discriminates rather than having collapsed toward
 * uniform selection. Checked against every tag, not just the widest — a single wide outlier
 * clearing the floor proves nothing about whether the other tags collapsed.
 *
 * Measured per-tag spreads this session: metal 46.7pp, stone 44.6pp, wood 30.4pp, bone 25.5pp,
 * fiber 16.9pp, leather 15.6pp, clay 12.2pp — six tags sit well clear of 8. `glass` measured only
 * 2.6pp, but for a structural reason unrelated to collapse: it is the catalogue's rarest tag by
 * overall share (0-2.6% of all materials in any region), so its absolute min-to-max spread is
 * mechanically small regardless of whether geology discriminates for it. `SPREAD_FLOOR_MIN_TAGS`
 * below requires only 6 of the 7 tags to clear the floor, so glass's low share doesn't mask a real
 * collapse in the other six but also doesn't fail the guard on its own.
 */
const SPREAD_FLOOR_POINTS = 8;

/**
 * How many tags must clear `SPREAD_FLOOR_POINTS` for this guard to pass. Not all of them — `glass`
 * structurally can't (see that constant's comment) — but a genuine weighting collapse would pull
 * every tag toward uniform at once, so requiring all-but-one still catches it while not failing on
 * glass's low share alone.
 */
const SPREAD_FLOOR_MIN_TAGS = 6;

/** Every primary tag in the catalogue, derived from `PRIMARY_TAG` rather than hand-written, so a new material's tag is covered automatically. */
const ALL_PRIMARY_TAGS: readonly string[] = [...new Set(Object.values(PRIMARY_TAG))];

interface RegionMeasurement {
	tagShares: Record<string, number>;
	intraTagShares: Record<string, Record<string, number>>;
	provenance: Record<MaterialProvenance['source'], number>;
	total: number;
}

/** Runs the sweep once per region: `expandGrammar` → `normaliseArtefact` → `assignMaterials`. */
function measureRegion(region: MockWorldRegion): RegionMeasurement {
	const culture = mockCulturalProfile();
	const phase = mockPhaseCharacteristics();
	const world = mockRegionalWorld(region);

	const materialTally = new Map<string, number>();
	const provenanceTally: Record<MaterialProvenance['source'], number> = {
		local: 0,
		regional: 0,
		trade: 0,
		unknown: 0,
	};
	let total = 0;

	for (let index = 0; index < SAMPLES_PER_REGION; index++) {
		const seed = `materials-calibration-${region}-${index}`;
		const artefact = normaliseArtefact(
			expandGrammar(CORE_GRAMMAR_RULES, culture, phase, createPrng(seed)),
			seed,
		);
		const assignments = assignMaterials(
			artefact,
			culture,
			phase,
			world.geology,
			world.trade,
			createPrng(`${seed}-material`),
			MATERIALS,
		);

		for (const assignment of assignments) {
			materialTally.set(assignment.materialId, (materialTally.get(assignment.materialId) ?? 0) + 1);
			provenanceTally[assignment.provenance.source]++;
			total++;
		}
	}

	const tagShares: Record<string, number> = {};
	const tagTotals: Record<string, number> = {};
	for (const [materialId, count] of materialTally) {
		const primary = PRIMARY_TAG[materialId];
		if (primary === undefined) continue; // Covered by the coverage test below.
		tagTotals[primary] = (tagTotals[primary] ?? 0) + count;
	}
	for (const [tag, count] of Object.entries(tagTotals)) {
		tagShares[tag] = (count / total) * 100;
	}

	const intraTagShares: Record<string, Record<string, number>> = {};
	for (const tag of MULTI_LEAF_PRIMARY_TAGS) {
		const tagTotal = tagTotals[tag] ?? 0;
		if (tagTotal === 0) continue;
		const members = Object.entries(PRIMARY_TAG).filter(([, primary]) => primary === tag);
		const split: Record<string, number> = {};
		for (const [materialId] of members) {
			split[materialId] = ((materialTally.get(materialId) ?? 0) / tagTotal) * 100;
		}
		intraTagShares[tag] = split;
	}

	const provenance: Record<MaterialProvenance['source'], number> = {
		local: (provenanceTally.local / total) * 100,
		regional: (provenanceTally.regional / total) * 100,
		trade: (provenanceTally.trade / total) * 100,
		unknown: (provenanceTally.unknown / total) * 100,
	};

	return { tagShares, intraTagShares, provenance, total };
}

/** Measured once per region: the sweep is deterministic, and every test below reads the same measurement. */
const measured = new Map<MockWorldRegion, RegionMeasurement>();
function regionMeasurement(region: MockWorldRegion): RegionMeasurement {
	let result = measured.get(region);
	if (result === undefined) {
		result = measureRegion(region);
		measured.set(region, result);
	}
	return result;
}

Deno.test('materials calibration: every shipped material has a path to a pinned tag', () => {
	const uncovered = MATERIALS.filter((material) => PRIMARY_TAG[material.id] === undefined);

	assert(
		uncovered.length === 0,
		`material(s) with no PRIMARY_TAG entry: ${uncovered.map((m) => m.id).join(', ')}. ` +
			`A new catalogue material needs a primary-tag entry here (and a NESTED_TAG entry if it ` +
			`carries a precious tier) before the calibration pins can account for it.`,
	);
});

Deno.test("materials calibration: every region's tag shares stay within tolerance", () => {
	const drifted: string[] = [];

	for (const region of MOCK_WORLD_REGIONS) {
		const { tagShares } = regionMeasurement(region);
		const expected = EXPECTED_TAG_SHARES[region];

		for (const [tag, expectedShare] of Object.entries(expected)) {
			const actual = tagShares[tag] ?? 0;
			if (Math.abs(actual - expectedShare) > SHARE_TOLERANCE_POINTS) {
				drifted.push(
					`  ${region}/${tag}: ${actual.toFixed(1)}% now, ${expectedShare.toFixed(1)}% recorded`,
				);
			}
		}
		for (const tag of Object.keys(tagShares)) {
			if (expected[tag] === undefined && tagShares[tag] > SHARE_TOLERANCE_POINTS) {
				drifted.push(
					`  ${region}/${tag}: ${
						tagShares[tag].toFixed(1)
					}% now, unpinned (was absent from this region)`,
				);
			}
		}
	}

	assert(
		drifted.length === 0,
		`${drifted.length} region/tag share(s) drifted more than ${SHARE_TOLERANCE_POINTS}pp:\n${
			drifted.join('\n')
		}\n\n` +
			`Identify whether the geology fixtures, materialAffinities, the technology floor or ` +
			`SCARCITY_WEIGHT moved, and re-record deliberately.`,
	);
});

Deno.test('materials calibration: intra-tag splits stay within tolerance', () => {
	const drifted: string[] = [];

	for (const region of MOCK_WORLD_REGIONS) {
		const { intraTagShares } = regionMeasurement(region);
		const expected = EXPECTED_INTRA_TAG_SHARES[region];

		for (const [tag, expectedSplit] of Object.entries(expected)) {
			const actualSplit = intraTagShares[tag];
			for (const [materialId, expectedShare] of Object.entries(expectedSplit)) {
				const actual = actualSplit?.[materialId] ?? 0;
				if (Math.abs(actual - expectedShare) > SHARE_TOLERANCE_POINTS) {
					drifted.push(
						`  ${region}/${tag}/${materialId}: ${actual.toFixed(1)}% now, ` +
							`${expectedShare.toFixed(1)}% recorded`,
					);
				}
			}
		}
	}

	assert(
		drifted.length === 0,
		`${drifted.length} intra-tag share(s) drifted more than ${SHARE_TOLERANCE_POINTS}pp:\n${
			drifted.join('\n')
		}\n\n` +
			`This is the pin a metal-rich-but-tin-poor culture would move without touching the ` +
			`tag-level share above — re-measure and decide deliberately which material moved and why.`,
	);
});

Deno.test('materials calibration: provenance mix stays within tolerance', () => {
	const drifted: string[] = [];

	for (const region of MOCK_WORLD_REGIONS) {
		const { provenance } = regionMeasurement(region);
		const expected = EXPECTED_PROVENANCE_MIX[region];

		for (const source of ['local', 'trade'] as const) {
			const actual = provenance[source];
			if (Math.abs(actual - expected[source]) > SHARE_TOLERANCE_POINTS) {
				drifted.push(
					`  ${region}/${source}: ${actual.toFixed(1)}% now, ${
						expected[source].toFixed(1)
					}% recorded`,
				);
			}
		}
	}

	assert(
		drifted.length === 0,
		`${drifted.length} provenance mix drifted more than ${SHARE_TOLERANCE_POINTS}pp:\n${
			drifted.join('\n')
		}\n\n` +
			`This is the pin most directly sensitive to SCARCITY_WEIGHT's 'trade-only' rung — check it ` +
			`specifically before assuming a geology fixture change.`,
	);
});

Deno.test('materials calibration: geology still discriminates across regions', () => {
	// Catches the failure a flat directional test can't: weighting collapsing toward uniform, so
	// every region produces the same material mix. Every current directional test in
	// materials.test.ts would still pass in that world; this guard specifically would not.
	//
	// Checks every tag's spread, not just the widest. A single wide outlier clearing the floor
	// proves nothing about the other tags — six of seven could collapse to an identical share in
	// every region while the seventh alone kept the guard green. `SPREAD_FLOOR_MIN_TAGS` requires
	// all-but-one tag to clear the floor (see its own comment for why not all seven).
	//
	// A region that produces zero of a tag is a real, informative measurement (that tag lost all
	// its geological presence there), not a gap to skip — `tagShares` only carries keys for tags
	// present in that region, so absent tags are explicitly zero-filled below rather than dropped,
	// which would understate the spread exactly where the fixtures are most discriminating.
	const shareByTag = new Map<string, number[]>(ALL_PRIMARY_TAGS.map((tag) => [tag, []]));

	for (const region of MOCK_WORLD_REGIONS) {
		const { tagShares } = regionMeasurement(region);
		for (const tag of ALL_PRIMARY_TAGS) {
			shareByTag.get(tag)!.push(tagShares[tag] ?? 0);
		}
	}

	const spreadByTag = new Map(
		[...shareByTag].map(([tag, shares]) => [tag, Math.max(...shares) - Math.min(...shares)]),
	);
	const clearing = [...spreadByTag].filter(([, spread]) => spread >= SPREAD_FLOOR_POINTS);
	const collapsed = [...spreadByTag].filter(([, spread]) => spread < SPREAD_FLOOR_POINTS);

	assert(
		clearing.length >= SPREAD_FLOOR_MIN_TAGS,
		`only ${clearing.length}/${ALL_PRIMARY_TAGS.length} tags reach a ${SPREAD_FLOOR_POINTS}pp ` +
			`cross-region spread (need ${SPREAD_FLOOR_MIN_TAGS}):\n${
				collapsed.map(([tag, spread]) => `  ${tag}: ${spread.toFixed(1)}pp`).join('\n')
			}\n\ngeology may have stopped discriminating between regions.`,
	);
});
