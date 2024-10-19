import { FormFieldHelper } from '@/features/forms/components/form-field-helper'
import { z } from 'zod'
import { useFormContext } from 'react-hook-form'
import { useLoadableNfdResult } from '@/features/nfd/data/nfd'
import { useDebounce } from 'use-debounce'
import { formData } from './asset-transfer-transaction-builder'
import { NfdResult } from '@/features/nfd/data/types'
import { ZERO_ADDRESS } from '@/features/common/constants'
import { useEffect, useState } from 'react'
import { isNfd } from '@/features/nfd/data/is-nfd'

type TransactionBuilderSenderFieldProps = {
  fieldName: keyof z.infer<typeof formData>
  helpText: string
  helper: FormFieldHelper<z.infer<typeof formData>>
}

export function TransactionBuilderAddressField({ fieldName, helper, helpText }: TransactionBuilderSenderFieldProps) {
  const formCtx = useFormContext<z.infer<typeof formData>>()
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
        label: <span className="flex items-center gap-1.5">Sender {currentNfd ? ` (${currentNfd.depositAccount})` : ''}</span>,
        helpText: helpText,
        placeholder: ZERO_ADDRESS,
      })}
    </div>
  )
}
