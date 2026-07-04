# Mermaid Progress Map Scratchpad

```mermaid
---
config:
  layout: elk
title: Progress Map
---
graph TD
subgraph M1["Milestone 1: Xxx"]
    m1{{"`<h2>Milestone 1</h2>`"}}:::mile

    m1A{"`<h3>1A</h3>Deno build configured`"}:::mile
    m1B{"`<h3>1B</h3>All types created`"}:::mile
    m1C{"`<h3>1C</h3>M1 Explorer`"}:::mile
    m1D{"`<h3>1D</h3>Random Generation Util`"}:::mile

    1FD.6["`*1FD.6*<br/>PRNG xoshiro128**`"]:::blocked
    1FD.7["`*1FD.7*<br/>weightedSelect util`"]:::blocked
    1FD.8["`*1FD.8*<br/>PRNG determinism test`"]:::blocked
    1FD.9["`*1FD.9*<br/>PRNG distribution test`"]:::blocked

    1FD.10["`*1FD.10*<br/>types/grammar.ts`"]:::blocked
    1FD.11["`*1FD.11*<br/>types/artefact.ts`"]:::blocked
    1FD.12["`*1FD.12*<br/>types/tags.ts`"]:::blocked
    1FD.13["`*1FD.13*<br/>types/decoration.ts`"]:::blocked
    1FD.14["`*1FD.14*<br/>types/world core`"]:::blocked
    1FD.15["`*1FD.15*<br/>types/world relations`"]:::blocked
    1FD.16["`*1FD.16*<br/>types/world provenance`"]:::blocked
    1FD.17["`*1FD.17*<br/>types/world dating`"]:::blocked
    1FD.18["`*1FD.18*<br/>types/interpretation core`"]:::blocked
    1FD.19["`*1FD.19*<br/>types/interpretation claims`"]:::blocked
    1FD.20["`*1FD.20*<br/>types/lens.ts`"]:::blocked
    1FD.21["`*1FD.21*<br/>types/documents core`"]:::blocked
    1FD.22["`*1FD.22*<br/>types/documents dissem`"]:::blocked
    1FD.23["`*1FD.23*<br/>types/venues.ts`"]:::blocked
    1FD.24["`*1FD.24*<br/>types/contradiction core`"]:::blocked
    1FD.25["`*1FD.25*<br/>types/contradiction queue`"]:::blocked
    1FD.26["`*1FD.26*<br/>types/career core`"]:::blocked
    1FD.27["`*1FD.27*<br/>types/career drains`"]:::blocked
    1FD.28["`*1FD.28*<br/>types/term.ts`"]:::blocked
    1FD.29["`*1FD.29*<br/>types/scholars.ts`"]:::blocked
    1FD.30["`*1FD.30*<br/>types/corpus.ts`"]:::blocked
    1FD.31["`*1FD.31*<br/>types/description.ts`"]:::blocked
    1FD.32["`*1FD.32*<br/>types/visibility.ts`"]:::blocked
    1FD.33["`*1FD.33*<br/>types/save.ts`"]:::blocked

    1FD.34["`*1FD.34*<br/>Configure deno test`"]:::open
    1FD.35["`*1FD.35*<br/>Test fixture helpers`"]:::blocked

    1FD.36["`*1FD.36*<br/>Explorer route + layout`"]:::blocked
    1FD.37["`*1FD.37*<br/>Explorer seed input`"]:::blocked
    1FD.38["`*1FD.38*<br/>Explorer PRNG display`"]:::blocked
    1FD.39["`*1FD.39*<br/>Explorer type index`"]:::blocked
    1FD.6 --> 1FD.7 & 1FD.8 & 1FD.9
    1FD.7 --> m1D
    1FD.8 --> m1D
    1FD.9 --> m1D
    1FD.10 --> 1FD.11
    1FD.11 --> 1FD.13
    1FD.12 --> 1FD.10 & 1FD.18 & 1FD.32
    1FD.13 --> 1FD.31
    1FD.14 --> 1FD.15 & 1FD.16 & 1FD.17
    1FD.15 --> 1FD.30
    1FD.16 --> 1FD.30
    1FD.17 --> 1FD.30
    1FD.18 --> 1FD.19 & 1FD.20
    1FD.19 --> 1FD.21 & 1FD.24 & 1FD.29
    1FD.20 --> 1FD.24 & 1FD.29
    1FD.21 --> 1FD.23
    1FD.22 --> 1FD.27
    1FD.23 --> 1FD.22
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
    1FD.34 --> 1FD.35
    1FD.35 --> m1A
    1FD.36 --> 1FD.37 & 1FD.39
    1FD.37 --> 1FD.38
    1FD.38 --> m1C
    1FD.39 --> m1C
    m1A --> 1FD.6 & 1FD.12 & 1FD.14 & 1FD.26 & 1FD.36
    m1B --> 1FD.39
    m1C --> m1
    m1D --> 1FD.37
end

m1 --> 2GN.1 & 2GN.2 & 2GN.11

subgraph M2["Milestone 2: Xxx"]
    m2{{"`<h2>Milestone 2</h2>`"}}:::mile
    
    2GN.1["`*2GN.1*<br/>Primitive defs`"]:::blocked
    2GN.2["`*2GN.2*<br/>Grammar rules data`"]:::blocked
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
    2GN.17["`*2GN.17*<br/>Classification rules data`"]:::blocked
    2GN.18["`*2GN.18*<br/>Tag accumulation`"]:::blocked
    2GN.19["`*2GN.19*<br/>extractFeatures`"]:::blocked
    2GN.20["`*2GN.20*<br/>classifyArtefact`"]:::blocked
    2GN.21["`*2GN.21*<br/>physicalLabel`"]:::blocked
    2GN.22["`*2GN.22*<br/>Material defs data`"]:::blocked
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
    
    2GN.1 --> 2GN.12 & 2GN.22
    2GN.2 --> 2GN.3
    2GN.3 --> 2GN.4 & 2GN.5 & 2GN.6 & 2GN.7
    2GN.4 --> 2GN.8
    2GN.5 --> 2GN.8
    2GN.6 --> 2GN.8
    2GN.7 --> 2GN.16
    2GN.8 --> 2GN.9 & 2GN.10 & 2GN.12
    2GN.9 --> 2GN.20
    2GN.10 --> 2GN.16
    2GN.11 --> 2GN.12
    2GN.12 --> 2GN.13 & 2GN.14 & 2GN.15 & 2GN.17 & 2GN.19
    2GN.13 --> 2GN.16
    2GN.14 --> 2GN.16
    2GN.15 --> 2GN.16
    2GN.16 --> 2GN.18
    2GN.17 --> 2GN.18
    2GN.18 --> 2GN.20
    2GN.19 --> 2GN.23
    2GN.20 --> 2GN.21 & 2GN.27 & 2GN.34
    2GN.21 --> 2GN.38
    2GN.22 --> 2GN.23 & 2GN.28
    2GN.23 --> 2GN.24 & 2GN.25 & 2GN.26 & 2GN.29
    2GN.24 --> 2GN.20
    2GN.25 --> 2GN.20
    2GN.26 --> 2GN.20
    2GN.27 --> 2GN.38
    2GN.28 --> 2GN.29
    2GN.29 --> 2GN.30 & 2GN.31 & 2GN.32 & 2GN.33 & 2GN.34
    2GN.30 --> 2GN.38
    2GN.31 --> 2GN.38
    2GN.32 --> 2GN.38
    2GN.33 --> 2GN.38
    2GN.34 --> 2GN.38
    2GN.35 --> 2GN.39
    2GN.36 --> 2GN.39
    2GN.37 --> 2GN.39
    2GN.38 --> 2GN.35 & 2GN.36 & 2GN.37 & 2GN.44
    2GN.39 --> 2GN.40 & 2GN.41 & 2GN.42 & 2GN.43
    2GN.40 --> 2GN.51
    2GN.41 --> 2GN.51
    2GN.42 --> 2GN.51
    2GN.43 --> 2GN.51
    2GN.44 --> 2GN.45 & 2GN.47 & 2GN.48
    2GN.45 --> 2GN.46
    2GN.46 --> 2GN.50
    2GN.47 --> 2GN.43
    2GN.48 --> 2GN.49
    2GN.49 --> 2GN.50 & 2GN.55
    2GN.50 --> 2GN.54
    2GN.51 --> 2GN.53
    2GN.52 --> 2GN.51
    2GN.53 --> 2GN.56
    2GN.54 --> 2GN.52
    2GN.55 --> 2GN.52
    2GN.56 --> m2
end

m2 --> 3WS.1

subgraph M3["`<h1>World State & Integration</h1>`"]
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
    3WS.6 --> 3WS.10
    3WS.7 --> 3WS.6 & 3WS.9
    3WS.8 --> 3WS.9
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
end

m3 --> 4UI.1

subgraph M4["`<h1>Player Interface</h1>`"]
    m4{{"`<h2>Milestone 4</h2>`"}}:::mile

    4UI.1["`*4UI.1*<br/>ArtefactInspector`"]:::blocked
    4UI.2["`*4UI.2*<br/>PropertyList`"]:::blocked
    4UI.3["`*4UI.3*<br/>TagBadge`"]:::blocked
    4UI.4["`*4UI.4*<br/>ConfidenceBadge`"]:::blocked
    4UI.5["`*4UI.5*<br/>Component list UI`"]:::blocked
    4UI.6["`*4UI.6*<br/>Provenance display`"]:::blocked
    4UI.7["`*4UI.7*<br/>Study route`"]:::blocked
    4UI.8["`*4UI.8*<br/>Register switching`"]:::blocked
    4UI.9["`*4UI.9*<br/>Generate artefact btn`"]:::blocked

    4UI.1 --> 4UI.2
    4UI.2 --> 4UI.3 & 4UI.4
    4UI.3 --> 4UI.5
    4UI.4 --> 4UI.5
    4UI.5 --> 4UI.6
    4UI.6 --> 4UI.7 & 4UI.8 & 4UI.9
    4UI.7 --> m4
    4UI.8 --> m4
    4UI.9 --> m4
end

m4 --> 5KN.1

subgraph M5["`<h1>Knowledge Model</h1>`"]
    m5{{"`<h2>Milestone 5</h2>`"}}:::mile
    
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
    
    5KN.1 --> 5KN.2 & 5KN.3
    5KN.2 --> 5KN.4
    5KN.3 --> 5KN.4
    5KN.4 --> 5KN.5 & 5KN.10
    5KN.5 --> 5KN.6 & 5KN.7 & 5KN.8 & 5KN.9
    5KN.6 --> 5KN.18
    5KN.7 --> 5KN.18
    5KN.8 --> 5KN.16
    5KN.9 --> 5KN.18
    5KN.10 --> 5KN.11 & 5KN.15
    5KN.11 --> 5KN.14
    5KN.12 --> 5KN.13 & 5KN.20
    5KN.13 --> m5
    5KN.14 --> 5KN.17
    5KN.15 --> 5KN.14
    5KN.16 --> 5KN.18
    5KN.17 --> 5KN.18
    5KN.18 --> 5KN.19
    5KN.19 --> 5KN.12
    5KN.20 --> 5KN.21 & 5KN.22
    5KN.21 --> 5KN.23
    5KN.22 --> 5KN.24
    5KN.23 --> m5
    5KN.24 --> m5
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

  
  6LS.2 --> 6LS.1
  6LS.3 --> 6LS.1
  6LS.4 --> 6LS.2
  6LS.5 --> 6LS.2
  6LS.6 --> 6LS.5
  6LS.7 --> 6LS.5
  6LS.8 --> 6LS.5
  6LS.9 --> 6LS.5
  6LS.10 --> 6LS.5
  6LS.11 --> 6LS.6
  6LS.11 --> 6LS.7
  6LS.11 --> 6LS.8
  6LS.11 --> 6LS.9
  6LS.11 --> 6LS.10
  6LS.12 --> 6LS.11
  6LS.13 --> 6LS.11
  6LS.14 --> 6LS.8
  6LS.15 --> 6LS.11
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

  7CD.2 --> 7CD.1
  7CD.3 --> 7CD.1
  7CD.4 --> 7CD.1
  7CD.5 --> 7CD.1
  7CD.6 --> 7CD.1
  7CD.7 --> 7CD.1
  7CD.8 --> 7CD.1
  7CD.9 --> 7CD.1
  7CD.10 --> 7CD.1
  7CD.11 --> 7CD.1
  7CD.12 --> 7CD.1
  7CD.13 --> 7CD.12
  7CD.14 --> 7CD.12
  7CD.15 --> 7CD.10
  7CD.16 --> 7CD.15
  7CD.17 --> 7CD.15
  7CD.18 --> 7CD.15
  7CD.19 --> 7CD.15
  7CD.20 --> 7CD.19
  7CD.21 --> 7CD.20
  7CD.22 --> 7CD.20
  7CD.23 --> 7CD.20
  7CD.24 --> 7CD.20
  7CD.25 --> 7CD.12
  7CD.26 --> 7CD.25
  7CD.27 --> 7CD.19
  7CD.28 --> 7CD.20
  7CD.29 --> 7CD.28
  7CD.30 --> 7CD.28
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

  8PS.2 --> 8PS.1
  8PS.3 --> 8PS.2
  8PS.4 --> 8PS.1
  8PS.5 --> 8PS.4
  8PS.6 --> 8PS.2
  8PS.7 --> 8PS.6
  8PS.8 --> 8PS.6
  8PS.9 --> 8PS.7
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

  9CR.2 --> 9CR.1
  9CR.3 --> 9CR.1
  9CR.4 --> 9CR.1
  9CR.5 --> 9CR.1
  9CR.6 --> 9CR.5
  9CR.7 --> 9CR.2
  9CR.8 --> 9CR.7
  9CR.9 --> 9CR.7
  9CR.10 --> 9CR.7
  9CR.11 --> 9CR.7
  9CR.12 --> 9CR.7
  9CR.13 --> 9CR.6
  9CR.14 --> 9CR.7
  9CR.15 --> 9CR.7
  9CR.16 --> 9CR.15
  9CR.17 --> 9CR.15
  9CR.18 --> 9CR.17
  9CR.19 --> 9CR.17
  9CR.20 --> 9CR.15
  9CR.21 --> 9CR.17
  9CR.22 --> 9CR.21
  9CR.23 --> 9CR.20
  9CR.24 --> 9CR.20
  9CR.25 --> 9CR.2
  9CR.26 --> 9CR.5
  9CR.27 --> 9CR.3
  9CR.28 --> 9CR.7
  9CR.29 --> 9CR.11
  9CR.30 --> 9CR.28
  9CR.31 --> 9CR.21
  9CR.32 --> 9CR.15
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

  10NP.2 --> 10NP.1
  10NP.3 --> 10NP.1
  10NP.4 --> 10NP.1
  10NP.5 --> 10NP.1
  10NP.6 --> 10NP.5
  10NP.7 --> 10NP.1
  10NP.8 --> 10NP.5
  10NP.9 --> 10NP.5
  10NP.10 --> 10NP.1
  10NP.11 --> 10NP.3
  10NP.12 --> 10NP.1
  10NP.13 --> 10NP.9
  10NP.14 --> 10NP.10
  10NP.15 --> 10NP.2
  10NP.16 --> 10NP.6
  10NP.17 --> 10NP.8
  10NP.18 --> 10NP.9
  10NP.19 --> 10NP.14
  10NP.20 --> 10NP.3
end

classDef default,blocked fill:#f9f;
classDef open fill:#ff9;
classDef mile fill:#9ff;
```
