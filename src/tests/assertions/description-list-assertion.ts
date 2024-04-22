import { expect } from 'vitest'
import { getByDescriptionTerm } from '../custom-queries/get-description'

export type DescriptionListAssertionInput = {
  container: HTMLElement
  items: DescriptionListAssertionItem[]
}

export type DescriptionListAssertionItem = {
  title: string
  label: string
}

export const descriptionListAssertion = ({ container, items }: DescriptionListAssertionInput) => {
  items.forEach((item) => {
    expect(getByDescriptionTerm(container, item.title).textContent).toBe(item.label)
  })
}
