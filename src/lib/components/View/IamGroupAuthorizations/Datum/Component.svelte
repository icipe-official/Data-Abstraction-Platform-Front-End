<script lang="ts">
	import { Domain, Interfaces, MetadataModel, Utils } from '$lib'
	import type { View } from '../..'

	const COMPONENT_NAME = 'view-iam-group-authorizations-datum'

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
		viewContext?: 'roles' | 'iam-credentials'
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
		viewContext = 'roles',
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

	function getFieldGroupByFieldColumnName(tableCollectionName: string, fieldColumnName: string, joinDepth: number = 0) {
		let fieldGroup: any

		MetadataModel.ForEachFieldGroup(JSON.parse(groupStringified), (property: any) => {
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
			<div class="divider mt-0 mb-0"></div>
		{/if}

		<main class="flex flex-col gap-y-4 overflow-auto">
			{#if viewContext !== 'iam-credentials'}
				{@render datumid()}

				{@render roleinformation()}
			{/if}

			{@render assigneeinformation()}

			{@render groupinformation()}

			{#if viewContext !== 'iam-credentials'}
				{@render datumcreatedon()}

				{@render datumdeactivatedon()}
			{/if}
		</main>
	</div>
{/if}

{#snippet datumdeactivatedon()}
	{@const fieldData = getDatumFieldData(
		Domain.Entities.IamGroupAuthorizations.RepositoryName,
		Domain.Entities.IamGroupAuthorizations.FieldColumn.DeactivatedOn,
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
		Domain.Entities.IamGroupAuthorizations.RepositoryName,
		Domain.Entities.IamGroupAuthorizations.FieldColumn.CreatedOn,
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

{#snippet datumrulegroupid()}
	{@const fieldData = getDatumFieldData(
		Domain.Entities.GroupRuleAuthorizations.RepositoryName,
		Domain.Entities.GroupRuleAuthorizations.FieldColumn.GroupAuthorizationRuleGroup,
		joindepth + 1
	)}

	{#if fieldData}
		<!-- svelte-ignore a11y_label_has_associated_control -->
		<label class="input w-full min-w-fit">
			<span class="label">Rule Section ID</span>
			<p class="text-lg">{fieldData}</p>
		</label>
	{/if}
{/snippet}

{#snippet datumruledescription()}
	{@const fieldData = getDatumFieldData(
		Domain.Entities.GroupAuthorizationRules.RepositoryName,
		Domain.Entities.GroupAuthorizationRules.FieldColumn.Description,
		joindepth + 2
	)}

	{#if fieldData}
		<!-- svelte-ignore a11y_label_has_associated_control -->
		<label class="input w-full min-w-fit">
			<span class="label">Rule Description</span>
			<p class="text-lg">{fieldData}</p>
		</label>
	{/if}
{/snippet}

{#snippet datumruleid()}
	{@const fieldData = getDatumFieldData(
		Domain.Entities.GroupRuleAuthorizations.RepositoryName,
		Domain.Entities.GroupRuleAuthorizations.FieldColumn.GroupAuthorizationRuleID,
		joindepth + 1
	)}

	{#if fieldData}
		<!-- svelte-ignore a11y_label_has_associated_control -->
		<label class="input w-full min-w-fit">
			<span class="label">Rule Action ID</span>
			<p class="text-lg">{fieldData}</p>
		</label>
	{/if}
{/snippet}

{#snippet roleinformation()}
	<fieldset
		class="fieldset {theme === Domain.Entities.Theme.Theme.DARK
			? !switchbackground
				? 'border-gray-950 bg-gray-800'
				: 'border-gray-900 bg-gray-700'
			: !switchbackground
				? 'border-gray-500 bg-gray-300'
				: 'border-gray-400 bg-gray-200'} rounded-box w-full border p-4"
	>
		<legend class="fieldset-legend">Role Information</legend>

		{@render datumruleid()}

		{@render datumrulegroupid()}

		{@render datumruledescription()}
	</fieldset>
{/snippet}

{#snippet datumgroupruleauthorizationid()}
	{@const fieldData = getDatumFieldData(
		Domain.Entities.IamGroupAuthorizations.RepositoryName,
		Domain.Entities.IamGroupAuthorizations.FieldColumn.GroupRuleAuthorizationsID,
		joindepth
	)}

	<label class="input w-full min-w-fit">
		<span class="label">Rule ID</span>

		{#if fieldData}
			<p class="text-lg">{fieldData}</p>
		{:else}
			{@render nodata()}
		{/if}
	</label>
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
		<legend class="fieldset-legend">Group {viewContext !== 'iam-credentials' ? 'Role' : ''} Information</legend>

		{#if viewContext !== 'iam-credentials'}
			{@render datumgroupruleauthorizationid()}
		{/if}

		{@render datumgroupid()}

		{@render datumdirectorygroupdisplayname()}
	</fieldset>
{/snippet}

{#snippet datumdirectorygroupdisplayname()}
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
		Domain.Entities.GroupRuleAuthorizations.RepositoryName,
		Domain.Entities.GroupRuleAuthorizations.FieldColumn.DirectoryGroupsID,
		joindepth + 1
	)}

	{#if fieldData}
		<!-- svelte-ignore a11y_label_has_associated_control -->
		<label class="input w-full min-w-fit">
			<span class="label">Group ID</span>
			<p class="text-lg">{fieldData}</p>
		</label>
	{/if}
{/snippet}

{#snippet assigneeinformation()}
	<fieldset
		class="fieldset {theme === Domain.Entities.Theme.Theme.DARK
			? !switchbackground
				? 'border-gray-950 bg-gray-800'
				: 'border-gray-900 bg-gray-700'
			: !switchbackground
				? 'border-gray-500 bg-gray-300'
				: 'border-gray-400 bg-gray-200'} rounded-box w-full border p-4"
	>
		<legend class="fieldset-legend">{viewContext !== 'iam-credentials' ? 'Assignee' : 'User'} Information</legend>

		{@render datumiamcredentialsid()}

		{@render datumiamcredentialname()}

		{@render datumiamcredentialemail()}
	</fieldset>
{/snippet}

{#snippet datumiamcredentialemail()}
	{@const fieldData = getDatumFieldData(
		Domain.Entities.IamCredentials.RepositoryName,
		Domain.Entities.IamCredentials.FieldColumn.OpenidEmail,
		joindepth + 1
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

{#snippet datumiamcredentialname()}
	{@const lastName = getDatumFieldData(
		Domain.Entities.IamCredentials.RepositoryName,
		Domain.Entities.IamCredentials.FieldColumn.OpenidFamilyName,
		joindepth + 1
	)}

	{@const firstName = getDatumFieldData(
		Domain.Entities.IamCredentials.RepositoryName,
		Domain.Entities.IamCredentials.FieldColumn.OpenidGivenName,
		joindepth + 1
	)}

	{@const userName = getDatumFieldData(
		Domain.Entities.IamCredentials.RepositoryName,
		Domain.Entities.IamCredentials.FieldColumn.OpenidPreferredUsername,
		1
	)}

	{#if (lastName && firstName) || userName}
		<label class="input w-full min-w-fit">
			<span class="label">Name</span>

			<span>
				{#if Array.isArray(lastName) && lastName.length > 0 && Array.isArray(firstName) && firstName.length > 0}
					{lastName[0]} {firstName[0]}
				{:else if Array.isArray(userName) && userName.length > 0}
					{userName[0]}
				{:else}
					{@render nodata()}
				{/if}
			</span>
		</label>
	{/if}
{/snippet}

{#snippet datumiamcredentialsid()}
	{@const fieldData = getDatumFieldData(
		Domain.Entities.IamGroupAuthorizations.RepositoryName,
		Domain.Entities.IamGroupAuthorizations.FieldColumn.IamCredentialsID,
		joindepth
	)}

	<label class="input w-full min-w-fit">
		<span class="label">User ID</span>

		{#if fieldData}
			<p class="text-lg">{fieldData}</p>
		{:else}
			{@render nodata()}
		{/if}
	</label>
{/snippet}

{#snippet datumid()}
	{@const fieldData = getDatumFieldData(
		Domain.Entities.IamGroupAuthorizations.RepositoryName,
		Domain.Entities.IamGroupAuthorizations.FieldColumn.ID,
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
		<legend class="fieldset-legend">Role ID</legend>

		{#if fieldData}
			<p class="text-lg">{fieldData}</p>
		{:else}
			{@render nodata()}
		{/if}
	</fieldset>
{/snippet}

{#snippet nodata()}
	<span class="h-fit self-center text-sm italic">...no data...</span>
{/snippet}
