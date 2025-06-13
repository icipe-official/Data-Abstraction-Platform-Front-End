<!--
@component

Props:
-

-->
<script lang="ts">
	import { Domain, Json, MetadataModel, Utils } from '$lib'

	const COMPONENT_NAME = 'metadata-model-table'

	interface Props {
		field: any
		data?: any
		arrayindexplaceholders?: number[]
		themecolor?: Domain.Entities.Theme.Color
		telemetry?: Domain.Interfaces.ITelemetry
		theme?: Domain.Entities.Theme.Theme
		addselectcolumn?: boolean
		addclickcolumn?: boolean
		multiselectcolumns?: boolean
		selecteddataindexes?: number[]
		filterexcludeindexes?: number[]
		selecteddataindexesactions?: { actionName: string; action: (selecteddataindexes: number[]) => void }[]
		rootelement?: Element
		tablecolumncontentperpage?: number
		tablerowcontentperpage?: number
		columnfieldcontentperpage?: number
		stickyheaderoffset?: number
		disablestickyheader?: boolean
		stickyleftoffset?: number
		disablestickyleft?: boolean
		stickyfooteroffset?: number
		disablestickyfooter?: boolean
		stickythreshold?: number
		switchbackground?: boolean
		updatefieldgroup: (value: any) => void
		getdata: (path: string, arrayindexes: number[]) => void
		metadatamodelget?: Domain.Interfaces.MetadataModels.Get
		fieldanygetmetadatamodel?: Domain.Interfaces.MetadataModels.IFieldAnyGetMetadataModel
	}

	let {
		field,
		data = undefined,
		arrayindexplaceholders = [],
		themecolor = Domain.Entities.Theme.Color.PRIMARY,
		telemetry = undefined,
		theme = Domain.Entities.Theme.Theme.LIGHT,
		addselectcolumn = false,
		addclickcolumn = false,
		multiselectcolumns = false,
		selecteddataindexes = [],
		filterexcludeindexes = [],
		selecteddataindexesactions = [],
		rootelement = undefined,
		tablecolumncontentperpage = 10,
		tablerowcontentperpage = 20,
		columnfieldcontentperpage = 5,
		stickythreshold = 0.3,
		stickyheaderoffset = 0,
		disablestickyheader = false,
		stickyleftoffset = 0,
		disablestickyleft = false,
		stickyfooteroffset = 0,
		disablestickyfooter = false,
		switchbackground = false,
		updatefieldgroup,
		getdata,
		metadatamodelget = undefined,
		fieldanygetmetadatamodel = undefined
	}: Props = $props()

	let fieldKey: string = $derived(field[MetadataModel.FgProperties.FIELD_GROUP_KEY])

	let isField: boolean = $derived(MetadataModel.IsGroupFieldAField(field))

	let dataEmpty: boolean = $derived.by(() => {
		if (typeof data === 'undefined') {
			return true
		}

		if (data === null) {
			return true
		}

		if (typeof data === 'object') {
			if (Array.isArray(data)) {
				if (data.length > 0) {
					return false
				}

				return true
			}

			if (Object.keys(data).length === 0) {
				return true
			}
		}

		return false
	})

	let noOfEntries: number = $derived.by(() => {
		if (!isField || dataEmpty) {
			return -1
		}

		if (Array.isArray(data)) {
			return data.length
		}

		return 1
	})
	let entriesStart: number = $state(0)
	let entriesEnd: number = $state(0)

	let fieldType: string = $derived(field[MetadataModel.FgProperties.FIELD_DATATYPE])

	function formatDateTimeValue(datetimevalue: any) {
		const getDateTimeUnitsString = (value: number) => (typeof value !== 'undefined' && value < 10 ? `0${value}` : `${value}`)
		const newDateValue = new Date(datetimevalue)

		switch (field[MetadataModel.FgProperties.FIELD_DATETIME_FORMAT].toLowerCase()) {
			case 'yyyy-mm-dd hh:mm':
				return `${newDateValue.getFullYear()}-${getDateTimeUnitsString(newDateValue.getMonth() + 1)}-${getDateTimeUnitsString(newDateValue.getDate())} ${getDateTimeUnitsString(newDateValue.getHours())}:${getDateTimeUnitsString(newDateValue.getMinutes())}`
			case 'yyyy-mm-dd':
				return `${newDateValue.getFullYear()}-${getDateTimeUnitsString(newDateValue.getMonth() + 1)}-${getDateTimeUnitsString(newDateValue.getDate())}`
			case 'yyyy-mm':
				return `${newDateValue.getFullYear()}-${getDateTimeUnitsString(newDateValue.getMonth() + 1)}`
			case 'yyyy':
				return newDateValue.getFullYear()
			case 'mm':
				return newDateValue.getMonth() === 0
					? 'January'
					: newDateValue.getMonth() === 1
						? 'February'
						: newDateValue.getMonth() === 2
							? 'March'
							: newDateValue.getMonth() === 3
								? 'April'
								: newDateValue.getMonth() === 4
									? 'May'
									: newDateValue.getMonth() === 5
										? 'June'
										: newDateValue.getMonth() === 6
											? 'July'
											: newDateValue.getMonth() === 7
												? 'August'
												: newDateValue.getMonth() === 8
													? 'September'
													: newDateValue.getMonth() === 9
														? 'October'
														: newDateValue.getMonth() === 10
															? 'November'
															: 'December'
			case 'hh:mm':
				return `${getDateTimeUnitsString(newDateValue.getHours())}:${getDateTimeUnitsString(newDateValue.getMinutes())}`
			default:
				return datetimevalue ? datetimevalue : `...no data...`
		}
	}

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

