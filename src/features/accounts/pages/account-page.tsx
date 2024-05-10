import { invariant } from '@/utils/invariant'
import { UrlParams } from '../../../routes/urls'
import { useRequiredParam } from '../../common/hooks/use-required-param'
import { cn } from '@/features/common/utils'
import { isAddress } from '@/utils/is-address'
import { is404 } from '@/utils/error'
import { RenderLoadable } from '@/features/common/components/render-loadable'
import { Account } from '../models'
import { useLoadableAccountAtom } from '../data/account'
import { AccountDetails } from '../components/account-details'

export const accountPageTitle = 'Account'
export const accountInvalidAddressMessage = 'Address is invalid'
export const accountFailedToLoadMessage = 'Account failed to load'

const transformError = (e: Error) => {
  if (is404(e)) {
    return new Error(accountInvalidAddressMessage)
  }

  // eslint-disable-next-line no-console
  console.error(e)
  return new Error(accountFailedToLoadMessage)
}

export function AccountPage() {
  const { address } = useRequiredParam(UrlParams.Address)
  invariant(isAddress(address), accountInvalidAddressMessage)
  const loadableAccount = useLoadableAccountAtom(address)

  return (
    <div>
      <h1 className={cn('text-2xl text-primary font-bold')}>{accountPageTitle}</h1>
      <RenderLoadable loadable={loadableAccount} transformError={transformError}>
        {(account: Account) => <AccountDetails account={account} />}
      </RenderLoadable>
    </div>
  )
}
