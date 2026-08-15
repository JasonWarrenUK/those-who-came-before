/**
 * Name generation and rendering (roadmap 2GN.66, spike `docs/spikes/2GN.66-naming-grammars.md`).
 *
 * Produces the proper nouns the world needs — site names, culture names, scholar names — by drawing
 * syllables from a language's phonology. Pure engine code (doc 08 §2.1).
 *
 * **Names are generated on a different path from ordinary words**, and the differences are what make
 * output read as a name rather than as a random string. Three parameters, all from `the-tongue`'s
 * shipped generator:
 *
 * - **Onset strongly preferred** (`ONSET_PREFERENCE`), because names read stronger opening on a
 *   consonant.
 * - **Longer than lexical words**, and at a length each language chooses for itself
 *   (`Phonology.syllableWeights`) rather than a constant shared by every language.
 * - **Codas drawn only from sonorants**, so names end softly (`Aenic`, `Boran`) rather than on a
 *   stop cluster.
 *
 * ⚠️ A `NameForm` stores **phoneme ids, not text**. This is a deliberate divergence from
 * `the-tongue`, which returns display strings so its branch names do not drift under sound change.
 * Here the drift is the point: a site named in an early phase and met in a late-phase document under
 * a changed form is a real interpretive puzzle (Pillar 1, error is the engine). `renderName` is
 * currently identity with respect to time because no sound change exists to apply.
 */

import type { NameForm, Phonology } from '../../types/language.ts';
import { PHONES_BY_ID } from '../../data/names/phones.ts';
import {
	ALLOW_IDENTICAL_JUNCTURE,
	ALLOW_IDENTICAL_VOWEL_HIATUS,
	MAX_CONSONANT_RUN,
} from '../../data/names/coherence.ts';
import { pickRanked, weightedSelect } from '../prng.ts';
import { MINIMUM_NAME_SYLLABLES } from './phonology.ts';
import { isAdmissibleCluster, renderSyllabified } from './syllable.ts';

export { isAdmissibleCluster };

/**
 * How often a name's syllable opens with a consonant, where the template makes it optional. Well
 * above the lexical rate: a name beginning with a vowel reads weaker, and 0.85 leaves vowel-initial
 * names possible without making them common.
 */
const ONSET_PREFERENCE = 0.85;

/** How often an optional coda is filled. */
const CODA_RATE = 0.35;

/** How often an admissible onset cluster is taken, in a language whose template allows clusters. */
const CLUSTER_RATE = 0.25;

/**
 * Manners a name may end on. Sonorants only, so names close softly — the difference between `Boran`
 * and `Borant`. Names are read aloud in the player's head far more than common words are, and a
 * stop-final cluster reads as a typing accident rather than as a place.
 */
const SONORANT_MANNERS: ReadonlySet<string> = new Set([
	'nasal',
	'lateral',
	'trill',
	'tap',
	'approximant',
]);

/** The consonants of a phonology admissible as a name-final coda, in rank order. */
function sonorantCodas(phonology: Phonology): string[] {
	return phonology.consonants.filter((id) => {
		const manner = PHONES_BY_ID.get(id)?.manner;
		return manner !== undefined && SONORANT_MANNERS.has(manner);
	});
}

/** Whether a phoneme id names a consonant. Unknown ids are not consonants. */
function isConsonantId(id: string): boolean {
	return PHONES_BY_ID.get(id)?.type === 'consonant';
}

/** A syllable as drawn, kept in parts so the assembler can inspect both sides of a boundary. */
interface DrawnSyllable {
	onset: string[];
	nucleus: string;
	coda: string[];
}

/**
 * Draws one syllable, in parts.
 *
 * `isFinal` governs the coda: a name-final coda is restricted to sonorants (see `SONORANT_MANNERS`),
 * where a word-internal one may be any consonant the language has.
 *
 * ⚠️ Returns parts rather than a flat list so `generateNameForm` can apply onset maximisation across
 * the boundary — see `resolveCoda`. Draw count varies by branch taken, which is fine *within* one
 * name but means callers must not assume a fixed number of `prng()` calls per syllable.
 */
