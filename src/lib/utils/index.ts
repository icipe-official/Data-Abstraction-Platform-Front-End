export * as MetadataModel from './metadata_model'
export * as Iam from './iam'
export * as Env from './env'
export * as Theme from './theme'

export const EMAIL_VALIDATION_REGEX =
	/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

export const DEFAULT_FETCH_ERROR = 'Unknown error occured possibly due to server being unreachable.'

export const LocalDateFromString = (value: string) => new Date(value).toLocaleDateString()

export const LocalTimeFromString = (value: string) => new Date(value).toLocaleTimeString()

/**
 * Generate arbitrary range of numbers.
 *
 * Source:  {@link https://www.geeksforgeeks.org/javascript-equivalent-to-python-s-range-function/}
 *
 * **NB**
 * - When using it together with pagination to display array/object items, ensure that you check whether the value at the index exists.
 * - This is because when you mutate the original array/object, especially deleting an item, the changes do not reflect immediately in the ui.
 *
 *
 * @param start
 * @param end
 * @param step
 */
export function* Range(start: number, end: number, step = 1) {
	for (let i = start; i < end; i += step) {
		yield i
	}
}

/**
 *
 * @param end end value of range
 * @param lengthOfArray size of array
 * @returns `0` if {@linkcode lengthOfArray} is zero else `end + 1`.
 */
export function RangeArrayEnd(end: number, lengthOfArray: number) {
	return lengthOfArray === 0 ? 0 : end + 1
}
