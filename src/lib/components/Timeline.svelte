<script lang="ts">
	import { gameState } from '$lib/stores/gameState.svelte';
</script>

<section id="timeline" class="container py-4">
	<div id="timeline-header" class="container prose">
		<h2>Discovery Timeline</h2>
		<p>A record of artifacts discovered from those who came before</p>
	</div>

	{#if gameState.itemsUsed.length === 0}
		<div id="timeline-empty" class="container py-4">
			<div class="alert alert-info">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					class="stroke-current shrink-0 w-6 h-6"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
					></path>
				</svg>
				<span>No artifacts discovered yet. Generate some items to begin your excavation!</span>
			</div>
		</div>
	{:else}
		<div id="timeline-list" class="container">
			<ul class="timeline timeline-vertical">
				{#each gameState.itemsUsed as item, index}
					<li>
						{#if index > 0}
							<hr class="bg-primary" />
						{/if}
						<div class="timeline-middle">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 20 20"
								fill="currentColor"
								class="text-primary h-5 w-5"
							>
								<path
									fill-rule="evenodd"
									d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
									clip-rule="evenodd"
								/>
							</svg>
						</div>
						{#if index % 2 === 0}
							<div class="timeline-start timeline-box capitalize">
								<strong>{item.material} {item.type}</strong>
								<div class="text-sm opacity-70">Discovery #{index + 1}</div>
							</div>
						{:else}
							<div class="timeline-end timeline-box capitalize">
								<strong>{item.material} {item.type}</strong>
								<div class="text-sm opacity-70">Discovery #{index + 1}</div>
							</div>
						{/if}
						{#if index < gameState.itemsUsed.length - 1}
							<hr class="bg-primary" />
						{/if}
					</li>
				{/each}
			</ul>
		</div>
	{/if}
</section>