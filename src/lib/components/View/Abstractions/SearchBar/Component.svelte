<script lang="ts">
	import { Domain, Json, MetadataModel, Utils } from '$lib'

	const COMPONENT_NAME = 'view-abstractions-search-bar'

	interface Props {
		themecolor?: Domain.Entities.Theme.Color
		theme?: Domain.Entities.Theme.Theme
		telemetry?: Domain.Interfaces.ITelemetry
		metadatamodel: any
		querycondition?: MetadataModel.QueryConditions
		updatequerycondition?: (value: MetadataModel.QueryConditions) => void
		showquerypanel?: () => void
		search?: () => void
		searchtitle?: string
		joindepth?: number
		authcontextdirectorygroupid?: string
		viewdatasearch?: Domain.Interfaces.MetadataModels.ViewDataSearch
		updateviewdatasearch?: (value: Domain.Interfaces.MetadataModels.ViewDataSearch) => void
	}

	let {
		themecolor = Domain.Entities.Theme.Color.PRIMARY,
		theme = Domain.Entities.Theme.Theme.LIGHT,
		telemetry = undefined,
		metadatamodel,
		querycondition = {},
		updatequerycondition = undefined,
		showquerypanel = undefined,
		search = undefined,
		searchtitle = 'Search by abstractions tags, or abstraction information...',
		joindepth = 0,
		authcontextdirectorygroupid = undefined,
		viewdatasearch = {},
		updateviewdatasearch = undefined
	}: Props = $props()

	let viewQueryCondition: MetadataModel.QueryConditions = $derived(JSON.parse(JSON.stringify(querycondition)))

	let abstractionsQCKey = $derived(
		Utils.MetadataModel.GetGroupQueryPropertiesByDatabaseProperties(metadatamodel, Domain.Entities.Abstractions.RepositoryName, joindepth)
	)
	let abstractionsFullTextSearchQuery: string = $derived.by(() => {
		if (abstractionsQCKey) {
			if (viewQueryCondition[abstractionsQCKey.qcKey]) {
				return viewQueryCondition[abstractionsQCKey.qcKey][MetadataModel.QcProperties.D_FULL_TEXT_SEARCH_QUERY] || ''
			}
		}

		return ''
	})

	let storageFilesQCKey = $derived(
		Utils.MetadataModel.GetGroupQueryPropertiesByDatabaseProperties(metadatamodel, Domain.Entities.StorageFiles.RepositoryName, joindepth + 1)
	)
	let storageFilesFullTextSearchQuery: string = $derived.by(() => {
		if (storageFilesQCKey) {
			if (viewQueryCondition[storageFilesQCKey.qcKey]) {
				return viewQueryCondition[storageFilesQCKey.qcKey][MetadataModel.QcProperties.D_FULL_TEXT_SEARCH_QUERY] || ''
			}
		}

		return ''
	})

	let directoryQCKey = $derived(
		Utils.MetadataModel.GetGroupQueryPropertiesByDatabaseProperties(metadatamodel, Domain.Entities.Directory.RepositoryName, joindepth + 1)
	)
	let directoryFullTextSearchQuery: string = $derived.by(() => {
		if (directoryQCKey) {
			if (viewQueryCondition[directoryQCKey.qcKey]) {
				return viewQueryCondition[directoryQCKey.qcKey][MetadataModel.QcProperties.D_FULL_TEXT_SEARCH_QUERY] || ''
			}
		}

		return ''
	})

	let metadataModelsQCKey = $derived(
		Utils.MetadataModel.GetGroupQueryPropertiesByDatabaseProperties(metadatamodel, Domain.Entities.DirectoryGroups.RepositoryName, joindepth + 2)
	)
	let metadataModelsFullTextSearchQuery: string = $derived.by(() => {
		if (metadataModelsQCKey) {
			if (viewQueryCondition[metadataModelsQCKey.qcKey]) {
				return viewQueryCondition[metadataModelsQCKey.qcKey][MetadataModel.QcProperties.D_FULL_TEXT_SEARCH_QUERY] || ''
			}
		}

		return ''
	})

	let directoryGroupsQCKey = $derived(
		Utils.MetadataModel.GetGroupQueryPropertiesByDatabaseProperties(metadatamodel, Domain.Entities.DirectoryGroups.RepositoryName, joindepth + 2)
	)
	let directoryGroupsFullTextSearchQuery: string = $derived.by(() => {
		if (directoryGroupsQCKey) {
			if (viewQueryCondition[directoryGroupsQCKey.qcKey]) {
				return viewQueryCondition[directoryGroupsQCKey.qcKey][MetadataModel.QcProperties.D_FULL_TEXT_SEARCH_QUERY] || ''
			}
		}

		return ''
	})
	function onupdatequerycondition() {
		if (updatequerycondition) {
			updatequerycondition(viewQueryCondition)
		}
	}

	function initQueryCondition(qcKey: string, databaseCollectionUid?: string, tableCollectionName?: string, fieldColumnName?: string) {
		if (!viewQueryCondition[qcKey]) {
			viewQueryCondition[qcKey] = {}
			if (databaseCollectionUid) {
				viewQueryCondition[qcKey][MetadataModel.QcProperties.D_TABLE_COLLECTION_UID] = databaseCollectionUid
			}

			if (tableCollectionName) {
				viewQueryCondition[qcKey][MetadataModel.QcProperties.D_TABLE_COLLECTION_NAME] = tableCollectionName
			}

			if (fieldColumnName) {
				viewQueryCondition[qcKey][MetadataModel.QcProperties.D_FIELD_COLUMN_NAME] = fieldColumnName
			}
		}
	}

	let showFilterPanel: boolean = $state(false)

	let windowWidth: number = $state(0)

	let completedQCKey = $derived(
		Utils.MetadataModel.GetFieldQueryPropertiesByDatabaseProperties(
			metadatamodel,
			Domain.Entities.Abstractions.FieldColumn.Completed,
			Domain.Entities.Abstractions.RepositoryName,
			joindepth
		)
	)
	let completed: boolean | undefined = $derived.by(() => {
		if (completedQCKey) {
			const queryCondtion = viewQueryCondition[completedQCKey.qcKey]
			if (queryCondtion) {
				const value = Json.GetValueInObject(
					queryCondtion,
					`${MetadataModel.QcProperties.FG_FILTER_CONDITION}[0][0].${MetadataModel.FConditionProperties.VALUE}.${MetadataModel.FSelectProperties.VALUE}`
				)

				if (typeof value === 'boolean') {
					return value
				}
			}
		}

		return undefined
	})
	function handleUpdateCompleted() {
		if (!completedQCKey) {
			return
		}
		if (completed === true) {
			completed = false
		} else if (completed == false) {
			completed = undefined
		} else {
			completed = true
		}

		if (typeof completed === 'boolean') {
			viewQueryCondition[completedQCKey.qcKey] = {
				[MetadataModel.QcProperties.D_TABLE_COLLECTION_UID]: completedQCKey.fieldGroup[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_UID],
				[MetadataModel.QcProperties.D_FIELD_COLUMN_NAME]: completedQCKey.fieldGroup[MetadataModel.FgProperties.DATABASE_FIELD_COLUMN_NAME],
				[MetadataModel.QcProperties.FG_FILTER_CONDITION]: [
					[
						{
							[MetadataModel.FConditionProperties.NEGATE]: false,
							[MetadataModel.FConditionProperties.CONDITION]: MetadataModel.FilterCondition.EQUAL_TO,
							[MetadataModel.FConditionProperties.VALUE]: {
								[MetadataModel.FSelectProperties.TYPE]: MetadataModel.FieldType.BOOLEAN,
								[MetadataModel.FSelectProperties.VALUE]: completed
							}
						}
					]
				]
			}
		} else {
			delete viewQueryCondition[completedQCKey.qcKey]
		}

		onupdatequerycondition()
	}

	let reviewedQCKey = $derived(
		Utils.MetadataModel.GetFieldQueryPropertiesByDatabaseProperties(
			metadatamodel,
			Domain.Entities.Abstractions.FieldColumn.ReviewPass,
			Domain.Entities.Abstractions.RepositoryName,
			joindepth
		)
	)
	let reviewed: boolean | undefined = $derived.by(() => {
		if (reviewedQCKey) {
			const queryCondtion = viewQueryCondition[reviewedQCKey.qcKey]
			if (queryCondtion) {
				const value = Json.GetValueInObject(
					queryCondtion,
					`${MetadataModel.QcProperties.FG_FILTER_CONDITION}[0][0].${MetadataModel.FConditionProperties.VALUE}.${MetadataModel.FSelectProperties.VALUE}`
				)

				if (typeof value === 'boolean') {
					return value
				}
			}
		}

		return undefined
	})
	function handleUpdateReviewed() {
		if (!reviewedQCKey) {
			return
		}
		if (reviewed === true) {
			reviewed = false
		} else if (reviewed == false) {
			reviewed = undefined
		} else {
			reviewed = true
		}

		if (typeof reviewed === 'boolean') {
			viewQueryCondition[reviewedQCKey.qcKey] = {
				[MetadataModel.QcProperties.D_TABLE_COLLECTION_UID]: reviewedQCKey.fieldGroup[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_UID],
				[MetadataModel.QcProperties.D_FIELD_COLUMN_NAME]: reviewedQCKey.fieldGroup[MetadataModel.FgProperties.DATABASE_FIELD_COLUMN_NAME],
				[MetadataModel.QcProperties.FG_FILTER_CONDITION]: [
					[
						{
							[MetadataModel.FConditionProperties.NEGATE]: false,
							[MetadataModel.FConditionProperties.CONDITION]: MetadataModel.FilterCondition.EQUAL_TO,
							[MetadataModel.FConditionProperties.VALUE]: {
								[MetadataModel.FSelectProperties.TYPE]: MetadataModel.FieldType.BOOLEAN,
								[MetadataModel.FSelectProperties.VALUE]: reviewed
							}
						}
					]
				]
			}
		} else {
			delete viewQueryCondition[reviewedQCKey.qcKey]
		}

		onupdatequerycondition()
	}

	let dataQCKey = $derived(
		Utils.MetadataModel.GetFieldQueryPropertiesByDatabaseProperties(
			metadatamodel,
			Domain.Entities.Abstractions.FieldColumn.Data,
			Domain.Entities.Abstractions.RepositoryName,
			joindepth
		)
	)
