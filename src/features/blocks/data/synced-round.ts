import { atom } from 'jotai'
import { Round } from './types'

export const syncedRoundAtom = atom<Round | undefined>(undefined)
