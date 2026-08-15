/**
 * Placeholder interpretive-register templates for the `bar-form` primitive (roadmap 2GN.36). See
 * `index.ts` for why these are placeholders rather than real authoring.
 */

import type { DescriptionTemplate } from '../../../types/description.ts';

export const BAR_FORM_TEMPLATES: readonly DescriptionTemplate[] = [
	{
		property: 'bar-form.length',
		variants: [
			{
				template: 'Interpretive placeholder: #length#.',
				emphasis: ['tool'],
				register: 'interpretive',
			},
		],
	},
	{
		property: 'bar-form.crossSection',
		variants: [
			{
				template: 'Interpretive placeholder: #crossSection#.',
				emphasis: ['tool'],
				register: 'interpretive',
			},
		],
	},
	{
		property: 'bar-form.taper',
		variants: [
			{
				// `taper: 'none'` would otherwise vanish under `expand`'s none-drops-the-sentence rule.
				template: 'Interpretive placeholder: no taper.',
				emphasis: ['tool'],
				register: 'interpretive',
				condition: { values: ['none'] },
			},
			{
				template: 'Interpretive placeholder: #taper#.',
				emphasis: ['tool'],
				register: 'interpretive',
			},
		],
	},
];
