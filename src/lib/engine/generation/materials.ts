/**
 * Material assignment (doc 05 §7, "Stage 6", roadmap 2GN.23–26) — per-component selection from the
 * shipped `MATERIALS` catalogue (`data/materials.ts`, 2GN.22), weighted by three factors in the
 * doc's stated priority order: geological availability, cultural affinity, phase technology; plus
 * provenance metadata (doc 05 §7.1) describing where the assigned material likely originated.
 *
 * Pure TypeScript with no framework or browser dependencies (doc 08 §2.1, the engine boundary),
 * matching `engine/prng.ts`. Determinism flows entirely from the injected PRNG.
 *
 * **M2-provisional boundary:** the type system has no culture→region mapping (`Culture` carries no
 * `region` field; region only exists on `Provenance.site.region`, generated downstream at 2GN.47,
 * and as a key inside `RegionalAvailability.regions`). Real per-region `GeologicalContext` doesn't
 * land until 3WS.7 (Milestone 3); Milestone 2 runs this pipeline against mock world fixtures by
 * design. `isAvailable` therefore answers a region-agnostic question — "is this material obtainable
 * *anywhere* in the geology it's handed, or reachable via trade" — rather than gating on the specific
 * region an artefact's `Provenance` will eventually carry. `deriveMaterialProvenance`'s
 * `likelyOriginRegion` is real signal (the region key `bestRegionalLevel` already resolved), but its
 * `tradePathId` is a **temporary synthesised string** — see that function's JSDoc — since neither
 * `MaterialFlow` nor `CultureRelationship` carries a stable id yet. True region-gating and durable
 * trade-path identity are deferred to 2GN.47 (provenance generation), 3WS.5/3WS.6 (real culture
 * relationships) and 3WS.7 (real geology), and should be revisited once those land.
 *
 * 2GN.24 (`isAvailable`) and 2GN.25 (`computeMaterialWeight`) are folded into this task rather than
 * left as separate stubs — `assignMaterial`'s doc 05 §7 body calls both directly and is untestable
 * without them, the same fold precedent as 2GN.8→2GN.9.
 */

import type {
	MaterialAssignment,
	MaterialDefinition,
	MaterialProvenance,
	NormalisedArtefact,
	NormalisedComponent,
} from '../../types/artefact.ts';
import type {
	AvailabilityLevel,
	CulturalProfile,
	GeologicalContext,
	MaterialFlow,
	MaterialSelector,
	PhaseCharacteristics,
} from '../../types/world.ts';
import type { MaterialName } from '../../types/tags.ts';
import { MATERIALS } from '../../data/materials.ts';
import { weightedSelect } from '../prng.ts';

/**
 * Availability levels the geology map can report per region for a material (world.ts).
 * `abundant`/`available`/`scarce` all count as locally obtainable; `trade-only` requires a matching
 * `MaterialFlow`; `absent` excludes the material outright.
 */
const LOCALLY_OBTAINABLE_LEVELS = new Set(['abundant', 'available', 'scarce']);

/**
 * MVP-provisional scarcity→weight multipliers (roadmap 2GN.25), applied by `computeMaterialWeight`
 * once a material has already passed `isAvailable`. Deliberately graded rather than binary so a
 * `scarce` material still appears, just rarely, and a `trade-only` material appears at the doc 05
 * §7 "low weight... present but uncommon" level.
 *
 * **Values are unchanged and pinned by `data/materials.calibration.test.ts` (roadmap 2GN.84), not
 * retuned.** No doc supplies a numeric target: doc 05 §7 states the ordering directionally only
 * ("present but uncommon"), and doc 05 §10.2 explicitly disclaims a quota reading ("it's a weight,
 * not a quota"). What the pin makes load-bearing is the *ratio between rungs* — that `scarce` reads
 * meaningfully rarer than `available`, and `trade-only` rarer still — not any one absolute value.
 * Before 2GN.84, nothing in the test suite could tell a real recalibration from a typo; the three
 * "distribution" tests in `materials.test.ts` are directional inequalities that pass for any
 * strictly-descending set of four numbers.
 */
