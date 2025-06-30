import { expect } from 'vitest'
import { getAllByRole, waitFor, within } from '../testing-library'

export type TableAssertionInput = {
  container: HTMLElement
  rows: TableRowAssertion[]
  matchRowCount?: boolean
}

export type TableRowAssertion = {
  cells: string[]
}

export const tableAssertion = async ({ container, rows, matchRowCount }: TableAssertionInput) => {
  const rowGroups = await within(container).findAllByRole('rowgroup')
  expect(rowGroups.length, 'Expected thead and tbody').toBe(2)

  const tableBody = rowGroups[1]
  expect(tableBody, 'tbody not found').toBeTruthy()

  const tableRows = await waitFor(() => {
    const tableRows = getAllByRole(tableBody!, 'row')
    if (matchRowCount) {
      expect(tableRows.length).toBe(rows.length)
    } else {
      expect(tableRows.length).toBeGreaterThanOrEqual(rows.length)
    }
    return tableRows
  })

  rows.forEach((row, index) => {
    const dataRow = tableRows[index]
    row.cells.forEach((cell, index) => {
      expect(getAllByRole(dataRow, 'cell')[index].textContent).toBe(cell)
    })
  })
}
