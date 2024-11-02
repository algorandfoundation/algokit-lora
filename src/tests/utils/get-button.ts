import { RenderResult, waitFor } from '@testing-library/react'
import { expect } from 'vitest'

export const getButton = async (component: RenderResult, label: string) => {
  return await waitFor(() => {
    const button = component.getByRole('button', { name: label })
    expect(button).toBeDefined()
    return button
  })
}
