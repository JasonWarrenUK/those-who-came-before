/**
 * Material assignment (doc 05 §7, "Stage 6", roadmap 2GN.23–25) — per-component selection from the
 * shipped `MATERIALS` catalogue (`data/materials.ts`, 2GN.22), weighted by three factors in the
 * doc's stated priority order: geological availability, cultural affinity, phase technology.
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
 * region an artefact's `Provenance` will eventually carry. True region-gating and material-origin
 * attribution are deferred to 2GN.26 (`MaterialProvenance` metadata), 2GN.47 (provenance generation)
 * and 3WS.7 (real geology), and should be revisited once those land.
 *
 * 2GN.24 (`isAvailable`) and 2GN.25 (`computeMaterialWeight`) are folded into this task rather than
 * left as separate stubs — `assignMaterial`'s doc 05 §7 body calls both directly and is untestable
 * without them, the same fold precedent as 2GN.8→2GN.9.
 */

import type { MaterialDefinition, NormalisedComponent } from '../../types/artefact.ts';
import type {
	CulturalProfile,
	GeologicalContext,
	MaterialFlow,
	PhaseCharacteristics,
} from '../../types/world.ts';
import type { MaterialTag } from '../../types/tags.ts';
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
 * §7 "low weight... present but uncommon" level. Retunable once generation is observable in the
 * Explorer (the 2GN.8 dimension-tuning precedent) — no exact ratio is specified by doc 05.
 */
const SCARCITY_WEIGHT: Record<string, number> = {
	'abundant': 1.0,
	'available': 0.6,
	'scarce': 0.25,
	'trade-only': 0.15,
	'absent': 0, // Never reached via computeMaterialWeight — isAvailable excludes it first.
};

/** The best (most abundant) availability level for `materialId` across every region in `geology`. */
function bestAvailabilityLevel(materialId: string, geology: GeologicalContext): string | undefined {
	const regional = geology.materialAvailability.get(materialId);
	if (!regional || regional.regions.size === 0) return undefined;

	const order = ['abundant', 'available', 'scarce', 'trade-only', 'absent'];
	let best: string | undefined;

	for (const level of regional.regions.values()) {
		if (best === undefined || order.indexOf(level) < order.indexOf(best)) {
			best = level;
		}
	}

	return best;
}

/** Whether any `MaterialFlow` in `trade` can supply `material`, by tag or specific material id. */
function reachableByTrade(material: MaterialDefinition, trade: readonly MaterialFlow[]): boolean {
	return trade.some((flow) =>
		material.tags.includes(flow.materialTag) ||
		(flow.specificMaterials?.includes(material.id) ?? false)
	);
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
	const level = bestAvailabilityLevel(material.id, geology);

	if (level === undefined) return true; // Not modelled in this geology — MVP lenience.
	if (LOCALLY_OBTAINABLE_LEVELS.has(level)) return true;
	if (level === 'trade-only') return reachableByTrade(material, trade);

	return false; // 'absent'
}

/**
 * Combines a material's cultural-affinity weight across every tag it carries (doc 05 §3.3,
 * `CulturalProfile.materialAffinities`). Takes the **max** across tags, not a sum or average — a
 * material like gold (`metal` + `precious-metal`) should read by its strongest applicable cultural
 * leaning, not have that leaning diluted by an unrelated second tag. A tag absent from the map
 * contributes a neutral `1`.
 */
function culturalAffinityWeight(material: MaterialDefinition, culture: CulturalProfile): number {
	let best = -Infinity;

	for (const tag of material.tags as MaterialTag[]) {
		const affinity = culture.materialAffinities.get(tag) ?? 1;
		if (affinity > best) best = affinity;
	}

	return best === -Infinity ? 1 : best;
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
 * uncommon"). A material with no geology entry is treated as neutral (`1`), matching `isAvailable`'s
 * MVP lenience for mock world fixtures that don't model every material.
 */
function scarcityWeight(material: MaterialDefinition, geology: GeologicalContext): number {
	const level = bestAvailabilityLevel(material.id, geology);
	if (level === undefined) return 1;
	return SCARCITY_WEIGHT[level] ?? 1;
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
 * - Both filters exhausted (pathological, e.g. an empty `materials` catalogue slice passed in) —
 *   falls back to the full `materials` list so the function always returns a definition.
 *
 * @param component - The component receiving a material.
 * @param culture - The culture whose material affinities apply.
 * @param phase - The phase whose technology levels apply.
 * @param geology - World-level material scarcity.
 * @param trade - Material flows reachable through cultural relationships.
 * @param materials - The candidate catalogue. Defaults to the shipped `MATERIALS`.
 * @param prng - A generator from `createPrng`, consumed once via `weightedSelect`.
 * @returns The selected `MaterialDefinition`.
 */
export function assignMaterial(
	component: NormalisedComponent,
	culture: CulturalProfile,
	phase: PhaseCharacteristics,
	geology: GeologicalContext,
	trade: readonly MaterialFlow[],
	materials: readonly MaterialDefinition[] = MATERIALS,
	prng: () => number,
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
