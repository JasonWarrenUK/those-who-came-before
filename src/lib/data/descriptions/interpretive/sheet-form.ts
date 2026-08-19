/**
 * Interpretive register templates for the `sheet-form` primitive (doc 05 §5.3), roadmap 2GN.36.
 * See `index.ts` for the register's shared conventions (id shape, slot syntax, voice, emphasis).
 */

import type { DescriptionTemplate } from '../../../types/description.ts';

export const SHEET_FORM_TEMPLATES: readonly DescriptionTemplate[] = [
	{
		property: 'sheet-form.size',
		variants: [
			{
				template: 'Large enough to cover a real surface — armour, roofing, or a facing.',
				emphasis: ['military'],
				register: 'interpretive',
				condition: { values: ['large'] },
			},
			{
				template: 'Small — a fitting or patch rather than a covering.',
				emphasis: ['fastener'],
				register: 'interpretive',
				condition: { values: ['small'] },
			},
			{
				template: 'A moderate size, fitted to a specific purpose.',
				emphasis: ['tool'],
				register: 'interpretive',
			},
		],
	},
	{
		property: 'sheet-form.shape',
		variants: [
			{
				template: 'Fitted to a specific outline — this was shaped for one particular place.',
				emphasis: ['fastener'],
				register: 'interpretive',
				condition: { values: ['fitted'] },
			},
			{
				template: 'An irregular outline, cut to follow whatever it was meant to cover.',
				emphasis: ['tool'],
				register: 'interpretive',
				condition: { values: ['irregular'] },
			},
			{
				template: 'A regular, planned outline.',
				emphasis: ['tool'],
				register: 'interpretive',
			},
		],
	},
	{
		property: 'sheet-form.flexibility',
		variants: [
			{
				template: 'Rigid — this was meant to hold its shape under pressure, the way armour must.',
				emphasis: ['military'],
				register: 'interpretive',
				condition: { values: ['rigid'] },
			},
			{
				template: 'Flexible enough to wrap or fold around another form.',
				emphasis: ['fastener'],
				register: 'interpretive',
				condition: { values: ['flexible'] },
			},
			{
				template: 'Some give in the material, but not enough to fold freely.',
				emphasis: ['tool'],
				register: 'interpretive',
			},
		],
	},
];
