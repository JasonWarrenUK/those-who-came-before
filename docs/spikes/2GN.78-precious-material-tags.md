# 2GN.78 — Should `MaterialTag` Carry `precious-metal` / `precious-stone`?

| Prop      | Value                                                                        |
| --------- | ---------------------------------------------------------------------------- |
| Status    | Ruled and implemented                                                        |
| Ruled     | 2026-08-11                                                                   |
| Ruling in | Doc 11 §2.9 (revised); propagated to doc 12 §2.40                            |
| Outcome   | Both members retired; gilding gates physically; one expressive loss recorded |

## The question

2GN.78's brief was "revisit `MaterialTag`'s `precious-metal`/`precious-stone` members per the 2GN.77
ruling". Commit `f32825c` had already closed that literal scope doc-only (doc 12 §2.37), leaving one
live remainder that 2GN.84 folded in: `culturalAffinityWeight` takes the max across a material's
tags, so an authored `precious-metal` affinity is silently discarded whenever the class tag scores
higher.

That remainder turned out to be a symptom. The question this spike actually answered is whether the
two members belong in the vocabulary at all.

## Finding 1: the tags assert valuation, not class

`MaterialTag`'s other eight members — `metal`, `stone`, `bone`, `wood`, `clay`, `glass`, `fiber`,
`leather` — name what a material **is**. Two cultures looking at the same lump would agree.
`precious-metal` and `precious-stone` name what a material is **worth**, which is exactly what doc
11 §2.9 identified as a Simulation Honesty violation: _"a static `precious-metal` tag stamps Earth's
judgement onto a generated culture with abundant gold"_.

2GN.77 removed the tags from classification but left them feeding two generation paths —
`INTRODUCED_MATERIAL_TAGS`' gilding gate and `culturalAffinityWeight`. The judgement stayed in the
generator, one step removed.

The max-across-tags defect is downstream of this, not independent. A tag meaning "valuable" can only
ever raise a material above its base tag, never lower it — "we value gold less than plain bronze"
was unexpressible by construction.

## Finding 2: gilding's requirement is physical, and already modelled

Gilding applies a thin layer of a metal that can be beaten to leaf and will not tarnish. Both facts
are in the catalogue. Measured across all 16 shipped materials:

| material | craftDomain | formability | oxidisation |
| -------- | ----------- | ----------- | ----------- |
| gold     | metallurgy  | 5           | **0**       |
| silver   | metallurgy  | 5           | **3**       |
| bronze   | metallurgy  | 5           | **6**       |
| iron     | metallurgy  | 5           | **7**       |

`craftDomain === 'metallurgy' && formability >= 5 && oxidisation <= 3` admits **gold and silver and
nothing else** — reproducing the retired `['precious-metal']` pool exactly. Tarnish resistance alone
separates them; formability is what excludes a hypothetical hard non-tarnishing metal.

Four candidate predicates were measured. Two under-admitted (gold only), one over-admitted (adding
bronze). The shipped one is the only exact match, and it is exact for a physically meaningful reason
rather than by tuning.

## Finding 3: every other pool named the precious tags redundantly

The other five techniques listing a precious tag also listed its class tag beside it. Measured
candidate-pool sizes with and without the precious entries:

| technique     | with | without | lost    |
| ------------- | ---- | ------- | ------- |
| inlay         | 13   | 13      | nothing |
| overlay       | 5    | 5       | nothing |
| studs         | 6    | 6       | nothing |
| wire-wrapping | 4    | 4       | nothing |
| beading       | 11   | 11      | nothing |

Gilding was the only technique whose pool the class tags could not express — and therefore the only
real obstacle to retirement, now removed.

## Finding 4: the dead affinity data was worse than recorded

The roadmap named Khaltiris. Measured across all four Explorer presets, three of five authored
precious affinities were inert:

| culture   | authored             | competing class tag | live?                   |
| --------- | -------------------- | ------------------- | ----------------------- |
| Khaltiris | `precious-metal:1.4` | `metal:1.7`         | dead — max picks 1.7    |
| Xoconahtl | `precious-stone:1.4` | `stone:1.8`         | dead — max picks 1.8    |
| Thalassar | `precious-metal:1.2` | none authored       | **live** — the only one |

Retirement changed exactly two affinity weights in the whole preset set (Thalassar's gold and
silver, 1.20 → 1.00). Every other material in every other culture was already reading its class tag.

## Ruling

**1. Retire both members.** `MaterialTag` is now eight material classes. The type's JSDoc carries
the test for future members: would two cultures agree?

**2. `gilding` gates physically** via `isGildingMaterial`, stated in terms of `formability` and
`reactivity.oxidisation` so it reproduces itself under a changed catalogue — a newly-authored
non-tarnishing workable metal becomes gildable automatically, and a gold-rich culture does not
thereby make gold un-gildable.

