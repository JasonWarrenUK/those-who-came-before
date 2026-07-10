/**
 * Interpretive lens type definitions (doc 04) — the core mechanic's five channels and the
 * per-hypothesis strength model that scales them. The lens filters what an agent notices, never
 * what exists: it operates exclusively on observable and inferable properties
 * (`PropertyVisibility`, visibility.ts), reordering, reframing and de-emphasising without ever
 * revealing an occluded property or hiding an observable one. Channel outputs
 * (`ObservationSalience`, `ClassificationSuggestion`, `CrossReference`, `DescriptionFrame`,
 * `OmissionCheck`) are computed per artefact on inspection; `LensStrength` and `LensState` are
 * agent-level. All of it is agent-generic (doc 11 §2.6) — the player's lens and an NPC scholar's
 * lens are the same shapes. This module is data shapes only, no behaviour; lens computation lives
 * under `engine/lens/` (roadmap 6LS.*).
 */

import type { ContextTag, FunctionTag } from './tags.ts';

/**
 * Channel 1, observation salience (doc 04 §3.1): the lens-weighted prominence of one observable
 * property in an artefact's inspection list. The list is sorted by `finalWeight` descending;
 * properties below a threshold (e.g. 0.5) drop into an "on closer inspection" section that costs
 * an extra action. What the player notices first shapes the hypothesis they form.
 */
export interface ObservationSalience {
	/** The property whose prominence this describes. */
	propertyId: string;

	/** Default prominence with no lens influence (1.0 = neutral). */
	baseWeight: number;

	/** Per-hypothesis adjustments, kept individually for traceability. */
	lensAdjustments: Array<{
		/** The hypothesis contributing this adjustment. */
		sourceHypothesisId: string;

		/** Signed adjustment from the hypothesis. */
		weightDelta: number;

		/** Traceable rationale, e.g. `"hypothesis h3 infers decorative obsidian"`. */
		reason: string;
	}>;

	/** Computed: base + sum(adjustments), clamped [0.1, 3.0]. */
	finalWeight: number;
}

/**
 * Channel 2, classification suggestions (doc 04 §3.2): one pre-populated classification option,
 * weighted toward consistency with the agent's existing hypotheses. The agent can always choose
 * any classification — the gravity is in the ordering and prominence, not the option set.
 */
export interface ClassificationSuggestion {
	/** The classification being suggested. */
	classificationId: string;

	/** Player-facing label for the classification. */
	label: string;

	/** Plausibility from artefact properties alone. */
	basePlausibility: number;

	/** Boost from interpretive-model alignment. */
	lensBoost: number;

	/** Computed: `basePlausibility * (1 + lensBoost)`. */
	finalScore: number;

	/** Which beliefs are boosting this suggestion. */
	sourceHypotheses: string[];
}

/**
 * Channel 3, cross-reference priming (doc 04 §3.3): a suggested comparison with a previously
 * studied artefact. Matching is biased — properties aligning with existing hypotheses generate
 * stronger signals, so the system can truthfully cluster artefacts in ways that reinforce a wrong
 * assumption (a river find promoted as "Culture A" because the agent believes Culture A is
 * river-dwelling).
 */
export interface CrossReference {
	/** The previously studied artefact being surfaced. */
	targetArtefactId: string;

	/** Properties the two artefacts share. */
	matchingProperties: string[];

	/** Property overlap score, lens-free. */
	baseRelevance: number;

	/** Hypothesis-aligned boost. */
	lensRelevance: number;

	/** Computed: `baseRelevance * (1 + lensRelevance)`. */
	finalRelevance: number;

	/** Flag for contradiction detection (doc 06): the match may cluster across true cultures. */
	potentiallyMisleading: boolean;
}

/**
 * The three MVP description registers (doc 04 §3.4): equally truthful framings of the same
 * physical reality. Observational foregrounds material-science language, interpretive foregrounds
 * function and meaning, technical foregrounds craft process. MVP-canonical per doc 12 §2.10; the
 * five-value `ObservationRegister` + `RegisterAccess` acquisition model (doc 05 §12) is post-MVP
 * (doc 13 §4).
 */
export type DescriptionRegister =
	| 'observational'
	| 'interpretive'
	| 'technical';

/**
 * Channel 4, descriptive framing (doc 04 §3.4): register-parameterised description variants for
 * one property, with the lens's selection recorded. The lens controls emphasis and ordering, not
 * availability — the other registers stay accessible through deliberate investigation, and within
 * a register the lens selects the variant that aligns with the agent's framework.
 */
