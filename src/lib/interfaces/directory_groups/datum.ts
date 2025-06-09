import { Domain, Interfaces, Json, MetadataModel } from '$lib'

export async function Datum(
	authFetch: Domain.Interfaces.AuthenticatedFetch,
	fetchedData?: Domain.Entities.MetadataModel.IDatum,
	telemetry?: Domain.Interfaces.ITelemetry,
	directoryGroupID?: string
): Promise<Domain.Interfaces.DirectoryGroups.Datum> {
	let d: Domain.Interfaces.DirectoryGroups.Datum = {
		displayName: '',
		displayNameValid() {
			return typeof this.displayName == 'string' && this.displayName.length > 3
		},
		updateName(value) {
			if (typeof value == 'string') {
				if (value.length > 3) {
					this.displayName = value
					if (this.displayNameError) {
						this.displayNameError = undefined
					}
				} else {
					this.displayNameError = ['Value must be at least 3 characters in length']
				}
			} else {
				this.displayName = ''
				this.displayNameError = ['Value is not valid text']
			}
		},

		description: '',
		descriptionValid() {
			return typeof this.description == 'string' && this.description.length > 3
		},
		updateDescription(value) {
			if (typeof value == 'string' && value.length > 0) {
				if (value.length > 3) {
					this.description = value
					if (this.descriptionError) {
						this.descriptionError = undefined
					}
				} else {
					this.descriptionError = ['Value must be at least 3 characters in length']
				}
			} else {
				this.description = ''
				this.descriptionError = ['Value is not valid text']
			}
		},

		data: {},

		reset() {
			this.displayName = ''
			this.displayNameError = undefined
			this.description = ''
			this.descriptionError = undefined
			this.data = {}
		},

		async create(
			authFetch: Domain.Interfaces.AuthenticatedFetch,
			directoryGroupID: string,
			opts?: {
				componentName?: string
				telemetry?: Domain.Interfaces.ITelemetry
				authContextDirectoryGroupID?: string
				verboseResponse?: boolean
			}
		) {
			let sectionName = opts?.componentName || `${Domain.Entities.Url.Action.CREATE}  ${Domain.Entities.DirectoryGroups.RepositoryName}`

			let data: Domain.Entities.DirectoryGroups.Interface = {}

			if (!this.displayNameValid) {
				throw undefined
			}

			if (this.displayNameValid()) {
				data.display_name = [this.displayName]
			} else {
				throw [[400, { message: `${Domain.Entities.DirectoryGroups.FieldColumn.DisplayName} is not valid` }], undefined]
			}

			if (!this.descriptionValid) {
				throw undefined
			}

			if (this.descriptionValid()) {
				data.description = [this.description]
			} else {
				throw [[400, { message: `${Domain.Entities.DirectoryGroups.FieldColumn.Description} is not valid` }], undefined]
			}

			data.data = [this.data]

			try {
				const fetchUrl = new URL(`${Domain.Entities.Url.ApiUrlPaths.Directory.Groups}/${Domain.Entities.Url.Action.CREATE}`)
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
					Domain.Entities.Url.Action.CREATE,
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

					if (this.reset) {
						this.reset()
					}
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
				const ERROR = `${Domain.Entities.Url.Action.CREATE} ${Domain.Entities.DirectoryGroups.RepositoryName} failed`
				opts?.telemetry?.Log(sectionName, true, Domain.Entities.Telemetry.LogLevel.ERROR, ERROR, 'error', e)
				if (Array.isArray(e)) {
					throw e
				} else {
					throw [e, ERROR]
				}
			}
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
			let sectionName = opts?.componentName || `${Domain.Entities.Url.Action.UPDATE} ${Domain.Entities.DirectoryGroups.RepositoryName}`

			if (!this.id || !this.previousDatum) {
				throw undefined
			}

			let data: Domain.Entities.DirectoryGroups.Interface = {}

			if (this.displayNameValid && this.displayNameValid()) {
				if (!Json.AreValuesEqual([this.displayName], (this.previousDatum as Domain.Entities.DirectoryGroups.Interface).display_name)) {
					data.display_name = [this.displayName]
				}
			}

			if (this.descriptionValid && this.descriptionValid()) {
				if (!Json.AreValuesEqual([this.description], (this.previousDatum as Domain.Entities.DirectoryGroups.Interface).description)) {
					data.description = [this.description]
				}
			}

			if (!Json.AreValuesEqual([this.data], (this.previousDatum as Domain.Entities.DirectoryGroups.Interface).data)) {
				data.data = [this.data]
			}

			if (Object.keys(data).length === 0) {
				return {
					Type: Domain.Entities.Toast.Type.INFO,
					Message: 'No changes detected'
				}
			}

			data.id = [this.id]

			try {
				const fetchUrl = new URL(`${Domain.Entities.Url.ApiUrlPaths.Directory.Groups}/${Domain.Entities.Url.Action.UPDATE}`)
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
						if (!Json.AreValuesEqual([this.displayName], (this.previousDatum as Domain.Entities.DirectoryGroups.Interface).display_name)) {
							;(this.previousDatum as Domain.Entities.DirectoryGroups.Interface).display_name = [this.displayName]
						}

						if (!Json.AreValuesEqual([this.description], (this.previousDatum as Domain.Entities.DirectoryGroups.Interface).description)) {
							;(this.previousDatum as Domain.Entities.DirectoryGroups.Interface).description = [this.description]
						}

						if (!Json.AreValuesEqual([this.data], (this.previousDatum as Domain.Entities.DirectoryGroups.Interface).data)) {
							;(this.previousDatum as Domain.Entities.DirectoryGroups.Interface).data = [this.data]
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
				const ERROR = `${Domain.Entities.Url.Action.UPDATE} ${Domain.Entities.DirectoryGroups.RepositoryName} failed`
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
			let sectionName = opts?.componentName || `${Domain.Entities.Url.Action.DELETE} ${Domain.Entities.DirectoryGroups.RepositoryName}`

			if (!this.id) {
				throw undefined
			}

			let data: Domain.Entities.DirectoryGroups.Interface = {
				id: [this.id]
			}
			try {
				const fetchUrl = new URL(`${Domain.Entities.Url.ApiUrlPaths.Directory.Groups}/${Domain.Entities.Url.Action.DELETE}`)
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
				const ERROR = `${Domain.Entities.Url.Action.DELETE} ${Domain.Entities.DirectoryGroups.RepositoryName} failed`
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

		value = MetadataModel.DatabaseGetColumnFieldValue(metadataModel, Domain.Entities.DirectoryGroups.FieldColumn.ID, tableCollectionUID, datum)
		if (Array.isArray(value) && value.length > 0) {
			d.id = value[0]
			try {
				d.dataMetadataModel = await new Interfaces.MetadataModels.FieldAnyGetMetadataModel(telemetry, authFetch).GetMetadataModel(
					Domain.Entities.MetadataModelsDirectoryGroups.RepositoryName,
					metadataModel[MetadataModel.FgProperties.FIELD_GROUP_KEY],
					metadataModel[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_UID],
					[d.id]
				)
			} catch (e) {
				telemetry?.Log(
					`Init ${Domain.Entities.DirectoryGroups.RepositoryName} Datum`,
					true,
					Domain.Entities.Telemetry.LogLevel.ERROR,
					'Error fetching data metadata-model',
					'error',
					e
				)
			}
		}

		value = MetadataModel.DatabaseGetColumnFieldValue(
			metadataModel,
			Domain.Entities.DirectoryGroups.FieldColumn.DisplayName,
			tableCollectionUID,
			datum
		)
		if (Array.isArray(value) && value.length > 0) {
			d.displayName = value[0]
		}

		value = MetadataModel.DatabaseGetColumnFieldValue(
			metadataModel,
			Domain.Entities.DirectoryGroups.FieldColumn.Description,
			tableCollectionUID,
			datum
		)
		if (Array.isArray(value) && value.length > 0) {
			d.description = value[0]
		}

		value = MetadataModel.DatabaseGetColumnFieldValue(metadataModel, Domain.Entities.DirectoryGroups.FieldColumn.Data, tableCollectionUID, datum)
		if (Array.isArray(value) && value.length > 0) {
			d.data = structuredClone(value[0])
		}
	} else {
		if (directoryGroupID) {
			try {
				d.dataMetadataModel = await new Interfaces.MetadataModels.FieldAnyGetMetadataModel(telemetry, authFetch).GetMetadataModel(
					Domain.Entities.MetadataModelsDirectoryGroups.RepositoryName,
					fetchedData?.metadata_model[MetadataModel.FgProperties.FIELD_GROUP_KEY] || '$',
					fetchedData?.metadata_model[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_UID] || Domain.Entities.DirectoryGroups.RepositoryName,
					[directoryGroupID]
				)
			} catch (e) {
				telemetry?.Log(
					`Init ${Domain.Entities.DirectoryGroups.RepositoryName} Datum`,
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
