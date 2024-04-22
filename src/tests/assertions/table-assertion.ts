import { expect } from 'vitest'
import { getAllByRole } from '../testing-library'

export type TableAssertionInput = {
  container: HTMLElement
  rows: TableRowAssetion[]
}

export type TableRowAssetion = {
  cells: string[]
}

export const tableAssertion = ({ container, rows }: TableAssertionInput) => {
  const tableBody = container.querySelector('tbody')
  expect(tableBody, 'tbody not found').toBeTruthy()

  rows.forEach((row, index) => {
    const dataRow = getAllByRole(tableBody!, 'row')[index]
    row.cells.forEach((cell, index) => {
      expect(getAllByRole(dataRow, 'cell')[index].textContent).toBe(cell)
    })
  })
}
