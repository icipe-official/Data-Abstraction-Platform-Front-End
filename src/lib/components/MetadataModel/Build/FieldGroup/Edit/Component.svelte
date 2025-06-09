<!--
@component

Edit Field Group.

Props:
- fieldgroup -
- metadatamodel - 
- themecolor -
- theme - 
- updatefieldgroup -
- telemetry - utility for collecting telemetry following the `Domain.Interfaces.ITelemetry`interface.
-->
<script lang="ts">
	import { Domain, MetadataModel } from '$lib'
	import { Section } from './util'

	const COMPONENT_NAME = 'metadata-model-edit-field-group'

	interface Props {
		fieldgroup: any
		metadatamodel: any
		themecolor?: Domain.Entities.Theme.Color
		theme?: Domain.Entities.Theme.Theme
		updatefieldgroup: (fieldgroup: any) => void
		telemetry?: Domain.Interfaces.ITelemetry
	}

	let {
		fieldgroup,
		metadatamodel,
		themecolor = Domain.Entities.Theme.Color.PRIMARY,
		theme = Domain.Entities.Theme.Theme.LIGHT,
		updatefieldgroup,
		telemetry
	}: Props = $props()

	let section: Section = $state(Section.GENERAL)
</script>

<div class="flex h-full w-full flex-col overflow-auto">
	<section>
		<button
			class="btn sticky top-0 z-[2] flex w-full justify-between p-2 {theme === Domain.Entities.Theme.Theme.DARK ? 'bg-gray-800' : 'bg-gray-100'}"
			onclick={() => (section = Section.GENERAL)}
		>
			General
		</button>
		{#if section === Section.GENERAL}
			{#await import('./General/Component.svelte') then { default: General }}
				<General {fieldgroup} {themecolor} {theme} {updatefieldgroup}></General>
			{/await}
		{/if}
	</section>

	<section>
		<button
			class="btn btn-square sticky top-0 z-[2] flex w-full justify-between rounded-none p-2 {theme === Domain.Entities.Theme.Theme.DARK
				? 'bg-gray-800'
				: 'bg-gray-100'}"
			onclick={() => (section = Section.FIELD)}
		>
			Field
		</button>
		{#if section === Section.FIELD}
			{#await import('./Field/Component.svelte') then { default: Field }}
				<Field {fieldgroup} {themecolor} {theme} {updatefieldgroup}></Field>
			{/await}
		{/if}
	</section>

	<section>
		<button
			class="btn btn-square sticky top-0 z-[2] flex w-full justify-between rounded-none p-2 {theme === Domain.Entities.Theme.Theme.DARK
				? 'bg-gray-800'
				: 'bg-gray-100'}"
			onclick={() => (section = Section.VIEW)}
		>
			View
		</button>
		{#if section === Section.VIEW}
			{#await import('./View/Component.svelte') then { default: View }}
				<View {fieldgroup} {themecolor} {theme} {updatefieldgroup}></View>
			{/await}
		{/if}
	</section>

	<section>
		<button
			class="btn btn-square sticky top-0 z-[2] flex w-full justify-between rounded-none p-2 {theme === Domain.Entities.Theme.Theme.DARK
				? 'bg-gray-800'
				: 'bg-gray-100'}"
			onclick={() => (section = Section.QUERY)}
		>
			Query
		</button>
		{#if section === Section.QUERY}
			{#await import('./Query/Component.svelte') then { default: Query }}
				<Query {fieldgroup} {themecolor} {theme} {updatefieldgroup}></Query>
			{/await}
		{/if}
	</section>

	<section>
		<button
			class="btn btn-square sticky top-0 z-[2] flex w-full justify-between rounded-none p-2 {theme === Domain.Entities.Theme.Theme.DARK
				? 'bg-gray-800'
				: 'bg-gray-100'}"
			onclick={() => (section = Section.INPUT)}
		>
			Input
		</button>
		{#if section === Section.INPUT}
			{#await import('./Input/Component.svelte') then { default: Input }}
				<Input {fieldgroup} {themecolor} {theme} {updatefieldgroup}></Input>
			{/await}
		{/if}
	</section>

	<section>
		<button
			class="btn btn-square sticky top-0 z-[2] flex w-full justify-between rounded-none p-2 {theme === Domain.Entities.Theme.Theme.DARK
				? 'bg-gray-800'
				: 'bg-gray-100'}"
			onclick={() => (section = Section.DATABASE)}
		>
			Database
		</button>
		{#if section === Section.DATABASE}
			{#await import('./Database/Component.svelte') then { default: Database }}
				<Database {fieldgroup} {themecolor} {theme} {updatefieldgroup}></Database>
			{/await}
		{/if}
	</section>

	{#if MetadataModel.IsGroupFieldAField(fieldgroup)}
		<section>
			<button
				class="btn btn-square sticky top-0 z-[2] flex w-full justify-between rounded-none p-2 {theme === Domain.Entities.Theme.Theme.DARK
					? 'bg-gray-800'
					: 'bg-gray-100'}"
				onclick={() => (section = Section.COLUMN_POSITION)}
			>
				Column position
			</button>
			{#if section === Section.COLUMN_POSITION}
				{#await import('./ColumnPosition/Component.svelte') then { default: ColumnPosition }}
					<ColumnPosition {fieldgroup} {themecolor} {theme} {updatefieldgroup} {metadatamodel} {telemetry}></ColumnPosition>
				{/await}
			{/if}
		</section>
	{/if}
</div>
