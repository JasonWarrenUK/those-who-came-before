# 2GN.118 — The Primitive Grammar's Categorical Value-Sets

| Prop      | Value                                                                        |
| --------- | ---------------------------------------------------------------------------- |
| Status    | Ruled                                                                        |
| Ruled     | 2026-08-13                                                                   |
| Ruling in | This document; implementation split out, no `src/` change made here          |
| Outcome   | `base` unioned; `diameter` unified; `opening`/`perforation` split to 2GN.122 |

## The question

`PRIMITIVE_PARAMETERS` (`data/grammars/primitives.ts`) reproduces doc 05 §5.3 verbatim, so this
audits the spec's own vocabularies rather than any code drift. The brief named three measured
instances of one shape: two primitives expressing the same concept with disjoint vocabularies, so a
value is unreachable by primitive type rather than by design.

## Finding 0: there are seven disjoint pairs, not three

The brief's three were found by looking for shared parameter names with live classification rules. A
full cross-tabulation of all eight primitives finds seven:

| Parameter      | Split                                          | Read by rules? |
| -------------- | ---------------------------------------------- | -------------- |
| `base`         | `pointed` (cyl) vs `pedestal` (hollow)         | yes            |
| `opening`      | 3 values vs 4, **zero overlap**                | yes            |
| `perforation`  | `single`/`multiple` vs `central`/`off-centre`  | yes            |
| `crossSection` | elongated 5 / ring 3 / bar 3                   | no             |
| `diameter`     | `narrow/medium/wide` vs `small/medium/large`   | no             |
| `shape`        | volumetric vs planar vocabularies              | no             |
| `taper`        | `gradual`/`abrupt` vs `single-end`/`both-ends` | no             |

The four unread pairs have no live consequence today. Three of them are not defects at all (Finding
4); one is (Finding 5).

## Finding 1: `base`'s split makes a rule unfireable on its own subject

`dominantContainer` (`engine/generation/classification.ts:199`) always prefers `hollow-enclosed`
over `cylindrical`, falling back to the cylinder only when no vessel is present. It reads `baseType`
off that one component. Combined with the vocabularies:

- **`base-pedestal-display`** could fire only on hollow-enclosed dominants — `pedestal` existed
  nowhere else.
- **`base-pointed-amphora`** could fire only on **cylinder-dominant** artefacts: sockets, ferrules,
  tubes. `pointed` existed only on `cylindrical`, and cylinders reach the extractor only when no
  vessel is present.

The second is the sharper defect. The rule's own comment reads "a pointed base reads amphora-style
storage — set into a stand or the ground, not free-standing". An amphora is the paradigm
hollow-enclosed vessel, so the rule for amphora-style storage could never fire on anything shaped
like an amphora.

`ExtractedFeatures.baseType` (`types/artefact.ts:601`) already types
`'none' | 'flat' | 'rounded' | 'pointed' | 'pedestal'` — the full union. The type layer had already
conceded the two lists are one property.

## Finding 2: the weights were authored, never calibrated

The union moves both rules' populations, `base-pointed-amphora`'s completely. That raises whether
their awards (`ceremonial 0.4, elite 0.3`; `utilitarian 0.3, maritime 0.2`) were tuned against the
population each rule actually saw.

They were not. Both rules were born in `cb3e517` (2GN.17), whose message describes authoring rules
"against the signals the grammar actually produces... rather than doc 05's illustrative examples" —
an authoring pass. `EXPECTED_FIRE_RATES` did not exist at that commit; the calibration harness came
later. The weights were never fitted to observed rates because there were no observed rates to fit
them to.

So the weights encode what the author thought a pointed base _means_. `maritime` off a pointed base
only parses as an amphora reading — transport vessels stowed in ship holds — and is meaningless for
a ferrule, so nobody tuned it against the socket population deliberately.

**The weights stand. Only the fire rates move.**

## Finding 3: `opening` and `perforation` are not vocabulary splits at all

`OPENNESS_BY_OPENING` (`classification.ts:95`) maps all seven `opening` values onto one 0–1 scale:
`wide 1.0 > open 0.8 > narrow 0.4 > restricted 0.3 > slit 0.1 > closed 0 = none 0`. Somebody had
already ruled the two vocabularies commensurable. Three shipped rules go further and pair the labels
as synonyms by hand (`openingType === 'wide' || openingType === 'open'`), which is the rule layer
compensating for a split that should not exist.

But the table also shows `closed` and `none` scoring identically, because they are the same physical
fact. That is not a vocabulary problem — it is **two axes crushed into one field**: presence/count
and aperture size.

`perforation` has the same shape more obviously: `single`/`multiple` is a **count**,
`central`/`off-centre` is a **position**. The extractor's priority chain
(`central > off-centre > single > multiple > none`) ranks a position against a count.

Two further questions surfaced in session and neither vocabulary can express either:

- **Multiplicity.** A through-void has two mouths (bead, socketed axe, tube); a two-mouthed vase has
  two separate apertures. Different facts, both inexpressible.
- **Subsumption.** A hole through a disc (`perforation`) and a hole through a cylinder wall
  (`opening`) are plausibly one concept, split across two parameter names by primitive-by-primitive
  BNF authoring — the same defect as `base`, one level up.

Ruling `opening` now and discovering `perforation` merges into it later means recalibrating
`EXPECTED_FIRE_RATES` twice. Both are deferred whole to **2GN.122**.

## Finding 4: three of the unread splits are genuine geometry

Not every disjoint pair is a defect. Three describe different concepts wearing one name:

- **`crossSection`** — a ring's `twisted` and a blade's `diamond` are not values on one axis.
- **`shape`** — `spherical`/`ovoid`/`box` is volumetric; the planar sets are silhouettes.
- **`taper`** — `gradual`/`abrupt` asks _how sharply_; `single-end`/`both-ends` asks _at which
  ends_. Genuinely distinct questions.