const SCARCITY_WEIGHT: Record<string, number> = {
	'abundant': 1.0,
	'available': 0.6,
	'scarce': 0.25,
	'trade-only': 0.15,
	'absent': 0, // Never reached via computeMaterialWeight — isAvailable excludes it first.
};

/** A region key paired with its `AvailabilityLevel`, as found in `RegionalAvailability.regions`. */
interface RegionalLevel {
	region: string;
	level: AvailabilityLevel;
}

/** `computeMaterialWeight`'s three factors, decomposed, plus availability. See `explainMaterialWeight`. */
export interface MaterialWeightExplanation {
	/** Exactly `culturalAffinity * phaseTechnology * scarcity` — `computeMaterialWeight`'s result. */
	weight: number;
	culturalAffinity: number;
	phaseTechnology: number;
	scarcity: number;
	/** The best availability level across regions, or `undefined` when unmodelled in this geology. */
	level: AvailabilityLevel | undefined;
	/** Which region produced `level`. `undefined` iff `level` is. */
	region: string | undefined;
	/** `isAvailable`'s verdict for this material. */
	available: boolean;
	/** `true` only when `level` is `'trade-only'` and a `MaterialFlow` reaches it. */
	tradeRescued: boolean;
}

/**
 * The best (most abundant) availability level for `materialId` across every region in `geology`,
 * plus which region produced it. Region-agnostic callers (`isAvailable`, `scarcityWeight`) read
 * only `.level`; `deriveMaterialProvenance` (2GN.26) is the one consumer that needs `.region` too,
 * to attribute `likelyOriginRegion`.
 */
function bestRegionalLevel(
	materialId: MaterialName,
	geology: GeologicalContext,
): RegionalLevel | undefined {
	const regional = geology.materialAvailability.get(materialId);
	if (!regional || regional.regions.size === 0) return undefined;

	const order: AvailabilityLevel[] = ['abundant', 'available', 'scarce', 'trade-only', 'absent'];
	let best: RegionalLevel | undefined;

	for (const [region, level] of regional.regions) {
		if (best === undefined || order.indexOf(level) < order.indexOf(best.level)) {
			best = { region, level };
		}
	}

	return best;
}

/** Whether one `MaterialSelector` names `material`, by its class or by its own id. */
function selectorMatches(material: MaterialDefinition, selector: MaterialSelector): boolean {
	return selector.tag !== undefined
		? material.tags.includes(selector.tag)
		: material.id === selector.id;
}

/**
 * Whether a single `MaterialFlow` can supply `material`: some `includes` selector names it and no
 * `excludes` selector does (doc 05 §3.4, roadmap 2GN.112).
 *
 * Exclusion wins over inclusion, which is what lets a flow say "all metals except gold" — the case
 * the retired `materialTag`/`specificMaterials` pair could not express in either of its readings.
 * An empty `includes` supplies nothing rather than everything: a flow carrying no material is not a
 * trade route, and defaulting the empty case to "everything" would make an authoring slip silently
 * open the widest possible flow.
 */
function flowSuppliesMaterial(material: MaterialDefinition, flow: MaterialFlow): boolean {
	if (!flow.includes.some((selector) => selectorMatches(material, selector))) return false;

	return !(flow.excludes ?? []).some((selector) => selectorMatches(material, selector));
}

/** Whether any `MaterialFlow` in `trade` can supply `material`. */
function reachableByTrade(material: MaterialDefinition, trade: readonly MaterialFlow[]): boolean {
	return trade.some((flow) => flowSuppliesMaterial(material, flow));
}

/**
 * Whether `material` is obtainable at all — locally, in any region the geology map reports, or via
 * trade (doc 05 §7, roadmap 2GN.24).
 *
 * Region-agnostic at MVP (see module JSDoc): checks the best level across every region in `geology`
 * rather than a specific one, since no artefact-level region reaches this stage yet. A material with
 * no entry in `geology.materialAvailability` at all is treated as obtainable — a lenience for mock
 * world fixtures that won't list every material, not a real-world default.
 *
 * @param material - The candidate material.
 * @param geology - World-level material scarcity (world.ts).
 * @param trade - Material flows reachable through cultural relationships (world.ts).
 * @returns `true` when the material can be obtained locally (in some region) or through trade.
 */
