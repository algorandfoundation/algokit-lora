import { useAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { settingsStore } from './settings'

export type LayoutConfig = {
  isLeftSideBarExpanded: boolean
}

const layoutConfigAtom = atomWithStorage<LayoutConfig>(
  'layout-config',
  {
    isLeftSideBarExpanded: true,
  },
  undefined,
  { getOnInit: true }
)

export const useLayout = () => {
  return useAtom(layoutConfigAtom, { store: settingsStore })
}
