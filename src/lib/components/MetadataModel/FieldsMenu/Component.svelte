<!--
@component

Props:
-

-->
<script lang="ts">
	import { Domain, MetadataModel, Utils } from '$lib'
	import { Pagination } from '$lib/components/Pagination'

	const COMPONENT_NAME = 'metadata-model-table-view-columns'

	interface Props {
		fields: any[]
		contentperpage?: number
		themecolor?: Domain.Entities.Theme.Color
		transparent?: boolean
		telemetry?: Domain.Interfaces.ITelemetry
		theme?: Domain.Entities.Theme.Theme
		updatefield?: (field: any, fIndex: number) => void
		jumptofield?: (field: any, fIndex: number) => void
	}

	let {
		fields,
		contentperpage = 7,
		themecolor = Domain.Entities.Theme.Color.PRIMARY,
		theme = Domain.Entities.Theme.Theme.LIGHT,
		transparent = false,
		telemetry = undefined,
		updatefield = undefined,
		jumptofield = undefined
	}: Props = $props()

	let searchQuery: string = $state('')
	let FieldsMenu: { field: any; index: number }[] = $derived.by(() => {
		const f = fields.map((field, index) => ({ field, index }))

		if (searchQuery.length > 0) {
			return f.filter(
				(v) =>
					(typeof v.field[MetadataModel.FgProperties.FIELD_GROUP_NAME] === 'string' &&
						(v.field[MetadataModel.FgProperties.FIELD_GROUP_NAME] as string).includes(searchQuery)) ||
					(typeof v.field[MetadataModel.FgProperties.FIELD_GROUP_DESCRIPTION] === 'string' &&
						(v.field[MetadataModel.FgProperties.FIELD_GROUP_DESCRIPTION] as string).includes(searchQuery))
			)
		}

		return f
	})

	let noOfFields: number = $derived(FieldsMenu.length)
	let fieldsStart: number = $state(0)
	let fieldsEnd: number = $state(0)

	function onupdatefield(vfIndex: number) {
		if (updatefield) {
			updatefield(FieldsMenu[vfIndex].field, FieldsMenu[vfIndex].index)
		}
	}

	function onjumptofield(vfIndex: number) {
		if (jumptofield) {
			jumptofield(FieldsMenu[vfIndex].field, FieldsMenu[vfIndex].index)
		}
	}
</script>

<div
	class="flex flex-col gap-y-2 overflow-hidden p-2 {transparent
		? 'bg-transparent'
		: theme === Domain.Entities.Theme.Theme.DARK
			? 'bg-gray-600'
			: 'bg-gray-300'}"
