/**
 * Decorative grammar expansion (doc 05 §8.1–§8.3, "Stage 7", roadmap 2GN.29) and decorative-detail
 * resolution (doc 05 §8.5, roadmap 2GN.33) — `expandDecoration` iterates an artefact's components,
 * each a potential decorative canvas (doc 05 §8.1), and selects zero-or-more decorative techniques
 * per component from the shipped `DECORATIVE_TECHNIQUES` catalogue (`data/decorations.ts`, 2GN.28),
 * weighted by the culture's technique preference, phase craft technology and aesthetic tendencies,
 * and a one-directional material-access gate. `assignDecorativeDetails` is the separate downstream
 * pass that fills the layers' grammar arguments: a motif from the culture's `motifVocabulary`
 * (plus motifs borrowed through cultural exchange) for motif-carrying techniques, and an
 * introduced material for material-introducing techniques.
 *
 * Pure TypeScript with no framework or browser dependencies (doc 08 §2.1, the engine boundary),
 * matching `engine/prng.ts` and `engine/generation/materials.ts`. Determinism flows entirely from
 * the injected PRNG.
 *
 * **Scope boundary** — `expandDecoration` (2GN.29) selects techniques; it does not resolve them
 * into a fully valid decorative scheme. Deliberately out of scope there, owned downstream:
 * - substrate *enforcement* — running a technique's `substrate.test` against the specific
 *   component's assigned material, or resolving a `form` substrate against the component's
 *   geometry (roadmap 2GN.30). Every layer this module emits is a *candidate*; some may target a
 *   component whose eventual material or geometry doesn't actually satisfy the technique's
 *   prerequisite, and 2GN.30 is the pass that strips those. This module's own material-access gate
 *   (below) operates at the culture level, not per-component, and is a different check.
 * - sublayers / decoration-on-decoration (roadmap 2GN.31) — every emitted `DecorativeLayer` has
 *   `sublayers: []`.
 * - recursion depth cap (roadmap 2GN.32) — the per-category slot budget below produces a single
 *   flat pass over one artefact, not nested layering depth. Doc 05 §8.3's craft/emphasis-driven
 *   depth table is instead realised flat, split across `decorationVolume` (how much decoration
 *   appears — `aesthetics.decorativeEmphasis` alone) and each layer's `grade`
 *   (how well-executed it is — `society.craftSpecialisation` and the technique's own difficulty,
 *   `computeLayerGrade` below) — roadmap 2GN.98, doc 11 §1.5.
 * - motif and introduced-material assignment — owned by `assignDecorativeDetails` (2GN.33, below)
 *   as a separate pass rather than folded into expansion, so the eventual pipeline can order it
 *   after 2GN.30's substrate stripping (no draws wasted on layers that get stripped) and so
 *   `expandDecoration`'s draw-sequence contract stays untouched.
 * - material-aware execution quality — owned by `gradeDecorativeLayers` (2GN.99, below), for the
 *   same reason. The `grade` `expandDecoration` emits is *provisional*: components have no assigned
 *   material at expansion time, so it reflects the technique alone. That pass refines it once
 *   materials are known.
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
 * direction only, and composes two independent checks (roadmap 2GN.84): the substrate a technique
 * is applied *to* (material-kind substrates only), and the material a technique *introduces*
 * (`INTRODUCED_MATERIAL_TAGS`) when the two differ — `wire-wrapping`'s substrate is the grippable
 * form it wraps, not the metal wire it introduces, and both must be checked.
 *
 * MVP-provisional numbers below (the technique→craft-axis table, the per-category slot budget, the
 * weight-factor gains) follow the 2GN.2/2GN.8/2GN.25 precedent: doc 05 §8 names the drivers
 * (craftSpecialisation, aesthetics.decorativeEmphasis, technology.textiles) but supplies no
 * quantities for a sixteen-technique catalogue, so these are authored fresh, clearly marked, and
 * retunable once decoration is observable in the Explorer (roadmap 2GN.61). `TECHNIQUE_DIFFICULTY`
 * (`data/decorations.ts`) is authored content of the same kind, reviewed per-item against how each
 * craft actually works, not derived from this module's other constants.
 */

import type {
	DecorativeLayer,
	DecorativeTechnique,
	DecorativeTechniqueDefinition,
} from '../../types/decoration.ts';
import type {
	MaterialAssignment,
	MaterialDefinition,
	NormalisedArtefact,
} from '../../types/artefact.ts';
import type {
	CulturalProfile,
	GeologicalContext,
	MaterialFlow,
	MotifDefinition,
	PhaseCharacteristics,
} from '../../types/world.ts';
import type { MaterialTag } from '../../types/tags.ts';
import {
	DECORATIVE_TECHNIQUES,
	type MaterialDifficultyAxis,
	TECHNIQUE_DIFFICULTY,
	TECHNIQUE_MATERIAL_SENSITIVITY,
} from '../../data/decorations.ts';
import { MATERIALS } from '../../data/materials.ts';
import { computeMaterialWeight, isAvailable } from './materials.ts';
import { resolvePhaseAttribute } from './phase.ts';
import { weightedSelect } from '../prng.ts';

