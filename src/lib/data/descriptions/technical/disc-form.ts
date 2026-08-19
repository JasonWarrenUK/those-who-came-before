/**
 * Technical register templates for the `disc-form` primitive (doc 05 §5.3), roadmap 2GN.37.
 * See `index.ts` for the register's shared conventions (id shape, slot syntax, voice, emphasis).
 */

import type { DescriptionTemplate } from '../../../types/description.ts';

export const DISC_FORM_TEMPLATES: readonly DescriptionTemplate[] = [
	{
		property: 'disc-form.diameter',
		variants: [
			{
				template: 'Turned or cut to a #diameter# diameter.',
				emphasis: [],
				register: 'technical',
			},
		],
	},
	{
		property: 'disc-form.thickness',
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
		property: 'disc-form.perforation',
		variants: [
			{
				template: 'No perforation was worked through the disc.',
				emphasis: [],
				register: 'technical',
				condition: { values: ['none'] },
			},
			{
				template:
					'A perforation was worked precisely on-centre, struck or drilled to a marked axis.',
				emphasis: [],
				register: 'technical',
				condition: { values: ['central'] },
			},
			{
				template: 'A perforation was worked off-centre.',
				emphasis: [],
				register: 'technical',
			},
		],
	},
];
