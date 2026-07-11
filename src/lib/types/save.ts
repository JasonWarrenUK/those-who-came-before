/**
 * Save-file schema type definitions (doc 08 §4.1–§4.2, doc 12 §2.14).
 *
 * This module is the canonical home of `SaveFile` and `CURRENT_SAVE_VERSION` (roadmap 1FD.33);
 * `persistence/schema.ts` (8PS.4) re-exports them rather than redefining them. A save persists
 * exactly three state slices — the objective world, the player's interpretive model (with its
 * contradiction queue nested inside) and the term calendar (doc 12 §2.14). `lensState` is
 * deliberately absent: it is derived state, recomputed from `playerInterpretation` on load
 * (doc 08 §4.1). UI state is transient and never saved.
 *
 * The serialisation rule (doc 08 §4.2) is that Maps don't serialise to JSON, so every `Map<K, V>`
 * in the persisted state becomes a `[K, V][]` entry-pair array. `Serialised<T>` encodes that rule
 * once at the type level; the value-level transform (`serialiseMap`/`deserialiseMap` and the full
 * `serialiseGameState`/`deserialiseGameState` pair) lands at 8PS.1–8PS.3.
 *
 * This module is data shapes plus the schema-version constant, no behaviour.
 */

import type { ClassifiedArtefact } from './artefact.ts';
import type { DisseminationCareerEffect, PeerReviewCareerEvent } from './career.ts';
import type { ProfessionalCorpus } from './corpus.ts';
import type { DerivationEvent, DocumentNode } from './documents.ts';
import type { InterpretiveModel } from './interpretation.ts';
import type { MinimalScholar } from './scholars.ts';
import type { TermState } from './term.ts';
import type { VenueDefinition } from './venues.ts';
import type { Culture, DatingFramework, GeologicalContext, WorldChronology } from './world.ts';

/**
 * The single canonical type-level encoding of doc 08 §4.2's serialisation rule: every
 * `Map<K, V>` in the persisted state becomes a `[K, V][]` entry-pair array, recursively. The
 * rule is doc-specified; this type-level encoding of it is authored (the doc gives only the
 * value-level `serialiseMap`/`deserialiseMap` sketch, owned by 8PS.1, whose round-trip tests
 * will exercise this type against real data).
 *
 * Branch notes, in match order:
 * - Maps convert before anything else (a `Map` is also an `object`).
 * - Functions map to `never` deliberately, so non-serialisable state (e.g. `WorldSeed.prng`,
 *   a live closure — world.ts) is a loud compile error at 8PS.2 rather than a silent `{}`.
 * - The `readonly unknown[]` branch is homomorphic, preserving tuple arity
 *   (`AcademicYear.terms`, `CultureRelationship.cultureIds`, `LayerDating.estimatedRange`).
 * - The object branch tests `T extends object`, not `Record<string, unknown>` — interfaces
 *   have no implicit index signature and would silently fall through to pass-through,
 *   leaving their Maps unconverted. Homomorphic mapping preserves optionality and readonly.
 * - Naked-`T` conditionals distribute over unions, so discriminated unions
 *   (`Contradiction`, `DisseminationDetails`, …) map member-by-member and their
 *   discriminants survive.
 *
 * All Map keys in persisted state are strings or string-literal unions, so the JSON round
 * trip needs no key coercion (relevant to 8PS.1).
 *
 * Exported for the persistence layer: 8PS.2 types per-entity intermediates with it, and once
 * the runtime `WorldState` aggregate exists (3WS.9) `SerialisedWorldState` below can be
 * redefined as `Serialised<WorldState>` and compile-checked against consumers.
 */
export type Serialised<T> = T extends Map<infer K, infer V> ? [Serialised<K>, Serialised<V>][]
	: T extends (...args: never[]) => unknown ? never
	: T extends readonly unknown[] ? { [I in keyof T]: Serialised<T[I]> }
	: T extends object ? { [P in keyof T]: Serialised<T[P]> }
	: T;

