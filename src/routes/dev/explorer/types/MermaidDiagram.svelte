<script lang="ts">
/**
 * Renders a mermaid source string to inline SVG. Client-only by construction: $effect never runs
 * during SSR, and the mermaid package (~2 MB) is dynamically imported so it lands in its own lazy
 * chunk, loaded the first time a diagram actually renders and never touching other panels.
 */

let { source }: { source: string } = $props();

let container: HTMLElement | undefined = $state();
let renderError = $state('');

// mermaid.render needs a document-unique element id per call.
let renderCounter = 0;

$effect(() => {
	const currentSource = source;
	const element = container;
	if (!element) return;

	let cancelled = false;

	(async () => {
		const mermaid = (await import('mermaid')).default;
		mermaid.initialize({ startOnLoad: false, theme: 'neutral' });
		try {
			const { svg } = await mermaid.render(`type-index-diagram-${renderCounter++}`, currentSource);
			if (!cancelled) {
				element.innerHTML = svg;
				renderError = '';
			}
		} catch (error) {
			if (!cancelled) renderError = String(error);
		}
	})();

	return () => {
		cancelled = true;
	};
});
</script>

{#if renderError}
	<div class="alert alert-error text-sm">diagram failed to render: {renderError}</div>
{/if}
<div bind:this={container} class="overflow-x-auto"></div>
