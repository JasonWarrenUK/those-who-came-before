# 2GN.110 — Per-Material Entries in `materialAffinities`

| Prop      | Value                                                                              |
| --------- | ---------------------------------------------------------------------------------- |
| Status    | Ruled                                                                              |
| Ruled     | 2026-08-13                                                                         |
| Ruling in | This document; propagated to doc 11 §2.13 and doc 12 §2.45                         |
| Outcome   | `MaterialSelector` keying adopted; most-specific-wins replaces the `max` reduction |

## The question

`CulturalProfile.materialAffinities` is `Map<MaterialTag, number>`. With the `precious-*` members
retired by 2GN.78 (doc 11 §2.9, doc 12 §2.40), a culture can say "we prize metal" but no longer "we
prize gold specifically" — an expressive loss accepted at the time and filed here for a ruling.

The loss is concrete. Thalassar carried an authored `precious-metal: 1.2`, the only _live_ precious
affinity across the four Explorer presets (the others were already dead under the `max` reduction).
It was dropped rather than re-expressed as `metal: 1.2`, which would newly favour bronze and iron
that culture was never authored to prefer.

The brief also named the tension to resolve: a per-material affinity entry is a culture-authored
judgement about one material, which is legitimate — it is _that culture's_ opinion, not Earth's —
but it sits close enough to the retired tags that the boundary wants stating explicitly.

## Finding 1: the `MaterialSelector` pattern transfers, and for the same reason

2GN.112 replaced `MaterialFlow`'s `materialTag` + `specificMaterials` pair with a tagged union:

```typescript
export type MaterialSelector =
	| { tag: MaterialTag; id?: never }
	| { id: MaterialName; tag?: never };
```

Its JSDoc gives the reason: `bone`, `glass` and `leather` each name **both** a `MaterialTag` and a
`MaterialName`, so a bare `MaterialTag | MaterialName` union cannot distinguish `{ tag: 'bone' }`
(the class: bone and antler) from `{ id: 'bone' }` (the material alone), and resolving the collision
by precedence would make three of sixteen materials unselectable by one of their two readings.

`materialAffinities` has the identical collision, so the identical solution applies. Keying the map
by `MaterialSelector` lets Thalassar author `{ id: 'gold' }: 1.2` without touching bronze or iron.

⚠️ Only half the flows' pattern transfers. `MaterialFlow` pairs `includes` with `excludes` because a
flow is about _membership_, and "all metals except gold" needs subtraction. Affinities are weights,
not membership: there is nothing to subtract, and the exception case is expressed by the resolution
rule below instead.

## Finding 2: adopting the selector forces a reduction that has never been ruled

`culturalAffinityWeight` (`materials.ts`) reduces across a material's tags with `max`, and its own
JSDoc flags the reduction as unresolved:

> **The max across tags is vestigial** since roadmap 2GN.78 … Kept rather than simplified to a
> single lookup because `MaterialDefinition.tags` is still a list. **If a genuine multi-tag material
> is ever authored, this reduction needs a ruling** (max / most-specific-wins /
> product-of-deviations) before it carries weight again; it has never had one.

Every shipped material carries exactly one tag today, so `max` never actually reduces anything. Per-
material entries change that immediately: gold would carry two applicable affinities,
`{ tag:
'metal' }` and `{ id: 'gold' }`. **The multi-value case the JSDoc reserved a ruling for
arrives through the selector rather than through a multi-tag material.**

`max` is already known wrong for it. 2GN.84 measured the max _discarding_ authored `precious-*`
values whenever the class tag scored higher — 3 of the 5 authored across the Explorer presets were
dead that way. Under `max`, a culture authoring `metal: 1.5, gold: 1.2` to mean "we like metal, gold
less so" would silently get 1.5. **A specific entry could only ever raise a material, never lower
it** — the same one-directional behaviour that was itself evidence the precious tags encoded a
judgement rather than a class, and contributed to retiring them.

## Finding 3: three consumers, and one of them cannot participate

| Consumer                                  | Reads                                  | Default | Participates |
| ----------------------------------------- | -------------------------------------- | ------- | ------------ |
| `culturalAffinityWeight` (`materials.ts`) | a material's tags                      | `?? 1`  | yes          |
| `bestMaterialAffinity` (`decoration.ts`)  | a material's tags                      | `?? 1`  | yes          |
| `effectiveOptionWeight` (`grammar.ts`)    | a grammar option's `culturalModifiers` | `?? 0`  | **no**       |

The first two inline the same reduction and must move together — the JSDoc already says so.

⚠️ The third cannot consult a per-material entry **even in principle**. It weights grammar options
by `culturalModifiers`, which are keyed by tag, and it runs at stage 4 — materials are not assigned
until stage 6. It never sees a material. Its `?? 0` default also differs deliberately (an absent tag
contributes no adjustment to a weight, rather than a neutral multiplier). This is a stage-ordering
fact, not an inconsistency to be reconciled later.

