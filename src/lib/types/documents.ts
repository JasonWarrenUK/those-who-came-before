/**
 * Document tradition type definitions (doc 10 §2–§3, §8, §11).
 *
 * A `DocumentNode` is immutable once disseminated beyond `private` (doc 10 §1): revising a
 * disseminated document creates a new node linked by a `DocumentLineage` edge rather than editing
 * the original in place. The graph of nodes and lineage edges is a DAG that grows monotonically —
 * nodes are superseded, never deleted. `DocumentNode` is agent-generic (doc 10 §2.2): player and
 * NPC documents share the same shape, distinguished only by `authorAgentId`.
 *
 * MVP scope (doc 10 §11) simplifies several sub-systems: `DocumentPerception` carries only
 * `audienceReach`, `takeawayDivergence` and `citationCount` rather than the full positional
 * comprehension and takeaway-claim modelling described in doc 10 §8.3–§8.4. This module is data
 * shapes only, no behaviour.
 */

import type { Confidence } from './interpretation.ts';
import type { MaterialTag } from './tags.ts';

/**
 * What a document is about, computed from its content rather than chosen by the author (doc 10
 * §3.1). A document referencing artefacts from three cultures has `cross-cultural` scope even if
 * that wasn't the intent — scope can shift during derivation as content is added or removed.
 */
export type DocumentScope =
	| { type: 'artefact'; artefactIds: string[] }
	| { type: 'culture'; cultureLabels: string[] }
	| { type: 'period'; periodLabels: string[] }
	| { type: 'material'; materialTags: MaterialTag[] }
	| { type: 'site'; siteIds: string[] }
	| { type: 'cross-cultural' }
	| { type: 'methodological' };

/**
 * Who a document is written for, explicitly chosen by the author (doc 10 §3.2). Affects form
 * classification, dissemination expectations and perception modelling — the same content reads
 * differently depending on audience.
 */
export type Audience = 'self' | 'peers' | 'students' | 'institution' | 'public';

/**
 * The voice a document is written in, independent of `Audience` (doc 10 §3.3). A popular-register
 * document can target peers just as an academic-register document can target the public; the
 * combination with `Audience` affects reach and comprehension.
 */
export type PublicationRegister = 'academic' | 'curatorial' | 'popular' | 'field-notes';

/**
 * How a derived document relates to one specific parent (doc 10 §2.4). A document can carry
 * multiple `DocumentLineage` entries with different derivation types simultaneously — e.g. a
 * `revision` of one parent and a `response` to another.
 */
export type DerivationType =
	| 'revision'
	| 'extraction'
	| 'synthesis'
	| 'response'
	| 'translation'
	| 'collection';

/**
 * One edge in a document's lineage graph, recording which commitments and content were inherited
 * through that specific parent relationship (doc 10 §2.4). A `DocumentNode` with no lineage
 * entries is a root node, created from scratch rather than derived.
 */
export interface DocumentLineage {
	/** The `DocumentNode.id` this edge derives from. */
	parentId: string;

	/** How this document relates to that parent. */
	derivationType: DerivationType;

	/** Claim IDs carried over unchanged through this edge. */
	inheritedCommitments?: string[];

	/** Summary of what content was pulled from the parent. */
	inheritedContent?: string;
}

/**
 * Records an explicit derivation decision: which of the parent's commitments the author carried
 * forward, modified, or dropped (doc 10 §2.5). Dropping a commitment here does not retract it from
 * the parent — if the parent is circulated or published, that assertion persists in the world even
 * though the author has moved on, and the divergence is later detectable.
 */
export interface DerivationEvent {
	/** The new `DocumentNode.id` created by this derivation. */
	childId: string;

	/** The lineage edges this derivation established. */
	parentLineage: DocumentLineage[];

	/** Claim IDs carried forward unchanged. */
	inheritedCommitments: string[];

	/** Claims carried forward in revised form. */
	modifiedCommitments: Array<{
		originalClaimId: string;
		newClaimId: string;
		reason: string;
	}>;

	/** Claims present in the parent but not carried into the child. */
	droppedCommitments: Array<{
		claimId: string;
		reason?: string;
	}>;

	/** Absolute week (see `src/lib/types/term.ts`) the derivation occurred. */
	timestamp: number;
}

/**
 * A snapshot of the audience's actual reception of a document, simplified for MVP to reach,
 * takeaway divergence and citation count (doc 10 §8.2, §11). Populated once a document advances
 * beyond `private` dissemination — a document with no external audience has no perception yet.
 */
export interface DocumentPerception {
	/** How many people encountered this document. */
	audienceReach: number;

	/** 0–1: gap between the author's intended message and what the audience took away. */
	takeawayDivergence: number;

