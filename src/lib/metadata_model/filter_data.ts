import * as Json from '../json'
import {
	FConditionProperties,
	FieldDateTimeFormat,
	FieldType,
	FilterCondition,
	FSelectProperties,
	FSelectType,
	QcProperties,
	type IQueryCondition,
	type QueryConditions
} from './metadata_model'

/**
 * Executes filter conditions against data.
 * @param queryConditions an array of query conditions containing filter conditions. Will treat each queryCondition in {@linkcode queryConditions} as 'or' condition.
 * @param data rows of data to filter through. Expected to be presented as if converted from JSON.
 * @returns an array containing indexes of {@linkcode data} that DID NOT pass the filter conditions.
 */
export function FilterData(queryConditions: QueryConditions[], data: any[]): number[] {
	if (!Array.isArray(data)) {
		throw [FilterData.name, 'argument data is not an valid.']
	}

	let filterExcludeDataIndexes = new Set<number>()

	if (!Array.isArray(queryConditions)) {
		return Array.from(filterExcludeDataIndexes)
	}

	for (let dIndex = 0; dIndex < data.length; dIndex++) {
		let filterExcludeDatum = true

		for (const queryCondition of queryConditions) {
			if (typeof queryCondition !== 'object' || Array.isArray(queryCondition)) {
				throw [FilterData.name, 'queryCondition is not an valid.', queryCondition]
			}

			let queryConditionTrue = true
			for (const fgKey of Object.keys(queryCondition)) {
				const fgQueryCondtion: IQueryCondition = queryCondition[fgKey]
				if (typeof fgQueryCondtion !== 'object' || Array.isArray(fgQueryCondtion)) {
					throw [FilterData.name, 'fgQueryCondtion is not an valid.', fgQueryCondtion]
				}

				let allOrConditionsFalse: boolean = true

				if (fgQueryCondtion[QcProperties.D_FULL_TEXT_SEARCH_QUERY]) {
					let ejvt = new ExtractJsonValuesToText(data[dIndex])
					ejvt.Extract()
					if (ejvt.Text.includes(fgQueryCondtion[QcProperties.D_FULL_TEXT_SEARCH_QUERY])) {
						allOrConditionsFalse = false
					}
				} else {
					const fgFilterConditions = fgQueryCondtion[QcProperties.FG_FILTER_CONDITION]
					if (typeof fgFilterConditions !== 'object' || !Array.isArray(fgFilterConditions)) {
						throw [FilterData.name, 'fgQueryCondtion is not an valid.', fgFilterConditions]
					}

					for (let orIndex = 0; orIndex < fgFilterConditions.length; orIndex++) {
						const orFilterConditions = fgFilterConditions[orIndex]
						if (typeof orFilterConditions !== 'object' || !Array.isArray(orFilterConditions)) {
							throw [FilterData.name, 'fgQueryCondtion is not an valid.', orFilterConditions]
						}

						let allAndConditionsTrue: boolean = true
						for (let andIndex = 0; andIndex < orFilterConditions.length; andIndex++) {
							const andCondition = orFilterConditions[andIndex]
							if (typeof andCondition !== 'object' || Array.isArray(andCondition)) {
								throw [FilterData.name, 'andCondition is not an valid.', andCondition]
							}
							if (typeof andCondition[FConditionProperties.CONDITION] !== 'string') {
								throw [
									FilterData.name,
									'andCondition[FConditionProperties.FILTER_CONDITION] is not an valid.',
									andCondition[FConditionProperties.CONDITION]
								]
							}

							let andConditionTrue = false

							const filterNegate = andCondition[FConditionProperties.NEGATE] || false
							const filterValue = andCondition[FConditionProperties.VALUE]
							let loopSuccessful = Json.ForEachValueInObject(data[dIndex], fgKey, (_, valueFound) => {
								switch (andCondition[FConditionProperties.CONDITION] as FilterCondition) {
									case FilterCondition.NO_OF_ENTRIES_GREATER_THAN:
									case FilterCondition.NO_OF_ENTRIES_LESS_THAN:
									case FilterCondition.NO_OF_ENTRIES_EQUAL_TO:
										if (typeof filterValue !== 'number') {
											throw [FilterData.name, 'filterValue is not an valid.', filterValue]
										}

										if (Array.isArray(valueFound)) {
											let conditionTrue = false
											switch (andCondition[FConditionProperties.CONDITION] as FilterCondition) {
												case FilterCondition.NO_OF_ENTRIES_GREATER_THAN:
													conditionTrue = valueFound.length > filterValue
													break
												case FilterCondition.NO_OF_ENTRIES_LESS_THAN:
													conditionTrue = valueFound.length < filterValue
													break
												case FilterCondition.NO_OF_ENTRIES_EQUAL_TO:
													conditionTrue = valueFound.length == filterValue
													break
											}
											if (conditionTrue) {
												if (filterNegate) {
													return true
												}
												andConditionTrue = true
												return true
											}
										}

										break
									case FilterCondition.NUMBER_GREATER_THAN:
									case FilterCondition.NUMBER_LESS_THAN:
										if (typeof filterValue !== 'number') {
											throw [FilterData.name, 'filterValue is not an valid.', filterValue]
										}

										if (Array.isArray(valueFound)) {
											let conditionTrue = false

											for (const valueF of valueFound) {
												if (typeof valueF === 'number') {
													if (isNumberConditionTrue(andCondition[FConditionProperties.CONDITION] as FilterCondition, valueF, filterValue)) {
														conditionTrue = true
														break
													}
												}
											}
											if (conditionTrue) {
												if (filterNegate) {
													return true
												}
												andConditionTrue = true
												return true
											}
										} else {
											if (typeof valueFound === 'number') {
												if (isNumberConditionTrue(andCondition[FConditionProperties.CONDITION] as FilterCondition, valueFound, filterValue)) {
													if (filterNegate) {
														return true
													}
													andConditionTrue = true
													return true
												}
											}
										}
										break
									case FilterCondition.TIMESTAMP_GREATER_THAN:
									case FilterCondition.TIMESTAMP_LESS_THAN:
										if (typeof filterValue !== 'string') {
											throw [FilterData.name, 'filterValue is not an valid.', filterValue]
										}

										try {
											if (Array.isArray(valueFound)) {
												let conditionTrue = false

												for (const valueF of valueFound) {
													if (
														isTimestampConditionTrue(
															andCondition[FConditionProperties.CONDITION] as FilterCondition,
															andCondition[FConditionProperties.DATE_TIME_FORMAT],
															valueF,
															filterValue
														)
													) {
														conditionTrue = true
														break
													}
												}
												if (conditionTrue) {
													if (filterNegate) {
														return true
													}
													andConditionTrue = true
													return true
												}
											} else {
												if (
													isTimestampConditionTrue(
														andCondition[FConditionProperties.CONDITION] as FilterCondition,
														andCondition[FConditionProperties.DATE_TIME_FORMAT],
														valueFound,
														filterValue
													)
												) {
													if (filterNegate) {
														return true
													}
													andConditionTrue = true
													return true
												}
											}
										} catch (e) {
											throw e
										}
										break
									case FilterCondition.TEXT_BEGINS_WITH:
									case FilterCondition.TEXT_CONTAINS:
									case FilterCondition.TEXT_ENDS_WITH:
										if (typeof filterValue !== 'string') {
											throw [FilterData.name, 'filterValue is not an valid.', filterValue]
										}
										if (Array.isArray(valueFound)) {
											let conditionTrue = false

											for (const valueF of valueFound) {
												if (typeof valueF === 'string') {
													if (isTextConditionTrue(andCondition[FConditionProperties.CONDITION] as FilterCondition, valueF, filterValue)) {
														conditionTrue = true
														break
													}
												}
											}
											if (conditionTrue) {
												if (filterNegate) {
													return true
												}
												andConditionTrue = true
												return true
											}
										} else {
											if (typeof valueFound === 'string') {
												if (isTextConditionTrue(andCondition[FConditionProperties.CONDITION] as FilterCondition, valueFound, filterValue)) {
													if (filterNegate) {
														return true
													}
													andConditionTrue = true
													return true
												}
											}
										}
										break
									case FilterCondition.EQUAL_TO:
										if (Array.isArray(valueFound)) {
											let conditionTrue = false

											for (const valueF of valueFound) {
												if (typeof valueF === 'string') {
													if (
														isEqualToConditionTrue(
															filterValue[FSelectProperties.TYPE],
															filterValue[FSelectProperties.DATE_TIME_FORMAT] || undefined,
															valueF,
															filterValue[FSelectProperties.VALUE]
														)
													) {
														conditionTrue = true
														break
													}
												}
											}
											if (conditionTrue) {
												if (filterNegate) {
													return true
												}
												andConditionTrue = true
												return true
											}
										} else {
											if (typeof valueFound === 'string') {
												if (
													isEqualToConditionTrue(
														filterValue[FSelectProperties.TYPE],
														filterValue[FSelectProperties.DATE_TIME_FORMAT] || undefined,
														valueFound,
														filterValue[FSelectProperties.VALUE]
													)
												) {
													if (filterNegate) {
														return true
													}
													andConditionTrue = true
													return true
												}
											}
										}
								}

								if (filterNegate) {
									andConditionTrue = true
									return true
								}

								return false
							})
							if (!loopSuccessful && filterNegate) {
								andConditionTrue = true
							}

							if (!andConditionTrue) {
								allAndConditionsTrue = false
								break
							}
						}

						if (allAndConditionsTrue) {
							allOrConditionsFalse = false
							break
						}
					}
				}
				if (allOrConditionsFalse) {
					queryConditionTrue = false
					break
				}
			}

			if (queryConditionTrue) {
				filterExcludeDatum = false
				break
			}
		}

		if (filterExcludeDatum) {
			filterExcludeDataIndexes.add(dIndex)
		}
	}

	return Array.from(filterExcludeDataIndexes)
}

