# 2GN.68: Decoration Needed the Same Stratum Draw Materials Got

| Prop      | Value                                                                                                                            |
| --------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Status    | Ruled; implementation in the same task                                                                                           |
| Ruled     | 2026-09-17                                                                                                                       |
| Ruling in | This document; propagated to doc 11 §2.9 (third amendment) and doc 12 §2.61                                                      |
| Outcome   | `assignDecorativeDetails` shares `assignMaterials`' stratum draw; the two all-prized pools are a filed follow-up, not fixed here |

## The question

2GN.68 was filed to give two dormant `ExtractedFeatures` fields producers:
`preciousMaterialsInDecoration` (a layer material the culture prizes reads elite/ceremonial/votive)
and `motifCulturalOrigins` (which cultures' motif vocabularies a layer's motifs represent). Every
upstream ruling was in place: 2GN.78 retired the catalogue `precious-*` tags, 2GN.27 shipped
`materialStanding()` for structural components and named the field 2GN.68's to reuse it for. The
motif half turned out to be a straightforward lookup. The material half reproduced the exact failure
2GN.27 diagnosed for structural materials, arriving from the decoration side and hitting harder.

A second, prerequisite problem existed alongside the design question: `assignDecorativeDetails`
(roadmap 2GN.33) had shipped since 2026-08 but had **no production caller anywhere in `src/`** — six
call sites ran `expandDecoration → assignMaterials → gradeDecorativeLayers` without it, so
`DecorativeLayer.motifRef`/`.material` were never populated outside its own tests. Wiring it in was
this task's to do regardless of how the material-standing question resolved.

## Measured before the fix

Wiring `assignDecorativeDetails` into the pipeline and reading
`materialStanding(material, culture, phase, geology) >= STANDING_CUT` per layer, n=400 per Explorer
preset:

| preset    | stratification | material-bearing layers/artefact | R32 unmodulated |
| --------- | -------------- | -------------------------------- | --------------- |
| tarpan    | 0.4            | 1.4                              | 29.3%           |
| thalassar | 0.6            | 6.2                              | 92.0%           |
| xoconahtl | 0.6            | 8.3                              | 95.0%           |
| khaltiris | 0.85           | 7.7                              | 72.0%           |

