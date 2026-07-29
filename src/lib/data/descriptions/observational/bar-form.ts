/**
 * Observational register templates for the `bar-form` primitive (doc 05 §5.3), roadmap 2GN.35.
 * See `index.ts` for the register's shared conventions (id shape, slot syntax, voice).
 */

import type { DescriptionTemplate } from '../../../types/description.ts';

export const BAR_FORM_TEMPLATES: readonly DescriptionTemplate[] = [
	{
		property: 'bar-form.length',
		variants: [
			{
				template: '#length.a# solid stock.',
				emphasis: [],
				register: 'observational',
			},
		],
	},
	{
		property: 'bar-form.crossSection',
		variants: [
			{
				template: '#crossSection.a# cross-section.',
				emphasis: [],
				register: 'observational',
			},
		],
	},
	{
		property: 'bar-form.taper',
		variants: [
			{
				template: 'The form narrows with a #taper# taper.',
				emphasis: [],
				register: 'observational',
			},
		],
	},
];
