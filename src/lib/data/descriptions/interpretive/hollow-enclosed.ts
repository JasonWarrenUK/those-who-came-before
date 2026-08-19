/**
 * Interpretive register templates for the `hollow-enclosed` primitive (doc 05 §5.3), roadmap
 * 2GN.36. See `index.ts` for the register's shared conventions (id shape, slot syntax, voice,
 * emphasis).
 */

import type { DescriptionTemplate } from '../../../types/description.ts';

export const HOLLOW_ENCLOSED_TEMPLATES: readonly DescriptionTemplate[] = [
	{
		property: 'hollow-enclosed.shape',
		variants: [
			{
				template:
					'A spherical body holds its contents evenly, resisting no direction over another.',
				emphasis: ['container'],
				register: 'interpretive',
				condition: { values: ['spherical'] },
			},
			{
				template: 'A box form, built for stacking or fitting alongside others like it.',
				emphasis: ['container'],
				register: 'interpretive',
				condition: { values: ['box'] },
			},
			{
				template: 'The form is built around holding something.',
				emphasis: ['container'],
				register: 'interpretive',
			},
		],
	},
	{
		property: 'hollow-enclosed.size',
		variants: [
			{
				template: 'Large enough to hold a real quantity, not a token amount.',
				emphasis: ['domestic'],
				register: 'interpretive',
				condition: { values: ['large'] },
			},
			{
				template: 'Small — this holds a personal amount, not a household ration.',
				emphasis: ['personal'],
				register: 'interpretive',
				condition: { values: ['small'] },
			},
			{
				template: 'A capacity suited to everyday use.',
				emphasis: ['domestic'],
				register: 'interpretive',
			},
		],
	},
	{
		property: 'hollow-enclosed.wall',
		variants: [
			{
				template: 'Thick walls protect whatever is kept inside from a hard knock.',
				emphasis: ['container'],
				register: 'interpretive',
				condition: { values: ['thick'] },
			},
			{
				template: 'Thin walls — fine work, but not built to withstand rough handling.',
				emphasis: ['artisanal'],
				register: 'interpretive',
				condition: { values: ['thin'] },
			},
			{
				template: 'Walls of an ordinary, serviceable thickness.',
				emphasis: ['container'],
				register: 'interpretive',
			},
		],
	},
	{
		property: 'hollow-enclosed.opening',
		variants: [
			{
				template: 'No opening at all — whatever is inside was sealed there for good.',
				emphasis: ['votive', 'funerary'],
				register: 'interpretive',
				condition: { values: ['none'] },
			},
			{
				template: 'A wide mouth invites frequent access — this was meant to be opened and used.',
				emphasis: ['domestic'],
				register: 'interpretive',
				condition: { values: ['wide'] },
			},
			{
				template: 'A narrow mouth restricts what can pass, deliberately.',
				emphasis: ['container'],
				register: 'interpretive',
				condition: { values: ['narrow'] },
			},
			{
				template: 'A mere slit — access here was never meant to be easy.',
				emphasis: ['ritual'],
				register: 'interpretive',
				condition: { values: ['slit'] },
			},
		],
	},
	{
		property: 'hollow-enclosed.base',
		variants: [
			{
				template: 'A pedestal base sets the piece apart, raised above the surface it sits on.',
				emphasis: ['ceremonial', 'elite'],
				register: 'interpretive',
				condition: { values: ['pedestal'] },
			},
			{
				template: 'A flat base — practical, meant to stand without ceremony.',
				emphasis: ['everyday'],
				register: 'interpretive',
				condition: { values: ['flat'] },
			},
			{
				template: 'A rounded base, unconcerned with standing on its own.',
				emphasis: ['container'],
				register: 'interpretive',
			},
		],
	},
];
