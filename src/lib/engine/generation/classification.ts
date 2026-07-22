/**
 * Unified feature extraction (doc 05 §9.1, roadmap 2GN.19).
 *
 * Runs once across a complete artefact — structural components, attachments and decorative layers
 * together — and produces the single `ExtractedFeatures` set the classification rules
 * (`data/classification.ts`, roadmap 2GN.17) score against. Every field is derived from a signal
 * the grammar actually rolls (`data/grammars/primitives.ts`) or a decorative-layer fact; nothing
 * is fabricated. Pure and PRNG-free: same artefact in, same features out.
 *
 * Field families and their collapse policies (each multi-component collision resolves to ONE
 * value, per the contracts pinned in `types/artefact.ts` JSDoc):
 *
 * - **Edge/blade**: `hasEdge`/`edgeCount` from `elongated.edge`; `bladeLengthBand` and
 *   `bladeProfile` both read from the DOMINANT edged component (longest blade, earliest position
 *   on ties) so the two fields never describe different blades.
 * - **Container**: `hasContainer`, `openingType`, `containerOpenness`, `wallThickness` and
 *   `baseType` all read from the DOMINANT container component — the largest `hollow-enclosed`
 *   (by `size`), falling back to the longest `cylindrical` — so a bowl with a socketed ferrule
 *   reads the bowl's opening, wall and base, never a mix.
 * - **Perforation**: most classificatorily-loaded value present, priority `central` >
 *   `off-centre` > `single` > `multiple` (pinned by `data/classification.ts`'s rule comments).
 * - **Ring/sheet/curvature**: most-loaded value present — `open` > `overlapping` > `closed`;
 *   `rigid` > `flexible` > `semi-flexible`; `deep` > `shallow` > `flat`.
 * - **Presence flags** (interviewed rule-by-rule 2026-07-22, mirroring the 2GN.17 session):
 *   `hasImpactSurface` = an untapered `bar-form` (a plain bar end is a striking face — hammer,
 *   pestle) or a thick `disc-form` (mace/hammer head). `hasFasteningMechanism` = brooch/buckle
 *   anatomy (an attachment joining a `ring-form` to a sharp, edgeless `elongated` — a pin bearing
 *   on a hoop) or any hinged join, gated to body scale. `isWearable` = a `ring-form` or a
 *   suspension perforation (`single`/`off-centre`), gated to body scale. Both gated flags require
 *   `sizeBand !== 'large'` and `massBand` at most `'light'` — a hinged chest lid or a barrel hoop
 *   is not a dress fastener, and nobody wears a perforated slab.
 * - **Bands**: `massBand` verbatim from `dimensions.mass`; `sizeBand`/`primaryAxisLength`
 *   thresholded over `dimensions.primaryExtent` at the midpoints of `grammar.ts`'s provisional
 *   band-to-centimetre tables (MVP-provisional per the 2GN.8 precedent, tuned once observable in
 *   the Explorer).
 * - **Decorative**: counts and technique variety walk `sublayers` recursively;
 *   `appliedElementPresent` resolves technique category against `DECORATIVE_TECHNIQUES`
 *   (roadmap 2GN.28) rather than hardcoding the applied-element list.
 * - **Dormant** (no producer yet): `motifPresent` honestly reads `motifRef` presence — always
 *   `false` until motif assignment lands (roadmap 2GN.33); `motifCulturalOrigins` stays `[]` and
 *   `preciousMaterialsInDecoration` stays `false` until the motif→culture and layer-material
 *   lookups exist (roadmap 2GN.34).
 *
 * Unrecognised or absent parameter values degrade gracefully to each primitive's first-listed BNF
 * value rather than throwing, mirroring `bandExtentCm` in `grammar.ts` — the primitive vocabulary
 * may grow, and extraction must stay total.
 *
 * `classifyArtefact` (roadmap 2GN.20) is the downstream consumer; material-derived and
 * decorative-motif fields complete the doc 05 stage-8 contract later (roadmap 2GN.27, 2GN.34).
 */

import type {
	Attachment,
	ExtractedFeatures,
	NormalisedArtefact,
	NormalisedComponent,
} from '../../types/artefact.ts';
import type { DecorativeLayer } from '../../types/decoration.ts';
import { DECORATIVE_TECHNIQUES } from '../../data/decorations.ts';

