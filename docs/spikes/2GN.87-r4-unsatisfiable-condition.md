# 2GN.87 — R4's Edge-Family Safety Net Catches Nothing

| Prop      | Value                                                               |
| --------- | ------------------------------------------------------------------- |
| Status    | Ruled                                                               |
| Ruled     | 2026-08-11                                                          |
| Ruling in | This document; propagated to doc 12 §2.39                           |
| Outcome   | R4 deleted; generation gap and replacement rule filed as follow-ups |

## The question

R4 (`CLASSIFICATION_RULES[3]`) fired on 0 of 7200 artefacts in the 2GN.86 audit, despite its JSDoc
stating it exists "so no edged artefact leaves the edge family with zero function signal". The
roadmap framed the choice as: fix the grammar, correct the condition, or delete the rule. Sibling
R27 had the same shape and was resolved by 2GN.86's upstream fix; R4 had no equivalent identified.

## Finding 1: the condition is unsatisfiable, not merely unlucky

```text
condition: (f) => f.hasEdge && f.primaryAxisLength === 'short' && f.bladeLengthBand !== 'short'
```

The two length fields read as independent — their types say so, and `ExtractedFeatures`' own JSDoc
distinguishes them ("a short dagger blade mounted on a long haft has a short `bladeLengthBand` but a
long `primaryAxisLength`"). They are not independent.

- `bladeLengthBand` is the dominant edged component's own `length` parameter.
- `primaryAxisLength` bands `dimensions.primaryExtent`, which `deriveDimensions` (`grammar.ts`)
  computes as `Math.max` over **every** component's major axis.
- For an `elongated` component, that major axis comes from the _same_ table `bladeLengthBand` reads:
  `SHORT_MEDIUM_LONG_CM` = short 4cm, medium 14cm, long 40cm. `AXIS_SHORT_MAX_CM` is 9.

So `primaryAxisLength === 'short'` (≤9cm) requires every component ≤9cm, and for the edged component
the only length mapping ≤9cm is `short` (4cm). Therefore **`primaryAxisLength === 'short'` implies
`bladeLengthBand === 'short'`**, which R4's third clause forbids. The rule asks for a blade longer
than the object containing it.

The `bladeLengthBand === 'none'` branch its JSDoc names is impossible for a separate reason:
`'none'` occurs only when there is no edged component, contradicting `hasEdge`.

The example in the field's JSDoc runs one way only. A short blade on a long haft is reachable. The
converse R4 needs — a long blade on a short body — is geometrically incoherent, because the blade is
part of the body and body size is _defined_ as the largest part.

## Finding 2: the joint distribution is a strict triangle

Measured over 8000 artefacts, four Explorer cultures, real pipeline (`expandGrammar` →
`normaliseArtefact` → `extractFeatures`). Of 2793 edged artefacts:

| axis   | blade  | count | share |
| ------ | ------ | ----- | ----- |
| long   | long   | 1052  | 37.7% |
| long   | medium | 685   | 24.5% |
| long   | short  | 590   | 21.1% |
| medium | medium | 232   | 8.3%  |
| medium | short  | 150   | 5.4%  |
| short  | short  | 84    | 3.0%  |

Six of twelve possible pairs occur. **Blade never exceeds axis.** `axis === 'short'` carried
`blade === 'short'` in all 84 cases. R4 fired 0 times, as predicted by the arithmetic.

Short-axis edged artefacts are not merely single-component objects where the question is trivial: 38
have one component, 28 two, 11 three, 6 four, 1 six. Multi-part short objects exist — every part is
simply ≤9cm.

## Finding 3: R4 was a truth-table patch, not a design decision

Doc 12's record of PR #37 review (2026-07-22):

> two coverage gaps found in review closed the set at 36 rules. An edged artefact with a short
> primary axis but a non-short (or absent) blade band matched none of the edge rules, leaving it
> with no function signal; a short-edge scraper/chisel rule (`tool 0.4, everyday 0.2`) now catches
> it, backed by an exhaustive edge-family sweep asserting every edged feature set fires at least one
> edge rule.

The order of events matters. Someone enumerated combinations of
`hasEdge × primaryAxisLength × bladeLengthBand`, found cells matching no rule, wrote a rule covering
them, then wrote a test asserting no cells are uncovered. Nobody asked whether those cells occur.

The "exhaustive sweep" backing R4 iterates 3 × 4 × 3 = 36 combinations by constructing
`ExtractedFeatures` **by hand**, never running the generator, so it cannot distinguish a reachable
combination from an impossible one. The scraper/chisel language in R4's JSDoc is the archaeological
story attached afterwards to make a truth-table cell sound like an intent.

This is why "keep R4 because scrapers are real" was rejected: it would inherit a decision nobody
made, via a condition phrased in truth-table terms rather than morphological ones.

## Finding 4: the suite is not riddled with dead rules

The initial framing of this spike overstated the test blind spot as "arguably the more valuable
finding than R4 itself". Measurement did not support that, and the claim was withdrawn.

`EXPECTED_FIRE_RATES` (`calibration.test.ts`) already pins every rule's real-pipeline rate at
n=1800. Only three read 0.0%: R4, plus R33/R34 which are _deliberately_ dormant pending 2GN.68's
producer for their decoration features. R27 moved 0.0 → 4.3 when 2GN.86 made its band reachable, so
the harness detects a rule becoming live as well as one being born dead. R4 was the only genuinely
dead rule in 44.

The real gap is narrower: a recorded `0.0` **passed**. The measurement existed, was written down
with a comment explaining it, and nothing failed. That is what let R4 survive three weeks — an
ignored measurement, not a missing one.

## Ruling

**1. Delete R4.** It is dead code carrying an authored intent the generator cannot serve and the
design never adopted. Deleting shifts `CLASSIFICATION_RULES` indices from 3 onward; the pinned-index
blocks, `EXPECTED_FIRE_RATES`, `MIGRATED_RULE_INDICES`, `UNIVERSAL_BY_DESIGN` and the Explorer
panel's label lookups were all renumbered.

**2. Narrow the edge-family sweep** to the six reachable `(axis, blade)` pairs, with the derivation
recorded in `REACHABLE_AXIS_BLADE_PAIRS`' JSDoc so the full cartesian product isn't restored by
reflex.

**3. Make an unexplained zero fail** rather than adding a second reachability harness. A 0.0 rate
now fails unless the rule is in `DORMANT_RULE_INDICES` with the roadmap task that will feed it; a
second guard fails when a declared-dormant rule starts firing. This reuses the sweep that already
has the measurement rather than deriving the same fact twice in two places.

**4. Do not decide the generation question here.** Whether the game should produce a short-bodied
edged tool that is not a formed blade (scraper, chisel, adze) is a real design question with a real
archaeological case — those are among the commonest assemblage finds. It deserves an answer on its
own terms, not inheritance from a dead rule. Filed as a follow-up, with a replacement rule
contingent on it.

## Rejected alternatives

**Fix upstream (the R27 precedent).** Three mechanisms were available: a shorter `elongated.length`
rung, decoupling `bladeLengthBand` from the shared cm table, or changing `deriveDimensions` so
`primaryExtent` is not a plain `Math.max`. Rejected _for now_ because it commits to generating the
form before anyone has decided the form should exist, and costs a set-wide recalibration sweep.
Whichever mechanism is chosen belongs to the generation task, not to a rule cleanup.

**Correct the condition.** Any replacement signal would be unvalidated and could move the dead-
condition problem rather than solve it. A replacement rule should follow the generation ruling, not
precede it.

**Add a reachability harness** ("every rule fires at least once"). Rejected as duplicating
`EXPECTED_FIRE_RATES`: a `0.0` entry there and "this rule never fires" are the same fact, and
asserting it twice creates two places to drift.

## Wider lesson

`deriveDimensions`' `Math.max` has now produced two defects: R27's unreachable `very-heavy` band
(2GN.86) and R4's unsatisfiable condition (here). 2GN.86 stated the general form as "any statistic
defined as a max or an any-of across a generated collection will saturate as that collection grows".
R4 adds a corollary: **when two features are derived from the same underlying quantity, their types
will still present them as independent, and a rule may be authored against a combination the
derivation forbids.** The typed vocabulary is not a reachability claim.

Related: doc 12 §2.25's saturating boolean, §2.26's max-over-components mass proxy.
