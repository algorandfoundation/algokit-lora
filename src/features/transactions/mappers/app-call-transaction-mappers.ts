import { ApplicationOnComplete, TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import {
  AppCallABIMethod,
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
import algosdk, { TransactionType as AlgoSdkTransactionType } from 'algosdk'
import { asInnerPaymentTransaction } from './payment-transaction-mappers'
import { asInnerAssetTransferTransaction } from './asset-transfer-transaction-mappers'
import { AssetSummary } from '@/features/assets/models'
import { asInnerAssetConfigTransaction } from './asset-config-transaction-mappers'
import { asInnerAssetFreezeTransaction } from './asset-freeze-transaction-mappers'
import { asInnerKeyRegTransaction } from './key-reg-transaction-mappers'
import { AsyncMaybeAtom } from '@/features/common/data/types'
import { asInnerStateProofTransaction } from './state-proof-transaction-mappers'
import { uint8ArrayToBase64 } from '@/utils/uint8-array-to-base64'
import { AppSpec } from '@/features/abi-methods/models'

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
  appSpecResolver: (applicationId: number) => AppSpec | undefined,
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
  const appSpec = appSpecResolver(transactionResult['application-transaction']['application-id'])

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
        return asInnerTransaction(networkTransactionId, innerId, innerTransaction, assetResolver, appSpecResolver)
      }) ?? [],
    onCompletion,
    logs: transactionResult['logs'] ?? [],
    abiMethod: getABIMethods(appSpec, transactionResult['application-transaction']['application-args'] ?? []),
  } satisfies BaseAppCallTransaction
}

const getABIMethods = (appSpec: AppSpec | undefined, transactionArgs: string[]): AppCallABIMethod | undefined => {
  // Currently we only support ARC-32
  if (!appSpec) return undefined
  let arc32: algosdk.ABIMethod | undefined = undefined

  if (transactionArgs.length && appSpec.arc32) {
    const methodContract = appSpec.arc32.contract.methods.find((m) => {
      const abiMethod = new algosdk.ABIMethod(m)
      return uint8ArrayToBase64(abiMethod.getSelector()) === transactionArgs[0]
    })
    if (methodContract) arc32 = new algosdk.ABIMethod(methodContract)
  }

  if (arc32) return { arc32 }
  return undefined
}

export const asAppCallTransaction = (
  transactionResult: TransactionResult,
  assetResolver: (assetId: number) => AsyncMaybeAtom<AssetSummary>,
  appSpecResolver: (applicationId: number) => AppSpec | undefined
): AppCallTransaction => {
  const commonProperties = mapCommonAppCallTransactionProperties(transactionResult.id, transactionResult, assetResolver, appSpecResolver)

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
  appSpecResolver: (applicationId: number) => AppSpec | undefined
): InnerAppCallTransaction => {
  return {
    ...asInnerTransactionId(networkTransactionId, index),
    ...mapCommonAppCallTransactionProperties(networkTransactionId, transactionResult, assetResolver, appSpecResolver, `${index}`),
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
  appSpecResolver: (applicationId: number) => AppSpec | undefined
) => {
  if (transactionResult['tx-type'] === AlgoSdkTransactionType.pay) {
    return asInnerPaymentTransaction(networkTransactionId, index, transactionResult)
  }
  if (transactionResult['tx-type'] === AlgoSdkTransactionType.axfer) {
    return asInnerAssetTransferTransaction(networkTransactionId, index, transactionResult, assetResolver)
  }
  if (transactionResult['tx-type'] === AlgoSdkTransactionType.appl) {
    return asInnerAppCallTransaction(networkTransactionId, index, transactionResult, assetResolver, appSpecResolver)
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