function isEqualToConditionTrue(
	filterValueType: FieldType | FSelectType,
	dateTimeFormat: FieldDateTimeFormat = FieldDateTimeFormat.YYYYMMDDHHMM,
	valueFound: any,
	filterValue: any
) {
	switch (filterValueType as FieldType | FSelectType) {
		case FSelectType.SELECT:
		case FieldType.TEXT:
		case FieldType.NUMBER:
		case FieldType.BOOLEAN:
			return valueFound === filterValue
		case FieldType.TIMESTAMP:
			return isTimestampConditionTrue(FilterCondition.EQUAL_TO, dateTimeFormat, valueFound, filterValue)
	}
}

function isTimestampConditionTrue(
	filterCondtion: FilterCondition,
	dateTimeFormat: FieldDateTimeFormat = FieldDateTimeFormat.YYYYMMDDHHMM,
	valueFound: any,
	filterValue: any
) {
	try {
		const filterValueDate = new Date(filterValue)
		const valueFoundDate = new Date(valueFound)

		switch (filterCondtion) {
			case FilterCondition.TIMESTAMP_GREATER_THAN:
				switch (dateTimeFormat as FieldDateTimeFormat) {
					case FieldDateTimeFormat.YYYYMMDDHHMM:
						if (valueFoundDate.getFullYear() > filterValueDate.getFullYear()) {
							return true
						}
						if (valueFoundDate.getFullYear() === filterValueDate.getFullYear()) {
							if (valueFoundDate.getMonth() > filterValueDate.getMonth()) {
								return true
							}
							if (valueFoundDate.getMonth() === filterValueDate.getMonth()) {
								if (valueFoundDate.getDate() > filterValueDate.getDate()) {
									return true
								}
								if (valueFoundDate.getDate() === filterValueDate.getDate()) {
									if (valueFoundDate.getHours() > filterValueDate.getHours()) {
										return true
									}
									if (valueFoundDate.getHours() === filterValueDate.getHours()) {
										if (valueFoundDate.getMinutes() > filterValueDate.getMinutes()) {
											return true
										}
									}
								}
							}
						}
						return false
					case FieldDateTimeFormat.YYYYMMDD:
						if (valueFoundDate.getFullYear() > filterValueDate.getFullYear()) {
							return true
						}
						if (valueFoundDate.getFullYear() === filterValueDate.getFullYear()) {
							if (valueFoundDate.getMonth() > filterValueDate.getMonth()) {
								return true
							}
							if (valueFoundDate.getMonth() === filterValueDate.getMonth()) {
								if (valueFoundDate.getDate() > filterValueDate.getDate()) {
									return true
								}
							}
						}
						return false
					case FieldDateTimeFormat.YYYYMM:
						if (valueFoundDate.getFullYear() > filterValueDate.getFullYear()) {
							return true
						}
						if (valueFoundDate.getFullYear() === filterValueDate.getFullYear()) {
							if (valueFoundDate.getMonth() > filterValueDate.getMonth()) {
								return true
							}
						}
						return false
					case FieldDateTimeFormat.HHMM:
						if (valueFoundDate.getHours() > filterValueDate.getHours()) {
							return true
						}
						if (valueFoundDate.getHours() === filterValueDate.getHours()) {
							if (valueFoundDate.getMinutes() > filterValueDate.getMinutes()) {
								return true
							}
						}
						return false
					case FieldDateTimeFormat.YYYY:
						return valueFoundDate.getFullYear() > filterValueDate.getFullYear()
					case FieldDateTimeFormat.MM:
						return valueFoundDate.getMonth() > filterValueDate.getMonth()
				}
				break
			case FilterCondition.TIMESTAMP_LESS_THAN:
				switch (dateTimeFormat as FieldDateTimeFormat) {
					case FieldDateTimeFormat.YYYYMMDDHHMM:
						if (valueFoundDate.getFullYear() < filterValueDate.getFullYear()) {
							return true
						}
						if (valueFoundDate.getFullYear() === filterValueDate.getFullYear()) {
							if (valueFoundDate.getMonth() < filterValueDate.getMonth()) {
								return true
							}
							if (valueFoundDate.getMonth() === filterValueDate.getMonth()) {
								if (valueFoundDate.getDate() < filterValueDate.getDate()) {
									return true
								}
								if (valueFoundDate.getDate() === filterValueDate.getDate()) {
									if (valueFoundDate.getHours() < filterValueDate.getHours()) {
										return true
									}
									if (valueFoundDate.getHours() === filterValueDate.getHours()) {
										if (valueFoundDate.getMinutes() < filterValueDate.getMinutes()) {
											return true
										}
									}
								}
							}
						}
						return false
					case FieldDateTimeFormat.YYYYMMDD:
						if (valueFoundDate.getFullYear() < filterValueDate.getFullYear()) {
							return true
						}
						if (valueFoundDate.getFullYear() === filterValueDate.getFullYear()) {
							if (valueFoundDate.getMonth() < filterValueDate.getMonth()) {
								return true
							}
							if (valueFoundDate.getMonth() === filterValueDate.getMonth()) {
								if (valueFoundDate.getDate() < filterValueDate.getDate()) {
									return true
								}
							}
						}
						return false
					case FieldDateTimeFormat.YYYYMM:
						if (valueFoundDate.getFullYear() < filterValueDate.getFullYear()) {
							return true
						}
						if (valueFoundDate.getFullYear() === filterValueDate.getFullYear()) {
							if (valueFoundDate.getMonth() < filterValueDate.getMonth()) {
								return true
							}
						}
						return false
					case FieldDateTimeFormat.HHMM:
						if (valueFoundDate.getHours() < filterValueDate.getHours()) {
							return true
						}
						if (valueFoundDate.getHours() === filterValueDate.getHours()) {
							if (valueFoundDate.getMinutes() < filterValueDate.getMinutes()) {
								return true
							}
						}
						return false
					case FieldDateTimeFormat.YYYY:
						return valueFoundDate.getFullYear() < filterValueDate.getFullYear()
					case FieldDateTimeFormat.MM:
						return valueFoundDate.getMonth() < filterValueDate.getMonth()
				}
				break
			case FilterCondition.EQUAL_TO:
				switch (dateTimeFormat as FieldDateTimeFormat) {
					case FieldDateTimeFormat.YYYYMMDDHHMM:
						if (valueFoundDate.getFullYear() === filterValueDate.getFullYear()) {
							if (valueFoundDate.getMonth() === filterValueDate.getMonth()) {
								if (valueFoundDate.getDate() === filterValueDate.getDate()) {
									if (valueFoundDate.getHours() === filterValueDate.getHours()) {
										if (valueFoundDate.getMinutes() === filterValueDate.getMinutes()) {
											return true
										}
									}
								}
							}
						}
						return false
					case FieldDateTimeFormat.YYYYMMDD:
						if (valueFoundDate.getFullYear() === filterValueDate.getFullYear()) {
							if (valueFoundDate.getMonth() === filterValueDate.getMonth()) {
								if (valueFoundDate.getDate() === filterValueDate.getDate()) {
									return true
								}
							}
						}
						return false
					case FieldDateTimeFormat.YYYYMM:
						if (valueFoundDate.getFullYear() === filterValueDate.getFullYear()) {
							if (valueFoundDate.getMonth() === filterValueDate.getMonth()) {
								return true
							}
						}
						return false
					case FieldDateTimeFormat.HHMM:
						if (valueFoundDate.getHours() === filterValueDate.getHours()) {
							if (valueFoundDate.getMinutes() === filterValueDate.getMinutes()) {
								return true
							}
						}
						return false
					case FieldDateTimeFormat.YYYY:
						return valueFoundDate.getFullYear() === filterValueDate.getFullYear()
					case FieldDateTimeFormat.MM:
						return valueFoundDate.getMonth() === filterValueDate.getMonth()
				}
				break
		}
		return false
	} catch (e) {
		throw [isTimestampConditionTrue.name, e]
	}
}

