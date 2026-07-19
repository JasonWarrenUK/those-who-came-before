/**
 * Component grammar expansion engine (doc 05 §5.3–§5.5, roadmap 2GN.3–2GN.7).
 *
 * Runs the bottom-up structural grammar: weighted, culture- and phase-biased selection over the
 * production rules authored in `data/grammars/core.ts`, expanding them into a tree of geometric
 * components, with group repetition bounded by the complexity budget the culture's
 * `craftSpecialisation` derives (doc 05 §5.5) and validated post-expansion by accumulation
 * checking (`checkAccumulation`). The grammar produces physical structures, never functional
 * categories (doc 05 §5.1) — nothing here branches by intent, only by weight.
 *
 * Pure TypeScript with no framework or browser dependencies (doc 08 §2.1, the engine boundary),
 * matching `engine/prng.ts`. Determinism flows entirely from the injected PRNG.
 */

import type {
	AccumulationConstraints,
	ArrangementPattern,
	AttachmentBranch,
	ComponentGroupNode,
	ComponentNode,
	ExpandedObject,
	GrammarOption,
	GrammarRule,
} from '../../types/grammar.ts';
import { isAttachmentType } from '../../types/grammar.ts';
import type { CulturalProfile, PhaseCharacteristics } from '../../types/world.ts';
import type {
	Attachment,
	InspectionDepth,
	NormalisedArtefact,
	NormalisedComponent,
	ObjectDimensions,
	Portability,
} from '../../types/artefact.ts';
import type { MaterialTag } from '../../types/tags.ts';
import { isPrimitiveType, PRIMITIVE_PARAMETERS } from '../../data/grammars/primitives.ts';
import { weightedSelect } from '../prng.ts';

/**
 * Resolves a dotted `PhaseCharacteristics` path (e.g. `'technology.metallurgy'`) to its numeric
 * attribute. Generic over the profile's shape so new attributes need no code change here.
 *
 * Throws on a path that doesn't resolve to a number: grammar data is authored in-repo (and
 * `data/grammars/core.test.ts` guards the shipped keys), so a miss is always an authoring typo —
 * better a loud failure than a silently skewed distribution.
 */
function resolvePhaseAttribute(phase: PhaseCharacteristics, path: string): number {
	let current: unknown = phase;

	for (const segment of path.split('.')) {
		if (current === null || typeof current !== 'object' || !(segment in current)) {
			throw new Error(`phaseInfluence: unknown phase characteristic path '${path}'`);
		}
		current = (current as Record<string, unknown>)[segment];
	}

	if (typeof current !== 'number') {
		throw new Error(
			`phaseInfluence: phase characteristic path '${path}' does not resolve to a number`,
		);
	}

	if (!Number.isFinite(current) || current < 0 || current > 1) {
		throw new Error(
			`phaseInfluence: phase characteristic path '${path}' must be in [0, 1], got ${current}`,
		);
	}

	return current;
}

/**
 * Computes the phase-characteristic weight multiplier for a grammar option (doc 05 §5.4, roadmap
 * 2GN.5) — the `weight *= phaseInfluence(option, phase)` step of `selectGrammarOption`.
 *
 * This is where `GrammarOption.phaseModifiers`' provisional contract firms up. Each
 * `[dottedPath, multiplier]` entry resolves its attribute `a` (0–1) from the phase profile and
 * contributes the factor `1 + (multiplier − 1) × a`: neutral at `a = 0`, the full multiplier at
 * `a = 1`. A multiplier below 1 therefore suppresses in proportion to the attribute (e.g.
 * `formConservatism` damping exotic branches), while "low technology" never suppresses below the
 * base weight — matching doc 05 §3.2's framing that high attributes *increase* probabilities.
 * Entries combine by product.
 *
 * @param option - The grammar option whose `phaseModifiers` (if any) are evaluated.
 * @param phase - The phase profile the option is being drawn under.
 * @returns The combined multiplier; a neutral `1` when the option has no phase modifiers.
 */
export function phaseInfluence(option: GrammarOption, phase: PhaseCharacteristics): number {
	if (option.phaseModifiers === undefined || option.phaseModifiers.size === 0) {
		return 1;
	}

	let factor = 1;
	for (const [path, multiplier] of option.phaseModifiers) {
		if (!Number.isFinite(multiplier) || multiplier <= 0) {
			throw new Error(
				`phaseInfluence: phase modifier multiplier for '${path}' must be finite and positive, got ${multiplier}`,
			);
		}
		const attribute = resolvePhaseAttribute(phase, path);
		factor *= 1 + (multiplier - 1) * attribute;
	}

	return factor;
}

