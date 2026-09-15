<!-- doc-changelog: generated 2026-08-24. Delete this line once you hand-edit this file. -->

# Changelog

All notable changes to this project are documented here. Format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

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

[Unreleased]: https://github.com/JasonWarrenUK/those-who-came-before/compare/v0.55.0...HEAD
[0.55.0]: https://github.com/JasonWarrenUK/those-who-came-before/compare/v0.54.0...v0.55.0
[0.53.0]: https://github.com/JasonWarrenUK/those-who-came-before/compare/v0.52.0...v0.53.0
[0.52.0]: https://github.com/JasonWarrenUK/those-who-came-before/releases/tag/v0.52.0
