/**
 * Peer review generation (named, doc 07)
 * doc 07, section 3.3
 *
 * Phase 22 implementation target.
 */

import type { PeerReviewCareerEvent } from '$lib/types/career.js';
import type { DocumentNode } from '$lib/types/documents.js';
import type { MinimalScholar } from '$lib/types/scholars.js';

export function generatePeerReview(
	_document: DocumentNode,
	_reviewer: MinimalScholar
): PeerReviewCareerEvent {
	throw new Error('Not implemented — Phase 22');
}
