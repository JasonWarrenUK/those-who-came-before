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
 * emit no split — it would always read 100% and carry no information. `gold`/`silver` sit under
 * `metal` and `jade` under `stone`, which since roadmap 2GN.78 is simply where their single tag puts
 * them: the `precious-metal`/`precious-stone` tags that once gave those three a second membership
 * were retired as social valuation rather than material class (doc 12 §2.40).
 *
 * The two-level shape is unaffected by that retirement, and the reason is worth keeping: the
 * intra-tag split's leaf entries already express what a "precious" tier would have (a `metal` split
 * naming bronze, iron, gold and silver separately shows a tin-poor-but-metal-rich culture as
 * depressed bronze/iron shares within an otherwise-normal `metal` tag total). A third level was
 * never needed, and now there is no candidate for one.
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
import { assignMaterial, assignMaterials } from '../engine/generation/materials.ts';
import { CORE_GRAMMAR_RULES } from './grammars/core.ts';
import { MATERIALS } from './materials.ts';
import { EXPLORER_CULTURES } from './explorer-cultures.ts';
import type { MaterialAffinity } from '../types/world.ts';
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
 * Measured per-region tag share (roadmap 2GN.84), at `SAMPLES_PER_REGION` per region. Originally
 * recorded 2026-08-06 against the then-current catalogue; **re-recorded 2026-08-20 by roadmap
 * 2GN.10**, which gave `NormalisedComponent.allowedMaterialTags` real per-primitive values in
 * place of the all-empty stub every prior measurement ran against (`assignMaterial`'s compatibility
 * filter, doc 05 §7, was a no-op until this task). Deliberate, expected drift, not a fixture or
 * weight change: `metal` gained an allowed path on all eight primitives so its share rose in every
 * region; `leather` is now reachable only via `sheet-form` so it collapsed everywhere it wasn't
 * already low; `forestInterior`'s `stone` intra-tag split shifted because that region's narrower
 * geology now interacts with a narrower candidate pool. Checked against the ruled compatibility
 * table (`PRIMITIVE_MATERIAL_TAGS`, `engine/generation/grammar.ts`) before re-recording, per this
 * file's own "usually right, don't just widen the band" warning. A material with zero modelled
 * presence in a region (`forestInterior`'s absent metals, `desertMargin`'s absent wood) reads as an
 * omitted tag entry, not a zero, matching `tests/fixtures/world.ts`'s own "regions differ in which
 * materials are obtainable" design.
 *
 * **Re-recorded 2026-09-15 by roadmap 2GN.27** (doc 11 §2.9, `docs/spikes/2GN.27-material-standing.md`):
 * `assignMaterials` now draws a per-artefact stratum from `society.stratification` and suppresses
 * every prized candidate (`materialStanding >= STANDING_CUT`) in the commoner majority. With
 * `mockPhaseCharacteristics`' 0.5 stratification, four in five artefacts are commoner, so every
 * material the fixture geology places at scarce or trade-only lost share to the abundant and
 * available ones: `riverValley`'s metal (all four trade-only) fell from 23.1 to 13.3 while wood rose
 * 20.1 → 27.2; `coastalPort`'s metal 30.1 → 14.9 and clay 12.6 → 28.2. `highlandMine`, whose metal is
 * local, moved least. The draw sequence also shifted by one position per artefact (the stratum
 * draw comes first), so every value was refreshed to the same run.
 */
