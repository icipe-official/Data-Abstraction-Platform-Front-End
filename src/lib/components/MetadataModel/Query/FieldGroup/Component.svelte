<!--
@component

Props:
-
-->
<script lang="ts">
	import { Domain, Json, MetadataModel, Utils } from '$lib'

	const COMPONENT_NAME = 'metadata-model-query-field-group'

	interface Props {
		fieldgroup: any
		themecolor: Domain.Entities.Theme.Color
		telemetry?: Domain.Interfaces.ITelemetry
		theme: Domain.Entities.Theme.Theme
		updatefieldgroup: (value: any) => void
		queryconditionindex: number
		showgroupfields?: boolean
		showhidegroupfields?: () => void
		contentperpage?: number
		stickyheaderoffset?: number
		stickyfooteroffset?: number
		stickythreshold?: number
		handleselectfieldgroup: (queryconditionindex: number, fieldGroupKey: string) => void
		handlegetfieldgroupquerycondition: (queryconditionindex: number, fieldGroupKey: string) => any
		handledeletefieldgroupquerycondition: (queryconditionindex: number, fieldGroupKey: string) => any
		handleupdatefieldgroupquerycondition: (queryconditionindex: number, fieldGroupKey: string, querycondition: MetadataModel.IQueryCondition) => void
	}

	let {
		fieldgroup = {},
		themecolor,
		telemetry = undefined,
		theme,
		updatefieldgroup,
		queryconditionindex,
		showgroupfields = true,
		showhidegroupfields = undefined,
		contentperpage = 5,
		stickyheaderoffset = 0,
		stickyfooteroffset = 0,
		stickythreshold = 0.3,
		handleselectfieldgroup,
		handlegetfieldgroupquerycondition,
		handledeletefieldgroupquerycondition,
		handleupdatefieldgroupquerycondition
	}: Props = $props()

	/**
	 * Text value to use when searching for field/groups.
	 */
	let searchFieldGroupsQuery: string = $state('')

	/**
	 * Show bar for searching field/groups using text search.
	 */
	let showSearchFieldGroupBar: boolean = $state(false)

	/**
	 * searched field/groups whose {@linkcode MetadataModel.FgProperties.FIELD_GROUP_NAME} or {@linkcode MetadataModel.FgProperties.FIELD_GROUP_DESCRIPTION} contain
	 * {@linkcode searchFieldGroupsQuery}.
	 */
	let searchedFieldGroupKeys: string[] = $state([])

	/**
	 * Display `json` value for field/group.
	 */
	let viewFieldGroupJson: boolean = $state(false)

	/**
	 * Total number of fields in {@linkcode fieldgroup}->{@linkcode MetadataModel.FgProperties.GROUP_READ_ORDER_OF_FIELDS} prop
	 */
	let groupNoOfFields: number = $derived.by(() => {
		if (fieldgroup && MetadataModel.IsGroupFieldContainsGroup(fieldgroup)) {
			return fieldgroup[MetadataModel.FgProperties.GROUP_READ_ORDER_OF_FIELDS].length
		}

		return 0
	})

	/**
	 * Pagination start index for {@linkcode fieldgroup}->{@linkcode MetadataModel.FgProperties.GROUP_READ_ORDER_OF_FIELDS} prop
	 */
	let groupFieldStart: number = $state(0)

	/**
	 * Pagination end index for {@linkcode fieldgroup}->{@linkcode MetadataModel.FgProperties.GROUP_READ_ORDER_OF_FIELDS} prop
	 */
	let groupFieldsEnd: number = $state(0)

	let noOfSearchFieldGroups: number = $derived.by(() => {
		if (searchFieldGroupsQuery.length > 0) {
			return searchedFieldGroupKeys.length
		}

		return 0
	})

	/**
	 * Pagination start index for {@linkcode searchedFieldGroupKeys}
	 */
	let searchedStart: number = $state(0)

	/**
	 * Pagination end index for {@linkcode searchedFieldGroupKeys}
	 */
	let searchedEnd: number = $state(0)

	let windowHeight: number = $state(0)

	let groupHeaderHeight: number = $state(0)

	let groupFooterHeight: number = $state(0)

	let fieldGroupKey: string = $derived(fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_KEY])

	let queryCondition: any = $derived(handlegetfieldgroupquerycondition(queryconditionindex, fieldGroupKey))

	let addFullTextSearchBox: boolean = $derived(fieldgroup[MetadataModel.FgProperties.GROUP_QUERY_ADD_FULL_TEXT_SEARCH_BOX])

	let fullTextSearchQuery: string = $derived.by(() => {
		const fts = queryCondition[MetadataModel.QcProperties.D_FULL_TEXT_SEARCH_QUERY]
		if (typeof fts === 'string') {
			return fts
		}

		return ''
	})
