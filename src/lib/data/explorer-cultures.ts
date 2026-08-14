/**
 * Explorer-only preset cultures (roadmap 2GN.57).
 *
 * No culture generator exists yet — chronology/culture generation is scoped to `engine/world/`
 * (roadmap 2GN.*, 3WS.*) and hasn't landed. The structure viewer's culture selector needs
 * *something* concrete to offer, so these four presets are hand-authored `CulturalProfile` +
 * `PhaseCharacteristics` pairs, not a substitute for that future generator. They are fictional
 * (invented names, not references to real-world cultures) but each leans on a distinct,
 * recognisable production-culture archetype — pastoral/steppe, maritime-trade palace,
 * jungle-religious/monumental, imperial-metalworking — chosen so the four sit at different points
 * on `society.craftSpecialisation` (drives `deriveComplexityBudget`'s tier: simple `<0.3`,
 * moderate `<0.6`, sophisticated `>=0.6`) and visibly diverge in the generated component tree.
 *
 * Each preset also carries a hand-authored single-region `geology` and its `trade` flows, added for
 * the material viewer (roadmap 2GN.60): `assignMaterial` needs both, and without per-preset
 * variation every culture would show an identical scarcity picture, leaving only the affinity axis
 * observable. Real geology generation is roadmap 3WS.7, which sits behind the whole-M2 gate —
 * Milestone 2 runs against preset worlds by design, so these stand in until then.
 *
 * Superseded once 2GN.66 (naming grammars) and the `engine/world/` culture generator land (3WS.7
 * for the geology half); this module is a developer-tooling stopgap, not shipped game content.
 */

import type {
	AvailabilityLevel,
	CulturalProfile,
	GeologicalContext,
	MaterialAffinity,
	MaterialFlow,
	PhaseCharacteristics,
} from '../types/world.ts';
import type { MaterialName, MaterialTag } from '../types/tags.ts';
import type { CulturePhaseSample } from '../engine/generation/baselines.ts';
import { assertAffinitiesCoverAccessibleMaterials } from '../engine/generation/cultureValidation.ts';

/** One Explorer preset: a named, described culture paired with a single phase to generate against. */
export interface ExplorerCulture {
	/** Stable id, used as the culture selector's option value. */
	id: string;

	/** Human-readable name shown in the selector. */
	label: string;

	/** One-line flavour text shown beneath the selector. */
	description: string;

	/** Stable material/technique/motif tendencies (doc 05 §3.3). */
	profile: CulturalProfile;

	/** The single phase this preset generates against (doc 05 §3.2). */
	phase: PhaseCharacteristics;

	/**
	 * Local material scarcity for this culture's single region (doc 05 §3.6). Every one of the 16
	 * shipped materials carries an explicit level, so `isAvailable`'s missing-entry lenience never
	 * applies here and the material viewer (2GN.60) never has to show an "unmodelled" state.
	 */
	geology: GeologicalContext;

	/** Trade flows reaching this culture, rescuing `trade-only` materials (doc 05 §3.4). */
	trade: MaterialFlow[];
}

/**
 * Builds a preset's `materialAffinities` from terse pairs, so the presets stay readable now that the
 * entries are objects (roadmap 2GN.123). A bare `MaterialTag` key becomes a class entry; wrap an id
 * as `{ id: 'gold' }` for a per-material entry, which beats any class entry covering it.
 *
 * Both forms are spelled out rather than accepting a bare string because `bone`, `glass` and
 * `leather` each name a class *and* a material — the collision `MaterialSelector` exists to keep
 * apart.
 */
function materialAffinities(
	entries: [MaterialTag | { id: MaterialName }, number][],
): MaterialAffinity[] {
	return entries.map(([key, weight]) => ({
		selector: typeof key === 'string' ? { tag: key } : { id: key.id },
		weight,
	}));
}

/** The 16 shipped material ids, in `src/lib/data/materials.ts` order. */
const MATERIAL_IDS = [
	'bronze',
	'iron',
	'gold',
	'silver',
	'obsidian',
	'flint',
	'granite',
	'jade',
	'oak',
	'ash',
	'bone',
	'antler',
	'fired-clay',
	'glass',
	'linen',
	'leather',
] as const;

