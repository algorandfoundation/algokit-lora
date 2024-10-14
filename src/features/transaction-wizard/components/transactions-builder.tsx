import algosdk from 'algosdk'
import { useCallback, useMemo, useState } from 'react'
import { DialogBodyProps, useDialogForm } from '@/features/common/hooks/use-dialog-form'
import { AsyncActionButton, Button } from '@/features/common/components/button'
import { TransactionBuilder } from './transaction-builder'
import { algod, algorandClient } from '@/features/common/data/algo-client'
import { useWallet } from '@txnlab/use-wallet'
import { invariant } from '@/utils/invariant'
import { TransactionsGraph, TransactionsGraphData } from '@/features/transactions-graph'
import { asTransactionsGraphData } from '@/features/transactions-graph/mappers'
import { asTransactionFromSendResult } from '@/features/transactions/data/send-transaction-result'
import {
  BuildableTransactionType,
  BuildAppCallTransactionResult,
  BuildMethodCallTransactionResult,
  BuildTransactionResult,
  PlaceholderTransaction,
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
import { isBuildTransactionResult, isPlaceholderTransaction } from '../utils/is-build-transaction-result'
import { HintText } from '@/features/forms/components/hint-text'
import { asError } from '@/utils/error'
import { Transaction } from '@/features/transactions/models'
import { Eraser, HardDriveDownload, Plus, Send } from 'lucide-react'
import { transactionGroupTableLabel } from './labels'
import { asAlgosdkTransactionType } from '../mappers/as-algosdk-transaction-type'
import { asAlgosdkABITransactionType } from '@/features/transaction-wizard/mappers/as-algosdk-abi-transaction-type'

export const transactionTypeLabel = 'Transaction type'
export const sendButtonLabel = 'Send'
const connectWalletMessage = 'Please connect a wallet'
export const addTransactionLabel = 'Add Transaction'

type Props = {
  transactions?: BuildTransactionResult[]
  onReset?: () => void
  onTransactionSent?: (transactions: Transaction[]) => void
  renderContext: 'transaction-wizard' | 'app-lab'
}

const transactionGroupLabel = 'Transaction Group'

export function TransactionsBuilder({ transactions: transactionsProp, onReset, onTransactionSent, renderContext }: Props) {
  const { activeAddress } = useWallet()
  const [transactions, setTransactions] = useState<BuildTransactionResult[]>(transactionsProp ?? [])
  const [transactionGraphResult, setTransactionGraphResult] = useState<TransactionsGraphData | undefined>(undefined)
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined)

  const nonDeletableTransactionIds = useMemo(() => {
    return transactionsProp?.map((t) => t.id) ?? []
  }, [transactionsProp])

  const { open: openTransactionBuilderDialog, dialog: transactionBuilderDialog } = useDialogForm({
    dialogHeader: 'Build Transaction',
    dialogBody: (
      props: DialogBodyProps<
        {
          type?: algosdk.TransactionType
          mode: TransactionBuilderMode
          transaction?: BuildTransactionResult
          defaultValues?: Partial<BuildTransactionResult>
          foo?: algosdk.ABITransactionType[]
        },
        BuildTransactionResult
      >
    ) => (
      <TransactionBuilder
        transactionType={props.data.type}
        mode={props.data.mode}
        type={props.data.transaction?.type}
        defaultValues={props.data.defaultValues}
        transaction={props.data.transaction}
        foo={props.data.foo}
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

  const sendTransactions = useCallback(async () => {
    try {
      setErrorMessage(undefined)
      invariant(activeAddress, 'Please connect your wallet')
      ensureThereIsNoPlaceholderTransaction(transactions)

      const algokitComposer = algorandClient.newGroup()
      for (const transaction of transactions) {
        const txns = await asAlgosdkTransactions(transaction)
        txns.forEach((txn) => algokitComposer.addTransaction(txn))
      }
      const result = await algokitComposer.send()
      const sentTxns = asTransactionFromSendResult(result)
      const transactionsGraphData = asTransactionsGraphData(sentTxns)

      setTransactionGraphResult(transactionsGraphData)

      onTransactionSent?.(sentTxns)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error)
      setErrorMessage(asError(error).message)
    }
  }, [activeAddress, transactions, onTransactionSent])

  const populateResources = useCallback(async () => {
    try {
      setErrorMessage(undefined)
      invariant(activeAddress, 'Please connect your wallet')
      ensureThereIsNoPlaceholderTransaction(transactions)

      const algokitComposer = algorandClient.newGroup()
      for (const transaction of transactions) {
        const txns = await asAlgosdkTransactions(transaction)
        txns.forEach((txn) => algokitComposer.addTransaction(txn))
      }

      const { atc } = await algokitComposer.build()
      const populatedAtc = await populateAppCallResources(atc, algod)
      const transactionsWithResources = populatedAtc.buildGroup()

      setTransactions((prev) => {
        let newTransactions = [...prev]

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
            newTransactions = setTransactionResources(newTransactions, transaction.id, resources)
          }
        }

        return newTransactions
      })
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error)
      setErrorMessage(asError(error).message)
    }
  }, [transactions, activeAddress])

  const editTransaction = useCallback(
    async (transaction: BuildTransactionResult | PlaceholderTransaction) => {
      const isPlaceholder = isPlaceholderTransaction(transaction)
      let foo: algosdk.ABITransactionType[] | undefined
      if (isPlaceholder) {
        // TODO: supported nested
        const methodCallTxn = transactions.find(
          (t): t is BuildMethodCallTransactionResult =>
            t.type === BuildableTransactionType.MethodCall && t.id == transaction.argumentForMethodCall
        )
        invariant(methodCallTxn, `Method call transaction ${transaction.argumentForMethodCall} not found`)
        const a = methodCallTxn.methodArgs.filter(
          (arg): arg is BuildTransactionResult | PlaceholderTransaction => isBuildTransactionResult(arg) || isPlaceholderTransaction(arg)
        )
        const i = a.findIndex((arg) => arg.id === transaction.id)
        foo = a
          .slice(0, i)
          .map((a) => (isBuildTransactionResult(a) ? asAlgosdkABITransactionType(a.type) : a.targetType))
          .reverse()
      }

      const txn = isPlaceholder
        ? await openTransactionBuilderDialog({
            mode: TransactionBuilderMode.Create,
            type: asAlgosdkTransactionType(transaction.targetType),
            foo: foo,
          })
        : await openTransactionBuilderDialog({
            mode: TransactionBuilderMode.Edit,
            transaction: transaction,
          })
      if (txn) {
        setTransactions((prev) => setTransaction(prev, transaction.id, () => txn))
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
          return setTransactionResources(prev, transaction.id, resources)
        })
      }
    },
    [openEditResourcesDialog]
  )

  const reset = useCallback(() => {
    setTransactions([])
    setErrorMessage(undefined)
    setTransactionGraphResult(undefined)
    onReset?.()
  }, [onReset])

  const populateResourcesButtonDisabledProps = useMemo(() => {
    if (!activeAddress) {
      return {
        disabled: true,
        disabledReason: connectWalletMessage,
      }
    }

    if (!transactions.find((t) => t.type === BuildableTransactionType.AppCall || t.type === BuildableTransactionType.MethodCall)) {
      return {
        disabled: true,
        disabledReason: 'No application call transactions',
      }
    }

    return {
      disabled: false,
    }
  }, [activeAddress, transactions])

  const sendButtonDisabledProps = useMemo(() => {
    if (!activeAddress) {
      return {
        disabled: true,
        disabledReason: connectWalletMessage,
      }
    }

    const groupTransactionCount = flattenTransactions(transactions).length
    if (groupTransactionCount > 16) {
      return {
        disabled: true,
        disabledReason: 'A group can have a max of 16 transactions',
      }
    }

    if (transactions.length === 0) {
      return {
        disabled: true,
        disabledReason: 'No transactions to send',
      }
    }

    return {
      disabled: false,
    }
  }, [activeAddress, transactions])

  return (
    <div>
      <div className="space-y-4">
        <div className="mb-4 flex items-center gap-2">
          {renderContext === 'transaction-wizard' ? (
            <h2 className="pb-0">{transactionGroupLabel}</h2>
          ) : (
            <h4 className="pb-0 text-primary">{transactionGroupLabel}</h4>
          )}
          <Button variant="outline-secondary" onClick={createTransaction} className={'ml-auto'} icon={<Plus size={16} />}>
            {addTransactionLabel}
          </Button>
        </div>
        <TransactionsTable
          ariaLabel={transactionGroupTableLabel}
          data={transactions}
          setData={setTransactions}
          nonDeletableTransactionIds={nonDeletableTransactionIds}
          onEditTransaction={editTransaction}
          onEditResources={editResources}
          onDelete={deleteTransaction}
        />
        {errorMessage && (
          <div>
            <HintText errorText={errorMessage} />
          </div>
        )}
        <div className="flex items-center justify-between gap-2">
          <AsyncActionButton
            variant="outline"
            onClick={populateResources}
            icon={<HardDriveDownload size={16} />}
            {...populateResourcesButtonDisabledProps}
          >
            Populate Resources
          </AsyncActionButton>
          <div className="left-auto flex gap-2">
            <Button onClick={reset} variant="outline" icon={<Eraser size={16} />}>
              Clear
            </Button>
            <AsyncActionButton className="w-28" onClick={sendTransactions} icon={<Send size={16} />} {...sendButtonDisabledProps}>
              Send
            </AsyncActionButton>
          </div>
        </div>
      </div>
      {transactionBuilderDialog}
      {editResourcesDialog}
      {transactionGraphResult && (
        <div className="my-4 flex flex-col gap-2 text-sm">
          <h3>Result</h3>
          <h4>Transaction Visual</h4>
          <TransactionsGraph
            transactionsGraphData={transactionGraphResult}
            bgClassName={renderContext === 'transaction-wizard' ? 'bg-background' : 'bg-card'}
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
      const methodCallArgs = transaction.methodArgs.filter((arg) => isBuildTransactionResult(arg) || isPlaceholderTransaction(arg))
      return [...acc, ...flattenTransactions(methodCallArgs as BuildTransactionResult[]), transaction]
    }
    return [...acc, transaction]
  }, [] as BuildTransactionResult[])
}

