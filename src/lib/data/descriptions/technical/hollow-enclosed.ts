/**
 * Technical register templates for the `hollow-enclosed` primitive (doc 05 §5.3), roadmap 2GN.37.
 * See `index.ts` for the register's shared conventions (id shape, slot syntax, voice, emphasis).
 */

import type { DescriptionTemplate } from '../../../types/description.ts';

export const HOLLOW_ENCLOSED_TEMPLATES: readonly DescriptionTemplate[] = [
	{
		property: 'hollow-enclosed.shape',
		variants: [
			{
				template: 'Formed to a spherical body, worked evenly from every direction.',
				emphasis: [],
				register: 'technical',
				condition: { values: ['spherical'] },
			},
			{
				template: 'Built up to a box form, faces joined rather than worked from one mass.',
				emphasis: [],
				register: 'technical',
				condition: { values: ['box'] },
			},
			{
				template: 'Formed to #shape.a# volumetric form.',
				emphasis: [],
				register: 'technical',
			},
		],
	},
	{
		property: 'hollow-enclosed.size',
		variants: [
			{
				template: 'Formed to a #size# capacity, the working mass hollowed out accordingly.',
				emphasis: [],
				register: 'technical',
			},
		],
	},
	{
		property: 'hollow-enclosed.wall',
		variants: [
			{
				template:
					'The walls were left thick, more material retained than a finer working would allow.',
				emphasis: [],
				register: 'technical',
				condition: { values: ['thick'] },
			},
			{
				template: 'The walls were worked thin, close to the failure point for the material.',
				emphasis: [],
				register: 'technical',
				condition: { values: ['thin'] },
			},
			{
				template: 'The walls were worked to a #wall# thickness.',
				emphasis: [],
				register: 'technical',
			},
		],
	},
	{
		property: 'hollow-enclosed.opening',
		variants: [
			{
				template: 'The mouth was worked shut after the interior was formed, leaving no opening.',
				emphasis: [],
				register: 'technical',
				condition: { values: ['none'] },
			},
			{
				template: 'Left with a wide mouth, minimal material worked in to restrict access.',
				emphasis: [],
				register: 'technical',
				condition: { values: ['wide'] },
			},
			{
				template: 'The mouth was drawn in to a narrow opening.',
				emphasis: [],
				register: 'technical',
				condition: { values: ['narrow'] },
			},
			{
				template: 'The mouth was drawn nearly closed, left as a slit.',
				emphasis: [],
				register: 'technical',
				condition: { values: ['slit'] },
			},
		],
	},
	{
		property: 'hollow-enclosed.base',
		variants: [
			{
				template: 'A pedestal base was built up or turned separately and joined to the body.',
				emphasis: [],
				register: 'technical',
				condition: { values: ['pedestal'] },
			},
			{
				template: 'The base was cut or ground flat.',
				emphasis: [],
				register: 'technical',
				condition: { values: ['flat'] },
			},
			{
				template: 'The base was left rounded, unworked to a flat.',
				emphasis: [],
				register: 'technical',
			},
		],
	},
];
