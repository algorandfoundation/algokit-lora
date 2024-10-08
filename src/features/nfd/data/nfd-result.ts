import { createReadOnlyAtomAndTimestamp, readOnlyAtomCache } from '@/features/common/data'
import { Atom, atom, Getter, Setter } from 'jotai'
import { Nfd, NfdLookup, NfdResult } from './types'
import { Address } from '@/features/accounts/data/types'

const getReverseLookupNfdResult = async (_: Getter, set: Setter, address: Address): Promise<Nfd | null> => {
  try {
    const response = await fetch(`https://api.nf.domains/nfd/lookup?address=${address}`, {
      method: 'GET',
      headers: {
        accept: 'application/json',
      },
    })

    if (!response.ok) {
      return null
    }

    const body = await response.json()
    const nfd = body[address] as NfdResult
    const nfdResult = {
      name: nfd.name,
      depositAccount: nfd.depositAccount,
      caAlgo: nfd.caAlgo ?? [],
    } satisfies NfdResult

    // Cache the NFD result for forward lookups. Reverse lookups will also use this cache
    set(forwardNfdResultsAtom, (prev) => {
      if (!prev.has(nfdResult.name)) {
        const next = new Map(prev)
        next.set(nfdResult.name, createReadOnlyAtomAndTimestamp(nfdResult))
        return next
      }
      return prev
    })

    // Cache all *other* addresses associated with this NFD for reverse lookups
    set(reverseNfdResultsAtom, (prev) => {
      const next = new Map(prev)
      const addressesToAdd = new Set([nfdResult.depositAccount, ...nfdResult.caAlgo].filter((a) => a !== address))
      addressesToAdd.forEach((address) => {
        if (!prev.has(address)) {
          next.set(address, createReadOnlyAtomAndTimestamp(nfdResult.name))
        }
      })
      return next
    })

    return nfdResult.name
  } catch (e: unknown) {
    return null
  }
}

const getForwardLookupNfdResult = async (_: Getter, set: Setter, nfd: Nfd): Promise<NfdResult | null> => {
  try {
    const response = await fetch(`https://api.nf.domains/nfd/${nfd}?view=tiny`, {
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
    set(reverseNfdResultsAtom, (prev) => {
      const next = new Map(prev)
      const addressesToAdd = new Set([nfdResult.depositAccount, ...nfdResult.caAlgo])
      addressesToAdd.forEach((address) => {
        if (!prev.has(address)) {
          next.set(address, createReadOnlyAtomAndTimestamp(nfdResult.name))
        }
      })
      return next
    })

    return nfdResult
  } catch (e: unknown) {
    return null
  }
}

export const getNfdResultAtom = (nfdLookup: NfdLookup): Atom<Promise<NfdResult | null>> => {
  if ('nfd' in nfdLookup) {
    return getForwardNfdResultAtom(nfdLookup.nfd, { skipTimestampUpdate: true })
  }

  return atom(async (get) => {
    const nfd = await get(getReverseNfdResultAtom(nfdLookup.address, { skipTimestampUpdate: true }))
    if (nfd) {
      return await get(getForwardNfdResultAtom(nfd, { skipTimestampUpdate: true }))
    }
    return null
  })
}

const [forwardNfdResultsAtom, getForwardNfdResultAtom] = readOnlyAtomCache(getForwardLookupNfdResult, (nfd) => nfd)
const [reverseNfdResultsAtom, getReverseNfdResultAtom] = readOnlyAtomCache(getReverseLookupNfdResult, (address) => address)
export { forwardNfdResultsAtom, reverseNfdResultsAtom }
