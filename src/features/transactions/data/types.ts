import { Expand } from '@/utils/expand'
import type {
  TransactionApplication as IndexerTransactionApplication,
  Transaction as IndexerTransaction,
} from '@algorandfoundation/algokit-utils/indexer-client'

export type TransactionId = string

export type TransactionApplication = Omit<IndexerTransactionApplication, 'applicationId'> & {
  // algod returns undefined for application-id when creating an application
  applicationId?: bigint
}

export type TransactionResult = Expand<
  Omit<IndexerTransaction, 'id' | 'applicationTransaction' | 'innerTxns'> & {
    id: TransactionId
    applicationTransaction?: TransactionApplication
    innerTxns?: TransactionResult[]
  }
>
