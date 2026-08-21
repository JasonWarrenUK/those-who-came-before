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
 * Pure, no DOM/Svelte, so it's unit-testable directly per the `structureTree.ts` precedent.
 */

import { createPrng } from '../../../../lib/engine/prng.ts';
import { expandGrammar, normaliseArtefact } from '../../../../lib/engine/generation/grammar.ts';
import {
	assignMaterial,
	explainMaterialWeight,
} from '../../../../lib/engine/generation/materials.ts';
import { CORE_GRAMMAR_RULES } from '../../../../lib/data/grammars/core.ts';
import { MATERIALS } from '../../../../lib/data/materials.ts';
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
 * @param seed - The seed to generate from; also namespaces the assignment draws.
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
			compatibleComponentCount,
		};
	});

	const heaviest = Math.max(0, ...candidates.map((c) => c.weight));
	for (const candidate of candidates) {
		candidate.share = heaviest === 0 ? 0 : candidate.weight / heaviest;
	}
	candidates.sort((a, b) => b.weight - a.weight);

	const assignments = artefact.components.map((component) => {
		const tally = new Map<MaterialName, number>();
		let resolved: MaterialDefinition | undefined;

		for (let draw = 0; draw < sampleCount; draw++) {
			// Keyed by `component.position`, not `component.id`: `normaliseArtefact` prefixes
			// `component.id` with the caller's artefact id, which differs between this panel
			// (`materials-${seed}`) and the decoration panel (`decoration-${seed}`). Position is the
			// only part of a component's identity both panels agree on for the same generation seed,
			// so it's what keeps their canonical (`draw = 0`) material draws in agreement.
			const material = assignMaterial(
				component,
				culture.profile,
				culture.phase,
				culture.geology,
				culture.trade,
				createPrng(`${seed}-material-c${component.position}-${draw}`),
				MATERIALS,
			);
			if (draw === 0) resolved = material;
			tally.set(material.id, (tally.get(material.id) ?? 0) + 1);
		}

		const distribution = [...tally.entries()]
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
			resolved: resolved!,
			distribution,
		};
	});

	return { artefact, assignments, candidates, draws: sampleCount };
}
