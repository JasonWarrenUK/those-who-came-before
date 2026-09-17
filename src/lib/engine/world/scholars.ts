/**
 * NPC scholar cohort generation (roadmap 2GN.48, doc 05 §4.1, stage 3 of the 9-stage pipeline).
 *
 * `generateNPCScholars` produces the 3-4 named researchers whose accumulated, calibrated-wrong
 * output seeds the professional corpus (2GN.50/51/52/54/53 build on this). Signature takes the
 * loose `Culture[]`/`WorldChronology` bag M2 can actually supply — `WorldState` doesn't exist
 * until 3WS.9 — per the same reasoning as 2GN.56's note. No excavation input: the 2GN.44 edge was
 * removed on 2026-07-30 since `generateNPCScholars` doesn't need one.
 *
 * Three design questions the roadmap line didn't pin (cohort shape, specialisation coherence,
 * site-preference source) were run as a spike interview rather than decided inline; full
 * reasoning, measurements and two mechanism corrections: `docs/spikes/2GN.48-scholar-cohort.md`.
 */

import type { Culture, SiteType, WorldChronology } from '../../types/world.ts';
import type { CareerStage, NPCScholarSeed, ScholarStatus } from '../../types/scholars.ts';
import type { InterpretiveModel, MethodologicalBias } from '../../types/interpretation.ts';
import type { ArtefactTag } from '../../types/tags.ts';
import { weightedSelect } from '../prng.ts';
import { generateScholarName } from './naming.ts';
import { MODERN_LANGUAGE_ID, MODERN_PHONOLOGY } from '../../data/names/modern.ts';
import { SITE_TYPE_TAG_AFFINITY, TAG_FREQUENCY, tagLift } from '../../data/scholars.ts';

/** How many NPC scholars a generated cohort has (doc 05 §4.1/§4.6, doc 09: "3-4 NPC researchers"). */
const COHORT_SIZE = 4;

/** Doc 07 §5.1's three named methodological schools. `'generalist'` is excluded here: it is the
 * documented neutral *player* default (`MethodologicalProfile`'s own JSDoc), not an NPC starting
 * point — an NPC scholar has picked a school by the time they have a publication record. */
const NPC_METHODOLOGICAL_BIASES: readonly MethodologicalBias[] = [
	'materialist',
	'structuralist',
	'culturalist',
];

/** All tags `TAG_FREQUENCY` has a measured rate for — `trade-good`/`currency` are absent by
 * construction (see `data/scholars.ts`). */
const SPECIALISABLE_TAGS = Object.keys(TAG_FREQUENCY) as ArtefactTag[];

const ALL_SITE_TYPES = Object.keys(SITE_TYPE_TAG_AFFINITY) as SiteType[];

/**
 * Draws one scholar's `careerStage`/`status`/`publicationCount` for one cohort slot.
 *
 * Dealt, not independently rolled (2GN.48 spike, Ruling 1): slot 0 is always a senior-or-emeritus
 * anchor grounding the corpus, slot 1 is always early-or-mid so the player has someone active to
 * meet, the remaining slots draw freely across all four stages. Measured over 5000 simulated
 * cohorts: independent draws leave 6.2-6.3% of cohorts with no anchor or no active scholar at all;
 * this dealt spread is 0% by construction.
 */
function drawCareerStage(slotIndex: number, prng: () => number): CareerStage {
	if (slotIndex === 0) return prng() < 0.5 ? 'emeritus' : 'senior';
	if (slotIndex === 1) return prng() < 0.5 ? 'early' : 'mid';
	const stages: CareerStage[] = ['emeritus', 'senior', 'mid', 'early'];
	return stages[Math.floor(prng() * stages.length)];
}

/** `status` and `publicationCount` follow deterministically from `careerStage`, not independent
 * rolls (2GN.48 spike): publication count accumulates monotonically with career length, and a
 * deceased early-career scholar is noise in a four-person field, not a real possibility. */
function deriveStatusAndPublications(
	careerStage: CareerStage,
	prng: () => number,
): { status: ScholarStatus; publicationCount: number } {
	switch (careerStage) {
		case 'emeritus':
			return {
				status: prng() < 0.6 ? 'retired' : 'deceased',
				publicationCount: 40 + Math.floor(prng() * 21), // 40-60
			};
		case 'senior':
			return {
				status: prng() < 0.85 ? 'active' : 'retired',
				publicationCount: 20 + Math.floor(prng() * 21), // 20-40
			};
		case 'mid':
			return { status: 'active', publicationCount: 8 + Math.floor(prng() * 13) }; // 8-20
		case 'early':
			return { status: 'active', publicationCount: 2 + Math.floor(prng() * 7) }; // 2-8
	}
}

/**
 * Draws a coherent specialisation set: a seed tag by measured frequency, then 1-2 neighbours
 * weighted by `lift × frequency` against the seed (2GN.48 spike, Ruling 2). Weighting neighbours
 * by lift alone was tried and rejected — lift is largest on rare tags, so it steered every cohort
 * toward the record's rare corners; blending with frequency keeps the commonest categories
 * (container, ornament, tool) reachable while still preferring genuinely associated pairs
 * (maritime+utilitarian, not maritime+ceremonial).
 */
