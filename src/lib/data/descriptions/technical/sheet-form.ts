/**
 * Technical register templates for the `sheet-form` primitive (doc 05 §5.3), roadmap 2GN.37.
 * See `index.ts` for the register's shared conventions (id shape, slot syntax, voice, emphasis).
 */

import type { DescriptionTemplate } from '../../../types/description.ts';

export const SHEET_FORM_TEMPLATES: readonly DescriptionTemplate[] = [
	{
		property: 'sheet-form.size',
		variants: [
			{
				template: 'Worked out to a #size# overall size.',
				emphasis: [],
				register: 'technical',
			},
		],
	},
	{
		property: 'sheet-form.shape',
		variants: [
			{
				template:
					'Cut and fitted to a specific outline, trimmed against whatever it was meant to cover.',
				emphasis: [],
				register: 'technical',
				condition: { values: ['fitted'] },
			},
			{
				template:
					'Left to an irregular outline, following the working stock rather than cut to a template.',
				emphasis: [],
				register: 'technical',
				condition: { values: ['irregular'] },
			},
			{
				template: 'Cut to a #shape# outline.',
				emphasis: [],
				register: 'technical',
			},
		],
	},
	{
		property: 'sheet-form.flexibility',
		variants: [
			{
				template: 'Worked or hardened to a rigid finish, holding its shape without support.',
				emphasis: [],
				register: 'technical',
				condition: { values: ['rigid'] },
			},
			{
				template: 'Left flexible, thin or soft enough to fold or wrap without cracking.',
				emphasis: [],
				register: 'technical',
				condition: { values: ['flexible'] },
			},
			{
				template: 'Worked to a semi-flexible finish, some give but not enough to fold freely.',
				emphasis: [],
				register: 'technical',
			},
		],
	},
];
