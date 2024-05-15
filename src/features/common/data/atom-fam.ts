import { atom, type Atom } from 'jotai'
import { JotaiStore } from './types'
import { invariant } from '@/utils/invariant'

// TODO: NC - Name this what we want
// TODO: NC - Do we want to pass store around or set it as a global?

// atomsInAtom
// mapAtom
export function atomFam<Args extends unknown[], Key extends string | number, Value>(
  keySelector: (...args: Args) => Key,
  createValueAtom: (...args: Args) => Atom<Value>,
  initialValuesState: Map<Key, Atom<Value>> = new Map()
) {
  // TODO: Size should be capped at some limit, so memory usage doesn't grow indefinitely
  const valuesAtom = atom(initialValuesState)

  const getOrCreateValueAtom = atom(null, (get, set, args: Args) => {
    const id = keySelector(...args)
    const atoms = get(valuesAtom)
    if (atoms.has(id)) {
      const atom = atoms.get(id)
      invariant(atom, 'atom is undefined')
      return atom
    }

    const atom = createValueAtom(...args)

    set(valuesAtom, (prev) => {
      const next = new Map(prev)
      next.set(id, atom)
      return next
    })

    return atom
  })

  const getValueAtom = (store: JotaiStore, ...args: Args) => {
    return store.set(getOrCreateValueAtom, args)
  }

  return [valuesAtom, getValueAtom] as const
}
