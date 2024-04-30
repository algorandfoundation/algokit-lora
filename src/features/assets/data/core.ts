import { AssetResult, TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { AssetIndex } from './types'
import { atom } from 'jotai'
import { ZERO_ADDRESS } from '@/features/common/constants'
import { Arc19Metadata, Arc3Metadata, Arc69Metadata } from '../models'

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

export const assetMetadataMapAtom = atom<Map<AssetIndex, Arc3Metadata | Arc19Metadata | Arc69Metadata | undefined>>(new Map())

export const assetConfigTransactionResultsAtom = atom<Map<AssetIndex, TransactionResult[]>>(new Map())
