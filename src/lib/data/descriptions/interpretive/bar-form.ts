/**
 * Interpretive register templates for the `bar-form` primitive (doc 05 §5.3), roadmap 2GN.36.
 * See `index.ts` for the register's shared conventions (id shape, slot syntax, voice, emphasis).
 */

import type { DescriptionTemplate } from '../../../types/description.ts';

export const BAR_FORM_TEMPLATES: readonly DescriptionTemplate[] = [
	{
		property: 'bar-form.length',
		variants: [
			{
				template: 'Long stock, more raw material than finished piece.',
				emphasis: ['utilitarian'],
				register: 'interpretive',
				condition: { values: ['long'] },
			},
			{
				template: 'Short — worked down to a size ready for its final purpose.',
				emphasis: ['tool'],
				register: 'interpretive',
				condition: { values: ['short'] },
			},
			{
				template: 'A workable, middling length of stock.',
				emphasis: ['tool'],
				register: 'interpretive',
			},
		],
	},
	{
		property: 'bar-form.crossSection',
		variants: [
			{
				template: 'A hexagonal section resists twisting under a hard grip.',
				emphasis: ['tool'],
				register: 'interpretive',
				condition: { values: ['hexagonal'] },
			},
			{
				template: 'A square section, easy to true and easy to work from.',
				emphasis: ['artisanal'],
				register: 'interpretive',
				condition: { values: ['square'] },
			},
			{
				template: 'A plain rounded section.',
				emphasis: ['tool'],
				register: 'interpretive',
			},
		],
	},
	{
		property: 'bar-form.taper',
		variants: [
			{
				template: 'Untapered along its whole length — this is stock, not a finished point.',
				emphasis: ['utilitarian'],
				register: 'interpretive',
				condition: { values: ['none'] },
			},
			{
				template: 'Tapered at both ends, worked toward a purpose from either side.',
				emphasis: ['tool'],
				register: 'interpretive',
				condition: { values: ['both-ends'] },
			},
			{
				template: 'A single-end taper marks this as the working end of a tool.',
				emphasis: ['tool'],
				register: 'interpretive',
			},
		],
	},
];
