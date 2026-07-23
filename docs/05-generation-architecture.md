# TWCB: Generation Architecture
*From world seed to player-facing artefact*

---

## 1. Pipeline Overview

The generation pipeline has nine stages. Every artefact that reaches the player has passed through all nine, in order.

```
World Seed
  → Chronology & Culture Generation (once per game)
    → Initial Corpus Generation (once per game)
      → Bottom-Up Structural Grammar (per artefact)
        → Structural Normalisation + Plausibility Checking
          → Material Assignment (culture-biased, geologically constrained)
            → Decorative Grammar (layered, material-aware)
              → Unified Feature Extraction + Tag Classification
                → Description Generation (register-filtered, lens-filtered)
```

Stages 1–3 run once per game (world creation). Stages 4–8 run each time a new artefact is produced. Stage 9 runs every time the player *inspects* an artefact, because the lens, the player's available registers, and their accumulated knowledge may have shifted since last viewing.

### 1.1 Visibility Annotations

Every property produced by the pipeline exists at one of four visibility levels (doc 11, Section 2.5). These levels govern what the player can perceive, what agents can reason about, and what only the engine uses internally.

| Pipeline Stage | Visibility Level | Rationale |
|---|---|---|
| World Seed | Engine-internal | Never exposed to any agent |
| Chronology & Culture | Occluded | Ground truth the player must infer |
| Grammar Expansion | Observable | Physical structure is directly perceptible |
| Constraint Validation | Engine-internal | Validation logic, not a world property |
| Tag Classification | Occluded | True function/context tags are hidden |
| Material Assignment | Mixed | Material identity is observable; geological provenance is inferable; cultural significance is occluded |
| Decorative Grammar | Observable (layers) / Inferable (motif meaning) | Decoration is visible; its significance requires interpretation |
| Feature Extraction | Mixed | Physical features are observable; their classificatory weight is occluded |
| Description Generation | Observable but lens-shaped | What the player reads is filtered through registers and the interpretive lens |

The lens operates exclusively on observable and inferable properties. It cannot reveal occluded properties and it cannot hide observable ones — it can only reorder, reframe, and de-emphasise them.

---

## 2. Stage 1: World Seed

A single seed string deterministically generates all downstream content.

```typescript
interface WorldSeed {
  raw: string;
  prng: () => number;  // Seeded, deterministic (xoshiro128**)
}
```

Determinism guarantee: same seed = same *sequence* of artefacts. Artefact N may depend on artefacts 1 through N-1 (associated finds, site reuse, material precedent). The seed determines the sequence, not individual artefacts in isolation.

---

## 3. Stage 2: Chronology & Culture Generation

Produces the `WorldState`: the single source of truth with properties at varying visibility levels. Chronology and culture profiles are occluded — the player never reads them directly but must infer their structure from observable artefact properties. The `WorldState` is not the "objective world state" in opposition to a "subjective" one; it's simply what exists, and interpretation is what agents (player and NPC) do with it.

### 3.1 Culture-Relative Chronology

There is no monolithic world timeline with shared periods. Each culture has its own periodisation. Interactions between cultures are defined by temporal overlap, not shared phase labels.

```typescript
interface WorldChronology {
  startYear: number;                   // Earliest point in the timeline
  endYear: number;                     // Latest point (last cultural activity)
  presentYear: number;                 // "Now" — the year the player is working
  cultureTimelines: CultureTimeline[];
  relationships: CultureRelationship[];
}

interface CultureTimeline {
  cultureId: string;
  phases: CulturePhase[];
}

interface CulturePhase {
  id: string;
  label: string;                      // "Expansion", "Settlement", "Fragmentation"
  startYear: number;
  endYear: number;
  characteristics: PhaseCharacteristics;
}
```

Culture A's "Expansion" might overlap with Culture B's "Settlement" and early "Consolidation." When the player encounters artefacts from both cultures in the same archaeological layer, they must work out the temporal relationship themselves — the game doesn't tell them that these periods overlap.

`presentYear` anchors the chronology to the player's working moment. The difference between `presentYear` and an artefact's provenance `year` is its true age — but this is hidden from the player. Absolute dating is not free information (see Section 4.7).

### 3.2 Multi-Attribute Phase Characteristics

Cultural phases are described by multi-attribute profiles, not single floats. A culture can be exceptional metalworkers with crude ceramics.

```typescript
interface PhaseCharacteristics {
  technology: {
    metallurgy: number;               // 0–1
    ceramics: number;
    textiles: number;
    stoneWorking: number;
    glassWorking: number;
    woodWorking: number;
    boneWorking: number;
  };
  economy: {
    tradeOpenness: number;            // Affects foreign material availability
    surplus: number;                  // Affects craft specialisation capacity
    urbanisation: number;             // Affects artefact density and diversity
  };
  society: {
    stratification: number;           // Affects elite/utilitarian distribution
    militarisation: number;           // Affects weapon-adjacent forms
    religiousEmphasis: number;        // Affects ritual-adjacent forms
    craftSpecialisation: number;      // Affects part count, complexity budgets
  };
  aesthetics: {
    decorativeEmphasis: number;       // Affects decorative component budgets
    motifComplexity: number;          // Affects engraving/inlay sophistication
    formConservatism: number;         // High = less variation between artefacts
  };
}
```

These attributes feed directly into both grammar expansion and the decorative layer as weight modifiers. High `metallurgy` increases the probability of metal-compatible components. High `craftSpecialisation` increases the plausibility checker's part budget and the decorative grammar's recursion cap. High `formConservatism` narrows the variance in grammar branch selection.

### 3.3 Culture Generation

```typescript
interface Culture {
  id: string;
  label: string;
  baseProfile: CulturalProfile;
  timeline: CultureTimeline;
}

interface CulturalProfile {
  materialAffinities: Map<MaterialTag, number>;
  techniqueAffinities: Map<DecorativeTechnique, number>;
  motifVocabulary: MotifSet;
  craftInvestment: CraftInvestmentProfile;
}

interface CraftInvestmentProfile {
  // Where a culture channels its crafting energy.
  // Not "make X% weapons" — more like "invest heavily in funerary goods."
  // These bias production frequency, making some artefact contexts 
  // more common and others relatively rarer.
  contextWeights: Map<DepositionType, number>;
  siteTypeWeights: Map<SiteType, number>;
}
```

