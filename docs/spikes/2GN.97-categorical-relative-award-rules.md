# 2GN.97 — The Categorical Relative-Award Rules

| Prop      | Value                                                                     |
| --------- | ------------------------------------------------------------------------- |
| Status    | Ruled                                                                     |
| Ruled     | 2026-08-13                                                                |
| Ruling in | This document; propagated to doc 11 §2.12 and doc 12 §2.44                 |
| Outcome   | Brief's framing rejected; five groups, three follow-ups filed              |

## The question

2GN.80 ruled status tags culture-relative. 2GN.82 migrated nine measured thresholds to
`ClassificationContext.exceeds`. The remainder could not migrate: `BaselineFeature` is a deliberately
closed union of nine numeric features, so a rule reading `wallThickness`, `baseType`, `perforation`,
`ringGap`, `sheetFlexibility`, `openingType`, `massBand`, `sizeBand`, `isWearable` or
`hasFasteningMechanism` has nothing to call `exceeds` against. The type rules it out by design: a
percentile over `openingType` is meaningless.

The brief asked what "relative" means for a categorical band, offering three candidates: a prevalence
baseline, a `stratification` gate, or weight-scaling an unchanged absolute condition.

**The ruling rejects the question.** These rules are not one problem, and most of them need no
baseline at all.

## Finding 0: the count is 24, not 25

The roadmap figure predates 2GN.87's deletion of R4. Measured against the current
`CLASSIFICATION_RULES`: 34 rules award at least one `RelativeTag`, 10 carry a migrated
`exceeds` call, leaving **24** unmigrated.

## Finding 1: five groups, not one

Classified by what the condition actually reads and whether the award follows from it.

| Group | Rules | Character |
| ----- | ----- | --------- |
| **A1** morphology determines the tag | ~10 | fine unchanged |
| **A2** morphology is ambiguous | 3 | not a baseline problem |
| **B-walls** standing claim off a crushed quantity | 2 | unrelativisable |
| **B-bases** standing claim off a genuine categorical | 2 | under-conditioned |
| **C** mass/size | 2 | cheap route available |
| **D** `preciousMaterialsInDecoration` | 1 | stubbed, cannot fire |

Only group B was ever the question the brief described, and both halves of it turned out to be
blocked on something other than a baseline.

## Finding 2: A2 is not fixable by weighting, because accumulation is additive

`perforation-central-rotation` awards `tool, artisanal` on `perforation === 'central'`. A central hole
means the object span — or it means the object hung. The morphology genuinely supports both.

Three options were considered:

1. **Award both readings at lower weight.** Rejected: `classifyArtefact` accumulates additively with
   no suppression, competition or normalisation, so `artisanal 0.2, personal 0.2` from one ambiguous
   rule is indistinguishable downstream from the same scores contributed by two confident unrelated
   rules. Halving also drops both readings below later thresholds, so an ambiguous artefact reads as
   weakly-everything rather than strongly-uncertain.
2. **Keep picking one.** Current behaviour, and the same defect class as R4 (2GN.87): the rule
   asserts a determination the data did not make. Strains doc 02 Simulation Honesty.
3. **Treat the ambiguity as content.** The player is an unreliable narrator (doc 02 pillar 5) and the
   lens decides which reading surfaces, so a genuinely two-reading artefact is raw material the core
   mechanic wants. Options 1 and 2 both resolve the ambiguity in generation, before the lens sees it.

Option 3 needs a shape the tag Map cannot express — competing alternatives rather than co-occurrences
— so it was scoped out of this spike. Finding 5 then absorbed it: the ambiguity is not a missing
confidence channel, it is a **missing relational term**.

## Finding 3: the wall rules are unrelativisable, and prevalence is why

`vessel-thin-walled-fine-ware` (`elite, ceremonial`) and `vessel-thick-walled-utilitarian`
(`utilitarian, domestic`) read `wallThickness`, which `PRIMITIVE_PARAMETERS` rolls as
`wall: ['thin','medium','thick']`. **There is no continuous value beneath it anywhere in the
pipeline.**

A prevalence baseline counts how often each band occurs. That cannot express the distinction the
rules need, because the band is assigned from a global table before anything culture-relative is
consulted: a culture whose walls are all 3mm and one whose walls are all 30mm both read "100% thin"
or "100% thick" depending only on where the global cut falls. **One culture's thick may be
physically thinner than another's thin, and no baseline can recover the difference.**

Three consequences, all raised while ruling:

- Thickness is plausibly a derivative of the **crafting process**, and is currently uninfluenced by
  `craftSpecialisation`, the component's material or the vessel's role.
- Three rungs is the entire gradation available, too coarse for the distinctions the rules draw.
- Cross-culture comparison is impossible **by construction**.

Fourth instance of the band-computed-from-an-absolute-table family, after 2GN.86 (mass), 2GN.87
(blade) and 2GN.108 (axis). Filed as 2GN.120.

## Finding 4: `baseType` is a genuine categorical — and the rules are still wrong

