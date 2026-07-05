# TWCB: Project Knowledge Overview

*A map of the design documentation for Those Who Came Before*

-----

## What This Document Is

An index of all project knowledge documents, what each one covers, and how they relate to each other. If you’re picking this project up cold, read this first, then Doc 02 (Design Pillars), then Doc 03 (Core Loop), then whatever’s relevant to the work in front of you.

-----

## The Design Documents

### Doc 01 — Project Audit

An honest inventory of everything that exists: working code, specified-but-unbuilt systems, conversation-designed features, and historical dead ends. Identifies the key tensions in the project (scope vs milestone structure, the feedback loop gap, CFG-first vs blueprint-first) and lists the decisions that needed resolving before specification could proceed. Written as a snapshot of the project at the start of the current design round — many of the gaps it identifies have since been addressed by later documents.

### Doc 02 — Design Pillars

The six non-negotiable commitments that constrain every other decision. Error Is the Engine (player mistakes are generative, not punitive), Diegesis First (no out-of-character information), Simulation Honesty (all player-facing content derives from the same underlying data), Accumulation Over Revelation (knowledge builds incrementally), The Player Is an Unreliable Narrator (publications have consequences), and Clarity of State Over Spectacle (legibility over polish). Also resolves the open questions from Doc 01 — CFG as primary generation path, IndexedDB for persistence, Deno runtime, NPCs deferred from MVP.

### Doc 03 — Core Loop & Systems Map

The architectural spine. Defines the core gameplay loop (inspect → interpret → record → encounter new artefact coloured by prior beliefs → notice or miss inconsistencies → revise or double down) and maps the seven interconnected systems: Generation Layer, World State, Player Experience, Interpretive Model, Interpretive Lens, Contradiction System, and Document Tradition. Each system’s dependencies and outputs are specified, along with four interaction patterns (virtuous cycle, vicious cycle, correction cycle, publication lock-in). Includes a status table tracking which doc specifies each system.

### Doc 04 — Interpretive Lens

The core mechanic specification. Defines how the player’s existing beliefs filter their perception of new artefacts through five independently tunable channels: observation salience (which properties are foregrounded), classification suggestions (what functional tags are proposed), cross-reference priming (which past artefacts are surfaced for comparison), descriptive framing (how text descriptions are shaped by register and belief), and omission blindness (what the player fails to notice). Includes a calibration model, decay mechanics, worked examples with TypeScript interfaces, and the lens strength formula (driven by dissemination state, evidence count, citation count, and teaching activity).

### Doc 05 — Generation Architecture (v3)

The longest and most technically dense document. Specifies the full nine-stage generation pipeline from world seed to player-facing artefact description: world seed → chronology and culture generation → initial corpus generation → bottom-up structural grammar → structural normalisation and plausibility checking → material assignment → decorative grammar → unified feature extraction and tag classification → description generation. Covers the bottom-up component grammar (geometric primitives composing into functional components), the decorative layer system, material assignment with cultural biases and geological constraints, the tag-based classification system (function tags, context tags, material tags), the register-filtered description system, excavation site composition, dating framework, and initial corpus generation for NPC scholarship. Every pipeline stage is annotated with its visibility level (observable, inferable, occluded, engine-internal).

### Doc 06 — Knowledge & Contradiction Model

Defines the shape of player knowledge as a directed graph of observations, inferences, hypotheses, and publications — each progressively harder to retract. Specifies the four knowledge layers with TypeScript interfaces, the agent-generic `InterpretiveModel` that serves both player and NPC scholars, and the contradiction system: eight contradiction types, detection mechanics (comparing interpretive model claims against occluded ground truth and professional consensus), accumulation without forced resolution, per-term strain pressure, diegetic surfacing channels, and the retcon flow for revision with cascading document updates.

### Doc 07 — Career & Social Systems

Publication tracks, reputation, and the social cost of being wrong. Defines the multidimensional reputation model (rigour, breadth, originality, reliability, influence), the academic role progression from research assistant through professor, the four-term academic year with summer research periods, teaching as background energy drain, the three publication tracks (academic, curatorial, popular), venue types with prestige tiers, peer review mechanics with named reviewers, and a minimal NPC scholar framework. Addresses the oracle problem (why copying NPC answers is self-defeating) through career penalties for intellectual passivity.

