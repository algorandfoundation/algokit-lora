import { createReadOnlyAtomAndTimestamp, createTimestamp, readOnlyAtomCache, writableAtomCache } from '@/features/common/data'
import { Atom, atom, Getter, SetStateAction, Setter, useAtomValue, WritableAtom } from 'jotai'
import { ForwardNfdLookup, Nfd, NfdLookup, NfdResult, ReverseNfdLookpup } from './types'
import { Address } from '@/features/accounts/data/types'
import { atomEffect } from 'jotai-effect'
import { useMemo } from 'react'
import { chunkArray } from '@/utils/chunk-array'
import { loadable } from 'jotai/utils'
import { settingsStore } from '@/features/settings/data'
import { networkConfigAtom } from '@/features/network/data'

const MAX_BATCH_SIZE = 20
const addressesToResolveAtom = atom(new Set<string>())

const performNfdReverseLookup = async (addresses: Address[], nfdApiUrl: string): Promise<NfdResult[]> => {
  if (addresses.length === 0) {
    return []
  }

  const query = `address=${addresses.join('&address=')}`

  try {
    const response = await fetch(`${nfdApiUrl}/nfd/lookup?${query}`, {
      method: 'GET',
      headers: {
        accept: 'application/json',
      },
    })

    if (!response.ok) {
      return []
    }

    const body = (await response.json()) as Record<Address, NfdResult>
    return Object.values(body).map((result) => {
      return {
        name: result.name,
        depositAccount: result.depositAccount,
        caAlgo: result.caAlgo ?? [],
      } satisfies NfdResult
    })
  } catch (e: unknown) {
    return []
  }
}
const getReverseLookupNfdResult = async (_: Getter, set: Setter, addresses: Set<Address>, networkNfdApiUrl: string) => {
  const addressChunks = chunkArray(Array.from(addresses), MAX_BATCH_SIZE)
  const nfdResults = (await Promise.all(addressChunks.map((chunk) => performNfdReverseLookup(chunk, networkNfdApiUrl)))).flat()

  const [forwardNfdResultsToAdd, reverseNfdsToAdd] = nfdResults.reduce(
    (acc, nfdResult) => {
      if (!acc[0].has(nfdResult.name)) {
        acc[0].set(nfdResult.name, nfdResult)
      }
      const addressesToAdd = new Set([nfdResult.depositAccount, ...nfdResult.caAlgo])
      addressesToAdd.forEach((address) => {
        if (!acc[1].has(address)) {
          acc[1].set(address, nfdResult.name)
        }
      })
      return acc
    },
    [new Map<Nfd, NfdResult>(), new Map<Address, Nfd | null>()] as const
  )
  addresses.forEach((address) => {
    if (!reverseNfdsToAdd.has(address)) {
      reverseNfdsToAdd.set(address, null)
    }
  })

  // Cache the NFD result for forward lookups. Reverse lookups will also use this cache
  if (forwardNfdResultsToAdd.size > 0) {
    set(forwardNfdResultsAtom, (prev) => {
      let hasChanged = false
      const next = new Map(prev)
      forwardNfdResultsToAdd.forEach((nfdResult) => {
        if (!next.has(nfdResult.name)) {
          next.set(nfdResult.name, createReadOnlyAtomAndTimestamp(nfdResult))
          hasChanged = true
        }
      })
      return hasChanged ? next : prev
    })
  }

  // Cache all addresses associated with the resolved NFD for reverse lookups
  if (reverseNfdsToAdd.size > 0) {
    set(reverseNfdsAtom, (_prev) => {
      const next = new Map(_prev)
      reverseNfdsToAdd.forEach((nfd, address) => {
        if (addresses.has(address) && next.has(address)) {
          // This ensures we replace the pending promise with resolved data
          set(next.get(address)![0], nfd)
        } else if (!next.has(address)) {
          next.set(address, [atom<Promise<Nfd | null> | Nfd | null>(nfd), createTimestamp()])
        }
      })
      return next
    })
  }

  return nfdResults
}
const getReverseLookupNfdAtom = (
  get: Getter,
  set: Setter,
  lookup: ReverseNfdLookpup,
  nfdApiUrl: string
): WritableAtom<string | Promise<string | null> | null, [SetStateAction<string | Promise<string | null> | null>], void> => {
  if (lookup.resolveNow) {
    return atom<Promise<Nfd | null> | Nfd | null>(
      getReverseLookupNfdResult(get, set, new Set([lookup.address]), nfdApiUrl).then((nfdResult) => {
        if (nfdResult.length > 0) {
          return nfdResult[0].name
        }
        return null
      })
    )
  }

  get(addressesToResolveAtom).add(lookup.address)
  return atom<Promise<Nfd | null> | Nfd | null>(new Promise<Nfd>(() => {}))
}