const EXPECTED_TAG_SHARES: Readonly<Record<MockWorldRegion, Readonly<Record<string, number>>>> = {
	riverValley: {
		wood: 27.2,
		bone: 20.9,
		clay: 19.7,
		metal: 13.3,
		stone: 10.7,
		fiber: 6.6,
		leather: 1.3,
		glass: 0.3,
	},
	highlandMine: {
		metal: 60.2,
		stone: 22.9,
		wood: 12.8,
		bone: 2.5,
		clay: 1.0,
		fiber: 0.3,
		glass: 0.2,
		leather: 0.0,
	},
	coastalPort: {
		wood: 29.1,
		clay: 28.2,
		metal: 14.9,
		stone: 10.8,
		fiber: 10.7,
		bone: 3.8,
		leather: 2.3,
		glass: 0.2,
	},
	forestInterior: {
		wood: 36.5,
		bone: 32.0,
		stone: 16.5,
		clay: 9.9,
		fiber: 3.2,
		leather: 1.9,
		// metal: absent — forestInterior has no metal at any level and no trade flows.
	},
	desertMargin: {
		stone: 53.6,
		bone: 27.5,
		metal: 11.4,
		leather: 6.1,
		clay: 1.4,
		// wood: absent — desertMargin has no wood at any level.
	},
	steppeMargin: {
		bone: 42.9,
		wood: 24.9,
		metal: 14.4,
		stone: 8.7,
		fiber: 4.6,
		leather: 2.7,
		clay: 1.9,
	},
};

/**
 * Measured intra-tag conditional split — of the materials sharing a primary tag, each one's share
 * of that tag's total. Emitted only for `MULTI_LEAF_PRIMARY_TAGS`; a region where a tag's total is
 * zero (e.g. `metal` in `forestInterior`) has no entry, since there is nothing to condition on.
 *
 * Re-recorded 2026-08-20 alongside `EXPECTED_TAG_SHARES` (roadmap 2GN.10 — see that constant's
 * comment for why). Only `forestInterior/stone` moved past tolerance (flint/granite split shifted
 * with the narrower candidate pool); every other region's intra-tag split held within noise, values
 * refreshed to the same-run measurement regardless.
 *
 * Re-recorded 2026-09-15 alongside `EXPECTED_TAG_SHARES` (roadmap 2GN.27). The stratum draw's
 * commoner suppression separates a tag's leaves by standing: where one leaf is prized and its
 * sibling is not, the sibling takes the tag. `coastalPort` and `steppeMargin` model ash as scarce
 * beside abundant oak, so oak went 68.5 → 93.6 and 73.7 → 90.1; `desertMargin`'s gold/silver
 * (trade-only) lost to its scarce bronze/iron. Splits whose leaves share a level held within noise.
 */
const EXPECTED_INTRA_TAG_SHARES: Readonly<
	Record<MockWorldRegion, Readonly<Record<string, Readonly<Record<string, number>>>>>
