/**
 * Material-assignment model for the material viewer panel (roadmap 2GN.60).
 *
 * Resolves a material for every component of one artefact, and describes the candidate field each
 * draw was made from: which materials are obtainable, how heavily each is weighted — decomposed
 * into its cultural-affinity, phase-technology and scarcity factors — and, when a material is only
 * reachable because a trade flow rescued it, that fact (roadmap 2GN.74).
 *
 * Obtainability is derived entirely from `explainMaterialWeight`'s per-material read, not
 * re-derived here — a previous version of this module re-implemented `isAvailable`'s region logic
 * locally (`levelOf`/`classify`) but read only the culture's *first* region where the engine reads
 * the *best* across all regions, a divergence that stayed invisible only because explorer presets
 * author exactly one region each. Obtainability now has one source of truth.
 *
 * **`candidates` stays culture-wide, not filtered down to one component's compatible set** —
 * `assignMaterial` filters its own candidate pool by `component.allowedMaterialTags` before
 * weighting anything, but this module's `candidates` table deliberately doesn't: it's the panel's
 * one whole-culture obtainability view (roadmap 2GN.60's original design), not a per-component
 * table, and splitting it per component would be a panel redesign, not a filter fix. Instead
 * (roadmap 2GN.10) each candidate now carries `compatibleComponentCount` — how many of this
 * artefact's components could actually draw it — so the panel can show a material as
 * culturally/geologically obtainable yet shape-incompatible with everything present, which
 * `allowedMaterialTags` being real (rather than the old all-permissive `[]` stub) now makes
 * possible. `materialAssignment.test.ts` covers this field directly.
 *
 * **Every draw goes through the engine's `assignMaterials`** (roadmap 2GN.27), never a per-component
 * `assignMaterial` call. `assignMaterials` opens with a per-artefact stratum draw that boosts prized
 * materials for an elite artefact and suppresses them for a commoner one, and a per-component call
 * with no stratum reads the unmodulated culture-wide weights, which is a distribution the pipeline
 * never produces (measured at roughly double the pipeline's prized-material rate before this was
 * fixed). The canonical assignment uses the `${seed}-materials` stream, the same one the tag
 * inspector and the decoration panel use, so the three panels resolve the same materials for the
 * same seed; the per-component distribution redraws the whole artefact under fresh streams, so it
 * mixes elite and commoner draws in the proportion `eliteShare` reports.
 *
 * Pure, no DOM/Svelte, so it's unit-testable directly per the `structureTree.ts` precedent.
 */

import { createPrng } from '../../../../lib/engine/prng.ts';
import { expandGrammar, normaliseArtefact } from '../../../../lib/engine/generation/grammar.ts';
import {
	assignMaterials as drawAssignments,
	eliteShare,
	explainMaterialWeight,
	materialStanding,
} from '../../../../lib/engine/generation/materials.ts';
import { CORE_GRAMMAR_RULES } from '../../../../lib/data/grammars/core.ts';
import { MATERIALS, STANDING_CUT } from '../../../../lib/data/materials.ts';
import type { MaterialDefinition, NormalisedArtefact } from '../../../../lib/types/artefact.ts';
import type { AvailabilityLevel } from '../../../../lib/types/world.ts';
import type { MaterialName } from '../../../../lib/types/tags.ts';
import type { ExplorerCulture } from '../../../../lib/data/explorer-cultures.ts';

/** Why a material is or isn't obtainable for a culture. */
export type Obtainability =
	/** Locally present at `abundant`, `available` or `scarce`. */
	| 'local'
	/** `trade-only` locally, but a trade flow reaches it. */
	| 'trade'
	/** `trade-only` with no matching flow, or `absent`. */
	| 'blocked'
	/** Carries no entry in this geology — `isAvailable` is lenient. Explorer presets never hit this. */
	| 'unmodelled';

/** One material's standing in the candidate field. */
export interface CandidateMaterial {
	material: MaterialDefinition;

	/** This material's best availability level across regions, or `undefined` when unmodelled. */
	level: AvailabilityLevel | undefined;

	obtainability: Obtainability;

	/** `isAvailable`'s verdict — `true` for everything except `blocked`. */
	available: boolean;

	/** Combined selection weight. `0` when not obtainable, since it never enters the draw. */
	weight: number;

	/** `weight` over the heaviest obtainable candidate's weight, in `[0, 1]`. For bar widths. */
	share: number;

	/** Cultural-affinity factor of `weight` (`explainMaterialWeight`). Not zeroed when blocked. */
	culturalAffinity: number;

	/** Phase-technology factor of `weight` (`explainMaterialWeight`). Not zeroed when blocked. */
	phaseTechnology: number;

	/** Scarcity factor of `weight` (`explainMaterialWeight`). Not zeroed when blocked. */
	scarcity: number;

	/**
	 * The material's standing in this culture (`materialStanding`, roadmap 2GN.27): availability⁻¹
	 * × cultural affinity, neutral at 1. Not a factor of `weight`; it decides which candidates the
	 * stratum draw moves.
	 */
	standing: number;

	/** Whether `standing` clears `STANDING_CUT`, so the stratum draw boosts or suppresses this candidate. */
	prized: boolean;

	/**
	 * How many of this artefact's components could actually draw this material, i.e. carry it in
	 * their `allowedMaterialTags` (roadmap 2GN.10). `0` means shape-incompatible with every
	 * component present, even when culturally/geologically obtainable — a material an artefact of
	 * this shape simply cannot be made from, distinct from `obtainability: 'blocked'`, which is
	 * about the culture rather than the shape.
	 */
	compatibleComponentCount: number;
}

/** One component's resolved material, plus how often it wins across repeated draws. */
export interface ComponentAssignment {
	componentId: string;

