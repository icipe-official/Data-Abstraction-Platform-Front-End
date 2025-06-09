import type { Interface as IamCredentialsInterface } from './iam_credentials'
import type { Interface as DirectoryInterface } from './directory'

export interface AccessRefreshToken {
	access_token?: string
	access_token_expires_in?: number
	refresh_token?: string
	refresh_token_expires_in?: number
}

export interface AuthenticationHeaders {
	access_token_header?: string
	refresh_token_header?: string
	cookie_http_only?: boolean
	cookie_same_site?: number
	cookie_secure?: boolean
	cookie_domain?: string
}

export interface Session {
	iam_credential?: IamCredentialsInterface
	directory?: DirectoryInterface
}

export interface OpenIDEndpoints {
	login_endpoint?: string
	registration_endpoint?: string
	account_management_endpoint?: string
}

export enum AuthRuleGroup {
	GROUP_RULE_AUTHORIZATIONS = 'group_rule_authorizations',
	IAM_GROUP_AUTHORIZATIONS = 'iam_group_authorizations',
	DIRECTORY_GROUPS = 'directory_groups',
	DIRECTORY_GROUPS_TYPES = 'directory_groups_types',
	DIRECTORY = 'directory',
	IAM_CREDENTIALS = 'iam_credentials',
	METADATA_MODELS = 'metadata_models',
	METADATA_MODELS_DIRECTORY = 'metadata_models_directory',
	METADATA_MODELS_DIRECTORY_GROUPS = 'metadata_models_directory_groups',
	STORAGE_FILES = 'storage_files',
	ABSTRACTIONS_DIRECTORY_GROUPS = 'abstractions_directory_groups',
	ABSTRACTIONS = 'abstractions',
	ABSTRACTIONS_REVIEWS = 'abstractions_reviews'
}

const AUTH_RULE_ASSIGN_PREFIX = 'assign_'
const AUTH_RULE_SELF_SUFFIX = '_self'
const AUTH_RULE_OTHERS_SUFFIX = '_others'

export enum AuthRule {
CREATE = 'create',
ASSIGN_CREATE = `${AUTH_RULE_ASSIGN_PREFIX}${CREATE}`,
CREATE_OTHERS = `${CREATE}${AUTH_RULE_OTHERS_SUFFIX}`,
ASSIGN_CREATE_OTHERS = `${AUTH_RULE_ASSIGN_PREFIX}${CREATE_OTHERS}`,
RETRIEVE = 'retrieve',
ASSIGN_RETRIEVE = `${AUTH_RULE_ASSIGN_PREFIX}${RETRIEVE}`,
RETRIEVE_SELF = `${RETRIEVE}${AUTH_RULE_SELF_SUFFIX}`,
ASSIGN_RETRIEVE_SELF = `${AUTH_RULE_ASSIGN_PREFIX}${RETRIEVE_SELF}`,
RETRIEVE_OTHERS = `${RETRIEVE}${AUTH_RULE_OTHERS_SUFFIX}`,
ASSIGN_RETRIEVE_OTHERS = `${AUTH_RULE_ASSIGN_PREFIX}${RETRIEVE_OTHERS}`,
UPDATE = 'update',
ASSIGN_UPDATES = `${AUTH_RULE_ASSIGN_PREFIX}${UPDATE}`,
UPDATE_SELF = `${UPDATE}${AUTH_RULE_SELF_SUFFIX}`,
ASSIGN_UPDATE_SELF = `${AUTH_RULE_ASSIGN_PREFIX}${UPDATE_SELF}`,
UPDATE_OTHERS = `${UPDATE}${AUTH_RULE_OTHERS_SUFFIX}`,
ASSIGN_UPDATE_OTHERS = `${AUTH_RULE_ASSIGN_PREFIX}${UPDATE_OTHERS}`,
DELETE = 'delete',
ASSIGN_DELETE = `${AUTH_RULE_ASSIGN_PREFIX}${DELETE}`,
DELETE_SELF = `${DELETE}${AUTH_RULE_SELF_SUFFIX}`,
ASSIGN_DELETE_SELF = `${AUTH_RULE_ASSIGN_PREFIX}${DELETE_SELF}`,
DELETE_OTHERS = `${DELETE}${AUTH_RULE_OTHERS_SUFFIX}`,
ASSIGN_ALL = `${AUTH_RULE_ASSIGN_PREFIX}all`,
UPDATE_DIRECTORY = `${UPDATE}_${AuthRuleGroup.DIRECTORY}`
}
