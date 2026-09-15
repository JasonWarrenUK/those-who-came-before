# 2GN.27: Material Standing: Where Stratification Lives, and What a Traded Material Is Worth

| Prop      | Value                                                                                       |
| --------- | ------------------------------------------------------------------------------------------- |
| Status    | Ruled; implementation in the same task                                                      |
| Ruled     | 2026-09-15                                                                                  |
| Ruling in | This document; propagated to doc 11 §2.9 (formula and threshold restated) and doc 12 §2.59  |
| Outcome   | Stratification moves to stage 6 as a stratum draw; standing reads trade openness; fixed cut |

## The question

2GN.27 was filed as an implementation task: derive a material's standing from its situation (doc 11
§2.9, restated by 2GN.143 as `f(availability⁻¹, cultural affinity, stratification)`) and let it
contribute `elite`/`ceremonial` to tag accumulation. Every upstream ruling was in place: 2GN.110
re-keyed `materialAffinities`, 2GN.142 ruled region, 2GN.143 folded provenance into availability.
Four things were still open, and each turned out to be a design question rather than a tuning one:

1. How stratification enters, given an earlier session ruled the threshold percentiled against a
   sampled distribution.
2. How availability inverts.
3. How a multi-component artefact collapses to one value.
4. Where the number is computed.

Working through (1) surfaced the real problem. A percentile is invariant under a positive constant
scaling, and stratification is one constant per culture-phase. Put stratification inside a
percentiled quantity and it does nothing: two cultures with identical geology and affinities at
stratification 0.4 and 0.85 produce the same artefacts above p75. The three-term formula and the
percentile ruling could not both be kept, and choosing between them meant asking what stratification
models in the first place.

## What is being modelled

Archaeologists infer an elite from restricted distribution. Varna reads as an early stratified
society because most of its gold sits in a handful of graves while the majority hold none. The
material's scarcity proves nothing on its own: Anatolian obsidian was scarce hundreds of kilometres
from source, yet it reached ordinary Neolithic households across the Levant through exchange
networks and reads as a trade good. A scarce, prized material in an egalitarian society gets spread;
the same material in a stratified one gets hoarded.

