/**
 * Measured constants for NPC scholar generation (roadmap 2GN.48, doc 05 §4.1).
 *
 * `TAG_FREQUENCY` and `TAG_COOCCURRENCE_LIFT` are empirical, not authored: they come from running
 * pipeline stages 4-9 (`expandGrammar` → `normaliseArtefact` → `expandDecoration` →
 * `assignMaterials` → `assignDecorativeDetails` → `gradeDecorativeLayers` → `extractFeatures` →
 * `classifyArtefact`) over the four Explorer presets at n=400 each and counting which tags a real
 * generated artefact carries at score ≥0.1, and how often pairs of tags co-occur beyond what
 * their individual frequencies would predict. Full reasoning, rejected alternatives and the two
 * mechanism corrections made along the way: `docs/spikes/2GN.48-scholar-cohort.md`.
 *
 * **Re-recorded for roadmap 2GN.68** (doc 12 §2.61): the sweep ran without `assignDecorativeDetails`
 * until then, the same gap the six production call sites carried, so the tables below are the
 * first measured against the pipeline real artefacts actually go through. `votive`, `ceremonial`
 * and `elite` moved materially (decoration now contributes precious-material and multi-origin-motif
 * evidence those tags read); `trade-good` clears the award threshold for the first time (1.4%) and
 * ships here for the first time, retiring the "never fires" reading below.
 *
 * `SITE_TYPE_TAG_AFFINITY` is the one hand-authored table here, deliberately: it is a design claim
 * about what an archaeologist with a given specialism chooses to dig, not a property the generator
 * encodes anywhere. See the spike's "Sourcing, and why it is frozen" section for why the two
 * tables take different sourcing.
 *
 * ⚠️ Frozen, not live-computed: `generateNPCScholars(cultures, chronology, prng)` has no grammar
 * rules, material/classification catalogues or baseline context to sample from, so these are
 * measured offline and pinned here, calibration-tested against drift (`scholars.calibration.test.ts`).
 * Re-measure if `data/decorations.ts`, `data/materials.ts` or `data/classification.ts` change
 * materially — the sweep runs the full stages 4-9 chain, so any of the three can shift the
 * distribution. 3WS.15 ("replace mock culture profiles with real `WorldState` data throughout")
 * is the point at which this frozen table should retire in favour of a live per-world computation.
 */

import type { ArtefactTag } from '../types/tags.ts';
import type { SiteType } from '../types/world.ts';

/**
 * Per-tag share of generated artefacts carrying the tag at classification score ≥0.1, pooled
 * across the four Explorer presets (tarpan, thalassar, xoconahtl, khaltiris) at n=400 each.
 *
 * `currency` is absent: it fires under no shipped classification rule at any threshold tested
 * (0.1, 0.25, 0.5) — a classifier vocabulary gap, not a scholars.ts defect. A scholar can never
 * seed or neighbour on it until that gap closes. `trade-good` now clears the award threshold
 * (roadmap 2GN.68's decoration wiring, see the module JSDoc) and ships below for the first time.
 */
export const TAG_FREQUENCY: Readonly<Partial<Record<ArtefactTag, number>>> = {
	agricultural: 0.1081,
	artisanal: 0.4550,
	ceremonial: 0.7788,
	communal: 0.0919,
	container: 0.7881,
	domestic: 0.6950,
	elite: 0.8894,
	everyday: 0.2963,
	fastener: 0.3719,
	funerary: 0.2037,
	maritime: 0.0531,
	military: 0.1019,
	ornament: 0.9788,
	personal: 0.6038,
	ritual: 0.1400,
	tool: 0.6644,
	'trade-good': 0.0138,
	utilitarian: 0.4938,
	votive: 0.7137,
	weapon: 0.5531,
};

/**
 * Pairwise co-occurrence lift, `P(A∧B) / (P(A)·P(B))`, for every tag pair with at least 20
 * supporting artefacts in the same sweep that produced `TAG_FREQUENCY`. Scale-free by
 * construction, so — unlike raw co-occurrence percentage — the ranking is not dominated by which
 * tags happen to be individually common; 1.0 is independence, above favours co-occurrence, below
 * disfavours it (`everyday+funerary` at 0.331 is a real negative association: everyday objects are
 * under-represented as grave goods).
 *
 * Keys are the two tags sorted alphabetically and joined with `+`. Pairs below the n=20 support
 * threshold, and any pair touching `currency` (never measured, see `TAG_FREQUENCY`), are absent
 * by construction — `tagLift()` defaults an absent pair to `1.0` (independence). `trade-good` now
 * clears support for four pairs (roadmap 2GN.68's decoration wiring) and ships them below.
 */