/**
 * Maps each decorative technique to the `phase.technology` axis whose maturity most gates it (doc
 * 05 §8.3 names `technology.textiles` as "directly relevant to textile-element techniques"; the
 * remaining couplings are not tabled by the doc). MVP-provisional — authored fresh, retunable.
 * `null` means no single craft gates the technique (universally-achievable surface treatments, or
 * `painting`, whose pigment-application skill doesn't map cleanly onto any one axis), contributing a
 * neutral technology factor rather than a suppressed one.
 *
 * No technique gates on `leatherWorking` (roadmap 2GN.100) — deliberately, not by oversight.
 * `wrapping` is the one plausible candidate, but it introduces `['fiber', 'leather']`, so pointing
 * it at either pure axis is wrong half the time; the correct fix is material-aware axis resolution,
 * which shares 2GN.99's blocker and is recorded with it. The new axis earns its keep through
 * `phaseTechnologyWeight` (`materials.ts`) instead, which is where the conflation actually bit.
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

/** MVP-provisional gain on `aesthetics.decorativeEmphasis`: how strongly high decorative emphasis skews selection toward this technique on top of the count-level effect (`decorationVolume` below already scales *how many* techniques are picked; this scales *which* ones are favoured once picking). */
const AESTHETIC_EMPHASIS_GAIN = 0.5;

/**
 * MVP-provisional weight floor applied when a technique's material substrate is not satisfied by
 * any material the culture both favours and can obtain (`materialAccessGate`). Small but nonzero —
 * matching the `Math.max(0.01, …)` floor convention (`grammar.ts`'s `effectiveOptionWeight`,
 * `materials.ts`'s scarcity weights) so a technique is never structurally impossible, just strongly
 * suppressed, and `weightedSelect` never receives an all-zero pool.
 */
const MATERIAL_ABSENT_GATE = 0.05;

/**
 * Which material tags may satisfy each material-introducing technique's BNF `<material>` argument
 * (doc 05 §8.2), interviewed item-by-item with the user (2026-07-25, roadmap 2GN.33) and grounded
 * in documented craft practice per technique:
 * - `gilding` — every documented gilding practice (leaf, fire/amalgam, foil/diffusion, depletion
 *   gilding; silvering as the silver analogue) uses gold or silver, coinciding with the BNF's
 *   explicit `<precious-metal>` argument.
 * - `wire-wrapping` — wire is drawn metal; precious wire on a grippable form is the classic
 *   sword-grip binding.
 * - `wrapping` — cord, thong and cloth binding: pliable sheet/cord materials only.
 * - `inlay` — documented inlay spans metal, gem/glass, bone/shell and wood marquetry; excludes
 *   only materials that can't sit in an engraved channel as a solid insert (fiber, leather, clay).
 * - `overlay` — sheet-workable coverings: metal foil/sheet, and leather facing over wood
 *   (shields, scabbards).
 * - `studs` — metal studs and rivets dominate the record; bone/antler studs are attested on
 *   organic substrates.
 * - `beading` — the four dominant documented bead materials (glass, stone, jade-class,
 *   bone/antler) plus metal beads, well attested in elite contexts and kept naturally rare by
 *   scarcity weighting.
 *
 * `null` marks a technique whose grammar form introduces no material (`introducesMaterial: false`
 * in the shipped catalogue); the `Record` stays exhaustive over all sixteen terminals so a new
 * technique fails to compile until its entry is authored. If an *injected* catalogue flags a
 * `null`-entry technique as material-introducing, the `null` reads as "no tag constraint" (every
 * material is a candidate) — mirroring `assignMaterial`'s empty-`allowedMaterialTags` lenience —
 * rather than silently omitting the material.
 *
 * Moved above `materialAccessGate` (roadmap 2GN.84) so the gate can read it directly — see that
 * function's doc for why it now does.
 */
