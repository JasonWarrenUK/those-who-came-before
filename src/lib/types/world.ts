/**
 * World-generation type definitions: seed, chronology, culture, inter-culture relationships and
 * site provenance (doc 05 §2, §3.1–§3.6). These describe the `WorldState`'s occluded generative
 * substrate — the player never reads a `Culture` or a `WorldChronology` directly, but must infer
 * their structure from observable artefact properties (doc 05 §3). This module is data shapes
 * only, no behaviour; chronology and culture generation itself lives under `engine/world/`
 * (roadmap 2GN.*, 3WS.*).
 *
 * Visibility (doc 05 §1.1) is expressed in prose JSDoc per field for now; roadmap 1FD.32 will add
 * a `PropertyVisibility` enum (`observable` | `inferable` | `occluded` | `engine-internal`) that
 * these annotations will migrate onto, per the convention set in artefact.ts.
 */

import type { MaterialTag } from './tags.ts';

/**
 * Stage 1 of the generation pipeline (doc 05 §2): a single seed string deterministically generates
 * all downstream content. Same seed produces the same *sequence* of artefacts — artefact N may
 * depend on artefacts 1 through N-1 (associated finds, site reuse, material precedent), so the
 * guarantee is over the sequence, not each artefact in isolation.
 *
 * Not serialisable as-is: `prng` is a live closure over generator state, not data. Persisting and
 * restoring world state across sessions is a save-system concern (types at `src/lib/types/save.ts`
 * per roadmap 1FD.33, behaviour at `persistence/`, 8PS.x), not this task's problem — whatever that
 * system does, it won't be storing this closure verbatim (`Serialised<T>` maps functions to
 * `never` for exactly this reason).
 */
export interface WorldSeed {
	/** The raw seed string as entered or generated. */
	raw: string;

	/** Seeded, deterministic PRNG (xoshiro128**) derived from `raw` (doc 05 §2). */
	prng: () => number;
}

/**
 * Multi-attribute description of a cultural phase (doc 05 §3.2) — four independent axis groups
 * rather than a single float, so a culture can be exceptional metalworkers with crude ceramics.
 * These attributes feed grammar expansion and the decorative layer as weight modifiers: high
 * `technology.metallurgy` increases metal-compatible component probability, high
 * `society.craftSpecialisation` raises the plausibility checker's part budget and the decorative
 * grammar's recursion cap, high `aesthetics.formConservatism` narrows grammar branch variance.
 * Visibility: occluded (the player infers phase character from artefacts, never reads this).
 */
export interface PhaseCharacteristics {
	/** Craft technology maturity by domain, each 0–1. */
	technology: {
		/** Metalworking sophistication. Increases metal-compatible component probability. */
		metallurgy: number;

		/** Ceramic technology sophistication. */
		ceramics: number;

		/** Textile technology sophistication. */
		textiles: number;

		/** Stone-working technology sophistication. */
		stoneWorking: number;

		/** Glass-working technology sophistication. */
		glassWorking: number;

		/** Wood-working technology sophistication. */
		woodWorking: number;
	};

	/** Economic structure, each 0–1. */
	economy: {
		/** Openness to foreign trade. Affects foreign material availability. */
		tradeOpenness: number;

		/** Economic surplus. Affects craft specialisation capacity. */
		surplus: number;

		/** Degree of urbanisation. Affects artefact density and diversity. */
		urbanisation: number;
	};

	/** Social structure, each 0–1. */
	society: {
		/** Social stratification. Affects elite/utilitarian distribution. */
		stratification: number;

		/** Degree of militarisation. Affects weapon-adjacent forms. */
		militarisation: number;

		/** Religious emphasis. Affects ritual-adjacent forms. */
		religiousEmphasis: number;

		/** Craft specialisation. Affects part count and complexity budgets. */
		craftSpecialisation: number;
	};

	/** Aesthetic tendencies, each 0–1. */
	aesthetics: {
		/** Emphasis on decoration. Affects decorative component budgets. */
		decorativeEmphasis: number;

		/** Complexity of motif work. Affects engraving/inlay sophistication. */
		motifComplexity: number;

		/** Formal conservatism. High values mean less variation between artefacts. */
		formConservatism: number;
	};
}

