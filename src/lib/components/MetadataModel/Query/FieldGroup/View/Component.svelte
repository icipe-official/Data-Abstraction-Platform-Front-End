<!--
@component

Prop:
-
-->
<script lang="ts">
	import { Domain, Json, MetadataModel, Utils } from '$lib'
	import type { SelectOption } from '$lib/components/MultiSelect/util'
	import { GetColorContent } from '$lib/utils/theme'
	import { Tab } from './util'

	const COMPONENT_NAME = 'metadata-model-query-field-group-view'

	interface Props {
		fieldgroup: any
		themecolor: Domain.Entities.Theme.Color
		telemetry?: Domain.Interfaces.ITelemetry
		theme: Domain.Entities.Theme.Theme
		queryconditionindex: number
		updatefieldgroup: (value: any) => void
		handlegetfieldgroupquerycondition: (queryconditionindex: number, fieldGroupKey: string) => any
		handleupdatefieldgroupquerycondition: (queryconditionindex: number, fieldGroupKey: string, querycondition: MetadataModel.IQueryCondition) => void
	}

	let {
		fieldgroup = {},
		themecolor,
		telemetry = undefined,
		theme,
		queryconditionindex,
		updatefieldgroup,
		handlegetfieldgroupquerycondition,
		handleupdatefieldgroupquerycondition
	}: Props = $props()

	let fieldGroupKey: string = $derived(fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_KEY])

	let fieldGroupName: string = $derived(MetadataModel.GetFieldGroupName(fieldgroup))

	let fieldDataType: string = $derived(fieldgroup[MetadataModel.FgProperties.FIELD_DATATYPE])

	let queryCondition: any = $derived(handlegetfieldgroupquerycondition(queryconditionindex, fieldGroupKey))

	let currentTab: Tab = $state(Tab.QUERY_PROPERTIES)

	let showSectionID = $state('')

	let propertyLeftWidth: number = $state(0)

	function updateAndFilterCondition(orIndex: number, andIndex: number, andCondtion: MetadataModel.IFilterCondition) {
		queryCondition[MetadataModel.QcProperties.FG_FILTER_CONDITION]![orIndex][andIndex] = andCondtion
		queryCondition = JSON.parse(JSON.stringify(queryCondition))
		onhandleupdatefieldgroupquerycondition()
	}

	function onhandleupdatefieldgroupquerycondition() {
		handleupdatefieldgroupquerycondition(queryconditionindex, fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_KEY], queryCondition)
	}

	function getFilterCondition(orIndex: number, andIndex: number) {
		let filterCondition = ''

		if (Array.isArray(queryCondition[MetadataModel.QcProperties.FG_FILTER_CONDITION])) {
			if (Array.isArray(queryCondition[MetadataModel.QcProperties.FG_FILTER_CONDITION][orIndex])) {
				if (typeof queryCondition[MetadataModel.QcProperties.FG_FILTER_CONDITION][orIndex][andIndex] === 'object') {
					filterCondition =
						queryCondition[MetadataModel.QcProperties.FG_FILTER_CONDITION][orIndex][andIndex][MetadataModel.FConditionProperties.CONDITION] || ''
				}
			}
		}

		return filterCondition
	}

	function getOrInitFilterValue(orIndex: number, andIndex: number) {
		let andFilterCondition = queryCondition[MetadataModel.QcProperties.FG_FILTER_CONDITION][orIndex][andIndex]

		if (typeof andFilterCondition[MetadataModel.FConditionProperties.VALUE] === 'undefined') {
			andFilterCondition[MetadataModel.FConditionProperties.VALUE] = {}
		}

		if (typeof andFilterCondition[MetadataModel.FConditionProperties.VALUE][MetadataModel.FSelectProperties.TYPE] === 'undefined') {
			if (fieldgroup[MetadataModel.FgProperties.FIELD_UI] === MetadataModel.FieldUi.SELECT) {
				andFilterCondition[MetadataModel.FConditionProperties.VALUE][MetadataModel.FSelectProperties.TYPE] = MetadataModel.FSelectType.SELECT
			} else {
				switch (fieldgroup[MetadataModel.FgProperties.FIELD_DATATYPE] as MetadataModel.FieldType) {
					case MetadataModel.FieldType.TEXT:
						andFilterCondition[MetadataModel.FConditionProperties.VALUE][MetadataModel.FSelectProperties.TYPE] = MetadataModel.FieldType.TEXT
						break
					case MetadataModel.FieldType.NUMBER:
						andFilterCondition[MetadataModel.FConditionProperties.VALUE][MetadataModel.FSelectProperties.TYPE] = MetadataModel.FieldType.NUMBER
						break
					case MetadataModel.FieldType.TIMESTAMP:
						andFilterCondition[MetadataModel.FConditionProperties.VALUE][MetadataModel.FSelectProperties.TYPE] = MetadataModel.FieldType.TIMESTAMP
						break
					case MetadataModel.FieldType.BOOLEAN:
						andFilterCondition[MetadataModel.FConditionProperties.VALUE][MetadataModel.FSelectProperties.TYPE] = MetadataModel.FieldType.BOOLEAN
						break
				}
			}
		}

		return andFilterCondition[MetadataModel.FConditionProperties.VALUE]
	}

	function getBooleanSelectOptions() {
		let newSelectOptions = [
			{
				label: 'true',
				value: true
			},
			{
				label: 'false',
				value: false
			}
		]

		if (
			typeof fieldgroup[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_TRUE] === 'object' &&
			typeof fieldgroup[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_TRUE][MetadataModel.FieldCheckboxValueProperties.VALUE] !== 'undefined'
		) {
			newSelectOptions.push({
				label: fieldgroup[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_TRUE][MetadataModel.FieldCheckboxValueProperties.VALUE],
				value: fieldgroup[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_TRUE][MetadataModel.FieldCheckboxValueProperties.VALUE]
			})
		}

		if (
			typeof fieldgroup[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_FALSE] === 'object' &&
			typeof fieldgroup[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_FALSE][MetadataModel.FieldCheckboxValueProperties.VALUE] !== 'undefined'
		) {
			newSelectOptions.push({
				label: fieldgroup[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_FALSE][MetadataModel.FieldCheckboxValueProperties.VALUE],
				value: fieldgroup[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_FALSE][MetadataModel.FieldCheckboxValueProperties.VALUE]
			})
		}

		return newSelectOptions
	}
</script>

