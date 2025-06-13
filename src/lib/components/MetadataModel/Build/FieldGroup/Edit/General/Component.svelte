<!--
@component

Edit field/group general properties.

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

	const COMPONENT_NAME = 'metadata-model-edit-field-group-general'

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

	let fieldGroupKey = $derived(fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_KEY])

	let cycleFieldGroupKeyViews: number = $state(0)

	let fieldGroupName: string = $derived(fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_NAME] || '')
	/**
	 * Error if {@linkcode fieldgroup} {@linkcode MetadataModel.FgProperties.FIELD_GROUP_NAME} length is not valid.
	 */
	let fieldGroupNameLengthNotValid: string | null = $derived.by(() => {
		if (fieldGroupName.length === 0) {
			return 'Value must be at least one character in length.'
		}

		return null
	})
	/**
	 * Combine {@linkcode fieldgroup} {@linkcode MetadataModel.FgProperties.FIELD_GROUP_NAME} errors.
	 */
	let fieldGroupNameError: string[] = $derived.by(() => {
		let error: string[] = []

		if (fieldGroupNameLengthNotValid) {
			error.push(fieldGroupNameLengthNotValid)
		}

		return error
	})
	let fieldGroupNameInputFocused: boolean | null | undefined = $state(undefined)
	$effect(() => {
		if (fieldGroupNameError.length === 0) {
			updateFieldGroupName(fieldGroupName)
		}
	})
	function updateFieldGroupName(value: string) {
		fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_NAME] = value
	}

	let fieldGroupDescription: string = $derived(fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_DESCRIPTION] || '')
	/**
	 * Error if {@linkcode fieldgroup} {@linkcode MetadataModel.FgProperties.FIELD_GROUP_DESCRIPTION} length is not valid.
	 */
	let fieldGroupDescriptionLengthNotValid: string | null = $derived.by(() => {
		if (fieldGroupDescription.length === 0) {
			return 'Value must be at least one character in length.'
		}

		return null
	})
	/**
	 * Combine {@linkcode fieldgroup} {@linkcode MetadataModel.FgProperties.FIELD_GROUP_DESCRIPTION} errors.
	 */
	let fieldGroupDescriptionError: string[] = $derived.by(() => {
		let error: string[] = []

		if (fieldGroupDescriptionLengthNotValid) {
			error.push(fieldGroupDescriptionLengthNotValid)
		}

		return error
	})
	let fieldGroupDescriptionInputFocused: boolean | null | undefined = $state(undefined)
	$effect(() => {
		if (fieldGroupDescriptionError.length === 0) {
			updateFieldDescription(fieldGroupDescription)
		} else {
			untrack(() => {
				delete fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_DESCRIPTION]
			})
		}
	})
	function updateFieldDescription(value: string) {
		fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_DESCRIPTION] = value
	}

	let fieldGroupMaxEntries: number = $derived(fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_MAX_ENTRIES])
	/**
	 * Error if {@linkcode fieldgroup} {@linkcode MetadataModel.FgProperties.FIELD_GROUP_MAX_ENTRIES} length is not valid.
	 */
	let fieldGroupMaxEntriesNotNumber: string | null = $derived.by(() => {
		if (fieldGroupMaxEntries === null) {
			return 'Value is not a number.'
		}

		return null
	})
	/**
	 * Combine {@linkcode fieldgroup} {@linkcode MetadataModel.FgProperties.FIELD_GROUP_MAX_ENTRIES} errors.
	 */
	let fieldGroupMaxEntriesError: string[] = $derived.by(() => {
		let error: string[] = []

		if (fieldGroupMaxEntriesNotNumber) {
			error.push(fieldGroupMaxEntriesNotNumber)
		}

		return error
	})
	let fieldGroupMaxEntriesInputFocused: boolean | null | undefined = $state(undefined)
	$effect(() => {
		if (fieldGroupMaxEntriesError.length === 0) {
			updateFieldMaxEntries(fieldGroupMaxEntries)
		}
	})
	function updateFieldMaxEntries(value: number) {
		fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_MAX_ENTRIES] = value
	}

	let fieldGroupIsPrimaryKey: boolean = $derived(fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_IS_PRIMARY_KEY] || false)
	$effect(() => {
		if (fieldGroupIsPrimaryKey) {
			untrack(() => (fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_IS_PRIMARY_KEY] = true))
		} else {
			untrack(() => delete fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_IS_PRIMARY_KEY])
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
				<div class="text-md h-fit self-center">Field/Group Key</div>

				<button
					class="btn btn-circle btn-md {themecolor === Domain.Entities.Theme.Color.PRIMARY
						? 'btn-primary'
						: themecolor === Domain.Entities.Theme.Color.SECONDARY
							? 'btn-secondary'
							: 'btn-accent'}"
					onclick={() => {
						if (cycleFieldGroupKeyViews === 2) {
							cycleFieldGroupKeyViews = 0
						} else {
							cycleFieldGroupKeyViews += 1
						}
					}}
					aria-label="Change field/group key view"
				>
					{#if cycleFieldGroupKeyViews === 0}
						<!--mdi:code-array source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
							<path
								fill="var({Utils.Theme.GetColorContent(themecolor)})"
								d="M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zm3 1v12h4v-2H8V8h2V6zm10 10h-2v2h4V6h-4v2h2z"
							/>
						</svg>
					{:else if cycleFieldGroupKeyViews === 1}
						<!--mdi:code-json source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
							<path
								fill="var({Utils.Theme.GetColorContent(themecolor)})"
								d="M5 3h2v2H5v5a2 2 0 0 1-2 2a2 2 0 0 1 2 2v5h2v2H5c-1.07-.27-2-.9-2-2v-4a2 2 0 0 0-2-2H0v-2h1a2 2 0 0 0 2-2V5a2 2 0 0 1 2-2m14 0a2 2 0 0 1 2 2v4a2 2 0 0 0 2 2h1v2h-1a2 2 0 0 0-2 2v4a2 2 0 0 1-2 2h-2v-2h2v-5a2 2 0 0 1 2-2a2 2 0 0 1-2-2V5h-2V3zm-7 12a1 1 0 0 1 1 1a1 1 0 0 1-1 1a1 1 0 0 1-1-1a1 1 0 0 1 1-1m-4 0a1 1 0 0 1 1 1a1 1 0 0 1-1 1a1 1 0 0 1-1-1a1 1 0 0 1 1-1m8 0a1 1 0 0 1 1 1a1 1 0 0 1-1 1a1 1 0 0 1-1-1a1 1 0 0 1 1-1"
							/>
						</svg>
					{:else}
						<!--mdi:transit-connection-horizontal source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
							<path
								fill="var({Utils.Theme.GetColorContent(themecolor)})"
								d="M12 9c-1.3 0-2.4.8-2.8 2H6.8C6.4 9.8 5.3 9 4 9c-1.7 0-3 1.3-3 3s1.3 3 3 3c1.3 0 2.4-.8 2.8-2h2.4c.4 1.2 1.5 2 2.8 2s2.4-.8 2.8-2h2.4c.4 1.2 1.5 2 2.8 2c1.7 0 3-1.3 3-3s-1.3-3-3-3c-1.3 0-2.4.8-2.8 2h-2.4c-.4-1.2-1.5-2-2.8-2m-9 3c0-.6.4-1 1-1s1 .4 1 1s-.4 1-1 1s-1-.4-1-1m18 0c0 .6-.4 1-1 1s-1-.4-1-1s.4-1 1-1s1 .4 1 1"
							/>
						</svg>
					{/if}
				</button>
			</legend>

			<code
				class="overflow-auto rounded-md border p-1 text-wrap break-words {theme === Domain.Entities.Theme.Theme.DARK
					? 'bg-gray-800'
					: 'bg-gray-200'} {themecolor === Domain.Entities.Theme.Color.PRIMARY
					? 'border-primary'
					: themecolor === Domain.Entities.Theme.Color.SECONDARY
						? 'border-secondary'
						: 'border-accent'}"
			>
				{#if cycleFieldGroupKeyViews === 0}
					{fieldGroupKey}
				{:else if cycleFieldGroupKeyViews === 1}
					{MetadataModel.FieldGroupDataJsonPath(fieldGroupKey)}
				{:else}
					{MetadataModel.FieldGroupKeyPath(fieldGroupKey)}
				{/if}
			</code>
		</fieldset>

		<fieldset
			class="fieldset {theme === Domain.Entities.Theme.Theme.DARK
				? 'border-gray-900 bg-gray-700'
				: 'border-gray-300 bg-gray-100'} rounded-box w-full border p-4"
		>
			<legend class="fieldset-legend flex gap-x-2">
				<div class="text-md h-fit self-center">Field/Group Name</div>
			</legend>

			<input
				class="input flex-1 {themecolor === Domain.Entities.Theme.Color.PRIMARY
					? 'input-primary'
					: themecolor === Domain.Entities.Theme.Color.SECONDARY
						? 'input-secondary'
						: 'input-accent'} min-h-[48px] w-full"
				type="text"
				placeholder="Enter field group name..."
				bind:value={fieldGroupName}
				bind:focused={fieldGroupNameInputFocused}
			/>

			{#if fieldGroupNameInputFocused && fieldGroupNameError.length > 0}
				<ul class="text-md text-error list-inside list-disc">
					{#each fieldGroupNameError as e}
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
				<div class="text-md h-fit self-center">Field/Group Description <span class="font-bold italic">(Optional)</span></div>
			</legend>

			<textarea
				class="textarea flex-1 {themecolor === Domain.Entities.Theme.Color.PRIMARY
					? 'textarea-primary'
					: themecolor === Domain.Entities.Theme.Color.SECONDARY
						? 'textarea-secondary'
						: 'textarea-accent'} min-h-[100px] w-full"
				placeholder="Enter field group description..."
				bind:value={fieldGroupDescription}
				bind:focused={fieldGroupDescriptionInputFocused}
			></textarea>

			{#if fieldGroupDescriptionInputFocused && fieldGroupDescriptionError.length > 0}
				<ul class="text-md text-error list-inside list-disc">
					{#each fieldGroupDescriptionError as e}
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
				<div class="text-md h-fit self-center">Field/Group Max Entries</div>
			</legend>

			<input
				class="input flex-1 {themecolor === Domain.Entities.Theme.Color.PRIMARY
					? 'input-primary'
					: themecolor === Domain.Entities.Theme.Color.SECONDARY
						? 'input-secondary'
						: 'input-accent'} min-h-[48px] w-full"
				type="number"
				placeholder="Enter field group max entries..."
				bind:value={fieldGroupMaxEntries}
				bind:focused={fieldGroupMaxEntriesInputFocused}
			/>

			{#if fieldGroupMaxEntriesInputFocused && fieldGroupMaxEntriesError.length > 0}
				<ul class="text-md text-error list-inside list-disc">
					{#each fieldGroupMaxEntriesError as e}
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
				<div class="text-md h-fit self-center">Field/Group Is Primary Key? <span class="font-bold italic">(Optional)</span></div>

				<!-- svelte-ignore a11y_mouse_events_have_key_events -->
				<button
					class="btn {themecolor === Domain.Entities.Theme.Color.PRIMARY
						? 'btn-primary'
						: themecolor === Domain.Entities.Theme.Color.SECONDARY
							? 'btn-secondary'
							: 'btn-accent'} btn-circle h-fit min-h-fit w-fit self-center p-0"
					onmouseover={() => (showTooltipID = 'fg-is-primary-key')}
					onmouseout={() => (showTooltipID = '')}
					onclick={() => {
						const ID = 'fg-is-primary-key'
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
				bind:checked={fieldGroupIsPrimaryKey}
			/>

			{#if showTooltipID === 'fg-is-primary-key'}
				<div class="label">Used for purporses such as converting an array of objects to 2D.</div>
			{/if}
		</fieldset>
	</main>

	{@render FooterSnippet(themecolor, theme, updatefieldgroup, fieldgroup)}
</div>
