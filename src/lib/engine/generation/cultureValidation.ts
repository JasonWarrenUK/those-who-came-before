/**
 * Cultural-profile validation (roadmap 2GN.128, doc 11 §2.15) — enforces the 2GN.127 ruling that
 * silence in `CulturalProfile.materialAffinities` means *inaccessible*.
 *
 * `culturalAffinityWeight` returns a neutral `1` for any material no entry matches, so an unauthored
 * material was indistinguishable from one deliberately authored at exactly `1.0`: "considered and
 * indifferent" and "never considered" read identically. The 2GN.127 ruling did not change that
 * resolver. It made silence a **validation** question instead, because the world model already
 * carries the fact that separates the two cases:
 *
 * > Silence is legitimate **iff** the material is inaccessible to that culture — `absent` locally
 * > with no `MaterialFlow` reaching it, **or** unmodelled in that geology. A material that is
 * > locally obtainable, or `trade-only` with a flow that reaches it, **must** carry a matching
 * > affinity entry, class or specific.
 *
 * That is why none of the brief's four options (a sentinel value, a `completeness` flag, mandatory
 * exhaustiveness, or keeping the default) was taken: absence is derivable, so no authored profile
 * needs to change shape and no new syntax is introduced.
 *
 * Pure TypeScript with no framework or browser dependencies (doc 08 §2.1, the engine boundary).
 *
 * ⚠️ **This is not applied to `tests/fixtures/culture.ts`'s `mockCulturalProfile`, and cannot be.**
 * Accessibility is derived from a geology and trade set that fixture does not carry — it returns a
 * bare profile with neither. The rule is not "a profile must be exhaustive"; it is "a profile
 * *paired with a world* must cover what that world makes accessible". Engine fixtures are therefore
 * out of scope by the shape of the rule rather than by an exemption, and tests passing
 * `{ materialAffinities: [] }` are exercising `culturalAffinityWeight`'s neutral default, which the
 * ruling explicitly leaves in place. Do not "complete" this rule by hooking it into the fixture.
 */

import type { MaterialDefinition } from '../../types/artefact.ts';
import type {
	AvailabilityLevel,
	CulturalProfile,
	GeologicalContext,
	MaterialFlow,
	PhaseCharacteristics,
} from '../../types/world.ts';
import type { MaterialName } from '../../types/tags.ts';
import { MATERIALS } from '../../data/materials.ts';
import { explainMaterialWeight, selectorMatches } from './materials.ts';

/** One material a culture can obtain but expresses no view on — a 2GN.127 silence violation. */
export interface AffinitySilenceViolation {
	/** The uncovered material. */
	materialId: MaterialName;

	/**
	 * Its best availability level across regions. Never `undefined`: an unmodelled material is
	 * legitimate silence, so it is never reported as a violation.
	 */
	level: AvailabilityLevel;

	/** `true` when the material is `trade-only` locally and a `MaterialFlow` reaches it. */
	tradeRescued: boolean;
}

/**
 * Whether any affinity entry covers `material`, by its own id or by its class.
 *
 * ⚠️ Deliberately not `culturalAffinityWeight(...) !== 1`. That test cannot work: an entry authored
 * at exactly `1.0` is a real, deliberate statement of indifference (xoconahtl authors one for clay)
 * and resolves to the same `1` as no entry at all. Coverage is about an entry's *presence*, which is
 * precisely the distinction the 2GN.127 ruling turns on.
 */
function isCovered(material: MaterialDefinition, profile: CulturalProfile): boolean {
	return profile.materialAffinities.some((entry) => selectorMatches(material, entry.selector));
}