> = {
	riverValley: {
		metal: { bronze: 24.8, iron: 25.7, gold: 26.9, silver: 22.7 },
		stone: { obsidian: 23.3, flint: 27.4, granite: 32.7, jade: 16.5 },
		wood: { oak: 47.9, ash: 52.1 },
		bone: { bone: 53.1, antler: 46.9 },
	},
	highlandMine: {
		metal: { bronze: 37.0, iron: 38.5, gold: 3.2, silver: 21.3 },
		stone: { obsidian: 22.0, flint: 39.3, granite: 35.1, jade: 3.6 },
		wood: { oak: 49.8, ash: 50.2 },
		bone: { bone: 50.0, antler: 50.0 },
	},
	coastalPort: {
		metal: { bronze: 27.7, iron: 25.5, gold: 24.7, silver: 22.2 },
		stone: { obsidian: 16.4, flint: 31.7, granite: 32.1, jade: 19.8 },
		wood: { oak: 93.6, ash: 6.4 },
		bone: { bone: 44.0, antler: 56.0 },
	},
	forestInterior: {
		// metal: no entry — zero total in this region.
		stone: { obsidian: 0.0, flint: 49.4, granite: 50.6, jade: 0.0 },
		wood: { oak: 46.3, ash: 53.7 },
		bone: { bone: 47.3, antler: 52.7 },
	},
	desertMargin: {
		metal: { bronze: 31.3, iron: 31.6, gold: 18.9, silver: 18.2 },
		stone: { obsidian: 33.7, flint: 33.0, granite: 32.1, jade: 1.2 },
		// wood: no entry — zero total in this region.
		bone: { bone: 51.7, antler: 48.3 },
	},
	steppeMargin: {
		metal: { bronze: 24.9, iron: 26.5, gold: 23.2, silver: 25.4 },
		stone: { obsidian: 34.9, flint: 29.3, granite: 35.8, jade: 0.0 },
		wood: { oak: 90.1, ash: 9.9 },
		bone: { bone: 55.3, antler: 44.7 },
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
// Re-recorded 2026-08-20 alongside EXPECTED_TAG_SHARES (roadmap 2GN.10 — see that constant's
// comment). More components now filter down to a narrower compatible set before availability is
// checked, shifting how often a local-scarce/trade-reachable material is the only compatible
// option left — the direct mechanism this pin measures.
//
// Re-recorded 2026-09-15 alongside EXPECTED_TAG_SHARES (roadmap 2GN.27). Every trade-only material
// is prized at `mockPhaseCharacteristics`' 0.5 trade openness, so the stratum draw's commoner
// suppression roughly halved the traded share everywhere a local alternative existed.
const EXPECTED_PROVENANCE_MIX: Readonly<Record<MockWorldRegion, { local: number; trade: number }>> =
	{
		riverValley: { local: 84.6, trade: 15.4 },
		highlandMine: { local: 97.0, trade: 3.0 },
		coastalPort: { local: 80.9, trade: 19.1 },
		forestInterior: { local: 100.0, trade: 0.0 },
		desertMargin: { local: 95.1, trade: 4.9 },
		steppeMargin: { local: 85.6, trade: 14.4 },
	};

/**
 * How far the min-to-max spread of one tag's share across all six regions must reach, in
 * percentage points, to prove geology still discriminates rather than having collapsed toward
 * uniform selection. Checked against every tag, not just the widest — a single wide outlier
 * clearing the floor proves nothing about whether the other tags collapsed.
 *
 * Measured per-tag spreads after roadmap 2GN.10 (2026-08-20, re-measured alongside
 * `EXPECTED_TAG_SHARES`): metal 57.8pp, wood 36.7pp, bone 28.2pp, stone 28.1pp, clay 12.2pp sit
 * well clear of 8. `glass` (1.1pp), `fiber` (6.6pp) and `leather` (2.1pp) do not, but for a shared
 * structural reason unrelated to a geology collapse: `PRIMITIVE_MATERIAL_TAGS`
 * (`engine/generation/grammar.ts`) now gates each tag's reachability by which component *shapes*
 * can carry it before geology ever gets a say — `leather` only on `sheet-form` (1 of 8
 * primitives), `fiber` on 3 of 8, `glass` still the catalogue's rarest tag by overall share as
 * before. All three are shape-bottlenecked roughly equally in every region, so their cross-region
 * spread stays low regardless of whether the underlying geology fixtures still discriminate for
 * them — the same mechanism `glass` already had, now shared by two more tags now that
 * `allowedMaterialTags` is real instead of the all-permissive `[]` stub every prior measurement of
 * this guard ran against. `SPREAD_FLOOR_MIN_TAGS` below requires only 5 of the 8 tags to clear the
 * floor, so this doesn't mask a real collapse in the five that aren't shape-bottlenecked, but also
 * doesn't fail the guard on a structural narrowness this task deliberately ruled.
 */
const SPREAD_FLOOR_POINTS = 8;

/**
 * How many tags must clear `SPREAD_FLOOR_POINTS` for this guard to pass. Not all of them — three
 * (`glass`, `fiber`, `leather`) are shape-bottlenecked rather than geology-driven, see that
 * constant's comment — but a genuine weighting collapse would pull every tag toward uniform at
 * once, so requiring all-but-three still catches it while not failing on the shape bottleneck
 * alone.
 */
const SPREAD_FLOOR_MIN_TAGS = 5;

/** Every primary tag in the catalogue, derived from `PRIMARY_TAG` rather than hand-written, so a new material's tag is covered automatically. */
const ALL_PRIMARY_TAGS: readonly string[] = [...new Set(Object.values(PRIMARY_TAG))];

/**
 * Artefacts sampled per affinity configuration in the preset guard below. Smaller than
 * `SAMPLES_PER_REGION` because that guard compares three runs over an *identical* seed sequence:
 * the paired design cancels sampling noise rather than averaging it away, so the run size only has
 * to be large enough to accumulate a stable count of metal assignments.
 */
const PRESET_AFFINITY_SAMPLES = 600;

/**
 * The minimum share shift a per-material affinity must produce to count as overriding its class
 * entry. Sits well below the measured signal while staying far above paired-seed variation — and
 * under a `max` reduction the shift is 0pp by construction, since the class entry wins outright.
 */
const PRESET_AFFINITY_MIN_SHIFT = 8;

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
			`A new catalogue material needs a PRIMARY_TAG entry here, plus a row in ` +
			`EXPECTED_TAG_SHARES (and EXPECTED_INTRA_TAG_SHARES if its tag is in ` +
			`MULTI_LEAF_PRIMARY_TAGS), before the calibration pins can account for it.`,
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
	// proves nothing about the other tags — several could collapse to an identical share in every
	// region while one alone kept the guard green. `SPREAD_FLOOR_MIN_TAGS` requires 5 of the 8 tags
	// to clear the floor, leaving room for the three shape-bottlenecked tags (see its own comment).
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

/**
 * Per-material affinity reaches material selection, measured on the shipped Explorer presets
 * (roadmap 2GN.123).
 *
 * **This closes a real coverage gap rather than adding a redundant pin.** Every other guard in this
 * file — and every pin in `calibration.test.ts` — samples `mockCulturalProfile()` against
 * `mockRegionalWorld` cells. None of them reads `EXPLORER_CULTURES` at all, so the four shipped
 * presets' authored affinities were entirely unmeasured: restoring Thalassar's gold and silver
 * entries moved its gold share from 24.9% to 26.1% of metal and its silver from 34.3% to 37.7%, and
 * the whole suite stayed green. The one existing test that does read the presets asserts only that
 * each produces a non-empty report.
 *
 * **Paired seeds, not a pinned share.** The obvious guard — record Thalassar's gold+silver share and
 * assert it holds — was measured and rejected: across five seed salts at n=400 the restored culture
 * reads 58.2–66.1% and the unrestored one 51.0–60.6%, ranges that overlap. A single pinned number
 * could not tell the two apart without a tolerance so tight it would flake. Holding the seed
 * sequence fixed and varying only the affinity entries removes that noise entirely, because every
 * other draw is identical between the three runs.
 *
 * What this pins is the *mechanism and its direction*, which is what the 2GN.110 ruling actually
 * claims: a specific entry moves selection, and moves it both ways. The absolute shares stay
 * deliberately unpinned — they are a function of geology, scarcity and grammar as much as affinity,
 * and this file's other guards already cover those.
 */
Deno.test('materials calibration: a per-material affinity moves selection on a shipped preset', () => {
	const thalassar = EXPLORER_CULTURES.find((preset) => preset.id === 'thalassar');
	if (thalassar === undefined) throw new Error("explorer preset 'thalassar' not found");

	/**
	 * Gold and silver as a percentage of all metal assigned, over a fixed seed sequence.
	 *
	 * Drawn per component through `assignMaterial` with no stratum, not through `assignMaterials`:
	 * this guard tests the affinity *resolver*, and the stratum draw (roadmap 2GN.27) would confound
	 * it. Prizing a material concentrates it in the elite minority and suppresses it everywhere
	 * else, so under `assignMaterials` the shipped `{ id: 'gold' }` entry *lowers* gold's whole-record
	 * share (measured 35.2% against 46.4% with class entries alone) while raising it within elite
	 * artefacts. That is the intended world (`docs/spikes/2GN.27-material-standing.md`, "The
	 * ruling"), and not what this guard asks. The unmodulated draw reproduces the pre-2GN.27
	 * sequence exactly, so the margins below are the ones originally measured.
	 */
	const prizedShareOfMetal = (affinities: readonly MaterialAffinity[]): number => {
		const profile = { ...thalassar.profile, materialAffinities: affinities };
		let prized = 0;
		let metal = 0;

		for (let index = 0; index < PRESET_AFFINITY_SAMPLES; index++) {
			const seed = `preset-affinity-${index}`;
			const artefact = normaliseArtefact(
				expandGrammar(CORE_GRAMMAR_RULES, profile, thalassar.phase, createPrng(seed)),
				seed,
			);
			const prng = createPrng(`${seed}-material`);

			for (const component of artefact.components) {
				const material = assignMaterial(
					component,
					profile,
					thalassar.phase,
					thalassar.geology,
					thalassar.trade,
					prng,
					MATERIALS,
				);
				if (PRIMARY_TAG[material.id] !== 'metal') continue;
				metal++;
				if (material.id === 'gold' || material.id === 'silver') prized++;
			}
		}

		assert(metal > 0, 'no metal was assigned at all — the preset or geology fixtures moved');
		return 100 * prized / metal;
	};

	// The preset as shipped, its class entries alone, and the same culture actively suppressing the
	// two materials. Only the affinity entries differ; the seed sequence is identical throughout.
	//
	// ⚠️ The suppression case carries a `{ tag: 'metal' }: 1.5` entry the shipped preset deliberately
	// omits, and that is load-bearing rather than incidental. Thalassar names gold and silver with no
	// covering class entry, so each material matches exactly one entry — and a `max` reduction over a
	// single match returns that same value. Without a class entry to compete against, most-
	// specific-wins and the retired `max` are indistinguishable, and this guard passes against a
	// resolver rebuilt from `max` (verified by mutation). The exception only means something when
	// there is a rule for it to be an exception *to*.
	const classOnly = thalassar.profile.materialAffinities.filter(
		(entry) => entry.selector.id === undefined,
	);
	const shipped = prizedShareOfMetal(thalassar.profile.materialAffinities);
	const neutral = prizedShareOfMetal(classOnly);
	const suppressed = prizedShareOfMetal([
		...classOnly,
		{ selector: { tag: 'metal' }, weight: 1.5 },
		{ selector: { id: 'gold' }, weight: 0.5 },
		{ selector: { id: 'silver' }, weight: 0.5 },
	]);
	// The same culture with only the class entry, so the suppression comparison isolates the specific
	// entries rather than reading the `metal: 1.5` lift as well.
	const classLifted = prizedShareOfMetal([
		...classOnly,
		{ selector: { tag: 'metal' }, weight: 1.5 },
	]);

	// Thalassar's authored intent: gold and silver at 1.2 with no `metal` entry, so the two rise
	// above their classmates rather than dragging bronze and iron up with them.
	assert(
		shipped > neutral,
		`the shipped { id: 'gold' }/{ id: 'silver' } entries must raise their share: ` +
			`${shipped.toFixed(1)}% shipped vs ${neutral.toFixed(1)}% with class entries alone`,
	);

	// The direction `max` could not express (2GN.84), and the case that actually discriminates
	// between the two reductions: gold and silver at 0.5 *underneath* a `metal: 1.5` class entry.
	// Most-specific-wins reads them at 0.5; `max` reads them at 1.5 and the suppression vanishes.
	assert(
		suppressed < classLifted,
		`a below-neutral specific entry must lower the share even under a higher class entry: ` +
			`${suppressed.toFixed(1)}% suppressed vs ${
				classLifted.toFixed(1)
			}% with the class entry alone`,
	);

	// A margin well above the paired-seed noise floor, and far below what the suppression case
	// actually moves — this fails on a broken resolver, not on ordinary sampling variation. Under a
	// `max` reduction the shift is 0pp by construction, since the class entry wins outright.
	assert(
		classLifted - suppressed > PRESET_AFFINITY_MIN_SHIFT,
		`suppressing gold and silver beneath a higher class entry moved their share by only ` +
			`${(classLifted - suppressed).toFixed(1)}pp (expected more than ` +
			`${PRESET_AFFINITY_MIN_SHIFT}pp) — the specific entry is not overriding the class entry, ` +
			`which is what most-specific-wins exists to do (roadmap 2GN.110)`,
	);
});
