/**
 * Tree-building logic for the structure viewer panel (roadmap 2GN.57).
 *
 * `NormalisedArtefact.attachments` is a flat edge list; the panel wants a nested tree to render.
 * This ports `printAnatomy`'s root/edge/loose-part algorithm (`scripts/dev/shared.ts`) from a
 * console-printing function into a pure data transform, so the `.svelte` file has no graph logic
 * of its own and this module stays unit-testable without a DOM.
 */

import { describeProse } from '../../../../../scripts/dev/shared.ts';
import type { AttachmentType } from '../../../../lib/types/grammar.ts';
import type { NormalisedArtefact, NormalisedComponent } from '../../../../lib/types/artefact.ts';

/** One rendered tree node: a component plus the join that attached it to its parent (absent at the root). */
export interface StructureTreeNode {
	/** Short display id, matching the CLI sampler's `c0`, `c1`… convention. */
	shortId: string;

	/** The underlying flattened component. */
	component: NormalisedComponent;

	/** Prose rendering of the component's parameters (`describeProse`). */
	prose: string;

	/** The join type connecting this node to its parent; absent for root nodes. */
	joinType?: AttachmentType;

	/** Attached children, in attachment order. */
	children: StructureTreeNode[];
}

/** The structure viewer's full render model for one artefact. */
export interface StructureTree {
	/** Root nodes: attached components never on the receiving end of a join. */
	roots: StructureTreeNode[];

	/** Components with no attachment at all, flagged separately (never nested under a root). */
	loose: StructureTreeNode[];
}

/** Short display id for a component: its position along the primary axis (`c0`, `c1`…), matching `scripts/dev/shared.ts`. */
export function shortId(component: NormalisedComponent): string {
	return `c${component.position}`;
}

/**
 * Builds a `StructureTree` from a `NormalisedArtefact`'s flat component/attachment lists.
 *
 * Mirrors `printAnatomy`'s three passes: index children by `fromComponentId`, find roots (attached
 * components that never appear as a `toComponentId`), then walk each root depth-first. A
 * `seen`-guard breaks any cycle defensively, though the grammar only ever produces trees.
 */
export function buildStructureTree(artefact: NormalisedArtefact): StructureTree {
	const { components, attachments } = artefact;

	const byId = new Map(components.map((component) => [component.id, component]));
	const childEdges = new Map<string, { type: AttachmentType; to: NormalisedComponent }[]>();
	const attached = new Set<string>();
	for (const attachment of attachments) {
		attached.add(attachment.fromComponentId).add(attachment.toComponentId);
		const child = byId.get(attachment.toComponentId);
		if (child === undefined) continue;
		const edges = childEdges.get(attachment.fromComponentId) ?? [];
		edges.push({ type: attachment.type, to: child });
		childEdges.set(attachment.fromComponentId, edges);
	}

	const seen = new Set<string>();

	function toNode(
		component: NormalisedComponent,
		joinType?: AttachmentType,
	): StructureTreeNode {
		const node: StructureTreeNode = {
			shortId: shortId(component),
			component,
			prose: describeProse(component),
			joinType,
			children: [],
		};
		if (seen.has(component.id)) return node; // Cycle guard; the grammar produces trees.
		seen.add(component.id);
		const edges = childEdges.get(component.id) ?? [];
		node.children = edges.map((edge) => toNode(edge.to, edge.type));
		return node;
	}

	const receiving = new Set(attachments.map((attachment) => attachment.toComponentId));
	const roots = components
		.filter((component) => attached.has(component.id) && !receiving.has(component.id))
		.map((component) => toNode(component));

	const loose = components
		.filter((component) => !attached.has(component.id))
		.map((component) => toNode(component));

	return { roots, loose };
}
