# 2GN.66 — Naming Grammars, and the Language Layer Beneath Them

| Prop        | Value                                                                             |
| ----------- | --------------------------------------------------------------------------------- |
| Status      | Ruled; implemented                                                                |
| Ruled       | 2026-08-15                                                                        |
| Implemented | 2026-08-15 — `data/names/`, `engine/world/phonology.ts`, `engine/world/naming.ts` |
| Ruling in   | This document                                                                     |
| Outcome     | Generated phonology per language, names as segment lists, flat forest, no descent |

## The question

The roadmap line is nine words: "`src/lib/data/names/` — naming grammars for sites, cultures,
scholars (doc 08 `data/names/`)". Doc 08 line 232 is the only specification that exists, and it is a
directory comment. There is no BNF, no phonology, no example output anywhere in docs 00–13.

Three consumers are blocked on it: 2GN.47 (`Provenance.site.name`), 2GN.48 (`NPCScholarSeed.name`)
and the eventual culture generator (`Culture.label`, 3WS.x). All three want a string. The cheapest
possible reading of the task is a per-culture syllable-fragment table and a function that joins
three of them.

That reading was rejected, for a reason external to the task: doc 01 already lists **"language
theories, grammar documents"** among the 18+ document types and **"language evolution"** among the
~32 mapped features, and the project intends a later phase with tablets in untranslated languages. A
name generator built as a name generator is thrown away when that lands. A name generator built as
the surface of a language layer is not.

## Ruling 1: phonotactic synthesis, not word-lists

Names are synthesised from a phoneme inventory and syllable templates, not assembled from authored
fragment lists.

Word-lists cap out: a finite pool repeats quickly, every new culture needs a human to invent its
fragments, and the eventual culture generator cannot mint one. More decisively, a fragment list
carries no phonological structure, so nothing downstream can ask what sounds a language has — which
is the entire question the tablet system will need answered.

## Ruling 2: phonology is generated, not authored

Each language's phoneme inventory and syllable template are rolled from the seeded PRNG, not
hand-written per culture.

The four Explorer presets are hand-authored today and `explorer-cultures.ts` already declares itself
superseded by this task. Hand-authoring phonologies would reproduce exactly that stopgap one layer
down: the 3WS.x culture generator could not give a generated culture a voice.

⚠️ **The generator must be tuned, not uniform.** This is the single failure mode that makes
generated languages read as noise, and it is worth stating precisely because the obvious
implementation has it. Two mechanisms, both imported from `the-tongue` (see Prior art):

1. **A universal core plus probabilistic extras.** Real inventories are not random subsets. The
   sounds `p`, `t`, `k`, `m`, `n`, `s` and `l` appear in almost every attested language, where
   pharyngeals and uvulars are markedly rare. The generator seeds the core unconditionally and
   admits the rest through per-phoneme probability gates.
2. **Frequency-ranked selection, never uniform.** Drawing uniformly from an inventory gives the
   rarest phoneme the same share as the commonest, which is what makes generated words feel flat.
   Selection uses a geometric dropoff over a markedness-ordered list.

## Ruling 3: a name is a segment list, rendered at read time

`Provenance.site.name` changes from `string` to a structured value carrying the phoneme id sequence
and the id of the phase that coined it. Display text is produced by a renderer, not stored.

This is a **deliberate divergence from `the-tongue`**, which returns a display string from `genStem`
specifically so branch names do _not_ drift under sound change. Its own roadmap notes toponymy wants
the opposite, and for this project the opposite is the whole point: a site named in an early phase
and encountered in a late-phase document under a drifted form is a genuine interpretive puzzle, and
lands on Pillar 1 (error is the engine). "Every -chester and -thorpe in England is this mechanic."

Blast radius, measured before ruling: `site.name` has exactly **two** occurrences in the repo — the
type definition (`types/world.ts:542`) and one fixture (`tests/fixtures/artefact.ts:218`). Nothing
reads it. The change is nearly free now and expensive after 2GN.47 populates it.

