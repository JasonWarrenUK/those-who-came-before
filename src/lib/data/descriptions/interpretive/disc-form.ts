/**
 * Interpretive register templates for the `disc-form` primitive (doc 05 §5.3), roadmap 2GN.36.
 * See `index.ts` for the register's shared conventions (id shape, slot syntax, voice, emphasis).
 */

import type { DescriptionTemplate } from '../../../types/description.ts';

export const DISC_FORM_TEMPLATES: readonly DescriptionTemplate[] = [
	{
		property: 'disc-form.diameter',
		variants: [
			{
				template: 'Large enough to be more display piece than tool.',
				emphasis: ['ornament', 'elite'],
				register: 'interpretive',
				condition: { values: ['large'] },
			},
			{
				template: 'Small — sized to be worn or carried, not set down.',
				emphasis: ['ornament', 'personal'],
				register: 'interpretive',
				condition: { values: ['small'] },
			},
			{
				template: 'A moderate diameter, workable in the hand.',
				emphasis: ['tool'],
				register: 'interpretive',
			},
		],
	},
	{
		property: 'disc-form.thickness',
		variants: [
			{
				template:
					'Thick enough to carry real weight — this was built to spin or weigh, not to be worn.',
				emphasis: ['tool'],
				register: 'interpretive',
				condition: { values: ['thick'] },
			},
			{
				template: 'Thin, light enough to hang without dragging on whatever it is fixed to.',
				emphasis: ['ornament'],
				register: 'interpretive',
				condition: { values: ['thin'] },
			},
			{
				template: 'An unremarkable, workable thickness.',
				emphasis: ['tool'],
				register: 'interpretive',
			},
		],
	},
	{
		property: 'disc-form.perforation',
		variants: [
			{
				template: 'A central perforation lets the disc turn true around an axle or spindle.',
				emphasis: ['tool'],
				register: 'interpretive',
				condition: { values: ['central'] },
			},
			{
				template: 'An off-centre perforation — this was meant to hang, not to spin evenly.',
				emphasis: ['ornament'],
				register: 'interpretive',
				condition: { values: ['off-centre'] },
			},
			{
				template: 'No perforation at all; nothing passes through this disc.',
				emphasis: ['tool'],
				register: 'interpretive',
				condition: { values: ['none'] },
			},
		],
	},
];
