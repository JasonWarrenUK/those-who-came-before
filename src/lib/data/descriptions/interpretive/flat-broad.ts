/**
 * Interpretive register templates for the `flat-broad` primitive (doc 05 §5.3), roadmap 2GN.36.
 * See `index.ts` for the register's shared conventions (id shape, slot syntax, voice, emphasis).
 */

import type { DescriptionTemplate } from '../../../types/description.ts';

export const FLAT_BROAD_TEMPLATES: readonly DescriptionTemplate[] = [
	{
		property: 'flat-broad.shape',
		variants: [
			{
				template: 'The crescent outline is built to cut with a drawing stroke.',
				emphasis: ['tool', 'weapon'],
				register: 'interpretive',
				condition: { values: ['crescent'] },
			},
			{
				template: 'An irregular outline, shaped to a purpose rather than a template.',
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
		property: 'flat-broad.size',
		variants: [
			{
				template: 'Large enough to work a real surface, not a delicate one.',
				emphasis: ['tool'],
				register: 'interpretive',
				condition: { values: ['large'] },
			},
			{
				template: 'Small — sized for fine, close work.',
				emphasis: ['artisanal'],
				register: 'interpretive',
				condition: { values: ['small'] },
			},
			{
				template: 'A serviceable, middling size.',
				emphasis: ['tool'],
				register: 'interpretive',
			},
		],
	},
	{
		property: 'flat-broad.thickness',
		variants: [
			{
				template: 'Thick enough to withstand real pressure without flexing.',
				emphasis: ['tool'],
				register: 'interpretive',
				condition: { values: ['thick'] },
			},
			{
				template: 'Thin — this form was never meant to bear load.',
				emphasis: ['ornament'],
				register: 'interpretive',
				condition: { values: ['thin'] },
			},
			{
				template: 'A workable, moderate thickness.',
				emphasis: ['tool'],
				register: 'interpretive',
			},
		],
	},
	{
		property: 'flat-broad.curvature',
		variants: [
			{
				template: 'A deep curve is built to follow a rounded surface, not a flat one.',
				emphasis: ['tool'],
				register: 'interpretive',
				condition: { values: ['deep'] },
			},
			{
				template: 'Perfectly flat, suited to a level working surface.',
				emphasis: ['tool'],
				register: 'interpretive',
				condition: { values: ['flat'] },
			},
			{
				template: 'A shallow curve, close enough to flat for most purposes.',
				emphasis: ['tool'],
				register: 'interpretive',
			},
		],
	},
	{
		property: 'flat-broad.perforation',
		variants: [
			{
				template: 'Multiple perforations, spaced for stitching or fixing to something else.',
				emphasis: ['fastener'],
				register: 'interpretive',
				condition: { values: ['multiple'] },
			},
			{
				template: 'A single perforation — enough to hang or suspend the piece.',
				emphasis: ['ornament'],
				register: 'interpretive',
				condition: { values: ['single'] },
			},
			{
				template: 'No perforation; the piece stands complete on its own.',
				emphasis: ['tool'],
				register: 'interpretive',
				condition: { values: ['none'] },
			},
		],
	},
];
