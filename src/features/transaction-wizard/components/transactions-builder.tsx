import algosdk from 'algosdk'
import { useCallback, useMemo, useState } from 'react'
import { DialogBodyProps, useDialogForm } from '@/features/common/hooks/use-dialog-form'
import { AsyncActionButton, Button } from '@/features/common/components/button'
import { TransactionBuilder } from './transaction-builder'
import { algod } from '@/features/common/data/algo-client'
import { useWallet } from '@txnlab/use-wallet'
import { invariant } from '@/utils/invariant'
import {
  BuildableTransactionType,
  BuildAppCallTransactionResult,
  BuildMethodCallTransactionResult,
  BuildTransactionResult,
  MethodCallArg,
  PlaceholderTransaction,
  SatisifiedByTransaction,
} from '../models'
import { TransactionBuilderMode } from '../data'
import { TransactionsTable } from './transactions-table'
import { populateAppCallResources } from '@algorandfoundation/algokit-utils'
import { uint8ArrayToBase64 } from '@/utils/uint8-array-to-base64'
import {
  ConfirmTransactionsResourcesForm,
  TransactionResources,
} from '@/features/applications/components/confirm-transactions-resources-form'
import { isBuildTransactionResult, isPlaceholderTransaction, isSatisfiedByTransaction } from '../utils/is-build-transaction-result'
import { HintText } from '@/features/forms/components/hint-text'
import { asError } from '@/utils/error'
import { Eraser, HardDriveDownload, Plus, Send } from 'lucide-react'
import { transactionGroupTableLabel } from './labels'
import React from 'react'
import { asAlgosdkTransactionType } from '../mappers/as-algosdk-transaction-type'
import { buildComposer } from '../data/common'
import { asAbiTransactionType } from '../mappers'

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
  disablePopulate?: boolean
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
  disablePopulate = false,
}: Props) {
  const { activeAddress } = useWallet()
  const [transactions, setTransactions] = useState<BuildTransactionResult[]>(defaultTransactions ?? []) // TODO: NC - Need to sort this part here
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
    setErrorMessage(undefined)
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
      ensureThereIsNoPlaceholderTransaction(transactions)

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
      ensureThereIsNoPlaceholderTransaction(transactions)

      const composer = await buildComposer(transactions)
      const { atc } = await composer.build()
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
  }, [transactions])

  const editTransaction = useCallback(
    async (transaction: BuildTransactionResult | PlaceholderTransaction | SatisifiedByTransaction) => {
      setErrorMessage(undefined)
      try {
        const txn = await (transaction.type === BuildableTransactionType.Placeholder ||
        transaction.type === BuildableTransactionType.SatisfiedBy
          ? openTransactionBuilderDialog({
              mode: TransactionBuilderMode.Create,
              type: asAlgosdkTransactionType(transaction.targetType),
            })
          : openTransactionBuilderDialog({
              mode: TransactionBuilderMode.Edit,
              transaction: transaction,
            }))
        if (txn) {
          setTransactions(patchTransactions(transactions, transaction.id, txn))
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error)
        setErrorMessage(asError(error).message)
      }
    },
    [openTransactionBuilderDialog, transactions]
  )

  const deleteTransaction = useCallback((transaction: BuildTransactionResult) => {
    setErrorMessage(undefined)
    setTransactions((prev) => prev.filter((t) => t.id !== transaction.id))
  }, [])

  const editResources = useCallback(
    async (transaction: BuildAppCallTransactionResult | BuildMethodCallTransactionResult) => {
      setErrorMessage(undefined)
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
    onReset?.()
  }, [onReset])

  const populateResourcesButtonDisabledProps = useMemo(() => {
    if (!transactions.find((t) => t.type === BuildableTransactionType.AppCall || t.type === BuildableTransactionType.MethodCall)) {
      return {
        disabled: true,
        disabledReason: 'No application call transactions',
      }
    }

    return {
      disabled: false,
    }
  }, [transactions])

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
          <div className="flex gap-2">
            {additionalActions}
            {!disablePopulate && (
              <AsyncActionButton
                variant="outline"
                onClick={populateResources}
                icon={<HardDriveDownload size={16} />}
                {...populateResourcesButtonDisabledProps}
              >
                Populate Resources
              </AsyncActionButton>
            )}
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