function generateSyllable(
	phonology: Phonology,
	prng: () => number,
	isFinal: boolean,
): DrawnSyllable {
	const { template } = phonology;
	const onset: string[] = [];

	const wantsOnset = template.onset === 'required' || prng() < ONSET_PREFERENCE;
	if (wantsOnset) {
		const first = pickRanked(phonology.consonants, prng);
		onset.push(first);

		if (template.clusters && prng() < CLUSTER_RATE) {
			const second = pickRanked(phonology.consonants, prng);
			// Silently declining an inadmissible pair keeps the cluster rate honest: forcing a retry
			// until one is admissible would over-represent whichever pairs the language happens to
			// allow, and could loop forever in a language with no admissible pair at all.
			if (isAdmissibleCluster(first, second)) {
				onset.push(second);
			}
		}
	}

	const nucleus = pickRanked(phonology.vowels, prng);
	const coda: string[] = [];

	if (template.coda === 'optional' && prng() < CODA_RATE) {
		const candidates = isFinal ? sonorantCodas(phonology) : phonology.consonants;
		if (candidates.length > 0) {
			coda.push(pickRanked(candidates, prng));
		}
	}

	return { onset, nucleus, coda };
}

/**
 * Decides whether a syllable keeps its drawn coda, given what follows it.
 *
 * ⚠️ **This is onset maximisation applied at generation time**, and it exists because the generator
 * was otherwise building syllables that no reader would parse the way it intended. A coda drawn
 * before a *vowel-initial* syllable is stranded: `d-a-n` followed by `o` is universally read `da·no`,
 * never `dan·o`, because a single consonant between two vowels attaches forward. The generator's
 * record said `dan·o` and disagreed with `syllabify` on 20% of names — the generator being wrong, not
 * the syllabifier.
 *
 * Dropping the coda rather than moving it keeps the draw sequence untouched: the coda was drawn from
 * this syllable's candidate list (sonorant-restricted when final), which is not the list the next
 * syllable's onset would draw from. Moving it would smuggle a differently-distributed phoneme into an
 * onset position.
 */
function resolveCoda(syllable: DrawnSyllable, next: DrawnSyllable | undefined): string[] {
	if (syllable.coda.length === 0 || next === undefined) {
		return syllable.coda;
	}

	// A following onset gives the coda something to sit against, so it stays a coda.
	return next.onset.length > 0 ? syllable.coda : [];
}

/**
 * Generates a name of `syllableCount` syllables in the given language.
 *
 * Lower-level than the three named helpers below; use those unless a caller needs an unusual length.
 */
export function generateNameForm(
	phonology: Phonology,
	languageId: string,
	prng: () => number,
	syllableCount: number,
	coinedPhaseId: string | null = null,
): NameForm {
	// Drawn in full first, so `resolveCoda` can see the following syllable's onset. Drawing and
	// assembling in one pass is what left codas stranded before vowel-initial syllables.
	const drawn = Array.from(
		{ length: syllableCount },
		(_unused, index) => generateSyllable(phonology, prng, index === syllableCount - 1),
	);

	const segments: string[] = [];
	const syllables: number[] = [];

	for (const [index, syllable] of drawn.entries()) {
		const flat = [
			...syllable.onset,
			syllable.nucleus,
			...resolveCoda(syllable, drawn[index + 1]),
		];

		const smoothed = smoothJuncture(segments, flat);

		// ⚠️ Re-check the boundary *after* smoothing, not only before. `resolveCoda` decides from the
		// drawn syllables, but `smoothJuncture` can strip this syllable's onset — and a coda kept
		// because an onset was coming is stranded once that onset is gone. `Dano` survived the
		// pre-check as `dan • o` exactly this way: syllable two drew an onset, smoothing removed it as
		// a duplicate, and the `n` was left closing a syllable no reader would close.
		//
		// Runs *before* `breakVowelDoubling`, since dropping the coda can bring two vowels together —
		// which is precisely the case that repair exists to catch.
		if (index > 0 && smoothed.length > 0 && !isConsonantId(smoothed[0])) {
			const previous = syllables[index - 1];

			if (previous > 1 && isConsonantId(segments[segments.length - 1])) {
				segments.pop();
				syllables[index - 1] = previous - 1;
			}
		}

		const repaired = breakVowelDoubling(phonology, segments, smoothed);

		// Counted *after* every repair, since each may drop a segment — a count taken before them
		// would not sum to `segments.length`.
		segments.push(...repaired);
		syllables.push(repaired.length);
	}

	return { segments, syllables, languageId, coinedPhaseId };
}

