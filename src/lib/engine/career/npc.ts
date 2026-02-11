/**
 * NPC behaviour (review selection, contradiction delivery)
 * doc 07, section 5
 *
 * Phase 22 implementation target.
 */

import type { MinimalScholar } from '$lib/types/scholars.js';
import type { Contradiction, DiegeticSurface } from '$lib/types/contradiction.js';

export function generatePeerChallenge(
	_contradiction: Contradiction,
	_scholar: MinimalScholar
): DiegeticSurface {
	throw new Error('Not implemented — Phase 22');
}
