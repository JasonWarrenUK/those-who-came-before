# 2GN.142 — Region Dimension for Classification Baselines

| Prop        | Value                                                                              |
| ----------- | ----------------------------------------------------------------------------------- |
| Status      | Ruled; unimplemented                                                                |
| Ruled       | 2026-08-24                                                                           |
| Implemented | —                                                                                    |
| Ruling in   | This document; propagated to doc 11 §2.9 and doc 12                                 |
| Outcome     | Region is world-level, referenced by `CulturePhase.geography.regions`; production region := deposition region for MVP; `bestRegionalLevel` resolves against the phase's occupied regions, not the whole world |

## The question

Doc 11 §2.9 states plainly: "material baselines are keyed by culture-phase × region." Geology is
regional and culture is not — nothing binds a culture to a single region — so a culture spanning two
regions faces different material availability in each. Decoration baselines need no region key;
material ones do.

No part of that is implemented. `ClassificationContext` (`types/tags.ts`) carries only
`cultureId`/`phaseId`; `FeatureBaseline` has no region field; `sampleBaselines`
(`engine/generation/baselines.ts`) has no region dimension anywhere. The claim's closest thing to an
implementation is eighteen hand-built contexts in `calibration.test.ts`, keyed by abusing
`cultureId` to hold a region name.

Three questions, ruled in dependency order (Q3 constrains Q1, Q1 constrains Q2):

1. Does `ClassificationContext` gain a region field, or do region-keyed baselines live in a separate
   structure?
2. Does the sampling pass need a per-region pass mirroring `EXPECTED_MEAN_GRADE_BY_REGION`'s
   precedent?
3. How does a rule read a region-keyed baseline when an artefact's producing region isn't known to
   the classification-time context?

## Finding 1: the sampler is region-collapsing, not region-sensitive

`bestRegionalLevel` (`engine/generation/materials.ts:106-120`) iterates every region in a
`GeologicalContext` and returns the **best** availability level across all of them. One
`GeologicalContext` spans the whole world's regions, and `assignMaterials` resolves each material to
its best-case region regardless of which region the producing culture actually occupies.

For doc 11's own motivating case — a culture spanning two regions — the current code produces one
baseline against best-of-*every*-region availability, which is precisely the defect the region key
exists to prevent. It reads as region-sensitive only because every shipped preset happens to model
exactly one region: `geology(region, levels)` (`data/explorer-cultures.ts:109`) builds
`regions: new Map([[region, level]])`, a single key. The calibration test's measured per-region
variation (`EXPECTED_MEAN_GRADE_BY_REGION`) lives in the **fixture** narrowing geology to one region
per cell, not in any region-awareness in the sampling code itself.