</script>

<svelte:window bind:innerHeight={windowHeight} />

<svelte:boundary onerror={(e) => telemetry?.Log(COMPONENT_NAME, true, Domain.Entities.Telemetry.LogLevel.ERROR, 'error', e)}>
	<div class="grid min-h-fit min-w-fit" style="grid-template-columns: max-content 9fr;">
		{#if fieldgroup && MetadataModel.IsGroupFieldContainsGroup(fieldgroup)}
			<div
				class="z-[3] flex flex-col {theme === Domain.Entities.Theme.Theme.DARK ? 'bg-gray-600' : 'bg-gray-300'}"
				style="position: sticky; top: {stickyheaderoffset}px; bottom: {stickyfooteroffset}px;"
			>
				<button
					class="btn tooltip tooltip-right {themecolor === Domain.Entities.Theme.Color.PRIMARY
						? 'btn-primary tooltip-primary'
						: themecolor === Domain.Entities.Theme.Color.SECONDARY
							? 'btn-secondary tooltip-secondary'
							: 'btn-accent tooltip-accent'} h-[38px] min-h-[38px] w-[38px] p-1"
					aria-label="Show Field/Group Tree"
					onclick={() => {
						showgroupfields = !showgroupfields
					}}
					data-tip="{showgroupfields ? 'Hide' : 'Show'} group field tree"
				>
					{#if showgroupfields}
						<!--mdi:eye source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
							<path
								fill="var({Utils.Theme.GetColorContent(themecolor)})"
								d="M12 9a3 3 0 0 0-3 3a3 3 0 0 0 3 3a3 3 0 0 0 3-3a3 3 0 0 0-3-3m0 8a5 5 0 0 1-5-5a5 5 0 0 1 5-5a5 5 0 0 1 5 5a5 5 0 0 1-5 5m0-12.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5"
							/>
						</svg>
					{:else}
						<!--mdi:eye-off source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
							<path
								fill="var({Utils.Theme.GetColorContent(themecolor)})"
								d="M11.83 9L15 12.16V12a3 3 0 0 0-3-3zm-4.3.8l1.55 1.55c-.05.21-.08.42-.08.65a3 3 0 0 0 3 3c.22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53a5 5 0 0 1-5-5c0-.79.2-1.53.53-2.2M2 4.27l2.28 2.28l.45.45C3.08 8.3 1.78 10 1 12c1.73 4.39 6 7.5 11 7.5c1.55 0 3.03-.3 4.38-.84l.43.42L19.73 22L21 20.73L3.27 3M12 7a5 5 0 0 1 5 5c0 .64-.13 1.26-.36 1.82l2.93 2.93c1.5-1.25 2.7-2.89 3.43-4.75c-1.73-4.39-6-7.5-11-7.5c-1.4 0-2.74.25-4 .7l2.17 2.15C10.74 7.13 11.35 7 12 7"
							/>
						</svg>
					{/if}
				</button>
			</div>
		{:else}
			<div class="h-full min-h-full w-fit"></div>
		{/if}

		<header
			id="header-show-group-field-tree"
			class="z-[3] flex {theme === Domain.Entities.Theme.Theme.DARK ? 'bg-gray-600' : 'bg-gray-300'}"
			style="position: sticky; top: {stickyheaderoffset}px; bottom: {stickyfooteroffset + groupFooterHeight}px; {!fieldgroup ||
			!MetadataModel.IsGroupFieldContainsGroup(fieldgroup)
				? 'grid-column:1/3;'
				: ''}"
			bind:clientHeight={groupHeaderHeight}
		>
			<button
				class="link link-hover ml-1 h-fit self-center text-xl"
				onclick={() => {
					if (typeof handleselectfieldgroup === 'function') {
						handleselectfieldgroup(queryconditionindex, fieldGroupKey)
					}
				}}
				disabled={typeof handleselectfieldgroup !== 'function'}
				aria-label="Select Field/Group"
			>
				{MetadataModel.GetFieldGroupName(fieldgroup)}
			</button>

			{#if showSearchFieldGroupBar}
				<span class="join h-fit w-fit self-center pl-1">
					<input
						class="join-item input h-[38px] {themecolor === Domain.Entities.Theme.Color.PRIMARY
							? 'input-primary'
							: themecolor === Domain.Entities.Theme.Color.SECONDARY
								? 'input-secondary'
								: 'input-accent'}"
						type="search"
						value={searchFieldGroupsQuery}
						oninput={(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
							searchedFieldGroupKeys = []
							searchFieldGroupsQuery = e.currentTarget.value
							if (searchFieldGroupsQuery.length > 0) {
								MetadataModel.ForEachFieldGroup(fieldgroup, (property: any) => {
									if (typeof property[MetadataModel.FgProperties.FIELD_GROUP_KEY] === 'string') {
										if (typeof property[MetadataModel.FgProperties.FIELD_GROUP_NAME] === 'string') {
											if (
												(property[MetadataModel.FgProperties.FIELD_GROUP_NAME] as string)
													.toLocaleLowerCase()
													.includes(searchFieldGroupsQuery.toLocaleLowerCase())
											) {
												searchedFieldGroupKeys = [...searchedFieldGroupKeys, property[MetadataModel.FgProperties.FIELD_GROUP_KEY]]
												return
											}
										}

										if (typeof property[MetadataModel.FgProperties.FIELD_GROUP_DESCRIPTION] === 'string') {
											if (
												(property[MetadataModel.FgProperties.FIELD_GROUP_DESCRIPTION] as string)
													.toLocaleLowerCase()
													.includes(searchFieldGroupsQuery.toLocaleLowerCase())
											) {
												searchedFieldGroupKeys = [...searchedFieldGroupKeys, property[MetadataModel.FgProperties.FIELD_GROUP_KEY]]
												return
											}
										}
									}
								})
							}
						}}
					/>

					<button
						class="join-item btn {themecolor === Domain.Entities.Theme.Color.PRIMARY
							? 'btn-primary'
							: themecolor === Domain.Entities.Theme.Color.SECONDARY
								? 'btn-secondary'
								: 'btn-accent'} h-fit min-h-[24px] w-fit p-2"
						onclick={() => (showSearchFieldGroupBar = false)}
						aria-label="Show/Hide Field/Group"
					>
						<div class="flex flex-col justify-center">
							<div class="flex self-center">
								<!--mdi:search source: https://icon-sets.iconify.design-->
								<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
									<path
										fill="var({Utils.Theme.GetColorContent(themecolor)})"
										d="M9.5 3A6.5 6.5 0 0 1 16 9.5c0 1.61-.59 3.09-1.56 4.23l.27.27h.79l5 5l-1.5 1.5l-5-5v-.79l-.27-.27A6.52 6.52 0 0 1 9.5 16A6.5 6.5 0 0 1 3 9.5A6.5 6.5 0 0 1 9.5 3m0 2C7 5 5 7 5 9.5S7 14 9.5 14S14 12 14 9.5S12 5 9.5 5"
									/>
								</svg>

								<!--mdi:close-circle source: https://icon-sets.iconify.design-->
								<svg xmlns="http://www.w3.org/2000/svg" width="20" height="15" viewBox="0 0 24 24">
									<path
										fill="var({Utils.Theme.GetColorContent(themecolor)})"
										d="M12 2c5.53 0 10 4.47 10 10s-4.47 10-10 10S2 17.53 2 12S6.47 2 12 2m3.59 5L12 10.59L8.41 7L7 8.41L10.59 12L7 15.59L8.41 17L12 13.41L15.59 17L17 15.59L13.41 12L17 8.41z"
									/>
								</svg>
							</div>
						</div>
					</button>
				</span>
			{:else}
				<span class="join z-[4] h-fit w-fit self-center pl-1">
					{#if typeof fieldgroup[MetadataModel.FgProperties.GROUP_FIELDS] === 'object' && typeof fieldGroupKey === 'string'}
						<button
							class="join-item btn tooltip tooltip-right {themecolor === Domain.Entities.Theme.Color.PRIMARY
								? 'btn-primary tooltip-primary'
								: themecolor === Domain.Entities.Theme.Color.SECONDARY
									? 'btn-secondary tooltip-secondary'
									: 'btn-accent tooltip-accent'} h-fit min-h-[24px] w-fit p-2"
							onclick={() => (showSearchFieldGroupBar = true)}
							aria-label="Search Group/Fields"
							data-tip="Search group fields"
						>
							<!--mdi:search source: https://icon-sets.iconify.design-->
							<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
								<path
									fill="var({Utils.Theme.GetColorContent(themecolor)})"
									d="M9.5 3A6.5 6.5 0 0 1 16 9.5c0 1.61-.59 3.09-1.56 4.23l.27.27h.79l5 5l-1.5 1.5l-5-5v-.79l-.27-.27A6.52 6.52 0 0 1 9.5 16A6.5 6.5 0 0 1 3 9.5A6.5 6.5 0 0 1 9.5 3m0 2C7 5 5 7 5 9.5S7 14 9.5 14S14 12 14 9.5S12 5 9.5 5"
								/>
							</svg>
						</button>
					{/if}

					<button
						class="join-item btn tooltip tooltip-right {themecolor === Domain.Entities.Theme.Color.PRIMARY
							? 'btn-primary tooltip-primary'
							: themecolor === Domain.Entities.Theme.Color.SECONDARY
								? 'btn-secondary tooltip-secondary'
								: 'btn-accent tooltip-accent'} h-fit min-h-[24px] w-fit p-2"
						onclick={() => (viewFieldGroupJson = !viewFieldGroupJson)}
						aria-label="View JSON"
						data-tip="View json data"
					>
						<!--mdi:code-json source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
							<path
								fill="var({Utils.Theme.GetColorContent(themecolor)})"
								d="M5 3h2v2H5v5a2 2 0 0 1-2 2a2 2 0 0 1 2 2v5h2v2H5c-1.07-.27-2-.9-2-2v-4a2 2 0 0 0-2-2H0v-2h1a2 2 0 0 0 2-2V5a2 2 0 0 1 2-2m14 0a2 2 0 0 1 2 2v4a2 2 0 0 0 2 2h1v2h-1a2 2 0 0 0-2 2v4a2 2 0 0 1-2 2h-2v-2h2v-5a2 2 0 0 1 2-2a2 2 0 0 1-2-2V5h-2V3zm-7 12a1 1 0 0 1 1 1a1 1 0 0 1-1 1a1 1 0 0 1-1-1a1 1 0 0 1 1-1m-4 0a1 1 0 0 1 1 1a1 1 0 0 1-1 1a1 1 0 0 1-1-1a1 1 0 0 1 1-1m8 0a1 1 0 0 1 1 1a1 1 0 0 1-1 1a1 1 0 0 1-1-1a1 1 0 0 1 1-1"
							/>
						</svg>
						{#if viewFieldGroupJson}
							<!--mdi:close-circle source: https://icon-sets.iconify.design-->
							<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24">
								<path
									fill="var({Utils.Theme.GetColorContent(themecolor)})"
									d="M12 2c5.53 0 10 4.47 10 10s-4.47 10-10 10S2 17.53 2 12S6.47 2 12 2m3.59 5L12 10.59L8.41 7L7 8.41L10.59 12L7 15.59L8.41 17L12 13.41L15.59 17L17 15.59L13.41 12L17 8.41z"
								/>
							</svg>
						{/if}
					</button>

					<button
						class="join-item btn tooltip tooltip-right {themecolor === Domain.Entities.Theme.Color.PRIMARY
							? 'btn-primary tooltip-primary'
							: themecolor === Domain.Entities.Theme.Color.SECONDARY
								? 'btn-secondary tooltip-secondary'
								: 'btn-accent tooltip-accent'} h-fit min-h-[24px] w-fit p-2"
						onclick={() => {
							if (fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_VIEW_DISABLE]) {
								delete fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_VIEW_DISABLE]
							} else {
								fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_VIEW_DISABLE] = true
							}
							updatefieldgroup(fieldgroup)
						}}
						aria-label="Show/Hide field/group"
						data-tip="Show/Hide field/group"
					>
						{#if fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_VIEW_DISABLE]}
							<!--mdi:eye-off source: https://icon-sets.iconify.design-->
							<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
								<path
									fill="var({Utils.Theme.GetColorContent(themecolor)})"
									d="M11.83 9L15 12.16V12a3 3 0 0 0-3-3zm-4.3.8l1.55 1.55c-.05.21-.08.42-.08.65a3 3 0 0 0 3 3c.22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53a5 5 0 0 1-5-5c0-.79.2-1.53.53-2.2M2 4.27l2.28 2.28l.45.45C3.08 8.3 1.78 10 1 12c1.73 4.39 6 7.5 11 7.5c1.55 0 3.03-.3 4.38-.84l.43.42L19.73 22L21 20.73L3.27 3M12 7a5 5 0 0 1 5 5c0 .64-.13 1.26-.36 1.82l2.93 2.93c1.5-1.25 2.7-2.89 3.43-4.75c-1.73-4.39-6-7.5-11-7.5c-1.4 0-2.74.25-4 .7l2.17 2.15C10.74 7.13 11.35 7 12 7"
								/>
							</svg>
						{:else}
							<!--mdi:eye source: https://icon-sets.iconify.design-->
							<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
								<path
									fill="var({Utils.Theme.GetColorContent(themecolor)})"
									d="M12 9a3 3 0 0 0-3 3a3 3 0 0 0 3 3a3 3 0 0 0 3-3a3 3 0 0 0-3-3m0 8a5 5 0 0 1-5-5a5 5 0 0 1 5-5a5 5 0 0 1 5 5a5 5 0 0 1-5 5m0-12.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5"
								/>
							</svg>
						{/if}
					</button>

					<button
						class="join-item btn tooltip tooltip-right {themecolor === Domain.Entities.Theme.Color.PRIMARY
							? 'btn-primary tooltip-primary'
							: themecolor === Domain.Entities.Theme.Color.SECONDARY
								? 'btn-secondary tooltip-secondary'
								: 'btn-accent tooltip-accent'} h-fit min-h-[24px] w-fit p-2"
						onclick={() => {
							if (fieldgroup[MetadataModel.FgProperties.DATABASE_SKIP_DATA_EXTRACTION]) {
								delete fieldgroup[MetadataModel.FgProperties.DATABASE_SKIP_DATA_EXTRACTION]
							} else {
								fieldgroup[MetadataModel.FgProperties.DATABASE_SKIP_DATA_EXTRACTION] = true
							}
							updatefieldgroup(fieldgroup)
						}}
						aria-label="Skip/Unksip field/group database search extraction"
						data-tip="Skip/Unksip field/group database search extraction"
					>
						{#if fieldgroup[MetadataModel.FgProperties.DATABASE_SKIP_DATA_EXTRACTION]}
							<!--mdi:database-remove source: https://icon-sets.iconify.design-->
							<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
								<path
									fill="var({Utils.Theme.GetColorContent(themecolor)})"
									d="m15.46 15.88l1.42-1.42L19 16.59l2.12-2.12l1.41 1.41L20.41 18l2.13 2.12l-1.42 1.42L19 19.41l-2.12 2.12l-1.41-1.41L17.59 18zM12 3c4.42 0 8 1.79 8 4s-3.58 4-8 4s-8-1.79-8-4s3.58-4 8-4M4 9c0 2.21 3.58 4 8 4s8-1.79 8-4v3.08L19 12c-2.59 0-4.8 1.64-5.64 3.94L12 16c-4.42 0-8-1.79-8-4zm0 5c0 2.21 3.58 4 8 4h1c0 1.05.27 2.04.75 2.9L12 21c-4.42 0-8-1.79-8-4z"
								/>
							</svg>
						{:else}
							<!--mdi:database-check source: https://icon-sets.iconify.design-->
							<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
								<path
									fill="var({Utils.Theme.GetColorContent(themecolor)})"
									d="M12 3c4.42 0 8 1.79 8 4s-3.58 4-8 4s-8-1.79-8-4s3.58-4 8-4M4 9c0 2.21 3.58 4 8 4s8-1.79 8-4v3.08L19 12c-2.59 0-4.8 1.64-5.64 3.94L12 16c-4.42 0-8-1.79-8-4zm0 5c0 2.21 3.58 4 8 4h1c0 1.05.27 2.04.75 2.9L12 21c-4.42 0-8-1.79-8-4zm14 7.08l-2.75-3l1.16-1.16L18 18.5l3.59-3.58l1.16 1.41z"
								/>
							</svg>
						{/if}
					</button>

					<div class="indicator">
						{#if Object.keys(queryCondition).length > 0}
							<span
								class="indicator-item indicator-middle status {themecolor === Domain.Entities.Theme.Color.ACCENT
									? 'status-primary'
									: themecolor === Domain.Entities.Theme.Color.PRIMARY
										? 'status-secondary'
										: 'status-accent'}"
							>
							</span>
						{/if}
						<button
							class="join-item btn tooltip tooltip-right {themecolor === Domain.Entities.Theme.Color.PRIMARY
								? 'btn-primary tooltip-primary'
								: themecolor === Domain.Entities.Theme.Color.SECONDARY
									? 'btn-secondary tooltip-secondary'
									: 'btn-accent tooltip-accent'} h-fit min-h-[24px] w-fit p-2"
							onclick={() => {
								handledeletefieldgroupquerycondition(queryconditionindex, fieldGroupKey)
							}}
							aria-label="Remove field/group query condtions"
							data-tip="Remove field/group query condtions.{Object.keys(queryCondition).length > 0
								? ` Database search query Set.${Array.isArray(queryCondition[MetadataModel.QcProperties.FG_FILTER_CONDITION]) ? ` ${queryCondition[MetadataModel.QcProperties.FG_FILTER_CONDITION].length} Filter Conditions set.` : ''}`
								: ''}"
						>
							<!--mdi:filter-remove source: https://icon-sets.iconify.design-->
							<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
								<path
									fill="var({Utils.Theme.GetColorContent(themecolor)})"
									d="M14.76 20.83L17.6 18l-2.84-2.83l1.41-1.41L19 16.57l2.83-2.81l1.41 1.41L20.43 18l2.81 2.83l-1.41 1.41L19 19.4l-2.83 2.84zM12 12v7.88c.04.3-.06.62-.29.83a.996.996 0 0 1-1.41 0L8.29 18.7a.99.99 0 0 1-.29-.83V12h-.03L2.21 4.62a1 1 0 0 1 .17-1.4c.19-.14.4-.22.62-.22h14c.22 0 .43.08.62.22a1 1 0 0 1 .17 1.4L12.03 12z"
								/>
							</svg>
						</button>
					</div>
				</span>
			{/if}
		</header>

		{#if showgroupfields}
			{#if viewFieldGroupJson}
				<section class="flex h-fit w-full flex-1 overflow-hidden pt-1 pb-1" style="grid-column: 1/3;">
					<pre
						class="h-fit max-h-[50vh] w-full flex-1 overflow-auto rounded-md {theme === Domain.Entities.Theme.Theme.DARK
							? 'bg-gray-500'
							: 'bg-gray-700'} p-1 shadow-inner shadow-gray-800 lg:max-w-[50vw]">
						<code>{JSON.stringify(fieldgroup, null, 4)}</code>
					</pre>
				</section>
			{:else}
				<div class="flex h-full justify-center">
					<div
						class="h-full min-h-full w-[6px] {themecolor === Domain.Entities.Theme.Color.PRIMARY
							? 'bg-primary'
							: themecolor === Domain.Entities.Theme.Color.SECONDARY
								? 'bg-secondary'
								: 'bg-accent'}"
					></div>
				</div>

				{#if showSearchFieldGroupBar && typeof fieldGroupKey === 'string'}
					{#if searchedFieldGroupKeys.length > 0}
						<div class="z-[1] flex flex-col">
							{#each Utils.Range(searchedStart, Utils.RangeArrayEnd(searchedEnd, noOfSearchFieldGroups)) as sIndex (sIndex)}
								{@const fg = Json.GetValueInObject(
									fieldgroup,
									searchedFieldGroupKeys[sIndex]
										.replace(fieldGroupKey, '$')
										.replace(new RegExp(MetadataModel.ARRAY_INDEX_PLACEHOLDER_REGEX_SEARCH, 'g'), '[0]')
								)}

								{#if fg}
									<div class="pt-1 pb-1">
										{#await import('./Component.svelte') then { default: Self }}
											<Self
												themecolor={Utils.Theme.GetNextColorA(themecolor)}
												{theme}
												fieldgroup={fg}
												{handleselectfieldgroup}
												{handledeletefieldgroupquerycondition}
												{handlegetfieldgroupquerycondition}
												{handleupdatefieldgroupquerycondition}
												{updatefieldgroup}
												{queryconditionindex}
												showgroupfields={false}
												{contentperpage}
												{telemetry}
											></Self>
										{/await}
									</div>
								{/if}
							{/each}

							{@render paginate()}
						</div>
					{:else}
						<div
							class="self-center text-lg font-bold {themecolor === Domain.Entities.Theme.Color.ACCENT
								? 'text-primary'
								: themecolor === Domain.Entities.Theme.Color.PRIMARY
									? 'text-secondary'
									: 'text-accent'}"
						>
							...no results to show...
						</div>
					{/if}
				{:else}
					<div class="z-[1] flex flex-col">
						{#if fieldgroup && MetadataModel.IsGroupFieldContainsGroup(fieldgroup)}
							{#if addFullTextSearchBox}
								<textarea
									class="textarea mt-1 h-[32px] w-full rounded-lg {themecolor === Domain.Entities.Theme.Color.PRIMARY
										? 'textarea-primary'
										: themecolor === Domain.Entities.Theme.Color.SECONDARY
											? 'textarea-secondary'
											: 'textarea-accent'}"
									placeholder="Enter {MetadataModel.GetFieldGroupName(fieldgroup, 'fields/groups')} full text search query..."
									value={fullTextSearchQuery}
									oninput={(e: Event & { currentTarget: EventTarget & HTMLTextAreaElement }) => {
										if (e.currentTarget.value.length > 0) {
											queryCondition[MetadataModel.QcProperties.D_FULL_TEXT_SEARCH_QUERY] = e.currentTarget.value
										} else {
											delete queryCondition[MetadataModel.QcProperties.D_FULL_TEXT_SEARCH_QUERY]
										}
										handleupdatefieldgroupquerycondition(queryconditionindex, fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_KEY], queryCondition)
									}}
								></textarea>
							{/if}

							{#each Utils.Range(groupFieldStart, Utils.RangeArrayEnd(groupFieldsEnd, groupNoOfFields)) as gIndex (gIndex)}
								{@const fgKey: string = fieldgroup[MetadataModel.FgProperties.GROUP_READ_ORDER_OF_FIELDS][gIndex]}

								{@const fg = fieldgroup[MetadataModel.FgProperties.GROUP_FIELDS][0][fgKey]}

								{#if fg}
									<div class="pt-1 pb-1">
										{#await import('./Component.svelte') then { default: Self }}
											<Self
												themecolor={Utils.Theme.GetNextColorA(themecolor)}
												{theme}
												fieldgroup={fieldgroup[MetadataModel.FgProperties.GROUP_FIELDS][0][fgKey]}
												{handleselectfieldgroup}
												{handledeletefieldgroupquerycondition}
												{handlegetfieldgroupquerycondition}
												{handleupdatefieldgroupquerycondition}
												{updatefieldgroup}
												{queryconditionindex}
												showhidegroupfields={() => {
													showgroupfields = !showgroupfields
												}}
												{contentperpage}
												{telemetry}
												stickyheaderoffset={stickyheaderoffset > stickythreshold * windowHeight
													? stickyheaderoffset
													: stickyheaderoffset + groupHeaderHeight}
												stickyfooteroffset={stickyfooteroffset > stickythreshold * windowHeight
													? stickyfooteroffset
													: stickyfooteroffset + groupFooterHeight}
												{stickythreshold}
											></Self>
										{/await}
									</div>
								{/if}
							{/each}
						{/if}
					</div>

					{#if MetadataModel.IsGroupFieldContainsGroup(fieldgroup)}
						<div class="flex h-full justify-center">
							<div
								class="h-[4px] min-h-[4px] w-[6px] {themecolor === Domain.Entities.Theme.Color.PRIMARY
									? 'bg-primary'
									: themecolor === Domain.Entities.Theme.Color.SECONDARY
										? 'bg-secondary'
										: 'bg-accent'}"
							></div>
						</div>
						<div class="h-full min-h-full w-full min-w-full"></div>

						<footer
							class="z-[2] flex flex-col {theme === Domain.Entities.Theme.Theme.DARK ? 'bg-gray-600' : 'bg-gray-300'}"
							style="grid-column: 1 / span 2; position:sticky; bottom: {stickyfooteroffset}px; top: {stickyheaderoffset + groupHeaderHeight}px;"
							bind:clientHeight={groupFooterHeight}
						>
							{@render paginate()}
						</footer>
					{/if}
				{/if}
			{/if}
		{/if}
	</div>

	{#snippet failed(error, _)}
		<div class="text-error font-bold">field/group may not be valid</div>
	{/snippet}
</svelte:boundary>

{#snippet paginate()}
	{#await import('$lib/components/Pagination/Component.svelte') then { default: Pagination }}
		<Pagination
			{themecolor}
			lengthofdata={showSearchFieldGroupBar ? noOfSearchFieldGroups : groupNoOfFields}
			start={showSearchFieldGroupBar ? searchedStart : groupFieldStart}
			end={showSearchFieldGroupBar ? searchedEnd : groupFieldsEnd}
			updatestart={(n) => {
				if (showSearchFieldGroupBar) {
					searchedStart = n
				} else {
					groupFieldStart = n
				}
			}}
			updateend={(n) => {
				if (showSearchFieldGroupBar) {
					searchedEnd = n
				} else {
					groupFieldsEnd = n
				}
			}}
			{telemetry}
			{contentperpage}
			displayiflengthofdatagreaterthancontentperpage={true}
		></Pagination>
	{/await}
{/snippet}
