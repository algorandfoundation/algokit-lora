import { FormFieldHelper } from '@/features/forms/components/form-field-helper'
import { z } from 'zod'
import { useFormContext } from 'react-hook-form'
import { useEffect } from 'react'
import SvgAlgorand from '@/features/common/components/icons/algorand'
import { commonFormData } from '../data/common'

export function TransactionBuilderFeeField() {
  const helper = new FormFieldHelper<z.infer<typeof commonFormData>>()
  const { watch, clearErrors, setValue } = useFormContext<z.infer<typeof commonFormData>>()

  const setAutomaticallyPath = 'fee.setAutomatically'
  const feeValuePath = 'fee.value'

  const setAutomatically = watch(setAutomaticallyPath)

  useEffect(() => {
    if (setAutomatically) {
      setValue(feeValuePath, undefined)
    }
    clearErrors(feeValuePath)
  }, [clearErrors, setValue, setAutomatically])

  return (
    <div className="grid">
      {helper.checkboxField({
        label: 'Set fee automatically',
        field: setAutomaticallyPath,
      })}
      {!setAutomatically && (
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
            required: true,
          })}
        </div>
      )}
    </div>
  )
}
