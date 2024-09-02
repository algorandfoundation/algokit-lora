import { z } from 'zod'
import { zfd } from 'zod-form-data'

export const bigIntSchema = <TSchema extends z.ZodTypeAny>(schema: TSchema) =>
  zfd.numeric(
    z.preprocess((arg) => {
      if (arg === null || arg === '') {
        return undefined
      } else if (typeof arg === 'number') {
        return BigInt(arg)
      }
      return arg
    }, schema)
  )

export const numberSchema = <TSchema extends z.ZodTypeAny>(schema: TSchema) =>
  zfd.numeric(
    z.preprocess((arg) => {
      if (arg === null || arg === '') {
        return undefined
      }
      return arg
    }, schema)
  )
