/**
 * Placeholder interpretive-register templates for the `disc-form` primitive (roadmap 2GN.36). See
 * `index.ts` for why these are placeholders rather than real authoring.
 */

import type { DescriptionTemplate } from '../../../types/description.ts';

export const DISC_FORM_TEMPLATES: readonly DescriptionTemplate[] = [
	{
		property: 'disc-form.diameter',
		variants: [
			{
				template: 'Interpretive placeholder: #diameter#.',
				emphasis: ['tool'],
				register: 'interpretive',
			},
		],
	},
	{
		property: 'disc-form.thickness',
		variants: [
			{
				template: 'Interpretive placeholder: #thickness#.',
				emphasis: ['tool'],
				register: 'interpretive',
			},
		],
	},
	{
		property: 'disc-form.perforation',
		variants: [
			{
				// `perforation: 'none'` would otherwise vanish under `expand`'s none-drops-the-sentence rule.
				template: 'Interpretive placeholder: no perforation.',
				emphasis: ['tool'],
				register: 'interpretive',
				condition: { values: ['none'] },
			},
			{
				template: 'Interpretive placeholder: #perforation#.',
				emphasis: ['tool'],
				register: 'interpretive',
			},
		],
	},
];
