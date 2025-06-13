<!--
@component

Manage `timestamp` related field properties.


Props:
- value -
- themecolor -
- updatevalue -
- fieldDataType -
-->
<script lang="ts">
	import { Component, Domain, MetadataModel, Utils } from '$lib'

	import Papa from 'papaparse'

	const COMPONENT_NAME = 'metadata-model-edit-field-group-field-timestamp'

	interface Props {
		value?: MetadataModel.ISelectOption[]
		themecolor?: Domain.Entities.Theme.Color
		updatevalue: (value?: MetadataModel.ISelectOption[]) => void
		fieldDataType?: MetadataModel.FieldType | string
	}

	let { value = undefined, themecolor = Domain.Entities.Theme.Color.PRIMARY, updatevalue, fieldDataType = undefined }: Props = $props()

	let fieldSelectOptions: MetadataModel.ISelectOption[] = $derived(value || [])

	let fieldSelectOptionsFocused: boolean | null | undefined = $state(undefined)

	$effect(() => {
		updatevalue(fieldSelectOptions)
	})

	/**
	 * Error if {@linkcode fieldgroup} {@linkcode MetadataModel.FgProperties.FIELD_DATETIME_FORMAT} length is not valid.
	 */
	let fieldSelectOptionsLengthNotValid: string | null = $derived.by(() => {
		if (fieldSelectOptions.length === 0) {
			return 'Select options must be at least one.'
		}

		return null
	})

	/**
	 * Combine {@linkcode fieldgroup} {@linkcode MetadataModel.FgProperties.FIELD_DATETIME_FORMAT} errors.
	 */
	let fieldSelectOptionsError: string[] = $derived.by(() => {
		let error: string[] = []

		if (fieldSelectOptionsLengthNotValid) {
			error.push(fieldSelectOptionsLengthNotValid)
		}

		return error
	})

	let noOfSelectOptions: number = $derived(fieldSelectOptions.length)

	let selectStart: number = $state(0)

	let selectEnd: number = $state(0)

	function initSelectOption(sIndex: number) {
		if (fieldDataType !== MetadataModel.FieldType.ANY) {
			switch (fieldDataType as MetadataModel.FieldType) {
				case MetadataModel.FieldType.TEXT:
					if (fieldSelectOptions[sIndex][MetadataModel.FSelectProperties.TYPE] !== MetadataModel.FSelectType.TEXT) {
						fieldSelectOptions[sIndex][MetadataModel.FSelectProperties.TYPE] = MetadataModel.FSelectType.TEXT
					}
					if (typeof fieldSelectOptions[sIndex][MetadataModel.FSelectProperties.VALUE] !== 'string') {
						delete fieldSelectOptions[sIndex][MetadataModel.FSelectProperties.VALUE]
					}
					break
				case MetadataModel.FieldType.NUMBER:
					if (fieldSelectOptions[sIndex][MetadataModel.FSelectProperties.TYPE] !== MetadataModel.FSelectType.NUMBER) {
						fieldSelectOptions[sIndex][MetadataModel.FSelectProperties.TYPE] = MetadataModel.FSelectType.NUMBER
					}
					if (typeof fieldSelectOptions[sIndex][MetadataModel.FSelectProperties.VALUE] !== 'number') {
						delete fieldSelectOptions[sIndex][MetadataModel.FSelectProperties.VALUE]
					}
					break
				case MetadataModel.FieldType.BOOLEAN:
					if (fieldSelectOptions[sIndex][MetadataModel.FSelectProperties.TYPE] !== MetadataModel.FSelectType.BOOLEAN) {
						fieldSelectOptions[sIndex][MetadataModel.FSelectProperties.TYPE] = MetadataModel.FSelectType.BOOLEAN
					}
					if (typeof fieldSelectOptions[sIndex][MetadataModel.FSelectProperties.VALUE] !== 'boolean') {
						delete fieldSelectOptions[sIndex][MetadataModel.FSelectProperties.VALUE]
					}
					break
			}
		}
	}
</script>

