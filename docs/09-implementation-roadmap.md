# TWCB: Implementation Roadmap

*What gets built, in what order, and what “done” means*

-----

## 0. Philosophy

This roadmap is structured around **demonstrable increments**, not feature completeness. Every phase produces something you can run, test, and show to someone. No phase depends on a future phase being designed — everything needed is specified in documents 01–11.

The phases are sequential but not waterfall. You’ll circle back. The point is that each phase has a clear “done” state that doesn’t require anything later to be meaningful.

Every phase extends the **Project Explorer** — a developer-facing UI at `/dev/explorer` that lets you generate, inspect, and interact with whatever the current phase produces. The explorer is not the player UI (that arrives at Phase 12); it’s a workbench for verifying that each system works before anything downstream consumes it. It grows with every phase: new tabs, new panels, new controls. If a phase has no explorer work, something is wrong — every system should be directly observable.

-----

## Phase 1: Foundation

**Runtime migration + type system + seeded PRNG**

### What Gets Built

- Deno migration: swap adapter, strip Node tooling, verify all dependencies
- Complete type system in `src/lib/types/` (all interfaces from docs 04–07)
- Seeded PRNG module (`xoshiro128**` or equivalent)
- Engine directory skeleton with type-correct empty modules
- Test infrastructure: `deno test` running against engine modules
- **Project Explorer:** shell at `/dev/explorer` with seed input field, PRNG output display (generate N values, verify determinism visually), and type index listing all registered interfaces

### Definition of Done

*`deno task dev` serves the app, `deno test` passes, all type interfaces compile, the PRNG produces verified deterministic output, and the explorer shell is accessible with seed controls.*

- `deno task dev` starts the dev server
- `deno task check` passes type checking
- `deno test` runs and passes (even if tests are trivial)
- All TypeScript interfaces from the design docs exist in `src/lib/types/`
- The seeded PRNG produces deterministic output verified by test

### Dependencies

- None. This is ground zero.

### Estimated Effort

Small. Mostly configuration, file moves, and type transcription. The PRNG is ~20 lines. A weekend if focused.

-----

## Phase 2: Component Grammar

**Geometric primitives → components via bottom-up composition**

### What Gets Built

- Geometric primitive library (cylinders, cones, spheres, planes, toroids, rings)
- Bottom-up component grammar: primitives → components via attachment and modification
- Typed attachment joins (inline, perpendicular, socketed, wrapped, threaded)
- Two-tier mobility model: structural (rigid/hinged/socketed) and material-dependent (actual flex)
- **Project Explorer:** structure viewer tab — generate a structure from seed + mock culture, display as component tree with join types annotated, re-roll button, culture profile selector

### Definition of Done

*You can run the grammar with a seed and a mock culture profile and get back a multi-component structure with typed joins, different every time you change the seed. The explorer displays the component tree and lets you re-roll.*

- `expandGrammar(rules, mockCulture, prng)` produces valid component structures from geometric primitives
- Components attach via typed joins
- Deterministic tests: same seed → same component structure, every time
- Distribution tests: cultural weight biases demonstrably affect branch selection

### What It Doesn’t Do Yet

- No plausibility rejection (all grammar output passes through)
- No classification tags
- No material assignment, no decorative grammar
- No UI — engine-only
- No world state — uses mock culture profiles

### Dependencies

- Phase 1 (types + PRNG)

### Estimated Effort

This is the hardest engine work. The component grammar is the core of the project — geometric primitives composing into recognisable artefacts needs careful iteration. Allow proper time. Expect to discover what produces interesting vs degenerate structures through testing.

-----

## Phase 3: Plausibility Checker

**Physical viability, ergonomic rules, material-structural compatibility**

### What Gets Built

- Plausibility checker: reject physically impossible structures, pass viable ones
- Physical viability rules (structural integrity, centre of gravity, load paths)
- Ergonomic rules (handleability, usability constraints)
- Material-structural compatibility checks (material tags constrain which joins and forms are viable)
- **Project Explorer:** plausibility panel — generate N structures, show pass/fail for each with rejection reasons, running rejection rate counter, click any rejected structure to inspect failure details

### Definition of Done

*You can feed grammar output through the plausibility checker and verify that impossible structures are rejected with specific failure reasons. The explorer shows pass/fail results and rejection rate across a batch.*

- `checkPlausibility(structure)` rejects impossible structures with specific failure reasons
- Viable structures pass unchanged
- Edge cases tested: degenerate grammars, oversized structures, unsupported cantilevers
- Rejection rate is meaningful but not excessive — the grammar shouldn’t routinely produce junk

### What It Doesn’t Do Yet

- No classification (plausibility is structural, not semantic)
- No material assignment (uses `allowedMaterialTags` constraints, not resolved materials)

### Dependencies

- Phase 2 (grammar produces structures to check)

### Estimated Effort

Small-to-moderate. The rules are enumerable. The interesting work is calibrating rejection thresholds so the grammar + plausibility pipeline produces a good hit rate.

-----

## Phase 4: Tag Accumulation

**Pattern-based classification during grammar expansion**