`CulturePhase` already carries stable ids and `Provenance` already carries `phaseId`, so the
temporal spine a future sound-change engine walks exists already. No new temporal structure.

## Ruling 4: a forest of families, and descent is deferred

Languages are grouped into a **forest**: several independent proto-languages, with cultures
distributed across them. Some cultures are siblings within a family and share a proto-phonology;
others share no ancestor at all.

Explicitly **not** one proto-language per world with every culture descending from it. That would
make every culture related, which is both linguistically false and dramatically flat — and it would
remove the tablet system's most interesting case, since an untranslated tablet in a relative of a
known language reads very differently from one in an isolate.

⚠️ **Sound change is not built by this task, so sisters currently sound identical, not merely
related.** The family edges are real and populated; the divergence along them is absent. This is
stated rather than faked: the alternative is inventing a divergence mechanism whose behaviour
nothing has measured, which is the defect 2GN.87 punished.

⚠️ **Degenerate at MVP scale.** Doc 05 §362 specifies 2 cultures for MVP; the Explorer carries four.
At N=2 a forest is either one family or two isolates. Family count is therefore derived from culture
count rather than fixed, so the structure stays sensible at both scales.

## Ruling 5: constrain combinations, never the vocabulary

**A wide phone table plus rulesets that make un-useful combinations unreachable**, not a narrow
table chosen so nothing can go wrong.

The first draft did the opposite: 23 phonemes, Latin graphemes only, deliberately excluding the
exotic end so that no language could produce an unpronounceable name. That is the wrong lever. It
prices every future language's expressiveness to prevent a failure that belongs to _combination_,
and it would have permanently capped how alien a culture could sound — including in the tablet
system, where an alien-sounding language is the entire effect.

The table is 65 phonemes instead, and constraint lives in two places that can express it properly:

| Layer               | What it constrains         | Where                                                         |
| ------------------- | -------------------------- | ------------------------------------------------------------- |
| Inventory coherence | Which phonemes co-occur    | `PHONEME_PREREQUISITES`, `UNIVERSAL_CORE` (`coherence.ts`)    |
| Phonotactics        | Which sequences may appear | `ONSET_CLUSTER_MANNERS`, `MAX_CONSONANT_RUN` (`coherence.ts`) |

Prerequisites are **one-directional**: a rule says what a phoneme needs, never what it forbids. That
is what guarantees no inventory can be made unsatisfiable — the 2GN.87 failure — since adding the
prerequisite always satisfies the rule.

## Finding: five defects, all found by measurement rather than by reading

Each was invisible in the code and obvious in the output. Recorded because the tests pinning them
are otherwise unmotivated.

**1. Feature-bundle collision (`lh` ≡ `s`).** `lh` was authored as an alveolar fricative, giving it
the same `{alveolar, fricative, voiceless}` bundle as `s` — exactly `the-tongue`'s `/l/`≈`/r/` trap,
which cost it a silent substitution bug. Fixed by making `lh` a `lateral-fricative`. Pinned by
`phones.test.ts`'s no-shared-bundle test, written before the collision was known.

**2. Dead cluster rules.** Two entries in `ONSET_CLUSTER_MANNERS` named a `'liquid'` manner that no
longer existed after the lateral split, so they silently matched nothing. Fixed by typing the tuple
as `Manner` rather than `string`, which turns the same mistake into a compile error.

**3. Degenerate vowel systems.** 5.3% of generated languages had **no high vowel at all**, and the
minimum vowel count was 1 — systems no attested language matches. Fixed in the coherence layer
(`MINIMAL_VOWEL_SYSTEM`), not by retuning probabilities: the three-vowel triangle is a typological
floor, so it belongs in the rules rather than in a constant that happens to make it rare.

