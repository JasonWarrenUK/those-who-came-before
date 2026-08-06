/**
 * MVP decorative technique definitions (doc 05 §8.2, roadmap 2GN.28).
 *
 * The sixteen terminals of the decorative grammar's three productions — surface-treatment,
 * applied-element, textile-element — each paired with its `[requires: ...]` material prerequisite
 * from the BNF (doc 05 §8.2). Most prerequisites resolve against a candidate material alone, via
 * the `decorability`/`physicalProperties`/`tags` facts `MaterialDefinition` (`types/artefact.ts`)
 * already pre-resolves for exactly this purpose (see that interface's doc comment). A few —
 * wire-wrapping/wrapping's "grippable form", beading's "attachment point" — are about the target
 * component's geometry, not its material, so they carry a `form` substrate instead of a predicate;
 * no material fact can answer them.
 *
 * This module is static data only, no behaviour. Out of scope, and owned downstream:
 * - iterating an artefact's surfaces and selecting techniques weighted by culture/phase
 *   (`engine/generation/decoration.ts`, roadmap 2GN.29)
 * - actually enforcing a prerequisite against a target component during grammar expansion —
 *   running `substrate.test`, or resolving a `form` substrate against the component's geometry
 *   (roadmap 2GN.30)
 * - layering/recursion depth caps and motif assignment from a culture's `motifVocabulary`
 *   (roadmap 2GN.31–33)
 *
 * Every `DecorativeTechnique` (`types/decoration.ts`) has exactly one entry below.
 */

import type { DecorativeTechniqueDefinition } from '../types/decoration.ts';

export const DECORATIVE_TECHNIQUES: readonly DecorativeTechniqueDefinition[] = [
	// surface-treatment (doc 05 §8.2): <surface-treatment> ::= polish | patina | roughening |
	// scoring | engraving(<motif>) | relief(<motif>) | painting(<motif>, <pigment>) | glaze(<colour>)
	{
		technique: 'polish',
		category: 'surface-treatment',
		substrate: { kind: 'none' },
		carriesMotif: false,
		introducesMaterial: false,
	},
	{
		technique: 'patina',
		category: 'surface-treatment',
		substrate: { kind: 'none' },
		carriesMotif: false,
		introducesMaterial: false,
	},
	{
		technique: 'roughening',
		category: 'surface-treatment',
		substrate: { kind: 'none' },
		carriesMotif: false,
		introducesMaterial: false,
	},
	{
		technique: 'scoring',
		category: 'surface-treatment',
		substrate: { kind: 'none' },
		carriesMotif: false,
		introducesMaterial: false,
	},
	{
		technique: 'engraving',
		category: 'surface-treatment',
		// Resolved by workability, not raw structural hardness, despite the BNF's "hard material"
		// name — soft precious metals hold an incised line via chasing/repoussé (doc 05 §8.2 note;
		// `MaterialDefinition.decorability.engravable` is pre-resolved on exactly this basis).
		substrate: {
			kind: 'material',
			label: 'hard material',
			test: (material) => material.decorability.engravable,
		},
		carriesMotif: true,
		introducesMaterial: false,
	},
	{
		technique: 'relief',
		category: 'surface-treatment',
		// No dedicated "thickness" fact exists on `MaterialDefinition`; hardness stands in as the
		// nearest proxy doc 05 §8.2 implies (a relief needs a substrate that holds a raised form
		// without crumbling, which soft materials don't).
		substrate: {
			kind: 'material',
			label: 'thick material',
			test: (material) => material.physicalProperties.hardness !== 'soft',
		},
		carriesMotif: true,
		introducesMaterial: false,
	},
	{
		technique: 'painting',
		category: 'surface-treatment',
		substrate: {
			kind: 'material',
			label: 'solid surface',
			test: (material) => material.decorability.paintable,
		},
		carriesMotif: true,
		introducesMaterial: false,
	},
	{
		technique: 'glaze',
		category: 'surface-treatment',
		substrate: {
			kind: 'material',
			label: 'ceramic',
			test: (material) => material.decorability.glazeable,
		},
		// Takes a <colour>, not a <motif> (doc 05 §8.2).
		carriesMotif: false,
		introducesMaterial: false,
	},

	// applied-element (doc 05 §8.2): <applied-element> ::= inlay(<material>, <motif>) |
	// overlay(<material>, <coverage>) | studs(<material>, <pattern>) |
	// wire-wrapping(<material>, <pattern>) | gilding(<precious-metal>)
	{
		technique: 'inlay',
		category: 'applied-element',
		substrate: {
			kind: 'material',
			label: 'engravable surface',
			test: (material) => material.decorability.engravable,
		},
		carriesMotif: true,
		introducesMaterial: true,
	},
	{
		technique: 'overlay',
		category: 'applied-element',
		// Same hardness proxy as `relief`: a rigid surface needs a substrate that isn't soft.
		substrate: {
			kind: 'material',
			label: 'rigid surface',
			test: (material) => material.physicalProperties.hardness !== 'soft',
		},
		// Takes a <coverage>, not a <motif> (doc 05 §8.2).
		carriesMotif: false,
		introducesMaterial: true,
	},
	{
		technique: 'studs',
		category: 'applied-element',
		substrate: {
			kind: 'material',
			label: 'rigid or leather',
			test: (material) =>
				material.physicalProperties.hardness !== 'soft' || material.tags.includes('leather'),
		},
		// Takes a <pattern>, not a <motif> (doc 05 §8.2).
		carriesMotif: false,
		introducesMaterial: true,
	},
	{
		technique: 'wire-wrapping',
		category: 'applied-element',
		// "Grippable form" is a geometric property of the target component, not its material — no
		// material fact answers it, so this is a `form` substrate resolved downstream (2GN.30).
		substrate: { kind: 'form', requires: 'grippable' },
		// Takes a <pattern>, not a <motif> (doc 05 §8.2).
		carriesMotif: false,
		introducesMaterial: true,
	},
	{
		technique: 'gilding',
		category: 'applied-element',
		substrate: {
			kind: 'material',
			label: 'metal surface',
			test: (material) => material.tags.includes('metal'),
		},
		carriesMotif: false,
		introducesMaterial: true,
	},

	// textile-element (doc 05 §8.2): <textile-element> ::= wrapping(<material>, <pattern>) |
	// tassels | beading(<material>)
	{
		technique: 'wrapping',
		category: 'textile-element',
		substrate: { kind: 'form', requires: 'grippable' },
		// Takes a <pattern>, not a <motif> (doc 05 §8.2).
		carriesMotif: false,
		introducesMaterial: true,
	},
	{
		technique: 'tassels',
		category: 'textile-element',
		substrate: { kind: 'none' },
		carriesMotif: false,
		introducesMaterial: false,
	},
	{
		technique: 'beading',
		category: 'textile-element',
		// "Attachment point" is a structural property of the component (somewhere to attach beads
		// to), not a material fact — a `form` substrate resolved downstream (2GN.30).
		substrate: { kind: 'form', requires: 'attachment-point' },
		carriesMotif: false,
		introducesMaterial: true,
	},
];

