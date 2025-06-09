<!--
@component

Props:
-->
<script lang="ts">
	import { Domain, Json, MetadataModel, Utils } from '$lib'

	const COMPONENT_NAME = 'metadata-model-datum-input-view-form-field-checkbox'

	interface Props {
		field: any
		arrayindexplaceholders?: number[]
		themecolor: Domain.Entities.Theme.Color
		theme: Domain.Entities.Theme.Theme
		getdata: (fieldGroupKey: string, arrayPlaceholderIndexes: number[]) => any
		updatedata: (fieldGroupKey: string, arrayPlaceholderIndexes: number[], value: any) => void
		deletedata: (fieldGroupKey: string, arrayPlaceholderIndexes: number[]) => void
		includeplaceholdertext?: boolean
	}

	let { field, arrayindexplaceholders = [], themecolor, theme, getdata, updatedata, deletedata, includeplaceholdertext = true }: Props = $props()

	let fgKey: string = $derived(`${field[MetadataModel.FgProperties.FIELD_GROUP_KEY]}${MetadataModel.ARRAY_INDEX_PLACEHOLDER}`)

	let value: any | undefined = $derived.by(() => {
		const d = getdata(fgKey, arrayindexplaceholders)

		if (typeof d !== 'undefined' && d !== null) {
			return d
		}

		return undefined
	})

	let valueIfTrue: any | undefined = $derived.by(() => {
		const fcValueIfTrue = field[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_TRUE]

		if (typeof fcValueIfTrue === 'object') {
			if (typeof fcValueIfTrue[MetadataModel.FieldCheckboxValueProperties.VALUE] !== 'undefined') {
				return fcValueIfTrue[MetadataModel.FieldCheckboxValueProperties.VALUE]
			}
		}

		return undefined
	})

	let valueIfFalse: any | undefined = $derived.by(() => {
		const fcValueIfTrue = field[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_FALSE]

		if (typeof fcValueIfTrue === 'object') {
			if (typeof fcValueIfTrue[MetadataModel.FieldCheckboxValueProperties.VALUE] !== 'undefined') {
				return fcValueIfTrue[MetadataModel.FieldCheckboxValueProperties.VALUE]
			}
		}

		return undefined
	})

	let checkboxValue: boolean | undefined = $derived.by(() => {
		if (typeof value !== 'undefined') {
			if (typeof value === 'boolean') {
				return value
			}

			if (typeof valueIfTrue !== 'undefined') {
				if (Json.AreValuesEqual(value, valueIfTrue)) {
					return true
				}
			}

			if (typeof valueIfFalse !== 'undefined') {
				if (Json.AreValuesEqual(value, valueIfFalse)) {
					return false
				}
			}
		}

		return undefined
	})

	let checkboxValuesUseInStorage: boolean = $derived(field[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUES_USE_IN_STORAGE] || false)
</script>

<div class="flex w-fit gap-x-2">
	{#if includeplaceholdertext}
		<div class="h-fit self-center text-lg font-bold">
			{field[MetadataModel.FgProperties.FIELD_PLACEHOLDER] || `Check if ${MetadataModel.GetFieldGroupName(field)}`}
		</div>
	{/if}

	<div class="flex h-fit gap-x-1 self-center text-lg font-bold italic">
		<span class="h-fit self-center">(</span>

		<span class="h-fit self-center">
			{#if typeof checkboxValue !== 'undefined'}
				{#if checkboxValue}
					{typeof valueIfTrue !== 'undefined' ? valueIfTrue : checkboxValue}
				{:else}
					{typeof valueIfFalse !== 'undefined' ? valueIfFalse : checkboxValue}
				{/if}
			{:else}
				not set
			{/if}
		</span>

		<button
			class="btn btn-md btn-circle tooltip tooltip-right self-center {themecolor === Domain.Entities.Theme.Color.PRIMARY
				? 'tooltip-primary'
				: themecolor === Domain.Entities.Theme.Color.SECONDARY
					? 'tooltip-secondary'
					: 'tooltip-accent'}"
			aria-label="reset"
			onclick={() => deletedata(fgKey, arrayindexplaceholders)}
			data-tip="Reset field"
		>
			<!--mdi:delete source: https://icon-sets.iconify.design-->
			<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
				<path fill="var({Utils.Theme.GetColor(themecolor)})" d="M19 4h-3.5l-1-1h-5l-1 1H5v2h14M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6z" />
			</svg>
		</button>

		<span class="h-fit self-center">)</span>
	</div>

	<div class="h-fit self-center text-lg">:</div>

	<input
		class="checkbox checkbox-lg self-center {themecolor === Domain.Entities.Theme.Color.PRIMARY
			? 'checkbox-primary'
			: themecolor === Domain.Entities.Theme.Color.SECONDARY
				? 'checkbox-secondary'
				: 'checkbox-accent'}"
		type="checkbox"
		checked={checkboxValue}
		oninput={(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
			let newValue = e.currentTarget.checked
			if (newValue) {
				if (checkboxValuesUseInStorage && typeof valueIfTrue !== 'undefined') {
					newValue = valueIfTrue
				}
			} else {
				if (checkboxValuesUseInStorage && typeof valueIfFalse !== 'undefined') {
					newValue = valueIfFalse
				}
			}
			updatedata(fgKey, arrayindexplaceholders, newValue)
		}}
		disabled={field[MetadataModel.FgProperties.FIELD_GROUP_INPUT_DISABLE]}
	/>
</div>
