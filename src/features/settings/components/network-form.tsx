import { Form, FormActions } from '@/features/forms/components/form'
import { zfd } from 'zod-form-data'
import { useCallback } from 'react'
import { SubmitButton } from '@/features/forms/components/submit-button'

const networkSchema = zfd.formData({
  name: zfd.text(),
})

export function NetworkForm() {
  const onSubmit = useCallback(async ({ name }: { name: string }) => {
    console.log(name)
    return Promise.resolve()
  }, [])
  const onSuccess = useCallback(() => {}, [])

  return (
    <Form header="Network" schema={networkSchema} onSubmit={onSubmit} onSuccess={onSuccess}>
      {(helper) => (
        <div>
          {helper.textField({
            label: 'Name',
            field: 'name',
          })}
          <FormActions>
            <SubmitButton>Save</SubmitButton>
          </FormActions>
        </div>
      )}
    </Form>
  )
}
