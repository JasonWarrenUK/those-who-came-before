/**
 * Phonology generation (roadmap 2GN.66, spike `docs/spikes/2GN.66-naming-grammars.md`).
 *
 * Carves each language a coherent inventory out of `PHONE_TABLE` and gives it a syllable shape. Pure
 * engine code: seeded PRNG in, data out, no framework or browser dependency (doc 08 §2.1).
 *
 * The generator's whole job is to be **structured rather than uniform**. Rolling a random subset of
 * 65 phonemes produces something no language would be; three mechanisms prevent that:
 *
 * 1. **A universal core**, seeded unconditionally, so no inventory comes out unusable.
 * 2. **Rank-ordered probability gates** — a phoneme's chance of admission falls with its markedness
 *    rank, so `/n/` is near-certain and `/qh/` is rare.
 * 3. **Coherence closure** (`data/names/coherence.ts`) — every admitted phoneme drags its
 *    prerequisites in with it, so a language with `/zh/` necessarily has `/sh/`.
 *
 * ⚠️ The resulting `Phonology` is a **genesis record**. Once sound change lands, a language's current
 * inventory must be derived from its words rather than read from this value — `the-tongue`'s
 * `1eng-23` census found 100% of branches lost at least one genesis phoneme, and it shipped a real
 * bug rendering the genesis inventory as a branch's standing description.
 */

import type {
	Language,
	LanguageFamily,
	LanguageForest,
	Phonology,
	SyllableTemplate,
} from '../../types/language.ts';
import { CONSONANT_RANK, PHONES_BY_ID, VOWEL_RANK } from '../../data/names/phones.ts';
import { PHONEME_PREREQUISITES, UNIVERSAL_CORE } from '../../data/names/coherence.ts';

/**
 * Admission probability for a phoneme at a given rank, falling geometrically from the front of the
 * list. Rank 0 is admitted at `BASE`, and each subsequent rank multiplies by `DECAY`.
 *
 * `0.94 × 0.93^rank` puts the near-universal core above 80%, the common tier around 40–60%, and the
 * marked tail in single digits — which is roughly the shape of attested inventory sizes (most
 * languages sit between 20 and 37 phonemes). Authored priors, not measured; `phonology.test.ts`
 * pins the resulting size distribution so retuning these has to confront what it changes.
 */
const ADMISSION_BASE = 0.94;

/** Per-rank decay on admission probability. See `ADMISSION_BASE`. */
const ADMISSION_DECAY = 0.93;

/** Vowel admission decays more slowly: vowel systems are smaller but denser at the common end. */
const VOWEL_ADMISSION_BASE = 0.95;

/** Per-rank decay on vowel admission. See `VOWEL_ADMISSION_BASE`. */
const VOWEL_ADMISSION_DECAY = 0.82;

/**
 * Expands an inventory to satisfy every prerequisite in `PHONEME_PREREQUISITES`, iterating to a
 * fixed point so transitive chains (`zh → sh`, `qh → kh → k`) resolve without being listed
 * transitively.
 *
 * Only ever *adds*. Dropping a phoneme whose prerequisite was missing would be the other way to
 * satisfy the rules, and it is the wrong one: it would silently discard the marked, interesting
 * sounds — precisely the ones the wide table exists to make reachable — every time a common one
 * failed its roll.
 *
 * Termination: `PHONEME_PREREQUISITES` is acyclic (pinned by `coherence.test.ts`) and the inventory
 * is bounded by `PHONE_TABLE`, so the fixed point is always reached.
 */
export function enforceCoherence(inventory: Iterable<string>): Set<string> {
	const closed = new Set(inventory);

	let changed = true;
	while (changed) {
		changed = false;
		for (const id of [...closed]) {
			for (const prerequisite of PHONEME_PREREQUISITES.get(id) ?? []) {
				if (!closed.has(prerequisite)) {
					closed.add(prerequisite);
					changed = true;
				}
			}
		}
	}

	return closed;
}

