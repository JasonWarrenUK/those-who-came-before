<script lang="ts">
	import '../app.css';
	import Header from '../../backlog/components/Header.svelte';
	import Footer from '../../backlog/components/Footer.svelte';

	let { children } = $props();
</script>

<Header />

{@render children()}

<Footer />