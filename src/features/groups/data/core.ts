import { atom } from 'jotai'
import { GroupId, GroupResult } from './types'

export const groupsAtom = atom<Map<GroupId, GroupResult>>(new Map())