/**
 * Draws an inventory from a markedness-ordered rank list by walking it and rolling each candidate
 * against a rank-decaying probability.
 *
 * Walks the whole list — one `prng()` draw per rank, always — rather than short-circuiting once
 * enough phonemes are admitted. A variable draw count would make every downstream value depend on
 * how many phonemes happened to be admitted, breaking determinism across changes to this function's
 * tuning.
 */
function drawFromRank(
	rank: readonly string[],
	prng: () => number,
	base: number,
	decay: number,
): string[] {
	return rank.filter((_id, index) => prng() < base * decay ** index);
}

/**
 * Rolls a syllable template. The four shapes are `the-tongue`'s, whose `1eng-25` spike measured a
 * richer template-driven parse agreeing with the simple one on 2016 of 2016 words.
 *
 * Weighted towards the simpler shapes: CV and CV(C) between them cover a majority of the world's
 * languages, and cluster-admitting phonotactics are the minority case.
 */
export function generateSyllableTemplate(prng: () => number): SyllableTemplate {
	const roll = prng();

	if (roll < 0.3) {
		return { onset: 'required', coda: 'none', clusters: false, label: 'CV' };
	}
	if (roll < 0.55) {
		return { onset: 'required', coda: 'optional', clusters: false, label: 'CV(C)' };
	}
	if (roll < 0.8) {
		return { onset: 'optional', coda: 'optional', clusters: false, label: '(C)V(C)' };
	}
	return { onset: 'optional', coda: 'optional', clusters: true, label: '(C)(C)V(C)' };
}

/**
 * How far a language may reorder its inventory away from the universal markedness rank, as a
 * fraction of the list length. Each phoneme's sort key is its rank index plus a jitter drawn from
 * `±JITTER × length`, so a phoneme can move a few places but rarely from one end to the other.
 *
 * ⚠️ **This exists to stop every language sounding alike, and the defect it fixes was measured.**
 * With a shared rank, `pickRanked`'s dropoff applies the *same* frequency law to every language:
 * `/n/` opened 28.4% of all names and `/n t k/` opened 62% of them, across every language in the
 * world. Languages differed in which phonemes they had, never in which they preferred — so they
 * differed in inventory and not in character. Per-language reordering makes the *preference* a
 * property of the language, which is what a distinct-sounding language actually is.
 *
 * Jitter rather than a free shuffle because markedness is still real: a language may favour `/sh/`
 * unusually, but a world where `/qh/` is as likely as `/t/` to be somebody's commonest consonant is
 * not a world of plausible languages.
 */
const RANK_JITTER = 1.2;

/**
 * Compression applied to a phoneme's baseline rank before jitter. `sqrt(index) × 2.5` keeps the
 * near-universal head of the list clearly ahead while narrowing the gaps down the tail, so jitter
 * can actually reorder the marked end instead of being swamped by a linear gradient.
 *
 * Measured against the alternatives at `RANK_JITTER = 1.2`, counting how many distinct phonemes are
 * ever some language's commonest initial (out of 42 consonants):
 *
 * | Baseline          | Distinct favourites | Commonest favourite |
 * | ----------------- | ------------------: | ------------------: |
 * | linear            |                  22 |         `/n/` at 23% |
 * | `sqrt × 2.5`      |              **36** |    `/n/` at **22%** |
 * | `log(i+1) × 3`    |                  36 |         `/n/` at 21% |
 *
 * `sqrt` and `log` measured alike; `sqrt` is kept as the simpler curve.
 */
function compressRank(index: number): number {
	return Math.sqrt(index) * 2.5;
}

/**
 * Reorders an inventory into this language's own frequency ordering: the universal rank, compressed
 * (`compressRank`) and perturbed by a bounded per-phoneme jitter. See `RANK_JITTER` for the defect
 * this fixes and why a shared ordering is not enough.
 *
 * Draws exactly one `prng()` per item, before sorting, so the draw count depends only on inventory
 * size and never on the comparison order the sort happens to take. Sorting on a precomputed key
 * rather than calling `prng()` inside the comparator matters for determinism: a comparator with side
 * effects would make the result depend on the sort implementation.
 */
