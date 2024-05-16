import { atom } from 'jotai'
import { AccountResult, Address } from './types'
import { algod } from '@/features/common/data'
import { atomsInAtom } from '@/features/common/data/atoms-in-atom'

const createAccountResultAtom = (address: Address) =>
  atom<Promise<AccountResult> | AccountResult>(async (_get) => {
    return await algod
      .accountInformation(address)
      .do()
      .then((result) => {
        return result as AccountResult
      })
  })

export const [accountResultsAtom, getAccountResultAtom] = atomsInAtom(createAccountResultAtom, (address) => address)
