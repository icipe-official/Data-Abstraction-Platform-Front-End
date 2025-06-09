import { Interfaces, Domain, Utils, MetadataModel } from '$lib'
import { error } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'

interface data {
	directory_group_id?: string
	current_directory_group?: Domain.Entities.MetadataModel.IDatum
	theme?: Domain.Entities.Theme.Theme
	tokens?: Domain.Entities.Iam.AccessRefreshToken
	authentication_headers?: Domain.Entities.Iam.AuthenticationHeaders
}

export const load: PageServerLoad = async ({ url, locals, fetch }) => {
	let data: data = {}

	if (locals.Theme) {
		data.theme = locals.Theme
	}

	if (locals.AuthenticationHeaders) {
		data.authentication_headers = locals.AuthenticationHeaders
	}

	if (locals.AuthenticationTokens) {
		data.tokens = locals.AuthenticationTokens
	} else {
		error(401, 'Unauthorized')
	}

	if (url.searchParams.get(Domain.Entities.Url.SearchParams.DIRECTORY_GROUP_ID)) {
		data.directory_group_id = url.searchParams.get(Domain.Entities.Url.SearchParams.DIRECTORY_GROUP_ID)!
	}

	let directoryGroupSearch: Domain.Interfaces.MetadataModels.Search

	const directoryGroupID = url.searchParams.get(Domain.Entities.Url.SearchParams.DIRECTORY_GROUP_ID)
	if (directoryGroupID && data.tokens && data.authentication_headers) {
		const authContextDirectoryGroupID = url.searchParams.get(Domain.Entities.Url.SearchParams.AUTH_CONTEXT_DIRECTORY_GROUP_ID)
		try {
			directoryGroupSearch = new Interfaces.MetadataModels.SearchData(
				`${Domain.Entities.Url.ApiUrlPaths.Directory.Groups}${Domain.Entities.Url.MetadataModelSearchGetMMPath}`,
				`${Domain.Entities.Url.ApiUrlPaths.Directory.Groups}${Domain.Entities.Url.MetadataModelSearchPath}`,
				new Interfaces.AuthenticatedFetch.Server(data.tokens, data.authentication_headers, fetch)
			)

			await directoryGroupSearch.FetchMetadataModel(authContextDirectoryGroupID || undefined, 1, undefined)
		} catch (e) {
			if (Array.isArray(e) && e.length === 2) {
				error(e[0], e[1])
			} else {
				console.error(e)
				error(500, `Get ${Domain.Entities.DirectoryGroups.RepositoryName} metadata-model failed`)
			}
		}

		const directoryGroupIDQP = Utils.MetadataModel.GetFieldQueryPropertiesByDatabaseProperties(
			directoryGroupSearch.searchmetadatamodel,
			Domain.Entities.DirectoryGroups.FieldColumn.ID,
			directoryGroupSearch.searchmetadatamodel[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_NAME],
			directoryGroupSearch.searchmetadatamodel[MetadataModel.FgProperties.DATABASE_JOIN_DEPTH]
		)

		if (directoryGroupIDQP) {
			let queryCondition: MetadataModel.QueryConditions[] = [
				{
					[directoryGroupIDQP.qcKey]: {
						[MetadataModel.QcProperties.D_TABLE_COLLECTION_UID]:
							directoryGroupSearch.searchmetadatamodel[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_UID],
						[MetadataModel.QcProperties.D_FIELD_COLUMN_NAME]: Domain.Entities.DirectoryGroups.FieldColumn.ID,
						[MetadataModel.QcProperties.FG_FILTER_CONDITION]: [
							[
								{
									[MetadataModel.FConditionProperties.NEGATE]: false,
									[MetadataModel.FConditionProperties.CONDITION]: MetadataModel.FilterCondition.EQUAL_TO,
									[MetadataModel.FConditionProperties.VALUE]: {
										[MetadataModel.FSelectProperties.TYPE]: MetadataModel.FieldType.TEXT,
										[MetadataModel.FSelectProperties.VALUE]: directoryGroupID
									}
								}
							]
						]
					}
				}
			]

			try {
				await directoryGroupSearch.Search(
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
					error(500, `Search ${Domain.Entities.DirectoryGroups.RepositoryName} failed`)
				}
			}

			if (Array.isArray(directoryGroupSearch.searchresults.data) && directoryGroupSearch.searchresults.data.length === 1) {
				data.current_directory_group = {
					metadata_model: directoryGroupSearch.searchmetadatamodel,
					datum: directoryGroupSearch.searchresults.data[0]
				}

				return data
			} else {
				error(404, 'Not Found')
			}
		} else {
			error(500, `directoryGroupIDQCKey not valid`)
		}
	} else {
		error(401, 'Unauthorized')
	}
}