**4. Every language sounded alike.** The sharpest finding, and it survived two rounds of fixing.
`pickRanked` draws against a markedness-ordered list, but that list was **universal**, so every
language in the world obeyed one frequency law: `/n/` opened 28.4% of all names and `/n t k` opened
62% of them. Languages differed in which phonemes they _had_, never in which they _preferred_ — so
they differed in inventory and not in character.

Fixed by giving each language its own frequency ordering (`jitterRank`): the universal rank,
compressed and perturbed per language. Measured by counting how many distinct phonemes are ever some
language's commonest initial, out of 42 consonants:

| Ordering                               | Distinct favourites | Commonest favourite |
| -------------------------------------- | ------------------: | ------------------: |
| Universal rank (before)                |                  12 |        `/n/` at 36% |
| Jitter 0.35, linear baseline           |                  22 |        `/n/` at 26% |
| **Jitter 1.2, `sqrt` baseline (kept)** |              **35** |    `/n/` at **21%** |

The compression matters as much as the jitter: a linear baseline leaves the marked tail too far back
for any jitter to reach, so a language could never lead on an unusual sound.

**5. Ungoverned syllable junctures.** `ONSET_CLUSTER_MANNERS` governs consonants _within_ an onset,
which left the seam between syllables unchecked: 0.4% of names carried a run of three or more
consonants (`Nafdoththti`, `Ñangshngångru`) and 5.3% doubled a consonant across the seam (`Kakklo`,
`Tänna`). Fixed by `smoothJuncture`, which **trims** rather than redraws — a redraw loop would
consume a variable number of PRNG draws and could not terminate in a language whose inventory makes
the seam unavoidable. Both now measure 0.0% across 6000 names.

⚠️ Order is load-bearing within the repair: the identical-consonant check must run **after**
run-trimming, since trimming changes which segment leads. Checking first let `Kanoppā` and `Tänna`
through.

## Finding: three further defects, found only by looking at the output

The five above were found by measuring distributions. These three survived all of it — 702 tests
green, every calibration band held — and were caught the moment a human read a page of names. Kept
as the case for the `sample:names` script existing at all.

**6. Two phonemes wrote as the same letter.** The vowel `y` and the palatal approximant `yy` both
carried the grapheme `y`, so `Nuya` gave a reader no way to tell which it held. Worse, it disguised
itself as a different bug: the name syllabified as `nu • ÿ • a`, which reads as a broken syllabifier
rather than a broken table. The vowel now writes `ÿ`, and `phones.test.ts` pins that no two phonemes
share a grapheme.

**7. A glide could never begin a syllable.** `sonorityOf` ranked an approximant equal to a vowel
(both 9), and onset maximisation walks left only while sonority _rises_, so the tie stopped the
walk: `yayunu` split `yay • u • nu` instead of `ya • yu • nu`. A vowel now ranks strictly above
every consonant. Invisible to every distribution metric, since it changes no count — only where the
boundaries fall.

**8. One-syllable names were too common.** 19.8% of names were monosyllabic and 15.1% were two
segments or fewer — `Ni`, `Nu`, `Yu`, `Ə`. Those do not read as proper nouns, and they contradicted
this module's own stated design that a name runs _longer_ than an ordinary word.
`MONOSYLLABLE_SUPPRESSION` took them to 7.1% and 5.4%. A multiplier rather than a floor, so a
genuinely terse language stays reachable: `Ur` and `Kish` are real toponyms.

⚠️ The lesson generalises past this task. Distribution guards catch a generator that has _moved_;
they cannot catch one that was never right, because they are recorded from its own behaviour.
Reading the output is the only thing that finds a defect present from the start.

## Prior art: `the-tongue`

`/Users/jasonwarren/Code/creations/the-tongue` is a mature diachronic language engine (~9.5k engine
lines, 12 design spikes). Its rulings are adopted rather than re-derived. Adopted directly:

