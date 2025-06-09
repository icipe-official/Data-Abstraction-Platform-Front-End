<script lang="ts">
	import { goto } from '$app/navigation'
	import { Domain, Interfaces, State, Utils } from '$lib'
	import { onMount, untrack } from 'svelte'

	const COMPONENT_NAME = 'administration-directory-groups-datum'

	interface Props {
		metadatamodel?: any
		datum?: any
		themecolor?: Domain.Entities.Theme.Color
		theme?: Domain.Entities.Theme.Theme
		telemetry?: Domain.Interfaces.ITelemetry
		directorygroupid?: string
	}

	let {
		metadatamodel,
		datum: d,
		themecolor = Domain.Entities.Theme.Color.PRIMARY,
		theme = Domain.Entities.Theme.Theme.LIGHT,
		telemetry = undefined,
		directorygroupid = undefined
	}: Props = $props()

	let authContextDirectoryGroupID = $derived(directorygroupid)
	let verboseResponse = $derived(State.VerboseResponse.value)

	let authedFetch = new Interfaces.AuthenticatedFetch.Client()

	onMount(() => {
		;(async () => {
			datum = await Interfaces.DirectoryGroups.Datum(
				authedFetch,
				{ metadata_model: JSON.parse(JSON.stringify(metadatamodel)), datum: JSON.parse(JSON.stringify(d)) },
				telemetry,
				directorygroupid
			)

			if (d) {
				datum.previousDatum = JSON.parse(JSON.stringify(d))
			}
		})()
	})

	//@ts-expect-error
	let datum: Domain.Interfaces.DirectoryGroups.Datum = $state({})

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
</script>

<svelte:window bind:innerWidth={windowWidth} />

