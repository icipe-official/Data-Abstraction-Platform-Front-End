<!--
@component

Edit field/group properties related to viewing.

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

	const COMPONENT_NAME = 'metadata-model-edit-field-group-view'

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

	let fieldGroupViewValuesInSeparateColumns: boolean = $derived(
		fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_VIEW_VALUES_IN_SEPARATE_COLUMNS] || false
	)
	$effect(() => {
		if (fieldGroupViewValuesInSeparateColumns) {
			untrack(() => (fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_VIEW_VALUES_IN_SEPARATE_COLUMNS] = true))
		} else {
			untrack(() => delete fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_VIEW_VALUES_IN_SEPARATE_COLUMNS])
		}
	})

	let fieldGroupMaxNoOfValuesInSeparateColumns: number = $derived(
		fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_VIEW_MAX_NO_OF_VALUES_IN_SEPARATE_COLUMNS]
	)
	/**
	 * Error if {@linkcode fieldgroup} {@linkcode MetadataModel.FgProperties.FIELD_GROUP_VIEW_MAX_NO_OF_VALUES_IN_SEPARATE_COLUMNS} length is not valid.
	 */
	let fieldGroupMaxNoOfValuesInSeparateColumnsLengthNotValid: string | null = $derived.by(() => {
		if (Number.isNaN(Number(fieldGroupMaxNoOfValuesInSeparateColumns)) || fieldGroupMaxNoOfValuesInSeparateColumns === null) {
			return 'Value is not a number.'
		}

		return null
	})
	/**
	 * Combine {@linkcode fieldgroup} {@linkcode MetadataModel.FgProperties.FIELD_GROUP_VIEW_MAX_NO_OF_VALUES_IN_SEPARATE_COLUMNS} errors.
	 */
	let fieldGroupMaxNoOfValuesInSeparateColumnsError: string[] = $derived.by(() => {
		let error: string[] = []

		if (fieldGroupMaxNoOfValuesInSeparateColumnsLengthNotValid) {
			error.push(fieldGroupMaxNoOfValuesInSeparateColumnsLengthNotValid)
		}

		return error
	})
	let fieldGroupMaxNoOfValuesInSeparateColumnsInputFocused: boolean | null | undefined = $state(undefined)
	$effect(() => {
		if (fieldGroupMaxNoOfValuesInSeparateColumnsError.length === 0) {
			updateFieldMaxNoOfValuesInSeparateColumns(fieldGroupMaxNoOfValuesInSeparateColumns)
		}
	})
	function updateFieldMaxNoOfValuesInSeparateColumns(value: number) {
		fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_VIEW_MAX_NO_OF_VALUES_IN_SEPARATE_COLUMNS] = value
	}

	let fieldViewValuesInSeparateColumnsHeaderFormat: string = $derived(
		fieldgroup[MetadataModel.FgProperties.FIELD_VIEW_VALUES_IN_SEPARATE_COLUMNS_HEADER_FORMAT] || ''
	)
	/**
	 * Error if {@linkcode fieldgroup} {@linkcode MetadataModel.FgProperties.FIELD_VIEW_VALUES_IN_SEPARATE_COLUMNS_HEADER_FORMAT} length is not valid.
	 */
	let fieldViewValuesInSeparateColumnsHeaderFormatLengthNotValid: string | null = $derived.by(() => {
		if (fieldViewValuesInSeparateColumnsHeaderFormat.length === 0) {
			return 'Value must be at least one character in length.'
		}

		return null
	})
	/**
	 * Combine {@linkcode fieldgroup} {@linkcode MetadataModel.FgProperties.FIELD_VIEW_VALUES_IN_SEPARATE_COLUMNS_HEADER_FORMAT} errors.
	 */
	let fieldViewValuesInSeparateColumnsHeaderFormatError: string[] = $derived.by(() => {
		let error: string[] = []

		if (fieldViewValuesInSeparateColumnsHeaderFormatLengthNotValid) {
			error.push(fieldViewValuesInSeparateColumnsHeaderFormatLengthNotValid)
		}

		return error
	})
	let fieldViewValuesInSeparateColumnsHeaderFormatInputFocused: boolean | null | undefined = $state(undefined)
	$effect(() => {
		if (fieldViewValuesInSeparateColumnsHeaderFormatError.length === 0) {
			updateFieldViewValuesInSeparateColumnsHeaderFormat(fieldViewValuesInSeparateColumnsHeaderFormat)
		} else {
			untrack(() => {
				delete fieldgroup[MetadataModel.FgProperties.FIELD_VIEW_VALUES_IN_SEPARATE_COLUMNS_HEADER_FORMAT]
			})
		}
	})
	function updateFieldViewValuesInSeparateColumnsHeaderFormat(value: string) {
		fieldgroup[MetadataModel.FgProperties.FIELD_VIEW_VALUES_IN_SEPARATE_COLUMNS_HEADER_FORMAT] = value
	}

	let fieldGroupViewTableIn2D: boolean = $derived(fieldgroup[MetadataModel.FgProperties.GROUP_VIEW_TABLE_IN_2D] || false)
	$effect(() => {
		if (fieldGroupViewTableIn2D) {
			untrack(() => (fieldgroup[MetadataModel.FgProperties.GROUP_VIEW_TABLE_IN_2D] = true))
		} else {
			untrack(() => delete fieldgroup[MetadataModel.FgProperties.GROUP_VIEW_TABLE_IN_2D])
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
				<div class="text-md h-fit self-center">Field/Group view values in separate columns? <span class="font-bold italic">(Optional)</span></div>

				<!-- svelte-ignore a11y_mouse_events_have_key_events -->
				<button
					class="btn {themecolor === Domain.Entities.Theme.Color.PRIMARY
						? 'btn-primary'
						: themecolor === Domain.Entities.Theme.Color.SECONDARY
							? 'btn-secondary'
							: 'btn-accent'} btn-circle h-fit min-h-fit w-fit self-center p-0"
					onmouseover={() => (showTooltipID = 'fg-view-values-in-separate-columns')}
					onmouseout={() => (showTooltipID = '')}
					onclick={() => {
						const ID = 'fg-view-values-in-separate-columns'
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
				bind:checked={fieldGroupViewValuesInSeparateColumns}
			/>

			{#if showTooltipID === 'fg-view-values-in-separate-columns'}
				<div class="label">Enable viewing groups/tables or fields/columns with multiple values in one row.</div>
			{/if}
		</fieldset>

		<fieldset
			class="fieldset {theme === Domain.Entities.Theme.Theme.DARK
				? 'border-gray-900 bg-gray-700'
				: 'border-gray-300 bg-gray-100'} rounded-box w-full border p-4"
		>
			<legend class="fieldset-legend flex gap-x-2">
				<div class="text-md h-fit self-center">Field/Group view max columns in separate columns</div>

				<!-- svelte-ignore a11y_mouse_events_have_key_events -->
				<button
					class="btn {themecolor === Domain.Entities.Theme.Color.PRIMARY
						? 'btn-primary'
						: themecolor === Domain.Entities.Theme.Color.SECONDARY
							? 'btn-secondary'
							: 'btn-accent'} btn-circle h-fit min-h-fit w-fit self-center p-0"
					onmouseover={() => (showTooltipID = 'fg-view-max-values-in-separate-columns')}
					onmouseout={() => (showTooltipID = '')}
					onclick={() => {
						const ID = 'fg-view-max-values-in-separate-columns'
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
				type="number"
				min="0"
				placeholder="Enter field group max number of values in separate columns..."
				bind:value={fieldGroupMaxNoOfValuesInSeparateColumns}
				bind:focused={fieldGroupMaxNoOfValuesInSeparateColumnsInputFocused}
			/>

			{#if showTooltipID === 'fg-view-max-values-in-separate-columns'}
				<div class="label">Maximum number of columns of values in one row.</div>
			{/if}

			{#if fieldGroupMaxNoOfValuesInSeparateColumnsInputFocused && fieldGroupMaxNoOfValuesInSeparateColumnsError.length > 0}
				<ul class="text-md text-error list-inside list-disc">
					{#each fieldGroupMaxNoOfValuesInSeparateColumnsError as e}
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
				<div class="text-md h-fit self-center">Field view header format <span class="font-bold italic">(Optional)</span></div>

				<!-- svelte-ignore a11y_mouse_events_have_key_events -->
				<button
					class="btn {themecolor === Domain.Entities.Theme.Color.PRIMARY
						? 'btn-primary'
						: themecolor === Domain.Entities.Theme.Color.SECONDARY
							? 'btn-secondary'
							: 'btn-accent'} btn-circle h-fit min-h-fit w-fit self-center p-0"
					onmouseover={() => (showTooltipID = 'fg-view-values-in-separate-columns-header-format')}
					onmouseout={() => (showTooltipID = '')}
					onclick={() => {
						const ID = 'fg-view-values-in-separate-columns-header-format'
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
				placeholder="Enter view header format..."
				type="text"
				bind:value={fieldViewValuesInSeparateColumnsHeaderFormat}
				bind:focused={fieldViewValuesInSeparateColumnsHeaderFormatInputFocused}
			/>

			{#if showTooltipID === 'fg-view-values-in-separate-columns-header-format'}
				<div class="label">Used for purporses such as converting an array of objects to 2D.</div>
			{/if}

			{#if fieldViewValuesInSeparateColumnsHeaderFormatInputFocused && fieldViewValuesInSeparateColumnsHeaderFormatError.length > 0}
				<ul class="text-md text-error list-inside list-disc">
					{#each fieldViewValuesInSeparateColumnsHeaderFormatError as e}
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
					<div class="text-md h-fit self-center">Group default view as table in 2D? <span class="font-bold italic">(Optional)</span></div>

					<!-- svelte-ignore a11y_mouse_events_have_key_events -->
					<button
						class="btn {themecolor === Domain.Entities.Theme.Color.PRIMARY
							? 'btn-primary'
							: themecolor === Domain.Entities.Theme.Color.SECONDARY
								? 'btn-secondary'
								: 'btn-accent'} btn-circle h-fit min-h-fit w-fit self-center p-0"
						onmouseover={() => (showTooltipID = 'fg-view-as-table-in-2d')}
						onmouseout={() => (showTooltipID = '')}
						onclick={() => {
							const ID = 'fg-view-as-table-in-2d'
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
					bind:checked={fieldGroupViewTableIn2D}
				/>

				{#if showTooltipID === 'fg-view-as-table-in-2d'}
					<div class="label">
						View data as row and column with no nesting.<br />Property works best if group has nested groups and not necessary to apply if it does not
						have nested groups.
					</div>
				{/if}
			</fieldset>
		{/if}
	</main>

	{@render FooterSnippet(themecolor, theme, updatefieldgroup, fieldgroup)}
</div>