Stress-tested against the wall case, `baseType` passes where `wallThickness` fails:

- **No crushed quantity.** A pedestal is not "very flat". These are kinds, not bands.
- **Prevalence is meaningful.** "12% of this culture's vessels have pedestals" is a real number, and
  two cultures at 12% and 80% differ in a way that means the same thing in both.

So the mechanism the walls could not use is available here. It is still the wrong answer.

**A base is a relation between the base and what it supports.** A pedestal under a statue and a
pedestal under a hat-stand carry opposite readings from an identical `baseType`, and no amount of
culture-relativity separates them, because the difference is not cultural. `base-pedestal-display`
reads exactly one feature and awards `ceremonial, elite` from it. The rule discards the term carrying
the meaning.

⚠️ A vocabulary gap was noticed in the same pass and filed separately as **2GN.118**: `cylindrical`
rolls `base: ['flat','rounded','pointed']` while `hollow-enclosed` rolls
`['flat','rounded','pedestal']`, so a pedestalled bowl and a pointed cylinder are both unreachable by
primitive type rather than by design. `opening` and `perforation` have the same shape of split.

## Finding 5: the finding that outgrew the brief

Measured across all 43 shipped rules:

- **10 of the 24 condition on exactly one property** — `f.x === 'value'` and nothing else:
  `base-pedestal-display`, `base-pointed-amphora`, the three `perforation-*` rules, both `ring-*`
  rules, both `sheet-*` rules, `size-small-personal`.
- **7 more read two properties of the same component.** The container rules pair `hasContainer` — a
  presence flag, not a relation — with a feature extracted off the dominant container, so both terms
  describe one component.
- **Exactly one rule is genuinely relational**: `motif-multiple-origins`, comparing cultural origins
  across the artefact's decoration.

`NormalisedArtefact.attachments` and `NormalisedComponent.position` are populated and read by no rule
at all — the same unused-graph finding as 2GN.108, reached from the classification side.

⚠️ **The defect is orthogonal to doc 11 §2.9's absolute/relative cut.**
`perforation-central-rotation` awards `tool`, an `AbsoluteTag`, and is under-conditioned identically.
So this is a property of how conditions are written, not of which vocabulary they award from — which
is why the follow-up is scoped to **all 43 rules** rather than these 24.

## Ruling

**1. The brief's framing is rejected.** These are not 24 rules awaiting a categorical baseline. They
are five groups with different defects, and a baseline is the right answer for none of them.

**2. Group A1 stands unchanged**, with the rationale recorded: a tag drawn from the `RelativeTag`
vocabulary does not automatically need a baseline when its condition reads a morphological fact.

**3. Group A2's ambiguity is a missing relational term, not a missing confidence channel.** Absorbed
into 2GN.119 rather than filed separately: what disambiguates a central perforation is the disc's
size, mass and what it attaches to.

**4. The wall rules stay absolute, blocked with reason,** until `wallThickness` is a modelled
quantity (2GN.120). Neither migrated nor deleted.

**5. The base rules are under-conditioned, not unrelativised.** No baseline is authored for them;
they wait on 2GN.119.

**6. Group C takes the cheap route** — `massBand` derives from a scored distribution that already
exists.

**7. `precious-materials-in-decoration` is recorded as dormant**, not unmigrated. It is hardcoded
`false` (2GN.78 fallout) and cannot fire. Once derived it is culture-relative against regional
scarcity per 2GN.77, reading the keyspace 2GN.110 rules.

## Rejected alternatives

**Prevalence baseline for group B.** Meaningless for walls (Finding 3); available but insufficient
for bases (Finding 4). Would also have needed a new sampler kind — `BaselineFeature` holds numeric
percentiles at ladder rungs, and a categorical needs frequency-per-value.

**`stratification` gate.** Uses machinery doc 11 §2.9 already ruled live, but only gates the
elite-bearing half of each pair and says nothing about `utilitarian`. Blocked on 2GN.96 (M3-blocked)
besides.

**Weight-scaling.** Cheapest, and defeated by additive accumulation for the same reason as A2's
option 1.

**Splitting the base pair** (`stratification` for the elite half, demote `utilitarian` to an
affordance reading). Considered and superseded by Finding 5: it still reads one term of a relation.

**Scoping the follow-up to these 24 rules.** Rejected once the defect was measured across the
absolute/relative boundary.

## Wider lesson

2GN.82 handed this spike a framing — "these rules could not migrate, find them a baseline" — and the
framing was inherited without being tested. Four of the five groups turned out not to want a baseline
at all, and the largest finding was invisible from inside the question as posed.

**A task's brief encodes the understanding available when it was filed.** 2GN.87 recorded the
converse for rules (a condition can outlive the intent that authored it); this records it for tasks.
Where a brief names a solution shape, the first measurement should test whether that shape fits, not
how to build it.

Related: doc 12 §2.31 (the split that created this task), §2.39 (R4's inherited intent), §2.43
(the unused attachment graph).
