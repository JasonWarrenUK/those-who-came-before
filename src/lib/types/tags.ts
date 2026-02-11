// Tag classification system (doc 05, section 9.2)

/** What is this object FOR? */
export type FunctionTag =
	| 'weapon'
	| 'tool'
	| 'container'
	| 'fastener'
	| 'ornament'
	| 'ritual'
	| 'domestic'
	| 'agricultural'
	| 'maritime'
	| 'funerary'
	| 'votive'
	| 'trade-good'
	| 'currency';

/** How was this object USED? */
export type ContextTag =
	| 'personal'
	| 'communal'
	| 'elite'
	| 'utilitarian'
	| 'ceremonial'
	| 'everyday'
	| 'military'
	| 'artisanal';

/** What material category does it belong to? */
export type MaterialTag =
	| 'bone'
	| 'wood'
	| 'stone'
	| 'metal'
	| 'clay'
	| 'glass'
	| 'fiber'
	| 'leather'
	| 'precious-stone'
	| 'precious-metal';