const INTRODUCED_MATERIAL_TAGS: Record<DecorativeTechnique, readonly MaterialTag[] | null> = {
	'polish': null,
	'patina': null,
	'roughening': null,
	'scoring': null,
	'engraving': null,
	'relief': null,
	'painting': null,
	'glaze': null,
	'inlay': ['metal', 'precious-metal', 'stone', 'precious-stone', 'glass', 'bone', 'wood'],
	'overlay': ['metal', 'precious-metal', 'leather'],
	'studs': ['metal', 'precious-metal', 'bone'],
	'wire-wrapping': ['metal', 'precious-metal'],
	'gilding': ['precious-metal'],
	'wrapping': ['fiber', 'leather'],
	'tassels': null,
	'beading': ['glass', 'stone', 'precious-stone', 'bone', 'metal', 'precious-metal'],
};

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
 * Whether at least one material in `materials` can plausibly supply `tags` — obtainable
 * (`isAvailable`) and carrying one of the given tags. Availability only, not affinity: unlike
 * `materialAccessGate`'s substrate check below, a culture reaching for wire to bind a grip, or foil
 * to overlay a hilt, doesn't need to *favour* metal generally to use it decoratively — it only needs
 * to be able to get some. Affinity still shapes which specific material wins, downstream, via
 * `computeMaterialWeight` in `assignDecorativeDetails`.
 */
function hasIntroducedMaterialAccess(
	tags: readonly MaterialTag[],
	geology: GeologicalContext,
	trade: readonly MaterialFlow[],
	materials: readonly MaterialDefinition[],
): boolean {
	return materials.some((material) =>
		isAvailable(material, geology, trade) && material.tags.some((tag) => tags.includes(tag))
	);
}

/**
 * The one-directional material-access gate (module JSDoc, roadmap 2GN.29): whether the culture
 * plausibly has access to a material satisfying `technique`'s requirements at all. Checks two
 * independent requirements, either of which can suppress the technique:
 *
 * 1. **Substrate.** Non-material substrates (`'none'`, `'form'`) are never gated on this axis —
 *    `'form'` prerequisites are geometric, not material, and are resolved against a specific
 *    component by 2GN.30, not at the culture level this function operates on. "Plausibly has
 *    access" for a material substrate means: at least one material in `materials` both (a) the
 *    culture favours at better than neutral affinity (`bestMaterialAffinity(...) > 1`) and (b) can
 *    actually obtain (`isAvailable`), and (c) satisfies the technique's `substrate.test`.
 * 2. **Introduced material** (roadmap 2GN.84). A technique can have a *non*-material substrate
 *    (`wire-wrapping`'s is `'form'`) while still introducing a material (`INTRODUCED_MATERIAL_TAGS`)
 *    the culture must be able to obtain — the substrate describes what's decorated, not what
 *    decorates it. Before this check existed, `expandDecoration` selected `wire-wrapping` without
 *    ever asking whether the culture could obtain metal wire: measured in a trade-isolated,
 *    metal-free region (`forestInterior`, `tests/fixtures/world.ts`), wire-wrapping's share rose to
 *    26.3% of layers (against ~6% everywhere else) as the probability mass freed by correctly
 *    suppressed metal techniques (gilding: 7.1% → 2.1%) redistributed onto it — a metal-free culture
 *    producing *more* metal wirework than anywhere else. Gated on availability only
 *    (`hasIntroducedMaterialAccess`), not affinity — see that helper's doc for why the two checks
 *    differ.
 *
 * Absent a satisfying material on whichever check(s) apply, the technique is gated to
 * `MATERIAL_ABSENT_GATE` rather than `0` — see that constant's doc. The two checks compose
 * multiplicatively: a technique with both a material substrate and an introduced material must pass
 * both to stay ungated.
 *
 * @returns `1` when every applicable check is ungated or satisfied; a product of `1` and/or
 *   `MATERIAL_ABSENT_GATE` per failing check otherwise.
 */
