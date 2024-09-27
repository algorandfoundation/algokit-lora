import { randomGuid } from '@/utils/random-guid'
import { PageTitle } from '../common/components/page-title'
import { TransactionsBuilder } from './components/transactions-builder'
import { BuildableTransactionType, BuildTransactionResult } from './models'

export const transactionWizardPageTitle = 'Transaction Wizard'
export const transactionTypeLabel = 'Transaction type'
export const sendButtonLabel = 'Send'

export function TransactionWizardPage() {
  return (
    <div className="space-y-2">
      <PageTitle title={transactionWizardPageTitle} />
      <TransactionsBuilder />
    </div>
  )
}
