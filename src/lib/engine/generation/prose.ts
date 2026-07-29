/**
 * Prose rendering of a `NormalisedComponent`'s parameters (doc 05 §5.3), shared between the
 * `scripts/dev/sample-*.ts` CLI samplers and the Project Explorer's structure viewer (roadmap
 * 2GN.57) — both need the same rendered sentence, so it lives under `engine/` rather than
 * duplicated or imported cross-boundary from `scripts/dev/` (which Vite refuses to serve to the
 * browser; it sits outside the project's served roots).
 *
 * Renders against `OBSERVATIONAL_TEMPLATES` (`data/descriptions/observational/`, roadmap 2GN.35)
 * rather than hand-written phrase builders, so the dev tooling's voice and the eventual description
 * engine's observational register never drift apart. The `#slot#`/`#slot.a#` expander below is
 * deliberately minimal — real template expansion (variant selection, register/lens filtering,
 * decorative sublayer composition) is `engine/generation/description.ts`'s job (roadmap 2GN.39),
 * which supersedes this once it lands.
 *
 * Pure and framework-free per the engine boundary (doc 08 §2.1): no console output, no CLI
 * concerns — `printAnatomy` in `scripts/dev/shared.ts` owns those.
 */

import type { NormalisedComponent } from '../../types/artefact.ts';
import { OBSERVATIONAL_TEMPLATES } from '../../data/descriptions/observational/index.ts';

/** Short display id for a component: its position along the primary axis (`c0`, `c1`…). */
export function shortId(component: NormalisedComponent): string {
	return `c${component.position}`;
}

const VOWEL_SOUND = /^[aeiou]/i;

/** Matches `#slot#` and `#slot.a#` placeholders; shared with `index.test.ts`'s slot-id extraction. */
export const SLOT_PATTERN = /#([a-zA-Z][\w-]*?)(\.a)?#/g;

/** Prefixes a value with "a"/"an" per its leading sound. */
function withArticle(value: string): string {
	return `${VOWEL_SOUND.test(value) ? 'an' : 'a'} ${value}`;
}

/**
 * Expands `#slot#` and `#slot.a#` placeholders against a component's raw property values.
 * `undefined` when any referenced slot is absent or `'none'` — the whole sentence is dropped
 * rather than rendered with a hole, matching doc 05 §5.3's per-primitive parameter scoping (a
 * template only ever references its own primitive's parameters, per the 2GN.35 authoring contract).
 */
function expand(template: string, properties: Map<string, string | number>): string | undefined {
	let sawNoneOrMissing = false;
	const expanded = template.replace(
		SLOT_PATTERN,
		(_match, slot: string, article) => {
			const value = properties.get(slot);
			if (value === undefined || value === 'none') {
				sawNoneOrMissing = true;
				return '';
			}
			return article ? withArticle(String(value)) : String(value);
		},
	);
	if (sawNoneOrMissing) return undefined;
	return expanded.charAt(0).toUpperCase() + expanded.slice(1);
}

/**
 * Prose rendering of a component's parameters; raw `key=value` for unknown primitives.
 *
 * Always renders `variants[0]` — 2GN.35's templates author exactly one variant per property, so
 * there's nothing to select between yet. Variant selection by lens/hypothesis alignment (roadmap
 * 2GN.38) will need to replace this indexing once a property can carry more than one.
 */
export function describeProse(component: NormalisedComponent): string {
	const templates = OBSERVATIONAL_TEMPLATES.filter((t) =>
		t.property.startsWith(`${component.primitiveType}.`)
	);
	if (templates.length === 0) {
		return [...component.properties.entries()].map(([k, v]) => `${k}=${v}`).join(', ');
	}
	return templates
		.map((t) => expand(t.variants[0].template, component.properties))
		.filter((sentence): sentence is string => sentence !== undefined)
		.join(' ');
}
