<script lang="ts">
	import { Domain } from '$lib'

	const COMPONENT_NAME = 'file-view'

	interface Props {
		storagefile: Domain.Entities.StorageFiles.Interface
		authcontextdirectorygroupid?: string
		telemetry?: Domain.Interfaces.ITelemetry
		themecolor?: Domain.Entities.Theme.Color
		theme?: Domain.Entities.Theme.Theme
	}

	let {
		storagefile,
		authcontextdirectorygroupid,
		telemetry = undefined,
		themecolor = Domain.Entities.Theme.Color.PRIMARY,
		theme = Domain.Entities.Theme.Theme.LIGHT
	}: Props = $props()

	let fileUrl: string = $derived.by(() => {
		if (Array.isArray(storagefile.id) && storagefile.id.length > 0) {
			const url = new URL(`${Domain.Entities.Url.ApiUrlPaths.Storage.Files}/${storagefile.id[0]}`)
			if (authcontextdirectorygroupid) {
				url.searchParams.append(Domain.Entities.Url.SearchParams.AUTH_CONTEXT_DIRECTORY_GROUP_ID, authcontextdirectorygroupid)
			}

			telemetry?.Log(COMPONENT_NAME, true, Domain.Entities.Telemetry.LogLevel.DEBUG, 'File Url', url.toJSON())

			return url.toString()
		}

		return ''
	})
</script>

<div class="join flex flex-1 flex-col overflow-hidden">
	{#if fileUrl.length > 0}
		<main class="join-item flex flex-[9.5] justify-center overflow-auto">
			{#if Array.isArray(storagefile.storage_file_mime_type) && storagefile.storage_file_mime_type.length > 0}
				{@const mimeType = storagefile.storage_file_mime_type[0]}

				{#if mimeType.startsWith('image/')}
					<img
						src={fileUrl}
						class="self-center"
						alt={Array.isArray(storagefile.original_name) && storagefile.original_name.length > 0 ? storagefile.original_name[0] : storagefile.id![0]}
					/>
				{:else if mimeType.startsWith('audio/')}
					<audio class="self-center" controls src={fileUrl}></audio>
				{:else if mimeType.startsWith('video/')}
					<video class="self-center" controls>
						<source src={fileUrl} />
						<track kind="captions" />
					</video>
				{:else if mimeType === 'application/pdf'}
					{@render iframe()}
				{:else}
					<a class="btn btn-xl glass self-center" href={fileUrl} target="_blank"> download </a>
				{/if}
			{:else}
				{@render iframe()}
			{/if}
		</main>

		<a
			class="join-item btn w-full {themecolor === Domain.Entities.Theme.Color.PRIMARY
				? 'btn-primary'
				: themecolor === Domain.Entities.Theme.Color.SECONDARY
					? 'btn-secondary'
					: 'btn-accent'} flex gap-x-1 self-center"
			href={fileUrl}
			target="_blank"
		>
			<span>open in new window</span>
			<!--mdi:open-in-new source: https://icon-sets.iconify.design-->
			<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
				><path
					fill="currentColor"
					d="M14 3v2h3.59l-9.83 9.83l1.41 1.41L19 6.41V10h2V3m-2 16H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7h-2z"
				/>
			</svg>
		</a>
	{:else}
		<span class="text-error text-md self-center">could not generate valid file url</span>
	{/if}
</div>

{#snippet iframe()}
	<iframe
		class="self-center"
		src={fileUrl}
		title={Array.isArray(storagefile.original_name) && storagefile.original_name.length > 0 ? storagefile.original_name[0] : storagefile.id![0]}
		height="100%"
		width="100%"
	></iframe>
{/snippet}
