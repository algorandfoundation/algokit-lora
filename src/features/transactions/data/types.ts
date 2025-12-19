import { Expand } from '@/utils/expand'
import type {
  Transaction as IndexerTransaction,
  EvalDeltaKeyValue as IndexerEvalDeltaKeyValue,
  AccountStateDelta as IndexerAccountStateDelta,
  EvalDelta as IndexerEvalDelta,
  TransactionSignature as IndexerTransactionSignature,
  TransactionSignatureMultisig as IndexerTransactionSignatureMultisig,
  TransactionSignatureMultisigSubsignature as IndexerTransactionSignatureMultisigSubsignature,
  TransactionSignatureLogicsig as IndexerTransactionSignatureLogicsig,
  TransactionKeyreg as IndexerTransactionKeyreg,
  TransactionHeartbeat as IndexerTransactionHeartbeat,
  TransactionPayment as IndexerTransactionPayment,
  TransactionAssetTransfer as IndexerTransactionAssetTransfer,
  TransactionApplication as IndexerTransactionApplication,
  TransactionAssetConfig as IndexerTransactionAssetConfig,
  TransactionAssetFreeze as IndexerTransactionAssetFreeze,
  StateSchema as IndexerStateSchema,
  AssetParams as IndexerAssetParams,
} from '@algorandfoundation/algokit-utils/indexer-client'

export type TransactionId = string

export type TransactionResult = Expand<
  Omit<
    IndexerTransaction,
    | 'id'
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

export type EvalDeltaKeyValue = Omit<IndexerEvalDeltaKeyValue, 'value'> & {
  value: EvalDelta
}

export type AccountStateDelta = Omit<IndexerAccountStateDelta, 'delta'> & {
  delta: EvalDeltaKeyValue[]
}

export type EvalDelta = IndexerEvalDelta

export type TransactionSignature = Omit<IndexerTransactionSignature, 'multisig' | 'logicsig'> & {
  multisig?: Omit<IndexerTransactionSignatureMultisig, 'subsignature'> & {
    subsignature?: IndexerTransactionSignatureMultisigSubsignature[]
  }
  logicsig?: IndexerTransactionSignatureLogicsig
}

export type TransactionKeyreg = IndexerTransactionKeyreg

export type TransactionHeartbeat = IndexerTransactionHeartbeat

export type TransactionPayment = IndexerTransactionPayment

export type TransactionAssetTransfer = IndexerTransactionAssetTransfer

export type TransactionApplication = Omit<IndexerTransactionApplication, 'globalStateSchema' | 'localStateSchema' | 'applicationId'> & {
  // algod returns undefined for application-id when creating an application
  applicationId?: bigint
  globalStateSchema?: IndexerStateSchema
  localStateSchema?: IndexerStateSchema
}

export type TransactionAssetConfig = Omit<IndexerTransactionAssetConfig, 'params'> & {
  params?: IndexerAssetParams
}

export type TransactionAssetFreeze = IndexerTransactionAssetFreeze
