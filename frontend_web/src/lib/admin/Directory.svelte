<script lang="ts">
	import { base } from '$app/paths'
	import { PUBLIC_API_URL } from '$env/static/public'
	import DateTime from '$lib/components/DateTime.svelte'
	import Icon from '$lib/components/Icon.svelte'
	import Table from '$lib/components/table/Table.svelte'
	import { FETCH_ERROR, Shared } from '$lib/constants'
	import {
		DirectorySearchCurrentQuery,
		DirectorySearchLastUpdatedOnGreaterThan,
		DirectorySearchLastUpdatedOnLessThan,
		DirectorySearchLimit,
		DirectorySearchOffset,
		DirectorySearchSortBy,
		DirectorySearchSortByOrder,
		DirectorySearchCreatedOnGreaterThan,
		DirectorySearchCreatedOnLessThan,
		DirectorySearchResults,
		Loading,
		LoadingMessage,
		ToastType,
        ToastMessage
	} from '$lib/stores'
	import { Log } from '$lib/utils'

	const CURRENT_SECTION = 'Admin Directory'

	const mtDirectory = {
		ID: {
			struct: 'root.ID text text name=ID&# disabled=true&#',
			value: ''
		},
		Name: {
			struct: 'root.Name text text name=Name&#',
			value: ''
		},
		Contacts: {
			struct: 'root.Contacts text text name=Contacts&#',
			value: ''
		},
		CreatedOn: {
			struct: 'root.CreatedOn text datetime name=Created On&# dtf=yyyy-mm-dd HH:MM&#',
			value: ''
		},
		LastUpdatedOn: {
			struct: 'root.LastUpdatedOn text datetime name=Last Updated On&# dtf=yyyy-mm-dd HH:MM&#',
			value: ''
		},
		SystemUserCreatedOn: {
			struct: 'root.SystemUserCreatedOn text datetime name=System User Created On&# dtf=yyyy-mm-dd HH:MM&#',
			value: ''
		},
		IamEmail: {
			struct: 'root.IamEmail text text name=Iam Email&#',
			value: ''
		},
		IamCreatedOn: {
			struct: 'root.CreatedOn text datetime name=Iam Created On&# dtf=yyyy-mm-dd HH:MM&# disabled=true&#',
			value: ''
		},
		IamLastUpdatedOn: {
			struct: 'root.LastUpdatedOn text datetime name=Iam Last Updated On&# dtf=yyyy-mm-dd HH:MM&#  disabled=true&#',
			value: ''
		},
		ProjectsRoles: {
			struct: 'root.ProjectsRoles repetitive name=Projects and Roles&#',
			value: [
				{
					ID: {
						struct: 'root.ProjectsRoles.value[x].ProjectID text text name=Project ID&# disabled=true&#',
						value: ''
					},
					ProjectName: {
						struct: 'root.ProjectsRoles.value[x].ProjectName text text name=Project Name&#',
						value: ''
					},
					Description: {
						struct: 'root.ProjectsRoles.value[x].ProjectDescription text text name=Project Description&#',
						value: ''
					},
					ProjectCreatedOn: {
						struct: 'root.ProjectsRoles.value[x].ProjectCreatedOn text datetime name=Project Created On&# dtf=yyyy-mm-dd HH:MM&#  disabled=true&#',
						value: ''
					},
					ProjectRoles: {
						struct: 'root.ProjectsRoles.value[x].ProjectRoles repetitive name=Roles&#',
						value: [
							{
								ID: {
									struct: 'root.ProjectsRoles.value[x].ProjectRoles.value[x].ProjectRoleID text text name=Role ID&#',
									value: ''
								},
								ProjectName: {
									struct: 'root.ProjectsRoles.value[x].ProjectRoles.value[x].Name text text name=Role Created On&# disabled=true&#',
									value: ''
								}
							}
						]
					}
				}
			]
		}
	}

	let FilterModelTemplate = JSON.stringify(mtDirectory)
	const HandleUpdateFilterModelTemplate = (value: string) => (FilterModelTemplate = value)

	function handleInputSearchResultsLimit(value: string) {
		if (isNaN(parseInt(value))) {
			return
		}
		$DirectorySearchLimit = parseInt(value)
		if ($DirectorySearchLimit < 5) {
			$DirectorySearchLimit = 0
		} else if ($DirectorySearchLimit < $DirectorySearchOffset) {
			if ($DirectorySearchLimit - 1000 < 0) {
				$DirectorySearchOffset = 0
			} else {
				$DirectorySearchOffset = $DirectorySearchLimit - 1000
			}
		}
	}
	function handleInputSearchResultsOffset(value: string) {
		if (isNaN(parseInt(value))) {
			return
		}
		$DirectorySearchOffset = parseInt(value)
		if ($DirectorySearchOffset < 0) {
			$DirectorySearchOffset = 0
		} else if ($DirectorySearchOffset > $DirectorySearchLimit) {
			$DirectorySearchLimit = $DirectorySearchOffset + 1000
		}
	}

	function HandleClickTableRow(index: number) {
		// $SearchResultsClickedIndex = index
		// goto(`${base}/${$CurrentProject?.ProjectID}/modeltemplate/${$ModelTemplatesSearchResults[index].ID}`)
	}

	async function handleSearchDirectory() {
		$Loading = true
		$LoadingMessage = 'Searching model templates...'
		showFilter = false
		try {
			let url = new URL(`${PUBLIC_API_URL}/directory`)
			if ($DirectorySearchCurrentQuery.length > 1) {
				url.searchParams.append('sq', $DirectorySearchCurrentQuery)
			}
			if ($DirectorySearchCreatedOnGreaterThan != '') {
				url.searchParams.append('cogt', $DirectorySearchCreatedOnGreaterThan)
			}
			if ($DirectorySearchCreatedOnLessThan != '') {
				url.searchParams.append('colt', $DirectorySearchCreatedOnLessThan)
			}
			if ($DirectorySearchLastUpdatedOnGreaterThan != '') {
				url.searchParams.append('lugt', $DirectorySearchLastUpdatedOnGreaterThan)
			}
			if ($DirectorySearchLastUpdatedOnLessThan != '') {
				url.searchParams.append('lult', $DirectorySearchLastUpdatedOnLessThan)
			}
			url.searchParams.append('l', `${$DirectorySearchLimit}`)
			url.searchParams.append('o', `${$DirectorySearchOffset}`)
			url.searchParams.append('sb', $DirectorySearchSortBy)
			url.searchParams.append('sbo', $DirectorySearchSortByOrder)
			const fetchResponse = await fetch(url, {
				credentials: 'include'
			})
			const data = await fetchResponse.json()
			if (fetchResponse.ok) {
				$DirectorySearchResults = data !== null ? data : []
				$ToastType = Shared.ToastType.SUCCESS
				$ToastMessage = `${data !== null ? data.length : 0} results found`
			} else {
				$ToastType = Shared.ToastType.ERROR
				$ToastMessage = data.message
			}
		} catch (e) {
			Log(Shared.LogLevel.ERROR, CURRENT_SECTION, e)
			$ToastType = Shared.ToastType.ERROR
			$ToastMessage = FETCH_ERROR
		}
		$Loading = false
		$LoadingMessage = null
	}

	let showFilter = false
	const setShowFilter = (value: boolean) => (showFilter = value)

	let CreatedFilterOptions: any = {}
	function HandleUpdateCreatedFilterOptions(value: any) {
		CreatedFilterOptions = value
		if (Object.keys(CreatedFilterOptions).length < 1) {
			FilterModelTemplate = JSON.stringify(mtDirectory)
		}
		Log(Shared.LogLevel.DEBUG, CURRENT_SECTION, CreatedFilterOptions, 'Updated Filter options')
	}

	function resetFilter() {
		$DirectorySearchCurrentQuery = ''
		$DirectorySearchCreatedOnGreaterThan = ''
		$DirectorySearchCreatedOnLessThan = ''
		$DirectorySearchLastUpdatedOnGreaterThan = ''
		$DirectorySearchLastUpdatedOnLessThan = ''
		$DirectorySearchLimit = 1000
		$DirectorySearchOffset = 0
		$DirectorySearchSortBy = 'last_updated_on'
		$DirectorySearchSortByOrder = 'desc'
	}