export function isAvailable(
	material: MaterialDefinition,
	geology: GeologicalContext,
	trade: readonly MaterialFlow[],
): boolean {
	const level = bestRegionalLevel(material.id, geology)?.level;

	if (level === undefined) return true; // Not modelled in this geology — MVP lenience.
	if (LOCALLY_OBTAINABLE_LEVELS.has(level)) return true;
	if (level === 'trade-only') return reachableByTrade(material, trade);

	return false; // 'absent'
}

/**
 * A material's cultural-affinity weight (doc 05 §3.3, `CulturalProfile.materialAffinities`),
 * resolved **most-specific-wins** per the roadmap 2GN.110 ruling: a `{ id }` entry naming this
 * material beats any `{ tag }` entry covering its class, a `{ tag }` entry supplies the class
 * default, and a material matched by neither reads a neutral `1`.
 *
 * So `{ tag: 'metal' }: 1.5` with `{ id: 'gold' }: 0.8` weights bronze and iron at 1.5 and gold at
 * 0.8 — the specific entry **lowers** as well as raises. That bidirectionality is the whole point:
 * this replaced a `max` across tags which 2GN.84 measured discarding authored values whenever the
 * class tag scored higher (3 of the 5 authored across the Explorer presets were dead that way), so a
 * specific entry could only ever raise a material. Product-of-deviations was rejected alongside it
 * for breaking the correspondence between what an author writes and what the engine computes
 * (`1.5 × 0.8 = 1.2` reads as mild favour when disfavour was meant).
 *
 * ⚠️ The **tag-versus-tag tie is deliberately unruled** (ruling point 6): a material carrying two
 * `MaterialTag`s would match two class entries with no tiebreak between them. No shipped material
 * does, and `materials.test.ts` pins that invariant so this becomes reachable only loudly. The
 * `find` below therefore takes first-match by array order — **an implementation detail, not a
 * ruling.** Do not read array order as a decision; the ruling comes due if that test ever fails.
 *
 * Exported so `decoration.ts` can share it rather than inline a second copy, which is what the two
 * previously-divergent JSDoc blocks were apologising for.
 *
 * @param material - The candidate material.
 * @param culture - The culture whose judgement is being read.
 * @returns The affinity weight; `1` when the culture expresses no view on this material.
 */
export function culturalAffinityWeight(
	material: MaterialDefinition,
	culture: CulturalProfile,
): number {
	const specific = culture.materialAffinities.find((entry) => entry.selector.id === material.id);
	if (specific) return specific.weight;

	const byClass = culture.materialAffinities.find((entry) =>
		entry.selector.tag !== undefined && material.tags.includes(entry.selector.tag)
	);

	return byClass?.weight ?? 1;
}

/**
 * The phase-technology multiplier for a material's `craftDomain` (doc 05 §7 point 3). Mirrors
 * `phaseInfluence`'s lerp shape (`grammar.ts`): a culture's raw technology score (0–1) lerps between
 * a floor and full weight, rather than zeroing the material out entirely at technology 0 — even a
 * culture just beginning to work metal still occasionally produces it.
 */
const NO_TECHNOLOGY_FLOOR = 0.2;

function phaseTechnologyWeight(material: MaterialDefinition, phase: PhaseCharacteristics): number {
	const technology = phase.technology[material.craftDomain];
	return NO_TECHNOLOGY_FLOOR + (1 - NO_TECHNOLOGY_FLOOR) * technology;
}

