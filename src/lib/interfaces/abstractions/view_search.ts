import { State, Utils, Domain, MetadataModel, Interfaces } from '$lib'

export function NewViewSearch(): Domain.Interfaces.MetadataModels.ViewSearch {
	let d: Domain.Interfaces.MetadataModels.ViewSearch = {
		search: new Interfaces.MetadataModels.SearchData(
			`${Domain.Entities.Url.ApiUrlPaths.Abstractions.Url}${Domain.Entities.Url.MetadataModelSearchGetMMPath}`,
			`${Domain.Entities.Url.ApiUrlPaths.Abstractions.Url}${Domain.Entities.Url.MetadataModelSearchPath}`
		),
		context: 'View Search',
		queryconditions: [],
		quicksearchquerycondition: {},
		searchmetadatamodel: {},
		searchresults: [],
		filterexcludeindexes: [],
		showquerypanel: false,
		selectedindexes: [],
		view: 'list',
		viewdatasearch: {},
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

			State.Loading.value = `Searching ${Domain.Entities.Abstractions.RepositoryName}...`

			try {
				await this.search.Search(
					Utils.MetadataModel.InsertNewQueryConditionToQueryConditions(this.queryconditions!, [
						this.quicksearchquerycondition!,
						...Utils.MetadataModel.MergeViewSearchQueryConditions(this.viewdatasearch || {})
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
				const ERROR = `Search ${Domain.Entities.Abstractions.RepositoryName} failed`
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
					const DEFAULT_ERROR = `Get ${Domain.Entities.Abstractions.RepositoryName} metadata-model failed`

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
					property[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_NAME] === Domain.Entities.Abstractions.RepositoryName &&
					property[MetadataModel.FgProperties.DATABASE_FIELD_COLUMN_NAME] === Domain.Entities.Abstractions.FieldColumn.LastUpdatedOn
				) {
					property[MetadataModel.FgProperties.DATABASE_SORT_BY_ASC] = false
				}

				return property
			})

			this.search.searchmetadatamodel[MetadataModel.FgProperties.DATABASE_LIMIT] = 50

			this.searchmetadatamodel = this.search.searchmetadatamodel
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
