/**
 * Tag-inspector model for the classification panel (roadmap 2GN.59).
 *
 * Runs the classification chain for one artefact and decomposes the resulting score map back into
 * the individual rules that produced it, by re-running each rule's `condition` against the same
 * `ExtractedFeatures`. That decomposition is *exact* rather than approximate: `classifyArtefact`
 * folds by plain sum (doc 12 §2.21 chose plain-sum over probabilistic OR specifically so this
 * breakdown could stay honest), so the per-rule weights for a tag add up to its total.
 *
 * **Per-rule, not per-component.** The roadmap line for 2GN.59 asks for a "per-component
 * contribution breakdown", which the engine cannot currently support: `extractFeatures` collapses
 * the whole artefact into flat scalars carrying no component references (doc 12 §2.20), and
 * `ClassificationRule.condition` is a whole-artefact predicate. A tag score therefore traces to a
 * rule, never to a component. Per-component provenance is its own roadmap task.
 *
 * Pure, no DOM/Svelte, so it's unit-testable directly per the `structureTree.ts` precedent.
 */

import { createPrng } from '../../../../lib/engine/prng.ts';
import { expandGrammar, normaliseArtefact } from '../../../../lib/engine/generation/grammar.ts';
import { expandDecoration } from '../../../../lib/engine/generation/decoration.ts';
import {
	classifyArtefact,
	extractFeatures,
} from '../../../../lib/engine/generation/classification.ts';
import { CORE_GRAMMAR_RULES } from '../../../../lib/data/grammars/core.ts';
import { CLASSIFICATION_RULES } from '../../../../lib/data/classification.ts';
import { MATERIALS } from '../../../../lib/data/materials.ts';
import { DECORATIVE_TECHNIQUES } from '../../../../lib/data/decorations.ts';
import { CONTEXT_TAGS, FUNCTION_TAGS } from '../../../../lib/types/tags.ts';
import type { ContextTag, FunctionTag } from '../../../../lib/types/tags.ts';
import type { ExtractedFeatures, NormalisedArtefact } from '../../../../lib/types/artefact.ts';
import type { DecorativeLayer } from '../../../../lib/types/decoration.ts';
import type { ExplorerCulture } from '../../../../lib/data/explorer-cultures.ts';

/** Either half of the tag vocabulary. */
export type Tag = FunctionTag | ContextTag;

/** One rule's contribution to one tag's score. */
export interface Contribution {
	/** Display label for the rule, `R{index + 1}` — matching `scripts/dev/sample-classification.ts`. */
	rule: string;

	/** The rule's index in `CLASSIFICATION_RULES`, the only runtime identity a rule has. */
	ruleIndex: number;

	/** The weight this rule adds to the tag. */
	weight: number;
}

/** One tag's score, with the rules that produced it. */
export interface ScoredTag {
	tag: Tag;

	/** Summed score. Unbounded — an evidence tally, not a confidence (doc 12 §2.21). */
	score: number;

	/** Score as a fraction of the artefact's own strongest tag, in `(0, 1]`. For bar widths. */
	share: number;

	/** The rules that contributed, in rule order. Weights sum exactly to `score`. */
	contributions: Contribution[];
}

/** Which part of the feature contract a field belongs to, for grouping in the panel. */
export type FeatureGroup = 'structural' | 'decorative' | 'complexity' | 'mechanical';

/** One `ExtractedFeatures` field, ready to display. */
export interface FeatureReading {
	field: string;
	value: string;
	group: FeatureGroup;

	/**
	 * True when the field sits at its neutral value (`false`, `0`, `'none'`, an empty list) and so
	 * carries no signal for any rule. Dimmed rather than hidden: an expected-but-absent feature is
	 * itself worth being able to check.
	 */
	inert: boolean;

	/**
	 * True when no producer can populate this field yet, so it is inert by construction rather than
	 * by this artefact's shape — `motifPresent`, `motifCulturalOrigins` and
	 * `preciousMaterialsInDecoration` all await roadmap 2GN.33.
	 */
	dormant: boolean;
}

