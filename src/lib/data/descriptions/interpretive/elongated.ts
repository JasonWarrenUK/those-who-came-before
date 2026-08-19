/**
 * Interpretive register templates for the `elongated` primitive (doc 05 §5.3), roadmap 2GN.36.
 * See `index.ts` for the register's shared conventions (id shape, slot syntax, voice, emphasis).
 *
 * Elongated forms carry five parameters — length, crossSection, taper, edge, point — the same set
 * the observational register renders as pure measurement. Here the same geometry is read for what
 * it affords: a long body with a sharp point and a gradual taper reads as reach and penetration
 * (`weapon`), a short one as a hand tool (`tool`), a double edge with no taper as something made to
 * be worn rather than wielded (`ornament`) once the material context rules out a cutting edge.
 */

import type { DescriptionTemplate } from '../../../types/description.ts';

export const ELONGATED_TEMPLATES: readonly DescriptionTemplate[] = [
	{
		property: 'elongated.length',
		variants: [
			{
				template: 'Long enough to grant real reach.',
				emphasis: ['weapon'],
				register: 'interpretive',
				condition: { values: ['long'] },
			},
			{
				template: 'Short enough to sit comfortably in one hand.',
				emphasis: ['tool'],
				register: 'interpretive',
				condition: { values: ['short'] },
			},
			{
				template: 'A length suited to close, controlled work.',
				emphasis: ['tool'],
				register: 'interpretive',
			},
		],
	},
	{
		property: 'elongated.crossSection',
		variants: [
			{
				template: 'The diamond section stiffens the blade against a hard strike.',
				emphasis: ['weapon'],
				register: 'interpretive',
				condition: { values: ['diamond'] },
			},
			{
				template: 'A rounded section, comfortable to grip but offering little bite.',
				emphasis: ['tool'],
				register: 'interpretive',
				condition: { values: ['round'] },
			},
			{
				template: 'The section favours control over force.',
				emphasis: ['tool'],
				register: 'interpretive',
			},
		],
	},
	{
		property: 'elongated.taper',
		variants: [
			{
				template: 'An abrupt taper concentrates force right at the tip.',
				emphasis: ['weapon'],
				register: 'interpretive',
				condition: { values: ['abrupt'] },
			},
			{
				template: 'No taper at all — the body was never meant to come to a point.',
				emphasis: ['ornament'],
				register: 'interpretive',
				condition: { values: ['none'] },
			},
			{
				template: 'A gradual taper balances the form along its length.',
				emphasis: ['tool'],
				register: 'interpretive',
			},
		],
	},
	{
		property: 'elongated.edge',
		variants: [
			{
				template:
					'A double edge cuts on the draw as readily as the thrust — built for combat, not craft.',
				emphasis: ['weapon', 'military'],
				register: 'interpretive',
				condition: { values: ['double'] },
			},
			{
				template: 'A single edge, the kind a craftsperson trusts for repeated, controlled cuts.',
				emphasis: ['tool', 'artisanal'],
				register: 'interpretive',
				condition: { values: ['single'] },
			},
			{
				template: 'No edge at all — whatever this form does, it is not cutting.',
				emphasis: ['ornament'],
				register: 'interpretive',
				condition: { values: ['none'] },
			},
		],
	},
	{
		property: 'elongated.point',
		variants: [
			{
				template: 'The sharp point is built to penetrate.',
				emphasis: ['weapon'],
				register: 'interpretive',
				condition: { values: ['sharp'] },
			},
			{
				template: 'A blunt terminus — this end was never meant to pierce anything.',
				emphasis: ['tool'],
				register: 'interpretive',
				condition: { values: ['blunt'] },
			},
			{
				template: 'No point to speak of; the form does its work along its length, not at its end.',
				emphasis: ['tool'],
				register: 'interpretive',
				condition: { values: ['none'] },
			},
		],
	},
];
