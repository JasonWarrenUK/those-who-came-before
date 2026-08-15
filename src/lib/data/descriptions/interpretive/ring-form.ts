/**
 * Placeholder interpretive-register templates for the `ring-form` primitive (roadmap 2GN.36). See
 * `index.ts` for why these are placeholders rather than real authoring.
 */

import type { DescriptionTemplate } from '../../../types/description.ts';

export const RING_FORM_TEMPLATES: readonly DescriptionTemplate[] = [
	{
		property: 'ring-form.diameter',
		variants: [
			{
				template: 'Interpretive placeholder: #diameter#.',
				emphasis: ['tool'],
				register: 'interpretive',
			},
		],
	},
	{
		property: 'ring-form.crossSection',
		variants: [
			{
				template: 'Interpretive placeholder: #crossSection#.',
				emphasis: ['tool'],
				register: 'interpretive',
			},
		],
	},
	{
		property: 'ring-form.gap',
		variants: [
			{
				template: 'Interpretive placeholder: #gap#.',
				emphasis: ['tool'],
				register: 'interpretive',
			},
		],
	},
];
