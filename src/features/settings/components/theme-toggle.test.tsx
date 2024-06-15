import { describe, it, expect } from 'vitest'
import { render, waitFor } from '@/tests/testing-library'
import { ThemeToggle, themeTogglelabel } from '@/features/settings/components/theme-toggle'
import { executeComponentTest } from '@/tests/test-component'

describe('when the theme is toggled to dark', () => {
  it('the theme is set to dark', async () => {
    return executeComponentTest(
      () => render(<ThemeToggle navTextClassName="" />),
      async (component, user) => {
        user.click(await component.findByRole('button', { name: themeTogglelabel }))
        user.click(await component.findByText('Dark'))

        await waitFor(() => expect(document.documentElement.classList.contains('dark')).toBe(true))
      }
    )
  })
})
