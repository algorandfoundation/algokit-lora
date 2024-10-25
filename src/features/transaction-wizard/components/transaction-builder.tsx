import algosdk from 'algosdk'
import { useMemo, useState } from 'react'
import { BuildableTransactionType, BuildTransactionResult } from '../models'
import { MethodCallTransactionBuilder } from './method-call-transaction-builder'
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
import { AssetOptOutTransactionBuilder } from './asset-opt-out-transaction-builder'
import { AssetClawbackTransactionBuilder } from './asset-clawback-transaction-builder'
import { AssetCreateTransactionBuilder } from './asset-create-transaction-builder'
import { AssetReconfigureTransactionBuilder } from './asset-reconfigure-transaction-builder'
import { AssetDestroyTransactionBuilder } from './asset-destroy-transaction-builder'
import { AppCallTransactionBuilder } from './app-call-transaction-builder'
import { AccountCloseTransactionBuilder } from './account-close-transaction-builder'
import { AssetFreezeTransactionBuilder } from './asset-freeze-transaction-builder'
import { KeyRegistrationTransactionBuilder } from './key-registration-transaction-builder'

export const transactionTypeLabel = 'Transaction type'

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
    component: AccountCloseTransactionBuilder,
  },
  {
    transactionType: algosdk.TransactionType.appl,
    type: BuildableTransactionType.AppCall,
    label: 'Application Call (appl)',
    component: AppCallTransactionBuilder,
  },
  {
    transactionType: algosdk.TransactionType.appl,
    type: BuildableTransactionType.MethodCall,
    label: 'ABI Method Call (appl)',
    component: MethodCallTransactionBuilder,
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
    component: AssetOptOutTransactionBuilder,
  },
  {
    transactionType: algosdk.TransactionType.axfer,
    type: BuildableTransactionType.AssetClawback,
    label: 'Asset clawback (axfer)',
    component: AssetClawbackTransactionBuilder,
  },
  {
    transactionType: algosdk.TransactionType.acfg,
    type: BuildableTransactionType.AssetCreate,
    label: 'Asset create (acfg)',
    component: AssetCreateTransactionBuilder,
  },
  {
    transactionType: algosdk.TransactionType.acfg,
    type: BuildableTransactionType.AssetReconfigure,
    label: 'Asset reconfigure (acfg)',
    component: AssetReconfigureTransactionBuilder,
  },
  {
    transactionType: algosdk.TransactionType.acfg,
    type: BuildableTransactionType.AssetDestroy,
    label: 'Asset destroy (acfg)',
    component: AssetDestroyTransactionBuilder,
  },
  {
    transactionType: algosdk.TransactionType.afrz,
    type: BuildableTransactionType.AssetFreeze,
    label: 'Asset freeze (afrz)',
    component: AssetFreezeTransactionBuilder,
  },
  {
    transactionType: algosdk.TransactionType.keyreg,
    type: BuildableTransactionType.KeyRegistration,
    label: 'Key registration (keyreg)',
    component: KeyRegistrationTransactionBuilder,
  },
]

type Props = {
  transactionType?: algosdk.TransactionType
  type?: BuildableTransactionType
  mode: TransactionBuilderMode
  defaultValues?: Partial<BuildTransactionResult>
  transaction?: BuildTransactionResult
  onSubmit: (transaction: BuildTransactionResult) => void
  onCancel: () => void
}

export function TransactionBuilder({ mode, transactionType, type, transaction, defaultValues, onSubmit, onCancel }: Props) {
  const loadableActiveWalletAddressSnapshot = useLoadableActiveWalletAddressSnapshotAtom()

  const validBuilderConfigs = useMemo(() => {
    if (transactionType !== undefined) {
      return builderConfigs.filter((builderConfig) => builderConfig.transactionType === transactionType)
    }
    return builderConfigs
  }, [transactionType])
  const [selectedBuilderType, setSelectedBuilderType] = useState<BuildableTransactionType>(
    transaction?.type ?? type ?? validBuilderConfigs[0].type
  )

  const FormComponent = useMemo(() => {
    const component = builderConfigs.find((builderConfig) => builderConfig.type === selectedBuilderType)?.component
    invariant(component, 'Component not found')
    return component
  }, [selectedBuilderType])

  return (
    <RenderLoadable loadable={loadableActiveWalletAddressSnapshot}>
      {(activeWalletAddressSnapshot) => (
        <div>
          {!type && (
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
          )}

          <FormComponent
            mode={mode}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            defaultValues={defaultValues as any}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            transaction={transaction as any}
            onSubmit={onSubmit}
            onCancel={onCancel}
            activeAddress={activeWalletAddressSnapshot}
          />
        </div>
      )}
    </RenderLoadable>
  )
}
