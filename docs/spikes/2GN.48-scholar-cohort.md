# 2GN.48: Scholar Cohort Shape, Specialisation Coherence and Site Preference

| Prop      | Value                                                                                                |
| --------- | ---------------------------------------------------------------------------------------------------- |
| Status    | Ruled; implemented                                                                                   |
| Ruled     | 2026-09-17                                                                                           |
| Ruling in | This document; propagated to doc 11 §2.23 and doc 12 §2.60                                           |
| Outcome   | Dealt-spread cohort; lift×frequency specialisation from a measured table; correlated site preference |

## The question

`generateNPCScholars(cultures, chronology, prng): NPCScholarSeed[]` is named as an implementation
task by the roadmap ("3-4 NPCs with name, specialisation, career stage"), but `NPCScholarSeed` has
eight fields and neither doc 05 §4.1 nor doc 07 §5.1 pins a distribution for three of them:
`careerStage`, `sitePreference` has no source at all in the loose `(cultures, chronology, prng)`
signature, and `specialisation: ArtefactTag[]` has no rule for which tags plausibly co-occur on one
scholar. Three separate design questions, run as an interview, one ruling at a time, each measured
before being asked.

## Ruling 1 — cohort shape

**What is being modelled.** A 3-4 person field is small enough that its composition is not random. A
real small discipline always has a foundational figure whose work the corpus rests on (Evans at
Knossos was cited for decades past his death) and someone active for the player to actually meet;
publication counts accumulate monotonically with career length, so `careerStage` is a position on a
cohort age pyramid, not an independent roll per scholar.

**Method.** Simulated 5000 cohorts of 4 under two policies: independent uniform draw across
`['emeritus', 'senior', 'mid', 'early']`, versus a dealt spread (one guaranteed senior-or-emeritus
anchor, one guaranteed early-or-mid active voice, the remaining two drawn freely).

**Finding.** Independent draws leave 6.3% of cohorts with no active (early/mid) scholar for the
player to meet, and 6.2% with no senior-or-above figure to have written the foundational corpus —
one seed in sixteen either way. The dealt spread eliminates both failure modes by construction (0.0%
in 5000 simulated cohorts).

**Ruling.** `careerStage` is dealt, not drawn independently: one senior-or-emeritus anchor, one
early-or-mid active voice, two free draws across all four stages. `status` and `publicationCount`
are derived from `careerStage` (emeritus skews retired/deceased with high counts; early skews active
with low counts), not rolled separately.

## Ruling 2 — specialisation coherence

**What is being modelled.** A four-person field cannot sustain two scholars both being "the weapons
specialist" — real small disciplines divide their territory. `specialisation: ArtefactTag[]` is
already a set per scholar (doc 11 §2.9's widening ruling: "a scholar anchored to a relative tag is
the more interesting case"), so the real question is not whether specialisations can overlap (they
can, partially — that's normal) but which tags plausibly co-occur _on one scholar's body of work_ at
all, versus which pairings would read as incoherent (a maritime specialist who is also the
ceremonial-goods expert, versus a maritime specialist who is also the trade-goods expert).

**First attempt, and why it was wrong.** Initially measured raw co-occurrence (share of artefacts
carrying both tags) at threshold ≥0.5: `maritime` fired on 0.00% of 1600 artefacts across all four
Explorer presets, so no pairing involving it was measurable at all. Re-run at ≥0.1: `maritime` fires
on 5.3%, but the raw-percentage ranking was dominated by the two commonest tags' mutual
reinforcement (`elite`+`ornament` 82%, `container`+`ornament` 78%) and would not have discriminated
a real coherence signal from base-rate noise.

**Corrected method.** Lift, not raw co-occurrence: `lift(A,B) = P(A∧B) / (P(A)·P(B))`, scale-free so
it is not shaped by the award threshold. Measured over pipeline stages 4-8 (`expandGrammar` →
`normaliseArtefact` → `expandDecoration` → `assignMaterials` → `gradeDecorativeLayers` →
`extractFeatures` → `classifyArtefact`) across all four Explorer presets (tarpan, thalassar,
xoconahtl, khaltiris) at n=400 each, threshold 0.1, pairs with fewer than 20 supporting artefacts
excluded as noise. 19 of 21 vocabulary tags fire at least once; `trade-good` and `currency` never
fire at any threshold tested (0.1, 0.25, 0.5) — a confirmed classifier gap (`currency`'s is already
documented in `types/tags.ts`; `trade-good` is a new finding, see Consequences).

**Finding: the ranking is real and stable.** Comparing the top-15-by-lift pairs at threshold 0.1
against threshold 0.25: 10 of 15 agree, including every pair above lift 1.7. Two real clusters
emerged: a rural/practical family (`agricultural`+`communal` lift 3.78, `agricultural`+`ritual`
3.68, `agricultural`+`utilitarian` 1.84) and a mortuary family (`funerary`+`votive` 2.09,
`ritual`+`votive` 1.88). The originally-asked example is directly confirmed: `maritime`+`ceremonial`
lift 1.05 (no real association — indistinguishable from independence) versus
`maritime`+`utilitarian` lift 2.03 (a genuine association). One negative association surfaced worth
recording: `everyday`+`funerary` lift 0.33 — plausible on its own terms, since everyday objects are
under-represented as grave goods.

**Second attempt, and why it was also wrong.** The approved draw (seed tag by frequency, neighbours
by lift alone) was simulated over 20 cohorts before being frozen. Lift is mathematically largest on
rare tags — a near-universal tag cannot lift far above its own high base rate
(`container`+`ornament` lift 1.01 despite both exceeding 78% frequency) — so weighting neighbours by
lift alone systematically steered every cohort toward the record's rare corners: `container` (78.8%
of the record) appeared in only 11 of 80 simulated scholars' specialisation sets, `ornament` (97.9%)
in 12, `tool` (66.4%) in 9. A cohort of four scholars of obscure rural ritual objects, with nobody
working on pottery, is the inverse of a plausible field.

