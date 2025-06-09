import type { QueryConditions } from '$lib/metadata_model'

export const enum SearchParams {
	CURRENT_DIRECTORY_GROUP_ID = 'current_directory_group_id',
	TARGET_JOIN_DEPTH = 'target_join_depth',
	SUB_QUERY = 'sub_query',
	VERBOSE_RESPONSE = 'verbose',
	SKIP_IF_DATA_EXTRACTION = 'skip_if_data_extraction',
	SKIP_IF_FG_DISABLED = 'skip_if_fg_disabled',
	AUTH_CONTEXT_DIRECTORY_GROUP_ID = 'auth_context_directory_group_id',
	START_SEARCH_DIRECTORY_GROUP_ID = 'start_search_directory_group_id'
}

export interface ISearch {
	metadata_model?: any
	query_conditions?: QueryConditions[]
}

export interface IDatum {
	metadata_model?: any
	datum?: any
}

export interface ISearchResults {
	metadata_model?: any
	data?: any[]
}

export interface IVerboseResponse {
	message?: string
	metadata_model_verbose_response?: {
		metadata_model?: any
		data?: any[]
	}
	successful?: number
	failed?: number
}

export interface ToastData {
	message?: string
	metadatamodel_search_results?: ISearchResults
}

export function GetToastFromJsonVerboseResponse(data: IVerboseResponse): ToastData {
	let toastdata: ToastData = {}
	if (typeof data.message === 'string') {
		toastdata.message = data.message
	}

	if (data.metadata_model_verbose_response) {
		toastdata.metadatamodel_search_results = {}
		if (data.metadata_model_verbose_response.metadata_model) {
			;(toastdata.metadatamodel_search_results as ISearchResults).metadata_model = data.metadata_model_verbose_response.metadata_model
		}
		if (data.metadata_model_verbose_response.data) {
			;(toastdata.metadatamodel_search_results as ISearchResults).data = data.metadata_model_verbose_response.data
		}
	}

	return toastdata
}
