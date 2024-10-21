import { FormFieldHelper } from '@/features/forms/components/form-field-helper'
import { z } from 'zod'
import { useFormContext } from 'react-hook-form'
import { useLoadableNfdResult } from '@/features/nfd/data/nfd'
import { useDebounce } from 'use-debounce'
import { NfdResult } from '@/features/nfd/data/types'
import { ZERO_ADDRESS } from '@/features/common/constants'
import { useEffect, useState } from 'react'
import { isNfd } from '@/features/nfd/data/is-nfd'
import { commonAddressFormData } from '../data/common'
import { ellipseAddress } from '@/utils/ellipse-address'

type TransactionBuilderAddressFieldProps = {
  fieldName: keyof z.infer<typeof commonAddressFormData>
  helpText: string
  label: string
}

export function TransactionBuilderAddressField({ fieldName, helpText, label }: TransactionBuilderAddressFieldProps) {
  const helper = new FormFieldHelper<z.infer<typeof commonAddressFormData>>()
  const formCtx = useFormContext<z.infer<typeof commonAddressFormData>>()
  const fieldValue = formCtx.watch(fieldName)
  const [debouncedValue] = useDebounce(fieldValue && isNfd(String(fieldValue)) ? String(fieldValue) : '', 500)
  const [loadableNfd] = useLoadableNfdResult(debouncedValue)
  const [currentNfd, setCurrentNfd] = useState<NfdResult | undefined>(undefined)

  useEffect(() => {
    if (loadableNfd.state === 'hasData' && loadableNfd.data !== null) {
      setCurrentNfd(loadableNfd.data)
    } else {
      setCurrentNfd(undefined)
    }
  }, [loadableNfd])

  return (
    <div>
      {helper.textField({
        field: fieldName,
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
