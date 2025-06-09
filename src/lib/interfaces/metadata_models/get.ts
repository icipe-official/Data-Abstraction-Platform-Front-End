import { MetadataModel, type Domain } from '$lib'

export class GetMetadataModel implements Domain.Interfaces.MetadataModels.Get {
	cachemetadatamodels: { [key: string]: string } = {}

	async GetMetadataModel(
		fieldAnyMetatadaModel: Domain.Interfaces.MetadataModels.IFieldAnyGetMetadataModel,
		actionID: string,
		currentFgKey: string,
		tableCollectionUid: string,
		argument: any
	) {
		const pathToCachedMetadataModel = this.GetPathToCachedMetadataModel(actionID, currentFgKey, tableCollectionUid, argument)

		if (this.cachemetadatamodels[pathToCachedMetadataModel]) {
			return JSON.parse(this.cachemetadatamodels[pathToCachedMetadataModel])
		}
		const mm = await fieldAnyMetatadaModel.GetMetadataModel(actionID, currentFgKey, tableCollectionUid, argument)
		if (typeof mm !== 'object' || Array.isArray(mm) || mm === null) {
			return undefined
		}

		this.cachemetadatamodels[pathToCachedMetadataModel] = this._changeMetadataModelFgKeyTableCollectionUid(mm, currentFgKey, tableCollectionUid)

		return JSON.parse(this.cachemetadatamodels[pathToCachedMetadataModel])
	}

	GetPathToCachedMetadataModel(actionID: string, currentFgKey: string, tableCollectionUid: string, argument: any) {
		return actionID + '/' + (Array.isArray(argument) ? argument.join('/') : `${argument}`) + currentFgKey + '/' + tableCollectionUid + '/'
	}

	private _changeMetadataModelFgKeyTableCollectionUid(metadataModel: any, currentFgKey: string, tableCollectionUid: string) {
		metadataModel[MetadataModel.FgProperties.FIELD_GROUP_KEY] = currentFgKey
		metadataModel[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_UID] = tableCollectionUid
		return JSON.stringify(
			MetadataModel.MapFieldGroups(metadataModel, (property: any) => {
				if (tableCollectionUid.length > 0) {
					property[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_UID] = tableCollectionUid
				}
				if (typeof property[MetadataModel.FgProperties.FIELD_GROUP_KEY] === 'string') {
					property[MetadataModel.FgProperties.FIELD_GROUP_KEY] = property[MetadataModel.FgProperties.FIELD_GROUP_KEY].replace('$', currentFgKey)
				}

				return property
			})
		)
	}
}
