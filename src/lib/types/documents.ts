// Document tradition system types (doc 10 references throughout docs 06-08)

export type DisseminationState = 'private' | 'circulated' | 'submitted' | 'published' | 'collected';

export interface DocumentNode {
	id: string;
	authorId: string;
	title: string;
	content: string;
	commitments: Commitment[];
	disseminationState: DisseminationState;
	venueId?: string;
	form?: string; // Emergent from content properties
	createdAtTerm: number;
	parentId?: string; // Derivation lineage
	lineageType?: 'derivation' | 'revision' | 'response';
}

export interface Commitment {
	id: string;
	claim: string;
	strength: number;
	sourceInferences: string[];
}

export interface KnownLineageEdge {
	fromNodeId: string;
	toNodeId: string;
	type: 'derivation' | 'revision' | 'response';
	discoveredAtTerm: number;
}

export interface LineageGraph {
	nodes: Map<string, DocumentNode>;
	edges: KnownLineageEdge[];
}
