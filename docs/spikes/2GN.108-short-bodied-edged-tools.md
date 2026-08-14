# 2GN.108 — Should the Vocabulary Express a Short-Bodied Edged Tool?

| Prop      | Value                                                                              |
| --------- | ---------------------------------------------------------------------------------- |
| Status    | Ruled                                                                              |
| Ruled     | 2026-08-13                                                                         |
| Ruling in | This document; propagated to doc 11 §2.11 and doc 12 §2.43                         |
| Outcome   | Form ruled in; `bladeLengthBand` re-based on grip-to-edge; orientation by reversal |

## The question

2GN.87 deleted R4 as unsatisfiable and deliberately declined to decide whether the generator
_should_ produce the form R4 described: a short-bodied edged tool that is not a formed blade —
scraper, chisel, small adze. Those are among the commonest finds in a real assemblage, but R4 was
authored in PR #37 review to plug a truth-table cell, with the archaeological reading attached
afterwards, so nothing about the deleted rule constituted a decision to model them. The question was
left open rather than inherited.

If ruled in, this spike also had to rule the mechanism. Three candidates were carried over from
2GN.87: a shorter `elongated.length` rung below `short`; decoupling `bladeLengthBand` from the
shared cm table so it bands the component's own proportion; or changing `deriveDimensions` so
`primaryExtent` is not a plain `Math.max`.

## Finding 1: the gap is a tag-space defect, not a completeness one

The framing in the roadmap task was archaeological — these are common finds, so their absence is a
content gap. That case is real but weak on its own; the game owes the player variety, not an
accurate excavation record.

The stronger case is that the missing shapes are **not uniformly distributed across the tag space**.
Short-bodied edged tools occupy the working/craft/domestic region. Losing them does not thin the
corpus evenly: it removes one region, so edged artefacts skew towards blade-family readings (dagger,
utility knife, weapon), because a long-axis edged form is the only edged form the generator can
produce and those are the only readings it supports.

That skew propagates. The culture's tag profile inherits it, and the lens feeds on tag co-occurrence
(doc 04) — so the player meets the same associations repeatedly. The defect surfaces as **repetition
in the core mechanic**, not as a missing artefact type.

This interacts with §2.9's ruling in a way worth stating. Status tags are now scored against a
per-culture-phase baseline, sampled empirically. If the underlying shape distribution is
structurally narrow, the baseline is computed over a narrow distribution too: culture-relativity
cannot restore variety that was never generated. The narrowing happens **upstream** of the machinery
designed to produce variety.

## Finding 2: all three candidate mechanisms treat symptoms

`bladeLengthBand` and `primaryAxisLength` both read absolute centimetres off `SHORT_MEDIUM_LONG_CM`,
which is why 2GN.87 measured the joint distribution as a strict triangle in which blade never
exceeds axis. Each candidate mechanism addresses one arm of that coupling and leaves the other
standing.

The deeper problem is that **`bladeLengthBand` bands the wrong quantity**. Absolute blade length
does not distinguish the forms in question:

- A **scraper** is a short working edge on a short body — nearly all blade, almost no handle.
- A **dagger** is also edge-dominant, but long.
- A **hafted adze** is a long body with a short edge at one end — low edge-to-body ratio.

What separates these is **proportion**, specifically the span between the edged component and where
a hand would hold it. Absolute cm banding has no channel for it. So the triangle is a symptom of
measuring the wrong thing, and any mechanism that only decouples the two bands leaves
`bladeLengthBand` still reporting a quantity that cannot express the distinction.

## Finding 3: grip-to-edge is derivable today — no role vocabulary needed

`data/plausibility.ts` states outright that the model lacks a role concept:

> MVP grip proxy: whether the artefact has a second component beyond the edged form itself. A true
> grip/haft concept needs a component-role vocabulary this project doesn't have yet.

All three plausibility rules are proxies of that shape. `hasGrippableSecondComponent` counts
components. `hasAdequateGripLength` looks for _some other_ medium-or-long `bar-form`/`elongated`
component, its own comment conceding that a `disc-form` elsewhere on the artefact "says nothing
about grip length" — it cannot tell where a component sits, only that it exists. `hasRigidShaft`
accepts any rigid `sheet-form`/`bar-form` regardless of whether it bears the load.

This initially read as a blocker: the proportional quantity appears to need roles, and roles do not
exist. **It is not.** `NormalisedArtefact` already carries an `attachments: Attachment[]` graph with
typed from/to component links, and `NormalisedComponent` carries `position` plus per-component
extents via `extractComponentExtents`. `grammar.ts` populates both. Grip-to-edge span is therefore a
**traversal**: locate the edged component, walk the attachment graph away from it, sum major extents
along the path. The structure needed already exists; the proxies simply never used the graph they
had.

⚠️ Two corrections to claims made while scoping this spike, recorded so they are not repeated:

- Doc 05 does **not** specify a role vocabulary. `arrangementGroup` is repetition structure
  (`symmetric`, `radial`, `linear-array`, …), unrelated to role.
- The `'grip-system'`/`'head-system'` strings in `types/interpretation.ts` are JSDoc illustration,
  not a defined type. A role vocabulary would be genuinely new, not specified-but-unwired.

## Finding 4: `position` is intended as an oriented axis but is not one

The root cause sits below all of it. `position` is documented in doc 05 §6.1 as "Ordering along
primary axis", and the intent is that it carries a **shared direction across all artefacts using the
same dimensional axis** — working end at one pole, grip end at the other, consistently.

