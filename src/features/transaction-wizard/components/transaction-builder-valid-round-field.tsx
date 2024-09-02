import { FormFieldHelper } from '@/features/forms/components/form-field-helper'
import { z } from 'zod'
import { BuildableTransactionFormField } from '../models'
import { Path, useFormContext } from 'react-hook-form'
import { useEffect } from 'react'

type Props<TSchema extends z.ZodSchema> = {
  helper: FormFieldHelper<z.infer<TSchema>>
  path: Path<TSchema>
  field: BuildableTransactionFormField
}

export function TransactionBuilderValidRoundField<TSchema extends z.ZodSchema>({ helper, path, field }: Props<TSchema>) {
  const { watch, clearErrors, resetField } = useFormContext<z.infer<TSchema>>()

  const setAutomaticallyPath = `${path}.setAutomatically` as typeof path
  const firstValidPath = `${path}.firstValid` as typeof path
  const lastValidPath = `${path}.lastValid` as typeof path

  const setAutomatically = watch(setAutomaticallyPath)

  useEffect(() => {
    clearErrors(firstValidPath)
    if (setAutomatically) {
      resetField(firstValidPath)
      resetField(lastValidPath)
    }
  }, [clearErrors, resetField, setAutomatically, firstValidPath, lastValidPath])

  return (
    <div className="grid">
      {helper.checkboxField({
        label: field.label,
        field: setAutomaticallyPath,
      })}
      {!setAutomatically && (
        <div className="ml-6 mt-3 grid gap-4">
          {helper.numberField({
            label: 'First valid round',
            field: firstValidPath,
            helpText: 'The first round this transaction is valid',
            required: true,
          })}
          {helper.numberField({
            label: 'Last valid round',
            field: lastValidPath,
            helpText: 'The last round this transaction is valid',
            required: true,
          })}
        </div>
      )}
    </div>
  )
}