function jitterRank(inventory: readonly string[], prng: () => number): string[] {
	const spread = RANK_JITTER * inventory.length;
	const keyed = inventory.map((id, index) => ({
		id,
		key: compressRank(index) + (prng() * 2 - 1) * spread,
	}));

	return keyed.sort((a, b) => a.key - b.key).map((entry) => entry.id);
}

/** The shortest name any language produces. `Phonology.syllableWeights` is indexed from this. */
export const MINIMUM_NAME_SYLLABLES = 1;

/** The longest name any language produces. Four syllables is already a mouthful for a proper noun. */
export const MAXIMUM_NAME_SYLLABLES = 4;

/**
 * Extra suppression applied to one-syllable names, on top of the distance falloff.
 *
 * ⚠️ Measured, and the reason is visible rather than statistical. Without it, 19.8% of names came out
 * monosyllabic and 15.1% were two segments or shorter — `Ni`, `Nu`, `Yu`, `Ə`. Those do not read as
 * proper nouns, and they contradict the design `naming.ts` states outright: a name is *longer* than
 * an ordinary word, which is part of what marks it as a name.
 *
 * A multiplier rather than a floor of 2, so a genuinely terse language stays reachable — clipped
 * monosyllabic toponyms exist (`Ur`, `Kish`) and should not be impossible, only uncommon.
 */
const MONOSYLLABLE_SUPPRESSION = 0.3;

/**
 * Rolls a language's syllable-length preference: a weight per syllable count from
 * `MINIMUM_NAME_SYLLABLES` to `MAXIMUM_NAME_SYLLABLES`.
 *
 * Each language draws a preferred length and weights the counts around it, so one language runs
 * short where another favours four-syllable names. The 2-and-3 centre is weighted heaviest across
 * languages, since a world where most cultures have one-syllable names reads as terse rather than
 * varied.
 *
 * ⚠️ Weights, not a hard range: every count stays reachable in every language. A language that
 * *never* produced a given length would be a stronger claim than the generator can support.
 */
export function generateSyllableWeights(prng: () => number): number[] {
	const span = MAXIMUM_NAME_SYLLABLES - MINIMUM_NAME_SYLLABLES + 1;

	// Preferred length, biased towards the middle of the range.
	const roll = prng();
	const preferred = roll < 0.1 ? 1 : roll < 0.5 ? 2 : roll < 0.88 ? 3 : 4;

	return Array.from({ length: span }, (_unused, index) => {
		const count = MINIMUM_NAME_SYLLABLES + index;
		const distance = Math.abs(count - preferred);

		// Falls off sharply with distance, with a floor so no length is unreachable.
		const weight = Math.max(0.08, 1 / (1 + distance * distance));

		return count === 1 ? weight * MONOSYLLABLE_SUPPRESSION : weight;
	});
}

/**
 * Generates one language's complete sound system.
 *
 * The returned inventories are ordered **commonest-first for this language**: the universal
 * markedness rank, jittered per language (`jitterRank`). That ordering is what `pickRanked` draws
 * against, so it is not cosmetic — it decides which sounds the language leans on. `the-tongue`
 * shipped a bug here by building its inventory in push order, leaving `pickRanked` drawing against
 * noise; the ordering must be deliberate, whether or not it is universal.
 */
export function generatePhonology(prng: () => number): Phonology {
	const consonantDraw = drawFromRank(CONSONANT_RANK, prng, ADMISSION_BASE, ADMISSION_DECAY);
	const vowelDraw = drawFromRank(VOWEL_RANK, prng, VOWEL_ADMISSION_BASE, VOWEL_ADMISSION_DECAY);

	const admitted = enforceCoherence([...consonantDraw, ...vowelDraw, ...UNIVERSAL_CORE]);

	// Collapse to markedness order first so `jitterRank` perturbs a known baseline rather than
	// admission order, which carries no meaning.
	const consonants = jitterRank(CONSONANT_RANK.filter((id) => admitted.has(id)), prng);
	const vowels = jitterRank(VOWEL_RANK.filter((id) => admitted.has(id)), prng);

	return {
		consonants,
		vowels,
		template: generateSyllableTemplate(prng),
		syllableWeights: generateSyllableWeights(prng),
	};
}

