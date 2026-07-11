---
description: MVP implementation roadmap from foundation through NPC social systems
---

# Those Who Came Before: MVP Roadmap

|          | Status                  | Next Up           | Blocked           |
| -------- | ----------------------- | ----------------- | ----------------- |
| **FD**   | Complete                | —      | — |
| **GN**   | In progress             | 2GN.2, 2GN.17, 2GN.22 | —      |
| **WS**   | Not started             | —                 | 2GN.56            |
| **UI**   | Not started             | —                 | 3WS.15            |
| **KN**   | Not started             | —                 | 4UI.6             |
| **LS**   | Not started             | —                 | 5KN.12            |
| **CD**   | Not started             | —                 | 6LS.5             |
| **PS**   | Not started             | —                 | 7CD.25            |
| **CR**   | Not started             | —                 | 8PS.5             |
| **NP**   | Not started             | —                 | 9CR.12            |

---

- [Milestones](#milestones)
  - [Milestone 1: Foundation](#m1)
  - [Milestone 2: Generation Pipeline](#m2)
  - [Milestone 3: World State & Integration](#m3)
  - [Milestone 4: Player Interface](#m4)
  - [Milestone 5: Knowledge Model](#m5)
  - [Milestone 6: Lens System](#m6)
  - [Milestone 7: Contradictions](#m7)
  - [Milestone 8: Persistence](#m8)
  - [Milestone 9: Career & Publication](#m9)
  - [Milestone 10: NPC Systems](#m10)
- [Progress Map](#map)
- [Links](#links)
- [Beyond MVP](#post-mvp)

---

## Milestones

<details>
<summary><a name="m1"><h3>Milestone 1: Foundation</h3></a></summary>

> [!IMPORTANT]
> **Goal:** Deno runtime, type system, seeded PRNG, test infrastructure, Project Explorer shell

<a name="m1-doing"><h4>In Progress (Milestone 1)</h4></a>

<a name="m1-todo"><h4>To Do (Milestone 1)</h4></a>

**Type system**

- [x] 1FD.21. `src/lib/types/documents.ts` — `DocumentNode`, `DocumentLineage`, `DerivationType`, `DerivationEvent`, `DocumentScope`, `Audience`, `PublicationRegister`, `DocumentPerception` (simplified MVP shape per doc 10 §11: `audienceReach`, `takeawayDivergence`, `citationCount`; `DocumentNode` unavoidably references `DisseminationState`, so 1FD.22's full member list landed alongside it too)
- [x] 1FD.22. `src/lib/types/documents.ts` — `DisseminationState`, `DisseminationEvent`, `DisseminationDetails`, `PeerReviewState`, `Retraction`, `TaintedLineage` (`DisseminationState` scoped to MVP's four states per doc 10 §11 — `presented`/`collected` deferred; completed alongside 1FD.21 since `DocumentNode` depends on it directly)
- [x] 1FD.23. `src/lib/types/venues.ts` — `VenueDefinition`, `ContainerModel`, `TemporalMode`, `SubmissionWindow`, `EditorialProcess`, `AudienceEncounter`, `VenueScope`, `VenueClassification` (doc 07 §3.1 transcribed verbatim, term-denominated; doc 10 §6.4's week-denominated `VenueTemporalProfile` overlaps it — reconciliation owned by 1FD.40)
- [x] 1FD.24. `src/lib/types/contradiction.ts` — `Contradiction` union, `MaterialContradiction`, `TemporalContradiction`, `CulturalContradiction`, `StructuralContradiction`, `ProvenanceContradiction`, `CorpusContradiction`, `RarityContradiction`, `MaterialProvenanceContradiction` (all eight members per doc 06 §4.2; `CulturalContradiction.agentClaim` references a claimId at MVP — doc 06's profileId applies once cultural-profile documents land post-MVP; `ContradictionSeverity` landed here from 1FD.25's bullet since all eight members reference it directly, per the 1FD.21/22 precedent)
- [x] 1FD.25. `src/lib/types/contradiction.ts` — `ContradictionQueue`, `QueuedContradiction`, `DiegeticSurface`, `Resolution`, `HypothesisStrain` (doc 06 §4.4–§4.6, §5 verbatim; `HypothesisStrain` is the canonical strain type per doc 12 §2.15; all six `DiegeticSurface` channels typed though MVP drives only `impossible-artefact`/`field-report` — doc 07 §5.2's NPC generators already return the other shapes; `ContradictionQueue` shaped per doc 06, with doc 08 §3.4's bare-`Contradiction`-push store sketch JSDoc-flagged as illustrative pseudo-code to reconcile at the store task; `Resolution.contradictionId` flagged as a doc 06 forward reference — `Contradiction` members carry no `id` at MVP, the identity scheme belongs to the detection engine (7CD.x); resolves the two cross-file `TODO(1FD.25)` stand-ins in `interpretation.ts`; `ContradictionSeverity` already landed with 1FD.24)
- [x] 1FD.27. `src/lib/types/career.ts` — `RoleRequirement`, `DisseminationCareerEffect`, `PeerReviewCareerEvent`, `ReviewerFeedback` (doc 07 §3.2–§3.3, §4.2 verbatim; `DisseminationTransition` hoisted from §3.2 per the `ContradictionSeverity` precedent and scoped to MVP's three live transitions — `published-to-collected` dropped per the 1FD.22 `DisseminationState` precedent; authored `ReputationEffect` hoist for the `{dimension, delta, basis}` shape doc 07 inlines identically on both career-event types; doc 08 §5's singular `reputationEffect` read in the `resolvePeerReview` sketch JSDoc-flagged — doc 07's plural array governs; `ActivityOutcome`'s provisional note updated now this task has landed, it stays provisional until activity execution gets an owning task per doc 13 §5; file remains import-free, cross-domain references by plain `string` id)
- [x] 1FD.29. `src/lib/types/scholars.ts` — `MinimalScholar`, `NPCScholarSeed`, `SimulatedExcavation` (doc 07 §5.1 + doc 05 §4.1; `MinimalScholar.specialism.methodologicalBias` narrowed from the doc's `string` to interpretation.ts's `MethodologicalBias` union per the 1FD.31 register-narrowing precedent)
- [x] 1FD.30. `src/lib/types/corpus.ts` — `ProfessionalCorpus`, `FrequencyRecord`, `ContextFrequency`, `ConsensusStatement`, `Debate`, `DebatePosition`, `CoverageBudget` (doc 05 §4.2–§4.3 verbatim; `ContextFrequency` is named by `ProfessionalCorpus.contextAssociations` but shaped nowhere — authored provisional per the `MotifSet`/`ActivityOutcome`/`ProvenancePresentation` precedent, as the reverse index of `FrequencyRecord.byContext` — `{totalObserved, byCulture, associatedMaterials, associatedForms, lastUpdated}` — to firm up at 2GN.53, the first real producer; `SiteType` imported from world.ts per the scholars.ts precedent; cross-domain references — NPC ids, document node ids, culture ids, period ids — stay plain `string` per the career.ts convention)
- [x] 1FD.33. `src/lib/types/save.ts` — `SaveFile`, `SerialisedWorldState`, `SerialisedInterpretiveModel`, `SerialisedTermState`, `CURRENT_SAVE_VERSION` (doc 08 §4.1 transcribed verbatim for `SaveFile`/`CURRENT_SAVE_VERSION`; persistence scope per doc 12 §2.14 — lensState recomputed on load, contradiction queue nested inside `playerInterpretation`; the three `Serialised*` shapes are doc-named but shaped nowhere — authored via an exported recursive `Serialised<T>` utility, the single type-level encoding of doc 08 §4.2's Map→`[K,V][]` rule (functions map to `never` so non-serialisable state like `WorldSeed.prng` is a loud compile error at 8PS.2, not a silent `{}`; homomorphic branches preserve tuple arity, optionality and readonly), making `SerialisedInterpretiveModel`/`SerialisedTermState` derived aliases with zero drift by construction — a flagged deviation from the interfaces-first convention; `SerialisedWorldState` is an explicit PROVISIONAL interface authored against doc 08 §3.3's field tree since no runtime `WorldState` aggregate exists until 3WS.9/3WS.10 — `sites` landed as `datingFrameworks` (no standalone Site entity, site data lives inline on `Provenance.site`), `lineageGraph` as `lineageEvents` (graph edges are recoverable from `DocumentNode.lineage`; `DerivationEvent` records the modified/dropped commitments that aren't), plus three authored additions the tree omits but the world demonstrably needs saved — `cultures` (the tree's chronology line says "Periods, cultures" but `WorldChronology` holds only timelines, the Map-bearing `Culture` profiles live nowhere else), `geology` and `corpus` (the contradiction detector's two comparison sources, doc 06 §4.2–§4.3); player `CareerState`/`Reputation` placement, PRNG draw position and `SimulatedExcavation` persistence recorded as known omissions for 3WS.10/8PS.2 to resolve; world.ts's stale `persistence/save.ts` pointer corrected to this file; verified by throwaway compile-time assertions — value-level round-trip tests land with 8PS.1)
- [x] 1FD.40. `src/lib/types/venues.ts` — `VenueTemporalProfile` (doc 10 §6.4, week-denominated: `submissionMode`, `openWeeks`, `cycleLengthWeeks`, `reviewLeadTimeWeeks`, `publicationLeadTimeWeeks`); reconcile with doc 07 §3.1's term-denominated `TemporalMode`/`SubmissionWindow` (supersede or coexist — doc 12's week-conversion sweep suggests weeks are canonical, cf. §2.9 precedent) and record the resolution in doc 12; consumed downstream by 9CR.5 (venue generation sets temporal properties) and 9CR.22 (venue cycles at term boundaries) — **depends on 1FD.23** (resolved as **supersede**, recorded as doc 12 §2.17: the §2.9 week sweep updated doc 10's profile but never doc 07, and `PeerReviewState` (1FD.22) already works in absolute weeks — so `TemporalMode`/`SubmissionWindow` removed, `VenueDefinition.temporalMode` → `temporalProfile: VenueTemporalProfile`, transcribed verbatim with `venueId` kept as self-referential when embedded; `TemporalMode.visibilityWindow` had no week equivalent and no consumer anywhere — dropped for MVP per the `presented`/`collected` `DisseminationState` precedent rather than converted; doc 07 §3.1 gained a supersession note)

**Project Explorer shell**

- [x] 1FD.39. Type index panel — list all registered interfaces with field summaries (child route `types/+page.svelte` per the 1FD.36 sub-route model, `panels.ts` entry flipped to `available`; the index is parsed live from the type modules' raw sources — an `import.meta.glob` `?raw` sweep of `src/lib/types/*.ts` (test files excluded, `term.test.ts` lives there) feeds the route-private `typeIndex.ts` parser, built on the TypeScript compiler API (`ts.createSourceFile`, parse-only, no `Program`) since regex parsing can't survive `save.ts`'s recursive conditional `Serialised<T>` or fields wrapped across lines by deno fmt; parsing runs in a `+page.server.ts` load so the multi-megabyte `typescript` module (already a dependency via svelte-check) never reaches the client bundle, and the glob keeps the panel zero-maintenance — new type modules appear automatically, the index cannot drift from the code; interfaces render their extends clause and a field table (name, `?`, `readonly`, type text, first-sentence field JSDoc), string-literal-union aliases render member badges, other aliases raw type text, exported consts/functions land in a per-module "also exports" footnote; client-side filter matches type, field and union-member names and auto-expands matching modules; `deno task test` gained `--allow-env` because typescript reads `process.env` at module init; parser covered by 8 Deno tests, panel verified in-browser — 17 modules, 106 interfaces + 41 aliases, matching the source count exactly; extended post-completion with reference visualisations, since the reference graph — not inheritance, of which exactly one `extends` exists — is where the density lives: a mermaid module dependency graph (17 nodes), per-type reference-neighbourhood diagrams via a graph toggle on each card (the full ~150-node type graph is deliberately not drawn — unreadable hairball) and clickable cross-reference jumps on type names; mermaid renders client-side in its own lazy chunk, the parser additionally extracts raw type references and sibling-module imports, filtered against the name registry server-side)

<a name="m1-blocked"><h4>Blocked (Milestone 1)</h4></a>

<a name="m1-done"><h4>Completed (Milestone 1)</h4></a>

**Deno migration**

- [x] 1FD.1. Create `deno.json` with tasks, compilerOptions, fmt/lint config
- [x] 1FD.2. Swap `adapter-node` for `@deno/svelte-adapter` in `svelte.config.js`
- [x] 1FD.3. Strip Node tooling (`.prettierrc`, `.prettierignore`, `.npmrc`)
- [x] 1FD.4. Verify npm deps via `npm:` specifiers (Svelte 5, SvelteKit 2, Vite 7, Tailwind 4, DaisyUI 5)
- [x] 1FD.5. Verify `deno task dev` serves app, `deno task check` passes

**Seeded PRNG**

- [x] 1FD.6. Implement `src/lib/engine/prng.ts` — xoshiro128** algorithm, `createPrng(seed: string): () => number`
- [x] 1FD.7. Write `weightedSelect(items, prng)` utility (reused across pipeline)
- [x] 1FD.8. Write PRNG determinism test — same seed → identical sequence
- [x] 1FD.9. Write PRNG distribution test — output approximately uniform over large sample

**Type system**

- [x] 1FD.12. `src/lib/types/tags.ts` — `FunctionTag`, `ContextTag`, `MaterialTag`, `ClassificationRule`, `ClaimMagnitude` (built ahead of 1FD.10 so `grammar.ts` could import the real `MaterialTag` rather than a placeholder; `ClassificationRule.condition` typed against a local `ExtractedFeatures` stand-in until 1FD.11 landed, now imports the real type from `artefact.ts`)
- [x] 1FD.10. `src/lib/types/grammar.ts` — `GrammarRule`, `GrammarOption`, `ArrangementPattern`, `AccumulationConstraints`, `AttachmentType` (imports `MaterialTag` from 1FD.12; `GrammarOption.expandsTo` and `.phaseModifiers` are provisional shapes, JSDoc-marked, pending 2GN.3/2GN.5)
- [x] 1FD.11. `src/lib/types/artefact.ts` — `NormalisedArtefact`, `NormalisedComponent`, `Attachment`, `ObjectDimensions`, `Portability`, `InspectionDepth`, `ClassifiedArtefact`, `ExtractedFeatures`, `MaterialAssignment`, `MaterialDefinition`, `MaterialProvenance` (doc 05 §5.2, §6.1, §7, §9; `MaterialDefinition` has no doc 05 field shape, adopted the `{id, displayName, tags}` shape from `docs/dev/implementation/m1-artefact-generation.md` — doc 05 §15's richer geological/cultural fields deferred until `GeologicalContext`/`CulturalProfile` exist; `ClassifiedArtefact.decorativeLayers`/`.provenance` now import the real `DecorativeLayer`/`Provenance` from `decoration.ts`/`world.ts`, both landed with 1FD.13/1FD.16)
- [x] 1FD.13. `src/lib/types/decoration.ts` — `DecorativeTechnique`, `DecorativeLayer` (doc 05 §8.2–§8.3; `DecorativeTechnique` is a flat 16-member union, not a discriminated union with per-technique params, since `DecorativeLayer` only carries generic `motifRef?`/`material?` slots; material-prerequisite rules are engine/data-layer concerns, not typed here — see roadmap 2GN.28/2GN.30; resolves the `TODO(1FD.13)` stand-in in `artefact.ts`)
- [x] 1FD.14. `src/lib/types/world.ts` — `WorldSeed`, `PhaseCharacteristics`, `CulturePhase`, `CultureTimeline`, `CulturalProfile`, `Culture`, `CraftInvestmentProfile`, `MotifSet`, `MotifDefinition`, `WorldChronology` (doc 05 §2, §3.1–§3.3; `MotifSet`/`MotifDefinition` are invented, provisional, not doc-specified — minimal shape so `DecorativeLayer.motifRef` can reference one by id; `CulturalProfile`'s JSDoc flags the unrelated same-named type in doc 06 §3.3; built together with 1FD.15/1FD.16 in the same file since `CraftInvestmentProfile` and `WorldChronology` reference their types directly)
- [x] 1FD.15. `src/lib/types/world.ts` — `MaterialFlow`, `RelationshipDynamics`, `RelationshipPhase`, `CultureRelationship` (doc 05 §3.4, fully specified verbatim; built alongside 1FD.14/1FD.16)
- [x] 1FD.16. `src/lib/types/world.ts` — `SiteType`, `PreservationState`, `DepositionType`, `Provenance`, `AvailabilityLevel`, `RegionalAvailability`, `GeologicalContext` (doc 05 §3.5–§3.6, fully specified verbatim; `Provenance`'s JSDoc distinguishes it from `MaterialProvenance` in `artefact.ts`; resolves the `TODO(1FD.16)` stand-in in `artefact.ts`; built alongside 1FD.14/1FD.15)
- [x] 1FD.18. `src/lib/types/interpretation.ts` — `Confidence`, `Observation`, `EvidenceLink`, `InferenceScope`, `Inference`, `Hypothesis`, `InterpretiveModel` (doc 06 §2.1–§2.3, doc 08 §3.2; `InterpretiveModel` uses the doc 08 §3.2 "claims" shape rather than doc 06 §6's "knowledge layers" shape — the two docs conflict, and doc 08's version matches this roadmap's own field ownership (1FD.19, 1FD.25) and the concrete store-construction code in doc 08 §3.4; `Observation.observationRegister` is typed as the inline MVP three-value union pending `DescriptionRegister` from 1FD.20/1FD.31; `InterpretiveModel`'s five 1FD.19-owned fields were private `unknown` placeholders until 1FD.19 landed, its two 1FD.25-owned fields still are)
- [x] 1FD.19. `src/lib/types/interpretation.ts` — `MethodologicalBias`, `CulturalClaim`, `ArtefactClaim`, `ChronoClaim`, `AgentAssessment`, `MethodologicalProfile` (doc 08 §3.2 names all five as `InterpretiveModel` members but gives no field shapes; authored against downstream consumers instead — the contradiction detector's `agentClaim: { claimId, claim }` contract (doc 06 §4.2, 1FD.24) requires `id` + `claim: string` on the three claim types, and the player store's `Map` usage (doc 08 §3.4) requires `id`-keying and a `status` union including `'active'`, reusing the `'active' | 'challenged' | 'retracted'` union already on `Inference`/`Hypothesis`; `MethodologicalBias` is an authored union — `'materialist' | 'structuralist' | 'culturalist'` from doc 07 §5.1 plus an authored `'generalist'` neutral member so the union stays total (no optional `bias` field) and `MethodologicalProfile` has a sensible non-empty default (`bias: 'generalist'`, all `weights` at `1.0`) for the `defaultMethodology()` factory, 3WS.11; strain lives in `HypothesisStrain`, 1FD.25 — the name `StrainScore` is retired; resolves the five same-file `TODO(1FD.19)` stand-ins in `interpretation.ts`)
- [x] 1FD.26. `src/lib/types/career.ts` — `Reputation`, `ReputationModifier`, `ReputationGate`, `CareerState`, `AcademicRole`, `CareerActivity`, `ActivityType` (doc 07 §2, §2.2, §4.0–§4.1, fully specified verbatim and self-contained; `CareerActivity.outcomes: ActivityOutcome[]` needed an invented, provisional `ActivityOutcome` shape — doc 07 names it only as a comment, "Possible results", with no roadmap task owning it)
- [x] 1FD.32. `src/lib/types/visibility.ts` — `PropertyVisibility` (string-literal union, not a TS `enum`, per the convention already committed in `artefact.ts`'s module JSDoc), `PROPERTY_VISIBILITY_VALUES`, `isPropertyVisibility` (doc 11 §2.7 authoritative; helpers kept minimal since there's no consumer yet — `lens.ts`, 1FD.20, is the first)
- [x] 1FD.17. `src/lib/types/world.ts` — `DatingFramework`, `LayerDating`, `DatingMethod` (doc 05 §4.7, fully specified verbatim; `DatingConfidence` hoisted from the doc's inline union on `DatingFramework.confidence` per the `ClaimStatus` precedent in interpretation.ts — `ProvenancePresentation.dating`, 1FD.31, is the second consumer)
- [x] 1FD.28. `src/lib/types/term.ts` — `TermType`, `AcademicYear`, `TermState`, `BackgroundDrain`, `CompletedAction` (doc 08 §3.6 verbatim, which supersedes doc 07's older sketches per doc 12 §2.9), constants (`WEEKS_PER_TERM`, `TERMS_PER_YEAR`, plus `WEEKS_PER_YEAR` from the same doc block), helpers (`termStartWeek`, `weekInTerm`, `termIndexFromWeek`, `yearFromTerm`; all 0-based per doc 11 §2.8, covered by `term.test.ts`; `getTermType(termIndex)` deliberately excluded — it belongs to 9CR.20, `engine/career/progression.ts`)
- [x] 1FD.20. `src/lib/types/lens.ts` — `LensStrength`, `ObservationSalience`, `ClassificationSuggestion`, `CrossReference`, `DescriptionFrame`, `OmissionCheck`, `LensState` (doc 04 §3.1–§3.5, §4, incl. the graduated dissemination factor with 0.15 presented per doc 12 §2.16; `LensState` is named by doc 06 §6 and 6LS.2/6LS.4 but shaped nowhere — landed as a flagged provisional design, per-hypothesis `strengths` Map + aggregated `tagWeights` + `computedAtTerm`, to firm up at 6LS.2/6LS.3; also owns `DescriptionRegister` (doc 04 §3.4), moved here from the 1FD.31 bullet because `DescriptionFrame` keys a `Record` on it and description.ts already imports lens.ts, keeping imports one-directional; resolves the `observationRegister` inline-union TODO in interpretation.ts from 1FD.18)
- [x] 1FD.31. `src/lib/types/description.ts` — `DescriptionTemplate`, `DescriptionVariant`, `ArtefactPresentation`, `PresentedObservation`, `TagSuggestion`, `ProvenancePresentation` (doc 05 §13.1–§13.2; both `register` fields narrowed from the doc's five-value `ObservationRegister` to the three-value `DescriptionRegister` per doc 12 §2.10 — the five-register model + `RegisterAccess` is post-MVP, doc 13 §4; `DescriptionRegister` itself lives in lens.ts under 1FD.20, imported here; `ProvenancePresentation` is named by `ArtefactPresentation.provenance` but shaped nowhere — landed as a flagged provisional player-visible projection of world.ts `Provenance`, `cultureId`/`phaseId`/`year` deliberately absent with an optional corpus-derived `dating` block per doc 05 §4.7, to firm up at 2GN.38)

**Test infrastructure**

- [x] 1FD.34. Configure `deno test`, verify runner executes against engine skeleton (`deno task test` wired in `deno.json`; `@std/assert@^1.0.19` added; `tsconfig.json` excludes `*.test.ts` from `svelte-check` since Deno test files use `Deno.ns`/`jsr:` specifiers svelte-check can't resolve)
- [x] 1FD.35. Create test fixture helpers — mock culture, mock world seed, mock artefact factories (split per-domain, mirroring `src/lib/types/`: `tests/fixtures/world.ts` keeps `mockWorldSeed`, now returning the real `WorldSeed` instead of a local stand-in; `tests/fixtures/culture.ts` adds `mockCulture`; `tests/fixtures/artefact.ts` adds `mockNormalisedArtefact` and `mockArtefact`; each takes a shallow-merge `overrides` param that replaces whole top-level branches rather than deep-merging, since several fields are `Map`s or multi-level nested objects; `tsconfig.json`'s `exclude` extended to `tests/**/*.test.ts` alongside the existing `src/**/*.test.ts` for the same Deno-only reason)

**Project Explorer shell**

- [x] 1FD.36. Create route `/dev/explorer` with layout and nav (sub-route model: each future panel is a child route under `src/routes/dev/explorer/` plus one entry in the route-private `panels.ts` registry — `{id, label, path, milestone, status}` — which drives both the sidebar `menu` nav and the overview landing table; planned M1 panels render as `menu-disabled` placeholders until 1FD.38/39 flip their status; seed input, 1FD.37, is a shell control not a panel — the layout's header bar reserves its right-hand mount point; `src/routes/dev/+layout.ts` guards the whole `/dev` subtree with a 404 outside `dev` builds; also created the root `src/routes/+layout.svelte` as a prerequisite fix — nothing imported `app.css`, so Tailwind/DaisyUI styles never loaded anywhere)
- [x] 1FD.37. Seed input field component (route-private `SeedInput.svelte` mounted in the layout header's reserved slot; the seed lives in the `?seed=` URL query param so it survives reload and repro cases are shareable via link — `seed.ts` owns `DEFAULT_SEED` and `getSeed(url)`, with absent/empty falling back to the default and committing the default or an empty value removing the param; the layout nav and overview table links now carry `page.url.search` so the seed survives panel switches)
- [x] 1FD.38. PRNG output display (child route `prng/+page.svelte` per the 1FD.36 sub-route model, `panels.ts` entry flipped to `available`; draws N values — default 20, clamped 1–1000 — from two *independent* `createPrng(seed)` instances and compares index-by-index with exact float equality; the visual determinism check is a badge verdict plus per-row ✓/✗ over full-precision values; everything is `$derived` from the URL seed and N, so changing the header seed regenerates the panel live with no generate button)
</details>

<details>
<summary><a name="m2"><h3>Milestone 2: Generation Pipeline</h3></a></summary>

> [!IMPORTANT]
> **Goal:** Artefact generation per doc 05 — per-artefact stages 4–8 (grammar → normalisation/plausibility → materials → decoration → unified feature extraction + classification), description templates (stage 9), plus excavation composition and initial corpus (stage 3, generated against mock world fixtures until 3WS.15 wires real `WorldState`)

<a name="m2-doing"><h4>In Progress (Milestone 2)</h4></a>

<a name="m2-todo"><h4>To Do (Milestone 2)</h4></a>

**Static data — primitives & grammar rules**

- [ ] 2GN.2. `src/lib/data/grammars/core.ts` — MVP component grammar rules: `<object>` → `<component-group>+`, `<component-group>` → `<primary-component>` + optional attachments, base weights — **depends on 1FD.10**

**Component grammar engine**

- [ ] 2GN.3. `engine/generation/grammar.ts` — `expandGrammar(rules, culture, phase, prng)`: top-level grammar expansion, selects primary component, expands attachment chains — **depends on 2GN.2**
- [ ] 2GN.4. `engine/generation/grammar.ts` — `selectGrammarOption(rule, culture, phase, prng)`: culture-biased weighted selection with 0.01 floor
- [ ] 2GN.5. `engine/generation/grammar.ts` — `phaseInfluence(option, phase)`: phase characteristics modify grammar option weights
- [ ] 2GN.6. `engine/generation/grammar.ts` — accumulation checking: `ArrangementPattern` constraint enforcement (symmetric, radial, linear-array, stacked, nested, branching valid counts)
- [ ] 2GN.7. `engine/generation/grammar.ts` — complexity budget derivation from `craftSpecialisation` (simple/moderate/sophisticated thresholds)
- [ ] 2GN.8. `engine/generation/grammar.ts` — normalisation: flatten grammar tree → `NormalisedArtefact` with ordered components, computed dimensions, derived portability
- [ ] 2GN.9. `engine/generation/grammar.ts` — `deriveInspectionDepth(dimensions)` util
- [ ] 2GN.10. `engine/generation/grammar.ts` — `allowedMaterialTags` derivation per component from primitive type + properties compatibility

**Plausibility checker**

- [ ] 2GN.11. `src/lib/data/plausibility.ts` — plausibility rule definitions: requires, excludes, ordering, material-physics, ergonomic predicates
- [ ] 2GN.12. `engine/generation/plausibility.ts` — `checkPlausibility(artefact): { valid, failures }` — **depends on 2GN.8**
- [ ] 2GN.13. `engine/generation/plausibility.ts` — physical viability rules (structural integrity, load paths, cantilever limits)
- [ ] 2GN.14. `engine/generation/plausibility.ts` — ergonomic rules (grip length for edged forms, handleability)
- [ ] 2GN.15. `engine/generation/plausibility.ts` — material-structural compatibility (material tags constrain joins/forms)
- [ ] 2GN.16. `engine/generation/plausibility.ts` — re-expansion loop: on failure, re-expand from grammar up to N attempts

**Tag accumulation & classification**

- [ ] 2GN.17. `src/lib/data/classification.ts` — classification rules: feature→tag scoring, structural/container/decorative/cross-layer contributions — **depends on 1FD.12**
- ~~2GN.18~~ *Removed 2026-07-04: superseded by doc 05 §9 single-pass unified feature extraction (see 2GN.19). Per-component tag breakdowns in the explorer derive from feature-to-tag scoring, not accumulation during expansion.*
- [ ] 2GN.19. `engine/generation/classification.ts` — `extractFeatures(artefact): ExtractedFeatures` — unified feature extraction from components (initially structural features only; 2GN.27 and 2GN.34 complete the doc 05 stage-8 `ExtractedFeatures` contract with material and decorative fields) — **depends on 2GN.12**
- [ ] 2GN.20. `engine/generation/classification.ts` — `classifyArtefact(features, rules): Map<FunctionTag|ContextTag, number>` — rule-based scoring — **depends on 2GN.17, 2GN.19**
- [ ] 2GN.21. `engine/generation/classification.ts` — `physicalLabel` generation from observable properties (neutral, not interpretive)

**Material assignment**

- [ ] 2GN.22. `src/lib/data/materials.ts` — material definitions: id, label, tags, physical properties, geological scarcity, cultural affinity modifiers, decorability — **depends on 1FD.12**
- [ ] 2GN.23. `engine/generation/materials.ts` — `assignMaterial(component, culture, phase, geology, trade, materials, prng): MaterialDefinition` — per-component assignment — **depends on 2GN.12, 2GN.22**
- [ ] 2GN.24. `engine/generation/materials.ts` — `isAvailable(material, geology, trade): boolean` — local + trade availability check
- [ ] 2GN.25. `engine/generation/materials.ts` — `computeMaterialWeight(material, culture, phase): number` — cultural affinity × phase technology
- [ ] 2GN.26. `engine/generation/materials.ts` — `MaterialProvenance` metadata generation (source, origin region, trade path)
- [ ] 2GN.27. `engine/generation/materials.ts` — material influence on tag accumulation (precious metals → elite/ceremonial boosts)

**Decorative grammar**

- [ ] 2GN.28. `src/lib/data/decorations.ts` — decorative technique definitions: surface treatments (polish, patina, scoring, engraving, relief, painting, glaze), applied elements (inlay, overlay, studs, wire-wrapping, gilding), textile elements (wrapping, tassels, beading) with material prerequisites — **depends on 1FD.13**
- [ ] 2GN.29. `engine/generation/decoration.ts` — decorative grammar expansion: iterate surfaces, select techniques weighted by culture + phase — **depends on 2GN.23, 2GN.28**
- [ ] 2GN.30. `engine/generation/decoration.ts` — material prerequisite enforcement (engraving → hard material, glaze → ceramic, etc.)
- [ ] 2GN.31. `engine/generation/decoration.ts` — layering support: `DecorativeLayer` with sublayers, decoration-on-decoration
- [ ] 2GN.32. `engine/generation/decoration.ts` — recursion depth cap from `craftSpecialisation` × `aesthetics.decorativeEmphasis`
- [ ] 2GN.33. `engine/generation/decoration.ts` — motif assignment from culture's `motifVocabulary`, shared motifs via cultural exchange
- [ ] 2GN.34. `engine/generation/classification.ts` — update: decorative features contribute to unified tag accumulation (decorativeComplexity, preciousMaterials, motifOrigins)

**Description & register system**

- [ ] 2GN.35. `src/lib/data/descriptions/observational/` — observational register templates per component type and decorative technique — **depends on 1FD.31**
- [ ] 2GN.36. `src/lib/data/descriptions/interpretive/` — interpretive register templates with function tag variants — **depends on 1FD.31**
- [ ] 2GN.37. `src/lib/data/descriptions/technical/` — technical register templates (craft-process, manufacturing) — **depends on 1FD.31**
- [ ] 2GN.38. `engine/generation/description.ts` — `generateDescription(artefact, registers): ArtefactPresentation` — assemble ordered observation list per component — **depends on 2GN.34, 2GN.35, 2GN.36, 2GN.37**
- [ ] 2GN.39. `engine/generation/description.ts` — template expansion: parameterised template system with property slots
- [ ] 2GN.40. `engine/generation/description.ts` — per-component descriptions in all three registers for structural components
- [ ] 2GN.41. `engine/generation/description.ts` — per-layer descriptions for decorative elements (techniques, motifs, materials)
- [ ] 2GN.42. `engine/generation/description.ts` — `physicalLabel` composite label from observable properties
- [ ] 2GN.43. `engine/generation/description.ts` — provenance description: site name, context type, approximate dating, condition

**Excavation composition**

- [ ] 2GN.44. `engine/generation/excavation.ts` — excavation composition: generate artefact batches with contextual juxtapositions (settlement + ritual intrusion, burial + trade goods, workshop + prestige item) — **depends on 2GN.38**
- [ ] 2GN.45. `engine/generation/excavation.ts` — ambiguity distribution targets (~30-40% clear, ~40-50% moderate, ~20-30% high)
- [ ] 2GN.46. `engine/generation/excavation.ts` — soft batch monitoring: measure interpretive challenge distribution, steer next excavation if skewed
- [ ] 2GN.47. `engine/generation/excavation.ts` — provenance generation: site name, site type (weighted by culture), region, layer, associated finds, preservation state, deposition type (doc 08's `engine/world/provenance.ts` is folded in here) — **depends on 2GN.66**

**Corpus generation**

> [!NOTE]
> M2 corpus tasks run against mock world fixtures (1FD.35); real `WorldState` data replaces the mocks at 3WS.15. Doc 05 sequences corpus as stage 3 (after world generation); building it here against fixtures keeps M2 self-contained without inverting that order at runtime.

- [ ] 2GN.48. `engine/world/scholars.ts` — `generateNPCScholars(world, prng): NPCScholarSeed[]` — 3-4 NPCs with name, specialisation, career stage — **depends on 2GN.44, 2GN.66**
- [ ] 2GN.49. `engine/world/scholars.ts` — NPC `InterpretiveModel` generation: cultural/artefact/chrono claims with calibrated wrongness (~70% correct, ~30% wrong)
- [ ] 2GN.50. `engine/generation/corpus.ts` — `simulateExcavations(npcs, world, prng): SimulatedExcavation[]` — 6-8 campaigns biased by NPC preferences
- [ ] 2GN.51. `engine/generation/corpus.ts` — `generatePublications(npcs, excavations, world, prng): DocumentNode[]` — ~15-20 summary publications with lineage and commitments
- [ ] 2GN.52. `engine/generation/corpus.ts` — coverage gap generation: `CoverageBudget` with culture/site/period bias, guaranteed gaps per culture
- [ ] 2GN.53. `engine/generation/corpus.ts` — `aggregateCorpus(publications): ProfessionalCorpus` — material/form frequencies, context associations, active debates, consensus
- [ ] 2GN.54. `engine/generation/corpus.ts` — dating framework generation per site: layer datings, methods, error margins, some deliberately wrong
- [ ] 2GN.55. `engine/generation/corpus.ts` — calibrated wrongness distribution: interpretive errors, absence claim errors, rarity assessment errors, cross-cultural errors

**Static data — names**

- [ ] 2GN.66. `src/lib/data/names/` — naming grammars for sites, cultures, scholars (doc 08 `data/names/`) — **depends on 1FD.14**

**Pipeline orchestrator**

- [ ] 2GN.56. `engine/generation/pipeline.ts` — `runGenerationPipeline(world, culture, period, prng): ClassifiedArtefact` — full 9-stage orchestrator — **depends on 2GN.53**

**Explorer extensions**

- [ ] 2GN.57. Explorer: structure viewer tab — generate from seed + culture selector, component tree with join types
- [ ] 2GN.58. Explorer: plausibility panel — generate N structures, show pass/fail with rejection reasons, running rejection rate
- [ ] 2GN.59. Explorer: tag inspector — tag map as scored bar chart, per-component contribution breakdown
- [ ] 2GN.60. Explorer: material viewer — resolved material per component, culture bias breakdown (scarcity vs affinity vs trade)
- [ ] 2GN.61. Explorer: decoration inspector — decoration layers per component with prerequisites, technique, layer depth
- [ ] 2GN.62. Explorer: description viewer — three-register prose side by side, register divergence highlighting
- [ ] 2GN.63. Explorer: excavation viewer — artefacts grouped by site, ambiguity distribution chart
- [ ] 2GN.64. Explorer: corpus browser — NPC researchers, publications, dating frameworks, coverage gaps, correct vs wrong claim toggle
- [ ] 2GN.65. Explorer: pipeline stage viewer — stage-by-stage output display

<a name="m2-blocked"><h4>Blocked (Milestone 2)</h4></a>

<a name="m2-done"><h4>Completed (Milestone 2)</h4></a>

**Static data — primitives & grammar rules**

- [x] 2GN.1. `src/lib/data/grammars/primitives.ts` — geometric primitive defs (elongated, cylindrical, flat-broad, hollow-enclosed, ring-form, disc-form, bar-form, sheet-form) with parameter enums — **depends on 1FD.10** (doc 05 §5.3 transcribed verbatim as a single `as const` `PRIMITIVE_PARAMETERS` registry — primitive id → parameter name → ordered value list — with `PrimitiveType` derived via `keyof typeof`, a flagged deviation from the interfaces-first convention per the `Serialised<T>` zero-drift precedent in save.ts; "parameter enums" realised as string-literal value lists per the no-`enum` convention committed in artefact.ts; parameters deliberately scoped per primitive, no shared unions — `crossSection` and `taper` carry different value-sets across primitives; `PRIMITIVE_TYPES` array + `isPrimitiveType` guard round out the union-values-guard trio per the visibility.ts precedent; material-tag compatibility stays with 2GN.10, dimension derivation with 2GN.8, selection weights with 2GN.2/2GN.4 — this module is data only, no `MaterialTag` import needed; covered by 7 Deno tests asserting the eight-primitive vocabulary, per-primitive parameter names and verbatim spot-checked value lists)
</details>

<details>
<summary><a name="m3"><h3>Milestone 3: World State & Integration</h3></a></summary>

> [!IMPORTANT]
> **Goal:** WorldState generation (seed → chronology → cultures), stores architecture, pipeline integration with real culture data

<a name="m3-doing"><h4>In Progress (Milestone 3)</h4></a>

<a name="m3-todo"><h4>To Do (Milestone 3)</h4></a>

**World generation engine**

- [ ] 3WS.1. `engine/world/seed.ts` — `createWorldSeed(raw: string): WorldSeed` — seed string → PRNG — **depends on 2GN.56**
- [ ] 3WS.2. `engine/world/chronology.ts` — `generateChronology(seed, prng): WorldChronology` — startYear, endYear, presentYear, culture-relative periodisation (no shared timeline)
- [ ] 3WS.3. `engine/world/culture.ts` — `generateCultures(prng, count): Culture[]` — culture generation with `CulturalProfile` (materialAffinities, motifVocabulary, craftInvestment)
- [ ] 3WS.4. `engine/world/culture.ts` — `generatePhases(culture, prng): CulturePhase[]` — 3-4 phases per culture with `PhaseCharacteristics` (technology, economy, society, aesthetics)
- [ ] 3WS.5. `engine/world/culture.ts` — `generateRelationships(cultures, prng): CultureRelationship[]` — temporal relationship phases with trade, conflict, cultural exchange, politics
- [ ] 3WS.6. `engine/world/culture.ts` — `MaterialFlow` generation within relationships (tag, materials, direction, volume)
- [ ] 3WS.7. `engine/world/seed.ts` — geological context generation: `GeologicalContext` with material availability per region, `AvailabilityLevel` per material
- [ ] 3WS.8. `engine/world/culture.ts` — motif vocabulary generation per culture (distinctive sets for cultural fingerprinting)
- [ ] 3WS.9. `engine/world/seed.ts` — `createWorld(seed: string): WorldState` — full orchestrator: chronology + cultures + geology + relationships

**Store refactor**

> [!NOTE]
> `termState` is deliberately deferred to 9CR.21; it depends on the energy/term mechanics built in M9. Doc 08 §3.3 and doc 09 Phase 12 include it in this refactor, but do not create it here.

- [ ] 3WS.10. `src/lib/stores/worldState.svelte.ts` — reactive wrapper: chronology, artefacts, sites, scholars, documents, lineage graph, venues, career events — **depends on 3WS.9**
- [ ] 3WS.11. `src/lib/stores/playerInterpretation.svelte.ts` — reactive wrapper around player's `InterpretiveModel` with immutable update methods (placeholder)
- [ ] 3WS.12. `src/lib/stores/lensState.svelte.ts` — lens state store (placeholder, computed later)
- [ ] 3WS.13. `src/lib/stores/ui.svelte.ts` — UI state: selected artefact, active panel
- [ ] 3WS.14. `src/lib/stores/gameState.svelte.ts` — orchestrator: imports all stores, provides `initialise(seed)`, `surfaceArtefact()`, `refreshLens()`, cross-store coordination

**Pipeline integration**

- [ ] 3WS.15. `engine/generation/pipeline.ts` — replace mock culture profiles with real `WorldState` data throughout — **depends on 3WS.14**
- [ ] 3WS.16. End-to-end determinism verification: same seed + same position → identical artefacts

**Explorer extensions**

- [ ] 3WS.17. Explorer: chronology timeline with period boundaries
- [ ] 3WS.18. Explorer: culture profiles with bias summaries
- [ ] 3WS.19. Explorer: culture relationship graph visualisation
- [ ] 3WS.20. Explorer: store inspector panel — live view of `worldState`, `playerInterpretation` contents (`termState` added at 9CR.21)

<a name="m3-blocked"><h4>Blocked (Milestone 3)</h4></a>

<a name="m3-done"><h4>Completed (Milestone 3)</h4></a>
</details>

<details>
<summary><a name="m4"><h3>Milestone 4: Player Interface</h3></a></summary>

> [!IMPORTANT]
> **Goal:** Basic UI for artefact inspection (multi-component descriptions, register switching, provenance display)

<a name="m4-doing"><h4>In Progress (Milestone 4)</h4></a>

<a name="m4-todo"><h4>To Do (Milestone 4)</h4></a>

**Components**

- [ ] 4UI.1. `components/study/ArtefactInspector.svelte` — main artefact display shell (replaces `ItemGenerator.svelte`) — **depends on 3WS.15**
- [ ] 4UI.2. `components/study/PropertyList.svelte` — ordered list of artefact properties with register-specific descriptions
- [ ] 4UI.3. `components/shared/TagBadge.svelte` — tag display badge component
- [ ] 4UI.4. `components/shared/ConfidenceBadge.svelte` — confidence level badge
- [ ] 4UI.5. Component list UI — materials, features, decorative layers per component — **depends on 4UI.1**
- [ ] 4UI.6. Provenance display — site, culture label, period, context, dating framework from corpus — **depends on 4UI.5**

**Routes & wiring**

- [ ] 4UI.7. `routes/study/+page.svelte` — artefact study workspace: generates artefact, displays inspector — **depends on 4UI.6**
- [ ] 4UI.8. Register switching UI — toggle between observational, interpretive, technical descriptions — **depends on 4UI.6**
- [ ] 4UI.9. "Generate New Artefact" action wired through `gameState.surfaceArtefact()` — **depends on 4UI.6**

<a name="m4-blocked"><h4>Blocked (Milestone 4)</h4></a>

<a name="m4-done"><h4>Completed (Milestone 4)</h4></a>
</details>

<details>
<summary><a name="m5"><h3>Milestone 5: Knowledge Model</h3></a></summary>

> [!IMPORTANT]
> **Goal:** Player's `InterpretiveModel` (observations, inferences, hypotheses), document library, evidence chains

<a name="m5-doing"><h4>In Progress (Milestone 5)</h4></a>

<a name="m5-todo"><h4>To Do (Milestone 5)</h4></a>

**Observation engine**

- [ ] 5KN.1. `engine/interpretation/claims.ts` — `createObservation(artefactId, componentRef?, decorativeRef?, content, tags, confidence, epistemicMode, register): Observation` — full `Observation` shape per doc 06 §2.1 — **depends on 4UI.6**
- [ ] 5KN.2. `engine/interpretation/claims.ts` — `reviseObservation(id, newContent, newConfidence)` with superseded-by chain
- [ ] 5KN.3. `engine/interpretation/claims.ts` — `ArtefactStudy` creation: collection of observations for a single artefact

**Observation store & UI**

- [ ] 5KN.4. `playerInterpretation.svelte.ts` — full implementation: `addObservation()`, `updateObservation()`, `deleteObservation()`, `addArtefactStudy()`, reactive getters by artefact — **depends on 5KN.1**
- [ ] 5KN.5. `components/study/ObservationEditor.svelte` — text editor for observation notes, attached to component/group/decorative element — **depends on 5KN.4**
- [ ] 5KN.6. Confidence level selector (speculative/tentative/confident/certain) — **depends on 5KN.5**
- [ ] 5KN.7. Epistemic mode toggle (observational vs interpretive) — **depends on 5KN.5**
- [ ] 5KN.8. Tag assignment on observations (`FunctionTag`/`ContextTag` multi-select) — **depends on 5KN.5**
- [ ] 5KN.9. Observation list per artefact: view, edit, delete — **depends on 5KN.5**

**Inference & hypothesis engine**

- [ ] 5KN.10. `engine/interpretation/inference.ts` — `createInference(conclusion, evidenceChain, tags, scope, confidence): Inference` — link observations across artefacts — **depends on 5KN.1**
- [ ] 5KN.11. `engine/interpretation/inference.ts` — evidence chain validation: ensure all source IDs exist, roles valid
- [ ] 5KN.12. `engine/interpretation/claims.ts` — `createHypothesis(title, statement, supportingInferences, tags, scope, confidence): Hypothesis` — **depends on 5KN.10**
- [ ] 5KN.13. `engine/interpretation/claims.ts` — hypothesis status management: `active` → `challenged` → `retracted` transitions
- [ ] 5KN.14. `engine/interpretation/inference.ts` — `createInferenceProof(title, conclusion, chain)`: structured evidence chain with explicit assumption steps — **depends on 5KN.10**

**Inference & hypothesis store & UI**

- [ ] 5KN.15. `playerInterpretation.svelte.ts` extensions: `addInference()`, `addHypothesis()`, `addInferenceProof()`, `addMaterialGeneralisation()` — **depends on 5KN.10**
- [ ] 5KN.16. `components/study/TagSelector.svelte` — tag selection UI for observations, inferences, hypotheses — **depends on 5KN.5**
- [ ] 5KN.17. Inference chain builder UI: select observations across artefacts, link into evidence chain, specify roles — **depends on 5KN.15**
- [ ] 5KN.18. Hypothesis editor: title, statement, link supporting inferences, set confidence — **depends on 5KN.17**
- [ ] 5KN.19. Inference proof editor: structured evidence chain with explicit assumption steps per step — **depends on 5KN.17**

**Document library**

- [ ] 5KN.20. `engine/interpretation/claims.ts` — document type definitions (artefact studies, material generalisations, inference proofs) — **depends on 5KN.12**
- [ ] 5KN.21. `components/library/DocumentList.svelte` — document library listing all player documents — **depends on 5KN.20**
- [ ] 5KN.22. `components/library/DocumentEditor.svelte` — draft creation, commitment editing for working documents — **depends on 5KN.20**
- [ ] 5KN.23. `routes/library/+page.svelte` — document library route — **depends on 5KN.21**
- [ ] 5KN.24. `routes/library/[documentId]/+page.svelte` — individual document view/edit — **depends on 5KN.22**

**Explorer extensions**

- [ ] 5KN.25. Explorer: interpretive model viewer — browse observations, observation-to-artefact linkages, confidence levels
- [ ] 5KN.26. Explorer: evidence graph — observations → inferences → hypotheses with dependency edges, orphaned node highlighting

<a name="m5-blocked"><h4>Blocked (Milestone 5)</h4></a>

<a name="m5-done"><h4>Completed (Milestone 5)</h4></a>
</details>

<details>
<summary><a name="m6"><h3>Milestone 6: Lens System</h3></a></summary>

> [!IMPORTANT]
> **Goal:** Lens computation from hypotheses, presentation effects (salience, classification, framing, omission)

<a name="m6-doing"><h4>In Progress (Milestone 6)</h4></a>

<a name="m6-todo"><h4>To Do (Milestone 6)</h4></a>

**Lens strength computation**

- [ ] 6LS.1. `engine/lens/strength.ts` — `computeLensStrength(hypothesis, model, documents, venues): LensStrength` — dissemination (private 0, circulated 0.1, presented 0.15, submitted 0.2, published 0.3, collected 0.35), venuePrestige (0-1 multiplier), confidence (0-1), evidenceCount (log2×0.1, cap 0.3), taught (+0.2), cited (0.05/citation, cap 0.2), contradictions (-0.1 each), sabbatical (-0.15) — **depends on 5KN.12**
- [ ] 6LS.2. `engine/lens/strength.ts` — `computeLens(model, documents, venues): LensState` — full lens state from all hypotheses
- [ ] 6LS.3. `engine/lens/strength.ts` — per-tag lens weights: each hypothesis contributes specific tag boosts/suppressions based on tags + strength
- [ ] 6LS.4. `engine/lens/strength.ts` — `computeLensWithDecay(model, documents, venues, termIndex): LensState` — natural decay (-0.02/term unpublished, -0.01/term published), contradiction pressure (-0.05/term cumulative), sabbatical flat reduction
- [ ] 6LS.5. `lensState.svelte.ts` — full implementation: reactive lens state, `update(newLens)`, derived per-tag weight getters — **depends on 6LS.2**

**Lens presentation effects**

- [ ] 6LS.6. `engine/lens/salience.ts` — `computeSalience(artefact, lensState): ObservationSalience[]` — reorder properties by hypothesis alignment, finalWeight clamped [0.1, 3.0], below-threshold → "on closer inspection" — **depends on 6LS.5**
- [ ] 6LS.7. `engine/lens/classification.ts` — `adjustClassificationSuggestions(baseTags, lensState): ClassificationSuggestion[]` — boost/suppress tag scores by lens alignment — **depends on 6LS.5**
- [ ] 6LS.8. `engine/lens/crossReference.ts` — `computeCrossReferences(artefact, model, lensState): CrossReference[]` — related artefacts with hypothesis-biased matching, `potentiallyMisleading` flag — **depends on 6LS.5**
- [ ] 6LS.9. `engine/lens/framing.ts` — `selectDescriptionFrame(property, lensState, registers): DescriptionFrame` — lens selects register + within-register variant — **depends on 6LS.5**
- [ ] 6LS.10. `engine/lens/omission.ts` — `computeOmissions(artefact, lensState): OmissionCheck[]` — de-emphasise contradicting properties, suppression capped — **depends on 6LS.5**
- [ ] 6LS.11. `ArtefactPresentation` assembly update — use lens for `primaryObservations` sorting, `suggestedTags` boosting, `crossReferences` priming, description framing — **depends on 6LS.6, 6LS.7, 6LS.8, 6LS.9, 6LS.10**

**Lens UI**

- [ ] 6LS.12. Description update on re-inspection — descriptions change when player revisits artefacts after forming hypotheses — **depends on 6LS.11**
- [ ] 6LS.13. "On closer inspection" expandable section for low-salience properties — **depends on 6LS.11**
- [ ] 6LS.14. Cross-reference suggestions panel — **depends on 6LS.8**
- [ ] 6LS.15. Raw data drill-down toggle — bypass lens to see unfiltered properties — **depends on 6LS.11**

**Explorer extensions**

- [ ] 6LS.16. Explorer: lens state panel — current weights per tag, contributing hypotheses, strength formula breakdown
- [ ] 6LS.17. Explorer: lens diff panel — side-by-side lens-on vs lens-off, salience changes, tag adjustments, suppressed properties

<a name="m6-blocked"><h4>Blocked (Milestone 6)</h4></a>

<a name="m6-done"><h4>Completed (Milestone 6)</h4></a>
</details>

<details>
<summary><a name="m7"><h3>Milestone 7: Contradictions</h3></a></summary>

> [!IMPORTANT]
> **Goal:** Contradiction detection (player vs world + corpus), strain accumulation, diegetic surfacing, retcon flow

<a name="m7-doing"><h4>In Progress (Milestone 7)</h4></a>

<a name="m7-todo"><h4>To Do (Milestone 7)</h4></a>

**Contradiction detection**

- [ ] 7CD.1. `engine/contradiction/detection.ts` — `detectContradictions(artefact, model, worldState, corpus): Contradiction[]` — agent-generic detector — **depends on 6LS.5**
- [ ] 7CD.2. `engine/contradiction/detection.ts` — material contradiction rules (agent claims culture doesn't use material X, but artefact from that culture contains it)
- [ ] 7CD.3. `engine/contradiction/detection.ts` — temporal contradiction rules (chronology conflicts with stratigraphic evidence)
- [ ] 7CD.4. `engine/contradiction/detection.ts` — cultural contradiction rules (agent's `CulturalClaim`s about a culture contradicted by new artefact evidence; MVP substitutes `CulturalClaim` for the post-MVP cultural-profile document — see Beyond MVP)
- [ ] 7CD.5. `engine/contradiction/detection.ts` — structural contradiction rules (inference chain logical impossibility)
- [ ] 7CD.6. `engine/contradiction/detection.ts` — provenance contradiction rules (context attribution conflicts with origin)
- [ ] 7CD.7. `engine/contradiction/detection.ts` — corpus contradiction rules (agent claims vs professional consensus — NB: corpus may be wrong)
- [ ] 7CD.8. `engine/contradiction/detection.ts` — rarity contradiction rules (perceived rarity diverges from occluded distribution)
- [ ] 7CD.9. `engine/contradiction/detection.ts` — material provenance contradiction rules (wrong explanation for material presence despite correct identification)
- [ ] 7CD.10. `engine/contradiction/detection.ts` — severity scoring: `minor`/`moderate`/`major`/`critical` based on type, evidence weight, stakes
- [ ] 7CD.11. `engine/contradiction/detection.ts` — epistemic mode sensitivity: interpretive-mode observations more contradiction-prone than observational-mode

**Strain model**

- [ ] 7CD.12. `engine/contradiction/strain.ts` — `accumulateStrain(model, termIndex): Map<string, HypothesisStrain>` — per-hypothesis strain from reinterpretations, partial mismatches, missing evidence, peer doubt — **depends on 7CD.1**
- [ ] 7CD.13. `engine/contradiction/strain.ts` — strain threshold: exceeded → hypothesis "stressed", increases surfacing frequency and severity
- [ ] 7CD.14. `engine/contradiction/strain.ts` — decorative mismatch strain: motif outside expected cultural context adds small strain per occurrence

**Surfacing & resolution**

- [ ] 7CD.15. `engine/contradiction/surfacing.ts` — `selectSurfacingChannel(contradiction, channels): DiegeticSurface` — choose channel by type — **depends on 7CD.10**
- [ ] 7CD.16. `engine/contradiction/surfacing.ts` — `impossible-artefact` channel: wrap a detected contradiction as a `DiegeticSurface` referencing the triggering artefact (`artefactId` + `anomaly` per doc 06 §4.5); no artefact generation here
- [ ] 7CD.17. `engine/contradiction/surfacing.ts` — `field-report` channel: site finding that contradicts expectation
- [ ] 7CD.18. `engine/contradiction/surfacing.ts` — escalation: unresolved contradictions increase surfacing frequency per term
- [ ] 7CD.19. `engine/contradiction/resolution.ts` — `traceAffectedChain(contradiction, model): { proofId, brokenStep, affectedDocuments }` — identify challenged proof steps — **depends on 7CD.15**
- [ ] 7CD.20. `engine/contradiction/resolution.ts` — `resolve(contradiction, resolution, explanation): Resolution` — revise/reinterpret/reject
- [ ] 7CD.21. `engine/contradiction/resolution.ts` — revision cascades: revising hypothesis updates all dependent documents
- [ ] 7CD.22. `engine/contradiction/resolution.ts` — `RevisionRecord` creation on each resolution
- [ ] 7CD.23. `engine/contradiction/resolution.ts` — reinterpret strain: each reinterpretation of same hypothesis adds hidden strain
- [ ] 7CD.24. `engine/contradiction/resolution.ts` — reject credibility cost: rejecting evidence costs credibility, increases future contradiction pressure

**Contradiction store & UI**

- [ ] 7CD.25. `playerInterpretation.svelte.ts` extensions: `addContradiction()`, `updateStrain()`, contradiction queue reactive getters — **depends on 7CD.12**
- [ ] 7CD.26. `components/contradiction/ContradictionQueue.svelte` — list of queued contradictions with severity indicators — **depends on 7CD.25**
- [ ] 7CD.27. `components/contradiction/ContradictionDetail.svelte` — full view: evidence, trace to proof steps — **depends on 7CD.19**
- [ ] 7CD.28. `components/contradiction/RetconFlow.svelte` — step-by-step resolution: acknowledge → trace → decide → cascade → record — **depends on 7CD.20**
- [ ] 7CD.29. Cascade visualisation — show affected documents before confirming revision — **depends on 7CD.28**
- [ ] 7CD.30. Resolution outcome display — what changed and why — **depends on 7CD.28**

**Explorer extensions**

- [ ] 7CD.31. Explorer: contradiction inspector — queue with type, severity, strain levels, ground truth comparison
- [ ] 7CD.32. Explorer: surfacing log — chronological record of surfacing events, retcon history with cascade traces

<a name="m7-blocked"><h4>Blocked (Milestone 7)</h4></a>

<a name="m7-done"><h4>Completed (Milestone 7)</h4></a>
</details>

<details>
<summary><a name="m8"><h3>Milestone 8: Persistence</h3></a></summary>

> [!IMPORTANT]
> **Goal:** Save/load infrastructure with IndexedDB, schema versioning, auto-save

<a name="m8-doing"><h4>In Progress (Milestone 8)</h4></a>

<a name="m8-todo"><h4>To Do (Milestone 8)</h4></a>

**Serialisation**

- [ ] 8PS.1. `persistence/serialisation.ts` — `serialiseMap` / `deserialiseMap` utilities for `Map<K,V>` → `[K,V][]` round-tripping — **depends on 7CD.25**
- [ ] 8PS.2. `persistence/serialisation.ts` — `serialiseGameState(state): SaveFile` — full state serialisation (worldState, playerInterpretation, termState; contradiction queue serialised within playerInterpretation; lensState recomputed on load, not persisted)
- [ ] 8PS.3. `persistence/serialisation.ts` — `deserialiseGameState(save): GameState` — full state deserialisation
- [ ] 8PS.4. `persistence/schema.ts` — re-export `SaveFile` and `CURRENT_SAVE_VERSION` from `src/lib/types/save.ts` (canonical home per 1FD.33); add save metadata shape
- [ ] 8PS.5. `persistence/schema.ts` — schema migration: `migrations: Record<number, Migration>`, `migrateSave(save): SaveFile` — sequential migration runner

**IndexedDB adapter**

- [ ] 8PS.6. `persistence/indexeddb.ts` — `saveToIndexedDB(save)`, `loadFromIndexedDB(): SaveFile`, `listSaves()`, `deleteSave(id)` — **depends on 8PS.2**
- [ ] 8PS.7. `persistence/indexeddb.ts` — auto-save: debounced 5-second write on significant player actions — **depends on 8PS.6**

**UI**

- [ ] 8PS.8. Save/load UI — save button, load button, save slot list — **depends on 8PS.6**
- [ ] 8PS.9. Auto-save indicator — **depends on 8PS.7**

**Explorer extensions**

- [ ] 8PS.10. Explorer: persistence inspector — serialised state size, schema version, round-trip diff, export raw JSON

<a name="m8-blocked"><h4>Blocked (Milestone 8)</h4></a>

<a name="m8-done"><h4>Completed (Milestone 8)</h4></a>
</details>

<details>
<summary><a name="m9"><h3>Milestone 9: Career & Publication</h3></a></summary>

> [!IMPORTANT]
> **Goal:** Document tradition system (lineage, dissemination, venues), reputation, publication effects on lens, career progression

<a name="m9-doing"><h4>In Progress (Milestone 9)</h4></a>

<a name="m9-todo"><h4>To Do (Milestone 9)</h4></a>

**Document tradition engine**

- [ ] 9CR.1. `engine/documents/lineage.ts` — document lineage graph: create, query parent/child, compute derivation chains — **depends on 8PS.5**
- [ ] 9CR.2. `engine/documents/dissemination.ts` — `advanceDissemination(documentId, newState, venueId?, worldState): DisseminationResult` — state machine (private → circulated → submitted → published)
- [ ] 9CR.3. `engine/documents/commitments.ts` — `extractCommitments(model, hypothesisIds): string[]` — derive commitments from player's claims for document creation
- [ ] 9CR.4. `engine/documents/form.ts` — `classifyDocumentForm(inputs): { formLabel, formConfidence }` — weighted rule matching
- [ ] 9CR.35. `engine/documents/retraction.ts` — `retractDocument(documentId, scope, worldState): Retraction` — flag node retracted, create `Retraction` record (full/partial per doc 10 §7) — **depends on 9CR.2**
- [ ] 9CR.36. `engine/documents/retraction.ts` — `traceTaintedLineage(retractedDocId, lineageGraph): TaintedLineage[]` — descendant cascade per doc 10 §7.1 (clean/defensible/tainted descendants) — **depends on 9CR.1, 9CR.35**
- [ ] 9CR.37. Retraction UI — retract action on disseminated documents with tainted-lineage audit view — **depends on 9CR.36**
- [ ] 9CR.38. `engine/documents/perception.ts` — `initialisePerception(doc)` on first transition beyond `private`; `updatePerception(doc, worldState)` at term boundaries maintaining `audienceReach`, `takeawayDivergence`, `citationCount` (doc 10 §8/§11); feeds 6LS.1's citation input and 9CR.14's retraction cost — **depends on 9CR.2**

**Venue system**

- [ ] 9CR.5. `engine/documents/venues.ts` — `generateVenues(world, prng): VenueDefinition[]` — 3-5 venues with structural properties (containerModel, temporalMode, editorialProcess, audienceEncounter, scope) — **depends on 9CR.1**
- [ ] 9CR.6. `engine/documents/venues.ts` — venue prestige computation from properties (editorial rigour × scope × reach × establishment)

**Reputation engine**

- [ ] 9CR.7. `engine/career/reputation.ts` — `Reputation` computation: five dimensions (rigour, breadth, originality, reliability, influence) with weighted composite `overall` — **depends on 9CR.2**
- [ ] 9CR.8. `engine/career/reputation.ts` — `applyReputationModifier(reputation, modifier): Reputation` — apply event-driven changes with decay
- [ ] 9CR.9. `engine/career/reputation.ts` — reputation change table implementation: all events from doc 07 (publish, retract, cite, resolve contradiction, etc.)
- [ ] 9CR.10. `engine/career/reputation.ts` — `ReputationGate` evaluation: check dimension thresholds for activity gating

**Publication effects**

- [ ] 9CR.11. `engine/career/events.ts` — `DisseminationCareerEffect` generation: reputation effects scaled by venue properties per dissemination transition — **depends on 9CR.7**
- [ ] 9CR.12. Claim magnitude system: `ClaimMagnitude` determination (confirmation/extension/challenge/novel) relative to professional corpus — **depends on 9CR.7**
- [ ] 9CR.13. Publication effects on lens strength: dissemination state graduated contribution (private 0, circulated 0.1, presented 0.15, submitted 0.2, published 0.3, collected 0.35) × venue prestige — **depends on 9CR.6**
- [ ] 9CR.14. `engine/career/reputation.ts` — retraction reputation cost implementation — **depends on 9CR.7, 9CR.35, 9CR.38**

**Career progression engine**

- [ ] 9CR.15. `engine/career/progression.ts` — `evaluateCareerProgress(scholar, worldState, termIndex): CareerEvent[]` — role advancement checks at term boundaries — **depends on 9CR.7**
- [ ] 9CR.16. `engine/career/progression.ts` — `RoleRequirement` evaluation: reputation, published docs, min venue prestige, min terms in role (activities requirement stubbed for MVP: junior-lecturer uses `activities: []`; activity execution is deferred post-MVP per doc 07 §7)
- [ ] 9CR.17. `engine/career/progression.ts` — background drain profiles per role: postdoc (0), junior lecturer (2.0/week), senior lecturer (3.5), reader (4.0), professor (5.0) — sub-components (teaching, admin, supervision)
- [ ] 9CR.18. `engine/career/progression.ts` — `calculateBaseEnergy(scholar): number` — base energy from role and career state
- [ ] 9CR.19. `engine/career/progression.ts` — `calculateEnergyCarryOver(remaining): number` — carry-over between terms
- [ ] 9CR.20. `engine/career/progression.ts` — `getTermType(termIndex): TermType` — derive term type from index position in year cycle
- [ ] 9CR.39. Dating commissioning — `commissionDating(artefactId, worldState)` gated by `ReputationGate` (doc 09 Phase 21: dating facility access at appropriate career stages); returns independent dating from the world's dating framework, giving the player a route to challenge wrong corpus frameworks (doc 06) — **depends on 9CR.10**

**Term state**

- [ ] 9CR.21. `src/lib/stores/termState.svelte.ts` — full term state: currentTermIndex, absoluteWeek, termType, weekCapacity, weeksAllocated, energyBudget, energyRemaining, backgroundDrains, completedActions, activeActivities — **depends on 9CR.17**
- [ ] 9CR.22. Term boundary orchestration in `gameState`: `completeTerm()` — advance dissemination, update document perception, accumulate strain, recompute lens with decay, career checks, venue cycles, energy replenishment — **depends on 9CR.21, 9CR.38**
- [ ] 9CR.23. Summer-research term: correctly exclude teaching drains, higher effective energy budget — **depends on 9CR.20**
- [ ] 9CR.24. Sabbatical engine hooks: career-state flag zeroes all background drains for the term and feeds the -0.15 lens modifier consumed by 6LS.1/6LS.4; no player-facing availability in MVP (Reader/Professor gating and cooldown are post-MVP — see Beyond MVP) — **depends on 9CR.20**

**Store extensions**

- [ ] 9CR.25. `worldState.svelte.ts` extensions: `addDocument()`, `updateDocument()`, `addCareerEvent()`, `updateScholarReputation()`, document + venue reactive getters — **depends on 9CR.2**

**Career & publication UI**

- [ ] 9CR.26. `components/library/VenueSelector.svelte` — submission target selection with venue properties display — **depends on 9CR.5**
- [ ] 9CR.27. Document derivation UI: create communicative document from working documents, review inherited commitments — **depends on 9CR.3**
- [ ] 9CR.28. `components/career/ReputationDashboard.svelte` — five dimension display with modifiers — **depends on 9CR.7**
- [ ] 9CR.29. `components/career/EventLog.svelte` — career event history display — **depends on 9CR.11**
- [ ] 9CR.30. `routes/career/+page.svelte` — career dashboard route — **depends on 9CR.28**
- [ ] 9CR.31. Term dashboard — current term, energy remaining, weeks remaining, active drains — **depends on 9CR.21**
- [ ] 9CR.32. Role advancement notification (diegetic: letter of appointment) — **depends on 9CR.15**

**Explorer extensions**

- [ ] 9CR.33. Explorer: reputation dashboard — five dimensions as live values, publication history with claim magnitude
- [ ] 9CR.34. Explorer: career state panel — current role, active drains, energy budget breakdown, progression thresholds

<a name="m9-blocked"><h4>Blocked (Milestone 9)</h4></a>

<a name="m9-done"><h4>Completed (Milestone 9)</h4></a>
</details>

<details>
<summary><a name="m10"><h3>Milestone 10: NPC Systems</h3></a></summary>

> [!IMPORTANT]
> **Goal:** NPC peer review, alternative interpretations, social channels (peer letters, student questions), relationship dynamics

<a name="m10-doing"><h4>In Progress (Milestone 10)</h4></a>

<a name="m10-todo"><h4>To Do (Milestone 10)</h4></a>

**Peer review engine**

- [ ] 10NP.1. `engine/career/peerReview.ts` — `generatePeerReview(document, reviewer, worldState, noise): PeerReviewCareerEvent` — compare commitments against world state (with noise), reviewer's model, reviewer's bias — **depends on 9CR.12**
- [ ] 10NP.2. `engine/career/peerReview.ts` — `ReviewerFeedback` generation: diegetic assessment text, methodological concerns, commitments disputed/endorsed
- [ ] 10NP.3. `engine/career/peerReview.ts` — review outcome determination: accepted / revisions-requested / rejected based on commitment match, evidence quality, venue fit
- [ ] 10NP.4. `engine/career/peerReview.ts` — reviewer selection: choose from NPC pool based on specialism alignment with document scope

**NPC interpretation engine**

- [ ] 10NP.5. `engine/career/npc.ts` — `generateNpcInterpretation(artefact, scholar, worldState): ArtefactStudy` — alternative reading grounded in NPC's model and corpus — **depends on 10NP.1**
- [ ] 10NP.6. `engine/career/npc.ts` — NPC interpretation difference detection: where NPC and player diverge and why (cultural attribution, tag emphasis, material significance)
- [ ] 10NP.7. `engine/career/reputation.ts` — over-citation penalty: track citation frequency per NPC, originality drain when ratio exceeds threshold — **depends on 10NP.1**

**NPC social channels**

- [ ] 10NP.8. `engine/career/npc.ts` — `generatePeerChallenge(contradiction, scholar): DiegeticSurface` — peer letter channel, challenge references NPC's own published commitments — **depends on 10NP.5**
- [ ] 10NP.9. `engine/career/npc.ts` — `generateStudentQuestion(hypothesis, proof, worldState): DiegeticSurface` — target weakest proof step with naive but pointed question — **depends on 10NP.5**
- [ ] 10NP.10. `engine/career/npc.ts` — NPC relationship evolution: respect/agreement deltas from review outcomes, citation patterns, published agreement/disagreement — **depends on 10NP.1**
- [ ] 10NP.11. `engine/career/npc.ts` — reviewer memory: reviewer who previously rejected brings context to new submissions — **depends on 10NP.3**

**NPC career activities**

- [ ] 10NP.12. Peer review as `ActivityType`: time/energy cost (2-3 weeks, 8 + 2/week), exposes alternative interpretations — **depends on 10NP.1**
- [ ] 10NP.13. Student supervision as `ActivityType`: time/energy cost (8-12 weeks, 5 + 1/week), generates student questions targeting weak proofs — **depends on 10NP.9**

**Store extensions**

- [ ] 10NP.14. `worldState.svelte.ts` extensions: `updateScholarRelationship()`, peer review event tracking, NPC relationship scores (respect/agreement per NPC) — **depends on 10NP.10**

**NPC UI**

- [ ] 10NP.15. `components/career/NpcInteraction.svelte` — peer review display: reviewer feedback, disputed/endorsed commitments — **depends on 10NP.2**
- [ ] 10NP.16. NPC interpretation comparison view: player's reading vs NPC's reading side by side — **depends on 10NP.6**
- [ ] 10NP.17. Peer letter display: diegetic NPC challenge correspondence — **depends on 10NP.8**
- [ ] 10NP.18. Student question display: diegetic student inquiry — **depends on 10NP.9**
- [ ] 10NP.19. NPC relationship indicators in career dashboard — **depends on 10NP.14**
- [ ] 10NP.20. Venue form reclassification: `FormReclassificationEvent` with direction (downward/upward/lateral), editor correspondence — **depends on 10NP.3**

**Explorer extensions**

- [ ] 10NP.21. Explorer: NPC panel — reviewer pool with bias profiles, interpretation diffs per artefact
- [ ] 10NP.22. Explorer: citation balance tracker, relationship score history per NPC
- [ ] 10NP.23. Explorer: student question targeting view (which proof steps probed and why)

<a name="m10-blocked"><h4>Blocked (Milestone 10)</h4></a>

<a name="m10-done"><h4>Completed (Milestone 10)</h4></a>
</details>

<a name="map"><h2>Progress Map</h2></a>

> [!NOTE]
> The task list's **depends on** edges are authoritative for picking work; this map is a visual aid. Edges point prerequisite → dependent throughout.

```mermaid
---
config:
  layout: elk
title: Progress Map
---
graph TD
    m1{{"`<h2>Milestone 1</h2>`"}}:::mile
    m1A{"`<h3>1A</h3>Deno build configured`"}:::done
    m1B{"`<h3>1B</h3>All types created`"}:::done
    m1C{"`<h3>1C</h3>M1 Explorer`"}:::done
    m1D{"`<h3>1D</h3>Random Generation Util`"}:::done
    1FD.6["`*1FD.6*<br/>PRNG xoshiro128**`"]:::done
    1FD.7["`*1FD.7*<br/>weightedSelect util`"]:::done
    1FD.8["`*1FD.8*<br/>PRNG determinism test`"]:::done
    1FD.9["`*1FD.9*<br/>PRNG distribution test`"]:::done
    1FD.10["`*1FD.10*<br/>types/grammar.ts`"]:::done
    1FD.11["`*1FD.11*<br/>types/artefact.ts`"]:::done
    1FD.12["`*1FD.12*<br/>types/tags.ts`"]:::done
    1FD.13["`*1FD.13*<br/>types/decoration.ts`"]:::done
    1FD.14["`*1FD.14*<br/>types/world core`"]:::done
    1FD.15["`*1FD.15*<br/>types/world relations`"]:::done
    1FD.16["`*1FD.16*<br/>types/world provenance`"]:::done
    1FD.17["`*1FD.17*<br/>types/world dating`"]:::done
    1FD.18["`*1FD.18*<br/>types/interpretation core`"]:::done
    1FD.19["`*1FD.19*<br/>types/interpretation claims`"]:::done
    1FD.20["`*1FD.20*<br/>types/lens.ts`"]:::done
    1FD.21["`*1FD.21*<br/>types/documents core`"]:::done
    1FD.22["`*1FD.22*<br/>types/documents dissem`"]:::done
    1FD.23["`*1FD.23*<br/>types/venues.ts`"]:::done
    1FD.24["`*1FD.24*<br/>types/contradiction core`"]:::done
    1FD.25["`*1FD.25*<br/>types/contradiction queue`"]:::done
    1FD.26["`*1FD.26*<br/>types/career core`"]:::done
    1FD.27["`*1FD.27*<br/>types/career effects`"]:::done
    1FD.28["`*1FD.28*<br/>types/term.ts`"]:::done
    1FD.29["`*1FD.29*<br/>types/scholars.ts`"]:::done
    1FD.30["`*1FD.30*<br/>types/corpus.ts`"]:::done
    1FD.31["`*1FD.31*<br/>types/description.ts`"]:::done
    1FD.32["`*1FD.32*<br/>types/visibility.ts`"]:::done
    1FD.33["`*1FD.33*<br/>types/save.ts`"]:::done
    1FD.34["`*1FD.34*<br/>Configure deno test`"]:::done
    1FD.35["`*1FD.35*<br/>Test fixture helpers (partial)`"]:::open
    1FD.36["`*1FD.36*<br/>Explorer route + layout`"]:::done
    1FD.37["`*1FD.37*<br/>Explorer seed input`"]:::done
    1FD.38["`*1FD.38*<br/>Explorer PRNG display`"]:::done
    1FD.39["`*1FD.39*<br/>Explorer type index`"]:::done
    1FD.40["`*1FD.40*<br/>types/venues temporal`"]:::done
    1FD.6 --> 1FD.7 & 1FD.8 & 1FD.9
    1FD.7 --> m1D
    1FD.8 --> m1D
    1FD.9 --> m1D
    1FD.10 --> 1FD.11
    1FD.11 --> 1FD.13
    1FD.12 --> 1FD.18 & 1FD.32
    1FD.13 --> 1FD.31
    1FD.14 --> 1FD.15 & 1FD.16 & 1FD.17
    1FD.15 --> 1FD.30
    1FD.16 --> 1FD.30
    1FD.17 --> 1FD.30 & 1FD.31
    1FD.18 --> 1FD.19 & 1FD.20
    1FD.19 --> 1FD.21 & 1FD.24 & 1FD.29
    1FD.20 --> 1FD.24 & 1FD.29 & 1FD.31
    1FD.21 --> 1FD.23
    1FD.22 --> 1FD.27
    1FD.23 --> 1FD.22
    1FD.23 --> 1FD.40
    1FD.24 --> 1FD.25
    1FD.25 --> 1FD.27
    1FD.26 --> 1FD.28
    1FD.27 --> 1FD.33
    1FD.28 --> 1FD.27
    1FD.29 --> 1FD.30
    1FD.30 --> 1FD.33
    1FD.31 --> 1FD.22
    1FD.32 --> 1FD.20
    1FD.33 --> m1B
    1FD.40 --> m1B
    1FD.34 --> 1FD.35
    1FD.35 --> m1
    1FD.36 --> 1FD.37 & 1FD.39
    1FD.37 --> 1FD.38
    1FD.38 --> m1C
    1FD.39 --> m1C
    m1A --> 1FD.6 & 1FD.12 & 1FD.14 & 1FD.26 & 1FD.36
    m1B --> 1FD.39
    m1C --> m1
    m1D --> 1FD.37

m1 --> 2GN.1 & 2GN.2 & 2GN.11 & 2GN.22 & 2GN.28 & 2GN.35 & 2GN.36 & 2GN.37 & 2GN.66

m2{{"`<h2>Milestone 2</h2>`"}}:::mile

2GN.1["`*2GN.1*<br/>Primitive defs`"]:::open
2GN.2["`*2GN.2*<br/>Grammar rules data`"]:::open
2GN.3["`*2GN.3*<br/>expandGrammar`"]:::blocked
2GN.4["`*2GN.4*<br/>selectGrammarOption`"]:::blocked
2GN.5["`*2GN.5*<br/>phaseInfluence`"]:::blocked
2GN.6["`*2GN.6*<br/>Accumulation checking`"]:::blocked
2GN.7["`*2GN.7*<br/>Complexity budget`"]:::blocked
2GN.8["`*2GN.8*<br/>Normalisation`"]:::blocked
2GN.9["`*2GN.9*<br/>deriveInspectionDepth`"]:::blocked
2GN.10["`*2GN.10*<br/>allowedMaterialTags`"]:::blocked
2GN.11["`*2GN.11*<br/>Plausibility rules data`"]:::blocked
2GN.12["`*2GN.12*<br/>checkPlausibility`"]:::blocked
2GN.13["`*2GN.13*<br/>Physical viability`"]:::blocked
2GN.14["`*2GN.14*<br/>Ergonomic rules`"]:::blocked
2GN.15["`*2GN.15*<br/>Material-structural compat`"]:::blocked
2GN.16["`*2GN.16*<br/>Re-expansion loop`"]:::blocked
2GN.17["`*2GN.17*<br/>Classification rules data`"]:::open
2GN.19["`*2GN.19*<br/>extractFeatures`"]:::blocked
2GN.20["`*2GN.20*<br/>classifyArtefact`"]:::blocked
2GN.21["`*2GN.21*<br/>physicalLabel`"]:::blocked
2GN.22["`*2GN.22*<br/>Material defs data`"]:::open
2GN.23["`*2GN.23*<br/>assignMaterial`"]:::blocked
2GN.24["`*2GN.24*<br/>isAvailable`"]:::blocked
2GN.25["`*2GN.25*<br/>computeMaterialWeight`"]:::blocked
2GN.26["`*2GN.26*<br/>MaterialProvenance`"]:::blocked
2GN.27["`*2GN.27*<br/>Material tag influence`"]:::blocked
2GN.28["`*2GN.28*<br/>Decoration defs data`"]:::blocked
2GN.29["`*2GN.29*<br/>Decoration expansion`"]:::blocked
2GN.30["`*2GN.30*<br/>Material prereq enforce`"]:::blocked
2GN.31["`*2GN.31*<br/>Layering support`"]:::blocked
2GN.32["`*2GN.32*<br/>Recursion depth cap`"]:::blocked
2GN.33["`*2GN.33*<br/>Motif assignment`"]:::blocked
2GN.34["`*2GN.34*<br/>Decorative tag contrib`"]:::blocked
2GN.35["`*2GN.35*<br/>Observational templates`"]:::blocked
2GN.36["`*2GN.36*<br/>Interpretive templates`"]:::blocked
2GN.37["`*2GN.37*<br/>Technical templates`"]:::blocked
2GN.38["`*2GN.38*<br/>generateDescription`"]:::blocked
2GN.39["`*2GN.39*<br/>Template expansion`"]:::blocked
2GN.40["`*2GN.40*<br/>Component descriptions`"]:::blocked
2GN.41["`*2GN.41*<br/>Decorative descriptions`"]:::blocked
2GN.42["`*2GN.42*<br/>physicalLabel composite`"]:::blocked
2GN.43["`*2GN.43*<br/>Provenance description`"]:::blocked
2GN.44["`*2GN.44*<br/>Excavation composition`"]:::blocked
2GN.45["`*2GN.45*<br/>Ambiguity targets`"]:::blocked
2GN.46["`*2GN.46*<br/>Batch monitoring`"]:::blocked
2GN.47["`*2GN.47*<br/>Provenance generation`"]:::blocked
2GN.48["`*2GN.48*<br/>generateNPCScholars`"]:::blocked
2GN.49["`*2GN.49*<br/>NPC InterpretiveModel`"]:::blocked
2GN.50["`*2GN.50*<br/>simulateExcavations`"]:::blocked
2GN.51["`*2GN.51*<br/>generatePublications`"]:::blocked
2GN.52["`*2GN.52*<br/>Coverage gaps`"]:::blocked
2GN.53["`*2GN.53*<br/>aggregateCorpus`"]:::blocked
2GN.54["`*2GN.54*<br/>Dating frameworks`"]:::blocked
2GN.55["`*2GN.55*<br/>Calibrated wrongness`"]:::blocked
2GN.56["`*2GN.56*<br/>Pipeline orchestrator`"]:::blocked
2GN.66["`*2GN.66*<br/>Naming grammars data`"]:::blocked
2GN.57["`*2GN.57*<br/>Explorer: structure viewer`"]:::blocked
2GN.58["`*2GN.58*<br/>Explorer: plausibility panel`"]:::blocked
2GN.59["`*2GN.59*<br/>Explorer: tag inspector`"]:::blocked
2GN.60["`*2GN.60*<br/>Explorer: material viewer`"]:::blocked
2GN.61["`*2GN.61*<br/>Explorer: decoration inspector`"]:::blocked
2GN.62["`*2GN.62*<br/>Explorer: description viewer`"]:::blocked
2GN.63["`*2GN.63*<br/>Explorer: excavation viewer`"]:::blocked
2GN.64["`*2GN.64*<br/>Explorer: corpus browser`"]:::blocked
2GN.65["`*2GN.65*<br/>Explorer: pipeline stages`"]:::blocked

2GN.1 --> 2GN.12
2GN.2 --> 2GN.3
2GN.3 --> 2GN.4 & 2GN.5 & 2GN.6 & 2GN.7
2GN.4 --> 2GN.8
2GN.6 --> 2GN.8
2GN.8 --> 2GN.9 & 2GN.10 & 2GN.12 & 2GN.57
2GN.11 --> 2GN.12
2GN.12 --> 2GN.13 & 2GN.14 & 2GN.15 & 2GN.16 & 2GN.17 & 2GN.19 & 2GN.23 & 2GN.58
2GN.17 --> 2GN.20
2GN.19 --> 2GN.20
2GN.20 --> 2GN.21 & 2GN.27 & 2GN.34 & 2GN.59
2GN.22 --> 2GN.23
2GN.23 --> 2GN.24 & 2GN.25 & 2GN.26 & 2GN.27 & 2GN.29 & 2GN.60
2GN.28 --> 2GN.29
2GN.29 --> 2GN.30 & 2GN.31 & 2GN.32 & 2GN.33 & 2GN.34 & 2GN.61
2GN.34 --> 2GN.38
2GN.35 --> 2GN.38
2GN.36 --> 2GN.38
2GN.37 --> 2GN.38
2GN.38 --> 2GN.39 & 2GN.44
2GN.39 --> 2GN.40 & 2GN.41 & 2GN.42 & 2GN.43
2GN.40 --> 2GN.62
2GN.44 --> 2GN.45 & 2GN.46 & 2GN.47 & 2GN.48 & 2GN.63
2GN.45 --> 2GN.63
2GN.66 --> 2GN.47 & 2GN.48
2GN.48 --> 2GN.49
2GN.49 --> 2GN.50 & 2GN.55
2GN.50 --> 2GN.51 & 2GN.52 & 2GN.54
2GN.51 --> 2GN.53
2GN.52 --> m2
2GN.53 --> 2GN.56 & 2GN.64
2GN.54 --> 2GN.64
2GN.55 --> m2
2GN.56 --> 2GN.65
2GN.57 & 2GN.58 & 2GN.59 & 2GN.60 & 2GN.61 & 2GN.62 & 2GN.63 & 2GN.64 & 2GN.65 --> m2

m2 --> 3WS.1

m3{{"`<h2>Milestone 3</h2>`"}}:::mile

3WS.1["`*3WS.1*<br/>createWorldSeed`"]:::blocked
3WS.2["`*3WS.2*<br/>generateChronology`"]:::blocked
3WS.3["`*3WS.3*<br/>generateCultures`"]:::blocked
3WS.4["`*3WS.4*<br/>generatePhases`"]:::blocked
3WS.5["`*3WS.5*<br/>generateRelationships`"]:::blocked
3WS.6["`*3WS.6*<br/>MaterialFlow gen`"]:::blocked
3WS.7["`*3WS.7*<br/>GeologicalContext`"]:::blocked
3WS.8["`*3WS.8*<br/>Motif vocabulary`"]:::blocked
3WS.9["`*3WS.9*<br/>createWorld orchestrator`"]:::blocked
3WS.10["`*3WS.10*<br/>worldState store`"]:::blocked
3WS.11["`*3WS.11*<br/>playerInterp store stub`"]:::blocked
3WS.12["`*3WS.12*<br/>lensState store stub`"]:::blocked
3WS.13["`*3WS.13*<br/>ui store`"]:::blocked
3WS.14["`*3WS.14*<br/>gameState orchestrator`"]:::blocked
3WS.15["`*3WS.15*<br/>Pipeline real data`"]:::blocked
3WS.16["`*3WS.16*<br/>E2E determinism verify`"]:::blocked
3WS.17["`*3WS.17*<br/>Explorer: timeline`"]:::blocked
3WS.18["`*3WS.18*<br/>Explorer: culture profiles`"]:::blocked
3WS.19["`*3WS.19*<br/>Explorer: relationship graph`"]:::blocked
3WS.20["`*3WS.20*<br/>Explorer: store inspector`"]:::blocked

3WS.1 --> 3WS.2 & 3WS.7
3WS.2 --> 3WS.3
3WS.3 --> 3WS.4 & 3WS.5 & 3WS.8
3WS.4 --> 3WS.9
3WS.5 --> 3WS.6 & 3WS.9
3WS.7 --> 3WS.9
3WS.8 --> m3
3WS.9 --> 3WS.10
3WS.10 --> 3WS.11 & 3WS.12 & 3WS.13 & 3WS.14 & 3WS.17 & 3WS.18 & 3WS.19
3WS.11 --> 3WS.14
3WS.12 --> 3WS.14
3WS.13 --> 3WS.14
3WS.14 --> 3WS.15 & 3WS.20
3WS.15 --> 3WS.16
3WS.16 --> m3
3WS.17 --> 3WS.20
3WS.18 --> 3WS.20
3WS.19 --> 3WS.20
3WS.20 --> m3

m3 --> 4UI.1

subgraph M4["Milestone 4: Player Interface"]
    m4{"`Milestone 4`"}:::mile

    4UI.1["`*4UI.1*<br/>ArtefactInspector`"]:::blocked
    4UI.2["`*4UI.2*<br/>PropertyList`"]:::blocked
    4UI.3["`*4UI.3*<br/>TagBadge`"]:::blocked
    4UI.4["`*4UI.4*<br/>ConfidenceBadge`"]:::blocked
    4UI.5["`*4UI.5*<br/>Component list UI`"]:::blocked
    4UI.6["`*4UI.6*<br/>Provenance display`"]:::blocked
    4UI.7["`*4UI.7*<br/>Study route`"]:::blocked
    4UI.8["`*4UI.8*<br/>Register switching`"]:::blocked
    4UI.9["`*4UI.9*<br/>Generate artefact btn`"]:::blocked

    4UI.1 --> 4UI.2 & 4UI.3 & 4UI.4 & 4UI.5
    4UI.5 --> 4UI.6
    4UI.6 --> 4UI.7 & 4UI.8 & 4UI.9
    4UI.7 --> m4
    4UI.8 --> m4
    4UI.9 --> m4
end

m4 --> 5KN.1

subgraph M5["Milestone 5: Knowledge Model"]
  m5{"`Milestone 5`"}:::mile
  
  5KN.1["`*5KN.1*<br/>createObservation`"]:::blocked
  5KN.2["`*5KN.2*<br/>reviseObservation`"]:::blocked
  5KN.3["`*5KN.3*<br/>ArtefactStudy create`"]:::blocked
  5KN.4["`*5KN.4*<br/>playerInterp full impl`"]:::blocked
  5KN.5["`*5KN.5*<br/>ObservationEditor`"]:::blocked
  5KN.6["`*5KN.6*<br/>Confidence selector`"]:::blocked
  5KN.7["`*5KN.7*<br/>Epistemic mode toggle`"]:::blocked
  5KN.8["`*5KN.8*<br/>Tag assignment`"]:::blocked
  5KN.9["`*5KN.9*<br/>Observation list`"]:::blocked
  5KN.10["`*5KN.10*<br/>createInference`"]:::blocked
  5KN.11["`*5KN.11*<br/>Evidence chain valid`"]:::blocked
  5KN.12["`*5KN.12*<br/>createHypothesis`"]:::blocked
  5KN.13["`*5KN.13*<br/>Hypothesis status mgmt`"]:::blocked
  5KN.14["`*5KN.14*<br/>createInferenceProof`"]:::blocked
  5KN.15["`*5KN.15*<br/>playerInterp extensions`"]:::blocked
  5KN.16["`*5KN.16*<br/>TagSelector`"]:::blocked
  5KN.17["`*5KN.17*<br/>Inference chain UI`"]:::blocked
  5KN.18["`*5KN.18*<br/>Hypothesis editor`"]:::blocked
  5KN.19["`*5KN.19*<br/>Inference proof editor`"]:::blocked
  5KN.20["`*5KN.20*<br/>Document type defs`"]:::blocked
  5KN.21["`*5KN.21*<br/>DocumentList`"]:::blocked
  5KN.22["`*5KN.22*<br/>DocumentEditor`"]:::blocked
  5KN.23["`*5KN.23*<br/>Library route`"]:::blocked
  5KN.24["`*5KN.24*<br/>Document view route`"]:::blocked
  5KN.25["`*5KN.25*<br/>Explorer: model viewer`"]:::blocked
  5KN.26["`*5KN.26*<br/>Explorer: evidence graph`"]:::blocked

  5KN.1 --> 5KN.2 & 5KN.3 & 5KN.4 & 5KN.10
  5KN.4 --> 5KN.5 & 5KN.25
  5KN.5 --> 5KN.6 & 5KN.7 & 5KN.8 & 5KN.9 & 5KN.16
  5KN.10 --> 5KN.11 & 5KN.12 & 5KN.14 & 5KN.15
  5KN.12 --> 5KN.13 & 5KN.20 & 5KN.26
  5KN.15 --> 5KN.17
  5KN.17 --> 5KN.18 & 5KN.19
  5KN.20 --> 5KN.21 & 5KN.22
  5KN.21 --> 5KN.23
  5KN.22 --> 5KN.24
  5KN.2 & 5KN.3 & 5KN.6 & 5KN.7 & 5KN.8 & 5KN.9 --> m5
  5KN.11 & 5KN.13 & 5KN.14 & 5KN.16 & 5KN.18 & 5KN.19 --> m5
  5KN.23 & 5KN.24 & 5KN.25 & 5KN.26 --> m5
end

m5 --> 6LS.1

subgraph M6["Milestone 6: Lens System"]
  m6{"`Milestone 6`"}:::mile
  
  6LS.1["`*6LS.1*<br/>computeLensStrength`"]:::blocked
  6LS.2["`*6LS.2*<br/>computeLens`"]:::blocked
  6LS.3["`*6LS.3*<br/>Per-tag lens weights`"]:::blocked
  6LS.4["`*6LS.4*<br/>Lens decay`"]:::blocked
  6LS.5["`*6LS.5*<br/>lensState full impl`"]:::blocked
  6LS.6["`*6LS.6*<br/>computeSalience`"]:::blocked
  6LS.7["`*6LS.7*<br/>adjustClassification`"]:::blocked
  6LS.8["`*6LS.8*<br/>computeCrossRefs`"]:::blocked
  6LS.9["`*6LS.9*<br/>selectDescFrame`"]:::blocked
  6LS.10["`*6LS.10*<br/>computeOmissions`"]:::blocked
  6LS.11["`*6LS.11*<br/>Presentation assembly`"]:::blocked
  6LS.12["`*6LS.12*<br/>Re-inspection update`"]:::blocked
  6LS.13["`*6LS.13*<br/>On closer inspection`"]:::blocked
  6LS.14["`*6LS.14*<br/>Cross-ref panel`"]:::blocked
  6LS.15["`*6LS.15*<br/>Raw data drill-down`"]:::blocked
  6LS.16["`*6LS.16*<br/>Explorer: lens state panel`"]:::blocked
  6LS.17["`*6LS.17*<br/>Explorer: lens diff panel`"]:::blocked

  6LS.1 --> 6LS.2 & 6LS.3
  6LS.2 --> 6LS.4 & 6LS.5
  6LS.3 --> 6LS.16
  6LS.5 --> 6LS.6 & 6LS.7 & 6LS.8 & 6LS.9 & 6LS.10 & 6LS.16
  6LS.6 --> 6LS.11
  6LS.7 --> 6LS.11
  6LS.8 --> 6LS.11 & 6LS.14
  6LS.9 --> 6LS.11
  6LS.10 --> 6LS.11
  6LS.11 --> 6LS.12 & 6LS.13 & 6LS.15 & 6LS.17
  6LS.4 & 6LS.12 & 6LS.13 & 6LS.14 & 6LS.15 & 6LS.16 & 6LS.17 --> m6
end

m6 --> 7CD.1

subgraph M7["Milestone 7: Contradictions"]
  m7{"`Milestone 7`"}:::mile
  
  7CD.1["`*7CD.1*<br/>detectContradictions`"]:::blocked
  7CD.2["`*7CD.2*<br/>Material rules`"]:::blocked
  7CD.3["`*7CD.3*<br/>Temporal rules`"]:::blocked
  7CD.4["`*7CD.4*<br/>Cultural rules`"]:::blocked
  7CD.5["`*7CD.5*<br/>Structural rules`"]:::blocked
  7CD.6["`*7CD.6*<br/>Provenance rules`"]:::blocked
  7CD.7["`*7CD.7*<br/>Corpus rules`"]:::blocked
  7CD.8["`*7CD.8*<br/>Rarity rules`"]:::blocked
  7CD.9["`*7CD.9*<br/>Material prov rules`"]:::blocked
  7CD.10["`*7CD.10*<br/>Severity scoring`"]:::blocked
  7CD.11["`*7CD.11*<br/>Epistemic sensitivity`"]:::blocked
  7CD.12["`*7CD.12*<br/>accumulateStrain`"]:::blocked
  7CD.13["`*7CD.13*<br/>Strain threshold`"]:::blocked
  7CD.14["`*7CD.14*<br/>Decorative strain`"]:::blocked
  7CD.15["`*7CD.15*<br/>selectSurfacing`"]:::blocked
  7CD.16["`*7CD.16*<br/>Impossible artefact`"]:::blocked
  7CD.17["`*7CD.17*<br/>Field report`"]:::blocked
  7CD.18["`*7CD.18*<br/>Escalation logic`"]:::blocked
  7CD.19["`*7CD.19*<br/>traceAffectedChain`"]:::blocked
  7CD.20["`*7CD.20*<br/>resolve()`"]:::blocked
  7CD.21["`*7CD.21*<br/>Revision cascades`"]:::blocked
  7CD.22["`*7CD.22*<br/>RevisionRecord`"]:::blocked
  7CD.23["`*7CD.23*<br/>Reinterpret strain`"]:::blocked
  7CD.24["`*7CD.24*<br/>Reject credibility cost`"]:::blocked
  7CD.25["`*7CD.25*<br/>Contradiction store ext`"]:::blocked
  7CD.26["`*7CD.26*<br/>ContradictionQueue`"]:::blocked
  7CD.27["`*7CD.27*<br/>ContradictionDetail`"]:::blocked
  7CD.28["`*7CD.28*<br/>RetconFlow`"]:::blocked
  7CD.29["`*7CD.29*<br/>Cascade visualisation`"]:::blocked
  7CD.30["`*7CD.30*<br/>Resolution outcome`"]:::blocked
  7CD.31["`*7CD.31*<br/>Explorer: contradiction inspector`"]:::blocked
  7CD.32["`*7CD.32*<br/>Explorer: surfacing log`"]:::blocked

  7CD.1 --> 7CD.2 & 7CD.3 & 7CD.4 & 7CD.5 & 7CD.6 & 7CD.7 & 7CD.8 & 7CD.9 & 7CD.10 & 7CD.11 & 7CD.12
  7CD.10 --> 7CD.15
  7CD.12 --> 7CD.13 & 7CD.14 & 7CD.25
  7CD.15 --> 7CD.16 & 7CD.17 & 7CD.18 & 7CD.19 & 7CD.32
  7CD.19 --> 7CD.20 & 7CD.27
  7CD.20 --> 7CD.21 & 7CD.22 & 7CD.23 & 7CD.24 & 7CD.28
  7CD.22 --> 7CD.32
  7CD.25 --> 7CD.26 & 7CD.31
  7CD.28 --> 7CD.29 & 7CD.30
  7CD.2 & 7CD.3 & 7CD.4 & 7CD.5 & 7CD.6 & 7CD.7 & 7CD.8 & 7CD.9 & 7CD.11 --> m7
  7CD.13 & 7CD.14 & 7CD.16 & 7CD.17 & 7CD.18 & 7CD.21 & 7CD.23 & 7CD.24 --> m7
  7CD.26 & 7CD.27 & 7CD.29 & 7CD.30 & 7CD.31 & 7CD.32 --> m7
end

m7 --> 8PS.1

subgraph M8["Milestone 8: Persistence"]
  m8{"`Milestone 8`"}:::mile
  
  8PS.1["`*8PS.1*<br/>Map serialise utils`"]:::blocked
  8PS.2["`*8PS.2*<br/>serialiseGameState`"]:::blocked
  8PS.3["`*8PS.3*<br/>deserialiseGameState`"]:::blocked
  8PS.4["`*8PS.4*<br/>SaveFile schema`"]:::blocked
  8PS.5["`*8PS.5*<br/>Schema migration`"]:::blocked
  8PS.6["`*8PS.6*<br/>IndexedDB adapter`"]:::blocked
  8PS.7["`*8PS.7*<br/>Auto-save`"]:::blocked
  8PS.8["`*8PS.8*<br/>Save/load UI`"]:::blocked
  8PS.9["`*8PS.9*<br/>Auto-save indicator`"]:::blocked
  8PS.10["`*8PS.10*<br/>Explorer: persistence inspector`"]:::blocked

  8PS.1 --> 8PS.2 & 8PS.4
  8PS.2 --> 8PS.3 & 8PS.6
  8PS.3 --> 8PS.10
  8PS.4 --> 8PS.5
  8PS.5 --> 8PS.10
  8PS.6 --> 8PS.7 & 8PS.8
  8PS.7 --> 8PS.9
  8PS.8 & 8PS.9 & 8PS.10 --> m8
end

m8 --> 9CR.1

subgraph M9["Milestone 9: Career & Publication"]
  m9{"`Milestone 9`"}:::mile
  
  9CR.1["`*9CR.1*<br/>Lineage graph`"]:::blocked
  9CR.2["`*9CR.2*<br/>advanceDissemination`"]:::blocked
  9CR.3["`*9CR.3*<br/>extractCommitments`"]:::blocked
  9CR.4["`*9CR.4*<br/>classifyDocumentForm`"]:::blocked
  9CR.5["`*9CR.5*<br/>generateVenues`"]:::blocked
  9CR.6["`*9CR.6*<br/>Venue prestige`"]:::blocked
  9CR.7["`*9CR.7*<br/>Reputation compute`"]:::blocked
  9CR.8["`*9CR.8*<br/>applyReputationMod`"]:::blocked
  9CR.9["`*9CR.9*<br/>Reputation change table`"]:::blocked
  9CR.10["`*9CR.10*<br/>ReputationGate eval`"]:::blocked
  9CR.11["`*9CR.11*<br/>DisseminationEffect`"]:::blocked
  9CR.12["`*9CR.12*<br/>Claim magnitude`"]:::blocked
  9CR.13["`*9CR.13*<br/>Pub lens strength`"]:::blocked
  9CR.14["`*9CR.14*<br/>Retraction cost`"]:::blocked
  9CR.15["`*9CR.15*<br/>evaluateCareerProgress`"]:::blocked
  9CR.16["`*9CR.16*<br/>RoleRequirement eval`"]:::blocked
  9CR.17["`*9CR.17*<br/>Background drain profiles`"]:::blocked
  9CR.18["`*9CR.18*<br/>calculateBaseEnergy`"]:::blocked
  9CR.19["`*9CR.19*<br/>calculateCarryOver`"]:::blocked
  9CR.20["`*9CR.20*<br/>getTermType`"]:::blocked
  9CR.21["`*9CR.21*<br/>termState store`"]:::blocked
  9CR.22["`*9CR.22*<br/>completeTerm()`"]:::blocked
  9CR.23["`*9CR.23*<br/>Summer-research term`"]:::blocked
  9CR.24["`*9CR.24*<br/>Sabbatical impl`"]:::blocked
  9CR.25["`*9CR.25*<br/>worldState store ext`"]:::blocked
  9CR.26["`*9CR.26*<br/>VenueSelector`"]:::blocked
  9CR.27["`*9CR.27*<br/>Document derivation UI`"]:::blocked
  9CR.28["`*9CR.28*<br/>ReputationDashboard`"]:::blocked
  9CR.29["`*9CR.29*<br/>EventLog`"]:::blocked
  9CR.30["`*9CR.30*<br/>Career route`"]:::blocked
  9CR.31["`*9CR.31*<br/>Term dashboard`"]:::blocked
  9CR.32["`*9CR.32*<br/>Role advancement notif`"]:::blocked
  9CR.35["`*9CR.35*<br/>retractDocument`"]:::blocked
  9CR.36["`*9CR.36*<br/>traceTaintedLineage`"]:::blocked
  9CR.37["`*9CR.37*<br/>Retraction UI`"]:::blocked
  9CR.38["`*9CR.38*<br/>Document perception`"]:::blocked
  9CR.39["`*9CR.39*<br/>Dating commissioning`"]:::blocked
  9CR.33["`*9CR.33*<br/>Explorer: reputation dashboard`"]:::blocked
  9CR.34["`*9CR.34*<br/>Explorer: career state panel`"]:::blocked

  9CR.1 --> 9CR.2 & 9CR.3 & 9CR.4 & 9CR.5 & 9CR.36
  9CR.2 --> 9CR.7 & 9CR.25 & 9CR.35 & 9CR.38
  9CR.3 --> 9CR.27
  9CR.5 --> 9CR.6 & 9CR.26
  9CR.6 --> 9CR.13
  9CR.7 --> 9CR.8 & 9CR.9 & 9CR.10 & 9CR.11 & 9CR.12 & 9CR.14 & 9CR.15 & 9CR.28 & 9CR.33
  9CR.10 --> 9CR.39
  9CR.11 --> 9CR.29
  9CR.12 --> 9CR.33
  9CR.15 --> 9CR.16 & 9CR.17 & 9CR.20 & 9CR.32
  9CR.16 --> 9CR.34
  9CR.17 --> 9CR.18 & 9CR.19 & 9CR.21
  9CR.18 --> 9CR.34
  9CR.20 --> 9CR.23 & 9CR.24
  9CR.21 --> 9CR.22 & 9CR.31
  9CR.28 --> 9CR.30
  9CR.35 --> 9CR.14 & 9CR.36
  9CR.36 --> 9CR.37
  9CR.38 --> 9CR.14 & 9CR.22
  9CR.4 & 9CR.8 & 9CR.9 & 9CR.13 & 9CR.14 & 9CR.19 --> m9
  9CR.22 & 9CR.23 & 9CR.24 & 9CR.25 & 9CR.26 & 9CR.27 --> m9
  9CR.29 & 9CR.30 & 9CR.31 & 9CR.32 & 9CR.33 & 9CR.34 & 9CR.37 & 9CR.39 --> m9
end

m9 --> 10NP.1

subgraph M10["Milestone 10: NPC Systems"]
  m10{"`Milestone 10`"}:::mile
  
  10NP.1["`*10NP.1*<br/>generatePeerReview`"]:::blocked
  10NP.2["`*10NP.2*<br/>ReviewerFeedback gen`"]:::blocked
  10NP.3["`*10NP.3*<br/>Review outcome`"]:::blocked
  10NP.4["`*10NP.4*<br/>Reviewer selection`"]:::blocked
  10NP.5["`*10NP.5*<br/>NPC interpretation`"]:::blocked
  10NP.6["`*10NP.6*<br/>NPC divergence detect`"]:::blocked
  10NP.7["`*10NP.7*<br/>Over-citation penalty`"]:::blocked
  10NP.8["`*10NP.8*<br/>Peer challenge`"]:::blocked
  10NP.9["`*10NP.9*<br/>Student question`"]:::blocked
  10NP.10["`*10NP.10*<br/>Relationship evolution`"]:::blocked
  10NP.11["`*10NP.11*<br/>Reviewer memory`"]:::blocked
  10NP.12["`*10NP.12*<br/>Review activity type`"]:::blocked
  10NP.13["`*10NP.13*<br/>Supervision activity`"]:::blocked
  10NP.14["`*10NP.14*<br/>NPC store extensions`"]:::blocked
  10NP.15["`*10NP.15*<br/>NpcInteraction`"]:::blocked
  10NP.16["`*10NP.16*<br/>Interpretation compare`"]:::blocked
  10NP.17["`*10NP.17*<br/>Peer letter display`"]:::blocked
  10NP.18["`*10NP.18*<br/>Student question UI`"]:::blocked
  10NP.19["`*10NP.19*<br/>Relationship indicators`"]:::blocked
  10NP.20["`*10NP.20*<br/>Form reclassification`"]:::blocked
  10NP.21["`*10NP.21*<br/>Explorer: NPC panel`"]:::blocked
  10NP.22["`*10NP.22*<br/>Explorer: citation balance`"]:::blocked
  10NP.23["`*10NP.23*<br/>Explorer: question targeting`"]:::blocked

  10NP.1 --> 10NP.2 & 10NP.3 & 10NP.4 & 10NP.5 & 10NP.7 & 10NP.10 & 10NP.12
  10NP.2 --> 10NP.15
  10NP.3 --> 10NP.11 & 10NP.20
  10NP.4 --> 10NP.21
  10NP.5 --> 10NP.6 & 10NP.8 & 10NP.9
  10NP.6 --> 10NP.16 & 10NP.21
  10NP.7 --> 10NP.22
  10NP.8 --> 10NP.17
  10NP.9 --> 10NP.13 & 10NP.18 & 10NP.23
  10NP.10 --> 10NP.14 & 10NP.22
  10NP.14 --> 10NP.19
  10NP.11 & 10NP.12 & 10NP.13 & 10NP.15 & 10NP.16 & 10NP.17 & 10NP.18 --> m10
  10NP.19 & 10NP.20 & 10NP.21 & 10NP.22 & 10NP.23 --> m10
end

classDef default,blocked fill:#f9f;
classDef open fill:#ff9;
classDef mile fill:#9ff;
classDef done fill:#9f9;
```

---

<a name="links"><h2>Links</h2></a>

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

<a name="post-mvp"><h2>Beyond MVP</h2></a>

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