// --- Provisional thresholds (MVP-provisional per the 2GN.8 band-table precedent) -------------------

/**
 * `primaryAxisLength` band edges over `dimensions.primaryExtent`, at the midpoints of
 * `grammar.ts`'s `SHORT_MEDIUM_LONG_CM` table (short 4cm / medium 14cm / long 40cm).
 */
const AXIS_SHORT_MAX_CM = 8;
const AXIS_MEDIUM_MAX_CM = 25;

/**
 * `sizeBand` edges over `dimensions.primaryExtent`, at the midpoints of `grammar.ts`'s
 * `SMALL_MEDIUM_LARGE_CM` table (small 5cm / medium 15cm / large 45cm).
 */
const SIZE_SMALL_MAX_CM = 10;
const SIZE_MEDIUM_MAX_CM = 30;

/**
 * Collapses an `openingType` band to the 0 (sealed) – 1 (fully open) float the doc 05 §9.1
 * `containerOpenness` field carries. Values are MVP-provisional; the graded `openingType` rules
 * in `data/classification.ts` are the primary consumers, this float is kept for doc 05 §9.2-style
 * threshold rules.
 */
const OPENNESS_BY_OPENING: Record<ExtractedFeatures['openingType'], number> = {
	'wide': 1,
	'open': 0.8,
	'narrow': 0.4,
	'restricted': 0.3,
	'slit': 0.1,
	'closed': 0,
	'none': 0,
};

/** Decorative techniques in the `applied-element` BNF category (doc 05 §8.2), from the 2GN.28 catalogue. */
const APPLIED_ELEMENT_TECHNIQUES: ReadonlySet<string> = new Set(
	DECORATIVE_TECHNIQUES.filter((t) => t.category === 'applied-element').map((t) => t.technique),
);

// --- Property access ------------------------------------------------------------------------------

/** Reads a string-valued property off a component; `undefined` when absent or non-string. */
function prop(component: NormalisedComponent, name: string): string | undefined {
	const value = component.properties.get(name);
	return typeof value === 'string' ? value : undefined;
}

/**
 * Reads a property and narrows it to an allowed vocabulary, degrading to the vocabulary's
 * first entry (the primitive's first-listed BNF value) when absent or unrecognised.
 */
function bandProp<T extends string>(
	component: NormalisedComponent,
	name: string,
	vocabulary: readonly T[],
): T {
	const value = prop(component, name);
	return (vocabulary as readonly string[]).includes(value ?? '') ? value as T : vocabulary[0];
}

/** Picks the highest-priority value present, `fallback` when the list is empty. */
function highestPriority<T extends string>(
	values: readonly string[],
	priority: readonly T[],
	fallback: T,
): T {
	for (const candidate of priority) {
		if (values.includes(candidate)) return candidate;
	}
	return fallback;
}

// --- Edge / blade family ----------------------------------------------------------------------------

/** How many cutting edges an elongated component's `edge` parameter declares. */
function edgeCountOf(component: NormalisedComponent): number {
	const edge = prop(component, 'edge');
	if (edge === 'single') return 1;
	if (edge === 'double') return 2;
	return 0;
}

const BLADE_LENGTH_ORDER: readonly ('short' | 'medium' | 'long')[] = ['short', 'medium', 'long'];

/**
 * The dominant edged component — the longest blade, earliest `position` on ties — so
 * `bladeLengthBand` and `bladeProfile` always describe the same physical blade.
 */
function dominantBlade(edged: readonly NormalisedComponent[]): NormalisedComponent | undefined {
	let best: NormalisedComponent | undefined;
	let bestRank = -1;
	for (const component of edged) {
		const rank = BLADE_LENGTH_ORDER.indexOf(bandProp(component, 'length', BLADE_LENGTH_ORDER));
		if (rank > bestRank) {
			best = component;
			bestRank = rank;
		}
	}
	return best;
}

/**
 * Cut-vs-thrust geometry from the dominant blade's `crossSection` + `taper` (the contract pinned
 * in `types/artefact.ts`): flat/rectangular sections read `'cutting'`; diamond/triangular sections
 * with an abrupt taper read `'thrusting'`; everything else `'general'`.
 */
