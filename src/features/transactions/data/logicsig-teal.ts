import { atom, useAtomValue, useSetAtom } from 'jotai'
import { useMemo } from 'react'
import { loadable } from 'jotai/utils'
import { Buffer } from 'buffer'
import { algod } from '@/features/common/data'

export const useLogicsigTeal = (logic: string) => {
  const [tealAtom, fetchTealAtom] = useMemo(() => {
    const tealAtom = atom<Promise<string> | undefined>(undefined)
    const fetchTealAtom = atom(null, (get, set) => {
      if (get(tealAtom)) {
        return
      }

      const program = new Uint8Array(Buffer.from(logic, 'base64'))
      set(
        tealAtom,
        algod
          .disassemble(program)
          .do()
          .then((result) => result.result as string)
      )
    })
    return [tealAtom, fetchTealAtom] as const
  }, [logic])

  return [useAtomValue(loadable(tealAtom)), useSetAtom(fetchTealAtom)] as const
}