/**
 * One named period within a single culture's own periodisation (doc 05 §3.1). There is no
 * monolithic world timeline with shared periods; each culture's phases are its own, and overlaps
 * with other cultures' phases are temporal coincidence the player must work out, not a shared
 * label. Visibility: occluded.
 */
export interface CulturePhase {
	/** Stable phase id, referenced by `Provenance.phaseId`. */
	id: string;

	/** Human-readable phase name (e.g. 'Expansion', 'Settlement', 'Fragmentation'). */
	label: string;

	/** First year of the phase. */
	startYear: number;

	/** Last year of the phase. */
	endYear: number;

	/** The phase's multi-attribute profile (doc 05 §3.2). */
	characteristics: PhaseCharacteristics;
}

/**
 * A single culture's full periodisation (doc 05 §3.1) — an ordered sequence of `CulturePhase`
 * entries. Referenced by `WorldChronology.cultureTimelines` and by `Culture.timeline`.
 * Visibility: occluded.
 */
export interface CultureTimeline {
	/** Id of the culture this timeline belongs to. */
	cultureId: string;

	/** The culture's phases, in chronological order. */
	phases: CulturePhase[];
}

/**
 * Provisional, not doc-specified: the docs name `CulturalProfile.motifVocabulary`'s type and
 * describe its role in prose (doc 05 §8.5 — motifs are the primary cultural fingerprint on the
 * decorative layer, drawn from the source culture's motif vocabulary) but never give it a shape.
 * This is the minimal shape that lets a `DecorativeLayer.motifRef` (`decoration.ts`) name one of
 * these entries by `id`. Expect this to firm up when the decorative grammar engine lands.
 */
export interface MotifDefinition {
	/** Stable id, referenced by `DecorativeLayer.motifRef` (`decoration.ts`) by value. */
	id: string;

	/** Human-readable motif name. */
	label: string;

	/** Id of the culture this motif originates from — supports borrowed-motif tracking (§8.5). */
	culturalOrigin: string;
}

/**
 * Provisional, not doc-specified: see `MotifDefinition`. A culture's full motif vocabulary, drawn
 * from when assigning decoration (doc 05 §8.5).
 */
export interface MotifSet {
	/** The motifs available to draw from. */
	motifs: MotifDefinition[];
}

/**
 * Where a culture channels its crafting energy (doc 05 §3.3) — not "make X% weapons", more "invest
 * heavily in funerary goods". Biases production frequency, making some artefact contexts more
 * common and others relatively rarer (doc 05 §10.2: semi-prescribed, a weight rather than a quota;
 * actual production frequency emerges from the grammar running against these weights).
 * Visibility: occluded.
 */
export interface CraftInvestmentProfile {
	/** Weight per deposition context (e.g. heavy investment in `'burial-goods'`). */
	contextWeights: Map<DepositionType, number>;

	/** Weight per site type the culture tends to produce for. */
	siteTypeWeights: Map<SiteType, number>;
}

/**
 * A culture's stable material and craft tendencies (doc 05 §3.3), persisting across phases — a
 * culture might always favour stone (`materialAffinities`) while its stone-working capability
 * (`PhaseCharacteristics.technology.stoneWorking`) varies by phase. Visibility: occluded.
 *
 * Naming collision: doc 06 §3.3 defines an UNRELATED, differently-shaped type also called
 * `CulturalProfile` — a player working-document with `cultureLabel`, `materialPreferences` and
 * `functionalEmphasis` fields, part of the player's interpretive model, not world generation. This
 * `world.ts` version is doc 05's world-generation profile. Do not confuse the two; they share a
 * name across files but nothing else.
 */
export interface CulturalProfile {
	/** Per-material-tag affinity weight, read by `GrammarOption.culturalModifiers` (grammar.ts). */
	materialAffinities: Map<MaterialTag, number>;