**3. The five redundant pools drop their precious entries**, unchanged in membership.

**4. Trade flows re-key to `specificMaterials`.** Three shipped flows and several fixtures keyed on
a precious tag; re-keying to the class tag alone would have over-reached (a `precious-metal` flow
becoming a `metal` flow newly imports bronze and iron). `materialTag: 'metal'` with
`specificMaterials: ['gold','silver']` names each flow's intent. ⚠️ Corrected in PR #57 review: this
does **not** reproduce the old reach exactly. `flowSuppliesMaterial` ORs the tag arm with
`specificMaterials`, so the list widens a flow and can never narrow it — these flows do reach bronze
and iron. Availability is unaffected today (measured byte-identical to `origin/main` across four
presets and six regional worlds), and whether the field should narrow is filed as 2GN.112.

**5. `preciousMaterialsInDecoration` and its dormant rule survive, with a new producer contract.**
The inference — decoration incorporating materials the culture prizes reads elite/ceremonial — is
sound and is what doc 11 §2.9's formula was written to support. Only its input was wrong. 2GN.68
must populate the field from the material's _situation_, never a catalogue lookup. That formula's
four terms come from three places: `explainMaterialWeight` supplies availability and cultural
affinity (`level`, `culturalAffinity`, `tradeRescued`); provenance comes separately from
`MaterialAssignment.provenance` via `deriveMaterialProvenance`, since `tradeRescued` is a
reachability boolean and not a provenance substitute; and stratification from
`PhaseCharacteristics.society.stratification`, which doc 11 §2.9 makes live and nothing reads yet.
The threshold over them is 2GN.68's to rule. Deleting the rule instead would have discarded a
correct inference because its wiring was wrong.

**6. The affinity-reduction question dissolves rather than being answered.** With one tag per
material there is nothing to reduce; `max` is now vestigial in both `culturalAffinityWeight` and
`decoration.ts`'s inlined copy. Both JSDocs record that the choice was never ruled and needs one
before it carries weight again. A test pins the one-tag-per-material invariant that makes it
unreachable.

## Accepted loss

`CulturalProfile.materialAffinities` is keyed by `MaterialTag`, so a culture can no longer express
"we prize gold specifically" — only "we prize metal". Thalassar's authored `precious-metal: 1.2` was
the one live instance and is dropped rather than re-expressed as `metal: 1.2`, which would newly
favour bronze and iron that culture was never authored to prefer. Whether the map should support
per-material entries alongside per-tag ones is filed as a design question, not answered here.

## A behaviour change caught in review

The first implementation folded `ring-form`'s `metal: 0.4` and `precious-metal: 0.5` cultural
modifiers into a single `metal: 0.9`, reasoning that `effectiveOptionWeight` sums modifiers so the
combined pull should be preserved. The calibration harness failed: **R21 drifted 8.6pp** (25.3% →
33.9%).

The fold was wrong. A missing affinity reads as `0` in that sum, so the `precious-metal` term only
ever contributed for a culture whose `materialAffinities` authored that tag. Of the four Explorer
presets, only Thalassar did (see the table above), and Thalassar authors no `metal` affinity — so
the term paid out for no preset that would have received the folded `metal: 0.9`. Summing them
handed every `metal`-authoring culture a modifier more than double what they had, raising
`ring-form`'s share and everything downstream of it. The faithful fold is to drop the removed term
and leave `metal` at its authored `0.4`.

With that corrected, **the entire retirement is behaviour-neutral**: all 9 calibration tests pass
with no pin re-recorded. That is the strongest available evidence the change is a refactor rather
than a redesign. **General lesson: when removing a term from a summed weight, the arithmetically
"equivalent" fold is only equivalent if the removed term was actually contributing.**

## Rejected alternatives

**Keep max, delete the dead data.** Rule that max is correct and the defect is authored data (delete
Khaltiris' dead entry, add a lint against authoring a precious tag below its base). Zero
distribution change, smallest diff — but it permanently accepts that a culture cannot devalue a
precious material relative to its base, which sits badly against 2GN.77's world-relative ruling, and
leaves the valuation-as-class defect untouched.

**Most-specific-tag-wins.** Declare `precious-metal ⊂ metal` and read the narrowest authored tag.
Makes precious affinities bidirectional and every authored value live. Rejected because it invests
in making a judgement-bearing tag work properly rather than asking whether it should exist.

**Product of deviations.** Each authored tag multiplies its deviation from 1. Rejected: a two-tag
material would systematically outrank one-tag peers on tag count alone — a new bias of the same
family as the one being fixed.

**Delete `preciousMaterialsInDecoration` and its rule.** Cleaner mechanically (one fewer dormant
rule, one fewer index shift) but discards a sound inference over a mis-wired input. See ruling 5.
