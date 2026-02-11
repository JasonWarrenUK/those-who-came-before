/**
 * Register-based description generation (observational/interpretive/technical)
 * doc 05, section 13
 *
 * Phase 11 implementation target.
 */

import type { ClassifiedArtefact } from '$lib/types/artefact.js';
import type { ArtefactPresentation } from '$lib/types/lens.js';
import type { LensState } from '$lib/types/lens.js';

export function generateDescription(
	_artefact: ClassifiedArtefact,
	_lensState: LensState
): ArtefactPresentation {
	throw new Error('Not implemented — Phase 11');
}