	/** The culture's decorative motif vocabulary (doc 05 §3.3, §8.5). */
	motifVocabulary: MotifSet;

	/** Where the culture channels its crafting energy (doc 05 §3.3). */
	craftInvestment: CraftInvestmentProfile;
}

/**
 * A generated culture (doc 05 §3.3): its stable profile plus its phase-by-phase periodisation.
 * Visibility: occluded.
 */
export interface Culture {
	/** Stable culture id, referenced by `CultureTimeline.cultureId` and `Provenance.cultureId`. */
	id: string;

	/** Human-readable culture name. */
	label: string;

	/** Stable tendencies that persist across phases (doc 05 §3.3). */
	baseProfile: CulturalProfile;

	/** The culture's periodisation (doc 05 §3.1). */
	timeline: CultureTimeline;
}

/**
 * A directional flow of a material tag between the two cultures in a `CultureRelationship` (doc 05
 * §3.4). Part of `RelationshipDynamics.trade.materialFlow`. Visibility: occluded.
 */
export interface MaterialFlow {
	/** The material tag flowing between cultures. */
	materialTag: MaterialTag;

	/** Optional specific material ids, when the flow is narrower than the whole tag. */
	specificMaterials?: string[];

	/** Which culture the material flows from and to, keyed against `CultureRelationship.cultureIds`. */
	direction:
		| 'a-to-b'
		| 'b-to-a'
		| 'bidirectional';

	/** Volume of the flow, 0–1. */
	volume: number;
}

/**
 * The full multi-axis character of a relationship between two cultures during one
 * `RelationshipPhase` (doc 05 §3.4). Trade, conflict, cultural exchange and political status are
 * independent axes that can co-occur — a relationship can simultaneously involve trade in
 * materials and low-level raiding. The player seeing Culture A artefacts with Culture B materials
 * can't simply conclude "they traded"; the relationship data supports multiple explanations at
 * once. Visibility: occluded.
 */
export interface RelationshipDynamics {
	/** Trade axis. */
	trade: {
		/** Trade volume, 0–1. */
		volume: number;

		/** Which materials flow, and in which direction (doc 05 §3.4). */
		materialFlow: MaterialFlow[];

		/** Whether trade is roughly even or skewed towards one culture. */
		directionality: 'balanced' | 'asymmetric';

		/** Which culture dominates the trade, when `directionality` is `'asymmetric'`. */
		dominantCulture?: string;
	};

	/** Conflict axis. */
	conflict: {
		/** Conflict intensity, 0–1. */
		intensity: number;

		/** The nature of the conflict, or `'none'` when the cultures are not in conflict. */
		type: 'raiding' | 'territorial' | 'conquest' | 'none';
	};

	/** Cultural exchange axis (motifs, techniques, materials, forms crossing between cultures). */
	culturalExchange: {
		/** Exchange intensity, 0–1. */
		intensity: number;

		/** Which domains are being exchanged. */
		domains: ('motifs' | 'techniques' | 'materials' | 'forms')[];
	};

	/** Political axis. */
	political: {
		/** The nature of the political relationship. */
		type: 'independent' | 'tributary' | 'alliance' | 'vassal' | 'colonial';

		/** Which culture dominates politically, when the type implies asymmetry. */
		dominantCulture?: string;
	};
}

/**
 * One temporal window of a `CultureRelationship` (doc 05 §3.4) — relationships are temporal
 * ranges, not static attributes; two cultures can trade in one window and fight in another.
 * Visibility: occluded.
 */
export interface RelationshipPhase {
	/** First year this dynamic holds. */
	startYear: number;

	/** Last year this dynamic holds. */
	endYear: number;

	/** The relationship's character during this window (doc 05 §3.4). */
	dynamics: RelationshipDynamics;
}

/**
 * The full temporal relationship history between two cultures (doc 05 §3.4). Referenced by
 * `WorldChronology.relationships`. Visibility: occluded.
 */
export interface CultureRelationship {
	/** The two cultures in this relationship, order matching `RelationshipDynamics` "a"/"b" axes. */
	cultureIds: [string, string];

