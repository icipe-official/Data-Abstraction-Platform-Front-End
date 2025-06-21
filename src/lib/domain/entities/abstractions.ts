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

export enum ExportColumns {
	AbstractionsID = 'abstractions_id',
	DirectoryID = 'directory_id',
	DirectoryDisplayName = 'directory_display_name',
	StorageFilesID = 'storage_files_id',
	StorageFilesOriginalName = 'storage_files_original_name',
	AbstractionsCompleted = 'abstractions_completed',
	AbstractionsReviewPass = 'abstractions_review_pass',
	AbstractionsCreatedOn = 'abstractions_created_on',
	AbstractionsLastUpdatedOn = 'abstractions_last_updated_on'
}

export const ExportColumnsValues: IExportColumns[] = [
	{
		name: ExportColumns.AbstractionsID,
		display_name: 'abstraction id',
		description: 'UUID of abstraction'
	},
	{
		name: ExportColumns.DirectoryID,
		display_name: 'author id',
		description: 'UUID of current author of the abstraction.'
	},
	{
		name: ExportColumns.DirectoryDisplayName,
		display_name: 'author name',
		description: 'Name of the current author of the abstraction.'
	},
	{
		name: ExportColumns.StorageFilesID,
		display_name: 'file id',
		description: 'UUID of the source material that was abstracted.'
	},
	{
		name: ExportColumns.StorageFilesOriginalName,
		display_name: 'file name',
		description: 'Original name of the source material that was abstracted.'
	},
	{
		name: ExportColumns.AbstractionsCompleted,
		display_name: 'abstraction completed?',
		description: 'has the abstraction been completed?'
	},
	{
		name: ExportColumns.AbstractionsReviewPass,
		display_name: 'abstraction checks passed?',
		description: 'has the abstraction passed all checks?'
	},
	{
		name: ExportColumns.AbstractionsCreatedOn,
		display_name: 'abstraction date of creation',
		description: 'date when abstraction was created.'
	},
	{
		name: ExportColumns.AbstractionsLastUpdatedOn,
		display_name: 'abstraction last updated on',
		description: 'date when abstraction was last updated.'
	}
]

export interface IExportColumns {
	name: ExportColumns
	display_name: string
	description?: string
}

export interface ExportData {
	columns?: IExportColumns[]
	metadata_models_id?: string
	metadata_model?: any
}
