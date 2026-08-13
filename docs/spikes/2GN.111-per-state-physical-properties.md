# 2GN.111 — Per-State Values in `physicalProperties`

| Prop      | Value                                                                     |
| --------- | ------------------------------------------------------------------------- |
| Status    | Ruled                                                                     |
| Ruled     | 2026-08-13                                                                |
| Ruling in | This document; propagated to doc 11 §2.14 and doc 12 §2.46                 |
| Outcome   | Per-state on `rigidity` only; three axes pinned, two of them corrected     |

## The question

2GN.102 added `formability` on an explicit working-state convention and discovered that its six
siblings had never been asked the question — they were authored, without comment, against the
*finished* object. The `physicalProperties` preamble records the inconsistency and declines to fix
it:

> `formability` breaks from that precedent deliberately … and the inconsistency in its six siblings
> is recorded, not fixed, here: reconciling them into a genuine per-state property model is filed
> downstream of 2GN.102 (doc 12 §2.38).

2GN.105 was then filed presupposing the answer — "let a material carry per-state property values (at
minimum worked vs finished)" — and later re-pointed to depend on this spike rather than on 2GN.102
directly, so the audit follows the ruling instead of assuming it. This spike rules the shape.

## Finding 1: only some axes are state-dependent

Tested against the four known-affected materials (`glass`, `iron`, `fired-clay`, `leather`):

| Axis | State-dependent? | Evidence |
| ---- | ---------------- | -------- |
| `fragility` | **yes, extremely** | glass 7 cold and ~1 hot; fired clay 6 fired and ~1 wet |
| `formability` | **yes** | the axis that surfaced the problem; already on working-state |
| `rigidity` | **yes** | fired clay 7 fired and ~1 wet; hot glass flows |
| `hardness` | marginal | forged versus cold-worked iron differ slightly; glass barely |
| `grainFineness` | no | structural, does not change with temperature |
| `porosity` | no | fired clay's 6 is a property of the fired body |
| `combustibility` | no | an ignition property, state-independent |

Three axes clearly vary by state, one marginally, three not at all. A blanket per-state model would
author 16 materials × 7 axes × 3 states = **336 values to capture variation in four of them**, with
48 of those values being three identical numbers for the state-independent axes.

## Finding 2: the consumers disagree, and that is the real fault line

Every read of `physicalProperties` across the codebase, and the state each needs:

| Site | Predicate | State needed |
| ---- | --------- | ------------ |
| `relief` (`decorations.ts`) | `formability >= 3` | **working** — can it be given a raised form |
| wire-drawing (`decoration.ts:247`) | `formability >= 5` | **working** — can it be drawn that thin |
| `inlay`, `wrapping` ×2 (`decorations.ts`) | `rigidity >= 3` | **finished** — will the object hold the decoration |
| `glaze` (`decorations.ts`) | `combustibility <= 2` | state-independent |
| `computeLayerGrade` | the six `MaterialDifficultyAxis` values | **working** — difficulty is incurred while working |

⚠️ **`relief`'s own predicate mixes conventions.** It gates on `formability` (working-state) while the
sibling `rigidity` gates in the same family read finished-state — two axes in one predicate family on
different conventions, which is the inconsistency the preamble named, now with the consumer that
trips over it identified.

**Bronze is the case that decides it.** `relief` asks whether bronze can be forged into a raised form
— a working-state fact. The three `rigidity >= 3` gates ask whether the finished object will still
hold wire wrapped round it — a finished-state fact. Both are true statements about bronze, they are
different numbers, and no single documented convention serves both: pinning to working state breaks
the rigidity gates, pinning to finished breaks `relief`.

So this is **not** merely undocumented convention. It is two genuine questions the model currently
answers with one number.

## Finding 3: exactly one axis is asked in both states

Crossing "is it state-dependent" against "which states do consumers actually ask for":

