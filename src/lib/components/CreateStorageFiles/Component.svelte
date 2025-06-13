<script lang="ts">
	import { Component, Domain, Interfaces, State, Utils } from '$lib'

	const COMPONENT_NAME = 'create-storage-files'

	interface Props {
		themecolor?: Domain.Entities.Theme.Color
		theme?: Domain.Entities.Theme.Theme
		telemetry?: Domain.Interfaces.ITelemetry
		directorygroupid?: string
		onuploadedfiles?: (value: Domain.Entities.StorageFiles.Interface[]) => void
	}

	let {
		themecolor = Domain.Entities.Theme.Color.PRIMARY,
		theme = Domain.Entities.Theme.Theme.LIGHT,
		telemetry = undefined,
		directorygroupid = undefined,
		onuploadedfiles = undefined
	}: Props = $props()

	let tags: string[] = $state([])

	let files: FileList = $state(new DataTransfer().files)

	async function handleUploadFiles() {
		if (!directorygroupid || files.length === 0) {
			return
		}

		tags = tags.filter((value) => value.length > 0)
		let noOfFilesProcessed = 1
		let noOfFilesUploadedSuccessfully = 0
		let fileUploadErrors: string[] = []
		let uploadedStorageFiles: Domain.Entities.StorageFiles.Interface[] = []
		for (const f of files) {
			let formData = new FormData()
			formData.append(Domain.Entities.StorageFiles.FieldColumn.DirectoryGroupsID, directorygroupid)
			formData.append(Domain.Entities.StorageFiles.RepositoryName, f)
			if (tags.length > 0) {
				formData.append(Domain.Entities.StorageFiles.FieldColumn.Tags, tags.join(','))
			}

			const fetchUrl = new URL(`${Domain.Entities.Url.ApiUrlPaths.Storage.Files}/${Domain.Entities.Url.Action.CREATE}`)
			fetchUrl.searchParams.append(Domain.Entities.Url.SearchParams.DIRECTORY_GROUP_ID, directorygroupid)
			fetchUrl.searchParams.append(Domain.Entities.Url.SearchParams.AUTH_CONTEXT_DIRECTORY_GROUP_ID, directorygroupid)

			telemetry?.Log(COMPONENT_NAME, true, Domain.Entities.Telemetry.LogLevel.DEBUG, 'uploading file', 'formData', formData)
			State.Loading.value = `uploading ${noOfFilesProcessed}/${files.length} files..`
			try {
				const fetchResponse = await fetch(fetchUrl, {
					method: 'POST',
					credentials: 'include',
					body: formData
				})

				const fetchData = await fetchResponse.json()
				if (fetchResponse.ok) {
					noOfFilesUploadedSuccessfully += 1
					uploadedStorageFiles.push(fetchData)
				} else {
					fileUploadErrors = [...fileUploadErrors, `${noOfFilesProcessed} (${f.name}): ${fetchResponse.status}-${fetchData.message}`]
				}
			} catch (e) {
				telemetry?.Log(COMPONENT_NAME, true, Domain.Entities.Telemetry.LogLevel.DEBUG, 'upload file failed', 'formData', e)
			} finally {
				noOfFilesProcessed += 1
			}
		}
		State.Loading.value = undefined
		if (fileUploadErrors.length > 0) {
			State.Toast.Type = Domain.Entities.Toast.Type.ERROR
			State.Toast.Message = [`uploaded ${noOfFilesUploadedSuccessfully}/${noOfFilesProcessed - 1} successfuly`, ...fileUploadErrors]
		} else {
			State.Toast.Type = Domain.Entities.Toast.Type.SUCCESS
			State.Toast.Message = `uploaded ${noOfFilesUploadedSuccessfully}/${noOfFilesProcessed - 1} successfuly`
			resetFields()
		}

		if (onuploadedfiles) {
			onuploadedfiles(uploadedStorageFiles)
		}
	}

	function resetFields() {
		tags = []
		files = new DataTransfer().files
	}

	let noOfTags: number = $derived(tags.length)

	let tagsStart: number = $state(0)

	let tagsEnd: number = $state(0)

	function updateTags(index: number, value: string) {
		if (typeof value === 'string') {
			if (value.length > 0) {
				if (index > tags.length - 1) {
					for (let i = tags.length; i <= index; i++) {
						tags.push('')
					}
				}
				tags[index] = value
			} else {
				deleteTags(index)
			}
		} else {
			deleteTags(index)
		}
	}

	function deleteTags(index: number) {
		if (index < tags.length) {
			tags = tags.filter((_, tIndex) => tIndex !== index)
		}
	}
</script>

<div class="flex flex-1 flex-col gap-y-6 not-only-of-type:overflow-hidden">
	<main class="flex flex-1 flex-col gap-y-4 overflow-hidden">
		<input
			class="file-input w-full {themecolor === Domain.Entities.Theme.Color.PRIMARY
				? 'file-input-primary'
				: themecolor === Domain.Entities.Theme.Color.SECONDARY
					? 'file-input-secondary'
					: 'file-input-accent'}"
			type="file"
			multiple
			bind:files
		/>

		<section class="flex flex-col">
			<div class="divider mt-0 mb-1">
				<span class="self-center">tags</span>

				<span class="join">
					<button
						class="join-item btn btn-sm tooltip tooltip-left self-center {State.ThemeColor.value === Domain.Entities.Theme.Color.PRIMARY
							? 'btn-primary tooltip-primary'
							: State.ThemeColor.value === Domain.Entities.Theme.Color.SECONDARY
								? 'btn-secondary tooltip-secondary'
								: 'btn-accent tooltip-accent'}"
						aria-label="Reset Tags"
						data-tip="Reset tags"
						onclick={() => {
							tags = []
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
						class="join-item btn btn-sm tooltip tooltip-right self-center {State.ThemeColor.value === Domain.Entities.Theme.Color.PRIMARY
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
			</div>

			<main class="flex flex-col gap-y-2 overflow-auto p-2">
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
							value={tags[tgsIndex]}
							oninput={(event: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
								updateTags(tgsIndex, event.currentTarget.value)
							}}
						/>

						<span class="label">
							<button
								class="btn btn-md btn-ghost"
								aria-label="Delete tag {tgsIndex}"
								onclick={() => {
									deleteTags(tgsIndex)
									if (tgsIndex > tags.length - 1) {
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

			<footer class="flex w-full justify-center">
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

			<div class="divider mt-0 mb-0"></div>
		</section>
	</main>

	<button
		class="btn btn-md w-full {themecolor === Domain.Entities.Theme.Color.PRIMARY
			? 'btn-primary'
			: themecolor === Domain.Entities.Theme.Color.SECONDARY
				? 'btn-secondary'
				: 'btn-accent'}"
		aria-label="Upload files"
		onclick={handleUploadFiles}
	>
		upload file(s)
	</button>
</div>
