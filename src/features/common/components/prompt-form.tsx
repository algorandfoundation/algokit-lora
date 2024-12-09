import { useCallback } from 'react'
import { zfd } from 'zod-form-data'
import { z } from 'zod'
import { Form } from '@/features/forms/components/form'
import { FormActions } from '@/features/forms/components/form-actions'
import { SubmitButton } from '@/features/forms/components/submit-button'
import { CancelButton } from '@/features/forms/components/cancel-button'

type Props = {
  message: string
  type: 'text' | 'password'
  onSubmit: (value: string | null) => void
  onCancel: () => void
}

const schema = zfd.formData({
  value: zfd.text(z.string().optional()),
})

export function PromptForm({ message, type, onSubmit, onCancel }: Props) {
  const submit = useCallback(
    async (values: z.infer<typeof schema>) => {
      onSubmit(values.value ?? '')
    },
    [onSubmit]
  )

  return (
    <Form
      schema={schema}
      onSubmit={submit}
      formAction={
        <FormActions>
          <CancelButton onClick={onCancel} className="w-28" />
          <SubmitButton className="w-28">Save</SubmitButton>
        </FormActions>
      }
    >
      {(helper) =>
        type === 'text' ? helper.textField({ label: message, field: 'value' }) : helper.passwordField({ label: message, field: 'value' })
      }
    </Form>
  )
}
