import { useSearchParams } from 'react-router-dom'
import { useMemo } from 'react'
import { isAddress } from '@/utils/is-address'
import { isNfd, useLoadableForwardLookupNfdResult } from '@/features/nfd/data'

export function useAddressFromQueryParam(): string | undefined {
  const [searchParams] = useSearchParams()
  const addressParam = searchParams.get('address')

  const isNfdValue = useMemo(() => (addressParam ? isNfd(addressParam) : false), [addressParam])
  const loadableNfdResult = useLoadableForwardLookupNfdResult(isNfdValue ? addressParam! : '')

  return useMemo(() => {
    if (!addressParam) {
      return undefined
    }

    // If it's a valid address, return it directly
    if (isAddress(addressParam)) {
      return addressParam
    }

    // If it's an NFD, resolve and return the deposit account
    if (isNfdValue && loadableNfdResult.state === 'hasData' && loadableNfdResult.data) {
      return loadableNfdResult.data.depositAccount
    }

    return undefined
  }, [addressParam, isNfdValue, loadableNfdResult])
}
