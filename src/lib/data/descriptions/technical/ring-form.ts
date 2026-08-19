/**
 * Technical register templates for the `ring-form` primitive (doc 05 §5.3), roadmap 2GN.37.
 * See `index.ts` for the register's shared conventions (id shape, slot syntax, voice, emphasis).
 */

import type { DescriptionTemplate } from '../../../types/description.ts';

export const RING_FORM_TEMPLATES: readonly DescriptionTemplate[] = [
	{
		property: 'ring-form.diameter',
		variants: [
			{
				template: 'Formed to a #diameter# diameter around the mandrel or mould.',
				emphasis: [],
				register: 'technical',
			},
		],
	},
	{
		property: 'ring-form.crossSection',
		variants: [
			{
				template: 'The band was twisted after forming, a deliberate second working step.',
				emphasis: [],
				register: 'technical',
				condition: { values: ['twisted'] },
			},
			{
				template: 'The band was worked flat, hammered or cast to an even profile.',
				emphasis: [],
				register: 'technical',
				condition: { values: ['flat'] },
			},
			{
				template: 'The band was left in a round section.',
				emphasis: [],
				register: 'technical',
			},
		],
	},
	{
		property: 'ring-form.gap',
		variants: [
			{
				template: 'The terminals were worked to overlap, allowing the band to flex open.',
				emphasis: [],
				register: 'technical',
				condition: { values: ['overlapping'] },
			},
			{
				template: 'The terminals were left with an open gap, unjoined.',
				emphasis: [],
				register: 'technical',
				condition: { values: ['open'] },
			},
			{
				template: 'The terminals were joined closed, fixed at one diameter.',
				emphasis: [],
				register: 'technical',
			},
		],
	},
];