### What Gets Built

- Tag taxonomy (`FunctionTag`, `ContextTag`)
- Pattern-based classification accumulation: features accumulate tags as structure grows during grammar expansion — not applied after the fact
- Feature extraction from component groups
- Unified tag scoring: `Map<Tag, number>` with multiple tags above threshold per artefact
- **Project Explorer:** tag inspector panel — generate a structure, display tag map as scored bar chart, show per-component tag contributions, batch mode to compare tag distributions across N artefacts

### Definition of Done

*You can inspect a generated structure’s tag map and see multiple classification tags with varying scores accumulated during expansion. The explorer visualises tag scores and lets you compare distributions across batches.*

- `classifyArtefact(features, components)` returns `Map<Tag, number>` with multiple tags above threshold
- Tags accumulate during grammar expansion, not as a post-processing step
- Distribution tests: different structural forms produce distinguishable tag profiles
- Tag accumulation is deterministic given the same grammar expansion

### What It Doesn’t Do Yet

- No material influence on tags (that comes with material assignment)
- No decorative influence on tags (structural features only)
- No lens filtering

### Dependencies

- Phase 3 (plausibility-checked structures to classify)

### Estimated Effort

Moderate. The taxonomy needs thought — too few tags and everything looks the same, too many and the signal drowns in noise. The accumulation-during-expansion pattern is architecturally important to get right.

-----

## Phase 5: Materials

**Material definitions, geological scarcity, culture-biased assignment**

### What Gets Built

- Material definitions with `MaterialTag` system
- Geological scarcity model and provenance tracking
- Culture-biased material assignment per component (scarcity × affinity × trade)
- Material influence on tag accumulation (material properties feed into existing classification)
- **Project Explorer:** material viewer panel — generate artefact, show resolved material per component, display culture bias breakdown (scarcity vs affinity vs trade contribution), batch mode comparing material distributions across cultures

### Definition of Done

*You can generate artefacts and verify that each component has a resolved material influenced by geological scarcity and culture biases. The explorer shows material assignments with bias breakdowns per component.*

- `assignMaterial(component, culture, period, materials, prng)` respects geological scarcity and cultural biases
- Each component in a structure has a resolved material
- Distribution tests: culture biases and geological scarcity demonstrably affect material selection
- Material properties contribute to tag scores (e.g. obsidian boosts `ritual` and `weapon` tags)

### What It Doesn’t Do Yet

- No decorative grammar (materials assigned to structural components only)
- No world state — uses mock culture profiles and material lists
- No provenance (site context not yet generated)

### Dependencies

- Phase 4 (tag accumulation exists for materials to feed into)

### Estimated Effort

Moderate. The material system is well-specified in doc 05. The interesting work is calibrating cultural biases so material selection feels culturally distinctive without being deterministic.

-----

## Phase 6: Decorative Grammar

**Surface treatments, applied elements, layering**

### What Gets Built

- Decorative grammar: surface treatments, applied elements, textile work
- Runs after material assignment, respects material prerequisites
- Layering support (decoration-on-decoration, capped by culture `craftSpecialisation`)
- Unified classification: structural + decorative features feed into single tag accumulation (no artificial silos)
- **Project Explorer:** decoration inspector panel — generate artefact, show decoration layers per component with prerequisites and technique, display layer depth, batch mode comparing decorative complexity across culture profiles

### Definition of Done

*You can generate artefacts with layered decorations that respect material prerequisites and vary in depth by culture profile. The explorer shows decoration layers with prerequisites and lets you compare across cultures.*

- Decorative grammar produces layered decorations with material prerequisites enforced
- Decoration depth respects culture `craftSpecialisation` cap
- Decorative features contribute to tag accumulation alongside structural features
- Distribution tests: decorative layering depth demonstrably varies by culture profile

### What It Doesn’t Do Yet

- No world state — uses mock culture profiles
- No provenance or excavation context
- No description generation

### Dependencies

- Phase 5 (materials resolved, so decorative grammar knows what surfaces are available)

### Estimated Effort

Moderate. The decorative grammar’s material prerequisites and layering add real complexity. This is where artefacts start looking culturally distinctive.

-----

## Phase 7: Excavation Composition

**Provenance generation, site-level ambiguity, batch management**

### What Gets Built

- Provenance generation (site name, type, context)
- Excavation composition: site-level ambiguity management (~30–40% clear, 40–50% moderate, 20–30% highly ambiguous)
- Soft batch monitoring across excavations
- Ambiguity distribution targets verified by test
- **Project Explorer:** excavation viewer panel — generate an excavation batch, show artefacts grouped by site with provenance data, display ambiguity distribution chart against targets, site profile summary

### Definition of Done

*You can generate excavation batches and verify that artefacts have provenance data and that ambiguity distribution meets target percentages. The explorer shows batch composition with a distribution chart.*

- Provenance data generated per artefact (site, context type, layer)
- Excavation batches meet target ambiguity distribution
- Multiple excavations can coexist with distinct site profiles
- Provenance context influences artefact interpretation difficulty

### What It Doesn’t Do Yet

