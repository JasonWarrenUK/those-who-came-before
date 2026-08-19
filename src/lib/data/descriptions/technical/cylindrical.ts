/**
 * Technical register templates for the `cylindrical` primitive (doc 05 §5.3), roadmap 2GN.37.
 * See `index.ts` for the register's shared conventions (id shape, slot syntax, voice, emphasis).
 */

import type { DescriptionTemplate } from '../../../types/description.ts';

export const CYLINDRICAL_TEMPLATES: readonly DescriptionTemplate[] = [
	{
		property: 'cylindrical.length',
		variants: [
			{
				template: 'Formed to a #length# length along the axis of the bore.',
				emphasis: [],
				register: 'technical',
			},
		],
	},
	{
		property: 'cylindrical.diameter',
		variants: [
			{
				template:
					'The bore was worked to a #diameter# diameter, sized against whatever it was meant to take.',
				emphasis: [],
				register: 'technical',
			},
		],
	},
	{
		property: 'cylindrical.wall',
		variants: [
			{
				template: 'Left thick — more material retained than a lighter working would allow.',
				emphasis: [],
				register: 'technical',
				condition: { values: ['thick'] },
			},
			{
				template: 'Worked thin, close to the working limit of the material before failure.',
				emphasis: [],
				register: 'technical',
				condition: { values: ['thin'] },
			},
			{
				template: 'Worked to a #wall# wall thickness.',
				emphasis: [],
				register: 'technical',
			},
		],
	},
	{
		property: 'cylindrical.opening',
		variants: [
			{
				template: 'Closed off entirely — the mouth was worked shut after the bore was formed.',
				emphasis: [],
				register: 'technical',
				condition: { values: ['closed'] },
			},
			{
				template: 'Left fully open, the bore unrestricted at the mouth.',
				emphasis: [],
				register: 'technical',
				condition: { values: ['open'] },
			},
			{
				template: 'The mouth was worked to a restricted opening, narrower than the bore behind it.',
				emphasis: [],
				register: 'technical',
			},
		],
	},
	{
		property: 'cylindrical.base',
		variants: [
			{
				template: 'The base was drawn to a point, material worked down from all sides.',
				emphasis: [],
				register: 'technical',
				condition: { values: ['pointed'] },
			},
			{
				template: 'The base was left flat, cut or ground square to the axis.',
				emphasis: [],
				register: 'technical',
				condition: { values: ['flat'] },
			},
			{
				template: 'The base was worked to a rounded finish.',
				emphasis: [],
				register: 'technical',
			},
		],
	},
];
