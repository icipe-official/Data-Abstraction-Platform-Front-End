<!-- svelte-ignore a11y_mouse_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<!--
@component

Displays field group in the context of building.

Props:
- themecolor - 
- theme -
- fieldgroup - 
- copiedfieldgroupkey - 
- cutfieldgroup - 
- indexingroupreadorderoffields - 
- lengthofgroupreadorderoffields - 
- showgroupfields - 
- deletefieldgroup - 
- setcutfieldgroup - 
- setcopiedfieldgroupkey - 
- pastefieldgroup - 
- createfieldgroup - 
- handleselectfieldgroup - 
- reorderfieldgroup - 
- showhidegroupfields - 
- telemetry - utility for collecting telemetry following the `Domain.Interfaces.ITelemetry`interface.
- contentperpage -
- stickyheaderoffset -
- stickyfooteroffset -
- stickythreshold -
- telemetry - utility for collecting telemetry following the `Domain.Interfaces.ITelemetry`interface.
-->
<script lang="ts">
	import { Utils, Domain, MetadataModel, Json } from '$lib'

	const COMPONENT_NAME = 'metadata-model-build-field-group'

	interface Props {
		themecolor: Domain.Entities.Theme.Color
		theme: Domain.Entities.Theme.Theme
		fieldgroup: any
		copiedfieldgroupkey?: string
		cutfieldgroup?: boolean
		indexingroupreadorderoffields?: number
		lengthofgroupreadorderoffields?: number
		groupkey?: string
		showgroupfields?: boolean
		deletefieldgroup?: (fieldgroupkey: string, groupKey: string, indexingroupreadorderoffields: number) => void
		setcutfieldgroup?: (fieldgroupkey: string, groupKey: string, indexingroupreadorderoffields: number) => void
		setcopiedfieldgroupkey?: (fieldgroupkey: string) => void
		pastefieldgroup?: (destinationGroupKey: string, objectIndexInGroupReadOrderOfFields: number) => void
		createfieldgroup?: (groupKey: string, fieldGroupName: string, isField: boolean, objectIndexInGroupReadOrderOfFields: number) => void
		handleselectfieldgroup?: (fieldgroupkey: string, theme: Domain.Entities.Theme.Color) => void
		reorderfieldgroup?: (groupKey: string, direction: number, fieldGroupIndexInReadOrderOfFields: number) => void
		showhidegroupfields?: () => void
		telemetry?: Domain.Interfaces.ITelemetry
		contentperpage?: number
		stickyheaderoffset?: number
		stickyfooteroffset?: number
		stickythreshold?: number
	}

	let {
		themecolor,
		theme,
		fieldgroup,
		copiedfieldgroupkey = '',
		cutfieldgroup = false,
		indexingroupreadorderoffields = -1,
		lengthofgroupreadorderoffields = undefined,
		groupkey = undefined,
		showgroupfields = true,
		deletefieldgroup,
		setcutfieldgroup,
		setcopiedfieldgroupkey,
		pastefieldgroup,
		createfieldgroup,
		handleselectfieldgroup,
		reorderfieldgroup,
		showhidegroupfields,
		telemetry = undefined,
		contentperpage = 5,
		stickyheaderoffset = 0,
		stickyfooteroffset = 0,
		stickythreshold = 0.3
	}: Props = $props()

	/**
	 * Display bar for quickly creating new field/groups.
	 */
	let showCreateFieldGroup: boolean = $state(false)

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
</script>

<svelte:window bind:innerHeight={windowHeight} />

