# Those Who Came Before: NPC Systems

**State:** planned. Stored as `archived` until the roadmap plugin gains a planned phase state
(goblin-scout 3.x); promote it once the phase before it is done. Index: [roadmaps](README.md).

**Gate G1:** Career & Publication phase complete. Stands in for the cross-phase edge to Career &
Publication. Lift it when this phase is promoted to active: remove G1 from each blocked task's
dependsOn, empty the gate's blocks, mark the gate done, then run roadmap.py recompute and validate.

---

## Milestone 1: Peer Review

**Goal:** Named NPC reviewers judge submissions and remember them

- [ ] **10NP.1** — `engine/career/peerReview.ts` —
      `generatePeerReview(document, reviewer, worldState, noise): PeerReviewCareerEvent` — compare
      commitments against world state (with noise), reviewer's model, reviewer's bias _(blocked:
      depends on G1)_
- [ ] **10NP.2** — `engine/career/peerReview.ts` — `ReviewerFeedback` generation: diegetic
      assessment text, methodological concerns, commitments disputed/endorsed _(blocked — depends on
      10NP.1)_
- [ ] **10NP.3** — `engine/career/peerReview.ts` — review outcome determination: accepted /
      revisions-requested / rejected based on commitment match, evidence quality, venue fit
      _(blocked — depends on 10NP.1)_
- [ ] **10NP.4** — `engine/career/peerReview.ts` — reviewer selection: choose from NPC pool based on
      specialism alignment with document scope _(blocked — depends on 10NP.1)_
- [ ] **10NP.11** — `engine/career/npc.ts` — reviewer memory: reviewer who previously rejected
      brings context to new submissions _(blocked — depends on 10NP.3)_
- [ ] **10NP.12** — Peer review as `ActivityType`: time/energy cost (2-3 weeks, 8 + 2/week), exposes
      alternative interpretations _(blocked — depends on 10NP.1)_
- [ ] **10NP.15** — `components/career/NpcInteraction.svelte` — peer review display: reviewer
      feedback, disputed/endorsed commitments _(blocked — depends on 10NP.2)_
- [ ] **10NP.20** — Venue form reclassification: `FormReclassificationEvent` with direction
      (downward/upward/lateral), editor correspondence _(blocked — depends on 10NP.3)_
- [ ] **10NP.21** — Explorer: NPC panel — reviewer pool with bias profiles, interpretation diffs per
      artefact _(blocked — depends on 10NP.4, 10NP.6)_

---

## Milestone 2: NPC Interpretation & Social Channels

**Goal:** NPCs read artefacts their own way and reach the player through letters and students

- [ ] **10NP.5** — `engine/career/npc.ts` —
      `generateNpcInterpretation(artefact, scholar, worldState): ArtefactStudy` — alternative
      reading grounded in NPC's model and corpus _(blocked — depends on 10NP.1)_
- [ ] **10NP.6** — `engine/career/npc.ts` — NPC interpretation difference detection: where NPC and
      player diverge and why (cultural attribution, tag emphasis, material significance) _(blocked —
      depends on 10NP.5)_
- [ ] **10NP.8** — `engine/career/npc.ts` —
      `generatePeerChallenge(contradiction, scholar): DiegeticSurface` — peer letter channel,
      challenge references NPC's own published commitments _(blocked — depends on 10NP.5)_
- [ ] **10NP.9** — `engine/career/npc.ts` —
      `generateStudentQuestion(hypothesis, proof, worldState): DiegeticSurface` — target weakest
      proof step with naive but pointed question _(blocked — depends on 10NP.5)_
- [ ] **10NP.13** — Student supervision as `ActivityType`: time/energy cost (8-12 weeks, 5 +
      1/week), generates student questions targeting weak proofs _(blocked — depends on 10NP.9)_
- [ ] **10NP.16** — NPC interpretation comparison view: player's reading vs NPC's reading side by
      side _(blocked — depends on 10NP.6)_
- [ ] **10NP.17** — Peer letter display: diegetic NPC challenge correspondence _(blocked — depends
      on 10NP.8)_
- [ ] **10NP.18** — Student question display: diegetic student inquiry _(blocked — depends on
      10NP.9)_
- [ ] **10NP.23** — Explorer: student question targeting view (which proof steps probed and why)
      _(blocked — depends on 10NP.9)_

---

## Milestone 3: Relationships

**Goal:** Citation balance and relationships with NPCs evolve

- [ ] **10NP.7** — `engine/career/reputation.ts` — over-citation penalty: track citation frequency
      per NPC, originality drain when ratio exceeds threshold _(blocked — depends on 10NP.1)_
