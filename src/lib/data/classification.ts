/**
 * MVP classification rules (doc 05 §9.2, roadmap 2GN.17).
 *
 * Feature→tag scoring rules, derived from first principles against the signals the grammar
 * (`data/grammars/primitives.ts`) actually produces, rather than transcribed from doc 05 §9.2's
 * illustrative examples — the engine's primitive/parameter vocabulary has grown well past what
 * that section shows. Every `condition` below reads a field of `ExtractedFeatures` traceable to a
 * real primitive parameter (an `elongated.edge`, a `ring-form.gap`, a `hollow-enclosed.opening`
 * band, and so on) or a real decorative-layer fact (technique identity, layer count). Two families
 * are the exception, and are marked dormant: `preciousMaterialsInDecoration` and
 * `motifCulturalOrigins` have no producer yet — decorative material/motif assignment (roadmap
 * 2GN.33) has landed and populates `DecorativeLayer.motifRef`/`.material`, but the
 * `preciousMaterialsInDecoration`/`motifCulturalOrigins` lookups consuming that data into
 * `ExtractedFeatures` are roadmap 2GN.68's — so those two rules are authored now but fire on no
 * artefact the current pipeline can generate until 2GN.68 lands.
 *
 * **Mechanical-vs-classificatory boundary** (doc 12 propagation register): no rule below reads
 * `portability` or `inspectionDepth` — both are mechanical derivations governing player
 * handling/inspection (doc 05 §5.2), not classificatory facts. Rules use the physical `massBand`
 * and `sizeBand` instead, which derive independently from the same dimensions. See
 * `classification.test.ts`'s boundary guard, which fails if a rule starts reading either field.
 *
 * Weights follow doc 05 §9.2's 0.2–0.8 scale and are MVP-provisional, expected to be retuned once
 * observable in the Explorer tag inspector (roadmap 2GN.59). Tags are deliberately overlapping —
 * `classifyArtefact` (roadmap 2GN.20) is the consumer that folds every matching rule's `tags` map
 * into one accumulated `Map<ArtefactTag, number>`; this module is static data only, no behaviour.
 *
 * Not every `ArtefactTag` is reached at MVP — `currency` has no grammar signal to key on yet and is
 * deliberately absent rather than force-fitted.
 *
 * **Decoration thresholds are measured, not transcribed** (roadmap 2GN.34, doc 12 §2.24). Doc 05
 * §9.2's illustrative `decorativeComplexity > 2`/`> 1` constants, and this file's own original
 * `decorativeLayerCount >= 3`/`>= 2`/`>= 1` decoration-family thresholds, were authored before any
 * decoration pipeline existed to measure against. Once 2GN.29/2GN.33 landed, sampling 1200 real
 * pipeline artefacts across three `decorativeEmphasis` settings showed those thresholds fire on
 * 87–99% of artefacts — under `classifyArtefact`'s plain-sum unbounded fold (doc 12 §2.21), a rule
 * firing that often adds a near-constant to every score rather than discriminating elite objects
 * from ordinary ones. The decoration-family thresholds below are pinned to measured percentiles of
 * that sample instead (`decorativeLayerCount` p50 6/p75 10/p90 13, `decorativeComplexity` p50
 * 11.2/p75 16.3/p90 22.3, `techniqueComplexity` p90 9, `decorativeComplexity / partCount` p75 4.05);
 * see doc 12 §2.24 for the full distribution table and rationale.
 *
 * **Re-measured against modelled geology** (roadmap 2GN.79, doc 12 §2.25). The 2GN.34 sample above
 * ran against `mockGeologicalContext`, which models only 4 of the catalogue's 16 materials, so the
 * other twelve passed `isAvailable`'s "unmodelled → obtainable" lenience at full weight — silver
 * came out the second most common material and jade outranked gold. Re-sampling 7200 artefacts
 * across six named regional worlds that model every material (`tests/fixtures/world.ts`) corrected
 * the material distribution but left `elite` almost untouched (89.8% presence, 89.2–90.8% in every
 * world), proving it was never material-driven. Two rules were retuned as a result, both for
 * intent-behaviour divergence: the applied-element rule (a saturating boolean replaced by
 * `appliedElementCount >= 4`) and the structural-complexity rule (`attachmentDiversity >= 3`, its
 * inert `partCount` clause dropped). The any-decoration nudge stays universal by design, as §2.24
 * ruled — its 98% firing rate is documented behaviour, and `ornament`'s leadership fell from 27.0%
 * to 18.8% on the applied-element fix alone, without touching it.
 *
 * **Fire rates were phase-sensitive by an order of magnitude before recalibration.** Measured under
 * the absolute constants this file used to carry: the applied-element rule swung 4.3% at
 * `decorativeEmphasis` 0.1 to 48.1% at 1.0. An absolute threshold made `elite` mean "unusually
 * decorated in absolute terms", so a decorative culture read as composed almost entirely of elites
 * and an austere one as having none — a Simulation Honesty violation (doc 02).
 *
 * **The 2GN.80/2GN.77 ruling** (doc 11 §2.9, doc 12 §2.28) splits the rule set **by the tag a rule
 * awards, not by the feature its condition reads**: a rule awarding any `RelativeTag`
 * (`types/tags.ts`) needs baselines sampled from the producing culture-phase; a rule awarding only
 * `AbsoluteTag` members keeps a fixed threshold. Applying the selector mechanically catches **34 of
 * the 43 rules below** — the decoration-conditioned family, the thin-walled-container and
 * pedestal-base rules (physical conditions, status-claim awards — the cases that forced the cut
 * onto the award side), their siblings on the same physical axes (thick-walled/heavy-container
 * awarding `utilitarian`), and every rule awarding `personal`, `everyday`, `artisanal`, `communal`,
 * `military`, `ritual`, `votive` or `funerary`. Read the vocabulary arrays for membership, never a
 * list of rule indices — indices shift whenever this array is edited. `classification.test.ts` pins
 * the current relative/absolute split (35/44 as of roadmap 2GN.98's execution-quality rule below;
 * 34/43 at the time of this ruling).
 *
 * **This is the count of rules needing a baseline, not the count of measured thresholds this file
 * recalibrates against one — those are two different populations.** Of the 34, only **nine** have a
 * numeric condition a percentile can replace: the structural-complexity rule, the four
 * decoration-family rules, the two cross-layer rules and the two complexity-graded rules below —
 * all now migrated (roadmap 2GN.82, doc 12 §2.31). The other **25** read categorical bands
 * (`wallThickness`, `baseType`, `openingType`, `massBand`, `perforation`, `ringGap`,
 * `sheetFlexibility`, `sizeBand`, `isWearable`, `hasFasteningMechanism`) or plain booleans, for
 * which `BaselineFeature` (`types/tags.ts`) has no member — its own JSDoc rules this out
 * deliberately: "a percentile over `hasEdge` or `openingType` is meaningless, and a key type that
 * admitted them would let a rule ask a question the sampler cannot answer." What "relative" means
 * for a categorical band — a prevalence baseline, a `stratification` gate (doc 11 §2.9, blocked on
 * roadmap 2GN.96), or weight scaling — is undecided and is not this file's call to make; those 25
 * rules stay absolute here pending roadmap 2GN.97, a design spike rather than an implementation
 * task. R32 (the any-decoration nudge, immediately below) is the ninth exception among the 34: it
 * awards only `ornament`, an `AbsoluteTag`, and stays fixed at `>= 1` by design (doc 12 §2.24).
 *
 * **Migrating a rule to a percentile does not make its fire rate `1 - percentile`, and the gap
 * matters.** Several sampled features are coarse integers with heavy tie-mass at the interpolated
 * threshold, and `ClassificationContext.exceeds` uses `>=`: R29's `attachmentDiversity` p75 lands
 * exactly on the tie point in almost every measured culture-phase, so `>= p75` admits the whole tie
 * and fires at nearly double the rate p75 implies. This is a third face of doc 12 §2.28's
 * granularity defect — fractional thresholds cure percentile *flicker* between adjacent integers,
 * not tie *inclusion* at a threshold that lands on one. Consequently a migrated rule's ladder rung
 * is not automatically the rung its retired absolute constant was measured at; each migration below
 * records the realised rate it was checked against, not just the rung chosen. Full measurement
 * table, per-rule rationale and the categorical deferral: doc 12 §2.31.
 */

