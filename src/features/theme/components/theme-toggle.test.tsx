import { describe, it, expect } from 'vitest'
import { render, waitFor } from '@/tests/testing-library'
import { ThemeToggle } from '@/features/theme/components/theme-toggle'
import { executeComponentTest } from '@/tests/test-component'
import { themeConstants } from '../constant'

describe('when the theme is toggled to dark', () => {
  it('the theme is set to dark', async () => {
    return executeComponentTest(
      () => render(<ThemeToggle />),
      async (component, user) => {
        user.click(await component.findByRole('button', { name: themeConstants.toggleButtonName }))
        user.click(await component.findByText('Dark'))

        await waitFor(() => expect(document.documentElement.classList.contains('dark')).toBe(true))
      }
    )
  })
})
