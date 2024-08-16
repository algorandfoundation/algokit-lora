import { useCallback, useMemo, useState } from 'react'

export interface Toggle {
  state: boolean
  toggle: () => void
  on: () => void
  off: () => void
}

export const useToggle = (initialState = false): Toggle => {
  const [state, setState] = useState(initialState)
  const toggle = useCallback(() => setState((state) => !state), [])
  const on = useCallback(() => setState(true), [])
  const off = useCallback(() => setState(false), [])
  return useMemo(
    () => ({
      state,
      toggle,
      on,
      off,
    }),
    [off, on, state, toggle]
  )
}
