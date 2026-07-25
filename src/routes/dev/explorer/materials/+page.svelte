<script lang="ts">
/**
 * Material viewer panel (roadmap 2GN.60): resolves a material per component and shows the
 * candidate field each draw was made from — the DOM counterpart of
 * `scripts/dev/sample-materials.ts`, including its `--draws` distribution mode.
 */
import { goto } from '$app/navigation';
import { page } from '$app/state';
import { getSeed } from '../seed';
import { EXPLORER_CULTURES } from '$lib/data/explorer-cultures';
import { assignMaterials } from './materialAssignment';
import type { Obtainability } from './materialAssignment';

const baseSeed = $derived(getSeed(page.url));

let selectedCultureId = $state(EXPLORER_CULTURES[0].id);
const culture = $derived(
	EXPLORER_CULTURES.find((entry) => entry.id === selectedCultureId) ?? EXPLORER_CULTURES[0],
);

let draws = $state(200);
const clampedDraws = $derived(Math.min(2000, Math.max(1, Math.floor(draws) || 1)));

const roll = $derived(Number(page.url.searchParams.get('roll') ?? '0'));
const seed = $derived(roll === 0 ? baseSeed : `${baseSeed}-roll${roll}`);

function reroll(): void {
	const url = new URL(page.url);
	url.searchParams.set('roll', String(roll + 1));
	goto(url, { replaceState: true, keepFocus: true, noScroll: true });
}

const model = $derived(assignMaterials(seed, culture, clampedDraws));
const obtainable = $derived(model.candidates.filter((c) => c.obtainability !== 'blocked'));
const blocked = $derived(model.candidates.filter((c) => c.obtainability === 'blocked'));

const BADGE: Record<Obtainability, string> = {
	local: 'badge-success',
	trade: 'badge-info',
	blocked: 'badge-error',
	unmodelled: 'badge-warning',
};
</script>

<h2 class="text-2xl font-bold">Material Viewer</h2>

<p class="mt-4 max-w-prose">
	Resolves a material for every component of one generated artefact, and shows the candidate field
	each draw came from: what this culture can obtain, how heavily each material is weighted, and
	which materials only arrive by trade.
</p>

<p class="text-base-content/70 mt-2 max-w-prose text-sm">
	The weight column is the <em>combined</em> selection weight, not a scarcity/affinity/technology
	split — <code>computeMaterialWeight</code> returns a single product and its tuning constants are
	private to the engine. The per-component distribution below samples the draw repeatedly instead,
	which shows culture bias empirically without duplicating those numbers.
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
		<span class="label">Draws</span>
		<input type="number" min="1" max="2000" bind:value={draws} />
	</label>

	<button type="button" class="btn btn-sm" onclick={reroll}>Re-roll</button>

	<span class="text-sm">
		seed: <code class="bg-base-200 rounded px-1 font-mono">{seed}</code>
	</span>
</div>

<p class="text-base-content/70 mt-2 max-w-prose text-sm">{culture.description}</p>

<div class="mt-6 flex flex-wrap items-center gap-3 text-sm">
	<span class="badge badge-neutral">{model.artefact.components.length} parts</span>
	<span class="badge badge-success">{obtainable.length} obtainable</span>
	<span class="badge badge-error">{blocked.length} blocked</span>
	<span class="badge badge-ghost">{model.draws} draws</span>
</div>

<div class="mt-6 flex flex-wrap gap-6">
	<div class="min-w-80 flex-1">
		<h3 class="font-semibold">Resolved per component</h3>
		<div class="bg-base-200 rounded-box mt-2 p-4 font-mono text-sm">
			{#each model.assignments as assignment (assignment.componentId)}
				<div class="mb-3 last:mb-0">
					<div class="flex flex-wrap items-baseline gap-2">
						<span class="text-primary font-semibold">{assignment.shortId}</span>
						<span class="text-secondary">{assignment.primitiveType}</span>
						<span class="text-base-content/50">⟶</span>
						<span class="font-semibold">{assignment.resolved.displayName}</span>
					</div>
					<div class="mt-1 space-y-0.5 pl-6">
						{#each assignment.distribution as entry (entry.materialId)}
							<div class="flex items-baseline gap-2 text-xs">
								<span class="w-20 shrink-0">{entry.displayName}</span>
								<span class="bg-base-300 h-2 w-24 shrink-0 overflow-hidden rounded-sm">
									<span
										class="bg-secondary block h-full"
										style="width: {(entry.share * 100).toFixed(1)}%"
									></span>
								</span>
								<span class="text-base-content/60 w-10 shrink-0 text-right">
									{(entry.share * 100).toFixed(0)}%
								</span>
							</div>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	</div>

	<div class="min-w-80 flex-1">
		<h3 class="font-semibold">Candidate field</h3>
		<div class="mt-2 overflow-x-auto">
			<table class="table-zebra table-xs table">
				<thead>
					<tr>
						<th>Material</th>
						<th>Level</th>
						<th>Via</th>
						<th>Weight</th>
					</tr>
				</thead>
				<tbody>
					{#each model.candidates as candidate (candidate.material.id)}
						<tr class={candidate.obtainability === 'blocked' ? 'opacity-50' : ''}>
							<td class="font-mono">{candidate.material.displayName}</td>
							<td class="font-mono text-xs">{candidate.level ?? '—'}</td>
							<td>
								<span class="badge badge-sm {BADGE[candidate.obtainability]}">
									{candidate.obtainability}
								</span>
							</td>
							<td>
								<span class="flex items-center gap-2">
									<span class="bg-base-300 h-2 w-16 shrink-0 overflow-hidden rounded-sm">
										<span
											class="bg-primary block h-full"
											style="width: {(candidate.share * 100).toFixed(1)}%"
										></span>
									</span>
									<span class="font-mono text-xs">{candidate.weight.toFixed(2)}</span>
								</span>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>
