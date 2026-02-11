/**
 * Methodological weight profiles
 * doc 08, section 3.2
 *
 * Phase 13 implementation target.
 */

import type { MethodologicalProfile } from '$lib/types/interpretation.js';

export function defaultMethodology(): MethodologicalProfile {
	return {
		weights: new Map()
	};
}
