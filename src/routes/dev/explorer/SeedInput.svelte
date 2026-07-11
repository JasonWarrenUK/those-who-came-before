<script lang="ts">
import { goto } from '$app/navigation';
import { page } from '$app/state';
import { DEFAULT_SEED, getSeed } from './seed';

const urlSeed = $derived(getSeed(page.url));

// Local draft so typing doesn't fight the URL round-trip; resynced whenever the URL seed
// changes from elsewhere (back/forward navigation, pasted link).
let draft = $state(getSeed(page.url));

$effect(() => {
	draft = urlSeed;
});

function commitSeed(): void {
	const seed = draft.trim();
	const url = new URL(page.url);

	if (seed === '' || seed === DEFAULT_SEED) {
		url.searchParams.delete('seed');
	} else {
		url.searchParams.set('seed', seed);
	}

	goto(url, { replaceState: true, keepFocus: true, noScroll: true });
}
</script>

<label class="input input-sm input-bordered flex items-center gap-2">
	<span class="label-text font-semibold">Seed</span>
	<input
		type="text"
		class="grow font-mono"
		placeholder={DEFAULT_SEED}
		bind:value={draft}
		onchange={commitSeed}
		onkeydown={(event) => {
			if (event.key === 'Enter') commitSeed();
		}}
	/>
</label>