/**
 * The doc 05 §5.4 weight formula: `baseWeight`, shifted additively by each cultural modifier
 * against the culture's material affinities (a missing affinity reads as 0), scaled by
 * `phaseInfluence`, floored at 0.01. The floor ensures nothing is completely impossible — even a
 * deeply pacifist culture occasionally produces a blade. Because archaeology.
 */
function effectiveOptionWeight(
	option: GrammarOption,
	culture: CulturalProfile,
	phase: PhaseCharacteristics,
): number {
	let weight = option.baseWeight;

	for (const [tag, modifier] of option.culturalModifiers) {
		weight += (culture.materialAffinities.get(tag) ?? 0) * modifier;
	}

	weight *= phaseInfluence(option, phase);

	return Math.max(0.01, weight);
}

/**
 * Draws one production alternative from a rule, biased by culture and phase (doc 05 §5.4,
 * roadmap 2GN.4). Culture doesn't dictate what the grammar produces — it biases the
 * probabilities; the 0.01 floor keeps every option reachable, however unlikely.
 *
 * Adapts the doc's pseudocode (a two-arg `weightedSelect` over precomputed pairs) to the real
 * callback-shaped utility in `engine/prng.ts`: effective weights are computed transiently in the
 * `getWeight` callback, never stored. Because the floor keeps every weight positive,
 * `weightedSelect`'s zero-total uniform fallback is unreachable from here.
 *
 * Consumes exactly one `prng()` draw per call regardless of option count — draw ordering is part
 * of the engine's determinism contract, so callers can rely on a fixed number of draws per
 * selection.
 *
 * @param rule - The rule whose options are drawn from. Options must be non-empty.
 * @param culture - The producing culture's profile (`Culture.baseProfile`, not the whole
 *   `Culture`), supplying `materialAffinities`.
 * @param phase - The phase profile in force when the artefact is made.
 * @param prng - A generator from `createPrng`; determinism flows from it alone.
 * @returns The selected option.
 */
export function selectGrammarOption(
	rule: GrammarRule,
	culture: CulturalProfile,
	phase: PhaseCharacteristics,
	prng: () => number,
): GrammarOption {
	return weightedSelect(
		rule.options,
		prng,
		(option) => effectiveOptionWeight(option, culture, phase),
	);
}

/**
 * The three complexity tiers of doc 05 §5.5, resolved from `craftSpecialisation` by
 * `resolveComplexityTier`. Local to the engine rather than `types/grammar.ts` — that module is
 * data shapes only, and the tier is a derivation detail between the scalar and the
 * `AccumulationConstraints` it produces.
 */
export type ComplexityTier = 'simple' | 'moderate' | 'sophisticated';

/** One tier's row in the authored budget table, plus the engine-side repetition probability. */
interface ComplexityTierSpec {
	/** Hard floor on `<component-group>+` repetitions per object (doc 05 §5.5's group counts). */
	minDistinctGroups: number;

	/** Hard ceiling on `<component-group>+` repetitions per object (doc 05 §5.5's group counts). */
	maxDistinctGroups: number;

	/** Cap on repeated components within one arrangement group; enforced by `checkAccumulation`. */
	maxComponentsPerGroup: number;

	/** Whether arrangement groups must differ in component type; enforced by `checkAccumulation`. */
	noTwoGroupsSameType: boolean;

	/**
	 * Per-slot chance of drawing another component group once `minDistinctGroups` is met.
	 * Deliberately engine-side rather than a field of `AccumulationConstraints` — that type stays
	 * spec-verbatim (doc 05 §5.5). Below the minimum, expansion continues unconditionally; this
	 * probability only governs additions between the minimum and `maxDistinctGroups`.
	 */
	additionalGroupProbability: number;

	/** The arrangement patterns this tier unlocks, built fresh per budget by `buildPattern`. */
	patternTypes: readonly ArrangementPattern['type'][];
}

/*
 * Authored tier table (doc 05 §5.5). `minDistinctGroups`/`maxDistinctGroups` and the pattern
 * unlock order are doc-specified: simple 1–2 groups with basic patterns only (symmetric, linear),
 * moderate 2–3 groups with most patterns, sophisticated 3–4 groups with all six including nesting
 * and branching. `maxComponentsPerGroup`, `noTwoGroupsSameType` and `additionalGroupProbability`
 * are MVP-provisional values per the 2GN.2 precedent — the spec names the fields but gives no
 * numbers — to firm up when accumulation checking lands (2GN.6) and generation is observable in
 * the Explorer: the per-group cap rises to cover radial's doc maximum of 12 only at the
 * sophisticated tier, and only simple cultures are held to one group per component type.
 */
