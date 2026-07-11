<script lang="ts">
import { panels } from './panels';
</script>

<h2 class="text-2xl font-bold">Overview</h2>

<p class="mt-4 max-w-prose">
	The Project Explorer is the developer workbench for Those Who Came Before. It is not the player
	UI: each milestone adds panels here so every system can be generated, inspected and verified
	before anything downstream consumes it.
</p>

<div class="mt-6 overflow-x-auto">
	<table class="table max-w-xl">
		<thead>
			<tr>
				<th>Panel</th>
				<th>Milestone</th>
				<th>Status</th>
			</tr>
		</thead>
		<tbody>
			{#each panels as panel (panel.id)}
				<tr>
					<td>
						{#if panel.status === 'available'}
							<a href={panel.path} class="link">{panel.label}</a>
						{:else}
							{panel.label}
						{/if}
					</td>
					<td>M{panel.milestone}</td>
					<td>
						{#if panel.status === 'available'}
							<span class="badge badge-success badge-sm">available</span>
						{:else}
							<span class="badge badge-ghost badge-sm">planned</span>
						{/if}
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
