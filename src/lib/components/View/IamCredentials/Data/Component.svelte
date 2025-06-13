<script lang="ts">
	import { Domain, Interfaces, MetadataModel, Utils } from '$lib'
	import { Pagination } from '$lib/components/Pagination'
	import type { View } from '../..'

	const COMPONENT_NAME = 'view-iam-credentials-data'

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
							case Domain.Entities.IamCredentials.RepositoryName:
								switch (field[MetadataModel.FgProperties.DATABASE_FIELD_COLUMN_NAME]) {
									case Domain.Entities.IamCredentials.FieldColumn.OpenidPreferredUsername:
										ntc += 1
										break
									case Domain.Entities.IamCredentials.FieldColumn.OpenidEmail:
										ntc += 1
										break
									case Domain.Entities.IamCredentials.FieldColumn.OpenidGivenName:
										ntc += 1
										break
									case Domain.Entities.IamCredentials.FieldColumn.OpenidFamilyName:
										ntc += 1
										break
								}
						}
						break
					case 1:
						switch (field[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_NAME]) {
							case Domain.Entities.Directory.RepositoryName:
								switch (field[MetadataModel.FgProperties.DATABASE_FIELD_COLUMN_NAME]) {
									case Domain.Entities.Directory.FieldColumn.DisplayName:
										ntc += 1
										break
								}
								break
						}
						break
					case 2:
						switch (field[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_NAME]) {
							case Domain.Entities.DirectoryGroups.RepositoryName:
								switch (field[MetadataModel.FgProperties.DATABASE_FIELD_COLUMN_NAME]) {
									case Domain.Entities.DirectoryGroups.FieldColumn.DisplayName:
										ntc += 1
										break
									case Domain.Entities.DirectoryGroups.FieldColumn.Description:
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
										title={'Credential Information'}
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
										: 'tooltip-accent'}"
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

					{#if getFieldGroupByFieldColumnName(Domain.Entities.IamCredentials.RepositoryName, Domain.Entities.IamCredentials.FieldColumn.OpenidGivenName, 0)}
						{@render headerFieldColumn('Given Name')}
					{/if}

					{#if getFieldGroupByFieldColumnName(Domain.Entities.IamCredentials.RepositoryName, Domain.Entities.IamCredentials.FieldColumn.OpenidFamilyName, 0)}
						{@render headerFieldColumn('Family  Name')}
					{/if}

					{#if getFieldGroupByFieldColumnName(Domain.Entities.IamCredentials.RepositoryName, Domain.Entities.IamCredentials.FieldColumn.OpenidPreferredUsername, 0)}
						{@render headerFieldColumn('Username')}
					{/if}

					{#if getFieldGroupByFieldColumnName(Domain.Entities.IamCredentials.RepositoryName, Domain.Entities.IamCredentials.FieldColumn.OpenidEmail, 0)}
						{@render headerFieldColumn('Email')}
					{/if}

					{#if getFieldGroupByFieldColumnName(Domain.Entities.Directory.RepositoryName, Domain.Entities.Directory.FieldColumn.DisplayName, 1)}
						{@render headerFieldColumn('Directory Name')}
					{/if}

					{#if getFieldGroupByFieldColumnName(Domain.Entities.DirectoryGroups.RepositoryName, Domain.Entities.Directory.FieldColumn.DisplayName, 2)}
						{@render headerFieldColumn('Group Name')}
					{/if}

					{#if getFieldGroupByFieldColumnName(Domain.Entities.DirectoryGroups.RepositoryName, Domain.Entities.DirectoryGroups.FieldColumn.Description, 2)}
						{@render headerFieldColumn('Group Description')}
					{/if}
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
										: 'border-gray-400 bg-gray-200'}"
							>
								<div class="flex h-full w-[47px] min-w-fit justify-center p-1 text-lg font-bold">
									<button
										class="btn btn-sm btn-circle sticky {themecolor === Domain.Entities.Theme.Color.PRIMARY
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
												: 'tooltip-accent'}"
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

							{#if getFieldGroupByFieldColumnName(Domain.Entities.IamCredentials.RepositoryName, Domain.Entities.IamCredentials.FieldColumn.OpenidGivenName, 0)}
								<span class="z-[0] p-2">{@render datumiamcredentialgivenname(rowIndex)}</span>
							{/if}

							{#if getFieldGroupByFieldColumnName(Domain.Entities.IamCredentials.RepositoryName, Domain.Entities.IamCredentials.FieldColumn.OpenidFamilyName, 0)}
								<span class="z-[0] p-2">{@render datumiamcredentialfamilyname(rowIndex)}</span>
							{/if}

							{#if getFieldGroupByFieldColumnName(Domain.Entities.IamCredentials.RepositoryName, Domain.Entities.IamCredentials.FieldColumn.OpenidPreferredUsername, 0)}
								<span class="z-[0] p-2">{@render datumiamcredentialusername(rowIndex)}</span>
							{/if}

							{#if getFieldGroupByFieldColumnName(Domain.Entities.IamCredentials.RepositoryName, Domain.Entities.IamCredentials.FieldColumn.OpenidEmail, 0)}
								<span class="z-[0] p-2">{@render datumiamcredentialemail(rowIndex)}</span>
							{/if}

							{#if getFieldGroupByFieldColumnName(Domain.Entities.Directory.RepositoryName, Domain.Entities.Directory.FieldColumn.DisplayName, 1)}
								<span class="z-[0] p-2">{@render datumdirectorydisplayname(rowIndex)}</span>
							{/if}

							{#if getFieldGroupByFieldColumnName(Domain.Entities.DirectoryGroups.RepositoryName, Domain.Entities.DirectoryGroups.FieldColumn.DisplayName, 2)}
								<span class="z-[0] p-2">{@render datumgroupdisplayname(rowIndex)}</span>
							{/if}

							{#if getFieldGroupByFieldColumnName(Domain.Entities.DirectoryGroups.RepositoryName, Domain.Entities.DirectoryGroups.FieldColumn.Description, 2)}
								<span class="z-[0] p-2">{@render datumgroupdescription(rowIndex)}</span>
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
						<span class="label">Total No of Group Roles:</span>
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

{#snippet datumiamcredentialfamilyname(dIndex: number, joinDepth: number = 0)}
	{@const fieldData = getDatumFieldData(
		dIndex,
		Domain.Entities.IamCredentials.RepositoryName,
		Domain.Entities.IamCredentials.FieldColumn.OpenidFamilyName,
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

{#snippet datumiamcredentialgivenname(dIndex: number, joinDepth: number = 0)}
	{@const fieldData = getDatumFieldData(
		dIndex,
		Domain.Entities.IamCredentials.RepositoryName,
		Domain.Entities.IamCredentials.FieldColumn.OpenidGivenName,
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

{#snippet datumiamcredentialusername(dIndex: number, joinDepth: number = 0)}
	{@const fieldData = getDatumFieldData(
		dIndex,
		Domain.Entities.IamCredentials.RepositoryName,
		Domain.Entities.IamCredentials.FieldColumn.OpenidPreferredUsername,
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

{#snippet datumiamcredentialemail(dIndex: number, joinDepth: number = 0)}
	{@const fieldData = getDatumFieldData(
		dIndex,
		Domain.Entities.IamCredentials.RepositoryName,
		Domain.Entities.IamCredentials.FieldColumn.OpenidEmail,
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

	<span class="italic">
		{#if Array.isArray(fieldData) && fieldData.length > 0}
			{fieldData[0]}
		{:else}
			{@render nodata()}
		{/if}
	</span>
{/snippet}

{#snippet datumgroupdescription(dIndex: number, joinDepth: number = 2)}
	{@const fieldData = getDatumFieldData(
		dIndex,
		Domain.Entities.DirectoryGroups.RepositoryName,
		Domain.Entities.DirectoryGroups.FieldColumn.Description,
		joinDepth
	)}

	<span class="text-wrap break-words">
		{#if Array.isArray(fieldData) && fieldData.length > 0}
			{fieldData[0]}
		{:else}
			{@render nodata()}
		{/if}
	</span>
{/snippet}

{#snippet datumdirectorydisplayname(dIndex: number, joinDepth: number = 1)}
	{@const fieldData = getDatumFieldData(
		dIndex,
		Domain.Entities.Directory.RepositoryName,
		Domain.Entities.Directory.FieldColumn.DisplayName,
		joinDepth
	)}

	<span class="italic">
		{#if Array.isArray(fieldData) && fieldData.length > 0}
			{fieldData[0]}
		{:else}
			{@render nodata()}
		{/if}
	</span>
{/snippet}

{#snippet listviewdatumdeactivatedon(dIndex: number, joinDepth: number = 0)}
	{@const fieldData = getDatumFieldData(
		dIndex,
		Domain.Entities.IamGroupAuthorizations.RepositoryName,
		Domain.Entities.IamGroupAuthorizations.FieldColumn.DeactivatedOn,
		joinDepth
	)}

	{#if Array.isArray(fieldData) && fieldData.length > 0}
		<span class="text-right text-sm">deactivated-on</span>
		<div class="divider divider-horizontal mr-0 ml-0"></div>
		<span class="text-sm italic">{fieldData[0]}</span>
	{/if}
{/snippet}

{#snippet listviewdatumdirectorygroupdisplayname(dIndex: number, joinDepth: number = 1)}
	{@const fieldData = getDatumFieldData(
		dIndex,
		Domain.Entities.DirectoryGroups.RepositoryName,
		Domain.Entities.DirectoryGroups.FieldColumn.DisplayName,
		joinDepth
	)}

	{#if Array.isArray(fieldData) && fieldData.length > 0}
		<span class="text-right text-sm">group-name</span>
		<div class="divider divider-horizontal mr-0 ml-0"></div>
		<span class="text-sm">{fieldData[0]}</span>
	{/if}
{/snippet}

{#snippet listviewdatumdirectorydisplayname(dIndex: number, joinDepth: number = 1)}
	{@const fieldData = getDatumFieldData(
		dIndex,
		Domain.Entities.Directory.RepositoryName,
		Domain.Entities.Directory.FieldColumn.DisplayName,
		joinDepth
	)}

	{#if Array.isArray(fieldData) && fieldData.length > 0}
		<span class="text-right text-sm">directory-name</span>
		<div class="divider divider-horizontal mr-0 ml-0"></div>
		<span class="text-sm">{fieldData[0]}</span>
	{/if}
{/snippet}

{#snippet datumiamcredentialname(dIndex: number, joinDepth: number = 0)}
	{@const lastName = getDatumFieldData(
		dIndex,
		Domain.Entities.IamCredentials.RepositoryName,
		Domain.Entities.IamCredentials.FieldColumn.OpenidFamilyName,
		joinDepth
	)}

	{@const firstName = getDatumFieldData(
		dIndex,
		Domain.Entities.IamCredentials.RepositoryName,
		Domain.Entities.IamCredentials.FieldColumn.OpenidGivenName,
		joinDepth
	)}

	<span class="flex text-lg font-bold">
		{#if Array.isArray(lastName) && lastName.length > 0 && Array.isArray(firstName) && firstName.length > 0}
			{lastName[0]} {firstName[0]}
		{:else}
			{@const userName = getDatumFieldData(
				dIndex,
				Domain.Entities.IamCredentials.RepositoryName,
				Domain.Entities.IamCredentials.FieldColumn.OpenidPreferredUsername,
				joinDepth
			)}

			{#if Array.isArray(userName) && userName.length > 0}
				{userName[0]}
			{:else}
				{@render nodata()}
			{/if}
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
			<!--carbon:user-lock source: https://icon-sets.iconify.design-->
			<svg class="self-center" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
				<path
					fill={theme === Domain.Entities.Theme.Theme.LIGHT ? (switchbackground ? 'white' : 'white') : switchbackground ? 'black' : 'black'}
					d="M6 8c0-2.21 1.79-4 4-4s4 1.79 4 4s-1.79 4-4 4s-4-1.79-4-4m6 10.2c0-.96.5-1.86 1.2-2.46v-.24c0-.39.07-.76.18-1.12c-1.03-.24-2.17-.38-3.38-.38c-4.42 0-8 1.79-8 4v2h10zm10 .1v3.5c0 .6-.6 1.2-1.3 1.2h-5.5c-.6 0-1.2-.6-1.2-1.3v-3.5c0-.6.6-1.2 1.2-1.2v-1.5c0-1.4 1.4-2.5 2.8-2.5s2.8 1.1 2.8 2.5V17c.6 0 1.2.6 1.2 1.3m-2.5-2.8c0-.8-.7-1.3-1.5-1.3s-1.5.5-1.5 1.3V17h3z"
				/>
			</svg>
		</div>

		<div class="grid flex-1" style="grid-template-columns: auto auto 2fr;">
			<span class="self-center text-right text-sm">name</span>
			<div class="divider divider-horizontal mr-0 ml-0"></div>
			{@render datumiamcredentialname(dIndex)}

			{@render listviewdatumdirectorydisplayname(dIndex)}

			{@render listviewdatumdirectorygroupdisplayname(dIndex)}

			{@render listviewdatumdeactivatedon(dIndex)}
		</div>
	</div>
{/snippet}

{#snippet nodata()}
	<span class="h-fit self-center text-sm italic">...no data...</span>
{/snippet}
