# 2GN.164: Elite and Ritual Tag Semantics

| Prop      | Value                                                                                                       |
| --------- | ----------------------------------------------------------------------------------------------------------- |
| Status    | Ruled; unimplemented                                                                                        |
| Ruled     | 2026-11-18                                                                                                  |
| Ruling in | This document; propagated to doc 11 §2.24 and doc 12 §2.64                                                  |
| Outcome   | `elite` splits into a social tag read from the stratum and a rank tag `lavish`; `ritual` stays object-level |

## The question

Raised while planning 2GN.44 (excavation composition), whose archetypes want a "workshop with an
anomalous prestige item" and a "settlement with a ritual intrusion". Asking what generation could
actually steer toward those meant measuring the two tags involved. Both turned out to be weaker than
their names suggest, so the planning detour became a spike, run as an interview with measurements
before each ruling.

## What the measurements found

All figures: the four Explorer presets (tarpan, thalassar, xoconahtl, khaltiris), n=300 to 400 per
cell, sampled baselines (`sampleBaselines`), never `emptyClassificationContext`.

**The `elite` tag does not follow stratification.** Doc 11 §2.9 intended that a flat society produce
few elite artefacts and warned that culture-relative normalisation would otherwise give every
culture the same elite proportion. Share of artefacts scoring `elite` at or above 0.8, drawn
stratum:

| Culture   | `stratification` | `eliteShare` | `elite` >= 0.8 |
| --------- | ---------------- | ------------ | -------------- |
| tarpan    | 0.40             | 0.16         | 0.45           |
| thalassar | 0.60             | 0.24         | 0.68           |
| xoconahtl | 0.60             | 0.24         | 0.76           |
| khaltiris | 0.85             | 0.34         | 0.59           |

The most stratified culture sits below two flatter ones. Thirteen rules award `elite` and five of
them compare against a culture-relative percentile (p75 to p95), so they fire at a fixed rate in
every culture by construction. The 2GN.27 stratum draw moves only the materials rule; that ruling
dropped the classifier-side gate after measuring materials alone, and the aggregate tag was not
re-measured.

**The tag barely separates strata.** Share at `elite` >= 0.8 by the stratum the artefact was made
for:

| Culture   | Elite stratum | Commoner |
| --------- | ------------- | -------- |
| tarpan    | 0.57          | 0.43     |
| thalassar | 0.96          | 0.58     |
| xoconahtl | 0.98          | 0.69     |
| khaltiris | 0.90          | 0.41     |

**The stratum draw changes materials only.** `decorativeComplexity` thresholds read identically for
elite, commoner and drawn strata in every preset (for example 0.15 / 0.15 / 0.15 at the commoner p90
in tarpan), because `expandDecoration` fixes decoration quantity before the stratum is drawn. An
elite-stratum artefact differs from a commoner one by material choice alone.

**Material markers alone saturate in material-rich cultures.** Keeping only
`material-standing-prized` and `precious-materials-in-decoration` as the elite signal, the share
firing on commoner artefacts is 0.26 / 0.69 / 0.88 / 0.12 (tarpan, thalassar, xoconahtl, khaltiris)
against elite-stratum 0.74 / 1.00 / 1.00 / 0.98. Roadmap 2GN.147 explains part of this: `gilding`
and `wire-wrapping` are 100% prized in every preset, so the stratum draw has nothing non-prized to
redirect toward.

**`ritual` has two rules, both reading decoration quantity** (`edged-and-decorated-above-p75` and
`decorative-complexity-above-p95`). Its rate does not move with stratum at all (0.14 / 0.14 / 0.14
in tarpan across drawn, commoner and elite) and it scores 0.09 to 0.20 at >= 0.5. Classification
never sees deposition or site type.

## Rulings

**1. Split `elite` into a social tag and a rank tag.** In the archaeological record `elite` is a
claim about who an object was made for or held by, inferred from a cluster of restricted-access
markers (prized or exotic materials, labour investment, grave wealth). It tracks inequality: an
egalitarian society shows a narrow wealth range and a ranked one shows a minority holding most of
it. The existing tag is mostly a rank within the culture's own output. Both meanings are real, so
both stay, as separate tags. Rejected: keeping a single rank-only `elite` and amending doc 11 §2.9
(leaves the flattening doc 11 warned against); a single social-only tag with no rank tag (loses the
rank signal that eleven interpretive description variants foreground). Downsides accepted: sorting
13 rules, reassigning those variants, a second tag that must be named distinctly enough that the
lens does not offer two apparent synonyms. The split's best argument is that mistaking a lavish
object for an elite owner is exactly the kind of interpretive error the game is built on (pillars 1
and 5).

