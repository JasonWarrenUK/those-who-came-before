// Decorative grammar types (doc 05, section 8)

export type DecorativeTechnique =
	// Surface treatments
	| 'polish'
	| 'patina'
	| 'roughening'
	| 'scoring'
	| 'engraving'
	| 'relief'
	| 'painting'
	| 'glaze'
	// Applied elements
	| 'inlay'
	| 'overlay'
	| 'studs'
	| 'wire-wrapping'
	| 'gilding'
	// Textile elements
	| 'wrapping'
	| 'tassels'
	| 'beading';

export interface DecorativeLayer {
	targetComponentId: string;
	technique: DecorativeTechnique;
	motifRef?: string; // From culture's motifVocabulary
	material?: string; // If the technique introduces new material
	sublayers: DecorativeLayer[]; // Decoration on decoration
}