| Import                         | Why                                                                                                          |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| Feature-bundle phones          | A phone is `{place, manner, voice}` or `{height, back, round}`, not a letter — sound change needs features   |
| `pickRanked` geometric dropoff | Its `1eng-16` survey names the uniform phoneme draw as the one clear deficiency of an otherwise strong model |
| Inverse-CDF selection          | One PRNG draw regardless of list length, so inventory size cannot shift every downstream value               |
| Universal core + ranked extras | A fixed markedness rank filtered by probability gates, so `pickRanked` has a stable order to draw against    |
| Derive inventory, never store  | Its `1eng-23` census: 100% of branches lost ≥1 genesis phoneme; a stored inventory goes stale                |
| Names as a distinct path       | Onset preferred (0.85), 2–3 syllables against lexical 1–2, codas from sonorants only, so names end softly    |

Two of its documented traps are designed against from the start:

- **Feature-diff self-patches silently delete phones.** A rule written as a feature diff resolves to
  `null` for most vowel types and the phone is dropped — an advertised shift that is actually a
  deletion. Where a target is defined by its own features, an absolute segment is used.
- **Underspecified features make "unchanged" lossy.** Its `/l/` and `/r/` are both
  `{alveolar, liquid, voiced}`, so re-resolving an unchanged `/r/` returns `/l/`. Every phone in
  this table is individuated in the feature space.

Its `2geo-10` and `1eng-11` rulings are the reason sound change is a separate task rather than a
sub-part of this one: the naive versions measurably do not fire (0 fractures across 12 seeds × 150
turns) or ossify permanently. That is a task with its own census work, not a corner of a naming
task.

## Honesty ledger

| Mechanic                     | Status                                                                                                    |
| ---------------------------- | --------------------------------------------------------------------------------------------------------- |
| Phoneme inventory generation | Real — universal core plus attested-frequency gates                                                       |
| Inventory coherence          | Real — 40 one-directional implications, measured at 0 violations over 200 seeds                           |
| Frequency-ranked selection   | Real — geometric dropoff, measured shares                                                                 |
| Per-language frequency order | Proxy — a jittered universal rank, not a modelled cause of why languages differ                           |
| Sonority sequencing          | Real — the attested principle, with the two attested `/s/` exceptions                                     |
| Syllable templates           | Abstraction — four shapes, not a full phonotactic grammar                                                 |
| Juncture repair              | Abstraction — trimming, where a real phonology would resyllabify or epenthesise                           |
| Name/lexicon distinction     | Real — a separate draw path with its own parameters                                                       |
| Per-language name length     | Proxy — a rolled weight per language, not derived from its phonology                                      |
| Syllabification              | Real — sonority-based onset maximisation, derived on read and never stored                                |
| Scholar naming convention    | **NOT MODELLED** — one name per scholar; patronymics and clan names are unruled                           |
| Language families            | Structure real, **divergence NOT MODELLED** — sisters are identical today                                 |
| Sound change / drift         | **NOT MODELLED** — separate task                                                                          |
| Phase-evolved name forms     | **NOT MODELLED** — renderer is identity until sound change lands                                          |
| Orthography                  | Abstraction — one grapheme field per phone, no transliteration layer                                      |
| Allophony, stress, tone      | **NOT MODELLED** — no consumer yet; `the-tongue`'s `1eng-23`/`1eng-24` are the prior art when one appears |

## Follow-on tasks this opens

Filed rather than absorbed, because each carries its own census work. `the-tongue`'s `2geo-10` and
`1eng-11` both found the naive version of a diachronic mechanic measurably does not fire, or
ossifies permanently — that is not a corner of a naming task.

1. **Sound change / drift.** The rule transducer, applied along family edges and phase sequences.
   Turns `renderName` from identity into a real diachronic renderer, and makes sisters diverge.
2. **Culture and phase binding.** `Culture` gains a `languageId`, and the culture generator (3WS.x)
   calls `generateLanguageForest` rather than only tests calling it.
3. **Toponymy proper.** Site names as compounds of terrain-salient concepts rather than bare stems,
   which needs both a lexicon and real geography (3WS.7).
4. **Explorer surface.** A phonology inspector: inventory, template and sample names per culture.
