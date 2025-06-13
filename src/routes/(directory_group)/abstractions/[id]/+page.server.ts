import { Domain, Interfaces, MetadataModel, Utils } from '$lib'
import { error } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'

interface data {
	directory_group_id?: string
	current_datum?: Domain.Entities.MetadataModel.IDatum
	theme?: Domain.Entities.Theme.Theme
	
}

export const load: PageServerLoad = async ({ locals, fetch, params, url }) => {
	let data: data = {}

	if (locals.Theme) {
		data.theme = locals.Theme
	}

	

	if (url.searchParams.get(Domain.Entities.Url.SearchParams.DIRECTORY_GROUP_ID)) {
		data.directory_group_id = url.searchParams.get(Domain.Entities.Url.SearchParams.DIRECTORY_GROUP_ID)!
	}

	let abstractionSearch: Domain.Interfaces.MetadataModels.Search

	if (params.id && params.id.length >= 27) {
		const authContextDirectoryGroupID =
			url.searchParams.get(Domain.Entities.Url.SearchParams.AUTH_CONTEXT_DIRECTORY_GROUP_ID) || data.directory_group_id
		try {
			abstractionSearch = new Interfaces.MetadataModels.SearchData(
				`${Domain.Entities.Url.ApiUrlPaths.Abstractions.Url}${Domain.Entities.Url.MetadataModelSearchGetMMPath}`,
				`${Domain.Entities.Url.ApiUrlPaths.Abstractions.Url}${Domain.Entities.Url.MetadataModelSearchPath}`,
				fetch
			)

			await abstractionSearch.FetchMetadataModel(authContextDirectoryGroupID || undefined, 1, undefined)
		} catch (e) {
			if (Array.isArray(e) && e.length === 2) {
				error(e[0], e[1])
			} else {
				console.error(e)
				error(500, `Get ${Domain.Entities.Abstractions.RepositoryName} metadata-model failed`)
			}
		}

		const abstractionIDQP = Utils.MetadataModel.GetFieldQueryPropertiesByDatabaseProperties(
			abstractionSearch.searchmetadatamodel,
			Domain.Entities.Abstractions.FieldColumn.ID,
			abstractionSearch.searchmetadatamodel[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_NAME],
			abstractionSearch.searchmetadatamodel[MetadataModel.FgProperties.DATABASE_JOIN_DEPTH]
		)

		if (abstractionIDQP) {
			let queryCondition: MetadataModel.QueryConditions[] = [
				{
					[abstractionIDQP.qcKey]: {
						[MetadataModel.QcProperties.D_TABLE_COLLECTION_UID]:
							abstractionSearch.searchmetadatamodel[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_UID],
						[MetadataModel.QcProperties.D_FIELD_COLUMN_NAME]: Domain.Entities.Abstractions.FieldColumn.ID,
						[MetadataModel.QcProperties.FG_FILTER_CONDITION]: [
							[
								{
									[MetadataModel.FConditionProperties.NEGATE]: false,
									[MetadataModel.FConditionProperties.CONDITION]: MetadataModel.FilterCondition.EQUAL_TO,
									[MetadataModel.FConditionProperties.VALUE]: {
										[MetadataModel.FSelectProperties.TYPE]: MetadataModel.FieldType.TEXT,
										[MetadataModel.FSelectProperties.VALUE]: params.id
									}
								}
							]
						]
					}
				}
			]

			try {
				await abstractionSearch.Search(
					queryCondition,
					authContextDirectoryGroupID || undefined,
					authContextDirectoryGroupID || undefined,
					1,
					false,
					false,
					undefined
				)
			} catch (e) {
				if (Array.isArray(e) && e.length === 2) {
					error(e[0], e[1])
				} else {
					console.error(e)
					error(500, `Search ${Domain.Entities.Abstractions.RepositoryName} failed`)
				}
			}

			if (Array.isArray(abstractionSearch.searchresults.data) && abstractionSearch.searchresults.data.length === 1) {
				data.current_datum = {
					metadata_model: abstractionSearch.searchmetadatamodel,
					datum: abstractionSearch.searchresults.data[0]
				}

				return data
			} else {
				error(404, 'Not Found')
			}
		} else {
			error(500, `abstractionIDQCKey not valid`)
		}
	}
}
