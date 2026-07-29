/**
 * Observational register templates (doc 04 §3.4, doc 05 §13.1, roadmap 2GN.35).
 *
 * Material-science voice: what can be measured, weighed, compared. Every variant below is
 * `register: 'observational'` with `emphasis: []` — the observational register's defining trait is
 * that it foregrounds no function tag at all (doc 04 §3.4's own worked example uses causal language
 * like "consistent with impact", but never attributes purpose). `emphasis` becomes non-empty once
 * the interpretive register (roadmap 2GN.36) exists.
 *
 * `property` ids are namespaced `<primitiveType>.<parameter>` for structural components (matching
 * `data/grammars/primitives.ts`'s per-primitive parameter scoping — `crossSection` on `elongated`
 * is not the same vocabulary as `crossSection` on `ring-form`) and `decoration.<technique>` for the
 * sixteen decorative grammar terminals (matching `data/decorations.ts`). Both id shapes are minted
 * here for roadmap 2GN.36/2GN.37 to reuse.
 *
 * Slots use real Tracery syntax (`#slot#`, with the `.a` modifier for article agreement —
 * `#crossSection.a#` renders "an oval" vs "a rectangular") per doc 05 §13.1's "Tracery-style
 * template with slots" wording. This module is static data only, no behaviour. Out of scope, and
 * owned downstream:
 * - expanding a template against a component's actual property values (`engine/generation/
 *   description.ts`, roadmap 2GN.39)
 * - selecting among a property's variants by lens/hypothesis alignment (roadmap 2GN.38)
 * - the interpretive and technical registers (`descriptions/interpretive/`, `descriptions/
 *   technical/`, roadmap 2GN.36–2GN.37)
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
 * The complete observational register: every structural primitive's parameters plus every
 * decorative technique, flattened into one list keyed by `property` id.
 */
export const OBSERVATIONAL_TEMPLATES: readonly DescriptionTemplate[] = [
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
