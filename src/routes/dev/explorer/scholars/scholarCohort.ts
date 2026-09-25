/**
 * Cohort model for the scholars panel (roadmap 2GN.149).
 *
 * Runs `generateNPCScholars` (roadmap 2GN.48) against the Explorer's preset cultures and turns each
 * `NPCScholarSeed` into a display card: rendered name, specialisation, career stage and the rest of
 * the seed's fields, with culture ids resolved to preset labels.
 *
 * **The world is a stand-in.** `generateNPCScholars` takes the loose `Culture[]`/`WorldChronology`
 * bag M2 can supply (no `WorldState` until 3WS.9). Neither exists as generated data yet, so this
 * module lifts the four `EXPLORER_CULTURES` presets into `Culture` records with one phase each and
 * a placeholder timeline — the generator only reads culture ids and whether a timeline has phases,
 * so the placeholder years never reach a scholar. Real chronology is roadmap 3WS.2.
 *
 * Pure, no DOM/Svelte, so it's unit-testable directly per the `structureTree.ts` precedent.
 */

import { createPrng } from '../../../../lib/engine/prng.ts';
import { generateNPCScholars } from '../../../../lib/engine/world/scholars.ts';
import { renderName, renderNameSyllabified } from '../../../../lib/engine/world/naming.ts';
import { EXPLORER_CULTURES } from '../../../../lib/data/explorer-cultures.ts';
import type { ExplorerCulture } from '../../../../lib/data/explorer-cultures.ts';
import type { NPCScholarSeed } from '../../../../lib/types/scholars.ts';
import type { MethodologicalBias } from '../../../../lib/types/interpretation.ts';
import type { Culture, WorldChronology } from '../../../../lib/types/world.ts';

/** Placeholder span for the preset timelines; unread by the generator (see the module doc). */
const PLACEHOLDER_START_YEAR = -500;
const PLACEHOLDER_END_YEAR = 0;

/** One scholar, ready to display. */
export interface ScholarCard {
	seed: NPCScholarSeed;

	/** `renderName(seed.name)`. */
	name: string;

	/** The name with its syllable breaks marked. */
	syllabified: string;

	/** `cultureFocus` resolved to preset labels, in the seed's order. */
	cultureFocusLabels: string[];

	/** The methodological school the seed's identity model carries (doc 07 §5.1). */
	bias: MethodologicalBias;
}

/** The render model for one seed's cohort. */
export interface CohortModel {
	scholars: ScholarCard[];

	/** The cultures the cohort was generated against, for the panel's legend. */
	cultures: readonly ExplorerCulture[];
}

/** Lifts a preset into the `Culture` record the generator expects: one phase, placeholder years. */
export function presetAsCulture(preset: ExplorerCulture): Culture {
	return {
		id: preset.id,
		label: preset.label,
		baseProfile: preset.profile,
		timeline: {
			cultureId: preset.id,
			phases: [
				{
					id: preset.id, // Presets carry one phase; the id doubles as the phase id.
					label: preset.label,
					startYear: PLACEHOLDER_START_YEAR,
					endYear: PLACEHOLDER_END_YEAR,
					characteristics: preset.phase,
				},
			],
		},
	};
}

/** A chronology over `cultures` with no relationships; the generator reads only the timelines. */
export function presetChronology(cultures: readonly Culture[]): WorldChronology {
	return {
		startYear: PLACEHOLDER_START_YEAR,
		endYear: PLACEHOLDER_END_YEAR,
		presentYear: PLACEHOLDER_END_YEAR,
		cultureTimelines: cultures.map((culture) => culture.timeline),
		relationships: [],
	};
}

/**
 * Generates the cohort for `seed` against every Explorer preset.
 *
 * @param seed - The world seed; the cohort draws on the `${seed}-scholars` stream so it neither
 *   shares nor disturbs the artefact panels' draws for the same seed.
 * @param presets - The cultures to generate against. Defaults to every Explorer preset.
 */
export function generateCohort(
	seed: string,
	presets: readonly ExplorerCulture[] = EXPLORER_CULTURES,
): CohortModel {
	const cultures = presets.map(presetAsCulture);
	const chronology = presetChronology(cultures);
	const labels = new Map(presets.map((preset) => [preset.id, preset.label]));

	const scholars = generateNPCScholars(cultures, chronology, createPrng(`${seed}-scholars`)).map(
		(scholar) => ({
			seed: scholar,
			name: renderName(scholar.name),
			syllabified: renderNameSyllabified(scholar.name),
			cultureFocusLabels: scholar.cultureFocus.map((id) => labels.get(id) ?? id),
			bias: scholar.interpretiveModel.methodologicalWeights.bias,
		}),
	);

	return { scholars, cultures: presets };
}
