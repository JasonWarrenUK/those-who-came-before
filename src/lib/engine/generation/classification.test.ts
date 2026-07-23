/// <reference lib="deno.ns" />
import { assert, assertEquals } from '@std/assert';
import { classifyArtefact, extractFeatures } from './classification.ts';
import { mockNormalisedArtefact } from '../../../../tests/fixtures/artefact.ts';
import type {
	ExtractedFeatures,
	NormalisedArtefact,
	NormalisedComponent,
} from '../../types/artefact.ts';
import type { AttachmentType } from '../../types/grammar.ts';
import type { DecorativeLayer } from '../../types/decoration.ts';
import type { ClassificationRule, ContextTag, FunctionTag } from '../../types/tags.ts';
import { CONTEXT_TAGS, FUNCTION_TAGS } from '../../types/tags.ts';
import { CLASSIFICATION_RULES } from '../../data/classification.ts';

/** Builds a component of a given primitive with string properties, distinguishable by id. */
function component(
	id: string,
	primitiveType: string,
	properties: Record<string, string> = {},
): NormalisedComponent {
	return {
		id,
		primitiveType,
		properties: new Map<string, string | number>(Object.entries(properties)),
		allowedMaterialTags: [],
		position: 0,
	};
}

/**
 * An artefact from explicit components, defaulting to body-scale dimensions (10cm, light) so
 * gated presence flags can fire unless a test overrides the scale.
 */
function artefactOf(
	components: NormalisedComponent[],
	overrides: Partial<NormalisedArtefact> = {},
): NormalisedArtefact {
	return mockNormalisedArtefact({
		components,
		dimensions: { primaryExtent: 10, secondaryExtent: 4, mass: 'light' },
		...overrides,
	});
}

/** One attachment between two component ids. */
function attachment(from: string, to: string, type: AttachmentType) {
	return { fromComponentId: from, toComponentId: to, type };
}

/** A decorative layer with optional sublayers and motif. */
function layer(
	technique: DecorativeLayer['technique'],
	sublayers: DecorativeLayer[] = [],
	motifRef?: string,
): DecorativeLayer {
	return { targetComponentId: 'c0', technique, motifRef, sublayers };
}

// --- Purity -----------------------------------------------------------------------------------------

Deno.test('extractFeatures: pure — same input twice gives equal output, input unmutated', () => {
	const artefact = artefactOf([
		component('c0', 'elongated', { length: 'long', edge: 'single', point: 'sharp' }),
	]);
	const before = structuredClone(artefact.components[0].properties);

	const first = extractFeatures(artefact);
	const second = extractFeatures(artefact);

	assertEquals(first, second);
	assertEquals(artefact.components[0].properties, before);
});

// --- Edge / blade family ------------------------------------------------------------------------------

Deno.test('extractFeatures: no edged component — hasEdge false, blade fields none', () => {
	const features = extractFeatures(artefactOf([component('c0', 'bar-form')]));

	assertEquals(features.hasEdge, false);
	assertEquals(features.edgeCount, 0);
	assertEquals(features.bladeLengthBand, 'none');
	assertEquals(features.bladeProfile, 'none');
});

Deno.test('extractFeatures: edgeCount sums single (1) and double (2) across components', () => {
	const features = extractFeatures(artefactOf([
		component('c0', 'elongated', { length: 'short', edge: 'single' }),
		component('c1', 'elongated', { length: 'long', edge: 'double' }),
	]));

	assertEquals(features.hasEdge, true);
	assertEquals(features.edgeCount, 3);
});

Deno.test('extractFeatures: bladeLengthBand and bladeProfile read the same dominant (longest) blade', () => {
	const features = extractFeatures(artefactOf([
		component('c0', 'elongated', {
			length: 'short',
			edge: 'single',
			crossSection: 'rectangular',
		}),
		component('c1', 'elongated', {
			length: 'long',
			edge: 'single',
			crossSection: 'diamond',
			taper: 'abrupt',
		}),
	]));

	assertEquals(features.bladeLengthBand, 'long');
	assertEquals(features.bladeProfile, 'thrusting'); // The long diamond blade, not the short cutter.
});

