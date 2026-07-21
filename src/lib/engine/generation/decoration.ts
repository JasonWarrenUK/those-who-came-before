/**
 * Decorative grammar expansion (doc 05 §8.1–§8.3, "Stage 7", roadmap 2GN.29) — iterates an
 * artefact's components, each a potential decorative canvas (doc 05 §8.1), and selects zero-or-more
 * decorative techniques per component from the shipped `DECORATIVE_TECHNIQUES` catalogue
 * (`data/decorations.ts`, 2GN.28), weighted by the culture's technique preference, phase craft
 * technology and aesthetic tendencies, and a one-directional material-access gate.
 *
 * Pure TypeScript with no framework or browser dependencies (doc 08 §2.1, the engine boundary),
 * matching `engine/prng.ts` and `engine/generation/materials.ts`. Determinism flows entirely from
 * the injected PRNG.
 *
 * **Scope boundary** — 2GN.29 selects techniques; it does not resolve them into a fully valid
 * decorative scheme. Deliberately out of scope, owned downstream:
 * - substrate *enforcement* — running a technique's `substrate.test` against the specific
 *   component's assigned material, or resolving a `form` substrate against the component's
 *   geometry (roadmap 2GN.30). Every layer this module emits is a *candidate*; some may target a
 *   component whose eventual material or geometry doesn't actually satisfy the technique's
 *   prerequisite, and 2GN.30 is the pass that strips those. This module's own material-access gate
 *   (below) operates at the culture level, not per-component, and is a different check.
 * - sublayers / decoration-on-decoration (roadmap 2GN.31) — every emitted `DecorativeLayer` has
 *   `sublayers: []`.
 * - recursion depth cap from `craftSpecialisation` × `aesthetics.decorativeEmphasis` (roadmap
 *   2GN.32) — the per-category slot budget below draws on the same two drivers, but produces a
 *   single flat pass over one artefact, not nested layering depth.
 * - motif assignment from the culture's `motifVocabulary` (roadmap 2GN.33) — `motifRef` is left
 *   absent on every layer, as is `material` for `introducesMaterial` techniques (which material an
 *   inlay/gilding/etc. introduces is a selection this module has no catalogue access to resolve
 *   faithfully; inventing one would be fabrication, not derivation).
 *
 * **Culture/motif independence** (explicit product requirement): a culture's decorative-technique
 * preference and its motif vocabulary are separate signals. Two cultures can share every phase
 * characteristic and material affinity yet differ in whether they engrave at all, and — completely
 * independently — in whether their imagery includes beasts. `CulturalProfile.techniqueAffinities`
 * (`types/world.ts`) is the signal for the former; `motifVocabulary` (2GN.33) is the signal for the
 * latter. Neither implies the other.
 *
 * **One-directional material-access gate**: a culture that never favours *and* can obtain a
 * material satisfying a technique's material substrate should not realistically produce that
 * technique, regardless of any stated `techniqueAffinities` preference — a culture cannot engrave
 * what it has no engravable material for. The converse does not hold: a culture favouring an
 * engravable material is never thereby forced to engrave it (a culture can work bronze and never
 * decorate it at all, or only via patina). `materialAccessGate` below enforces the forward
 * direction only.
 *
 * MVP-provisional numbers below (the technique→craft-axis table, the per-category slot budget, the
 * weight-factor gains) follow the 2GN.2/2GN.8/2GN.25 precedent: doc 05 §8 names the drivers
 * (craftSpecialisation, aesthetics.decorativeEmphasis, technology.textiles) but supplies no
 * quantities for a sixteen-technique catalogue, so these are authored fresh, clearly marked, and
 * retunable once decoration is observable in the Explorer (roadmap 2GN.61).
 */

import type {
	DecorativeLayer,
	DecorativeTechnique,
	DecorativeTechniqueDefinition,
} from '../../types/decoration.ts';
import type { MaterialDefinition, NormalisedArtefact } from '../../types/artefact.ts';
import type {
	CulturalProfile,
	GeologicalContext,
	MaterialFlow,
	PhaseCharacteristics,
} from '../../types/world.ts';
import { DECORATIVE_TECHNIQUES } from '../../data/decorations.ts';
import { MATERIALS } from '../../data/materials.ts';
import { isAvailable } from './materials.ts';
import { resolvePhaseAttribute } from './phase.ts';
import { weightedSelect } from '../prng.ts';

