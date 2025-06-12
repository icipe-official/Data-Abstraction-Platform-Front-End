<script lang="ts">
	import { Domain, Interfaces, Json, MetadataModel, Utils } from '$lib'
	import type { View } from '../..'

	const COMPONENT_NAME = 'view-abstractions-datum'

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

	function getdata(path: string, arrayindexes: number[]) {
		try {
			arrayindexes = [arrayindexes[0], ...arrayindexes]
			path = MetadataModel.PreparePathToValueInObject(path, arrayindexes)
			return Json.GetValueInObject(data, path)
		} catch (e) {
			telemetry?.Log(COMPONENT_NAME, true, Domain.Entities.Telemetry.LogLevel.ERROR, 'Get Metadata Model Data failed', 'error', e)
			return undefined
		}
	}

	async function getFieldAnyMetadataModel(field: any, arrayIndexPlaceholders: number[]) {
		if (metadatamodelget === undefined) {
			return undefined
		}

		if (fieldanygetmetadatamodel === undefined) {
			return undefined
		}

		const fieldKey = field[MetadataModel.FgProperties.FIELD_GROUP_KEY]

		if (typeof fieldKey !== 'string') {
			return undefined
		}

		const fieldAnyProps = field[MetadataModel.FgProperties.FIELD_TYPE_ANY]
		if (typeof fieldAnyProps !== 'object' || Array.isArray(fieldAnyProps) || fieldAnyProps === null) {
			return undefined
		}

		const metadataModelActionID = fieldAnyProps[MetadataModel.FieldAnyProperties.METADATA_MODEL_ACTION_ID]
		if (typeof metadataModelActionID !== 'string') {
			return undefined
		}

		const pathToDataArgument = fieldAnyProps[MetadataModel.FieldAnyProperties.GET_METADATA_MODEL_PATH_TO_DATA_ARGUMENT]
		if (typeof pathToDataArgument !== 'string') {
			return undefined
		}

		const arg = getdata(pathToDataArgument, arrayIndexPlaceholders)

		return await metadatamodelget.GetMetadataModel(
			fieldanygetmetadatamodel,
			metadataModelActionID,
			fieldKey,
			field[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_UID],
			arg
		)
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
			{@render abstractioninformation()}

			{@render datumdata()}

			{@render directoryinformation()}

			{@render storagefileinformation()}

			{@render modelinformation()}

			{@render groupinformation()}

			{@render datumcreatedon()}

			{@render datumlastupdatedon()}

			{@render datumdeactivatedon()}
		</main>
	</div>
{/if}

{#snippet modelinformation()}
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
		joindepth + 2
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
		Domain.Entities.AbstractionsDirectoryGroups.RepositoryName,
		Domain.Entities.AbstractionsDirectoryGroups.FieldColumn.MetadataModelsID,
		joindepth + 1
	)}

	{#if fieldData}
		<!-- svelte-ignore a11y_label_has_associated_control -->
		<label class="input w-full min-w-fit">
			<span class="label">Model ID</span>
			<p class="text-lg">{fieldData}</p>
		</label>
	{/if}
{/snippet}

{#snippet storagefileinformation()}
	<fieldset
		class="fieldset {theme === Domain.Entities.Theme.Theme.DARK
			? !switchbackground
				? 'border-gray-950 bg-gray-800'
				: 'border-gray-900 bg-gray-700'
			: !switchbackground
				? 'border-gray-500 bg-gray-300'
				: 'border-gray-400 bg-gray-200'} rounded-box w-full border p-4"
	>
		<legend class="fieldset-legend">File Information</legend>

		{@render datumstoragefileid()}

		{@render datumstoragefileoriginalname()}
	</fieldset>
{/snippet}

{#snippet datumstoragefileoriginalname()}
	{@const fieldData = getDatumFieldData(
		Domain.Entities.StorageFiles.RepositoryName,
		Domain.Entities.StorageFiles.FieldColumn.OriginalName,
		joindepth
	)}

	{#if fieldData}
		<!-- svelte-ignore a11y_label_has_associated_control -->
		<label class="input w-full min-w-fit">
			<span class="label">File Original Name</span>
			<p class="text-lg">{fieldData}</p>
		</label>
	{/if}
{/snippet}

{#snippet datumstoragefileid()}
	{@const fieldData = getDatumFieldData(Domain.Entities.Abstractions.RepositoryName, Domain.Entities.Abstractions.FieldColumn.ID, joindepth)}

	{#if fieldData}
		<!-- svelte-ignore a11y_label_has_associated_control -->
		<label class="input w-full min-w-fit">
			<span class="label">File ID</span>
			<p class="text-lg">{fieldData}</p>
		</label>
	{/if}
{/snippet}

{#snippet abstractioninformation()}
	<fieldset
		class="fieldset {theme === Domain.Entities.Theme.Theme.DARK
			? !switchbackground
				? 'border-gray-950 bg-gray-800'
				: 'border-gray-900 bg-gray-700'
			: !switchbackground
				? 'border-gray-500 bg-gray-300'
				: 'border-gray-400 bg-gray-200'} rounded-box w-full border p-4"
	>
		<legend class="fieldset-legend">Abstraction Information</legend>

		{@render datumid()}

		{@render datumcompleted()}

		{@render datumreviewpass()}
	</fieldset>
{/snippet}

{#snippet directoryinformation()}
	<fieldset
		class="fieldset {theme === Domain.Entities.Theme.Theme.DARK
			? !switchbackground
				? 'border-gray-950 bg-gray-800'
				: 'border-gray-900 bg-gray-700'
			: !switchbackground
				? 'border-gray-500 bg-gray-300'
				: 'border-gray-400 bg-gray-200'} rounded-box w-full border p-4"
	>
		<legend class="fieldset-legend">Owner Information</legend>

		{@render datumdirectoryid()}

		{@render datumdirectorydisplayname()}
	</fieldset>
{/snippet}

{#snippet datumdirectorydisplayname()}
	{@const fieldData = getDatumFieldData(Domain.Entities.Directory.RepositoryName, Domain.Entities.Directory.FieldColumn.DisplayName, joindepth + 1)}

	{#if fieldData}
		<!-- svelte-ignore a11y_label_has_associated_control -->
		<label class="input w-full min-w-fit">
			<span class="label">Directory Name</span>
			<p class="text-lg">{fieldData}</p>
		</label>
	{/if}
{/snippet}

{#snippet datumdirectoryid()}
	{@const fieldData = getDatumFieldData(Domain.Entities.Directory.RepositoryName, Domain.Entities.Directory.FieldColumn.ID, joindepth + 1)}

	{#if fieldData}
		<!-- svelte-ignore a11y_label_has_associated_control -->
		<label class="input w-full min-w-fit">
			<span class="label">Directory ID</span>
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
		joindepth + 2
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
		joindepth + 2
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
		Domain.Entities.Abstractions.RepositoryName,
		Domain.Entities.Abstractions.FieldColumn.AbstractionsDirectoryGroupsID,
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
		Domain.Entities.MetadataModels.RepositoryName,
		Domain.Entities.MetadataModels.FieldColumn.LastUpdatedOn,
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
		Domain.Entities.Abstractions.RepositoryName,
		Domain.Entities.Abstractions.FieldColumn.CreatedOn,
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

{#snippet datumid()}
	{@const fieldData = getDatumFieldData(Domain.Entities.Abstractions.RepositoryName, Domain.Entities.Abstractions.FieldColumn.ID, joindepth)}

	<!-- svelte-ignore a11y_label_has_associated_control -->
	<label class="input w-full min-w-fit">
		<span class="label">Abstractions ID</span>
		{#if fieldData}
			<p class="text-lg">{fieldData[0]}</p>
		{:else}
			{@render nodata()}
		{/if}
	</label>
{/snippet}

{#snippet datumcompleted()}
	{@const fieldData = getDatumFieldData(Domain.Entities.Abstractions.RepositoryName, Domain.Entities.Abstractions.FieldColumn.Completed, joindepth)}

	<!-- svelte-ignore a11y_label_has_associated_control -->
	<label class="input w-full min-w-fit">
		<span class="label">Completed?</span>
		{#if fieldData}
			<p class="text-lg">{fieldData[0] ? 'yes' : 'no'}</p>
		{:else}
			{@render nodata()}
		{/if}
	</label>
{/snippet}

{#snippet datumreviewpass()}
	{@const fieldData = getDatumFieldData(Domain.Entities.Abstractions.RepositoryName, Domain.Entities.Abstractions.FieldColumn.ReviewPass, joindepth)}

	<!-- svelte-ignore a11y_label_has_associated_control -->
	<label class="input w-full min-w-fit">
		<span class="label">Checks Passed?</span>
		{#if fieldData}
			<p class="text-lg">{fieldData[0] ? 'yes' : 'no'}</p>
		{:else}
			{@render nodata()}
		{/if}
	</label>
{/snippet}

{#snippet datumdeactivatedon()}
	{@const fieldData = getDatumFieldData(
		Domain.Entities.Abstractions.RepositoryName,
		Domain.Entities.Abstractions.FieldColumn.DeactivatedOn,
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
			<legend class="fieldset-legend">Deactivated On</legend>

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

{#snippet datumdata()}
	{@const fieldData = getDatumFieldData(Domain.Entities.Directory.RepositoryName, Domain.Entities.Directory.FieldColumn.Data, joindepth)}

	{#if Array.isArray(fieldData)}
		<fieldset
			class="fieldset {theme === Domain.Entities.Theme.Theme.DARK
				? !switchbackground
					? 'border-gray-950 bg-gray-800'
					: 'border-gray-900 bg-gray-700'
				: !switchbackground
					? 'border-gray-500 bg-gray-300'
					: 'border-gray-400 bg-gray-200'} rounded-box w-full border p-4"
		>
			<legend class="fieldset-legend">Abstraction Data</legend>

			<span>
				{#await getFieldAnyMetadataModel(getFieldGroupByFieldColumnName(Domain.Entities.Abstractions.RepositoryName, Domain.Entities.Abstractions.FieldColumn.Data, joindepth), []) then fieldAnyMetadataModel}
					{#if fieldAnyMetadataModel !== undefined}
						{#await import('$lib/components/MetadataModel/Datum/View/Component.svelte') then { default: MetadataModelDatumView }}
							<MetadataModelDatumView
								metadatamodel={fieldAnyMetadataModel}
								data={fieldData}
								{themecolor}
								{theme}
								{telemetry}
								{metadatamodelget}
								{switchbackground}
								{fieldanygetmetadatamodel}
							></MetadataModelDatumView>
						{/await}
					{:else}
						{@render json(fieldData)}
					{/if}
				{/await}
			</span>
		</fieldset>
	{/if}
{/snippet}

{#snippet json(value: any)}
	<pre
		class="h-fit max-h-[50vh] w-full flex-1 overflow-auto rounded-md {theme === Domain.Entities.Theme.Theme.DARK
			? !switchbackground
				? 'bg-gray-800'
				: 'border-gray-900 bg-gray-700'
			: !switchbackground
				? 'bg-gray-300'
				: 'bg-gray-200'} p-1 shadow-inner shadow-gray-800 lg:max-w-[50vw]"><code>{JSON.stringify(value, null, 4)}</code></pre>
{/snippet}

{#snippet nodata()}
	<span class="h-fit self-center text-sm italic">...no data...</span>
{/snippet}
