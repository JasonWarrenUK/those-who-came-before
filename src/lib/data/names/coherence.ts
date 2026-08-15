/**
 * Inventory coherence rules (roadmap 2GN.66, spike `docs/spikes/2GN.66-naming-grammars.md`).
 *
 * `PHONE_TABLE` is deliberately wide, so the constraint that keeps generated languages plausible
 * lives here rather than in the vocabulary. These are the rules that make an *incoherent* subset of
 * that table unreachable: not "this sound is disallowed", but "this sound is not allowed **without**
 * that one".
 *
 * Attested phoneme inventories are not random subsets. They have implicational structure, and the
 * generalisations below are the well-attested ones:
 *
 * - **Marked members imply unmarked ones.** A language with a uvular stop essentially always has a
 *   velar one; a language with `/zh/` has `/sh/`. The reverse does not hold.
 * - **Obstruents pattern as series, not singletons.** A voicing contrast is a property of the whole
 *   stop series far more often than of one member of it.
 * - **Places of articulation come as columns.** A retroflex series appears as a set, not as one
 *   isolated retroflex.
 *
 * These are one-directional prerequisites, deliberately: they say what a phoneme *needs*, never what
 * it forbids. A one-directional rule can be checked by a single pass over a candidate inventory and
 * can never make an inventory unsatisfiable, which is the failure 2GN.87 punished when a
 * bidirectional condition had no satisfying assignment.
 *
 * Static data only, no behaviour. `enforceCoherence` (`engine/world/phonology.ts`) applies these.
 */

import type { Manner } from '../../types/language.ts';

/**
 * Phonemes each phoneme presupposes: if the key is in an inventory, **every** id in its value must
 * be too. Phonemes absent from this map carry no prerequisites.
 *
 * Prerequisites are transitive through repeated application rather than listed transitively —
 * `enforceCoherence` iterates to a fixed point, so `zh → sh → s` need not be flattened here.
 *
 * ⚠️ There must be no cycle among these entries, or the fixed-point iteration cannot terminate with
 * a coherent result. `coherence.test.ts` pins acyclicity and pins that every id named here exists in
 * `PHONE_TABLE`.
 */
export const PHONEME_PREREQUISITES: ReadonlyMap<string, readonly string[]> = new Map([
	// Voiced obstruents presuppose their voiceless counterparts: a voicing contrast is a property of
	// a series, and a language with /b/ but no /p/ is vanishingly rare.
	['b', ['p']],
	['d', ['t']],
	['g', ['k']],
	['v', ['f']],
	['z', ['s']],
	['zh', ['sh']],
	['dh', ['th']],
	['gh', ['kh']],
	['dz', ['ts']],
	['j', ['ch']],
	['rd', ['rt']],

	// Marked places presuppose their unmarked neighbours: a uvular series sits behind a velar one, a
	// pharyngeal behind a glottal.
	['q', ['k']],
	['qh', ['kh', 'q']],
	['rr', ['r']],
	['hh', ['h']],
	['kh', ['k']],

	// Retroflex and palatal series appear as columns rather than as isolated members.
	['rt', ['t']],
	['rs', ['s']],
	['ny', ['n']],
	['ly', ['l']],
	['c', ['k']],
	['hy', ['sh']],

	// Affricates presuppose the fricative they release into.
	['ts', ['s']],
	['ch', ['sh']],

	// Marked laterals and rhotics presuppose the plain ones.
	['lh', ['l']],
	['dr', ['r']],

	// A velar nasal is common, but presupposes the velar series it assimilates within.
	['ng', ['k']],

	// Long vowels and diphthongs presuppose their component qualities.
	['aa', ['a']],
	['ee', ['e']],
	['ii', ['i']],
	['oo', ['o']],
	['uu', ['u']],
	['ai', ['a', 'i']],
	['ei', ['e', 'i']],
	['oi', ['o', 'i']],
	['aw', ['a', 'u']],
	['ow', ['o', 'u']],
	['ia', ['i', 'a']],
	['ua', ['u', 'a']],

	// Front rounded vowels presuppose both the front unrounded and back rounded series they sit
	// between — they are typologically rare and never appear in a minimal vowel system.
	['oe', ['e', 'o']],
	['ue', ['i', 'u']],
	['ae', ['a', 'e']],
]);

/**
 * Phonemes every language has regardless of what else it rolls. `/t/`, `/k/`, `/n/` and `/a/` are as
 * close to linguistic universals as the typology offers, and a floor guarantees no inventory can
 * come out too sparse to build a name from.
 *
 * The floor is intentionally tiny. Its job is to make the generator's output *well-formed*, not to
 * make every language sound alike — everything above this is rolled.
 */