/**
 * Maps each decorative technique to the `phase.technology` axis whose maturity most gates it (doc
 * 05 §8.3 names `technology.textiles` as "directly relevant to textile-element techniques"; the
 * remaining couplings are not tabled by the doc). MVP-provisional — authored fresh, retunable.
 * `null` means no single craft gates the technique (universally-achievable surface treatments, or
 * `painting`, whose pigment-application skill doesn't map cleanly onto one of the seven axes),
 * contributing a neutral technology factor rather than a suppressed one.
 *
 * Engraving/relief/inlay/overlay/studs/wire-wrapping/gilding all read against `metallurgy` as the
 * provisional default for "fine hard-surface/applied-metal working" — a material-aware refinement
 * (e.g. engraving stone reading against `stoneWorking` instead) would need the target component's
 * assigned material, which this module does not thread per-component (see the module JSDoc's scope
 * boundary); 2GN.30, which already threads material for substrate enforcement, is the natural place
 * to revisit this if it matters in practice.
 */
const TECHNIQUE_CRAFT_AXIS: Record<
	DecorativeTechnique,
	keyof PhaseCharacteristics['technology'] | null
> = {
	'polish': null,
	'patina': null,
	'roughening': null,
	'scoring': null,
	'engraving': 'metallurgy',
	'relief': 'metallurgy',
	'painting': null,
	'glaze': 'ceramics',
	'inlay': 'metallurgy',
	'overlay': 'metallurgy',
	'studs': 'metallurgy',
	'wire-wrapping': 'metallurgy',
	'gilding': 'metallurgy',
	'wrapping': 'textiles',
	'tassels': 'textiles',
	'beading': 'textiles',
};

/**
 * MVP-provisional floor mirroring `materials.ts`'s `NO_TECHNOLOGY_FLOOR`: a phase with zero
 * maturity in a technique's gating craft still permits the technique at reduced weight rather than
 * zeroing it out — even a culture just beginning to work metal occasionally produces a crude
 * engraving.
 */
const NO_TECHNOLOGY_FLOOR = 0.2;

/** MVP-provisional gain on `aesthetics.decorativeEmphasis`: how strongly high decorative emphasis skews selection toward this technique on top of the count-level effect (`decorationSlotBudget` below already scales *how many* techniques are picked; this scales *which* ones are favoured once picking). */
const AESTHETIC_EMPHASIS_GAIN = 0.5;

/**
 * MVP-provisional weight floor applied when a technique's material substrate is not satisfied by
 * any material the culture both favours and can obtain (`materialAccessGate`). Small but nonzero —
 * matching the `Math.max(0.01, …)` floor convention (`grammar.ts`'s `effectiveOptionWeight`,
 * `materials.ts`'s scarcity weights) so a technique is never structurally impossible, just strongly
 * suppressed, and `weightedSelect` never receives an all-zero pool.
 */
const MATERIAL_ABSENT_GATE = 0.05;

/** A culture's affinity for one of a material's tags, read as neutral (`1`) when absent — the same reduction `materials.ts`'s `culturalAffinityWeight` performs, inlined here since that helper isn't exported. */
function bestMaterialAffinity(material: MaterialDefinition, culture: CulturalProfile): number {
	let best = -Infinity;
	for (const tag of material.tags) {
		const affinity = culture.materialAffinities.get(tag) ?? 1;
		if (affinity > best) best = affinity;
	}
	return best === -Infinity ? 1 : best;
}

/**
 * The one-directional material-access gate (module JSDoc, roadmap 2GN.29): whether the culture
 * plausibly has access to a material satisfying `technique`'s substrate at all. Non-material
 * substrates (`'none'`, `'form'`) are never gated here — `'form'` prerequisites are geometric, not
 * material, and are resolved against a specific component by 2GN.30, not at the culture level this
 * function operates on.
 *
 * "Plausibly has access" means: at least one material in `materials` both (a) the culture favours
 * at better than neutral affinity (`bestMaterialAffinity(...) > 1`) and (b) can actually obtain
 * (`isAvailable`), and (c) satisfies the technique's `substrate.test`. Absent any such material, the
 * technique is gated to `MATERIAL_ABSENT_GATE` rather than `0` — see that constant's doc.
 *
 * @returns `1` when ungated or satisfied; `MATERIAL_ABSENT_GATE` when the culture has no plausible
 *   access to a satisfying material.
 */
