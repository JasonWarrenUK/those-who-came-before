/**
 * Unified tag classification (structural + decorative)
 * doc 05, section 9
 *
 * Phase 4 implementation target.
 */

import type { FunctionTag, ContextTag } from '$lib/types/tags.js';
import type { ExtractedFeatures } from '$lib/types/artefact.js';
import type { ClassificationRule } from '$lib/types/grammar.js';

export function classifyArtefact(
	_features: ExtractedFeatures,
	_rules: ClassificationRule[]
): Map<FunctionTag | ContextTag, number> {
	throw new Error('Not implemented — Phase 4');
}
