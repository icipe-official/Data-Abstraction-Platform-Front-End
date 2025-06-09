<script lang="ts">
	import { Domain, Interfaces, MetadataModel, Utils } from '$lib'
	import type { View } from '../..'

	const COMPONENT_NAME = 'view-abstractions-reviews-comments-datum'

	interface Props {
		metadatamodel: any
		data?: any
		themecolor?: Domain.Entities.Theme.Color
		theme?: Domain.Entities.Theme.Theme
		telemetry?: Domain.Interfaces.ITelemetry
		switchbackground?: boolean
		rounded?: boolean
		view?: View
		title?: string
		joindepth?: number
		updateview?: (value: View) => void
	}

	let {
		metadatamodel,
		data = [],
		themecolor = Domain.Entities.Theme.Color.PRIMARY,
		theme = Domain.Entities.Theme.Theme.LIGHT,
		telemetry = undefined,
		switchbackground = true,
		rounded = true,
		view = 'simple',
		title = undefined,
		joindepth = 0,
		updateview = undefined
	}: Props = $props()

	let metadatamodelget = new Interfaces.MetadataModels.GetMetadataModel()
	let fieldanygetmetadatamodel = new Interfaces.MetadataModels.FieldAnyGetMetadataModel(telemetry)

	let groupStringified: string = $derived(JSON.stringify(metadatamodel))

	let dataStringified: any = $derived(JSON.stringify(data))

	function getFieldGroupByFieldColumnName(tableCollectionName: string, fieldColumnName: string, joinDepth: number = 0) {
		let fieldGroup: any

		MetadataModel.ForEachFieldGroup(metadatamodel, (property: any) => {
			if (
				property[MetadataModel.FgProperties.DATABASE_JOIN_DEPTH] === joinDepth &&
				property[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_NAME] === tableCollectionName &&
				property[MetadataModel.FgProperties.DATABASE_FIELD_COLUMN_NAME] === fieldColumnName
			) {
				fieldGroup = JSON.parse(JSON.stringify(property))
				return true
			}
		})

		return fieldGroup
	}

	function getDatumFieldData(tableCollectionName: string, fieldColumnName: string, joinDepth: number = 0) {
		let fieldGroup: any = getFieldGroupByFieldColumnName(tableCollectionName, fieldColumnName, joinDepth)

		if (!fieldGroup) {
			return undefined
		}

		return MetadataModel.DatabaseGetColumnFieldValue(
			JSON.parse(groupStringified),
			fieldColumnName,
			fieldGroup[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_UID],
			JSON.parse(dataStringified)
		)
	}

	function onupdateview() {
		if (updateview) {
			updateview(view)
		}
	}
</script>

