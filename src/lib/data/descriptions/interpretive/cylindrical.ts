/**
 * Interpretive register templates for the `cylindrical` primitive (doc 05 §5.3), roadmap 2GN.36.
 * See `index.ts` for the register's shared conventions (id shape, slot syntax, voice, emphasis).
 */

import type { DescriptionTemplate } from '../../../types/description.ts';

export const CYLINDRICAL_TEMPLATES: readonly DescriptionTemplate[] = [
	{
		property: 'cylindrical.length',
		variants: [
			{
				template: 'Long enough to serve as a fitting rather than a small container.',
				emphasis: ['fastener'],
				register: 'interpretive',
				condition: { values: ['long'] },
			},
			{
				template: 'Short — the proportions of something meant to sit in the hand or on a socket.',
				emphasis: ['tool'],
				register: 'interpretive',
				condition: { values: ['short'] },
			},
			{
				template: 'A middling length, equally at home held or mounted.',
				emphasis: ['tool'],
				register: 'interpretive',
			},
		],
	},
	{
		property: 'cylindrical.diameter',
		variants: [
			{
				template: 'A wide bore, the kind that takes a substantial shaft or handle.',
				emphasis: ['tool'],
				register: 'interpretive',
				condition: { values: ['wide'] },
			},
			{
				template: 'A narrow bore, sized for something slender.',
				emphasis: ['fastener'],
				register: 'interpretive',
				condition: { values: ['narrow'] },
			},
			{
				template: 'A bore of ordinary proportions.',
				emphasis: ['tool'],
				register: 'interpretive',
			},
		],
	},
	{
		property: 'cylindrical.wall',
		variants: [
			{
				template: 'Thick walls suggest something built to take a hard socketed strike.',
				emphasis: ['tool', 'weapon'],
				register: 'interpretive',
				condition: { values: ['thick'] },
			},
			{
				template: 'Thin walls — light, and not built to bear much load.',
				emphasis: ['ornament'],
				register: 'interpretive',
				condition: { values: ['thin'] },
			},
			{
				template: 'Walls of an ordinary, workmanlike thickness.',
				emphasis: ['tool'],
				register: 'interpretive',
			},
		],
	},
	{
		property: 'cylindrical.opening',
		variants: [
			{
				template: 'Sealed shut — whatever this held was never meant to be reached again casually.',
				emphasis: ['container'],
				register: 'interpretive',
				condition: { values: ['closed'] },
			},
			{
				template: 'Open at the mouth, ready to take a shaft or handle.',
				emphasis: ['tool'],
				register: 'interpretive',
				condition: { values: ['open'] },
			},
			{
				template: 'A restricted mouth controls what can pass in or out.',
				emphasis: ['container'],
				register: 'interpretive',
			},
		],
	},
	{
		property: 'cylindrical.base',
		variants: [
			{
				template: 'A pointed base is built to be driven into something, not set down.',
				emphasis: ['tool', 'weapon'],
				register: 'interpretive',
				condition: { values: ['pointed'] },
			},
			{
				template: 'A flat base lets the form stand on its own.',
				emphasis: ['container'],
				register: 'interpretive',
				condition: { values: ['flat'] },
			},
			{
				template: 'A rounded base, unconcerned with standing upright.',
				emphasis: ['tool'],
				register: 'interpretive',
			},
		],
	},
];
