<!--
@component

Edit field properties.

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

	const COMPONENT_NAME = 'metadata-model-edit-field-group-field'

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

	let fieldPlaceholder: string = $derived(fieldgroup[MetadataModel.FgProperties.FIELD_PLACEHOLDER] || '')
	/**
	 * Error if {@linkcode fieldgroup} {@linkcode MetadataModel.FgProperties.FIELD_PLACEHOLDER} length is not valid.
	 */
	let fieldPlaceholderLengthNotValid: string | null = $derived.by(() => {
		if (fieldPlaceholder.length === 0) {
			return 'Value must be at least one character in length.'
		}

		return null
	})
	/**
	 * Combine {@linkcode fieldgroup} {@linkcode MetadataModel.FgProperties.FIELD_PLACEHOLDER} errors.
	 */
	let fieldPlaceholderError: string[] = $derived.by(() => {
		let error: string[] = []

		if (fieldPlaceholderLengthNotValid) {
			error.push(fieldPlaceholderLengthNotValid)
		}

		return error
	})
	let fieldPlaceholderInputFocused: boolean | null | undefined = $state(undefined)
	$effect(() => {
		if (fieldPlaceholderError.length === 0) {
			updatefieldPlaceholder(fieldPlaceholder)
		} else {
			untrack(() => {
				delete fieldgroup[MetadataModel.FgProperties.FIELD_PLACEHOLDER]
			})
		}
	})
	function updatefieldPlaceholder(value: string) {
		fieldgroup[MetadataModel.FgProperties.FIELD_PLACEHOLDER] = value
	}

	let fieldDataType: string = $derived(fieldgroup[MetadataModel.FgProperties.FIELD_DATATYPE] || '')
	/**
	 * Error if {@linkcode fieldgroup} {@linkcode MetadataModel.FgProperties.FIELD_DATATYPE} length is not valid.
	 */
	let fieldDataTypeLengthNotValid: string | null = $derived.by(() => {
		if (fieldDataType.length === 0) {
			return 'Value must be at least one character in length.'
		}

		return null
	})
	/**
	 * Combine {@linkcode fieldgroup} {@linkcode MetadataModel.FgProperties.FIELD_DATATYPE} errors.
	 */
	let fieldDataTypeError: string[] = $derived.by(() => {
		let error: string[] = []

		if (fieldDataTypeLengthNotValid) {
			error.push(fieldDataTypeLengthNotValid)
		}

		return error
	})
	let fieldDataTypeInputFocused: boolean | null | undefined = $state(undefined)
	$effect(() => {
		if (fieldDataTypeError.length === 0) {
			updateFieldDataType(fieldDataType)
		}
	})
	function updateFieldDataType(value: string) {
		if (value !== fieldgroup[MetadataModel.FgProperties.FIELD_DATATYPE]) {
			delete fieldgroup[MetadataModel.FgProperties.FIELD_UI]
		}
		fieldgroup[MetadataModel.FgProperties.FIELD_DATATYPE] = value
	}

	let fieldUi: string = $derived(fieldgroup[MetadataModel.FgProperties.FIELD_UI] || '')
	/**
	 * Error if {@linkcode fieldgroup} {@linkcode MetadataModel.FgProperties.FIELD_UI} length is not valid.
	 */
	let fieldUiLengthNotValid: string | null = $derived.by(() => {
		if (fieldUi.length === 0) {
			return 'Value must be at least one character in length.'
		}

		return null
	})
	/**
	 * Combine {@linkcode fieldgroup} {@linkcode MetadataModel.FgProperties.FIELD_UI} errors.
	 */
	let fieldUiError: string[] = $derived.by(() => {
		let error: string[] = []

		if (fieldUiLengthNotValid) {
			error.push(fieldUiLengthNotValid)
		}

		return error
	})
	let fieldUiInputFocused: boolean | null | undefined = $state(undefined)
	$effect(() => {
		if (fieldUiError.length === 0) {
			updatefieldUi(fieldUi)
		}
	})
	function updatefieldUi(value: string) {
		fieldgroup[MetadataModel.FgProperties.FIELD_UI] = value
	}
</script>

