<!--
@Component

Props:
-
-->
<script lang="ts">
	import { Domain, Json, MetadataModel, Utils } from '$lib'
	import { Pagination } from '$lib/components/Pagination'
	import Papa from 'papaparse'
	import { untrack } from 'svelte'

	const COMPONENT_NAME = 'metadata-model-datum-input-view-form'

	interface Props {
		group: any
		arrayindexplaceholders?: number[]
		themecolor: Domain.Entities.Theme.Color
		theme: Domain.Entities.Theme.Theme
		updatefieldgroup: (fieldGroup: any) => void
		getdata: (fieldGroupKey: string, arrayPlaceholderIndexes: number[]) => any
		updatedata: (fieldGroupKey: string, arrayPlaceholderIndexes: number[], value: any) => void
		deletedata: (fieldGroupKey: string, arrayPlaceholderIndexes: number[]) => void
		copiedcutfieldgroupkey?: string
		setcopiedfieldgroupkey: (fieldGroupKey: string, arrayPlaceholderIndexes: number[]) => void
		setcutfieldgroupdata: (fieldGroupKey: string, arrayPlaceholderIndexes: number[]) => void
		pastefieldgroupdata: (fieldGroupKey: string, arrayPlaceholderIndexes: number[]) => void
		telemetry?: Domain.Interfaces.ITelemetry
		tablecolumncontentperpage?: number
		tablerowcontentperpage?: number
		columnfieldcontentperpage?: number
		stickyheaderoffset?: number
		stickyfooteroffset?: number
		stickythreshold?: number
		switchbackground?: boolean
		rootelement?: Element
	}

	let {
		group,
		arrayindexplaceholders = [],
		themecolor,
		theme,
		updatefieldgroup,
		getdata,
		updatedata,
		deletedata,
		copiedcutfieldgroupkey = '',
		setcopiedfieldgroupkey,
		setcutfieldgroupdata,
		pastefieldgroupdata,
		telemetry = undefined,
		tablecolumncontentperpage = 10,
		tablerowcontentperpage = 10,
		columnfieldcontentperpage = 5,
		stickyheaderoffset = 0,
		switchbackground = false,
		rootelement = undefined
	}: Props = $props()

	let groupKey: string = $derived(group[MetadataModel.FgProperties.FIELD_GROUP_KEY])

	let fields: any[] = $derived.by(() => {
		try {
			const extract2DFields = new MetadataModel.Extract2DFields(JSON.parse(JSON.stringify(group)), false, false, false)
			extract2DFields.Extract()
			extract2DFields.Reposition()

			return extract2DFields.Fields
		} catch (e) {
			telemetry?.Log(COMPONENT_NAME, true, Domain.Entities.Telemetry.LogLevel.ERROR, 'error extracting 2D fields', 'error', e, 'group', group)
			return []
		}
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

	let objectTo2DArray = $derived(
		new MetadataModel.ConvertObjectsTo2DArray(
			MetadataModel.MapFieldGroups(JSON.parse(JSON.stringify(group)), (property) => {
				if (typeof property[MetadataModel.FgProperties.FIELD_GROUP_KEY] === 'string') {
					property[MetadataModel.FgProperties.FIELD_GROUP_KEY] = (property[MetadataModel.FgProperties.FIELD_GROUP_KEY] as string).replace(
						groupKey,
						'$'
					)
				}
				return property
			}),
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
	)

	let data2D: any[][] = $derived.by(() => {
		if (objectTo2DArray) {
			return untrack(() => {
				let object = getdata(groupKey, arrayindexplaceholders)

				if (typeof object === 'undefined') {
					return []
				}

				if (!Array.isArray(object)) {
					object = [object]
				}

				object = JSON.parse(JSON.stringify(object))

				try {
					objectTo2DArray.ResetArray2D()

					objectTo2DArray.Convert(JSON.parse(JSON.stringify(object)))

					return objectTo2DArray.Array2D
				} catch (e) {
					telemetry?.Log(
						COMPONENT_NAME,
						true,
						Domain.Entities.Telemetry.LogLevel.ERROR,
						'error converting object to 2D',
						'error',
						e,
						'group',
						group,
						'object',
						object
					)
					return []
				}
			})
		}

		return []
	})

	let noOfUnclockedViewableColumnFields: number = $derived(unlockedViewableFields.length)
	let unlockedViewableColumnFieldsStart: number = $state(0)
	let unlockedViewableColumnFieldsEnd: number = $state(0)

	let showUnlockedColumPagination: boolean = $derived(noOfUnclockedViewableColumnFields > tablecolumncontentperpage)

	let noOfRows: number = $derived.by(() => {
		const groupData = getdata(groupKey, arrayindexplaceholders)

		if (Array.isArray(groupData) && groupData.length > 100) {
			return groupData.length
		}

		return 100
	})
	$effect(() => {
		let groupData = getdata(groupKey, arrayindexplaceholders)

		if (Array.isArray(groupData)) {
			groupData = groupData.filter((gd) => gd !== null && typeof gd === 'object' && !Array.isArray(gd) && Object.keys(gd).length > 0)
			if (groupData.length === 0) {
				ondeletedata()
			}
		}
	})
	let rowsStart: number = $state(0)
	let rowsEnd: number = $state(0)

	let groupHeaderHeight: number = $state(0)

	let columnHeaderHeight: number = $state(0)

	let showGroupDescription: boolean = $state(false)

	let showJson: boolean = $state(false)

	function ondeletedata() {
		deletedata(groupKey, arrayindexplaceholders)
		data2D = []
	}

	/**
	 * column number
	 * select all rows
	 * unselect all rows
	 */
	const LOCKED_FIXED_COLUMNS = 3

	let gridTemplateColumns: number = $derived(
		lockedFields.length +
			(noOfUnclockedViewableColumnFields === 0
				? 0
				: noOfUnclockedViewableColumnFields === 1
					? 1
					: unlockedViewableColumnFieldsEnd - unlockedViewableColumnFieldsStart + 1) +
			LOCKED_FIXED_COLUMNS
	)

	let showMenuID: string = $state('')

	function onupdatefieldgroup(field: any) {
		updatefieldgroup(field)
	}

	let unlockedGridSelectRowColumnIndexes: { row: number; column: number }[] = $state([])
	let unlockedGridSelectRowMinIndex: number = $state(-1)
	let unlockedGridSelectRowMaxIndex: number = $state(-1)
	$effect(() => {
		if (unlockedGridSelectRowMaxIndex > rowsEnd) {
			unlockedGridSelectRowMaxIndex = rowsEnd
		}
	})
	let unlockedGridSelectColumnMinIndex: number = $state(-1)
	let unlockedGridSelectColumnMaxIndex: number = $state(-1)
	$effect(() => {
		if (unlockedGridSelectColumnMaxIndex > unlockedViewableColumnFieldsEnd) {
			unlockedGridSelectColumnMaxIndex = unlockedViewableColumnFieldsEnd
		}
	})
	let unlockedGridSelectActive: boolean = $derived(
		unlockedGridSelectRowMinIndex > -1 &&
			unlockedGridSelectRowMaxIndex > -1 &&
			unlockedGridSelectColumnMinIndex > -1 &&
			unlockedGridSelectColumnMaxIndex > -1
	)
	let copyModeActive: boolean = $state(false)

	function handleUnlockedGridSelectRowColumn(row: number, column: number) {
		if (copyModeActive) {
			if (row > data2D.length) {
				for (let rIndex = data2D.length; rIndex < row; rIndex++) {
					data2D.push([])
				}
			}

			if (noOfSelectedRowsWithData > 0) {
				let scmi = -1
				for (const srIndex of selectedRowsWithData) {
					scmi += 1

					data2D = Json.SetValueInObject(data2D, `$.${row + scmi}`, JSON.parse(JSON.stringify(data2D[srIndex])))
				}
			} else {
				if (data2D.length <= row + unlockedGridSelectRowMaxIndex - unlockedGridSelectRowMinIndex) {
					for (let rIndex = data2D.length - 1; rIndex <= row + unlockedGridSelectRowMaxIndex - unlockedGridSelectRowMinIndex; rIndex++) {
						data2D.push([])
					}
				}

				let scmi = -1
				for (let rIndex = row; rIndex <= row + unlockedGridSelectRowMaxIndex - unlockedGridSelectRowMinIndex; rIndex++) {
					scmi += 1

					for (let ucIndex = unlockedGridSelectColumnMinIndex; ucIndex <= unlockedGridSelectColumnMaxIndex; ucIndex++) {
						const cIndex = unlockedViewableFields[ucIndex]

						data2D = Json.SetValueInObject(
							data2D,
							`$.${rIndex}.${cIndex}`,
							JSON.parse(JSON.stringify(Json.GetValueInObject(data2D, `$.${unlockedGridSelectRowMinIndex + scmi}.${cIndex}`)))
						)
					}
				}
			}

			onupdatedata()
			return
		}

		if (unlockedGridSelectRowColumnIndexes.length === 2) {
			if (
				(unlockedGridSelectRowColumnIndexes[0].row === row && unlockedGridSelectRowColumnIndexes[0].column === column) ||
				(unlockedGridSelectRowColumnIndexes[1].row === row && unlockedGridSelectRowColumnIndexes[1].column === column)
			) {
				resetUnlockedGridSelect()
				return
			}
			const secondRowColumnIndex = JSON.parse(JSON.stringify(unlockedGridSelectRowColumnIndexes[1]))
			unlockedGridSelectRowColumnIndexes = [{ row, column }, secondRowColumnIndex]
		} else {
			unlockedGridSelectRowColumnIndexes.push({ row, column })
		}

		if (unlockedGridSelectRowColumnIndexes.length === 1) {
			unlockedGridSelectRowMinIndex = row
			unlockedGridSelectRowMaxIndex = row
			unlockedGridSelectColumnMinIndex = 0
			unlockedGridSelectColumnMaxIndex = noOfUnclockedViewableColumnFields - 1
		}

		if (unlockedGridSelectRowColumnIndexes.length === 2) {
			if (unlockedGridSelectRowColumnIndexes[0].row < unlockedGridSelectRowColumnIndexes[1].row) {
				unlockedGridSelectRowMinIndex = unlockedGridSelectRowColumnIndexes[0].row
				unlockedGridSelectRowMaxIndex = unlockedGridSelectRowColumnIndexes[1].row
			} else {
				unlockedGridSelectRowMinIndex = unlockedGridSelectRowColumnIndexes[1].row
				unlockedGridSelectRowMaxIndex = unlockedGridSelectRowColumnIndexes[0].row
			}

			if (unlockedGridSelectRowColumnIndexes[0].column < unlockedGridSelectRowColumnIndexes[1].column) {
				unlockedGridSelectColumnMinIndex = unlockedGridSelectRowColumnIndexes[0].column
				unlockedGridSelectColumnMaxIndex = unlockedGridSelectRowColumnIndexes[1].column
			} else {
				unlockedGridSelectColumnMinIndex = unlockedGridSelectRowColumnIndexes[1].column
				unlockedGridSelectColumnMaxIndex = unlockedGridSelectRowColumnIndexes[0].column
			}
		}
	}

	function resetUnlockedGridSelect() {
		unlockedGridSelectRowColumnIndexes = []
		unlockedGridSelectRowMinIndex = -1
		unlockedGridSelectRowMaxIndex = -1
		unlockedGridSelectColumnMinIndex = -1
		unlockedGridSelectColumnMaxIndex = -1
		copyModeActive = false
	}

	let array2DToObjects = $derived(new MetadataModel.Convert2DArrayToObjects(group, fields, false, false))

	function onupdatedata() {
		data2D = data2D.map((d2darray) => {
			if (typeof d2darray === 'undefined') {
				d2darray = []
			}

			if (d2darray.length !== fields.length) {
				for (let i = d2darray.length; i < fields.length; i++) {
					d2darray.push(undefined)
				}
			}

			return d2darray
		})

		try {
			array2DToObjects.Convert(JSON.parse(JSON.stringify(data2D)))

			if (group[MetadataModel.FgProperties.FIELD_GROUP_KEY] === '$') {
				updatedata(group[MetadataModel.FgProperties.FIELD_GROUP_KEY], arrayindexplaceholders, array2DToObjects.Objects[0])
			} else {
				updatedata(group[MetadataModel.FgProperties.FIELD_GROUP_KEY], arrayindexplaceholders, array2DToObjects.Objects)
			}
			array2DToObjects.ResetObjects()
		} catch (e) {
			telemetry?.Log(
				COMPONENT_NAME,
				true,
				Domain.Entities.Telemetry.LogLevel.ERROR,
				'error converting 2D to object',
				'error',
				e,
				'group',
				group,
				'data2D',
				data2D
			)
		}
	}

	let indexOfRowsWithData: number[] = $derived.by(() => {
		let rowsWithData: number[] = []

		for (let rowIndex = 0; rowIndex < data2D.length; rowIndex++) {
			const row = data2D[rowIndex]

			let rowHasData = false

			if (Array.isArray(row)) {
				for (let rIndex = 0; rIndex < row.length; rIndex++) {
					const r = row[rIndex]

					if (typeof r === 'undefined') {
						continue
					}

					if (Array.isArray(r)) {
						for (const rd of r) {
							if (typeof rd !== 'undefined') {
								rowHasData = true
								break
							}
						}
					} else {
						rowHasData = true
						break
					}

					if (rowHasData) {
						break
					}
				}
			}

			if (rowHasData) {
				rowsWithData.push(rowIndex)
			}
		}

		return rowsWithData
	})

	let noOfRowsWithData: number = $derived(indexOfRowsWithData.length)

	let selectAllRowsWithData: boolean = $state(false)
	$effect(() => {
		if (selectAllRowsWithData && indexOfRowsWithData.length == 0) {
			untrack(() => (selectAllRowsWithData = false))
		}
	})

	let selectedRowsWithData: number[] = $derived.by(() => {
		if (selectAllRowsWithData) {
			return indexOfRowsWithData
		}

		return []
	})

	let noOfSelectedRowsWithData: number = $derived(selectedRowsWithData.length)

	let root: boolean = $derived(typeof rootelement === 'undefined')
</script>

<div
	class="flex flex-col gap-y-2 {root ? 'overflow-hidden' : 'min-w-fit'} {theme === Domain.Entities.Theme.Theme.DARK
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
		style="position: sticky; top: {stickyheaderoffset}px;"
		bind:clientHeight={groupHeaderHeight}
	>
		<section class="flex justify-between">
			<div class="sticky left-[10px] flex gap-x-1">
				<div class="flex h-fit gap-x-2 self-center">
					<button
						class="join-item btn btn-sm btn-ghost btn-square"
						onclick={() => (showMenuID = showMenuID === 'table-menu' ? '' : 'table-menu')}
						aria-label="Show/Collapse Menu"
					>
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

		{#if showMenuID === 'table-menu'}
			<div
				class="rounded-md shadow-inner shadow-gray-800 {theme === Domain.Entities.Theme.Theme.DARK
					? 'bg-gray-600 text-white'
					: 'bg-gray-300 text-black'} flex w-fit flex-col gap-y-2 p-1"
			>
				<button
					class="join-item btn btn-md btn-ghost"
					onclick={() => {
						delete group[MetadataModel.FgProperties.DATUM_INPUT_VIEW]
						updatefieldgroup(group)
					}}
					aria-label="switch to table view"
				>
					switch to form view
				</button>

				<button class="join-item btn btn-md btn-ghost" onclick={() => (showJson = !showJson)} aria-label="View JSON">
					view data as json
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
			</div>
		{/if}

		{#if showGroupDescription}
			<div class="max-h-[30vh] overflow-auto text-sm">
				{group[MetadataModel.FgProperties.FIELD_GROUP_DESCRIPTION]}
			</div>
		{/if}

		<section class="flex p-2 shadow-inner shadow-gray-900">
			<section class="join sticky left-[10px] w-fit">
				<div class="flex flex-col gap-y-1">
					<button
						class="join-item btn btn-xs tooltip tooltip-right max-w-fit {themecolor === Domain.Entities.Theme.Color.PRIMARY
							? 'btn-primary tooltip-primary'
							: themecolor === Domain.Entities.Theme.Color.SECONDARY
								? 'btn-secondary tooltip-secondary'
								: 'btn-accent tooltip-accent'}"
						aria-label="View Columns Menu"
						data-tip="View columns"
						onclick={() => (showMenuID = showMenuID === 'view-columns' ? '' : 'view-columns')}
					>
						<!--mdi:format-columns source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
							<path
								fill="var({Utils.Theme.GetColorContent(themecolor)})"
								d="M3 3h8v2H3zm10 0h8v2h-8zM3 7h8v2H3zm10 0h8v2h-8zM3 11h8v2H3zm10 0h8v2h-8zM3 15h8v2H3zm10 0h8v2h-8zM3 19h8v2H3zm10 0h8v2h-8z"
							/>
						</svg>
					</button>

					{#if showMenuID === 'view-columns'}
						{#await import('../../../../FieldsMenu/Component.svelte') then { default: FieldsMenu }}
							<div class="rounded-md shadow-inner shadow-gray-800 {theme === Domain.Entities.Theme.Theme.DARK ? 'bg-gray-600' : 'bg-gray-300'}">
								<FieldsMenu
									{fields}
									{themecolor}
									{theme}
									{telemetry}
									transparent={true}
									updatefield={(field: any, _: number) => {
										onupdatefieldgroup(field)
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
					aria-label="Delete All Data"
					data-tip="Delete all data"
					onclick={ondeletedata}
				>
					<!--mdi:delete source: https://icon-sets.iconify.design-->
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
						<path fill="var({Utils.Theme.GetColorContent(themecolor)})" d="M19 4h-3.5l-1-1h-5l-1 1H5v2h14M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6z" />
					</svg>
				</button>

				<button
					class="join-item btn btn-xs tooltip tooltip-right max-w-fit {themecolor === Domain.Entities.Theme.Color.PRIMARY
						? 'btn-primary tooltip-primary'
						: themecolor === Domain.Entities.Theme.Color.SECONDARY
							? 'btn-secondary tooltip-secondary'
							: 'btn-accent tooltip-accent'}"
					aria-label="Freeze Selected Columns"
					data-tip="Freeze selected columns"
					onclick={() => {
						let fieldsToLock: any[] = []

						for (let ugsColumnIndex = unlockedGridSelectColumnMinIndex; ugsColumnIndex <= unlockedGridSelectColumnMaxIndex; ugsColumnIndex++) {
							fieldsToLock.push(fields[unlockedViewableFields[ugsColumnIndex]])
						}

						fieldsToLock.forEach((field) => {
							field[MetadataModel.FgProperties.FIELD_GROUP_VIEW_TABLE_LOCK_COLUMN] = true
							onupdatefieldgroup(field)
						})
					}}
					disabled={!unlockedGridSelectActive}
				>
					<!--mdi:lock source: https://icon-sets.iconify.design-->
					<svg xmlns="http://www.w3.org/2000/svg" width="23" height="24" viewBox="0 0 24 24">
						<path
							fill="var({Utils.Theme.GetColorContent(themecolor)})"
							d="M12 17a2 2 0 0 0 2-2a2 2 0 0 0-2-2a2 2 0 0 0-2 2a2 2 0 0 0 2 2m6-9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2h1V6a5 5 0 0 1 5-5a5 5 0 0 1 5 5v2zm-6-5a3 3 0 0 0-3 3v2h6V6a3 3 0 0 0-3-3"
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

				<button
					class="join-item btn btn-xs tooltip tooltip-right max-w-fit {themecolor === Domain.Entities.Theme.Color.PRIMARY
						? 'btn-primary tooltip-primary'
						: themecolor === Domain.Entities.Theme.Color.SECONDARY
							? 'btn-secondary tooltip-secondary'
							: 'btn-accent tooltip-accent'}"
					aria-label="Hide Selected Columns"
					data-tip="Hide selected columns"
					onclick={() => {
						let fieldsToHide: any[] = []

						for (let ugsColumnIndex = unlockedGridSelectColumnMinIndex; ugsColumnIndex <= unlockedGridSelectColumnMaxIndex; ugsColumnIndex++) {
							fieldsToHide.push(fields[unlockedViewableFields[ugsColumnIndex]])
						}

						fieldsToHide.forEach((field) => {
							field[MetadataModel.FgProperties.FIELD_GROUP_VIEW_DISABLE] = true
							onupdatefieldgroup(field)
						})
					}}
					disabled={!unlockedGridSelectActive}
				>
					<!--mdi:eye-off source: https://icon-sets.iconify.design-->
					<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
						<path
							fill="var({Utils.Theme.GetColorContent(themecolor)})"
							d="M11.83 9L15 12.16V12a3 3 0 0 0-3-3zm-4.3.8l1.55 1.55c-.05.21-.08.42-.08.65a3 3 0 0 0 3 3c.22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53a5 5 0 0 1-5-5c0-.79.2-1.53.53-2.2M2 4.27l2.28 2.28l.45.45C3.08 8.3 1.78 10 1 12c1.73 4.39 6 7.5 11 7.5c1.55 0 3.03-.3 4.38-.84l.43.42L19.73 22L21 20.73L3.27 3M12 7a5 5 0 0 1 5 5c0 .64-.13 1.26-.36 1.82l2.93 2.93c1.5-1.25 2.7-2.89 3.43-4.75c-1.73-4.39-6-7.5-11-7.5c-1.4 0-2.74.25-4 .7l2.17 2.15C10.74 7.13 11.35 7 12 7"
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

				<button
					class="join-item btn btn-xs tooltip tooltip-right max-w-fit {themecolor === Domain.Entities.Theme.Color.PRIMARY
						? 'btn-primary tooltip-primary'
						: themecolor === Domain.Entities.Theme.Color.SECONDARY
							? 'btn-secondary tooltip-secondary'
							: 'btn-accent tooltip-accent'} {copyModeActive ? 'tooltip-open' : ''}"
					aria-label="Copy Selected Data"
					data-tip={copyModeActive ? 'select any row-column to paste data' : 'copy selected data'}
					onclick={() => {
						copyModeActive = !copyModeActive
					}}
					disabled={!unlockedGridSelectActive && noOfSelectedRowsWithData < 1}
				>
					<!--mdi:content-copy source: https://icon-sets.iconify.design-->
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
						<path
							fill="var({Utils.Theme.GetColorContent(themecolor)})"
							d="M19 21H8V7h11m0-2H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2m-3-4H4a2 2 0 0 0-2 2v14h2V3h12z"
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

				<button
					class="join-item btn btn-xs tooltip tooltip-right max-w-fit {themecolor === Domain.Entities.Theme.Color.PRIMARY
						? 'btn-primary tooltip-primary'
						: themecolor === Domain.Entities.Theme.Color.SECONDARY
							? 'btn-secondary tooltip-secondary'
							: 'btn-accent tooltip-accent'}"
					aria-label="Delete Selected Data"
					data-tip="delete selected data"
					onclick={() => {
						if (noOfSelectedRowsWithData > 0) {
							for (const srIndex of selectedRowsWithData) {
								data2D[srIndex] = []
							}
						} else {
							for (let rIndex = unlockedGridSelectRowMinIndex; rIndex <= unlockedGridSelectRowMaxIndex; rIndex++) {
								if (rIndex >= noOfRowsWithData) {
									break
								}

								if (!Array.isArray(data2D[rIndex])) {
									continue
								}

								for (let ucIndex = unlockedGridSelectColumnMinIndex; ucIndex <= unlockedGridSelectColumnMaxIndex; ucIndex++) {
									const cIndex = unlockedViewableFields[ucIndex]

									if (cIndex > data2D[rIndex].length - 1) {
										continue
									}
									data2D[rIndex][cIndex] = undefined
								}
							}
						}

						onupdatedata()
					}}
					disabled={!unlockedGridSelectActive && noOfSelectedRowsWithData < 1}
				>
					<!--mdi:delete source: https://icon-sets.iconify.design-->
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
						<path fill="var({Utils.Theme.GetColorContent(themecolor)})" d="M19 4h-3.5l-1-1h-5l-1 1H5v2h14M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6z" />
					</svg>

					<!--mdi:select source: https://icon-sets.iconify.design-->
					<svg class="self-start" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24">
						<path
							fill="var({Utils.Theme.GetColorContent(themecolor)})"
							d="M4 3h1v2H3V4a1 1 0 0 1 1-1m16 0a1 1 0 0 1 1 1v1h-2V3zm-5 2V3h2v2zm-4 0V3h2v2zM7 5V3h2v2zm14 15a1 1 0 0 1-1 1h-1v-2h2zm-6 1v-2h2v2zm-4 0v-2h2v2zm-4 0v-2h2v2zm-3 0a1 1 0 0 1-1-1v-1h2v2zm-1-6h2v2H3zm18 0v2h-2v-2zM3 11h2v2H3zm18 0v2h-2v-2zM3 7h2v2H3zm18 0v2h-2V7z"
						/>
					</svg>
				</button>

				<button
					class="join-item btn btn-xs tooltip tooltip-right max-w-fit {themecolor === Domain.Entities.Theme.Color.PRIMARY
						? 'btn-primary tooltip-primary'
						: themecolor === Domain.Entities.Theme.Color.SECONDARY
							? 'btn-secondary tooltip-secondary'
							: 'btn-accent tooltip-accent'}"
					aria-label="Export Selected Data as csv"
					data-tip="export selected data as csv"
					onclick={() => {
						try {
							let dataToParse: any[][] = [[]]
							let columnHeaderIndexes: number[] = []

							if (noOfSelectedRowsWithData > 0) {
								for (let fIndex = 0; fIndex < fields.length; fIndex++) {
									if (fields[fIndex][MetadataModel.FgProperties.FIELD_GROUP_VIEW_DISABLE]) {
										continue
									}

									columnHeaderIndexes.push(fIndex)
									dataToParse[0].push(MetadataModel.GetFieldGroupName(fields[fIndex]))
								}

								for (const srIndex of selectedRowsWithData) {
									const rIndex = selectedRowsWithData[srIndex]

									if (rIndex > data2D.length - 1) {
										break
									}

									let dataRow = []
									for (const chi of columnHeaderIndexes) {
										dataRow.push(data2D[rIndex][chi])
									}

									dataToParse.push(dataRow)
								}
							} else {
								for (let cIndex = unlockedGridSelectColumnMinIndex; cIndex <= unlockedGridSelectColumnMaxIndex; cIndex++) {
									const fIndex = unlockedViewableFields[cIndex]

									if (fields[fIndex][MetadataModel.FgProperties.FIELD_GROUP_VIEW_DISABLE]) {
										continue
									}
									columnHeaderIndexes.push(fIndex)
									dataToParse[0].push(MetadataModel.GetFieldGroupName(fields[fIndex]))
								}

								for (let rIndex = unlockedGridSelectRowMinIndex; rIndex <= unlockedGridSelectRowMaxIndex; rIndex++) {
									if (rIndex > data2D.length - 1) {
										break
									}

									let dataRow = []
									for (const chi of columnHeaderIndexes) {
										dataRow.push(data2D[rIndex][chi])
									}

									dataToParse.push(dataRow)
								}
							}

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
					disabled={!unlockedGridSelectActive && noOfSelectedRowsWithData < 1}
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
	</header>

	<main
		class="relative z-[1] grid flex-1 {root ? 'h-full overflow-auto' : 'min-h-fit'}"
		style="grid-template-columns: repeat({gridTemplateColumns}, minmax(min-content, 500px));"
	>
		{#if showJson}
			<pre
				class="grid h-fit w-full {theme === Domain.Entities.Theme.Theme.DARK
					? 'bg-gray-500'
					: 'bg-gray-700'} ml-1 mr-1 p-1 text-white shadow-inner shadow-gray-800"
				style="grid-template-columns: subgrid; grid-column: span {gridTemplateColumns};"><code
					>{JSON.stringify(getdata(groupKey, arrayindexplaceholders), null, 4)}</code
				></pre>
		{:else}
			<header
				style="top: {stickyheaderoffset + (root ? 0 : groupHeaderHeight)}px; grid-template-columns: subgrid; grid-column: span {gridTemplateColumns};"
				class="sticky left-0 right-0 z-[2] grid h-fit min-w-fit shadow-sm shadow-gray-800 {theme === Domain.Entities.Theme.Theme.DARK
					? switchbackground
						? 'border-gray-950 bg-gray-800'
						: 'border-gray-900 bg-gray-700'
					: switchbackground
						? 'border-gray-500 bg-gray-300'
						: 'border-gray-400 bg-gray-200'}"
				bind:clientHeight={columnHeaderHeight}
			>
				<section
					style="grid-column: span {lockedFields.length + LOCKED_FIXED_COLUMNS}; grid-template-columns: subgrid;"
					class="sticky left-0 z-[2] grid shadow-sm shadow-gray-800 {theme === Domain.Entities.Theme.Theme.DARK
						? switchbackground
							? 'border-gray-950 bg-gray-800'
							: 'border-gray-900 bg-gray-700'
						: switchbackground
							? 'border-gray-500 bg-gray-300'
							: 'border-gray-400 bg-gray-200'}"
				>
					<div class="flex h-full w-[47px] max-w-[47px] justify-center p-1 text-lg font-bold">
						<div class="h-fit w-fit self-start">#</div>
					</div>

					<div class="flex h-full w-[47px] max-w-[47px] justify-center p-1 text-lg font-bold">
						<div
							class="tooltip tooltip-right h-fit w-fit self-start {themecolor === Domain.Entities.Theme.Color.PRIMARY
								? 'tooltip-primary'
								: themecolor === Domain.Entities.Theme.Color.SECONDARY
									? 'tooltip-secondary'
									: 'tooltip-accent'}"
							data-tip="select/unselect rows with data"
						>
							<input
								class="checkbox checkbox-md {themecolor === Domain.Entities.Theme.Color.PRIMARY
									? 'checkbox-primary'
									: themecolor === Domain.Entities.Theme.Color.SECONDARY
										? 'checkbox-secondary'
										: 'checkbox-accent'}"
								type="checkbox"
								bind:checked={selectAllRowsWithData}
							/>
						</div>
					</div>

					{#each lockedFields as lfIndex (lfIndex)}
						{@const column = fields[lfIndex]}

						{#if column}
							{@render headerFieldColumn(column, lfIndex, lfIndex)}
						{:else}
							<div class="text-error h-full w-full">column not found</div>
						{/if}
					{/each}

					<div class="flex h-full w-[47px] max-w-[47px] justify-center p-1 text-lg font-bold">
						<button
							class="btn btn-sm btn-ghost tooltip tooltip-right h-fit w-fit self-start {themecolor === Domain.Entities.Theme.Color.PRIMARY
								? 'tooltip-primary'
								: themecolor === Domain.Entities.Theme.Color.SECONDARY
									? 'tooltip-secondary'
									: 'tooltip-accent'}"
							data-tip="unselect unfrozen columns and rows"
							onclick={resetUnlockedGridSelect}
						>
							<!--mdi:select source: https://icon-sets.iconify.design-->
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
								<path
									fill="var({Utils.Theme.GetColor(themecolor)})"
									d="M4 3h1v2H3V4a1 1 0 0 1 1-1m16 0a1 1 0 0 1 1 1v1h-2V3zm-5 2V3h2v2zm-4 0V3h2v2zM7 5V3h2v2zm14 15a1 1 0 0 1-1 1h-1v-2h2zm-6 1v-2h2v2zm-4 0v-2h2v2zm-4 0v-2h2v2zm-3 0a1 1 0 0 1-1-1v-1h2v2zm-1-6h2v2H3zm18 0v2h-2v-2zM3 11h2v2H3zm18 0v2h-2v-2zM3 7h2v2H3zm18 0v2h-2V7z"
								/>
							</svg>
						</button>
					</div>
				</section>

				{#each Utils.Range(unlockedViewableColumnFieldsStart, Utils.RangeArrayEnd(unlockedViewableColumnFieldsEnd, noOfUnclockedViewableColumnFields)) as ucfIndex (ucfIndex)}
					{@const ufIndex = unlockedViewableFields[ucfIndex]}

					{#if typeof ufIndex === 'number'}
						{@const column = fields[ufIndex]}

						{#if column}
							{@render headerFieldColumn(column, ufIndex, undefined, ufIndex)}
						{:else}
							<div class="text-error h-full w-full">column not found</div>
						{/if}
					{/if}
				{/each}
			</header>

			<main class="z-[1] grid" style="grid-template-columns: subgrid; grid-column: span {gridTemplateColumns};">
				{#each Utils.Range(rowsStart, Utils.RangeArrayEnd(rowsEnd, noOfRows)) as rIndex (rIndex)}
					{@const rowWithinUnlockedGrid = rIndex >= unlockedGridSelectRowMinIndex && rIndex <= unlockedGridSelectRowMaxIndex}

					{@const rowSelected = selectedRowsWithData.includes(rIndex)}

					<section
						style="grid-template-columns: subgrid; grid-column: span {gridTemplateColumns};"
						class="grid {rIndex !== rowsEnd ? 'border-b border-gray-800' : ''}"
					>
						<section
							style="grid-column: span {lockedFields.length + LOCKED_FIXED_COLUMNS}; grid-template-columns: subgrid;"
							class="sticky left-0 z-[2] grid shadow-sm shadow-gray-800 {rowSelected
								? themecolor === Domain.Entities.Theme.Color.PRIMARY
									? 'bg-primary/40'
									: themecolor === Domain.Entities.Theme.Color.SECONDARY
										? 'bg-secondary/40'
										: 'bg-accent/40'
								: theme === Domain.Entities.Theme.Theme.DARK
									? switchbackground
										? 'border-gray-950 bg-gray-800'
										: 'border-gray-900 bg-gray-700'
									: switchbackground
										? 'border-gray-500 bg-gray-300'
										: 'border-gray-400 bg-gray-200'}"
						>
							<div class="flex h-full w-[47px] min-w-fit justify-center p-1 text-lg font-bold">
								<div
									class="h-fit w-fit self-start {indexOfRowsWithData.includes(rIndex)
										? themecolor === Domain.Entities.Theme.Color.PRIMARY
											? 'text-primary'
											: themecolor === Domain.Entities.Theme.Color.SECONDARY
												? 'text-secondary'
												: 'text-accent'
										: ''}"
								>
									{rIndex + 1}
								</div>
							</div>

							<div class="flex h-full w-[47px] max-w-[47px] justify-center p-1 text-lg font-bold">
								<div
									class="tooltip tooltip-right h-fit w-fit self-start {themecolor === Domain.Entities.Theme.Color.PRIMARY
										? 'tooltip-primary'
										: themecolor === Domain.Entities.Theme.Color.SECONDARY
											? 'tooltip-secondary'
											: 'tooltip-accent'}"
									data-tip="select/unselect row"
								>
									<input
										class="checkbox checkbox-md {themecolor === Domain.Entities.Theme.Color.PRIMARY
											? 'checkbox-primary'
											: themecolor === Domain.Entities.Theme.Color.SECONDARY
												? 'checkbox-secondary'
												: 'checkbox-accent'}"
										type="checkbox"
										checked={selectedRowsWithData.includes(rIndex)}
										oninput={(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
											if (e.currentTarget.checked) {
												selectedRowsWithData = [...selectedRowsWithData, rIndex]
											} else {
												selectedRowsWithData = selectedRowsWithData.filter((srIndex) => srIndex !== rIndex)
											}
										}}
										disabled={rIndex > noOfRowsWithData - 1}
									/>
								</div>
							</div>

							{#each lockedFields as lfIndex (lfIndex)}
								{@const column = fields[lfIndex]}

								{#if column}
									{@render mainFieldColumn(column, rIndex, lfIndex, lfIndex)}
								{:else}
									<div class="text-error h-full w-full">column not found</div>
								{/if}
							{/each}

							<div class="flex h-full w-[47px] max-w-[47px] justify-center p-1 text-lg font-bold">
								{#if rowWithinUnlockedGrid}
									<!--mdi:select-inverse source: https://icon-sets.iconify.design-->
									<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
										<path
											fill="var({rowSelected ? Utils.Theme.GetColorContent(themecolor) : Utils.Theme.GetColor(themecolor)})"
											d="M5 3h2v2h2V3h2v2h2V3h2v2h2V3h2v2h2v2h-2v2h2v2h-2v2h2v2h-2v2h2v2h-2v2h-2v-2h-2v2h-2v-2h-2v2H9v-2H7v2H5v-2H3v-2h2v-2H3v-2h2v-2H3V9h2V7H3V5h2z"
										/>
									</svg>
								{:else}
									<!--mdi:select source: https://icon-sets.iconify.design-->
									<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
										<path
											fill="var({rowSelected ? Utils.Theme.GetColorContent(themecolor) : Utils.Theme.GetColor(themecolor)})"
											d="M4 3h1v2H3V4a1 1 0 0 1 1-1m16 0a1 1 0 0 1 1 1v1h-2V3zm-5 2V3h2v2zm-4 0V3h2v2zM7 5V3h2v2zm14 15a1 1 0 0 1-1 1h-1v-2h2zm-6 1v-2h2v2zm-4 0v-2h2v2zm-4 0v-2h2v2zm-3 0a1 1 0 0 1-1-1v-1h2v2zm-1-6h2v2H3zm18 0v2h-2v-2zM3 11h2v2H3zm18 0v2h-2v-2zM3 7h2v2H3zm18 0v2h-2V7z"
										/>
									</svg>
								{/if}
							</div>
						</section>

						{#each Utils.Range(unlockedViewableColumnFieldsStart, Utils.RangeArrayEnd(unlockedViewableColumnFieldsEnd, noOfUnclockedViewableColumnFields)) as ucfIndex (ucfIndex)}
							{@const ufIndex = unlockedViewableFields[ucfIndex]}

							{#if typeof ufIndex === 'number'}
								{@const column = fields[ufIndex]}

								{#if column}
									{@const rowColumnWithinUnlockedGrid =
										rIndex >= unlockedGridSelectRowMinIndex &&
										rIndex <= unlockedGridSelectRowMaxIndex &&
										ucfIndex >= unlockedGridSelectColumnMinIndex &&
										ucfIndex <= unlockedGridSelectColumnMaxIndex}

									<div
										class="grid {rowColumnWithinUnlockedGrid || rowSelected
											? themecolor === Domain.Entities.Theme.Color.PRIMARY
												? 'bg-primary/40'
												: themecolor === Domain.Entities.Theme.Color.SECONDARY
													? 'bg-secondary/40'
													: 'bg-accent/40'
											: ''}"
										style="grid-template-columns: max-content auto;"
									>
										<button
											class="btn btn-xs btn-ghost tooltip tooltip-right h-fit w-fit {themecolor === Domain.Entities.Theme.Color.PRIMARY
												? 'tooltip-primary'
												: themecolor === Domain.Entities.Theme.Color.SECONDARY
													? 'tooltip-secondary'
													: 'tooltip-accent'}"
											aria-label="Unlocked Select Row {ufIndex} Column {ucfIndex}"
											onclick={() => handleUnlockedGridSelectRowColumn(rIndex, ucfIndex)}
											data-tip="select column in row"
										>
											<!--mdi:select source: https://icon-sets.iconify.design-->
											<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
												<path
													fill="var({rowColumnWithinUnlockedGrid || rowSelected
														? Utils.Theme.GetColorContent(themecolor)
														: Utils.Theme.GetColor(themecolor)})"
													d="M4 3h1v2H3V4a1 1 0 0 1 1-1m16 0a1 1 0 0 1 1 1v1h-2V3zm-5 2V3h2v2zm-4 0V3h2v2zM7 5V3h2v2zm14 15a1 1 0 0 1-1 1h-1v-2h2zm-6 1v-2h2v2zm-4 0v-2h2v2zm-4 0v-2h2v2zm-3 0a1 1 0 0 1-1-1v-1h2v2zm-1-6h2v2H3zm18 0v2h-2v-2zM3 11h2v2H3zm18 0v2h-2v-2zM3 7h2v2H3zm18 0v2h-2V7z"
												/>
											</svg>
										</button>

										{@render mainFieldColumn(column, rIndex, ufIndex, undefined, ufIndex)}
									</div>
								{:else}
									<div class="text-error h-full w-full">column not found</div>
								{/if}
							{/if}
						{/each}
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
		style="position:sticky; top: {stickyheaderoffset + groupHeaderHeight}px;"
	>
		<div class="flex gap-x-8">
			<span class="join sticky left-[10px]">
				<button
					class="join-item btn btn-sm tooltip tooltip-right self-center {themecolor === Domain.Entities.Theme.Color.PRIMARY
						? 'btn-primary tooltip-primary'
						: themecolor === Domain.Entities.Theme.Color.SECONDARY
							? 'btn-secondary tooltip-secondary'
							: 'btn-accent tooltip-accent'}"
					onclick={() => {
						noOfRows += 50
					}}
					data-tip="add 50 new rows"
				>
					<!--mdi:plus-circle source: https://icon-sets.iconify.design-->
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
						<path
							fill="var({Utils.Theme.GetColorContent(themecolor)})"
							d="M17 13h-4v4h-2v-4H7v-2h4V7h2v4h4m-5-9A10 10 0 0 0 2 12a10 10 0 0 0 10 10a10 10 0 0 0 10-10A10 10 0 0 0 12 2"
						/>
					</svg>
				</button>
			</span>

			<span class="h-fit self-center">
				rows with data: {noOfRowsWithData}
			</span>
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

{#snippet mainFieldColumn(field: any, rowindex: number, columnindex: number, lfIndex: number = -1, ufIndex: number = -1)}
	<div class="flex flex-col gap-y-2 p-1">
		{#await import('./Column/Component.svelte') then { default: Column }}
			<Column
				{field}
				{theme}
				{themecolor}
				{rowindex}
				{columnindex}
				{updatefieldgroup}
				getdata={(_: string, arrayPlaceholderIndexes: number[]) => {
					return Json.GetValueInObject(data2D, arrayPlaceholderIndexes.join('.'))
				}}
				updatedata={(_: string, arrayPlaceholderIndexes: number[], value: any) => {
					Json.SetValueInObject(data2D, arrayPlaceholderIndexes.join('.'), value)
					onupdatedata()
				}}
				deletedata={(_: string, arrayPlaceholderIndexes: number[]) => {
					if (fields[arrayPlaceholderIndexes[1]][MetadataModel.FgProperties.FIELD_GROUP_MAX_ENTRIES] === 1) {
						Json.SetValueInObject(data2D, arrayPlaceholderIndexes.join('.'), undefined)
					} else {
						Json.DeleteValueInObject(data2D, arrayPlaceholderIndexes.join('.'))
					}
					onupdatedata()
				}}
				{telemetry}
				contentperpage={columnfieldcontentperpage}
				stickyheaderoffset={columnHeaderHeight}
				switchbackground={!switchbackground}
			></Column>
		{/await}
	</div>
{/snippet}

{#snippet headerFieldColumn(field: any, fieldIndexInFields: number, lfIndex: number = -1, ufIndex: number = -1)}
	{@const fName = MetadataModel.GetFieldGroupName(field)}

	{@const fieldColumnID = `header-column-${lfIndex}-${ufIndex}`}

	{@const lockColumn = field[MetadataModel.FgProperties.FIELD_GROUP_VIEW_TABLE_LOCK_COLUMN]}

	{@const hideColumn = field[MetadataModel.FgProperties.FIELD_GROUP_VIEW_DISABLE]}

	<div class="flex flex-col gap-y-2 p-1">
		<section class="flex gap-x-2">
			<button
				class="btn btn-ghost btn-sm btn-circle self-start"
				aria-label="show column menu {fieldColumnID}"
				onclick={() => {
					showMenuID = showMenuID === fieldColumnID ? '' : fieldColumnID
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

		{#if showMenuID === fieldColumnID}
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

						onupdatefieldgroup(field)
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

						onupdatefieldgroup(field)
					}}
				>
					{lockColumn ? 'Unfreeze' : 'Freeze'} column
				</button>
			</section>
		{/if}
	</div>
{/snippet}