`grammar.ts` mints it as a depth-first traversal index, primary-before-attachments — the order the
grammar tree happened to expand in. That order reflects expansion, not physical convention. A blade
can land at position 0 with its haft after it, and nothing rejects or reverses it. The invariant is
**intended but unenforced**, which is precisely why the grip proxies had to guess.

So normalisation must **orient** the artefact, not merely flatten it. This is a third symptom of the
same family 2GN.86 and 2GN.87 documented: a derived quantity presented by its type as carrying more
meaning than its derivation actually establishes.

## Ruling

**1. The form is ruled in.** The generator should express short-bodied edged tools. Grounds:
tag-space variety, not archaeological completeness (Finding 1). The gap thins one region of the tag
space, skewing culture tag profiles and giving the lens repetitive co-occurrences to feed on — and
§2.9's culture-relative baselines cannot compensate, because they sample the same narrowed
distribution.

**2. `bladeLengthBand` is re-based on grip-to-edge proportion**, not absolute centimetres. It bands
the span between the edged component and the grip position, traversed over the `attachments` graph
(Finding 3). This supersedes all three candidate mechanisms carried over from 2GN.87, each of which
treats a symptom of the coupling rather than the miscast quantity beneath it.

**3. Normalisation orients the artefact, by reversal.** Orientation is canonicalised at
normalisation time so the working end always sits at the same pole, rather than blade-before-grip
being rejected as a plausibility violation.

Reversal beat rejection because **a mirrored artefact carries no information** — it is the same
artefact described backwards. Rejecting it spends re-expansion budget (2GN.16) to enforce
probabilistically what construction can guarantee, and would discard roughly half of otherwise-valid
two-part edged forms by chance. Reversal makes the invariant true by construction.

**4. No role vocabulary is required for this ruling.** Grip-to-edge is derivable from existing
structure (Finding 3). Roles remain the honest fix for the _other_ proxies — `hasRigidShaft` cannot
express load-bearing from the attachment graph alone — but that is a separate question, filed as
2GN.116, which 2GN.13 and 2GN.14 now depend on.

**5. The general working-end definition is deferred to 2GN.115.** Reversal needs a pole rule. For
edged forms the working end is the edge; for a hafted head it is the head; for a vessel, disc, ring
or pin there may be no functional pole at all. Whether orientation is total (needing a pole rule for
shapes without a working end) or partial by design (only artefacts with a distinguishable functional
pole are oriented, the rest left unoriented as `bladeLengthBand` already reports `'none'` for
edgeless forms) is ruled there.

⚠️ 2GN.115 **blocks implementation, not this ruling.** Reversal cannot be implemented for edged
forms and retrofitted to a different general convention without repeating the recalibration sweep.

## Rejected alternatives

**Rule the form out of MVP scope.** Defensible on effort grounds, and it would have voided 2GN.109
cleanly. Rejected because the cost is not the missing artefacts but the tag-space skew they leave
behind, which lands on the lens — the game's core mechanic — rather than on flavour.

**A shorter `elongated.length` rung below `short`.** Works around the coupling by adding a size band
beneath the current floor. Rejected: it leaves `bladeLengthBand` measuring absolute size, so the
scraper/dagger/adze distinction remains inexpressible; and it shifts fire rates set-wide to buy less
than the proportional re-basing does for the same recalibration cost.

**Decouple `bladeLengthBand` from the shared cm table only.** Closer, since it isolates the two
bands, but still bands the component's own absolute length rather than its proportion to the body.

**Change `deriveDimensions` so `primaryExtent` is not a plain `Math.max`.** The 2GN.86 fix applied
to its second symptom. Worth doing on its own merits and likely to fall out of the implementation,
but insufficient alone: it widens the reachable `(axis, blade)` space without making the quantity
meaningful.

**Reject mis-oriented artefacts instead of reversing them.** See Ruling 3.

**Make component roles first-class as part of this ruling.** Scoped out once Finding 3 established
that the attachment graph already suffices. Filed as 2GN.116 to serve 2GN.13/2GN.14 instead.

## Downstream

Implementation is 2GN.117 (blocked on 2GN.115), carrying oriented normalisation and the re-based
`bladeLengthBand` together, plus the recalibration sweep.

⚠️ The sweep is set-wide. 2GN.108 also has three pre-existing dependents — **2GN.67**, **2GN.69**
and **2GN.109** — so sequence the recalibration once across the group rather than per-task. 2GN.109
is the contingent replacement edge-family rule, explicitly void if this spike ruled the form out of
scope: **it is ruled in, so 2GN.109 is live.** The 2GN.79 calibration guard will flag every moved
rule, and `EXPECTED_FIRE_RATES` needs re-recording with the drift annotated.

## Wider lesson

2GN.87 stated the corollary that "when two features are derived from the same underlying quantity,
their types will still present them as independent". This spike extends it one step further:

**A field's documented intent is not a claim about what its derivation enforces.** `position` is
documented as ordering along the primary axis and was consumed as though that ordering were
oriented, but nothing in `grammar.ts` established the orientation — the derivation produced a
traversal index and the JSDoc described an invariant. Three plausibility proxies were then authored
to work around an absence that no measurement had ever named.

Related: doc 12 §2.25's saturating boolean, §2.26's max-over-components mass proxy, §2.39's
unsatisfiable condition.
