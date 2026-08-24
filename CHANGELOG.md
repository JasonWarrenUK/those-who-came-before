<!-- doc-changelog: generated 2026-08-24. Delete this line once you hand-edit this file. -->
# Changelog

All notable changes to this project are documented here. Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

## [0.53.0] - 2026-08-24

### Added

- Generation now checks a join's physical demands against its candidate materials: a riveted, threaded or hinged join requires a material rigid enough to hold the fastener, and a wrapped join requires one flexible enough to wrap around its substrate.

## [0.52.0] - 2026-08-24

### Added

- Artefact components now carry a real set of materials they can physically be made from, derived from their shape (primitive type and rolled properties) rather than the previous placeholder that allowed anything. An edged elongated form (blades, points), for instance, now only draws from metal or stone, never wood or fibre.
- The Explorer's Material Viewer gained a "Shape" column, showing how many of an artefact's components a candidate material could actually be made into, separate from whether the culture can obtain it at all.

[Unreleased]: https://github.com/JasonWarrenUK/those-who-came-before/compare/v0.53.0...HEAD
[0.53.0]: https://github.com/JasonWarrenUK/those-who-came-before/compare/v0.52.0...v0.53.0
[0.52.0]: https://github.com/JasonWarrenUK/those-who-came-before/releases/tag/v0.52.0
