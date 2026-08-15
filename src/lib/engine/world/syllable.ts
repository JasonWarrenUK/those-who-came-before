/**
 * Syllabification (roadmap 2GN.66, spike `docs/spikes/2GN.66-naming-grammars.md`).
 *
 * Splits a segment list into syllables by sonority-based onset maximisation. Pure engine code
 * (doc 08 §2.1).
 *
 * ⚠️ **This is the derivation, not the authority.** A `NameForm` records the boundaries its generator
 * built (`NameForm.syllables`), and `renderNameSyllabified` reads those; this module reconstructs
 * boundaries from segments alone, for callers holding no `NameForm` and — once sound change lands —
 * for names whose stored boundaries drift has invalidated. `the-tongue`'s `1eng-25` measured 29% of
 * word-changing operations altering syllable count, which is why the derived path must keep existing
 * even though the stored one is exact today.
 *
 * The two are cross-checked: `naming.test.ts` asserts they agree on a high proportion of generated
 * names. They are meant to agree — the generator applies onset maximisation as it builds
 * (`resolveCoda`) precisely so that its record matches how a reader would parse the result.
 *
 * ⚠️ **Deliberately does not read `SyllableTemplate`.** The template describes how a name was
 * *generated*; this function describes how a segment list *reads now*. Those diverge the moment a
 * name drifts, and `the-tongue` shipped a real bug from exactly this conflation — rendering a
 * genesis parameter as a live description, wrong by ~9 phonemes by turn 120. Onset maximisation
 * needs no template anyway: it is a property of the segments alone.
 */

import type { Manner } from '../../types/language.ts';
import { MANNER_VALUES } from '../../types/language.ts';
import { PHONES_BY_ID } from '../../data/names/phones.ts';
import { ONSET_CLUSTER_MANNERS, ONSET_S_CLUSTER_FOLLOWERS } from '../../data/names/coherence.ts';

/**
 * One syllable's three slots. `nucleus` is `null` only for a degenerate input holding no vowel,
 * which `generateNameForm` cannot produce but a hand-built `NameForm` could.
 */
export interface Syllable {
	/** Consonants before the vowel. */
	onset: string[];

	/** The vowel, or `null` where the input held none. */
	nucleus: string | null;

	/** Consonants after the vowel, before the next syllable's onset. */
	coda: string[];
}

/**
 * Whether an ordered consonant pair forms an admissible onset cluster: either a sonority-rising pair
 * per `ONSET_CLUSTER_MANNERS`, or the `/s/`-specific exception in `ONSET_S_CLUSTER_FOLLOWERS`.
 *
 * The second check is by phoneme id, not manner, deliberately — the `/s/` exception does not
 * generalise to every fricative. See `ONSET_S_CLUSTER_FOLLOWERS`'s doc comment.
 */
export function isAdmissibleCluster(first: string, second: string): boolean {
	const firstManner = PHONES_BY_ID.get(first)?.manner;
	const secondManner = PHONES_BY_ID.get(second)?.manner;

	if (firstManner === undefined || secondManner === undefined) {
		return false;
	}

	if (ONSET_CLUSTER_MANNERS.some(([a, b]) => a === firstManner && b === secondManner)) {
		return true;
	}

	return first === 's' && ONSET_S_CLUSTER_FOLLOWERS.includes(secondManner);
}

/**
 * Sonority rank of a phoneme: how open the vocal tract is, low to high. Vowels outrank every
 * consonant; among consonants the ranking is `MANNER_VALUES`' own order, which is authored as
 * increasing sonority precisely so this function need not restate it.
 *
 * ⚠️ A vowel ranks **strictly above** the most sonorous consonant, not equal to it. An earlier
 * version returned `MANNER_VALUES.length` for a vowel and `indexOf + 1` for a consonant, which made
 * an approximant and a vowel tie at 9 — and since onset maximisation walks left only while sonority
 * *rises*, a tie stopped the walk and no glide could ever begin a syllable. `Yayunu` syllabified as
 * `yay • u • nu` rather than `ya • yu • nu`. Caught by the `sample:names` script.
 *
 * An unknown id ranks 0 — the least sonorous — so it attaches to an onset rather than being mistaken
 * for a nucleus.
 */