Three facts are in play. Scarcity here (`level`, from geology and trade) and value here
(`culturalAffinity`, the culture's opinion) describe the material's situation. Stratification
describes what the society does with materials in that situation: it is a property of the
distribution of prized materials across the culture's output, and no scalar term can carry a
distribution shape. That is why it would not fit as a multiplier.

## Method

For each Explorer preset against its own geology and trade, compute the situation quantity
`availability⁻¹ × affinity` for all sixteen materials, then run pipeline stages 4–6 (`expandGrammar`
→ `normaliseArtefact` → `assignMaterials`) over n=400 artefacts and take the maximum across each
artefact's structural components. Cross-check the material-level picture against the six
`mockRegionalWorld` fixtures.

## Finding 1: without a distribution mechanism, every preset is a society of elites

Share of artefacts whose most prized structural material is at least `scarce` at neutral affinity
(quantity ≥ 4):

| preset    | stratification | parts/artefact | per component | per artefact (max) |
| --------- | -------------- | -------------- | ------------- | ------------------ |
| tarpan    | 0.4            | 2.1            | 16.9%         | 30.8%              |
| thalassar | 0.6            | 4.1            | 30.4%         | 74.3%              |
| xoconahtl | 0.6            | 6.4            | 15.7%         | 63.0%              |
| khaltiris | 0.85           | 6.3            | 14.0%         | 61.0%              |

The selection weights already suppress scarce materials (`SCARCITY_WEIGHT` 0.25 and 0.15), but half
the sixteen-material catalogue is scarce-or-rarer in every region (4 to 13 of 16 clear the cut
across the six fixture worlds), so collectively they take 14–30% of components. Taking the max over
two to six components then inflates that to 31–74% of artefacts. A fixed cut over the situation
quantity alone would stamp `elite` across most of Thalassar's record, which is the failure doc 11
§2.9 names on the decoration side, arriving from the material side.

## Finding 2: a trading culture's routine imports rank as its most precious materials

Thalassar authors `tradeOpenness` 0.8 and three trade flows. Bronze, iron, gold and obsidian all sit
at `trade-only`, so the quantity ranks its everyday imported bronze (6.0) above its own scarce
silver (4.8). In a closed culture a traded material is exotic; in an open trading economy it is the
ordinary metal. `PhaseCharacteristics.economy.tradeOpenness` (doc 05 §3.2: "Affects foreign material
availability") is modelled and read by nothing, the state `stratification` was in before this spike.
2GN.143's reopen condition ("provenance earns an independent term the day trade flows carry distance
or intensity") has arrived from the culture side rather than the flow side.

## Finding 3: `absent` inverts to infinity and can be assigned

`SCARCITY_WEIGHT['absent']` is 0, so its reciprocal is unbounded. `assignMaterial`'s empty-candidate
fallback uses the unfiltered compatible set when availability excludes everything, so an `absent`
material can reach an artefact. The inversion needs a defined value there.

## The ruling

**Stratification enters at stage 6 as a per-artefact stratum draw, in this task.** `assignMaterials`
draws whether the artefact is made for the elite stratum, with probability rising with
`society.stratification`. An elite-stratum artefact has the selection weight of every material at or
above the standing cut boosted; a commoner-stratum artefact has them suppressed. Prized materials
then concentrate in a minority of a stratified culture's output and spread thinly through a flat
one, which is the distribution the real record shows. The classifier infers `elite` from the
material the way a scholar does, and doc 11's "few elite-tagged artefacts in a flat culture" comes
from the world. No classifier-side stratification gate is needed for materials; 2GN.96's gate is
re-scoped to decoration (see Consequences). The draw modulates prized-material weights only;
extending the same stratum to the decoration budget is 2GN.96's to take up.

**The threshold is fixed over the situation quantity, re-ruling the percentile for materials only.**
`decorativeComplexity` is a raw count that means nothing until compared with the culture's own
output, so sampling it is right. `availability⁻¹ × affinity` is already normalised by the culture's
geology and opinion; percentiling it a second time removes the signal, since a culture whose gold is
scarce and prized would find its p75 boundary inside "bone and oak". The decoration rules keep their
percentiles. The cut is chosen by measurement once the stratum draw exists, and recorded with the
realised rate, as 2GN.82 did.

**Availability inverts as the reciprocal of `SCARCITY_WEIGHT`**: abundant 1, available 1.67, scarce
4, trade-only 6.67. One table, and the rung ratios 2GN.84 pinned as load-bearing carry over. An
unmodelled level reads `available`, as `explainMaterialWeight` does. `absent` is capped at
`trade-only`'s value: a material present despite being absent from the region and unreached by trade
is at least as exotic as a traded one, and the reciprocal's infinity is a division artefact.

**A `trade-only` material's inverted availability is tempered by `tradeOpenness`**: it lerps from
the trade-only reciprocal at openness 0 towards the `available` reciprocal at openness 1.
Thalassar's imported bronze drops from 6.0 to 2.4; a closed culture's rare import at openness 0.4
stays near 4.2. The selection weight is unchanged for now, since changing `scarcityWeight`'s
trade-only rung moves every material calibration pin on the generation side and is a task of its
own.

**Collapse is max over structural components.** The most prized material present sets the artefact's
standing, matching the "most-loaded value present" policy the perforation, ring-gap and curvature
families already use. A gold pommel on an iron blade reads gold. The made-of versus fitted-with
distinction (solid gold cup against gold-fitted sword) is a share question and is left to 2GN.72
(which component supplied the value) and 2GN.119 (whether conditions read component relations at
all). Decorative-layer materials are 2GN.68's separate field.

**The per-material number is computed in `materials.ts` and carried on `MaterialAssignment`.** A
`materialStanding(material, culture, phase, geology, trade)` function;
`assignMaterialWithProvenance` stamps the result as `MaterialAssignment.standing`; `extractFeatures`
gains an `assignments` parameter and takes the max. `extractFeatures` stays free of world context,
which is the reason doc 11 §2.9 widened `ClassificationRule.condition` rather than the extractor,
and 2GN.68 reuses the same function for layer materials.

## Constants, as measured

Swept 2026-09-15 over the four Explorer presets at n=400 each, with the trade lerp in place.

| constant                      | value | what moved it                                                                                                                                                                                                                                                              |
| ----------------------------- | ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `STANDING_CUT`                | 3     | Sits between an open-trade import at neutral affinity (2.67 at openness 0.8) and the same import prized at 1.2 (3.2); among a trading culture's imports the culture's opinion decides. Cut 4 would drop Thalassar's gold and Xoconahtl's jade (2.2 affinity, `available`). |
| `ELITE_SHARE_CEILING`         | 0.4   | `P(elite) = 0.4 × stratification`, so the presets land between 16% and 34% elite artefacts.                                                                                                                                                                                |
| `ELITE_PRIZED_BOOST`          | 3     | Elite artefacts carry a prized material 64% (tarpan, 2.1 parts) to 98% (khaltiris) of the time.                                                                                                                                                                            |
| `COMMONER_PRIZED_SUPPRESSION` | 0.05  | Commoner artefacts carry one 3% to 9% of the time. Fixed, not scaled to stratification: see below.                                                                                                                                                                         |

Realised per-artefact rate of the classification rule: tarpan 12% (stratification 0.4), thalassar
26% (0.6), xoconahtl 31% (0.6), khaltiris 35% (0.85). The rate tracks stratification through the
world rather than through a gate.

**Why the commoner suppression is fixed rather than scaled to stratification.** A commoner factor
that reaches 1 at stratification 0 puts prized material in 41% to 87% of an egalitarian culture's
artefacts (the generator's own baseline), and below stratification 0.5 fewer than half the artefacts
carrying a prized material were made for the elite. The classifier would then need a stratification
gate to stop reading commoner goods as elite, which is Finding 1 over again. Under fixed suppression
the posterior stays above 60% from stratification 0.2 up, and an egalitarian culture carries prized
material in 4% to 11% of artefacts. That figure is nearer a real assemblage than the baseline is:
the catalogue is sixteen materials with half of them scarce or rarer in every region, and taking the
max over six components finds one in most artefacts. Scarce means scarce; commoner goods rarely
carry it in any society.

**A prized material concentrates.** Thalassar's `{ id: 'gold' }` and `{ id: 'silver' }` entries
at 1.2 now _lower_ the two materials' share of the whole metal record (35.2% against 46.4% with the
class entries alone) while raising it inside elite artefacts, because the entries push both
materials over the cut and the commoner majority then avoids them. That is Varna's pattern and the
intended world. `materials.calibration.test.ts`'s resolver guard measured the whole-record share and
was rewritten to draw unmodulated through `assignMaterial`, since it tests most-specific-wins rather
than the stratum.

**The fixture worlds over-fire.** `calibration.test.ts` pins the rule at 45.7% overall (16% in
`highlandMine`, 66% in `coastalPort`): `mockCulturalProfile` faces six geologies that place 9 to 12
of 16 materials at scarce or trade-only, and a component whose `allowedMaterialTags` admit only
prized candidates draws one whatever the stratum. The presets' 12% to 35% is the figure that
describes an authored culture.

## Rejected alternatives

**Stratification as a multiplier inside standing with a fixed threshold.** Works arithmetically
(gold at trade-only × 1.2 × 0.4 = 3.2 against × 0.85 = 6.8) and needs no sampling. Rejected because
it leaves the material record itself unchanged: a flat culture would still have prized materials
spread through 60% of its artefacts, with the classifier told to ignore them. Simulation Honesty
(doc 02) wants the distribution in the world.

**Stratification as a rung selector.** Percentile kept; stratification picks the `PERCENTILE_LADDER`
rung (p75 / p90 / p95). The most literal reading of doc 11's intent, rejected for the same reason:
it tunes the reading of a record that does not reflect the society.

**Stratification as a classifier gate via 2GN.96, with 2GN.27 shipping the quantity only.** The
cheapest path and the one that reproduces Finding 1 in production until M3.

**A fresh linear inversion table (1 / 2 / 3 / 4).** Decouples standing spacing from selection
spacing at the cost of a second pinned table. Under the reciprocal a strongly favoured scarce
material (1.5 × 4 = 6) ranks below an indifferent traded one (6.67); under linear spacing it ranks
above. The tempered trade term makes the reciprocal ordering acceptable (an indifferent import in an
open culture no longer outranks anything), so the second table is not needed.

**Percentile over the situation quantity, as previously ruled.** Fires at roughly `1 - p` in every
culture regardless of geology, and the quantity takes only 9 to 12 distinct values per preset, so
`>=` at a ladder rung admits whole tie blocks. Both defects follow from percentiling a number that
is already culture-relative.

## Consequences

- `engine/generation/materials.ts`: `materialStanding()`, `STANDING_BY_LEVEL` (reciprocal, `absent`
  capped), the trade-openness lerp, the stratum draw in `assignMaterials` and its three constants
  (elite share ceiling, elite boost, commoner suppression), all MVP-provisional per the 2GN.8
  precedent and pinned by calibration.
- `types/artefact.ts`: `MaterialAssignment.standing`; `ExtractedFeatures.materialStanding`; the
  `preciousMaterialsInDecoration` JSDoc points at `materialStanding()` rather than restating the
  formula.
- `engine/generation/classification.ts`: `extractFeatures(artefact, layers, assignments)`; the four
  production callers (`baselines.ts`, `tagInspector.ts`, `ruleCalibration.ts`,
  `calibration.test.ts`) already hold the assignments.
- `data/classification.ts`: one new rule reading `materialStanding`, appended so existing indices
  hold; the relative/absolute count in the module JSDoc moves.
- ⚠️ Calibration-shifting, done: the stratum draw changes which materials artefacts receive, so
  `EXPECTED_TAG_SHARES`, `EXPECTED_INTRA_TAG_SHARES` and `EXPECTED_PROVENANCE_MIX` re-recorded with
  the drift annotated (trade-only and scarce materials lost share in the commoner majority; where
  one leaf of a tag is prized and its sibling is not, the sibling takes the tag: `coastalPort` oak
  68.5 → 93.6). `EXPECTED_FIRE_RATES` gained the new rule; R1–R38 came back bit-identical and
  R39–R43 moved under 0.3pp, left as recorded.
- `materials.calibration.test.ts`'s resolver guard draws through `assignMaterial` with no stratum
  (see "Constants, as measured").
- Doc 11 §2.9: the stratification paragraph and the 2GN.143 formula block are restated; doc 05 §7
  gains the stratum draw and `MaterialAssignment.standing`; doc 05 §9.1 gains `materialStanding`.
- Roadmap: 2GN.68's note now reads "call `materialStanding()`"; 2GN.96 is re-scoped to decoration
  and the stratum draw's extension to the decoration budget; a follow-up is filed for
  `scarcityWeight`'s trade-only rung reading `tradeOpenness` on the selection side.

## Reopen conditions

Trade flows carrying distance or intensity (2GN.143's condition) would let the trade term read the
flow rather than the culture's openness. A `stratum` becoming a recorded fact on the artefact
(rather than manifesting only through its materials) is worth revisiting when the contradiction
system needs to check a scholar's "made for the elite" claim against ground truth; `groundTruthTags`
carries that today.
