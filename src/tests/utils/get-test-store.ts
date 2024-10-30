import { genesisHashAtom } from '@/features/blocks/data/genesis-hash'
import { useDataStore } from '@/features/common/data/data-store'
import { defaultNetworkConfigs, localnetId } from '@/features/network/data'
import { renderHook } from '@testing-library/react'
import { createStore } from 'jotai'

const testNetworkConfig = { id: localnetId, ...defaultNetworkConfigs[localnetId] }

export const getTestStore = () => {
  const myStore = createStore()
  myStore.set(genesisHashAtom, 'some-hash')
  renderHook(async () => {
    useDataStore(testNetworkConfig, myStore)
  })
  return myStore
}