function bladeProfileOf(blade: NormalisedComponent): ExtractedFeatures['bladeProfile'] {
	const crossSection = prop(blade, 'crossSection');
	if (crossSection === 'flat' || crossSection === 'rectangular') return 'cutting';
	const pointed = crossSection === 'diamond' || crossSection === 'triangular';
	if (pointed && prop(blade, 'taper') === 'abrupt') return 'thrusting';
	return 'general';
}

// --- Container family -------------------------------------------------------------------------------

const CONTAINER_SIZE_ORDER: readonly ('small' | 'medium' | 'large')[] = [
	'small',
	'medium',
	'large',
];

/**
 * The dominant container component: the largest `hollow-enclosed` (by `size`), falling back to
 * the longest `cylindrical` — the dedicated vessel primitive outranks the tube, which is as often
 * a socket or ferrule as a beaker. Earliest `position` wins ties. All container-facts fields
 * (`openingType`, `wallThickness`, `baseType`) read from this one component.
 */
function dominantContainer(
	components: readonly NormalisedComponent[],
): NormalisedComponent | undefined {
	let bestHollow: NormalisedComponent | undefined;
	let bestHollowRank = -1;
	let bestCylinder: NormalisedComponent | undefined;
	let bestCylinderRank = -1;

	for (const component of components) {
		if (component.primitiveType === 'hollow-enclosed') {
			const rank = CONTAINER_SIZE_ORDER.indexOf(
				bandProp(component, 'size', CONTAINER_SIZE_ORDER),
			);
			if (rank > bestHollowRank) {
				bestHollow = component;
				bestHollowRank = rank;
			}
		} else if (component.primitiveType === 'cylindrical') {
			const rank = BLADE_LENGTH_ORDER.indexOf(bandProp(component, 'length', BLADE_LENGTH_ORDER));
			if (rank > bestCylinderRank) {
				bestCylinder = component;
				bestCylinderRank = rank;
			}
		}
	}

	return bestHollow ?? bestCylinder;
}

/** The dominant container's opening band, in its own primitive's vocabulary (doc 05 §5.3). */
function openingTypeOf(container: NormalisedComponent): ExtractedFeatures['openingType'] {
	return container.primitiveType === 'hollow-enclosed'
		? bandProp(container, 'opening', ['wide', 'narrow', 'slit', 'none'] as const)
		: bandProp(container, 'opening', ['open', 'restricted', 'closed'] as const);
}

// --- Presence flags (interviewed derivations, 2026-07-22) -------------------------------------------

/**
 * A striking/impact surface: an untapered `bar-form` (a plain bar end is a striking face —
 * hammer, pestle) or a thick `disc-form` (mace/hammer head).
 */
function hasImpactSurfaceIn(components: readonly NormalisedComponent[]): boolean {
	return components.some((component) =>
		(component.primitiveType === 'bar-form' && prop(component, 'taper') === 'none') ||
		(component.primitiveType === 'disc-form' && prop(component, 'thickness') === 'thick')
	);
}

/** A sharp, edgeless elongated component — the PIN of brooch/buckle anatomy. */
function isPin(component: NormalisedComponent): boolean {
	return component.primitiveType === 'elongated' &&
		prop(component, 'point') === 'sharp' &&
		edgeCountOf(component) === 0;
}

/**
 * Fastening-mechanism anatomy, before the body-scale gate: an attachment joining a `ring-form`
 * to a pin (a pin bearing on a hoop — fibula, penannular brooch, buckle), or any hinged join
 * (hinge, latch, articulated clasp).
 */
function hasFasteningAnatomy(
	components: readonly NormalisedComponent[],
	attachments: readonly Attachment[],
): boolean {
	const byId = new Map(components.map((component) => [component.id, component]));

	return attachments.some((attachment) => {
		if (attachment.type === 'hinged') return true;
		const from = byId.get(attachment.fromComponentId);
		const to = byId.get(attachment.toComponentId);
		if (!from || !to) return false;
		return (from.primitiveType === 'ring-form' && isPin(to)) ||
			(to.primitiveType === 'ring-form' && isPin(from));
	});
}

// --- Decorative family -------------------------------------------------------------------------------

