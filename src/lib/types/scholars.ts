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
import type { NameForm } from './language.ts';
import type { ArtefactTag } from './tags.ts';
import type { SiteType } from './world.ts';

/**
 * How far along a scholar's career they are (doc 05 §4.1). Hoisted from the inline union on
 * `NPCScholarSeed.careerStage` so the vocabulary stays centralised, per the `DatingConfidence`
 * precedent (`world.ts`) — 2GN.48's cohort-generation draw is the reason a caller needs the
 * ordered member list, not just the type.
 *
 * ⚠️ Distinct from `AcademicRole` (`career.ts`), the player's rank ladder. The two axes are
 * unrelated and carry no mapping: an NPC's `careerStage` describes where they sit in the field's
 * own generation, not a position on the player's professional ladder.
 */
export type CareerStage = 'emeritus' | 'senior' | 'mid' | 'early';

/**
 * Whether an NPC scholar is available for the player to interact with (doc 05 §4.1). Hoisted
 * alongside `CareerStage` for the same reason.
 */
export type ScholarStatus = 'active' | 'retired' | 'deceased';

/**
 * An NPC scholar as the interactive layer sees them (doc 07 §5.1), sitting on top of the corpus
 * data generated at world creation.
 *
 * `specialism.methodologicalBias` is narrowed from doc 07's `string` (whose comment names the
 * three doc 07 §5.1 values) to the existing `MethodologicalBias` union per the register-narrowing
 * precedent (1FD.31), which also admits the authored `'generalist'` neutral member.
 *
 * ⚠️ `name` is a `NameForm`, not a `string` (roadmap 2GN.48, breaking, matching the
 * `Provenance.site.name` precedent set by 2GN.66) — render with `renderName`
 * (`engine/world/naming.ts`) at the display seam. Pre-emptive here: nothing constructs a
 * `MinimalScholar` yet, but the field is the same concept as `NPCScholarSeed.name` and the file
 * was already open for that migration.
 */
export interface MinimalScholar {
	id: string;
	name: NameForm;

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
 *
 * ⚠️ `name` is a `NameForm`, not a `string` (roadmap 2GN.48, breaking) — see `MinimalScholar`'s
 * JSDoc for the precedent. Generated via `generateScholarName(MODERN_PHONOLOGY, MODERN_LANGUAGE_ID,
 * prng)` (`data/names/modern.ts`, `engine/world/naming.ts`): scholars are the first thing named in
 * the curated modern tongue rather than a generated ancient one (roadmap 2GN.130).
 */
export interface NPCScholarSeed {
	id: string;
	name: NameForm;
	/**
	 * The tags this scholar's work concentrates on. Spans both scoring bases: "the funerary-vessel
	 * specialist" and "the weapons specialist" are equally ordinary academic identities, and a
	 * scholar built around a relative tag is the more interesting case, since their expertise is
	 * anchored to a culture-relative judgement they may be reading wrong.
	 *
	 * Drawn as a coherent set, not independent picks (roadmap 2GN.48 spike,
	 * `docs/spikes/2GN.48-scholar-cohort.md`): a seed tag by measured frequency, plus 1-2
	 * neighbours weighted by measured co-occurrence lift against that seed. `trade-good` and
	 * `currency` never appear — neither tag fires under any classification rule at MVP.
	 */
	specialisation: ArtefactTag[];
	cultureFocus: string[];

	/** Agent-generic: same interface as the player (doc 11 §2.6). */
	interpretiveModel: InterpretiveModel;

	/**
	 * Which site types this scholar prefers to excavate (doc 05 §4.1: an NPC bias from "interests
	 * and institutional access", not a property of the culture they study). Correlated with
	 * `specialisation` via a hand-authored affinity table (roadmap 2GN.48 spike) — a design claim
	 * about what archaeologists dig, not something to mine from generated artefacts the way
	 * `specialisation`'s coherence is.
	 */
	sitePreference: SiteType[];

	/**
	 * Dealt as a cohort spread, not drawn independently per scholar (roadmap 2GN.48 spike):
	 * one senior-or-emeritus anchor grounds the corpus, one early-or-mid scholar is guaranteed
	 * active for the player to meet, the remainder draw freely. `status` and `publicationCount`
	 * derive from this rather than rolling independently.
	 */
	careerStage: CareerStage;
	status: ScholarStatus;
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
