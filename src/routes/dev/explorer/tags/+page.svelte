<script lang="ts">
/**
 * Tag inspector panel (roadmap 2GN.59): classifies one generated artefact and shows its tag map as
 * a scored bar chart, with each tag decomposed into the rules that produced it — the DOM
 * counterpart of `scripts/dev/sample-classification.ts`.
 */
import { goto } from '$app/navigation';
import { page } from '$app/state';
import { getSeed } from '../seed';
import { EXPLORER_CULTURES } from '$lib/data/explorer-cultures';
import { inspectTags } from './tagInspector';
import type { FeatureGroup, FeatureReading, ScoredTag } from './tagInspector';
import { buildStructureTree } from '../structure/structureTree';
import StructureNode from '../structure/StructureNode.svelte';

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

const inspection = $derived(inspectTags(seed, culture));
const scoredCount = $derived(inspection.functionTags.length + inspection.contextTags.length);
const tree = $derived(buildStructureTree(inspection.artefact));

const FEATURE_SECTIONS: { group: FeatureGroup; title: string; note?: string }[] = [
	{ group: 'structural', title: 'Structural' },
	{ group: 'decorative', title: 'Decorative' },
	{ group: 'complexity', title: 'Complexity' },
	{ group: 'mechanical', title: 'Mechanical', note: 'no rule may read these' },
];

function featuresIn(group: FeatureGroup): FeatureReading[] {
	return inspection.featureReadings.filter((reading) => reading.group === group);
}

function breakdown(scored: ScoredTag): string {
	return scored.contributions.map((c) => `${c.rule} ${c.weight.toFixed(2)}`).join(' + ');
}
</script>

{#snippet chart(title: string, rows: ScoredTag[])}
	{#if rows.length > 0}
		<h3 class="mt-4 font-semibold">{title}</h3>
		<div class="mt-2 space-y-1">
			{#each rows as row, index (row.tag)}
				<div class="text-sm">
					<div class="flex items-baseline gap-2">
						<span class="w-24 shrink-0 font-mono">{row.tag}</span>
						<span class="bg-base-300 h-3 min-w-16 flex-1 overflow-hidden rounded-sm">
							<span
								class="block h-full {index === 0 ? 'bg-primary' : 'bg-secondary'}"
								style="width: {(row.share * 100).toFixed(1)}%"
							></span>
						</span>
						<span class="w-10 shrink-0 text-right font-mono">{row.score.toFixed(2)}</span>
					</div>
					<div class="text-base-content/60 pl-24 font-mono text-xs">← {breakdown(row)}</div>
				</div>
			{/each}
		</div>
	{/if}
{/snippet}

<h2 class="text-2xl font-bold">Tag Inspector</h2>

<p class="mt-4 max-w-prose">
	Classifies one generated artefact and shows its tag map, with every score decomposed into the
	rules that produced it. Scores are unbounded evidence tallies rather than confidences, so bars
	are scaled against this artefact's own strongest tag — not an absolute ceiling.
</p>

<p class="text-base-content/70 mt-2 max-w-prose text-sm">
	The breakdown is per <em>rule</em>, not per component: <code>extractFeatures</code> collapses the
	whole artefact into flat scalars carrying no component references, and every classification rule
	is a whole-artefact predicate. A score therefore traces to a rule, never to a component.
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
	<span class="badge badge-neutral">{inspection.artefact.components.length} parts</span>
	<span class="badge badge-ghost">{inspection.layers.length} decorative layers</span>
	<span class="badge badge-ghost">
		{inspection.firedRuleIndices.length}/{inspection.ruleCount} rules fired
	</span>
	<span class="badge badge-ghost">{scoredCount} tags scored</span>
</div>

<div class="mt-6 flex flex-wrap gap-6">
	<div class="min-w-80 flex-1">
		<h3 class="font-semibold">The artefact</h3>
		<div class="bg-base-200 rounded-box mt-2 p-4 font-mono text-sm">
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

		<h3 class="mt-4 font-semibold">Extracted features</h3>
		<p class="text-base-content/60 mt-1 text-xs">
			What the rules actually read. Values at their neutral setting are dimmed — they carry no
			signal, but are shown so an expected-but-absent feature stays checkable.
		</p>
		<div class="bg-base-200 rounded-box mt-2 p-4 text-xs">
			{#each FEATURE_SECTIONS as section (section.group)}
				<div class="mb-3 last:mb-0">
					<p class="text-base-content/70 mb-1 font-semibold">
						{section.title}
						{#if section.note}
							<span class="text-base-content/50 font-normal italic">— {section.note}</span>
						{/if}
					</p>
					<div class="grid max-w-md grid-cols-[1fr_auto] gap-x-4 gap-y-0.5 font-mono">
						{#each featuresIn(section.group) as reading (reading.field)}
							<span class={reading.inert ? 'text-base-content/35' : ''}>
								{reading.field}
								{#if reading.dormant}
									<span class="badge badge-ghost badge-xs ml-1">dormant</span>
								{/if}
							</span>
							<span class={reading.inert ? 'text-base-content/35' : 'font-semibold'}>
								{reading.value}
							</span>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	</div>

	<div class="min-w-96 flex-1">
		<h3 class="font-semibold">Tag scores</h3>
		<div class="bg-base-200 rounded-box mt-2 p-4">
			{#if scoredCount === 0}
				<p class="text-base-content/60 italic">
					No rules fired — the classifier returns an empty map. That is honest silence, not a
					failure: this artefact carries no feature any shipped rule reads.
				</p>
			{:else}
				{@render chart('Function tags', inspection.functionTags)}
				{@render chart('Context tags', inspection.contextTags)}
			{/if}

			{#if inspection.unscored.length > 0}
				<div class="divider my-3"></div>
				<p class="text-base-content/60 text-sm">
					<span class="font-semibold">No evidence:</span>
					<span class="font-mono">{inspection.unscored.join(', ')}</span>
				</p>
				<p class="text-base-content/50 mt-1 text-xs">
					The score map is sparse by contract — an absent tag provably scored zero, since every
					rule weight is positive.
				</p>
			{/if}
		</div>
	</div>
</div>
