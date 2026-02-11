// Visibility model (doc 05, section 1.1; doc 08, section 3.1)

/** Visibility levels for world state properties */
export type PropertyVisibility =
	| 'observable' // Directly available upon encounter
	| 'inferable' // Derivable from observable properties through reasoning
	| 'occluded' // Definite but hidden from all agents
	| 'engine-internal'; // No in-world meaning, pipeline metadata only
