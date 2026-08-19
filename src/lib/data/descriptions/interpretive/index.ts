/**
 * Interpretive register templates (doc 04 §3.4, doc 05 §13.1, roadmap 2GN.36).
 *
 * Functional and contextual voice: what the form affords, what it signals, what it was probably
 * for. Where the observational register measures ("a double edge runs along the form"), this
 * register interprets ("a double edge cuts on the draw as readily as the thrust — built for combat,
 * not craft"). Every variant here carries a non-empty `emphasis: ArtefactTag[]` — foregrounding a
 * function or context reading is this register's defining trait, the mirror of observational's
 * defining trait of foregrounding none at all.
 *
 * `property` ids and slot syntax follow the same conventions `observational/index.ts` establishes:
 * `<primitiveType>.<parameter>` for structural components, `decoration.<technique>` (plus
 * `.motif`/`.material` suffixes) for the sixteen decorative grammar terminals, Tracery-style
 * `#slot#`/`#slot.a#` placeholders.
 *
 * Conditioned variants gate on the owning parameter's own value (`VariantCondition.values`) where a
 * single unconditioned reading would flatten distinct interpretive claims across incompatible
 * values — a diamond cross-section reads differently from a round one, an abrupt taper differently
 * from none at all. Material/craft-domain conditions (`materialId`, `materialTag`, `craftDomain`)
 * are not used here: 2GN.91's notes name that gate as necessary where a geometric reading is false
 * for some materials (e.g. taper reading as "forceful strike" is false for a brittle material), and
 * no template below makes a claim strong enough to need it — reserved for 2GN.38's fuller selection
 * pass rather than authored speculatively against untested claims.
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
 * The complete interpretive register: every structural primitive's parameters plus every
 * decorative technique, flattened into one list keyed by `property` id.
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