- No world chronology (uses mock periods)
- No corpus (no professional baseline to compare against)
- No player interaction

### Dependencies

- Phase 6 (fully decorated, classified artefacts to place into excavation contexts)

### Estimated Effort

Small-to-moderate. The composition rules are distribution targets, not complex logic. The interesting work is making site contexts feel archaeologically plausible.

-----

## Phase 8: World State

**Seed → chronology → cultures → phase profiles**

### What Gets Built

- WorldState generation: seed → chronology (with `presentYear`) → cultures → phase profiles
- Period definitions with temporal boundaries
- Culture relationship model (trade, conflict, isolation)
- World generation determinism (same seed → same world, always)
- **Project Explorer:** world viewer panel — generate a world from seed, display chronology as timeline with period boundaries, culture profiles with bias summaries, culture relationship graph

### Definition of Done

*You can call `createWorld(seed)` and get back a well-formed chronology with periods, cultures, and relationships, verified by structural tests. The explorer displays the world as a timeline with culture profiles and relationships.*

- `createWorld(seed)` produces chronology with `presentYear`, 3–5 periods, 2 cultures, relationships
- Culture profiles specify material biases, decorative grammar weights, and craft specialisation
- Deterministic tests: same seed → identical world state
- Structural tests: periods are contiguous, culture relationships are reciprocal, all required fields populated

### What It Doesn’t Do Yet

- No proof the world produces good artefacts (that’s the pipeline integration phase)
- No corpus (world exists but no professional publications about it)
- No player interaction

### Dependencies

- Phase 7 (excavation composition ready to receive real culture and period data)

### Estimated Effort

Moderate. The world generation itself is straightforward seed-driven parameter selection. The work is defining culture profiles that are structurally complete and internally consistent.

-----

## Phase 9: Pipeline Integration

**Full end-to-end orchestrator: seed → ClassifiedArtefact**

### What Gets Built

- Full pipeline orchestrator: seed → grammar → plausibility → accumulation → materials → decoration → classification → excavation → provenance → `ClassifiedArtefact`
- World state replaces mock culture profiles throughout the pipeline
- Integration tests verifying that culture profiles produce meaningfully different artefact populations
- **Project Explorer:** pipeline viewer panel — generate artefact via full pipeline, show stage-by-stage output (structure → plausibility result → tags → materials → decorations → provenance), batch generation with per-culture population summaries

### Definition of Done

*You can call `generateArtefact(world, prng)` and get back a fully classified artefact with provenance, driven by real world data rather than mocks. The explorer shows the artefact’s journey through each pipeline stage.*

- `generateArtefact(world, prng)` returns `ClassifiedArtefact` with resolved materials, decorations, tags, and provenance
- World state drives all pipeline stages (no mock culture profiles remain)
- Pipeline end-to-end determinism verified by test
- Distribution tests: different cultures produce distinguishably different artefact populations

### What It Doesn’t Do Yet

- No corpus (pipeline produces artefacts but no professional record about them)
- No description generation (artefacts are data, not prose)
- No player interaction

### Dependencies

- Phase 8 (world state provides culture profiles and period data)

### Estimated Effort

Small-to-moderate. The orchestrator is glue code calling existing modules in sequence. The real value is the integration testing — if artefacts come out wrong, you now know the world is already verified and the problem is in the pipeline wiring.

-----

## Phase 10: Corpus Generation

**Initial professional baseline**

### What Gets Built

- Initial corpus generation: 3–4 NPC researchers, 6–8 simulated excavations, ~15–20 summary publications
- Dating frameworks with calibrated wrongness (70% correct, 30% interestingly wrong)
- Coverage gaps in the professional record (things the corpus hasn’t addressed)
- **Project Explorer:** corpus browser panel — list NPC researchers with specialisms and biases, browse publications with dating frameworks, highlight coverage gaps, show which dating claims are correct vs deliberately wrong

### Definition of Done

*You can inspect the generated corpus and see NPC publications with specialisms, dating frameworks, and deliberate gaps in coverage. The explorer lets you browse the professional record and see which dating frameworks are wrong and why.*

- Initial corpus generates professional baseline with coverage gaps and established dating frameworks
- Corpus NPC researchers have names, specialisms, publication histories, and methodological biases
- Corpus is deterministic given the same world seed

### What It Doesn’t Do Yet

- No lens (tags are ground truth, not filtered)
- No description generation (artefacts are data, not prose)
- No player interaction — engine produces artefacts but nobody inspects them
- No interpretive model

### Dependencies

- Phase 9 (pipeline produces the artefacts that corpus publications are about)

### Estimated Effort

Moderate. The corpus generation is content design as much as engineering — deciding what the professional record looks like, where its gaps are, and how its dating frameworks are wrong in interesting ways.

-----

## Phase 11: Description & Register System

**Three-register prose generation for artefacts**

### What Gets Built

- Register-based description system with three modes:
  - **Observational:** material-science language (what can be measured)
  - **Interpretive:** functional-contextual language (what it might be for)
  - **Technical:** craft-process language (how it was made)
