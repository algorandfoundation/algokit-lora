import { useMemo } from 'react'
import { useAtomValue } from 'jotai'
import { loadable } from 'jotai/utils'
import { AccountSignatureType, Address } from './types'
import { readOnlyAtomCache } from '@/features/common/data'
import { indexer } from '@/features/common/data/algo-client'
import { asError, is404 } from '@/utils/error'

const getAccountSignatureType = async (address: Address): Promise<AccountSignatureType | null> => {
  // The signature type is only available from the indexer, as it's derived from the transactions the account has signed.
  // algod always returns it empty, so it's loaded separately from the account result and never blocks the account page.
  try {
    const result = await indexer.lookupAccountByID(address).exclude('all').do()
    return (result.account.sigType as AccountSignatureType | undefined) ?? null
  } catch (e: unknown) {
    if (is404(asError(e))) {
      // The indexer doesn't know about the account, so there is no signature type to display
      return null
    }
    throw e
  }
}

const keySelector = (address: Address) => address

export const [accountSignatureTypesAtom, getAccountSignatureTypeAtom] = readOnlyAtomCache<
  Parameters<typeof keySelector>,
  ReturnType<typeof keySelector>,
  Promise<AccountSignatureType | null> | AccountSignatureType | null
>((_get, _set, address) => getAccountSignatureType(address), keySelector)

export const useLoadableAccountSignatureType = (address: Address) => {
  const accountSignatureTypeAtom = useMemo(() => {
    return getAccountSignatureTypeAtom(address)
  }, [address])
  return useAtomValue(loadable(accountSignatureTypeAtom))
}
