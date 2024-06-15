import { AccountLink } from '@/features/accounts/components/account-link'
import { Transaction, TransactionType } from '../models'
import { ApplicationLink } from '@/features/applications/components/application-link'
import { AssetIdLink } from '@/features/assets/components/asset-link'

export function TransactionTo({ transaction }: { transaction: Transaction }) {
  if (transaction.type === TransactionType.Payment || transaction.type === TransactionType.AssetTransfer)
    return <AccountLink address={transaction.receiver} short={true} />
  if (transaction.type === TransactionType.AppCall) return <ApplicationLink applicationId={transaction.applicationId} />
  if (transaction.type === TransactionType.AssetConfig) return <AssetIdLink assetId={transaction.assetId} />
  if (transaction.type === TransactionType.AssetFreeze) return <AccountLink address={transaction.address} short={true} />
}
