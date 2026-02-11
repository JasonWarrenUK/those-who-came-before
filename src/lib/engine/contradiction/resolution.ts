/**
 * Retcon flow
 * doc 06, section 4.6
 *
 * Phase 18 implementation target.
 */

import type { Resolution, Contradiction } from '$lib/types/contradiction.js';

export function resolveContradiction(
	_contradiction: Contradiction,
	_resolutionType: Resolution['type']
): Resolution {
	throw new Error('Not implemented — Phase 18');
}
