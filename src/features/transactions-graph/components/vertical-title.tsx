import { cn } from '@/features/common/utils'
import { AccountLink } from '@/features/accounts/components/account-link'
import { ApplicationLink } from '@/features/applications/components/application-link'
import { AssetIdLink } from '@/features/assets/components/asset-link'
import { Vertical } from '../models'
import { KeyIcon, LinkIcon, PawPrintIcon } from 'lucide-react'

export function AccountNumber({ number }: { number: number }) {
  return (
    <div className="flex size-4 items-center justify-center overflow-hidden rounded-full border border-primary text-[0.6rem] text-primary">
      {number}
    </div>
  )
}

export function VerticalTitle({ vertical }: { vertical: Vertical }) {
  return (
    <span className={cn('text-l font-semibold')}>
      {vertical.type === 'Account' && (
        <div className={cn('grid text-center')}>
          <TitleWrapper rightComponent={<AccountNumber number={vertical.accountNumber} />}>
            <AccountLink address={vertical.accountAddress} short={true} />
          </TitleWrapper>
          {vertical.clawbackFromAccounts &&
            vertical.clawbackFromAccounts.map(({ accountAddress, accountNumber }) => (
              <TitleWrapper
                key={accountNumber}
                leftComponent={<PawPrintIcon size={16} className={'text-primary'} />}
                rightComponent={<AccountNumber number={accountNumber} />}
              >
                <AccountLink address={accountAddress} short={true} />
              </TitleWrapper>
            ))}
        </div>
      )}
      {vertical.type === 'Application' && (
        <div className={cn('grid text-center')}>
          <TitleWrapper>
            <ApplicationLink applicationId={vertical.applicationId} />
          </TitleWrapper>
          <TitleWrapper
            leftComponent={<LinkIcon size={16} className={'text-primary'} />}
            rightComponent={<AccountNumber number={vertical.linkedAccount.accountNumber} />}
          >
            <AccountLink address={vertical.linkedAccount.accountAddress} short={true} />
          </TitleWrapper>
          {vertical.rekeyedAccounts.map(({ accountAddress, accountNumber }) => (
            <TitleWrapper
              key={accountNumber}
              leftComponent={<KeyIcon size={16} className={'text-primary'} />}
              rightComponent={<AccountNumber number={accountNumber} />}
            >
              <AccountLink address={accountAddress} short={true} />
            </TitleWrapper>
          ))}
          {vertical.clawbackFromAccounts.map(({ accountAddress, accountNumber }) => (
            <TitleWrapper
              key={accountNumber}
              leftComponent={<PawPrintIcon size={16} className={'text-primary'} />}
              rightComponent={<AccountNumber number={accountNumber} />}
            >
              <AccountLink address={accountAddress} short={true} />
            </TitleWrapper>
          ))}
        </div>
      )}
      {vertical.type === 'Asset' && <AssetIdLink assetId={vertical.assetId} />}
      {vertical.type === 'OpUp' && <label className={'text-primary'}>OpUp</label>}
    </span>
  )
}

type TitleWrapperProps = {
  leftComponent?: React.ReactNode
  children: React.ReactNode
  rightComponent?: React.ReactNode
}
function TitleWrapper({ leftComponent, children, rightComponent }: TitleWrapperProps) {
  return (
    <div className={cn('flex gap-0.5 items-center justify-center')}>
      <div className={'shrink-0 basis-4'}>{leftComponent}</div>
      <div>{children}</div>
      <div className={'shrink-0 basis-4'}>{rightComponent}</div>
    </div>
  )
}
