/**
 * Pattern-based classification accumulation
 * doc 05, section 9 (tag accumulation during grammar expansion)
 *
 * Phase 4 implementation target.
 */

import type { FunctionTag, ContextTag } from '$lib/types/tags.js';
import type { ExtractedFeatures } from '$lib/types/artefact.js';

export function accumulateTags(
	_features: ExtractedFeatures
): Map<FunctionTag | ContextTag, number> {
	throw new Error('Not implemented — Phase 4');
}
