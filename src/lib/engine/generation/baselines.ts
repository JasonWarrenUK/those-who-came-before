/**
 * Culture-relative classification baseline sampling (roadmap 2GN.95, doc 11 §2.9, doc 12 §2.28).
 *
 * The 2GN.80/2GN.77 ruling scores `RelativeTag` awards against baselines sampled empirically from
 * the producing culture-phase's own output, rather than a fixed constant. This module produces
 * those baselines by running the generation pipeline's stages 1–7
 * (`expandGrammar` → `normaliseArtefact` → `expandDecoration` → `assignMaterials` →
 * `gradeDecorativeLayers` → `extractFeatures`) and stopping before classification (stage 8) —
 * nothing upstream reads a tag, so there is no bootstrap circularity. Materials are assigned and
 * layers re-graded before `extractFeatures` runs, not skipped: `expandDecoration`'s `grade` is only
 * the provisional technique-only value (its own JSDoc), and `meanDecorativeGrade` (R43,
 * `data/classification.ts`) must be sampled from the same material-aware grade real artefacts are
 * classified against, or its baseline is measuring a different quantity than the value it gates.
 *
 * **Deliberately not cached.** Doc 11 §2.9 says baselines are "cached in world state", but
 * `WorldState` does not exist yet (lands at roadmap 3WS.9). `sampleBaselines` is a pure function of
 * its inputs; caching is a memo its eventual owner adds, not a module-level global with no owner.
 *
 * **Deliberately not wired to real culture generation.** No culture/phase generator exists yet
 * (`engine/world/`, roadmap 3WS.3/3WS.4). Callers sample against `EXPLORER_CULTURES`
 * (`data/explorer-cultures.ts`) or the six regional worlds paired with a mock phase
 * (`tests/fixtures/`), via `CulturePhaseSample` — a structural parameter bag rather than a real
 * `CulturePhase`, so nothing here has to change when 3WS.9 lands a real one.
 */

import type {
	CulturalProfile,
	GeologicalContext,
	MaterialFlow,
	PhaseCharacteristics,
} from '../../types/world.ts';
import type { GrammarRule } from '../../types/grammar.ts';
import type { MaterialDefinition } from '../../types/artefact.ts';
import type { DecorativeTechniqueDefinition } from '../../types/decoration.ts';
import type { BaselineFeature, ClassificationContext, FeatureBaseline } from '../../types/tags.ts';
import { createPrng } from '../prng.ts';
import { PERCENTILE_LADDER, percentileLadder } from '../statistics.ts';
import { expandGrammar, normaliseArtefact } from './grammar.ts';
import { expandDecoration, gradeDecorativeLayers } from './decoration.ts';
import { assignMaterials } from './materials.ts';
import { extractFeatures } from './classification.ts';

/** n=400 per culture-phase — the measured knee (doc 11 §2.9, doc 12 §2.28). */
export const BASELINE_SAMPLE_SIZE = 400;

/**
 * The features baselines are sampled for. Every `BaselineFeature` member — a rule migrated in
 * roadmap 2GN.82 can call `ClassificationContext.exceeds` on any of them.
 *
 * Exported so consumers needing "every sampled feature" (`classification.test.ts`'s `permissive`
 * migration-guard fixture) derive the list rather than hand-maintaining a duplicate — a real drift
 * this file already caused once, when `meanDecorativeGrade` had to be added to that fixture by hand
 * alongside this array.
 */
export const SAMPLED_FEATURES: readonly BaselineFeature[] = [
	'decorativeLayerCount',
	'decorativeComplexity',
	'techniqueComplexity',
	'appliedElementCount',
	'decorativePerPart',
	'partCount',
	'attachmentDiversity',
	'edgeCount',
	'meanDecorativeGrade',
];

/**
 * One culture-phase to sample baselines for.
 *
 * A structural parameter bag rather than a `CulturePhase` type: `CulturePhase` (`types/world.ts`)
 * carries no `CulturalProfile`, geology or trade, and `expandDecoration` needs all three. An
 * `ExplorerCulture` (`data/explorer-cultures.ts`) already carries exactly this shape.
 */
export interface CulturePhaseSample {
	cultureId: string;
	phaseId: string;
	profile: CulturalProfile;
	phase: PhaseCharacteristics;
	geology: GeologicalContext;
	trade: readonly MaterialFlow[];
}

/**
 * A `ClassificationContext` with no baselines at all — every `exceeds` call returns `false`.
 *
 * The `src/lib/`-importable counterpart to `tests/fixtures/artefact.ts`'s
 * `emptyClassificationContext` (routes may depend on `lib/` but never on `tests/fixtures/`). No
 * shipped rule reads a `ClassificationContext` yet (roadmap 2GN.82 migrates the first one), so
 * every current Explorer call site passes this rather than an expensively-sampled real context —
 * sampling `BASELINE_SAMPLE_SIZE` extra artefacts on every interactive inspection would cost real
 * latency for zero observable effect until a rule actually consults it.
 */
