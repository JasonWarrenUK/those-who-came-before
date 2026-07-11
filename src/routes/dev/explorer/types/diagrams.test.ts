/// <reference lib="deno.ns" />
import { assertEquals } from '@std/assert';
import { moduleGraphSource, neighbourhoodSource } from './diagrams.ts';
import type { TypeModuleIndex } from './typeIndex.ts';

function stubModule(fileName: string, imports: string[]): TypeModuleIndex {
	return { fileName, summary: '', declarations: [], otherExports: [], imports };
}

Deno.test('moduleGraphSource: one node per module, one edge per import, dot-safe ids', () => {
	const source = moduleGraphSource([
		stubModule('artefact.ts', ['tags.ts']),
		stubModule('tags.ts', []),
	]);

	assertEquals(
		source,
		[
			'graph TD',
			'\tn_artefact_ts["artefact.ts"]',
			'\tn_tags_ts["tags.ts"]',
			'\tn_artefact_ts --> n_tags_ts',
		].join('\n'),
	);
});

Deno.test('neighbourhoodSource: incoming point at the centre, outgoing point away', () => {
	const source = neighbourhoodSource('Widget', ['MaterialTag'], ['NamedWidget']);

	assertEquals(
		source,
		[
			'graph LR',
			'\tn_Widget["Widget"]:::centre',
			'\tclassDef centre stroke-width:3px',
			'\tn_NamedWidget["NamedWidget"] --> n_Widget',
			'\tn_Widget --> n_MaterialTag["MaterialTag"]',
		].join('\n'),
	);
});
