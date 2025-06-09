import { Domain } from '$lib'

export class FieldAnyGetMetadataModel implements Domain.Interfaces.MetadataModels.IFieldAnyGetMetadataModel {
	private telemetry?: Domain.Interfaces.ITelemetry
	private authenticatedFetch?: Domain.Interfaces.AuthenticatedFetch

	constructor(telemetry?: Domain.Interfaces.ITelemetry, authenticatedFetch?: Domain.Interfaces.AuthenticatedFetch) {
		this.telemetry = telemetry
		this.authenticatedFetch = authenticatedFetch
	}

	async GetMetadataModel(actionID: string, currentFgKey: string, tableCollectionUid: string, argument: any) {
		this.telemetry?.Log(
			FieldAnyGetMetadataModel.name,
			true,
			Domain.Entities.Telemetry.LogLevel.DEBUG,
			'Received Get Metadata Model Request',
			'actionID',
			actionID,
			'tableCollectionUid',
			tableCollectionUid,
			'argument',
			JSON.stringify(argument)
		)

		try {
			let fetchUrl
			let fetchResponse
			let fetchData
			switch (actionID) {
				case Domain.Entities.MetadataModelsDirectoryGroups.RepositoryName:
				case Domain.Entities.MetadataModelsDirectory.RepositoryName:
					if (!Array.isArray(argument) || argument.length != 1) {
						return undefined
					}
					fetchUrl = new URL(Domain.Entities.Url.ApiUrlPaths.MetadataModel)
					fetchUrl.pathname = fetchUrl.pathname + `/${actionID}/${argument[0]}`
					fetchResponse = await this.fetch(fetchUrl)
					fetchData = await fetchResponse.json()
					if (fetchResponse.ok) {
						if (typeof fetchData !== 'object') {
							return undefined
						}
						return fetchData
					} else {
						throw [fetchResponse.status, fetchData]
					}
				case Domain.Entities.AbstractionsDirectoryGroups.RepositoryName:
					if (!Array.isArray(argument) || argument.length != 1) {
						return undefined
					}
					fetchUrl = new URL(Domain.Entities.Url.ApiUrlPaths.Abstractions.Url)
					fetchUrl.pathname = fetchUrl.pathname + `/metadata-model/${argument[0]}`
					fetchResponse = await this.fetch(fetchUrl)
					fetchData = await fetchResponse.json()
					if (fetchResponse.ok) {
						if (typeof fetchData !== 'object') {
							return undefined
						}
						return fetchData
					} else {
						throw [fetchResponse.status, fetchData]
					}
				default:
					return undefined
			}
		} catch (e) {
			console.error(e)
			return undefined
		}
	}

	private async fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
		if (this.authenticatedFetch) {
			return this.authenticatedFetch.Fetch(input, init)
		}

		return fetch(input, init)
	}
}