For comparison, 2GN.27's material-side rule realises 12–35% after its stratum draw; the same rule
measured 31–74% before that draw existed. Decoration's unmodulated rate sits even higher because it
has more draws per artefact (6–8 layers against 2–6 structural components), and the underlying cause
is identical: 6–9 of the sixteen-material catalogue clear `STANDING_CUT` in every preset (half a
small catalogue reads as prized almost everywhere, per 2GN.27's own Finding 1), and a `max`/`any`
reduction over several independent draws makes hitting at least one near-certain.

Confirmed this is structural, not an artefact of these four cultures' authorship: at true neutral
(affinity 1, geology `available` everywhere), `materialStanding` gives every material `1.67`, none
clearing the cut of 3. The 40–80% figure comes entirely from materials sitting at `scarce` or rarer,
which the 2GN.27 spike already measured as general across six fixture worlds and four presets (4 to
13 of 16 clear the cut), not a property of any one authored culture.

## Four rejected mechanisms

**A: fixed threshold over the prized-layer count.** `>= 3` gives 1.0/53.0/70.0/12.3% across the four
presets — no value fits all four, because the arithmetic is count-sensitive, not
threshold-sensitive.

**B: percentile over the prized-layer count.** Tidy-looking at p90 (29.3/19.8/11.3/12.3%), but the
quantity is a small integer, so ladder rungs collapse onto the same value (tarpan's p75 and p90 are
both `1.00`; khaltiris' p90 and p95 are both `3.00`) — the exact "whole tie blocks" defect the
2GN.27 spike already rejected for materials. It also fails to track stratification (0.4 → 29.3%,
0.85 → 12.3%, inverted): it tracks each preset's layer count, not its society. `materialStanding` is
already normalised by the culture's own geology and opinion; percentiling it again is the double
normalisation 2GN.27 ruled against.

**C: a per-layer stratum weight nudge alone.** Applying `assignDecorativeDetails`'
`ELITE_PRIZED_BOOST`/`COMMONER_PRIZED_SUPPRESSION` (2GN.27's constants, unmodified — a sweep down to
0.002 moved the resulting rates by under 1 percentage point, so retuning the constant was never the
lever) to the introduced-material weight callback moves the four presets to 23.0/73.0/87.3/37.3%.
Thalassar and xoconahtl commoners still hit 63.9% and 84.2%.

**D: "prized relative to the layer's own pool" (four readings).** Jason's first ruling on the
mechanism: a layer counts as precious only when its material beat a real cheaper alternative in that
technique's own candidate pool, not merely cleared the absolute cut. Measured four readings — (a)
prized and the pool had a cheaper option, (b) prized and standing at or above the pool's median, (c)
standing equal to the pool's maximum and the pool had a cheaper option, (d) prized and standing at
or above the pool's own p75 — against the unmodulated baseline. All four stayed in the 65–96% band
for thalassar/xoconahtl. The reason: `inlay` and `beading` (13- and 11-material pools, the two
techniques carrying most material-bearing layers) are already 40–80% prized before any relative
comparison, and 6–8 draws per artefact saturate any per-layer predicate under `max`/`any` regardless
of how the single-layer predicate is phrased. The per-layer comparison, however defined, cannot fix
a per-artefact aggregation problem.

## The ruling

**The aggregation problem needed an aggregation fix, not a fifth per-layer reading — 2GN.27's actual
mechanism, applied to decoration.** `assignMaterials` draws one stratum per artefact and gates every
component's selection weight under it; `assignDecorativeDetails` now does the identical thing for
introduced-material layers. `stratumFactor(standing, stratum)` (`materials.ts`) is exported so the
two call sites share one implementation rather than two copies of the same arithmetic.

**The stratum is shared between the two calls, not drawn independently.** An independent draw was
the first instinct — its own PRNG stream, no signature change needed elsewhere — but at khaltiris'
`eliteShare = 0.34` roughly 45% of artefacts would land commoner-in-materials and
elite-in-decoration simultaneously under two independent coin flips, against the Varna reasoning
2GN.27's own spike used: stratum is one fact about an artefact, not two. `assignMaterials` gains an
optional `stratum?: ArtefactStratum` parameter — supplied, used directly; omitted, drawn internally
exactly as before, so every existing call site is unaffected. `assignDecorativeDetails` gains the
identical parameter.

**The shared draw preserves every existing PRNG stream's consumption exactly.** Each of the six
production call sites draws the stratum once, as the _first value_ of the `${seed}-materials` stream
— the identical position `assignMaterials` drew it from internally before this parameter existed —
then passes the resulting `stratum` into both calls. This is not a new stream: it is the same draw,
relocated one statement earlier, so structural material selection is bit-identical to before.
Verified: R1–R31 and R34–R43 measured bit-identical against `EXPECTED_FIRE_RATES` after the change.

**Motif origins collect as a `Set`, never a plain array.** Every native motif in a culture's
`motifVocabulary.motifs` shares that culture's own id as its `culturalOrigin`. An ungated array push
across several native-motif layers reads `['tarpan', 'tarpan']` — length 2 — which would wrongly
satisfy `motifCulturalOrigins.length > 1` on a purely native artefact. Resolution reads the
_producing_ culture's own vocabulary only, never scanning other cultures': every layer's motif was
drawn from that pool (native or borrowed via `assignDecorativeDetails`'s `sharedMotifSources`), and
some motif ids repeat across cultures' authored vocabularies (e.g. `winged-disc`, present in both
Tarpan's and Khaltiris' vocabularies in `data/explorer-cultures.ts`), making a global scan both
unnecessary and ambiguous.

**`extractFeatures` widens with optional, not defaulted, world-context parameters.** Populating
`preciousMaterialsInDecoration` needs `materialStanding(material, culture, phase, geology)` per
layer; no upstream stage stamps an equivalent standing onto `DecorativeLayer` the way
`MaterialAssignment.standing` is stamped for structural components (adding one would be scope
`assignDecorativeDetails` — already `done`, pinned by its own tests — doesn't own). Widening
`extractFeatures`'s signature is the smaller, contained change, and a deliberate, documented
departure from the module's stated "stays free of world context" contract for this one field family.
The three new parameters (`culture`, `phase`, `geology`, plus a `materialCatalogue` default) are
**optional with no fabricated default**, not a synthetic "neutral" culture: omitted,
`motifCulturalOrigins` stays `[]` and `preciousMaterialsInDecoration` stays `false`, the same
honest-no-evidence convention `materialStanding` (structural) already uses when `assignments` is
empty. A bare-structure caller with no world context genuinely has no evidence about either field.
This kept all 57 existing 3-argument call sites in `classification.test.ts` unchanged.

## Constants, as measured

Reused verbatim from 2GN.27 (`ELITE_PRIZED_BOOST = 3`, `COMMONER_PRIZED_SUPPRESSION = 0.05`,
`STANDING_CUT = 3`) — no new constant was authored for decoration.

| measurement                                  | value                            | notes                                                                                                                                                                                         |
| -------------------------------------------- | -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Stratum-modulated rate (four presets)        | 23.0 / 73.0 / 87.3 / 37.3%       | Down from 29.3/92.0/95.0/72.0% unmodulated                                                                                                                                                    |
| Residual traced to `gilding`/`wire-wrapping` | 79–97% of commoner-artefact hits | Forced-commoner probe, per-technique tally                                                                                                                                                    |
| Every other technique's commoner suppression | 0.3–0.8%                         | The stratum draw works everywhere it has room to                                                                                                                                              |
| R32 realised (fixture worlds, n=1800)        | 56.5%                            | Above the preset range for the same reason R44 sits above its own preset range: `mockCulturalProfile` faces fixture geologies with more scarce/trade-only materials than the authored presets |
| R33 realised (fixture worlds, n=1800)        | 25.8%                            | Reachable only once `mockMotifVocabulary` carries a second, foreign-origin motif                                                                                                              |

## Rejected alternatives

See "Four rejected mechanisms" above for A–D in full. Summarised: a fixed threshold and a percentile
both fail on the same grounds 2GN.27 already established for materials (no cut fits every preset;
percentiling an already-normalised, small-integer quantity collapses into tie blocks and inverts
against stratification). A per-layer stratum nudge alone is insufficient once a candidate pool is
wholly prized, since there is nothing to redirect weight toward. Pool-relative framing, in every
variant tried, cannot fix a per-artefact aggregation problem with a per-layer predicate.

## Consequences

- `engine/generation/materials.ts`: `assignMaterials` gains optional `stratum?: ArtefactStratum`;
  `stratumFactor` exported.
- `engine/generation/decoration.ts`: `assignDecorativeDetails` gains the identical optional
  `stratum` parameter and applies `stratumFactor` to its introduced-material weight callback.
- `engine/generation/classification.ts`: `extractFeatures` gains optional `culture`, `phase`,
  `geology`, and a defaulted `materialCatalogue`; `tallyLayers` extended to resolve motif origins
  (via a `Set`) and layer-material standing in the same recursive walk that already tallies
  technique/motif/grade counts.
- Six production call sites wired with `assignDecorativeDetails` and the shared stratum draw:
  `engine/generation/baselines.ts`, `routes/dev/explorer/calibration/ruleCalibration.ts`,
  `routes/dev/explorer/tags/tagInspector.ts`, `data/calibration.test.ts`,
  `routes/dev/explorer/decoration/decorationLayers.ts` (display consistency; doesn't call
  `extractFeatures`), `scripts/dev/sample-classification.ts`.
- `data/classification.ts`: R32 (`precious-materials-in-decoration`) and R33
  (`motif-multiple-origins`) JSDoc updated from dormant-authored to live-producer, with the
  superseded four-term/provenance formula text corrected.
- ⚠️ Calibration-shifting, done: `calibration.test.ts`'s `DORMANT_RULE_INDICES` emptied; R32/R33
  re-recorded at 56.5%/25.8% in `EXPECTED_FIRE_RATES`; every other entry (R1–R31, R34–R43) confirmed
  bit-identical.
- `tests/fixtures/culture.ts`: `mockMotifVocabulary` extended with a second, foreign-origin motif
  (`diffusion-motif`, origin `foreign-culture`) — needed for R33 to be reachable through the fixture
  at all. Confirmed to move no pinned baseline: `weightedSelect` (`prng.ts`) consumes exactly one
  `prng()` draw per motif-carrying layer regardless of pool size, so this changes which motif a
  layer draws, never how many draws happen; `SAMPLED_FEATURES` (`baselines.ts`) lists no
  motif-derived field.
- `routes/dev/explorer/tags/tagInspector.ts`: `DORMANT_FIELDS` emptied. Caught in passing:
  `motifPresent` was still listed there despite being live since 2GN.33 — pre-existing staleness,
  not introduced by this task, found by this task's own dormancy sweep.
- Doc 11 §2.9: third amendment to the 2GN.27/2GN.143 formula block, recording the decoration-side
  stratum draw and the all-prized-pool finding. Doc 12 §2.61 records the ruling.
- Roadmap: 2GN.68 marked done. A follow-up task filed to widen `wire-wrapping`'s `['metal']`-only
  tag set and audit `isGildingMaterial`'s gold/silver-only realised pool, so a stratum-modulated
  draw has at least one non-prized candidate to redirect toward per culture. Owner: 2GN.28/2GN.78
  territory (`data/decorations.ts`, `engine/generation/decoration.ts`), not 2GN.68 — a
  data-authoring gap, not a design question.

## Reopen conditions

If the follow-up task widens `gilding`/`wire-wrapping`'s pools, re-measure R32 against the four
Explorer presets and record the new rate; the 56.5%/23.0–87.3% figures here are the state before
that fix. If a future task lets `assignMaterials`'s stratum be recorded as a fact on the artefact
itself (2GN.27's own reopen condition, for the contradiction system to check a scholar's "made for
the elite" claim against ground truth), the shared-draw mechanism here already supplies exactly that
fact — nothing about this ruling would need to change, only a new consumer added.
