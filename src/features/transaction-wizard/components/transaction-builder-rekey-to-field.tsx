import { FormFieldHelper } from '@/features/forms/components/form-field-helper'
import { z } from 'zod'
import { commonFormData } from '../data/common'
import { ZERO_ADDRESS } from '@/features/common/constants'

export const rekeyToLabel = 'Rekey to'

export function TransactionBuilderRekeyToField() {
  const helper = new FormFieldHelper<z.infer<typeof commonFormData>>()

  return helper.addressField({
    field: 'rekeyTo',
    label: rekeyToLabel,
    helpText: 'Rekeys the sender account, so this account must sign its future transactions. Leave blank to not rekey',
    placeholder: ZERO_ADDRESS,
  })
}
