// Scholar entity types (doc 07, section 5; doc 08)

import type { InterpretiveModel } from './interpretation.js';
import type { SiteType } from './world.js';

// --- Minimal NPC scholar ---

export interface MinimalScholar {
	id: string;
	name: string;
	specialism: {
		cultureAffinity: string[];
		methodologicalBias: string;
	};
	interpretiveModel: InterpretiveModel;
	corpusPublications: string[];
	relationship: {
		respect: number;
		agreement: number;
	};
}
