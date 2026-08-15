/**
 * The phoneme table: every sound any language in the world can use (roadmap 2GN.66, spike
 * `docs/spikes/2GN.66-naming-grammars.md`).
 *
 * One flat global table, not a per-language inventory. A language's inventory is a *subset* of this
 * table, chosen at phonology generation (`engine/world/phonology.ts`); this module is the universe
 * those subsets are drawn from. Static data only, no behaviour.
 *
 * **Breadth is deliberate, and constraint does not live here.** An earlier draft kept the table
 * small so that no language could produce an unpronounceable name. That is the wrong lever: it
 * deprives every future language of raw material to prevent a failure that belongs to *combination*,
 * not to vocabulary. The rule adopted instead — give the engine a wide corpus, then write rulesets
 * that make un-useful combinations unreachable — puts the constraint in two places that can express
 * it properly:
 *
 * 1. **Inventory coherence** (`engine/world/phonology.ts`) — a language takes a structured subset,
 *    not a random one. Attested inventories have implicational structure: a language with `/pʰ/`
 *    almost certainly has `/p/`, voiced obstruents come as a series rather than singly, and a
 *    uvular series presupposes a velar one. Those are co-occurrence rules over this table.
 * 2. **Phonotactics** (`SyllableTemplate` plus cluster rules) — which *sequences* may appear. This
 *    is what rejects `qhn-` regardless of the inventory containing all three phonemes.
 *
 * So a language here can genuinely sound alien; what it cannot do is emit sequences no language
 * would tolerate.
 *
 * ⚠️ **Every phone is individuated in the feature space**, and `phones.test.ts` pins it. `the-tongue`
 * shipped `/l/` and `/r/` with identical feature bundles (`alveolar, liquid, voiced`), so resolving
 * an unchanged `/r/` by its own features returned `/l/` — a silent substitution needing a special
 * case to work around. The `lateral`/`trill`/`tap`/`approximant` manner split exists to keep that
 * trap shut, since sound-change rules will resolve phones by feature.
 *
 * Graphemes are romanisations, not IPA: `PHONE_TABLE` ids stay readable (`kh`, `ny`, `ee`) so the
 * data is legible without a phonetics reference, and `renderName` concatenates graphemes rather than
 * ids, so a digraph costs one segment and renders as two letters.
 */

import type { Phone } from '../../types/language.ts';

/** Builds a consonant, filling the consonant half of `Phone` and leaving the vowel half undefined. */
function consonant(
	id: string,
	place: Phone['place'],
	manner: Phone['manner'],
	voiced: boolean,
	grapheme: string = id,
): Phone {
	return { id, grapheme, type: 'consonant', place, manner, voiced };
}

/** Builds a monophthong, filling the vowel half of `Phone` and leaving the consonant half undefined. */
function vowel(
	id: string,
	height: Phone['height'],
	backness: Phone['backness'],
	rounded: boolean,
	grapheme: string = id,
): Phone {
	return { id, grapheme, type: 'vowel', height, backness, rounded };
}

/**
 * Builds the long counterpart of a monophthong: the same features plus `long`, so a lengthening rule
 * is a single feature change rather than a lookup into a parallel table.
 *
 * ⚠️ The grapheme is NFC-normalised so the macron is a single precomposed code point (`ā`, U+0101)
 * rather than a base letter followed by a combining mark. The two render identically and compare
 * unequal, and the decomposed form is two code units wide where the composed form is one — so
 * anything measuring a rendered name by string length miscounts every long vowel. The dev samplers
 * pad name columns that way, and drifted whenever one appeared.
 */
function longVowel(base: Phone, id: string, grapheme: string): Phone {
	return { ...base, id, grapheme: grapheme.normalize('NFC'), long: true };
}

/**
 * Builds a diphthong. Carries no `height`/`backness`/`rounded` — a glide between two positions has
 * no single value for any of them — and is matched on `nucleus`/`offglide` instead.
 */
