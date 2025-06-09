<!--
@component

Edit field/group properties related to viewing.

Props:
- fieldcheckboxvalueiftrue -
- updatefieldcheckboxvalueiftrue -
- fieldcheckboxvalueiffalse -
- updatefieldcheckboxvalueiffalse -
- fieldcheckboxusevalueinstorage -
- updatefieldcheckboxusevalueinstorage -
- themecolor -
- theme -
-->
<script lang="ts">
	import { Domain, MetadataModel, Utils } from '$lib'
	import { untrack } from 'svelte'
	import { FooterSnippet } from '../../Snippets/Footer.svelte'

	const COMPONENT_NAME = 'metadata-model-edit-field-group-checkbox'

	interface Props {
		fieldcheckboxvalueiftrue?: MetadataModel.IFieldCheckboxValue
		updatefieldcheckboxvalueiftrue: (value?: MetadataModel.IFieldCheckboxValue) => void
		fieldcheckboxvalueiffalse?: MetadataModel.IFieldCheckboxValue
		updatefieldcheckboxvalueiffalse: (value?: MetadataModel.IFieldCheckboxValue) => void
		fieldcheckboxusevalueinstorage?: boolean
		updatefieldcheckboxusevalueinstorage: (value?: boolean) => void
		themecolor?: Domain.Entities.Theme.Color
		theme?: Domain.Entities.Theme.Theme
	}

	let {
		fieldcheckboxvalueiftrue = undefined,
		updatefieldcheckboxvalueiftrue,
		fieldcheckboxvalueiffalse = undefined,
		updatefieldcheckboxvalueiffalse,
		fieldcheckboxusevalueinstorage = undefined,
		updatefieldcheckboxusevalueinstorage,
		themecolor = Domain.Entities.Theme.Color.PRIMARY,
		theme = Domain.Entities.Theme.Theme.LIGHT
	}: Props = $props()

	/**
	 * Unique ID for showing tooltip/hint information.
	 */
	let showTooltipID: string = $state('')

	let fieldChecboxValueIfTrueType: MetadataModel.FieldType | string | undefined = $derived.by(() => {
		if (fieldcheckboxvalueiftrue) {
			if (fieldcheckboxvalueiftrue[MetadataModel.FieldCheckboxValueProperties.TYPE]) {
				return fieldcheckboxvalueiftrue[MetadataModel.FieldCheckboxValueProperties.TYPE]
			}
		}
		return ''
	})
	$effect(() => {
		if (fieldChecboxValueIfTrueType) {
			untrack(() => {
				if (fieldcheckboxvalueiftrue) {
					fieldcheckboxvalueiftrue[MetadataModel.FieldCheckboxValueProperties.TYPE] = fieldChecboxValueIfTrueType as MetadataModel.FieldType
				} else {
					fieldcheckboxvalueiftrue = {
						[MetadataModel.FieldCheckboxValueProperties.TYPE]: fieldChecboxValueIfTrueType as MetadataModel.FieldType
					}
				}
			})
		} else {
			untrack(() => {
				if (fieldcheckboxvalueiftrue) {
					delete fieldcheckboxvalueiftrue[MetadataModel.FieldCheckboxValueProperties.TYPE]
				}
			})
		}
		onupdatefieldcheckboxvalueiftrue()
	})
	let fieldChecboxValueIfTrueValue: any = $derived.by(() => {
		if (fieldcheckboxvalueiftrue) {
			if (fieldcheckboxvalueiftrue[MetadataModel.FieldCheckboxValueProperties.VALUE]) {
				return fieldcheckboxvalueiftrue[MetadataModel.FieldCheckboxValueProperties.VALUE]
			}
		}
		return undefined
	})
	$effect(() => {
		if (fieldChecboxValueIfTrueValue) {
			untrack(() => {
				if (fieldcheckboxvalueiftrue) {
					fieldcheckboxvalueiftrue[MetadataModel.FieldCheckboxValueProperties.VALUE] = fieldChecboxValueIfTrueValue
				} else {
					fieldcheckboxvalueiftrue = {
						[MetadataModel.FieldCheckboxValueProperties.VALUE]: fieldChecboxValueIfTrueValue
					}
				}
			})
		} else {
			untrack(() => {
				if (fieldcheckboxvalueiftrue) {
					delete fieldcheckboxvalueiftrue[MetadataModel.FieldCheckboxValueProperties.VALUE]
				}
			})
		}
		onupdatefieldcheckboxvalueiftrue()
	})
	function onupdatefieldcheckboxvalueiftrue() {
		updatefieldcheckboxvalueiftrue(fieldcheckboxvalueiftrue)
	}

	let fieldChecboxValueIfFalseType: MetadataModel.FieldType | string | undefined = $derived.by(() => {
		if (fieldcheckboxvalueiffalse) {
			if (fieldcheckboxvalueiffalse[MetadataModel.FieldCheckboxValueProperties.TYPE]) {
				return fieldcheckboxvalueiffalse[MetadataModel.FieldCheckboxValueProperties.TYPE]
			}
		}
		return ''
	})
	$effect(() => {
		if (fieldChecboxValueIfFalseType) {
			untrack(() => {
				if (fieldcheckboxvalueiffalse) {
					fieldcheckboxvalueiffalse[MetadataModel.FieldCheckboxValueProperties.TYPE] = fieldChecboxValueIfFalseType as MetadataModel.FieldType
				} else {
					fieldcheckboxvalueiffalse = {
						[MetadataModel.FieldCheckboxValueProperties.TYPE]: fieldChecboxValueIfFalseType as MetadataModel.FieldType
					}
				}
			})
		} else {
			untrack(() => {
				if (fieldcheckboxvalueiffalse) {
					delete fieldcheckboxvalueiffalse[MetadataModel.FieldCheckboxValueProperties.TYPE]
				}
			})
		}
		onupdatefieldcheckboxvalueiffalse()
	})
	let fieldChecboxValueIfFalseValue: any = $derived.by(() => {
		if (fieldcheckboxvalueiffalse) {
			if (fieldcheckboxvalueiffalse[MetadataModel.FieldCheckboxValueProperties.VALUE]) {
				return fieldcheckboxvalueiffalse[MetadataModel.FieldCheckboxValueProperties.VALUE]
			}
		}
		return undefined
	})
	$effect(() => {
		if (fieldChecboxValueIfFalseValue) {
			untrack(() => {
				if (fieldcheckboxvalueiffalse) {
					fieldcheckboxvalueiffalse[MetadataModel.FieldCheckboxValueProperties.VALUE] = fieldChecboxValueIfFalseValue
				} else {
					fieldcheckboxvalueiffalse = {
						[MetadataModel.FieldCheckboxValueProperties.VALUE]: fieldChecboxValueIfFalseValue
					}
				}
			})
		} else {
			untrack(() => {
				if (fieldcheckboxvalueiffalse) {
					delete fieldcheckboxvalueiffalse[MetadataModel.FieldCheckboxValueProperties.VALUE]
				}
			})
		}
		onupdatefieldcheckboxvalueiffalse()
	})
	function onupdatefieldcheckboxvalueiffalse() {
		updatefieldcheckboxvalueiffalse(fieldcheckboxvalueiffalse)
	}

	let fieldCheckboxUseValueInstorage: boolean = $derived.by(() => {
		if (fieldcheckboxusevalueinstorage) {
			return fieldcheckboxusevalueinstorage
		}

		return false
	})
	$effect(() => {
		updatefieldcheckboxusevalueinstorage(fieldCheckboxUseValueInstorage)
	})
