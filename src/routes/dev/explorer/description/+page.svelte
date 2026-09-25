<script lang="ts">
/**
 * Description viewer panel (roadmap 2GN.160): runs stage 9 (`generateDescription`, roadmap 2GN.38)
 * over one generated artefact and shows the resulting `ArtefactPresentation` grouped under the
 * component each observation describes. Three-register side-by-side comparison is roadmap 2GN.62,
 * which extends this panel once 2GN.40–2GN.42 land.
 */
import { goto } from '$app/navigation';
import { page } from '$app/state';
import { getSeed } from '../seed';
import { EXPLORER_CULTURES } from '$lib/data/explorer-cultures';
import { ALL_REGISTERS, describeArtefact, propertyLabel } from './describeArtefact';
import type { DescriptionRegister } from '$lib/types/lens';

const baseSeed = $derived(getSeed(page.url));

let selectedCultureId = $state(EXPLORER_CULTURES[0].id);
const culture = $derived(
	EXPLORER_CULTURES.find((entry) => entry.id === selectedCultureId) ?? EXPLORER_CULTURES[0],
);

// Which registers the reading agent holds. The engine foregrounds the first of its own preference
// order present here; the last checked box cannot be cleared, since an empty list is a caller error.
let available = $state<Record<DescriptionRegister, boolean>>({
	observational: true,
	interpretive: true,
	technical: true,
});
const registers = $derived(ALL_REGISTERS.filter((register) => available[register]));

function toggle(register: DescriptionRegister): void {
	if (available[register] && registers.length === 1) return;
	available[register] = !available[register];
}

const roll = $derived(Number(page.url.searchParams.get('roll') ?? '0'));
const seed = $derived(roll === 0 ? baseSeed : `${baseSeed}-roll${roll}`);

function reroll(): void {
	const url = new URL(page.url);
	url.searchParams.set('roll', String(roll + 1));
	goto(url, { replaceState: true, keepFocus: true, noScroll: true });
}

const model = $derived(describeArtefact(seed, culture, registers));
const provenance = $derived(model.presentation.provenance);
</script>

<h2 class="text-2xl font-bold">Description Viewer</h2>

<p class="mt-4 max-w-prose">
	Generates one artefact, classifies it and hands the result to stage 9. What appears below is the
	<code>ArtefactPresentation</code> an agent reads: one observation per described property, in the
	single register the engine foregrounds from the registers that agent holds.
</p>

<p class="text-base-content/70 mt-2 max-w-prose text-sm">
	No lens exists yet (Milestone 6), so every observation is primary at salience 1.0 and the tag
	suggestions and cross-references stay empty. The label slot is blank because nothing produces
	<code>physicalLabel</code> until 2GN.21. Provenance is a caller-supplied stub until 2GN.47
	generates a real one (2GN.148 wires it in). Decorative layers are not described until 2GN.41.
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

	<fieldset class="flex items-center gap-3 text-sm">
		<legend class="sr-only">Registers held</legend>
		{#each ALL_REGISTERS as register (register)}
			<label class="flex cursor-pointer items-center gap-1">
				<input
					type="checkbox"
					class="checkbox checkbox-sm"
					checked={available[register]}
					onchange={() => toggle(register)}
				/>
				{register}
			</label>
		{/each}
	</fieldset>

	<button type="button" class="btn btn-sm" onclick={reroll}>Re-roll</button>

	<span class="text-sm">
		seed: <code class="bg-base-200 rounded px-1 font-mono">{seed}</code>
	</span>
</div>

<p class="text-base-content/70 mt-2 max-w-prose text-sm">{culture.description}</p>

<div class="mt-6 flex flex-wrap items-center gap-3 text-sm">
	<span class="badge badge-neutral">{model.components.length} parts</span>
	<span class="badge badge-ghost">{model.observationCount} observations</span>
	<span class="badge badge-primary">register: {model.foregroundedRegister}</span>
	<span class="badge badge-ghost">
		label: {model.presentation.label === '' ? 'none (2GN.21)' : model.presentation.label}
	</span>
</div>

<div class="bg-base-200 rounded-box mt-6 max-w-3xl p-4 text-sm">
	{#if model.observationCount === 0}
		<p class="text-base-content/60 italic">
			No observations — no authored template in the <code>{model.foregroundedRegister}</code>
			register matched any of this artefact's component properties. A gap in the template set,
			not a generation failure.
		</p>
	{:else}
		{#each model.components as component (component.componentId)}
			<div class="mb-4 last:mb-0">
				<div class="flex flex-wrap items-baseline gap-2 font-mono">
					<span class="text-primary font-semibold">{component.shortId}</span>
					<span class="text-secondary">{component.primitiveType}</span>
					<span class="text-base-content/50">⟶</span>
					<span>{component.material.displayName}</span>
					{#if component.observations.length === 0}
						<span class="text-base-content/50 text-xs italic">no template matched</span>
					{/if}
				</div>
				<ol class="mt-1 ml-6 list-decimal space-y-1">
					{#each component.observations as observation (observation.propertyId)}
						<li>
							{observation.description}
							<span class="text-base-content/50 font-mono text-xs">
								{propertyLabel(observation, component.componentId)}
							</span>
						</li>
					{/each}
				</ol>
			</div>
		{/each}
	{/if}
</div>

<h3 class="mt-8 text-lg font-semibold">Provenance projection</h3>

<p class="text-base-content/70 mt-1 max-w-prose text-sm">
	Player-visible fields only: culture, phase and year are occluded and never projected. Stub values
	until 2GN.47.
</p>

<table class="table table-sm mt-2 max-w-md">
	<tbody>
		<tr>
			<th>site</th>
			<td>{provenance.siteName} ({provenance.siteType})</td>
		</tr>
		<tr>
			<th>region</th>
			<td>{provenance.region}</td>
		</tr>
		<tr>
			<th>layer</th>
			<td>{provenance.layer}</td>
		</tr>
		<tr>
			<th>condition</th>
			<td>{provenance.condition}</td>
		</tr>
		<tr>
			<th>deposition</th>
			<td>{provenance.deposition}</td>
		</tr>
		<tr>
			<th>associated finds</th>
			<td>{provenance.associatedFinds.length === 0 ? 'none' : provenance.associatedFinds.join(', ')}</td>
		</tr>
	</tbody>
</table>