	/** How many other documents cite this one. */
	citationCount: number;
}

/**
 * A document node in the player's (or an NPC's) intellectual history (doc 10 §2.1). Immutable once
 * `dissemination` moves beyond `'private'` — further changes require a new node linked via
 * `DocumentLineage` rather than an edit in place. Shared verbatim between player and NPC authors
 * (doc 10 §2.2), distinguished only by `authorAgentId`.
 */
export interface DocumentNode {
	id: string;

	/** Scholar who created this node — player or NPC, per doc 10 §2.2. */
	authorAgentId: string;

	/** How this node relates to its ancestors, if any. Empty for root nodes. */
	lineage: DocumentLineage[];

	/** What the document is about — an input to form classification (doc 10 §4). */
	scope: DocumentScope;

	/** Total inference chain links cited, computed from content. */
	evidenceDepth: number;

	/** Claim IDs this document advances. */
	commitments: string[];

	/** How strongly each committed claim is asserted. */
	commitmentStrength: Map<string, Confidence>;

	/** Other `DocumentNode` IDs this document references. */
	synthesisRefs: string[];

	/** Who this document is written for. */
	intendedAudience: Audience;

	/** The voice this document is written in. */
	register: PublicationRegister;

	/** Working documents are mutable private drafts; communicative documents are shared work. */
	category: 'working' | 'communicative';

	/** Derived form label (doc 10 §4), e.g. `field-note`, `working-paper`, `study`. */
	formLabel: string;

	/** Whether the form classification cleanly matched one label or was a near-tie. */
	formConfidence: 'clear' | 'borderline';

	/** Where this document sits in the publication lifecycle (see `DisseminationState`). */
	dissemination: DisseminationState;

	/** Computed: true iff `dissemination === 'private'`. */
	mutable: boolean;

	/** The venue this document was submitted to, if any (only set at `'submitted'` and beyond). */
	venue?: string;

	/** The form label the venue assigned, which may differ from `formLabel` (doc 10 §4.4). */
	venueFormLabel?: string;

	/** Full history of dissemination transitions this document has undergone. */
	disseminationHistory: DisseminationEvent[];

	/** Reception data, populated once dissemination moves beyond `'private'`. */
	perception?: DocumentPerception;

	/** Absolute week (see `src/lib/types/term.ts`) this node was created. */
	createdAt: number;

	/** Emergent from content. */
	wordCount?: number;
}

/**
 * Where a document sits in the publication lifecycle (doc 10 §6.1). MVP scope (doc 10 §11) defers
 * `presented` and `collected` until NPC social systems are richer.
 */
export type DisseminationState = 'private' | 'circulated' | 'submitted' | 'published';

/**
 * One transition in a document's dissemination history (doc 10 §6.1).
 */
export interface DisseminationEvent {
	/** The state this document moved into. */
	state: DisseminationState;

	/** Absolute week (see `src/lib/types/term.ts`) the transition occurred. */
	timestamp: number;

	/** State-specific detail about this transition. */
	details: DisseminationDetails;
}

/**
 * State-specific detail carried by a `DisseminationEvent`, discriminated by `type` (doc 10 §6.1).
 * MVP scope (doc 10 §11) defers the `presented` and `collected` variants along with their
 * `DisseminationState` counterparts.
 */
export type DisseminationDetails =
	| { type: 'circulated'; recipients: string[] }
	| { type: 'submitted'; venueId: string }
	| { type: 'published'; venueId: string; finalFormLabel: string };

/**
 * Where a submitted document stands in a venue's review process (doc 10 §6).
 */
export type PeerReviewState =
	| 'unreviewed'
	| 'under-review'
	| 'revise-and-resubmit'
	| 'accepted'
	| 'rejected';

/**
 * A retraction event and its cascade through dependent documents (doc 10 §7). Retraction is a
 * social act, not an erasure — the retracted node persists in the graph, marked as retracted.
 */
export interface Retraction {
	/** The `DocumentNode.id` being retracted. */
	documentId: string;

	/** Why the author retracted this document. */
	reason: string;

	/** Absolute week (see `src/lib/types/term.ts`) the retraction occurred. */
	timestamp: number;

	/** Documents whose lineage traces through the retracted node and are now tainted. */
	taintedDescendants: TaintedLineage[];
}

/**
 * One document downstream of a retraction, and how directly it depends on the retracted claims
 * (doc 10 §7.1).
 */
export interface TaintedLineage {
	/** The dependent `DocumentNode.id`. */
	documentId: string;

	/** The lineage path connecting this document back to the retracted node. */
	pathFromRetracted: string[];

	/** Claim IDs inherited from the retracted node that this document still asserts. */
	affectedCommitments: string[];
}
