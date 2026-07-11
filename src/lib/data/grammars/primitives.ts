/**
 * Geometric primitive definitions (doc 05 §5.3).
 *
 * The eight physical forms every artefact component is built from, each with its parameter
 * vocabulary transcribed verbatim from the component grammar's BNF. Primitives are geometric, not
 * functional (doc 05 §5.1): the grammar knows about elongated forms and hollow enclosures, never
 * swords or pots — classification is entirely downstream. Parameters are scoped per primitive, not
 * shared: `crossSection` on an elongated form admits different values from `crossSection` on a
 * ring-form, so no global parameter unions exist here.
 *
 * This module is static data only, no behaviour. Grammar expansion resolves leaf primitives
 * against this registry (`expandGrammar`, roadmap 2GN.3); the material-compatibility table that
 * maps primitive + properties to `allowedMaterialTags` is engine logic (roadmap 2GN.10), and
 * dimension derivation happens at normalisation (roadmap 2GN.8) — neither lives here.
 *
 * The registry is a single `as const` value with the type layer derived from it — a deliberate
 * deviation from the interfaces-first convention, per the `Serialised<T>` precedent in
 * `types/save.ts`: one source of truth means the types cannot drift from the data.
 */

/**
 * Parameter vocabularies for the eight geometric primitives, keyed by primitive id then parameter
 * name (doc 05 §5.3, verbatim). Each value list is ordered as the BNF lists it.
 */
export const PRIMITIVE_PARAMETERS = {
	/** Long-axis forms: blades, pins, shafts, handles. */
	'elongated': {
		length: ['short', 'medium', 'long'],
		crossSection: ['round', 'oval', 'rectangular', 'triangular', 'diamond'],
		taper: ['none', 'gradual', 'abrupt'],
		edge: ['none', 'single', 'double'],
		point: ['none', 'sharp', 'blunt'],
	},
	/** Tubular forms with an interior: beakers, sockets, ferrules. */
	'cylindrical': {
		length: ['short', 'medium', 'long'],
		diameter: ['narrow', 'medium', 'wide'],
		wall: ['thin', 'medium', 'thick'],
		opening: ['open', 'restricted', 'closed'],
		base: ['flat', 'rounded', 'pointed'],
	},
	/** Broad planar forms: blades of another kind, plaques, palettes. */
	'flat-broad': {
		shape: ['round', 'oval', 'rectangular', 'irregular', 'crescent'],
		size: ['small', 'medium', 'large'],
		thickness: ['thin', 'medium', 'thick'],
		curvature: ['flat', 'shallow', 'deep'],
		perforation: ['none', 'single', 'multiple'],
	},
	/** Volumetric containers: vessels, boxes, flasks. */
	'hollow-enclosed': {
		shape: ['spherical', 'ovoid', 'box', 'irregular'],
		size: ['small', 'medium', 'large'],
		wall: ['thin', 'medium', 'thick'],
		opening: ['wide', 'narrow', 'slit', 'none'],
		base: ['flat', 'rounded', 'pedestal'],
	},
	/** Annular forms: rings, torcs, loops. */
	'ring-form': {
		diameter: ['small', 'medium', 'large'],
		crossSection: ['round', 'flat', 'twisted'],
		gap: ['closed', 'open', 'overlapping'],
	},
	/** Solid circular planar forms: whorls, weights, mirrors. */
	'disc-form': {
		diameter: ['small', 'medium', 'large'],
		thickness: ['thin', 'medium', 'thick'],
		perforation: ['none', 'central', 'off-centre'],
	},
	/** Solid straight stock: ingots, rods, awl bodies. */
	'bar-form': {
		length: ['short', 'medium', 'long'],
		crossSection: ['round', 'square', 'hexagonal'],
		taper: ['none', 'single-end', 'both-ends'],
	},
	/** Thin covering forms: fittings, facings, wrappings. */
	'sheet-form': {
		size: ['small', 'medium', 'large'],
		shape: ['rectangular', 'triangular', 'irregular', 'fitted'],
		flexibility: ['rigid', 'semi-flexible', 'flexible'],
	},
} as const;

/**
 * The eight primitive ids — the `<primary-component>` alternatives of doc 05 §5.3. Matches
 * `NormalisedComponent.primitiveType` (`types/artefact.ts`), which stays a plain `string` at the
 * type boundary; this union is the data-layer vocabulary behind it.
 */
export type PrimitiveType = keyof typeof PRIMITIVE_PARAMETERS;

/**
 * All primitive ids, in the order doc 05 §5.3 lists them. Supports iteration and runtime
 * validation without hand-maintaining a second copy of the eight literals.
 */
export const PRIMITIVE_TYPES: readonly PrimitiveType[] = Object.keys(
	PRIMITIVE_PARAMETERS,
) as PrimitiveType[];

/**
 * Narrows an arbitrary string to `PrimitiveType`. The minimal runtime counterpart to the type,
 * for boundaries where a primitive id arrives untyped (grammar rule `expandsTo` resolution,
 * roadmap 2GN.3; save data).
 */
export function isPrimitiveType(value: string): value is PrimitiveType {
	return (PRIMITIVE_TYPES as readonly string[]).includes(value);
}
