import { useAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { settingsStore } from './settings'

export type LayoutConfig = {
  isLeftSideBarExpanded: boolean
  isDrawerMenuExpanded: boolean
}

const layoutConfigAtom = atomWithStorage<LayoutConfig>(
  'layout-config',
  {
    isDrawerMenuExpanded: false,
    isLeftSideBarExpanded: true,
  },
  undefined,
  { getOnInit: true }
)

export const useLayout = () => {
  return useAtom(layoutConfigAtom, { store: settingsStore })
}
