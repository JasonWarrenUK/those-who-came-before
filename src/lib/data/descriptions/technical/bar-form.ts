/**
 * Technical register templates for the `bar-form` primitive (doc 05 §5.3), roadmap 2GN.37.
 * See `index.ts` for the register's shared conventions (id shape, slot syntax, voice, emphasis).
 */

import type { DescriptionTemplate } from '../../../types/description.ts';

export const BAR_FORM_TEMPLATES: readonly DescriptionTemplate[] = [
	{
		property: 'bar-form.length',
		variants: [
			{
				template: 'Drawn out to a #length# length of solid stock.',
				emphasis: [],
				register: 'technical',
			},
		],
	},
	{
		property: 'bar-form.crossSection',
		variants: [
			{
				template: 'Worked to a hexagonal section, each facet struck or filed to meet the next.',
				emphasis: [],
				register: 'technical',
				condition: { values: ['hexagonal'] },
			},
			{
				template: 'Worked to a square section, faces trued against each other.',
				emphasis: [],
				register: 'technical',
				condition: { values: ['square'] },
			},
			{
				template: 'Left in a round section — the fastest profile to draw down.',
				emphasis: [],
				register: 'technical',
			},
		],
	},
	{
		property: 'bar-form.taper',
		variants: [
			{
				template: 'No taper was worked in — the stock was left its full width along the length.',
				emphasis: [],
				register: 'technical',
				condition: { values: ['none'] },
			},
			{
				template: 'A taper was worked from both ends, material drawn down toward the centre.',
				emphasis: [],
				register: 'technical',
				condition: { values: ['both-ends'] },
			},
			{
				template: 'A taper was worked from a single end, material drawn down toward that terminus.',
				emphasis: [],
				register: 'technical',
			},
		],
	},
];
