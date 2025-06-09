import { Domain, Interfaces, Json, MetadataModel, Utils } from '$lib'

export async function Datum(
	authFetch: Domain.Interfaces.AuthenticatedFetch,
	fetchedData?: Domain.Entities.MetadataModel.IDatum,
	telemetry?: Domain.Interfaces.ITelemetry,
	directoryGroupID?: string
): Promise<Domain.Interfaces.Abstractions.Datum> {
	let d: Domain.Interfaces.Abstractions.Datum = {
		completed: false,

		tags: [],
		updateTags(index, value) {
			if (typeof value === 'string') {
				if (value.length > 0) {
					if (index > this.tags.length - 1) {
						for (let i = this.tags.length; i <= index; i++) {
							this.tags.push('')
						}
					}
					this.tags[index] = value
				} else {
					this.deleteTags(index)
				}
			} else {
				this.deleteTags(index)
			}
		},
		deleteTags(index) {
			if (index < this.tags.length) {
				this.tags = this.tags.filter((_, tIndex) => tIndex !== index)
			}
		},

		data: {},

		reset() {
			this.completed = false
			this.tags = []
			this.data = {}
		},

		async update(
			authFetch: Domain.Interfaces.AuthenticatedFetch,
			directoryGroupID: string,
			opts?: {
				componentName?: string
				telemetry?: Domain.Interfaces.ITelemetry
				authContextDirectoryGroupID?: string
				verboseResponse?: boolean
			}
		) {
			let sectionName = opts?.componentName || `${Domain.Entities.Url.Action.UPDATE} ${Domain.Entities.Abstractions.RepositoryName}`

			if (!this.id || !this.previousDatum) {
				throw undefined
			}

			let data: Domain.Entities.Abstractions.Interface = {}

			if (!Json.AreValuesEqual([this.data], (this.previousDatum as Domain.Entities.Abstractions.Interface).data)) {
				data.data = [this.data]
			}

			if (!Json.AreValuesEqual([this.completed], (this.previousDatum as Domain.Entities.Abstractions.Interface).completed)) {
				data.completed = [this.completed]
			}

			if (!Json.AreValuesEqual(this.tags, (this.previousDatum as Domain.Entities.Abstractions.Interface).tags)) {
				data.tags = this.tags
			}

			if (Object.keys(data).length === 0) {
				return {
					Type: Domain.Entities.Toast.Type.INFO,
					Message: 'No changes detected'
				}
			}

			data.id = [this.id]

			try {
				const fetchUrl = new URL(`${Domain.Entities.Url.ApiUrlPaths.Abstractions.Url}/${Domain.Entities.Url.Action.UPDATE}`)
				fetchUrl.searchParams.append(Domain.Entities.Url.SearchParams.DIRECTORY_GROUP_ID, directoryGroupID)
				if (opts?.authContextDirectoryGroupID) {
					fetchUrl.searchParams.append(Domain.Entities.Url.SearchParams.AUTH_CONTEXT_DIRECTORY_GROUP_ID, opts.authContextDirectoryGroupID)
				}
				if (opts?.verboseResponse) {
					fetchUrl.searchParams.append(Domain.Entities.Url.SearchParams.VERBOSE_RESPONSE, `${true}`)
				}

				opts?.telemetry?.Log(
					sectionName,
					true,
					Domain.Entities.Telemetry.LogLevel.DEBUG,
					Domain.Entities.Url.Action.UPDATE,
					'fetchUrl',
					fetchUrl,
					'data',
					data
				)

				const fetchResponse = await authFetch.Fetch(fetchUrl, {
					method: 'POST',
					body: JSON.stringify([data])
				})

				const fetchData = await fetchResponse.json()
				if (fetchResponse.ok) {
					if (fetchData.successful && fetchData.successful > 0 && !fetchData.failed) {
						if (!Json.AreValuesEqual([this.completed], (this.previousDatum as Domain.Entities.Abstractions.Interface).completed)) {
							;(this.previousDatum as Domain.Entities.Abstractions.Interface).completed = [this.completed]
						}

						if (!Json.AreValuesEqual([this.data], (this.previousDatum as Domain.Entities.Abstractions.Interface).data)) {
							;(this.previousDatum as Domain.Entities.Abstractions.Interface).data = [this.data]
						}

						if (!Json.AreValuesEqual(this.tags, (this.previousDatum as Domain.Entities.Abstractions.Interface).tags)) {
							;(this.previousDatum as Domain.Entities.MetadataModels.Interface).tags = this.tags
						}
					}

					const toastData = Domain.Entities.MetadataModel.GetToastFromJsonVerboseResponse(fetchData)

					return {
						Type: !fetchData.failed
							? Domain.Entities.Toast.Type.SUCCESS
							: fetchData.successful && fetchData.successful > 0
								? Domain.Entities.Toast.Type.INFO
								: Domain.Entities.Toast.Type.ERROR,
						Message: toastData.message,
						MedataModelSearchResults: toastData.metadatamodel_search_results
					}
				} else {
					const toastData = Domain.Entities.MetadataModel.GetToastFromJsonVerboseResponse(fetchData)
					return {
						Type: Domain.Entities.Toast.Type.ERROR,
						Message: toastData.message,
						MedataModelSearchResults: toastData.metadatamodel_search_results
					}
				}
			} catch (e) {
				const ERROR = `${Domain.Entities.Url.Action.UPDATE} ${Domain.Entities.Abstractions.RepositoryName} failed`
				opts?.telemetry?.Log(sectionName, true, Domain.Entities.Telemetry.LogLevel.ERROR, ERROR, 'error', e)
				if (Array.isArray(e)) {
					throw e
				} else {
					throw [e, ERROR]
				}
			}
		},

		async delete(
			authFetch: Domain.Interfaces.AuthenticatedFetch,
			directoryGroupID: string,
			opts?: {
				componentName?: string
				telemetry?: Domain.Interfaces.ITelemetry
				authContextDirectoryGroupID?: string
				verboseResponse?: boolean
			}
		) {
			let sectionName = opts?.componentName || `${Domain.Entities.Url.Action.DELETE} ${Domain.Entities.Abstractions.RepositoryName}`

			if (!this.id) {
				throw undefined
			}

			let data: Domain.Entities.Abstractions.Interface = {
				id: [this.id]
			}
			try {
				const fetchUrl = new URL(`${Domain.Entities.Url.ApiUrlPaths.Abstractions.Url}/${Domain.Entities.Url.Action.DELETE}`)
				fetchUrl.searchParams.append(Domain.Entities.Url.SearchParams.DIRECTORY_GROUP_ID, directoryGroupID)
				if (opts?.authContextDirectoryGroupID) {
					fetchUrl.searchParams.append(Domain.Entities.Url.SearchParams.AUTH_CONTEXT_DIRECTORY_GROUP_ID, opts.authContextDirectoryGroupID)
				}
				if (opts?.verboseResponse) {
					fetchUrl.searchParams.append(Domain.Entities.Url.SearchParams.VERBOSE_RESPONSE, `${true}`)
				}

				opts?.telemetry?.Log(
					sectionName,
					true,
					Domain.Entities.Telemetry.LogLevel.DEBUG,
					Domain.Entities.Url.Action.DELETE,
					'fetchUrl',
					fetchUrl,
					'data',
					data
				)

				const fetchResponse = await authFetch.Fetch(fetchUrl, {
					method: 'POST',
					body: JSON.stringify([data])
				})

				const fetchData = await fetchResponse.json()
				if (fetchResponse.ok) {
					const toastData = Domain.Entities.MetadataModel.GetToastFromJsonVerboseResponse(fetchData)

					return {
						Type: !fetchData.failed
							? Domain.Entities.Toast.Type.SUCCESS
							: fetchData.successful && fetchData.successful > 0
								? Domain.Entities.Toast.Type.INFO
								: Domain.Entities.Toast.Type.ERROR,
						Message: toastData.message,
						MedataModelSearchResults: toastData.metadatamodel_search_results
					}
				} else {
					const toastData = Domain.Entities.MetadataModel.GetToastFromJsonVerboseResponse(fetchData)
					return {
						Type: Domain.Entities.Toast.Type.ERROR,
						Message: toastData.message,
						MedataModelSearchResults: toastData.metadatamodel_search_results
					}
				}
			} catch (e) {
				const ERROR = `${Domain.Entities.Url.Action.DELETE} ${Domain.Entities.Abstractions.RepositoryName} failed`
				opts?.telemetry?.Log(sectionName, true, Domain.Entities.Telemetry.LogLevel.ERROR, ERROR, 'error', e)
				if (Array.isArray(e)) {
					throw e
				} else {
					throw [e, ERROR]
				}
			}
		}
	}

	if (fetchedData && fetchedData.metadata_model && fetchedData.datum) {
		const datum = fetchedData.datum
		const metadataModel = fetchedData.metadata_model
		const tableCollectionUID = metadataModel[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_UID]

		let value = undefined

		value = MetadataModel.DatabaseGetColumnFieldValue(metadataModel, Domain.Entities.Abstractions.FieldColumn.ID, tableCollectionUID, datum)
		if (Array.isArray(value) && value.length > 0) {
			d.id = value[0]
		}

		let storageFileQCKey = Utils.MetadataModel.GetGroupQueryPropertiesByDatabaseProperties(
			metadataModel,
			Domain.Entities.StorageFiles.RepositoryName,
			1
		)

		if (storageFileQCKey) {
			const storageFile = Json.GetValueInObject(
				fetchedData.datum,
				storageFileQCKey.qcKey.replace(new RegExp(MetadataModel.ARRAY_PATH_REGEX_SEARCH, 'g'), '[0]')
			)

			if (Array.isArray(storageFile)) {
				d.storage_file = storageFile[0]
			}
		}

		value = MetadataModel.DatabaseGetColumnFieldValue(
			metadataModel,
			Domain.Entities.Abstractions.FieldColumn.AbstractionsDirectoryGroupsID,
			tableCollectionUID,
			datum
		)
		if (Array.isArray(value) && value.length > 0) {
			try {
				d.dataMetadataModel = await new Interfaces.MetadataModels.FieldAnyGetMetadataModel(telemetry, authFetch).GetMetadataModel(
					Domain.Entities.AbstractionsDirectoryGroups.RepositoryName,
					metadataModel[MetadataModel.FgProperties.FIELD_GROUP_KEY],
					metadataModel[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_UID],
					[value]
				)
			} catch (e) {
				telemetry?.Log(
					`Init ${Domain.Entities.Abstractions.RepositoryName} Datum`,
					true,
					Domain.Entities.Telemetry.LogLevel.ERROR,
					'Error fetching data metadata-model',
					'error',
					e
				)
			}
		}

		value = MetadataModel.DatabaseGetColumnFieldValue(metadataModel, Domain.Entities.Abstractions.FieldColumn.Completed, tableCollectionUID, datum)
		if (Array.isArray(value) && value.length > 0) {
			d.completed = value[0]
		}

		value = MetadataModel.DatabaseGetColumnFieldValue(metadataModel, Domain.Entities.Abstractions.FieldColumn.Data, tableCollectionUID, datum)
		if (Array.isArray(value) && value.length > 0) {
			d.data = structuredClone(value[0])
		}

		value = MetadataModel.DatabaseGetColumnFieldValue(metadataModel, Domain.Entities.Abstractions.FieldColumn.Tags, tableCollectionUID, datum)
		if (Array.isArray(value) && value.length > 0) {
			d.tags = value
		}
	} else {
		if (directoryGroupID) {
			try {
				d.dataMetadataModel = await new Interfaces.MetadataModels.FieldAnyGetMetadataModel(telemetry, authFetch).GetMetadataModel(
					Domain.Entities.AbstractionsDirectoryGroups.RepositoryName,
					fetchedData?.metadata_model[MetadataModel.FgProperties.FIELD_GROUP_KEY] || '$',
					fetchedData?.metadata_model[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_UID] || Domain.Entities.Abstractions.RepositoryName,
					[directoryGroupID]
				)
			} catch (e) {
				telemetry?.Log(
					`Init ${Domain.Entities.Abstractions.RepositoryName} Datum`,
					true,
					Domain.Entities.Telemetry.LogLevel.ERROR,
					'Error fetching data metadata-model',
					'error',
					e
				)
			}
		}
	}

	return d
}
