<script lang="ts">
	import { Domain, Interfaces, MetadataModel, State, Utils } from '$lib'
	import { MediaQuery } from 'svelte/reactivity'
	import '../app.css'
	import { onDestroy, onMount, setContext, untrack, type Snippet } from 'svelte'
	import type { LayoutProps } from './$types'

	let { data, children }: LayoutProps & { children: Snippet<[]> } = $props()

	const darkThemeMediaQuery = new MediaQuery('prefers-color-scheme:dark')

	/**
	 * React to theme changes.
	 */
	$effect(() => {
		if (darkThemeMediaQuery.current) {
			untrack(() => {
				State.Theme.value = Domain.Entities.Theme.Theme.DARK
			})
		} else {
			untrack(() => {
				State.Theme.value = Domain.Entities.Theme.Theme.LIGHT
			})
		}
	})

	onMount(() => {
		if (data.theme) {
			State.Theme.value = data.theme
		} else {
			if (darkThemeMediaQuery.current) {
				State.Theme.value = Domain.Entities.Theme.Theme.DARK
			} else {
				State.Theme.value = Domain.Entities.Theme.Theme.LIGHT
			}
		}

		State.TelemetryContext.value = Symbol(State.TELEMETRY_CONTEXT)
		setContext(State.TelemetryContext.value, new Interfaces.Telemetry.Telemetry(Utils.Env.GetLogLevel()))

		if (data.session) {
			State.Session.session = data.session
		} else {
			State.Session.session = undefined
		}

		if (data.openid_endpoints) {
			State.OpenidEndpoints.value = data.openid_endpoints
		} else {
			State.OpenidEndpoints.value = undefined
		}
	})

	let loadingScreenDialogElement: HTMLDialogElement
	$effect(() => {
		if (typeof State.Loading.value === 'string') {
			loadingScreenDialogElement.showModal()
		} else {
			loadingScreenDialogElement.close()
		}
	})

	let toastViewMore: boolean = $state(false)
	let toastShowQueryPanel: boolean = $state(false)
	let toastFilterExcludeIndexes: number[] = $state([])
	let toastMetadataModelSearchResultsMM: any = $derived(
		State.Toast.MedataModelSearchResults?.metadata_model
			? JSON.parse(JSON.stringify(State.Toast.MedataModelSearchResults?.metadata_model))
			: undefined
	)
	let toastQueryConditions: MetadataModel.QueryConditions[] | undefined = $state(undefined)

	let toastCloseTimeout: NodeJS.Timeout | undefined = $state(undefined)

	function toastReset() {
		clearInterval(toastCloseTimeout)
		toastCloseTimeout = undefined
		State.Toast.Type = undefined
		State.Toast.Message = undefined
		State.Toast.MedataModelSearchResults = undefined
		toastViewMore = false
		toastShowQueryPanel = false
		toastFilterExcludeIndexes = []
		toastMetadataModelSearchResultsMM = undefined
		toastQueryConditions = undefined
	}

	$effect(() => {
		if (State.Toast.Type && State.Toast.Message) {
			untrack(() => {
				if (toastCloseTimeout !== undefined) {
					clearInterval(toastCloseTimeout)
				}

				toastCloseTimeout = setTimeout(
					() => {
						untrack(() => {
							toastReset()
						})
					},
					typeof Array.isArray(State.Toast.Message) ? 10000 : 3000
				)
			})
		}
	})

	onDestroy(() => {
		if (toastCloseTimeout !== undefined) {
			toastReset()
		}
	})

	let toastMetadataModelSearchResultsDialog: HTMLDialogElement

	let windowWidth: number = $state(0)
</script>

<svelte:window bind:innerWidth={windowWidth} />

<div
	class="z-[1] h-full w-full flex-1 overflow-hidden {State.Theme.value === Domain.Entities.Theme.Theme.DARK
		? 'background-pattern-dark'
		: 'background-pattern-light'}"
>
	{@render children()}
</div>

