import { expect } from 'vitest'
import { getByDescriptionTerm } from '../custom-queries/get-description'

export type DescriptionListAssertionInput = {
  container: HTMLElement
  items: DescriptionListAssertionItem[]
}

export type DescriptionListAssertionItem = {
  term: string
  description: string
}

export const descriptionListAssertion = ({ container, items }: DescriptionListAssertionInput) => {
  items.forEach((item) => {
    expect(getByDescriptionTerm(container, item.term).textContent).toBe(item.description)
  })
}
