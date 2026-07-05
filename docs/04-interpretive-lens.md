# TWCB: The Interpretive Lens
*Designing the core feedback mechanism*

---

## 1. The Problem

TWCB's entire premise rests on one mechanic: the player's existing beliefs alter how they perceive new artefacts, creating either a virtuous cycle of increasingly accurate interpretation or a vicious cycle of compounding error.

Every document in this project acknowledges this mechanic exists. None of them specify how it works. This document fixes that.

---

## 2. Design Principles for the Lens

Before getting into mechanics, some constraints:

**The system never lies.** Every piece of information it presents is factually true about the artefact. The manipulation is in selection, ordering, emphasis, and framing — not fabrication.

**The player can always dig deeper.** The default presentation is filtered, but the raw properties are accessible through deliberate investigation. The lens creates shortcuts and blind spots, not walls.

**The effect should be subtle.** If the player can easily tell they're being steered, the mechanic fails. The goal is that players only realise they've been confirmation-biasing themselves *after* a contradiction forces them to look back.

**The effect must be mechanically grounded.** No vague "the system nudges things." Every influence must be traceable to a specific hypothesis, inferred trait, or published finding in the player's interpretive model.

---

## 3. The Five Channels of Influence

In visibility terms (doc 11, Section 2.5), the lens operates on the gap between what's *observable* (properties any agent could perceive through inspection) and what the player actually *notices and emphasises*. Observable properties are never hidden — the lens can't make iron invisible. But it can make iron unremarkable. The lens also interacts with *inferable* properties (those derivable from observation + reasoning) by priming certain inference paths over others through cross-referencing and classification suggestions.

Occluded properties (hidden ground truth) are invisible to both the lens and the player. The lens doesn't know what's true — it only knows what the player believes, and it uses those beliefs to filter what's already visible.

The Interpretive Lens operates through five distinct channels. Each one is independently tunable and auditable.

### 3.1 Observation Salience

**What it does:** Controls which properties of an artefact are surfaced prominently during initial inspection, and which require deliberate investigation to notice.

**Mechanism:** When the player inspects a new artefact, the system generates an ordered list of observable properties (material, shape, adornment, wear patterns, context, motifs, etc.). The ordering is influenced by the player's existing beliefs.

**Example:**
- An artefact has these properties: [obsidian blade, spiral motif, leather wrapping, combat wear marks, ceremonial pigment traces]
- **Neutral ordering** (no prior beliefs): blade material, shape, wear, motif, pigment
- **If player believes "Culture A uses obsidian decoratively":** pigment traces, spiral motif, obsidian material, leather wrapping, wear marks
- **If player believes "Culture A produces weapons":** obsidian blade, combat wear, shape, leather wrapping, motif

The wear marks are always there. The pigment is always there. But what the player *notices first* shapes their initial impression, and most players will form a hypothesis before examining every property.

**Implementation:**

```typescript
interface ObservationSalience {
  propertyId: string;
  baseWeight: number;        // Default prominence (1.0 = neutral)
  lensAdjustments: Array<{
    sourceHypothesisId: string;
    weightDelta: number;     // +/- adjustment from the hypothesis
    reason: string;          // Traceable: "hypothesis h3 infers decorative obsidian"
  }>;
  finalWeight: number;       // Computed: base + sum(adjustments), clamped [0.1, 3.0]
}
```

The final observation list is sorted by `finalWeight` descending. Properties below a threshold (e.g., 0.5) are placed in an "on closer inspection" section that requires an extra click/action.

### 3.2 Classification Suggestions

**What it does:** When the player is asked to classify an artefact (weapon? tool? ceremonial object? decorative piece?), the system pre-populates suggestions weighted by existing beliefs.

**Mechanism:** The system generates a list of plausible classifications for the artefact based on its observable properties. It then weights these by relevance to the player's existing hypotheses about the likely source culture.

**Example:**
- An obsidian blade with engravings could plausibly be classified as: combat weapon, hunting tool, ceremonial weapon, ritual implement, status symbol
- **If player has published "Culture A's obsidian work is decorative":** ritual implement (0.8), status symbol (0.7), ceremonial weapon (0.6), combat weapon (0.3), hunting tool (0.3)
- **No prior beliefs:** combat weapon (0.7), hunting tool (0.6), ceremonial weapon (0.5), ritual implement (0.4), status symbol (0.3)

The player can always choose any classification, including ones not in the suggestion list. But the ordering and prominence of suggestions creates a gravity toward consistency with prior beliefs.

**Implementation:**

