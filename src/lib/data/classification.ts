/**
 * MVP classification rules (doc 05 §9.2, roadmap 2GN.17).
 *
 * Feature→tag scoring rules, derived from first principles against the signals the grammar
 * (`data/grammars/primitives.ts`) actually produces, rather than transcribed from doc 05 §9.2's
 * illustrative examples — the engine's primitive/parameter vocabulary has grown well past what
 * that section shows. Every `condition` below reads a field of `ExtractedFeatures` traceable to a
 * real primitive parameter (an `elongated.edge`, a `ring-form.gap`, a `hollow-enclosed.opening`
 * band, and so on) or a real decorative-layer fact (technique identity, layer count). Two families
 * are the exception, and are marked dormant: `preciousMaterialsInDecoration` and
 * `motifPresent`/`motifCulturalOrigins` have no producer yet (decorative material/motif assignment,
 * roadmap 2GN.33, is unbuilt), so those rules are authored now but fire on no artefact the current
 * pipeline can generate until 2GN.33 lands.
 *
 * **Mechanical-vs-classificatory boundary** (doc 12 propagation register): no rule below reads
 * `portability` or `inspectionDepth` — both are mechanical derivations governing player
 * handling/inspection (doc 05 §5.2), not classificatory facts. Rules use the physical `massBand`
 * and `sizeBand` instead, which derive independently from the same dimensions. See
 * `classification.test.ts`'s boundary guard, which fails if a rule starts reading either field.
 *
 * Weights follow doc 05 §9.2's 0.2–0.8 scale and are MVP-provisional, expected to be retuned once
 * observable in the Explorer tag inspector (roadmap 2GN.59). Tags are deliberately overlapping —
 * `classifyArtefact` (roadmap 2GN.20) is the consumer that folds every matching rule's `tags` map
 * into one accumulated `Map<FunctionTag | ContextTag, number>`; this module is static data only,
 * no behaviour.
 *
 * Not every `FunctionTag`/`ContextTag` is reached at MVP — `currency` has no grammar signal to key
 * on yet and is deliberately absent rather than force-fitted.
 */

import type { ClassificationRule } from '../types/tags.ts';

