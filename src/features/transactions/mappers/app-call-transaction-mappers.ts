import {
  AccessListItem,
  AccessListItemType,
  AppCallOnComplete,
  AppCallTransaction,
  AppCallTransactionSubType,
  BaseAppCallTransaction,
  InnerAppCallTransaction,
  TransactionType,
} from '../models'
import { ResourceRef } from '@algorandfoundation/algokit-utils/indexer-client'
import { DecodedAbiMethod } from '@/features/abi-methods/models'
import { invariant } from '@/utils/invariant'
import { asInnerTransactionId, mapCommonTransactionProperties } from './transaction-common-properties-mappers'
import { TransactionType as UtilsTransactionType } from '@algorandfoundation/algokit-utils/transact'
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

export const mapAccessList = (access: ResourceRef[] | undefined, applicationId: bigint): AccessListItem[] => {
  if (!access || access.length === 0) {
    return []
  }

  const isEmptyRef = (ref: ResourceRef) =>
    ref.address === undefined &&
    ref.applicationId === undefined &&
    ref.assetId === undefined &&
    ref.box === undefined &&
    ref.holding === undefined &&
    ref.local === undefined

  return access.map((ref): AccessListItem => {
    if (isEmptyRef(ref)) {
      return {
        type: AccessListItemType.Empty,
      }
    }
    if (ref.address !== undefined) {
      return {
        type: AccessListItemType.Account,
        address: ref.address.toString(),
      }
    }
    if (ref.applicationId !== undefined) {
      return {
        type: AccessListItemType.App,
        applicationId: ref.applicationId,
      }
    }
    if (ref.assetId !== undefined) {
      return {
        type: AccessListItemType.Asset,
        assetId: ref.assetId,
      }
    }
    if (ref.box !== undefined) {
      return {
        type: AccessListItemType.Box,
        applicationId: ref.box.app === 0n ? applicationId : ref.box.app,
        name: uint8ArrayToBase64(ref.box.name),
      }
    }
    if (ref.holding !== undefined) {
      return {
        type: AccessListItemType.Holding,
        address: ref.holding.address.toString(),
        assetId: ref.holding.asset,
      }
    }
    if (ref.local !== undefined) {
      return {
        type: AccessListItemType.Locals,
        address: ref.local.address.toString(),
        applicationId: ref.local.app === 0n ? applicationId : ref.local.app,
      }
    }
    throw new Error('Unsupported ResourceRef type')
  })
}

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
  const applicationId = transactionResult.applicationTransaction.applicationId ?? transactionResult.createdAppId ?? 0n
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
    subType: isCreate
      ? AppCallTransactionSubType.Create
      : onCompletion === AppCallOnComplete.Update
        ? AppCallTransactionSubType.Update
        : undefined,
    isOpUp,
    applicationId,
    applicationArgs: transactionResult.applicationTransaction.applicationArgs?.map((a) => uint8ArrayToBase64(a)) ?? [],
    applicationAccounts: transactionResult.applicationTransaction.accounts?.map((a) => a.toString()) ?? [],
    foreignApps: transactionResult.applicationTransaction.foreignApps ?? [],
    foreignAssets: transactionResult.applicationTransaction.foreignAssets ?? [],
    accessList: mapAccessList(transactionResult.applicationTransaction.access, applicationId),
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
    rejectVersion: transactionResult.applicationTransaction.rejectVersion,
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
  if (transactionResult.txType === UtilsTransactionType.Payment) {
    return asInnerPaymentTransaction(networkTransactionId, index, transactionResult)
  }
  if (transactionResult.txType === UtilsTransactionType.AssetTransfer) {
    return asInnerAssetTransferTransaction(networkTransactionId, index, transactionResult, assetResolver)
  }
  if (transactionResult.txType === UtilsTransactionType.AppCall) {
    return asInnerAppCallTransaction(networkTransactionId, index, transactionResult, assetResolver, abiMethodResolver, groupResolver)
  }
  if (transactionResult.txType === UtilsTransactionType.AssetConfig) {
    return asInnerAssetConfigTransaction(networkTransactionId, index, transactionResult)
  }
  if (transactionResult.txType === UtilsTransactionType.AssetFreeze) {
    return asInnerAssetFreezeTransaction(networkTransactionId, index, transactionResult, assetResolver)
  }
  if (transactionResult.txType === UtilsTransactionType.KeyRegistration) {
    return asInnerKeyRegTransaction(networkTransactionId, index, transactionResult)
  }

  throw new Error(`Unsupported inner transaction type: ${transactionResult.txType}`)
}
