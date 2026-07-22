/// <reference lib="deno.ns" />
import { assert, assertEquals } from '@std/assert';
import { CLASSIFICATION_RULES } from './classification.ts';
import type { ContextTag, FunctionTag } from '../types/tags.ts';
import type { ExtractedFeatures } from '../types/artefact.ts';

/** Keyed by `FunctionTag` so the compiler flags a missing entry when the union gains a member. */
const ALL_FUNCTION_TAGS_RECORD: Record<FunctionTag, true> = {
	weapon: true,
	tool: true,
	container: true,
	fastener: true,
	ornament: true,
	ritual: true,
	domestic: true,
	agricultural: true,
	maritime: true,
	funerary: true,
	votive: true,
	'trade-good': true,
	currency: true,
};

/** Keyed by `ContextTag` so the compiler flags a missing entry when the union gains a member. */
const ALL_CONTEXT_TAGS_RECORD: Record<ContextTag, true> = {
	personal: true,
	communal: true,
	elite: true,
	utilitarian: true,
	ceremonial: true,
	everyday: true,
	military: true,
	artisanal: true,
};

const ALL_TAGS = new Set<FunctionTag | ContextTag>([
	...Object.keys(ALL_FUNCTION_TAGS_RECORD),
	...Object.keys(ALL_CONTEXT_TAGS_RECORD),
] as (FunctionTag | ContextTag)[]);

/**
 * A neutral baseline `ExtractedFeatures` — every boolean `false`, every count/complexity `0`, every
 * banded field its `'none'` member. No shipped rule should fire against this on its own.
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

/** A feature set with every boolean `true` and every count/complexity pushed high, for no-throw sweeps. */
function maximalFeatures(): ExtractedFeatures {
	return features({
		hasEdge: true,
		edgeCount: 5,
		hasPoint: true,
		pointSharpness: 'sharp',
		hasImpactSurface: true,
		hasContainer: true,
		containerOpenness: 1,
		openingType: 'wide',
		hasFasteningMechanism: true,
		primaryAxisLength: 'long',
		bladeLengthBand: 'long',
		bladeProfile: 'thrusting',
		isWearable: true,
		partCount: 10,
		attachmentDiversity: 5,
		perforation: 'multiple',
		wallThickness: 'thick',
		ringGap: 'overlapping',
		sheetFlexibility: 'flexible',
		massBand: 'very-heavy',
		sizeBand: 'large',
		curvature: 'deep',
		baseType: 'pedestal',
		decorativeLayerCount: 6,
		appliedElementPresent: true,
		motifPresent: true,
		motifCulturalOrigins: ['culture-a', 'culture-b'],
		techniqueComplexity: 5,
		preciousMaterialsInDecoration: true,
		functionalComplexity: 4,
		decorativeComplexity: 4,
		overallComplexity: 8,
	});
}

// --- Structural invariants -----------------------------------------------------------------------

Deno.test('rules: every rule has a non-empty tags map', () => {
	for (const rule of CLASSIFICATION_RULES) {
		assert(rule.tags.size > 0);
	}
});

Deno.test('rules: every emitted tag is a real FunctionTag or ContextTag', () => {
	for (const rule of CLASSIFICATION_RULES) {
		for (const tag of rule.tags.keys()) {
			assert(ALL_TAGS.has(tag), tag);
		}
	}
});

Deno.test('rules: every weight is greater than 0 and at most 1', () => {
	for (const rule of CLASSIFICATION_RULES) {
		for (const [tag, weight] of rule.tags) {
			assert(weight > 0 && weight <= 1, `${tag}: ${weight}`);
		}
	}
});

Deno.test('rules: every condition runs against neutral and maximal features without throwing', () => {
	const neutral = features();
	const maximal = maximalFeatures();
	for (const rule of CLASSIFICATION_RULES) {
		assertEquals(typeof rule.condition(neutral), 'boolean');
		assertEquals(typeof rule.condition(maximal), 'boolean');
	}
});

// --- Mechanical-vs-classificatory boundary guard --------------------------------------------------

