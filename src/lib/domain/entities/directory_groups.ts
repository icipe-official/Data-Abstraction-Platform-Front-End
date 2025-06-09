export enum FieldColumn {
	ID = 'id',
	DisplayName = 'display_name',
	Description = 'description',
	Data = 'data',
	CreatedOn = 'created_on',
	LastUpdatedOn = 'last_updated_on',
	DeactivatedOn = 'deactivated_on',
	FullTextSearch = 'full_text_search'
}

export const RepositoryName = 'directory_groups'

export interface Interface {
	id?: string[]
	display_name?: string[]
	description?: string[]
	data?: any[]
	created_on?: string[]
	last_updated_on?: string[]
	deactivated_on?: string[]
}
