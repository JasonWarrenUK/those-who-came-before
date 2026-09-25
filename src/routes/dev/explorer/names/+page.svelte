<script lang="ts">
/**
 * Names panel (roadmap 2GN.161): generates a world's language forest from the seed and shows the
 * sound system behind each language alongside the culture, site and scholar names it produces,
 * plus the pinned modern language's colleague and institution names — the DOM counterpart of
 * `scripts/dev/sample-names.ts`.
 */
import { page } from '$app/state';
import { getSeed } from '../seed';
import { sampleNames } from './namesPanel';
import type { SampledName, SoundSystem } from './namesPanel';

const seed = $derived(getSeed(page.url));

let cultureCount = $state(4);
let namesPerLanguage = $state(6);
const clampedCultures = $derived(Math.min(12, Math.max(1, Math.floor(cultureCount) || 1)));
const clampedNames = $derived(Math.min(20, Math.max(1, Math.floor(namesPerLanguage) || 1)));

const model = $derived(sampleNames(seed, clampedCultures, clampedNames));
</script>

{#snippet soundSystem(system: SoundSystem)}
	<dl class="text-base-content/80 grid grid-cols-[7rem_1fr] gap-x-2 gap-y-1 text-xs">
	<dt>syllables</dt>
	<dd><code>{system.templateLabel}</code> · {system.templateProse}</dd>
	<dt>name length</dt>
	<dd>{system.lengthPreference}</dd>
	<dt>consonants ({system.consonants.length})</dt>
	<dd class="font-mono">{system.consonants.join(' ')}</dd>
	<dt>vowels ({system.vowels.length})</dt>
	<dd class="font-mono">{system.vowels.join(' ')}</dd>
</dl>
{/snippet}

{#snippet nameList(label: string, names: SampledName[])}
	<div>
	<div class="text-base-content/60 text-xs uppercase">{label}</div>
	<ul class="mt-1 space-y-0.5">
			{#each names as name, index (index)}
				<li class="flex items-baseline gap-2">
					<span class="font-semibold">{name.text}</span>
					<span class="text-base-content/50 text-xs">{name.syllabified}</span>
				</li>
			{/each}
		</ul>
</div>
{/snippet}

<h2 class="text-2xl font-bold">Names</h2>

<p class="mt-4 max-w-prose">
	Generates the world's languages from the seed alone and samples what each one produces: a
	culture name, then site and scholar names with their syllable breaks marked. The sound system
	above each set is what the names are drawn from, commonest phoneme first.
</p>

<p class="text-base-content/70 mt-2 max-w-prose text-sm">
	Sister languages in one family are currently <em>identical</em>, not merely related: every member
	shares the family's proto-phonology because no sound change exists yet to diverge them. The modern
	language at the bottom is pinned across every seed; only its sampled names change.
</p>

<div class="mt-6 flex flex-wrap items-center gap-4">
	<label class="input input-sm w-40">
		<span class="label">Cultures</span>
		<input type="number" min="1" max="12" bind:value={cultureCount} />
	</label>

	<label class="input input-sm w-44">
		<span class="label">Names each</span>
		<input type="number" min="1" max="20" bind:value={namesPerLanguage} />
	</label>

	<span class="text-sm">
		seed: <code class="bg-base-200 rounded px-1 font-mono">{seed}</code>
	</span>
</div>

<div class="mt-6 flex flex-wrap items-center gap-3 text-sm">
	<span class="badge badge-neutral">{model.languages.length} languages</span>
	<span class="badge badge-ghost">{model.familyCount} families</span>
</div>

<div class="mt-6 grid max-w-5xl gap-4 md:grid-cols-2">
	{#each model.languages as language (language.id)}
		<div class="bg-base-200 rounded-box p-4 text-sm">
			<div class="flex flex-wrap items-baseline gap-2">
				<span class="text-primary font-mono font-semibold">{language.id}</span>
				<span class="badge badge-ghost badge-sm">
					{language.familySize === 1
						? 'isolate'
						: `${language.familyId} · ${language.memberIndex + 1} of ${language.familySize}`}
				</span>
			</div>
			<div class="mt-1">
				culture <span class="text-secondary font-semibold">{language.cultureName.text}</span>
				<span class="text-base-content/50 text-xs">{language.cultureName.syllabified}</span>
			</div>

			<div class="mt-3">
				{@render soundSystem(language.soundSystem)}
			</div>

			<div class="mt-3 grid grid-cols-2 gap-3">
				{@render nameList('sites', language.sites)}
				{@render nameList('scholars', language.scholars)}
			</div>
		</div>
	{/each}
</div>

<h3 class="mt-8 text-lg font-semibold">Modern language</h3>

<p class="text-base-content/70 mt-1 max-w-prose text-sm">
	One pinned phonology (<code>{model.modern.id}</code>) shared by every world, naming the player's
	own colleagues and institutions. It sits outside the language forest by design.
</p>

<div class="bg-base-200 rounded-box mt-3 max-w-2xl p-4 text-sm">
	{@render soundSystem(model.modern.soundSystem)}
	<div class="mt-3 grid grid-cols-2 gap-3">
		{@render nameList('colleagues', model.modern.colleagues)}
		{@render nameList('institutions', model.modern.institutions)}
	</div>
</div>