function isTextConditionTrue(filterCondtion: FilterCondition, valueFound: string, filterValue: string) {
	switch (filterCondtion) {
		case FilterCondition.TEXT_BEGINS_WITH:
			return valueFound.startsWith(filterValue)
		case FilterCondition.TEXT_CONTAINS:
			return valueFound.includes(filterValue)
		case FilterCondition.TEXT_ENDS_WITH:
			return valueFound.endsWith(filterValue)
	}

	return false
}

function isNumberConditionTrue(filterCondtion: FilterCondition, valueFound: number, filterValue: number) {
	switch (filterCondtion) {
		case FilterCondition.NUMBER_GREATER_THAN:
			return valueFound > filterValue
		case FilterCondition.NUMBER_LESS_THAN:
			return valueFound < filterValue
	}

	return false
}

class ExtractJsonValuesToText {
	private _json: any
	private _text: string = ''

	get Text() {
		return this._text
	}

	constructor(value: any) {
		this._json = value
	}

	Extract() {
		this.extractfromobject(this._json)
	}

	private extractfromobject(value: any) {
		if (typeof value === 'object') {
			if (Array.isArray(value)) {
				for (const v of value) {
					this.extractfromobjectprops(v)
				}
			} else {
				for (const v of Object.values(value)) {
					this.extractfromobjectprops(v)
				}
			}
		}
	}

	private extractfromobjectprops(value: any) {
		if (typeof value !== 'undefined' && value !== null) {
			if (typeof value === 'object') {
				this.extractfromobject(value)
			} else {
				if (!this._text.includes(value)) {
					this._text += ' ' + `${value}`
				}
			}
		}
	}
}