export interface DescriptionFrame {
	/** The property being described. */
	propertyId: string;

	/** Candidate variants per register, all describing the same physical reality. */
	registers: Record<
		DescriptionRegister,
		Array<{
			/** The rendered description text. */
			text: string;

			/** What this variant foregrounds. */
			emphasis: string;

			/** Which hypothesis tags this variant supports. */
			alignsWithTags: string[];
		}>
	>;

	/** Register the lens foregrounded, based on lens alignment. */
	selectedRegister: DescriptionRegister;

	/** Index of the chosen variant within the selected register. */
	selectedVariant: number;
}

/**
 * Channel 5, omission blindness (doc 04 §3.5): the inverse of salience. Properties that
 * contradict existing beliefs are not hidden, only harder to notice — placed lower, described
 * more neutrally, never flagged as noteworthy. `suppressionLevel` is capped so significant
 * contradictions still bubble up: iron rivets can slip past, a full iron sword from a
 * "no metalwork" culture cannot.
 */
export interface OmissionCheck {
	/** The property whose suppression this describes. */
	propertyId: string;

	/** Hypothesis ids this property conflicts with. */
	contradicts: string[];

	/** 0 = no suppression, 1 = maximum de-emphasis (capped in practice). */
	suppressionLevel: number;

	/** Visibility from property importance, lens-free. */
	baseVisibility: number;

	/** Computed: `baseVisibility * (1 - suppressionLevel * 0.6)`. */
	adjustedVisibility: number;
}

/**
 * Per-hypothesis lens strength (doc 04 §4): how much one belief warps perception, scaling with
 * the agent's commitment to it. A published, taught, cited, well-evidenced hypothesis filters
 * hard; a tentative unsupported one has almost no effect. Recomputed at term boundaries with
 * decay applied (doc 04 §4.1, roadmap 6LS.4).
 */
export interface LensStrength {
	/** The hypothesis this strength belongs to. */
	hypothesisId: string;

	/** The individual contributions, kept for legibility and the Explorer (roadmap 6LS.16). */
	factors: {
		/**
		 * Graduated by dissemination state (doc 10, doc 12 §2.16): 0 (private), 0.1 (circulated),
		 * 0.15 (presented), 0.2 (submitted), 0.3 (published), 0.35 (collected).
		 */
		dissemination: number;

		/** 0–1, multiplied with `dissemination` — high-prestige publication is stronger lock-in. */
		venuePrestige: number;

		/** 0–1 direct mapping from hypothesis confidence. */
		confidence: number;

		/** `log2(count) * 0.1`, capped at 0.3. */
		evidenceCount: number;

		/** +0.2 if true (career activity: student supervision, doc 07). */
		taught: boolean;

		/** 0.05 per citation, capped at 0.2. */
		cited: number;

		/** -0.1 per active contradiction. */
		contradictions: number;

		/** -0.15 if true — sabbatical grants temporary clarity (doc 07 §4.1). */
		onSabbatical: boolean;
	};

	/** Combined strength, clamped [0, 1]. */
	totalStrength: number;

	/** Term index when strength was last computed. */
	lastRecalculatedTerm: number;
}

/**
 * Provisional, not doc-specified: the agent-level lens summary. Named throughout the docs
 * (doc 06 §6's `lensState` field, doc 08 §3.3's derived store) but never given a shape; authored
 * here against its consumers — the five channel functions (roadmap 6LS.6–6LS.10) take
 * `(artefact, lensState)` rather than the `InterpretiveModel`, so this must carry everything they
 * need. The per-artefact channel outputs above are deliberately excluded: they are computed on
 * demand, not cached agent-level. Never persisted — recomputed from the interpretive model on
 * load (doc 12 §2.14). Expect this to firm up when `computeLens` lands (roadmap 6LS.2, 6LS.3).
 */
export interface LensState {
	/** Per-hypothesis computed strength, keyed by hypothesis id (doc 04 §4). */
	strengths: Map<string, LensStrength>;

	/**
	 * Provisional: aggregated per-tag boost/suppression, 0 = neutral, matching the
	 * `(1 + lensBoost)` channel arithmetic (doc 04 §3.2). Each hypothesis contributes boosts for
	 * its tags scaled by its strength (roadmap 6LS.3) — this is what lets channel functions run on
	 * `LensState` alone.
	 */
	tagWeights: Map<FunctionTag | ContextTag, number>;

	/** Term index when this state was computed — recompute/decay bookkeeping (doc 04 §4.1). */
	computedAtTerm: number;
}
