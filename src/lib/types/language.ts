/**
 * Language and phonology type definitions (roadmap 2GN.66, spike
 * `docs/spikes/2GN.66-naming-grammars.md`).
 *
 * Every proper noun in the world — site, culture, scholar — is a sequence of phonemes drawn from
 * some language's inventory, not a string picked from a list. This module describes the phoneme
 * vocabulary, the shape of a language's sound system, and the forest of language families cultures
 * are distributed across. Generation itself lives in `engine/world/phonology.ts` and
 * `engine/world/naming.ts`; this module is data shapes only, no behaviour.
 *
 * Doc 08 §232 specifies only a `data/names/` directory comment. The design was ruled in the spike
 * above, borrowing its model from `the-tongue` (a diachronic language engine in a sibling repo);
 * the spike's Prior-art table records what was adopted and why.
 *
 * Visibility (doc 05 §1.1): a language's `Phonology` is **occluded** — the player never reads an
 * inventory, and must infer relatedness from the names themselves, which is the point. Rendered
 * name text is **observable**.
 *
 * ⚠️ Sound change is not modelled by 2GN.66. `LanguageFamily` edges are real and populated, but
 * sister languages within a family currently share a phonology exactly rather than diverging from
 * it. See the spike's honesty ledger before reading relatedness into generated output.
 */

/**
 * Whether a phone is a consonant or a vowel. The two carry disjoint feature sets — a consonant has
 * place/manner/voice, a vowel has height/backness/rounding — so this tag selects which half of
 * `Phone` is populated.
 */
export type PhoneType = 'consonant' | 'vowel';

/**
 * Where in the vocal tract a consonant is articulated, front to back. Ordered as articulatory
 * position, so adjacency in this tuple is adjacency in the mouth — a property sound-change rules
 * will want when they land (assimilation moves a phone to a *neighbouring* place, not a random one).
 */
export const PLACE_VALUES = [
	'bilabial',
	'labiodental',
	'dental',
	'alveolar',
	'postalveolar',
	'retroflex',
	'palatal',
	'velar',
	'uvular',
	'pharyngeal',
	'glottal',
] as const;

/** Consonant place of articulation, derived from `PLACE_VALUES`. */
export type Place = typeof PLACE_VALUES[number];

/**
 * How the airstream is obstructed. Ordered by decreasing obstruction, which is also increasing
 * sonority, so a phone's index in this tuple is its sonority rank.
 *
 * `trill` sits between `liquid` and `glide` as a manner of its own rather than being folded into
 * `liquid`. That is not phonetic pedantry: it is what keeps `/l/` and `/r/` distinguishable by
 * features alone. `the-tongue` gave both `{alveolar, liquid, voiced}` and paid for it with a silent
 * substitution bug when rules resolved phones by feature. See `Phone`'s individuation note.
 */
export const MANNER_VALUES = [
	'stop',
	'affricate',
	'fricative',
	'nasal',
	'lateral-fricative',
	'lateral',
	'trill',
	'tap',
	'approximant',
] as const;

/** Consonant manner of articulation, derived from `MANNER_VALUES`. */
export type Manner = typeof MANNER_VALUES[number];

/** Vowel height (tongue position, close to open). */
export const HEIGHT_VALUES = ['high', 'near-high', 'mid-high', 'mid', 'mid-low', 'low'] as const;

/** Vowel height, derived from `HEIGHT_VALUES`. */
export type Height = typeof HEIGHT_VALUES[number];

/**
 * Vowel backness. Tri-valued rather than a `back: boolean`, per `the-tongue`'s `1eng-24` ruling: a
 * boolean cannot express the central vowels, and code written as `!phone.back` silently misreads
 * every string as truthy once the field widens. Better to start where that migration ended.
 */
export const BACKNESS_VALUES = ['front', 'central', 'back'] as const;

/** Vowel backness, derived from `BACKNESS_VALUES`. */
export type Backness = typeof BACKNESS_VALUES[number];

/**
 * One phoneme: a stable id, its written form, and the articulatory features that define it.
 *
 * ⚠️ **Every phone in `PHONE_TABLE` must be individuated in the feature space.** `the-tongue` shipped
 * `/l/` and `/r/` both as `{alveolar, liquid, voiced}`, which meant resolving an unchanged `/r/` from
 * its own features returned `/l/` — a silent substitution that needed a special case to work around.
 * `phonology.test.ts` pins the no-duplicate-feature-bundle invariant so the same trap cannot open
 * here once sound-change rules start resolving phones by feature.
 *
 * `id` is the internal key and `grapheme` the display form; they differ only where a phoneme is
 * written with something other than its id (see `PHONE_TABLE`'s digraph note).
 */