**2. Social `elite` ground truth is the stratum itself.** Mechanisms tried against the measurements:
a commoner-baseline percentile rule (useless, because decoration quantity does not vary with
stratum), material markers only (separate well in khaltiris and tarpan, saturate in thalassar and
xoconahtl), and a stratification weight gate (fixes the share, gives no per-artefact separation).
Reading the drawn stratum directly makes the tag's frequency equal `eliteShare` in every culture by
construction. Materials and decoration remain the player's imperfect evidence, so a commoner holding
prized materials in a rich culture becomes a genuine misreading rather than a classifier artefact.
This follows pillar 3: the stratum is already the datum that drives both materials and decoration.
It is carried as an occluded fact on the artefact (roadmap 2GN.165) and awarded by one rule
(2GN.166).

**3. Stratum-responsive decoration is a separate spike.** No roadmap task makes the stratum drive
decorative volume, complexity or depth; only a note in 2GN.96 calls it "the natural shape". Doc 11
§2.10 (2GN.98) rules volume as `decorativeEmphasis` alone and §2.22 (2GN.131) takes the depth cap
from `craftSpecialisation` and emphasis, so doing it reopens both. Filed as 2GN.169. It blocks the
downstream tasks that consume decoration inputs (2GN.32, 2GN.96) and not this split, since ground
truth now comes from the stratum.

**4. `ritual` stays object-level; ritual context is a graded pure function.** Ritual use is inferred
mostly from context (deliberate placement, foundation deposits, a shrine floor); object features
only support it, and doc 05 §11.2 draws the same line ("the interpretive challenge is contextual").
Two independent axes are needed: a household idol is ritual by object and domestic by context, and
an innocuous pot in a temple is the reverse. Option kept: the object axis is the `ritual` tag and
the context axis is derived once, as a pure function of `Provenance.site.type` and
`context.deposition` returning a graded 0 to 1 strength from an authored table, nothing stored
(roadmap 2GN.168). Neither field says "ritual context" alone (`deliberate-placement` differs between
a shrine and a settlement hearth, and `casual-discard` at a shrine scores low), so the table is
design content. Rejected: classification reading deposition (conflates how something was used with
where it ended up and forces provenance ahead of classification); a stored flag (a second source of
truth that goes stale when the table is retuned and changes the save shape); a boolean (loses the
middle cases that make "offering or forgotten lunch?" ambiguous).

**5. The rank tag is `lavish`.** It describes display of investment and says nothing about the
owner, which is the confusion the split exists to make into a player error. Rejected: `prestige`
(leans social, reads as a synonym of `elite` in the lens), `opulent` (no practical difference),
`ornate` (collides with the existing `ornament` tag). All 13 current `elite` contributions move to
`lavish`, including the two material rules: prized materials are evidence of a lavish object, the
stratum is the truth about who it was for.

## Side findings

- No `idol`, `figurine`, `effigy` or `anthropomorph*` appears in `data/`, `engine/` or `types/`. The
  eight grammar primitives are all geometric, so a household idol is not generable. Filed as
  2GN.170.
- Nothing in the engine reads `craftInvestment.contextWeights` or `siteTypeWeights`.
  Culture-weighted site and deposition choice stays with 2GN.47; 2GN.44 takes the archetype as a
  caller-supplied input.

## Consequences

| Task    | Change                                                                                        |
| ------- | --------------------------------------------------------------------------------------------- |
| 2GN.165 | New: carry the stratum as an occluded fact (breaking: required field on `ClassifiedArtefact`) |
| 2GN.166 | New: the tag split in `classification.ts` and `data/classification.ts` (breaking: vocabulary) |
| 2GN.167 | New: re-measure scholar `TAG_FREQUENCY` and `TAG_COOCCURRENCE_LIFT`                           |
| 2GN.168 | New: `ritualContextOf(provenance)` and its authored table                                     |
| 2GN.169 | New spike: stratum and labour investment; blocks 2GN.32 and 2GN.96                            |
| 2GN.170 | New spike: figural objects                                                                    |
| 2GN.44  | Now depends on 2GN.165; boundary with 2GN.47 recorded                                         |
| 2GN.45  | Now depends on 2GN.166 (ambiguity reads tags whose semantics change); 2GN.46 likewise         |
| 2GN.96  | Re-scoped: its decoration-side `elite` gate is superseded                                     |

Measurement scripts were scratch work and are not kept; the tables above are the record.