const COMPLEXITY_TIERS: Record<ComplexityTier, ComplexityTierSpec> = {
	simple: {
		minDistinctGroups: 1,
		maxDistinctGroups: 2,
		maxComponentsPerGroup: 4,
		noTwoGroupsSameType: true,
		additionalGroupProbability: 0.2,
		patternTypes: ['symmetric', 'linear-array'],
	},
	moderate: {
		minDistinctGroups: 2,
		maxDistinctGroups: 3,
		maxComponentsPerGroup: 8,
		noTwoGroupsSameType: false,
		additionalGroupProbability: 0.4,
		patternTypes: ['symmetric', 'linear-array', 'radial', 'stacked'],
	},
	sophisticated: {
		minDistinctGroups: 3,
		maxDistinctGroups: 4,
		maxComponentsPerGroup: 12,
		noTwoGroupsSameType: false,
		additionalGroupProbability: 0.6,
		patternTypes: ['symmetric', 'linear-array', 'radial', 'stacked', 'nested', 'branching'],
	},
};

/**
 * Builds one arrangement pattern carrying doc 05 §5.5's example counts as authored provisional
 * data — the only numbers the doc supplies. Returns a fresh object (fresh inner arrays included)
 * on every call so no two budgets share mutable innards.
 */
function buildPattern(type: ArrangementPattern['type']): ArrangementPattern {
	switch (type) {
		case 'symmetric':
			return { type, validCounts: [2, 4, 6] };
		case 'radial':
			return { type, countRange: [3, 12] };
		case 'linear-array':
			return { type, countRange: [2, 8] };
		case 'stacked':
			return { type, countRange: [2, 5] };
		case 'nested':
			return { type, countRange: [2, 4] };
		case 'branching':
			return { type, countRange: [2, 6] };
	}
}

/**
 * Resolves a `craftSpecialisation` value to its complexity tier (doc 05 §5.5, roadmap 2GN.7).
 * The doc's overlapping tier bounds resolve half-open upward — simple `[0, 0.3)`, moderate
 * `[0.3, 0.6)`, sophisticated `[0.6, 1]` — so a boundary value promotes to the higher tier: more
 * specialisation never means less complexity.
 *
 * Throws on a non-finite or out-of-range value: phase attributes are contractually 0–1 (doc 05
 * §3.2), so anything else is a world-generation bug — better a loud failure than a silently
 * mis-tiered budget, matching `resolvePhaseAttribute`.
 *
 * @param craftSpecialisation - `PhaseCharacteristics.society.craftSpecialisation`, 0–1.
 * @returns The tier whose budget applies.
 */
export function resolveComplexityTier(craftSpecialisation: number): ComplexityTier {
	if (
		!Number.isFinite(craftSpecialisation) || craftSpecialisation < 0 || craftSpecialisation > 1
	) {
		throw new Error(
			`resolveComplexityTier: craftSpecialisation must be in [0, 1], got ${craftSpecialisation}`,
		);
	}

	if (craftSpecialisation < 0.3) return 'simple';
	if (craftSpecialisation < 0.6) return 'moderate';
	return 'sophisticated';
}

/**
 * Derives the complexity budget a culture's `craftSpecialisation` affords (doc 05 §5.5, roadmap
 * 2GN.7): simple cultures get 1–2 component groups and basic patterns only; sophisticated
 * cultures unlock nesting and branching. `expandGrammar` consumes `maxDistinctGroups` as the
 * group-repetition cap and the tier table's `minDistinctGroups` as the enforced floor; the
 * remaining fields are enforced post-expansion by `checkAccumulation` (roadmap 2GN.6).
 *
 * Pure and PRNG-free — derivation consumes no draws, so it can never perturb the expansion draw
 * sequence that carries the determinism contract. Every call returns fresh objects, pattern
 * innards included, so callers may mutate their budget without corrupting later ones.
 *
 * @param craftSpecialisation - `PhaseCharacteristics.society.craftSpecialisation`, 0–1.
 * @returns The tier's accumulation constraints, freshly constructed.
 */