	/** Short display id (`c0`, `c1`…), matching the structure viewer. */
	shortId: string;

	primitiveType: string;

	/** The material drawn for the panel's canonical (first) assignment. */
	resolved: MaterialDefinition;

	/**
	 * Empirical distribution over repeated draws: material id → share of draws, strongest first.
	 * Mirrors `scripts/dev/sample-materials.ts --draws`, and is the honest way to show culture bias
	 * without decomposing the weight formula.
	 */
	distribution: { materialId: MaterialName; displayName: string; share: number }[];
}

/** The render model for one artefact's material assignment. */
export interface MaterialAssignmentModel {
	artefact: NormalisedArtefact;
	assignments: ComponentAssignment[];

	/** Every shipped material with its standing for this culture, heaviest obtainable first. */
	candidates: CandidateMaterial[];

	/** How many draws the distribution was sampled over. */
	draws: number;

	/**
	 * The probability that an artefact from this culture-phase was made for the elite
	 * (`eliteShare`, roadmap 2GN.27): the share of `draws` in which prized candidates were boosted
	 * rather than suppressed.
	 */
	eliteShare: number;
}

/**
 * Classifies why a material is or isn't reachable, from `explainMaterialWeight`'s read. `isAvailable`
 * collapses local presence and trade rescue into one boolean; this splits them back out so the panel
 * can say *why*.
 */
function classify(
	level: AvailabilityLevel | undefined,
	available: boolean,
	tradeRescued: boolean,
): Obtainability {
	if (level === undefined) return 'unmodelled';
	if (!available) return 'blocked';
	if (tradeRescued) return 'trade';

	return 'local';
}

/**
 * Generates one artefact from `seed` against `culture` and resolves a material per component.
 *
 * @param seed - The seed to generate from; also namespaces the assignment draws (`${seed}-materials`
 *   for the canonical assignment, `${seed}-materials-redraw-${n}` for each redraw).
 * @param culture - The culture, phase, geology and trade flows to assign against.
 * @param draws - How many times to repeat assignment for the empirical distribution. Values below
 *   `1` are treated as `1`, so the canonical assignment always exists.
 */
export function assignMaterials(
	seed: string,
	culture: ExplorerCulture,
	draws = 200,
): MaterialAssignmentModel {
	const prng = createPrng(seed);
	const expanded = expandGrammar(CORE_GRAMMAR_RULES, culture.profile, culture.phase, prng);
	const artefact = normaliseArtefact(expanded, `materials-${seed}`);

	const sampleCount = Math.max(1, Math.floor(draws) || 1);

	const candidates: CandidateMaterial[] = MATERIALS.map((material) => {
		const explanation = explainMaterialWeight(
			material,
			culture.profile,
			culture.phase,
			culture.geology,
			culture.trade,
		);
		const obtainability = classify(
			explanation.level,
			explanation.available,
			explanation.tradeRescued,
		);
		const weight = obtainability === 'blocked' ? 0 : explanation.weight;

		const compatibleComponentCount = artefact.components.filter(
			(component) =>
				component.allowedMaterialTags.length === 0 ||
				material.tags.some((tag) => component.allowedMaterialTags.includes(tag)),
		).length;

		const standing = materialStanding(material, culture.profile, culture.phase, culture.geology);

		return {
			material,
			level: explanation.level,
			obtainability,
			available: explanation.available,
			weight,
			share: 0,
			culturalAffinity: explanation.culturalAffinity,
			phaseTechnology: explanation.phaseTechnology,
			scarcity: explanation.scarcity,
			standing,
			prized: standing >= STANDING_CUT,
			compatibleComponentCount,
		};
	});

	const heaviest = Math.max(0, ...candidates.map((c) => c.weight));
	for (const candidate of candidates) {
		candidate.share = heaviest === 0 ? 0 : candidate.weight / heaviest;
	}
	candidates.sort((a, b) => b.weight - a.weight);

	// Whole-artefact draws through the engine, so every redraw carries its own stratum. Draw 0 is
	// the canonical assignment on the `${seed}-materials` stream the other panels share; the rest
	// take their own streams rather than continuing that one, so the canonical draw stays
	// bit-identical whatever `draws` is set to.
	const drawArtefact = (stream: string) =>
		drawAssignments(
			artefact,
			culture.profile,
			culture.phase,
			culture.geology,
			culture.trade,
			createPrng(stream),
			MATERIALS,
		);
	const canonical = drawArtefact(`${seed}-materials`);
	const tallies = artefact.components.map(() => new Map<MaterialName, number>());
	const tallyDraw = (drawn: readonly { materialId: MaterialName }[]) => {
		drawn.forEach((assignment, index) => {
			const tally = tallies[index];
			tally.set(assignment.materialId, (tally.get(assignment.materialId) ?? 0) + 1);
		});
	};
	tallyDraw(canonical);
	for (let draw = 1; draw < sampleCount; draw++) {
		tallyDraw(drawArtefact(`${seed}-materials-redraw-${draw}`));
	}

	const assignments = artefact.components.map((component, index) => {
		const resolved = MATERIALS.find((m) => m.id === canonical[index].materialId)!;
		const distribution = [...tallies[index].entries()]
			.map(([materialId, count]) => ({
				materialId,
				displayName: MATERIALS.find((m) => m.id === materialId)?.displayName ?? materialId,
				share: count / sampleCount,
			}))
			.sort((a, b) => b.share - a.share);

		return {
			componentId: component.id,
			shortId: `c${component.position}`,
			primitiveType: component.primitiveType,
			resolved,
			distribution,
		};
	});

	return {
		artefact,
		assignments,
		candidates,
		draws: sampleCount,
		eliteShare: eliteShare(culture.phase),
	};
}
