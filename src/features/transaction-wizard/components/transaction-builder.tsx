import algosdk from 'algosdk'
import { useMemo, useState } from 'react'
import { BuildableTransactionType, BuildTransactionResult } from '../models'
import { AppCallTransactionBuilder } from './app-call-transaction-builder'
import { useLoadableActiveWalletAddressSnapshotAtom } from '@/features/wallet/data/active-wallet'
import { invariant } from '@/utils/invariant'
import { RenderLoadable } from '@/features/common/components/render-loadable'
import { cn } from '@/features/common/utils'
import { Label } from '@/features/common/components/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/features/common/components/select'
import { PaymentTransactionBuilder } from './payment-transaction-builder'
import { AssetTransferTransactionBuilder } from './asset-transfer-transaction-builder'
import { AssetOptInTransactionBuilder } from './asset-opt-in-transaction-builder'
import { TransactionBuilderMode } from '../data'

export const transactionTypeLabel = 'Transaction type'
const connectWalletMessage = 'Please connect a wallet'
export const sendButtonLabel = 'Send'

const builderConfigs = [
  {
    transactionType: algosdk.TransactionType.pay,
    type: BuildableTransactionType.Payment,
    label: 'Payment (pay)',
    component: PaymentTransactionBuilder,
  },
  {
    transactionType: algosdk.TransactionType.pay,
    type: BuildableTransactionType.AccountClose,
    label: 'Account Close (pay)',
    component: PaymentTransactionBuilder,
  },
  {
    transactionType: algosdk.TransactionType.appl,
    type: BuildableTransactionType.AppCall,
    label: 'App Call',
    component: AppCallTransactionBuilder,
  },
  {
    transactionType: algosdk.TransactionType.axfer,
    type: BuildableTransactionType.AssetTransfer,
    label: 'Asset Transfer (axfer)',
    component: AssetTransferTransactionBuilder,
  },
  {
    transactionType: algosdk.TransactionType.axfer,
    type: BuildableTransactionType.AssetOptIn,
    label: 'Asset opt-in (axfer)',
    component: AssetOptInTransactionBuilder,
  },
  {
    transactionType: algosdk.TransactionType.axfer,
    type: BuildableTransactionType.AssetOptOut,
    label: 'Asset opt-out (axfer)',
    component: AssetTransferTransactionBuilder,
  },
  {
    transactionType: algosdk.TransactionType.axfer,
    type: BuildableTransactionType.AssetRevoke,
    label: 'Asset revoke (axfer)',
    component: AssetTransferTransactionBuilder,
  },
]

type Props = {
  type?: algosdk.TransactionType
  defaultSender?: string // TODO: PD - default sender?
  mode: TransactionBuilderMode
  defaultValues?: Partial<BuildTransactionResult>
  transaction?: BuildTransactionResult
  onSubmit: (transaction: BuildTransactionResult) => void
  onCancel: () => void
}

export function TransactionBuilder({ mode, type, transaction, defaultValues, onSubmit, onCancel }: Props) {
  const loadableActiveWalletAddressSnapshot = useLoadableActiveWalletAddressSnapshotAtom()

  const validBuilderConfigs = useMemo(() => {
    if (type !== undefined) {
      return builderConfigs.filter((builderConfig) => builderConfig.transactionType === type)
    }
    return builderConfigs
  }, [type])
  const [selectedBuilderType, setSelectedBuilderType] = useState<BuildableTransactionType>(transaction?.type ?? validBuilderConfigs[0].type)

  const FormComponent = useMemo(() => {
    const component = validBuilderConfigs.find((builderConfig) => builderConfig.type === selectedBuilderType)?.component
    invariant(component, 'Component not found')
    return component
  }, [selectedBuilderType, validBuilderConfigs])

  return (
    <RenderLoadable loadable={loadableActiveWalletAddressSnapshot}>
      {(activeWalletAddressSnapshot) => (
        <div>
          <div className={cn('flex flex-col mb-4')}>
            <Label htmlFor="transaction-type" className={cn('ml-0.5 mb-2')}>
              {transactionTypeLabel}
            </Label>
            <Select onValueChange={(value) => setSelectedBuilderType(value as BuildableTransactionType)} value={selectedBuilderType}>
              <SelectTrigger id="transaction-type">
                <SelectValue placeholder="Select transaction type" />
              </SelectTrigger>
              <SelectContent className={cn('bg-card text-card-foreground')}>
                {validBuilderConfigs.map((config) => (
                  <SelectItem key={config.type} value={config.type}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* TODO: PD - fix transaction as any */}
          <FormComponent
            mode={mode}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            defaultValues={defaultValues as any}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            transaction={transaction as any}
            onSubmit={onSubmit}
            onCancel={onCancel}
          />
        </div>
      )}
    </RenderLoadable>
  )
}