export function deriveComplexityBudget(craftSpecialisation: number): AccumulationConstraints {
	const spec = COMPLEXITY_TIERS[resolveComplexityTier(craftSpecialisation)];

	return {
		maxDistinctGroups: spec.maxDistinctGroups,
		maxComponentsPerGroup: spec.maxComponentsPerGroup,
		noTwoGroupsSameType: spec.noTwoGroupsSameType,
		patterns: spec.patternTypes.map(buildPattern),
	};
}

/**
 * The verdict of accumulation checking (doc 05 §5.5, roadmap 2GN.6). Engine-local per the
 * `ComplexityTier` precedent — `types/grammar.ts` is data shapes only, and a check verdict is
 * engine behaviour, not world data. The shape mirrors the planned `checkPlausibility` result
 * (doc 05 §6.2, roadmap 2GN.12) so the re-expansion loop (2GN.16) can treat both uniformly.
 */
export interface AccumulationCheckResult {
	/** True when the tree satisfies every accumulation constraint. */
	valid: boolean;

	/** Human-readable reasons for rejection, naming the type, count and violated bound. Empty when valid. */
	failures: string[];
}

/**
 * Tallies the components of one top-level group — primary plus every attachment descendant,
 * recursively — by `primitiveType`. Same-type components within one top-level group form one
 * arrangement group; that boundary is the detection contract `checkAccumulation` enforces and
 * normalisation's `arrangementGroup` annotation (doc 05 §6.1, roadmap 2GN.67) will follow.
 */
function tallyArrangements(group: ComponentGroupNode): Map<string, number> {
	const counts = new Map<string, number>();

	function visit(node: ComponentGroupNode): void {
		counts.set(node.primary.primitiveType, (counts.get(node.primary.primitiveType) ?? 0) + 1);
		for (const attachment of node.attachments) {
			visit(attachment.child);
		}
	}

	visit(group);
	return counts;
}

/** Whether any available pattern admits a repetition of `count` components (doc 05 §5.5). */
function isCountAdmissible(count: number, patterns: readonly ArrangementPattern[]): boolean {
	return patterns.some((pattern) =>
		pattern.type === 'symmetric'
			? pattern.validCounts.includes(count)
			: pattern.countRange[0] <= count && count <= pattern.countRange[1]
	);
}

/**
 * Checks an expanded grammar tree against its culture's accumulation constraints (doc 05 §5.5,
 * roadmap 2GN.6). Repetition isn't wrong — real objects repeat components in deliberate
 * arrangements — but uncontrolled repetition produces nonsense, so every repetition must read as
 * a deliberate arrangement the culture's complexity budget allows.
 *
 * An arrangement group is the set of same-`primitiveType` components within one top-level group
 * (primary plus attachment descendants); repetition never pools across top-level groups. Four
 * constraints apply:
 *
 * - the tree's top-level group count must not exceed `maxDistinctGroups` — a defensive re-check,
 *   since `expandGrammar` already enforces it, that keeps the validator authoritative over
 *   hand-built or deserialised trees;
 * - no arrangement group may exceed `maxComponentsPerGroup` components;
 * - every repetition (two or more of a type) must be admissible under at least one available
 *   pattern — `symmetric` as an exact-count allow-list, the rest as inclusive ranges. A single
 *   component is not an arrangement and needs no pattern;
 * - under `noTwoGroupsSameType`, no two top-level groups may each carry an arrangement of the
 *   same component type. Same-type singles across groups never trigger it.
 *
 * Pure and PRNG-free: same inputs, same verdict, no input mutation. A failed check is not an
 * error — the pipeline simply re-expands (doc 05 §6.2, roadmap 2GN.16); expansion is cheap.
 *
 * @param object - The raw grammar tree from `expandGrammar`.
 * @param constraints - The complexity budget to check against, from `deriveComplexityBudget`.
 * @returns The verdict, with a failure message per violated constraint.
 */
