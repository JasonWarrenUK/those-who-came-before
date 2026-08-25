# 2GN.131 — What the Decorative Recursion Depth Cap Computes

| Prop        | Value                                                                                        |
| ----------- | -------------------------------------------------------------------------------------------- |
| Status      | Ruled; unimplemented (lands in 2GN.32, inside 2GN.31's pass)                                 |
| Ruled       | 2026-08-25                                                                                   |
| Implemented | —                                                                                            |
| Ruling in   | This document; propagated to doc 11 §2.22 and doc 12 §2.58                                   |
| Outcome     | Emphasis drives the per-depth chance of a sublayer; craft drives the ceiling; anchor MAX = 3 |

## The question

2GN.32's title says the recursion depth cap comes from `craftSpecialisation` ×
`aesthetics.decorativeEmphasis`. No integer mapping, scale or decay exists anywhere. Doc 05 §8.3's
four-corner table is the only anchor:

| craft | emphasis | doc 05 §8.3                        |
| ----- | -------- | ---------------------------------- |
| low   | low      | 0–1 decorative layers              |
| high  | low      | 0–1 layers but technically refined |
| low   | high     | 1 layer, simple techniques         |
| high  | high     | up to 3 layers deep                |

Doc 11 §2.10 (2GN.98) measured that this table cannot be produced by one scalar over both axes (the
middle corners differ in kind, not amount) and split volume (emphasis alone) from grade (craft
alone), leaving depth unresolved. Depth is the same table, so the same trap applies. The notes also
cite a repo-root `BLOCKED.md` that does not exist.

## Method

Take real `expandDecoration` output for the default fixture profile at the four corners plus the
centre (500 seeds each), and roll a candidate depth model over it on its own `${seed}-sublayers`
stream (per 2GN.132's placement ruling):

- per-depth continuation chance: `BASE × decorativeEmphasis × DECAY^(depth−1)`, BASE 0.5, DECAY 0.5,
  mirroring the slot loop and the attachment-depth decay in `grammar.ts`;
- hard ceiling: `1 + round(craft × (MAX − 1))`, MAX 3, so craft under 0.25 cannot nest, 0.25–0.75
  may go two deep, above 0.75 three.

## Finding 1: the split reproduces the corners in kind

| craft | emphasis | ceiling | layers/component (flat) | artefacts reaching depth 1 / 2 / 3 | total layers with sublayers vs flat |
| ----: | -------: | ------: | ----------------------: | ---------------------------------- | ----------------------------------: |
|   0.1 |      0.1 |       1 |                    0.29 | 41% / 0 / 0 (59% undecorated)      |                        0.56 vs 0.56 |
|   0.9 |      0.1 |       3 |                    0.28 | 73% / 7% / 0                       |                        1.85 vs 1.77 |
|   0.1 |      0.9 |       1 |                    3.40 | 100% / 0 / 0                       |                        6.99 vs 6.99 |
|   0.9 |      0.9 |       3 |                    3.41 | 0 / 15% / 85%                      |                        32.6 vs 21.2 |
|   0.5 |      0.5 |       2 |                    1.63 | 22% / 78% / 0                      |                        8.31 vs 6.67 |

The two middle corners finally differ. A skilled austere culture is _allowed_ three deep and rarely
bothers (7% reach depth 2); a lavish unskilled one piles layers side by side and can never nest.
That is "refined" versus "simple" expressed in depth.

## Finding 2: the axis assignment is forced by the table's own wording

"1 layer, simple techniques" at low craft, high emphasis means craft caps depth: a culture that
cannot execute well cannot stack techniques on top of each other. "0–1 layers" at high craft, low
emphasis means emphasis caps count. Swapping the axes contradicts one corner each way; a product of
the two gives both middle corners the same value (0.09) and collapses them, which is §2.10's finding
one level down.

## Finding 3: the constants are not settled by this spike

85% of high/high artefacts reach depth 3 under BASE 0.5. An artefact carrying ~21 flat layers gets
that many chances, so the base chance wants lowering once the real pass exists and `maxDepth` can be
sampled as a feature: near-certain depth 3 is the same degeneracy §2.10 rejected for `grade = craft`
(a percentile ladder over it answers no question). 2GN.32 calibrates BASE, DECAY and the rounding
rule against measured output; this spike rules only the shape.

## Ruling

**Emphasis drives the chance; craft drives the ceiling.** Ruled by Jason 2026-08-25.

- Continuation probability at depth `d` (1-based, parent at depth `d`):
  `BASE_SUBLAYER_PROBABILITY × decorationVolume(phase) × SUBLAYER_DECAY^(d−1)`, reusing
  `decorationVolume` so the volume axis has exactly one reader.
- Ceiling: `MAX_SUBLAYER_DEPTH = 3` (doc 05 §8.3's anchor), scaled by craft:
  `1 + round(craftSpecialisation × (MAX_SUBLAYER_DEPTH − 1))`. Provisional; 2GN.32 may replace
  `round` with a measured cut.
- Constants BASE 0.5 and DECAY 0.5 are starting points only (Finding 3).
- Lands inside 2GN.31's `expandSublayers` pass per 2GN.132; 2GN.32's remaining scope is the
  calibration.
- `types/world.ts`'s `PhaseCharacteristics` JSDoc, which says craft alone raises "the decorative
  grammar's recursion cap", is corrected with this ruling: craft raises the ceiling, emphasis the
  chance.

## Rejected alternatives

**Single product, fixed cap.** `BASE × craft × emphasis × DECAY^d`, cap 3 for everyone. The blended
scalar §2.10 rejected; Finding 2 shows the middle corners collapse.

**Craft only.** The stale `types/world.ts` reading. Low craft, high emphasis would nest as readily
as high/high, contradicting "1 layer, simple techniques".

**Emphasis only, no craft ceiling.** Same corner contradiction from the other side, and it leaves
craft with no depth role at all, against 2GN.32's title and doc 05.

## Wider lesson

Doc 05's four-corner tables describe two axes and read as if they describe one number. Every time
one has been implemented (volume, grade, now depth) the answer has been to give each axis its own
lever and let the corners fall out of the combination, rather than to search for a weighting that
makes one lever do both jobs.