const setTransactionResources = (transactions: BuildTransactionResult[], transactionId: string, resources: TransactionResources) => {
  return setTransaction(transactions, transactionId, (transaction) => {
    if (isPlaceholderTransaction(transaction)) {
      throw new Error(`Cannot set resources for placeholder transaction`)
    }

    if (transaction.type === BuildableTransactionType.MethodCall || transaction.type === BuildableTransactionType.AppCall) {
      return {
        ...transaction,
        accounts: resources.accounts,
        foreignAssets: resources.assets,
        foreignApps: resources.applications,
        boxes: resources.boxes,
      }
    }
    throw new Error(`Cannot set resources for transaction type ${transaction.type}`)
  })
}

const setTransaction = (
  transactions: BuildTransactionResult[],
  transactionId: string,
  setter: (oldTxn: BuildTransactionResult | PlaceholderTransaction) => BuildTransactionResult
) => {
  const trySet = (transaction: BuildTransactionResult | PlaceholderTransaction) => {
    if (transaction.id === transactionId) {
      return { ...setter(transaction) }
    }
    if (!isPlaceholderTransaction(transaction)) {
      if (transaction.type !== BuildableTransactionType.MethodCall) {
        return transaction
      }
      transaction.methodArgs = transaction.methodArgs.map((arg) => {
        if (typeof arg === 'object' && 'type' in arg) {
          return trySet(arg)
        }
        return arg
      })
    }
    return { ...transaction }
  }

  return transactions.map((transaction) => trySet(transaction) as BuildTransactionResult)
}

const ensureThereIsNoPlaceholderTransaction = (transactions: BuildTransactionResult[]) => {
  const predicate = !transactions.some(
    (transaction) =>
      transaction.type === BuildableTransactionType.MethodCall && transaction.methodArgs.some((arg) => isPlaceholderTransaction(arg))
  )
  invariant(predicate, 'Please build all transaction arguments for ABI method calls')
}
