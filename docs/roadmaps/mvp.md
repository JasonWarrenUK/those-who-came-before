# Those Who Came Before: MVP Roadmap

Artefact generation game roadmap: foundation through NPC social systems, ten milestones from Deno scaffold to full career simulation.

**Critical path:** `1FD.* → 2GN.* → 3WS.* → 4UI.* → 5KN.* → 6LS.* → 7CD.* → 8PS.* → 9CR.* → 10NP.*` — each milestone's store/engine layer gates the next; the Explorer-extension tasks in each milestone are leaves, not on the critical path.

---

## Milestone 1 — Foundation

**Goal:** Deno runtime, type system, seeded PRNG, test infrastructure, Project Explorer shell

- [x] **1FD.21** — `src/lib/types/documents.ts` — `DocumentNode`, `DocumentLineage`, `DerivationType`, `DerivationEvent`, `DocumentScope`, `Audience`, `PublicationRegister`, `DocumentPerception` (simplified MVP shape per doc 10 §11: `audienceReach`, `takeawayDivergence`, `citationCount`; `DocumentNode` unavoidably references `DisseminationState`, so 1FD.22's full member list landed alongside it too)
- [x] **1FD.22** — `src/lib/types/documents.ts` — `DisseminationState`, `DisseminationEvent`, `DisseminationDetails`, `PeerReviewState`, `Retraction`, `TaintedLineage` (`DisseminationState` scoped to MVP's four states per doc 10 §11 — `presented`/`collected` deferred; completed alongside 1FD.21 since `DocumentNode` depends on it directly)
- [x] **1FD.23** — `src/lib/types/venues.ts` — `VenueDefinition`, `ContainerModel`, `TemporalMode`, `SubmissionWindow`, `EditorialProcess`, `AudienceEncounter`, `VenueScope`, `VenueClassification` (doc 07 §3.1 transcribed verbatim, term-denominated; doc 10 §6.4's week-denominated `VenueTemporalProfile` overlaps it — reconciliation owned by 1FD.40)
- [x] **1FD.24** — `src/lib/types/contradiction.ts` — `Contradiction` union, `MaterialContradiction`, `TemporalContradiction`, `CulturalContradiction`, `StructuralContradiction`, `ProvenanceContradiction`, `CorpusContradiction`, `RarityContradiction`, `MaterialProvenanceContradiction` (all eight members per doc 06 §4.2; `CulturalContradiction.agentClaim` references a claimId at MVP — doc 06's profileId applies once cultural-profile documents land post-MVP; `ContradictionSeverity` landed here from 1FD.25's bullet since all eight members reference it directly, per the 1FD.21/22 precedent)
- [x] **1FD.25** — `src/lib/types/contradiction.ts` — `ContradictionQueue`, `QueuedContradiction`, `DiegeticSurface`, `Resolution`, `HypothesisStrain` (doc 06 §4.4–§4.6, §5 verbatim; `HypothesisStrain` is the canonical strain type per doc 12 §2.15; all six `DiegeticSurface` channels typed though MVP drives only `impossible-artefact`/`field-report` — doc 07 §5.2's NPC generators already return the other shapes; `ContradictionQueue` shaped per doc 06, with doc 08 §3.4's bare-`Contradiction`-push store sketch JSDoc-flagged as illustrative pseudo-code to reconcile at the store task; `Resolution.contradictionId` flagged as a doc 06 forward reference — `Contradiction` members carry no `id` at MVP, the identity scheme belongs to the detection engine (7CD.x); resolves the two cross-file `TODO(1FD.25)` stand-ins in `interpretation.ts`; `ContradictionSeverity` already landed with 1FD.24)
- [x] **1FD.27** — `src/lib/types/career.ts` — `RoleRequirement`, `DisseminationCareerEffect`, `PeerReviewCareerEvent`, `ReviewerFeedback` (doc 07 §3.2–§3.3, §4.2 verbatim; `DisseminationTransition` hoisted from §3.2 per the `ContradictionSeverity` precedent and scoped to MVP's three live transitions — `published-to-collected` dropped per the 1FD.22 `DisseminationState` precedent; authored `ReputationEffect` hoist for the `{dimension, delta, basis}` shape doc 07 inlines identically on both career-event types; doc 08 §5's singular `reputationEffect` read in the `resolvePeerReview` sketch JSDoc-flagged — doc 07's plural array governs; `ActivityOutcome`'s provisional note updated now this task has landed, it stays provisional until activity execution gets an owning task per doc 13 §5; file remains import-free, cross-domain references by plain `string` id)
- [x] **1FD.29** — `src/lib/types/scholars.ts` — `MinimalScholar`, `NPCScholarSeed`, `SimulatedExcavation` (doc 07 §5.1 + doc 05 §4.1; `MinimalScholar.specialism.methodologicalBias` narrowed from the doc's `string` to interpretation.ts's `MethodologicalBias` union per the 1FD.31 register-narrowing precedent)
- [x] **1FD.30** — `src/lib/types/corpus.ts` — `ProfessionalCorpus`, `FrequencyRecord`, `ContextFrequency`, `ConsensusStatement`, `Debate`, `DebatePosition`, `CoverageBudget` (doc 05 §4.2–§4.3 verbatim; `ContextFrequency` is named by `ProfessionalCorpus.contextAssociations` but shaped nowhere — authored provisional per the `MotifSet`/`ActivityOutcome`/`ProvenancePresentation` precedent, as the reverse index of `FrequencyRecord.byContext` — `{totalObserved, byCulture, associatedMaterials, associatedForms, lastUpdated}` — to firm up at 2GN.53, the first real producer; `SiteType` imported from world.ts per the scholars.ts precedent; cross-domain references — NPC ids, document node ids, culture ids, period ids — stay plain `string` per the career.ts convention)
- [x] **1FD.33** — `src/lib/types/save.ts` — `SaveFile`, `SerialisedWorldState`, `SerialisedInterpretiveModel`, `SerialisedTermState`, `CURRENT_SAVE_VERSION` (doc 08 §4.1 transcribed verbatim for `SaveFile`/`CURRENT_SAVE_VERSION`; persistence scope per doc 12 §2.14 — lensState recomputed on load, contradiction queue nested inside `playerInterpretation`; the three `Serialised*` shapes are doc-named but shaped nowhere — authored via an exported recursive `Serialised<T>` utility, the single type-level encoding of doc 08 §4.2's Map→`[K,V][]` rule (functions map to `never` so non-serialisable state like `WorldSeed.prng` is a loud compile error at 8PS.2, not a silent `{}`; homomorphic branches preserve tuple arity, optionality and readonly), making `SerialisedInterpretiveModel`/`SerialisedTermState` derived aliases with zero drift by construction — a flagged deviation from the interfaces-first convention; `SerialisedWorldState` is an explicit PROVISIONAL interface authored against doc 08 §3.3's field tree since no runtime `WorldState` aggregate exists until 3WS.9/3WS.10 — `sites` landed as `datingFrameworks` (no standalone Site entity, site data lives inline on `Provenance.site`), `lineageGraph` as `lineageEvents` (graph edges are recoverable from `DocumentNode.lineage`; `DerivationEvent` records the modified/dropped commitments that aren't), plus three authored additions the tree omits but the world demonstrably needs saved — `cultures` (the tree's chronology line says "Periods, cultures" but `WorldChronology` holds only timelines, the Map-bearing `Culture` profiles live nowhere else), `geology` and `corpus` (the contradiction detector's two comparison sources, doc 06 §4.2–§4.3); player `CareerState`/`Reputation` placement, PRNG draw position and `SimulatedExcavation` persistence recorded as known omissions for 3WS.10/8PS.2 to resolve; world.ts's stale `persistence/save.ts` pointer corrected to this file; verified by throwaway compile-time assertions — value-level round-trip tests land with 8PS.1)
- [x] **1FD.40** — `src/lib/types/venues.ts` — `VenueTemporalProfile` (doc 10 §6.4, week-denominated: `submissionMode`, `openWeeks`, `cycleLengthWeeks`, `reviewLeadTimeWeeks`, `publicationLeadTimeWeeks`); reconcile with doc 07 §3.1's term-denominated `TemporalMode`/`SubmissionWindow` (supersede or coexist — doc 12's week-conversion sweep suggests weeks are canonical, cf. §2.9 precedent) and record the resolution in doc 12; consumed downstream by 9CR.5 (venue generation sets temporal properties) and 9CR.22 (venue cycles at term boundaries) (resolved as **supersede**, recorded as doc 12 §2.17: the §2.9 week sweep updated doc 10's profile but never doc 07, and `PeerReviewState` (1FD.22) already works in absolute weeks — so `TemporalMode`/`SubmissionWindow` removed, `VenueDefinition.temporalMode` → `temporalProfile: VenueTemporalProfile`, transcribed verbatim with `venueId` kept as self-referential when embedded; `TemporalMode.visibilityWindow` had no week equivalent and no consumer anywhere — dropped for MVP per the `presented`/`collected` `DisseminationState` precedent rather than converted; doc 07 §3.1 gained a supersession note)
- [x] **1FD.39** — Type index panel — list all registered interfaces with field summaries (child route `types/+page.svelte` per the 1FD.36 sub-route model, `panels.ts` entry flipped to `available`; the index is parsed live from the type modules' raw sources — an `import.meta.glob` `?raw` sweep of `src/lib/types/*.ts` (test files excluded, `term.test.ts` lives there) feeds the route-private `typeIndex.ts` parser, built on the TypeScript compiler API (`ts.createSourceFile`, parse-only, no `Program`) since regex parsing can't survive `save.ts`'s recursive conditional `Serialised<T>` or fields wrapped across lines by deno fmt; parsing runs in a `+page.server.ts` load so the multi-megabyte `typescript` module (already a dependency via svelte-check) never reaches the client bundle, and the glob keeps the panel zero-maintenance — new type modules appear automatically, the index cannot drift from the code; interfaces render their extends clause and a field table (name, `?`, `readonly`, type text, first-sentence field JSDoc), string-literal-union aliases render member badges, other aliases raw type text, exported consts/functions land in a per-module "also exports" footnote; client-side filter matches type, field and union-member names and auto-expands matching modules; `deno task test` gained `--allow-env` because typescript reads `process.env` at module init; parser covered by 8 Deno tests, panel verified in-browser — 17 modules, 106 interfaces + 41 aliases, matching the source count exactly; extended post-completion with reference visualisations, since the reference graph — not inheritance, of which exactly one `extends` exists — is where the density lives: a mermaid module dependency graph (17 nodes), per-type reference-neighbourhood diagrams via a graph toggle on each card (the full ~150-node type graph is deliberately not drawn — unreadable hairball) and clickable cross-reference jumps on type names; mermaid renders client-side in its own lazy chunk, the parser additionally extracts raw type references and sibling-module imports, filtered against the name registry server-side)
- [x] **1FD.1** — Create `deno.json` with tasks, compilerOptions, fmt/lint config
- [x] **1FD.2** — Swap `adapter-node` for `@deno/svelte-adapter` in `svelte.config.js`
- [x] **1FD.3** — Strip Node tooling (`.prettierrc`, `.prettierignore`, `.npmrc`)
- [x] **1FD.4** — Verify npm deps via `npm:` specifiers (Svelte 5, SvelteKit 2, Vite 7, Tailwind 4, DaisyUI 5)
- [x] **1FD.5** — Verify `deno task dev` serves app, `deno task check` passes
- [x] **1FD.6** — Implement `src/lib/engine/prng.ts` — xoshiro128** algorithm, `createPrng(seed: string): () => number`
- [x] **1FD.7** — Write `weightedSelect(items, prng)` utility (reused across pipeline)
- [x] **1FD.8** — Write PRNG determinism test — same seed → identical sequence
- [x] **1FD.9** — Write PRNG distribution test — output approximately uniform over large sample
- [x] **1FD.12** — `src/lib/types/tags.ts` — `FunctionTag`, `ContextTag`, `MaterialTag`, `ClassificationRule`, `ClaimMagnitude` (built ahead of 1FD.10 so `grammar.ts` could import the real `MaterialTag` rather than a placeholder; `ClassificationRule.condition` typed against a local `ExtractedFeatures` stand-in until 1FD.11 landed, now imports the real type from `artefact.ts`)
- [x] **1FD.10** — `src/lib/types/grammar.ts` — `GrammarRule`, `GrammarOption`, `ArrangementPattern`, `AccumulationConstraints`, `AttachmentType` (imports `MaterialTag` from 1FD.12; `GrammarOption.expandsTo` and `.phaseModifiers` are provisional shapes, JSDoc-marked, pending 2GN.3/2GN.5)
- [x] **1FD.11** — `src/lib/types/artefact.ts` — `NormalisedArtefact`, `NormalisedComponent`, `Attachment`, `ObjectDimensions`, `Portability`, `InspectionDepth`, `ClassifiedArtefact`, `ExtractedFeatures`, `MaterialAssignment`, `MaterialDefinition`, `MaterialProvenance` (doc 05 §5.2, §6.1, §7, §9; `MaterialDefinition` has no doc 05 field shape, adopted the `{id, displayName, tags}` shape from `docs/dev/implementation/m1-artefact-generation.md` — doc 05 §15's richer geological/cultural fields deferred until `GeologicalContext`/`CulturalProfile` exist; `ClassifiedArtefact.decorativeLayers`/`.provenance` now import the real `DecorativeLayer`/`Provenance` from `decoration.ts`/`world.ts`, both landed with 1FD.13/1FD.16)
- [x] **1FD.13** — `src/lib/types/decoration.ts` — `DecorativeTechnique`, `DecorativeLayer` (doc 05 §8.2–§8.3; `DecorativeTechnique` is a flat 16-member union, not a discriminated union with per-technique params, since `DecorativeLayer` only carries generic `motifRef?`/`material?` slots; material-prerequisite rules are engine/data-layer concerns, not typed here — see roadmap 2GN.28/2GN.30; resolves the `TODO(1FD.13)` stand-in in `artefact.ts`)
- [x] **1FD.14** — `src/lib/types/world.ts` — `WorldSeed`, `PhaseCharacteristics`, `CulturePhase`, `CultureTimeline`, `CulturalProfile`, `Culture`, `CraftInvestmentProfile`, `MotifSet`, `MotifDefinition`, `WorldChronology` (doc 05 §2, §3.1–§3.3; `MotifSet`/`MotifDefinition` are invented, provisional, not doc-specified — minimal shape so `DecorativeLayer.motifRef` can reference one by id; `CulturalProfile`'s JSDoc flags the unrelated same-named type in doc 06 §3.3; built together with 1FD.15/1FD.16 in the same file since `CraftInvestmentProfile` and `WorldChronology` reference their types directly)
- [x] **1FD.15** — `src/lib/types/world.ts` — `MaterialFlow`, `RelationshipDynamics`, `RelationshipPhase`, `CultureRelationship` (doc 05 §3.4, fully specified verbatim; built alongside 1FD.14/1FD.16)
- [x] **1FD.16** — `src/lib/types/world.ts` — `SiteType`, `PreservationState`, `DepositionType`, `Provenance`, `AvailabilityLevel`, `RegionalAvailability`, `GeologicalContext` (doc 05 §3.5–§3.6, fully specified verbatim; `Provenance`'s JSDoc distinguishes it from `MaterialProvenance` in `artefact.ts`; resolves the `TODO(1FD.16)` stand-in in `artefact.ts`; built alongside 1FD.14/1FD.15)
- [x] **1FD.18** — `src/lib/types/interpretation.ts` — `Confidence`, `Observation`, `EvidenceLink`, `InferenceScope`, `Inference`, `Hypothesis`, `InterpretiveModel` (doc 06 §2.1–§2.3, doc 08 §3.2; `InterpretiveModel` uses the doc 08 §3.2 "claims" shape rather than doc 06 §6's "knowledge layers" shape — the two docs conflict, and doc 08's version matches this roadmap's own field ownership (1FD.19, 1FD.25) and the concrete store-construction code in doc 08 §3.4; `Observation.observationRegister` is typed as the inline MVP three-value union pending `DescriptionRegister` from 1FD.20/1FD.31; `InterpretiveModel`'s five 1FD.19-owned fields were private `unknown` placeholders until 1FD.19 landed, its two 1FD.25-owned fields still are)
- [x] **1FD.19** — `src/lib/types/interpretation.ts` — `MethodologicalBias`, `CulturalClaim`, `ArtefactClaim`, `ChronoClaim`, `AgentAssessment`, `MethodologicalProfile` (doc 08 §3.2 names all five as `InterpretiveModel` members but gives no field shapes; authored against downstream consumers instead — the contradiction detector's `agentClaim: { claimId, claim }` contract (doc 06 §4.2, 1FD.24) requires `id` + `claim: string` on the three claim types, and the player store's `Map` usage (doc 08 §3.4) requires `id`-keying and a `status` union including `'active'`, reusing the `'active' | 'challenged' | 'retracted'` union already on `Inference`/`Hypothesis`; `MethodologicalBias` is an authored union — `'materialist' | 'structuralist' | 'culturalist'` from doc 07 §5.1 plus an authored `'generalist'` neutral member so the union stays total (no optional `bias` field) and `MethodologicalProfile` has a sensible non-empty default (`bias: 'generalist'`, all `weights` at `1.0`) for the `defaultMethodology()` factory, 3WS.11; strain lives in `HypothesisStrain`, 1FD.25 — the name `StrainScore` is retired; resolves the five same-file `TODO(1FD.19)` stand-ins in `interpretation.ts`)
- [x] **1FD.26** — `src/lib/types/career.ts` — `Reputation`, `ReputationModifier`, `ReputationGate`, `CareerState`, `AcademicRole`, `CareerActivity`, `ActivityType` (doc 07 §2, §2.2, §4.0–§4.1, fully specified verbatim and self-contained; `CareerActivity.outcomes: ActivityOutcome[]` needed an invented, provisional `ActivityOutcome` shape — doc 07 names it only as a comment, "Possible results", with no roadmap task owning it)
- [x] **1FD.32** — `src/lib/types/visibility.ts` — `PropertyVisibility` (string-literal union, not a TS `enum`, per the convention already committed in `artefact.ts`'s module JSDoc), `PROPERTY_VISIBILITY_VALUES`, `isPropertyVisibility` (doc 11 §2.7 authoritative; helpers kept minimal since there's no consumer yet — `lens.ts`, 1FD.20, is the first)
- [x] **1FD.17** — `src/lib/types/world.ts` — `DatingFramework`, `LayerDating`, `DatingMethod` (doc 05 §4.7, fully specified verbatim; `DatingConfidence` hoisted from the doc's inline union on `DatingFramework.confidence` per the `ClaimStatus` precedent in interpretation.ts — `ProvenancePresentation.dating`, 1FD.31, is the second consumer)
- [x] **1FD.28** — `src/lib/types/term.ts` — `TermType`, `AcademicYear`, `TermState`, `BackgroundDrain`, `CompletedAction` (doc 08 §3.6 verbatim, which supersedes doc 07's older sketches per doc 12 §2.9), constants (`WEEKS_PER_TERM`, `TERMS_PER_YEAR`, plus `WEEKS_PER_YEAR` from the same doc block), helpers (`termStartWeek`, `weekInTerm`, `termIndexFromWeek`, `yearFromTerm`; all 0-based per doc 11 §2.8, covered by `term.test.ts`; `getTermType(termIndex)` deliberately excluded — it belongs to 9CR.20, `engine/career/progression.ts`)
- [x] **1FD.20** — `src/lib/types/lens.ts` — `LensStrength`, `ObservationSalience`, `ClassificationSuggestion`, `CrossReference`, `DescriptionFrame`, `OmissionCheck`, `LensState` (doc 04 §3.1–§3.5, §4, incl. the graduated dissemination factor with 0.15 presented per doc 12 §2.16; `LensState` is named by doc 06 §6 and 6LS.2/6LS.4 but shaped nowhere — landed as a flagged provisional design, per-hypothesis `strengths` Map + aggregated `tagWeights` + `computedAtTerm`, to firm up at 6LS.2/6LS.3; also owns `DescriptionRegister` (doc 04 §3.4), moved here from the 1FD.31 bullet because `DescriptionFrame` keys a `Record` on it and description.ts already imports lens.ts, keeping imports one-directional; resolves the `observationRegister` inline-union TODO in interpretation.ts from 1FD.18)
- [x] **1FD.31** — `src/lib/types/description.ts` — `DescriptionTemplate`, `DescriptionVariant`, `ArtefactPresentation`, `PresentedObservation`, `TagSuggestion`, `ProvenancePresentation` (doc 05 §13.1–§13.2; both `register` fields narrowed from the doc's five-value `ObservationRegister` to the three-value `DescriptionRegister` per doc 12 §2.10 — the five-register model + `RegisterAccess` is post-MVP, doc 13 §4; `DescriptionRegister` itself lives in lens.ts under 1FD.20, imported here; `ProvenancePresentation` is named by `ArtefactPresentation.provenance` but shaped nowhere — landed as a flagged provisional player-visible projection of world.ts `Provenance`, `cultureId`/`phaseId`/`year` deliberately absent with an optional corpus-derived `dating` block per doc 05 §4.7, to firm up at 2GN.38)
- [x] **1FD.34** — Configure `deno test`, verify runner executes against engine skeleton (`deno task test` wired in `deno.json`; `@std/assert@^1.0.19` added; `tsconfig.json` excludes `*.test.ts` from `svelte-check` since Deno test files use `Deno.ns`/`jsr:` specifiers svelte-check can't resolve)
- [x] **1FD.35** — Create test fixture helpers — mock culture, mock world seed, mock artefact factories (split per-domain, mirroring `src/lib/types/`: `tests/fixtures/world.ts` keeps `mockWorldSeed`, now returning the real `WorldSeed` instead of a local stand-in; `tests/fixtures/culture.ts` adds `mockCulture`; `tests/fixtures/artefact.ts` adds `mockNormalisedArtefact` and `mockArtefact`; each takes a shallow-merge `overrides` param that replaces whole top-level branches rather than deep-merging, since several fields are `Map`s or multi-level nested objects; `tsconfig.json`'s `exclude` extended to `tests/**/*.test.ts` alongside the existing `src/**/*.test.ts` for the same Deno-only reason)
- [x] **1FD.36** — Create route `/dev/explorer` with layout and nav (sub-route model: each future panel is a child route under `src/routes/dev/explorer/` plus one entry in the route-private `panels.ts` registry — `{id, label, path, milestone, status}` — which drives both the sidebar `menu` nav and the overview landing table; planned M1 panels render as `menu-disabled` placeholders until 1FD.38/39 flip their status; seed input, 1FD.37, is a shell control not a panel — the layout's header bar reserves its right-hand mount point; `src/routes/dev/+layout.ts` guards the whole `/dev` subtree with a 404 outside `dev` builds; also created the root `src/routes/+layout.svelte` as a prerequisite fix — nothing imported `app.css`, so Tailwind/DaisyUI styles never loaded anywhere)
- [x] **1FD.37** — Seed input field component (route-private `SeedInput.svelte` mounted in the layout header's reserved slot; the seed lives in the `?seed=` URL query param so it survives reload and repro cases are shareable via link — `seed.ts` owns `DEFAULT_SEED` and `getSeed(url)`, with absent/empty falling back to the default and committing the default or an empty value removing the param; the layout nav and overview table links now carry `page.url.search` so the seed survives panel switches)
- [x] **1FD.38** — PRNG output display (child route `prng/+page.svelte` per the 1FD.36 sub-route model, `panels.ts` entry flipped to `available`; draws N values — default 20, clamped 1–1000 — from two *independent* `createPrng(seed)` instances and compares index-by-index with exact float equality; the visual determinism check is a badge verdict plus per-row ✓/✗ over full-precision values; everything is `$derived` from the URL seed and N, so changing the header seed regenerates the panel live with no generate button)

---

## Milestone 2 — Generation Pipeline

**Goal:** Artefact generation per doc 05 — per-artefact stages 4–8 (grammar → normalisation/plausibility → materials → decoration → unified feature extraction + classification), description templates (stage 9), plus excavation composition and initial corpus (stage 3, generated against mock world fixtures until 3WS.15 wires real `WorldState`)

- [x] **2GN.8** — `engine/generation/grammar.ts` — normalisation: flatten grammar tree → `NormalisedArtefact` with ordered components, computed dimensions, derived portability (exported `normaliseArtefact(object, id): NormalisedArtefact` — depth-first, primary-before-attachments flatten mirroring `expandGroup`/`tallyArrangements`'s established traversal shape; `id` is a caller-supplied parameter (seed→id stays a pipeline concern) so the function mints component ids as deterministic positional strings (`` `${id}-c${n}` ``) rather than touching the PRNG, keeping normalisation PRNG-free per the doc 05 §6.1 contract; each `AttachmentBranch` becomes one `Attachment` linking its parent group's primary component id to its child group's primary id, both always in hand because the recursive walk returns each group's primary id before the parent records the join; `properties` is defensively copied (`Map<string,string>` → `Map<string,string|number>`) so the artefact never aliases the source tree; dimensions derive through a new MVP-provisional ordinal-band-to-centimetre table (three vocabularies — length, size, diameter — per the primitive registry's parameter naming, per-primitive major/minor extraction, whole-object extents taken as the max single-component axis rather than a summed bounding box, a documented MVP simplification since assembled geometry is deferred) with mass and portability as further provisional derivations over those extents, all explicitly marked provisional per the 2GN.2 precedent — tests assert monotonicity/ordering across bands, never exact centimetre values, so the numbers can be retuned freely once generation is observable in the Explorer; `allowedMaterialTags` is stubbed `[]` and `arrangementGroup` is omitted, each with a comment naming the task that owns it (2GN.10, 2GN.67) rather than fabricating data the grammar has no faithful source for; roadmap 2GN.9's `deriveInspectionDepth(dimensions)` was folded into this task rather than left separate — it is a three-line function over dimensions this task already computes, using doc 05 §5.2's verbatim thresholds (maxExtent <=30 → 'full', <=150 → 'detailed', else 'observational'), the one non-provisional derivation in the new code, and 2GN.9 had no dependents beyond the milestone rollup so folding it required no roadmap reorder; covered by 25 new Deno tests in `grammar.test.ts` — purity/determinism, no input mutation, flatten order and position sequencing, positional id determinism, component/attachment counts matching tree shape, attachment endpoint correctness including a 3-deep nested chain, both stubs' exact shape, defensive property copying, dimension/mass/portability monotonicity across size bands, `deriveInspectionDepth`'s exact boundary values, multi-group flatten ordering, graceful degradation on an unrecognised primitive, and an end-to-end integration test normalising real `expandGrammar` output over 20 seeds asserting unique ids and valid attachment references)
- [x] **2GN.9** — `engine/generation/grammar.ts` — `deriveInspectionDepth(dimensions)` util (delivered as part of 2GN.8 rather than separately — see that entry; folding was safe since 2GN.9 depended only on 2GN.8 and had no other dependents)
- [ ] **2GN.10** — `engine/generation/grammar.ts` — `allowedMaterialTags` derivation per component from primitive type + properties compatibility _(depends on 2GN.8 — unblocked; `NormalisedComponent.allowedMaterialTags` currently stubbed `[]` by 2GN.8, awaiting this task's compatibility table)_
- [x] **2GN.11** — `src/lib/data/plausibility.ts` — plausibility rule definitions: requires, excludes, ordering, material-physics, ergonomic predicates (authored `PlausibilityRule` as a new discriminated union in `types/plausibility.ts`, interfaces-first per the `ClassificationRule`/`GrammarRule` precedent rather than co-located with the data — the union didn't exist anywhere in the codebase before this task, only inline in doc 05 §6.2; predicate variants (`material-physics`, `ergonomic`) fixed a convention doc 05 leaves ambiguous: `predicate(artefact)` returns `true` when the artefact VIOLATES the rule, so `checkPlausibility` (2GN.12) can collect every violated rule's `reason` directly into `failures`; shipped all four doc 05 §6.2 worked examples as predicates in `data/plausibility.ts` — edged-blade-needs-a-grip, long-blade-needs-grip-length, heavy-perpendicular-attachment-needs-rigid-shaft, heavy-component-on-thin-walled-hollow — since each turns on a component property (`edge`, `length`, `wall`, `flexibility`, attachment `type`) rather than a primitive-to-primitive relationship, so only the predicate variants could express them faithfully; the declarative `requires`/`excludes`/`ordering` variants ship in the type union with zero MVP instances, commented as awaiting a component-role/classification vocabulary this project doesn't have yet — a bare `primitiveType` string can't express "a grippable component"; every proxy (grip = a second component exists, rigid shaft = `bar-form` or `flexibility: 'rigid'` `sheet-form`) is commented as an MVP stand-in pending 2GN.23 material assignment; covered by 18 new Deno tests in `plausibility.test.ts` — discriminant validity, non-empty/unique `reason`s, an every-shipped-predicate sweep against the `mockNormalisedArtefact` fixture, three violate/satisfy cases per rule using crafted artefacts, and a cross-reference check that every `primitiveType`/`AttachmentType` string literal the predicates key off resolves against the real `PRIMITIVE_TYPES`/`ATTACHMENT_TYPE_VALUES` vocabularies)
- [x] **2GN.12** — `engine/generation/plausibility.ts` — `checkPlausibility(artefact): { valid, failures }` (result shape mirrors `AccumulationCheckResult` per the 2GN.6 precedent — a new `PlausibilityCheckResult` interface, engine-local; iterates a rule set defaulting to `PLAUSIBILITY_RULES`, injectable for tests; predicate variants (`material-physics`, `ergonomic`) apply the 2GN.11 polarity contract directly — `reason` collected into `failures` when `predicate(artefact)` is `true`; the declarative variants (`requires`/`excludes`/`ordering`) have zero MVP instances in `PLAUSIBILITY_RULES` but are evaluated structurally regardless — by `primitiveType` presence/absence and `NormalisedComponent.position` ordering — so the runner is complete for whichever variant 2GN.13–15 reach for and the internal `switch` stays exhaustive (`never`-typed default arm); pure and PRNG-free, no input mutation; covered by 16 new Deno tests in `plausibility.test.ts` — default-fixture validity, default-rule-set wiring, one violate case per shipped rule asserting its exact `reason` string, a satisfied-rules case, simultaneous violations, one fire/satisfy pair per declarative variant via injected crafted rules, an empty rule set, and purity/determinism via repeat calls plus a `structuredClone` snapshot)
- [ ] **2GN.13** — `engine/generation/plausibility.ts` — physical viability rules (structural integrity, load paths, cantilever limits) _(depends on 2GN.12 — unblocked)_
- [ ] **2GN.14** — `engine/generation/plausibility.ts` — ergonomic rules (grip length for edged forms, handleability) _(depends on 2GN.12 — unblocked)_
- [ ] **2GN.15** — `engine/generation/plausibility.ts` — material-structural compatibility (material tags constrain joins/forms) _(depends on 2GN.12 — unblocked)_
- [ ] **2GN.16** — `engine/generation/plausibility.ts` — re-expansion loop: on failure, re-expand from grammar up to N attempts _(depends on 2GN.12 — unblocked)_
- [x] **2GN.17** — `src/lib/data/classification.ts` — classification rules: feature→tag scoring, structural/container/decorative/cross-layer contributions — rules were derived from first principles against the signals `data/grammars/primitives.ts` actually rolls, not transcribed from doc 05 §9.2's illustrative examples (interviewed rule-by-rule with the user; doc 12 §2.19 records the session), since the engine's primitive/parameter vocabulary has grown past what that section shows; 39 rules across edge/point/edge-count, opening-graded container, vessel-refinement (wall/curvature/base), perforation, ring/fastener, sheet, mass, size, structural-complexity, decoration (real-signal + two dormant rules awaiting 2GN.33 motif/material assignment), cross-layer, and structural-presence-flag families, each keyed on a real primitive parameter or decorative-layer fact (PR #37 review added five: a short-edge scraper rule closing an edge-family coverage gap, an off-centre perforation rule, and fastening-mechanism/impact-surface/wearable rules consuming previously-unread presence flags; doc 12 §2.19 records them) — `CLASSIFICATION_RULES: readonly ClassificationRule[]` mirrors the `plausibility.ts` authoring convention (module JSDoc, banner-grouped, per-rule rationale comment); surfaced that `ExtractedFeatures` (1FD.11) was too coarse to carry the rule set, so it gained 13 fields (⚠️ breaking — new required fields) — `pointSharpness`, `bladeLengthBand`, `bladeProfile`, `perforation`, `wallThickness`, `ringGap`, `sheetFlexibility`, `massBand`, `sizeBand`, `curvature`, `openingType`, `baseType`, `appliedElementPresent` — each traceable to a real grammar signal (`types/artefact.ts`; `tests/fixtures/artefact.ts`'s `mockExtractedFeatures` updated to match); established and audited a **mechanical-vs-classificatory boundary** (doc 12 §2.19): `portability`/`inspectionDepth` are mechanical (doc 05 §5.2 handling/inspection) and must never be read by a classification rule — `massBand`/`sizeBand` are the physical-fact equivalents; zero pre-existing violations found; enforced going forward by a dedicated boundary-guard test in `classification.test.ts`; `bladeProfile`'s cut-vs-thrust sword-typology axis is captured but its tag-score differentiation is deliberately deferred to description work (2GN.40); covered by 58 new Deno tests in `classification.test.ts` — structural invariants (non-empty tag maps, real-tag cross-reference via compiler-checked `Record<FunctionTag,true>`/`Record<ContextTag,true>`, weight bounds, no-throw), the boundary guard, purity, one fire/no-fire block per rule pinned by index, an exhaustive edge-family sweep (every edged feature set fires at least one edge rule) and a perforation-family sweep (each non-none band fires exactly one rule), and a worked-example integration test (an engraved long bronze blade fires weapon/ritual/ceremonial/elite simultaneously, per doc 05 §9.2's closing claim) _(depended on 1FD.12, 2GN.12 — both done)_
- [x] **2GN.19** — `engine/generation/classification.ts` — `extractFeatures(artefact): ExtractedFeatures` — unified feature extraction from components, now covering the full geometry-derived `ExtractedFeatures` contract 2GN.17 authored rules against (structural fields plus `pointSharpness`, `bladeLengthBand`, `bladeProfile`, `perforation`, `wallThickness`, `ringGap`, `sheetFlexibility`, `massBand`, `sizeBand`, `curvature`, `openingType`, `baseType`, `appliedElementPresent`; 2GN.27 and 2GN.34 still complete the doc 05 stage-8 contract with material and decorative-motif fields) — landed as `extractFeatures(artefact, decorativeLayers = []): ExtractedFeatures`, pure and PRNG-free; materials are deliberately not a parameter (material-derived fields are 2GN.27's); per-family collapse policies keep multi-component artefacts coherent (doc 12 §2.20): `bladeLengthBand`/`bladeProfile` read one dominant edged component (longest blade, earliest position on ties), all container facts (`openingType`/`containerOpenness`/`wallThickness`/`baseType`) read one dominant container (largest `hollow-enclosed`, else longest `cylindrical`), perforation follows the pinned `central` > `off-centre` > `single` > `multiple` priority, ring/sheet/curvature report the most classificatorily-loaded value present; the three presence flags with no 1:1 grammar signal were interviewed item-by-item (doc 12 §2.20): `hasImpactSurface` = untapered `bar-form` or thick `disc-form`, `hasFasteningMechanism` = pin-on-hoop anatomy (a `ring-form` joined to a sharp edgeless `elongated`) or hinged join, `isWearable` = `ring-form` or suspension perforation, the latter two body-scale gated (`sizeBand` not `large`, `massBand` at most `light`); band thresholds sit at the midpoints of 2GN.8's provisional cm tables; unrecognised parameter values degrade to first-listed BNF values; dormant fields keep honest no-producer defaults (`motifPresent` reads `motifRef` and fires once 2GN.33 lands; `motifCulturalOrigins`/`preciousMaterialsInDecoration` are 2GN.34's); covered by 34 Deno tests in the sibling `classification.test.ts` (purity, per-family collapse, interviewed flags and gates, graceful degradation) _(depended on 2GN.12 — done; rescoped 2026-07-22 per doc 12 §2.19)_
- [ ] **2GN.20** — `engine/generation/classification.ts` — `classifyArtefact(features, rules): Map<FunctionTag|ContextTag, number>` — rule-based scoring _(depends on 2GN.17, 2GN.19 — unblocked)_
- [ ] **2GN.21** — `engine/generation/classification.ts` — `physicalLabel` generation from observable properties (neutral, not interpretive) _(blocked — depends on 2GN.20)_
- [x] **2GN.22** — `src/lib/data/materials.ts` — material definitions: id, label, tags, physical properties, decorability (geological scarcity and cultural affinity modifiers deliberately kept in `world.ts`'s `GeologicalContext.materialAvailability`/`CulturalProfile.materialAffinities` rather than duplicated here — both are already keyed by `id`/`tags`, the join keys this file provides; `craftDomain` added instead, resolving `MaterialDefinition`'s own doc 05 §15 follow-up note per which `PhaseCharacteristics.technology` axis governs working each material)
- [x] **2GN.23** — `engine/generation/materials.ts` — `assignMaterial(component, culture, phase, geology, trade, materials, prng): MaterialDefinition` — per-component assignment (doc 05 §7 transcribed near-verbatim: compatibility filter over `component.allowedMaterialTags` against `MaterialDefinition.tags`, then availability filter, then `weightedSelect` over `computeMaterialWeight`; `materials` defaults to the shipped `MATERIALS`, `prng` required and last per the `grammar.ts` convention; 2GN.24/2GN.25 folded in as full exported functions per the 2GN.8→2GN.9 precedent — `assignMaterial`'s doc body calls both directly and is untestable without them; two empty-candidate fallbacks guard `weightedSelect`'s empty-list throw — an empty `allowedMaterialTags` (today's reality, since 2GN.10 hasn't landed and 2GN.8 stubs it `[]`) is treated as "no constraint" rather than "nothing fits", and availability excluding every compatible material falls back to the compatible set, then to the full catalogue, so the function never throws) — **region-agnostic at MVP, flagged as an explicit M2-provisional boundary**: the type system has no culture→region mapping (`Culture` carries no `region` field; region lives only on `Provenance.site.region`, generated downstream at 2GN.47, and as the key inside `RegionalAvailability.regions`), and real per-region `GeologicalContext` doesn't land until 3WS.7 (Milestone 3) — Milestone 2 runs this pipeline against mock world fixtures by design, so `isAvailable` checks the best level across every region a geology map reports rather than gating on one specific region; true region-gating and material-origin attribution remain owned by 2GN.26/2GN.47/3WS.7; two new fixtures added to `tests/fixtures/world.ts` (`mockGeologicalContext`, `mockMaterialFlow`) since none existed; covered by 20 new Deno tests in `materials.test.ts` — compatibility filtering, the empty-`allowedMaterialTags` and availability-exhausted fallbacks, `isAvailable` per availability level plus trade-flow reachability (by tag and by `specificMaterials` id) and the no-geology-entry lenience, `computeMaterialWeight`'s three factors (affinity max-across-tags, phase-technology floor-lerp, scarcity multiplier) each shown to shift the weight the expected direction, determinism (same seed ⇒ same pick, varied seeds ⇒ varied picks), purity via `structuredClone` snapshots, default-catalogue wiring, and three ~1000-draw distribution tests (metal-affine culture vs indifferent, high vs low metallurgy technology, abundant vs scarce compatible peer)
- [x] **2GN.24** — `engine/generation/materials.ts` — `isAvailable(material, geology, trade): boolean` — local + trade availability check (delivered as part of 2GN.23 rather than separately — see that entry; binary gate: `abundant`/`available`/`scarce` → obtainable, `trade-only` → obtainable only via a matching `MaterialFlow` (by `materialTag` or `specificMaterials` id), `absent` → excluded; a material missing from the geology map entirely is treated as obtainable, an M2 lenience for mock world fixtures that won't list every material)
- [x] **2GN.25** — `engine/generation/materials.ts` — `computeMaterialWeight(material, culture, phase): number` — cultural affinity × phase technology (delivered as part of 2GN.23 — see that entry; gains a fourth `geology` parameter beyond the roadmap's stated `(material, culture, phase)`, a deliberate documented refinement so a graded scarcity multiplier can apply — doc 05 §7's "trade materials appear at low weight" is a weighting concern, not a binary one, so scarcity needed a place to live; scarcity multipliers (`abundant` 1.0 → `trade-only` 0.15) and the phase-technology floor (0.2 at technology 0, mirroring `phaseInfluence`'s lerp shape in `grammar.ts` so a culture never fully loses the ability to occasionally produce a material it's just beginning to work) are MVP-provisional and retunable, per the 2GN.8 dimension-tuning precedent)
- [ ] **2GN.26** — `engine/generation/materials.ts` — `MaterialProvenance` metadata generation (source, origin region, trade path) _(depends on 2GN.23)_
- [ ] **2GN.27** — `engine/generation/materials.ts` — material influence on tag accumulation (precious metals → elite/ceremonial boosts) _(blocked — depends on 2GN.20, 2GN.23)_
- [x] **2GN.28** — `src/lib/data/decorations.ts` — decorative technique definitions: surface treatments (polish, patina, scoring, engraving, relief, painting, glaze), applied elements (inlay, overlay, studs, wire-wrapping, gilding), textile elements (wrapping, tassels, beading) with material prerequisites _(depends on 1FD.13, M1)_ — each of the sixteen doc 05 §8.2 terminals gets a `DecorativeTechniqueDefinition` (`category`, `substrate`, `carriesMotif`, `introducesMaterial`); the new `DecorativeSubstrate` type (`types/decoration.ts`) splits `[requires: ...]` prerequisites into `{kind:'material', label, test}` — an executable predicate over `MaterialDefinition` reusing the `decorability`/`physicalProperties`/`tags` facts materials.ts pre-resolved for exactly this (engraving/inlay → `engravable`, painting → `paintable`, glaze → `glazeable`, gilding → metal tag; relief/overlay proxy "thick"/"rigid" off `hardness !== 'soft'`; studs → rigid-or-leather) — versus `{kind:'form', requires:'grippable'|'attachment-point'}` for wire-wrapping/wrapping/beading, whose prerequisite is the target component's geometry, not its material, and so is only labelled here for 2GN.30 to resolve; polish/patina/roughening/scoring/tassels get `{kind:'none'}`; covered by 12 new Deno tests in `decorations.test.ts` — one-definition-per-technique via a compiler-checked `Record<DecorativeTechnique, true>` (materials.test.ts's `ALL_MATERIAL_TAGS_RECORD` precedent), valid category/discriminant shape, five techniques' predicates exercised against real `MATERIALS` fixtures (engraving accepting soft-but-workable gold, rejecting flint/fired-clay; glaze accepting only fired-clay; gilding accepting all four metals; painting rejecting bronze; studs accepting leather despite softness), and `carriesMotif`/`introducesMaterial` checked against the full technique set
- [x] **2GN.29** — `engine/generation/decoration.ts` — decorative grammar expansion: iterate surfaces, select techniques weighted by culture + phase _(depends on 2GN.23, 2GN.28)_ — `expandDecoration(artefact, culture, phase, geology, trade, materials, techniques, prng): DecorativeLayer[]` iterates `artefact.components` and, per component, fills each of the doc 05 §8.2 BNF's three zero-or-more categories (surface-treatment, applied-element, textile-element) independently: a per-category probabilistic fill (`decorationIntensity` — an equal-weight blend of `society.craftSpecialisation`/`aesthetics.decorativeEmphasis`, MVP-provisional per the 2GN.8 precedent since doc 05 §8.3 names the two drivers without quantifying them) draws up to `MAX_SLOTS_PER_CATEGORY` slots with per-slot geometric decay mirroring `grammar.ts`'s attachment-depth shape, each filled slot resolved by `weightedSelect` over `computeTechniqueWeight`; emitted layers are flat (`sublayers: []`, `motifRef`/`material` omitted) — layering (2GN.31/32), motif assignment and introduced-material resolution (2GN.33) are explicitly out of scope, as is per-component substrate *enforcement* (2GN.30, which strips candidate layers this task may emit for a component whose eventual material/geometry doesn't actually satisfy the technique). `computeTechniqueWeight` is a product of four factors floored at `Math.max(0.01, …)` per the `effectiveOptionWeight`/`computeMaterialWeight` precedent: the culture's `techniqueAffinities` (new field, below), a one-directional `materialAccessGate`, a `TECHNIQUE_CRAFT_AXIS`-gated phase-technology lerp (all MVP-provisional, e.g. engraving/inlay/relief/overlay/studs/wire-wrapping/gilding provisionally read against `metallurgy` absent per-component material threading), and an `aesthetics.decorativeEmphasis` skew. Extracted `resolvePhaseAttribute` out of `grammar.ts` into new shared `engine/generation/phase.ts` (both engines needed the identical dotted-path lerp-attribute resolver; `grammar.ts` now imports it, behaviour unchanged, `grammar.test.ts` still green). ⚠️ **Breaking change**: added `techniqueAffinities: Map<DecorativeTechnique, number>` to `CulturalProfile` (`types/world.ts`) — not doc 05 §3.3-specified, authored because the product requirement (four independent quadrants: engraving-with-beasts, engraving-without-beasts, beasts-without-engraving, neither) needs a per-culture *technique* preference signal that's independent of both `motifVocabulary` (motifs, 2GN.33) and `materialAffinities` (which materials, not which techniques); a technique absent from the map reads neutral. Its selection weight is additionally gated one-directionally by `materialAccessGate`: a culture that neither favours-above-neutral nor can obtain (`isAvailable`, reused from `materials.ts`) any material satisfying a technique's `substrate.test` has that technique suppressed to a `MATERIAL_ABSENT_GATE` floor regardless of stated affinity (a culture cannot engrave what it has no engravable material for), but the converse never holds — favouring an engravable material never forces engraving to be selected. `tests/fixtures/culture.ts`'s `mockCulturalProfile` gained a matching metal-leaning `techniqueAffinities` default (engraving/inlay/gilding) so it agrees with its existing metal-leaning `materialAffinities` rather than contradicting it out of the box; overrides replace the whole `Map`, independently of `materialAffinities`, per the existing shallow-branch-replacement convention. Covered by 20 new Deno tests in `decoration.test.ts` — `computeTechniqueWeight`'s four factors each shown to shift weight the expected direction (including the technology floor never zeroing and a technology-neutral technique being unaffected), both material-gate directions (suppression when no plausible material exists, and non-inflation when material favour exists without technique affinity), form/none substrates never gated; `expandDecoration`'s determinism (same seed identical, varied seeds diverge), purity (structuredClone snapshots for every input except the technique catalogue, which carries an unclonable `substrate.test` closure and is instead checked by per-entry reference identity), target-component validity, the flat-output/omitted-field boundary guard, all-three-categories coverage at max intensity, intensity-driven total-layer-count distribution, an isolation test confirming `technology.textiles` shifts only the textile-element category and never leaks into other categories' shares, empty-category and empty-component safety, and default-catalogue equivalence — plus 3 new fixture tests in `culture.test.ts` guarding the new field's default value and independent-override behaviour.
- [ ] **2GN.30** — `engine/generation/decoration.ts` — material prerequisite enforcement (engraving → hard material, glaze → ceramic, etc.) _(depends on 2GN.29 — unblocked)_
- [ ] **2GN.31** — `engine/generation/decoration.ts` — layering support: `DecorativeLayer` with sublayers, decoration-on-decoration _(depends on 2GN.29 — unblocked)_
- [ ] **2GN.32** — `engine/generation/decoration.ts` — recursion depth cap from `craftSpecialisation` × `aesthetics.decorativeEmphasis` _(depends on 2GN.29 — unblocked)_
- [ ] **2GN.33** — `engine/generation/decoration.ts` — motif assignment from culture's `motifVocabulary`, shared motifs via cultural exchange _(depends on 2GN.29 — unblocked)_
- [ ] **2GN.34** — `engine/generation/classification.ts` — update: decorative features contribute to unified tag accumulation (decorativeComplexity, preciousMaterials, motifOrigins) _(blocked — depends on 2GN.29, 2GN.20)_
- [ ] **2GN.35** — `src/lib/data/descriptions/observational/` — observational register templates per component type and decorative technique _(depends on 1FD.31, M1)_
- [ ] **2GN.36** — `src/lib/data/descriptions/interpretive/` — interpretive register templates with function tag variants _(depends on 1FD.31, M1)_
- [ ] **2GN.37** — `src/lib/data/descriptions/technical/` — technical register templates (craft-process, manufacturing) _(depends on 1FD.31, M1)_
- [ ] **2GN.38** — `engine/generation/description.ts` — `generateDescription(artefact, registers): ArtefactPresentation` — assemble ordered observation list per component _(blocked — depends on 2GN.34, 2GN.35, 2GN.36, 2GN.37)_
- [ ] **2GN.39** — `engine/generation/description.ts` — template expansion: parameterised template system with property slots _(blocked — depends on 2GN.38)_
- [ ] **2GN.40** — `engine/generation/description.ts` — per-component descriptions in all three registers for structural components _(blocked — depends on 2GN.39)_
- [ ] **2GN.41** — `engine/generation/description.ts` — per-layer descriptions for decorative elements (techniques, motifs, materials) _(blocked — depends on 2GN.39)_
- [ ] **2GN.42** — `engine/generation/description.ts` — `physicalLabel` composite label from observable properties _(blocked — depends on 2GN.39)_
- [ ] **2GN.43** — `engine/generation/description.ts` — provenance description: site name, context type, approximate dating, condition _(blocked — depends on 2GN.39)_
- [ ] **2GN.44** — `engine/generation/excavation.ts` — excavation composition: generate artefact batches with contextual juxtapositions (settlement + ritual intrusion, burial + trade goods, workshop + prestige item) _(blocked — depends on 2GN.38)_
- [ ] **2GN.45** — `engine/generation/excavation.ts` — ambiguity distribution targets (~30-40% clear, ~40-50% moderate, ~20-30% high) _(blocked — depends on 2GN.44)_
- [ ] **2GN.46** — `engine/generation/excavation.ts` — soft batch monitoring: measure interpretive challenge distribution, steer next excavation if skewed _(blocked — depends on 2GN.44)_
- [ ] **2GN.47** — `engine/generation/excavation.ts` — provenance generation: site name, site type (weighted by culture), region, layer, associated finds, preservation state, deposition type (doc 08's `engine/world/provenance.ts` is folded in here) _(blocked — depends on 2GN.66, 2GN.44)_
- [ ] **2GN.48** — `engine/world/scholars.ts` — `generateNPCScholars(world, prng): NPCScholarSeed[]` — 3-4 NPCs with name, specialisation, career stage _(blocked — depends on 2GN.44, 2GN.66)_
- [ ] **2GN.49** — `engine/world/scholars.ts` — NPC `InterpretiveModel` generation: cultural/artefact/chrono claims with calibrated wrongness (~70% correct, ~30% wrong) _(blocked — depends on 2GN.48)_
- [ ] **2GN.50** — `engine/generation/corpus.ts` — `simulateExcavations(npcs, world, prng): SimulatedExcavation[]` — 6-8 campaigns biased by NPC preferences _(blocked — depends on 2GN.49)_
- [ ] **2GN.51** — `engine/generation/corpus.ts` — `generatePublications(npcs, excavations, world, prng): DocumentNode[]` — ~15-20 summary publications with lineage and commitments _(blocked — depends on 2GN.50)_
- [ ] **2GN.52** — `engine/generation/corpus.ts` — coverage gap generation: `CoverageBudget` with culture/site/period bias, guaranteed gaps per culture _(blocked — depends on 2GN.50)_
- [ ] **2GN.53** — `engine/generation/corpus.ts` — `aggregateCorpus(publications): ProfessionalCorpus` — material/form frequencies, context associations, active debates, consensus _(blocked — depends on 2GN.51)_
- [ ] **2GN.54** — `engine/generation/corpus.ts` — dating framework generation per site: layer datings, methods, error margins, some deliberately wrong _(blocked — depends on 2GN.50)_
- [ ] **2GN.55** — `engine/generation/corpus.ts` — calibrated wrongness distribution: interpretive errors, absence claim errors, rarity assessment errors, cross-cultural errors _(blocked — depends on 2GN.49)_
- [ ] **2GN.66** — `src/lib/data/names/` — naming grammars for sites, cultures, scholars (doc 08 `data/names/`) _(depends on 1FD.14, M1)_
- [ ] **2GN.67** — `engine/generation/grammar.ts` — arrangement detection + pattern assignment: annotate `NormalisedComponent.arrangementGroup` (pattern, index, totalInGroup) at flatten time, descoped out of 2GN.8 since the grammar never assigns an arrangement pattern (2GN.3 rolls repetition incidentally, 2GN.6's `checkAccumulation` only validates admissibility, never labels one), so `arrangementGroup.pattern` has no faithful source at flatten time and fabricating one would invent data; detection reuses `tallyArrangements`' same-primitiveType-within-one-top-level-group boundary (already the detection contract behind 2GN.6, cheap to apply again here), leaving pattern *assignment* as the open question this task owns — may mean threading a choice through `expandGrammar`'s determinism-critical draw sequence; nothing consumes the field yet, so this task is currently childless in the graph _(blocked — depends on 2GN.8)_
- [ ] **2GN.56** — `engine/generation/pipeline.ts` — `runGenerationPipeline(world, culture, period, prng): ClassifiedArtefact` — full 9-stage orchestrator _(blocked — depends on 2GN.53)_
- [ ] **2GN.57** — Explorer: structure viewer tab — generate from seed + culture selector, component tree with join types _(blocked — depends on 2GN.8)_
- [ ] **2GN.58** — Explorer: plausibility panel — generate N structures, show pass/fail with rejection reasons, running rejection rate _(depends on 2GN.12 — unblocked)_
- [ ] **2GN.59** — Explorer: tag inspector — tag map as scored bar chart, per-component contribution breakdown _(blocked — depends on 2GN.20)_
- [ ] **2GN.60** — Explorer: material viewer — resolved material per component, culture bias breakdown (scarcity vs affinity vs trade) _(depends on 2GN.23)_
- [ ] **2GN.61** — Explorer: decoration inspector — decoration layers per component with prerequisites, technique, layer depth _(depends on 2GN.29 — unblocked)_
- [ ] **2GN.62** — Explorer: description viewer — three-register prose side by side, register divergence highlighting _(blocked — depends on 2GN.40)_
- [ ] **2GN.63** — Explorer: excavation viewer — artefacts grouped by site, ambiguity distribution chart _(blocked — depends on 2GN.44, 2GN.45)_
- [ ] **2GN.64** — Explorer: corpus browser — NPC researchers, publications, dating frameworks, coverage gaps, correct vs wrong claim toggle _(blocked — depends on 2GN.54, 2GN.53)_
- [ ] **2GN.65** — Explorer: pipeline stage viewer — stage-by-stage output display _(blocked — depends on 2GN.56)_
- [x] **2GN.1** — `src/lib/data/grammars/primitives.ts` — geometric primitive defs (elongated, cylindrical, flat-broad, hollow-enclosed, ring-form, disc-form, bar-form, sheet-form) with parameter enums (doc 05 §5.3 transcribed verbatim as a single `as const` `PRIMITIVE_PARAMETERS` registry — primitive id → parameter name → ordered value list — with `PrimitiveType` derived via `keyof typeof`, a flagged deviation from the interfaces-first convention per the `Serialised<T>` zero-drift precedent in save.ts; "parameter enums" realised as string-literal value lists per the no-`enum` convention committed in artefact.ts; parameters deliberately scoped per primitive, no shared unions — `crossSection` and `taper` carry different value-sets across primitives; `PRIMITIVE_TYPES` array + `isPrimitiveType` guard round out the union-values-guard trio per the visibility.ts precedent; material-tag compatibility stays with 2GN.10, dimension derivation with 2GN.8, selection weights with 2GN.2/2GN.4 — this module is data only, no `MaterialTag` import needed; covered by 7 Deno tests asserting the eight-primitive vocabulary, per-primitive parameter names and verbatim spot-checked value lists)
- [x] **2GN.2** — `src/lib/data/grammars/core.ts` — MVP component grammar rules: `<object>` → `<component-group>+`, `<component-group>` → `<primary-component>` + optional attachments, base weights (four `GrammarRule`s in BNF order exported as a `readonly GrammarRule[]` — interfaces-first against the 1FD.10 types, no keyed index since `symbol` is already the rule's identity; `attachment` authored as a fourth rule so `selectGrammarOption` (2GN.4) applies culture-biased weighted selection uniformly to join choice, with the caveat documented in the module header that its options expand to `AttachmentType` terminals — neither rule symbols nor primitives — consumed positionally by `expandGrammar` (2GN.3) as edge labels, never expanded as components; the BNF's `+`/`*` repetition is deliberately not encoded — chain length is engine behaviour (2GN.3) bounded by accumulation constraints (2GN.6/2GN.7); all `baseWeight`s and `culturalModifiers` are authored MVP-provisional archaeology-flavoured priors since doc 05 §5.4 gives the modifier maths but no numbers, to tune once generation is observable in the Explorer; five illustrative `phaseModifiers` entries — hollow-enclosed on `technology.ceramics`, bar-form/socketed/riveted/threaded on `technology.metallurgy` — as fixtures for `phaseInfluence`, multiplier semantics firming up at 2GN.5; covered by 8 Deno tests asserting the four-rule vocabulary, exact primitive and attachment coverage in registry/union order, `expandsTo` resolution, positive finite weights and valid modifier keys — no assertions on specific weight values, so tests don't fossilise provisional numbers)
- [x] **2GN.3** — `engine/generation/grammar.ts` — `expandGrammar(rules, culture, phase, prng)`: top-level grammar expansion, selects primary component, expands attachment chains (walks the §5.3 BNF top-down into an `ExpandedObject` — tree shapes `ComponentNode`/`AttachmentBranch`/`ComponentGroupNode`/`ExpandedObject` added to `types/grammar.ts`, deliberately carrying no ids, dimensions or portability since those are the 2GN.8 flatten's concerns, keeping the tree a cheap re-rollable intermediate for §6.2 re-expansion (2GN.16); `primitiveType` stays a plain `string` per the `NormalisedComponent` precedent — `types/` never imports `data/`; `ATTACHMENT_TYPE_VALUES` + `isAttachmentType` complete the union-values-guard trio per the visibility.ts precedent so the engine validates join terminals at runtime; primitive terminals roll their physical parameters at expansion time, uniform per parameter in registry order, so normalisation never touches the PRNG; the attachment rule's options are consumed positionally as edge labels per the 2GN.2 contract, with non-attachment terminals throwing; every selection routes through `selectGrammarOption` including the single-option `object`/`component-group` rules — the prng draw sequence is the determinism contract, so future multi-option rules change distributions, not draw structure; repetition is bounded by provisional constants pending 2GN.6/2GN.7 — tier-specific continuation probabilities of 0.2/0.4/0.6 with group caps of 2/3/4 echoing §5.5's tier ceilings, attachment slots at 0.4 × 0.5^depth with breadth 2 and depth 3; malformed grammar (missing rules, unknown symbols, rule cycles via a hop budget) throws loudly; the `expandsTo` resolution order — rule symbol → primitive → attachment terminal → throw — is now the firmed contract in its JSDoc; covered by 10 Deno tests: same-seed deep-equal trees, seed divergence, structural validity over 200 seeds, cap enforcement over 500, repetition distribution ~70% single-group over 1 000, three malformed-grammar throw cases and an end-to-end culture-bias sweep)
- [x] **2GN.4** — `engine/generation/grammar.ts` — `selectGrammarOption(rule, culture, phase, prng)`: culture-biased weighted selection with 0.01 floor (doc 05 §5.4's formula adapted to the callback-shaped `weightedSelect` from 1FD.7 — effective weights computed transiently in the `getWeight` callback via a private `effectiveOptionWeight` helper, never stored: `baseWeight` + affinity × modifier per cultural entry with missing affinities reading as 0, scaled by `phaseInfluence` (2GN.5), floored at 0.01, which also makes `weightedSelect`'s zero-total uniform fallback unreachable from this call site; exactly one prng draw per call regardless of option count, so draw ordering is a stable determinism contract for `expandGrammar` (2GN.3); `culture` param typed `CulturalProfile` not `Culture` — the pipeline passes `baseProfile`; covered by 6 Deno tests — determinism, culture and phase distribution shifts over 1 000 draws, floor reachability at the ~0.1% expected rate over 10 000 draws, inert modifiers for absent affinities, single-draw consumption via a call-counting prng wrapper — all against crafted rules so core.ts's provisional weights aren't fossilised, per the 2GN.2 precedent)
- [x] **2GN.5** — `engine/generation/grammar.ts` — `phaseInfluence(option, phase)`: phase characteristics modify grammar option weights (the provisional `phaseModifiers` contract firmed here as promised at 1FD.10/2GN.2: each `[dottedPath, multiplier]` entry resolves its 0–1 attribute from `PhaseCharacteristics` and contributes the factor `1 + (multiplier − 1) × attribute` — neutral at attribute 0, the full multiplier at 1, sub-1 multipliers suppressing in proportion to the attribute — so low technology never suppresses below base weight, matching doc 05 §3.2's framing that high attributes *increase* probabilities; entries combine by product; absent/empty maps return a neutral 1; unresolvable paths throw, since grammar data is authored in-repo and core.test.ts guards the shipped keys — a miss is always an authoring typo, better loud than silently skewing distributions forever; path resolution is a generic object walk so new `PhaseCharacteristics` attributes need no engine change; `types/grammar.ts` JSDoc updated from "expect this to firm up" to the fixed contract; `tests/fixtures/culture.ts` gained exported `mockPhaseCharacteristics` (two-level merge overrides — a documented divergence from `mockCulture`'s whole-branch replacement, since all four branches are flat numeric records) and `mockCulturalProfile` builders; covered by 7 Deno tests — lerp endpoints and midpoint, product combination, sub-1 suppression, both throw cases and a shipped-fixture sweep asserting every core.ts modifier evaluates finite and positive)
- [x] **2GN.7** — `engine/generation/grammar.ts` — complexity budget derivation from `craftSpecialisation` (simple/moderate/sophisticated thresholds) (exported `resolveComplexityTier` + `deriveComplexityBudget(craftSpecialisation)`, scalar signatures since doc 05 §5.5 derives from exactly one attribute — input-honest and fixture-free to test; `ComplexityTier` stays engine-local since `types/grammar.ts` is data shapes only and the tier is a derivation detail; the doc's overlapping tier bounds firmed as half-open upward — simple [0, 0.3), moderate [0.3, 0.6), sophisticated [0.6, 1] — so boundary values promote: more specialisation never means less complexity; non-finite or out-of-[0,1] input throws per the `resolvePhaseAttribute` loud-failure precedent; derivation is pure and PRNG-free so it can never perturb the draw-sequence determinism contract; `expandGrammar` now consumes `maxDistinctGroups` (2/3/4) as its group-repetition cap and enforces a per-tier `minDistinctGroups` (1/2/3) unconditionally before a per-tier `additionalGroupProbability` (provisional 0.2/0.4/0.6) governs further additions up to the cap — the minimum is kept engine-side in the tier table rather than on `AccumulationConstraints` so that type stays spec-verbatim, but it is enforced as a hard floor, giving the doc's tier group ranges ("1–2/2–3/3–4") exactly rather than as a distribution shift; `maxComponentsPerGroup` (4/8/12, rising to cover radial's doc maximum only at sophisticated) and `noTwoGroupsSameType` (true only at simple) are authored MVP-provisional per the 2GN.2 precedent — derived now, enforced at 2GN.6; pattern instances carry §5.5's example counts verbatim as authored data and are built fresh per call so no two budgets share mutable innards; attachment depth/breadth constants stay provisional pending 2GN.6; covered by 6 new Deno tests — tier boundaries, throw cases, doc-cited group caps, pattern-set widening per tier with a spot-check on symmetric's [2, 4, 6], monotone provisional limits, mutation safety — plus the 2GN.3 cap and distribution tests reworked tier-aware: group counts asserted within the enforced 1–2/2–3/3–4 ranges over 500 seeds per tier, and the distribution test now pins ordering (more specialisation → more groups) instead of the provisional probabilities)
- [x] **2GN.6** — `engine/generation/grammar.ts` — accumulation checking: `ArrangementPattern` constraint enforcement (symmetric, radial, linear-array, stacked, nested, branching valid counts) (exported `checkAccumulation(object, constraints): AccumulationCheckResult` — a pure validator, not expansion-time enforcement, since doc 05 §6.2's model is check-and-re-roll with the re-expansion loop owned by 2GN.16; the result shape `{ valid, failures }` mirrors the planned `checkPlausibility` (2GN.12) so the loop can treat both uniformly, with `AccumulationCheckResult` engine-local per the `ComplexityTier` precedent; the doc gives no detection mechanism for arrangement groups on the raw tree — `arrangementGroup` only exists on `NormalisedComponent` at 2GN.8 — so the detection boundary firmed here (user-confirmed design decision) is per top-level group: same-`primitiveType` components within one top-level `ComponentGroupNode` (primary plus attachment descendants, recursively) form one arrangement group, never pooling across top-level groups, keeping `noTwoGroupsSameType` meaningful and setting the boundary 2GN.8's `arrangementGroup` annotation must follow; four checks — top-level group count vs `maxDistinctGroups` (defensive re-check, since `expandGrammar` already enforces it, keeping the validator authoritative over hand-built/deserialised trees), per-arrangement count vs `maxComponentsPerGroup`, pattern admissibility for every repetition (count ≥ 2) with `symmetric` as an exact-count allow-list and the other five as inclusive ranges per the 1FD.10 type asymmetry, and `noTwoGroupsSameType` triggering only when two top-level groups each carry an arrangement of the same type — same-type singles never trigger it, a single component being no arrangement at all; pure and PRNG-free, failure messages name type, count and violated bound; a failed check is not an error — expansion is cheap, the pipeline re-rolls; `expandGrammar`'s provisional attachment constants stay as generation-side heuristics with the checker now the validation authority, per the updated module comments; covered by 12 Deno tests against crafted trees and constraints so provisional tier numbers aren't fossilised — clean pass, symmetric allow-list vs range inclusivity at both bounds, cap-beats-pattern precedence, the never-pools-across-groups boundary, nested-descendant counting, both `noTwoGroupsSameType` polarities plus the singles exemption, defensive group-count failure, simultaneous-violation accumulation, purity/no-mutation via `structuredClone` snapshots, and a 500-seed moderate-tier integration sweep asserting expanded trees mostly satisfy their own derived budget)

---

## Milestone 3 — World State & Integration

**Goal:** WorldState generation (seed → chronology → cultures), stores architecture, pipeline integration with real culture data

- [ ] **3WS.1** — `engine/world/seed.ts` — `createWorldSeed(raw: string): WorldSeed` — seed string → PRNG _(blocked — depends on 2GN.56, M2)_
- [ ] **3WS.2** — `engine/world/chronology.ts` — `generateChronology(seed, prng): WorldChronology` — startYear, endYear, presentYear, culture-relative periodisation (no shared timeline) _(blocked — depends on 3WS.1)_
- [ ] **3WS.3** — `engine/world/culture.ts` — `generateCultures(prng, count): Culture[]` — culture generation with `CulturalProfile` (materialAffinities, motifVocabulary, craftInvestment) _(blocked — depends on 3WS.2)_
- [ ] **3WS.4** — `engine/world/culture.ts` — `generatePhases(culture, prng): CulturePhase[]` — 3-4 phases per culture with `PhaseCharacteristics` (technology, economy, society, aesthetics) _(blocked — depends on 3WS.3)_
- [ ] **3WS.5** — `engine/world/culture.ts` — `generateRelationships(cultures, prng): CultureRelationship[]` — temporal relationship phases with trade, conflict, cultural exchange, politics _(blocked — depends on 3WS.3)_
- [ ] **3WS.6** — `engine/world/culture.ts` — `MaterialFlow` generation within relationships (tag, materials, direction, volume) _(blocked — depends on 3WS.5)_
- [ ] **3WS.7** — `engine/world/seed.ts` — geological context generation: `GeologicalContext` with material availability per region, `AvailabilityLevel` per material _(blocked — depends on 3WS.1)_
- [ ] **3WS.8** — `engine/world/culture.ts` — motif vocabulary generation per culture (distinctive sets for cultural fingerprinting) _(blocked — depends on 3WS.3)_
- [ ] **3WS.9** — `engine/world/seed.ts` — `createWorld(seed: string): WorldState` — full orchestrator: chronology + cultures + geology + relationships _(blocked — depends on 3WS.4, 3WS.7, 3WS.5)_
- [ ] **3WS.10** — `src/lib/stores/worldState.svelte.ts` — reactive wrapper: chronology, artefacts, sites, scholars, documents, lineage graph, venues, career events _(blocked — depends on 3WS.9)_
- [ ] **3WS.11** — `src/lib/stores/playerInterpretation.svelte.ts` — reactive wrapper around player's `InterpretiveModel` with immutable update methods (placeholder) _(blocked — depends on 3WS.10)_
- [ ] **3WS.12** — `src/lib/stores/lensState.svelte.ts` — lens state store (placeholder, computed later) _(blocked — depends on 3WS.10)_
- [ ] **3WS.13** — `src/lib/stores/ui.svelte.ts` — UI state: selected artefact, active panel _(blocked — depends on 3WS.10)_
- [ ] **3WS.14** — `src/lib/stores/gameState.svelte.ts` — orchestrator: imports all stores, provides `initialise(seed)`, `surfaceArtefact()`, `refreshLens()`, cross-store coordination _(blocked — depends on 3WS.12, 3WS.10, 3WS.11, 3WS.13)_
- [ ] **3WS.15** — `engine/generation/pipeline.ts` — replace mock culture profiles with real `WorldState` data throughout _(blocked — depends on 3WS.14)_
- [ ] **3WS.16** — End-to-end determinism verification: same seed + same position → identical artefacts _(blocked — depends on 3WS.15)_
- [ ] **3WS.17** — Explorer: chronology timeline with period boundaries _(blocked — depends on 3WS.10)_
- [ ] **3WS.18** — Explorer: culture profiles with bias summaries _(blocked — depends on 3WS.10)_
- [ ] **3WS.19** — Explorer: culture relationship graph visualisation _(blocked — depends on 3WS.10)_
- [ ] **3WS.20** — Explorer: store inspector panel — live view of `worldState`, `playerInterpretation` contents (`termState` added at 9CR.21) _(blocked — depends on 3WS.14, 3WS.19, 3WS.18, 3WS.17)_

---

## Milestone 4 — Player Interface

**Goal:** Basic UI for artefact inspection (multi-component descriptions, register switching, provenance display)

- [ ] **4UI.1** — `components/study/ArtefactInspector.svelte` — main artefact display shell (replaces `ItemGenerator.svelte`) _(blocked — depends on 3WS.15, M3)_
- [ ] **4UI.2** — `components/study/PropertyList.svelte` — ordered list of artefact properties with register-specific descriptions _(blocked — depends on 4UI.1)_
- [ ] **4UI.3** — `components/shared/TagBadge.svelte` — tag display badge component _(blocked — depends on 4UI.1)_
- [ ] **4UI.4** — `components/shared/ConfidenceBadge.svelte` — confidence level badge _(blocked — depends on 4UI.1)_
- [ ] **4UI.5** — Component list UI — materials, features, decorative layers per component _(blocked — depends on 4UI.1)_
- [ ] **4UI.6** — Provenance display — site, culture label, period, context, dating framework from corpus _(blocked — depends on 4UI.5)_
- [ ] **4UI.7** — `routes/study/+page.svelte` — artefact study workspace: generates artefact, displays inspector _(blocked — depends on 4UI.6)_
- [ ] **4UI.8** — Register switching UI — toggle between observational, interpretive, technical descriptions _(blocked — depends on 4UI.6)_
- [ ] **4UI.9** — "Generate New Artefact" action wired through `gameState.surfaceArtefact()` _(blocked — depends on 4UI.6)_

---

## Milestone 5 — Knowledge Model

**Goal:** Player's `InterpretiveModel` (observations, inferences, hypotheses), document library, evidence chains

- [ ] **5KN.1** — `engine/interpretation/claims.ts` — `createObservation(artefactId, componentRef?, decorativeRef?, content, tags, confidence, epistemicMode, register): Observation` — full `Observation` shape per doc 06 §2.1 _(blocked — depends on 4UI.6, M4)_
- [ ] **5KN.2** — `engine/interpretation/claims.ts` — `reviseObservation(id, newContent, newConfidence)` with superseded-by chain _(blocked — depends on 5KN.1)_
- [ ] **5KN.3** — `engine/interpretation/claims.ts` — `ArtefactStudy` creation: collection of observations for a single artefact _(blocked — depends on 5KN.1)_
- [ ] **5KN.4** — `playerInterpretation.svelte.ts` — full implementation: `addObservation()`, `updateObservation()`, `deleteObservation()`, `addArtefactStudy()`, reactive getters by artefact _(blocked — depends on 5KN.1)_
- [ ] **5KN.5** — `components/study/ObservationEditor.svelte` — text editor for observation notes, attached to component/group/decorative element _(blocked — depends on 5KN.4)_
- [ ] **5KN.6** — Confidence level selector (speculative/tentative/confident/certain) _(blocked — depends on 5KN.5)_
- [ ] **5KN.7** — Epistemic mode toggle (observational vs interpretive) _(blocked — depends on 5KN.5)_
- [ ] **5KN.8** — Tag assignment on observations (`FunctionTag`/`ContextTag` multi-select) _(blocked — depends on 5KN.5)_
- [ ] **5KN.9** — Observation list per artefact: view, edit, delete _(blocked — depends on 5KN.5)_
- [ ] **5KN.10** — `engine/interpretation/inference.ts` — `createInference(conclusion, evidenceChain, tags, scope, confidence): Inference` — link observations across artefacts _(blocked — depends on 5KN.1)_
- [ ] **5KN.11** — `engine/interpretation/inference.ts` — evidence chain validation: ensure all source IDs exist, roles valid _(blocked — depends on 5KN.10)_
- [ ] **5KN.12** — `engine/interpretation/claims.ts` — `createHypothesis(title, statement, supportingInferences, tags, scope, confidence): Hypothesis` _(blocked — depends on 5KN.10)_
- [ ] **5KN.13** — `engine/interpretation/claims.ts` — hypothesis status management: `active` → `challenged` → `retracted` transitions _(blocked — depends on 5KN.12)_
- [ ] **5KN.14** — `engine/interpretation/inference.ts` — `createInferenceProof(title, conclusion, chain)`: structured evidence chain with explicit assumption steps _(blocked — depends on 5KN.10)_
- [ ] **5KN.15** — `playerInterpretation.svelte.ts` extensions: `addInference()`, `addHypothesis()`, `addInferenceProof()`, `addMaterialGeneralisation()` _(blocked — depends on 5KN.10)_
- [ ] **5KN.16** — `components/study/TagSelector.svelte` — tag selection UI for observations, inferences, hypotheses _(blocked — depends on 5KN.5)_
- [ ] **5KN.17** — Inference chain builder UI: select observations across artefacts, link into evidence chain, specify roles _(blocked — depends on 5KN.15)_
- [ ] **5KN.18** — Hypothesis editor: title, statement, link supporting inferences, set confidence _(blocked — depends on 5KN.17)_
- [ ] **5KN.19** — Inference proof editor: structured evidence chain with explicit assumption steps per step _(blocked — depends on 5KN.17)_
- [ ] **5KN.20** — `engine/interpretation/claims.ts` — document type definitions (artefact studies, material generalisations, inference proofs) _(blocked — depends on 5KN.12)_
- [ ] **5KN.21** — `components/library/DocumentList.svelte` — document library listing all player documents _(blocked — depends on 5KN.20)_
- [ ] **5KN.22** — `components/library/DocumentEditor.svelte` — draft creation, commitment editing for working documents _(blocked — depends on 5KN.20)_
- [ ] **5KN.23** — `routes/library/+page.svelte` — document library route _(blocked — depends on 5KN.21)_
- [ ] **5KN.24** — `routes/library/[documentId]/+page.svelte` — individual document view/edit _(blocked — depends on 5KN.22)_
- [ ] **5KN.25** — Explorer: interpretive model viewer — browse observations, observation-to-artefact linkages, confidence levels _(blocked — depends on 5KN.4)_
- [ ] **5KN.26** — Explorer: evidence graph — observations → inferences → hypotheses with dependency edges, orphaned node highlighting _(blocked — depends on 5KN.12)_

---

## Milestone 6 — Lens System

**Goal:** Lens computation from hypotheses, presentation effects (salience, classification, framing, omission)

- [ ] **6LS.1** — `engine/lens/strength.ts` — `computeLensStrength(hypothesis, model, documents, venues): LensStrength` — dissemination (private 0, circulated 0.1, presented 0.15, submitted 0.2, published 0.3, collected 0.35), venuePrestige (0-1 multiplier), confidence (0-1), evidenceCount (log2×0.1, cap 0.3), taught (+0.2), cited (0.05/citation, cap 0.2), contradictions (-0.1 each), sabbatical (-0.15) _(blocked — depends on 5KN.12, M5)_
- [ ] **6LS.2** — `engine/lens/strength.ts` — `computeLens(model, documents, venues): LensState` — full lens state from all hypotheses _(blocked — depends on 6LS.1)_
- [ ] **6LS.3** — `engine/lens/strength.ts` — per-tag lens weights: each hypothesis contributes specific tag boosts/suppressions based on tags + strength _(blocked — depends on 6LS.1)_
- [ ] **6LS.4** — `engine/lens/strength.ts` — `computeLensWithDecay(model, documents, venues, termIndex): LensState` — natural decay (-0.02/term unpublished, -0.01/term published), contradiction pressure (-0.05/term cumulative), sabbatical flat reduction _(blocked — depends on 6LS.2)_
- [ ] **6LS.5** — `lensState.svelte.ts` — full implementation: reactive lens state, `update(newLens)`, derived per-tag weight getters _(blocked — depends on 6LS.2)_
- [ ] **6LS.6** — `engine/lens/salience.ts` — `computeSalience(artefact, lensState): ObservationSalience[]` — reorder properties by hypothesis alignment, finalWeight clamped [0.1, 3.0], below-threshold → "on closer inspection" _(blocked — depends on 6LS.5)_
- [ ] **6LS.7** — `engine/lens/classification.ts` — `adjustClassificationSuggestions(baseTags, lensState): ClassificationSuggestion[]` — boost/suppress tag scores by lens alignment _(blocked — depends on 6LS.5)_
- [ ] **6LS.8** — `engine/lens/crossReference.ts` — `computeCrossReferences(artefact, model, lensState): CrossReference[]` — related artefacts with hypothesis-biased matching, `potentiallyMisleading` flag _(blocked — depends on 6LS.5)_
- [ ] **6LS.9** — `engine/lens/framing.ts` — `selectDescriptionFrame(property, lensState, registers): DescriptionFrame` — lens selects register + within-register variant _(blocked — depends on 6LS.5)_
- [ ] **6LS.10** — `engine/lens/omission.ts` — `computeOmissions(artefact, lensState): OmissionCheck[]` — de-emphasise contradicting properties, suppression capped _(blocked — depends on 6LS.5)_
- [ ] **6LS.11** — `ArtefactPresentation` assembly update — use lens for `primaryObservations` sorting, `suggestedTags` boosting, `crossReferences` priming, description framing _(blocked — depends on 6LS.6, 6LS.7, 6LS.8, 6LS.9, 6LS.10)_
- [ ] **6LS.12** — Description update on re-inspection — descriptions change when player revisits artefacts after forming hypotheses _(blocked — depends on 6LS.11)_
- [ ] **6LS.13** — "On closer inspection" expandable section for low-salience properties _(blocked — depends on 6LS.11)_
- [ ] **6LS.14** — Cross-reference suggestions panel _(blocked — depends on 6LS.8)_
- [ ] **6LS.15** — Raw data drill-down toggle — bypass lens to see unfiltered properties _(blocked — depends on 6LS.11)_
- [ ] **6LS.16** — Explorer: lens state panel — current weights per tag, contributing hypotheses, strength formula breakdown _(blocked — depends on 6LS.5, 6LS.3)_
- [ ] **6LS.17** — Explorer: lens diff panel — side-by-side lens-on vs lens-off, salience changes, tag adjustments, suppressed properties _(blocked — depends on 6LS.11)_

---

## Milestone 7 — Contradictions

**Goal:** Contradiction detection (player vs world + corpus), strain accumulation, diegetic surfacing, retcon flow

- [ ] **7CD.1** — `engine/contradiction/detection.ts` — `detectContradictions(artefact, model, worldState, corpus): Contradiction[]` — agent-generic detector _(blocked — depends on 6LS.5, M6)_
- [ ] **7CD.2** — `engine/contradiction/detection.ts` — material contradiction rules (agent claims culture doesn't use material X, but artefact from that culture contains it) _(blocked — depends on 7CD.1)_
- [ ] **7CD.3** — `engine/contradiction/detection.ts` — temporal contradiction rules (chronology conflicts with stratigraphic evidence) _(blocked — depends on 7CD.1)_
- [ ] **7CD.4** — `engine/contradiction/detection.ts` — cultural contradiction rules (agent's `CulturalClaim`s about a culture contradicted by new artefact evidence; MVP substitutes `CulturalClaim` for the post-MVP cultural-profile document — see Beyond MVP) _(blocked — depends on 7CD.1)_
- [ ] **7CD.5** — `engine/contradiction/detection.ts` — structural contradiction rules (inference chain logical impossibility) _(blocked — depends on 7CD.1)_
- [ ] **7CD.6** — `engine/contradiction/detection.ts` — provenance contradiction rules (context attribution conflicts with origin) _(blocked — depends on 7CD.1)_
- [ ] **7CD.7** — `engine/contradiction/detection.ts` — corpus contradiction rules (agent claims vs professional consensus — NB: corpus may be wrong) _(blocked — depends on 7CD.1)_
- [ ] **7CD.8** — `engine/contradiction/detection.ts` — rarity contradiction rules (perceived rarity diverges from occluded distribution) _(blocked — depends on 7CD.1)_
- [ ] **7CD.9** — `engine/contradiction/detection.ts` — material provenance contradiction rules (wrong explanation for material presence despite correct identification) _(blocked — depends on 7CD.1)_
- [ ] **7CD.10** — `engine/contradiction/detection.ts` — severity scoring: `minor`/`moderate`/`major`/`critical` based on type, evidence weight, stakes _(blocked — depends on 7CD.1)_
- [ ] **7CD.11** — `engine/contradiction/detection.ts` — epistemic mode sensitivity: interpretive-mode observations more contradiction-prone than observational-mode _(blocked — depends on 7CD.1)_
- [ ] **7CD.12** — `engine/contradiction/strain.ts` — `accumulateStrain(model, termIndex): Map<string, HypothesisStrain>` — per-hypothesis strain from reinterpretations, partial mismatches, missing evidence, peer doubt _(blocked — depends on 7CD.1)_
- [ ] **7CD.13** — `engine/contradiction/strain.ts` — strain threshold: exceeded → hypothesis "stressed", increases surfacing frequency and severity _(blocked — depends on 7CD.12)_
- [ ] **7CD.14** — `engine/contradiction/strain.ts` — decorative mismatch strain: motif outside expected cultural context adds small strain per occurrence _(blocked — depends on 7CD.12)_
- [ ] **7CD.15** — `engine/contradiction/surfacing.ts` — `selectSurfacingChannel(contradiction, channels): DiegeticSurface` — choose channel by type _(blocked — depends on 7CD.10)_
- [ ] **7CD.16** — `engine/contradiction/surfacing.ts` — `impossible-artefact` channel: wrap a detected contradiction as a `DiegeticSurface` referencing the triggering artefact (`artefactId` + `anomaly` per doc 06 §4.5); no artefact generation here _(blocked — depends on 7CD.15)_
- [ ] **7CD.17** — `engine/contradiction/surfacing.ts` — `field-report` channel: site finding that contradicts expectation _(blocked — depends on 7CD.15)_
- [ ] **7CD.18** — `engine/contradiction/surfacing.ts` — escalation: unresolved contradictions increase surfacing frequency per term _(blocked — depends on 7CD.15)_
- [ ] **7CD.19** — `engine/contradiction/resolution.ts` — `traceAffectedChain(contradiction, model): { proofId, brokenStep, affectedDocuments }` — identify challenged proof steps _(blocked — depends on 7CD.15)_
- [ ] **7CD.20** — `engine/contradiction/resolution.ts` — `resolve(contradiction, resolution, explanation): Resolution` — revise/reinterpret/reject _(blocked — depends on 7CD.19)_
- [ ] **7CD.21** — `engine/contradiction/resolution.ts` — revision cascades: revising hypothesis updates all dependent documents _(blocked — depends on 7CD.20)_
- [ ] **7CD.22** — `engine/contradiction/resolution.ts` — `RevisionRecord` creation on each resolution _(blocked — depends on 7CD.20)_
- [ ] **7CD.23** — `engine/contradiction/resolution.ts` — reinterpret strain: each reinterpretation of same hypothesis adds hidden strain _(blocked — depends on 7CD.20)_
- [ ] **7CD.24** — `engine/contradiction/resolution.ts` — reject credibility cost: rejecting evidence costs credibility, increases future contradiction pressure _(blocked — depends on 7CD.20)_
- [ ] **7CD.25** — `playerInterpretation.svelte.ts` extensions: `addContradiction()`, `updateStrain()`, contradiction queue reactive getters _(blocked — depends on 7CD.12)_
- [ ] **7CD.26** — `components/contradiction/ContradictionQueue.svelte` — list of queued contradictions with severity indicators _(blocked — depends on 7CD.25)_
- [ ] **7CD.27** — `components/contradiction/ContradictionDetail.svelte` — full view: evidence, trace to proof steps _(blocked — depends on 7CD.19)_
- [ ] **7CD.28** — `components/contradiction/RetconFlow.svelte` — step-by-step resolution: acknowledge → trace → decide → cascade → record _(blocked — depends on 7CD.20)_
- [ ] **7CD.29** — Cascade visualisation — show affected documents before confirming revision _(blocked — depends on 7CD.28)_
- [ ] **7CD.30** — Resolution outcome display — what changed and why _(blocked — depends on 7CD.28)_
- [ ] **7CD.31** — Explorer: contradiction inspector — queue with type, severity, strain levels, ground truth comparison _(blocked — depends on 7CD.25)_
- [ ] **7CD.32** — Explorer: surfacing log — chronological record of surfacing events, retcon history with cascade traces _(blocked — depends on 7CD.15, 7CD.22)_

---

## Milestone 8 — Persistence

**Goal:** Save/load infrastructure with IndexedDB, schema versioning, auto-save

- [ ] **8PS.1** — `persistence/serialisation.ts` — `serialiseMap` / `deserialiseMap` utilities for `Map<K,V>` → `[K,V][]` round-tripping _(blocked — depends on 7CD.25, M7)_
- [ ] **8PS.2** — `persistence/serialisation.ts` — `serialiseGameState(state): SaveFile` — full state serialisation (worldState, playerInterpretation, termState; contradiction queue serialised within playerInterpretation; lensState recomputed on load, not persisted) _(blocked — depends on 8PS.1)_
- [ ] **8PS.3** — `persistence/serialisation.ts` — `deserialiseGameState(save): GameState` — full state deserialisation _(blocked — depends on 8PS.2)_
- [ ] **8PS.4** — `persistence/schema.ts` — re-export `SaveFile` and `CURRENT_SAVE_VERSION` from `src/lib/types/save.ts` (canonical home per 1FD.33); add save metadata shape _(blocked — depends on 8PS.1)_
- [ ] **8PS.5** — `persistence/schema.ts` — schema migration: `migrations: Record<number, Migration>`, `migrateSave(save): SaveFile` — sequential migration runner _(blocked — depends on 8PS.4)_
- [ ] **8PS.6** — `persistence/indexeddb.ts` — `saveToIndexedDB(save)`, `loadFromIndexedDB(): SaveFile`, `listSaves()`, `deleteSave(id)` _(blocked — depends on 8PS.2)_
- [ ] **8PS.7** — `persistence/indexeddb.ts` — auto-save: debounced 5-second write on significant player actions _(blocked — depends on 8PS.6)_
- [ ] **8PS.8** — Save/load UI — save button, load button, save slot list _(blocked — depends on 8PS.6)_
- [ ] **8PS.9** — Auto-save indicator _(blocked — depends on 8PS.7)_
- [ ] **8PS.10** — Explorer: persistence inspector — serialised state size, schema version, round-trip diff, export raw JSON _(blocked — depends on 8PS.5, 8PS.3)_

---

## Milestone 9 — Career & Publication

**Goal:** Document tradition system (lineage, dissemination, venues), reputation, publication effects on lens, career progression

- [ ] **9CR.1** — `engine/documents/lineage.ts` — document lineage graph: create, query parent/child, compute derivation chains _(blocked — depends on 8PS.5, M8)_
- [ ] **9CR.2** — `engine/documents/dissemination.ts` — `advanceDissemination(documentId, newState, venueId?, worldState): DisseminationResult` — state machine (private → circulated → submitted → published) _(blocked — depends on 9CR.1)_
- [ ] **9CR.3** — `engine/documents/commitments.ts` — `extractCommitments(model, hypothesisIds): string[]` — derive commitments from player's claims for document creation _(blocked — depends on 9CR.1)_
- [ ] **9CR.4** — `engine/documents/form.ts` — `classifyDocumentForm(inputs): { formLabel, formConfidence }` — weighted rule matching _(blocked — depends on 9CR.1)_
- [ ] **9CR.35** — `engine/documents/retraction.ts` — `retractDocument(documentId, scope, worldState): Retraction` — flag node retracted, create `Retraction` record (full/partial per doc 10 §7) _(blocked — depends on 9CR.2)_
- [ ] **9CR.36** — `engine/documents/retraction.ts` — `traceTaintedLineage(retractedDocId, lineageGraph): TaintedLineage[]` — descendant cascade per doc 10 §7.1 (clean/defensible/tainted descendants) _(blocked — depends on 9CR.1, 9CR.35)_
- [ ] **9CR.37** — Retraction UI — retract action on disseminated documents with tainted-lineage audit view _(blocked — depends on 9CR.36)_
- [ ] **9CR.38** — `engine/documents/perception.ts` — `initialisePerception(doc)` on first transition beyond `private`; `updatePerception(doc, worldState)` at term boundaries maintaining `audienceReach`, `takeawayDivergence`, `citationCount` (doc 10 §8/§11); feeds 6LS.1's citation input and 9CR.14's retraction cost _(blocked — depends on 9CR.2)_
- [ ] **9CR.5** — `engine/documents/venues.ts` — `generateVenues(world, prng): VenueDefinition[]` — 3-5 venues with structural properties (containerModel, temporalMode, editorialProcess, audienceEncounter, scope) _(blocked — depends on 9CR.1)_
- [ ] **9CR.6** — `engine/documents/venues.ts` — venue prestige computation from properties (editorial rigour × scope × reach × establishment) _(blocked — depends on 9CR.5)_
- [ ] **9CR.7** — `engine/career/reputation.ts` — `Reputation` computation: five dimensions (rigour, breadth, originality, reliability, influence) with weighted composite `overall` _(blocked — depends on 9CR.2)_
- [ ] **9CR.8** — `engine/career/reputation.ts` — `applyReputationModifier(reputation, modifier): Reputation` — apply event-driven changes with decay _(blocked — depends on 9CR.7)_
- [ ] **9CR.9** — `engine/career/reputation.ts` — reputation change table implementation: all events from doc 07 (publish, retract, cite, resolve contradiction, etc.) _(blocked — depends on 9CR.7)_
- [ ] **9CR.10** — `engine/career/reputation.ts` — `ReputationGate` evaluation: check dimension thresholds for activity gating _(blocked — depends on 9CR.7)_
- [ ] **9CR.11** — `engine/career/events.ts` — `DisseminationCareerEffect` generation: reputation effects scaled by venue properties per dissemination transition _(blocked — depends on 9CR.7)_
- [ ] **9CR.12** — Claim magnitude system: `ClaimMagnitude` determination (confirmation/extension/challenge/novel) relative to professional corpus _(blocked — depends on 9CR.7)_
- [ ] **9CR.13** — Publication effects on lens strength: dissemination state graduated contribution (private 0, circulated 0.1, presented 0.15, submitted 0.2, published 0.3, collected 0.35) × venue prestige _(blocked — depends on 9CR.6)_
- [ ] **9CR.14** — `engine/career/reputation.ts` — retraction reputation cost implementation _(blocked — depends on 9CR.7, 9CR.35, 9CR.38)_
- [ ] **9CR.15** — `engine/career/progression.ts` — `evaluateCareerProgress(scholar, worldState, termIndex): CareerEvent[]` — role advancement checks at term boundaries _(blocked — depends on 9CR.7)_
- [ ] **9CR.16** — `engine/career/progression.ts` — `RoleRequirement` evaluation: reputation, published docs, min venue prestige, min terms in role (activities requirement stubbed for MVP: junior-lecturer uses `activities: []`; activity execution is deferred post-MVP per doc 07 §7) _(blocked — depends on 9CR.15)_
- [ ] **9CR.17** — `engine/career/progression.ts` — background drain profiles per role: postdoc (0), junior lecturer (2.0/week), senior lecturer (3.5), reader (4.0), professor (5.0) — sub-components (teaching, admin, supervision) _(blocked — depends on 9CR.15)_
- [ ] **9CR.18** — `engine/career/progression.ts` — `calculateBaseEnergy(scholar): number` — base energy from role and career state _(blocked — depends on 9CR.17)_
- [ ] **9CR.19** — `engine/career/progression.ts` — `calculateEnergyCarryOver(remaining): number` — carry-over between terms _(blocked — depends on 9CR.17)_
- [ ] **9CR.20** — `engine/career/progression.ts` — `getTermType(termIndex): TermType` — derive term type from index position in year cycle _(blocked — depends on 9CR.15)_
- [ ] **9CR.39** — Dating commissioning — `commissionDating(artefactId, worldState)` gated by `ReputationGate` (doc 09 Phase 21: dating facility access at appropriate career stages); returns independent dating from the world's dating framework, giving the player a route to challenge wrong corpus frameworks (doc 06) _(blocked — depends on 9CR.10)_
- [ ] **9CR.21** — `src/lib/stores/termState.svelte.ts` — full term state: currentTermIndex, absoluteWeek, termType, weekCapacity, weeksAllocated, energyBudget, energyRemaining, backgroundDrains, completedActions, activeActivities _(blocked — depends on 9CR.17)_
- [ ] **9CR.22** — Term boundary orchestration in `gameState`: `completeTerm()` — advance dissemination, update document perception, accumulate strain, recompute lens with decay, career checks, venue cycles, energy replenishment _(blocked — depends on 9CR.21, 9CR.38)_
- [ ] **9CR.23** — Summer-research term: correctly exclude teaching drains, higher effective energy budget _(blocked — depends on 9CR.20)_
- [ ] **9CR.24** — Sabbatical engine hooks: career-state flag zeroes all background drains for the term and feeds the -0.15 lens modifier consumed by 6LS.1/6LS.4; no player-facing availability in MVP (Reader/Professor gating and cooldown are post-MVP — see Beyond MVP) _(blocked — depends on 9CR.20)_
- [ ] **9CR.25** — `worldState.svelte.ts` extensions: `addDocument()`, `updateDocument()`, `addCareerEvent()`, `updateScholarReputation()`, document + venue reactive getters _(blocked — depends on 9CR.2)_
- [ ] **9CR.26** — `components/library/VenueSelector.svelte` — submission target selection with venue properties display _(blocked — depends on 9CR.5)_
- [ ] **9CR.27** — Document derivation UI: create communicative document from working documents, review inherited commitments _(blocked — depends on 9CR.3)_
- [ ] **9CR.28** — `components/career/ReputationDashboard.svelte` — five dimension display with modifiers _(blocked — depends on 9CR.7)_
- [ ] **9CR.29** — `components/career/EventLog.svelte` — career event history display _(blocked — depends on 9CR.11)_
- [ ] **9CR.30** — `routes/career/+page.svelte` — career dashboard route _(blocked — depends on 9CR.28)_
- [ ] **9CR.31** — Term dashboard — current term, energy remaining, weeks remaining, active drains _(blocked — depends on 9CR.21)_
- [ ] **9CR.32** — Role advancement notification (diegetic: letter of appointment) _(blocked — depends on 9CR.15)_
- [ ] **9CR.33** — Explorer: reputation dashboard — five dimensions as live values, publication history with claim magnitude _(blocked — depends on 9CR.7, 9CR.12)_
- [ ] **9CR.34** — Explorer: career state panel — current role, active drains, energy budget breakdown, progression thresholds _(blocked — depends on 9CR.18, 9CR.16)_

---

## Milestone 10 — NPC Systems

**Goal:** NPC peer review, alternative interpretations, social channels (peer letters, student questions), relationship dynamics

- [ ] **10NP.1** — `engine/career/peerReview.ts` — `generatePeerReview(document, reviewer, worldState, noise): PeerReviewCareerEvent` — compare commitments against world state (with noise), reviewer's model, reviewer's bias _(blocked — depends on 9CR.12, M9)_
- [ ] **10NP.2** — `engine/career/peerReview.ts` — `ReviewerFeedback` generation: diegetic assessment text, methodological concerns, commitments disputed/endorsed _(blocked — depends on 10NP.1)_
- [ ] **10NP.3** — `engine/career/peerReview.ts` — review outcome determination: accepted / revisions-requested / rejected based on commitment match, evidence quality, venue fit _(blocked — depends on 10NP.1)_
- [ ] **10NP.4** — `engine/career/peerReview.ts` — reviewer selection: choose from NPC pool based on specialism alignment with document scope _(blocked — depends on 10NP.1)_
- [ ] **10NP.5** — `engine/career/npc.ts` — `generateNpcInterpretation(artefact, scholar, worldState): ArtefactStudy` — alternative reading grounded in NPC's model and corpus _(blocked — depends on 10NP.1)_
- [ ] **10NP.6** — `engine/career/npc.ts` — NPC interpretation difference detection: where NPC and player diverge and why (cultural attribution, tag emphasis, material significance) _(blocked — depends on 10NP.5)_
- [ ] **10NP.7** — `engine/career/reputation.ts` — over-citation penalty: track citation frequency per NPC, originality drain when ratio exceeds threshold _(blocked — depends on 10NP.1)_
- [ ] **10NP.8** — `engine/career/npc.ts` — `generatePeerChallenge(contradiction, scholar): DiegeticSurface` — peer letter channel, challenge references NPC's own published commitments _(blocked — depends on 10NP.5)_
- [ ] **10NP.9** — `engine/career/npc.ts` — `generateStudentQuestion(hypothesis, proof, worldState): DiegeticSurface` — target weakest proof step with naive but pointed question _(blocked — depends on 10NP.5)_
- [ ] **10NP.10** — `engine/career/npc.ts` — NPC relationship evolution: respect/agreement deltas from review outcomes, citation patterns, published agreement/disagreement _(blocked — depends on 10NP.1)_
- [ ] **10NP.11** — `engine/career/npc.ts` — reviewer memory: reviewer who previously rejected brings context to new submissions _(blocked — depends on 10NP.3)_
- [ ] **10NP.12** — Peer review as `ActivityType`: time/energy cost (2-3 weeks, 8 + 2/week), exposes alternative interpretations _(blocked — depends on 10NP.1)_
- [ ] **10NP.13** — Student supervision as `ActivityType`: time/energy cost (8-12 weeks, 5 + 1/week), generates student questions targeting weak proofs _(blocked — depends on 10NP.9)_
- [ ] **10NP.14** — `worldState.svelte.ts` extensions: `updateScholarRelationship()`, peer review event tracking, NPC relationship scores (respect/agreement per NPC) _(blocked — depends on 10NP.10)_
- [ ] **10NP.15** — `components/career/NpcInteraction.svelte` — peer review display: reviewer feedback, disputed/endorsed commitments _(blocked — depends on 10NP.2)_
- [ ] **10NP.16** — NPC interpretation comparison view: player's reading vs NPC's reading side by side _(blocked — depends on 10NP.6)_
- [ ] **10NP.17** — Peer letter display: diegetic NPC challenge correspondence _(blocked — depends on 10NP.8)_
- [ ] **10NP.18** — Student question display: diegetic student inquiry _(blocked — depends on 10NP.9)_
- [ ] **10NP.19** — NPC relationship indicators in career dashboard _(blocked — depends on 10NP.14)_
- [ ] **10NP.20** — Venue form reclassification: `FormReclassificationEvent` with direction (downward/upward/lateral), editor correspondence _(blocked — depends on 10NP.3)_
- [ ] **10NP.21** — Explorer: NPC panel — reviewer pool with bias profiles, interpretation diffs per artefact _(blocked — depends on 10NP.4, 10NP.6)_
- [ ] **10NP.22** — Explorer: citation balance tracker, relationship score history per NPC _(blocked — depends on 10NP.10, 10NP.7)_
- [ ] **10NP.23** — Explorer: student question targeting view (which proof steps probed and why) _(blocked — depends on 10NP.9)_

---

## Dependency Diagram

```mermaid
graph LR
	classDef todo fill:#f6f6f6,stroke:#6f6f6f,color:#6f6f6f
	classDef blocked fill:#fff8f6,stroke:#e0002b,color:#e0002b,stroke-width:2px
	classDef paused fill:#fdf4ff,stroke:#b01fe3,color:#b01fe3,stroke-dasharray:4 3
	classDef deferred fill:#fff8f3,stroke:#ac5c00,color:#ac5c00,stroke-dasharray:2 4,font-style:italic
	classDef done fill:#e0ffd9,stroke:#008217,color:#008217
	classDef outOfScope fill:#f6f6f6,stroke:#e2e2e2,color:#e2e2e2,stroke-dasharray:2 2
	classDef mile fill:#e3f7ff,stroke:#007590,color:#007590,font-weight:bold
	classDef external fill:#fff9e5,stroke:#7d6f00,color:#7d6f00,stroke-dasharray:4 3,font-style:italic
	1FD.1["1FD.1: Create `deno.json` with tasks, compilerO…"]
	1FD.2["1FD.2: Swap `adapter-node` for `@deno/svelte-ad…"]
	1FD.3["1FD.3: Strip Node tooling (`.prettierrc`, `.pre…"]
	1FD.4["1FD.4: Verify npm deps via `npm:` specifiers (S…"]
	1FD.5["1FD.5: Verify `deno task dev` serves app, `deno…"]
	1FD.6["1FD.6: Implement `src/lib/engine/prng.ts` — xos…"]
	1FD.7["1FD.7: Write `weightedSelect(items, prng)` util…"]
	1FD.8["1FD.8: Write PRNG determinism test — same seed…"]
	1FD.9["1FD.9: Write PRNG distribution test — output ap…"]
	1FD.12["1FD.12: `src/lib/types/tags.ts` — `FunctionTag`…"]
	1FD.10["1FD.10: `src/lib/types/grammar.ts` — `GrammarRu…"]
	1FD.11["1FD.11: `src/lib/types/artefact.ts` — `Normalis…"]
	1FD.13["1FD.13: `src/lib/types/decoration.ts` — `Decora…"]
	1FD.14["1FD.14: `src/lib/types/world.ts` — `WorldSeed`,…"]
	1FD.15["1FD.15: `src/lib/types/world.ts` — `MaterialFlo…"]
	1FD.16["1FD.16: `src/lib/types/world.ts` — `SiteType`,…"]
	1FD.18["1FD.18: `src/lib/types/interpretation.ts` — `Co…"]
	1FD.19["1FD.19: `src/lib/types/interpretation.ts` — `Me…"]
	1FD.21["1FD.21: `src/lib/types/documents.ts` — `Documen…"]
	1FD.23["1FD.23: `src/lib/types/venues.ts` — `VenueDefin…"]
	1FD.40["1FD.40: `src/lib/types/venues.ts` — `VenueTempo…"]
	1FD.26["1FD.26: `src/lib/types/career.ts` — `Reputation…"]
	1FD.32["1FD.32: `src/lib/types/visibility.ts` — `Proper…"]
	1FD.17["1FD.17: `src/lib/types/world.ts` — `DatingFrame…"]
	1FD.28["1FD.28: `src/lib/types/term.ts` — `TermType`, `…"]
	1FD.20["1FD.20: `src/lib/types/lens.ts` — `LensStrength…"]
	1FD.24["1FD.24: `src/lib/types/contradiction.ts` — `Con…"]
	1FD.25["1FD.25: `src/lib/types/contradiction.ts` — `Con…"]
	1FD.29["1FD.29: `src/lib/types/scholars.ts` — `MinimalS…"]
	1FD.30["1FD.30: `src/lib/types/corpus.ts` — `Profession…"]
	1FD.31["1FD.31: `src/lib/types/description.ts` — `Descr…"]
	1FD.22["1FD.22: `src/lib/types/documents.ts` — `Dissemi…"]
	1FD.27["1FD.27: `src/lib/types/career.ts` — `RoleRequir…"]
	1FD.33["1FD.33: `src/lib/types/save.ts` — `SaveFile`, `…"]
	1FD.34["1FD.34: Configure `deno test`, verify runner ex…"]
	1FD.35["1FD.35: Create test fixture helpers — mock cult…"]
	1FD.36["1FD.36: Create route `/dev/explorer` with layou…"]
	1FD.39["1FD.39: Type index panel — list all registered…"]
	1FD.37["1FD.37: Seed input field component (route-priva…"]
	1FD.38["1FD.38: PRNG output display (child route `prng/…"]
	M1["M1: Foundation"]:::mile
	2GN.11["2GN.11: `src/lib/data/plausibility.ts` — plausi…"]
	2GN.22["2GN.22: `src/lib/data/materials.ts` — material…"]
	2GN.28["2GN.28: `src/lib/data/decorations.ts` — decorat…"]
	2GN.35["2GN.35: `src/lib/data/descriptions/observationa…"]
	2GN.36["2GN.36: `src/lib/data/descriptions/interpretive…"]
	2GN.37["2GN.37: `src/lib/data/descriptions/technical/`…"]
	2GN.66["2GN.66: `src/lib/data/names/` — naming grammars…"]
	2GN.1["2GN.1: `src/lib/data/grammars/primitives.ts` —…"]
	2GN.2["2GN.2: `src/lib/data/grammars/core.ts` — MVP co…"]
	2GN.3["2GN.3: `engine/generation/grammar.ts` — `expand…"]
	2GN.4["2GN.4: `engine/generation/grammar.ts` — `select…"]
	2GN.5["2GN.5: `engine/generation/grammar.ts` — `phaseI…"]
	2GN.7["2GN.7: `engine/generation/grammar.ts` — complex…"]
	2GN.6["2GN.6: `engine/generation/grammar.ts` — accumul…"]
	2GN.8["2GN.8: `engine/generation/grammar.ts` — normali…"]
	2GN.9["2GN.9: `engine/generation/grammar.ts` — `derive…"]
	2GN.10["2GN.10: `engine/generation/grammar.ts` — `allow…"]
	2GN.12["2GN.12: `engine/generation/plausibility.ts` — `…"]
	2GN.13["2GN.13: `engine/generation/plausibility.ts` — p…"]
	2GN.14["2GN.14: `engine/generation/plausibility.ts` — e…"]
	2GN.15["2GN.15: `engine/generation/plausibility.ts` — m…"]
	2GN.16["2GN.16: `engine/generation/plausibility.ts` — r…"]
	2GN.17["2GN.17: `src/lib/data/classification.ts` — clas…"]
	2GN.19["2GN.19: `engine/generation/classification.ts` —…"]
	2GN.20["2GN.20: `engine/generation/classification.ts` —…"]
	2GN.21["2GN.21: `engine/generation/classification.ts` —…"]
	2GN.23["2GN.23: `engine/generation/materials.ts` — `ass…"]
	2GN.24["2GN.24: `engine/generation/materials.ts` — `isA…"]
	2GN.25["2GN.25: `engine/generation/materials.ts` — `com…"]
	2GN.26["2GN.26: `engine/generation/materials.ts` — `Mat…"]
	2GN.27["2GN.27: `engine/generation/materials.ts` — mate…"]
	2GN.29["2GN.29: `engine/generation/decoration.ts` — dec…"]
	2GN.30["2GN.30: `engine/generation/decoration.ts` — mat…"]
	2GN.31["2GN.31: `engine/generation/decoration.ts` — lay…"]
	2GN.32["2GN.32: `engine/generation/decoration.ts` — rec…"]
	2GN.33["2GN.33: `engine/generation/decoration.ts` — mot…"]
	2GN.34["2GN.34: `engine/generation/classification.ts` —…"]
	2GN.38["2GN.38: `engine/generation/description.ts` — `g…"]
	2GN.39["2GN.39: `engine/generation/description.ts` — te…"]
	2GN.40["2GN.40: `engine/generation/description.ts` — pe…"]
	2GN.41["2GN.41: `engine/generation/description.ts` — pe…"]
	2GN.42["2GN.42: `engine/generation/description.ts` — `p…"]
	2GN.43["2GN.43: `engine/generation/description.ts` — pr…"]
	2GN.44["2GN.44: `engine/generation/excavation.ts` — exc…"]
	2GN.45["2GN.45: `engine/generation/excavation.ts` — amb…"]
	2GN.46["2GN.46: `engine/generation/excavation.ts` — sof…"]
	2GN.47["2GN.47: `engine/generation/excavation.ts` — pro…"]
	2GN.48["2GN.48: `engine/world/scholars.ts` — `generateN…"]
	2GN.49["2GN.49: `engine/world/scholars.ts` — NPC `Inter…"]
	2GN.50["2GN.50: `engine/generation/corpus.ts` — `simula…"]
	2GN.51["2GN.51: `engine/generation/corpus.ts` — `genera…"]
	2GN.52["2GN.52: `engine/generation/corpus.ts` — coverag…"]
	2GN.53["2GN.53: `engine/generation/corpus.ts` — `aggreg…"]
	2GN.54["2GN.54: `engine/generation/corpus.ts` — dating…"]
	2GN.55["2GN.55: `engine/generation/corpus.ts` — calibra…"]
	2GN.67["2GN.67: `engine/generation/grammar.ts` — arrang…"]
	2GN.56["2GN.56: `engine/generation/pipeline.ts` — `runG…"]
	2GN.57["2GN.57: Explorer: structure viewer tab — genera…"]
	2GN.58["2GN.58: Explorer: plausibility panel — generate…"]
	2GN.59["2GN.59: Explorer: tag inspector — tag map as sc…"]
	2GN.60["2GN.60: Explorer: material viewer — resolved ma…"]
	2GN.61["2GN.61: Explorer: decoration inspector — decora…"]
	2GN.62["2GN.62: Explorer: description viewer — three-re…"]
	2GN.63["2GN.63: Explorer: excavation viewer — artefacts…"]
	2GN.64["2GN.64: Explorer: corpus browser — NPC research…"]
	2GN.65["2GN.65: Explorer: pipeline stage viewer — stage…"]
	M2["M2: Generation Pipeline"]:::mile
	3WS.1["3WS.1: `engine/world/seed.ts` — `createWorldSee…"]
	3WS.2["3WS.2: `engine/world/chronology.ts` — `generate…"]
	3WS.3["3WS.3: `engine/world/culture.ts` — `generateCul…"]
	3WS.4["3WS.4: `engine/world/culture.ts` — `generatePha…"]
	3WS.5["3WS.5: `engine/world/culture.ts` — `generateRel…"]
	3WS.6["3WS.6: `engine/world/culture.ts` — `MaterialFlo…"]
	3WS.7["3WS.7: `engine/world/seed.ts` — geological cont…"]
	3WS.8["3WS.8: `engine/world/culture.ts` — motif vocabu…"]
	3WS.9["3WS.9: `engine/world/seed.ts` — `createWorld(se…"]
	3WS.10["3WS.10: `src/lib/stores/worldState.svelte.ts` —…"]
	3WS.11["3WS.11: `src/lib/stores/playerInterpretation.sv…"]
	3WS.12["3WS.12: `src/lib/stores/lensState.svelte.ts` —…"]
	3WS.13["3WS.13: `src/lib/stores/ui.svelte.ts` — UI stat…"]
	3WS.14["3WS.14: `src/lib/stores/gameState.svelte.ts` —…"]
	3WS.15["3WS.15: `engine/generation/pipeline.ts` — repla…"]
	3WS.16["3WS.16: End-to-end determinism verification: sa…"]
	3WS.17["3WS.17: Explorer: chronology timeline with peri…"]
	3WS.18["3WS.18: Explorer: culture profiles with bias su…"]
	3WS.19["3WS.19: Explorer: culture relationship graph vi…"]
	3WS.20["3WS.20: Explorer: store inspector panel — live…"]
	M3["M3: World State & Integration"]:::mile
	4UI.1["4UI.1: `components/study/ArtefactInspector.svel…"]
	4UI.2["4UI.2: `components/study/PropertyList.svelte` —…"]
	4UI.3["4UI.3: `components/shared/TagBadge.svelte` — ta…"]
	4UI.4["4UI.4: `components/shared/ConfidenceBadge.svelt…"]
	4UI.5["4UI.5: Component list UI — materials, features,…"]
	4UI.6["4UI.6: Provenance display — site, culture label…"]
	4UI.7["4UI.7: `routes/study/+page.svelte` — artefact s…"]
	4UI.8["4UI.8: Register switching UI — toggle between o…"]
	4UI.9["4UI.9: #quot;Generate New Artefact#quot; action wired thr…"]
	M4["M4: Player Interface"]:::mile
	5KN.1["5KN.1: `engine/interpretation/claims.ts` — `cre…"]
	5KN.2["5KN.2: `engine/interpretation/claims.ts` — `rev…"]
	5KN.3["5KN.3: `engine/interpretation/claims.ts` — `Art…"]
	5KN.4["5KN.4: `playerInterpretation.svelte.ts` — full…"]
	5KN.5["5KN.5: `components/study/ObservationEditor.svel…"]
	5KN.6["5KN.6: Confidence level selector (speculative/t…"]
	5KN.7["5KN.7: Epistemic mode toggle (observational vs…"]
	5KN.8["5KN.8: Tag assignment on observations (`Functio…"]
	5KN.9["5KN.9: Observation list per artefact: view, edi…"]
	5KN.10["5KN.10: `engine/interpretation/inference.ts` —…"]
	5KN.11["5KN.11: `engine/interpretation/inference.ts` —…"]
	5KN.12["5KN.12: `engine/interpretation/claims.ts` — `cr…"]
	5KN.13["5KN.13: `engine/interpretation/claims.ts` — hyp…"]
	5KN.14["5KN.14: `engine/interpretation/inference.ts` —…"]
	5KN.15["5KN.15: `playerInterpretation.svelte.ts` extens…"]
	5KN.16["5KN.16: `components/study/TagSelector.svelte` —…"]
	5KN.17["5KN.17: Inference chain builder UI: select obse…"]
	5KN.18["5KN.18: Hypothesis editor: title, statement, li…"]
	5KN.19["5KN.19: Inference proof editor: structured evid…"]
	5KN.20["5KN.20: `engine/interpretation/claims.ts` — doc…"]
	5KN.21["5KN.21: `components/library/DocumentList.svelte…"]
	5KN.22["5KN.22: `components/library/DocumentEditor.svel…"]
	5KN.23["5KN.23: `routes/library/+page.svelte` — documen…"]
	5KN.24["5KN.24: `routes/library/[documentId]/+page.svel…"]
	5KN.25["5KN.25: Explorer: interpretive model viewer — b…"]
	5KN.26["5KN.26: Explorer: evidence graph — observations…"]
	M5["M5: Knowledge Model"]:::mile
	6LS.1["6LS.1: `engine/lens/strength.ts` — `computeLens…"]
	6LS.2["6LS.2: `engine/lens/strength.ts` — `computeLens…"]
	6LS.3["6LS.3: `engine/lens/strength.ts` — per-tag lens…"]
	6LS.4["6LS.4: `engine/lens/strength.ts` — `computeLens…"]
	6LS.5["6LS.5: `lensState.svelte.ts` — full implementat…"]
	6LS.6["6LS.6: `engine/lens/salience.ts` — `computeSali…"]
	6LS.7["6LS.7: `engine/lens/classification.ts` — `adjus…"]
	6LS.8["6LS.8: `engine/lens/crossReference.ts` — `compu…"]
	6LS.9["6LS.9: `engine/lens/framing.ts` — `selectDescri…"]
	6LS.10["6LS.10: `engine/lens/omission.ts` — `computeOmi…"]
	6LS.11["6LS.11: `ArtefactPresentation` assembly update…"]
	6LS.12["6LS.12: Description update on re-inspection — d…"]
	6LS.13["6LS.13: #quot;On closer inspection#quot; expandable secti…"]
	6LS.14["6LS.14: Cross-reference suggestions panel"]
	6LS.15["6LS.15: Raw data drill-down toggle — bypass len…"]
	6LS.16["6LS.16: Explorer: lens state panel — current we…"]
	6LS.17["6LS.17: Explorer: lens diff panel — side-by-sid…"]
	M6["M6: Lens System"]:::mile
	7CD.1["7CD.1: `engine/contradiction/detection.ts` — `d…"]
	7CD.2["7CD.2: `engine/contradiction/detection.ts` — ma…"]
	7CD.3["7CD.3: `engine/contradiction/detection.ts` — te…"]
	7CD.4["7CD.4: `engine/contradiction/detection.ts` — cu…"]
	7CD.5["7CD.5: `engine/contradiction/detection.ts` — st…"]
	7CD.6["7CD.6: `engine/contradiction/detection.ts` — pr…"]
	7CD.7["7CD.7: `engine/contradiction/detection.ts` — co…"]
	7CD.8["7CD.8: `engine/contradiction/detection.ts` — ra…"]
	7CD.9["7CD.9: `engine/contradiction/detection.ts` — ma…"]
	7CD.10["7CD.10: `engine/contradiction/detection.ts` — s…"]
	7CD.11["7CD.11: `engine/contradiction/detection.ts` — e…"]
	7CD.12["7CD.12: `engine/contradiction/strain.ts` — `acc…"]
	7CD.13["7CD.13: `engine/contradiction/strain.ts` — stra…"]
	7CD.14["7CD.14: `engine/contradiction/strain.ts` — deco…"]
	7CD.15["7CD.15: `engine/contradiction/surfacing.ts` — `…"]
	7CD.16["7CD.16: `engine/contradiction/surfacing.ts` — `…"]
	7CD.17["7CD.17: `engine/contradiction/surfacing.ts` — `…"]
	7CD.18["7CD.18: `engine/contradiction/surfacing.ts` — e…"]
	7CD.19["7CD.19: `engine/contradiction/resolution.ts` —…"]
	7CD.20["7CD.20: `engine/contradiction/resolution.ts` —…"]
	7CD.21["7CD.21: `engine/contradiction/resolution.ts` —…"]
	7CD.22["7CD.22: `engine/contradiction/resolution.ts` —…"]
	7CD.23["7CD.23: `engine/contradiction/resolution.ts` —…"]
	7CD.24["7CD.24: `engine/contradiction/resolution.ts` —…"]
	7CD.25["7CD.25: `playerInterpretation.svelte.ts` extens…"]
	7CD.26["7CD.26: `components/contradiction/Contradiction…"]
	7CD.27["7CD.27: `components/contradiction/Contradiction…"]
	7CD.28["7CD.28: `components/contradiction/RetconFlow.sv…"]
	7CD.29["7CD.29: Cascade visualisation — show affected d…"]
	7CD.30["7CD.30: Resolution outcome display — what chang…"]
	7CD.31["7CD.31: Explorer: contradiction inspector — que…"]
	7CD.32["7CD.32: Explorer: surfacing log — chronological…"]
	M7["M7: Contradictions"]:::mile
	8PS.1["8PS.1: `persistence/serialisation.ts` — `serial…"]
	8PS.2["8PS.2: `persistence/serialisation.ts` — `serial…"]
	8PS.3["8PS.3: `persistence/serialisation.ts` — `deseri…"]
	8PS.4["8PS.4: `persistence/schema.ts` — re-export `Sav…"]
	8PS.5["8PS.5: `persistence/schema.ts` — schema migrati…"]
	8PS.6["8PS.6: `persistence/indexeddb.ts` — `saveToInde…"]
	8PS.7["8PS.7: `persistence/indexeddb.ts` — auto-save:…"]
	8PS.8["8PS.8: Save/load UI — save button, load button,…"]
	8PS.9["8PS.9: Auto-save indicator"]
	8PS.10["8PS.10: Explorer: persistence inspector — seria…"]
	M8["M8: Persistence"]:::mile
	9CR.1["9CR.1: `engine/documents/lineage.ts` — document…"]
	9CR.2["9CR.2: `engine/documents/dissemination.ts` — `a…"]
	9CR.3["9CR.3: `engine/documents/commitments.ts` — `ext…"]
	9CR.4["9CR.4: `engine/documents/form.ts` — `classifyDo…"]
	9CR.35["9CR.35: `engine/documents/retraction.ts` — `ret…"]
	9CR.36["9CR.36: `engine/documents/retraction.ts` — `tra…"]
	9CR.37["9CR.37: Retraction UI — retract action on disse…"]
	9CR.38["9CR.38: `engine/documents/perception.ts` — `ini…"]
	9CR.5["9CR.5: `engine/documents/venues.ts` — `generate…"]
	9CR.6["9CR.6: `engine/documents/venues.ts` — venue pre…"]
	9CR.7["9CR.7: `engine/career/reputation.ts` — `Reputat…"]
	9CR.8["9CR.8: `engine/career/reputation.ts` — `applyRe…"]
	9CR.9["9CR.9: `engine/career/reputation.ts` — reputati…"]
	9CR.10["9CR.10: `engine/career/reputation.ts` — `Reputa…"]
	9CR.11["9CR.11: `engine/career/events.ts` — `Disseminat…"]
	9CR.12["9CR.12: Claim magnitude system: `ClaimMagnitude…"]
	9CR.13["9CR.13: Publication effects on lens strength: d…"]
	9CR.14["9CR.14: `engine/career/reputation.ts` — retract…"]
	9CR.15["9CR.15: `engine/career/progression.ts` — `evalu…"]
	9CR.16["9CR.16: `engine/career/progression.ts` — `RoleR…"]
	9CR.17["9CR.17: `engine/career/progression.ts` — backgr…"]
	9CR.18["9CR.18: `engine/career/progression.ts` — `calcu…"]
	9CR.19["9CR.19: `engine/career/progression.ts` — `calcu…"]
	9CR.20["9CR.20: `engine/career/progression.ts` — `getTe…"]
	9CR.39["9CR.39: Dating commissioning — `commissionDatin…"]
	9CR.21["9CR.21: `src/lib/stores/termState.svelte.ts` —…"]
	9CR.22["9CR.22: Term boundary orchestration in `gameSta…"]
	9CR.23["9CR.23: Summer-research term: correctly exclude…"]
	9CR.24["9CR.24: Sabbatical engine hooks: career-state f…"]
	9CR.25["9CR.25: `worldState.svelte.ts` extensions: `add…"]
	9CR.26["9CR.26: `components/library/VenueSelector.svelt…"]
	9CR.27["9CR.27: Document derivation UI: create communic…"]
	9CR.28["9CR.28: `components/career/ReputationDashboard.…"]
	9CR.29["9CR.29: `components/career/EventLog.svelte` — c…"]
	9CR.30["9CR.30: `routes/career/+page.svelte` — career d…"]
	9CR.31["9CR.31: Term dashboard — current term, energy r…"]
	9CR.32["9CR.32: Role advancement notification (diegetic…"]
	9CR.33["9CR.33: Explorer: reputation dashboard — five d…"]
	9CR.34["9CR.34: Explorer: career state panel — current…"]
	M9["M9: Career & Publication"]:::mile
	10NP.1["10NP.1: `engine/career/peerReview.ts` — `genera…"]
	10NP.2["10NP.2: `engine/career/peerReview.ts` — `Review…"]
	10NP.3["10NP.3: `engine/career/peerReview.ts` — review…"]
	10NP.4["10NP.4: `engine/career/peerReview.ts` — reviewe…"]
	10NP.5["10NP.5: `engine/career/npc.ts` — `generateNpcIn…"]
	10NP.6["10NP.6: `engine/career/npc.ts` — NPC interpreta…"]
	10NP.7["10NP.7: `engine/career/reputation.ts` — over-ci…"]
	10NP.8["10NP.8: `engine/career/npc.ts` — `generatePeerC…"]
	10NP.9["10NP.9: `engine/career/npc.ts` — `generateStude…"]
	10NP.10["10NP.10: `engine/career/npc.ts` — NPC relations…"]
	10NP.11["10NP.11: `engine/career/npc.ts` — reviewer memo…"]
	10NP.12["10NP.12: Peer review as `ActivityType`: time/en…"]
	10NP.13["10NP.13: Student supervision as `ActivityType`:…"]
	10NP.14["10NP.14: `worldState.svelte.ts` extensions: `up…"]
	10NP.15["10NP.15: `components/career/NpcInteraction.svel…"]
	10NP.16["10NP.16: NPC interpretation comparison view: pl…"]
	10NP.17["10NP.17: Peer letter display: diegetic NPC chal…"]
	10NP.18["10NP.18: Student question display: diegetic stu…"]
	10NP.19["10NP.19: NPC relationship indicators in career…"]
	10NP.20["10NP.20: Venue form reclassification: `FormRecl…"]
	10NP.21["10NP.21: Explorer: NPC panel — reviewer pool wi…"]
	10NP.22["10NP.22: Explorer: citation balance tracker, re…"]
	10NP.23["10NP.23: Explorer: student question targeting v…"]
	M10["M10: NPC Systems"]:::mile
	1FD.1 --> M1
	1FD.2 --> M1
	1FD.3 --> M1
	1FD.4 --> M1
	1FD.5 --> M1
	1FD.6 --> 1FD.7
	1FD.6 --> 1FD.8
	1FD.6 --> 1FD.9
	1FD.7 --> M1
	1FD.8 --> M1
	1FD.9 --> M1
	1FD.12 --> 1FD.18
	1FD.12 --> 1FD.32
	1FD.12 --> 2GN.22
	1FD.12 --> 2GN.17
	1FD.10 --> 1FD.11
	1FD.10 --> 2GN.1
	1FD.10 --> 2GN.2
	1FD.11 --> 1FD.13
	1FD.13 --> 1FD.31
	1FD.13 --> 2GN.28
	1FD.14 --> 1FD.15
	1FD.14 --> 1FD.16
	1FD.14 --> 1FD.17
	1FD.14 --> 2GN.66
	1FD.15 --> 1FD.30
	1FD.16 --> 1FD.30
	1FD.18 --> 1FD.19
	1FD.18 --> 1FD.20
	1FD.19 --> 1FD.21
	1FD.19 --> 1FD.24
	1FD.19 --> 1FD.29
	1FD.21 --> 1FD.23
	1FD.23 --> 1FD.40
	1FD.23 --> 1FD.22
	1FD.40 --> M1
	1FD.26 --> 1FD.28
	1FD.32 --> 1FD.20
	1FD.17 --> 1FD.30
	1FD.17 --> 1FD.31
	1FD.28 --> 1FD.27
	1FD.20 --> 1FD.24
	1FD.20 --> 1FD.29
	1FD.20 --> 1FD.31
	1FD.24 --> 1FD.25
	1FD.25 --> 1FD.27
	1FD.29 --> 1FD.30
	1FD.30 --> 1FD.33
	1FD.31 --> 1FD.22
	1FD.31 --> 2GN.35
	1FD.31 --> 2GN.36
	1FD.31 --> 2GN.37
	1FD.22 --> 1FD.27
	1FD.27 --> 1FD.33
	1FD.33 --> M1
	1FD.34 --> 1FD.35
	1FD.35 --> M1
	1FD.36 --> 1FD.39
	1FD.36 --> 1FD.37
	1FD.39 --> M1
	1FD.37 --> 1FD.38
	1FD.38 --> M1
	M1 --> 2GN.11
	M1 --> 2GN.22
	M1 --> 2GN.28
	M1 --> 2GN.35
	M1 --> 2GN.36
	M1 --> 2GN.37
	M1 --> 2GN.66
	M1 --> 2GN.1
	M1 --> 2GN.2
	2GN.11 --> 2GN.12
	2GN.22 --> 2GN.23
	2GN.28 --> 2GN.29
	2GN.35 --> 2GN.38
	2GN.36 --> 2GN.38
	2GN.37 --> 2GN.38
	2GN.66 --> 2GN.47
	2GN.66 --> 2GN.48
	2GN.1 --> 2GN.12
	2GN.2 --> 2GN.3
	2GN.3 --> 2GN.4
	2GN.3 --> 2GN.5
	2GN.3 --> 2GN.7
	2GN.3 --> 2GN.6
	2GN.4 --> 2GN.8
	2GN.5 --> M2
	2GN.7 --> 2GN.6
	2GN.6 --> 2GN.8
	2GN.8 --> 2GN.9
	2GN.8 --> 2GN.10
	2GN.8 --> 2GN.12
	2GN.8 --> 2GN.67
	2GN.8 --> 2GN.57
	2GN.9 --> M2
	2GN.10 --> M2
	2GN.12 --> 2GN.13
	2GN.12 --> 2GN.14
	2GN.12 --> 2GN.15
	2GN.12 --> 2GN.16
	2GN.12 --> 2GN.17
	2GN.12 --> 2GN.19
	2GN.12 --> 2GN.23
	2GN.12 --> 2GN.58
	2GN.13 --> M2
	2GN.14 --> M2
	2GN.15 --> M2
	2GN.16 --> M2
	2GN.17 --> 2GN.20
	2GN.19 --> 2GN.20
	2GN.20 --> 2GN.21
	2GN.20 --> 2GN.27
	2GN.20 --> 2GN.34
	2GN.20 --> 2GN.59
	2GN.21 --> M2
	2GN.23 --> 2GN.24
	2GN.23 --> 2GN.25
	2GN.23 --> 2GN.26
	2GN.23 --> 2GN.27
	2GN.23 --> 2GN.29
	2GN.23 --> 2GN.60
	2GN.24 --> M2
	2GN.25 --> M2
	2GN.26 --> M2
	2GN.27 --> M2
	2GN.29 --> 2GN.30
	2GN.29 --> 2GN.31
	2GN.29 --> 2GN.32
	2GN.29 --> 2GN.33
	2GN.29 --> 2GN.34
	2GN.29 --> 2GN.61
	2GN.30 --> M2
	2GN.31 --> M2
	2GN.32 --> M2
	2GN.33 --> M2
	2GN.34 --> 2GN.38
	2GN.38 --> 2GN.39
	2GN.38 --> 2GN.44
	2GN.39 --> 2GN.40
	2GN.39 --> 2GN.41
	2GN.39 --> 2GN.42
	2GN.39 --> 2GN.43
	2GN.40 --> 2GN.62
	2GN.41 --> M2
	2GN.42 --> M2
	2GN.43 --> M2
	2GN.44 --> 2GN.45
	2GN.44 --> 2GN.46
	2GN.44 --> 2GN.47
	2GN.44 --> 2GN.48
	2GN.44 --> 2GN.63
	2GN.45 --> 2GN.63
	2GN.46 --> M2
	2GN.47 --> M2
	2GN.48 --> 2GN.49
	2GN.49 --> 2GN.50
	2GN.49 --> 2GN.55
	2GN.50 --> 2GN.51
	2GN.50 --> 2GN.52
	2GN.50 --> 2GN.54
	2GN.51 --> 2GN.53
	2GN.52 --> M2
	2GN.53 --> 2GN.56
	2GN.53 --> 2GN.64
	2GN.54 --> 2GN.64
	2GN.55 --> M2
	2GN.67 --> M2
	2GN.56 --> 2GN.65
	2GN.56 --> 3WS.1
	2GN.57 --> M2
	2GN.58 --> M2
	2GN.59 --> M2
	2GN.60 --> M2
	2GN.61 --> M2
	2GN.62 --> M2
	2GN.63 --> M2
	2GN.64 --> M2
	2GN.65 --> M2
	M2 --> 3WS.1
	3WS.1 --> 3WS.2
	3WS.1 --> 3WS.7
	3WS.2 --> 3WS.3
	3WS.3 --> 3WS.4
	3WS.3 --> 3WS.5
	3WS.3 --> 3WS.8
	3WS.4 --> 3WS.9
	3WS.5 --> 3WS.6
	3WS.5 --> 3WS.9
	3WS.6 --> M3
	3WS.7 --> 3WS.9
	3WS.8 --> M3
	3WS.9 --> 3WS.10
	3WS.10 --> 3WS.11
	3WS.10 --> 3WS.12
	3WS.10 --> 3WS.13
	3WS.10 --> 3WS.14
	3WS.10 --> 3WS.17
	3WS.10 --> 3WS.18
	3WS.10 --> 3WS.19
	3WS.11 --> 3WS.14
	3WS.12 --> 3WS.14
	3WS.13 --> 3WS.14
	3WS.14 --> 3WS.15
	3WS.14 --> 3WS.20
	3WS.15 --> 3WS.16
	3WS.15 --> 4UI.1
	3WS.16 --> M3
	3WS.17 --> 3WS.20
	3WS.18 --> 3WS.20
	3WS.19 --> 3WS.20
	3WS.20 --> M3
	M3 --> 4UI.1
	4UI.1 --> 4UI.2
	4UI.1 --> 4UI.3
	4UI.1 --> 4UI.4
	4UI.1 --> 4UI.5
	4UI.2 --> M4
	4UI.3 --> M4
	4UI.4 --> M4
	4UI.5 --> 4UI.6
	4UI.6 --> 4UI.7
	4UI.6 --> 4UI.8
	4UI.6 --> 4UI.9
	4UI.6 --> 5KN.1
	4UI.7 --> M4
	4UI.8 --> M4
	4UI.9 --> M4
	M4 --> 5KN.1
	5KN.1 --> 5KN.2
	5KN.1 --> 5KN.3
	5KN.1 --> 5KN.4
	5KN.1 --> 5KN.10
	5KN.2 --> M5
	5KN.3 --> M5
	5KN.4 --> 5KN.5
	5KN.4 --> 5KN.25
	5KN.5 --> 5KN.6
	5KN.5 --> 5KN.7
	5KN.5 --> 5KN.8
	5KN.5 --> 5KN.9
	5KN.5 --> 5KN.16
	5KN.6 --> M5
	5KN.7 --> M5
	5KN.8 --> M5
	5KN.9 --> M5
	5KN.10 --> 5KN.11
	5KN.10 --> 5KN.12
	5KN.10 --> 5KN.14
	5KN.10 --> 5KN.15
	5KN.11 --> M5
	5KN.12 --> 5KN.13
	5KN.12 --> 5KN.20
	5KN.12 --> 5KN.26
	5KN.12 --> 6LS.1
	5KN.13 --> M5
	5KN.14 --> M5
	5KN.15 --> 5KN.17
	5KN.16 --> M5
	5KN.17 --> 5KN.18
	5KN.17 --> 5KN.19
	5KN.18 --> M5
	5KN.19 --> M5
	5KN.20 --> 5KN.21
	5KN.20 --> 5KN.22
	5KN.21 --> 5KN.23
	5KN.22 --> 5KN.24
	5KN.23 --> M5
	5KN.24 --> M5
	5KN.25 --> M5
	5KN.26 --> M5
	M5 --> 6LS.1
	6LS.1 --> 6LS.2
	6LS.1 --> 6LS.3
	6LS.2 --> 6LS.4
	6LS.2 --> 6LS.5
	6LS.3 --> 6LS.16
	6LS.4 --> M6
	6LS.5 --> 6LS.6
	6LS.5 --> 6LS.7
	6LS.5 --> 6LS.8
	6LS.5 --> 6LS.9
	6LS.5 --> 6LS.10
	6LS.5 --> 6LS.16
	6LS.5 --> 7CD.1
	6LS.6 --> 6LS.11
	6LS.7 --> 6LS.11
	6LS.8 --> 6LS.11
	6LS.8 --> 6LS.14
	6LS.9 --> 6LS.11
	6LS.10 --> 6LS.11
	6LS.11 --> 6LS.12
	6LS.11 --> 6LS.13
	6LS.11 --> 6LS.15
	6LS.11 --> 6LS.17
	6LS.12 --> M6
	6LS.13 --> M6
	6LS.14 --> M6
	6LS.15 --> M6
	6LS.16 --> M6
	6LS.17 --> M6
	M6 --> 7CD.1
	7CD.1 --> 7CD.2
	7CD.1 --> 7CD.3
	7CD.1 --> 7CD.4
	7CD.1 --> 7CD.5
	7CD.1 --> 7CD.6
	7CD.1 --> 7CD.7
	7CD.1 --> 7CD.8
	7CD.1 --> 7CD.9
	7CD.1 --> 7CD.10
	7CD.1 --> 7CD.11
	7CD.1 --> 7CD.12
	7CD.2 --> M7
	7CD.3 --> M7
	7CD.4 --> M7
	7CD.5 --> M7
	7CD.6 --> M7
	7CD.7 --> M7
	7CD.8 --> M7
	7CD.9 --> M7
	7CD.10 --> 7CD.15
	7CD.11 --> M7
	7CD.12 --> 7CD.13
	7CD.12 --> 7CD.14
	7CD.12 --> 7CD.25
	7CD.13 --> M7
	7CD.14 --> M7
	7CD.15 --> 7CD.16
	7CD.15 --> 7CD.17
	7CD.15 --> 7CD.18
	7CD.15 --> 7CD.19
	7CD.15 --> 7CD.32
	7CD.16 --> M7
	7CD.17 --> M7
	7CD.18 --> M7
	7CD.19 --> 7CD.20
	7CD.19 --> 7CD.27
	7CD.20 --> 7CD.21
	7CD.20 --> 7CD.22
	7CD.20 --> 7CD.23
	7CD.20 --> 7CD.24
	7CD.20 --> 7CD.28
	7CD.21 --> M7
	7CD.22 --> 7CD.32
	7CD.23 --> M7
	7CD.24 --> M7
	7CD.25 --> 7CD.26
	7CD.25 --> 7CD.31
	7CD.25 --> 8PS.1
	7CD.26 --> M7
	7CD.27 --> M7
	7CD.28 --> 7CD.29
	7CD.28 --> 7CD.30
	7CD.29 --> M7
	7CD.30 --> M7
	7CD.31 --> M7
	7CD.32 --> M7
	M7 --> 8PS.1
	8PS.1 --> 8PS.2
	8PS.1 --> 8PS.4
	8PS.2 --> 8PS.3
	8PS.2 --> 8PS.6
	8PS.3 --> 8PS.10
	8PS.4 --> 8PS.5
	8PS.5 --> 8PS.10
	8PS.5 --> 9CR.1
	8PS.6 --> 8PS.7
	8PS.6 --> 8PS.8
	8PS.7 --> 8PS.9
	8PS.8 --> M8
	8PS.9 --> M8
	8PS.10 --> M8
	M8 --> 9CR.1
	9CR.1 --> 9CR.2
	9CR.1 --> 9CR.3
	9CR.1 --> 9CR.4
	9CR.1 --> 9CR.36
	9CR.1 --> 9CR.5
	9CR.2 --> 9CR.35
	9CR.2 --> 9CR.38
	9CR.2 --> 9CR.7
	9CR.2 --> 9CR.25
	9CR.3 --> 9CR.27
	9CR.4 --> M9
	9CR.35 --> 9CR.36
	9CR.35 --> 9CR.14
	9CR.36 --> 9CR.37
	9CR.37 --> M9
	9CR.38 --> 9CR.14
	9CR.38 --> 9CR.22
	9CR.5 --> 9CR.6
	9CR.5 --> 9CR.26
	9CR.6 --> 9CR.13
	9CR.7 --> 9CR.8
	9CR.7 --> 9CR.9
	9CR.7 --> 9CR.10
	9CR.7 --> 9CR.11
	9CR.7 --> 9CR.12
	9CR.7 --> 9CR.14
	9CR.7 --> 9CR.15
	9CR.7 --> 9CR.28
	9CR.7 --> 9CR.33
	9CR.8 --> M9
	9CR.9 --> M9
	9CR.10 --> 9CR.39
	9CR.11 --> 9CR.29
	9CR.12 --> 9CR.33
	9CR.12 --> 10NP.1
	9CR.13 --> M9
	9CR.14 --> M9
	9CR.15 --> 9CR.16
	9CR.15 --> 9CR.17
	9CR.15 --> 9CR.20
	9CR.15 --> 9CR.32
	9CR.16 --> 9CR.34
	9CR.17 --> 9CR.18
	9CR.17 --> 9CR.19
	9CR.17 --> 9CR.21
	9CR.18 --> 9CR.34
	9CR.19 --> M9
	9CR.20 --> 9CR.23
	9CR.20 --> 9CR.24
	9CR.39 --> M9
	9CR.21 --> 9CR.22
	9CR.21 --> 9CR.31
	9CR.22 --> M9
	9CR.23 --> M9
	9CR.24 --> M9
	9CR.25 --> M9
	9CR.26 --> M9
	9CR.27 --> M9
	9CR.28 --> 9CR.30
	9CR.29 --> M9
	9CR.30 --> M9
	9CR.31 --> M9
	9CR.32 --> M9
	9CR.33 --> M9
	9CR.34 --> M9
	M9 --> 10NP.1
	10NP.1 --> 10NP.2
	10NP.1 --> 10NP.3
	10NP.1 --> 10NP.4
	10NP.1 --> 10NP.5
	10NP.1 --> 10NP.7
	10NP.1 --> 10NP.10
	10NP.1 --> 10NP.12
	10NP.2 --> 10NP.15
	10NP.3 --> 10NP.11
	10NP.3 --> 10NP.20
	10NP.4 --> 10NP.21
	10NP.5 --> 10NP.6
	10NP.5 --> 10NP.8
	10NP.5 --> 10NP.9
	10NP.6 --> 10NP.16
	10NP.6 --> 10NP.21
	10NP.7 --> 10NP.22
	10NP.8 --> 10NP.17
	10NP.9 --> 10NP.13
	10NP.9 --> 10NP.18
	10NP.9 --> 10NP.23
	10NP.10 --> 10NP.14
	10NP.10 --> 10NP.22
	10NP.11 --> M10
	10NP.12 --> M10
	10NP.13 --> M10
	10NP.14 --> 10NP.19
	10NP.15 --> M10
	10NP.16 --> M10
	10NP.17 --> M10
	10NP.18 --> M10
	10NP.19 --> M10
	10NP.20 --> M10
	10NP.21 --> M10
	10NP.22 --> M10
	10NP.23 --> M10
	class 2GN.10,2GN.13,2GN.14,2GN.15,2GN.16,2GN.20,2GN.26,2GN.30,2GN.31,2GN.32,2GN.33,2GN.35,2GN.36,2GN.37,2GN.57,2GN.58,2GN.60,2GN.61,2GN.66,2GN.67 todo
	class 10NP.1,10NP.10,10NP.11,10NP.12,10NP.13,10NP.14,10NP.15,10NP.16,10NP.17,10NP.18,10NP.19,10NP.2,10NP.20,10NP.21,10NP.22,10NP.23,10NP.3,10NP.4,10NP.5,10NP.6,10NP.7,10NP.8,10NP.9,2GN.21,2GN.27,2GN.34,2GN.38,2GN.39,2GN.40,2GN.41,2GN.42,2GN.43,2GN.44,2GN.45,2GN.46,2GN.47,2GN.48,2GN.49,2GN.50,2GN.51,2GN.52,2GN.53,2GN.54,2GN.55,2GN.56,2GN.59,2GN.62,2GN.63,2GN.64,2GN.65,3WS.1,3WS.10,3WS.11,3WS.12,3WS.13,3WS.14,3WS.15,3WS.16,3WS.17,3WS.18,3WS.19,3WS.2,3WS.20,3WS.3,3WS.4,3WS.5,3WS.6,3WS.7,3WS.8,3WS.9,4UI.1,4UI.2,4UI.3,4UI.4,4UI.5,4UI.6,4UI.7,4UI.8,4UI.9,5KN.1,5KN.10,5KN.11,5KN.12,5KN.13,5KN.14,5KN.15,5KN.16,5KN.17,5KN.18,5KN.19,5KN.2,5KN.20,5KN.21,5KN.22,5KN.23,5KN.24,5KN.25,5KN.26,5KN.3,5KN.4,5KN.5,5KN.6,5KN.7,5KN.8,5KN.9,6LS.1,6LS.10,6LS.11,6LS.12,6LS.13,6LS.14,6LS.15,6LS.16,6LS.17,6LS.2,6LS.3,6LS.4,6LS.5,6LS.6,6LS.7,6LS.8,6LS.9,7CD.1,7CD.10,7CD.11,7CD.12,7CD.13,7CD.14,7CD.15,7CD.16,7CD.17,7CD.18,7CD.19,7CD.2,7CD.20,7CD.21,7CD.22,7CD.23,7CD.24,7CD.25,7CD.26,7CD.27,7CD.28,7CD.29,7CD.3,7CD.30,7CD.31,7CD.32,7CD.4,7CD.5,7CD.6,7CD.7,7CD.8,7CD.9,8PS.1,8PS.10,8PS.2,8PS.3,8PS.4,8PS.5,8PS.6,8PS.7,8PS.8,8PS.9,9CR.1,9CR.10,9CR.11,9CR.12,9CR.13,9CR.14,9CR.15,9CR.16,9CR.17,9CR.18,9CR.19,9CR.2,9CR.20,9CR.21,9CR.22,9CR.23,9CR.24,9CR.25,9CR.26,9CR.27,9CR.28,9CR.29,9CR.3,9CR.30,9CR.31,9CR.32,9CR.33,9CR.34,9CR.35,9CR.36,9CR.37,9CR.38,9CR.39,9CR.4,9CR.5,9CR.6,9CR.7,9CR.8,9CR.9 blocked
	class 1FD.1,1FD.10,1FD.11,1FD.12,1FD.13,1FD.14,1FD.15,1FD.16,1FD.17,1FD.18,1FD.19,1FD.2,1FD.20,1FD.21,1FD.22,1FD.23,1FD.24,1FD.25,1FD.26,1FD.27,1FD.28,1FD.29,1FD.3,1FD.30,1FD.31,1FD.32,1FD.33,1FD.34,1FD.35,1FD.36,1FD.37,1FD.38,1FD.39,1FD.4,1FD.40,1FD.5,1FD.6,1FD.7,1FD.8,1FD.9,2GN.1,2GN.11,2GN.12,2GN.17,2GN.19,2GN.2,2GN.22,2GN.23,2GN.24,2GN.25,2GN.28,2GN.29,2GN.3,2GN.4,2GN.5,2GN.6,2GN.7,2GN.8,2GN.9 done
```

## Links

- [Doc 02: Design Pillars](../02-design-pillars.md) — Non-negotiable principles
- [Doc 03: Core Loop](../03-core-loops-system-map.md) — Systems map
- [Doc 04: Interpretive Lens](../04-interpretive-lens.md) — Core mechanic
- [Doc 05: Generation Architecture](../05-generation-architecture.md) — 9-stage pipeline
- [Doc 06: Knowledge Model](../06-knowledge-contradiction-model.md) — Claims, contradictions, strain
- [Doc 07: Career Systems](../07-career-social-systems.md) — Reputation, progression, NPCs
- [Doc 08: Technical Architecture](../08-technical-architecture.md) — Implementation guide
- [Doc 09: Implementation Roadmap](../09-implementation-roadmap.md) — Phase-by-phase breakdown (source)
- [Doc 10: Document Tradition](../10-document-tradition-system.md) — Lineage, dissemination, venues
- [Doc 11: Deferred Questions](../11-deferred-design-questions.md) — Locked decisions
- [Doc 12: Propagation Register](../12-propagation-register.md) — Cross-doc consistency log
- [Doc 13: Post-MVP](../13-deferred-post-mvp.md) — Beyond Milestone 10

---

## Beyond MVP

**Phase 24: Expansion Tracks** (deferred to post-MVP)

- Curatorial publication track (exhibition narratives, thematic grouping)
- Popular publication track (simplified claims, public misconceptions)
- Full career role progression (through professor)
- Career activity execution (field seasons, conference presentations, grants, sabbatical availability)
- Richer NPC personalities and relationships
- Desk-based UI evolution (Strange Horticulture aesthetic)
- Cultural profile document type (player-authored culture models)
- Five-register `ObservationRegister` acquisition system (doc 05 §12); MVP ships doc 04's three-register `DescriptionRegister`

Source: [Doc 09: Implementation Roadmap](../09-implementation-roadmap.md), Phase 24. Separately deferred design questions (alternative dissemination pathways, emergent schools of thought, publication quality metrics for role qualification): see [Doc 13: Post-MVP Deferrals](../13-deferred-post-mvp.md).
