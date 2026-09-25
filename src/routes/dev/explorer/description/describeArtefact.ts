/**
 * Description model for the description viewer panel (roadmap 2GN.160).
 *
 * Runs the full per-artefact chain for one seed — grammar, materials, decoration, features,
 * classification — assembles the result into the `ClassifiedArtefact` stage 9 consumes, and calls
 * `generateDescription` (roadmap 2GN.38) on it. The panel then shows the `ArtefactPresentation`
 * exactly as an agent would read it, grouped back under the component each observation describes.
 *
 * **What is stubbed, and why it is honest to show it.** Three inputs to stage 9 have no producer
 * yet, and this module fills each the same way the engine's own tests do rather than inventing one:
 *
 * - `provenance` is a caller-supplied stub (the 2GN.23 M2-provisional convention 2GN.38 adopted)
 *   because real provenance generation is roadmap 2GN.47, downstream of description in the
 *   dependency graph; 2GN.148 swaps the stub for the real thing. The stub mirrors
 *   `tests/fixtures/artefact.ts`'s `mockProvenance` but is authored here because route code never
 *   imports test fixtures.
 * - `physicalLabel` is empty: nothing produces it until roadmap 2GN.21, and `generateDescription`
 *   passes it through unchanged (2GN.42 composes it). The panel says so rather than showing a blank.
 * - `groundTruthTags` is the real classification result, present so the `ClassifiedArtefact` is
 *   complete — but `generateDescription` must never read it (doc 02, diegesis first), and
 *   `description.test.ts` pins that. The panel deliberately does not display it either.
 *
 * Pure, no DOM/Svelte, so it's unit-testable directly per the `structureTree.ts` precedent.
 */

import { createPrng } from '../../../../lib/engine/prng.ts';
import { expandGrammar, normaliseArtefact } from '../../../../lib/engine/generation/grammar.ts';
import {
	assignDecorativeDetails,
	expandDecoration,
	gradeDecorativeLayers,
} from '../../../../lib/engine/generation/decoration.ts';
import { assignMaterials, drawStratum } from '../../../../lib/engine/generation/materials.ts';
import {
	classifyArtefact,
	extractFeatures,
} from '../../../../lib/engine/generation/classification.ts';
import {
	generateDescription,
	REGISTER_PREFERENCE,
} from '../../../../lib/engine/generation/description.ts';
import { baselineFor } from '../shared/baselineCache.ts';
import { CORE_GRAMMAR_RULES } from '../../../../lib/data/grammars/core.ts';
import { CLASSIFICATION_RULES } from '../../../../lib/data/classification.ts';
import { MATERIALS } from '../../../../lib/data/materials.ts';
import { DECORATIVE_TECHNIQUES } from '../../../../lib/data/decorations.ts';
import type { ClassifiedArtefact, MaterialDefinition } from '../../../../lib/types/artefact.ts';
import type {
	ArtefactPresentation,
	PresentedObservation,
} from '../../../../lib/types/description.ts';
import type { DescriptionRegister } from '../../../../lib/types/lens.ts';
import type { Provenance } from '../../../../lib/types/world.ts';
import type { ExplorerCulture } from '../../../../lib/data/explorer-cultures.ts';

/** Every register an agent could hold, in the engine's own neutral preference order. */
export const ALL_REGISTERS: readonly DescriptionRegister[] = REGISTER_PREFERENCE;

/**
 * The property half of a component-scoped `propertyId` (`shape` from `desc-x-c0:shape`), for the
 * panel's per-observation label. Slices past the known component id rather than splitting on `:`:
 * the id embeds the seed, and a seed is free to contain a colon (`?seed=dig:1`).
 */
export function propertyLabel(observation: PresentedObservation, componentId: string): string {
	return observation.propertyId.slice(componentId.length + 1);
}

/** One component's observations, in the order `generateDescription` emitted them. */
export interface DescribedComponent {
	componentId: string;

	/** Short display id (`c0`, `c1`…), matching the structure viewer. */
	shortId: string;

	primitiveType: string;

	/** The material the component was assigned, which condition-gated variants read. */
	material: MaterialDefinition;

	/** Observations whose `propertyId` is scoped to this component. Empty when no template fired. */
	observations: PresentedObservation[];
}

/** The render model for one artefact's presentation. */
export interface DescriptionModel {
	/** The fully classified artefact stage 9 was given, for anything the panel wants to cross-check. */
	artefact: ClassifiedArtefact;

	/** `generateDescription`'s output, untouched. */
	presentation: ArtefactPresentation;