{#if fieldSelectOptionsFocused && fieldSelectOptionsError.length > 0}
	<ul class="text-md text-error list-inside list-disc">
		{#each fieldSelectOptionsError as e}
			<li>{e}</li>
		{/each}
	</ul>
{/if}

<div class="flex flex-col gap-y-2">
	<header class="join w-fit self-center">
		<input
			class="join-item file-input tooltip {themecolor === Domain.Entities.Theme.Color.PRIMARY
				? 'file-input-primary tooltip-primary'
				: themecolor === Domain.Entities.Theme.Color.SECONDARY
					? 'file-input-secondary tooltip-secondary'
					: 'file-input-accent tooltip-accent'}"
			type="file"
			accept="text/csv"
			onchange={async (e: any) => {
				if (fieldDataType !== MetadataModel.FieldType.ANY && fieldDataType !== MetadataModel.FieldType.TEXT) {
					return
				}

				if (e.target.files === null) {
					return
				}
				const fileList = e.target.files as FileList
				if (fileList.item(0)?.type !== 'text/csv') {
					return
				}
				const fileText = await fileList.item(0)?.text()
				if (typeof fileText === 'undefined') {
					return
				}
				const results = Papa.parse(fileText)
				if (results.data.length === 0) {
					return
				}

				let newSelectOptions: MetadataModel.ISelectOption[] = []
				for (const datum of results.data) {
					if (Array.isArray(datum) && datum.length > 0) {
						if (typeof datum[0] === 'string' && datum[0].length > 0) {
							let so: MetadataModel.ISelectOption = {
								[MetadataModel.FSelectProperties.LABEL]: datum[0],
								[MetadataModel.FSelectProperties.TYPE]: MetadataModel.FSelectType.TEXT
							}

							if (typeof datum[1] === 'string' && datum[1].length > 0) {
								so[MetadataModel.FSelectProperties.VALUE] = datum[1]
							} else {
								so[MetadataModel.FSelectProperties.VALUE] = datum[0]
							}

							newSelectOptions = [...newSelectOptions, so]
						}
					}
				}

				if (newSelectOptions.length > 0) {
					fieldSelectOptions = newSelectOptions
				}
			}}
			data-tip="Upload select options as csv"
		/>

		<button
			class="join-item btn tooltip {themecolor === Domain.Entities.Theme.Color.PRIMARY
				? 'btn-primary tooltip-primary'
				: themecolor === Domain.Entities.Theme.Color.SECONDARY
					? 'btn-secondary tooltip-secondary'
					: 'btn-accent'}"
			onclick={(e: Event) => {
				if (fieldSelectOptions.length > 0) {
					try {
						const dataToParse: any[][] = fieldSelectOptions.map((so) => {
							let selOpt: any[] = []
							if (typeof so[MetadataModel.FSelectProperties.LABEL] === 'string') {
								selOpt.push(so[MetadataModel.FSelectProperties.LABEL])
							}
							if (typeof so[MetadataModel.FSelectProperties.VALUE] !== 'undefined') {
								selOpt.push(so[MetadataModel.FSelectProperties.VALUE])
							}
							return selOpt
						})

						const objectUrl = URL.createObjectURL(new Blob([Papa.unparse(dataToParse, { header: true })], { type: 'text/csv' }))
						const downloadLink = document.createElement('a')
						downloadLink.href = objectUrl
						downloadLink.setAttribute('download', `data.csv`)
						document.body.appendChild(downloadLink)
						downloadLink.click()
						document.body.removeChild(downloadLink)
						URL.revokeObjectURL(objectUrl)
					} catch (err) {
						console.error(COMPONENT_NAME, err)
					}
				}
			}}
			disabled={fieldSelectOptions.length === 0}
			data-tip="Download select options as csv"
		>
			<!--mdi:download-circle source: https://icon-sets.iconify.design-->
			<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
				<path
					fill="var({Utils.Theme.GetColorContent(themecolor)})"
					d="M12 2c5.5 0 10 4.5 10 10s-4.5 10-10 10S2 17.5 2 12S6.5 2 12 2M8 17h8v-2H8zm8-7h-2.5V6h-3v4H8l4 4z"
				/>
			</svg>
		</button>

		<button
			class="join-item btn tooltip {themecolor === Domain.Entities.Theme.Color.PRIMARY
				? 'btn-primary tooltip-primary'
				: themecolor === Domain.Entities.Theme.Color.SECONDARY
					? 'btn-secondary tooltip-secondary'
					: 'btn-accent'}"
			onclick={() => {
				fieldSelectOptions = [{}, ...fieldSelectOptions]
				initSelectOption(0)
			}}
			data-tip="Add new select option"
		>
			<!--mdi:plus-circle source: https://icon-sets.iconify.design-->
			<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
				<path
					fill="var({Utils.Theme.GetColorContent(themecolor)})"
					d="M17 13h-4v4h-2v-4H7v-2h4V7h2v4h4m-5-9A10 10 0 0 0 2 12a10 10 0 0 0 10 10a10 10 0 0 0 10-10A10 10 0 0 0 12 2"
				/>
			</svg>
		</button>
	</header>

	<main class="flex max-h-[50vh] justify-center overflow-auto rounded-md">
		<div style="display: grid; grid-template-columns: auto auto auto auto;">
			{#each Utils.Range(selectStart, Utils.RangeArrayEnd(selectEnd, noOfSelectOptions)) as sIndex (sIndex)}
				{@const selectOption = fieldSelectOptions[sIndex]}

				{#if selectOption}
					<input
						class="input rounded-none {themecolor === Domain.Entities.Theme.Color.PRIMARY
							? 'input-primary'
							: themecolor === Domain.Entities.Theme.Color.SECONDARY
								? 'input-secondary'
								: 'input-accent'}"
						type="text"
						placeholder="label..."
						value={fieldSelectOptions[sIndex][MetadataModel.FSelectProperties.LABEL]}
						oninput={(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
							if (e.currentTarget.value.length > 0) {
								fieldSelectOptions[sIndex][MetadataModel.FSelectProperties.LABEL] = e.currentTarget.value
							} else {
								delete fieldSelectOptions[sIndex][MetadataModel.FSelectProperties.LABEL]
							}
						}}
					/>

					<select
						class="select select-md rounded-none ${themecolor === Domain.Entities.Theme.Color.PRIMARY
							? 'select-primary'
							: themecolor === Domain.Entities.Theme.Color.SECONDARY
								? 'select-secondary'
								: 'select-accent'} w-full"
						onchange={(e: Event & { currentTarget: EventTarget & HTMLSelectElement }) => {
							if (e.currentTarget.value.length > 0) {
								fieldSelectOptions[sIndex][MetadataModel.FSelectProperties.TYPE] = e.currentTarget.value as MetadataModel.FSelectType
							} else {
								delete fieldSelectOptions[sIndex][MetadataModel.FSelectProperties.TYPE]
							}
						}}
						disabled={fieldDataType !== MetadataModel.FieldType.ANY}
					>
						<option
							disabled
							value=""
							selected={typeof selectOption[MetadataModel.FSelectProperties.TYPE] !== 'string' ||
								(selectOption[MetadataModel.FSelectProperties.TYPE] as string).length === 0}>Choose value data type...</option
						>
						{#each MetadataModel.FSelectTypes as fst}
							<option value={fst} selected={selectOption && selectOption[MetadataModel.FSelectProperties.TYPE] === fst}>
								{fst}
							</option>
						{/each}
					</select>

					{#if selectOption}
						{#if selectOption[MetadataModel.FSelectProperties.TYPE] === MetadataModel.FSelectType.NUMBER}
							<input
								class="input input-md rounded-none {themecolor === Domain.Entities.Theme.Color.PRIMARY
									? 'input-primary'
									: themecolor === Domain.Entities.Theme.Color.SECONDARY
										? 'input-secondary'
										: 'input-accent'}"
								type="number"
								placeholder="value..."
								value={selectOption[MetadataModel.FSelectProperties.VALUE]}
								oninput={(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
									if (e.currentTarget.value.length > 0) {
										if (!Number.isNaN(e.currentTarget.value)) {
											fieldSelectOptions[sIndex][MetadataModel.FSelectProperties.VALUE] = Number(e.currentTarget.value)
										} else {
											delete fieldSelectOptions[sIndex][MetadataModel.FSelectProperties.VALUE]
										}
									} else {
										delete fieldSelectOptions[sIndex][MetadataModel.FSelectProperties.VALUE]
									}
								}}
							/>
						{:else if selectOption[MetadataModel.FSelectProperties.TYPE] === MetadataModel.FSelectType.TEXT}
							<input
								class="input input-md rounded-none {themecolor === Domain.Entities.Theme.Color.PRIMARY
									? 'input-primary'
									: themecolor === Domain.Entities.Theme.Color.SECONDARY
										? 'input-secondary'
										: 'input-accent'}"
								type="text"
								placeholder="value..."
								value={selectOption[MetadataModel.FSelectProperties.VALUE] || ''}
								oninput={(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
									if (e.currentTarget.value.length > 0) {
										fieldSelectOptions[sIndex][MetadataModel.FSelectProperties.VALUE] = e.currentTarget.value
									} else {
										delete fieldSelectOptions[sIndex][MetadataModel.FSelectProperties.VALUE]
									}
								}}
							/>
						{:else if selectOption[MetadataModel.FSelectProperties.TYPE] === MetadataModel.FSelectType.BOOLEAN}
							<input
								class="checkbox checkbox-md rounded-none {themecolor === Domain.Entities.Theme.Color.PRIMARY
									? 'checkbox-primary'
									: themecolor === Domain.Entities.Theme.Color.SECONDARY
										? 'checkbox-secondary'
										: 'checkbox-accent'}"
								type="checkbox"
								checked={selectOption[MetadataModel.FSelectProperties.VALUE] || false}
								oninput={(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
									fieldSelectOptions[sIndex][MetadataModel.FSelectProperties.VALUE] = e.currentTarget.checked
								}}
							/>
						{:else}
							{@render emptySelectOption()}
						{/if}
					{:else}
						{@render emptySelectOption()}
					{/if}

					<button
						class="btn btn-error btn-md btn-square rounded-none"
						onclick={() => {
							fieldSelectOptions = fieldSelectOptions.filter((_, index) => index !== sIndex)
						}}
					>
						<!--mdi:delete source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
							<path fill="var(--color-error-content)" d="M19 4h-3.5l-1-1h-5l-1 1H5v2h14M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6z" />
						</svg>
					</button>
				{/if}
			{/each}
		</div>
	</main>

	<footer class="flex w-full justify-center">
		<Component.Pagination
			{themecolor}
			lengthofdata={noOfSelectOptions}
			start={selectStart}
			end={selectEnd}
			updatestart={(n: number) => (selectStart = n)}
			updateend={(n: number) => (selectEnd = n)}
			contentperpage={10}
		></Component.Pagination>
	</footer>
</div>

{#snippet emptySelectOption()}
	<div
		class="h-full w-full border {themecolor === Domain.Entities.Theme.Color.PRIMARY
			? 'border-primary'
			: themecolor === Domain.Entities.Theme.Color.SECONDARY
				? 'border-secondary'
				: 'border-accent'}"
	></div>
{/snippet}
