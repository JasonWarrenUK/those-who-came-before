<script lang="ts">
	import { itemCreateSet } from '$lib/services/itemGenerator';
	import { gameState } from '$lib/stores/gameState.svelte';
	import type { GeneratedItem } from '$lib/types/item';

	let generatedItems = $state<GeneratedItem[]>([]);
	let itemCount = $state<number>(5);

	function handleGenerate() {
		generatedItems = itemCreateSet(itemCount);
	}

	function handleReset() {
		gameState.reset();
		generatedItems = [];
	}
</script>

<section id="item-generator" class="py-4">
	<div id="generator-header" class="container prose">
		<h2>Item Generator</h2>
		<p>Generate archaeological artifacts from those who came before</p>
	</div>

	<div id="generator-stats" class="container py-2">
		<div class="stats shadow">
			<div class="stat">
				<div class="stat-title">Items Available</div>
				<div class="stat-value">{gameState.itemsAvailable.length}</div>
			</div>
			<div class="stat">
				<div class="stat-title">Items Discovered</div>
				<div class="stat-value">{gameState.itemsUsed.length}</div>
			</div>
		</div>
	</div>

	<div id="generator-controls" class="container flex flex-row gap-4 py-4">
		<label class="form-control w-full max-w-xs">
			<div class="label">
				<span class="label-text">Number of items</span>
			</div>
			<input
				type="number"
				bind:value={itemCount}
				min="1"
				max="20"
				class="input input-bordered w-full max-w-xs"
			/>
		</label>

		<button
			onclick={handleGenerate}
			class="btn btn-primary self-end"
			disabled={gameState.itemsAvailable.length === 0}
		>
			Generate Artifacts
		</button>

		<button onclick={handleReset} class="btn btn-secondary self-end">
			Reset Game
		</button>
	</div>

	{#if generatedItems.length > 0}
		<div id="generator-output" class="container">
			<div class="card bg-base-200">
				<div class="card-body">
					<h3 class="card-title">Discovered Artifacts</h3>
					<ul class="list-disc list-inside space-y-2">
						{#each generatedItems as item}
							<li class="text-lg capitalize">{item.material} {item.type}</li>
						{/each}
					</ul>
				</div>
			</div>
		</div>
	{/if}

	{#if gameState.itemsAvailable.length === 0}
		<div id="generator-complete" class="container py-4">
			<div class="alert alert-success">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="stroke-current shrink-0 h-6 w-6"
					fill="none"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
				<span>All artifacts have been discovered! Click Reset Game to start over.</span>
			</div>
		</div>
	{/if}
</section>