function diphthong(id: string, nucleus: string, offglide: string, grapheme: string = id): Phone {
	return { id, grapheme, type: 'vowel', diphthong: true, nucleus, offglide };
}

const SHORT_VOWELS: readonly Phone[] = [
	vowel('a', 'low', 'central', false),
	vowel('e', 'mid', 'front', false),
	vowel('i', 'high', 'front', false),
	vowel('o', 'mid', 'back', true),
	vowel('u', 'high', 'back', true),
	// Beyond the five-vowel core: the commonest additions across attested systems.
	vowel('ae', 'mid-low', 'front', false, 'ä'),
	vowel('oe', 'mid', 'front', true, 'ö'),
	vowel('ue', 'high', 'front', true, 'ü'),
	// ⚠️ Grapheme `ÿ`, not `y`: the palatal approximant below already writes as `y`, and two phonemes
	// sharing one letter makes rendered names unreadable — `Nuya` gives a reader no way to tell which
	// `y` it holds. Caught by the sample script, which is what a rendering defect needs to surface.
	vowel('y', 'high', 'central', false, 'ÿ'),
	vowel('au', 'mid-low', 'back', false, 'å'),
	vowel('uh', 'mid', 'central', false, 'ə'),
];

/**
 * Every phoneme available to any language.
 *
 * Nineteen places × manners of consonant articulation and a vowel system reaching well past the
 * five-vowel core, plus length and diphthongs. No language uses all of it; `generatePhonology`
 * carves each language a coherent subset.
 */
export const PHONE_TABLE: readonly Phone[] = [
	// ---- Stops. Voiceless/voiced series plus aspirates and ejectives at the common places. ----
	consonant('p', 'bilabial', 'stop', false),
	consonant('b', 'bilabial', 'stop', true),
	consonant('t', 'alveolar', 'stop', false),
	consonant('d', 'alveolar', 'stop', true),
	consonant('k', 'velar', 'stop', false),
	consonant('g', 'velar', 'stop', true),
	consonant('q', 'uvular', 'stop', false),
	consonant('c', 'palatal', 'stop', false, 'ky'),
	consonant('rt', 'retroflex', 'stop', false, 'ṭ'),
	consonant('rd', 'retroflex', 'stop', true, 'ḍ'),
	consonant('x', 'glottal', 'stop', false, "'"),

	// ---- Affricates. ----
	consonant('ts', 'alveolar', 'affricate', false),
	consonant('dz', 'alveolar', 'affricate', true),
	consonant('ch', 'postalveolar', 'affricate', false),
	consonant('j', 'postalveolar', 'affricate', true),

	// ---- Fricatives. The widest series: this is where languages diverge most audibly. ----
	consonant('f', 'labiodental', 'fricative', false),
	consonant('v', 'labiodental', 'fricative', true),
	consonant('th', 'dental', 'fricative', false, 'th'),
	consonant('dh', 'dental', 'fricative', true, 'dh'),
	consonant('s', 'alveolar', 'fricative', false),
	consonant('z', 'alveolar', 'fricative', true),
	consonant('sh', 'postalveolar', 'fricative', false),
	consonant('zh', 'postalveolar', 'fricative', true),
	consonant('rs', 'retroflex', 'fricative', false, 'ṣ'),
	consonant('hy', 'palatal', 'fricative', false, 'ś'),
	consonant('kh', 'velar', 'fricative', false),
	consonant('gh', 'velar', 'fricative', true),
	consonant('qh', 'uvular', 'fricative', false, 'x̂'),
	consonant('hh', 'pharyngeal', 'fricative', false, 'ḥ'),
	consonant('h', 'glottal', 'fricative', false),

	// ---- Nasals. ----
	consonant('m', 'bilabial', 'nasal', true),
	consonant('n', 'alveolar', 'nasal', true),
	consonant('ny', 'palatal', 'nasal', true, 'ñ'),
	consonant('ng', 'velar', 'nasal', true, 'ng'),

	// ---- Laterals, rhotics, approximants. Split by manner to keep each individuated. ----
	consonant('l', 'alveolar', 'lateral', true),
	consonant('ly', 'palatal', 'lateral', true, 'ly'),
	// A lateral fricative, not a plain one: sharing `{alveolar, fricative, voiceless}` with `s` would
	// make the two indistinguishable by feature, which is the individuation trap in the module note.
	consonant('lh', 'alveolar', 'lateral-fricative', false, 'ł'),
	consonant('r', 'alveolar', 'trill', true),
	consonant('rr', 'uvular', 'trill', true, 'ṛ'),
	consonant('dr', 'alveolar', 'tap', true, 'ŕ'),
	consonant('w', 'bilabial', 'approximant', true),
	consonant('yy', 'palatal', 'approximant', true, 'y'),

	// ---- Vowels: short, long, diphthongs. ----
	...SHORT_VOWELS,
	...SHORT_VOWELS.slice(0, 5).map((base) =>
		longVowel(base, `${base.id}${base.id}`, `${base.grapheme}̄`)
	),
	diphthong('ai', 'a', 'i'),
	diphthong('ei', 'e', 'i'),
	diphthong('oi', 'o', 'i'),
	diphthong('aw', 'a', 'u', 'au'),
	diphthong('ow', 'o', 'u', 'ou'),
	diphthong('ia', 'i', 'a'),
	diphthong('ua', 'u', 'a'),
];

