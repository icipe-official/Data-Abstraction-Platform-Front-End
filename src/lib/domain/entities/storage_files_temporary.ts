export enum FieldColumn {
	ID = 'id',
	StorageFileMimeType = 'storage_file_mime_type',
	OriginalName = 'original_name',
	Tags = 'tags',
	SizeInBytes = 'size_in_bytes',
	CreatedOn = 'created_on'
}

export const RepositoryName = 'storage_files_temporary'

export interface Interface {
	id?: string[]
	storage_file_mime_type?: string[]
	original_name?: string[]
	tags?: string[]
	size_in_bytes?: number[]
	created_on?: string[]
}
