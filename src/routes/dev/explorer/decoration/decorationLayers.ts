/**
 * Decoration model for the decoration inspector panel (roadmap 2GN.61).
 *
 * Expands the decorative grammar over one artefact, groups the resulting layers by the component
 * they sit on, and joins each layer to its static technique definition so the panel can show the
 * technique's BNF category and its `[requires: …]` prerequisite.
 *
 * **Prerequisites are evaluated but not enforced.** `expandDecoration` deliberately emits layers
 * whose material prerequisite may not hold — enforcement is roadmap 2GN.30. This module resolves
 * the component's assigned material and runs `substrate.test` against it, so the panel can show
 * which layers *would* be rejected once that task lands. Form prerequisites (`grippable`,
 * `attachment-point`) are reported unevaluated, since resolving them against component geometry is
 * likewise 2GN.30's job. Do not confuse either with `materialAccessGate`, the culture-level check
 * inside `computeTechniqueWeight`.
 *
 * **Layers are flat today.** `expandDecoration` always emits `sublayers: []` and never sets
 * `motifRef`/`material` (roadmap 2GN.31/2GN.32 add nesting and a depth cap, 2GN.33 adds motifs).
 * The tree walk below is written recursion-ready so it needs no change when they land, but nothing
 * currently produces a depth above 0 and the dormant fields are not surfaced.
 *
 * Pure, no DOM/Svelte, so it's unit-testable directly per the `structureTree.ts` precedent.
 */

import { createPrng } from '../../../../lib/engine/prng.ts';
import { expandGrammar, normaliseArtefact } from '../../../../lib/engine/generation/grammar.ts';
import { expandDecoration } from '../../../../lib/engine/generation/decoration.ts';
import { assignMaterial } from '../../../../lib/engine/generation/materials.ts';
import { CORE_GRAMMAR_RULES } from '../../../../lib/data/grammars/core.ts';
import { MATERIALS } from '../../../../lib/data/materials.ts';
import { DECORATIVE_TECHNIQUES } from '../../../../lib/data/decorations.ts';
import type { MaterialDefinition, NormalisedArtefact } from '../../../../lib/types/artefact.ts';
import type {
	DecorativeLayer,
	DecorativeTechnique,
	DecorativeTechniqueDefinition,
} from '../../../../lib/types/decoration.ts';
import type { ExplorerCulture } from '../../../../lib/data/explorer-cultures.ts';

/** Whether a layer's prerequisite is met by the component it landed on. */
export type PrerequisiteVerdict =
	/** The technique has no `[requires: …]` clause. */
	| 'none'
	/** A material prerequisite the component's assigned material satisfies. */
	| 'met'
	/** A material prerequisite the component's assigned material fails — 2GN.30 will reject this. */
	| 'unmet'
	/** A form prerequisite; resolving it against component geometry is 2GN.30's job. */
	| 'unevaluated';

/** One decorative layer, joined to its technique definition and checked against its substrate. */
export interface InspectedLayer {
	technique: DecorativeTechnique;

	/** Which of the three BNF productions this technique belongs to (doc 05 §8.2). */
	category: DecorativeTechniqueDefinition['category'];

	/** Human-readable prerequisite, or `undefined` when the technique has none. */
	requirement: string | undefined;

	verdict: PrerequisiteVerdict;

	/** Nesting depth. Always `0` today — nothing produces sublayers until 2GN.31/2GN.32. */
	depth: number;

	/** Nested layers, recursion-ready. Always empty today. */
	sublayers: InspectedLayer[];
}

/** One component's decoration, with the material its prerequisites were judged against. */
export interface DecoratedComponent {
	componentId: string;

	/** Short display id (`c0`, `c1`…), matching the structure viewer. */
	shortId: string;

	primitiveType: string;

	/** The material assigned to this component; prerequisites are tested against it. */
	material: MaterialDefinition;

	layers: InspectedLayer[];
}

/** The render model for one artefact's decoration. */
export interface DecorationModel {
	artefact: NormalisedArtefact;

	/** One entry per component, in flattened order. Components with no layers are included. */
	components: DecoratedComponent[];

	/** Total layers across the artefact, counting any nesting. */
	layerCount: number;

	/** Layers whose material prerequisite is unmet — what 2GN.30 will reject. */
	unmetCount: number;

	/** Deepest nesting reached. Always `0` until 2GN.31/2GN.32 land. */
	maxDepth: number;
}

const TECHNIQUE_INDEX = new Map<DecorativeTechnique, DecorativeTechniqueDefinition>(
	DECORATIVE_TECHNIQUES.map((definition) => [definition.technique, definition]),
);

/** Joins a raw layer to its technique definition and judges its prerequisite. */
function inspect(
	layer: DecorativeLayer,
	material: MaterialDefinition,
	depth: number,
): InspectedLayer {
	const definition = TECHNIQUE_INDEX.get(layer.technique);
	const substrate = definition?.substrate;

	let requirement: string | undefined;
	let verdict: PrerequisiteVerdict = 'none';

	if (substrate?.kind === 'material') {
		requirement = substrate.label;
		verdict = substrate.test(material) ? 'met' : 'unmet';
	} else if (substrate?.kind === 'form') {
		requirement = `${substrate.requires} form`;
		verdict = 'unevaluated';
	}

	return {
		technique: layer.technique,
		category: definition?.category ?? 'surface-treatment',
		requirement,
		verdict,
		depth,
		sublayers: layer.sublayers.map((sublayer) => inspect(sublayer, material, depth + 1)),
	};
}

/** Walks an inspected layer tree, applying `visit` to every node. */
function walk(layers: InspectedLayer[], visit: (layer: InspectedLayer) => void): void {
	for (const layer of layers) {
		visit(layer);
		walk(layer.sublayers, visit);
	}
}

/**
 * Generates one artefact from `seed` against `culture` and inspects its decoration.
 *
 * @param seed - The seed to generate from; also namespaces the material and decoration draws.
 * @param culture - The culture, phase, geology and trade flows to generate against.
 */
export function inspectDecoration(seed: string, culture: ExplorerCulture): DecorationModel {
	const prng = createPrng(seed);
	const expanded = expandGrammar(CORE_GRAMMAR_RULES, culture.profile, culture.phase, prng);
	const artefact = normaliseArtefact(expanded, `decoration-${seed}`);

	const layers = expandDecoration(
		artefact,
		culture.profile,
		culture.phase,
		culture.geology,
		culture.trade,
		MATERIALS,
		DECORATIVE_TECHNIQUES,
		createPrng(`${seed}-decoration`),
	);

	const components = artefact.components.map((component) => {
		const material = assignMaterial(
			component,
			culture.profile,
			culture.phase,
			culture.geology,
			culture.trade,
			MATERIALS,
			createPrng(`${seed}-material-${component.id}`),
		);

		return {
			componentId: component.id,
			shortId: `c${component.position}`,
			primitiveType: component.primitiveType,
			material,
			layers: layers
				.filter((layer) => layer.targetComponentId === component.id)
				.map((layer) => inspect(layer, material, 0)),
		};
	});

	let layerCount = 0;
	let unmetCount = 0;
	let maxDepth = 0;
	for (const component of components) {
		walk(component.layers, (layer) => {
			layerCount++;
			if (layer.verdict === 'unmet') unmetCount++;
			maxDepth = Math.max(maxDepth, layer.depth);
		});
	}

	return { artefact, components, layerCount, unmetCount, maxDepth };
}
