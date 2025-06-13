<!--
@component

Props:
-

-->
<script lang="ts">
	import { Domain, Json, MetadataModel, Utils } from '$lib'
	import { untrack } from 'svelte'
	import { View } from './util'

	const COMPONENT_NAME = 'metadata-model-query'

	interface Props {
		metadatamodel?: any
		themecolor?: Domain.Entities.Theme.Color
		telemetry?: Domain.Interfaces.ITelemetry
		theme?: Domain.Entities.Theme.Theme
		queryconditions?: MetadataModel.QueryConditions[]
		contentperpage?: number
		updatemetadatamodel?: (value: any) => void
		deletequerycondition?: (index: number, fieldGroupKey?: string) => void
		updatequeryconditions?: (value: MetadataModel.QueryConditions[]) => void
	}

	let {
		metadatamodel = {},
		themecolor = Domain.Entities.Theme.Color.PRIMARY,
		telemetry = undefined,
		theme = Domain.Entities.Theme.Theme.LIGHT,
		queryconditions = [{}],
		updatemetadatamodel = undefined,
		deletequerycondition = undefined,
		updatequeryconditions = undefined,
		contentperpage = 5
	}: Props = $props()

	let viewQueryConditions: MetadataModel.QueryConditions[] = $derived(JSON.parse(JSON.stringify(queryconditions)))

	let viewMetadataModel: any = $derived(JSON.parse(JSON.stringify(metadatamodel)))

	function onupdatefieldgroup(fieldGroup: any) {
		let fieldGroupPath = fieldGroup[MetadataModel.FgProperties.FIELD_GROUP_KEY]
		if (typeof fieldGroupPath !== 'string') {
			return
		}
		fieldGroupPath = (fieldGroupPath as string).replace(new RegExp(MetadataModel.ARRAY_INDEX_PLACEHOLDER_REGEX_SEARCH, 'g'), '[0]')

		viewMetadataModel = JSON.parse(JSON.stringify(Json.SetValueInObject(viewMetadataModel, fieldGroupPath, fieldGroup)))

		if (updatemetadatamodel) {
			updatemetadatamodel(viewMetadataModel)
		}
	}

	function getQueryConditionFgKey(fieldGroupKey: string) {
		return fieldGroupKey
			.replace(MetadataModel.GROUP_FIELDS_PATH_REGEX_SEARCH, '')
			.replace(new RegExp(MetadataModel.GROUP_FIELDS_REGEX_SEARCH, 'g'), '')
	}

	function ondeletequerycondition(index: number, fieldGroupKey?: string) {
		if (typeof viewQueryConditions[index] === 'object') {
			if (typeof fieldGroupKey === 'string' && fieldGroupKey.length > 0) {
				fieldGroupKey = getQueryConditionFgKey(fieldGroupKey)
				if (typeof viewQueryConditions[index][fieldGroupKey] === 'undefined') {
					return
				}
				delete viewQueryConditions[index][fieldGroupKey]
			} else {
				viewQueryConditions = Json.DeleteValueInObject(JSON.parse(JSON.stringify(viewQueryConditions)), `$.${index}`)
			}

			if (deletequerycondition) {
				deletequerycondition(index, fieldGroupKey)
			}
			onupdatequeryconditions()
		}
	}

	function onupdatequeryconditions() {
		if (updatequeryconditions) {
			updatequeryconditions(JSON.parse(JSON.stringify(viewQueryConditions)))
		}
	}

	let queryConditionCurrentTabIndex: number = $state(0)
	$effect(() => {
		if (queryConditionCurrentTabIndex > viewQueryConditions.length - 1) {
			untrack(() => (queryConditionCurrentTabIndex = viewQueryConditions.length - 1))
		}
	})

	$effect(() => {
		if (viewQueryConditions.length === 0) {
			untrack(() => {
				viewQueryConditions = [{}]
				queryConditionCurrentTabIndex = 0
			})
		}
	})

	let selectedFieldGroupKey = $state('')

	let showSectionID: string = $state('')

	let view: View = $state(View.CURRENT_Q_CONDITION)

	let expandAside: boolean = $state(false)

	let pinTabs: boolean = $state(false)

	function getQueryCondition(queryconditionindex: number, fieldGroupKey?: string) {
		if (typeof viewQueryConditions[queryconditionindex] === 'object') {
			if (typeof fieldGroupKey === 'string' && fieldGroupKey.length > 0) {
				fieldGroupKey = getQueryConditionFgKey(fieldGroupKey)
				if (typeof viewQueryConditions[queryconditionindex][fieldGroupKey] === 'undefined') {
					return {}
				}
				return JSON.parse(JSON.stringify(viewQueryConditions[queryconditionindex][fieldGroupKey]))
			}

			return JSON.parse(JSON.stringify(viewQueryConditions[queryconditionindex]))
		}

		return {}
	}

	function isQueryConditionEmpty(querycondition: any) {
		if (Object.keys(querycondition).length === 0) {
			return true
		}

		if (Object.keys(querycondition).length === 2) {
			let keysNotDTableCollectionOnly = false
			for (const key of Object.keys(querycondition)) {
				if (
					key !== MetadataModel.QcProperties.D_FIELD_COLUMN_NAME &&
					key !== MetadataModel.QcProperties.D_TABLE_COLLECTION_NAME &&
					key !== MetadataModel.QcProperties.D_TABLE_COLLECTION_UID
				) {
					keysNotDTableCollectionOnly = true
					break
				}
			}

			if (!keysNotDTableCollectionOnly) {
				return true
			}
		}

		return false
	}

	function addDatabasePropsToQueryCondition(fgKey: string, querycondition: any) {
		const fieldGroup = Json.GetValueInObject(
			viewMetadataModel,
			fgKey.replace(new RegExp(MetadataModel.ARRAY_INDEX_PLACEHOLDER_REGEX_SEARCH, 'g'), '[0]')
		)
		if (MetadataModel.IsGroupFieldsValid(fieldGroup)) {
			if (typeof fieldGroup[MetadataModel.FgProperties.DATABASE_FIELD_COLUMN_NAME] === 'string') {
				querycondition[MetadataModel.QcProperties.D_FIELD_COLUMN_NAME] = fieldGroup[MetadataModel.FgProperties.DATABASE_FIELD_COLUMN_NAME]
			}
			if (typeof fieldGroup[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_NAME] === 'string') {
				querycondition[MetadataModel.QcProperties.D_TABLE_COLLECTION_NAME] = fieldGroup[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_NAME]
			}
			if (typeof fieldGroup[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_UID] === 'string') {
				querycondition[MetadataModel.QcProperties.D_TABLE_COLLECTION_UID] = fieldGroup[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_UID]
			}
		}
	}

	function updateFieldGroupQueryCondition(queryconditionindex: number, fieldgroupkey: string, querycondition: MetadataModel.IQueryCondition) {
		if (isQueryConditionEmpty(querycondition)) {
			ondeletequerycondition(queryconditionindex, selectedFieldGroupKey)
		} else {
			addDatabasePropsToQueryCondition(fieldgroupkey, querycondition)
			fieldgroupkey = getQueryConditionFgKey(fieldgroupkey)
			if (typeof viewQueryConditions[queryconditionindex] === 'undefined') {
				viewQueryConditions[queryconditionindex] = {}
			}
			viewQueryConditions[queryconditionindex][fieldgroupkey] = JSON.parse(JSON.stringify(querycondition))
			onupdatequeryconditions()
		}
	}
