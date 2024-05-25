import { ApplicationOnComplete, TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { AppCallOnComplete, AppCallTransaction, BaseAppCallTransaction, InnerAppCallTransaction, TransactionType } from '../models'
import { invariant } from '@/utils/invariant'
import { IndexerGlobalStateDelta, IndexerLocalStateDelta, asGlobalStateDelta, asLocalStateDelta } from './state-delta-mappers'
import { mapCommonTransactionProperties, asInnerTransactionId, undefinedSubTypeAtom } from './transaction-common-properties-mappers'
import { TransactionType as AlgoSdkTransactionType } from 'algosdk'
import { asInnerPaymentTransaction } from './payment-transaction-mappers'
import { asInnerAssetTransferTransaction } from './asset-transfer-transaction-mappers'
import { AssetSummary } from '@/features/assets/models'
import { asInnerAssetConfigTransaction } from './asset-config-transaction-mappers'
import { asInnerAssetFreezeTransaction } from './asset-freeze-transaction-mappers'
import { asInnerKeyRegTransaction } from './key-reg-transaction-mappers'
import { AsyncMaybeAtom } from '@/features/common/data/types'
import { asInnerStateProofTransaction } from './state-proof-transaction-mappers'

const mapCommonAppCallTransactionProperties = (
  networkTransactionId: string,
  transactionResult: TransactionResult,
  assetResolver: (assetId: number) => AsyncMaybeAtom<AssetSummary>,
  indexPrefix?: string
) => {
  invariant(transactionResult['application-transaction'], 'application-transaction is not set')

  return {
    ...mapCommonTransactionProperties(transactionResult),
    type: TransactionType.ApplicationCall,
    subType: undefinedSubTypeAtom,
    applicationId: transactionResult['application-transaction']['application-id']
      ? transactionResult['application-transaction']['application-id']
      : transactionResult['created-application-index']!,
    applicationArgs: transactionResult['application-transaction']['application-args'] ?? [],
    applicationAccounts: transactionResult['application-transaction'].accounts ?? [],
    foreignApps: transactionResult['application-transaction']['foreign-apps'] ?? [],
    foreignAssets: transactionResult['application-transaction']['foreign-assets'] ?? [],
    globalStateDeltas: asGlobalStateDelta(transactionResult['global-state-delta'] as unknown as IndexerGlobalStateDelta[]),
    localStateDeltas: asLocalStateDelta(transactionResult['local-state-delta'] as unknown as IndexerLocalStateDelta[]),
    innerTransactions:
      transactionResult['inner-txns']?.map((innerTransaction, index) => {
        // Generate a unique id for the inner transaction
        const innerId = indexPrefix ? `${indexPrefix}-${index + 1}` : `${index + 1}`
        return asInnerTransaction(networkTransactionId, innerId, innerTransaction, assetResolver)
      }) ?? [],
    onCompletion: asAppCallOnComplete(transactionResult['application-transaction']['on-completion']),
    action: transactionResult['application-transaction']['application-id'] ? 'Call' : 'Create',
    logs: transactionResult['logs'] ?? [],
  } satisfies BaseAppCallTransaction
}

export const asAppCallTransaction = (
  transactionResult: TransactionResult,
  assetResolver: (assetId: number) => AsyncMaybeAtom<AssetSummary>
): AppCallTransaction => {
  const commonProperties = mapCommonAppCallTransactionProperties(transactionResult.id, transactionResult, assetResolver)

  return {
    id: transactionResult.id,
    ...commonProperties,
  }
}

export const asInnerAppCallTransaction = (
  networkTransactionId: string,
  index: string,
  transactionResult: TransactionResult,
  assetResolver: (assetId: number) => AsyncMaybeAtom<AssetSummary>
): InnerAppCallTransaction => {
  return {
    ...asInnerTransactionId(networkTransactionId, index),
    ...mapCommonAppCallTransactionProperties(networkTransactionId, transactionResult, assetResolver, `${index}`),
  }
}

const asAppCallOnComplete = (indexerEnum: ApplicationOnComplete): AppCallOnComplete => {
  switch (indexerEnum) {
    case ApplicationOnComplete.noop:
      return AppCallOnComplete.NoOp
    case ApplicationOnComplete.optin:
      return AppCallOnComplete.OptIn
    case ApplicationOnComplete.closeout:
      return AppCallOnComplete.CloseOut
    case ApplicationOnComplete.clear:
      return AppCallOnComplete.ClearState
    case ApplicationOnComplete.update:
      return AppCallOnComplete.Update
    case ApplicationOnComplete.delete:
      return AppCallOnComplete.Delete
  }
}

const asInnerTransaction = (
  networkTransactionId: string,
  index: string,
  transactionResult: TransactionResult,
  assetResolver: (assetId: number) => AsyncMaybeAtom<AssetSummary>
) => {
  if (transactionResult['tx-type'] === AlgoSdkTransactionType.pay) {
    return asInnerPaymentTransaction(networkTransactionId, index, transactionResult)
  }
  if (transactionResult['tx-type'] === AlgoSdkTransactionType.axfer) {
    return asInnerAssetTransferTransaction(networkTransactionId, index, transactionResult, assetResolver)
  }
  if (transactionResult['tx-type'] === AlgoSdkTransactionType.appl) {
    return asInnerAppCallTransaction(networkTransactionId, index, transactionResult, assetResolver)
  }
  if (transactionResult['tx-type'] === AlgoSdkTransactionType.acfg) {
    return asInnerAssetConfigTransaction(networkTransactionId, index, transactionResult)
  }
  if (transactionResult['tx-type'] === AlgoSdkTransactionType.afrz) {
    return asInnerAssetFreezeTransaction(networkTransactionId, index, transactionResult, assetResolver)
  }
  if (transactionResult['tx-type'] === AlgoSdkTransactionType.keyreg) {
    return asInnerKeyRegTransaction(networkTransactionId, index, transactionResult)
  }
  // I don't believe it's possible to have an inner stpf transaction, handling just in case.
  if (transactionResult['tx-type'] === AlgoSdkTransactionType.stpf) {
    return asInnerStateProofTransaction(networkTransactionId, index, transactionResult)
  }

  throw new Error(`Unsupported inner transaction type: ${transactionResult['tx-type']}`)
}