function materialAccessGate(
	technique: DecorativeTechniqueDefinition,
	culture: CulturalProfile,
	geology: GeologicalContext,
	trade: readonly MaterialFlow[],
	materials: readonly MaterialDefinition[],
): number {
	let gate = 1;

	if (technique.substrate.kind === 'material') {
		const substrate = technique.substrate;
		const hasSubstrateAccess = materials.some((material) =>
			bestMaterialAffinity(material, culture) > 1 &&
			isAvailable(material, geology, trade) &&
			substrate.test(material)
		);
		if (!hasSubstrateAccess) gate *= MATERIAL_ABSENT_GATE;
	}

	const introducedTags = INTRODUCED_MATERIAL_TAGS[technique.technique];
	if (technique.introducesMaterial && introducedTags !== null) {
		const hasIntroducedAccess = hasIntroducedMaterialAccess(
			introducedTags,
			geology,
			trade,
			materials,
		);
		if (!hasIntroducedAccess) gate *= MATERIAL_ABSENT_GATE;
	}

	return gate;
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
 *    `decorationVolume`'s effect on how *many* techniques are picked.
 *
 * Does not read `craftSpecialisation` — a technique's *selection* weight is driven by cultural
 * preference, material access, gating technology and aesthetic emphasis alone. Craft instead
 * determines how well the selected technique is *executed*, via `computeLayerGrade` below,
 * applied once selection has already happened (roadmap 2GN.98, doc 11 §1.5).
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

/** MVP-provisional base fill probability for a category's first slot, scaled by `decorationVolume` below. */
const BASE_FILL_PROBABILITY = 0.9;

/** MVP-provisional per-slot decay: each successive slot within a category is progressively less likely to fill, mirroring `grammar.ts`'s attachment-depth decay shape. */
const SLOT_DECAY = 0.5;

/**
 * How strongly a phase drives decorative volume — how MUCH decoration appears, not how well it's
 * executed (roadmap 2GN.98, doc 11 §1.5). Reads `aesthetics.decorativeEmphasis` alone.
 *
 * Does **not** read `craftSpecialisation`, unlike the equal-weight blend this superseded. Doc 05
 * §8.3's four-corner craft/emphasis table cannot be satisfied by any single scalar over both
 * attributes: measurement (doc 12 §2.32) found its two middle corners — "high craft, low emphasis:
 * 0–1 layers but technically refined" vs "low craft, high emphasis: 1 layer, simple techniques" —
 * differ by *kind* (refined vs simple), not magnitude, so a shared volume term collapses them
 * together regardless of its weighting. Splitting the axes resolves this: this function answers
 * "how much" from emphasis alone, and `computeLayerGrade` below answers "how well" from craft
 * alone. `craftSpecialisation` still affects volume *indirectly*, once, through `partCount`
 * (`grammar.ts`'s `deriveComplexityBudget` — a high-craft culture's objects have more components,
 * each an independent decorative canvas here) — that is a legitimate structural effect of craft,
 * not a second volume term to reconcile with this one.
 */
function decorationVolume(phase: PhaseCharacteristics): number {
	return resolvePhaseAttribute(phase, 'aesthetics.decorativeEmphasis');
}

/**
 * How well-executed a layer of `technique` is, `0`–`1`, for a phase at `craftSpecialisation`
 * (roadmap 2GN.98, doc 11 §1.5) — realises doc 05 §8.3's "technically refined vs simple
 * techniques" distinction as a per-layer quality value, separate from `decorationVolume`'s "how
 * much decoration appears".
 *
 * `TECHNIQUE_DIFFICULTY` (`data/decorations.ts`) rates each technique's real execution difficulty,
 * authored and reviewed per-item against how the craft actually works (training time, error
 * tolerance, hand-skill demand), not derived from the catalogue's `substrate`/`carriesMotif`/
 * `introducesMaterial` flags. A hard technique's realised grade degrades faster than an easy one's
 * as craft falls — `craft * (1 - 0.5*difficulty) + 0.5*difficulty*craft²` interpolates between a
 * near-linear response for the easiest techniques (`difficulty` near 0, grade ≈ craft) and a
 * markedly super-linear one for the hardest (`difficulty` near 1, grade ≈ craft²) — a low-craft
 * culture attempting `inlay` (difficulty 0.80) produces markedly worse inlay than its craft level
 * alone would suggest, where the same culture's `roughening` (difficulty 0.10) reads close to its
 * craft level regardless.
 *
 * An earlier shape considered and rejected: biasing `computeTechniqueWeight`'s selection toward
 * low-difficulty techniques at low craft. Measured real and directional (~30% low-difficulty share
 * at low craft vs ~15–19% at high craft) but capped — the other three factors already in that
 * function's weight product dominate `weightedSelect`'s outcome and can't be out-weighted without
 * defeating their own purpose. A second shape, `grade = craftSpecialisation` alone with no
 * per-technique term, was cleanly orthogonal to volume but degenerate as a sampled feature: every
 * layer on every artefact from one culture-phase received the identical value, so a percentile
 * ladder over it (`p50 = p75 = p90`, always) answered no question. This function's per-technique
 * term is what gives `meanDecorativeGrade` (`engine/generation/classification.ts`) genuine
 * within-cell spread to sample a baseline from.
 *
 * Exported for direct testing, matching `computeTechniqueWeight`'s precedent — a per-layer formula
 * this specific is worth asserting on directly rather than only inferring from `expandDecoration`'s
 * aggregate output.
 */
export function computeLayerGrade(
	craftSpecialisation: number,
	technique: DecorativeTechnique,
	material?: MaterialDefinition,
): number {
	const difficulty = effectiveDifficulty(technique, material);
	return craftSpecialisation * (1 - 0.5 * difficulty) +
		0.5 * difficulty * craftSpecialisation ** 2;
}

/**
 * The midpoint and half-range of each material axis, used to normalise a raw score to roughly
 * `[-1, +1]` before weighting (roadmap 2GN.99). `hardness` spans 1–10 (Mohs-pegged) while the rest
 * span 1–7, so they cannot share one normalisation — hence the per-axis table rather than a single
 * divisor.
 *
 * `oxidisation` is normalised across `0`–`7` only. Its `-1` sentinel never reaches here: a material
 * with no oxidation chemistry fails `patina`'s substrate gate outright, which is the whole reason
 * the sentinel is a gate rather than an extreme difficulty value.
 */
const AXIS_NORMALISATION: Readonly<Record<MaterialDifficultyAxis, { mid: number; half: number }>> =
	{
		hardness: { mid: 5.5, half: 4.5 },
		fragility: { mid: 4, half: 3 },
		rigidity: { mid: 4, half: 3 },
		grainFineness: { mid: 4, half: 3 },
		porosity: { mid: 4, half: 3 },
		oxidisation: { mid: 3.5, half: 3.5 },
	};

/**
 * The floor `effectiveDifficulty` clamps to, rather than `0` (roadmap 2GN.99). A favourable material
 * can push a low-baseline technique's difficulty negative — 22 of the 256 technique × material pairs
 * do — and clamping those to zero would claim the work is *perfectly* easy, with craft irrelevant to
 * the result. No real craft behaves that way: roughening a forgiving material still rewards a
 * practised hand over an unpractised one. Small enough that the favourable material still reads as
 * markedly easier, non-zero so `craftSpecialisation` never stops mattering.
 */
const MINIMUM_DIFFICULTY = 0.05;

/** Reads one material axis, bridging the two homes those axes live in (`physicalProperties`, `reactivity`). */
function axisValue(material: MaterialDefinition, axis: MaterialDifficultyAxis): number {
	return axis === 'oxidisation'
		? material.reactivity.oxidisation
		: material.physicalProperties[axis];
}

/**
 * A technique's difficulty against a specific material (roadmap 2GN.99): its authored
 * `TECHNIQUE_DIFFICULTY` baseline shifted by `TECHNIQUE_MATERIAL_SENSITIVITY`, clamped to `[0, 1]`.
 *
 * Modulating *difficulty* rather than the resulting grade is deliberate. It keeps the `[0, 1]` bound
 * without clamping the output, it preserves the "harder techniques degrade faster as craft falls"
 * curve `computeLayerGrade` documents, and it makes the physical claim correctly: a difficult
 * material makes a technique behave *like a harder technique*. Scaling the grade instead would mean
 * a flawless craftsman could never execute flawlessly on hard material, which the field's
 * "how well was this executed" semantics do not support.
 *
 * With no material supplied, returns the bare baseline — the value `expandDecoration` uses, since
 * materials are not known at expansion time.
 */
function effectiveDifficulty(
	technique: DecorativeTechnique,
	material: MaterialDefinition | undefined,
): number {
	const baseline = TECHNIQUE_DIFFICULTY[technique];
	if (material === undefined) return baseline;

	let shift = 0;
	for (const [axis, weight] of Object.entries(TECHNIQUE_MATERIAL_SENSITIVITY[technique])) {
		const { mid, half } = AXIS_NORMALISATION[axis as MaterialDifficultyAxis];
		shift += weight * ((axisValue(material, axis as MaterialDifficultyAxis) - mid) / half);
	}

	return Math.min(1, Math.max(MINIMUM_DIFFICULTY, baseline + shift));
}

const DECORATIVE_CATEGORIES = ['surface-treatment', 'applied-element', 'textile-element'] as const;

/**
 * Expands the decorative grammar over an artefact (doc 05 §8.1–§8.3, roadmap 2GN.29): iterates
 * every component as a decorative canvas and selects zero-or-more techniques per BNF category
 * (`<decoration> ::= <surface-treatment>* <applied-element>* <textile-element>*`, doc 05 §8.2),
 * weighted by `computeTechniqueWeight`, each selected layer's `grade` set by `computeLayerGrade`.
 * Returns a flat `DecorativeLayer[]` — one entry per selected technique, every entry's `sublayers`
 * empty, `motifRef`/`material` omitted (module JSDoc's scope boundary: layering is 2GN.31, motif
 * and introduced-material assignment is `assignDecorativeDetails` below; substrate enforcement that
 * would strip invalid technique/component pairings is 2GN.30).
 *
 * Component iteration follows `artefact.components` order; per component, the three BNF categories
 * fill in fixed order (surface-treatment, applied-element, textile-element). Each category
 * independently draws up to `MAX_SLOTS_PER_CATEGORY` slots: a slot fills when one `prng()` draw
 * falls under `BASE_FILL_PROBABILITY * decorationVolume(phase) * SLOT_DECAY ** slotIndex`,
 * consuming a second `prng()` draw via `weightedSelect` to choose which technique fills it; the
 * first missed slot stops that category's fill (mirrors `grammar.ts`'s attachment-depth decay). A
 * category whose candidate pool is empty (a truncated injected `techniques` catalogue) is skipped
 * entirely rather than calling `weightedSelect` on an empty list. Component-then-category-then-slot
 * order, with a fixed one-or-two-draw cost per slot (`grade` costs no extra draw — it's a pure
 * function of the phase and the already-selected technique), is the determinism contract: the same
 * seed against the same artefact/culture/phase always produces the identical draw sequence and
 * layer list.
 *
 * Pure and side-effect-free: never mutates `artefact`, `culture`, `phase`, `materials` or
 * `techniques`.
 *
 * @param artefact - The normalised artefact whose components are the decorative canvases.
 * @param culture - The producing culture's profile — `techniqueAffinities` biases *which*
 *   techniques are favoured, `materialAffinities` feeds the material-access gate. Motif vocabulary
 *   is deliberately unread here — that's `assignDecorativeDetails`' job.
 * @param phase - The phase whose `technology` and `aesthetics` attributes bias technique weight and
 *   volume (`aesthetics.decorativeEmphasis`), and whose `society.craftSpecialisation` sets each
 *   selected layer's `grade`.
 * @param geology - World-level material scarcity, read by the material-access gate.
 * @param trade - Material flows reachable through cultural relationships, read by the gate.
 * @param prng - A generator from `createPrng`; determinism flows from it alone.
 * @param materials - The candidate material catalogue the gate checks against. Defaults to the
 *   shipped `MATERIALS`.
 * @param techniques - The candidate technique catalogue. Defaults to the shipped
 *   `DECORATIVE_TECHNIQUES`.
 * @returns The flat list of selected decorative layers, in component-then-category-then-slot
 *   emission order.
 */
export function expandDecoration(
	artefact: NormalisedArtefact,
	culture: CulturalProfile,
	phase: PhaseCharacteristics,
	geology: GeologicalContext,
	trade: readonly MaterialFlow[],
	prng: () => number,
	materials: readonly MaterialDefinition[] = MATERIALS,
	techniques: readonly DecorativeTechniqueDefinition[] = DECORATIVE_TECHNIQUES,
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

	const volume = decorationVolume(phase);
	const layers: DecorativeLayer[] = [];

	for (const component of artefact.components) {
		for (const category of DECORATIVE_CATEGORIES) {
			const pool = pools[category];
			if (pool.length === 0) continue; // Truncated injected catalogue — skip, never throw.

			for (let slot = 0; slot < MAX_SLOTS_PER_CATEGORY; slot++) {
				const fillChance = BASE_FILL_PROBABILITY * volume * SLOT_DECAY ** slot;
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
					grade: computeLayerGrade(phase.society.craftSpecialisation, selected.technique),
					sublayers: [],
				});
			}
		}
	}

	return layers;
}

