import { FormFieldHelper } from '@/features/forms/components/form-field-helper'
import { z } from 'zod'
import { bigIntSchema } from '@/features/forms/data/common'
import { zfd } from 'zod-form-data'
import { AppSpecStandard } from '../../data/types'

export const appSpecSchema = zfd.formData(
  z
    .object({
      roundFirstValid: bigIntSchema(z.bigint().min(1n).optional()),
      roundLastValid: bigIntSchema(z.bigint().min(1n).optional()),
      file: z.instanceof(File, { message: 'Required' }).refine((file) => file.type === 'application/json', 'Only JSON files are allowed'),
    })
    .superRefine((schema, ctx) => {
      if (schema.roundFirstValid && schema.roundLastValid && schema.roundFirstValid > schema.roundLastValid) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Round first valid must be less than or equal to round last valid',
          path: ['roundFirstValid'],
        })
      }
    })
)

type FormInnerProps = {
  helper: FormFieldHelper<z.infer<typeof appSpecSchema>>
}

export const supportedStandards = [AppSpecStandard.ARC56, AppSpecStandard.ARC32, AppSpecStandard.ARC4]

export function AppSpecFormInner({ helper }: FormInnerProps) {
  return (
    <>
      {helper.textField({
        label: 'First valid round',
        field: 'roundFirstValid',
        helpText: 'The first round the app spec is valid. This is only used for decoding historical mutable app calls',
      })}
      {helper.textField({
        label: 'Last valid round',
        field: 'roundLastValid',
        helpText: 'The last round the app spec is valid. This is only used for decoding historical mutable app calls',
      })}
      {helper.fileField({
        accept: 'application/json',
        label: 'JSON app spec file',
        field: 'file',
        placeholder: `Select an ${supportedStandards.join(' or ')} JSON app spec file`,
      })}
    </>
  )
}
