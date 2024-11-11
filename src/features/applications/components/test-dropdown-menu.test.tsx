import { describe, expect, it } from 'vitest'
import { TestDropDownMenu } from './test-dropdown-menu'
import { executeComponentTest } from '@/tests/test-component'
import { render, waitFor, within } from '@/tests/testing-library'
import { transactionActionsLabel, transactionGroupTableLabel } from '@/features/transaction-wizard/components/labels'

describe('dropdown menu', () => {
  it('renders %i', async () => {
    return executeComponentTest(
      () => {
        return render(<TestDropDownMenu />)
      },
      async (component, user) => {
        await user.click(await component.findByRole('button', { name: 'Open' }))

        await user.click(await component.findByRole('button', { name: 'Close' }))

        const transactionGroupTable = await waitFor(() => component.getByLabelText(transactionGroupTableLabel))
        const foo = await waitFor(() => within(transactionGroupTable).getByRole('button', { name: transactionActionsLabel }))
        await user.click(foo)
        console.log('HERE')
        const menu = await component.findByRole('menu')
        await user.click(await within(menu).findByRole('menuitem', { name: 'Item 1' }))

        expect(1).toBe(1)
      }
    )
  })
})