Deno.test('extractFeatures: bladeProfile — rectangular cuts, diamond+abrupt thrusts, else general', () => {
	const profileOf = (props: Record<string, string>) =>
		extractFeatures(artefactOf([component('c0', 'elongated', { edge: 'single', ...props })]))
			.bladeProfile;

	assertEquals(profileOf({ crossSection: 'rectangular' }), 'cutting');
	assertEquals(profileOf({ crossSection: 'diamond', taper: 'abrupt' }), 'thrusting');
	assertEquals(profileOf({ crossSection: 'triangular', taper: 'abrupt' }), 'thrusting');
	assertEquals(profileOf({ crossSection: 'diamond', taper: 'gradual' }), 'general');
	assertEquals(profileOf({ crossSection: 'round' }), 'general');
});

// --- Point family --------------------------------------------------------------------------------------

Deno.test('extractFeatures: pointSharpness — sharp outranks blunt, none when no point', () => {
	const sharpnessOf = (points: string[]) =>
		extractFeatures(artefactOf(
			points.map((point, i) => component(`c${i}`, 'elongated', { point })),
		)).pointSharpness;

	assertEquals(sharpnessOf(['none']), 'none');
	assertEquals(sharpnessOf(['blunt']), 'blunt');
	assertEquals(sharpnessOf(['blunt', 'sharp']), 'sharp');
	assertEquals(
		extractFeatures(artefactOf([component('c0', 'elongated', { point: 'sharp' })])).hasPoint,
		true,
	);
	assertEquals(extractFeatures(artefactOf([component('c0', 'bar-form')])).hasPoint, false);
});

// --- Container family ----------------------------------------------------------------------------------

Deno.test('extractFeatures: no container primitive — container fields all none/zero', () => {
	const features = extractFeatures(artefactOf([component('c0', 'elongated')]));

	assertEquals(features.hasContainer, false);
	assertEquals(features.openingType, 'none');
	assertEquals(features.containerOpenness, 0);
	assertEquals(features.wallThickness, 'none');
	assertEquals(features.baseType, 'none');
});

Deno.test('extractFeatures: hollow-enclosed container carries its own opening/wall/base vocabulary', () => {
	const features = extractFeatures(artefactOf([
		component('c0', 'hollow-enclosed', {
			size: 'medium',
			opening: 'wide',
			wall: 'thin',
			base: 'pedestal',
		}),
	]));

	assertEquals(features.hasContainer, true);
	assertEquals(features.openingType, 'wide');
	assertEquals(features.containerOpenness, 1);
	assertEquals(features.wallThickness, 'thin');
	assertEquals(features.baseType, 'pedestal');
});

Deno.test('extractFeatures: cylindrical container carries its own opening/base vocabulary', () => {
	const features = extractFeatures(artefactOf([
		component('c0', 'cylindrical', {
			length: 'medium',
			opening: 'restricted',
			wall: 'thick',
			base: 'pointed',
		}),
	]));

	assertEquals(features.openingType, 'restricted');
	assertEquals(features.wallThickness, 'thick');
	assertEquals(features.baseType, 'pointed');
});

Deno.test('extractFeatures: dominant container — the bowl wins over the socketed ferrule, all facts from it', () => {
	const features = extractFeatures(artefactOf([
		component('c0', 'cylindrical', {
			length: 'long',
			opening: 'open',
			wall: 'thick',
			base: 'flat',
		}),
		component('c1', 'hollow-enclosed', {
			size: 'small',
			opening: 'narrow',
			wall: 'thin',
			base: 'rounded',
		}),
	]));

	// The hollow-enclosed vessel outranks the (longer) cylindrical tube, and opening, wall and
	// base all describe that one component — never a mix.
	assertEquals(features.openingType, 'narrow');
	assertEquals(features.wallThickness, 'thin');
	assertEquals(features.baseType, 'rounded');
});

Deno.test('extractFeatures: containerOpenness grades from sealed 0 to wide-open 1', () => {
	const opennessOf = (opening: string) =>
		extractFeatures(artefactOf([component('c0', 'hollow-enclosed', { opening })]))
			.containerOpenness;

	assertEquals(opennessOf('wide'), 1);
	assertEquals(opennessOf('slit'), 0.1);
	assertEquals(opennessOf('none'), 0);
	assert(opennessOf('narrow') > opennessOf('slit'));
});

// --- Perforation ----------------------------------------------------------------------------------------

