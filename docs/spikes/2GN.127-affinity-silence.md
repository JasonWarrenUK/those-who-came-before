# 2GN.127 — What an Absent Affinity Entry Means

| Prop        | Value                                                                           |
| ----------- | ------------------------------------------------------------------------------- |
| Status      | Ruled; implemented by 2GN.128                                                   |
| Ruled       | 2026-08-14                                                                      |
| Implemented | 2026-08-14 — `engine/generation/cultureValidation.ts`; see doc 12 §2.50         |
| Ruling in   | This document; propagated to doc 11 §2.15 and doc 12 §2.49                      |
| Outcome     | Silence is legitimate iff the material is inaccessible; a validator enforces it |

## The question

`culturalAffinityWeight` (`engine/generation/materials.ts`) returns `1` for any material no entry
matches, and `computeTechniqueWeight` (`decoration.ts`) does the same for `techniqueAffinities`. So
**an unauthored material is indistinguishable from one deliberately authored at exactly `1.0`.**

Xoconahtl's `['clay', 1.0]` is the case that exposes it: behaviourally identical to omitting the
entry, kept only because a comment says it is deliberate indifference — exactly the distinction the
type cannot carry. The comment names this task by id.

The brief offered four options: keep the default; throw on omission; require an explicit neutral
sentinel; or a `completeness: 'partial' | 'exhaustive'` flag. The ruling below takes none of them.

## Finding 1: the four maps are not one family

The brief instructed "rule the family, not the one map", naming `materialAffinities`,
`techniqueAffinities`, `contextWeights` and `siteTypeWeights`. Checked against the engine:

| Map                   | Engine readers                                                                                                                                  |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `materialAffinities`  | `culturalAffinityWeight` (`materials.ts`), `effectiveOptionWeight` (`grammar.ts`), and `materialAccessGate` (`decoration.ts`) through the first |
| `techniqueAffinities` | `computeTechniqueWeight` (`decoration.ts`)                                                                                                      |
| `contextWeights`      | **none**                                                                                                                                        |
| `siteTypeWeights`     | **none**                                                                                                                                        |

Two of the four are dormant: declared in `CraftInvestmentProfile`, authored in all four presets,
read by nothing. Ruling strictness for a map with no reader means authoring a contract against
unobserved behaviour, which is the defect 2GN.87 punished and which 2GN.110 explicitly refused to
repeat on tag-versus-tag ties.

⚠️ **`effectiveOptionWeight` reads the map directly but is not governed by this ruling**, and its
default is `?? 0` rather than the resolver's neutral `1`. It iterates a `GrammarOption`'s
`culturalModifiers` and looks each tag up in `materialAffinities`, so the lookup runs tag→weight,
the reverse of the resolver's material→weight. An unmentioned tag contributes no adjustment to an
additive weight, where `1` would silently shift every option. Silence there is a different statement
from silence in the resolver and is left alone. Doc 11 §2.13 records the separate reason it cannot
consult a per-material entry even in principle: it runs at stage 4, and materials are not assigned
until stage 6.

This is also doc 12 §2.47's own lesson (a dormant path accumulates no evidence about itself)
applying to the brief's own framing.

## Finding 2: absence is derivable, so it needs no new syntax

The three stricter options in the brief all add authoring machinery — a sentinel value, a
completeness flag, or mandatory exhaustiveness. None is necessary, because the world model already
carries the fact that distinguishes the two cases.

`isAvailable(material, geology, trade)` (`materials.ts`) answers "could this culture ever have
encountered this material?", resolving local geology and trade flows. That is precisely the
condition under which having-no-attitude is credible: a culture forms no opinion about a material it
has never interacted with, and cannot plausibly have no opinion about one it works or trades for.

So silence is not annotated, it is **checked**. The distinction between ambivalence and absence
becomes a validation question rather than a syntax question, and every existing authored profile
keeps its shape.

## Finding 3: measured — every preset violates the rule today

Across the four Explorer presets, counting materials that carry no matching affinity entry (specific
or class) and splitting them by `isAvailable`:

| Preset    | Silent but accessible (violations) | Silent and inaccessible (legitimate) |
| --------- | ---------------------------------: | -----------------------------------: |
| tarpan    |                                  6 |                                    3 |
| thalassar |                                 11 |                                    1 |
| xoconahtl |                                  6 |                                    4 |
| khaltiris |                                  8 |                                    0 |
| **Total** |                             **31** |                                **8** |

Khaltiris has zero legitimate silences: under this ruling it must state a position on all sixteen
materials. Thalassar is the worst offender at eleven, which is the rule working as intended — it
buys metal, gold and obsidian through three flows and holds no stated opinion about any of them. A
culture that trades for gold and has no view on gold is not credible.

The presets are re-authored to fit the rule, not the reverse: they exist to showcase the engine.

## Finding 4: class entries discharge the obligation