export function checkAccumulation(
	object: ExpandedObject,
	constraints: AccumulationConstraints,
): AccumulationCheckResult {
	const failures: string[] = [];

	if (object.groups.length > constraints.maxDistinctGroups) {
		failures.push(
			`object has ${object.groups.length} component groups, exceeding maxDistinctGroups ${constraints.maxDistinctGroups}`,
		);
	}

	/** Top-level group indices carrying an arrangement (count >= 2), keyed by primitive type. */
	const arrangementsByType = new Map<string, number[]>();

	object.groups.forEach((group, groupIndex) => {
		for (const [primitiveType, count] of tallyArrangements(group)) {
			if (count > constraints.maxComponentsPerGroup) {
				failures.push(
					`arrangement of ${count} '${primitiveType}' components in group ${groupIndex} exceeds maxComponentsPerGroup ${constraints.maxComponentsPerGroup}`,
				);
			}

			if (count < 2) continue;

			if (!isCountAdmissible(count, constraints.patterns)) {
				failures.push(
					`arrangement of ${count} '${primitiveType}' components in group ${groupIndex} fits no available pattern`,
				);
			}

			const indices = arrangementsByType.get(primitiveType) ?? [];
			indices.push(groupIndex);
			arrangementsByType.set(primitiveType, indices);
		}
	});

	if (constraints.noTwoGroupsSameType) {
		for (const [primitiveType, indices] of arrangementsByType) {
			if (indices.length > 1) {
				failures.push(
					`groups ${
						indices.join(', ')
					} each carry an arrangement of '${primitiveType}' components, violating noTwoGroupsSameType`,
				);
			}
		}
	}

	return { valid: failures.length === 0, failures };
}

/*
 * Provisional attachment repetition policy (doc 05 §5.3's `*` is engine-owned, not data). These
 * constants are generation-side heuristics bounding the `[<attachment> <component-group>]*` slot;
 * accumulation checking (`checkAccumulation`, roadmap 2GN.6) is the validation authority over
 * what expansion produces — the group-count half of the old policy is budget-driven as of 2GN.7.
 * The caps echo §5.5's sophisticated-tier ceiling so nothing generated here should exceed the
 * constraints' upper bound.
 */

/** Attachment recursion cut-off: groups at this depth take no further attachments. */
const MAX_ATTACHMENT_DEPTH = 3;

/** Breadth cap on the `[<attachment> <component-group>]*` slot within one group. */
const MAX_ATTACHMENTS_PER_GROUP = 2;

/** Base per-slot chance of filling an attachment slot at depth 0. */
const ATTACHMENT_PROBABILITY = 0.4;

/** Halves the attachment chance per recursion level: depth d draws at 0.4 × 0.5^d. */
const ATTACHMENT_DEPTH_DECAY = 0.5;

/**
 * Expands the component grammar into the tree for one `<object>` (doc 05 §5.3, roadmap 2GN.3).
 *
 * Walks the BNF top-down: the object spine draws one-or-more `<component-group>`s, filling the
 * complexity budget's `minDistinctGroups` unconditionally (no `prng()` draw — there's no decision
 * to make below the floor) before continuing probabilistically up to `maxDistinctGroups` (doc 05
 * §5.5, roadmap 2GN.7; see `deriveComplexityBudget`) — each group selects a primary component, and
 * the optional `[<attachment> <component-group>]*` slot fills by depth-decayed probability draws —
 * the `attachment` rule's options are consumed positionally as edge labels, never expanded as
 * components (the 2GN.2 data contract). Primitive terminals roll their physical parameters here,
 * uniformly per parameter from `PRIMITIVE_PARAMETERS` registry order, so downstream
 * normalisation (2GN.8) never touches the PRNG.
 *
 * Every selection routes through `selectGrammarOption`, including today's single-option
 * `object`/`component-group` rules — the sequence of `prng` draws is the determinism contract,
 * and uniform routing means a future multi-option rule changes distributions, not draw
 * structure. The tree is cheap and side-effect-free to produce: when plausibility checking
 * fails, the re-expansion loop (doc 05 §6.2, roadmap 2GN.16) simply calls this again.
 *
 * Throws on malformed grammar data — a missing rule, an `expandsTo` that is neither a rule
 * symbol nor a primitive, or a non-attachment terminal in the attachment slot — and guards rule
 * cycles with a hop budget so authoring errors fail loudly rather than overflowing the stack.
 *
 * @param rules - The production rules (e.g. `CORE_GRAMMAR_RULES`), looked up by `symbol`. Must
 *   include an `'object'` rule (the start symbol) and an `'attachment'` rule if any expansion
 *   path fills attachment slots.
 * @param culture - The producing culture's profile (`Culture.baseProfile`), biasing selection.
 * @param phase - The phase profile in force when the artefact is made.
 * @param prng - A generator from `createPrng`; determinism flows from it alone.
 * @returns The raw grammar tree, ready for accumulation checking (2GN.6) and normalisation
 *   (2GN.8).
 */
