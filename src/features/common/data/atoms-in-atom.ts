import { WritableAtom, atom, type Atom } from 'jotai'
import { dataStore } from './data-store'

const defaultCreateInitialValueAtom = <T>(value: T) => atom(() => value)

const createTimestamp = () => Date.now()

export const createAtomAndTimestamp = <T>(value: T) => {
  return [defaultCreateInitialValueAtom(value), createTimestamp()] as const
}

export function atomsInAtom<Args extends unknown[], Key extends string | number, Value>(
  createInitialValue: ((...args: Args) => Value) | WritableAtom<null, Args, Value>,
  keySelector: (...args: Args) => Key,
  initialValues: Map<Key, readonly [Atom<Value | Awaited<Value>>, number]> = new Map(),
  createInitialValueAtom: (value: Value) => Atom<Value | Awaited<Value>> = defaultCreateInitialValueAtom
) {
  // TODO: Size should be capped at some limit, so memory usage doesn't grow indefinitely
  const valuesAtom = atom(initialValues)

  const getOrCreateValueAtom = atom(null, (get, set, args: Args) => {
    const key = keySelector(...args)
    const values = get(valuesAtom)
    if (values.has(key)) {
      const [valueAtom] = values.get(key)!
      set(valuesAtom, (prev) => {
        // Mutate the timestamp without creating a new Map reference (like we do elsewhere).
        // This ensure jotai doesn't notify dependent atoms of the change.
        return prev.set(key, [valueAtom, createTimestamp()])
      })
      return valueAtom
    }

    const value = 'write' in createInitialValue ? set(createInitialValue, ...args) : createInitialValue(...args)
    const valueAtom = createInitialValueAtom(value)

    set(valuesAtom, (prev) => {
      const next = new Map(prev)
      next.set(key, [valueAtom, createTimestamp()])
      return next
    })

    return valueAtom
  })

  const getValueAtom = (...args: Args) => {
    return dataStore.set(getOrCreateValueAtom, args)
  }

  return [valuesAtom, getValueAtom] as const
}