/** The render model for one artefact's classification. */
export interface TagInspection {
	artefact: NormalisedArtefact;

	/** The decorative layers fed into extraction (empty when the artefact rolled undecorated). */
	layers: DecorativeLayer[];

	features: ExtractedFeatures;

	/** Every `ExtractedFeatures` field as a display row, in contract order. */
	featureReadings: FeatureReading[];

	/** Function tags that scored, strongest first. */
	functionTags: ScoredTag[];

	/** Context tags that scored, strongest first. */
	contextTags: ScoredTag[];

	/** Tags with no evidence at all. Absence provably means zero under the sparse-map contract. */
	unscored: Tag[];

	/** Indices of every rule that fired, ascending. */
	firedRuleIndices: number[];

	/** How many rules were evaluated (`CLASSIFICATION_RULES.length`), read dynamically. */
	ruleCount: number;
}

/** Canonical vocabulary order: function tags, then context tags, each in declaration order. */
const TAG_ORDER: readonly Tag[] = [...FUNCTION_TAGS, ...CONTEXT_TAGS];

/**
 * Which group each `ExtractedFeatures` field belongs to, in contract order.
 *
 * `portability` and `inspectionDepth` are grouped `mechanical` and flagged as such because no
 * classification rule may read them — doc 12 §2.19 fixed that boundary (`massBand`/`sizeBand` are
 * the physical-fact equivalents rules use instead), and `classification.test.ts` enforces it. They
 * are shown so the panel reflects the whole contract, not to imply they feed a score.
 */
const FEATURE_GROUPS: readonly (readonly [keyof ExtractedFeatures, FeatureGroup])[] = [
	['hasEdge', 'structural'],
	['edgeCount', 'structural'],
	['hasPoint', 'structural'],
	['pointSharpness', 'structural'],
	['hasImpactSurface', 'structural'],
	['hasContainer', 'structural'],
	['containerOpenness', 'structural'],
	['openingType', 'structural'],
	['hasFasteningMechanism', 'structural'],
	['primaryAxisLength', 'structural'],
	['bladeLengthBand', 'structural'],
	['bladeProfile', 'structural'],
	['isWearable', 'structural'],
	['partCount', 'structural'],
	['attachmentDiversity', 'structural'],
	['perforation', 'structural'],
	['wallThickness', 'structural'],
	['ringGap', 'structural'],
	['sheetFlexibility', 'structural'],
	['massBand', 'structural'],
	['sizeBand', 'structural'],
	['curvature', 'structural'],
	['baseType', 'structural'],
	['decorativeLayerCount', 'decorative'],
	['appliedElementPresent', 'decorative'],
	['motifPresent', 'decorative'],
	['motifCulturalOrigins', 'decorative'],
	['techniqueComplexity', 'decorative'],
	['preciousMaterialsInDecoration', 'decorative'],
	['functionalComplexity', 'complexity'],
	['decorativeComplexity', 'complexity'],
	['overallComplexity', 'complexity'],
	['portability', 'mechanical'],
	['inspectionDepth', 'mechanical'],
];

/** Fields no producer populates yet — all three await roadmap 2GN.33's motif/material assignment. */
const DORMANT_FIELDS = new Set<keyof ExtractedFeatures>([
	'motifPresent',
	'motifCulturalOrigins',
	'preciousMaterialsInDecoration',
]);

/**
 * Fields whose neutral value is a band name rather than `'none'`. Every other banded field reads
 * `'none'` when it carries no signal; these three have no `'none'` member and sit mid-range
 * instead, matching the baseline `neutralExtractedFeatures` uses (`tests/fixtures/artefact.ts`).
 */
const NEUTRAL_BANDS: Partial<Record<keyof ExtractedFeatures, string>> = {
	massBand: 'moderate',
	sizeBand: 'medium',
	primaryAxisLength: 'medium',
};