/**
 * One exchange partner's contribution to a culture's borrowable motif pool (doc 05 §8.5, roadmap
 * 2GN.33). Pre-resolved by the caller, following the `trade: MaterialFlow[]` precedent: whoever
 * assembles the production context (Milestone 3's world-state integration) filters
 * `CultureRelationship.phases` down to relationships whose window covers the production year and
 * whose `culturalExchange.domains` includes `'motifs'`, then passes the partner's vocabulary and
 * the window's `culturalExchange.intensity` here. This module stays free of temporal logic.
 */
export interface SharedMotifSource {
	/** The exchange partner's borrowable motifs — each keeps its own true `culturalOrigin`. */
	motifs: readonly MotifDefinition[];

	/** The relationship window's `culturalExchange.intensity` (0–1), weighting every motif in `motifs`. */
	intensity: number;
}

/** A motif candidate in the combined native-plus-borrowed selection pool, carrying its weight. */
interface MotifCandidate {
	motif: MotifDefinition;
	weight: number;
}

/**
 * Builds the combined motif selection pool (doc 05 §8.5): every native motif at weight `1`, every
 * borrowed motif at its source's exchange intensity. At full intensity a borrowed motif is
 * indistinguishable from a native one — the maximum-ambiguity reading of §8.5's "is this artefact
 * from Culture A, or from Culture B using borrowed motifs?". A partner with a larger vocabulary
 * contributes proportionally more total borrowing probability (per-motif weighting, a deliberate
 * choice over per-source normalisation).
 *
 * Zero-intensity sources are excluded from the pool entirely rather than entered at weight `0`:
 * `weightedSelect` falls back to a uniform draw over a zero-total-weight pool, so a weight-`0`
 * candidate alongside an empty native vocabulary could otherwise be *selected* — inverting what
 * intensity `0` means. Excluded, the pool is genuinely empty in that case and `motifRef` is
 * omitted per the honest-degradation contract.
 */