/** One flattened pass over a decorative layer tree: totals, variety, depth and motif count. */
interface DecorativeTally {
	layerCount: number;
	techniques: Set<string>;
	maxDepth: number;
	motifCount: number;
	appliedElementPresent: boolean;
}

/** Walks `sublayers` recursively, accumulating the tally. `depth` is 1-based. */
function tallyLayers(
	layers: readonly DecorativeLayer[],
	depth: number,
	tally: DecorativeTally,
): void {
	for (const layer of layers) {
		tally.layerCount++;
		tally.techniques.add(layer.technique);
		tally.maxDepth = Math.max(tally.maxDepth, depth);
		if (layer.motifRef !== undefined) tally.motifCount++;
		if (APPLIED_ELEMENT_TECHNIQUES.has(layer.technique)) tally.appliedElementPresent = true;
		tallyLayers(layer.sublayers, depth + 1, tally);
	}
}

// --- Extraction -------------------------------------------------------------------------------------

/**
 * Extracts the unified feature set from a complete artefact (doc 05 §9.1, roadmap 2GN.19) — the
 * single input the classification rules (`data/classification.ts`) score against.
 *
 * Pure and PRNG-free; never mutates `artefact` or `decorativeLayers`. See the module comment for
 * the per-family collapse policies and the interviewed presence-flag derivations.
 *
 * @param artefact - The normalised artefact (post 2GN.8 flatten; materials need not be assigned —
 *   material-derived features are roadmap 2GN.27's).
 * @param decorativeLayers - The artefact's decorative layers (`expandDecoration`, roadmap 2GN.29).
 *   Defaults to none, for callers extracting from a bare structure.
 * @returns The complete `ExtractedFeatures` contract the 2GN.17 rules were authored against, with
 *   the dormant motif/material fields at their honest no-producer defaults (roadmap 2GN.33/2GN.34).
 */