Deno.test('extractFeatures: perforation priority central > off-centre > single > multiple > none', () => {
	const perforationOf = (components: NormalisedComponent[]) =>
		extractFeatures(artefactOf(components)).perforation;

	assertEquals(perforationOf([component('c0', 'flat-broad', { perforation: 'none' })]), 'none');
	assertEquals(
		perforationOf([component('c0', 'flat-broad', { perforation: 'single' })]),
		'single',
	);
	assertEquals(
		perforationOf([
			component('c0', 'flat-broad', { perforation: 'multiple' }),
			component('c1', 'flat-broad', { perforation: 'single' }),
		]),
		'single',
	);
	assertEquals(
		perforationOf([
			component('c0', 'flat-broad', { perforation: 'single' }),
			component('c1', 'disc-form', { perforation: 'central' }),
		]),
		'central',
	);
	assertEquals(
		perforationOf([component('c0', 'disc-form', { perforation: 'off-centre' })]),
		'off-centre',
	);
});

// --- Ring / sheet / curvature ----------------------------------------------------------------------------

Deno.test('extractFeatures: ringGap — open outranks closed; none without a ring-form', () => {
	assertEquals(extractFeatures(artefactOf([component('c0', 'bar-form')])).ringGap, 'none');
	assertEquals(
		extractFeatures(artefactOf([component('c0', 'ring-form', { gap: 'closed' })])).ringGap,
		'closed',
	);
	assertEquals(
		extractFeatures(artefactOf([
			component('c0', 'ring-form', { gap: 'closed' }),
			component('c1', 'ring-form', { gap: 'open' }),
		])).ringGap,
		'open',
	);
});

Deno.test('extractFeatures: sheetFlexibility — rigid outranks flexible; none without a sheet-form', () => {
	assertEquals(
		extractFeatures(artefactOf([component('c0', 'bar-form')])).sheetFlexibility,
		'none',
	);
	assertEquals(
		extractFeatures(artefactOf([
			component('c0', 'sheet-form', { flexibility: 'flexible' }),
			component('c1', 'sheet-form', { flexibility: 'rigid' }),
		])).sheetFlexibility,
		'rigid',
	);
});

Deno.test('extractFeatures: curvature — deepest flat-broad wins; none without a flat-broad', () => {
	assertEquals(extractFeatures(artefactOf([component('c0', 'bar-form')])).curvature, 'none');
	assertEquals(
		extractFeatures(artefactOf([
			component('c0', 'flat-broad', { curvature: 'flat' }),
			component('c1', 'flat-broad', { curvature: 'deep' }),
		])).curvature,
		'deep',
	);
});

// --- Bands -----------------------------------------------------------------------------------------------

Deno.test('extractFeatures: massBand carries dimensions.mass verbatim', () => {
	const features = extractFeatures(artefactOf(
		[component('c0', 'bar-form')],
		{ dimensions: { primaryExtent: 10, secondaryExtent: 4, mass: 'very-heavy' } },
	));

	assertEquals(features.massBand, 'very-heavy');
});

Deno.test('extractFeatures: sizeBand and primaryAxisLength threshold over primaryExtent', () => {
	const bandsAt = (primaryExtent: number) => {
		const features = extractFeatures(artefactOf(
			[component('c0', 'bar-form')],
			{ dimensions: { primaryExtent, secondaryExtent: 2, mass: 'light' } },
		));
		return { size: features.sizeBand, axis: features.primaryAxisLength };
	};

	assertEquals(bandsAt(5), { size: 'small', axis: 'short' });
	assertEquals(bandsAt(10), { size: 'small', axis: 'medium' });
	assertEquals(bandsAt(25), { size: 'medium', axis: 'medium' });
	assertEquals(bandsAt(30), { size: 'medium', axis: 'long' });
	assertEquals(bandsAt(45), { size: 'large', axis: 'long' });
});

// --- Structure counts --------------------------------------------------------------------------------------

Deno.test('extractFeatures: partCount and attachmentDiversity (distinct types, not raw count)', () => {
	const features = extractFeatures(artefactOf(
		[
			component('c0', 'elongated'),
			component('c1', 'bar-form'),
			component('c2', 'disc-form'),
		],
		{
			attachments: [
				attachment('c0', 'c1', 'socketed'),
				attachment('c0', 'c2', 'socketed'),
				attachment('c1', 'c2', 'riveted'),
			],
		},
	));

	assertEquals(features.partCount, 3);
	assertEquals(features.attachmentDiversity, 2);
});