</script>

<svelte:window bind:innerWidth={windowWidth} />

<div class="flex h-fit {abstractionsQCKey ? 'w-full' : 'w-fit'} flex-col">
	<section
		class="join flex flex-1 rounded-lg border p-2 {themecolor === Domain.Entities.Theme.Color.PRIMARY
			? 'border-primary'
			: themecolor === Domain.Entities.Theme.Color.SECONDARY
				? 'border-secondary'
				: 'border-accent'}"
	>
		{#if abstractionsQCKey}
			<input
				class="join-item input input-ghost input-sm flex-[9.5] border-0 border-none outline-none"
				type="search"
				placeholder={searchtitle}
				value={abstractionsFullTextSearchQuery}
				oninput={(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
					if (e.currentTarget.value.length > 0) {
						initQueryCondition(
							abstractionsQCKey.qcKey,
							abstractionsQCKey.fieldGroup[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_UID],
							abstractionsQCKey.fieldGroup[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_NAME]
						)
						viewQueryCondition[abstractionsQCKey.qcKey][MetadataModel.QcProperties.D_FULL_TEXT_SEARCH_QUERY] = e.currentTarget.value
					} else {
						delete viewQueryCondition[abstractionsQCKey.qcKey]
					}
					onupdatequerycondition()
				}}
			/>
		{/if}

		<button class="join-item btn btn-sm btn-ghost" onclick={() => (showFilterPanel = !showFilterPanel)} aria-label="Show Query Panel">
			<!--mdi:filter-plus source: https://icon-sets.iconify.design-->
			<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
				<path
					fill="var({Utils.Theme.GetColor(themecolor)})"
					d="M12 12v7.88c.04.3-.06.62-.29.83a.996.996 0 0 1-1.41 0L8.29 18.7a.99.99 0 0 1-.29-.83V12h-.03L2.21 4.62a1 1 0 0 1 .17-1.4c.19-.14.4-.22.62-.22h14c.22 0 .43.08.62.22a1 1 0 0 1 .17 1.4L12.03 12zm3 5h3v-3h2v3h3v2h-3v3h-2v-3h-3z"
				/>
			</svg>
		</button>

		{#if search}
			<button class="join-item btn btn-sm btn-ghost" onclick={search} aria-label="Search Data">
				<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
					<path
						fill="var({Utils.Theme.GetColor(themecolor)})"
						d="M9.5 3A6.5 6.5 0 0 1 16 9.5c0 1.61-.59 3.09-1.56 4.23l.27.27h.79l5 5l-1.5 1.5l-5-5v-.79l-.27-.27A6.52 6.52 0 0 1 9.5 16A6.5 6.5 0 0 1 3 9.5A6.5 6.5 0 0 1 9.5 3m0 2C7 5 5 7 5 9.5S7 14 9.5 14S14 12 14 9.5S12 5 9.5 5"
					/>
				</svg>
			</button>
		{/if}
	</section>

	{#if showFilterPanel}
		<div class="relative w-full">
			<div
				class="absolute w-full {theme === Domain.Entities.Theme.Theme.DARK
					? 'bg-base-200'
					: 'bg-white'} flex flex-col gap-y-6 rounded-lg p-2 shadow-md shadow-gray-800"
			>
				<section class="flex flex-1 flex-col gap-y-2">
					<section class="flex gap-x-4">
						{#if completedQCKey}
							<span class="flex gap-x-1">
								<span class="self-center font-bold italic">Completed?</span>
								<button class="btn btn-md btn-circle self-center" onclick={handleUpdateCompleted} aria-label="Set Completed status">
									{#if completed === true}
										<!--mdi:check-circle source: https://icon-sets.iconify.design-->
										<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
											<path
												fill="var({Utils.Theme.GetColor(themecolor)})"
												d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10s10-4.5 10-10S17.5 2 12 2m-2 15l-5-5l1.41-1.41L10 14.17l7.59-7.59L19 8z"
											/>
										</svg>
									{:else if completed === false}
										<!--mdi:close-circle source: https://icon-sets.iconify.design-->
										<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
											<path
												fill="var({Utils.Theme.GetColor(themecolor)})"
												d="M12 2c5.53 0 10 4.47 10 10s-4.47 10-10 10S2 17.53 2 12S6.47 2 12 2m3.59 5L12 10.59L8.41 7L7 8.41L10.59 12L7 15.59L8.41 17L12 13.41L15.59 17L17 15.59L13.41 12L17 8.41z"
											/>
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
							</span>
						{/if}

						{#if reviewedQCKey}
							<span class="flex gap-x-1">
								<span class="self-center font-bold italic">Checks Passed?</span>
								<button class="btn btn-md btn-circle self-center" onclick={handleUpdateReviewed} aria-label="Set reviewed status">
									{#if reviewed === true}
										<!--mdi:check-circle source: https://icon-sets.iconify.design-->
										<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
											<path
												fill="var({Utils.Theme.GetColor(themecolor)})"
												d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10s10-4.5 10-10S17.5 2 12 2m-2 15l-5-5l1.41-1.41L10 14.17l7.59-7.59L19 8z"
											/>
										</svg>
									{:else if reviewed === false}
										<!--mdi:close-circle source: https://icon-sets.iconify.design-->
										<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
											<path
												fill="var({Utils.Theme.GetColor(themecolor)})"
												d="M12 2c5.53 0 10 4.47 10 10s-4.47 10-10 10S2 17.53 2 12S6.47 2 12 2m3.59 5L12 10.59L8.41 7L7 8.41L10.59 12L7 15.59L8.41 17L12 13.41L15.59 17L17 15.59L13.41 12L17 8.41z"
											/>
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
							</span>
						{/if}
					</section>

					{#if storageFilesQCKey}
						<label class="input w-full">
							{#if windowWidth > 1000}
								<span class="label">Files Search</span>
							{/if}
							<input
								class="input-lg w-full"
								type="search"
								placeholder="Search by file name, tags..."
								value={storageFilesFullTextSearchQuery}
								oninput={(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
									if (e.currentTarget.value.length > 0) {
										initQueryCondition(
											storageFilesQCKey.qcKey,
											storageFilesQCKey.fieldGroup[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_UID],
											storageFilesQCKey.fieldGroup[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_NAME]
										)
										viewQueryCondition[storageFilesQCKey.qcKey][MetadataModel.QcProperties.D_FULL_TEXT_SEARCH_QUERY] = e.currentTarget.value
									} else {
										delete viewQueryCondition[storageFilesQCKey.qcKey]
									}
									onupdatequerycondition()
								}}
							/>
						</label>
					{/if}

					{#if metadataModelsQCKey}
						<label class="input w-full">
							{#if windowWidth > 1000}
								<span class="label">Models Search</span>
							{/if}
							<input
								class="input-lg w-full"
								type="search"
								placeholder="Search by models name, description, tags..."
								value={metadataModelsFullTextSearchQuery}
								oninput={(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
									if (e.currentTarget.value.length > 0) {
										initQueryCondition(
											metadataModelsQCKey.qcKey,
											metadataModelsQCKey.fieldGroup[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_UID],
											metadataModelsQCKey.fieldGroup[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_NAME]
										)
										viewQueryCondition[metadataModelsQCKey.qcKey][MetadataModel.QcProperties.D_FULL_TEXT_SEARCH_QUERY] = e.currentTarget.value
									} else {
										delete viewQueryCondition[metadataModelsQCKey.qcKey]
									}
									onupdatequerycondition()
								}}
							/>
						</label>
					{/if}

					{#if directoryQCKey}
						<label class="input w-full">
							{#if windowWidth > 1000}
								<span class="label">Directory Search</span>
							{/if}
							<input
								class="input-lg w-full"
								type="search"
								placeholder="Search by directory name, or directory data..."
								value={directoryFullTextSearchQuery}
								oninput={(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
									if (e.currentTarget.value.length > 0) {
										initQueryCondition(
											directoryQCKey.qcKey,
											directoryQCKey.fieldGroup[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_UID],
											directoryQCKey.fieldGroup[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_NAME]
										)
										viewQueryCondition[directoryQCKey.qcKey][MetadataModel.QcProperties.D_FULL_TEXT_SEARCH_QUERY] = e.currentTarget.value
									} else {
										delete viewQueryCondition[directoryQCKey.qcKey]
									}
									onupdatequerycondition()
								}}
							/>
						</label>
					{/if}

					{#if directoryGroupsQCKey}
						<label class="input w-full">
							{#if windowWidth > 1000}
								<span class="label">Group Search</span>
							{/if}
							<input
								class="input-lg w-full"
								type="search"
								placeholder="Search by group name, group description, or group data..."
								value={directoryGroupsFullTextSearchQuery}
								oninput={(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
									if (e.currentTarget.value.length > 0) {
										initQueryCondition(
											directoryGroupsQCKey.qcKey,
											directoryGroupsQCKey.fieldGroup[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_UID],
											directoryGroupsQCKey.fieldGroup[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_NAME]
										)
										viewQueryCondition[directoryGroupsQCKey.qcKey][MetadataModel.QcProperties.D_FULL_TEXT_SEARCH_QUERY] = e.currentTarget.value
									} else {
										delete viewQueryCondition[directoryGroupsQCKey.qcKey]
									}
									onupdatequerycondition()
								}}
							/>
						</label>
					{/if}

					{#if dataQCKey}
						{#await import('$lib/components/View/DataSearch/Component.svelte') then { default: DataSearch }}
							<DataSearch {theme} {themecolor} {telemetry} {viewdatasearch} dataqckey={dataQCKey} {updateviewdatasearch} {authcontextdirectorygroupid}
							></DataSearch>
						{/await}
					{/if}
				</section>

				{#if showquerypanel}
					<button
						class="join-item btn btn-sm btn-ghost italic"
						onclick={() => {
							showquerypanel()
							showFilterPanel = false
						}}
						aria-label="Show Query Panel"
					>
						...view more...
					</button>
				{/if}
			</div>
		</div>
	{/if}
</div>