export const TAG_COOCCURRENCE_LIFT: Readonly<Record<string, number>> = {
	'agricultural+artisanal': 1.3085,
	'agricultural+ceremonial': 1.2099,
	'agricultural+communal': 3.7749,
	'agricultural+container': 1.1808,
	'agricultural+domestic': 1.3474,
	'agricultural+elite': 1.0724,
	'agricultural+everyday': 1.0927,
	'agricultural+fastener': 1.0414,
	'agricultural+funerary': 1.3901,
	'agricultural+military': 1.8157,
	'agricultural+ornament': 1.0217,
	'agricultural+personal': 1.2638,
	'agricultural+ritual': 3.7159,
	'agricultural+tool': 1.5052,
	'agricultural+utilitarian': 1.8380,
	'agricultural+votive': 1.2391,
	'agricultural+weapon': 1.8079,
	'artisanal+ceremonial': 1.0866,
	'artisanal+communal': 1.5250,
	'artisanal+container': 1.0684,
	'artisanal+domestic': 1.0811,
	'artisanal+elite': 1.0920,
	'artisanal+everyday': 0.9691,
	'artisanal+fastener': 1.0934,
	'artisanal+funerary': 1.1259,
	'artisanal+maritime': 0.9308,
	'artisanal+military': 1.3349,
	'artisanal+ornament': 1.0203,
	'artisanal+personal': 0.9669,
	'artisanal+ritual': 1.8740,
	'artisanal+tool': 1.2922,
	'artisanal+utilitarian': 1.1629,
	'artisanal+votive': 1.1162,
	'artisanal+weapon': 1.1200,
	'ceremonial+communal': 1.2841,
	'ceremonial+container': 1.1191,
	'ceremonial+domestic': 1.1028,
	'ceremonial+elite': 1.1208,
	'ceremonial+everyday': 1.0051,
	'ceremonial+fastener': 1.0208,
	'ceremonial+funerary': 1.1108,
	'ceremonial+maritime': 1.0122,
	'ceremonial+military': 1.0872,
	'ceremonial+ornament': 1.0143,
	'ceremonial+personal': 1.0329,
	'ceremonial+ritual': 1.2841,
	'ceremonial+tool': 1.0787,
	'ceremonial+trade-good': 1.1674,
	'ceremonial+utilitarian': 1.0972,
	'ceremonial+votive': 1.2065,
	'ceremonial+weapon': 1.0810,
	'communal+container': 1.2170,
	'communal+domestic': 1.3801,
	'communal+elite': 1.0938,
	'communal+everyday': 1.0104,
	'communal+fastener': 1.5732,
	'communal+funerary': 1.1018,
	'communal+military': 2.0700,
	'communal+ornament': 1.0217,
	'communal+personal': 1.2620,
	'communal+ritual': 2.6239,
	'communal+tool': 1.1878,
	'communal+utilitarian': 1.9564,
	'communal+votive': 1.2962,
	'communal+weapon': 1.1684,
	'container+domestic': 1.2460,
	'container+elite': 1.0468,
	'container+everyday': 1.0922,
	'container+fastener': 1.0364,
	'container+funerary': 1.2688,
	'container+maritime': 1.2688,
	'container+military': 1.0197,
	'container+ornament': 1.0079,
	'container+personal': 0.9996,
	'container+ritual': 1.1669,
	'container+tool': 1.0325,
	'container+utilitarian': 1.2174,
	'container+votive': 1.1411,
	'container+weapon': 1.0294,
	'domestic+elite': 1.0405,
	'domestic+everyday': 1.2810,
	'domestic+fastener': 1.0471,
	'domestic+funerary': 0.9666,
	'domestic+maritime': 1.2865,
	'domestic+military': 1.0593,
	'domestic+ornament': 1.0070,
	'domestic+personal': 1.0233,
	'domestic+ritual': 1.2205,
	'domestic+tool': 1.0490,
	'domestic+utilitarian': 1.3460,
	'domestic+votive': 1.0861,
	'domestic+weapon': 1.0438,
	'elite+everyday': 1.0082,
	'elite+fastener': 1.0091,
	'elite+funerary': 1.0313,
	'elite+maritime': 0.9789,
	'elite+military': 1.0209,
	'elite+ornament': 1.0152,
	'elite+personal': 1.0033,
	'elite+ritual': 1.1244,
	'elite+tool': 1.0376,
	'elite+trade-good': 1.1244,
	'elite+utilitarian': 1.0290,
	'elite+votive': 1.0820,
	'elite+weapon': 1.0393,
	'everyday+fastener': 0.9871,
	'everyday+funerary': 0.3313,
	'everyday+maritime': 1.0722,
	'everyday+military': 1.0354,
	'everyday+ornament': 0.9894,
	'everyday+personal': 1.1252,
	'everyday+ritual': 0.9946,
	'everyday+tool': 0.9653,
	'everyday+utilitarian': 1.0340,
	'everyday+votive': 0.8808,
	'everyday+weapon': 0.9802,
	'fastener+funerary': 0.9651,
	'fastener+maritime': 0.9491,
	'fastener+military': 1.0723,
	'fastener+ornament': 1.0217,
	'fastener+personal': 1.2694,
	'fastener+ritual': 1.1405,
	'fastener+tool': 1.0574,
	'fastener+utilitarian': 1.0586,
	'fastener+votive': 1.0573,
	'fastener+weapon': 1.0635,
	'funerary+maritime': 1.7322,
	'funerary+military': 1.0539,
	'funerary+ornament': 1.0186,
	'funerary+personal': 1.0111,
	'funerary+ritual': 1.2270,
	'funerary+tool': 1.0435,
	'funerary+utilitarian': 1.2612,
	'funerary+votive': 1.4011,
	'funerary+weapon': 1.0260,
	'maritime+ornament': 0.9857,
	'maritime+personal': 0.9938,
	'maritime+tool': 1.0094,
	'maritime+utilitarian': 2.0253,
	'maritime+votive': 1.0219,
	'maritime+weapon': 0.9997,
	'military+ornament': 1.0029,
	'military+personal': 1.0161,
	'military+ritual': 1.7967,
	'military+tool': 1.1173,
	'military+utilitarian': 2.0253,
	'military+votive': 1.0658,
	'military+weapon': 1.0759,
	'ornament+personal': 1.0111,
	'ornament+ritual': 1.0217,
	'ornament+tool': 1.0150,
	'ornament+trade-good': 1.0217,
	'ornament+utilitarian': 1.0075,
	'ornament+votive': 1.0172,
	'ornament+weapon': 1.0136,
	'personal+ritual': 1.1387,
	'personal+tool': 1.0190,
	'personal+utilitarian': 1.0399,
	'personal+votive': 1.0443,
	'personal+weapon': 1.0481,
	'ritual+tool': 1.5052,
	'ritual+utilitarian': 1.3743,
	'ritual+votive': 1.3448,
	'ritual+weapon': 1.6788,
	'tool+trade-good': 1.3683,
	'tool+utilitarian': 1.0631,
	'tool+votive': 1.1111,
	'tool+weapon': 1.5052,
	'utilitarian+votive': 1.1457,
	'utilitarian+weapon': 1.0390,
	'votive+weapon': 1.1066,
};

