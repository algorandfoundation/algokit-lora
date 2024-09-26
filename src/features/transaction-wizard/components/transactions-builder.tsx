import algosdk from 'algosdk'
import { useCallback, useMemo, useState } from 'react'
import { DialogBodyProps, useDialogForm } from '@/features/common/hooks/use-dialog-form'
import { Button } from '@/features/common/components/button'
import { TransactionBuilder } from './transaction-builder'
import { algod, algorandClient } from '@/features/common/data/algo-client'
import { useWallet } from '@txnlab/use-wallet'
import { invariant } from '@/utils/invariant'
import { TransactionsGraph } from '@/features/transactions-graph'
import { DescriptionList } from '@/features/common/components/description-list'
import { transactionIdLabel } from '@/features/transactions/components/transaction-info'
import { TransactionLink } from '@/features/transactions/components/transaction-link'
import { asTransactionsGraphData } from '@/features/transactions-graph/mappers'
import { asTransactionFromSendResult } from '@/features/transactions/data/send-transaction-result'
import {
  SendTransactionResult,
  BuildTransactionResult,
  BuildableTransactionType,
  BuildAppCallTransactionResult,
  BuildMethodCallTransactionResult,
} from '../models'
import { asAlgosdkTransactions } from '../mappers'
import { TransactionBuilderMode } from '../data'
import { TransactionsTable } from './transactions-table'
import { populateAppCallResources } from '@algorandfoundation/algokit-utils'
import { uint8ArrayToBase64 } from '@/utils/uint8-array-to-base64'
import {
  ConfirmTransactionsResourcesForm,
  TransactionResources,
} from '@/features/applications/components/confirm-transactions-resources-form'
import { isBuildTransactionResult } from '../utis/is-build-transaction-result'
import { HintText } from '@/features/forms/components/hint-text'
import { asError } from '@/utils/error'

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
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined)

  const nonDeletableTransactionIds = useMemo(() => {
    return transactionsProp?.map((t) => t.id) ?? []
  }, [transactionsProp])

  const { open: openTransactionBuilderDialog, dialog: transactionBuilderDialog } = useDialogForm({
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
        transactionType={props.data.type}
        mode={props.data.mode}
        defaultValues={props.data.defaultValues}
        transaction={props.data.transaction}
        onCancel={props.onCancel}
        onSubmit={props.onSubmit}
      />
    ),
  })

  const { open: openEditResourcesDialog, dialog: editResourcesDialog } = useDialogForm({
    dialogHeader: 'Edit Resources',
    dialogBody: (
      props: DialogBodyProps<
        {
          transaction: BuildAppCallTransactionResult | BuildMethodCallTransactionResult
        },
        TransactionResources
      >
    ) => {
      const resources = {
        accounts: props.data.transaction.accounts ?? [],
        assets: props.data.transaction.foreignAssets ?? [],
        applications: props.data.transaction.foreignApps ?? [],
        boxes: props.data.transaction.boxes ?? [],
      }
      return <ConfirmTransactionsResourcesForm resources={resources} onSubmit={props.onSubmit} onCancel={props.onCancel} />
    },
  })
  const createTransaction = useCallback(async () => {
    const transaction = await openTransactionBuilderDialog({ mode: TransactionBuilderMode.Create })
    if (transaction) {
      setTransactions((prev) => [...prev, transaction])
    }
  }, [openTransactionBuilderDialog])

  // TODO: add TODO about AppCall -> AppCall -> Payment
  const sendTransactions = useCallback(async () => {
    try {
      invariant(activeAddress, 'Please connect your wallet')

      const algokitComposer = algorandClient.setSigner(activeAddress, signer).newGroup()
      for (const transaction of transactions) {
        const txns = await asAlgosdkTransactions(transaction)
        txns.forEach((txn) => algokitComposer.addTransaction(txn))
      }
      const result = await algokitComposer.execute()
      const sentTxns = asTransactionFromSendResult(result)
      const transactionId = result.txIds[0]
      const transactionsGraphData = asTransactionsGraphData(sentTxns)

      setSendTransactionResult({
        transactionId,
        transactionsGraphData,
      })
    } catch (error) {
      setErrorMessage(asError(error).message)
    }
  }, [activeAddress, signer, transactions])

  // TODO: PD - currently edit the app call will reset the resources
  const populateResources = useCallback(async () => {
    try {
      invariant(activeAddress, 'Please connect your wallet')

      const algokitComposer = algorandClient.setSigner(activeAddress, signer).newGroup()
      for (const transaction of transactions) {
        const txns = await asAlgosdkTransactions(transaction)
        txns.forEach((txn) => algokitComposer.addTransaction(txn))
      }

      const { atc } = await algokitComposer.build()
      const populatedAtc = await populateAppCallResources(atc, algod)
      const transactionsWithResources = populatedAtc.buildGroup()

      // HACK: Assume that the order of transactions is the same
      setTransactions((prev) => {
        const newTransactions = [...prev]

        const flattenedTransactions = flattenTransactions(transactions)
        for (let i = 0; i < flattenedTransactions.length; i++) {
          const transaction = flattenedTransactions[i]
          const transactionWithResources = transactionsWithResources[i]
          if (transaction.type === BuildableTransactionType.AppCall || transaction.type === BuildableTransactionType.MethodCall) {
            const resources = {
              accounts: (transactionWithResources.txn.appAccounts ?? []).map((account) => algosdk.encodeAddress(account.publicKey)),
              assets: transactionWithResources.txn.appForeignAssets ?? [],
              applications: transactionWithResources.txn.appForeignApps ?? [],
              boxes: transactionWithResources.txn.boxes?.map((box) => uint8ArrayToBase64(box.name)) ?? [],
            }
            setTransactionResouces(newTransactions, transaction.id, resources)
          }
        }

        return newTransactions
      })
    } catch (error) {
      setErrorMessage(asError(error).message)
    }
  }, [transactions, activeAddress, signer])

  const editTransaction = useCallback(
    async (transaction: BuildTransactionResult) => {
      const txn = await openTransactionBuilderDialog({
        mode: TransactionBuilderMode.Edit,
        transaction: transaction,
      })
      if (txn) {
        setTransactions((prev) => prev.map((t) => (t.id === txn.id ? txn : t)))
      }
    },
    [openTransactionBuilderDialog]
  )

  const deleteTransaction = useCallback((transaction: BuildTransactionResult) => {
    setTransactions((prev) => prev.filter((t) => t.id !== transaction.id))
  }, [])

  const editResources = useCallback(
    async (transaction: BuildAppCallTransactionResult | BuildMethodCallTransactionResult) => {
      const resources = await openEditResourcesDialog({ transaction })
      if (resources) {
        setTransactions((prev) => {
          const newTransactions = [...prev]
          setTransactionResouces(newTransactions, transaction.id, resources)
          return newTransactions
        })
      }
    },
    [openEditResourcesDialog]
  )

  // TODO: PD - spining Send button
  // TODO: PD - show the result of app call transactions
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
          onEditResources={editResources}
          onDelete={deleteTransaction}
        />
        {errorMessage && (
          <div>
            <HintText errorText={errorMessage} />
          </div>
        )}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={populateResources}>
            Populate Resouces
          </Button>
          <Button onClick={sendTransactions}>Send</Button>
        </div>
      </div>
      {transactionBuilderDialog}
      {editResourcesDialog}
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

