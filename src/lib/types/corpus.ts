/**
 * Professional corpus type definitions (doc 05 §4.2–§4.3).
 *
 * The corpus is the aggregated output of all simulated NPC research: what the field "knows" at
 * game start. It is deliberately imperfect — coverage gaps leave whole cultures and site types
 * undocumented (§4.2), and calibrated wrongness (§4.5) targets ~70% broadly correct, ~30%
 * interestingly wrong, with errors concentrated in interpretive claims, absence claims, rarity
 * assessments and cross-cultural relationships.
 *
 * The corpus is one of the two comparison sources for the agent-generic contradiction detector
 * (doc 06 §4.3), alongside the world state's occluded properties. Corpus contradictions surface
 * through peer channels and don't always mean the agent is wrong — the corpus can itself be wrong,
 * and the player must decide whether to defer to authority or trust their own evidence.
 *
 * Generation lands at 2GN.50–2GN.55 (`engine/generation/corpus.ts`). This module is data shapes
 * only, no behaviour. Cross-domain references (NPC ids, document node ids, culture ids, period
 * ids) are plain `string` per the career.ts convention.
 */

import type { SiteType } from './world.ts';

/**
 * Controls how unevenly simulated research attention is distributed across the world (doc 05
 * §4.2). Coverage biases are archaeologically authentic: large, urban, monumental cultures attract
 * more research; burials and temples get excavated before rubbish heaps. The resulting gaps are
 * the player's opportunity space.
 */
export interface CoverageBudget {
	totalExcavations: number;

	/** Prominent cultures get more attention. Keyed by culture id. */
	cultureBias: Map<string, number>;

	/** Burials/monuments over middens/workshops. */
	siteTypeBias: Map<SiteType, number>;

	/** Later periods better documented. Keyed by period id. */
	periodBias: Map<string, number>;

	/** Guaranteed undocumented site types per culture. */
	minimumGapPerCulture: number;
}

/**
 * What the field "knows" at game start (doc 05 §4.3) — the aggregated output of all simulated
 * NPC research. The player encounters it as reference works, active debates, bibliographies and
 * conspicuous absences (doc 05 §4.4).
 */
export interface ProfessionalCorpus {
	/** Keyed by material id. */
	materialFrequencies: Map<string, FrequencyRecord>;

	/** Keyed by form id. */
	formFrequencies: Map<string, FrequencyRecord>;

	/** Keyed by context tag. */
	contextAssociations: Map<string, ContextFrequency>;

	activeDebates: Debate[];
	receivedWisdom: ConsensusStatement[];
}

/**
 * The corpus's record of how often a material or form has been observed (doc 05 §4.3).
 * `consensusRarity` is the field's belief, not ground truth — rarity assessments are one of the
 * calibrated wrongness channels (doc 05 §4.5).
 */
export interface FrequencyRecord {
	totalObserved: number;

	/** Keyed by context tag. */
	byContext: Map<string, number>;

	/** Keyed by culture id. */
	byCulture: Map<string, number>;

	consensusRarity: 'ubiquitous' | 'common' | 'uncommon' | 'rare' | 'unique';

	/** Term index of most recent update. */
	lastUpdated: number;
}

/**
 * PROVISIONAL — named by `ProfessionalCorpus.contextAssociations` (doc 05 §4.3) but shaped
 * nowhere in the docs. Authored here as the reverse index of `FrequencyRecord.byContext`: where
 * a `FrequencyRecord` answers "in which contexts does this material/form appear?", a
 * `ContextFrequency` answers "which materials/forms appear in this context?". Firms up at 2GN.53
 * (`aggregateCorpus`), the first real producer.
 */
export interface ContextFrequency {
	totalObserved: number;

	/** Keyed by culture id. */
	byCulture: Map<string, number>;

	/** Keyed by material id. */
	associatedMaterials: Map<string, number>;

	/** Keyed by form id. */
	associatedForms: Map<string, number>;

	/** Term index of most recent update, mirroring `FrequencyRecord`. */
	lastUpdated: number;
}

/**
 * A claim the field treats as settled, to some degree (doc 05 §4.3). Presented to the player as
 * established fact via reference works — which is exactly how calibrated wrongness propagates.
 */
export interface ConsensusStatement {
	claim: string;
	confidence: 'established' | 'accepted' | 'debated' | 'speculative';

	/** Document node ids (doc 10). */
	supportingPublications: string[];

	/** Document node ids (doc 10). */
	challengingPublications: string[];
}

/**
 * An unsettled question where NPCs disagree (doc 05 §4.3). The player can read all positions and
 * eventually weigh in.
 */
export interface Debate {
	topic: string;
	positions: DebatePosition[];
}

/** One NPC's stance in a debate (doc 05 §4.3). */
export interface DebatePosition {
	/** References an NPC scholar (scholars.ts) by id. */
	npcId: string;

	stance: string;

	/** Document node or artefact ids the position rests on. */
	evidence: string[];
}
