<script lang="ts">
/**
 * Structure viewer panel (roadmap 2GN.57): generates one artefact from the shared seed plus a
 * culture selector, and renders its component tree with join-type-labelled edges — the DOM
 * counterpart of `scripts/dev/sample-artefact.ts`'s anatomy tree.
 */
import { goto } from '$app/navigation';
import { page } from '$app/state';
import { getSeed } from '../seed';
import { createPrng } from '$lib/engine/prng';
import { expandGrammar, normaliseArtefact } from '$lib/engine/generation/grammar';
import { CORE_GRAMMAR_RULES } from '$lib/data/grammars/core';
import { EXPLORER_CULTURES } from '$lib/data/explorer-cultures';
import { buildStructureTree } from './structureTree';
import type { StructureTreeNode } from './structureTree';
import StructureNode from './StructureNode.svelte';

const baseSeed = $derived(getSeed(page.url));

let selectedCultureId = $state(EXPLORER_CULTURES[0].id);
const culture = $derived(
	EXPLORER_CULTURES.find((entry) => entry.id === selectedCultureId) ?? EXPLORER_CULTURES[0],
);

// Re-roll nudges a `roll` query param rather than the shared seed, so re-rolling this panel never
// overwrites the seed another panel (or a pasted repro link) is relying on.
const roll = $derived(Number(page.url.searchParams.get('roll') ?? '0'));
const seed = $derived(roll === 0 ? baseSeed : `${baseSeed}-roll${roll}`);

function reroll(): void {
	const url = new URL(page.url);
	url.searchParams.set('roll', String(roll + 1));
	goto(url, { replaceState: true, keepFocus: true, noScroll: true });
}

const artefact = $derived.by(() => {
	const prng = createPrng(seed);
	const expanded = expandGrammar(CORE_GRAMMAR_RULES, culture.profile, culture.phase, prng);
	return normaliseArtefact(expanded, `structure-${seed}`);
});

const tree = $derived(buildStructureTree(artefact));
</script>

<h2 class="text-2xl font-bold">Structure Viewer</h2>

<p class="mt-4 max-w-prose">
	Expands the component grammar from the shared seed against a selected culture, then normalises
	the result into a component tree. Edges are labelled with their join type; parts the grammar
	never attached are flagged as loose below the tree.
</p>

<div class="mt-6 flex flex-wrap items-center gap-4">
	<label class="select select-sm w-56">
		<span class="label">Culture</span>
		<select bind:value={selectedCultureId}>
			{#each EXPLORER_CULTURES as entry (entry.id)}
				<option value={entry.id}>{entry.label}</option>
			{/each}
		</select>
	</label>

	<button type="button" class="btn btn-sm" onclick={reroll}>Re-roll</button>

	<span class="text-sm">
		seed: <code class="bg-base-200 rounded px-1 font-mono">{seed}</code>
	</span>
</div>

<p class="text-base-content/70 mt-2 max-w-prose text-sm">{culture.description}</p>

<div class="mt-6 flex flex-wrap items-center gap-3 text-sm">
	<span class="badge badge-neutral">{artefact.components.length} parts</span>
	<span class="badge badge-ghost">
		{artefact.dimensions.primaryExtent}×{artefact.dimensions.secondaryExtent}cm
	</span>
	<span class="badge badge-ghost">{artefact.dimensions.mass}</span>
	<span class="badge badge-ghost">{artefact.portability}</span>
	<span class="badge badge-ghost">inspect: {artefact.inspectionDepth}</span>
</div>

<div class="bg-base-200 rounded-box mt-6 max-w-3xl p-4 font-mono text-sm">
	{#if tree.roots.length === 0 && tree.loose.length === 0}
		<p class="text-base-content/60 italic">No components generated.</p>
	{/if}

	{#each tree.roots as root (root.component.id)}
		<StructureNode node={root} />
	{/each}

	{#if tree.loose.length > 0}
		<div class="divider my-2"></div>
		<p class="text-base-content/60 mb-1 not-italic">Loose parts:</p>
		{#each tree.loose as node (node.component.id)}
			<StructureNode {node} loose />
		{/each}
	{/if}
</div>
