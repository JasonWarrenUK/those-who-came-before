// Venue types (doc 07, section 3.1)

export type ContainerModel = 'periodical' | 'standalone' | 'curated-space' | 'event';

export type EditorialProcess =
	| 'peer-review'
	| 'editorial-commission'
	| 'curatorial-selection'
	| 'open-submission';

export type AudienceEncounter = 'sought' | 'situated' | 'captive';

export interface SubmissionWindow {
	frequency: number;
	alignment?: 'term-start' | 'term-end' | 'annual' | 'event-tied';
	open: boolean;
}

export interface TemporalMode {
	submissionWindow: SubmissionWindow;
	leadTime: number;
	visibilityWindow: number | 'indefinite';
}

export interface VenueScope {
	cultureRange: number;
	periodRange: number;
	methodologicalRange: number;
}

export interface VenueDefinition {
	id: string;
	name: string;

	// Structural properties
	containerModel: ContainerModel;
	temporalMode: TemporalMode;
	artefactSituated: boolean;
	editorialProcess: EditorialProcess;
	audienceEncounter: AudienceEncounter;

	// Prestige inputs (computed, not assigned)
	editorialRigour: number;
	scope: VenueScope;
	reach: number;
	establishment: number;

	// Subject alignment
	subjectFocus: {
		cultureAffinities?: string[];
		periodAffinities?: string[];
		methodologicalLeaning?: string;
	};
}
