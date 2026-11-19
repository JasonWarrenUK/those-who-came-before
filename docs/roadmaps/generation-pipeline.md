# Those Who Came Before: Generation Pipeline

**State:** active. Every open task after 2GN.165 waits on Milestone 1 (Stack Migration). Index:
[roadmaps](README.md).

---

## Milestone 1: Stack Migration

**Goal:** Move off Deno (runtime development ends ~Oct 2027, Deno Deploy shuts ~Apr 2027) to Bun and
a deployment target ruled by spike; every other open task waits on it

- [ ] **11SM.1**: design spike: rule the stack replacing Deno: runtime (Bun), test runner
      (`bun:test` vs Vitest), formatter and linter replacing `deno fmt`/`deno lint` (keeping tabs,
      100 columns, single quotes), SvelteKit adapter replacing `@deno/svelte-adapter`, and
      deployment host
- [ ] **11SM.2**: `package.json` + Bun: replace `deno.json` tasks and import map with package.json
      scripts and dependencies, a Bun lockfile, and the adapter swap in `svelte.config.js`
      _(blocked: depends on 11SM.1)_
- [ ] **11SM.3**: test port: the 55 test files on `Deno.test` + `@std/assert` move to the runner
      11SM.1 rules; `docs/docs-rule-counts.test.ts` filesystem walk moves off Deno APIs _(blocked:
      depends on 11SM.2)_
- [ ] **11SM.4**: formatter and linter config replacing `deno fmt`/`deno lint`, with the one-off
      reformat in its own commit _(blocked: depends on 11SM.2)_
- [ ] **11SM.5**: `scripts/dev/` samplers: replace `Deno.Command`, `Deno.env` and `Deno.args` with
      Bun equivalents _(blocked: depends on 11SM.2)_
- [ ] **11SM.6**: deployment: build and CI workflow for the host 11SM.1 rules, coexisting with the
      existing `site/` GitHub Pages workflow; CI runs tests and type checking _(blocked: depends on
      11SM.2, 11SM.3)_
- [ ] **11SM.7**: docs: CLAUDE.md (development commands, stack, migration notes), doc 08 tech stack
      and adapter sections, README, doc 11 locked decision, doc 12 propagation entry _(blocked:
      depends on 11SM.2, 11SM.3, 11SM.4, 11SM.5, 11SM.6)_

---

## Milestone 2: Structural Grammar

**Goal:** Geometric primitives expand into culture-biased component trees, normalised into ordered,
oriented artefacts

- [x] **2GN.8** — `engine/generation/grammar.ts` — normalisation: flatten grammar tree →
      `NormalisedArtefact` with ordered components, computed dimensions, derived portability
      (exported `normaliseArtefact(object, id): NormalisedArtefact` — depth-first,
      primary-before-attachments flatten mirroring `expandGroup`/`tallyArrangements`'s established
      traversal shape; `id` is a caller-supplied parameter (seed→id stays a pipeline concern) so the
      function mints component ids as deterministic positional strings (`` `${id}-c${n}` ``) rather
      than touching the PRNG, keeping normalisation PRNG-free per the doc 05 §6.1 contract; each
      `AttachmentBranch` becomes one `Attachment` linking its parent group's primary component id to
      its child group's primary id, both always in hand because the recursive walk returns each
      group's primary id before the parent records the join; `properties` is defensively copied
      (`Map<string,string>` → `Map<string,string|number>`) so the artefact never aliases the source
      tree; dimensions derive through a new MVP-provisional ordinal-band-to-centimetre table (three
      vocabularies — length, size, diameter — per the primitive registry's parameter naming,
      per-primitive major/minor extraction, whole-object extents taken as the max single-component
      axis rather than a summed bounding box, a documented MVP simplification since assembled
      geometry is deferred) with mass and portability as further provisional derivations over those
      extents, all explicitly marked provisional per the 2GN.2 precedent — tests assert
      monotonicity/ordering across bands, never exact centimetre values, so the numbers can be
      retuned freely once generation is observable in the Explorer; `allowedMaterialTags` is stubbed
      `[]` and `arrangementGroup` is omitted, each with a comment naming the task that owns it
      (2GN.10, 2GN.67) rather than fabricating data the grammar has no faithful source for; roadmap
      2GN.9's `deriveInspectionDepth(dimensions)` was folded into this task rather than left
      separate — it is a three-line function over dimensions this task already computes, using doc
      05 §5.2's verbatim thresholds (maxExtent <=30 → 'full', <=150 → 'detailed', else
      'observational'), the one non-provisional derivation in the new code, and 2GN.9 had no
      dependents beyond the milestone rollup so folding it required no roadmap reorder; covered by
      25 new Deno tests in `grammar.test.ts` — purity/determinism, no input mutation, flatten order
      and position sequencing, positional id determinism, component/attachment counts matching tree
      shape, attachment endpoint correctness including a 3-deep nested chain, both stubs' exact
      shape, defensive property copying, dimension/mass/portability monotonicity across size bands,
      `deriveInspectionDepth`'s exact boundary values, multi-group flatten ordering, graceful
      degradation on an unrecognised primitive, and an end-to-end integration test normalising real
      `expandGrammar` output over 20 seeds asserting unique ids and valid attachment references)
- [x] **2GN.9** — `engine/generation/grammar.ts` — `deriveInspectionDepth(dimensions)` util
      (delivered as part of 2GN.8 rather than separately — see that entry; folding was safe since
      2GN.9 depended only on 2GN.8 and had no other dependents)
- [x] **2GN.10** — `engine/generation/grammar.ts` — `allowedMaterialTags` derivation per component
      from primitive type + properties compatibility — `PRIMITIVE_MATERIAL_TAGS` (8-primitive base
      table + one property-narrowing rule for edged `elongated` forms), ruled with Jason one
      primitive at a time (doc 11 §2.16 records the table and reasoning; doc 12 §2.51 records the
      propagation). The forward hazard flagged 2026-07-30 landed as predicted: 2GN.23's
      empty-`allowedMaterialTags` fallback stopped firing, so `materials.calibration.test.ts`'s pins
      were re-measured and re-recorded, and the Explorer material-viewer panel (2GN.60) gained a
      `compatibleComponentCount` field to surface shape-incompatible materials rather than needing a
      re-measure of hand-picked presets
- [ ] **2GN.67** — `engine/generation/grammar.ts` — arrangement detection + pattern assignment:
      annotate `NormalisedComponent.arrangementGroup` (pattern, index, totalInGroup) at flatten
      time, descoped out of 2GN.8 since the grammar never assigns an arrangement pattern (2GN.3
      rolls repetition incidentally, 2GN.6's `checkAccumulation` only validates admissibility, never
      labels one), so `arrangementGroup.pattern` has no faithful source at flatten time and
      fabricating one would invent data; detection reuses `tallyArrangements`'
      same-primitiveType-within-one-top-level-group boundary (already the detection contract behind
      2GN.6, cheap to apply again here), leaving pattern _assignment_ as the open question this task
      owns — may mean threading a choice through `expandGrammar`'s determinism-critical draw
      sequence; nothing consumes the field yet, so this task is currently childless in the graph
      _(blocked — depends on 2GN.139; 2GN.57, 2GN.108 done)_
- [x] **2GN.57** — Explorer: structure viewer tab — generate from seed + culture selector, component
      tree with join types _(depends on 2GN.8 — done)_
- [x] **2GN.1** — `src/lib/data/grammars/primitives.ts` — geometric primitive defs (elongated,
      cylindrical, flat-broad, hollow-enclosed, ring-form, disc-form, bar-form, sheet-form) with
      parameter enums (doc 05 §5.3 transcribed verbatim as a single `as const`
      `PRIMITIVE_PARAMETERS` registry — primitive id → parameter name → ordered value list — with
      `PrimitiveType` derived via `keyof typeof`, a flagged deviation from the interfaces-first
      convention per the `Serialised<T>` zero-drift precedent in save.ts; "parameter enums" realised
      as string-literal value lists per the no-`enum` convention committed in artefact.ts;
      parameters deliberately scoped per primitive, no shared unions — `crossSection` and `taper`
      carry different value-sets across primitives; `PRIMITIVE_TYPES` array + `isPrimitiveType`
      guard round out the union-values-guard trio per the visibility.ts precedent; material-tag
      compatibility stays with 2GN.10, dimension derivation with 2GN.8, selection weights with
      2GN.2/2GN.4 — this module is data only, no `MaterialTag` import needed; covered by 7 Deno
      tests asserting the eight-primitive vocabulary, per-primitive parameter names and verbatim
      spot-checked value lists)
