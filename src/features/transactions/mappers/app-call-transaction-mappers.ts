import {
  AppCallOnComplete,
  AppCallTransaction,
  AppCallTransactionSubType,
  BaseAppCallTransaction,
  InnerAppCallTransaction,
  TransactionType,
} from '../models'
import { DecodedAbiMethod } from '@/features/abi-methods/models'
import { invariant } from '@/utils/invariant'
import { asInnerTransactionId, mapCommonTransactionProperties } from './transaction-common-properties-mappers'
import { TransactionType as AlgoSdkTransactionType } from 'algosdk'
import { asInnerPaymentTransaction } from './payment-transaction-mappers'
import { asInnerAssetTransferTransaction } from './asset-transfer-transaction-mappers'
import { AssetSummary } from '@/features/assets/models'
import { asInnerAssetConfigTransaction } from './asset-config-transaction-mappers'
import { asInnerAssetFreezeTransaction } from './asset-freeze-transaction-mappers'
import { asInnerKeyRegTransaction } from './key-reg-transaction-mappers'
import { AsyncMaybeAtom } from '@/features/common/data/types'
import { Atom } from 'jotai/index'
import { GroupId, GroupResult } from '@/features/groups/data/types'
import { Round } from '@/features/blocks/data/types'
import { globalStateDeltaResolver } from '../data/global-state-delta-resolver'
import { localStateDeltaResolver } from '../data/local-state-delta-resolver'
import { TransactionResult } from '../data/types'
import { AssetId } from '@/features/assets/data/types'
import { uint8ArrayToBase64 } from '@/utils/uint8-array-to-base64'

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
  assetResolver: (assetId: AssetId) => AsyncMaybeAtom<AssetSummary>,
  abiMethodResolver: (
    transactionResult: TransactionResult,
    groupResolver: (groupId: GroupId, round: Round) => AsyncMaybeAtom<GroupResult>
  ) => Atom<Promise<DecodedAbiMethod | undefined>>,
  groupResolver: (groupId: GroupId, round: Round) => AsyncMaybeAtom<GroupResult>,
  indexPrefix?: string
) => {
  invariant(transactionResult.applicationTransaction, 'application-transaction is not set')
  const isCreate = !transactionResult.applicationTransaction.applicationId
  const onCompletion = asAppCallOnComplete(transactionResult.applicationTransaction.onCompletion)
  const isOpUp =
    isCreate &&
    onCompletion === AppCallOnComplete.Delete &&
    !!transactionResult.applicationTransaction.approvalProgram &&
    !!transactionResult.applicationTransaction.clearStateProgram &&
    opUpPrograms.includes(uint8ArrayToBase64(transactionResult.applicationTransaction.approvalProgram)) &&
    opUpPrograms.includes(uint8ArrayToBase64(transactionResult.applicationTransaction.clearStateProgram))
  const abiMethod = abiMethodResolver(transactionResult, groupResolver)

  return {
    ...mapCommonTransactionProperties(transactionResult),
    type: TransactionType.AppCall,
    subType: isCreate ? AppCallTransactionSubType.Create : undefined,
    isOpUp,
    applicationId: transactionResult.applicationTransaction.applicationId
      ? transactionResult.applicationTransaction.applicationId
      : transactionResult.createdApplicationIndex!,
    applicationArgs: transactionResult.applicationTransaction.applicationArgs?.map((a) => uint8ArrayToBase64(a)) ?? [],
    applicationAccounts: transactionResult.applicationTransaction.accounts?.map((a) => a.toString()) ?? [],
    foreignApps: transactionResult.applicationTransaction.foreignApps ?? [],
    foreignAssets: transactionResult.applicationTransaction.foreignAssets ?? [],
    globalStateDeltas: globalStateDeltaResolver(transactionResult),
    localStateDeltas: localStateDeltaResolver(transactionResult),
    innerTransactions:
      transactionResult.innerTxns?.map((innerTransaction, index) => {
        // Generate a unique id for the inner transaction
        const innerId = indexPrefix ? `${indexPrefix}/${index + 1}` : `${index + 1}`
        return asInnerTransaction(networkTransactionId, innerId, innerTransaction, assetResolver, abiMethodResolver, groupResolver)
      }) ?? [],
    onCompletion,
    logs: transactionResult.logs?.map((l) => uint8ArrayToBase64(l)) ?? [],
    abiMethod,
  } satisfies BaseAppCallTransaction
}