</script>

<div
	class="grid flex-1 gap-2 overflow-hidden p-2 {theme === Domain.Entities.Theme.Theme.DARK
		? 'border-gray-900 bg-gray-700'
		: 'border-gray-400 bg-gray-200'}"
	style="grid-template-columns: auto 1fr; grid-template-rows: auto 1fr;"
>
	<section class="flex w-fit justify-center">
		<button
			class="btn btn-ghost btn-sm tooltip tooltip-right self-start {themecolor === Domain.Entities.Theme.Color.PRIMARY
				? 'tooltip-primary'
				: themecolor === Domain.Entities.Theme.Color.SECONDARY
					? 'tooltip-secondary'
					: 'tooltip-accent'}"
			aria-label="Remove All Query Conditions"
			data-tip="Remove All Query Conditions"
			onclick={() => {
				viewQueryConditions = []
			}}
			><!--mdi:tab-remove source: https://icon-sets.iconify.design-->
			<svg xmlns="http://www.w3.org/2000/svg" width="32" height="30" viewBox="0 0 24 24">
				<path
					fill={theme === Domain.Entities.Theme.Theme.DARK ? 'white' : 'black'}
					d="m7.46 11.88l1.42-1.42L11 12.59l2.12-2.13l1.42 1.42L12.41 14l2.13 2.12l-1.42 1.42L11 15.41l-2.12 2.13l-1.42-1.42L9.59 14zM3 3h18a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2m0 2v14h18V9h-8V5z"
				/>
			</svg>
		</button>
	</section>

	<header class="flex justify-center">
		<div class="flex h-fit w-fit flex-col gap-y-2">
			<button
				class="btn btn-sm self-center"
				aria-label="Show section {queryConditionCurrentTabIndex} menu"
				onclick={() => (showSectionID = showSectionID === 'show-query-condition-menu' ? '' : 'show-query-condition-menu')}
			>
				Query Condition {queryConditionCurrentTabIndex + 1}
			</button>

			{#if showSectionID === 'show-query-condition-menu'}
				<div
					class="rounded-md shadow-inner shadow-gray-800 {theme === Domain.Entities.Theme.Theme.DARK
						? 'bg-gray-600'
						: 'bg-gray-300'} flex w-fit flex-col gap-y-2 p-1"
				>
					<button
						class="btn btn-sm btn-ghost"
						aria-label="View Current Query Condition as Json"
						onclick={() => (view = View.CURRENT_Q_CONDITION_AS_JSON)}
					>
						view current query condition as json
					</button>

					<button class="btn btn-sm btn-ghost" aria-label="View All Query Conditions as Json" onclick={() => (view = View.ALL_Q_CONDITIONS_AS_JSON)}>
						view all query conditions as json
					</button>
				</div>
			{/if}
		</div>
	</header>

	<aside
		class="flex h-full w-fit flex-col overflow-hidden rounded-lg p-1 shadow-inner shadow-gray-800 {theme === Domain.Entities.Theme.Theme.DARK
			? 'bg-gray-600'
			: 'bg-gray-300'}"
		onmouseenter={() => (expandAside = true)}
		onmouseleave={() => (expandAside = false)}
	>
		<header class="flex">
			<button class="btn btn-sm btn-ghost w-full" aria-label="Pin/Unpin Tabs" onclick={() => (pinTabs = !pinTabs)}>
				<div class="flex w-full gap-x-2">
					{#if pinTabs}
						<!--mdi:pin source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
							<path fill={theme === Domain.Entities.Theme.Theme.DARK ? 'white' : 'black'} d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2z" />
						</svg>
					{:else}
						<!--mdi:pin-off source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
							<path
								fill={theme === Domain.Entities.Theme.Theme.DARK ? 'white' : 'black'}
								d="M2 5.27L3.28 4L20 20.72L18.73 22l-5.93-5.93V22h-1.6v-6H6v-2l2-2v-.73zM16 12l2 2v2h-.18L8 6.18V4H7V2h10v2h-1z"
							/>
						</svg>
					{/if}

					{#if expandAside || pinTabs}
						<div class="self-center text-sm">{pinTabs ? 'Unpin' : 'Pin'} tab panel</div>
					{/if}
				</div>
			</button>
		</header>

		<div class="divider mt-0 mb-0"></div>

		<main class="flex h-fit max-h-fit flex-col gap-y-1 overflow-x-hidden overflow-y-auto">
			{#each viewQueryConditions as _, qIndex}
				<button
					class="btn btn-sm w-full p-1 {queryConditionCurrentTabIndex === qIndex
						? themecolor === Domain.Entities.Theme.Color.PRIMARY
							? 'btn-primary'
							: themecolor === Domain.Entities.Theme.Color.SECONDARY
								? 'btn-secondary'
								: 'btn-accent'
						: ''}"
					aria-label="Query Condition {qIndex}"
					onclick={() => {
						queryConditionCurrentTabIndex = qIndex
						view = View.CURRENT_Q_CONDITION
					}}
				>
					<div class="flex w-full flex-1 justify-between">
						<span class="flex h-fit self-center italic {!expandAside && !pinTabs ? 'w-full justify-center' : ''}">
							{#if expandAside || pinTabs}
								<span class="self-center text-sm break-words">Query Condition-</span>
							{/if}
							<span class="self-center text-lg font-bold">{qIndex + 1}</span>
						</span>
						{#if expandAside || pinTabs}
							<!-- svelte-ignore a11y_click_events_have_key_events -->
							<!-- svelte-ignore a11y_no_static_element_interactions -->
							<!-- svelte-ignore a11y_interactive_supports_focus -->
							<span
								class="btn btn-circle btn-ghost btn-sm self-center"
								onclick={(e: Event) => {
									e.stopPropagation()
									ondeletequerycondition(qIndex)
								}}
								role="button"
								aria-label="Delete Query Condition {qIndex}"
							>
								<!--mdi:close-thick source: https://icon-sets.iconify.design-->
								<svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 24 24">
									<path
										fill={queryConditionCurrentTabIndex === qIndex
											? `var(${Utils.Theme.GetColorContent(themecolor)})`
											: theme === Domain.Entities.Theme.Theme.DARK
												? 'white'
												: 'black'}
										d="M20 6.91L17.09 4L12 9.09L6.91 4L4 6.91L9.09 12L4 17.09L6.91 20L12 14.91L17.09 20L20 17.09L14.91 12z"
									/>
								</svg>
							</span>
						{/if}
					</div>
				</button>
			{/each}
		</main>

		<div class="divider mt-0 mb-0"></div>

		<button
			class="btn btn-sm btn-ghost w-full"
			aria-label="Add New Query Condition"
			onclick={() => (viewQueryConditions = [...viewQueryConditions, {}])}
		>
			<div class="flex w-full gap-x-2">
				<!--mdi:tab-add source: https://icon-sets.iconify.design-->
				<svg xmlns="http://www.w3.org/2000/svg" width="30" height="32" viewBox="0 0 24 24">
					<path
						fill={theme === Domain.Entities.Theme.Theme.DARK ? 'white' : 'black'}
						d="M3 3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm0 2h10v4h8v10H3zm7 5v3H7v2h3v3h2v-3h3v-2h-3v-3z"
					/>
				</svg>
				{#if expandAside || pinTabs}
					<div class="self-center text-sm">Add new query condition</div>
				{/if}
			</div>
		</button>
	</aside>

	<main
		class="flex min-h-full w-full flex-[9.5] flex-col overflow-hidden rounded-lg p-2 shadow-inner shadow-gray-800 {theme ===
		Domain.Entities.Theme.Theme.DARK
			? 'bg-gray-600'
			: 'bg-gray-300'}"
	>
		{#if selectedFieldGroupKey.length > 0}
			{@const fieldGroup = Json.GetValueInObject(
				metadatamodel,
				selectedFieldGroupKey.replace(new RegExp(MetadataModel.ARRAY_INDEX_PLACEHOLDER_REGEX_SEARCH, 'g'), '[0]')
			)}

			<header class="flex justify-between p-1">
				<div class="h-fit self-center">{MetadataModel.GetFieldGroupName(fieldGroup)}</div>

				<button
					class="btn btn-ghost h-fit min-h-fit w-fit min-w-fit p-1"
					onclick={() => {
						selectedFieldGroupKey = ''
					}}
					aria-label="Close selected Field/Group Key"
				>
					<!--mdi:close-thick source: https://icon-sets.iconify.design-->
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
						<path
							fill={theme === Domain.Entities.Theme.Theme.DARK ? 'white' : 'black'}
							d="M20 6.91L17.09 4L12 9.09L6.91 4L4 6.91L9.09 12L4 17.09L6.91 20L12 14.91L17.09 20L20 17.09L14.91 12z"
						/>
					</svg>
				</button>
			</header>

			<div class="divider mt-0 mb-0"></div>

			{#await import('./FieldGroup/View/Component.svelte') then { default: FieldGroupView }}
				<FieldGroupView
					fieldgroup={fieldGroup}
					{themecolor}
					{theme}
					queryconditionindex={queryConditionCurrentTabIndex}
					updatefieldgroup={onupdatefieldgroup}
					handlegetfieldgroupquerycondition={getQueryCondition}
					handleupdatefieldgroupquerycondition={updateFieldGroupQueryCondition}
				></FieldGroupView>
			{/await}
		{:else if view === View.ALL_Q_CONDITIONS_AS_JSON}
			<pre class="h-full w-full flex-1 overflow-auto"><code>{JSON.stringify(viewQueryConditions, null, 4)}</code></pre>
		{:else if view === View.CURRENT_Q_CONDITION_AS_JSON}
			<pre class="h-full w-full flex-1 overflow-auto"><code>{JSON.stringify(viewQueryConditions[queryConditionCurrentTabIndex], null, 4)}</code></pre>
		{:else}
			<div class="h-full w-full overflow-auto">
				{#await import('./FieldGroup/Component.svelte') then { default: FieldGroup }}
					<FieldGroup
						fieldgroup={viewMetadataModel}
						{themecolor}
						{telemetry}
						{theme}
						updatefieldgroup={onupdatefieldgroup}
						queryconditionindex={queryConditionCurrentTabIndex}
						{contentperpage}
						handleselectfieldgroup={(queryconditionindex, fieldGroupKey) => {
							selectedFieldGroupKey = fieldGroupKey
							queryConditionCurrentTabIndex = queryconditionindex
						}}
						handlegetfieldgroupquerycondition={getQueryCondition}
						handledeletefieldgroupquerycondition={ondeletequerycondition}
						handleupdatefieldgroupquerycondition={updateFieldGroupQueryCondition}
					></FieldGroup>
				{/await}
			</div>
		{/if}
	</main>
</div>