	/** The relationship's phases, in chronological order. */
	phases: RelationshipPhase[];
}

/**
 * The culture-relative chronology for the whole generated world (doc 05 §3.1) — there is no
 * monolithic shared timeline; each culture has its own periodisation, and interactions between
 * cultures are defined by temporal overlap, not shared phase labels. `presentYear` anchors the
 * chronology to the player's working moment: the difference between `presentYear` and an
 * artefact's provenance `year` is its true age, but this is hidden from the player (absolute
 * dating is not free information, doc 05 §4.7). Visibility: occluded.
 */
export interface WorldChronology {
	/** Earliest point in the timeline across all cultures. */
	startYear: number;

	/** Latest point in the timeline (last cultural activity). */
	endYear: number;

	/** "Now" — the year the player is working. */
	presentYear: number;

	/** Every culture's own periodisation. */
	cultureTimelines: CultureTimeline[];

	/** Every pairwise inter-culture relationship generated for this world. */
	relationships: CultureRelationship[];
}

/**
 * The eleven kinds of location an artefact may be excavated from (doc 05 §3.5). Referenced by
 * `Provenance.site.type` and by `CraftInvestmentProfile.siteTypeWeights`. Visibility: observable
 * (the excavation context is directly known to the player).
 */
export type SiteType =
	| 'settlement'
	| 'burial'
	| 'workshop'
	| 'midden'
	| 'shrine'
	| 'cache'
	| 'shipwreck'
	| 'battlefield'
	| 'market'
	| 'fortification'
	| 'quarry';

/**
 * How well an artefact survived to excavation (doc 05 §3.5). Referenced by `Provenance.context.
 * condition`. Visibility: observable.
 */
export type PreservationState =
	| 'excellent'
	| 'good'
	| 'fair'
	| 'poor'
	| 'fragmentary';

/**
 * How an artefact came to be deposited (doc 05 §3.5) — critical for interpretation. A blade in a
 * `'deliberate-placement'` context within a shrine site reads very differently from the same blade
 * in a `'casual-discard'` context within a settlement, even though the physical object is
 * identical. Referenced by `Provenance.context.deposition` and by `CraftInvestmentProfile.
 * contextWeights`. Visibility: observable (the deposition context is recorded at excavation), but
 * its interpretive significance is inferable.
 */
export type DepositionType =
	| 'deliberate-placement'
	| 'casual-discard'
	| 'destruction'
	| 'burial-goods'
	| 'foundation-deposit'
	| 'hoard'
	| 'loss'
	| 'abandonment'
	| 'unknown';

/**
 * Chronological, cultural, site and depositional context for a single artefact (doc 05 §3.5). The
 * `site` and `context` groups are kept inline, matching the doc's own code block (see
 * `NormalisedComponent.arrangementGroup` in artefact.ts for the same inline-nesting precedent).
 * Visibility: occluded — the player must infer culture, phase and dating from artefact properties;
 * this is the ground truth the engine checks claims against.
 *
 * Distinct from `MaterialProvenance` in artefact.ts: that type describes where an assigned
 * material's raw source likely came from (local/regional/trade/unknown). This `Provenance`
 * describes the artefact's own site, chronology and deposition context — a different axis
 * entirely, and the two are not to be conflated despite the similar name.
 */
export interface Provenance {
	/** Id of the culture that produced the artefact. */
	cultureId: string;

	/** Id of the `CulturePhase` the artefact was produced within. */
	phaseId: string;

	/** The year the artefact was deposited. */
	year: number;

	/** The excavation site. Kept inline per doc 05 §3.5. */
	site: {
		/** Site name. */
		name: string;

		/** Kind of site. */
		type: SiteType;

		/** Broad geographic region the site sits within. */
		region: string;
	};

	/** The deposition context. Kept inline per doc 05 §3.5. */
	context: {
		/** Stratigraphic layer identifier. */
		layer: string;

		/** Ids of other artefacts recovered in direct association with this one. */
		associatedFinds: string[];

		/** How well the artefact survived to excavation. */
		condition: PreservationState;

		/** How the artefact came to be deposited (doc 05 §3.5). */
		deposition: DepositionType;
	};
}

