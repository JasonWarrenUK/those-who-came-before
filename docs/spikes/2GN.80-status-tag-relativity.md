# 2GN.80 — Are Status Tags Absolute Across the World, or Relative to the Producing Culture?

| Prop      | Value                                                                           |
| --------- | ------------------------------------------------------------------------------- |
| Status    | Ruled; implemented (2GN.82–85 recalibration, `baselines.ts`)                    |
| Ruled     | 2026-08-04, jointly with 2GN.77                                                 |
| Ruling in | Doc 11 §2.9 (locked decision); doc 12 §2.28 (rationale and measurements)        |
| Outcome   | Culture-relative by awarded tag; empirical per-culture-phase baselines at n=400 |

## Why this file is a stub

This spike predates `docs/spikes/`. It was ruled interactively against the Rule Calibration panel
(2GN.81) and recorded directly in doc 11 §2.9 and doc 12 §2.28. This file exists so the directory
index is complete and a search of `docs/spikes/` finds the ruling.

## The question

Every threshold in `data/classification.ts` was an absolute constant and every one was strongly
phase-sensitive: the applied-element rule fired on 4.3% of output at `decorativeEmphasis` 0.1 and
48.1% at 1.0. So `elite` meant "unusually decorated in absolute terms", making a highly decorative
culture read as composed almost entirely of elites and an austere one as having none. The same
failure 2GN.77 identifies for materials, reached from the decoration side.

## Where the reasoning lives

- **Doc 11 §2.9**: the ruling, the absolute/relative vocabulary split, the
  `ClassificationRule.condition` signature widening to `(features, context) => boolean`, and
  `PhaseCharacteristics.society.stratification` becoming a live input.
- **Doc 12 §2.28**: why n=400 (a baseline is a percentile, not a proportion; worst-case relative
  spread 20–28% at n=100 versus 8–17% at n=400), why thresholds are fractional, why drift is
  measured against the preceding phase only and the culture-wide baseline was dropped as incoherent.
- **Downstream spikes:** 2GN.97 (what the ruling means for categorical rules that cannot be
  percentiled), 2GN.142 (region key for material baselines), 2GN.119 (open: relational conditions).
