/**
 * Material-assignment model for the material viewer panel (roadmap 2GN.60).
 *
 * Resolves a material for every component of one artefact, and describes the candidate field each
 * draw was made from: which materials are obtainable, how heavily each is weighted, and — when a
 * material is only reachable because a trade flow rescued it — that fact.
 *
 * **Weight factors are not decomposed.** The roadmap line asks for a "scarcity vs affinity vs
 * trade" breakdown, which the engine cannot currently supply: `computeMaterialWeight` returns the
 * product of three private helpers, and their tuning constants are unexported module-level values
 * the engine JSDoc explicitly expects to retune. Recomputing them here would fossilise those
 * numbers in a second place. Exposing them is its own roadmap task; until then this module reports
 * the combined weight (as a normalised share) plus the availability reason, both of which are
 * exact. Trade is reported as a reason rather than a weight, because that is what it is — a
 * boolean rescue inside `isAvailable`, not a multiplier.
 *
 * Pure, no DOM/Svelte, so it's unit-testable directly per the `structureTree.ts` precedent.
 */

import { createPrng } from '../../../../lib/engine/prng.ts';
import { expandGrammar, normaliseArtefact } from '../../../../lib/engine/generation/grammar.ts';
import {
	assignMaterial,
	computeMaterialWeight,
	isAvailable,
} from '../../../../lib/engine/generation/materials.ts';
import { CORE_GRAMMAR_RULES } from '../../../../lib/data/grammars/core.ts';
import { MATERIALS } from '../../../../lib/data/materials.ts';
import type { MaterialDefinition, NormalisedArtefact } from '../../../../lib/types/artefact.ts';
import type { AvailabilityLevel } from '../../../../lib/types/world.ts';
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

	/** This material's level in the culture's single region, or `undefined` when unmodelled. */
	level: AvailabilityLevel | undefined;

	obtainability: Obtainability;

	/** `isAvailable`'s verdict — `true` for everything except `blocked`. */
	available: boolean;

	/** Combined selection weight. `0` when not obtainable, since it never enters the draw. */
	weight: number;

	/** `weight` over the heaviest obtainable candidate's weight, in `[0, 1]`. For bar widths. */
	share: number;
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
	distribution: { materialId: string; displayName: string; share: number }[];
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

/** Reads a material's level in the culture's geology, if it carries one. */
function levelOf(materialId: string, culture: ExplorerCulture): AvailabilityLevel | undefined {
	const entry = culture.geology.materialAvailability.get(materialId);
	if (entry === undefined) return undefined;

	// Explorer presets author exactly one region per culture.
	const [level] = [...entry.regions.values()];
	return level;
}

/**
 * Classifies why a material is or isn't reachable. `isAvailable` collapses local presence and
 * trade rescue into one boolean; this splits them back out so the panel can say *why*.
 */
function classify(
	material: MaterialDefinition,
	culture: ExplorerCulture,
	available: boolean,
): { level: AvailabilityLevel | undefined; obtainability: Obtainability } {
	const level = levelOf(material.id, culture);

	if (level === undefined) return { level, obtainability: 'unmodelled' };
	if (!available) return { level, obtainability: 'blocked' };
	if (level === 'trade-only') return { level, obtainability: 'trade' };

	return { level, obtainability: 'local' };
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
		const available = isAvailable(material, culture.geology, culture.trade);
		const { level, obtainability } = classify(material, culture, available);
		const weight = obtainability === 'blocked'
			? 0
			: computeMaterialWeight(material, culture.profile, culture.phase, culture.geology);

		return { material, level, obtainability, available, weight, share: 0 };
	});

	const heaviest = Math.max(0, ...candidates.map((c) => c.weight));
	for (const candidate of candidates) {
		candidate.share = heaviest === 0 ? 0 : candidate.weight / heaviest;
	}
	candidates.sort((a, b) => b.weight - a.weight);

	const assignments = artefact.components.map((component) => {
		const tally = new Map<string, number>();
		let resolved: MaterialDefinition | undefined;

		for (let draw = 0; draw < sampleCount; draw++) {
			const material = assignMaterial(
				component,
				culture.profile,
				culture.phase,
				culture.geology,
				culture.trade,
				MATERIALS,
				createPrng(`${seed}-material-${component.id}-${draw}`),
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