</script>

<div class="flex flex-col gap-y-2">
	<fieldset
		class="fieldset {theme === Domain.Entities.Theme.Theme.DARK
			? 'border-gray-950 bg-gray-800'
			: 'border-gray-400 bg-gray-200'} rounded-box w-full border p-4"
	>
		<legend class="fieldset-legend flex gap-x-2">
			<div class="text-md h-fit self-center">Field checkbox value if true</div>

			<!-- svelte-ignore a11y_mouse_events_have_key_events -->
			<button
				class="btn {themecolor === Domain.Entities.Theme.Color.PRIMARY
					? 'btn-primary'
					: themecolor === Domain.Entities.Theme.Color.SECONDARY
						? 'btn-secondary'
						: 'btn-accent'} btn-circle h-fit min-h-fit w-fit self-center p-0"
				onmouseover={() => (showTooltipID = 'f-checkbox-value-if-true')}
				onmouseout={() => (showTooltipID = '')}
				onclick={() => {
					const ID = 'f-checkbox-value-if-true'
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

		<div class="join max-md:join-vertical">
			<select
				class="join-item select select-md flex-[1] {themecolor === Domain.Entities.Theme.Color.PRIMARY
					? 'select-primary'
					: themecolor === Domain.Entities.Theme.Color.SECONDARY
						? 'select-secondary'
						: 'select-accent'} w-full"
				bind:value={fieldChecboxValueIfTrueType}
			>
				<option disabled value=""> Choose value data type... </option>
				{#each MetadataModel.FieldTypes as ft}
					<option value={ft}>{ft}</option>
				{/each}
			</select>

			{#if fieldChecboxValueIfTrueType}
				{#if fieldChecboxValueIfTrueType === MetadataModel.FieldType.NUMBER || fieldChecboxValueIfTrueType === MetadataModel.FieldType.TEXT}
					<input
						class="join-item input input-md flex-[2] {themecolor === Domain.Entities.Theme.Color.PRIMARY
							? 'input-primary'
							: themecolor === Domain.Entities.Theme.Color.SECONDARY
								? 'input-secondary'
								: 'input-accent'}"
						type={fieldChecboxValueIfTrueType === MetadataModel.FieldType.NUMBER ? 'number' : 'text'}
						placeholder="Enter value..."
						bind:value={fieldChecboxValueIfTrueValue}
					/>
				{:else}
					<div
						class="join-item label text-error flex-[2] border p-1 {themecolor === Domain.Entities.Theme.Color.PRIMARY
							? 'border-primary'
							: themecolor === Domain.Entities.Theme.Color.SECONDARY
								? 'border-secondary'
								: 'border-accent'}"
					>
						Type not supported.
					</div>
				{/if}
			{/if}
		</div>

		{#if showTooltipID === 'f-checkbox-value-if-true'}
			<div class="label">Value to use in place of 'true' for checkbox input.</div>
		{/if}
	</fieldset>

	<fieldset
		class="fieldset {theme === Domain.Entities.Theme.Theme.DARK
			? 'border-gray-950 bg-gray-800'
			: 'border-gray-400 bg-gray-200'} rounded-box w-full border p-4"
	>
		<legend class="fieldset-legend flex gap-x-2">
			<div class="text-md h-fit self-center">Field checkbox value if false</div>

			<!-- svelte-ignore a11y_mouse_events_have_key_events -->
			<button
				class="btn {themecolor === Domain.Entities.Theme.Color.PRIMARY
					? 'btn-primary'
					: themecolor === Domain.Entities.Theme.Color.SECONDARY
						? 'btn-secondary'
						: 'btn-accent'} btn-circle h-fit min-h-fit w-fit self-center p-0"
				onmouseover={() => (showTooltipID = 'f-checkbox-value-if-false')}
				onmouseout={() => (showTooltipID = '')}
				onclick={() => {
					const ID = 'f-checkbox-value-if-false'
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

		<div class="join max-md:join-vertical">
			<select
				class="join-item select select-md flex-[1] {themecolor === Domain.Entities.Theme.Color.PRIMARY
					? 'select-primary'
					: themecolor === Domain.Entities.Theme.Color.SECONDARY
						? 'select-secondary'
						: 'select-accent'} w-full"
				bind:value={fieldChecboxValueIfFalseType}
			>
				<option disabled value=""> Choose value data type... </option>
				{#each MetadataModel.FieldTypes as ft}
					<option value={ft}>{ft}</option>
				{/each}
			</select>

			{#if fieldChecboxValueIfFalseType}
				{#if fieldChecboxValueIfFalseType === MetadataModel.FieldType.NUMBER || fieldChecboxValueIfFalseType === MetadataModel.FieldType.TEXT}
					<input
						class="join-item input input-md flex-[2] {themecolor === Domain.Entities.Theme.Color.PRIMARY
							? 'input-primary'
							: themecolor === Domain.Entities.Theme.Color.SECONDARY
								? 'input-secondary'
								: 'input-accent'}"
						type={fieldChecboxValueIfFalseType === MetadataModel.FieldType.NUMBER ? 'number' : 'text'}
						placeholder="Enter value..."
						bind:value={fieldChecboxValueIfFalseValue}
					/>
				{:else}
					<div
						class="join-item label text-error flex-[2] border p-1 {themecolor === Domain.Entities.Theme.Color.PRIMARY
							? 'border-primary'
							: themecolor === Domain.Entities.Theme.Color.SECONDARY
								? 'border-secondary'
								: 'border-accent'}"
					>
						Type not supported.
					</div>
				{/if}
			{/if}
		</div>

		{#if showTooltipID === 'f-checkbox-value-if-false'}
			<div class="label">Value to use in place of 'false' for checkbox input.</div>
		{/if}
	</fieldset>

	<fieldset
		class="fieldset {theme === Domain.Entities.Theme.Theme.DARK
			? 'border-gray-950 bg-gray-800'
			: 'border-gray-400 bg-gray-200'} rounded-box w-full border p-4"
	>
		<legend class="fieldset-legend flex gap-x-2">
			<div class="text-md h-fit self-center">Field Checkbox use value is in input/storage?</div>

			<!-- svelte-ignore a11y_mouse_events_have_key_events -->
			<button
				class="btn {themecolor === Domain.Entities.Theme.Color.PRIMARY
					? 'btn-primary'
					: themecolor === Domain.Entities.Theme.Color.SECONDARY
						? 'btn-secondary'
						: 'btn-accent'} btn-circle h-fit min-h-fit w-fit self-center p-0"
				onmouseover={() => (showTooltipID = 'fg-use-checkbox-values-in-storage')}
				onmouseout={() => (showTooltipID = '')}
				onclick={() => {
					const ID = 'fg-use-checkbox-values-in-storage'
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
			bind:checked={fieldCheckboxUseValueInstorage}
		/>

		{#if showTooltipID === 'fg-use-checkbox-values-in-storage'}
			<div class="label">Use checkbox value when setting the value during input.</div>
		{/if}
	</fieldset>
</div>