```typescript
interface ClassificationSuggestion {
  classificationId: string;
  label: string;
  basePlausibility: number;     // From artefact properties alone
  lensBoost: number;            // From interpretive model alignment
  finalScore: number;           // basePlausibility * (1 + lensBoost)
  sourceHypotheses: string[];   // Which beliefs are boosting this
}
```

### 3.3 Cross-Reference Priming

**What it does:** When the player inspects an artefact, the system suggests related artefacts and hypotheses from their existing notes. These suggestions are weighted by the Interpretive Lens.

**Mechanism:** The system searches the player's interpretive model for entries that share properties with the current artefact. But the matching is biased: properties that align with existing hypotheses generate stronger cross-reference signals.

**Example:**
- New artefact: bronze dagger with wave motif, found in river sediment
- Player has studied 12 previous artefacts
- **Neutral cross-references:** all artefacts with bronze, all with wave motifs, all from river contexts
- **If player believes "Culture A is a river-dwelling civilisation":** river context artefacts are heavily promoted; the system suggests "compare with artefacts A3, A7, A11 (all river finds)" — even though A7 is actually from Culture B

The system isn't lying — A7 was found in a river. But by clustering it with Culture A artefacts based on context rather than culture, it reinforces the assumption that river finds = Culture A.

**Implementation:**

```typescript
interface CrossReference {
  targetArtefactId: string;
  matchingProperties: string[];       // What they share
  baseRelevance: number;              // Property overlap score
  lensRelevance: number;              // Hypothesis-aligned boost
  finalRelevance: number;             // base * (1 + lens)
  potentiallyMisleading: boolean;     // Flag for contradiction detection
}
```

### 3.4 Descriptive Framing

**What it does:** The text description of an artefact's properties uses vocabulary and emphasis shaped by the player's beliefs.

**Mechanism:** Description generation uses a **register system** with three distinct modes, each producing equally truthful but differently framed text for the same property:

- **Observational register:** Material-science language. What can be measured, weighed, compared. Foregrounds physical properties. ("The edge shows 3mm notching at irregular intervals and areas of deliberate abrasion.")
- **Interpretive register:** Functional and contextual language. What an object might have been for. Foregrounds use and meaning. ("The blade bears combat notching along its edge, with some areas dulled — possibly from resharpening.")
- **Technical register:** Craft-process language. How something was made. Foregrounds manufacturing choices and skill. ("The edge was ground to a 15° bevel, later reworked with coarser abrasive along the lower third.")

All three registers describe the same physical reality. The Interpretive Lens controls which register is foregrounded based on the player's existing hypotheses, with the other registers accessible through deliberate investigation.

**Example:**
- Property: a blade edge that shows both combat damage and deliberate dulling
- **Observational (default when no hypotheses exist):** "The blade edge shows notching consistent with impact, and areas of deliberate blunting"
- **Interpretive (foregrounded if player believes this culture made weapons):** "The blade bears combat notching along its edge, with some areas dulled — possibly from resharpening"
- **Interpretive (foregrounded if player believes this culture made ceremonial objects):** "The blade has been deliberately dulled along sections of its edge, with some incidental chipping"
- **Technical (foregrounded if player has strong craft-analysis hypotheses):** "The edge was initially ground to a fine bevel, subsequently reworked with a coarser abrasive and showing post-manufacture impact damage"

The lens doesn't just pick between registers — within the interpretive register, it selects framing variants that align with the player's framework. An artefact can be simultaneously described through all three registers; the lens controls emphasis and ordering.

**Implementation:**

```typescript
type DescriptionRegister = 'observational' | 'interpretive' | 'technical';

interface DescriptionFrame {
  propertyId: string;
  registers: Record<DescriptionRegister, Array<{
    text: string;
    emphasis: string;           // What this variant foregrounds
    alignsWithTags: string[];   // Which hypothesis tags this supports
  }>>;
  selectedRegister: DescriptionRegister;  // Chosen based on lens alignment
  selectedVariant: number;                // Within the register
}
```

This is where the CFG-based generation system earns its keep — the same underlying component data feeds all three registers, parameterised by the lens state.

### 3.5 Omission Blindness

**What it does:** Properties that *contradict* existing beliefs are not hidden, but they're harder to notice — placed lower in observation lists, described more neutrally, and not flagged as noteworthy.

**Mechanism:** This is the inverse of Observation Salience. Where salience boosts confirming evidence, Omission Blindness suppresses (without removing) contradicting evidence.