Deno.test('boundary: no rule reads portability or inspectionDepth', () => {
	const base = maximalFeatures();
	const baseline = CLASSIFICATION_RULES.map((rule) => rule.condition(base));

	const portabilityBands: ExtractedFeatures['portability'][] = [
		'pocketable',
		'one-hand',
		'two-hand',
		'team-lift',
		'major-effort',
	];
	const inspectionBands: ExtractedFeatures['inspectionDepth'][] = [
		'full',
		'detailed',
		'observational',
	];

	for (const portability of portabilityBands) {
		const firing = CLASSIFICATION_RULES.map((rule) => rule.condition({ ...base, portability }));
		assertEquals(firing, baseline, `portability=${portability} changed a rule's firing`);
	}

	for (const inspectionDepth of inspectionBands) {
		const firing = CLASSIFICATION_RULES.map((rule) => rule.condition({ ...base, inspectionDepth }));
		assertEquals(firing, baseline, `inspectionDepth=${inspectionDepth} changed a rule's firing`);
	}
});

// --- Purity ----------------------------------------------------------------------------------------

Deno.test('rules: conditions are pure — repeat calls agree and inputs are never mutated', () => {
	for (const rule of CLASSIFICATION_RULES) {
		const input = maximalFeatures();
		const snapshot = structuredClone(input);
		const first = rule.condition(input);
		const second = rule.condition(input);
		assertEquals(first, second);
		assertEquals(input, snapshot);
	}
});

// --- R1: long edge → weapon/tool -------------------------------------------------------------------

const R1 = CLASSIFICATION_RULES[0];
if (!R1.tags.has('weapon')) throw new Error('CLASSIFICATION_RULES[0] must be the long-edge rule');

Deno.test('R1: an edge on a medium-or-long body fires', () => {
	assert(R1.condition(features({ hasEdge: true, primaryAxisLength: 'medium' })));
	assert(R1.condition(features({ hasEdge: true, primaryAxisLength: 'long' })));
});

Deno.test('R1: a short edge, or no edge, does not fire', () => {
	assert(!R1.condition(features({ hasEdge: true, primaryAxisLength: 'short' })));
	assert(!R1.condition(features({ hasEdge: false, primaryAxisLength: 'long' })));
});

Deno.test('R1: fires with the exact weapon/tool weights', () => {
	assertEquals(R1.tags.get('weapon'), 0.6);
	assertEquals(R1.tags.get('tool'), 0.3);
});

// --- R2: short sharp edge → dagger-family ---------------------------------------------------------

const R2 = CLASSIFICATION_RULES[1];
if (!R2.tags.has('personal')) {
	throw new Error('CLASSIFICATION_RULES[1] must be the dagger-family rule');
}

Deno.test('R2: a short, sharp-pointed edge fires', () => {
	assert(
		R2.condition(features({ hasEdge: true, bladeLengthBand: 'short', pointSharpness: 'sharp' })),
	);
});

Deno.test('R2: a short blunt-pointed edge, or a non-short edge, does not fire', () => {
	assert(
		!R2.condition(features({ hasEdge: true, bladeLengthBand: 'short', pointSharpness: 'blunt' })),
	);
	assert(
		!R2.condition(features({ hasEdge: true, bladeLengthBand: 'medium', pointSharpness: 'sharp' })),
	);
});

Deno.test('R2: fires with the exact dagger-family weights', () => {
	assertEquals(R2.tags.get('weapon'), 0.4);
	assertEquals(R2.tags.get('tool'), 0.3);
	assertEquals(R2.tags.get('personal'), 0.3);
});

// --- R3: short non-sharp edge → utility knife family ------------------------------------------------

const R3 = CLASSIFICATION_RULES[2];
if (!R3.tags.has('domestic')) {
	throw new Error('CLASSIFICATION_RULES[2] must be the utility-knife rule');
}

Deno.test('R3: a short edge without a sharp point fires', () => {
	assert(
		R3.condition(features({ hasEdge: true, bladeLengthBand: 'short', pointSharpness: 'blunt' })),
	);
	assert(
		R3.condition(features({ hasEdge: true, bladeLengthBand: 'short', pointSharpness: 'none' })),
	);
});

Deno.test('R3: a short sharp-pointed edge does not fire (R2 owns that case)', () => {
	assert(
		!R3.condition(features({ hasEdge: true, bladeLengthBand: 'short', pointSharpness: 'sharp' })),
	);
});

// --- R4: multi-edge --------------------------------------------------------------------------------

const R4 = CLASSIFICATION_RULES[3];
if (!R4.tags.has('tool') || R4.tags.size !== 2) {
	throw new Error('CLASSIFICATION_RULES[3] must be the multi-edge rule');
}