export const asAppCallTransaction = (
  transactionResult: TransactionResult,
  assetResolver: (assetId: AssetId) => AsyncMaybeAtom<AssetSummary>,
  abiMethodResolver: (
    transactionResult: TransactionResult,
    groupResolver: (groupId: GroupId, round: Round) => AsyncMaybeAtom<GroupResult>
  ) => Atom<Promise<DecodedAbiMethod | undefined>>,
  groupResolver: (groupId: GroupId, round: Round) => AsyncMaybeAtom<GroupResult>
): AppCallTransaction => {
  const commonProperties = mapCommonAppCallTransactionProperties(
    transactionResult.id!,
    transactionResult,
    assetResolver,
    abiMethodResolver,
    groupResolver
  )

  return {
    id: transactionResult.id!,
    ...commonProperties,
  }
}

export const asInnerAppCallTransaction = (
  networkTransactionId: string,
  index: string,
  transactionResult: TransactionResult,
  assetResolver: (assetId: AssetId) => AsyncMaybeAtom<AssetSummary>,
  abiMethodResolver: (
    transactionResult: TransactionResult,
    groupResolver: (groupId: GroupId, round: Round) => AsyncMaybeAtom<GroupResult>
  ) => Atom<Promise<DecodedAbiMethod | undefined>>,
  groupResolver: (groupId: GroupId, round: Round) => AsyncMaybeAtom<GroupResult>
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

const asAppCallOnComplete = (onComplete?: string): AppCallOnComplete => {
  switch (onComplete) {
    case 'noop':
      return AppCallOnComplete.NoOp
    case 'optin':
      return AppCallOnComplete.OptIn
    case 'closeout':
      return AppCallOnComplete.CloseOut
    case 'clear':
      return AppCallOnComplete.ClearState
    case 'update':
      return AppCallOnComplete.Update
    case 'delete':
      return AppCallOnComplete.Delete
    default:
      throw new Error(`Unsupported on-complete value: ${onComplete}`)
  }
}

const asInnerTransaction = (
  networkTransactionId: string,
  index: string,
  transactionResult: TransactionResult,
  assetResolver: (assetId: AssetId) => AsyncMaybeAtom<AssetSummary>,
  abiMethodResolver: (
    transactionResult: TransactionResult,
    groupResolver: (groupId: GroupId, round: Round) => AsyncMaybeAtom<GroupResult>
  ) => Atom<Promise<DecodedAbiMethod | undefined>>,
  groupResolver: (groupId: GroupId, round: Round) => AsyncMaybeAtom<GroupResult>
) => {
  if (transactionResult.txType === AlgoSdkTransactionType.pay) {
    return asInnerPaymentTransaction(networkTransactionId, index, transactionResult)
  }
  if (transactionResult.txType === AlgoSdkTransactionType.axfer) {
    return asInnerAssetTransferTransaction(networkTransactionId, index, transactionResult, assetResolver)
  }
  if (transactionResult.txType === AlgoSdkTransactionType.appl) {
    return asInnerAppCallTransaction(networkTransactionId, index, transactionResult, assetResolver, abiMethodResolver, groupResolver)
  }
  if (transactionResult.txType === AlgoSdkTransactionType.acfg) {
    return asInnerAssetConfigTransaction(networkTransactionId, index, transactionResult)
  }
  if (transactionResult.txType === AlgoSdkTransactionType.afrz) {
    return asInnerAssetFreezeTransaction(networkTransactionId, index, transactionResult, assetResolver)
  }
  if (transactionResult.txType === AlgoSdkTransactionType.keyreg) {
    return asInnerKeyRegTransaction(networkTransactionId, index, transactionResult)
  }

  throw new Error(`Unsupported inner transaction type: ${transactionResult.txType}`)
}