<div class="flex flex-1 flex-col gap-y-4 overflow-hidden">
	<header class="flex w-full">
		<section role="tablist" class="tabs tabs-sm tabs-border flex-[9]">
			<button
				role="tab"
				class="flex-1 tab{currentTab === Tab.QUERY_PROPERTIES ? ' tab-active' : ''}"
				onclick={() => (currentTab = Tab.QUERY_PROPERTIES)}
			>
				Properties
			</button>
			<button
				role="tab"
				class="flex-1 tab{currentTab === Tab.QUERY_CONDITIONS ? ' tab-active' : ''}"
				onclick={() => (currentTab = Tab.QUERY_CONDITIONS)}>Filter Conditions</button
			>
		</section>

		<section class="flex flex-col gap-y-2">
			<button
				class="btn btn-ghost btn-sm w-fit self-end"
				aria-label="Show/Hide Extra Tabs Menu"
				onclick={() => (showSectionID = showSectionID === 'extra-tabs' ? '' : 'extra-tabs')}
			>
				<!--mdi:dots-vertical source: https://icon-sets.iconify.design-->
				<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
					<path
						fill={theme === Domain.Entities.Theme.Theme.DARK ? 'white' : 'black'}
						d="M12 16a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2a2 2 0 0 1 2-2m0-6a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2a2 2 0 0 1 2-2m0-6a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2a2 2 0 0 1 2-2"
					/>
				</svg>
			</button>

			{#if showSectionID === 'extra-tabs'}
				<div
					class="rounded-md shadow-inner shadow-gray-800 {theme === Domain.Entities.Theme.Theme.DARK
						? 'bg-gray-700'
						: 'bg-gray-400'} flex w-fit flex-col gap-y-2 p-1"
				>
					<button
						class="btn btn-sm {currentTab === Tab.QUERY_JSON
							? themecolor === Domain.Entities.Theme.Color.PRIMARY
								? 'btn-primary'
								: themecolor === Domain.Entities.Theme.Color.SECONDARY
									? 'btn-secondary'
									: 'btn-accent'
							: 'btn-ghost'}"
						aria-label="View Query Condition as Json"
						onclick={() => (currentTab = Tab.QUERY_JSON)}
					>
						view query condition as json
					</button>

					<button
						class="btn btn-sm {currentTab === Tab.FIELD_GROUP_JSON
							? themecolor === Domain.Entities.Theme.Color.PRIMARY
								? 'btn-primary'
								: themecolor === Domain.Entities.Theme.Color.SECONDARY
									? 'btn-secondary'
									: 'btn-accent'
							: 'btn-ghost'}"
						aria-label="View Field/Group as Json"
						onclick={() => (currentTab = Tab.FIELD_GROUP_JSON)}
					>
						view all field/group as json
					</button>
				</div>
			{/if}
		</section>
	</header>

	{#if currentTab === Tab.QUERY_JSON}
		<pre
			class="h-full w-full flex-[9.5] overflow-auto rounded-lg p-1 {theme === Domain.Entities.Theme.Theme.DARK
				? 'border-gray-900 bg-gray-800'
				: 'border-gray-400 bg-gray-400'}"><code>{JSON.stringify(queryCondition, null, 4)}</code></pre>
	{:else if currentTab === Tab.FIELD_GROUP_JSON}
		<pre
			class="h-full w-full flex-[9.5] overflow-auto rounded-lg p-1 {theme === Domain.Entities.Theme.Theme.DARK
				? 'border-gray-900 bg-gray-800'
				: 'border-gray-400 bg-gray-400'}"><code>{JSON.stringify(fieldgroup, null, 4)}</code></pre>
	{:else if currentTab === Tab.QUERY_PROPERTIES}
		<section class="grid flex-[9.5] gap-4 overflow-auto rounded-md" style="grid-template-columns: minmax(min-content, 200px) auto;">
			<header
				class="sticky top-0 z-[3] grid {theme === Domain.Entities.Theme.Theme.DARK ? 'bg-gray-600' : 'bg-gray-300'}"
				style="grid-column:span 2; grid-template-columns: subgrid;"
			>
				<div
					class="sticky left-[2px] z-[2] h-full w-full {theme === Domain.Entities.Theme.Theme.DARK ? 'bg-gray-600' : 'bg-gray-300'}"
					bind:clientWidth={propertyLeftWidth}
				>
					<span class="font-bold italic">Property</span>
				</div>
				<div class="h-full w-full">
					<span class="sticky font-bold" style="left: {propertyLeftWidth}px;">Value</span>
				</div>
			</header>

			{@render propertyKey('key')}
			<div class="h-full w-full">
				<span class="sticky top-0 text-wrap break-words" style="left: {propertyLeftWidth}px;">{fieldGroupKey}</span>
			</div>

			{@render propertyKey('Name')}
			<div class="h-full w-full">
				<input
					class="input input-md sticky top-0 {themecolor === Domain.Entities.Theme.Color.PRIMARY
						? 'input-primary'
						: themecolor === Domain.Entities.Theme.Color.SECONDARY
							? 'input-secondary'
							: 'input-accent'}"
					type="text"
					placeholder="Enter field/group name..."
					value={fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_NAME]}
					oninput={(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
						if (e.currentTarget.value.length > 0) {
							fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_NAME] = e.currentTarget.value
						} else {
							delete fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_NAME]
						}
						updatefieldgroup(fieldgroup)
					}}
					style="left: {propertyLeftWidth}px;"
				/>
			</div>

			{@render propertyKey('Description')}
			<div class="h-full w-full">
				<textarea
					class="textarea textarea-md sticky top-0 {themecolor === Domain.Entities.Theme.Color.PRIMARY
						? 'textarea-primary'
						: themecolor === Domain.Entities.Theme.Color.SECONDARY
							? 'textarea-secondary'
							: 'textarea-accent'} w-[320px]"
					value={fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_DESCRIPTION]}
					oninput={(e: Event & { currentTarget: EventTarget & HTMLTextAreaElement }) => {
						if (e.currentTarget.value.length > 0) {
							fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_DESCRIPTION] = e.currentTarget.value
						} else {
							delete fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_DESCRIPTION]
						}
						updatefieldgroup(fieldgroup)
					}}
					style="left: {propertyLeftWidth}px;"
				></textarea>
			</div>

			{@render propertyKey('View Disabled?', 'Disable viewing field/group in tables.')}
			<div class="h-full w-full">
				<input
					class="checkbox checkbox-xl sticky top-0 {themecolor === Domain.Entities.Theme.Color.PRIMARY
						? 'checkbox-primary'
						: themecolor === Domain.Entities.Theme.Color.SECONDARY
							? 'checkbox-secondary'
							: 'checkbox-accent'}"
					type="checkbox"
					checked={fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_VIEW_DISABLE]}
					oninput={(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
						if (e.currentTarget.checked) {
							fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_VIEW_DISABLE] = true
						} else {
							delete fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_VIEW_DISABLE]
						}
						updatefieldgroup(fieldgroup)
					}}
					style="left: {propertyLeftWidth}px;"
				/>
			</div>

			{#if MetadataModel.IsGroupFieldContainsGroup(fieldgroup)}
				{@render propertyKey(
					'Group default view as table in 2D?',
					'View data as row and column with no nesting. Property works best if group has nested groups and not necessary to apply if it does not have nested groups.'
				)}

				<div class="h-full w-full">
					<input
						class="checkbox checkbox-xl sticky top-0 {themecolor === Domain.Entities.Theme.Color.PRIMARY
							? 'checkbox-primary'
							: themecolor === Domain.Entities.Theme.Color.SECONDARY
								? 'checkbox-secondary'
								: 'checkbox-accent'}"
						type="checkbox"
						checked={fieldgroup[MetadataModel.FgProperties.GROUP_VIEW_TABLE_IN_2D]}
						oninput={(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
							if (e.currentTarget.checked) {
								fieldgroup[MetadataModel.FgProperties.GROUP_VIEW_TABLE_IN_2D] = true
							} else {
								delete fieldgroup[MetadataModel.FgProperties.GROUP_VIEW_TABLE_IN_2D]
							}
							updatefieldgroup(fieldgroup)
						}}
						style="left: {propertyLeftWidth}px;"
					/>
				</div>
			{/if}

			{#if MetadataModel.IsGroupFieldAField(fieldgroup)}
				{@render propertyKey('Distinct', 'Make column part of columns used to deduplicate rows returned from querying data.')}
				<div class="h-full w-full">
					<input
						class="checkbox checkbox-xl sticky top-0 {themecolor === Domain.Entities.Theme.Color.PRIMARY
							? 'checkbox-primary'
							: themecolor === Domain.Entities.Theme.Color.SECONDARY
								? 'checkbox-secondary'
								: 'checkbox-accent'}"
						type="checkbox"
						checked={fieldgroup[MetadataModel.FgProperties.DATABASE_DISTINCT]}
						oninput={(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
							if (e.currentTarget.checked) {
								fieldgroup[MetadataModel.FgProperties.DATABASE_DISTINCT] = true
							} else {
								delete fieldgroup[MetadataModel.FgProperties.DATABASE_DISTINCT]
							}
							updatefieldgroup(fieldgroup)
						}}
						style="left: {propertyLeftWidth}px;"
					/>
				</div>

				{@render propertyKey(
					'Sort Order',
					`Sort order when performing database search. Currently set to: ${fieldgroup[MetadataModel.FgProperties.DATABASE_SORT_BY_ASC] === true ? 'ASCENDING ORDER' : fieldgroup[MetadataModel.FgProperties.DATABASE_SORT_BY_ASC] === false ? 'DESCENDING ORDER' : 'NONE'}`
				)}
				<button
					class="btn btn-md btn-circle sticky top-0"
					onclick={() => {
						if (fieldgroup[MetadataModel.FgProperties.DATABASE_SORT_BY_ASC] === true) {
							fieldgroup[MetadataModel.FgProperties.DATABASE_SORT_BY_ASC] = false
						} else if (fieldgroup[MetadataModel.FgProperties.DATABASE_SORT_BY_ASC] === false) {
							delete fieldgroup[MetadataModel.FgProperties.DATABASE_SORT_BY_ASC]
						} else {
							fieldgroup[MetadataModel.FgProperties.DATABASE_SORT_BY_ASC] = true
						}
						updatefieldgroup(fieldgroup)
					}}
					aria-label="Set Sort Order"
					style="left: {propertyLeftWidth}px;"
				>
					{#if fieldgroup[MetadataModel.FgProperties.DATABASE_SORT_BY_ASC] === true}
						<!--mdi:sort-ascending source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
							<path fill="var({Utils.Theme.GetColor(themecolor)})" d="M19 17h3l-4 4l-4-4h3V3h2M2 17h10v2H2M6 5v2H2V5m0 6h7v2H2z" />
						</svg>
					{:else if fieldgroup[MetadataModel.FgProperties.DATABASE_SORT_BY_ASC] === false}
						<!--mdi:sort-descending source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
							<path fill="var({Utils.Theme.GetColor(themecolor)})" d="M19 7h3l-4-4l-4 4h3v14h2M2 17h10v2H2M6 5v2H2V5m0 6h7v2H2z" />
						</svg>
					{:else}
						<!--mdi:do-not-enter source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
							<path
								fill="var({Utils.Theme.GetColor(themecolor)})"
								d="M17 13H7v-2h10m-5-9A10 10 0 0 0 2 12a10 10 0 0 0 10 10a10 10 0 0 0 10-10A10 10 0 0 0 12 2"
							/>
						</svg>
					{/if}
				</button>
			{/if}

			{@render propertyKey('Database Skip Data Extraction?', 'Skip extracting data when fetching it from the database.')}
			<div class="h-full w-full">
				<input
					class="checkbox checkbox-xl sticky top-0 {themecolor === Domain.Entities.Theme.Color.PRIMARY
						? 'checkbox-primary'
						: themecolor === Domain.Entities.Theme.Color.SECONDARY
							? 'checkbox-secondary'
							: 'checkbox-accent'}"
					type="checkbox"
					checked={fieldgroup[MetadataModel.FgProperties.DATABASE_SKIP_DATA_EXTRACTION]}
					oninput={(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
						if (e.currentTarget.checked) {
							fieldgroup[MetadataModel.FgProperties.DATABASE_SKIP_DATA_EXTRACTION] = true
						} else {
							delete fieldgroup[MetadataModel.FgProperties.DATABASE_SKIP_DATA_EXTRACTION]
						}
						updatefieldgroup(fieldgroup)
					}}
					style="left: {propertyLeftWidth}px;"
				/>
			</div>

			{@render propertyKey('Field/Group is Primary Key?', 'Used for purporses such as converting a 2D array to an array of objects.')}
			<div class="h-full w-full">
				<input
					class="checkbox checkbox-xl sticky top-0 {themecolor === Domain.Entities.Theme.Color.PRIMARY
						? 'checkbox-primary'
						: themecolor === Domain.Entities.Theme.Color.SECONDARY
							? 'checkbox-secondary'
							: 'checkbox-accent'}"
					type="checkbox"
					checked={fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_IS_PRIMARY_KEY]}
					oninput={(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
						if (e.currentTarget.checked) {
							fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_IS_PRIMARY_KEY] = true
						} else {
							delete fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_IS_PRIMARY_KEY]
						}
						updatefieldgroup(fieldgroup)
					}}
					style="left: {propertyLeftWidth}px;"
				/>
			</div>

			{@render propertyKey(
				'Database table/collection unique id',
				'May be relevant in identifying columns/fields that belong to a particular table/collection in a nested join.'
			)}
			<div class="h-full w-full">
				<input
					class="input input-md sticky top-0 {themecolor === Domain.Entities.Theme.Color.PRIMARY
						? 'input-primary'
						: themecolor === Domain.Entities.Theme.Color.SECONDARY
							? 'input-secondary'
							: 'input-accent'}"
					type="text"
					placeholder="Enter table/collection unique id..."
					value={fieldgroup[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_UID]}
					oninput={(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
						if (e.currentTarget.value.length > 0) {
							fieldgroup[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_UID] = e.currentTarget.value
						} else {
							delete fieldgroup[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_UID]
						}
						updatefieldgroup(fieldgroup)
					}}
					style="left: {propertyLeftWidth}px;"
				/>
			</div>

			{#if MetadataModel.IsGroupFieldContainsGroup(fieldgroup)}
				{@render propertyKey(
					'Database table/collection unique id',
					'May be relevant in identifying tables/collections while fetching data from the database.'
				)}
				<div class="h-full w-full">
					<input
						class="input input-md sticky top-0 {themecolor === Domain.Entities.Theme.Color.PRIMARY
							? 'input-primary'
							: themecolor === Domain.Entities.Theme.Color.SECONDARY
								? 'input-secondary'
								: 'input-accent'}"
						type="text"
						placeholder="Enter table/collection name..."
						value={fieldgroup[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_NAME]}
						oninput={(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
							if (e.currentTarget.value.length > 0) {
								fieldgroup[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_NAME] = e.currentTarget.value
							} else {
								delete fieldgroup[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_NAME]
							}
							updatefieldgroup(fieldgroup)
						}}
						style="left: {propertyLeftWidth}px;"
					/>
				</div>

				{@render propertyKey('Database Results Limit', 'Maximum number of results to return from database query.')}
				<div class="h-full w-full">
					<input
						class="input input-md sticky top-0 {themecolor === Domain.Entities.Theme.Color.PRIMARY
							? 'input-primary'
							: themecolor === Domain.Entities.Theme.Color.SECONDARY
								? 'input-secondary'
								: 'input-accent'}"
						type="number"
						min="0"
						placeholder="Enter maximum number of results..."
						value={fieldgroup[MetadataModel.FgProperties.DATABASE_LIMIT]}
						oninput={(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
							if (e.currentTarget.value.length > 0) {
								if (!Number.isNaN(e.currentTarget.value)) {
									fieldgroup[MetadataModel.FgProperties.DATABASE_LIMIT] = Math.round(Number(e.currentTarget.value))
								} else {
									delete fieldgroup[MetadataModel.FgProperties.DATABASE_LIMIT]
								}
							} else {
								delete fieldgroup[MetadataModel.FgProperties.DATABASE_LIMIT]
							}
							updatefieldgroup(fieldgroup)
						}}
						style="left: {propertyLeftWidth}px;"
					/>
				</div>

				{@render propertyKey('Database Results Offset', 'Number of results to skip in database query.')}
				<div class="h-full w-full">
					<input
						class="input input-md sticky top-0 {themecolor === Domain.Entities.Theme.Color.PRIMARY
							? 'input-primary'
							: themecolor === Domain.Entities.Theme.Color.SECONDARY
								? 'input-secondary'
								: 'input-accent'}"
						type="number"
						min="0"
						placeholder="Enter number of results to skip..."
						value={fieldgroup[MetadataModel.FgProperties.DATABASE_OFFSET]}
						oninput={(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
							if (e.currentTarget.value.length > 0) {
								if (!Number.isNaN(e.currentTarget.value)) {
									fieldgroup[MetadataModel.FgProperties.DATABASE_OFFSET] = Math.round(Number(e.currentTarget.value))
								} else {
									delete fieldgroup[MetadataModel.FgProperties.DATABASE_OFFSET]
								}
							} else {
								delete fieldgroup[MetadataModel.FgProperties.DATABASE_OFFSET]
							}
							updatefieldgroup(fieldgroup)
						}}
						style="left: {propertyLeftWidth}px;"
					/>
				</div>
			{/if}

			{#if MetadataModel.IsGroupFieldAField(fieldgroup)}
				{@render propertyKey('Database column/field name', 'May be relevant in identifying columns/fields while fetching data from the database.')}
				<div class="h-full w-full">
					<input
						class="input input-md sticky top-0 {themecolor === Domain.Entities.Theme.Color.PRIMARY
							? 'input-primary'
							: themecolor === Domain.Entities.Theme.Color.SECONDARY
								? 'input-secondary'
								: 'input-accent'}"
						type="text"
						placeholder="Enter column/field name..."
						value={fieldgroup[MetadataModel.FgProperties.DATABASE_FIELD_COLUMN_NAME]}
						oninput={(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
							if (e.currentTarget.value.length > 0) {
								fieldgroup[MetadataModel.FgProperties.DATABASE_FIELD_COLUMN_NAME] = e.currentTarget.value
							} else {
								delete fieldgroup[MetadataModel.FgProperties.DATABASE_FIELD_COLUMN_NAME]
							}
							updatefieldgroup(fieldgroup)
						}}
						style="left: {propertyLeftWidth}px;"
					/>
				</div>
			{/if}

			{@render propertyKey(
				'Field Group view values in separate columns?',
				'Put field/group values in a single row when working with the data in a table.'
			)}
			<div class="h-full w-full">
				<input
					class="checkbox checkbox-xl sticky top-0 {themecolor === Domain.Entities.Theme.Color.PRIMARY
						? 'checkbox-primary'
						: themecolor === Domain.Entities.Theme.Color.SECONDARY
							? 'checkbox-secondary'
							: 'checkbox-accent'}"
					type="checkbox"
					checked={fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_VIEW_VALUES_IN_SEPARATE_COLUMNS]}
					oninput={(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
						if (e.currentTarget.checked) {
							fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_VIEW_VALUES_IN_SEPARATE_COLUMNS] = true
						} else {
							delete fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_VIEW_VALUES_IN_SEPARATE_COLUMNS]
						}
						updatefieldgroup(fieldgroup)
					}}
					style="left: {propertyLeftWidth}px;"
				/>
			</div>

			{@render propertyKey('Field Group view max columns in separate columns', 'Maximum number of columns of values in one row.')}
			<div class="h-full w-full">
				<input
					class="input input-md sticky top-0 {themecolor === Domain.Entities.Theme.Color.PRIMARY
						? 'input-primary'
						: themecolor === Domain.Entities.Theme.Color.SECONDARY
							? 'input-secondary'
							: 'input-accent'}"
					type="number"
					min="0"
					placeholder="Enter field group max number of values in separate columns..."
					value={fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_VIEW_MAX_NO_OF_VALUES_IN_SEPARATE_COLUMNS]}
					oninput={(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
						if (e.currentTarget.value.length > 0) {
							if (!Number.isNaN(e.currentTarget.value)) {
								fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_VIEW_MAX_NO_OF_VALUES_IN_SEPARATE_COLUMNS] = Math.round(
									Number(e.currentTarget.value)
								)
							} else {
								delete fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_VIEW_MAX_NO_OF_VALUES_IN_SEPARATE_COLUMNS]
							}
						} else {
							delete fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_VIEW_MAX_NO_OF_VALUES_IN_SEPARATE_COLUMNS]
						}
						updatefieldgroup(fieldgroup)
					}}
					style="left: {propertyLeftWidth}px;"
				/>
			</div>

			{@render propertyKey('Field view header format', 'Field view header format (replaces [*] with column/row index)')}
			<div class="h-full w-full">
				<input
					class="input input-md sticky top-0 {themecolor === Domain.Entities.Theme.Color.PRIMARY
						? 'input-primary'
						: themecolor === Domain.Entities.Theme.Color.SECONDARY
							? 'input-secondary'
							: 'input-accent'}"
					type="text"
					placeholder="Enter view header format..."
					value={fieldgroup[MetadataModel.FgProperties.FIELD_VIEW_VALUES_IN_SEPARATE_COLUMNS_HEADER_FORMAT]}
					oninput={(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
						if (e.currentTarget.value.length > 0) {
							fieldgroup[MetadataModel.FgProperties.FIELD_VIEW_VALUES_IN_SEPARATE_COLUMNS_HEADER_FORMAT] = e.currentTarget.value
						} else {
							delete fieldgroup[MetadataModel.FgProperties.FIELD_VIEW_VALUES_IN_SEPARATE_COLUMNS_HEADER_FORMAT]
						}
						updatefieldgroup(fieldgroup)
					}}
					style="left: {propertyLeftWidth}px;"
				/>
			</div>
		</section>
	{:else if currentTab === Tab.QUERY_CONDITIONS}
		{#if fieldgroup[MetadataModel.FgProperties.GROUP_QUERY_ADD_FULL_TEXT_SEARCH_BOX]}
			<textarea
				class="textarea w-full {themecolor === Domain.Entities.Theme.Color.PRIMARY
					? 'textarea-primary'
					: themecolor === Domain.Entities.Theme.Color.SECONDARY
						? 'textarea-secondary'
						: 'textarea-accent'}"
				placeholder="Enter {MetadataModel.GetFieldGroupName(fieldgroup, 'fields/groups')} full text search query..."
				value={queryCondition[MetadataModel.QcProperties.D_FULL_TEXT_SEARCH_QUERY]}
				oninput={(e: Event & { currentTarget: EventTarget & HTMLTextAreaElement }) => {
					if (e.currentTarget.value.length > 0) {
						queryCondition[MetadataModel.QcProperties.D_FULL_TEXT_SEARCH_QUERY] = e.currentTarget.value
					} else {
						delete queryCondition[MetadataModel.QcProperties.D_FULL_TEXT_SEARCH_QUERY]
					}
					onhandleupdatefieldgroupquerycondition()
				}}
			></textarea>
		{/if}

		<main class="flex flex-[9.5] flex-col gap-y-1 overflow-auto">
			{#if Array.isArray(queryCondition[MetadataModel.QcProperties.FG_FILTER_CONDITION]) && queryCondition[MetadataModel.QcProperties.FG_FILTER_CONDITION].length > 0}
				{@const orFilterConditions = queryCondition[MetadataModel.QcProperties.FG_FILTER_CONDITION]}

				{#each orFilterConditions as orFilterCondition, orIndex}
					<section class="flex min-h-fit min-w-fit flex-col overflow-hidden rounded-md">
						<header
							class="flex justify-between p-1 {themecolor === Domain.Entities.Theme.Color.PRIMARY
								? 'bg-primary text-primary-content'
								: themecolor === Domain.Entities.Theme.Color.SECONDARY
									? 'bg-secondary text-secondary-content'
									: 'bg-accent text-accent-content'}"
						>
							<div class="self-center text-lg font-bold">'Or' Filter condition #{orIndex + 1}</div>
							<div class="flex gap-x-1">
								<button
									class="btn btn-ghost"
									onclick={() => {
										queryCondition[MetadataModel.QcProperties.FG_FILTER_CONDITION] = Json.DeleteValueInObject(
											queryCondition[MetadataModel.QcProperties.FG_FILTER_CONDITION],
											`$.${orIndex}`
										)
										queryCondition = JSON.parse(JSON.stringify(queryCondition))
									}}
								>
									<!--mdi:filter-remove source: https://icon-sets.iconify.design-->
									<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
										<path
											fill="var({Utils.Theme.GetColorContent(themecolor)})"
											d="M14.76 20.83L17.6 18l-2.84-2.83l1.41-1.41L19 16.57l2.83-2.81l1.41 1.41L20.43 18l2.81 2.83l-1.41 1.41L19 19.4l-2.83 2.84zM12 12v7.88c.04.3-.06.62-.29.83a.996.996 0 0 1-1.41 0L8.29 18.7a.99.99 0 0 1-.29-.83V12h-.03L2.21 4.62a1 1 0 0 1 .17-1.4c.19-.14.4-.22.62-.22h14c.22 0 .43.08.62.22a1 1 0 0 1 .17 1.4L12.03 12z"
										/>
									</svg>
								</button>

								{@render addAndFilterConditionButton(orIndex)}
							</div>
						</header>

						{#if Array.isArray(orFilterCondition) && orFilterCondition.length > 0}
							<div class="grid h-fit w-full" style="grid-template-columns: 1fr 9fr 1fr;">
								{#each orFilterCondition as andFilterCondition, andIndex}
									<aside
										class="flex h-full justify-center p-1 {themecolor === Domain.Entities.Theme.Color.PRIMARY
											? 'bg-primary text-primary-content'
											: themecolor === Domain.Entities.Theme.Color.SECONDARY
												? 'bg-secondary text-secondary-content'
												: 'bg-accent text-accent-content'}"
									>
										<div class="self-start text-2xl font-bold italic">{andIndex + 1}</div>
									</aside>

									<main class="flex flex-col">
										<select
											class="select w-full {themecolor === Domain.Entities.Theme.Color.PRIMARY
												? 'select-primary'
												: themecolor === Domain.Entities.Theme.Color.SECONDARY
													? 'select-secondary'
													: 'select-accent'}"
											onchange={(e: Event & { currentTarget: EventTarget & HTMLSelectElement }) => {
												let afc = andFilterCondition

												if (e.currentTarget.value === 'true') {
													afc[MetadataModel.FConditionProperties.NEGATE] = true
												} else if (e.currentTarget.value === 'false') {
													afc[MetadataModel.FConditionProperties.NEGATE] = false
												} else {
													afc = {}
												}
												updateAndFilterCondition(orIndex, andIndex, afc)
											}}
										>
											<option value="" selected={typeof andFilterCondition[MetadataModel.FConditionProperties.NEGATE] !== 'boolean'}>
												is?/is not?
											</option>
											<option value="false" selected={andFilterCondition[MetadataModel.FConditionProperties.NEGATE] === false}>is</option>
											<option value="true" selected={andFilterCondition[MetadataModel.FConditionProperties.NEGATE] === true}>is not</option>
										</select>

										{#if typeof andFilterCondition[MetadataModel.FConditionProperties.NEGATE] === 'boolean'}
											<select
												class="select w-full rounded-none {themecolor === Domain.Entities.Theme.Color.PRIMARY
													? 'select-primary'
													: themecolor === Domain.Entities.Theme.Color.SECONDARY
														? 'select-secondary'
														: 'select-accent'}"
												onchange={(e: Event & { currentTarget: EventTarget & HTMLSelectElement }) => {
													andFilterCondition[MetadataModel.FConditionProperties.CONDITION] = e.currentTarget.value as MetadataModel.FilterCondition
													if (typeof andFilterCondition[MetadataModel.FConditionProperties.VALUE] !== 'undefined') {
														delete andFilterCondition[MetadataModel.FConditionProperties.VALUE]
														if (andFilterCondition[MetadataModel.FConditionProperties.DATE_TIME_FORMAT]) {
															delete andFilterCondition[MetadataModel.FConditionProperties.DATE_TIME_FORMAT]
														}
													}
													updateAndFilterCondition(orIndex, andIndex, andFilterCondition)
												}}
											>
												<option value="" selected={typeof andFilterCondition[MetadataModel.FConditionProperties.CONDITION] !== 'string'} disabled>
													pick filter condition...
												</option>

												{#if MetadataModel.IsGroupFieldAField(fieldgroup)}
													<option
														value={MetadataModel.FilterCondition.EQUAL_TO}
														selected={andFilterCondition[MetadataModel.FConditionProperties.CONDITION] === MetadataModel.FilterCondition.EQUAL_TO}
													>
														{fieldGroupName} value equal to
													</option>
												{/if}

												{#if fieldDataType === MetadataModel.FieldType.TEXT}
													{@render textFilterCondition(orIndex, andIndex)}
												{:else if fieldDataType === MetadataModel.FieldType.NUMBER}
													{@render numberFilterCondition(orIndex, andIndex)}
												{:else if fieldDataType === MetadataModel.FieldType.TIMESTAMP}
													{@render timestampFilterCondition(orIndex, andIndex)}
												{/if}

												<option
													value={MetadataModel.FilterCondition.NO_OF_ENTRIES_GREATER_THAN}
													selected={andFilterCondition[MetadataModel.FConditionProperties.CONDITION] ===
														MetadataModel.FilterCondition.NO_OF_ENTRIES_GREATER_THAN}
												>
													No. of '{fieldGroupName}' greater than
												</option>
												<option
													value={MetadataModel.FilterCondition.NO_OF_ENTRIES_LESS_THAN}
													selected={andFilterCondition[MetadataModel.FConditionProperties.CONDITION] ===
														MetadataModel.FilterCondition.NO_OF_ENTRIES_LESS_THAN}
												>
													No. of '{fieldGroupName}' less than
												</option>
												<option
													value={MetadataModel.FilterCondition.NO_OF_ENTRIES_EQUAL_TO}
													selected={andFilterCondition[MetadataModel.FConditionProperties.CONDITION] ===
														MetadataModel.FilterCondition.NO_OF_ENTRIES_EQUAL_TO}
												>
													No. of '{fieldGroupName}' equal to
												</option>

												<option value="" disabled> ...other field options below... </option>

												{#if fieldDataType !== MetadataModel.FieldType.TEXT}
													{@render textFilterCondition(orIndex, andIndex)}
												{/if}
												{#if fieldDataType !== MetadataModel.FieldType.NUMBER}
													{@render numberFilterCondition(orIndex, andIndex)}
												{/if}
												{#if fieldDataType !== MetadataModel.FieldType.TIMESTAMP}
													{@render timestampFilterCondition(orIndex, andIndex)}
												{/if}

												{#if !MetadataModel.IsGroupFieldAField(fieldgroup)}
													<option
														value={MetadataModel.FilterCondition.EQUAL_TO}
														selected={andFilterCondition[MetadataModel.FConditionProperties.CONDITION] === MetadataModel.FilterCondition.EQUAL_TO}
													>
														{fieldGroupName} value equal to
													</option>
												{/if}
											</select>

											{#if typeof andFilterCondition[MetadataModel.FConditionProperties.CONDITION] === 'string'}
												{@const filterCondition = andFilterCondition[MetadataModel.FConditionProperties.CONDITION]}
												{@const filterValue = andFilterCondition[MetadataModel.FConditionProperties.VALUE]}

												{#if filterCondition === MetadataModel.FilterCondition.TEXT_BEGINS_WITH || filterCondition === MetadataModel.FilterCondition.TEXT_CONTAINS || filterCondition === MetadataModel.FilterCondition.TEXT_ENDS_WITH}
													<textarea
														class="textarea w-full {themecolor === Domain.Entities.Theme.Color.PRIMARY
															? 'textarea-primary'
															: themecolor === Domain.Entities.Theme.Color.SECONDARY
																? 'textarea-secondary'
																: 'textarea-accent'}"
														placeholder="Enter text value..."
														value={filterValue}
														oninput={(e: Event & { currentTarget: EventTarget & HTMLTextAreaElement }) => {
															if (e.currentTarget.value.length > 0) {
																andFilterCondition[MetadataModel.FConditionProperties.VALUE] = e.currentTarget.value
															} else {
																delete andFilterCondition[MetadataModel.FConditionProperties.VALUE]
															}
															updateAndFilterCondition(orIndex, andIndex, andFilterCondition)
														}}
													></textarea>
												{:else if filterCondition === MetadataModel.FilterCondition.NO_OF_ENTRIES_EQUAL_TO || filterCondition === MetadataModel.FilterCondition.NO_OF_ENTRIES_GREATER_THAN || filterCondition === MetadataModel.FilterCondition.NO_OF_ENTRIES_LESS_THAN || filterCondition === MetadataModel.FilterCondition.NUMBER_GREATER_THAN || filterCondition === MetadataModel.FilterCondition.NUMBER_LESS_THAN}
													<input
														class="input w-full {themecolor === Domain.Entities.Theme.Color.PRIMARY
															? 'input-primary'
															: themecolor === Domain.Entities.Theme.Color.SECONDARY
																? 'input-secondary'
																: 'input-accent'}"
														placeholder="Enter numeric value..."
														type="number"
														value={filterValue}
														oninput={(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
															if (e.currentTarget.value.length > 0) {
																if (!Number.isNaN(e.currentTarget.value)) {
																	andFilterCondition[MetadataModel.FConditionProperties.VALUE] = Number(e.currentTarget.value)
																} else {
																	delete andFilterCondition[MetadataModel.FConditionProperties.VALUE]
																}
															} else {
																delete andFilterCondition[MetadataModel.FConditionProperties.VALUE]
															}

															updateAndFilterCondition(orIndex, andIndex, andFilterCondition)
														}}
													/>
												{:else if filterCondition === MetadataModel.FilterCondition.TIMESTAMP_GREATER_THAN || filterCondition === MetadataModel.FilterCondition.TIMESTAMP_LESS_THAN}
													<select
														class="select w-full rounded-none {themecolor === Domain.Entities.Theme.Color.PRIMARY
															? 'select-primary'
															: themecolor === Domain.Entities.Theme.Color.SECONDARY
																? 'select-secondary'
																: 'select-accent'}"
														onchange={(e: Event & { currentTarget: EventTarget & HTMLSelectElement }) => {
															andFilterCondition[MetadataModel.FConditionProperties.DATE_TIME_FORMAT] = e.currentTarget
																.value as MetadataModel.FieldDateTimeFormat
															updateAndFilterCondition(orIndex, andIndex, andFilterCondition)
														}}
													>
														<option
															disabled
															value=""
															selected={typeof andFilterCondition[MetadataModel.FConditionProperties.DATE_TIME_FORMAT] === 'string' &&
																(andFilterCondition[MetadataModel.FConditionProperties.DATE_TIME_FORMAT] as string).length === 0}
														>
															Choose date time format...
														</option>
														{#each MetadataModel.FieldDateTimeFormats as fdtf}
															<option selected={filterValue === fdtf} value={fdtf}>{fdtf}</option>
														{/each}
													</select>

													{#await import('$lib/components/DateTime/Component.svelte') then { default: DateTime }}
														<DateTime
															{theme}
															{themecolor}
															datetimeinputformat={andFilterCondition[MetadataModel.FConditionProperties.DATE_TIME_FORMAT]}
															value={filterValue}
															updatedatetime={(value: string | undefined) => {
																if (typeof value === 'string') {
																	andFilterCondition[MetadataModel.FConditionProperties.VALUE] = value
																} else {
																	delete andFilterCondition[MetadataModel.FConditionProperties.VALUE]
																}

																updateAndFilterCondition(orIndex, andIndex, andFilterCondition)
															}}
														></DateTime>
													{/await}
												{:else if filterCondition === MetadataModel.FilterCondition.EQUAL_TO}
													{@const andFilterConditionValue = getOrInitFilterValue(orIndex, andIndex)}

													{@const andFilterConditionValueType = andFilterConditionValue[MetadataModel.FSelectProperties.TYPE]}

													{@const andFilterConditionValueValue = andFilterConditionValue[MetadataModel.FSelectProperties.VALUE]}

													<select
														class="select {themecolor === Domain.Entities.Theme.Color.PRIMARY
															? 'select-primary'
															: themecolor === Domain.Entities.Theme.Color.SECONDARY
																? 'select-secondary'
																: 'select-accent'} w-full"
														onchange={(e: Event & { currentTarget: EventTarget & HTMLSelectElement }) => {
															andFilterCondition[MetadataModel.FConditionProperties.VALUE][MetadataModel.FSelectProperties.TYPE] =
																e.currentTarget.value
															if (typeof andFilterConditionValueValue !== 'undefined') {
																delete andFilterCondition[MetadataModel.FConditionProperties.VALUE][MetadataModel.FSelectProperties.VALUE]
															}
															updateAndFilterCondition(orIndex, andIndex, andFilterCondition)
														}}
													>
														<option selected={typeof andFilterConditionValueType !== 'string'} value="" disabled> pick filter value type... </option>

														{#each MetadataModel.FieldTypes as ft}
															<option selected={andFilterConditionValueType === ft} value={ft}>{ft}</option>
														{/each}

														<option
															selected={andFilterConditionValueType === MetadataModel.FSelectType.SELECT}
															value={MetadataModel.FSelectType.SELECT}
														>
															{MetadataModel.FSelectType.SELECT}
														</option>
													</select>

													{#if andFilterConditionValueType === MetadataModel.FSelectType.SELECT}
														{#await import('$lib/components/MultiSelect/Component.svelte') then { default: MultiSelect }}
															<MultiSelect
																{theme}
																{themecolor}
																placeholder={fieldgroup[MetadataModel.FgProperties.FIELD_PLACEHOLDER] || `Select ${fieldGroupName}...`}
																selectoptions={(fieldgroup[MetadataModel.FgProperties.FIELD_SELECT_OPTIONS] as MetadataModel.ISelectOption[]).map(
																	(fss) => {
																		return {
																			label: fss[MetadataModel.FSelectProperties.LABEL] as string,
																			value: fss[MetadataModel.FSelectProperties.VALUE]
																		}
																	}
																)}
																selectedoptions={(() => {
																	const selectOptions = (
																		fieldgroup[MetadataModel.FgProperties.FIELD_SELECT_OPTIONS] as MetadataModel.ISelectOption[]
																	).map((fss) => {
																		return {
																			label: fss[MetadataModel.FSelectProperties.LABEL] as string,
																			value: fss[MetadataModel.FSelectProperties.VALUE]
																		}
																	})
																	let selectedOptions: any[] = []
																	for (const so of selectOptions) {
																		if (
																			(Array.isArray(andFilterConditionValueValue) && andFilterConditionValueValue.includes(so.value)) ||
																			so.value === andFilterConditionValueValue
																		) {
																			selectedOptions = [...selectedOptions, so]
																		}
																	}

																	return selectedOptions.length > 0 ? selectedOptions : undefined
																})()}
																multiselect={false}
																updateselectedoptions={(value: SelectOption[] | SelectOption | undefined) => {
																	if (typeof value === 'object' && value !== null) {
																		andFilterCondition[MetadataModel.FConditionProperties.VALUE][MetadataModel.FSelectProperties.VALUE] = (
																			value as { label: string; value: any }
																		).value
																	} else {
																		delete andFilterCondition[MetadataModel.FConditionProperties.VALUE][MetadataModel.FSelectProperties.VALUE]
																	}
																	updateAndFilterCondition(orIndex, andIndex, andFilterCondition)
																}}
																contentperpage={5}
															></MultiSelect>
														{/await}
													{:else if andFilterConditionValueType === MetadataModel.FieldType.TEXT}
														<textarea
															class="textarea w-full {themecolor === Domain.Entities.Theme.Color.PRIMARY
																? 'textarea-primary'
																: themecolor === Domain.Entities.Theme.Color.SECONDARY
																	? 'textarea-secondary'
																	: 'textarea-accent'}"
															placeholder="Enter text value..."
															value={andFilterConditionValueValue}
															oninput={(e: Event & { currentTarget: EventTarget & HTMLTextAreaElement }) => {
																if (e.currentTarget.value.length > 0) {
																	andFilterCondition[MetadataModel.FConditionProperties.VALUE][MetadataModel.FSelectProperties.VALUE] =
																		e.currentTarget.value
																} else {
																	delete andFilterCondition[MetadataModel.FConditionProperties.VALUE][MetadataModel.FSelectProperties.VALUE]
																}
																updateAndFilterCondition(orIndex, andIndex, andFilterCondition)
															}}
														></textarea>
													{:else if andFilterConditionValueType === MetadataModel.FieldType.NUMBER}
														<input
															class="input w-full rounded-none {themecolor === Domain.Entities.Theme.Color.PRIMARY
																? 'input-primary'
																: themecolor === Domain.Entities.Theme.Color.SECONDARY
																	? 'input-secondary'
																	: 'input-accent'}"
															placeholder="Enter numeric value..."
															type="number"
															value={andFilterConditionValueValue}
															oninput={(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
																if (e.currentTarget.value.length > 0) {
																	if (!Number.isNaN(e.currentTarget.value)) {
																		andFilterCondition[MetadataModel.FConditionProperties.VALUE][MetadataModel.FSelectProperties.VALUE] = Number(
																			e.currentTarget.value
																		)
																	} else {
																		delete andFilterCondition[MetadataModel.FConditionProperties.VALUE][MetadataModel.FSelectProperties.VALUE]
																	}
																} else {
																	delete andFilterCondition[MetadataModel.FConditionProperties.VALUE][MetadataModel.FSelectProperties.VALUE]
																}
															}}
														/>
													{:else if andFilterConditionValueType === MetadataModel.FieldType.BOOLEAN}
														{@const boolSelectOptions = getBooleanSelectOptions()}

														<select
															class="select {themecolor === Domain.Entities.Theme.Color.PRIMARY
																? 'select-primary'
																: themecolor === Domain.Entities.Theme.Color.SECONDARY
																	? 'select-secondary'
																	: 'select-accent'} w-full"
															onchange={(e: Event & { currentTarget: EventTarget & HTMLSelectElement }) => {
																andFilterCondition[MetadataModel.FConditionProperties.VALUE][MetadataModel.FSelectProperties.VALUE] = JSON.parse(
																	e.currentTarget.value
																)
																updateAndFilterCondition(orIndex, andIndex, andFilterCondition)
															}}
														>
															<option selected={typeof andFilterConditionValueValue === 'undefined'} value="" disabled>
																pick boolean value type...
															</option>

															{#each boolSelectOptions as bs}
																<option selected={andFilterConditionValueValue === bs.value} value={bs.value}>{bs.label}</option>
															{/each}
														</select>
													{:else if andFilterConditionValueType === MetadataModel.FieldType.TIMESTAMP}
														{@const dateTimeFormat = andFilterConditionValue[MetadataModel.FConditionProperties.DATE_TIME_FORMAT]}

														<select
															class="select w-full rounded-none {themecolor === Domain.Entities.Theme.Color.PRIMARY
																? 'select-primary'
																: themecolor === Domain.Entities.Theme.Color.SECONDARY
																	? 'select-secondary'
																	: 'select-accent'}"
															onchange={(e: Event & { currentTarget: EventTarget & HTMLSelectElement }) => {
																andFilterCondition[MetadataModel.FConditionProperties.VALUE][MetadataModel.FConditionProperties.DATE_TIME_FORMAT] = e
																	.currentTarget.value as MetadataModel.FieldDateTimeFormat
																updateAndFilterCondition(orIndex, andIndex, andFilterCondition)
															}}
														>
															<option disabled value="" selected={typeof dateTimeFormat !== 'string' || (dateTimeFormat as string).length === 0}>
																Choose date time format...
															</option>
															{#each MetadataModel.FieldDateTimeFormats as fdtf}
																<option selected={dateTimeFormat === fdtf} value={fdtf}>{fdtf}</option>
															{/each}
														</select>

														{#if dateTimeFormat}
															{#await import('$lib/components/DateTime/Component.svelte') then { default: DateTime }}
																<DateTime
																	{theme}
																	{themecolor}
																	datetimeinputformat={dateTimeFormat}
																	value={andFilterConditionValueValue}
																	updatedatetime={(value: string | undefined) => {
																		if (typeof value === 'string') {
																			andFilterCondition[MetadataModel.FConditionProperties.VALUE][MetadataModel.FSelectProperties.VALUE] = value
																		} else {
																			delete andFilterCondition[MetadataModel.FConditionProperties.VALUE][MetadataModel.FSelectProperties.VALUE]
																		}

																		updateAndFilterCondition(orIndex, andIndex, andFilterCondition)
																	}}
																></DateTime>
															{/await}
														{/if}
													{/if}
												{/if}
											{/if}
										{/if}
									</main>

									<aside
										class="flex h-full justify-center p-1 {themecolor === Domain.Entities.Theme.Color.PRIMARY
											? 'bg-primary text-primary-content'
											: themecolor === Domain.Entities.Theme.Color.SECONDARY
												? 'bg-secondary text-secondary-content'
												: 'bg-accent text-accent-content'}"
									>
										<button
											class="btn btn-ghost h-fit min-h-fit w-fit min-w-fit self-start p-1"
											onclick={() => {
												queryCondition[MetadataModel.QcProperties.FG_FILTER_CONDITION] = Json.DeleteValueInObject(
													queryCondition[MetadataModel.QcProperties.FG_FILTER_CONDITION],
													`$.${orIndex}.${andIndex}`
												)
												queryCondition = JSON.parse(JSON.stringify(queryCondition))

												onhandleupdatefieldgroupquerycondition()
											}}
										>
											<!--mdi:delete source: https://icon-sets.iconify.design-->
											<svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" viewBox="0 0 24 24">
												<path
													fill="var({Utils.Theme.GetColorContent(themecolor)})"
													d="M19 4h-3.5l-1-1h-5l-1 1H5v2h14M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6z"
												/>
											</svg>
										</button>
									</aside>

									{#if andIndex !== orFilterCondition.length - 1}
										<div
											class="h-full w-full {themecolor === Domain.Entities.Theme.Color.PRIMARY
												? 'bg-primary text-primary-content'
												: themecolor === Domain.Entities.Theme.Color.SECONDARY
													? 'bg-secondary text-secondary-content'
													: 'bg-accent text-accent-content'}"
										></div>
										<div
											class="divider mt-0 mb-0 {themecolor === Domain.Entities.Theme.Color.PRIMARY
												? 'divider-primary'
												: themecolor === Domain.Entities.Theme.Color.SECONDARY
													? 'divider-secondary'
													: 'divider-accent'}"
										>
											or
										</div>
										<div
											class="h-full w-full {themecolor === Domain.Entities.Theme.Color.PRIMARY
												? 'bg-primary text-primary-content'
												: themecolor === Domain.Entities.Theme.Color.SECONDARY
													? 'bg-secondary text-secondary-content'
													: 'bg-accent text-accent-content'}"
										></div>
									{/if}
								{/each}
							</div>
						{:else}
							<div class="flex h-fit w-full justify-center gap-x-1 rounded-b-md p-1 text-center shadow-inner shadow-gray-800">
								<div class="h-fit self-center">Click</div>
								<div
									class="min-h-fit min-w-fit {themecolor === Domain.Entities.Theme.Color.PRIMARY
										? 'bg-primary text-primary-content'
										: themecolor === Domain.Entities.Theme.Color.SECONDARY
											? 'bg-secondary text-secondary-content'
											: 'bg-accent text-accent-content'}"
								>
									{@render addAndFilterConditionButton(orIndex)}
								</div>
								<div class="h-fit self-center">to add a new 'and' filter condtion</div>
							</div>
						{/if}
					</section>

					{#if orIndex !== orFilterConditions.length - 1}
						<div
							class="divider mt-0 mb-0 {themecolor === Domain.Entities.Theme.Color.PRIMARY
								? 'divider-primary'
								: themecolor === Domain.Entities.Theme.Color.SECONDARY
									? 'divider-secondary'
									: 'divider-accent'}"
						>
							and
						</div>
					{/if}
				{/each}
			{:else}
				<div class="flex justify-center gap-x-1 self-center p-1">
					<div class="h-fit self-center">Click</div>
					{@render addOrFilterConditionButton()}
					<div class="h-fit self-center">to add a new 'or' filter condtion</div>
				</div>
			{/if}
		</main>

		<footer class="join shadow-sm shadow-gray-800">
			<button
				class="join-item btn flex-1 break-words {themecolor === Domain.Entities.Theme.Color.PRIMARY
					? 'btn-primary'
					: themecolor === Domain.Entities.Theme.Color.SECONDARY
						? 'btn-secondary'
						: 'btn-accent'}"
				onclick={() => {
					if (
						Array.isArray(queryCondition[MetadataModel.QcProperties.FG_FILTER_CONDITION]) &&
						queryCondition[MetadataModel.QcProperties.FG_FILTER_CONDITION].length > 0
					) {
						delete queryCondition[MetadataModel.QcProperties.FG_FILTER_CONDITION]
						queryCondition = JSON.parse(JSON.stringify(queryCondition))
						onhandleupdatefieldgroupquerycondition()
					}
				}}
			>
				reset filter conditions
			</button>

			<button
				class="join-item btn flex-1 break-words {themecolor === Domain.Entities.Theme.Color.PRIMARY
					? 'btn-primary'
					: themecolor === Domain.Entities.Theme.Color.SECONDARY
						? 'btn-secondary'
						: 'btn-accent'}"
				onclick={() => {
					if (Object.keys(queryCondition).length > 0) {
						let filterConditions: any[] = []
						if (
							Array.isArray(queryCondition[MetadataModel.QcProperties.FG_FILTER_CONDITION]) &&
							queryCondition[MetadataModel.QcProperties.FG_FILTER_CONDITION].length > 0
						) {
							filterConditions = JSON.parse(JSON.stringify(queryCondition[MetadataModel.QcProperties.FG_FILTER_CONDITION]))
						}
						queryCondition = {}
						if (filterConditions.length > 0) {
							queryCondition[MetadataModel.QcProperties.FG_FILTER_CONDITION] = filterConditions
						}
						queryCondition = JSON.parse(JSON.stringify(queryCondition))
						onhandleupdatefieldgroupquerycondition()
					}
				}}
			>
				reset query properties
			</button>

			{@render addOrFilterConditionButton()}
		</footer>
	{/if}
</div>

{#snippet numberFilterCondition(orIndex: number, andIndex: number)}
	{@const filterCondition = getFilterCondition(orIndex, andIndex)}

	<option value={MetadataModel.FilterCondition.NUMBER_GREATER_THAN} selected={filterCondition === MetadataModel.FilterCondition.NUMBER_GREATER_THAN}>
		{fieldGroupName} (number) greater than
	</option>
	<option value={MetadataModel.FilterCondition.NUMBER_LESS_THAN} selected={filterCondition === MetadataModel.FilterCondition.NUMBER_LESS_THAN}>
		{fieldGroupName} (number) less than
	</option>
{/snippet}

{#snippet timestampFilterCondition(orIndex: number, andIndex: number)}
	{@const filterCondition = getFilterCondition(orIndex, andIndex)}

	<option
		value={MetadataModel.FilterCondition.TIMESTAMP_GREATER_THAN}
		selected={filterCondition === MetadataModel.FilterCondition.TIMESTAMP_GREATER_THAN}
	>
		{fieldGroupName} (timestamp) greater than
	</option>
	<option value={MetadataModel.FilterCondition.TIMESTAMP_LESS_THAN} selected={filterCondition === MetadataModel.FilterCondition.TIMESTAMP_LESS_THAN}>
		{fieldGroupName} (timestamp) less than
	</option>
{/snippet}

{#snippet textFilterCondition(orIndex: number, andIndex: number)}
	{@const filterCondition = getFilterCondition(orIndex, andIndex)}

	<option value={MetadataModel.FilterCondition.TEXT_BEGINS_WITH} selected={filterCondition === MetadataModel.FilterCondition.TEXT_BEGINS_WITH}>
		{fieldGroupName} (text) begins with
	</option>
	<option value={MetadataModel.FilterCondition.TEXT_CONTAINS} selected={filterCondition === MetadataModel.FilterCondition.TEXT_CONTAINS}>
		{fieldGroupName} (text) contains
	</option>
	<option value={MetadataModel.FilterCondition.TEXT_ENDS_WITH} selected={filterCondition === MetadataModel.FilterCondition.TEXT_ENDS_WITH}>
		{fieldGroupName} (text) ends with
	</option>
{/snippet}

{#snippet addAndFilterConditionButton(orIndex: number)}
	<button
		class="btn btn-ghost"
		onclick={() => {
			if (!Array.isArray(queryCondition[MetadataModel.QcProperties.FG_FILTER_CONDITION])) {
				queryCondition[MetadataModel.QcProperties.FG_FILTER_CONDITION] = []
			}

			if (!Array.isArray(queryCondition[MetadataModel.QcProperties.FG_FILTER_CONDITION][orIndex])) {
				queryCondition[MetadataModel.QcProperties.FG_FILTER_CONDITION][orIndex] = []
			}

			queryCondition[MetadataModel.QcProperties.FG_FILTER_CONDITION][orIndex] = [
				...queryCondition[MetadataModel.QcProperties.FG_FILTER_CONDITION][orIndex],
				{}
			]
			queryCondition = JSON.parse(JSON.stringify(queryCondition))
		}}
	>
		<!--mdi:filter-plus source: https://icon-sets.iconify.design-->
		<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
			<path
				fill="var({Utils.Theme.GetColorContent(themecolor)})"
				d="M12 12v7.88c.04.3-.06.62-.29.83a.996.996 0 0 1-1.41 0L8.29 18.7a.99.99 0 0 1-.29-.83V12h-.03L2.21 4.62a1 1 0 0 1 .17-1.4c.19-.14.4-.22.62-.22h14c.22 0 .43.08.62.22a1 1 0 0 1 .17 1.4L12.03 12zm3 5h3v-3h2v3h3v2h-3v3h-2v-3h-3z"
			/>
		</svg>
	</button>
{/snippet}

{#snippet addOrFilterConditionButton()}
	<button
		class="join-item btn flex-1 break-words {themecolor === Domain.Entities.Theme.Color.PRIMARY
			? 'btn-primary'
			: themecolor === Domain.Entities.Theme.Color.SECONDARY
				? 'btn-secondary'
				: 'btn-accent'}"
		onclick={() => {
			if (!Array.isArray(queryCondition[MetadataModel.QcProperties.FG_FILTER_CONDITION])) {
				queryCondition[MetadataModel.QcProperties.FG_FILTER_CONDITION] = []
			}
			queryCondition[MetadataModel.QcProperties.FG_FILTER_CONDITION] = [...queryCondition[MetadataModel.QcProperties.FG_FILTER_CONDITION], [{}]]
			queryCondition = JSON.parse(JSON.stringify(queryCondition))
		}}
	>
		add new 'or' filter condition
	</button>
{/snippet}

{#snippet propertyKey(propertyName: string, hint?: string)}
	<div class="sticky top-0 left-0 z-[2] h-full w-full {theme === Domain.Entities.Theme.Theme.DARK ? 'bg-gray-600' : 'bg-gray-300'}">
		<div class="flex justify-between self-center italic">
			<span class="text-wrap break-words">{propertyName}</span>

			{#if hint}
				<span
					class="h-fit self-start {hint
						? `tooltip tooltip-top ${themecolor === Domain.Entities.Theme.Color.PRIMARY ? 'tooltip-primary' : themecolor === Domain.Entities.Theme.Color.SECONDARY ? 'tooltip-secondary' : 'tooltip-accent'}`
						: ''}"
					data-tip={hint && hint}
				>
					<!--mdi:question-mark-circle source: https://icon-sets.iconify.design-->
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
						<path
							fill="var({Utils.Theme.GetColor(themecolor)})"
							d="m15.07 11.25l-.9.92C13.45 12.89 13 13.5 13 15h-2v-.5c0-1.11.45-2.11 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41a2 2 0 0 0-2-2a2 2 0 0 0-2 2H8a4 4 0 0 1 4-4a4 4 0 0 1 4 4a3.2 3.2 0 0 1-.93 2.25M13 19h-2v-2h2M12 2A10 10 0 0 0 2 12a10 10 0 0 0 10 10a10 10 0 0 0 10-10c0-5.53-4.5-10-10-10"
						/>
					</svg></span
				>
			{/if}
		</div>
	</div>
{/snippet}
