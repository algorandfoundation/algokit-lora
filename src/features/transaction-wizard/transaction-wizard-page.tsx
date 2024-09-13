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
import { assetOptInTransaction, assetOptOutTransaction, assetRevokeTransaction, assetTransferTransaction } from './data/asset-transactions'

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
    assetRevokeTransaction,
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
            {buildableTransaction === assetTransferTransaction && (
              <div
                id="alert-additional-content-1"
                className="mb-4 rounded-lg border border-blue-300 p-4 text-blue-800 dark:border-blue-800 dark:text-blue-400"
                role="alert"
              >
                <div className="flex items-center">
                  <svg
                    className="me-2 size-4 shrink-0"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
                  </svg>
                  <div className="text-sm">Note that the receiver must have opted in to the asset before it is transferred</div>
                </div>
              </div>
            )}
            <TransactionBuilderForm buildableTransaction={buildableTransaction} defaultSender={activeWalletAddressSnapshot} />
          </div>
        )}
      </RenderLoadable>
    </>
  )
}
