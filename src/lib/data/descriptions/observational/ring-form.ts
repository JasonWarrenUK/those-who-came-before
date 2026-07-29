/**
 * Observational register templates for the `ring-form` primitive (doc 05 §5.3), roadmap 2GN.35.
 * See `index.ts` for the register's shared conventions (id shape, slot syntax, voice).
 */

import type { DescriptionTemplate } from '../../../types/description.ts';

export const RING_FORM_TEMPLATES: readonly DescriptionTemplate[] = [
	{
		property: 'ring-form.diameter',
		variants: [
			{
				template: '#diameter.a# annular form.',
				emphasis: [],
				register: 'observational',
			},
		],
	},
	{
		property: 'ring-form.crossSection',
		variants: [
			{
				template: 'The band is #crossSection# in section.',
				emphasis: [],
				register: 'observational',
			},
		],
	},
	{
		property: 'ring-form.gap',
		variants: [
			{
				template: 'The terminals are #gap#.',
				emphasis: [],
				register: 'observational',
			},
		],
	},
];
