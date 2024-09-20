import algosdk from 'algosdk'
import { useCallback, useMemo, useState } from 'react'
import { AppCallTransactionBuilderResult, BuildableTransactionType } from '../models'
import { AppCallTransactionBuilder } from './app-call-transaction-builder'
import { useLoadableActiveWalletAddressSnapshotAtom } from '@/features/wallet/data/active-wallet'
import { invariant } from '@/utils/invariant'
import { RenderLoadable } from '@/features/common/components/render-loadable'
import { cn } from '@/features/common/utils'
import { Label } from '@/features/common/components/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/features/common/components/select'
import { TransactionBuilderForm } from './transaction-builder-form'
import { PaymentTransactionBuilder } from './payment-transaction-builder'

type Props = {
  type?: BuildableTransactionType
  defaultSender?: string
  onSubmit: (transaction: algosdk.Transaction) => void
  onCancel: () => void
}

export const transactionWizardPageTitle = 'Transaction Wizard'
export const transactionTypeLabel = 'Transaction type'
const connectWalletMessage = 'Please connect a wallet'
export const sendButtonLabel = 'Send'

export type TransactionBuilderFormProps = {
  onSubmit: (transaction: algosdk.Transaction) => void
  onCancel: () => void
}

const transactionTypes: Record<
  BuildableTransactionType,
  {
    label: string
    component: React.ComponentType<TransactionBuilderFormProps>
  }
> = {
  [BuildableTransactionType.Payment]: {
    label: 'Payment',
    component: PaymentTransactionBuilder,
  },
  [BuildableTransactionType.AccountClose]: {
    label: 'Account Close',
    component: AppCallTransactionBuilder,
  },
  [BuildableTransactionType.AppCall]: {
    label: 'App Call',
    component: AppCallTransactionBuilder,
  },
}

const buildableTransactions = Object.values(transactionTypes)

export function TransactionBuilder({ type, defaultSender, onSubmit, onCancel }: Props) {
  const [selectedBuildableTransactionIndex, setSelectedBuildableTransactionIndex] = useState(0)
  const loadableActiveWalletAddressSnapshot = useLoadableActiveWalletAddressSnapshotAtom()

  invariant(selectedBuildableTransactionIndex < buildableTransactions.length, 'Invalid transaction type index')

  const changeSelectedBuildableTransaction = useCallback(async (value: string) => {
    setSelectedBuildableTransactionIndex(Number(value))
  }, [])

  const FormComponent = useMemo(
    () => buildableTransactions[selectedBuildableTransactionIndex].component,
    [selectedBuildableTransactionIndex]
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
          <FormComponent onSubmit={onSubmit} onCancel={onCancel} />
        </div>
      )}
    </RenderLoadable>
  )
}
