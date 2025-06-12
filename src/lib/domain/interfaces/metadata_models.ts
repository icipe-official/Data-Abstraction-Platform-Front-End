import { Domain, MetadataModel } from '$lib'

export interface ViewSearch {
	context?: string
	telemetry?: Domain.Interfaces.ITelemetry
	authcontextdirectorygroupid?: string
	search?: Search
	queryconditions?: MetadataModel.QueryConditions[]
	quicksearchquerycondition?: MetadataModel.QueryConditions
	searchmetadatamodel?: any
	searchresults?: any[]
	filterexcludeindexes?: number[]
	getdisplaydataexecuted?: boolean
	getdisplaydata?: () => Promise<void>
	updatemedataModel?: (value: any) => void
	searchdata?: () => Promise<void>
	view?: 'table' | 'list' | 'detailed' | 'simple'
	showquerypanel?: boolean
	selectedindexes?: number[]
}

/**
 *
 */
export interface Search {
	searchmetadatamodel: any
	searchresults: Domain.Entities.MetadataModel.ISearchResults

	UpdateMetadatamodel: (value: any) => void
	FetchMetadataModel: (
		authContextDirectoryGroupID: string | undefined,
		targetJoinDepth: number | undefined,
		signal: AbortSignal | null | undefined
	) => Promise<void>
	Search: (
		queryConditions: MetadataModel.QueryConditions[] | undefined,
		authContextDirectoryGroupID: string | undefined,
		startSearchContextDirectoryGroupID: string | undefined,
		targetJoinDepth: number | undefined,
		skipIfFgDisabled: boolean | undefined,
		skipIfDataExtraction: boolean | undefined,
		signal: AbortSignal | null | undefined
	) => Promise<void>
}

/**
 *
 */
export interface Get {
	cachemetadatamodels: { [key: string]: string }

	GetMetadataModel: (
		fieldAnyMetatadaModel: IFieldAnyGetMetadataModel,
		actionID: string,
		currentFgKey: string,
		tableCollectionUid: string,
		argument: any
	) => Promise<any>
	GetPathToCachedMetadataModel: (actionID: string, currentFgKey: string, tableCollectionUid: string, argument: any) => string
}

/**
 * Defines interface for getting the metadata model to work with data for a field of type {@linkcode MetadataModel.FieldType.ANY}.
 * Can be used for dynamically displaying the data (which could be an array of objects of different structure) using a particular metadata-model depending on ID.
 */
export interface IFieldAnyGetMetadataModel {
	/**
	 *
	 * @param actionID Extracted from field property {@linkcode MetadataModel.FieldAnyProperties.METADATA_MODEL_ACTION_ID}.
	 * @param currentFgKey Typically prepared from {@linkcode MetadataModel.FgProperties.FIELD_GROUP_KEY}.
	 * @param tableCollectionUid Extracted from field property {@linkcode MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_UID}.
	 * @param argument Field value used as ID when fetching metadata-model.
	 * @returns MetadataModel if found.
	 */
	GetMetadataModel: (actionID: string, currentFgKey: string, tableCollectionUid: string, argument: any) => Promise<any | undefined>
}

/**
 * Defines the interface for creating, updating, and deleting one metadata-model.
 */
export interface Datum {
	previousDatum?: any

	id?: string

	name: string
	nameValid?: () => boolean
	nameError?: string[]
	updateName: (value: any) => void

	description: string
	descriptionValid?: () => boolean
	descriptionError?: string[]
	updateDescription: (value: any) => void

	tags: string[]
	updateTags: (index: number, value: any) => void
	deleteTags: (index: number) => void

	viewAuthorized: boolean
	viewUnauthorized: boolean
	editAuthorized: boolean
	editUnauthorized: boolean
	data: any

	reset?: () => void

	create?: (
		authFetch: Domain.Interfaces.AuthenticatedFetch,
		directoryGroupID: string,
		opts?: {
			componentName?: string
			telemetry?: Domain.Interfaces.ITelemetry
			authContextDirectoryGroupID?: string
			verboseResponse?: boolean
		}
	) => Promise<Domain.Entities.State.Toast>
	update?: (
		authFetch: Domain.Interfaces.AuthenticatedFetch,
		directoryGroupID: string,
		opts?: {
			componentName?: string
			telemetry?: Domain.Interfaces.ITelemetry
			authContextDirectoryGroupID?: string
			verboseResponse?: boolean
		}
	) => Promise<Domain.Entities.State.Toast>
	delete?: (
		authFetch: Domain.Interfaces.AuthenticatedFetch,
		directoryGroupID: string,
		opts?: {
			componentName?: string
			telemetry?: Domain.Interfaces.ITelemetry
			authContextDirectoryGroupID?: string
			verboseResponse?: boolean
		}
	) => Promise<Domain.Entities.State.Toast>

	telemetry?: Domain.Interfaces.ITelemetry
}
