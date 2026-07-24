/// <reference lib="deno.ns" />
import { assertEquals, assertNotEquals } from '@std/assert';
import { buildStructureTree, shortId } from './structureTree.ts';
import { mockNormalisedArtefact } from '../../../../../tests/fixtures/artefact.ts';
import { createPrng } from '../../../../lib/engine/prng.ts';
import { expandGrammar, normaliseArtefact } from '../../../../lib/engine/generation/grammar.ts';
import { CORE_GRAMMAR_RULES } from '../../../../lib/data/grammars/core.ts';
import { EXPLORER_CULTURES } from '../../../../lib/data/explorer-cultures.ts';

const tarpan = EXPLORER_CULTURES.find((culture) => culture.id === 'tarpan')!;
const khaltiris = EXPLORER_CULTURES.find((culture) => culture.id === 'khaltiris')!;

function generate(seed: string, culture: typeof tarpan) {
	const prng = createPrng(seed);
	const expanded = expandGrammar(CORE_GRAMMAR_RULES, culture.profile, culture.phase, prng);
	return normaliseArtefact(expanded, `test-${seed}`);
}

Deno.test('buildStructureTree — single loose component with no attachments', () => {
	const artefact = mockNormalisedArtefact();

	const tree = buildStructureTree(artefact);

	assertEquals(tree.roots, []);
	assertEquals(tree.loose.length, 1);
	assertEquals(tree.loose[0].shortId, 'c0');
	assertEquals(tree.loose[0].joinType, undefined);
	assertEquals(tree.loose[0].children, []);
});

Deno.test('buildStructureTree — two-component chain nests the child under the parent, join type carried', () => {
	const parent = mockNormalisedArtefact().components[0];
	const child = { ...parent, id: 'child-component', position: 1 };
	const artefact = mockNormalisedArtefact({
		components: [parent, child],
		attachments: [{ fromComponentId: parent.id, toComponentId: child.id, type: 'socketed' }],
	});

	const tree = buildStructureTree(artefact);

	assertEquals(tree.roots.length, 1);
	assertEquals(tree.roots[0].shortId, 'c0');
	assertEquals(tree.roots[0].joinType, undefined); // Roots have no incoming join.
	assertEquals(tree.roots[0].children.length, 1);
	assertEquals(tree.roots[0].children[0].shortId, 'c1');
	assertEquals(tree.roots[0].children[0].joinType, 'socketed');
	assertEquals(tree.loose, []);
});

Deno.test('buildStructureTree — a component attached to one root but unrelated to another is not a second root', () => {
	const root = mockNormalisedArtefact().components[0];
	const receiver = { ...root, id: 'receiver', position: 1 };
	const loose = { ...root, id: 'unattached', position: 2 };
	const artefact = mockNormalisedArtefact({
		components: [root, receiver, loose],
		attachments: [{ fromComponentId: root.id, toComponentId: receiver.id, type: 'inline' }],
	});

	const tree = buildStructureTree(artefact);

	assertEquals(tree.roots.length, 1); // `receiver` is attached but is a child, not a root.
	assertEquals(tree.loose.length, 1);
	assertEquals(tree.loose[0].shortId, shortId(loose));
});

Deno.test('buildStructureTree — real generation output produces a deterministic tree for the same seed and culture', () => {
	const artefactA = generate('structure-tree-determinism', khaltiris);
	const artefactB = generate('structure-tree-determinism', khaltiris);

	const treeA = buildStructureTree(artefactA);
	const treeB = buildStructureTree(artefactB);

	assertEquals(treeA, treeB);
});

Deno.test('buildStructureTree — different cultures produce different trees for the same seed', () => {
	const seed = 'structure-tree-culture-variation';
	const tarpanTree = buildStructureTree(generate(seed, tarpan));
	const khaltirisTree = buildStructureTree(generate(seed, khaltiris));

	assertNotEquals(tarpanTree, khaltirisTree);
});

Deno.test('buildStructureTree — every node carries non-empty prose for a known primitive', () => {
	const artefact = generate('structure-tree-prose', tarpan);
	const tree = buildStructureTree(artefact);

	function assertProse(nodes: ReturnType<typeof buildStructureTree>['roots']) {
		for (const node of nodes) {
			assertEquals(typeof node.prose, 'string');
			assertEquals(node.prose.length > 0, true);
			assertProse(node.children);
		}
	}

	assertProse(tree.roots);
	assertProse(tree.loose);
});