These stay as authored, and this is the record of why.

## Finding 5: `diameter` is pure labelling, and points at a bigger defect

`cylindrical: narrow/medium/wide` versus `ring-form`/`disc-form`: `small/medium/large` is the same
three-rung axis under two names. Nothing reads it, so there is no live defect — but "harmless
because unread" is exactly what let `base-pointed-amphora` sit broken.

One argument for keeping them apart: a cylinder's diameter reads relative to its own length (a
"wide" tube is wide _for a tube_), whereas a disc's diameter is its principal dimension. That is an
argument for **deriving** diameter from a ratio, not for two label sets — and it is 2GN.120's defect
again, a band cut from an absolute table.

Labels unify to `small/medium/large`; the derivation is deferred to the 2GN.120 family.

## Finding 6: `taper` will collide with the orientation ruling

`bar-form: none | single-end | both-ends` encodes **which end**. 2GN.108 ruled that orientation is
achieved by **reversal**, and 2GN.115 is open on what defines a working end in general.

A reversal flips which end is which. `single-end` is not reversal-invariant: reverse the component
and it still says "one end", but _which_ end has silently changed, and no data records which it was.
`none` and `both-ends` are symmetric and survive reversal untouched — `single-end` is the sole
asymmetric value in the parameter. (`elongated`'s `taper`, the same name on a different primitive,
is `['none','gradual','abrupt']`: a _how sharply_ axis, symmetric and unaffected.)

No classification rule reads `taper`, but the description layer does:
`data/descriptions/observational/bar-form.ts:43` interpolates it into "The form narrows with a
`#taper#` taper.", asserted at `prose.test.ts:123`. So `single-end` already reaches player-facing
prose. That raises the stakes rather than lowering them: a reversal would leave a description
asserting which end tapers while no data records which end it was, which is doc 02 pillar 3
(Simulation Honesty) rather than a dormant-parameter problem. The moment 2GN.115's convention lands,
`single-end` becomes either meaningless or a claim about the oriented axis.

Method note: the first pass of this finding said nothing read `taper`, because it searched for
`prop(component, 'taper')` and found only the classification readers. Templates reach parameters by
`#name#` interpolation, so a symbol search misses them entirely. That is this spike's own Wider
Lesson landing on the spike: a search shape finds only what it is shaped to find.

Filed as a constraint on 2GN.115 rather than a task of its own — it constrains that ruling rather
than standing alone.

## Ruling

**1. `base` unions to `['flat', 'rounded', 'pointed', 'pedestal']` on both primitives.** Both
exclusions are authoring artefacts of writing the BNF primitive-by-primitive, not morphological
modelling. Nothing stops a cylindrical beaker having a pedestal foot; nothing stops a volumetric
vessel having the pointed base that _defines_ an amphora.

**2. The extractor's primitive-type branch stays, as a marked seam.** Collapsing
`classification.ts:355-359` to a single `bandProp` call was rejected. The branch cannot express a
frequency difference — only impossible versus equally-likely — so per-primitive divergence has to
return as **weights**, and the seam marks where. Filed as **2GN.121**, parked in M3 behind the world
generator.

**3. The two base rules keep their weights** (Finding 2). `EXPECTED_FIRE_RATES` re-records at
implementation with the drift annotated; `base-pointed-amphora` will move sharply, and that is the
fix working.

**4. `opening` and `perforation` are deferred whole to 2GN.122** (Finding 3), including
`perforation`'s count/position split, multiplicity, and whether one aperture model subsumes both.

**5. `crossSection`, `shape` and `taper` stay as authored** (Finding 4), with `taper`'s pending
collision noted on 2GN.115 (Finding 6).

**6. `diameter` unifies to `small/medium/large`**, derivation deferred to the 2GN.120 family
(Finding 5).

**7. This spike ships no `src/` change.** Every ruling above lands in its own task, so
`EXPECTED_FIRE_RATES` re-records once against the full set rather than three times.

## Rejected alternatives

**Collapse the extractor branch.** Cleaner-reading and rejected: the codebase trends toward
culture-relative granularity, and per-culture base weighting is wanted. A dead branch preserved for
a hypothetical reads as intentional when it isn't, but this one is load-bearing for a filed task.

**Union `opening`'s seven values.** Cheapest, and rejected once the two-axis reading held: a union
carries `closed` and `none` forward as distinct labels for one physical fact, and cannot express
multiplicity at any arity.

**Rename `opening`'s values for intuitiveness.** Considered and found unnecessary. Splitting the
axes makes the vocabulary fall out on its own — `closed`/`none` become count, `open` becomes `wide`,
`restricted` becomes `narrow` — so the values that survive (`wide`, `narrow`, `slit`) need no new
words. Renaming would have been a cosmetic fix to a structural problem.

## Wider lesson

The three filed cases were found by looking for **shared parameter names**. That search shape found
every defect it could see and was blind to two others: the parameters that are one concept under
_different_ names (`opening` and `perforation` may be), and the fields that are two concepts under
_one_ name (`opening` and `perforation` each are).

A vocabulary audit that only compares like-named things measures the vocabulary, not the model.
Three of the seven pairs it flagged turned out not to be defects, and the two worst defects it did
flag turned out not to be vocabulary problems at all.

Related: 2GN.97 Finding 4 (which surfaced this task), 2GN.108 and 2GN.115 (orientation), 2GN.119
(under-conditioned rules — `base-pointed-amphora` will fire on its real population for the first
time, so 2GN.119 reads a materially different rule than the one it measured), 2GN.120 (bands cut
from absolute tables).
