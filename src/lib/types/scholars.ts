/**
 * NPC scholar type definitions (doc 07 §5.1, doc 05 §4.1).
 *
 * At MVP, NPCs are reactive functions, not simulated agents (doc 07 §5): they have no research
 * agendas, publication schedules or political manoeuvres — they exist as surfaces off which the
 * player's actions bounce. They originate from the professional corpus generated during world
 * creation (doc 05, stage 4.5), each arriving with a name, specialism, methodological bias and a
 * body of published work carrying calibrated wrongness.
 *
 * NPC interpretive models are agent-generic — the same `InterpretiveModel` interface the player
 * uses (doc 11 §2.6), generated statically during corpus creation rather than evolving
 * dynamically. NPC errors are simply claims in their models that diverge from occluded ground
 * truth: subjective positions, not metadata flags (the previous `corpusErrors` field is retired,
 * doc 07 §5.1). Engine functions (lens calculation, contradiction detection, peer review) accept
 * any `InterpretiveModel` without knowing whose it is. This module is data shapes only, no
 * behaviour.
 */

import type { InterpretiveModel, MethodologicalBias } from './interpretation.ts';
import type { FunctionTag } from './tags.ts';
import type { SiteType } from './world.ts';

/**
 * An NPC scholar as the interactive layer sees them (doc 07 §5.1), sitting on top of the corpus
 * data generated at world creation.
 *
 * `specialism.methodologicalBias` is narrowed from doc 07's `string` (whose comment names the
 * three doc 07 §5.1 values) to the existing `MethodologicalBias` union per the register-narrowing
 * precedent (1FD.31), which also admits the authored `'generalist'` neutral member.
 */
export interface MinimalScholar {
	id: string;
	name: string;

	specialism: {
		/** Which cultures they care about. */
		cultureAffinity: string[];

		methodologicalBias: MethodologicalBias;
	};

	/** Agent-generic — same interface as the player's model (doc 11 §2.6). */
	interpretiveModel: InterpretiveModel;

	/** Document node IDs (doc 10) from world generation. */
	corpusPublications: string[];

	relationship: {
		/** 0–1: how seriously they take the player. */
		respect: number;

		/** 0–1: how much they agree with the player's published work. */
		agreement: number;
	};
}

/**
 * An NPC scholar as world generation seeds them (doc 05 §4.1), before the interactive layer
 * exists. Some are active (the player will interact with them later); some are retired or
 * deceased — foundational figures whose work shaped the field but who aren't active participants.
 */
export interface NPCScholarSeed {
	id: string;
	name: string;
	specialisation: FunctionTag[];
	cultureFocus: string[];

	/** Agent-generic: same interface as the player (doc 11 §2.6). */
	interpretiveModel: InterpretiveModel;

	sitePreference: SiteType[];
	careerStage: 'emeritus' | 'senior' | 'mid' | 'early';
	status: 'active' | 'retired' | 'deceased';
	publicationCount: number;
}

/**
 * One NPC excavation campaign simulated at world generation (doc 05 §4.1). Each NPC "excavated"
 * certain sites, biased by their interests and institutional access — a military historian digs
 * fortifications, not temples. The simulation is a low-fidelity sampling and synthesis pass over
 * world state, not a high-fidelity replay: sample artefacts biased by NPC site selection, filter
 * through NPC interpretive lenses, produce summary claims.
 */
export interface SimulatedExcavation {
	npcId: string;
	siteId: string;
	siteType: SiteType;
	cultureId: string;
	phaseId: string;
	artefactsSampled: number;
	materialDistribution: Map<string, number>;
	formDistribution: Map<string, number>;
	contextDistribution: Map<string, number>;
}
