/// <reference lib="deno.ns" />
import { assert, assertEquals, assertFalse } from '@std/assert';
import { CLASSIFICATION_RULES } from './classification.ts';
import {
	emptyClassificationContext,
	neutralExtractedFeatures as features,
	relativeClassificationContext,
} from '../../../tests/fixtures/artefact.ts';
import { PERCENTILE_LADDER } from '../engine/statistics.ts';
import { SAMPLED_FEATURES } from '../engine/generation/baselines.ts';
import { RELATIVE_TAGS as ALL_RELATIVE_TAGS } from '../types/tags.ts';
import type { AbsoluteTag, ArtefactTag, RelativeTag } from '../types/tags.ts';
import type { ExtractedFeatures } from '../types/artefact.ts';

/** Keyed by `AbsoluteTag` so the compiler flags a missing entry when the union gains a member. */
const ALL_ABSOLUTE_TAGS_RECORD: Record<AbsoluteTag, true> = {
	weapon: true,
	tool: true,
	container: true,
	fastener: true,
	ornament: true,
	domestic: true,
	agricultural: true,
	maritime: true,
	'trade-good': true,
	currency: true,
};

/** Keyed by `RelativeTag` so the compiler flags a missing entry when the union gains a member. */
const ALL_RELATIVE_TAGS_RECORD: Record<RelativeTag, true> = {
	personal: true,
	communal: true,
	elite: true,
	utilitarian: true,
	ceremonial: true,
	everyday: true,
	military: true,
	artisanal: true,
	ritual: true,
	votive: true,
	funerary: true,
};

const ALL_TAGS = new Set<ArtefactTag>([
	...Object.keys(ALL_ABSOLUTE_TAGS_RECORD),
	...Object.keys(ALL_RELATIVE_TAGS_RECORD),
] as ArtefactTag[]);

/**
 * The no-baseline context the 34 unmigrated rules run against. They ignore their `context`
 * parameter entirely, so an empty context makes that explicit rather than incidental — the same
 * fixture the file used before roadmap 2GN.82 migrated the first nine rules.
 */
const ctx = emptyClassificationContext();

/**
 * The nine rules migrated in roadmap 2GN.82 (plus R43) each get a fires/doesn't-fire pair at a
 * *known* threshold via `relativeClassificationContext` (`tests/fixtures/artefact.ts`), rather than
 * one drawn from a real sample.
 */
const relativeContext = relativeClassificationContext;

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
		decorativeLayerCount: 20,
		appliedElementPresent: true,
		// Above the retuned rule's `>= 4` threshold (roadmap 2GN.79): left at the neutral 0, the
		// sweeps below would silently stop exercising the applied-element rule, the same coverage gap
		// doc 12 §2.24 caught when it raised the other decorative fields here.
		appliedElementCount: 8,
		motifPresent: true,
		motifCulturalOrigins: ['culture-a', 'culture-b'],
		techniqueComplexity: 12,
		preciousMaterialsInDecoration: true,
		functionalComplexity: 4,
		decorativeComplexity: 30,
		overallComplexity: 34,
		// Above R43's `>= 0.9` percentile threshold (roadmap 2GN.98): left at the neutral 0, the
		// migration coverage guard below would never see R43 as context-sensitive, since `exceeds`
		// reports "no baseline" identically whether or not the permissive context carries the feature.
		meanDecorativeGrade: 1,
	});
}

// --- Structural invariants -----------------------------------------------------------------------

Deno.test('rules: every rule has a non-empty tags map', () => {
	for (const rule of CLASSIFICATION_RULES) {
		assert(rule.tags.size > 0);
	}
});

Deno.test('rules: every emitted tag is a real ArtefactTag', () => {
	for (const rule of CLASSIFICATION_RULES) {
		for (const tag of rule.tags.keys()) {
			assert(ALL_TAGS.has(tag), tag);
		}
	}
});

/**
 * Pins how much of the rule set the 2GN.80 ruling's relative basis actually selects (doc 11 §2.9).
 *
 * The ruling cuts by awarded tag, not by condition, so the boundary is invisible from a rule's
 * shape: a rule reading nothing but `wallThickness` still needs a culture-phase baseline if it
 * awards `elite`. The count is what 2GN.82's recalibration is sized against, and prose enumerations
 * of it go stale the moment a rule is inserted. Guard the number instead.
 *
 * Failing here is not automatically a defect — adding a rule that awards a `RelativeTag` legitimately
 * moves it. Update the count and doc 11 §2.9 together, deliberately.
 */
Deno.test('ruling: 34 of the 43 rules award at least one RelativeTag', () => {
	const relative = new Set<string>(ALL_RELATIVE_TAGS);
	const needsBaseline = CLASSIFICATION_RULES.filter((rule) =>
		[...rule.tags.keys()].some((tag) => relative.has(tag))
	);

	// 43 → 44, 34 → 35 (roadmap 2GN.98, doc 12 §2.33): the new execution-quality rule reads
	// `meanDecorativeGrade` and awards `artisanal`/`elite`, both `RelativeTag` members.
	// 44 → 43, 35 → 34 (roadmap 2GN.87): the unsatisfiable short-edge rule was deleted; it awarded
	// `tool`/`everyday`, so the relative-awarding count drops with it.
	assertEquals(CLASSIFICATION_RULES.length, 43);
	assertEquals(needsBaseline.length, 34);
});

Deno.test('ruling: the remaining rules award only AbsoluteTags', () => {
	const relative = new Set<string>(ALL_RELATIVE_TAGS);
	const absoluteOnly = CLASSIFICATION_RULES.filter((rule) =>
		[...rule.tags.keys()].every((tag) => !relative.has(tag))
	);

	assertEquals(absoluteOnly.length, 9);
});

