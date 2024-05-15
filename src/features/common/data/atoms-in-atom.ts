import { atom, type Atom } from 'jotai'
import { JotaiStore } from './types'
import { invariant } from '@/utils/invariant'

export function atomsInAtom<Args extends unknown[], Key extends string | number, ValueAtom extends Atom<unknown>>(
  createInitialValueAtom: (...args: Args) => ValueAtom,
  keySelector: (...args: Args) => Key,
  initialValues: Map<Key, ValueAtom> = new Map()
) {
  // TODO: Size should be capped at some limit, so memory usage doesn't grow indefinitely
  const valuesAtom = atom(initialValues)

  const getOrCreateValueAtom = atom(null, (get, set, args: Args) => {
    const key = keySelector(...args)
    const atoms = get(valuesAtom)
    if (atoms.has(key)) {
      const atom = atoms.get(key)
      invariant(atom, 'atom is undefined')
      return atom
    }

    const atom = createInitialValueAtom(...args)

    set(valuesAtom, (prev) => {
      const next = new Map(prev)
      next.set(key, atom)
      return next
    })

    return atom
  })

  // TODO: When we implement network switch, it's probably a good time to decide if we should make the store a global
  const getValueAtom = (store: JotaiStore, ...args: Args) => {
    return store.set(getOrCreateValueAtom, args)
  }

  return [valuesAtom, getValueAtom] as const
}