<svelte:boundary onerror={(e) => telemetry?.Log(COMPONENT_NAME, true, Domain.Entities.Telemetry.LogLevel.ERROR, 'error', e)}>
	<div class="grid min-h-fit min-w-fit {theme === Domain.Entities.Theme.Theme.DARK ? 'bg-gray-700' : 'bg-white'}" style="grid-template-columns: max-content 9fr;">
		{#if showCreateFieldGroup && typeof groupkey === 'string' && typeof createfieldgroup === 'function'}
			{#await import('../Create/Component.svelte') then { default: Create }}
				<section style="grid-column: 1/3;">
					<Create {themecolor} {groupkey} {createfieldgroup} {indexingroupreadorderoffields}></Create>
				</section>
			{/await}
		{/if}

		{#if fieldgroup && MetadataModel.IsGroupFieldContainsGroup(fieldgroup)}
			<div
				class="z-[3] pl-1 pr-1 pt-1 flex flex-col {theme === Domain.Entities.Theme.Theme.DARK ? 'bg-gray-700' : 'bg-white'}"
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
			class="z-[3] flex {theme === Domain.Entities.Theme.Theme.DARK ? 'bg-gray-700' : 'bg-white'}"
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
						handleselectfieldgroup(fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_KEY], themecolor)
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
					{#if typeof fieldgroup[MetadataModel.FgProperties.GROUP_FIELDS] === 'object' && typeof fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_KEY] === 'string'}
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

					{#if typeof indexingroupreadorderoffields === 'number' && typeof lengthofgroupreadorderoffields === 'number' && (fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_KEY] as string).split('.').length > 3 && typeof showhidegroupfields === 'function'}
						<button
							class="join-item btn tooltip-right {themecolor === Domain.Entities.Theme.Color.PRIMARY
								? 'btn-primary tooltip-primary'
								: themecolor === Domain.Entities.Theme.Color.SECONDARY
									? 'btn-secondary tooltip-secondary'
									: 'btn-accent tooltip-accent'} h-fit min-h-[24px] w-fit p-2"
							onclick={showhidegroupfields}
							data-tip="Collapse/hide parent group"
						>
							<!--mdi:arrow-collapse-vertical source: https://icon-sets.iconify.design-->
							<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
								><path
									fill="var({Utils.Theme.GetColorContent(themecolor)})"
									d="M4 12h16v2H4zm0-3h16v2H4zm12-5l-4 4l-4-4h3V1h2v3zM8 19l4-4l4 4h-3v3h-2v-3z"
								/></svg
							>
						</button>
					{/if}

					{#if copiedfieldgroupkey !== fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_KEY] && fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_KEY] !== '$' && typeof setcopiedfieldgroupkey === 'function'}
						<button
							class="join-item btn tooltip tooltip-right {themecolor === Domain.Entities.Theme.Color.PRIMARY
								? 'btn-primary tooltip-primary'
								: themecolor === Domain.Entities.Theme.Color.SECONDARY
									? 'btn-secondary tooltip-secondary'
									: 'btn-accent tooltip-accent'} h-fit min-h-[24px] w-fit p-2"
							onclick={() => setcopiedfieldgroupkey!(fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_KEY])}
							data-tip="Copy field group"
						>
							<!--mdi:content-copy source: https://icon-sets.iconify.design-->
							<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
								<path
									fill="var({Utils.Theme.GetColorContent(themecolor)})"
									d="M19 21H8V7h11m0-2H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2m-3-4H4a2 2 0 0 0-2 2v14h2V3h12z"
								/>
							</svg>
						</button>
					{/if}

					{#if fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_KEY] !== '$' && typeof indexingroupreadorderoffields === 'number' && typeof groupkey === 'string' && typeof setcutfieldgroup === 'function'}
						<button
							class="join-item btn tooltip tooltip-right {themecolor === Domain.Entities.Theme.Color.PRIMARY
								? 'btn-primary tooltip-primary'
								: themecolor === Domain.Entities.Theme.Color.SECONDARY
									? 'btn-secondary tooltip-secondary'
									: 'btn-accent tooltip-accent'} h-fit min-h-[24px] w-fit p-2"
							onclick={() => setcutfieldgroup!(fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_KEY], groupkey!, indexingroupreadorderoffields)}
							data-tip="Cut field group"
						>
							<!--mdi:content-cut source: https://icon-sets.iconify.design-->
							<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
								<path
									fill="var({Utils.Theme.GetColorContent(themecolor)})"
									d="m19 3l-6 6l2 2l7-7V3m-10 9.5a.5.5 0 0 1-.5-.5a.5.5 0 0 1 .5-.5a.5.5 0 0 1 .5.5a.5.5 0 0 1-.5.5M6 20a2 2 0 0 1-2-2a2 2 0 0 1 2-2a2 2 0 0 1 2 2a2 2 0 0 1-2 2M6 8a2 2 0 0 1-2-2a2 2 0 0 1 2-2a2 2 0 0 1 2 2a2 2 0 0 1-2 2m3.64-.36c.23-.5.36-1.05.36-1.64a4 4 0 0 0-4-4a4 4 0 0 0-4 4a4 4 0 0 0 4 4c.59 0 1.14-.13 1.64-.36L10 12l-2.36 2.36C7.14 14.13 6.59 14 6 14a4 4 0 0 0-4 4a4 4 0 0 0 4 4a4 4 0 0 0 4-4c0-.59-.13-1.14-.36-1.64L12 14l7 7h3v-1z"
								/>
							</svg>
						</button>
					{/if}

					{#if typeof indexingroupreadorderoffields === 'number' && typeof lengthofgroupreadorderoffields === 'number' && typeof groupkey === 'string' && typeof deletefieldgroup === 'function'}
						<button
							class="join-item btn tooltip tooltip-right {themecolor === Domain.Entities.Theme.Color.PRIMARY
								? 'btn-primary tooltip-primary'
								: themecolor === Domain.Entities.Theme.Color.SECONDARY
									? 'btn-secondary tooltip-secondary'
									: 'btn-accent tooltip-accent'} h-fit min-h-[24px] w-fit p-2"
							onclick={() => deletefieldgroup!(fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_KEY], groupkey!, indexingroupreadorderoffields)}
							data-tip="Delete field group"
						>
							<!--mdi:delete source: https://icon-sets.iconify.design-->
							<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
								><path
									fill="var({Utils.Theme.GetColorContent(themecolor)})"
									d="M19 4h-3.5l-1-1h-5l-1 1H5v2h14M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6z"
								/></svg
							>
						</button>

						{#if typeof reorderfieldgroup === 'function'}
							{#if indexingroupreadorderoffields > 0}
								<button
									class="join-item btn tooltip-right {themecolor === Domain.Entities.Theme.Color.PRIMARY
										? 'btn-primary tooltip-primary'
										: themecolor === Domain.Entities.Theme.Color.SECONDARY
											? 'btn-secondary tooltip-secondary'
											: 'btn-accent tooltip-accent'} h-fit min-h-[24px] w-fit p-2"
									onclick={() => reorderfieldgroup!(groupkey!, -1, indexingroupreadorderoffields)}
									data-tip="Move field group up"
								>
									<!--mdi:chevron-up source: https://icon-sets.iconify.design-->
									<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
										><path fill="var({Utils.Theme.GetColorContent(themecolor)})" d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6l-6 6z" /></svg
									>
								</button>
							{/if}

							{#if indexingroupreadorderoffields < lengthofgroupreadorderoffields - 1 && typeof groupkey === 'string'}
								<button
									class="join-item btn tooltip tooltip-right {themecolor === Domain.Entities.Theme.Color.PRIMARY
										? 'btn-primary tooltip-primary'
										: themecolor === Domain.Entities.Theme.Color.SECONDARY
											? 'btn-secondary tooltip-secondary'
											: 'btn-accent tooltip-accent'} h-fit min-h-[24px] w-fit p-2"
									onclick={() => reorderfieldgroup!(groupkey!, +1, indexingroupreadorderoffields)}
									data-tip="Move field group down"
								>
									<!--mdi:chevron-down source: https://icon-sets.iconify.design-->
									<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
										><path fill="var({Utils.Theme.GetColorContent(themecolor)})" d="M7.41 8.58L12 13.17l4.59-4.59L18 10l-6 6l-6-6z" /></svg
									>
								</button>
							{/if}

							<button
								class="join-item btn tooltip tooltip-right {themecolor === Domain.Entities.Theme.Color.PRIMARY
									? 'btn-primary tooltip-primary'
									: themecolor === Domain.Entities.Theme.Color.SECONDARY
										? 'btn-secondary tooltip-secondary'
										: 'btn-accent tooltip-accent'} h-fit min-h-[24px] w-fit p-2"
								onclick={() => (showCreateFieldGroup = !showCreateFieldGroup)}
								data-tip={showCreateFieldGroup ? 'Close add field group' : 'Add field group above'}
							>
								{#if showCreateFieldGroup}
									<!--mdi:close-circle source: https://icon-sets.iconify.design-->
									<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
										<path
											fill="var({Utils.Theme.GetColorContent(themecolor)})"
											d="M12 2c5.53 0 10 4.47 10 10s-4.47 10-10 10S2 17.53 2 12S6.47 2 12 2m3.59 5L12 10.59L8.41 7L7 8.41L10.59 12L7 15.59L8.41 17L12 13.41L15.59 17L17 15.59L13.41 12L17 8.41z"
										/>
									</svg>
								{:else}
									<!--mdi:plus source: https://icon-sets.iconify.design-->
									<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
										><path fill="var({Utils.Theme.GetColorContent(themecolor)})" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z" />
									</svg>
								{/if}
							</button>

							{#if typeof indexingroupreadorderoffields === 'number' && (copiedfieldgroupkey.length > 0 || cutfieldgroup) && typeof groupkey === 'string' && typeof pastefieldgroup === 'function'}
								<button
									class="join-item btn tooltip tooltip-left {themecolor === Domain.Entities.Theme.Color.PRIMARY
										? 'btn-primary tooltip-primary'
										: themecolor === Domain.Entities.Theme.Color.SECONDARY
											? 'btn-secondary tooltip-secondary'
											: 'btn-accent tooltip-accent'} h-fit min-h-[24px] w-fit p-2"
									onclick={() => pastefieldgroup!(groupkey as string, indexingroupreadorderoffields as number)}
									data-tip="Paste copied/cut field/group"
								>
									<!--mdi:content-paste source: https://icon-sets.iconify.design-->
									<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
										<path
											fill="var({Utils.Theme.GetColorContent(themecolor)})"
											d="M19 20H5V4h2v3h10V4h2m-7-2a1 1 0 0 1 1 1a1 1 0 0 1-1 1a1 1 0 0 1-1-1a1 1 0 0 1 1-1m7 0h-4.18C14.4.84 13.3 0 12 0S9.6.84 9.18 2H5a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2"
										/>
									</svg>
								</button>
							{/if}
						{/if}
					{/if}
				</span>
			{/if}
		</header>

		{#if showgroupfields}
			{#if viewFieldGroupJson}
				<section class="flex h-fit w-full flex-1 overflow-hidden pb-1 pt-1" style="grid-column: 1/3;">
					<pre
						class="h-fit max-h-[50vh] w-full flex-1 overflow-auto rounded-md {theme === Domain.Entities.Theme.Theme.DARK
							? 'bg-gray-500'
							: 'bg-gray-700'} p-1 text-white shadow-inner shadow-gray-800 lg:max-w-[50vw]">
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

				{#if showSearchFieldGroupBar && typeof fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_KEY] === 'string'}
					{#if searchedFieldGroupKeys.length > 0}
						<div class="z-[1] flex flex-col">
							{#each Utils.Range(searchedStart, Utils.RangeArrayEnd(searchedEnd, noOfSearchFieldGroups)) as sIndex (sIndex)}
								{@const fg = Json.GetValueInObject(
									fieldgroup,
									searchedFieldGroupKeys[sIndex]
										.replace(fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_KEY], '$')
										.replace(new RegExp(MetadataModel.ARRAY_INDEX_PLACEHOLDER_REGEX_SEARCH, 'g'), '[0]')
								)}

								{#if fg}
									<div class="pb-1 pt-1">
										{#await import('./Component.svelte') then { default: Self }}
											<Self
												themecolor={Utils.Theme.GetNextColorA(themecolor)}
												{theme}
												fieldgroup={fg}
												{copiedfieldgroupkey}
												{cutfieldgroup}
												{deletefieldgroup}
												{setcutfieldgroup}
												{setcopiedfieldgroupkey}
												{pastefieldgroup}
												{createfieldgroup}
												{handleselectfieldgroup}
												{reorderfieldgroup}
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
							{#each Utils.Range(groupFieldStart, Utils.RangeArrayEnd(groupFieldsEnd, groupNoOfFields)) as gIndex (gIndex)}
								{@const fgKey: string = fieldgroup[MetadataModel.FgProperties.GROUP_READ_ORDER_OF_FIELDS][gIndex]}

								{@const fg = fieldgroup[MetadataModel.FgProperties.GROUP_FIELDS][0][fgKey]}

								{#if fg}
									<div class="pb-1 pt-1">
										{#await import('./Component.svelte') then { default: Self }}
											<Self
												themecolor={Utils.Theme.GetNextColorA(themecolor)}
												{theme}
												fieldgroup={fieldgroup[MetadataModel.FgProperties.GROUP_FIELDS][0][fgKey]}
												{copiedfieldgroupkey}
												{cutfieldgroup}
												indexingroupreadorderoffields={gIndex}
												lengthofgroupreadorderoffields={groupNoOfFields}
												groupkey={fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_KEY]}
												{deletefieldgroup}
												{setcutfieldgroup}
												{setcopiedfieldgroupkey}
												{pastefieldgroup}
												{createfieldgroup}
												{handleselectfieldgroup}
												{reorderfieldgroup}
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
							class="z-[2] flex flex-col gap-y-2 p-2 {theme === Domain.Entities.Theme.Theme.DARK ? 'bg-gray-700' : 'bg-white'}"
							style="grid-column: 1 / span 2; position:sticky; bottom: {stickyfooteroffset}px; top: {stickyheaderoffset + groupHeaderHeight}px;"
							bind:clientHeight={groupFooterHeight}
						>
							{#if typeof createfieldgroup === 'function'}
								{#await import('../Create/Component.svelte') then { default: Create }}
									<section class="md:max-w-[600px]">
										<Create {themecolor} groupkey={fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_KEY]} {createfieldgroup}></Create>
									</section>
								{/await}
							{/if}

							{#if (fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_KEY] as string).split('.').length > 2 || copiedfieldgroupkey.length > 0 || cutfieldgroup}
								<section class="flex h-fit min-w-fit flex-col">
									<div class="relative w-full max-w-[50%]"></div>
									<div class="join h-fit w-full md:max-w-[400px]">
										{#if (fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_KEY] as string).split('.').length > 2}
											<button
												class="join-item btn flex h-fit min-h-[24px] flex-nowrap p-1 {themecolor === Domain.Entities.Theme.Color.PRIMARY
													? 'btn-primary'
													: themecolor === Domain.Entities.Theme.Color.SECONDARY
														? 'btn-secondary'
														: 'btn-accent'}"
												onclick={() => {
													if (showhidegroupfields) {
														showhidegroupfields()
													}
												}}
											>
												<span class="h-fit self-center">
													{#if showgroupfields}
														<!--mdi:eye source: https://icon-sets.iconify.design-->
														<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
															<path
																fill="var({Utils.Theme.GetColorContent(themecolor)})"
																d="M12 9a3 3 0 0 0-3 3a3 3 0 0 0 3 3a3 3 0 0 0 3-3a3 3 0 0 0-3-3m0 8a5 5 0 0 1-5-5a5 5 0 0 1 5-5a5 5 0 0 1 5 5a5 5 0 0 1-5 5m0-12.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5"
															/>
														</svg>
													{:else}
														<!--mdi:eye-off source: https://icon-sets.iconify.design-->
														<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
															<path
																fill="var({Utils.Theme.GetColorContent(themecolor)})"
																d="M11.83 9L15 12.16V12a3 3 0 0 0-3-3zm-4.3.8l1.55 1.55c-.05.21-.08.42-.08.65a3 3 0 0 0 3 3c.22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53a5 5 0 0 1-5-5c0-.79.2-1.53.53-2.2M2 4.27l2.28 2.28l.45.45C3.08 8.3 1.78 10 1 12c1.73 4.39 6 7.5 11 7.5c1.55 0 3.03-.3 4.38-.84l.43.42L19.73 22L21 20.73L3.27 3M12 7a5 5 0 0 1 5 5c0 .64-.13 1.26-.36 1.82l2.93 2.93c1.5-1.25 2.7-2.89 3.43-4.75c-1.73-4.39-6-7.5-11-7.5c-1.4 0-2.74.25-4 .7l2.17 2.15C10.74 7.13 11.35 7 12 7"
															/>
														</svg>
													{/if}
												</span>
												<span
													class="h-fit self-center {themecolor === Domain.Entities.Theme.Color.PRIMARY
														? 'text-primary-content'
														: themecolor === Domain.Entities.Theme.Color.SECONDARY
															? 'text-secondary-content'
															: 'text-accent-content'} text-nowrap">{showgroupfields ? 'hide' : 'show'} content</span
												>
											</button>
										{/if}

										{#if (copiedfieldgroupkey.length > 0 || cutfieldgroup) && typeof pastefieldgroup === 'function'}
											<button
												class="join-item btn flex h-fit min-h-[24px] w-fit p-1 {themecolor === Domain.Entities.Theme.Color.PRIMARY
													? 'btn-primary'
													: themecolor === Domain.Entities.Theme.Color.SECONDARY
														? 'btn-secondary'
														: 'btn-accent'}"
												onclick={() => pastefieldgroup!(fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_KEY], -1)}
											>
												<span class="h-fit self-center">
													<!--mdi:content-paste source: https://icon-sets.iconify.design-->
													<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
														<path
															fill="var({Utils.Theme.GetColorContent(themecolor)})"
															d="M19 20H5V4h2v3h10V4h2m-7-2a1 1 0 0 1 1 1a1 1 0 0 1-1 1a1 1 0 0 1-1-1a1 1 0 0 1 1-1m7 0h-4.18C14.4.84 13.3 0 12 0S9.6.84 9.18 2H5a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2"
														/>
													</svg>
												</span>
											</button>
										{/if}
									</div>
								</section>
							{/if}

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
