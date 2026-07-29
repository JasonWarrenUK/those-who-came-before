/**
 * Observational register templates for the `disc-form` primitive (doc 05 §5.3), roadmap 2GN.35.
 * See `index.ts` for the register's shared conventions (id shape, slot syntax, voice).
 */

import type { DescriptionTemplate } from '../../../types/description.ts';

export const DISC_FORM_TEMPLATES: readonly DescriptionTemplate[] = [
	{
		property: 'disc-form.diameter',
		variants: [
			{
				template: '#diameter.a# circular form.',
				emphasis: [],
				register: 'observational',
			},
		],
	},
	{
		property: 'disc-form.thickness',
		variants: [
			{
				template: '#thickness.a# cross-section.',
				emphasis: [],
				register: 'observational',
			},
		],
	},
	{
		property: 'disc-form.perforation',
		variants: [
			{
				template: 'The perforation is #perforation#.',
				emphasis: [],
				register: 'observational',
			},
		],
	},
];
