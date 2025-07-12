<script lang="ts">
  import { onMount } from 'svelte';
  import Timeline from '$lib/components/Timeline.svelte';
  import Tasks from '$lib/components/Tasks.svelte';
  
  onMount(() => {
    console.log('Mounted');
  });
</script>

<main>
  <Tasks />

  <Timeline />
</main>
