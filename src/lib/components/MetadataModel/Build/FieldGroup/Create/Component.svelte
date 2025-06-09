<!--
@component

Quickly create new field/group.

Props:
- groupkey -
- theme -
- indexingroupreadorderoffields -
- createfieldgroup - 
- telemetry - utility for collecting telemetry following the `Domain.Interfaces.ITelemetry`interface.
-->
<script lang="ts">
	import { Domain, Utils } from '$lib'

	const COMPONENT_NAME = 'metadata-model-build-field-group-create'

	interface Props {
		groupkey: string
		themecolor: Domain.Entities.Theme.Color
		indexingroupreadorderoffields?: number
		createfieldgroup: (groupKey: string, fieldGroupName: string, isField: boolean, objectIndexInGroupReadOrderOfFields: number) => void
		telemetry?: Domain.Interfaces.ITelemetry
	}

	let {
		groupkey,
		themecolor = Domain.Entities.Theme.Color.PRIMARY,
		indexingroupreadorderoffields = -1,
		createfieldgroup,
		telemetry = undefined
	}: Props = $props()

	let fieldGroupKeySuffix: string = $state('')

	/**
	 * Error if {@linkcode fieldGroupKeySuffix} length is not valid.
	 */
	let fieldGroupKeySuffixLengthNotValid: string | null = $derived.by(() => {
		if (fieldGroupKeySuffix.length === 0) {
			return 'Key must be at least one character in length.'
		}

		return null
	})

	/**
	 * Error if {@linkcode fieldGroupKeySuffix} is a number. Causes field to set in an array instead of an object.
	 */
	let fieldGroupKeySuffixNumberError: string | null = $derived.by(() => {
		if (Number.isNaN(Number(fieldGroupKeySuffix))) {
			return null
		}

		return 'Key cannot be a number.'
	})

	/**
	 * Combine {@linkcode fieldGroupKeySuffix} errors.
	 */
	let fieldGroupKeySuffixError: string[] = $derived.by(() => {
		let error: string[] = []

		if (fieldGroupKeySuffixLengthNotValid) {
			error.push(fieldGroupKeySuffixLengthNotValid)
		}

		if (fieldGroupKeySuffixNumberError) {
			error.push(fieldGroupKeySuffixNumberError)
		}

		return error
	})

	/**
	 * Indicate if new field/group will be a field or a group.
	 */
	let isField: boolean = $state(true)

	function oncreatefieldgroup() {
		if (fieldGroupKeySuffixLengthNotValid || fieldGroupKeySuffixNumberError) {
			return
		}

		telemetry?.Log(
			COMPONENT_NAME,
			true,
			Domain.Entities.Telemetry.LogLevel.DEBUG,
			'New Field/Group',
			'groupkey',
			groupkey,
			'fieldGroupKeySuffix',
			fieldGroupKeySuffix,
			'isField',
			isField,
			'indexingroupreadorderoffields',
			indexingroupreadorderoffields
		)

		createfieldgroup(groupkey, fieldGroupKeySuffix, isField, indexingroupreadorderoffields)
		fieldGroupKeySuffix = ''
	}

	let fieldGroupKeyInputFocused: boolean | null | undefined = $state(undefined)
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<form
	class="flex h-fit w-full flex-col gap-y-1"
	onkeydown={(e: KeyboardEvent) => {
		if (e.key === 'Enter') {
			oncreatefieldgroup()
		}
	}}
>
	<div class="join max-md:join-vertical">
		<input
			id="field-group-key"
			class="join-item input w-full flex-[3] max-md:min-h-[50px] {themecolor === Domain.Entities.Theme.Color.PRIMARY
				? 'input-primary'
				: themecolor === Domain.Entities.Theme.Color.SECONDARY
					? 'input-secondary'
					: themecolor === Domain.Entities.Theme.Color.ACCENT}"
			type="text"
			placeholder="Enter field/group name (will be used as key)..."
			bind:value={fieldGroupKeySuffix}
			bind:focused={fieldGroupKeyInputFocused}
		/>

		<select
			id="is-field-group"
			class="join-item select w-full flex-1 p-2 {themecolor === Domain.Entities.Theme.Color.PRIMARY
				? 'select-primary'
				: themecolor === Domain.Entities.Theme.Color.SECONDARY
					? 'select-secondary'
					: 'select-accent'}"
			value={`${isField}`}
			onchange={(e: Event & { currentTarget: EventTarget & HTMLSelectElement }) => {
				isField = e.currentTarget.value === 'true' ? true : false
			}}
		>
			<option value="true" selected={isField === true}>Field</option>
			<option value="false" selected={isField === false}>Group</option>
		</select>

		<button
			id="create-field-group"
			class="join-item btn h-fit p-0 md:w-fit {themecolor === Domain.Entities.Theme.Color.PRIMARY
				? 'btn-primary'
				: themecolor === Domain.Entities.Theme.Color.SECONDARY
					? 'btn-secondary'
					: 'btn-accent'}"
			aria-label="Create Field/Group"
			onclick={(e: Event) => {
				e.preventDefault()

				oncreatefieldgroup()
			}}
		>
			<span class="md:hidden">Create Field/Group</span>

			<!--mdi:plus source: https://icon-sets.iconify.design-->
			<svg xmlns="http://www.w3.org/2000/svg" width="38" height="38" viewBox="0 0 24 24">
				<path fill="var({Utils.Theme.GetColorContent(themecolor)})" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z" />
			</svg>
		</button>
	</div>

	{#if fieldGroupKeyInputFocused && fieldGroupKeySuffixError.length > 0}
		<ul id="field-group-key-error" class="text-md text-error list-inside list-disc">
			{#each fieldGroupKeySuffixError as e}
				<li>{e}</li>
			{/each}
		</ul>
	{/if}
</form>
