import algosdk from 'algosdk'
import { useCallback, useMemo, useState } from 'react'
import { BuildableTransactionType, TransactionBuilderResult } from '../models'
import { AppCallTransactionBuilder } from './app-call-transaction-builder'
import { useLoadableActiveWalletAddressSnapshotAtom } from '@/features/wallet/data/active-wallet'
import { invariant } from '@/utils/invariant'
import { RenderLoadable } from '@/features/common/components/render-loadable'
import { cn } from '@/features/common/utils'
import { Label } from '@/features/common/components/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/features/common/components/select'
import { PaymentTransactionBuilder } from './payment-transaction-builder'

type Props = {
  type?: algosdk.TransactionType
  defaultSender?: string // TODO: PD - default sender?
  transaction?: Partial<TransactionBuilderResult>
  onSubmit: (transaction: TransactionBuilderResult) => void
  onCancel: () => void
}

export const transactionWizardPageTitle = 'Transaction Wizard'
export const transactionTypeLabel = 'Transaction type'
const connectWalletMessage = 'Please connect a wallet'
export const sendButtonLabel = 'Send'

export type TransactionBuilderFormProps<T extends TransactionBuilderResult> = {
  transaction?: Partial<T>
  onSubmit: (transaction: T) => void
  onCancel: () => void
}

const transactionTypes = {
  [BuildableTransactionType.Payment]: {
    transactionType: algosdk.TransactionType.pay,
    label: 'Payment',
    component: PaymentTransactionBuilder,
  },
  [BuildableTransactionType.AccountClose]: {
    transactionType: algosdk.TransactionType.pay,
    label: 'Account Close',
    component: AppCallTransactionBuilder,
  },
  [BuildableTransactionType.AppCall]: {
    transactionType: algosdk.TransactionType.appl,
    label: 'App Call',
    component: AppCallTransactionBuilder,
  },
}

export function TransactionBuilder({ type, transaction, onSubmit, onCancel }: Props) {
  const [selectedBuildableTransactionIndex, setSelectedBuildableTransactionIndex] = useState(0)
  const loadableActiveWalletAddressSnapshot = useLoadableActiveWalletAddressSnapshotAtom()

  const buildableTransactions = useMemo(() => {
    if (type !== undefined) {
      return Object.values(transactionTypes).filter((transaction) => transaction.transactionType === type)
    }
    return Object.values(transactionTypes)
  }, [type])

  const changeSelectedBuildableTransaction = useCallback(
    (value: string) => {
      const index = Number(value)
      invariant(index < buildableTransactions.length, 'Invalid transaction type index')
      setSelectedBuildableTransactionIndex(index)
    },
    [buildableTransactions]
  )

  const FormComponent = useMemo(
    () => buildableTransactions[selectedBuildableTransactionIndex].component,
    [buildableTransactions, selectedBuildableTransactionIndex]
  )

  return (
    <RenderLoadable loadable={loadableActiveWalletAddressSnapshot}>
      {(activeWalletAddressSnapshot) => (
        <div className="lg:w-1/2">
          <div className={cn('flex w-72 flex-col mb-4')}>
            <Label htmlFor="transaction-type" className={cn('ml-0.5 mb-2')}>
              {transactionTypeLabel}
            </Label>
            <Select onValueChange={changeSelectedBuildableTransaction} value={selectedBuildableTransactionIndex.toString()}>
              <SelectTrigger id="transaction-type">
                <SelectValue placeholder="Select transaction type" />
              </SelectTrigger>
              <SelectContent className={cn('bg-card text-card-foreground')}>
                {buildableTransactions.map((transaction, i) => (
                  <SelectItem key={i} value={i.toString()}>
                    {transaction.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* TODO: PD - fix transaction as any */}
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <FormComponent transaction={transaction as any} onSubmit={onSubmit} onCancel={onCancel} />
        </div>
      )}
    </RenderLoadable>
  )
}