{#if view === 'detailed'}
	{#await import("$lib/components/MetadataModel/Datum/View/Component.svelte") then { default: MetadataModeDatumView }}
		<MetadataModeDatumView {metadatamodel} {data} {metadatamodelget} {fieldanygetmetadatamodel} {theme} {themecolor} {telemetry} {switchbackground}
		></MetadataModeDatumView>
	{/await}
{:else}
	<div
		class="flex flex-col overflow-hidden p-4 {theme === Domain.Entities.Theme.Theme.DARK
			? switchbackground
				? 'border-gray-950 bg-gray-800'
				: 'border-gray-900 bg-gray-700'
			: switchbackground
				? 'border-gray-500 bg-gray-300'
				: 'border-gray-400 bg-gray-200'} {rounded ? 'rounded-lg' : ''}"
	>
		{#if title}
			{#await import('../../Header/Datum/Component.svelte') then { default: HeaderDatum }}
				<HeaderDatum
					{title}
					{theme}
					{themecolor}
					updateview={(value) => {
						view = value
						onupdateview()
					}}
				></HeaderDatum>
			{/await}
			<div class="divider mb-0 mt-0"></div>
		{/if}

		<main class="flex flex-col gap-y-4 overflow-auto">
			{@render datumid()}

			{@render datumabstractionsid()}

			{@render datumdirectoryinformation()}

			{@render datumcreatedon()}
		</main>
	</div>
{/if}

{#snippet datumid()}
	{@const fieldData = getDatumFieldData(
		Domain.Entities.AbstractionsReviewsComments.RepositoryName,
		Domain.Entities.AbstractionsReviewsComments.FieldColumn.ID,
		joindepth
	)}

	<fieldset
		class="fieldset {theme === Domain.Entities.Theme.Theme.DARK
			? !switchbackground
				? 'border-gray-950 bg-gray-800'
				: 'border-gray-900 bg-gray-700'
			: !switchbackground
				? 'border-gray-500 bg-gray-300'
				: 'border-gray-400 bg-gray-200'} rounded-box w-full border p-4"
	>
		<legend class="fieldset-legend">Comment ID</legend>

		{#if fieldData}
			<span class="text-lg">
				{#if Array.isArray(fieldData) && fieldData.length > 0}
					{fieldData[0]}
				{:else}
					{@render nodata()}
				{/if}
			</span>
		{:else}
			{@render nodata()}
		{/if}
	</fieldset>
{/snippet}

{#snippet datumcreatedon()}
	{@const fieldData = getDatumFieldData(
		Domain.Entities.AbstractionsReviewsComments.RepositoryName,
		Domain.Entities.AbstractionsReviewsComments.FieldColumn.CreatedOn,
		joindepth
	)}

	<fieldset
		class="fieldset {theme === Domain.Entities.Theme.Theme.DARK
			? !switchbackground
				? 'border-gray-950 bg-gray-800'
				: 'border-gray-900 bg-gray-700'
			: !switchbackground
				? 'border-gray-500 bg-gray-300'
				: 'border-gray-400 bg-gray-200'} rounded-box w-full border p-4"
	>
		<legend class="fieldset-legend">Date of Creation</legend>

		{#if fieldData}
			<span class="text-lg">
				{#if Array.isArray(fieldData) && fieldData.length > 0}
					{Utils.LocalDateFromString(fieldData[0])} at {Utils.LocalTimeFromString(fieldData[0])}
				{:else}
					{@render nodata()}
				{/if}
			</span>
		{:else}
			{@render nodata()}
		{/if}
	</fieldset>
{/snippet}

{#snippet datumabstractionsid()}
	{@const fieldData = getDatumFieldData(
		Domain.Entities.AbstractionsReviewsComments.RepositoryName,
		Domain.Entities.AbstractionsReviewsComments.FieldColumn.AbstractionsID,
		joindepth
	)}

	<fieldset
		class="fieldset {theme === Domain.Entities.Theme.Theme.DARK
			? !switchbackground
				? 'border-gray-950 bg-gray-800'
				: 'border-gray-900 bg-gray-700'
			: !switchbackground
				? 'border-gray-500 bg-gray-300'
				: 'border-gray-400 bg-gray-200'} rounded-box w-full border p-4"
	>
		<legend class="fieldset-legend">Abstraction ID</legend>

		{#if fieldData}
			<p class="text-lg">{fieldData}</p>
		{:else}
			{@render nodata()}
		{/if}
	</fieldset>
{/snippet}

{#snippet datumdirectoryinformation()}
	<fieldset
		class="fieldset {theme === Domain.Entities.Theme.Theme.DARK
			? !switchbackground
				? 'border-gray-950 bg-gray-800'
				: 'border-gray-900 bg-gray-700'
			: !switchbackground
				? 'border-gray-500 bg-gray-300'
				: 'border-gray-400 bg-gray-200'} rounded-box w-full border p-4"
	>
		<legend class="fieldset-legend">Reviewer Information</legend>

		{@render datumdirectoryid()}

		{@render datumdirectoryname()}
	</fieldset>
{/snippet}

{#snippet datumdirectoryid()}
	{@const fieldData = getDatumFieldData(
		Domain.Entities.AbstractionsReviewsComments.RepositoryName,
		Domain.Entities.AbstractionsReviewsComments.FieldColumn.DirectoryID,
		joindepth
	)}

	<label class="input min-w-fit">
		<span class="label">Reviewer Directory ID</span>
		{#if fieldData}
			<p class="text-lg">{fieldData}</p>
		{:else}
			{@render nodata()}
		{/if}
	</label>
{/snippet}

{#snippet datumdirectoryname()}
	{@const fieldData = getDatumFieldData(Domain.Entities.Directory.RepositoryName, Domain.Entities.Directory.FieldColumn.DisplayName, joindepth + 1)}

	<label class="input min-w-fit">
		<span class="label">Reviewer Name</span>
		{#if fieldData}
			<p class="text-lg">{fieldData}</p>
		{:else}
			{@render nodata()}
		{/if}
	</label>
{/snippet}

{#snippet nodata()}
	<span class="h-fit self-center text-sm italic">...no data...</span>
{/snippet}
