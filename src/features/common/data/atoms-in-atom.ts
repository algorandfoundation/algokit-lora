import { WritableAtom, atom, type Atom } from 'jotai'
import { dataStore } from './data-store'

const defaultCreateInitialValueAtom = <T>(value: T) => atom(() => value)

const createTimestamp = () => Date.now()

export const createAtomAndTimestamp = <T>(value: T) => {
  return [defaultCreateInitialValueAtom(value), createTimestamp()] as const
}

/**
 * Creates a atoms in atom map structure for storing collections of data indexeable via a key.
 * If the size of the collection is unbound, then the memory usage will grow indefinitely.
 * It's highly recommended to register some cleanup code in `state-cleanup.ts` to remove old entries.
 * @param createInitialValue A function or WriteAtom to create the initial value of the value atom (child atom)
 * @param keySelector A function to select the key (used in the map) from the args
 * @param initialValues The initial value of the atom (parent atom)
 * @param createInitialValueAtom A function to create the value atom (child atom) from the initial value
 * @returns A tuple containing the values atom and a function to get the value atom for a given key
 */
export function atomsInAtom<Args extends unknown[], Key extends string | number, Value>(
  createInitialValue: ((...args: Args) => Value) | WritableAtom<null, Args, Value>,
  keySelector: (...args: Args) => Key,
  initialValues: Map<Key, readonly [Atom<Value | Awaited<Value>>, number]> = new Map(),
  createInitialValueAtom: (value: Value) => Atom<Value | Awaited<Value>> = defaultCreateInitialValueAtom
) {
  // Note: The for unbound collections, this will grow indefinitely.
  // stale date should be cleaned up in state-cleanup.ts
  const valuesAtom = atom(initialValues)

  const getOrCreateValueAtom = atom(null, (get, set, params: [...args: Args, options?: Options]) => {
    const _options = params.length > 1 ? params[params.length - 1] : undefined
    const options = _options && typeof _options === 'object' && 'skipTimestampUpdate' in _options ? (_options as Options) : undefined
    const args = (options ? params.slice(0, -1) : params) as Args
    const key = keySelector(...args)
    const values = get(valuesAtom)
    if (values.has(key)) {
      const [valueAtom] = values.get(key)!
      if (!options || (options && options.skipTimestampUpdate === false)) {
        set(valuesAtom, (prev) => {
          // Update the timestamp each time the atom is accessed.
          // We mutate without creating a new Map reference (like we do elsewhere).
          // This ensure jotai doesn't notify dependent atoms of the change, as it's unnecessary.
          return prev.set(key, [valueAtom, createTimestamp()])
        })
      }
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

  const getValueAtom = (...params: [...args: Args, options?: Options]) => {
    return dataStore.set(getOrCreateValueAtom, params)
  }

  return [valuesAtom, getValueAtom] as const
}

type Options = {
  skipTimestampUpdate: boolean
}
