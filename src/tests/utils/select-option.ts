import { UserEvent } from '@testing-library/user-event'
import { getByRole, screen, waitFor, within } from '@/tests/testing-library'
import { expect } from 'vitest'

export const selectOption = async (parentComponent: HTMLElement, user: UserEvent, name: string | RegExp, value: string) => {
  const select = await waitFor(() => {
    const select = getByRole(parentComponent, 'combobox', { name: name })
    expect(select).toBeDefined()
    return select!
  })
  await user.click(select)

  const option = await waitFor(() => {
    return screen.getByRole('option', { name: value })
  })
  await user.click(option)

  await waitFor(() => {
    expect(within(select).getByText(value)).toBeInTheDocument()
  })
}