The `CulturalProfile` captures stable tendencies that persist across phases. The `PhaseCharacteristics` capture how those tendencies manifest in a specific period. A culture might always favour stone (`materialAffinities`), but their stone-working capability (`technology.stoneWorking`) varies by phase.

`techniqueAffinities` (roadmap 2GN.29) is a separate signal from both `materialAffinities` and `motifVocabulary` (§8.5): a culture's preference for *which decorative techniques* it uses is independent of what materials it favours and what motifs it depicts. A culture can engrave beasts, engrave without beasts, depict beasts through other techniques without engraving, or neither — the four combinations only exist if technique choice and motif choice vary independently. Selection additionally enforces a one-directional material-access gate: a culture with no material in plentiful-and-favoured supply that satisfies a technique's substrate has that technique suppressed regardless of stated affinity, but favouring a suitable material never forces the technique to be used (§8.2's material prerequisites are a precondition on technique selection, not a cause of it).

### 3.4 Temporal Relationships

Culture relationships are temporal ranges, not static attributes. Two cultures can trade in one window and fight in another.

```typescript
interface CultureRelationship {
  cultureIds: [string, string];
  phases: RelationshipPhase[];
}

interface RelationshipPhase {
  startYear: number;
  endYear: number;
  dynamics: RelationshipDynamics;
}

interface RelationshipDynamics {
  trade: {
    volume: number;                   // 0–1
    materialFlow: MaterialFlow[];
    directionality: 'balanced' | 'asymmetric';
    dominantCulture?: string;
  };
  conflict: {
    intensity: number;
    type: 'raiding' | 'territorial' | 'conquest' | 'none';
  };
  culturalExchange: {
    intensity: number;
    domains: ('motifs' | 'techniques' | 'materials' | 'forms')[];
  };
  political: {
    type: 'independent' | 'tributary' | 'alliance' | 'vassal' | 'colonial';
    dominantCulture?: string;
  };
}

interface MaterialFlow {
  materialTag: MaterialTag;
  specificMaterials?: string[];
  direction: 'a-to-b' | 'b-to-a' | 'bidirectional';
  volume: number;
}
```

A relationship can simultaneously involve trade in materials and low-level raiding. The player seeing Culture A artefacts with Culture B materials can't simply conclude "they traded" — there are multiple explanations, and the relationship data supports all of them.

### 3.5 Provenance Generation

```typescript
interface Provenance {
  cultureId: string;
  phaseId: string;
  year: number;
  site: {
    name: string;
    type: SiteType;
    region: string;
  };
  context: {
    layer: string;
    associatedFinds: string[];
    condition: PreservationState;
    deposition: DepositionType;
  };
}

type SiteType =
  | 'settlement' | 'burial' | 'workshop' | 'midden'
  | 'shrine' | 'cache' | 'shipwreck' | 'battlefield'
  | 'market' | 'fortification' | 'quarry';

type PreservationState =
  | 'excellent' | 'good' | 'fair' | 'poor' | 'fragmentary';

type DepositionType =
  | 'deliberate-placement' | 'casual-discard' | 'destruction'
  | 'burial-goods' | 'foundation-deposit' | 'hoard'
  | 'loss' | 'abandonment' | 'unknown';
```

Deposition type is critical for interpretation. A blade in a `deliberate-placement` context within a `shrine` site reads very differently from the same blade in a `casual-discard` context within a `settlement` — even though the physical object is identical.

### 3.6 Geological Material Scarcity

Material availability is constrained at the world level before cultural preferences apply. Obsidian comes from volcanic geology. Gold is geologically rare. Tin for bronze requires specific deposits.

```typescript
interface GeologicalContext {
  materialAvailability: Map<string, RegionalAvailability>;
}

interface RegionalAvailability {
  materialId: string;
  regions: Map<string, AvailabilityLevel>;
  // A culture can *want* gold all it likes; if there's no gold source
  // within trade range, they don't get gold unless they trade for it.
}

type AvailabilityLevel =
  | 'abundant'       // Local source, no constraints
  | 'available'      // Present but not unlimited
  | 'scarce'         // Limited deposits, competes with other uses
  | 'trade-only'     // Not locally available, requires trade
  | 'absent';        // Not available even through trade at current relationships
```

Geological scarcity interacts with trade relationships: Culture A has no local gold, but Culture B has abundant gold and they trade. Culture A artefacts with gold tell a story about that trade relationship — or about conquest, or about a prestige gift, or about a stolen trophy.

For MVP: 2 cultures, 3–4 phases each, 1 relationship with 2 temporal phases. This is enough to exercise the full system.

---

## 4. Stage 3: Initial Corpus Generation

Before the player starts, the world needs a scholarly baseline — the accumulated output of a profession that's been working for decades. This isn't a database of every artefact ever found. It's a body of *publications*: synthesised claims with varying levels of support, shaped by the biases of the researchers who produced them.

### 4.1 Simulated Research Histories

At world generation time, after cultures and chronology exist:

1. **Generate NPC scholars** with specialisations, biases, site preferences, and career stages. Each NPC scholar has an `InterpretiveModel` instance — the same agent-generic interface the player uses (doc 11, Sections 2.5–2.7). Some NPCs are active (the player will interact with them later). Some are retired or deceased — foundational figures whose work shaped the field but who aren't active participants.

2. **Simulate excavation campaigns.** Each NPC "excavated" certain sites, biased by their interests and institutional access. An NPC focused on military history digs fortifications and battlefields, not temples. An NPC from an institution near Culture A's territory has disproportionate access to Culture A material.

3. **Generate publications from excavation results.** Each NPC's publications reflect what they found, filtered through their interpretive lens. The engine generates NPC interpretive models by running a simplified observe → infer → hypothesise pipeline with calibrated error injection. NPC publications are document nodes (doc 10) with form classifications, dissemination states, venue assignments, and lineage relationships — the same structures the player's publications use.

4. **Aggregate into consensus.** Where multiple NPCs agree, consensus forms. Where they disagree, the corpus contains active debates. NPC errors are claims in their interpretive models that diverge from occluded ground truth — not ad-hoc metadata flags.

```typescript
interface NPCScholarSeed {
  id: string;
  name: string;
  specialisation: FunctionTag[];
  cultureFocus: string[];
  interpretiveModel: InterpretiveModel; // Agent-generic: same interface as player
  sitePreference: SiteType[];
  careerStage: 'emeritus' | 'senior' | 'mid' | 'early';
  status: 'active' | 'retired' | 'deceased';
  publicationCount: number;
}

interface SimulatedExcavation {
  npcId: string;
  siteId: string;
  siteType: SiteType;
  cultureId: string;
  phaseId: string;
  artefactsSampled: number;
  materialDistribution: Map<string, number>;
  formDistribution: Map<string, number>;
  contextDistribution: Map<string, number>;
}
```

This simulation doesn't run at high fidelity. It's a sampling and synthesis pass over the `WorldState`: sample artefacts biased by NPC site selection, filter through NPC interpretive lenses, produce summary claims, record agreements and disagreements.

### 4.2 Coverage Gaps

The simulation deliberately leaves holes. Not every culture gets equal attention. Not every site type gets excavated. Some periods are well-documented, others barely touched.

```typescript
interface CoverageBudget {
  totalExcavations: number;
  cultureBias: Map<string, number>;     // Prominent cultures get more attention
  siteTypeBias: Map<SiteType, number>;  // Burials/monuments over middens/workshops
  periodBias: Map<string, number>;      // Later periods better documented
  minimumGapPerCulture: number;         // Guaranteed undocumented site types
}
```

Coverage biases are archaeologically authentic: large, urban, monumental cultures attract more research. Modest cultures in remote regions get overlooked. Burials and temples get excavated before rubbish heaps. These biases create the player's opportunity space — gaps they can fill by choosing to investigate what others haven't.

### 4.3 Professional Corpus

The aggregated output of all simulated research forms the professional corpus: what the field "knows" at game start.

```typescript
interface ProfessionalCorpus {
  materialFrequencies: Map<string, FrequencyRecord>;
  formFrequencies: Map<string, FrequencyRecord>;
  contextAssociations: Map<string, ContextFrequency>;
  activeDebates: Debate[];
  receivedWisdom: ConsensusStatement[];
}

interface FrequencyRecord {
  totalObserved: number;
  byContext: Map<string, number>;
  byCulture: Map<string, number>;
  consensusRarity: 'ubiquitous' | 'common' | 'uncommon' | 'rare' | 'unique';
  lastUpdated: number;                   // Term index of most recent update
}

interface ConsensusStatement {
  claim: string;
  confidence: 'established' | 'accepted' | 'debated' | 'speculative';
  supportingPublications: string[];
  challengingPublications: string[];
}

interface Debate {
  topic: string;
  positions: DebatePosition[];
}

interface DebatePosition {
  npcId: string;
  stance: string;
  evidence: string[];
}
```

### 4.4 What the Player Sees

The player encounters the corpus as:

- **Reference works** summarising what "everyone knows" — material preferences, typical forms, chronological placement. Presented as established fact.
- **Active debates** where NPCs disagree — the player can read both positions and eventually weigh in.
- **Bibliographies** attached to claims — "first documented by [NPC] in [year]" — so the player can assess how well-supported a claim is.
- **Conspicuous absences** a careful player notices — "nobody's published anything about Culture B's burial practices" or "all the literature on this region comes from the same institution."

### 4.5 Calibrated Wrongness

The corpus should be mostly right about common things, wrong about rare things and interpretations. Target ratio: ~70% broadly correct, ~30% interestingly wrong.

Where the corpus gets it right: the most common materials and forms for well-studied cultures.

Where it goes wrong:
- **Interpretive claims** — "Culture A was a warrior society" based on biased site selection (they only dug the fortifications).
- **Absence claims** — "Culture A didn't use gold" because nobody's found the gold-bearing sites yet.
- **Rarity assessments** — "obsidian is rare in this region" because previous excavators misidentified it or didn't excavate the right contexts.
- **Cross-cultural relationships** — "Cultures A and B had no contact" because the evidence for contact is in an unexcavated site type.

### 4.6 Corpus and Claim Magnitude

The professional corpus is the baseline against which the player's publications are measured. Publishing something the profession considers rare is noteworthy. Challenging consensus is bold.

```typescript
type ClaimMagnitude =
  | 'confirmation'    // Consistent with consensus (safe, low impact)
  | 'extension'       // Adds to known patterns (moderate impact)
  | 'challenge'       // Contradicts accepted rarity/association (high impact, high scrutiny)
  | 'novel';          // First documented instance (maximum impact, maximum scrutiny)
```

A player who parrots consensus publishes confirmations and plateaus. A player who trusts their own data and challenges established positions either leaps ahead or falls on their face. The corpus makes this career tension legible.

For MVP: 3–4 NPC researchers, 6–8 simulated excavation campaigns across 2 cultures, ~15–20 summary publications establishing the baseline.

### 4.7 Dating and Absolute Chronology

The gap between `WorldChronology.endYear` and `WorldChronology.presentYear` is the distance between the vanished civilisations and the player's working moment. An artefact's true age is `presentYear - provenance.year` — but this is hidden. The player has to earn absolute dates.

**Relative dating** is cheap and immediate. Stratigraphy gives it for free: this layer is below that one, therefore older. Associated finds within a layer are roughly contemporaneous. The player gets this from provenance context data without any special effort.

**Approximate dating frameworks** come from the professional corpus. NPC researchers have established chronological frameworks for well-studied sites — "this layer dates to approximately 1200–800 BCE" — based on their own dating work. These frameworks are presented as established fact in the reference literature. They may be wrong, either because the original dating was flawed or because the framework has been extrapolated beyond its evidence base.

```typescript
interface DatingFramework {
  siteId: string;
  layers: LayerDating[];
  establishedBy: string[];            // NPC publication IDs
  confidence: 'well-established' | 'provisional' | 'contested';
}

interface LayerDating {
  layerId: string;
  estimatedRange: [number, number];   // Year range (absolute)
  method: DatingMethod;
  errorMargin: number;                // Years of uncertainty
}

type DatingMethod =
  | 'stratigraphic-inference'         // Relative position + anchored layers
  | 'typological-comparison'          // Compared to dated artefacts elsewhere
  | 'radiocarbon'                     // C14 (requires organic material)
  | 'dendrochronology'                // Tree rings (requires preserved wood)
  | 'thermoluminescence';             // TL (requires fired ceramics)
```

**Independent dating** is something the player can commission, gated by career progression. An early-career researcher relies on the received framework. A senior researcher with institutional connections can send samples for radiocarbon or thermoluminescence analysis — which takes time, may consume part of the artefact, and produces results with error margins. Those results might confirm the existing framework or overturn it.

Commissioning dating that contradicts the established framework is a publishable finding — and feeds directly into the claim magnitude system. "The accepted chronology for Site X is wrong" is a high-impact, high-scrutiny challenge.

---

## 5. Stage 4: Bottom-Up Structural Grammar

### 5.1 Fundamental Principle

The grammar produces **physical structures**, not functional categories. It doesn't know what a "sword" or "pot" or "brooch" is. It knows about geometric primitives — elongated forms, cylindrical forms, hollow enclosures, flat surfaces — and their spatial relationships. Classification is entirely downstream.

This is non-negotiable. The grammar must never branch by intent.

### 5.2 Two-Tier Mobility Model

All generated objects fall into one of two categories based on a single unambiguous criterion: can a person or small group move this?

**Portable objects** (MVP scope) are generated by the component grammar described in this section. They can be decontextualised — removed from their findspot, traded, looted, inherited, deposited far from their origin. The analytical question is: "Where was this made? How did it get here?"

**Non-portable features** (deferred) — architecture, earthworks, installations — require a different grammar entirely. Their location IS their identity. The analytical question is: "Why was this built here? What space does it define?" Non-portable grammar is flagged as future work and is not specified in this document.

Within portable objects, a continuous portability property provides all the variation needed:

```typescript
type Portability =
  | 'pocketable'      // One hand, negligible effort (ring, coin, small blade)
  | 'one-hand'        // Carried in one hand (dagger, cup, brooch)
  | 'two-hand'        // Requires both hands (sword, large pot)
  | 'team-lift'       // Requires 2–4 people (bronze cauldron, stone slab)
  | 'major-effort';   // Significant labour but IS portable
                      // (sarcophagus lid, monumental vessel, large carved panel)
```

A `team-lift` artefact is analytically different from a `pocketable` one — it's harder to move, less likely to travel far, more significant when found out of expected context. But it uses the same grammar, the same inspection system, the same classification pipeline. Inspection depth derives naturally from physical dimensions:

```typescript
function deriveInspectionDepth(dimensions: ObjectDimensions): InspectionDepth {
  const maxExtent = Math.max(dimensions.primaryExtent, dimensions.secondaryExtent);
  if (maxExtent <= 30) return 'full';          // Hold in hands, examine closely
  if (maxExtent <= 150) return 'detailed';     // Examine but not manipulate freely
  return 'observational';                       // Observe in situ only
}
```

### 5.3 Component Grammar

The grammar operates on geometric primitives with physical properties.

```
<object>            ::= <component-group>+

<component-group>   ::= <primary-component> [<attachment> <component-group>]*

<primary-component> ::= <elongated> | <cylindrical> | <flat-broad>
                      | <hollow-enclosed> | <ring-form> | <disc-form>
                      | <bar-form> | <sheet-form>

<elongated>         ::= elongated(
                          length: short|medium|long,
                          crossSection: round|oval|rectangular|triangular|diamond,
                          taper: none|gradual|abrupt,
                          edge: none|single|double,
                          point: none|sharp|blunt)

<cylindrical>       ::= cylindrical(
                          length: short|medium|long,
                          diameter: narrow|medium|wide,
                          wall: thin|medium|thick,
                          opening: open|restricted|closed,
                          base: flat|rounded|pointed)

<flat-broad>        ::= flat-broad(
                          shape: round|oval|rectangular|irregular|crescent,
                          size: small|medium|large,
                          thickness: thin|medium|thick,
                          curvature: flat|shallow|deep,
                          perforation: none|single|multiple)

<hollow-enclosed>   ::= hollow-enclosed(
                          shape: spherical|ovoid|box|irregular,
                          size: small|medium|large,
                          wall: thin|medium|thick,
                          opening: wide|narrow|slit|none,
                          base: flat|rounded|pedestal)

<ring-form>         ::= ring-form(
                          diameter: small|medium|large,
                          crossSection: round|flat|twisted,
                          gap: closed|open|overlapping)

<disc-form>         ::= disc-form(
                          diameter: small|medium|large,
                          thickness: thin|medium|thick,
                          perforation: none|central|off-centre)

<bar-form>          ::= bar-form(
                          length: short|medium|long,
                          crossSection: round|square|hexagonal,
                          taper: none|single-end|both-ends)

<sheet-form>        ::= sheet-form(
                          size: small|medium|large,
                          shape: rectangular|triangular|irregular|fitted,
                          flexibility: rigid|semi-flexible|flexible)

<attachment>        ::= inline | perpendicular | socketed | riveted
                      | wrapped | lashed | hinged | threaded | friction-fit
```

Each terminal node produces a component with physical properties. The grammar says nothing about what these components are *for*.

### 5.4 Cultural Influence on Grammar Expansion

Culture doesn't dictate what the grammar produces — it biases the probabilities. Cultures don't have "allowed artefact types." They have tendencies that make certain forms more or less likely.

```typescript
function selectGrammarOption(
  rule: GrammarRule,
  culture: CulturalProfile,
  phase: PhaseCharacteristics,
  prng: () => number
): GrammarOption {
  const weighted = rule.options.map(option => {
    let weight = option.baseWeight;
    // Cultural profile shifts
    for (const [key, mod] of option.culturalModifiers) {
      weight += (culture.materialAffinities.get(key) ?? 0) * mod;
    }
    // Phase characteristic shifts
    weight *= phaseInfluence(option, phase);
    return { option, effectiveWeight: Math.max(0.01, weight) };
  });

  return weightedSelect(weighted, prng);
}
```

The `0.01` floor ensures nothing is completely impossible — even a deeply pacifist culture occasionally produces a blade. Because archaeology.

### 5.5 Pattern-Based Accumulation Checking

The grammar can produce multiple instances of the same component type within one object. This needs constraining — not because repetition is wrong, but because uncontrolled repetition produces nonsense. Real objects repeat components in deliberate arrangements.

Arrangement patterns constrain how repetition works:

```typescript
type ArrangementPattern =
  | { type: 'symmetric'; validCounts: number[] }      // [2, 4, 6]
  | { type: 'radial'; countRange: [number, number] }  // 3–12
  | { type: 'linear-array'; countRange: [number, number] } // 2–8
  | { type: 'stacked'; countRange: [number, number] }  // 2–5
  | { type: 'nested'; countRange: [number, number] }   // 2–4
  | { type: 'branching'; countRange: [number, number] }; // 2–6

interface AccumulationConstraints {
  maxDistinctGroups: number;           // From craftSpecialisation
  maxComponentsPerGroup: number;
  noTwoGroupsSameType: boolean;        // No two arrangement groups of same component
  patterns: ArrangementPattern[];
}
```

The culture's `craftSpecialisation` determines the complexity budget:
- Simple (0–0.3): 1–2 component groups, basic patterns only (symmetric, linear)
- Moderate (0.3–0.6): 2–3 groups, most patterns available
- Sophisticated (0.6–1.0): 3–4 groups, all patterns including nesting and branching

---

## 6. Stage 5: Structural Normalisation + Plausibility Checking

### 6.1 Normalisation

The grammar produces a tree of nodes. Normalisation flattens this into a standardised structure for downstream stages.

```typescript
interface NormalisedArtefact {
  id: string;
  components: NormalisedComponent[];
  attachments: Attachment[];
  dimensions: ObjectDimensions;
  portability: Portability;
  inspectionDepth: InspectionDepth;
}

interface NormalisedComponent {
  id: string;
  primitiveType: string;              // From grammar (elongated, cylindrical, etc.)
  properties: Map<string, string | number>;
  allowedMaterialTags: MaterialTag[]; // Derived from primitive + properties
  position: number;                    // Ordering along primary axis
  arrangementGroup?: {
    pattern: ArrangementPattern;
    index: number;                     // Position within arrangement
    totalInGroup: number;
  };
}

interface Attachment {
  fromComponentId: string;
  toComponentId: string;
  type: AttachmentType;
}

interface ObjectDimensions {
  primaryExtent: number;               // cm, longest axis
  secondaryExtent: number;             // cm, perpendicular
  mass: 'negligible' | 'light' | 'moderate' | 'heavy' | 'very-heavy';
}

type InspectionDepth = 'full' | 'detailed' | 'observational';
```

Normalisation also derives `allowedMaterialTags` per component from a compatibility table. An elongated form with an edge allows `metal` and `stone`; a hollow-enclosed form allows `clay`, `metal`, `wood`, `stone`. These constraints come from physical reality, not the grammar.

### 6.2 Plausibility Checking

Structural rules ensuring physical plausibility:

```typescript
type PlausibilityRule =
  | { type: 'requires'; component: string; dependsOn: string }
  | { type: 'excludes'; component: string; excludes: string }
  | { type: 'ordering'; component: string; before?: string; after?: string }
  | { type: 'material-physics'; predicate: (a: NormalisedArtefact) => boolean; reason: string }
  | { type: 'ergonomic'; predicate: (a: NormalisedArtefact) => boolean; reason: string };
```

Examples:
- An edged elongated form requires a grippable component (you can't use a blade without holding something)
- Long edged forms require at least medium grip length (ergonomics)
- Perpendicular attachment of a heavy component requires a rigid shaft (you can't lash a stone hammer head to a cord)
- Heavy components on top of thin-walled hollow forms are structurally implausible

If plausibility fails, the pipeline re-expands from Stage 4 (up to N attempts). Grammar expansion is fast; re-rolling is cheap.

---

## 7. Stage 6: Material Assignment

Materials are assigned per-component, weighted by three factors in order of priority:

1. **Geological availability** — what exists in the region
2. **Cultural affinity** — what this culture prefers
3. **Phase technology** — what this culture can work with at this point in time

```typescript
function assignMaterial(
  component: NormalisedComponent,
  culture: CulturalProfile,
  phase: PhaseCharacteristics,
  geology: GeologicalContext,
  tradeRelationships: MaterialFlow[],
  materials: MaterialDefinition[],
  prng: () => number
): MaterialDefinition {
  // 1. Filter by component compatibility
  const compatible = materials.filter(m =>
    component.allowedMaterialTags.some(tag => m.tags.includes(tag))
  );

  // 2. Filter by geological availability (local + trade)
  const available = compatible.filter(m =>
    isAvailable(m, geology, tradeRelationships)
  );

  // 3. Weight by cultural affinity and phase technology
  const weighted = available.map(m => ({
    material: m,
    weight: computeMaterialWeight(m, culture, phase)
  }));

  return weightedSelect(weighted, prng);
}
```

Trade materials appear at low weight — present but uncommon. An artefact with a foreign material tells a story about contact, but the player has to figure out what kind.

### 7.1 Material Provenance

Each material assignment carries provenance metadata: where the raw material likely originated.

```typescript
interface MaterialAssignment {
  componentId: string;
  materialId: string;
  provenance: MaterialProvenance;
}

interface MaterialProvenance {
  source: 'local' | 'regional' | 'trade' | 'unknown';
  likelyOriginRegion?: string;
  // If trade material, which relationship enabled it?
  tradePathId?: string;
}
```

This is hidden from the player. They see the material; they must infer the provenance. A copper artefact from a culture with no local copper deposits is a puzzle — trade? migration? misattributed culture?

---

## 8. Stage 7: Decorative Grammar

After the physical structure exists and materials are assigned, a decorative grammar runs over the artefact. Each structural surface becomes a potential canvas.

### 8.1 Principle

Decoration is a separate generative step with its own grammar, but it doesn't live in a silo. Decorative features feed into the same unified tag classification as structural features. An item can be `ritual` because of its structure, because of its decoration, or because of both.

### 8.2 The Decorative Grammar

```
<decoration>        ::= <surface-treatment>* <applied-element>* <textile-element>*

<surface-treatment> ::= polish | patina | roughening | scoring
                      | engraving(<motif>)                  [requires: hard material]
                      | relief(<motif>)                     [requires: thick material]
                      | painting(<motif>, <pigment>)        [requires: solid surface]
                      | glaze(<colour>)                     [requires: ceramic]

<applied-element>   ::= inlay(<material>, <motif>)         [requires: engravable surface]
                      | overlay(<material>, <coverage>)     [requires: rigid surface]
                      | studs(<material>, <pattern>)        [requires: rigid or leather]
                      | wire-wrapping(<material>, <pattern>)[requires: grippable form]
                      | gilding(<precious-metal>)           [requires: metal surface]

<textile-element>   ::= wrapping(<material>, <pattern>)    [requires: grippable form]
                      | tassels | beading(<material>)       [requires: attachment point]
```

Material prerequisites are enforced: the grammar checks what material the target surface has before offering decorative options. You don't engrave fired clay the same way you engrave bronze. You don't gild wood.

Engraving's `[requires: hard material]` prerequisite is resolved by workability, not raw structural hardness: a material qualifies if it can hold an incised line, which soft precious metals do via chasing and repoussé even though they aren't structurally hard. `MaterialDefinition.physicalProperties` keeps `hardness` and `workable` as independent axes for this reason — see `src/lib/data/materials.ts`.

### 8.3 Layered Decoration

Decorative elements can themselves receive further decoration. A bronze panel gets engraved; the engraved channels get silver inlay; the silver inlay gets its own chased pattern. Each layer is a distinct act of craft.

```typescript
interface DecorativeLayer {
  targetComponentId: string;
  technique: DecorativeTechnique;
  motifRef?: string;                   // From culture's motifVocabulary
  material?: string;                   // If the technique introduces new material
  sublayers: DecorativeLayer[];        // Decoration on decoration
}
```

Recursion depth is capped by the culture's `craftSpecialisation` and `aesthetics.decorativeEmphasis`:
- Low craft, low decorative emphasis: 0–1 decorative layers
- High craft, low decorative emphasis: 0–1 layers but technically refined
- Low craft, high decorative emphasis: 1 layer, simple techniques (painting, scoring)
- High craft, high decorative emphasis: up to 3 layers deep

### 8.4 Temporal Dimension

Decoration-on-decoration creates a temporal dimension within a single artefact. If the base engraving uses Culture A motifs and the inlay on top uses Culture B motifs, that sequence tells a story about contact, reworking, or appropriation. The player has to determine which came first and what it means.

This is how real archaeological interpretation works with reworked objects. The decorative grammar makes it emergent: the system doesn't flag "this is a reworked artefact." It just produces layers. The player notices — or doesn't.

### 8.5 Motif Assignment

Each decorative element that carries a motif draws from the source culture's `motifVocabulary`. Motifs are the primary cultural fingerprint on the decorative layer. Two cultures sharing motifs through `culturalExchange` create genuine interpretive ambiguity: is this artefact from Culture A, or is it from Culture B using borrowed motifs?

---

## 9. Stage 8: Unified Feature Extraction + Tag Classification

### 9.1 Unified Extraction

Feature extraction runs once across the complete artefact — structural components, materials, and decorative layers — producing a single feature set.

```typescript
interface ExtractedFeatures {
  // Structural features
  hasEdge: boolean;
  edgeCount: number;
  hasPoint: boolean;
  hasImpactSurface: boolean;
  hasContainer: boolean;
  containerOpenness: number;
  hasFasteningMechanism: boolean;
  primaryAxisLength: 'short' | 'medium' | 'long';
  isWearable: boolean;
  partCount: number;
  attachmentDiversity: number;

  // Decorative features
  decorativeLayerCount: number;
  motifPresent: boolean;
  motifCulturalOrigins: string[];      // Which cultures' vocabularies are represented
  techniqueComplexity: number;         // Layering depth * technique variety
  preciousMaterialsInDecoration: boolean;

  // Combined
  functionalComplexity: number;        // Edge + point + impact + container
  decorativeComplexity: number;        // Layer count + technique variety + motif density
  overallComplexity: number;           // Structural + decorative

  // Dimensional
  portability: Portability;
  inspectionDepth: InspectionDepth;
}
```

Every feature is traceable to its source (which component, which decorative layer) for the lens and contradiction systems, but the extraction itself is unified.

> **Implementation note (2026-07-22, roadmap 2GN.17, doc 12 §2.19):** the `ExtractedFeatures` shape above predates the shipped rule set and is narrower than it. `ExtractedFeatures` (`src/lib/types/artefact.ts`) carries thirteen further fields — `pointSharpness`, `bladeLengthBand`, `bladeProfile`, `perforation`, `wallThickness`, `ringGap`, `sheetFlexibility`, `massBand`, `sizeBand`, `curvature`, `openingType`, `baseType`, `appliedElementPresent` — each derived from a real primitive parameter or decorative-layer fact the grammar produces, needed because the fields above are too coarse to distinguish e.g. a paring knife from a dagger (both merely `hasEdge`). `massBand`/`sizeBand` are also the physical-fact fields classification rules must use in place of `portability`/`inspectionDepth`, which are mechanical (§5.2) and must never feed a classification rule — see doc 12 §2.19 for the full boundary rationale. Extraction itself (`extractFeatures`, roadmap 2GN.19) resolves multi-component collisions through per-family collapse policies (one dominant blade, one dominant container, loaded-value priorities) and derives the three presence flags with no single grammar signal (`hasImpactSurface`, `hasFasteningMechanism`, `isWearable`) from interviewed anatomy-plus-body-scale rules; the contracts live in `engine/generation/classification.ts`'s module JSDoc and doc 12 §2.20. `ExtractedFeatures` itself carries collapsed scalars with no per-field component references — the source-traceability promised above holds because the selection policies are deterministic and recorded, so a downstream consumer re-derives "which component" by re-running them (explicit provenance fields land only when a concrete consumer demands them).

### 9.2 Tag Classification

Tags are assigned by rule-based scoring from extracted features. Tags are not mutually exclusive — an object can be `['weapon', 'ritual', 'status']` simultaneously.

> **Implementation note (2026-07-22, roadmap 2GN.17, doc 12 §2.19):** the worked rule array below is illustrative, not the shipped rule set. The authoritative, signal-derived rules live in `src/lib/data/classification.ts` — 39 rules spanning edge/point/container/vessel/perforation/ring/sheet/mass/size/complexity/decoration/cross-layer/presence-flag families, each keyed on a signal the grammar actually rolls (see that module's JSDoc for the full derivation).

```typescript
// Function tags: what is this object FOR?
type FunctionTag =
  | 'weapon' | 'tool' | 'container' | 'fastener' | 'ornament'
  | 'ritual' | 'domestic' | 'agricultural' | 'maritime'
  | 'funerary' | 'votive' | 'trade-good' | 'currency';

// Context tags: how was this object USED?
type ContextTag =
  | 'personal' | 'communal' | 'elite' | 'utilitarian'
  | 'ceremonial' | 'everyday' | 'military' | 'artisanal';

type MaterialTag =
  | 'bone' | 'wood' | 'stone' | 'metal' | 'clay' | 'glass'
  | 'fiber' | 'leather' | 'precious-stone' | 'precious-metal';
```

Classification rules contribute weights from both structural and decorative features:

```typescript
const classificationRules: ClassificationRule[] = [
  // Structural contributions
  {
    condition: (f) => f.hasEdge && f.primaryAxisLength !== 'short',
    tags: new Map([['weapon', 0.6], ['tool', 0.3]])
  },
  {
    condition: (f) => f.hasContainer && f.containerOpenness > 0.5,
    tags: new Map([['container', 0.8], ['domestic', 0.5]])
  },

  // Decorative contributions
  {
    condition: (f) => f.decorativeComplexity > 2,
    tags: new Map([['ornament', 0.3], ['ritual', 0.3], ['elite', 0.4]])
  },
  {
    condition: (f) => f.preciousMaterialsInDecoration,
    tags: new Map([['elite', 0.5], ['ceremonial', 0.3], ['votive', 0.2]])
  },

  // Cross-layer contributions
  {
    condition: (f) => f.hasEdge && f.decorativeComplexity > 1,
    tags: new Map([['ritual', 0.5], ['ceremonial', 0.4], ['elite', 0.3]])
    // An engraved blade: structure says weapon, decoration says something more
  },
  // ...
];
```

The tag scores are deliberately overlapping. A bronze blade with engravings scores on `weapon`, `ritual`, `ceremonial`, and `elite` simultaneously. The system doesn't resolve this — the player does.

> **Implementation note (2026-07-23, roadmap 2GN.20, doc 12 §2.21):** `classifyArtefact` (`engine/generation/classification.ts`) folds matching rules by plain unbounded sum into a sparse map iterated in canonical vocabulary order — function tags then context tags, per the `FUNCTION_TAGS`/`CONTEXT_TAGS` runtime arrays in `types/tags.ts` that the union types above now derive from. Scores are evidence tallies, not confidences: compare by rank and margin, read absent tags as zero (`tags.get(tag) ?? 0`). The full fold contract and its rationale live in the function's JSDoc and doc 12 §2.21.

### 9.3 The Classified Artefact

```typescript
interface ClassifiedArtefact extends NormalisedArtefact {
  materials: MaterialAssignment[];
  decorativeLayers: DecorativeLayer[];
  features: ExtractedFeatures;
  groundTruthTags: Map<FunctionTag | ContextTag, number>;  // Visibility: occluded
  physicalLabel: string;              // Visibility: observable — neutral physical description, not interpretive
  provenance: Provenance;
  materialProvenance: MaterialProvenance[];
}
```

The `physicalLabel` is generated from observable properties alone: "short bronze elongated form with engraved disc-form attachment," not "ceremonial dagger." Interpretive naming is the player's job. The `groundTruthTags` are never exposed to the player or to any agent's interpretive model — they exist solely for the engine to evaluate claims against reality.

---

## 10. Rarity Model

Rarity is not a single number on an artefact. It operates at four levels, and the distinction between them is a core interpretive challenge.

### 10.1 Geological Scarcity (World Level)

Some materials are physically rare. This is prescribed at world generation and doesn't change.

### 10.2 Cultural Production Frequency (Culture Level)

The culture's `craftInvestment` profile biases how often certain artefact contexts are produced. A culture that invests heavily in funerary goods produces more grave offerings, making utilitarian objects from that culture relatively rarer in burial contexts. This is semi-prescribed — it's a weight, not a quota. Actual production frequency emerges from the grammar running against these weights.

### 10.3 Survival and Recovery (Site Level)

What survives depends on preservation conditions and deposition patterns. A culture that produces abundant wooden objects looks "rare" if the player excavates in wet-rot conditions. What gets recovered depends on which sites are excavated and how thoroughly.

### 10.4 Perceived Rarity (Player and Profession)

What the player *thinks* is rare depends on their personal sample. What the profession thinks is rare depends on the published corpus. Both can be wrong.

A player might think Culture A "rarely used gold" when actually Culture A used loads of gold but the player's been excavating a low-status settlement. The professional corpus might agree because previous researchers also focused on settlements. The rarity both perceive is real to their experience but false about the culture.

This gap between perceived and actual rarity is where publication impact lives. Discovering that something "rare" is actually common — or vice versa — is a publishable finding.

---

## 11. Excavation-Level Ambiguity Composition

### 11.1 Principle

Ambiguity is not a property of objects in isolation. It's a property of objects in context — both archaeological context (where found, what's nearby) and interpretive context (what the player already believes). The system manages ambiguity at the excavation level, not per-artefact.

### 11.2 Excavation Composition

Each excavation event is designed with intentional contextual juxtapositions:

- A settlement layer with a ritual deposit intrusion
- A burial with trade goods from two cultures
- A workshop with an anomalous prestige item
- A midden containing fragments from both utilitarian and ceremonial objects

The artefacts themselves may be individually clear. A pot is obviously a pot. But a pot in a shrine raises the question: votive offering, or someone's forgotten lunch? The interpretive challenge is contextual.

### 11.3 Soft Batch Monitoring

After generating an excavation's artefacts, the system measures the interpretive challenge distribution. If it's drastically skewed (say, 90%+ clearly classifiable with no contextual puzzles), the system notes this and steers the *next* excavation's context to compensate.

The current batch is never rejected. Those artefacts are valid products of the WorldState. The monitoring adjusts future pacing, not current output.

### 11.4 Interpretive Load Management

Across the playthrough, the running total of unresolved questions should stay within a tension band — enough open questions to maintain engagement, not so many the player drowns. This is a pacing concern that considers the player's entire knowledge state:

- How many unresolved contradictions do they have?
- How many active hypotheses lack supporting evidence?
- When did they last encounter something that challenged their model?

If the player has been coasting on confirmatory evidence for too long, the next excavation should introduce a puzzle. If they're drowning in unresolved contradictions, the next excavation might offer evidence that helps resolve some. This is interpretive load management, not difficulty scaling — the world doesn't get harder or easier, it gets more or less revealing.

---

## 12. Register System

### 12.1 Observation Registers

**MVP note:** MVP implements the three-value `DescriptionRegister` from doc 04 §3.4 ('observational' | 'interpretive' | 'technical'). The five-value `ObservationRegister` and the `RegisterAccess` acquisition model described in this section are deferred post-MVP (see doc 13).

When a player inspects an artefact, the descriptions they receive are filtered through the registers available to them. Registers determine the *framing* of observations, not their truth.

```typescript
type ObservationRegister =
  | 'neutral'      // Default. Descriptive, non-committal.
  | 'functional'   // Emphasises use-wear, ergonomics, practical features.
  | 'aesthetic'     // Emphasises form, proportion, decorative qualities.
  | 'ritual'        // Emphasises symbolic elements, placement significance.
  | 'technical';    // Emphasises manufacturing technique, material properties.
```

The same wear pattern described across registers:
- **Neutral:** "Marks are visible along the edge."
- **Functional:** "Repeated use-wear consistent with cutting or scraping."
- **Aesthetic:** "The edge shows a patina of handling that complements the surface finish."
- **Ritual:** "The edge bears marks that may indicate deliberate dulling, possibly to symbolically decommission the blade."
- **Technical:** "Edge deformation consistent with contact against material harder than the blade itself — likely stone or hardened bone."

All five describe the same physical evidence. None are wrong. They foreground different interpretive possibilities.

### 12.2 Register Acquisition

The `neutral` register is always available. Others unlock through exposure and practice:

```typescript
interface RegisterAccess {
  register: ObservationRegister;
  unlocked: boolean;
  proficiency: number;                 // 0–1, affects richness of register output
  requirements: {
    observationCount: number;          // Total observations made
    inferenceCount: number;            // Total inferences drawn
    contradictionsResolved: number;    // Contradictions the player has resolved
    domainExposure: Map<string, number>; // Domain-specific experience
  };
}
```

Proficiency is domain-specific. A player who's examined fifty blades has high `technical` proficiency for edged objects but might be a novice at ceramic analysis. The register system tracks this per-domain, not globally.

### 12.3 Publication Registers

When the player publishes, they write in a register that affects how their findings enter the professional corpus:

```typescript
type PublicationRegister =
  | 'academic'      // Formal, evidenced, cautious. High credibility, low accessibility.
  | 'curatorial'    // Descriptive, contextualised. Moderate credibility, moderate accessibility.
  | 'popular'       // Accessible, narrative. Low credibility, high public impact.
  | 'field-notes';  // Raw, provisional. Minimal credibility, establishes priority.
```

Publication register affects both reputation gain and downstream interpretation. A `popular` publication might create `publicMisconceptions` — simplified versions of the player's findings that circulate in the professional community and may later cause complications.

---

## 13. Stage 9: Description Generation (Register-Filtered, Lens-Filtered)

This is where the artefact meets the player. The description system generates text from the artefact's properties, filtered through both the register system (what framing is available) and the Interpretive Lens (what the player's existing beliefs foreground).

### 13.1 Template System

Descriptions are generated from parameterised templates. This is where a Tracery-like grammar operates — at the prose level, not the structural level.

```typescript
interface DescriptionTemplate {
  property: string;
  variants: DescriptionVariant[];
}

interface DescriptionVariant {
  template: string;                    // Tracery-style template with slots
  emphasis: FunctionTag[];
  register: ObservationRegister;
}
```

The lens selects which variant to use based on alignment with the player's hypotheses (see Document 04, Section 3.4: Descriptive Framing). The register system gates which variants are available — a player without the `technical` register never sees the technical framing, even if their lens would select it.

### 13.2 Observation Assembly

The full artefact description is assembled as an ordered list of observations, sorted by the lens's salience weighting:

```typescript
interface ArtefactPresentation {
  artefactId: string;
  label: string;                       // Neutral physical description
  provenance: ProvenancePresentation;
  primaryObservations: PresentedObservation[];   // High-salience
  secondaryObservations: PresentedObservation[];  // Requires investigation
  suggestedTags: TagSuggestion[];
  crossReferences: CrossReference[];
}

interface PresentedObservation {
  propertyId: string;
  description: string;                 // Register + lens selected variant
  salience: number;
  register: ObservationRegister;
  rawData: Map<string, string | number>; // Always accessible on drill-down
}

interface TagSuggestion {
  tag: FunctionTag | ContextTag;
  groundTruthScore: number;           // Visibility: occluded — engine use only
  lensBoost: number;                   // From agent's interpretive model
  presentedScore: number;              // What the agent sees
  sourceHypotheses: string[];
}
```

---

## 14. Pipeline Guarantees

Every artefact that reaches the player satisfies these invariants:

1. **Structural coherence.** All plausibility rules pass. No physically impossible configurations.
2. **Material compatibility.** Every component has a material its primitive type allows.
3. **Geological consistency.** Materials reflect what's available in the region (local + trade).
4. **Cultural consistency.** Material and form selections reflect the source culture's profile and phase.
5. **Decorative coherence.** Decorative techniques are compatible with their substrate materials.
6. **Complete provenance.** Every artefact has period, culture, site, and context metadata.
7. **Deterministic.** Same seed + same position in sequence = same artefact.
8. **Lens-independent ground truth.** The `groundTruthTags`, `rawData`, material provenance, and decorative layers are never modified by any agent's interpretive lens. The lens only affects presentation. Properties at each visibility level (observable, inferable, occluded, engine-internal) are immutable once generated.

Note what is *not* guaranteed: per-artefact ambiguity. Some artefacts are obvious. That's fine. Ambiguity is managed at the excavation and playthrough level (see Section 11).

---

## 15. What the Existing Codebase Needs

| Current | Required | Migration |
|---|---|---|
| `Item { type: string }` | `NormalisedArtefact` with components, attachments, dimensions | Full replacement |
| `GeneratedItem { material: string }` | `ClassifiedArtefact` with per-component materials, decorative layers, tags, provenance | Full replacement |
| `materials: string[][]` | `MaterialDefinition` with tags, geological availability, cultural affinities | Full replacement |
| `items: { type: 'axe' }[]` | Component grammar rules + classification rules | Full replacement |
| `itemGenerator.ts` | 9-stage pipeline | Full replacement |
| `gameState.svelte.ts` | + WorldState + InterpretiveModel + Lens State + Professional Corpus | Major extension |
| No description system | Template-based description generator with register + lens integration | New system |
| No decorative system | Decorative grammar with layering and motif assignment | New system |
| No world generation | Chronology, culture, geology, and corpus generation | New system |

The current item generation code is a prototype that proved the architecture works. The domain model is being replaced wholesale. The component architecture, state management patterns, and SvelteKit scaffolding all survive.

**Update:** the pre-reset source files listed above were removed from `src/` in the repository reset and survive only in `backlog/` as reference; new code is written fresh.

---

*Cross-references: doc 04 (Interpretive Lens) for lens mechanics applied at Stage 9; doc 07 (Career & Time Economy) for term-based pacing; doc 10 (Document Tradition System) for publication node structures used in initial corpus generation and NPC publication output; doc 11 (Design Reconceptualisation) Sections 2.5–2.7 for visibility model and agent-generic interpretive architecture.*

*Next document: Knowledge & Contradiction Model — the interpretive model, document tradition system (doc 10), inference chains, and contradiction mechanics.*
