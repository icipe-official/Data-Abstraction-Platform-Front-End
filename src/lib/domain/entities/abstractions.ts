export enum FieldColumn {
	ID = 'id',
	AbstractionsDirectoryGroupsID = 'abstractions_directory_groups_id',
	DirectoryID = 'directory_id',
	StorageFilesID = 'storage_files_id',
	Completed = 'completed',
	ReviewPass = 'review_pass',
	Tags = 'tags',
	Data = 'data',
	CreatedOn = 'created_on',
	LastUpdatedOn = 'last_updated_on',
	DeactivatedOn = 'deactivated_on',
	FullTextSearch = 'full_text_search'
}

export const RepositoryName = 'abstractions'

export interface Interface {
	id?: string[]
	abstractions_directory_groups_id?: string[]
	metadata_models_id?: string[]
	directory_id?: string[]
	storage_files_id?: string[]
	completed?: boolean[]
	review_pass?: boolean[]
	tags?: string[]
	data?: any[]
	created_on?: string[]
	last_updated_on?: string[]
	deactivated_on?: string[]
}

export interface UpdateDirectory {
	directory_id?: string[]
	directory_group_id?: string[]
	abstractions_id?: string[]
	storage_files_full_text_search?: string[]
	completed?: boolean
	review_pass?: boolean
	new_directory_id?: string
}