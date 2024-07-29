import { createContext } from 'react'

const FormStateContext = createContext<{
  submitting: boolean
}>({
  submitting: false,
})

export const FormStateContextProvider = FormStateContext.Provider
