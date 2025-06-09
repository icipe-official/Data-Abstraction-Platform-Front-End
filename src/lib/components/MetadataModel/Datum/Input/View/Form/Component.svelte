<!--
@Component

Props:
-
-->
<script lang="ts">
	import { Domain, MetadataModel, Utils } from '$lib'
	import { Pagination } from '$lib/components/Pagination'

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
		formcolumncontentperpage?: number
		formentrycontentperpage?: number
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
		formcolumncontentperpage = 5,
		formentrycontentperpage = 1,
		tablecolumncontentperpage,
		tablerowcontentperpage,
		columnfieldcontentperpage,
		stickyheaderoffset = 0,
		stickyfooteroffset = 0,
		stickythreshold = 0.3,
		switchbackground = false,
		rootelement = undefined
	}: Props = $props()

	let groupKey: string = $derived(group[MetadataModel.FgProperties.FIELD_GROUP_KEY])

	let noOfColumnFields: number = $derived.by(() => {
		if (Array.isArray(group[MetadataModel.FgProperties.GROUP_READ_ORDER_OF_FIELDS])) {
			return group[MetadataModel.FgProperties.GROUP_READ_ORDER_OF_FIELDS].length
		}

		return 0
	})
	let columnFieldsStart: number = $state(0)
	let columnFieldsEnd: number = $state(0)

	let showColumPagination: boolean = $derived(noOfColumnFields > formcolumncontentperpage)

	let noOfEntries: number = $derived.by(() => {
		const groupData = getdata(groupKey, arrayindexplaceholders)

		if (Array.isArray(groupData)) {
			return groupData.length
		}

		return 1
	})
	$effect(() => {
		let groupData = getdata(groupKey, arrayindexplaceholders)

		if (Array.isArray(groupData)) {
			groupData = groupData.filter((gd) => gd !== null && typeof gd === 'object' && !Array.isArray(gd) && Object.keys(gd).length > 0)
			if (groupData.length === 0) {
				deletedata(groupKey, arrayindexplaceholders)
			}
		}
	})
	let entriesStart: number = $state(0)
	let entriesEnd: number = $state(0)

	let showEntriesPagination: boolean = $derived(group[MetadataModel.FgProperties.FIELD_GROUP_MAX_ENTRIES] !== 1 || noOfEntries > 1)

	let groupHeaderHeight: number = $state(0)

	let groupFooterHeight: number = $state(0)

	let windowHeight: number = $state(0)

	let showGroupDescription: boolean = $state(false)

	let showMenu: boolean = $state(false)

	let showJson: boolean = $state(false)

	let mainScrollElement: Element | undefined = $state(undefined)

	let root: boolean = $derived(typeof rootelement === 'undefined')
</script>

<svelte:window bind:innerHeight={windowHeight} />

<div
	class="flex flex-col p-4 {root ? 'overflow-hidden' : ''} {theme === Domain.Entities.Theme.Theme.DARK
		? switchbackground
			? 'border-gray-950 bg-gray-800'
			: 'border-gray-900 bg-gray-700'
		: switchbackground
			? 'border-gray-500 bg-gray-300'
			: 'border-gray-400 bg-gray-200'} w-full"