<span class="sticky flex h-fit w-fit flex-col gap-y-1" style="left: {stickyleftoffset}px; top: {stickyheaderoffset}px">
	{#if dataEmpty}
		{@render noData()}
	{:else if isField}
		{#if field[MetadataModel.FgProperties.FIELD_DATATYPE] === MetadataModel.FieldType.ANY}
			{#await getFieldAnyMetadataModel() then fieldAnyMetadataModel}
				{#if fieldAnyMetadataModel !== undefined}
					{#await import('../Component.svelte') then { default: Table }}
						<Table
							group={fieldAnyMetadataModel}
							data={Array.isArray(data) ? data : [data]}
							themecolor={Utils.Theme.GetNextColorA(themecolor)}
							{theme}
							{telemetry}
							{addselectcolumn}
							{addclickcolumn}
							{multiselectcolumns}
							{selecteddataindexes}
							{filterexcludeindexes}
							{selecteddataindexesactions}
							{tablecolumncontentperpage}
							{tablerowcontentperpage}
							{columnfieldcontentperpage}
							{stickyheaderoffset}
							{disablestickyheader}
							{stickyleftoffset}
							{disablestickyleft}
							{stickyfooteroffset}
							{disablestickyfooter}
							{stickythreshold}
							{switchbackground}
							{updatefieldgroup}
							{rootelement}
							{arrayindexplaceholders}
							{getdata}
							{metadatamodelget}
							{fieldanygetmetadatamodel}
						></Table>
					{/await}
				{:else}
					{@render json()}
				{/if}
			{/await}
		{:else if Array.isArray(data)}
			{#if data.length === 1}
				{@render datum(data[0])}
			{:else}
				<div
					class="fieldset ${theme === Domain.Entities.Theme.Theme.DARK
						? switchbackground
							? 'border-gray-950 bg-gray-800'
							: 'border-gray-900 bg-gray-700'
						: switchbackground
							? 'border-gray-500 bg-gray-300'
							: 'border-gray-400 bg-gray-200'} rounded-box border p-2"
				>
					<main class="flex flex-col">
						{#each Utils.Range(entriesStart, Utils.RangeArrayEnd(entriesEnd, noOfEntries)) as eIndex (eIndex)}
							<div class="flex gap-x-8">
								<button class="btn btn-circle btn-sm self-start">
									{eIndex + 1}
								</button>

								{@render datum(data[eIndex])}
							</div>

							{#if eIndex !== eIndex}
								<div class="divider mt-0 mb-0"></div>
							{/if}
						{/each}
					</main>

					<footer class="flex w-full justify-center">
						{#await import('$lib/components/Pagination/Component.svelte') then { default: Pagination }}
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
								contentperpage={columnfieldcontentperpage}
								displayiflengthofdatagreaterthancontentperpage={true}
							></Pagination>
						{/await}
					</footer>
				</div>
			{/if}
		{:else}
			{@render datum(data)}
		{/if}
	{:else}
		{#await import('../Component.svelte') then { default: Table }}
			<Table
				group={field}
				data={Array.isArray(data) ? data : [data]}
				themecolor={Utils.Theme.GetNextColorA(themecolor)}
				{theme}
				{telemetry}
				{addselectcolumn}
				{addclickcolumn}
				{multiselectcolumns}
				{selecteddataindexes}
				{filterexcludeindexes}
				{selecteddataindexesactions}
				{tablecolumncontentperpage}
				{tablerowcontentperpage}
				{columnfieldcontentperpage}
				{stickyheaderoffset}
				{disablestickyheader}
				{stickyleftoffset}
				{disablestickyleft}
				{stickyfooteroffset}
				{disablestickyfooter}
				{stickythreshold}
				{switchbackground}
				{updatefieldgroup}
				{rootelement}
				{arrayindexplaceholders}
				{getdata}
				{metadatamodelget}
				{fieldanygetmetadatamodel}
			></Table>
		{/await}
	{/if}
</span>

{#snippet json()}
	<pre
		class="h-fit max-h-[50vh] w-full flex-1 overflow-auto rounded-md {theme === Domain.Entities.Theme.Theme.DARK
			? switchbackground
				? 'bg-gray-800'
				: 'border-gray-900 bg-gray-700'
			: switchbackground
				? 'bg-gray-300'
				: 'bg-gray-200'} p-1 shadow-inner shadow-gray-800 lg:max-w-[50vw]"><code>{JSON.stringify(data, null, 4)}</code></pre>
{/snippet}

{#snippet datum(datum: any)}
	{#if fieldType === MetadataModel.FieldType.BOOLEAN}
		{#if datum === true || (typeof field[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_TRUE] !== 'undefined' && Json.AreValuesEqual(datum, field[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_TRUE][MetadataModel.FieldCheckboxValueProperties.VALUE]))}
			<span class="flex h-fit w-fit justify-center gap-x-1">
				<!--mdi:checkbox-marked source: https://icon-sets.iconify.design-->
				<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
					<path
						fill="var({Utils.Theme.GetColor(themecolor)}"
						d="m10 17l-5-5l1.41-1.42L10 14.17l7.59-7.59L19 8m0-5H5c-1.11 0-2 .89-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2"
					/>
				</svg>

				{#if typeof field[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_TRUE] !== 'undefined' && typeof field[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_TRUE][MetadataModel.FieldCheckboxValueProperties.VALUE] !== 'undefined'}
					{field[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_TRUE][MetadataModel.FieldCheckboxValueProperties.VALUE]}
				{/if}
			</span>
		{:else if datum === true || (typeof field[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_FALSE] !== 'undefined' && Json.AreValuesEqual(datum, field[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_FALSE][MetadataModel.FieldCheckboxValueProperties.VALUE]))}
			<span class="flex h-fit w-fit justify-center gap-x-1">
				<!--mdi:close-box source: https://icon-sets.iconify.design-->
				<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
					<path
						fill="var({Utils.Theme.GetColor(themecolor)}"
						d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2m-3.4 14L12 13.4L8.4 17L7 15.6l3.6-3.6L7 8.4L8.4 7l3.6 3.6L15.6 7L17 8.4L13.4 12l3.6 3.6z"
					/>
				</svg>

				{#if typeof field[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_FALSE] !== 'undefined' && typeof field[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_FALSE][MetadataModel.FieldCheckboxValueProperties.VALUE] !== 'undefined'}
					{field[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_FALSE][MetadataModel.FieldCheckboxValueProperties.VALUE]}
				{/if}
			</span>
		{:else}
			<span class="text-error min-w-[200px] font-bold">...no valid checkbox value found...</span>
		{/if}
	{:else if fieldType === MetadataModel.FieldType.TIMESTAMP}
		{formatDateTimeValue(datum)}
	{:else if typeof datum === 'undefined' || datum === null}
		{@render noData()}
	{:else if typeof datum === 'string'}
		{#if datum.length > 20}
			<span class="min-w-[250px] break-words">{datum}</span>
		{:else}
			{datum}
		{/if}
	{:else}
		{datum}
	{/if}
{/snippet}

{#snippet noData()}
	<span class="min-w-[150px] text-sm font-bold italic">...no data...</span>
{/snippet}
