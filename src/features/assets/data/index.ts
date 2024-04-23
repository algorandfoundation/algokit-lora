import { atom } from 'jotai'
import { AssetResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { AssetIndex } from './types'
import { ZERO_ADDRESS } from '@/features/common/constants'
export * from './types'
export * from './asset'

// TODO: Size should be capped at some limit, so memory usage doesn't grow indefinitely

export const algoAssetResult = {
  index: 0,
  'created-at-round': 0,
  params: {
    creator: ZERO_ADDRESS,
    decimals: 6,
    total: 10_000_000_000,
    name: 'ALGO',
    'unit-name': 'ALGO',
    url: 'https://www.algorand.foundation',
  },
} as AssetResult

export const assetsAtom = atom<Map<AssetIndex, AssetResult>>(new Map([[algoAssetResult.index, algoAssetResult]]))