- Description templates for each component role, in all three registers
- Neutral presentation (all registers available, no lens filtering yet)
- `ArtefactPresentation` assembly: ordered observations with register-specific descriptions
- **Project Explorer:** description viewer panel — generate artefact, show three-register prose side by side per component, highlight where registers diverge on the same physical feature

### Definition of Done

*You can pass a classified artefact to the description engine and get back coherent prose in three distinct registers for every component. The explorer displays all three registers side by side for comparison.*

- Each component in a classified artefact can be described in all three registers
- Descriptions are distinct voices for the same physical reality, not just rewording
- Decorative layers described with their techniques and motifs
- Register system produces coherent prose from pipeline data
- Deterministic: same artefact → same descriptions

### What It Doesn’t Do Yet

- No UI (descriptions exist as data, not displayed)
- No lens filtering
- No player interaction

### Dependencies

- Phase 9 (pipeline producing `ClassifiedArtefact` with all data)

### Estimated Effort

Moderate. The creative challenge: three distinct professional perspectives on the same object. Each register needs to feel like a different kind of expertise, not a synonym swap.

-----

## Phase 12: Basic UI

**Artefact inspection interface + store architecture**

### What Gets Built

- UI: Replace `ItemGenerator.svelte` with `ArtefactInspector.svelte`
- UI: Component list showing materials, features, decorative layers
- UI: Provenance display (site, culture label, period, context)
- UI: Dating framework display (approximate period from corpus, with confidence)
- UI: Register switching (observational, interpretive, technical)
- Store refactor: split `gameState` into `worldState` + `termState` + placeholder `playerInterpretation`
- **Project Explorer:** store inspector panel — live view of `worldState`, `termState`, and `playerInterpretation` store contents, updated as the player UI generates artefacts

### Definition of Done

*You can open the app, generate an artefact, read its descriptions in all three registers, see its provenance and dating, and generate another. The explorer shows live store state alongside the player UI.*

- Player sees a generated artefact with multi-component descriptions
- Each component has a material, described in prose across all three registers
- Provenance information displayed with site name, context, and approximate dating
- Tags shown (for now — these become lens-filtered later)
- “Generate New Artefact” produces a fresh artefact from the full pipeline
- Multiple artefacts can be generated and reviewed in a session
- Player can switch between observational, interpretive, and technical descriptions

### What It Doesn’t Do Yet

- No observation recording (player reads but doesn’t write)
- No lens (descriptions show all registers equally, no filtering)
- No knowledge model
- No persistence

### Dependencies

- Phase 11 (register-based descriptions to display)
- Phase 10 (corpus provides dating frameworks for display)

### Estimated Effort

Small-to-moderate. Standard Svelte component work. The store refactor is structural but well-defined (doc 08 specifies the target architecture).

-----

## Phase 13: Observation System

**Player records observations on artefacts**

### What Gets Built

- Player’s `InterpretiveModel` store (agent-generic interface, doc 11 Section 2.6)
- Observation CRUD: player writes notes attached to artefacts, component groups, or individual components
- Confidence levels assignable to observations
- Basic document type: artefact studies (collections of observations about a single artefact)
- UI: `ObservationEditor` integrated into the artefact inspector
- **Project Explorer:** interpretive model viewer panel — browse raw document nodes in the player’s interpretive model, show observation-to-artefact linkages, display confidence levels

### Definition of Done

*You can select a component or component group on an artefact and write observations with confidence levels that persist in the interpretive model. The explorer shows the raw interpretive model contents and observation linkages.*

- Player can inspect an artefact and record observations per component-group or individual component
- Observations persist in the player’s interpretive model as document nodes (doc 10)
- Observations can be viewed, edited, and deleted
- Confidence levels attached to individual observations
- Multiple artefacts can have independent observation sets

### What It Doesn’t Do Yet

- No inference chains (observations exist but can’t be linked into arguments)
- No hypotheses
- No lens effect
- No persistence across sessions

### Dependencies

- Phase 12 (artefact inspection UI to attach observations to)

### Estimated Effort

Small-to-moderate. The data model is specified (doc 10 document nodes, doc 11 InterpretiveModel). The UI is a text editor attached to artefact components.

-----

## Phase 14: Inference & Hypothesis System

**Evidence chains, hypotheses, proof editor, document types**

### What Gets Built

- Inference chain builder: link observations across artefacts → conclusion
- Hypothesis creation from inferences
- Inference proof editor (structured evidence chains with explicit assumption steps)
- Document types: material generalisations, inference proofs
- Document library listing all player documents
- UI: `InferenceProofEditor`, `TagSelector`, document library
- **Project Explorer:** evidence graph panel — visualise the player’s document graph (observations → inferences → hypotheses) with dependency edges, highlight orphaned nodes and assumption steps

### Definition of Done

*You can link observations across artefacts into inferences, form hypotheses, write structured evidence chains, and browse everything in the document library. The explorer visualises the full evidence graph with dependency edges.*

