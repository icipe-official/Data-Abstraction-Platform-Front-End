<!--
@component

Props:
- 

-->
<script lang="ts">
	import { Domain, MetadataModel, Utils } from '$lib'
	import { Pagination } from '$lib/components/Pagination'
	import Papa from 'papaparse'
	import { untrack } from 'svelte'

	const COMPONENT_NAME = 'metadata-model-table'

	interface Props {
		group: any
		data?: any[]
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
		updateselecteddataindexes?: (value: number[]) => void
		rowclick?: (value: any, index: number) => void
		getdata: (path: string, arrayindexes: number[]) => void
		metadatamodelget?: Domain.Interfaces.MetadataModels.Get
		fieldanygetmetadatamodel?: Domain.Interfaces.MetadataModels.IFieldAnyGetMetadataModel
	}

	let {
		group,
		data = [],
		arrayindexplaceholders = [],
		themecolor = Domain.Entities.Theme.Color.PRIMARY,
		telemetry = undefined,
		theme = Domain.Entities.Theme.Theme.LIGHT,
		addselectcolumn = false,
		addclickcolumn = true,
		multiselectcolumns = true,
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
		updateselecteddataindexes = undefined,
		rowclick = undefined,
		getdata,
		metadatamodelget = undefined,
		fieldanygetmetadatamodel = undefined
	}: Props = $props()

	let groupKey: string = $derived(group[MetadataModel.FgProperties.FIELD_GROUP_KEY])

	let view2D: boolean = $derived(group[MetadataModel.FgProperties.GROUP_VIEW_TABLE_IN_2D])

	function newExtract2DFields(newGroup: any, skipIfFGDisabled: boolean = true, skipIfDataExtraction: boolean = true) {
		return new MetadataModel.Extract2DFields(JSON.parse(JSON.stringify(newGroup)), skipIfFGDisabled, skipIfDataExtraction, false)
	}

	let fields: any[] = $derived.by(() => {
		if (view2D) {
			try {
				const extract2DFields = newExtract2DFields(group, false, false)
				extract2DFields.Extract()
				extract2DFields.Reposition()

				return extract2DFields.Fields
			} catch (e) {
				telemetry?.Log(COMPONENT_NAME, true, Domain.Entities.Telemetry.LogLevel.ERROR, 'error extracting 2D fields', 'error', e, 'group', group)
				return []
			}
		} else {
			if (MetadataModel.IsGroupFieldContainsGroup(group)) {
				const groupFields = group[MetadataModel.FgProperties.GROUP_FIELDS][0]

				let fds: any[] = []

				for (const field of group[MetadataModel.FgProperties.GROUP_READ_ORDER_OF_FIELDS]) {
					if (typeof groupFields[field] === 'object' && !Array.isArray(groupFields[field])) {
						fds.push(groupFields[field])
					}
				}
				return fds
			}
		}

		return []
	})

	let lockedFields: number[] = $derived(
		fields.map((_, fIndex) => fIndex).filter((fIndex) => fields[fIndex][MetadataModel.FgProperties.FIELD_GROUP_VIEW_TABLE_LOCK_COLUMN])
	)

	let unlockedViewableFields: number[] = $derived(
		fields
			.map((_, fIndex) => fIndex)
			.filter(
				(fIndex) =>
					!fields[fIndex][MetadataModel.FgProperties.FIELD_GROUP_VIEW_TABLE_LOCK_COLUMN] &&
					!fields[fIndex][MetadataModel.FgProperties.FIELD_GROUP_VIEW_DISABLE]
			)
	)

	let noOfUnclockedViewableColumnFields: number = $derived(unlockedViewableFields.length)
	let unlockedViewableColumnFieldsStart: number = $state(0)
	let unlockedViewableColumnFieldsEnd: number = $state(0)

	let showUnlockedColumPagination: boolean = $derived(noOfUnclockedViewableColumnFields > tablecolumncontentperpage)

	/**
	 * column number
	 */
	const LOCKED_FIXED_COLUMNS = 1

	let lockedColumns = $derived(LOCKED_FIXED_COLUMNS + (view2D ? 1 : 0) + (addselectcolumn ? 1 : 0))

	let gridTemplateColumns: number = $derived(
		lockedFields.length +
			(noOfUnclockedViewableColumnFields === 0
				? 0
				: noOfUnclockedViewableColumnFields === 1
					? 1
					: unlockedViewableColumnFieldsEnd - unlockedViewableColumnFieldsStart + 1) +
			lockedColumns
	)

	function newObjectTo2DArray(
		newGroup: any,
		targetFields: any[] | undefined,
		skipIfFGDisabled: boolean = true,
		skipIfDataExtraction: boolean = true,
		flatten: boolean = true
	) {
		return new MetadataModel.ConvertObjectsTo2DArray(
			MetadataModel.MapFieldGroups(JSON.parse(JSON.stringify(newGroup)), (property) => {
				if (typeof property[MetadataModel.FgProperties.FIELD_GROUP_KEY] === 'string') {
					property[MetadataModel.FgProperties.FIELD_GROUP_KEY] = (property[MetadataModel.FgProperties.FIELD_GROUP_KEY] as string).replace(
						groupKey,
						'$'
					)
				}
				return property
			}),
			targetFields,
			skipIfFGDisabled,
			skipIfDataExtraction,
			flatten
		)
	}

	let objectTo2DArray = $derived(
		view2D
			? newObjectTo2DArray(
					group,
					JSON.parse(
						JSON.stringify(
							fields.map((d2dField) => {
								if (typeof d2dField[MetadataModel.FgProperties.FIELD_GROUP_KEY] === 'string') {
									d2dField[MetadataModel.FgProperties.FIELD_GROUP_KEY] = (d2dField[MetadataModel.FgProperties.FIELD_GROUP_KEY] as string).replace(
										groupKey,
										'$'
									)
								}

								return d2dField
							})
						)
					),
					false,
					false,
					false
				)
			: undefined
	)

	function convertObjectTo2DArray(dIndex: number) {
		if (!objectTo2DArray) {
			return undefined
		}

		let datum = data[dIndex]

		if (typeof datum !== 'object' || datum === null || Array.isArray(datum)) {
			return undefined
		}

		datum = [datum]

		try {
			objectTo2DArray.ResetArray2D()

			objectTo2DArray.Convert(JSON.parse(JSON.stringify(datum)))

			return objectTo2DArray.Array2D
		} catch (e) {
			telemetry?.Log(
				COMPONENT_NAME,
				true,
				Domain.Entities.Telemetry.LogLevel.ERROR,
				'error converting datum to 2D',
				'error',
				e,
				'group',
				group,
				'datum',
				datum
			)
			return []
		}
	}

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

	let groupHeaderHeight: number = $state(0)

	let groupFooterHeight: number = $state(0)

	let lockedColumnsWidth: number = $state(0)

	let columnHeaderHeight: number = $state(0)

	let showJson: boolean = $state(false)

	let showSectionID: string = $state('')

	let noOfSelectedRows: number = $derived(selecteddataindexes.length)

	function onupdateview2D() {
		unlockedViewableColumnFieldsStart = 0
		unlockedViewableColumnFieldsEnd =
			(tablecolumncontentperpage < noOfUnclockedViewableColumnFields ? tablecolumncontentperpage : noOfUnclockedViewableColumnFields) - 1
	}

	function onupdateselecteddataindexes() {
		if (updateselecteddataindexes) {
			updateselecteddataindexes(selecteddataindexes)
		}
	}

	function getNestedDatum(field: any, rowIndex: number) {
		const rowData = data[rowIndex]

		if (typeof rowData !== 'object' && Array.isArray(rowData)) {
			return undefined
		}

		let fgKeySuffix = field[MetadataModel.FgProperties.FIELD_GROUP_KEY]
		if (typeof fgKeySuffix !== 'string') {
			return undefined
		}

		fgKeySuffix = fgKeySuffix.split('.').pop()

		return rowData[fgKeySuffix]
	}

	let mainScrollElement: Element | undefined = $state(undefined)

	let windowHeight: number = $state(0)

	let windowWidth: number = $state(0)

	let newStickyHeaderOffset = $derived.by(() => {
		const n = stickyheaderoffset + columnHeaderHeight + (rootelement ? groupHeaderHeight : 0)

		return n > stickythreshold * windowHeight ? stickyheaderoffset : n
	})

	let newStickyLeftOffset = $derived.by(() => {
		const n = stickyleftoffset + lockedColumnsWidth

		return n > stickythreshold * windowWidth ? stickyleftoffset : n
	})

	let newStickyFooterOffset = $derived.by(() => {
		const n = stickyfooteroffset + (rootelement ? groupFooterHeight : 0)

		return n > stickythreshold * windowHeight ? stickyfooteroffset : n
	})

	let showMiddleBar: boolean = $state(false)

	let selectedDataIndexesActionsValid: boolean = $derived.by(() => {
		if (!Array.isArray(selecteddataindexesactions)) {
			return false
		}

		if (selecteddataindexesactions.length === 0) {
			return false
		}

		for (const sdia of selecteddataindexesactions) {
			if (typeof sdia.actionName !== 'string' || sdia.actionName.length === 0) {
				return false
			}

			if (typeof sdia.action !== 'function') {
				return false
			}
		}

		return true
	})

	let showSelectedDataIndexesMenuIconColor: Domain.Entities.Theme.Color = $state(Domain.Entities.Theme.Color.PRIMARY)
	$effect(() => {
		let switchIconColorInterval: NodeJS.Timeout | undefined = undefined

		if (selectedDataIndexesActionsValid && noOfSelectedRows > 0) {
			switchIconColorInterval = setInterval(() => {
				untrack(() => {
					showSelectedDataIndexesMenuIconColor = Utils.Theme.GetNextColorA(showSelectedDataIndexesMenuIconColor)
				})
			}, 500)
		} else {
			clearInterval(switchIconColorInterval)
		}
		return () => {
			clearInterval(switchIconColorInterval)
		}
	})

	let root: boolean = $derived(typeof rootelement === 'undefined')
