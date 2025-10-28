import algosdk from '@algorandfoundation/algokit-utils/algosdk_legacy'
import { Expand } from '@/utils/expand'

export type TransactionId = string

export type TransactionResult = Expand<
  Omit<
    algosdk.indexerModels.Transaction,
    | 'id'
    | 'getEncodingSchema'
    | 'toEncodingData'
    | 'signature'
    | 'paymentTransaction'
    | 'assetTransferTransaction'
    | 'applicationTransaction'
    | 'assetConfigTransaction'
    | 'innerTxns'
    | 'localStateDelta'
    | 'globalStateDelta'
    | 'assetFreezeTransaction'
    | 'keyregTransaction'
    | 'heartbeatTransaction'
  > & {
    id: TransactionId
    signature?: TransactionSignature
    paymentTransaction?: TransactionPayment
    assetTransferTransaction?: TransactionAssetTransfer
    applicationTransaction?: TransactionApplication
    assetConfigTransaction?: TransactionAssetConfig
    innerTxns?: TransactionResult[]
    localStateDelta?: AccountStateDelta[]
    globalStateDelta?: EvalDeltaKeyValue[]
    assetFreezeTransaction?: TransactionAssetFreeze
    keyregTransaction?: TransactionKeyreg
    heartbeatTransaction?: TransactionHeartbeat
  }
>

export type EvalDeltaKeyValue = Omit<algosdk.indexerModels.EvalDeltaKeyValue, 'getEncodingSchema' | 'toEncodingData' | 'value'> & {
  value: EvalDelta
}

export type AccountStateDelta = Omit<algosdk.indexerModels.AccountStateDelta, 'getEncodingSchema' | 'toEncodingData' | 'delta'> & {
  delta: EvalDeltaKeyValue[]
}

export type EvalDelta = Omit<algosdk.indexerModels.EvalDelta, 'getEncodingSchema' | 'toEncodingData'>

export type TransactionSignature = Omit<
  algosdk.indexerModels.TransactionSignature,
  'getEncodingSchema' | 'toEncodingData' | 'multisig' | 'logicsig'
> & {
  multisig?: Omit<algosdk.indexerModels.TransactionSignatureMultisig, 'getEncodingSchema' | 'toEncodingData' | 'subsignature'> & {
    subsignature?: Omit<algosdk.indexerModels.TransactionSignatureMultisigSubsignature, 'getEncodingSchema' | 'toEncodingData'>[]
  }
  logicsig?: Omit<algosdk.indexerModels.TransactionSignatureLogicsig, 'getEncodingSchema' | 'toEncodingData'>
}

export type TransactionKeyreg = Omit<algosdk.indexerModels.TransactionKeyreg, 'getEncodingSchema' | 'toEncodingData'>

export type TransactionHeartbeat = Omit<algosdk.indexerModels.TransactionHeartbeat, 'getEncodingSchema' | 'toEncodingData'>

export type TransactionPayment = Omit<algosdk.indexerModels.TransactionPayment, 'getEncodingSchema' | 'toEncodingData'>

export type TransactionAssetTransfer = Omit<algosdk.indexerModels.TransactionAssetTransfer, 'getEncodingSchema' | 'toEncodingData'>

export type TransactionApplication = Omit<
  algosdk.indexerModels.TransactionApplication,
  'getEncodingSchema' | 'toEncodingData' | 'globalStateSchema' | 'localStateSchema' | 'applicationId'
> & {
  // algod returns undefined for application-id when creating an application
  applicationId?: bigint
  globalStateSchema?: Omit<algosdk.indexerModels.StateSchema, 'getEncodingSchema' | 'toEncodingData'>
  localStateSchema?: Omit<algosdk.indexerModels.StateSchema, 'getEncodingSchema' | 'toEncodingData'>
}

export type TransactionAssetConfig = Omit<
  algosdk.indexerModels.TransactionAssetConfig,
  'getEncodingSchema' | 'toEncodingData' | 'params'
> & {
  params?: Omit<algosdk.indexerModels.AssetParams, 'getEncodingSchema' | 'toEncodingData'>
}

export type TransactionAssetFreeze = Omit<algosdk.indexerModels.TransactionAssetFreeze, 'getEncodingSchema' | 'toEncodingData'>