/**
 * How available a material is within a region, before cultural preference applies (doc 05 §3.6).
 * A culture can want gold all it likes; if there's no gold source within trade range, it doesn't
 * get gold unless it trades for it. Visibility: occluded (world-generation constraint, never
 * exposed directly to the player).
 */
export type AvailabilityLevel =
	| 'abundant' // Local source, no constraints
	| 'available' // Present but not unlimited
	| 'scarce' // Limited deposits, competes with other uses
	| 'trade-only' // Not locally available, requires trade
	| 'absent'; // Not available even through trade at current relationships

/**
 * One material's availability across every region of the world (doc 05 §3.6). A culture can
 * *want* gold all it likes; if there's no gold source within trade range, it doesn't get gold
 * unless it trades for it. Visibility: occluded.
 */
export interface RegionalAvailability {
	/** Id of the material this availability map describes. */
	materialId: string;

	/** Availability level keyed by region name. */
	regions: Map<string, AvailabilityLevel>;
}

/**
 * World-level geological material scarcity (doc 05 §3.6), constraining cultural material
 * preferences before they apply. Obsidian comes from volcanic geology; gold is geologically rare;
 * tin for bronze requires specific deposits. Prescribed once at world generation and doesn't
 * change (doc 05 §10.1). Visibility: occluded.
 */
export interface GeologicalContext {
	/** Availability keyed by material id. */
	materialAvailability: Map<string, RegionalAvailability>;
}

/**
 * How a layer's estimated date range was derived (doc 05 §4.7). The first two are inference from
 * context; the last three are scientific analyses the player can commission once career-gated
 * access allows (they take time, may consume part of the artefact and carry error margins).
 */
export type DatingMethod =
	| 'stratigraphic-inference' // Relative position + anchored layers
	| 'typological-comparison' // Compared to dated artefacts elsewhere
	| 'radiocarbon' // C14 (requires organic material)
	| 'dendrochronology' // Tree rings (requires preserved wood)
	| 'thermoluminescence'; // TL (requires fired ceramics)

/**
 * How settled a site's dating framework is within the professional corpus (doc 05 §4.7). Hoisted
 * from the doc's inline union on `DatingFramework.confidence` so the vocabulary stays centralised
 * (the `ClaimStatus` precedent in interpretation.ts) — description presentation (roadmap 1FD.31)
 * is the second consumer.
 */
export type DatingConfidence =
	| 'well-established'
	| 'provisional'
	| 'contested';

/**
 * The corpus's dated estimate for one stratigraphic layer (doc 05 §4.7). This is an NPC claim
 * about the world, not ground truth: the true deposition year lives on `Provenance.year`
 * (occluded), and `estimatedRange` may fail to contain it when the original dating was flawed or
 * extrapolated beyond its evidence base.
 */
export interface LayerDating {
	/** Stratigraphic layer identifier, matching `Provenance.context.layer`. */
	layerId: string;

	/** Estimated absolute year range for the layer. */
	estimatedRange: [number, number];

	/** How the range was derived. */
	method: DatingMethod;

	/** Years of uncertainty either side of the range. */
	errorMargin: number;
}

/**
 * An approximate chronological framework for a well-studied site, established by NPC dating work
 * (doc 05 §4.7). Presented as established fact in the reference literature — and possibly wrong.
 * Visibility: observable via the corpus, but observable-as-claim: an artefact's true age is
 * `WorldChronology.presentYear - Provenance.year` and stays hidden; the player earns absolute
 * dates through frameworks like this or by commissioning independent dating. Overturning a
 * framework is a high-magnitude, high-scrutiny claim (doc 05 §4.6).
 */
export interface DatingFramework {
	/** Site this framework covers (`Provenance.site`). */
	siteId: string;

	/** Per-layer dated estimates. */
	layers: LayerDating[];

	/** Ids of the NPC publications that established the framework. */
	establishedBy: string[];

	/** How settled the framework is in the literature. */
	confidence: DatingConfidence;
}