/**
 * Every accessible material `profile` states no position on (roadmap 2GN.128, doc 11 §2.15). An
 * empty array means the profile satisfies the ruling.
 *
 * Reports rather than throws, so the Explorer panels and any future authoring tool can list the gaps
 * without exploding; `assertAffinitiesCoverAccessibleMaterials` is the throwing half. Same split as
 * `ruleById`/`requireRuleById` in `data/classification.ts`.
 *
 * **The three-state accessibility read is the subtle part.** `isAvailable` carries an MVP lenience
 * returning `true` for a material with no geology entry, which read naively *inverts* the rule — an
 * unmodelled material is the strongest possible case for "this culture never encountered it", not a
 * reason to demand an opinion about it. So accessibility here is
 * `level !== undefined && available`, reading both fields `explainMaterialWeight` already exposes
 * separately, exactly as `scarcityWeight`'s JSDoc already treats `undefined` as a third state
 * distinct from available/absent. ⚠️ Never simplify this to a bare `isAvailable` call;
 * `cultureValidation.test.ts` pins the divergence deliberately.
 *
 * ⚠️ **The obligation is one-directional**, and falls out by construction rather than by a special
 * case: this only ever asks whether a matching entry exists, so it can report a missing entry but
 * never an unnecessary one. A `{ tag: 'metal' }: 1.5` entry covering a gold that no flow reaches is
 * well-formed and silent — a culture may legitimately prize a material it has never held.
 *
 * @param profile - The culture whose affinity map is being checked.
 * @param phase - The phase this culture generates against. Read only to satisfy
 *   `explainMaterialWeight`'s signature; no phase attribute affects accessibility.
 * @param geology - World-level material scarcity, the local half of the accessibility read.
 * @param trade - Material flows reaching this culture, the trade half.
 * @param materials - The candidate catalogue. Defaults to the shipped `MATERIALS`.
 * @returns One entry per accessible-but-uncovered material, in catalogue order.
 */
export function findAffinitySilenceViolations(
	profile: CulturalProfile,
	phase: PhaseCharacteristics,
	geology: GeologicalContext,
	trade: readonly MaterialFlow[],
	materials: readonly MaterialDefinition[] = MATERIALS,
): AffinitySilenceViolation[] {
	const violations: AffinitySilenceViolation[] = [];

	for (const material of materials) {
		if (isCovered(material, profile)) continue;

		const explanation = explainMaterialWeight(material, profile, phase, geology, trade);

		// Unmodelled (`level === undefined`) is legitimate silence, not accessibility — see the JSDoc.
		if (explanation.level === undefined || !explanation.available) continue;

		violations.push({
			materialId: material.id,
			level: explanation.level,
			tradeRescued: explanation.tradeRescued,
		});
	}

	return violations;
}

/**
 * Throws when `profile` is silent about a material it can obtain (roadmap 2GN.128).
 *
 * Called at **profile-construction time** — for the hand-authored `EXPLORER_CULTURES` array that
 * means module evaluation — rather than during generation, so a violating profile fails the build
 * and the dev server outright instead of quietly skewing one artefact in a thousand draws.
 *
 * The message lists every violation with its availability level, not just a count: the author needs
 * the list to act on, and the level is what tells them whether the fix is an affinity entry or a
 * correction to the geology.
 *
 * @param label - Identifies the profile in the error message; a preset or culture id.
 * @throws When any accessible material carries no matching affinity entry.
 */
export function assertAffinitiesCoverAccessibleMaterials(
	label: string,
	profile: CulturalProfile,
	phase: PhaseCharacteristics,
	geology: GeologicalContext,
	trade: readonly MaterialFlow[],
	materials: readonly MaterialDefinition[] = MATERIALS,
): void {
	const violations = findAffinitySilenceViolations(profile, phase, geology, trade, materials);
	if (violations.length === 0) return;

	const listed = violations
		.map(({ materialId, level, tradeRescued }) =>
			`  ${materialId} (${level}${tradeRescued ? ', reached by trade' : ''})`
		)
		.join('\n');

	throw new Error(
		`CulturalProfile '${label}': ${violations.length} accessible material(s) carry no affinity ` +
			`entry, which the 2GN.127 silence rule forbids — silence is legitimate only for a material ` +
			`the culture cannot obtain. Add a class entry ({ tag }) covering each, or a specific entry ` +
			`({ id }):\n${listed}\n` +
			`A class entry discharges the obligation for its whole class; see doc 11 §2.15.`,
	);
}
