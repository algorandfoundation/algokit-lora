import algosdk from 'algosdk'
import { useCallback, useMemo, useState } from 'react'
import { DialogBodyProps, useDialogForm } from '@/features/common/hooks/use-dialog-form'
import { AsyncActionButton, Button } from '@/features/common/components/button'
import { TransactionBuilder } from './transaction-builder'
import { algod } from '@/features/common/data/algo-client'
import { useWallet } from '@txnlab/use-wallet'
import { invariant } from '@/utils/invariant'
import {
  BuildTransactionResult,
  BuildableTransactionType,
  BuildAppCallTransactionResult,
  BuildMethodCallTransactionResult,
} from '../models'
import { TransactionBuilderMode } from '../data'
import { TransactionsTable } from './transactions-table'
import { populateAppCallResources } from '@algorandfoundation/algokit-utils'
import { uint8ArrayToBase64 } from '@/utils/uint8-array-to-base64'
import {
  ConfirmTransactionsResourcesForm,
  TransactionResources,
} from '@/features/applications/components/confirm-transactions-resources-form'
import { isBuildTransactionResult } from '../utils/is-build-transaction-result'
import { HintText } from '@/features/forms/components/hint-text'
import { asError } from '@/utils/error'
import { Eraser, HardDriveDownload, Plus, Send } from 'lucide-react'
import { transactionGroupTableLabel } from './labels'
import React from 'react'
import { buildComposer } from '../data/common'

export const transactionTypeLabel = 'Transaction type'
export const sendButtonLabel = 'Send'
const connectWalletMessage = 'Please connect a wallet'
export const addTransactionLabel = 'Add Transaction'
export const transactionGroupLabel = 'Transaction Group'

type Props = {
  defaultTransactions?: BuildTransactionResult[]
  onSendTransactions: (transactions: BuildTransactionResult[]) => Promise<void>
  onReset: () => void
  title?: React.JSX.Element
  additionalActions?: React.JSX.Element
  disableAddTransaction?: boolean
  sendButtonConfig?: {
    label: string
    icon: React.JSX.Element
  }
}

const defaultTitle = <h4 className="pb-0 text-primary">{transactionGroupLabel}</h4>
const defaultSendButtonConfig = {
  label: sendButtonLabel,
  icon: <Send size={16} />,
}

export function TransactionsBuilder({
  defaultTransactions,
  onSendTransactions,
  onReset,
  title = defaultTitle,
  additionalActions,
  disableAddTransaction = false,
  sendButtonConfig = defaultSendButtonConfig,
}: Props) {
  const { activeAddress } = useWallet()
  const [transactions, setTransactions] = useState<BuildTransactionResult[]>(defaultTransactions ?? [])
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined)

  const nonDeletableTransactionIds = useMemo(() => {
    return defaultTransactions?.map((t) => t.id) ?? []
  }, [defaultTransactions])

  const { open: openTransactionBuilderDialog, dialog: transactionBuilderDialog } = useDialogForm({
    dialogHeader: 'Build Transaction',
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
        type={props.data.transaction?.type}
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

  // TODO: Support nested app calls
  const sendTransactions = useCallback(async () => {
    try {
      setErrorMessage(undefined)
      invariant(activeAddress, 'Please connect your wallet')

      await onSendTransactions(transactions)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error)
      setErrorMessage(asError(error).message)
    }
  }, [activeAddress, onSendTransactions, transactions])

  const populateResources = useCallback(async () => {
    try {
      setErrorMessage(undefined)
      invariant(activeAddress, 'Please connect your wallet')

      const composer = await buildComposer(transactions)
      const { atc } = await composer.build()
      const populatedAtc = await populateAppCallResources(atc, algod)
      const transactionsWithResources = populatedAtc.buildGroup()

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
      // eslint-disable-next-line no-console
      console.error(error)
      setErrorMessage(asError(error).message)
    }
  }, [transactions, activeAddress])

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

  const reset = useCallback(() => {
    setTransactions([])
    setErrorMessage(undefined)
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
          {title}
          {!disableAddTransaction && (
            <Button variant="outline-secondary" onClick={createTransaction} className="ml-auto" icon={<Plus size={16} />}>
              {addTransactionLabel}
            </Button>
          )}
        </div>
        <TransactionsTable
          ariaLabel={transactionGroupTableLabel}
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
        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-2">
            {additionalActions}
            <AsyncActionButton
              variant="outline"
              onClick={populateResources}
              icon={<HardDriveDownload size={16} />}
              {...populateResourcesButtonDisabledProps}
            >
              Populate Resources
            </AsyncActionButton>
          </div>
          <div className="left-auto flex gap-2">
            <Button onClick={reset} variant="outline" icon={<Eraser size={16} />}>
              Clear
            </Button>
            <AsyncActionButton className="w-28" onClick={sendTransactions} icon={sendButtonConfig.icon} {...sendButtonDisabledProps}>
              {sendButtonConfig.label}
            </AsyncActionButton>
          </div>
        </div>
      </div>
      {transactionBuilderDialog}
      {editResourcesDialog}
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
        const txns = transaction.methodArgs.filter((arg): arg is BuildTransactionResult => isBuildTransactionResult(arg))
        set(txns)
      }
    }
  }

  set(transactions)
}
