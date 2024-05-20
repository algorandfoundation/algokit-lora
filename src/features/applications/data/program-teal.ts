import { algod } from '@/features/common/data'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import { loadable } from 'jotai/utils'
import { useMemo } from 'react'
import { Buffer } from 'buffer'

export const useProgramTeal = (base64Program: string) => {
  const [tealAtom, fetchTealAtom] = useMemo(() => {
    const tealAtom = atom<Promise<string> | undefined>(undefined)
    const fetchTealAtom = atom(null, (get, set) => {
      if (get(tealAtom)) {
        return
      }

      const program = new Uint8Array(Buffer.from(base64Program, 'base64'))
      set(
        tealAtom,
        algod
          .disassemble(program)
          .do()
          .then((result) => result.result as string)
      )
    })
    return [tealAtom, fetchTealAtom] as const
  }, [base64Program])

  return [useAtomValue(loadable(tealAtom)), useSetAtom(fetchTealAtom)] as const
}
