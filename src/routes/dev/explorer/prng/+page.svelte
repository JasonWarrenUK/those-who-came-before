<script lang="ts">
import { page } from '$app/state';
import { createPrng } from '$lib/engine/prng';
import { getSeed } from '../seed';

const seed = $derived(getSeed(page.url));

let count = $state(20);
const clampedCount = $derived(Math.min(1000, Math.max(1, Math.floor(count) || 1)));

// Two independent generators from the same seed: if the engine's determinism guarantee holds,
// their sequences are identical index-by-index.
const rows = $derived.by(() => {
	const runA = createPrng(seed);
	const runB = createPrng(seed);

	return Array.from({ length: clampedCount }, (_, index) => {
		const a = runA();
		const b = runB();
		return { index, a, b, match: a === b };
	});
});

const deterministic = $derived(rows.every((row) => row.match));
</script>

<h2 class="text-2xl font-bold">PRNG Output</h2>

<p class="mt-4 max-w-prose">
	Draws {clampedCount} values from two independent generators created with the same seed. Every row
	must match exactly: any mismatch means the engine's determinism guarantee is broken.
</p>

<div class="mt-6 flex flex-wrap items-center gap-4">
	<label class="input input-sm input-bordered flex w-40 items-center gap-2">
		<span class="label-text font-semibold">N</span>
		<input type="number" class="grow" min="1" max="1000" bind:value={count} />
	</label>

	<span class="text-sm">
		seed: <code class="bg-base-200 rounded px-1 font-mono">{seed}</code>
	</span>

	{#if deterministic}
		<span class="badge badge-success">deterministic — two independent generators agree</span>
	{:else}
		<span class="badge badge-error">mismatch — determinism guarantee broken</span>
	{/if}
</div>

<div class="mt-6 overflow-x-auto">
	<table class="table-zebra table max-w-2xl">
		<thead>
			<tr>
				<th>#</th>
				<th>Run A</th>
				<th>Run B</th>
				<th>Match</th>
			</tr>
		</thead>
		<tbody>
			{#each rows as row (row.index)}
				<tr>
					<td>{row.index}</td>
					<td class="font-mono">{row.a}</td>
					<td class="font-mono">{row.b}</td>
					<td>
						{#if row.match}
							<span class="text-success">✓</span>
						{:else}
							<span class="text-error">✗</span>
						{/if}
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
