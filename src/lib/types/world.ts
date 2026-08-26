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

import type { MaterialName, MaterialTag } from './tags.ts';
import type { DecorativeTechnique } from './decoration.ts';
import type { NameForm } from './language.ts';

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
 * `society.craftSpecialisation` raises the plausibility checker's part budget and the ceiling on
 * decorative recursion depth while `aesthetics.decorativeEmphasis` drives how much decoration
 * appears and the per-depth chance of a sublayer (doc 11 §2.10 and §2.22, roadmap 2GN.98/2GN.131),
 * high `aesthetics.formConservatism` narrows grammar branch variance.
 * Visibility: occluded (the player infers phase character from artefacts, never reads this).
 */
/**
 * Which craft-technology axis governs working a material (doc 05 §3.2, §7). Named here because two
 * types now key on it: `MaterialDefinition.craftDomain` (artefact.ts) and `VariantCondition`'s
 * material gate (description.ts).
 */
export type CraftDomain = keyof PhaseCharacteristics['technology'];

export interface PhaseCharacteristics {
	/** Craft technology maturity by domain, each 0–1. */
	technology: {
		/** Metalworking sophistication. Increases metal-compatible component probability. */
		metallurgy: number;

		/** Ceramic technology sophistication. */
		ceramics: number;

		/** Textile technology sophistication — spinning, weaving and fibre preparation. */
		textiles: number;

		/**
		 * Hide-working sophistication — tanning, curing, cutting and stamping (roadmap 2GN.100).
		 *
		 * Split from `textiles`, which had been carrying both. Weaving flax and tanning hide are
		 * different crafts with different prerequisites: a mobile pastoralist culture tans
		 * continuously because the herd yields hides as a by-product of subsistence, while flax is a
		 * settled-agriculture crop. Collapsing them meant a culture could not be excellent at one and
		 * indifferent to the other, which is the common real case rather than the exotic one.
		 */
		leatherWorking: number;

		/** Stone-working technology sophistication. */
		stoneWorking: number;

		/** Glass-working technology sophistication. */
		glassWorking: number;

		/** Wood-working technology sophistication. */
		woodWorking: number;

		/** Bone/antler-working technology sophistication. */
		boneWorking: number;
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
	/**
	 * What this culture makes of each material, as `MaterialSelector`-keyed weights (doc 05 §3.3,
	 * roadmap 2GN.110/2GN.123). Read by `culturalAffinityWeight` (`engine/generation/materials.ts`),
	 * which resolves it and is the only function that should.
	 *
	 * **Resolution is most-specific-wins**: a `{ id }` entry beats any `{ tag }` entry matching the
	 * same material, a `{ tag }` entry supplies the class default, and a material matched by neither
	 * reads a neutral `1`. So `{ tag: 'metal' }: 1.5` alongside `{ id: 'gold' }: 0.8` reads as "all
	 * metals are 1.5, except gold, which is 0.8" — the specific entry may **lower** as well as raise,
	 * which is precisely what the `max` reduction this replaced could not do (2GN.84 measured it
	 * discarding authored values one-directionally). A `{ id }` entry with no covering `{ tag }` entry
	 * is well-formed: that material departs from neutral and its classmates stay at `1`.
	 *
	 * An array rather than a `Map` because the key is an object: `Map` matches keys by reference, so
	 * `.get({ tag: 'metal' })` could never hit an entry authored as a different object literal.
	 *
	 * ⚠️ The **tag-versus-tag tie is explicitly unruled** (2GN.110 ruling point 6). No shipped material
	 * carries two `MaterialTag`s — `materials.test.ts` pins that — so a material matching two class
	 * entries is unreachable today, and authoring a tiebreak for a shape that does not exist is the
	 * mistake 2GN.87 punished.
	 *
	 * ⚠️ Not the same signal as `GrammarOption.culturalModifiers` (`types/grammar.ts`), despite the
	 * former JSDoc here implying so. That map stays tag-keyed and cannot consult a per-material entry
	 * **even in principle**: it weights grammar options at stage 4, and materials are not assigned
	 * until stage 6, so it never has a material in hand. A stage-ordering fact, not a divergence to
	 * reconcile later.
	 */
	materialAffinities: readonly MaterialAffinity[];

	/**
	 * Per-technique decorative preference, read by the decorative grammar
	 * (`engine/generation/decoration.ts`, roadmap 2GN.29). Provisional, not doc-specified — doc 05
	 * §3.3 names only `materialAffinities`/`motifVocabulary`/`craftInvestment`, but neither of those
	 * can express a culture's stable preference for *which techniques* it uses independent of what
	 * motifs it carries or what materials it works: a culture can favour engraving as a technique
	 * while never depicting beasts, or depict beasts exclusively through painting rather than
	 * engraving, and vice versa in every combination. This map is that missing signal. A technique
	 * absent from the map reads as neutral (`1`), the same convention `materialAffinities` uses for an
	 * unmatched material — though the two no longer share a shape, since techniques have no
	 * class-versus-specific axis to resolve and so stay a plain tag-keyed `Map`.
	 *
	 * Selection also enforces a one-directional material-access gate (`decoration.ts`): a culture
	 * that never favours-and-can-obtain a material satisfying a technique's substrate gets that
	 * technique suppressed near-zero regardless of this map's stated affinity — a culture cannot
	 * engrave what it has no engravable material for. The converse does not hold: favouring an
	 * engravable material never forces engraving to be used.
	 */
	techniqueAffinities: Map<DecorativeTechnique, number>;

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
 * One entry in a `MaterialFlow`'s `includes`/`excludes`, naming either a whole material class or a
 * single material (doc 05 §3.4, roadmap 2GN.112).
 *
 * The arms are tagged rather than a bare string because `bone`, `glass` and `leather` each name
 * *both* a `MaterialTag` and a `MaterialName`: `{ tag: 'bone' }` selects the class (bone and
 * antler), `{ id: 'bone' }` selects the material alone. A `MaterialTag | MaterialName` union could
 * not distinguish them, and resolving the collision by precedence would make three of sixteen
 * materials unselectable by one of their two readings.
 */
export type MaterialSelector =
	| { tag: MaterialTag; id?: never }
	| { id: MaterialName; tag?: never };

/**
 * One entry in a culture's `materialAffinities`: what that culture makes of the material or class
 * `selector` names (doc 05 §3.3, roadmap 2GN.110). `1` is neutral, above favours, below disfavours.
 *
 * See `CulturalProfile.materialAffinities` for the most-specific-wins resolution these entries carry,
 * and why they are an array rather than a `Map`.
 */
export interface MaterialAffinity {
	/** The material or class this weight applies to. */
	selector: MaterialSelector;

	/** Multiplicative weight; `1` is neutral. */
	weight: number;
}

/**
 * A directional flow of materials between the two cultures in a `CultureRelationship` (doc 05
 * §3.4). Part of `RelationshipDynamics.trade.materialFlow`. Visibility: occluded.
 *
 * **A flow supplies a material when some `includes` selector matches it and no `excludes` selector
 * does.** Union the includes, subtract the excludes; there is no precedence between the two field's
 * entries and no ordering within them, so one selector can be read without consulting its
 * neighbours.
 *
 * ⚠️ **Replaces the `materialTag` + `specificMaterials` pair (roadmap 2GN.112).** That shape had two
 * fields feeding one selector with the combining operator left unstated, and the implementation
 * (`flowSuppliesMaterial`) ORed them while this JSDoc claimed `specificMaterials` narrowed the tag —
 * so the list could only ever *widen* a flow and the three shipped flows re-keyed onto it by 2GN.78
 * silently reached the whole class. Neither reading could express "all metals except gold": the OR
 * had no subtraction, and narrowing could only enumerate the complement, freezing it against a
 * catalogue that later grows. `excludes` is what buys that case, and it is why the pair was not
 * simply replaced by an explicit material list.
 */
export interface MaterialFlow {
	/**
	 * What the flow carries: classes, specific materials, or a mix. An empty array supplies nothing
	 * (a flow that carries nothing is not a flow) rather than defaulting to everything.
	 */
	includes: MaterialSelector[];

	/**
	 * Materials removed from what `includes` selects — an embargoed material on an otherwise open
	 * route, a class the partner keeps back. Subtracting something `includes` never selected is
	 * redundant rather than an error, and a material matched by both is excluded.
	 */
	excludes?: MaterialSelector[];

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
		/**
		 * Site name, stored as the phonemes composing it rather than as display text (roadmap
		 * 2GN.66). `renderName` (`engine/world/naming.ts`) turns it into a string.
		 *
		 * ⚠️ Not a `string`, deliberately. A name held as segments can be re-rendered against a later
		 * phase's sound changes, so a site named early appears drifted in a late document — the fossil
		 * effect that makes an old toponym an interpretive puzzle rather than a label (Pillar 1, error
		 * is the engine). Storing display text would foreclose that permanently. The renderer is
		 * currently identity with respect to time, since no sound change exists yet.
		 */
		name: NameForm;

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
	materialId: MaterialName;

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
	materialAvailability: Map<MaterialName, RegionalAvailability>;
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
