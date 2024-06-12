import { cn } from '@/features/common/utils'
import { AccountLink } from '@/features/accounts/components/account-link'
import { ApplicationLink } from '@/features/applications/components/application-link'
import { AssetIdLink } from '@/features/assets/components/asset-link'
import { Swimlane } from '@/features/transactions-graph'

export function SwimlaneId({ swimlane }: { swimlane: Swimlane }) {
  return (
    <h1 className={cn('text-l font-semibold')}>
      {swimlane.type === 'Account' && <AccountLink address={swimlane.address} short={true} />}
      {swimlane.type === 'Application' && (
        <div className={cn('grid')}>
          <ApplicationLink applicationId={swimlane.id} />
          <AccountLink address={swimlane.address} short={true} />
          {swimlane.accounts.map(({ address }, index) => (
            <AccountLink key={index} address={address} short={true} />
          ))}
        </div>
      )}
      {swimlane.type === 'Asset' && <AssetIdLink assetId={parseInt(swimlane.id)} />}
    </h1>
  )
}
