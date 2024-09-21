import algosdk from 'algosdk'
import { useCallback, useState } from 'react'
import { DialogBodyProps, useDialogForm } from '../common/hooks/use-dialog-form'
import { Button } from '../common/components/button'
import { TransactionBuilder } from './components/transaction-builder'
import { algorandClient } from '../common/data/algo-client'
import { useWallet } from '@txnlab/use-wallet'
import { invariant } from '@/utils/invariant'
import { TransactionsGraph, TransactionsGraphData } from '../transactions-graph'
import { DescriptionList } from '../common/components/description-list'
import { transactionIdLabel } from '../transactions/components/transaction-info'
import { TransactionLink } from '../transactions/components/transaction-link'
import { asTransactionsGraphData } from '../transactions-graph/mappers'
import { asTransactionFromSendResult } from '../transactions/data/send-transaction-result'

export const transactionWizardPageTitle = 'Transaction Wizard'
export const transactionTypeLabel = 'Transaction type'
export const sendButtonLabel = 'Send'

type SendTransactionResult = {
  transactionId: string
  transactionsGraphData: TransactionsGraphData
}

export function TransactionWizardPage() {
  const { activeAddress, signer } = useWallet()
  const [transactions, setTransactions] = useState<algosdk.Transaction[]>([])
  const [sendTransactionResult, setSendTransactionResult] = useState<SendTransactionResult | undefined>(undefined)

  const { open, dialog } = useDialogForm({
    dialogHeader: 'Transaction Builder',
    dialogBody: (props: DialogBodyProps<number, algosdk.Transaction>) => (
      <TransactionBuilder onCancel={props.onCancel} onSubmit={props.onSubmit} />
    ),
  })

  const openDialog = useCallback(async () => {
    const transaction = await open(1)
    if (transaction) {
      setTransactions((prev) => [...prev, transaction])
    }
  }, [open])

  const sendTransactions = useCallback(async () => {
    invariant(activeAddress, 'Please connect your wallet')

    const atc = algorandClient.setSigner(activeAddress, signer).newGroup()
    transactions.forEach((transaction) => {
      atc.addTransaction(transaction)
    })

    const result = await atc.execute()
    const sentTxns = asTransactionFromSendResult(result)
    const transactionId = result.txIds[0]
    const transactionsGraphData = asTransactionsGraphData(sentTxns)

    setSendTransactionResult({
      transactionId,
      transactionsGraphData,
    })
  }, [activeAddress, signer, transactions])

  return (
    <div>
      {transactions.map((transaction, index) => (
        <div key={index}>
          <p>{transaction.type}</p>
        </div>
      ))}
      <Button onClick={openDialog}>Create</Button>
      <Button onClick={sendTransactions}>Send</Button>
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
