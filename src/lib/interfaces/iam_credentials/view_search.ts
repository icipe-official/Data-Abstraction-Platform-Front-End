import { State, Utils, Domain, MetadataModel, Interfaces } from '$lib'

export interface AdditionalProperties {
	directoryid?: string
	directoryquerycondition?: MetadataModel.QueryConditions
}

export function NewViewSearch(directoryGroupID?: string): Domain.Interfaces.MetadataModels.ViewSearch & AdditionalProperties {
	let d: Domain.Interfaces.MetadataModels.ViewSearch & AdditionalProperties = {
		search: new Interfaces.MetadataModels.SearchData(
			`${Domain.Entities.Url.ApiUrlPaths.Iam.Credentials}${Domain.Entities.Url.MetadataModelSearchGetMMPath}`,
			`${Domain.Entities.Url.ApiUrlPaths.Iam.Credentials}${Domain.Entities.Url.MetadataModelSearchPath}`
		),
		context: 'View Search',
		queryconditions: [],
		quicksearchquerycondition: {},
		directoryquerycondition: {},
		directoryid: directoryGroupID,
		searchmetadatamodel: {},
		searchresults: [],
		filterexcludeindexes: [],
		showquerypanel: false,
		selectedindexes: [],
		view: 'list',
		updatemedataModel(value) {
			this.searchmetadatamodel = value
			if (this.search) {
				this.search.searchmetadatamodel = this.searchmetadatamodel
			}
		},
		async searchdata() {
			if (!this.search) {
				return
			}

			State.Loading.value = `Searching ${Domain.Entities.IamCredentials.RepositoryName}...`
			try {
				await this.search.Search(
					Utils.MetadataModel.InsertNewQueryConditionToQueryConditions(this.queryconditions!, [
						this.quicksearchquerycondition!,
						this.directoryquerycondition!
					]),
					this.authcontextdirectorygroupid || undefined,
					this.authcontextdirectorygroupid || undefined,
					1,
					false,
					false,
					undefined
				)

				this.filterexcludeindexes = []
				this.searchresults = this.search.searchresults.data || []

				State.Toast.Type = Domain.Entities.Toast.Type.INFO
				State.Toast.Message = `${this.searchresults.length} results returned`
			} catch (e) {
				const ERROR = `Search ${Domain.Entities.IamCredentials.RepositoryName} failed`
				this.telemetry?.Log(this.context!, true, Domain.Entities.Telemetry.LogLevel.ERROR, ERROR, 'error', e)

				State.Toast.Type = Domain.Entities.Toast.Type.ERROR
				State.Toast.Message = [ERROR]
				if (Array.isArray(e) && e.length === 2) {
					State.Toast.Message.push(`${e[0]}->${e[1].message}`)
					throw e
				} else {
					State.Toast.Message.push(`${500}->${Utils.DEFAULT_FETCH_ERROR}`)
					throw [500, ERROR]
				}
			} finally {
				State.Loading.value = undefined
			}
		},
		getdisplaydataexecuted: false,
		async getdisplaydata() {
			if (!this.search) {
				throw [401, 'Unauthorized']
			}

			if (this.getdisplaydataexecuted) {
				return
			}

			if (Object.keys(this.search.searchmetadatamodel).length === 0) {
				try {
					await this.search.FetchMetadataModel(this.authcontextdirectorygroupid, 1, undefined)
				} catch (e) {
					const DEFAULT_ERROR = `Get ${Domain.Entities.IamCredentials.RepositoryName} metadata-model failed`

					this.telemetry?.Log(this.context!, true, Domain.Entities.Telemetry.LogLevel.ERROR, DEFAULT_ERROR, 'error', e)

					if (Array.isArray(e) && e.length === 2) {
						throw e
					} else {
						throw [500, DEFAULT_ERROR]
					}
				}
			}

			this.search.searchmetadatamodel = MetadataModel.MapFieldGroups(this.search.searchmetadatamodel, (property: any) => {
				if (
					property[MetadataModel.FgProperties.DATABASE_JOIN_DEPTH] === 0 &&
					property[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_NAME] === Domain.Entities.IamCredentials.RepositoryName &&
					property[MetadataModel.FgProperties.DATABASE_FIELD_COLUMN_NAME] === Domain.Entities.IamCredentials.FieldColumn.CreatedOn
				) {
					property[MetadataModel.FgProperties.DATABASE_SORT_BY_ASC] = false
				}

				return property
			})

			this.search.searchmetadatamodel[MetadataModel.FgProperties.DATABASE_LIMIT] = 50

			this.searchmetadatamodel = this.search.searchmetadatamodel

			if (typeof this.directoryid === 'string' && this.directoryid.length > 0) {
				const directoryIDQCKey = Utils.MetadataModel.GetFieldQueryPropertiesByDatabaseProperties(
					this.searchmetadatamodel,
					Domain.Entities.IamCredentials.FieldColumn.DirectoryID,
					this.searchmetadatamodel[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_NAME],
					this.searchmetadatamodel[MetadataModel.FgProperties.DATABASE_JOIN_DEPTH]
				)

				if (!directoryIDQCKey) {
					throw [500, `directoryGroupIDQCKey not valid`]
				}

				this.directoryquerycondition = {
					[directoryIDQCKey.qcKey]: {
						[MetadataModel.QcProperties.D_TABLE_COLLECTION_UID]:
							directoryIDQCKey.fieldGroup[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_UID],
						[MetadataModel.QcProperties.D_FIELD_COLUMN_NAME]: directoryIDQCKey.fieldGroup[MetadataModel.FgProperties.DATABASE_FIELD_COLUMN_NAME],
						[MetadataModel.QcProperties.FG_FILTER_CONDITION]: [
							[
								{
									[MetadataModel.FConditionProperties.NEGATE]: false,
									[MetadataModel.FConditionProperties.CONDITION]: MetadataModel.FilterCondition.EQUAL_TO,
									[MetadataModel.FConditionProperties.VALUE]: {
										[MetadataModel.FSelectProperties.TYPE]: MetadataModel.FieldType.TEXT,
										[MetadataModel.FSelectProperties.VALUE]: this.directoryid
									}
								}
							]
						]
					}
				}
			}
			try {
				await this.searchdata!()
				this.getdisplaydataexecuted = true
			} catch (e) {
				throw e
			}
		}
	}

	return d
}
