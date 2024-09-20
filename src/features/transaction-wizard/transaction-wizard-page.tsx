import algosdk from 'algosdk'
import { useCallback, useState } from 'react'
import { DialogBodyProps, useDialogForm } from '../common/hooks/use-dialog-form'
import { Button } from '../common/components/button'
import { TransactionBuilder } from './components/transaction-builder'
import { algorandClient } from '../common/data/algo-client'
import { useWallet } from '@txnlab/use-wallet'
import { invariant } from '@/utils/invariant'

export const transactionWizardPageTitle = 'Transaction Wizard'
export const transactionTypeLabel = 'Transaction type'
export const sendButtonLabel = 'Send'

export function TransactionWizardPage() {
  const { activeAddress, signer } = useWallet()
  const [transactions, setTransactions] = useState<algosdk.Transaction[]>([])

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
    console.log(transactions)

    const atc = algorandClient.setSigner(activeAddress, signer).newGroup()
    transactions.forEach((transaction) => {
      atc.addTransaction(transaction)
    })

    const result = await atc.execute()
    console.log(result)
  }, [transactions])

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
    </div>
  )
}
