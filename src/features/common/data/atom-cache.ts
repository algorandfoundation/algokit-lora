import { WritableAtom, atom, type Atom, PrimitiveAtom, Setter, Getter } from 'jotai'
import { dataStore } from './data-store'

export const createTimestamp = (): number => Date.now()

export const createReadOnlyAtomAndTimestamp = <T>(value: T) => {
  return [atom(() => value), createTimestamp()] as const
}

function getOrCreateValueInCacheAtom<Key extends string | number, Args extends unknown[], Value>(
  keySelector: (...args: Args) => Key,
  cacheAtom: PrimitiveAtom<Map<Key, readonly [Value, number]>>,
  createValue: (get: Getter, set: Setter, ...args: Args) => Value
) {
  return atom(null, (get, set, params: [...args: Args, options?: Options]) => {
    const _options = params.length > 1 ? params[params.length - 1] : undefined
    const options = _options && typeof _options === 'object' && 'skipTimestampUpdate' in _options ? (_options as Options) : undefined
    const args = (options ? params.slice(0, -1) : params) as Args
    const key = keySelector(...args)
    const values = get(cacheAtom)
    if (values.has(key)) {
      const [value] = values.get(key)!
      if (!options || (options && !options.skipTimestampUpdate)) {
        set(cacheAtom, (prev) => {
          // Update the timestamp each time the atom is accessed.
          // We mutate without creating a new Map reference (which differs from what we do elsewhere).
          // This ensures jotai doesn't notify dependent atoms of the change, as it's unnecessary.
          return prev.set(key, [value, createTimestamp()])
        })
      }
      return value
    }

    const value = createValue(get, set, ...args)

    set(cacheAtom, (prev) => {
      const next = new Map(prev)
      next.set(key, [value, createTimestamp()])
      return next
    })

    return value
  })
}

/**
 * Creates cache for storing collections of read-only atoms indexeable via a key.
 * If the size of the cache is unbound, then the memory usage will grow indefinitely.
 * It's highly recommended to register some cleanup code in `state-cleanup.ts` to remove old entries.
 * @param createInitialValue A function to create the read-only atom value (child atom)
 * @param keySelector A function to select the key (used in the map) from the args
 * @param initialValues The initial value of the atom (parent atom)
 * @returns A tuple containing the values atom and a function to get the value atom for a given key
 */
export function readOnlyAtomCache<Args extends unknown[], Key extends string | number, Value>(
  createInitialValue: (get: Getter, set: Setter, ...args: Args) => Value,
  keySelector: (...args: Args) => Key,
  initialValues: Map<Key, readonly [Atom<Value | Awaited<Value>>, number]> = new Map()
) {
  // Note: The for unbound collections, this will grow indefinitely.
  // Stale data should be cleaned up in state-cleanup.ts
  const valuesAtom = atom(initialValues)

  const valueAtom = getOrCreateValueInCacheAtom(keySelector, valuesAtom, (get, set, ...args) =>
    atom(() => createInitialValue(get, set, ...args))
  )

  const getValueAtom = (...params: [...args: Args, options?: Options]) => {
    return dataStore.set(valueAtom, params)
  }

  return [valuesAtom, getValueAtom] as const
}

/**
 * Creates cache for storing collections of writable atoms indexeable via a key.
 * If the size of the cache is unbound, then the memory usage will grow indefinitely.
 * It's highly recommended to register some cleanup code in `state-cleanup.ts` to remove old entries.
 * @param createInitialValue A function to create the writable atom (child atom)
 * @param keySelector A function to select the key (used in the map) from the args
 * @param initialValues The initial value of the atom (parent atom)
 * @returns A tuple containing the writable atom and a function to get the writable atom for a given key
 */
export function writableAtomCache<Args extends unknown[], Key extends string | number, Value, TWriteArgs extends unknown[], TWriteResult>(
  createInitialValue: (get: Getter, set: Setter, ...args: Args) => WritableAtom<Value, TWriteArgs, TWriteResult>,
  keySelector: (...args: Args) => Key,
  initialValues: Map<Key, readonly [WritableAtom<Value, TWriteArgs, TWriteResult>, number]> = new Map()
) {
  // Note: The for unbound collections, this will grow indefinitely.
  // Stale data should be cleaned up in state-cleanup.ts
  const valuesAtom = atom(initialValues)

  const valueAtom = getOrCreateValueInCacheAtom(keySelector, valuesAtom, (get, set, ...args) => createInitialValue(get, set, ...args))

  const getValueAtom = (...params: [...args: Args, options?: Options]) => {
    return dataStore.set(valueAtom, params)
  }

  return [valuesAtom, getValueAtom] as const
}

type Options = {
  skipTimestampUpdate: boolean
}
