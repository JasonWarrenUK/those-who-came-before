/**
 * MVP plausibility rules (doc 05 §6.2, roadmap 2GN.11; material-structural rules roadmap 2GN.15).
 *
 * The four worked examples doc 05 §6.2 gives, encoded as `ergonomic`/`material-physics` predicate
 * rules (`types/plausibility.ts`) rather than the declarative `requires`/`excludes`/`ordering`
 * variants: each example turns on a component *property* (an edge, a wall thickness, a join type),
 * not a relationship between whole primitives, so only the predicate variants can express them
 * faithfully. The declarative variants are shipped in the type but have no MVP instances here —
 * see the note above `PLAUSIBILITY_RULES` below.
 *
 * The first four are grip/rigidity/load-bearing proxies rather than the real thing: a proper
 * component-role/classification vocabulary doesn't exist yet (roadmap 2GN.116, still open), so
 * each predicate approximates with what `NormalisedArtefact` already carries (component count,
 * `sheet-form`/`bar-form` presence, `flexibility`/`wall` properties). MVP-provisional per the
 * `data/grammars/core.ts` precedent — expected to be replaced or tightened once 2GN.116 lands.
 *
 * The last two check genuine material-structural compatibility (roadmap 2GN.15) rather than a
 * proxy: whether a join's target component's `allowedMaterialTags` admits any material physically
 * capable of the join at all. This has no doc 05 §6.2 example behind it — ruled directly against
 * `MATERIALS`' measured property ranges per tag, not authored, since plausibility runs before
 * Stage 6 material assignment and so can only reason about what a component *could* be made from.
 * These two rules check a different physical fact from the existing `hasRigidShaft` proxy (rules
 * 3/4 above gate on `perpendicular`/`lashed` + heavy mass; the new rules gate on
 * `riveted`/`threaded`/`hinged`/`wrapped` regardless of mass), so they don't double-check the same
 * join.
 *
 * This module is static data only, no behaviour — `checkPlausibility` (roadmap 2GN.12) is the
 * consumer that iterates this array and applies it.
 */

import type { PlausibilityRule } from '../types/plausibility.ts';
import type {
	MaterialDefinition,
	NormalisedArtefact,
	NormalisedComponent,
} from '../types/artefact.ts';
import { MATERIALS } from './materials.ts';

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
 * The join types (doc 05 §5.3's nine `<attachment>` terminals) checked against a component's
 * material *possibility* rather than a physical proxy (roadmap 2GN.15). Plausibility runs at
 * Stage 5, before material assignment (Stage 6), so these can only ask "could this component be
 * made from something that supports this join at all" — a component whose entire
 * `allowedMaterialTags` set fails the demand can never satisfy it, whichever material Stage 6
 * eventually draws.
 *
 * `riveted`/`threaded`/`hinged` all demand a material class that holds a drilled, tapped or
 * pivoting metal fastener without crumbling: `rigidity >= 5` clears every catalogue tag except
 * `fiber` and `leather`, whose only members today (linen 1, leather 2) have nothing to drill
 * into. `wrapped` demands
 * the opposite: a material that flexes around a substrate, which is what `rigidity` measures —
 * `fragility` was deliberately not used as an alternate/OR axis here, even though it looks
 * related: `fragility` is crack-proneness, not bendability, and jade's `fragility: 2` (rarely
 * shatters) alongside `rigidity: 7` (stone-hard, cannot bend) would have wrongly passed a rigid
 * stone as "wrappable" under an OR test. `fragility` is also currently authored against the
 * *finished* state (roadmap 2GN.105, still open, will re-author it to the *working* state
 * `computeLayerGrade` actually needs), so even a bendability-flavoured fragility reading would be
 * measuring the wrong moment today. `inline`, `socketed`, `friction-fit` and `lashed` carry no
 * distinct derivable threshold: `inline` and `socketed` demand fit tolerance, not a material
 * class; `friction-fit` likewise; `lashed` is already covered structurally by the doc 05 §6.2
 * example 3 rule below (`hasPerpendicularOrLashedAttachment` + `hasRigidShaft`), and duplicating
 * it here would double-gate the same physical fact through a different proxy.
 *
 * ⚠️ Revisit both thresholds once 2GN.105 lands: 2GN.111 *ruled* that `rigidity` should gain a
 * per-state shape (`{ worked, finished }`), but 2GN.105 (still open) is what implements it —
 * `physicalProperties.rigidity` is a plain scalar today, which is why these rules typecheck
 * against it directly. Once 2GN.105 lands, confirm which state the plausibility question
 * actually wants before wiring these rules to the new shape, and it may become worth
 * reintroducing `fragility` as a genuine second axis once its values describe the working
 * state. Filed as roadmap 2GN.141.
 */