/**
 * JSON-safe mirror of `InterpretiveModel` (interpretation.ts, doc 08 §3.2) under the doc 08
 * §4.2 rule. What changes: the five Maps — `culturalClaims`, `artefactClaims`,
 * `chronologicalClaims`, `agentAssessments`, `strainScores` — become entry-pair arrays. What
 * passes through unchanged: `agentId`, `methodologicalWeights` and `contradictionQueue`
 * (already array-based, doc 06 §4.4) — the queue serialises *inside* this type per doc 08
 * §4.1's inline comment and doc 12 §2.14.
 *
 * A type alias rather than an interface, deviating from the interfaces-first convention:
 * this is a derived type, kept in lockstep with its source by construction — a hand-mirrored
 * interface would drift silently whenever `InterpretiveModel` changes.
 */
export type SerialisedInterpretiveModel = Serialised<InterpretiveModel>;

/**
 * JSON-safe mirror of `TermState` (term.ts, doc 08 §3.6). `TermState` contains no Maps, so
 * this currently resolves structurally identical to its source. Kept as `Serialised<TermState>`
 * rather than `= TermState` so a future Map-bearing field serialises correctly without
 * touching this file. Type alias for the same derived-type reason as
 * `SerialisedInterpretiveModel`.
 */
export type SerialisedTermState = Serialised<TermState>;

/**
 * PROVISIONAL — JSON-safe projection of the objective world: everything that concretely
 * exists, per doc 08 §3.1/§3.3. No runtime `WorldState` aggregate exists yet (it lands at
 * 3WS.9/3WS.10), so this interface is authored against doc 08 §3.3's field-name tree rather
 * than mirroring a source type; it firms up there and at 8PS.2 (`serialiseGameState`), at
 * which point it may be redefined as `Serialised<WorldState>` and diffed against this shape.
 *
 * Deviations from the §3.3 tree, each noted on its field: `sites` → `datingFrameworks`,
 * `lineageGraph` → `lineageEvents`, plus three authored additions the tree omits but the
 * world demonstrably needs saved (`cultures`, `geology`, `corpus`) — a v1 schema that
 * knowably cannot hold the world would force an immediate version bump before the save
 * system ships.
 *
 * Known omissions, deliberately not typed here:
 * - Player `CareerState`/`Reputation` placement: doc 08 §3.3 calls reputation a computed
 *   property of the player's scholar entity, but `MinimalScholar` carries neither — where
 *   they live is 3WS.10's open question.
 * - PRNG draw position: `SaveFile.seed` restores the generator but not how far it has been
 *   advanced; whether 8PS.2 persists a draw count or regenerates deterministically is that
 *   task's decision (cf. the `WorldSeed` serialisability note in world.ts).
 * - `SimulatedExcavation` records: generation intermediates — whether they persist at all
 *   is decided at 2GN.50–2GN.55/8PS.2.
 */
export interface SerialisedWorldState {
	/**
	 * Periods and per-culture timelines (doc 08 §3.3 "chronology"; world.ts). Currently
	 * Map-free, so this passes through unchanged — routed via `Serialised` for drift-proofing.
	 */
	chronology: Serialised<WorldChronology>;

	/**
	 * Authored addition, not in doc 08 §3.3's tree: the tree's chronology line says "Periods,
	 * cultures" but `WorldChronology` holds only timelines — the Map-bearing `Culture`
	 * profiles (`baseProfile.materialAffinities`, `craftInvestment.contextWeights`/
	 * `.siteTypeWeights`) live nowhere else. Firms up at 3WS.3/3WS.9.
	 */
	cultures: Serialised<Culture>[];

	/**
	 * Generated artefacts with occluded ground truth (doc 08 §3.3). Converts each artefact's
	 * `components[].properties` and `groundTruthTags` Maps.
	 */
	artefacts: Serialised<ClassifiedArtefact>[];

	/**
	 * Covers doc 08 §3.3's "sites" line: no standalone Site entity exists — site data lives
	 * inline on each artefact's `Provenance.site` (world.ts), and `DatingFramework`
	 * (doc 05 §4.7) is the only independent site-level state. Renames if 3WS.10 creates a
	 * Site entity.
	 */
	datingFrameworks: Serialised<DatingFramework>[];