export const UNIVERSAL_CORE: readonly string[] = ['t', 'k', 'n', 'a', 'i', 'u'];

/**
 * The smallest vowel system any language may have: `/a i u/`, the minimal three-vowel triangle.
 *
 * Included in `UNIVERSAL_CORE` above rather than left to the roll because the alternative is
 * measurably bad. Before this rule, 5.3% of generated languages had no high vowel at all and the
 * minimum vowel count was 1 — systems no attested language matches. The three-vowel triangle is the
 * genuine typological floor: languages with fewer are contested even as analyses, never as surface
 * inventories.
 *
 * This is a **coherence** constraint, not a vocabulary one — it does not narrow what a language may
 * have, only what it may lack. A language can still roll a rich eleven-vowel system on top.
 */
export const MINIMAL_VOWEL_SYSTEM: readonly string[] = ['a', 'i', 'u'];

/**
 * Consonant clusters admissible in an onset, as `[first, second]` manner pairs.
 *
 * Phonotactics, not inventory: this is the layer that rejects `qhn-` even in a language holding
 * every one of those phonemes. Encoded over *manners* rather than phoneme ids so the rule stays a
 * dozen entries rather than hundreds of pairs, and so it keeps applying as the table grows.
 *
 * The generalisation is the sonority sequencing principle: an onset cluster must rise in sonority
 * towards the vowel. `MANNER_VALUES` is ordered by increasing sonority, so an admissible pair is one
 * whose indices increase — plus the attested `/s/`-initial exceptions, which every phonology
 * textbook notes violate sonority and which English shows in `stop`, `speak`, `skill`.
 */
export const ONSET_CLUSTER_MANNERS: readonly (readonly [Manner, Manner])[] = [
	['stop', 'lateral'],
	['stop', 'trill'],
	['stop', 'tap'],
	['stop', 'approximant'],
	['fricative', 'lateral'],
	['fricative', 'trill'],
	['fricative', 'tap'],
	['fricative', 'approximant'],
	['nasal', 'approximant'],
	// Sonority-violating but well attested: /s/ + stop and /s/ + nasal, as in `stop`, `speak`,
	// `skill`, `smoke`, `snow`. Called out because they are the deliberate exceptions to the rising
	// rule above, not oversights — `coherence.test.ts` pins that these are the only two.
	['fricative', 'stop'],
	['fricative', 'nasal'],
];

/**
 * The largest run of consecutive consonants a generated name may contain.
 *
 * `ONSET_CLUSTER_MANNERS` governs clusters *within* an onset, which leaves the seam between
 * syllables ungoverned: a coda followed by a cluster onset stacks three or more consonants that no
 * rule ever inspected. Measured before this constraint, 0.4% of names carried a run of three or more
 * — `Nafdoththti`, `Ñangshngångru`, `Satutkhpu`.
 *
 * Two is the limit because it is what the onset rules already admit; a third consonant only ever
 * arrives by the juncture accident this exists to catch.
 */
export const MAX_CONSONANT_RUN = 2;

/**
 * Whether a coda consonant may be followed directly by an identical onset consonant.
 *
 * `false`, because the result reads as a typo rather than as a name: `Kakklo`, `Nunnu`. Measured at
 * 5.3% of names before the constraint. Real languages do have geminates, but they contrast
 * *phonemically* with their singletons — a distinction this engine does not model, so a doubled
 * consonant here carries no meaning and only costs legibility.
 */
export const ALLOW_IDENTICAL_JUNCTURE = false;

/**
 * Whether two identical vowels may sit adjacent — `Naa`, `Fii`, `Tiiknə`.
 *
 * `false`, for the same reason as `ALLOW_IDENTICAL_JUNCTURE`: the result reads as a typo rather than
 * a name. Measured at 1.4% of names before the constraint.
 *
 * ⚠️ Scoped to *identical* vowels only. Vowel hiatus in general (6.5% of names) is left alone: it is
 * ordinary in a `(C)V(C)` language whose syllables may open with a vowel, and `Nia`, `Teo` and `Ruä`
 * all read fine. Only the doubled case is the problem, and the table already carries true long
 * vowels (`ā ē ī ō ū`) as distinct phonemes for a language that genuinely wants length.
 */
export const ALLOW_IDENTICAL_VOWEL_HIATUS = false;
