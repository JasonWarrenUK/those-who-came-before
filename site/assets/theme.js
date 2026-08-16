// Wires the topbar theme toggle. The initial theme is already applied before this file
// loads, by a small inline script in <head> (see any page's <head> for it) — that one has
// to be inline and blocking so the page never paints in the wrong theme first. This file
// just handles clicks, keeps localStorage in sync, and keeps the icon honest.
(function () {
	var STORAGE_KEY = "twcb-theme";
	var btn = document.getElementById("theme-toggle");
	if (!btn) return;
	var icon = btn.querySelector(".tt-icon");

	function systemPrefersDark() {
		return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
	}
	function stored() {
		try {
			return localStorage.getItem(STORAGE_KEY);
		} catch (e) {
			return null;
		}
	}
	function current() {
		var s = stored();
		if (s === "dark" || s === "light") return s;
		return systemPrefersDark() ? "dark" : "light";
	}
	function apply(theme) {
		document.documentElement.setAttribute("data-theme", theme);
		btn.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
		if (icon) icon.textContent = theme === "dark" ? "☀" : "☾";
	}

	apply(current());

	btn.addEventListener("click", function () {
		var next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
		try {
			localStorage.setItem(STORAGE_KEY, next);
		} catch (e) {}
		apply(next);
	});
})();