Deno.test('R4: two or more edges fires; fewer does not', () => {
	assert(R4.condition(features({ edgeCount: 2 })));
	assert(!R4.condition(features({ edgeCount: 1 })));
});

// --- R5: sharp point without edge → piercing tool/weapon --------------------------------------------

const R5 = CLASSIFICATION_RULES[4];
if (!R5.tags.has('fastener')) {
	throw new Error('CLASSIFICATION_RULES[4] must be the sharp-point rule');
}

Deno.test('R5: a sharp point with no edge fires', () => {
	assert(R5.condition(features({ hasPoint: true, hasEdge: false, pointSharpness: 'sharp' })));
});

Deno.test('R5: an edge present, or a blunt point, does not fire', () => {
	assert(!R5.condition(features({ hasPoint: true, hasEdge: true, pointSharpness: 'sharp' })));
	assert(!R5.condition(features({ hasPoint: true, hasEdge: false, pointSharpness: 'blunt' })));
});

// --- R6: blunt point without edge → craft tool -------------------------------------------------------

const R6 = CLASSIFICATION_RULES[5];
if (!R6.tags.has('artisanal')) {
	throw new Error('CLASSIFICATION_RULES[5] must be the blunt-point rule');
}

Deno.test('R6: a blunt point with no edge fires', () => {
	assert(R6.condition(features({ hasPoint: true, hasEdge: false, pointSharpness: 'blunt' })));
});

Deno.test('R6: a sharp point does not fire (R5 owns that case)', () => {
	assert(!R6.condition(features({ hasPoint: true, hasEdge: false, pointSharpness: 'sharp' })));
});

// --- R7-R10: opening-graded container set ---------------------------------------------------------

const R7 = CLASSIFICATION_RULES[6];
const R8 = CLASSIFICATION_RULES[7];
const R9 = CLASSIFICATION_RULES[8];
const R10 = CLASSIFICATION_RULES[9];
if (R7.tags.get('everyday') !== 0.3) {
	throw new Error('CLASSIFICATION_RULES[6] must be the wide-opening rule');
}
if (R8.tags.get('container') !== 0.7) {
	throw new Error('CLASSIFICATION_RULES[7] must be the narrow-opening rule');
}
if (R9.tags.get('votive') !== 0.4 || R9.tags.size !== 2) {
	throw new Error('CLASSIFICATION_RULES[8] must be the slit-opening rule');
}
if (R10.tags.get('funerary') !== 0.3) {
	throw new Error('CLASSIFICATION_RULES[9] must be the sealed rule');
}

Deno.test('R7: a wide or open container fires; a non-container does not', () => {
	assert(R7.condition(features({ hasContainer: true, openingType: 'wide' })));
	assert(R7.condition(features({ hasContainer: true, openingType: 'open' })));
	assert(!R7.condition(features({ hasContainer: false, openingType: 'wide' })));
});

Deno.test('R8: a narrow or restricted container fires', () => {
	assert(R8.condition(features({ hasContainer: true, openingType: 'narrow' })));
	assert(R8.condition(features({ hasContainer: true, openingType: 'restricted' })));
	assert(!R8.condition(features({ hasContainer: true, openingType: 'wide' })));
});

Deno.test('R9: a slit-opening container fires', () => {
	assert(R9.condition(features({ hasContainer: true, openingType: 'slit' })));
	assert(!R9.condition(features({ hasContainer: true, openingType: 'wide' })));
});

Deno.test('R10: a sealed (none or closed) container fires', () => {
	assert(R10.condition(features({ hasContainer: true, openingType: 'none' })));
	assert(R10.condition(features({ hasContainer: true, openingType: 'closed' })));
	assert(!R10.condition(features({ hasContainer: true, openingType: 'wide' })));
});

Deno.test('R7-R10: opening bands are mutually exclusive over the container family', () => {
	const bands: ExtractedFeatures['openingType'][] = [
		'wide',
		'open',
		'narrow',
		'restricted',
		'slit',
		'none',
		'closed',
	];
	for (const openingType of bands) {
		const f = features({ hasContainer: true, openingType });
		const firing = [R7, R8, R9, R10].filter((r) => r.condition(f));
		assertEquals(
			firing.length,
			1,
			`openingType=${openingType} fired ${firing.length} container rules`,
		);
	}
});

// --- R11-R15: vessel refinement ---------------------------------------------------------------------

