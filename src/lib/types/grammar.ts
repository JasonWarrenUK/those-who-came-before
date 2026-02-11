// Geometric primitives, grammar rules, mobility model (doc 05, sections 5.2–5.5)

import type { MaterialTag } from './tags.js';

// --- Mobility model ---

export type Portability =
	| 'pocketable' // One hand, negligible effort
	| 'one-hand' // Carried in one hand
	| 'two-hand' // Requires both hands
	| 'team-lift' // Requires 2–4 people
	| 'major-effort'; // Significant labour but IS portable

export type InspectionDepth = 'full' | 'detailed' | 'observational';

// --- Geometric primitives ---

export type PrimitiveType =
	| 'elongated'
	| 'cylindrical'
	| 'flat-broad'
	| 'hollow-enclosed'
	| 'ring-form'
	| 'disc-form'
	| 'bar-form'
	| 'sheet-form';

// --- Attachment types ---

export type AttachmentType =
	| 'inline'
	| 'perpendicular'
	| 'socketed'
	| 'riveted'
	| 'wrapped'
	| 'lashed'
	| 'hinged'
	| 'threaded'
	| 'friction-fit';

// --- Arrangement patterns ---

export type ArrangementPattern =
	| { type: 'symmetric'; validCounts: number[] }
	| { type: 'radial'; countRange: [number, number] }
	| { type: 'linear-array'; countRange: [number, number] }
	| { type: 'stacked'; countRange: [number, number] }
	| { type: 'nested'; countRange: [number, number] }
	| { type: 'branching'; countRange: [number, number] };

export interface AccumulationConstraints {
	maxDistinctGroups: number;
	maxComponentsPerGroup: number;
	noTwoGroupsSameType: boolean;
	patterns: ArrangementPattern[];
}

// --- Grammar rules ---

export interface GrammarRule {
	id: string;
	options: GrammarOption[];
}

export interface GrammarOption {
	baseWeight: number;
	culturalModifiers: Map<string, number>;
	production: () => void; // Placeholder — Phase 2 will implement
}

// --- Classification rules ---

export interface ClassificationRule {
	condition: (features: ExtractedFeaturesShape) => boolean;
	tags: Map<string, number>;
}

/** Minimal shape for classification rule conditions (full definition in artefact.ts) */
export interface ExtractedFeaturesShape {
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
	decorativeLayerCount: number;
	motifPresent: boolean;
	motifCulturalOrigins: string[];
	techniqueComplexity: number;
	preciousMaterialsInDecoration: boolean;
	functionalComplexity: number;
	decorativeComplexity: number;
	overallComplexity: number;
	portability: Portability;
	inspectionDepth: InspectionDepth;
}

// --- Material compatibility ---

export interface MaterialCompatibility {
	primitiveType: PrimitiveType;
	allowedTags: MaterialTag[];
}
