import { FormFieldHelper } from '@/features/forms/components/form-field-helper'
import { z } from 'zod'
import { useFormContext } from 'react-hook-form'
import { useEffect } from 'react'
import { commonFormData } from '../data/common'
import { useSyncedRound } from '@/features/blocks/data'

export function TransactionBuilderValidRoundField() {
  const helper = new FormFieldHelper<z.infer<typeof commonFormData>>()
  const { watch, clearErrors, setValue, getValues } = useFormContext<z.infer<typeof commonFormData>>()
  const syncedRound = useSyncedRound()

  const setAutomaticallyPath = 'validRounds.setAutomatically'
  const firstValidPath = 'validRounds.firstValid'
  const lastValidPath = 'validRounds.lastValid'

  const setAutomatically = watch(setAutomaticallyPath)

  useEffect(() => {
    if (setAutomatically) {
      setValue(firstValidPath, undefined)
      setValue(lastValidPath, undefined)
    } else {
      if (syncedRound && getValues(firstValidPath) === undefined && getValues(lastValidPath) === undefined) {
        setValue(firstValidPath, BigInt(syncedRound))
        setValue(lastValidPath, BigInt(syncedRound + 1000))
      }
    }
    clearErrors(firstValidPath)
    clearErrors(lastValidPath)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clearErrors, setValue, setAutomatically])

  return (
    <div className="grid">
      {helper.checkboxField({
        label: 'Set valid rounds automatically',
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
