<!-- doc-changelog: generated 2026-08-24. Delete this line once you hand-edit this file. -->

# Changelog

All notable changes to this project are documented here. Format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

## [0.58.0] - 2026-09-25

### Added

- Classified artefacts now come with a written description: one observation per structural
  component, ordered by where each component sits on the object, voiced in a single register
  (observational, interpretive or technical) with a neutral provenance summary alongside.
- Choosing a description's register and wording never reads the artefact's hidden true tag scores:
  two artefacts differing only in those scores read identically. This holds the diegesis line until
  the lens system lands in Milestone 6.

### Changed

- A description variant whose material or property conditions the component fails is skipped rather
  than rendered with gaps, and a template with a missing value is dropped instead of printed
  half-filled.

## [0.57.0] - 2026-09-18

### Added

- Decorative layers now receive real motifs and materials in every production pipeline (previously
  only in tests), so the "motif cultural origins" and "precious materials in decoration"
  classification fields fire on live data instead of sitting at empty defaults.
- Decoration and structural material choice now share one per-artefact social-stratum draw, so an
  ordinary commoner's object no longer turns up gilded by accident. Structural material selection
  for a given seed is unchanged.
- Trade goods are now a rare scholar specialisation: the `trade-good` tag clears the award threshold
  once the scholar calibration sweep runs against the wired decoration pipeline.

## [0.56.0] - 2026-09-17

### Breaking

- NPC scholar names are now a structured `NameForm` rather than a plain string. Anything
  constructing a scholar by hand needs updating; nothing in the shipped game does this yet.

### Added

- The dig site now generates its first cohort of NPC scholars: 3 to 4 named academics per world,
  each with a career stage, specialisation and preferred dig sites, dealt so the department always
  has a senior figure and an active researcher rather than four interchangeable clones.
- Scholar specialisations are drawn to feel coherent: a scholar's focus areas are related to each
  other, based on what tends to co-occur on real digs, rather than picked independently.
- Scholars now carry an identity ready for their own beliefs and biases to be layered on in a
  future update.

<details>
<summary>0.55.0 and earlier</summary>

## [0.55.0] - 2026-09-15

### Breaking

- Material assignment now opens with a per-artefact stratum draw, so a given seed produces different
  materials than it did before. `MaterialAssignment` gains a required `standing` field and
  `ExtractedFeatures` a required `materialStanding` field; anything hand-constructing either type
  needs updating.

### Added

- A material now has a standing in the culture that made it: its local scarcity inverted, times how
  much the culture prizes it, with a trade-only material tempered by the culture's trade openness so
  a trading economy's routine import reads as ordinary rather than exotic.
- Social stratification shapes the material record. Each artefact is drawn for the elite or for
  commoners in proportion to the phase's stratification; elite artefacts favour prized materials and
  commoner ones avoid them, so prized materials concentrate in a minority of a stratified culture's
  output and spread thinly through a flat one.
- Classification reads that standing: an artefact whose most prized structural material clears the
  cut scores `elite` and `ceremonial`, with no static "this material is precious" fact anywhere in
  the catalogue. Across the shipped cultures the rule fires on 12% of artefacts at stratification
  0.4 and 35% at 0.85.
- The Explorer's Tag Inspector gains a Material feature group, and the Material Viewer shows each
  candidate's standing, a prized marker and the culture's elite share.
- The design-notes site is restyled as a parchment layout with a rebuilt hub page and Spectral/IBM
  Plex Mono typography.

### Fixed

- The Explorer's Material Viewer, Decoration Viewer and the `sample-materials` script drew materials
  without the stratum draw and showed roughly double the pipeline's prized-material rate; all three
  now draw through the same engine path as the pipeline and agree with each other for a seed.

## [0.54.0] - 2026-08-26

### Added

- The app gains a hub page linking the dev tools and the design-notes site, and a dev portal page
  linking the Project Explorer, with a shared header and a footer crediting the concept.
- A spike index at `docs/spikes/README.md` lists every design spike, ruled and open, with where each
  ruling landed.

### Changed

- Six design questions are ruled, each with a spike file, a locked decision in doc 11 and a
  propagation entry in doc 12: region keying for classification baselines (world-level regions on a
  culture phase, filed to implement as 2GN.144); the re-expansion cap (20); provenance's place in
  the material-standing formula (implicit in availability); the substrate gate (availability alone,
  never affinity); sublayer placement (a separate pass after material assignment); and the
  decoration recursion depth (emphasis drives the per-depth chance, craft the ceiling).

## [0.53.0] - 2026-08-24

### Added

- Generation now checks a join's physical demands against its candidate materials: a riveted,
  threaded or hinged join requires a material rigid enough to hold the fastener, and a wrapped join
  requires one flexible enough to wrap around its substrate.

## [0.52.0] - 2026-08-24

### Added

- Artefact components now carry a real set of materials they can physically be made from, derived
  from their shape (primitive type and rolled properties) rather than the previous placeholder that
  allowed anything. An edged elongated form (blades, points), for instance, now only draws from
  metal or stone, never wood or fibre.
- The Explorer's Material Viewer gained a "Shape" column, showing how many of an artefact's
  components a candidate material could actually be made into, separate from whether the culture can
  obtain it at all.

</details>

[Unreleased]: https://github.com/JasonWarrenUK/those-who-came-before/compare/v0.58.0...HEAD
[0.58.0]: https://github.com/JasonWarrenUK/those-who-came-before/compare/v0.57.0...v0.58.0
[0.57.0]: https://github.com/JasonWarrenUK/those-who-came-before/compare/v0.56.0...v0.57.0
[0.56.0]: https://github.com/JasonWarrenUK/those-who-came-before/compare/v0.55.0...v0.56.0
[0.55.0]: https://github.com/JasonWarrenUK/those-who-came-before/compare/v0.54.0...v0.55.0
[0.54.0]: https://github.com/JasonWarrenUK/those-who-came-before/compare/v0.53.0...v0.54.0
[0.53.0]: https://github.com/JasonWarrenUK/those-who-came-before/compare/v0.52.0...v0.53.0
[0.52.0]: https://github.com/JasonWarrenUK/those-who-came-before/releases/tag/v0.52.0
