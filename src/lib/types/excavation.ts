// Excavation and site composition types (doc 05, section 11)

import type { SiteType } from './world.js';

export interface ExcavationBatch {
	siteId: string;
	siteType: SiteType;
	cultureId: string;
	phaseId: string;
	artefactIds: string[];
	ambiguityDistribution: AmbiguityDistribution;
}

export interface AmbiguityDistribution {
	clear: number; // ~30–40%
	moderate: number; // ~40–50%
	highlyAmbiguous: number; // ~20–30%
}

export interface InterpretiveLoadState {
	unresolvedContradictions: number;
	unsupportedHypotheses: number;
	termsSinceLastChallenge: number;
}
