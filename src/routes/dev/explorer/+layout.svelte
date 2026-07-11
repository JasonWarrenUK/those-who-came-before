<script lang="ts">
import { page } from '$app/state';
import { panels } from './panels';
import SeedInput from './SeedInput.svelte';

let { children } = $props();

const milestones = [...new Set(panels.map((panel) => panel.milestone))].sort((a, b) => a - b);
</script>

<div class="flex min-h-screen flex-col">
	<header class="navbar bg-base-200 border-base-300 border-b">
		<div class="flex-1 gap-3">
			<span class="text-lg font-bold">Project Explorer</span>
			<span class="badge badge-neutral badge-sm">dev workbench</span>
		</div>
		<div class="flex-none">
			<SeedInput />
		</div>
	</header>

	<div class="flex flex-1">
		<aside class="bg-base-200 w-56 shrink-0">
			<ul class="menu w-full">
				{#each milestones as milestone (milestone)}
					<li class="menu-title">M{milestone}</li>
					{#each panels.filter((panel) => panel.milestone === milestone) as panel (panel.id)}
						{#if panel.status === 'available'}
							<li>
								<!-- Links carry the query string so the seed (1FD.37) survives panel switches -->
								<a
									href={panel.path + page.url.search}
									class={page.url.pathname === panel.path ? 'menu-active' : ''}
								>
									{panel.label}
								</a>
							</li>
						{:else}
							<li class="menu-disabled">
								<span>{panel.label}</span>
							</li>
						{/if}
					{/each}
				{/each}
			</ul>
		</aside>

		<main class="flex-1 p-6">
			{@render children()}
		</main>
	</div>
</div>