/**
 * Guards the direction of a future migration (roadmap 2GN.82): a rule migrated to read
 * `ClassificationContext.exceeds` must award at least one `RelativeTag`, never only `AbsoluteTag`
 * members — reading a baseline for a fact that is already absolute would reintroduce the
 * culture-relative reading exactly where the ruling says it doesn't belong.
 *
 * Detected by construction rather than by inspecting source text: a rule is "context-sensitive" if
 * it fires differently between an empty context and one carrying a permissive baseline (every
 * `SAMPLED_FEATURES` member readable at every `PERCENTILE_LADDER` rung, threshold `0`) against a
 * feature set built to satisfy every rule's non-baseline conditions at once. A rule that never reads
 * `context` fires identically either way and is correctly excluded.
 *
 * The permissive feature list is derived from `SAMPLED_FEATURES` (`baselines.ts`) rather than
 * hand-written, so a future `BaselineFeature` member is covered by this guard automatically — this
 * file previously restated the union by hand and had to be updated manually when
 * `meanDecorativeGrade` was added, a real drift a derived list closes.
 */
Deno.test('migration coverage: any context-sensitive rule awards a RelativeTag', () => {
	const relative = new Set<string>(ALL_RELATIVE_TAGS);
	const permissive = relativeContext(
		Object.fromEntries(
			SAMPLED_FEATURES.map((feature) => [
				feature,
				Object.fromEntries(PERCENTILE_LADDER.map((p) => [p, 0])),
			]),
		),
	);
	const maximal = maximalFeatures();

	const wronglyAbsolute = CLASSIFICATION_RULES.filter((rule) => {
		const contextSensitive = rule.condition(maximal, ctx) !== rule.condition(maximal, permissive);
		const awardsRelative = [...rule.tags.keys()].some((tag) => relative.has(tag));
		return contextSensitive && !awardsRelative;
	});

	assertEquals(
		wronglyAbsolute.length,
		0,
		'a rule reading ClassificationContext must award at least one RelativeTag',
	);
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
		assertEquals(typeof rule.condition(neutral, ctx), 'boolean');
		assertEquals(typeof rule.condition(maximal, ctx), 'boolean');
	}
});

// --- Mechanical-vs-classificatory boundary guard --------------------------------------------------

Deno.test('boundary: no rule reads portability or inspectionDepth', () => {
	const base = maximalFeatures();
	const baseline = CLASSIFICATION_RULES.map((rule) => rule.condition(base, ctx));

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
		const firing = CLASSIFICATION_RULES.map((rule) =>
			rule.condition({ ...base, portability }, ctx)
		);
		assertEquals(firing, baseline, `portability=${portability} changed a rule's firing`);
	}

	for (const inspectionDepth of inspectionBands) {
		const firing = CLASSIFICATION_RULES.map((rule) =>
			rule.condition({ ...base, inspectionDepth }, ctx)
		);
		assertEquals(firing, baseline, `inspectionDepth=${inspectionDepth} changed a rule's firing`);
	}
});

// --- Purity ----------------------------------------------------------------------------------------

Deno.test('rules: conditions are pure — repeat calls agree and inputs are never mutated', () => {
	for (const rule of CLASSIFICATION_RULES) {
		const input = maximalFeatures();
		const snapshot = structuredClone(input);
		const first = rule.condition(input, ctx);
		const second = rule.condition(input, ctx);
		assertEquals(first, second);
		assertEquals(input, snapshot);
	}
});

// --- R1: long edge → weapon/tool -------------------------------------------------------------------

const R1 = CLASSIFICATION_RULES[0];
if (!R1.tags.has('weapon')) throw new Error('CLASSIFICATION_RULES[0] must be the long-edge rule');

Deno.test('R1: an edge on a medium-or-long body fires', () => {
	assert(R1.condition(features({ hasEdge: true, primaryAxisLength: 'medium' }), ctx));
	assert(R1.condition(features({ hasEdge: true, primaryAxisLength: 'long' }), ctx));
});

Deno.test('R1: a short edge, or no edge, does not fire', () => {
	assert(!R1.condition(features({ hasEdge: true, primaryAxisLength: 'short' }), ctx));
	assert(!R1.condition(features({ hasEdge: false, primaryAxisLength: 'long' }), ctx));
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
		R2.condition(
			features({ hasEdge: true, bladeLengthBand: 'short', pointSharpness: 'sharp' }),
			ctx,
		),
	);
});

Deno.test('R2: a short blunt-pointed edge, or a non-short edge, does not fire', () => {
	assert(
		!R2.condition(
			features({ hasEdge: true, bladeLengthBand: 'short', pointSharpness: 'blunt' }),
			ctx,
		),
	);
	assert(
		!R2.condition(
			features({ hasEdge: true, bladeLengthBand: 'medium', pointSharpness: 'sharp' }),
			ctx,
		),
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
		R3.condition(
			features({ hasEdge: true, bladeLengthBand: 'short', pointSharpness: 'blunt' }),
			ctx,
		),
	);
	assert(
		R3.condition(
			features({ hasEdge: true, bladeLengthBand: 'short', pointSharpness: 'none' }),
			ctx,
		),
	);
});

Deno.test('R3: a short sharp-pointed edge does not fire (R2 owns that case)', () => {
	assert(
		!R3.condition(
			features({ hasEdge: true, bladeLengthBand: 'short', pointSharpness: 'sharp' }),
			ctx,
		),
	);
});

