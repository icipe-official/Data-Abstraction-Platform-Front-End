<!--
@component

Props:
=

-->
<script lang="ts">
	import { Domain, MetadataModel, Utils } from '$lib'
	import { Pagination } from '$lib/components/Pagination'
	import { untrack } from 'svelte'

	const COMPONENT_NAME = 'metadata-model-datum-view-form-field'

	interface Props {
		field: any
		data?: any
		arrayindexplaceholders?: number[]
		themecolor: Domain.Entities.Theme.Color
		theme: Domain.Entities.Theme.Theme
		telemetry?: Domain.Interfaces.ITelemetry
		formcolumncontentperpage?: number
		formentrycontentperpage?: number
		tablecolumncontentperpage?: number
		tablerowcontentperpage?: number
		columnfieldcontentperpage?: number
		stickyheaderoffset?: number
		stickyleftoffset?: number
		stickyfooteroffset?: number
		stickythreshold?: number
		switchbackground?: boolean
		rootelement?: Element
		getdata: (path: string, arrayindexes: number[]) => void
		metadatamodelget?: Domain.Interfaces.MetadataModels.Get
		fieldanygetmetadatamodel?: Domain.Interfaces.MetadataModels.IFieldAnyGetMetadataModel
	}

	let {
		field,
		data = undefined,
		arrayindexplaceholders = [],
		themecolor,
		theme,
		telemetry = undefined,
		formcolumncontentperpage = 5,
		formentrycontentperpage = 1,
		tablecolumncontentperpage,
		tablerowcontentperpage,
		columnfieldcontentperpage = 10,
		stickyheaderoffset = 0,
		stickyleftoffset = 0,
		stickyfooteroffset = 0,
		stickythreshold = 0.3,
		switchbackground = false,
		rootelement = undefined,
		getdata,
		metadatamodelget = undefined,
		fieldanygetmetadatamodel = undefined
	}: Props = $props()

	let showGroupDescription: boolean = $state(false)

	let fieldKey: string = $derived(field[MetadataModel.FgProperties.FIELD_GROUP_KEY])

	let viewData: any[] = $derived(Array.isArray(data) ? data : [data])

	let noOfEntries: number = $derived(viewData.length)

	let entriesStart: number = $state(0)
	let entriesEnd: number = $state(0)

	let fieldUi: MetadataModel.FieldUi | undefined = $derived(field[MetadataModel.FgProperties.FIELD_UI])

	let showEntriesPagination: boolean = $derived(noOfEntries > columnfieldcontentperpage)

	let showMenuEntryNumber: number | undefined = $state(undefined)
	$effect(() => {
		if (typeof showMenuEntryNumber === 'number' && showMenuEntryNumber >= noOfEntries) {
			untrack(() => (showMenuEntryNumber = undefined))
		}
	})

	async function getFieldAnyMetadataModel() {
		if (metadatamodelget === undefined) {
			return undefined
		}

		if (fieldanygetmetadatamodel === undefined) {
			return undefined
		}

		if (typeof fieldKey !== 'string') {
			return undefined
		}

		const fieldAnyProps = field[MetadataModel.FgProperties.FIELD_TYPE_ANY]
		if (typeof fieldAnyProps !== 'object' || Array.isArray(fieldAnyProps) || fieldAnyProps === null) {
			return undefined
		}

		const metadataModelActionID = fieldAnyProps[MetadataModel.FieldAnyProperties.METADATA_MODEL_ACTION_ID]
		if (typeof metadataModelActionID !== 'string') {
			return undefined
		}

		const pathToDataArgument = fieldAnyProps[MetadataModel.FieldAnyProperties.GET_METADATA_MODEL_PATH_TO_DATA_ARGUMENT]
		if (typeof pathToDataArgument !== 'string') {
			return undefined
		}

		const arg = getdata(pathToDataArgument, arrayindexplaceholders)

		return await metadatamodelget.GetMetadataModel(
			fieldanygetmetadatamodel,
			metadataModelActionID,
			fieldKey,
			field[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_UID],
			arg
		)
	}
</script>

{#if field[MetadataModel.FgProperties.FIELD_DATATYPE] === MetadataModel.FieldType.ANY}
	{#await getFieldAnyMetadataModel() then fieldAnyMetadataModel}
		{#if fieldAnyMetadataModel !== undefined}
			{#await import('../Component.svelte') then { default: Form }}
				<Form
					group={fieldAnyMetadataModel}
					data={viewData}
					themecolor={Utils.Theme.GetNextColorA(themecolor)}
					{theme}
					{arrayindexplaceholders}
					{telemetry}
					{formcolumncontentperpage}
					{formentrycontentperpage}
					{tablecolumncontentperpage}
					{tablerowcontentperpage}
					{columnfieldcontentperpage}
					{stickyheaderoffset}
					{stickyfooteroffset}
					{stickyleftoffset}
					{stickythreshold}
					switchbackground={!switchbackground}
					{rootelement}
					{getdata}
					{metadatamodelget}
					{fieldanygetmetadatamodel}
				></Form>
			{/await}
		{:else}
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
				</legend>

				{@render json()}
			</fieldset>
		{/if}
	{/await}
{:else}
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

		<main class="flex flex-col gap-y-1">
			{#each Utils.Range(entriesStart, Utils.RangeArrayEnd(entriesEnd, noOfEntries)) as eIndex (eIndex)}
				{@const datum = viewData[eIndex]}
				<div class="flex gap-x-4">
					{#if noOfEntries > 1}
						<button
							class="btn btn-circle btn-md self-start"
							onclick={() => {
								showMenuEntryNumber = showMenuEntryNumber === eIndex ? undefined : eIndex
							}}
						>
							{eIndex + 1}
						</button>
					{/if}

					{#if datum === undefined || datum === null}
						<div class="h-fit self-center text-lg font-bold italic">...no data...</div>
					{:else}
						<div class="h-fit self-center text-lg">{viewData[eIndex]}</div>
					{/if}
				</div>
			{/each}
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
					contentperpage={formcolumncontentperpage}
					displayiflengthofdatagreaterthancontentperpage={!showEntriesPagination}
				></Pagination>
			</footer>
		{/if}
	</fieldset>
{/if}

{#snippet json()}
	<pre
		class="h-fit max-h-[50vh] w-full flex-1 overflow-auto rounded-md {theme === Domain.Entities.Theme.Theme.DARK
			? !switchbackground
				? 'bg-gray-800'
				: 'border-gray-900 bg-gray-700'
			: !switchbackground
				? 'bg-gray-300'
				: 'bg-gray-200'} p-1 shadow-inner shadow-gray-800 lg:max-w-[50vw]"><code>{JSON.stringify(viewData, null, 4)}</code></pre>
{/snippet}
