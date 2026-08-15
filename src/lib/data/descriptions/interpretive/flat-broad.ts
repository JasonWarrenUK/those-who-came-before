/**
 * Placeholder interpretive-register templates for the `flat-broad` primitive (roadmap 2GN.36).
 * See `index.ts` for why these are placeholders rather than real authoring.
 */

import type { DescriptionTemplate } from '../../../types/description.ts';

export const FLAT_BROAD_TEMPLATES: readonly DescriptionTemplate[] = [
	{
		property: 'flat-broad.shape',
		variants: [
			{
				template: 'Interpretive placeholder: #shape#.',
				emphasis: ['tool'],
				register: 'interpretive',
			},
		],
	},
	{
		property: 'flat-broad.size',
		variants: [
			{
				template: 'Interpretive placeholder: #size#.',
				emphasis: ['tool'],
				register: 'interpretive',
			},
		],
	},
	{
		property: 'flat-broad.thickness',
		variants: [
			{
				template: 'Interpretive placeholder: #thickness#.',
				emphasis: ['tool'],
				register: 'interpretive',
			},
		],
	},
	{
		property: 'flat-broad.curvature',
		variants: [
			{
				template: 'Interpretive placeholder: #curvature#.',
				emphasis: ['tool'],
				register: 'interpretive',
			},
		],
	},
	{
		property: 'flat-broad.perforation',
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
