import { atom } from 'jotai'
import { GroupId, GroupResult } from './types'

export const groupResultsAtom = atom<Map<GroupId, GroupResult>>(new Map())