export interface Phone {
	/** Stable phoneme id, used in `NameForm.segments` and as the `PHONES_BY_ID` key. */
	id: string;

	/** How this phoneme is written when a name is rendered. */
	grapheme: string;

	/** Which feature set this phone carries. */
	type: PhoneType;

	/** Place of articulation. Consonants only. */
	place?: Place;

	/** Manner of articulation. Consonants only. */
	manner?: Manner;

	/** Whether the vocal folds vibrate. Consonants only. */
	voiced?: boolean;

	/** Tongue height. Monophthong vowels only — a diphthong has no single height. */
	height?: Height;

	/** Tongue backness. Monophthong vowels only. */
	backness?: Backness;

	/** Whether the lips round. Monophthong vowels only. */
	rounded?: boolean;

	/**
	 * Whether the vowel is long. A modifier on the base vowel rather than a separate phone identity,
	 * so a rule that lengthens or shortens is a single feature change.
	 */
	long?: boolean;

	/**
	 * Whether the vowel is a diphthong. Structurally distinct rather than a feature combination: a
	 * diphthong glides between two positions and so has no single `height`/`backness`/`rounded`, and
	 * those fields are left undefined. Matching is by `nucleus`/`offglide` instead.
	 *
	 * This is `the-tongue`'s shape, adopted because it survived contact with a real sound-change
	 * engine — modelling a diphthong as a vowel-plus-glide sequence instead leaves erosion rules
	 * unable to grip it as one unit.
	 */
	diphthong?: boolean;

	/** The starting vowel id of a diphthong. Diphthongs only. */
	nucleus?: string;

	/** The vowel id a diphthong glides towards. Diphthongs only. */
	offglide?: string;
}

/**
 * A syllable template: which slots a syllable of this language may fill.
 *
 * Four shapes rather than a full phonotactic grammar — an abstraction, flagged as such in the
 * spike's honesty ledger. `the-tongue` uses the same four and its `1eng-25` spike measured the
 * richer alternative (template-driven parsing) agreeing with the simple one on 2016 of 2016 words,
 * so the extra machinery bought nothing observable.
 */
export interface SyllableTemplate {
	/** Whether a syllable must open with a consonant, or may begin with its vowel. */
	onset: 'required' | 'optional';

	/** Whether a syllable may close with a consonant. */
	coda: 'none' | 'optional';

	/** Whether an onset may hold two consonants. */
	clusters: boolean;

	/** Human-readable shape, e.g. `'CV(C)'`. Display and debugging only. */
	label: string;
}

/**
 * A language's sound system: which phonemes it uses and how it may arrange them.
 *
 * The consonant and vowel lists are **ordered by markedness, commonest first**, and that order is
 * load-bearing: `pickRanked` (`engine/prng.ts`) draws against it with a geometric dropoff, so
 * position 0 is selected far more often than position 7. Shuffling these lists changes how the
 * language sounds, not merely which phonemes are available.
 *
 * ⚠️ Occluded, and **a genesis record once sound change lands**. `the-tongue` shipped a real bug
 * here: it rendered the genesis inventory as a branch's standing description, which was wrong by
 * ~9 phonemes by turn 120. Its `1eng-23` census (100% of branches lost ≥1 genesis phoneme) is why
 * a language's *current* inventory must be derived from its words rather than read from this field
 * once phonologies start drifting.
 */
export interface Phonology {
	/** Consonant phoneme ids, markedness-ordered. */
	consonants: readonly string[];

	/** Vowel phoneme ids, markedness-ordered. */
	vowels: readonly string[];

	/** The syllable shape this language admits. */
	template: SyllableTemplate;

	/**
	 * How long a name in this language tends to be, as a weight per syllable count, indexed from
	 * `MINIMUM_NAME_SYLLABLES`. `[3, 6, 1]` means two syllables are the norm, one is common and three
	 * is rare.
	 *
	 * A property of the language rather than a constant, so "how long are words here?" has a
	 * different answer per language — before this existed, every language in every world drew 2 or 3
	 * syllables on the same coin flip, which made word length the one axis on which no two languages
	 * could differ.
	 */
	syllableWeights: readonly number[];
}

