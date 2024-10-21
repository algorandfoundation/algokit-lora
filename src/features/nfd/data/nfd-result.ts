import { createReadOnlyAtomAndTimestamp, createTimestamp, readOnlyAtomCache, writableAtomCache } from '@/features/common/data'
import { Atom, atom, Getter, Setter, useAtomValue } from 'jotai'
import { Nfd, NfdLookup, NfdResult } from './types'
import { Address } from '@/features/accounts/data/types'
import { networkConfig } from '@/features/common/data/algo-client'
import { atomEffect } from 'jotai-effect'
import { useMemo } from 'react'

const MAX_BATCH_SIZE = 20
const addressesToResolveAtom = atom(new Set<string>())

export const batchNfdResolutionEffect = atomEffect((get, set) => {
  if (!networkConfig.nfdApiUrl) {
    return
  }

  const addressesToResolve = get.peek(addressesToResolveAtom)
  const cleanup = setInterval(() => {
    ;(async () => {
      if (!networkConfig.nfdApiUrl || addressesToResolve.size === 0) {
        return
      }
      const networkNfdApiUrl = networkConfig.nfdApiUrl

      const addressesArray = Array.from(addressesToResolve)
      const batches = []
      for (let i = 0; i < addressesArray.length; i += MAX_BATCH_SIZE) {
        batches.push(addressesArray.slice(i, i + MAX_BATCH_SIZE))
      }
      const batchPromises = batches.map((batch) => reverseLookup(batch, networkNfdApiUrl))
      const allResults = await Promise.all(batchPromises)

      const nfdResults = allResults.flat()
      // TODO: NC - this needs to respect the API limit. We should break the batches smaller and parallelise the requests
      // const nfdResults = await reverseLookup(Array.from(addressesToResolve), networkConfig.nfdApiUrl)

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
      addressesToResolve.forEach((address) => {
        if (!reverseNfdsToAdd.has(address)) {
          reverseNfdsToAdd.set(address, null)
        }
      })

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
          if (addressesToResolve.has(address) && next.get(address)) {
            set(next.get(address)![0], nfd)
          } else if (!next.has(address)) {
            next.set(address, [atom<Promise<Nfd | null> | Nfd | null>(nfd), createTimestamp()])
          }
        })
        return next
      })
      addressesToResolve.clear()
    })()
  }, 200)
  return () => clearInterval(cleanup)
})

const getReverseLookupNfd = (get: Getter, __: Setter, address: Address) => {
  const addressesToResolve = get(addressesToResolveAtom)
  addressesToResolve.add(address)
  return atom<Promise<Nfd | null> | Nfd | null>(new Promise<Nfd>(() => {}))
}

const reverseLookup = async (addresses: Address[], nfdApiUrl: string): Promise<NfdResult[]> => {
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
    return Object.values(body)
  } catch (e: unknown) {
    return []
  }
}

const getForwardLookupNfdResult = async (_: Getter, set: Setter, nfd: Nfd, nfdApiUrl: string): Promise<NfdResult | null> => {
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
    const nfdResult = {
      name: body.name,
      depositAccount: body.depositAccount,
      caAlgo: body.caAlgo ?? [],
    } satisfies NfdResult

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
  } catch (e: unknown) {
    return null
  }
}

export const useBatchNfdResolutionEffect = () => {
  return useAtomValue(batchNfdResolutionEffect)
}

export const getNfdResultAtom = (nfdLookup: NfdLookup): Atom<Promise<NfdResult | null>> => {
  return atom(async (get) => {
    if (!networkConfig.nfdApiUrl) {
      return null
    }

    if ('nfd' in nfdLookup) {
      return await get(getForwardNfdResultAtom(nfdLookup.nfd, networkConfig.nfdApiUrl, { skipTimestampUpdate: true }))
    }

    const nfd = await get(getReverseNfdAtom(nfdLookup.address, { skipTimestampUpdate: true }))
    if (nfd) {
      return await get(getForwardNfdResultAtom(nfd, networkConfig.nfdApiUrl, { skipTimestampUpdate: true }))
    }
    return null
  })
}

export const useNfdAtom = (address: Address) => {
  return useMemo(() => {
    return getNfdResultAtom({ address: address })
  }, [address])
}

export const useNfdResultAtom = (nfd: Nfd) => {
  return useMemo(() => {
    return getNfdResultAtom({ nfd: nfd })
  }, [nfd])
}

const [forwardNfdResultsAtom, getForwardNfdResultAtom] = readOnlyAtomCache(getForwardLookupNfdResult, (nfd) => nfd)
const [reverseNfdsAtom, getReverseNfdAtom] = writableAtomCache(getReverseLookupNfd, (address) => address)
export { forwardNfdResultsAtom, reverseNfdsAtom }
