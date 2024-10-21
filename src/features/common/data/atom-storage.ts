import { createJSONStorage } from 'jotai/utils'

export const createAtomStorageWithoutSubscription = <T>() => {
  const localStorage = createJSONStorage<T>()
  localStorage.subscribe = () => () => {} //No op subscriber, so localstorage state changes will not automatically update the atom
  return localStorage
}