/**
 * The scarcity multiplier for a material, derived from its best availability level across the
 * regions `geology` reports (doc 05 §7: "trade materials appear at low weight — present but
 * uncommon").
 *
 * A material with no geology entry reads at the `'available'` rung, not neutral `1` (roadmap
 * 2GN.84 — corrected from the original reading, which this function's history still shows in git
 * blame). Neutral `1` sat *above* `available`'s `0.6` and four times `scarce`'s `0.25`, so an
 * unmodelled material silently out-ranked every explicitly-modelled peer — the same class of defect
 * doc 12 §2.25 caught with silver/jade before the six exhaustive `MOCK_WORLD_REGIONS` fixtures
 * existed to close it. An unmodelled material is one nobody made a claim about; the honest default
 * for an unclaimed material is "unremarkable", not "the most plentiful thing here".
 *
 * Deliberately distinct from `isAvailable`'s own MVP lenience (`return true` for an unmodelled
 * material) — that lenience is correct and untouched: "unmodelled means not excluded" is a fair
 * reading for a fixture that doesn't list every material. It was only the *weight* an unmodelled
 * material received that was wrong, not whether it should be excluded at all. Keep the two
 * distinct: this function answers "how much", `isAvailable` answers "at all".
 */
function scarcityWeight(material: MaterialDefinition, geology: GeologicalContext): number {
	const level = bestRegionalLevel(material.id, geology)?.level;
	if (level === undefined) return SCARCITY_WEIGHT['available'];
	return SCARCITY_WEIGHT[level] ?? SCARCITY_WEIGHT['available'];
}

/**
 * Computes a material's selection weight for one component (doc 05 §7, roadmap 2GN.25): the product
 * of cultural affinity, phase-technology capability and geological scarcity. Assumes `material` has
 * already passed `isAvailable` — this function doesn't re-check exclusion, only grades how strongly
 * an obtainable material should be favoured.
 *
 * `geology` is an addition beyond the roadmap's bare `(material, culture, phase)` signature, needed
 * so scarcity can weight the result the way doc 05 §7 describes ("trade materials appear at low
 * weight"), rather than being a purely binary gate. Deliberate, documented refinement.
 *
 * @param material - The candidate material (already filtered for compatibility and availability).
 * @param culture - The culture whose material affinities apply.
 * @param phase - The phase whose technology levels apply.
 * @param geology - World-level material scarcity, for the scarcity multiplier.
 * @returns A non-negative weight; higher means more likely to be selected.
 */
export function computeMaterialWeight(
	material: MaterialDefinition,
	culture: CulturalProfile,
	phase: PhaseCharacteristics,
	geology: GeologicalContext,
): number {
	return culturalAffinityWeight(material, culture) *
		phaseTechnologyWeight(material, phase) *
		scarcityWeight(material, geology);
}

/**
 * `computeMaterialWeight`'s three factors, decomposed, plus the availability read they were derived
 * alongside (doc 05 §7, roadmap 2GN.74). Exists so a caller — the material viewer panel (2GN.60) —
 * can show a scarcity-vs-affinity-vs-technology breakdown without duplicating `SCARCITY_WEIGHT` or
 * `NO_TECHNOLOGY_FLOOR`, which stay private so the engine remains the only place that retunes them.
 *
 * `weight` is exactly `computeMaterialWeight(material, culture, phase, geology)` — the three factors
 * multiply back to it precisely; `materials.test.ts` pins this.
 *
 * `level`/`region`/`available` mirror `isAvailable`'s read of `bestRegionalLevel`, computed once here
 * rather than the two separate calls `isAvailable` and `scarcityWeight` each make independently.
 * `level` is `undefined` for a material with no geology entry — genuinely unmodelled, not the
 * `'available'` rung `scarcity` reads for it. Keep that distinction: an unmodelled material is
 * lenient on *whether* it's obtainable (`available: true`, matching `isAvailable`) but not treated as
 * more plentiful than a modelled peer (`scarcity` still reads the `available` rung's weight, per
 * `scarcityWeight`'s own JSDoc on why unmodelled isn't neutral `1`).
 *
 * `tradeRescued` is `true` only when the material is `trade-only` locally and a `MaterialFlow`
 * actually reaches it — the boolean rescue `isAvailable` performs, reported rather than folded away.
 * Trade is not a weight multiplier anywhere in this module; a rescued material's `scarcity` still
 * reads the `trade-only` rung.
 *
 * @param material - The candidate material.
 * @param culture - The culture whose material affinities apply.
 * @param phase - The phase whose technology levels apply.
 * @param geology - World-level material scarcity.
 * @param trade - Material flows reachable through cultural relationships.
 * @returns The decomposed weight factors, availability level and region, and trade-rescue flag.
 */
