import { WritableAtom, atom, type Atom } from 'jotai'
import { invariant } from '@/utils/invariant'
import { dataStore } from './data-store'

export function atomsInAtom<Args extends unknown[], Key extends string | number, Value>(
  createInitialValue: ((...args: Args) => Value) | WritableAtom<null, Args, Value>,
  keySelector: (...args: Args) => Key,
  initialValues: Map<Key, Atom<Value | Awaited<Value>>> = new Map(),
  createInitialValueAtom: (value: Value) => Atom<Value | Awaited<Value>> = (value) => atom(() => value)
) {
  // TODO: Size should be capped at some limit, so memory usage doesn't grow indefinitely
  const valuesAtom = atom(initialValues)

  const getOrCreateValueAtom = atom(null, (get, set, args: Args) => {
    const key = keySelector(...args)
    const atoms = get(valuesAtom)
    if (atoms.has(key)) {
      const valueAtom = atoms.get(key)
      invariant(valueAtom, 'atom is undefined')
      return valueAtom
    }

    const value = 'write' in createInitialValue ? set(createInitialValue, ...args) : createInitialValue(...args)
    const valueAtom = createInitialValueAtom(value)

    set(valuesAtom, (prev) => {
      const next = new Map(prev)
      next.set(key, valueAtom)
      return next
    })

    return valueAtom
  })

  const getValueAtom = (...args: Args) => {
    return dataStore.set(getOrCreateValueAtom, args)
  }

  return [valuesAtom, getValueAtom] as const
}
