<script lang="ts">
	import { Component, Domain, Interfaces, MetadataModel, State, Utils } from '$lib'
	import { getContext, onMount, untrack } from 'svelte'
	import { BuildTab, ModelInformationTab, Tab, ViewTab } from './util'
	import Papa from 'papaparse'
	import type { PageProps } from './$types'
	import { goto } from '$app/navigation'

	const COMPONENT_NAME = 'metadata-model-page'

	let { data }: PageProps = $props()

	let telemetry: Domain.Interfaces.ITelemetry | undefined = $derived.by(() => {
		return getContext(State.TelemetryContext.value)
	})

	//@ts-expect-error
	let datum: Domain.Interfaces.MetadataModels.Datum = $state({})

	onMount(() => {
		datum = Interfaces.MetadataModels.Datum({
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

	let noOfTags: number = $derived(datum.tags?.length)

	let tagsStart: number = $state(0)

	let tagsEnd: number = $state(0)

	let currentTab: Tab = $state(Tab.MODEL_INFORMATION)

	let expandRightSection: boolean = $state(false)

	let windowWidth: number = $state(0)

	/**
	 * React to {@linkcode windowWidth} changes.
	 */
	$effect(() => {
		if (windowWidth > 1000) {
			untrack(() => {
				if (currentTab === Tab.VIEW) {
					currentTab = Tab.MODEL_INFORMATION
				}

				if (expandRightSection) {
					expandRightSection = false
				}
			})
		}
	})

	let viewTab: ViewTab = $state(ViewTab.DATUM_INPUT)

	let sampleMetadataModel: any = $derived(datum.data && JSON.parse(JSON.stringify(datum.data)))

	let sampleDataCurrentIndex: number = $state(0)

	let sampleData: any[] = $state([{}])

	let sampleQueryConditions: any[] = $state([])

	let sampleDataShowImportButton = $state(false)

	let sampleDataShowExportButton = $state(false)

	function notification(type: Domain.Entities.Toast.Type, message: string | string[]) {
		State.Toast.Type = type
		State.Toast.Message = message
	}

	let buildTab: BuildTab = $state(BuildTab.BUILD)

	let modelInformationTab: ModelInformationTab = $derived(data.current_datum ? ModelInformationTab.VIEW : ModelInformationTab.EDIT)

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

	let datumView: Component.View.View = $state('simple')
</script>

<svelte:window bind:innerWidth={windowWidth} />

<div class="flex h-full flex-1 gap-x-2 self-center overflow-hidden pb-1">
	{#if !expandRightSection || windowWidth <= 1000}
		<section
			id="left-section"
			class="flex flex-1 flex-col gap-y-1 overflow-hidden rounded-md shadow-md shadow-gray-800 {State.Theme.value === Domain.Entities.Theme.Theme.DARK
				? 'bg-base-200'
				: 'bg-white'}"
		>
			<header role="tablist" class="tabs tabs-lift">
				<button
					role="tab"
					class="flex-1 tab{currentTab === Tab.MODEL_INFORMATION ? ' tab-active' : ''}"
					onclick={() => (currentTab = Tab.MODEL_INFORMATION)}
				>
					Model Information
				</button>
				<button role="tab" class="flex-1 tab{currentTab === Tab.BUILD ? ' tab-active' : ''}" onclick={() => (currentTab = Tab.BUILD)}>Building</button
				>
				{#if windowWidth <= 1000}
					<button role="tab" class="flex-1 tab{currentTab === Tab.VIEW ? ' tab-active' : ''}" onclick={() => (currentTab = Tab.VIEW)}>Viewing</button>
				{/if}
			</header>
			<main class="flex flex-[9.5] flex-col overflow-hidden pl-2 pr-2">
				{#if currentTab === Tab.MODEL_INFORMATION}
					<section class="flex flex-1 flex-col gap-y-4 overflow-hidden">
						{#if modelInformationTab === ModelInformationTab.EDIT}
							<main class="flex flex-1 flex-col gap-y-4 overflow-auto">
								<fieldset
									class="fieldset {State.Theme.value === Domain.Entities.Theme.Theme.DARK
										? 'border-gray-900 bg-gray-700'
										: 'border-gray-300 bg-gray-100'} rounded-box w-full border p-4"
								>
									<legend class="fieldset-legend flex gap-x-2">
										<div class="text-md h-fit self-center">Model Name <span class="font-bold italic">(Required)</span></div>
									</legend>

									<input
										class="input flex-1 {State.ThemeColor.value === Domain.Entities.Theme.Color.PRIMARY
											? 'input-primary'
											: State.ThemeColor.value === Domain.Entities.Theme.Color.SECONDARY
												? 'input-secondary'
												: 'input-accent'} min-h-[48px] w-full"
										placeholder="Enter model name..."
										type="text"
										value={datum.name}
										oninput={(event: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
											datum.updateName(event.currentTarget.value)
										}}
									/>

									{#if Array.isArray(datum.nameError) && datum.nameError.length > 0}
										<ul class="text-md text-error list-inside list-disc">
											{#each datum.nameError as e}
												<li>{e}</li>
											{/each}
										</ul>
									{/if}
								</fieldset>

								<fieldset
									class="fieldset {State.Theme.value === Domain.Entities.Theme.Theme.DARK
										? 'border-gray-900 bg-gray-700'
										: 'border-gray-300 bg-gray-100'} rounded-box w-full border p-4"
								>
									<legend class="fieldset-legend flex gap-x-2">
										<div class="text-md h-fit self-center">Model Description <span class="font-bold italic">(Required)</span></div>
									</legend>

									<textarea
										class="textarea flex-1 {State.ThemeColor.value === Domain.Entities.Theme.Color.PRIMARY
											? 'textarea-primary'
											: State.ThemeColor.value === Domain.Entities.Theme.Color.SECONDARY
												? 'textarea-secondary'
												: 'textarea-accent'} w-full"
										placeholder="Enter model description..."
										value={datum.description}
										oninput={(event: Event & { currentTarget: EventTarget & HTMLTextAreaElement }) => {
											datum.updateDescription(event.currentTarget.value)
										}}
									></textarea>

									{#if Array.isArray(datum.descriptionError) && datum.descriptionError.length > 0}
										<ul class="text-md text-error list-inside list-disc">
											{#each datum.descriptionError as e}
												<li>{e}</li>
											{/each}
										</ul>
									{/if}
								</fieldset>

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
										title="Model Info"
										view={datumView}
										updateview={(value) => (datumView = value)}
										theme={State.Theme.value}
										themecolor={State.ThemeColor.value}
									></ViewHeaderDatum>
								{/await}
								{#await import('$lib/components/View/MetadataModels/Datum/Component.svelte') then { default: Datum }}
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
												if (datum.id && datum.update) {
													State.Loading.value = `Updating ${Domain.Entities.MetadataModels.RepositoryName}`

													try {
														const toastData = await datum.update()

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
												} else {
													if (datum.create) {
														State.Loading.value = `Creating new ${Domain.Entities.MetadataModels.RepositoryName}`

														try {
															const toastData = await datum.create()

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
													}
												}
											}}
										>
											{#if datum.id && datum.update}
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
											{:else if datum.create}
												<!--mdi:add-bold source: https://icon-sets.iconify.design-->
												<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
													<path fill="var({Utils.Theme.GetColorContent(State.ThemeColor.value)})" d="M20 14h-6v6h-4v-6H4v-4h6V4h4v6h6z" />
												</svg>

												{#if windowWidth > 768}
													<span class="self-center">create</span>
												{/if}
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
				{:else if currentTab === Tab.BUILD}
					<button
						class="btn btn-square sticky top-0 z-[2] flex w-full justify-between rounded-none p-2 {State.Theme.value ===
						Domain.Entities.Theme.Theme.DARK
							? 'bg-gray-800'
							: 'bg-gray-100'}"
						onclick={() => (buildTab = BuildTab.BUILD)}
					>
						Build
					</button>

					{#if buildTab === BuildTab.BUILD}
						<section
							class="flex flex-[9] flex-col rounded-md p-1 shadow-inner shadow-gray-800 {State.Theme.value === Domain.Entities.Theme.Theme.DARK
								? 'bg-base-200'
								: 'bg-white'} overflow-hidden"
						>
							{#await import('$lib/components/MetadataModel/Build/Component.svelte') then { default: MetadataModelBuild }}
								<MetadataModelBuild
									metadatamodel={datum.data}
									themecolor={State.ThemeColor.value}
									theme={State.Theme.value}
									contentperpage={5}
									updatemetadatamodel={(value) => {
										datum.data = value
									}}
									{telemetry}
									{notification}
								></MetadataModelBuild>
							{/await}
						</section>
					{/if}

					<button
						class="btn btn-square sticky top-0 z-[2] flex w-full justify-between rounded-none p-2 {State.Theme.value ===
						Domain.Entities.Theme.Theme.DARK
							? 'bg-gray-800'
							: 'bg-gray-100'}"
						onclick={() => (buildTab = BuildTab.UPLOAD)}
					>
						Upload
					</button>

					{#if buildTab === BuildTab.UPLOAD}
						<section class="flex flex-1 flex-col gap-y-4">
							<fieldset
								class="fieldset {State.Theme.value === Domain.Entities.Theme.Theme.DARK
									? 'border-gray-900 bg-gray-700'
									: 'border-gray-300 bg-gray-100'} rounded-box w-full border p-4"
							>
								<legend class="fieldset-legend flex gap-x-2">
									<div class="text-md h-fit self-center">Upload metadata model (JSON)</div>
								</legend>

								<input
									class="join-item file-input {State.ThemeColor.value === Domain.Entities.Theme.Color.PRIMARY
										? 'file-input-primary'
										: State.ThemeColor.value === Domain.Entities.Theme.Color.SECONDARY
											? 'file-input-secondary'
											: 'file-input-accent'} w-full flex-1"
									type="file"
									accept="application/json"
									onchange={async (e: any) => {
										if (e.target.files === null) {
											return
										}

										const fileList = e.target.files as FileList
										if (fileList.item(0)?.type !== 'application/json') {
											return
										}

										const fileText = await fileList.item(0)?.text()
										if (typeof fileText === 'undefined') {
											return
										}
										try {
											datum.data = JSON.parse(fileText)

											State.Toast.Type = Domain.Entities.Toast.Type.SUCCESS
											State.Toast.Message = 'metadata model successfully uploaded'

											State.Toast.MedataModelSearchResults = {
												metadata_model: JSON.parse(fileText),
												data: sampleData
											}

											sampleDataShowImportButton = false
										} catch (e) {
											telemetry?.Log(COMPONENT_NAME, true, Domain.Entities.Telemetry.LogLevel.ERROR, 'Failed to parse json file content', 'error', e)
											State.Toast.Type = Domain.Entities.Toast.Type.ERROR
											State.Toast.Message = 'parse json failed'
										}
									}}
								/>
							</fieldset>

							<button
								class="btn {State.ThemeColor.value === Domain.Entities.Theme.Color.PRIMARY
									? 'btn-primary'
									: State.ThemeColor.value === Domain.Entities.Theme.Color.SECONDARY
										? 'btn-secondary'
										: 'btn-accent'}"
								onclick={() => {
									const objectUrl = URL.createObjectURL(new Blob([JSON.stringify(datum.data)], { type: 'application/json' }))
									const downloadLink = document.createElement('a')
									downloadLink.href = objectUrl
									downloadLink.setAttribute('download', `metadatamodel.json`)
									document.body.appendChild(downloadLink)
									downloadLink.click()
									document.body.removeChild(downloadLink)
									URL.revokeObjectURL(objectUrl)
								}}
							>
								Download metadata model
							</button>
						</section>
					{/if}
				{:else if currentTab === Tab.VIEW}
					{@render view()}
				{:else}
					{@render tabNotImplemented()}
				{/if}
			</main>
		</section>
	{/if}

	{#if windowWidth > 1000}
		<section
			id="right-section"
			class="flex flex-1 flex-col gap-y-1 overflow-hidden rounded-md p-1 shadow-md shadow-gray-800 {State.Theme.value ===
			Domain.Entities.Theme.Theme.DARK
				? 'bg-base-200'
				: 'bg-white'}"
		>
			<header class="flex justify-between">
				<div class="h-fit self-center text-lg font-bold">View metadata-model</div>
				<button
					class="btn btn-circle btn-ghost tooltip tooltip-left {State.ThemeColor.value === Domain.Entities.Theme.Color.PRIMARY
						? 'tooltip-primary'
						: State.ThemeColor.value === Domain.Entities.Theme.Color.SECONDARY
							? 'tooltip-secondary'
							: 'tooltip-accent'} self-center"
					onclick={() => (expandRightSection = !expandRightSection)}
					data-tip="expand/collapse section"
				>
					{#if expandRightSection}
						<!--mdi:expand-vertical source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
							<path
								fill={State.Theme.value === Domain.Entities.Theme.Theme.DARK ? 'white' : 'black'}
								d="M18.17 12L15 8.83l1.41-1.42L21 12l-4.59 4.58L15 15.17zM5.83 12L9 15.17l-1.41 1.42L3 12l4.59-4.58L9 8.83z"
							/>
						</svg>
					{:else}
						<!--mdi:collapse-vertical source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
							<path
								fill={State.Theme.value === Domain.Entities.Theme.Theme.DARK ? 'white' : 'black'}
								d="M5.41 7.41L10 12l-4.59 4.59L4 15.17L7.17 12L4 8.83zm13.18 9.18L14 12l4.59-4.58L20 8.83L16.83 12L20 15.17z"
							/>
						</svg>
					{/if}
				</button>
			</header>

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
	<section class="z-[2] flex justify-between gap-x-1">
		<label
			class="input tooltip tooltip-right {State.ThemeColor.value === Domain.Entities.Theme.Color.PRIMARY
				? 'tooltip-primary'
				: State.ThemeColor.value === Domain.Entities.Theme.Color.SECONDARY
					? 'tooltip-secondary'
					: 'tooltip-accent'} w-fit"
			data-tip="array index of data in sample data"
		>
			<span class="label">current sample data index:</span>

			<input class="input input-ghost input-sm w-full" type="number" min="0" max={sampleData.length} bind:value={sampleDataCurrentIndex} />

			<span class="label">/{sampleData.length}</span>
		</label>

		<section class="join">
			<div class="flex gap-x-1">
				<div class="flex flex-col">
					<button
						class="join-item btn btn-ghost tooltip tooltip-left {State.ThemeColor.value === Domain.Entities.Theme.Color.PRIMARY
							? 'tooltip-primary'
							: State.ThemeColor.value === Domain.Entities.Theme.Color.SECONDARY
								? 'tooltip-secondary'
								: 'tooltip-accent'} h-fit min-h-fit w-fit min-w-fit p-1"
						onclick={() => {
							sampleDataShowExportButton = !sampleDataShowExportButton
						}}
						data-tip="export sample data"
					>
						<!--mdi:download source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
							<path fill={State.Theme.value === Domain.Entities.Theme.Theme.DARK ? 'white' : 'black'} d="M5 20h14v-2H5m14-9h-4V3H9v6H5l7 7z" />
						</svg>
					</button>

					{#if sampleDataShowExportButton}
						<div class="relative z-50">
							<div
								class="absolute right-0 top-0 flex w-fit min-w-[200px] flex-col rounded-md {State.Theme.value === Domain.Entities.Theme.Theme.DARK
									? 'bg-base-300'
									: 'bg-white'} p-1 shadow-md shadow-gray-800"
							>
								<button
									class="btn btn-ghost h-fit min-h-fit w-full min-w-fit p-1"
									onclick={() => {
										const objectUrl = URL.createObjectURL(new Blob([JSON.stringify(sampleData)], { type: 'application/json' }))
										const downloadLink = document.createElement('a')
										downloadLink.href = objectUrl
										downloadLink.setAttribute('download', `sampledata.json`)
										document.body.appendChild(downloadLink)
										downloadLink.click()
										document.body.removeChild(downloadLink)
										URL.revokeObjectURL(objectUrl)
										sampleDataShowExportButton = false
									}}
								>
									json (Nested)
								</button>
								<button
									class="btn btn-ghost h-fit min-h-fit w-full min-w-fit p-1"
									onclick={() => {
										let objectTo2DArray = new MetadataModel.ConvertObjectsTo2DArray(sampleMetadataModel)
										objectTo2DArray.Convert(sampleData)

										const objectUrl = URL.createObjectURL(new Blob([JSON.stringify(objectTo2DArray.Array2D)], { type: 'application/json' }))
										const downloadLink = document.createElement('a')
										downloadLink.href = objectUrl
										downloadLink.setAttribute('download', `sampledata2darray.json`)
										document.body.appendChild(downloadLink)
										downloadLink.click()
										document.body.removeChild(downloadLink)
										URL.revokeObjectURL(objectUrl)
										sampleDataShowExportButton = false
									}}
								>
									json (2D Array)
								</button>
								<button
									class="btn btn-ghost h-fit min-h-fit w-full min-w-fit p-1"
									onclick={() => {
										try {
											let objectTo2DArray = new MetadataModel.ConvertObjectsTo2DArray(sampleMetadataModel)
											objectTo2DArray.Convert(sampleData)
											let dataToParse = objectTo2DArray.Array2D

											let data2DFields = new MetadataModel.Extract2DFields(sampleMetadataModel, true, true, true)
											data2DFields.Extract()
											data2DFields.Reposition()
											dataToParse = [data2DFields.Fields.map((f) => MetadataModel.GetFieldGroupName(f)), ...dataToParse]

											telemetry?.Log(COMPONENT_NAME, false, Domain.Entities.Telemetry.LogLevel.DEBUG, 'sample data csv', dataToParse)

											const objectUrl = URL.createObjectURL(new Blob([Papa.unparse(dataToParse, { header: true })], { type: 'text/csv' }))
											const downloadLink = document.createElement('a')
											downloadLink.href = objectUrl
											downloadLink.setAttribute('download', `sampledata.csv`)
											document.body.appendChild(downloadLink)
											downloadLink.click()
											document.body.removeChild(downloadLink)
											URL.revokeObjectURL(objectUrl)
											sampleDataShowExportButton = false
										} catch (e) {
											telemetry?.Log(COMPONENT_NAME, true, Domain.Entities.Telemetry.LogLevel.ERROR, 'convert sample data to csv failed', 'error', e)
											State.Toast.Type = Domain.Entities.Toast.Type.ERROR
											State.Toast.Message = 'create csv file failed'
										}
									}}
								>
									csv
								</button>
							</div>
						</div>
					{/if}
				</div>
			</div>

			<div class="flex flex-col">
				<button
					class="join-item btn btn-ghost tooltip tooltip-left {State.ThemeColor.value === Domain.Entities.Theme.Color.PRIMARY
						? 'tooltip-primary'
						: State.ThemeColor.value === Domain.Entities.Theme.Color.SECONDARY
							? 'tooltip-secondary'
							: 'tooltip-accent'}h-fit min-h-fit w-fit min-w-fit p-1"
					onclick={() => {
						sampleDataShowImportButton = !sampleDataShowImportButton
					}}
					data-tip="import sample data (json or csv)"
				>
					<!--mdi:file-upload source: https://icon-sets.iconify.design-->
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
						<path
							fill={State.Theme.value === Domain.Entities.Theme.Theme.DARK ? 'white' : 'black'}
							d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zm-.5 14v3h-3v-3H8l4-4l4 4zM13 9V3.5L18.5 9z"
						/>
					</svg>
				</button>
				{#if sampleDataShowImportButton}
					<div class="relative z-50">
						<div
							class="absolute right-0 top-0 flex w-fit flex-col rounded-md {State.Theme.value === Domain.Entities.Theme.Theme.DARK
								? 'bg-base-300'
								: 'bg-white'} min-w-fit p-1 shadow-md shadow-gray-800"
						>
							<input
								class="file-input file-input-bordered min-w-[250px]"
								type="file"
								accept=".json, .csv"
								onchange={async (e: any) => {
									if (e.target.files === null) {
										return
									}

									const fileList = e.target.files as FileList
									if (fileList.item(0)?.type !== 'application/json' && fileList.item(0)?.type !== 'text/csv') {
										return
									}

									const fileData = await fileList.item(0)?.text()
									if (typeof fileData === 'undefined') {
										return
									}

									switch (fileList.item(0)?.type) {
										case 'application/json':
											try {
												const data = JSON.parse(fileData)
												sampleData = Array.isArray(data) ? data : [data]

												State.Toast.Type = Domain.Entities.Toast.Type.SUCCESS
												State.Toast.Message = 'upload json data as sample input data successful'
												sampleDataShowImportButton = false
											} catch (e) {
												telemetry?.Log(COMPONENT_NAME, true, Domain.Entities.Telemetry.LogLevel.ERROR, 'parse json failed', 'error', e)
												State.Toast.Type = Domain.Entities.Toast.Type.ERROR
												State.Toast.Message = 'parse json failed'
											}
											break
										case 'text/csv':
											let data2DFields = new MetadataModel.Extract2DFields(sampleMetadataModel, false, false, false)
											data2DFields.Extract()
											data2DFields.Reposition()

											try {
												const results = Papa.parse(fileData, { dynamicTyping: true })
												if (results.data.length === 0) {
													return
												}

												telemetry?.Log(
													COMPONENT_NAME,
													false,
													Domain.Entities.Telemetry.LogLevel.DEBUG,
													'import sample data csv',
													'results.data',
													results.data
												)

												let array2DToObjects = new MetadataModel.Convert2DArrayToObjects(sampleMetadataModel)
												array2DToObjects.Convert(results.data.slice(1) as any[][])
												sampleData = array2DToObjects.Objects
												sampleDataShowImportButton = false
											} catch (e) {
												telemetry?.Log(COMPONENT_NAME, true, Domain.Entities.Telemetry.LogLevel.ERROR, 'parse json failed', 'error', e)
												State.Toast.Type = Domain.Entities.Toast.Type.ERROR
												State.Toast.Message = 'read csv data failed'
											}
											break
									}
								}}
							/>
						</div>
					</div>
				{/if}
			</div>
		</section>
	</section>
	<div class="divider"></div>
	<header role="tablist" class="tabs tabs-lift">
		<button role="tab" class="flex-1 tab{viewTab === ViewTab.DATUM_INPUT ? ' tab-active' : ''}" onclick={() => (viewTab = ViewTab.DATUM_INPUT)}>
			Datum Input
		</button>
		<button role="tab" class="flex-1 tab{viewTab === ViewTab.TABLE ? ' tab-active' : ''}" onclick={() => (viewTab = ViewTab.TABLE)}>Table</button>
		<button role="tab" class="flex-1 tab{viewTab === ViewTab.QUERY_PANEL ? ' tab-active' : ''}" onclick={() => (viewTab = ViewTab.QUERY_PANEL)}>
			Query Panel
		</button>
		<button role="tab" class="flex-1 tab{viewTab === ViewTab.DATUM_VIEW ? ' tab-active' : ''}" onclick={() => (viewTab = ViewTab.DATUM_VIEW)}>
			Datum View
		</button>
	</header>
	<main class="z-[1] flex h-full w-full flex-[9] flex-col overflow-hidden">
		{#if viewTab === ViewTab.DATUM_INPUT}
			{#await import('$lib/components/MetadataModel/Datum/Input/Component.svelte') then { default: MetadataModelDatumInput }}
				<MetadataModelDatumInput
					metadatamodel={sampleMetadataModel}
					datum={sampleData[sampleDataCurrentIndex]}
					themecolor={State.ThemeColor.value}
					theme={State.Theme.value}
					updatemetadatamodel={(value) => {
						sampleMetadataModel = value
					}}
					updatedata={(value) => {
						sampleData[sampleDataCurrentIndex] = value
					}}
					{telemetry}
					{notification}
				></MetadataModelDatumInput>
			{/await}
		{:else if viewTab === ViewTab.TABLE}
			{#await import('$lib/components/MetadataModel/Table/Component.svelte') then { default: MetadataModelTable }}
				<MetadataModelTable
					metadatamodel={sampleMetadataModel}
					data={sampleData}
					themecolor={State.ThemeColor.value}
					theme={State.Theme.value}
					addselectcolumn={true}
					{telemetry}
					rowclick={(_: any, index: number) => {
						sampleDataCurrentIndex = index
					}}
					selecteddataindexesactions={[
						{
							actionName: 'Console log Selected Data Indexes',
							action(selecteddataindexes) {
								telemetry?.Log(
									COMPONENT_NAME,
									true,
									Domain.Entities.Telemetry.LogLevel.DEBUG,
									'log Selected Data Indexes',
									'selecteddataindexes',
									selecteddataindexes
								)
							}
						}
					]}
					updatemetadatamodel={(value) => {
						sampleMetadataModel = value
					}}
				></MetadataModelTable>
			{/await}
		{:else if viewTab === ViewTab.QUERY_PANEL}
			{#await import('$lib/components/MetadataModel/Query/Component.svelte') then { default: MetadataModelQuery }}
				<MetadataModelQuery
					metadatamodel={sampleMetadataModel}
					themecolor={State.ThemeColor.value}
					theme={State.Theme.value}
					queryconditions={sampleQueryConditions}
					{telemetry}
					updatemetadatamodel={(value) => {
						sampleMetadataModel = value
					}}
					updatequeryconditions={(value) => {
						sampleQueryConditions = value
					}}
				></MetadataModelQuery>
			{/await}
		{:else if viewTab === ViewTab.DATUM_VIEW}
			{#await import('$lib/components/MetadataModel/Datum/View/Component.svelte') then { default: MetadataModelDatumView }}
				<MetadataModelDatumView
					metadatamodel={sampleMetadataModel}
					data={sampleData[sampleDataCurrentIndex]}
					themecolor={State.ThemeColor.value}
					theme={State.Theme.value}
				></MetadataModelDatumView>
			{/await}
		{:else}
			{@render tabNotImplemented()}
		{/if}
	</main>
{/snippet}

{#snippet tabNotImplemented()}
	<div class="text-error font-bold">Tab not implemented</div>
{/snippet}