export function explainMaterialWeight(
	material: MaterialDefinition,
	culture: CulturalProfile,
	phase: PhaseCharacteristics,
	geology: GeologicalContext,
	trade: readonly MaterialFlow[],
): MaterialWeightExplanation {
	const regional = bestRegionalLevel(material.id, geology);
	const level = regional?.level;

	const available = level === undefined
		? true
		: LOCALLY_OBTAINABLE_LEVELS.has(level)
		? true
		: level === 'trade-only'
		? reachableByTrade(material, trade)
		: false;

	const tradeRescued = level === 'trade-only' && reachableByTrade(material, trade);

	const scarcity = level === undefined
		? SCARCITY_WEIGHT['available']
		: SCARCITY_WEIGHT[level] ?? SCARCITY_WEIGHT['available'];

	const culturalAffinity = culturalAffinityWeight(material, culture);
	const phaseTechnology = phaseTechnologyWeight(material, phase);

	return {
		weight: culturalAffinity * phaseTechnology * scarcity,
		culturalAffinity,
		phaseTechnology,
		scarcity,
		level,
		region: regional?.region,
		available,
		tradeRescued,
	};
}

/**
 * Assigns a material to one normalised component (doc 05 §7, roadmap 2GN.23): filters the catalogue
 * by physical compatibility, then by availability, then weights survivors by cultural affinity,
 * phase technology and geological scarcity before a weighted PRNG draw.
 *
 * **Empty-candidate fallbacks** (`weightedSelect` throws on an empty list; `assignMaterial` never
 * should):
 * - `component.allowedMaterialTags` empty — treated as "no constraint", not "nothing fits". The
 *   real pipeline hits this today because 2GN.10 (the compatibility-table task) hasn't landed yet;
 *   2GN.8 stubs every component's `allowedMaterialTags` as `[]`. Once 2GN.10 lands and populates real
 *   constraints, an empty array becomes genuinely rare and this fallback stays correct either way.
 * - Availability excludes every compatible material — availability is a *preference* at MVP, not a
 *   hard requirement, so the compatible set is used unfiltered rather than failing generation.
 * - Both filters exhausted (pathological, e.g. a non-empty but incompatible `materials` slice
 *   passed in) — falls back to the full `materials` list so the function always returns a
 *   definition. This does not cover a `materials` argument that is itself empty — there is no
 *   candidate left to fall back to, so `weightedSelect` still throws; callers are expected to
 *   pass a non-empty catalogue (the default `MATERIALS` always is).
 *
 * @param component - The component receiving a material.
 * @param culture - The culture whose material affinities apply.
 * @param phase - The phase whose technology levels apply.
 * @param geology - World-level material scarcity.
 * @param trade - Material flows reachable through cultural relationships.
 * @param prng - A generator from `createPrng`, consumed once via `weightedSelect`.
 * @param materials - The candidate catalogue. Defaults to the shipped `MATERIALS`.
 * @returns The selected `MaterialDefinition`.
 */
export function assignMaterial(
	component: NormalisedComponent,
	culture: CulturalProfile,
	phase: PhaseCharacteristics,
	geology: GeologicalContext,
	trade: readonly MaterialFlow[],
	prng: () => number,
	materials: readonly MaterialDefinition[] = MATERIALS,
): MaterialDefinition {
	const compatible = component.allowedMaterialTags.length === 0
		? materials // No constraint recorded yet (2GN.10 stub) — everything is a candidate.
		: materials.filter((m) => m.tags.some((tag) => component.allowedMaterialTags.includes(tag)));

	const available = compatible.filter((m) => isAvailable(m, geology, trade));

	const candidates = available.length > 0
		? available
		: compatible.length > 0
		? compatible
		: materials;

	return weightedSelect(
		candidates,
		prng,
		(material) => computeMaterialWeight(material, culture, phase, geology),
	);
}

