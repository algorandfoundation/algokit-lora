import { atom, useAtomValue, useSetAtom } from 'jotai'
import { loadable } from 'jotai/utils'
import { useMemo } from 'react'
import { Buffer } from 'buffer'
import { algod } from '@/features/common/data/algo-client'

export const useProgramTeal = (base64Program: string) => {
  const [tealAtom, getTealAtom] = useMemo(() => {
    const tealAtom = atom<Promise<string> | undefined>(undefined)
    const getTealAtom = atom(null, (get, set) => {
      if (!base64Program) {
        return
      }
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
    return [tealAtom, getTealAtom] as const
  }, [base64Program])

  return [useAtomValue(loadable(tealAtom)), useSetAtom(getTealAtom)] as const
}