function buildMotifPool(
	culture: CulturalProfile,
	sharedMotifSources: readonly SharedMotifSource[],
): MotifCandidate[] {
	const pool: MotifCandidate[] = culture.motifVocabulary.motifs.map((motif) => ({
		motif,
		weight: 1,
	}));

	for (const source of sharedMotifSources) {
		if (source.intensity <= 0) continue;
		for (const motif of source.motifs) {
			pool.push({ motif, weight: source.intensity });
		}
	}

	return pool;
}

/**
 * Resolves the introduced-material candidate list for one material-introducing technique: the
 * catalogue filtered by `INTRODUCED_MATERIAL_TAGS`, then by availability, with `assignMaterial`'s
 * exact fallback — if availability excludes every tagged candidate, availability yields (it is a
 * preference at MVP, not a hard requirement) and the tagged list is used unfiltered. An empty
 * result (an injected catalogue with no tagged material at all) means the layer's `material` is
 * omitted rather than fabricated.
 */
function introducedMaterialCandidates(
	technique: DecorativeTechnique,
	geology: GeologicalContext,
	trade: readonly MaterialFlow[],
	materials: readonly MaterialDefinition[],
): readonly MaterialDefinition[] {
	const tags = INTRODUCED_MATERIAL_TAGS[technique];
	const tagged = tags === null
		? materials // Injected catalogue disagrees with the shipped flags — no tag constraint.
		: materials.filter((material) => material.tags.some((tag) => tags.includes(tag)));

	const available = tagged.filter((material) => isAvailable(material, geology, trade));

	return available.length > 0 ? available : tagged;
}

