import { ApplicationOnComplete, TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import {
  AppCallOnComplete,
  AppCallTransaction,
  AppCallTransactionSubType,
  BaseAppCallTransaction,
  InnerAppCallTransaction,
  TransactionType,
} from '../models'
import { invariant } from '@/utils/invariant'
import { asGlobalStateDelta, asLocalStateDelta } from './state-delta-mappers'
import { asInnerTransactionId, mapCommonTransactionProperties } from './transaction-common-properties-mappers'
import { TransactionType as AlgoSdkTransactionType } from 'algosdk'
import { asInnerPaymentTransaction } from './payment-transaction-mappers'
import { asInnerAssetTransferTransaction } from './asset-transfer-transaction-mappers'
import { AssetSummary } from '@/features/assets/models'
import { asInnerAssetConfigTransaction } from './asset-config-transaction-mappers'
import { asInnerAssetFreezeTransaction } from './asset-freeze-transaction-mappers'
import { asInnerKeyRegTransaction } from './key-reg-transaction-mappers'
import { AsyncMaybeAtom } from '@/features/common/data/types'
import { asInnerStateProofTransaction } from './state-proof-transaction-mappers'
import { Atom } from 'jotai/index'
import { AbiMethod } from '@/features/abi-methods/models'
import { GroupId, GroupResult } from '@/features/groups/data/types'
import { Round } from '@/features/blocks/data/types'

const opUpPrograms = [
  'A4EB', // #pragma version 3\npushint 1\n // First version pushint was available
  'BIEB', // #pragma version 4\npushint 1\n
  'BYEB', // #pragma version 5\npushint 1\n
  'BoEB', // #pragma version 6\npushint 1\n
  'B4EB', // #pragma version 7\npushint 1\n
  'CIEB', // #pragma version 8\npushint 1\n
  'CYEB', // #pragma version 9\npushint 1\n
  'CoEB', // #pragma version 10\npushint 1\n // Latest version at the time this was added, however pre-calculated a few more versions
  'C4EB', // #pragma version 11\npushint 1\n
  'DIEB', // #pragma version 12\npushint 1\n
  'DYEB', // #pragma version 13\npushint 1\n
  'DoEB', // #pragma version 14\npushint 1\n
  'D4EB', // #pragma version 15\npushint 1\n
]

const mapCommonAppCallTransactionProperties = (
  networkTransactionId: string,
  transactionResult: TransactionResult,
  assetResolver: (assetId: number) => AsyncMaybeAtom<AssetSummary>,
  abiMethodResolver: (
    transactionResult: TransactionResult,
    groupResolver: (groupId: GroupId, round: Round) => Atom<Promise<GroupResult>>
  ) => Atom<Promise<AbiMethod | undefined>>,
  groupResolver: (groupId: GroupId, round: Round) => Atom<Promise<GroupResult>>,
  indexPrefix?: string
) => {
  invariant(transactionResult['application-transaction'], 'application-transaction is not set')
  const isCreate = !transactionResult['application-transaction']['application-id']
  const onCompletion = asAppCallOnComplete(transactionResult['application-transaction']['on-completion'])
  const isOpUp =
    isCreate &&
    onCompletion === AppCallOnComplete.Delete &&
    opUpPrograms.includes(transactionResult['application-transaction']['approval-program']) &&
    opUpPrograms.includes(transactionResult['application-transaction']['clear-state-program'])
  const abiMethod = abiMethodResolver(transactionResult, groupResolver)

  return {
    ...mapCommonTransactionProperties(transactionResult),
    type: TransactionType.AppCall,
    subType: isCreate ? AppCallTransactionSubType.Create : undefined,
    isOpUp,
    applicationId: transactionResult['application-transaction']['application-id']
      ? transactionResult['application-transaction']['application-id']
      : transactionResult['created-application-index']!,
    applicationArgs: transactionResult['application-transaction']['application-args'] ?? [],
    applicationAccounts: transactionResult['application-transaction'].accounts ?? [],
    foreignApps: transactionResult['application-transaction']['foreign-apps'] ?? [],
    foreignAssets: transactionResult['application-transaction']['foreign-assets'] ?? [],
    globalStateDeltas: asGlobalStateDelta(transactionResult['global-state-delta']),
    localStateDeltas: asLocalStateDelta(transactionResult['local-state-delta']),
    innerTransactions:
      transactionResult['inner-txns']?.map((innerTransaction, index) => {
        // Generate a unique id for the inner transaction
        const innerId = indexPrefix ? `${indexPrefix}/${index + 1}` : `${index + 1}`
        return asInnerTransaction(networkTransactionId, innerId, innerTransaction, assetResolver, abiMethodResolver, groupResolver)
      }) ?? [],
    onCompletion,
    logs: transactionResult['logs'] ?? [],
    abiMethod,
  } satisfies BaseAppCallTransaction
}

export const asAppCallTransaction = (
  transactionResult: TransactionResult,
  assetResolver: (assetId: number) => AsyncMaybeAtom<AssetSummary>,
  abiMethodResolver: (
    transactionResult: TransactionResult,
    groupResolver: (groupId: GroupId, round: Round) => Atom<Promise<GroupResult>>
  ) => Atom<Promise<AbiMethod | undefined>>,
  groupResolver: (groupId: GroupId, round: Round) => Atom<Promise<GroupResult>>
): AppCallTransaction => {
  const commonProperties = mapCommonAppCallTransactionProperties(
    transactionResult.id,
    transactionResult,
    assetResolver,
    abiMethodResolver,
    groupResolver
  )

  return {
    id: transactionResult.id,
    ...commonProperties,
  }
}

export const asInnerAppCallTransaction = (
  networkTransactionId: string,
  index: string,
  transactionResult: TransactionResult,
  assetResolver: (assetId: number) => AsyncMaybeAtom<AssetSummary>,
  abiMethodResolver: (
    transactionResult: TransactionResult,
    groupResolver: (groupId: GroupId, round: Round) => Atom<Promise<GroupResult>>
  ) => Atom<Promise<AbiMethod | undefined>>,
  groupResolver: (groupId: GroupId, round: Round) => Atom<Promise<GroupResult>>
): InnerAppCallTransaction => {
  return {
    ...asInnerTransactionId(networkTransactionId, index),
    ...mapCommonAppCallTransactionProperties(
      networkTransactionId,
      transactionResult,
      assetResolver,
      abiMethodResolver,
      groupResolver,
      `${index}`
    ),
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
  assetResolver: (assetId: number) => AsyncMaybeAtom<AssetSummary>,
  abiMethodResolver: (
    transactionResult: TransactionResult,
    groupResolver: (groupId: GroupId, round: Round) => Atom<Promise<GroupResult>>
  ) => Atom<Promise<AbiMethod | undefined>>,
  groupResolver: (groupId: GroupId, round: Round) => Atom<Promise<GroupResult>>
) => {
  if (transactionResult['tx-type'] === AlgoSdkTransactionType.pay) {
    return asInnerPaymentTransaction(networkTransactionId, index, transactionResult)
  }
  if (transactionResult['tx-type'] === AlgoSdkTransactionType.axfer) {
    return asInnerAssetTransferTransaction(networkTransactionId, index, transactionResult, assetResolver)
  }
  if (transactionResult['tx-type'] === AlgoSdkTransactionType.appl) {
    return asInnerAppCallTransaction(networkTransactionId, index, transactionResult, assetResolver, abiMethodResolver, groupResolver)
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