// --- hasImpactSurface (interviewed derivation) --------------------------------------------------------------

Deno.test('extractFeatures: hasImpactSurface — untapered bar-form or thick disc-form, nothing else', () => {
	const impactOf = (components: NormalisedComponent[]) =>
		extractFeatures(artefactOf(components)).hasImpactSurface;

	assertEquals(impactOf([component('c0', 'bar-form', { taper: 'none' })]), true);
	assertEquals(impactOf([component('c0', 'disc-form', { thickness: 'thick' })]), true);
	assertEquals(impactOf([component('c0', 'bar-form', { taper: 'single-end' })]), false);
	assertEquals(impactOf([component('c0', 'disc-form', { thickness: 'thin' })]), false);
	assertEquals(impactOf([component('c0', 'elongated', { point: 'blunt' })]), false);
});

Deno.test('extractFeatures: presence flags never degrade — unreadable signals stay false', () => {
	// Band-valued fields degrade to first-listed BNF values, but the presence flags read strict
	// equality: an absent or unrecognised `taper` must not fabricate a striking face (the
	// degraded value would be 'none', which IS the impact anatomy).
	const absent = extractFeatures(artefactOf([component('c0', 'bar-form')]));
	const unrecognised = extractFeatures(
		artefactOf([component('c0', 'bar-form', { taper: 'corkscrew' })]),
	);

	assertEquals(absent.hasImpactSurface, false);
	assertEquals(unrecognised.hasImpactSurface, false);
});

// --- hasFasteningMechanism (interviewed derivation) ------------------------------------------------------------

Deno.test('extractFeatures: fastening — pin-on-hoop anatomy fires at body scale', () => {
	const features = extractFeatures(artefactOf(
		[
			component('c0', 'ring-form', { gap: 'open' }),
			component('c1', 'elongated', { point: 'sharp', edge: 'none' }),
		],
		{ attachments: [attachment('c0', 'c1', 'friction-fit')] },
	));

	assertEquals(features.hasFasteningMechanism, true);
});

Deno.test('extractFeatures: fastening — hinged join fires at body scale', () => {
	const features = extractFeatures(artefactOf(
		[component('c0', 'sheet-form'), component('c1', 'sheet-form')],
		{ attachments: [attachment('c0', 'c1', 'hinged')] },
	));

	assertEquals(features.hasFasteningMechanism, true);
});

Deno.test('extractFeatures: fastening — an edged or unsharp elongated is not a pin', () => {
	const fasteningOf = (pinProps: Record<string, string>) =>
		extractFeatures(artefactOf(
			[
				component('c0', 'ring-form', { gap: 'open' }),
				component('c1', 'elongated', pinProps),
			],
			{ attachments: [attachment('c0', 'c1', 'friction-fit')] },
		)).hasFasteningMechanism;

	assertEquals(fasteningOf({ point: 'sharp', edge: 'single' }), false); // Edged — a blade, not a pin.
	assertEquals(fasteningOf({ point: 'blunt', edge: 'none' }), false); // Blunt — a rod, not a pin.
});

Deno.test('extractFeatures: fastening — body-scale gate blocks large and heavy mechanisms', () => {
	const anatomy: [NormalisedComponent[], NormalisedArtefact['attachments']] = [
		[component('c0', 'sheet-form'), component('c1', 'sheet-form')],
		[attachment('c0', 'c1', 'hinged')],
	];

	const large = extractFeatures(artefactOf(anatomy[0], {
		attachments: anatomy[1],
		dimensions: { primaryExtent: 45, secondaryExtent: 30, mass: 'light' },
	}));
	const heavy = extractFeatures(artefactOf(anatomy[0], {
		attachments: anatomy[1],
		dimensions: { primaryExtent: 10, secondaryExtent: 4, mass: 'moderate' },
	}));

	assertEquals(large.hasFasteningMechanism, false); // A hinged chest lid is not a clasp.
	assertEquals(heavy.hasFasteningMechanism, false);
});

// --- isWearable (interviewed derivation) --------------------------------------------------------------------

