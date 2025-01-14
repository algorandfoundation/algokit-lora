import { TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import algosdk from 'algosdk'
import { asAppCallTransaction } from './app-call-transaction-mappers'
import { asAssetTransferTransaction } from './asset-transfer-transaction-mappers'
import { asPaymentTransaction } from './payment-transaction-mappers'
import { AssetSummary } from '@/features/assets/models'
import { asAssetConfigTransaction } from './asset-config-transaction-mappers'
import { asAssetFreezeTransaction } from './asset-freeze-transaction-mappers'
import { asStateProofTransaction } from './state-proof-transaction-mappers'
import { asKeyRegTransaction } from './key-reg-transaction-mappers'
import { AsyncMaybeAtom } from '@/features/common/data/types'
import { Atom } from 'jotai/index'
import { GroupId, GroupResult } from '@/features/groups/data/types'
import { Round } from '@/features/blocks/data/types'
import { getGroupResultAtom } from '@/features/groups/data/group-result'
import { DecodedAbiMethod } from '@/features/abi-methods/models'

export const asTransaction = (
  transactionResult: TransactionResult,
  assetResolver: (assetId: number) => AsyncMaybeAtom<AssetSummary>,
  abiMethodResolver: (
    transactionResult: TransactionResult,
    groupResolver: (groupId: GroupId, round: Round) => AsyncMaybeAtom<GroupResult>
  ) => Atom<Promise<DecodedAbiMethod | undefined>>,
  groupResolver: (groupId: GroupId, round: Round) => AsyncMaybeAtom<GroupResult> = getGroupResultAtom
) => {
  switch (transactionResult['tx-type']) {
    case algosdk.TransactionType.pay:
      return asPaymentTransaction(transactionResult)
    case algosdk.TransactionType.axfer: {
      return asAssetTransferTransaction(transactionResult, assetResolver)
    }
    case algosdk.TransactionType.appl: {
      return asAppCallTransaction(transactionResult, assetResolver, abiMethodResolver, groupResolver)
    }
    case algosdk.TransactionType.acfg: {
      return asAssetConfigTransaction(transactionResult)
    }
    case algosdk.TransactionType.afrz: {
      return asAssetFreezeTransaction(transactionResult, assetResolver)
    }
    case algosdk.TransactionType.stpf: {
      return asStateProofTransaction(transactionResult)
    }
    case algosdk.TransactionType.keyreg: {
      return asKeyRegTransaction(transactionResult)
    }
    default:
      throw new Error(`Unknown transaction type ${transactionResult['tx-type']}`)
  }
}
