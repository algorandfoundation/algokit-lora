import { useCallback, useState } from 'react'
import { PageTitle } from '../common/components/page-title'
import { transactionGroupLabel, TransactionsBuilder } from './components/transactions-builder'
import { buildComposer } from './data/common'
import { asTransactionFromSendResult } from '../transactions/data/send-transaction-result'
import { asTransactionsGraphData } from '../transactions-graph/mappers'
import { TransactionsGraph, TransactionsGraphData } from '../transactions-graph'
import { BuildTransactionResult } from './models'

export const transactionWizardPageTitle = 'Transaction Wizard'
export const transactionTypeLabel = 'Transaction type'
export const sendButtonLabel = 'Send'

export function TransactionWizardPage() {
  const [transactionGraphResult, setTransactionGraphResult] = useState<TransactionsGraphData | undefined>(undefined)

  const sendTransactions = useCallback(async (transactions: BuildTransactionResult[]) => {
    const composer = await buildComposer(transactions)
    const result = await composer.send()
    const sentTransactions = asTransactionFromSendResult(result)
    const transactionsGraphData = asTransactionsGraphData(sentTransactions)
    setTransactionGraphResult(transactionsGraphData)
  }, [])

  const reset = useCallback(() => {
    setTransactionGraphResult(undefined)
  }, [])

  return (
    <div className="space-y-2">
      <PageTitle title={transactionWizardPageTitle} />
      <div className="space-y-6">
        <p>Create and send transactions to the selected network using a connected wallet.</p>
        <TransactionsBuilder
          title={<h2 className="pb-0">{transactionGroupLabel}</h2>}
          onSendTransactions={sendTransactions}
          onReset={reset}
        />
        {transactionGraphResult && (
          <div className="my-4 flex flex-col gap-2 text-sm">
            <h3>Result</h3>
            <h4>Transaction Visual</h4>
            <TransactionsGraph transactionsGraphData={transactionGraphResult} downloadable={false} bgClassName="bg-background" />
          </div>
        )}
      </div>
    </div>
  )
}
