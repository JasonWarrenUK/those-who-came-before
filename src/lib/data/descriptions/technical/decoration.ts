/**
 * Technical register templates for the sixteen decorative grammar terminals (doc 05 §8.2),
 * roadmap 2GN.37. See `index.ts` for the register's shared conventions (id shape, slot syntax,
 * voice, emphasis).
 *
 * Where observational names the finished state ("the surface has been polished to a smooth
 * finish") and interpretive names what it signals, technical names the process and the skill it
 * took — abrasive grades, working sequence, what a slip means for the next step. Motif variants
 * (`decoration.<technique>.motif`) and material variants (`decoration.<technique>.material`) carry
 * the same shape and constraints as observational: only the fields `DecorativeLayer` actually has
 * (`motifRef`, `material`) are referenced.
 *
 * `craftDomain` conditions gate a small number of variants where the working process genuinely
 * differs by substrate (engraving metal versus stone), per `VariantCondition`'s any-of/AND-across
 * contract. Most techniques here are process-general across their substrate range and carry no
 * condition at all — adding one speculatively for every technique risks the empty-intersection
 * failure mode 2GN.91's notes warn against, so a gate appears only where the process claim is
 * substrate-specific enough that an unconditioned reading would be false for another domain.
 */

import type { DescriptionTemplate } from '../../../types/description.ts';

