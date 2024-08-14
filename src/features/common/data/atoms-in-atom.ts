import { WritableAtom, atom, type Atom, PrimitiveAtom, Setter } from 'jotai'
import { dataStore } from './data-store'

export const createTimestamp = (): number => Date.now()

export const createAtomAndTimestamp = <T>(value: T) => {
  const createAtomFunc = (value: T) => atom(() => value)
  return [createAtomFunc(value), createTimestamp()] as const
}

function getOrCreateValueAtom<Key extends string | number, Args extends unknown[], Value>(
  keySelector: (...args: Args) => Key,
  mapAtom: PrimitiveAtom<Map<Key, readonly [Value, number]>>,
  createValue: (set: Setter, ...args: Args) => Value
) {
  return atom(null, (get, set, params: [...args: Args, options?: Options]) => {
    const _options = params.length > 1 ? params[params.length - 1] : undefined
    const options = _options && typeof _options === 'object' && 'skipTimestampUpdate' in _options ? (_options as Options) : undefined
    const args = (options ? params.slice(0, -1) : params) as Args
    const key = keySelector(...args)
    const values = get(mapAtom)
    if (values.has(key)) {
      const [valueAtom] = values.get(key)!
      if (!options || (options && !options.skipTimestampUpdate)) {
        set(mapAtom, (prev) => {
          // Update the timestamp each time the atom is accessed.
          // We mutate without creating a new Map reference (like we do elsewhere).
          // This ensures jotai doesn't notify dependent atoms of the change, as it's unnecessary.
          return prev.set(key, [valueAtom, createTimestamp()])
        })
      }
      return valueAtom
    }

    const valueAtom = createValue(set, ...args)

    set(mapAtom, (prev) => {
      const next = new Map(prev)
      next.set(key, [valueAtom, createTimestamp()])
      return next
    })

    return valueAtom
  })
}

/**
 * Creates a atoms in atom map structure for storing collections of data indexeable via a key.
 * If the size of the collection is unbound, then the memory usage will grow indefinitely.
 * It's highly recommended to register some cleanup code in `state-cleanup.ts` to remove old entries.
 * @param createInitialValue A function or WriteAtom to create the initial value of the value atom (child atom)
 * @param keySelector A function to select the key (used in the map) from the args
 * @param initialValues The initial value of the atom (parent atom)
 * @returns A tuple containing the values atom and a function to get the value atom for a given key
 */
export function atomsInAtom<Args extends unknown[], Key extends string | number, Value>(
  createInitialValue: ((...args: Args) => Atom<Value | Awaited<Value>>) | WritableAtom<null, Args, Value>,
  keySelector: (...args: Args) => Key,
  initialValues: Map<Key, readonly [Atom<Value | Awaited<Value>>, number]> = new Map()
) {
  // Note: The for unbound collections, this will grow indefinitely.
  // Stale data should be cleaned up in state-cleanup.ts
  const valuesAtom = atom(initialValues)

  const valueAtom = getOrCreateValueAtom(keySelector, valuesAtom, (set, ...args) =>
    'write' in createInitialValue ? atom(() => set(createInitialValue, ...args)) : createInitialValue(...args)
  )

  const getValueAtom = (...params: [...args: Args, options?: Options]) => {
    return dataStore.set(valueAtom, params)
  }

  return [valuesAtom, getValueAtom] as const
}

export function atomsInAtomV2<Args extends unknown[], Key extends string | number, Value, TWriteArgs extends unknown[], TWriteResult>(
  createInitialValue: (...args: Args) => WritableAtom<Value, TWriteArgs, TWriteResult>,
  keySelector: (...args: Args) => Key,
  initialValues: Map<Key, readonly [WritableAtom<Value, TWriteArgs, TWriteResult>, number]> = new Map()
) {
  // Note: The for unbound collections, this will grow indefinitely.
  // Stale data should be cleaned up in state-cleanup.ts
  const valuesAtom = atom(initialValues)

  const valueAtom = getOrCreateValueAtom(keySelector, valuesAtom, (_, ...args) => createInitialValue(...args))

  const getValueAtom = (...params: [...args: Args, options?: Options]) => {
    return dataStore.set(valueAtom, params)
  }

  return [valuesAtom, getValueAtom] as const
}

type Options = {
  skipTimestampUpdate: boolean
}
