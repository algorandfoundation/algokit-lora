import { buildQueries, getAllByRole, getNodeText } from '@testing-library/dom'

const queryAllByDescriptionTerm = (container: HTMLElement, name: string) => {
  const terms = getAllByRole(container, 'term').filter((term) => getNodeText(term) === name)

  const definitions = terms.flatMap((term) => (term.nextElementSibling?.tagName === 'DD' ? [term.nextElementSibling] : []))

  return definitions as HTMLElement[]
}

const [queryByDescriptionTerm, getAllByDescriptionTerm, getByDescriptionTerm, findAllByDescriptionTerm, findByDescriptionTerm] =
  buildQueries(
    queryAllByDescriptionTerm,
    (_, name) => `Found multiple descriptions from term with name of ${name}`,
    (_, name) => `Unable to find a description from term with name of ${name}`
  )

export {
  queryAllByDescriptionTerm,
  queryByDescriptionTerm,
  getAllByDescriptionTerm,
  getByDescriptionTerm,
  findAllByDescriptionTerm,
  findByDescriptionTerm,
}
