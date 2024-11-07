import { useCallback, useEffect } from 'react'
import { useCreateAppInterfaceStateMachine } from '../../data'
import { numberSchema } from '@/features/forms/data/common'
import { zfd } from 'zod-form-data'
import { z } from 'zod'
import { Card, CardContent } from '@/features/common/components/card'
import { Form } from '@/features/forms/components/form'
import { FormActions } from '@/features/forms/components/form-actions'
import { SubmitButton } from '@/features/forms/components/submit-button'
import { FormFieldHelper } from '@/features/forms/components/form-field-helper'
import { useFormContext, UseFormReturn } from 'react-hook-form'
import { useDebounce } from 'use-debounce'
import { ApplicationId } from '@/features/applications/data/types'
import { useLoadableApplicationSummaryAtom } from '@/features/applications/data/application-summary'
import { useLoadableAppInterfacesAtom } from '../../data'

const schema = zfd.formData({
  application: z
    .object({
      id: numberSchema(z.number({ required_error: 'Required', invalid_type_error: 'Required' })),
      exists: z.boolean().optional(),
      appInterfaceExists: z.boolean().optional(),
    })
    .superRefine((application, ctx) => {
      if (application.exists === false) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Application does not exist',
          path: ['id'],
        })
      } else if (application.appInterfaceExists === true) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Application already has an app interface',
          path: ['id'],
        })
      }
    }),
})

type FormFieldsProps = {
  helper: FormFieldHelper<z.infer<typeof schema>>
}

function FormFields({ helper }: FormFieldsProps) {
  return helper.numberField({
    field: 'application.id',
    label: 'Application ID',
  })
}

type FormInnerProps = {
  helper: FormFieldHelper<z.infer<typeof schema>>
}

function FormInner({ helper }: FormInnerProps) {
  const formCtx = useFormContext<z.infer<typeof schema>>()
  const applicationIdFieldValue = formCtx.watch('application.id') // This actually comes back as a string value, so we convert below
  const [applicationId] = useDebounce(applicationIdFieldValue ? Number(applicationIdFieldValue) : undefined, 500)

  if (applicationId) {
    return <FormFieldsWithApplicationValidation helper={helper} formCtx={formCtx} applicationId={applicationId} />
  }

  return <FormFields helper={helper} />
}

type FieldsWithAssetInfoProps = {
  helper: FormFieldHelper<z.infer<typeof schema>>
  formCtx: UseFormReturn<z.infer<typeof schema>>
  applicationId: ApplicationId
}

function FormFieldsWithApplicationValidation({ helper, formCtx, applicationId }: FieldsWithAssetInfoProps) {
  const loadableApplicationSummary = useLoadableApplicationSummaryAtom(applicationId)
  const loadableAppInterfaces = useLoadableAppInterfacesAtom()
  const { setValue, trigger } = formCtx

  useEffect(() => {
    if (loadableApplicationSummary.state !== 'loading') {
      setValue('application.exists', loadableApplicationSummary.state === 'hasData' ? true : false)
      trigger('application')
    }

    if (loadableAppInterfaces.state === 'hasData') {
      const appInterfaceExists = loadableAppInterfaces.data.some((appInterface) => appInterface.applicationId === applicationId)
      setValue('application.appInterfaceExists', appInterfaceExists)
      trigger('application')
    }
  }, [applicationId, loadableAppInterfaces, loadableApplicationSummary, setValue, trigger])

  return <FormFields helper={helper} />
}

type Props = {
  machine: ReturnType<typeof useCreateAppInterfaceStateMachine>
}

export function FromAppIdCard({ machine }: Props) {
  const [_state, send] = machine
  const fromAppIdSelected = useCallback(
    (data: z.infer<typeof schema>) => {
      send({ type: 'fromAppIdSelected', applicationId: data.application?.id })
    },
    [send]
  )

  return (
    <Card>
      <CardContent className="flex flex-col space-y-6">
        <div className="flex flex-col">
          <h2>Use Existing App</h2>
          <span>Enter a previously deployed app id to create an app interface.</span>
        </div>
        <Form
          schema={schema}
          onSubmit={fromAppIdSelected}
          formAction={
            <FormActions>
              <SubmitButton>Use existing</SubmitButton>
            </FormActions>
          }
        >
          {(helper) => <FormInner helper={helper} />}
        </Form>
      </CardContent>
    </Card>
  )
}
