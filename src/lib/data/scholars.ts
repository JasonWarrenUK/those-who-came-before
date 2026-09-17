/**
 * Measured constants for NPC scholar generation (roadmap 2GN.48, doc 05 §4.1).
 *
 * `TAG_FREQUENCY` and `TAG_COOCCURRENCE_LIFT` are empirical, not authored: they come from running
 * pipeline stages 4-8 (`expandGrammar` → `normaliseArtefact` → `expandDecoration` →
 * `assignMaterials` → `gradeDecorativeLayers` → `extractFeatures` → `classifyArtefact`) over the
 * four Explorer presets at n=400 each and counting which tags a real generated artefact carries
 * at score ≥0.1, and how often pairs of tags co-occur beyond what their individual frequencies
 * would predict. Full reasoning, rejected alternatives and the two mechanism corrections made
 * along the way: `docs/spikes/2GN.48-scholar-cohort.md`.
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
 * materially — the sweep runs the full stages 4-8 chain, so any of the three can shift the
 * distribution. 3WS.15 ("replace mock culture profiles with real `WorldState` data throughout")
 * is the point at which this frozen table should retire in favour of a live per-world computation.
 */

import type { ArtefactTag } from '../types/tags.ts';
import type { SiteType } from '../types/world.ts';

/**
 * Per-tag share of generated artefacts carrying the tag at classification score ≥0.1, pooled
 * across the four Explorer presets (tarpan, thalassar, xoconahtl, khaltiris) at n=400 each.
 *
 * `trade-good` and `currency` are absent: neither tag fires under any shipped classification rule
 * at any threshold tested (0.1, 0.25, 0.5) — a classifier vocabulary gap, not a scholars.ts defect.
 * A scholar can never seed or neighbour on either until that gap closes.
 */
