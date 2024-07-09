import { createContext } from 'react'
import type { z } from 'zod'

const FormStateContext = createContext<{
  submitting: boolean
  validator: z.ZodTypeAny | undefined
}>({
  submitting: false,
  validator: undefined,
})

export const FormStateContextProvider = FormStateContext.Provider
