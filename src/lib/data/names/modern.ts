/**
 * The curated modern language (roadmap 2GN.130). One pinned `Phonology` shared by every world seed,
 * naming the player's own institutions, venues and colleagues — the language the player reads
 * *through*, not one belonging to any culture the generator invents.
 *
 * Generated, not hand-authored: `generatePhonology(createPrng(MODERN_LANGUAGE_SEED))` is the whole
 * curation mechanism, so this language emanates from the same system as every ancient one and
 * inherits any later sound-change work rather than drifting out of step with it. "Curated" names
 * only that the seed is pinned rather than rolled per world (ruled during the 2GN.66 spike
 * conversation).
 *
 * `MODERN_LANGUAGE_ID` sits deliberately outside `LanguageForest` (`engine/world/phonology.ts`):
 * the forest is per-world-seed and generated, while this language is global and fixed, so a member
 * inside the forest would be a language belonging to no culture. `forest.languages.get
 * (MODERN_LANGUAGE_ID)` is guaranteed to miss for every generated forest, since forest ids are
 * always minted as `family-N`/`language-N` template literals (`generateLanguageForest`) and
 * `'modern'` matches neither shape; `areRelated` and every other forest lookup already degrade
 * correctly (return `false`/`undefined`) for an id the forest has never seen, so no forest-side
 * exclusion logic is needed here.
 *
 * Establishes the diegetic contrast the interpretive frame needs: the player reads ancient names
 * through a modern tongue, and the untranslated-tablet phase later depends on the player's own
 * language being a fixed, known reference point against which unknown ones read as strange.
 *
 * ⚠️ `MODERN_PHONOLOGY` is fixed only relative to `generatePhonology`'s current tuning
 * (`ADMISSION_BASE`, `RANK_JITTER`, `CONSONANT_RANK`, `PHONE_TABLE`, …). `modern.test.ts` pins the
 * exact generated inventory as a recorded snapshot, the same convention
 * `phonology.calibration.test.ts` uses for distribution shape — a retune that moves the player's own
 * language should fail loudly rather than drift silently.
 */

import { createPrng } from '../../engine/prng.ts';
import { generatePhonology } from '../../engine/world/phonology.ts';
import type { Phonology } from '../../types/language.ts';

/** Fixed seed for the modern language. Never rolled per world — see the module header. */
export const MODERN_LANGUAGE_SEED = 'modern-language-v1';

/**
 * Reserved id for the modern language, outside every `LanguageForest`'s `family-N`/`language-N`
 * namespace. Must never be assigned to a culture.
 */
export const MODERN_LANGUAGE_ID = 'modern';

/** The one pinned phonology every world shares for the player's own institutions and colleagues. */
export const MODERN_PHONOLOGY: Phonology = generatePhonology(createPrng(MODERN_LANGUAGE_SEED));