/**
 * The `(primaryAxisLength, bladeLengthBand)` pairs the generator can actually produce.
 *
 * These two fields are not independent, though their types suggest they are. `bladeLengthBand` is
 * the dominant edged component's own `length`; `primaryAxisLength` bands `dimensions.primaryExtent`,
 * which `deriveDimensions` computes as a `Math.max` over *every* component's major axis — drawn from
 * the same `SHORT_MEDIUM_LONG_CM` table (short 4cm, medium 14cm, long 40cm) that the blade band
 * reads, against a 9cm `short` cut. A non-short blade therefore always pushes the whole artefact's
 * axis above `short`, so **the blade band can never exceed the axis band**.
 *
 * Measured over 8000 artefacts across all four Explorer cultures (roadmap 2GN.87): exactly these six
 * pairs occur, in a strict triangle. `axis === 'short'` carried `blade === 'short'` in all 84 cases.
 * `blade === 'none'` never co-occurs with `hasEdge` at all, since `'none'` means no edged component.
 *
 * Sweeping the full 3×4 cartesian product instead — as this test did until 2GN.87 — asserts coverage
 * over combinations no pipeline output can present, which is how the deleted R4 came to be authored
 * and then defended by a passing test. `calibration.test.ts` is the authority on what actually
 * fires; this list keeps the unit-level sweep honest about what it can claim.
 */
const REACHABLE_AXIS_BLADE_PAIRS: readonly [
	ExtractedFeatures['primaryAxisLength'],
	ExtractedFeatures['bladeLengthBand'],
][] = [
	['long', 'long'],
	['long', 'medium'],
	['long', 'short'],
	['medium', 'medium'],
	['medium', 'short'],
	['short', 'short'],
];

Deno.test('edge family: every reachable edged artefact fires at least one edge rule', () => {
	const sharpBands: ExtractedFeatures['pointSharpness'][] = ['none', 'sharp', 'blunt'];
	const edgeRules = [R1, R2, R3];
	for (const [primaryAxisLength, bladeLengthBand] of REACHABLE_AXIS_BLADE_PAIRS) {
		for (const pointSharpness of sharpBands) {
			const f = features({ hasEdge: true, primaryAxisLength, bladeLengthBand, pointSharpness });
			const fired = edgeRules.filter((r) => r.condition(f, ctx)).length;
			assert(
				fired >= 1,
				`edged artefact axis=${primaryAxisLength} blade=${bladeLengthBand} point=${pointSharpness} fired no edge rule`,
			);
		}
	}
});

// --- R4: multi-edge --------------------------------------------------------------------------------

const R4 = CLASSIFICATION_RULES[3];
if (!R4.tags.has('tool') || R4.tags.size !== 2) {
	throw new Error('CLASSIFICATION_RULES[3] must be the multi-edge rule');
}

Deno.test('R4: two or more edges fires; fewer does not', () => {
	assert(R4.condition(features({ edgeCount: 2 }), ctx));
	assert(!R4.condition(features({ edgeCount: 1 }), ctx));
});

// --- R5: sharp point without edge → piercing tool/weapon --------------------------------------------

const R5 = CLASSIFICATION_RULES[4];
if (!R5.tags.has('fastener')) {
	throw new Error('CLASSIFICATION_RULES[4] must be the sharp-point rule');
}

Deno.test('R5: a sharp point with no edge fires', () => {
	assert(R5.condition(features({ hasPoint: true, hasEdge: false, pointSharpness: 'sharp' }), ctx));
});

Deno.test('R5: an edge present, or a blunt point, does not fire', () => {
	assert(!R5.condition(features({ hasPoint: true, hasEdge: true, pointSharpness: 'sharp' }), ctx));
	assert(!R5.condition(features({ hasPoint: true, hasEdge: false, pointSharpness: 'blunt' }), ctx));
});

// --- R6: blunt point without edge → craft tool -------------------------------------------------------

const R6 = CLASSIFICATION_RULES[5];
if (!R6.tags.has('artisanal')) {
	throw new Error('CLASSIFICATION_RULES[5] must be the blunt-point rule');
}

Deno.test('R6: a blunt point with no edge fires', () => {
	assert(R6.condition(features({ hasPoint: true, hasEdge: false, pointSharpness: 'blunt' }), ctx));
});

Deno.test('R6: a sharp point does not fire (R5 owns that case)', () => {
	assert(!R6.condition(features({ hasPoint: true, hasEdge: false, pointSharpness: 'sharp' }), ctx));
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
	assert(R7.condition(features({ hasContainer: true, openingType: 'wide' }), ctx));
	assert(R7.condition(features({ hasContainer: true, openingType: 'open' }), ctx));
	assert(!R7.condition(features({ hasContainer: false, openingType: 'wide' }), ctx));
});

Deno.test('R8: a narrow or restricted container fires', () => {
	assert(R8.condition(features({ hasContainer: true, openingType: 'narrow' }), ctx));
	assert(R8.condition(features({ hasContainer: true, openingType: 'restricted' }), ctx));
	assert(!R8.condition(features({ hasContainer: true, openingType: 'wide' }), ctx));
});

Deno.test('R9: a slit-opening container fires', () => {
	assert(R9.condition(features({ hasContainer: true, openingType: 'slit' }), ctx));
	assert(!R9.condition(features({ hasContainer: true, openingType: 'wide' }), ctx));
});

Deno.test('R10: a sealed (none or closed) container fires', () => {
	assert(R10.condition(features({ hasContainer: true, openingType: 'none' }), ctx));
	assert(R10.condition(features({ hasContainer: true, openingType: 'closed' }), ctx));
	assert(!R10.condition(features({ hasContainer: true, openingType: 'wide' }), ctx));
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
		const firing = [R7, R8, R9, R10].filter((r) => r.condition(f, ctx));
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
	assert(R11.condition(features({ hasContainer: true, wallThickness: 'thin' }), ctx));
	assert(!R11.condition(features({ hasContainer: true, wallThickness: 'thick' }), ctx));
});

