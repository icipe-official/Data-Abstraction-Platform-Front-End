<script lang="ts">
	import { Domain, Interfaces, Json, MetadataModel, Utils } from '$lib'
	import { Pagination } from '$lib/components/Pagination'
	import type { View } from '../..'

	const COMPONENT_NAME = 'view-abstractions-data'

	interface Props {
		metadatamodel: any
		data?: any[]
		themecolor?: Domain.Entities.Theme.Color
		theme?: Domain.Entities.Theme.Theme
		telemetry?: Domain.Interfaces.ITelemetry
		switchbackground?: boolean
		addselectcolumn?: boolean
		addclickcolumn?: boolean
		multiselectcolumns?: boolean
		selecteddataindexes?: number[]
		filterexcludeindexes?: number[]
		selecteddataindexesactions?: { actionName: string; action: (selecteddataindexes: number[]) => void }[]
		tablecolumncontentperpage?: number
		tablerowcontentperpage?: number
		columnfieldcontentperpage?: number
		updatemetadatamodel?: (value: any) => void
		updateselecteddataindexes?: (value: number[]) => void
		rowclick?: (value: any, index: number) => void
		rounded?: boolean
		view?: View
		title?: string
	}

	let {
		metadatamodel: group,
		data = [],
		themecolor = Domain.Entities.Theme.Color.PRIMARY,
		theme = Domain.Entities.Theme.Theme.LIGHT,
		telemetry = undefined,
		switchbackground = true,
		addselectcolumn = false,
		addclickcolumn = true,
		multiselectcolumns = true,
		selecteddataindexes = [],
		filterexcludeindexes = [],
		selecteddataindexesactions = [],
		tablecolumncontentperpage = 10,
		tablerowcontentperpage = 10,
		updatemetadatamodel = undefined,
		updateselecteddataindexes = undefined,
		rowclick = undefined,
		rounded = true,
		columnfieldcontentperpage = undefined,
		view = 'list',
		title = undefined
	}: Props = $props()

	let groupStringified: string = $derived(JSON.stringify(group))

	let dataStringified: any = $derived(JSON.stringify(data))

	let viewableRows: number[] = $derived.by(() => {
		if (!Array.isArray(data)) {
			return []
		}

		let rows = data.map((_, index) => index)

		if (filterexcludeindexes.length > 0) {
			return rows.filter((_, index) => !filterexcludeindexes.includes(index))
		}

		return rows
	})
	let noOfRows: number = $derived(viewableRows.length)
	let rowsStart: number = $state(0)
	let rowsEnd: number = $state(0)

	function getFieldGroupByFieldColumnName(tableCollectionName: string, fieldColumnName: string, joinDepth: number = 0) {
		let fieldGroup: any

		MetadataModel.ForEachFieldGroup(group, (property: any) => {
			if (
				property[MetadataModel.FgProperties.DATABASE_JOIN_DEPTH] === joinDepth &&
				property[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_NAME] === tableCollectionName &&
				property[MetadataModel.FgProperties.DATABASE_FIELD_COLUMN_NAME] === fieldColumnName
			) {
				fieldGroup = JSON.parse(JSON.stringify(property))
				return true
			}
		})

		return fieldGroup
	}

	function getDatumFieldData(dIndex: number, tableCollectionName: string, fieldColumnName: string, joinDepth: number = 0) {
		let fieldGroup: any = getFieldGroupByFieldColumnName(tableCollectionName, fieldColumnName, joinDepth)

		if (!fieldGroup) {
			return undefined
		}

		try {
			return MetadataModel.DatabaseGetColumnFieldValue(
				JSON.parse(groupStringified),
				fieldColumnName,
				fieldGroup[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_UID],
				JSON.parse(dataStringified)[dIndex]
			)
		} catch (e) {
			return undefined
		}
	}

	let viewMoreDatumIndex: number | undefined = $state(undefined)

	function onupdateselecteddataindexes() {
		if (updateselecteddataindexes) {
			updateselecteddataindexes(selecteddataindexes)
		}
	}

	let containerWidth: number = $state(0)

	let metadatamodelget = new Interfaces.MetadataModels.GetMetadataModel()
	let fieldanygetmetadatamodel = new Interfaces.MetadataModels.FieldAnyGetMetadataModel(telemetry)

	let noOfTableColumns: number = $derived.by(() => {
		let ntc = 0

		if (view === 'table') {
			let extract2DFields: MetadataModel.Extract2DFields

			try {
				extract2DFields = new MetadataModel.Extract2DFields(JSON.parse(groupStringified), false, false, false)
				extract2DFields.Extract()
				extract2DFields.Reposition()
			} catch (e) {
				telemetry?.Log(COMPONENT_NAME, true, Domain.Entities.Telemetry.LogLevel.ERROR, 'Error extracting 2D fields', 'error', e)
				return ntc
			}

			extract2DFields.Fields.forEach((field) => {
				switch (field[MetadataModel.FgProperties.DATABASE_JOIN_DEPTH]) {
					case 0:
						switch (field[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_NAME]) {
							case Domain.Entities.Abstractions.RepositoryName:
								switch (field[MetadataModel.FgProperties.DATABASE_FIELD_COLUMN_NAME]) {
									case Domain.Entities.Abstractions.FieldColumn.ID:
										ntc += 1
										break
									case Domain.Entities.Abstractions.FieldColumn.Data:
										ntc += 1
										break
									case Domain.Entities.Abstractions.FieldColumn.Completed:
										ntc += 1
										break
									case Domain.Entities.Abstractions.FieldColumn.ReviewPass:
										ntc += 1
										break
								}
								break
						}
						break
					case 1:
						switch (field[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_NAME]) {
							case Domain.Entities.StorageFiles.RepositoryName:
								switch (field[MetadataModel.FgProperties.DATABASE_FIELD_COLUMN_NAME]) {
									case Domain.Entities.StorageFiles.FieldColumn.OriginalName:
										ntc += 1
										break
								}
								break
						}
						break
					case 2:
						switch (field[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_NAME]) {
							case Domain.Entities.Directory.RepositoryName:
								switch (field[MetadataModel.FgProperties.DATABASE_FIELD_COLUMN_NAME]) {
									case Domain.Entities.Directory.FieldColumn.DisplayName:
										ntc += 1
										break
								}
								break
							case Domain.Entities.DirectoryGroups.RepositoryName:
								switch (field[MetadataModel.FgProperties.DATABASE_FIELD_COLUMN_NAME]) {
									case Domain.Entities.DirectoryGroups.FieldColumn.DisplayName:
										ntc += 1
										break
								}
								break
						}
						break
				}
			})
		}

		return ntc
	})

	/**
	 * column number
	 */
	const LOCKED_FIXED_COLUMNS = 1

	let lockedColumns = $derived(LOCKED_FIXED_COLUMNS + (addselectcolumn ? 1 : 0))

	let gridTemplateColumns: number = $derived(lockedColumns + noOfTableColumns)

	let lockedColumnsWidth: number = $state(0)

	let noOfSelectedRows: number = $derived(selecteddataindexes.length)
	let columnHeaderHeight: number = $state(0)

	function getdata(path: string, arrayindexes: number[]) {
		try {
			arrayindexes = [arrayindexes[0], ...arrayindexes]
			path = path.replace(/\$/, `$.${MetadataModel.ARRAY_INDEX_PLACEHOLDER}`)
			path = MetadataModel.PreparePathToValueInObject(path, arrayindexes)
			return Json.GetValueInObject(data, path)
		} catch (e) {
			telemetry?.Log(COMPONENT_NAME, true, Domain.Entities.Telemetry.LogLevel.ERROR, 'Get Metadata Model Data failed', 'error', e)
			return undefined
		}
	}

	async function getFieldAnyMetadataModel(field: any, arrayIndexPlaceholders: number[]) {
		if (metadatamodelget === undefined) {
			return undefined
		}

		if (fieldanygetmetadatamodel === undefined) {
			return undefined
		}

		const fieldKey = field[MetadataModel.FgProperties.FIELD_GROUP_KEY]

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

		const arg = getdata(pathToDataArgument, arrayIndexPlaceholders)

		return await metadatamodelget.GetMetadataModel(
			fieldanygetmetadatamodel,
			metadataModelActionID,
			fieldKey,
			field[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_UID],
			arg
		)
	}