const R11 = CLASSIFICATION_RULES[10];
const R12 = CLASSIFICATION_RULES[11];
const R13 = CLASSIFICATION_RULES[12];
const R14 = CLASSIFICATION_RULES[13];
const R15 = CLASSIFICATION_RULES[14];
if (R11.tags.get('ceremonial') !== 0.2) {
	throw new Error('CLASSIFICATION_RULES[10] must be the thin-wall rule');
}
if (R12.tags.get('utilitarian') !== 0.4) {
	throw new Error('CLASSIFICATION_RULES[11] must be the thick-wall rule');
}
if (R13.tags.get('container') !== 0.5) {
	throw new Error('CLASSIFICATION_RULES[12] must be the deep-curvature rule');
}
if (R14.tags.get('ceremonial') !== 0.4) {
	throw new Error('CLASSIFICATION_RULES[13] must be the pedestal-base rule');
}
if (R15.tags.get('maritime') !== 0.2) {
	throw new Error('CLASSIFICATION_RULES[14] must be the pointed-base rule');
}

Deno.test('R11: a thin-walled container fires; a thick-walled one does not', () => {
	assert(R11.condition(features({ hasContainer: true, wallThickness: 'thin' })));
	assert(!R11.condition(features({ hasContainer: true, wallThickness: 'thick' })));
});

Deno.test('R12: a thick-walled container fires; a thin-walled one does not', () => {
	assert(R12.condition(features({ hasContainer: true, wallThickness: 'thick' })));
	assert(!R12.condition(features({ hasContainer: true, wallThickness: 'thin' })));
});

Deno.test('R13: deep curvature fires regardless of hasContainer (a scoop is a container signal itself)', () => {
	assert(R13.condition(features({ curvature: 'deep', hasContainer: false })));
	assert(!R13.condition(features({ curvature: 'shallow' })));
});

Deno.test('R14: a pedestal base fires; other bases do not', () => {
	assert(R14.condition(features({ baseType: 'pedestal' })));
	assert(!R14.condition(features({ baseType: 'flat' })));
});

Deno.test('R15: a pointed base fires; other bases do not', () => {
	assert(R15.condition(features({ baseType: 'pointed' })));
	assert(!R15.condition(features({ baseType: 'flat' })));
});

// --- R16-R18: perforation ---------------------------------------------------------------------------

const R16 = CLASSIFICATION_RULES[15];
const R17 = CLASSIFICATION_RULES[16];
const R18 = CLASSIFICATION_RULES[17];
if (R16.tags.get('artisanal') !== 0.3) {
	throw new Error('CLASSIFICATION_RULES[15] must be the central-perforation rule');
}
if (R17.tags.get('ornament') !== 0.4) {
	throw new Error('CLASSIFICATION_RULES[16] must be the single-perforation rule');
}
if (R18.tags.get('fastener') !== 0.3) {
	throw new Error('CLASSIFICATION_RULES[17] must be the multiple-perforation rule');
}

Deno.test('R16: a central perforation fires; other perforation bands do not', () => {
	assert(R16.condition(features({ perforation: 'central' })));
	assert(!R16.condition(features({ perforation: 'single' })));
});

Deno.test('R17: a single perforation fires; other bands do not', () => {
	assert(R17.condition(features({ perforation: 'single' })));
	assert(!R17.condition(features({ perforation: 'central' })));
});

Deno.test('R18: multiple perforations fire; other bands do not', () => {
	assert(R18.condition(features({ perforation: 'multiple' })));
	assert(!R18.condition(features({ perforation: 'none' })));
});

// --- R19-R20: ring / fastener -------------------------------------------------------------------------

const R19 = CLASSIFICATION_RULES[18];
const R20 = CLASSIFICATION_RULES[19];
if (R19.tags.get('ornament') !== 0.5) {
	throw new Error('CLASSIFICATION_RULES[18] must be the closed-ring rule');
}
if (R20.tags.get('fastener') !== 0.4) {
	throw new Error('CLASSIFICATION_RULES[19] must be the open-ring rule');
}

Deno.test('R19: a closed ring gap fires; open/overlapping do not', () => {
	assert(R19.condition(features({ ringGap: 'closed' })));
	assert(!R19.condition(features({ ringGap: 'open' })));
});

Deno.test('R20: an open or overlapping ring gap fires; closed does not', () => {
	assert(R20.condition(features({ ringGap: 'open' })));
	assert(R20.condition(features({ ringGap: 'overlapping' })));
	assert(!R20.condition(features({ ringGap: 'closed' })));
});

