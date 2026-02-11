/**
 * Tag suggestion weighting (lens channel 3.2)
 * doc 04, section 3.2
 *
 * Phase 15 implementation target.
 */

import type { ClassificationSuggestion, LensState } from '$lib/types/lens.js';

export function computeClassificationSuggestions(
	_lensState: LensState
): ClassificationSuggestion[] {
	throw new Error('Not implemented — Phase 15');
}