<div class="flex w-full flex-col gap-y-2 overflow-hidden">
	<main class="flex flex-1 flex-col gap-y-4 overflow-auto">
		<fieldset
			class="fieldset {theme === Domain.Entities.Theme.Theme.DARK
				? 'border-gray-900 bg-gray-700'
				: 'border-gray-300 bg-gray-100'} rounded-box w-full border p-4"
		>
			<legend class="fieldset-legend flex gap-x-2">
				<div class="text-md h-fit self-center">Display Name <span class="font-bold italic">(Required)</span></div>
			</legend>

			<p>Will be checked for uniqueness against existing groups</p>

			<input
				class="input flex-1 {themecolor === Domain.Entities.Theme.Color.PRIMARY
					? 'input-primary'
					: themecolor === Domain.Entities.Theme.Color.SECONDARY
						? 'input-secondary'
						: 'input-accent'} min-h-[48px] w-full"
				placeholder="Enter display name..."
				type="text"
				value={datum.displayName}
				oninput={(event: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
					datum.updateName(event.currentTarget.value)
				}}
			/>

			{#if Array.isArray(datum.displayNameError) && datum.displayNameError.length > 0}
				<ul class="text-md text-error list-inside list-disc">
					{#each datum.displayNameError as e}
						<li>{e}</li>
					{/each}
				</ul>
			{/if}
		</fieldset>

		<fieldset
			class="fieldset {theme === Domain.Entities.Theme.Theme.DARK
				? 'border-gray-900 bg-gray-700'
				: 'border-gray-300 bg-gray-100'} rounded-box w-full border p-4"
		>
			<legend class="fieldset-legend flex gap-x-2">
				<div class="text-md h-fit self-center">Description <span class="font-bold italic">(Required)</span></div>
			</legend>

			<textarea
				class="textarea flex-1 {themecolor === Domain.Entities.Theme.Color.PRIMARY
					? 'textarea-primary'
					: themecolor === Domain.Entities.Theme.Color.SECONDARY
						? 'textarea-secondary'
						: 'textarea-accent'} w-full"
				placeholder="Enter description..."
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

		{#if datum.dataMetadataModel}
			{#await import("$lib/components/MetadataModel/Datum/Input/Component.svelte") then { default: MetadataModelDatumInput }}
				<MetadataModelDatumInput
					metadatamodel={datum.dataMetadataModel}
					datum={datum.data}
					{themecolor}
					{theme}
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
		{:else if datum.data}
			{@render json(datum.data)}
		{/if}
	</main>

	{#if State.Session.session && State.Session.tokens && directorygroupid}
		<footer class="join w-full pb-2">
			{#if (datum.id && datum.update) || datum.delete}
				{#if datum.id}
					<button
						class="join-item btn flex-1 {themecolor === Domain.Entities.Theme.Color.PRIMARY
							? 'btn-primary'
							: themecolor === Domain.Entities.Theme.Color.SECONDARY
								? 'btn-secondary'
								: 'btn-accent'}"
						onclick={() => {
							goto(`${Utils.Env.BasePath}${Domain.Entities.Url.WebsitePaths.Home}?${Domain.Entities.Url.SearchParams.DIRECTORY_GROUP_ID}=${datum.id}`)
						}}
					>
						<!--game-icons:exit-door source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 512 512">
							<path
								fill="var({Utils.Theme.GetColorContent(themecolor)})"
								d="M217 28.098v455.804l142-42.597V70.697zm159.938 26.88l.062 2.327V87h16V55zM119 55v117.27h18V73h62V55zm258 50v16h16v-16zm0 34v236h16V139zm-240 58.727V233H41v46h96v35.273L195.273 256zM244 232c6.627 0 12 10.745 12 24s-5.373 24-12 24s-12-10.745-12-24s5.373-24 12-24M137 339.73h-18V448h18zM377 393v14h16v-14zm0 32v23h16v-23zM32 471v18h167v-18zm290.652 0l-60 18H480v-18z"
							/>
						</svg>
						{#if windowWidth > 768}
							<span class="self-center">launch group</span>
						{/if}
					</button>
				{/if}

				<button
					class="join-item btn flex-1 {themecolor === Domain.Entities.Theme.Color.PRIMARY
						? 'btn-primary'
						: themecolor === Domain.Entities.Theme.Color.SECONDARY
							? 'btn-secondary'
							: 'btn-accent'}"
					onclick={async () => {
						if (datum.id && datum.update) {
							State.Loading.value = `Updating ${Domain.Entities.DirectoryGroups.RepositoryName}`

							try {
								const toastData = await datum.update(authedFetch, directorygroupid!, {
									componentName: COMPONENT_NAME,
									telemetry,
									authContextDirectoryGroupID,
									verboseResponse
								})

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
								State.Loading.value = `Creating new ${Domain.Entities.DirectoryGroups.RepositoryName}`

								try {
									const toastData = await datum.create(authedFetch, directorygroupid!, {
										componentName: COMPONENT_NAME,
										telemetry,
										authContextDirectoryGroupID,
										verboseResponse
									})

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
								fill="var({Utils.Theme.GetColorContent(themecolor)})"
								d="M20.71 7.04c.39-.39.39-1.04 0-1.41l-2.34-2.34c-.37-.39-1.02-.39-1.41 0l-1.84 1.83l3.75 3.75M3 17.25V21h3.75L17.81 9.93l-3.75-3.75z"
							/>
						</svg>
						{#if windowWidth > 768}
							<span class="self-center">update</span>
						{/if}
					{:else if datum.create}
						<!--mdi:add-bold source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
							<path fill="var({Utils.Theme.GetColorContent(themecolor)})" d="M20 14h-6v6h-4v-6H4v-4h6V4h4v6h6z" />
						</svg>

						{#if windowWidth > 768}
							<span class="self-center">create</span>
						{/if}
					{/if}
				</button>

				{@render deletedirectorygroup()}
			{/if}
		</footer>
	{/if}
</div>

{#snippet deletedirectorygroup()}
	{#if datum.id && typeof datum.delete === 'function'}
		<button
			class="join-item btn flex-1 {State.ThemeColor.value === Domain.Entities.Theme.Color.PRIMARY
				? 'btn-primary'
				: State.ThemeColor.value === Domain.Entities.Theme.Color.SECONDARY
					? 'btn-secondary'
					: 'btn-accent'}"
			onclick={async () => {
				State.Loading.value = `Deleting ${Domain.Entities.DirectoryGroups.RepositoryName}`
				try {
					const toastData = await datum.delete!(authedFetch, directorygroupid!, {
						componentName: COMPONENT_NAME,
						telemetry,
						authContextDirectoryGroupID,
						verboseResponse
					})

					State.Toast.Type = toastData.Type
					State.Toast.Message = toastData.Message
					State.Toast.MedataModelSearchResults = toastData.MedataModelSearchResults

					if (toastData.Type === Domain.Entities.Toast.Type.SUCCESS) {
						if (datum.reset) {
							datum.reset()
						}
						delete datum.id
						delete datum.previousDatum
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
		class="h-fit max-h-[50vh] w-full flex-1 overflow-auto rounded-md {theme === Domain.Entities.Theme.Theme.DARK
			? 'border-gray-900 bg-gray-700'
			: 'bg-gray-200'} p-1 shadow-inner shadow-gray-800 lg:max-w-[50vw]"><code>{JSON.stringify(value, null, 4)}</code></pre>
{/snippet}