// --- R21-R22: sheet -----------------------------------------------------------------------------------

const R21 = CLASSIFICATION_RULES[20];
const R22 = CLASSIFICATION_RULES[21];
if (R21.tags.get('military') !== 0.2) {
	throw new Error('CLASSIFICATION_RULES[20] must be the rigid-sheet rule');
}
if (R22.tags.get('ornament') !== 0.2 || !R22.tags.has('personal')) {
	throw new Error('CLASSIFICATION_RULES[21] must be the flexible-sheet rule');
}

Deno.test('R21: a rigid sheet fires; a flexible one does not', () => {
	assert(R21.condition(features({ sheetFlexibility: 'rigid' })));
	assert(!R21.condition(features({ sheetFlexibility: 'flexible' })));
});

Deno.test('R22: a flexible sheet fires; a rigid one does not', () => {
	assert(R22.condition(features({ sheetFlexibility: 'flexible' })));
	assert(!R22.condition(features({ sheetFlexibility: 'rigid' })));
});

// --- R23-R25: mass ------------------------------------------------------------------------------------

const R23 = CLASSIFICATION_RULES[22];
const R24 = CLASSIFICATION_RULES[23];
const R25 = CLASSIFICATION_RULES[24];
if (R23.tags.get('agricultural') !== 0.3) {
	throw new Error('CLASSIFICATION_RULES[22] must be the heavy-edge rule');
}
if (R24.tags.get('utilitarian') !== 0.4 && R24.tags.get('domestic') !== 0.3) {
	throw new Error('CLASSIFICATION_RULES[23] must be the heavy-container rule');
}
if (R25.tags.get('communal') !== 0.4) {
	throw new Error('CLASSIFICATION_RULES[24] must be the very-heavy rule');
}

Deno.test('R23: a heavy or very-heavy edge fires; a light edge does not', () => {
	assert(R23.condition(features({ hasEdge: true, massBand: 'heavy' })));
	assert(R23.condition(features({ hasEdge: true, massBand: 'very-heavy' })));
	assert(!R23.condition(features({ hasEdge: true, massBand: 'light' })));
});

Deno.test('R24: a heavy or very-heavy container fires; a light container does not', () => {
	assert(R24.condition(features({ hasContainer: true, massBand: 'heavy' })));
	assert(!R24.condition(features({ hasContainer: true, massBand: 'light' })));
});

Deno.test('R25: a very-heavy object fires regardless of edge/container; a merely heavy one does not', () => {
	assert(R25.condition(features({ massBand: 'very-heavy' })));
	assert(!R25.condition(features({ massBand: 'heavy' })));
});

// --- R26: size ---------------------------------------------------------------------------------------

const R26 = CLASSIFICATION_RULES[25];
if (R26.tags.get('personal') !== 0.3) {
	throw new Error('CLASSIFICATION_RULES[25] must be the small-size rule');
}

Deno.test('R26: a small sizeBand fires; medium/large do not', () => {
	assert(R26.condition(features({ sizeBand: 'small' })));
	assert(!R26.condition(features({ sizeBand: 'medium' })));
	assert(!R26.condition(features({ sizeBand: 'large' })));
});

// --- R27: structural complexity -----------------------------------------------------------------------

const R27 = CLASSIFICATION_RULES[26];
if (R27.tags.get('artisanal') !== 0.3 || !R27.tags.has('tool')) {
	throw new Error('CLASSIFICATION_RULES[26] must be the composite-complexity rule');
}

Deno.test('R27: three or more parts with two or more attachment types fires', () => {
	assert(R27.condition(features({ partCount: 3, attachmentDiversity: 2 })));
});

Deno.test('R27: too few parts, or too little join variety, does not fire', () => {
	assert(!R27.condition(features({ partCount: 2, attachmentDiversity: 2 })));
	assert(!R27.condition(features({ partCount: 3, attachmentDiversity: 1 })));
});

// --- R28-R30: decoration (real signals) ---------------------------------------------------------------

const R28 = CLASSIFICATION_RULES[27];
const R29 = CLASSIFICATION_RULES[28];
const R30 = CLASSIFICATION_RULES[29];
if (R28.tags.get('elite') !== 0.4 && R28.tags.get('ceremonial') !== 0.3) {
	throw new Error('CLASSIFICATION_RULES[27] must be the heavy-decoration rule');
}
if (R29.tags.get('elite') !== 0.4 || R29.tags.size !== 2) {
	throw new Error('CLASSIFICATION_RULES[28] must be the applied-element rule');
}
if (R30.tags.size !== 1 || R30.tags.get('ornament') !== 0.2) {
	throw new Error('CLASSIFICATION_RULES[29] must be the any-decoration rule');
}