</script>

<svelte:window bind:innerHeight={windowHeight} bind:innerWidth={windowWidth} />

<div
	class="flex flex-col gap-y-2 {root ? 'overflow-hidden' : 'min-h-fit min-w-fit'} {theme === Domain.Entities.Theme.Theme.DARK
		? switchbackground
			? 'border-gray-950 bg-gray-800'
			: 'border-gray-900 bg-gray-700'
		: switchbackground
			? 'border-gray-500 bg-gray-300'
			: 'border-gray-400 bg-gray-200'}"
>
	<header
		class="z-[3] flex flex-col gap-y-2 p-2 {theme === Domain.Entities.Theme.Theme.DARK
			? switchbackground
				? 'border-gray-950 bg-gray-800'
				: 'border-gray-900 bg-gray-700'
			: switchbackground
				? 'border-gray-500 bg-gray-300'
				: 'border-gray-400 bg-gray-200'}"
		style={disablestickyheader ? '' : `position: sticky; top: ${stickyheaderoffset}px; bottom: ${stickyfooteroffset + groupFooterHeight}px;`}
		bind:clientHeight={groupHeaderHeight}
	>
		<section class="flex justify-between">
			<div class="sticky flex gap-x-1" style="left: {stickyleftoffset}px;">
				<div class="flex h-fit gap-x-2 self-center">
					<button class="join-item btn btn-sm btn-ghost btn-square" onclick={() => (showMiddleBar = !showMiddleBar)} aria-label="Show/Collapse Menu">
						<!--mdi:dots-vertical source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24">
							<path
								fill="var({Utils.Theme.GetColor(themecolor)})"
								d="M12 16a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2a2 2 0 0 1 2-2m0-6a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2a2 2 0 0 1 2-2m0-6a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2a2 2 0 0 1 2-2"
							/>
						</svg>
					</button>

					<div class="self-center text-lg">
						{MetadataModel.GetFieldGroupName(group)}
					</div>

					{#if MetadataModel.IsFieldGroupDescriptionPresent(group)}
						{@const sectionID = 'group-description'}
						<!-- svelte-ignore a11y_mouse_events_have_key_events -->
						<button
							class="btn btn-circle btn-sm btn-ghost self-center"
							aria-label="Show/Hide Group Description"
							onmouseover={() => (showSectionID = sectionID)}
							onmouseout={() => (showSectionID = '')}
							onclick={() => {
								showSectionID = sectionID === showSectionID ? '' : sectionID
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
				</div>
			</div>

			<div class="sticky right-[10px] h-fit self-center">
				<Pagination
					{themecolor}
					lengthofdata={noOfUnclockedViewableColumnFields}
					start={unlockedViewableColumnFieldsStart}
					end={unlockedViewableColumnFieldsEnd}
					updatestart={(n) => {
						unlockedViewableColumnFieldsStart = n
					}}
					updateend={(n) => {
						unlockedViewableColumnFieldsEnd = n
					}}
					{telemetry}
					contentperpage={tablecolumncontentperpage}
					displayiflengthofdatagreaterthancontentperpage={!showUnlockedColumPagination}
				></Pagination>
			</div>
		</section>

		{#if showSectionID === 'group-description'}
			<div class="max-h-[30vh] overflow-auto text-sm">
				{group[MetadataModel.FgProperties.FIELD_GROUP_DESCRIPTION]}
			</div>
		{/if}

		{#if showMiddleBar}
			<section class="flex p-2 shadow-inner shadow-gray-900">
				<section class="join sticky w-fit" style="left: {stickyleftoffset}px;">
					<button
						class="join-item btn btn-xs tooltip tooltip-right max-w-fit {themecolor === Domain.Entities.Theme.Color.PRIMARY
							? 'btn-primary tooltip-primary'
							: themecolor === Domain.Entities.Theme.Color.SECONDARY
								? 'btn-secondary tooltip-secondary'
								: 'btn-accent tooltip-accent'}"
						onclick={() => (showJson = !showJson)}
						aria-label="View JSON"
						data-tip="view data as json"
					>
						<!--mdi:code-json source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
							<path
								fill={theme === Domain.Entities.Theme.Theme.DARK ? 'white' : 'black'}
								d="M5 3h2v2H5v5a2 2 0 0 1-2 2a2 2 0 0 1 2 2v5h2v2H5c-1.07-.27-2-.9-2-2v-4a2 2 0 0 0-2-2H0v-2h1a2 2 0 0 0 2-2V5a2 2 0 0 1 2-2m14 0a2 2 0 0 1 2 2v4a2 2 0 0 0 2 2h1v2h-1a2 2 0 0 0-2 2v4a2 2 0 0 1-2 2h-2v-2h2v-5a2 2 0 0 1 2-2a2 2 0 0 1-2-2V5h-2V3zm-7 12a1 1 0 0 1 1 1a1 1 0 0 1-1 1a1 1 0 0 1-1-1a1 1 0 0 1 1-1m-4 0a1 1 0 0 1 1 1a1 1 0 0 1-1 1a1 1 0 0 1-1-1a1 1 0 0 1 1-1m8 0a1 1 0 0 1 1 1a1 1 0 0 1-1 1a1 1 0 0 1-1-1a1 1 0 0 1 1-1"
							/>
						</svg>

						{#if showJson}
							<!--mdi:close-circle source: https://icon-sets.iconify.design-->
							<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24">
								<path
									fill={theme === Domain.Entities.Theme.Theme.DARK ? 'white' : 'black'}
									d="M12 2c5.53 0 10 4.47 10 10s-4.47 10-10 10S2 17.53 2 12S6.47 2 12 2m3.59 5L12 10.59L8.41 7L7 8.41L10.59 12L7 15.59L8.41 17L12 13.41L15.59 17L17 15.59L13.41 12L17 8.41z"
								/>
							</svg>
						{/if}
					</button>

					<div class="flex flex-col gap-y-1">
						<button
							class="join-item btn btn-xs tooltip tooltip-right max-w-fit {themecolor === Domain.Entities.Theme.Color.PRIMARY
								? 'btn-primary tooltip-primary'
								: themecolor === Domain.Entities.Theme.Color.SECONDARY
									? 'btn-secondary tooltip-secondary'
									: 'btn-accent tooltip-accent'}"
							aria-label="View Columns Menu"
							data-tip="View columns"
							onclick={() => (showSectionID = showSectionID === 'view-columns' ? '' : 'view-columns')}
						>
							<!--mdi:format-columns source: https://icon-sets.iconify.design-->
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
								<path
									fill="var({Utils.Theme.GetColorContent(themecolor)})"
									d="M3 3h8v2H3zm10 0h8v2h-8zM3 7h8v2H3zm10 0h8v2h-8zM3 11h8v2H3zm10 0h8v2h-8zM3 15h8v2H3zm10 0h8v2h-8zM3 19h8v2H3zm10 0h8v2h-8z"
								/>
							</svg>
						</button>

						{#if showSectionID === 'view-columns'}
							{#await import('../../FieldsMenu/Component.svelte') then { default: FieldsMenu }}
								<div class="rounded-md shadow-inner shadow-gray-800 {theme === Domain.Entities.Theme.Theme.DARK ? 'bg-gray-600' : 'bg-gray-300'}">
									<FieldsMenu
										{fields}
										{themecolor}
										{theme}
										{telemetry}
										transparent={true}
										updatefield={(field: any, _: number) => {
											updatefieldgroup(field)
										}}
										jumptofield={(_: any, fIndex: number) => {
											for (let ufIndex = 0; ufIndex < unlockedViewableFields.length; ufIndex++) {
												if (unlockedViewableFields[ufIndex] === fIndex) {
													const newEndIndex =
														ufIndex + tablecolumncontentperpage < noOfUnclockedViewableColumnFields
															? ufIndex + tablecolumncontentperpage
															: noOfUnclockedViewableColumnFields - 1
													const newStartIndex =
														newEndIndex - ufIndex < tablecolumncontentperpage
															? newEndIndex - tablecolumncontentperpage > 0
																? newEndIndex - tablecolumncontentperpage
																: 0
															: newEndIndex - tablecolumncontentperpage

													unlockedViewableColumnFieldsStart = newStartIndex
													unlockedViewableColumnFieldsEnd = newEndIndex
												}
											}
										}}
									></FieldsMenu>
								</div>
							{/await}
						{/if}
					</div>

					<button
						class="join-item btn btn-xs tooltip tooltip-right max-w-fit {themecolor === Domain.Entities.Theme.Color.PRIMARY
							? 'btn-primary tooltip-primary'
							: themecolor === Domain.Entities.Theme.Color.SECONDARY
								? 'btn-secondary tooltip-secondary'
								: 'btn-accent tooltip-accent'}"
						onclick={() => {
							if (view2D) {
								delete group[MetadataModel.FgProperties.GROUP_VIEW_TABLE_IN_2D]
								view2D = false
							} else {
								group[MetadataModel.FgProperties.GROUP_VIEW_TABLE_IN_2D] = true
								view2D = true
							}
							onupdateview2D()
							updatefieldgroup(group)
						}}
						aria-label="switch to {view2D ? 'nested' : '2D'} view"
						data-tip="switch to {view2D ? 'nested' : '2D'} view"
					>
						{#if view2D}
							<!--mdi:table-multiple source: https://icon-sets.iconify.design-->
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
								<path
									fill="var({Utils.Theme.GetColorContent(themecolor)})"
									d="M4 3h16a2 2 0 0 1 2 2v15a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2m0 4v3h4V7zm6 0v3h4V7zm10 3V7h-4v3zM4 12v3h4v-3zm0 8h4v-3H4zm6-8v3h4v-3zm0 8h4v-3h-4zm10 0v-3h-4v3zm0-8h-4v3h4z"
								/>
							</svg>
						{:else}
							<!--mdi:file-table-box-multiple source: https://icon-sets.iconify.design-->
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
								<path
									fill="var({Utils.Theme.GetColorContent(themecolor)})"
									d="M3 5v16h16v2H3c-1.1 0-2-.9-2-2V5zm18-4H7c-1.11 0-2 .89-2 2v14a2 2 0 0 0 2 2h14c1.11 0 2-.89 2-2V3a2 2 0 0 0-2-2M11 16H8v-2h3zm0-3H8v-2h3zm0-3H8V8h3zm4 6h-3v-2h3zm0-3h-3v-2h3zm0-3h-3V8h3z"
								/>
							</svg>
						{/if}
					</button>

					<button
						class="join-item btn btn-xs tooltip tooltip-right max-w-fit {themecolor === Domain.Entities.Theme.Color.PRIMARY
							? 'btn-primary tooltip-primary'
							: themecolor === Domain.Entities.Theme.Color.SECONDARY
								? 'btn-secondary tooltip-secondary'
								: 'btn-accent tooltip-accent'}"
						aria-label="Export Data as csv"
						data-tip="export data as csv"
						onclick={() => {
							try {
								let dataToParse: any[][] = [[]]

								let extract2DFields = newExtract2DFields(group, true, true)
								extract2DFields.Extract()
								extract2DFields.Reposition()
								extract2DFields.RemoveSkipped()
								for (const e2DFields of extract2DFields.Fields) {
									dataToParse[0].push(MetadataModel.GetFieldGroupName(e2DFields))
								}

								const objectTo2DArray = newObjectTo2DArray(group, undefined, true, true, true)
								objectTo2DArray.Convert(JSON.parse(JSON.stringify(data)))
								dataToParse.push(...objectTo2DArray.Array2D)

								const objectUrl = URL.createObjectURL(new Blob([Papa.unparse(dataToParse, { header: true })], { type: 'text/csv' }))
								const downloadLink = document.createElement('a')
								downloadLink.href = objectUrl
								downloadLink.setAttribute('download', `data.csv`)
								document.body.appendChild(downloadLink)
								downloadLink.click()
								document.body.removeChild(downloadLink)
								URL.revokeObjectURL(objectUrl)
							} catch (e) {
								telemetry?.Log(COMPONENT_NAME, true, Domain.Entities.Telemetry.LogLevel.ERROR, 'export selected data to csv failed', 'error', e)
							}
						}}
					>
						<!--foundation:page-export-csv source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 100 100">
							<path
								fill="var({Utils.Theme.GetColorContent(themecolor)})"
								d="M94.284 65.553L75.825 52.411a1.25 1.25 0 0 0-1.312-.093c-.424.218-.684.694-.685 1.173l.009 6.221H57.231c-.706 0-1.391.497-1.391 1.204v11.442c0 .707.685 1.194 1.391 1.194h16.774v6.27c0 .478.184.917.609 1.136s.853.182 1.242-.097l18.432-13.228c.335-.239.477-.626.477-1.038v-.002c0-.414-.144-.8-.481-1.04"
							/>
							<path
								fill="var({Utils.Theme.GetColorContent(themecolor)})"
								d="M64.06 78.553h-6.49a1.73 1.73 0 0 0-1.73 1.73h-.007v3.01H15.191V36.16h17.723a1.73 1.73 0 0 0 1.73-1.73V16.707h21.188v36.356h.011a1.73 1.73 0 0 0 1.726 1.691h6.49c.943 0 1.705-.754 1.726-1.691h.004V12.5h-.005V8.48a1.73 1.73 0 0 0-1.73-1.73h-32.87L5.235 32.7v58.819c0 .956.774 1.73 1.73 1.73h57.089a1.73 1.73 0 0 0 1.73-1.73v-2.448h.005v-8.79a1.73 1.73 0 0 0-1.729-1.728"
							/>
							<path
								fill="var({Utils.Theme.GetColorContent(themecolor)})"
								d="M26.18 64.173c.831 0 1.55.623 1.786 1.342l2.408-1.121c-.553-1.273-1.771-2.685-4.193-2.685c-2.893 0-5.079 1.924-5.079 4.775c0 2.837 2.187 4.774 5.079 4.774c2.422 0 3.654-1.467 4.193-2.699l-2.408-1.107c-.235.719-.955 1.342-1.786 1.342c-1.342 0-2.242-1.024-2.242-2.311s.899-2.31 2.242-2.31m9.476 4.734a4.3 4.3 0 0 1-2.976-1.19l-1.453 2.076c.982.886 2.325 1.467 4.291 1.467c2.477 0 3.986-1.176 3.986-3.211c0-3.432-5.135-2.685-5.135-3.557c0-.235.152-.415.706-.415c.872 0 1.91.304 2.712.913l1.495-1.979c-1.052-.858-2.408-1.287-3.917-1.287c-2.533 0-3.833 1.495-3.833 3.059c0 3.64 5.148 2.74 5.148 3.626c0 .359-.498.498-1.024.498m7.615-7.045h-3.169l3.404 9.231h3.516l3.404-9.231h-3.169l-1.993 6.214z"
							/>
						</svg>

						<!--mdi:select source: https://icon-sets.iconify.design-->
						<svg class="self-start" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24">
							<path
								fill="var({Utils.Theme.GetColorContent(themecolor)})"
								d="M4 3h1v2H3V4a1 1 0 0 1 1-1m16 0a1 1 0 0 1 1 1v1h-2V3zm-5 2V3h2v2zm-4 0V3h2v2zM7 5V3h2v2zm14 15a1 1 0 0 1-1 1h-1v-2h2zm-6 1v-2h2v2zm-4 0v-2h2v2zm-4 0v-2h2v2zm-3 0a1 1 0 0 1-1-1v-1h2v2zm-1-6h2v2H3zm18 0v2h-2v-2zM3 11h2v2H3zm18 0v2h-2v-2zM3 7h2v2H3zm18 0v2h-2V7z"
							/>
						</svg>
					</button>
				</section>
			</section>
		{/if}
	</header>

	<main
		class="relative z-[1] grid flex-1 {root ? 'h-full overflow-auto' : 'min-h-fit min-w-fit'}"
		style="grid-template-columns: repeat({gridTemplateColumns}, minmax(min-content, 500px));"
		bind:this={mainScrollElement}
	>
		{#if showJson}
			<pre
				class="grid h-fit w-full {theme === Domain.Entities.Theme.Theme.DARK
					? 'bg-gray-500'
					: 'bg-gray-700'} ml-1 mr-1 p-1 text-white shadow-inner shadow-gray-800"
				style="grid-template-columns: subgrid; grid-column: span {gridTemplateColumns};"><code>{JSON.stringify(data, null, 4)}</code></pre>
		{:else}
			<header
				style="{disablestickyheader
					? ''
					: `position: sticky; top: ${
							stickyheaderoffset + (root ? 0 : groupHeaderHeight)
						}px; left: ${stickyleftoffset}px;`} grid-template-columns: subgrid; grid-column: span {gridTemplateColumns};"
				class="z-[2] grid h-fit min-w-fit shadow-sm shadow-gray-800 {theme === Domain.Entities.Theme.Theme.DARK
					? switchbackground
						? 'border-gray-950 bg-gray-800'
						: 'border-gray-900 bg-gray-700'
					: switchbackground
						? 'border-gray-500 bg-gray-300'
						: 'border-gray-400 bg-gray-200'}"
				bind:clientHeight={columnHeaderHeight}
			>
				<section
					style="grid-column: span {lockedFields.length + lockedColumns}; left: {stickyleftoffset}px; grid-template-columns: subgrid;"
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
						<div class="h-fit w-fit self-start">#</div>
					</div>

					{#if addselectcolumn}
						<div class="flex h-full min-w-[47px] max-w-fit justify-center gap-x-1 p-1 text-lg font-bold">
							<div
								class="tooltip tooltip-right h-fit w-fit self-start {themecolor === Domain.Entities.Theme.Color.PRIMARY
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

							{#if selectedDataIndexesActionsValid && noOfSelectedRows > 0}
								{@const sectionID = 'selected-data-indexes-actions'}
								<div
									class="tooltip tooltip-right h-fit w-fit self-start {themecolor === Domain.Entities.Theme.Color.PRIMARY
										? 'tooltip-primary'
										: themecolor === Domain.Entities.Theme.Color.SECONDARY
											? 'tooltip-secondary'
											: 'tooltip-accent'}"
									data-tip="view selected data indexes actions"
								>
									<button
										class="btn btn-sm btn-ghost"
										onclick={() => {
											showSectionID = showSectionID === sectionID ? '' : sectionID
										}}
										aria-label="show {sectionID}"
									>
										<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
											<path
												fill="var({Utils.Theme.GetColor(showSelectedDataIndexesMenuIconColor)})"
												d="M10.76 8.69a.76.76 0 0 0-.76.76V20.9c0 .42.34.76.76.76c.19 0 .35-.06.48-.16l1.91-1.55l1.66 3.62c.13.27.4.43.69.43c.11 0 .22 0 .33-.08l2.76-1.28c.38-.18.56-.64.36-1.01L17.28 18l2.41-.45a.9.9 0 0 0 .43-.26c.27-.32.23-.79-.12-1.08l-8.74-7.35l-.01.01a.76.76 0 0 0-.49-.18M15 10V8h5v2zm-1.17-5.24l2.83-2.83l1.41 1.41l-2.83 2.83zM10 0h2v5h-2zM3.93 14.66l2.83-2.83l1.41 1.41l-2.83 2.83zm0-11.32l1.41-1.41l2.83 2.83l-1.41 1.41zM7 10H2V8h5z"
											/>
										</svg>
									</button>

									{#if showSectionID === sectionID}
										<div
											class="rounded-md shadow-inner shadow-gray-800 {theme === Domain.Entities.Theme.Theme.DARK
												? 'bg-gray-600 text-white'
												: 'bg-gray-300 text-black'} flex w-fit min-w-[200px] flex-col gap-y-2 p-1"
										>
											{#each selecteddataindexesactions as sdia}
												<button
													class="btn btn-md btn-ghost min-w-fit flex-1"
													onclick={() => {
														sdia.action(selecteddataindexes)
													}}
													aria-label={sdia.actionName}
												>
													{sdia.actionName}
												</button>
											{/each}
										</div>
									{/if}
								</div>
							{/if}
						</div>
					{/if}

					{#if view2D}
						<div class="flex h-full w-[47px] max-w-[47px] justify-center p-1 text-lg font-bold">
							<div class="h-fit w-fit self-start">#</div>
						</div>
					{/if}

					{#each lockedFields as lfIndex (lfIndex)}
						{@const column = fields[lfIndex]}

						{#if column}
							{@render headerFieldColumn(column, lfIndex, lfIndex)}
						{:else}
							<div class="text-error h-full w-full">column not found</div>
						{/if}
					{/each}
				</section>

				{#each Utils.Range(unlockedViewableColumnFieldsStart, Utils.RangeArrayEnd(unlockedViewableColumnFieldsEnd, noOfUnclockedViewableColumnFields)) as ucfIndex (ucfIndex)}
					{@const ufIndex = unlockedViewableFields[ucfIndex]}

					{#if typeof ufIndex === 'number'}
						{@const column = fields[ufIndex]}

						{#if column}
							{@render headerFieldColumn(column, ufIndex, undefined, ufIndex, lockedColumnsWidth)}
						{:else}
							<div class="text-error h-full w-full">column not found</div>
						{/if}
					{/if}
				{/each}
			</header>

			<main class="z-[1] grid" style="grid-template-columns: subgrid; grid-column: span {gridTemplateColumns};">
				{#each Utils.Range(rowsStart, Utils.RangeArrayEnd(rowsEnd, noOfRows)) as rIndex (rIndex)}
					{@const rowIndex = viewableRows[rIndex]}

					{@const rowData = view2D ? convertObjectTo2DArray(rowIndex) : data[rowIndex]}

					{@const stickytop = columnHeaderHeight + 6 + stickyheaderoffset + (root ? 0 : groupHeaderHeight)}

					<section
						style="grid-template-columns: subgrid; grid-column: span {gridTemplateColumns};"
						class="grid {rIndex !== rowsEnd ? 'border-b border-gray-800' : ''}"
					>
						<section
							style="grid-column: span {lockedFields.length + lockedColumns}; grid-template-columns: subgrid; grid-row: span {view2D
								? Array.isArray(rowData)
									? rowData.length
									: 1
								: 1}; grid-template-rows: subgrid;  left: {stickyleftoffset}px;"
							class="sticky z-[2] grid shadow-sm shadow-gray-800 {theme === Domain.Entities.Theme.Theme.DARK
								? switchbackground
									? 'border-gray-950 bg-gray-800'
									: 'border-gray-900 bg-gray-700'
								: switchbackground
									? 'border-gray-500 bg-gray-300'
									: 'border-gray-400 bg-gray-200'}"
						>
							<div
								class="flex h-full w-[47px] min-w-fit justify-center p-1 text-lg font-bold"
								style="grid-row: span {view2D ? (Array.isArray(rowData) ? rowData.length : 1) : 1};"
							>
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
									class="flex h-full w-[47px] max-w-[47px] justify-center p-1 text-lg font-bold"
									style="grid-row: span {view2D ? (Array.isArray(rowData) ? rowData.length : 1) : 1};"
								>
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
								</div>
							{/if}

							{#if view2D}
								<section style="grid-row: span {view2D ? (Array.isArray(rowData) ? rowData.length : 1) : 1}; grid-template-rows: subgrid;">
									{#if Array.isArray(rowData)}
										{#each rowData as _, rdIndex}
											<div class="flex w-[47px] min-w-fit justify-center p-1 text-sm italic">
												<div class="sticky h-fit w-fit self-start" style="top: {stickytop}px;">
													{rdIndex + 1}
												</div>
											</div>
										{/each}
									{/if}
								</section>
							{/if}

							{#if view2D}
								{#if Array.isArray(rowData)}
									{#each rowData as _, rdIndex}
										{#each lockedFields as lfIndex (lfIndex)}
											{@const column = fields[lfIndex]}

											{#if column}
												{@render mainFieldColumn(column, rowData[rdIndex][lfIndex], [...arrayindexplaceholders, rowIndex])}
											{:else}
												<div class="text-error h-full w-full">column not found</div>
											{/if}
										{/each}
									{/each}
								{/if}
							{:else}
								{#each lockedFields as lfIndex (lfIndex)}
									{@const column = fields[lfIndex]}

									{#if column}
										{@render mainFieldColumn(column, getNestedDatum(column, rowIndex), [...arrayindexplaceholders, rowIndex])}
									{:else}
										<div class="text-error h-full w-full">column not found</div>
									{/if}
								{/each}
							{/if}
						</section>

						{#if view2D}
							{#if Array.isArray(rowData)}
								{#each rowData as _, rdIndex}
									{#each Utils.Range(unlockedViewableColumnFieldsStart, Utils.RangeArrayEnd(unlockedViewableColumnFieldsEnd, noOfUnclockedViewableColumnFields)) as ucfIndex (ucfIndex)}
										{@const ufIndex = unlockedViewableFields[ucfIndex]}

										{#if typeof ufIndex === 'number'}
											{@const column = fields[ufIndex]}

											{#if column}
												{@render mainFieldColumn(column, rowData[rdIndex][ufIndex], [...arrayindexplaceholders, rowIndex])}
											{:else}
												<div class="text-error h-full w-full">column not found</div>
											{/if}
										{/if}
									{/each}
								{/each}
							{/if}
						{:else}
							{#each Utils.Range(unlockedViewableColumnFieldsStart, Utils.RangeArrayEnd(unlockedViewableColumnFieldsEnd, noOfUnclockedViewableColumnFields)) as ucfIndex (ucfIndex)}
								{@const ufIndex = unlockedViewableFields[ucfIndex]}

								{#if typeof ufIndex === 'number'}
									{@const column = fields[ufIndex]}

									{#if column}
										{@render mainFieldColumn(column, getNestedDatum(column, rowIndex), [...arrayindexplaceholders, rowIndex])}
									{:else}
										<div class="text-error h-full w-full">column not found</div>
									{/if}
								{/if}
							{/each}
						{/if}
					</section>
				{/each}
			</main>
		{/if}
	</main>

	<footer
		class="z-[2] flex justify-between gap-y-1 border-t border-gray-800 p-2 {theme === Domain.Entities.Theme.Theme.DARK
			? switchbackground
				? 'border-gray-950 bg-gray-800'
				: 'border-gray-900 bg-gray-700'
			: switchbackground
				? 'border-gray-500 bg-gray-300'
				: 'border-gray-400 bg-gray-200'}"
		style={disablestickyfooter ? '' : `position: sticky; top: ${stickyheaderoffset + groupHeaderHeight}px; bottom: ${stickyfooteroffset}px;`}
		bind:clientHeight={groupFooterHeight}
	>
		<div class="sticky flex w-fit gap-x-2" style="left: {stickyleftoffset}px;">
			<div class="input">
				<span class="label">Total No of Rows:</span>
				<span>{noOfRows}</span>
			</div>

			{#if noOfSelectedRows > 0}
				<div class="input">
					<span class="label">No of Selected Rows:</span>
					<span>{noOfSelectedRows}</span>
				</div>
			{/if}
		</div>

		<div class="sticky right-[10px] h-fit self-center">
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
			></Pagination>
		</div>
	</footer>
</div>

{#snippet mainFieldColumn(field: any, datum: any, arrayIndexPlaceholders: number[])}
	<div class="flex h-full w-full flex-col gap-y-2 p-1">
		{#await import('./Column/Component.svelte') then { default: Column }}
			<Column
				{field}
				data={datum}
				arrayindexplaceholders={arrayIndexPlaceholders}
				{themecolor}
				{theme}
				rootelement={root ? mainScrollElement : rootelement}
				{tablecolumncontentperpage}
				{tablerowcontentperpage}
				{columnfieldcontentperpage}
				stickyheaderoffset={newStickyHeaderOffset}
				disablestickyheader={disablestickyheader || newStickyHeaderOffset === stickyheaderoffset}
				stickyleftoffset={newStickyLeftOffset}
				disablestickyleft={disablestickyleft || (newStickyLeftOffset === stickyleftoffset && stickyleftoffset > 0)}
				stickyfooteroffset={newStickyFooterOffset}
				disablestickyfooter={disablestickyfooter || (newStickyFooterOffset === stickyfooteroffset && stickyfooteroffset > 0)}
				{stickythreshold}
				switchbackground={!switchbackground}
				{updatefieldgroup}
				{getdata}
				{metadatamodelget}
				{fieldanygetmetadatamodel}
			></Column>
		{/await}
	</div>
{/snippet}

{#snippet headerFieldColumn(field: any, fieldIndexInFields: number, lfIndex: number = -1, ufIndex: number = -1, stickyLeftOffset: number = 0)}
	{@const fName = MetadataModel.GetFieldGroupName(field)}

	{@const fieldColumnID = `header-column-${lfIndex}-${ufIndex}`}

	{@const lockColumn = field[MetadataModel.FgProperties.FIELD_GROUP_VIEW_TABLE_LOCK_COLUMN]}

	{@const hideColumn = field[MetadataModel.FgProperties.FIELD_GROUP_VIEW_DISABLE]}

	<div class="h-full w-full">
		<span class="sticky flex w-fit flex-col gap-y-2 p-1" style="left: {stickyleftoffset + stickyLeftOffset}px;">
			<section class="flex gap-x-2">
				<button
					class="btn btn-ghost btn-sm btn-circle self-start"
					aria-label="show column menu {fieldColumnID}"
					onclick={() => {
						showSectionID = showSectionID === fieldColumnID ? '' : fieldColumnID
					}}
				>
					<!--mdi:dots-vertical source: https://icon-sets.iconify.design-->
					<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24">
						<path
							fill="var({Utils.Theme.GetColor(themecolor)})"
							d="M12 16a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2a2 2 0 0 1 2-2m0-6a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2a2 2 0 0 1 2-2m0-6a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2a2 2 0 0 1 2-2"
						/>
					</svg>
				</button>
				<div>{fName}</div>
			</section>

			{#if showSectionID === fieldColumnID}
				<section
					class="rounded-md shadow-inner shadow-gray-800 {theme === Domain.Entities.Theme.Theme.DARK
						? 'bg-gray-600 text-white'
						: 'bg-gray-300 text-black'} flex w-fit flex-col gap-y-2 p-1"
				>
					<button
						class="btn btn-md btn-ghost"
						onclick={() => {
							if (hideColumn) {
								delete field[MetadataModel.FgProperties.FIELD_GROUP_VIEW_DISABLE]
							} else {
								field[MetadataModel.FgProperties.FIELD_GROUP_VIEW_DISABLE] = true
							}

							updatefieldgroup(field)
						}}
					>
						{hideColumn ? 'Show' : 'Hide'} column
					</button>
					<button
						class="btn btn-md btn-ghost"
						onclick={() => {
							if (lockColumn) {
								delete field[MetadataModel.FgProperties.FIELD_GROUP_VIEW_TABLE_LOCK_COLUMN]
							} else {
								field[MetadataModel.FgProperties.FIELD_GROUP_VIEW_TABLE_LOCK_COLUMN] = true
							}

							updatefieldgroup(field)
						}}
					>
						{lockColumn ? 'Unfreeze' : 'Freeze'} column
					</button>
				</section>
			{/if}
		</span>
	</div>
{/snippet}
