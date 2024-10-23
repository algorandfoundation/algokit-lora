import { createReadOnlyAtomAndTimestamp, createTimestamp, readOnlyAtomCache, writableAtomCache } from '@/features/common/data'
import { Atom, atom, Getter, SetStateAction, Setter, useAtomValue, WritableAtom } from 'jotai'
import { ForwardNfdLookup, Nfd, NfdLookup, NfdResult, ReverseNfdLookpup } from './types'
import { Address } from '@/features/accounts/data/types'
import { networkConfig } from '@/features/common/data/algo-client'
import { atomEffect } from 'jotai-effect'
import { useMemo } from 'react'
import { chunkArray } from '@/utils/chunk-array'
import { loadable } from 'jotai/utils'

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
  // TODO: NC - Double check this logic
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
  // TODO: NC - Double check this logic before testing

  // Cache the NFD result for forward lookups. Reverse lookups will also use this cache
  set(forwardNfdResultsAtom, (prev) => {
    const next = new Map(prev)
    forwardNfdResultsToAdd.forEach((nfdResult) => {
      if (!next.has(nfdResult.name)) {
        next.set(nfdResult.name, createReadOnlyAtomAndTimestamp(nfdResult))
      }
    })
    return next
  })

  // Cache all addresses associated with the resolved NFD for reverse lookups
  set(reverseNfdsAtom, (_prev) => {
    const next = new Map(_prev)
    reverseNfdsToAdd.forEach((nfd, address) => {
      // Ensures we replace the pending promise with resolved data
      if (addresses.has(address) && next.get(address)) {
        set(next.get(address)![0], nfd)
      } else if (!next.has(address)) {
        next.set(address, [atom<Promise<Nfd | null> | Nfd | null>(nfd), createTimestamp()])
      }
    })
    return next
  })

  return nfdResults
}
const getReverseLookupNfdAtom = (
  get: Getter,
  set: Setter,
  lookup: ReverseNfdLookpup,
  nfdApiUrl: string
): WritableAtom<string | Promise<string | null> | null, [SetStateAction<string | Promise<string | null> | null>], void> => {
  // TODO: NC - Test the behaviour of this
  const cached = get(reverseNfdsAtom).get(lookup.address)
  if (cached) {
    return cached[0]
  }

  if (lookup.resolveNow) {
    return atom<Promise<Nfd | null> | Nfd | null>(
      getReverseLookupNfdResult(get, set, new Set([lookup.address]), nfdApiUrl).then((x) => {
        if (x.length > 0) {
          return x[0].name
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
  set(reverseNfdsAtom, (prev) => {
    const next = new Map(prev)
    const addressesToAdd = new Set([nfdResult.depositAccount, ...nfdResult.caAlgo])
    addressesToAdd.forEach((address) => {
      if (!prev.has(address)) {
        next.set(address, [atom<Promise<Nfd | null> | Nfd | null>(nfdResult.name), createTimestamp()])
      }
    })
    return next
  })

  return nfdResult
}

export const nfdDataLoaderEffect = atomEffect((get, set) => {
  if (!networkConfig.nfdApiUrl) {
    return
  }

  const resolveAddresses = setInterval(() => {
    const _addressesToResolve = get.peek(addressesToResolveAtom)
    const addressesToResolve = new Set(_addressesToResolve)
    _addressesToResolve.clear()
    ;(async () => {
      if (!networkConfig.nfdApiUrl || addressesToResolve.size === 0) {
        return
      }
      await getReverseLookupNfdResult(get, set, addressesToResolve, networkConfig.nfdApiUrl)
    })()
  }, 500)
  return () => clearInterval(resolveAddresses)
})

export const useNfdDataLoaderEffect = () => {
  return useAtomValue(nfdDataLoaderEffect)
}

export const getNfdResultAtom = (nfdLookup: NfdLookup): Atom<Promise<NfdResult | null>> => {
  return atom(async (get) => {
    if (!networkConfig.nfdApiUrl) {
      return null
    }

    if ('nfd' in nfdLookup) {
      return await get(getForwardNfdResultAtom(nfdLookup, networkConfig.nfdApiUrl, { skipTimestampUpdate: true }))
    }

    const nfd = await get(getReverseNfdAtom(nfdLookup, networkConfig.nfdApiUrl, { skipTimestampUpdate: true }))
    if (nfd) {
      return await get(getForwardNfdResultAtom({ nfd }, networkConfig.nfdApiUrl, { skipTimestampUpdate: true }))
    }
    return null
  })
}

const [forwardNfdResultsAtom, getForwardNfdResultAtom] = readOnlyAtomCache(getForwardLookupNfdResult, (lookup) => lookup.nfd)
const [reverseNfdsAtom, getReverseNfdAtom] = writableAtomCache(getReverseLookupNfdAtom, (lookup) => lookup.address)
export { forwardNfdResultsAtom, reverseNfdsAtom }

const useReverseLookupNfdResultAtom = (address: Address, resolveNow: boolean) => {
  return useMemo(() => {
    return getNfdResultAtom({ address, resolveNow })
  }, [address, resolveNow])
}

const useForwardLookupNfdResultAtom = (nfd: Nfd) => {
  return useMemo(() => {
    return getNfdResultAtom({ nfd })
  }, [nfd])
}

export const useLoadableReverseLookupNfdResult = (address: Address, resolveNow: boolean = false) => {
  const nfdResultAtom = useReverseLookupNfdResultAtom(address, resolveNow)
  return useAtomValue(loadable(nfdResultAtom))
}

export const useLoadableForwardLookupNfdResult = (nfd: Nfd) => {
  const nfdResultAtom = useForwardLookupNfdResultAtom(nfd)
  return useAtomValue(loadable(nfdResultAtom))
}
