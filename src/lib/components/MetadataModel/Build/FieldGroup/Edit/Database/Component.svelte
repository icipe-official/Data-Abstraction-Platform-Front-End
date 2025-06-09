<!--
@component

Edit field/group properties related to the database.

Props:
- fieldgroup -
- themecolor -
- theme - 
- updatefieldgroup -
-->
<script lang="ts">
	import { Domain, MetadataModel, Utils } from '$lib'
	import { untrack } from 'svelte'
	import { FooterSnippet } from '../Snippets/Footer.svelte'
	import { fade } from 'svelte/transition'

	const COMPONENT_NAME = 'metadata-model-edit-field-group-database'

	interface Props {
		fieldgroup: any
		themecolor?: Domain.Entities.Theme.Color
		theme?: Domain.Entities.Theme.Theme
		updatefieldgroup: (fieldgroup: any) => void
	}

	let { fieldgroup, themecolor = Domain.Entities.Theme.Color.PRIMARY, theme = Domain.Entities.Theme.Theme.LIGHT, updatefieldgroup }: Props = $props()

	/**
	 * Unique ID for showing tooltip/hint information.
	 */
	let showTooltipID: string = $state('')

	let databaseTableCollectionUid: string = $derived(fieldgroup[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_UID] || '')
	/**
	 * Error if {@linkcode fieldgroup} {@linkcode MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_UID} length is not valid.
	 */
	let databeTableCollectionUidLengthNotValid: string | null = $derived.by(() => {
		if (databaseTableCollectionUid.length === 0) {
			return 'Value must be at least one character in length.'
		}

		return null
	})
	/**
	 * Combine {@linkcode fieldgroup} {@linkcode MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_UID} errors.
	 */
	let databeTableCollectionUidError: string[] = $derived.by(() => {
		let error: string[] = []

		if (databeTableCollectionUidLengthNotValid) {
			error.push(databeTableCollectionUidLengthNotValid)
		}

		return error
	})
	let databeTableCollectionUidInputFocused: boolean | null | undefined = $state(undefined)
	$effect(() => {
		if (databeTableCollectionUidError.length === 0) {
			updateDatabeTableCollectionUid(databaseTableCollectionUid)
		} else {
			untrack(() => {
				delete fieldgroup[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_UID]
			})
		}
	})
	function updateDatabeTableCollectionUid(value: string) {
		fieldgroup[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_UID] = value
	}

	let databaseTableCollectionName: string = $derived(fieldgroup[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_NAME] || '')
	/**
	 * Error if {@linkcode fieldgroup} {@linkcode MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_NAME} length is not valid.
	 */
	let databaseTableCollectionNameLengthNotValid: string | null = $derived.by(() => {
		if (databaseTableCollectionName.length === 0) {
			return 'Value must be at least one character in length.'
		}

		return null
	})
	/**
	 * Combine {@linkcode fieldgroup} {@linkcode MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_NAME} errors.
	 */
	let databaseTableCollectionNameError: string[] = $derived.by(() => {
		let error: string[] = []

		if (databaseTableCollectionNameLengthNotValid) {
			error.push(databaseTableCollectionNameLengthNotValid)
		}

		return error
	})
	let databaseTableCollectionNameInputFocused: boolean | null | undefined = $state(undefined)
	$effect(() => {
		if (databaseTableCollectionNameError.length === 0) {
			updateDatabaseTableCollectionName(databaseTableCollectionName)
		} else {
			untrack(() => {
				delete fieldgroup[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_NAME]
			})
		}
	})
	function updateDatabaseTableCollectionName(value: string) {
		fieldgroup[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_NAME] = value
	}

	let databaseFieldColumnName: string = $derived(fieldgroup[MetadataModel.FgProperties.DATABASE_FIELD_COLUMN_NAME] || '')
	/**
	 * Error if {@linkcode fieldgroup} {@linkcode MetadataModel.FgProperties.DATABASE_FIELD_COLUMN_NAME} length is not valid.
	 */
	let databaseFieldColumnNameLengthNotValid: string | null = $derived.by(() => {
		if (databaseFieldColumnName.length === 0) {
			return 'Value must be at least one character in length.'
		}

		return null
	})
	/**
	 * Combine {@linkcode fieldgroup} {@linkcode MetadataModel.FgProperties.DATABASE_FIELD_COLUMN_NAME} errors.
	 */
	let databaseFieldColumnNameError: string[] = $derived.by(() => {
		let error: string[] = []

		if (databaseFieldColumnNameLengthNotValid) {
			error.push(databaseFieldColumnNameLengthNotValid)
		}

		return error
	})
	let databaseFieldColumnNameInputFocused: boolean | null | undefined = $state(undefined)
	$effect(() => {
		if (databaseFieldColumnNameError.length === 0) {
			updateFieldViewValuesInSeparateColumnsHeaderFormat(databaseFieldColumnName)
		} else {
			untrack(() => {
				delete fieldgroup[MetadataModel.FgProperties.DATABASE_FIELD_COLUMN_NAME]
			})
		}
	})
	function updateFieldViewValuesInSeparateColumnsHeaderFormat(value: string) {
		fieldgroup[MetadataModel.FgProperties.DATABASE_FIELD_COLUMN_NAME] = value
	}

	let databaseSkipDataExtraction: boolean = $derived(fieldgroup[MetadataModel.FgProperties.DATABASE_SKIP_DATA_EXTRACTION] || false)
	$effect(() => {
		if (databaseSkipDataExtraction) {
			untrack(() => (fieldgroup[MetadataModel.FgProperties.DATABASE_SKIP_DATA_EXTRACTION] = true))
		} else {
			untrack(() => delete fieldgroup[MetadataModel.FgProperties.DATABASE_SKIP_DATA_EXTRACTION])
		}
	})

	let databaseFieldAddDataToFullTextSearchIndex: boolean = $derived(
		fieldgroup[MetadataModel.FgProperties.DATABASE_FIELD_ADD_DATA_TO_FULL_TEXT_SEARCH_INDEX] || false
	)
	$effect(() => {
		if (databaseFieldAddDataToFullTextSearchIndex) {
			untrack(() => (fieldgroup[MetadataModel.FgProperties.DATABASE_FIELD_ADD_DATA_TO_FULL_TEXT_SEARCH_INDEX] = true))
		} else {
			untrack(() => delete fieldgroup[MetadataModel.FgProperties.DATABASE_FIELD_ADD_DATA_TO_FULL_TEXT_SEARCH_INDEX])
		}
	})
