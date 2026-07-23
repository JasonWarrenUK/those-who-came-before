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
		pointSharpness: 'sharp',
		hasImpactSurface: false,
		hasContainer: false,
		containerOpenness: 0,
		openingType: 'none',
		hasFasteningMechanism: false,
		primaryAxisLength: 'medium',
		bladeLengthBand: 'medium',
		bladeProfile: 'cutting',
		isWearable: false,
		partCount: 1,
		attachmentDiversity: 0,
		perforation: 'none',
		wallThickness: 'none',
		ringGap: 'none',
		sheetFlexibility: 'none',
		massBand: 'light',
		sizeBand: 'small',
		curvature: 'none',
		baseType: 'none',
		decorativeLayerCount: 0,
		appliedElementPresent: false,
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

/**
 * Builds a neutral baseline `ExtractedFeatures` for driving classification rules directly: every
 * boolean `false`, every count/complexity `0`, every banded field its `'none'` member (fields
 * without a `'none'` member sit at their middle band). No shipped rule fires against this on its
 * own, so a test can flip exactly the signals a rule reads and assert on that rule in isolation.
 *
 * Single-sourced here (rather than per test file) so that when `ExtractedFeatures` grows — the
 * material fields at roadmap 2GN.27, the decorative-motif fields at 2GN.34 — the neutral value for
 * each new field is chosen once, keeping the rule suite (`src/lib/data/classification.test.ts`)
 * and the fold suite (`src/lib/engine/generation/classification.test.ts`) on the same baseline.
 *
 * Distinct from the private `mockExtractedFeatures` above, which is a *representative* feature set
 * (a sharp-edged blade) for `mockArtefact` coherence, not a neutral one.
 *
 * @param overrides - Partial `ExtractedFeatures` merged shallowly over the neutral defaults.
 */
export function neutralExtractedFeatures(
	overrides: Partial<ExtractedFeatures> = {},
): ExtractedFeatures {
	const defaults: ExtractedFeatures = {
		hasEdge: false,
		edgeCount: 0,
		hasPoint: false,
		pointSharpness: 'none',
		hasImpactSurface: false,
		hasContainer: false,
		containerOpenness: 0,
		openingType: 'none',
		hasFasteningMechanism: false,
		primaryAxisLength: 'medium',
		bladeLengthBand: 'none',
		bladeProfile: 'none',
		isWearable: false,
		partCount: 0,
		attachmentDiversity: 0,
		perforation: 'none',
		wallThickness: 'none',
		ringGap: 'none',
		sheetFlexibility: 'none',
		massBand: 'moderate',
		sizeBand: 'medium',
		curvature: 'none',
		baseType: 'none',
		decorativeLayerCount: 0,
		appliedElementPresent: false,
		motifPresent: false,
		motifCulturalOrigins: [],
		techniqueComplexity: 0,
		preciousMaterialsInDecoration: false,
		functionalComplexity: 0,
		decorativeComplexity: 0,
		overallComplexity: 0,
		portability: 'one-hand',
		inspectionDepth: 'full',
	};
	return { ...defaults, ...overrides };
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
