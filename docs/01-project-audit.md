# TWCB Project Audit
*February 2026*

---

## 1. What Actually Exists

### 1.1 Working Code (SvelteKit MVP)

The current application is a SvelteKit 2 + Svelte 5 app that generates simple artefacts as item-type + material pairs. It works. It's clean. It's also about 2% of the game you're designing.

**What it does:**
- Generates random artefacts from a fixed pool of 9 item types and ~19 materials across 4 categories (bone, metal, stone, wood)
- Tracks discovered vs available items in a reactive store using Svelte 5 Runes
- Displays a discovery timeline and mission progress
- Styled with DaisyUI/Tailwind (caramellatte + coffee themes)

**What it doesn't do:**
- No artefact anatomy (every item is a flat type + single material)
- No world simulation behind the generation
- No player interpretation or note-taking
- No persistence between sessions
- No cultural context, chronology, or provenance
- No contradiction detection
- No document system, publication, or career mechanics

**Honest assessment:** This is a tech demo proving you can wire up SvelteKit with reactive state management. The architecture is sound — centralised state store, service layer separation, component composition — but the domain model is placeholder. The `Item` type is literally `{ type: string }`. The generation logic is a coin flip, not a simulation.

### 1.2 Specified But Unbuilt (Implementation Docs)

Three detailed milestone specs exist in `docs/dev/implementation/`:

| Document | Coverage | Quality | Gaps |
|---|---|---|---|
| **M1: Artefact Generation** | CFG pipeline, blueprint schema, constraint system, material pools, type classification | Strong. TypeScript interfaces, JSON examples, generation sketches, validation rules, testing plan | No grammar authoring tooling. Classification table is incomplete. No worked example of a full CFG expansion |
| **M2: Objective World State** | Period/culture schema, material biases, slot likelihood adjustments, provenance metadata | Good. Data model is clear, weighted selection implemented in sketch form | Only 1 culture example. No inter-culture interaction. Motif system hand-waved. No world seed → generation pipeline |
| **M3: Subjective World State** | Notes, hypotheses, evidence linking, inferred traits, inspection UI | Adequate. Schema is defined, store sketch exists | No mechanism for *how* hypotheses influence future interpretation. The feedback loop — the whole point — is structurally absent. **Update:** The "Subjective World State" has been reconceptualised as the player's *interpretive model* — an agent-generic interface shared with NPC scholars. See doc 11, Section 2.5–2.7. |

**Honest assessment:** M1 is the most implementation-ready. M2 is a good foundation but undersells the complexity of cultural simulation. M3 defines data structures but doesn't address the core mechanic (error propagation). None of them account for the expanded systems from your conversations (publication, career, documents).

### 1.3 Designed in Conversation (Not Yet Documented)

These systems were explored in depth across multiple conversations but exist only in chat transcripts:

**Publication System (Three Tracks)**
- Academic: monographs, peer review, reputational stakes
- Curatorial: museum exhibitions, thematic narratives
- Popular: accessible articles, broad reach, lower risk
- *Status: Well-conceptualised. No data model, no spec, no implementation plan.*

**Career Progression**
- Lecturing, supervising juniors, being supervised, field work, managing relationships
- Each loop interacts with others (lecture → public commitment → harder to retract)
- *Status: Discussed with enthusiasm. No concrete mechanics. No data model.*

**Document System (18+ Types)**
- Artefact studies, material generalisations, timelines, cultural profiles, inference proofs, language theories, grammar documents, commentaries, revision records
- Each document type has cross-references and cascading update requirements
- *Status: Thoroughly mapped from handwritten notes. Notion page exists. No technical spec.*

**NPC Scholars & Academic Politics**
- Rival archaeologists with their own flawed theories
- Political pressure affecting research direction
- Budget constraints on excavation
- *Status: Mentioned. Almost entirely unspecified.*

**Feature Mapping (Numbered List, ~32 Items)**
- Language evolution, geological reality, religion/mythology, aesthetics, literary traditions, political evolution, biotext, contradiction thresholds, NPC opinions, budget systems
- *Status: Handwritten notes analysed in conversation. Many items are single-word concepts with no elaboration.*

### 1.4 Historical Artefacts (Backlog)

The `backlog/` directory contains earlier implementation attempts:

- `itemGenerator.ts` — Pre-SvelteKit vanilla TS item generator with DOM manipulation
- `materials.ts` — Identical to current `src/lib/data/materials.ts`
- `pile/docs/DEVLOG.md` — Detailed flowchart thinking about artefact anatomy (grip systems, blade systems, slot constraints). This is the intellectual ancestor of the M1 spec.
- `pile/item-grammars/` — TypeScript declaration files for a grammar-based approach (types, parts, materials, conditions). Empty implementations.
- `pile/utils/indexRandom.ts` — Identical to current utility