const RIGID_FASTENER_JOINS: ReadonlySet<NormalisedArtefact['attachments'][number]['type']> =
	new Set(['riveted', 'threaded', 'hinged']);

/** Minimum `rigidity` a material needs to hold a drilled, tapped or pivoting fastener. */
const RIGID_FASTENER_MIN_RIGIDITY = 5;

/** At or below this `rigidity`, a material can flex around a substrate. */
const WRAPPABLE_MAX_RIGIDITY = 2;

/**
 * Whether any material carrying one of `component`'s `allowedMaterialTags` clears `predicate` —
 * i.e. whether the join demand is achievable by *some* material this component could still be
 * assigned, not a specific one. An empty `allowedMaterialTags` (no constraint recorded) is
 * permissive: every material is a candidate, so the demand is trivially achievable.
 */
function someCompatibleMaterialSatisfies(
	component: NormalisedComponent,
	predicate: (material: MaterialDefinition) => boolean,
): boolean {
	if (component.allowedMaterialTags.length === 0) return true;
	return MATERIALS.some(
		(material) =>
			material.tags.some((tag) => component.allowedMaterialTags.includes(tag)) &&
			predicate(material),
	);
}

/**
 * Whether `artefact` has a rigid-fastener join (`RIGID_FASTENER_JOINS`) where either component's
 * `allowedMaterialTags` admits no material stiff enough to hold it. `fromComponentId`/
 * `toComponentId` record tree position (parent/child), not physical role, so a rivet through both
 * members needs both endpoints checked, not just the child.
 */
function hasUnrigidFastenerJoin(artefact: NormalisedArtefact): boolean {
	const byId = new Map(artefact.components.map((component) => [component.id, component]));
	return artefact.attachments.some((attachment) => {
		if (!RIGID_FASTENER_JOINS.has(attachment.type)) return false;
		const from = byId.get(attachment.fromComponentId);
		const to = byId.get(attachment.toComponentId);
		const isRigid = (component: NormalisedComponent) =>
			someCompatibleMaterialSatisfies(
				component,
				(material) => material.physicalProperties.rigidity >= RIGID_FASTENER_MIN_RIGIDITY,
			);
		return (from !== undefined && !isRigid(from)) || (to !== undefined && !isRigid(to));
	});
}

/**
 * Whether `artefact` has a `wrapped` join where neither component's `allowedMaterialTags` admits
 * a material flexible enough to wrap: `rigidity` at or below `WRAPPABLE_MAX_RIGIDITY` clears it
 * (see `RIGID_FASTENER_JOINS`'s comment for why `fragility` is deliberately not used here).
 * Wrapping needs exactly one flexible member, not both — a leather strap around a stone core is
 * legitimate — so this only flags a join where *neither* endpoint can flex, not either.
 * `fromComponentId`/`toComponentId` record tree position, not which side does the wrapping, so
 * "either" would wrongly flag that legitimate case whenever the parent happens to be rigid.
 */
function hasUnwrappableJoin(artefact: NormalisedArtefact): boolean {
	const byId = new Map(artefact.components.map((component) => [component.id, component]));
	return artefact.attachments.some((attachment) => {
		if (attachment.type !== 'wrapped') return false;
		const from = byId.get(attachment.fromComponentId);
		const to = byId.get(attachment.toComponentId);
		const isFlexible = (component: NormalisedComponent) =>
			someCompatibleMaterialSatisfies(
				component,
				(material) => material.physicalProperties.rigidity <= WRAPPABLE_MAX_RIGIDITY,
			);
		const fromFlexible = from === undefined || isFlexible(from);
		const toFlexible = to === undefined || isFlexible(to);
		return !fromFlexible && !toFlexible;
	});
}

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

	/**
	 * Material-structural compatibility (roadmap 2GN.15, no doc 05 §6.2 example): a `riveted`,
	 * `threaded` or `hinged` join's target component must be possibly makeable from a material
	 * rigid enough to hold the fastener, checked against `allowedMaterialTags` rather than an
	 * assigned material (plausibility runs before Stage 6 material assignment).
	 */
	{
		type: 'material-physics',
		predicate: hasUnrigidFastenerJoin,
		reason: 'a riveted, threaded or hinged join needs a material rigid enough to hold the fastener',
	},

	/**
	 * Material-structural compatibility (roadmap 2GN.15, no doc 05 §6.2 example): a `wrapped`
	 * join's target component must be possibly makeable from a material flexible enough to wrap
	 * around a substrate, checked against `allowedMaterialTags`.
	 */
	{
		type: 'material-physics',
		predicate: hasUnwrappableJoin,
		reason: 'a wrapped join needs a material flexible enough to wrap around its substrate',
	},
];