export function sonorityOf(phonemeId: string): number {
	const phone = PHONES_BY_ID.get(phonemeId);

	if (phone === undefined) {
		return 0;
	}
	if (phone.type === 'vowel') {
		return MANNER_VALUES.length + 1;
	}

	return MANNER_VALUES.indexOf(phone.manner as Manner) + 1;
}

/** Whether a phoneme id names a vowel. Unknown ids are not vowels. */
function isVowel(phonemeId: string): boolean {
	return PHONES_BY_ID.get(phonemeId)?.type === 'vowel';
}

/**
 * Splits a segment list into syllables.
 *
 * Every vowel is a nucleus; the consonants between two nuclei are divided by **onset maximisation**,
 * walking left from the following vowel for as long as sonority keeps rising towards it. The
 * furthest point reached becomes the next syllable's onset, and whatever remains falls back to the
 * preceding syllable's coda. `tapra` splits `ta·pra` (stop→trill rises, so both join the onset);
 * `alka` splits `al·ka` (lateral→stop falls, so `l` stays a coda).
 *
 * @param segments - Phoneme ids in order.
 * @returns One `Syllable` per vowel, or a single nucleus-less syllable for a vowel-free input.
 */
export function syllabify(segments: readonly string[]): Syllable[] {
	const nucleusPositions = segments
		.map((segment, index) => (isVowel(segment) ? index : -1))
		.filter((index) => index >= 0);

	if (nucleusPositions.length === 0) {
		return [{ onset: [...segments], nucleus: null, coda: [] }];
	}

	const syllables: Syllable[] = [];

	for (const [order, position] of nucleusPositions.entries()) {
		const previousPosition = order === 0 ? -1 : nucleusPositions[order - 1];

		// Consonants between the previous nucleus and this one, split between that syllable's coda
		// and this syllable's onset.
		const betweenStart = previousPosition + 1;
		const between = segments.slice(betweenStart, position);

		// Walk left from the nucleus while sonority keeps rising towards it; that span is the onset.
		let onsetStart = between.length;
		while (onsetStart > 0) {
			const candidate = between[onsetStart - 1];
			const nextIsNucleus = onsetStart === between.length;
			const next = nextIsNucleus ? segments[position] : between[onsetStart];

			if (sonorityOf(candidate) >= sonorityOf(next)) {
				break;
			}

			// Sonority rising is necessary but not sufficient: the pair must also be a cluster some
			// language would actually admit. `ch` before `ś` rises, yet `chś` is no onset — without this
			// the walk invented clusters the generator could never have produced, and `Lechśekpin` read
			// `le • chśek • pin` rather than `lech • śek • pin`.
			if (!nextIsNucleus && !isAdmissibleCluster(candidate, next)) {
				break;
			}

			onsetStart--;
		}

		// The first syllable takes every leading consonant as its onset: there is no earlier syllable
		// for the remainder to fall back to.
		if (order === 0) {
			onsetStart = 0;
		} else {
			syllables[order - 1].coda.push(...between.slice(0, onsetStart));
		}

		syllables.push({
			onset: between.slice(onsetStart),
			nucleus: segments[position],
			coda: [],
		});
	}

	// Everything after the final nucleus is that syllable's coda.
	const lastPosition = nucleusPositions[nucleusPositions.length - 1];
	syllables[syllables.length - 1].coda.push(...segments.slice(lastPosition + 1));

	return syllables;
}

/** The number of syllables a segment list reads as. A vowel-free input counts as one. */
export function syllableCount(segments: readonly string[]): number {
	return Math.max(1, segments.filter(isVowel).length);
}

/**
 * Renders a segment list with its syllable boundaries marked, for developer tooling —
 * `['p','o','p','o']` becomes `po • po`. Uses graphemes, so it reads as the name does.
 */
export function renderSyllabified(segments: readonly string[], separator = ' • '): string {
	return syllabify(segments)
		.map((syllable) =>
			[...syllable.onset, syllable.nucleus, ...syllable.coda]
				.filter((id): id is string => id !== null)
				.map((id) => PHONES_BY_ID.get(id)?.grapheme ?? id)
				.join('')
		)
		.join(separator);
}
