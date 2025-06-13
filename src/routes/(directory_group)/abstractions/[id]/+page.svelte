<script lang="ts">
	import { Domain, State, Interfaces, Component, Utils, MetadataModel } from '$lib'
	import { getContext, onMount, untrack } from 'svelte'
	import type { PageProps } from './$types'
	import { Tab, Tabs } from './util'
	import { goto } from '$app/navigation'

	const COMPONENT_NAME = 'abstraction-page'

	let { data }: PageProps = $props()

	let telemetry: Domain.Interfaces.ITelemetry | undefined = $derived.by(() => {
		return getContext(State.TelemetryContext.value)
	})

	let authContextDirectoryGroupID = $derived(data.directory_group_id)

	onMount(() => {
		;(async () => {
			datum = await Interfaces.Abstractions.Datum({
				authContextDirectoryGroupID: data.directory_group_id,
				fetchedData: {
					metadata_model: JSON.parse(JSON.stringify(data.current_datum?.metadata_model)),
					datum: JSON.parse(JSON.stringify(data.current_datum?.datum))
				},
				telemetry,
				currentDirectoryGroupID: data.directory_group_id!,
				context: COMPONENT_NAME,
				verboseResponse: State.VerboseResponse.value,
			})

			if (data.current_datum?.datum) {
				datum.previousDatum = JSON.parse(JSON.stringify(data.current_datum.datum))
			}
		})()
	})

	//@ts-expect-error
	let datum: Domain.Interfaces.Abstractions.Datum = $state({})

	let noOfTags: number = $derived(Array.isArray(datum.tags) ? datum.tags.length : 0)

	let tagsStart: number = $state(0)

	let tagsEnd: number = $state(0)

	let leftTabs: Tab[] = $state([Tab.INFO])
	let currentLeftTabIndex: number = $state(0)
	let rightTabs: Tab[] = $state([Tab.FILE])
	let currentRightTabIndex: number = $state(0)

	let windowWidth: number = $state(0)

	let datumView: Component.View.View = $state('simple')

	let collapseRightSection: boolean = $state(false)

	let showSectionID: string = $state('')

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

	let abstractionsReviewsSearch = $state(Interfaces.AbstractionsReviews.NewViewSearch())

	$effect(() => {
		if (
			datum.id &&
			State.Session.session?.iam_credential &&
			Array.isArray(State.Session.session.iam_credential.id) &&
			State.Session.session.iam_credential.id.length > 0
		) {
			untrack(() => {
				abstractionsReviewsSearch.authcontextdirectorygroupid = authContextDirectoryGroupID
				abstractionsReviewsSearch.abstractionsid = datum.id
				abstractionsReviewsSearch.context = COMPONENT_NAME
				abstractionsReviewsSearch.telemetry = telemetry

				abstractionsReviewsCommentsSearch.authcontextdirectorygroupid = authContextDirectoryGroupID
				abstractionsReviewsCommentsSearch.abstractionsid = datum.id
				abstractionsReviewsCommentsSearch.context = COMPONENT_NAME
				abstractionsReviewsCommentsSearch.telemetry = telemetry
			})
		}
	})

	async function reviewAbstraction(pass: boolean) {
		if (!Array.isArray(State.Session.session?.iam_credential?.directory_id) || !datum.id || !data.directory_group_id) {
			return
		}

		let abstractionReview: Domain.Entities.AbstractionsReviews.Interface = {
			abstractions_id: [datum.id],
			directory_id: State.Session.session.iam_credential.directory_id,
			review_pass: [pass]
		}

		State.Loading.value = `Updating ${Domain.Entities.AbstractionsReviews.RepositoryName}`
		try {
			const fetchUrl = new URL(`${Domain.Entities.Url.ApiUrlPaths.Abstractions.Reviews.Url}/${Domain.Entities.Url.Action.UPSERT}`)
			fetchUrl.searchParams.append(Domain.Entities.Url.SearchParams.DIRECTORY_GROUP_ID, data.directory_group_id)
			if (authContextDirectoryGroupID) {
				fetchUrl.searchParams.append(Domain.Entities.Url.SearchParams.AUTH_CONTEXT_DIRECTORY_GROUP_ID, authContextDirectoryGroupID)
			}
			if (State.VerboseResponse.value) {
				fetchUrl.searchParams.append(Domain.Entities.Url.SearchParams.VERBOSE_RESPONSE, `${true}`)
			}

			telemetry?.Log(
				COMPONENT_NAME,
				true,
				Domain.Entities.Telemetry.LogLevel.DEBUG,
				State.Loading.value,
				'fetchUrl',
				fetchUrl,
				'data',
				abstractionReview
			)

			const fetchResponse = await fetch(fetchUrl, {
				method: 'POST',
				credentials: 'include',
				body: JSON.stringify([abstractionReview])
			})

			const fetchData = await fetchResponse.json()
			if (fetchResponse.ok) {
				State.Toast.Type = !fetchData.failed
					? Domain.Entities.Toast.Type.SUCCESS
					: fetchData.successful && fetchData.successful > 0
						? Domain.Entities.Toast.Type.INFO
						: Domain.Entities.Toast.Type.ERROR
				const toastData = Domain.Entities.MetadataModel.GetToastFromJsonVerboseResponse(fetchData)
				State.Toast.Message = toastData.message
				State.Toast.MedataModelSearchResults = toastData.metadatamodel_search_results
				if (abstractionsReviewsSearch.searchdata) {
					abstractionsReviewsSearch.searchdata()
				}
			} else {
				handleError(fetchResponse.status, fetchData)
			}
		} catch (e) {
			const ERROR = `Update ${Domain.Entities.AbstractionsReviews.RepositoryName} failed`
			telemetry?.Log(COMPONENT_NAME, true, Domain.Entities.Telemetry.LogLevel.ERROR, ERROR, 'error', e)
			handleError(e, ERROR)
		} finally {
			State.Loading.value = undefined
		}
	}

	let abstractionsReviewsCommentsSearch = $state(Interfaces.AbstractionsReviewsComments.NewViewSearch())

	let comment: string = $state('')
	async function reviewCommentAbstraction() {
		if (!Array.isArray(State.Session.session?.iam_credential?.directory_id) || !datum.id || !data.directory_group_id || comment.length === 0) {
			return
		}

		let abstractionReviewComment: Domain.Entities.AbstractionsReviewsComments.Interface = {
			abstractions_id: [datum.id],
			directory_id: State.Session.session.iam_credential.directory_id,
			comment: [comment]
		}

		State.Loading.value = `Creating ${Domain.Entities.AbstractionsReviewsComments.RepositoryName}`
		try {
			const fetchUrl = new URL(`${Domain.Entities.Url.ApiUrlPaths.Abstractions.Reviews.Comments}/${Domain.Entities.Url.Action.CREATE}`)
			fetchUrl.searchParams.append(Domain.Entities.Url.SearchParams.DIRECTORY_GROUP_ID, data.directory_group_id)
			if (authContextDirectoryGroupID) {
				fetchUrl.searchParams.append(Domain.Entities.Url.SearchParams.AUTH_CONTEXT_DIRECTORY_GROUP_ID, authContextDirectoryGroupID)
			}
			if (State.VerboseResponse.value) {
				fetchUrl.searchParams.append(Domain.Entities.Url.SearchParams.VERBOSE_RESPONSE, `${true}`)
			}

			telemetry?.Log(
				COMPONENT_NAME,
				true,
				Domain.Entities.Telemetry.LogLevel.DEBUG,
				State.Loading.value,
				'fetchUrl',
				fetchUrl,
				'data',
				abstractionReviewComment
			)

			const fetchResponse = await fetch(fetchUrl, {
				method: 'POST',
				credentials: 'include',
				body: JSON.stringify([abstractionReviewComment])
			})

			const fetchData = await fetchResponse.json()
			if (fetchResponse.ok) {
				State.Toast.Type = !fetchData.failed
					? Domain.Entities.Toast.Type.SUCCESS
					: fetchData.successful && fetchData.successful > 0
						? Domain.Entities.Toast.Type.INFO
						: Domain.Entities.Toast.Type.ERROR
				const toastData = Domain.Entities.MetadataModel.GetToastFromJsonVerboseResponse(fetchData)
				State.Toast.Message = toastData.message
				State.Toast.MedataModelSearchResults = toastData.metadatamodel_search_results
				if (abstractionsReviewsCommentsSearch.searchdata) {
					abstractionsReviewsCommentsSearch.searchdata()
				}

				comment = ''
			} else {
				handleError(fetchResponse.status, fetchData)
			}
		} catch (e) {
			const ERROR = `Create ${Domain.Entities.AbstractionsReviewsComments.RepositoryName} failed`
			telemetry?.Log(COMPONENT_NAME, true, Domain.Entities.Telemetry.LogLevel.ERROR, ERROR, 'error', e)
			handleError(e, ERROR)
		} finally {
			State.Loading.value = undefined
		}
	}
