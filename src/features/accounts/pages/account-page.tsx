import { invariant } from '@/utils/invariant'
import { UrlParams } from '../../../routes/urls'
import { useRequiredParam } from '../../common/hooks/use-required-param'
import { cn } from '@/features/common/utils'
import { isAddress } from '@/utils/is-address'

export const accountPageTitle = 'Account'
export const accountInvalidAddressMessage = 'Address is invalid'

export function AccountPage() {
  const { address } = useRequiredParam(UrlParams.Address)
  invariant(isAddress(address), accountInvalidAddressMessage)

  return (
    <div>
      <h1 className={cn('text-2xl text-primary font-bold')}>{accountPageTitle}</h1>
      {address}
    </div>
  )
}
