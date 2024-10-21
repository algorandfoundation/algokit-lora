import { useCallback, useState } from 'react'
import { PageTitle } from '../common/components/page-title'
import { SimulateResult, transactionGroupLabel, TransactionsBuilder } from './components/transactions-builder'
import { buildComposer } from './data/common'
import { asTransactionFromSendResult } from '../transactions/data/send-transaction-result'
import { asTransactionsGraphData } from '../transactions-graph/mappers'
import { BuildTransactionResult } from './models'
import { SendTransactionResults } from '@algorandfoundation/algokit-utils/types/transaction'
import { AppCallTransaction, TransactionType } from '../transactions/models'
import { GroupSendResults, SendResults } from './components/group-send-results'
import algosdk from 'algosdk'

export const transactionWizardPageTitle = 'Transaction Wizard'
export const transactionTypeLabel = 'Transaction type'
export const sendButtonLabel = 'Send'

export function TransactionWizardPage() {
  const [sendResults, setSendResults] = useState<SendResults | undefined>(undefined)

  const renderTransactionResults = useCallback((result: SendTransactionResults, simulateResponse?: algosdk.modelsv2.SimulateResponse) => {
    const sentTransactions = asTransactionFromSendResult(result)
    const transactionsGraphData = asTransactionsGraphData(sentTransactions)
    const appCallTransactions = sentTransactions.filter((txn) => txn.type === TransactionType.AppCall)
    setSendResults({
      transactionGraph: transactionsGraphData,
      sentAppCalls: appCallTransactions as unknown as AppCallTransaction[],
      simulateResponse,
    })
  }, [])

  const sendTransactions = useCallback(
    async (transactions: BuildTransactionResult[]) => {
      const composer = await buildComposer(transactions)
      const result = await composer.send()
      renderTransactionResults(result)
    },
    [renderTransactionResults]
  )

  const renderSimulateResult = useCallback(
    async (result: SimulateResult) => {
      renderTransactionResults(result, result.simulateResponse)
    },
    [renderTransactionResults]
  )

  const reset = useCallback(() => {
    setSendResults(undefined)
  }, [])

  return (
    <div className="space-y-2">
      <PageTitle title={transactionWizardPageTitle} />
      <div className="space-y-6">
        <p>Create and send transactions to the selected network using a connected wallet.</p>
        <TransactionsBuilder
          title={<h2 className="pb-0">{transactionGroupLabel}</h2>}
          onSendTransactions={sendTransactions}
          onSimulated={renderSimulateResult}
          onReset={reset}
        />
        {sendResults && <GroupSendResults {...sendResults} transactionGraphBgClassName="bg-background" />}
      </div>
    </div>
  )
}
