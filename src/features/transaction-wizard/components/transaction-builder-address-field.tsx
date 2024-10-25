import { FormFieldHelper } from '@/features/forms/components/form-field-helper'
import { z } from 'zod'
import { useFormContext } from 'react-hook-form'
import { useDebounce } from 'use-debounce'
import { NfdResult } from '@/features/nfd/data/types'
import { ZERO_ADDRESS } from '@/features/common/constants'
import { useEffect, useState } from 'react'
import { commonAddressFormData } from '../data/common'
import { ellipseAddress } from '@/utils/ellipse-address'
import { useLoadableForwardLookupNfdResult } from '@/features/nfd/data'
import { isAddress } from '@/utils/is-address'

type TransactionBuilderAddressFieldProps = {
  fieldName: keyof z.infer<typeof commonAddressFormData>
  helpText: string
  label: string
}

export function TransactionBuilderAddressField({ fieldName, helpText, label }: TransactionBuilderAddressFieldProps) {
  const helper = new FormFieldHelper<z.infer<typeof commonAddressFormData>>()
  const formCtx = useFormContext<z.infer<typeof commonAddressFormData>>()
  const fieldValue = formCtx.watch(`${fieldName}.value` as keyof z.infer<typeof commonAddressFormData>)
  const [debouncedValue] = useDebounce(fieldValue ? String(fieldValue) : '', 500)
  const loadableNfd = useLoadableForwardLookupNfdResult(debouncedValue)
  const [currentNfd, setCurrentNfd] = useState<NfdResult | undefined>(undefined)

  useEffect(() => {
    if (loadableNfd.state === 'hasData' && loadableNfd.data !== null) {
      formCtx.setValue(`${fieldName}.address` as keyof z.infer<typeof commonAddressFormData>, loadableNfd.data.depositAccount)
      setCurrentNfd(loadableNfd.data)
    } else if (fieldValue && isAddress(String(fieldValue))) {
      formCtx.setValue(`${fieldName}.address` as keyof z.infer<typeof commonAddressFormData>, String(fieldValue))
      setCurrentNfd(undefined)
    } else {
      formCtx.setValue(`${fieldName}.address` as keyof z.infer<typeof commonAddressFormData>, undefined)
      setCurrentNfd(undefined)
    }
  }, [fieldName, fieldValue, formCtx, loadableNfd])

  return (
    <div>
      {helper.textField({
        field: `${fieldName}.value` as keyof z.infer<typeof commonAddressFormData>,
        label: (
          <span className="flex items-center gap-1.5">
            {label} {currentNfd ? ` (${ellipseAddress(currentNfd.depositAccount)})` : ''}
          </span>
        ),
        helpText: helpText,
        placeholder: ZERO_ADDRESS,
      })}
    </div>
  )
}