**Example:**
- Player believes Culture A doesn't use iron
- New artefact from Culture A has iron rivets holding the handle
- **Without Omission Blindness:** "Iron rivets secure the handle — notable given the culture's typical material preferences"
- **With Omission Blindness:** "Rivets secure the handle" (iron not emphasised; placed in detailed properties, not summary)

The information is there. An attentive player will see "iron" in the detailed view. But it won't be flagged as significant, because the player's existing framework doesn't consider iron relevant to this culture.

**Implementation:**

```typescript
interface OmissionCheck {
  propertyId: string;
  contradicts: string[];          // Hypothesis IDs this property conflicts with
  suppressionLevel: number;       // 0 = no suppression, 1 = maximum de-emphasis
  baseVisibility: number;         // From property importance
  adjustedVisibility: number;     // baseVisibility * (1 - suppressionLevel * 0.6)
}
```

The `suppressionLevel` is capped so that truly significant contradictions still bubble up — a full iron sword from a "no metalwork" culture can't be completely ignored. But subtle contradictions (iron rivets on an otherwise stone-age artefact) can slip past.

---

## 4. Lens Strength and Calibration

The lens shouldn't be binary (on/off) — it should scale with the player's commitment to their beliefs.

**Factors that increase lens strength:**
- Dissemination state progression (circulated < submitted < published < collected). A published finding at a high-prestige venue is the strongest lock-in. See doc 10 for dissemination state definitions.
- High confidence rating on a hypothesis
- Multiple pieces of supporting evidence
- Teaching the theory to students (career activity — ongoing background reinforcement)
- Other scholars citing the theory

**Factors that decrease lens strength:**
- Low confidence rating
- Few supporting artefacts
- Active contradictions (per-contradiction penalty)
- Hypothesis marked as "tentative"
- Sabbatical term (temporary lens reduction — doc 07, Section 4.1)

**Implementation:**

```typescript
interface LensStrength {
  hypothesisId: string;
  factors: {
    dissemination: number;       // Graduated: 0 (private), 0.1 (circulated), 0.15 (presented), 0.2 (submitted), 0.3 (published), 0.35 (collected)
    venuePrestige: number;       // 0–1, multiplied with dissemination. High-prestige publication = stronger lock-in.
    confidence: number;          // 0–1 direct mapping from hypothesis confidence
    evidenceCount: number;       // log2(count) * 0.1, capped at 0.3
    taught: boolean;             // +0.2 if true (career activity: student supervision)
    cited: number;               // 0.05 per citation, capped at 0.2
    contradictions: number;      // -0.1 per active contradiction
    onSabbatical: boolean;       // -0.15 if true (temporary clarity)
  };
  totalStrength: number;         // Clamped [0, 1]
  lastRecalculatedTerm: number;  // Term index when strength was last computed
}
```

A hypothesis that's been published at a prestigious venue, taught, cited, and supported by evidence will warp perception significantly. A tentative, low-confidence, unsupported hypothesis will have almost no lens effect.

### 4.1 Lens Decay

Lens strength is not static between terms. It evolves at term boundaries:

- **Reinforcement:** Every term where the player teaches, cites, or builds on a hypothesis, the lens strength holds or increases. Active engagement sustains conviction.
- **Natural decay:** Hypotheses the player hasn't engaged with for several terms lose a small amount of lens strength per term (e.g., -0.02/term for unpublished, -0.01/term for published). Published findings decay more slowly — they're part of the record.
- **Contradiction pressure:** Each unresolved contradiction against a hypothesis applies -0.05/term cumulative pressure. Multiple contradictions compound.
- **Sabbatical effect:** During a sabbatical term, all lens strengths temporarily reduce by a flat modifier (-0.15). This represents the "fresh eyes" effect of stepping back from active research. After the sabbatical, strengths return to their decayed baseline, not their pre-sabbatical levels — the clarity is temporary, but the recalibration persists.

Decay is computed at term boundaries alongside energy replenishment, career advancement checks, and contradiction accumulation (doc 07, Section 4.0).

---

## 5. Worked Example: Two Players, Same Artefact

### The Artefact
Bronze short sword with wave-pattern engravings, found at a coastal site. Handle wrapped in ray skin. Blade shows use-wear. Small turquoise inlay near the hilt.

### Player A: "Culture X was a maritime trading civilisation"
- **Observation order:** Ray skin wrapping (rare imported material!), wave engravings, coastal context, bronze (trade good), turquoise inlay, use-wear
- **Suggested classifications:** Trade goods, diplomatic gift, high-status possession, weapon
- **Cross-references:** Links to other coastal finds and imported materials
- **Description:** "A finely crafted bronze blade wrapped in ray skin — a material suggesting maritime connections. Wave-pattern engravings adorn the blade. A turquoise inlay near the hilt indicates status or ceremonial significance."
- **Player A's likely interpretation:** This is a prestige item connected to maritime trade networks.

