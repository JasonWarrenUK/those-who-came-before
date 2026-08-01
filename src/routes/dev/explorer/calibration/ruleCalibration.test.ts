/// <reference lib="deno.ns" />
import { assert, assertEquals } from '@std/assert';
import { calibrateRules, SATURATION_CEILING } from './ruleCalibration.ts';
import { EXPLORER_CULTURES } from '../../../../lib/data/explorer-cultures.ts';
import { CLASSIFICATION_RULES } from '../../../../lib/data/classification.ts';

const [culture] = EXPLORER_CULTURES;

Deno.test('calibrateRules: same seed and count produce an identical report', () => {
	const a = calibrateRules('determinism', culture, 40);
	const b = calibrateRules('determinism', culture, 40);

	assertEquals(a, b);
});

Deno.test('calibrateRules: a different seed produces a different report', () => {
	const a = calibrateRules('seed-a', culture, 60);
	const b = calibrateRules('seed-b', culture, 60);

	assert(
		a.rules.some((rule, index) => rule.fireCount !== b.rules[index].fireCount),
		'two different seeds gave identical fire counts across every rule',
	);
});

Deno.test('calibrateRules: reports one entry per shipped rule, in rule order', () => {
	const report = calibrateRules('order', culture, 20);

	assertEquals(report.rules.length, CLASSIFICATION_RULES.length);
	report.rules.forEach((rule, index) => {
		assertEquals(rule.ruleIndex, index);
		assertEquals(rule.label, `R${index + 1}`);
	});
});

Deno.test('calibrateRules: fire counts never exceed the sample size', () => {
	const report = calibrateRules('bounds', culture, 50);

	assertEquals(report.sampleSize, 50);
	for (const rule of report.rules) {
		assert(rule.fireCount >= 0 && rule.fireCount <= 50, `${rule.label} counted ${rule.fireCount}`);
		assert(rule.firePercent >= 0 && rule.firePercent <= 100);
	}
});

Deno.test('calibrateRules: firePercent is fireCount as a share of the sample', () => {
	const report = calibrateRules('percent', culture, 25);

	for (const rule of report.rules) {
		assertEquals(rule.firePercent, (rule.fireCount / 25) * 100);
	}
});

Deno.test('calibrateRules: verdict follows the documented thresholds', () => {
	const report = calibrateRules('verdicts', culture, 80);

	for (const rule of report.rules) {
		if (rule.firePercent === 0) assertEquals(rule.verdict, 'dormant');
		else if (rule.firePercent > SATURATION_CEILING) assertEquals(rule.verdict, 'saturated');
		else assertEquals(rule.verdict, 'discriminating');
	}
});

Deno.test('calibrateRules: saturated and dormant lists agree with the per-rule verdicts', () => {
	const report = calibrateRules('lists', culture, 80);

	assertEquals(
		report.saturatedRules.map((rule) => rule.ruleIndex),
		report.rules.filter((rule) => rule.verdict === 'saturated').map((rule) => rule.ruleIndex),
	);
	assertEquals(
		report.dormantRules.map((rule) => rule.ruleIndex),
		report.rules.filter((rule) => rule.verdict === 'dormant').map((rule) => rule.ruleIndex),
	);
});

/**
 * The panel exists to surface exactly this: the any-decoration nudge is documented as deliberately
 * universal (doc 12 §2.24), so it should read `saturated` and be visible as such rather than hidden.
 */
Deno.test('calibrateRules: the deliberately-universal nudge shows up as saturated', () => {
	const report = calibrateRules('universal', culture, 100);
	const anyDecoration = report.rules.find((rule) => rule.label === 'R32');

	assert(anyDecoration !== undefined);
	assertEquals(anyDecoration.verdict, 'saturated');
});

/** The 2GN.79 retune, guarded from the panel's side: the applied-element rule must not saturate. */
Deno.test('calibrateRules: the retuned applied-element rule reads as discriminating', () => {
	const report = calibrateRules('applied', culture, 150);
	const applied = report.rules.find((rule) => rule.label === 'R31');

	assert(applied !== undefined);
	assertEquals(applied.verdict, 'discriminating');
	assert(
		applied.firePercent <= SATURATION_CEILING,
		`applied-element rule fired on ${applied.firePercent.toFixed(1)}%`,
	);
});

Deno.test('calibrateRules: tag lead percentages sum to at most 100', () => {
	const report = calibrateRules('leads', culture, 60);
	const totalLead = report.tags.reduce((sum, tag) => sum + tag.leadPercent, 0);

	assert(totalLead <= 100.0001, `lead percentages summed to ${totalLead}`);
});

Deno.test('calibrateRules: a tag is never reported as leading more often than it is present', () => {
	const report = calibrateRules('presence', culture, 60);

	for (const tag of report.tags) {
		assert(
			tag.leadCount <= tag.presentCount,
			`${tag.tag} led ${tag.leadCount} times but was present ${tag.presentCount}`,
		);
	}
});

Deno.test('calibrateRules: omits tags with no evidence rather than reporting them at zero', () => {
	const report = calibrateRules('silence', culture, 40);

	for (const tag of report.tags) {
		assert(tag.presentCount > 0, `${tag.tag} was reported with no evidence`);
	}
});

Deno.test('calibrateRules: tags sort by lead rate, strongest first', () => {
	const report = calibrateRules('sorting', culture, 60);

	for (let index = 1; index < report.tags.length; index++) {
		assert(
			report.tags[index - 1].leadPercent >= report.tags[index].leadPercent,
			'tags are not sorted by lead percentage',
		);
	}
});

Deno.test('calibrateRules: topContributor names a rule that actually fired', () => {
	const report = calibrateRules('contributor', culture, 60);

	for (const tag of report.tags) {
		if (tag.topContributor === undefined) continue;
		const rule = report.rules[tag.topContributor.ruleIndex];
		assertEquals(tag.topContributor.label, rule.label);
		assert(rule.fireCount > 0, `${tag.tag}'s top contributor ${rule.label} never fired`);
		assert(
			rule.contributions.some((contribution) => contribution.tag === tag.tag),
			`${rule.label} is named as ${tag.tag}'s top contributor but does not tag it`,
		);
	}
});

Deno.test('calibrateRules: every culture preset produces a usable report', () => {
	for (const preset of EXPLORER_CULTURES) {
		const report = calibrateRules('presets', preset, 30);

		assertEquals(report.sampleSize, 30);
		assert(report.tags.length > 0, `${preset.id} produced no scored tags at all`);
	}
});

Deno.test('calibrateRules: a zero-count run is empty rather than throwing', () => {
	const report = calibrateRules('empty', culture, 0);

	assertEquals(report.sampleSize, 0);
	assertEquals(report.tags, []);
	for (const rule of report.rules) {
		assertEquals(rule.fireCount, 0);
		assertEquals(rule.firePercent, 0);
	}
});