>
	<header
		class="z-[3] flex flex-col gap-y-2 {theme === Domain.Entities.Theme.Theme.DARK
			? switchbackground
				? 'border-gray-950 bg-gray-800'
				: 'border-gray-900 bg-gray-700'
			: switchbackground
				? 'border-gray-500 bg-gray-300'
				: 'border-gray-400 bg-gray-200'}"
		style="position: sticky; top: {stickyheaderoffset}px; bottom: {stickyfooteroffset}px;"
		bind:clientHeight={groupHeaderHeight}
	>
		<section class="flex justify-between">
			<div class="flex gap-x-1">
				<div class="flex h-fit gap-x-2 self-center">
					<button class="join-item btn btn-sm btn-ghost btn-square" onclick={() => (showMenu = !showMenu)} aria-label="Show/Collapse Menu">
						<!--mdi:dots-vertical source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24">
							<path
								fill="var({Utils.Theme.GetColor(themecolor)})"
								d="M12 16a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2a2 2 0 0 1 2-2m0-6a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2a2 2 0 0 1 2-2m0-6a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2a2 2 0 0 1 2-2"
							/>
						</svg>
					</button>

					<div class="self-center text-xl">
						{MetadataModel.GetFieldGroupName(group)}{noOfEntries > 1 ? ` (${entriesStart + 1}/${noOfEntries})` : ''}
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

			<div class="h-fit self-center">
				<Pagination
					{themecolor}
					lengthofdata={noOfColumnFields}
					start={columnFieldsStart}
					end={columnFieldsEnd}
					updatestart={(n) => {
						columnFieldsStart = n
					}}
					updateend={(n) => {
						columnFieldsEnd = n
					}}
					{telemetry}
					contentperpage={formcolumncontentperpage}
					displayiflengthofdatagreaterthancontentperpage={!showColumPagination}
				></Pagination>
			</div>
		</section>

		{#if showMenu}
			<div
				class="rounded-md  shadow-inner shadow-gray-800 {theme === Domain.Entities.Theme.Theme.DARK
					? 'bg-gray-600 text-white'
					: 'bg-gray-300 text-black'} flex w-fit flex-col gap-y-2 p-1"
			>
				<button
					class="join-item btn btn-md btn-ghost"
					onclick={() => {
						group[MetadataModel.FgProperties.DATUM_INPUT_VIEW] = MetadataModel.DView.TABLE
						updatefieldgroup(group)
					}}
					aria-label="switch to table view"
				>
					switch to table view
				</button>

				<button class="join-item btn btn-md btn-ghost" onclick={() => (showJson = !showJson)} aria-label="View JSON">
					view data as json
					<!--mdi:code-json source: https://icon-sets.iconify.design-->
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
						<path
							fill={theme === Domain.Entities.Theme.Theme.DARK ? 'white':'black'}
							d="M5 3h2v2H5v5a2 2 0 0 1-2 2a2 2 0 0 1 2 2v5h2v2H5c-1.07-.27-2-.9-2-2v-4a2 2 0 0 0-2-2H0v-2h1a2 2 0 0 0 2-2V5a2 2 0 0 1 2-2m14 0a2 2 0 0 1 2 2v4a2 2 0 0 0 2 2h1v2h-1a2 2 0 0 0-2 2v4a2 2 0 0 1-2 2h-2v-2h2v-5a2 2 0 0 1 2-2a2 2 0 0 1-2-2V5h-2V3zm-7 12a1 1 0 0 1 1 1a1 1 0 0 1-1 1a1 1 0 0 1-1-1a1 1 0 0 1 1-1m-4 0a1 1 0 0 1 1 1a1 1 0 0 1-1 1a1 1 0 0 1-1-1a1 1 0 0 1 1-1m8 0a1 1 0 0 1 1 1a1 1 0 0 1-1 1a1 1 0 0 1-1-1a1 1 0 0 1 1-1"
						/>
					</svg>
					{#if showJson}
						<!--mdi:close-circle source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24">
							<path
								fill={theme === Domain.Entities.Theme.Theme.DARK ? 'white':'black'}
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
	</header>

	<div class="divider"></div>

	<main class="z-[1] flex flex-1 flex-col {root ? 'h-full overflow-auto' : 'min-h-fit'} gap-y-4" bind:this={mainScrollElement}>
		{#if showJson}
			<pre
				class="h-fit w-full flex-1 rounded-md {theme === Domain.Entities.Theme.Theme.DARK
					? 'bg-gray-500'
					: 'bg-gray-700'} p-1 text-white shadow-inner shadow-gray-800"><code
					>{JSON.stringify(getdata(groupKey, arrayindexplaceholders), null, 4)}</code
				></pre>
		{:else if MetadataModel.IsGroupFieldContainsGroup(group) && MetadataModel.IsGroupReadOrderOfFieldsValid(group[MetadataModel.FgProperties.GROUP_READ_ORDER_OF_FIELDS])}
			{#each Utils.Range(entriesStart, Utils.RangeArrayEnd(entriesEnd, noOfEntries)) as eIndex (eIndex)}
				{#each Utils.Range(columnFieldsStart, Utils.RangeArrayEnd(columnFieldsEnd, noOfColumnFields)) as cfIndex (cfIndex)}
					{@const fg = group[MetadataModel.FgProperties.GROUP_FIELDS][0][group[MetadataModel.FgProperties.GROUP_READ_ORDER_OF_FIELDS][cfIndex]]}

					{#if fg}
						{#if MetadataModel.IsGroupFieldAField(fg)}
							{#await import('./Field/Component.svelte') then { default: Field }}
								<Field
									field={fg}
									arrayindexplaceholders={[...arrayindexplaceholders, eIndex]}
									{themecolor}
									{theme}
									{updatefieldgroup}
									{getdata}
									{updatedata}
									{deletedata}
									{copiedcutfieldgroupkey}
									{setcopiedfieldgroupkey}
									{setcutfieldgroupdata}
									{pastefieldgroupdata}
									{telemetry}
									contentperpage={columnfieldcontentperpage}
									switchbackground={!switchbackground}
								></Field>
							{/await}
						{/if}

						{#if MetadataModel.IsGroupFieldContainsGroup(fg)}
							{#await import('../Component.svelte') then { default: View }}
								<View
									group={fg}
									arrayindexplaceholders={[...arrayindexplaceholders, eIndex]}
									themecolor={Utils.Theme.GetNextColorA(themecolor)}
									{theme}
									{updatefieldgroup}
									{getdata}
									{updatedata}
									{deletedata}
									{copiedcutfieldgroupkey}
									{setcopiedfieldgroupkey}
									{setcutfieldgroupdata}
									{pastefieldgroupdata}
									{telemetry}
									{formcolumncontentperpage}
									{formentrycontentperpage}
									{tablecolumncontentperpage}
									{tablerowcontentperpage}
									{columnfieldcontentperpage}
									stickyheaderoffset={stickyheaderoffset > stickythreshold * windowHeight || root
										? stickyheaderoffset
										: stickyheaderoffset + groupHeaderHeight}
									stickyfooteroffset={stickyfooteroffset > stickythreshold * windowHeight || root
										? stickyfooteroffset
										: stickyfooteroffset + groupFooterHeight}
									{stickythreshold}
									switchbackground={!switchbackground}
									rootelement={root ? mainScrollElement : rootelement}
								></View>
							{/await}
						{/if}
					{/if}
				{/each}
			{/each}
		{:else}
			<div class="text-error">group not valid</div>
		{/if}
	</main>

	{#if !root && showEntriesPagination}
		<div class="divider"></div>
	{/if}

	<footer
		class="z-[2] flex justify-between gap-y-1 pb-2 pt-2 {theme === Domain.Entities.Theme.Theme.DARK
			? switchbackground
				? 'border-gray-950 bg-gray-800'
				: 'border-gray-900 bg-gray-700'
			: switchbackground
				? 'border-gray-500 bg-gray-300'
				: 'border-gray-400 bg-gray-200'}"
		style="position:sticky; bottom: {stickyfooteroffset}px; top: {stickyheaderoffset + groupHeaderHeight}px;"
		bind:clientHeight={groupFooterHeight}
	>
		{#if showEntriesPagination}
			<div class="join">
				<button
					class="join-item btn btn-sm tooltip tooltip-right self-center {themecolor === Domain.Entities.Theme.Color.PRIMARY
						? 'btn-primary tooltip-primary'
						: themecolor === Domain.Entities.Theme.Color.SECONDARY
							? 'btn-secondary tooltip-secondary'
							: 'btn-accent tooltip-accent'}"
					onclick={() => {
						deletedata(`${groupKey}${MetadataModel.ARRAY_INDEX_PLACEHOLDER}`, [...arrayindexplaceholders, entriesStart])
					}}
					data-tip="delete '{MetadataModel.GetFieldGroupName(group)}' entry '{entriesStart + 1}'"
				>
					<!--mdi:plus-circle source: https://icon-sets.iconify.design-->
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
						<path
							fill="var({Utils.Theme.GetColorContent(themecolor)})"
							d="M17 13H7v-2h10m-5-9A10 10 0 0 0 2 12a10 10 0 0 0 10 10a10 10 0 0 0 10-10A10 10 0 0 0 12 2"
						/>
					</svg>
				</button>

				<button
					class="join-item btn btn-sm tooltip tooltip-right self-center {themecolor === Domain.Entities.Theme.Color.PRIMARY
						? 'btn-primary tooltip-primary'
						: themecolor === Domain.Entities.Theme.Color.SECONDARY
							? 'btn-secondary tooltip-secondary'
							: 'btn-accent tooltip-accent'}"
					onclick={() => {
						noOfEntries += 1
					}}
					data-tip="add new '{MetadataModel.GetFieldGroupName(group)}' entry"
				>
					<!--mdi:plus-circle source: https://icon-sets.iconify.design-->
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
						<path
							fill="var({Utils.Theme.GetColorContent(themecolor)})"
							d="M17 13h-4v4h-2v-4H7v-2h4V7h2v4h4m-5-9A10 10 0 0 0 2 12a10 10 0 0 0 10 10a10 10 0 0 0 10-10A10 10 0 0 0 12 2"
						/>
					</svg>
				</button>
			</div>
		{/if}

		<div class="h-fit self-center">
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
				contentperpage={1}
				displayiflengthofdatagreaterthancontentperpage={!showEntriesPagination}
			></Pagination>
		</div>
	</footer>
</div>
