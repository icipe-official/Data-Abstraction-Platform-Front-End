import { env } from '$env/dynamic/public'

export const MetadataModelSearchGetMMPath = '/search/metadata-model'
export const MetadataModelSearchPath = '/search'

export interface IWebsitePaths {
	Home: string
	MetadataModels: string
	Directory: {
		Groups: string
		Url: string
	}
	StorageFiles: string
	Abstractions: string
	Administration: string
}
export const WebsitePaths: IWebsitePaths = {
	Home: 'home',
	MetadataModels: 'metadata-models',
	Directory: {
		Groups: 'directory/groups',
		Url: 'directory'
	},
	StorageFiles: 'storage/files',
	Abstractions: 'abstractions',
	Administration: 'administration'
}

export interface IApiUrlPaths {
	Group: {
		RuleAuthorizations: string
		AuthorizationRules: string
	}
	Directory: {
		Groups: string
		Url: string
	}
	Iam: {
		GroupAuthorizations: string
		Credentials: string
		Session: string
		AuthenticationHeaders: string
		RefreshTokens: string
		OpenIDEndpoints: string
		Signout: string
	}
	MetadataModel: string
	MetadataModels: {
		Directory: {
			Groups: string
			Url: string
		}
		Url: string
	}
	Storage: {
		Drives: {
			Types: string
			Groups: string
			Url: string
		}
		Files: string
	}
	Abstractions: {
		DirectoryGroups: string
		Reviews: {
			Comments: string
			Url: string
		}
		Url: string
	}
}
export const ApiUrlPaths: IApiUrlPaths = {
	Abstractions: {
		DirectoryGroups: `${env.PUBLIC_API_CORE_URL}/abstractions/directory-groups`,
		Reviews: {
			Comments: `${env.PUBLIC_API_CORE_URL}/abstractions/reviews/comments`,
			Url: `${env.PUBLIC_API_CORE_URL}/abstractions/reviews`
		},
		Url: `${env.PUBLIC_API_CORE_URL}/abstractions`
	},
	Storage: {
		Drives: {
			Types: `${env.PUBLIC_API_CORE_URL}/storage/drives/types`,
			Groups: `${env.PUBLIC_API_CORE_URL}/storage/drives/groups`,
			Url: `${env.PUBLIC_API_CORE_URL}/storage/drives`
		},
		Files: `${env.PUBLIC_API_CORE_URL}/storage/files`
	},
	Group: {
		RuleAuthorizations: `${env.PUBLIC_API_CORE_URL}/group/rule-authorizations`,
		AuthorizationRules: `${env.PUBLIC_API_CORE_URL}/group/authorization-rules`
	},
	Directory: {
		Url: `${env.PUBLIC_API_CORE_URL}/directory`,
		Groups: `${env.PUBLIC_API_CORE_URL}/directory/groups`
	},
	Iam: {
		Credentials: `${env.PUBLIC_API_CORE_URL}/iam/credentials`,
		GroupAuthorizations: `${env.PUBLIC_API_CORE_URL}/iam/group-authorizations`,
		Session: `${env.PUBLIC_API_CORE_URL}/iam/session`,
		AuthenticationHeaders: `${env.PUBLIC_API_CORE_URL}/iam/authentication-headers`,
		OpenIDEndpoints: `${env.PUBLIC_API_CORE_URL}/iam/openid-endpoints`,
		RefreshTokens: `${env.PUBLIC_API_CORE_URL}/iam/refresh-tokens`,
		Signout: `${env.PUBLIC_API_CORE_URL}/iam/sign-out`
	},
	MetadataModel: `${env.PUBLIC_API_CORE_URL}/metadata-model`,
	MetadataModels: {
		Directory: {
			Groups: `${env.PUBLIC_API_CORE_URL}/metadata-models/directory/groups`,
			Url: `${env.PUBLIC_API_CORE_URL}/metadata-models/directory`
		},
		Url: `${env.PUBLIC_API_CORE_URL}/metadata-models`
	}
}

export const enum SearchParams {
	TARGET_JOIN_DEPTH = 'target_join_depth',
	SUB_QUERY = 'sub_query',
	VERBOSE_RESPONSE = 'verbose_response',
	SKIP_IF_DATA_EXTRACTION = 'skip_if_data_extraction',
	SKIP_IF_FG_DISABLED = 'skip_if_fg_disabled',
	AUTH_CONTEXT_DIRECTORY_GROUP_ID = 'auth_context_directory_group_id',
	START_SEARCH_DIRECTORY_GROUP_ID = 'start_search_directory_group_id',
	DIRECTORY_GROUP_ID = 'directory_group_id',
	ACTION = 'action'
}

export const enum Action {
	CREATE = 'create',
	RETRIEVE = 'retrieve',
	UPDATE = 'update',
	DELETE = 'delete',
	UPSERT = 'upsert',
	UPDATE_DIRECTORY = 'update_directory'
}

export function AddBaseUrl(url: URL) {
	if (!url.pathname.startsWith(import.meta.env.BASE_URL)) {
		url.pathname = GetBaseUrl() + url.pathname
	}
}

export function GetBaseUrl() {
	return import.meta.env.BASE_URL + !import.meta.env.BASE_URL.endsWith('/') ? '/' : ''
}
