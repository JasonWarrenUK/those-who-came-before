/**
 * Description variant selection (lens channel 3.4)
 * doc 04, section 3.4
 *
 * Phase 16 implementation target.
 */

import type { DescriptionFrame, LensState } from '$lib/types/lens.js';

export function selectFraming(
	_propertyId: string,
	_lensState: LensState
): DescriptionFrame {
	throw new Error('Not implemented — Phase 16');
}
