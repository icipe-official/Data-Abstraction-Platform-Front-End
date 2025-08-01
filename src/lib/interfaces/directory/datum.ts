import { Domain, Interfaces, Json, MetadataModel } from '$lib'

export async function Datum(args: {
	customFetch?: Domain.Interfaces.Fetch
	fetchedData?: Domain.Entities.MetadataModel.IDatum
	telemetry?: Domain.Interfaces.ITelemetry
	directoryGroupID?: string
	currentDirectoryGroupID: string
	authContextDirectoryGroupID?: string
	verboseResponse?: boolean
	context?: string
}): Promise<Domain.Interfaces.Directory.Datum> {
	let d: Domain.Interfaces.Directory.Datum = {
		telemetry: args.telemetry,

		context: args.context ? args.context : `${Domain.Entities.Directory.RepositoryName} datum`,

		authcontextdirectorygroupid: args.authContextDirectoryGroupID,

		verboseresponse: args.verboseResponse || false,

		currentdirectorygroupid: args.currentDirectoryGroupID,

		fetch: args.customFetch ? args.customFetch : fetch,

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

		data: {},

		reset() {
			this.displayName = ''
			this.displayNameError = undefined
			this.data = {}
		},

		async create() {
			let sectionName = this.context || `${Domain.Entities.Url.Action.CREATE}  ${Domain.Entities.Directory.RepositoryName}`

			let data: Domain.Entities.Directory.Interface = {}

			if (!this.displayNameValid) {
				throw undefined
			}

			if (this.displayNameValid()) {
				data.display_name = [this.displayName]
			} else {
				throw [[400, { message: `${Domain.Entities.Directory.FieldColumn.DisplayName} is not valid` }], undefined]
			}

			data.data = [this.data]

			try {
				const fetchUrl = new URL(`${Domain.Entities.Url.ApiUrlPaths.Directory.Url}/${Domain.Entities.Url.Action.CREATE}`)
				fetchUrl.searchParams.append(Domain.Entities.Url.SearchParams.DIRECTORY_GROUP_ID, this.currentdirectorygroupid)
				if (this.authcontextdirectorygroupid) {
					fetchUrl.searchParams.append(Domain.Entities.Url.SearchParams.AUTH_CONTEXT_DIRECTORY_GROUP_ID, this.authcontextdirectorygroupid)
				}
				if (this.verboseresponse) {
					fetchUrl.searchParams.append(Domain.Entities.Url.SearchParams.VERBOSE_RESPONSE, `${true}`)
				}

				this.telemetry?.Log(
					sectionName,
					true,
					Domain.Entities.Telemetry.LogLevel.DEBUG,
					Domain.Entities.Url.Action.CREATE,
					'fetchUrl',
					fetchUrl,
					'data',
					data
				)

				const fetchResponse = await this.fetch(fetchUrl, {
					method: 'POST',
					credentials: 'include',
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
				const ERROR = `${Domain.Entities.Url.Action.CREATE} ${Domain.Entities.Directory.RepositoryName} failed`
				this.telemetry?.Log(sectionName, true, Domain.Entities.Telemetry.LogLevel.ERROR, ERROR, 'error', e)
				if (Array.isArray(e)) {
					throw e
				} else {
					throw [e, ERROR]
				}
			}
		},

		async update() {
			let sectionName = this.context || `${Domain.Entities.Url.Action.UPDATE} ${Domain.Entities.Directory.RepositoryName}`

			if (!this.id || !this.previousDatum) {
				throw undefined
			}

			let data: Domain.Entities.Directory.Interface = {}

			if (this.displayNameValid && this.displayNameValid()) {
				if (!Json.AreValuesEqual([this.displayName], (this.previousDatum as Domain.Entities.Directory.Interface).display_name)) {
					data.display_name = [this.displayName]
				}
			}

			if (!Json.AreValuesEqual([this.data], (this.previousDatum as Domain.Entities.Directory.Interface).data)) {
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
				const fetchUrl = new URL(`${Domain.Entities.Url.ApiUrlPaths.Directory.Url}/${Domain.Entities.Url.Action.UPDATE}`)
				fetchUrl.searchParams.append(Domain.Entities.Url.SearchParams.DIRECTORY_GROUP_ID, this.currentdirectorygroupid)
				if (this.authcontextdirectorygroupid) {
					fetchUrl.searchParams.append(Domain.Entities.Url.SearchParams.AUTH_CONTEXT_DIRECTORY_GROUP_ID, this.authcontextdirectorygroupid)
				}
				if (this.verboseresponse) {
					fetchUrl.searchParams.append(Domain.Entities.Url.SearchParams.VERBOSE_RESPONSE, `${true}`)
				}

				this.telemetry?.Log(
					sectionName,
					true,
					Domain.Entities.Telemetry.LogLevel.DEBUG,
					Domain.Entities.Url.Action.UPDATE,
					'fetchUrl',
					fetchUrl,
					'data',
					data
				)

				const fetchResponse = await this.fetch(fetchUrl, {
					method: 'POST',
					credentials: 'include',
					body: JSON.stringify([data])
				})

				const fetchData = await fetchResponse.json()
				if (fetchResponse.ok) {
					if (fetchData.successful && fetchData.successful > 0 && !fetchData.failed) {
						if (!Json.AreValuesEqual([this.displayName], (this.previousDatum as Domain.Entities.Directory.Interface).display_name)) {
							;(this.previousDatum as Domain.Entities.Directory.Interface).display_name = [this.displayName]
						}

						if (!Json.AreValuesEqual([this.data], (this.previousDatum as Domain.Entities.Directory.Interface).data)) {
							;(this.previousDatum as Domain.Entities.Directory.Interface).data = [this.data]
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
				const ERROR = `${Domain.Entities.Url.Action.UPDATE} ${Domain.Entities.Directory.RepositoryName} failed`
				this.telemetry?.Log(sectionName, true, Domain.Entities.Telemetry.LogLevel.ERROR, ERROR, 'error', e)
				if (Array.isArray(e)) {
					throw e
				} else {
					throw [e, ERROR]
				}
			}
		},

		async delete() {
			let sectionName = this.context || `${Domain.Entities.Url.Action.DELETE} ${Domain.Entities.Directory.RepositoryName}`

			if (!this.id) {
				throw undefined
			}

			let data: Domain.Entities.Directory.Interface = {
				id: [this.id]
			}
			try {
				const fetchUrl = new URL(`${Domain.Entities.Url.ApiUrlPaths.Directory.Url}/${Domain.Entities.Url.Action.DELETE}`)
				fetchUrl.searchParams.append(Domain.Entities.Url.SearchParams.DIRECTORY_GROUP_ID, this.currentdirectorygroupid)
				if (this.authcontextdirectorygroupid) {
					fetchUrl.searchParams.append(Domain.Entities.Url.SearchParams.AUTH_CONTEXT_DIRECTORY_GROUP_ID, this.authcontextdirectorygroupid)
				}
				if (this.verboseresponse) {
					fetchUrl.searchParams.append(Domain.Entities.Url.SearchParams.VERBOSE_RESPONSE, `${true}`)
				}

				this.telemetry?.Log(
					sectionName,
					true,
					Domain.Entities.Telemetry.LogLevel.DEBUG,
					Domain.Entities.Url.Action.DELETE,
					'fetchUrl',
					fetchUrl,
					'data',
					data
				)

				const fetchResponse = await this.fetch(fetchUrl, {
					method: 'POST',
					credentials: 'include',
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
				const ERROR = `${Domain.Entities.Url.Action.DELETE} ${Domain.Entities.Directory.RepositoryName} failed`
				this.telemetry?.Log(sectionName, true, Domain.Entities.Telemetry.LogLevel.ERROR, ERROR, 'error', e)
				if (Array.isArray(e)) {
					throw e
				} else {
					throw [e, ERROR]
				}
			}
		}
	}

	if (args.fetchedData && args.fetchedData.metadata_model && args.fetchedData.datum) {
		const datum = args.fetchedData.datum
		const metadataModel = args.fetchedData.metadata_model
		const tableCollectionUID = metadataModel[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_UID]

		let value = undefined

		value = MetadataModel.DatabaseGetColumnFieldValue(metadataModel, Domain.Entities.Directory.FieldColumn.ID, tableCollectionUID, datum)
		if (Array.isArray(value) && value.length > 0) {
			d.id = value[0]
		}

		value = MetadataModel.DatabaseGetColumnFieldValue(
			metadataModel,
			Domain.Entities.Directory.FieldColumn.DirectoryGroupsID,
			tableCollectionUID,
			datum
		)
		if (Array.isArray(value) && value.length > 0) {
			try {
				d.dataMetadataModel = await new Interfaces.MetadataModels.FieldAnyGetMetadataModel(args.telemetry, args.customFetch).GetMetadataModel(
					Domain.Entities.MetadataModelsDirectory.RepositoryName,
					metadataModel[MetadataModel.FgProperties.FIELD_GROUP_KEY],
					metadataModel[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_UID],
					[value]
				)
			} catch (e) {
				args.telemetry?.Log(
					`Init ${Domain.Entities.Directory.RepositoryName} Datum`,
					true,
					Domain.Entities.Telemetry.LogLevel.ERROR,
					'Error fetching data metadata-model',
					'error',
					e
				)
			}
		}

		value = MetadataModel.DatabaseGetColumnFieldValue(metadataModel, Domain.Entities.Directory.FieldColumn.DisplayName, tableCollectionUID, datum)
		if (Array.isArray(value) && value.length > 0) {
			d.displayName = value[0]
		}

		value = MetadataModel.DatabaseGetColumnFieldValue(metadataModel, Domain.Entities.Directory.FieldColumn.Data, tableCollectionUID, datum)
		if (Array.isArray(value) && value.length > 0) {
			d.data = structuredClone(value[0])
		}
	} else {
		if (args.directoryGroupID) {
			try {
				d.dataMetadataModel = await new Interfaces.MetadataModels.FieldAnyGetMetadataModel(args.telemetry, args.customFetch).GetMetadataModel(
					Domain.Entities.MetadataModelsDirectory.RepositoryName,
					args.fetchedData?.metadata_model[MetadataModel.FgProperties.FIELD_GROUP_KEY] || '$',
					args.fetchedData?.metadata_model[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_UID] || Domain.Entities.Directory.RepositoryName,
					[args.directoryGroupID]
				)
			} catch (e) {
				args.telemetry?.Log(
					`Init ${Domain.Entities.Directory.RepositoryName} Datum`,
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