- [x] **2GN.2** — `src/lib/data/grammars/core.ts` — MVP component grammar rules: `<object>` →
      `<component-group>+`, `<component-group>` → `<primary-component>` + optional attachments, base
      weights (four `GrammarRule`s in BNF order exported as a `readonly GrammarRule[]` —
      interfaces-first against the 1FD.10 types, no keyed index since `symbol` is already the rule's
      identity; `attachment` authored as a fourth rule so `selectGrammarOption` (2GN.4) applies
      culture-biased weighted selection uniformly to join choice, with the caveat documented in the
      module header that its options expand to `AttachmentType` terminals — neither rule symbols nor
      primitives — consumed positionally by `expandGrammar` (2GN.3) as edge labels, never expanded
      as components; the BNF's `+`/`*` repetition is deliberately not encoded — chain length is
      engine behaviour (2GN.3) bounded by accumulation constraints (2GN.6/2GN.7); all `baseWeight`s
      and `culturalModifiers` are authored MVP-provisional archaeology-flavoured priors since doc 05
      §5.4 gives the modifier maths but no numbers, to tune once generation is observable in the
      Explorer; five illustrative `phaseModifiers` entries — hollow-enclosed on
      `technology.ceramics`, bar-form/socketed/riveted/threaded on `technology.metallurgy` — as
      fixtures for `phaseInfluence`, multiplier semantics firming up at 2GN.5; covered by 8 Deno
      tests asserting the four-rule vocabulary, exact primitive and attachment coverage in
      registry/union order, `expandsTo` resolution, positive finite weights and valid modifier keys
      — no assertions on specific weight values, so tests don't fossilise provisional numbers)
- [x] **2GN.3** — `engine/generation/grammar.ts` — `expandGrammar(rules, culture, phase, prng)`:
      top-level grammar expansion, selects primary component, expands attachment chains (walks the
      §5.3 BNF top-down into an `ExpandedObject` — tree shapes
      `ComponentNode`/`AttachmentBranch`/`ComponentGroupNode`/`ExpandedObject` added to
      `types/grammar.ts`, deliberately carrying no ids, dimensions or portability since those are
      the 2GN.8 flatten's concerns, keeping the tree a cheap re-rollable intermediate for §6.2
      re-expansion (2GN.16); `primitiveType` stays a plain `string` per the `NormalisedComponent`
      precedent — `types/` never imports `data/`; `ATTACHMENT_TYPE_VALUES` + `isAttachmentType`
      complete the union-values-guard trio per the visibility.ts precedent so the engine validates
      join terminals at runtime; primitive terminals roll their physical parameters at expansion
      time, uniform per parameter in registry order, so normalisation never touches the PRNG; the
      attachment rule's options are consumed positionally as edge labels per the 2GN.2 contract,
      with non-attachment terminals throwing; every selection routes through `selectGrammarOption`
      including the single-option `object`/`component-group` rules — the prng draw sequence is the
      determinism contract, so future multi-option rules change distributions, not draw structure;
      repetition is bounded by provisional constants pending 2GN.6/2GN.7 — tier-specific
      continuation probabilities of 0.2/0.4/0.6 with group caps of 2/3/4 echoing §5.5's tier
      ceilings, attachment slots at 0.4 × 0.5^depth with breadth 2 and depth 3; malformed grammar
      (missing rules, unknown symbols, rule cycles via a hop budget) throws loudly; the `expandsTo`
      resolution order — rule symbol → primitive → attachment terminal → throw — is now the firmed
      contract in its JSDoc; covered by 10 Deno tests: same-seed deep-equal trees, seed divergence,
      structural validity over 200 seeds, cap enforcement over 500, repetition distribution ~70%
      single-group over 1 000, three malformed-grammar throw cases and an end-to-end culture-bias
      sweep)
- [x] **2GN.4** — `engine/generation/grammar.ts` —
      `selectGrammarOption(rule, culture, phase, prng)`: culture-biased weighted selection with 0.01
      floor (doc 05 §5.4's formula adapted to the callback-shaped `weightedSelect` from 1FD.7 —
      effective weights computed transiently in the `getWeight` callback via a private
      `effectiveOptionWeight` helper, never stored: `baseWeight` + affinity × modifier per cultural
      entry with missing affinities reading as 0, scaled by `phaseInfluence` (2GN.5), floored at
      0.01, which also makes `weightedSelect`'s zero-total uniform fallback unreachable from this
      call site; exactly one prng draw per call regardless of option count, so draw ordering is a
      stable determinism contract for `expandGrammar` (2GN.3); `culture` param typed
      `CulturalProfile` not `Culture` — the pipeline passes `baseProfile`; covered by 6 Deno tests —
      determinism, culture and phase distribution shifts over 1 000 draws, floor reachability at the
      ~0.1% expected rate over 10 000 draws, inert modifiers for absent affinities, single-draw
      consumption via a call-counting prng wrapper — all against crafted rules so core.ts's
      provisional weights aren't fossilised, per the 2GN.2 precedent)
- [x] **2GN.5** — `engine/generation/grammar.ts` — `phaseInfluence(option, phase)`: phase
      characteristics modify grammar option weights (the provisional `phaseModifiers` contract
      firmed here as promised at 1FD.10/2GN.2: each `[dottedPath, multiplier]` entry resolves its
      0–1 attribute from `PhaseCharacteristics` and contributes the factor
      `1 + (multiplier − 1) × attribute` — neutral at attribute 0, the full multiplier at 1, sub-1
      multipliers suppressing in proportion to the attribute — so low technology never suppresses
      below base weight, matching doc 05 §3.2's framing that high attributes _increase_
      probabilities; entries combine by product; absent/empty maps return a neutral 1; unresolvable
      paths throw, since grammar data is authored in-repo and core.test.ts guards the shipped keys —
      a miss is always an authoring typo, better loud than silently skewing distributions forever;
      path resolution is a generic object walk so new `PhaseCharacteristics` attributes need no
      engine change; `types/grammar.ts` JSDoc updated from "expect this to firm up" to the fixed
      contract; `tests/fixtures/culture.ts` gained exported `mockPhaseCharacteristics` (two-level
      merge overrides — a documented divergence from `mockCulture`'s whole-branch replacement, since
      all four branches are flat numeric records) and `mockCulturalProfile` builders; covered by 7
      Deno tests — lerp endpoints and midpoint, product combination, sub-1 suppression, both throw
      cases and a shipped-fixture sweep asserting every core.ts modifier evaluates finite and
      positive)
- [x] **2GN.7** — `engine/generation/grammar.ts` — complexity budget derivation from
      `craftSpecialisation` (simple/moderate/sophisticated thresholds) (exported
      `resolveComplexityTier` + `deriveComplexityBudget(craftSpecialisation)`, scalar signatures
      since doc 05 §5.5 derives from exactly one attribute — input-honest and fixture-free to test;
      `ComplexityTier` stays engine-local since `types/grammar.ts` is data shapes only and the tier
      is a derivation detail; the doc's overlapping tier bounds firmed as half-open upward — simple
      [0, 0.3), moderate [0.3, 0.6), sophisticated [0.6, 1] — so boundary values promote: more
      specialisation never means less complexity; non-finite or out-of-[0,1] input throws per the
      `resolvePhaseAttribute` loud-failure precedent; derivation is pure and PRNG-free so it can
      never perturb the draw-sequence determinism contract; `expandGrammar` now consumes
      `maxDistinctGroups` (2/3/4) as its group-repetition cap and enforces a per-tier
      `minDistinctGroups` (1/2/3) unconditionally before a per-tier `additionalGroupProbability`
      (provisional 0.2/0.4/0.6) governs further additions up to the cap — the minimum is kept
      engine-side in the tier table rather than on `AccumulationConstraints` so that type stays
      spec-verbatim, but it is enforced as a hard floor, giving the doc's tier group ranges
      ("1–2/2–3/3–4") exactly rather than as a distribution shift; `maxComponentsPerGroup` (4/8/12,
      rising to cover radial's doc maximum only at sophisticated) and `noTwoGroupsSameType` (true
      only at simple) are authored MVP-provisional per the 2GN.2 precedent — derived now, enforced
      at 2GN.6; pattern instances carry §5.5's example counts verbatim as authored data and are
      built fresh per call so no two budgets share mutable innards; attachment depth/breadth
      constants stay provisional pending 2GN.6; covered by 6 new Deno tests — tier boundaries, throw
      cases, doc-cited group caps, pattern-set widening per tier with a spot-check on symmetric's
      [2, 4, 6], monotone provisional limits, mutation safety — plus the 2GN.3 cap and distribution
      tests reworked tier-aware: group counts asserted within the enforced 1–2/2–3/3–4 ranges over
      500 seeds per tier, and the distribution test now pins ordering (more specialisation → more
      groups) instead of the provisional probabilities)
- [x] **2GN.6** — `engine/generation/grammar.ts` — accumulation checking: `ArrangementPattern`
      constraint enforcement (symmetric, radial, linear-array, stacked, nested, branching valid
      counts) (exported `checkAccumulation(object, constraints): AccumulationCheckResult` — a pure
      validator, not expansion-time enforcement, since doc 05 §6.2's model is check-and-re-roll with
      the re-expansion loop owned by 2GN.16; the result shape `{ valid, failures }` mirrors the
      planned `checkPlausibility` (2GN.12) so the loop can treat both uniformly, with
      `AccumulationCheckResult` engine-local per the `ComplexityTier` precedent; the doc gives no
      detection mechanism for arrangement groups on the raw tree — `arrangementGroup` only exists on
      `NormalisedComponent` at 2GN.8 — so the detection boundary firmed here (user-confirmed design
      decision) is per top-level group: same-`primitiveType` components within one top-level
      `ComponentGroupNode` (primary plus attachment descendants, recursively) form one arrangement
      group, never pooling across top-level groups, keeping `noTwoGroupsSameType` meaningful and
      setting the boundary 2GN.8's `arrangementGroup` annotation must follow; four checks —
      top-level group count vs `maxDistinctGroups` (defensive re-check, since `expandGrammar`
      already enforces it, keeping the validator authoritative over hand-built/deserialised trees),
      per-arrangement count vs `maxComponentsPerGroup`, pattern admissibility for every repetition
      (count ≥ 2) with `symmetric` as an exact-count allow-list and the other five as inclusive
      ranges per the 1FD.10 type asymmetry, and `noTwoGroupsSameType` triggering only when two
      top-level groups each carry an arrangement of the same type — same-type singles never trigger
      it, a single component being no arrangement at all; pure and PRNG-free, failure messages name
      type, count and violated bound; a failed check is not an error — expansion is cheap, the
      pipeline re-rolls; `expandGrammar`'s provisional attachment constants stay as generation-side
      heuristics with the checker now the validation authority, per the updated module comments;
      covered by 12 Deno tests against crafted trees and constraints so provisional tier numbers
      aren't fossilised — clean pass, symmetric allow-list vs range inclusivity at both bounds,
      cap-beats-pattern precedence, the never-pools-across-groups boundary, nested-descendant
      counting, both `noTwoGroupsSameType` polarities plus the singles exemption, defensive
      group-count failure, simultaneous-violation accumulation, purity/no-mutation via
      `structuredClone` snapshots, and a 500-seed moderate-tier integration sweep asserting expanded
      trees mostly satisfy their own derived budget)
- [ ] **2GN.69** — `engine/generation/grammar.ts` — deliberately model multi-part assemblages:
      distinguish an intentional co-deposited group (hoard, burial set) from an unattached stray
      component, since `<object> ::= <component-group>+` currently lets `expandGrammar` roll
      multiple independent groups with no signal for whether that's a designed assemblage or an
      accidental artefact of complexity-budget rolls _(blocked — depends on 2GN.140; 2GN.57, 2GN.108
      done)_
- [x] **2GN.86** — `engine/generation/grammar.ts` — mass proxy sums component footprints; mass bands
      rebalanced to measured percentiles — surfaced 2026-08-01 auditing all 43 rules then shipped at
      the user's request (2GN.79 had cleared 41 in prose without per-rule sign-off). Three rules
      read `massBand` and all three misbehaved: R27 (`very-heavy` → communal) fired on 0 of 7200
      artefacts, and R25/R26 fired on 55.8% of edged and 61.1% of container artefacts while claiming
      contrasts ("labour, **not** a blade weapon"; "storage jar **rather than** tableware") that
      only hold for a minority. **Root cause was the proxy, not the boundaries**: mass scored
      `primaryExtent * secondaryExtent * (1 + 0.1 * (parts - 1))` where both extents are _maxima_
      across components, and each component draws from a three-value ordinal table — so with 2–13
      components at least one almost always rolled `large`, both axes pinned to 45cm, and **57.4% of
      output landed on exactly 45×45=2025**. One value holding the majority means no cut point can
      separate anything. The proxy's maximum was also 4658 against a `very-heavy` cut of 5000,
      making that band unreachable by arithmetic. Same saturation-by-maximum failure as
      `appliedElementPresent` (2GN.79), one layer down — recorded in doc 12 §2.26 as a general
      hazard: any max-or-any-of statistic over a generated collection saturates as that collection
      grows. Fixed by summing each component's own major×minor footprint (21 distinct products, top
      57.4% → 1810 distinct, top 1.8%), with bands pinned to measured p15/p45/p80/p95
      (233/2033/2892/5007), tapering rather than equal-sized since most excavated finds are
      portable; equal quintiles were measured and rejected as claiming a quarter of finds are too
      heavy to lift. Spread now negligible 15.3% · light 29.2% · moderate 35.2% · heavy 15.6% ·
      very-heavy 4.8%. Downstream: R27 0% → 5.0% (alive for the first time), R25 → 19.5% of edged,
      R26 → 24.8% of containers, R37/R39 up slightly (their gated flags require `massBand` at most
      `light`), `portability`'s `major-effort`/`team-lift` reachable; every other rule unchanged to
      the decimal. **The 2GN.79 calibration guard caught the drift**, naming both moved rules with
      their sizes — the first time it did the job it was built for; five rates re-recorded and
      annotated. Two new grammar tests pin the invariants _(depended on 2GN.79 — done)_
- [x] **2GN.108** — design spike — should the artefact vocabulary express a short-bodied edged tool
      that is not a formed blade (scraper, chisel, small adze)? **Ruled 2026-08-13: yes.** See
      `docs/spikes/2GN.108-short-bodied-edged-tools.md`, doc 11 §2.11 (locked decision), doc 12
      §2.43 (propagation). Ruled in on **tag-space variety** grounds, not archaeological
      completeness: these tools occupy the working/craft/domestic region, so their absence removes
      one region of the tag space rather than thinning the corpus evenly, leaving edged artefacts
      skewed to blade-family readings — which propagates into culture tag profiles and surfaces as
      repetition in the lens, the core mechanic. §2.9's culture-relative baselines cannot
      compensate, since they sample the same narrowed distribution. **All three candidate mechanisms
      rejected as symptom-level**: the real defect is that `bladeLengthBand` bands the wrong
      quantity — absolute length cannot separate a scraper (edge-dominant, short) from a dagger
      (edge-dominant, long) from a hafted adze (long body, short edge), a distinction that is
      proportional. Re-based on **grip-to-edge span**, which needs no role vocabulary: `attachments`
      is a populated typed graph and `position` plus per-component extents already exist, so the
      span is a traversal the three plausibility proxies never used. **Root cause**: `position` is
      documented as an oriented axis but minted as a depth-first traversal index, so a blade can
      land at position 0 with its haft after it — normalisation must orient, by **reversal** rather
      than rejection (a mirrored artefact carries no information). Deferred the general working-end
      definition to 2GN.115. Filed 2GN.115, 2GN.116, 2GN.117. ⚠️ 2GN.109 is **live** — it was void
      only if the form had been ruled out; recalibration is set-wide across
      2GN.67/2GN.69/2GN.109/2GN.117, sequence once
- [ ] **2GN.115** — design spike — what defines an artefact's working end in general, for artefacts
      with no edge? _(blocked: depends on 2GN.108, M1)_ — split out of 2GN.108 during the 2026-08-13
      spike session. 2GN.108 ruled that normalisation must orient the artefact (working end at a
      shared pole across all artefacts sharing a dimensional axis) and that orientation is achieved
      by **reversal** rather than rejection, but ruled the general pole definition out of its own
      scope. For edged forms the working end is the edge; for a hafted head it is the head; for a
      vessel, disc, ring or pin there may be no functional pole at all. Rule whether orientation is
      **total** (every artefact oriented, needing a pole rule for shapes with no working end) or
      **partial by design** (only artefacts with a distinguishable functional pole are oriented, the
      rest left unoriented as `bladeLengthBand` already reports `'none'` for edgeless forms).
      Background: `position` is intended as an oriented shared axis but `grammar.ts` mints it as a
      depth-first traversal index, so a blade can land at position 0 with its haft after it and
      nothing rejects or reverses it. Reversal beat rejection because a mirrored artefact carries no
      information — it is the same artefact described backwards — so rejecting it spends
      re-expansion budget enforcing probabilistically what construction can guarantee. ⚠️ blocks
      implementation rather than 2GN.108's ruling: reversal cannot be implemented for edged forms
      and retrofitted to a different general convention without repeating the sweep. ⚠️ **constraint
      added 2026-08-13 by 2GN.118 (Finding 6):** `bar-form`'s
      `taper: ['none','single-end','both-ends']` encodes _which end_, and `single-end` is not
      reversal-invariant — reverse the component and it still reads "one end" while which end has
      silently changed, with no data recording which it was. `none` and `both-ends` are symmetric
      and survive reversal untouched; `single-end` is the sole asymmetric value in the parameter. No
      classification rule reads it today (`hasImpactSurfaceIn` tests `bar-form`'s taper only for
      `'none'`; `bladeProfile` reads `elongated`'s symmetric taper instead), but the description
      layer does: `data/descriptions/observational/bar-form.ts:43` interpolates it into "The form
      narrows with a #taper# taper." and `interpretive/bar-form.ts:69` reads a single-end taper as
      the working end of a tool. Nothing breaks now, since nothing reverses yet; this spike must
      either make `single-end` a claim about the oriented axis or accept that reversal silently
      corrupts both the value and the player-facing prose built on it
- [ ] **2GN.116** — design spike — should component roles (grip-system, head-system and whatever
      else the vocabulary needs) become first-class grammar output? — filed 2026-08-13 from the
      2GN.108 spike session. All three rules in `data/plausibility.ts` are explicitly proxies
      standing in for an absent role concept: `hasGrippableSecondComponent` merely counts
      components, `hasAdequateGripLength` looks for some other medium/long `bar-form`/`elongated`
      component anywhere on the artefact (its own comment conceding a `disc-form` elsewhere "says
      nothing about grip length"), and `hasRigidShaft` accepts any rigid `sheet-form`/`bar-form`
      regardless of whether it bears the load. `types/plausibility.ts` names the same hole: the
      model cannot express a property-level concept like "a grippable component". Rule whether roles
      are authored into the grammar, derived from the attachment graph, or left as proxies for MVP —
      and if authored, the role vocabulary and its cost across the primitive registry. Scoped
      deliberately narrow: 2GN.108 established that grip-to-edge span is derivable from existing
      structure (`attachments` + `position` + per-component extents) with no role vocabulary, so
      roles are **not** a prerequisite for oriented normalisation or a proportional
      `bladeLengthBand` — what they serve is the remaining proxy work in 2GN.13/2GN.14, which is why
      both now depend on this. Note the `'grip-system'`/`'head-system'` strings in
      `types/interpretation.ts` are JSDoc illustration, not a defined type, and doc 05's
      `arrangementGroup` is repetition structure (symmetric/radial/linear-array) unrelated to role —
      so this vocabulary would be genuinely new, not specified-but-unwired _(blocked: depends on
      M1)_
- [ ] **2GN.117** — `engine/generation/grammar.ts` + `engine/generation/classification.ts` —
      implement oriented normalisation and re-express `bladeLengthBand` as grip-to-edge proportion
      rather than absolute cm, with the full recalibration sweep _(blocked — depends on 2GN.115 and
      2GN.118; 2GN.115 depends on 2GN.108)_ — placeholder filed 2026-08-13 alongside the 2GN.108
      ruling so the implementation the spike unlocks exists in the graph rather than only in the
      spike doc. The 2GN.108 edge is left implicit through 2GN.115 rather than drawn directly, since
      a direct edge would be transitively redundant. Two changes that must land together:
      normalisation orients by reversal (canonical working-end pole) instead of emitting a raw
      depth-first `position`, and `bladeLengthBand` bands the grip-to-edge span traversed over the
      `attachments` graph instead of reading absolute cm off `SHORT_MEDIUM_LONG_CM`. ⚠️ shifts fire
      rates set-wide — the 2GN.79 calibration guard will flag every moved rule and
      `EXPECTED_FIRE_RATES` needs re-recording with the drift annotated. Downstream of 2GN.108
      alongside 2GN.67, 2GN.69 and 2GN.109, so sequence the sweep once
- [x] **2GN.118** — design spike — are the primitive grammar's categorical parameter value-sets
      rational and justified? — filed 2026-08-13 from the 2GN.97 spike session, which reached it by
      stress-testing whether `baseType` is a genuine categorical (it is: unlike `wallThickness`, no
      continuous quantity is crushed beneath it). The audit question is one level up — whether the
      value-sets themselves were designed or accreted. `PRIMITIVE_PARAMETERS`
      (`data/grammars/primitives.ts`) reproduces doc 05 §5.3 **verbatim**, so this audits the spec's
      own vocabularies rather than any code drift. Three measured instances, all the same shape (two
      primitives expressing one concept with disjoint vocabularies, so a value is unreachable by
      primitive type rather than by design): **(a) `base`** — `cylindrical` rolls
      `['flat','rounded','pointed']`, `hollow-enclosed` rolls `['flat','rounded','pedestal']`, so a
      pedestalled bowl and a pointed cylinder are both unreachable, capping
      `base-pedestal-display`'s population at hollow-enclosed containers. **(b) `opening`** —
      `cylindrical` rolls `['open','restricted','closed']`, `hollow-enclosed` rolls
      `['wide','narrow','slit','none']`: different vocabularies _and_ arities for one concept,
      leaving `slit` (read by `container-slit-votive`) unreachable on cylinders. **(c)
      `perforation`** — `flat-broad` rolls `['none','single','multiple']`, `disc-form` rolls
      `['none','central','off-centre']`, disjoint, so `perforation-central-rotation` can only fire
      on discs and `perforation-single-pendant` only on flat-broads. Rule per parameter whether the
      split is deliberate morphological modelling or an artefact of authoring the BNF
      primitive-by-primitive; record why where deliberate, rule the corrected vocabulary where not.
      Same shape as 2GN.87's reachability finding, applied to the grammar's inputs rather than a
      rule's condition. ⚠️ blocked 2GN.10, 2GN.21, 2GN.109 and 2GN.117, which all author against or
      derive from these values. 2GN.97 is **not** a dependent — it surfaced the defect rather than
      consuming the vocabulary. ✅ **Ruled 2026-08-13** — see
      `docs/spikes/2GN.118-primitive-parameter-value-sets.md`. Seven disjoint shared-name pairs
      found, not the three filed. `base` unions to `['flat','rounded','pointed','pedestal']` on both
      primitives: the split had made `base-pointed-amphora` unfireable on anything amphora-shaped,
      since `dominantContainer` always prefers `hollow-enclosed`. `diameter` unifies to
      `small/medium/large`, derivation owned by 2GN.120. `crossSection`, `shape` and `taper` stay as
      authored, being genuine per-primitive geometry. `opening` and `perforation` defer whole to
      2GN.122, each being two axes crushed into one field rather than a vocabulary split. The two
      base rules keep their weights: both were authored in `cb3e517` before `EXPECTED_FIRE_RATES`
      existed, so they were never fitted to observed rates and only the rates move. Ships no `src/`
      change, so `EXPECTED_FIRE_RATES` re-records once against the full set. Per-culture base
      weighting filed as 2GN.121; `taper`'s reversal constraint recorded on 2GN.115
- [ ] **2GN.120** — `engine/generation/grammar.ts` — derive `wallThickness` as a modelled quantity
      rather than a free three-value roll _(blocked — depends on 2GN.135)_ — filed 2026-08-13 by the
      2GN.97 ruling, which found the two wall rules unrelativisable. `PRIMITIVE_PARAMETERS` rolls
      `wall: ['thin','medium','thick']` directly, with no continuous value beneath and no input from
      craft process, material or vessel role. Three consequences: (a) thickness is plausibly a
      derivative of the **crafting process** and is currently uninfluenced by `craftSpecialisation`,
      the component's assigned material or what the vessel is for; (b) three rungs is the entire
      gradation available, too coarse for the distinctions the rules draw on it; (c) **cross-culture
      comparison is impossible by construction** — one culture's `thick` may be physically thinner
      than another's `thin`, and since the band is cut from a global table before anything
      culture-relative is consulted, no baseline recovers the difference (prevalence in particular
      cannot: band frequency says nothing about actual thickness, so a culture whose walls are all
      3mm and one whose walls are all 30mm both read "100% thin"). Fourth instance of the
      band-computed-from-an-absolute-table family after 2GN.86 (mass), 2GN.87 (blade) and 2GN.108
      (axis). Deliverable: a derived thickness quantity with its inputs ruled, and bands cut
      per-culture rather than globally. ⚠️ overlapped 2GN.118, which ruled 2026-08-13 and left the
      three-value `wall` vocabulary standing, so this task's shape is unchanged. ⚠️ **scope extended
      2026-08-13 by 2GN.118 (Finding 5):** `diameter` joins this task as the same defect in a second
      parameter. 2GN.118 unified its labels (`cylindrical`'s `narrow/medium/wide` and
      `ring-form`/`disc-form`'s `small/medium/large` were one three-rung axis under two names) but
      ruled the derivation here, because the argument for keeping the two label sets apart is really
      an argument for deriving: a cylinder's diameter reads relative to its own length (a wide tube
      is wide _for a tube_) whereas a disc's diameter is its principal dimension, which is a ratio
      to model rather than two vocabularies to maintain. Nothing reads `diameter` today, so it
      carries no live consequence yet — but 2GN.118 noted that "harmless because unread" is exactly
      what let `base-pointed-amphora` sit broken
- [ ] **2GN.122** — design spike — is there one aperture model, and does it subsume `perforation`?
      _(soft-depends on 2GN.118)_ — filed 2026-08-13 from the 2GN.118 spike session, cases (b)
      `opening` and (c) `perforation`. 2GN.118 ruled that `opening` is not one axis but at least two
      crushed into one field: **presence/count** (`closed` and `none` are the same physical fact,
      scored identically at 0 by `OPENNESS_BY_OPENING`) and **aperture size**
      (`wide`/`narrow`/`slit`). It also ruled the two primitives' vocabularies commensurable —
      `OPENNESS_BY_OPENING` already ranks all seven values on one 0–1 scale, and three shipped rules
      pair the cylinder and vessel labels as synonyms by hand, which is the rule layer compensating
      for a split that should not exist. Two questions this spike owns. **(1) Multiplicity:** a
      through-void has two mouths (bead, socketed axe, tube) and a two-mouthed vase has two separate
      apertures — different facts, neither expressible today. **(2) Subsumption:** a hole through a
      disc (`perforation`) and a hole through a cylinder wall (`opening`) are plausibly one concept
      split across two parameter names by primitive-by-primitive BNF authoring, the same defect as
      `base` one level up. If they are one axis, `perforation`'s count/position split resolves
      inside this model instead. Rule the axis set (count, size, through/blind, position), which
      parameters survive, and what `ExtractedFeatures` carries. ⚠️ 8 shipped rules read
      `openingType` or `perforation`; `EXPECTED_FIRE_RATES` re-records once at implementation, which
      is why this is ruled before 2GN.118's vocabulary changes are implemented rather than after
      _(blocked: depends on M1)_
- [ ] **2GN.135** — design spike — rule the inputs to the derived `wallThickness`/`diameter`
      quantity 2GN.120 implements: which modelled quantities feed the derivation
      (`craftSpecialisation`, the component's assigned material, vessel role for thickness; the
      length ratio 2GN.118 identified for diameter — a cylinder's diameter reads relative to its own
      length while a disc's is its principal dimension), what continuous value sits beneath the
      bands, and how per-culture band cutting works so cross-culture comparison stops being
      impossible by construction. Fourth instance of the band-computed-from-an-absolute-table family
      (2GN.86 mass, 2GN.87 blade, 2GN.108 axis) — but unlike those, no spike has ruled this one's
      derivation _(blocked: depends on 2GN.118, M1)_
  - Note: Filed 2026-08-20 from the M2 dependency audit: 2GN.120's deliverable says "a derived
    thickness quantity with its inputs ruled", but nothing upstream rules them — spike 2GN.118
    explicitly deferred diameter's derivation "to the 2GN.120 family", and 2GN.120 itself has no
    spike dependency. This spike owns the ruling; 2GN.120 becomes pure implementation.
- [ ] **2GN.139** — design spike — rule the arrangement-pattern assignment mechanism 2GN.67 needs:
      detection is already contracted (`tallyArrangements`'
      same-primitiveType-within-one-top-level-group boundary, per 2GN.6), but nothing in the grammar
      ever _assigns_ a pattern (2GN.3 rolls repetition incidentally, `checkAccumulation` only
      validates admissibility), so `arrangementGroup.pattern` has no faithful source. Rule whether
      assignment threads a deliberate choice through `expandGrammar`'s determinism-critical draw
      sequence (moving every calibration pin) or is derivable at flatten time from structure already
      rolled — and if threaded, where in the sequence the draw lands _(blocked: depends on 2GN.108,
      M1)_
  - Note: Filed 2026-08-20 from the M2 dependency audit: 2GN.67's own text names pattern assignment
    as "the open question this task owns", and its spike dependency 2GN.108 ruled a
    short-bodied-edged-tool vocabulary question, not this. 2GN.108 stays as a dependency for the
    shared recalibration-sweep sequencing its notes record.
- [ ] **2GN.140** — design spike — rule how the grammar models intentional multi-part assemblages
      versus stray components: `<object> ::= <component-group>+` lets `expandGrammar` roll multiple
      independent groups with no signal for whether that is a designed co-deposit (hoard, burial
      set) or an accidental artefact of complexity-budget rolls. Rule what carries the signal (a
      deliberate assemblage draw with its own cultural weighting, a post-hoc heuristic over rolled
      structure, or a provenance-level property assigned at excavation composition rather than
      generation), and what downstream consumers — classification, description, the lens — are
      entitled to read from it _(blocked: depends on 2GN.108, M1)_
  - Note: Filed 2026-08-20 from the M2 dependency audit: 2GN.69 is written as implementation but no
    doc or spike supplies an assemblage-detection heuristic, and its spike dependency 2GN.108 ruled
    a vocabulary question, not assemblage modelling. 2GN.108 stays as a dependency for the shared
    recalibration-sweep sequencing its notes record.
- [ ] **2GN.145** — `engine/generation/grammar.ts` — `expandGrammar` consults `allowedMaterialTags`
      (2GN.10) when rolling join types and head placements, so it stops producing structure the
      wrapped-join and rigid-shaft plausibility rules reject on sight. 2GN.137 measured 13–43% of
      expansions discarded at Stage 5 depending on the cell, dominated by those two rules; the rules
      are correct and the grammar is uninformed. Rule where in the draw sequence the constraint is
      read (a filter on the attachment option set before `selectGrammarOption`, so the draw count is
      unchanged, versus a re-roll, which is not), and re-record every calibration pin, since any
      change here moves `expandGrammar`'s draw sequence for every artefact _(blocked: depends on
      2GN.137, 2GN.10, M1)_
  - Note: Filed 2026-08-25 from the 2GN.137 spike. ⚠️ calibration-shifting: `EXPECTED_FIRE_RATES`,
    `EXPECTED_TAG_SHARES` and the plausibility calibration guard all re-record. Not a blocker for
    2GN.16 (the cap was ruled with headroom for today's rate), but landing it makes N=20
    conservative rather than load-bearing.
- [ ] **2GN.153** — Explorer: structure viewer (2GN.57) shows arrangement groups _(blocked — depends
      on 2GN.57, 2GN.67)_
- [ ] **2GN.154** — Explorer: structure viewer (2GN.57) shows orientation and working end _(blocked
      — depends on 2GN.57, 2GN.117)_
- [ ] **2GN.155** — Explorer: structure viewer (2GN.57) shows assemblage membership _(blocked —
      depends on 2GN.57, 2GN.69)_
- [ ] **2GN.170** — design spike — figural objects (idols, figurines, effigies) have no vocabulary
      in the structural grammar, so the object-level `ritual` tag cannot fire on them _(blocked:
      depends on M1)_

---

## Milestone 3: Plausibility

**Goal:** Physically implausible structures are rejected and re-expanded, never relaxed

- [x] **2GN.11** — `src/lib/data/plausibility.ts` — plausibility rule definitions: requires,
      excludes, ordering, material-physics, ergonomic predicates (authored `PlausibilityRule` as a
      new discriminated union in `types/plausibility.ts`, interfaces-first per the
      `ClassificationRule`/`GrammarRule` precedent rather than co-located with the data — the union
      didn't exist anywhere in the codebase before this task, only inline in doc 05 §6.2; predicate
      variants (`material-physics`, `ergonomic`) fixed a convention doc 05 leaves ambiguous:
      `predicate(artefact)` returns `true` when the artefact VIOLATES the rule, so
      `checkPlausibility` (2GN.12) can collect every violated rule's `reason` directly into
      `failures`; shipped all four doc 05 §6.2 worked examples as predicates in
      `data/plausibility.ts` — edged-blade-needs-a-grip, long-blade-needs-grip-length,
      heavy-perpendicular-attachment-needs-rigid-shaft, heavy-component-on-thin-walled-hollow —
      since each turns on a component property (`edge`, `length`, `wall`, `flexibility`, attachment
      `type`) rather than a primitive-to-primitive relationship, so only the predicate variants
      could express them faithfully; the declarative `requires`/`excludes`/`ordering` variants ship
      in the type union with zero MVP instances, commented as awaiting a
      component-role/classification vocabulary this project doesn't have yet — a bare
      `primitiveType` string can't express "a grippable component"; every proxy (grip = a second
      component exists, rigid shaft = `bar-form` or `flexibility: 'rigid'` `sheet-form`) is
      commented as an MVP stand-in pending 2GN.23 material assignment; covered by 18 new Deno tests
      in `plausibility.test.ts` — discriminant validity, non-empty/unique `reason`s, an
      every-shipped-predicate sweep against the `mockNormalisedArtefact` fixture, three
      violate/satisfy cases per rule using crafted artefacts, and a cross-reference check that every
      `primitiveType`/`AttachmentType` string literal the predicates key off resolves against the
      real `PRIMITIVE_TYPES`/`ATTACHMENT_TYPE_VALUES` vocabularies)
- [x] **2GN.12** — `engine/generation/plausibility.ts` —
      `checkPlausibility(artefact): { valid, failures }` (result shape mirrors
      `AccumulationCheckResult` per the 2GN.6 precedent — a new `PlausibilityCheckResult` interface,
      engine-local; iterates a rule set defaulting to `PLAUSIBILITY_RULES`, injectable for tests;
      predicate variants (`material-physics`, `ergonomic`) apply the 2GN.11 polarity contract
      directly — `reason` collected into `failures` when `predicate(artefact)` is `true`; the
      declarative variants (`requires`/`excludes`/`ordering`) have zero MVP instances in
      `PLAUSIBILITY_RULES` but are evaluated structurally regardless — by `primitiveType`
      presence/absence and `NormalisedComponent.position` ordering — so the runner is complete for
      whichever variant 2GN.13–15 reach for and the internal `switch` stays exhaustive
      (`never`-typed default arm); pure and PRNG-free, no input mutation; covered by 16 new Deno
      tests in `plausibility.test.ts` — default-fixture validity, default-rule-set wiring, one
      violate case per shipped rule asserting its exact `reason` string, a satisfied-rules case,
      simultaneous violations, one fire/satisfy pair per declarative variant via injected crafted
      rules, an empty rule set, and purity/determinism via repeat calls plus a `structuredClone`
      snapshot)
- [ ] **2GN.13** — `engine/generation/plausibility.ts` — physical viability rules (structural
      integrity, load paths, cantilever limits) _(blocked — depends on 2GN.116, 2GN.141; 2GN.58
      done)_ — 2GN.116 edge added by the 2GN.108 spike session 2026-08-13: `hasRigidShaft` is a
      proxy that accepts any rigid `sheet-form`/`bar-form` regardless of whether it bears the load,
      and load paths cannot be expressed without knowing which component carries what. Authoring
      these rules against the proxy is work 2GN.116 may invalidate. 2GN.141 edge added 2026-08-21:
      same physical-plausibility family as 2GN.15's material-structural rules, and would want the
      same worked-vs-finished rigidity-state question settled first
- [ ] **2GN.14** — `engine/generation/plausibility.ts` — ergonomic rules (grip length for edged
      forms, handleability) _(blocked — depends on 2GN.116; 2GN.58 done)_ — 2GN.116 edge added by
      the 2GN.108 spike session 2026-08-13: both existing grip proxies
      (`hasGrippableSecondComponent`, `hasAdequateGripLength`) stand in for the absent role concept
      this spike rules on, so real ergonomics waits on the ruling
- [x] **2GN.15** — `engine/generation/plausibility.ts` — material-structural compatibility (material
      tags constrain joins/forms). Shipped 2026-08-20: two rules, rigid-fastener
      (`riveted`/`threaded`/`hinged` needs `rigidity >= 5`) and wrapped-flexibility (`wrapped` needs
      `rigidity <= 2`). `fragility` deliberately excluded (crack-proneness isn't bendability, and
      it's authored against the wrong state today); the rigid-fastener rule is structurally
      unreachable against the current material catalogue but kept, since 2GN.124 (catalogue
      widening) may make it reachable. Full reasoning: doc 12 §2.52. Follow-up: 2GN.141
- [ ] **2GN.16** — `engine/generation/plausibility.ts` — re-expansion loop: on failure, re-expand
      from grammar up to N attempts; on exhaustion, throw `PlausibilityExhaustedError` (seed,
      attempt count, last failing rules) rather than emit — never a relaxed-rules or fallback
      artefact (doc 05 §6, §14; doc 12 §2.23) _(blocked: depends on 2GN.58, 2GN.137, M1)_ — N is 20
      (`MAX_PLAUSIBILITY_ATTEMPTS`, 2GN.137)
- [x] **2GN.58** — Explorer: plausibility panel — generate N structures, show pass/fail with
      rejection reasons, running rejection rate _(depends on 2GN.12 — done)_
- [x] **2GN.137** — design spike — rule the value of N for the plausibility re-expansion attempt
      cap. The exhaustion contract is already fully specified (doc 05 §5/§14 and doc 12: typed
      `PlausibilityExhaustedError`, no fallback artefact), but both docs use "N attempts" as a
      literal placeholder — no numeric value is pinned anywhere. Rule it measured rather than
      guessed: sample the plausibility-failure rate distribution over seeds with `checkPlausibility`
      (2GN.12, done) and pick the N that bounds exhaustion probability at an agreed tolerance
  - Note: **Ruled 2026-08-25 — see `docs/spikes/2GN.137-re-expansion-attempt-cap.md`, doc 11 §2.19
    and doc 12 §2.54. N = 20**, shipped as `MAX_PLAUSIBILITY_ATTEMPTS` in `data/plausibility.ts`
    with `PLAUSIBILITY_FAILURE_CEILING = 0.5` and a per-preset guard in
    `plausibility.calibration.test.ts`. Measured over 5000 seeds × 7 cells: per-attempt failure runs
    13.2% (craft 0.1) to 43.3% (xoconahtl); attempts confirmed independent, so exhaustion is p^N =
    5.4e-8 per artefact at the worst cell (≈3e-5 per 500-artefact career). N=10 rejected (11% of
    careers would hit the error), N=15 rejected (no headroom against the next rule). The rate itself
    is a generator defect (wrapped-join and rigid-shaft rules reject structure `expandGrammar` rolls
    without reading `allowedMaterialTags`), filed as 2GN.145. Originally filed 2026-08-20 from the
    M2 dependency audit as the narrowest of its five gaps.
- [ ] **2GN.141** — `src/lib/data/plausibility.ts` — revisit the material-structural plausibility
      rules (2GN.15) once `fragility` is re-authored to the working state: (1) reconsider whether
      `fragility` should be reintroduced as a genuine second axis in the wrapped-join check,
      alongside `rigidity`, and (2) confirm which state (worked vs finished) the rigid-fastener and
      wrapped-join rules actually want to read once 2GN.105 implements the per-state
      `{worked, finished}` shape 2GN.111 ruled for `rigidity` (the current code reads the pre-split
      scalar interface, since 2GN.105 hasn't landed yet) _(blocked — depends on 2GN.151)_
  - Note: Filed 2026-08-21 during 2GN.15's implementation. 2GN.15's wrapped-join rule deliberately
    does not use `fragility` today: jade's currently-authored finished-state `fragility: 2` would
    have wrongly passed a rigid, unbendable stone as "wrappable" under an OR-with-rigidity test, and
    `fragility` is pinned by 2GN.105 (still open) to move to the working state `computeLayerGrade`
    actually needs, so today's values describe the wrong moment for a workability question either
    way.
- [ ] **2GN.152** — Explorer: plausibility panel (2GN.58) shows re-expansion attempts and exhaustion
      rate _(blocked — depends on 2GN.58, 2GN.16)_

---

## Milestone 4: Materials

**Goal:** Each component gets a material from culture affinity, geological availability and trade,
with standing and provenance

- [x] **2GN.22** — `src/lib/data/materials.ts` — material definitions: id, label, tags, physical
      properties, decorability (geological scarcity and cultural affinity modifiers deliberately
      kept in `world.ts`'s
      `GeologicalContext.materialAvailability`/`CulturalProfile.materialAffinities` rather than
      duplicated here — both are already keyed by `id`/`tags`, the join keys this file provides;
      `craftDomain` added instead, resolving `MaterialDefinition`'s own doc 05 §15 follow-up note
      per which `PhaseCharacteristics.technology` axis governs working each material)
- [x] **2GN.23** — `engine/generation/materials.ts` —
      `assignMaterial(component, culture, phase, geology, trade, materials, prng): MaterialDefinition`
      — per-component assignment (doc 05 §7 transcribed near-verbatim: compatibility filter over
      `component.allowedMaterialTags` against `MaterialDefinition.tags`, then availability filter,
      then `weightedSelect` over `computeMaterialWeight`; `materials` defaults to the shipped
      `MATERIALS`, `prng` required and last per the `grammar.ts` convention; 2GN.24/2GN.25 folded in
      as full exported functions per the 2GN.8→2GN.9 precedent — `assignMaterial`'s doc body calls
      both directly and is untestable without them; two empty-candidate fallbacks guard
      `weightedSelect`'s empty-list throw — an empty `allowedMaterialTags` (today's reality, since
      2GN.10 hasn't landed and 2GN.8 stubs it `[]`) is treated as "no constraint" rather than
      "nothing fits", and availability excluding every compatible material falls back to the
      compatible set, then to the full catalogue, so the function never throws) — **region-agnostic
      at MVP, flagged as an explicit M2-provisional boundary**: the type system has no
      culture→region mapping (`Culture` carries no `region` field; region lives only on
      `Provenance.site.region`, generated downstream at 2GN.47, and as the key inside
      `RegionalAvailability.regions`), and real per-region `GeologicalContext` doesn't land until
      3WS.7 (Milestone 3) — Milestone 2 runs this pipeline against mock world fixtures by design, so
      `isAvailable` checks the best level across every region a geology map reports rather than
      gating on one specific region; true region-gating and material-origin attribution remain owned
      by 2GN.26/2GN.47/3WS.7; two new fixtures added to `tests/fixtures/world.ts`
      (`mockGeologicalContext`, `mockMaterialFlow`) since none existed; covered by 20 new Deno tests
      in `materials.test.ts` — compatibility filtering, the empty-`allowedMaterialTags` and
      availability-exhausted fallbacks, `isAvailable` per availability level plus trade-flow
      reachability (by tag and by `specificMaterials` id) and the no-geology-entry lenience,
      `computeMaterialWeight`'s three factors (affinity max-across-tags, phase-technology
      floor-lerp, scarcity multiplier) each shown to shift the weight the expected direction,
      determinism (same seed ⇒ same pick, varied seeds ⇒ varied picks), purity via `structuredClone`
      snapshots, default-catalogue wiring, and three ~1000-draw distribution tests (metal-affine
      culture vs indifferent, high vs low metallurgy technology, abundant vs scarce compatible peer)
- [x] **2GN.24** — `engine/generation/materials.ts` —
      `isAvailable(material, geology, trade): boolean` — local + trade availability check (delivered
      as part of 2GN.23 rather than separately — see that entry; binary gate:
      `abundant`/`available`/`scarce` → obtainable, `trade-only` → obtainable only via a matching
      `MaterialFlow` (by `materialTag` or `specificMaterials` id), `absent` → excluded; a material
      missing from the geology map entirely is treated as obtainable, an M2 lenience for mock world
      fixtures that won't list every material)
- [x] **2GN.25** — `engine/generation/materials.ts` —
      `computeMaterialWeight(material, culture, phase): number` — cultural affinity × phase
      technology (delivered as part of 2GN.23 — see that entry; gains a fourth `geology` parameter
      beyond the roadmap's stated `(material, culture, phase)`, a deliberate documented refinement
      so a graded scarcity multiplier can apply — doc 05 §7's "trade materials appear at low weight"
      is a weighting concern, not a binary one, so scarcity needed a place to live; scarcity
      multipliers (`abundant` 1.0 → `trade-only` 0.15) and the phase-technology floor (0.2 at
      technology 0, mirroring `phaseInfluence`'s lerp shape in `grammar.ts` so a culture never fully
      loses the ability to occasionally produce a material it's just beginning to work) are
      MVP-provisional and retunable, per the 2GN.8 dimension-tuning precedent)
- [x] **2GN.26** — `engine/generation/materials.ts` — `MaterialProvenance` metadata generation
      (source, origin region, trade path) —
      `deriveMaterialProvenance(material, geology, trade):
      MaterialProvenance` reads the same
      `bestRegionalLevel` verdict `isAvailable`/`scarcityWeight` already use, so provenance stays
      consistent with the assignment it describes: locally obtainable → `'local'` with
      `likelyOriginRegion` attributed from the real region key; trade-reached `trade-only` →
      `'trade'` with a synthesised `tradePathId`; everything else (`absent`, unreached `trade-only`,
      no geology entry) → `'unknown'`. `likelyOriginRegion` is real signal (the region key
      `bestRegionalLevel` already resolved) but necessarily provisional in scope — keyed against
      `mockGeologicalContext`'s single `'test-region'` fixture, since no region vocabulary exists
      yet (`Culture` carries no region binding); true region attribution is 3WS.7's, which must
      reconcile whatever this task and 2GN.47 mint (dependency sweep 2026-07-25). `tradePathId` is a
      **temporary synthesised string** (`provisional-trade:${materialTag}:${index}`), heavily
      flagged in both the type doc (`artefact.ts`) and the deriving function's JSDoc: neither
      `MaterialFlow` nor `CultureRelationship` (`world.ts`) carries a stable id yet, so it cannot be
      resolved back to a real relationship — only reproduced from the same `(materialTag, index)`
      pair. Real trade-path identity is 3WS.5/3WS.6's to mint once `generateRelationships`
      constructs real `CultureRelationship`s; this function and its callers should be replaced, not
      extended, once that lands. Also adds `assignMaterialWithProvenance`, a convenience wrapper
      producing a full `MaterialAssignment` in one call, for 2GN.75 to build on
- [x] **2GN.75** — `engine/generation/materials.ts` —
      `assignMaterials(artefact, culture, phase, geology, trade, prng, materials): MaterialAssignment[]`
      — artefact-level material pass producing the componentId→material mapping the rest of the
      pipeline needs (`assignMaterial` only handles one component and returns a bare
      `MaterialDefinition`; no engine code currently produces `MaterialAssignment[]` — the only
      working precedent is duplicated Explorer route logic in
      `materialAssignment.ts`/`decorationLayers.ts`, which this task promotes into the engine,
      including resolving the per-component PRNG namespacing both currently work around); constructs
      each `MaterialAssignment` complete, including its required `provenance`, via 2GN.26's
      generator — sequenced after 2GN.26 specifically so `provenance` is never stubbed — added by
      dependency sweep 2026-07-25: 2GN.30/2GN.27/2GN.70 each need per-component assigned materials
      and had no producer
- [x] **2GN.77** — design spike — does a material's classificatory value derive from static
      catalogue tags (`precious-metal`/`precious-stone`) or from its situation in the generated
      world? — **ruled 2026-08-04, jointly with 2GN.80** (doc 11 §2.9, doc 12 §2.28). Material value
      is **world-relative**: it derives from the material's situation (availability × cultural
      affinity × provenance × `stratification`), not from a static catalogue tag. The two spikes
      were ruled together because they are one question asked of two surfaces, and separate rulings
      could have contradicted each other — and because the material answer turned out to need the
      empirical per-culture-phase baselines the decoration answer already required.
      **`MaterialTag`'s `precious-*` members survive as material descriptors but not as
      classification inputs**: they remain facts about a material's physical character, and no
      classification rule may read them directly to award status. Material baselines are keyed
      **culture-phase × region**, unlike decoration baselines which need only culture-phase —
      geology is regional and culture is not (`Provenance.site.region` is a plain string,
      `RegionalAvailability.regions` binds to no culture), so a culture spanning two regions faces
      different availability in each. `extractFeatures` keeps its purity: the world context arrives
      through `ClassificationRule.condition`'s widened signature instead, so doc 12 §2.20's contract
      is amended rather than broken _(depended on 2GN.79 — done)_
- [x] **2GN.78** — `src/lib/types/tags.ts` + `src/lib/data/materials.ts` — revisit `MaterialTag`'s
      `precious-metal`/`precious-stone` members per the 2GN.77 ruling — **ruled and implemented
      2026-08-11: both members retired** (`docs/spikes/2GN.78-precious-material-tags.md`, doc 11
      §2.9 revised, doc 12 §2.40). An earlier pass closed this doc-only (doc 12 §2.37, now marked
      superseded) on the finding that no classification rule read the tags; correct, but too narrow
      a boundary. Every other `MaterialTag` member names a material _class_ two cultures would agree
      on; these two named what a material is _worth_, so barring them from classification while they
      still gated `gilding` and skewed `culturalAffinityWeight` left the same Earth-judgement stamp
      in the generator one step removed. Retirement was possible because everything they did was
      already modelled: `craftDomain === 'metallurgy' && formability >= 5 && oxidisation <= 3`
      admits gold and silver and nothing else — the retired pool exactly, since gold reads
      oxidisation `0` and silver `3` against bronze `6` and iron `7` — and the other five techniques
      listed a precious tag _redundantly_ beside its class tag (measured pool sizes identical with
      and without). Trade flows re-keyed onto class tag + `specificMaterials`, which named each
      flow's intent but widened rather than preserved its reach, since that pair ORed — corrected in
      PR #57 review and superseded by **2GN.112**'s `includes`/`excludes` shape, under which these
      flows finally mean what this line claimed. Three of the five authored precious affinities were
      already dead data under the max reduction; the affinity semantics question 2GN.84 folded in
      **dissolves** rather than being answered, since one tag per material leaves nothing to reduce.
      The grammar's precious `culturalModifiers` were _dropped_, not folded into their `metal`
      siblings — the calibration harness caught the first attempt drifting R21 by 8.6pp, because
      `effectiveOptionWeight` reads a missing affinity as `0` so the precious term only ever
      contributed for a culture authoring that tag — of the four presets only Thalassar, which
      authors no competing `metal` value, so no preset that would have received the folded
      `metal: 0.9` was getting the precious term at all. With that corrected the whole retirement is
      behaviour-neutral: no calibration pin re-recorded. One expressive loss accepted and filed as
      **2GN.110** _(depended on 2GN.77 — done)_
- [x] **2GN.60** — Explorer: material viewer — resolved material per component, culture bias
      breakdown (scarcity vs affinity vs trade) — the literal three-way split was **not** shippable:
      `computeMaterialWeight` returns a single product and its tuning constants (`SCARCITY_WEIGHT`,
      `NO_TECHNOLOGY_FLOOR`) are module-private, so decomposing panel-side would fossilise numbers
      the engine JSDoc expects to retune _from this panel_; trade is also not a weight factor at all
      but a boolean rescue inside `isAvailable`, so it renders as a badge rather than a bar. Ships
      the combined weight as a normalised share, an availability reason per candidate
      (local/trade/blocked), and an empirical per-component distribution over N repeated draws (the
      `--draws` mode of `sample-materials.ts`) which shows culture bias without duplicating the
      formula; factor decomposition split out to 2GN.74. `ExplorerCulture` gained hand-authored
      `geology`/`trade` per preset — all 16 materials explicitly levelled so `isAvailable`'s
      missing-entry lenience never applies — since real geology is 3WS.7, behind the whole-M2 gate
      _(depended on 2GN.23 — done)_
- [ ] **2GN.70** — `engine/generation/materials.ts` + `engine/generation/decoration.ts` —
      whole-object coherence pass: check material and decorative choices are coherent across an
      artefact's components as a set (not necessarily mono-material) rather than validating each
      component in isolation _(blocked — depends on 2GN.150, 2GN.31, 2GN.32)_ — dependency sweep
      2026-07-25 corrected the dependency from 2GN.23 to 2GN.75: "as a set" requires the
      whole-artefact material assignment, which only 2GN.75 produces. The direct 2GN.75 (and 2GN.29)
      edges were pruned in the 2GN.85 dependency sweep (2026-08-04) as transitively implied by
      2GN.30, which already depends on both
- [x] **2GN.74** — `engine/generation/materials.ts` —
      `explainMaterialWeight(material, culture, phase, geology, trade)` returning the decomposed
      factors (cultural affinity, phase technology, scarcity) plus the availability level and
      whether trade rescued it, so the material viewer (2GN.60) can show the scarcity-vs-affinity
      breakdown its roadmap line asks for — shipped 2026-08-11. Reuses the private helpers rather
      than exporting `SCARCITY_WEIGHT`/`NO_TECHNOLOGY_FLOOR`, so the engine stays the only place
      that retunes them; the returned `weight` is exactly `computeMaterialWeight`'s product and the
      three factors multiply back to it, pinned by test. `level`/`region`/`available`/`tradeRescued`
      come from a single `bestRegionalLevel` read rather than the two independent calls
      `isAvailable` and `scarcityWeight` each made, and the unmodelled asymmetry is preserved
      deliberately (`level: undefined` with `available: true`, while `scarcity` still reads the
      `available` rung). Also retired the route-side `levelOf`/`classify` duplication in
      `routes/dev/explorer/materials/materialAssignment.ts`, which re-derived obtainability from the
      culture's _first_ region where the engine reads the _best_ across all regions — a divergence
      that stayed invisible only because Explorer presets author exactly one region each. The
      panel's apology paragraph is replaced by real affinity/technology/scarcity columns _(depended
      on 2GN.23 — done)_
- [x] **2GN.84** — recalibrate `SCARCITY_WEIGHT` and material weighting per the 2GN.80 / 2GN.77
      rulings — inverted (2026-08-06, doc 12 §2.34): no calibration target existed (doc 05 §7 is
      qualitative; §10.2 disclaims a quota reading), the trap this task's own notes flagged.
      Delivered instead: `src/lib/data/materials.calibration.test.ts` (new) — a hierarchical
      per-region tag-share/intra-tag-split/provenance-mix/spread guard derived from
      `MaterialDefinition.tags`, installing the missing target rather than recalibrating against an
      absent one. `SCARCITY_WEIGHT`'s four values are UNCHANGED, now pinned as the measured
      baseline. Two real defects found and fixed: `materialAccessGate`
      (`engine/generation/decoration.ts`) checked a technique's material substrate but not its
      _introduced_ material — `wire-wrapping` (substrate: grippable form; introduces: metal) was
      never gated on metal availability, so a metal-free region produced 26.3% wire-wrapping share
      (vs 5.8–6.1% elsewhere); fixed by extending the gate to also check `INTRODUCED_MATERIAL_TAGS`.
      `scarcityWeight`'s unmodelled-material lenience (neutral `1`, ranking above explicitly
      `available`'s `0.6`) corrected to the `available` rung. A full 16-entry catalogue audit fixed
      one tag miss (`jade` → `['stone', 'precious-stone']`) and one inert-material defect (`glass` →
      `engravable`/`paintable` true). `deno task check` 0 errors, `deno test` 527/527 passing. Split
      out: max-across-tags affinity semantics (folded into 2GN.78), material-dependent technique
      difficulty (new 2GN.99), leatherworking craft domain (new 2GN.100), `assignDecorativeDetails`
      has no production caller (noted against 2GN.68). Full detail: doc 12 §2.34
- [x] **2GN.100** — add a distinct `leatherWorking` craft domain, separating hide-work from weaving
      — shipped 2026-08-07 (doc 12 §2.35). `leather` moves off `textiles`, which it shared with
      `linen`, conflating tanning with weaving. Four explorer presets get independently argued
      values rather than clones (Tarpan 0.75 — "the herd supplies bone, antler and hide", leather
      `abundant` against linen `scarce`; Khaltiris 0.60 — militarised, needs hide at scale;
      Thalassar 0.45 — flax-abundant, hide workaday; Xoconahtl 0.30 — humid jungle hostile to
      tanning). Measured: Tarpan now weights leather 6.4× its linen, Xoconahtl inverts that; under
      the shared axis they moved in lockstep. **Free of calibration consequence by construction** —
      the fixture takes 0.5 per its own neutral contract, and the guard runs with no overrides, so
      all six leather pins hold. `TECHNIQUE_CRAFT_AXIS` deliberately unchanged: `wrapping`
      introduces both fibre and leather, so pointing it at either pure axis is wrong half the time,
      and the correct fix shares 2GN.99's blocker
- [x] **2GN.101** — rebuild `MaterialDefinition.physicalProperties` as orthogonal authored axes —
      forced out of 2GN.99 on 2026-08-07 (doc 12 §2.35): that task assumed the property model could
      express material difficulty, and it couldn't. `workable: boolean` conflated brittleness,
      pliability and grain coarseness; `hardness` was actively misused as a fragility proxy, with
      `relief` and `overlay` both carrying comments conceding it. Six authored axes replace the pair
      (`hardness` pegged to the real Mohs scale, `fragility`, `rigidity`, `grainFineness`,
      `porosity`, `combustibility`) plus a keyed `reactivity` object; all 16 materials scored
      item-by-item. Two axes were discovered mid-review by techniques with nothing to key on
      (`patina` is chemical — hence its substrate was `{kind:'none'}` and the generator was
      patinating stone and glass; `painting`/`glaze` wanted absorbency). `oxidisation`'s `-1`
      sentinel feeds a substrate **gate**, not a difficulty penalty, keeping "impossible" and
      "merely hard" distinct. Axis independence tested via obsidian-vs-granite and gold-vs-oak, both
      pinned. Four substrate corrections fell out, including **`gilding`'s factually wrong
      metal-only gate** (real gilding is overwhelmingly on wood and gesso) — doc 05 §8.2 carried the
      same error in prose and is corrected
- [x] **2GN.102** — add a formability axis to `MaterialDefinition.physicalProperties`,
      distinguishing materials worked by subtraction (knapping) from those with a formable/plastic
      working state (cast, thrown, blown, modelled) — shipped 2026-08-11 (doc 12 §2.38), a 2GN.101
      follow-on filed 2026-08-07. A seventh axis, `formability` (`1`–`6`, not the sibling axes'
      `1`–`7`), gates `relief` (`formability >= 3`, single clause, no `rigidity` fallback): `6` true
      plastic/viscous state (fired clay wet, glass hot) · `5` genuine plastic working regime by melt
      or hot forging (bronze, gold, silver, iron — cast and forge deliberately conflated, see below)
      · `4` controlled incremental removal (granite, jade, oak, ash, antler) · `3` controlled
      removal capped by splintering or limited plasticity (bone, leather) · `1` unsteerable fracture
      or no shaping regime (obsidian, flint, linen). Independence pinned against obsidian-vs-granite
      (share `rigidity`, formability still splits them) and fired-clay-vs-obsidian (share
      `fragility`/`rigidity` exactly, formability still splits them — the pair that motivated the
      task). **Leather now passes `relief`**, correcting an exclusion that had no material-science
      basis — it was collateral from the old `rigidity >= 3` gate aimed at linen, and
      `studs`/`gilding`/`overlay` already carried a named leather exception for the same underlying
      fact `relief` alone was missing. **Surfaced a finding beyond its own scope**: `formability`
      only means anything relative to a working state, which exposed that 2GN.101's six axes are
      silently finished-state measurements (cold glass vs hot, cold-worked iron vs forged, fired
      clay vs wet) that nothing had ever said aloud — named in doc 12 §2.38 and
      `types/artefact.ts`'s preamble, not fixed here; reconciliation filed as **2GN.105**. Two scale
      rulings recorded rather than assumed: the `1`–`6` range (6 rungs is what the physics supports
      once cast/forge are correctly grouped; measured against the catalogue, 5 of 6 rungs used, in
      line with the existing axes' 5–7 of 7) and no `-1` sentinel (`oxidisation`'s sentinel marks
      categorically absent chemistry; every material has a real formability answer, including
      linen's genuine `1`). The rung-5 cast/forge conflation is accepted for now — inert while the
      gate is a `>= 3` threshold, reopens with **2GN.106**. `overlay`'s identical `rigidity >= 3`
      gate is unaudited on the same leather-exclusion grounds — filed as **2GN.107**.
      `deno task check` clean; `deno task test` 561 → 563 passing, 0 failing; calibration suite
      28/28 unaffected (both the tightening and the loosening are inert in every fixture region)
- [ ] **2GN.105** — `engine/generation/materials.ts` + `types/artefact.ts` + `data/materials.ts` —
      apply 2GN.111's ruling to the property model _(blocked: depends on 2GN.111, M1)_ — **rescoped
      by that ruling**: the task was filed presupposing per-state values on every axis ("at minimum
      worked vs finished"), and the spike measured that exactly one axis needs them, so this now
      audits a specific list rather than performing a general reconciliation. Three pieces: give
      `rigidity` per-state values (`{worked, finished}`); re-author `fragility` and `hardness` to
      the **working** state across all 16 materials, since both feed `computeLayerGrade` and nothing
      else and the current finished-state authoring is therefore wrong (glass `fragility: 7` cold
      while decorated hot, fired clay `6` fired while decorated wet); and document the pinned state
      on `formability` (working) plus the state-independence of `grainFineness`, `porosity` and
      `combustibility`. Not a 2GN.102 workaround to clear — `relief`'s leather exclusion was already
      corrected on its cured-state merits in that task. ⚠️ re-authoring `fragility`/`hardness`
      shifts `meanDecorativeGrade` for glass and fired clay, so the 2GN.79 calibration guard will
      flag it and the recorded rates need re-recording with the drift annotated
- [x] **2GN.110** — design spike — should `CulturalProfile.materialAffinities` support per-material
      entries alongside per-tag ones? **Ruled 2026-08-13: yes, via `MaterialSelector`.** See
      `docs/spikes/2GN.110-per-material-affinities.md`, doc 11 §2.13, doc 12 §2.45. The map is
      re-keyed by the same tagged union 2GN.112 built for `MaterialFlow`, and for the identical
      reason: `bone`, `glass` and `leather` each name both a `MaterialTag` and a `MaterialName`, so
      a bare union cannot distinguish them and precedence would make 3 of 16 materials unselectable
      by one of their two readings. Only half the flow pattern transfers — `includes`/`excludes`
      exists because membership needs subtraction, and affinities are weights with nothing to
      subtract. **Resolution is most-specific-wins**: a class entry sets a default, a specific entry
      is an exception to it, so `{tag:'metal'}: 1.5` with `{id:'gold'}: 0.8` reads "all metals are
      1.5, except gold, which is 0.8". A specific entry with no class entry is well-formed, and is
      what recovers Thalassar's dropped intent exactly (`{id:'gold'}: 1.2, {id:'silver'}: 1.2`, no
      `metal` entry). **Closes the unruled `max` reduction** flagged in `culturalAffinityWeight`'s
      JSDoc: per-material entries make the multi-value case arrive through the selector rather than
      through a multi-tag material, and 2GN.84 already measured max discarding authored values
      whenever the class tag scored higher (3 of 5 dead), so a specific entry could only ever raise
      a material, never lower it. Product-of-deviations rejected — 1.5 × 0.8 = 1.2, so a
      below-neutral authored value yields an above-neutral weight. `materials.ts` and
      `decoration.ts` move together. ⚠️ `effectiveOptionWeight` (`grammar.ts`) does **not**
      participate and this is not an inconsistency to reconcile: it weights options by tag-keyed
      `culturalModifiers` at stage 4, before materials are assigned at stage 6, so it never sees a
      material. ⚠️ the tag-versus-tag tie stays **explicitly unruled** — no shipped material carries
      two class tags, and authoring against a shape that does not exist is the defect 2GN.87
      punished. Boundary the brief asked for: a per-material affinity is legitimate because it lives
      in `CulturalProfile` (that culture's opinion) where the retired tags lived in
      `MaterialDefinition` (Earth's judgement, applied universally) — the test is **where the
      statement lives, not how specific it is**. Unblocked 2GN.27, 2GN.68 and 2GN.114; ⚠️ 2GN.114
      re-authors the same Explorer presets this ruling re-keys, so sequence them together
- [x] **2GN.111** — design spike — should `MaterialDefinition.physicalProperties` carry per-state
      values at all, and if so which states? **Ruled 2026-08-13: per-state on `rigidity` alone.**
      See `docs/spikes/2GN.111-per-state-physical-properties.md`, doc 11 §2.14, doc 12 §2.46. Two
      states, not three. **The consumers are the fault line, not the physics**: three axes vary
      strongly by state and one marginally, but what decides the shape is which state each _reader_
      needs. `relief` (`formability >= 3`) and wire-drawing (`formability >= 5`) ask working-state
      questions; the three `rigidity >= 3` gates on `overlay`/`studs`/`gilding` ask a finished-state
      one; `computeLayerGrade` reads its six difficulty axes in the working state, since difficulty
      is incurred while working. **Bronze decides it** — whether bronze can be forged into a raised
      form and whether the finished object still holds applied leaf are both true and are different
      numbers, so no single convention serves both. Only `rigidity` is asked in both states by
      different consumers, so only `rigidity` becomes `{worked, finished}`. Pinning: `formability`
      working (already correct), `fragility` working, `hardness` working,
      `grainFineness`/`porosity`/`combustibility` state-independent. Blanket per-state rejected — 16
      × 7 × 3 = 336 values to capture variation in four axes, and a uniform shape invites false
      precision (an author given three boxes fills all three, the failure 2GN.87 punished); `raw`
      rejected because no consumer asks about an unworked material. ⚠️ **`fragility` and `hardness`
      are a live defect**: both feed `computeLayerGrade` and nothing else, so working state is the
      only correct reading, yet both are authored finished-state — glass carries `fragility: 7`
      (cold) while decorated hot, fired clay `6` (fired) while decorated wet, both inflating
      difficulty. ⚠️ correcting them **shifts `meanDecorativeGrade`** for those materials, so the
      2GN.79 guard will flag it; sequence with the other recalibration-bearing work. Rescoped
      2GN.105; unblocked 2GN.93, 2GN.105, 2GN.106 and 2GN.107
- [x] **2GN.112** — design spike — should `MaterialFlow.specificMaterials` narrow a flow, or widen
      it? _(depended on 2GN.78 — done)_ — filed and **ruled 2026-08-12** from PR #57 review, then
      implemented on the same branch. **Neither: the field is gone.** `MaterialFlow` now selects via
      `includes: MaterialSelector[]` plus optional `excludes`, where `MaterialSelector` is
      `{ tag: MaterialTag } | { id: MaterialName }` — a flow supplies a material when some
      `includes` selector names it and no `excludes` selector does. The old pair had two fields
      feeding one selector with the combining rule unstated: `flowSuppliesMaterial` ORed them while
      the type's JSDoc claimed the id list narrowed the tag, so the list could only widen and
      2GN.78's three re-keyed flows silently reached the whole class rather than the gold/silver and
      jade they were authored and commented as carrying. Narrowing alone was rejected as
      insufficient: it expresses "no metals except gold" but reaches "all metals except gold" only
      by enumerating the complement, which freezes against a catalogue that later gains a metal —
      `excludes` is what buys that case. A single explicit material list had the same gap and also
      lost a class tag's open-over-the-catalogue property. Selector arms are tagged rather than bare
      strings because `bone`, `glass` and `leather` each name both a `MaterialTag` and a material
      id. **Scope addition:** `MaterialName` now types every material id — `MaterialDefinition.id`,
      `RegionalAvailability.materialId`, `GeologicalContext.materialAvailability`'s key,
      `MaterialAssignment.materialId` and the selector's `id` arm — declared in `types/tags.ts`
      rather than derived from `MATERIALS` (that import would cycle) and pinned to the catalogue by
      a two-directional test, replacing a runtime equivalent `tests/fixtures/world.ts` was
      hand-rolling. ⚠️ breaking on both counts. **One measured behaviour change:** Thalassar loses
      jade, whose `trade-only` entry had been arriving through the obsidian flow's `stone` tag arm
      under the OR; every other preset/material pair is byte-identical to `origin/main`, all 30
      calibration pins hold with nothing re-recorded, 578 tests pass. Recorded in doc 05 §3.4 and
      doc 12 §2.41
- [x] **2GN.123** — `types/world.ts` + `engine/generation/materials.ts` +
      `engine/generation/decoration.ts` — re-key `CulturalProfile.materialAffinities` from
      `Map<MaterialTag, number>` to the `MaterialSelector` tagged union, resolved
      **most-specific-wins** — filed 2026-08-13 during PR #61 review. 2GN.110 ruled this on
      2026-08-13 and nothing carried it: the type is still tag-keyed at `types/world.ts:220`, and
      `data/explorer-cultures.ts` still holds the comment recording Thalassar's dropped
      `precious-metal: 1.2` as an open design question. Its four existing dependents (2GN.27,
      2GN.68, 2GN.114, 3WS.3) all consume or fixture-build around affinities rather than re-keying
      them, so the ruling had no destination. A bare `MaterialTag |
      MaterialName` union cannot
      work, because `bone`, `glass` and `leather` each name both a class and a material — exactly
      why the flow side needed the tagged form at 2GN.112. `includes`/`excludes` does **not**
      transfer: membership needs subtraction, affinities are weights with nothing to subtract.
      Deliverable: the re-keyed type, `culturalAffinityWeight` (`materials.ts`) and
      `bestMaterialAffinity` (`decoration.ts`) moved onto most-specific-wins resolution, the four
      Explorer presets migrated, and Thalassar's authored intent restored as
      `{id:'gold'}: 1.2, {id:'silver'}: 1.2` with no `metal` entry. ⚠️ closes the unruled `max`
      reduction flagged in `culturalAffinityWeight`'s JSDoc: 2GN.84 measured max discarding authored
      values whenever the class tag scored higher (3 of 5 dead), so under max a specific entry could
      only ever raise a material, never lower it. ⚠️ moves material-selection distributions, so
      `EXPECTED_FIRE_RATES` needs re-recording with the drift annotated
  - Note: delivered 2026-08-13 across two branches — mechanism first with distributions held still
    (so the calibration guards proved the re-key behaviour-neutral: affinity factors and final
    weights byte-identical to `main` across 4 presets × 16 materials), then Thalassar's restoration.
    Shipped as `readonly MaterialAffinity[]`, **not** the `Map<MaterialSelector, number>` this line
    and the ruling both name: a JS `Map` matches object keys by reference, so `.get({tag:'metal'})`
    can never hit an entry authored as a different literal. Recorded in doc 12 §2.47.
  - Note: `EXPECTED_FIRE_RATES` needed **no** re-record, and that is itself the finding. Restoring
    Thalassar moved its gold share 24.9%→26.1% of metal and silver 34.3%→37.7%, and no pin noticed —
    every calibration guard samples `mockCulturalProfile()` against `mockRegionalWorld`, so the four
    shipped presets were entirely unmeasured. Closed with the first preset-level affinity guard
    (`materials.calibration.test.ts`), which needed two attempts: a pinned share could not separate
    restored from unrestored across seed salts, and the paired-seed version that replaced it passed
    against a `max`-rebuilt resolver until its suppression case gained a class entry to override.
    Doc 12 §2.48; a preset-level share pin for the other three presets is left open there.
- [ ] **2GN.124** — `src/lib/data/materials.ts` + `src/lib/types/tags.ts` — widen the material
      catalogue beyond the 16 shipped materials, scoped to what artefact generation and craft
      actually need. Four of the eight `MaterialTag` classes are single-leaf (clay, glass, fiber,
      leather), so `materials.calibration.test.ts` emits no intra-tag split for them — it would
      "always read 100% and carry no information" — leaving half the guard's two-level tree
      unmeasurable by construction. Covers both filling out thin classes (copper, tin and lead under
      `metal`; wool and hemp under `fiber`; further clays) and breadth for archaeological
      plausibility (shell, amber, horn, pigments, composite materials), judged by what a real
      assemblage needs rather than by filling tag rows for their own sake. ⚠️ may require new
      `MaterialTag` members, which touches the `MaterialSelector` keyspace and every authored
      `materialAffinities` entry array; `MATERIAL_NAMES` is declared rather than derived from
      `MATERIALS` (the import would cycle), so `materials.test.ts`'s two-directional pin fails
      loudly until the list is updated alongside. ⚠️ moves material-share distributions, so
      `EXPECTED_TAG_SHARES` and `EXPECTED_INTRA_TAG_SHARES` need re-recording _(blocked — depends on
      2GN.136)_
  - Note: ⚠️ **Forward hazard (2GN.128, 2026-08-14):** this task changes the availability model the
    affinity-silence validator computes its verdict from, so materials that were legitimately silent
    may become accessible and re-open violations 2GN.128 closed. Re-run the validator and re-close
    the four presets as part of this task. The mechanical check is `findAffinitySilenceViolations`
    (`engine/generation/cultureValidation.ts`), which reports the gaps without throwing;
    `data/explorer-cultures.ts` throws on import once they are real.
- [ ] **2GN.125** — design spike — does `AvailabilityLevel` conflate materials that are **found**
      with materials that are **produced**? _(blocked — depends on 2GN.124)_ `GeologicalContext`'s
      own JSDoc calls itself "geological material scarcity" and cites obsidian, gold and tin, yet it
      keys `leather`, `linen`, `bone`, `antler`, `oak`, `ash`, `fired-clay` and `glass` — none of
      which are geological. Measured 2026-08-13: **10 of the 16 shipped materials are produced
      rather than dug.** Sharpest are `bronze` and `iron`: bronze does not exist in the ground at
      all (an alloy requiring tin _and_ copper) and iron requires smelting from ore, yet each
      carries a single `AvailabilityLevel` conflating "the ore is here" with "we can smelt it".
      **This double-counts**, because `computeMaterialWeight` multiplies
      `scarcityWeight × phaseTechnologyWeight` as independent terms: for granite they genuinely are
      independent (the rock is underfoot; carving is a separate skill), but Tarpan's bronze `scarce`
      stands in for ore-plus-tin-plus-smelting, which its `metallurgy: 0.6` already encodes — the
      same constraint applied twice. It also makes authoring unstatable: nothing can express
      "abundant cattle, no tanning tradition" or "rich ore, no smelting" as distinct from simply
      "little leather" or "little iron". Rule whether `AvailabilityLevel` splits into
      substrate-versus-product, whether a `requiresExtraction` flag or an input-material relation
      hangs off `MaterialDefinition`, or whether `craftDomain` absorbs the distinction. Sequenced
      after 2GN.124 deliberately, so the ruling is made against the widened catalogue rather than a
      16-material sample that may not contain the awkward cases
  - Note: filed 2026-08-13 from a preset-cultures audit. The conflation surfaced while checking
    whether each preset's authored affinities were reachable: Tarpan authors `metal: 1.3` and its
    geology marks bronze `scarce`, which reads as a statement about deposits but is really a
    statement about metallurgy.
- [ ] **2GN.126** — apply the 2GN.125 ruling to the availability model — `types/world.ts`
      (`AvailabilityLevel`, `GeologicalContext`, `RegionalAvailability`), `types/artefact.ts`
      (`MaterialDefinition`), `engine/generation/materials.ts` (`scarcityWeight`,
      `computeMaterialWeight`, `explainMaterialWeight`) and the four Explorer preset geologies
      _(blocked — depends on 2GN.125)_ ⚠️ moves material-selection distributions wherever a produced
      material stops being weighted as though it were dug, so `EXPECTED_FIRE_RATES`
      (`calibration.test.ts`), the region/tag share and intra-tag split guards
      (`materials.calibration.test.ts`) and the preset affinity guard all need re-recording with the
      drift annotated. ⚠️ breaking if `AvailabilityLevel` gains or splits members: `save.ts`
      persists world state, and every authored geology in `data/explorer-cultures.ts` and
      `tests/fixtures/world.ts` is keyed on the current five levels
  - Note: blocks 3WS.3, 3WS.6 and 3WS.7 — the three M3 generators that emit or consume this model.
    3WS.7 generates `AvailabilityLevel` directly; 3WS.3 generates
    `CulturalProfile.materialAffinities`, whose coherence depends on what an availability level
    means; 3WS.6 generates `MaterialFlow`s, and a found/produced split changes what a flow can
    coherently carry (ore, ingots and finished hide are different goods). All three already sit
    behind the M2 gate via 3WS.1, so these edges record ordering rather than changing any status
    today — they survive the gate lifting, which is the point.
  - Note: ⚠️ **Forward hazard (2GN.128, 2026-08-14):** this task changes the availability model the
    affinity-silence validator computes its verdict from, so materials that were legitimately silent
    may become accessible and re-open violations 2GN.128 closed. Re-run the validator and re-close
    the four presets as part of this task. The mechanical check is `findAffinitySilenceViolations`
    (`engine/generation/cultureValidation.ts`), which reports the gaps without throwing;
    `data/explorer-cultures.ts` throws on import once they are real.
- [x] **2GN.127** — design spike — should a material absent from
      `CulturalProfile.materialAffinities` resolve to the neutral `1`, or is silence an authoring
      error that should throw? `culturalAffinityWeight` (`engine/generation/materials.ts`) returns
      `1` for any material no entry matches, and `computeTechniqueWeight` (`decoration.ts`) does the
      same for `techniqueAffinities` — so **an unauthored material is indistinguishable from one
      deliberately authored at exactly `1.0`.** Measured 2026-08-13 across the four Explorer
      presets: 8–12 of 16 materials and 13–14 of 16 techniques resolve by default rather than by
      authorship, so most of every preset is silence. Xoconahtl's `['clay', 1.0]` is the case that
      exposes it — behaviourally identical to omitting the entry, kept only because a comment says
      it is deliberate indifference, which is exactly the distinction the type cannot carry. ⚠️ The
      stakes cut both ways and the spike must weigh both: throwing makes every preset state a
      judgement about every material (~250 authored numbers across four presets today, growing with
      2GN.124's widened catalogue) and turns a new material into a breaking change for all authored
      cultures; keeping the default leaves "considered and indifferent" and "never considered"
      permanently indistinguishable, which is the same silently-dead-authoring failure 2GN.84
      measured on the retired `precious-*` entries. Options to rule between include: keep the
      default; throw on omission; require an explicit neutral sentinel; or a
      `completeness: 'partial' | 'exhaustive'` flag on the profile letting a culture opt into
      strictness. Applies equally to `techniqueAffinities`, `contextWeights` and `siteTypeWeights`,
      which share the shape — rule the family, not the one map
  - Note: filed 2026-08-13 from a preset-cultures audit. Sits alongside doc 12 §2.47's lesson that a
    dormant path accumulates no evidence about itself: a defaulted entry is dormant authoring, and
    nothing in the suite can tell it from a decision. Related to 2GN.124 (a widened catalogue
    multiplies the authoring cost of throwing) but not blocked on it — the ruling is about the
    contract, not the catalogue size. **Ruled 2026-08-14** — see
    `docs/spikes/2GN.127-affinity-silence.md`, doc 11 §2.15 and doc 12 §2.49. **Silence is
    legitimate iff the material is inaccessible** (`absent` locally with no flow reaching it, or
    unmodelled in that geology); anything obtainable locally or by trade must carry an entry, class
    or specific, enforced by a validator at profile-construction time. None of the four options in
    the brief was taken: absence is derivable from `isAvailable`, so the distinction becomes a
    validation question rather than a syntax one — no sentinel, no completeness flag, no migration
    of authored profiles. ⚠️ Throwing on all omission was rejected for abolishing absence rather
    than distinguishing it. Two corrections to the brief: `contextWeights`/`siteTypeWeights` have
    **no engine readers**, so ruling the whole family would author contracts against unobserved
    behaviour; and `isAvailable`'s MVP lenience reads unmodelled as available, which inverts the
    rule, so the validator treats it as a third state. Measured 31 violations against 8 legitimate
    silences across the four presets. Implementation is 2GN.128; `techniqueAffinities` is 2GN.129,
    deferred behind the `materialAccessGate` `> 1` substrate-gate defect the ruling surfaced.
- [x] **2GN.128** — `engine/generation/cultureValidation.ts` (new) + `data/explorer-cultures.ts` —
      enforce the 2GN.127 ruling: silence in `CulturalProfile.materialAffinities` is legitimate
      **iff** the material is inaccessible to that culture (`absent` locally with no `MaterialFlow`
      reaching it, **or** unmodelled in that geology); a material that is locally obtainable, or
      `trade-only` with a flow that reaches it, must carry a matching entry, class or specific.
      Validator throws at profile-construction time, not during generation. ⚠️ `isAvailable`'s MVP
      lenience returns `true` for an unmodelled material, which read naively inverts the rule —
      unmodelled is the strongest case for "never encountered", so the validator must treat
      `level === undefined` as a third state, the way `scarcityWeight`'s JSDoc already does, rather
      than folding it into accessible. ⚠️ The obligation is **one-directional**: accessible ⟹ must
      be covered; covered ⟹ nothing implied about access, so an entry covering an inaccessible
      material is legal and silent. Class entries discharge the obligation (most-specific-wins
      already treats a `{ tag }` entry as each covered material's real weight), which is what keeps
      authoring terse — khaltiris states 2 entries covering 8 materials. Measured 2026-08-14 across
      the four presets: **31 violations against 8 legitimate silences** (tarpan 6/3, thalassar 11/1,
      xoconahtl 6/4, khaltiris 8/0), so all four are re-authored here and the validator throws from
      the start. Khaltiris has no legitimate silences and must state a position on all 16 materials.
      Presets are re-authored to fit the rule, not the reverse: they exist to showcase the engine.
      Xoconahtl's `['clay', 1.0]` and its comment naming this question resolve here
  - Note: ruled by 2GN.127 on 2026-08-14 — see `docs/spikes/2GN.127-affinity-silence.md`, doc 11
    §2.15 and doc 12 §2.49. Ships ahead of 2GN.124/2GN.126 deliberately: both rewrite the
    availability model the validator reads, so each will re-open violations this task closes, but
    the validator is the durable artefact and building it first is what makes those tasks' preset
    edits checkable. ⚠️ Forward hazard recorded on 2GN.124 and 2GN.126. Scope is
    `materialAffinities` only — `techniqueAffinities` is 2GN.129, and
    `contextWeights`/`siteTypeWeights` have no engine readers at all and inherit the principle when
    they get one (ruling strictness for a dormant map is the defect 2GN.87 punished). **Landed
    2026-08-14** — validator is `findAffinitySilenceViolations` /
    `assertAffinitiesCoverAccessibleMaterials` in `engine/generation/cultureValidation.ts`;
    enforcement point is module load in `data/explorer-cultures.ts`. All 31 violations closed
    (tarpan 7 entries, thalassar 12, xoconahtl 8, khaltiris 9); suite 594 → 611 passing with no
    calibration pin re-recorded. Two findings in doc 12 §2.50: the three-state read needed **no new
    export** (`explainMaterialWeight` already returns `level` and `available` separately, so
    accessibility is `level !== undefined && available`, and the private region helpers stayed
    private); and ⚠️ a duplicate class selector silently voids `materials.calibration.test.ts`'s
    `classLifted` arm, which is why thalassar discharges bronze/iron specifically rather than with a
    `metal` class entry. Xoconahtl's `['clay', 1.0]` keeps its value — only the comment was
    discharged — because it is the live instance of the `> 1` gate defect 2GN.129 rules.
- [ ] **2GN.136** — design spike — rule the selection criteria and target size for widening the
      material catalogue: what "what a real assemblage needs" (2GN.124's stated judge) means
      concretely — which single-leaf `MaterialTag` classes must gain siblings for
      `materials.calibration.test.ts`'s intra-tag guard to measure anything (clay, glass, fiber,
      leather), which archaeologically common materials earn a slot (shell, amber, horn, pigments,
      composites), whether new `MaterialTag` members are admitted, and the per-candidate
      recalibration cost (`EXPECTED_TAG_SHARES`/`EXPECTED_INTRA_TAG_SHARES` move; every authored
      `materialAffinities` entry array and the 2GN.128 validator verdicts are touched) _(blocked:
      depends on M1)_
  - Note: Filed 2026-08-20 from the M2 dependency audit: 2GN.124 is written as implementation but no
    doc section defines selection criteria or a target catalogue size, and the change is
    calibration-shifting. This spike rules the scope; 2GN.124 implements it.
- [x] **2GN.143** — design spike — what role does `MaterialAssignment.provenance`
      (`local`/`trade`/`unknown`) play in the material-standing formula doc 11 §2.9 states as
      "availability × cultural affinity × provenance × stratification"? Provenance is categorical,
      not numeric, so it cannot be a literal multiplicative term. Rule whether provenance should
      stay implicit, become an explicit categorical multiplier, or something else, and update doc 11
      §2.9's formula statement to match
  - Note: **Ruled 2026-08-25 — see `docs/spikes/2GN.143-provenance-in-material-standing.md`, doc 11
    §2.9 (restated) and doc 12 §2.55. (a): provenance stays implicit in availability.** Measured
    over 448 material/culture/world pairs: `deriveMaterialProvenance`'s `source` is a total
    deterministic coarsening of `explainMaterialWeight`'s `level` (locally obtainable → local
    286/286, reachable trade-only → trade 100/100), both from the same `bestRegionalLevel` call, so
    an explicit multiplier would count `level` twice. Formula restated as standing =
    f(availability⁻¹, cultural affinity, stratification). Direction trap caught by Jason at ruling:
    `weight` is a _selection_ weight (trade-only 0.15) and points the wrong way for standing, so
    2GN.27/2GN.68 compose from the components, never from `weight`. Reopen only if trade flows gain
    distance/intensity. Originally filed 2026-08-21 while scoping 2GN.27; soft-linked to 2GN.144.
- [ ] **2GN.146** — `engine/generation/materials.ts` — `scarcityWeight`'s `trade-only` rung reads
      `economy.tradeOpenness` on the selection side, the generation-side counterpart of the standing
      lerp 2GN.27 shipped: an open trading culture imports more of a traded material than a closed
      one, where today both draw it at the same 0.15 rung. Rule the lerp target (towards the
      `available` rung, mirroring `materialStanding`, or a shallower one) and whether `tradeRescued`
      should read the same openness _(blocked: depends on 2GN.27, M1)_
  - Note: Filed 2026-09-15 from the 2GN.27 spike (doc 12 §2.59). Standing and selection were
    deliberately allowed to diverge on this axis for now: `materialStanding` tempers a trade-only
    material by openness while `computeMaterialWeight` does not, so a trading culture reads its
    imports as ordinary yet still makes few things from them. ⚠️ calibration-shifting:
    `EXPECTED_PROVENANCE_MIX` is the pin most directly sensitive to the trade-only rung and
    re-records, with `EXPECTED_TAG_SHARES` likely to follow in trade-heavy fixture worlds.
- [ ] **2GN.151** — Explorer: material property axes in the material viewer (2GN.60), showing
      per-state values per 2GN.105 _(blocked — depends on 2GN.60, 2GN.105)_
- [ ] **2GN.156** — Explorer: material (2GN.60) and decoration (2GN.61) panels show whole-object
      coherence verdicts _(blocked — depends on 2GN.60, 2GN.61, 2GN.70)_
- [ ] **2GN.163** — Explorer: material viewer (2GN.60) shows re-keyed `MaterialSelector` affinities
      (2GN.123) and the found/produced availability model (2GN.126). Filed 2026-09-25
      (roadmap-review, deps lens): the M3 generators 3WS.3/3WS.6/3WS.7 consume the affinity and
      availability models, and neither had an Explorer surface _(blocked — depends on 2GN.60,
      2GN.123, 2GN.126)_

---

## Milestone 5: Decoration

**Goal:** Decorative layers, techniques, motifs and introduced materials applied after materials,
graded by craft

- [x] **2GN.28** — `src/lib/data/decorations.ts` — decorative technique definitions: surface
      treatments (polish, patina, scoring, engraving, relief, painting, glaze), applied elements
      (inlay, overlay, studs, wire-wrapping, gilding), textile elements (wrapping, tassels, beading)
      with material prerequisites — each of the sixteen doc 05 §8.2 terminals gets a
      `DecorativeTechniqueDefinition` (`category`, `substrate`, `carriesMotif`,
      `introducesMaterial`); the new `DecorativeSubstrate` type (`types/decoration.ts`) splits
      `[requires: ...]` prerequisites into `{kind:'material', label, test}` — an executable
      predicate over `MaterialDefinition` reusing the `decorability`/`physicalProperties`/`tags`
      facts materials.ts pre-resolved for exactly this (engraving/inlay → `engravable`, painting →
      `paintable`, glaze → `glazeable`, gilding → metal tag; relief/overlay proxy "thick"/"rigid"
      off `hardness !== 'soft'`; studs → rigid-or-leather) — versus
      `{kind:'form', requires:'grippable'|'attachment-point'}` for wire-wrapping/wrapping/beading,
      whose prerequisite is the target component's geometry, not its material, and so is only
      labelled here for 2GN.30 to resolve; polish/patina/roughening/scoring/tassels get
      `{kind:'none'}`; covered by 12 new Deno tests in `decorations.test.ts` —
      one-definition-per-technique via a compiler-checked `Record<DecorativeTechnique, true>`
      (materials.test.ts's `ALL_MATERIAL_TAGS_RECORD` precedent), valid category/discriminant shape,
      five techniques' predicates exercised against real `MATERIALS` fixtures (engraving accepting
      soft-but-workable gold, rejecting flint/fired-clay; glaze accepting only fired-clay; gilding
      accepting all four metals; painting rejecting bronze; studs accepting leather despite
      softness), and `carriesMotif`/`introducesMaterial` checked against the full technique set
- [x] **2GN.29** — `engine/generation/decoration.ts` — decorative grammar expansion: iterate
      surfaces, select techniques weighted by culture + phase _(depends on 2GN.23, 2GN.28)_ —
      `expandDecoration(artefact, culture, phase, geology, trade, materials, techniques, prng): DecorativeLayer[]`
      iterates `artefact.components` and, per component, fills each of the doc 05 §8.2 BNF's three
      zero-or-more categories (surface-treatment, applied-element, textile-element) independently: a
      per-category probabilistic fill (`decorationIntensity` — an equal-weight blend of
      `society.craftSpecialisation`/`aesthetics.decorativeEmphasis`, MVP-provisional per the 2GN.8
      precedent since doc 05 §8.3 names the two drivers without quantifying them) draws up to
      `MAX_SLOTS_PER_CATEGORY` slots with per-slot geometric decay mirroring `grammar.ts`'s
      attachment-depth shape, each filled slot resolved by `weightedSelect` over
      `computeTechniqueWeight`; emitted layers are flat (`sublayers: []`, `motifRef`/`material`
      omitted) — layering (2GN.31/32), motif assignment and introduced-material resolution (2GN.33)
      are explicitly out of scope, as is per-component substrate _enforcement_ (2GN.30, which strips
      candidate layers this task may emit for a component whose eventual material/geometry doesn't
      actually satisfy the technique). `computeTechniqueWeight` is a product of four factors floored
      at `Math.max(0.01, …)` per the `effectiveOptionWeight`/`computeMaterialWeight` precedent: the
      culture's `techniqueAffinities` (new field, below), a one-directional `materialAccessGate`, a
      `TECHNIQUE_CRAFT_AXIS`-gated phase-technology lerp (all MVP-provisional, e.g.
      engraving/inlay/relief/overlay/studs/wire-wrapping/gilding provisionally read against
      `metallurgy` absent per-component material threading), and an `aesthetics.decorativeEmphasis`
      skew. Extracted `resolvePhaseAttribute` out of `grammar.ts` into new shared
      `engine/generation/phase.ts` (both engines needed the identical dotted-path lerp-attribute
      resolver; `grammar.ts` now imports it, behaviour unchanged, `grammar.test.ts` still green). ⚠️
      **Breaking change**: added `techniqueAffinities: Map<DecorativeTechnique, number>` to
      `CulturalProfile` (`types/world.ts`) — not doc 05 §3.3-specified, authored because the product
      requirement (four independent quadrants: engraving-with-beasts, engraving-without-beasts,
      beasts-without-engraving, neither) needs a per-culture _technique_ preference signal that's
      independent of both `motifVocabulary` (motifs, 2GN.33) and `materialAffinities` (which
      materials, not which techniques); a technique absent from the map reads neutral. Its selection
      weight is additionally gated one-directionally by `materialAccessGate`: a culture that neither
      favours-above-neutral nor can obtain (`isAvailable`, reused from `materials.ts`) any material
      satisfying a technique's `substrate.test` has that technique suppressed to a
      `MATERIAL_ABSENT_GATE` floor regardless of stated affinity (a culture cannot engrave what it
      has no engravable material for), but the converse never holds — favouring an engravable
      material never forces engraving to be selected. `tests/fixtures/culture.ts`'s
      `mockCulturalProfile` gained a matching metal-leaning `techniqueAffinities` default
      (engraving/inlay/gilding) so it agrees with its existing metal-leaning `materialAffinities`
      rather than contradicting it out of the box; overrides replace the whole `Map`, independently
      of `materialAffinities`, per the existing shallow-branch-replacement convention. Covered by 20
      new Deno tests in `decoration.test.ts` — `computeTechniqueWeight`'s four factors each shown to
      shift weight the expected direction (including the technology floor never zeroing and a
      technology-neutral technique being unaffected), both material-gate directions (suppression
      when no plausible material exists, and non-inflation when material favour exists without
      technique affinity), form/none substrates never gated; `expandDecoration`'s determinism (same
      seed identical, varied seeds diverge), purity (structuredClone snapshots for every input
      except the technique catalogue, which carries an unclonable `substrate.test` closure and is
      instead checked by per-entry reference identity), target-component validity, the
      flat-output/omitted-field boundary guard, all-three-categories coverage at max intensity,
      intensity-driven total-layer-count distribution, an isolation test confirming
      `technology.textiles` shifts only the textile-element category and never leaks into other
      categories' shares, empty-category and empty-component safety, and default-catalogue
      equivalence — plus 3 new fixture tests in `culture.test.ts` guarding the new field's default
      value and independent-override behaviour.
- [x] **2GN.30** — `engine/generation/decoration.ts` — material prerequisite enforcement (engraving
      → hard material, glaze → ceramic, etc.) — landed as
      `enforceSubstrates(layers, assignments,
      materials, techniques): DecorativeLayer[]`,
      mirroring `gradeDecorativeLayers`' shape: PRNG-free, pure, recursive over `sublayers`, honest
      degradation when a layer's target component has no resolvable material assignment. Strips a
      layer whose assigned material fails the technique's own `kind: 'material'` substrate.test; a
      stripped layer takes its sublayers with it. Evidence that motivated the task, surfaced during
      PR #53 review: measured exhaustively across all 16 techniques × 16 materials, 49 gate-failing
      pairings were still gradeable pre-fix, six inverted (a gate-failing material graded _easier_
      than every legitimate substrate) — sharpest case, `glaze` on `linen` graded above
      `fired-clay`, the only material `glaze`'s own gate accepts. `kind: 'form'` substrates
      (`wire-wrapping`/`wrapping`/`beading` — "grippable"/"attachment point") deliberately pass
      through unevaluated: nothing in the pipeline resolves component geometry/role yet, so
      stripping on an unrunnable check would silently delete three techniques from every artefact on
      no evidence — follow-on filed as **2GN.104**. The `oxidisation < 0` sentinel guard in
      `effectiveDifficulty` (2GN.99) was kept rather than removed: it's that function's own correct
      handling of a legal input value, load-bearing for two pinned tests and four production callers
      (`baselines.ts`/`calibration.test.ts`/`ruleCalibration.ts`/`tagInspector.ts`) that call
      `computeLayerGrade` directly without routing through stripping. **Ships unwired**, matching
      2GN.99's precedent — no production caller invokes `enforceSubstrates` yet, so no calibration
      pin moved. 11 new tests, including an exhaustive 16×16 sweep asserting every surviving
      material-substrate layer satisfies its own `substrate.test`; full suite 550 → 561 passing.
- [ ] **2GN.104** — `engine/generation/decoration.ts` — resolve `kind: 'form'` decorative substrates
      (wire-wrapping/wrapping/beading's `grippable`/`attachment-point`) against a
      `NormalisedComponent`'s geometry, and feed the result into `enforceSubstrates` (2GN.30)
      _(blocked — depends on 2GN.150, 2GN.10, 2GN.116)_ — filed 2026-08-09 during 2GN.30
      implementation; `enforceSubstrates` only enforces `kind: 'material'` substrates, matching the
      Explorer's existing `'unevaluated'` verdict for form substrates
      (`routes/dev/explorer/decoration/decorationLayers.ts`). ⚠️ Corrected 2026-08-20 during
      2GN.10's implementation: previously named `allowedMaterialTags` as the missing prerequisite,
      on the premise that no other field expresses "grippable"/"attachment point". That premise was
      wrong — `allowedMaterialTags` (real since 2GN.10) answers what a shape can be made from, a
      different question from whether a component is grippable or an attachment point. The actual
      missing piece is a component role concept, owned by 2GN.116's still-open spike, added as a
      formal dependency here.
- [ ] **2GN.31** — `engine/generation/decoration.ts` — layering support: `DecorativeLayer` with
      sublayers, decoration-on-decoration _(blocked: depends on 2GN.61, 2GN.132, M1)_ — ⚠️ when this
      lands, `techniqueComplexity` (`maxDepth * distinctTechniques`) stops being a bare
      distinct-technique count, since `maxDepth` is currently pinned at 1: the classification rule
      reading it (`data/classification.ts`, roadmap 2GN.34, doc 12 §2.24) will saturate at a
      fraction of its current technique breadth with no code change and needs re-measuring against
      real nested output; a Deno test in `engine/generation/classification.test.ts` pins today's
      flat-layer contract so this breaks loudly rather than silently
  - Note: **Ruled 2026-08-25 by 2GN.132** (doc 11 §2.21, doc 12 §2.57): ship
    `expandSublayers(layers, assignments, details, culture, phase, geology, trade, prng)` (name
    provisional) as a pure pass over `expandDecoration`'s flat output, seeded `${seed}-sublayers`,
    positioned after `assignMaterials`/`assignDecorativeDetails` and before
    `gradeDecorativeLayers`/`enforceSubstrates`. A sublayer's substrate is the parent's introduced
    material where its technique introduces one, otherwise the parent's target component's assigned
    material. `expandDecoration` untouched. The same PR wires the pass into `calibration.test.ts`'s
    sample loop and both Explorer sample paths, re-records the pins that move with drift annotated,
    and retires `classification.test.ts`'s 2GN.31 regression guard. Depth cap per 2GN.131.
    Sequencing note (PR #76 review): `gradeDecorativeLayers`/`enforceSubstrates` resolve material by
    `targetComponentId`, so until 2GN.133 lands a sublayer over an introduced material is
    graded/checked against the component's material; `expandSublayers` resolves the parent material
    for its own draw, and 2GN.133 remains the sequenced follow-on.
- [ ] **2GN.32** — `engine/generation/decoration.ts` — recursion depth cap from
      `craftSpecialisation` × `aesthetics.decorativeEmphasis` _(blocked — depends on 2GN.61, 2GN.131
      — done, 2GN.169)_ — 2GN.169 edge added 2026-11-18 (2GN.164): its calibration of the depth
      inputs would be wasted if the stratum and labour-investment spike changes them
  - Note: **Ruled 2026-08-25 by 2GN.131** (doc 11 §2.22, doc 12 §2.58): the formula is fixed
    (continuation chance
    `BASE_SUBLAYER_PROBABILITY × decorationVolume(phase) × SUBLAYER_DECAY^(d−1)`, ceiling
    `1 + round(craftSpecialisation × (MAX_SUBLAYER_DEPTH − 1))`, MAX 3) and lives inside 2GN.31's
    `expandSublayers` pass. Remaining scope is calibration: choose BASE, DECAY and the ceiling
    rounding against measured `maxDepth` per cell so high/high is not near-certainly depth 3, record
    the four-corner table, add `maxDepth` guards alongside the re-recorded R39/R40 pins.
- [x] **2GN.33** — `engine/generation/decoration.ts` — motif assignment from culture's
      `motifVocabulary`, shared motifs via cultural exchange — landed as
      `assignDecorativeDetails(layers, culture, phase, geology, trade, sharedMotifSources, materials, techniques, prng): DecorativeLayer[]`,
      a separate pure pass over `expandDecoration`'s output (interviewed decision-by-decision; doc
      12 §2.22 records the session) rather than emission-time filling, so the eventual pipeline can
      order it after 2GN.30's substrate stripping and `expandDecoration`'s draw-sequence contract
      stays untouched; recurses depth-first into `sublayers`, already correct for 2GN.31/32. Fills
      `motifRef` for the four `carriesMotif` techniques from a combined pool — native motifs at
      weight 1, borrowed motifs at their source's `culturalExchange.intensity` (per-motif weighting:
      at full intensity a borrowed motif is indistinguishable from native, doc 05 §8.5's
      maximum-ambiguity reading) — with exchange partners arriving pre-resolved as
      `SharedMotifSource[]` per the `trade: MaterialFlow[]` precedent (M3's context assembly owns
      temporal filtering). Also resolves `DecorativeLayer.material` for the seven
      `introducesMaterial` techniques (scope confirmed at interview — the 2GN.29/2GN.61/2GN.68 notes
      all attribute it here): candidates constrained by the interviewed per-technique tag table
      `INTRODUCED_MATERIAL_TAGS` (gilding → precious-metal only, historically grounded;
      wire-wrapping → metals; wrapping → fiber/leather; inlay → all but fiber/leather/clay; overlay
      → metals + leather; studs → metals + bone; beading → glass/stone/precious-stone/bone plus
      metals), filtered by `isAvailable` and weighted by the existing `computeMaterialWeight`
      product with `assignMaterial`'s availability-yields fallback. Empty pools degrade honestly
      (field omitted, never fabricated or thrown) — the docs' implied no-motif-less-cultures
      invariant is recorded on 3WS.8 for the generator to enforce. Spawned 2GN.76 (phase-varying
      motif salience). Covered by 17 new Deno tests in `decoration.test.ts` — determinism (same-seed
      identity, cross-seed divergence), purity plus new-object outputs, per-technique field
      boundaries pinned to catalogue flags,
      native-only/borrowed-appears/zero-intensity-never/intensity-scaling motif distributions,
      empty-pool omission, a per-technique tag-conformance sweep pinning the authored table,
      affinity-shift distribution, availability fallback, sublayer recursion, injected-catalogue
      passthrough, default-catalogue equivalence and an expandDecoration end-to-end pipe _(depended
      on 2GN.29 — done)_
- [ ] **2GN.76** — `engine/generation/decoration.ts` — motif salience fluctuates across a culture's
      lifespan: native and borrowed motifs are not equally prominent at every point in the culture's
      timeline; motif selection weights vary by phase _(blocked: depends on 2GN.150, M1)_ — added
      2026-07-25 during the 2GN.33 design interview: `assignDecorativeDetails` weights native motifs
      at 1 and borrowed motifs by exchange intensity, with no temporal variation — this task adds
      the phase-driven salience dimension
- [x] **2GN.61** — Explorer: decoration inspector — decoration layers per component with
      prerequisites, technique, layer depth — technique, BNF category and `[requires: …]`
      prerequisite per layer, with the prerequisite **evaluated** against the component's assigned
      material via `substrate.test`, so layers 2GN.30 will later reject are visible now (a 240-seed
      sweep finds all four verdicts occurring in real data); form prerequisites report `unevaluated`
      since resolving them against geometry is likewise 2GN.30's, and neither is conflated with
      `computeTechniqueWeight`'s culture-level `materialAccessGate`. Depth renders recursion-ready
      but is always 0 — `expandDecoration` emits `sublayers: []` until 2GN.31/2GN.32 — and the
      dormant `motifRef`/`material` fields (2GN.33) are not surfaced rather than shown permanently
      empty _(depended on 2GN.29 — done)_
- [x] **2GN.83** — recalibrate `expandDecoration`'s fill constants per the 2GN.80 ruling — landed
      doc-only (2026-08-06, doc 12 §2.32), the re-scope anticipated on pickup. No constant moved:
      recalibration presupposes a calibration target, and relativisation removed the old one (an
      absolute fire rate) without supplying a new one — a uniform volume change moves the sampled
      baseline and the measured artefacts together and largely self-cancels. Doc 05 §8.3's
      craft/emphasis four-corner table was the only stated target and was measured directly against
      the real pipeline, found unsound for two reasons: its numbers cap recursion depth, which has
      no producer until 2GN.31 (`expandDecoration` emits flat layers) — read as layers per
      component, measured output is 0.41/1.64/1.72/3.14 against the table's 0–1/0–1/~1/up-to-3; and
      the two middle corners are not jointly reachable by any function of
      `(craftSpecialisation, decorativeEmphasis)` — a joint sweep over the blend weight and all
      three fill constants floors residual error at ~0.83, because the high-craft corner is
      dominated by `partCount` (set upstream by `deriveComplexityBudget` in `grammar.ts`, which
      `expandDecoration` cannot cancel). §8.3's own wording confirms it: the middle corners differ
      by kind ("technically refined" vs "simple techniques"), not magnitude. A real implementation
      defect surfaced and is recorded, not fixed: `craftSpecialisation` enters decorative volume
      twice (blend and `partCount`), a measured 3.2× gap at identical intensity. New open question
      raised at doc 11 §1.5 with four candidate rulings and no recommendation. Split to **2GN.98**
- [x] **2GN.98** — design spike: rule doc 11 §1.5's decorative-volume question, then recalibrate
      `expandDecoration`'s fill constants against it — ruled 2026-08-06 (doc 11 §2.10, doc 12
      §2.33). `decorationVolume` reads `aesthetics.decorativeEmphasis` alone; a new
      `DecorativeLayer.grade` field reads `society.craftSpecialisation` scaled by a new authored
      `TECHNIQUE_DIFFICULTY` rating (16 values, reviewed per-item). Two cheaper shapes tried and
      rejected first: biasing technique selection toward low-difficulty techniques at low craft
      (real and directional, ~30% vs ~15–19% share, but capped — the weight function's other three
      factors dominate selection); `grade = craftSpecialisation` alone (orthogonal to volume but
      degenerate as a sampled feature — identical value for every layer in a culture-phase cell, so
      a percentile ladder over it never varies). The shipped formula
      (`craft * (1 - 0.5*difficulty) + 0.5*difficulty*craft²`) produces genuine within-cell spread
      instead. Doc 05 §8.3's four corners now land at 0.41–0.46/0.46–0.54/2.7–3.3/2.8–3.3
      layers/component against the stated 0–1/0–1/~1/up-to-3 — a substantial improvement on the
      pre-2GN.98 blend's 0.42/1.65/1.65/3.16, where the two middle corners were indistinguishable.
      `BASE_FILL_PROBABILITY`/`SLOT_DECAY`/`MAX_SLOTS_PER_CATEGORY` left unchanged — the corners
      land acceptably without retuning them. The recorded `craftSpecialisation` double-count is
      resolved by re-scoping: craft now has exactly two decorative-adjacent effects (`partCount`,
      unchanged; `grade`, new) rather than one effect counted twice. `appliedElementPresent`
      saturation confirmed unaffected (86.7% vs the prior 89.1%, within noise) — structural, as
      diagnosed at 2GN.79/2GN.83. New rule R44 reads `meanDecorativeGrade` at p90 (measured
      26.6%/12.3% at p75/p90; p90 matches the rule's "exceptional" framing, same reasoning 2GN.82
      used elsewhere). `EXPECTED_THRESHOLDS`/`EXPECTED_FIRE_RATES`/`EXPECTED_GATED_RATES`
      re-measured and re-recorded (R1–R28/R37–R39 bit-identical; R32 dropped 98.0%→89.2%, still
      exempt from `SATURATION_CEILING` by design); `statistics.regression.test.ts`'s p75 pin moved
      10→12, reframed against this task's own measurement. Rule count 43→44, relative/absolute split
      34/43→35/44. Four new `decoration.test.ts` tests; `deno task check` 0 errors,
      `deno
      test` 521/521 passing. Full detail: doc 12 §2.33
- [x] **2GN.99** — recalibrate `computeLayerGrade` to read technique difficulty per-material, not
      technique alone — shipped 2026-08-07 (doc 12 §2.35), after **2GN.101** rebuilt the property
      model it needed (now an explicit `dependsOn` edge, not just prose). **Lands as an unwired
      post-pass, the honest scope**: materials aren't known inside `expandDecoration`'s slot loop,
      and threading `assignMaterials` in would consume PRNG draws and move every recorded fire rate
      for reasons unrelated to grade. New `gradeDecorativeLayers` re-grades layers in a separate
      PRNG-free pass instead, mirroring `assignDecorativeDetails`; `expandDecoration`'s grade is now
      documented as _provisional_. Nothing in the sampled path changed at ship time, so **no
      calibration pin moved then** — a stronger inertness checkpoint than 2GN.82/2GN.98's. That held
      only until a later PR #53 review round found the remaining ungraded samplers
      (`calibration.test.ts`'s `measureFireRates`, the Explorer's `ruleCalibration.ts`,
      `tagInspector.ts`, `sample-classification.ts`) and wired them through the material-aware pass,
      moving R44's pooled fire rate 4.0% → 10.4% (roadmap 2GN.103), and found and fixed a follow-on
      defect where the `oxidisation: -1` sentinel reached the difficulty weighting unguarded (see
      doc 12 §2.35's updated notes; the wider class of defect that investigation surfaced is
      recorded against **2GN.30**, deliberately unfixed here). Formula modulates _difficulty_ rather
      than the grade, keeping the [0,1] bound and the craft-degradation curve intact. New
      `TECHNIQUE_MATERIAL_SENSITIVITY` authored technique-by-technique, then **scaled ×2.5 after
      measurement** (at the original band engraving spanned only ~0.044 across all 16 materials
      against ~0.3 between techniques — material was a rounding error, and too weak to keep
      `meanDecorativeGrade` a viable sampled feature). Scaling exposed a clamping artefact — 22 of
      256 pairs claimed work was _perfectly_ easy — fixed by `MINIMUM_DIFFICULTY = 0.05`. Known
      limitation recorded: the three form-substrate techniques score near-inert because their
      difficulty comes from the _introduced_ material, which this model can't reach. `deno test`
      550/550
- [ ] **2GN.106** — `data/decorations.ts` + `engine/generation/decoration.ts` — add `formability` to
      `MaterialDifficultyAxis`, an `AXIS_NORMALISATION` entry, and per-technique
      `TECHNIQUE_MATERIAL_SENSITIVITY` weights, with re-measured grade distributions and 2GN.103's
      regional pins re-verified _(blocked: depends on 2GN.102, 2GN.111, M1)_ — filed 2026-08-11
      alongside 2GN.102 (doc 12 §2.38). **2GN.111 edge added 2026-08-11:** this task authors real
      per-technique weights against `formability`, and difficulty is a property of the material _as
      worked_ — if the per-state ruling lands, the axis should read the working-state value and
      these weights would be authored against the wrong number, then re-measured. Must first revisit
      the rung-5 casting/forging conflation that entry records: `formability`'s rung 5 deliberately
      groups cast metals with hot-forged iron as one plastic-working-regime rung, inert while
      `relief`'s gate is a `>= 3` threshold but load-bearing the moment this task reads the rungs as
      a difficulty gradient. Note the `1`–`6` range differs from the other five difficulty axes'
      `1`–`7`, so `AXIS_NORMALISATION`'s `mid`/`half` need their own values
- [ ] **2GN.107** — `data/decorations.ts` — sweep every `kind: 'material'` substrate test for
      exclusions that are artefacts of a proxy axis rather than attested practice, the way
      `relief`'s leather exclusion was — filed 2026-08-11 during 2GN.102 (doc 12 §2.38). `overlay`
      uses the identical `rigidity >= 3` test `relief` used to carry; if `formability` is the
      correct gate for one, `overlay` is the first candidate for the same scrutiny.
      `studs`/`gilding` already carry a named leather exception and are not suspect on the same
      grounds _(blocked: depends on 2GN.102, 2GN.111, M1)_ — **2GN.111 edge added 2026-08-11:**
      leather's worked-vs-cured state is the very example that motivated this sweep, so the audit
      would be run against a property model the per-state ruling may change. Note `gilding`'s test
      is no longer a `MaterialTag` read at all: 2GN.78 replaced it with `isGildingMaterial`
      (`formability` + `oxidisation`), which is itself a candidate for the same scrutiny once states
      are settled
- [ ] **2GN.129** — `engine/generation/decoration.ts` — extend the 2GN.127 silence rule to
      `techniqueAffinities`, and rule the substrate-gate question it exposes. Techniques have a
      derivable accessibility one hop out: `materialAccessGate` already establishes that a culture
      with no gold cannot gild and no engravable material cannot engrave, so "silence is legitimate
      iff inaccessible" transposes cleanly. ⚠️ **Blocked on a prior defect, which is this task's to
      rule**: `materialAccessGate`'s substrate check requires
      `culturalAffinityWeight(material, culture) > 1`, strictly better than neutral, so a material
      authored at exactly `1.0` fails it identically to one the culture cannot obtain. Once 2GN.128
      pushes cultures to author far more entries, a culture that explicitly states indifference to
      bronze gets bronze-substrate techniques suppressed exactly as though bronze were unobtainable
      — the ambivalent-versus-absent collapse 2GN.127 exists to eliminate, reappearing inside the
      gate meant to model access. Whether affinity should gate substrate access at all is the
      question; `hasIntroducedMaterialAccess` deliberately gates on availability alone and is the
      contrast case. ⚠️ moves technique-selection distributions, so decorative calibration guards
      need re-recording with the drift annotated. ⚠️ Measured 2026-08-14 by 2GN.128 and now live in
      the presets: xoconahtl authors `['clay', 1.0]` against `abundant` clay and it fails the gate
      (`affinity=1, isAvailable=true` → substrate access `false`). 2GN.128 deliberately kept the
      `1.0` rather than nudging it past the gate, so the evidence survives for this ruling
      _(blocked: depends on 2GN.128, 2GN.134, M1)_
  - Note: filed 2026-08-14 by the 2GN.127 ruling, which deferred the technique half rather than
    ruling it blind — see `docs/spikes/2GN.127-affinity-silence.md`'s closing section and doc 12
    §2.49. The `> 1` gate is a live defect independent of whether the silence rule extends: it
    already means an authored-neutral material cannot serve as a substrate, which no ruling ever
    established.

  - Note: **Ruled 2026-08-25 by 2GN.134** (doc 11 §2.20, doc 12 §2.56): affinity does not gate
    substrate access. This task now carries the fix: `materialAccessGate`'s substrate check becomes
    `isAvailable && culturalAffinityWeight > 0`; rewrite `decoration.test.ts`'s "material gate — no
    plausible engravable material" fixture to an absent geology (today it fixtures
    `materialAffinities: []` against a geology that has engravable material); and re-justify
    `calibration.test.ts`'s R43 regional-spread floor, which narrows 4.0pp → 2.7pp against 3pp. No
    other pin left tolerance in the measurement.
- [x] **2GN.131** — design spike — what does the decorative recursion depth cap actually compute
      from `craftSpecialisation` and `aesthetics.decorativeEmphasis`? — 2GN.32's own title names
      both inputs, but no integer mapping, scale, or per-depth decay exists anywhere. Doc 05 §8.3's
      four-corner table ('0–1 layers' / 'up to 3 layers deep') was measured and ruled unbuildable as
      a single volume scalar by doc 11 §2.10 (roadmap 2GN.98), which deliberately split the table
      into `decorationVolume` (reads `decorativeEmphasis` alone) and `DecorativeLayer.grade` (reads
      `craftSpecialisation` alone) — leaving recursion depth itself unresolved; doc 12 §2.24 records
      'defer to 2GN.31' as one of the rejected candidate answers, confirming depth was consciously
      left open rather than decided in advance. Nearest in-codebase precedent: `grammar.ts`'s
      attachment recursion (`MAX_ATTACHMENT_DEPTH = 3`, `ATTACHMENT_PROBABILITY = 0.4`,
      `ATTACHMENT_DEPTH_DECAY = 0.5`, gated via `prng() < probability * decay ** depth`) — the same
      shape, but with fixed constants rather than values derived from two phase attributes. Doc 05
      §8.3's 'up to 3 layers deep' corner is the only numeric ceiling anchor in the docs. Also stale
      and worth correcting alongside this ruling: `types/world.ts` lines 42–44 still say craft alone
      drives the recursion cap, predating §2.10's split of volume from grade. Surfaced 2026-08-19
      during an attempt to implement 2GN.31/2GN.32 (see BLOCKED.md at the repo root for the full
      research trail)
  - Note: **Ruled 2026-08-25 — see `docs/spikes/2GN.131-recursion-depth-cap.md`, doc 11 §2.22 and
    doc 12 §2.58. Emphasis drives the per-depth chance of a sublayer
    (`BASE × decorationVolume(phase) × DECAY^(d−1)`); craft drives the ceiling
    (`1 + round(craft × (MAX − 1))`, `MAX_SUBLAYER_DEPTH = 3`).** Doc 05 §8.3's middle corners force
    the assignment; a craft×emphasis product gives both 0.09 and collapses them. Simulated over real
    `expandDecoration` output at five cells, 500 seeds each: reproduces all four corners in kind.
    Constants provisional; 85% of high/high artefacts hit depth 3 at BASE 0.5, so 2GN.32 calibrates.
    `types/world.ts` JSDoc corrected. `BLOCKED.md` does not exist.
- [x] **2GN.132** — design spike — does sublayer generation live inside `expandDecoration`'s
      existing slot loop, or as a separate unwired post-pass? — folding sublayer draws into
      `expandDecoration`'s existing slot loop changes its deterministic draw sequence for every
      artefact, moving `EXPECTED_FIRE_RATES`/`EXPECTED_THRESHOLDS`/`EXPECTED_MEAN_GRADE_BY_REGION`
      in `calibration.test.ts`, the p75 pin in `statistics.regression.test.ts`, and breaking
      `classification.test.ts`'s explicit `maxDepth === 1` regression guard (the '2GN.31 regression
      guard' test) — all three carry the 'when this fails, it is usually right, widening the band is
      usually wrong' warning, so re-recording them correctly requires deliberately re-measuring the
      new distribution, not just making the assertion pass. The alternative, a separate post-pass,
      matches the precedent `enforceSubstrates` (2GN.30) and the material-sensitivity extension
      (2GN.99) already set: both shipped unwired specifically to avoid perturbing the draw sequence
      and moving any calibration pin. `assignDecorativeDetails`/`gradeDecorativeLayers` are already
      written recursion-ready in this shape, waiting for something to populate `sublayers`. Neither
      option is free: the first is real integration at calibration-breaking cost; the second is safe
      to ship but leaves `expandDecoration` itself flat, and nothing currently calls
      `assignDecorativeDetails` in production (2GN.84's note) — a discouraging precedent for 'ship
      it unwired and something will call it later'. Surfaced 2026-08-19 during an attempt to
      implement 2GN.31/2GN.32 (see BLOCKED.md at the repo root for the full research trail)
  - Note: **Ruled 2026-08-25 — see `docs/spikes/2GN.132-sublayer-placement.md`, doc 11 §2.21 and doc
    12 §2.57. Separate pass, own `${seed}-sublayers` stream, after `assignMaterials` and
    `assignDecorativeDetails`, wired into the calibration harness and Explorer in the same PR as
    2GN.31.** Deciding fact: a sublayer's substrate is its parent layer's material, which the slot
    loop cannot know (2GN.99's ordering). The determinism cost predicted below was measured and did
    not occur: one extra draw per layer changed 1114/1200 seeds' output and moved no calibration
    pin. `BLOCKED.md` does not exist.
- [ ] **2GN.133** — `engine/generation/decoration.ts` — make `enforceSubstrates` and
      `gradeDecorativeLayers` parent-material-aware for sublayers _(blocked: depends on 2GN.31)_ —
      `satisfiesSubstrate` (`enforceSubstrates`) and `regrade` (`gradeDecorativeLayers`) both read
      `componentMaterial.get(layer.targetComponentId)` at every recursion depth, so a sublayer's
      substrate/grade check tests against the parent component's assigned material rather than the
      parent layer's own introduced material — silver inlay chased on top of a bronze panel would
      have its chasing tested against bronze, never silver. Neither 2GN.31 nor 2GN.32's description
      names this; it only becomes checkable once sublayers exist for real. Filed separately from
      2GN.31 rather than absorbed into its scope, per the project's convention of naming a surfaced
      model gap rather than working around it silently. Surfaced 2026-08-19 during an attempt to
      implement 2GN.31/2GN.32 (see BLOCKED.md at the repo root for the full research trail)
- [x] **2GN.134** — design spike — should cultural affinity gate substrate access at all?
      `materialAccessGate` (`engine/generation/decoration.ts`) requires
      `culturalAffinityWeight(material, culture) > 1`, strictly better than neutral, so a material
      authored at exactly `1.0` — explicit indifference under the 2GN.127 ruling — fails the gate
      identically to one the culture cannot obtain: the ambivalent-versus-absent collapse 2GN.127
      eliminated, reappearing inside the gate meant to model access. `hasIntroducedMaterialAccess`
      deliberately gates on availability alone and is the contrast case. Evidence is live in the
      presets: xoconahtl authors `['clay', 1.0]` against `abundant` clay and fails the gate
      (`affinity=1, isAvailable=true` → substrate access `false`); 2GN.128 deliberately kept the
      `1.0` so the evidence survives for this ruling. Rules the gate question so 2GN.129 can extend
      the silence rule without inheriting the defect. ⚠️ any change moves technique-selection
      distributions, so the recalibration cost must be measured before a mechanism is chosen
  - Note: Filed 2026-08-20 from the M2 dependency audit: 2GN.129 was written as implementation but
    its own text names this as "this task's to rule", and its dependency 2GN.128 only implements the
    `materialAffinities` half — the spike (2GN.127) scoped itself to materials and deferred the
    substrate-gate question by name. Splitting the ruling out leaves 2GN.129 as pure implementation.
  - Note: **Ruled 2026-08-25 — see `docs/spikes/2GN.134-affinity-substrate-gate.md`, doc 11 §2.20
    and doc 12 §2.56. No: the substrate gate reads availability only**
    (`isAvailable && culturalAffinityWeight > 0`), matching `hasIntroducedMaterialAccess`. Measured
    over 252 (culture, world, technique) pairs: 28 gated today, every one over a material the
    culture has; `>= 1` would rescue 11, availability-only all 28 (tarpan clay 0.7 and khaltiris
    clay 0.8 are the tell: a mild dislike suppressing glaze to 0.05×). Affinity's effect is already
    realised upstream at `assignMaterials`. Cost measured with the gate live then reverted: 758/760,
    no `EXPECTED_*` pin leaves tolerance; one `decoration.test.ts` fixture tests the affinity gate
    under an availability name, and R43's spread floor narrows 4.0pp → 2.7pp (floor 3pp).
    Implementation folded into 2GN.129 per Jason.
- [ ] **2GN.147** — `data/decorations.ts` + `engine/generation/decoration.ts` — widen
      `wire-wrapping`'s introduced-material tag set (currently `['metal']` alone) and audit
      `isGildingMaterial`'s realised gold/silver-only pool, so at least one technique-appropriate
      non-prized candidate exists per culture for both techniques _(blocked: depends on 2GN.150,
      M1)_
  - Note: Filed 2026-09-17 from the 2GN.68 spike (doc 12 §2.61). `gilding` and `wire-wrapping` are
    both 100%-prized under every measured Explorer preset — every candidate in each pool clears
    `STANDING_CUT` — so 2GN.68's stratum draw (`assignDecorativeDetails`, shared with
    `assignMaterials`) has nothing non-prized to redirect selection weight toward on these two
    techniques specifically. Measured: forcing every artefact commoner and tallying which technique
    supplied a prized layer, `gilding`/`wire-wrapping` alone account for 79–97% of remaining
    commoner-artefact hits in thalassar/xoconahtl, while every other technique's suppression already
    works (0.3–0.8% commoner hit rate). `gilding`'s pool is gated by `isGildingMaterial`
    (`craftDomain === 'metallurgy' && formability >= 5 && oxidisation <= 3`, roadmap 2GN.78) rather
    than a tag, so widening it means either loosening that physical gate or accepting the pool
    genuinely has no non-metal analogue; `wire-wrapping`'s `['metal']` tag set may admit a second
    material class (fibre-wrapped wire is real) without weakening the technique's own logic.
    Data-authoring work, not a design question — no spike needed. ⚠️ calibration-shifting once
    landed: re-measure R32 (`precious-materials-in-decoration`) against the four Explorer presets
    and record the new rate in `docs/spikes/2GN.68-decoration-material-standing.md`'s reopen
    conditions.
- [x] **2GN.150** — Explorer: extend the decoration inspector (2GN.61) with motif, motif origin and
      introduced material; refresh the prerequisite display and header now 2GN.30 enforces
- [ ] **2GN.157** — Explorer: decoration inspector (2GN.61) evaluates form prerequisites _(blocked —
      depends on 2GN.61, 2GN.104)_
- [ ] **2GN.158** — Explorer: decoration inspector (2GN.61) shows motif salience across the
      culture's lifespan _(blocked — depends on 2GN.61, 2GN.76)_
- [ ] **2GN.169** — design spike — should the elite stratum also drive decorative volume, complexity
      and depth (labour investment), rather than materials alone? May reopen 2GN.98 and 2GN.131;
      blocks 2GN.32 and 2GN.96 _(blocked: depends on 2GN.164, M1)_

---

## Milestone 6: Features & Classification

**Goal:** One unified feature set per artefact scored into occluded ground-truth tags against
culture-relative baselines

- [x] **2GN.17** — `src/lib/data/classification.ts` — classification rules: feature→tag scoring,
      structural/container/decorative/cross-layer contributions — rules were derived from first
      principles against the signals `data/grammars/primitives.ts` actually rolls, not transcribed
      from doc 05 §9.2's illustrative examples (interviewed rule-by-rule with the user; doc 12 §2.19
      records the session), since the engine's primitive/parameter vocabulary has grown past what
      that section shows; 39 rules across edge/point/edge-count, opening-graded container,
      vessel-refinement (wall/curvature/base), perforation, ring/fastener, sheet, mass, size,
      structural-complexity, decoration (real-signal + two dormant rules awaiting 2GN.33
      motif/material assignment), cross-layer, and structural-presence-flag families, each keyed on
      a real primitive parameter or decorative-layer fact (PR #37 review added five: a short-edge
      scraper rule closing an edge-family coverage gap, an off-centre perforation rule, and
      fastening-mechanism/impact-surface/wearable rules consuming previously-unread presence flags;
      doc 12 §2.19 records them) — `CLASSIFICATION_RULES: readonly ClassificationRule[]` mirrors the
      `plausibility.ts` authoring convention (module JSDoc, banner-grouped, per-rule rationale
      comment); surfaced that `ExtractedFeatures` (1FD.11) was too coarse to carry the rule set, so
      it gained 13 fields (⚠️ breaking — new required fields) — `pointSharpness`, `bladeLengthBand`,
      `bladeProfile`, `perforation`, `wallThickness`, `ringGap`, `sheetFlexibility`, `massBand`,
      `sizeBand`, `curvature`, `openingType`, `baseType`, `appliedElementPresent` — each traceable
      to a real grammar signal (`types/artefact.ts`; `tests/fixtures/artefact.ts`'s
      `mockExtractedFeatures` updated to match); established and audited a
      **mechanical-vs-classificatory boundary** (doc 12 §2.19): `portability`/`inspectionDepth` are
      mechanical (doc 05 §5.2 handling/inspection) and must never be read by a classification rule —
      `massBand`/`sizeBand` are the physical-fact equivalents; zero pre-existing violations found;
      enforced going forward by a dedicated boundary-guard test in `classification.test.ts`;
      `bladeProfile`'s cut-vs-thrust sword-typology axis is captured but its tag-score
      differentiation is deliberately deferred to description work (2GN.40); covered by 58 new Deno
      tests in `classification.test.ts` — structural invariants (non-empty tag maps, real-tag
      cross-reference via compiler-checked `Record<FunctionTag,true>`/`Record<ContextTag,true>`,
      weight bounds, no-throw), the boundary guard, purity, one fire/no-fire block per rule pinned
      by index, an exhaustive edge-family sweep (every edged feature set fires at least one edge
      rule) and a perforation-family sweep (each non-none band fires exactly one rule), and a
      worked-example integration test (an engraved long bronze blade fires
      weapon/ritual/ceremonial/elite simultaneously, per doc 05 §9.2's closing claim) _(depended on
      1FD.12, 2GN.12 — both done)_ _(depends on 2GN.12)_
- [x] **2GN.19** — `engine/generation/classification.ts` —
      `extractFeatures(artefact, decorativeLayers = []): ExtractedFeatures` — unified feature
      extraction from components, now covering the full geometry-derived `ExtractedFeatures`
      contract 2GN.17 authored rules against (structural fields plus `pointSharpness`,
      `bladeLengthBand`, `bladeProfile`, `perforation`, `wallThickness`, `ringGap`,
      `sheetFlexibility`, `massBand`, `sizeBand`, `curvature`, `openingType`, `baseType`,
      `appliedElementPresent`; 2GN.27 and 2GN.68 still complete the doc 05 stage-8 contract with
      material and decorative-motif fields) — landed as
      `extractFeatures(artefact, decorativeLayers = []): ExtractedFeatures`, pure and PRNG-free;
      materials are deliberately not a parameter (material-derived fields are 2GN.27's); per-family
      collapse policies keep multi-component artefacts coherent (doc 12 §2.20):
      `bladeLengthBand`/`bladeProfile` read one dominant edged component (longest blade, earliest
      position on ties), all container facts
      (`openingType`/`containerOpenness`/`wallThickness`/`baseType`) read one dominant container
      (largest `hollow-enclosed`, else longest `cylindrical`), perforation follows the pinned
      `central` > `off-centre` > `single` > `multiple` priority, ring/sheet/curvature report the
      most classificatorily-loaded value present; the three presence flags with no 1:1 grammar
      signal were interviewed item-by-item (doc 12 §2.20): `hasImpactSurface` = untapered `bar-form`
      or thick `disc-form`, `hasFasteningMechanism` = pin-on-hoop anatomy (a `ring-form` joined to a
      sharp edgeless `elongated`) or hinged join, `isWearable` = `ring-form` or suspension
      perforation, the latter two body-scale gated (`sizeBand` not `large`, `massBand` at most
      `light`); band thresholds sit at the midpoints of 2GN.8's provisional cm tables; unrecognised
      parameter values degrade to first-listed BNF values; dormant fields keep honest no-producer
      defaults (`motifPresent` reads `motifRef` and fires once 2GN.33 lands;
      `motifCulturalOrigins`/`preciousMaterialsInDecoration` are 2GN.68's); covered by 34 Deno tests
      in the sibling `classification.test.ts` (purity, per-family collapse, interviewed flags and
      gates, graceful degradation) _(depended on 2GN.12 — done; rescoped 2026-07-22 per doc 12
      §2.19)_
- [x] **2GN.20** — `engine/generation/classification.ts` —
      `classifyArtefact(features, rules): Map<FunctionTag|ContextTag, number>` — rule-based scoring
      — landed as a pure, PRNG-free fold over the 2GN.17 rule set, contract interviewed
      decision-by-decision (doc 12 §2.21 records the session): **plain-sum accumulation**, unbounded
      — scores are evidence tallies, not confidences; chosen over clamping (which would silently
      swallow 2GN.27/34's future material and decoration boosts on saturated tags, and flatten the
      clear end of doc 05 §11's ambiguity distribution) and probabilistic OR (which breaks 2GN.59's
      additive per-contribution breakdown and can flip dominant-tag ranks against the additive
      intuition the 2GN.17 weights were interviewed under); consumers compare relatively (rank,
      margin), since raw sums inflate as the rule set grows, and normalise at point of use where a
      bounded number is needed; **sparse map in canonical order** — only scored tags appear (absence
      provably means zero evidence: rule weights are pinned > 0 by the 2GN.17 suite), read via
      `tags.get(tag) ?? 0`, entries sorted function-tags-then-context-tags in vocabulary declaration
      order so serialisation (`save.ts`) never churns when the rule array reorders,
      forward-compatible with vocabulary growth; canonical ordering forced a vocabulary runtime —
      `FUNCTION_TAGS`/`CONTEXT_TAGS` landed in `types/tags.ts` as `as const` arrays with the union
      types derived from them (single source of truth, value-identical unions; `MaterialTag`
      deliberately left in declaration style, nothing needs it at runtime); **rules always
      explicit** — no default parameter, the engine module never imports rule data, the pipeline
      passes `CLASSIFICATION_RULES`; a throwing `condition` propagates, since rules are internal
      authored data with their own no-throw suite and guarding would hide a data bug; covered by 9
      new Deno tests in the sibling `classification.test.ts` — accumulation arithmetic on
      exact-binary-fraction fixture rules (no float tolerance), unbounded sums, sparsity and the
      absence convention, all-21-tag canonical ordering, rule-reorder invariance, purity, and a
      real-rules integration test scoring doc 05 §9.2's engraved long blade positive on
      weapon/ritual/ceremonial/elite in canonical order _(depended on 2GN.17, 2GN.19 — both done)_
- [x] **2GN.27** — `engine/generation/materials.ts` + `engine/generation/classification.ts` —
      material influence on tag accumulation: materials **the producing culture treats as precious**
      boost elite/ceremonial, derived from the material's situation rather than a catalogue fact —
      _(the planning text from here to the delivery note is superseded where it names fields: the
      shipped contract is `MaterialAssignment.standing`, read into
      `ExtractedFeatures.materialStanding` by `extractFeatures(artefact, layers, assignments)`; see
      the Done note below)_ — ⚠️ **breaking**: `ExtractedFeatures` carries zero component-material
      fields today (its one material-adjacent field, `preciousMaterialsInDecoration`, is about
      decorative-layer materials and belongs to 2GN.68); this task adds new `ExtractedFeatures`
      fields (materialId/precious-material signal, in the style of 2GN.17's 13-field addition), a
      new `materials`/`assignments` parameter on `extractFeatures`, and fixture updates
      (`neutralExtractedFeatures`/`mockExtractedFeatures`), on top of the rules themselves —
      dependency sweep 2026-07-25 corrected the 2GN.23 edge to 2GN.75 (assignments, not just the
      single-component `assignMaterial`) and flagged the breaking scope the original line hid;
      2GN.78 edge added 2026-08-04 (CodeRabbit review, PR #49) — 2GN.78 retires
      `precious-metal`/`precious-stone` as classification inputs entirely, so this task's rule must
      derive standing from material situation (availability × affinity × provenance ×
      stratification) rather than a static precious-tag lookup, and needs 2GN.78 sequenced first to
      avoid restoring the reading 2GN.77 ruled against. **2GN.78 landed 2026-08-11 and went further
      than this line anticipated:** the tags are gone from `MaterialTag` entirely, so there is no
      precious-tag lookup left to restore even accidentally, and the "precious metals →
      elite/ceremonial" framing in this task's own title must be re-read as _materials this culture
      treats as precious_. The situation formula's four terms come from three places:
      `explainMaterialWeight` (2GN.74) returns `level`, `culturalAffinity` and `tradeRescued`
      (availability and cultural affinity); provenance comes separately from
      `MaterialAssignment.provenance` via `deriveMaterialProvenance`; stratification from
      `PhaseCharacteristics.society.stratification`, unread today. **Blocked on 2GN.110
      (2026-08-11):** whether `materialAffinities` can carry a per-material judgement determines how
      precisely "this culture values this material" can be read, which is this task's core input.
      **Blocked on 2GN.142 (2026-08-21):** scoping this task while implementing 2GN.15 found doc 11
      §2.9's material-baseline region-keying was never built —
      `ClassificationContext`/`baselines.ts` carry no region dimension, so the relative-tag
      threshold this task needs (ruled by Jason: percentile the weight, not a fixed constant) can't
      be computed correctly until that gap closes. Provenance dropped from this task's own formula
      per the same ruling session — see 2GN.143
  - Note: **Amended 2026-08-25 by 2GN.143** (doc 11 §2.9 restated, doc 12 §2.55): standing =
    f(availability⁻¹, cultural affinity, stratification). Provenance is implicit in `level` (a total
    coarsening, measured). Compose from `explainMaterialWeight`'s returned components with
    availability inverted; never use its `weight`, a selection quantity pointing the other way.
  - Note: **Done 2026-09-15** (doc 11 §2.9 amended twice, doc 12 §2.59,
    `docs/spikes/2GN.27-material-standing.md`). Ran as a spike first: the three-term formula and the
    earlier percentile ruling could not both hold (a percentile erases a per-phase constant), and
    asking what stratification models resolved it. Shipped: `materialStanding()` = availability⁻¹ ×
    affinity with `trade-only` tempered by `economy.tradeOpenness`; `STANDING_CUT = 3`, a fixed cut
    rather than a percentile; a per-artefact **stratum draw** in `assignMaterials`
    (`P(elite) = 0.4
    × stratification`, prized candidates ×3 elite / ×0.05 commoner), which is
    where stratification enters the pipeline; `MaterialAssignment.standing`;
    `extractFeatures(artefact, layers,
    assignments)` with `materialStanding` = max over
    structural components; rule `material-standing-prized` (`elite` 0.4, `ceremonial` 0.3). Realised
    rate 12% (tarpan) to 35% (khaltiris). Material calibration pins re-recorded; R1–R38
    bit-identical. Prizing a material now concentrates it, so the resolver guard draws unmodulated.
    Filed 2GN.146 for the selection-side trade-openness lerp.
- [x] **2GN.79** — `tests/fixtures/world.ts` + `src/lib/data/classification.ts` +
      `src/lib/types/artefact.ts` — geological fixture correction and whole-rule-set
      tag-contribution rebalance — `mockGeologicalContext` models only 4 of 16 catalogue materials
      (bronze/iron/gold/flint), so the other twelve fell through `isAvailable`'s "unmodelled →
      obtainable" lenience at full weight: 1200 sampled artefacts put silver second most common at
      10.3% of components and jade at 6.6% against genuinely-scarce gold's 1.4%, with 53.4% of
      artefacts carrying a "precious" component. Landed (interviewed decision-by-decision per the
      classification-branch oversight preference; doc 12 §2.25 records the session) as **six named
      regional worlds** rather than the single `mockFullGeologicalContext` originally scoped —
      `riverValley`, `highlandMine`, `coastalPort`, `forestInterior`, `desertMargin`,
      `steppeMargin`, each modelling all 16 materials explicitly with its own `MaterialFlow[]`, so a
      threshold tuned against one geology is exposed by another. Between them they cover every
      `AvailabilityLevel` and both exclusion paths (`absent` in `desertMargin`;
      trade-only-with-no-matching-flow in `forestInterior`, which carries an empty flow array).
      `mockGeologicalContext` is deliberately untouched — it is now the fixture covering the
      unmodelled-lenience path the six full worlds no longer reach. `sampleWorld()` takes a region
      argument (default `coastalPort` at the time — superseded by 2GN.88, which dropped the default
      entirely) and all five samplers gained `--world`, a scope expansion agreed at interview beyond
      the task's original two files. **The fixture fix corrected materials but not `elite`, which
      was the substantive finding**: re-measuring 7200 artefacts across the six worlds moved
      precious-bearing artefacts 55.3% → 27.1%, silver 11.1% → 3.9%, jade 6.6% → 1.4% and put gold
      above jade, yet `elite` was unmoved (89.8% presence, 35.4% leader) and near-identical in all
      six worlds (89.2–90.8%) — proving it was never material-driven. The applied-element rule's
      84.6% firing turned out **structural, not a mistuned threshold**: `expandDecoration` gives
      each BNF category its own per-component slot rolls (0.45 base chance at the fixture phase), so
      a ~4.15-component artefact reaches ~87% by arithmetic alone and no weight on a boolean fixes
      it. **Two rules retuned**, both for intent-behaviour divergence (the agreed criterion — a rule
      firing often because its structure is genuinely common is honest and was left alone): R31 now
      reads a new `ExtractedFeatures.appliedElementCount` at its measured p75 (`>= 4`, firing 25.2%,
      within a point of retuned R30's 25.3%) instead of the saturating boolean, an extraction-side
      change agreed at interview so this task was not data-only; R29 raised to
      `attachmentDiversity >= 3` (44.4% → 22.3%) with its `partCount >= 3` clause **dropped as
      inert** (identical fire rate with it, without it, and with it raised to `>= 4`). R32's 98%
      firing was investigated and deliberately left — it does not diverge from its stated intent,
      doc 12 §2.24 had already ruled the same way, and `ornament`'s leadership fell 27.0% → 18.8% on
      the R31 fix alone; this task's original entry blaming it is corrected in doc 12 §2.25. Result:
      `elite` leadership 35.4% → 27.4%, top four tags now within 12 points rather than 25.
      **Durability tested**: robust to catalogue growth (identical at 2×, 4× and 10× the
      applied-element technique pool — slot count sets the quantity, pool size only picks which
      technique fills a slot) and to geology (22–26% across the six worlds), but **not** to phase
      attributes (R31 fires 4.3% at `decorativeEmphasis` 0.1 and 48.1% at 1.0; 2.3% at
      `craftSpecialisation` 0.1 and 74.5% at 1.0) — which affects every measured threshold including
      §2.24's seven, and spawned spike 2GN.80 plus recalibration tasks 2GN.82–85. Also spawned
      2GN.81 (Rule Calibration panel) and fixed five pre-existing broken
      `assignMaterial`/`expandDecoration` call sites in the samplers (argument order; `deno check`
      was failing on `scripts/dev/` and two samplers threw at runtime). New coverage:
      `tests/fixtures/world.test.ts` (11 tests) and `src/lib/data/calibration.test.ts` (fire-rate
      regression guard over all 43 rules — the gap that let R31 sit at 85% since 2GN.34), plus
      extraction and rule tests for the new field
- [x] **2GN.34** — `src/lib/data/classification.ts` — rescoped by dependency sweep 2026-07-25:
      `extractFeatures` (2GN.19) already computes `decorativeComplexity`/`techniqueComplexity` from
      real signal (`tally.layerCount`, `tally.techniques.size`, `motifDensity`, `tally.maxDepth` via
      `tallyLayers`' existing sublayer recursion) — the extraction side needs no further work here.
      The remaining task is authoring classification rules in `data/classification.ts` that read
      those already-populated fields (a data task, not an engine one, hence the corrected file
      path); `maxDepth` stays pinned at 1 until 2GN.31 lands sublayers, so depth-sensitive rules
      should note that. ⚠️ per the classification-branch oversight preference, this rule set needs
      decision-by-decision sign-off, same as 2GN.17/2GN.20 (doc 12 §2.19/§2.21) — landed as **four
      new rules plus a retune of three pre-existing decoration rules** (doc 12 §2.24 records the
      session): investigating first surfaced that 2GN.29/2GN.33 had landed since the original
      decoration-family rules were authored at 2GN.17 against no real pipeline, and measuring 1200
      real pipeline artefacts showed those rules fired on 87–99% of output — under
      `classifyArtefact` (2GN.20)'s plain-sum unbounded fold, a near-constant contribution to every
      score rather than a discriminating one. Retuned `decorativeLayerCount >= 3`/`>= 2`/`>= 2`
      (heavy-decoration and both cross-layer archetype rules) to the measured p75/p50 of their
      respective conditional distributions (`>= 10`, `>= 6`, `>= 6`; fire rates now
      25.3%/64.5%/60.7% of their populations, down from 86.8–96.9%); the any-decoration `>= 1` nudge
      left alone as an intentionally universal cheap signal. New rules: two raw
      `decorativeComplexity` tiers (`>= 16` p75, `>= 25` ~p93, deliberately cumulative,
      elite/ceremonial/ritual) for absolute investment; one proportional rule
      (`decorativeComplexity / partCount >= 4`, measured p75 of the ratio) for investment
      disproportionate to part count — needs no new `ExtractedFeatures` field since `partCount`
      already exists, keeping this a data-only change; one `techniqueComplexity >= 8` rule (measured
      p90) tagged `artisanal` primarily rather than compounding `elite`, carrying the 2GN.31 forward
      hazard (see that task's note) since `maxDepth` pinned at 1 makes the field currently a strict
      summand of `decorativeComplexity`. Doc 05 §9.2's engraved-blade worked example, carried by one
      of the retuned archetype rules and pinned by integration tests in both
      `data/classification.test.ts` and `engine/generation/classification.test.ts`, updated from a
      3-layer to a 6-layer example blade and strengthened to assert the contributing rule index, not
      just the fired tags; `maximalFeatures()` in the data-layer test file raised to realistic
      complexity values so the invariant/purity/boundary-guard sweeps actually exercise the new
      rules (it previously sat below every new threshold); two stale dormant-rule comments fixed in
      passing (`motifPresent` has been live since 2GN.33 landed, only `motifCulturalOrigins` and
      `preciousMaterialsInDecoration` remain 2GN.68's). Covered by 9 new Deno tests in
      `data/classification.test.ts` (index pins, fire/no-fire boundaries, R40's zero-partCount
      guard, monotonicity, cumulativity, zero-decoration silence) plus 1 in
      `engine/generation/classification.test.ts` (the 2GN.31 regression guard) _(depended on 2GN.19,
      2GN.20 — both done)_
- [x] **2GN.68** — `engine/generation/classification.ts` — update: decorative motif and
      introduced-material features contribute to unified tag accumulation (`motifCulturalOrigins`
      from `DecorativeLayer.motifRef`→culture lookup; `preciousMaterialsInDecoration` from the layer
      material's **situation in the producing culture**) — ⚠️ **rescoped 2026-08-11 by 2GN.78** (doc
      11 §2.9, doc 12 §2.40): this line previously read "`preciousMaterialsInDecoration` from
      `DecorativeLayer.material`→precious-material lookup", which is exactly the static catalogue
      read 2GN.77 ruled against and which no longer has anything to look up — `MaterialTag`'s
      `precious-metal`/`precious-stone` members are retired. Populate the field from the material's
      situation instead. Doc 11 §2.9's formula has four terms sourced from three places:
      `explainMaterialWeight` (2GN.74) returns `level`, `culturalAffinity` and `tradeRescued` for a
      material/culture pair, covering availability and cultural affinity; provenance comes
      separately from `MaterialAssignment.provenance` via `deriveMaterialProvenance`, since
      `tradeRescued` is a reachability boolean and not a provenance substitute; and stratification
      from `PhaseCharacteristics.society.stratification`, which §2.9 makes a live input and nothing
      reads yet. The threshold over them is this task's to rule and has not been set. Blocked on
      **2GN.110** because the affinity term's keyspace (per-tag only, or per-material too) changes
      what "this culture prizes it" can even mean. **Note from 2GN.84 (doc 12 §2.34, 2026-08-06):**
      confirmed `assignDecorativeDetails` (`engine/generation/decoration.ts`) has no production
      caller anywhere in `src/` — only its own tests reach it. This task needs that wired into the
      pipeline before `DecorativeLayer.material` is ever populated outside tests, which is the
      direct upstream reason `preciousMaterialsInDecoration` is hardcoded `false`. **Blocked on
      2GN.142 (2026-08-21):** this task shares 2GN.27's exact four-term formula and the same
      region-keyed-baseline gap; see that task's note
  - Note: **Amended 2026-08-25 by 2GN.143** (doc 11 §2.9 restated, doc 12 §2.55): standing =
    f(availability⁻¹, cultural affinity, stratification). Provenance is implicit in `level` (a total
    coarsening, measured). Compose from `explainMaterialWeight`'s returned components with
    availability inverted; never use its `weight`, a selection quantity pointing the other way.
  - Note: **Amended 2026-09-15 by 2GN.27** (doc 11 §2.9, doc 12 §2.59):
    `preciousMaterialsInDecoration` will be populated (this task's job; `extractFeatures` still
    hardcodes it `false`) by calling `materialStanding(material, culture, phase, geology)` on each
    layer's material and comparing against `STANDING_CUT`, the same read
    `ExtractedFeatures.materialStanding` uses for structural components; stratification is not an
    input to the number (it entered at stage 6 as the stratum draw) and the threshold is fixed, not
    percentiled. The four-term formula and the sampled-distribution threshold in the notes above are
    superseded.
  - Note: **Done 2026-09-17** (doc 11 §2.9 amended a third time, doc 12 §2.61,
    `docs/spikes/2GN.68-decoration-material-standing.md`). Ran as a spike: the material half
    reproduced 2GN.27's own Finding 1 from the decoration side (unmodulated rate 72–95% across the
    four Explorer presets), and four per-layer mechanisms (fixed threshold, percentile, stratum
    weight nudge alone, four pool-relative readings) were measured and rejected before landing on
    2GN.27's actual mechanism — an artefact-level stratum, shared between `assignMaterials` and
    `assignDecorativeDetails` via a new optional `stratum` parameter on both, drawn once per
    artefact as the first value of the `${seed}-materials` stream (preserving every existing draw
    sequence bit-for-bit). Also wired `assignDecorativeDetails` into all six production pipeline
    chains, which had no caller anywhere in `src/` until this task. Shipped: `stratumFactor()`
    exported from `materials.ts` for reuse; `extractFeatures` widened with optional
    `culture`/`phase`/`geology`/`materialCatalogue` (honest no-evidence defaults, never a fabricated
    neutral); `motifCulturalOrigins` resolves via a `Set` against the producing culture's own
    vocabulary. Realised rate: R32 56.5%, R33 25.8% (fixture worlds, n=1800) — R32 above the
    Explorer preset range (23.0–87.3%) for the same reason R44 sits above its own range. A residual
    over-fire (79–97% of remaining commoner-artefact hits) traces to `gilding`/`wire-wrapping`'s
    100%-prized candidate pools and is filed as 2GN.147 rather than fixed here. R1–R31/R34–R43
    measured bit-identical.
- [x] **2GN.59** — Explorer: tag inspector — tag map as scored bar chart, per-component contribution
      breakdown — shipped as a **per-rule** breakdown, not per-component: `extractFeatures`
      collapses the artefact into flat scalars carrying no component references (doc 12 §2.20) and
      every `ClassificationRule.condition` is a whole-artefact predicate, so a tag score traces to a
      rule and never to a component; the decomposition re-runs each condition against the same
      features, exact because the fold is a plain sum (doc 12 §2.21 chose plain-sum precisely to
      keep it honest); bars normalise to the artefact's own strongest tag since scores are unbounded
      evidence tallies; the sparse-map contract's obligations are surfaced (empty-map "honest
      silence" state, explicit no-evidence list); per-component provenance split out to
      2GN.72/2GN.73 _(depended on 2GN.20 — done)_
- [ ] **2GN.72** — `engine/generation/classification.ts` — per-component feature provenance: record
      which component each collapsed `ExtractedFeatures` field was derived from (doc 12 §2.20 defers
      this explicitly — the collapse policies are documented but carry no references), so a feature
      can be traced to its source without re-implementing the dominance rules outside the engine.
      Prerequisite for attributing classification evidence to components rather than only to rules
      _(blocked: depends on 2GN.19, 2GN.97, M1)_
- [ ] **2GN.73** — Explorer: extend the tag inspector (2GN.59) with per-component feature provenance
      once 2GN.72 lands — show which component supplied each feature a fired rule reads. Note this
      is feature provenance, not tag attribution: a tag score sums whole-artefact rule predicates
      and never belongs to one component _(blocked — depends on 2GN.72, 2GN.59)_
- [x] **2GN.80** — design spike — are status tags absolute across the world, or relative to the
      producing culture's norms? — **ruled 2026-08-04, jointly with 2GN.77** (doc 11 §2.9 holds the
      decision, doc 12 §2.28 the rationale and measurements). Status tags are **culture-relative**;
      physical and function tags stay absolute. The boundary is cut by **the tag a rule awards, not
      the feature its condition reads** — the intuitive condition-side cut was rejected on
      inspection, because R12 (thin-walled container) and R15 (pedestal base) have purely physical
      conditions but award `ceremonial`+`elite`, and would have been left making absolute status
      claims while their eleven decoration-conditioned siblings made relative ones. Baselines are
      sampled **empirically per culture-phase** at world generation, running pipeline stages 1–7
      only — classification is the last stage and nothing upstream reads tags, so the apparent
      bootstrap circularity does not exist. Chosen over a closed-form estimate, which drifts
      silently when `expandDecoration` changes: exactly the divergence 2GN.79 spent a session
      correcting. **n=400 per culture-phase**, measured rather than inherited — doc 12 §2.27's n=100
      knee was for fire rates (a proportion), while a baseline is a percentile, whose worst-case
      relative spread runs 20–28% at n=100 against 8–17% at n=400. Percentiles are stored as
      **fractional thresholds**, because `appliedElementCount` takes only 9–16 distinct integer
      values and its nearest-rank p90 flips between adjacent integers at _any_ sample size — the
      third appearance of the family of defect behind §2.25's saturating boolean and §2.26's mass
      proxy. `PhaseCharacteristics.society.stratification` becomes a live input, gating how much
      `elite` can exist at all (without it, normalisation would flatten every culture to an
      identical elite proportion — its own falsehood). Drift is recorded against the **immediately
      preceding phase only**, magnitude and direction; the culture-wide baseline was proposed and
      dropped as incoherent, since it would score an early artefact against phases that had not yet
      happened, and would read "normal" at every phase of a culture growing steadily more lavish.
      `ClassificationRule.condition` widens to `(features, context) => boolean`, amending doc 12
      §2.20's pure-function contract — the smaller and more explicit of the two available
      violations, since pre-normalising into `ExtractedFeatures` would have broken
      `extractFeatures`' purity instead. Surfaced 3WS.21: nothing constrains phase-to-phase
      continuity today, and drift across incoherent phases measures noise _(depended on 2GN.79 —
      done)_
- [x] **2GN.81** — Explorer: rule calibration panel — per-rule fire rates and per-tag
      presence/leadership across a sampled population — requested during the 2GN.79 interview and
      delivered with it. The Tag Inspector (2GN.59) answers "why did _this artefact_ score this
      way"; this answers the population question underneath it, which no surface previously covered
      — a rule can look sensible on one artefact while firing on 85% of output, and under
      `classifyArtefact`'s plain-sum unbounded fold (doc 12 §2.21) that adds a near-constant to
      every score rather than discriminating. Landed as `/dev/explorer/calibration` with a pure
      `ruleCalibration.ts` model (16 tests) per the `tagInspector.ts` precedent: samples 100–1000
      artefacts against any Explorer culture preset and reports per-rule fire rate with a
      saturated/discriminating/rare/dormant verdict (the `rare` band was measured and dropped by
      2GN.88; three verdicts remain), plus per-tag presence, leadership, mean score and top
      contributing rule — which is what turns "elite is everywhere" into "because R31 fires on 85%".
      Samples against `EXPLORER_CULTURES`, which already model all 16 materials, so the panel was
      never affected by the fixture defect 2GN.79 corrected _(depended on 2GN.20, 2GN.59 — both
      done)_
- [x] **2GN.94** — `src/lib/engine/statistics.ts` — deterministic percentile helper
      (`percentileOf`/`percentileLadder`, R-7 interpolation) baselines are measured with — surfaced
      2026-08-05 while scoping 2GN.82: no percentile helper existed anywhere in `src/lib`, so every
      p50/p75/p90 figure in `classification.ts` was hand-transcribed and the 2GN.34/2GN.79
      recalibration was not reproducible from the tree. R-7 linear interpolation (NumPy's default),
      not nearest-rank — required, not a taste call: doc 12 §2.28 measured `appliedElementCount`
      taking only 9–16 distinct integer values, so a nearest-rank percentile flips between adjacent
      integers at any sample size. Regression-anchored against the recorded `decorativeLayerCount`
      p75 (10, roadmap 2GN.34) to catch a disagreement between the new helper and the old
      hand-transcription before anything depends on it. Prerequisite for 2GN.95
- [x] **2GN.95** — `ClassificationContext` + baseline sampler (`engine/generation/baselines.ts`) —
      widen `ClassificationRule.condition` to `(features, context)`; zero rule migrations _(depends
      on 2GN.94 — done)_ — prerequisite for 2GN.82/83/84, surfaced 2026-08-05: the 2GN.80/2GN.77
      ruling (doc 11 §2.9, doc 12 §2.28) is fully decided, but `ClassificationContext` was
      referenced in five places and defined nowhere, and `ClassificationRule.condition` was still
      single-argument. Widens the signature without migrating a single rule — TypeScript accepts a
      narrower-arity function wherever the wider signature is expected, so all 43 rules compile and
      fire identically; `EXPECTED_FIRE_RATES` in `calibration.test.ts` is bit-identical before and
      after, the checkpoint proving the slice changed no observable behaviour. Ships
      `sampleBaselines` (stages 1–7 only — `expandGrammar` → `normaliseArtefact` →
      `expandDecoration` → `extractFeatures`, no bootstrap circularity), `explorerCulturePhase`
      adapting `EXPLORER_CULTURES`, and `emptyClassificationContext` (used at every current call
      site, since no shipped rule reads a context yet — wiring real sampled baselines into the
      interactive Explorer tools now would cost real latency for zero observable effect).
      Deliberately not cached (`WorldState` doesn't exist until 3WS.9) and not wired to real culture
      generation (no generator exists until 3WS.3/3WS.4). Load-bearing test: Tarpan
      (decorativeEmphasis 0.4) vs Thalassar (0.75) must show a strictly higher decorativeComplexity
      p75 for the latter — the ruling's premise, checked empirically. Baseline caching, drift and
      `stratification` split out to 2GN.96 (M3), blocked on real `WorldState`
- [x] **2GN.82** — recalibrate the measured classification thresholds per the 2GN.80 ruling
      _(depended on 2GN.80, 2GN.95 — both done)_ — migrated nine of the eleven measured thresholds
      the task's own line names, not all 34 rules the ruling's selector catches for a baseline (doc
      12 §2.31 corrects that conflation: needing-a-baseline and
      having-a-numeric-threshold-to-recalibrate are different counts). R29 (attachmentDiversity,
      p90), R30 (decorativeLayerCount, p75), R31 (appliedElementCount, p75), R35/R36
      (hasEdge/hasContainer && decorativeLayerCount, p75), R40/R41 (decorativeComplexity, p75/p95),
      R42 (decorativePerPart, p75), R43 (techniqueComplexity, p90) all migrated to
      `ClassificationContext.exceeds`. **A ladder rung is not free arithmetic**: measured against
      the real pipeline, fire rate isn't `(1 - percentile) * 100` — coarse features carry tie-mass
      at the interpolated threshold under `exceeds`'s `>=` convention (a third face of §2.28's
      granularity defect), so R29's historical "p75" label would fire 43.4% (recreating the very
      rate 2GN.79 retuned away from) and needed p90 (21.5%) instead. Two rules' historical
      percentiles (~p93; a p90 value used as `>= 8`) had no ladder rung and were resolved by
      argument from stated intent rather than nearest number; two (R35/R36) were measured at a
      sub-population percentile `sampleBaselines` doesn't provide and moved to whole-population p75.
      Re-recorded `EXPECTED_FIRE_RATES`; the 34 unmigrated rules' rates came back bit-identical.
      Added three new calibration guards (per-cell threshold-value pins, a per-cell spread guard,
      R35/R36 sub-population pins) since a migrated rule's rate now sits near its rung almost by
      construction and would otherwise stop catching a whole-distribution generator shift. Wired
      real per-culture-phase contexts into `calibration.test.ts` (18 cells, n=400, ~0.3s), the
      Explorer's Tag Inspector (new `routes/dev/explorer/shared/baselineCache.ts`) and calibration
      panel, and fixed a pre-existing break in `scripts/dev/sample-classification.ts` that
      `deno task check`'s `svelte-check` never reaches. **The 25 categorical relative-award rules
      are out of scope** — `BaselineFeature` is a closed union of 8 numeric keys by design, so
      there's nothing to migrate them against yet. Split to 2GN.97. Full detail: doc 12 §2.31
- [x] **2GN.97** — design spike: what does the 2GN.80 ruling mean for the categorical relative-award
      rules 2GN.82 could not migrate. **Ruled 2026-08-13 — the brief's framing was rejected, not
      answered.** See `docs/spikes/2GN.97-categorical-relative-award-rules.md`, doc 11 §2.12, doc 12
      §2.44. Count corrected to **24** (the roadmap's 25 predated 2GN.87's deletion of R4).
      Measuring first found five groups, and **a baseline is the right answer for none of them**:
      (A1) ~10 rules where morphology determines the tag stand unchanged — awarding a `RelativeTag`
      does not by itself require a baseline; (A2) ambiguous morphology is not fixable by
      weight-splitting, since `classifyArtefact` accumulates additively with no suppression, so
      "ambiguous" and "weakly two things" are indistinguishable downstream; (B-walls) two rules are
      **unrelativisable** — `wallThickness` is a three-value roll with nothing continuous beneath
      it, so one culture's thick may be physically thinner than another's thin and no baseline
      recovers it (filed 2GN.120; the rules stay absolute, blocked with reason); (B-bases)
      `baseType` **is** a genuine categorical and prevalence would be meaningful, but a base is a
      _relation_ between the base and what it supports — a pedestal under a statue and one under a
      hat-stand read oppositely from an identical `baseType`; (C) mass/size take the cheap route;
      (D) `precious-materials-in-decoration` is **dormant, not unmigrated** — hardcoded `false`
      since 2GN.78, so it cannot fire. **The finding that outgrew the brief**: across all 43 rules,
      10 of the 24 condition on exactly one property, 7 more on two properties of the same
      component, and exactly one is genuinely relational; `attachments` and `position` are read by
      no rule at all. ⚠️ orthogonal to doc 11 §2.9's cut — `perforation-central-rotation` awards
      `tool`, an AbsoluteTag, and is under-conditioned identically — so 2GN.119 is scoped to all 43
      rules. Unblocked 2GN.72; also surfaced 2GN.118 while stress-testing `baseType`
- [x] **2GN.85** — propagate the 2GN.80 ruling into the tag vocabulary's documented status semantics
      — landed doc-only (2026-08-04, doc 12 §2.29), the re-scope anticipated on pickup. No code
      changed: `deno task check` was already 0 errors/549 files before this task started, since the
      2GN.80 ruling PR (#48) shipped `AbsoluteTag`/`RelativeTag`/`ArtefactTag` completely, with no
      `FunctionTag`/`ContextTag` identifier surviving anywhere in `src/`, `scripts/` or `tests/`.
      Delivered: doc 05 §9.2's code block rewritten from the retired declarations to the shipped
      vocabulary (closing §2.28's own "pending" line), four stale type references elsewhere in doc
      05 corrected to match, constraint notes recorded at the three unbuilt consumer sites (doc 05
      §13.1 for description generation/2GN.38+, doc 04 §3.2 for the lens/M6, doc 06 §6 for NPC
      interpretation/M10), and two small corrections in doc 06 (a stale §7 cross-reference corrected
      to §3.3; the FOR/USED gloss reworded to past tense). Full detail in doc 12 §2.29
- [x] **2GN.87** — `src/lib/data/classification.ts` — R4's edge-family safety net catches nothing;
      decide whether to fix the grammar, the condition, or delete the rule — **ruled and implemented
      2026-08-11: R4 deleted** (`docs/spikes/2GN.87-r4-unsatisfiable-condition.md`, doc 12 §2.39).
      The condition was not merely unlucky but **arithmetically unsatisfiable**: `primaryAxisLength`
      bands `dimensions.primaryExtent`, a `Math.max` over every component's major axis drawn from
      the _same_ `SHORT_MEDIUM_LONG_CM` table `bladeLengthBand` reads (short 4cm / medium 14cm /
      long 40cm) against a 9cm `short` cut, so a non-short blade always lifts the artefact's axis
      above `short` — R4 required a blade longer than the object containing it. Measured over 8000
      artefacts: only 6 of 12 `(axis, blade)` pairs occur, in a strict triangle where blade never
      exceeds axis, and `axis === 'short'` carried `blade === 'short'` in all 84 cases. Provenance
      settled the intent question: doc 12's PR #37 record shows R4 was authored _in review_ to close
      a gap found by enumerating the feature-space truth table, backed by a cartesian sweep that
      builds `ExtractedFeatures` by hand and so cannot distinguish a reachable cell from an
      impossible one — the scraper/chisel reading in its JSDoc was attached afterwards. Keeping it
      would have inherited a decision nobody made, so the generation question is filed clean as
      **2GN.108** with a contingent replacement rule at **2GN.109**. The edge-family sweep now
      iterates only `REACHABLE_AXIS_BLADE_PAIRS`. Separately, the audit found the suite was _not_
      riddled with dead rules — `EXPECTED_FIRE_RATES` already pins every rule's real rate and only
      R4/R33/R34 read `0.0` (pre-deletion numbering; the two dormant rules are R32/R33 after the
      renumber), the latter two deliberately dormant — so the real hole was that a recorded `0.0`
      **passed**: added `DORMANT_RULE_INDICES` plus two guards, so an unexplained zero now fails and
      a declared-dormant rule that wakes up fails too _(depended on 2GN.79 — done)_
- [x] **2GN.88** — calibration constants audited and justified; `SATURATION_CEILING` moved to the
      data layer — completing the 2GN.79 oversight audit: the retunes and fixtures had per-decision
      sign-off, but nine supporting constants were chosen without it. `TOLERANCE_POINTS` 10 → 6,
      measured rather than guessed: re-running the calibration sweep under five seed salts moves the
      worst-case rule by 3.8pp at n=1800, so 10 left only 6.2pp of genuine headroom (a rule could
      shift 9pp of real behaviour and pass); verified by inducing a subtler regression than the mass
      rebalance — R31 `>= 4` → `>= 3`, a 14.4pp drift — which the tightened band catches and names.
      `SAMPLES_PER_CELL` kept at 100, now justified: noise floor by cell size is 25→5.4pp, 50→5.1pp,
      100→3.8pp, 200→3.3pp, 400→3.5pp, so 100 sits at the knee. `SATURATION_CEILING` was **defined
      twice** (exported from the panel, re-declared in the guard) with nothing keeping them in sync
      — a defect introduced by 2GN.79/2GN.81; now one export in `src/lib/data/classification.ts`,
      since it is a fact about the rule set and `routes/` may depend on `lib/` but not the reverse.
      `DORMANCY_FLOOR` and the `rare` verdict removed: measured across all four Explorer presets it
      flagged the decoration rules on the low-decoration Tarpan culture, where they behave
      correctly, so it reported a property of the selected culture rather than anything actionable.
      Three verdicts remain, each mapping to an action. R31's weights reviewed and kept (they match
      R30's selectivity; further change belongs to 2GN.82's systematic pass). The `coastalPort`
      default removed from `mockRegionalWorld`/`mockFullGeologicalContext`/`sampleWorld` so geology
      is always a stated choice; the CLI keeps `DEFAULT_SAMPLE_REGION` and every sampler now prints
      its world in a header, since an omitted `--world` was previously invisible in output
      _(depended on 2GN.79, 2GN.81 — both done)_
- [x] **2GN.103** — reconcile `calibration.test.ts`'s `measureFireRates` and the Explorer's
      `ruleCalibration.ts` `calibrateRules` with `sampleBaselines`' material-aware grading, and
      discharge 2GN.99's forward hazard with a per-region `meanDecorativeGrade` pin — shipped
      2026-08-07 (doc 12 §2.36). Both samplers were grading their baselines through the
      material-aware pass while measuring artefacts that had never been graded through it, so R44's
      pin compared two different populations; with both graded it lands at the p90 rung as designed
      (4.0% → 10.4%). _(Line added 2026-08-11 — the task was recorded in `roadmaps.json` but never
      projected into this file; the JSON governs, so the omission was a projection gap rather than a
      missing task.)_ _(depended on 2GN.99 — done)_
- [ ] **2GN.109** — `src/lib/data/classification.ts` — replacement edge-family rule for the
      short-bodied non-blade edge, framed morphologically rather than as a truth-table cell
      _(blocked: depends on 2GN.108, 2GN.118, M1)_ — 2GN.108 ruled 2026-08-13, form ruled IN so this
      rule is live; 2GN.118 edge added the same day: the replacement rule is framed morphologically,
      so it is authored against the values that audit may change, and 2GN.118 ruled those the same
      day. The deleted R4 failed because its condition described a combination of feature _bands_
      rather than a shape, so whatever signal this rule reads must be one the generator can actually
      vary independently. **Void if 2GN.108 rules the form out of MVP scope** — file the closure
      rather than authoring a rule for a form the game does not produce. ⚠️ adding it shifts
      `CLASSIFICATION_RULES` indices again, so the pinned-index blocks in `classification.test.ts`,
      `EXPECTED_FIRE_RATES`/`MIGRATED_RULE_INDICES`/`UNIVERSAL_BY_DESIGN` in `calibration.test.ts`
      and the Explorer panel's label lookups all need updating together
- [x] **2GN.113** — `ClassificationRule.id` — give rules a stable identity independent of position
      _(depended on 2GN.87 — done)_ — filed and **ruled 2026-08-12** from PR #57 review, then
      implemented on the same branch. Every rule carries a kebab-case slug naming what it reads and
      concludes (`edge-short-sharp-dagger`), unique and pinned by test; `ruleById`/`requireRuleById`
      resolve one, and `ruleDisplayLabel` renders the positional `R{n}` the Explorer and samplers
      still show. **Why:** a rule's only identity was its index, so 2GN.87's deletion of R4 shifted
      every later rule up one and invalidated every `R{n}` reference in comments, docs and tests at
      once. Nothing failed — the staleness was found by eye across four follow-up commits, and this
      review pass still found more (an `R32`/`R29` pair in `classification.ts`, an `R11` in
      `types/tags.ts`, each describing a rule two indices away). An id reference cannot go quietly
      stale: `requireRuleById` throws naming the missing id, verified by deleting a rule and
      watching the suite fail rather than silently repoint. `classification.test.ts`'s 43 index
      constants became id lookups and its 37 weight-signature guards were deleted as redundant, with
      three id-contract tests added in their place. `R{n}` survives as a display label only; dated
      measurement records (`calibration.test.ts`'s fire-rate tables, doc 12, the spikes) keep their
      original numbering, since they describe the 44-rule set as measured. Recorded in doc 05 §9.2
- [ ] **2GN.114** — `tests/fixtures/culture.ts` — extend
      `mockCulturalProfile`/`mockPhaseCharacteristics` with a high-craft/elite preset
      (`craftSpecialisation`, `decorativeEmphasis`, `motifComplexity` pushed toward 1.0), so
      elite/ceremonial-grade artefacts are reachable through ordinary sampling and Explorer
      calibration runs rather than only via hand-built overrides _(blocked: depends on 2GN.110,
      M1)_. Filed from a real-world-find coverage spike (2026-08-13): the full M2 chain
      (expandGrammar → normaliseArtefact → expandDecoration → assignMaterials →
      gradeDecorativeLayers → extractFeatures → classifyArtefact) ran against 18 common real-world
      archaeological find types across 3000 sampled artefacts (6 mock regions × 500). Coverage
      (18/18) and frequency ordering (dominant > common > occasional > rare) both held with no
      tuning aimed at the outcome. The one gap: `meanDecorativeGrade` capped at ~0.494 across every
      region under the flat-neutral- 0.5 fixtures, making elite/ceremonial signatures
      (gold-lunula-style ornament, ceremonial mace-head) invisible to any default-fixture test or
      Explorer run — confirmed reachable (70/1000 and 392/1000 respectively) only after hand-pushing
      the three attributes to 1.0 for the spike. Not a pipeline defect; a fixture coverage gap with
      no reusable preset today
- [ ] **2GN.119** — design spike — should classification conditions read _relations between
      components_ rather than isolated component properties? — filed 2026-08-13 by the 2GN.97
      ruling. Measured over the 43 rules shipped at the time: **10 of the 24 unmigrated rules
      condition on exactly one property** (`f.x === 'value'` and nothing else) — both `base-*`
      rules, all three `perforation-*`, both `ring-*`, both `sheet-*` and `size-small-personal`. A
      further 7 read two properties describing the **same** component (the container rules pair
      `hasContainer`, a presence flag, with a feature extracted off the dominant container). Exactly
      one rule is genuinely relational (`motif-multiple-origins`). A base is a relationship between
      the base and what it supports: a pedestal under a statue and one under a hat-stand carry
      opposite readings from an identical `baseType`, and no culture-relativity separates them
      because the difference is not cultural — the rule reads one term of a two-term relation and
      discards the term carrying the meaning (doc 02 Simulation Honesty). ⚠️ **Orthogonal to doc 11
      §2.9's absolute/relative cut**: `perforation-central-rotation` awards `tool`, an AbsoluteTag,
      and is under-conditioned identically, so the defect is a property of how conditions are
      written, not of which vocabulary they award from — hence scoped to **all 43 rules**, not
      the 24. `NormalisedArtefact.attachments` and `NormalisedComponent.position` are populated and
      read by no rule, the same unused-graph finding as 2GN.108. Absorbs the competing-readings
      ambiguity originally scoped as its own question: what disambiguates a central perforation is
      the disc's size, mass and what it attaches to, so the ambiguity **is** the missing relational
      term. Rule whether conditions gain access to component relations, what that does to
      `ClassificationRule.condition`'s signature (already widened once by 2GN.80), and which rules
      are rewritten versus left as affordance readings. Independent of 2GN.118: that audits which
      parameter _values_ exist, this audits what a condition may _read_ _(blocked: depends on M1)_
- [x] **2GN.142** — design spike — should `ClassificationContext`/`FeatureBaseline`/`baselines.ts`'s
      sampling machinery gain a region dimension, and if so what shape? Doc 11 §2.9 states plainly
      that "material baselines are keyed by culture-phase × region" (unlike decoration baselines,
      which need no region key, since geology is regional and culture is not), but
      `ClassificationContext` carries only `cultureId`/`phaseId`, `FeatureBaseline` has no region
      field, and `baselines.ts`'s sampling pass has no region dimension anywhere. Rule: (1) whether
      `ClassificationContext` gains a region field, or region-keyed baselines live in a separate
      structure; (2) whether the sampling pass needs a per-region pass mirroring §2.36's
      `EXPECTED_MEAN_GRADE_BY_REGION` precedent; (3) how a rule reads a region-keyed baseline when
      an artefact's producing region isn't always known to the classification-time context
  - Note: Filed 2026-08-21 while scoping 2GN.27: this is a real gap in already-shipped baseline
    infrastructure, not new scope invented for that task. 2GN.27 cannot percentile a
    material-derived weight signal correctly without it, since `explainMaterialWeight`'s
    availability/scarcity term is fundamentally regional. Also blocks 2GN.68, which shares 2GN.27's
    exact four-term formula.
  - Note: Ruled 2026-08-24 — region is world-level, referenced by a new
    `CulturePhase.geography.regions: string[]` (plural, for a phase spanning several); measured
    `bestRegionalLevel` as collapsing across the whole world rather than a culture-phase's occupied
    regions, and rules it to resolve against the occupied set instead; production region is a
    complete copy of deposition region for MVP; no rule reads region directly, so
    `ClassificationRule.condition` doesn't widen again. Full reasoning:
    `docs/spikes/2GN.142-region-keyed-baselines.md`, propagated to doc 11 §2.9 and doc 12 §2.53.
    Implementation is unimplemented and belongs to a follow-up task.
- [ ] **2GN.144** — `types/world.ts` + `engine/generation/baselines.ts` + `types/tags.ts` +
      `engine/generation/materials.ts` — implement 2GN.142's ruling: `CulturePhase` gains
      `geography: { regions: string[] }` (plural, for a phase spanning several regions);
      `CulturePhaseSample` gains a matching `geography` field directly (not a nested `CulturePhase`
      — the sample bag stays structural until 3WS.3/3WS.4 land real culture/phase generation);
      `ClassificationContext` gains a region label sourced from the same field, alongside the
      existing `cultureId`/`phaseId` provenance labels (`emptyClassificationContext` needs a
      placeholder value); `bestRegionalLevel` (`materials.ts`) resolves against a culture-phase's
      occupied regions instead of scanning the whole `GeologicalContext` unconstrained — the actual
      collapse fix the spike measured, threaded through its four callers (`isAvailable`,
      `scarcityWeight`, `explainMaterialWeight`, `deriveMaterialProvenance`) and `assignMaterials`'s
      call chain. Three call sites also need the new field: `calibration.test.ts`'s `baselineFor`
      (stops abusing `cultureId` to hold a region name),
      `routes/dev/explorer/shared/baselineCache.ts`'s `baselineFor`, and the
      `tests/fixtures/artefact.ts` `ClassificationContext` fixture builder _(blocked: depends on
      2GN.142, M1)_
  - Note: Filed 2026-08-25 as the implementation follow-up to 2GN.142 (ruled, not implemented). Not
    a blocker for 2GN.27/2GN.68 — neither reads region directly (per 2GN.142's own Finding 2), and
    both are already unblocked by the ruling itself. 3WS.7 depends on this: it is the task that
    generates real `GeologicalContext`/regions for production cultures and needs
    `CulturePhase.geography.regions` to exist before it can populate it. 2GN.143 gets a soft link,
    since it measures directly against `bestRegionalLevel`, whose signature this task changes.
    Recalibration risk noted in the spike: the `bestRegionalLevel` fix only changes behaviour once a
    culture-phase's `geography.regions` has more than one entry, which no shipped preset does yet,
    so `EXPECTED_MEAN_GRADE_BY_REGION` and other calibration pins are not expected to move — confirm
    with `deno task test` before landing. Full reasoning:
    `docs/spikes/2GN.142-region-keyed-baselines.md`.
- [ ] **2GN.159** — Explorer: region selector on the calibration panel (2GN.81) and tag inspector
      (2GN.59) _(blocked — depends on 2GN.81, 2GN.59, 2GN.144)_
- [x] **2GN.164** — design spike: elite and ritual tag semantics. Does `elite` mean object rank or
      social position, how does it follow `stratification`, and does `ritual` read deposition
      context? Done 2026-11-18, run as an interview while planning 2GN.44 (spike file
      `docs/spikes/2GN.164-elite-ritual-tags.md`, doc 11 §2.24, doc 12 §2.64). Measured: `elite`
      does not track `stratification` (share scoring elite >= 0.8 is 0.45 / 0.68 / 0.76 / 0.59 at
      stratification 0.40 / 0.60 / 0.60 / 0.85), decorative complexity is identical across strata,
      and `ritual` reads decoration quantity only. Rulings: split `elite` into a social `elite` and
      a rank tag `lavish`; social `elite` ground truth is the stratum, carried as an occluded fact;
      `ritual` stays object-level with ritual context a graded pure function over `Provenance`;
      stratum-responsive decoration is its own spike (2GN.169)
- [x] **2GN.165** — `types/artefact.ts` + `engine/generation/classification.ts` +
      `tests/fixtures/artefact.ts` — carry the drawn `ArtefactStratum` as an occluded fact: a
      `stratum` field on `ClassifiedArtefact` and an occluded `madeForEliteStratum` member of
      `ExtractedFeatures`. Done 2026-11-18 in PR #82 — Breaking: `ClassifiedArtefact` gains a
      required field
- [ ] **2GN.166** — `data/classification.ts` + `types/tags.ts` — tag split: add `lavish` to
      `RELATIVE_TAGS`, move all 13 existing `elite` rule contributions to it, add one
      `made-for-elite-stratum` rule awarding `elite`, reassign the 11 interpretive description
      `emphasis` entries and `SITE_TYPE_TAG_AFFINITY.cache`, update doc 05 §9 and the rule-count
      docs guard _(blocked: depends on 2GN.165, M1)_ — Breaking: tag vocabulary and rule weights

---

## Milestone 7: Description

**Goal:** Register-filtered, per-component prose and a neutral physical label from observable
properties only

- [ ] **2GN.21** — `engine/generation/classification.ts` — `physicalLabel` generation from
      observable properties (neutral, not interpretive) _(blocked: depends on 2GN.59, 2GN.118, M1)_
      — 2GN.118 edge added 2026-08-13: labels are generated directly from the primitive parameter
      values that audit may change; 2GN.118 ruled the same day, so the vocabulary those labels read
      is settled
- [x] **2GN.35** — `src/lib/data/descriptions/observational/` — observational register templates per
      component type and decorative technique
- [x] **2GN.36** — `src/lib/data/descriptions/interpretive/` — interpretive register templates with
      function tag variants — deliberately does not depend on 2GN.27/2GN.68 (tag-accumulation
      changes): template authoring keys on fixed structural/material fields (1FD.31's
      `DescriptionTemplate`/`Variant` shape, 2GN.91's `VariantCondition`:
      `property`/`craftDomain`/`materialId`/`materialTag`), not on the derived
      function/elite/ceremonial tags those tasks compute. 2GN.38, which assembles descriptions
      against a fully-classified artefact, correctly owns that edge instead — though 2GN.38 itself
      (2026-09-24) ruled selection must never read the tag distribution, since `groundTruthTags` is
      occluded; register selection is neutral, not tag-driven. Confirmed by roadmap-review (deps,
      M2) 2026-08-15 _(depends on 2GN.91)_
- [x] **2GN.37** — `src/lib/data/descriptions/technical/` — technical register templates
      (craft-process, manufacturing) — same rationale as 2GN.36: does not depend on 2GN.27/2GN.68,
      since template authoring keys on fixed structural/material fields rather than derived tags.
      Confirmed by roadmap-review (deps, M2) 2026-08-15 _(depends on 2GN.91)_
- [x] **2GN.38** — `engine/generation/description.ts` —
      `generateDescription(artefact, registers): ArtefactPresentation` — assemble ordered
      observation list per component — 2GN.27 edge added by dependency review 2026-07-30: it is the
      third tag-accumulation completer alongside the already-listed 2GN.34/2GN.68. **Done
      2026-09-24**, absorbing 2GN.93: selection is neutral and never reads `groundTruthTags`
      (occluded, doc 05 §9.3) — the dependency-review concern about a shifting tag distribution is
      moot, since register/variant choice doesn't read the tag distribution at all until the lens
      exists (roadmap M6/6LS), pinned by a diegesis-guard test. `prose.ts`'s provisional
      `selectVariant` is retired in favour of `description.ts`'s single path (matcher covers all
      four `VariantCondition` fields, material gates fail closed); `prose.ts` is now a thin wrapper,
      output unchanged. `ArtefactPresentation.provenance` takes a caller-supplied `Provenance`
      (`mockProvenance` now exported from `tests/fixtures/artefact.ts`) per the 2GN.23
      M2-provisional convention, revisited at 2GN.148 once 2GN.47 lands real provenance
- [ ] **2GN.39** — `engine/generation/description.ts` — template expansion: parameterised template
      system with property slots _(blocked: depends on 2GN.160, M1)_ — `prose.ts` is now a thin
      wrapper over `description.ts`'s selection path (roadmap 2GN.38, 2026-09-24) rather than the
      drifting parallel path this task originally guarded against; this task still owns real
      template expansion beyond the provisional `#slot#` expander (property slots, decorative
      sublayer composition)
- [ ] **2GN.40** — `engine/generation/description.ts` — per-component descriptions in all three
      registers for structural components _(blocked — depends on 2GN.39)_
- [ ] **2GN.41** — `engine/generation/description.ts` — per-layer descriptions for decorative
      elements (techniques, motifs, materials) _(blocked — depends on 2GN.39)_
- [ ] **2GN.42** — `engine/generation/description.ts` — `physicalLabel` composite label from
      observable properties _(blocked — depends on 2GN.39, 2GN.21)_ — 2GN.21 edge added by
      dependency review 2026-07-30, resolving the duplicated ownership the review surfaced: 2GN.21
      computes `physicalLabel` engine-side in `classification.ts`; this task composes the rendered
      label from that value rather than re-deriving it. 2GN.38 passes `physicalLabel` straight
      through as `ArtefactPresentation.label` meanwhile
- [ ] **2GN.43** — `engine/generation/description.ts` — provenance description: site name, context
      type, approximate dating, condition _(blocked — depends on 2GN.39)_ — same stub-provenance
      caveat as 2GN.38 (dependency sweep 2026-07-25): describes a caller-supplied `Provenance`,
      since real generation is 2GN.47, downstream of this task's own chain. 2GN.38 already ships a
      data-only `projectProvenance` (`siteName` rendered, no prose) meanwhile
- [ ] **2GN.148** — `engine/generation/description.ts` — wire real generated `Provenance` (2GN.47)
      into `generateDescription()`'s `ArtefactPresentation.provenance` output, replacing the
      caller-supplied stub fixture from 2GN.38 _(blocked — depends on 2GN.160, 2GN.63)_ — 2GN.38
      took a caller-supplied `Provenance` (per the 2GN.23 M2-provisional convention) because real
      generation (2GN.47) sits downstream in the dependency chain 2GN.38 → 2GN.44 → 2GN.47; this
      task closes that loop once 2GN.47 exists, swapping the stub `mockProvenance` fixture at the
      call site for real generated provenance and updating any tests still asserting against the
      stub
- [ ] **2GN.62** — Explorer: description viewer — three-register prose side by side, register
      divergence highlighting. Rescoped 2026-09-25 (roadmap-review, deps lens): this is now the
      three-register extension of 2GN.160, the minimal viewer that surfaces `generateDescription` as
      shipped by 2GN.38 _(blocked — depends on 2GN.160, 2GN.40, 2GN.41, 2GN.42)_
- [ ] **2GN.71** — `engine/generation/description.ts` + `engine/generation/classification.ts` —
      consume assemblage membership: describe/classify a multi-part assemblage distinctly from a
      single object once 2GN.69 lands _(blocked — depends on 2GN.155, 2GN.39)_ — 2GN.39 edge added
      by dependency review 2026-07-30: the description half of this task needs the template engine
      in `description.ts` to exist
- [x] **2GN.91** — `src/lib/types/description.ts` — add `condition?: VariantCondition` to
      `DescriptionVariant`; define `VariantCondition` (parameter-value gate +
      craftDomain/materialId/materialTag material gate) — surfaced 2026-08-05 during 2GN.36/2GN.37
      planning; widened 2026-08-05 during 2GN.36 authoring. `DescriptionVariant` addresses variants
      by `property` id + `register` + `emphasis` only — a variant fires for every value of its
      parameter, since the value itself only reaches the text via a `#slot#`. Two condition gaps
      surfaced against this: (1) **within-parameter value gating** — `elongated.crossSection`'s
      'round' and 'rectangular' values don't support the same interpretive reading (a round
      cross-section is held differently to a rectangular one), so one template stretched across
      every value reads as either shallow or false for some values; (2) **cross-property/material
      gating** — a geometric reading can depend on the component's material, not just its own
      parameter ('taper suits a forceful strike' is false if the material is brittle). Originally
      scoped as technical-only (craft process is materially determined at the root: grinding bronze,
      knapping obsidian, paring oak and throwing clay are different processes), interpretive
      authoring showed the same gate is needed there too — a functional reading is a claim about
      geometry _given_ material, not geometry alone — so both registers share this one field rather
      than duplicating the concept. `VariantCondition`'s material fields are optional and any-of
      within, AND across fields (`{craftDomain: ['stoneWorking'], materialId: ['obsidian']}`
      requires both). No predicate functions (unlike `DECORATIVE_TECHNIQUES.substrate.test` in
      `data/decorations.ts`) — description data may cross the save boundary, so the condition must
      stay serialisable. Component _shape_ deliberately has no field: the `property` id already
      carries it (`elongated.edge` only fires on an elongated component). Sibling-parameter
      conditions (e.g. edge=double AND crossSection=diamond on the same component) are deliberately
      out of scope — cheap to add later as a non-breaking extension, and premature inclusion risks
      the 2GN.87 failure mode (a plausible-looking conjunction that matches zero generated
      artefacts, silently). Guarded instead by the firing-frequency test added in 2GN.36/2GN.37's
      own test suites _(depended on 2GN.35 — done; unblocked)_
- [ ] **2GN.92** — doc 05 §13.1 + doc 12 propagation entry — record the `VariantCondition` shape
      change and the selection-order contract (condition filters the candidate set, then emphasis
      selects within it) _(blocked: depends on 2GN.91, M1)_ — docs task pairing 2GN.91's type
      change. Doc 05 §13.1 currently publishes `DescriptionTemplate`/`DescriptionVariant` without a
      condition field; update the quoted interface and prose to match. Doc 12 gets a numbered
      propagation entry (next after §2.30) recording the change and its origin, matching the
      convention §2.28/§2.29 set for the `AbsoluteTag`/`RelativeTag` split
- [x] **2GN.93** — `engine/generation/description.ts` — variant selection honours `condition`:
      filter candidates by the component's assigned material (via the
      `componentId → MaterialAssignment → MaterialDefinition` join) before emphasis-based selection
      — nothing currently does the material join at description time; `NormalisedComponent` carries
      only `allowedMaterialTags` (a constraint), the actual assignment lives on
      `ClassifiedArtefact.materials` as a side-table (`MaterialAssignment[]`, joined by
      `componentId`). Flagged unresolved at authoring time (2026-08-05) as overlapping 2GN.38's own
      ownership of `generateDescription`'s variant selection — resolved at pickup (2026-09-24) by
      absorbing this task into 2GN.38 rather than tracking selection logic twice: one matcher
      (`description.ts`'s `matchesCondition`) does the join and honours all four `VariantCondition`
      fields
- [x] **2GN.160** — Explorer: description viewer — `generateDescription`'s `ArtefactPresentation`
      per component (ordered observation list, register-filtered; caller-supplied provenance stub
      per 2GN.38). Filed 2026-09-25 (roadmap-review, deps lens): 2GN.38 shipped with no Explorer
      surface, and 2GN.39/2GN.44/2GN.148 build on it. 2GN.62 is this viewer's three-register
      extension

---

## Milestone 8: Excavation & Provenance

**Goal:** Artefacts arrive in excavations with contextual juxtapositions, provenance and a measured
ambiguity mix

- [ ] **2GN.44** — `engine/generation/excavation.ts` — excavation composition: generate artefact
      batches with contextual juxtapositions (settlement + ritual intrusion, burial + trade goods,
      workshop + prestige item) _(blocked: depends on 2GN.160, 2GN.165, M1)_ — `mockProvenance` now
      exported from `tests/fixtures/artefact.ts` (roadmap 2GN.38, 2026-09-24), covering this task's
      fixture note. Boundary ruled 2026-11-18 (2GN.164 planning): the archetype is a caller-supplied
      input; this task owns the archetype table (site type, deposit contexts, lever) and
      composition, does no `craftInvestment` weighting and fills no `Provenance` fields beyond
      `cultureId`/`phaseId`; 2GN.47 adds culture-weighted selection and the rest of `Provenance`.
      2GN.165 edge added because the forced-elite lever is exact only once the stratum is carried as
      truth
- [ ] **2GN.45** — `engine/generation/excavation.ts` — ambiguity distribution targets (~30-40%
      clear, ~40-50% moderate, ~20-30% high) _(blocked — depends on 2GN.44, 2GN.138, 2GN.166)_ —
      2GN.166 edge added 2026-11-18 (2GN.164): ambiguity is measured from tags whose semantics
      change in the split
- [ ] **2GN.46** — `engine/generation/excavation.ts` — soft batch monitoring: measure interpretive
      challenge distribution, steer next excavation if skewed _(blocked — depends on 2GN.44,
      2GN.138, 2GN.166)_ — 2GN.166 edge added 2026-11-18 (2GN.164), as for 2GN.45
- [ ] **2GN.47** — `engine/generation/excavation.ts` — provenance generation: site name, site type
      (weighted by culture), region, layer, associated finds, preservation state, deposition type
      (doc 08's `engine/world/provenance.ts` is folded in here) _(blocked — depends on 2GN.161,
      2GN.44)_ — `region` is a provisional string here too (same caveat as 2GN.26; dependency sweep
      2026-07-25) — no region vocabulary or culture→region binding exists yet, so this task mints
      convention-agreed strings for 3WS.7 to reconcile once real geography lands
- [ ] **2GN.63** — Explorer: excavation + provenance viewer — artefacts grouped by site, per-site
      provenance (2GN.47). Split 2026-09-25 (roadmap-review, deps lens): the ambiguity distribution
      chart moved to 2GN.162 so this viewer surfaces excavation composition and provenance without
      waiting on the 2GN.138 interpretive-challenge spike _(blocked — depends on 2GN.44, 2GN.47)_
- [ ] **2GN.138** — design spike — define "interpretive challenge" as a measurable per-artefact
      quantity and rule the excavation ambiguity distribution targets. Doc 05 §11.3 specifies the
      principle (measure the interpretive-challenge distribution of a batch, steer the next
      excavation if skewed) and gives one illustrative skew example ("90%+ clearly classifiable"),
      but never defines the quantity — no formula, no per-artefact scoring rule. 2GN.45's target
      bands (~30-40% clear / ~40-50% moderate / ~20-30% high) trace to no doc section. Rule the
      scoring formula (candidate inputs: classification-rule fire counts and margins, tag ambiguity,
      occluded-property coverage) and re-derive or ratify the bands against measured generator
      output _(blocked: depends on M1)_
  - Note: Filed 2026-08-20 from the M2 dependency audit: 2GN.45 and 2GN.46 both require a metric doc
    05 deliberately left qualitative, and 2GN.45's bands appear to originate in the roadmap task
    text itself. Blocks both.
- [ ] **2GN.162** — Explorer: ambiguity distribution chart on the excavation viewer (2GN.63),
      against the 2GN.45 targets. Split from 2GN.63 on 2026-09-25 (roadmap-review, deps lens): the
      chart needs the 2GN.138 interpretive-challenge metric, which the excavation viewer itself does
      not _(blocked — depends on 2GN.63, 2GN.45)_
- [ ] **2GN.168** — `data/excavations.ts` + `engine/generation/excavation.ts` —
      `ritualContextOf(provenance)`: a graded 0 to 1 pure function from an authored (site type,
      deposition) table, nothing stored _(blocked — depends on 2GN.44)_

---

## Milestone 9: Corpus & Scholars

**Goal:** NPC scholars, their excavations and publications, and the professional corpus with
calibrated wrongness

- [x] **2GN.48** — `engine/world/scholars.ts` —
      `generateNPCScholars(cultures, chronology, prng): NPCScholarSeed[]` — 3-4 NPCs with name,
      specialisation, career stage — signature takes the loose `Culture[]`/`WorldChronology` bag M2
      can actually supply rather than `WorldState` (see 2GN.56's note). Three design questions had
      no doc-pinned distribution (cohort shape, specialisation coherence, `sitePreference` source)
      and were run as a spike interview: `docs/spikes/2GN.48-scholar-cohort.md`, doc 11 §2.23, doc
      12 §2.60. Delivered `engine/world/scholars.ts`, `data/scholars.ts` (measured
      `TAG_FREQUENCY`/`TAG_COOCCURRENCE_LIFT`, authored `SITE_TYPE_TAG_AFFINITY`),
      `data/scholars.calibration.test.ts`, `scholars.test.ts`, the `InterpretiveModel` fixture
      factory (`tests/fixtures/interpretation.ts`) this task's dependency sweep flagged as needed,
      `tests/fixtures/scholars.ts`, `mockWorldChronology`/`mockCultureTimeline` in
      `tests/fixtures/world.ts` — ⚠️ **breaking**: `NPCScholarSeed.name`/`MinimalScholar.name` widen
      from `string` to `NameForm`, matching the `Provenance.site.name` precedent (2GN.66);
      `CareerStage`/`ScholarStatus` hoisted from inline unions
- [ ] **2GN.49** — `engine/world/scholars.ts` — NPC `InterpretiveModel` generation:
      cultural/artefact/chrono claims with calibrated wrongness (~70% correct, ~30% wrong)
      _(blocked: depends on 2GN.149, M1)_
- [ ] **2GN.50** — `engine/generation/corpus.ts` —
      `simulateExcavations(npcs, cultures, geology, trade, prng): SimulatedExcavation[]` — 6-8
      campaigns biased by NPC preferences _(blocked — depends on 2GN.49, 2GN.63)_ — 2GN.44/2GN.47
      edges added by dependency review 2026-07-30 (2GN.44 relocated here from 2GN.48): simulated
      campaigns compose excavation batches (2GN.44) whose artefacts carry real provenance (2GN.47) —
      signature drops `WorldState` for the loose bag M2 can supply (see 2GN.56's note)
- [ ] **2GN.51** — `engine/generation/corpus.ts` —
      `generatePublications(npcs, excavations, cultures, prng): DocumentNode[]` — ~15-20 summary
      publications with lineage and commitments _(blocked — depends on 2GN.50)_ — signature drops
      `WorldState` (see 2GN.56's note)
- [ ] **2GN.52** — `engine/generation/corpus.ts` — coverage gap generation: `CoverageBudget` with
      culture/site/period bias, guaranteed gaps per culture _(blocked — depends on 2GN.50)_ — ⚠️
      **breaking**: `ProfessionalCorpus` has no `coverageGaps` field today; this task must add one
      (dependency sweep 2026-07-25)
- [ ] **2GN.53** — `engine/generation/corpus.ts` —
      `aggregateCorpus(publications): ProfessionalCorpus` — material/form frequencies, context
      associations, active debates, consensus _(blocked — depends on 2GN.51)_
- [ ] **2GN.54** — `engine/generation/corpus.ts` — dating framework generation per site: layer
      datings, methods, error margins, some deliberately wrong _(blocked — depends on 2GN.50)_ — ⚠️
      **breaking**: `ProfessionalCorpus` has no `datingFrameworks` field today; this task must add
      one (dependency sweep 2026-07-25)
- [ ] **2GN.55** — `engine/generation/corpus.ts` — calibrated wrongness distribution: interpretive
      errors, absence claim errors, rarity assessment errors, cross-cultural errors _(blocked —
      depends on 2GN.49)_
- [x] **2GN.66** — `src/lib/data/names/` — naming grammars for sites, cultures, scholars (doc 08
      `data/names/`) — widened well past this line by spike ruling
      (`docs/spikes/2GN.66-naming-grammars.md`): ships a generative phonology layer, not a name
      table, because doc 01 already lists language theories/grammar documents among the document
      types and language evolution among the mapped features, so a name-only generator would be
      thrown away when tablets land. Delivered `types/language.ts`,
      `data/names/{phones,coherence}.ts` (65-phoneme table + coherence rulesets),
      `engine/world/{phonology,naming}.ts` and `pickRanked` in `engine/prng.ts`; design imported
      from the sibling project at `~/Code/creations/the-tongue` — ⚠️ **breaking**:
      `Provenance.site.name` is now a `NameForm` (segment list + coining phase), not a `string`, so
      names can be re-rendered against later sound changes; only the type and one fixture referenced
      it — sound change itself is **not** built, so sisters within a family are currently identical
      rather than merely related
- [ ] **2GN.64** — Explorer: corpus browser — NPC researchers, publications, dating frameworks,
      coverage gaps, correct vs wrong claim toggle _(blocked — depends on 2GN.54, 2GN.53, 2GN.55,
      2GN.52)_
- [x] **2GN.130** — `src/lib/data/names/modern.ts` — the curated modern language: one pinned
      `Phonology` shared by every world seed, naming the player's own institutions, venues and
      colleagues. Generated by `generatePhonology` from a fixed seed constant rather than
      hand-authored, so it emanates from the same system as the ancient languages and inherits any
      later sound-change work; curated only in the sense that its seed is pinned, not rolled per
      world. Establishes the diegetic contrast the interpretive frame needs: the player reads
      ancient names _through_ a modern tongue, and the untranslated-tablet phase later depends on
      the player's own language being a fixed, known reference point against which unknown ones are
      strange. Adds a `MODERN_LANGUAGE_ID` reserved outside the per-world `LanguageForest`, since it
      belongs to no ancient family and must never be assigned to a culture — ruled during the 2GN.66
      spike conversation: the modern language sits **outside** `LanguageForest`, not as a family of
      one inside it, since the forest is per-world-seed and generated where this is global and fixed
- [x] **2GN.149** — Explorer: scholars panel — seed → `NPCScholarSeed` cards (name, specialisation,
      career stage). Split 2026-09-25 (roadmap-review, deps lens): the names half moved to 2GN.161
      so NPC `InterpretiveModel` work (2GN.49) gates on the scholar surface alone
- [x] **2GN.161** — Explorer: names panel — sampled site/culture/scholar names per phonology
      (2GN.66), modern-language institution names (2GN.130). Split from 2GN.149 on 2026-09-25
      (roadmap-review, deps lens) so provenance generation (2GN.47) gates on the names surface
      rather than on scholar cards
- [ ] **2GN.167** — `data/scholars.ts` — re-measure `TAG_FREQUENCY` and `TAG_COOCCURRENCE_LIFT` and
      `scholars.calibration.test.ts` against the post-split tag vocabulary _(blocked — depends on
      2GN.166)_

---

## Milestone 10: Pipeline Integration

**Goal:** All stages run as one deterministic pipeline, visible stage by stage in the Explorer

- [ ] **2GN.56** — `engine/generation/pipeline.ts` —
      `runGenerationPipeline(culture, period, geology, trade, corpus, prng): ClassifiedArtefact` —
      full 9-stage orchestrator _(blocked — depends on 2GN.64, 2GN.152, 2GN.150)_ — 2GN.16/2GN.30
      edges added by dependency review 2026-07-30: the orchestrator runs the stage-5 re-expansion
      loop (2GN.16) and stage-7 substrate enforcement (2GN.30), neither previously reachable through
      its transitive closure, so it could have read as unblocked with those stages unbuilt —
      `WorldState` does not exist as a type until 3WS.9 (`save.ts` confirms: "No runtime
      `WorldState` aggregate exists yet"), so this and the four corpus-chain signatures above
      (2GN.48/50/51) take the loose bag M2 can actually supply; 3WS.15 collapses them to the real
      `WorldState` parameter once it lands (dependency sweep 2026-07-25)
- [ ] **2GN.65** — Explorer: pipeline stage viewer — stage-by-stage output display _(blocked —
      depends on 2GN.56)_

---

## Dependency Diagram

```mermaid
graph LR
	classDef todo fill:#f6f6f6,stroke:#6f6f6f,color:#6f6f6f
	classDef inProgress fill:#e8f2ff,stroke:#0071af,color:#0071af
	classDef blocked fill:#fff8f6,stroke:#e0002b,color:#e0002b,stroke-width:2px
	classDef paused fill:#fdf4ff,stroke:#b01fe3,color:#b01fe3,stroke-dasharray:4 3
	classDef deferred fill:#fff8f3,stroke:#ac5c00,color:#ac5c00,stroke-dasharray:2 4,font-style:italic
	classDef done fill:#e0ffd9,stroke:#008217,color:#008217
	classDef outOfScope fill:#f6f6f6,stroke:#717171,color:#717171,stroke-dasharray:2 2
	classDef mile fill:#e3f7ff,stroke:#007590,color:#007590,font-weight:bold
	classDef external fill:#fff9e5,stroke:#7d6f00,color:#7d6f00,stroke-dasharray:4 3,font-style:italic
	11SM.1["11SM.1: design spike: rule the stack replacing…"]
	11SM.2["11SM.2: `package.json` + Bun: replace `deno.jso…"]
	11SM.3["11SM.3: test port: the 55 test files on `Deno.t…"]
	11SM.4["11SM.4: formatter and linter config replacing `…"]
	11SM.5["11SM.5: `scripts/dev/` samplers: replace `Deno.…"]
	11SM.6["11SM.6: deployment: build and CI workflow for t…"]
	11SM.7["11SM.7: docs: CLAUDE.md (development commands,…"]
	M1["M1: Stack Migration"]:::mile
	2GN.1["2GN.1: `src/lib/data/grammars/primitives.ts` —…"]
	2GN.2["2GN.2: `src/lib/data/grammars/core.ts` — MVP co…"]
	2GN.3["2GN.3: `engine/generation/grammar.ts` — `expand…"]
	2GN.4["2GN.4: `engine/generation/grammar.ts` — `select…"]
	2GN.5["2GN.5: `engine/generation/grammar.ts` — `phaseI…"]
	2GN.7["2GN.7: `engine/generation/grammar.ts` — complex…"]
	2GN.6["2GN.6: `engine/generation/grammar.ts` — accumul…"]
	2GN.8["2GN.8: `engine/generation/grammar.ts` — normali…"]
	2GN.9["2GN.9: `engine/generation/grammar.ts` — `derive…"]
	2GN.57["2GN.57: Explorer: structure viewer tab — genera…"]
	2GN.116["2GN.116: design spike — should component roles…"]
	2GN.118["2GN.118: design spike — are the primitive gramm…"]
	2GN.10["2GN.10: `engine/generation/grammar.ts` — `allow…"]
	2GN.122["2GN.122: design spike — is there one aperture m…"]
	2GN.135["2GN.135: design spike — rule the inputs to the…"]
	2GN.120["2GN.120: `engine/generation/grammar.ts` — deriv…"]
	2GN.170["2GN.170: design spike — figural objects (idols,…"]
	2GN.11["2GN.11: `src/lib/data/plausibility.ts` — plausi…"]
	2GN.12["2GN.12: `engine/generation/plausibility.ts` — `…"]
	2GN.58["2GN.58: Explorer: plausibility panel — generate…"]
	2GN.14["2GN.14: `engine/generation/plausibility.ts` — e…"]
	2GN.137["2GN.137: design spike — rule the value of N for…"]
	2GN.145["2GN.145: `engine/generation/grammar.ts` — `expa…"]
	2GN.16["2GN.16: `engine/generation/plausibility.ts` — r…"]
	2GN.152["2GN.152: Explorer: plausibility panel (2GN.58)…"]
	2GN.22["2GN.22: `src/lib/data/materials.ts` — material…"]
	2GN.23["2GN.23: `engine/generation/materials.ts` — `ass…"]
	2GN.24["2GN.24: `engine/generation/materials.ts` — `isA…"]
	2GN.25["2GN.25: `engine/generation/materials.ts` — `com…"]
	2GN.26["2GN.26: `engine/generation/materials.ts` — `Mat…"]
	2GN.75["2GN.75: `engine/generation/materials.ts` — `ass…"]
	2GN.60["2GN.60: Explorer: material viewer — resolved ma…"]
	2GN.74["2GN.74: `engine/generation/materials.ts` — `exp…"]
	2GN.100["2GN.100: add a distinct `leatherWorking` craft…"]
	2GN.127["2GN.127: design spike — should a material absen…"]
	2GN.128["2GN.128: `engine/generation/cultureValidation.t…"]
	2GN.136["2GN.136: design spike — rule the selection crit…"]
	2GN.124["2GN.124: `src/lib/data/materials.ts` + `src/lib…"]
	2GN.125["2GN.125: design spike — does `AvailabilityLevel…"]
	2GN.126["2GN.126: apply the 2GN.125 ruling to the availa…"]
	2GN.28["2GN.28: `src/lib/data/decorations.ts` — decorat…"]
	2GN.29["2GN.29: `engine/generation/decoration.ts` — dec…"]
	2GN.30["2GN.30: `engine/generation/decoration.ts` — mat…"]
	2GN.33["2GN.33: `engine/generation/decoration.ts` — mot…"]
	2GN.61["2GN.61: Explorer: decoration inspector — decora…"]
	2GN.131["2GN.131: design spike — what does the decorativ…"]
	2GN.132["2GN.132: design spike — does sublayer generatio…"]
	2GN.31["2GN.31: `engine/generation/decoration.ts` — lay…"]
	2GN.133["2GN.133: `engine/generation/decoration.ts` — ma…"]
	2GN.134["2GN.134: design spike — should cultural affinit…"]
	2GN.129["2GN.129: `engine/generation/decoration.ts` — ex…"]
	2GN.17["2GN.17: `src/lib/data/classification.ts` — clas…"]
	2GN.19["2GN.19: `engine/generation/classification.ts` —…"]
	2GN.20["2GN.20: `engine/generation/classification.ts` —…"]
	2GN.79["2GN.79: `tests/fixtures/world.ts` + `src/lib/da…"]
	2GN.86["2GN.86: `engine/generation/grammar.ts` — mass p…"]
	2GN.77["2GN.77: design spike — does a material's classi…"]
	2GN.78["2GN.78: `src/lib/types/tags.ts` + `src/lib/data…"]
	2GN.110["2GN.110: design spike — should `CulturalProfile…"]
	2GN.112["2GN.112: design spike — **RULED 2026-08-12 (PR…"]
	2GN.123["2GN.123: `types/world.ts` + `engine/generation/…"]
	2GN.163["2GN.163: Explorer: material viewer (2GN.60) sho…"]
	2GN.34["2GN.34: `src/lib/data/classification.ts` — deco…"]
	2GN.59["2GN.59: Explorer: tag inspector — tag map as sc…"]
	2GN.80["2GN.80: design spike — are status tags absolute…"]
	2GN.81["2GN.81: Explorer: rule calibration panel — per-…"]
	2GN.94["2GN.94: `src/lib/engine/statistics.ts` — determ…"]
	2GN.95["2GN.95: `ClassificationContext` + baseline samp…"]
	2GN.84["2GN.84: recalibrate `SCARCITY_WEIGHT` and mater…"]
	2GN.101["2GN.101: rebuild `MaterialDefinition.physicalPr…"]
	2GN.102["2GN.102: add a formability axis to MaterialDefi…"]
	2GN.111["2GN.111: design spike — should `MaterialDefinit…"]
	2GN.15["2GN.15: `engine/generation/plausibility.ts` — m…"]
	2GN.105["2GN.105: `engine/generation/materials.ts` + `ty…"]
	2GN.151["2GN.151: Explorer: material property axes in th…"]
	2GN.141["2GN.141: `src/lib/data/plausibility.ts` — revis…"]
	2GN.13["2GN.13: `engine/generation/plausibility.ts` — p…"]
	M3["M3: Plausibility"]:::mile
	2GN.83["2GN.83: recalibrate `expandDecoration`'s fill c…"]
	2GN.98["2GN.98: design spike — rule doc 11 §1.5's decor…"]
	2GN.99["2GN.99: recalibrate `computeLayerGrade` to read…"]
	2GN.106["2GN.106: `data/decorations.ts` + `engine/genera…"]
	2GN.107["2GN.107: `data/decorations.ts` — sweep every `k…"]
	2GN.82["2GN.82: recalibrate the measured classification…"]
	2GN.97["2GN.97: design spike — what does the 2GN.80 rul…"]
	2GN.72["2GN.72: `engine/generation/classification.ts` —…"]
	2GN.73["2GN.73: Explorer: extend the tag inspector (2GN…"]
	2GN.85["2GN.85: propagate the 2GN.80 ruling into the ta…"]
	2GN.87["2GN.87: `src/lib/data/classification.ts` — R4's…"]
	2GN.108["2GN.108: design spike — should the artefact voc…"]
	2GN.115["2GN.115: design spike — what defines an artefac…"]
	2GN.117["2GN.117: `engine/generation/grammar.ts` + `engi…"]
	2GN.139["2GN.139: design spike — rule the arrangement-pa…"]
	2GN.67["2GN.67: `engine/generation/grammar.ts` — arrang…"]
	2GN.140["2GN.140: design spike — rule how the grammar mo…"]
	2GN.69["2GN.69: `engine/generation/grammar.ts` — delibe…"]
	2GN.153["2GN.153: Explorer: structure viewer (2GN.57) sh…"]
	2GN.154["2GN.154: Explorer: structure viewer (2GN.57) sh…"]
	2GN.155["2GN.155: Explorer: structure viewer (2GN.57) sh…"]
	M2["M2: Structural Grammar"]:::mile
	2GN.88["2GN.88: calibration constants audited and justi…"]
	2GN.103["2GN.103: reconcile calibration.test.ts's measur…"]
	2GN.109["2GN.109: `src/lib/data/classification.ts` — rep…"]
	2GN.113["2GN.113: **RULED 2026-08-12 (PR #57 review), im…"]
	2GN.114["2GN.114: `tests/fixtures/culture.ts` — extend `…"]
	2GN.119["2GN.119: design spike — should classification c…"]
	2GN.142["2GN.142: design spike — should `ClassificationC…"]
	2GN.27["2GN.27: `engine/generation/materials.ts` + `eng…"]
	2GN.146["2GN.146: `engine/generation/materials.ts` — `sc…"]
	2GN.68["2GN.68: `engine/generation/classification.ts` —…"]
	2GN.150["2GN.150: Explorer: extend the decoration inspec…"]
	2GN.104["2GN.104: `engine/generation/decoration.ts` — re…"]
	2GN.76["2GN.76: `engine/generation/decoration.ts` — mot…"]
	2GN.147["2GN.147: `data/decorations.ts` + `engine/genera…"]
	2GN.157["2GN.157: Explorer: decoration inspector (2GN.61…"]
	2GN.158["2GN.158: Explorer: decoration inspector (2GN.61…"]
	2GN.144["2GN.144: `types/world.ts` + `engine/generation/…"]
	2GN.143["2GN.143: design spike — what role does `Materia…"]
	2GN.159["2GN.159: Explorer: region selector on the calib…"]
	2GN.164["2GN.164: design spike: elite and ritual tag sem…"]
	2GN.169["2GN.169: design spike — should the elite stratu…"]
	2GN.32["2GN.32: `engine/generation/decoration.ts` — rec…"]
	M5["M5: Decoration"]:::mile
	2GN.70["2GN.70: `engine/generation/materials.ts` + `eng…"]
	2GN.156["2GN.156: Explorer: material (2GN.60) and decora…"]
	M4["M4: Materials"]:::mile
	2GN.165["2GN.165: `types/artefact.ts` + `engine/generati…"]
	2GN.166["2GN.166: `data/classification.ts` + `types/tags…"]
	M6["M6: Features & Classification"]:::mile
	2GN.21["2GN.21: `engine/generation/classification.ts` —…"]
	2GN.35["2GN.35: `src/lib/data/descriptions/observationa…"]
	2GN.91["2GN.91: `src/lib/types/description.ts` — add `c…"]
	2GN.36["2GN.36: `src/lib/data/descriptions/interpretive…"]
	2GN.37["2GN.37: `src/lib/data/descriptions/technical/`…"]
	2GN.38["2GN.38: `engine/generation/description.ts` — `g…"]
	2GN.92["2GN.92: Doc 05 §13.1 + doc 12 propagation entry…"]
	2GN.93["2GN.93: `engine/generation/description.ts` — va…"]
	2GN.160["2GN.160: Explorer: description viewer — `genera…"]
	2GN.39["2GN.39: `engine/generation/description.ts` — te…"]
	2GN.40["2GN.40: `engine/generation/description.ts` — pe…"]
	2GN.41["2GN.41: `engine/generation/description.ts` — pe…"]
	2GN.42["2GN.42: `engine/generation/description.ts` — `p…"]
	2GN.43["2GN.43: `engine/generation/description.ts` — pr…"]
	2GN.62["2GN.62: Explorer: description viewer — three-re…"]
	2GN.71["2GN.71: `engine/generation/description.ts` + `e…"]
	2GN.44["2GN.44: `engine/generation/excavation.ts` — exc…"]
	2GN.138["2GN.138: design spike — define #quot;interpretive ch…"]
	2GN.45["2GN.45: `engine/generation/excavation.ts` — amb…"]
	2GN.46["2GN.46: `engine/generation/excavation.ts` — sof…"]
	2GN.168["2GN.168: `data/excavations.ts` + `engine/genera…"]
	2GN.66["2GN.66: `src/lib/data/names/` — naming grammars…"]
	2GN.130["2GN.130: `src/lib/data/names/modern.ts` — the c…"]
	2GN.48["2GN.48: `engine/world/scholars.ts` — `generateN…"]
	2GN.149["2GN.149: Explorer: scholars panel — seed → `NPC…"]
	2GN.49["2GN.49: `engine/world/scholars.ts` — NPC `Inter…"]
	2GN.55["2GN.55: `engine/generation/corpus.ts` — calibra…"]
	2GN.161["2GN.161: Explorer: names panel — sampled site/c…"]
	2GN.47["2GN.47: `engine/generation/excavation.ts` — pro…"]
	2GN.63["2GN.63: Explorer: excavation + provenance viewe…"]
	2GN.148["2GN.148: `engine/generation/description.ts` — w…"]
	M7["M7: Description"]:::mile
	2GN.162["2GN.162: Explorer: ambiguity distribution chart…"]
	M8["M8: Excavation & Provenance"]:::mile
	2GN.50["2GN.50: `engine/generation/corpus.ts` — `simula…"]
	2GN.51["2GN.51: `engine/generation/corpus.ts` — `genera…"]
	2GN.52["2GN.52: `engine/generation/corpus.ts` — coverag…"]
	2GN.53["2GN.53: `engine/generation/corpus.ts` — `aggreg…"]
	2GN.54["2GN.54: `engine/generation/corpus.ts` — dating…"]
	2GN.64["2GN.64: Explorer: corpus browser — NPC research…"]
	2GN.167["2GN.167: `data/scholars.ts` — re-measure `TAG_F…"]
	M9["M9: Corpus & Scholars"]:::mile
	2GN.56["2GN.56: `engine/generation/pipeline.ts` — `runG…"]
	2GN.65["2GN.65: Explorer: pipeline stage viewer — stage…"]
	M10["M10: Pipeline Integration"]:::mile
	11SM.1 --> 11SM.2
	11SM.2 --> 11SM.3
	11SM.2 --> 11SM.4
	11SM.2 --> 11SM.5
	11SM.2 --> 11SM.6
	11SM.2 --> 11SM.7
	11SM.3 --> 11SM.6
	11SM.3 --> 11SM.7
	11SM.4 --> 11SM.7
	11SM.5 --> 11SM.7
	11SM.6 --> 11SM.7
	11SM.7 --> M1
	M1 --> 2GN.116
	M1 --> 2GN.122
	M1 --> 2GN.135
	M1 --> 2GN.170
	M1 --> 2GN.145
	M1 --> 2GN.16
	M1 --> 2GN.136
	M1 --> 2GN.31
	M1 --> 2GN.129
	M1 --> 2GN.105
	M1 --> 2GN.106
	M1 --> 2GN.107
	M1 --> 2GN.72
	M1 --> 2GN.115
	M1 --> 2GN.139
	M1 --> 2GN.140
	M1 --> 2GN.109
	M1 --> 2GN.114
	M1 --> 2GN.119
	M1 --> 2GN.146
	M1 --> 2GN.76
	M1 --> 2GN.147
	M1 --> 2GN.144
	M1 --> 2GN.169
	M1 --> 2GN.166
	M1 --> 2GN.21
	M1 --> 2GN.92
	M1 --> 2GN.39
	M1 --> 2GN.44
	M1 --> 2GN.138
	M1 --> 2GN.49
	2GN.1 --> 2GN.12
	2GN.2 --> 2GN.3
	2GN.3 --> 2GN.4
	2GN.3 --> 2GN.5
	2GN.3 --> 2GN.7
	2GN.4 --> 2GN.8
	2GN.5 --> M2
	2GN.7 --> 2GN.6
	2GN.6 --> 2GN.8
	2GN.8 --> 2GN.9
	2GN.8 --> 2GN.57
	2GN.8 --> 2GN.10
	2GN.8 --> 2GN.12
	2GN.9 --> M2
	2GN.57 --> 2GN.67
	2GN.57 --> 2GN.69
	2GN.57 --> 2GN.153
	2GN.57 --> 2GN.154
	2GN.57 --> 2GN.155
	2GN.116 --> 2GN.14
	2GN.116 --> 2GN.13
	2GN.116 --> M2
	2GN.116 --> 2GN.104
	2GN.118 --> 2GN.10
	2GN.118 -.-> 2GN.122
	2GN.118 --> 2GN.135
	2GN.118 --> 2GN.117
	2GN.118 --> 2GN.109
	2GN.118 --> 2GN.21
	2GN.10 --> 2GN.145
	2GN.10 --> 2GN.15
	2GN.10 --> 2GN.104
	2GN.122 --> M2
	2GN.135 --> 2GN.120
	2GN.120 --> M2
	2GN.170 --> M2
	2GN.11 --> 2GN.12
	2GN.12 --> 2GN.58
	2GN.12 --> 2GN.137
	2GN.12 --> 2GN.23
	2GN.12 --> 2GN.17
	2GN.12 --> 2GN.19
	2GN.12 --> 2GN.15
	2GN.58 --> 2GN.14
	2GN.58 --> 2GN.16
	2GN.58 --> 2GN.152
	2GN.58 --> 2GN.13
	2GN.14 --> M3
	2GN.137 --> 2GN.145
	2GN.137 --> 2GN.16
	2GN.145 --> M2
	2GN.16 --> 2GN.152
	2GN.152 --> M3
	2GN.152 --> 2GN.56
	2GN.22 --> 2GN.23
	2GN.23 --> 2GN.24
	2GN.23 --> 2GN.25
	2GN.23 --> 2GN.26
	2GN.23 --> 2GN.60
	2GN.23 --> 2GN.74
	2GN.23 --> 2GN.29
	2GN.24 --> M4
	2GN.25 --> M4
	2GN.26 --> 2GN.75
	2GN.75 --> 2GN.30
	2GN.75 --> 2GN.27
	2GN.60 --> 2GN.163
	2GN.60 --> 2GN.151
	2GN.60 --> 2GN.156
	2GN.74 --> M4
	2GN.100 --> M4
	2GN.127 --> 2GN.128
	2GN.128 --> 2GN.134
	2GN.128 --> 2GN.129
	2GN.128 --> M4
	2GN.136 --> 2GN.124
	2GN.124 --> 2GN.125
	2GN.125 --> 2GN.126
	2GN.126 --> 2GN.163
	2GN.28 --> 2GN.29
	2GN.29 --> 2GN.30
	2GN.29 --> 2GN.33
	2GN.29 --> 2GN.61
	2GN.30 --> 2GN.150
	2GN.33 --> 2GN.68
	2GN.61 --> 2GN.31
	2GN.61 --> 2GN.150
	2GN.61 --> 2GN.157
	2GN.61 --> 2GN.158
	2GN.61 --> 2GN.32
	2GN.61 --> 2GN.156
	2GN.131 --> 2GN.32
	2GN.132 --> 2GN.31
	2GN.31 --> 2GN.133
	2GN.31 -.-> 2GN.34
	2GN.31 --> 2GN.70
	2GN.133 --> M5
	2GN.134 --> 2GN.129
	2GN.129 --> M5
	2GN.17 --> 2GN.20
	2GN.19 --> 2GN.20
	2GN.19 --> 2GN.72
	2GN.20 --> 2GN.34
	2GN.20 --> 2GN.59
	2GN.20 --> 2GN.27
	2GN.20 --> 2GN.68
	2GN.79 --> 2GN.86
	2GN.79 --> 2GN.77
	2GN.79 --> 2GN.80
	2GN.79 --> 2GN.87
	2GN.79 --> 2GN.88
	2GN.86 --> M2
	2GN.77 --> 2GN.78
	2GN.77 --> 2GN.84
	2GN.78 --> 2GN.110
	2GN.78 --> 2GN.112
	2GN.78 --> 2GN.27
	2GN.110 --> 2GN.123
	2GN.110 --> 2GN.114
	2GN.110 --> 2GN.27
	2GN.110 --> 2GN.68
	2GN.112 --> M4
	2GN.123 --> 2GN.163
	2GN.163 --> M4
	2GN.34 --> M6
	2GN.34 --> 2GN.38
	2GN.59 --> 2GN.81
	2GN.59 --> 2GN.73
	2GN.59 --> 2GN.159
	2GN.59 --> 2GN.21
	2GN.80 --> 2GN.84
	2GN.80 --> 2GN.83
	2GN.80 --> 2GN.82
	2GN.80 --> 2GN.85
	2GN.81 --> 2GN.88
	2GN.81 --> 2GN.159
	2GN.94 --> 2GN.95
	2GN.95 --> 2GN.84
	2GN.95 --> 2GN.83
	2GN.95 --> 2GN.82
	2GN.84 --> 2GN.101
	2GN.84 --> 2GN.27
	2GN.84 --> 2GN.68
	2GN.101 --> 2GN.102
	2GN.101 --> 2GN.99
	2GN.102 --> 2GN.111
	2GN.102 --> 2GN.106
	2GN.102 --> 2GN.107
	2GN.111 --> 2GN.15
	2GN.111 --> 2GN.105
	2GN.111 --> 2GN.106
	2GN.111 --> 2GN.107
	2GN.111 --> 2GN.93
	2GN.15 --> M3
	2GN.105 --> 2GN.151
	2GN.151 --> 2GN.141
	2GN.151 --> M4
	2GN.141 --> 2GN.13
	2GN.13 --> M3
	2GN.83 --> 2GN.98
	2GN.83 --> 2GN.27
	2GN.83 --> 2GN.68
	2GN.98 --> 2GN.99
	2GN.98 -.-> 2GN.114
	2GN.99 --> 2GN.103
	2GN.99 --> M5
	2GN.106 --> M5
	2GN.107 --> M5
	2GN.82 --> 2GN.97
	2GN.82 --> 2GN.27
	2GN.82 --> 2GN.68
	2GN.97 --> 2GN.72
	2GN.97 --> 2GN.27
	2GN.97 --> 2GN.68
	2GN.72 --> 2GN.73
	2GN.73 --> M6
	2GN.85 --> 2GN.27
	2GN.85 --> 2GN.68
	2GN.87 --> 2GN.108
	2GN.87 --> 2GN.113
	2GN.108 --> 2GN.115
	2GN.108 --> 2GN.139
	2GN.108 --> 2GN.67
	2GN.108 --> 2GN.140
	2GN.108 --> 2GN.69
	2GN.108 --> 2GN.109
	2GN.115 --> 2GN.117
	2GN.117 --> 2GN.154
	2GN.139 --> 2GN.67
	2GN.67 --> 2GN.153
	2GN.140 --> 2GN.69
	2GN.69 --> 2GN.155
	2GN.153 --> M2
	2GN.154 --> M2
	2GN.155 --> M2
	2GN.155 --> 2GN.71
	2GN.88 --> M6
	2GN.103 --> M6
	2GN.109 --> M6
	2GN.113 --> M6
	2GN.114 --> M6
	2GN.119 --> M6
	2GN.142 --> 2GN.27
	2GN.142 --> 2GN.68
	2GN.142 --> 2GN.144
	2GN.27 --> 2GN.146
	2GN.27 --> M6
	2GN.27 --> 2GN.38
	2GN.146 --> M4
	2GN.68 --> 2GN.150
	2GN.68 --> M6
	2GN.68 --> 2GN.38
	2GN.150 --> 2GN.104
	2GN.150 --> 2GN.76
	2GN.150 --> 2GN.147
	2GN.150 --> 2GN.70
	2GN.150 --> 2GN.56
	2GN.104 --> 2GN.157
	2GN.76 --> 2GN.158
	2GN.147 --> M5
	2GN.157 --> M5
	2GN.158 --> M5
	2GN.144 -.-> 2GN.143
	2GN.144 --> 2GN.159
	2GN.143 --> M4
	2GN.159 --> M6
	2GN.164 --> 2GN.169
	2GN.164 --> 2GN.165
	2GN.169 --> 2GN.32
	2GN.32 --> M5
	2GN.32 --> 2GN.70
	2GN.70 --> 2GN.156
	2GN.156 --> M4
	2GN.165 --> 2GN.166
	2GN.165 --> 2GN.44
	2GN.166 --> M6
	2GN.166 --> 2GN.45
	2GN.166 --> 2GN.46
	2GN.166 --> 2GN.167
	2GN.21 --> 2GN.42
	2GN.35 --> 2GN.91
	2GN.35 --> 2GN.38
	2GN.91 --> 2GN.36
	2GN.91 --> 2GN.37
	2GN.91 --> 2GN.92
	2GN.91 --> 2GN.93
	2GN.36 --> 2GN.38
	2GN.37 --> 2GN.38
	2GN.38 --> 2GN.160
	2GN.92 --> M7
	2GN.93 --> M7
	2GN.160 --> 2GN.39
	2GN.160 --> 2GN.62
	2GN.160 --> 2GN.44
	2GN.160 --> 2GN.148
	2GN.39 --> 2GN.40
	2GN.39 --> 2GN.41
	2GN.39 --> 2GN.42
	2GN.39 --> 2GN.43
	2GN.39 --> 2GN.71
	2GN.40 --> 2GN.62
	2GN.41 --> 2GN.62
	2GN.42 --> 2GN.62
	2GN.43 --> M7
	2GN.62 --> M7
	2GN.71 --> M7
	2GN.44 --> 2GN.45
	2GN.44 --> 2GN.46
	2GN.44 --> 2GN.168
	2GN.44 --> 2GN.47
	2GN.44 --> 2GN.63
	2GN.138 --> 2GN.45
	2GN.138 --> 2GN.46
	2GN.45 --> 2GN.162
	2GN.46 --> M8
	2GN.168 --> M8
	2GN.66 --> 2GN.130
	2GN.66 --> 2GN.48
	2GN.66 --> 2GN.161
	2GN.130 --> 2GN.48
	2GN.130 --> 2GN.161
	2GN.48 --> 2GN.149
	2GN.149 --> 2GN.49
	2GN.49 --> 2GN.55
	2GN.49 --> 2GN.50
	2GN.55 --> 2GN.64
	2GN.161 --> 2GN.47
	2GN.47 --> 2GN.63
	2GN.63 --> 2GN.148
	2GN.63 --> 2GN.162
	2GN.63 --> 2GN.50
	2GN.148 --> M7
	2GN.162 --> M8
	2GN.50 --> 2GN.51
	2GN.50 --> 2GN.52
	2GN.50 --> 2GN.54
	2GN.51 --> 2GN.53
	2GN.52 --> 2GN.64
	2GN.53 --> 2GN.64
	2GN.54 --> 2GN.64
	2GN.64 --> M9
	2GN.64 --> 2GN.56
	2GN.167 --> M9
	2GN.56 --> 2GN.65
	2GN.65 --> M10
	class 11SM.1 todo
	class 11SM.2,11SM.3,11SM.4,11SM.5,11SM.6,11SM.7,2GN.104,2GN.105,2GN.106,2GN.107,2GN.109,2GN.114,2GN.115,2GN.116,2GN.117,2GN.119,2GN.120,2GN.122,2GN.124,2GN.125,2GN.126,2GN.129,2GN.13,2GN.133,2GN.135,2GN.136,2GN.138,2GN.139,2GN.14,2GN.140,2GN.141,2GN.144,2GN.145,2GN.146,2GN.147,2GN.148,2GN.151,2GN.152,2GN.153,2GN.154,2GN.155,2GN.156,2GN.157,2GN.158,2GN.159,2GN.16,2GN.162,2GN.163,2GN.166,2GN.167,2GN.168,2GN.169,2GN.170,2GN.21,2GN.31,2GN.32,2GN.39,2GN.40,2GN.41,2GN.42,2GN.43,2GN.44,2GN.45,2GN.46,2GN.47,2GN.49,2GN.50,2GN.51,2GN.52,2GN.53,2GN.54,2GN.55,2GN.56,2GN.62,2GN.63,2GN.64,2GN.65,2GN.67,2GN.69,2GN.70,2GN.71,2GN.72,2GN.73,2GN.76,2GN.92 blocked
	class 2GN.1,2GN.10,2GN.100,2GN.101,2GN.102,2GN.103,2GN.108,2GN.11,2GN.110,2GN.111,2GN.112,2GN.113,2GN.118,2GN.12,2GN.123,2GN.127,2GN.128,2GN.130,2GN.131,2GN.132,2GN.134,2GN.137,2GN.142,2GN.143,2GN.149,2GN.15,2GN.150,2GN.160,2GN.161,2GN.164,2GN.165,2GN.17,2GN.19,2GN.2,2GN.20,2GN.22,2GN.23,2GN.24,2GN.25,2GN.26,2GN.27,2GN.28,2GN.29,2GN.3,2GN.30,2GN.33,2GN.34,2GN.35,2GN.36,2GN.37,2GN.38,2GN.4,2GN.48,2GN.5,2GN.57,2GN.58,2GN.59,2GN.6,2GN.60,2GN.61,2GN.66,2GN.68,2GN.7,2GN.74,2GN.75,2GN.77,2GN.78,2GN.79,2GN.8,2GN.80,2GN.81,2GN.82,2GN.83,2GN.84,2GN.85,2GN.86,2GN.87,2GN.88,2GN.9,2GN.91,2GN.93,2GN.94,2GN.95,2GN.97,2GN.98,2GN.99 done
```
