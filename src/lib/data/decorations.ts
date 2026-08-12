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
 * - actually enforcing a `'material'` prerequisite against a target component's assigned material —
 *   `enforceSubstrates` (`engine/generation/decoration.ts`, roadmap 2GN.30)
 * - resolving a `form` substrate against the component's geometry — unbuilt (roadmap 2GN.104);
 *   `enforceSubstrates` passes these through unevaluated for now
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
		// Roadmap 2GN.101: was `{ kind: 'none' }`, so the generator applied patina to stone, glass and
		// fibre artefacts — diegetically wrong, and invisible until `reactivity` existed to name the
		// missing fact. Patina is an oxidation process; a material carrying `oxidisation: -1` has no
		// such chemistry at all, which is a gate (the technique cannot happen) rather than a
		// difficulty penalty (it happens badly). Gold stays eligible at `oxidisation: 0` — resistant,
		// not inert.
		substrate: {
			kind: 'material',
			label: 'oxidation-capable surface',
			test: (material) => material.reactivity.oxidisation >= 0,
		},
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
		substrate: {
			kind: 'material',
			label: 'formable or carvable material',
			// Roadmap 2GN.102. A relief needs a material that can be *given* a raised form: `rigidity`
			// alone (the pre-2GN.102 gate) could not distinguish that from mere structural firmness,
			// which is why it wrongly admitted obsidian and flint (conchoidal fracture only, never
			// steerable into a raised form) and wrongly excluded leather (holds a raised form fine, in
			// its cured state via tooling/stamping or its wet state via cuir bouilli — the same
			// exception `studs`/`gilding`/`overlay` already carry, just never applied here). Neither
			// `fragility` nor `grainFineness` can substitute: fragility describes the finished object,
			// not the working process — fired clay and glass are fragile only once brittle, not while
			// modelled or blown — and grainFineness's top rung ("amorphous or glassy") describes
			// obsidian and glass alike despite one being formable and the other not.
			//
			// `formability >= 3` is a single clause: no `rigidity` fallback and no named exception, since
			// `formability` correctly separates the excluded materials (obsidian, flint: unsteerable
			// fracture; linen: no shaping regime) from every material with a real relief tradition,
			// carved or modelled alike.
			test: (material) => material.physicalProperties.formability >= 3,
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
			label: 'non-combustible ceramic',
			// Roadmap 2GN.101 adds the combustibility ceiling alongside the existing `glazeable` flag.
			// Glazing is a *firing* process, so a material that would burn in the kiln can never be
			// glazed however ceramic-like it otherwise is. Not live-broken today — only `fired-clay`
			// passes `glazeable` — but the hole was real, and stating it here means a future glazeable
			// material inherits the constraint instead of rediscovering it.
			test: (material) =>
				material.decorability.glazeable && material.physicalProperties.combustibility <= 2,
		},
		// Takes a <colour>, not a <motif> (doc 05 §8.2).
		carriesMotif: false,
		introducesMaterial: false,
	},

	// applied-element (doc 05 §8.2): <applied-element> ::= inlay(<material>, <motif>) |
	// overlay(<material>, <coverage>) | studs(<material>, <pattern>) |
	// wire-wrapping(<material>, <pattern>) | gilding(<material>)
	// Doc 05 §8.2 writes gilding's argument as `<precious-metal>`, naming a `MaterialTag` roadmap
	// 2GN.78 retired. Its pool is now resolved physically by `isGildingMaterial`
	// (`engine/generation/decoration.ts`) — metallurgy, formable enough to beat to leaf, and
	// non-tarnishing — which admits gold and silver and nothing else, exactly the retired tag's reach.
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
		substrate: {
			kind: 'material',
			label: 'rigid surface',
			// Roadmap 2GN.101: was the same `hardness !== 'soft'` proxy `relief` carried. Overlay needs
			// a base that holds still under the covering sheet, which is literally what `rigidity`
			// measures — a pliable substrate is the real obstacle, not a soft-but-rigid one.
			test: (material) => material.physicalProperties.rigidity >= 3,
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
			// Roadmap 2GN.101: the hardness half becomes the rigidity threshold `overlay` uses, which
			// is what "rigid" meant all along. The named leather exception stays: leather is the one
			// pliable material that genuinely takes studs and rivets (harness, armour, scabbards), so
			// it is a real exception to the rigidity rule rather than a gap in it.
			test: (material) =>
				material.physicalProperties.rigidity >= 3 || material.tags.includes('leather'),
		},
		// Takes a <pattern>, not a <motif> (doc 05 §8.2).
		carriesMotif: false,
		introducesMaterial: true,
	},
	{
		technique: 'wire-wrapping',
		category: 'applied-element',
		// "Grippable form" is a geometric property of the target component, not its material — no
		// material fact answers it, so this is a `form` substrate. `enforceSubstrates` (2GN.30)
		// passes it through unevaluated; resolving it against component geometry is roadmap 2GN.104.
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
			label: 'sufficiently rigid surface',
			// Roadmap 2GN.101: was `tags.includes('metal')`, which is factually wrong. Real gilding is
			// overwhelmingly applied to *non*-metal grounds — gilded wood and gesso (frames,
			// altarpieces, furniture) are the commonest historical case by a wide margin, with gilded
			// leather bindings and gilded ceramic well attested. Metal-on-metal fire-gilding is one
			// tradition among several, not the prerequisite. What gilding actually needs is a ground
			// stable enough to hold leaf or foil, which excludes only genuinely pliable material — the
			// same `rigidity >= 3` threshold `overlay` and `studs` use, with the same named leather
			// exception `studs` carries: gilded leather bindings are attested, and leather is the one
			// pliable material that genuinely holds worked shape well enough for applied leaf.
			test: (material) =>
				material.physicalProperties.rigidity >= 3 || material.tags.includes('leather'),
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
		// to), not a material fact — a `form` substrate. `enforceSubstrates` (2GN.30) passes it
		// through unevaluated; resolving it against component geometry is roadmap 2GN.104.
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

/**
 * The `MaterialDefinition.physicalProperties` axes a technique's difficulty responds to, and the
 * `reactivity` keys alongside them (roadmap 2GN.101). Keeping the union here rather than deriving it
 * from `MaterialDefinition` is deliberate: `hardness` is on a 1–10 Mohs scale while the rest are
 * 1–7, and `oxidisation` carries a `-1` not-applicable sentinel, so `computeLayerGrade` normalises
 * each axis before weighting it and needs to know exactly which axes it is looking at.
 */
export type MaterialDifficultyAxis =
	| 'hardness'
	| 'fragility'
	| 'rigidity'
	| 'grainFineness'
	| 'porosity'
	| 'oxidisation';

/**
 * How much each material axis shifts a technique's difficulty away from its `TECHNIQUE_DIFFICULTY`
 * baseline (roadmap 2GN.99). A **modifier on** that reviewed baseline, not a replacement for it:
 * `effectiveDifficulty` sums `weight × normalisedAxisValue` across the axes below, adds the total to
 * the baseline, and clamps to `[MINIMUM_DIFFICULTY, 1]`.
 *
 * **Sign convention: positive makes the technique harder on a material scoring high on that axis;
 * negative makes it easier.** An omitted axis means "this technique does not care" rather than zero
 * by oversight.
 *
 * **Magnitudes were scaled up ×2.5 from the originally-authored `±0.15` band after measurement.** At
 * the original scale, engraving spanned only ~0.044 of realised grade across all sixteen materials
 * against ~0.3 between the easiest and hardest *technique* — material choice was a rounding error
 * beside technique choice, and partially-cancelling weights (granite drawing `+0.10` for coarse
 * grain but `−0.05` for low fragility) collapsed most of what signal there was. A modifier that weak
 * would also have left `meanDecorativeGrade` with too little within-cell spread to sample a
 * percentile ladder from, which is the degeneracy 2GN.98 rejected the craft-only grade for. The
 * scaling preserves every relative judgement below exactly; only the overall magnitude moved, and
 * `effectiveDifficulty`'s `[MINIMUM_DIFFICULTY, 1]` clamp still bounds the result.
 *
 * Authored and reviewed technique-by-technique against real craft practice, the same standard
 * `TECHNIQUE_DIFFICULTY` was held to. The reasoning that shaped the table:
 *
 * - **Cutting and removal techniques** (`engraving`, `inlay`, and to a lesser degree `relief`,
 *   `scoring`) pair a strong positive `fragility` with a strong negative `grainFineness`: the two
 *   forces that actually govern precision cutting, pulling against each other. `engraving` and
 *   `inlay` sit at the `±0.375` ceiling on both — they are the highest-stakes, most grain-dependent
 *   operations in the set.
 * - **Coating and application techniques** (`gilding`, `overlay`) carry *negative* `hardness`:
 *   softer ground genuinely takes leaf and foil more readily, which is why gilded gesso and gilded
 *   wood dominate the historical record over gilded stone. They lean instead on positive `rigidity`
 *   — an unstable ground is the real obstacle — and slight negative `porosity`, since some absorbency
 *   helps a size or adhesive bond. `painting` follows the same `rigidity`/`porosity` shape but carries
 *   no `hardness` weight at all — pigment take is grain- and absorbency-driven, not hardness-driven —
 *   and its `porosity: -0.25` is double `gilding`/`overlay`'s, since a painted surface's absorbency
 *   matters more directly to it than a gilded one's.
 * - **`patina` is governed almost entirely by one axis.** Its `oxidisation: -0.375` ties the table's
 *   ceiling (with `engraving` and `inlay`'s `fragility`/`grainFineness` weights) because the
 *   technique is a chemical process, not a mechanical one; a highly reactive ground like iron makes
 *   patina dramatically more tractable. Materials with no oxidation chemistry (`oxidisation: -1`) are
 *   excluded from this weighting explicitly in `effectiveDifficulty` — a not-applicable sentinel is
 *   not a low score, and normalising it would land outside this table's `[-1, +1]` domain. The
 *   substrate gate (below) suppresses *selection* of `patina` for such a material at culture level,
 *   but does not by itself stop this weighting from being evaluated once a material is assigned; the
 *   explicit skip is what actually keeps the sentinel out.
 * - **The three form-substrate techniques** (`wire-wrapping`, `wrapping`, `beading`) are near-inert
 *   here, carrying only a small positive `rigidity`. This is a **known limitation, not a judgement
 *   that material does not matter**: their real difficulty is driven by the *introduced* material
 *   (the wire, the cord, the beads), and this model reads the *substrate* material. Recorded for the
 *   successor task that adds relational introduced-versus-substrate difficulty.
 * - **`tassels` is absent entirely.** It introduces no material in the current catalogue
 *   (`introducesMaterial: false`) and has no material substrate, so there is genuinely nothing to be
 *   sensitive to. That is itself a data gap — a real tassel is unambiguously cord — recorded against
 *   the same successor.
 */
export const TECHNIQUE_MATERIAL_SENSITIVITY: Readonly<
	Record<
		DecorativeTechniqueDefinition['technique'],
		Readonly<Partial<Record<MaterialDifficultyAxis, number>>>
	>
> = {
	// Surface treatments.
	'polish': { hardness: 0.125, grainFineness: -0.25 },
	'patina': { oxidisation: -0.375 },
	'roughening': { hardness: -0.125, fragility: 0.125 },
	'scoring': { hardness: 0.125, fragility: 0.25, grainFineness: -0.25 },
	'engraving': { hardness: 0.25, fragility: 0.375, grainFineness: -0.375 },
	'relief': { hardness: 0.125, fragility: 0.25, grainFineness: -0.25 },
	'painting': { rigidity: 0.125, grainFineness: -0.125, porosity: -0.25 },
	'glaze': { fragility: 0.125, porosity: -0.25 },

	// Applied elements.
	'inlay': { hardness: 0.25, fragility: 0.375, grainFineness: -0.375 },
	'overlay': { hardness: -0.125, fragility: 0.125, rigidity: 0.25, porosity: -0.125 },
	'studs': { hardness: 0.25, fragility: 0.25 },
	'wire-wrapping': { rigidity: 0.125 },
	'gilding': { hardness: -0.125, rigidity: 0.25, grainFineness: -0.125, porosity: -0.125 },

	// Textile elements.
	'wrapping': { rigidity: 0.125 },
	'tassels': {},
	'beading': { rigidity: 0.125 },
};
