import algosdk from 'algosdk'

export type TransactionId = string

export type TransactionResult = Omit<
  algosdk.indexerModels.Transaction,
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
> & {
  signature?: TransactionSignature
  paymentTransaction?: Omit<algosdk.indexerModels.TransactionPayment, 'getEncodingSchema' | 'toEncodingData'>
  assetTransferTransaction?: Omit<algosdk.indexerModels.TransactionAssetTransfer, 'getEncodingSchema' | 'toEncodingData'>
  applicationTransaction?: Omit<
    algosdk.indexerModels.TransactionApplication,
    'getEncodingSchema' | 'toEncodingData' | 'globalStateSchema' | 'localStateSchema' | 'applicationId'
  > & {
    // algod returns undefined for application-id when creating an application
    applicationId?: bigint
    globalStateSchema?: Omit<algosdk.indexerModels.StateSchema, 'getEncodingSchema' | 'toEncodingData'>
    localStateSchema?: Omit<algosdk.indexerModels.StateSchema, 'getEncodingSchema' | 'toEncodingData'>
  }
  assetConfigTransaction?: Omit<algosdk.indexerModels.TransactionAssetConfig, 'getEncodingSchema' | 'toEncodingData' | 'params'> & {
    params?: Omit<algosdk.indexerModels.AssetParams, 'getEncodingSchema' | 'toEncodingData'>
  }
  innerTxns?: TransactionResult[]
  localStateDelta?: AccountStateDelta[]
  globalStateDelta?: EvalDeltaKeyValue[]
  assetFreezeTransaction?: Omit<algosdk.indexerModels.TransactionAssetFreeze, 'getEncodingSchema' | 'toEncodingData'>
  keyregTransaction?: TransactionKeyreg
}

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