Deno.test('extractFeatures: wearable — ring-form or suspension perforation at body scale', () => {
	const ring = extractFeatures(artefactOf([component('c0', 'ring-form', { gap: 'closed' })]));
	const pendant = extractFeatures(
		artefactOf([component('c0', 'flat-broad', { perforation: 'single' })]),
	);
	const hungDisc = extractFeatures(
		artefactOf([component('c0', 'disc-form', { perforation: 'off-centre' })]),
	);

	assertEquals(ring.isWearable, true);
	assertEquals(pendant.isWearable, true);
	assertEquals(hungDisc.isWearable, true);
});

Deno.test('extractFeatures: wearable — rotation/fixing perforations and plain forms do not wear', () => {
	const whorl = extractFeatures(
		artefactOf([component('c0', 'disc-form', { perforation: 'central' })]),
	);
	const fitting = extractFeatures(
		artefactOf([component('c0', 'flat-broad', { perforation: 'multiple' })]),
	);
	const bar = extractFeatures(artefactOf([component('c0', 'bar-form')]));

	assertEquals(whorl.isWearable, false); // Central hole is rotation, not suspension.
	assertEquals(fitting.isWearable, false); // Multiple holes are sewn/riveted fixing.
	assertEquals(bar.isWearable, false);
});

Deno.test('extractFeatures: wearable — body-scale gate blocks the barrel hoop and the heavy slab', () => {
	const hoop = extractFeatures(artefactOf(
		[component('c0', 'ring-form', { gap: 'closed' })],
		{ dimensions: { primaryExtent: 45, secondaryExtent: 45, mass: 'light' } },
	));
	const slab = extractFeatures(artefactOf(
		[component('c0', 'flat-broad', { perforation: 'single' })],
		{ dimensions: { primaryExtent: 10, secondaryExtent: 8, mass: 'moderate' } },
	));

	assertEquals(hoop.isWearable, false);
	assertEquals(slab.isWearable, false);
});

// --- Decorative family ----------------------------------------------------------------------------------------

Deno.test('extractFeatures: no layers — decorative fields at zero/false defaults', () => {
	const features = extractFeatures(artefactOf([component('c0', 'bar-form')]));

	assertEquals(features.decorativeLayerCount, 0);
	assertEquals(features.appliedElementPresent, false);
	assertEquals(features.motifPresent, false);
	assertEquals(features.motifCulturalOrigins, []);
	assertEquals(features.techniqueComplexity, 0);
	assertEquals(features.decorativeComplexity, 0);
});

Deno.test('extractFeatures: layer count and technique variety walk sublayers recursively', () => {
	const layers = [
		layer('engraving', [layer('inlay', [layer('scoring')])]),
		layer('polish'),
	];
	const features = extractFeatures(artefactOf([component('c0', 'bar-form')]), layers);

	assertEquals(features.decorativeLayerCount, 4); // engraving + inlay + scoring + polish.
	assertEquals(features.techniqueComplexity, 3 * 4); // Depth 3 × 4 distinct techniques.
	assertEquals(features.appliedElementPresent, true); // Inlay is applied-element, found in a sublayer.
});

Deno.test('extractFeatures: surface treatments alone never read as applied elements', () => {
	const features = extractFeatures(
		artefactOf([component('c0', 'bar-form')]),
		[layer('polish'), layer('engraving')],
	);

	assertEquals(features.appliedElementPresent, false);
});

Deno.test('extractFeatures: motifPresent reads motifRef honestly (dormant until 2GN.33 produces one)', () => {
	const without = extractFeatures(artefactOf([component('c0', 'bar-form')]), [layer('engraving')]);
	const withMotif = extractFeatures(
		artefactOf([component('c0', 'bar-form')]),
		[layer('engraving', [], 'motif-spiral')],
	);

	assertEquals(without.motifPresent, false);
	assertEquals(withMotif.motifPresent, true);
	assertEquals(withMotif.motifCulturalOrigins, []); // Motif→culture lookup is 2GN.34's.
	assertEquals(withMotif.preciousMaterialsInDecoration, false); // Layer materials are 2GN.33's.
});

// --- Combined complexity -----------------------------------------------------------------------------------------

