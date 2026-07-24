<script lang="ts">
/**
 * Plausibility panel (roadmap 2GN.58): generates a batch of structures from the shared seed plus a
 * culture selector, checks each against the plausibility rule set, and shows pass/fail per
 * structure with a running rejection rate. Selecting a row inspects its failure reasons and
 * component tree — reusing the structure viewer's tree renderer (roadmap 2GN.57) rather than
 * duplicating it.
 */
import { page } from '$app/state';
import { getSeed } from '../seed';
import { EXPLORER_CULTURES } from '$lib/data/explorer-cultures';
import { runBatch } from './plausibilityBatch';
import { buildStructureTree } from '../structure/structureTree';
import StructureNode from '../structure/StructureNode.svelte';

const baseSeed = $derived(getSeed(page.url));

let selectedCultureId = $state(EXPLORER_CULTURES[0].id);
const culture = $derived(
	EXPLORER_CULTURES.find((entry) => entry.id === selectedCultureId) ?? EXPLORER_CULTURES[0],
);

let count = $state(20);
const clampedCount = $derived(Math.min(500, Math.max(1, Math.floor(count) || 1)));

const batch = $derived.by(() => runBatch(baseSeed, clampedCount, culture));

const passed = $derived(batch.entries.filter((entry) => entry.result.valid).length);
const failed = $derived(batch.entries.length - passed);
const rejectionPercent = $derived((batch.rejectionRate * 100).toFixed(1));

let selectedIndex = $state(0);
const selected = $derived(batch.entries[selectedIndex] ?? batch.entries[0]);
const selectedTree = $derived(selected ? buildStructureTree(selected.artefact) : undefined);

// The selected row may no longer exist after count shrinks; snap back to the first entry.
$effect(() => {
	if (selectedIndex >= batch.entries.length) selectedIndex = 0;
});
</script>

<h2 class="text-2xl font-bold">Plausibility</h2>

<p class="mt-4 max-w-prose">
	Generates a batch of structures from the shared seed against a selected culture and checks each
	against the plausibility rule set. Only the physics/ergonomic rules shipped so far (roadmap
	2GN.13–15 grow this set) run here — no re-expansion happens on failure, since that retry loop is
	roadmap 2GN.16's job; every rejected structure below is shown exactly as generated.
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

	<label class="input input-sm w-40">
		<span class="label">N</span>
		<input type="number" min="1" max="500" bind:value={count} />
	</label>

	<span class="text-sm">
		seed: <code class="bg-base-200 rounded px-1 font-mono">{baseSeed}</code>
	</span>
</div>

<p class="text-base-content/70 mt-2 max-w-prose text-sm">{culture.description}</p>

<div class="mt-6 flex flex-wrap items-center gap-3 text-sm">
	<span class="badge badge-neutral">{batch.entries.length} generated</span>
	<span class="badge badge-success">{passed} passed</span>
	<span class="badge badge-error">{failed} failed</span>
	<span class="badge badge-ghost">rejection rate: {rejectionPercent}%</span>
</div>

<div class="mt-6 flex flex-wrap gap-6">
	<div class="max-h-96 overflow-y-auto">
		<table class="table-zebra table-xs table">
			<thead>
				<tr>
					<th>#</th>
					<th>Seed</th>
					<th>Parts</th>
					<th>Verdict</th>
				</tr>
			</thead>
			<tbody>
				{#each batch.entries as entry (entry.index)}
					<tr
						class={entry.index === selectedIndex ? 'bg-base-300 cursor-pointer' : 'cursor-pointer'}
						onclick={() => (selectedIndex = entry.index)}
					>
						<td>{entry.index}</td>
						<td class="font-mono">{entry.seed}</td>
						<td>{entry.artefact.components.length}</td>
						<td>
							{#if entry.result.valid}
								<span class="badge badge-success badge-sm">valid</span>
							{:else}
								<span class="badge badge-error badge-sm">
									{entry.result.failures.length} failure(s)
								</span>
							{/if}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	<div class="min-w-64 flex-1">
		{#if selected}
			<h3 class="font-semibold">
				Structure {selected.index} <span class="font-mono text-sm">({selected.seed})</span>
			</h3>

			{#if selected.result.valid}
				<p class="mt-2">
					<span class="badge badge-success">valid</span>
				</p>
			{:else}
				<ul class="mt-2 space-y-1">
					{#each selected.result.failures as failure (failure)}
						<li class="text-error text-sm">✗ {failure}</li>
					{/each}
				</ul>
			{/if}

			{#if selectedTree}
				<div class="bg-base-200 rounded-box mt-4 max-w-3xl p-4 font-mono text-sm">
					{#if selectedTree.roots.length === 0 && selectedTree.loose.length === 0}
						<p class="text-base-content/60 italic">No components generated.</p>
					{/if}

					{#each selectedTree.roots as root (root.component.id)}
						<StructureNode node={root} />
					{/each}

					{#if selectedTree.loose.length > 0}
						<div class="divider my-2"></div>
						<p class="text-base-content/60 mb-1 not-italic">Loose parts:</p>
						{#each selectedTree.loose as node (node.component.id)}
							<StructureNode {node} loose />
						{/each}
					{/if}
				</div>
			{/if}
		{:else}
			<p class="text-base-content/60 italic">No structures generated.</p>
		{/if}
	</div>
</div>
