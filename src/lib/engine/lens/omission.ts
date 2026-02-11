/**
 * Contradicting property de-emphasis (lens channel 3.5)
 * doc 04, section 3.5
 *
 * Phase 16 implementation target.
 */

import type { OmissionCheck, LensState } from '$lib/types/lens.js';

export function checkOmission(
	_propertyId: string,
	_lensState: LensState
): OmissionCheck {
	throw new Error('Not implemented — Phase 16');
}
