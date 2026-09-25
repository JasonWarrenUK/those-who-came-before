/**
 * Decoration model for the decoration inspector panel (roadmap 2GN.61).
 *
 * Expands the decorative grammar over one artefact, groups the resulting layers by the component
 * they sit on, and joins each layer to its static technique definition so the panel can show the
 * technique's BNF category and its `[requires: …]` prerequisite.
 *
 * **Prerequisites are evaluated and, since roadmap 2GN.30, enforced.** `expandDecoration` still
 * emits layers whose material prerequisite may not hold; `enforceSubstrates` strips them. This
 * module keeps showing the provisional layer list with each verdict, so a developer can see what
 * the grammar rolled *and* what enforcement removed: an `unmet` layer is one `enforceSubstrates`
 * strips, and `strippedCount` is measured by running it rather than assumed from the verdicts. Form
 * prerequisites (`grippable`, `attachment-point`) pass through enforcement unevaluated, matching
 * `enforceSubstrates` itself, until roadmap 2GN.104 resolves them against component geometry. Do
 * not confuse either with `materialAccessGate`, the culture-level check inside
 * `computeTechniqueWeight`.
 *
 * **Grammar arguments are surfaced** (roadmap 2GN.150): `motifRef`/`motifCulturalOrigin` and the
 * introduced `material` that `assignDecorativeDetails` (roadmap 2GN.33/2GN.68) fills are resolved
 * to their definitions here. A motif whose origin is not the producing culture is flagged
 * `borrowed`; none can be today, since the Explorer passes no `SharedMotifSource`, but the flag is
 * what Milestone 3's exchange wiring lights up.
 *
 * **Layers are flat today.** `expandDecoration` always emits `sublayers: []` (roadmap 2GN.31/2GN.32
 * add nesting and a depth cap). The tree walk below is written recursion-ready so it needs no change
 * when they land, but nothing currently produces a depth above 0.
 *
 * Pure, no DOM/Svelte, so it's unit-testable directly per the `structureTree.ts` precedent.
 */

import { createPrng } from '../../../../lib/engine/prng.ts';
import { expandGrammar, normaliseArtefact } from '../../../../lib/engine/generation/grammar.ts';
import {
	assignDecorativeDetails,
	enforceSubstrates,
	expandDecoration,
} from '../../../../lib/engine/generation/decoration.ts';
import { assignMaterials, drawStratum } from '../../../../lib/engine/generation/materials.ts';
import { CORE_GRAMMAR_RULES } from '../../../../lib/data/grammars/core.ts';
import { MATERIALS } from '../../../../lib/data/materials.ts';
import { DECORATIVE_TECHNIQUES } from '../../../../lib/data/decorations.ts';
import type { MaterialDefinition, NormalisedArtefact } from '../../../../lib/types/artefact.ts';
import type {
	DecorativeLayer,
	DecorativeTechnique,
	DecorativeTechniqueDefinition,
} from '../../../../lib/types/decoration.ts';
import type { MotifDefinition } from '../../../../lib/types/world.ts';
import type { ExplorerCulture } from '../../../../lib/data/explorer-cultures.ts';

/** Whether a layer's prerequisite is met by the component it landed on. */
export type PrerequisiteVerdict =
	/** The technique has no `[requires: …]` clause. */
	| 'none'
	/** A material prerequisite the component's assigned material satisfies. */
	| 'met'
	/** A material prerequisite the component's assigned material fails — `enforceSubstrates` strips this. */
	| 'unmet'
	/** A form prerequisite; resolving it against component geometry is roadmap 2GN.104. */
	| 'unevaluated';

/** The motif a layer carries, resolved from `motifRef` (roadmap 2GN.33). */
export interface InspectedMotif {
	id: string;

	/** The motif's label, or its id when the producing culture's vocabulary doesn't hold it. */
	label: string;

	/** The `culturalOrigin` stamped at selection time — the only record for a borrowed motif. */
	origin: string;

	/** True when `origin` is not the producing culture: a motif that arrived by exchange. */
	borrowed: boolean;
}

/** One decorative layer, joined to its technique definition and checked against its substrate. */
export interface InspectedLayer {
	technique: DecorativeTechnique;

	/** Which of the three BNF productions this technique belongs to (doc 05 §8.2). */
	category: DecorativeTechniqueDefinition['category'];

	/** Human-readable prerequisite, or `undefined` when the technique has none. */
	requirement: string | undefined;

	verdict: PrerequisiteVerdict;

	/** The motif this layer carries, when its technique takes one and the pool was non-empty. */
	motif: InspectedMotif | undefined;

	/** The material this layer introduces (inlay, gilding…), when its technique takes one. */
	introducedMaterial: MaterialDefinition | undefined;

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

	/** Total layers the grammar rolled, counting any nesting, before enforcement. */
	layerCount: number;

	/** Layers whose material prerequisite is unmet — the ones `enforceSubstrates` strips. */
	unmetCount: number;

	/**
	 * Layers `enforceSubstrates` actually removed, measured by running it (roadmap 2GN.30). Equal to
	 * `unmetCount` while layers are flat; once sublayers exist a stripped parent takes its sublayers
	 * with it, so this can exceed the unmet count.
	 */
	strippedCount: number;

	/** Layers carrying a motif. */
	motifCount: number;

	/** Layers carrying a motif whose origin is not the producing culture. */
	borrowedMotifCount: number;

	/** Layers introducing a material of their own. */
	introducedMaterialCount: number;

	/** Deepest nesting reached. Always `0` until 2GN.31/2GN.32 land. */
	maxDepth: number;
}

const TECHNIQUE_INDEX = new Map<DecorativeTechnique, DecorativeTechniqueDefinition>(
	DECORATIVE_TECHNIQUES.map((definition) => [definition.technique, definition]),
);

