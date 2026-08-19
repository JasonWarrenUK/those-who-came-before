/**
 * Technical register templates for the `elongated` primitive (doc 05 §5.3), roadmap 2GN.37.
 * See `index.ts` for the register's shared conventions (id shape, slot syntax, voice, emphasis).
 */

import type { DescriptionTemplate } from '../../../types/description.ts';

export const ELONGATED_TEMPLATES: readonly DescriptionTemplate[] = [
	{
		property: 'elongated.length',
		variants: [
			{
				template: 'Drawn out to a #length# length, more stock removed than left standing.',
				emphasis: [],
				register: 'technical',
			},
		],
	},
	{
		property: 'elongated.crossSection',
		variants: [
			{
				template:
					'Ground or filed to a diamond section, four facets meeting along the full length.',
				emphasis: [],
				register: 'technical',
				condition: { values: ['diamond'] },
			},
			{
				template: 'Left in a round section — the fastest working profile to true.',
				emphasis: [],
				register: 'technical',
				condition: { values: ['round'] },
			},
			{
				template: 'Worked to #crossSection.a# section.',
				emphasis: [],
				register: 'technical',
			},
		],
	},
	{
		property: 'elongated.taper',
		variants: [
			{
				template: 'No taper worked in — the stock was left its full width along the length.',
				emphasis: [],
				register: 'technical',
				condition: { values: ['none'] },
			},
			{
				template:
					'An abrupt taper was struck in close to the terminus, removing material in a few decisive passes.',
				emphasis: [],
				register: 'technical',
				condition: { values: ['abrupt'] },
			},
			{
				template: 'A gradual taper was worked in over the length, drawing material off evenly.',
				emphasis: [],
				register: 'technical',
			},
		],
	},
	{
		property: 'elongated.edge',
		variants: [
			{
				template: 'No edge was ground in at all.',
				emphasis: [],
				register: 'technical',
				condition: { values: ['none'] },
			},
			{
				template:
					'Both long faces were ground to meet, a bevel worked on each side of the double edge.',
				emphasis: [],
				register: 'technical',
				condition: { values: ['double'] },
			},
			{
				template: 'A single bevel was ground along one face to raise the edge.',
				emphasis: [],
				register: 'technical',
			},
		],
	},
	{
		property: 'elongated.point',
		variants: [
			{
				template: 'No point was worked at the terminus.',
				emphasis: [],
				register: 'technical',
				condition: { values: ['none'] },
			},
			{
				template: 'The terminus was ground down from multiple facets to raise a sharp point.',
				emphasis: [],
				register: 'technical',
				condition: { values: ['sharp'] },
			},
			{
				template: 'The terminus was left blunt, with no fine point worked in.',
				emphasis: [],
				register: 'technical',
			},
		],
	},
];
