import { asError } from './error'

export const handleErrorInAsyncAtom = <T extends object, R>(canError: Promise<T>, handleError: (e: Error) => R) => {
  return canError.catch((e: unknown) => handleError(asError(e)))
}
