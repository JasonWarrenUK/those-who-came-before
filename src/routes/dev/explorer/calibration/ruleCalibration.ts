/**
 * Rule-calibration model for the Explorer's calibration panel (roadmap 2GN.81).
 *
 * The Tag Inspector (2GN.59) answers "why did *this artefact* score the way it did". This answers
 * the population question underneath it: **how often does each rule fire, and what does that do to
 * the tag vocabulary as a whole?** They are different questions and neither substitutes for the
 * other — a rule can look perfectly reasonable on one artefact while firing on 85% of output, which
 * is precisely the defect roadmap 2GN.79 found in the applied-element rule and doc 12 §2.24 found in
 * the decoration family before it.
 *
 * Why fire rate is the number that matters: `classifyArtefact` folds matching rules by plain,
 * unbounded sum (doc 12 §2.21). A rule firing on nearly everything therefore adds a near-constant to
 * every artefact's score rather than separating one artefact from another — it shifts the whole
 * population and discriminates nothing. A rule's *stated intent* ("heavily worked", "deliberate
 * embellishment") is a claim about selectivity, and this panel is where that claim gets checked
 * against behaviour.
 *
 * Sampling drives the real Milestone 2 chain (`expandGrammar` → `normaliseArtefact` →
 * `expandDecoration` → `extractFeatures` → `classifyArtefact`) against the Explorer culture presets,
 * which model all 16 materials explicitly — so unlike the test fixtures before 2GN.79, nothing here
 * reaches `isAvailable`'s unmodelled-material lenience.
 *
 * Pure, no DOM/Svelte, unit-testable directly per the `tagInspector.ts`/`structureTree.ts`
 * precedent.
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
import type { ExplorerCulture } from '../../../../lib/data/explorer-cultures.ts';

/** Either half of the tag vocabulary. */
export type Tag = FunctionTag | ContextTag;

/**
 * Above this fire rate a rule contributes a near-constant rather than a discriminating signal
 * (doc 12 §2.21). Rules crossing it are flagged `saturated` — a prompt to check the rule's stated
 * intent, not an automatic defect: the any-decoration nudge is documented as deliberately universal
 * (doc 12 §2.24) and still crosses it.
 */
export const SATURATION_CEILING = 60;

/** Below this a rule fires too rarely to be doing much work, and may have an unreachable condition. */
export const DORMANCY_FLOOR = 1;

/** How a rule's fire rate reads against the two thresholds above. */
export type CalibrationVerdict = 'saturated' | 'discriminating' | 'rare' | 'dormant';

/** One rule's measured behaviour across the sample. */
export interface RuleCalibration {
	/** Display label, `R{index + 1}` — matching the Tag Inspector and the data-test blocks. */
	label: string;

	/** The rule's index in `CLASSIFICATION_RULES`, its only runtime identity. */
	ruleIndex: number;

	/** How many sampled artefacts the rule fired on. */
	fireCount: number;

	/** `fireCount` as a percentage of the sample. */
	firePercent: number;

	/** How that rate reads: saturated, discriminating, rare or dormant. */
	verdict: CalibrationVerdict;

	/** The tags this rule contributes to, with their weights, in the rule's own order. */
	contributions: { tag: Tag; weight: number }[];

	/**
	 * Total score this rule contributed across the whole sample (`fireCount` × summed weights).
	 * A rule can fire rarely yet still dominate a tag if its weights are large, so rate alone
	 * doesn't tell the whole story.
	 */
	totalWeightContributed: number;
}

/** One tag's measured behaviour across the sample. */
export interface TagCalibration {
	tag: Tag;

	/** How many sampled artefacts carry this tag at all. */
	presentCount: number;

	/** `presentCount` as a percentage of the sample. */
	presentPercent: number;

	/** How many sampled artefacts this tag is the single highest-scoring tag on. */
	leadCount: number;

	/** `leadCount` as a percentage of the sample. */
	leadPercent: number;

	/** Mean score across artefacts that carry the tag (not across the whole sample). */
	meanScoreWhenPresent: number;

	/**
	 * The rule contributing the most total weight to this tag across the sample, if any. This is
	 * what turns "elite is everywhere" into "because R31 fires on 85% of artefacts".
	 */
	topContributor?: { label: string; ruleIndex: number; firePercent: number };
}

/** A full calibration run. */
export interface CalibrationReport {
	/** How many artefacts were sampled. */
	sampleSize: number;

	/** Per-rule results, in `CLASSIFICATION_RULES` order. */
	rules: RuleCalibration[];

	/** Per-tag results, strongest lead rate first; tags with no evidence at all are omitted. */
	tags: TagCalibration[];

	/** Rules at or above `SATURATION_CEILING`, worth reviewing against their stated intent. */
	saturatedRules: RuleCalibration[];

	/** Rules that never fired — either dormant by design, or carrying an unreachable condition. */
	dormantRules: RuleCalibration[];
}

/** How a fire rate reads against the thresholds. */
function verdictFor(firePercent: number): CalibrationVerdict {
	if (firePercent === 0) return 'dormant';
	if (firePercent > SATURATION_CEILING) return 'saturated';
	if (firePercent < DORMANCY_FLOOR) return 'rare';
	return 'discriminating';
}

