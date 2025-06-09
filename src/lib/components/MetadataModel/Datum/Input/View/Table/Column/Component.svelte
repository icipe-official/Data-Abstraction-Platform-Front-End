<!--
@Component

Props:
-
-->
<script lang="ts">
	import { Domain, MetadataModel, Utils } from '$lib'
	import { Pagination } from '$lib/components/Pagination'
	import { untrack } from 'svelte'

	const COMPONENT_NAME = 'metadata-model-datum-input-view-table-column'

	interface Props {
		field: any
		themecolor: Domain.Entities.Theme.Color
		theme: Domain.Entities.Theme.Theme
		rowindex: number
		columnindex: number
		updatefieldgroup?: (fieldGroup: any) => void
		getdata: (fieldGroupKey: string, arrayPlaceholderIndexes: number[]) => any
		updatedata: (fieldGroupKey: string, arrayPlaceholderIndexes: number[], value: any) => void
		deletedata: (fieldGroupKey: string, arrayPlaceholderIndexes: number[]) => void
		telemetry?: Domain.Interfaces.ITelemetry
		contentperpage?: number
		stickyheaderoffset?: number
		switchbackground?: boolean
	}

	let {
		field,
		themecolor,
		theme,
		rowindex,
		columnindex,
		updatefieldgroup = undefined,
		getdata,
		updatedata,
		deletedata,
		telemetry = undefined,
		contentperpage = 5,
		stickyheaderoffset = 0,
		switchbackground = false
	}: Props = $props()

	let fieldKey: string = $derived(field[MetadataModel.FgProperties.FIELD_GROUP_KEY])

	let rowColumnIndexPlaceholders: [number, number] = $derived([rowindex, columnindex])

	let noOfEntries: number = $derived.by(() => {
		const fieldData = getdata(fieldKey, rowColumnIndexPlaceholders)

		if (Array.isArray(fieldData)) {
			if (fieldData.length > 0) {
				return fieldData.length
			}
		}

		return 1
	})
	$effect(() => {
		const fieldData = getdata(fieldKey, rowColumnIndexPlaceholders)

		if (Array.isArray(fieldData) && fieldData.length === 0) {
			deletedata(fieldKey, rowColumnIndexPlaceholders)
		}
	})
	let entriesStart: number = $state(0)
	let entriesEnd: number = $state(0)

	let fieldUi: MetadataModel.FieldUi | undefined = $derived(field[MetadataModel.FgProperties.FIELD_UI])

	let fieldMaxEntries: number = $derived(field[MetadataModel.FgProperties.FIELD_GROUP_MAX_ENTRIES])
	let showEntriesPagination: boolean = $derived(fieldMaxEntries !== 1 || noOfEntries > 1)

	let showMenuEntryNumber: number | undefined = $state(undefined)
	$effect(() => {
		if (typeof showMenuEntryNumber === 'number' && showMenuEntryNumber >= noOfEntries) {
			untrack(() => (showMenuEntryNumber = undefined))
		}
	})

	let disableInput: boolean = $derived(field[MetadataModel.FgProperties.FIELD_GROUP_INPUT_DISABLE] || false)
</script>

<div
	class="sticky left-0 flex flex-col gap-y-1 {showEntriesPagination
		? `fieldset ${
				theme === Domain.Entities.Theme.Theme.DARK
					? switchbackground
						? 'border-gray-950 bg-gray-800'
						: 'border-gray-900 bg-gray-700'
					: switchbackground
						? 'border-gray-500 bg-gray-300'
						: 'border-gray-400 bg-gray-200'
			} rounded-box border p-1`
		: ''}"
	style="top: {stickyheaderoffset}px;"