export const TAG_FREQUENCY: Readonly<Record<string, number>> = {
	agricultural: 0.1081,
	artisanal: 0.4519,
	ceremonial: 0.6525,
	communal: 0.0919,
	container: 0.7881,
	domestic: 0.6950,
	elite: 0.8181,
	everyday: 0.2963,
	fastener: 0.3719,
	funerary: 0.2037,
	maritime: 0.0531,
	military: 0.1019,
	ornament: 0.9788,
	personal: 0.6038,
	ritual: 0.1537,
	tool: 0.6644,
	utilitarian: 0.4938,
	votive: 0.4781,
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
 * threshold, and any pair touching `trade-good`/`currency` (never measured, see `TAG_FREQUENCY`),
 * are absent by construction — `tagLift()` defaults an absent pair to `1.0` (independence).
 */
export const TAG_COOCCURRENCE_LIFT: Readonly<Record<string, number>> = {
	'agricultural+artisanal': 1.305,
	'agricultural+ceremonial': 1.364,
	'agricultural+communal': 3.775,
	'agricultural+container': 1.181,
	'agricultural+domestic': 1.347,
	'agricultural+elite': 1.088,
	'agricultural+everyday': 1.093,
	'agricultural+fastener': 1.041,
	'agricultural+funerary': 1.390,
	'agricultural+military': 1.816,
	'agricultural+ornament': 1.022,
	'agricultural+personal': 1.264,
	'agricultural+ritual': 3.684,
	'agricultural+tool': 1.505,
	'agricultural+utilitarian': 1.838,
	'agricultural+votive': 1.475,
	'agricultural+weapon': 1.808,
	'artisanal+ceremonial': 1.149,
	'artisanal+communal': 1.536,
	'artisanal+container': 1.069,
	'artisanal+domestic': 1.081,
	'artisanal+elite': 1.133,
	'artisanal+everyday': 0.966,
	'artisanal+fastener': 1.097,
	'artisanal+funerary': 1.120,
	'artisanal+maritime': 0.911,
	'artisanal+military': 1.344,
	'artisanal+ornament': 1.020,
	'artisanal+personal': 0.967,
	'artisanal+ritual': 1.835,
	'artisanal+tool': 1.293,
	'artisanal+utilitarian': 1.168,
	'artisanal+votive': 1.284,
	'artisanal+weapon': 1.118,
	'ceremonial+communal': 1.533,
	'ceremonial+container': 1.167,
	'ceremonial+domestic': 1.144,
	'ceremonial+elite': 1.212,
	'ceremonial+everyday': 1.022,
	'ceremonial+fastener': 1.051,
	'ceremonial+funerary': 1.124,
	'ceremonial+maritime': 1.046,
	'ceremonial+military': 1.185,
	'ceremonial+ornament': 1.013,
	'ceremonial+personal': 1.033,
	'ceremonial+ritual': 1.533,
	'ceremonial+tool': 1.083,
	'ceremonial+utilitarian': 1.148,
	'ceremonial+votive': 1.264,
	'ceremonial+weapon': 1.086,
	'communal+container': 1.217,
	'communal+domestic': 1.380,
	'communal+elite': 1.147,
	'communal+everyday': 1.010,
	'communal+fastener': 1.573,
	'communal+funerary': 1.102,
	'communal+military': 2.070,
	'communal+ornament': 1.022,
	'communal+personal': 1.262,
	'communal+ritual': 2.522,
	'communal+tool': 1.188,
	'communal+utilitarian': 1.956,
	'communal+votive': 1.636,
	'communal+weapon': 1.168,
	'container+domestic': 1.246,
	'container+elite': 1.049,
	'container+everyday': 1.092,
	'container+fastener': 1.036,
	'container+funerary': 1.269,
	'container+maritime': 1.269,
	'container+military': 1.020,
	'container+ornament': 1.008,
	'container+personal': 1.000,
	'container+ritual': 1.176,
	'container+tool': 1.032,
	'container+utilitarian': 1.217,
	'container+votive': 1.269,
	'container+weapon': 1.029,
	'domestic+elite': 1.035,
	'domestic+everyday': 1.281,
	'domestic+fastener': 1.047,
	'domestic+funerary': 0.967,
	'domestic+maritime': 1.287,
	'domestic+military': 1.059,
	'domestic+ornament': 1.007,
	'domestic+personal': 1.023,
	'domestic+ritual': 1.222,
	'domestic+tool': 1.049,
	'domestic+utilitarian': 1.346,
	'domestic+votive': 1.121,
	'domestic+weapon': 1.044,
	'elite+everyday': 1.029,
	'elite+fastener': 1.025,
	'elite+funerary': 1.031,
	'elite+maritime': 0.963,
	'elite+military': 1.080,
	'elite+ornament': 1.015,
	'elite+personal': 0.997,
	'elite+ritual': 1.222,
	'elite+tool': 1.027,
	'elite+utilitarian': 1.029,
	'elite+votive': 1.085,
	'elite+weapon': 1.029,
	'everyday+fastener': 0.987,
	'everyday+funerary': 0.331,
	'everyday+maritime': 1.072,
	'everyday+military': 1.035,
	'everyday+ornament': 0.989,
	'everyday+personal': 1.125,
	'everyday+ritual': 1.029,
	'everyday+tool': 0.965,
	'everyday+utilitarian': 1.034,
	'everyday+votive': 0.671,
	'everyday+weapon': 0.980,
	'fastener+funerary': 0.965,
	'fastener+maritime': 0.949,
	'fastener+military': 1.072,
	'fastener+ornament': 1.022,
	'fastener+personal': 1.269,
	'fastener+ritual': 1.137,
	'fastener+tool': 1.057,
	'fastener+utilitarian': 1.059,
	'fastener+votive': 1.062,
	'fastener+weapon': 1.063,
	'funerary+maritime': 1.732,
	'funerary+military': 1.054,
	'funerary+ornament': 1.019,
	'funerary+personal': 1.011,
	'funerary+ritual': 1.197,
	'funerary+tool': 1.043,
	'funerary+utilitarian': 1.261,
	'funerary+votive': 2.092,
	'funerary+weapon': 1.026,
	'maritime+ornament': 0.986,
	'maritime+personal': 0.994,
	'maritime+tool': 1.009,
	'maritime+utilitarian': 2.025,
	'maritime+votive': 1.058,
	'maritime+weapon': 1.000,
	'military+ornament': 1.003,
	'military+personal': 1.016,
	'military+ritual': 1.716,
	'military+tool': 1.117,
	'military+utilitarian': 2.025,
	'military+votive': 1.193,
	'military+weapon': 1.076,
	'ornament+personal': 1.011,
	'ornament+ritual': 1.022,
	'ornament+tool': 1.015,
	'ornament+utilitarian': 1.007,
	'ornament+votive': 1.015,
	'ornament+weapon': 1.014,
	'personal+ritual': 1.158,
	'personal+tool': 1.019,
	'personal+utilitarian': 1.040,
	'personal+votive': 1.028,
	'personal+weapon': 1.048,
	'ritual+tool': 1.505,
	'ritual+utilitarian': 1.342,
	'ritual+votive': 1.879,
	'ritual+weapon': 1.698,
	'tool+utilitarian': 1.063,
	'tool+votive': 1.131,
	'tool+weapon': 1.505,
	'utilitarian+votive': 1.348,
	'utilitarian+weapon': 1.039,
	'votive+weapon': 1.120,
};

/**
 * Lift between two tags, symmetric, defaulting to `1.0` (independence) for any pair absent from
 * `TAG_COOCCURRENCE_LIFT` — below the n=20 support threshold, or touching `trade-good`/`currency`.
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
 * `shipwreck` keeps its `trade-good` entry even though that tag currently never fires (see
 * `TAG_FREQUENCY`) — reachable only via `maritime` until the classifier gap closes, at which point
 * this row becomes fully live without further editing.
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
