import { zfd } from 'zod-form-data'
import { Form } from '@/features/forms/components/form'
import { useFieldArray } from 'react-hook-form'
import { z } from 'zod'
import { FormFieldHelper } from '@/features/forms/components/form-field-helper'
import { SubmitButton } from '@/features/forms/components/submit-button'

const formSchema = zfd.formData({
  numbers: z.array(
    z.object({
      id: z.number(),
      value: z.number(),
    })
  ),
})

export function TestNumberArray() {
  const submit = async (data: z.infer<typeof formSchema>) => {
    console.log(data)
  }

  return (
    <Form schema={formSchema} formAction={<SubmitButton>Save</SubmitButton>} onSubmit={submit} onSuccess={() => {}}>
      {(helper) => <NumberFields helper={helper} />}
    </Form>
  )
}

function NumberFields({ helper }: { helper: FormFieldHelper<z.infer<typeof formSchema>> }) {
  const { fields, append, remove } = useFieldArray({
    name: 'numbers',
  })

  return (
    <>
      {fields.map((field, index) => (
        <div key={field.id}>
          {helper.numberField({
            label: 'Number',
            field: `numbers.${index}.value` as const,
          })}
          <button type="button" onClick={() => remove(index)}>
            Remove
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={() =>
          append({
            id: fields.length + 1,
          })
        }
      >
        Add
      </button>
    </>
  )
}
