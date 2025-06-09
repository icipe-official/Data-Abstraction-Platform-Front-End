export enum FieldColumn {
	DirectoryGroupsID = 'directory_groups_id',
	CreationIamGroupAuthorizationsID = 'creation_iam_group_authorizations_id',
	DeactivationIamGroupAuthorizationsID = 'deactivation_iam_group_authorizations_id'
}

export const RepositoryName = 'abstractions_authorization_ids'

export interface Interface {
	directory_groups_id?: string[]
	creation_iam_group_authorizations_id?: string[]
	deactivation_iam_group_authorizations_id?: string[]
}
