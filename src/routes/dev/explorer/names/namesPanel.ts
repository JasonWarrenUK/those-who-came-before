/**
 * Names model for the names panel (roadmap 2GN.161): the DOM counterpart of
 * `scripts/dev/sample-names.ts`.
 *
 * Generates a world's `LanguageForest` from the seed alone (roadmap 2GN.66 — a language takes no
 * geology, culture or trade input), then samples what each language actually produces: its culture
 * name, site names and scholar names, rendered with syllable breaks. The modern language (roadmap
 * 2GN.130) gets its own block: one pinned phonology every world shares, sampled here for the
 * player-side names it supplies — colleagues and institutions.
 *
 * `lengthPreference` and `templateProse` restate the CLI sampler's helpers rather than importing
 * them: `scripts/dev/` depends on `src/lib/`, never the reverse, and route code sits on the `src`
 * side of that line.
 *
 * Pure, no DOM/Svelte, so it's unit-testable directly per the `structureTree.ts` precedent.
 */

import { createPrng } from '../../../../lib/engine/prng.ts';
import {
	generateLanguageForest,
	graphemeOf,
	MINIMUM_NAME_SYLLABLES,
} from '../../../../lib/engine/world/phonology.ts';
import {
	generateCultureName,
	generateScholarName,
	generateSiteName,
	renderName,
	renderNameSyllabified,
} from '../../../../lib/engine/world/naming.ts';
import { MODERN_LANGUAGE_ID, MODERN_PHONOLOGY } from '../../../../lib/data/names/modern.ts';
import type { NameForm, Phonology } from '../../../../lib/types/language.ts';

/** A rendered name: display text plus its syllabified form. */
export interface SampledName {
	text: string;

	/** `renderNameSyllabified`'s output — the boundaries the generator recorded, not reconstructed. */
	syllabified: string;

	/** The underlying `NameForm`, for anything wanting the phonemes. */
	form: NameForm;
}

/** A phonology summarised for display. */
export interface SoundSystem {
	/** Consonant graphemes, commonest first (the order `pickRanked` draws against). */
	consonants: string[];

	/** Vowel graphemes, commonest first. */
	vowels: string[];

	/** The syllable template's own label, e.g. `CV(C)`. */
	templateLabel: string;

	/** The template in prose: onset, coda and cluster rules. */
	templateProse: string;

	/** The language's length preference in prose: "mostly two, sometimes three". */
	lengthPreference: string;
}

/** One generated language with the names it produced. */
export interface SampledLanguage {
	id: string;
	familyId: string;

	/** Index within the family, so sisters read as "1 of 2". */
	memberIndex: number;

	/** How many languages share this family; `1` means an isolate. */
	familySize: number;

	soundSystem: SoundSystem;

	cultureName: SampledName;
	sites: SampledName[];
	scholars: SampledName[];
}

/** The curated modern language's block. */
export interface ModernLanguage {
	id: string;
	soundSystem: SoundSystem;

	/** Personal names for the player's colleagues (`generateScholarName`). */
	colleagues: SampledName[];

	/** Place-style names for the player's institutions and venues (`generateSiteName`). */
	institutions: SampledName[];
}

/** The render model for one seed's languages and names. */
export interface NamesModel {
	seed: string;
	cultureCount: number;
	namesPerLanguage: number;

	/** Every generated language, in forest order (family by family, members in order). */
	languages: SampledLanguage[];

	/** How many families the forest partitioned into. */
	familyCount: number;

	modern: ModernLanguage;
}

/** Wraps a `NameForm` with its two renderings. */
function sample(form: NameForm): SampledName {
	return { text: renderName(form), syllabified: renderNameSyllabified(form), form };
}

const COUNT_WORDS = ['one', 'two', 'three', 'four'];

/**
 * Describes a language's length preference in words rather than weights, reading the same
 * `syllableWeights` `drawSyllableCount` draws against so it cannot drift from the generator.
 */
export function lengthPreference(phonology: Phonology): string {
	const ranked = phonology.syllableWeights
		.map((weight, index) => ({ count: MINIMUM_NAME_SYLLABLES + index, weight }))
		.sort((first, second) => second.weight - first.weight);

	const word = (count: number) => COUNT_WORDS[count - 1] ?? String(count);

	return `mostly ${word(ranked[0].count)}, sometimes ${word(ranked[1].count)}`;
}

/** Describes a syllable template in prose rather than as a formula. */
export function templateProse(phonology: Phonology): string {
	const { template } = phonology;
	const parts = [
		template.onset === 'required' ? 'must open on a consonant' : 'may open on a vowel',
		template.coda === 'none' ? 'never closes on one' : 'may close on one',
	];

	if (template.clusters) parts.push('admits two-consonant onsets');

	return parts.join(', ');
}

/** Summarises a phonology for display. */
export function summariseSoundSystem(phonology: Phonology): SoundSystem {
	return {
		consonants: phonology.consonants.map(graphemeOf),
		vowels: phonology.vowels.map(graphemeOf),
		templateLabel: phonology.template.label,
		templateProse: templateProse(phonology),
		lengthPreference: lengthPreference(phonology),
	};
}

/**
 * Generates `cultureCount` languages from `seed` and samples `namesPerLanguage` site and scholar
 * names from each, plus the modern language's colleague and institution names.
 *
 * Per-language draws run on `${seed}:${languageId}` and the modern samples on `${seed}:modern`,
 * matching the CLI sampler's stream convention, so adding a language never reshuffles another's
 * names and the two tools agree name for name on the same seed.
 *
 * @param seed - The world seed; the forest and every sampled name derive from it.
 * @param cultureCount - How many cultures (so languages) the world holds. MVP ships 2; the
 *   Explorer's four presets suggest 4.
 * @param namesPerLanguage - How many site and scholar names to sample per language.
 */
export function sampleNames(
	seed: string,
	cultureCount: number,
	namesPerLanguage: number,
): NamesModel {
	const forest = generateLanguageForest(cultureCount, createPrng(seed));

	const languages = forest.families.flatMap((family) =>
		family.languageIds.map((languageId, memberIndex) => {
			const language = forest.languages.get(languageId)!;
			const prng = createPrng(`${seed}:${languageId}`);
			const { phonology } = language;

			return {
				id: languageId,
				familyId: family.id,
				memberIndex,
				familySize: family.languageIds.length,
				soundSystem: summariseSoundSystem(phonology),
				cultureName: sample(generateCultureName(phonology, languageId, prng)),
				sites: Array.from(
					{ length: namesPerLanguage },
					() => sample(generateSiteName(phonology, languageId, prng)),
				),
				scholars: Array.from(
					{ length: namesPerLanguage },
					() => sample(generateScholarName(phonology, languageId, prng)),
				),
			};
		})
	);

	const modernPrng = createPrng(`${seed}:${MODERN_LANGUAGE_ID}`);
	const modern: ModernLanguage = {
		id: MODERN_LANGUAGE_ID,
		soundSystem: summariseSoundSystem(MODERN_PHONOLOGY),
		colleagues: Array.from(
			{ length: namesPerLanguage },
			() => sample(generateScholarName(MODERN_PHONOLOGY, MODERN_LANGUAGE_ID, modernPrng)),
		),
		institutions: Array.from(
			{ length: namesPerLanguage },
			() => sample(generateSiteName(MODERN_PHONOLOGY, MODERN_LANGUAGE_ID, modernPrng)),
		),
	};

	return {
		seed,
		cultureCount,
		namesPerLanguage,
		languages,
		familyCount: forest.families.length,
		modern,
	};
}
