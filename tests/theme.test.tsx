import { describe, it, expect, beforeAll } from 'vitest'
import { render, waitFor, screen } from '../src/tests/testing-library'
import MatchMediaMock from '@/tests/mock-match-media'
import { afterEach } from 'node:test'
import { ThemeToggle } from '@/features/theme/components/theme-toggle'
import userEvent from '@testing-library/user-event'

describe('when using the default system light theme', () => {
  beforeAll(() => {
    render(<ThemeToggle />)
  })

  it('the theme is set to light', async () => {
    await waitFor(() => expect(document.documentElement.classList.contains('light')).toBe(true))
  })

  describe('when the theme is toggled to dark', () => {
    it('the theme is set to dark', async () => {
      userEvent.click(await screen.findByTestId('theme-toggle-menu'))
      userEvent.click(await screen.findByText('Dark'))

      await waitFor(() => expect(document.documentElement.classList.contains('dark')).toBe(true))
    })
  })
})

describe('when using the default system dark theme', () => {
  const matchMediaMock = new MatchMediaMock()

  beforeAll(() => {
    // Set system theme to dark
    matchMediaMock.useMediaQuery('(prefers-color-scheme: dark)')
    render(<ThemeToggle />)
  })
  afterEach(() => matchMediaMock.clear())

  it('the theme is set to dark', async () => {
    await waitFor(() => expect(document.documentElement.classList.contains('dark')).toBe(true))
  })
})
