# 2GN.137 — The Plausibility Re-Expansion Attempt Cap

| Prop        | Value                                                                                       |
| ----------- | ------------------------------------------------------------------------------------------- |
| Status      | Ruled; constant shipped, loop still 2GN.16's                                                |
| Ruled       | 2026-08-25                                                                                  |
| Implemented | 2026-08-25 — `MAX_PLAUSIBILITY_ATTEMPTS` in `data/plausibility.ts`, calibration guard test  |
| Ruling in   | This document; propagated to doc 11 §2.19 and doc 12 §2.54                                  |
| Outcome     | N = 20, measured against a 43.3% worst-cell failure rate; the rate itself filed as a defect |

## The question

Doc 05 §6.2 and §14 fully specify what happens when Stage 5 plausibility fails: re-expand from Stage
4 up to N attempts, then throw a typed `PlausibilityExhaustedError` with no fallback artefact. Both
docs use "N" as a literal placeholder. 2GN.16 builds the loop and cannot without the number.

The brief asked for it measured rather than guessed: sample the per-attempt failure rate over seeds
with `checkPlausibility` and pick the N that bounds exhaustion at an agreed tolerance.

## Method

Stages 4–5 only (`expandGrammar` → `normaliseArtefact` → `checkPlausibility` against the six shipped
`PLAUSIBILITY_RULES`), 5000 seeds per cell, seven cells: the four Explorer presets plus the default
fixture profile at `craftSpecialisation` 0.1, 0.5 and 0.9. Materials and decoration never enter the
verdict, so they were not run.

A second pass simulated the loop itself: one continuing PRNG stream per artefact, counting attempts
to first pass, to check whether attempts are independent.

## Finding 1: the failure rate is high and strongly cell-dependent

| Cell        | Per-attempt failure | Dominant rule                                         |
| ----------- | ------------------: | ----------------------------------------------------- |
| xoconahtl   |           **43.3%** | wrapped join on a component no flexible material fits |
| khaltiris   |               32.3% | heavy component on a thin-walled hollow form          |
| thalassar   |               31.6% | wrapped join                                          |
| craft = 0.9 |               27.3% | heavy on thin-walled hollow                           |
| craft = 0.5 |               18.0% |                                                       |
| tarpan      |               15.4% |                                                       |
| craft = 0.1 |               13.2% |                                                       |

Doc 05 §6.2 says "grammar expansion is fast; re-rolling is cheap", which is true of the cost per
roll and misleading about how many rolls happen. At the worst cell nearly half of all expansions are
discarded.

## Finding 2: attempts are independent, so exhaustion is `p^N`

The empirical attempts-to-pass histogram matches the geometric model exactly. At xoconahtl, 75 of
5000 artefacts needed more than 5 attempts (1.5%; predicted `0.433^5` = 1.5%), one needed more than
10 (predicted 1.2, observed 1), none needed more than 15. So the per-artefact exhaustion probability
is `p^N` with `p` the cell's per-attempt rate, and N is chosen against the worst cell.

| N  | P(exhaust) per artefact, p = 0.433 | Careers of 500 artefacts hitting the error |
| -- | ---------------------------------: | -----------------------------------------: |
| 10 |                             2.3e-4 |                                        11% |
| 15 |                             3.6e-6 |                                       0.2% |
| 20 |                             5.4e-8 |                                     0.003% |

## Finding 3: two rules reject structure the grammar rolls blind

The wrapped-join rule (2GN.15) and the rigid-shaft rule reject a join type or a head placement that
`expandGrammar` chose without reading `allowedMaterialTags`; the grammar rolls a `wrapped` join onto
a component whose only permitted materials have `rigidity > 2`, then Stage 5 throws the whole
artefact away for it. This is a generator inefficiency, not a rule defect: the rules are right and
the grammar is uninformed. It is also exactly the "grammar and rule set disagree" condition doc 05
§14 says exhaustion is meant to surface, happening at a rate too low to exhaust and too high to
ignore.

Fixing it in the grammar changes the draw sequence and moves every calibration pin, so it is filed
as its own task (2GN.145) rather than done here.

## Ruling

**N = 20.** Ruled by Jason 2026-08-25 from the three candidates above. Reasoning:

1. The cost of a large N is nil in compute (twenty expansions are still sub-millisecond) and the
   only argument against it is that retrying past a defect hides the signal. At 5.4e-8 the signal is
   not hidden: any exhaustion actually observed at N = 20 is a grammar/rule disagreement, never bad
   luck, which is the reading doc 05 §14 needs.
2. It survives a future rule pushing the worst cell to 50% (`0.5^20` = 9.5e-7, still under the 1e-6
   per-artefact tolerance adopted here), so the constant does not need re-ruling every time a
   plausibility rule lands.
3. Once 2GN.145 lands, `p` drops and the cap becomes conservative, which is the right direction for
   a constant that guards a player-facing error.

Shipped alongside: `MAX_PLAUSIBILITY_ATTEMPTS = 20` and `PLAUSIBILITY_FAILURE_CEILING = 0.5` in
`data/plausibility.ts`, with `plausibility.calibration.test.ts` asserting every Explorer preset
fails under the ceiling and that `0.5^N` stays under 1e-6. A rule that breaches the ceiling fails
the guard rather than silently eroding the bound.

## Rejected alternatives

**N = 10.** Eleven percent of careers would hit the error at today's worst cell. Only defensible
after 2GN.145 lands, and ruling a constant against a fix that has not shipped is the 2GN.87 mistake.

**N = 15.** Meets the tolerance today with no headroom: a worst cell at 0.55 gives 1.3e-4 per
artefact. Fine for the current rule set, fragile against the next one.

**Derive N per cell from its measured `p`.** Rejected as over-engineering a constant: it would need
the failure rate sampled per culture-phase at world generation, for a number that never needs to be
tight.

## Wider lesson

"Cheap" was doing two jobs in doc 05 §6.2: cheap per roll and cheap in aggregate. Measuring the
second exposed a generator inefficiency nobody had reason to look for while `checkPlausibility` had
no production caller. The first calibration of a loop is often the first time its inputs' real
distribution gets looked at.
