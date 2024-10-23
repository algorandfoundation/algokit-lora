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
  PlaceholderTransaction,
  FulfilledByTransaction,
} from '../models'
import { TransactionBuilderMode } from '../data'
import { TransactionsTable } from './transactions-table'
import { populateAppCallResources } from '@algorandfoundation/algokit-utils'
import { uint8ArrayToBase64 } from '@/utils/uint8-array-to-base64'
import {
  ConfirmTransactionsResourcesForm,
  TransactionResources,
} from '@/features/applications/components/confirm-transactions-resources-form'
import { isBuildTransactionResult, isPlaceholderTransaction } from '../utils/transaction-result-narrowing'
import { HintText } from '@/features/forms/components/hint-text'
import { asError } from '@/utils/error'
import { Eraser, HardDriveDownload, Plus, Send, SquarePlay } from 'lucide-react'
import { transactionGroupTableLabel } from './labels'
import React from 'react'
import { asAlgosdkTransactionType } from '../mappers/as-algosdk-transaction-type'
import { buildComposer, buildComposerWithEmptySignatures } from '../data/common'
import { asAbiTransactionType } from '../mappers'
import AlgoKitComposer, { SimulateOptions } from '@algorandfoundation/algokit-utils/types/composer'
import { Label } from '@/features/common/components/label'
import { Checkbox } from '@/features/common/components/checkbox'

export const transactionTypeLabel = 'Transaction type'
export const sendButtonLabel = 'Send'
const connectWalletMessage = 'Please connect a wallet'
export const addTransactionLabel = 'Add Transaction'
export const transactionGroupLabel = 'Transaction Group'

export type SimulateResult = Awaited<ReturnType<AlgoKitComposer['simulate']>>

