import { AssetResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { DataBuilder, dossierProxy, randomNumber, randomString } from '@makerx/ts-dossier'

export class AssetResultBuilder extends DataBuilder<AssetResult> {
  constructor(initialState?: AssetResult) {
    super(
      initialState
        ? initialState
        : {
            index: randomNumber(),
            params: {
              creator: randomString(52, 52),
              total: randomNumber(),
              decimals: randomNumber(),
            },
          }
    )
  }
}

export const assetResultBuilder = dossierProxy<AssetResultBuilder, AssetResult>(AssetResultBuilder)
