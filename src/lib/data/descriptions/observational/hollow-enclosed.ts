/**
 * Observational register templates for the `hollow-enclosed` primitive (doc 05 §5.3), roadmap
 * 2GN.35. See `index.ts` for the register's shared conventions (id shape, slot syntax, voice).
 */

import type { DescriptionTemplate } from '../../../types/description.ts';

export const HOLLOW_ENCLOSED_TEMPLATES: readonly DescriptionTemplate[] = [
	{
		property: 'hollow-enclosed.shape',
		variants: [
			{
				template: '#shape.a# volumetric form.',
				emphasis: [],
				register: 'observational',
			},
		],
	},
	{
		property: 'hollow-enclosed.size',
		variants: [
			{
				template: 'Overall size is #size#.',
				emphasis: [],
				register: 'observational',
			},
		],
	},
	{
		property: 'hollow-enclosed.wall',
		variants: [
			{
				template: 'The walls are #wall#.',
				emphasis: [],
				register: 'observational',
			},
		],
	},
	{
		property: 'hollow-enclosed.opening',
		variants: [
			{
				template: 'The mouth is #opening#.',
				emphasis: [],
				register: 'observational',
			},
		],
	},
	{
		property: 'hollow-enclosed.base',
		variants: [
			{
				template: 'The base is #base.a# form.',
				emphasis: [],
				register: 'observational',
			},
		],
	},
];
