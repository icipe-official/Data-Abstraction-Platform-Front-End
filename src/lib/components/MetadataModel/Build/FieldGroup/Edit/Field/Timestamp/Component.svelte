<!--
@component

Manage `timestamp` related field properties.


Props:
- value -
- themecolor -
- updatevalue -
-->
<script lang="ts">
	import { Domain, MetadataModel } from '$lib'

	const COMPONENT_NAME = 'metadata-model-edit-field-group-field-timestamp'

	interface Props {
		value?: MetadataModel.FieldDateTimeFormat
		themecolor?: Domain.Entities.Theme.Color
		updatevalue: (value?: MetadataModel.FieldDateTimeFormat | string) => void
	}

	let { value = undefined, themecolor = Domain.Entities.Theme.Color.PRIMARY, updatevalue }: Props = $props()

	let fieldDateTimeFormat: string = $derived(value || '')

	let fieldDataTypeInputFocused: boolean | null | undefined = $state(undefined)

	$effect(() => {
		updatevalue(fieldDateTimeFormat)
	})

    /**
	 * Error if {@linkcode fieldgroup} {@linkcode MetadataModel.FgProperties.FIELD_DATETIME_FORMAT} length is not valid.
	 */
	let fieldDateTimeFormatLengthNotValid: string | null = $derived.by(() => {
		if (!fieldDateTimeFormat || fieldDateTimeFormat.length === 0) {
			return 'Value must be at least one character in length.'
		}

		return null
	})

    /**
	 * Combine {@linkcode fieldgroup} {@linkcode MetadataModel.FgProperties.FIELD_DATETIME_FORMAT} errors.
	 */
	let fieldDateTimeFormatError: string[] = $derived.by(() => {
		let error: string[] = []

		if (fieldDateTimeFormatLengthNotValid) {
			error.push(fieldDateTimeFormatLengthNotValid)
		}

		return error
	})
</script>

{#if fieldDataTypeInputFocused && fieldDateTimeFormatError.length > 0}
	<ul class="text-md text-error list-inside list-disc">
		{#each fieldDateTimeFormatError as e}
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
	bind:value={fieldDateTimeFormat}
	bind:focused={fieldDataTypeInputFocused}
>
	<option value="">none</option>
	{#each MetadataModel.FieldDateTimeFormats as fdtf}
		<option value={fdtf}>{fdtf}</option>
	{/each}
</select>
