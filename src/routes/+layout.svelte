<script>
	import '../app.css';
	let { children } = $props();
</script>

<div class="min-h-screen flex flex-col">
	<header class="navbar bg-base-200">
		<div class="flex-1">
			<a href="/" class="btn btn-ghost text-xl">Those Who Came Before</a>
		</div>
		<div class="flex-none">
			<a href="/dev/explorer" class="btn btn-sm btn-outline">Explorer</a>
		</div>
	</header>

	<main class="flex-1 container mx-auto p-4">
		{@render children()}
	</main>

	<footer class="footer footer-center p-4 bg-base-200 text-base-content">
		<p>Created by <a href="https://github.com/JasonWarrenUK" class="link">Jason Warren</a> & Harriet Layhe</p>
	</footer>
</div>
