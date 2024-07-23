import type { Dispatch, SetStateAction } from 'react'
import { useCallback, useMemo, useState } from 'react'

export interface Toggle {
  state: boolean
  toggle: () => void
  on: () => void
  off: () => void
  setState: Dispatch<SetStateAction<boolean>>
}

export const useToggle = (initialState = false, options?: { async: boolean }): Toggle => {
  const [state, setState] = useState(initialState)
  const toggle = useCallback(() => maybeDoAsync(options?.async, () => setState((state) => !state)), [options?.async])
  const on = useCallback(() => maybeDoAsync(options?.async, () => setState(true)), [options?.async])
  const off = useCallback(() => maybeDoAsync(options?.async, () => setState(false)), [options?.async])
  return useMemo(
    () => ({
      state,
      toggle,
      on,
      off,
      setState,
    }),
    [off, on, state, toggle, setState]
  )
}

const maybeDoAsync = (async: boolean | undefined, action: () => void) => {
  if (async) {
    setTimeout(() => action())
  } else {
    action()
  }
}