>
	<header class="flex flex-col">
		<div class="join w-fit self-center">
			{#if fieldUi !== MetadataModel.FieldUi.SELECT && fieldMaxEntries !== 1}
				{@const fieldDataAbsent = typeof getdata(fieldKey, rowColumnIndexPlaceholders) === 'undefined'}

				<button
					class="join-item btn btn-sm tooltip tooltip-bottom self-center {themecolor === Domain.Entities.Theme.Color.PRIMARY
						? 'btn-primary tooltip-primary'
						: themecolor === Domain.Entities.Theme.Color.SECONDARY
							? 'btn-secondary tooltip-secondary'
							: 'btn-accent tooltip-accent'}"
					onclick={() => {
						noOfEntries += 1
					}}
					disabled={disableInput}
					data-tip="add new '{MetadataModel.GetFieldGroupName(field)}' entry"
				>
					<!--mdi:plus-circle source: https://icon-sets.iconify.design-->
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
						<path
							fill="var({Utils.Theme.GetColorContent(themecolor)})"
							d="M17 13h-4v4h-2v-4H7v-2h4V7h2v4h4m-5-9A10 10 0 0 0 2 12a10 10 0 0 0 10 10a10 10 0 0 0 10-10A10 10 0 0 0 12 2"
						/>
					</svg>
				</button>

				<button
					class="join-item btn btn-sm tooltip tooltip-bottom self-center {themecolor === Domain.Entities.Theme.Color.PRIMARY
						? 'btn-primary tooltip-primary'
						: themecolor === Domain.Entities.Theme.Color.SECONDARY
							? 'btn-secondary tooltip-secondary'
							: 'btn-accent tooltip-accent'}"
					onclick={() => {
						deletedata(fieldKey, rowColumnIndexPlaceholders)
					}}
					disabled={fieldDataAbsent || disableInput}
					data-tip="delete '{MetadataModel.GetFieldGroupName(field)}' data"
				>
					<!--mdi:delete source: https://icon-sets.iconify.design-->
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
						<path fill="var({Utils.Theme.GetColorContent(themecolor)})" d="M19 4h-3.5l-1-1h-5l-1 1H5v2h14M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6z" />
					</svg>
				</button>
			{/if}
		</div>
	</header>

	<main class="flex flex-col gap-y-1">
		{#if fieldUi === MetadataModel.FieldUi.SELECT}
			{#await import('../../ColumnField/Select/Component.svelte') then { default: Select }}
				<Select {field} arrayindexplaceholders={rowColumnIndexPlaceholders} {theme} {themecolor} {getdata} {updatedata} {deletedata}></Select>
			{/await}
		{:else}
			{@const copyCutPasteFieldGroupKey = `${fieldKey}${MetadataModel.ARRAY_INDEX_PLACEHOLDER}`}

			{#each Utils.Range(entriesStart, Utils.RangeArrayEnd(entriesEnd, noOfEntries)) as eIndex (eIndex)}
				{@const aip = [...rowColumnIndexPlaceholders, eIndex]}

				{@const fieldDataAbsent = typeof getdata(fieldKey, rowColumnIndexPlaceholders) === 'undefined'}

				<div class="flex flex-col gap-y-1">
					<div class="flex gap-x-1">
						<button
							class="btn btn-circle btn-sm self-start"
							onclick={() => {
								showMenuEntryNumber = showMenuEntryNumber === eIndex ? undefined : eIndex
							}}
						>
							{#if fieldMaxEntries !== 1}
								{eIndex + 1}
							{:else}
								<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
									<path
										fill={theme === Domain.Entities.Theme.Theme.DARK ? 'white' : 'black'}
										d="M12 16a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2a2 2 0 0 1 2-2m0-6a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2a2 2 0 0 1 2-2m0-6a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2a2 2 0 0 1 2-2"
									/>
								</svg>
							{/if}
						</button>

						{#if fieldUi}
							{#if fieldUi === MetadataModel.FieldUi.TEXT || fieldUi === MetadataModel.FieldUi.TEXTAREA}
								{#await import('../../ColumnField/Text/Component.svelte') then { default: Text }}
									<Text {field} arrayindexplaceholders={aip} {theme} {themecolor} {getdata} {updatedata} {deletedata}></Text>
								{/await}
							{:else if fieldUi === MetadataModel.FieldUi.NUMBER}
								{#await import('../../ColumnField/Number/Component.svelte') then { default: Number }}
									<Number {field} arrayindexplaceholders={aip} {theme} {themecolor} {getdata} {updatedata} {deletedata}></Number>
								{/await}
							{:else if fieldUi === MetadataModel.FieldUi.DATETIME}
								{#await import('../../ColumnField/Timestamp/Component.svelte') then { default: Timestamp }}
									<Timestamp {field} arrayindexplaceholders={aip} {theme} {themecolor} {getdata} {updatedata} {deletedata}></Timestamp>
								{/await}
							{:else if fieldUi === MetadataModel.FieldUi.CHECKBOX}
								{#await import('../../ColumnField/Checkbox/Component.svelte') then { default: Checkbox }}
									<Checkbox {field} arrayindexplaceholders={aip} {theme} {themecolor} {getdata} {updatedata} {deletedata}></Checkbox>
								{/await}
							{:else}
								<div class="join-item text-error">field type {fieldUi} not supported</div>
							{/if}
						{/if}
					</div>

					{#if showMenuEntryNumber === eIndex}
						<div
							class="flex w-fit rounded-md p-1 shadow-inner shadow-gray-800 {theme === Domain.Entities.Theme.Theme.DARK
								? 'bg-gray-600 text-white'
								: 'bg-gray-300 text-black'}"
						>
							<button
								class="btn btn-ghost btn-sm min-w-fit"
								onclick={() => {
									deletedata(copyCutPasteFieldGroupKey, aip)
								}}
								disabled={fieldDataAbsent || disableInput}
							>
								Delete
							</button>
						</div>
					{/if}
				</div>
			{/each}
		{/if}
	</main>

	{#if fieldUi !== MetadataModel.FieldUi.SELECT}
		<footer class="flex w-full justify-center">
			<Pagination
				{themecolor}
				lengthofdata={noOfEntries}
				start={entriesStart}
				end={entriesEnd}
				updatestart={(n) => {
					entriesStart = n
				}}
				updateend={(n) => {
					entriesEnd = n
				}}
				{telemetry}
				{contentperpage}
				displayiflengthofdatagreaterthancontentperpage={!showEntriesPagination}
			></Pagination>
		</footer>
	{/if}
</div>
