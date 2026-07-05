# TWCB Design Pillars
*The non-negotiable commitments that constrain every other decision*

---

## Pillar 1: Error Is the Engine

The game's central innovation is that player mistakes aren't failures — they're generative. A wrong interpretation of an artefact doesn't end a quest line or trigger a game-over; it becomes part of the player's evolving (and potentially deeply flawed) model of history.

**This means:**
- The system must track the player's interpretive model — their observations, inferences, hypotheses, and publications — alongside the world state's occluded ground truth (doc 11, Section 2.5)
- Subsequent artefact interpretation must be mechanically filtered through existing beliefs
- Errors must compound: a wrong assumption about materials leads to wrong assumptions about trade routes leads to wrong assumptions about cultural relationships
- The player should be able to build an elaborate, internally consistent, and completely false academic edifice — and that should be a valid and interesting way to play

**This constrains:**
- No system can ever tell the player they're wrong out-of-character
- No difficulty slider that makes interpretation easier/harder — the difficulty is epistemological
- No "correct answer" feedback loops (no green checkmarks, no score)
- The generation system must produce artefacts that are *genuinely ambiguous* — if the right answer is always obvious, the mechanic collapses

---

## Pillar 2: Diegesis First

Every piece of information the player receives comes from within the game world. There are no UI tooltips saying "this contradicts your earlier finding." There are no system messages. Everything is mediated through in-world channels.

**This means:**
- Contradictions surface as peer letters, student questions, journalistic scrutiny, or impossible artefacts
- The player's own notes and documents are the primary interface for tracking knowledge
- Academic reputation is an in-world mechanic, not a gamified XP bar
- The passage of time, career milestones, and institutional relationships are all narrative, not abstract

**This constrains:**
- No HUD elements that expose occluded ground truth
- No omniscient narrator
- Debug/developer tools are fine during development but the player-facing experience is entirely diegetic
- UI design must feel like tools the character would actually use (desk, documents, notebooks) rather than game menus

---

## Pillar 3: Simulation Honesty

Every player-facing element must be derived from the same underlying simulation. Text descriptions, future visual representations, statistical properties — all generated from the same data. No decorative cheats, no aesthetic flourishes that contradict mechanical reality.

**This means:**
- An artefact's text description is generated from its blueprint properties
- Future visual representations will render the same blueprint data
- Cultural traits that affect generation are the same traits the player can hypothesise about
- If the simulation says a culture doesn't use obsidian, no obsidian artefacts from that culture exist — period

**This constrains:**
- No hand-authored "special" artefacts that break generation rules
- No aesthetic decisions that contradict the data model
- Every adjective in a description must map to a property in the schema
- The visual pipeline (when it exists) must be a renderer of data, not an artist's impression

---

## Pillar 4: Accumulation Over Revelation

Knowledge in this game is built up gradually through repeated observation, cross-referencing, and inference. It's never dumped on the player through exposition or unlocked in discrete chunks.

**This means:**
- The player's understanding improves incrementally as patterns emerge across multiple artefacts
- No "eureka" moments delivered by the system — only the player's own realisations
- Documents and notes are living records that evolve as understanding deepens
- The game rewards patience and careful observation, not speed or completeness

**This constrains:**
- No tutorial that explains how to interpret artefacts
- No knowledge trees or skill unlocks that gate interpretation ability
- No "you've discovered the Bronze Age!" achievements
- The UI must support long-form, return-to-later research workflows

**Reference touchstone:** Heaven's Vault's language system, where individual glyph translations are uncertain until confirmed by repeated encounters in different contexts.

---

## Pillar 5: The Player Is an Unreliable Narrator

The player character is a scholar with biases, institutional pressures, career ambitions, and limited information. Their publications become part of the game's historiography — and that historiography can be wrong.

**This means:**
- Published work becomes "established doctrine" that influences NPCs and the academic landscape
- Retracting published errors carries reputational cost
- Students and protégés inherit the player's frameworks (including errors)
- The player's career trajectory creates pressure to commit to interpretations before the evidence is conclusive

**This constrains:**
- The game cannot treat the player as an omniscient observer
- Career systems must create genuine tension between thoroughness and ambition
- Publication is not a victory condition — it's a commitment with consequences
- The social/academic simulation must be robust enough that "being right" and "being successful" can diverge

---

## Pillar 6: Clarity of State Over Spectacle

The interface prioritises legibility of the player's current knowledge state, reasoning chains, and open questions over visual polish or animation. The player must always be able to understand what they think they know, why they think it, and what's uncertain.

**This means:**
- The document system is the primary interface, not a secondary feature
- Hypothesis confidence levels are always visible
- Evidence chains are traceable (artefact → observation → hypothesis → theory)
- Contradictions are surfaceable without being forced

**This constrains:**
- No full-screen cinematic moments that interrupt research flow
- The desk-based UI must be information-dense without being overwhelming
- Typography, layout, and information hierarchy do the heavy lifting — not illustration
- Mobile is secondary; this is a desktop research interface

---

## How the Pillars Resolve Open Questions

| Question | Resolution | Governing Pillar |
|---|---|---|
| Minimum viable feature set? | Must demonstrate error propagation through at least 2 interpretation cycles | Pillar 1 |
| CFG-first for MVP? | Yes. CFG is the primary generation path; blueprint-first is a compatibility mode for authored content only. | Pillar 3 (simulation honesty requires consistent generation from a single grammar source) |
| Career/publication for MVP? | Not the mechanics, but the *consequences* of commitment need to exist. A lightweight "publish finding" action that locks in an interpretation is sufficient. | Pillar 5 |
| Which document types are core? | Artefact studies, material generalisations, cultural profiles, and the revision record. Everything else is expansion. | Pillar 4 + 6 |
| NPC scholars for MVP? | No. The player can be their own unreliable narrator without rivals. NPCs add richness but not mechanism. | Pillar 5 |
| Persistence approach? | IndexedDB for web. It's the path of least resistance for structured data in a browser. | Pillar 4 (long-form play needs persistence; this is the simplest path) |
| Stack confirmation? | SvelteKit + Deno (`@deno/svelte-adapter`). Runtime locked to Deno as of February 2026; Node tooling stripped. | Pragmatism |

---

*Next document: Core Loop & Systems Map — how all the game's systems interlock, with the pillars as structural constraints.*
