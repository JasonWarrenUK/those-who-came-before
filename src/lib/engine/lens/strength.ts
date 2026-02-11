/**
 * Lens strength computation from InterpretiveModel + dissemination
 * doc 04, section 4
 *
 * Phase 15 implementation target.
 */

import type { InterpretiveModel } from '$lib/types/interpretation.js';
import type { LensState } from '$lib/types/lens.js';

export function computeLens(
	_model: InterpretiveModel
): LensState {
	throw new Error('Not implemented — Phase 15');
}