/**
 * How difficult each technique is to execute well, `0`–`1` (roadmap 2GN.98, doc 11 §1.5). Feeds
 * `DecorativeLayer.grade` (`engine/generation/decoration.ts`'s `computeLayerGrade`) alongside the
 * producing phase's `society.craftSpecialisation`, so the same craft level realises a materially
 * lower grade on a hard technique than an easy one — doc 05 §8.3's "technically refined vs simple
 * techniques" distinction, made concrete per technique rather than left as an unquantified claim.
 *
 * Grounded in how each craft actually works — training time, error tolerance, hand-skill demand —
 * not merely in this file's `substrate`/`carriesMotif`/`introducesMaterial` flags, which correlate
 * with difficulty but aren't difficulty itself (e.g. `polish` has no motif or introduced material
 * yet a true mirror finish by hand takes real practice; `gilding` introduces a precious material
 * but is procedural once mastered, not the hardest technique in the set). Authored and reviewed
 * per-item, not derived. Values, ascending:
 *
 * - `0.10` `roughening` — deliberate texturing; minimal training, high error tolerance
 * - `0.15` `patina` — mostly controlled chemistry (oxidants, heat, time), not manual dexterity
 * - `0.20` `polish` — a true mirror finish by hand takes real practice despite being common
 * - `0.20` `scoring` — controlled incising, no compositional judgement needed
 * - `0.20` `tassels` — textile assembly, low compositional demand
 * - `0.30` `wrapping` — needs a functional grip pattern under tension, not just appearance
 * - `0.35` `beading` — patience and spacing judgement in attaching individual elements
 * - `0.35` `studs` — mechanical fastening plus material matching on a harder substrate
 * - `0.40` `overlay` — surface prep and adhesion; coverage tolerates minor imperfection
 * - `0.45` `glaze` — real skill, but the kiln does much of the finishing work
 * - `0.50` `painting` — representational/symbolic motif composition, trained in every real craft tradition
 * - `0.50` `wire-wrapping` — continuous tension control; mistakes are hard to hide once bent
 * - `0.55` `gilding` — precise but procedural once mastered — moderately technical, not the hardest
 * - `0.60` `relief` — 3D modelling judgement, but allows correction/build-up unlike a cut line
 * - `0.65` `engraving` — motif accuracy under depth control, almost no room to correct a mis-cut line
 * - `0.80` `inlay` — precision-fitting a second material into a cut channel; ceiling
 */
export const TECHNIQUE_DIFFICULTY: Readonly<
	Record<DecorativeTechniqueDefinition['technique'], number>
> = {
	'roughening': 0.10,
	'patina': 0.15,
	'polish': 0.20,
	'scoring': 0.20,
	'tassels': 0.20,
	'wrapping': 0.30,
	'beading': 0.35,
	'studs': 0.35,
	'overlay': 0.40,
	'glaze': 0.45,
	'painting': 0.50,
	'wire-wrapping': 0.50,
	'gilding': 0.55,
	'relief': 0.60,
	'engraving': 0.65,
	'inlay': 0.80,
};