Cultures author 2–4 entries and cover 4–12 materials, because class entries do the work — khaltiris
authors two entries and covers eight materials. A `{ tag: 'stone' }: 1.4` entry states this
culture's position on flint, granite and obsidian, and most-specific-wins already treats it as each
material's real weight.

Requiring per-material entries instead would destroy the terse authoring style 2GN.110 just built,
and would make 2GN.124's widened catalogue a breaking change for every authored culture. It would
also produce fake exhaustiveness: an author made to write sixteen numbers writes twelve of them as
`1.0` without thinking, which is silence again, laundered as authorship.

## Finding 5: the unmodelled-geology case inverts the rule

`isAvailable` carries an MVP lenience:

```typescript
if (level === undefined) return true; // Not modelled in this geology — MVP lenience.
```

Read naively, an **unmodelled** material is "available", so silence about it would throw. That is
backwards: a material nobody modelled is the strongest possible case for "this culture never
encountered it".

The presets dodge this — their `geology()` helper models all sixteen deliberately, and its comment
already says a missing entry is an authoring error there — but the engine generally does not.
`scarcityWeight`'s JSDoc already treats `undefined` as a third state distinct from available/absent,
for the same class of reason. The validator must do likewise rather than folding unmodelled into
accessible.

## Finding 6: the obligation is one-directional

`MaterialFlow` supports `excludes`, so a flow can include `{ tag: 'metal' }` while excluding
`{ id: 'gold' }`. A culture could then author `{ tag: 'metal' }: 1.5` — which covers gold — while
gold remains inaccessible.

That is legal and silent. A culture may hold opinions about materials it cannot obtain (one can
prize gold one has never held), so:

- **accessible ⟹ must be covered** (specific or class entry)
- **covered ⟹ nothing implied about access**

The validator only ever reports the missing direction. Note `materialAffinities` itself has no
exclusion — 2GN.110 ruled `includes`/`excludes` does not transfer, since weights have nothing to
subtract — so a covered material cannot be un-covered; the exception case is expressed by a specific
entry, per most-specific-wins.

⚠️ No preset currently authors an `excludes` array, so this shape is legal but unexercised. Stated
here so the validator is written against it, not elaborated further: 2GN.110's precedent is to
decline building machinery for shapes nothing authors yet.

## The ruling

> Silence in `materialAffinities` is legitimate **iff** the material is inaccessible to that
> culture: `absent` locally with no `MaterialFlow` reaching it, **or** unmodelled in that geology. A
> material that is locally obtainable, or `trade-only` with a flow that reaches it, **must** carry a
> matching affinity entry — class or specific. Enforced by a validator, which throws at
> profile-construction time rather than during generation.

The general principle, binding on the family as it becomes live: **silence is legitimate iff the
thing is inaccessible, and accessibility must be derivable from the world model.** A map with no
derivable accessibility does not get a strictness rule invented for it.

Scope bound now: `materialAffinities` only. `techniqueAffinities` inherits the principle but needs a
prior question resolved (below). `contextWeights` and `siteTypeWeights` inherit when they get
readers.

## Deferred: `techniqueAffinities` and the `> 1` substrate gate

Techniques do have a derivable accessibility, one hop further out: `materialAccessGate`
(`decoration.ts`) already establishes that a culture with no gold cannot gild, and no engravable
material cannot engrave. The rule transposes cleanly.

It is deferred because extending it surfaces a second defect that must be ruled first.
`materialAccessGate`'s substrate check requires `culturalAffinityWeight(material, culture) > 1` —
strictly better than neutral:

```typescript
const hasSubstrateAccess = materials.some((material) =>
	culturalAffinityWeight(material, culture) > 1 &&
	isAvailable(material, geology, trade) &&
	substrate.test(material)
);
```

Under this ruling, cultures author many more entries, and any authored at exactly `1.0` still fail
this gate. So a culture that explicitly states indifference to bronze gets bronze-substrate
techniques suppressed **identically** to a culture that cannot obtain bronze at all — the
ambivalent-versus-absent collapse this spike exists to eliminate, reappearing one layer down.

Whether affinity should gate substrate access at all is a separate ruling. Filed with the technique
extension.

⚠️ **Measured during 2GN.128, and now live in the shipped presets.** Xoconahtl authors
`['clay', 1.0]` — deliberate indifference to a material its geology marks `abundant` — and that
entry fails the gate above:

```
xoconahtl fired-clay: affinity=1  geology=abundant  isAvailable=true
passes substrate gate (needs > 1 AND available): false
```

So clay-substrate techniques are suppressed for a culture swimming in clay, identically to one that
cannot obtain any. 2GN.128 deliberately **kept** the `1.0` rather than nudging it to `1.1` to clear
the gate: retuning authored content to route around an engine defect edits the demo to fit the bug
and destroys the evidence that makes the defect measurable. This is the concrete case 2GN.129 rules
against.