/**
 * Fills the decorative layers' grammar arguments (doc 05 §8.2, §8.5, roadmap 2GN.33): a `motifRef`
 * for every layer whose technique carries a `<motif>` argument, drawn from the producing culture's
 * `motifVocabulary` plus motifs borrowed through cultural exchange, and a `material` for every
 * layer whose technique introduces one, drawn from the per-technique candidates in
 * `INTRODUCED_MATERIAL_TAGS` weighted by the same `computeMaterialWeight` product (cultural
 * affinity × phase technology × scarcity) every other material choice uses.
 *
 * A separate pass over `expandDecoration`'s output rather than part of it (module JSDoc): the
 * eventual pipeline orders it after 2GN.30's substrate stripping so no draws are wasted on
 * stripped layers, and `expandDecoration`'s draw-sequence contract stays untouched. Recurses
 * depth-first into `sublayers` (own fields before sublayers), so it stays correct once layering
 * (2GN.31/2GN.32) lands.
 *
 * **Determinism contract**: layers are processed in input order; per layer, at most one `prng()`
 * draw for the motif (motif-carrying technique, non-empty pool) then at most one for the material
 * (material-introducing technique, non-empty candidates), then the layer's sublayers in order.
 * Same seed against the same inputs always produces the identical draw sequence.
 *
 * **Honest degradation** (the no-producer-defaults precedent, 2GN.19): an empty motif pool — a
 * culture with no motifs and no shared sources — leaves `motifRef` absent rather than throwing or
 * fabricating. The docs imply a real generated world never contains a motif-less culture (doc 05
 * §8.5 calls motifs the primary cultural fingerprint; doc 06's `decorative-mismatch` strain
 * assumes motif attribution works), but that invariant belongs to Milestone 3's culture
 * *generator*; the type permits emptiness and fixtures may pass it, so this per-artefact pass
 * degrades gracefully. Likewise an empty introduced-material candidate list leaves `material`
 * absent, and a technique missing from the injected `techniques` catalogue is passed through
 * untouched. Layers are expected fresh from `expandDecoration` (no pre-filled `motifRef`/
 * `material`); pre-filled values are overwritten, not preserved.
 *
 * Pure and side-effect-free: returns new layer objects throughout, never mutates its inputs.
 *
 * @param layers - Decorative layers to resolve, typically `expandDecoration`'s output.
 * @param culture - The producing culture, supplying the native `motifVocabulary` and the material
 *   affinities `computeMaterialWeight` reads.
 * @param phase - The phase whose `technology` attributes weight introduced-material selection.
 * @param geology - World-level material scarcity, for availability and scarcity weighting.
 * @param trade - Material flows reachable through cultural relationships.
 * @param sharedMotifSources - Pre-resolved exchange partners' borrowable motifs (see
 *   `SharedMotifSource` for what the caller must have already filtered).
 * @param prng - A generator from `createPrng`; determinism flows from it alone.
 * @param materials - The candidate material catalogue. Defaults to the shipped `MATERIALS`.
 * @param techniques - The technique catalogue supplying `carriesMotif`/`introducesMaterial` flags.
 *   Defaults to the shipped `DECORATIVE_TECHNIQUES`.
 * @returns New layers mirroring `layers` in structure and order, grammar arguments filled.
 */