Deno.test('extractFeatures: functionalComplexity counts the four presence facts', () => {
	const inert = extractFeatures(artefactOf([component('c0', 'sheet-form')]));
	const busy = extractFeatures(artefactOf([
		component('c0', 'elongated', { edge: 'single', point: 'sharp' }),
		component('c1', 'bar-form', { taper: 'none' }),
		component('c2', 'hollow-enclosed', { opening: 'wide' }),
	]));

	assertEquals(inert.functionalComplexity, 0);
	assertEquals(busy.functionalComplexity, 4); // Edge + point + impact + container.
});

Deno.test('extractFeatures: decorative and overall complexity compose per doc 05 §9.1', () => {
	const layers = [layer('engraving', [], 'motif-a'), layer('polish')];
	const features = extractFeatures(
		artefactOf([component('c0', 'elongated', { edge: 'single' })]),
		layers,
	);

	// 2 layers + 2 distinct techniques + 0.5 motif density; overall adds functional (edge only).
	assertEquals(features.decorativeComplexity, 4.5);
	assertEquals(features.overallComplexity, features.functionalComplexity + 4.5);
});

// --- Mechanical passthrough ----------------------------------------------------------------------------------------

Deno.test('extractFeatures: portability and inspectionDepth carry through verbatim', () => {
	const features = extractFeatures(artefactOf(
		[component('c0', 'bar-form')],
		{ portability: 'team-lift', inspectionDepth: 'observational' },
	));

	assertEquals(features.portability, 'team-lift');
	assertEquals(features.inspectionDepth, 'observational');
});

// --- Graceful degradation -------------------------------------------------------------------------------------------

Deno.test('extractFeatures: unrecognised parameter values degrade to first-listed BNF values, never throw', () => {
	const features = extractFeatures(artefactOf([
		component('c0', 'hollow-enclosed', { opening: 'unheard-of', wall: 'gossamer' }),
		component('c1', 'ring-form', { gap: 'quantum' }),
	]));

	assertEquals(features.openingType, 'wide'); // hollow-enclosed's first-listed opening.
	assertEquals(features.wallThickness, 'thin');
	assertEquals(features.ringGap, 'closed');
});

// --- classifyArtefact (2GN.20) ----------------------------------------------------------------------

/**
 * A neutral baseline `ExtractedFeatures` for driving fixture rules directly — every boolean
 * `false`, every count/complexity `0`, banded fields at `'none'`. Mirrors the sibling builder in
 * `data/classification.test.ts` rather than exporting the private fixture default.
 */
function features(overrides: Partial<ExtractedFeatures> = {}): ExtractedFeatures {
	const defaults: ExtractedFeatures = {
		hasEdge: false,
		edgeCount: 0,
		hasPoint: false,
		pointSharpness: 'none',
		hasImpactSurface: false,
		hasContainer: false,
		containerOpenness: 0,
		openingType: 'none',
		hasFasteningMechanism: false,
		primaryAxisLength: 'medium',
		bladeLengthBand: 'none',
		bladeProfile: 'none',
		isWearable: false,
		partCount: 0,
		attachmentDiversity: 0,
		perforation: 'none',
		wallThickness: 'none',
		ringGap: 'none',
		sheetFlexibility: 'none',
		massBand: 'moderate',
		sizeBand: 'medium',
		curvature: 'none',
		baseType: 'none',
		decorativeLayerCount: 0,
		appliedElementPresent: false,
		motifPresent: false,
		motifCulturalOrigins: [],
		techniqueComplexity: 0,
		preciousMaterialsInDecoration: false,
		functionalComplexity: 0,
		decorativeComplexity: 0,
		overallComplexity: 0,
		portability: 'one-hand',
		inspectionDepth: 'full',
	};
	return { ...defaults, ...overrides };
}

/**
 * A fixture rule from a condition and tag/weight pairs. Weights in these tests are exact binary
 * fractions (0.25, 0.5, 0.75) so plain-sum assertions need no floating-point tolerance.
 */
function rule(
	condition: (f: ExtractedFeatures) => boolean,
	tags: [FunctionTag | ContextTag, number][],
): ClassificationRule {
	return { condition, tags: new Map(tags) };
}

Deno.test('classifyArtefact: rules firing on the same tag sum their weights', () => {
	const scored = classifyArtefact(features({ hasEdge: true }), [
		rule((f) => f.hasEdge, [['weapon', 0.5], ['tool', 0.25]]),
		rule((f) => f.hasEdge, [['weapon', 0.25]]),
	]);

	assertEquals(scored.get('weapon'), 0.75);
	assertEquals(scored.get('tool'), 0.25);
});