/**
 * Synthesises a provisional `tradePathId` for a `MaterialFlow` that satisfied `reachableByTrade`
 * (doc 05 §7.1).
 *
 * ⚠️ **TEMPORARY, load-bearing on nothing.** Neither `MaterialFlow` nor its parent
 * `CultureRelationship` (`world.ts`) carries an id today — a flow is just an unkeyed entry inside
 * `RelationshipDynamics.trade.materialFlow[]`, and a relationship is identified only by
 * `cultureIds`, not a stable id of its own. This string is therefore *not* a real relationship
 * reference: it cannot be resolved back to a `CultureRelationship`, only reproduced from the same
 * flow position that produced it. It exists purely so `MaterialProvenance.tradePathId` is populated
 * with *something* traceable to the flow that justified the 'trade' verdict, rather than left
 * `undefined`.
 *
 * The id was `provisional-trade:${materialTag}:${index}` until roadmap 2GN.112 replaced that field
 * with `includes`/`excludes`. A flow no longer has one tag to name it, and summarising a selector
 * list into the id would read as a description of the flow's contents while being neither stable
 * (re-authoring the list silently changes provenance ids) nor resolvable. The index alone already
 * distinguishes flows within a `trade` array, which is all this ever guaranteed.
 *
 * Real trade-path identity is 3WS.5/3WS.6's to mint, once `generateRelationships` actually
 * constructs `CultureRelationship`s (rather than the hand-authored `explorer-cultures.ts` presets
 * this runs against at MVP). When that lands, this function — and every caller of it — should be
 * replaced with a lookup against the real relationship id, not extended.
 *
 * @param index - The flow's position within the `trade` array passed to `isAvailable`, so two
 *   flows carrying overlapping materials still resolve to distinct (if equally provisional) ids.
 */
function synthesiseTradePathId(index: number): string {
	return `provisional-trade:${index}`;
}

/**
 * The index of the first `trade` entry that makes `material` trade-reachable, or `undefined` if
 * none does — sharing `reachableByTrade`'s `flowSuppliesMaterial` check so the two can never
 * disagree, and feeding `synthesiseTradePathId`.
 *
 * Returned as a bare index since roadmap 2GN.112: the flow itself was only ever read for the
 * `materialTag` that id-synthesis no longer uses.
 */
function findReachableTradeFlowIndex(
	material: MaterialDefinition,
	trade: readonly MaterialFlow[],
): number | undefined {
	const index = trade.findIndex((flow) => flowSuppliesMaterial(material, flow));

	return index === -1 ? undefined : index;
}

/**
 * Derives a `MaterialProvenance` for one material assignment (doc 05 §7.1, roadmap 2GN.26): where
 * the raw material likely originated, hidden from the player.
 *
 * `source` reads the same `bestRegionalLevel` verdict `isAvailable`/`scarcityWeight` already use,
 * so provenance and the assignment it describes are always consistent with one another:
 * - `abundant`/`available`/`scarce` → `'local'` — the material is obtainable in the region
 *   `geology` reports, so that region is the likely origin.
 * - `trade-only` and reachable → `'trade'`, with `likelyOriginRegion` left unset (the *supplying*
 *   culture's region isn't modelled at MVP — only that a flow exists) and a **provisional**
 *   `tradePathId` (see `synthesiseTradePathId`).
 * - No geology entry at all, or `absent`/unreachable `trade-only` — `'unknown'`: there is no
 *   signal to base a claim on, so no claim is made. This can legitimately occur even for a
 *   material `assignMaterial` just selected, since availability is a soft preference at MVP, not
 *   a hard filter (see `assignMaterial`'s empty-candidate fallbacks).
 *
 * `'regional'` (`MaterialProvenance.source`) is never produced here: it would distinguish "from a
 * neighbouring region" from "from this region," but `GeologicalContext` has no concept of
 * inter-region distance yet, and `bestRegionalLevel` already collapses every region a material
 * appears in down to its single best level. Fabricating a local/regional split with no distance
 * signal behind it would invent data doc 05 §7.1 doesn't ask for.
 *
 * @param material - The assigned material.
 * @param geology - World-level material scarcity, for region and source attribution.
 * @param trade - Material flows reachable through cultural relationships, for trade attribution.
 * @returns The derived `MaterialProvenance`.
 */
