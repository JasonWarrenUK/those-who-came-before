# 2GN.132 — Where Sublayer Generation Lives

| Prop        | Value                                                                                                            |
| ----------- | ---------------------------------------------------------------------------------------------------------------- |
| Status      | Ruled; unimplemented (lands in 2GN.31)                                                                           |
| Ruled       | 2026-08-25                                                                                                       |
| Implemented | —                                                                                                                |
| Ruling in   | This document; propagated to doc 11 §2.21 and doc 12 §2.57                                                       |
| Outcome     | Separate pass with its own PRNG stream, after materials are assigned, wired into the sampled path in the same PR |

## The question

`DecorativeLayer.sublayers` (doc 05 §8.3, decoration on decoration) has no producer:
`expandDecoration` emits `sublayers: []` for every layer. 2GN.31 builds the producer and 2GN.131
rules the depth cap. This spike rules whether the producer runs inside `expandDecoration`'s existing
component → category → slot loop, as a recursive draw per selected layer, or as a separate pass over
the flat list the loop already returns.

The task notes framed the cost as determinism: in-loop draws shift `expandDecoration`'s draw
sequence for every artefact, which was expected to move every calibration pin, versus a post-pass
that leaves the sequence alone but risks the `assignDecorativeDetails` precedent of code nothing
calls. They also cite a `BLOCKED.md` at the repo root that does not exist.

## Method

1. Insert one extra `prng()` draw per selected layer inside the slot loop, the minimum a sublayer
   roll would cost, and run the calibration, regression, classification and materials suites.
2. Fingerprint `expandDecoration`'s output for 1200 seeds (four presets × 300) with and without the
   extra draw, to confirm the perturbation is real.
3. Trace what a sublayer draw needs to know and when the pipeline knows it.

## Finding 1: sequence perturbation moves no pin

With the extra draw in place, 63/63 tests pass: nothing in `EXPECTED_FIRE_RATES`,
`EXPECTED_THRESHOLDS`, `EXPECTED_MEAN_GRADE_BY_REGION`, `EXPECTED_TAG_SHARES` or the
`statistics.regression` p75 pin leaves tolerance.

The perturbation is real: 1114 of 1200 seeds produce a different layer list, and total layers move
12790 → 12771 (0.15%). The pins are distribution guards with tolerance bands; reshuffling which
artefact a seed yields leaves the distribution alone. So the axis the notes chose does not separate
the options. Sublayers will move pins under either placement, for the genuine reason that nested
layers raise `maxDepth` and with it `techniqueComplexity`, R39/R40's thresholds and the
`classification.test.ts` 2GN.31 regression guard, which re-record once against the new distribution.

## Finding 2: a sublayer's substrate is its parent, which the loop cannot see

Paint over gilding sits on gold; engraving on an inlaid bone element cuts bone; a patina over a
surface treatment sits on the component's own material. The substrate of a sublayer is therefore
either the parent's introduced material (`assignDecorativeDetails`) or the component's assigned
material (`assignMaterials`), and both run after `expandDecoration` by design. This is the ordering
2GN.99 already hit for grading and resolved by moving `computeLayerGrade`'s material sensitivity
into a separate `gradeDecorativeLayers` pass.

An in-loop sublayer draw would roll with no substrate knowledge and rely on `enforceSubstrates` to
strip what proves impossible afterwards, which both wastes draws and makes the depth cap (2GN.131) a
cap on attempts rather than on surviving layers. A pass that runs after materials are known can gate
the sublayer's substrate at draw time through `materialAccessGate`'s existing machinery.

## Finding 3: wiring is orthogonal to placement

The notes' worry about the post-pass shape was that `assignDecorativeDetails` shipped unwired and
nothing calls it. That is a wiring decision, not a placement one. The calibration harness
(`calibration.test.ts`) and the Explorer (`decorationLayers.ts`, `tagInspector.ts`) already seed
each stage from its own stream: `createPrng(seed)` for the grammar, `${seed}-decoration`,
`${seed}-materials`. A `${seed}-sublayers` stream is the established shape, and wiring it into both
sampled paths in the same PR as the producer is what makes the pins re-record once.

## Ruling

**Separate pass, own PRNG stream, wired in the same PR.** Ruled by Jason 2026-08-25.

- 2GN.31 ships
  `expandSublayers(layers, assignments, details, culture, phase, geology, trade,
  prng, materials?, techniques?)`
  (name provisional) as a pure function over the flat list, mirroring `gradeDecorativeLayers`'
  signature shape.
- Pipeline position: after `assignMaterials` and `assignDecorativeDetails`, before
  `gradeDecorativeLayers` and `enforceSubstrates`, so sublayers are graded and substrate-checked by
  the passes that already recurse into `sublayers`.
- Stream: `${seed}-sublayers`, seeded by the caller like every other stage.
- Substrate for a sublayer: the parent's introduced material where the parent's technique introduces
  one, otherwise the parent's target component's assigned material.
- `expandDecoration` is untouched; its draw sequence and JSDoc contract stand.
- The same PR wires the pass into `calibration.test.ts`'s sample loop and both Explorer sample
  paths, and re-records the pins that move, with the drift annotated. The 2GN.31 regression guard in
  `classification.test.ts` is retired by that PR, as its own comment anticipates.
- Depth cap: whatever 2GN.131 rules; this ruling only fixes where it is applied.

## Rejected alternatives

**Inside the slot loop.** Finding 2: cannot gate substrate at draw time. The determinism cost the
notes feared is real per artefact and nil per pin (Finding 1), so it was never the reason.

**Separate pass, shipped unwired.** Repeats the `assignDecorativeDetails` precedent and leaves the
pins to re-record twice (once when wired, once when the cap lands). Finding 3 makes wiring cheap.

## Wider lesson

"Moves the draw sequence" and "moves the calibration pins" were treated as one claim. They are two:
the first is about which artefact a seed yields, the second about what the population looks like.
The guards in this repo pin the second. A sequence change is a snapshot concern, and no snapshot
test exists for `expandDecoration`, which is why the measured cost was zero.
