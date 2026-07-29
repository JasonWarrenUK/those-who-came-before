/**
 * Observational register templates for the `bar-form` primitive (doc 05 §5.3), roadmap 2GN.35.
 * See `index.ts` for the register's shared conventions (id shape, slot syntax, voice).
 */

import type { DescriptionTemplate } from '../../../types/description.ts';

export const BAR_FORM_TEMPLATES: readonly DescriptionTemplate[] = [
	{
		property: 'bar-form.length',
		variants: [
			{
				template: '#length.a# solid stock.',
				emphasis: [],
				register: 'observational',
			},
		],
	},
	{
		property: 'bar-form.crossSection',
		variants: [
			{
				template: '#crossSection.a# cross-section.',
				emphasis: [],
				register: 'observational',
			},
		],
	},
	{
		property: 'bar-form.taper',
		variants: [
			{
				template: 'The form narrows with a #taper# taper.',
				emphasis: [],
				register: 'observational',
			},
		],
	},
	{
		// `taper: 'none'` (doc 05 §5.3) means the stock runs its full length untapered — a fixed-text
		// variant so that stays observable rather than dropping the clause like an unmeasured
		// property (see `bar-form.taper` above, selected by `describeProse` when `taper !== 'none'`).
		property: 'bar-form.taper.none',
		variants: [
			{
				template: 'The form is untapered.',
				emphasis: [],
				register: 'observational',
			},
		],
	},
];
