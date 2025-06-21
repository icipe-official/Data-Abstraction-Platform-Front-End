import { Interfaces, Domain, MetadataModel, Utils, Json } from '$lib'

interface ExportData {
	metadatamodelquerycondition: MetadataModel.QueryConditions
	updatedatametadatamodel: (value?: Domain.Entities.MetadataModels.Interface) => void
	dataqckey?: Utils.MetadataModel.FieldGroupQueryProperties | undefined
}

export function NewExportData(): Domain.Interfaces.MetadataModels.ExportData & ExportData {
	let d: Domain.Interfaces.MetadataModels.ExportData & ExportData = {
		exportdatafilevalid() {
			return typeof this.exportdatafile !== 'undefined' && Array.isArray(this.exportdatafile.id) && this.exportdatafile.id.length > 0
		},

		exportdatavalid() {
			return (
				this.search &&
				this.search.metadata_model &&
				Object.keys(this.search.metadata_model).length > 0 &&
				this.metadatamodelquerycondition &&
				Object.keys(this.metadatamodelquerycondition).length > 0
			)
		},

		async exportdata() {
			if (!this.exportdatavalid() || !this.authcontextdirectorygroupid) {
				return
			}

			if (!Array.isArray(this.search?.query_conditions)) {
				this.search!.query_conditions = []
			}

			this.search!.query_conditions = Utils.MetadataModel.InsertNewQueryConditionToQueryConditions(this.search!.query_conditions, [
				this.metadatamodelquerycondition
			])

			try {
				const fetchUrl = new URL(`${Domain.Entities.Url.ApiUrlPaths.Abstractions.Url}/${Domain.Entities.Url.Action.EXPORT}`)
				fetchUrl.searchParams.append(Domain.Entities.Url.SearchParams.DIRECTORY_GROUP_ID, this.authcontextdirectorygroupid)
				if (this.authcontextdirectorygroupid) {
					fetchUrl.searchParams.append(Domain.Entities.Url.SearchParams.AUTH_CONTEXT_DIRECTORY_GROUP_ID, this.authcontextdirectorygroupid)
				}

				this.telemetry?.Log(
					this.context!,
					true,
					Domain.Entities.Telemetry.LogLevel.DEBUG,
					Domain.Entities.Url.Action.EXPORT,
					'fetchUrl',
					fetchUrl,
					'data',
					this.search
				)

				const fetchResponse = await fetch(fetchUrl, {
					method: 'POST',
					credentials: 'include',
					body: JSON.stringify(this.search)
				})

				const fetchData = await fetchResponse.json()
				if (fetchResponse.ok) {
					this.exportdatafile = fetchData
				} else {
					const toastData = Domain.Entities.MetadataModel.GetToastFromJsonVerboseResponse(fetchData)
					throw toastData.message
				}
			} catch (e) {
				const ERROR = `${Domain.Entities.Url.Action.EXPORT} ${Domain.Entities.Abstractions.RepositoryName} failed`
				this.telemetry?.Log(this.context!, true, Domain.Entities.Telemetry.LogLevel.ERROR, ERROR, 'error', e)
				if (Array.isArray(e)) {
					throw e
				} else {
					throw [e, ERROR]
				}
			}
		},

		updatedatametadatamodel(value) {
			if (
				!value ||
				!Array.isArray(value.id) ||
				value.id.length === 0 ||
				!Array.isArray(value.data) ||
				value.data.length == 0 ||
				!this.search ||
				!this.search.metadata_model
			) {
				if (Object.keys(this.metadatamodelquerycondition).length > 0 && this.search && this.search.metadata_model && this.dataqckey) {
					this.metadatamodelquerycondition = {}

					this.search.metadata_model = Json.SetValueInObject(
						this.search.metadata_model,
						(this.dataqckey.fieldGroup[MetadataModel.FgProperties.FIELD_GROUP_KEY] as string).replaceAll(
							MetadataModel.ARRAY_INDEX_PLACEHOLDER,
							'[0]'
						),
						this.dataqckey.fieldGroup
					)
				}
				return
			}

			const metadataModelQCKey = Utils.MetadataModel.GetFieldQueryPropertiesByDatabaseProperties(
				this.search?.metadata_model,
				Domain.Entities.AbstractionsDirectoryGroups.FieldColumn.MetadataModelsID,
				Domain.Entities.AbstractionsDirectoryGroups.RepositoryName,
				1
			)

			if (!metadataModelQCKey) {
				return
			}

			if (!this.dataqckey) {
				return
			}

			this.metadatamodelquerycondition = {
				[metadataModelQCKey.qcKey]: {
					[MetadataModel.QcProperties.D_TABLE_COLLECTION_UID]:
						metadataModelQCKey.fieldGroup[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_UID],
					[MetadataModel.QcProperties.D_FIELD_COLUMN_NAME]: metadataModelQCKey.fieldGroup[MetadataModel.FgProperties.DATABASE_FIELD_COLUMN_NAME],
					[MetadataModel.QcProperties.FG_FILTER_CONDITION]: [
						[
							{
								[MetadataModel.FConditionProperties.NEGATE]: false,
								[MetadataModel.FConditionProperties.CONDITION]: MetadataModel.FilterCondition.EQUAL_TO,
								[MetadataModel.FConditionProperties.VALUE]: {
									[MetadataModel.FSelectProperties.TYPE]: MetadataModel.FieldType.TEXT,
									[MetadataModel.FSelectProperties.VALUE]: value.id[0]
								}
							}
						]
					]
				}
			}

			const dataModel = JSON.parse(JSON.stringify(value.data[0]))
			dataModel[MetadataModel.FgProperties.FIELD_GROUP_KEY] = this.dataqckey.fieldGroup[MetadataModel.FgProperties.FIELD_GROUP_KEY]
			dataModel[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_UID] =
				this.dataqckey.fieldGroup[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_UID]
			dataModel[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_NAME] =
				this.dataqckey.fieldGroup[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_NAME]
			dataModel[MetadataModel.FgProperties.DATABASE_FIELD_COLUMN_NAME] =
				this.dataqckey.fieldGroup[MetadataModel.FgProperties.DATABASE_FIELD_COLUMN_NAME]
			dataModel[MetadataModel.FgProperties.DATABASE_JOIN_DEPTH] = this.dataqckey.fieldGroup[MetadataModel.FgProperties.DATABASE_JOIN_DEPTH]
			dataModel[MetadataModel.FgProperties.GROUP_EXTRACT_AS_SINGLE_FIELD] = true

			this.search.metadata_model = Json.SetValueInObject(
				this.search.metadata_model,
				(this.dataqckey.fieldGroup[MetadataModel.FgProperties.FIELD_GROUP_KEY] as string).replaceAll(MetadataModel.ARRAY_INDEX_PLACEHOLDER, '[0]'),
				MetadataModel.MapFieldGroups(dataModel, (property) => {
					property[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_UID] =
						this.dataqckey!.fieldGroup[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_UID]
					property[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_NAME] =
						this.dataqckey!.fieldGroup[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_NAME]
					property[MetadataModel.FgProperties.DATABASE_FIELD_COLUMN_NAME] =
						this.dataqckey!.fieldGroup[MetadataModel.FgProperties.DATABASE_FIELD_COLUMN_NAME]
					if (typeof property[MetadataModel.FgProperties.FIELD_GROUP_KEY] === 'string') {
						property[MetadataModel.FgProperties.FIELD_GROUP_KEY] = (property[MetadataModel.FgProperties.FIELD_GROUP_KEY] as string).replace(
							'$',
							dataModel[MetadataModel.FgProperties.FIELD_GROUP_KEY]
						)
					}

					return property
				})
			)
		},

		metadatamodelquerycondition: {},

		context: `Export ${Domain.Entities.Abstractions.RepositoryName}`,

		search: {
			metadata_model: {},
			query_conditions: []
		},

		async initsearch() {
			if (!this.search) {
				return
			}

			if (Object.keys(this.search.metadata_model).length > 0) {
				return
			}

			const search = new Interfaces.MetadataModels.SearchData(
				`${Domain.Entities.Url.ApiUrlPaths.Abstractions.Url}${Domain.Entities.Url.MetadataModelSearchGetMMPath}`,
				`${Domain.Entities.Url.ApiUrlPaths.Abstractions.Url}${Domain.Entities.Url.MetadataModelSearchPath}`
			)

			try {
				await search.FetchMetadataModel(this.authcontextdirectorygroupid, 1, undefined)
			} catch (e) {
				const DEFAULT_ERROR = `Get ${Domain.Entities.Abstractions.RepositoryName} metadata-model failed`

				this.telemetry?.Log(this.context!, true, Domain.Entities.Telemetry.LogLevel.ERROR, DEFAULT_ERROR, 'error', e)

				if (Array.isArray(e) && e.length === 2) {
					throw e
				} else {
					throw [500, DEFAULT_ERROR]
				}
			}

			this.search.metadata_model = JSON.parse(JSON.stringify(search.searchmetadatamodel))

			this.dataqckey = Utils.MetadataModel.GetFieldQueryPropertiesByDatabaseProperties(
				this.search?.metadata_model,
				Domain.Entities.Abstractions.FieldColumn.Data,
				Domain.Entities.Abstractions.RepositoryName,
				0
			)
		}
	}

	return d
}
