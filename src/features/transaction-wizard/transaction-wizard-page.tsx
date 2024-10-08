import { PageTitle } from '../common/components/page-title'
import { TransactionsBuilder } from './components/transactions-builder'

export const transactionWizardPageTitle = 'Transaction Wizard'
export const transactionTypeLabel = 'Transaction type'
export const sendButtonLabel = 'Send'

export function TransactionWizardPage() {
  return (
    <div className="space-y-2">
      <PageTitle title={transactionWizardPageTitle} />
      <div className="space-y-6">
        <p>Create and send transactions to the selected network using a connected wallet.</p>
        <TransactionsBuilder renderContext="transaction-wizard" />
      </div>
    </div>
  )
}
