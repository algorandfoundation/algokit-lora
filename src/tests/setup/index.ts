import { cleanup } from '@/tests/testing-library'
import { afterEach, beforeEach } from 'vitest'
import '@testing-library/jest-dom'
import { selectedNetworkAtomId, storedSelectedNetworkIdAtom } from '@/features/network/data'
import { localnetId } from '@/features/network/data'
import { settingsStore } from '@/features/settings/data'

// Mock navigator.language to ensure consistent locale in tests (en-US)
Object.defineProperty(navigator, 'language', {
  get: () => 'en-US',
  configurable: true,
})

afterEach(() => {
  cleanup()
})

beforeEach(() => {
  settingsStore.set(storedSelectedNetworkIdAtom, localnetId)
  settingsStore.set(selectedNetworkAtomId)
})
