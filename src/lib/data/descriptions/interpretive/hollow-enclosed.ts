/**
 * Placeholder interpretive-register templates for the `hollow-enclosed` primitive (roadmap
 * 2GN.36). See `index.ts` for why these are placeholders rather than real authoring.
 */

import type { DescriptionTemplate } from '../../../types/description.ts';

export const HOLLOW_ENCLOSED_TEMPLATES: readonly DescriptionTemplate[] = [
	{
		property: 'hollow-enclosed.shape',
		variants: [
			{
				template: 'Interpretive placeholder: #shape#.',
				emphasis: ['tool'],
				register: 'interpretive',
			},
		],
	},
	{
		property: 'hollow-enclosed.size',
		variants: [
			{
				template: 'Interpretive placeholder: #size#.',
				emphasis: ['tool'],
				register: 'interpretive',
			},
		],
	},
	{
		property: 'hollow-enclosed.wall',
		variants: [
			{
				template: 'Interpretive placeholder: #wall#.',
				emphasis: ['tool'],
				register: 'interpretive',
			},
		],
	},
	{
		property: 'hollow-enclosed.opening',
		variants: [
			{
				// `opening: 'none'` would otherwise vanish under `expand`'s none-drops-the-sentence rule
				// (mirrors observational/hollow-enclosed.ts's own handling of the same value).
				template: 'Interpretive placeholder: no opening.',
				emphasis: ['tool'],
				register: 'interpretive',
				condition: { values: ['none'] },
			},
			{
				template: 'Interpretive placeholder: #opening#.',
				emphasis: ['tool'],
				register: 'interpretive',
			},
		],
	},
	{
		property: 'hollow-enclosed.base',
		variants: [
			{
				template: 'Interpretive placeholder: #base#.',
				emphasis: ['tool'],
				register: 'interpretive',
			},
		],
	},
];