`materials.ts:10-19`'s own module JSDoc already names the boundary: there is no culture→region
mapping, `Culture` carries no region field, and `isAvailable` "answers a region-agnostic question".
`materials.ts:134-139` records a prior instance of exactly this collapse causing a real divergence
(`cultureValidation.ts` read the culture's first region while the engine read the best), invisible
for the same single-region-preset reason.

## Finding 2: no rule reads a region, and none needs to

All ten `ClassificationRule.condition` call sites that touch `ClassificationContext`
(`data/classification.ts`, lines 403, 422, 471, 539, 556, 609, 634, 661, 690, 728) call only
`context.exceeds(feature, percentile, value)`. None reads `cultureId`, `phaseId` or `baselines`
directly; none calls `hasBaseline`.

So a region dimension can be added **without touching any rule or widening
`ClassificationRule.condition`'s signature again**, provided it is resolved by whichever caller
selects the context for a given artefact, not exposed as a new `exceeds` parameter. Widening
`exceeds` itself would touch all ten call sites for no benefit, since nothing downstream of `exceeds`
needs to know which region produced the threshold it compared against.

## Finding 3: classification time cannot know the producing region today, but a landable path exists

Traced end to end: `NormalisedArtefact` carries no provenance; `ExtractedFeatures` carries none, and
`extractFeatures(artefact, layers)` does not even receive the `MaterialAssignment[]` that would carry
a region signal. `ClassifiedArtefact` does carry `provenance: Provenance` (hence
`provenance.site.region`) — but it is the pipeline's terminal product, assembled *after*
classification, and nothing in `src/` constructs one yet.

`Provenance.site.region` (`types/world.ts:558`) is **deposition** region — where the artefact was
found — not **production** region — where it was made. These are different facts in general (an
artefact made in one region can be deposited, traded or lost in another), and doc 11's geology-driven
reasoning is about production. `deriveMaterialProvenance`'s `likelyOriginRegion`
(`materials.ts:519-536`) is the only production-region-shaped signal that exists, and it is set only
on the `'local'` assignment branch — `'regional'` is never produced at all, since no inter-region
distance is modelled.

**Ruled: production region is a complete copy of (or reference to) deposition region for MVP.** This
is not a fudge specific to this spike — every currently-authored world is single-region, so the two
values are identical in practice today regardless of which one a reader asks for. The type-level
distinction between production and deposition region is kept (they are different facts and will
diverge once trade/deposition modelling lands), but no separate production-region pipeline is built
now. This makes Q3's original blocking concern moot: once `Provenance` exists (2GN.47), a
classification-time reader has a real region to consult, standing in for production until something
more precise is modelled.

## Finding 4: region belongs on `CulturePhase`, grouped for future multi-region spans

Region is a fact about geology — prescribed once at world generation, occluded, unchanging
(`GeologicalContext`'s own doc) — not a fact about culture identity. A culture does not own a region;
it occupies one (or several) during a phase, consistent with cultures migrating or expanding over
their timeline, and consistent with baselines already being keyed at the culture-**phase** level
rather than the culture level.

`CulturePhase` (`types/world.ts:136-151`) is the real world-model type — `id`, `label`, `startYear`,
`endYear`, `characteristics` — with no geography grouping today. It gains one:

```typescript
export interface CulturePhase {
	id: string;
	label: string;
	startYear: number;
	endYear: number;
	characteristics: PhaseCharacteristics;

	/** Regions this phase's population occupies (doc 11 §2.9). Plural: a phase may span more than one. */
	geography: {
		regions: string[];
	};
}
```

Grouped under `geography` rather than a flat `region` field, deliberately for the "culture spans two
regions" case doc 11 already names as the motivating scenario — a flat singular field would need a
second breaking change the moment that case is modelled for real, and doc 11's own wording never
promised a culture-phase maps to exactly one region.

`region`/`regions` stays a bare `string`/`string[]` rather than a minted `RegionId` type. No reader
anywhere needs nominal typing today, and inventing one now would be authoring a contract against
unobserved behaviour — the precedent 2GN.127 Finding 1 states directly and this spike follows.
Filed rather than absorbed if a future task needs it.

## Finding 5: `CulturePhaseSample` gains `geography` directly, not a real `CulturePhase`

`CulturePhaseSample` (`baselines.ts:74-81`) is a structural parameter bag, not a real `CulturePhase`,
precisely because no culture/phase generator exists yet (3WS.3/3WS.4) — its own doc states "nothing
here has to change when 3WS.9 lands". Forcing it to hold a full `CulturePhase` now to get at
`geography` would violate that property for no benefit. It gains the field directly instead:

```typescript
export interface CulturePhaseSample {
	cultureId: string;
	phaseId: string;
	profile: CulturalProfile;
	phase: PhaseCharacteristics;
	geology: GeologicalContext;
	trade: readonly MaterialFlow[];
	geography: { regions: string[] };
}
```

## Finding 6: `bestRegionalLevel`'s fix is "best across occupied regions", not "best across the world"

With `CulturePhase.geography.regions` established, the collapse in Finding 1 has a real fix:
`bestRegionalLevel` resolves the best availability level across the region(s) the culture-phase
actually occupies, not every region `GeologicalContext.materialAvailability` happens to model. A
culture confined to `riverValley`/`highlandMine` should not be credited with `coastalPort`'s abundant
fish-glue.

This still returns a *best-of* result when a phase spans multiple regions (unavoidable — one
material weight has to come from somewhere when several regions are candidates), but the set it
scans over is now the phase's real footprint rather than the whole world's. `bestRegionalLevel`'s
callers (`isAvailable`, `scarcityWeight`, `explainMaterialWeight`, `deriveMaterialProvenance`) need
the phase's `geography.regions` threaded in wherever they currently receive only a bare
`GeologicalContext`.

## The ruling

> Region is a world/geology-level fact, referenced by `CulturePhase.geography.regions: string[]`
> (plural, grouped for a future multi-region span). `bestRegionalLevel` resolves availability against
> a culture-phase's occupied regions rather than scanning every region in the world, fixing the
> collapse Finding 1 measured. `ClassificationContext` and `CulturePhaseSample` carry a matching
> `geography`/region label sourced from the same field, for provenance — no rule reads it directly
> (Finding 2), so `ClassificationRule.condition`'s signature does not widen again. Production region
> is treated as a complete copy of deposition region (`Provenance.site.region`) for MVP; the two stay
> type-distinct for when trade/deposition modelling makes them diverge, but no separate
> production-region pipeline is built now (Finding 3). No `RegionId` nominal type is minted (Finding
> 4) — filed if a future reader needs one.

## Consequences

- **`CulturePhase`** (`types/world.ts`) gains `geography: { regions: string[] }`. ⚠️ Breaking type
  change — no `CulturePhase` is constructed anywhere in `src/` yet (real culture generation lands at
  3WS.3/3WS.4), so there is no migration cost today.
- **`CulturePhaseSample`** (`baselines.ts`) gains `geography: { regions: string[] }` directly, not a
  nested `CulturePhase`. Every construction site needs the field: `sampleBaselines`'s callers,
  `baselineFor` (`calibration.test.ts:298`), `baselineFor`
  (`routes/dev/explorer/shared/baselineCache.ts:42`), and the `tests/fixtures/artefact.ts:172`
  builder.
- **`ClassificationContext`** (`types/tags.ts`) gains a region label sourced from the sampled
  culture-phase's `geography.regions`, alongside the existing `cultureId`/`phaseId` provenance
  labels. `emptyClassificationContext` needs an empty/placeholder value for it.
- **`bestRegionalLevel`** (`materials.ts`) signature widens to accept the culture-phase's occupied
  regions (or the whole `CulturePhaseSample`/equivalent) instead of scanning
  `GeologicalContext.materialAvailability` unconstrained. Its four callers (`isAvailable`,
  `scarcityWeight`, `explainMaterialWeight`, `deriveMaterialProvenance`) need the region set threaded
  through, which touches `assignMaterials`'s call chain.
- **`calibration.test.ts`'s `baselineFor`** stops abusing `cultureId` to hold a region name (Finding
  in the original task text) — it can pass the region through the new `geography` field instead,
  which is the more honest fix its workaround was standing in for.
- **Recalibration risk**: fixing `bestRegionalLevel`'s collapse changes which availability level
  every multi-region test world resolves to per material. The six `mockRegionalWorld` fixtures are
  each single-region already, so `EXPECTED_MEAN_GRADE_BY_REGION` and other calibration pins are
  **not** expected to move — the fix only changes behaviour once a culture-phase's
  `geography.regions` has more than one entry, which nothing shipped does yet. Re-run
  `deno task test` to confirm before landing.
- **2GN.27 and 2GN.68 are unblocked**: both share the identical four-term formula and the identical
  gap this spike closes. Neither needs further deferral once the fields above land.
