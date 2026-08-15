/**
 * Placeholder interpretive-register templates (roadmap 2GN.36, rescoped 2026-08-15).
 *
 * These are deliberately fake — every `template` string is a visible placeholder, not real
 * interpretive prose. The reason: `DescriptionVariant.emphasis` (`ArtefactTag[]`) exists to let the
 * lens select framing variants that align with a player's beliefs (doc 04 §3.4), but no scoring
 * mechanism for that selection existed anywhere in docs or roadmap when this task was first
 * scoped for real authoring — confirmed by exhaustive search 2026-08-15. Authoring real competing
 * framings (weapon vs ceremonial, per doc 04 §3.4's own worked example) without that formula would
 * mean guessing at a contract nothing has settled yet.
 *
 * This module exists solely so `2GN.38` (`generateDescription`) has real `DescriptionTemplate`
 * objects to assemble against — one property id, one variant, done. Real content — considered
 * emphasis choices, competing variants, `VariantCondition` material gates, the doc 05 §13.1
 * relative-tag constraint — is `6LS.18`'s job, once `2GN.131` (the matching formula) and `6LS.5`
 * (live `LensState`) both exist to author against. `6LS.18` supersedes this module wholesale; do
 * not extend this placeholder set with real prose in the meantime.
 *
 * Structural conventions (id shape, slot syntax) mirror `descriptions/observational/index.ts`
 * exactly, so this directory drops into the same assembly path with no special-casing.
 */

import type { DescriptionTemplate } from '../../../types/description.ts';
import { ELONGATED_TEMPLATES } from './elongated.ts';
import { CYLINDRICAL_TEMPLATES } from './cylindrical.ts';
import { FLAT_BROAD_TEMPLATES } from './flat-broad.ts';
import { HOLLOW_ENCLOSED_TEMPLATES } from './hollow-enclosed.ts';
import { RING_FORM_TEMPLATES } from './ring-form.ts';
import { DISC_FORM_TEMPLATES } from './disc-form.ts';
import { BAR_FORM_TEMPLATES } from './bar-form.ts';
import { SHEET_FORM_TEMPLATES } from './sheet-form.ts';
import { DECORATION_TEMPLATES } from './decoration.ts';

/**
 * The complete placeholder interpretive register: every structural primitive's parameters plus
 * every decorative technique, flattened into one list keyed by `property` id.
 */
export const INTERPRETIVE_TEMPLATES: readonly DescriptionTemplate[] = [
	...ELONGATED_TEMPLATES,
	...CYLINDRICAL_TEMPLATES,
	...FLAT_BROAD_TEMPLATES,
	...HOLLOW_ENCLOSED_TEMPLATES,
	...RING_FORM_TEMPLATES,
	...DISC_FORM_TEMPLATES,
	...BAR_FORM_TEMPLATES,
	...SHEET_FORM_TEMPLATES,
	...DECORATION_TEMPLATES,
];
