<!--
@component

Edit field/group properties related to inputting.

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

	const COMPONENT_NAME = 'metadata-model-edit-field-group-input'

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

	let fieldJoinSymbol: string = $derived(fieldgroup[MetadataModel.FgProperties.FIELD_MULTIPLE_VALUES_JOIN_SYMBOL] || '')
	/**
	 * Error if {@linkcode fieldgroup} {@linkcode MetadataModel.FgProperties.FIELD_MULTIPLE_VALUES_JOIN_SYMBOL} length is not valid.
	 */
	let fieldJoinSymbolLengthNotValid: string | null = $derived.by(() => {
		if (fieldJoinSymbol.length === 0) {
			return 'Value must be at least one character in length.'
		}

		return null
	})
	/**
	 * Combine {@linkcode fieldgroup} {@linkcode MetadataModel.FgProperties.FIELD_MULTIPLE_VALUES_JOIN_SYMBOL} errors.
	 */
	let fieldJoinSymbolError: string[] = $derived.by(() => {
		let error: string[] = []

		if (fieldJoinSymbolLengthNotValid) {
			error.push(fieldJoinSymbolLengthNotValid)
		}

		return error
	})
	let fieldJoinSymbolInputFocused: boolean | null | undefined = $state(undefined)
	$effect(() => {
		if (fieldJoinSymbolError.length === 0) {
			updateFieldJoinSymbol(fieldJoinSymbol)
		} else {
			untrack(() => {
				delete fieldgroup[MetadataModel.FgProperties.FIELD_MULTIPLE_VALUES_JOIN_SYMBOL]
			})
		}
	})
	function updateFieldJoinSymbol(value: string) {
		fieldgroup[MetadataModel.FgProperties.FIELD_MULTIPLE_VALUES_JOIN_SYMBOL] = value
	}

	let fieldGroupDisableUserInput: boolean = $derived(fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_INPUT_DISABLE] || false)
	$effect(() => {
		if (fieldGroupDisableUserInput) {
			untrack(() => (fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_INPUT_DISABLE] = true))
		} else {
			untrack(() => delete fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_INPUT_DISABLE])
		}
	})
</script>

<div class="flex flex-col gap-y-2" transition:fade>
	<main class="z-[1] flex flex-col gap-y-2">
		<fieldset
			class="fieldset {theme === Domain.Entities.Theme.Theme.DARK
				? 'border-gray-900 bg-gray-700'
				: 'border-gray-300 bg-gray-100'} rounded-box w-full border p-4"
		>
			<!-- svelte-ignore a11y_mouse_events_have_key_events -->
			<legend class="fieldset-legend flex gap-x-1">
				<div class="text-md h-fit self-center">Field Join symbol for field with multiple values <span class="font-bold italic">(Optional)</span></div>

				<!-- svelte-ignore a11y_mouse_events_have_key_events -->
				<button
					class="btn {themecolor === Domain.Entities.Theme.Color.PRIMARY
						? 'btn-primary'
						: themecolor === Domain.Entities.Theme.Color.SECONDARY
							? 'btn-secondary'
							: 'btn-accent'} btn-circle h-fit min-h-fit w-fit self-center p-0"
					onmouseover={() => (showTooltipID = 'f-join-symbol')}
					onmouseout={() => (showTooltipID = '')}
					onclick={() => {
						const ID = 'f-join-symbol'
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
				type="text"
				placeholder="Enter join symbol..."
				bind:value={fieldJoinSymbol}
				bind:focused={fieldJoinSymbolInputFocused}
			/>

			{#if showTooltipID === 'f-join-symbol'}
				<div class="label">
					Symbol to use when joining data from a field with 1 or more values when converting to an array of objects to a 2D array.
				</div>
			{/if}

			{#if fieldJoinSymbolInputFocused && fieldJoinSymbolError.length > 0}
				<ul class="text-md text-error list-inside list-disc">
					{#each fieldJoinSymbolError as e}
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
				<div class="text-md h-fit self-center">Field/Group Disable User Input? <span class="font-bold italic">(Optional)</span></div>

				<!-- svelte-ignore a11y_mouse_events_have_key_events -->
				<button
					class="btn {themecolor === Domain.Entities.Theme.Color.PRIMARY
						? 'btn-primary'
						: themecolor === Domain.Entities.Theme.Color.SECONDARY
							? 'btn-secondary'
							: 'btn-accent'} btn-circle h-fit min-h-fit w-fit self-center p-0"
					onmouseover={() => (showTooltipID = 'fg-input-disable')}
					onmouseout={() => (showTooltipID = '')}
					onclick={() => {
						const ID = 'fg-input-disable'
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
				bind:checked={fieldGroupDisableUserInput}
			/>

			{#if showTooltipID === 'fg-input-disable'}
				<div class="label">Disable user input on forms.</div>
			{/if}
		</fieldset>
	</main>
	
	{@render FooterSnippet(themecolor, theme, updatefieldgroup, fieldgroup)}
</div>
