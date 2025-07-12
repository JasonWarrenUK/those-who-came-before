<script lang="ts">
  import { onMount } from 'svelte';
  import Timeline from '../../backlog/components/Timeline.svelte';
  import Tasks from '../../backlog/components/Tasks.svelte';
  
  onMount(() => {
    console.log('Mounted');
  });
</script>

<main>
  <Tasks />

  <Timeline />
</main>
