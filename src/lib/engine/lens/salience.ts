/**
 * Observation ordering (lens channel 3.1)
 * doc 04, section 3.1
 *
 * Phase 15 implementation target.
 */

import type { ObservationSalience, LensState } from '$lib/types/lens.js';

export function computeSalience(
	_propertyId: string,
	_lensState: LensState
): ObservationSalience {
	throw new Error('Not implemented — Phase 15');
}
