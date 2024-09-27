import algosdk from 'algosdk'
import { useCallback, useMemo, useState } from 'react'
import { DialogBodyProps, useDialogForm } from '@/features/common/hooks/use-dialog-form'
import { AsyncActionButton, Button } from '@/features/common/components/button'
import { TransactionBuilder } from './transaction-builder'
import { algod, algorandClient } from '@/features/common/data/algo-client'
import { useWallet } from '@txnlab/use-wallet'
import { invariant } from '@/utils/invariant'
import { TransactionsGraph } from '@/features/transactions-graph'
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
import { ConfirmButton } from '@/features/common/components/confirm-button'
import { Transaction } from '@/features/transactions/models'

export const transactionTypeLabel = 'Transaction type'
export const sendButtonLabel = 'Send'
const connectWalletMessage = 'Please connect a wallet'

type Props = {
  transactions?: BuildTransactionResult[]
  onReset?: () => void
  onTransactionSent?: (buildTransactionResultToAlgosdkTransactionMap: Map<string, string>, transactions: Transaction[]) => void
}

// TODO: PD - on complete
export function TransactionsBuilder({ transactions: transactionsProp, onReset, onTransactionSent }: Props) {
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
      setErrorMessage(undefined)
      invariant(activeAddress, 'Please connect your wallet')

      const buildTransactionResultToAlgosdkTransactionMap = new Map<string, string>()

      const algokitComposer = algorandClient.setSigner(activeAddress, signer).newGroup()
      for (const transaction of transactions) {
        const txns = await asAlgosdkTransactions(transaction)
        buildTransactionResultToAlgosdkTransactionMap.set(transaction.id, txns[txns.length - 1].txID())
        txns.forEach((txn) => algokitComposer.addTransaction(txn))
      }
      const result = await algokitComposer.execute()
      const sentTxns = asTransactionFromSendResult(result)
      const transactionsGraphData = asTransactionsGraphData(sentTxns)

      setSendTransactionResult({
        transactions: sentTxns,
        transactionsGraphData,
      })

      onTransactionSent?.(buildTransactionResultToAlgosdkTransactionMap, sentTxns)
    } catch (error) {
      setErrorMessage(asError(error).message)
    }
  }, [activeAddress, signer, transactions, onTransactionSent])

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

  const resetTransactions = useCallback(() => {
    setTransactions([])
    onReset?.()
  }, [onReset])

  return (
    <div>
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button onClick={createTransaction}>{transactions.length === 0 ? 'Create' : 'Add Transaction'}</Button>
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
          <ConfirmButton
            onConfirm={resetTransactions}
            dialogHeaderText="Reset"
            dialogContent="Are you sure? All transactions will be removed."
            variant="destructive"
          >
            Reset
          </ConfirmButton>
          <AsyncActionButton
            className="w-40"
            variant="outline"
            onClick={populateResources}
            disabled={!activeAddress}
            disabledReason={connectWalletMessage}
          >
            Populate Resouces
          </AsyncActionButton>
          <AsyncActionButton className="w-28" onClick={sendTransactions} disabled={!activeAddress} disabledReason={connectWalletMessage}>
            Send
          </AsyncActionButton>
        </div>
      </div>
      {transactionBuilderDialog}
      {editResourcesDialog}
      {sendTransactionResult && (
        <div className="my-4 flex flex-col gap-2 text-sm">
          <h3>Results</h3>
          <h4>Transactions Graph</h4>
          <TransactionsGraph
            transactionsGraphData={sendTransactionResult.transactionsGraphData}
            bgClassName="bg-card"
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