export const CLASSIFICATION_RULES: readonly ClassificationRule[] = [
	// --- Edge ------------------------------------------------------------------------------------

	/** A cutting edge on a medium-or-long body reads primarily weapon, secondarily tool. */
	{
		condition: (f) => f.hasEdge && f.primaryAxisLength !== 'short',
		tags: new Map([['weapon', 0.6], ['tool', 0.3]]),
	},

	/**
	 * Short edged blade with a sharp point: dagger-family. `bladeLengthBand`/`pointSharpness` are
	 * the edged component's own facts, so this fires independently of the whole artefact's
	 * `primaryAxisLength` (a short blade on a long haft still reads here via `bladeLengthBand`).
	 */
	{
		condition: (f) => f.hasEdge && f.bladeLengthBand === 'short' && f.pointSharpness === 'sharp',
		tags: new Map([['weapon', 0.4], ['tool', 0.3], ['personal', 0.3]]),
	},

	/** Short edged blade without a sharp point: utility/kitchen-knife family. */
	{
		condition: (f) => f.hasEdge && f.bladeLengthBand === 'short' && f.pointSharpness !== 'sharp',
		tags: new Map([['tool', 0.5], ['domestic', 0.4], ['everyday', 0.3]]),
	},

	/**
	 * A short-bodied edge that isn't a formed blade (`bladeLengthBand` of `'none'`/`'medium'`/
	 * `'long'` on a short overall axis): scraper, chisel, small adze — an edged tool, not a blade
	 * weapon. Catches the short-axis edges the long-edge rule excludes (`primaryAxisLength ===
	 * 'short'`) and the dagger/utility rules skip (they own `bladeLengthBand === 'short'` only), so
	 * no edged artefact leaves the edge family with zero function signal.
	 */
	{
		condition: (f) => f.hasEdge && f.primaryAxisLength === 'short' && f.bladeLengthBand !== 'short',
		tags: new Map([['tool', 0.4], ['everyday', 0.2]]),
	},

	/** Multiple distinct edges suggest a composite or multi-blade implement rather than one weapon. */
	{
		condition: (f) => f.edgeCount >= 2,
		tags: new Map([['tool', 0.3], ['weapon', 0.2]]),
	},

	// --- Point -------------------------------------------------------------------------------------

	/** A sharp point without an edge: awl, bodkin, spearhead, pin — piercing, not cutting. */
	{
		condition: (f) => f.hasPoint && !f.hasEdge && f.pointSharpness === 'sharp',
		tags: new Map([['weapon', 0.3], ['tool', 0.4], ['fastener', 0.2]]),
	},

	/** A blunt point without an edge: punch, stylus, blunt awl — a craft tool, not a piercing weapon. */
	{
		condition: (f) => f.hasPoint && !f.hasEdge && f.pointSharpness === 'blunt',
		tags: new Map([['tool', 0.5], ['artisanal', 0.3]]),
	},

	// --- Container (opening-graded) -----------------------------------------------------------------

	/** A wide, freely open container: bowl, cup — everyday domestic use. */
	{
		condition: (f) => f.hasContainer && (f.openingType === 'wide' || f.openingType === 'open'),
		tags: new Map([['container', 0.8], ['domestic', 0.5], ['everyday', 0.3]]),
	},

	/** A narrow or restricted opening: flask, jar — still domestic, but not a serving vessel. */
	{
		condition: (f) =>
			f.hasContainer && (f.openingType === 'narrow' || f.openingType === 'restricted'),
		tags: new Map([['container', 0.7], ['domestic', 0.4]]),
	},

	/** A slit opening: money-box, rattle — contents go in, not meant to come freely out. */
	{
		condition: (f) => f.hasContainer && f.openingType === 'slit',
		tags: new Map([['container', 0.5], ['votive', 0.4]]),
	},

	/** A sealed container (no opening, or a closed one): votive or funerary deposition vessel. */
	{
		condition: (f) => f.hasContainer && (f.openingType === 'none' || f.openingType === 'closed'),
		tags: new Map([['container', 0.5], ['votive', 0.4], ['funerary', 0.3]]),
	},

	// --- Vessel refinement -----------------------------------------------------------------------

	/** A thin-walled container reads as fine tableware rather than everyday cookware. */
	{
		condition: (f) => f.hasContainer && f.wallThickness === 'thin',
		tags: new Map([['elite', 0.3], ['ceremonial', 0.2]]),
	},

	/** A thick-walled container reads as utilitarian cooking or storage vessel. */
	{
		condition: (f) => f.hasContainer && f.wallThickness === 'thick',
		tags: new Map([['utilitarian', 0.4], ['domestic', 0.3]]),
	},

	/** A deeply curved broad form holds contents even outside the hollow primitives: scoop, palette-well. */
	{
		condition: (f) => f.curvature === 'deep',
		tags: new Map([['container', 0.5], ['domestic', 0.3]]),
	},

	/** A pedestal base reads display/ritual vessel rather than a plain standing pot. */
	{
		condition: (f) => f.baseType === 'pedestal',
		tags: new Map([['ceremonial', 0.4], ['elite', 0.3]]),
	},

	/** A pointed base reads amphora-style storage — set into a stand or the ground, not free-standing. */
	{
		condition: (f) => f.baseType === 'pointed',
		tags: new Map([['utilitarian', 0.3], ['maritime', 0.2]]),
	},

	// --- Perforation -----------------------------------------------------------------------------
	//
	// `perforation` is a single field unioning two primitives' vocabularies (`flat-broad`:
	// none/single/multiple; `disc-form`: none/central/off-centre). A multi-component artefact can
	// physically carry perforations on both, so `extractFeatures` (roadmap 2GN.19) must pick ONE
	// value: it reports the most classificatorily-loaded perforation present, priority
	// central > off-centre > single > multiple > none (rotation and suspension are stronger use
	// signals than a plain fixing hole). That ordering lives with the extractor, not here; these
	// rules stay one-value-in, so exactly one fires.

	/** A central perforation on a disc-form component: spindle-whorl, weight, mace-head. */
	{
		condition: (f) => f.perforation === 'central',
		tags: new Map([['tool', 0.4], ['artisanal', 0.3]]),
	},

	/** An off-centre perforation on a disc-form component: hung disc, token, pendant-weight — suspension, not rotation. */
	{
		condition: (f) => f.perforation === 'off-centre',
		tags: new Map([['ornament', 0.4], ['personal', 0.3]]),
	},

	/** A single perforation on a flat-broad component: pendant, plaque — meant to hang. */
	{
		condition: (f) => f.perforation === 'single',
		tags: new Map([['ornament', 0.4], ['personal', 0.3]]),
	},

	/** Multiple perforations: a fitting meant to be sewn or riveted onto something else. */
	{
		condition: (f) => f.perforation === 'multiple',
		tags: new Map([['fastener', 0.3], ['ornament', 0.2]]),
	},

	// --- Ring / fastener -----------------------------------------------------------------------------

	/** A closed ring: finger-ring, torc — worn, not fastened to anything. */
	{
		condition: (f) => f.ringGap === 'closed',
		tags: new Map([['ornament', 0.5], ['personal', 0.4]]),
	},

	/** An open or overlapping ring gap: penannular brooch, split-ring — fastens as much as adorns. */
	{
		condition: (f) => f.ringGap === 'open' || f.ringGap === 'overlapping',
		tags: new Map([['fastener', 0.4], ['ornament', 0.3], ['personal', 0.2]]),
	},

	// --- Sheet -------------------------------------------------------------------------------------

	/** A rigid sheet component: fitting, facing, mount — structural, not worn. */
	{
		condition: (f) => f.sheetFlexibility === 'rigid',
		tags: new Map([['utilitarian', 0.3], ['military', 0.2]]),
	},

	/** A flexible sheet component: foil, wrapping, binding — covering, textile-adjacent. */
	{
		condition: (f) => f.sheetFlexibility === 'flexible',
		tags: new Map([['personal', 0.2], ['ornament', 0.2]]),
	},

	// --- Mass ------------------------------------------------------------------------------------

	/** A heavy edge reads axe/adze/billhook — labour, not a blade weapon; counterweights the long-edge rule. */
	{
		condition: (f) => f.hasEdge && (f.massBand === 'heavy' || f.massBand === 'very-heavy'),
		tags: new Map([['tool', 0.5], ['agricultural', 0.3]]),
	},

	/** A heavy container reads storage jar or cauldron rather than tableware. */
	{
		condition: (f) => f.hasContainer && (f.massBand === 'heavy' || f.massBand === 'very-heavy'),
		tags: new Map([['utilitarian', 0.4], ['domestic', 0.3]]),
	},

	/** Too heavy for one person: a shared or monumental object. */
	{
		condition: (f) => f.massBand === 'very-heavy',
		tags: new Map([['communal', 0.4], ['ceremonial', 0.2]]),
	},

	// --- Size ------------------------------------------------------------------------------------

	/** A small object reads as an individual's carried or worn item. Physical size, not `portability`. */
	{
		condition: (f) => f.sizeBand === 'small',
		tags: new Map([['personal', 0.3], ['everyday', 0.2]]),
	},

	// --- Structural complexity -----------------------------------------------------------------------

	/** Many parts joined many different ways: an engineered, crafted assembly — hafted tool, mounted fitting. */
	{
		condition: (f) => f.partCount >= 3 && f.attachmentDiversity >= 2,
		tags: new Map([['tool', 0.3], ['artisanal', 0.3]]),
	},

	// --- Decorative (real signals) -----------------------------------------------------------------

	/** Heavily worked decoration (three or more layers) signals high status. */
	{
		condition: (f) => f.decorativeLayerCount >= 3,
		tags: new Map([['ornament', 0.3], ['elite', 0.4], ['ceremonial', 0.3]]),
	},

	/** An applied element (inlay, gilding, studs, overlay, wire-wrapping) is a deliberate embellishment. */
	{
		condition: (f) => f.appliedElementPresent,
		tags: new Map([['elite', 0.4], ['ornament', 0.3]]),
	},

	/** Any decoration at all nudges an object toward ornamental reading. */
	{
		condition: (f) => f.decorativeLayerCount >= 1,
		tags: new Map([['ornament', 0.2]]),
	},

	// --- Decorative (dormant — fire once 2GN.33 assigns motifs/materials to layers) ---------------

	/**
	 * DORMANT: `preciousMaterialsInDecoration` has no producer yet (roadmap 2GN.33). Authored now
	 * so the design is captured in one place; fires on no artefact until that task lands.
	 */
	{
		condition: (f) => f.preciousMaterialsInDecoration,
		tags: new Map([['elite', 0.5], ['ceremonial', 0.3], ['votive', 0.2]]),
	},

	/**
	 * DORMANT: `motifPresent`/`motifCulturalOrigins` have no producer yet (roadmap 2GN.33).
	 * Cross-cultural motifs on one object signal exchange/trade. Fires on no artefact until 2GN.33.
	 */
	{
		condition: (f) => f.motifPresent && f.motifCulturalOrigins.length > 1,
		tags: new Map([['trade-good', 0.4], ['elite', 0.2]]),
	},

	// --- Cross-layer ---------------------------------------------------------------------------------

	/** An edged, decorated object transcends pure function — the engraved-sword archetype (doc 05 §9.2). */
	{
		condition: (f) => f.hasEdge && f.decorativeLayerCount >= 2,
		tags: new Map([['ritual', 0.5], ['ceremonial', 0.4], ['elite', 0.3]]),
	},

	/** A decorated container reads ritual/display rather than plain cookware. */
	{
		condition: (f) => f.hasContainer && f.decorativeLayerCount >= 2,
		tags: new Map([['ceremonial', 0.4], ['votive', 0.3], ['elite', 0.3]]),
	},
];
