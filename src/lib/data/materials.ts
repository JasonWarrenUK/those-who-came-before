/**
 * MVP material definitions (doc 05 §7, §15, roadmap 2GN.22).
 *
 * `assignMaterial` (roadmap 2GN.23, `engine/generation/materials.ts`) filters this list by
 * component compatibility (`tags`), then by geological availability (`GeologicalContext`, keyed
 * against `id`) and cultural affinity (`CulturalProfile.materialAffinities`, keyed against
 * `tags`) before weighting survivors by `craftDomain` against `PhaseCharacteristics.technology`.
 * None of that filtering/weighting/availability logic lives here — this module is static data
 * only, no behaviour. Decoration prerequisite-checking against `decorability`
 * (`src/lib/data/decorations.ts`, roadmap 2GN.28) is likewise out of scope.
 *
 * Superseded reference: `backlog/materials.ts` held only a flat `string[][]` of names grouped by
 * category (doc 05 §15 calls this a full replacement, not a porting source). `mercury`, `pewter`,
 * `steel` and the extra wood duplicates (`elm`, `mahogany`, `willow`) are dropped here as
 * anachronistic or redundant against doc 05's implied bronze/iron-age scope; `oak`/`ash` already
 * cover the wood category.
 *
 * Every `MaterialTag` (`tags.ts`) has at least one entry below.
 *
 * `physicalProperties.formability` (roadmap 2GN.102) is read at the material's *working* state, the
 * one axis on that convention — see its JSDoc (`types/artefact.ts`) for why, and why its five
 * siblings are inconsistent with it. `fired-clay`'s comment below is the one place that
 * inconsistency was previously named at all, as a one-off aside; reconciling all six axes into a
 * genuine per-state model is filed downstream of 2GN.102, not attempted here.
 */

import type { MaterialDefinition } from '../types/artefact.ts';

