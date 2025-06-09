import { Type } from './toast'
import type { ISearchResults } from './metadata_model'
import type { Session as IamSession } from './iam'

export interface Session extends IamSession {}

export interface Toast {
	/**
	 * Type of toast, typically influences the color theme of the displayed toast.
	 */
	Type?: Type

	/**
	 * Text message to show
	 */
	Message?: string | string[]

	/**
	 * If toast message contains some data to show, a link to display it in a table following the metadata-modelling system.
	 */
	MedataModelSearchResults?: ISearchResults
}