const flattenTransactions2 = (
  transactions: (BuildTransactionResult | PlaceholderTransaction | SatisifiedByTransaction)[],
  argFilterPredicate: (arg: MethodCallArg) => boolean
): (BuildTransactionResult | PlaceholderTransaction | SatisifiedByTransaction)[] => {
  return transactions.reduce(
    (acc, transaction) => {
      if (transaction.type === BuildableTransactionType.MethodCall) {
        // TODO: NC - It's not great running multiple filters
        const methodCallArgs = transaction.methodArgs
          .filter((arg) => isBuildTransactionResult(arg) || isPlaceholderTransaction(arg) || isSatisfiedByTransaction(arg))
          .filter(argFilterPredicate)
        return [...acc, ...flattenTransactions2(methodCallArgs, argFilterPredicate), transaction]
      }
      return [...acc, transaction]
    },
    [] as (BuildTransactionResult | PlaceholderTransaction | SatisifiedByTransaction)[]
  )
}

const setTransactionResources = (transactions: BuildTransactionResult[], transactionId: string, resources: TransactionResources) => {
  return setTransaction(transactions, transactionId, (transaction) => {
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

/*
prev
[
  method: {
    args: [payPlaceholder or pay, appCallPlaceholder]
  }
]

txn
appCallPlaceholder {
  args: [payPlaceholder] <-- Needs to go as deep as the number of txn args
}

===> if it's a pay, we need to replace the payPlaceholder with the pay and then substitute in, then make the parent arg undefined or something else to indicate it's been statisifed


Do a replacements type setup


*/

export const patchTransactions = (
  previousTransactions: BuildTransactionResult[],
  previousId: string,
  newTransaction: BuildTransactionResult
): BuildTransactionResult[] => {
  const replacements = new Array<[string, BuildTransactionResult | PlaceholderTransaction | SatisifiedByTransaction]>([
    previousId,
    newTransaction,
  ])

  // TODO: NC - Handle rendering the position of all transaction the arg statisfies "Build argument for transaction..."

  if (newTransaction.type === BuildableTransactionType.MethodCall) {
    const existingGroup = flattenTransactions2(
      previousTransactions,
      (arg) => isBuildTransactionResult(arg) || isPlaceholderTransaction(arg)
    )
    // Find the transaction
    const index = existingGroup.findIndex((t) => t.id === previousId)

    if (index > 0) {
      newTransaction.methodArgs
        .filter((arg) => isBuildTransactionResult(arg) || isPlaceholderTransaction(arg))
        .reverse()
        .forEach((arg) => {
          const previousIndexInGroup = index - 1
          if (previousIndexInGroup >= 0) {
            const previousTransactionInGroup = existingGroup[previousIndexInGroup]

            // TODO: NC - Handle `any` transactions as well <-- I think this is already done. Confirm.

            // TODO: NC - thing might not be linked to the app call transaction at all. Ensure it is.
            const previousTransactionInGroupType =
              previousTransactionInGroup.type === BuildableTransactionType.Placeholder
                ? previousTransactionInGroup.targetType
                : asAbiTransactionType(previousTransactionInGroup.type)
            const argType = arg.type === BuildableTransactionType.Placeholder ? arg.targetType : asAbiTransactionType(arg.type)

            // TODO: NC - Handle the edit scenarios to ensure the we don't attach the arg to the wrong transaction

            // If you have a full group, then you change, handle that...

            // TODO: NC - Handle when a placeholder has been built

            // TODO: NC - Ensure the transaction is linked, otherwise don't do anything

            if (previousTransactionInGroupType === argType || previousTransactionInGroupType === algosdk.ABITransactionType.any) {
              replacements.push([
                previousTransactionInGroup.id,
                {
                  id: previousTransactionInGroup.id,
                  type: BuildableTransactionType.SatisfiedBy,
                  targetType: previousTransactionInGroupType,
                  satisfiedById: arg.id,
                } satisfies SatisifiedByTransaction,
              ])

              if (previousTransactionInGroup.type !== BuildableTransactionType.Placeholder) {
                replacements.push([arg.id, { ...previousTransactionInGroup, id: arg.id }])
              }
            } else {
              throw new Error('Failed to insert transaction arg, it will create an invalid group')
            }
          }
        })
    }
  }

  const nextTransactions = replacements.reduce((acc, [id, replacement]) => {
    return setTransaction(acc, id, replacement)
  }, previousTransactions)

  // Check if there is a satisfied by without a transaction
  const temp = flattenTransactions2(
    nextTransactions,
    (arg) => isBuildTransactionResult(arg) || isPlaceholderTransaction(arg) || isSatisfiedByTransaction(arg)
  )

  const additionalReplacements = new Array<[string, BuildTransactionResult | PlaceholderTransaction | SatisifiedByTransaction]>()
  const satisfiedByItems = temp.filter((arg) => arg.type === BuildableTransactionType.SatisfiedBy)
  satisfiedByItems.forEach((satisfiedBy) => {
    const satisfiedByTransaction = temp.find((arg) => arg.id === satisfiedBy.satisfiedById)
    if (!satisfiedByTransaction) {
      additionalReplacements.push([
        satisfiedBy.id,
        {
          id: satisfiedBy.id,
          type: BuildableTransactionType.Placeholder,
          targetType: satisfiedBy.targetType,
          methodCallTransactionId: 'hirearchy-needed', // TODO: NC - Fix this
        },
      ])
    }
  })

  return additionalReplacements.length > 0
    ? additionalReplacements.reduce((acc, [id, replacement]) => {
        return setTransaction(acc, id, replacement)
      }, nextTransactions)
    : nextTransactions
}

const setTransaction = (
  transactions: BuildTransactionResult[],
  transactionId: string,
  nextTransaction:
    | (BuildTransactionResult | PlaceholderTransaction | SatisifiedByTransaction)
    | ((
        oldTxn: BuildTransactionResult | PlaceholderTransaction | SatisifiedByTransaction
      ) => BuildTransactionResult | PlaceholderTransaction | SatisifiedByTransaction)
) => {
  const trySet = (transaction: BuildTransactionResult | PlaceholderTransaction | SatisifiedByTransaction) => {
    if (transaction.id === transactionId) {
      const next = typeof nextTransaction === 'function' ? nextTransaction(transaction) : nextTransaction
      return { ...next }
    }
    if (
      transaction.type === BuildableTransactionType.SatisfiedBy &&
      transaction.satisfiedById === transactionId &&
      typeof nextTransaction !== 'function'
    ) {
      return {
        ...transaction,
        satisfiedById: nextTransaction.id,
      }
    }
    if (transaction.type !== BuildableTransactionType.MethodCall) {
      return transaction
    }

    // Look at the transaction that was set and adjust the args accordingly

    transaction.methodArgs = transaction.methodArgs.map((arg) => {
      if (typeof arg === 'object' && 'type' in arg) {
        return trySet(arg)
      }
      return arg
    })
    return { ...transaction }
  }

  return transactions.map((transaction) => trySet(transaction) as BuildTransactionResult)
}

const ensureThereIsNoPlaceholderTransaction = (transactions: BuildTransactionResult[]) => {
  const predicate = !transactions.some(
    (transaction) =>
      transaction.type === BuildableTransactionType.MethodCall &&
      transaction.methodArgs.some((arg) => typeof arg === 'object' && 'type' in arg && arg.type === BuildableTransactionType.Placeholder)
  )
  invariant(predicate, 'Please build all transaction arguments for ABI method calls')
}
