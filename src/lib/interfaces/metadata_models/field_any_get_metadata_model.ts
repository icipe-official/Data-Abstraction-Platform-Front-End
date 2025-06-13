import { Domain } from '$lib'

export class FieldAnyGetMetadataModel implements Domain.Interfaces.MetadataModels.IFieldAnyGetMetadataModel {
	private telemetry?: Domain.Interfaces.ITelemetry
	private fetch: Domain.Interfaces.Fetch = fetch

	constructor(
		telemetry?: Domain.Interfaces.ITelemetry,
		customfetch?: Domain.Interfaces.Fetch
	) {
		this.telemetry = telemetry
		if (customfetch) {
			this.fetch = customfetch
		}
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
					fetchResponse = await this.fetch(fetchUrl, { credentials: 'include' })
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
					fetchResponse = await this.fetch(fetchUrl, { credentials: 'include' })
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
}
