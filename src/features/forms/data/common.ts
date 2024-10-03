import { z } from 'zod'
import { zfd } from 'zod-form-data'

export const bigIntSchema = <TSchema extends z.ZodTypeAny>(schema: TSchema) => {
  return zfd.text(
    z.coerce
      .string()
      .optional()
      .transform((val) => (val ? BigInt(val) : undefined))
      .pipe(schema)
  )
}

export const numberSchema = <TSchema extends z.ZodTypeAny>(schema: TSchema) =>
  zfd.text(
    z.coerce
      .string()
      .optional()
      .transform((val) => (val ? Number(val) : undefined))
      .pipe(schema)
  )