export function assignDecorativeDetails(
	layers: readonly DecorativeLayer[],
	culture: CulturalProfile,
	phase: PhaseCharacteristics,
	geology: GeologicalContext,
	trade: readonly MaterialFlow[],
	sharedMotifSources: readonly SharedMotifSource[],
	prng: () => number,
	materials: readonly MaterialDefinition[] = MATERIALS,
	techniques: readonly DecorativeTechniqueDefinition[] = DECORATIVE_TECHNIQUES,
): DecorativeLayer[] {
	const definitions = new Map<DecorativeTechnique, DecorativeTechniqueDefinition>(
		techniques.map((definition) => [definition.technique, definition]),
	);
	const motifPool = buildMotifPool(culture, sharedMotifSources);
	const candidateCache = new Map<DecorativeTechnique, readonly MaterialDefinition[]>();

	function resolveLayer(layer: DecorativeLayer): DecorativeLayer {
		const definition = definitions.get(layer.technique);
		// Pre-filled motifRef/material are overwritten, not preserved (see docstring) — delete both
		// keys up front so an empty pool/candidate list on a re-resolved layer goes absent rather
		// than silently keeping a stale value through the spread below. A key set to `undefined`
		// still satisfies `'motifRef' in resolved`, so the field must be deleted, not nulled.
		const resolved: DecorativeLayer = { ...layer };
		delete resolved.motifRef;
		delete resolved.material;

		if (definition?.carriesMotif && motifPool.length > 0) {
			resolved.motifRef = weightedSelect(motifPool, prng, (candidate) => candidate.weight)
				.motif.id;
		}

		if (definition?.introducesMaterial) {
			let candidates = candidateCache.get(layer.technique);
			if (candidates === undefined) {
				candidates = introducedMaterialCandidates(layer.technique, geology, trade, materials);
				candidateCache.set(layer.technique, candidates);
			}

			if (candidates.length > 0) {
				resolved.material = weightedSelect(
					candidates,
					prng,
					(material) => computeMaterialWeight(material, culture, phase, geology),
				).id;
			}
		}

		resolved.sublayers = layer.sublayers.map(resolveLayer);

		return resolved;
	}

	return layers.map(resolveLayer);
}

/**
 * Re-grades every layer against the material its target component was actually assigned (roadmap
 * 2GN.99) — a separate pass over `expandDecoration`'s output, mirroring `assignDecorativeDetails`'
 * position rather than folding into expansion.
 *
 * **Why a post-pass and not a parameter on `expandDecoration`.** Materials are not known when layers
 * are created: `expandDecoration` iterates `NormalisedComponent`s, which carry
 * `allowedMaterialTags` (the candidate set, and stubbed empty until roadmap 2GN.10) but no assigned
 * material. The assignment lives in a parallel `MaterialAssignment[]` from `assignMaterials`, and
 * threading that in would force every caller to run material assignment first — which consumes PRNG
 * draws, so it would perturb the decoration draw sequence and move every recorded fire rate for
 * reasons having nothing to do with grade. Splitting the pass keeps `expandDecoration`'s
 * "grade costs no extra draw" contract exactly true, and leaves the Stage 6 → Stage 7 ordering
 * decision to whoever builds the real pipeline.
 *
 * The grade `expandDecoration` emits is therefore *provisional* — the technique-only value a layer
 * carries before materials are known. This function replaces it with the material-aware one.
 *
 * **PRNG-free**, so it can be applied at any point without disturbing determinism. Pure: returns new
 * layer objects and never mutates its inputs, matching `assignDecorativeDetails`.
 *
 * A layer whose `targetComponentId` has no assignment, or whose assigned `materialId` is not in
 * `materials`, keeps its existing provisional grade rather than being dropped or zeroed — the same
 * honest-degradation contract `assignDecorativeDetails` applies to an empty motif pool.
 *
 * @param layers - Layers from `expandDecoration` (or a later pass over them).
 * @param assignments - Per-component material assignments from `assignMaterials`.
 * @param phase - The producing phase, supplying `society.craftSpecialisation`.
 * @param materials - Catalogue to resolve `materialId` against. Defaults to the shipped `MATERIALS`.
 * @returns New layers, identical but for `grade`, recursing through `sublayers`.
 */
export function gradeDecorativeLayers(
	layers: readonly DecorativeLayer[],
	assignments: readonly MaterialAssignment[],
	phase: PhaseCharacteristics,
	materials: readonly MaterialDefinition[] = MATERIALS,
): DecorativeLayer[] {
	const byId = new Map(materials.map((material) => [material.id, material]));
	const componentMaterial = new Map<string, MaterialDefinition>();
	for (const assignment of assignments) {
		const material = byId.get(assignment.materialId);
		if (material !== undefined) componentMaterial.set(assignment.componentId, material);
	}

	const craftSpecialisation = phase.society.craftSpecialisation;

	function regrade(layer: DecorativeLayer): DecorativeLayer {
		const material = componentMaterial.get(layer.targetComponentId);

		return {
			...layer,
			grade: material === undefined
				? layer.grade
				: computeLayerGrade(craftSpecialisation, layer.technique, material),
			sublayers: layer.sublayers.map(regrade),
		};
	}

	return layers.map(regrade);
}