type Props = {
  defaultTransactions?: BuildTransactionResult[]
  onSendTransactions: (transactions: BuildTransactionResult[]) => Promise<void>
  onSimulated?: (result: SimulateResult) => void
  onReset: () => void
  title?: React.JSX.Element
  additionalActions?: React.JSX.Element
  disableAddTransaction?: boolean
  disablePopulate?: boolean
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
  onSimulated,
  onReset,
  title = defaultTitle,
  additionalActions,
  disableAddTransaction = false,
  disablePopulate = false,
  sendButtonConfig = defaultSendButtonConfig,
}: Props) {
  const { activeAddress } = useWallet()
  const [transactions, setTransactions] = useState<BuildTransactionResult[]>(defaultTransactions ?? [])
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined)
  const [requireSignaturesOnSimulate, setRequireSignaturesOnSimulate] = useState(false)

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

  const simulateTransactions = useCallback(async () => {
    try {
      setErrorMessage(undefined)
      ensureThereIsNoPlaceholderTransaction(transactions)

      const simulateConfig = {
        execTraceConfig: new algosdk.modelsv2.SimulateTraceConfig({
          enable: true,
          scratchChange: true,
          stackChange: true,
          stateChange: true,
        }),
      } satisfies SimulateOptions
      const result = await (requireSignaturesOnSimulate
        ? (await buildComposer(transactions)).simulate(simulateConfig)
        : (await buildComposerWithEmptySignatures(transactions)).simulate({ ...simulateConfig, allowEmptySignatures: true }))

      return onSimulated?.(result)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error)
      setErrorMessage(asError(error).message)
    }
  }, [onSimulated, requireSignaturesOnSimulate, transactions])

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
    async (transaction: BuildTransactionResult | PlaceholderTransaction | FulfilledByTransaction) => {
      setErrorMessage(undefined)
      try {
        const txn = await (transaction.type === BuildableTransactionType.Placeholder ||
        transaction.type === BuildableTransactionType.Fulfilled
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

  const commonButtonDisableProps = useMemo(() => {
    if (transactions.length === 0) {
      return {
        disabled: true,
        disabledReason: 'No transactions to send',
      }
    }

    const groupTransactionCount = flattenTransactions(transactions).length
    if (groupTransactionCount > 16) {
      return {
        disabled: true,
        disabledReason: 'A group can have a max of 16 transactions',
      }
    }

    return {
      disabled: false,
    }
  }, [transactions])

  const simulateButtonDisabledProps = useMemo(() => {
    if (requireSignaturesOnSimulate && !activeAddress) {
      return {
        disabled: true,
        disabledReason: connectWalletMessage,
      }
    }

    return commonButtonDisableProps
  }, [activeAddress, commonButtonDisableProps, requireSignaturesOnSimulate])

  const sendButtonDisabledProps = useMemo(() => {
    if (!activeAddress) {
      return {
        disabled: true,
        disabledReason: connectWalletMessage,
      }
    }

    return commonButtonDisableProps
  }, [activeAddress, commonButtonDisableProps])

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
        {onSimulated && (
          <div className="grid">
            <div className="ml-auto flex items-center space-x-2">
              <Checkbox
                id="require-signatures-on-simulate"
                name="require-signatures-on-simulate"
                checked={requireSignaturesOnSimulate}
                onCheckedChange={(checked) => setRequireSignaturesOnSimulate(typeof checked == 'boolean' ? checked : false)}
              />
              <Label htmlFor="require-signatures-on-simulate">Require signatures on simulate</Label>
            </div>
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
            {onSimulated && (
              <AsyncActionButton
                className="w-28"
                onClick={simulateTransactions}
                icon={<SquarePlay size={16} />}
                {...simulateButtonDisabledProps}
              >
                Simulate
              </AsyncActionButton>
            )}
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

const buildRelatedTransactionsGroup = (transaction: BuildTransactionResult) => {
  if (transaction.type === BuildableTransactionType.MethodCall) {
    if (!transaction.methodArgs) {
      return []
    }

    return transaction.methodArgs.reduce(
      (acc, arg) => {
        if (isBuildTransactionResult(arg)) {
          acc.push(...buildRelatedTransactionsGroup(arg).concat(arg))
        }
        if (
          typeof arg === 'object' &&
          'type' in arg &&
          [BuildableTransactionType.Placeholder, BuildableTransactionType.Fulfilled].includes(arg.type)
        ) {
          acc.push(arg)
        }
        return acc
      },
      [] as (BuildTransactionResult | PlaceholderTransaction | FulfilledByTransaction)[]
    )
  }

  return []
}

const buildRelatedTransactionsGroups = (transactions: BuildTransactionResult[]) => {
  return transactions.map((transaction) => {
    return buildRelatedTransactionsGroup(transaction)
  })
}

export const patchTransactions = (
  previousTransactions: BuildTransactionResult[],
  previousId: string,
  newTransaction: BuildTransactionResult
): BuildTransactionResult[] => {
  const replacements = new Array<[string, BuildTransactionResult | PlaceholderTransaction | FulfilledByTransaction]>([
    previousId,
    newTransaction,
  ])

  if (newTransaction.type === BuildableTransactionType.MethodCall) {
    const relatedTransactions = buildRelatedTransactionsGroups(previousTransactions).find((group) => group.some((t) => t.id === previousId))

    if (relatedTransactions) {
      const index = relatedTransactions.findIndex((t) => t.id === previousId)
      newTransaction.methodArgs
        .filter((arg) => isBuildTransactionResult(arg) || isPlaceholderTransaction(arg))
        .reverse()
        .forEach((arg) => {
          const previousRelatedTransactionsIndex = index - 1
          if (previousRelatedTransactionsIndex >= 0) {
            const previousRelatedTransaction = relatedTransactions[previousRelatedTransactionsIndex]

            const previousRelatedTransactionType =
              previousRelatedTransaction.type === BuildableTransactionType.Placeholder ||
              previousRelatedTransaction.type === BuildableTransactionType.Fulfilled
                ? previousRelatedTransaction.targetType
                : asAbiTransactionType(previousRelatedTransaction.type)
            const argType = arg.type === BuildableTransactionType.Placeholder ? arg.targetType : asAbiTransactionType(arg.type)

            if (
              previousRelatedTransactionType === argType ||
              previousRelatedTransactionType === algosdk.ABITransactionType.any ||
              argType === algosdk.ABITransactionType.any
            ) {
              replacements.push([
                previousRelatedTransaction.id,
                {
                  id: previousRelatedTransaction.id,
                  type: BuildableTransactionType.Fulfilled,
                  targetType: previousRelatedTransactionType,
                  fulfilledById: arg.id,
                } satisfies FulfilledByTransaction,
              ])

              if (previousRelatedTransactionType === argType && previousRelatedTransaction.type !== BuildableTransactionType.Placeholder) {
                replacements.push([arg.id, { ...previousRelatedTransaction, id: arg.id }])
              } else if (argType === algosdk.ABITransactionType.any && arg.type === BuildableTransactionType.Placeholder) {
                replacements.push([arg.id, { ...arg, targetType: previousRelatedTransactionType }])
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

  // It's possible that a transaction fulfilling another transaction has been replaced, so change these back to placeholders
  const additionalReplacements = buildRelatedTransactionsGroups(nextTransactions).reduce((acc, group) => {
    group
      .filter((arg) => arg.type === BuildableTransactionType.Fulfilled)
      .forEach((fulfilled) => {
        const fulfilledByTransaction = group.find((arg) => arg.id === fulfilled.fulfilledById)
        if (!fulfilledByTransaction) {
          acc.push([
            fulfilled.id,
            {
              id: fulfilled.id,
              type: BuildableTransactionType.Placeholder,
              targetType: fulfilled.targetType,
            },
          ])
        }
      })

    return acc
  }, new Array<[string, BuildTransactionResult | PlaceholderTransaction | FulfilledByTransaction]>())

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
    | (BuildTransactionResult | PlaceholderTransaction | FulfilledByTransaction)
    | ((
        oldTxn: BuildTransactionResult | PlaceholderTransaction | FulfilledByTransaction
      ) => BuildTransactionResult | PlaceholderTransaction | FulfilledByTransaction)
) => {
  const trySet = (transaction: BuildTransactionResult | PlaceholderTransaction | FulfilledByTransaction) => {
    if (transaction.id === transactionId) {
      const next = typeof nextTransaction === 'function' ? nextTransaction(transaction) : nextTransaction
      return { ...next }
    }
    if (
      transaction.type === BuildableTransactionType.Fulfilled &&
      transaction.fulfilledById === transactionId &&
      typeof nextTransaction !== 'function'
    ) {
      return {
        ...transaction,
        fulfilledById: nextTransaction.id,
      }
    }
    if (transaction.type !== BuildableTransactionType.MethodCall) {
      return transaction
    }

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
