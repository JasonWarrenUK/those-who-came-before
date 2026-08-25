# 2GN.134 — Should Cultural Affinity Gate Substrate Access?

| Prop        | Value                                                                                          |
| ----------- | ---------------------------------------------------------------------------------------------- |
| Status      | Ruled; unimplemented (lands in 2GN.129)                                                        |
| Ruled       | 2026-08-25                                                                                     |
| Implemented | —                                                                                              |
| Ruling in   | This document; propagated to doc 11 §2.20 and doc 12 §2.56                                     |
| Outcome     | No. Substrate gate reads availability only, with an authored affinity of 0 kept as a hard gate |

## The question

`materialAccessGate` (`engine/generation/decoration.ts`) decides whether a culture can plausibly use
a technique at all, crushing it to `MATERIAL_ABSENT_GATE = 0.05` otherwise. For techniques with a
material substrate it requires at least one qualifying material that is both obtainable
(`isAvailable`) and favoured: `culturalAffinityWeight(material, culture) > 1`, strictly better than
neutral.

Under the 2GN.127 ruling every obtainable material must carry an authored affinity, so presets now
state indifference (`1.0`) or mild dislike (`0.7`, `0.8`) for materials they have in abundance. The
gate reads that preference as absence: xoconahtl's `['clay', 1.0]` against `abundant` clay fails it
identically to a culture with no clay anywhere. 2GN.127 deferred the ruling and 2GN.128 kept the
`1.0` so the evidence would survive. `hasIntroducedMaterialAccess`, the sibling check for materials
a technique _adds_, gates on availability alone and is the contrast case.

## Method

Reproduce the substrate check outside the engine for every (culture, world, technique) triple: four
Explorer presets against their own geology and against each of the six `mockRegionalWorld` fixtures
(28 cells), nine material-substrate techniques of sixteen, 252 pairs. Evaluate three predicates on
affinity: today's `> 1`, `>= 1`, and availability-only. Then switch the live gate to
availability-only and run the full suite to measure recalibration cost, reverting afterwards.

## Finding 1: the gate suppresses 28 pairs, every one a material the culture has

| Predicate         | Pairs gated | Flips vs today | Who flips                                                                                                                        |
| ----------------- | ----------: | -------------: | -------------------------------------------------------------------------------------------------------------------------------- |
| `> 1` (today)     |          28 |              — |                                                                                                                                  |
| `>= 1`            |          17 |             11 | xoconahtl glaze (all worlds), xoconahtl painting@desertMargin, thalassar patina/engraving/inlay@forestInterior (oak, ash at 1.0) |
| availability-only |           0 |             28 | the above plus tarpan glaze (clay 0.7) and khaltiris glaze/patina/engraving/inlay (clay 0.8, oak/ash 0.9)                        |

Every gated pair has the substrate material obtainable. The 18 pairs `>= 1` leaves gated are
cultures with a _mild dislike_: tarpan at clay 0.7 loses glaze at 0.05× for having a preference.
`>= 1` rescues the literal 1.0 case and leaves the same collapse for every value under it.

## Finding 2: affinity's effect already happens downstream

The component a decorative layer sits on received its material from `assignMaterials`, where
`culturalAffinityWeight` weights the draw. A culture at clay 0.7 makes fewer clay things, so fewer
things are glazeable, so glaze appears less often. That is the effect affinity should have and it is
realised before the gate runs. The gate applies the same preference a second time, as a cliff rather
than a slope. `hasIntroducedMaterialAccess`'s JSDoc already states the principle for the other
check: a culture "doesn't need to favour metal generally to use it decoratively, only to be able to
get some".

## Finding 3: recalibration cost is two tests, no pin

With the live gate switched to availability-only, 758/760 pass. No entry in `EXPECTED_FIRE_RATES`,
`EXPECTED_THRESHOLDS`, `EXPECTED_MEAN_GRADE_BY_REGION`, `EXPECTED_TAG_SHARES` or
`EXPECTED_PROVENANCE_MIX` leaves tolerance. The two failures:

1. `decoration.test.ts` "material gate — a culture with no plausible engravable material is
   suppressed": its fixture is `materialAffinities: []` against a geology that _has_ engravable
   material. It tests the affinity gate, not availability, and its own comment says so. Rewrite to
   fixture an absent geology, which is what the test name claims.
2. `calibration.test.ts` R43 regional-spread guard: spread across `EXPECTED_MEAN_GRADE_BY_REGION`
   narrows from 4.0pp to 2.7pp against a 3pp floor. forestInterior (13.7%) was the outlier because
   thalassar and khaltiris had patina/engraving/inlay gated there over oak and ash at 0.9–1.0;
   opening them brings it toward the others. The per-region rates themselves stay within tolerance.
   The floor needs re-justifying at implementation, either lowered with the narrowing annotated or
   the pins re-recorded and a new spread stated.

No preset authors an affinity of 0, but the type permits it and `weightedSelect` clamps 0 to
never-assigned, so an authored zero is a declared "never" and stays a hard gate.

## Ruling

**Affinity does not gate substrate access.** `materialAccessGate`'s substrate check becomes
availability plus `culturalAffinityWeight > 0`, matching `hasIntroducedMaterialAccess`. Ruled by
Jason 2026-08-25.

Implementation lands inside 2GN.129 rather than as its own task: that task already names the gate as
its own to fix and extends the same silence rule to `techniqueAffinities`, so the two changes share
one recalibration pass. Its deliverables now include the test-fixture rewrite and the R43 floor
decision from Finding 3.

## Rejected alternatives

**`>= 1`.** Fixes only the case 2GN.127 happened to catch. Finding 1 shows the defect is the
predicate's shape, not its threshold.

**Keep `> 1`, re-author presets past it.** 2GN.127 already refused this: it edits showcase content
to fit an engine defect, and the 3WS.x culture generator would inherit the bug with no preset to
warn it.

**Graded gate (scale the technique weight by affinity rather than cliff it).** Double-counts
affinity, which Finding 2 shows is already applied at material assignment.

## Wider lesson

The same map was read as "access" by one function and "preference" by every other. 2GN.127's rule
that silence means inaccessible made the two readings collide, because it forced cultures to state
preferences for everything they could reach. A gate that reads a preference table should say which
reading it takes, and `hasIntroducedMaterialAccess` had already said it a hundred lines away.
