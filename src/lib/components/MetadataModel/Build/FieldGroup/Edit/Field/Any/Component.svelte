<!--
@component

Edit field/group properties of type any.

Props:
- fieldgroup -
- themecolor -
- theme - 
- updatefieldgroup -
-->
<script lang="ts">
	import { Domain, MetadataModel, Utils } from '$lib'
	import { untrack } from 'svelte'
	import { FooterSnippet } from '../../Snippets/Footer.svelte'

	const COMPONENT_NAME = 'metadata-model-edit-field-group-field-any'

	interface Props {
		value?: MetadataModel.IFieldAny
		themecolor?: Domain.Entities.Theme.Color
		theme?: Domain.Entities.Theme.Theme
		updatevalue: (value: MetadataModel.IFieldAny | undefined) => void
	}

	let {
		value = undefined,
		themecolor = Domain.Entities.Theme.Color.PRIMARY,
		theme = Domain.Entities.Theme.Theme.LIGHT,
		updatevalue
	}: Props = $props()

	/**
	 * Unique ID for showing tooltip/hint information.
	 */
	let showTooltipID: string = $state('')

	function onupdatevalue() {
		updatevalue(value)
	}

	let metadataModelActionId: string = $derived.by(() => {
		if (value) {
			if (value[MetadataModel.FieldAnyProperties.METADATA_MODEL_ACTION_ID]) {
				return value[MetadataModel.FieldAnyProperties.METADATA_MODEL_ACTION_ID]
			}
		}

		return ''
	})
	/**
	 * Error if {@linkcode fieldgroup} {@linkcode MetadataModel.FieldAnyProperties.METADATA_MODEL_ACTION_ID} length is not valid.
	 */
	let metadataModelActionIdLengthNotValid: string | null = $derived.by(() => {
		if (metadataModelActionId.length === 0) {
			return 'Value must be at least one character in length.'
		}

		return null
	})
	/**
	 * Combine {@linkcode fieldgroup} {@linkcode MetadataModel.FieldAnyProperties.METADATA_MODEL_ACTION_ID} errors.
	 */
	let metadataModelActionIdError: string[] = $derived.by(() => {
		let error: string[] = []

		if (metadataModelActionIdLengthNotValid) {
			error.push(metadataModelActionIdLengthNotValid)
		}

		return error
	})
	let metadataModelActionIdInputFocused: boolean | null | undefined = $state(undefined)
	$effect(() => {
		if (metadataModelActionIdError.length === 0 && metadataModelActionId) {
			untrack(() => {
				if (value) {
					value[MetadataModel.FieldAnyProperties.METADATA_MODEL_ACTION_ID] = metadataModelActionId
				} else {
					value = {
						[MetadataModel.FieldAnyProperties.METADATA_MODEL_ACTION_ID]: metadataModelActionId
					}
				}
			})
		} else {
			untrack(() => {
				if (value) {
					//@ts-expect-error
					delete value[MetadataModel.FieldAnyProperties.METADATA_MODEL_ACTION_ID]
				}
			})
		}
		onupdatevalue()
	})

	let pathToDataArgument: string = $derived.by(() => {
		if (value) {
			if (value[MetadataModel.FieldAnyProperties.GET_METADATA_MODEL_PATH_TO_DATA_ARGUMENT]) {
				return value[MetadataModel.FieldAnyProperties.GET_METADATA_MODEL_PATH_TO_DATA_ARGUMENT]
			}
		}

		return ''
	})
	/**
	 * Error if {@linkcode fieldgroup} {@linkcode MetadataModel.FieldAnyProperties.GET_METADATA_MODEL_PATH_TO_DATA_ARGUMENT} length is not valid.
	 */
	let pathToDataArgumentLengthNotValid: string | null = $derived.by(() => {
		if (pathToDataArgument.length === 0) {
			return 'Value must be at least one character in length.'
		}

		return null
	})
	/**
	 * Combine {@linkcode fieldgroup} {@linkcode MetadataModel.FieldAnyProperties.GET_METADATA_MODEL_PATH_TO_DATA_ARGUMENT} errors.
	 */
	let pathToDataArgumentError: string[] = $derived.by(() => {
		let error: string[] = []

		if (pathToDataArgumentLengthNotValid) {
			error.push(pathToDataArgumentLengthNotValid)
		}

		return error
	})
	let pathToDataArgumentInputFocused: boolean | null | undefined = $state(undefined)
	$effect(() => {
		if (pathToDataArgumentError.length === 0 && pathToDataArgument) {
			untrack(() => {
				if (value) {
					value[MetadataModel.FieldAnyProperties.GET_METADATA_MODEL_PATH_TO_DATA_ARGUMENT] = pathToDataArgument
				} else {
					//@ts-expect-error
					value = {
						[MetadataModel.FieldAnyProperties.GET_METADATA_MODEL_PATH_TO_DATA_ARGUMENT]: pathToDataArgument
					}
				}
			})
		} else {
			untrack(() => {
				if (value) {
					delete value[MetadataModel.FieldAnyProperties.GET_METADATA_MODEL_PATH_TO_DATA_ARGUMENT]
				}
			})
		}
		onupdatevalue()
	})
