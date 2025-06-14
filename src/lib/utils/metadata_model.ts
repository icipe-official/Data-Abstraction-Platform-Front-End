import { Domain, MetadataModel, Utils } from '$lib'

export function MergeViewSearchQueryConditions(viewDataSearch: Domain.Interfaces.MetadataModels.ViewDataSearch): MetadataModel.QueryConditions[] {
	if (!viewDataSearch.dataQCKey || !Array.isArray(viewDataSearch.queryConditions) || viewDataSearch.queryConditions.length === 0) {
		return []
	}

	const tableCollectionUid = viewDataSearch.dataQCKey.fieldGroup[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_UID]
	if (typeof tableCollectionUid !== 'string') {
		return []
	}

	const fieldColumnName = viewDataSearch.dataQCKey.fieldGroup[MetadataModel.FgProperties.DATABASE_FIELD_COLUMN_NAME]
	if (typeof fieldColumnName !== 'string') {
		return []
	}

	let newQueryConditions: MetadataModel.QueryConditions[] = []

	let newQueryConditionIndex = -1
	for (const vdsQc of viewDataSearch.queryConditions) {
		if (!Array.isArray(vdsQc.metadataModel?.data) || vdsQc.metadataModel.data.length === 0) {
			continue
		}

		const model = vdsQc.metadataModel.data[0]
		if (typeof model[MetadataModel.FgProperties.FIELD_GROUP_KEY] !== 'string') {
			continue
		}

		const qcKey = Utils.MetadataModel.GetQueryKeyFromFieldGroupKey(model[MetadataModel.FgProperties.FIELD_GROUP_KEY])

		if (!Array.isArray(vdsQc.queryCondition)) {
			continue
		}

		newQueryConditions.push({})
		newQueryConditionIndex += 1
		for (const qc of vdsQc.queryCondition) {
			if (typeof qc !== 'object' || Array.isArray(qc)) {
				continue
			}

			for (const eachQcKey of Object.keys(qc)) {
				const eachQc: MetadataModel.IQueryCondition = JSON.parse(JSON.stringify(qc[eachQcKey]))
				eachQc[MetadataModel.QcProperties.D_TABLE_COLLECTION_UID] = tableCollectionUid
				eachQc[MetadataModel.QcProperties.D_FIELD_COLUMN_NAME] = fieldColumnName

				const newQcKey = eachQcKey.replace(qcKey, `${viewDataSearch.dataQCKey.qcKey}${MetadataModel.ARRAY_INDEX_PLACEHOLDER}`)

				newQueryConditions[newQueryConditionIndex][newQcKey] = eachQc
			}
		}
	}

	return newQueryConditions.filter((value) => Object.keys(value).length > 0)
}

export function InsertNewQueryConditionToQueryConditions(currQcs: MetadataModel.QueryConditions[], newQcs: MetadataModel.QueryConditions[]) {
	if (Array.isArray(currQcs) && currQcs.length > 0) {
		return (JSON.parse(JSON.stringify(currQcs)) as MetadataModel.QueryConditions[])
			.map((cqcs) => {
				for (const newQc of newQcs) {
					let unappendedNewQcKeys = Object.keys(newQc)
					for (const cqcsKey of Object.keys(cqcs)) {
						for (const newQcKey of Object.keys(newQc)) {
							if (unappendedNewQcKeys.includes(newQcKey)) {
								if (cqcsKey === newQcKey) {
									if (newQc[newQcKey][MetadataModel.QcProperties.D_FULL_TEXT_SEARCH_QUERY]) {
										if (cqcs[newQcKey][MetadataModel.QcProperties.D_FULL_TEXT_SEARCH_QUERY]) {
											cqcs[newQcKey][MetadataModel.QcProperties.D_FULL_TEXT_SEARCH_QUERY] =
												cqcs[newQcKey][MetadataModel.QcProperties.D_FULL_TEXT_SEARCH_QUERY] +
												' ' +
												newQc[newQcKey][MetadataModel.QcProperties.D_FULL_TEXT_SEARCH_QUERY]
										} else {
											cqcs[newQcKey][MetadataModel.QcProperties.D_FULL_TEXT_SEARCH_QUERY] =
												newQc[newQcKey][MetadataModel.QcProperties.D_FULL_TEXT_SEARCH_QUERY]
										}
									}
									if (newQc[newQcKey][MetadataModel.QcProperties.FG_FILTER_CONDITION]) {
										if (
											Array.isArray(cqcs[newQcKey][MetadataModel.QcProperties.FG_FILTER_CONDITION]) &&
											cqcs[newQcKey][MetadataModel.QcProperties.FG_FILTER_CONDITION].length > 0
										) {
											cqcs[newQcKey][MetadataModel.QcProperties.FG_FILTER_CONDITION] = cqcs[newQcKey][
												MetadataModel.QcProperties.FG_FILTER_CONDITION
											].map((orFilterConditions) => {
												newQc[newQcKey][MetadataModel.QcProperties.FG_FILTER_CONDITION]?.forEach((ofc) => {
													orFilterConditions = [...orFilterConditions, ...ofc]
												})

												return orFilterConditions
											})
										} else {
											cqcs[newQcKey][MetadataModel.QcProperties.FG_FILTER_CONDITION] = newQc[newQcKey][MetadataModel.QcProperties.FG_FILTER_CONDITION]
										}
									}
									unappendedNewQcKeys = unappendedNewQcKeys.filter((unqck) => unqck !== newQcKey)
								}
							}
						}
					}

					unappendedNewQcKeys.forEach((unqck) => (cqcs[unqck] = newQc[unqck]))
				}

				return cqcs
			})
			.filter((value) => Object.keys(value).length > 0)
	}

	return newQcs.filter((value) => Object.keys(value).length > 0)
}