Deno.test('R12: a thick-walled container fires; a thin-walled one does not', () => {
	assert(R12.condition(features({ hasContainer: true, wallThickness: 'thick' }), ctx));
	assert(!R12.condition(features({ hasContainer: true, wallThickness: 'thin' }), ctx));
});

Deno.test('R13: deep curvature fires regardless of hasContainer (a scoop is a container signal itself)', () => {
	assert(R13.condition(features({ curvature: 'deep', hasContainer: false }), ctx));
	assert(!R13.condition(features({ curvature: 'shallow' }), ctx));
});

Deno.test('R14: a pedestal base fires; other bases do not', () => {
	assert(R14.condition(features({ baseType: 'pedestal' }), ctx));
	assert(!R14.condition(features({ baseType: 'flat' }), ctx));
});

Deno.test('R15: a pointed base fires; other bases do not', () => {
	assert(R15.condition(features({ baseType: 'pointed' }), ctx));
	assert(!R15.condition(features({ baseType: 'flat' }), ctx));
});

// --- R16-R19: perforation (central, off-centre, single, multiple) -----------------------------------

const R16 = CLASSIFICATION_RULES[15];
const R17 = CLASSIFICATION_RULES[16];
const R18 = CLASSIFICATION_RULES[17];
const R19 = CLASSIFICATION_RULES[18];
if (R16.tags.get('artisanal') !== 0.3) {
	throw new Error('CLASSIFICATION_RULES[15] must be the central-perforation rule');
}
if (R17.tags.get('ornament') !== 0.4 || !R17.tags.has('personal')) {
	throw new Error('CLASSIFICATION_RULES[16] must be the off-centre-perforation rule');
}
if (R18.tags.get('ornament') !== 0.4) {
	throw new Error('CLASSIFICATION_RULES[17] must be the single-perforation rule');
}
if (R19.tags.get('fastener') !== 0.3) {
	throw new Error('CLASSIFICATION_RULES[18] must be the multiple-perforation rule');
}

Deno.test('R16: a central perforation fires; other perforation bands do not', () => {
	assert(R16.condition(features({ perforation: 'central' }), ctx));
	assert(!R16.condition(features({ perforation: 'off-centre' }), ctx));
	assert(!R16.condition(features({ perforation: 'single' }), ctx));
});

Deno.test('R17: an off-centre perforation fires; other bands do not', () => {
	assert(R17.condition(features({ perforation: 'off-centre' }), ctx));
	assert(!R17.condition(features({ perforation: 'central' }), ctx));
	assert(!R17.condition(features({ perforation: 'single' }), ctx));
});

Deno.test('R18: a single perforation fires; other bands do not', () => {
	assert(R18.condition(features({ perforation: 'single' }), ctx));
	assert(!R18.condition(features({ perforation: 'central' }), ctx));
	assert(!R18.condition(features({ perforation: 'off-centre' }), ctx));
});

Deno.test('R19: multiple perforations fire; other bands do not', () => {
	assert(R19.condition(features({ perforation: 'multiple' }), ctx));
	assert(!R19.condition(features({ perforation: 'none' }), ctx));
});

Deno.test('perforation family: every non-none band fires exactly one rule', () => {
	const bands: ExtractedFeatures['perforation'][] = ['single', 'multiple', 'central', 'off-centre'];
	for (const perforation of bands) {
		const f = features({ perforation });
		const fired = [R16, R17, R18, R19].filter((r) => r.condition(f, ctx)).length;
		assertEquals(fired, 1, `perforation=${perforation} fired ${fired} rules`);
	}
	assertEquals([R16, R17, R18, R19].filter((r) => r.condition(features(), ctx)).length, 0);
});

// --- R20-R21: ring / fastener -------------------------------------------------------------------------

const R20 = CLASSIFICATION_RULES[19];
const R21 = CLASSIFICATION_RULES[20];
if (R20.tags.get('ornament') !== 0.5) {
	throw new Error('CLASSIFICATION_RULES[19] must be the closed-ring rule');
}
if (R21.tags.get('fastener') !== 0.4) {
	throw new Error('CLASSIFICATION_RULES[20] must be the open-ring rule');
}

Deno.test('R20: a closed ring gap fires; open/overlapping do not', () => {
	assert(R20.condition(features({ ringGap: 'closed' }), ctx));
	assert(!R20.condition(features({ ringGap: 'open' }), ctx));
});

Deno.test('R21: an open or overlapping ring gap fires; closed does not', () => {
	assert(R21.condition(features({ ringGap: 'open' }), ctx));
	assert(R21.condition(features({ ringGap: 'overlapping' }), ctx));
	assert(!R21.condition(features({ ringGap: 'closed' }), ctx));
});

// --- R22-R23: sheet -----------------------------------------------------------------------------------

const R22 = CLASSIFICATION_RULES[21];
const R23 = CLASSIFICATION_RULES[22];
if (R22.tags.get('military') !== 0.2) {
	throw new Error('CLASSIFICATION_RULES[21] must be the rigid-sheet rule');
}
if (R23.tags.get('ornament') !== 0.2 || !R23.tags.has('personal')) {
	throw new Error('CLASSIFICATION_RULES[22] must be the flexible-sheet rule');
}

Deno.test('R22: a rigid sheet fires; a flexible one does not', () => {
	assert(R22.condition(features({ sheetFlexibility: 'rigid' }), ctx));
	assert(!R22.condition(features({ sheetFlexibility: 'flexible' }), ctx));
});

Deno.test('R23: a flexible sheet fires; a rigid one does not', () => {
	assert(R23.condition(features({ sheetFlexibility: 'flexible' }), ctx));
	assert(!R23.condition(features({ sheetFlexibility: 'rigid' }), ctx));
});

