/**
 * Prose rendering of a `NormalisedComponent`'s parameters (doc 05 §5.3), shared between the
 * `scripts/dev/sample-*.ts` CLI samplers and the Project Explorer's structure viewer (roadmap
 * 2GN.57) — both need the same rendered sentence, so it lives under `engine/` rather than
 * duplicated or imported cross-boundary from `scripts/dev/` (which Vite refuses to serve to the
 * browser; it sits outside the project's served roots).
 *
 * Thin wrapper over `engine/generation/description.ts` (roadmap 2GN.38), which now owns the single
 * selection path (register, condition, material gate) and the provisional `#slot#` expander this
 * file used to hold directly. `describeProse` renders the observational register only, with no
 * material known (dev tooling runs ahead of material assignment) — material-gated variants fail
 * closed and never fire here, matching this function's pre-2GN.38 value-gate-only behaviour
 * exactly. Real template expansion beyond this (property slots, decorative sublayer composition)
 * is `engine/generation/description.ts`'s job at roadmap 2GN.39, which supersedes this once it
 * lands.
 *
 * Pure and framework-free per the engine boundary (doc 08 §2.1): no console output, no CLI
 * concerns — `printAnatomy` in `scripts/dev/shared.ts` owns those.
 */

import type { NormalisedComponent } from '../../types/artefact.ts';
import { OBSERVATIONAL_TEMPLATES } from '../../data/descriptions/observational/index.ts';
import { expand, selectVariant, SLOT_PATTERN } from './description.ts';

export { SLOT_PATTERN };

/** Short display id for a component: its position along the primary axis (`c0`, `c1`…). */
export function shortId(component: NormalisedComponent): string {
	return `c${component.position}`;
}

/**
 * Prose rendering of a component's parameters; raw `key=value` for unknown primitives.
 */
export function describeProse(component: NormalisedComponent): string {
	const templates = OBSERVATIONAL_TEMPLATES.filter((t) =>
		t.property.startsWith(`${component.primitiveType}.`)
	);
	if (templates.length === 0) {
		return [...component.properties.entries()].map(([k, v]) => `${k}=${v}`).join(', ');
	}
	return templates
		.map((t) => selectVariant(t, 'observational', component.properties, undefined))
		.filter((v): v is NonNullable<typeof v> => v !== undefined)
		.map((v) => expand(v.template, component.properties))
		.filter((sentence): sentence is string => sentence !== undefined)
		.join(' ');
}
