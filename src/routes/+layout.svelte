<script lang="ts">
	import '../app.css';

	let { children } = $props();
</script>

<header>
  <h1>Those Who Came Before</h1>
</header>

{@render children()}

<footer>
  <pre>Concept by <a href="https://github.com/JasonWarrenUK">Jason Warren</a> and Harriet Layhe</pre>
</footer>
