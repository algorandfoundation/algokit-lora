import { cn } from '@/features/common/utils'
import { AccountLink } from '@/features/accounts/components/account-link'
import { ApplicationLink } from '@/features/applications/components/application-link'
import { AssetIdLink } from '@/features/assets/components/asset-link'
import { ApplicationVertical, Vertical } from '../models'
import { KeyIcon, LinkIcon } from 'lucide-react'
import SvgClaw from '@/features/common/components/icons/claw'

function AccountNumber({ number }: { number: number }) {
  return (
    <div className="flex size-4 items-center justify-center overflow-hidden rounded-full border border-primary text-[0.6rem] text-primary">
      {number}
    </div>
  )
}

function AssociatedAccountTitleWrapper({ type, accountAddress, accountNumber }: ApplicationVertical['associatedAccounts'][0]) {
  return (
    <TitleWrapper
      key={accountNumber}
      leftComponent={
        type === 'Clawback' ? (
          <SvgClaw width={16} height={16} className={'text-primary'} />
        ) : (
          <KeyIcon size={16} className={'text-primary'} />
        )
      }
      rightComponent={<AccountNumber number={accountNumber} />}
    >
      <AccountLink address={accountAddress} short={true} />
    </TitleWrapper>
  )
}

export function VerticalTitle({ vertical }: { vertical: Vertical }) {
  return (
    <div className={cn('text-l font-semibold w-full')}>
      {vertical.type === 'Account' && (
        <div className={cn('grid text-center')}>
          <TitleWrapper rightComponent={<AccountNumber number={vertical.accountNumber} />}>
            <AccountLink address={vertical.accountAddress} short={true} />
          </TitleWrapper>
          {vertical.associatedAccounts.map((associatedAccount, i) => (
            <AssociatedAccountTitleWrapper key={i} {...associatedAccount} />
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
          {vertical.associatedAccounts.map((associatedAccount, i) => (
            <AssociatedAccountTitleWrapper key={i} {...associatedAccount} />
          ))}
        </div>
      )}
      {vertical.type === 'Asset' && <AssetIdLink assetId={vertical.assetId} />}
      {vertical.type === 'OpUp' && <label className={'text-primary'}>OpUp</label>}
    </div>
  )
}

type TitleWrapperProps = {
  leftComponent?: React.ReactNode
  children: React.ReactNode
  rightComponent?: React.ReactNode
}
function TitleWrapper({ leftComponent, children, rightComponent }: TitleWrapperProps) {
  return (
    <div className={cn('flex gap-0.5 items-center justify-center overflow-hidden')}>
      <div className={'shrink-0 basis-4'}>{leftComponent}</div>
      {children}
      <div className={'shrink-0 basis-4'}>{rightComponent}</div>
    </div>
  )
}
