<script lang="ts">
	import { Domain, Interfaces, MetadataModel, Utils } from '$lib'
	import type { View } from '../..'

	const COMPONENT_NAME = 'view-iam-credentials-datum'

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
			{@render datumid()}

			{@render openidinformation()}

			{@render directoryinformation()}

			{@render groupinformation()}

			{@render datumcreatedon()}

			{@render datumdeactivatedon()}
		</main>
	</div>
{/if}

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
		<legend class="fieldset-legend">Directory Information</legend>

		{@render datumdirectoryid()}

		{@render datumdirectorydisplayname()}
	</fieldset>
{/snippet}

{#snippet datumdirectorydisplayname()}
	{@const fieldData = getDatumFieldData(
		Domain.Entities.Directory.RepositoryName,
		Domain.Entities.Directory.FieldColumn.DisplayName,
		joindepth + 1
	)}

	{#if fieldData}
		<!-- svelte-ignore a11y_label_has_associated_control -->
		<label class="input w-full min-w-fit">
			<span class="label">Directory Name</span>
			<p class="text-lg">{fieldData}</p>
		</label>
	{/if}
{/snippet}

{#snippet datumdirectoryid()}
	{@const fieldData = getDatumFieldData(
		Domain.Entities.Directory.RepositoryName,
		Domain.Entities.Directory.FieldColumn.ID,
		joindepth+1
	)}

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

{#snippet datumid()}
	{@const fieldData = getDatumFieldData(Domain.Entities.IamCredentials.RepositoryName, Domain.Entities.IamCredentials.FieldColumn.ID, joindepth)}

	<fieldset
		class="fieldset {theme === Domain.Entities.Theme.Theme.DARK
			? !switchbackground
				? 'border-gray-950 bg-gray-800'
				: 'border-gray-900 bg-gray-700'
			: !switchbackground
				? 'border-gray-500 bg-gray-300'
				: 'border-gray-400 bg-gray-200'} rounded-box w-full border p-4"
	>
		<legend class="fieldset-legend">Credential ID</legend>

		{#if fieldData}
			<p class="text-lg">{fieldData}</p>
		{:else}
			{@render nodata()}
		{/if}
	</fieldset>
{/snippet}

{#snippet openidinformation()}
	<fieldset
		class="fieldset {theme === Domain.Entities.Theme.Theme.DARK
			? !switchbackground
				? 'border-gray-950 bg-gray-800'
				: 'border-gray-900 bg-gray-700'
			: !switchbackground
				? 'border-gray-500 bg-gray-300'
				: 'border-gray-400 bg-gray-200'} rounded-box w-full border p-4"
	>
		<legend class="fieldset-legend">Open ID Information</legend>

		{@render datumopenidsub()}

		{@render datumopenidfamilyname()}

		{@render datumopenidgivenname()}

		{@render datumopenidusername()}

		{@render datumopenidemail()}

		{@render datumopenidemailverified()}
	</fieldset>
{/snippet}

{#snippet datumopenidsub()}
	{@const fieldData = getDatumFieldData(
		Domain.Entities.IamCredentials.RepositoryName,
		Domain.Entities.IamCredentials.FieldColumn.OpenidSub,
		joindepth
	)}

	<label class="input w-full min-w-fit">
		<span class="label">Sub</span>

		{#if fieldData}
			<p class="text-lg">{fieldData}</p>
		{:else}
			{@render nodata()}
		{/if}
	</label>
{/snippet}

{#snippet datumopenidfamilyname()}
	{@const fieldData = getDatumFieldData(
		Domain.Entities.IamCredentials.RepositoryName,
		Domain.Entities.IamCredentials.FieldColumn.OpenidFamilyName,
		joindepth
	)}

	<label class="input w-full min-w-fit">
		<span class="label">Family Name</span>

		{#if fieldData}
			<p class="text-lg">{fieldData}</p>
		{:else}
			{@render nodata()}
		{/if}
	</label>
{/snippet}

{#snippet datumopenidgivenname()}
	{@const fieldData = getDatumFieldData(
		Domain.Entities.IamCredentials.RepositoryName,
		Domain.Entities.IamCredentials.FieldColumn.OpenidGivenName,
		joindepth
	)}

	<label class="input w-full min-w-fit">
		<span class="label">Given Name</span>

		{#if fieldData}
			<p class="text-lg">{fieldData}</p>
		{:else}
			{@render nodata()}
		{/if}
	</label>
{/snippet}

{#snippet datumopenidusername()}
	{@const fieldData = getDatumFieldData(
		Domain.Entities.IamCredentials.RepositoryName,
		Domain.Entities.IamCredentials.FieldColumn.OpenidPreferredUsername,
		joindepth
	)}

	<label class="input w-full min-w-fit">
		<span class="label">Username</span>

		{#if fieldData}
			<p class="text-lg">{fieldData}</p>
		{:else}
			{@render nodata()}
		{/if}
	</label>
{/snippet}

{#snippet datumopenidemail()}
	{@const fieldData = getDatumFieldData(
		Domain.Entities.IamCredentials.RepositoryName,
		Domain.Entities.IamCredentials.FieldColumn.OpenidEmail,
		joindepth
	)}

	<label class="input w-full min-w-fit">
		<span class="label">Email</span>

		{#if fieldData}
			<p class="text-lg">{fieldData}</p>
		{:else}
			{@render nodata()}
		{/if}
	</label>
{/snippet}

{#snippet datumopenidemailverified()}
	{@const fieldData = getDatumFieldData(
		Domain.Entities.IamCredentials.RepositoryName,
		Domain.Entities.IamCredentials.FieldColumn.OpenidEmailVerified,
		joindepth
	)}

	<label class="input w-full min-w-fit">
		<span class="label">Email Verified?</span>

		{#if fieldData}
			<p class="text-lg">{fieldData ? 'yes' : 'no'}</p>
		{:else}
			{@render nodata()}
		{/if}
	</label>
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
		Domain.Entities.DirectoryGroups.RepositoryName,
		Domain.Entities.DirectoryGroups.FieldColumn.ID,
		joindepth+2
	)}

	{#if fieldData}
		<!-- svelte-ignore a11y_label_has_associated_control -->
		<label class="input w-full min-w-fit">
			<span class="label">Group ID</span>
			<p class="text-lg">{fieldData}</p>
		</label>
	{/if}
{/snippet}

{#snippet datumdeactivatedon()}
	{@const fieldData = getDatumFieldData(
		Domain.Entities.IamCredentials.RepositoryName,
		Domain.Entities.IamCredentials.FieldColumn.DeactivatedOn,
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

{#snippet datumcreatedon()}
	{@const fieldData = getDatumFieldData(
		Domain.Entities.IamCredentials.RepositoryName,
		Domain.Entities.IamCredentials.FieldColumn.CreatedOn,
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
