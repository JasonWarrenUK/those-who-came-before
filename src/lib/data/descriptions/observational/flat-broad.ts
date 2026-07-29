/**
 * Observational register templates for the `flat-broad` primitive (doc 05 §5.3), roadmap 2GN.35.
 * See `index.ts` for the register's shared conventions (id shape, slot syntax, voice).
 */

import type { DescriptionTemplate } from '../../../types/description.ts';

export const FLAT_BROAD_TEMPLATES: readonly DescriptionTemplate[] = [
	{
		property: 'flat-broad.shape',
		variants: [
			{
				template: '#shape.a# planar form.',
				emphasis: [],
				register: 'observational',
			},
		],
	},
	{
		property: 'flat-broad.size',
		variants: [
			{
				template: 'Overall size is #size#.',
				emphasis: [],
				register: 'observational',
			},
		],
	},
	{
		property: 'flat-broad.thickness',
		variants: [
			{
				template: '#thickness.a# cross-section.',
				emphasis: [],
				register: 'observational',
			},
		],
	},
	{
		property: 'flat-broad.curvature',
		variants: [
			{
				template: 'The surface has a #curvature# curvature.',
				emphasis: [],
				register: 'observational',
			},
		],
	},
	{
		property: 'flat-broad.perforation',
		variants: [
			{
				template: 'Perforation count: #perforation#.',
				emphasis: [],
				register: 'observational',
			},
		],
	},
];
