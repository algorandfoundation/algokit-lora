import { PageTitle } from '@/features/common/components/page-title'
import { paymentTransaction, accountCloseTransaction } from './data/payment-transactions'
import { useCallback, useState } from 'react'
import { Label } from '../common/components/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../common/components/select'
import { cn } from '../common/utils'
import { invariant } from '@/utils/invariant'
import { RenderLoadable } from '../common/components/render-loadable'
import { PageLoader } from '../common/components/page-loader'
import { useLoadableActiveWalletAddressSnapshotAtom } from '../wallet/data/active-wallet'
import { TransactionBuilderForm } from './components/transaction-builder-form'
import { assetOptInTransaction, assetOptOutTransaction, assetTransferTransaction } from './data/asset-transactions'

export const transactionWizardPageTitle = 'Transaction Wizard'
export const transactionTypeLabel = 'Transaction type'
export const sendButtonLabel = 'Send'

export function TransactionWizardPage() {
  const [selectedBuildableTransactionIndex, setSelectedBuildableIndex] = useState(0)
  const loadableActiveWalletAddressSnapshot = useLoadableActiveWalletAddressSnapshotAtom()

  const buildableTransactions = [
    paymentTransaction,
    accountCloseTransaction,
    assetTransferTransaction,
    assetOptInTransaction,
    assetOptOutTransaction,
  ]
  invariant(selectedBuildableTransactionIndex < buildableTransactions.length, 'Invalid transaction type index')

  const buildableTransaction = buildableTransactions[selectedBuildableTransactionIndex]

  const changeSelectedBuildableTransaction = useCallback(async (value: string) => {
    setSelectedBuildableIndex(Number(value))
  }, [])

  return (
    <>
      <PageTitle title={transactionWizardPageTitle} />
      <RenderLoadable loadable={loadableActiveWalletAddressSnapshot} fallback={<PageLoader />}>
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
            <TransactionBuilderForm buildableTransaction={buildableTransaction} defaultSender={activeWalletAddressSnapshot} />
          </div>
        )}
      </RenderLoadable>
    </>
  )
}
