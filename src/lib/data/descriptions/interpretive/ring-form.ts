/**
 * Interpretive register templates for the `ring-form` primitive (doc 05 §5.3), roadmap 2GN.36.
 * See `index.ts` for the register's shared conventions (id shape, slot syntax, voice, emphasis).
 */

import type { DescriptionTemplate } from '../../../types/description.ts';

export const RING_FORM_TEMPLATES: readonly DescriptionTemplate[] = [
	{
		property: 'ring-form.diameter',
		variants: [
			{
				template: 'Large enough to sit around a wrist or neck.',
				emphasis: ['ornament', 'personal'],
				register: 'interpretive',
				condition: { values: ['large'] },
			},
			{
				template: 'Small — a finger ring, or something sized smaller still.',
				emphasis: ['ornament', 'personal'],
				register: 'interpretive',
				condition: { values: ['small'] },
			},
			{
				template: 'A middling diameter, workable for several kinds of wearing.',
				emphasis: ['ornament'],
				register: 'interpretive',
			},
		],
	},
	{
		property: 'ring-form.crossSection',
		variants: [
			{
				template: 'A twisted band shows deliberate, decorative working — not a plain fastening.',
				emphasis: ['ornament', 'artisanal'],
				register: 'interpretive',
				condition: { values: ['twisted'] },
			},
			{
				template: 'A flat band sits comfortably against skin or fabric.',
				emphasis: ['ornament'],
				register: 'interpretive',
				condition: { values: ['flat'] },
			},
			{
				template: 'A plain rounded band, unremarkable in its section.',
				emphasis: ['ornament'],
				register: 'interpretive',
			},
		],
	},
	{
		property: 'ring-form.gap',
		variants: [
			{
				template: 'Overlapping terminals let the band flex open to slip over a wrist.',
				emphasis: ['ornament', 'personal'],
				register: 'interpretive',
				condition: { values: ['overlapping'] },
			},
			{
				template: 'An open gap — this was made to be worked wider or narrower after casting.',
				emphasis: ['ornament'],
				register: 'interpretive',
				condition: { values: ['open'] },
			},
			{
				template: 'A closed loop, fixed at one size for good.',
				emphasis: ['fastener'],
				register: 'interpretive',
			},
		],
	},
];