export const MATERIALS: readonly MaterialDefinition[] = [
	{
		id: 'bronze',
		displayName: 'Bronze',
		tags: ['metal'],
		craftDomain: 'metallurgy',
		physicalProperties: {
			hardness: 4, // Mohs ≈3–4 for a copper-tin alloy, harder than pure copper.
			fragility: 2, // Ductile: deforms under a bad strike rather than cracking.
			rigidity: 5,
			grainFineness: 5, // Fine enough for the engraved and cast detail the record attests.
			porosity: 1,
			combustibility: 1,
			formability: 5, // Melts and casts to a mould within period reach; also cold-works.
		},
		// Verdigris is the textbook bronze patina — the most reactive metal here after iron.
		reactivity: { oxidisation: 6 },
		decorability: { engravable: true, paintable: false, glazeable: false },
	},
	{
		id: 'iron',
		displayName: 'Iron',
		tags: ['metal'],
		craftDomain: 'metallurgy',
		physicalProperties: {
			hardness: 5, // Mohs ≈4–5 for worked iron (not modern hardened steel).
			fragility: 2,
			rigidity: 6,
			grainFineness: 4, // Coarser under hand tools than bronze or the precious metals.
			porosity: 2, // Rust opens minor surface porosity that the other metals lack.
			combustibility: 1,
			// No melt in period reach, but forged hot — a genuine plastic working regime, not a lesser
			// route than casting (roadmap 2GN.102: rung 5 deliberately groups melt and hot-forge alike).
			formability: 5,
		},
		reactivity: { oxidisation: 7 }, // Rusts readily — the most reactive material in the set.
		decorability: { engravable: true, paintable: false, glazeable: false },
	},
	{
		id: 'gold',
		displayName: 'Gold',
		tags: ['metal', 'precious-metal'],
		craftDomain: 'metallurgy',
		physicalProperties: {
			hardness: 3, // Mohs ≈2.5–3, the softest metal here alongside silver.
			fragility: 1, // Extreme ductility: it deforms, it does not crack.
			rigidity: 5,
			grainFineness: 7, // Near-amorphous working grain — why chasing and repoussé reach such fine detail.
			porosity: 1,
			combustibility: 1,
			// Melts and casts; also the most cold-workable metal in the catalogue (leaf, chasing,
			// repoussé) — either route is a genuine plastic working regime.
			formability: 5,
		},
		// `0`, not `-1`: gold has oxidation chemistry, it is simply famously resistant to it.
		reactivity: { oxidisation: 0 },
		decorability: { engravable: true, paintable: false, glazeable: false },
	},
	{
		id: 'silver',
		displayName: 'Silver',
		tags: ['metal', 'precious-metal'],
		craftDomain: 'metallurgy',
		physicalProperties: {
			hardness: 3, // Mohs ≈2.5–3, same tier as gold.
			fragility: 1,
			rigidity: 5,
			grainFineness: 6,
			porosity: 1,
			combustibility: 1,
			formability: 5, // Melts and casts, same tier as gold and bronze.
		},
		reactivity: { oxidisation: 3 }, // Tarnishes visibly and classically, unlike gold.
		decorability: { engravable: true, paintable: false, glazeable: false },
	},
	{
		id: 'obsidian',
		displayName: 'Obsidian',
		tags: ['stone'],
		craftDomain: 'stoneWorking',
		physicalProperties: {
			// Mohs ≈5–5.5 — genuinely *softer* than flint despite feeling sharper. Obsidian's edge
			// comes from conchoidal fracture, not from mineral hardness; the two are different facts,
			// which is exactly why `fragility` exists as its own axis.
			hardness: 5,
			fragility: 6, // Textbook conchoidal fracture: flakes readily under a mis-strike.
			rigidity: 7,
			grainFineness: 7, // A true volcanic glass — no crystal structure to deflect a cut, hence knapped edges sharper than steel.
			porosity: 1,
			combustibility: 1,
			// Worked only by conchoidal fracture: removal cannot be steered into a raised form, however
			// fine the resulting edge (roadmap 2GN.102 — the pair this axis exists to split from granite).
			formability: 1,
		},
		reactivity: { oxidisation: -1 }, // Mineral: no oxidation chemistry to speak of.
		decorability: { engravable: true, paintable: false, glazeable: false },
	},
	{
		id: 'flint',
		displayName: 'Flint',
		tags: ['stone'],
		craftDomain: 'stoneWorking',
		physicalProperties: {
			hardness: 7, // Mohs ≈7, microcrystalline quartz — harder than obsidian.
			fragility: 6, // Knapping *is* controlled fracture; an uncontrolled one shatters the piece.
			rigidity: 7,
			grainFineness: 6, // Very fine cryptocrystalline structure, just behind obsidian's true glass.
			porosity: 1,
			combustibility: 1,
			formability: 1, // Same regime as obsidian: knapping is controlled fracture, not controlled removal.
		},
		reactivity: { oxidisation: -1 },
		decorability: { engravable: false, paintable: false, glazeable: false },
	},
	{
		id: 'granite',
		displayName: 'Granite',
		tags: ['stone'],
		craftDomain: 'stoneWorking',
		physicalProperties: {
			hardness: 6, // Mohs 6-7, a mixed feldspar/quartz rock; pinned at the feldspar-dominated low end rather than quartz's 7, since feldspar is the majority mineral by volume.
			// Notably *less* fragile than flint or obsidian: real masons rough-dress granite without
			// it shattering. Its limit is precision, not survival — see `grainFineness`.
			fragility: 3,
			rigidity: 7,
			// The case that motivated this axis. Coarse crystalline grains visible to the eye cap
			// achievable fineness however carefully the stone is worked — nothing about hardness,
			// fragility or rigidity predicts that.
			grainFineness: 3,
			porosity: 2,
			combustibility: 1,
			// No plastic regime, but abraded and pecked in controlled increments, unlike obsidian and
			// flint's uncontrollable conchoidal fracture — the split this axis exists to make (roadmap
			// 2GN.102). Carved granite relief is a real tradition despite sharing `craftDomain` with the
			// materials this axis must exclude.
			formability: 4,
		},
		reactivity: { oxidisation: -1 },
		decorability: { engravable: false, paintable: false, glazeable: false },
	},
	{
		id: 'jade',
		displayName: 'Jade',
		// Carries both tiers, matching gold/silver's `['metal', 'precious-metal']` (roadmap 2GN.84
		// catalogue audit) — `precious-stone` alone made jade invisible to any plain `stone` affinity
		// or `allowedMaterialTags: ['stone']` constraint, which no other precious material exhibits.
		tags: ['stone', 'precious-stone'],
		craftDomain: 'stoneWorking',
		physicalProperties: {
			hardness: 6, // Mohs ≈6–6.5 for nephrite/jadeite.
			// Famously tough *for its hardness*: an interlocking fibrous mineral structure resists
			// fracture far better than a Mohs reading alone predicts, which is precisely why real
			// carving traditions prized it.
			fragility: 2,
			rigidity: 7,
			grainFineness: 6,
			porosity: 1,
			combustibility: 1,
			formability: 4, // Same regime as granite: carved by controlled abrasive removal.
		},
		reactivity: { oxidisation: -1 },
		decorability: { engravable: true, paintable: false, glazeable: false },
	},
	{
		id: 'oak',
		displayName: 'Oak',
		tags: ['wood'],
		craftDomain: 'woodWorking',
		physicalProperties: {
			hardness: 4,
			fragility: 2, // Splits and splinters along the grain rather than shattering.
			rigidity: 5,
			grainFineness: 4, // Open, visible grain: carving must follow it, capping fine detail.
			porosity: 4, // Absorbent — takes stain and paint readily.
			combustibility: 5, // Seasoned hardwood ignites around 300 °C.
			formability: 4, // No plastic regime; carved and worked by controlled removal along the grain.
		},
		// Wood darkens through UV and lignin breakdown rather than oxidation, so this is low but
		// non-zero rather than not-applicable.
		reactivity: { oxidisation: 1 },
		decorability: { engravable: true, paintable: true, glazeable: false },
	},
	{
		id: 'ash',
		displayName: 'Ash',
		tags: ['wood'],
		craftDomain: 'woodWorking',
		physicalProperties: {
			hardness: 4,
			// More shock-resistant than oak — the historical choice for tool handles and impact-bearing
			// parts for exactly this reason.
			fragility: 1,
			rigidity: 5,
			grainFineness: 4,
			porosity: 4,
			combustibility: 5,
			formability: 4, // Same regime as oak.
		},
		reactivity: { oxidisation: 1 },
		decorability: { engravable: true, paintable: true, glazeable: false },
	},
	{
		id: 'bone',
		displayName: 'Bone',
		tags: ['bone'],
		craftDomain: 'boneWorking',
		physicalProperties: {
			hardness: 3,
			fragility: 4, // Splinters under a mis-struck blow — less forgiving than wood's split-along-grain.
			rigidity: 5,
			grainFineness: 5, // Fine and consistent: the record attests bone pins, needles and fine decorative work.
			porosity: 4,
			// Chars and pyrolyses from roughly 300–400 °C without a clean ignition point, so it sits
			// low but non-zero — an approximation, see the axis JSDoc.
			combustibility: 2,
			// Controlled removal, but splinters readily under working — the same fragility that caps
			// how much raised form it reliably holds, one rung below antler's better resilience.
			formability: 3,
		},
		// "Bone patina" is a real archaeological term of art: the residual organic collagen and
		// handling oils do age oxidatively, unlike wood's UV-driven darkening.
		reactivity: { oxidisation: 2 },
		decorability: { engravable: true, paintable: false, glazeable: false },
	},
	{
		id: 'antler',
		displayName: 'Antler',
		tags: ['bone'],
		craftDomain: 'boneWorking',
		physicalProperties: {
			hardness: 4, // Denser and harder than bone.
			// Markedly more resilient than bone under impact — the reason it was preferred for tool
			// handles and pressure-flaking tools.
			fragility: 2,
			rigidity: 6,
			grainFineness: 5,
			porosity: 3, // Denser than bone, so slightly less absorbent.
			combustibility: 2,
			// A rung above bone: the same working impact-resilience that made antler the preferred
			// choice for pressure-flaking tools also means controlled removal holds a raised form more
			// reliably, without bone's greater splinter risk.
			formability: 4,
		},
		reactivity: { oxidisation: 2 },
		decorability: { engravable: true, paintable: false, glazeable: false },
	},
	{
		id: 'fired-clay',
		displayName: 'Fired clay',
		tags: ['clay'],
		craftDomain: 'ceramics',
		physicalProperties: {
			hardness: 3,
			fragility: 6, // Once fired, it shatters outright — no give.
			rigidity: 7,
			grainFineness: 6, // A fine homogeneous fired matrix; fragility is the limiter here, not grain.
			// The highest porosity in the catalogue alongside linen, and the physical reason glazing
			// exists as a technique at all.
			porosity: 6,
			combustibility: 1, // Already fired: inert to further heat in this range.
			// Modelled wet, a true plastic state, before firing — this axis reads that working moment,
			// not the fired result `fragility`/`rigidity`/`grainFineness` above describe (roadmap
			// 2GN.102; see the axis JSDoc for why the other six axes read the finished object instead).
			formability: 6,
		},
		reactivity: { oxidisation: -1 },
		// Workable pre-firing (incising is how clay decoration usually happens), but modelled here
		// as post-firing, at which point it's brittle rather than incisable — hence not engravable.
		decorability: { engravable: false, paintable: true, glazeable: true },
	},
	{
		id: 'glass',
		displayName: 'Glass',
		tags: ['glass'],
		craftDomain: 'glassWorking',
		physicalProperties: {
			hardness: 5, // Mohs ≈5.5 — the same amorphous-silicate family as obsidian.
			// The ceiling of the scale, and the material whose behaviour this axis was introduced to
			// capture: glass shatters with essentially no forgiveness.
			fragility: 7,
			rigidity: 7,
			grainFineness: 7, // Amorphous: a controlled cut can be extremely precise, right up until it isn't.
			porosity: 1, // Vitrified and sealed.
			combustibility: 1,
			// Cast, blown or pressed hot — a true viscous working state; this axis reads hot glass, not
			// the cold, shattering-prone object `fragility`/`grainFineness` above describe (roadmap
			// 2GN.102's motivating case).
			formability: 6,
		},
		reactivity: { oxidisation: -1 },
		// `engravable`/`paintable` (roadmap 2GN.84): wheel-cut and diamond-point engraving on glass is
		// attested from Roman cage cups onward, and cold-painting/enamelling from Islamic enamelled
		// glass through later Bohemian work — both genuine, well-established crafts. `glazeable` stays
		// false: glaze is a ceramic process, which glass isn't.
		decorability: { engravable: true, paintable: true, glazeable: false },
	},
	{
		id: 'linen',
		displayName: 'Linen',
		tags: ['fiber'],
		craftDomain: 'textiles',
		physicalProperties: {
			hardness: 1, // Denting barely applies to a woven fibre.
			fragility: 1, // Fails by tearing and fraying — a wholly different mode from fracture.
			rigidity: 1, // Fully pliable: the defining trait, and why it holds no incised line.
			grainFineness: 1, // A fibre weave, not a cuttable microstructure.
			porosity: 6,
			combustibility: 7, // Fibre ignites near 210 °C — the lowest ignition point in the catalogue.
			// Shares rung 1 with obsidian for a different reason: a woven fibre has no shaping regime
			// at all, rather than obsidian's unsteerable one. Already excluded from `relief` by
			// `rigidity`, so this value is not load-bearing for that gate (roadmap 2GN.102).
			formability: 1,
		},
		reactivity: { oxidisation: -1 },
		decorability: { engravable: false, paintable: true, glazeable: false },
	},
	{
		id: 'leather',
		displayName: 'Leather',
		tags: ['leather'],
		// Hide-working is its own craft, not a branch of weaving (roadmap 2GN.100). `linen` keeps
		// `textiles`; tanning, cutting and stamping hide answer to `leatherWorking`.
		craftDomain: 'leatherWorking',
		physicalProperties: {
			hardness: 1,
			fragility: 1, // Tears rather than fractures, like linen.
			rigidity: 2, // Slightly stiffer than woven cloth — cured hide holds some shape.
			// Has a genuine surface grain, unlike woven fibre: real leather takes tooling and stamping,
			// which is why leatherworking has carved decoration traditions that fabric craft lacks.
			grainFineness: 2,
			porosity: 5,
			combustibility: 4, // Chars near 200 °C but sustains ignition nearer 270 °C — denser than loose fibre.
			// Wet-moulded (cuir bouilli) or stamped/tooled cured: real but limited raised-form capacity,
			// distinct from a true plastic state — the material this axis exists to correctly admit to
			// `relief`, where `rigidity` previously excluded it on no material-science basis (roadmap
			// 2GN.102; `studs`/`gilding`/`overlay` already carry a named leather exception for the same
			// reason).
			formability: 3,
		},
		reactivity: { oxidisation: -1 },
		decorability: { engravable: false, paintable: true, glazeable: false },
	},
];