**Corrected mechanism.** Weight neighbours by `lift × frequency`, not lift alone, so a rare tag
needs both a real measured association _and_ enough of a base rate to matter as a second
specialisation. Re-simulated at full scale (1200 scholars, 300 cohorts) against the complete
167-pair measured table (not a hand-typed subset — an earlier partial-table simulation understated
the effect of pairs it omitted). Seed-tag share now rank-correlates with raw frequency on 17 of 19
tags (`ornament`, `container`, `tool`, `domestic` lead both rankings; `maritime`, `communal` trail
both); no tag has near-zero appearance across the whole vocabulary (`maritime` lowest at 2.1%,
`ritual` 4.7%, everything else higher). The two rank swaps (`elite`↔mid-frequency tags,
`weapon`↔`utilitarian`) are within the noise band a 19-way weighted draw produces and are not a
defect.

**Ruling.** `specialisation` is drawn as a seed tag (`weightedSelect` by measured frequency) plus
1-2 neighbours (`weightedSelect` by `lift × frequency` against the seed, sampled without
replacement). Both `TAG_FREQUENCY` and `TAG_COOCCURRENCE_LIFT` are frozen, measured tables (below),
not live-computed — see **Sourcing, and why it is frozen** below.

### Sourcing, and why it is frozen

The matrix cannot be computed inside `generateNPCScholars(cultures, chronology, prng)`: that
signature carries no grammar rules, no `MATERIALS`/`CLASSIFICATION_RULES` catalogues and no
`sampleBaselines` context, and 2GN.27's own precedent is to measure offline and freeze constants
pinned by a calibration test (`STANDING_CUT`, `ELITE_SHARE_CEILING`), not to sample live inside a
cheap generation-time function. A frozen table drifts from the generator it was measured against
whenever the decoration, material or classification rules change — not just classification rules,
since the sweep runs the full stages 4-8 chain — so the reopen condition below is written against
all three.

**This is a deliberate asymmetry against Ruling 3's `SiteType`↔tag mapping**, which is hand-authored
rather than measured. Tag-to-tag coherence is a property of _what the generator actually produces_
and has no other honest source; `SiteType`↔specialisation affinity is a design claim about what
archaeologists dig, independent of the generator, and authoring it is the right call the same way
2GN.66 authored phonotactic coherence rules rather than mining them.

## Ruling 3 — `sitePreference` source

**The problem.** `sitePreference: SiteType[]` has no source anywhere in the current signature or in
any culture data. It is not `culture.baseProfile.craftInvestment.siteTypeWeights`: that field
records where an _ancient culture_ invested its craft effort, and routing a _modern scholar's_ dig
preference through it would make an NPC bias a property of the culture they study rather than of the
scholar. Doc 05 §4.1 calls site preference an NPC bias explicitly: NPCs are "biased by their
interests and institutional access."

**Ruling.** `sitePreference` correlates with `specialisation` via a small hand-authored
`SiteType`↔`ArtefactTag` affinity table (funerary/votive/ritual → burial/shrine/cache;
weapon/military → fortification/battlefield; maritime → shipwreck/market; domestic/agricultural →
settlement/midden/workshop), drawn with `weightedSelect` by overlap with the scholar's
specialisation set — every site type keeps a small floor weight so none is ever strictly
unreachable, only strongly favoured or disfavoured. Measured over 1200 simulated scholars: `market`
and `shipwreck` each appear in 5.1% of `sitePreference` sets, tracking `maritime`'s own 5.3%
specialisation frequency almost exactly, since `trade-good` never fires and cannot contribute to
either row's weight. The `shipwreck` affinity row keeps its `trade-good` entry regardless — it
becomes fully live the moment that classifier gap closes, with no further editing needed.

## Constants, as measured

Swept 2026-09-17 over the four Explorer presets (tarpan, thalassar, xoconahtl, khaltiris) at n=400
each, pipeline stages 4-8, threshold 0.1, minimum 20 supporting artefacts per pair.