	/**
	 * Player + NPC scholar entities (doc 08 §3.3). Each embeds a full Map-heavy
	 * `InterpretiveModel` (doc 08 §3.3 "[each].model"), serialised recursively.
	 */
	scholars: Serialised<MinimalScholar>[];

	/**
	 * All document nodes, player and NPC (doc 08 §3.3, doc 10). Converts each node's
	 * `commitmentStrength` Map.
	 */
	documents: Serialised<DocumentNode>[];

	/**
	 * Covers doc 08 §3.3's "lineageGraph" line: the graph's edges are recoverable from
	 * `DocumentNode.lineage`, but `DerivationEvent` (doc 10 §2.5) additionally records
	 * modified/dropped commitments that are not recoverable from the nodes alone.
	 */
	lineageEvents: Serialised<DerivationEvent>[];

	/** Publication venues with structural properties (doc 08 §3.3, doc 07 §3.1). Map-free. */
	venues: Serialised<VenueDefinition>[];

	/**
	 * Record of things that happened — reviews, publications (doc 08 §3.3). Union per the
	 * doc 08 §3.5/§5 orchestrator usage (`addCareerEvent` receives both shapes); both are
	 * Map-free. A named `CareerEvent` union may later hoist to career.ts (3WS.10/9CR.x).
	 */
	careerEvents: Serialised<DisseminationCareerEffect | PeerReviewCareerEvent>[];

	/**
	 * Authored addition, not in doc 08 §3.3's tree: geological ground truth, generated once
	 * (3WS.7) and consulted by material-provenance contradiction detection (doc 06 §4.2).
	 * Exercises the nested Map-of-Maps case (`materialAvailability` → `regions`).
	 */
	geology: Serialised<GeologicalContext>;

	/**
	 * Authored addition, not in doc 08 §3.3's tree: what the field "knows" at game start
	 * (doc 05 §4.3), the contradiction detector's second comparison source alongside the
	 * world's occluded properties (doc 06 §4.3).
	 */
	corpus: Serialised<ProfessionalCorpus>;
}

/**
 * The complete on-disk save shape, written to and read from IndexedDB (doc 08 §4.1,
 * transcribed verbatim). Persists exactly three state slices per doc 12 §2.14; `lensState`
 * is NOT persisted — it is recomputed from `playerInterpretation` on load.
 */
export interface SaveFile {
	/**
	 * Schema version for migration (doc 08 §4.4): loads below `CURRENT_SAVE_VERSION` run
	 * sequentially through the 8PS.5 migration chain.
	 */
	version: number;

	/** When the save was written, as an ISO-8601 string. */
	savedAt: string;

	/**
	 * The raw world seed string (doc 05 §2). Restores the generator but not its draw
	 * position — whether 8PS.2 persists a draw count or regenerates deterministically is
	 * that task's decision (cf. the `WorldSeed` note in world.ts).
	 */
	seed: string;

	/** Everything that concretely exists (doc 08 §3.1). */
	worldState: SerialisedWorldState;

	/** The player's epistemic model, with its contradiction queue nested inside (doc 12 §2.14). */
	playerInterpretation: SerialisedInterpretiveModel;

	/** Calendar position + energy budget (doc 08 §3.6, doc 11 §2.8). */
	termState: SerialisedTermState;

	/**
	 * Display metadata for save-slot listings (doc 08 §4.1, inline per the doc; 8PS.4's
	 * "add save metadata shape" may hoist it later).
	 */
	metadata: {
		/** Total play time in seconds. */
		playTime: number;

		artefactsExamined: number;

		claimsFormed: number;

		/** Document nodes at published state or beyond (doc 08 §4.1). */
		documentsPublished: number;

		contradictionsResolved: number;
	};
}

/**
 * The schema version new saves are written at (doc 08 §4.1). Bump whenever a persisted shape
 * changes, and add the matching entry to the 8PS.5 migration chain.
 */
export const CURRENT_SAVE_VERSION = 1;
