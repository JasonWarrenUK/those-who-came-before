/**
 * Observational register templates for the `elongated` primitive (doc 05 §5.3), roadmap 2GN.35.
 * See `index.ts` for the register's shared conventions (id shape, slot syntax, voice).
 *
 * Elongated forms carry five parameters — length, crossSection, taper, edge, point — the richest
 * parameter set of the eight primitives, so this file sets the register's voice: measurement
 * language only, no function attribution. "Long, rectangular in section, with a double edge and a
 * blunt point" describes a blade, a bar, a pin or a needle equally well — that ambiguity is the
 * point (doc 02 pillar 5, doc 04 §3.4).
 */

import type { DescriptionTemplate } from '../../../types/description.ts';

export const ELONGATED_TEMPLATES: readonly DescriptionTemplate[] = [
	{
		property: 'elongated.length',
		variants: [
			{
				template: '#length.a# form along its primary axis.',
				emphasis: [],
				register: 'observational',
			},
		],
	},
	{
		property: 'elongated.crossSection',
		variants: [
			{
				template: '#crossSection.a# cross-section.',
				emphasis: [],
				register: 'observational',
			},
		],
	},
	{
		property: 'elongated.taper',
		variants: [
			{
				template: 'The form narrows with a #taper# taper.',
				emphasis: [],
				register: 'observational',
			},
		],
	},
	{
		property: 'elongated.edge',
		variants: [
			{
				template: 'A #edge# edge runs along the form.',
				emphasis: [],
				register: 'observational',
			},
		],
	},
	{
		property: 'elongated.point',
		variants: [
			{
				template: 'The terminus comes to a #point# point.',
				emphasis: [],
				register: 'observational',
			},
		],
	},
];