function materialAccessGate(
	technique: DecorativeTechniqueDefinition,
	culture: CulturalProfile,
	geology: GeologicalContext,
	trade: readonly MaterialFlow[],
	materials: readonly MaterialDefinition[],
): number {
	if (technique.substrate.kind !== 'material') return 1;

	const hasAccess = materials.some((material) =>
		bestMaterialAffinity(material, culture) > 1 &&
		isAvailable(material, geology, trade) &&
		technique.substrate.kind === 'material' && technique.substrate.test(material)
	);

	return hasAccess ? 1 : MATERIAL_ABSENT_GATE;
}

/**
 * Computes a technique's selection weight for one culture/phase pairing (doc 05 §8.3, roadmap
 * 2GN.29): a product of factors over a uniform base of `1` (techniques carry no authored
 * `baseWeight`, unlike `GrammarOption`), floored at `Math.max(0.01, …)` matching
 * `effectiveOptionWeight` (`grammar.ts`) and `computeMaterialWeight` (`materials.ts`) so
 * `weightedSelect` never sees an all-zero pool. Four factors:
 *
 *  - `culture.techniqueAffinities` for this technique (neutral `1` when absent) — the cultural
 *    technique preference the four-quadrant requirement needs, independent of motifs.
 *  - `materialAccessGate` — the one-directional "no plausible material, no technique" suppression.
 *  - craft-technology: `TECHNIQUE_CRAFT_AXIS`-gated lerp from `NO_TECHNOLOGY_FLOOR` to full weight
 *    across the phase's matching `technology` axis, or neutral `1` when ungated.
 *  - aesthetic emphasis: all techniques scale mildly with `aesthetics.decorativeEmphasis`, so a
 *    high-emphasis phase skews toward more elaborate technique choices, distinct from
 *    `decorationSlotBudget`'s effect on how *many* techniques are picked.
 *
 * @param technique - The candidate technique definition.
 * @param culture - The producing culture's profile, supplying `techniqueAffinities` and
 *   `materialAffinities` (via the gate).
 * @param phase - The phase profile in force, supplying `technology` and `aesthetics` attributes.
 * @param geology - World-level material scarcity, read by the material-access gate.
 * @param trade - Material flows reachable through cultural relationships, read by the gate.
 * @param materials - The candidate material catalogue the gate checks against.
 * @returns The technique's selection weight, always `>= 0.01`.
 */
export function computeTechniqueWeight(
	technique: DecorativeTechniqueDefinition,
	culture: CulturalProfile,
	phase: PhaseCharacteristics,
	geology: GeologicalContext,
	trade: readonly MaterialFlow[],
	materials: readonly MaterialDefinition[] = MATERIALS,
): number {
	let weight = culture.techniqueAffinities.get(technique.technique) ?? 1;

	weight *= materialAccessGate(technique, culture, geology, trade, materials);

	const axis = TECHNIQUE_CRAFT_AXIS[technique.technique];
	weight *= axis === null ? 1 : NO_TECHNOLOGY_FLOOR +
		(1 - NO_TECHNOLOGY_FLOOR) * resolvePhaseAttribute(phase, `technology.${axis}`);

	weight *= 1 +
		AESTHETIC_EMPHASIS_GAIN * resolvePhaseAttribute(phase, 'aesthetics.decorativeEmphasis');

	return Math.max(0.01, weight);
}

/** MVP-provisional per-category slot ceiling (doc 05 §8.2's BNF allows unbounded `*` repetition per category; a hard cap keeps generation bounded pending the real recursion-depth cap, 2GN.32). */
const MAX_SLOTS_PER_CATEGORY = 2;

/** MVP-provisional base fill probability for a category's first slot, scaled by `decorationIntensity` below. */
const BASE_FILL_PROBABILITY = 0.9;

/** MVP-provisional per-slot decay: each successive slot within a category is progressively less likely to fill, mirroring `grammar.ts`'s attachment-depth decay shape. */
const SLOT_DECAY = 0.5;

/**
 * How strongly a phase drives decorative volume (doc 05 §8.3 names `craftSpecialisation` and
 * `aesthetics.decorativeEmphasis` as the two drivers of layering depth, without giving numbers).
 * MVP-provisional equal-weight blend of the two into a single 0–1 intensity.
 */
function decorationIntensity(phase: PhaseCharacteristics): number {
	return (
		resolvePhaseAttribute(phase, 'society.craftSpecialisation') +
		resolvePhaseAttribute(phase, 'aesthetics.decorativeEmphasis')
	) / 2;
}

