import Decimal from 'decimal.js'
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

// This is a little different to the others above, as zod doesn't have a decimal type
// It's not perfect, however does the job for our current use case.
export const decimalSchema = (params: Parameters<typeof z.coerce.string>[0]) =>
  zfd.text(
    z.coerce
      .string(params)
      .optional()
      .superRefine((data, ctx) => {
        if (!data) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: params?.required_error || 'Required',
          })
        }

        if (data && data.startsWith('-')) {
          ctx.addIssue({
            code: z.ZodIssueCode.too_small,
            minimum: 0,
            inclusive: true,
            type: 'number',
          })
        }
      })
      .transform((val) => (val != null ? new Decimal(val) : undefined))
  )