</script>

{#if view === 'detailed'}
	{#await import('$lib/components/MetadataModel/Table/Component.svelte') then { default: MetadataModelTable }}
		<MetadataModelTable
			metadatamodel={group}
			{theme}
			{themecolor}
			{telemetry}
			{data}
			{selecteddataindexes}
			{selecteddataindexesactions}
			{addclickcolumn}
			{addselectcolumn}
			{multiselectcolumns}
			{switchbackground}
			{filterexcludeindexes}
			{tablecolumncontentperpage}
			{tablerowcontentperpage}
			{columnfieldcontentperpage}
			{updatemetadatamodel}
			{updateselecteddataindexes}
			{rowclick}
			{metadatamodelget}
			{fieldanygetmetadatamodel}
		></MetadataModelTable>
	{/await}
{:else if view === 'list' || view === 'table'}
	<div
		class="flex flex-col gap-y-2 overflow-hidden {theme === Domain.Entities.Theme.Theme.DARK
			? switchbackground
				? 'border-gray-950 bg-gray-800'
				: 'border-gray-900 bg-gray-700'
			: switchbackground
				? 'border-gray-500 bg-gray-300'
				: 'border-gray-400 bg-gray-200'} {rounded ? 'rounded-lg' : ''}"
		bind:clientWidth={containerWidth}
	>
		{#if title}
			<header
				class="text-xl {theme === Domain.Entities.Theme.Theme.DARK
					? switchbackground
						? 'border-gray-950 bg-gray-800'
						: 'border-gray-900 bg-gray-700'
					: switchbackground
						? 'border-gray-500 bg-gray-300'
						: 'border-gray-400 bg-gray-200'}"
			>
				{title}
			</header>
			<div class="divider"></div>
		{/if}

		{#if view === 'list'}
			<main class="z-[1] flex flex-col overflow-auto">
				{#each Utils.Range(rowsStart, Utils.RangeArrayEnd(rowsEnd, noOfRows)) as rIndex (rIndex)}
					{@const rowIndex = viewableRows[rIndex]}

					<section class="flex flex-col gap-y-2">
						<header
							class="sticky top-0 z-[2] flex h-fit w-full justify-between gap-x-1 {theme === Domain.Entities.Theme.Theme.DARK
								? switchbackground
									? 'border-gray-950 bg-gray-800'
									: 'border-gray-900 bg-gray-700'
								: switchbackground
									? 'border-gray-500 bg-gray-300'
									: 'border-gray-400 bg-gray-200'} p-2"
						>
							{#if addclickcolumn}
								<!-- svelte-ignore a11y_interactive_supports_focus -->
								<!-- svelte-ignore a11y_click_events_have_key_events -->
								<div
									class="btn btn-md btn-ghost min-h-fit flex-1 justify-start pt-1 pb-1"
									role="button"
									onclick={() => {
										if (rowclick) {
											rowclick(data[rowIndex], rowIndex)
										}
									}}
								>
									{@render listviewdatum(rowIndex)}
								</div>
							{:else}
								<div class="flex flex-1 p-1">
									{@render listviewdatum(rowIndex)}
								</div>
							{/if}
							<div class="flex gap-x-8">
								<button
									class="btn btn-circle self-center"
									onclick={() => (viewMoreDatumIndex = viewMoreDatumIndex === rIndex ? undefined : rIndex)}
									aria-label="view more {rowIndex}"
								>
									{#if viewMoreDatumIndex === rIndex}
										<!--mdi:expand-less source: https://icon-sets.iconify.design-->
										<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
											<path
												fill={theme === Domain.Entities.Theme.Theme.DARK ? 'white' : 'black'}
												d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6l-6 6z"
											/>
										</svg>
									{:else}
										<!--mdi:expand-more source: https://icon-sets.iconify.design-->
										<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
											<path
												fill={theme === Domain.Entities.Theme.Theme.DARK ? 'white' : 'black'}
												d="M7.41 8.58L12 13.17l4.59-4.59L18 10l-6 6l-6-6z"
											/>
										</svg>
									{/if}
								</button>
								{#if addselectcolumn}
									<input
										class="checkbox checkbox-md self-center {themecolor === Domain.Entities.Theme.Color.PRIMARY
											? 'checkbox-primary'
											: themecolor === Domain.Entities.Theme.Color.SECONDARY
												? 'checkbox-secondary'
												: 'checkbox-accent'}"
										type="checkbox"
										checked={selecteddataindexes.includes(rowIndex)}
										oninput={(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
											if (e.currentTarget.checked) {
												if (multiselectcolumns) {
													selecteddataindexes = [...selecteddataindexes, rowIndex]
												} else {
													selecteddataindexes = [rowIndex]
												}
											} else {
												selecteddataindexes = selecteddataindexes.filter((srIndex) => srIndex !== rowIndex)
											}
											onupdateselecteddataindexes()
										}}
									/>
								{/if}
							</div>
						</header>

						{#if viewMoreDatumIndex === rIndex}
							{#await import('../Datum/Component.svelte') then { default: Datum }}
								<main class="z-[1] p-2">
									<Datum
										metadatamodel={group}
										data={data[rowIndex]}
										{theme}
										{themecolor}
										{telemetry}
										switchbackground={!switchbackground}
										title={'Abstraction Information'}
									></Datum>
								</main>
							{/await}
						{:else if rIndex !== rowsEnd}
							<div class="divider mt-0 mb-0"></div>
						{/if}
					</section>
				{/each}
			</main>
		{:else}
			<main class="relative z-[1] grid overflow-auto" style="grid-template-columns: subgrid; grid-column: span {gridTemplateColumns};">
				<header
					class="sticky top-0 z-[2] grid {theme === Domain.Entities.Theme.Theme.DARK
						? switchbackground
							? 'border-gray-950 bg-gray-800'
							: 'border-gray-900 bg-gray-700'
						: switchbackground
							? 'border-gray-500 bg-gray-300'
							: 'border-gray-400 bg-gray-200'}"
					style="grid-template-columns: subgrid; grid-column: span {gridTemplateColumns};"
					bind:clientHeight={columnHeaderHeight}
				>
					<section
						style="grid-column: span {lockedColumns}; left: 0px; grid-template-columns: subgrid;"
						class="sticky z-[2] grid shadow-sm shadow-gray-800 {theme === Domain.Entities.Theme.Theme.DARK
							? switchbackground
								? 'border-gray-950 bg-gray-800'
								: 'border-gray-900 bg-gray-700'
							: switchbackground
								? 'border-gray-500 bg-gray-300'
								: 'border-gray-400 bg-gray-200'}"
						bind:clientWidth={lockedColumnsWidth}
					>
						<div class="flex h-full w-[47px] max-w-[47px] justify-center p-1 text-lg font-bold">
							<div class="h-fit w-fit self-center">#</div>
						</div>

						{#if addselectcolumn}
							<div
								class="tooltip tooltip-right h-fit w-fit self-center {themecolor === Domain.Entities.Theme.Color.PRIMARY
									? 'tooltip-primary'
									: themecolor === Domain.Entities.Theme.Color.SECONDARY
										? 'tooltip-secondary'
										: 'tooltip-accent'} p-1"
								data-tip="select/unselect rows"
							>
								<input
									class="checkbox checkbox-md {themecolor === Domain.Entities.Theme.Color.PRIMARY
										? 'checkbox-primary'
										: themecolor === Domain.Entities.Theme.Color.SECONDARY
											? 'checkbox-secondary'
											: 'checkbox-accent'}"
									type="checkbox"
									checked={noOfSelectedRows >= noOfRows || (!multiselectcolumns && noOfSelectedRows === 1)}
									oninput={(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
										if (e.currentTarget.checked) {
											if (multiselectcolumns) {
												selecteddataindexes = data.map((_, index) => index)
											}
										} else {
											selecteddataindexes = []
										}
										onupdateselecteddataindexes()
									}}
								/>
							</div>
						{/if}
					</section>

					<span class="min-w-[250px]">
						{#if getFieldGroupByFieldColumnName(Domain.Entities.Abstractions.RepositoryName, Domain.Entities.Abstractions.FieldColumn.ID, 0)}
							{@render headerFieldColumn('Abstraction ID')}
						{/if}
					</span>

					{#if getFieldGroupByFieldColumnName(Domain.Entities.Abstractions.RepositoryName, Domain.Entities.Abstractions.FieldColumn.Data, 0)}
						{@render headerFieldColumn('Abstraction Data')}
					{/if}

					<span class="min-w-[150px]">
						{#if getFieldGroupByFieldColumnName(Domain.Entities.Abstractions.RepositoryName, Domain.Entities.Abstractions.FieldColumn.Completed, 0)}
							{@render headerFieldColumn('Abstraction Completed?')}
						{/if}
					</span>

					<span class="min-w-[150px]">
						{#if getFieldGroupByFieldColumnName(Domain.Entities.Abstractions.RepositoryName, Domain.Entities.Abstractions.FieldColumn.ReviewPass, 0)}
							{@render headerFieldColumn('Abstraction Passed Checks?')}
						{/if}
					</span>

					<span class="min-w-[150px]">
						{#if getFieldGroupByFieldColumnName(Domain.Entities.StorageFiles.RepositoryName, Domain.Entities.StorageFiles.FieldColumn.OriginalName, 1)}
							{@render headerFieldColumn('File Original Name')}
						{/if}
					</span>

					<span class="min-w-[150px]">
						{#if getFieldGroupByFieldColumnName(Domain.Entities.Directory.RepositoryName, Domain.Entities.Directory.FieldColumn.DisplayName, 1)}
							{@render headerFieldColumn('Current Author Name')}
						{/if}
					</span>

					<span class="min-w-[150px]">
						{#if getFieldGroupByFieldColumnName(Domain.Entities.MetadataModels.RepositoryName, Domain.Entities.MetadataModels.FieldColumn.Name, 2)}
							{@render headerFieldColumn('Model Name')}
						{/if}
					</span>

					<span class="min-w-[150px]">
						{#if getFieldGroupByFieldColumnName(Domain.Entities.DirectoryGroups.RepositoryName, Domain.Entities.DirectoryGroups.FieldColumn.DisplayName, 2)}
							{@render headerFieldColumn('Group Name')}
						{/if}
					</span>
				</header>

				<main class="z-[1] grid" style="grid-template-columns: subgrid; grid-column: span {gridTemplateColumns};">
					{#each Utils.Range(rowsStart, Utils.RangeArrayEnd(rowsEnd, noOfRows)) as rIndex (rIndex)}
						{@const rowIndex = viewableRows[rIndex]}

						{@const stickytop = columnHeaderHeight + 6}

						<section
							style="grid-template-columns: subgrid; grid-column: span {gridTemplateColumns};"
							class="grid {rIndex !== rowsEnd ? 'border-b border-gray-800' : ''}"
						>
							<section
								style="grid-column: span {lockedColumns}; left: 0px; grid-template-columns: subgrid;"
								class="sticky z-[2] grid shadow-sm shadow-gray-800 {theme === Domain.Entities.Theme.Theme.DARK
									? switchbackground
										? 'border-gray-950 bg-gray-800'
										: 'border-gray-900 bg-gray-700'
									: switchbackground
										? 'border-gray-500 bg-gray-300'
										: 'border-gray-400 bg-gray-200'} min-w-full"
							>
								<div class="flex h-full w-[47px] min-w-fit justify-center p-1 text-lg font-bold">
									<button
										class="btn btn-sm btn-circle {themecolor === Domain.Entities.Theme.Color.PRIMARY
											? 'btn-primary'
											: themecolor === Domain.Entities.Theme.Color.SECONDARY
												? 'btn-secondary'
												: 'btn-accent'}"
										style="top: {stickytop}px;"
										aria-label="click row {rIndex}"
										onclick={() => {
											if (rowclick) {
												rowclick(data[rowIndex], rowIndex)
											}
										}}
									>
										{rowIndex + 1}
									</button>
								</div>

								{#if addselectcolumn}
									<div
										class="tooltip tooltip-right sticky h-fit w-fit self-start {themecolor === Domain.Entities.Theme.Color.PRIMARY
											? 'tooltip-primary'
											: themecolor === Domain.Entities.Theme.Color.SECONDARY
												? 'tooltip-secondary'
												: 'tooltip-accent'} p-1"
										data-tip="select/unselect row"
										style="top: {stickytop}px;"
									>
										<input
											class="checkbox checkbox-md {themecolor === Domain.Entities.Theme.Color.PRIMARY
												? 'checkbox-primary'
												: themecolor === Domain.Entities.Theme.Color.SECONDARY
													? 'checkbox-secondary'
													: 'checkbox-accent'}"
											type="checkbox"
											checked={selecteddataindexes.includes(rowIndex)}
											oninput={(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
												if (e.currentTarget.checked) {
													if (multiselectcolumns) {
														selecteddataindexes = [...selecteddataindexes, rowIndex]
													} else {
														selecteddataindexes = [rowIndex]
													}
												} else {
													selecteddataindexes = selecteddataindexes.filter((srIndex) => srIndex !== rowIndex)
												}
												onupdateselecteddataindexes()
											}}
										/>
									</div>
								{/if}
							</section>

							{#if getFieldGroupByFieldColumnName(Domain.Entities.Abstractions.RepositoryName, Domain.Entities.Abstractions.FieldColumn.ID, 0)}
								<span class="z-[0] p-2">{@render datumid(rowIndex)}</span>
							{/if}

							{#if getFieldGroupByFieldColumnName(Domain.Entities.Abstractions.RepositoryName, Domain.Entities.Abstractions.FieldColumn.Data, 0)}
								<span class="z-[0] p-2">{@render datumdata(rowIndex)}</span>
							{/if}

							{#if getFieldGroupByFieldColumnName(Domain.Entities.Abstractions.RepositoryName, Domain.Entities.Abstractions.FieldColumn.Completed, 0)}
								<span class="z-[0] p-2">{@render datumcompleted(rowIndex)}</span>
							{/if}

							{#if getFieldGroupByFieldColumnName(Domain.Entities.Abstractions.RepositoryName, Domain.Entities.Abstractions.FieldColumn.ReviewPass, 0)}
								<span class="z-[0] p-2">{@render datumreviewpass(rowIndex)}</span>
							{/if}

							{#if getFieldGroupByFieldColumnName(Domain.Entities.StorageFiles.RepositoryName, Domain.Entities.StorageFiles.FieldColumn.OriginalName, 1)}
								<span class="z-[0] p-2">{@render datumfilename(rowIndex)}</span>
							{/if}

							{#if getFieldGroupByFieldColumnName(Domain.Entities.Directory.RepositoryName, Domain.Entities.Directory.FieldColumn.DisplayName, 1)}
								<span class="z-[0] p-2">{@render datumdirectorydisplayname(rowIndex)}</span>
							{/if}

							{#if getFieldGroupByFieldColumnName(Domain.Entities.MetadataModels.RepositoryName, Domain.Entities.MetadataModels.FieldColumn.Name, 2)}
								<span class="z-[0] p-2">{@render datummodelname(rowIndex)}</span>
							{/if}

							{#if getFieldGroupByFieldColumnName(Domain.Entities.DirectoryGroups.RepositoryName, Domain.Entities.DirectoryGroups.FieldColumn.DisplayName, 2)}
								<span class="z-[0] p-2">{@render datumgroupdisplayname(rowIndex)}</span>
							{/if}
						</section>
					{/each}
				</main>
			</main>
		{/if}

		<footer
			class="z-[2] flex {containerWidth > 375 ? 'justify-between' : 'justify-center'} {noOfRows > tablerowcontentperpage
				? 'gap-y-1 p-2'
				: ''} {theme === Domain.Entities.Theme.Theme.DARK
				? switchbackground
					? 'border-gray-950 bg-gray-800'
					: 'border-gray-900 bg-gray-700'
				: switchbackground
					? 'border-gray-500 bg-gray-300'
					: 'border-gray-400 bg-gray-200'}"
		>
			{#if containerWidth > 375 && noOfRows > tablerowcontentperpage}
				<span class="sticky flex w-fit gap-x-2" style="left: 0px;">
					<span class="input">
						<span class="label">Total No of Authorization Rules:</span>
						<span>{noOfRows}</span>
					</span>
				</span>
			{/if}

			<span class="sticky right-[10px] max-h-fit self-center">
				<Pagination
					{themecolor}
					lengthofdata={noOfRows}
					start={rowsStart}
					end={rowsEnd}
					updatestart={(n) => {
						rowsStart = n
					}}
					updateend={(n) => {
						rowsEnd = n
					}}
					{telemetry}
					contentperpage={tablerowcontentperpage}
					displayiflengthofdatagreaterthancontentperpage={true}
					minified={true}
				></Pagination>
			</span>
		</footer>
	</div>
{:else}
	<div class="text-error">...unsupported view <span class="font-bold italic">{view}</span>...</div>
{/if}

{#snippet headerFieldColumn(tableColumnName: string)}
	<div class="h-full w-full">
		<span class="sticky flex w-fit flex-col gap-y-2 self-center p-1" style="left: {lockedColumnsWidth}px;">{tableColumnName}</span>
	</div>
{/snippet}

{#snippet datumdirectorydisplayname(dIndex: number, joinDepth: number = 1)}
	{@const fieldData = getDatumFieldData(
		dIndex,
		Domain.Entities.Directory.RepositoryName,
		Domain.Entities.Directory.FieldColumn.DisplayName,
		joinDepth
	)}

	<span>
		{#if Array.isArray(fieldData) && fieldData.length > 0}
			{fieldData[0]}
		{:else}
			{@render nodata()}
		{/if}
	</span>
{/snippet}

{#snippet datummodelname(dIndex: number, joinDepth: number = 2)}
	{@const fieldData = getDatumFieldData(
		dIndex,
		Domain.Entities.MetadataModels.RepositoryName,
		Domain.Entities.MetadataModels.FieldColumn.Name,
		joinDepth
	)}

	<span>
		{#if Array.isArray(fieldData) && fieldData.length > 0}
			{fieldData[0]}
		{:else}
			{@render nodata()}
		{/if}
	</span>
{/snippet}

{#snippet datumgroupdisplayname(dIndex: number, joinDepth: number = 2)}
	{@const fieldData = getDatumFieldData(
		dIndex,
		Domain.Entities.DirectoryGroups.RepositoryName,
		Domain.Entities.DirectoryGroups.FieldColumn.DisplayName,
		joinDepth
	)}

	<span>
		{#if Array.isArray(fieldData) && fieldData.length > 0}
			{fieldData[0]}
		{:else}
			{@render nodata()}
		{/if}
	</span>
{/snippet}

{#snippet datumfilename(dIndex: number, joinDepth: number = 1)}
	{@const fieldData = getDatumFieldData(
		dIndex,
		Domain.Entities.StorageFiles.RepositoryName,
		Domain.Entities.StorageFiles.FieldColumn.OriginalName,
		joinDepth
	)}

	<span>
		{#if Array.isArray(fieldData) && fieldData.length > 0}
			{fieldData[0]}
		{:else}
			{@render nodata()}
		{/if}
	</span>
{/snippet}

{#snippet datumreviewpass(dIndex: number, joinDepth: number = 0)}
	{@const fieldData = getDatumFieldData(
		dIndex,
		Domain.Entities.Abstractions.RepositoryName,
		Domain.Entities.Abstractions.FieldColumn.ReviewPass,
		joinDepth
	)}

	<span>
		{#if Array.isArray(fieldData) && fieldData.length > 0}
			{fieldData[0] ? 'yes' : 'no'}
		{:else}
			{@render nodata()}
		{/if}
	</span>
{/snippet}

{#snippet datumcompleted(dIndex: number, joinDepth: number = 0)}
	{@const fieldData = getDatumFieldData(
		dIndex,
		Domain.Entities.Abstractions.RepositoryName,
		Domain.Entities.Abstractions.FieldColumn.Completed,
		joinDepth
	)}

	<span>
		{#if Array.isArray(fieldData) && fieldData.length > 0}
			{fieldData[0] ? 'yes' : 'no'}
		{:else}
			{@render nodata()}
		{/if}
	</span>
{/snippet}

{#snippet datumdata(dIndex: number, joinDepth: number = 0)}
	{@const fieldData = getDatumFieldData(
		dIndex,
		Domain.Entities.Abstractions.RepositoryName,
		Domain.Entities.Abstractions.FieldColumn.Data,
		joinDepth
	)}

	{#if Array.isArray(fieldData)}
		<span>
			{#await getFieldAnyMetadataModel( getFieldGroupByFieldColumnName(Domain.Entities.Abstractions.RepositoryName, Domain.Entities.Abstractions.FieldColumn.Data, joinDepth), [dIndex] ) then fieldAnyMetadataModel}
				{#if fieldAnyMetadataModel !== undefined}
					{#await import('$lib/components/MetadataModel/Table/Component.svelte') then { default: MetadataModelTable }}
						<MetadataModelTable
							metadatamodel={fieldAnyMetadataModel}
							data={fieldData}
							{themecolor}
							{theme}
							{telemetry}
							{metadatamodelget}
							switchbackground={!switchbackground}
							{fieldanygetmetadatamodel}
						></MetadataModelTable>
					{/await}
				{:else}
					{@render json(fieldData)}
				{/if}
			{/await}
		</span>
	{:else}
		<span>
			{@render nodata()}
		</span>
	{/if}
{/snippet}

{#snippet datumid(dIndex: number, joinDepth: number = 0)}
	{@const fieldData = getDatumFieldData(dIndex, Domain.Entities.Abstractions.RepositoryName, Domain.Entities.Abstractions.FieldColumn.ID, joinDepth)}

	<span>
		{#if Array.isArray(fieldData) && fieldData.length > 0}
			{fieldData[0]}
		{:else}
			{@render nodata()}
		{/if}
	</span>
{/snippet}

{#snippet listviewdatum(dIndex: number)}
	<div class="flex gap-x-4">
		<div
			class="btn-circle btn-lg flex justify-center self-center {theme === Domain.Entities.Theme.Theme.LIGHT
				? switchbackground
					? 'border-gray-950 bg-gray-800'
					: 'border-gray-900 bg-gray-700'
				: switchbackground
					? 'border-gray-500 bg-gray-300'
					: 'border-gray-400 bg-gray-200'}"
		>
			<!--mdi:notebook-edit source: https://icon-sets.iconify.design-->
			<svg class="self-center" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
				<path
					fill={theme === Domain.Entities.Theme.Theme.LIGHT ? (switchbackground ? 'white' : 'white') : switchbackground ? 'black' : 'black'}
					d="M21.04 13.13c.14 0 .27.06.38.17l1.28 1.28c.22.21.22.56 0 .77l-1 1l-2.05-2.05l1-1c.11-.11.25-.17.39-.17m-1.97 1.75l2.05 2.05L15.06 23H13v-2.06zM3 7V5h2V4a2 2 0 0 1 2-2h6v7l2.5-1.5L18 9V2h1c1.05 0 2 .95 2 2v6L11 20v2H7c-1.05 0-2-.95-2-2v-1H3v-2h2v-4H3v-2h2V7zm2 0h2V5H5zm0 4v2h2v-2zm0 6v2h2v-2z"
				/>
			</svg>
		</div>

		<div class="grid flex-1" style="grid-template-columns: auto auto 2fr;">
			<span class="self-center text-right text-sm">Abstraction ID</span>
			<div class="divider divider-horizontal mr-0 ml-0"></div>
			<span class="font-bold">{@render datumid(dIndex)}</span>

			<span class="self-center text-right text-sm">Current Author Name</span>
			<div class="divider divider-horizontal mr-0 ml-0"></div>
			<span class="italic">{@render datumdirectorydisplayname(dIndex)}</span>

			<span class="self-center text-right text-sm">Completed? / Checks Passed?</span>
			<div class="divider divider-horizontal mr-0 ml-0"></div>
			<span class="text-sm">{@render datumcompleted(dIndex)} / {@render datumreviewpass(dIndex)}</span>

			<span class="self-center text-right text-sm">File Original Name</span>
			<div class="divider divider-horizontal mr-0 ml-0"></div>
			<span class="text-sm">{@render datumfilename(dIndex)}</span>

			<span class="self-center text-right text-sm">Model Name</span>
			<div class="divider divider-horizontal mr-0 ml-0"></div>
			<span class="text-sm">{@render datummodelname(dIndex)}</span>

			<span class="self-center text-right text-sm">Group Name</span>
			<div class="divider divider-horizontal mr-0 ml-0"></div>
			<span class="text-sm">{@render datumgroupdisplayname(dIndex)}</span>
		</div>
	</div>
{/snippet}

{#snippet nodata()}
	<span class="h-fit self-center text-sm italic">...no data...</span>
{/snippet}

{#snippet json(value: any)}
	<pre
		class="h-fit max-h-[50vh] w-full flex-1 overflow-auto rounded-md {theme === Domain.Entities.Theme.Theme.DARK
			? switchbackground
				? 'bg-gray-800'
				: 'border-gray-900 bg-gray-700'
			: switchbackground
				? 'bg-gray-300'
				: 'bg-gray-200'} p-1 shadow-inner shadow-gray-800 lg:max-w-[50vw]"><code>{JSON.stringify(value, null, 4)}</code></pre>
{/snippet}