const DECORATIVE_CATEGORIES = ['surface-treatment', 'applied-element', 'textile-element'] as const;

/**
 * Expands the decorative grammar over an artefact (doc 05 §8.1–§8.3, roadmap 2GN.29): iterates
 * every component as a decorative canvas and selects zero-or-more techniques per BNF category
 * (`<decoration> ::= <surface-treatment>* <applied-element>* <textile-element>*`, doc 05 §8.2),
 * weighted by `computeTechniqueWeight`. Returns a flat `DecorativeLayer[]` — one entry per selected
 * technique, every entry's `sublayers` empty, `motifRef`/`material` omitted (module JSDoc's scope
 * boundary: layering, motif and introduced-material assignment are 2GN.31/2GN.33; substrate
 * enforcement that would strip invalid technique/component pairings is 2GN.30).
 *
 * Component iteration follows `artefact.components` order; per component, the three BNF categories
 * fill in fixed order (surface-treatment, applied-element, textile-element). Each category
 * independently draws up to `MAX_SLOTS_PER_CATEGORY` slots: a slot fills when one `prng()` draw
 * falls under `BASE_FILL_PROBABILITY * decorationIntensity(phase) * SLOT_DECAY ** slotIndex`,
 * consuming a second `prng()` draw via `weightedSelect` to choose which technique fills it; the
 * first missed slot stops that category's fill (mirrors `grammar.ts`'s attachment-depth decay). A
 * category whose candidate pool is empty (a truncated injected `techniques` catalogue) is skipped
 * entirely rather than calling `weightedSelect` on an empty list. Component-then-category-then-slot
 * order, with a fixed one-or-two-draw cost per slot, is the determinism contract: the same seed
 * against the same artefact/culture/phase always produces the identical draw sequence and layer
 * list.
 *
 * Pure and side-effect-free: never mutates `artefact`, `culture`, `phase`, `materials` or
 * `techniques`.
 *
 * @param artefact - The normalised artefact whose components are the decorative canvases.
 * @param culture - The producing culture's profile — `techniqueAffinities` biases *which*
 *   techniques are favoured, `materialAffinities` feeds the material-access gate. Motif vocabulary
 *   is deliberately unread here (2GN.33).
 * @param phase - The phase whose `technology` and `aesthetics` attributes bias technique weight and
 *   overall decorative volume.
 * @param geology - World-level material scarcity, read by the material-access gate.
 * @param trade - Material flows reachable through cultural relationships, read by the gate.
 * @param materials - The candidate material catalogue the gate checks against. Defaults to the
 *   shipped `MATERIALS`.
 * @param techniques - The candidate technique catalogue. Defaults to the shipped
 *   `DECORATIVE_TECHNIQUES`.
 * @param prng - A generator from `createPrng`; determinism flows from it alone.
 * @returns The flat list of selected decorative layers, in component-then-category-then-slot
 *   emission order.
 */
export function expandDecoration(
	artefact: NormalisedArtefact,
	culture: CulturalProfile,
	phase: PhaseCharacteristics,
	geology: GeologicalContext,
	trade: readonly MaterialFlow[],
	materials: readonly MaterialDefinition[] = MATERIALS,
	techniques: readonly DecorativeTechniqueDefinition[] = DECORATIVE_TECHNIQUES,
	prng: () => number,
): DecorativeLayer[] {
	const pools: Record<DecorativeTechniqueDefinition['category'], DecorativeTechniqueDefinition[]> =
		{
			'surface-treatment': [],
			'applied-element': [],
			'textile-element': [],
		};
	for (const technique of techniques) {
		pools[technique.category].push(technique);
	}

	const intensity = decorationIntensity(phase);
	const layers: DecorativeLayer[] = [];

	for (const component of artefact.components) {
		for (const category of DECORATIVE_CATEGORIES) {
			const pool = pools[category];
			if (pool.length === 0) continue; // Truncated injected catalogue — skip, never throw.

			for (let slot = 0; slot < MAX_SLOTS_PER_CATEGORY; slot++) {
				const fillChance = BASE_FILL_PROBABILITY * intensity * SLOT_DECAY ** slot;
				if (prng() >= fillChance) break;

				const selected = weightedSelect(
					pool,
					prng,
					(technique) =>
						computeTechniqueWeight(technique, culture, phase, geology, trade, materials),
				);

				layers.push({
					targetComponentId: component.id,
					technique: selected.technique,
					sublayers: [],
				});
			}
		}
	}

	return layers;
}
