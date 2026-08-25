# 2GN.98 — What Does Decorative Volume Key On?

| Prop        | Value                                                                                          |
| ----------- | ---------------------------------------------------------------------------------------------- |
| Status      | Ruled; implemented                                                                             |
| Implemented | 2026-08-06, same task: `DecorativeLayer.grade`, `TECHNIQUE_DIFFICULTY`, rule R44               |
| Ruled       | 2026-08-06                                                                                     |
| Ruling in   | Doc 11 §2.10 (locked decision; closes doc 11 §1.5); doc 12 §2.33 (measurements)                |
| Outcome     | Volume reads `decorativeEmphasis` alone; a separate `grade` reads craft × technique difficulty |

## Why this file is a stub

This spike predates `docs/spikes/`. It was ruled while recalibrating `expandDecoration` and recorded
directly in doc 11 §2.10 and doc 12 §2.33. This file exists so the directory index is complete and a
search of `docs/spikes/` finds the ruling.

## The question

Doc 11 §1.5 asked whether decorative volume keys on `aesthetics.decorativeEmphasis`,
`society.craftSpecialisation` or a blend. The pre-ruling blend double-counted craft (2GN.83) and
made doc 05 §8.3's two middle corners indistinguishable (1.65 / 1.65 layers per component).

## Where the reasoning lives

- **Doc 11 §2.10**: the split. Volume is emphasis-only; execution quality is a new
  `DecorativeLayer.grade` computed as `craft * (1 - 0.5*difficulty) + 0.5*difficulty*craft²`.
- **Doc 12 §2.33**: the two cheaper shapes tried and rejected (biasing technique selection toward
  low-difficulty at low craft; `grade = craftSpecialisation` alone, degenerate as a sampled
  feature), the four-corner re-measurement (0.41–0.46 / 0.46–0.54 / 2.7–3.3 / 2.8–3.3), and the R44
  p90 choice.
- **Open follow-ups:** 2GN.131 (what the recursion depth cap computes from the same two inputs),
  2GN.106 (`formability` as a difficulty axis).
