import { Domain, Json, MetadataModel } from '$lib'

export function Datum(args: {
	customFetch?: Domain.Interfaces.Fetch
	fetchedData?: Domain.Entities.MetadataModel.IDatum
	telemetry?: Domain.Interfaces.ITelemetry
	directoryGroupID?: string
	currentDirectoryGroupID: string
	authContextDirectoryGroupID?: string
	verboseResponse?: boolean
	context?: string
}): Domain.Interfaces.MetadataModels.Datum {
	let d: Domain.Interfaces.MetadataModels.Datum = {
		context: args.context ? args.context : `${Domain.Entities.AbstractionsDirectoryGroups.RepositoryName} datum`,

		authcontextdirectorygroupid: args.authContextDirectoryGroupID,

		verboseresponse: args.verboseResponse || false,

		currentdirectorygroupid: args.currentDirectoryGroupID,

		fetch: args.customFetch ? args.customFetch : fetch,

		name: '',
		nameValid() {
			return typeof this.name == 'string' && this.name.length > 3
		},
		updateName(value) {
			if (typeof value == 'string') {
				if (value.length > 3) {
					this.name = value
					if (this.nameError) {
						this.nameError = undefined
					}
				} else {
					this.nameError = ['Value must be at least 3 characters in length']
				}
			} else {
				this.name = ''
				this.nameError = ['Value is not valid text']
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

		viewAuthorized: true,

		viewUnauthorized: false,

		editAuthorized: false,

		editUnauthorized: false,

		data: MetadataModel.EmptyMetadataModel(),

		reset() {
			this.name = ''
			this.nameError = undefined
			this.description = ''
			this.descriptionError = undefined
			this.data = MetadataModel.EmptyMetadataModel()
			this.tags = []
			this.editAuthorized = false
			this.editUnauthorized = false
			this.viewAuthorized = true
			this.viewUnauthorized = false
		},

		async create() {
			let sectionName = this.context || `${Domain.Entities.Url.Action.CREATE}  ${Domain.Entities.MetadataModels.RepositoryName}`

			let data: Domain.Entities.MetadataModels.Interface = {}

			if (!this.nameValid) {
				throw undefined
			}

			if (this.nameValid()) {
				data.name = [this.name]
			} else {
				throw [[400, { message: `${Domain.Entities.MetadataModels.FieldColumn.Name} is not valid` }], undefined]
			}

			if (!this.descriptionValid) {
				throw undefined
			}

			if (this.descriptionValid()) {
				data.description = [this.description]
			} else {
				throw [[400, { message: `${Domain.Entities.MetadataModels.FieldColumn.Description} is not valid` }], undefined]
			}

			data.directory_groups_id = [this.currentdirectorygroupid]
			data.data = [this.data]
			data.edit_authorized = [this.editAuthorized]
			data.edit_unauthorized = [this.editUnauthorized]
			data.view_authorized = [this.viewAuthorized]
			data.view_unauthorized = [this.viewUnauthorized]
			if (this.tags.length > 0) {
				data.tags = this.tags
			}

			try {
				const fetchUrl = new URL(`${Domain.Entities.Url.ApiUrlPaths.MetadataModels.Url}/${Domain.Entities.Url.Action.CREATE}`)
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
				const ERROR = `${Domain.Entities.Url.Action.CREATE} ${Domain.Entities.MetadataModels.RepositoryName} failed`
				this.telemetry?.Log(sectionName, true, Domain.Entities.Telemetry.LogLevel.ERROR, ERROR, 'error', e)
				if (Array.isArray(e)) {
					throw e
				} else {
					throw [e, ERROR]
				}
			}
		},

		async update() {
			let sectionName = this.context || `${Domain.Entities.Url.Action.UPDATE} ${Domain.Entities.MetadataModels.RepositoryName}`

			if (!this.id || !this.previousDatum) {
				throw undefined
			}

			let data: Domain.Entities.MetadataModels.Interface = {}

			if (this.nameValid && this.nameValid()) {
				if (!Json.AreValuesEqual([this.name], (this.previousDatum as Domain.Entities.MetadataModels.Interface).name)) {
					data.name = [this.name]
				}
			}

			if (this.descriptionValid && this.descriptionValid()) {
				if (!Json.AreValuesEqual([this.description], (this.previousDatum as Domain.Entities.MetadataModels.Interface).description)) {
					data.description = [this.description]
				}
			}

			if (!Json.AreValuesEqual([this.data], (this.previousDatum as Domain.Entities.MetadataModels.Interface).data)) {
				data.data = [this.data]
			}

			if (!Json.AreValuesEqual([this.editAuthorized], (this.previousDatum as Domain.Entities.MetadataModels.Interface).edit_authorized)) {
				data.edit_authorized = [this.editAuthorized]
			}

			if (!Json.AreValuesEqual([this.editUnauthorized], (this.previousDatum as Domain.Entities.MetadataModels.Interface).edit_unauthorized)) {
				data.edit_unauthorized = [this.editUnauthorized]
			}

			if (!Json.AreValuesEqual([this.viewAuthorized], (this.previousDatum as Domain.Entities.MetadataModels.Interface).view_authorized)) {
				data.view_authorized = [this.viewAuthorized]
			}

			if (!Json.AreValuesEqual([this.viewUnauthorized], (this.previousDatum as Domain.Entities.MetadataModels.Interface).view_unauthorized)) {
				data.view_unauthorized = [this.viewUnauthorized]
			}

			if (!Json.AreValuesEqual(this.tags, (this.previousDatum as Domain.Entities.MetadataModels.Interface).tags)) {
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
				const fetchUrl = new URL(`${Domain.Entities.Url.ApiUrlPaths.MetadataModels.Url}/${Domain.Entities.Url.Action.UPDATE}`)
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
						if (!Json.AreValuesEqual([this.name], (this.previousDatum as Domain.Entities.MetadataModels.Interface).name)) {
							;(this.previousDatum as Domain.Entities.MetadataModels.Interface).name = [this.name]
						}

						if (!Json.AreValuesEqual([this.description], (this.previousDatum as Domain.Entities.MetadataModels.Interface).description)) {
							;(this.previousDatum as Domain.Entities.MetadataModels.Interface).description = [this.description]
						}

						if (!Json.AreValuesEqual([this.data], (this.previousDatum as Domain.Entities.MetadataModels.Interface).data)) {
							;(this.previousDatum as Domain.Entities.MetadataModels.Interface).data = [this.data]
						}

						if (!Json.AreValuesEqual([this.editAuthorized], (this.previousDatum as Domain.Entities.MetadataModels.Interface).edit_authorized)) {
							;(this.previousDatum as Domain.Entities.MetadataModels.Interface).edit_authorized = [this.editAuthorized]
						}

						if (!Json.AreValuesEqual([this.editUnauthorized], (this.previousDatum as Domain.Entities.MetadataModels.Interface).edit_unauthorized)) {
							;(this.previousDatum as Domain.Entities.MetadataModels.Interface).edit_unauthorized = [this.editUnauthorized]
						}

						if (!Json.AreValuesEqual([this.viewAuthorized], (this.previousDatum as Domain.Entities.MetadataModels.Interface).view_authorized)) {
							;(this.previousDatum as Domain.Entities.MetadataModels.Interface).view_authorized = [this.viewAuthorized]
						}

						if (!Json.AreValuesEqual([this.viewUnauthorized], (this.previousDatum as Domain.Entities.MetadataModels.Interface).view_unauthorized)) {
							;(this.previousDatum as Domain.Entities.MetadataModels.Interface).view_unauthorized = [this.viewUnauthorized]
						}

						if (!Json.AreValuesEqual(this.tags, (this.previousDatum as Domain.Entities.MetadataModels.Interface).tags)) {
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
				const ERROR = `${Domain.Entities.Url.Action.UPDATE} ${Domain.Entities.MetadataModels.RepositoryName} failed`
				this.telemetry?.Log(sectionName, true, Domain.Entities.Telemetry.LogLevel.ERROR, ERROR, 'error', e)
				if (Array.isArray(e)) {
					throw e
				} else {
					throw [e, ERROR]
				}
			}
		},

		async delete() {
			let sectionName = this.context || `${Domain.Entities.Url.Action.DELETE} ${Domain.Entities.MetadataModels.RepositoryName}`

			if (!this.id) {
				throw undefined
			}

			let data: Domain.Entities.MetadataModels.Interface = {
				id: [this.id]
			}
			try {
				const fetchUrl = new URL(`${Domain.Entities.Url.ApiUrlPaths.MetadataModels.Url}/${Domain.Entities.Url.Action.DELETE}`)
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
				const ERROR = `${Domain.Entities.Url.Action.DELETE} ${Domain.Entities.MetadataModels.RepositoryName} failed`
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

		value = MetadataModel.DatabaseGetColumnFieldValue(metadataModel, Domain.Entities.MetadataModels.FieldColumn.ID, tableCollectionUID, datum)
		if (Array.isArray(value) && value.length > 0) {
			d.id = value[0]
		}

		value = MetadataModel.DatabaseGetColumnFieldValue(metadataModel, Domain.Entities.MetadataModels.FieldColumn.Name, tableCollectionUID, datum)
		if (Array.isArray(value) && value.length > 0) {
			d.name = value[0]
		}

		value = MetadataModel.DatabaseGetColumnFieldValue(
			metadataModel,
			Domain.Entities.MetadataModels.FieldColumn.Description,
			tableCollectionUID,
			datum
		)
		if (Array.isArray(value) && value.length > 0) {
			d.description = value[0]
		}

		value = MetadataModel.DatabaseGetColumnFieldValue(metadataModel, Domain.Entities.MetadataModels.FieldColumn.Tags, tableCollectionUID, datum)
		if (Array.isArray(value) && value.length > 0) {
			d.tags = value
		}

		value = MetadataModel.DatabaseGetColumnFieldValue(
			metadataModel,
			Domain.Entities.MetadataModels.FieldColumn.ViewAuthorized,
			tableCollectionUID,
			datum
		)
		if (Array.isArray(value) && value.length > 0) {
			d.viewAuthorized = value[0]
		}

		value = MetadataModel.DatabaseGetColumnFieldValue(
			metadataModel,
			Domain.Entities.MetadataModels.FieldColumn.ViewUnauthorized,
			tableCollectionUID,
			datum
		)
		if (Array.isArray(value) && value.length > 0) {
			d.viewUnauthorized = value[0]
		}

		value = MetadataModel.DatabaseGetColumnFieldValue(
			metadataModel,
			Domain.Entities.MetadataModels.FieldColumn.EditAuthorized,
			tableCollectionUID,
			datum
		)
		if (Array.isArray(value) && value.length > 0) {
			d.editAuthorized = value[0]
		}

		value = MetadataModel.DatabaseGetColumnFieldValue(
			metadataModel,
			Domain.Entities.MetadataModels.FieldColumn.EditUnauthorized,
			tableCollectionUID,
			datum
		)
		if (Array.isArray(value) && value.length > 0) {
			d.editUnauthorized = value[0]
		}

		value = MetadataModel.DatabaseGetColumnFieldValue(metadataModel, Domain.Entities.MetadataModels.FieldColumn.Data, tableCollectionUID, datum)
		if (Array.isArray(value) && value.length > 0) {
			d.data = structuredClone(value[0])
		}
	}

	return d
}
