import { atom, useAtomValue, useSetAtom, useStore } from 'jotai'
import { ApplicationState } from '../models'
import { asArc56AppSpec, asLocalStateValues } from '../mappers'
import { ApplicationId } from './types'
import { Address } from '@/features/accounts/data/types'
import { algod } from '@/features/common/data/algo-client'
import { useMemo } from 'react'
import { atomWithDebounce } from '@/features/common/data'
import { isAddress } from '@/utils/is-address'
import { getNfdResultAtom, isNfd } from '@/features/nfd/data'
import { JotaiStore } from '@/features/common/data/types'
import { loadable } from 'jotai/utils'
import { asError, is404 } from '@/utils/error'
import { createAppSpecAtom } from './application-method-definitions'
import { failedToLoadLocalStateMessage, invalidAddressForLocalStateMessage } from '../components/labels'

const getApplicationLocalState = async (address: Address, applicationId: ApplicationId) => {
  try {
    const result = await algod.accountApplicationInformation(address, applicationId)
    return result.appLocalState
  } catch (e) {
    if (is404(asError(e))) {
      return undefined
    }
    throw new Error(failedToLoadLocalStateMessage)
  }
}

const createApplicationLocalStateSearchAtom = (store: JotaiStore, applicationId: ApplicationId) => {
  const [currentEnteredAddressAtom, enteredAddressAtom, isDebouncingAtom] = atomWithDebounce<string>('')
  const resultsAtom = atom(async (get) => {
    // Return an async forever value if we are debouncing, so we can render a loader
    if (get(isDebouncingAtom)) {
      return new Promise<ApplicationState[]>(() => [])
    }

    const enteredAddress = store.get(enteredAddressAtom)
    if (!enteredAddress) {
      return []
    }

    let address: Address | undefined = undefined

    if (isAddress(enteredAddress)) {
      address = enteredAddress
    } else if (isNfd(enteredAddress)) {
      const nfdAtom = getNfdResultAtom({ nfd: enteredAddress })
      const nfd = await get(nfdAtom)
      if (nfd && isAddress(nfd.depositAccount)) {
        address = nfd.depositAccount
      }
    }

    if (!address) {
      throw new Error(invalidAddressForLocalStateMessage)
    }

    const localState = await getApplicationLocalState(address, applicationId)
    if (!localState || !localState.keyValue || localState.keyValue.length === 0) {
      return []
    }
    const appSpec = await get(createAppSpecAtom(applicationId))
    return asLocalStateValues(localState.keyValue, appSpec ? asArc56AppSpec(appSpec) : undefined)
  })

  return [currentEnteredAddressAtom, enteredAddressAtom, resultsAtom] as const
}

const useApplicationLocalStateSearchAtom = (applicationId: ApplicationId) => {
  const store = useStore()
  return useMemo(() => {
    return createApplicationLocalStateSearchAtom(store, applicationId)
  }, [applicationId, store])
}

export const useApplicationLocalStateSearch = (applicationId: ApplicationId) => {
  const [currentEnteredAddressAtom, enteredAddressAtom, resultsAtom] = useApplicationLocalStateSearchAtom(applicationId)
  return [useAtomValue(currentEnteredAddressAtom), useSetAtom(enteredAddressAtom), useAtomValue(loadable(resultsAtom))] as const
}