function drawSpecialisation(prng: () => number): ArtefactTag[] {
	const seed = weightedSelect(SPECIALISABLE_TAGS, prng, (tag) => TAG_FREQUENCY[tag]);
	const neighbourCount = 1 + Math.floor(prng() * 2); // 1 or 2
	const specialisation: ArtefactTag[] = [seed];
	const pool = SPECIALISABLE_TAGS.filter((tag) => tag !== seed);

	for (let i = 0; i < neighbourCount && pool.length > 0; i++) {
		const pick = weightedSelect(
			pool,
			prng,
			(tag) => tagLift(seed, tag) * TAG_FREQUENCY[tag],
		);
		specialisation.push(pick);
		pool.splice(pool.indexOf(pick), 1);
	}

	return specialisation;
}

/**
 * Draws 1-2 preferred site types, weighted by overlap with the scholar's `specialisation`
 * (2GN.48 spike, Ruling 3). An NPC bias from "interests and institutional access" (doc 05 §4.1),
 * not a property read off `culture.baseProfile.craftInvestment.siteTypeWeights` — that field
 * records where the *ancient culture* invested effort, not where a *modern scholar* chooses to dig.
 */
function drawSitePreference(specialisation: ArtefactTag[], prng: () => number): SiteType[] {
	const overlapWeight = (siteType: SiteType): number => {
		const affinityTags = SITE_TYPE_TAG_AFFINITY[siteType];
		const overlap = affinityTags.filter((tag) => specialisation.includes(tag)).length;
		return overlap + 0.1; // every site type stays drawable, overlap just favours it
	};

	const preferenceCount = 1 + Math.floor(prng() * 2); // 1 or 2
	const preferences: SiteType[] = [];
	const pool = [...ALL_SITE_TYPES];

	for (let i = 0; i < preferenceCount && pool.length > 0; i++) {
		const pick = weightedSelect(pool, prng, overlapWeight);
		preferences.push(pick);
		pool.splice(pool.indexOf(pick), 1);
	}

	return preferences;
}

/** Builds the identity-only slice of a fresh NPC's `InterpretiveModel`: `agentId` and a drawn
 * `methodologicalWeights`. Every claim map stays empty and the contradiction queue zeroed —
 * populating claims with calibrated wrongness is 2GN.49's job, not this task's (2GN.48 spike). */
function buildIdentityModel(agentId: string, prng: () => number): InterpretiveModel {
	const bias = NPC_METHODOLOGICAL_BIASES[
		Math.floor(prng() * NPC_METHODOLOGICAL_BIASES.length)
	];

	return {
		agentId,
		culturalClaims: new Map(),
		artefactClaims: new Map(),
		chronologicalClaims: new Map(),
		agentAssessments: new Map(),
		methodologicalWeights: {
			bias,
			weights: { materialEvidence: 1.0, structuralEvidence: 1.0, culturalEvidence: 1.0 },
		},
		strainScores: new Map(),
		contradictionQueue: { items: [], totalSeverity: 0, reputationalPressure: 0 },
	};
}

/**
 * Generates the world's 3-4 NPC scholars: name, specialisation, career stage and every other
 * `NPCScholarSeed` field (doc 05 §4.1). Deterministic for a given `prng` sequence.
 *
 * @param cultures - Every culture in this world; scholars draw `cultureFocus` from their ids.
 * @param chronology - Supplies `cultureTimelines` so `cultureFocus` only ever names cultures that
 *   actually have phases.
 * @param prng - Seeded generator; every draw in this module reads from it, never from
 *   `MODERN_PHONOLOGY`'s own pinned seed, so distinct world seeds produce distinct cohorts.
 */
export function generateNPCScholars(
	cultures: readonly Culture[],
	chronology: WorldChronology,
	prng: () => number,
): NPCScholarSeed[] {
	const culturesWithPhases = chronology.cultureTimelines
		.filter((timeline) => timeline.phases.length > 0)
		.map((timeline) => timeline.cultureId)
		.filter((cultureId) => cultures.some((culture) => culture.id === cultureId));

	const scholars: NPCScholarSeed[] = [];

	for (let slotIndex = 0; slotIndex < COHORT_SIZE; slotIndex++) {
		const id = `scholar-${slotIndex + 1}`;
		const name = generateScholarName(MODERN_PHONOLOGY, MODERN_LANGUAGE_ID, prng);
		const specialisation = drawSpecialisation(prng);
		const careerStage = drawCareerStage(slotIndex, prng);
		const { status, publicationCount } = deriveStatusAndPublications(careerStage, prng);
		const sitePreference = drawSitePreference(specialisation, prng);

		const focusCount = culturesWithPhases.length > 0
			? 1 + Math.floor(prng() * Math.min(2, culturesWithPhases.length))
			: 0;
		const cultureFocus: string[] = [];
		const focusPool = [...culturesWithPhases];
		for (let i = 0; i < focusCount && focusPool.length > 0; i++) {
			const index = Math.floor(prng() * focusPool.length);
			cultureFocus.push(focusPool[index]);
			focusPool.splice(index, 1);
		}

		scholars.push({
			id,
			name,
			specialisation,
			cultureFocus,
			interpretiveModel: buildIdentityModel(id, prng),
			sitePreference,
			careerStage,
			status,
			publicationCount,
		});
	}

	return scholars;
}
