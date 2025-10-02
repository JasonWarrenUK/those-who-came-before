<script lang="ts">
  import { onMount } from 'svelte';
  import ItemGenerator from '$lib/components/ItemGenerator.svelte';
  import Timeline from '$lib/components/Timeline.svelte';
  import Tasks from '$lib/components/Tasks.svelte';

  onMount(() => {
    console.log('Mounted');
  });
</script>

<main>
  <ItemGenerator />

  <Tasks />

  <Timeline />
</main>