// --- R24-R26: mass ------------------------------------------------------------------------------------

const R24 = CLASSIFICATION_RULES[23];
const R25 = CLASSIFICATION_RULES[24];
const R26 = CLASSIFICATION_RULES[25];
if (R24.tags.get('agricultural') !== 0.3) {
	throw new Error('CLASSIFICATION_RULES[23] must be the heavy-edge rule');
}
if (R25.tags.get('utilitarian') !== 0.4 && R25.tags.get('domestic') !== 0.3) {
	throw new Error('CLASSIFICATION_RULES[24] must be the heavy-container rule');
}
if (R26.tags.get('communal') !== 0.4) {
	throw new Error('CLASSIFICATION_RULES[25] must be the very-heavy rule');
}

Deno.test('R24: a heavy or very-heavy edge fires; a light edge does not', () => {
	assert(R24.condition(features({ hasEdge: true, massBand: 'heavy' }), ctx));
	assert(R24.condition(features({ hasEdge: true, massBand: 'very-heavy' }), ctx));
	assert(!R24.condition(features({ hasEdge: true, massBand: 'light' }), ctx));
});

Deno.test('R25: a heavy or very-heavy container fires; a light container does not', () => {
	assert(R25.condition(features({ hasContainer: true, massBand: 'heavy' }), ctx));
	assert(!R25.condition(features({ hasContainer: true, massBand: 'light' }), ctx));
});

Deno.test('R26: a very-heavy object fires regardless of edge/container; a merely heavy one does not', () => {
	assert(R26.condition(features({ massBand: 'very-heavy' }), ctx));
	assert(!R26.condition(features({ massBand: 'heavy' }), ctx));
});

// --- R27: size ---------------------------------------------------------------------------------------

const R27 = CLASSIFICATION_RULES[26];
if (R27.tags.get('personal') !== 0.3) {
	throw new Error('CLASSIFICATION_RULES[26] must be the small-size rule');
}

Deno.test('R27: a small sizeBand fires; medium/large do not', () => {
	assert(R27.condition(features({ sizeBand: 'small' }), ctx));
	assert(!R27.condition(features({ sizeBand: 'medium' }), ctx));
	assert(!R27.condition(features({ sizeBand: 'large' }), ctx));
});

// --- R28: structural complexity -----------------------------------------------------------------------

const R28 = CLASSIFICATION_RULES[27];
if (R28.tags.get('artisanal') !== 0.3 || !R28.tags.has('tool')) {
	throw new Error('CLASSIFICATION_RULES[27] must be the composite-complexity rule');
}

/** A context with a p90 `attachmentDiversity` threshold of 3, matching the rule's shipped rung. */
const R29_CONTEXT = relativeContext({ attachmentDiversity: { 0.9: 3 } });

Deno.test('R28: attachmentDiversity at or above the culture-phase p90 fires', () => {
	assert(R28.condition(features({ partCount: 4, attachmentDiversity: 3 }), R29_CONTEXT));
});

Deno.test('R28: attachmentDiversity below the culture-phase p90 does not fire', () => {
	assert(!R28.condition(features({ partCount: 4, attachmentDiversity: 2 }), R29_CONTEXT));
	assert(!R28.condition(features({ partCount: 4, attachmentDiversity: 0 }), R29_CONTEXT));
});

/**
 * Guards the 2GN.79 finding that made `partCount` inert here: three distinct joint types cannot
 * occur without the parts to carry them, so the rule reads diversity alone. If someone reintroduces
 * a `partCount` clause, this fails.
 */
Deno.test('R28: partCount does not gate the rule — diversity alone decides', () => {
	assert(R28.condition(features({ partCount: 0, attachmentDiversity: 3 }), R29_CONTEXT));
	assert(R28.condition(features({ partCount: 99, attachmentDiversity: 3 }), R29_CONTEXT));
	assert(!R28.condition(features({ partCount: 99, attachmentDiversity: 2 }), R29_CONTEXT));
});

/** The rule's documented contract: no baseline for the feature it reads means it never fires. */
Deno.test('R28: returns false under an empty context, rather than falling back to an absolute reading', () => {
	assertFalse(R28.condition(features({ partCount: 4, attachmentDiversity: 99 }), ctx));
});

/** Reads `attachmentDiversity` and awards `artisanal`, a `RelativeTag` — the migration coverage check below verifies this holds generally. */

// --- R29-R31: decoration (real signals) ---------------------------------------------------------------

const R29 = CLASSIFICATION_RULES[28];
const R30 = CLASSIFICATION_RULES[29];
const R31 = CLASSIFICATION_RULES[30];
if (R29.tags.get('elite') !== 0.4 && R29.tags.get('ceremonial') !== 0.3) {
	throw new Error('CLASSIFICATION_RULES[28] must be the heavy-decoration rule');
}
if (R30.tags.get('elite') !== 0.4 || R30.tags.size !== 2) {
	throw new Error('CLASSIFICATION_RULES[29] must be the applied-element rule');
}
if (R31.tags.size !== 1 || R31.tags.get('ornament') !== 0.2) {
	throw new Error('CLASSIFICATION_RULES[30] must be the any-decoration rule');
}

/** A context with p75 thresholds of 10 (layers) and 4 (applied elements) — the rules' shipped rungs. */
const R30_CONTEXT = relativeContext({ decorativeLayerCount: { 0.75: 10 } });
const R31_CONTEXT = relativeContext({ appliedElementCount: { 0.75: 4 } });

Deno.test('R29: decorativeLayerCount at or above the culture-phase p75 fires', () => {
	assert(R29.condition(features({ decorativeLayerCount: 10 }), R30_CONTEXT));
	assert(!R29.condition(features({ decorativeLayerCount: 9 }), R30_CONTEXT));
});

