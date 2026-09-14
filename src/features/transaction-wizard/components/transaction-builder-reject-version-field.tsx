import { FormFieldHelper } from '@/features/forms/components/form-field-helper'
import { z } from 'zod'
import { rejectVersionFormData } from '../data/common'

export const rejectVersionLabel = 'Reject version'

export function TransactionBuilderRejectVersionField() {
  const helper = new FormFieldHelper<z.infer<typeof rejectVersionFormData>>()

  return helper.numberField({
    field: 'rejectVersion',
    label: rejectVersionLabel,
    helpText:
      'The lowest application version for which the transaction is rejected. Leave blank (or 0) to skip the version check. Only valid when calling an existing application',
  })
}