### Player B: "Culture X was a warrior society"
- **Observation order:** Use-wear (combat evidence!), bronze blade, handle wrapping (functional grip), blade shape, engravings, turquoise
- **Suggested classifications:** Combat weapon, military equipment, warrior burial good, hunting tool
- **Cross-references:** Links to other weapons and items showing use-wear
- **Description:** "A combat-worn bronze short sword with a practical ray-skin grip. The blade shows clear signs of use in cutting or striking. Wave-pattern engravings run along the flat of the blade."
- **Player B's likely interpretation:** This is a functional weapon from a martial culture.

### What's Actually True
Culture X was a fishing community. The "sword" is a large fish-processing knife. The wave engravings reference the sea. The ray skin is locally sourced (they fish rays). The turquoise is from a nearby deposit. The use-wear is from fish preparation. Neither Player A nor Player B is right, but both have built internally consistent — and wrong — interpretive frameworks that the lens will continue to reinforce.

---

## 6. Anti-Gaming Considerations

**Can the player deliberately game the lens?**

Technically, yes — a player who understands the system could form a hypothesis they don't believe to see how the lens shifts. This is actually fine. It mirrors real archaeological practice: scholars sometimes adopt a working hypothesis specifically to test whether the evidence supports it. The game should reward this kind of methodological thinking.

**Does the lens make the game unfair?**

No, for three reasons:
1. Raw data is always accessible through deliberate inspection
2. Contradictions still accumulate regardless of the lens
3. The lens operates on *ambiguous* properties — unambiguous evidence (e.g., a clearly impossible material combination) bypasses the lens entirely

---

## 7. Technical Dependencies

This system requires:
- **From Generation Architecture (Doc 05):** Artefacts built from bottom-up component grammar with geometric primitives — multi-component structures where each component has measurable properties. Decorative layers applied post-material-assignment add motifs, surface treatments, and applied elements that feed into unified tag classification alongside structural features. The lens operates on component-level and decoration-level properties, not monolithic artefact descriptions. The visibility model (doc 11, Section 2.5) determines which properties are observable vs occluded — the lens only manipulates the presentation of observable properties.
- **From Generation Architecture (Doc 05):** Excavation-level ambiguity composition and blended rarity model that produce genuinely ambiguous artefacts in context. If everything is obvious, the lens has nothing to work with. Ambiguity is a property of objects in context (archaeological + interpretive), not objects in isolation — the lens exploits this by framing the same object differently depending on what the player believes about its context.
- **From Knowledge Model (Doc 06):** The agent-generic `InterpretiveModel` with hypothesis tracking, confidence levels, and evidence chains. The four-layer knowledge system (observation → inference → hypothesis → publication) maps directly to lens strength calculation. The lens accepts an `InterpretiveModel` and computes channel weights from it.
- **From Generation Architecture (Doc 05):** The register-based description system (observational, interpretive, technical) that produces variant framings from the same underlying component data. Channel 3.4 (Descriptive Framing) operates primarily by selecting between registers and within-register variants, weighted by the lens state.
- **From Generation Architecture (Doc 05):** The initial corpus of NPC publications establishes professional consensus before the player starts. This provides baseline cross-references (Channel 3.3) and classification norms (Channel 3.2). The lens can push the player toward or away from established consensus depending on whether their hypotheses align with received wisdom. The dating framework provides approximate chronological anchors — the lens can make the player trust or question these depending on their beliefs about temporal relationships.
- **From Document Tradition (Doc 10):** Dissemination state and venue prestige are primary inputs to lens strength (Section 4). A circulated working paper contributes less lens strength than a published journal article at a high-prestige venue. The graduated dissemination model replaces the old binary "published: boolean" flag.
- **From Career & Social Systems (Doc 07):** Term-based time economy provides the tick rate for lens decay and recalibration (Section 4.1). Teaching and supervision career activities contribute to lens reinforcement. Sabbatical terms temporarily reduce all lens strengths.

---

*Cross-references: Generation Architecture (doc 05), Knowledge & Contradiction Model (doc 06), Career & Social Systems (doc 07), Document Tradition System (doc 10), Deferred Design Questions (doc 11, esp. 2.5 Visibility Model, 2.8 Time/Action Economy)*