Deno.test('R29: returns false under an empty context', () => {
	assertFalse(R29.condition(features({ decorativeLayerCount: 99 }), ctx));
});

Deno.test('R30: appliedElementCount at or above the culture-phase p75 fires', () => {
	assert(R30.condition(features({ appliedElementCount: 4 }), R31_CONTEXT));
	assert(!R30.condition(features({ appliedElementCount: 3 }), R31_CONTEXT));
	assert(!R30.condition(features({ appliedElementCount: 0 }), R31_CONTEXT));
});

/**
 * Guards the 2GN.79 retune: the rule must read the count, not the saturating boolean. A single
 * applied element sets `appliedElementPresent` but leaves the count below threshold, so an artefact
 * that would have fired the old rule must not fire this one.
 */
Deno.test('R30: reads the count, not the presence flag', () => {
	assert(
		!R30.condition(features({ appliedElementPresent: true, appliedElementCount: 1 }), R31_CONTEXT),
		'one applied element must not read as deliberate embellishment',
	);
	assert(
		R30.condition(features({ appliedElementPresent: true, appliedElementCount: 4 }), R31_CONTEXT),
	);
});

Deno.test('R30: returns false under an empty context', () => {
	assertFalse(R30.condition(features({ appliedElementCount: 99 }), ctx));
});

Deno.test('R31: any decorative layer fires; zero layers does not', () => {
	assert(R31.condition(features({ decorativeLayerCount: 1 }), ctx));
	assert(!R31.condition(features({ decorativeLayerCount: 0 }), ctx));
});

// --- R32-R33: decoration (dormant — motif/precious-material fields have no producer yet) ---------------

const R32 = CLASSIFICATION_RULES[31];
const R33 = CLASSIFICATION_RULES[32];
if (R32.tags.get('elite') !== 0.5 || !R32.tags.has('votive')) {
	throw new Error('CLASSIFICATION_RULES[31] must be the precious-materials rule (dormant)');
}
if (R33.tags.get('trade-good') !== 0.4) {
	throw new Error('CLASSIFICATION_RULES[32] must be the cross-cultural-motif rule (dormant)');
}

Deno.test('R32 (dormant): fires on a hand-built feature set with precious materials in decoration', () => {
	assert(R32.condition(features({ preciousMaterialsInDecoration: true }), ctx));
	assert(!R32.condition(features({ preciousMaterialsInDecoration: false }), ctx));
});

Deno.test('R33 (dormant): fires on a hand-built feature set with cross-cultural motifs', () => {
	assert(
		R33.condition(
			features({ motifPresent: true, motifCulturalOrigins: ['culture-a', 'culture-b'] }),
			ctx,
		),
	);
	assert(
		!R33.condition(features({ motifPresent: true, motifCulturalOrigins: ['culture-a'] }), ctx),
	);
	assert(
		!R33.condition(
			features({ motifPresent: false, motifCulturalOrigins: ['culture-a', 'culture-b'] }),
			ctx,
		),
	);
});

// --- R34-R35: cross-layer -------------------------------------------------------------------------------

const R34 = CLASSIFICATION_RULES[33];
const R35 = CLASSIFICATION_RULES[34];
if (R34.tags.get('ritual') !== 0.5) {
	throw new Error('CLASSIFICATION_RULES[33] must be the edged-decorated rule');
}
if (R35.tags.get('votive') !== 0.3) {
	throw new Error('CLASSIFICATION_RULES[34] must be the decorated-container rule');
}

/** A context with a p75 `decorativeLayerCount` threshold of 6, shared by R34 and R35's gates. */
const R35_R36_CONTEXT = relativeContext({ decorativeLayerCount: { 0.75: 6 } });

Deno.test('R34: an edged object with decorativeLayerCount at or above the whole-population p75 fires', () => {
	assert(R34.condition(features({ hasEdge: true, decorativeLayerCount: 6 }), R35_R36_CONTEXT));
	assert(!R34.condition(features({ hasEdge: true, decorativeLayerCount: 5 }), R35_R36_CONTEXT));
	assert(!R34.condition(features({ hasEdge: false, decorativeLayerCount: 6 }), R35_R36_CONTEXT));
});

Deno.test('R34: returns false under an empty context even when hasEdge is true', () => {
	assertFalse(R34.condition(features({ hasEdge: true, decorativeLayerCount: 99 }), ctx));
});

Deno.test('R35: a container with decorativeLayerCount at or above the whole-population p75 fires', () => {
	assert(R35.condition(features({ hasContainer: true, decorativeLayerCount: 6 }), R35_R36_CONTEXT));
	assert(
		!R35.condition(features({ hasContainer: true, decorativeLayerCount: 5 }), R35_R36_CONTEXT),
	);
	assert(
		!R35.condition(features({ hasContainer: false, decorativeLayerCount: 6 }), R35_R36_CONTEXT),
	);
});

Deno.test('R35: returns false under an empty context even when hasContainer is true', () => {
	assertFalse(R35.condition(features({ hasContainer: true, decorativeLayerCount: 99 }), ctx));
});

// --- R36-R38: structural presence flags --------------------------------------------------------------

const R36 = CLASSIFICATION_RULES[35];
const R37 = CLASSIFICATION_RULES[36];
const R38 = CLASSIFICATION_RULES[37];
if (R36.tags.get('fastener') !== 0.5) {
	throw new Error('CLASSIFICATION_RULES[35] must be the fastening-mechanism rule');
}
if (R37.tags.get('tool') !== 0.4 || R37.tags.get('weapon') !== 0.3) {
	throw new Error('CLASSIFICATION_RULES[36] must be the impact-surface rule');
}
if (R38.tags.get('ornament') !== 0.3 || !R38.tags.has('personal')) {
	throw new Error('CLASSIFICATION_RULES[37] must be the wearable rule');
}

