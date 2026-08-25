# 2GN.77 — Does a Material's Classificatory Value Come From a Catalogue or From the World?

| Prop      | Value                                                                                            |
| --------- | ------------------------------------------------------------------------------------------------ |
| Status    | Ruled; implemented (2GN.78 retired the `precious-*` tags, 2GN.82–85 recalibrated)                |
| Ruled     | 2026-08-04, jointly with 2GN.80                                                                  |
| Ruling in | Doc 11 §2.9 (locked decision); doc 12 §2.28 (rationale and measurements)                         |
| Outcome   | World-relative: availability × cultural affinity × provenance × stratification; no catalogue tag |

## Why this file is a stub

This spike predates `docs/spikes/`. It was ruled interactively against Explorer calibration output
and recorded directly in doc 11 §2.9 and doc 12 §2.28 rather than as a standalone write-up. This
file exists so the directory index is complete and a search of `docs/spikes/` finds the ruling.

## The question

The static model bakes an Earth judgement into `data/materials.ts`: a generated culture with
abundant gold would have `elite` stamped across most of its material record under a naive
material→tag rule, while obsidian in a culture with no volcanic geology reads ordinary despite being
genuinely scarce there. Should value derive from `MaterialTag`'s `precious-metal`/`precious-stone`
members, or from the material's situation in the generated world?

## Where the reasoning lives

- **Doc 11 §2.9** holds the ruling for both surfaces (materials here, decoration in 2GN.80): status
  tags are culture-relative, physical/function tags stay absolute, and the boundary is cut by the
  tag a rule awards rather than the feature its condition reads.
- **Doc 12 §2.28** holds the measurements: the n=400 baseline sample-size derivation, fractional
  percentile thresholds, drift against the immediately preceding phase only.
- **`docs/spikes/2GN.78-precious-material-tags.md`** is the follow-on that retired the `precious-*`
  members once this ruling made them dead inputs.
- **Open follow-ups:** 2GN.143 (provenance's exact role in the formula, since it is categorical and
  cannot be a literal multiplier), 2GN.27 and 2GN.68 (the consumers).
