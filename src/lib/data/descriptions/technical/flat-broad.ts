/**
 * Technical register templates for the `flat-broad` primitive (doc 05 §5.3), roadmap 2GN.37.
 * See `index.ts` for the register's shared conventions (id shape, slot syntax, voice, emphasis).
 */

import type { DescriptionTemplate } from '../../../types/description.ts';

export const FLAT_BROAD_TEMPLATES: readonly DescriptionTemplate[] = [
	{
		property: 'flat-broad.shape',
		variants: [
			{
				template: 'The crescent outline was cut with a curved stroke, not squared off.',
				emphasis: [],
				register: 'technical',
				condition: { values: ['crescent'] },
			},
			{
				template:
					'Left to an irregular outline, following the working stock rather than cut to a template.',
				emphasis: [],
				register: 'technical',
				condition: { values: ['irregular'] },
			},
			{
				template: 'Cut to #shape.a# outline.',
				emphasis: [],
				register: 'technical',
			},
		],
	},
	{
		property: 'flat-broad.size',
		variants: [
			{
				template:
					'Worked to a #size# overall size, more material removed than left in a smaller piece.',
				emphasis: [],
				register: 'technical',
			},
		],
	},
	{
		property: 'flat-broad.thickness',
		variants: [
			{
				template: 'Left thick, more material retained than a finer working would allow.',
				emphasis: [],
				register: 'technical',
				condition: { values: ['thick'] },
			},
			{
				template: 'Worked thin, close to the failure point for the material.',
				emphasis: [],
				register: 'technical',
				condition: { values: ['thin'] },
			},
			{
				template: 'Worked to a #thickness# thickness.',
				emphasis: [],
				register: 'technical',
			},
		],
	},
	{
		property: 'flat-broad.curvature',
		variants: [
			{
				template: 'Left perfectly flat, no curve worked into the surface.',
				emphasis: [],
				register: 'technical',
				condition: { values: ['flat'] },
			},
			{
				template: 'A deep curve was worked in, drawing the surface well out of plane.',
				emphasis: [],
				register: 'technical',
				condition: { values: ['deep'] },
			},
			{
				template: 'A shallow curve was worked into the surface.',
				emphasis: [],
				register: 'technical',
			},
		],
	},
	{
		property: 'flat-broad.perforation',
		variants: [
			{
				template: 'No perforation was worked in.',
				emphasis: [],
				register: 'technical',
				condition: { values: ['none'] },
			},
			{
				template: 'Multiple perforations were worked through, spaced along the piece.',
				emphasis: [],
				register: 'technical',
				condition: { values: ['multiple'] },
			},
			{
				template: 'A single perforation was worked through the material.',
				emphasis: [],
				register: 'technical',
			},
		],
	},
];