{#if State.Toast.Type && State.Toast.Message}
	{@const toastMessage = Array.isArray(State.Toast.Message) ? State.Toast.Message : [State.Toast.Message]}

	<div class="toast max-sm:toast-center sm:toast-end z-[2] overflow-auto max-sm:w-full">
		{#each toastMessage as tm}
			<div
				role="alert"
				class="alert flex justify-between {State.Toast.Type === Domain.Entities.Toast.Type.ERROR
					? 'alert-error'
					: State.Toast.Type === Domain.Entities.Toast.Type.WARNING
						? 'alert-warning'
						: State.Toast.Type === Domain.Entities.Toast.Type.SUCCESS
							? 'alert-success'
							: 'alert-info'}"
			>
				<div class="flex flex-wrap">
					{#if tm}
						<span>{tm}</span>
						{#if State.Toast.MedataModelSearchResults}
							<button
								class="link link-hover w-full self-center text-left font-bold italic"
								onclick={() => {
									clearInterval(toastCloseTimeout)
									toastViewMore = true
									toastMetadataModelSearchResultsDialog.showModal()
								}}
							>
								view more...
							</button>
						{/if}
					{:else}
						<span>...no message...</span>
					{/if}
				</div>

				<button class="btn btn-sm btn-circle btn-ghost self-start" onclick={toastReset}>
					<!--mdi:close source: https://icon-sets.iconify.design-->
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
						<path
							fill="var({Utils.Theme.GetColorContent(State.Toast.Type as unknown as Domain.Entities.Theme.Color)})"
							d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12z"
						/>
					</svg>
				</button>
			</div>
		{/each}
	</div>
{/if}
<dialog bind:this={toastMetadataModelSearchResultsDialog} id="toast-metadata-model-search-results-dialog" class="modal">
	{#if toastViewMore}
		<div class="modal-box flex h-full max-h-[90%] w-full max-w-[90%] flex-col overflow-hidden rounded p-0">
			<header class="sticky top-0 right-0 left-0 mb-1 flex flex-[0.5] items-center justify-between p-2 shadow-sm shadow-gray-800">
				<button class="btn btn-circle btn-ghost" aria-label="Show Query Panel" onclick={() => (toastShowQueryPanel = !toastShowQueryPanel)}>
					{#if toastShowQueryPanel}
						<!--mdi:filter-remove source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
							<path
								fill="var({Utils.Theme.GetColor(State.ThemeColor.value)})"
								d="M14.76 20.83L17.6 18l-2.84-2.83l1.41-1.41L19 16.57l2.83-2.81l1.41 1.41L20.43 18l2.81 2.83l-1.41 1.41L19 19.4l-2.83 2.84zM12 12v7.88c.04.3-.06.62-.29.83a.996.996 0 0 1-1.41 0L8.29 18.7a.99.99 0 0 1-.29-.83V12h-.03L2.21 4.62a1 1 0 0 1 .17-1.4c.19-.14.4-.22.62-.22h14c.22 0 .43.08.62.22a1 1 0 0 1 .17 1.4L12.03 12z"
							/>
						</svg>
					{:else}
						<!--mdi:filter-menu source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
							<path
								fill="var({Utils.Theme.GetColor(State.ThemeColor.value)})"
								d="m11 11l5.76-7.38a1 1 0 0 0-.17-1.4A1 1 0 0 0 16 2H2a1 1 0 0 0-.62.22a1 1 0 0 0-.17 1.4L7 11v5.87a1 1 0 0 0 .29.83l2 2a1 1 0 0 0 1.41 0a1 1 0 0 0 .3-.83zm2 5l5 5l5-5Z"
							/>
						</svg>
					{/if}
				</button>
				<button
					class="btn btn-circle btn-ghost"
					onclick={() => {
						toastReset()
						toastMetadataModelSearchResultsDialog.close()
					}}
				>
					<!--mdi:close-circle source: https://icon-sets.iconify.design-->
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
						<path
							fill="var({Utils.Theme.GetColor(State.ThemeColor.value)})"
							d="M12 2c5.53 0 10 4.47 10 10s-4.47 10-10 10S2 17.53 2 12S6.47 2 12 2m3.59 5L12 10.59L8.41 7L7 8.41L10.59 12L7 15.59L8.41 17L12 13.41L15.59 17L17 15.59L13.41 12L17 8.41z"
						/>
					</svg>
				</button>
			</header>

			<main class="flex flex-[9.5] gap-x-2 overflow-hidden p-2">
				{#if toastShowQueryPanel}
					<section class="flex flex-[2] flex-col gap-y-2 overflow-hidden">
						{#await import("$lib/components/MetadataModel/Query/Component.svelte") then { default: MetadataModelQuery }}
							<section class="flex h-full w-full min-w-[300px] flex-1 overflow-hidden rounded-lg">
								<MetadataModelQuery
									metadatamodel={toastMetadataModelSearchResultsMM}
									themecolor={State.ThemeColor.value}
									theme={State.Theme.value}
									queryconditions={toastQueryConditions}
									updatemetadatamodel={(value) => {
										toastMetadataModelSearchResultsMM = value
									}}
									updatequeryconditions={(value) => {
										toastQueryConditions = value
									}}
								></MetadataModelQuery>
							</section>

							<section class="join w-full">
								<button
									class="join-item btn btn-md flex-1 {State.ThemeColor.value === Domain.Entities.Theme.Color.PRIMARY
										? 'btn-primary'
										: State.ThemeColor.value === Domain.Entities.Theme.Color.SECONDARY
											? 'btn-secondary'
											: 'btn-accent'}"
									onclick={() => {
										toastFilterExcludeIndexes = []
										toastQueryConditions = undefined
									}}
									disabled={!Array.isArray(toastQueryConditions) ||
										toastQueryConditions.length === 0 ||
										!Array.isArray(State.Toast.MedataModelSearchResults?.data)}
								>
									reset
								</button>
								<button
									class="join-item btn btn-md flex-1 {State.ThemeColor.value === Domain.Entities.Theme.Color.PRIMARY
										? 'btn-primary'
										: State.ThemeColor.value === Domain.Entities.Theme.Color.SECONDARY
											? 'btn-secondary'
											: 'btn-accent'}"
									onclick={() => {
										if (Array.isArray(toastQueryConditions) && Array.isArray(State.Toast.MedataModelSearchResults?.data)) {
											toastFilterExcludeIndexes = MetadataModel.FilterData(toastQueryConditions, State.Toast.MedataModelSearchResults?.data)
										}
									}}
									disabled={!Array.isArray(toastQueryConditions) ||
										toastQueryConditions.length === 0 ||
										!Array.isArray(State.Toast.MedataModelSearchResults?.data)}
								>
									filter
								</button>
							</section>
						{/await}
					</section>
				{/if}

				{#if !toastShowQueryPanel || windowWidth > 1000}
					<section class="flex {windowWidth > 1500 ? 'flex-[3]' : 'flex-[2]'} h-full w-full overflow-hidden rounded-lg">
						{#await import('$lib/components/MetadataModel/Table/Component.svelte') then { default: MetadataModelTable }}
							<MetadataModelTable
								metadatamodel={State.Toast.MedataModelSearchResults?.metadata_model}
								data={State.Toast.MedataModelSearchResults?.data}
								filterexcludeindexes={toastFilterExcludeIndexes}
								addclickcolumn={false}
								theme={State.Theme.value}
								themecolor={State.ThemeColor.value}
							></MetadataModelTable>
						{/await}
					</section>
				{/if}
			</main>
		</div>
	{/if}
</dialog>

<dialog bind:this={loadingScreenDialogElement} id="edit-field-group-dialog" class="modal">
	{#if typeof State.Loading.value === 'string'}
		<div class="modal-box flex flex-col items-center justify-center gap-y-5 text-xl">
			<div class="flex">
				<span class="loading loading-ball loading-md text-accent"></span>
				<span class="loading loading-ball loading-lg text-secondary"></span>
				<span class="loading loading-ball loading-xl text-primary"></span>
			</div>
			{#if State.Loading.value}
				<span class="text-white">{State.Loading.value}</span>
			{/if}
		</div>
	{/if}
</dialog>

<style>
	.background-pattern-dark {
		background-color: var(--color-base-100);
		opacity: 1;
		background-image:
			radial-gradient(var(--color-primary) 0.8500000000000001px, transparent 0.8500000000000001px),
			radial-gradient(var(--color-primary) 0.8500000000000001px, var(--color-base-100) 0.8500000000000001px);
		background-size: 34px 34px;
		background-position:
			0 0,
			17px 17px;
	}

	.background-pattern-light {
		background-color: white;
		opacity: 1;
		background-image:
			radial-gradient(var(--color-primary) 0.8500000000000001px, transparent 0.8500000000000001px),
			radial-gradient(var(--color-primary) 0.8500000000000001px, white 0.8500000000000001px);
		background-size: 34px 34px;
		background-position:
			0 0,
			17px 17px;
	}
</style>
