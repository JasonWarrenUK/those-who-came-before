/**
 * Mermaid source generators for the Type Index panel's two visualisations: the module dependency
 * graph (17 nodes — comfortably inside mermaid's readable range) and a selected type's reference
 * neighbourhood (a handful of nodes). The full type-reference graph — ~150 nodes, several hundred
 * edges — is deliberately not generated: at that scale mermaid produces an unreadable hairball.
 *
 * Pure string builders, no mermaid import: rendering happens client-side in
 * `MermaidDiagram.svelte`, these run anywhere (including under `deno test`).
 */

import type { TypeModuleIndex } from './typeIndex.ts';

/** Mermaid node ids cannot contain dots or start with a digit; labels carry the real name. */
function nodeId(name: string): string {
	return 'n_' + name.replace(/[^A-Za-z0-9_]/g, '_');
}

/**
 * The intra-`types/` import graph. Arrows point at the module being imported — an edge reads
 * "depends on" — making the convention that imports stay one-directional visible at a glance.
 */
export function moduleGraphSource(modules: TypeModuleIndex[]): string {
	const lines = ['graph TD'];

	for (const module of modules) {
		lines.push(`\t${nodeId(module.fileName)}["${module.fileName}"]`);
	}
	for (const module of modules) {
		for (const imported of module.imports) {
			lines.push(`\t${nodeId(module.fileName)} --> ${nodeId(imported)}`);
		}
	}

	return lines.join('\n');
}

/**
 * One type with its direct reference neighbourhood: referencing types point in, referenced types
 * point out. Both lists are expected pre-filtered to registered names.
 */
export function neighbourhoodSource(
	centre: string,
	outgoing: string[],
	incoming: string[],
): string {
	const centreId = nodeId(centre);
	const lines = [
		'graph LR',
		`\t${centreId}["${centre}"]:::centre`,
		'\tclassDef centre stroke-width:3px',
	];

	// Every neighbour is declared with an explicit label — an edge endpoint left bare would fall
	// back to rendering its sanitised node id.
	for (const name of incoming) {
		lines.push(`\t${nodeId(name)}["${name}"] --> ${centreId}`);
	}
	for (const name of outgoing) {
		lines.push(`\t${centreId} --> ${nodeId(name)}["${name}"]`);
	}

	return lines.join('\n');
}
