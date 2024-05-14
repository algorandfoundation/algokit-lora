import { AssetResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { AssetIndex, AssetMetadataResult } from './types'
import { atom } from 'jotai'
import { ZERO_ADDRESS } from '@/features/common/constants'

export const algoAssetResult = {
  index: 0,
  'created-at-round': 0,
  params: {
    creator: ZERO_ADDRESS,
    decimals: 6,
    total: 10_000_000_000_000_000n,
    name: 'ALGO',
    'unit-name': 'ALGO',
    url: 'https://www.algorand.foundation',
  },
} as AssetResult

export const assetResultsAtom = atom<Map<AssetIndex, AssetResult>>(new Map([[algoAssetResult.index, algoAssetResult]]))

export const assetMetadataAtom = atom<Map<AssetIndex, AssetMetadataResult>>(new Map())
