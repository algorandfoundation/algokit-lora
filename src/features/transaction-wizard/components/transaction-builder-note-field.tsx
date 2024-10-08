import { FormFieldHelper } from '@/features/forms/components/form-field-helper'
import { z } from 'zod'
import { commonFormData } from '../data/common'

export function TransactionBuilderNoteField() {
  const helper = new FormFieldHelper<z.infer<typeof commonFormData>>()

  return helper.textField({
    field: 'note',
    label: 'Note',
    helpText: 'A note for the transaction',
  })
}