>
	<header>
		<input
			class="input input-sm w-full rounded-md {themecolor === Domain.Entities.Theme.Color.PRIMARY
				? 'input-primary'
				: themecolor === Domain.Entities.Theme.Color.SECONDARY
					? 'input-secondary'
					: 'input-accent'}"
			type="search"
			placeholder="search fields..."
			bind:value={searchQuery}
		/>
	</header>

	<main
		class="grid flex-1 gap-2 {theme === Domain.Entities.Theme.Theme.DARK ? 'text-white' : 'text-black'}"
		style="grid-template-columns: auto 2fr auto auto auto;"
	>
		{#each Utils.Range(fieldsStart, Utils.RangeArrayEnd(fieldsEnd, noOfFields)) as vfIndex (vfIndex)}
			{@const vfield = FieldsMenu[vfIndex]}

			{#if vfield}
				<span class="btn btn-xs btn-circle">{vfIndex + 1}</span>

				<span>{MetadataModel.GetFieldGroupName(vfield.field)}</span>

				<button
					class="btn btn-sm btn-ghost tooltip {vfIndex === fieldsEnd ? 'tooltip-top' : 'tooltip-bottom'} {themecolor ===
					Domain.Entities.Theme.Color.PRIMARY
						? 'tooltip-primary'
						: themecolor === Domain.Entities.Theme.Color.SECONDARY
							? 'tooltip-secondary'
							: 'tooltip-accent'}"
					aria-label="Jump to field {vfIndex}"
					disabled={!jumptofield}
					data-tip="jump to column"
					onclick={() => onjumptofield(vfIndex)}
				>
					<!--mdi:jump source: https://icon-sets.iconify.design-->
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
						<path
							fill={theme === Domain.Entities.Theme.Theme.DARK ? 'white' : 'black'}
							d="M12 14a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2a2 2 0 0 1 2-2m11.46-5.14l-1.59 6.89L15 14.16l3.8-2.38A7.97 7.97 0 0 0 12 8c-3.95 0-7.23 2.86-7.88 6.63l-1.97-.35C2.96 9.58 7.06 6 12 6c3.58 0 6.73 1.89 8.5 4.72z"
						/>
					</svg>
				</button>

				<button
					class="btn btn-sm btn-ghost tooltip {vfIndex === fieldsEnd ? 'tooltip-top' : 'tooltip-bottom'} {themecolor ===
					Domain.Entities.Theme.Color.PRIMARY
						? 'tooltip-primary'
						: themecolor === Domain.Entities.Theme.Color.SECONDARY
							? 'tooltip-secondary'
							: 'tooltip-accent'}"
					aria-label="Hide/show field {vfIndex}"
					disabled={!updatefield}
					data-tip="Hide/show column"
					onclick={() => {
						if (vfield.field[MetadataModel.FgProperties.FIELD_GROUP_VIEW_DISABLE]) {
							delete vfield.field[MetadataModel.FgProperties.FIELD_GROUP_VIEW_DISABLE]
						} else {
							vfield.field[MetadataModel.FgProperties.FIELD_GROUP_VIEW_DISABLE] = true
						}

						onupdatefield(vfIndex)
					}}
				>
					{#if vfield.field[MetadataModel.FgProperties.FIELD_GROUP_VIEW_DISABLE]}
						<!--mdi:eye-off source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
							<path
								fill={theme === Domain.Entities.Theme.Theme.DARK ? 'white' : 'black'}
								d="M11.83 9L15 12.16V12a3 3 0 0 0-3-3zm-4.3.8l1.55 1.55c-.05.21-.08.42-.08.65a3 3 0 0 0 3 3c.22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53a5 5 0 0 1-5-5c0-.79.2-1.53.53-2.2M2 4.27l2.28 2.28l.45.45C3.08 8.3 1.78 10 1 12c1.73 4.39 6 7.5 11 7.5c1.55 0 3.03-.3 4.38-.84l.43.42L19.73 22L21 20.73L3.27 3M12 7a5 5 0 0 1 5 5c0 .64-.13 1.26-.36 1.82l2.93 2.93c1.5-1.25 2.7-2.89 3.43-4.75c-1.73-4.39-6-7.5-11-7.5c-1.4 0-2.74.25-4 .7l2.17 2.15C10.74 7.13 11.35 7 12 7"
							/>
						</svg>
					{:else}
						<!--mdi:eye source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
							<path
								fill={theme === Domain.Entities.Theme.Theme.DARK ? 'white' : 'black'}
								d="M12 9a3 3 0 0 0-3 3a3 3 0 0 0 3 3a3 3 0 0 0 3-3a3 3 0 0 0-3-3m0 8a5 5 0 0 1-5-5a5 5 0 0 1 5-5a5 5 0 0 1 5 5a5 5 0 0 1-5 5m0-12.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5"
							/>
						</svg>
					{/if}
				</button>

				<button
					class="btn btn-sm btn-ghost tooltip tooltip-left {themecolor === Domain.Entities.Theme.Color.PRIMARY
						? 'tooltip-primary'
						: themecolor === Domain.Entities.Theme.Color.SECONDARY
							? 'tooltip-secondary'
							: 'tooltip-accent'}"
					aria-label="Freeze/unfreeze to field {vfIndex}"
					disabled={!updatefield}
					data-tip="Freeze/Unfreeze column"
					onclick={() => {
						if (vfield.field[MetadataModel.FgProperties.FIELD_GROUP_VIEW_TABLE_LOCK_COLUMN]) {
							delete vfield.field[MetadataModel.FgProperties.FIELD_GROUP_VIEW_TABLE_LOCK_COLUMN]
						} else {
							vfield.field[MetadataModel.FgProperties.FIELD_GROUP_VIEW_TABLE_LOCK_COLUMN] = true
						}

						onupdatefield(vfIndex)
					}}
				>
					{#if vfield.field[MetadataModel.FgProperties.FIELD_GROUP_VIEW_TABLE_LOCK_COLUMN]}
						<!--mdi:lock source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
							<path
								fill={theme === Domain.Entities.Theme.Theme.DARK ? 'white' : 'black'}
								d="M12 17a2 2 0 0 0 2-2a2 2 0 0 0-2-2a2 2 0 0 0-2 2a2 2 0 0 0 2 2m6-9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2h1V6a5 5 0 0 1 5-5a5 5 0 0 1 5 5v2zm-6-5a3 3 0 0 0-3 3v2h6V6a3 3 0 0 0-3-3"
							/>
						</svg>
					{:else}
						<!--mdi:unlocked-variant source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
							<path
								fill={theme === Domain.Entities.Theme.Theme.DARK ? 'white' : 'black'}
								d="M18 1c-2.76 0-5 2.24-5 5v2H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12c1.11 0 2-.89 2-2V10a2 2 0 0 0-2-2h-1V6c0-1.66 1.34-3 3-3s3 1.34 3 3v2h2V6c0-2.76-2.24-5-5-5m-8 12a2 2 0 0 1 2 2c0 1.11-.89 2-2 2a2 2 0 1 1 0-4"
							/>
						</svg>
					{/if}
				</button>
			{/if}
		{/each}
	</main>

	<footer>
		<Pagination
			lengthofdata={noOfFields}
			start={fieldsStart}
			end={fieldsEnd}
			updatestart={(n) => (fieldsStart = n)}
			updateend={(n) => (fieldsEnd = n)}
			{contentperpage}
			{themecolor}
			displayiflengthofdatagreaterthancontentperpage={true}
		></Pagination>
	</footer>
</div>
