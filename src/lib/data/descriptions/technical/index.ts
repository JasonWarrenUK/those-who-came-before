/**
 * Technical register templates (doc 04 §3.4, doc 05 §13.1, roadmap 2GN.37).
 *
 * Craft-process voice: how the form was worked, what steps and tools produced it. Where the
 * observational register measures ("the terminus comes to a blunt point") and the interpretive
 * register interprets ("a blunt terminus — this end was never meant to pierce anything"), this
 * register names the manufacturing choice behind the fact ("the terminus was left blunt, with no
 * fine point worked in"). `emphasis` is empty across every variant here, matching the observational
 * register's convention: a craft-process reading foregrounds no `ArtefactTag` at all — it describes
 * what was done, not what the result is for. This is a deliberate parallel to observational's own
 * `emphasis: []` rule (see `observational/index.ts`), not an oversight; interpretive is the register
 * that foregrounds function and context (roadmap 2GN.36).
 *
 * `property` ids and slot syntax follow the same conventions `observational/index.ts` establishes:
 * `<primitiveType>.<parameter>` for structural components, `decoration.<technique>` (plus
 * `.motif`/`.material` suffixes) for the sixteen decorative grammar terminals, Tracery-style
 * `#slot#`/`#slot.a#` placeholders.
 *
 * Conditions here gate on two things: a parameter's own value where the working process genuinely
 * differs by value (a hexagonal cross-section is filed differently from a round one), and
 * `craftDomain` in `decoration.ts` where a technique's process differs by substrate (engraving
 * metal is a different physical act from engraving stone). No other condition field is used —
 * `materialId`/`materialTag` gates are reserved for 2GN.38's fuller selection pass rather than
 * authored speculatively.
 *
 * Out of scope, and owned downstream, exactly as `observational/index.ts` states:
 * - expanding a template against a component's actual property values (`engine/generation/
 *   description.ts`, roadmap 2GN.39)
 * - selecting among a property's variants by lens/hypothesis alignment (roadmap 2GN.38)
 * - honouring `condition`'s material/craft-domain fields during selection (roadmap 2GN.93)
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
 * The complete technical register: every structural primitive's parameters plus every decorative
 * technique, flattened into one list keyed by `property` id.
 */
export const TECHNICAL_TEMPLATES: readonly DescriptionTemplate[] = [
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
