// World state types (doc 05, sections 2–3; doc 08, section 3)

import type { FunctionTag, MaterialTag } from './tags.js';

// --- Seed ---

export interface WorldSeed {
	raw: string;
	prng: () => number; // Seeded, deterministic (xoshiro128**)
}

// --- Chronology ---

export interface WorldChronology {
	startYear: number;
	endYear: number;
	presentYear: number; // "Now" — the year the player is working
	cultureTimelines: CultureTimeline[];
	relationships: CultureRelationship[];
}

export interface CultureTimeline {
	cultureId: string;
	phases: CulturePhase[];
}

export interface CulturePhase {
	id: string;
	label: string;
	startYear: number;
	endYear: number;
	characteristics: PhaseCharacteristics;
}

export interface PhaseCharacteristics {
	technology: {
		metallurgy: number;
		ceramics: number;
		textiles: number;
		stoneWorking: number;
		glassWorking: number;
		woodWorking: number;
	};
	economy: {
		tradeOpenness: number;
		surplus: number;
		urbanisation: number;
	};
	society: {
		stratification: number;
		militarisation: number;
		religiousEmphasis: number;
		craftSpecialisation: number;
	};
	aesthetics: {
		decorativeEmphasis: number;
		motifComplexity: number;
		formConservatism: number;
	};
}

// --- Culture ---

export interface Culture {
	id: string;
	label: string;
	baseProfile: CulturalProfile;
	timeline: CultureTimeline;
}

export interface CulturalProfile {
	materialAffinities: Map<MaterialTag, number>;
	motifVocabulary: MotifSet;
	craftInvestment: CraftInvestmentProfile;
}

export interface MotifSet {
	id: string;
	motifs: string[];
}

export interface CraftInvestmentProfile {
	contextWeights: Map<DepositionType, number>;
	siteTypeWeights: Map<SiteType, number>;
}

// --- Culture relationships ---

export interface CultureRelationship {
	cultureIds: [string, string];
	phases: RelationshipPhase[];
}

export interface RelationshipPhase {
	startYear: number;
	endYear: number;
	dynamics: RelationshipDynamics;
}

export interface RelationshipDynamics {
	trade: {
		volume: number;
		materialFlow: MaterialFlow[];
		directionality: 'balanced' | 'asymmetric';
		dominantCulture?: string;
	};
	conflict: {
		intensity: number;
		type: 'raiding' | 'territorial' | 'conquest' | 'none';
	};
	culturalExchange: {
		intensity: number;
		domains: ('motifs' | 'techniques' | 'materials' | 'forms')[];
	};
	political: {
		type: 'independent' | 'tributary' | 'alliance' | 'vassal' | 'colonial';
		dominantCulture?: string;
	};
}

export interface MaterialFlow {
	materialTag: MaterialTag;
	specificMaterials?: string[];
	direction: 'a-to-b' | 'b-to-a' | 'bidirectional';
	volume: number;
}

// --- Provenance ---

export interface Provenance {
	cultureId: string;
	phaseId: string;
	year: number;
	site: {
		name: string;
		type: SiteType;
		region: string;
	};
	context: {
		layer: string;
		associatedFinds: string[];
		condition: PreservationState;
		deposition: DepositionType;
	};
}

export type SiteType =
	| 'settlement'
	| 'burial'
	| 'workshop'
	| 'midden'
	| 'shrine'
	| 'cache'
	| 'shipwreck'
	| 'battlefield'
	| 'market'
	| 'fortification'
	| 'quarry';

export type PreservationState = 'excellent' | 'good' | 'fair' | 'poor' | 'fragmentary';

export type DepositionType =
	| 'deliberate-placement'
	| 'casual-discard'
	| 'destruction'
	| 'burial-goods'
	| 'foundation-deposit'
	| 'hoard'
	| 'loss'
	| 'abandonment'
	| 'unknown';

// --- Geological context ---

export interface GeologicalContext {
	materialAvailability: Map<string, RegionalAvailability>;
}

export interface RegionalAvailability {
	materialId: string;
	regions: Map<string, AvailabilityLevel>;
}

export type AvailabilityLevel =
	| 'abundant'
	| 'available'
	| 'scarce'
	| 'trade-only'
	| 'absent';

// --- World state (aggregate) ---

export interface WorldState {
	seed: WorldSeed;
	chronology: WorldChronology;
	cultures: Culture[];
	geology: GeologicalContext;
	corpus: ProfessionalCorpus;
}

// --- Professional corpus ---

export interface ProfessionalCorpus {
	materialFrequencies: Map<string, FrequencyRecord>;
	formFrequencies: Map<string, FrequencyRecord>;
	contextAssociations: Map<string, ContextFrequency>;
	activeDebates: Debate[];
	receivedWisdom: ConsensusStatement[];
}

export interface FrequencyRecord {
	totalObserved: number;
	byContext: Map<string, number>;
	byCulture: Map<string, number>;
	consensusRarity: 'ubiquitous' | 'common' | 'uncommon' | 'rare' | 'unique';
	lastUpdated: number;
}

export interface ContextFrequency {
	contextType: string;
	frequency: Map<string, number>;
}

export interface ConsensusStatement {
	claim: string;
	confidence: 'established' | 'accepted' | 'debated' | 'speculative';
	supportingPublications: string[];
	challengingPublications: string[];
}

export interface Debate {
	topic: string;
	positions: DebatePosition[];
}

export interface DebatePosition {
	npcId: string;
	stance: string;
	evidence: string[];
}

// --- Dating ---

export interface DatingFramework {
	siteId: string;
	layers: LayerDating[];
	establishedBy: string[];
	confidence: 'well-established' | 'provisional' | 'contested';
}

export interface LayerDating {
	layerId: string;
	estimatedRange: [number, number];
	method: DatingMethod;
	errorMargin: number;
}

export type DatingMethod =
	| 'stratigraphic-inference'
	| 'typological-comparison'
	| 'radiocarbon'
	| 'dendrochronology'
	| 'thermoluminescence';

// --- NPC scholars ---

export interface NPCScholarSeed {
	id: string;
	name: string;
	specialisation: FunctionTag[];
	cultureFocus: string[];
	sitePreference: SiteType[];
	careerStage: 'emeritus' | 'senior' | 'mid' | 'early';
	status: 'active' | 'retired' | 'deceased';
	publicationCount: number;
}

export interface SimulatedExcavation {
	npcId: string;
	siteId: string;
	siteType: SiteType;
	cultureId: string;
	phaseId: string;
	artefactsSampled: number;
	materialDistribution: Map<string, number>;
	formDistribution: Map<string, number>;
	contextDistribution: Map<string, number>;
}

export interface CoverageBudget {
	totalExcavations: number;
	cultureBias: Map<string, number>;
	siteTypeBias: Map<SiteType, number>;
	periodBias: Map<string, number>;
	minimumGapPerCulture: number;
}

export type ClaimMagnitude = 'confirmation' | 'extension' | 'challenge' | 'novel';
