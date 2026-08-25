# Design Spikes

One file per spike, `<task-id>-<kebab-slug>.md`. A spike file holds the reasoning: the argument, the
measurements taken to settle it, the alternatives rejected and why. The ruling itself is propagated
to doc 11 (locked decisions) and doc 12 (what changed as a result); the file's header table names
where it landed. Task status and dependency edges live in `.claude/roadmaps.json`.

## Header convention

| Prop        | Value                                                            |
| ----------- | ---------------------------------------------------------------- |
| Status      | `Open` / `Ruled` / `Ruled; implemented` / `Ruled; unimplemented` |
| Ruled       | date, or `—`                                                     |
| Implemented | date and files, or `—` (omit row if `Status` already says so)    |
| Ruling in   | doc 11 § and doc 12 § the ruling was propagated to               |
| Outcome     | one line                                                         |

## Ruled

| ID      | Question                                                               | Ruled      | Ruling in                  | File                                                 |
| ------- | ---------------------------------------------------------------------- | ---------- | -------------------------- | ---------------------------------------------------- |
| 2GN.77  | Material value from catalogue tag or from the world?                   | 2026-08-04 | doc 11 §2.9, doc 12 §2.28  | [stub](2GN.77-world-relative-material-value.md)      |
| 2GN.80  | Status tags absolute or culture-relative?                              | 2026-08-04 | doc 11 §2.9, doc 12 §2.28  | [stub](2GN.80-status-tag-relativity.md)              |
| 2GN.98  | What does decorative volume key on?                                    | 2026-08-06 | doc 11 §2.10, doc 12 §2.33 | [stub](2GN.98-decorative-volume.md)                  |
| 2GN.78  | Should `MaterialTag` carry `precious-*` members?                       | 2026-08-11 | doc 11 §2.9, doc 12 §2.40  | [2GN.78](2GN.78-precious-material-tags.md)           |
| 2GN.87  | R4's edge-family safety net catches nothing                            | 2026-08-11 | doc 12 §2.39               | [2GN.87](2GN.87-r4-unsatisfiable-condition.md)       |
| 2GN.112 | `MaterialFlow.specificMaterials`: narrow or widen?                     | 2026-08-12 | doc 05 §3.4, doc 12 §2.41  | [stub](2GN.112-material-flow-selectors.md)           |
| 2GN.97  | Categorical relative-award rules under the 2GN.80 ruling               | 2026-08-13 | doc 11 §2.12, doc 12 §2.44 | [2GN.97](2GN.97-categorical-relative-award-rules.md) |
| 2GN.108 | Short-bodied edged tool in the vocabulary? Orientation                 | 2026-08-13 | doc 11 §2.11, doc 12 §2.43 | [2GN.108](2GN.108-short-bodied-edged-tools.md)       |
| 2GN.110 | Per-material entries in `materialAffinities`                           | 2026-08-13 | doc 11 §2.13, doc 12 §2.45 | [2GN.110](2GN.110-per-material-affinities.md)        |
| 2GN.111 | Per-state values in `physicalProperties`                               | 2026-08-13 | doc 11 §2.14, doc 12 §2.46 | [2GN.111](2GN.111-per-state-physical-properties.md)  |
| 2GN.118 | Are the primitive grammar's value-sets rational?                       | 2026-08-13 | doc 11 §2.17               | [2GN.118](2GN.118-primitive-parameter-value-sets.md) |
| 2GN.127 | What an absent affinity entry means                                    | 2026-08-14 | doc 11 §2.15, doc 12 §2.49 | [2GN.127](2GN.127-affinity-silence.md)               |
| 2GN.66  | Naming grammars and the language layer beneath them                    | 2026-08-15 | doc 11 §2.18               | [2GN.66](2GN.66-naming-grammars.md)                  |
| 2GN.142 | Region dimension for classification baselines (unimplemented; 2GN.144) | 2026-08-24 | doc 11 §2.9, doc 12 §2.53  | [2GN.142](2GN.142-region-keyed-baselines.md)         |
| 2GN.137 | Value of N for the plausibility re-expansion cap                       | 2026-08-25 | doc 11 §2.19, doc 12 §2.54 | [2GN.137](2GN.137-re-expansion-attempt-cap.md)       |

Not in this directory by design: 2GN.10 (primitive→material table) was ruled interactively and lives
only in doc 11 §2.16.

## Open

No file yet; the question and any measurements taken so far are in the roadmap entry. When a spike
is ruled, create its file and move the row up.

| ID      | Question                                                                         | Blocked on | Unblocks                        |
| ------- | -------------------------------------------------------------------------------- | ---------- | ------------------------------- |
| 2GN.115 | General working-end definition for artefacts with no edge                        | —          | 2GN.117, 2GN.139, 2GN.140 chain |
| 2GN.116 | Component roles (grip/head) as first-class grammar output?                       | —          | 4 direct                        |
| 2GN.119 | Should classification conditions read relations between components?              | —          | 1 direct                        |
| 2GN.122 | One aperture model; does it subsume `perforation`?                               | —          | 1 direct                        |
| 2GN.125 | Does `AvailabilityLevel` conflate found with produced materials?                 | 2GN.124    |                                 |
| 2GN.131 | What the decorative recursion depth cap computes                                 | —          | 2GN.32                          |
| 2GN.132 | Sublayer generation inside `expandDecoration`'s slot loop or a post-pass?        | —          | 2GN.31                          |
| 2GN.134 | Should cultural affinity gate substrate access at all?                           | —          | 2GN.129                         |
| 2GN.135 | Inputs to the derived `wallThickness`/`diameter` quantity                        | —          | 2GN.120                         |
| 2GN.136 | Material catalogue widening: criteria and target size                            | —          | 2GN.124                         |
| 2GN.138 | Define "interpretive challenge" as a per-artefact metric; ratify ambiguity bands | —          | 2GN.45, 2GN.46                  |
| 2GN.139 | Arrangement-pattern assignment mechanism                                         | —          | 2GN.67                          |
| 2GN.140 | Intentional assemblage vs stray components                                       | —          | 2GN.69                          |
| 2GN.143 | Role of `provenance` in the material-standing formula                            | —          | doc 11 §2.9 wording             |

Regenerate the open list from `python3 ~/.claude/library/scripts/roadmap.py ready --json` filtered
on "design spike"; this table is a snapshot dated 2026-08-25.
