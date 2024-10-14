import algosdk from 'algosdk'
import { useMemo, useState } from 'react'
import { BuildableTransactionType, BuildTransactionResult } from '../models'
import { useLoadableActiveWalletAddressSnapshotAtom } from '@/features/wallet/data/active-wallet'
import { invariant } from '@/utils/invariant'
import { RenderLoadable } from '@/features/common/components/render-loadable'
import { cn } from '@/features/common/utils'
import { Label } from '@/features/common/components/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/features/common/components/select'
import { TransactionBuilderMode } from '../data'
import { builderConfigs } from '@/features/transaction-wizard/data/builder-config'

export const transactionTypeLabel = 'Transaction type'

type Props = {
  transactionType?: algosdk.TransactionType
  type?: BuildableTransactionType
  mode: TransactionBuilderMode
  defaultValues?: Partial<BuildTransactionResult>
  transaction?: BuildTransactionResult
  onSubmit: (transaction: BuildTransactionResult) => void
  onCancel: () => void
  foo?: algosdk.ABITransactionType[]
}

export function TransactionBuilder({ mode, transactionType, type, transaction, defaultValues, onSubmit, onCancel, foo }: Props) {
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
            foo={foo}
          />
        </div>
      )}
    </RenderLoadable>
  )
}
