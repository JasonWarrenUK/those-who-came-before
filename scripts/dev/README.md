# Milestone 2 sampling scripts

CLI samplers for eyeballing what the generation pipeline actually produces, stage by stage. They are
the throwaway precursor to the Project Explorer (`/dev/explorer`, roadmap 2GN.57+): once the
Explorer's viewers land these scripts earn deletion.

All samplers generate against the mock world fixtures in `tests/fixtures/` (metal-leaning culture,
flat 0.5 phase, mixed geology) — Milestone 2 runs the pipeline against fixture worlds by design;
real world state arrives in Milestone 3.

## Tasks

```bash
deno task sample:artefact             # anatomy tree + plausibility verdict (2GN.3–12)
deno task sample:materials            # anatomy tree with each part's material pick (2GN.22–25)
deno task sample:decoration           # anatomy tree with layers nested per part (2GN.28–29)
deno task sample:features             # annotated classifier reading: each value with its
                                      # source component and gate explanations (2GN.17/19)
```

Structural output renders as an anatomy tree: short part ids (`c0`), prose parameter fragments,
attachments as branches, unattached parts flagged `(loose)`. The features reading annotates every
collapsed value with the component it came from (re-derived via the doc 12 §2.20 policies) and
explains why gated presence flags did or didn't fire. `--json` is the escape hatch for full raw data
everywhere.

Every task accepts:

| Flag              | Meaning                                                                        |
| ----------------- | ------------------------------------------------------------------------------ |
| `--seed <string>` | Base PRNG seed (default `dev-sample`); sample _n_ of a batch uses `<seed>-<n>` |
| `--count <n>`     | Number of artefacts to sample (default 1)                                      |
| `--json`          | Machine-readable output (`Map`s serialised as plain objects)                   |

Script-specific flags:

| Task               | Flag          | Meaning                                                                                                                                            |
| ------------------ | ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sample:materials` | `--draws <n>` | Redraw the first sample's assignments _n_ times and print the per-component pick distribution — affinity/scarcity tilt becomes visible around 100+ |
| `sample:features`  | `--bare`      | Skip decorative expansion, extract from the bare structure                                                                                         |

## Examples

```bash
deno task sample:features --seed brooch-hunt --count 5
deno task sample:materials --draws 500
deno task sample:artefact --count 3 --json | jq '.[].plausibility'
```

Determinism holds throughout: the same seed always produces the same artefact, materials, layers and
features.