<div class="flex flex-col gap-y-2" transition:fade>
	<main class="z-[1] flex flex-col gap-y-2 p-1">
		<fieldset
			class="fieldset {theme === Domain.Entities.Theme.Theme.DARK
				? 'border-gray-900 bg-gray-700'
				: 'border-gray-300 bg-gray-100'} rounded-box w-full border p-4"
		>
			<legend class="fieldset-legend flex gap-x-2">
				<div class="text-md h-fit self-center">Field input placeholder <span class="font-bold italic">(Optional)</span></div>

				<!-- svelte-ignore a11y_mouse_events_have_key_events -->
				<button
					class="btn {themecolor === Domain.Entities.Theme.Color.PRIMARY
						? 'btn-primary'
						: themecolor === Domain.Entities.Theme.Color.SECONDARY
							? 'btn-secondary'
							: 'btn-accent'} btn-circle h-fit min-h-fit w-fit self-center p-0"
					onmouseover={() => (showTooltipID = 'f-input-placeholder')}
					onmouseout={() => (showTooltipID = '')}
					onclick={() => {
						const ID = 'f-input-placeholder'
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
				placeholder="Enter placeholder value..."
				type="text"
				bind:value={fieldPlaceholder}
				bind:focused={fieldPlaceholderInputFocused}
			/>

			{#if showTooltipID === 'f-input-placeholder'}
				<div class="label">Placeholder text for input.</div>
			{/if}

			{#if fieldPlaceholderInputFocused && fieldPlaceholderError.length > 0}
				<ul class="text-md text-error list-inside list-disc">
					{#each fieldPlaceholderError as e}
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
				<div class="text-md h-fit self-center">Field Data Type</div>
			</legend>

			{#if fieldDataTypeInputFocused && fieldDataTypeError.length > 0}
				<ul class="text-md text-error list-inside list-disc">
					{#each fieldDataTypeError as e}
						<li>{e}</li>
					{/each}
				</ul>
			{/if}

			<select
				class="join-item select {themecolor === Domain.Entities.Theme.Color.PRIMARY
					? 'select-primary'
					: themecolor === Domain.Entities.Theme.Color.SECONDARY
						? 'select-secondary'
						: 'select-accent'} w-full"
				bind:value={fieldDataType}
				bind:focused={fieldDataTypeInputFocused}
			>
				<option value="">none</option>
				{#each MetadataModel.FieldTypes as ft}
					<option value={ft}>{ft}</option>
				{/each}
			</select>
		</fieldset>

		<fieldset
			class="fieldset {theme === Domain.Entities.Theme.Theme.DARK
				? 'border-gray-900 bg-gray-700'
				: 'border-gray-300 bg-gray-100'} rounded-box w-full border p-4"
		>
			<legend class="fieldset-legend flex gap-x-2">
				<div class="text-md h-fit self-center">Field UI</div>
			</legend>

			{#if fieldUiInputFocused && fieldUiError.length > 0}
				<ul class="text-md text-error list-inside list-disc">
					{#each fieldUiError as e}
						<li>{e}</li>
					{/each}
				</ul>
			{/if}

			<select
				class="join-item select {themecolor === Domain.Entities.Theme.Color.PRIMARY
					? 'select-primary'
					: themecolor === Domain.Entities.Theme.Color.SECONDARY
						? 'select-secondary'
						: 'select-accent'} w-full"
				bind:value={fieldUi}
				bind:focused={fieldUiInputFocused}
			>
				{#if fieldDataType === MetadataModel.FieldType.BOOLEAN}
					<option value={MetadataModel.FieldUi.CHECKBOX}>{MetadataModel.FieldUi.CHECKBOX}</option>
				{:else if fieldDataType === MetadataModel.FieldType.TIMESTAMP}
					<option value={MetadataModel.FieldUi.DATETIME}>{MetadataModel.FieldUi.DATETIME}</option>
				{:else if fieldDataType === MetadataModel.FieldType.TEXT}
					<option value={MetadataModel.FieldUi.TEXT}>{MetadataModel.FieldUi.TEXT}</option>
					<option value={MetadataModel.FieldUi.TEXTAREA}>{MetadataModel.FieldUi.TEXTAREA}</option>
				{:else if fieldDataType === MetadataModel.FieldType.NUMBER}
					<option value={MetadataModel.FieldUi.NUMBER}>{MetadataModel.FieldUi.NUMBER}</option>
				{/if}

				{#if fieldDataType === MetadataModel.FieldType.BOOLEAN || fieldDataType === MetadataModel.FieldType.TEXT || fieldDataType === MetadataModel.FieldType.NUMBER || fieldDataType === MetadataModel.FieldType.ANY}
					<option value={MetadataModel.FieldUi.SELECT}>{MetadataModel.FieldUi.SELECT}</option>
				{/if}
			</select>
		</fieldset>

		{#if fieldDataType === MetadataModel.FieldType.TIMESTAMP}
			{#await import('./Timestamp/Component.svelte') then { default: Timestamp }}
				<fieldset
					class="fieldset {theme === Domain.Entities.Theme.Theme.DARK
						? 'border-gray-900 bg-gray-700'
						: 'border-gray-300 bg-gray-100'} rounded-box w-full border p-4"
				>
					<legend class="fieldset-legend flex gap-x-2">
						<div class="text-md h-fit self-center">Timestamp (Date Time) format</div>
					</legend>

					<Timestamp
						value={fieldgroup[MetadataModel.FgProperties.FIELD_DATETIME_FORMAT]}
						{themecolor}
						updatevalue={(value?: MetadataModel.FieldDateTimeFormat | string) => {
							if (value) {
								fieldgroup[MetadataModel.FgProperties.FIELD_DATETIME_FORMAT] = value
							} else {
								delete fieldgroup[MetadataModel.FgProperties.FIELD_DATETIME_FORMAT]
							}
						}}
					></Timestamp>
				</fieldset>
			{/await}
		{/if}

		{#if fieldUi === MetadataModel.FieldUi.SELECT}
			{#await import('./Select/Component.svelte') then { default: Select }}
				<fieldset
					class="fieldset {theme === Domain.Entities.Theme.Theme.DARK
						? 'border-gray-900 bg-gray-700'
						: 'border-gray-300 bg-gray-100'} rounded-box w-full border p-4"
				>
					<legend class="fieldset-legend flex gap-x-2">
						<div class="text-md h-fit self-center">Select options</div>
					</legend>

					<Select
						value={fieldgroup[MetadataModel.FgProperties.FIELD_SELECT_OPTIONS]}
						{themecolor}
						updatevalue={(value?: MetadataModel.ISelectOption[]) => {
							if (value && value.length > 0) {
								fieldgroup[MetadataModel.FgProperties.FIELD_SELECT_OPTIONS] = value
							} else {
								delete fieldgroup[MetadataModel.FgProperties.FIELD_SELECT_OPTIONS]
							}
						}}
						{fieldDataType}
					></Select>
				</fieldset>
			{/await}
		{/if}

		{#if fieldUi === MetadataModel.FieldUi.CHECKBOX}
			{#await import('./Checkbox/Component.svelte') then { default: Checkbox }}
				<fieldset
					class="fieldset {theme === Domain.Entities.Theme.Theme.DARK
						? 'border-gray-900 bg-gray-700'
						: 'border-gray-300 bg-gray-100'} rounded-box w-full border p-4"
				>
					<legend class="fieldset-legend flex gap-x-2">
						<div class="text-md h-fit self-center">Checkbox options</div>
					</legend>

					<Checkbox
						fieldcheckboxvalueiftrue={fieldgroup[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_TRUE]}
						updatefieldcheckboxvalueiftrue={(value?: MetadataModel.IFieldCheckboxValue) => {
							if (value) {
								fieldgroup[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_TRUE] = value
							} else {
								delete fieldgroup[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_TRUE]
							}
						}}
						fieldcheckboxvalueiffalse={fieldgroup[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_FALSE]}
						updatefieldcheckboxvalueiffalse={(value?: MetadataModel.IFieldCheckboxValue) => {
							if (value) {
								fieldgroup[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_FALSE] = value
							} else {
								delete fieldgroup[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_FALSE]
							}
						}}
						fieldcheckboxusevalueinstorage={fieldgroup[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUES_USE_IN_STORAGE]}
						updatefieldcheckboxusevalueinstorage={(value?: boolean) => {
							if (value) {
								fieldgroup[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUES_USE_IN_STORAGE] = value
							} else {
								delete fieldgroup[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUES_USE_IN_STORAGE]
							}
						}}
						{themecolor}
						{theme}
					></Checkbox>
				</fieldset>
			{/await}
		{/if}

		{#await import('./Any/Component.svelte') then { default: Any }}
			<fieldset
				class="fieldset {theme === Domain.Entities.Theme.Theme.DARK
					? 'border-gray-900 bg-gray-700'
					: 'border-gray-300 bg-gray-100'} rounded-box w-full border p-4"
			>
				<legend class="fieldset-legend flex gap-x-2">
					<div class="text-md h-fit self-center">Field Data Type Any options</div>
				</legend>

				<Any
					value={fieldgroup[MetadataModel.FgProperties.FIELD_TYPE_ANY]}
					updatevalue={(value?: MetadataModel.IFieldAny) => {
						if (value) {
							fieldgroup[MetadataModel.FgProperties.FIELD_TYPE_ANY] = value
						} else {
							delete fieldgroup[MetadataModel.FgProperties.FIELD_TYPE_ANY]
						}
					}}
					{themecolor}
					{theme}
				></Any>
			</fieldset>
		{/await}
	</main>

	{@render FooterSnippet(themecolor, theme, updatefieldgroup, fieldgroup)}
</div>
