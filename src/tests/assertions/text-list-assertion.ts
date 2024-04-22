import { expect } from 'vitest'

type Input = {
  container: HTMLElement
  expectedTexts: string[]
}

export const textListAssertion = ({ container, expectedTexts }: Input) => {
  const resultTexts = [...container.querySelectorAll('div')].map((div) => div.textContent)
  expect(resultTexts).toEqual(expectedTexts)
}
