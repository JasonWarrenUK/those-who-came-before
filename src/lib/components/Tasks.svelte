<script lang="ts">
	import { gameState } from '$lib/stores/gameState.svelte';

	// Reactive computed values for task state
	const discovered = $derived(gameState.itemsUsed.length);
	const remaining = $derived(gameState.itemsAvailable.length);

	const taskState = $derived(() => {
		if (discovered === 0) {
			return {
				title: 'Excavation Mission',
				status: 'To Do',
				badgeClass: 'badge-neutral',
				description: 'Begin your archaeological expedition. Discover your first artifact.'
			};
		} else if (remaining > 2) {
			return {
				title: 'Excavation Mission',
				status: 'In Progress',
				badgeClass: 'badge-info',
				description: `Great progress! You've discovered ${discovered} artifact${discovered === 1 ? '' : 's'}. Keep excavating to find the remaining ${remaining}.`
			};
		} else if (remaining > 0) {
			return {
				title: 'Excavation Mission',
				status: 'Due Soon',
				badgeClass: 'badge-warning',
				description: `Almost there! Only ${remaining} artifact${remaining === 1 ? '' : 's'} left to discover. Complete your collection!`
			};
		} else {
			return {
				title: 'Excavation Mission',
				status: 'Completed',
				badgeClass: 'badge-success',
				description: `Congratulations! All ${discovered} artifacts have been uncovered. Your excavation is complete!`
			};
		}
	});
</script>

<section id="tasks" class="py-4">
	<div id="tasks-header" class="container prose">
		<h2>Current Mission</h2>
	</div>

	<div id="tasks-list" class="container flex flex-row justify-center py-4">
		<div class="card card-border bg-base-300 w-full max-w-2xl">
			<div class="card-body prose">
				<h2 class="card-title">
					{taskState().title}
					<div class="badge {taskState().badgeClass}">
						{taskState().status}
					</div>
				</h2>

				<p>
					{taskState().description}
				</p>
			</div>
		</div>
	</div>
</section>