export function extractFeatures(
	artefact: NormalisedArtefact,
	decorativeLayers: readonly DecorativeLayer[] = [],
): ExtractedFeatures {
	const { components, attachments, dimensions } = artefact;

	// Edge / blade family — `bladeLengthBand`/`bladeProfile` read the same dominant blade.
	const edged = components.filter((component) => edgeCountOf(component) > 0);
	const edgeCount = edged.reduce((sum, component) => sum + edgeCountOf(component), 0);
	const hasEdge = edgeCount > 0;
	const blade = dominantBlade(edged);
	const bladeLengthBand: ExtractedFeatures['bladeLengthBand'] = blade
		? bandProp(blade, 'length', BLADE_LENGTH_ORDER)
		: 'none';
	const bladeProfile: ExtractedFeatures['bladeProfile'] = blade ? bladeProfileOf(blade) : 'none';

	// Point family — sharp outranks blunt when both are present.
	const points = components
		.filter((component) => component.primitiveType === 'elongated')
		.map((component) => prop(component, 'point') ?? 'none');
	const pointSharpness = highestPriority(points, ['sharp', 'blunt'] as const, 'none');
	const hasPoint = pointSharpness !== 'none';

	// Container family — all facts read from the one dominant container component.
	const container = dominantContainer(components);
	const hasContainer = container !== undefined;
	const openingType: ExtractedFeatures['openingType'] = container
		? openingTypeOf(container)
		: 'none';
	const containerOpenness = OPENNESS_BY_OPENING[openingType];
	const wallThickness: ExtractedFeatures['wallThickness'] = container
		? bandProp(container, 'wall', ['thin', 'medium', 'thick'] as const)
		: 'none';
	const baseType: ExtractedFeatures['baseType'] = container
		? (container.primitiveType === 'hollow-enclosed'
			? bandProp(container, 'base', ['flat', 'rounded', 'pedestal'] as const)
			: bandProp(container, 'base', ['flat', 'rounded', 'pointed'] as const))
		: 'none';

	// Perforation — one value, most classificatorily loaded (contract pinned by 2GN.17's rules).
	const perforations = components
		.filter((component) =>
			component.primitiveType === 'flat-broad' || component.primitiveType === 'disc-form'
		)
		.map((component) => prop(component, 'perforation') ?? 'none');
	const perforation = highestPriority(
		perforations,
		['central', 'off-centre', 'single', 'multiple'] as const,
		'none',
	);

	// Ring / sheet / curvature — most-loaded value present.
	const ringGap = highestPriority(
		components
			.filter((component) => component.primitiveType === 'ring-form')
			.map((component) => bandProp(component, 'gap', ['closed', 'open', 'overlapping'] as const)),
		['open', 'overlapping', 'closed'] as const,
		'none',
	);
	const sheetFlexibility = highestPriority(
		components
			.filter((component) => component.primitiveType === 'sheet-form')
			.map((component) =>
				bandProp(component, 'flexibility', ['rigid', 'semi-flexible', 'flexible'] as const)
			),
		['rigid', 'flexible', 'semi-flexible'] as const,
		'none',
	);
	const curvature = highestPriority(
		components
			.filter((component) => component.primitiveType === 'flat-broad')
			.map((component) => bandProp(component, 'curvature', ['flat', 'shallow', 'deep'] as const)),
		['deep', 'shallow', 'flat'] as const,
		'none',
	);

	// Bands — physical facts, computed before the gated presence flags that read them.
	const massBand = dimensions.mass;
	const sizeBand: ExtractedFeatures['sizeBand'] = dimensions.primaryExtent <= SIZE_SMALL_MAX_CM
		? 'small'
		: dimensions.primaryExtent <= SIZE_MEDIUM_MAX_CM
		? 'medium'
		: 'large';
	const primaryAxisLength: ExtractedFeatures['primaryAxisLength'] =
		dimensions.primaryExtent <= AXIS_SHORT_MAX_CM
			? 'short'
			: dimensions.primaryExtent <= AXIS_MEDIUM_MAX_CM
			? 'medium'
			: 'long';

	// Presence flags — impact ungated; fastening and wearable gated to body scale.
	const hasImpactSurface = hasImpactSurfaceIn(components);
	const bodyScale = sizeBand !== 'large' &&
		(massBand === 'negligible' || massBand === 'light');
	const hasFasteningMechanism = bodyScale && hasFasteningAnatomy(components, attachments);
	const hasRingForm = components.some((component) => component.primitiveType === 'ring-form');
	const suspensionPerforation = perforation === 'single' || perforation === 'off-centre';
	const isWearable = bodyScale && (hasRingForm || suspensionPerforation);

	// Decorative family — one recursive walk over the layer tree.
	const tally: DecorativeTally = {
		layerCount: 0,
		techniques: new Set(),
		maxDepth: 0,
		motifCount: 0,
		appliedElementPresent: false,
	};
	tallyLayers(decorativeLayers, 1, tally);
	const motifDensity = tally.layerCount > 0 ? tally.motifCount / tally.layerCount : 0;

	// Combined complexity (doc 05 §9.1's stated compositions, MVP-provisional formulas).
	const functionalComplexity = Number(hasEdge) + Number(hasPoint) + Number(hasImpactSurface) +
		Number(hasContainer);
	const decorativeComplexity = tally.layerCount + tally.techniques.size + motifDensity;

	return {
		hasEdge,
		edgeCount,
		hasPoint,
		pointSharpness,
		hasImpactSurface,
		hasContainer,
		containerOpenness,
		openingType,
		hasFasteningMechanism,
		primaryAxisLength,
		bladeLengthBand,
		bladeProfile,
		isWearable,
		partCount: components.length,
		attachmentDiversity: new Set(attachments.map((attachment) => attachment.type)).size,
		perforation,
		wallThickness,
		ringGap,
		sheetFlexibility,
		massBand,
		sizeBand,
		curvature,
		baseType,
		decorativeLayerCount: tally.layerCount,
		appliedElementPresent: tally.appliedElementPresent,
		motifPresent: tally.motifCount > 0,
		motifCulturalOrigins: [], // DORMANT — motif→culture lookup is roadmap 2GN.34's.
		techniqueComplexity: tally.maxDepth * tally.techniques.size,
		preciousMaterialsInDecoration: false, // DORMANT — layer materials land with roadmap 2GN.33.
		decorativeComplexity,
		overallComplexity: functionalComplexity + decorativeComplexity,
		functionalComplexity,
		portability: artefact.portability,
		inspectionDepth: artefact.inspectionDepth,
	};
}