export interface FieldGroupQueryProperties {
	qcKey: string
	fieldGroup: any
}

export function GetQueryKeyFromFieldGroupKey(fieldGroupKey: string) {
	return fieldGroupKey.replace(MetadataModel.GROUP_FIELDS_PATH_REGEX_SEARCH, '').replace(new RegExp(MetadataModel.GROUP_FIELDS_REGEX_SEARCH, 'g'), '')
}

export function GetGroupQueryPropertiesByDatabaseProperties(
	metadatamodel: any,
	tableCollectionName: string,
	joinDepth: number
): FieldGroupQueryProperties | undefined {
	if (
		joinDepth === metadatamodel[MetadataModel.FgProperties.DATABASE_JOIN_DEPTH] &&
		tableCollectionName === metadatamodel[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_NAME]
	) {
		const fieldGroupKey = metadatamodel[MetadataModel.FgProperties.FIELD_GROUP_KEY]
		if (fieldGroupKey) {
			return {
				qcKey: GetQueryKeyFromFieldGroupKey(fieldGroupKey),
				fieldGroup: JSON.parse(JSON.stringify(metadatamodel))
			}
		}

		return undefined
	}

	let value: FieldGroupQueryProperties | undefined = undefined

	MetadataModel.ForEachFieldGroup(metadatamodel, (property: any) => {
		const fieldGroupKey = property[MetadataModel.FgProperties.FIELD_GROUP_KEY]

		if (typeof fieldGroupKey === 'string') {
			if (property[MetadataModel.FgProperties.DATABASE_JOIN_DEPTH] !== joinDepth) {
				return
			}

			if (property[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_NAME] !== tableCollectionName) {
				return
			}

			value = {
				qcKey: GetQueryKeyFromFieldGroupKey(fieldGroupKey),
				fieldGroup: JSON.parse(JSON.stringify(property))
			}

			return true
		}
	})

	return value
}

export function GetFieldQueryPropertiesByDatabaseProperties(
	metadatamodel: any,
	fieldColumnName: string,
	tableCollectionName: string,
	joinDepth: number
): FieldGroupQueryProperties | undefined {
	let value: FieldGroupQueryProperties | undefined = undefined

	MetadataModel.ForEachFieldGroup(metadatamodel, (property: any) => {
		const fieldGroupKey = property[MetadataModel.FgProperties.FIELD_GROUP_KEY]

		if (typeof fieldGroupKey === 'string') {
			if (property[MetadataModel.FgProperties.DATABASE_JOIN_DEPTH] !== joinDepth) {
				return
			}

			if (property[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_NAME] !== tableCollectionName) {
				return
			}

			if (fieldColumnName !== property[MetadataModel.FgProperties.DATABASE_FIELD_COLUMN_NAME]) {
				return
			}

			value = {
				qcKey: GetQueryKeyFromFieldGroupKey(fieldGroupKey),
				fieldGroup: JSON.parse(JSON.stringify(property))
			}

			return true
		}
	})

	return value
}
