import { TransactionType } from '@algorandfoundation/algokit-utils/transact'
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
import { asHeartbeatTransaction } from './heartbeat-transaction-mappers'
import { TransactionResult } from '../data/types'
import { AssetId } from '@/features/assets/data/types'

export const asTransaction = (
  transactionResult: TransactionResult,
  assetResolver: (assetId: AssetId) => AsyncMaybeAtom<AssetSummary>,
  abiMethodResolver: (
    transactionResult: TransactionResult,
    groupResolver: (groupId: GroupId, round: Round) => AsyncMaybeAtom<GroupResult>
  ) => Atom<Promise<DecodedAbiMethod | undefined>>,
  groupResolver: (groupId: GroupId, round: Round) => AsyncMaybeAtom<GroupResult> = getGroupResultAtom
) => {
  switch (transactionResult.txType) {
    case TransactionType.Payment:
      return asPaymentTransaction(transactionResult)
    case TransactionType.AssetTransfer: {
      return asAssetTransferTransaction(transactionResult, assetResolver)
    }
    case TransactionType.AppCall: {
      return asAppCallTransaction(transactionResult, assetResolver, abiMethodResolver, groupResolver)
    }
    case TransactionType.AssetConfig: {
      return asAssetConfigTransaction(transactionResult)
    }
    case TransactionType.AssetFreeze: {
      return asAssetFreezeTransaction(transactionResult, assetResolver)
    }
    case TransactionType.StateProof: {
      return asStateProofTransaction(transactionResult)
    }
    case TransactionType.KeyRegistration: {
      return asKeyRegTransaction(transactionResult)
    }
    case TransactionType.Heartbeat: {
      return asHeartbeatTransaction(transactionResult)
    }
    default:
      throw new Error(`Unknown transaction type ${transactionResult.txType}`)
  }
}
