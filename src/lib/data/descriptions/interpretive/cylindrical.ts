/**
 * Placeholder interpretive-register templates for the `cylindrical` primitive (roadmap 2GN.36).
 * See `index.ts` for why these are placeholders rather than real authoring.
 */

import type { DescriptionTemplate } from '../../../types/description.ts';

export const CYLINDRICAL_TEMPLATES: readonly DescriptionTemplate[] = [
	{
		property: 'cylindrical.length',
		variants: [
			{
				template: 'Interpretive placeholder: #length#.',
				emphasis: ['tool'],
				register: 'interpretive',
			},
		],
	},
	{
		property: 'cylindrical.diameter',
		variants: [
			{
				template: 'Interpretive placeholder: #diameter#.',
				emphasis: ['tool'],
				register: 'interpretive',
			},
		],
	},
	{
		property: 'cylindrical.wall',
		variants: [
			{
				template: 'Interpretive placeholder: #wall#.',
				emphasis: ['tool'],
				register: 'interpretive',
			},
		],
	},
	{
		property: 'cylindrical.opening',
		variants: [
			{
				template: 'Interpretive placeholder: #opening#.',
				emphasis: ['tool'],
				register: 'interpretive',
			},
		],
	},
	{
		property: 'cylindrical.base',
		variants: [
			{
				template: 'Interpretive placeholder: #base#.',
				emphasis: ['tool'],
				register: 'interpretive',
			},
		],
	},
];