Deno.test('classifyArtefact: sums are unbounded — accumulated evidence may exceed 1', () => {
	const scored = classifyArtefact(features({ hasEdge: true }), [
		rule((f) => f.hasEdge, [['weapon', 0.75]]),
		rule((f) => f.hasEdge, [['weapon', 0.5]]),
	]);

	assertEquals(scored.get('weapon'), 1.25);
});

Deno.test('classifyArtefact: a non-matching rule contributes nothing', () => {
	const scored = classifyArtefact(features({ hasEdge: true }), [
		rule((f) => f.hasEdge, [['weapon', 0.5]]),
		rule((f) => f.hasContainer, [['container', 0.75], ['domestic', 0.5]]),
	]);

	assertEquals(scored.get('weapon'), 0.5);
	assertEquals(scored.get('container'), undefined);
	assertEquals(scored.get('domestic'), undefined);
	assertEquals(scored.size, 1);
});

Deno.test('classifyArtefact: zero matching rules give an empty map, not fabricated zeros', () => {
	const scored = classifyArtefact(features(), [
		rule((f) => f.hasEdge, [['weapon', 0.5]]),
		rule((f) => f.hasContainer, [['container', 0.75]]),
	]);

	assertEquals(scored.size, 0);
});

Deno.test('classifyArtefact: absence reads as zero via the ?? 0 convention', () => {
	const scored = classifyArtefact(features({ hasEdge: true }), [
		rule((f) => f.hasEdge, [['weapon', 0.5]]),
	]);

	assertEquals(scored.get('ritual') ?? 0, 0);
});

Deno.test('classifyArtefact: iteration order is canonical — function tags before context tags, vocabulary order within', () => {
	// One rule per tag, deliberately supplied in reverse-canonical order.
	const everyTag = [...FUNCTION_TAGS, ...CONTEXT_TAGS];
	const reversed = [...everyTag].reverse().map((tag) => rule(() => true, [[tag, 0.5]]));

	const scored = classifyArtefact(features(), reversed);

	assertEquals([...scored.keys()], everyTag);
});

Deno.test('classifyArtefact: reordering the rule array never changes the serialised map', () => {
	const rules = [
		rule((f) => f.hasEdge, [['weapon', 0.5], ['ceremonial', 0.25]]),
		rule((f) => f.decorativeComplexity > 0, [['elite', 0.5], ['ornament', 0.25]]),
		rule((f) => f.hasEdge, [['ritual', 0.75]]),
	];
	const input = features({ hasEdge: true, decorativeComplexity: 1 });

	const forward = classifyArtefact(input, rules);
	const backward = classifyArtefact(input, [...rules].reverse());

	assertEquals([...forward.entries()], [...backward.entries()]);
});

Deno.test('classifyArtefact: pure — same input twice gives equal output, features unmutated', () => {
	const input = features({ hasEdge: true });
	const snapshot = structuredClone(input);
	const rules = [rule((f) => f.hasEdge, [['weapon', 0.5]])];

	const first = classifyArtefact(input, rules);
	const second = classifyArtefact(input, rules);

	assertEquals([...first.entries()], [...second.entries()]);
	assertEquals(input, snapshot);
});

Deno.test('integration: the real rules score the engraved long blade on weapon, ritual, ceremonial and elite', () => {
	// Same worked example the rule suite pins at the fire/no-fire level (doc 05 §9.2's closing claim).
	const engravedBlade = features({
		hasEdge: true,
		primaryAxisLength: 'long',
		bladeLengthBand: 'long',
		pointSharpness: 'sharp',
		decorativeLayerCount: 3,
	});

	const scored = classifyArtefact(engravedBlade, CLASSIFICATION_RULES);

	for (const tag of ['weapon', 'ritual', 'ceremonial', 'elite'] as const) {
		assert((scored.get(tag) ?? 0) > 0, `${tag} should accumulate positive evidence`);
	}

	// The overlap is deliberately unresolved (doc 05 §9.2) — and the map comes back canonical.
	const everyTag = [...FUNCTION_TAGS, ...CONTEXT_TAGS];
	const positions = [...scored.keys()].map((tag) => everyTag.indexOf(tag));
	assertEquals([...positions].sort((a, b) => a - b), positions);
});
