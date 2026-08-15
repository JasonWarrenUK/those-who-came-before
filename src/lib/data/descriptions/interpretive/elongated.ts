/**
 * Placeholder interpretive-register templates for the `elongated` primitive (roadmap 2GN.36). See
 * `index.ts` for why these are placeholders rather than real authoring.
 */

import type { DescriptionTemplate } from '../../../types/description.ts';

export const ELONGATED_TEMPLATES: readonly DescriptionTemplate[] = [
	{
		property: 'elongated.length',
		variants: [
			{
				template: 'Interpretive placeholder: #length#.',
				emphasis: ['tool'],
				register: 'interpretive',
			},
		],
	},
	{
		property: 'elongated.crossSection',
		variants: [
			{
				template: 'Interpretive placeholder: #crossSection#.',
				emphasis: ['tool'],
				register: 'interpretive',
			},
		],
	},
	{
		property: 'elongated.taper',
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
	{
		property: 'elongated.edge',
		variants: [
			{
				// `edge: 'none'` would otherwise vanish under `expand`'s none-drops-the-sentence rule.
				template: 'Interpretive placeholder: no edge.',
				emphasis: ['tool'],
				register: 'interpretive',
				condition: { values: ['none'] },
			},
			{
				template: 'Interpretive placeholder: #edge#.',
				emphasis: ['tool'],
				register: 'interpretive',
			},
		],
	},
	{
		property: 'elongated.point',
		variants: [
			{
				// `point: 'none'` would otherwise vanish under `expand`'s none-drops-the-sentence rule.
				template: 'Interpretive placeholder: no point.',
				emphasis: ['tool'],
				register: 'interpretive',
				condition: { values: ['none'] },
			},
			{
				template: 'Interpretive placeholder: #point#.',
				emphasis: ['tool'],
				register: 'interpretive',
			},
		],
	},
];