- Player can create inferences linking observations across artefacts
- Player can form hypotheses supported by inferences
- Player can write inference proofs with explicit assumption steps
- All documents stored in the player’s interpretive model (doc 10 document nodes)
- Documents can be viewed, edited, and cross-referenced
- Confidence levels assignable to inferences and hypotheses

### What It Doesn’t Do Yet

- No lens effect (hypotheses exist but don’t alter perception)
- No contradiction detection
- No publication
- No persistence across sessions

### Dependencies

- Phase 13 (observations exist to build inferences from)

### Estimated Effort

Substantial. The inference proof editor is the most complex UI component so far — it needs to feel like building an argument, not filling in a form. The chain-linking UX (connecting observations across different artefacts into a coherent inference) requires careful interaction design.

-----

## Phase 15: Lens Computation

**Lens state derived from hypotheses, confidence, and evidence**

### What Gets Built

- Lens state store (computed from hypotheses, confidence, evidence depth)
- Lens strength calculation (confidence × evidence × commitment)
- Tag-level lens weights: each hypothesis contributes to specific tag boosts/suppressions
- Lens recomputation on hypothesis changes
- **Project Explorer:** lens state panel — display current lens weights per tag, show which hypotheses contribute to each weight, live update on hypothesis changes, strength formula breakdown

### Definition of Done

*You can inspect the computed lens state and verify that hypothesis changes produce corresponding shifts in tag weights and strength scores. The explorer shows the weight breakdown per hypothesis and updates live.*

- Lens state correctly reflects the player’s current hypothesis set
- Lens strength scales with confidence level and evidence chain depth
- Adding, modifying, or removing hypotheses triggers lens recomputation
- Lens weights are inspectable (developer can verify which hypotheses drive which tag adjustments)

### What It Doesn’t Do Yet

- No presentation effects (lens computed but not applied to what the player sees)
- No contradiction detection
- No publication effects on lens strength

### Dependencies

- Phase 14 (hypotheses and evidence chains exist in state)

### Estimated Effort

Small-to-moderate. The computation is well-specified arithmetic (doc 04). The challenge is ensuring the weight combination produces sensible results when multiple hypotheses interact.

-----

## Phase 16: Lens Presentation Effects

**Hypotheses alter how artefacts are perceived**

### What Gets Built

- Observation salience: property ordering based on lens
- Classification suggestions: tag scores adjusted by lens
- Cross-reference priming: related artefacts suggested with lens bias
- Descriptive framing: register selection and within-register variant weighting based on lens
- Omission blindness: contradicting properties de-emphasised
- UI: descriptions change when player revisits artefacts after forming hypotheses
- Raw data drill-down: player can always bypass the lens to see unfiltered properties
- **The core experience**: same artefact looks different depending on what the player believes
- **Project Explorer:** lens diff panel — side-by-side display of any artefact with lens on vs lens off, highlighting salience changes, tag score adjustments, and suppressed properties

### Definition of Done

*You can form a hypothesis, revisit an artefact, and see that descriptions, tag suggestions, and property ordering have changed in response. The explorer shows a side-by-side lens-on vs lens-off comparison for any artefact.*

- Forming a hypothesis about “Culture A uses obsidian decoratively” causes:
  - Future artefacts with obsidian to foreground decorative properties
  - Classification suggestions to boost `ritual` and `ornament` tags
  - Description variants to emphasise aesthetic qualities
  - Contradicting uses of obsidian (tool, weapon) to be de-emphasised
- Player can drill down to raw data on any property (lens filters presentation, not data)
- Revisiting a previously inspected artefact shows different emphasis after hypothesis formation

### What It Doesn’t Do Yet

- No contradiction detection (lens biases exist but aren’t challenged)
- No publication (hypotheses aren’t committed publicly)
- No career effects

### Dependencies

- Phase 15 (lens state computed and available)
- Phase 11 (register-based description system with multiple variants per register)

### Estimated Effort

Moderate-to-substantial. The individual lens channels aren’t complex, but integration testing is tricky — you need to verify that the lens produces *subtly* different results, not wildly different ones. Calibration will take iteration.

-----

## Phase 17: Contradiction Detection & Strain

**Detection engine, contradiction types, severity scoring, strain accumulation**

### What Gets Built

- Contradiction detection engine (player interpretive model vs WorldState ground truth + professional corpus)
- Contradiction types: material, temporal, cultural, structural, provenance, corpus
- Contradiction queue with severity scoring
- Strain model for slow-burn contradictions (near-misses accumulate pressure per-term)
- Corpus contradiction detection (player claims vs professional record — NB: corpus may be wrong)
- **Project Explorer:** contradiction inspector panel — display queue contents with type, severity, and strain levels, show ground truth comparison for each queued contradiction, filter by type

### Definition of Done

*You can hold an incorrect belief, generate artefacts, and verify that the contradiction queue populates with correctly typed and severity-scored entries. The explorer shows the queue with ground truth comparisons and strain levels.*

- When the player holds a belief that conflicts with ground truth, contradictions are detected and queued
- When the player’s claims conflict with the professional corpus, corpus contradictions are detected
- Contradiction severity is scored based on type, evidence weight, and stakes
- Strain accumulates for near-misses, eventually producing surfaced contradictions
- Contradiction queue is populated (but not yet surfaced to the player)