/** Resolves a layer's motif fields against the producing culture's own vocabulary. */
function inspectMotif(
	layer: DecorativeLayer,
	cultureId: string,
	vocabulary: ReadonlyMap<string, MotifDefinition>,
): InspectedMotif | undefined {
	if (layer.motifRef === undefined) return undefined;

	const definition = vocabulary.get(layer.motifRef);
	// The stamped origin is authoritative: a borrowed motif is absent from the native vocabulary,
	// so the definition lookup can miss while the origin is still known.
	const origin = layer.motifCulturalOrigin ?? definition?.culturalOrigin ?? 'unknown';

	return {
		id: layer.motifRef,
		label: definition?.label ?? layer.motifRef,
		origin,
		borrowed: origin !== cultureId,
	};
}

/** Joins a raw layer to its technique definition, judges its prerequisite and resolves its arguments. */
function inspect(
	layer: DecorativeLayer,
	material: MaterialDefinition,
	depth: number,
	cultureId: string,
	vocabulary: ReadonlyMap<string, MotifDefinition>,
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
		motif: inspectMotif(layer, cultureId, vocabulary),
		introducedMaterial: layer.material === undefined
			? undefined
			: MATERIALS.find((m) => m.id === layer.material),
		depth,
		sublayers: layer.sublayers.map((sublayer) =>
			inspect(sublayer, material, depth + 1, cultureId, vocabulary)
		),
	};
}

/** Counts every layer in a tree, including nested ones. */
function countLayers(layers: readonly DecorativeLayer[]): number {
	return layers.reduce((total, layer) => total + 1 + countLayers(layer.sublayers), 0);
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
 * @param seed - The seed to generate from; also namespaces the material and decoration draws (the
 *   material draw is the engine's `assignMaterials` on the `${seed}-materials` stream, matching
 *   `materialAssignment.ts`'s canonical assignment exactly, so the two panels agree on the resolved
 *   material for the same seed and component).
 * @param culture - The culture, phase, geology and trade flows to generate against.
 */
export function inspectDecoration(seed: string, culture: ExplorerCulture): DecorationModel {
	const prng = createPrng(seed);
	const expanded = expandGrammar(CORE_GRAMMAR_RULES, culture.profile, culture.phase, prng);
	const artefact = normaliseArtefact(expanded, `decoration-${seed}`);

	const provisionalLayers = expandDecoration(
		artefact,
		culture.profile,
		culture.phase,
		culture.geology,
		culture.trade,
		createPrng(`${seed}-decoration`),
		MATERIALS,
		DECORATIVE_TECHNIQUES,
	);

	// One whole-artefact draw on the `${seed}-materials` stream, the same call and stream the
	// material panel's canonical assignment and the tag inspector use (roadmap 2GN.27), so the three
	// panels resolve the same material for the same seed and component and this panel's materials
	// carry the pipeline's stratum draw. Matched by index: every panel normalises the same expansion,
	// so component order is shared even though `component.id` carries each panel's own prefix.
	//
	// The stratum is drawn here, as the stream's first value, rather than left to `assignMaterials`'
	// internal draw (roadmap 2GN.68) — the identical position, so this stays bit-identical to
	// `materialAssignment.ts`'s canonical assignment for the same seed — and shared with
	// `assignDecorativeDetails` below, so this panel's layers show the material the pipeline would
	// actually resolve for this artefact's stratum, not an independently-rolled one.
	const materialPrng = createPrng(`${seed}-materials`);
	const stratum = drawStratum(materialPrng, culture.phase);
	const assignments = assignMaterials(
		artefact,
		culture.profile,
		culture.phase,
		culture.geology,
		culture.trade,
		materialPrng,
		MATERIALS,
		stratum,
	);
	const layers = assignDecorativeDetails(
		provisionalLayers,
		culture.profile,
		culture.phase,
		culture.geology,
		culture.trade,
		[],
		createPrng(`${seed}-details`),
		MATERIALS,
		DECORATIVE_TECHNIQUES,
		stratum,
	);

	// Enforcement is measured, not inferred from the verdicts: `enforceSubstrates` is the pipeline's
	// own strip (roadmap 2GN.30), so the count it reports is the truth this panel should show.
	const strippedCount = countLayers(layers) - countLayers(enforceSubstrates(layers, assignments));

	const vocabulary = new Map(
		culture.profile.motifVocabulary.motifs.map((motif) => [motif.id, motif]),
	);

	const components = artefact.components.map((component, index) => {
		const material = MATERIALS.find((m) => m.id === assignments[index].materialId)!;

		return {
			componentId: component.id,
			shortId: `c${component.position}`,
			primitiveType: component.primitiveType,
			material,
			layers: layers
				.filter((layer) => layer.targetComponentId === component.id)
				.map((layer) => inspect(layer, material, 0, culture.id, vocabulary)),
		};
	});

	let layerCount = 0;
	let unmetCount = 0;
	let motifCount = 0;
	let borrowedMotifCount = 0;
	let introducedMaterialCount = 0;
	let maxDepth = 0;
	for (const component of components) {
		walk(component.layers, (layer) => {
			layerCount++;
			if (layer.verdict === 'unmet') unmetCount++;
			if (layer.motif !== undefined) motifCount++;
			if (layer.motif?.borrowed) borrowedMotifCount++;
			if (layer.introducedMaterial !== undefined) introducedMaterialCount++;
			maxDepth = Math.max(maxDepth, layer.depth);
		});
	}

	return {
		artefact,
		components,
		layerCount,
		unmetCount,
		strippedCount,
		motifCount,
		borrowedMotifCount,
		introducedMaterialCount,
		maxDepth,
	};
}