</script>

<svelte:window bind:innerWidth={windowWidth} />

<div class="flex h-full flex-1 gap-x-2 self-center overflow-hidden pb-1">
	<section
		id="left-section"
		class="flex flex-1 flex-col gap-y-1 overflow-hidden rounded-md shadow-md shadow-gray-800 {State.Theme.value === Domain.Entities.Theme.Theme.DARK
			? 'bg-base-200'
			: 'bg-white'}"
	>
		<header class="z-[2] flex justify-between p-2">
			{@render tabheader(true)}

			<section class="flex">
				{@render addtab(true)}

				{#if collapseRightSection}
					<button
						class="btn btn-md btn-ghost tooltip tooltip-left {State.ThemeColor.value === Domain.Entities.Theme.Color.PRIMARY
							? 'tooltip-primary'
							: State.ThemeColor.value === Domain.Entities.Theme.Color.SECONDARY
								? 'tooltip-secondary'
								: 'tooltip-accent'}"
						onclick={() => (collapseRightSection = false)}
						data-tip="Expand Right Section"
					>
						<!--mdi:arrow-split-vertical source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
							<path
								fill={State.Theme.value === Domain.Entities.Theme.Theme.DARK ? 'white' : 'black'}
								d="M18 16v-3h-3v9h-2V2h2v9h3V8l4 4zM2 12l4 4v-3h3v9h2V2H9v9H6V8z"
							/>
						</svg>
					</button>
				{/if}
			</section>
		</header>

		{@render tabwindow(leftTabs[currentLeftTabIndex])}
	</section>

	{#if windowWidth > 1000 && !collapseRightSection}
		<section
			id="left-section"
			class="flex flex-1 flex-col gap-y-1 overflow-hidden rounded-md shadow-md shadow-gray-800 {State.Theme.value === Domain.Entities.Theme.Theme.DARK
				? 'bg-base-200'
				: 'bg-white'}"
		>
			<header class="z-[2] flex justify-between p-2">
				{@render tabheader(false)}

				<section class="flex">
					{@render addtab(false)}

					{#if !collapseRightSection}
						<button
							class="btn btn-md btn-ghost tooltip tooltip-left {State.ThemeColor.value === Domain.Entities.Theme.Color.PRIMARY
								? 'tooltip-primary'
								: State.ThemeColor.value === Domain.Entities.Theme.Color.SECONDARY
									? 'tooltip-secondary'
									: 'tooltip-accent'}"
							data-tip="Collapse Right Section"
							onclick={() => (collapseRightSection = true)}
						>
							<!--mdi:arrow-horizontal-collapse source: https://icon-sets.iconify.design-->
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
								<path
									fill={State.Theme.value === Domain.Entities.Theme.Theme.DARK ? 'white' : 'black'}
									d="M19 16v-3h4v-2h-4V8l-4 4zM5 8v3H1v2h4v3l4-4zm6 12h2V4h-2z"
								/>
							</svg>
						</button>
					{/if}
				</section>
			</header>

			{@render tabwindow(rightTabs[currentRightTabIndex])}
		</section>
	{/if}