/**
 * Builds a single-region `GeologicalContext` from a complete material→level map.
 *
 * Every id in `MATERIAL_IDS` must be present: the whole point of these presets is that the
 * material viewer sees a fully-modelled geology, so a missing entry is an authoring error rather
 * than an implicit "unmodelled, treat leniently".
 */
function geology(
	region: string,
	levels: Record<(typeof MATERIAL_IDS)[number], AvailabilityLevel>,
): GeologicalContext {
	return {
		materialAvailability: new Map(
			MATERIAL_IDS.map((materialId) => [
				materialId,
				{ materialId, regions: new Map([[region, levels[materialId]]]) },
			]),
		),
	};
}

export const EXPLORER_CULTURES: readonly ExplorerCulture[] = [
	{
		id: 'tarpan',
		label: 'Tarpan',
		description: 'Mobile steppe pastoralists — low specialisation, bone and metal, burial-heavy.',
		profile: {
			materialAffinities: materialAffinities([
				['bone', 1.6],
				// ⚠️ Covers gold and silver, both `absent` in this geology. Legal and deliberate: the
				// 2GN.127 obligation is one-directional (accessible ⟹ must be covered; covered ⟹
				// nothing implied about access), so a culture may hold a view on a metal it has never
				// held. The weight is inert for those two — `isAvailable` excludes them before
				// `culturalAffinityWeight` is ever consulted. Not an oversight; don't tidy it away.
				['metal', 1.3],
				['leather', 1.2],
				// The four entries below close this preset's six 2GN.128 violations: oak and ash
				// (`wood`), flint and granite (`stone`), fired-clay (`clay`), linen (`fiber`).
				//
				// Shafts, frames and cart-beds: a mobile life is built from what it can cut on the
				// move. Mild favour rather than a specialism, matching `woodWorking: 0.4`.
				['wood', 1.1],
				// Flint is still knapped, but stone is heavy and this culture moves. Just below neutral
				// reads as "used where bone won't serve", not as distaste.
				['stone', 0.9],
				// Fired pots travel badly. A *preference* against ceramics, distinct from the capability
				// floor: this culture could fire more clay than it chooses to.
				['clay', 0.7],
				// The phase block already argues this one — flax is a settled-agriculture crop, so
				// `textiles` does not rise with the herd's by-products the way `leatherWorking` does.
				// The affinity states the choice; the technology score states the capability.
				['fiber', 0.6],
			]),
			techniqueAffinities: new Map([
				['engraving', 1.2],
				['wire-wrapping', 1.3],
			]),
			motifVocabulary: {
				motifs: [
					{ id: 'horse-frieze', label: 'Horse Frieze', culturalOrigin: 'tarpan' },
					{ id: 'sun-wheel', label: 'Sun Wheel', culturalOrigin: 'tarpan' },
					// Diffusion case: exercises borrowed-motif tracking (doc 05 §8.5) — Tarpan's
					// vocabulary includes a motif it didn't originate.
					{ id: 'winged-disc', label: 'Winged Disc', culturalOrigin: 'khaltiris' },
				],
			},
			craftInvestment: {
				contextWeights: new Map([
					['burial-goods', 1.4],
					['hoard', 1.1],
				]),
				siteTypeWeights: new Map([
					['burial', 1.3],
					['market', 0.9],
				]),
			},
		},
		phase: {
			technology: {
				metallurgy: 0.6,
				ceramics: 0.4,
				textiles: 0.5,
				// Highest in the set (roadmap 2GN.100). This culture's own description is
				// "bone-and-leather with the occasional bronze fitting", its geology puts leather
				// `abundant` against linen `scarce`, and mobile pastoralists tan continuously because
				// the herd yields hide as a by-product of subsistence. Flax is a settled-agriculture
				// crop, so `textiles` does not rise with it.
				leatherWorking: 0.75,
				stoneWorking: 0.4,
				glassWorking: 0.2,
				woodWorking: 0.4,
				boneWorking: 0.6,
			},
			economy: { tradeOpenness: 0.5, surplus: 0.35, urbanisation: 0.2 },
			society: {
				stratification: 0.4,
				militarisation: 0.7,
				religiousEmphasis: 0.4,
				craftSpecialisation: 0.2,
			},
			aesthetics: { decorativeEmphasis: 0.4, motifComplexity: 0.35, formConservatism: 0.5 },
		},
		// Animal materials abundant, minerals poor: the herd supplies bone, antler and hide, while
		// anything smelted or precious has to come up the trade route — and the precious end never
		// does, so a Tarpan artefact is bone-and-leather with the occasional bronze fitting.
		geology: geology('steppe', {
			bronze: 'scarce',
			iron: 'trade-only',
			gold: 'absent',
			silver: 'absent',
			obsidian: 'absent',
			flint: 'available',
			granite: 'scarce',
			jade: 'absent',
			oak: 'available',
			ash: 'available',
			bone: 'abundant',
			antler: 'abundant',
			'fired-clay': 'scarce',
			glass: 'absent',
			linen: 'scarce',
			leather: 'abundant',
		}),
		trade: [{ includes: [{ tag: 'metal' }], direction: 'bidirectional', volume: 0.4 }],
	},
	{
		id: 'thalassar',
		label: 'Thalassar',
		description: 'Maritime-trade palace culture — moderate specialisation, clay and gilded glass.',
		profile: {
			// Gold and silver restored (roadmap 2GN.123). A `precious-metal: 1.2` entry sat here until
			// 2GN.78 retired that tag — the only *live* precious affinity across the four presets, so
			// dropping it lost real authored intent. Thalassar means "we favour gold and silver", and
			// the tag-keyed map had no way to say that about two specific materials: `metal: 1.2`
			// would have newly favoured the bronze and iron this culture was never authored to prefer.
			// Most-specific-wins (2GN.110) is what makes the naming exact — two `{ id }` entries and
			// deliberately no `metal` entry, so every other metal reads the neutral 1 rather than
			// inheriting anything.
			materialAffinities: materialAffinities([
				['clay', 1.7],
				['glass', 1.1],
				[{ id: 'gold' }, 1.2],
				[{ id: 'silver' }, 1.2],
				// The eight entries below close this preset's eleven 2GN.128 violations, the worst count
				// of the four — a culture that buys metal, gold and obsidian through three flows and
				// holds no stated opinion about any of them is not credible.
				//
				// ⚠️ Bronze and iron are discharged by *specific* entries, and the continued absence of
				// a `metal` class entry is now load-bearing twice over. Beyond the authored intent above
				// (naming gold and silver without dragging bronze and iron up with them), a `metal`
				// entry would silently break `materials.calibration.test.ts`'s preset-affinity guard:
				// that guard appends `{ tag: 'metal' }: 1.5` to build its `classLifted` arm, and
				// `culturalAffinityWeight` takes first-match, so a pre-existing `metal` entry makes the
				// appended one inert. Measured: the guard's assertions still pass while its comparison
				// arm collapses to the neutral case — green, and measuring nothing (doc 12 §2.48).
				//
				// Bought rather than made (`metallurgy: 0.55`, both `trade-only`): useful, not prized.
				[{ id: 'bronze' }, 0.9],
				// The utilitarian import, and a palace culture's least-prized metal.
				[{ id: 'iron' }, 0.8],
				// Granite is ballast, quay and footing rather than what this culture makes things of.
				// Also covers jade, `trade-only` here with no flow reaching it since 2GN.112 narrowed
				// the obsidian route — inert, and legal under the one-directional obligation.
				['stone', 0.8],
				// The exception to that, and the clearest case for most-specific-wins in the set: this
				// culture maintains a dedicated shipping route for obsidian alone (see `trade` below).
				// Running a flow for one stone while shrugging at the granite underfoot is a specific
				// preference, not a class one.
				[{ id: 'obsidian' }, 1.2],
				// Hulls, decking and fittings. Considered and genuinely unremarkable — which after
				// 2GN.128 is a statement the map can carry rather than a silence indistinguishable
				// from never having thought about it.
				['wood', 1.0],
				// Matches `boneWorking: 0.3`, the lowest in the set.
				['bone', 0.7],
				// Linen is `abundant` here, and sailcloth is a maritime culture's real textile stake.
				['fiber', 1.3],
				// "Hide is workaday here (bindings, straps, sandals)", per the `leatherWorking` comment
				// in the phase block below.
				['leather', 0.9],
			]),
			techniqueAffinities: new Map([
				['painting', 1.6],
				['relief', 1.3],
				['gilding', 1.1],
			]),
			motifVocabulary: {
				motifs: [
					{ id: 'twin-axe', label: 'Twin Axe', culturalOrigin: 'thalassar' },
					{ id: 'spiral-tide', label: 'Spiral Tide', culturalOrigin: 'thalassar' },
					{ id: 'leaping-herd', label: 'Leaping Herd', culturalOrigin: 'thalassar' },
				],
			},
			craftInvestment: {
				contextWeights: new Map([
					['deliberate-placement', 1.2],
					['casual-discard', 0.6],
				]),
				siteTypeWeights: new Map([
					['shrine', 1.3],
					['settlement', 1.2],
				]),
			},
		},
		phase: {
			technology: {
				metallurgy: 0.55,
				ceramics: 0.85,
				textiles: 0.5,
				// Slightly below its `textiles`, which the abundant flax earns. A maritime palace
				// culture's prestige crafts are painted pottery and gilded glass; hide is workaday
				// here (bindings, straps, sandals), and its geology has leather only `available`.
				leatherWorking: 0.45,
				stoneWorking: 0.45,
				glassWorking: 0.6,
				woodWorking: 0.4,
				boneWorking: 0.3,
			},
			economy: { tradeOpenness: 0.8, surplus: 0.65, urbanisation: 0.6 },
			society: {
				stratification: 0.6,
				militarisation: 0.2,
				religiousEmphasis: 0.55,
				craftSpecialisation: 0.5,
			},
			aesthetics: { decorativeEmphasis: 0.75, motifComplexity: 0.6, formConservatism: 0.3 },
		},
		// The trade culture: locally it has clay, flax and hides and very little else, but its
		// `tradeOpenness` of 0.8 buys metal, gold and obsidian from three separate flows. The one
		// preset where the trade axis does real work — nothing here is `absent`.
		geology: geology('coast', {
			bronze: 'trade-only',
			iron: 'trade-only',
			gold: 'trade-only',
			silver: 'scarce',
			obsidian: 'trade-only',
			flint: 'scarce',
			granite: 'available',
			jade: 'trade-only',
			oak: 'available',
			ash: 'scarce',
			bone: 'available',
			antler: 'scarce',
			'fired-clay': 'abundant',
			glass: 'scarce',
			linen: 'abundant',
			leather: 'available',
		}),
		trade: [
			// Was keyed on `precious-metal` until roadmap 2GN.78 retired that tag, then briefly on
			// `metal` + `specificMaterials`, which could not restrict the class it named (2GN.112).
			// Now says what it always meant: the high-volume route carries gold and silver only.
			{
				includes: [{ id: 'gold' }, { id: 'silver' }],
				direction: 'bidirectional',
				volume: 0.8,
			},
			// The separate, lower-volume route carries metals generally — so bronze and iron do reach
			// Thalassar, by this flow rather than by the one above. Two flows, two authored intents.
			{ includes: [{ tag: 'metal' }], direction: 'bidirectional', volume: 0.6 },
			// The obsidian route. ⚠️ This is the one flow whose *reach* 2GN.112 changed: it was
			// `stone` + `specificMaterials: ['obsidian']`, and the OR meant its tag arm also imported
			// Thalassar's `trade-only` jade. Nobody authored "and jade" — that reach was the accident
			// the ruling removes — so jade is no longer obtainable here, deliberately. The rest of the
			// preset set is unchanged (measured against `origin/main`).
			{
				includes: [{ id: 'obsidian' }],
				direction: 'a-to-b',
				volume: 0.5,
			},
		],
	},
	{
		id: 'xoconahtl',
		label: 'Xoconahtl',
		description: 'Jungle religious/monumental culture — stone and relief-heavy, votive deposition.',
		profile: {
			// Jade restored as a raise, not the literal 1.4 (roadmap 2GN.123). The retired
			// `precious-stone: 1.4` sat *below* `stone: 1.8`, which reads as "values jade less than
			// granite" — but it never meant that. Doc 12 §2.34 measured the map as one-directional by
			// construction: under the `max` reduction a lower number could not lower anything, so the
			// author was reaching for a second axis (a precious *tier* alongside the class) rather
			// than authoring suppression. With `precious-stone` retired as a global concept (2GN.77:
			// standing is a culture's judgement, not a property of the rock), that tier is gone and
			// the intent belongs here: "they use a lot of stone, and quite a lot of jade".
			//
			// Above `stone` rather than below it, because jade is *local* here — `available`, not
			// imported like Khaltiris's — and a monumental culture at `religiousEmphasis` 0.85 with
			// jade underfoot prizes it over ordinary granite.
			materialAffinities: materialAffinities([
				['stone', 1.8],
				// Explicitly neutral, not an oversight: this culture works clay in quantity (fired-clay
				// is `abundant` and 12% of its output) without favouring it.
				//
				// The 2GN.127 ruling resolved what this entry used to apologise for. It no longer
				// "resolves identically to omitting the entry": omitting it would now *throw*, because
				// fired-clay is accessible here, so the entry's presence is what states the judgement
				// and the old comment's "a distinction the type cannot carry" is discharged.
				//
				// ⚠️ The value stays at exactly 1.0 deliberately, and this is the live instance of the
				// defect 2GN.129 exists to rule on: `materialAccessGate` (`decoration.ts`) requires
				// `culturalAffinityWeight(...) > 1` for substrate access, so this authored indifference
				// suppresses clay-substrate techniques *identically* to a culture that cannot obtain
				// clay at all — on a culture whose fired-clay is `abundant`. Retuning this to 1.1 would
				// route around the defect by editing the content rather than the gate, and would
				// destroy the evidence that makes it measurable. The gate is what's wrong, not the 1.0.
				['clay', 1.0],
				[{ id: 'jade' }, 2.2],
				// Below neutral, and the first authored disfavour in any preset. Distinct from the
				// capability floor already suppressing leather here (`leatherWorking: 0.30`, lowest in
				// the set; geology `scarce`): those say this culture *cannot* work hide well. This says
				// it would choose otherwise given the hide — a humid climate makes tanning a poor
				// investment beside the stone it builds in. 0.7 rather than 0.5 because the authored
				// case is climate and opportunity cost, not distaste.
				['leather', 0.7],
				// The four entries below close this preset's six 2GN.128 violations.
				//
				// The sole import, and the only metal that reaches this culture at all — bronze, iron
				// and silver are all `absent`. A monumental culture at `religiousEmphasis: 0.85` that
				// maintains one low-volume flow for one metal is importing votive metal. Below jade's
				// 2.2 deliberately: the jade comment above argues local-and-prized outranks ordinary
				// stone, and imported gold ranking under local jade follows that same logic.
				[{ id: 'gold' }, 1.5],
				// A jungle culture's most available structural material, at `woodWorking: 0.5`.
				['wood', 1.2],
				// ⚠️ A second entry at exactly neutral, and unlike clay above this one is tolerable
				// where it sits. It hits the same `> 1` substrate gate, but bone-substrate techniques
				// are not this culture's idiom (`boneWorking: 0.4`, and its decorative weight is in
				// relief and engraving on stone), so the suppression costs nothing observable here.
				// The pair is deliberate, not inconsistent: 2GN.129 rules the gate, not these values.
				['bone', 1.0],
				// Linen is `available`, and textile offering is real votive practice.
				['fiber', 1.1],
			]),
			techniqueAffinities: new Map([
				['relief', 1.7],
				['engraving', 1.4],
				['polish', 1.3],
			]),
			motifVocabulary: {
				motifs: [
					{ id: 'watching-cat', label: 'Watching Cat', culturalOrigin: 'xoconahtl' },
					{ id: 'grain-bearer', label: 'Grain Bearer', culturalOrigin: 'xoconahtl' },
				],
			},
			craftInvestment: {
				contextWeights: new Map([
					['deliberate-placement', 1.5],
					['foundation-deposit', 1.1],
				]),
				siteTypeWeights: new Map([
					['shrine', 1.5],
					['cache', 1.0],
				]),
			},
		},
		phase: {
			technology: {
				metallurgy: 0.3,
				ceramics: 0.6,
				textiles: 0.4,
				// Lowest in the set, and the only preset whose geology puts leather (`scarce`) below
				// linen (`available`). A humid climate is actively hostile both to hide preservation
				// and to tanning at scale; this culture's monumental work is in stone.
				leatherWorking: 0.30,
				stoneWorking: 0.75,
				glassWorking: 0.1,
				woodWorking: 0.5,
				boneWorking: 0.4,
			},
			economy: { tradeOpenness: 0.4, surplus: 0.5, urbanisation: 0.45 },
			society: {
				stratification: 0.6,
				militarisation: 0.3,
				religiousEmphasis: 0.85,
				craftSpecialisation: 0.6,
			},
			aesthetics: { decorativeEmphasis: 0.7, motifComplexity: 0.8, formConservatism: 0.6 },
		},
		// Stone-rich and metal-absent — the mirror of Khaltiris. Obsidian and granite underfoot,
		// jade within reach, but bronze and iron simply do not arrive: the single low-volume flow
		// carries precious metal only, so a monumental culture still works stone by choice and by
		// necessity.
		geology: geology('highland', {
			bronze: 'absent',
			iron: 'absent',
			gold: 'trade-only',
			silver: 'absent',
			obsidian: 'abundant',
			flint: 'scarce',
			granite: 'abundant',
			jade: 'available',
			oak: 'available',
			ash: 'scarce',
			bone: 'available',
			antler: 'scarce',
			'fired-clay': 'abundant',
			glass: 'absent',
			linen: 'available',
			leather: 'scarce',
		}),
		trade: [
			// Was keyed on `precious-metal` (roadmap 2GN.78), then on `metal` + `specificMaterials`,
			// which reached the whole class rather than restricting it (2GN.112). Xoconahtl's single
			// low-volume flow carries gold and silver and nothing else, which is now what it says.
			// Note the culture header's claim that bronze and iron "simply do not arrive" is true
			// twice over: this flow excludes them *and* the geology marks both `absent`, which
			// `isAvailable` rejects before trade is consulted.
			{
				includes: [{ id: 'gold' }, { id: 'silver' }],
				direction: 'a-to-b',
				volume: 0.3,
			},
		],
	},
	{
		id: 'khaltiris',
		label: 'Khaltiris',
		description: 'Imperial metalworking culture — high specialisation, gold and silver inlay.',
		profile: {
			// `precious-metal: 1.4` removed with the tag (roadmap 2GN.78). Dead data, like Xoconahtl's:
			// gold and silver carried both tags and `metal: 1.7` always won the max. This is the
			// specific entry doc 12 §2.34 measured when it folded the semantics question into 2GN.78.
			// The max is gone (2GN.123); as with Xoconahtl, the old pair read as valuing gold and
			// silver *below* metal generally, so it is left unrestored pending a ruling on intent.
			materialAffinities: materialAffinities([
				['metal', 1.7],
				['stone', 1.1],
				// The seven entries below close this preset's eight 2GN.128 violations. Khaltiris is the
				// only preset with **zero** legitimate silences — nothing in its geology is `absent` and
				// both `trade-only` materials have a flow — so it must state a position on all sixteen.
				// Nine entries do it, because the two class entries above already carry eight materials:
				// the terseness the ruling protects, tested against its hardest case.
				//
				// ⚠️ The parked gold/silver question above is deliberately left parked. `metal: 1.7`
				// covers both, so the obligation is discharged without re-authoring intent that 2GN.123
				// explicitly deferred pending a ruling. 2GN.128 does not disturb it.
				//
				// The exception to `stone`, and the second-clearest most-specific-wins case in the set:
				// jade is `trade-only` and arrives by a dedicated jade-only flow, which is what the
				// culture header means by "an imperial metalworking culture that has to import its
				// ornament". Maintaining a route for one stone while granite lies `abundant` underfoot
				// is a specific preference, not a class one.
				[{ id: 'jade' }, 1.6],
				// The other import, by its own flow: `trade-only` and wanted.
				['glass', 1.4],
				// Armour backing, scabbards, harness and shield facing, with dedicated tanners implied
				// by `craftSpecialisation: 0.85` — the case the `leatherWorking` comment already makes.
				['leather', 1.1],
				// Structural rather than displayed; not what an imperial workshop signs its name to.
				['wood', 0.9],
				// Utilitarian ware beside inlaid metal, matching `ceramics: 0.5`.
				['clay', 0.8],
				// Matches `boneWorking: 0.3`, joint-lowest in the set.
				['bone', 0.7],
				// `scarce` here and `textiles: 0.45` — the one organic this culture neither has nor
				// prizes. Slightly below neutral rather than lower: cloth is still needed, just bought.
				['fiber', 0.9],
			]),
			techniqueAffinities: new Map([
				['inlay', 1.6],
				['gilding', 1.5],
				['engraving', 1.3],
			]),
			motifVocabulary: {
				motifs: [
					{ id: 'storm-crown', label: 'Storm Crown', culturalOrigin: 'khaltiris' },
					{ id: 'winged-disc', label: 'Winged Disc', culturalOrigin: 'khaltiris' },
				],
			},
			craftInvestment: {
				contextWeights: new Map([
					['foundation-deposit', 1.4],
					['hoard', 1.0],
				]),
				siteTypeWeights: new Map([
					['fortification', 1.3],
					['settlement', 1.0],
				]),
			},
		},
		phase: {
			technology: {
				metallurgy: 0.9,
				ceramics: 0.5,
				textiles: 0.45,
				// Above its `textiles`: an imperial military culture needs tanned hide at scale for
				// armour backing, scabbards, harness and shield facing, and its `craftSpecialisation`
				// of 0.85 implies dedicated tanners rather than household-level work. Geology has
				// leather `available` against linen `scarce`.
				leatherWorking: 0.60,
				stoneWorking: 0.6,
				glassWorking: 0.3,
				woodWorking: 0.4,
				boneWorking: 0.3,
			},
			economy: { tradeOpenness: 0.6, surplus: 0.7, urbanisation: 0.65 },
			society: {
				stratification: 0.85,
				militarisation: 0.6,
				religiousEmphasis: 0.5,
				craftSpecialisation: 0.85,
			},
			aesthetics: { decorativeEmphasis: 0.65, motifComplexity: 0.7, formConservatism: 0.4 },
		},
		// Metal-rich and the mirror of Xoconahtl: bronze and iron abundant, gold scarce rather than
		// absent, and the two things it cannot dig for — jade and glass — arrive by trade. An
		// imperial metalworking culture that has to import its ornament.
		geology: geology('citadel', {
			bronze: 'abundant',
			iron: 'abundant',
			gold: 'scarce',
			silver: 'available',
			obsidian: 'scarce',
			flint: 'scarce',
			granite: 'abundant',
			jade: 'trade-only',
			oak: 'available',
			ash: 'available',
			bone: 'available',
			antler: 'scarce',
			'fired-clay': 'available',
			glass: 'trade-only',
			linen: 'scarce',
			leather: 'available',
		}),
		trade: [
			// Was keyed on `precious-stone` (roadmap 2GN.78), whose only carrier was jade, then on
			// `stone` + `specificMaterials`, which reached obsidian, flint and granite as well
			// (2GN.112). The jade-only flow the original tag described is now stated directly.
			{
				includes: [{ id: 'jade' }],
				direction: 'bidirectional',
				volume: 0.5,
			},
			{ includes: [{ tag: 'glass' }], direction: 'a-to-b', volume: 0.4 },
		],
	},
];

