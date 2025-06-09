export enum FieldColumn {
	ID = 'id',
	AbstractionsID = 'abstractions_id',
	DirectoryID = 'directory_id',
	Comment = 'comment',
	CreatedOn = 'created_on'
}

export const RepositoryName = 'abstractions_reviews_comments'

export interface Interface {
	id?: string[]
	abstractions_id?: string[]
	directory_id?: string[]
	comment?: string[]
	created_on?: string[]
	last_updated_on?: string[]
}
