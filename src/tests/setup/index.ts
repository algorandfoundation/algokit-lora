// Import cleanup directly from @testing-library/react so that
// the components in @/tests/testing-library are loaded after the mocks
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'
import '@testing-library/jest-dom'

afterEach(() => {
  cleanup()
})
