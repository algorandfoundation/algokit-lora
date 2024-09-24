import algosdk from 'algosdk'
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
import { SendTransactionResult, BuildTransactionResult } from '../models'
import { asAlgosdkTransactions } from '../mappers'
import { TransactionBuilderMode } from '../data'
import { TransactionsTable } from './transactions-table'

export const transactionTypeLabel = 'Transaction type'
export const sendButtonLabel = 'Send'

type Props = {
  // TODO: PD - transactions from props can't be removed
  transactions?: BuildTransactionResult[]
}

export function TransactionsBuilder({ transactions: transactionsProp }: Props) {
  const { activeAddress, signer } = useWallet()
  const [transactions, setTransactions] = useState<BuildTransactionResult[]>(transactionsProp ?? [])
  const [sendTransactionResult, setSendTransactionResult] = useState<SendTransactionResult | undefined>(undefined)

  const nonDeletableTransactionIds = useMemo(() => {
    return transactionsProp?.map((t) => t.id) ?? []
  }, [transactionsProp])

  const { open, dialog } = useDialogForm({
    dialogHeader: 'Transaction Builder',
    dialogBody: (
      props: DialogBodyProps<
        {
          type?: algosdk.TransactionType
          mode: TransactionBuilderMode
          transaction?: BuildTransactionResult
          defaultValues?: Partial<BuildTransactionResult>
        },
        BuildTransactionResult
      >
    ) => (
      <TransactionBuilder
        type={props.data.type}
        mode={props.data.mode}
        defaultValues={props.data.defaultValues}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        transaction={props.data.transaction}
        onCancel={props.onCancel}
        onSubmit={props.onSubmit}
      />
    ),
  })

  const createTransaction = useCallback(async () => {
    const transaction = await open({ mode: TransactionBuilderMode.Create })
    if (transaction) {
      setTransactions((prev) => [...prev, transaction])
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

  const editTransaction = useCallback(
    async (transaction: BuildTransactionResult) => {
      const txn = await open({
        mode: TransactionBuilderMode.Edit,
        transaction: transaction,
      })
      if (txn) {
        setTransactions((prev) => prev.map((t) => (t.id === txn.id ? txn : t)))
      }
    },
    [open]
  )

  const deleteTransaction = useCallback((transaction: BuildTransactionResult) => {
    setTransactions((prev) => prev.filter((t) => t.id !== transaction.id))
  }, [])

  // TODO: PD - spining Send button
  return (
    <div>
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button onClick={createTransaction}>Create</Button>
        </div>
        <TransactionsTable
          data={transactions}
          setData={setTransactions}
          nonDeletableTransactionIds={nonDeletableTransactionIds}
          onEdit={editTransaction}
          onDelete={deleteTransaction}
        />
        <div className="flex justify-end">
          <Button onClick={sendTransactions}>Send</Button>
        </div>
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