/**
 * Groups `cultureCount` cultures into language families, returning the family size for each family
 * in order.
 *
 * A **forest, not a tree**: some cultures speak related languages and others share no ancestor at
 * all (spike ruling 4). Family sizes are rolled so both outcomes are reachable at any scale.
 *
 * ⚠️ Degenerate at MVP scale, deliberately handled. Doc 05 §362 specifies 2 cultures for MVP, where
 * a forest is either one family of two or two isolates — so family count is derived from culture
 * count rather than fixed, and the function stays sensible at both 2 and the Explorer's 4.
 */
export function partitionIntoFamilies(cultureCount: number, prng: () => number): number[] {
	if (cultureCount <= 0) {
		return [];
	}

	const sizes: number[] = [];
	let remaining = cultureCount;

	while (remaining > 0) {
		if (remaining === 1) {
			sizes.push(1);
			break;
		}

		// Isolates are the common case in a small world; larger families get rarer as they grow.
		// Capped at `remaining` so the partition always sums to `cultureCount` exactly.
		const roll = prng();
		const size = roll < 0.45 ? 1 : roll < 0.85 ? 2 : 3;
		const taken = Math.min(size, remaining);

		sizes.push(taken);
		remaining -= taken;
	}

	return sizes;
}

/**
 * Generates the world's language forest for a given number of cultures, one language per culture.
 *
 * Languages are handed out in order, so culture `i` speaks `forest.languages.get(languageIds[i])`.
 * `assignLanguages` below does that binding.
 *
 * ⚠️ **Sisters are currently identical, not merely related.** Every member of a family shares the
 * family's `protoPhonology` exactly, because no sound change exists to diverge them. The edges are
 * real so the eventual sound-change task populates rather than introduces them; reading sibling
 * output today and concluding the languages are "related but distinct" would be reading a feature
 * that is not built. See the spike's honesty ledger.
 */
export function generateLanguageForest(cultureCount: number, prng: () => number): LanguageForest {
	const sizes = partitionIntoFamilies(cultureCount, prng);
	const families: LanguageFamily[] = [];
	const languages = new Map<string, Language>();

	let languageIndex = 0;
	for (const [familyIndex, size] of sizes.entries()) {
		const familyId = `family-${familyIndex + 1}`;
		const protoPhonology = generatePhonology(prng);
		const languageIds: string[] = [];

		for (let member = 0; member < size; member++) {
			const languageId = `language-${languageIndex + 1}`;
			languageIds.push(languageId);
			languages.set(languageId, { id: languageId, familyId, phonology: protoPhonology });
			languageIndex++;
		}

		families.push({ id: familyId, protoPhonology, languageIds });
	}

	return { families, languages };
}

/**
 * The ids of every language in the forest, in generation order — the order cultures are assigned
 * languages in, so index `i` is culture `i`'s language.
 */
export function forestLanguageIds(forest: LanguageForest): string[] {
	return forest.families.flatMap((family) => [...family.languageIds]);
}

/**
 * Whether two languages descend from the same family. Until sound change lands this is the only
 * signal of relatedness, since sisters are phonologically identical.
 */
export function areRelated(forest: LanguageForest, first: string, second: string): boolean {
	const firstFamily = forest.languages.get(first)?.familyId;
	const secondFamily = forest.languages.get(second)?.familyId;

	return firstFamily !== undefined && firstFamily === secondFamily;
}

/** Resolves a phoneme id to its written form, falling back to the id if the table lacks it. */
export function graphemeOf(phonemeId: string): string {
	return PHONES_BY_ID.get(phonemeId)?.grapheme ?? phonemeId;
}