const flattenTransactions = (transactions: BuildTransactionResult[]): BuildTransactionResult[] => {
  return transactions.reduce((acc, transaction) => {
    if (transaction.type === BuildableTransactionType.MethodCall) {
      const methodCallArgs = transaction.methodArgs.filter((arg) => isBuildTransactionResult(arg))
      return [...acc, ...flattenTransactions(methodCallArgs as BuildTransactionResult[]), transaction]
    }
    return [...acc, transaction]
  }, [] as BuildTransactionResult[])
}

// This is an inplace mutation of the transactions
const setTransactionResouces = (transactions: BuildTransactionResult[], transactionId: string, resources: TransactionResources) => {
  const set = (transactions: BuildTransactionResult[]) => {
    for (let i = 0; i < transactions.length; i++) {
      const transaction = transactions[i]

      if (
        transaction.id === transactionId &&
        (transaction.type === BuildableTransactionType.AppCall || transaction.type === BuildableTransactionType.MethodCall)
      ) {
        transaction.accounts = resources.accounts
        transaction.foreignAssets = resources.assets
        transaction.foreignApps = resources.applications
        transaction.boxes = resources.boxes
      }

      if (transaction.type === BuildableTransactionType.MethodCall) {
        const txns = transaction.methodArgs.filter((arg) => isBuildTransactionResult(arg))
        set(txns)
      }
    }
  }

  set(transactions)
}
