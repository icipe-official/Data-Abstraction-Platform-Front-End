<!--
@Component

Props:
-
-->
<script lang="ts">
	import { Domain, MetadataModel, Utils } from '$lib'
	import { Pagination } from '$lib/components/Pagination'

	import { untrack } from 'svelte'

	const COMPONENT_NAME = 'metadata-model-datum-input-view-form-field'

	interface Props {
		field: any
		arrayindexplaceholders?: number[]
		themecolor: Domain.Entities.Theme.Color
		theme: Domain.Entities.Theme.Theme
		updatefieldgroup?: (fieldGroup: any) => void
		getdata: (fieldGroupKey: string, arrayPlaceholderIndexes: number[]) => any
		updatedata: (fieldGroupKey: string, arrayPlaceholderIndexes: number[], value: any) => void
		deletedata: (fieldGroupKey: string, arrayPlaceholderIndexes: number[]) => void
		copiedcutfieldgroupkey?: string
		setcopiedfieldgroupkey: (fieldGroupKey: string, arrayPlaceholderIndexes: number[]) => void
		setcutfieldgroupdata: (fieldGroupKey: string, arrayPlaceholderIndexes: number[]) => void
		pastefieldgroupdata: (fieldGroupKey: string, arrayPlaceholderIndexes: number[]) => void
		telemetry?: Domain.Interfaces.ITelemetry
		contentperpage?: number
		switchbackground?: boolean
	}

	let {
		field,
		arrayindexplaceholders = [],
		themecolor,
		theme,
		updatefieldgroup = undefined,
		getdata,
		updatedata,
		deletedata,
		copiedcutfieldgroupkey = '',
		setcopiedfieldgroupkey,
		setcutfieldgroupdata,
		pastefieldgroupdata,
		telemetry = undefined,
		contentperpage = 5,
		switchbackground = false
	}: Props = $props()

	let showGroupDescription: boolean = $state(false)

	let fieldKey: string = $derived(field[MetadataModel.FgProperties.FIELD_GROUP_KEY])

	let noOfEntries: number = $derived.by(() => {
		const fieldData = getdata(fieldKey, arrayindexplaceholders)

		if (Array.isArray(fieldData)) {
			if (fieldData.length > 0) {
				return fieldData.length
			}
		}

		return 1
	})
	$effect(() => {
		const fieldData = getdata(fieldKey, arrayindexplaceholders)

		if (Array.isArray(fieldData) && fieldData.length === 0) {
			deletedata(fieldKey, arrayindexplaceholders)
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

<fieldset
	class="fieldset {theme === Domain.Entities.Theme.Theme.DARK
		? switchbackground
			? 'border-gray-950 bg-gray-800'
			: 'border-gray-900 bg-gray-700'
		: switchbackground
			? 'border-gray-500 bg-gray-300'
			: 'border-gray-400 bg-gray-200'} rounded-box border p-4"
>
	<legend class="fieldset-legend flex gap-x-2">
		<div class="text-md h-fit self-center">{MetadataModel.GetFieldGroupName(field)}</div>

		{#if MetadataModel.IsFieldGroupDescriptionPresent(field)}
			<!-- svelte-ignore a11y_mouse_events_have_key_events -->
			<button
				class="btn btn-circle btn-sm btn-ghost self-center"
				aria-label="Show/Hide Group Description"
				onmouseover={() => (showGroupDescription = true)}
				onmouseout={() => (showGroupDescription = false)}
				onclick={() => {
					showGroupDescription = !showGroupDescription
				}}
			>
				<!--mdi:question-mark-circle source: https://icon-sets.iconify.design-->
				<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
					<path
						fill="var({Utils.Theme.GetColor(themecolor)})"
						d="m15.07 11.25l-.9.92C13.45 12.89 13 13.5 13 15h-2v-.5c0-1.11.45-2.11 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41a2 2 0 0 0-2-2a2 2 0 0 0-2 2H8a4 4 0 0 1 4-4a4 4 0 0 1 4 4a3.2 3.2 0 0 1-.93 2.25M13 19h-2v-2h2M12 2A10 10 0 0 0 2 12a10 10 0 0 0 10 10a10 10 0 0 0 10-10c0-5.53-4.5-10-10-10"
					/>
				</svg>
			</button>
		{/if}
	</legend>

	{#if showGroupDescription}
		<div class="max-h-[30vh] overflow-auto text-sm">
			{field[MetadataModel.FgProperties.FIELD_GROUP_DESCRIPTION]}
		</div>
	{/if}

	<header class="flex flex-col">
		<div class="join w-fit self-center">
			{#if fieldUi !== MetadataModel.FieldUi.SELECT && fieldMaxEntries !== 1}
				{@const fieldDataAbsent = typeof getdata(fieldKey, arrayindexplaceholders) === 'undefined'}

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
						deletedata(fieldKey, arrayindexplaceholders)
					}}
					disabled={fieldDataAbsent || disableInput}
					data-tip="delete '{MetadataModel.GetFieldGroupName(field)}' data"
				>
					<!--mdi:delete source: https://icon-sets.iconify.design-->
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
						<path fill="var({Utils.Theme.GetColorContent(themecolor)})" d="M19 4h-3.5l-1-1h-5l-1 1H5v2h14M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6z" />
					</svg>
				</button>

				<button
					class="join-item btn btn-sm tooltip tooltip-bottom self-center {themecolor === Domain.Entities.Theme.Color.PRIMARY
						? 'btn-primary tooltip-primary'
						: themecolor === Domain.Entities.Theme.Color.SECONDARY
							? 'btn-secondary tooltip-secondary'
							: 'btn-accent tooltip-accent'}"
					onclick={() => {
						setcopiedfieldgroupkey(fieldKey, arrayindexplaceholders)
					}}
					disabled={fieldDataAbsent}
					data-tip="copy '{MetadataModel.GetFieldGroupName(field)}' data"
				>
					<!--mdi:content-copy source: https://icon-sets.iconify.design-->
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
						<path
							fill="var({Utils.Theme.GetColorContent(themecolor)})"
							d="M19 21H8V7h11m0-2H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2m-3-4H4a2 2 0 0 0-2 2v14h2V3h12z"
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
						setcutfieldgroupdata(fieldKey, arrayindexplaceholders)
					}}
					disabled={fieldDataAbsent || disableInput}
					data-tip="cut '{MetadataModel.GetFieldGroupName(field)}' data"
				>
					<!--mdi:content-cut source: https://icon-sets.iconify.design-->
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
						<path
							fill="var({Utils.Theme.GetColorContent(themecolor)})"
							d="m19 3l-6 6l2 2l7-7V3m-10 9.5a.5.5 0 0 1-.5-.5a.5.5 0 0 1 .5-.5a.5.5 0 0 1 .5.5a.5.5 0 0 1-.5.5M6 20a2 2 0 0 1-2-2a2 2 0 0 1 2-2a2 2 0 0 1 2 2a2 2 0 0 1-2 2M6 8a2 2 0 0 1-2-2a2 2 0 0 1 2-2a2 2 0 0 1 2 2a2 2 0 0 1-2 2m3.64-.36c.23-.5.36-1.05.36-1.64a4 4 0 0 0-4-4a4 4 0 0 0-4 4a4 4 0 0 0 4 4c.59 0 1.14-.13 1.64-.36L10 12l-2.36 2.36C7.14 14.13 6.59 14 6 14a4 4 0 0 0-4 4a4 4 0 0 0 4 4a4 4 0 0 0 4-4c0-.59-.13-1.14-.36-1.64L12 14l7 7h3v-1z"
						/>
					</svg>
				</button>

				{@render paste(fieldKey, arrayindexplaceholders)}
			{/if}
		</div>
	</header>

	<main class="flex flex-col gap-y-1">
		{#if fieldUi === MetadataModel.FieldUi.SELECT}
			{#await import('../../ColumnField/Select/Component.svelte') then { default: Select }}
				<Select {field} {arrayindexplaceholders} {theme} {themecolor} {getdata} {updatedata} {deletedata}></Select>
			{/await}
		{:else}
			{@const copyCutPasteFieldGroupKey = `${fieldKey}${MetadataModel.ARRAY_INDEX_PLACEHOLDER}`}

			{#each Utils.Range(entriesStart, Utils.RangeArrayEnd(entriesEnd, noOfEntries)) as eIndex (eIndex)}
				{@const aip = [...arrayindexplaceholders, eIndex]}

				{@const fieldDataAbsent = typeof getdata(fieldKey, arrayindexplaceholders) === 'undefined'}

				<div class="flex flex-col gap-y-1">
					<div class="flex gap-x-1">
						<button
							class="btn btn-circle btn-md self-start"
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

						<div class="join w-fit">
							{@render paste(copyCutPasteFieldGroupKey, aip)}
						</div>
					</div>

					{#if showMenuEntryNumber === eIndex}
						<div
							class="flex w-fit rounded-md p-1 shadow-inner shadow-gray-800 {theme === Domain.Entities.Theme.Theme.DARK
								? 'bg-gray-600 text-white'
								: 'bg-gray-300 text-black'}"
						>
							<button
								class="btn btn-ghost btn-md min-w-fit"
								onclick={() => {
									setcopiedfieldgroupkey(copyCutPasteFieldGroupKey, aip)
								}}
								disabled={fieldDataAbsent}
							>
								Copy
							</button>

							<button
								class="btn btn-ghost btn-md min-w-fit"
								onclick={() => {
									setcutfieldgroupdata(copyCutPasteFieldGroupKey, aip)
								}}
								disabled={fieldDataAbsent || disableInput}
							>
								Cut
							</button>

							<button
								class="btn btn-ghost btn-md min-w-fit"
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
</fieldset>

{#snippet paste(copyCutFieldGroupKey: string, arrayindexplaceholders: number[])}
	{#if copiedcutfieldgroupkey === copyCutFieldGroupKey}
		<button
			class="join-item btn btn-md tooltip tooltip-left {themecolor === Domain.Entities.Theme.Color.PRIMARY
				? 'tooltip-primary'
				: themecolor === Domain.Entities.Theme.Color.SECONDARY
					? 'tooltip-secondary'
					: 'tooltip-accent'}"
			onclick={() => {
				pastefieldgroupdata(copyCutFieldGroupKey, arrayindexplaceholders)
			}}
			data-tip="paste {MetadataModel.GetFieldGroupName(field)} data"
			disabled={disableInput}
		>
			<!--mdi:content-paste source: https://icon-sets.iconify.design-->
			<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
				<path
					fill={theme === Domain.Entities.Theme.Theme.DARK ? 'white' : 'black'}
					d="M19 20H5V4h2v3h10V4h2m-7-2a1 1 0 0 1 1 1a1 1 0 0 1-1 1a1 1 0 0 1-1-1a1 1 0 0 1 1-1m7 0h-4.18C14.4.84 13.3 0 12 0S9.6.84 9.18 2H5a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2"
				/>
			</svg>
		</button>
	{/if}
{/snippet}
