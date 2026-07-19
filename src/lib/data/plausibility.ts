/**
 * MVP plausibility rules (doc 05 §6.2, roadmap 2GN.11).
 *
 * The four worked examples doc 05 §6.2 gives, encoded as `ergonomic`/`material-physics` predicate
 * rules (`types/plausibility.ts`) rather than the declarative `requires`/`excludes`/`ordering`
 * variants: each example turns on a component *property* (an edge, a wall thickness, a join type),
 * not a relationship between whole primitives, so only the predicate variants can express them
 * faithfully. The declarative variants are shipped in the type but have no MVP instances here —
 * see the note above `PLAUSIBILITY_RULES` below.
 *
 * All four are grip/rigidity/load-bearing proxies rather than the real thing: material rigidity
 * (2GN.23) and a proper component-role/classification vocabulary don't exist yet, so each
 * predicate approximates with what `NormalisedArtefact` already carries (component count,
 * `sheet-form`/`bar-form` presence, `flexibility`/`wall` properties). MVP-provisional per the
 * `data/grammars/core.ts` precedent — expected to be replaced or tightened once 2GN.12's checker
 * is observable in the Explorer (2GN.58) and once material assignment (2GN.23) lands.
 *
 * This module is static data only, no behaviour — `checkPlausibility` (roadmap 2GN.12) is the
 * consumer that iterates this array and applies it.
 */

import type { PlausibilityRule } from '../types/plausibility.ts';
import type { NormalisedArtefact, NormalisedComponent } from '../types/artefact.ts';

/** Components of a given primitive type, in flattened order. */
function componentsOf(
	artefact: NormalisedArtefact,
	primitiveType: string,
): NormalisedComponent[] {
	return artefact.components.filter((component) => component.primitiveType === primitiveType);
}

/** Whether any `elongated` component carries a single or double cutting edge. */
function hasEdgedElongated(artefact: NormalisedArtefact): boolean {
	return componentsOf(artefact, 'elongated').some((component) => {
		const edge = component.properties.get('edge');
		return edge === 'single' || edge === 'double';
	});
}

/**
 * MVP grip proxy: whether the artefact has a second component beyond the edged form itself. A
 * true grip/haft concept needs a component-role vocabulary this project doesn't have yet (see
 * module comment) — this stands in for "something else to hold onto".
 */
function hasGrippableSecondComponent(artefact: NormalisedArtefact): boolean {
	return artefact.components.length > 1;
}

/**
 * MVP long-grip proxy: whether some OTHER component with a `length` of `'medium'` or `'long'`
 * exists besides the long edged blade itself — a blade cannot satisfy its own grip requirement by
 * counting itself. Restricted to `elongated`, `cylindrical` and `bar-form` components since those
 * are the only primitives with a haft-shaped long axis; a `disc-form` or `ring-form` component
 * existing elsewhere on the artefact says nothing about grip length.
 */
function hasAdequateGripLength(artefact: NormalisedArtefact, blade: NormalisedComponent): boolean {
	const GRIP_SHAPED_PRIMITIVES = new Set(['elongated', 'cylindrical', 'bar-form']);
	return artefact.components.some((component) => {
		if (component === blade) return false;
		if (!GRIP_SHAPED_PRIMITIVES.has(component.primitiveType)) return false;
		const length = component.properties.get('length');
		return length === 'medium' || length === 'long';
	});
}

/** Whether the artefact has a `perpendicular` or `lashed` attachment. */
function hasPerpendicularOrLashedAttachment(artefact: NormalisedArtefact): boolean {
	return artefact.attachments.some(
		(attachment) => attachment.type === 'perpendicular' || attachment.type === 'lashed',
	);
}

/**
 * MVP rigid-shaft proxy: whether any `sheet-form` or `bar-form` component carries `flexibility`
 * `'rigid'`, or is a `bar-form` (solid stock, rigid by construction — it has no `flexibility`
 * parameter of its own; see `data/grammars/primitives.ts`).
 */
function hasRigidShaft(artefact: NormalisedArtefact): boolean {
	return artefact.components.some((component) => {
		if (component.primitiveType === 'bar-form') return true;
		if (component.primitiveType !== 'sheet-form') return false;
		return component.properties.get('flexibility') === 'rigid';
	});
}

/** Whether any `hollow-enclosed` component's `wall` property is `'thin'`. */
function hasThinWalledHollow(artefact: NormalisedArtefact): boolean {
	return componentsOf(artefact, 'hollow-enclosed').some(
		(component) => component.properties.get('wall') === 'thin',
	);
}

const HEAVY_MASSES: ReadonlySet<NormalisedArtefact['dimensions']['mass']> = new Set([
	'heavy',
	'very-heavy',
]);

/**
 * The shipped plausibility rules. `requires`/`excludes`/`ordering` instances are deliberately
 * absent for MVP: every doc 05 §6.2 example turns on a component property, not a primitive-to-
 * primitive relationship, so the declarative variants have nothing faithful to encode yet. They
 * await a component-role/classification vocabulary (a future task) — see the module comment.
 */
export const PLAUSIBILITY_RULES: readonly PlausibilityRule[] = [
	/**
	 * Doc 05 §6.2 example 1: "An edged elongated form requires a grippable component (you can't
	 * use a blade without holding something)."
	 */
	{
		type: 'ergonomic',
		predicate: (artefact) => hasEdgedElongated(artefact) && !hasGrippableSecondComponent(artefact),
		reason: 'an edged blade needs something to grip',
	},

	/**
	 * Doc 05 §6.2 example 2: "Long edged forms require at least medium grip length (ergonomics)."
	 */
	{
		type: 'ergonomic',
		predicate: (artefact) =>
			componentsOf(artefact, 'elongated').some((c) => {
				const edge = c.properties.get('edge');
				return (edge === 'single' || edge === 'double') &&
					c.properties.get('length') === 'long' &&
					!hasAdequateGripLength(artefact, c);
			}),
		reason: 'a long blade needs at least a medium-length grip',
	},

	/**
	 * Doc 05 §6.2 example 3: "Perpendicular attachment of a heavy component requires a rigid shaft
	 * (you can't lash a stone hammer head to a cord)." `lashed` is included alongside
	 * `perpendicular` since a lashed join is exactly the failure case the example names.
	 */
	{
		type: 'material-physics',
		predicate: (artefact) =>
			HEAVY_MASSES.has(artefact.dimensions.mass) &&
			hasPerpendicularOrLashedAttachment(artefact) &&
			!hasRigidShaft(artefact),
		reason: 'a heavy perpendicular or lashed head needs a rigid shaft',
	},

	/**
	 * Doc 05 §6.2 example 4: "Heavy components on top of thin-walled hollow forms are structurally
	 * implausible."
	 */
	{
		type: 'material-physics',
		predicate: (artefact) =>
			HEAVY_MASSES.has(artefact.dimensions.mass) && hasThinWalledHollow(artefact),
		reason: 'a heavy component on a thin-walled hollow form is structurally implausible',
	},
];
