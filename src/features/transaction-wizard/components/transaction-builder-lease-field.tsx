import { FormFieldHelper } from '@/features/forms/components/form-field-helper'
import { z } from 'zod'
import { commonFormData } from '../data/common'

export const leaseLabel = 'Lease'

export function TransactionBuilderLeaseField() {
  const helper = new FormFieldHelper<z.infer<typeof commonFormData>>()

  return helper.textField({
    field: 'lease',
    label: leaseLabel,
    helpText:
      'A base64 encoded 32 byte lease. Once confirmed, no other transaction from the sender with the same lease can be confirmed until the last valid round has passed',
  })
}
