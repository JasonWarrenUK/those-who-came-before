/**
 * Test fixtures for `NormalisedArtefact` and `ClassifiedArtefact` (doc 05 §6.1, §9.3, roadmap
 * task 1FD.35).
 *
 * Consumed as named imports with an explicit `.ts` extension, matching the convention set by
 * `src/lib/engine/prng.test.ts`. Sibling to `tests/fixtures/world.ts` (seed) and
 * `tests/fixtures/culture.ts` (culture) — fixtures are split per-domain to mirror the
 * `src/lib/types/` layout.
 */

import type {
	ClassifiedArtefact,
	ExtractedFeatures,
	MaterialAssignment,
	NormalisedArtefact,
	NormalisedComponent,
	ObjectDimensions,
} from '../../src/lib/types/artefact.ts';
import type { ContextTag, FunctionTag } from '../../src/lib/types/tags.ts';
import type { Provenance } from '../../src/lib/types/world.ts';

function mockDimensions(): ObjectDimensions {
	return {
		primaryExtent: 20,
		secondaryExtent: 4,
		mass: 'light',
	};
}

function mockComponent(): NormalisedComponent {
	return {
		id: 'test-component',
		primitiveType: 'elongated',
		properties: new Map<string, string | number>([
			['length', 20],
			['crossSection', 'round'],
		]),
		allowedMaterialTags: ['metal', 'wood'],
		position: 0,
	};
}

function mockExtractedFeatures(): ExtractedFeatures {
	return {
		hasEdge: true,
		edgeCount: 1,
		hasPoint: true,
		hasImpactSurface: false,
		hasContainer: false,
		containerOpenness: 0,
		hasFasteningMechanism: false,
		primaryAxisLength: 'medium',
		isWearable: false,
		partCount: 1,
		attachmentDiversity: 0,
		decorativeLayerCount: 0,
		motifPresent: false,
		motifCulturalOrigins: [],
		techniqueComplexity: 0,
		preciousMaterialsInDecoration: false,
		functionalComplexity: 0.5,
		decorativeComplexity: 0,
		overallComplexity: 0.5,
		portability: 'one-hand',
		inspectionDepth: 'full',
	};
}

function mockProvenance(): Provenance {
	return {
		cultureId: 'test-culture',
		phaseId: 'test-phase',
		year: -250,
		site: {
			name: 'Test Site',
			type: 'settlement',
			region: 'Test Region',
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
 * Builds a mock `NormalisedArtefact`: a single component, no attachments, valid dimensions,
 * `one-hand` portability and `full` inspection depth.
 *
 * Overrides replace whole top-level branches (`dimensions`, `components`) rather than
 * deep-merging — a fixture caller wanting a different component set should pass the full
 * `components` array. See `mockCulture` (`tests/fixtures/culture.ts`) for the same convention.
 *
 * @param overrides - Partial `NormalisedArtefact` merged shallowly over the defaults.
 */
export function mockNormalisedArtefact(
	overrides: Partial<NormalisedArtefact> = {},
): NormalisedArtefact {
	const defaults: NormalisedArtefact = {
		id: 'test-artefact',
		components: [mockComponent()],
		attachments: [],
		dimensions: mockDimensions(),
		portability: 'one-hand',
		inspectionDepth: 'full',
	};

	return { ...defaults, ...overrides };
}

/**
 * Builds a mock `ClassifiedArtefact`: a `mockNormalisedArtefact` base plus one material
 * assignment, no decorative layers, a full `ExtractedFeatures` set, ground-truth tags, a neutral
 * physical label and a valid `Provenance`. `materials[0].componentId` matches the base
 * component's `id` by default so the fixture reads coherently on its own.
 *
 * Overrides replace whole top-level branches rather than deep-merging, matching
 * `mockNormalisedArtefact` and `mockCulture`.
 *
 * @param overrides - Partial `ClassifiedArtefact` merged shallowly over the defaults.
 */
export function mockArtefact(overrides: Partial<ClassifiedArtefact> = {}): ClassifiedArtefact {
	const base = mockNormalisedArtefact();

	const materials: MaterialAssignment[] = [
		{
			componentId: base.components[0].id,
			materialId: 'bronze',
			provenance: { source: 'local' },
		},
	];

	const defaults: ClassifiedArtefact = {
		...base,
		materials,
		decorativeLayers: [],
		features: mockExtractedFeatures(),
		groundTruthTags: new Map<FunctionTag | ContextTag, number>([
			['tool', 0.8],
			['utilitarian', 0.6],
		]),
		physicalLabel: 'short bronze elongated form',
		provenance: mockProvenance(),
		materialProvenance: [],
	};

	return { ...defaults, ...overrides };
}