Deno.test('R36: a fastening mechanism fires fastener; absent does not', () => {
	assert(R36.condition(features({ hasFasteningMechanism: true }), ctx));
	assert(!R36.condition(features({ hasFasteningMechanism: false }), ctx));
});

Deno.test('R37: an impact surface fires tool/weapon; absent does not', () => {
	assert(R37.condition(features({ hasImpactSurface: true }), ctx));
	assert(!R37.condition(features({ hasImpactSurface: false }), ctx));
});

Deno.test('R38: a wearable object fires ornament/personal; not-wearable does not', () => {
	assert(R38.condition(features({ isWearable: true }), ctx));
	assert(!R38.condition(features({ isWearable: false }), ctx));
});

// --- R39-R42: decorative intensity (complexity-graded — roadmap 2GN.34) --------------------------

const R39 = CLASSIFICATION_RULES[38];
const R40 = CLASSIFICATION_RULES[39];
const R41 = CLASSIFICATION_RULES[40];
const R42 = CLASSIFICATION_RULES[41];
if (R39.tags.get('elite') !== 0.4 || !R39.tags.has('ceremonial')) {
	throw new Error('CLASSIFICATION_RULES[38] must be the high-decorative-complexity rule');
}
if (R40.tags.get('elite') !== 0.5 || !R40.tags.has('ritual')) {
	throw new Error('CLASSIFICATION_RULES[39] must be the exceptional-decorative-complexity rule');
}
if (R41.tags.get('elite') !== 0.3 || R41.tags.get('ornament') !== 0.3) {
	throw new Error('CLASSIFICATION_RULES[40] must be the decoration-per-part rule');
}
if (R42.tags.get('artisanal') !== 0.4 || R42.tags.get('elite') !== 0.2) {
	throw new Error('CLASSIFICATION_RULES[41] must be the technique-breadth rule');
}

/**
 * A context carrying every rung these four rules read, at the same values doc 12 §2.31 records:
 * `decorativeComplexity` p75 16 / p95 25 (R39/R40), `decorativePerPart` p75 4 (R41),
 * `techniqueComplexity` p90 8 (R42).
 */
const R40_R43_CONTEXT = relativeContext({
	decorativeComplexity: { 0.75: 16, 0.95: 25 },
	decorativePerPart: { 0.75: 4 },
	techniqueComplexity: { 0.9: 8 },
});

Deno.test('R39: decorativeComplexity at or above the culture-phase p75 fires', () => {
	assert(R39.condition(features({ decorativeComplexity: 16 }), R40_R43_CONTEXT));
	assert(!R39.condition(features({ decorativeComplexity: 15 }), R40_R43_CONTEXT));
});

Deno.test('R40: decorativeComplexity at or above the culture-phase p95 fires — and R39 also fires alongside it', () => {
	assert(R40.condition(features({ decorativeComplexity: 25 }), R40_R43_CONTEXT));
	assert(!R40.condition(features({ decorativeComplexity: 24 }), R40_R43_CONTEXT));
	// R39/R40 are deliberately cumulative, not exclusive tiers — an exceptional artefact should
	// score both, reaching the combined elite weight the rules' JSDoc describes. Structural under the
	// ladder: `percentileLadder` thresholds are monotonic across rungs (baselines.test.ts), so p95
	// nests inside p75 by construction, not merely because these two values happen to agree.
	assert(R39.condition(features({ decorativeComplexity: 25 }), R40_R43_CONTEXT));
});

Deno.test('R41: decoration disproportionate to part count fires; proportionate decoration does not', () => {
	assert(R41.condition(features({ decorativeComplexity: 8, partCount: 2 }), R40_R43_CONTEXT)); // ratio 4
	assert(!R41.condition(features({ decorativeComplexity: 7, partCount: 2 }), R40_R43_CONTEXT)); // ratio 3.5
	// Same absolute decorativeComplexity as the fires-case above, but spread over more parts — the
	// whole point of the rule is that this must NOT fire.
	assert(!R41.condition(features({ decorativeComplexity: 8, partCount: 3 }), R40_R43_CONTEXT));
});

Deno.test('R41: a partless artefact never fires, rather than dividing by zero', () => {
	assert(!R41.condition(features({ decorativeComplexity: 20, partCount: 0 }), R40_R43_CONTEXT));
});

Deno.test('R42: techniqueComplexity at or above the culture-phase p90 fires', () => {
	assert(R42.condition(features({ techniqueComplexity: 8 }), R40_R43_CONTEXT));
	assert(!R42.condition(features({ techniqueComplexity: 7 }), R40_R43_CONTEXT));
});

Deno.test('R39, R40, R42: firing is monotonic — once true at a threshold, stays true above it', () => {
	for (let dc = 16; dc <= 40; dc++) {
		assert(R39.condition(features({ decorativeComplexity: dc }), R40_R43_CONTEXT));
	}
	for (let dc = 25; dc <= 40; dc++) {
		assert(R40.condition(features({ decorativeComplexity: dc }), R40_R43_CONTEXT));
	}
	for (let tc = 8; tc <= 15; tc++) {
		assert(R42.condition(features({ techniqueComplexity: tc }), R40_R43_CONTEXT));
	}
});

Deno.test('R39-R42: none fire on neutral (zero-decoration) features', () => {
	const neutral = features();
	assert(!R39.condition(neutral, R40_R43_CONTEXT));
	assert(!R40.condition(neutral, R40_R43_CONTEXT));
	assert(!R41.condition(neutral, R40_R43_CONTEXT));
	assert(!R42.condition(neutral, R40_R43_CONTEXT));
});

