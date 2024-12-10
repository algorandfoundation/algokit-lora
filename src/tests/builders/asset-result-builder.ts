import { AssetResult } from '@/features/assets/data/types'
import { randomBigInt } from '@/utils/random-bigint'
import { DataBuilder, dossierProxy, randomNumber, randomString } from '@makerx/ts-dossier'

export class AssetResultBuilder extends DataBuilder<AssetResult> {
  constructor(initialState?: AssetResult) {
    super(
      initialState
        ? initialState
        : {
            index: randomBigInt(),
            params: {
              creator: randomString(52, 52),
              total: randomBigInt(),
              decimals: randomNumber(),
            },
          }
    )
  }
}

export const assetResultBuilder = dossierProxy<AssetResultBuilder, AssetResult>(AssetResultBuilder)
