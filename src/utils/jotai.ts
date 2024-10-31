import { asError } from './error'

export const handleErrorInAsyncMaybeAtom = <T extends object, R>(maybeAsync: T | Promise<T>, handleError: (e: Error) => R) => {
  return 'catch' in maybeAsync ? maybeAsync.catch((e: unknown) => handleError(asError(e))) : maybeAsync
}
