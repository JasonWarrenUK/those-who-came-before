// Syntax highlighting for inline TS code blocks. Shared across every site/ page.
(function () {
	const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
	const RE =
		/(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|('(?:[^'\\\n]|\\.)*'|"(?:[^"\\\n]|\\.)*")|\b(interface|type|function|return|const|let|readonly|export|extends|throws?|new|typeof|keyof|in|of|if|else)\b|\b(\d+(?:\.\d+)?)\b|\b([A-Z][A-Za-z0-9]+)\b/g;
	document.querySelectorAll("pre code.lang-ts").forEach((el) => {
		el.innerHTML = esc(el.textContent).replace(RE, (m, c, s, k, n, t) =>
			c ? `<span class="c">${c}</span>` :
			s ? `<span class="s">${s}</span>` :
			k ? `<span class="k">${k}</span>` :
			n ? `<span class="n">${n}</span>` :
			`<span class="t">${t}</span>`);
	});
})();