/**
 * Every preset satisfies the 2GN.127 affinity-silence rule, checked once at module load
 * (roadmap 2GN.128, doc 11 §2.15).
 *
 * The ruling requires enforcement at **profile-construction time** rather than during generation.
 * For a hand-authored const array that moment is module evaluation: these presets have no
 * constructor function, and inventing one purely to host this check would be authoring machinery for
 * a shape nothing has, which 2GN.110's precedent explicitly declines. Same form as
 * `data/classification.ts`'s `RULES_BY_ID` duplicate-id guard.
 *
 * So a violating preset fails the import — the dev server, the build and the test run all stop —
 * instead of silently skewing one artefact in a thousand draws.
 *
 * ⚠️ This is the module's first **value** import from `engine/generation/`, where it previously took
 * only types. Deliberate: the data→engine direction is already established (`materials.ts` imports
 * `data/materials.ts`), and the alternative is a data module that cannot check its own invariant.
 */
for (const culture of EXPLORER_CULTURES) {
	assertAffinitiesCoverAccessibleMaterials(
		culture.id,
		culture.profile,
		culture.phase,
		culture.geology,
		culture.trade,
	);
}

/**
 * An `ExplorerCulture` as a `CulturePhaseSample`, for baseline sampling (roadmap 2GN.95).
 *
 * `ExplorerCulture` already carries `profile` + `phase` + `geology` + `trade` in one record, all 16
 * shipped materials modelled — exactly what `sampleBaselines` needs, and the only `src/lib/`
 * (rather than `tests/fixtures/`) source that does.
 */
export function explorerCulturePhase(culture: ExplorerCulture): CulturePhaseSample {
	return {
		cultureId: culture.id,
		phaseId: culture.id, // Each preset carries a single phase; the id doubles as the phase id.
		profile: culture.profile,
		phase: culture.phase,
		geology: culture.geology,
		trade: culture.trade,
	};
}