</script>

<div class="flex flex-col gap-y-2" transition:fade>
	<main class="z-[1] flex flex-col gap-y-2 p-1">
		<fieldset
			class="fieldset {theme === Domain.Entities.Theme.Theme.DARK
				? 'border-gray-900 bg-gray-700'
				: 'border-gray-300 bg-gray-100'} rounded-box w-full border p-4"
		>
			<legend class="fieldset-legend flex gap-x-2">
				<div class="text-md h-fit self-center">Database table/collection unique id <span class="font-bold italic">(Optional)</span></div>

				<!-- svelte-ignore a11y_mouse_events_have_key_events -->
				<button
					class="btn {themecolor === Domain.Entities.Theme.Color.PRIMARY
						? 'btn-primary'
						: themecolor === Domain.Entities.Theme.Color.SECONDARY
							? 'btn-secondary'
							: 'btn-accent'} btn-circle h-fit min-h-fit w-fit self-center p-0"
					onmouseover={() => (showTooltipID = 'd-table-collection-uid')}
					onmouseout={() => (showTooltipID = '')}
					onclick={() => {
						const ID = 'd-table-collection-uid'
						if (showTooltipID === ID) {
							showTooltipID = ''
						} else {
							showTooltipID = ID
						}
					}}
				>
					<!--mdi:question-mark source: https://icon-sets.iconify.design-->
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
						<path
							fill="var({Utils.Theme.GetColorContent(themecolor)})"
							d="M10 19h3v3h-3zm2-17c5.35.22 7.68 5.62 4.5 9.67c-.83 1-2.17 1.66-2.83 2.5C13 15 13 16 13 17h-3c0-1.67 0-3.08.67-4.08c.66-1 2-1.59 2.83-2.25C15.92 8.43 15.32 5.26 12 5a3 3 0 0 0-3 3H6a6 6 0 0 1 6-6"
						/>
					</svg>
				</button>
			</legend>

			<input
				class="input flex-1 {themecolor === Domain.Entities.Theme.Color.PRIMARY
					? 'input-primary'
					: themecolor === Domain.Entities.Theme.Color.SECONDARY
						? 'input-secondary'
						: 'input-accent'} min-h-[48px] w-full"
				placeholder="Enter table/collection unique id..."
				type="text"
				bind:value={databaseTableCollectionUid}
				bind:focused={databeTableCollectionUidInputFocused}
			/>

			{#if showTooltipID === 'd-table-collection-uid'}
				<div class="label">May be relevant in identifying columns/fields that belong to a particular table/collection in a nested join.</div>
			{/if}

			{#if databeTableCollectionUidInputFocused && databeTableCollectionUidError.length > 0}
				<ul class="text-md text-error list-inside list-disc">
					{#each databeTableCollectionUidError as e}
						<li>{e}</li>
					{/each}
				</ul>
			{/if}
		</fieldset>

		{#if MetadataModel.IsGroupFieldContainsGroup(fieldgroup)}
			<fieldset
				class="fieldset {theme === Domain.Entities.Theme.Theme.DARK
					? 'border-gray-900 bg-gray-700'
					: 'border-gray-300 bg-gray-100'} rounded-box w-full border p-4"
			>
				<legend class="fieldset-legend flex gap-x-2">
					<div class="text-md h-fit self-center">Database Table/Collection name <span class="font-bold italic">(Optional)</span></div>

					<!-- svelte-ignore a11y_mouse_events_have_key_events -->
					<button
						class="btn {themecolor === Domain.Entities.Theme.Color.PRIMARY
							? 'btn-primary'
							: themecolor === Domain.Entities.Theme.Color.SECONDARY
								? 'btn-secondary'
								: 'btn-accent'} btn-circle h-fit min-h-fit w-fit self-center p-0"
						onmouseover={() => (showTooltipID = 'd-group-table-collection-name')}
						onmouseout={() => (showTooltipID = '')}
						onclick={() => {
							const ID = 'd-group-table-collection-name'
							if (showTooltipID === ID) {
								showTooltipID = ''
							} else {
								showTooltipID = ID
							}
						}}
					>
						<!--mdi:question-mark source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
							<path
								fill="var({Utils.Theme.GetColorContent(themecolor)})"
								d="M10 19h3v3h-3zm2-17c5.35.22 7.68 5.62 4.5 9.67c-.83 1-2.17 1.66-2.83 2.5C13 15 13 16 13 17h-3c0-1.67 0-3.08.67-4.08c.66-1 2-1.59 2.83-2.25C15.92 8.43 15.32 5.26 12 5a3 3 0 0 0-3 3H6a6 6 0 0 1 6-6"
							/>
						</svg>
					</button>
				</legend>

				<input
					class="input flex-1 {themecolor === Domain.Entities.Theme.Color.PRIMARY
						? 'input-primary'
						: themecolor === Domain.Entities.Theme.Color.SECONDARY
							? 'input-secondary'
							: 'input-accent'} min-h-[48px] w-full"
					placeholder="Enter table/collection name..."
					type="text"
					bind:value={databaseTableCollectionName}
					bind:focused={databaseTableCollectionNameInputFocused}
				/>

				{#if showTooltipID === 'd-group-table-collection-name'}
					<div class="label">May be relevant in identifying tables/collections while fetching data from the database.</div>
				{/if}

				{#if databaseTableCollectionNameInputFocused && databaseTableCollectionNameError.length > 0}
					<ul class="text-md text-error list-inside list-disc">
						{#each databaseTableCollectionNameError as e}
							<li>{e}</li>
						{/each}
					</ul>
				{/if}
			</fieldset>
		{/if}

		{#if MetadataModel.IsGroupFieldAField(fieldgroup)}
			<fieldset
				class="fieldset {theme === Domain.Entities.Theme.Theme.DARK
					? 'border-gray-900 bg-gray-700'
					: 'border-gray-300 bg-gray-100'} rounded-box w-full border p-4"
			>
				<legend class="fieldset-legend flex gap-x-2">
					<div class="text-md h-fit self-center">Database column/field name <span class="font-bold italic">(Optional)</span></div>

					<!-- svelte-ignore a11y_mouse_events_have_key_events -->
					<button
						class="btn {themecolor === Domain.Entities.Theme.Color.PRIMARY
							? 'btn-primary'
							: themecolor === Domain.Entities.Theme.Color.SECONDARY
								? 'btn-secondary'
								: 'btn-accent'} btn-circle h-fit min-h-fit w-fit self-center p-0"
						onmouseover={() => (showTooltipID = 'd-field-column-name')}
						onmouseout={() => (showTooltipID = '')}
						onclick={() => {
							const ID = 'd-field-column-name'
							if (showTooltipID === ID) {
								showTooltipID = ''
							} else {
								showTooltipID = ID
							}
						}}
					>
						<!--mdi:question-mark source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
							<path
								fill="var({Utils.Theme.GetColorContent(themecolor)})"
								d="M10 19h3v3h-3zm2-17c5.35.22 7.68 5.62 4.5 9.67c-.83 1-2.17 1.66-2.83 2.5C13 15 13 16 13 17h-3c0-1.67 0-3.08.67-4.08c.66-1 2-1.59 2.83-2.25C15.92 8.43 15.32 5.26 12 5a3 3 0 0 0-3 3H6a6 6 0 0 1 6-6"
							/>
						</svg>
					</button>
				</legend>

				<input
					class="input flex-1 {themecolor === Domain.Entities.Theme.Color.PRIMARY
						? 'input-primary'
						: themecolor === Domain.Entities.Theme.Color.SECONDARY
							? 'input-secondary'
							: 'input-accent'} min-h-[48px] w-full"
					placeholder="Enter column/field name..."
					type="text"
					bind:value={databaseFieldColumnName}
					bind:focused={databaseFieldColumnNameInputFocused}
				/>

				{#if showTooltipID === 'd-field-column-name'}
					<div class="label">May be relevant in identifying columns/fields while fetching data from the database.</div>
				{/if}

				{#if databaseFieldColumnNameInputFocused && databaseFieldColumnNameError.length > 0}
					<ul class="text-md text-error list-inside list-disc">
						{#each databaseFieldColumnNameError as e}
							<li>{e}</li>
						{/each}
					</ul>
				{/if}
			</fieldset>
		{/if}

		<fieldset
			class="fieldset {theme === Domain.Entities.Theme.Theme.DARK
				? 'border-gray-900 bg-gray-700'
				: 'border-gray-300 bg-gray-100'} rounded-box w-full border p-4"
		>
			<legend class="fieldset-legend flex gap-x-2">
				<div class="text-md h-fit self-center">Database Skip Data Extraction? <span class="font-bold italic">(Optional)</span></div>

				<!-- svelte-ignore a11y_mouse_events_have_key_events -->
				<button
					class="btn {themecolor === Domain.Entities.Theme.Color.PRIMARY
						? 'btn-primary'
						: themecolor === Domain.Entities.Theme.Color.SECONDARY
							? 'btn-secondary'
							: 'btn-accent'} btn-circle h-fit min-h-fit w-fit self-center p-0"
					onmouseover={() => (showTooltipID = 'd-skip-data-extraction')}
					onmouseout={() => (showTooltipID = '')}
					onclick={() => {
						const ID = 'd-skip-data-extraction'
						if (showTooltipID === ID) {
							showTooltipID = ''
						} else {
							showTooltipID = ID
						}
					}}
				>
					<!--mdi:question-mark source: https://icon-sets.iconify.design-->
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
						<path
							fill="var({Utils.Theme.GetColorContent(themecolor)})"
							d="M10 19h3v3h-3zm2-17c5.35.22 7.68 5.62 4.5 9.67c-.83 1-2.17 1.66-2.83 2.5C13 15 13 16 13 17h-3c0-1.67 0-3.08.67-4.08c.66-1 2-1.59 2.83-2.25C15.92 8.43 15.32 5.26 12 5a3 3 0 0 0-3 3H6a6 6 0 0 1 6-6"
						/>
					</svg>
				</button>
			</legend>

			<input
				class="checkbox self-center {themecolor === Domain.Entities.Theme.Color.PRIMARY
					? 'checkbox-primary'
					: themecolor === Domain.Entities.Theme.Color.SECONDARY
						? 'checkbox-secondary'
						: 'checkbox-accent'}"
				type="checkbox"
				bind:checked={databaseSkipDataExtraction}
			/>

			{#if showTooltipID === 'd-skip-data-extraction'}
				<div class="label">Skip extracting data when fetching it from the database.</div>
			{/if}
		</fieldset>

		{#if MetadataModel.IsGroupFieldAField(fieldgroup)}
			<fieldset
				class="fieldset {theme === Domain.Entities.Theme.Theme.DARK
					? 'border-gray-900 bg-gray-700'
					: 'border-gray-300 bg-gray-100'} rounded-box w-full border p-4"
			>
				<legend class="fieldset-legend flex gap-x-2">
					<div class="text-md h-fit self-center">Database add data to full text search index? <span class="font-bold italic">(Optional)</span></div>

					<!-- svelte-ignore a11y_mouse_events_have_key_events -->
					<button
						class="btn {themecolor === Domain.Entities.Theme.Color.PRIMARY
							? 'btn-primary'
							: themecolor === Domain.Entities.Theme.Color.SECONDARY
								? 'btn-secondary'
								: 'btn-accent'} btn-circle h-fit min-h-fit w-fit self-center p-0"
						onmouseover={() => (showTooltipID = 'd-field-add-data-to-full-text-search-index')}
						onmouseout={() => (showTooltipID = '')}
						onclick={() => {
							const ID = 'd-field-add-data-to-full-text-search-index'
							if (showTooltipID === ID) {
								showTooltipID = ''
							} else {
								showTooltipID = ID
							}
						}}
					>
						<!--mdi:question-mark source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
							<path
								fill="var({Utils.Theme.GetColorContent(themecolor)})"
								d="M10 19h3v3h-3zm2-17c5.35.22 7.68 5.62 4.5 9.67c-.83 1-2.17 1.66-2.83 2.5C13 15 13 16 13 17h-3c0-1.67 0-3.08.67-4.08c.66-1 2-1.59 2.83-2.25C15.92 8.43 15.32 5.26 12 5a3 3 0 0 0-3 3H6a6 6 0 0 1 6-6"
							/>
						</svg>
					</button>
				</legend>

				<input
					class="checkbox self-center {themecolor === Domain.Entities.Theme.Color.PRIMARY
						? 'checkbox-primary'
						: themecolor === Domain.Entities.Theme.Color.SECONDARY
							? 'checkbox-secondary'
							: 'checkbox-accent'}"
					type="checkbox"
					bind:checked={databaseFieldAddDataToFullTextSearchIndex}
				/>

				{#if showTooltipID === 'd-field-add-data-to-full-text-search-index'}
					<div class="label">Add field text data to full text search index during database insert or update of data.</div>
				{/if}
			</fieldset>
		{/if}
	</main>

	{@render FooterSnippet(themecolor, theme, updatefieldgroup, fieldgroup)}
</div>
