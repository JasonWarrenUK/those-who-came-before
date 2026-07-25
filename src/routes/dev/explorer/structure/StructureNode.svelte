<script lang="ts">
/** One recursive row of the structure viewer's tree — a component plus its attached children. */
import type { StructureTreeNode } from './structureTree';
import StructureNode from './StructureNode.svelte';

let { node, loose = false }: { node: StructureTreeNode; loose?: boolean } = $props();
</script>

<div class="pl-4">
	<div class="flex flex-wrap items-baseline gap-2">
		{#if node.joinType}
			<span class="badge badge-info badge-sm">{node.joinType}</span>
		{/if}
		<span class="text-primary font-semibold">{node.shortId}</span>
		<span class="text-secondary">{node.component.primitiveType}</span>
		<span class="text-base-content/80">{node.prose}</span>
		{#if loose}
			<span class="badge badge-warning badge-sm">loose</span>
		{/if}
	</div>

	{#each node.children as child (child.component.id)}
		<StructureNode node={child} />
	{/each}
</div>
