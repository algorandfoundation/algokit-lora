import { invariant } from '@/utils/invariant'
import { UrlParams } from '../../../routes/urls'
import { useRequiredParam } from '../../common/hooks/use-required-param'
import { isAddress } from '@/utils/is-address'
import { is404 } from '@/utils/error'
import { RenderLoadable } from '@/features/common/components/render-loadable'
import { Account } from '../models'
import { useLoadableAccount } from '../data'
import { AccountDetails } from '../components/account-details'
import { useCallback } from 'react'
import { PageTitle } from '@/features/common/components/page-title'
import { PageLoader } from '@/features/common/components/page-loader'

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
  const [loadableAccount, refreshAccount, isStale] = useLoadableAccount(address)

  const refresh = useCallback(() => {
    refreshAccount()
  }, [refreshAccount])

  return (
    <>
      <PageTitle title={accountPageTitle} canRefreshPage={isStale} onRefresh={refresh} />
      <RenderLoadable loadable={loadableAccount} transformError={transformError} fallback={<PageLoader />}>
        {(account: Account) => <AccountDetails account={account} />}
      </RenderLoadable>
    </>
  )
}
