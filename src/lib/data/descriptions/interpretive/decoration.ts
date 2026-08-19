/**
 * Interpretive register templates for the sixteen decorative grammar terminals (doc 05 §8.2),
 * roadmap 2GN.36. See `index.ts` for the register's shared conventions (id shape, slot syntax,
 * voice, emphasis).
 *
 * Where the observational register names the process ("incised lines cut into the surface"), the
 * interpretive register names what the decoration signals — display, status, ritual meaning. Motif
 * variants (`decoration.<technique>.motif`) and material variants (`decoration.<technique>.material`)
 * carry the same shape and constraints as observational: only the fields `DecorativeLayer` actually
 * has (`motifRef`, `material`) are referenced.
 *
 * `emphasis`'s `elite`/`ceremonial` members are `RelativeTag`s (doc 05 §13.1's constraint): these
 * templates read a decorated surface as *signalling* elaboration, never asserting it as an intrinsic
 * property — the surrounding presentation, not this template, carries the culture-relative framing.
 */

import type { DescriptionTemplate } from '../../../types/description.ts';

export const DECORATION_TEMPLATES: readonly DescriptionTemplate[] = [
	// --- surface-treatment (doc 05 §8.2) --------------------------------------------------------
	{
		property: 'decoration.polish',
		variants: [
			{
				template: 'A polished finish speaks to time spent on appearance, not just function.',
				emphasis: ['ornament', 'artisanal'],
				register: 'interpretive',
			},
		],
	},
	{
		property: 'decoration.patina',
		variants: [
			{
				template: 'The patina reads as age and handling rather than deliberate finish.',
				emphasis: ['everyday'],
				register: 'interpretive',
			},
		],
	},
	{
		property: 'decoration.roughening',
		variants: [
			{
				template:
					'Deliberately roughened — a practical surface, built to be gripped rather than admired.',
				emphasis: ['tool', 'utilitarian'],
				register: 'interpretive',
			},
		],
	},
	{
		property: 'decoration.scoring',
		variants: [
			{
				template:
					'The scored lines may mark ownership, tally something, or simply key a surface for glue or grip.',
				emphasis: ['artisanal'],
				register: 'interpretive',
			},
		],
	},
	{
		property: 'decoration.engraving',
		variants: [
			{
				template:
					'Incised work like this takes time few would spend on a purely functional object.',
				emphasis: ['artisanal', 'elite'],
				register: 'interpretive',
			},
		],
	},
	{
		property: 'decoration.engraving.motif',
		variants: [
			{
				template:
					'The #motifRef# motif carries meaning beyond decoration — worth reading against what else this culture engraved.',
				emphasis: ['ritual'],
				register: 'interpretive',
			},
		],
	},
	{
		property: 'decoration.relief',
		variants: [
			{
				template:
					'Raised relief demands real skill and time — this was made to be looked at, not just used.',
				emphasis: ['elite', 'artisanal'],
				register: 'interpretive',
			},
		],
	},
	{
		property: 'decoration.relief.motif',
		variants: [
			{
				template:
					'The #motifRef# motif, raised rather than merely marked, was meant to be seen from a distance.',
				emphasis: ['ceremonial'],
				register: 'interpretive',
			},
		],
	},
	{
		property: 'decoration.painting',
		variants: [
			{
				template:
					'Applied pigment fades and wears — this was refreshed, or made for an occasion rather than daily use.',
				emphasis: ['ceremonial'],
				register: 'interpretive',
			},
		],
	},
	{
		property: 'decoration.painting.motif',
		variants: [
			{
				template: 'The painted #motifRef# motif was meant to be read, not just noticed.',
				emphasis: ['ritual'],
				register: 'interpretive',
			},
		],
	},
	{
		property: 'decoration.glaze',
		variants: [
			{
				template:
					'A fired glaze is a finishing step with no structural purpose — pure presentation.',
				emphasis: ['ornament', 'artisanal'],
				register: 'interpretive',
			},
		],
	},

	// --- applied-element (doc 05 §8.2) ----------------------------------------------------------
	{
		property: 'decoration.inlay',
		variants: [
			{
				template:
					'Setting material into the surface like this is slow, deliberate work — a statement piece, not a daily one.',
				emphasis: ['elite', 'artisanal'],
				register: 'interpretive',
			},
		],
	},
	{
		property: 'decoration.inlay.motif',
		variants: [
			{
				template: 'The inlaid #motifRef# motif was built to last as long as the object itself.',
				emphasis: ['ceremonial'],
				register: 'interpretive',
			},
		],
	},
	{
		property: 'decoration.inlay.material',
		variants: [
			{
				template:
					'Setting #material# into the surface was a deliberate choice of what to foreground.',
				emphasis: ['elite'],
				register: 'interpretive',
			},
		],
	},
	{
		property: 'decoration.overlay',
		variants: [
			{
				template:
					'A material laid over the surface changes how the piece reads without changing what it is underneath.',
				emphasis: ['elite'],
				register: 'interpretive',
			},
		],
	},
	{
		property: 'decoration.overlay.material',
		variants: [
			{
				template:
					'The #material# overlay was chosen for how it presents, not for what lies beneath it.',
				emphasis: ['elite'],
				register: 'interpretive',
			},
		],
	},
	{
		property: 'decoration.studs',
		variants: [
			{
				template:
					'Studs set into the surface catch the light and the eye — display as much as fastening.',
				emphasis: ['ornament'],
				register: 'interpretive',
			},
		],
	},
	{
		property: 'decoration.studs.material',
		variants: [
			{
				template: 'The #material# studs were chosen to stand out against the base form.',
				emphasis: ['elite'],
				register: 'interpretive',
			},
		],
	},
	{
		property: 'decoration.wire-wrapping',
		variants: [
			{
				template:
					'Wire wound this carefully around the form was chosen for how it catches light, not just how it holds.',
				emphasis: ['ornament'],
				register: 'interpretive',
			},
		],
	},
	{
		property: 'decoration.wire-wrapping.material',
		variants: [
			{
				template: 'The #material# wire reads as a deliberate choice of finish.',
				emphasis: ['ornament'],
				register: 'interpretive',
			},
		],
	},
	{
		property: 'decoration.gilding',
		variants: [
			{
				template:
					'A gilded surface is meant to be seen and recognised at a glance — a signal, not a finish.',
				emphasis: ['elite', 'ceremonial'],
				register: 'interpretive',
			},
		],
	},
	{
		property: 'decoration.gilding.material',
		variants: [
			{
				template:
					'The #material# gilding announces status before anything else about the piece does.',
				emphasis: ['elite'],
				register: 'interpretive',
			},
		],
	},

	// --- textile-element (doc 05 §8.2) ------------------------------------------------------------
	{
		property: 'decoration.wrapping',
		variants: [
			{
				template:
					'Material wound around the form softens the grip or dresses the piece for occasion.',
				emphasis: ['personal'],
				register: 'interpretive',
			},
		],
	},
	{
		property: 'decoration.wrapping.material',
		variants: [
			{
				template:
					'The #material# wrapping was chosen to suit how this piece was meant to be handled.',
				emphasis: ['personal'],
				register: 'interpretive',
			},
		],
	},
	{
		property: 'decoration.tassels',
		variants: [
			{
				template:
					'Tassels serve no structural purpose at all — they exist to move and to be noticed.',
				emphasis: ['ornament', 'ceremonial'],
				register: 'interpretive',
			},
		],
	},
	{
		property: 'decoration.beading',
		variants: [
			{
				template:
					'Beadwork like this is a personal, decorative touch rather than a functional necessity.',
				emphasis: ['ornament', 'personal'],
				register: 'interpretive',
			},
		],
	},
	{
		property: 'decoration.beading.material',
		variants: [
			{
				template:
					'The #material# beads were chosen for how they look worn, not for durability alone.',
				emphasis: ['ornament'],
				register: 'interpretive',
			},
		],
	},
];
