import { cn } from '@/features/common/utils'
import { AccountLink as AccountLinkComponent } from '@/features/accounts/components/account-link'
import { ApplicationLink } from '@/features/applications/components/application-link'
import { AssetIdLink } from '@/features/assets/components/asset-link'
import { TransactionGraphVertical } from '@/features/transactions-graph'
import { Address } from '@/features/accounts/data/types'
import { ellipseAddress } from '@/utils/ellipse-address'
import { KeyIcon, LinkIcon } from 'lucide-react'

export function AccountLink({ address, index }: { address: Address; index: number }) {
  return (
    <AccountLinkComponent address={address} className="flex items-center text-primary">
      <abbr title={address}>{ellipseAddress(address)}</abbr>
      <div className="ml-1 inline-flex size-4 items-center justify-center overflow-hidden rounded-full border border-primary text-[0.6rem]">
        {index}
      </div>
    </AccountLinkComponent>
  )
}

export function VerticalTitle({ vertical }: { vertical: TransactionGraphVertical }) {
  return (
    <span className={cn('text-l font-semibold')}>
      {vertical.type === 'Account' && (
        <>
          <AccountLink address={vertical.address} index={vertical.index} />
        </>
      )}
      {vertical.type === 'Application' && (
        <div className={cn('grid')}>
          <ApplicationLink applicationId={vertical.applicationId} />
          <div className="flex items-center gap-1">
            <LinkIcon size={12} className={'text-primary'} />
            <AccountLink address={vertical.linkedAccount.address} index={vertical.linkedAccount.index} />
          </div>
          {vertical.rekeyedAccounts.map(({ address, index }) => (
            <div key={index} className="flex items-center gap-1">
              <KeyIcon size={12} className={'text-primary'} />
              <AccountLink address={address} index={index} />
            </div>
          ))}
        </div>
      )}
      {vertical.type === 'Asset' && <AssetIdLink assetId={vertical.assetId} />}
    </span>
  )
}
