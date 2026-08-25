# 2GN.112 — Should `MaterialFlow.specificMaterials` Narrow a Flow or Widen It?

| Prop        | Value                                                                                             |
| ----------- | ------------------------------------------------------------------------------------------------- |
| Status      | Ruled; implemented                                                                                |
| Implemented | 2026-08-12, same branch (PR #57)                                                                  |
| Ruled       | 2026-08-12                                                                                        |
| Ruling in   | Doc 05 §3.4 and doc 12 §2.41; the roadmap entry for 2GN.112 carries the full argument             |
| Outcome     | Neither: field removed; `includes: MaterialSelector[]` + optional `excludes`, union then subtract |

## Why this file is a stub

This spike was ruled in a PR review rather than a spike session, and the argument was written into
the roadmap task description. This file exists so the directory index is complete and a search of
`docs/spikes/` finds the ruling.

## The question

`MaterialFlow` had two fields feeding one selector (`materialTag` + `specificMaterials`) with the
combining rule unstated: `flowSuppliesMaterial` ORed them while the type's JSDoc claimed the id list
narrowed the tag. So the list could only widen, and 2GN.78's three re-keyed flows silently reached
the whole material class.

## Where the reasoning lives

- **Doc 05 §3.4** publishes the new shape: `MaterialSelector` is a tagged union of a `tag` arm
  (`MaterialTag`) and an `id` arm (`MaterialName`), tagged because `bone`, `glass` and `leather`
  each name both a tag and an id.
- **Doc 12 §2.41** records the propagation, including the one measured behaviour change (Thalassar
  lost jade, which had been arriving through the obsidian flow's `stone` arm under the OR).
- **`MaterialName`** (`types/tags.ts`) was added in scope: every material id is now typed, pinned to
  the catalogue by a two-directional test.
- **Open:** whether `excludes` should ever carry a `{ tag }` arm in authored data (typed for it, no
  shipped flow uses one).