| constant                | value                                        | what it captures                                                                                                                            |
| ----------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Award threshold         | 0.1                                          | Above 0.5, `maritime` and five other tags never fire at all; 0.1 vs 0.25 top-15-by-lift agree 10/15, so the ranking is not threshold-shaped |
| Minimum pair support    | n=20                                         | Below this, single-digit-count pairs (`agricultural`+`maritime` n=5) produce lift values that are noise, not signal                         |
| `TAG_FREQUENCY`         | 19 entries (`trade-good`, `currency` absent) | Per-tag share of artefacts at score ≥0.1, pooled across all four presets                                                                    |
| `TAG_COOCCURRENCE_LIFT` | 167 pairs                                    | `P(A∧B)/(P(A)·P(B))` per pair, pooled across all four presets; full table in `scholars.ts`                                                  |

Full `TAG_FREQUENCY` and `TAG_COOCCURRENCE_LIFT` tables as shipped, in `src/lib/data/scholars.ts`
(re-measuring reproduces these to within a few thousandths — the two runs taken during this spike
differed in the 4th decimal purely from seed-label ordering, which is why
`scholars.calibration.test.ts` checks with tolerance rather than exact equality):

```typescript
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
// trade-good, currency: absent — never fire at any tested threshold (0.1, 0.25, 0.5).
```

The `TAG_COOCCURRENCE_LIFT` table (167 entries) and the hand-authored `SITE_TYPE_TAG_AFFINITY`
mapping are both in `src/lib/data/scholars.ts`; see that file rather than duplicating them here, per
the `docs/spikes/README.md` convention of keeping constants in one place.
`src/lib/data/scholars.calibration.test.ts` re-runs the measurement sweep and pins both tables
within tolerance, so a rule change that shifts the distribution fails loudly rather than going
unnoticed until 3WS.15.

## Rejected alternatives

**Specialisation as independent draws per scholar (no coherence).** Simplest, no measurement needed.
Rejected: 27.6% of simulated cohorts produced at least one exact-duplicate specialisation set in an
early framing of the problem, and even once specialisation was correctly modelled as a set rather
than a scalar, independent draws give no reason two scholars' territories would avoid overlapping
the way a real four-person field's do.

**Raw co-occurrence percentage, not lift.** The first measurement taken. Rejected because it is not
scale-free: it is dominated by which tags are individually common, not by which pairs are associated
beyond their base rates, and would have frozen `elite`+`ornament` as the strongest "coherence"
signal purely because both tags are near-universal.

**Neighbours weighted by lift alone.** The mechanism as first approved. Rejected after simulation:
lift is mathematically largest on rare tags, so it steers every cohort toward the record's rare
corners and away from the commonest material, the reverse of what a plausible field looks like.

**A hand-authored tag-affinity matrix (190 pairs across 20 tags).** Considered as an alternative to
measuring co-occurrence at all. Rejected: authoring 190 pairwise constants for a coherence signal
the generator itself already encodes is exactly the "shoehorning numbers into pre-existing slots"
failure mode the project's spike process exists to avoid — the data was there to measure.

**`sitePreference` from `craftInvestment.siteTypeWeights`.** The first-drafted source. Rejected:
that field is where the ancient culture invested effort, not where a modern scholar chooses to dig;
using it would misattribute an NPC's institutional bias to the culture under study.

## Consequences

- `src/lib/engine/world/scholars.ts`: `generateNPCScholars()`, the frozen `TAG_FREQUENCY` and
  `TAG_COOCCURRENCE_LIFT` tables, the `SITE_TYPE_TAG_AFFINITY` mapping, the dealt-spread
  `careerStage` draw and its `status`/`publicationCount` derivation, all MVP-provisional per the
  2GN.8 precedent and pinned by a calibration-style test.
- **New finding, not previously recorded**: `trade-good` never fires at any tested threshold,
  joining `currency` (already documented in `types/tags.ts`) as a classifier gap. Neither tag's
  absence is scholars.ts's to fix; noted here for whoever picks up the classifier vocabulary next.
- **Forward note for 3WS.15** ("replace mock culture profiles with real `WorldState` data
  throughout"): once real per-world culture/grammar data is reachable from generation, replace the
  frozen `TAG_COOCCURRENCE_LIFT` table with a per-world computation (`sampleBaselines`-adjacent), so
  specialisation coherence tracks each world's own generated record rather than the four Explorer
  presets this spike measured against.
- Doc 11 gains §2.23 restating the three rulings; doc 12 gains §2.60.

## Reopen conditions

Re-measure `TAG_FREQUENCY` and `TAG_COOCCURRENCE_LIFT` if the decoration rules
(`data/decorations.ts`), material rules (`data/materials.ts`) or classification rules
(`data/classification.ts`) change materially — the sweep runs the full stages 4-8 chain, so a change
to any of the three can shift the measured distribution. 3WS.15 is the condition under which the
frozen table retires entirely in favour of a live per-world computation (see Consequences).