**Honest assessment:** The backlog is archaeologically interesting but technically superseded. The devlog flowchart thinking was clearly formative — it directly informed the M1 blueprint/slot/constraint model. The grammar declaration files suggest you explored this direction early but didn't get far.

### 1.5 Infrastructure & Tooling

- Claude Code integration (`.claude/` commands for commits, PRs, reports, roadmap updates)
- Notion project page (linked but content unknown beyond document system page)
- GitHub repository (JasonWarrenUK/those-who-came-before)
- Roadmap templates exist but are unfilled (placeholder markdown)

---

## 2. Contradictions & Tensions

### 2.1 Tech Stack Drift

The project knowledge says "TypeScript + Deno runtime." The actual codebase is SvelteKit + Node adapter + Vite. The `objective.md` design document still references Deno. This needs a clean decision: the SvelteKit choice already implies Node/Vite, so unless there's a strong reason to switch, Deno is a ghost in the docs.

### 2.2 Scope vs Milestone Structure

The 7-milestone plan in `milestones.md` covers artefact generation → world state → player knowledge model → contradictions → persistence → UI → cultural depth. But the conversation-designed systems (publication, career, documents, NPCs) don't appear in any milestone. They're either squeezed into an implicit "Milestone 8+" or they need to be woven into existing milestones.

The risk: building M1-M3 without considering how documents and publication will interact means retrofitting core data models later.

### 2.3 The Feedback Loop Gap

The entire game premise is that player errors compound forward. But M3 (the player's interpretive model, originally termed "Subjective World State") defines data *structures* for hypotheses without specifying *how* those hypotheses alter subsequent artefact interpretation. The mechanism — the thing that makes this game different from every other archaeology game — is architecturally undefined.

This isn't a nice-to-have. It's the load-bearing wall.

**Note:** This gap has since been addressed. The Interpretive Lens (doc 04) specifies the five channels through which hypotheses alter perception. The reconceptualisation (doc 11, Section 2.5–2.7) reframes the architecture around a unified world state with visibility levels, agent-generic interpretive models, and the lens as the mediating system.

### 2.4 CFG-First vs Blueprint-First

M1 defines two generation paths: CFG-first (emergent, grammar-driven) and Blueprint-first (authored, fixed). The spec calls CFG-first "primary" but the only concrete examples are blueprint JSON. The grammar is pseudo-BNF with no implementation path. There's a real question about whether CFG-first generation is achievable for MVP or whether it should be deferred.

### 2.5 Scale of Cultural Simulation

The feature mapping notes reference ~32 systems (language, geology, religion, mythology, aesthetics, politics, etc.). M2 defines a culture as material biases + slot biases + motif traits + period profiles. That's a fraction of the conceptual ambition. There's a massive gap between the envisioned cultural simulation depth and what's currently specified.

---

## 3. What's Actually Good

Worth being explicit about what's working:

- **The core insight is brilliant.** "Player error as generative mechanic" is genuinely novel. Most games about archaeology are puzzle games where you find the right answer. This is a game about building an elaborate, possibly wrong, interpretation of history. That's a fundamentally different and more interesting proposition.

- **The SvelteKit foundation is solid.** Clean component architecture, proper state management, sensible service layer separation. When you build M1, you won't be fighting the framework.

- **The M1 spec is genuinely implementation-ready.** TypeScript interfaces, JSON examples, generation pipeline, constraint validation. Someone could sit down and build this.

- **The document system thinking is rich.** 18+ document types with cross-references and cascading updates is ambitious but coherent. It maps well to actual archaeological practice.

- **The reference game analysis is sharp.** You know exactly what you're borrowing from each influence and why.

---

## 4. What Needs Resolving Before We Proceed

These are decisions, not tasks. They need to be made before the design documents can be finalised:

1. **Stack confirmation:** SvelteKit + Node or something else? Is Deno dead?
2. **Scope for MVP:** What's the minimum feature set that demonstrates the core mechanic (error propagation)?
3. **CFG timeline:** Is grammar-first generation MVP or post-MVP?
4. **Feedback loop architecture:** How, mechanically, do hypotheses alter future interpretation?
5. **Career/publication scope:** MVP feature or expansion?
6. **Document system scope:** Which document types are load-bearing for the core loop?
7. **NPC scope:** Are rival scholars MVP or expansion?
8. **Persistence approach:** localStorage, IndexedDB, or file-based?

---

*Next document: Design Pillars — the non-negotiable commitments that answer these questions by constraining the solution space.*
