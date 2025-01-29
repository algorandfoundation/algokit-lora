import { UserEvent } from '@testing-library/user-event'
import { findByRole, fireEvent, screen, waitFor, within } from '@/tests/testing-library'
import { expect } from 'vitest'

export const selectOption = async (parentComponent: HTMLElement, user: UserEvent, name: string | RegExp, value: string) => {
  const select = await findByRole(parentComponent, 'combobox', { name: name })
  await user.click(select)

  const option = await screen.findByRole('option', { name: value })
  fireEvent.click(option)

  await waitFor(() => {
    expect(within(select).getByText(value)).toBeInTheDocument()
  })

  await waitFor(() => expect(select.getAttribute('data-state')).toBe('closed'))
}
