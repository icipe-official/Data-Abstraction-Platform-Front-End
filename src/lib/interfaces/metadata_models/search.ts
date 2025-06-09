import { Domain, MetadataModel, State } from '$lib'

export class SearchData implements Domain.Interfaces.MetadataModels.Search {
	private _searchMetadatamodelUrl: string
	private _searchUrl: string
	searchmetadatamodel: any = {}
	searchresults: Domain.Entities.MetadataModel.ISearchResults = {}
	private authenticatedFetch?: Domain.Interfaces.AuthenticatedFetch

	constructor(searchMetadatamodelUrl: string, searchUrl: string, authenticatedFetch?: Domain.Interfaces.AuthenticatedFetch) {
		this._searchMetadatamodelUrl = searchMetadatamodelUrl
		this._searchUrl = searchUrl
		this.authenticatedFetch = authenticatedFetch
	}

	UpdateMetadatamodel(value: any) {
		this.searchmetadatamodel = structuredClone(value)
	}

	/**
	 *
	 * @param authContextDirectoryGroupID
	 * @param targetJoinDepth
	 * @param signal
	 *
	 *
	 * throws error.
	 */
	async FetchMetadataModel(
		authContextDirectoryGroupID: string | undefined = undefined,
		targetJoinDepth: number | undefined = undefined,
		signal: AbortSignal | null | undefined,
		customFetch?: {
			(input: RequestInfo | URL, init?: RequestInit): Promise<Response>
			(input: string | URL | globalThis.Request, init?: RequestInit): Promise<Response>
		}
	) {
		let goFetch = fetch
		if (customFetch) {
			goFetch = customFetch
		}
		let fetchUrl = new URL(this._searchMetadatamodelUrl)
		if (typeof authContextDirectoryGroupID === 'string' && authContextDirectoryGroupID.length > 0) {
			fetchUrl.searchParams.append(Domain.Entities.MetadataModel.SearchParams.AUTH_CONTEXT_DIRECTORY_GROUP_ID, authContextDirectoryGroupID)
		}
		if (typeof targetJoinDepth === 'number') {
			fetchUrl.searchParams.append(Domain.Entities.MetadataModel.SearchParams.TARGET_JOIN_DEPTH, `${targetJoinDepth}`)
		}
		const fetchResponse = await this.fetch(fetchUrl)
		const fetchData = await fetchResponse.json()
		if (fetchResponse.ok) {
			this.searchmetadatamodel = structuredClone(fetchData)
		} else {
			throw [fetchResponse.status, fetchResponse.statusText]
		}
	}

	private async fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
		if (this.authenticatedFetch) {
			return this.authenticatedFetch.Fetch(input, init)
		}
		
		return fetch(input, init)
	}

	/**
	 *
	 * @param queryConditions
	 * @param authContextDirectoryGroupID
	 * @param targetJoinDepth
	 * @param signal
	 *
	 *
	 * throws error
	 */
	async Search(
		queryConditions: MetadataModel.QueryConditions[] | undefined,
		authContextDirectoryGroupID: string | undefined,
		startSearchContextDirectoryGroupID: string | undefined,
		targetJoinDepth: number | undefined,
		skipIfFgDisabled: boolean | undefined,
		skipIfDataExtraction: boolean | undefined,
		signal: AbortSignal | null | undefined,
		customFetch?: {
			(input: RequestInfo | URL, init?: RequestInit): Promise<Response>
			(input: string | URL | globalThis.Request, init?: RequestInit): Promise<Response>
		}
	) {
		let goFetch = fetch
		if (customFetch) {
			goFetch = customFetch
		}
		let metadataModelSearch: Domain.Entities.MetadataModel.ISearch = {}
		if (this.searchmetadatamodel && Object.keys(this.searchmetadatamodel).length > 0) {
			metadataModelSearch.metadata_model = this.searchmetadatamodel
		}
		if (Array.isArray(queryConditions) && queryConditions.length > 0) {
			metadataModelSearch.query_conditions = queryConditions
		}

		let fetchUrl = new URL(this._searchUrl)
		if (typeof authContextDirectoryGroupID === 'string' && authContextDirectoryGroupID.length > 0) {
			fetchUrl.searchParams.append(Domain.Entities.MetadataModel.SearchParams.AUTH_CONTEXT_DIRECTORY_GROUP_ID, authContextDirectoryGroupID)
		}
		if (typeof startSearchContextDirectoryGroupID === 'string' && startSearchContextDirectoryGroupID.length > 0) {
			fetchUrl.searchParams.append(Domain.Entities.MetadataModel.SearchParams.START_SEARCH_DIRECTORY_GROUP_ID, startSearchContextDirectoryGroupID)
		}
		if (typeof skipIfFgDisabled === 'boolean') {
			fetchUrl.searchParams.append(Domain.Entities.MetadataModel.SearchParams.SKIP_IF_FG_DISABLED, `${skipIfFgDisabled}`)
		}
		if (typeof skipIfDataExtraction === 'boolean') {
			fetchUrl.searchParams.append(Domain.Entities.MetadataModel.SearchParams.SKIP_IF_DATA_EXTRACTION, `${skipIfDataExtraction}`)
		}
		if (typeof targetJoinDepth === 'number') {
			fetchUrl.searchParams.append(Domain.Entities.MetadataModel.SearchParams.TARGET_JOIN_DEPTH, `${targetJoinDepth}`)
		}

		const fetchResponse = await this.fetch(fetchUrl, {
			method: 'POST',
			body: JSON.stringify(metadataModelSearch),
			signal
		})

		const fetchData = await fetchResponse.json()
		if (fetchResponse.ok) {
			this.searchresults = structuredClone(fetchData)
			if (!Array.isArray(this.searchresults.data)) {
				this.searchresults.data = []
			}
			if (this.searchresults.metadata_model) {
				this.searchmetadatamodel = this.searchresults.metadata_model
			}
		} else {
			throw [fetchResponse.status, fetchData]
		}
	}
}