- [ ] **10NP.10** — `engine/career/npc.ts` — NPC relationship evolution: respect/agreement deltas
      from review outcomes, citation patterns, published agreement/disagreement _(blocked — depends
      on 10NP.1)_
- [ ] **10NP.14** — `worldState.svelte.ts` extensions: `updateScholarRelationship()`, peer review
      event tracking, NPC relationship scores (respect/agreement per NPC) _(blocked — depends on
      10NP.10)_
- [ ] **10NP.19** — NPC relationship indicators in career dashboard _(blocked — depends on 10NP.14)_
- [ ] **10NP.22** — Explorer: citation balance tracker, relationship score history per NPC _(blocked
      — depends on 10NP.10, 10NP.7)_

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
	G1["G1: Career & Publication phase complete"]:::external
	10NP.1["10NP.1: `engine/career/peerReview.ts` — `genera…"]
	10NP.2["10NP.2: `engine/career/peerReview.ts` — `Review…"]
	10NP.3["10NP.3: `engine/career/peerReview.ts` — review…"]
	10NP.4["10NP.4: `engine/career/peerReview.ts` — reviewe…"]
	10NP.11["10NP.11: `engine/career/npc.ts` — reviewer memo…"]
	10NP.12["10NP.12: Peer review as `ActivityType`: time/en…"]
	10NP.15["10NP.15: `components/career/NpcInteraction.svel…"]
	10NP.20["10NP.20: Venue form reclassification: `FormRecl…"]
	10NP.5["10NP.5: `engine/career/npc.ts` — `generateNpcIn…"]
	10NP.6["10NP.6: `engine/career/npc.ts` — NPC interpreta…"]
	10NP.21["10NP.21: Explorer: NPC panel — reviewer pool wi…"]
	M1["M1: Peer Review"]:::mile
	10NP.8["10NP.8: `engine/career/npc.ts` — `generatePeerC…"]
	10NP.9["10NP.9: `engine/career/npc.ts` — `generateStude…"]
	10NP.13["10NP.13: Student supervision as `ActivityType`:…"]
	10NP.16["10NP.16: NPC interpretation comparison view: pl…"]
	10NP.17["10NP.17: Peer letter display: diegetic NPC chal…"]
	10NP.18["10NP.18: Student question display: diegetic stu…"]
	10NP.23["10NP.23: Explorer: student question targeting v…"]
	M2["M2: NPC Interpretation & Social Channels"]:::mile
	10NP.7["10NP.7: `engine/career/reputation.ts` — over-ci…"]
	10NP.10["10NP.10: `engine/career/npc.ts` — NPC relations…"]
	10NP.14["10NP.14: `worldState.svelte.ts` extensions: `up…"]
	10NP.19["10NP.19: NPC relationship indicators in career…"]
	10NP.22["10NP.22: Explorer: citation balance tracker, re…"]
	M3["M3: Relationships"]:::mile
	G1 --> 10NP.1
	10NP.1 --> 10NP.2
	10NP.1 --> 10NP.3
	10NP.1 --> 10NP.4
	10NP.1 --> 10NP.12
	10NP.1 --> 10NP.5
	10NP.1 --> 10NP.7
	10NP.1 --> 10NP.10
	10NP.2 --> 10NP.15
	10NP.3 --> 10NP.11
	10NP.3 --> 10NP.20
	10NP.4 --> 10NP.21
	10NP.11 --> M1
	10NP.12 --> M1
	10NP.15 --> M1
	10NP.20 --> M1
	10NP.5 --> 10NP.6
	10NP.5 --> 10NP.8
	10NP.5 --> 10NP.9
	10NP.6 --> 10NP.21
	10NP.6 --> 10NP.16
	10NP.21 --> M1
	10NP.8 --> 10NP.17
	10NP.9 --> 10NP.13
	10NP.9 --> 10NP.18
	10NP.9 --> 10NP.23
	10NP.13 --> M2
	10NP.16 --> M2
	10NP.17 --> M2
	10NP.18 --> M2
	10NP.23 --> M2
	10NP.7 --> 10NP.22
	10NP.10 --> 10NP.14
	10NP.10 --> 10NP.22
	10NP.14 --> 10NP.19
	10NP.19 --> M3
	10NP.22 --> M3
	class 10NP.1,10NP.10,10NP.11,10NP.12,10NP.13,10NP.14,10NP.15,10NP.16,10NP.17,10NP.18,10NP.19,10NP.2,10NP.20,10NP.21,10NP.22,10NP.23,10NP.3,10NP.4,10NP.5,10NP.6,10NP.7,10NP.8,10NP.9 blocked
```