/**
 * One language: a phonology, and its place in the forest.
 *
 * A language belongs to exactly one `LanguageFamily`. A family with a single member is an isolate —
 * not a special case in the type, just a family of one.
 */
export interface Language {
	/** Stable language id, referenced by `Culture.languageId` and `NameForm.languageId`. */
	id: string;

	/** The id of the family this language belongs to. */
	familyId: string;

	/** This language's sound system. */
	phonology: Phonology;
}

/**
 * A group of languages descended from a common ancestor — or, where it holds one member, an isolate.
 *
 * ⚠️ **Descent is declared here, not modelled.** Every member of a family currently shares the
 * family's proto-phonology *identically*; no sound change has diverged them. The edges exist so the
 * eventual sound-change task populates rather than introduces them. Reading sibling names today and
 * concluding the languages are "related but distinct" would be reading a feature that is not built.
 */
export interface LanguageFamily {
	/** Stable family id, referenced by `Language.familyId`. */
	id: string;

	/**
	 * The phonology the family's members descend from. Until sound change lands every member's
	 * `phonology` is this value; afterwards it is the root each member's history diverges from.
	 */
	protoPhonology: Phonology;

	/** Ids of the languages in this family, in generation order. */
	languageIds: readonly string[];
}

/**
 * The world's complete set of languages, grouped into families (roadmap 2GN.66).
 *
 * A forest, deliberately, not a single tree: some cultures speak related languages and others share
 * no ancestor at all. One proto-language per world would make every culture related, which is both
 * linguistically false and dramatically flat — and it would cost the later tablet system its most
 * interesting case, since a tablet in a relative of a known language reads very differently from one
 * in an isolate.
 *
 * Visibility: occluded.
 */
export interface LanguageForest {
	/** Every family in the world, in generation order. */
	families: readonly LanguageFamily[];

	/** Every language in the world, keyed by id. */
	languages: ReadonlyMap<string, Language>;
}

/**
 * A proper noun, stored as the phonemes that compose it rather than as display text.
 *
 * ⚠️ **This is a deliberate divergence from `the-tongue`**, which returns display strings from its
 * name generator specifically so branch names do *not* drift under sound change. Here the drift is
 * the point: a site named in an early phase and met in a late-phase document under a changed form is
 * a real interpretive puzzle, and lands on Pillar 1 (error is the engine). Every `-chester` and
 * `-thorpe` in England is this mechanic.
 *
 * `renderName` (`engine/world/naming.ts`) turns this into text. It is currently identity with
 * respect to time — no sound change exists to apply — so `coinedPhaseId` is recorded but not yet
 * read. That field is what a later renderer walks the phase sequence from.
 */
export interface NameForm {
	/** Phoneme ids in order, resolvable against `PHONES_BY_ID`. */
	segments: readonly string[];

	/**
	 * Where the syllable boundaries fell **as the name was built**, each entry giving one syllable's
	 * segment count. `[2, 3]` means the first two segments form one syllable and the next three form
	 * another; the entries always sum to `segments.length`.
	 *
	 * Stored rather than derived because the generator knows the answer exactly and a reconstruction
	 * can only approximate it. `syllabify` (`engine/world/syllable.ts`) recovers boundaries from
	 * segments alone for any caller that lacks this — it exists for the drift case below and as an
	 * independent check on this field — but where this field is present it is the authority.
	 *
	 * ⚠️ **A genesis record, and it goes stale the moment a name drifts.** Sound change alters
	 * segments, and `the-tongue`'s `1eng-25` census measured 29% of word-changing operations altering
	 * syllable count outright — so whichever task builds sound change **must** recompute or drop this
	 * field as it rewrites `segments`, never carry it forward. `naming.test.ts` pins the sum invariant,
	 * which is what makes a stale field fail loudly rather than merely render wrongly.
	 */
	syllables: readonly number[];

	/** The language this name was coined in. */
	languageId: string;

	/**
	 * The `CulturePhase.id` current when the name was coined, or `null` where no phase context
	 * applies (a culture's own name is not coined within one of its phases).
	 *
	 * Unread until sound change lands, at which point it becomes the starting point a renderer
	 * applies changes forward from. Recorded now because it is unrecoverable later.
	 */
	coinedPhaseId: string | null;
}
