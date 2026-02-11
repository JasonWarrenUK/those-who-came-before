// Artefact types (doc 05, sections 6–9)

import type { FunctionTag, ContextTag, MaterialTag } from './tags.js';
import type {
	PrimitiveType,
	AttachmentType,
	ArrangementPattern,
	Portability,
	InspectionDepth
} from './grammar.js';
import type { DecorativeLayer } from './decoration.js';
import type { Provenance } from './world.js';

// --- Normalised artefact (post-grammar, post-plausibility) ---

export interface NormalisedArtefact {
	id: string;
	components: NormalisedComponent[];
	attachments: Attachment[];
	dimensions: ObjectDimensions;
	portability: Portability;
	inspectionDepth: InspectionDepth;
}

export interface NormalisedComponent {
	id: string;
	primitiveType: PrimitiveType;
	properties: Map<string, string | number>;
	allowedMaterialTags: MaterialTag[];
	position: number;
	arrangementGroup?: {
		pattern: ArrangementPattern;
		index: number;
		totalInGroup: number;
	};
}

export interface Attachment {
	fromComponentId: string;
	toComponentId: string;
	type: AttachmentType;
}

export interface ObjectDimensions {
	primaryExtent: number; // cm, longest axis
	secondaryExtent: number; // cm, perpendicular
	mass: 'negligible' | 'light' | 'moderate' | 'heavy' | 'very-heavy';
}

// --- Material assignment ---

export interface MaterialDefinition {
	id: string;
	name: string;
	tags: MaterialTag[];
}

export interface MaterialAssignment {
	componentId: string;
	materialId: string;
	provenance: MaterialProvenance;
}

export interface MaterialProvenance {
	source: 'local' | 'regional' | 'trade' | 'unknown';
	likelyOriginRegion?: string;
	tradePathId?: string;
}

// --- Feature extraction ---

export interface ExtractedFeatures {
	// Structural features
	hasEdge: boolean;
	edgeCount: number;
	hasPoint: boolean;
	hasImpactSurface: boolean;
	hasContainer: boolean;
	containerOpenness: number;
	hasFasteningMechanism: boolean;
	primaryAxisLength: 'short' | 'medium' | 'long';
	isWearable: boolean;
	partCount: number;
	attachmentDiversity: number;

	// Decorative features
	decorativeLayerCount: number;
	motifPresent: boolean;
	motifCulturalOrigins: string[];
	techniqueComplexity: number;
	preciousMaterialsInDecoration: boolean;

	// Combined
	functionalComplexity: number;
	decorativeComplexity: number;
	overallComplexity: number;

	// Dimensional
	portability: Portability;
	inspectionDepth: InspectionDepth;
}

// --- Classified artefact (pipeline output) ---

export interface ClassifiedArtefact extends NormalisedArtefact {
	materials: MaterialAssignment[];
	decorativeLayers: DecorativeLayer[];
	features: ExtractedFeatures;
	groundTruthTags: Map<FunctionTag | ContextTag, number>; // Visibility: occluded
	physicalLabel: string; // Visibility: observable
	provenance: Provenance;
	materialProvenance: MaterialProvenance[];
}

// --- Plausibility ---

export type PlausibilityRule =
	| { type: 'requires'; component: string; dependsOn: string }
	| { type: 'excludes'; component: string; excludes: string }
	| { type: 'ordering'; component: string; before?: string; after?: string }
	| {
			type: 'material-physics';
			predicate: (a: NormalisedArtefact) => boolean;
			reason: string;
	  }
	| { type: 'ergonomic'; predicate: (a: NormalisedArtefact) => boolean; reason: string };
