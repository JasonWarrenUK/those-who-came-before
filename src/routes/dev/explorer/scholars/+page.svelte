<script lang="ts">
/**
 * Scholars panel (roadmap 2GN.149): generates the NPC scholar cohort (`generateNPCScholars`,
 * roadmap 2GN.48) for the current seed against the Explorer's preset cultures and shows one card
 * per scholar. The names panel covers the languages those names are drawn from.
 */
import { goto } from '$app/navigation';
import { page } from '$app/state';
import { getSeed } from '../seed';
import { generateCohort } from './scholarCohort';
import type { CareerStage, ScholarStatus } from '$lib/types/scholars';

const baseSeed = $derived(getSeed(page.url));

const roll = $derived(Number(page.url.searchParams.get('roll') ?? '0'));
const seed = $derived(roll === 0 ? baseSeed : `${baseSeed}-roll${roll}`);

function reroll(): void {
	const url = new URL(page.url);
	url.searchParams.set('roll', String(roll + 1));
	goto(url, { replaceState: true, keepFocus: true, noScroll: true });
}

const model = $derived(generateCohort(seed));

const STAGE: Record<CareerStage, string> = {
	emeritus: 'badge-neutral',
	senior: 'badge-primary',
	mid: 'badge-secondary',
	early: 'badge-accent',
};

const STATUS: Record<ScholarStatus, string> = {
	active: 'badge-success',
	retired: 'badge-ghost',
	deceased: 'badge-error',
};
</script>

<h2 class="text-2xl font-bold">Scholars</h2>

<p class="mt-4 max-w-prose">
	Generates the four NPC scholars whose accumulated work seeds the professional corpus: a name in
	the modern language, a coherent specialisation, the site types they prefer to dig, and a career
	stage dealt as a cohort spread rather than rolled independently.
</p>

<p class="text-base-content/70 mt-2 max-w-prose text-sm">
	Slot 1 is always a senior or emeritus anchor and slot 2 is always early or mid, so every cohort
	has someone who grounds the corpus and someone the player can meet. Culture focus draws from the
	Explorer's four presets standing in for a generated world. Each scholar's
	<code>InterpretiveModel</code> is an identity model for now: its claims arrive with 2GN.49.
</p>

<div class="mt-6 flex flex-wrap items-center gap-4">
	<button type="button" class="btn btn-sm" onclick={reroll}>Re-roll</button>

	<span class="text-sm">
		seed: <code class="bg-base-200 rounded px-1 font-mono">{seed}</code>
	</span>
</div>

<div class="mt-6 grid max-w-5xl gap-4 md:grid-cols-2">
	{#each model.scholars as card, index (card.seed.id)}
		<div class="bg-base-200 rounded-box p-4 text-sm">
			<div class="flex flex-wrap items-baseline gap-2">
				<span class="text-base-content/50 font-mono text-xs">slot {index + 1}</span>
				<span class="text-primary text-lg font-semibold">{card.name}</span>
				<span class="text-base-content/50 text-xs">{card.syllabified}</span>
			</div>

			<div class="mt-2 flex flex-wrap gap-2">
				<span class="badge badge-sm {STAGE[card.seed.careerStage]}">{card.seed.careerStage}</span>
				<span class="badge badge-sm {STATUS[card.seed.status]}">{card.seed.status}</span>
				<span class="badge badge-ghost badge-sm">{card.seed.publicationCount} publications</span>
				<span class="badge badge-ghost badge-sm">{card.bias}</span>
			</div>

			<dl class="mt-3 grid grid-cols-[8rem_1fr] gap-x-2 gap-y-1">
				<dt class="text-base-content/60">specialisation</dt>
				<dd class="font-mono">{card.seed.specialisation.join(', ')}</dd>
				<dt class="text-base-content/60">culture focus</dt>
				<dd>
					{card.cultureFocusLabels.length === 0 ? 'none' : card.cultureFocusLabels.join(', ')}
				</dd>
				<dt class="text-base-content/60">digs</dt>
				<dd class="font-mono">{card.seed.sitePreference.join(', ')}</dd>
			</dl>
		</div>
	{/each}
</div>