export function expandGrammar(
	rules: readonly GrammarRule[],
	culture: CulturalProfile,
	phase: PhaseCharacteristics,
	prng: () => number,
): ExpandedObject {
	const ruleIndex = new Map(rules.map((rule) => [rule.symbol, rule]));

	function mustGetRule(symbol: string): GrammarRule {
		const rule = ruleIndex.get(symbol);
		if (rule === undefined) {
			throw new Error(`expandGrammar: no rule for symbol '${symbol}'`);
		}
		return rule;
	}

	/** Rolls a primitive terminal's parameters, one uniform draw per parameter in registry order. */
	function buildComponentNode(primitive: keyof typeof PRIMITIVE_PARAMETERS): ComponentNode {
		const properties = new Map<string, string>();

		for (const [parameter, values] of Object.entries(PRIMITIVE_PARAMETERS[primitive])) {
			const index = Math.min(values.length - 1, Math.floor(prng() * values.length));
			properties.set(parameter, values[index]);
		}

		return { primitiveType: primitive, properties };
	}

	/**
	 * Resolves a symbol to a leaf component: rule symbols recurse (with a hop budget so a rule
	 * cycle throws instead of overflowing the stack), primitive ids become components, anything
	 * else is a grammar authoring error.
	 */
	function expandPrimary(symbol: string, hops: number): ComponentNode {
		if (ruleIndex.has(symbol)) {
			if (hops <= 0) {
				throw new Error(`expandGrammar: rule cycle detected while resolving '${symbol}'`);
			}
			const option = selectGrammarOption(mustGetRule(symbol), culture, phase, prng);
			return expandPrimary(option.expandsTo, hops - 1);
		}

		if (isPrimitiveType(symbol)) {
			return buildComponentNode(symbol);
		}

		throw new Error(`expandGrammar: unknown grammar symbol '${symbol}'`);
	}

	/** Expands one `<component-group>`: primary component plus its attachment chain. */
	function expandGroup(symbol: string, depth: number): ComponentGroupNode {
		const groupRule = mustGetRule(symbol);
		const primaryOption = selectGrammarOption(groupRule, culture, phase, prng);
		const primary = expandPrimary(primaryOption.expandsTo, rules.length);

		const attachments: AttachmentBranch[] = [];
		while (
			attachments.length < MAX_ATTACHMENTS_PER_GROUP &&
			depth < MAX_ATTACHMENT_DEPTH &&
			prng() < ATTACHMENT_PROBABILITY * ATTACHMENT_DEPTH_DECAY ** depth
		) {
			const joinOption = selectGrammarOption(mustGetRule('attachment'), culture, phase, prng);
			if (!isAttachmentType(joinOption.expandsTo)) {
				throw new Error(
					`expandGrammar: attachment option expands to non-attachment terminal '${joinOption.expandsTo}'`,
				);
			}

			attachments.push({ type: joinOption.expandsTo, child: expandGroup(symbol, depth + 1) });
		}

		return { primary, attachments };
	}

	const tierSpec = COMPLEXITY_TIERS[resolveComplexityTier(phase.society.craftSpecialisation)];
	const budget = deriveComplexityBudget(phase.society.craftSpecialisation);

	const objectRule = mustGetRule('object');
	const groups: ComponentGroupNode[] = [];

	while (groups.length < tierSpec.minDistinctGroups) {
		const groupOption = selectGrammarOption(objectRule, culture, phase, prng);
		groups.push(expandGroup(groupOption.expandsTo, 0));
	}

	while (
		groups.length < budget.maxDistinctGroups &&
		prng() < tierSpec.additionalGroupProbability
	) {
		const groupOption = selectGrammarOption(objectRule, culture, phase, prng);
		groups.push(expandGroup(groupOption.expandsTo, 0));
	}

	return { groups };
}

/*
 * Structural normalisation (doc 05 §6.1, roadmap 2GN.8): flattens the grammar's node tree into a
 * `NormalisedArtefact` — ordered components, their attachments, and whole-object dimensions and
 * portability. Pure and PRNG-free: `expandGrammar` already rolled every physical parameter, so
 * normalisation only restructures and derives, never draws.
 *
 * Two fields normalisation cannot honestly fill are stubbed rather than fabricated:
 * `allowedMaterialTags` needs the primitive+property material-compatibility table (roadmap
 * 2GN.10) and stays `[]` until then; `arrangementGroup` needs a pattern-assignment decision the
 * grammar doesn't make yet (roadmap 2GN.67, descoped out of this task) and is simply omitted.
 * `deriveInspectionDepth` (originally roadmap 2GN.9) is folded in here since it is a three-line
 * function over dimensions this task already computes.
 */

