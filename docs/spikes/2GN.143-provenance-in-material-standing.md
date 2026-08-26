# 2GN.143 — Provenance's Role in the Material-Standing Formula

| Prop      | Value                                                                                      |
| --------- | ------------------------------------------------------------------------------------------ |
| Status    | Ruled; docs-only                                                                           |
| Ruled     | 2026-08-25                                                                                 |
| Ruling in | This document; propagated to doc 11 §2.9 (formula restated) and doc 12 §2.55               |
| Outcome   | Provenance is implicit in availability; standing reads availability inverted, not `weight` |

## The question

Doc 11 §2.9 states material standing as "availability × cultural affinity × provenance ×
stratification". Provenance (`MaterialAssignment.provenance.source`, from
`deriveMaterialProvenance`) is `local` / `trade` / `unknown`: categorical, so it cannot be a literal
multiplicative term. 2GN.27 and 2GN.68 both compute this quantity and were proceeding on a
three-term reading pending this ruling. The spike asked whether provenance should (a) stay implicit
in the availability term, (b) become an explicit categorical multiplier, or (c) something else.

## Method

For every Explorer preset against its own geology and trade, plus every preset against each of the
six `mockRegionalWorld` fixtures (4 × 7 × 16 materials = 448 pairs), compare
`explainMaterialWeight`'s `level`, `scarcity` and `weight` with `deriveMaterialProvenance`'s
`source`.

## Finding 1: `source` is a coarsening of `level`

| `level`                       | → `source` | count   | scarcity term    |
| ----------------------------- | ---------- | ------- | ---------------- |
| abundant / available / scarce | `local`    | 286/286 | 1.0 / 0.6 / 0.25 |
| trade-only, a flow reaches it | `trade`    | 100/100 | 0.15             |
| trade-only unreached, absent  | `unknown`  | 62      | never assigned   |

The mapping is total and deterministic. Both functions begin from the same
`bestRegionalLevel(material, geology)` and `reachableByTrade(material, trade)` calls; provenance
labels the result, the weight scores it. Nothing in `source` is absent from `level` +
`tradeRescued`, both of which `explainMaterialWeight` already returns.

Mean selection weight by provenance class: local 0.409, trade 0.127, unknown 0.077. That split is
the scarcity term, not a separate signal.

## Finding 2: `weight` is a selection quantity, and standing runs the other way on one axis

Raised by Jason during ruling. `weight` is how likely the culture is to _make_ something from the
material: trade-only scores 0.15, so traded materials are rare in that culture's output. Standing is
the reverse on that axis: rare here means precious here. So standing reads availability **inverted**
(trade-only high, abundant low).

The axes do not all point the same way. Cultural affinity is direct (a culture that prizes jade uses
it more _and_ holds it in higher regard); availability is inverse. A high-affinity abundant material
and a low-affinity traded one can land on the same `weight` while meaning opposite things for
standing. So `weight` as a scalar cannot be the standing score. 2GN.27 and 2GN.68 must compose
standing from the components `explainMaterialWeight` returns separately (`level`,
`culturalAffinity`) plus `PhaseCharacteristics.society.stratification`, never from `weight`.

## Ruling

**(a): provenance stays implicit in availability.** Doc 11 §2.9's formula is restated as

> standing = f(availability⁻¹, cultural affinity, stratification)

with the note that availability's `level` already distinguishes local from traded, and that
`explainMaterialWeight().weight` is a selection weight and must not be used as the standing score.

`MaterialAssignment.provenance` is unchanged. Its job is doc 05 §7.1's: an occluded fact about where
the material came from, for the player to infer and get wrong and for contradiction detection to
check against. That is a different role from a weight term, and it keeps it.

The threshold over the three components remains 2GN.27/2GN.68's to set.

## Rejected alternatives

**(b) Explicit `PROVENANCE_WEIGHT[source]` multiplier.** Multiplies by a function of `level` twice:
a traded material would be marked once by scarcity and again by provenance for the same fact. Only
justified if provenance needs tuning independently of scarcity, and nothing needs that today.

**(c) Leave the four-term wording.** Cheapest and rejected: the next implementer of 2GN.68
re-derives Finding 1, and the direction trap in Finding 2 stays unrecorded.

## Reopen condition

Provenance earns an independent term the day trade flows carry distance or intensity. Then `trade`
splits into near and far, which is a signal `level` does not carry. Nothing models that in MVP; when
it lands, this ruling is revisited rather than extended.