export const DECORATION_TEMPLATES: readonly DescriptionTemplate[] = [
	// --- surface-treatment (doc 05 §8.2) --------------------------------------------------------
	{
		property: 'decoration.polish',
		variants: [
			{
				template:
					'Polished with successively finer abrasives until the surface took a smooth finish.',
				emphasis: [],
				register: 'technical',
			},
		],
	},
	{
		property: 'decoration.patina',
		variants: [
			{
				template:
					'The patina formed through exposure and handling, not through a deliberate finishing step.',
				emphasis: [],
				register: 'technical',
			},
		],
	},
	{
		property: 'decoration.roughening',
		variants: [
			{
				template:
					'Roughened deliberately, likely by striking or abrading the surface after the main working was done.',
				emphasis: [],
				register: 'technical',
			},
		],
	},
	{
		property: 'decoration.scoring',
		variants: [
			{
				template: 'Scored with a point or edge dragged across the surface in a controlled pass.',
				emphasis: [],
				register: 'technical',
			},
		],
	},
	{
		property: 'decoration.engraving',
		variants: [
			{
				template:
					'Incised by cutting a groove into the metal with a graver, the burr pushed to one side of the line.',
				emphasis: [],
				register: 'technical',
				condition: { craftDomain: ['metallurgy'] },
			},
			{
				template:
					'Incised by carving into the stone with a harder point, working in short controlled strokes.',
				emphasis: [],
				register: 'technical',
				condition: { craftDomain: ['stoneWorking'] },
			},
			{
				template: 'Incised by cutting lines into the surface with a sharp point.',
				emphasis: [],
				register: 'technical',
			},
		],
	},
	{
		property: 'decoration.engraving.motif',
		variants: [
			{
				template: 'The #motifRef# motif was laid out before cutting, then incised line by line.',
				emphasis: [],
				register: 'technical',
			},
		],
	},
	{
		property: 'decoration.relief',
		variants: [
			{
				template:
					'Raised by working the background down rather than building the design up, leaving the motif standing proud.',
				emphasis: [],
				register: 'technical',
			},
		],
	},
	{
		property: 'decoration.relief.motif',
		variants: [
			{
				template:
					'The #motifRef# motif was blocked out roughly first, then refined as the relief was raised.',
				emphasis: [],
				register: 'technical',
			},
		],
	},
	{
		property: 'decoration.painting',
		variants: [
			{
				template:
					'Pigment was mixed with a binder and applied to the surface with a brush or similar tool.',
				emphasis: [],
				register: 'technical',
			},
		],
	},
	{
		property: 'decoration.painting.motif',
		variants: [
			{
				template: 'The #motifRef# motif was sketched or scored in before the pigment was applied.',
				emphasis: [],
				register: 'technical',
			},
		],
	},
	{
		property: 'decoration.glaze',
		variants: [
			{
				template:
					'A glaze slip was applied before firing and vitrified in the kiln to a hard, glassy coat.',
				emphasis: [],
				register: 'technical',
				condition: { craftDomain: ['ceramics'] },
			},
		],
	},

	// --- applied-element (doc 05 §8.2) ----------------------------------------------------------
	{
		property: 'decoration.inlay',
		variants: [
			{
				template:
					'Channels or recesses were cut into the surface first, then filled with the inlay material and worked flush.',
				emphasis: [],
				register: 'technical',
			},
		],
	},
	{
		property: 'decoration.inlay.motif',
		variants: [
			{
				template:
					'The #motifRef# motif was cut as a series of recesses before the inlay material was set.',
				emphasis: [],
				register: 'technical',
			},
		],
	},
	{
		property: 'decoration.inlay.material',
		variants: [
			{
				template:
					'The recesses were filled with #material#, worked level with the surrounding surface.',
				emphasis: [],
				register: 'technical',
			},
		],
	},
	{
		property: 'decoration.overlay',
		variants: [
			{
				template: 'A layer of material was hammered, pressed or fixed over the base surface.',
				emphasis: [],
				register: 'technical',
			},
		],
	},
	{
		property: 'decoration.overlay.material',
		variants: [
			{
				template:
					'The overlay layer is #material#, worked thin enough to conform to the surface beneath.',
				emphasis: [],
				register: 'technical',
			},
		],
	},
	{
		property: 'decoration.studs',
		variants: [
			{
				template: 'Studs were set into drilled or punched holes and fixed from behind.',
				emphasis: [],
				register: 'technical',
			},
		],
	},
	{
		property: 'decoration.studs.material',
		variants: [
			{
				template: 'The studs are #material#, shaped separately before setting.',
				emphasis: [],
				register: 'technical',
			},
		],
	},
	{
		property: 'decoration.wire-wrapping',
		variants: [
			{
				template: 'Wire was drawn to a consistent gauge, then wound around the form under tension.',
				emphasis: [],
				register: 'technical',
			},
		],
	},
	{
		property: 'decoration.wire-wrapping.material',
		variants: [
			{
				template: 'The wire is #material#, drawn thin enough to wind without breaking.',
				emphasis: [],
				register: 'technical',
			},
		],
	},
	{
		property: 'decoration.gilding',
		variants: [
			{
				template:
					'A thin layer of precious metal was beaten to leaf or applied as an amalgam, then bonded to the surface.',
				emphasis: [],
				register: 'technical',
			},
		],
	},
	{
		property: 'decoration.gilding.material',
		variants: [
			{
				template:
					'The gilding is #material#, worked thin enough to conform to the surface without cracking.',
				emphasis: [],
				register: 'technical',
			},
		],
	},

	// --- textile-element (doc 05 §8.2) ------------------------------------------------------------
	{
		property: 'decoration.wrapping',
		variants: [
			{
				template:
					'Material was wound around the form in overlapping turns and secured at each end.',
				emphasis: [],
				register: 'technical',
			},
		],
	},
	{
		property: 'decoration.wrapping.material',
		variants: [
			{
				template:
					'The wrapping is #material#, wound tightly enough to hold its position without further fixing.',
				emphasis: [],
				register: 'technical',
			},
		],
	},
	{
		property: 'decoration.tassels',
		variants: [
			{
				template: 'Bundled lengths were gathered, tied at one end and trimmed level at the other.',
				emphasis: [],
				register: 'technical',
			},
		],
	},
	{
		property: 'decoration.beading',
		variants: [
			{
				template: 'Beads were strung or sewn on individually, fixed in a planned sequence.',
				emphasis: [],
				register: 'technical',
			},
		],
	},
	{
		property: 'decoration.beading.material',
		variants: [
			{
				template: 'The beads are #material#, shaped and perforated before stringing.',
				emphasis: [],
				register: 'technical',
			},
		],
	},
];
