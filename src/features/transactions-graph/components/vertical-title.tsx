import { cn } from '@/features/common/utils'
import { AccountLink } from '@/features/accounts/components/account-link'
import { ApplicationLink } from '@/features/applications/components/application-link'
import { AssetIdLink } from '@/features/assets/components/asset-link'
import { TransactionGraphVertical } from '@/features/transactions-graph'

export function VerticalTitle({ vertical }: { vertical: TransactionGraphVertical }) {
  return (
    <h1 className={cn('text-l font-semibold')}>
      {vertical.type === 'Account' && <AccountLink address={vertical.address} short={true} />}
      {vertical.type === 'Application' && (
        <div className={cn('grid')}>
          <ApplicationLink applicationId={vertical.id} />
          <AccountLink address={vertical.address} short={true} />
          {vertical.accounts.map(({ address }, index) => (
            <AccountLink key={index} address={address} short={true} />
          ))}
        </div>
      )}
      {vertical.type === 'Asset' && <AssetIdLink assetId={parseInt(vertical.id)} />}
    </h1>
  )
}
