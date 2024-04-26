import { ApplicationResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { atom } from 'jotai'
import { ApplicationId } from './types'

export const applicationResultsAtom = atom<Map<ApplicationId, ApplicationResult>>(new Map())