### Doc 08 — Technical Architecture

The code-level specification. Covers the Deno runtime and toolchain (stripping Node dependencies, `deno.json` configuration), SvelteKit project structure with `@deno/svelte-adapter`, the store hierarchy (`GameStore` → `WorldState` + `PlayerInterpretiveState` + `TermState` + `UIState`), the engine module architecture, the generation pipeline as code, term-boundary orchestration with the absolute week counter, and background process scheduling. Includes the `TermState` interface with week tracking, term types, and energy management.

### Doc 09 — Implementation Roadmap

Twenty-four sequential, demonstrable phases: foundation (phase 1), the generation pipeline and world state (phases 2–9), corpus generation, descriptions and the player interface (phases 10–12), knowledge (phases 13–14), the lens (phases 15–16), contradictions (phases 17–18), persistence (phase 19), career (phases 20–21), NPCs (phases 22–23) and expansion tracks (phase 24). Each phase has a definition of done, and every phase grows the `/dev/explorer` developer workbench. The live task-level execution roadmap derived from doc 09 is `docs/roadmaps/mvp.md`.

### Doc 10 — Document Tradition System

How scholarly documents work: immutable once disseminated (mutable while private), forming a directed acyclic graph of intellectual lineage. Defines the `DocumentNode` interface, form classification (derived from content properties rather than author-chosen labels), the dissemination state machine (private → circulated → presented → submitted → published → collected), venue assignment and prestige, the lineage graph (derivation, revision, commentary, challenge, synthesis edges), audience perception tracking, and the retraction mechanics. Peer review lead times and venue temporal profiles are specified in weeks within the absolute week counter system.

### Doc 11 — Deferred Design Questions

Cross-cutting concerns and locked-in decisions that emerged during specification. All open questions for the current development round have been resolved — the document now primarily serves as a reference for locked-in decisions: named peer review, private document mutability, no mass internet in the game world, the objective/subjective reconceptualisation (unified world state with property visibility levels rather than separate objective and subjective states), the agent-generic interpretation principle, the four-level property visibility model, and the time/action economy (four terms per year including summer research, 12-week terms, absolute week counter, concurrent actions with dual time and energy cost).

### Doc 12 — Propagation Register

A process document tracking cross-document consistency. When a design session produces changes that affect other documents, they’re logged here for the next propagation pass. Records the completed propagation entries (sixteen at last count) covering the generation architecture, objective/subjective reconceptualisation, property visibility model, agent-generic interpretation principle, systems map rebuild, document tradition integration, time/action economy, week tracking, summer-research term addition and the 2026-07-04 roadmap-alignment decisions. No pending items remain.

### Doc 13 — Deferred Post-MVP Design Questions

Five design areas explicitly parked for future development: alternative dissemination pathways (exhibitions, lectures, conference proceedings — different pipelines beyond standard text submission), emergent schools of thought (NPC scholars clustering into intellectual movements with citation networks and coordinated resistance to challenges), publication quality metrics for role qualification (replacing flat publication counts with weighted impact scores), the five-register `ObservationRegister` acquisition system (MVP ships the three-register `DescriptionRegister`) and career activity execution (field seasons, conference presentations; MVP gates progression on reputation, publications and terms-in-role). Each entry includes the original question, deferral rationale, architectural provisions already in place, and an MVP risk assessment. All are rated low or no risk to the current architecture.

-----

## Supplementary Files

The supplementary reference materials that previously accompanied these documents (a codebase snapshot dated 2026-01-31, a directory structure tree dated 2026-01-31 and a stylistic inspiration list) lived in the external design workspace and are not part of this repository.

-----

## Reading Order Recommendations

**If you want the big picture:** Doc 02 → Doc 03 → Doc 04 (the pillars, the systems map, and the core mechanic).

**If you’re implementing:** `docs/roadmaps/mvp.md` → Doc 09 → the phase-relevant spec doc → Doc 08 (the live roadmap tells you the current task, doc 09 gives the phase context, the spec doc tells you how, the architecture doc tells you where it goes).

**If you’re reviewing the design:** Doc 02 → Doc 03 → Doc 05 → Doc 06 → Doc 07 → Doc 10 (pillars through to full system specifications).

**If you’re catching up on decisions:** Doc 11 → Doc 13 (what’s been locked in, what’s been deferred).
