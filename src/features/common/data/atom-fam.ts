import { atom, type Atom } from 'jotai'
import { JotaiStore } from './types'
import { invariant } from '@/utils/invariant'

// TODO: NC - Name this what we want
// TODO: NC - Do we want to pass store around or set it as a global?
export function atomFam<Param, Id extends string | number, Value>(
  idSelector: (param: Param) => Id,
  createValueAtom: (param: Param) => Atom<Value>,
  initialValuesState: Map<Id, Atom<Value>> = new Map()
) {
  const valuesAtom = atom(initialValuesState)

  const getOrCreateValueAtom = atom(null, (get, set, param: Param) => {
    const id = idSelector(param)
    const atoms = get(valuesAtom)
    if (atoms.has(id)) {
      const atom = atoms.get(id)
      invariant(atom, 'atom is undefined')
      return atom
    }

    const atom = createValueAtom(param)

    set(valuesAtom, (prev) => {
      const next = new Map(prev)
      next.set(id, atom)
      return next
    })

    return atom
  })

  const getValueAtom = (store: JotaiStore, param: Param) => {
    return store.set(getOrCreateValueAtom, param)
  }

  return [valuesAtom, getValueAtom] as const
}