### What It Doesn’t Do Yet

- No diegetic surfacing (contradictions detected but not presented)
- No retcon flow
- No NPC-delivered contradictions

### Dependencies

- Phase 16 (lens state exists, hypotheses affect perception — contradictions challenge those effects)
- Phase 10 (WorldState + professional corpus for comparison)

### Estimated Effort

Moderate. The detection engine is rule-heavy but each contradiction type is a distinct check. The strain model is arithmetic. The challenge is tuning severity scoring so contradictions surface at the right rate.

-----

## Phase 18: Contradiction Surfacing & Retcon Resolution

**Diegetic presentation, retcon flow, revision cascades**

### What Gets Built

- Diegetic surfacing: impossible artefacts, field reports (MVP channels)
- Retcon flow: acknowledge → trace → decide → cascade → record
- Revision records tracking all changes
- Revision cascades through dependent documents
- Unresolved contradictions increase surfacing frequency
- UI: `ContradictionQueue`, `ContradictionDetail`, `RetconFlow`
- **Project Explorer:** surfacing log panel — chronological record of what surfaced and when, retcon history with cascade traces, click any revision to see the before/after state of affected documents

### Definition of Done

*You can see contradictions surface as anomalous artefacts or field reports, investigate them, trace the conflict to specific proof steps, and revise with cascading consequences. The explorer logs all surfacing events and shows cascade traces.*

- Contradictions appear diegetically (anomalous artefact, field report finding)
- Contradiction queue is visible and accumulates
- Player can investigate a contradiction, trace it to specific proof steps
- Player can revise, reinterpret, or reject
- Revision cascades through dependent documents
- Unresolved contradictions increase surfacing frequency

### What It Doesn’t Do Yet

- No NPC-delivered contradictions (peer letters, student questions)
- No publication-triggered contradictions
- No career consequences for unresolved contradictions

### Dependencies

- Phase 17 (contradiction detection populates the queue)

### Estimated Effort

Substantial. The retcon flow is the most complex UI in the game — it involves navigating evidence chains, identifying affected documents, and making consequential decisions. The cascade logic (revising a hypothesis that multiple other hypotheses depend on) requires careful graph traversal.

-----

## Phase 19: Persistence

**Save/load infrastructure**

### What Gets Built

- IndexedDB persistence layer with schema versioning
- Save/load UI
- Auto-save on significant actions
- Schema migration for save version changes
- All existing state (WorldState, InterpretiveModel, TermState, LensState, contradiction queue) serialised and restored
- **Project Explorer:** persistence inspector panel — view serialised state size, schema version, round-trip diff (save → load → compare), export raw JSON for debugging

### Definition of Done

*You can save, close the browser, reopen, load, and verify that all game state — world, interpretive model, lens, contradictions — round-trips correctly. The explorer shows the round-trip diff and serialised state.*

- Game state persists across browser sessions
- Player can save and load named save files
- Schema migration handles save version changes
- Round-trip test: save → load → verify all state matches

### What It Doesn’t Do Yet

- No publication system
- No reputation or career progression
- No NPC interactions

### Dependencies

- Phase 18 (all core game state exists and needs persisting)

### Estimated Effort

Small-to-moderate. Persistence is well-understood infrastructure. The main work is ensuring every store serialises cleanly and schema versioning handles future additions.

-----

## Phase 20: Reputation & Publication

**Academic publication track, claim magnitude, reputation model**

### What Gets Built

- Reputation model (five dimensions)
- Academic publication track (with evidence requirements)
- Publication effects on lens strength (+0.3 for academic)
- Publication effects on reputation
- Claim magnitude system: confirmation → extension → challenge → novel, with scaling impact and scrutiny
- Retraction of published work carries reputation cost
- **Project Explorer:** reputation dashboard panel — display five reputation dimensions as live values, publication history with claim magnitude breakdown, lens strength changes per publication, retraction cost calculator

### Definition of Done

*You can publish a hypothesis as an academic paper, see its lens strength increase, watch reputation shift across five dimensions, and test that retraction carries a measurable cost. The explorer shows the reputation dashboard and publication history.*

- Player can publish hypotheses as academic papers (requires inference proofs)
- Published hypotheses have increased lens strength
- Reputation changes based on publication quality and outcome
- Claim magnitude correctly scales impact and scrutiny
- Retraction carries measurable reputation cost

### What It Doesn’t Do Yet

- No career role advancement (reputation exists but doesn’t gate progression)
- No NPC peer review
- No dating facility access gating

### Dependencies

- Phase 19 (persistence — publications must survive sessions)
- Phase 14 (inference proofs provide publication content)

### Estimated Effort

Moderate. The reputation model is arithmetic. The publication flow is a UI form backed by state logic. The claim magnitude system adds strategic depth without complexity.

-----

## Phase 21: Career Progression

**Role advancement, reputation gates, institutional access**

### What Gets Built