export function deriveMaterialProvenance(
	material: MaterialDefinition,
	geology: GeologicalContext,
	trade: readonly MaterialFlow[],
): MaterialProvenance {
	const regional = bestRegionalLevel(material.id, geology);

	if (regional !== undefined && LOCALLY_OBTAINABLE_LEVELS.has(regional.level)) {
		return { source: 'local', likelyOriginRegion: regional.region };
	}

	if (regional?.level === 'trade-only') {
		const reachedIndex = findReachableTradeFlowIndex(material, trade);
		if (reachedIndex !== undefined) {
			return {
				source: 'trade',
				tradePathId: synthesiseTradePathId(reachedIndex),
			};
		}
	}

	return { source: 'unknown' }; // No geology entry, 'absent', or unreached 'trade-only'.
}

/**
 * Assigns a material to `component` and derives its provenance in one call (doc 05 §7.1), for
 * callers building a `MaterialAssignment` (2GN.75's per-artefact orchestrator, and tests) rather
 * than needing the bare `MaterialDefinition` `assignMaterial` returns.
 *
 * @param component - The component receiving a material.
 * @param culture - The culture whose material affinities apply.
 * @param phase - The phase whose technology levels apply.
 * @param geology - World-level material scarcity.
 * @param trade - Material flows reachable through cultural relationships.
 * @param prng - A generator from `createPrng`, consumed once via `weightedSelect`.
 * @param materials - The candidate catalogue. Defaults to the shipped `MATERIALS`.
 * @returns The `MaterialAssignment` for `component`.
 */
export function assignMaterialWithProvenance(
	component: NormalisedComponent,
	culture: CulturalProfile,
	phase: PhaseCharacteristics,
	geology: GeologicalContext,
	trade: readonly MaterialFlow[],
	prng: () => number,
	materials: readonly MaterialDefinition[] = MATERIALS,
): MaterialAssignment {
	const material = assignMaterial(component, culture, phase, geology, trade, prng, materials);

	return {
		componentId: component.id,
		materialId: material.id,
		provenance: deriveMaterialProvenance(material, geology, trade),
	};
}

/**
 * Assigns a material (with provenance) to every component of `artefact` in one pass (doc 05 §7,
 * roadmap 2GN.75) — the componentId→material mapping the rest of the pipeline needs. Promotes the
 * duplicated Explorer route logic (`materialAssignment.ts`, `decorationLayers.ts`) into the engine,
 * one `assignMaterialWithProvenance` call per component, in `artefact.components` order.
 *
 * **Per-component PRNG namespacing.** The two Explorer routes each re-seeded a brand-new
 * `createPrng` per component from a string key concatenating the artefact seed, the component's
 * `position` and (in one route) a draw index — a workaround forced by having no single generator
 * instance shared between the two routes, and by `component.id` differing across panels that
 * normalise the same seed independently. Neither problem applies here: `assignMaterials` receives
 * one `prng` instance and one already-normalised `artefact`, so it follows the engine's established
 * convention instead (`expandGrammar`, `expandDecoration`) — threading that single generator
 * through every component's draw, sequentially, rather than re-seeding per component. This keeps
 * material assignment composable with whatever already-advanced `prng` the rest of Stage 6 is
 * using, and needs no synthetic per-component seed string.
 *
 * @param artefact - The normalised artefact whose components need materials.
 * @param culture - The culture whose material affinities apply.
 * @param phase - The phase whose technology levels apply.
 * @param geology - World-level material scarcity.
 * @param trade - Material flows reachable through cultural relationships.
 * @param prng - A generator from `createPrng`, consumed once per component via `weightedSelect`.
 * @param materials - The candidate catalogue. Defaults to the shipped `MATERIALS`.
 * @returns One `MaterialAssignment` per component, in `artefact.components` order.
 */
export function assignMaterials(
	artefact: NormalisedArtefact,
	culture: CulturalProfile,
	phase: PhaseCharacteristics,
	geology: GeologicalContext,
	trade: readonly MaterialFlow[],
	prng: () => number,
	materials: readonly MaterialDefinition[] = MATERIALS,
): MaterialAssignment[] {
	return artefact.components.map((component) =>
		assignMaterialWithProvenance(component, culture, phase, geology, trade, prng, materials)
	);
}