/** Every phoneme keyed by id, for rendering and feature lookup. */
export const PHONES_BY_ID: ReadonlyMap<string, Phone> = new Map(
	PHONE_TABLE.map((phone) => [phone.id, phone]),
);

/**
 * Consonant ids in **markedness order, commonest first** — the order `pickRanked` draws against, and
 * the order `generatePhonology` walks when building an inventory.
 *
 * Load-bearing twice over: it decides which consonants a language is likely to have *and* how often
 * it uses the ones it has. It follows the broad cross-linguistic frequency picture (`p t k m n s l`
 * are near-universal; pharyngeals, uvulars and retroflexes are markedly rare), not a measured
 * corpus — an authored prior, expected to be tuned once generated names are visible in the Explorer.
 *
 * ⚠️ Built as an explicit list rather than derived from `PHONE_TABLE`'s order so the two can be
 * reordered independently: `PHONE_TABLE` groups by manner for readability, which is not a frequency
 * ordering. `the-tongue` hit exactly this — its inventory was built in push order, so the tail was
 * whichever probability gate happened to pass first, and `pickRanked` drew against noise.
 */
export const CONSONANT_RANK: readonly string[] = [
	// Near-universal core.
	'n',
	't',
	'k',
	'm',
	's',
	'p',
	'l',
	'r',
	// Common.
	'h',
	'd',
	'b',
	'g',
	'w',
	'yy',
	'ng',
	'f',
	'sh',
	'ch',
	'ny',
	'j',
	'v',
	'z',
	// Less common.
	'th',
	'kh',
	'ts',
	'dh',
	'gh',
	'zh',
	'x',
	'dr',
	'q',
	'dz',
	// Marked.
	'c',
	'ly',
	'rt',
	'rd',
	'rs',
	'hy',
	'lh',
	'rr',
	'qh',
	'hh',
];

/**
 * Vowel ids in markedness order. `a i u` form the minimal three-vowel system every language draws
 * from, `e o` are the commonest additions, and the front-rounded, central and long series follow.
 * Diphthongs rank last: a language admits them only if `generatePhonology` rolls for them.
 */
export const VOWEL_RANK: readonly string[] = [
	'a',
	'i',
	'u',
	'e',
	'o',
	'uh',
	'ae',
	'y',
	'au',
	'oe',
	'ue',
	'aa',
	'ii',
	'uu',
	'ee',
	'oo',
	'ai',
	'aw',
	'ei',
	'ow',
	'oi',
	'ia',
	'ua',
];
