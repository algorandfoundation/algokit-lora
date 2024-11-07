import { createContext } from 'react'
import { z } from 'zod'

export const FormStateContext = createContext<{
  submitting: boolean
  schema: z.ZodTypeAny | undefined
}>({
  submitting: false,
  schema: undefined,
})

export const FormStateContextProvider = FormStateContext.Provider
