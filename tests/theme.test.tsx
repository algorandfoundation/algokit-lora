import { describe, it, expect, beforeAll } from 'vitest'
import { render, waitFor } from '../src/tests/testing-library'
import MatchMediaMock from '@/tests/mock-match-media'
import { afterEach } from 'node:test'
import { ThemeToggle } from '@/features/theme/components/theme-toggle'
import { executeComponentTest } from '@/tests/test-component'

describe('when using the default system light theme', () => {
  it('the theme is set to light', () => {
    return executeComponentTest(
      () => render(<ThemeToggle />),
      async () => {
        await waitFor(() => expect(document.documentElement.classList.contains('light')).toBe(true))
      }
    )
  })
})

describe('when the theme is toggled to dark', () => {
  it('the theme is set to dark', async () => {
    return executeComponentTest(
      () => render(<ThemeToggle />),
      async (component, user) => {
        user.click(await component.findByTestId('theme-toggle-menu'))
        user.click(await component.findByText('Dark'))

        await waitFor(() => expect(document.documentElement.classList.contains('dark')).toBe(true))
      }
    )
  })
})

describe('when using the default system dark theme', () => {
  const matchMediaMock = new MatchMediaMock()

  beforeAll(() => {
    // Set system theme to dark
    matchMediaMock.useMediaQuery('(prefers-color-scheme: dark)')
  })
  afterEach(() => matchMediaMock.clear())

  it('the theme is set to dark', () => {
    return executeComponentTest(
      () => render(<ThemeToggle />),
      async () => {
        await waitFor(() => expect(document.documentElement.classList.contains('dark')).toBe(true))
      }
    )
  })
})