/**
 * Replaces a syllable's leading vowel where it would double the preceding one (`Naa`, `Sulpee`).
 *
 * ⚠️ **Substitutes rather than trims, unlike `smoothJuncture`.** A syllable reduced to a bare vowel
 * is exactly the case that produces the defect, and dropping that vowel would delete the syllable
 * outright — so this swaps in the next vowel in the language's ordering instead. An earlier version
 * guarded with `length > 1` to protect the syllable and left 50 doubled vowels per 6000 names
 * unfixed, `Kaa` among them.
 *
 * Costs no `prng()` draws: the replacement is chosen positionally from the inventory, so name
 * generation stays deterministic regardless of how often this fires. Scoped to *identical* vowels;
 * ordinary hiatus (`Nia`, `Teo`) is legitimate and untouched.
 */
function breakVowelDoubling(
	phonology: Phonology,
	existing: readonly string[],
	syllable: string[],
): string[] {
	if (ALLOW_IDENTICAL_VOWEL_HIATUS || existing.length === 0 || syllable.length === 0) {
		return syllable;
	}

	const previous = existing[existing.length - 1];
	if (syllable[0] !== previous || PHONES_BY_ID.get(previous)?.type !== 'vowel') {
		return syllable;
	}

	// Next vowel in this language's own ordering, wrapping — so the substitute is still a vowel the
	// language favours rather than an arbitrary one.
	const position = phonology.vowels.indexOf(previous);
	if (position < 0 || phonology.vowels.length < 2) {
		return syllable;
	}

	const replacement = phonology.vowels[(position + 1) % phonology.vowels.length];
	return [replacement, ...syllable.slice(1)];
}

/**
 * Repairs the seam between a name's syllables, enforcing the two juncture rules in
 * `data/names/coherence.ts`.
 *
 * The onset cluster rules govern consonants *within* one onset, so nothing inspects the boundary
 * where one syllable's coda meets the next syllable's onset — the accident that produced
 * `Nafdoththti` and `Kakklo` before this existed.
 *
 * Repairs by **trimming the incoming onset**, not by redrawing. A redraw loop would consume a
 * variable number of `prng()` calls and could not terminate in a language whose inventory makes the
 * seam unavoidable; dropping a segment always terminates and costs no draws. The trimmed syllable
 * keeps its vowel, so a syllable can never be deleted outright.
 */
function smoothJuncture(existing: readonly string[], incoming: string[]): string[] {
	if (existing.length === 0) {
		return incoming;
	}

	const smoothed = [...incoming];

	// Trim leading consonants while the run spanning the seam exceeds the limit (`Nafdoththti`).
	let trailingConsonants = 0;
	for (let index = existing.length - 1; index >= 0 && isConsonantId(existing[index]); index--) {
		trailingConsonants++;
	}

	let leadingConsonants = 0;
	while (leadingConsonants < smoothed.length && isConsonantId(smoothed[leadingConsonants])) {
		leadingConsonants++;
	}

	while (leadingConsonants > 0 && trailingConsonants + leadingConsonants > MAX_CONSONANT_RUN) {
		smoothed.shift();
		leadingConsonants--;
	}

	// Drop a leading onset identical to the preceding coda (`Kakklo`). Runs *after* the trim above,
	// not before: trimming changes which segment leads, so an identical pair can be exposed by it —
	// checking first left `Kanoppā` and `Tänna` through.
	if (
		!ALLOW_IDENTICAL_JUNCTURE &&
		smoothed.length > 0 &&
		isConsonantId(smoothed[0]) &&
		smoothed[0] === existing[existing.length - 1]
	) {
		smoothed.shift();
	}

	return smoothed;
}

/**
 * Draws a syllable count from this language's own length preference (`Phonology.syllableWeights`).
 *
 * Every name-generating function routes through here rather than rolling its own length, so word
 * length is a property of the language. It previously was not: all three helpers rolled `2 or 3` on
 * the same coin flip, making length the one axis on which no two languages could differ.
 */
