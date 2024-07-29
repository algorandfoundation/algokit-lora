import { expect } from 'vitest'
import { getAllByRole } from '../testing-library'

export type TableAssertionInput = {
  container: HTMLElement
  rows: TableRowAssertion[]
  matchRowCount?: boolean
}

export type TableRowAssertion = {
  cells: string[]
}

export const tableAssertion = ({ container, rows, matchRowCount }: TableAssertionInput) => {
  const tableBody = container.querySelector('tbody')
  expect(tableBody, 'tbody not found').toBeTruthy()
  const tableRows = getAllByRole(tableBody!, 'row')

  if (matchRowCount) {
    expect(tableRows.length).toBe(rows.length)
  }

  rows.forEach((row, index) => {
    const dataRow = tableRows[index]
    row.cells.forEach((cell, index) => {
      expect(getAllByRole(dataRow, 'cell')[index].textContent).toBe(cell)
    })
  })
}
