<script lang="ts">
/**
 * Decoration inspector panel (roadmap 2GN.61): expands the decorative grammar over one artefact and
 * shows each component's layers with their technique, BNF category and material prerequisite — the
 * DOM counterpart of `scripts/dev/sample-decoration.ts`.
 */
import { goto } from '$app/navigation';
import { page } from '$app/state';
import { getSeed } from '../seed';
import { EXPLORER_CULTURES } from '$lib/data/explorer-cultures';
import { inspectDecoration } from './decorationLayers';
import type { InspectedLayer, PrerequisiteVerdict } from './decorationLayers';

const baseSeed = $derived(getSeed(page.url));

let selectedCultureId = $state(EXPLORER_CULTURES[0].id);
const culture = $derived(
	EXPLORER_CULTURES.find((entry) => entry.id === selectedCultureId) ?? EXPLORER_CULTURES[0],
);

const roll = $derived(Number(page.url.searchParams.get('roll') ?? '0'));
const seed = $derived(roll === 0 ? baseSeed : `${baseSeed}-roll${roll}`);

function reroll(): void {
	const url = new URL(page.url);
	url.searchParams.set('roll', String(roll + 1));
	goto(url, { replaceState: true, keepFocus: true, noScroll: true });
}

const model = $derived(inspectDecoration(seed, culture));

const VERDICT: Record<PrerequisiteVerdict, string> = {
	none: 'badge-ghost',
	met: 'badge-success',
	unmet: 'badge-error',
	unevaluated: 'badge-warning',
};
</script>

{#snippet layerRow(layer: InspectedLayer)}
	<div class="pl-4" style="padding-left: {layer.depth * 1.5 + 1}rem">
		<div class="flex flex-wrap items-baseline gap-2">
			<span class="text-base-content/50">✦</span>
			<span class="text-secondary font-semibold">{layer.technique}</span>
			<span class="badge badge-ghost badge-sm">{layer.category}</span>
			{#if layer.requirement}
				<span class="text-base-content/70 text-xs">requires: {layer.requirement}</span>
				<span class="badge badge-sm {VERDICT[layer.verdict]}">{layer.verdict}</span>
			{/if}
		</div>
	</div>
	<!-- Keyed by index: a component can legitimately carry the same technique twice at the same
	     depth, so technique+depth is not unique. -->
	{#each layer.sublayers as sublayer, index (index)}
		{@render layerRow(sublayer)}
	{/each}
{/snippet}

<h2 class="text-2xl font-bold">Decoration Inspector</h2>

<p class="mt-4 max-w-prose">
	Expands the decorative grammar over one generated artefact and lists each component's layers with
	their technique, BNF category and material prerequisite — checked against the material that
	component was assigned.
</p>

<p class="text-base-content/70 mt-2 max-w-prose text-sm">
	Prerequisites are <em>evaluated but not enforced</em>: the grammar deliberately emits layers whose
	requirement may not hold, and rejecting them is roadmap 2GN.30. An <code>unmet</code> badge marks
	a layer that task will remove. Form requirements read <code>unevaluated</code> because resolving
	them against component geometry is likewise 2GN.30's job. Layers are flat until 2GN.31/2GN.32 add
	nesting and a depth cap, so depth is always 0 today.
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
	<span class="badge badge-neutral">{model.artefact.components.length} parts</span>
	<span class="badge badge-ghost">{model.layerCount} layers</span>
	<span class={model.unmetCount > 0 ? 'badge badge-error' : 'badge badge-success'}>
		{model.unmetCount} unmet prerequisites
	</span>
	<span class="badge badge-ghost">max depth: {model.maxDepth}</span>
</div>

<div class="bg-base-200 rounded-box mt-6 max-w-3xl p-4 font-mono text-sm">
	{#if model.layerCount === 0}
		<p class="text-base-content/60 italic">
			No decoration — this seed rolled an undecorated artefact. Low decorative emphasis genuinely
			produces bare objects; that is the grammar working, not a failure.
		</p>
	{:else}
		{#each model.components as component (component.componentId)}
			<div class="mb-3 last:mb-0">
				<div class="flex flex-wrap items-baseline gap-2">
					<span class="text-primary font-semibold">{component.shortId}</span>
					<span class="text-secondary">{component.primitiveType}</span>
					<span class="text-base-content/50">⟶</span>
					<span>{component.material.displayName}</span>
					{#if component.layers.length === 0}
						<span class="text-base-content/50 text-xs italic">undecorated</span>
					{/if}
				</div>
				{#each component.layers as layer, index (index)}
					{@render layerRow(layer)}
				{/each}
			</div>
		{/each}
	{/if}
</div>