/**
 * Samples `count` artefacts against `culture` and measures how the rule set behaves over them
 * (roadmap 2GN.81).
 *
 * Seeds are derived as `${seed}-${index}`, matching the sampler convention
 * (`scripts/dev/shared.ts`), so a run is fully reproducible from its base seed and count.
 *
 * @param seed - Base PRNG seed. Same seed and count always give the same report.
 * @param culture - The culture/phase preset to generate against, with its geology and trade.
 * @param count - How many artefacts to sample. Fire rates stabilise around a few hundred.
 * @returns The measured report; `rules` stays in rule order, `tags` sorts by lead rate.
 */
export function calibrateRules(
	seed: string,
	culture: ExplorerCulture,
	count: number,
): CalibrationReport {
	const fireCounts = new Array<number>(CLASSIFICATION_RULES.length).fill(0);
	const weightContributed = new Array<number>(CLASSIFICATION_RULES.length).fill(0);
	const presentCounts = new Map<Tag, number>();
	const leadCounts = new Map<Tag, number>();
	const scoreTotals = new Map<Tag, number>();
	// Per tag, how much total weight each rule contributed — for `topContributor`.
	const perTagRuleWeight = new Map<Tag, Map<number, number>>();

	for (let index = 0; index < count; index++) {
		const artefactSeed = `${seed}-${index}`;
		const artefact = normaliseArtefact(
			expandGrammar(CORE_GRAMMAR_RULES, culture.profile, culture.phase, createPrng(artefactSeed)),
			`calibration-${artefactSeed}`,
		);
		const layers = expandDecoration(
			artefact,
			culture.profile,
			culture.phase,
			culture.geology,
			culture.trade,
			createPrng(`${artefactSeed}-decoration`),
			MATERIALS,
			DECORATIVE_TECHNIQUES,
		);
		const features = extractFeatures(artefact, layers);
		const scores = classifyArtefact(features, CLASSIFICATION_RULES);

		CLASSIFICATION_RULES.forEach((rule, ruleIndex) => {
			if (!rule.condition(features)) return;
			fireCounts[ruleIndex]++;
			for (const [tag, weight] of rule.tags) {
				weightContributed[ruleIndex] += weight;
				const byRule = perTagRuleWeight.get(tag) ?? new Map<number, number>();
				byRule.set(ruleIndex, (byRule.get(ruleIndex) ?? 0) + weight);
				perTagRuleWeight.set(tag, byRule);
			}
		});

		let leader: Tag | undefined;
		let leaderScore = -Infinity;
		for (const [tag, score] of scores) {
			presentCounts.set(tag, (presentCounts.get(tag) ?? 0) + 1);
			scoreTotals.set(tag, (scoreTotals.get(tag) ?? 0) + score);
			if (score > leaderScore) {
				leaderScore = score;
				leader = tag;
			}
		}
		if (leader !== undefined) leadCounts.set(leader, (leadCounts.get(leader) ?? 0) + 1);
	}

	const percent = (n: number) => (count === 0 ? 0 : (n / count) * 100);

	const rules: RuleCalibration[] = CLASSIFICATION_RULES.map((rule, ruleIndex) => {
		const fireCount = fireCounts[ruleIndex];
		const firePercent = percent(fireCount);
		return {
			label: `R${ruleIndex + 1}`,
			ruleIndex,
			fireCount,
			firePercent,
			verdict: verdictFor(firePercent),
			contributions: [...rule.tags].map(([tag, weight]) => ({ tag, weight })),
			totalWeightContributed: weightContributed[ruleIndex],
		};
	});

	const vocabulary: readonly Tag[] = [...FUNCTION_TAGS, ...CONTEXT_TAGS];
	const tags: TagCalibration[] = vocabulary
		.filter((tag) => (presentCounts.get(tag) ?? 0) > 0)
		.map((tag) => {
			const presentCount = presentCounts.get(tag) as number;
			const leadCount = leadCounts.get(tag) ?? 0;

			let topContributor: TagCalibration['topContributor'];
			const byRule = perTagRuleWeight.get(tag);
			if (byRule !== undefined && byRule.size > 0) {
				let bestIndex = -1;
				let bestWeight = -Infinity;
				for (const [ruleIndex, weight] of byRule) {
					if (weight > bestWeight) {
						bestWeight = weight;
						bestIndex = ruleIndex;
					}
				}
				topContributor = {
					label: `R${bestIndex + 1}`,
					ruleIndex: bestIndex,
					firePercent: percent(fireCounts[bestIndex]),
				};
			}

			return {
				tag,
				presentCount,
				presentPercent: percent(presentCount),
				leadCount,
				leadPercent: percent(leadCount),
				meanScoreWhenPresent: (scoreTotals.get(tag) as number) / presentCount,
				topContributor,
			};
		})
		.sort((a, b) => b.leadPercent - a.leadPercent || b.presentPercent - a.presentPercent);

	return {
		sampleSize: count,
		rules,
		tags,
		saturatedRules: rules.filter((rule) => rule.verdict === 'saturated'),
		dormantRules: rules.filter((rule) => rule.verdict === 'dormant'),
	};
}
