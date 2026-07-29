/**
 * Observational register templates for the `sheet-form` primitive (doc 05 §5.3), roadmap 2GN.35.
 * See `index.ts` for the register's shared conventions (id shape, slot syntax, voice).
 */

import type { DescriptionTemplate } from '../../../types/description.ts';

export const SHEET_FORM_TEMPLATES: readonly DescriptionTemplate[] = [
	{
		property: 'sheet-form.size',
		variants: [
			{
				template: 'Overall size is #size#.',
				emphasis: [],
				register: 'observational',
			},
		],
	},
	{
		property: 'sheet-form.shape',
		variants: [
			{
				template: 'The outline is #shape#.',
				emphasis: [],
				register: 'observational',
			},
		],
	},
	{
		property: 'sheet-form.flexibility',
		variants: [
			{
				template: 'The material is #flexibility#.',
				emphasis: [],
				register: 'observational',
			},
		],
	},
];
