import { Domain } from '$lib'

/**
 * Defines the interface for creating, updating, and deleting one metadata-model.
 */
export interface Datum {
	previousDatum?: any

	context: string

	authcontextdirectorygroupid?: string

	verboseresponse?: boolean

	currentdirectorygroupid: string

	directory_group_id?: string

	metadata_models_id?: string
	
	fetch: Domain.Interfaces.Fetch

	abstractionReviewQuorum: number
	abstractionReviewQuorumValid?: () => boolean
	abstractionReviewQuorumError?: string[]
	updateAbstractionReviewQuorum: (value: any) => void

	description: string
	descriptionValid?: () => boolean
	descriptionError?: string[]
	updateDescription: (value: any) => void

	viewAuthorized: boolean
	viewUnauthorized: boolean

	reset?: () => void

	create?: () => Promise<Domain.Entities.State.Toast>
	update?: () => Promise<Domain.Entities.State.Toast>
	delete?: () => Promise<Domain.Entities.State.Toast>

	telemetry?: Domain.Interfaces.ITelemetry
}
