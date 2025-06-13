<!--
@component

Edit field/group properties related to querying.

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

	const COMPONENT_NAME = 'metadata-model-edit-field-group-query'

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

	let groupQueryAddFullTextSearchBox: boolean = $derived(fieldgroup[MetadataModel.FgProperties.GROUP_QUERY_ADD_FULL_TEXT_SEARCH_BOX] || false)
	$effect(() => {
		if (groupQueryAddFullTextSearchBox) {
			untrack(() => (fieldgroup[MetadataModel.FgProperties.GROUP_QUERY_ADD_FULL_TEXT_SEARCH_BOX] = true))
		} else {
			untrack(() => delete fieldgroup[MetadataModel.FgProperties.GROUP_QUERY_ADD_FULL_TEXT_SEARCH_BOX])
		}
	})

	let fieldGroupQueryConditionsEditDisable: boolean = $derived(
		fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_QUERY_CONDITIONS_EDIT_DISABLE] || false
	)
	$effect(() => {
		if (fieldGroupQueryConditionsEditDisable) {
			untrack(() => (fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_QUERY_CONDITIONS_EDIT_DISABLE] = true))
		} else {
			untrack(() => delete fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_QUERY_CONDITIONS_EDIT_DISABLE])
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
				<div class="text-md h-fit self-center">Field Group Disable Filter? <span class="font-bold italic">(Optional)</span></div>

				<!-- svelte-ignore a11y_mouse_events_have_key_events -->
				<button
					class="btn {themecolor === Domain.Entities.Theme.Color.PRIMARY
						? 'btn-primary'
						: themecolor === Domain.Entities.Theme.Color.SECONDARY
							? 'btn-secondary'
							: 'btn-accent'} btn-circle h-fit min-h-fit w-fit self-center p-0"
					onmouseover={() => (showTooltipID = 'fg-filter-disable')}
					onmouseout={() => (showTooltipID = '')}
					onclick={() => {
						const ID = 'fg-filter-disable'
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
				bind:checked={fieldGroupQueryConditionsEditDisable}
			/>

			{#if showTooltipID === 'fg-filter-disable'}
				<div class="label">
					Disable some query conditions options such as:<br /> database collection name, field/group primary key status etc. <br /> when displaying the
					query condition panel.
				</div>
			{/if}
		</fieldset>

		{#if MetadataModel.IsGroupFieldContainsGroup(fieldgroup)}
			<fieldset
				class="fieldset {theme === Domain.Entities.Theme.Theme.DARK
					? 'border-gray-900 bg-gray-700'
					: 'border-gray-300 bg-gray-100'} rounded-box w-full border p-4"
			>
				<legend class="fieldset-legend flex gap-x-2">
					<div class="text-md h-fit self-center">Group filter add full text search box? <span class="font-bold italic">(Optional)</span></div>

					<!-- svelte-ignore a11y_mouse_events_have_key_events -->
					<button
						class="btn {themecolor === Domain.Entities.Theme.Color.PRIMARY
							? 'btn-primary'
							: themecolor === Domain.Entities.Theme.Color.SECONDARY
								? 'btn-secondary'
								: 'btn-accent'} btn-circle h-fit min-h-fit w-fit self-center p-0"
						onmouseover={() => (showTooltipID = 'fg-filter-add-full-text-search-box')}
						onmouseout={() => (showTooltipID = '')}
						onclick={() => {
							const ID = 'fg-filter-add-full-text-search-box'
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
					bind:checked={groupQueryAddFullTextSearchBox}
				/>

				{#if showTooltipID === 'fg-filter-add-full-text-search-box'}
					<div class="label">Add full text search box for group in the filter panel.<br />Enable if backend supports full text search for group.</div>
				{/if}
			</fieldset>
		{/if}
	</main>

	{@render FooterSnippet(themecolor, theme, updatefieldgroup, fieldgroup)}
</div>