Deno.test('R39-R42: each returns false under an empty context, rather than falling back to an absolute reading', () => {
	assertFalse(R39.condition(features({ decorativeComplexity: 99 }), ctx));
	assertFalse(R40.condition(features({ decorativeComplexity: 99 }), ctx));
	assertFalse(R41.condition(features({ decorativeComplexity: 99, partCount: 1 }), ctx));
	assertFalse(R42.condition(features({ techniqueComplexity: 99 }), ctx));
});

/**
 * The ruling's premise, checked at the *rule* level rather than the distribution level
 * (`baselines.test.ts`'s Tarpan/Thalassar test checks the sampler itself): the same artefact must
 * read differently depending on which culture-phase it is judged against. An artefact at
 * `decorativeComplexity` 20 is exceptionally lavish for an austere culture-phase and merely
 * unremarkable for a highly decorative one — that is the whole point of relativising R40, and this
 * is where it would be caught if a migration accidentally left a rule reading an absolute number.
 */
Deno.test('R40: the same artefact reads exceptionally lavish in one culture-phase and ordinary in another', () => {
	const artefact = features({ decorativeComplexity: 20 });
	const austere = relativeContext({ decorativeComplexity: { 0.95: 15 } });
	const lavish = relativeContext({ decorativeComplexity: { 0.95: 30 } });

	assert(R40.condition(artefact, austere), 'exceeds the austere culture-phase p95');
	assertFalse(R40.condition(artefact, lavish), 'does not reach the lavish culture-phase p95');
});

// --- R43: execution quality (roadmap 2GN.98, doc 11 §1.5) ------------------------------------------

const R43 = CLASSIFICATION_RULES[42];
if (R43.tags.get('artisanal') !== 0.4 || R43.tags.get('elite') !== 0.2) {
	throw new Error('CLASSIFICATION_RULES[42] must be the execution-quality rule');
}

/** A context carrying `meanDecorativeGrade` at a hand-set p90 threshold, mirroring `R40_R43_CONTEXT` above. */
const R43_CONTEXT = relativeContext({ meanDecorativeGrade: { 0.9: 0.72 } });

Deno.test('R43: meanDecorativeGrade at or above the culture-phase p90 fires', () => {
	assert(R43.condition(features({ meanDecorativeGrade: 0.72 }), R43_CONTEXT));
	assert(!R43.condition(features({ meanDecorativeGrade: 0.71 }), R43_CONTEXT));
});

Deno.test('R43: fires independent of decorative volume — sparse-but-skilled qualifies, lavish-but-crude does not', () => {
	assert(
		R43.condition(
			features({ meanDecorativeGrade: 0.9, decorativeLayerCount: 1, decorativeComplexity: 2 }),
			R43_CONTEXT,
		),
	);
	assert(
		!R43.condition(
			features({ meanDecorativeGrade: 0.1, decorativeLayerCount: 20, decorativeComplexity: 40 }),
			R43_CONTEXT,
		),
	);
});

Deno.test('R43: does not fire on neutral (zero-decoration) features', () => {
	assert(!R43.condition(features(), R43_CONTEXT));
});

Deno.test('R43: returns false under an empty context, rather than falling back to an absolute reading', () => {
	assertFalse(R43.condition(features({ meanDecorativeGrade: 0.99 }), ctx));
});

Deno.test('R43: the same artefact reads exceptional against an unskilled culture-phase and ordinary against a highly skilled one', () => {
	const artefact = features({ meanDecorativeGrade: 0.5 });
	const unskilled = relativeContext({ meanDecorativeGrade: { 0.9: 0.4 } });
	const skilled = relativeContext({ meanDecorativeGrade: { 0.9: 0.6 } });
	assert(R43.condition(artefact, unskilled));
	assert(!R43.condition(artefact, skilled));
});

// --- Worked-example integration ---------------------------------------------------------------------

Deno.test('integration: an engraved long bronze blade fires weapon, ritual, ceremonial and elite', () => {
	// decorativeLayerCount 6 (not the original 3): R34, the archetype rule this test exercises, was
	// retuned at roadmap 2GN.34 (doc 12 §2.24) from `>= 2` to the measured p50 of edged-artefact
	// layer counts, `>= 6`. The archetype still holds — an engraved blade with an ordinary amount of
	// decoration scores ritual/ceremonial/elite — it just takes more than any two layers to earn it.
	const engravedBlade = features({
		hasEdge: true,
		primaryAxisLength: 'long',
		bladeLengthBand: 'long',
		pointSharpness: 'sharp',
		decorativeLayerCount: 6,
	});

	// R34 (this test's archetype rule) reads decorativeLayerCount against a culture-phase baseline
	// since roadmap 2GN.82 — a hand-built context with the same p75 = 6 the shipped rule uses.
	const firing = CLASSIFICATION_RULES.filter((rule) =>
		rule.condition(engravedBlade, R35_R36_CONTEXT)
	);
	const firedTags = new Set<ArtefactTag>();
	for (const rule of firing) {
		for (const tag of rule.tags.keys()) firedTags.add(tag);
	}

	assert(firedTags.has('weapon'));
	assert(firedTags.has('ritual'));
	assert(firedTags.has('ceremonial'));
	assert(firedTags.has('elite'));

	// Pin the rules actually responsible for ritual/elite, not just the tags — otherwise a future
	// retune of an unrelated rule could silently start supplying these tags instead of R34, and this
	// test would keep passing for the wrong reason.
	assert(
		firing.includes(R34),
		'R34 (the edged-decorated archetype rule) must be among the firing rules',
	);
	assertEquals(R34.tags.get('ritual'), 0.5);
	assertEquals(R34.tags.get('elite'), 0.3);
});
