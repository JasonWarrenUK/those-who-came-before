/**
 * Placeholder interpretive-register templates for the `sheet-form` primitive (roadmap 2GN.36).
 * See `index.ts` for why these are placeholders rather than real authoring.
 */

import type { DescriptionTemplate } from '../../../types/description.ts';

export const SHEET_FORM_TEMPLATES: readonly DescriptionTemplate[] = [
	{
		property: 'sheet-form.size',
		variants: [
			{
				template: 'Interpretive placeholder: #size#.',
				emphasis: ['tool'],
				register: 'interpretive',
			},
		],
	},
	{
		property: 'sheet-form.shape',
		variants: [
			{
				template: 'Interpretive placeholder: #shape#.',
				emphasis: ['tool'],
				register: 'interpretive',
			},
		],
	},
	{
		property: 'sheet-form.flexibility',
		variants: [
			{
				template: 'Interpretive placeholder: #flexibility#.',
				emphasis: ['tool'],
				register: 'interpretive',
			},
		],
	},
];
