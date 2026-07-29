/**
 * Observational register templates for the `cylindrical` primitive (doc 05 §5.3), roadmap 2GN.35.
 * See `index.ts` for the register's shared conventions (id shape, slot syntax, voice).
 */

import type { DescriptionTemplate } from '../../../types/description.ts';

export const CYLINDRICAL_TEMPLATES: readonly DescriptionTemplate[] = [
	{
		property: 'cylindrical.length',
		variants: [
			{
				template: '#length.a# tubular form.',
				emphasis: [],
				register: 'observational',
			},
		],
	},
	{
		property: 'cylindrical.diameter',
		variants: [
			{
				template: 'The bore is #diameter#.',
				emphasis: [],
				register: 'observational',
			},
		],
	},
	{
		property: 'cylindrical.wall',
		variants: [
			{
				template: 'The walls are #wall#.',
				emphasis: [],
				register: 'observational',
			},
		],
	},
	{
		property: 'cylindrical.opening',
		variants: [
			{
				template: 'The mouth is #opening#.',
				emphasis: [],
				register: 'observational',
			},
		],
	},
	{
		property: 'cylindrical.base',
		variants: [
			{
				template: 'The base is #base.a# form.',
				emphasis: [],
				register: 'observational',
			},
		],
	},
];