- Career state: postdoc → junior lecturer progression
- Reputation gates for career activities
- Role-specific background drain profiles (teaching load, admin, supervision)
- Term-type-conditional drain activation (doc 08 `BackgroundDrain.activeTermTypes`)
- Dating facility access gated by institutional affiliation/reputation
- **Project Explorer:** career state panel — display current role, active drains per term type, energy budget breakdown (total vs drained vs discretionary), progression thresholds with current distance to next role

### Definition of Done

*You can advance from postdoc to junior lecturer, see the background drain profile change, and verify that summer-research terms correctly exclude teaching costs. The explorer shows the energy budget breakdown per term type and progression thresholds.*

- Career role advances based on reputation and publication thresholds
- Each role has distinct background drain profile affecting energy budget
- Summer-research terms correctly exclude teaching drains
- Senior roles demonstrably reduce discretionary energy
- Dating facilities accessible at appropriate career stages

### What It Doesn’t Do Yet

- No NPC interactions (career is solo progression)
- No full role progression (postdoc → junior lecturer only; full track is Phase 24)

### Dependencies

- Phase 20 (reputation and publication systems drive career advancement)

### Estimated Effort

Moderate. The career mechanics are well-specified (doc 07). The interesting work is ensuring the energy budget changes at role transitions feel meaningful — promotion should be bittersweet.

-----

## Phase 22: NPC Peer Review & Interpretation

**NPC scholars review player work and generate alternative readings**

### What Gets Built

- Interactive NPC layer on top of the corpus NPCs generated in Phase 10 (who already exist as names, specialisms, publication histories, and biases — this phase makes them responsive to the player)
- Peer review for academic publications
- NPC interpretation generation (alternative readings of artefacts using different lens weightings, consistent with NPC biases from corpus)
- Over-citing NPCs reduces originality reputation
- **Project Explorer:** NPC panel — browse reviewer pool with bias profiles, view any NPC’s interpretation of any artefact alongside the player’s, show interpretation diff (where the NPC and player diverge and why), citation balance tracker

### Definition of Done

*You can publish and receive peer review from NPC scholars, then view their alternative interpretations of artefacts you’ve studied and verify they reflect each NPC’s known biases. The explorer shows NPC-vs-player interpretation diffs with bias attribution.*

- Publishing triggers peer review from generated NPC reviewers
- Player can review NPC work and see alternative interpretations of familiar artefacts
- NPC interpretations are consistent with their known methodological biases
- Over-citing a single NPC demonstrably reduces originality reputation

### What It Doesn’t Do Yet

- No NPC-delivered contradictions
- No student supervision
- No NPC relationship evolution

### Dependencies

- Phase 20 (publication system for peer review to respond to)
- Phase 10 (corpus NPCs provide the reviewer pool)

### Estimated Effort

Moderate. The NPC data already exists from Phase 10’s corpus generation. The interpretation generation is the most interesting part — producing an NPC’s alternative reading of an artefact using the same data but different weighting.

-----

## Phase 23: NPC Social Channels

**Contradiction delivery, student supervision, relationship dynamics**

### What Gets Built

- NPC-delivered contradictions (peer letter channel)
- Student supervision activity (student question channel — targets weak assumption steps in player’s proofs)
- NPC relationship scores evolving based on agreement/disagreement
- Peer review as career activity (seeing NPC interpretations of your artefacts)
- **Project Explorer:** NPC social panel — relationship score history per NPC, contradiction delivery log (which NPC sent what and when), student question targeting view (which proof steps are being probed and why)

### Definition of Done

*You can receive contradiction challenges via NPC peer letters, field student questions that target weak proof steps, and see relationship scores shift with agreement and disagreement. The explorer shows relationship histories and the targeting logic behind student questions.*

- Contradictions can surface via peer letter (diegetic, voiced by NPC)
- Student questions target weak assumption steps in the player’s proofs
- NPC relationship scores evolve based on agreement/disagreement
- Peer review functions as a career activity within the term/energy economy

### What It Doesn’t Do Yet

- No richer NPC personalities (that’s Phase 24)
- No school-of-thought dynamics (post-MVP, doc 13)

### Dependencies

- Phase 22 (NPC interpretation and peer review exist)
- Phase 18 (contradiction system for NPC delivery channel)

### Estimated Effort

Moderate. The contradiction delivery is a new surfacing channel wired into the existing contradiction queue. Student questions are a targeted form of contradiction. Relationship scores are arithmetic tracking agreement/disagreement over time.

-----

## Phase 24: Expansion Tracks

**Curatorial + popular publication, full career, richer NPCs**

This is post-MVP. Including it to show the roadmap has a future, but this is where the defined scope ends and exploration begins.

### What Gets Built

- Curatorial publication track (exhibition narratives, thematic grouping)
- Popular publication track (simplified claims, public misconceptions)
- Full career role progression (through professor)
- All career activity types (conferences, grants, sabbatical)
- Richer NPC personalities and relationships
- The desk-based UI evolution (Strange Horticulture aesthetic)
- Cultural profile document type (player-authored culture models)

-----

## Dependency Graph