export function drawSyllableCount(phonology: Phonology, prng: () => number): number {
	const counts = phonology.syllableWeights.map(
		(_weight, index) => MINIMUM_NAME_SYLLABLES + index,
	);

	return weightedSelect(
		counts,
		prng,
		(count) => phonology.syllableWeights[count - MINIMUM_NAME_SYLLABLES],
	);
}

/**
 * Generates a site name, at whatever length this language favours.
 *
 * `coinedPhaseId` should be the phase current when the site was named, which is what a later
 * renderer walks sound changes forward from. It is recorded but not yet read.
 */
export function generateSiteName(
	phonology: Phonology,
	languageId: string,
	prng: () => number,
	coinedPhaseId: string | null = null,
): NameForm {
	return generateNameForm(
		phonology,
		languageId,
		prng,
		drawSyllableCount(phonology, prng),
		coinedPhaseId,
	);
}

/**
 * Generates a culture name, at whatever length this language favours.
 *
 * `coinedPhaseId` is `null` by construction — a culture's own name is not coined within one of its
 * own phases, so there is no phase to date it to.
 */
export function generateCultureName(
	phonology: Phonology,
	languageId: string,
	prng: () => number,
): NameForm {
	return generateNameForm(phonology, languageId, prng, drawSyllableCount(phonology, prng), null);
}

/**
 * Generates a scholar's personal name, at whatever length this language favours.
 *
 * ⚠️ Scholars get a single name, not a forename/surname pair. Naming conventions are a *cultural*
 * institution — patronymics, clan names, house names and mononyms are all attested, and which one a
 * culture uses is a design question doc 07 has not ruled. Minting a Western two-part convention here
 * would encode an answer to a question nobody has asked, so this generates the one part that every
 * naming convention has and leaves the rest to whoever rules it.
 */
export function generateScholarName(
	phonology: Phonology,
	languageId: string,
	prng: () => number,
	coinedPhaseId: string | null = null,
): NameForm {
	return generateNameForm(
		phonology,
		languageId,
		prng,
		drawSyllableCount(phonology, prng),
		coinedPhaseId,
	);
}

/**
 * Renders a name to display text: graphemes concatenated, first letter capitalised.
 *
 * ⚠️ **Currently identity with respect to time.** The eventual sound-change engine makes this
 * function take the phase to render *at* and walk changes forward from `NameForm.coinedPhaseId`, so
 * a name coined early appears drifted in a late document. Until then every phase renders alike, and
 * `name.coinedPhaseId` goes unread. This is the honesty ledger's "phase-evolved name forms: NOT
 * MODELLED" entry — the storage supports it, the renderer does not do it yet.
 */
/**
 * Renders a name with its syllable boundaries marked — `Popo` becomes `po • po` — reading the
 * boundaries the generator recorded rather than reconstructing them.
 *
 * ⚠️ Prefer this to `renderSyllabified` (`syllable.ts`) wherever a `NameForm` is in hand. That
 * function derives boundaries from segments alone and is the right tool when there is no `NameForm`
 * (or, later, when drift has invalidated one); this one is exact, because the generator knew where
 * the syllables fell and wrote it down.
 *
 * Falls back to derivation if the stored counts do not sum to the segment list, which is what a
 * drift pass rewriting `segments` without recomputing `syllables` would leave behind.
 */
export function renderNameSyllabified(name: NameForm, separator = ' • '): string {
	const total = name.syllables.reduce((sum, count) => sum + count, 0);

	if (total !== name.segments.length) {
		return renderSyllabified(name.segments, separator);
	}

	const parts: string[] = [];
	let position = 0;

	for (const count of name.syllables) {
		parts.push(
			name.segments
				.slice(position, position + count)
				.map((id) => PHONES_BY_ID.get(id)?.grapheme ?? id)
				.join(''),
		);
		position += count;
	}

	return parts.join(separator);
}

export function renderName(name: NameForm): string {
	const text = name.segments
		.map((id) => PHONES_BY_ID.get(id)?.grapheme ?? id)
		.join('');

	if (text.length === 0) {
		return text;
	}

	return text.charAt(0).toUpperCase() + text.slice(1);
}
