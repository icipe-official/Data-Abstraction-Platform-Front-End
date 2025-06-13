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
}): Domain.Interfaces.AbstractionsDirectoryGroups.Datum {
	let d: Domain.Interfaces.AbstractionsDirectoryGroups.Datum = {
		context: args.context ? args.context : `${Domain.Entities.AbstractionsDirectoryGroups.RepositoryName} datum`,

		authcontextdirectorygroupid: args.authContextDirectoryGroupID,

		verboseresponse: args.verboseResponse || false,

		currentdirectorygroupid: args.currentDirectoryGroupID,

		fetch: args.customFetch ? args.customFetch : fetch,

		abstractionReviewQuorum: 0,
		abstractionReviewQuorumValid() {
			return typeof this.abstractionReviewQuorum == 'number'
		},
		updateAbstractionReviewQuorum(value) {
			if (!Number.isNaN(value)) {
				this.abstractionReviewQuorum = Number(value)
				if (this.abstractionReviewQuorumError) {
					this.abstractionReviewQuorumError = undefined
				}
			} else {
				this.abstractionReviewQuorumError = ['Value is not valid number']
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

		viewAuthorized: true,

		viewUnauthorized: false,

		reset() {
			this.abstractionReviewQuorum = 0
			this.abstractionReviewQuorumError = undefined
			this.description = ''
			this.descriptionError = undefined
			this.viewAuthorized = true
			this.viewUnauthorized = false
		},

		async create() {
			let sectionName = this.context || `${Domain.Entities.Url.Action.CREATE}  ${Domain.Entities.AbstractionsDirectoryGroups.RepositoryName}`

			let data: Domain.Entities.AbstractionsDirectoryGroups.Interface = {}

			if (!this.abstractionReviewQuorumValid) {
				throw undefined
			}

			if (this.abstractionReviewQuorumValid()) {
				data.abstraction_review_quorum = [this.abstractionReviewQuorum]
			} else {
				throw [[400, { message: `${Domain.Entities.AbstractionsDirectoryGroups.FieldColumn.AbstractionReviewQuorum} is not valid` }], undefined]
			}

			if (!this.descriptionValid) {
				throw undefined
			}

			if (this.descriptionValid()) {
				data.description = [this.description]
			} else {
				throw [[400, { message: `${Domain.Entities.AbstractionsDirectoryGroups.FieldColumn.Description} is not valid` }], undefined]
			}

			if (this.directory_group_id) {
				data.directory_groups_id = [this.directory_group_id]
			} else {
				throw [[400, { message: `${Domain.Entities.AbstractionsDirectoryGroups.FieldColumn.DirectoryGroupsID} is not valid` }], undefined]
			}

			if (this.metadata_models_id) {
				data.metadata_models_id = [this.metadata_models_id]
			} else {
				throw [[400, { message: `${Domain.Entities.AbstractionsDirectoryGroups.FieldColumn.MetadataModelsID} is not valid` }], undefined]
			}

			data.view_authorized = [this.viewAuthorized]
			data.view_unauthorized = [this.viewUnauthorized]

			try {
				const fetchUrl = new URL(`${Domain.Entities.Url.ApiUrlPaths.Abstractions.DirectoryGroups}/${Domain.Entities.Url.Action.CREATE}`)
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
				const ERROR = `${Domain.Entities.Url.Action.CREATE} ${Domain.Entities.AbstractionsDirectoryGroups.RepositoryName} failed`
				this.telemetry?.Log(sectionName, true, Domain.Entities.Telemetry.LogLevel.ERROR, ERROR, 'error', e)
				if (Array.isArray(e)) {
					throw e
				} else {
					throw [e, ERROR]
				}
			}
		},

		async update() {
			let sectionName = this.context || `${Domain.Entities.Url.Action.UPDATE} ${Domain.Entities.AbstractionsDirectoryGroups.RepositoryName}`

			if (!this.directory_group_id || !this.previousDatum) {
				throw undefined
			}

			let data: Domain.Entities.AbstractionsDirectoryGroups.Interface = {}

			if (
				this.metadata_models_id &&
				!Json.AreValuesEqual(
					[this.metadata_models_id],
					(this.previousDatum as Domain.Entities.AbstractionsDirectoryGroups.Interface).metadata_models_id
				)
			) {
				data.metadata_models_id = [this.metadata_models_id]
			}

			if (this.abstractionReviewQuorumValid && this.abstractionReviewQuorumValid()) {
				if (
					!Json.AreValuesEqual(
						[this.abstractionReviewQuorum],
						(this.previousDatum as Domain.Entities.AbstractionsDirectoryGroups.Interface).abstraction_review_quorum
					)
				) {
					data.abstraction_review_quorum = [this.abstractionReviewQuorum]
				}
			}

			if (this.descriptionValid && this.descriptionValid()) {
				if (!Json.AreValuesEqual([this.description], (this.previousDatum as Domain.Entities.AbstractionsDirectoryGroups.Interface).description)) {
					data.description = [this.description]
				}
			}

			if (
				!Json.AreValuesEqual([this.viewAuthorized], (this.previousDatum as Domain.Entities.AbstractionsDirectoryGroups.Interface).view_authorized)
			) {
				data.view_authorized = [this.viewAuthorized]
			}

			if (
				!Json.AreValuesEqual([this.viewUnauthorized], (this.previousDatum as Domain.Entities.AbstractionsDirectoryGroups.Interface).view_unauthorized)
			) {
				data.view_unauthorized = [this.viewUnauthorized]
			}

			if (Object.keys(data).length === 0) {
				return {
					Type: Domain.Entities.Toast.Type.INFO,
					Message: 'No changes detected'
				}
			}

			data.directory_groups_id = [this.directory_group_id]

			try {
				const fetchUrl = new URL(`${Domain.Entities.Url.ApiUrlPaths.Abstractions.DirectoryGroups}/${Domain.Entities.Url.Action.UPDATE}`)
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
						if (
							this.metadata_models_id &&
							!Json.AreValuesEqual(
								[this.metadata_models_id],
								(this.previousDatum as Domain.Entities.AbstractionsDirectoryGroups.Interface).metadata_models_id
							)
						) {
							;(this.previousDatum as Domain.Entities.AbstractionsDirectoryGroups.Interface).metadata_models_id = [this.metadata_models_id]
						}

						if (
							!Json.AreValuesEqual(
								[this.abstractionReviewQuorum],
								(this.previousDatum as Domain.Entities.AbstractionsDirectoryGroups.Interface).abstraction_review_quorum
							)
						) {
							;(this.previousDatum as Domain.Entities.AbstractionsDirectoryGroups.Interface).abstraction_review_quorum = [
								this.abstractionReviewQuorum
							]
						}

						if (!Json.AreValuesEqual([this.description], (this.previousDatum as Domain.Entities.AbstractionsDirectoryGroups.Interface).description)) {
							;(this.previousDatum as Domain.Entities.AbstractionsDirectoryGroups.Interface).description = [this.description]
						}

						if (
							!Json.AreValuesEqual(
								[this.viewAuthorized],
								(this.previousDatum as Domain.Entities.AbstractionsDirectoryGroups.Interface).view_authorized
							)
						) {
							;(this.previousDatum as Domain.Entities.AbstractionsDirectoryGroups.Interface).view_authorized = [this.viewAuthorized]
						}

						if (
							!Json.AreValuesEqual(
								[this.viewUnauthorized],
								(this.previousDatum as Domain.Entities.AbstractionsDirectoryGroups.Interface).view_unauthorized
							)
						) {
							;(this.previousDatum as Domain.Entities.AbstractionsDirectoryGroups.Interface).view_unauthorized = [this.viewUnauthorized]
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
				const ERROR = `${Domain.Entities.Url.Action.UPDATE} ${Domain.Entities.AbstractionsDirectoryGroups.RepositoryName} failed`
				this.telemetry?.Log(sectionName, true, Domain.Entities.Telemetry.LogLevel.ERROR, ERROR, 'error', e)
				if (Array.isArray(e)) {
					throw e
				} else {
					throw [e, ERROR]
				}
			}
		},

		async delete() {
			let sectionName = this.context || `${Domain.Entities.Url.Action.DELETE} ${Domain.Entities.AbstractionsDirectoryGroups.RepositoryName}`

			if (!this.directory_group_id) {
				throw undefined
			}

			let data: Domain.Entities.AbstractionsDirectoryGroups.Interface = {
				directory_groups_id: [this.directory_group_id]
			}
			try {
				const fetchUrl = new URL(`${Domain.Entities.Url.ApiUrlPaths.Abstractions.DirectoryGroups}/${Domain.Entities.Url.Action.DELETE}`)
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
				const ERROR = `${Domain.Entities.Url.Action.DELETE} ${Domain.Entities.AbstractionsDirectoryGroups.RepositoryName} failed`
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

		value = MetadataModel.DatabaseGetColumnFieldValue(
			metadataModel,
			Domain.Entities.AbstractionsDirectoryGroups.FieldColumn.DirectoryGroupsID,
			tableCollectionUID,
			datum
		)
		if (Array.isArray(value) && value.length > 0) {
			d.directory_group_id = value[0]
		}

		value = MetadataModel.DatabaseGetColumnFieldValue(
			metadataModel,
			Domain.Entities.AbstractionsDirectoryGroups.FieldColumn.MetadataModelsID,
			tableCollectionUID,
			datum
		)
		if (Array.isArray(value) && value.length > 0) {
			d.metadata_models_id = value[0]
		}

		value = MetadataModel.DatabaseGetColumnFieldValue(
			metadataModel,
			Domain.Entities.AbstractionsDirectoryGroups.FieldColumn.Description,
			tableCollectionUID,
			datum
		)
		if (Array.isArray(value) && value.length > 0) {
			d.description = value[0]
		}

		value = MetadataModel.DatabaseGetColumnFieldValue(
			metadataModel,
			Domain.Entities.AbstractionsDirectoryGroups.FieldColumn.AbstractionReviewQuorum,
			tableCollectionUID,
			datum
		)
		if (Array.isArray(value) && value.length > 0) {
			d.abstractionReviewQuorum = value[0]
		}

		value = MetadataModel.DatabaseGetColumnFieldValue(
			metadataModel,
			Domain.Entities.AbstractionsDirectoryGroups.FieldColumn.ViewAuthorized,
			tableCollectionUID,
			datum
		)
		if (Array.isArray(value) && value.length > 0) {
			d.viewAuthorized = value[0]
		}

		value = MetadataModel.DatabaseGetColumnFieldValue(
			metadataModel,
			Domain.Entities.AbstractionsDirectoryGroups.FieldColumn.ViewUnauthorized,
			tableCollectionUID,
			datum
		)
		if (Array.isArray(value) && value.length > 0) {
			d.viewUnauthorized = value[0]
		}
	}

	return d
}