	/** The register `generateDescription` foregrounded from the caller's list. */
	foregroundedRegister: DescriptionRegister;

	/** One entry per component in position order, including components no template described. */
	components: DescribedComponent[];

	/** `primaryObservations.length`: every observation lands there until the lens exists (6LS). */
	observationCount: number;

	/** Observations whose `propertyId` matched no component — always empty; surfaced as a guard. */
	orphaned: PresentedObservation[];
}

/**
 * The caller-supplied provenance stub stage 9 projects until roadmap 2GN.47 generates a real one
 * (see the module doc). Named for the culture so the projection reads coherently in the panel.
 */
export function stubProvenance(culture: ExplorerCulture): Provenance {
	return {
		cultureId: culture.id,
		phaseId: culture.id, // Presets carry one phase; the id doubles as the phase id.
		year: -250,
		site: {
			// A `NameForm`, rendered as 'Tesu' — the same placeholder site `mockProvenance` uses.
			name: {
				segments: ['t', 'e', 's', 'u'],
				syllables: [2, 2],
				languageId: 'explorer-stub',
				coinedPhaseId: culture.id,
			},
			type: 'settlement',
			region: 'Stub Region',
		},
		context: {
			layer: 'layer-1',
			associatedFinds: [],
			condition: 'good',
			deposition: 'casual-discard',
		},
	};
}

/**
 * Generates one artefact from `seed` against `culture`, classifies it and describes it in the
 * register `registers` foregrounds.
 *
 * @param seed - The seed to generate from; namespaces the material, decoration and detail draws on
 *   the same streams every other panel uses, so this panel describes the artefact the structure,
 *   material, decoration and tag panels show for the same seed.
 * @param culture - The culture, phase, geology and trade flows to generate against.
 * @param registers - Registers available to the reading agent; must be non-empty
 *   (`generateDescription` throws otherwise, and the panel never offers an empty set).
 */
export function describeArtefact(
	seed: string,
	culture: ExplorerCulture,
	registers: readonly DescriptionRegister[],
): DescriptionModel {
	const prng = createPrng(seed);
	const expanded = expandGrammar(CORE_GRAMMAR_RULES, culture.profile, culture.phase, prng);
	const artefact = normaliseArtefact(expanded, `description-${seed}`);

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

	// Stratum as the first value of `${seed}-materials`, shared with `assignDecorativeDetails` — the
	// same position and stream the other panels draw from (roadmap 2GN.68), so one seed is one
	// artefact across the whole Explorer.
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
	const detailedLayers = assignDecorativeDetails(
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
	const layers = gradeDecorativeLayers(detailedLayers, assignments, culture.phase, MATERIALS);

	const features = extractFeatures(
		artefact,
		layers,
		assignments,
		{ culture: culture.profile, phase: culture.phase, geology: culture.geology },
		MATERIALS,
	);
	const groundTruthTags = classifyArtefact(features, CLASSIFICATION_RULES, baselineFor(culture));

	const classified: ClassifiedArtefact = {
		...artefact,
		materials: assignments,
		decorativeLayers: layers,
		features,
		groundTruthTags,
		physicalLabel: '', // No producer until roadmap 2GN.21; see the module doc.
		provenance: stubProvenance(culture),
		materialProvenance: assignments.map((assignment) => assignment.provenance),
	};

	const presentation = generateDescription(classified, registers);

	const orderedComponents = [...artefact.components].sort((a, b) => a.position - b.position);
	const components = orderedComponents.map((component) => {
		const assignment = assignments.find((a) => a.componentId === component.id)!;
		const material = MATERIALS.find((m) => m.id === assignment.materialId)!;
		return {
			componentId: component.id,
			shortId: `c${component.position}`,
			primitiveType: component.primitiveType,
			material,
			observations: presentation.primaryObservations.filter((observation) =>
				observation.propertyId.startsWith(`${component.id}:`)
			),
		};
	});

	const claimed = new Set(components.flatMap((c) => c.observations));
	const orphaned = presentation.primaryObservations.filter((o) => !claimed.has(o));

	// Every observation carries the register it was rendered in; the foregrounded one is whichever
	// the engine chose, read back from the output rather than re-derived here.
	const foregroundedRegister = presentation.primaryObservations[0]?.register ??
		REGISTER_PREFERENCE.find((register) => registers.includes(register))!;

	return {
		artefact: classified,
		presentation,
		foregroundedRegister,
		components,
		observationCount: presentation.primaryObservations.length,
		orphaned,
	};
}
