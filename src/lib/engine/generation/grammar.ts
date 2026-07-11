/**
 * Component grammar expansion engine (doc 05 §5.3–§5.5, roadmap 2GN.3–2GN.5, 2GN.7).
 *
 * Runs the bottom-up structural grammar: weighted, culture- and phase-biased selection over the
 * production rules authored in `data/grammars/core.ts`, expanding them into a tree of geometric
 * components, with group repetition bounded by the complexity budget the culture's
 * `craftSpecialisation` derives (doc 05 §5.5). The grammar produces physical structures, never
 * functional categories (doc 05 §5.1) — nothing here branches by intent, only by weight.
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
	/** Hard ceiling on `<component-group>+` repetitions per object (doc 05 §5.5's group counts). */
	maxDistinctGroups: number;

	/** Cap on repeated components within one arrangement group; derived here, enforced at 2GN.6. */
	maxComponentsPerGroup: number;

	/** Whether arrangement groups must differ in component type; derived here, enforced at 2GN.6. */
	noTwoGroupsSameType: boolean;

	/**
	 * Per-slot chance of drawing another component group. Deliberately engine-side rather than a
	 * field of `AccumulationConstraints` — that type stays spec-verbatim (doc 05 §5.5). This is
	 * how the doc's tier lower bounds ("1–2", "2–3", "3–4" groups) are honoured: as a distribution
	 * shift rather than a hard floor, which `AccumulationConstraints` has no field for.
	 */
	additionalGroupProbability: number;

	/** The arrangement patterns this tier unlocks, built fresh per budget by `buildPattern`. */
	patternTypes: readonly ArrangementPattern['type'][];
}

/*
 * Authored tier table (doc 05 §5.5). `maxDistinctGroups` and the pattern unlock order are
 * doc-specified: simple gets basic patterns only (symmetric, linear), moderate most patterns,
 * sophisticated all six including nesting and branching. `maxComponentsPerGroup`,
 * `noTwoGroupsSameType` and `additionalGroupProbability` are MVP-provisional values per the
 * 2GN.2 precedent — the spec names the fields but gives no numbers — to firm up when
 * accumulation checking lands (2GN.6) and generation is observable in the Explorer: the
 * per-group cap rises to cover radial's doc maximum of 12 only at the sophisticated tier, and
 * only simple cultures are held to one group per component type.
 */
const COMPLEXITY_TIERS: Record<ComplexityTier, ComplexityTierSpec> = {
	simple: {
		maxDistinctGroups: 2,
		maxComponentsPerGroup: 4,
		noTwoGroupsSameType: true,
		additionalGroupProbability: 0.2,
		patternTypes: ['symmetric', 'linear-array'],
	},
	moderate: {
		maxDistinctGroups: 3,
		maxComponentsPerGroup: 8,
		noTwoGroupsSameType: false,
		additionalGroupProbability: 0.4,
		patternTypes: ['symmetric', 'linear-array', 'radial', 'stacked'],
	},
	sophisticated: {
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
 * group-repetition cap; the remaining fields are derived but unenforced until accumulation
 * checking lands (2GN.6).
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

/*
 * Provisional attachment repetition policy (doc 05 §5.3's `*` is engine-owned, not data). These
 * constants bound the `[<attachment> <component-group>]*` slot until accumulation constraints
 * (roadmap 2GN.6) take over — the group-count half of the old policy is budget-driven as of
 * 2GN.7. The caps echo §5.5's sophisticated-tier ceiling so nothing generated now would exceed
 * the eventual constraints' upper bound.
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
 * Walks the BNF top-down: the object spine draws one-or-more `<component-group>`s — capped and
 * paced by the complexity budget the phase's `craftSpecialisation` derives (doc 05 §5.5, roadmap
 * 2GN.7; see `deriveComplexityBudget`) — each group selects a primary component, and the
 * optional `[<attachment> <component-group>]*` slot fills by depth-decayed probability draws —
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

	const tier = resolveComplexityTier(phase.society.craftSpecialisation);
	const budget = deriveComplexityBudget(phase.society.craftSpecialisation);

	const objectRule = mustGetRule('object');
	const groups: ComponentGroupNode[] = [];

	do {
		const groupOption = selectGrammarOption(objectRule, culture, phase, prng);
		groups.push(expandGroup(groupOption.expandsTo, 0));
	} while (
		groups.length < budget.maxDistinctGroups &&
		prng() < COMPLEXITY_TIERS[tier].additionalGroupProbability
	);

	return { groups };
}
