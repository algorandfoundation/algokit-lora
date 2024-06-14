import { describe, it, expect, afterEach, beforeEach } from 'vitest'
import { render, waitFor } from '@/tests/testing-library'
import MatchMediaMock from '@/tests/mock-match-media'
import { executeComponentTest } from '@/tests/test-component'
import { resetSettingsStore } from '@/features/settings/data/settings'

describe('platform-provider', () => {
  describe('when using the default system light theme', () => {
    it('the theme is set to light', () => {
      return executeComponentTest(
        () => render(<div />),
        async () => {
          await waitFor(() => expect(document.documentElement.classList.contains('light')).toBe(true))
        }
      )
    })
  })

  describe('when using the default system dark theme', async () => {
    const matchMediaMock = new MatchMediaMock()

    beforeEach(() => {
      // Set system theme to dark
      matchMediaMock.useMediaQuery('(prefers-color-scheme: dark)')
      resetSettingsStore()
    })
    afterEach(() => {
      matchMediaMock.clear()
    })

    it('the theme is set to dark', () => {
      return executeComponentTest(
        () => render(<div />),
        async () => {
          await waitFor(() => expect(document.documentElement.classList.contains('dark')).toBe(true))
        }
      )
    })
  })
})
