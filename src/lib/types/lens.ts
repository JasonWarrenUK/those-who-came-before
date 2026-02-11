// Interpretive lens types (doc 04)

import type { FunctionTag, ContextTag } from './tags.js';

export type DescriptionRegister = 'observational' | 'interpretive' | 'technical';

export type ObservationRegister = 'neutral' | 'functional' | 'aesthetic' | 'ritual' | 'technical';

// --- Channel 3.1: Observation salience ---

export interface ObservationSalience {
	propertyId: string;
	baseWeight: number;
	lensAdjustments: Array<{
		sourceHypothesisId: string;
		weightDelta: number;
		reason: string;
	}>;
	finalWeight: number; // Clamped [0.1, 3.0]
}

// --- Channel 3.2: Classification suggestions ---

export interface ClassificationSuggestion {
	classificationId: string;
	label: string;
	basePlausibility: number;
	lensBoost: number;
	finalScore: number;
	sourceHypotheses: string[];
}

// --- Channel 3.3: Cross-reference priming ---

export interface CrossReference {
	targetArtefactId: string;
	matchingProperties: string[];
	baseRelevance: number;
	lensRelevance: number;
	finalRelevance: number;
	potentiallyMisleading: boolean;
}

// --- Channel 3.4: Descriptive framing ---

export interface DescriptionFrame {
	propertyId: string;
	registers: Record<
		DescriptionRegister,
		Array<{
			text: string;
			emphasis: string;
			alignsWithTags: string[];
		}>
	>;
	selectedRegister: DescriptionRegister;
	selectedVariant: number;
}

// --- Channel 3.5: Omission blindness ---

export interface OmissionCheck {
	propertyId: string;
	contradicts: string[];
	suppressionLevel: number;
	baseVisibility: number;
	adjustedVisibility: number;
}

// --- Lens strength ---

export interface LensStrength {
	hypothesisId: string;
	factors: {
		dissemination: number;
		venuePrestige: number;
		confidence: number;
		evidenceCount: number;
		taught: boolean;
		cited: number;
		contradictions: number;
		onSabbatical: boolean;
	};
	totalStrength: number; // Clamped [0, 1]
	lastRecalculatedTerm: number;
}

// --- Lens state (aggregate) ---

export interface LensState {
	strengths: Map<string, LensStrength>;
	tagWeights: Map<FunctionTag | ContextTag, number>;
}

// --- Register access ---

export interface RegisterAccess {
	register: ObservationRegister;
	unlocked: boolean;
	proficiency: number;
	requirements: {
		observationCount: number;
		inferenceCount: number;
		contradictionsResolved: number;
		domainExposure: Map<string, number>;
	};
}

// --- Publication registers ---

export type PublicationRegister = 'academic' | 'curatorial' | 'popular' | 'field-notes';

// --- Description generation ---

export interface DescriptionTemplate {
	property: string;
	variants: DescriptionVariant[];
}

export interface DescriptionVariant {
	template: string;
	emphasis: FunctionTag[];
	register: ObservationRegister;
}

// --- Artefact presentation (pipeline output, stage 9) ---

export interface ArtefactPresentation {
	artefactId: string;
	label: string;
	provenance: ProvenancePresentation;
	primaryObservations: PresentedObservation[];
	secondaryObservations: PresentedObservation[];
	suggestedTags: TagSuggestion[];
	crossReferences: CrossReference[];
}

export interface ProvenancePresentation {
	siteName: string;
	siteType: string;
	region: string;
	layer: string;
	condition: string;
}

export interface PresentedObservation {
	propertyId: string;
	description: string;
	salience: number;
	register: ObservationRegister;
	rawData: Map<string, string | number>;
}

export interface TagSuggestion {
	tag: FunctionTag | ContextTag;
	groundTruthScore: number; // Visibility: occluded
	lensBoost: number;
	presentedScore: number;
	sourceHypotheses: string[];
}