</script>

<div class="flex-1 flex flex-col space-y-2 overflow-hidden">
	<header class="flex-[0.5] flex space-x-2">
		<section class="flex-[9] flex flex-col justify-center">
			<div class="form-control w-[90%]">
				<span class="join">
					<input class="join-item flex-[9.5] input input-secondary w-full shadow-sm shadow-gray-600" type="search" placeholder="Search directory..." bind:value={$DirectorySearchCurrentQuery} />
					<button class="join-item flex-[0.5] btn btn-regular btn-secondary" on:click={() => (showFilter = !showFilter)}>
						<Icon type="mdi:filter" />
					</button>
					<button class="join-item flex-[0.5] btn btn-regular btn-secondary" on:click={handleSearchDirectory}>
						<span class="w-fit h-fit self-center bg-transparent"><Icon type="mdi:search" /></span>
					</button>
				</span>
			</div>
			<div class="relative">
				{#if showFilter}
					<div class="absolute top-0 left-0 bg-white rounded-md p-1 w-[90%] shadow-md shadow-gray-800 mt-1 flex flex-col space-y-1 justify-center z-[100] max-h-[70vh] overflow-auto">
						<section class="form-control">
							<label class="label">
								<span class="label-text text-lg font-bold">Search in current project?</span>
								<!-- <input type="checkbox" class="checkbox checkbox-primary" bind:checked={$ModelTemplatesSearchUseCurrentProject} /> -->
							</label>
						</section>
						<section class="flex flex-col space-y-1">
							<div class="text-md">Date range for when users were created...</div>
							<div class="join w-full">
								<DateTime bind:Value={$DirectorySearchCreatedOnGreaterThan} Placeholder="From..." classInputType="input-secondary flex-1 join-item" DateTimeFormat="yyyy-mm-dd" />
								<DateTime bind:Value={$DirectorySearchCreatedOnLessThan} Placeholder="To..." classInputType="input-secondary flex-1 join-item" DateTimeFormat="yyyy-mm-dd" />
							</div>
							<div class="divider" />
							<div class="text-md">Date range for when users were last updated...</div>
							<div class="join w-full">
								<DateTime bind:Value={$DirectorySearchLastUpdatedOnGreaterThan} Placeholder="From..." classInputType="input-secondary flex-1 join-item" DateTimeFormat="yyyy-mm-dd" />
								<DateTime bind:Value={$DirectorySearchLastUpdatedOnLessThan} Placeholder="To..." classInputType="input-secondary flex-1 join-item" DateTimeFormat="yyyy-mm-dd" />
							</div>
						</section>
						<section class="flex flex-col space-y-1">
							<span class="join join-vertical">
								<span class="join-item join-label-primary join-label-content">Maximum no. of results</span>
								<input class="join-item input input-primary w-full" type="number" placeholder="Enter maximum no. of results to show..." value={$DirectorySearchLimit} on:input={(e) => handleInputSearchResultsLimit(e.currentTarget.value)} />
							</span>
							<span class="join join-vertical">
								<span class="join-item join-label-primary join-label-content">No. of results to skip</span>
								<input class="join-item input input-primary w-full" type="number" placeholder="Enter no. of results to skip..." value={$DirectorySearchOffset} on:input={(e) => handleInputSearchResultsOffset(e.currentTarget.value)} />
							</span>
						</section>
						<section class="flex flex-col space-y-1">
							<span class="join join-vertical">
								<span class="join-item join-label-primary join-label-content">Sort by</span>
								<div class="join-item join join-horizontal w-full">
									<select class="join-item select select-primary flex-1" bind:value={$DirectorySearchSortBy}>
										<option selected={$DirectorySearchSortBy === ''} value="" disabled>Sorty By...</option>
										<option selected={$DirectorySearchSortBy === 'created_on'} value="created_on">Created on</option>
										<option selected={$DirectorySearchSortBy === 'last_updated_on'} value="last_updated_on">Last updated on</option>
									</select>
									<select class="join-item select select-primary flex-1" bind:value={$DirectorySearchSortByOrder}>
										<option selected={$DirectorySearchSortByOrder === ''} value="" disabled>Sorty By Order...</option>
										<option selected={$DirectorySearchSortByOrder === 'asc'} value="asc">Least recent first</option>
										<option selected={$DirectorySearchSortByOrder === 'desc'} value="desc">Most recent first</option>
									</select>
								</div>
							</span>
						</section>
						<button class="btn btn-secondary self-center w-full max-w-[350px] h-fit" on:click={resetFilter}>reset</button>
					</div>
				{/if}
			</div>
		</section>
		<section class="flex-1 flex justify-end">
			<div class="tooltip tooltip-left" data-tip="Create new user">
				<button class="flex btn btn-circle btn-secondary justify-center">
					<span class="w-fit h-fit self-center"><Icon type="mdi:plus" /></span>
				</button>
			</div>
		</section>
	</header>
	<main class="flex-[9.5] flex flex-col overflow-hidden space-y-1">
		{#if $DirectorySearchResults.length > 0}
			<div class="divider" />
			<Table
				Data={JSON.parse(JSON.stringify($DirectorySearchResults))}
				{HandleClickTableRow}
				{FilterModelTemplate}
				DataName="Users"
				{CreatedFilterOptions}
				{HandleUpdateCreatedFilterOptions}
				{HandleUpdateFilterModelTemplate}
				IncludeIndividualDataRowCounter={true}
				IncludeIndividualRowNumber={true}
			/>
			<div class="divider" />
		{:else}
			<div class="w-full h-full bg-gray-200 flex justify-center">
				<span class="text-2xl w-fit h-fit self-center flex">
					<span class="text-center text-primary">Create and manage users from the administrators perspective...</span>
				</span>
			</div>
		{/if}
	</main>
	<footer class="flex-[0.5] flex justify-between">
		<img src="{base}/icipe_logo.png" alt="icipe logo" class="max-w-[10vw] max-h-[5vh] self-center" />
		<img src="{base}/university_of_oxford_logo.png" alt="university of oxford logo" class="max-w-[10vw] max-h-[5vh] self-center" />
		<img src="{base}/vector_atlas_logo.png" alt="vector atlas logo" class="max-w-[10vw] max-h-[10vh] self-center" />
		<img src="{base}/malaria_atlas_project_logo.png" alt="malaria atlas logo" class="max-w-[10vw] max-h-[5vh] self-center" />
		<img src="{base}/bill_and_melinda_gates_logo.png" alt="bill and melinda gates foundation logo" class="max-w-[10vw] max-h-[5vh] self-center" />
	</footer>
</div>