/** Whether a field sits at its neutral value, and so contributes nothing to any rule. */
function isInert(
	field: keyof ExtractedFeatures,
	value: ExtractedFeatures[keyof ExtractedFeatures],
): boolean {
	const neutralBand = NEUTRAL_BANDS[field];
	if (neutralBand !== undefined) return value === neutralBand;

	if (typeof value === 'boolean') return !value;
	if (typeof value === 'number') return value === 0;
	if (Array.isArray(value)) return value.length === 0;

	return value === 'none';
}

/** Renders one feature value for display. */
function formatValue(value: ExtractedFeatures[keyof ExtractedFeatures]): string {
	if (Array.isArray(value)) return value.length === 0 ? '[]' : value.join(', ');
	if (typeof value === 'number') return Number.isInteger(value) ? String(value) : value.toFixed(2);

	return String(value);
}

/** Turns an `ExtractedFeatures` object into display rows, in contract order. */
function readFeatures(features: ExtractedFeatures): FeatureReading[] {
	return FEATURE_GROUPS.map(([field, group]) => {
		const value = features[field];
		return {
			field,
			value: formatValue(value),
			group,
			inert: isInert(field, value),
			dormant: DORMANT_FIELDS.has(field),
		};
	});
}

/**
 * Orders a group's scored tags strongest-first, keeping canonical vocabulary order on ties.
 *
 * The score map's own iteration order is a serialisation contract, not a display obligation — the
 * CLI sampler re-sorts for display in exactly this way and the panel follows suit.
 */
function scoredGroup(
	vocabulary: readonly Tag[],
	scores: Map<Tag, number>,
	contributions: Map<Tag, Contribution[]>,
	max: number,
): ScoredTag[] {
	return vocabulary
		.filter((tag) => scores.has(tag))
		.map((tag) => {
			const score = scores.get(tag)!;
			return {
				tag,
				score,
				share: max === 0 ? 0 : score / max,
				contributions: contributions.get(tag) ?? [],
			};
		})
		.sort((a, b) => b.score - a.score);
}

/**
 * Generates one artefact from `seed` against `culture` and inspects its classification.
 *
 * @param seed - The seed to generate from; also namespaces the decoration draw.
 * @param culture - The culture/phase pair, plus the geology and trade decoration needs.
 */
export function inspectTags(seed: string, culture: ExplorerCulture): TagInspection {
	const prng = createPrng(seed);
	const expanded = expandGrammar(CORE_GRAMMAR_RULES, culture.profile, culture.phase, prng);
	const artefact = normaliseArtefact(expanded, `tags-${seed}`);

	const layers = expandDecoration(
		artefact,
		culture.profile,
		culture.phase,
		culture.geology,
		culture.trade,
		MATERIALS,
		DECORATIVE_TECHNIQUES,
		createPrng(`${seed}-decoration`),
	);

	const features = extractFeatures(artefact, layers);
	const scores = classifyArtefact(features, CLASSIFICATION_RULES);

	// Re-run each condition to attribute the sums. Exact under plain-sum accumulation.
	const contributions = new Map<Tag, Contribution[]>();
	const firedRuleIndices: number[] = [];
	CLASSIFICATION_RULES.forEach((rule, ruleIndex) => {
		if (!rule.condition(features)) return;
		firedRuleIndices.push(ruleIndex);
		for (const [tag, weight] of rule.tags) {
			const existing = contributions.get(tag) ?? [];
			existing.push({ rule: `R${ruleIndex + 1}`, ruleIndex, weight });
			contributions.set(tag, existing);
		}
	});

	const max = scores.size === 0 ? 0 : Math.max(...scores.values());

	return {
		artefact,
		layers,
		features,
		featureReadings: readFeatures(features),
		functionTags: scoredGroup(FUNCTION_TAGS, scores, contributions, max),
		contextTags: scoredGroup(CONTEXT_TAGS, scores, contributions, max),
		unscored: TAG_ORDER.filter((tag) => !scores.has(tag)),
		firedRuleIndices,
		ruleCount: CLASSIFICATION_RULES.length,
	};
}