const performNfdForwardLookup = async (nfd: Nfd, nfdApiUrl: string): Promise<NfdResult | null> => {
  try {
    const response = await fetch(`${nfdApiUrl}/nfd/${nfd}?view=tiny`, {
      method: 'GET',
      headers: {
        accept: 'application/json',
      },
    })

    if (!response.ok) {
      return null
    }
    const body = (await response.json()) as NfdResult
    return {
      name: body.name,
      depositAccount: body.depositAccount,
      caAlgo: body.caAlgo ?? [],
    } satisfies NfdResult
  } catch (e: unknown) {
    return null
  }
}
const getForwardLookupNfdResult = async (
  _: Getter,
  set: Setter,
  lookup: ForwardNfdLookup,
  nfdApiUrl: string
): Promise<NfdResult | null> => {
  const nfdResult = await performNfdForwardLookup(lookup.nfd, nfdApiUrl)

  if (!nfdResult) {
    return null
  }

  // Cache all addresses associated with this NFD for reverse lookups
  const addressesToAdd = new Set([nfdResult.depositAccount, ...nfdResult.caAlgo])
  if (addressesToAdd.size > 0) {
    set(reverseNfdsAtom, (prev) => {
      let hasChanged = false
      const next = new Map(prev)
      addressesToAdd.forEach((address) => {
        if (!prev.has(address)) {
          next.set(address, [atom<Promise<Nfd | null> | Nfd | null>(nfdResult.name), createTimestamp()])
          hasChanged = true
        }
      })
      return hasChanged ? next : prev
    })
  }

  return nfdResult
}

export const nfdDataLoaderEffect = atomEffect((get, set) => {
  const config = settingsStore.get(networkConfigAtom)
  const nfdApiUrl = config.nfdApiUrl
  if (!nfdApiUrl) {
    return
  }

  const resolveAddresses = setInterval(() => {
    const _addressesToResolve = get.peek(addressesToResolveAtom)
    const addressesToResolve = new Set(_addressesToResolve)
    _addressesToResolve.clear()
    ;(async () => {
      if (!nfdApiUrl || addressesToResolve.size === 0) {
        return
      }
      await getReverseLookupNfdResult(get, set, addressesToResolve, nfdApiUrl)
    })()
  }, 500)
  return () => clearInterval(resolveAddresses)
})

export const useNfdDataLoaderEffect = () => {
  return useAtomValue(nfdDataLoaderEffect)
}

export const getNfdResultAtom = (nfdLookup: NfdLookup): Atom<Promise<NfdResult | null>> => {
  const config = settingsStore.get(networkConfigAtom)
  const nfdApiUrl = config.nfdApiUrl

  return atom(async (get) => {
    if (!nfdApiUrl) {
      return null
    }

    if ('nfd' in nfdLookup) {
      return await get(getForwardNfdResultAtom(nfdLookup, nfdApiUrl, { skipTimestampUpdate: true }))
    }

    const nfd = await get(getReverseNfdAtom(nfdLookup, nfdApiUrl, { skipTimestampUpdate: true }))
    if (nfd) {
      return await get(getForwardNfdResultAtom({ nfd }, nfdApiUrl, { skipTimestampUpdate: true }))
    }
    return null
  })
}

const [forwardNfdResultsAtom, getForwardNfdResultAtom] = readOnlyAtomCache(getForwardLookupNfdResult, (lookup) => lookup.nfd)
const [reverseNfdsAtom, getReverseNfdAtom] = writableAtomCache(getReverseLookupNfdAtom, (lookup) => lookup.address)
export { forwardNfdResultsAtom, reverseNfdsAtom }

export const useLoadableReverseLookupNfdResult = (address: Address, resolveNow: boolean = false) => {
  const nfdResultAtom = useMemo(() => {
    return getNfdResultAtom({ address, resolveNow })
  }, [address, resolveNow])
  return useAtomValue(loadable(nfdResultAtom))
}

export const useLoadableForwardLookupNfdResult = (nfd: Nfd) => {
  const nfdResultAtom = useMemo(() => {
    return getNfdResultAtom({ nfd })
  }, [nfd])
  return useAtomValue(loadable(nfdResultAtom))
}
