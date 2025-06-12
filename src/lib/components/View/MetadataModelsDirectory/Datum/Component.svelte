<script lang="ts">
	import { Domain, Interfaces, MetadataModel, Utils } from '$lib'
	import type { View } from '../..'

	const COMPONENT_NAME = 'view-metadata-models-directory-datum'

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
			{@render groupinformation()}

			{@render metadatamodelsinformation()}

			{@render datumcreatedon()}

			{@render datumlastupdatedon()}
		</main>
	</div>
{/if}

{#snippet metadatamodelsinformation()}
	<fieldset
		class="fieldset {theme === Domain.Entities.Theme.Theme.DARK
			? !switchbackground
				? 'border-gray-950 bg-gray-800'
				: 'border-gray-900 bg-gray-700'
			: !switchbackground
				? 'border-gray-500 bg-gray-300'
				: 'border-gray-400 bg-gray-200'} rounded-box w-full border p-4"
	>
		<legend class="fieldset-legend">Model Information</legend>

		{@render datummodelid()}

		{@render datummodelname()}
	</fieldset>
{/snippet}

{#snippet datummodelname()}
	{@const fieldData = getDatumFieldData(
		Domain.Entities.MetadataModels.RepositoryName,
		Domain.Entities.MetadataModels.FieldColumn.Name,
		joindepth + 1
	)}

	{#if fieldData}
		<!-- svelte-ignore a11y_label_has_associated_control -->
		<label class="input w-full min-w-fit">
			<span class="label">Model Name</span>
			<p class="text-lg">{fieldData}</p>
		</label>
	{/if}
{/snippet}

{#snippet datummodelid()}
	{@const fieldData = getDatumFieldData(
		Domain.Entities.MetadataModelsDirectory.RepositoryName,
		Domain.Entities.MetadataModelsDirectory.FieldColumn.MetadataModelsID,
		joindepth
	)}

	{#if fieldData}
		<!-- svelte-ignore a11y_label_has_associated_control -->
		<label class="input w-full min-w-fit">
			<span class="label">Model ID</span>
			<p class="text-lg">{fieldData}</p>
		</label>
	{/if}
{/snippet}

{#snippet groupinformation()}
	<fieldset
		class="fieldset {theme === Domain.Entities.Theme.Theme.DARK
			? !switchbackground
				? 'border-gray-950 bg-gray-800'
				: 'border-gray-900 bg-gray-700'
			: !switchbackground
				? 'border-gray-500 bg-gray-300'
				: 'border-gray-400 bg-gray-200'} rounded-box w-full border p-4"
	>
		<legend class="fieldset-legend">Group Information</legend>

		{@render datumgroupid()}

		{@render datumgroupdisplayname()}

		{@render datumgroupdescription()}
	</fieldset>
{/snippet}

{#snippet datumgroupdescription()}
	{@const fieldData = getDatumFieldData(
		Domain.Entities.DirectoryGroups.RepositoryName,
		Domain.Entities.DirectoryGroups.FieldColumn.Description,
		joindepth + 1
	)}

	{#if fieldData}
		<!-- svelte-ignore a11y_label_has_associated_control -->
		<label class="input w-full min-w-fit">
			<span class="label">Group Description</span>
			<p class="text-lg">{fieldData}</p>
		</label>
	{/if}
{/snippet}

{#snippet datumgroupdisplayname()}
	{@const fieldData = getDatumFieldData(
		Domain.Entities.DirectoryGroups.RepositoryName,
		Domain.Entities.DirectoryGroups.FieldColumn.DisplayName,
		joindepth + 1
	)}

	{#if fieldData}
		<!-- svelte-ignore a11y_label_has_associated_control -->
		<label class="input w-full min-w-fit">
			<span class="label">Group Name</span>
			<p class="text-lg">{fieldData}</p>
		</label>
	{/if}
{/snippet}

{#snippet datumgroupid()}
	{@const fieldData = getDatumFieldData(
		Domain.Entities.MetadataModelsDirectory.RepositoryName,
		Domain.Entities.MetadataModelsDirectory.FieldColumn.DirectoryGroupsID,
		joindepth
	)}

	{#if fieldData}
		<!-- svelte-ignore a11y_label_has_associated_control -->
		<label class="input w-full min-w-fit">
			<span class="label">Group ID</span>
			<p class="text-lg">{fieldData}</p>
		</label>
	{/if}
{/snippet}

{#snippet datumlastupdatedon()}
	{@const fieldData = getDatumFieldData(
		Domain.Entities.MetadataModelsDirectory.RepositoryName,
		Domain.Entities.MetadataModelsDirectory.FieldColumn.LastUpdatedOn,
		joindepth
	)}

	{#if fieldData}
		<fieldset
			class="fieldset {theme === Domain.Entities.Theme.Theme.DARK
				? !switchbackground
					? 'border-gray-950 bg-gray-800'
					: 'border-gray-900 bg-gray-700'
				: !switchbackground
					? 'border-gray-500 bg-gray-300'
					: 'border-gray-400 bg-gray-200'} rounded-box w-full border p-4"
		>
			<legend class="fieldset-legend">Last Updated On</legend>

			<span class="text-lg">
				{#if Array.isArray(fieldData) && fieldData.length > 0}
					{Utils.LocalDateFromString(fieldData[0])} at {Utils.LocalTimeFromString(fieldData[0])}
				{:else}
					{@render nodata()}
				{/if}
			</span>
		</fieldset>
	{/if}
{/snippet}

{#snippet datumcreatedon()}
	{@const fieldData = getDatumFieldData(
		Domain.Entities.MetadataModelsDirectory.RepositoryName,
		Domain.Entities.MetadataModelsDirectory.FieldColumn.CreatedOn,
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

{#snippet nodata()}
	<span class="h-fit self-center text-sm italic">...no data...</span>
{/snippet}