/**
 * Provisional ordinal-band-to-centimetre tables (MVP-provisional per the 2GN.2 precedent — no
 * primitive registry carries numeric sizes, so these are authored fresh and tuned once generation
 * is observable in the Explorer). The grammar uses three distinct ordinal vocabularies for size
 * across primitives (`data/grammars/primitives.ts`), each mapped to its own band table so a
 * primitive's `length` is never confused with another's `diameter`.
 */
const SHORT_MEDIUM_LONG_CM: Record<string, number> = { short: 4, medium: 14, long: 40 };
const SMALL_MEDIUM_LARGE_CM: Record<string, number> = { small: 5, medium: 15, large: 45 };
const NARROW_MEDIUM_WIDE_CM: Record<string, number> = { narrow: 3, medium: 8, wide: 18 };

/** Fallback extent for a primitive this table doesn't recognise — keeps extraction total. */
const DEFAULT_EXTENT_CM = 5;

/** A slender primitive's minor axis when no cross-axis parameter exists (e.g. elongated, bar-form). */
const SLENDER_MINOR_CM = 2;

/**
 * Reads a named property band off a component and maps it through a band table, falling back to
 * `DEFAULT_EXTENT_CM` when the property is absent or the value isn't in the table — normalisation
 * degrades gracefully rather than throwing, since the primitive vocabulary may grow.
 */
function bandExtentCm(
	component: NormalisedComponent,
	parameter: string,
	table: Record<string, number>,
): number {
	const value = component.properties.get(parameter);
	return typeof value === 'string' ? table[value] ?? DEFAULT_EXTENT_CM : DEFAULT_EXTENT_CM;
}

/**
 * Derives one component's `{major, minor}` extent in centimetres from its primitive type and
 * rolled properties (doc 05 §6.1's dimension derivation, provisional per the module comment
 * above). Each primitive maps its own size-relevant parameter(s):
 *
 * - `elongated`/`bar-form`: major from `length`; minor is a fixed slender default (no cross-axis
 *   parameter in the registry).
 * - `cylindrical`: major from `length`, minor from `diameter`.
 * - `flat-broad`/`hollow-enclosed`/`sheet-form`: planar/volumetric, major and minor both from
 *   `size`.
 * - `disc-form`/`ring-form`: circular, major and minor both from `diameter`.
 * - anything else: both axes fall back to `DEFAULT_EXTENT_CM`.
 */
function extractComponentExtents(component: NormalisedComponent): { major: number; minor: number } {
	switch (component.primitiveType) {
		case 'elongated':
		case 'bar-form':
			return {
				major: bandExtentCm(component, 'length', SHORT_MEDIUM_LONG_CM),
				minor: SLENDER_MINOR_CM,
			};
		case 'cylindrical':
			return {
				major: bandExtentCm(component, 'length', SHORT_MEDIUM_LONG_CM),
				minor: bandExtentCm(component, 'diameter', NARROW_MEDIUM_WIDE_CM),
			};
		case 'flat-broad':
		case 'hollow-enclosed':
		case 'sheet-form': {
			const extent = bandExtentCm(component, 'size', SMALL_MEDIUM_LARGE_CM);
			return { major: extent, minor: extent };
		}
		case 'disc-form':
		case 'ring-form': {
			const extent = bandExtentCm(component, 'diameter', SMALL_MEDIUM_LARGE_CM);
			return { major: extent, minor: extent };
		}
		default:
			return { major: DEFAULT_EXTENT_CM, minor: DEFAULT_EXTENT_CM };
	}
}

/**
 * Derives whole-object dimensions from its flattened components (doc 05 §6.1). `primaryExtent`
 * and `secondaryExtent` are each the largest single-component axis found anywhere in the object —
 * a deliberate MVP simplification (a true assembled bounding box across joined components is
 * deferred), documented rather than silently approximated. `mass` is a provisional band over a
 * coarse size-times-part-count proxy; thresholds are MVP-provisional like the extent tables above.
 */
function deriveDimensions(components: readonly NormalisedComponent[]): ObjectDimensions {
	let primaryExtent = 0;
	let secondaryExtent = 0;

	for (const component of components) {
		const { major, minor } = extractComponentExtents(component);
		primaryExtent = Math.max(primaryExtent, major);
		secondaryExtent = Math.max(secondaryExtent, minor);
	}

	const sizeScore = primaryExtent * secondaryExtent * (1 + 0.1 * (components.length - 1));
	const mass: ObjectDimensions['mass'] = sizeScore < 60
		? 'negligible'
		: sizeScore < 300
		? 'light'
		: sizeScore < 1500
		? 'moderate'
		: sizeScore < 5000
		? 'heavy'
		: 'very-heavy';

	return { primaryExtent, secondaryExtent, mass };
}

