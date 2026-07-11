<script lang="ts">
import type { PageProps } from './$types';
import type { TypeDeclarationSummary } from './typeIndex';

let { data }: PageProps = $props();

let filter = $state('');
const query = $derived(filter.trim().toLowerCase());

const interfaceCount = $derived(
	data.modules.flatMap((module) => module.declarations).filter((d) => d.kind === 'interface')
		.length,
);
const aliasCount = $derived(
	data.modules.flatMap((module) => module.declarations).filter((d) => d.kind === 'alias').length,
);

function declarationMatches(declaration: TypeDeclarationSummary, needle: string): boolean {
	if (declaration.name.toLowerCase().includes(needle)) return true;
	if (declaration.kind === 'interface') {
		return declaration.fields.some((field) => field.name.toLowerCase().includes(needle));
	}
	return declaration.unionMembers?.some((member) => member.toLowerCase().includes(needle)) ?? false;
}

// A module whose file name matches keeps all its declarations; otherwise only matching
// declarations survive, and modules left with none disappear.
const visibleModules = $derived(
	data.modules
		.map((module) => ({
			...module,
			declarations: query === '' || module.fileName.toLowerCase().includes(query)
				? module.declarations
				: module.declarations.filter((declaration) => declarationMatches(declaration, query)),
		}))
		.filter((module) => module.declarations.length > 0),
);

const visibleDeclarationCount = $derived(
	visibleModules.reduce((total, module) => total + module.declarations.length, 0),
);
</script>

<h2 class="text-2xl font-bold">Type Index</h2>

<p class="mt-4 max-w-prose">
	Every exported interface and type alias registered in <code
		class="bg-base-200 rounded px-1 font-mono">src/lib/types/</code>, parsed live from source with
	the TypeScript compiler — the index cannot drift from the code. Interfaces list their fields;
	string-literal unions list their members.
</p>

<div class="mt-6 flex flex-wrap items-center gap-4">
	<label class="input input-sm input-bordered flex w-72 items-center gap-2">
		<span class="label-text font-semibold">Filter</span>
		<input
			type="text"
			class="grow"
			placeholder="type, field or member name"
			bind:value={filter}
		/>
	</label>

	<span class="badge badge-neutral">{data.modules.length} modules</span>
	<span class="badge badge-neutral">{interfaceCount} interfaces</span>
	<span class="badge badge-neutral">{aliasCount} aliases</span>

	{#if query !== ''}
		<span class="badge badge-info">{visibleDeclarationCount} matching</span>
	{/if}
</div>

<div class="mt-6 flex max-w-4xl flex-col gap-2">
	{#each visibleModules as module (module.fileName)}
		<details class="collapse-arrow bg-base-200 border-base-300 collapse border" open={query !== ''}>
			<summary class="collapse-title">
				<span class="font-mono font-semibold">{module.fileName}</span>
				<span class="text-base-content/60 ml-2 text-sm">
					{module.declarations.length}
					{module.declarations.length === 1 ? 'type' : 'types'}
				</span>
				{#if module.summary}
					<span class="text-base-content/60 mt-1 block max-w-prose text-sm">{module.summary}</span>
				{/if}
			</summary>

			<div class="collapse-content flex flex-col gap-4">
				{#each module.declarations as declaration (declaration.name)}
					<div class="bg-base-100 rounded-box p-3">
						<div class="flex flex-wrap items-center gap-2">
							<span class="font-mono font-semibold">{declaration.name}</span>
							{#if declaration.kind === 'interface'}
								<span class="badge badge-primary badge-sm">interface</span>
								{#each declaration.extends as parent (parent)}
									<span class="badge badge-outline badge-sm">extends {parent}</span>
								{/each}
							{:else}
								<span class="badge badge-secondary badge-sm">type</span>
							{/if}
						</div>

						{#if declaration.summary}
							<p class="text-base-content/70 mt-1 max-w-prose text-sm">{declaration.summary}</p>
						{/if}

						{#if declaration.kind === 'interface'}
							{#if declaration.fields.length > 0}
								<table class="table-xs mt-2 table">
									<thead>
										<tr>
											<th>Field</th>
											<th>Type</th>
											<th>Summary</th>
										</tr>
									</thead>
									<tbody>
										{#each declaration.fields as field (field.name)}
											<tr>
												<td class="font-mono whitespace-nowrap">
													{#if field.readonly}<span class="text-base-content/50">readonly</span>
													{/if}
													{field.name}{#if field.optional}<span class="text-warning">?</span>{/if}
												</td>
												<td class="font-mono">{field.typeText}</td>
												<td class="text-base-content/70 max-w-xs truncate" title={field.summary}>
													{field.summary}
												</td>
											</tr>
										{/each}
									</tbody>
								</table>
							{:else}
								<p class="text-base-content/50 mt-2 text-sm italic">no fields</p>
							{/if}
						{:else if declaration.unionMembers !== null}
							<div class="mt-2 flex flex-wrap gap-1">
								{#each declaration.unionMembers as member (member)}
									<span class="badge badge-ghost badge-sm font-mono">{member}</span>
								{/each}
							</div>
						{:else}
							<pre class="bg-base-200 mt-2 overflow-x-auto rounded p-2 text-xs"><code
								>{declaration.typeText}</code></pre>
						{/if}
					</div>
				{/each}

				{#if module.otherExports.length > 0}
					<p class="text-base-content/60 text-sm">
						also exports:
						{#each module.otherExports as name, index (name)}
							<code class="bg-base-100 rounded px-1 font-mono">{name}</code
							>{index < module.otherExports.length - 1 ? ' ' : ''}
						{/each}
					</p>
				{/if}
			</div>
		</details>
	{:else}
		<p class="text-base-content/60 italic">No types match “{filter}”.</p>
	{/each}
</div>
