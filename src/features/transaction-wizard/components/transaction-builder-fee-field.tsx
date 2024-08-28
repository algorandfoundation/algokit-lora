import { FormFieldHelper } from '@/features/forms/components/form-field-helper'
import { z } from 'zod'
import { BuildableTransactionFormField } from '../models'
import { Path, useFormContext } from 'react-hook-form'
import { useEffect } from 'react'
import SvgAlgorand from '@/features/common/components/icons/algorand'

type Props<TSchema extends z.ZodSchema> = {
  helper: FormFieldHelper<z.infer<TSchema>>
  path: Path<TSchema>
  field: BuildableTransactionFormField
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema: z.ZodEffects<any, z.infer<TSchema>, unknown>
}

export function TransactionBuilderFeeField<TSchema extends z.ZodSchema>({ helper, path, field, schema }: Props<TSchema>) {
  const { watch, clearErrors, resetField } = useFormContext<z.infer<typeof schema>>() // TODO: NC - We might be able to simplify

  const setAutomaticallyPath = `${path}.setAutomatically` as Path<z.infer<typeof schema>>
  const feeValuePath = `${path}.value` as Path<z.infer<typeof schema>>

  const setFeeAutomatically = watch(setAutomaticallyPath)

  useEffect(() => {
    clearErrors(feeValuePath)
    if (setFeeAutomatically) {
      resetField(feeValuePath)
    }
  }, [clearErrors, resetField, feeValuePath, setFeeAutomatically])

  return (
    <div className="grid">
      {helper.checkboxField({
        label: field.label,
        field: setAutomaticallyPath,
      })}
      {!setFeeAutomatically && (
        <div className="ml-6 mt-3 grid gap-4">
          {helper.numberField({
            label: (
              <span className="flex items-center gap-1.5">
                Fee
                <SvgAlgorand className="h-auto w-3" />
              </span>
            ),
            field: feeValuePath,
            placeholder: '0.001',
            helpText: 'Min 0.001 ALGO',
            decimalScale: 6,
            thousandSeparator: true,
          })}
        </div>
      )}
    </div>
  )
}
