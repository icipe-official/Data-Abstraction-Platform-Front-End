<script lang="ts">
	import { Domain, State, Interfaces, Utils, Component } from '$lib'
	import { getContext, onMount, untrack } from 'svelte'
	import type { PageProps } from './$types'
	import { goto } from '$app/navigation'
	import { ModelInformationTab, Tab } from './util'

	const COMPONENT_NAME = 'storage-file-page'

	let { data }: PageProps = $props()

	let telemetry: Domain.Interfaces.ITelemetry | undefined = $derived.by(() => {
		return getContext(State.TelemetryContext.value)
	})

	let authContextDirectoryGroupID = $derived(data.directory_group_id)

	//@ts-expect-error
	let datum: Domain.Interfaces.StorageFiles.Datum = $state({})

	onMount(() => {
		datum = Interfaces.StorageFiles.Datum({
			authContextDirectoryGroupID: data.directory_group_id,
			fetchedData: {
				metadata_model: JSON.parse(JSON.stringify(data.current_datum?.metadata_model)),
				datum: JSON.parse(JSON.stringify(data.current_datum?.datum))
			},
			telemetry,
			currentDirectoryGroupID: data.directory_group_id!,
			context: COMPONENT_NAME,
			verboseResponse: State.VerboseResponse.value
		})

		if (data.current_datum?.datum) {
			datum.previousDatum = JSON.parse(JSON.stringify(data.current_datum.datum))
		}
	})

	let windowWidth: number = $state(0)

	function handleError(e: any, defaultError?: string) {
		State.Toast.Type = Domain.Entities.Toast.Type.ERROR
		State.Toast.Message = []
		if (defaultError) {
			State.Toast.Message.push(defaultError)
		}
		if (Array.isArray(e) && e.length === 2) {
			State.Toast.Message.push(`${e[0]}->${e[1].message}`)
		} else {
			State.Toast.Message.push(`${500}->${Utils.DEFAULT_FETCH_ERROR}`)
		}
	}

	let currentTab: Tab = $state(Tab.FILE_INFORMATION)
	$effect(() => {
		if (windowWidth > 1000 && currentTab === Tab.VIEW) {
			untrack(() => (currentTab = Tab.FILE_INFORMATION))
		}
	})

	let modelInformationTab: ModelInformationTab = $derived(data.current_datum ? ModelInformationTab.VIEW : ModelInformationTab.EDIT)

	let datumView: Component.View.View = $state('simple')

	let noOfTags: number = $derived(datum.tags?.length)

	let tagsStart: number = $state(0)

	let tagsEnd: number = $state(0)
</script>

<svelte:window bind:innerWidth={windowWidth} />

