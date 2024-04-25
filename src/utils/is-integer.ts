const integerRegex = /^\d+$/
export const isInteger = (term: string) => term.match(integerRegex)