export function emptyClassificationContext(): ClassificationContext {
	return {
		cultureId: 'none',
		phaseId: 'none',
		baselines: new Map(),
		exceeds(_feature, percentile) {
			// Still honours the off-ladder-throws contract (`types/tags.ts`) even with no baselines
			// to check against — a bad percentile is a caller bug, not a "no evidence" state, and
			// the two must not be conflated just because this context happens to be empty.
			if (!PERCENTILE_LADDER.includes(percentile as (typeof PERCENTILE_LADDER)[number])) {
				throw new Error(
					`ClassificationContext.exceeds: percentile ${percentile} is not a PERCENTILE_LADDER ` +
						`rung (${PERCENTILE_LADDER.join(', ')})`,
				);
			}
			return false;
		},
		hasBaseline: () => false,
	};
}

/** Reads one sampled feature off an extracted-features record, deriving the one derived field. */
function readFeature(
	features: ReturnType<typeof extractFeatures>,
	feature: BaselineFeature,
): number {
	if (feature === 'decorativePerPart') {
		return features.partCount > 0 ? features.decorativeComplexity / features.partCount : 0;
	}
	return features[feature];
}

/**
 * Samples one culture-phase's feature distributions and derives its `ClassificationContext`
 * (doc 11 §2.9, doc 12 §2.28).
 *
 * Runs pipeline stages 1–7 only, seeded `${seed}-${cultureId}-${phaseId}-${index}` (decoration
 * `${...}-decoration`, material assignment `${...}-materials`), matching the convention
 * `scripts/dev/shared.ts` and the existing samplers (`data/calibration.test.ts`,
 * `routes/dev/explorer/calibration/ruleCalibration.ts`) already use. Deterministic: the same seed
 * and target always produce the same context.
 *
 * No default rule/material/technique data: callers pass their catalogues explicitly, matching
 * `classifyArtefact`'s stated contract (`engine/generation/classification.ts`) — this module never
 * imports rule or catalogue data of its own.
 *
 * @param seed - Base PRNG seed. Same seed and target always give the same baselines.
 * @param target - The culture-phase to sample.
 * @param rules - Grammar rules to expand against (e.g. `CORE_GRAMMAR_RULES`).
 * @param materials - Material catalogue for decoration (e.g. `MATERIALS`).
 * @param techniques - Decorative technique catalogue (e.g. `DECORATIVE_TECHNIQUES`).
 * @param sampleSize - Artefacts to sample. Defaults to the ruled n=400.
 */
export function sampleBaselines(
	seed: string,
	target: CulturePhaseSample,
	rules: readonly GrammarRule[],
	materials: readonly MaterialDefinition[],
	techniques: readonly DecorativeTechniqueDefinition[],
	sampleSize: number = BASELINE_SAMPLE_SIZE,
): ClassificationContext {
	const samples = new Map<BaselineFeature, number[]>(
		SAMPLED_FEATURES.map((feature) => [feature, []]),
	);

	for (let index = 0; index < sampleSize; index++) {
		const artefactSeed = `${seed}-${target.cultureId}-${target.phaseId}-${index}`;
		const artefact = normaliseArtefact(
			expandGrammar(rules, target.profile, target.phase, createPrng(artefactSeed)),
			`baseline-${artefactSeed}`,
		);
		const provisionalLayers = expandDecoration(
			artefact,
			target.profile,
			target.phase,
			target.geology,
			target.trade,
			createPrng(`${artefactSeed}-decoration`),
			materials,
			techniques,
		);
		const assignments = assignMaterials(
			artefact,
			target.profile,
			target.phase,
			target.geology,
			target.trade,
			createPrng(`${artefactSeed}-materials`),
			materials,
		);
		const layers = gradeDecorativeLayers(provisionalLayers, assignments, target.phase, materials);
		const features = extractFeatures(artefact, layers);

		for (const feature of SAMPLED_FEATURES) {
			samples.get(feature)!.push(readFeature(features, feature));
		}
	}

	const baselines = new Map<BaselineFeature, FeatureBaseline>();
	for (const [feature, values] of samples) {
		baselines.set(feature, {
			thresholds: percentileLadder(values),
			sampleSize,
		});
	}

	return {
		cultureId: target.cultureId,
		phaseId: target.phaseId,
		baselines,
		exceeds(feature, percentile, value) {
			if (!PERCENTILE_LADDER.includes(percentile as (typeof PERCENTILE_LADDER)[number])) {
				throw new Error(
					`ClassificationContext.exceeds: percentile ${percentile} is not a PERCENTILE_LADDER ` +
						`rung (${PERCENTILE_LADDER.join(', ')})`,
				);
			}
			const baseline = baselines.get(feature);
			if (!baseline) return false;
			const threshold = baseline.thresholds.get(percentile);
			return threshold !== undefined && value >= threshold;
		},
		hasBaseline(feature) {
			return baselines.has(feature);
		},
	};
}