| Axis | State-dependent | Consumed by | Needs both states? |
| ---- | --------------- | ----------- | ------------------ |
| `rigidity` | yes | 3 finished-state gates **and** difficulty (working) | **yes** |
| `formability` | yes | 2 working-state gates | no — working only |
| `fragility` | yes | difficulty only | no — **working only** |
| `hardness` | marginal | difficulty only | no — **working only** |
| `grainFineness` | no | difficulty | n/a |
| `porosity` | no | difficulty | n/a |
| `combustibility` | no | one gate | n/a |

**`rigidity` is the only axis two consumers ask in different states.**

⚠️ The same crossing exposes a live defect. `fragility` and `hardness` feed `computeLayerGrade` and
nothing else, so working-state is the correct reading for both — but both are authored finished-state
today. Glass carries `fragility: 7` (cold) while being decorated hot, and fired clay carries `6`
(fired) while being decorated wet. **Both are inflating execution difficulty for materials that are
worked in a far more forgiving state.**

## Ruling

**1. `rigidity` carries per-state values** — `{ worked, finished }`. It is the only axis whose
consumers ask different questions, so it is the only axis that gets the extra shape.

**2. Every other axis stays scalar, each pinned to a documented state.** No axis keeps an unstated
convention:

- `formability` → **working** (already correct, per 2GN.102)
- `fragility` → **working** (⚠️ currently authored finished — corrected)
- `hardness` → **working** (⚠️ currently authored finished — corrected)
- `grainFineness`, `porosity`, `combustibility` → **state-independent**, documented as such rather
  than left to inference

**3. Two states, not three.** `raw` was considered and rejected: no consumer asks a question about a
material in its unworked state, and adding the rung would author 16 values that nothing reads. If a
consumer for it ever appears, the ruling reopens then.

**4. The correction to `fragility` and `hardness` lands regardless of the shape change.** It is a
live defect, not a modelling preference — those two axes are read exclusively by a consumer that
operates in the working state.

⚠️ **This shifts decorative grades.** Glass's fragility drops from 7 to roughly 1–2 and fired clay's
from 6 to about 1, both feeding `computeLayerGrade`'s weighted sum, so `meanDecorativeGrade` moves
for those materials and the 2GN.79 calibration guard will flag it. Sequence the sweep with the other
recalibration-bearing work rather than separately.

**5. 2GN.105 is rescoped by this ruling.** It was filed presupposing per-state values on every axis
("at minimum worked vs finished"). It now audits a specific list: add the second `rigidity` value,
re-author `fragility` and `hardness` to working state, and document the pinning on the remaining
four.

## Rejected alternatives

**Per-state on every axis.** Uniform and simple to explain, but authors 336 values to capture
variation in four axes, with three axes carrying three identical numbers each. ⚠️ It also invites
false precision: an author given three boxes fills all three, inventing distinctions that do not
exist — the same failure mode as authoring a rule against an unreachable combination (2GN.87).

**Split by consumer rather than by state** (`workingProperties` / `finishedProperties`). The split
matches the real fault line, but duplicates every axis that does not vary, and a material carrying
`hardness` in two blocks invites "which is the real one" — a question the state model answers by
naming the states and this shape does not.

**Pin everything to finished state and revert `formability`.** Cheapest and fully uniform, and
rejected because `relief` would again have nothing legitimate to key on. That absence is precisely
why 2GN.102 added the axis: `fragility` describes the wrong moment, `grainFineness`'s top rung cannot
separate glass from obsidian, and `craftDomain` groups granite with obsidian — the exact pair the
gate must split. This option re-opens a closed problem.

## Wider lesson

The six axes were authored against the finished object **by default rather than by decision** — the
question was never posed, so each author answered it implicitly and consistently enough that nothing
looked wrong. Only `fired-clay`'s data-file comment ever named the choice, as a one-off aside.

2GN.102 exposed it by adding an axis that could not be authored without asking. **A new axis is a
probe: the question it forces you to answer is often one its siblings silently answered differently.**
The defect was not that `formability` broke convention, but that there was no convention to break —
and two of the six turn out to have been answered wrongly for the only consumer that reads them.

Related: doc 12 §2.38 (the inconsistency named), §2.35 (the property model rebuilt), §2.44's
under-conditioned rules (the same shape of defect on the classification side).