```
Phase 1 ─── Phase 2 ─── Phase 3 ─── Phase 4 ─── Phase 5 ─── Phase 6 ─── Phase 7
(Foundation) (Grammar)   (Plausib.)  (Tags)      (Materials) (Decorative)(Excavation)
                                                                             │
                                                                             ▼
                                                                          Phase 8
                                                                          (World)
                                                                             │
                                                                             ▼
                                                                          Phase 9
                                                                         (Pipeline)
                                                                          ╱     ╲
                                                                         ▼       ▼
                                                                     Phase 10  Phase 11
                                                                     (Corpus) (Descript.)
                                                                         ╲       ╱
                                                                          ▼     ▼
                                                                         Phase 12
                                                                        (Basic UI)
                                                                             │
                                                                             ▼
                                                                         Phase 13
                                                                       (Observations)
                                                                             │
                                                                             ▼
                                                                         Phase 14
                                                                      (Infer.+Hypo.)
                                                                             │
                                                                             ▼
                                                                         Phase 15
                                                                       (Lens Comp.)
                                                                             │
                                                                             ▼
                                                                         Phase 16
                                                                      (Lens Effects)
                                                                             │
                                                                             ▼
                                                                         Phase 17
                                                                     (Contradiction
                                                                       Detection)
                                                                             │
                                                                             ▼
                                                                         Phase 18
                                                                      (Surfacing +
                                                                         Retcon)
                                                                             │
                                                                             ▼
                                                                         Phase 19
                                                                      (Persistence)
                                                                             │
                                                                             ▼
                                                                         Phase 20
                                                                      (Reputation +
                                                                       Publication)
                                                                             │
                                                                             ▼
                                                                         Phase 21
                                                                        (Career)
                                                                             │
                                                                             ▼
                                                                         Phase 22
                                                                      (NPC Review +
                                                                     Interpretation)
                                                                             │
                                                                             ▼
                                                                         Phase 23
                                                                      (NPC Social
                                                                       Channels)
                                                                             │
                                                                             ▼
                                                                         Phase 24
                                                                       (Expansion)
```

Phases 1–12 are the technical foundation (every phase visible via the Project Explorer). Phase 13 is where the player first creates knowledge. Phase 16 is the game’s core mechanic. Phase 18 is what makes the core mechanic *matter*. Phases 19–23 are what makes it all *stick*.

-----

## What “Playable” Means at Each Phase

|Phase|What Can a Player/Dev Do?                                                                                      |
|-----|---------------------------------------------------------------------------------------------------------------|
|1    |**Explorer:** seed input, PRNG output display, type index.                                                     |
|2    |**Explorer:** generate structures from seed + culture, browse component trees, re-roll.                        |
|3    |**Explorer:** generate batches, see pass/fail with rejection reasons and running rejection rate.               |
|4    |**Explorer:** inspect tag maps as scored bar charts, compare distributions across batches.                     |
|5    |**Explorer:** view material assignments per component with culture bias breakdowns.                            |
|6    |**Explorer:** inspect decoration layers with prerequisites, compare complexity across cultures.                |
|7    |**Explorer:** generate excavation batches, view ambiguity distribution against targets.                        |
|8    |**Explorer:** generate worlds, view chronology timelines with culture profiles and relationships.              |
|9    |**Explorer:** run full pipeline, view stage-by-stage output, compare populations across cultures.              |
|10   |**Explorer:** browse NPC publications, dating frameworks, and coverage gaps.                                   |
|11   |**Explorer:** view three-register descriptions side by side per component.                                     |
|12   |**First playable.** Generate and inspect artefacts across three registers. Explorer adds store inspector.      |
|13   |Record observations on artefacts. Explorer shows raw interpretive model and linkages.                          |
|14   |Build arguments, form hypotheses, write evidence chains. Explorer shows evidence graph.                        |
|15   |Explorer shows lens weights per hypothesis, live-updating.                                                     |
|16   |**The game exists.** Hypotheses change how artefacts look. Explorer shows lens-on vs lens-off diffs.           |
|17   |Explorer shows contradiction queue with ground truth comparisons and strain levels.                            |
|18   |Contradictions surface diegetically. Retcon flow enables revision. Explorer logs surfacing events and cascades.|
|19   |Sessions persist. Explorer shows round-trip diffs and serialised state.                                        |
|20   |Publishing commits beliefs. Explorer shows reputation dashboard and claim magnitude breakdown.                 |
|21   |Career progression. Explorer shows energy budgets per term type and progression thresholds.                    |
|22   |NPC scholars review work. Explorer shows NPC-vs-player interpretation diffs.                                   |
|23   |NPCs deliver contradictions. Explorer shows relationship histories and targeting logic.                        |
|24   |The full vision. Desk-based UI, rich career, deep NPCs.                                                        |

Phase 16 is the inflection point. Before it, you have an interesting artefact browser with note-taking. After it, you have the game.

-----

*This completes the implementation roadmap. Documents 01–11 define the project from audit through design. Doc 12 tracks propagation status; doc 13 parks post-MVP questions. The next step is Phase 1.*