/**
 * Lift between two tags, symmetric, defaulting to `1.0` (independence) for any pair absent from
 * `TAG_COOCCURRENCE_LIFT` — below the n=20 support threshold, or touching `currency`.
 */
export function tagLift(a: ArtefactTag, b: ArtefactTag): number {
	if (a === b) return 1.0;
	const key = [a, b].sort().join('+');
	return TAG_COOCCURRENCE_LIFT[key] ?? 1.0;
}

/**
 * Which `ArtefactTag`s a scholar's dig-site preference should favour, keyed by `SiteType`
 * (roadmap 2GN.48 spike). Hand-authored, deliberately: unlike specialisation coherence, this is a
 * design claim about what an archaeologist with a given specialism chooses to dig, not something
 * the generator's own artefact output encodes.
 *
 * `shipwreck`'s `trade-good` entry (once reachable only via `maritime`, before roadmap 2GN.68 gave
 * `trade-good` a nonzero `TAG_FREQUENCY`) is now fully live without further editing.
 */
export const SITE_TYPE_TAG_AFFINITY: Readonly<Record<SiteType, readonly ArtefactTag[]>> = {
	settlement: ['domestic', 'everyday', 'utilitarian', 'tool'],
	burial: ['funerary', 'votive', 'ritual'],
	workshop: ['artisanal', 'tool', 'container'],
	midden: ['domestic', 'everyday', 'agricultural'],
	shrine: ['ritual', 'votive', 'ceremonial'],
	cache: ['votive', 'elite', 'ceremonial'],
	shipwreck: ['maritime', 'trade-good'],
	battlefield: ['military', 'weapon'],
	market: ['trade-good', 'maritime', 'communal'],
	fortification: ['military', 'weapon'],
	quarry: ['artisanal', 'tool'],
};
