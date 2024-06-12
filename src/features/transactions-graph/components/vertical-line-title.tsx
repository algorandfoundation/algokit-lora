import { cn } from '@/features/common/utils'
import { AccountLink } from '@/features/accounts/components/account-link'
import { ApplicationLink } from '@/features/applications/components/application-link'
import { AssetIdLink } from '@/features/assets/components/asset-link'
import { TransactionGraphVerticalLine } from '@/features/transactions-graph'

export function VerticalLineTitle({ verticalLine }: { verticalLine: TransactionGraphVerticalLine }) {
  return (
    <h1 className={cn('text-l font-semibold')}>
      {verticalLine.type === 'Account' && <AccountLink address={verticalLine.address} short={true} />}
      {verticalLine.type === 'Application' && (
        <div className={cn('grid')}>
          <ApplicationLink applicationId={verticalLine.id} />
          <AccountLink address={verticalLine.address} short={true} />
          {verticalLine.accounts.map(({ address }, index) => (
            <AccountLink key={index} address={address} short={true} />
          ))}
        </div>
      )}
      {verticalLine.type === 'Asset' && <AssetIdLink assetId={parseInt(verticalLine.id)} />}
    </h1>
  )
}
