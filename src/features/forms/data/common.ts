import { z } from 'zod'
import { zfd } from 'zod-form-data'

export const bigIntSchema = <TSchema extends z.ZodTypeAny>(schema: TSchema) => {
  return zfd.text(
    z.coerce
      .string()
      .optional()
      .transform((val) => (val != null ? BigInt(val) : undefined))
      .pipe(schema)
  )
}

export const numberSchema = <TSchema extends z.ZodTypeAny>(schema: TSchema) =>
  zfd.text(
    z.coerce
      .string()
      .optional()
      .transform((val) => (val != null ? Number(val) : undefined))
      .pipe(schema)
  )
