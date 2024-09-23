import { useCallback, useMemo, useState } from 'react'
import { DialogBodyProps, useDialogForm } from '@/features/common/hooks/use-dialog-form'
import { Button } from '@/features/common/components/button'
import { TransactionBuilder } from './transaction-builder'
import { algorandClient } from '@/features/common/data/algo-client'
import { useWallet } from '@txnlab/use-wallet'
import { invariant } from '@/utils/invariant'
import { TransactionsGraph } from '@/features/transactions-graph'
import { DescriptionList } from '@/features/common/components/description-list'
import { transactionIdLabel } from '@/features/transactions/components/transaction-info'
import { TransactionLink } from '@/features/transactions/components/transaction-link'
import { asTransactionsGraphData } from '@/features/transactions-graph/mappers'
import { asTransactionFromSendResult } from '@/features/transactions/data/send-transaction-result'
import { SendTransactionResult, BuildTransactionResult, BuildableTransactionType } from '../models'
import { asAlgosdkTransactions, asDescriptionListItems } from '../mappers'
import { DataTable } from '@/features/common/components/data-table'
import { ColumnDef } from '@tanstack/react-table'

export const transactionTypeLabel = 'Transaction type'
export const sendButtonLabel = 'Send'

export function TransactionsBuilder() {
  const { activeAddress, signer } = useWallet()
  const [transactions, setTransactions] = useState<BuildTransactionResult[]>([])
  const [sendTransactionResult, setSendTransactionResult] = useState<SendTransactionResult | undefined>(undefined)

  const { open, dialog } = useDialogForm({
    dialogHeader: 'Transaction Builder',
    dialogBody: (props: DialogBodyProps<number, BuildTransactionResult>) => (
      <TransactionBuilder onCancel={props.onCancel} onSubmit={props.onSubmit} />
    ),
  })

  const openDialog = useCallback(async () => {
    const transactions = await open(1)
    if (transactions) {
      setTransactions((prev) => [...prev, transactions])
    }
  }, [open])

  const sendTransactions = useCallback(async () => {
    invariant(activeAddress, 'Please connect your wallet')

    const atc = algorandClient.setSigner(activeAddress, signer).newGroup()
    for (const transaction of transactions) {
      const txns = await asAlgosdkTransactions(transaction)
      txns.forEach((txn) => atc.addTransaction(txn))
    }
    const result = await atc.execute()
    const sentTxns = asTransactionFromSendResult(result)
    const transactionId = result.txIds[0]
    const transactionsGraphData = asTransactionsGraphData(sentTxns)

    setSendTransactionResult({
      transactionId,
      transactionsGraphData,
    })
  }, [activeAddress, signer, transactions])

  const expandedTransactions = useMemo(() => expandTransactions(transactions), [transactions])

  return (
    <div>
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button onClick={openDialog}>Create</Button>
        </div>
        <DataTable columns={tableColumns} data={expandedTransactions} />
        <Button onClick={sendTransactions}>Send</Button>
      </div>
      {dialog}
      {sendTransactionResult && (
        <div className="my-4 flex flex-col gap-4 text-sm">
          <DescriptionList
            items={[
              {
                dt: transactionIdLabel,
                dd: (
                  <TransactionLink transactionId={sendTransactionResult.transactionId} className="text-sm text-primary underline">
                    {sendTransactionResult.transactionId}
                  </TransactionLink>
                ),
              },
            ]}
          />
          <TransactionsGraph
            transactionsGraphData={sendTransactionResult.transactionsGraphData}
            bgClassName="bg-background"
            downloadable={false}
          />
        </div>
      )}
    </div>
  )
}

const tableColumns: ColumnDef<BuildTransactionResult>[] = [
  {
    header: 'Type',
    accessorFn: (item) => item.type,
  },
  {
    header: 'Description',
    cell: (c) => {
      const transaction = c.row.original
      return <DescriptionList items={asDescriptionListItems(transaction)} />
    },
  },
]

const expandTransactions = (transactions: BuildTransactionResult[]): BuildTransactionResult[] => {
  const results: BuildTransactionResult[] = []

  for (const transaction of transactions) {
    if (transaction.type !== BuildableTransactionType.AppCall) {
      results.push(transaction)
    } else {
      const transactionTypeArgs = transaction.methodArgs?.filter((arg): arg is BuildTransactionResult => typeof arg === 'object') ?? []
      // TODO: PD - handle nested transaction type args
      for (const transactionTypeArg of transactionTypeArgs) {
        results.push(transactionTypeArg)
      }
      results.push(transaction)
    }
  }

  return results
}