## Ruling

**1. `materialAffinities` is keyed by `MaterialSelector`**, matching `MaterialFlow` (2GN.112). The
tagged union is required rather than stylistic: `bone`, `glass` and `leather` name both a tag and a
material.

> ⚠️ **Amended at implementation (2GN.123, doc 12 §2.47).** This ruling said
> `Map<MaterialSelector,
> number>`; the field shipped as `readonly MaterialAffinity[]` (entries of
> `{ selector, weight }`). A JS `Map` matches object keys by reference, so `.get({ tag: 'metal' })`
> can never hit an entry authored as a different literal — the container named here cannot hold the
> keys ruled here. Every semantic below is unaffected and shipped as written.

**2. Resolution is most-specific-wins.** A class entry sets a default; a specific entry is an
exception to it. `{ tag: 'metal' }: 1.5` with `{ id: 'gold' }: 0.8` reads as **"all metals are 1.5,
except gold, which is 0.8"**.

Chosen over the alternatives because it is **bidirectional** — a specific entry can lower as well as
raise, which is exactly the property `max` lacked — and because there is no gap between what an
author writes and what the engine computes. Product-of-deviations has such a gap: `metal: 1.5` ×
`gold: 0.8` yields 1.2, so authoring a below-neutral value for gold produces an above-neutral final
weight, reading as mild favour when disfavour was meant.

It also matches the precedent already set: `MaterialFlow` resolves general-versus-specific by
letting the specific statement win. One intuition, two places.

**3. The class default applies to every material of that class carrying no specific entry.** This is
what makes the rule an _exception_ rule. `{ tag: 'metal' }: 1.5` covers bronze and iron; gold alone
departs from it.

**4. A specific entry with no class entry is well-formed.** `{ id: 'gold' }: 0.8` alone reads gold
at 0.8 and every other metal at the neutral `1`. This is the shape that recovers Thalassar's dropped
intent exactly: `{ id: 'gold' }: 1.2, { id: 'silver' }: 1.2`, with no `metal` entry, says "we favour
gold and silver" and nothing else.

**5. This closes the JSDoc's open reduction question** for the specificity axis, replacing `max` in
both `culturalAffinityWeight` and `bestMaterialAffinity`, which move together.

**6. The tag-versus-tag tie stays explicitly unruled.** If a material ever carries two _class_ tags,
most-specific-wins has no tiebreak between them. No shipped material does, and authoring a rule for
a shape that does not exist is what 2GN.87 punished — a condition written against a combination
nobody had established was reachable. Recorded as open rather than guessed.

## The boundary the brief asked for

A per-material affinity is **a culture's judgement about a material**, and that is legitimate under
2GN.77's ruling precisely because it is that culture's opinion. The retired `precious-*` tags were
different in kind: they lived in `data/materials.ts` as a property _of the material itself_,
stamping one judgement onto every culture in every world — Earth's judgement, applied universally.

The test is **where the statement lives, not how specific it is**. A statement in `CulturalProfile`
is that culture's view and may name a single material freely. A statement in `MaterialDefinition`
describes the material everywhere and may not encode standing at all. Specificity was never the
problem; universality was.

## Rejected alternatives

**Keep `max`.** Rejected on 2GN.84's measurement: it discards authored values one-directionally, so
a specific entry could never lower a material.

**Product-of-deviations.** Composes cleanly in principle but breaks the correspondence between
authored value and computed weight (Finding 2's `1.5 × 0.8 = 1.2` case). Authors would have to
compute backwards from the intended result.

**Re-express Thalassar as `metal: 1.2`.** The status quo ante, rejected when 2GN.78 dropped the
entry rather than doing this: it newly favours bronze and iron the culture was never authored to
prefer.

**Reinstate a `precious-*` tag.** Rejected by 2GN.77/2GN.78 already, and this ruling does not reopen
it — the boundary above explains why per-material affinity is not a back door to the same thing.

**A second parallel map** (`specificMaterialAffinities` alongside `materialAffinities`). This is
exactly the shape 2GN.112 removed from `MaterialFlow`: two fields feeding one selector with the
combining operator left unstated, which produced a JSDoc claiming one behaviour while the code did
another. Not repeated here.

## Wider lesson

The `max` reduction survived because it was **inert, not correct**. Every material carries one tag,
so the reduction never fired, so nothing ever tested it and no measurement contradicted it. Its own
JSDoc flagged it as unruled and it still sat there through 2GN.78 and 2GN.84.

**A dormant code path accumulates no evidence about itself.** The 2GN.79 calibration guard exists
because a rule firing 0% of the time was recorded and passed; this is the same failure in a
reduction rather than a rule. When a shape change makes a dormant path live, the ruling it was
always waiting for comes due in the same change — not afterwards, when the behaviour has already
shipped.

Related: doc 12 §2.40 (the retired precious tags), §2.41 (`MaterialFlow`'s selector), §2.39 (a
condition outliving its intent).
