/**
 * Observational register templates for the sixteen decorative grammar terminals (doc 05 §8.2),
 * roadmap 2GN.35. See `index.ts` for the register's shared conventions (id shape, slot syntax,
 * voice).
 *
 * `DecorativeLayer` (`types/decoration.ts`) carries only `technique`, an optional `motifRef`, an
 * optional `material` and `sublayers` — it has no field for a technique's other BNF arguments
 * (`painting`'s pigment, `overlay`'s coverage, `studs`'/`wire-wrapping`'s pattern). Templates below
 * describe only what the layer's shape actually carries: every technique gets a base description of
 * the physical process, the four motif-carrying techniques (`engraving`, `relief`, `painting`,
 * `inlay`) additionally reference `#motifRef#` when present, and the seven material-introducing
 * techniques additionally reference `#material#` when present. `sublayers` (decoration-on-decoration,
 * doc 05 §8.3) is not addressed here — composing a layer's description with its sublayers'
 * descriptions is 2GN.39's job (template expansion), not this data.
 */

import type { DescriptionTemplate } from '../../../types/description.ts';

export const DECORATION_TEMPLATES: readonly DescriptionTemplate[] = [
	// --- surface-treatment (doc 05 §8.2) --------------------------------------------------------
	{
		property: 'decoration.polish',
		variants: [
			{
				template: 'The surface has been polished to a smooth finish.',
				emphasis: [],
				register: 'observational',
			},
		],
	},
	{
		property: 'decoration.patina',
		variants: [
			{
				template: 'A patina has developed across the surface.',
				emphasis: [],
				register: 'observational',
			},
		],
	},
	{
		property: 'decoration.roughening',
		variants: [
			{
				template: 'The surface has been deliberately roughened.',
				emphasis: [],
				register: 'observational',
			},
		],
	},
	{
		property: 'decoration.scoring',
		variants: [
			{
				template: 'Scored lines mark the surface.',
				emphasis: [],
				register: 'observational',
			},
		],
	},
	{
		property: 'decoration.engraving',
		variants: [
			{
				template: 'Incised lines cut into the surface.',
				emphasis: [],
				register: 'observational',
			},
		],
	},
	{
		property: 'decoration.engraving.motif',
		variants: [
			{
				template: 'The incised lines form a #motifRef# motif.',
				emphasis: [],
				register: 'observational',
			},
		],
	},
	{
		property: 'decoration.relief',
		variants: [
			{
				template: 'The surface has been worked into raised relief.',
				emphasis: [],
				register: 'observational',
			},
		],
	},
	{
		property: 'decoration.relief.motif',
		variants: [
			{
				template: 'The raised relief forms a #motifRef# motif.',
				emphasis: [],
				register: 'observational',
			},
		],
	},
	{
		property: 'decoration.painting',
		variants: [
			{
				template: 'Pigment has been applied to the surface.',
				emphasis: [],
				register: 'observational',
			},
		],
	},
	{
		property: 'decoration.painting.motif',
		variants: [
			{
				template: 'The painted pigment forms a #motifRef# motif.',
				emphasis: [],
				register: 'observational',
			},
		],
	},
	{
		property: 'decoration.glaze',
		variants: [
			{
				template: 'A fired glaze coats the surface.',
				emphasis: [],
				register: 'observational',
			},
		],
	},

	// --- applied-element (doc 05 §8.2) ----------------------------------------------------------
	{
		property: 'decoration.inlay',
		variants: [
			{
				template: 'Material has been set into the surface as inlay.',
				emphasis: [],
				register: 'observational',
			},
		],
	},
	{
		property: 'decoration.inlay.motif',
		variants: [
			{
				template: 'The inlay forms a #motifRef# motif.',
				emphasis: [],
				register: 'observational',
			},
		],
	},
	{
		property: 'decoration.inlay.material',
		variants: [
			{
				template: 'The inlay is #material#.',
				emphasis: [],
				register: 'observational',
			},
		],
	},
	{
		property: 'decoration.overlay',
		variants: [
			{
				template: 'A layer of material has been applied over the surface.',
				emphasis: [],
				register: 'observational',
			},
		],
	},
	{
		property: 'decoration.overlay.material',
		variants: [
			{
				template: 'The overlay is #material#.',
				emphasis: [],
				register: 'observational',
			},
		],
	},
	{
		property: 'decoration.studs',
		variants: [
			{
				template: 'Studs are set into the surface.',
				emphasis: [],
				register: 'observational',
			},
		],
	},
	{
		property: 'decoration.studs.material',
		variants: [
			{
				template: 'The studs are #material#.',
				emphasis: [],
				register: 'observational',
			},
		],
	},
	{
		property: 'decoration.wire-wrapping',
		variants: [
			{
				template: 'Wire has been wound around the form.',
				emphasis: [],
				register: 'observational',
			},
		],
	},
	{
		property: 'decoration.wire-wrapping.material',
		variants: [
			{
				template: 'The wire is #material#.',
				emphasis: [],
				register: 'observational',
			},
		],
	},
	{
		property: 'decoration.gilding',
		variants: [
			{
				template: 'A thin layer of precious metal covers the surface.',
				emphasis: [],
				register: 'observational',
			},
		],
	},
	{
		property: 'decoration.gilding.material',
		variants: [
			{
				template: 'The gilding is #material#.',
				emphasis: [],
				register: 'observational',
			},
		],
	},

	// --- textile-element (doc 05 §8.2) ------------------------------------------------------------
	{
		property: 'decoration.wrapping',
		variants: [
			{
				template: 'Material has been wound around the form.',
				emphasis: [],
				register: 'observational',
			},
		],
	},
	{
		property: 'decoration.wrapping.material',
		variants: [
			{
				template: 'The wrapping is #material#.',
				emphasis: [],
				register: 'observational',
			},
		],
	},
	{
		property: 'decoration.tassels',
		variants: [
			{
				template: 'Tassels hang from the form.',
				emphasis: [],
				register: 'observational',
			},
		],
	},
	{
		property: 'decoration.beading',
		variants: [
			{
				template: 'Beads are attached to the form.',
				emphasis: [],
				register: 'observational',
			},
		],
	},
	{
		property: 'decoration.beading.material',
		variants: [
			{
				template: 'The beads are #material#.',
				emphasis: [],
				register: 'observational',
			},
		],
	},
];
