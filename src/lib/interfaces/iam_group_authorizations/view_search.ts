import { State, Utils, Domain, MetadataModel, Interfaces } from '$lib'

export interface AdditionalProperties {
	directorygroupsid?: string
	directorygroupsquerycondition?: MetadataModel.QueryConditions
	directoryid?: string
	directoryquerycondition?: MetadataModel.QueryConditions
	additionalqueryconditions?: MetadataModel.QueryConditions[]
	addadditionalqueryconditions?: ((ctx: Domain.Interfaces.MetadataModels.ViewSearch & AdditionalProperties) => MetadataModel.QueryConditions)[]
	viewContextIamCredentials?: boolean
}

export function NewViewSearch(): Domain.Interfaces.MetadataModels.ViewSearch & AdditionalProperties {
	let d: Domain.Interfaces.MetadataModels.ViewSearch & AdditionalProperties = {
		search: new Interfaces.MetadataModels.SearchData(
			`${Domain.Entities.Url.ApiUrlPaths.Iam.GroupAuthorizations}${Domain.Entities.Url.MetadataModelSearchGetMMPath}`,
			`${Domain.Entities.Url.ApiUrlPaths.Iam.GroupAuthorizations}${Domain.Entities.Url.MetadataModelSearchPath}`
		),
		context: 'View Search',
		queryconditions: [],
		quicksearchquerycondition: {},
		directorygroupsquerycondition: {},
		directoryquerycondition: {},
		searchmetadatamodel: {},
		searchresults: [],
		filterexcludeindexes: [],
		showquerypanel: false,
		selectedindexes: [],
		additionalqueryconditions: [],
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

			State.Loading.value = `Searching ${Domain.Entities.IamGroupAuthorizations.RepositoryName}...`
			try {				
				await this.search.Search(
					Utils.MetadataModel.InsertNewQueryConditionToQueryConditions(this.queryconditions!, [
						this.quicksearchquerycondition!,
						this.directorygroupsquerycondition!,
						this.directoryquerycondition!,
						...this.additionalqueryconditions!
					]),
					this.authcontextdirectorygroupid || undefined,
					this.authcontextdirectorygroupid || undefined,
					2,
					false,
					false,
					undefined
				)

				this.filterexcludeindexes = []
				this.searchresults = this.search.searchresults.data || []

				State.Toast.Type = Domain.Entities.Toast.Type.INFO
				State.Toast.Message = `${this.searchresults.length} results returned`
			} catch (e) {
				const ERROR = `Search ${Domain.Entities.IamGroupAuthorizations.RepositoryName} failed`
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
					await this.search.FetchMetadataModel(this.authcontextdirectorygroupid, 2, undefined)
				} catch (e) {
					const DEFAULT_ERROR = `Get ${Domain.Entities.IamGroupAuthorizations.RepositoryName} metadata-model failed`

					this.telemetry?.Log(this.context!, true, Domain.Entities.Telemetry.LogLevel.ERROR, DEFAULT_ERROR, 'error', e)

					if (Array.isArray(e) && e.length === 2) {
						throw e
					} else {
						throw [500, DEFAULT_ERROR]
					}
				}
			}

			this.search.searchmetadatamodel = MetadataModel.MapFieldGroups(this.search.searchmetadatamodel, (property: any) => {
				if (this.viewContextIamCredentials) {
					if (
						property[MetadataModel.FgProperties.DATABASE_JOIN_DEPTH] === 0 &&
						property[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_NAME] === Domain.Entities.IamGroupAuthorizations.RepositoryName
					) {
						if (
							property[MetadataModel.FgProperties.DATABASE_FIELD_COLUMN_NAME] === Domain.Entities.IamGroupAuthorizations.FieldColumn.IamCredentialsID
						) {
							property[MetadataModel.FgProperties.DATABASE_DISTINCT] = true
						}
					}
				} else {
					if (
						property[MetadataModel.FgProperties.DATABASE_JOIN_DEPTH] === 0 &&
						property[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_NAME] === Domain.Entities.IamGroupAuthorizations.RepositoryName &&
						property[MetadataModel.FgProperties.DATABASE_FIELD_COLUMN_NAME] === Domain.Entities.IamGroupAuthorizations.FieldColumn.CreatedOn
					) {
						property[MetadataModel.FgProperties.DATABASE_SORT_BY_ASC] = false
					}
				}

				return property
			})

			this.search.searchmetadatamodel[MetadataModel.FgProperties.DATABASE_LIMIT] = 50

			this.searchmetadatamodel = this.search.searchmetadatamodel

			if (typeof this.directorygroupsid === 'string' && this.directorygroupsid.length > 0) {
				const directoryGroupIDQCKey = Utils.MetadataModel.GetFieldQueryPropertiesByDatabaseProperties(
					this.searchmetadatamodel,
					Domain.Entities.DirectoryGroups.FieldColumn.ID,
					Domain.Entities.DirectoryGroups.RepositoryName,
					2
				)

				if (!directoryGroupIDQCKey) {
					throw [500, `directoryGroupIDQCKey not valid`]
				}

				this.directorygroupsquerycondition = {
					[directoryGroupIDQCKey.qcKey]: {
						[MetadataModel.QcProperties.D_TABLE_COLLECTION_UID]:
							directoryGroupIDQCKey.fieldGroup[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_UID],
						[MetadataModel.QcProperties.D_FIELD_COLUMN_NAME]: directoryGroupIDQCKey.fieldGroup[MetadataModel.FgProperties.DATABASE_FIELD_COLUMN_NAME],
						[MetadataModel.QcProperties.FG_FILTER_CONDITION]: [
							[
								{
									[MetadataModel.FConditionProperties.NEGATE]: false,
									[MetadataModel.FConditionProperties.CONDITION]: MetadataModel.FilterCondition.EQUAL_TO,
									[MetadataModel.FConditionProperties.VALUE]: {
										[MetadataModel.FSelectProperties.TYPE]: MetadataModel.FieldType.TEXT,
										[MetadataModel.FSelectProperties.VALUE]: this.directorygroupsid
									}
								}
							]
						]
					}
				}
			}

			if (typeof this.directoryid === 'string' && this.directoryid.length > 0) {
				const directoryIDQCKey = Utils.MetadataModel.GetFieldQueryPropertiesByDatabaseProperties(
					this.searchmetadatamodel,
					Domain.Entities.Directory.FieldColumn.ID,
					Domain.Entities.Directory.RepositoryName,
					1
				)

				if (!directoryIDQCKey) {
					throw [500, `directoryIDQCKey not valid`]
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

			if (Array.isArray(this.addadditionalqueryconditions)) {
				for (let aaqc of this.addadditionalqueryconditions) {
					const q = aaqc(this)
					if (typeof q === 'object' && Object.keys(q).length > 0) {
						this.additionalqueryconditions?.push(q)
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