<div class="flex h-full flex-1 gap-x-2 self-center overflow-hidden pb-1">
	<section
		id="left-section"
		class="flex flex-1 flex-col gap-y-1 overflow-hidden rounded-md shadow-md shadow-gray-800 {State.Theme.value === Domain.Entities.Theme.Theme.DARK
			? 'bg-base-200'
			: 'bg-white'}"
	>
		{#if windowWidth <= 1000}
			<header role="tablist" class="tabs tabs-lift">
				<button
					role="tab"
					class="flex-1 tab{currentTab === Tab.FILE_INFORMATION ? ' tab-active' : ''}"
					onclick={() => (currentTab = Tab.FILE_INFORMATION)}
				>
					File Information
				</button>
				<button role="tab" class="flex-1 tab{currentTab === Tab.VIEW ? ' tab-active' : ''}" onclick={() => (currentTab = Tab.VIEW)}>View File</button>
			</header>
		{/if}

		<main class="flex flex-[9.5] flex-col overflow-hidden pr-2 pl-2">
			{#if currentTab === Tab.FILE_INFORMATION}
				<section class="flex flex-1 flex-col gap-y-4 overflow-hidden">
					{#if modelInformationTab === ModelInformationTab.EDIT}
						<main class="flex flex-1 flex-col gap-y-4 overflow-auto">
							<fieldset
								class="fieldset {State.Theme.value === Domain.Entities.Theme.Theme.DARK
									? 'border-gray-900 bg-gray-700'
									: 'border-gray-300 bg-gray-100'} rounded-box w-full border p-4"
							>
								<legend class="fieldset-legend flex gap-x-2">
									<div class="text-md h-fit self-center">View Properties</div>
								</legend>

								<p class="text-sm">Determines whether other users can see this resource.</p>

								<fieldset
									class="fieldset {State.Theme.value === Domain.Entities.Theme.Theme.DARK
										? 'border-gray-600 bg-gray-600'
										: 'border-gray-300 bg-gray-200'} rounded-box w-full border p-4"
								>
									<legend class="fieldset-legend flex gap-x-2">
										<div class="text-md h-fit self-center">Public</div>
									</legend>

									<input
										class="checkbox {State.ThemeColor.value === Domain.Entities.Theme.Color.PRIMARY
											? 'checkbox-primary'
											: State.ThemeColor.value === Domain.Entities.Theme.Color.SECONDARY
												? 'checkbox-secondary'
												: 'checkbox-accent'}"
										type="checkbox"
										bind:checked={datum.viewUnauthorized}
									/>
								</fieldset>

								<fieldset
									class="fieldset {State.Theme.value === Domain.Entities.Theme.Theme.DARK
										? 'border-gray-600 bg-gray-600'
										: 'border-gray-300 bg-gray-200'} rounded-box w-full border p-4"
								>
									<legend class="fieldset-legend flex gap-x-2">
										<div class="text-md h-fit self-center">Authorized</div>
									</legend>

									<input
										class="checkbox {State.ThemeColor.value === Domain.Entities.Theme.Color.PRIMARY
											? 'checkbox-primary'
											: State.ThemeColor.value === Domain.Entities.Theme.Color.SECONDARY
												? 'checkbox-secondary'
												: 'checkbox-accent'}"
										type="checkbox"
										bind:checked={datum.viewAuthorized}
									/>
								</fieldset>
							</fieldset>

							<fieldset
								class="fieldset {State.Theme.value === Domain.Entities.Theme.Theme.DARK
									? 'border-gray-900 bg-gray-700'
									: 'border-gray-300 bg-gray-100'} rounded-box w-full border p-4"
							>
								<legend class="fieldset-legend flex gap-x-2">
									<div class="text-md h-fit self-center">Edit Properties</div>
								</legend>

								<p class="text-sm">Determines whether other users can edit this resource.</p>

								<fieldset
									class="fieldset {State.Theme.value === Domain.Entities.Theme.Theme.DARK
										? 'border-gray-600 bg-gray-600'
										: 'border-gray-300 bg-gray-200'} rounded-box w-full border p-4"
								>
									<legend class="fieldset-legend flex gap-x-2">
										<div class="text-md h-fit self-center">Public</div>
									</legend>

									<input
										class="checkbox {State.ThemeColor.value === Domain.Entities.Theme.Color.PRIMARY
											? 'checkbox-primary'
											: State.ThemeColor.value === Domain.Entities.Theme.Color.SECONDARY
												? 'checkbox-secondary'
												: 'checkbox-accent'}"
										type="checkbox"
										bind:checked={datum.editUnauthorized}
									/>
								</fieldset>

								<fieldset
									class="fieldset {State.Theme.value === Domain.Entities.Theme.Theme.DARK
										? 'border-gray-600 bg-gray-600'
										: 'border-gray-300 bg-gray-200'} rounded-box w-full border p-4"
								>
									<legend class="fieldset-legend flex gap-x-2">
										<div class="text-md h-fit self-center">Authorized</div>
									</legend>

									<input
										class="checkbox {State.ThemeColor.value === Domain.Entities.Theme.Color.PRIMARY
											? 'checkbox-primary'
											: State.ThemeColor.value === Domain.Entities.Theme.Color.SECONDARY
												? 'checkbox-secondary'
												: 'checkbox-accent'}"
										type="checkbox"
										bind:checked={datum.editAuthorized}
									/>
								</fieldset>
							</fieldset>

							<section
								class="flex flex-col rounded-md {State.Theme.value === Domain.Entities.Theme.Theme.DARK
									? 'border-gray-900 bg-gray-700'
									: 'border-gray-300 bg-gray-100'}"
							>
								<header
									class="sticky top-0 z-[3] p-2 {State.Theme.value === Domain.Entities.Theme.Theme.DARK
										? 'border-gray-900 bg-gray-700'
										: 'border-gray-300 bg-gray-100'} flex justify-between"
								>
									<span class="self-center">Tags</span>

									<span class="gap-x-2">
										<button
											class="btn btn-md btn-circle tooltip tooltip-left self-center {State.ThemeColor.value === Domain.Entities.Theme.Color.PRIMARY
												? 'btn-primary tooltip-primary'
												: State.ThemeColor.value === Domain.Entities.Theme.Color.SECONDARY
													? 'btn-secondary tooltip-secondary'
													: 'btn-accent tooltip-accent'}"
											aria-label="Reset Tags"
											data-tip="Reset tags"
											onclick={() => {
												datum.tags = []
											}}
										>
											<!--mdi:delete source: https://icon-sets.iconify.design-->
											<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
												<path
													fill="var({Utils.Theme.GetColorContent(State.ThemeColor.value)})"
													d="M19 4h-3.5l-1-1h-5l-1 1H5v2h14M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6z"
												/>
											</svg>
										</button>

										<button
											class="btn btn-md btn-circle tooltip tooltip-left self-center {State.ThemeColor.value === Domain.Entities.Theme.Color.PRIMARY
												? 'btn-primary tooltip-primary'
												: State.ThemeColor.value === Domain.Entities.Theme.Color.SECONDARY
													? 'btn-secondary tooltip-secondary'
													: 'btn-accent tooltip-accent'}"
											aria-label="Add New Tag"
											data-tip="Add new tag"
											onclick={() => {
												noOfTags += 1
											}}
										>
											<!--mdi:plus-thick source: https://icon-sets.iconify.design-->
											<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
												<path fill="var({Utils.Theme.GetColorContent(State.ThemeColor.value)})" d="M20 14h-6v6h-4v-6H4v-4h6V4h4v6h6z" />
											</svg>
										</button>
									</span>
								</header>

								<main class="z-[1] flex flex-col gap-y-2 p-2">
									{#each Utils.Range(tagsStart, Utils.RangeArrayEnd(tagsEnd, noOfTags)) as tgsIndex (tgsIndex)}
										<label
											class="input w-full {State.ThemeColor.value === Domain.Entities.Theme.Color.PRIMARY
												? 'input-primary'
												: State.ThemeColor.value === Domain.Entities.Theme.Color.SECONDARY
													? 'input-secondary'
													: 'input-accent'}"
										>
											<span class="label">{tgsIndex + 1}</span>

											<input
												placeholder="Enter tag value..."
												type="text"
												value={datum.tags[tgsIndex]}
												oninput={(event: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
													datum.updateTags(tgsIndex, event.currentTarget.value)
												}}
											/>

											<span class="label">
												<button
													class="btn btn-md btn-ghost"
													aria-label="Delete tag {tgsIndex}"
													onclick={() => {
														datum.deleteTags(tgsIndex)
														if (tgsIndex > datum.tags.length - 1) {
															noOfTags -= 1
														}
													}}
												>
													<!--mdi:delete source: https://icon-sets.iconify.design-->
													<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
														<path
															fill="var({Utils.Theme.GetColor(State.ThemeColor.value)})"
															d="M19 4h-3.5l-1-1h-5l-1 1H5v2h14M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6z"
														/>
													</svg>
												</button>
											</span>
										</label>
									{/each}
								</main>

								<footer
									class="sticky bottom-0 z-[2] flex w-full justify-center {State.Theme.value === Domain.Entities.Theme.Theme.DARK
										? 'border-gray-900 bg-gray-700'
										: 'border-gray-300 bg-gray-100'}"
								>
									<Component.Pagination
										themecolor={State.ThemeColor.value}
										lengthofdata={noOfTags}
										start={tagsStart}
										end={tagsEnd}
										updatestart={(n: number) => (tagsStart = n)}
										updateend={(n: number) => (tagsEnd = n)}
										contentperpage={5}
										displayiflengthofdatagreaterthancontentperpage={true}
									></Component.Pagination>
								</footer>
							</section>
						</main>
					{:else if modelInformationTab === ModelInformationTab.VIEW}
						<main class="z-[1] flex flex-1 flex-col overflow-hidden p-2">
							{#await import('$lib/components/View/Header/Datum/Component.svelte') then { default: ViewHeaderDatum }}
								<ViewHeaderDatum
									title="File Info"
									view={datumView}
									updateview={(value) => (datumView = value)}
									theme={State.Theme.value}
									themecolor={State.ThemeColor.value}
								></ViewHeaderDatum>
							{/await}
							{#await import('$lib/components/View/StorageFiles/Datum/Component.svelte') then { default: Datum }}
								<Datum
									metadatamodel={data.current_datum?.metadata_model}
									data={data.current_datum?.datum}
									theme={State.Theme.value}
									themecolor={State.ThemeColor.value}
									{telemetry}
									view={datumView}
								></Datum>
							{/await}
						</main>
					{/if}

					{#if State.Session.session && data.directory_group_id}
						<footer class="join w-full pb-2">
							{#if (datum.id && datum.update) || datum.delete}
								{#if modelInformationTab === ModelInformationTab.VIEW}
									<button
										class="join-item btn flex-1 {State.ThemeColor.value === Domain.Entities.Theme.Color.PRIMARY
											? 'btn-primary'
											: State.ThemeColor.value === Domain.Entities.Theme.Color.SECONDARY
												? 'btn-secondary'
												: 'btn-accent'}"
										onclick={() => (modelInformationTab = ModelInformationTab.EDIT)}
									>
										<!--mdi:edit source: https://icon-sets.iconify.design-->
										<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
											<path
												fill="var({Utils.Theme.GetColorContent(State.ThemeColor.value)})"
												d="M20.71 7.04c.39-.39.39-1.04 0-1.41l-2.34-2.34c-.37-.39-1.02-.39-1.41 0l-1.84 1.83l3.75 3.75M3 17.25V21h3.75L17.81 9.93l-3.75-3.75z"
											/>
										</svg>

										{#if windowWidth > 768}
											<span class="self-center">edit</span>
										{/if}
									</button>
								{:else if modelInformationTab === ModelInformationTab.EDIT}
									<button
										class="join-item btn flex-1 {State.ThemeColor.value === Domain.Entities.Theme.Color.PRIMARY
											? 'btn-primary'
											: State.ThemeColor.value === Domain.Entities.Theme.Color.SECONDARY
												? 'btn-secondary'
												: 'btn-accent'}"
										onclick={async () => {
											State.Loading.value = `Updating ${Domain.Entities.MetadataModels.RepositoryName}`

											try {
												const toastData = await datum.update!()

												State.Toast.Type = toastData.Type
												State.Toast.Message = toastData.Message
												State.Toast.MedataModelSearchResults = toastData.MedataModelSearchResults
											} catch (e) {
												if (Array.isArray(e)) {
													handleError(e[0], e[1])
												}
											} finally {
												State.Loading.value = undefined
											}
										}}
									>
										<!--mdi:edit source: https://icon-sets.iconify.design-->
										<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
											<path
												fill="var({Utils.Theme.GetColorContent(State.ThemeColor.value)})"
												d="M20.71 7.04c.39-.39.39-1.04 0-1.41l-2.34-2.34c-.37-.39-1.02-.39-1.41 0l-1.84 1.83l3.75 3.75M3 17.25V21h3.75L17.81 9.93l-3.75-3.75z"
											/>
										</svg>
										{#if windowWidth > 768}
											<span class="self-center">update</span>
										{/if}
									</button>

									{@render deletedatum()}
								{/if}
							{/if}

							{#if datum.id && modelInformationTab === ModelInformationTab.EDIT}
								<button
									class="join-item btn flex-[0.5] {State.ThemeColor.value === Domain.Entities.Theme.Color.PRIMARY
										? 'btn-primary'
										: State.ThemeColor.value === Domain.Entities.Theme.Color.SECONDARY
											? 'btn-secondary'
											: 'btn-accent'}"
									onclick={() => (modelInformationTab = ModelInformationTab.VIEW)}
								>
									<!--mdi:close-circle source: https://icon-sets.iconify.design-->
									<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
										><path
											fill="var({Utils.Theme.GetColorContent(State.ThemeColor.value)})"
											d="M12 2c5.53 0 10 4.47 10 10s-4.47 10-10 10S2 17.53 2 12S6.47 2 12 2m3.59 5L12 10.59L8.41 7L7 8.41L10.59 12L7 15.59L8.41 17L12 13.41L15.59 17L17 15.59L13.41 12L17 8.41z"
										/></svg
									>

									{#if windowWidth > 768}
										<span class="self-center">close edit</span>
									{/if}
								</button>
							{/if}
						</footer>
					{/if}
				</section>
			{:else if currentTab === Tab.VIEW}
				{@render view()}
			{:else}
				{@render tabNotImplemented()}
			{/if}
		</main>
	</section>

	{#if windowWidth > 1000}
		<section
			id="left-section"
			class="flex flex-1 flex-col gap-y-1 overflow-hidden rounded-md shadow-md shadow-gray-800 {State.Theme.value === Domain.Entities.Theme.Theme.DARK
				? 'bg-base-200'
				: 'bg-white'}"
		>
			{@render view()}
		</section>
	{/if}
</div>

{#snippet deletedatum()}
	{#if datum.id && typeof datum.delete === 'function' && data.directory_group_id}
		<button
			class="join-item btn flex-1 {State.ThemeColor.value === Domain.Entities.Theme.Color.PRIMARY
				? 'btn-primary'
				: State.ThemeColor.value === Domain.Entities.Theme.Color.SECONDARY
					? 'btn-secondary'
					: 'btn-accent'}"
			onclick={async () => {
				State.Loading.value = `Deleting ${Domain.Entities.MetadataModels.RepositoryName}`
				try {
					const toastData = await datum.delete!()

					State.Toast.Type = toastData.Type
					State.Toast.Message = toastData.Message
					State.Toast.MedataModelSearchResults = toastData.MedataModelSearchResults

					if (toastData.Type === Domain.Entities.Toast.Type.SUCCESS) {
						goto(State.GetGroupNavigationPath(Domain.Entities.Url.WebsitePaths.MetadataModels, data.directory_group_id))
					}
				} catch (e) {
					if (Array.isArray(e)) {
						handleError(e[0], e[1])
					}
				} finally {
					State.Loading.value = undefined
				}
			}}
		>
			<!--mdi:delete source: https://icon-sets.iconify.design-->
			<svg class="self-center" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
				<path
					fill="var({Utils.Theme.GetColorContent(State.ThemeColor.value)})"
					d="M19 4h-3.5l-1-1h-5l-1 1H5v2h14M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6z"
				/>
			</svg>

			{#if windowWidth > 768}
				<span class="self-center">delete</span>
			{/if}
		</button>
	{/if}
{/snippet}

{#snippet view()}
	{#await import('$lib/components/FileView/Component.svelte') then { default: FileView }}
		<FileView
			storagefile={datum.previousDatum}
			authcontextdirectorygroupid={authContextDirectoryGroupID}
			{telemetry}
			theme={State.Theme.value}
			themecolor={State.ThemeColor.value}
		></FileView>
	{/await}
{/snippet}

{#snippet tabNotImplemented()}
	<div class="text-error font-bold">Tab not implemented</div>
{/snippet}