import type { ClassificationRule } from '../types/tags.ts';

/**
 * Fire rate above which a rule has stopped discriminating (roadmap 2GN.79, doc 12 §2.21).
 *
 * `classifyArtefact` folds matching rules by plain, unbounded sum, so a rule firing on most of its
 * population adds a near-constant to every score rather than separating one artefact from another.
 * Crossing this line is a prompt to check the rule's stated intent against its behaviour, **not an
 * automatic defect**: the any-decoration nudge is documented as deliberately universal (doc 12
 * §2.24) and sits far above it by design.
 *
 * Lives here rather than with either consumer because it is a fact about this rule set: both the
 * calibration guard (`calibration.test.ts`) and the Explorer's calibration panel
 * (`routes/dev/explorer/calibration/`) read it, and `routes/` may depend on `lib/` but not the
 * reverse.
 */
export const SATURATION_CEILING = 60;

export const CLASSIFICATION_RULES: readonly ClassificationRule[] = [
	// --- Edge ------------------------------------------------------------------------------------

	/** A cutting edge on a medium-or-long body reads primarily weapon, secondarily tool. */
	{
		condition: (f) => f.hasEdge && f.primaryAxisLength !== 'short',
		tags: new Map([['weapon', 0.6], ['tool', 0.3]]),
	},

	/**
	 * Short edged blade with a sharp point: dagger-family. `bladeLengthBand`/`pointSharpness` are
	 * the edged component's own facts, so this fires independently of the whole artefact's
	 * `primaryAxisLength` (a short blade on a long haft still reads here via `bladeLengthBand`).
	 */
	{
		condition: (f) => f.hasEdge && f.bladeLengthBand === 'short' && f.pointSharpness === 'sharp',
		tags: new Map([['weapon', 0.4], ['tool', 0.3], ['personal', 0.3]]),
	},

	/** Short edged blade without a sharp point: utility/kitchen-knife family. */
	{
		condition: (f) => f.hasEdge && f.bladeLengthBand === 'short' && f.pointSharpness !== 'sharp',
		tags: new Map([['tool', 0.5], ['domestic', 0.4], ['everyday', 0.3]]),
	},

	// A fourth edge rule (`hasEdge && primaryAxisLength === 'short' && bladeLengthBand !== 'short'`,
	// tool 0.4 / everyday 0.2) sat here until roadmap 2GN.87 deleted it as unsatisfiable. It was
	// authored in PR #37 review to close a gap found by enumerating the (axis, blade) truth table,
	// but that combination cannot be generated: `primaryAxisLength` bands `primaryExtent`, a
	// `Math.max` over every component's major axis drawn from the *same* `SHORT_MEDIUM_LONG_CM`
	// table `bladeLengthBand` reads, so a non-short blade (14cm/40cm) always pushes the artefact's
	// axis above the 9cm short cut. Measured over 8000 artefacts: blade never exceeds axis, and
	// `axis === 'short'` carried `blade === 'short'` in all 84 cases. Whether the game *should*
	// generate a short-bodied non-blade edge (scraper, chisel, adze) is a real question the rule
	// never actually answered — it is filed separately rather than inherited from a dead condition.

	/** Multiple distinct edges suggest a composite or multi-blade implement rather than one weapon. */
	{
		condition: (f) => f.edgeCount >= 2,
		tags: new Map([['tool', 0.3], ['weapon', 0.2]]),
	},

	// --- Point -------------------------------------------------------------------------------------

	/** A sharp point without an edge: awl, bodkin, spearhead, pin — piercing, not cutting. */
	{
		condition: (f) => f.hasPoint && !f.hasEdge && f.pointSharpness === 'sharp',
		tags: new Map([['weapon', 0.3], ['tool', 0.4], ['fastener', 0.2]]),
	},

	/** A blunt point without an edge: punch, stylus, blunt awl — a craft tool, not a piercing weapon. */
	{
		condition: (f) => f.hasPoint && !f.hasEdge && f.pointSharpness === 'blunt',
		tags: new Map([['tool', 0.5], ['artisanal', 0.3]]),
	},

	// --- Container (opening-graded) -----------------------------------------------------------------

	/** A wide, freely open container: bowl, cup — everyday domestic use. */
	{
		condition: (f) => f.hasContainer && (f.openingType === 'wide' || f.openingType === 'open'),
		tags: new Map([['container', 0.8], ['domestic', 0.5], ['everyday', 0.3]]),
	},

	/** A narrow or restricted opening: flask, jar — still domestic, but not a serving vessel. */
	{
		condition: (f) =>
			f.hasContainer && (f.openingType === 'narrow' || f.openingType === 'restricted'),
		tags: new Map([['container', 0.7], ['domestic', 0.4]]),
	},

	/** A slit opening: money-box, rattle — contents go in, not meant to come freely out. */
	{
		condition: (f) => f.hasContainer && f.openingType === 'slit',
		tags: new Map([['container', 0.5], ['votive', 0.4]]),
	},

	/** A sealed container (no opening, or a closed one): votive or funerary deposition vessel. */
	{
		condition: (f) => f.hasContainer && (f.openingType === 'none' || f.openingType === 'closed'),
		tags: new Map([['container', 0.5], ['votive', 0.4], ['funerary', 0.3]]),
	},

	// --- Vessel refinement -----------------------------------------------------------------------

	/** A thin-walled container reads as fine tableware rather than everyday cookware. */
	{
		condition: (f) => f.hasContainer && f.wallThickness === 'thin',
		tags: new Map([['elite', 0.3], ['ceremonial', 0.2]]),
	},

	/** A thick-walled container reads as utilitarian cooking or storage vessel. */
	{
		condition: (f) => f.hasContainer && f.wallThickness === 'thick',
		tags: new Map([['utilitarian', 0.4], ['domestic', 0.3]]),
	},

	/** A deeply curved broad form holds contents even outside the hollow primitives: scoop, palette-well. */
	{
		condition: (f) => f.curvature === 'deep',
		tags: new Map([['container', 0.5], ['domestic', 0.3]]),
	},

	/** A pedestal base reads display/ritual vessel rather than a plain standing pot. */
	{
		condition: (f) => f.baseType === 'pedestal',
		tags: new Map([['ceremonial', 0.4], ['elite', 0.3]]),
	},

	/** A pointed base reads amphora-style storage — set into a stand or the ground, not free-standing. */
	{
		condition: (f) => f.baseType === 'pointed',
		tags: new Map([['utilitarian', 0.3], ['maritime', 0.2]]),
	},

	// --- Perforation -----------------------------------------------------------------------------
	//
	// `perforation` is a single field unioning two primitives' vocabularies (`flat-broad`:
	// none/single/multiple; `disc-form`: none/central/off-centre). A multi-component artefact can
	// physically carry perforations on both, so `extractFeatures` (roadmap 2GN.19) must pick ONE
	// value: it reports the most classificatorily-loaded perforation present, priority
	// central > off-centre > single > multiple > none (rotation and suspension are stronger use
	// signals than a plain fixing hole). That ordering lives with the extractor, not here; these
	// rules stay one-value-in, so exactly one fires.

	/** A central perforation on a disc-form component: spindle-whorl, weight, mace-head. */
	{
		condition: (f) => f.perforation === 'central',
		tags: new Map([['tool', 0.4], ['artisanal', 0.3]]),
	},

	/** An off-centre perforation on a disc-form component: hung disc, token, pendant-weight — suspension, not rotation. */
	{
		condition: (f) => f.perforation === 'off-centre',
		tags: new Map([['ornament', 0.4], ['personal', 0.3]]),
	},

	/** A single perforation on a flat-broad component: pendant, plaque — meant to hang. */
	{
		condition: (f) => f.perforation === 'single',
		tags: new Map([['ornament', 0.4], ['personal', 0.3]]),
	},

	/** Multiple perforations: a fitting meant to be sewn or riveted onto something else. */
	{
		condition: (f) => f.perforation === 'multiple',
		tags: new Map([['fastener', 0.3], ['ornament', 0.2]]),
	},

	// --- Ring / fastener -----------------------------------------------------------------------------

	/** A closed ring: finger-ring, torc — worn, not fastened to anything. */
	{
		condition: (f) => f.ringGap === 'closed',
		tags: new Map([['ornament', 0.5], ['personal', 0.4]]),
	},

	/** An open or overlapping ring gap: penannular brooch, split-ring — fastens as much as adorns. */
	{
		condition: (f) => f.ringGap === 'open' || f.ringGap === 'overlapping',
		tags: new Map([['fastener', 0.4], ['ornament', 0.3], ['personal', 0.2]]),
	},

	// --- Sheet -------------------------------------------------------------------------------------

	/** A rigid sheet component: fitting, facing, mount — structural, not worn. */
	{
		condition: (f) => f.sheetFlexibility === 'rigid',
		tags: new Map([['utilitarian', 0.3], ['military', 0.2]]),
	},

	/** A flexible sheet component: foil, wrapping, binding — covering, textile-adjacent. */
	{
		condition: (f) => f.sheetFlexibility === 'flexible',
		tags: new Map([['personal', 0.2], ['ornament', 0.2]]),
	},

	// --- Mass ------------------------------------------------------------------------------------

	/**
	 * A heavy edge reads axe/adze/billhook — labour, not a blade weapon; counterweights the long-edge
	 * rule. Fires on 19.5% of edged artefacts. Unchanged by 2GN.79's audit, but worth recording that
	 * it measured at 55.8% before roadmap 2GN.86 rebalanced the mass bands: the "not a blade weapon"
	 * contrast was describing the majority of edged objects, because the old mass proxy put 57% of
	 * all output in `heavy`. The defect was upstream in `deriveDimensions`, not in this threshold.
	 */
	{
		condition: (f) => f.hasEdge && (f.massBand === 'heavy' || f.massBand === 'very-heavy'),
		tags: new Map([['tool', 0.5], ['agricultural', 0.3]]),
	},

	/**
	 * A heavy container reads storage jar or cauldron rather than tableware. Fires on 24.8% of
	 * containers, down from 61.1% before roadmap 2GN.86 — see the heavy-edge rule above for why the
	 * "rather than" contrast previously described the majority.
	 */
	{
		condition: (f) => f.hasContainer && (f.massBand === 'heavy' || f.massBand === 'very-heavy'),
		tags: new Map([['utilitarian', 0.4], ['domestic', 0.3]]),
	},

	/**
	 * Too heavy for one person: a shared or monumental object. Fires on 5.0%.
	 *
	 * Fired on **nothing at all** until roadmap 2GN.86: `very-heavy`'s threshold sat above the old
	 * mass proxy's arithmetic maximum, so the band was unreachable rather than merely rare and this
	 * rule was dead code carrying an authored intent. Rules reading a band no generator can emit
	 * fail silently — the calibration guard (`calibration.test.ts`) now pins every rule's rate so a
	 * zero is visible rather than assumed.
	 */
	{
		condition: (f) => f.massBand === 'very-heavy',
		tags: new Map([['communal', 0.4], ['ceremonial', 0.2]]),
	},

	// --- Size ------------------------------------------------------------------------------------

	/** A small object reads as an individual's carried or worn item. Physical size, not `portability`. */
	{
		condition: (f) => f.sizeBand === 'small',
		tags: new Map([['personal', 0.3], ['everyday', 0.2]]),
	},

	// --- Structural complexity -----------------------------------------------------------------------

	/**
	 * Many parts joined many different ways: an engineered, crafted assembly — hafted tool, mounted
	 * fitting. Originally `partCount >= 3 && attachmentDiversity >= 2`, which measured at 44.4% of a
	 * 7200-artefact sample (roadmap 2GN.79, doc 12 §2.25) — two joint types is the ordinary case,
	 * not an engineered assembly. Retuned to `>= 3` distinct joint types (22.3%, the measured p75 of
	 * `attachmentDiversity` and the same percentile the decoration family uses).
	 *
	 * The `partCount >= 3` clause was **dropped as inert**, not merely redundant: measurement showed
	 * the compound condition fires at exactly 44.4% with the clause, without it, and even with it
	 * raised to `>= 4` — an artefact cannot carry three distinct joint types without carrying the
	 * parts to join, so the diversity term already subsumed it. A clause that never changes the
	 * outcome misrepresents what the rule tests.
	 *
	 * **Culture-relative since roadmap 2GN.82** (doc 11 §2.9, doc 12 §2.31): `artisanal` is a
	 * `RelativeTag`, so the fixed `>= 3` became a per-culture-phase percentile.
	 *
	 * **p90, not p75, and the gap between them is the point.** `attachmentDiversity` takes only
	 * ~8 distinct values, and this culture's sampled p75 lands exactly on 2 in the overwhelming
	 * majority of measured culture-phases, with roughly a quarter of all output tied there. Because
	 * `exceeds` uses the `>=` convention (`types/tags.ts`), `>= p75` admits the whole tie and fires
	 * on 43.4% of a calibration sweep — almost exactly the 44.4% rate the `partCount` clause was
	 * dropped to get away from. The p90 rung reproduces the rule's authored intent, firing on 21.5%
	 * against the historically-measured 24.0%. **This is a third face of doc 12 §2.28's granularity
	 * defect**: fractional thresholds cure percentile *flicker* between adjacent integers, not tie
	 * *inclusion* at a threshold that lands on one — so a migrated rule's ladder rung is not
	 * automatically the rung its absolute constant was measured at; check the realised fire rate
	 * rather than assuming `1 - percentile`.
	 */
	{
		condition: (f, c) => c.exceeds('attachmentDiversity', 0.9, f.attachmentDiversity),
		tags: new Map([['tool', 0.3], ['artisanal', 0.3]]),
	},

	// --- Decorative (real signals) -----------------------------------------------------------------

	/**
	 * Heavily worked decoration signals high status. Originally `>= 3`, which measured at 86.8% of
	 * the 1200-artefact sample (roadmap 2GN.34, doc 12 §2.24) — "heavily worked" was firing on
	 * nearly everything. Retuned to the measured p75 of `decorativeLayerCount` (10), where it fired
	 * on 25.3%, matching the rule's stated intent rather than its original near-universal behaviour.
	 *
	 * **Culture-relative since roadmap 2GN.82** (doc 11 §2.9, doc 12 §2.31): `elite`/`ceremonial` are
	 * `RelativeTag` members, so the fixed `>= 10` became the culture-phase's own measured p75 — the
	 * direct successor of the constant above, no rung reinterpretation needed. Fires on 30.9% of a
	 * calibration sweep, within tolerance of the historically-measured 26.8%.
	 */
	{
		condition: (f, c) => c.exceeds('decorativeLayerCount', 0.75, f.decorativeLayerCount),
		tags: new Map([['ornament', 0.3], ['elite', 0.4], ['ceremonial', 0.3]]),
	},

	/**
	 * Several applied elements (inlay, gilding, studs, overlay, wire-wrapping) mark deliberate
	 * embellishment. Originally read the bare `appliedElementPresent` flag, which measured at 84.6%
	 * of a 7200-artefact sample (roadmap 2GN.79, doc 12 §2.25) — the rule claimed "deliberate
	 * embellishment" while firing on five artefacts in six.
	 *
	 * That saturation is **structural, not a mistuned threshold**: `expandDecoration` gives each BNF
	 * category its own per-component slot rolls, so at the fixture phase every component has a 0.45
	 * chance of carrying an applied element and a ~4.15-component artefact reaches ~87% by
	 * arithmetic alone. No weight on a boolean fixes that. The underlying *count* does discriminate
	 * (p50 2, p75 4, p90 5, max 15), so this reads `appliedElementCount` at its measured p75,
	 * firing on 25.2% — within a point of retuned R30's 25.3%, so the two elite-bearing decoration
	 * rules carry comparable selectivity rather than one drowning the other.
	 *
	 * Robust to catalogue growth: measured identical at 2×, 4× and 10× the applied-element technique
	 * pool, because slot count sets the number and pool size only decides which technique fills a
	 * slot. **Not** robust to phase attributes (4.3% at `decorativeEmphasis` 0.1, 48.1% at 1.0) — the
	 * defect the 2GN.80/2GN.77 ruling (doc 11 §2.9) exists to correct.
	 *
	 * **Culture-relative since roadmap 2GN.82** (doc 12 §2.31): `elite` is a `RelativeTag`, so the
	 * fixed `>= 4` became a culture-phase percentile. **p75, not p90, even though p75 moves 11.6pp
	 * from the historically-measured 25.7%** (firing at 37.3% against a calibration sweep). Same
	 * tie-mass mechanism as R29 above — `appliedElementCount` takes only 9–16 distinct values (doc 12
	 * §2.28's own example) — but here p90 (15.3%) was rejected rather than taken, because 2GN.79
	 * explicitly sized this rule to sit "within a point of retuned R30's 25.3%, so the two
	 * elite-bearing decoration rules carry comparable selectivity rather than one drowning the
	 * other." Under the ladder, R30 (above) measures 30.9%: p75 keeps this rule 6.4pp from R30, while
	 * p90 would put it 15.6pp away, breaking the parity 2GN.79 deliberately built. Preserving the
	 * *stated relationship between the two rules* was judged to matter more than preserving either
	 * rule's absolute number.
	 *
	 * **Re-measured 2026-08-06 for `decorationVolume`'s emphasis-only reading (roadmap 2GN.98, doc 12
	 * §2.33): fires at 34.3% (was 37.3%), still within a few points of R30's 31.3% — the parity 2GN.79
	 * built survives the volume/refinement split intact. The saturation mechanism above (per-category
	 * slot rolls, robust to catalogue growth) is unchanged; only the raw percentages moved, and
	 * `appliedElementCount`'s ladder (p50 2, p75 3, p90 5, max 11) is slightly compressed from the
	 * figure quoted above, still discriminating.**
	 */
	{
		condition: (f, c) => c.exceeds('appliedElementCount', 0.75, f.appliedElementCount),
		tags: new Map([['elite', 0.4], ['ornament', 0.3]]),
	},

	/** Any decoration at all nudges an object toward ornamental reading. */
	{
		condition: (f) => f.decorativeLayerCount >= 1,
		tags: new Map([['ornament', 0.2]]),
	},

	// --- Decorative (dormant — fire once 2GN.68 wires the lookups that populate these
	// `ExtractedFeatures` fields from the `DecorativeLayer` data 2GN.33 already produces) -----------

	/**
	 * DORMANT: `preciousMaterialsInDecoration` has no producer yet (roadmap 2GN.68, consuming
	 * `DecorativeLayer.material` data that 2GN.33 produces). Authored now so the design is
	 * captured in one place; fires on no artefact until that task lands.
	 */
	{
		condition: (f) => f.preciousMaterialsInDecoration,
		tags: new Map([['elite', 0.5], ['ceremonial', 0.3], ['votive', 0.2]]),
	},

	/**
	 * DORMANT (partially): `motifPresent` is live — 2GN.33 has landed and `extractFeatures` reads it
	 * off `DecorativeLayer.motifRef` directly. `motifCulturalOrigins` is still dormant, needing
	 * 2GN.68's motif→culture lookup, so this rule as a whole fires on no artefact until that task
	 * lands. Cross-cultural motifs on one object signal exchange/trade.
	 */
	{
		condition: (f) => f.motifPresent && f.motifCulturalOrigins.length > 1,
		tags: new Map([['trade-good', 0.4], ['elite', 0.2]]),
	},

	// --- Cross-layer ---------------------------------------------------------------------------------

	/**
	 * An edged, decorated object transcends pure function — the engraved-sword archetype (doc 05
	 * §9.2). Originally `>= 2` layers, which measured at 96.9% of edged artefacts in the 1200-sample
	 * (roadmap 2GN.34, doc 12 §2.24) — any two layers on an edge was firing on nearly every edged
	 * object. Retuned to the measured p50 of edged-artefact `decorativeLayerCount` (6), where it
	 * fired on 64.5% of edged artefacts; doc 05 §9.2's worked example still holds at this threshold
	 * (see the doc's implementation note), it just needs substantive decoration rather than any two
	 * layers.
	 *
	 * **Culture-relative since roadmap 2GN.82** (doc 12 §2.31): `ritual`/`ceremonial`/`elite` are all
	 * `RelativeTag` members. The measured threshold above was a **sub-population** percentile (p50 of
	 * edged artefacts only); `ClassificationContext` carries no sub-population baseline, only
	 * whole-culture-phase ones. Measurement found the whole-population p50 fires on 70.0% of edged
	 * artefacts — itself saturated within that gate population — so this rule takes the
	 * whole-population **p75** instead (16.6% overall, 41.4% of edged artefacts). The sub-population
	 * reading was an artefact of how 2GN.34 happened to measure (a filtered sample was in hand), not
	 * a design requirement: "more decorated than three-quarters of everything this culture makes" is
	 * also the cleaner comparative claim, since "than three-quarters of everything edged" smuggles in
	 * a comparison class no in-world scholar has access to.
	 */
	{
		condition: (f, c) =>
			f.hasEdge && c.exceeds('decorativeLayerCount', 0.75, f.decorativeLayerCount),
		tags: new Map([['ritual', 0.5], ['ceremonial', 0.4], ['elite', 0.3]]),
	},

	/**
	 * A decorated container reads ritual/display rather than plain cookware. Originally `>= 2`
	 * layers (96.1% of containers in the 1200-sample, roadmap 2GN.34, doc 12 §2.24); retuned to the
	 * measured p50 of container `decorativeLayerCount` (6), firing on 60.7% of containers.
	 *
	 * **Culture-relative since roadmap 2GN.82** (doc 12 §2.31): same reasoning as the edged-artefact
	 * rule above. Whole-population p50 fires on 66.6% of containers — saturated within that gate
	 * population — so this rule also takes whole-population **p75** (25.0% overall, 38.0% of
	 * containers), and the sub-population sampler is deliberately not built for a ≤5pp correction.
	 */
	{
		condition: (f, c) =>
			f.hasContainer && c.exceeds('decorativeLayerCount', 0.75, f.decorativeLayerCount),
		tags: new Map([['ceremonial', 0.4], ['votive', 0.3], ['elite', 0.3]]),
	},

	// --- Structural presence flags -------------------------------------------------------------------
	//
	// Top-level boolean presence flags on the whole artefact (not a single primitive's parameter),
	// so they group together here rather than under a primitive family. Appended at the end to keep
	// the primitive-derived rules above index-stable for the pinned-index tests.

	/** A fastening mechanism (clasp, pin, hinge) is definitionally a fastener: brooch, buckle, latch. */
	{
		condition: (f) => f.hasFasteningMechanism,
		tags: new Map([['fastener', 0.5], ['personal', 0.2]]),
	},

	/** A striking/impact surface reads hammer, mace, adze-head — percussion, tool first, weapon second. */
	{
		condition: (f) => f.hasImpactSurface,
		tags: new Map([['tool', 0.4], ['weapon', 0.3]]),
	},

	/** Something worn on the body: pendant, brooch, bracelet — personal adornment. */
	{
		condition: (f) => f.isWearable,
		tags: new Map([['ornament', 0.3], ['personal', 0.3]]),
	},

	// --- Decorative intensity (complexity-graded — roadmap 2GN.34) ---------------------------------
	//
	// `extractFeatures` (roadmap 2GN.19) computes `decorativeComplexity` and `techniqueComplexity`
	// from real signal (layer count, distinct technique count, motif density, nesting depth), but
	// until this task nothing read either field. Thresholds are pinned to percentiles measured over
	// 1200 real pipeline artefacts (see this module's JSDoc and doc 12 §2.24), not to doc 05 §9.2's
	// illustrative constants, which measured at 95–99% and would have added a near-constant to every
	// score under the plain-sum fold rather than discriminating. Appended at the end to keep the
	// rules above index-stable for the pinned-index tests, per the structural-presence-flags
	// precedent.

	/**
	 * Objectively lavish: heavy absolute decorative investment regardless of the object's size.
	 * Measured p75 of `decorativeComplexity` (16.3); fired on 28.6% of the sample.
	 *
	 * **Culture-relative since roadmap 2GN.82** (doc 12 §2.31): `elite`/`ceremonial` are
	 * `RelativeTag` members, so this becomes the culture-phase's own measured p75 — a direct
	 * successor of the constant above. Fires on 29.8% of a calibration sweep, within tolerance of
	 * the historically-measured 29.6%.
	 */
	{
		condition: (f, c) => c.exceeds('decorativeComplexity', 0.75, f.decorativeComplexity),
		tags: new Map([['elite', 0.4], ['ceremonial', 0.3]]),
	},

	/**
	 * Exceptionally lavish — the top of the measured distribution. Deliberately cumulative with the
	 * rule above: an artefact scoring here also scores the p75 rule, reaching `elite` 0.9 combined,
	 * the intended "unmistakably a prestige object" reading under `classifyArtefact`'s plain-sum
	 * fold. Tags `ritual` rather than doubling `ceremonial`, so the two tiers stay distinguishable in
	 * the Explorer breakdown (roadmap 2GN.59).
	 *
	 * **Culture-relative since roadmap 2GN.82** (doc 12 §2.31): the original constant sat at ~p93 of
	 * a whole-world sample, which is not a `PERCENTILE_LADDER` rung (`engine/statistics.ts`) —
	 * `PERCENTILE_LADDER` is closed by design, since two rules asking "p75" must ask the same
	 * question, and an off-ladder value would throw rather than inventing a threshold nobody
	 * measured. ~p93 was never a chosen percentile: it described where the constant `>= 25` happened
	 * to land, not a design intent. **p95, not p90**: p95 fires on 5.8% against the
	 * historically-measured 7.7%, while p90 fires on 11.2% — inflating the top elite tier by roughly
	 * 45%, diluting exactly the tier this rule exists to mark, since it combines with the rule above
	 * to reach `elite` 0.9. Cumulation with the p75 rule survives structurally rather than by
	 * measurement: `percentileLadder` thresholds are monotonic across rungs (pinned by
	 * `baselines.test.ts`), so anything at or above p95 is necessarily at or above p75.
	 */
	{
		condition: (f, c) => c.exceeds('decorativeComplexity', 0.95, f.decorativeComplexity),
		tags: new Map([['elite', 0.5], ['ritual', 0.3]]),
	},

	/**
	 * Lavish for its size: decoration disproportionate to the object's part count, independent of
	 * absolute volume. Decoration volume tracks a culture's phase decorativeness and component count
	 * almost as much as it tracks any single object's status (measured mean `decorativeLayerCount`
	 * ranges from 0.5 to 24 across `decorativeEmphasis` alone) — this rule is the counterweight,
	 * catching a small object carrying disproportionate decoration that the two raw-threshold rules
	 * above would miss. `partCount > 0` is a guard, not a `Math.max` floor: a partless artefact has
	 * no proportion to judge and must not fire (an unguarded division would put `Infinity >= 4` into
	 * the condition).
	 *
	 * **Culture-relative since roadmap 2GN.82** (doc 12 §2.31): `elite` is a `RelativeTag`. Reads
	 * `decorativePerPart`, the one derived `BaselineFeature` (`decorativeComplexity / partCount`,
	 * `engine/generation/baselines.ts`'s `readFeature`, guarded at `partCount` 0 the same way this
	 * rule is). The `partCount > 0` guard must stay **ahead of** `exceeds`, not just ahead of the
	 * division: the sampler scores a partless artefact's `decorativePerPart` as `0`, so an unguarded
	 * artefact here would compare `Infinity` against a threshold derived from a sample that recorded
	 * those same artefacts as zero — a mismatch between what was measured and what would be asked.
	 * Threshold is the culture-phase's own measured p75, firing on 30.8% of a calibration sweep
	 * against the historically-measured 33.2%.
	 */
	{
		condition: (f, c) =>
			f.partCount > 0 && c.exceeds('decorativePerPart', 0.75, f.decorativeComplexity / f.partCount),
		tags: new Map([['elite', 0.3], ['ornament', 0.3]]),
	},

	/**
	 * Technique breadth, not volume: many distinct crafts touched this object, implying multiple
	 * specialists and tool sets rather than one technique applied repeatedly. Tags `artisanal`
	 * primarily, `elite` only secondarily, so it doesn't simply compound the `elite` weight the
	 * `decorativeComplexity` rules above already carry — `techniqueComplexity` is
	 * `maxDepth * distinctTechniques` and today `maxDepth` is pinned at 1 until roadmap 2GN.31 lands
	 * sublayers, so this threshold is currently a distinct-technique count and the field is a strict
	 * summand of `decorativeComplexity`, not merely correlated with it. **Hazard for 2GN.31**: once
	 * nesting depth varies, the same `techniqueComplexity` value becomes reachable at a fraction of
	 * the technique breadth and this rule will saturate with no change to this file — re-measure
	 * when that task lands.
	 *
	 * **Culture-relative since roadmap 2GN.82** (doc 12 §2.31): `artisanal`/`elite` are both
	 * `RelativeTag` members. The absolute constant `>= 8` was chosen to "sit just inside" the
	 * measured p90 (9) — a shim with no equivalent on a closed ladder. **p90, not p75**: the rule was
	 * authored as a tail rule ("many distinct crafts", not "an above-average number"), and p90 fires
	 * on 19.3% (re-measured against the live pipeline after the 2GN.98 volume/refinement split;
	 * `EXPECTED_FIRE_RATES` in `calibration.test.ts` pins the same figure), staying a tail reading;
	 * p75 would fire on 31.3%, a 12.0pp move that reads as "roughly average" rather than "unusual
	 * breadth". p90 also directly addresses the 2GN.31 hazard above: a percentile basis moves with
	 * the generator instead of silently saturating when nesting depth starts varying
	 * `techniqueComplexity`.
	 */
	{
		condition: (f, c) => c.exceeds('techniqueComplexity', 0.9, f.techniqueComplexity),
		tags: new Map([['artisanal', 0.4], ['elite', 0.2]]),
	},

	// --- Execution quality (roadmap 2GN.98, doc 11 §1.5) -------------------------------------------
	//
	// Every decoration-family rule above reads *volume* (`decorativeLayerCount`,
	// `decorativeComplexity`, `decorativePerPart`, `techniqueComplexity`) — how much decoration
	// appears, driven by `aesthetics.decorativeEmphasis`. None of them read how *well* it was made.
	// `meanDecorativeGrade` (`ExtractedFeatures`, roadmap 2GN.98) is driven by
	// `society.craftSpecialisation` and each selected technique's own execution difficulty
	// (`TECHNIQUE_DIFFICULTY`, `data/decorations.ts`), independently of volume — a heavily-decorated
	// but low-craft artefact and a sparsely-decorated but high-craft one can score oppositely here
	// despite both potentially firing the same volume rule above (or neither firing it). This is the
	// rule that finally gives doc 05 §8.3's "technically refined" its own signal, separate from
	// "heavily decorated".

	/**
	 * Exceptionally well-executed, independent of how much decoration is present: this rule can fire
	 * on a sparsely-decorated artefact whose few layers are all difficult techniques executed by a
	 * highly skilled culture, and can fail to fire on a heavily-decorated artefact whose many layers
	 * are all easy techniques from a middling one. Tags `artisanal` primarily — the execution-skill
	 * reading `techniqueComplexity` above already carries for breadth — with `elite` secondary,
	 * mirroring that rule's weight split rather than compounding the volume-driven `elite` weight the
	 * `decorativeComplexity` rules carry.
	 *
	 * **Culture-relative from birth** (roadmap 2GN.98): `artisanal`/`elite` are both `RelativeTag`
	 * members, so this rule is authored against `ClassificationContext.exceeds` directly rather than
	 * migrated from an absolute constant — there is no pre-relativisation history to reconcile. **p90,
	 * not p75**: measured against the real pipeline, p75 fires on 26.6% — close enough to the naive
	 * "top quarter" expectation that `meanDecorativeGrade` doesn't carry the coarse tie-mass 2GN.82
	 * found on integer-valued features, but still reads as "above average" rather than the "exceptional"
	 * this rule's own name and weight split claim. p90 fires on 12.3%, comparable selectivity to R43
	 * (technique breadth, also p90, 19.3%) and consistent with how R41/R43 were both moved off p75 for
	 * the same tail-claim reasoning (doc 12 §2.31).
	 */
	{
		condition: (f, c) => c.exceeds('meanDecorativeGrade', 0.9, f.meanDecorativeGrade),
		tags: new Map([['artisanal', 0.4], ['elite', 0.2]]),
	},
];