</div>

{#snippet addtab(left: boolean)}
	{@const sectionID = `${left ? 'left' : 'right'}-tab-menu`}
	<div class="flex flex-col gap-y-1">
		<button
			class="btn btn-md tooltip tooltip-left {State.ThemeColor.value === Domain.Entities.Theme.Color.PRIMARY
				? 'tooltip-primary'
				: State.ThemeColor.value === Domain.Entities.Theme.Color.SECONDARY
					? 'tooltip-secondary'
					: 'tooltip-accent'}"
			onclick={() => {
				showSectionID = showSectionID === sectionID ? '' : sectionID
			}}
			data-tip="Add new tab"
		>
			<!--mdi:tab-plus source: https://icon-sets.iconify.design-->
			<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
				<path
					fill={State.Theme.value === Domain.Entities.Theme.Theme.DARK ? 'white' : 'black'}
					d="M3 3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm0 2h10v4h8v10H3zm7 5v3H7v2h3v3h2v-3h3v-2h-3v-3z"
				/>
			</svg>
		</button>

		<div class="relative h-0">
			{#if showSectionID === sectionID}
				<div
					class="rounded-md shadow-md shadow-gray-800 {State.Theme.value === Domain.Entities.Theme.Theme.DARK
						? 'bg-base-100'
						: 'bg-white'} absolute right-0 top-0 flex w-fit min-w-[200px] flex-col gap-y-2 p-1"
				>
					{#each Tabs as tb}
						<button
							class="btn btn-md btn-ghost"
							aria-label={tb}
							onclick={() => {
								if (left) {
									leftTabs.push(tb)
									currentLeftTabIndex = leftTabs.length - 1
								} else {
									rightTabs.push(tb)
									currentRightTabIndex = rightTabs.length - 1
								}
							}}
						>
							{tb}
						</button>
					{/each}
				</div>
			{/if}
		</div>
	</div>
{/snippet}

{#snippet tabheader(left: boolean)}
	<section class="flex-1">
		<span role="tablist" class="tabs tabs-lift flex-1">
			{#if left}
				{#each leftTabs as lt, lIndex}
					<span role="tab" class="tab flex flex-1 {lIndex === currentLeftTabIndex ? 'tab-active' : ''}">
						<button
							class="btn btn-ghost btn-md flex-1"
							onclick={() => {
								currentLeftTabIndex = lIndex
							}}
						>
							{lt}
						</button>

						<button
							class="btn btn-ghost {lIndex === currentLeftTabIndex ? 'tab-active' : ''}"
							onclick={() => {
								leftTabs = leftTabs.filter((_, i) => lIndex !== i)
								if (currentLeftTabIndex >= leftTabs.length - 1) {
									currentLeftTabIndex = leftTabs.length - 1
								}
							}}
						>
							<!--mdi:close-circle source: https://icon-sets.iconify.design-->
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
								<path
									fill={State.Theme.value === Domain.Entities.Theme.Theme.DARK ? 'white' : 'black'}
									d="M12 2c5.53 0 10 4.47 10 10s-4.47 10-10 10S2 17.53 2 12S6.47 2 12 2m3.59 5L12 10.59L8.41 7L7 8.41L10.59 12L7 15.59L8.41 17L12 13.41L15.59 17L17 15.59L13.41 12L17 8.41z"
								/>
							</svg>
						</button>
					</span>
				{/each}
			{:else}
				{#each rightTabs as rt, rIndex}
					<span role="tab" class="tab flex flex-1 {rIndex === currentRightTabIndex ? 'tab-active' : ''}">
						<button
							class="btn btn-ghost btn-md flex-1"
							onclick={() => {
								currentRightTabIndex = rIndex
							}}
						>
							{rt}
						</button>

						<button
							class="btn btn-ghost {rIndex === currentRightTabIndex ? 'tab-active' : ''}"
							onclick={() => {
								rightTabs = rightTabs.filter((_, i) => rIndex !== i)
								if (currentRightTabIndex >= rightTabs.length - 1) {
									currentRightTabIndex = rightTabs.length - 1
								}
							}}
						>
							<!--mdi:close-circle source: https://icon-sets.iconify.design-->
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
								<path
									fill={State.Theme.value === Domain.Entities.Theme.Theme.DARK ? 'white' : 'black'}
									d="M12 2c5.53 0 10 4.47 10 10s-4.47 10-10 10S2 17.53 2 12S6.47 2 12 2m3.59 5L12 10.59L8.41 7L7 8.41L10.59 12L7 15.59L8.41 17L12 13.41L15.59 17L17 15.59L13.41 12L17 8.41z"
								/>
							</svg>
						</button>
					</span>
				{/each}
			{/if}
		</span>
	</section>
{/snippet}

{#snippet tabwindow(tab: Tab)}
	{#if tab === Tab.INFO}
		<main class="z-[1] flex flex-1 flex-col overflow-hidden p-2">
			{#await import('$lib/components/View/Header/Datum/Component.svelte') then { default: ViewHeaderDatum }}
				<ViewHeaderDatum
					title="Abstraction Info"
					view={datumView}
					updateview={(value) => (datumView = value)}
					theme={State.Theme.value}
					themecolor={State.ThemeColor.value}
				></ViewHeaderDatum>
			{/await}
			{#await import('$lib/components/View/Abstractions/Datum/Component.svelte') then { default: Datum }}
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
	{:else if tab === Tab.EDIT_INFO}
		<main class="z-[1] flex flex-1 flex-col gap-y-4 overflow-auto">
			<fieldset
				class="fieldset {State.Theme.value === Domain.Entities.Theme.Theme.DARK
					? 'border-gray-900 bg-gray-700'
					: 'border-gray-300 bg-gray-100'} rounded-box w-full border p-4"
			>
				<legend class="fieldset-legend flex gap-x-2">
					<div class="text-md h-fit self-center">Completed?</div>
				</legend>

				<p class="text-sm">Allows reviewers to determine whether they should review your abstraction.</p>

				<input
					class="checkbox {State.ThemeColor.value === Domain.Entities.Theme.Color.PRIMARY
						? 'checkbox-primary'
						: State.ThemeColor.value === Domain.Entities.Theme.Color.SECONDARY
							? 'checkbox-secondary'
							: 'checkbox-accent'}"
					type="checkbox"
					bind:checked={datum.completed}
				/>
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

		{@render updatedelete()}
	{:else if tab === Tab.EDIT_DATA}
		{#if datum.dataMetadataModel}
			<main class="z-[1] flex flex-[9] overflow-hidden">
				{#await import("$lib/components/MetadataModel/Datum/Input/Component.svelte") then { default: MetadataModelDatumInput }}
					<MetadataModelDatumInput
						metadatamodel={datum.dataMetadataModel}
						datum={datum.data}
						themecolor={State.ThemeColor.value}
						theme={State.Theme.value}
						updatemetadatamodel={(value) => {
							datum.dataMetadataModel = value
						}}
						updatedata={(value) => {
							datum.data = value
						}}
						{telemetry}
						notification={(type, message) => {
							State.Toast.Type = type
							State.Toast.Message = message
						}}
					></MetadataModelDatumInput>
				{/await}
			</main>
		{:else if datum.data}
			{@render json(datum.data)}
		{/if}

		{@render updatedelete()}
	{:else if tab === Tab.FILE}
		{#if datum.storage_file}
			{#await import('$lib/components/FileView/Component.svelte') then { default: FileView }}
				<FileView
					storagefile={datum.storage_file}
					authcontextdirectorygroupid={authContextDirectoryGroupID}
					{telemetry}
					theme={State.Theme.value}
					themecolor={State.ThemeColor.value}
				></FileView>
			{/await}
		{:else}
			<div class="flex flex-1 justify-center">
				<span class="text-error self-center">File information not available</span>
			</div>
		{/if}
	{:else if tab === Tab.REVIEW}
		<main class="z-[1] flex flex-1 flex-col overflow-hidden p-2">
			{#if abstractionsReviewsSearch.getdisplaydata}
				{#await abstractionsReviewsSearch.getdisplaydata()}
					<div class="flex h-full w-full flex-[9.5] justify-center">
						<span class="self-center">
							<span class="loading text-primary loading-ball loading-md"></span>
							<span class="loading text-secondary loading-ball loading-lg"></span>
							<span class="loading text-accent loading-ball loading-xl"></span>
						</span>
					</div>
				{:then}
					<header class="z-[2] flex justify-center">
						{#await import('$lib/components/View/AbstractionsReviews/SearchBar/Component.svelte') then { default: ViewAbstractionsReviewsSearchBar }}
							<div class="max-md:w-full md:w-[60%]">
								<ViewAbstractionsReviewsSearchBar
									metadatamodel={abstractionsReviewsSearch.searchmetadatamodel}
									themecolor={State.ThemeColor.value}
									theme={State.Theme.value}
									{telemetry}
									querycondition={abstractionsReviewsSearch.quicksearchquerycondition}
									updatequerycondition={(value) => {
										abstractionsReviewsSearch.quicksearchquerycondition = value
									}}
									showquerypanel={() => {
										abstractionsReviewsSearch.showquerypanel = !abstractionsReviewsSearch.showquerypanel
									}}
									search={() => {
										if (abstractionsReviewsSearch.searchdata) {
											abstractionsReviewsSearch.searchdata()
										}
									}}
								></ViewAbstractionsReviewsSearchBar>
							</div>
						{/await}
					</header>

					<div class="divider mb-0 mt-0"></div>

					<main class="z-[1] flex flex-[9.5] gap-x-2 overflow-hidden">
						{#if abstractionsReviewsSearch.showquerypanel}
							<section class="flex flex-[2] flex-col gap-y-2 overflow-hidden">
								{#await import("$lib/components/QueryPanel/Component.svelte") then { default: QueryPanel }}
									<QueryPanel
										themecolor={State.ThemeColor.value}
										theme={State.Theme.value}
										{telemetry}
										metadatamodel={abstractionsReviewsSearch.searchmetadatamodel}
										data={abstractionsReviewsSearch.searchresults}
										queryconditions={abstractionsReviewsSearch.queryconditions}
										filterexcludeindexes={abstractionsReviewsSearch.filterexcludeindexes}
										updatefilterexcludeindexes={(value) => {
											abstractionsReviewsSearch.filterexcludeindexes = value
											State.Toast.Type = Domain.Entities.Toast.Type.INFO
											State.Toast.Message = `${abstractionsReviewsSearch.filterexcludeindexes.length} local results filtered out`
										}}
										updatemetadatamodel={(value: any) => {
											if (abstractionsReviewsSearch.updatemedataModel) {
												abstractionsReviewsSearch.updatemedataModel(value)
											}
										}}
										updatequeryconditions={(value) => {
											abstractionsReviewsSearch.queryconditions = value
										}}
										hidequerypanel={() => (abstractionsReviewsSearch.showquerypanel = false)}
									></QueryPanel>
								{/await}
							</section>
						{/if}

						{#if !abstractionsReviewsSearch.showquerypanel || windowWidth > 2000}
							{#if abstractionsReviewsSearch.searchresults!.length > 0}
								<section class="flex {windowWidth > 1500 ? 'flex-[3]' : 'flex-2'} flex-col overflow-hidden rounded-lg">
									{#await import('$lib/components/View/Header/Data/Component.svelte') then { default: ViewHeaderData }}
										<ViewHeaderData
											title={'Abstraction Checks'}
											view={abstractionsReviewsSearch.view}
											themecolor={State.ThemeColor.value}
											theme={State.Theme.value}
											updateview={(value) => (abstractionsReviewsSearch.view = value)}
										></ViewHeaderData>
									{/await}
									{#await import('$lib/components/View/AbstractionsReviews/Data/Component.svelte') then { default: ViewAbstractionsReviewsData }}
										<ViewAbstractionsReviewsData
											metadatamodel={abstractionsReviewsSearch.searchmetadatamodel}
											data={abstractionsReviewsSearch.searchresults}
											themecolor={State.ThemeColor.value}
											theme={State.Theme.value}
											{telemetry}
											addclickcolumn={false}
											view={abstractionsReviewsSearch.view}
											updatemetadatamodel={(value: any) => {
												if (abstractionsReviewsSearch.updatemedataModel) {
													abstractionsReviewsSearch.updatemedataModel(value)
												}
											}}
											filterexcludeindexes={abstractionsReviewsSearch.filterexcludeindexes}
										></ViewAbstractionsReviewsData>
									{/await}
								</section>
							{:else}
								<div
									class="flex flex-1 justify-center rounded-md p-2 {State.Theme.value === Domain.Entities.Theme.Theme.DARK
										? 'bg-gray-700'
										: 'bg-gray-200'}"
								>
									<span class="flex self-center text-lg"> Perform checks on abstractions. </span>
								</div>
							{/if}
						{/if}
					</main>
				{:catch e}
					{#await import('$lib/components/Error/Component.svelte') then { default: Error }}
						<div class="flex h-full w-full flex-[9.5] justify-center">
							<span class="self-center"><Error status={e[0]} message={e[1]} shadow={'inner'}></Error></span>
						</div>
					{/await}
				{/await}
			{/if}
		</main>

		{#if State.Session.session?.iam_credential?.directory_id && datum.id}
			<footer class="join w-full pb-2 pl-2 pr-2">
				<button
					class="join-item btn flex-1 {State.ThemeColor.value === Domain.Entities.Theme.Color.PRIMARY
						? 'btn-primary'
						: State.ThemeColor.value === Domain.Entities.Theme.Color.SECONDARY
							? 'btn-secondary'
							: 'btn-accent'}"
					onclick={() => {
						reviewAbstraction(true)
					}}
				>
					check passed
				</button>

				<button
					class="join-item btn flex-1 {State.ThemeColor.value === Domain.Entities.Theme.Color.ACCENT
						? 'btn-primary'
						: State.ThemeColor.value === Domain.Entities.Theme.Color.PRIMARY
							? 'btn-secondary'
							: 'btn-accent'}"
					onclick={() => {
						reviewAbstraction(false)
					}}
				>
					check failed
				</button>
			</footer>
		{/if}
	{:else if tab === Tab.REVIEW_COMMENTS}
		<main class="z-[1] flex flex-1 flex-col overflow-hidden p-2">
			{#if abstractionsReviewsCommentsSearch.getdisplaydata}
				{#await abstractionsReviewsCommentsSearch.getdisplaydata()}
					<div class="flex h-full w-full flex-[9.5] justify-center">
						<span class="self-center">
							<span class="loading text-primary loading-ball loading-md"></span>
							<span class="loading text-secondary loading-ball loading-lg"></span>
							<span class="loading text-accent loading-ball loading-xl"></span>
						</span>
					</div>
				{:then}
					<header class="z-[2] flex justify-center">
						{#await import('$lib/components/View/AbstractionsReviewsComments/SearchBar/Component.svelte') then { default: ViewAbstractionsReviewsCommentsSearchBar }}
							<div class="max-md:w-full md:w-[60%]">
								<ViewAbstractionsReviewsCommentsSearchBar
									metadatamodel={abstractionsReviewsCommentsSearch.searchmetadatamodel}
									themecolor={State.ThemeColor.value}
									theme={State.Theme.value}
									{telemetry}
									querycondition={abstractionsReviewsCommentsSearch.quicksearchquerycondition}
									updatequerycondition={(value) => {
										abstractionsReviewsCommentsSearch.quicksearchquerycondition = value
									}}
									showquerypanel={() => {
										abstractionsReviewsCommentsSearch.showquerypanel = !abstractionsReviewsCommentsSearch.showquerypanel
									}}
									search={() => {
										if (abstractionsReviewsCommentsSearch.searchdata) {
											abstractionsReviewsCommentsSearch.searchdata()
										}
									}}
								></ViewAbstractionsReviewsCommentsSearchBar>
							</div>
						{/await}
					</header>

					<div class="divider mb-0 mt-0"></div>

					<main class="z-[1] flex flex-[9.5] gap-x-2 overflow-hidden">
						{#if abstractionsReviewsCommentsSearch.showquerypanel}
							<section class="flex flex-[2] flex-col gap-y-2 overflow-hidden">
								{#await import("$lib/components/QueryPanel/Component.svelte") then { default: QueryPanel }}
									<QueryPanel
										themecolor={State.ThemeColor.value}
										theme={State.Theme.value}
										{telemetry}
										metadatamodel={abstractionsReviewsCommentsSearch.searchmetadatamodel}
										data={abstractionsReviewsCommentsSearch.searchresults}
										queryconditions={abstractionsReviewsCommentsSearch.queryconditions}
										filterexcludeindexes={abstractionsReviewsCommentsSearch.filterexcludeindexes}
										updatefilterexcludeindexes={(value) => {
											abstractionsReviewsCommentsSearch.filterexcludeindexes = value
											State.Toast.Type = Domain.Entities.Toast.Type.INFO
											State.Toast.Message = `${abstractionsReviewsCommentsSearch.filterexcludeindexes.length} local results filtered out`
										}}
										updatemetadatamodel={(value: any) => {
											if (abstractionsReviewsCommentsSearch.updatemedataModel) {
												abstractionsReviewsCommentsSearch.updatemedataModel(value)
											}
										}}
										updatequeryconditions={(value) => {
											abstractionsReviewsCommentsSearch.queryconditions = value
										}}
										hidequerypanel={() => (abstractionsReviewsCommentsSearch.showquerypanel = false)}
									></QueryPanel>
								{/await}
							</section>
						{/if}

						{#if !abstractionsReviewsCommentsSearch.showquerypanel || windowWidth > 2000}
							{#if abstractionsReviewsCommentsSearch.searchresults!.length > 0}
								<section class="flex {windowWidth > 1500 ? 'flex-[3]' : 'flex-2'} flex-col overflow-hidden rounded-lg">
									{#await import('$lib/components/View/Header/Data/Component.svelte') then { default: ViewHeaderData }}
										<ViewHeaderData
											title={'Abstractions checks comments'}
											view={abstractionsReviewsCommentsSearch.view}
											themecolor={State.ThemeColor.value}
											theme={State.Theme.value}
											updateview={(value) => (abstractionsReviewsCommentsSearch.view = value)}
										></ViewHeaderData>
									{/await}
									{#await import('$lib/components/View/AbstractionsReviewsComments/Data/Component.svelte') then { default: ViewAbstractionsReviewsCommentsData }}
										<ViewAbstractionsReviewsCommentsData
											metadatamodel={abstractionsReviewsCommentsSearch.searchmetadatamodel}
											data={abstractionsReviewsCommentsSearch.searchresults}
											themecolor={State.ThemeColor.value}
											theme={State.Theme.value}
											{telemetry}
											addclickcolumn={false}
											view={abstractionsReviewsCommentsSearch.view}
											updatemetadatamodel={(value: any) => {
												if (abstractionsReviewsCommentsSearch.updatemedataModel) {
													abstractionsReviewsCommentsSearch.updatemedataModel(value)
												}
											}}
											filterexcludeindexes={abstractionsReviewsCommentsSearch.filterexcludeindexes}
										></ViewAbstractionsReviewsCommentsData>
									{/await}
								</section>
							{:else}
								<div
									class="flex flex-1 justify-center rounded-md p-2 {State.Theme.value === Domain.Entities.Theme.Theme.DARK
										? 'bg-gray-700'
										: 'bg-gray-200'}"
								>
									<span class="flex self-center text-lg"> Comment on your abstraction checks. </span>
								</div>
							{/if}
						{/if}
					</main>
				{:catch e}
					{#await import('$lib/components/Error/Component.svelte') then { default: Error }}
						<div class="flex h-full w-full flex-[9.5] justify-center">
							<span class="self-center"><Error status={e[0]} message={e[1]} shadow={'inner'}></Error></span>
						</div>
					{/await}
				{/await}
			{/if}
		</main>

		{#if State.Session.session?.iam_credential?.directory_id && datum.id}
			<footer class="flex w-full gap-x-1 pb-2 pl-2 pr-2">
				<textarea
					class="textarea max-h-[50vh] flex-1 {State.ThemeColor.value === Domain.Entities.Theme.Color.PRIMARY
						? 'textarea-primary'
						: State.ThemeColor.value === Domain.Entities.Theme.Color.SECONDARY
							? 'textarea-secondary'
							: 'textarea-accent'}"
					placeholder="Enter comment..."
					bind:value={comment}
				>
				</textarea>

				<button
					class="btn btn-circle self-center {State.ThemeColor.value === Domain.Entities.Theme.Color.PRIMARY
						? 'btn-primary'
						: State.ThemeColor.value === Domain.Entities.Theme.Color.SECONDARY
							? 'btn-secondary'
							: 'btn-accent'}"
					onclick={() => {
						reviewCommentAbstraction()
					}}
					disabled={!comment}
				>
					<!--mdi:send source: https://icon-sets.iconify.design-->
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
						<path fill="var({Utils.Theme.GetColorContent(State.ThemeColor.value)})" d="m2 21l21-9L2 3v7l15 2l-15 2z" />
					</svg>
				</button>
			</footer>
		{/if}
	{/if}
{/snippet}

{#snippet updatedelete()}
	{#if State.Session.session && data.directory_group_id}
		<footer class="join w-full pb-2">
			{#if datum.update}
				<button
					class="join-item btn flex-1 {State.ThemeColor.value === Domain.Entities.Theme.Color.PRIMARY
						? 'btn-primary'
						: State.ThemeColor.value === Domain.Entities.Theme.Color.SECONDARY
							? 'btn-secondary'
							: 'btn-accent'}"
					onclick={async () => {
						State.Loading.value = `Updating ${Domain.Entities.Abstractions.RepositoryName}`

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
			{/if}

			{@render deletedatum()}
		</footer>
	{/if}
{/snippet}

{#snippet deletedatum()}
	{#if datum.id && typeof datum.delete === 'function' && data.directory_group_id}
		<button
			class="join-item btn flex-1 {State.ThemeColor.value === Domain.Entities.Theme.Color.PRIMARY
				? 'btn-primary'
				: State.ThemeColor.value === Domain.Entities.Theme.Color.SECONDARY
					? 'btn-secondary'
					: 'btn-accent'}"
			onclick={async () => {
				State.Loading.value = `Deleting ${Domain.Entities.Abstractions.RepositoryName}`
				try {
					const toastData = await datum.delete!()

					State.Toast.Type = toastData.Type
					State.Toast.Message = toastData.Message
					State.Toast.MedataModelSearchResults = toastData.MedataModelSearchResults

					if (toastData.Type === Domain.Entities.Toast.Type.SUCCESS) {
						goto(State.GetGroupNavigationPath(Domain.Entities.Url.WebsitePaths.Abstractions, data.directory_group_id))
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

{#snippet json(value: any)}
	<pre
		class="h-fit max-h-[50vh] w-full flex-1 overflow-auto rounded-md {State.Theme.value === Domain.Entities.Theme.Theme.DARK
			? 'border-gray-900 bg-gray-700'
			: 'bg-gray-200'} p-1 shadow-inner shadow-gray-800 lg:max-w-[50vw]"><code>{JSON.stringify(value, null, 4)}</code></pre>
{/snippet}
