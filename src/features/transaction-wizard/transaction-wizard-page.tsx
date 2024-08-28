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

export const transactionWizardPageTitle = 'Transaction Wizard'

export function TransactionWizardPage() {
  const [selectedBuildableTransactionIndex, setSelectedBuildableIndex] = useState(0)
  const loadableActiveWalletAddressSnapshot = useLoadableActiveWalletAddressSnapshotAtom()

  // TODO: NC - We can probably get rid of this cast, but using a different input
  const buildableTransactions = [paymentTransaction, accountCloseTransaction]
  invariant(selectedBuildableTransactionIndex < buildableTransactions.length, 'Invalid transaction type index')

  const buildableTransaction = buildableTransactions[selectedBuildableTransactionIndex]

  const changeSelectedBuildableTransaction = useCallback(async (value: string) => {
    setSelectedBuildableIndex(Number(value))
    // TODO: NC - Can we reset the error state here without re-rendering the whole thing?
  }, [])

  // TODO: NC - Look at designs and work out what's missing. Add support for Clear (maybe we simple trigger a render of the component?).
  // TODO: NC - Render the transaction summary like we will do for the method call

  return (
    <>
      <PageTitle title={transactionWizardPageTitle} />
      <RenderLoadable loadable={loadableActiveWalletAddressSnapshot} fallback={<PageLoader />}>
        {(activeWalletAddressSnapshot) => (
          <div className="lg:w-1/2">
            <div className={cn('flex w-72 flex-col mb-4')}>
              <Label htmlFor="transaction-type" className={cn('ml-0.5 mb-2')}>
                Transaction type
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