</script>

<div class="flex flex-col gap-y-2">
	<main class="z-[1] flex flex-col gap-y-2">
		<fieldset
			class="fieldset {theme === Domain.Entities.Theme.Theme.DARK
				? 'border-gray-950 bg-gray-800'
				: 'border-gray-400 bg-gray-200'} rounded-box w-full border p-4"
		>
			<legend class="fieldset-legend flex gap-x-2">
				<div class="text-md h-fit self-center">Metadata model action id <span class="font-bold italic">(Optional)</span></div>

				<!-- svelte-ignore a11y_mouse_events_have_key_events -->
				<button
					class="btn {themecolor === Domain.Entities.Theme.Color.PRIMARY
						? 'btn-primary'
						: themecolor === Domain.Entities.Theme.Color.SECONDARY
							? 'btn-secondary'
							: 'btn-accent'} btn-circle h-fit min-h-fit w-fit self-center p-0"
					onmouseover={() => (showTooltipID = 'mm-action-id')}
					onmouseout={() => (showTooltipID = '')}
					onclick={() => {
						const ID = 'mm-action-id'
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
				placeholder="Enter metadata model action id..."
				type="text"
				bind:value={metadataModelActionId}
				bind:focused={metadataModelActionIdInputFocused}
			/>

			{#if showTooltipID === 'mm-action-id'}
				<div class="label">Unique name to use when identifying the action request to get a metadata-model.</div>
			{/if}

			{#if metadataModelActionIdInputFocused && metadataModelActionIdError.length > 0}
				<ul class="text-md text-error list-inside list-disc">
					{#each metadataModelActionIdError as e}
						<li>{e}</li>
					{/each}
				</ul>
			{/if}
		</fieldset>

		<fieldset
			class="fieldset {theme === Domain.Entities.Theme.Theme.DARK
				? 'border-gray-950 bg-gray-800'
				: 'border-gray-400 bg-gray-200'} rounded-box w-full border p-4"
		>
			<legend class="fieldset-legend flex gap-x-2">
				<div class="text-md h-fit self-center">Get metadata-model path to data argument<span class="font-bold italic">(Optional)</span></div>

				<!-- svelte-ignore a11y_mouse_events_have_key_events -->
				<button
					class="btn {themecolor === Domain.Entities.Theme.Color.PRIMARY
						? 'btn-primary'
						: themecolor === Domain.Entities.Theme.Color.SECONDARY
							? 'btn-secondary'
							: 'btn-accent'} btn-circle h-fit min-h-fit w-fit self-center p-0"
					onmouseover={() => (showTooltipID = 'get-mm-path-to-data-argument')}
					onmouseout={() => (showTooltipID = '')}
					onclick={() => {
						const ID = 'get-mm-path-to-data-argument'
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
				placeholder="Enter path to data (e.g. $.message[*].message_type)..."
				type="text"
				bind:value={pathToDataArgument}
				bind:focused={pathToDataArgumentInputFocused}
			/>

			{#if showTooltipID === 'get-mm-path-to-data-argument'}
				<div class="label">
					Data to use as arguments when getting the metadata model e.g. $.message[*].message_type.<br />Will replace [*] with current array indexes to
					data.
				</div>
			{/if}

			{#if pathToDataArgumentInputFocused && pathToDataArgumentError.length > 0}
				<ul class="text-md text-error list-inside list-disc">
					{#each pathToDataArgumentError as e}
						<li>{e}</li>
					{/each}
				</ul>
			{/if}
		</fieldset>
	</main>
</div>