/**
 * Derives the portability band from dimensions (doc 05 §5.2: "derived from dimensions and
 * structure" — mass stands in for structural heft here). Provisional thresholds, falling through
 * from most to least portable so the function is total; tuned once generation is observable.
 */
function derivePortability(dimensions: ObjectDimensions): Portability {
	const maxExtent = Math.max(dimensions.primaryExtent, dimensions.secondaryExtent);
	const { mass } = dimensions;

	if (maxExtent <= 8 && mass === 'negligible') return 'pocketable';
	if (maxExtent <= 30 && (mass === 'negligible' || mass === 'light')) return 'one-hand';
	if (maxExtent <= 90 && mass !== 'heavy' && mass !== 'very-heavy') return 'two-hand';
	if (mass === 'very-heavy' || maxExtent > 200) return 'major-effort';
	return 'team-lift';
}

/**
 * Maps physical size to inspection depth (doc 05 §5.2, verbatim thresholds — originally roadmap
 * 2GN.9, folded into 2GN.8 since it is a small pure function over dimensions this task already
 * computes): a player can hold and examine closely up to 30cm, only observe-but-not-manipulate up
 * to 150cm, and must observe in situ beyond that.
 */
export function deriveInspectionDepth(dimensions: ObjectDimensions): InspectionDepth {
	const maxExtent = Math.max(dimensions.primaryExtent, dimensions.secondaryExtent);
	if (maxExtent <= 30) return 'full';
	if (maxExtent <= 150) return 'detailed';
	return 'observational';
}

/**
 * Flattens an `ExpandedObject` grammar tree into a `NormalisedArtefact` (doc 05 §6.1, roadmap
 * 2GN.8) — the standardised structure every downstream pipeline stage builds on.
 *
 * Walks the tree depth-first, primary-before-attachments, mirroring `expandGroup`'s emission order
 * and `tallyArrangements`' recursion shape: each top-level group's primary is flattened before its
 * attachment chain, and each chain is flattened before the group returns. `position` is the
 * resulting 0-based traversal index; component ids are minted positionally as `` `${id}-c${n}` ``
 * so the whole function stays deterministic and PRNG-free — no random or time-based id source is
 * ever touched.
 *
 * Each `AttachmentBranch` becomes one `Attachment` linking its parent group's primary component to
 * its child group's primary component, carrying the branch's join type; the recursive walk always
 * has both endpoint ids in hand because visiting a child group returns its primary's id before the
 * parent records the join.
 *
 * `allowedMaterialTags` is stubbed `[]` (roadmap 2GN.10) and `arrangementGroup` is omitted
 * (roadmap 2GN.67) — see the module comment above. `properties` is defensively copied so the
 * artefact never aliases the source tree's maps.
 *
 * @param object - The raw grammar tree from `expandGrammar` (2GN.3), typically post accumulation
 *   checking (2GN.6).
 * @param id - The artefact's stable id, supplied by the caller (seed→id is a pipeline concern, not
 *   normalisation's — this function never mints ids from anything but tree position).
 * @returns The flattened, standardised artefact structure.
 */
export function normaliseArtefact(object: ExpandedObject, id: string): NormalisedArtefact {
	const components: NormalisedComponent[] = [];
	const attachments: Attachment[] = [];
	let next = 0;

	function mint(node: ComponentNode): string {
		const componentId = `${id}-c${next}`;
		components.push({
			id: componentId,
			primitiveType: node.primitiveType,
			properties: new Map(node.properties),
			allowedMaterialTags: [] as MaterialTag[], // STUB — owned by roadmap 2GN.10
			position: next,
			// arrangementGroup intentionally omitted — owned by roadmap 2GN.67
		});
		next++;
		return componentId;
	}

	function visit(group: ComponentGroupNode): string {
		const primaryId = mint(group.primary);
		for (const branch of group.attachments) {
			const childPrimaryId = visit(branch.child);
			attachments.push({
				fromComponentId: primaryId,
				toComponentId: childPrimaryId,
				type: branch.type,
			});
		}
		return primaryId;
	}

	for (const group of object.groups) {
		visit(group);
	}

	const dimensions = deriveDimensions(components);

	return {
		id,
		components,
		attachments,
		dimensions,
		portability: derivePortability(dimensions),
		inspectionDepth: deriveInspectionDepth(dimensions),
	};
}