Deno.test('R28: three or more decorative layers fires; fewer does not', () => {
	assert(R28.condition(features({ decorativeLayerCount: 3 })));
	assert(!R28.condition(features({ decorativeLayerCount: 2 })));
});

Deno.test('R29: an applied element present fires; absent does not', () => {
	assert(R29.condition(features({ appliedElementPresent: true })));
	assert(!R29.condition(features({ appliedElementPresent: false })));
});

Deno.test('R30: any decorative layer fires; zero layers does not', () => {
	assert(R30.condition(features({ decorativeLayerCount: 1 })));
	assert(!R30.condition(features({ decorativeLayerCount: 0 })));
});

// --- R31-R32: decoration (dormant — motif/precious-material fields have no producer yet) ---------------

const R31 = CLASSIFICATION_RULES[30];
const R32 = CLASSIFICATION_RULES[31];
if (R31.tags.get('elite') !== 0.5 || !R31.tags.has('votive')) {
	throw new Error('CLASSIFICATION_RULES[30] must be the precious-materials rule (dormant)');
}
if (R32.tags.get('trade-good') !== 0.4) {
	throw new Error('CLASSIFICATION_RULES[31] must be the cross-cultural-motif rule (dormant)');
}

Deno.test('R31 (dormant): fires on a hand-built feature set with precious materials in decoration', () => {
	assert(R31.condition(features({ preciousMaterialsInDecoration: true })));
	assert(!R31.condition(features({ preciousMaterialsInDecoration: false })));
});

Deno.test('R32 (dormant): fires on a hand-built feature set with cross-cultural motifs', () => {
	assert(
		R32.condition(
			features({ motifPresent: true, motifCulturalOrigins: ['culture-a', 'culture-b'] }),
		),
	);
	assert(!R32.condition(features({ motifPresent: true, motifCulturalOrigins: ['culture-a'] })));
	assert(
		!R32.condition(
			features({ motifPresent: false, motifCulturalOrigins: ['culture-a', 'culture-b'] }),
		),
	);
});

// --- R33-R34: cross-layer -------------------------------------------------------------------------------

const R33 = CLASSIFICATION_RULES[32];
const R34 = CLASSIFICATION_RULES[33];
if (R33.tags.get('ritual') !== 0.5) {
	throw new Error('CLASSIFICATION_RULES[32] must be the edged-decorated rule');
}
if (R34.tags.get('votive') !== 0.3) {
	throw new Error('CLASSIFICATION_RULES[33] must be the decorated-container rule');
}

Deno.test('R33: an edged object with two or more decorative layers fires', () => {
	assert(R33.condition(features({ hasEdge: true, decorativeLayerCount: 2 })));
	assert(!R33.condition(features({ hasEdge: true, decorativeLayerCount: 1 })));
	assert(!R33.condition(features({ hasEdge: false, decorativeLayerCount: 2 })));
});

Deno.test('R34: a container with two or more decorative layers fires', () => {
	assert(R34.condition(features({ hasContainer: true, decorativeLayerCount: 2 })));
	assert(!R34.condition(features({ hasContainer: true, decorativeLayerCount: 1 })));
	assert(!R34.condition(features({ hasContainer: false, decorativeLayerCount: 2 })));
});

// --- Worked-example integration ---------------------------------------------------------------------

Deno.test('integration: an engraved long bronze blade fires weapon, ritual, ceremonial and elite', () => {
	const engravedBlade = features({
		hasEdge: true,
		primaryAxisLength: 'long',
		bladeLengthBand: 'long',
		pointSharpness: 'sharp',
		decorativeLayerCount: 3,
	});

	const firing = CLASSIFICATION_RULES.filter((rule) => rule.condition(engravedBlade));
	const firedTags = new Set<FunctionTag | ContextTag>();
	for (const rule of firing) {
		for (const tag of rule.tags.keys()) firedTags.add(tag);
	}

	assert(firedTags.has('weapon'));
	assert(firedTags.has('ritual'));
	assert(firedTags.has('ceremonial'));
	assert(firedTags.has('elite'));
});
